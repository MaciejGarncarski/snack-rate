#!/usr/bin/env bash
set -euo pipefail

ACTION="${1:-install}"
ENV="${2:-prod}"

# backward-compatible: "install-backup-cron.sh prod" sets ENV=prod, ACTION defaults to install
if [ "$ACTION" != "install" ] && [ "$ACTION" != "update" ] && [ "$ACTION" != "remove" ] && [ "$ACTION" != "uninstall" ]; then
  ENV="$ACTION"
  ACTION="install"
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

case "$ENV" in
  prod)
    PROJECT="snack-rate-prod"
    COMPOSE_ARGS="-f compose.yml -f compose.prod.yml"
    ENV_FILE=".env.production"
    ;;
  staging)
    PROJECT="snack-rate-staging"
    COMPOSE_ARGS="-f compose.yml -f compose.staging.yml"
    ENV_FILE=".env.staging"
    ;;
  *)
    echo "Usage: $0 [install|remove] [prod|staging]" >&2
    exit 1
    ;;
esac

case "$ACTION" in
  install)
    ACTION_LABEL="install"
    ;;
  update)
    ACTION_LABEL="update"
    ;;
  remove|uninstall)
    marker="# snack-rate-backup-${ENV}"
    if crontab -l 2>/dev/null | grep -qF "$marker"; then
      (crontab -l 2>/dev/null | grep -vF "$marker" || true) | crontab -
      echo "Removed backup cron for ${ENV}."
    else
      echo "No backup cron found for ${ENV}."
    fi
    exit 0
    ;;
  *)
    echo "Usage: $0 [install|remove] [prod|staging]" >&2
    exit 1
    ;;
esac

if [ "$(id -u)" -ne 0 ]; then
  echo "Error: this script must be run as root (writes system crontab and /var/log)" >&2
  exit 1
fi

for cmd in docker flock crontab; do
  if ! command -v "$cmd" &>/dev/null; then
    echo "Error: required command not found: $cmd" >&2
    exit 1
  fi
done

if [ ! -d "$PROJECT_DIR" ]; then
  echo "Error: project directory not found: $PROJECT_DIR" >&2
  exit 1
fi

if [ ! -f "$PROJECT_DIR/$ENV_FILE" ]; then
  echo "Error: env file not found: $PROJECT_DIR/$ENV_FILE" >&2
  exit 1
fi

mkdir -p /var/log

LOG_FILE="/var/log/snack-rate-backup-${ENV}.log"
MARKER="# snack-rate-backup-${ENV}"
LOCK_FILE="/tmp/snack-rate-backup-${ENV}.lock"

# flock prevents overlapping runs; docker compose run auto-builds if needed
CRON_CMD="cd '$PROJECT_DIR' && flock -n '$LOCK_FILE' docker compose -p '$PROJECT' $COMPOSE_ARGS --env-file '$ENV_FILE' run --rm backup >> '$LOG_FILE' 2>&1"
CRON_LINE="0 3 * * * $CRON_CMD $MARKER"

if crontab -l 2>/dev/null | grep -qF "$MARKER"; then
  echo "Backup cron already exists for ${ENV}. Updating..."
  (crontab -l 2>/dev/null | grep -vF "$MARKER" || true; echo "$CRON_LINE") | crontab -
elif [ "$ACTION_LABEL" = "update" ]; then
  echo "No existing backup cron found for ${ENV} to update. Installing instead..."
  (crontab -l 2>/dev/null || true; echo "$CRON_LINE") | crontab -
else
  echo "Installing backup cron for ${ENV}..."
  (crontab -l 2>/dev/null || true; echo "$CRON_LINE") | crontab -
fi

echo "Cron installed — runs daily at 3 AM"
echo "Log: $LOG_FILE"
echo "Lock: $LOCK_FILE (flock prevents overlapping runs)"
echo ""
echo "To trigger a backup right now (same as what the cron runs):"
echo "  docker compose -p $PROJECT $COMPOSE_ARGS --env-file $ENV_FILE run --rm backup"
