#!/usr/bin/env python3
"""
Flask Development Server
שרת פיתוח Flask פשוט

🎯 מטרה: שרת פיתוח פשוט עם Flask
⚡ תכונות: 
  - Flask development server
  - Debug mode מופעל
  - Auto-reload מופעל
  - מתאים לפיתוח בלבד

מתאים ל:
✅ פיתוח פעיל
✅ ניסויים ובדיקות
✅ סביבות עם auto-reload
❌ לא מתאים לפרודקשן
"""

from app import app

if __name__ == "__main__":
    print("🚀 מפעיל Flask development server...")
    print("📍 שרת פיתוח פועל על http://127.0.0.1:8080")
    print("⚡ Debug mode מופעל")
    print("🔄 Auto-reload מופעל")
    print("-" * 50)
    
    app.run(
        host='127.0.0.1',
        port=8080,
        debug=True,
        use_reloader=True
    )
