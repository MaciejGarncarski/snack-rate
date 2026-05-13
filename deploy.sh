
#!/usr/bin/env bash

# NOTE! THIS SCRIPT IS FOR FUTURE USE!

set -euo pipefail

VERSION=${1:-}
if [[ -z "$VERSION" ]]; then
  echo "Usage: ./deploy.sh v0.2.0"
  exit 1
fi

VPS_USER=${VPS_USER:-root}
VPS_HOST=${VPS_HOST:-your-vps-ip}
VPS_DIR=${VPS_DIR:-/opt/snack-rate}
IMAGE="ghcr.io/$(git remote get-url origin | sed 's/.*github.com[:/]//' | sed 's/\.git$//' | tr '[:upper:]' '[:lower:]')"

echo "→ Deploying $IMAGE:$VERSION to $VPS_HOST"

ssh "$VPS_USER@$VPS_HOST" bash <<EOF
  set -euo pipefail
  cd $VPS_DIR

  echo "→ Pulling image..."
  docker pull $IMAGE:$VERSION

  echo "→ Updating .env.production..."
  sed -i "s|^IMAGE_TAG=.*|IMAGE_TAG=$VERSION|" .env.production

  echo "→ Restarting app..."
  docker compose -f compose.yml --env-file .env.production --profile production up -d --no-deps app

  echo "→ Cleaning old images..."
  docker image prune -f

  echo "✓ Done — $VERSION is live"
EOF