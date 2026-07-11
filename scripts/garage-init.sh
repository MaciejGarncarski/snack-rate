#!/usr/bin/env bash
set -euo pipefail

ENV="${1:-dev}"

case "$ENV" in
  dev)
    PROJECT="snack-rate-dev"
    ENV_FILE=".env.development"
    COMPOSE_FILE_ARGS=(-f compose.yml -f compose.dev.yml)
    ;;
  staging)
    PROJECT="snack-rate-staging"
    ENV_FILE=".env.staging"
    COMPOSE_FILE_ARGS=(-f compose.yml -f compose.staging.yml)
    ;;
  prod|production)
    PROJECT="snack-rate-prod"
    ENV_FILE=".env.production"
    COMPOSE_FILE_ARGS=(-f compose.yml -f compose.prod.yml)
    ;;
  *)
    echo "Usage: $0 [dev|staging|prod]" >&2
    exit 1
    ;;
esac

KEY_NAME="snackrate-app-${ENV}"

if [ ! -f "$ENV_FILE" ]; then
  echo "Error: $ENV_FILE not found" >&2
  exit 1
fi

COMPOSE_CMD=(docker compose -p "$PROJECT" "${COMPOSE_FILE_ARGS[@]}" --env-file "$ENV_FILE")

read_env_var() {
  local raw
  raw="$(grep -E "^$1=" "$ENV_FILE" | tail -n1 | cut -d= -f2-)"
  raw="$(printf '%s' "$raw" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"
  case "$raw" in
    \"*\") raw="${raw#\"}"; raw="${raw%\"}" ;;
    \'*\') raw="${raw#\'}"; raw="${raw%\'}" ;;
  esac
  printf '%s' "$raw"
}

S3_ACCESS_KEY="$(read_env_var S3_ACCESS_KEY)"
S3_SECRET_KEY="$(read_env_var S3_SECRET_KEY)"
S3_BUCKET_PUBLIC="$(read_env_var S3_BUCKET_PUBLIC)"

for var_name in S3_ACCESS_KEY S3_SECRET_KEY S3_BUCKET_PUBLIC; do
  if [ -z "${!var_name}" ]; then
    echo "Error: $var_name is missing or empty in $ENV_FILE" >&2
    exit 1
  fi
done

if ! [[ "$S3_ACCESS_KEY" =~ ^[A-Za-z0-9._-]+$ ]]; then
  echo "Error: S3_ACCESS_KEY in $ENV_FILE contains invalid characters (got: '$S3_ACCESS_KEY')." >&2
  echo "  Check for stray quotes or whitespace around the value in $ENV_FILE." >&2
  exit 1
fi

if ! "${COMPOSE_CMD[@]}" exec -T garage /garage status > /dev/null 2>&1; then
  echo "Error: garage container is not running. Start the stack first." >&2
  exit 1
fi

if "${COMPOSE_CMD[@]}" exec -T garage /garage key info "$S3_ACCESS_KEY" > /dev/null 2>&1; then
  echo "Key '$S3_ACCESS_KEY' already exists, skipping import."
else
  echo "Importing key '$KEY_NAME'..."
  "${COMPOSE_CMD[@]}" exec -T garage /garage key import -n "$KEY_NAME" \
    "$S3_ACCESS_KEY" "$S3_SECRET_KEY" --yes
fi

if "${COMPOSE_CMD[@]}" exec -T garage /garage bucket info "$S3_BUCKET_PUBLIC" > /dev/null 2>&1; then
  echo "Bucket '$S3_BUCKET_PUBLIC' already exists, skipping creation."
else
  echo "Creating bucket '$S3_BUCKET_PUBLIC'..."
  "${COMPOSE_CMD[@]}" exec -T garage /garage bucket create "$S3_BUCKET_PUBLIC"
fi

# bucket allow / website --allow are idempotent, safe to rerun
echo "Setting bucket permissions..."
"${COMPOSE_CMD[@]}" exec -T garage /garage bucket allow "$S3_BUCKET_PUBLIC" \
  --key "$S3_ACCESS_KEY" --read --write --owner

echo "Enabling bucket website..."
"${COMPOSE_CMD[@]}" exec -T garage /garage bucket website --allow "$S3_BUCKET_PUBLIC"

echo "Garage buckets configured (public bucket exposed)."