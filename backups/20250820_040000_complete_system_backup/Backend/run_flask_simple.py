#!/usr/bin/env python3
"""
Flask Simple Development Server
שרת פיתוח Flask פשוט עם לוגים מפורטים

🎯 מטרה: שרת פיתוח פשוט עם Flask ולוגים מפורטים
⚡ תכונות: 
  - Flask development server
  - Debug mode מופעל
  - לוגים מפורטים
  - מתאים לפיתוח בלבד
"""

import logging
from app import app

# הגדרת לוגים מפורטים
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

if __name__ == "__main__":
    """
    הפעלת שרת Flask development
    """
    print("🚀 מפעיל Flask development server...")
    print("📍 שרת פיתוח פועל על http://127.0.0.1:8080")
    print("⚡ Debug mode מופעל")
    print("📝 לוגים מפורטים מופעלים")
    print("🎯 הודעות notification מופעלות")
    print("🔗 נתיבים ללא .html זמינים")
    print("-" * 50)
    
    app.run(
        host='127.0.0.1',
        port=8080,
        debug=True,
        use_reloader=False  # כיבוי auto-reload למניעת בעיות
    )
