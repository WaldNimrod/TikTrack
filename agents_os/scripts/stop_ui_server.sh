#!/usr/bin/env bash
# Stop the Agents_OS Pipeline Dashboard server
PID_FILE="/tmp/agents_os_ui_server.pid"

if [ -f "$PID_FILE" ]; then
  PID=$(cat "$PID_FILE")
  if kill -0 "$PID" 2>/dev/null; then
    kill "$PID"
    rm "$PID_FILE"
    echo "[agents_os] UI server stopped (pid $PID)"
  else
    echo "[agents_os] Server was not running (stale pid file removed)"
    rm "$PID_FILE"
  fi
else
  echo "[agents_os] No server running (no pid file found)"
fi
