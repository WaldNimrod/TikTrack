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
    
    app.run(
        host='127.0.0.1',
        port=8080,
        debug=True,
        use_reloader=True
    )
