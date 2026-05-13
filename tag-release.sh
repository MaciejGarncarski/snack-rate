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

echo "→ Fetching tags..."
git fetch --tags

if git tag | grep -q "^$TAG$"; then
  echo "✖ Tag $TAG already exists"
  exit 1
fi

BRANCH=$(git rev-parse --abbrev-ref HEAD)

if [[ "$BRANCH" != "main" ]]; then
  echo "✖ Releases must be tagged from main"
  exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "✖ Working tree is not clean"
  exit 1
fi

echo "→ Tagging $TAG..."
git tag -a "$TAG" -m "Release $TAG"

echo "→ Pushing tag..."
git push origin "$TAG"

echo "✓ $TAG tagged and pushed — build workflow starting"