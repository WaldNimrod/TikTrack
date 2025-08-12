#!/bin/bash
# TikTrack Server Starter
# הפעלת השרת מהתיקייה הראשית

echo "🚀 Starting TikTrack Server..."
echo "📍 Server will run on: http://127.0.0.1:5002"
echo "🔍 Auto-monitoring enabled"
echo "⚡ Using caffeinate to prevent sleep"
echo "🛑 Press Ctrl+C to stop the server"
echo "-" * 50

# מעבר לתיקיית Backend והפעלת המנטור
cd Backend
caffeinate -dims python3 monitor_server.py
