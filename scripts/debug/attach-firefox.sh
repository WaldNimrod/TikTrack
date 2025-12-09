#!/bin/bash

# TikTrack Firefox Debug Attach Script
# -------------------------------------
# Checks if Firefox is running with remote debugging and provides connection info

set -euo pipefail

DEBUG_PORT="${DEBUG_PORT:-6000}"
DEV_URL="${DEV_URL:-http://localhost:8080}"

echo "🔍 Checking Firefox remote debugging status..."
echo ""

# Check if port is in use
if lsof -Pi :$DEBUG_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    PROCESS_INFO=$(lsof -Pi :$DEBUG_PORT -sTCP:LISTEN)
    echo "✅ Firefox remote debugging is active on port $DEBUG_PORT"
    echo ""
    echo "Process info:"
    echo "$PROCESS_INFO"
    echo ""
    echo "You can attach to Firefox from VS Code/Cursor using 'Attach to Firefox' configuration"
    echo "URL: $DEV_URL"
else
    echo "❌ Firefox remote debugging is not active on port $DEBUG_PORT"
    echo ""
    echo "To start Firefox with remote debugging, run:"
    echo "  ./scripts/debug/launch-firefox.sh"
    echo ""
    echo "Or manually start Firefox with:"
    echo "  firefox --start-debugger-server=$DEBUG_PORT --new-instance $DEV_URL"
fi

exit 0

