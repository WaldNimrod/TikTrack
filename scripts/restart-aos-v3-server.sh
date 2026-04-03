#!/usr/bin/env bash
# Restart AOS v3 server — API + UI on :8090 (stop then start). Pass-through: --foreground / -f

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
bash "$ROOT/scripts/stop-aos-v3-server.sh" || true
exec bash "$ROOT/scripts/start-aos-v3-server.sh" "$@"
