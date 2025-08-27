#!/bin/bash
# TikTrack Disable Auto-Start
# Disable automatic server startup

echo "🛑 Disabling TikTrack Auto-Start..."

# Get the full project path
PROJECT_PATH=$(pwd)
LAUNCH_AGENT_FILE="$HOME/Library/LaunchAgents/com.tiktrack.server.plist"

echo "📁 Project path: $PROJECT_PATH"
echo "📝 LaunchAgent file: $LAUNCH_AGENT_FILE"

# Check if LaunchAgent exists
if [ -f "$LAUNCH_AGENT_FILE" ]; then
    echo "🔄 Unloading LaunchAgent..."
    launchctl unload "$LAUNCH_AGENT_FILE"
    
    if [ $? -eq 0 ]; then
        echo "✅ LaunchAgent unloaded successfully"
        
        echo "🗑️ Removing LaunchAgent file..."
        rm "$LAUNCH_AGENT_FILE"
        
        if [ $? -eq 0 ]; then
            echo "✅ LaunchAgent file removed"
            echo "🛑 Auto-start disabled successfully!"
            echo "🔄 The server will no longer start automatically after computer restart"
        else
            echo "❌ Failed to remove LaunchAgent file"
        fi
    else
        echo "❌ Failed to unload LaunchAgent"
    fi
else
    echo "⚠️ LaunchAgent file not found"
    echo "🛑 Auto-start was not enabled"
fi
