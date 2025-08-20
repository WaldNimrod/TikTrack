#!/bin/bash

# Development Server Startup Script
# סקריפט להפעלת שרת פיתוח

# 🎯 מטרה: הפעלת שרת פיתוח Flask פשוט ויציב
# ⚡ תכונות: 
#   - Flask development server
#   - Debug mode מופעל
#   - לוגים מפורטים
#   - יציבות משופרת
# 🛡️ יציבות: Flask development server ללא auto-reload
# 📊 ביצועים: מתאים לפיתוח עם עומס נמוך-בינוני
#
# מתאים ל:
# ✅ פיתוח פעיל
# ✅ ניסויים ובדיקות
# ✅ סביבות יציבות
# ❌ לא מתאים לפרודקשן

echo "🚀 מפעיל שרת פיתוח TikTrack..."

# בדיקה שהסביבה מוכנה
if [ ! -d "Backend" ]; then
    echo "❌ תיקיית Backend לא נמצאה"
    exit 1
fi

# כניסה לתיקיית Backend
cd Backend

# הפעלת הסביבה הוירטואלית
source ../.venv/bin/activate

# בדיקה אם יש תהליכים רצים על הפורט
echo "🔍 בודק תהליכים קיימים..."
if lsof -i :8080 >/dev/null 2>&1; then
    echo "⚠️  יש תהליכים רצים על פורט 8080"
    echo "🔄 עוצר תהליכים קיימים..."
    lsof -ti :8080 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# הפעלת שרת פיתוח Flask פשוט
echo "🔄 מפעיל שרת פיתוח Flask..."
echo "⚡ Flask development server - יציב ומהיר"
echo "📝 לוגים מפורטים מופעלים"
echo "-" * 50

# הפעלה עם run_flask_simple.py - הקונפיגורציה החדשה
python3 run_flask_simple.py
