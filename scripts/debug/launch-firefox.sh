#!/bin/bash

# TikTrack Firefox Debug Launch Script
# -------------------------------------
# Launches Firefox with remote debugging enabled for VS Code/Cursor debugging

set -euo pipefail

# Configuration
FIREFOX_BIN="${FIREFOX_BIN:-/Applications/Firefox.app/Contents/MacOS/firefox}"
DEBUG_PORT="${DEBUG_PORT:-6000}"
DEV_URL="${DEV_URL:-http://localhost:8080}"

# Check if Firefox is installed
if [[ ! -f "$FIREFOX_BIN" ]]; then
    echo "❌ Firefox not found at: $FIREFOX_BIN"
    echo "Please install Firefox or set FIREFOX_BIN environment variable"
    exit 1
fi

# Check if port is already in use
if lsof -Pi :$DEBUG_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Port $DEBUG_PORT is already in use"
    echo "Firefox may already be running with remote debugging enabled"
    echo "You can attach to it from VS Code/Cursor"
    exit 0
fi

echo "🚀 Launching Firefox with remote debugging on port $DEBUG_PORT..."
echo "📝 URL: $DEV_URL"
echo ""

# Launch Firefox with remote debugging
"$FIREFOX_BIN" --start-debugger-server=$DEBUG_PORT --new-instance "$DEV_URL" &

FIREFOX_PID=$!

echo "✅ Firefox launched with PID: $FIREFOX_PID"
echo "🔗 Remote debugging enabled on port: $DEBUG_PORT"
echo ""
echo "You can now attach to Firefox from VS Code/Cursor using 'Attach to Firefox' configuration"
echo ""
echo "To stop Firefox, run: kill $FIREFOX_PID"

exit 0

