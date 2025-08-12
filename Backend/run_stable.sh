#!/bin/bash
# TikTrack Stable Server Runner
# מונע שינה של השרת ומבטיח יציבות

echo "🚀 Starting TikTrack with Stable Configuration..."
echo "📍 Server will run on: http://127.0.0.1:5002"
echo "⚡ Using caffeinate to prevent sleep"
echo "🛑 Press Ctrl+C to stop the server"
echo "-" * 50

# הפעלת השרת עם caffeinate למניעת שינה
caffeinate -dims python3 run_waitress.py
