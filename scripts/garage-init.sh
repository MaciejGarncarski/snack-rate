#!/bin/sh
set -eu

ENV="${1:-dev}"

case "$ENV" in
  dev)
    PROJECT="snack-rate-dev"
    ENV_FILE=".env.development"
    COMPOSE_FILES="-f compose.yml -f compose.dev.yml"
    ;;
  staging)
    PROJECT="snack-rate-staging"
    ENV_FILE=".env.staging"
    COMPOSE_FILES="-f compose.yml -f compose.staging.yml"
    ;;
  prod|production)
    PROJECT="snack-rate-prod"
    ENV_FILE=".env.production"
    COMPOSE_FILES="-f compose.yml -f compose.prod.yml"
    ;;
  *)
    echo "Usage: $0 [dev|staging|prod]" >&2
    exit 1
    ;;
esac

COMPOSE_CMD="docker compose -p $PROJECT $COMPOSE_FILES --env-file $ENV_FILE"

$COMPOSE_CMD exec -T garage /garage status > /dev/null 2>&1 || {
  echo "Error: garage container is not running. Start the stack first." >&2
  exit 1
}

eval "$(grep -E '^(S3_ACCESS_KEY|S3_SECRET_KEY|S3_BUCKET_PUBLIC)=' "$ENV_FILE")"

echo "Importing key..."
$COMPOSE_CMD exec -T garage /garage key import -n snackrate-app "$S3_ACCESS_KEY" "$S3_SECRET_KEY" --yes || true

echo "Creating bucket..."
$COMPOSE_CMD exec -T garage /garage bucket create "$S3_BUCKET_PUBLIC" || true

echo "Setting bucket permissions..."
$COMPOSE_CMD exec -T garage /garage bucket allow "$S3_BUCKET_PUBLIC" --key "$S3_ACCESS_KEY" --read --write --owner || true

echo "Enabling bucket website..."
$COMPOSE_CMD exec -T garage /garage bucket website --allow "$S3_BUCKET_PUBLIC" || true

echo "Garage buckets configured (public bucket exposed)."
