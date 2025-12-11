#!/bin/bash

# TikTrack Browser Check Script
# -----------------------------
# Checks which browser is being used and warns if not Firefox

set -euo pipefail

echo "🔍 Checking browser usage..."
echo ""

# Check if Firefox is running with remote debugging
if lsof -Pi :6000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "✅ Firefox remote debugging is active on port 6000"
    echo ""
    exit 0
fi

# Check if Chrome is running with remote debugging
if lsof -Pi :9222 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  WARNING: Chrome remote debugging is active on port 9222"
    echo ""
    echo "❌ Chrome is NOT the recommended browser for debugging!"
    echo "   Please use Firefox instead:"
    echo "   ./scripts/debug/launch-firefox.sh"
    echo ""
    exit 1
fi

# Check default browser
if [[ "$OSTYPE" == "darwin"* ]]; then
    DEFAULT_BROWSER=$(defaults read com.apple.LaunchServices/com.apple.launchservices.secure LSHandlers | grep -B 1 "http" | head -1 | cut -d'"' -f4)
    echo "ℹ️  Default browser: $DEFAULT_BROWSER"
    
    if [[ "$DEFAULT_BROWSER" == *"Chrome"* ]] || [[ "$DEFAULT_BROWSER" == *"Google Chrome"* ]]; then
        echo ""
        echo "⚠️  WARNING: Chrome is your default browser!"
        echo "   When you press F5 in VS Code/Cursor without selecting a configuration,"
        echo "   it will open Chrome instead of Firefox."
        echo ""
        echo "✅ Solution: Always select '🚀 Launch Firefox - Development (RECOMMENDED)'"
        echo "   from the configuration list when pressing F5."
        echo ""
    fi
fi

echo ""
echo "💡 Tip: Use './scripts/debug/launch-firefox.sh' to always launch Firefox"
echo ""

exit 0



