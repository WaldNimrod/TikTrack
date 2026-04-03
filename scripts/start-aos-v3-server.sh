#!/usr/bin/env bash
# AOS v3 — FastAPI management API + v3 UI (Team 61). Default port 8090 (BUILD track — canonical).
#
# v2 pipeline UI uses port 8092 (agents_os/scripts/start_ui_server.sh). If 8090 is busy, stop
# the other process or set AOS_V3_SERVER_PORT for a non-canonical local override.
#
# Usage (repo root):
#   bash scripts/start-aos-v3-server.sh              # background + PID file
#   bash scripts/start-aos-v3-server.sh --foreground # blocking (Ctrl+C to stop)
#
# Env: AOS_V3_SERVER_PORT, AOS_V3_VENV, PYTHONPATH implied from repo root.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

PID_FILE="${AOS_V3_SERVER_PID_FILE:-/tmp/aos_v3_server.pid}"
PORT="${AOS_V3_SERVER_PORT:-8090}"
FOREGROUND=0
if [[ "${1:-}" == "--foreground" ]] || [[ "${1:-}" == "-f" ]]; then
  FOREGROUND=1
fi

if [[ -f "$PID_FILE" ]]; then
  OLD_PID="$(cat "$PID_FILE" 2>/dev/null || true)"
  if [[ -n "$OLD_PID" ]] && kill -0 "$OLD_PID" 2>/dev/null; then
    echo "[aos-v3] Server already running (pid $OLD_PID)"
    echo "[aos-v3] Stop: bash scripts/stop-aos-v3-server.sh"
    exit 0
  fi
  rm -f "$PID_FILE"
fi

if lsof -Pi ":$PORT" -sTCP:LISTEN -t >/dev/null 2>&1; then
  # Port occupied — probe health up to 3 times (handles brief --reload restart window).
  _health_ok=0
  for _try in 1 2 3; do
    if curl -sf --max-time 5 "http://127.0.0.1:${PORT}/api/health" 2>/dev/null | grep -q '"ok"'; then
      _health_ok=1
      break
    fi
    [[ $_try -lt 3 ]] && sleep 2
  done
  if [[ $_health_ok -eq 1 ]]; then
    echo "[aos-v3] Server already running on port $PORT (health OK)"
    echo "[aos-v3] Stop: bash scripts/stop-aos-v3-server.sh"
    exit 0
  fi
  echo "[aos-v3] ERROR: port $PORT is occupied by a process that is not responding to AOS v3 /api/health." >&2
  echo "[aos-v3] Run: lsof -i :$PORT   to identify the process." >&2
  echo "[aos-v3] Or:  AOS_V3_SERVER_PORT=8091 bash scripts/start-aos-v3-server.sh" >&2
  exit 2
fi

if [[ -f "$ROOT/agents_os_v3/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT/agents_os_v3/.env"
  set +a
fi

if [[ -n "${AOS_V3_VENV:-}" && -f "$AOS_V3_VENV/bin/activate" ]]; then
  # shellcheck disable=SC1091
  source "$AOS_V3_VENV/bin/activate"
elif [[ -f "$ROOT/agents_os_v3/.venv/bin/activate" ]]; then
  # shellcheck disable=SC1091
  source "$ROOT/agents_os_v3/.venv/bin/activate"
elif [[ -f "$ROOT/api/venv/bin/activate" ]]; then
  # shellcheck disable=SC1091
  source "$ROOT/api/venv/bin/activate"
else
  echo "[aos-v3] WARN: no venv found (AOS_V3_VENV, agents_os_v3/.venv, api/venv). Using python3 on PATH." >&2
fi

if ! python3 -c "import fastapi, uvicorn" 2>/dev/null; then
  echo "[aos-v3] Installing dependencies from agents_os_v3/requirements.txt ..."
  pip install -r "$ROOT/agents_os_v3/requirements.txt"
fi

export PYTHONPATH="$ROOT"

UVICORN_CMD=(python3 -m uvicorn agents_os_v3.modules.management.api:app --host 0.0.0.0 --port "$PORT")

echo "[aos-v3] Starting AOS v3 API + UI on port $PORT (PYTHONPATH=$ROOT)"
echo "[aos-v3] Browser: http://127.0.0.1:${PORT}/  (Pipeline UI at /)"
echo "[aos-v3] Health: curl -s http://127.0.0.1:${PORT}/api/health"
echo "[aos-v3] Docs:  http://127.0.0.1:${PORT}/docs"

if [[ "$FOREGROUND" -eq 1 ]]; then
  exec "${UVICORN_CMD[@]}"
fi

"${UVICORN_CMD[@]}" &
echo $! >"$PID_FILE"
echo ""
echo "[aos-v3] Background pid $(cat "$PID_FILE") — stop: bash scripts/stop-aos-v3-server.sh"
echo ""
