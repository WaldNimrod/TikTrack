#!/bin/bash
# TikTrack Auto-Start Setup
# Setting up automatic server startup after computer restart

echo "🚀 Setting up TikTrack Auto-Start..."
echo "📍 This will make the server start automatically after computer restart"

# Get the full project path
PROJECT_PATH=$(pwd)
echo "📁 Project path: $PROJECT_PATH"

# Create LaunchAgent file
LAUNCH_AGENT_DIR="$HOME/Library/LaunchAgents"
LAUNCH_AGENT_FILE="$LAUNCH_AGENT_DIR/com.tiktrack.server.plist"

echo "📝 Creating LaunchAgent file..."

# Create LaunchAgents directory if it doesn't exist
mkdir -p "$LAUNCH_AGENT_DIR"

# Create LaunchAgent file
cat > "$LAUNCH_AGENT_FILE" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.tiktrack.server</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>$PROJECT_PATH/start_server.sh</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>$PROJECT_PATH/Backend/autostart.log</string>
    <key>StandardErrorPath</key>
    <string>$PROJECT_PATH/Backend/autostart_error.log</string>
    <key>WorkingDirectory</key>
    <string>$PROJECT_PATH</string>
    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin</string>
    </dict>
</dict>
</plist>
EOF

echo "✅ LaunchAgent file created: $LAUNCH_AGENT_FILE"

# Load LaunchAgent
echo "🔄 Loading LaunchAgent..."
launchctl load "$LAUNCH_AGENT_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Auto-start setup completed successfully!"
    echo "🔄 The server will now start automatically after computer restart"
    echo "📝 Logs will be saved to:"
    echo "   - $PROJECT_PATH/Backend/autostart.log"
    echo "   - $PROJECT_PATH/Backend/autostart_error.log"
    echo ""
    echo "🔧 To disable auto-start, run:"
    echo "   launchctl unload $LAUNCH_AGENT_FILE"
    echo ""
    echo "🔧 To check status, run:"
    echo "   launchctl list | grep tiktrack"
else
    echo "❌ Failed to load LaunchAgent"
    echo "🔧 Please check the LaunchAgent file manually"
fi
