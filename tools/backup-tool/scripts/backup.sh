#!/usr/bin/env bash
set -euo pipefail

ENV="${NODE_ENV:-production}"
BACKUP_BASE="${BACKUP_DIR:-/backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_BACKUP_DIR="${BACKUP_BASE}/${ENV}/db"
GARAGE_BACKUP_DIR="${BACKUP_BASE}/${ENV}/garage"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-7}"

echo "==> Starting backup for environment: ${ENV}"
echo "    Timestamp: ${TIMESTAMP}"
echo "    Retention: ${RETENTION_DAYS} days"

echo "==> [1/3] Backing up PostgreSQL..."
mkdir -p "${DB_BACKUP_DIR}"
pg_dump --no-owner --no-acl "$DATABASE_URL" \
  | gzip -9 > "${DB_BACKUP_DIR}/${TIMESTAMP}.sql.gz"

# Verify archive integrity
if ! gzip -t "${DB_BACKUP_DIR}/${TIMESTAMP}.sql.gz"; then
  echo "Error: backup archive is corrupted, removing" >&2
  rm -f "${DB_BACKUP_DIR}/${TIMESTAMP}.sql.gz"
  exit 1
fi

echo "    Saved: ${DB_BACKUP_DIR}/${TIMESTAMP}.sql.gz"

echo "==> [2/3] Syncing Garage bucket..."
mkdir -p "${GARAGE_BACKUP_DIR}"
rclone sync \
  --s3-provider Other \
  --s3-access-key-id "$S3_ACCESS_KEY" \
  --s3-secret-access-key "$S3_SECRET_KEY" \
  --s3-region "$S3_REGION" \
  --s3-endpoint "$S3_ENDPOINT_INTERNAL" \
  --s3-force-path-style \
  :s3:"${S3_BUCKET_PUBLIC}" \
  "${GARAGE_BACKUP_DIR}"
echo "    Synced to: ${GARAGE_BACKUP_DIR}/"

echo "==> [3/3] Cleaning up DB dumps older than ${RETENTION_DAYS} days..."
removed=$(find "${DB_BACKUP_DIR}" -name "*.sql.gz" -type f -mtime +"${RETENTION_DAYS}" -print -delete | wc -l)
echo "    Removed ${removed} old dump(s)"

echo "==> Backup complete"
