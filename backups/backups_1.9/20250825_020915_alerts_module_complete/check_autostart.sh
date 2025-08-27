#!/bin/bash
# TikTrack Check Auto-Start Status
# Check auto-start status

echo "🔍 Checking TikTrack Auto-Start Status..."

# Get the full project path
PROJECT_PATH=$(pwd)
LAUNCH_AGENT_FILE="$HOME/Library/LaunchAgents/com.tiktrack.server.plist"

echo "📁 Project path: $PROJECT_PATH"
echo "📝 LaunchAgent file: $LAUNCH_AGENT_FILE"
echo ""

# Check if LaunchAgent exists
if [ -f "$LAUNCH_AGENT_FILE" ]; then
    echo "✅ LaunchAgent file exists"
    
    # Check LaunchAgent status
    echo "🔄 Checking LaunchAgent status..."
    LAUNCH_AGENT_STATUS=$(launchctl list | grep com.tiktrack.server)
    
    if [ -n "$LAUNCH_AGENT_STATUS" ]; then
        echo "✅ LaunchAgent is loaded and active"
        echo "📊 Status: $LAUNCH_AGENT_STATUS"
    else
        echo "⚠️ LaunchAgent file exists but not loaded"
        echo "🔧 To load it, run: launchctl load $LAUNCH_AGENT_FILE"
    fi
    
    # Display LaunchAgent file contents
    echo ""
    echo "📄 LaunchAgent file contents:"
    echo "----------------------------------------"
    cat "$LAUNCH_AGENT_FILE"
    echo "----------------------------------------"
    
else
    echo "❌ LaunchAgent file not found"
    echo "🛑 Auto-start is not enabled"
    echo ""
    echo "🔧 To enable auto-start, run:"
    echo "   ./setup_autostart.sh"
fi

echo ""
echo "🔍 Checking server status..."
SERVER_STATUS=$(curl -s http://127.0.0.1:8080/api/health 2>/dev/null)

if [ $? -eq 0 ]; then
    echo "✅ Server is running and healthy"
    echo "📍 Server URL: http://127.0.0.1:8080"
else
    echo "❌ Server is not running"
    echo "🔧 To start server manually, run:"
    echo "   ./start_server.sh"
fi
