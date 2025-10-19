#!/usr/bin/env bash
set -euo pipefail

echo "Node: $(node -v || true)"
echo "NPM:  $(npm -v || true)"

# Install deps (prefer lockfile)
if [ -f package-lock.json ]; then
  npm ci || npm install
else
  npm install
fi

# Optional early typecheck/build (comment out if it fails)
# npm run build || true

