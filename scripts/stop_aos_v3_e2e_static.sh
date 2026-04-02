#!/usr/bin/env bash
# Stop the optional legacy static HTTP server (8778) started when AOS_V3_E2E_SEPARATE_STATIC=1 with run_aos_v3_e2e_stack.sh

set -euo pipefail

STATIC_PID_FILE="${AOS_V3_E2E_STATIC_PID_FILE:-/tmp/aos_v3_e2e_static.pid}"

if [[ ! -f "$STATIC_PID_FILE" ]]; then
  echo "[e2e-static] No pid file — nothing to stop."
  exit 0
fi

PID="$(cat "$STATIC_PID_FILE" 2>/dev/null || true)"
if [[ -z "$PID" ]]; then
  rm -f "$STATIC_PID_FILE"
  exit 0
fi

if kill -0 "$PID" 2>/dev/null; then
  kill "$PID"
  echo "[e2e-static] Stopped pid $PID"
else
  echo "[e2e-static] Stale pid file removed (process $PID not running)"
fi
rm -f "$STATIC_PID_FILE"
