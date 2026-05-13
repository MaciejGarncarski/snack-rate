#!/usr/bin/env bash
set -euo pipefail

VERSION=${1:-}
if [[ -z "$VERSION" ]]; then
  echo "Usage: ./tag-release.sh 0.2.0"
  exit 1
fi

if [[ ! "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "✖ Invalid version format. Use X.Y.Z (e.g. 0.2.0)"
  exit 1
fi

TAG="v$VERSION"

if git tag | grep -q "^$TAG$"; then
  echo "✖ Tag $TAG already exists"
  exit 1
fi

echo "→ Tagging $TAG..."
git tag "$TAG"

echo "→ Pushing tag..."
git push origin "$TAG"

echo "✓ $TAG tagged and pushed — build workflow starting"