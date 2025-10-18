#!/usr/bin/env bash
set -e

# Pin Node (recommended). Add .nvmrc to repo with: 20
if command -v nvm >/dev/null 2>&1; then
  nvm install
  nvm use
fi

# Install deps with npm
npm ci || npm install

# Optional: build to catch type errors early
# npm run build || true
