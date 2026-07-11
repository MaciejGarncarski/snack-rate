#!/usr/bin/env bash
set -euo pipefail

ENV="${1:-prod}"
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
    echo "Usage: $0 [prod|staging]" >&2
    exit 1
    ;;
esac

CRON_LINE="0 3 * * * cd $PROJECT_DIR && docker compose -p $PROJECT $COMPOSE_ARGS --env-file $ENV_FILE run --rm backup >> /var/log/backup.log 2>&1"

if crontab -l 2>/dev/null | grep -q "backup"; then
  echo "Backup cron job already exists. Updating..."
  (crontab -l 2>/dev/null | grep -v "backup" || true; echo "$CRON_LINE") | crontab -
else
  echo "Installing backup cron job..."
  (crontab -l 2>/dev/null || true; echo "$CRON_LINE") | crontab -
fi

echo "Cron installed for ${ENV} — runs daily at 3 AM"
echo "Logs: /var/log/backup.log"
echo ""
echo "Run manually:"
echo "  docker compose -p $PROJECT $COMPOSE_ARGS --env-file $ENV_FILE run --rm backup"
