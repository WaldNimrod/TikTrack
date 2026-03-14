#!/usr/bin/env bash
# Start local HTTP server for Agents_OS Pipeline Dashboard
# Usage: ./agents_os/scripts/start_ui_server.sh [port]
# Default port: 7070

set -e
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PORT="${1:-7070}"
PID_FILE="/tmp/agents_os_ui_server.pid"

if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
  echo "[agents_os] Server already running"
  echo "[agents_os] Run: ./agents_os/scripts/stop_ui_server.sh to stop"
  exit 0
fi

cd "$REPO"
python3 -m http.server "$PORT" --bind 127.0.0.1 &
echo $! > "$PID_FILE"
echo ""
echo "[agents_os] Pipeline UI server started (port $PORT)"
echo ""
echo "  📊 Dashboard:  http://localhost:${PORT}/agents_os/ui/PIPELINE_DASHBOARD.html"
echo "  🗺️  Roadmap:    http://localhost:${PORT}/agents_os/ui/PIPELINE_ROADMAP.html"
echo "  👥 Teams:      http://localhost:${PORT}/agents_os/ui/PIPELINE_TEAMS.html"
echo ""
echo "  Stop: ./agents_os/scripts/stop_ui_server.sh"
echo ""
