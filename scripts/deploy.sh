#!/usr/bin/env bash
set -euo pipefail

PROJECT="snack-rate-prod"
COMPOSE_FILES=(-f compose.yml -f compose.prod.yml)
ENV_FILE=".env.production"
# Only app + queue-worker are pulled per-deploy via IMAGE_TAG.
# Infra services (postgres, prometheus, etc.) are pinned to fixed images.
PULLABLE_SERVICES=(app queue-worker)

IMAGE_TAG="${IMAGE_TAG:-${1:-}}"
: "${IMAGE_TAG:?IMAGE_TAG must not be empty}"

# Only immutable sha-based tags are deployable; moving tags (staging/latest) are rejected.
case "$IMAGE_TAG" in
    sha-[0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f]*)
        IMAGE_TAG="sha-$(echo "$IMAGE_TAG" | sed 's/^sha-//' | cut -c1-7)"
        ;;
    [0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f]*)
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

LOCKFILE="/tmp/snack-rate-deploy-${PROJECT}.lock"
exec 9>"$LOCKFILE"
if ! flock -n 9; then
    echo "Error: another deploy for ${PROJECT} is already running (lock: $LOCKFILE)" >&2
    exit 1
fi

LONG_RUNNING_SERVICES=(app queue-worker tempo postgres garage alloy caddy loki node-exporter prometheus grafana)
# All long-running services share the same IMAGE_TAG — rollback sets one tag for all.

compose() {
    docker compose -p "$PROJECT" "${COMPOSE_FILES[@]}" --env-file "$ENV_FILE" "$@"
}

trap 'echo "==> Deploy failed at step: $CURRENT_STEP" >&2' ERR

if [ ! -f "$ENV_FILE" ]; then
    echo "Error: $ENV_FILE not found" >&2
    exit 1
fi
set -a; source "$ENV_FILE"; set +a

# Echoes the current image ref for a service, or empty if none is running.
# Returns non-zero only on a genuine query/inspect failure (not "no container").
get_current_image() {
    local svc=$1 container image
    local raw
    raw=$(compose ps -q "$svc") || {
        echo "Error: failed to query container for $svc" >&2
        return 1
    }
    container=$(echo "$raw" | head -1)
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

# ----- Step 1: Save current app image for rollback -----
CURRENT_STEP="save-state"
echo "==> [1/7] Saving current app image for rollback..."

if ! OLD_APP_IMAGE=$(get_current_image app); then
    echo "Error: could not determine current app image state" >&2
    exit 1
fi

FIRST_DEPLOY=0
if [ -z "$OLD_APP_IMAGE" ]; then
    echo "→ No previous app image found — first deploy (rollback unavailable)."
    FIRST_DEPLOY=1
fi

# ----- Step 2: Pull -----
CURRENT_STEP="pull"
echo "==> [2/7] Pulling latest images..."
if ! compose pull "${PULLABLE_SERVICES[@]}"; then
    echo "==> Failed to pull image tag: $IMAGE_TAG" >&2
    exit 1
fi

# ----- Step 3: Backup database -----
CURRENT_STEP="backup"
echo "==> [3/7] Backing up database before migration..."
BACKUP_DIR="/tmp/snack-rate-backup-${PROJECT}"
mkdir -p "$BACKUP_DIR"
BACKUP_FILE="${BACKUP_DIR}/pre-deploy-$(date +%Y%m%d_%H%M%S).sql.gz"
compose exec -T postgres pg_dump --no-owner --no-acl -U "${POSTGRES_USER:-snackrate}" "${POSTGRES_DB:-app_db}" | gzip -9 > "$BACKUP_FILE" || {
    echo "Warning: pre-deploy backup failed (non-fatal)" >&2
}
if [ -f "$BACKUP_FILE" ]; then
    echo "→ Database backed up to: $BACKUP_FILE"
    # Keep only last 5 backups
    ls -t "$BACKUP_DIR"/*.sql.gz 2>/dev/null | tail -n +6 | xargs -r rm --
fi

# ----- Step 4: Build db-tool image -----
CURRENT_STEP="build"
echo "==> [4/7] Building db-tool image..."
compose build db-tool

# ----- Step 5: Run migrations (blocking) -----
CURRENT_STEP="migrate"
echo "==> [5/7] Running migrations..."

for svc in db-tool; do
    echo "→ Running $svc..."
    compose run --rm "$svc"
    echo "→ $svc completed successfully (exit 0)"
done

# ----- Step 6: Deploy -----
CURRENT_STEP="deploy"
echo "==> [6/7] Deploying stack..."
echo "→ Deploying long-running services: ${LONG_RUNNING_SERVICES[*]}"
if compose up -d --remove-orphans --wait --wait-timeout 360 "${LONG_RUNNING_SERVICES[@]}"; then
    echo "==> App is healthy."
else
    echo "==> Healthcheck failed."

    if [ "$FIRST_DEPLOY" = "1" ]; then
        echo "==> No previous images to roll back to (first deploy). Aborting without rollback." >&2
        exit 1
    fi

    OLD_TAG="${OLD_APP_IMAGE##*:}"
    if [ -z "$OLD_TAG" ] || [ "$OLD_TAG" = "$OLD_APP_IMAGE" ]; then
        echo "==> Could not determine a valid previous tag from '$OLD_APP_IMAGE'. Aborting without rollback." >&2
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

# ----- Step 7: Verify -----
CURRENT_STEP="verify"
echo "==> [7/7] Successfully deployed $IMAGE_TAG"
compose images app queue-worker