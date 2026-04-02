#!/usr/bin/env bash
# Stop AOS v3 FastAPI server (API + UI) started by scripts/start-aos-v3-server.sh — canonical port 8090
# Falls back to port-based kill if no PID file exists (handles manually-started instances).

set -euo pipefail

PORT="${AOS_V3_SERVER_PORT:-8090}"
PID_FILE="${AOS_V3_SERVER_PID_FILE:-/tmp/aos_v3_server.pid}"

_kill_by_port() {
  local pids
  pids="$(lsof -ti ":$PORT" 2>/dev/null || true)"
  if [[ -n "$pids" ]]; then
    echo "[aos-v3] Killing process(es) on port $PORT: $pids"
    echo "$pids" | xargs kill 2>/dev/null || true
    sleep 0.5
    echo "[aos-v3] Stopped (port $PORT)"
  else
    echo "[aos-v3] No process found on port $PORT — nothing to stop."
  fi
}

if [[ ! -f "$PID_FILE" ]]; then
  echo "[aos-v3] No pid file ($PID_FILE) — attempting port-based stop on :$PORT"
  _kill_by_port
  exit 0
fi

PID="$(cat "$PID_FILE" 2>/dev/null || true)"
if [[ -z "$PID" ]]; then
  rm -f "$PID_FILE"
  echo "[aos-v3] Removed empty pid file — attempting port-based stop on :$PORT"
  _kill_by_port
  exit 0
fi

if kill -0 "$PID" 2>/dev/null; then
  kill "$PID"
  rm -f "$PID_FILE"
  echo "[aos-v3] Stopped (pid $PID)"
else
  rm -f "$PID_FILE"
  echo "[aos-v3] Stale pid file removed (process $PID was not running) — attempting port-based stop on :$PORT"
  _kill_by_port
fi
