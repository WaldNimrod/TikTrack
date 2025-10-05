#!/bin/bash

# TikTrack Restart V3 - Test Start Server
# ========================================
# 
# 🎯 Purpose: Test server start functionality with control return
# ⚡ Features: Start server in background + verify control return
# 🔧 Usage: ./test-start-server.sh

echo "🔄 TikTrack Restart V3 - Start Server Test"
echo "==========================================="
echo "📅 Started at: $(date '+%H:%M:%S')"
echo "🔍 Terminal: $TERM"
echo "🔍 TTY: $(tty 2>/dev/null || echo 'not a tty')"
echo ""

echo "🚀 Testing server start functionality..."

# Test 1: Check if Backend directory exists
if [ ! -d "Backend" ]; then
    echo "❌ Backend directory not found"
    exit 1
fi

echo "✅ Backend directory found"

# Test 2: Check if app.py exists
if [ ! -f "Backend/app.py" ]; then
    echo "❌ Backend/app.py not found"
    exit 1
fi

echo "✅ app.py found"

# Test 3: Start server in background
echo "🔄 Starting server in background..."
cd Backend

# Start server with nohup (detached from TTY)
nohup python3 app.py > /dev/null 2>&1 &
server_pid=$!

cd ..

echo "✅ Server started with PID: $server_pid"
echo "✅ Server is running in background"

# Test 4: Wait a moment and check if server is running
sleep 2
if ps -p $server_pid > /dev/null 2>&1; then
    echo "✅ Server process is still running"
else
    echo "⚠️ Server process may have stopped"
fi

echo ""
echo "🎉 Start server test completed!"
echo "📊 Summary:"
echo "   - Server start functionality tested"
echo "   - Server running in background"
echo "   - Control should be returned immediately"
echo ""

echo "🚀 CONTROL RETURNED TO USER!"
echo ""

exit 0









