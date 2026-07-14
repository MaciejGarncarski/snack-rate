#!/usr/bin/env bash
set -euo pipefail

PROJECT="snack-rate-prod"
COMPOSE_FILES=(-f compose.yml -f compose.prod.yml)
ENV_FILE=".env.production"
PULLABLE_SERVICES=(app queue-worker)

IMAGE_TAG="${IMAGE_TAG:-${1:-}}"
: "${IMAGE_TAG:?IMAGE_TAG must not be empty}"

# Only immutable sha-based tags are deployable; moving tags (staging/latest) are rejected.
case "$IMAGE_TAG" in
    sha-[0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f]*)
        IMAGE_TAG="sha-$(echo "$IMAGE_TAG" | sed 's/^sha-//' | cut -c1-7)"
        ;;
    [0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f]*)
        IMAGE_TAG="sha-$(echo "$IMAGE_TAG" | cut -c1-7)"
        ;;
    *)
        echo "Error: IMAGE_TAG must be an immutable sha-based tag (e.g. sha-a83f91c)." >&2
        echo "       Got: '$IMAGE_TAG'. Moving tags (staging/latest) are not deployable directly." >&2
        exit 1
        ;;
esac

export IMAGE_TAG
echo "==> Deploying with image tag: $IMAGE_TAG"

BUILD_LOCAL_SERVICES=(db-tool backup)
MIGRATION_SERVICES=(db-tool)          # blocking: non-zero exit aborts deploy
ONESHOT_NONBLOCKING_SERVICES=(backup) # non-blocking
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

# Echoes the current image ref for a service, or empty if none is running.
# Returns non-zero only on a genuine query/inspect failure (not "no container").
get_current_image() {
    local svc=$1 container image
    container=$(compose ps -q "$svc") || {
        echo "Error: failed to query container for $svc" >&2
        return 1
    }
    if [ -z "$container" ]; then
        return 0
    fi
    image=$(docker inspect --format='{{.Config.Image}}' "$container") || {
        echo "Error: failed to inspect container for $svc" >&2
        return 1
    }
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
echo "==> [1/6] Saving current image for rollback..."
OLD_IMAGE=$(get_current_image app)

FIRST_DEPLOY=0
if [ -z "$OLD_IMAGE" ]; then
    echo "→ No previous image found — this looks like the first deploy. Rollback will be unavailable if this run fails."
    FIRST_DEPLOY=1
fi

# ----- Step 2: Pull -----
CURRENT_STEP="pull"
echo "==> [2/6] Pulling latest images..."
if ! compose pull "${PULLABLE_SERVICES[@]}"; then
    echo "==> Failed to pull image tag: $IMAGE_TAG" >&2
    exit 1
fi

# ----- Step 3: Build locally-built images (only if missing, or forced) -----
CURRENT_STEP="build"
echo "==> [3/6] Checking locally-built images..."

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

# ----- Step 4: Run migrations (blocking) -----
CURRENT_STEP="migrate"
echo "==> [4/6] Running migrations: ${MIGRATION_SERVICES[*]}"

# compose up returns as soon as containers start, not when they exit,
# so we check migration exit codes explicitly via docker wait below.
migration_failed=0
for svc in "${MIGRATION_SERVICES[@]}"; do
    echo "→ Running $svc..."
    if compose up -d --remove-orphans --force-recreate "$svc"; then
        cid=$(compose ps -aq "$svc")
        if [ -z "$cid" ]; then
            echo "==> Could not locate container for migration '$svc' after start" >&2
            migration_failed=1
            continue
        fi
        exit_code=$(docker wait "$cid")
        if [ "$exit_code" != "0" ]; then
            echo "==> Migration '$svc' failed with exit code $exit_code" >&2
            migration_failed=1
        else
            echo "→ $svc completed successfully (exit 0)"
        fi
    else
        echo "==> Migration '$svc' failed to start" >&2
        migration_failed=1
    fi
done

if [ "$migration_failed" = "1" ]; then
    echo "==> Aborting deploy: migration(s) failed. No services were updated." >&2
    exit 1
fi

# ----- Step 5: Deploy -----
CURRENT_STEP="deploy"
echo "==> [5/6] Deploying stack..."

echo "→ Starting non-blocking one-shot services: ${ONESHOT_NONBLOCKING_SERVICES[*]}"
compose up -d --remove-orphans --force-recreate "${ONESHOT_NONBLOCKING_SERVICES[@]}"

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
    if [ -z "$OLD_TAG" ] || [ "$OLD_TAG" = "$OLD_IMAGE" ]; then
        echo "==> Could not determine a valid previous tag from '$OLD_IMAGE'. Aborting without rollback." >&2
        exit 1
    fi

    echo "==> Previous version: $OLD_TAG"
    echo "==> Requested version: $IMAGE_TAG"
    echo "==> Rolling back to $OLD_TAG (migrations are expand/migrate/contract, so this is safe)..."
    IMAGE_TAG="$OLD_TAG"
    export IMAGE_TAG
    if compose up -d --remove-orphans --wait --wait-timeout 360 "${LONG_RUNNING_SERVICES[@]}"; then
        echo "==> Rollback successful."
        exit 1   # deploy still failed overall — this exit code means "failed, but recovered"
    else
        echo "==> Rollback FAILED. Manual intervention required." >&2
        exit 2   # distinct code: failed AND rollback failed — page someone
    fi
fi

# ----- Step 6: Verify -----
CURRENT_STEP="verify"
echo "==> [6/6] Successfully deployed $IMAGE_TAG"
compose images app queue-worker