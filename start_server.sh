#!/bin/bash
# TikTrack Server Starter
# =======================
# 
# ⚠️  חשוב: שרת יציב על פורט 5002
# =================================
# - קובץ: app.py (לא app_new.py!)
# - פורט: 5002
# - סטטוס: יציב ופעיל
# - תאריך עדכון אחרון: 2025-08-15
# 
# שינויים אחרונים:
# - מערכת מוניטורינג אוטומטית
# - מניעת שינה של המערכת
# - הפעלה מחדש אוטומטית במקרה של קריסה
# 
# ⚠️  אין לשנות את השרת או הפורט!
# ===================================
# 
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
