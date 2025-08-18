#!/bin/bash
# TikTrack Server Starter
# הפעלת השרת מהתיקייה הראשית

# 🎯 מטרה: הפעלה מהירה של השרת היציב
# ⚡ תכונות: שרת יציב לשימוש יומיומי
# 🛡️ יציבות: פחות זיכרון, יציב יותר
# 📊 ביצועים: מתאים לעומס נמוך-בינוני
#
# מתאים ל:
# ✅ שימוש יומיומי
# ✅ פרודקשן בסיסי
# ✅ סביבות עם משאבים מוגבלים
# ❌ לא מתאים לפיתוח (אין auto-reload)

echo "🚀 Starting TikTrack Server..."
echo "📍 Server will run on: http://127.0.0.1:8080"
echo "🛡️  Using stable configuration"
echo "🛑 Press Ctrl+C to stop the server"
echo "-" * 50

# מעבר לתיקיית Backend והפעלת השרת היציב
# run_stable.py הוא הקובץ היציב ביותר - Flask עם הגדרות יציבות
cd Backend
python3 run_stable.py
