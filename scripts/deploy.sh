#!/usr/bin/env bash
set -euo pipefail

PROJECT="snack-rate-prod"
COMPOSE_FILES=(-f compose.yml -f compose.prod.yml)
ENV_FILE=".env.production"
PULLABLE_SERVICES=(app queue-worker)

IMAGE_TAG="${IMAGE_TAG:-${1:-staging}}"
: "${IMAGE_TAG:?IMAGE_TAG must not be empty}"
export IMAGE_TAG
echo "==> Deploying with image tag: $IMAGE_TAG"
BUILD_LOCAL_SERVICES=(db-tool backup)
ONESHOT_SERVICES=(db-tool backup)
LONG_RUNNING_SERVICES=(app queue-worker tempo postgres garage alloy caddy loki node-exporter prometheus grafana)
FORCE_BUILD="${FORCE_BUILD:-0}"

compose() {
    docker compose -p "$PROJECT" "${COMPOSE_FILES[@]}" --env-file "$ENV_FILE" "$@"
}

trap 'echo "==> Deploy failed at step: $CURRENT_STEP" >&2' ERR

if [ ! -f "$ENV_FILE" ]; then
    echo "Error: $ENV_FILE not found" >&2
    exit 1
fi

get_current_image() {
    local svc=$1 container image
    container=$(compose ps -q "$svc") || return 1
    [ -n "$container" ] || return 1
    image=$(docker inspect --format='{{.Config.Image}}' "$container") || return 1
    case "$image" in
        *@*)
            echo "Error: $svc is running a digest image, cannot roll back by tag" >&2
            return 1
            ;;
    esac
    echo "$image"
}

# ----- Step 1: Save current image for rollback -----
CURRENT_STEP="save-state"
echo "==> [1/5] Saving current image for rollback..."
OLD_IMAGE=$(get_current_image app || true)

FIRST_DEPLOY=0
if [ -z "$OLD_IMAGE" ]; then
    echo "→ No previous image found — this looks like the first deploy. Rollback will be unavailable if this run fails."
    FIRST_DEPLOY=1
fi

# ----- Step 2: Pull -----
CURRENT_STEP="pull"
echo "==> [2/5] Pulling latest images..."
if ! compose pull "${PULLABLE_SERVICES[@]}"; then
    echo "==> Failed to pull image tag: $IMAGE_TAG" >&2
    exit 1
fi

# ----- Step 3: Build locally-built images (only if missing, or forced) -----
CURRENT_STEP="build"
echo "==> [3/5] Checking locally-built images..."

to_build=()
for svc in "${BUILD_LOCAL_SERVICES[@]}"; do
    if [ "$FORCE_BUILD" = "1" ] || [ -z "$(compose images -q "$svc" 2>/dev/null)" ]; then
        to_build+=("$svc")
    fi
done

if [ "${#to_build[@]}" -gt 0 ]; then
    echo "→ Building: ${to_build[*]}"
    compose build "${to_build[@]}"
else
    echo "→ Skipping build, images already present (use FORCE_BUILD=1 to override)"
fi

# ----- Step 4: Deploy -----
CURRENT_STEP="deploy"
echo "==> [4/5] Deploying stack..."

# One-shot job containers (db-tool, backup) are expected to run and exit(0).
# They must NOT be included in the --wait call, since --wait only succeeds
# for containers that reach running/healthy — an exit(0) job container will
# make the whole --wait call report failure even though nothing is wrong.
echo "→ Starting one-shot services: ${ONESHOT_SERVICES[*]}"
compose up -d --remove-orphans "${ONESHOT_SERVICES[@]}"

echo "→ Deploying long-running services: ${LONG_RUNNING_SERVICES[*]}"
if compose up -d --remove-orphans --wait --wait-timeout 360 "${LONG_RUNNING_SERVICES[@]}"; then
    echo "==> App is healthy."
else
    echo "==> Healthcheck failed."

    if [ "$FIRST_DEPLOY" = "1" ]; then
        echo "==> No previous images to roll back to (first deploy). Aborting without rollback." >&2
        exit 1
    fi

    OLD_TAG="${OLD_IMAGE##*:}"
    echo "==> Previous version: $OLD_TAG"
    echo "==> Requested version: $IMAGE_TAG"
    echo "==> Rolling back to $OLD_TAG ..."
    IMAGE_TAG="$OLD_TAG"
    export IMAGE_TAG
    if compose up -d --remove-orphans --wait --wait-timeout 360 "${LONG_RUNNING_SERVICES[@]}"; then
        echo "==> Rollback successful."
    else
        echo "==> Rollback FAILED. Manual intervention required." >&2
    fi
    exit 1
fi

# ----- Step 5: Verify -----
CURRENT_STEP="verify"
echo "==> [5/5] Successfully deployed $IMAGE_TAG"
compose images app queue-worker
