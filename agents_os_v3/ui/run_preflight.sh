#!/usr/bin/env bash
# Team 31 — HTTP preflight for AOS v3 UI mockups (v1.1.0)
# Usage: from repo root, run: bash agents_os_v3/ui/run_preflight.sh [port]
set -euo pipefail
PORT="${1:-8778}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
python3 -m http.server "$PORT" >/tmp/aosv3-preflight.log 2>&1 &
PID=$!
sleep 1
BASE="http://127.0.0.1:${PORT}"
fail=0
for p in agents_os_v3/ui/index.html agents_os_v3/ui/history.html agents_os_v3/ui/config.html agents_os_v3/ui/teams.html agents_os_v3/ui/portfolio.html; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "${BASE}/${p}")
  echo "$code  $p"
  [[ "$code" == "200" ]] || fail=1
done
kill "$PID" 2>/dev/null || true
exit "$fail"
