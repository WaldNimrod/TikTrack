#!/usr/bin/env bash
# AOS v3 — prepare stack for browser E2E (Selenium). Canonical: API + UI on port 8090 (same origin).
#
# Default: only ensures v3 FastAPI is up; UI is served at http://127.0.0.1:8090/ and /v3/* (no second server).
# Legacy: set AOS_V3_E2E_SEPARATE_STATIC=1 to also start python http.server on AOS_V3_E2E_STATIC_PORT (8778).
#
# Usage (repo root):
#   bash scripts/run_aos_v3_e2e_stack.sh
#
# Env:
#   AOS_V3_API_BASE              default http://127.0.0.1:8090
#   AOS_V3_E2E_PREPARE_DB=1      run scripts/init_aos_v3_database.sh first
#   AOS_V3_E2E_SEPARATE_STATIC=1 optional second static server on 8778 (old workflow)
#   AOS_V3_E2E_STATIC_PORT       default 8778 (only if SEPARATE_STATIC=1)
#
# Stop legacy static only:
#   bash scripts/stop_aos_v3_e2e_static.sh

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

API_BASE="${AOS_V3_API_BASE:-http://127.0.0.1:8090}"
API_BASE="${API_BASE%/}"
STATIC_PORT="${AOS_V3_E2E_STATIC_PORT:-8778}"
STATIC_PID_FILE="${AOS_V3_E2E_STATIC_PID_FILE:-/tmp/aos_v3_e2e_static.pid}"

if [[ "${AOS_V3_E2E_PREPARE_DB:-}" == "1" ]]; then
  echo "[e2e-stack] Running DB init (001 + seed) ..."
  bash "$ROOT/scripts/init_aos_v3_database.sh"
fi

if ! curl -sf "${API_BASE}/api/health" >/dev/null 2>&1; then
  echo "[e2e-stack] API not healthy at ${API_BASE} — starting AOS v3 server ..."
  bash "$ROOT/scripts/start-aos-v3-server.sh"
  sleep 2
fi

if ! curl -sf "${API_BASE}/api/health" >/dev/null 2>&1; then
  echo "[e2e-stack] ERROR: API still not reachable at ${API_BASE}/api/health" >&2
  exit 1
fi

if ! curl -sf -o /dev/null "${API_BASE}/v3/index.html"; then
  echo "[e2e-stack] ERROR: v3 UI not served at ${API_BASE}/v3/index.html" >&2
  exit 1
fi

if ! curl -sf -o /dev/null "${API_BASE}/"; then
  echo "[e2e-stack] ERROR: root Pipeline UI not served at ${API_BASE}/" >&2
  exit 1
fi

UI_PRIMARY="${API_BASE}/v3/index.html"
echo "[e2e-stack] Integrated UI (canonical): ${API_BASE}/  and  ${UI_PRIMARY}"

if [[ "${AOS_V3_E2E_SEPARATE_STATIC:-}" == "1" ]]; then
  if [[ -f "$STATIC_PID_FILE" ]] && kill -0 "$(cat "$STATIC_PID_FILE")" 2>/dev/null; then
    echo "[e2e-stack] Legacy static HTTP already running (pid $(cat "$STATIC_PID_FILE")) on port ${STATIC_PORT}"
  else
    cd "$ROOT"
    python3 -m http.server "$STATIC_PORT" --bind 127.0.0.1 >>/tmp/aos_v3_e2e_http.log 2>&1 &
    echo $! >"$STATIC_PID_FILE"
    sleep 1
    echo "[e2e-stack] Legacy static HTTP started (pid $(cat "$STATIC_PID_FILE")), log: /tmp/aos_v3_e2e_http.log"
  fi
  UI_LEGACY="http://127.0.0.1:${STATIC_PORT}/agents_os_v3/ui/index.html"
  if ! curl -sf -o /dev/null "$UI_LEGACY"; then
    echo "[e2e-stack] ERROR: legacy static UI not served at $UI_LEGACY" >&2
    exit 1
  fi
  echo "[e2e-stack] Legacy UI (8778): $UI_LEGACY  — set AOS_V3_E2E_BASE_URL if pytest should use this"
else
  echo "[e2e-stack] No separate static server (use integrated 8090; pytest default AOS_V3_E2E_BASE_URL matches)"
fi

echo ""
echo "[e2e-stack] OK — ready for browser E2E (AOS v3 on ${API_BASE})"
echo "  Health: ${API_BASE}/api/health"
echo "  UI:     ${API_BASE}/  (Pipeline)  |  ${UI_PRIMARY}"
echo ""
echo "  Install (once): pip install -r agents_os_v3/requirements-e2e.txt"
echo "  Run tests:      AOS_V3_E2E_RUN=1 python3 -m pytest agents_os_v3/tests/e2e/ -v"
echo "  Legacy static:  AOS_V3_E2E_SEPARATE_STATIC=1 $0  ; stop: bash scripts/stop_aos_v3_e2e_static.sh"
echo ""
