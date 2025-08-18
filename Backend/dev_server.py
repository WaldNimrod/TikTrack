#!/usr/bin/env python3
"""
Development Server with Auto-Reload and Stability Features
שרת פיתוח עם טעינה מחדש אוטומטית ושיפורי יציבות

🎯 מטרה: שרת פיתוח מתקדם עם auto-reload ו-monitoring
⚡ תכונות: 
  - Auto-reload כשמשנים קבצים
  - Monitoring ו-health checks
  - Restart אוטומטי במקרה של קריסה
  - לוגים מפורטים
🛡️ יציבות: משתמש ב-Waitress המתוקן בתור subprocess
📊 ביצועים: מתאים לפיתוח עם עומס נמוך-בינוני

ארכיטקטורה:
- DevServer: מנהל את התהליך הראשי
- CodeChangeHandler: צופה בשינויים בקבצים
- subprocess: מפעיל את run_waitress_fixed.py
- watchdog: ספרייה לצפייה בשינויים

מתאים ל:
✅ פיתוח פעיל
✅ ניסויים ובדיקות
✅ סביבות עם auto-reload
❌ לא מתאים לפרודקשן (יותר מדי משאבים)
"""

import os
import sys
import time
import subprocess
import signal
import requests
import logging
from datetime import datetime
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from waitress import serve

# הוספת הנתיב לפרויקט
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

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

class CodeChangeHandler(FileSystemEventHandler):
    """
    מטפל בשינויים בקבצים ומפעיל מחדש את השרת
    """
    def __init__(self, restart_callback):
        self.restart_callback = restart_callback
        self.last_restart = 0
        
    def on_modified(self, event):
        """
        נקרא כשקובץ משתנה
        """
        if event.is_directory:
            return
            
        # רק קבצי Python או SQL - לא כל הקבצים
        if not (event.src_path.endswith('.py') or event.src_path.endswith('.sql')):
            return
            
        # מניעת restart מרובים - מינימום 2 שניות בין restarts
        current_time = time.time()
        if current_time - self.last_restart < 2:
            return
            
        print(f"🔄 שינוי זוהה בקובץ: {event.src_path}")
        logger.info(f"File change detected: {event.src_path}")
        self.last_restart = current_time
        self.restart_callback()

class DevServer:
    """
    מנהל השרת הראשי עם auto-reload ו-monitoring
    """
    def __init__(self):
        self.process = None          # התהליך של השרת
        self.observer = None         # הצופה בשינויים
        self.is_running = True       # האם השרת רץ
        self.restart_count = 0       # מספר הפעלות מחדש
        self.max_restarts = 10       # מקסימום הפעלות מחדש
        
        # הגדרת signal handlers לעצירה מסודרת
        signal.signal(signal.SIGINT, self.signal_handler)   # Ctrl+C
        signal.signal(signal.SIGTERM, self.signal_handler)  # kill command
        
    def signal_handler(self, signum, frame):
        """
        מטפל בסיגנלים לעצירה מסודרת
        """
        print(f"\n🛑 Received signal {signum}, shutting down gracefully...")
        self.is_running = False
        self.stop_server()
        if self.observer:
            self.observer.stop()
        sys.exit(0)
        
    def check_server_health(self):
        """
        בודק אם השרת עובד על ידי קריאה ל-health endpoint
        """
        try:
            response = requests.get("http://127.0.0.1:8080/api/health", timeout=5)
            return response.status_code == 200
        except:
            return False
        
    def start_server(self):
        """
        הפעלת השרת עם Waitress המתוקן בתור subprocess
        """
        print("🚀 מפעיל שרת פיתוח עם Waitress...")
        logger.info("Starting development server with Waitress")
        
        # עצירת תהליך קיים אם יש
        if self.process:
            self.stop_server()
            
        try:
            # בדיקת תיקיות וקבצים חיוניים
            if not os.path.exists("db/simpleTrade_new.db"):
                logger.error("Database file not found!")
                print("❌ Database file not found at db/simpleTrade_new.db")
                return False
            
            if not os.path.exists("../trading-ui"):
                logger.error("UI directory not found!")
                print("❌ UI directory not found at ../trading-ui")
                return False
            
            # הפעלת השרת עם subprocess - משתמש ב-run_waitress_fixed.py
            # זה מאפשר לנו לנהל את התהליך ולעצור אותו בעת הצורך
            self.process = subprocess.Popen([
                sys.executable, 'run_waitress_fixed.py'
            ], cwd=os.path.dirname(os.path.abspath(__file__)))
            
            print("✅ כל הקבצים והתיקיות הנדרשים נמצאו")
            print("📍 שרת פיתוח פועל על http://localhost:8080")
            print("⚡ Waitress - יציב יותר מ-Flask development server")
            print("📝 לוגים מפורטים נשמרים ב-server_detailed.log")
            print("🔄 השרת מתעדכן אוטומטית בשינויים")
            print("-" * 50)
            
            # המתנה שהשרת יעלה
            time.sleep(3)
            return True
            
        except Exception as e:
            logger.error(f"Error starting server: {e}")
            print(f"❌ שגיאה בהפעלת השרת: {e}")
            return False
        
    def stop_server(self):
        """
        עצירת השרת בצורה מסודרת
        """
        if self.process:
            try:
                self.process.terminate()  # בקשה לעצירה מסודרת
                self.process.wait(timeout=10)  # המתנה עד 10 שניות
            except subprocess.TimeoutExpired:
                self.process.kill()  # כפייה אם לא נעצר
            except:
                pass
            self.process = None
        
    def restart_server(self):
        """
        הפעלה מחדש של השרת עם הגבלת מספר הפעלות
        """
        print("🔄 מפעיל מחדש את השרת...")
        logger.info("Restarting server...")
        self.restart_count += 1
        
        # הגבלת מספר הפעלות מחדש למניעת לולאה אינסופית
        if self.restart_count >= self.max_restarts:
            print(f"❌ הגעת למספר המקסימלי של הפעלות מחדש ({self.max_restarts})")
            logger.error(f"Maximum restart attempts reached: {self.max_restarts}")
            return False
            
        self.start_server()
        
    def start_watcher(self):
        """
        הפעלת צופה לשינויים בקבצים
        """
        event_handler = CodeChangeHandler(self.restart_server)
        self.observer = Observer()
        
        # צפייה בקבצים רלוונטיים - רק מה שחשוב
        paths_to_watch = [
            'models/',      # שינויים במודלים
            'routes/',      # שינויים ב-API
            'config/',      # שינויים בקונפיגורציה
            'app.py'        # שינויים באפליקציה הראשית
        ]
        
        for path in paths_to_watch:
            full_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), path)
            if os.path.exists(full_path):
                self.observer.schedule(event_handler, full_path, recursive=True)
                print(f"👀 צופה בשינויים ב: {full_path}")
                logger.info(f"Watching for changes in: {full_path}")
        
        self.observer.start()
        
    def run(self):
        """
        הפעלת השרת עם צופה - הפונקציה הראשית
        """
        try:
            print("🔍 TikTrack Development Server Monitor Started")
            print("📍 Monitoring server at http://127.0.0.1:8080")
            print("🔄 Auto-restart enabled")
            print("⚡ Using Waitress for stability")
            print("📝 Detailed logs in server_detailed.log")
            print("-" * 50)
            
            # הפעלת השרת והצופה
            self.start_server()
            self.start_watcher()
            
            print("🔄 השרת מתעדכן אוטומטית בשינויים")
            print("⏹️  לחץ Ctrl+C לעצירה")
            
            # לולאה ראשית - מחכה לסיגנל עצירה
            while self.is_running:
                time.sleep(1)
                
        except KeyboardInterrupt:
            print("\n⏹️  עוצר את השרת...")
            logger.info("Server stopped by user")
        finally:
            # ניקוי מסודר
            if self.process:
                self.stop_server()
            if self.observer:
                self.observer.stop()
                self.observer.join()

if __name__ == "__main__":
    server = DevServer()
    server.run()
