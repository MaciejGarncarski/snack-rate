#!/usr/bin/env bash
set -euo pipefail

PROJECT="snack-rate-prod"
COMPOSE_FILES=(-f compose.yml -f compose.prod.yml)
ENV_FILE=".env.production"

compose() {
    docker compose -p "$PROJECT" "${COMPOSE_FILES[@]}" --env-file "$ENV_FILE" "$@"
}

trap 'echo "==> Deploy failed at step: $CURRENT_STEP" >&2' ERR

if [ ! -f "$ENV_FILE" ]; then
    echo "Error: $ENV_FILE not found" >&2
    exit 1
fi

CURRENT_STEP="pull"
echo "==> [1/4] Pulling latest images..."
compose pull

CURRENT_STEP="build"
echo "==> [2/4] Building any local images (if applicable)..."
compose build --pull

CURRENT_STEP="up"
echo "==> [3/4] Recreating containers with new images..."
compose up -d --remove-orphans --wait --wait-timeout 60

CURRENT_STEP="cleanup"
echo "==> [4/4] Cleaning up dangling images for this project..."
docker image prune -f --filter "label=com.docker.compose.project=$PROJECT"

CURRENT_STEP="status"
echo "==> Current status:"
compose ps

echo "==> Done. Tail logs with: pnpm run prod:logs"