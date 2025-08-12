#!/usr/bin/env python3
"""
סקריפט הפעלה יציב לשרת Flask
"""

import os
import sys
import signal
import time
from app import app

def signal_handler(sig, frame):
    """טיפול בסגירת השרת"""
    print('\n🛑 סוגר את השרת...')
    sys.exit(0)

def check_dependencies():
    """בדיקת תלויות"""
    try:
        import flask
        import flask_cors
        import sqlite3
        print("✅ כל התלויות זמינות")
        return True
    except ImportError as e:
        print(f"❌ שגיאה בתלויות: {e}")
        return False

def check_database():
    """בדיקת בסיס הנתונים"""
    try:
        from app import DB_PATH
        if os.path.exists(DB_PATH):
            print(f"✅ בסיס הנתונים נמצא: {DB_PATH}")
            return True
        else:
            print(f"❌ בסיס הנתונים לא נמצא: {DB_PATH}")
            return False
    except Exception as e:
        print(f"❌ שגיאה בבדיקת בסיס הנתונים: {e}")
        return False

def main():
    """הפונקציה הראשית"""
    print("🚀 מפעיל את שרת SimpleTrade...")
    
    # הגדרת signal handler
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # בדיקות מקדימות
    if not check_dependencies():
        sys.exit(1)
    
    if not check_database():
        sys.exit(1)
    
    print("✅ כל הבדיקות עברו בהצלחה")
    print("🌐 השרת זמין בכתובת: http://127.0.0.1:5002")
    print("⏹️  לחץ Ctrl+C לסגירה")
    
    try:
        # הפעלת השרת עם הגדרות יציבות
        app.run(
            debug=False,
            host='127.0.0.1',
            port=5002,
            threaded=True,
            use_reloader=False
        )
    except KeyboardInterrupt:
        print('\n🛑 השרת נסגר על ידי המשתמש')
    except Exception as e:
        print(f'❌ שגיאה בהפעלת השרת: {e}')
        sys.exit(1)

if __name__ == "__main__":
    main()
