#!/bin/bash

# Development Server Startup Script
# סקריפט להפעלת שרת פיתוח

# 🎯 מטרה: הפעלת שרת פיתוח עם auto-reload ו-monitoring
# ⚡ תכונות: 
#   - Auto-reload כשמשנים קבצים
#   - Monitoring ו-health checks
#   - Restart אוטומטי במקרה של קריסה
#   - לוגים מפורטים
# 🛡️ יציבות: משתמש ב-Waitress המתוקן
# 📊 ביצועים: מתאים לפיתוח עם עומס נמוך-בינוני
#
# מתאים ל:
# ✅ פיתוח פעיל
# ✅ ניסויים ובדיקות
# ✅ סביבות עם auto-reload
# ❌ לא מתאים לפרודקשן (יותר מדי משאבים)

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

# בדיקת dependencies - watchdog נדרש ל-auto-reload
echo "📦 בודק dependencies..."
python3 -c "import watchdog" 2>/dev/null || {
    echo "📦 מתקין watchdog..."
    python3 -m pip install watchdog
}

# בדיקה אם יש תהליכים רצים על הפורט
echo "🔍 בודק תהליכים קיימים..."
if lsof -i :8080 >/dev/null 2>&1; then
    echo "⚠️  יש תהליכים רצים על פורט 8080"
    echo "🔄 עוצר תהליכים קיימים..."
    lsof -ti :8080 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# הפעלת שרת פיתוח עם auto-reload
echo "🔄 מפעיל שרת פיתוח עם auto-reload..."
echo "⚡ Waitress server with stability features"
echo "🔄 השרת מתעדכן אוטומטית בשינויים"
echo "📝 לוגים מפורטים ב-server_detailed.log"
echo "-" * 50

# הפעלה עם dev_server.py המתוקן
# dev_server.py מנהל את התהליך הראשי ומפעיל את run_waitress_fixed.py
python3 dev_server.py
