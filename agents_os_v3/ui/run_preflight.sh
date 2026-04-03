#!/usr/bin/env bash
# Team 31 — HTTP preflight for AOS v3 UI (v1.2.0)
# Usage: from repo root, run: bash agents_os_v3/ui/run_preflight.sh [port]
# Optional: AOS_V3_API_BASE (e.g. http://127.0.0.1:8090) — also GET /api/health
set -euo pipefail
PORT="${1:-8778}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
python3 -m http.server "$PORT" >/tmp/aosv3-preflight.log 2>&1 &
PID=$!
sleep 1
BASE="http://127.0.0.1:${PORT}"
fail=0
for p in agents_os_v3/ui/index.html agents_os_v3/ui/history.html agents_os_v3/ui/config.html agents_os_v3/ui/teams.html agents_os_v3/ui/portfolio.html agents_os_v3/ui/flow.html; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "${BASE}/${p}")
  echo "$code  $p"
  [[ "$code" == "200" ]] || fail=1
done
API_BASE="${AOS_V3_API_BASE:-}"
if [[ -n "${API_BASE}" ]]; then
  API_BASE="${API_BASE%/}"
  hcode=$(curl -s -o /dev/null -w "%{http_code}" "${API_BASE}/api/health" || echo "000")
  echo "${hcode}  ${API_BASE}/api/health"
  [[ "${hcode}" == "200" ]] || fail=1
fi
kill "$PID" 2>/dev/null || true
exit "$fail"
