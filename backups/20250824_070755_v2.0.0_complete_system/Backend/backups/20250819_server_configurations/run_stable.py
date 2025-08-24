#!/usr/bin/env python3
"""
Stable Server Runner for TikTrack
גרסה יציבה יותר של השרת

🎯 מטרה: שרת יציב לשימוש יומיומי ופרודקשן
⚡ תכונות: Flask development server עם הגדרות יציבות
🛡️ יציבות: פחות זיכרון, פחות threads, יציב יותר
📊 ביצועים: מתאים לעומס נמוך-בינוני

הבדלים מהגרסה הבסיסית:
- debug=False: חוסך זיכרון ומשאבים
- use_reloader=False: מונע threads נוספים
- threaded=True: תמיכה בבקשות מרובות
- processes=1: רק process אחד למניעת בעיות

מתאים ל:
✅ שימוש יומיומי
✅ פרודקשן בסיסי
✅ סביבות עם משאבים מוגבלים
❌ לא מתאים לפיתוח (אין auto-reload)
"""

from app import app
import os
import sys
import signal
import time

def signal_handler(signum, frame):
    """
    מטפל בסיגנלים לעצירה מסודרת
    """
    print(f"\n🛑 Received signal {signum}, shutting down gracefully...")
    sys.exit(0)

def main():
    """
    הפעלת השרת היציב
    """
    print("🚀 Starting TikTrack with Stable Server...")
    print("📍 Server will run on: http://127.0.0.1:8080")
    print("🛡️  Stable configuration - less memory usage")
    print("🛑 Press Ctrl+C to stop the server")
    print("-" * 50)
    
    # הגדרת signal handlers לעצירה מסודרת
    signal.signal(signal.SIGINT, signal_handler)   # Ctrl+C
    signal.signal(signal.SIGTERM, signal_handler)  # kill command
    
    try:
        # הפעלת השרת עם הגדרות יציבות
        # הגדרות אלו נבחרו בקפידה למניעת בעיות יציבות
        app.run(
            host="127.0.0.1",           # רק localhost למניעת גישה חיצונית
            port=8080,                  # פורט סטנדרטי
            debug=False,                # ❌ בלי debug mode - חוסך זיכרון משמעותי
            use_reloader=False,         # ❌ בלי auto-reload - מונע threads נוספים
            threaded=True,              # ✅ תמיכה בבקשות מרובות
            processes=1,                # ✅ רק process אחד - מניעת בעיות
        )
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()

