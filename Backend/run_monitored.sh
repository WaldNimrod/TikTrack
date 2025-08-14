#!/bin/bash
# TikTrack Monitored Server Runner
# מפעיל את השרת עם מנטור אוטומטי

echo "🚀 Starting TikTrack with Auto-Monitoring..."
echo "📍 Server will run on: http://127.0.0.1:8080"
echo "🔍 Auto-restart enabled if server crashes"
echo "⚡ Using caffeinate to prevent sleep"
echo "🛑 Press Ctrl+C to stop the server"
echo "-" * 50

# הפעלת השרת עם מנטור ו-caffeinate
caffeinate -dims python3 monitor_server.py
