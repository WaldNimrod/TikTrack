#!/usr/bin/env bash
# Start local HTTP server for Agents_OS Pipeline Dashboard
# Usage: ./agents_os/scripts/start_ui_server.sh [port]
# Default port: 7070

set -e
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PORT="${1:-8090}"
PID_FILE="/tmp/agents_os_ui_server.pid"

if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
  echo "[agents_os] Server already running"
  echo "[agents_os] Run: ./agents_os/scripts/stop_ui_server.sh to stop"
  exit 0
fi

cd "$REPO"
source api/venv/bin/activate 2>/dev/null || true
export AOS_SERVER_PORT="$PORT"
uvicorn agents_os_v2.server.aos_ui_server:app --host 127.0.0.1 --port "$PORT" &
echo $! > "$PID_FILE"
echo ""
echo "[agents_os] AOS Pipeline Server started (port $PORT)"
echo ""
echo "  📊 Dashboard:  http://localhost:${PORT}/static/PIPELINE_DASHBOARD.html"
echo "  🗺️  Roadmap:    http://localhost:${PORT}/static/PIPELINE_ROADMAP.html"
echo "  👥 Teams:      http://localhost:${PORT}/static/PIPELINE_TEAMS.html"
echo ""
echo "  Stop: ./agents_os/scripts/stop_ui_server.sh"
echo ""
