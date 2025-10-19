#!/usr/bin/env bash
set -euo pipefail

export HOST=0.0.0.0
export PORT="${PORT:-3000}"

# Next.js 13/14: pass host/port flags through
npm run dev -- --hostname "$HOST" --port "$PORT"
