#!/usr/bin/env bash
set -euo pipefail

PROJECT="snack-rate-prod"
COMPOSE_FILES=(-f compose.yml -f compose.prod.yml)
ENV_FILE=".env.production"
PULLABLE_SERVICES=(app queue-worker)
BUILD_LOCAL_SERVICES=(db-tool backup)
ONESHOT_SERVICES=(db-tool backup)
LONG_RUNNING_SERVICES=(app queue-worker tempo postgres garage alloy caddy loki node-exporter prometheus grafana)
FORCE_BUILD="${FORCE_BUILD:-0}"   # FORCE_BUILD=1 ./deploy.sh to rebuild db-tool/backup

compose() {
    docker compose -p "$PROJECT" "${COMPOSE_FILES[@]}" --env-file "$ENV_FILE" "$@"
}

trap 'echo "==> Deploy failed at step: $CURRENT_STEP" >&2' ERR

if [ ! -f "$ENV_FILE" ]; then
    echo "Error: $ENV_FILE not found" >&2
    exit 1
fi

# Returns "tag|digest" for a service's current image, or empty if none exists.
get_image_info() {
    local svc=$1
    local image_id
    image_id=$(compose images -q "$svc" 2>/dev/null | head -n1 || true)
    if [ -n "$image_id" ]; then
        docker inspect --format='{{index .RepoTags 0}}|{{index .RepoDigests 0}}' "$image_id" 2>/dev/null || true
    fi
}

rollback() {
    local svc=$1 info=$2
    local tag="${info%%|*}"
    local digest="${info##*|}"
    if [ -n "$digest" ] && [ -n "$tag" ]; then
        echo "→ Restoring $svc to $tag ..."
        if ! docker tag "$digest" "$tag"; then
            echo "!! Failed to restore $svc — digest $digest not found locally." >&2
        fi
    else
        echo "!! No prior image info for $svc — nothing to roll back to (likely first deploy)." >&2
    fi
}

# ----- Step 1: Save current image state for rollback -----
CURRENT_STEP="save-state"
echo "==> [1/5] Saving current image state for rollback..."
OLD_APP_INFO=$(get_image_info app)
OLD_QUEUE_WORKER_INFO=$(get_image_info queue-worker)

FIRST_DEPLOY=0
if [ -z "$OLD_APP_INFO" ] && [ -z "$OLD_QUEUE_WORKER_INFO" ]; then
    echo "→ No previous images found — this looks like the first deploy. Rollback will be unavailable if this run fails."
    FIRST_DEPLOY=1
fi

# ----- Step 2: Pull -----
CURRENT_STEP="pull"
echo "==> [2/5] Pulling latest images..."
compose pull "${PULLABLE_SERVICES[@]}"

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

    echo "==> Rolling back..."
    rollback app "$OLD_APP_INFO"
    rollback queue-worker "$OLD_QUEUE_WORKER_INFO"

    echo "→ Restarting with previous images..."
    compose up -d --remove-orphans --wait --wait-timeout 360 "${LONG_RUNNING_SERVICES[@]}" || true

    echo "==> Rollback complete. Deploy aborted."
    exit 1
fi

# ----- Step 5: Cleanup -----
CURRENT_STEP="cleanup"
echo "==> [5/5] Cleaning up dangling images..."
docker image prune -f --filter "label=com.docker.compose.project=$PROJECT"

CURRENT_STEP="status"
echo "==> Current status:"
compose ps

echo "==> Done. Tail logs with: pnpm run prod:logs"