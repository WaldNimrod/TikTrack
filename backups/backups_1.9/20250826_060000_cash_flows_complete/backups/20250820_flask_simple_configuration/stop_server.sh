#!/bin/bash
# TikTrack Server Stopper
# עצירת השרת

echo "🛑 Stopping TikTrack Server..."

# עצירת תהליכי Python שקשורים לשרת
pkill -f "python3 run_waitress.py"
pkill -f "python3 monitor_server.py"
pkill -f "caffeinate.*monitor_server.py"

# בדיקה אם יש תהליכים שעדיין רצים
if pgrep -f "run_waitress.py\|monitor_server.py" > /dev/null; then
    echo "⚠️  Some processes still running, force killing..."
    pkill -9 -f "run_waitress.py\|monitor_server.py"
fi

echo "✅ Server stopped successfully"
