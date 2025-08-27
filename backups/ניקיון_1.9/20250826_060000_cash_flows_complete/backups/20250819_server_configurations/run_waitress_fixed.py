#!/usr/bin/env python3
"""
Fixed Waitress Server Runner for TikTrack
גרסה מתוקנת ויציבה יותר

🎯 מטרה: שרת Waitress יציב לפרודקשן
⚡ תכונות: Waitress WSGI server עם הגדרות מתוקנות
🛡️ יציבות: פחות threads ו-connections למניעת קריסות
📊 ביצועים: מתאים לעומס בינוני-גבוה

הבדלים מהגרסה המקורית (run_waitress.py):
- threads=4 במקום 8: פחות עומס על המערכת
- connection_limit=100 במקום 500: פחות connections פתוחים
- cleanup_interval=30 במקום 10: פחות תדירות ניקוי
- channel_timeout=120 במקום 60: יותר זמן לביצוע בקשות
- max_request_body_size=10MB במקום 1GB: הגבלת גודל בקשות

מתאים ל:
✅ פרודקשן
✅ עומס בינוני-גבוה
✅ סביבות יציבות
❌ לא מתאים לפיתוח (אין auto-reload)
"""

from waitress import serve
from app import app
import os
import sys
import logging
from datetime import datetime

# הגדרת לוגים מפורטים לניטור ובדיקת בעיות
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('server_detailed.log'),  # לוגים לקובץ
        logging.StreamHandler()                      # לוגים לטרמינל
    ]
)

logger = logging.getLogger(__name__)

def main():
    """
    הפעלת השרת עם Waitress המתוקן
    """
    print("🚀 Starting TikTrack with Fixed Waitress Server...")
    print("📍 Server will run on: http://127.0.0.1:8080")
    print("⚡ Fixed configuration - more stable")
    print("📝 Detailed logs will be saved to server_detailed.log")
    print("🛑 Press Ctrl+C to stop the server")
    print("-" * 50)
    
    logger.info("Starting TikTrack server with Fixed Waitress")
    
    try:
        # בדיקת תיקיות וקבצים חיוניים לפני הפעלת השרת
        if not os.path.exists("db/simpleTrade_new.db"):
            logger.error("Database file not found!")
            print("❌ Database file not found at db/simpleTrade_new.db")
            sys.exit(1)
        
        if not os.path.exists("../trading-ui"):
            logger.error("UI directory not found!")
            print("❌ UI directory not found at ../trading-ui")
            sys.exit(1)
        
        logger.info("All required files and directories found")
        print("✅ All required files and directories found")
        
        # הפעלת השרת עם Waitress - הגדרות יציבות
        # הגדרות אלו נבחרו בקפידה למניעת segmentation fault
        logger.info("Starting Fixed Waitress server...")
        serve(
            app, 
            host="127.0.0.1",           # רק localhost למניעת גישה חיצונית
            port=8080,                  # פורט סטנדרטי
            threads=4,                  # ✅ פחות threads - יציבות יותר (היה 8)
            connection_limit=100,       # ✅ פחות connections (היה 500)
            cleanup_interval=30,        # ✅ יותר זמן בין cleanups (היה 10)
            channel_timeout=120,        # ✅ יותר זמן timeout (היה 60)
            log_socket_errors=False,    # ✅ פחות לוגים - ביצועים טובים יותר
            log_untrusted_proxy_headers=False,  # ✅ פחות לוגים
            max_request_body_size=10485760  # ✅ 10MB במקום 1GB - הגבלת גודל
        )
    except KeyboardInterrupt:
        logger.info("Server stopped by user")
        print("\n🛑 Server stopped by user")
    except Exception as e:
        logger.error(f"Error starting server: {e}")
        print(f"❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
