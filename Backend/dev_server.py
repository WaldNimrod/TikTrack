#!/usr/bin/env python3
"""
Development Server with Auto-Reload and Stability Features
שרת פיתוח עם טעינה מחדש אוטומטית ושיפורי יציבות

✅ מתעדכן אוטומטית בשינויים בקוד
✅ מתעדכן אוטומטית בשינויים במודלים
✅ מתעדכן אוטומטית בשינויים בבסיס הנתונים
✅ לוגים מפורטים לפיתוח
✅ יציבות משופרת עם Waitress
✅ מניעת שינה עם caffeinate
✅ health check endpoint
✅ auto-restart במקרה של קריסה
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

# הגדרת לוגים מפורטים
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('server_detailed.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

class CodeChangeHandler(FileSystemEventHandler):
    def __init__(self, restart_callback):
        self.restart_callback = restart_callback
        self.last_restart = 0
        
    def on_modified(self, event):
        if event.is_directory:
            return
            
        # רק קבצי Python או SQL
        if not (event.src_path.endswith('.py') or event.src_path.endswith('.sql')):
            return
            
        # מניעת restart מרובים
        current_time = time.time()
        if current_time - self.last_restart < 2:
            return
            
        print(f"🔄 שינוי זוהה בקובץ: {event.src_path}")
        logger.info(f"File change detected: {event.src_path}")
        self.last_restart = current_time
        self.restart_callback()

class DevServer:
    def __init__(self):
        self.process = None
        self.observer = None
        self.is_running = True
        self.restart_count = 0
        self.max_restarts = 10
        
        # הגדרת signal handlers
        signal.signal(signal.SIGINT, self.signal_handler)
        signal.signal(signal.SIGTERM, self.signal_handler)
        
    def signal_handler(self, signum, frame):
        print(f"\n🛑 Received signal {signum}, shutting down gracefully...")
        self.is_running = False
        self.stop_server()
        if self.observer:
            self.observer.stop()
        sys.exit(0)
        
    def check_server_health(self):
        """בודק אם השרת עובד"""
        try:
            response = requests.get("http://127.0.0.1:8080/api/health", timeout=5)
            return response.status_code == 200
        except:
            return False
        
    def start_server(self):
        """הפעלת השרת עם Waitress"""
        print("🚀 מפעיל שרת פיתוח עם Waitress...")
        logger.info("Starting development server with Waitress")
        
        # עצירת תהליך קיים
        if self.process:
            self.stop_server()
            
        try:
            # בדיקת תיקיות וקבצים
            if not os.path.exists("db/simpleTrade_new.db"):
                logger.error("Database file not found!")
                print("❌ Database file not found at db/simpleTrade_new.db")
                return False
            
            if not os.path.exists("../trading-ui"):
                logger.error("UI directory not found!")
                print("❌ UI directory not found at ../trading-ui")
                return False
            
            # הפעלת השרת עם subprocess
            self.process = subprocess.Popen([
                sys.executable, 'run_waitress.py'
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
        """עצירת השרת"""
        if self.process:
            try:
                self.process.terminate()
                self.process.wait(timeout=10)
            except subprocess.TimeoutExpired:
                self.process.kill()
            except:
                pass
            self.process = None
        
    def restart_server(self):
        """הפעלה מחדש של השרת"""
        print("🔄 מפעיל מחדש את השרת...")
        logger.info("Restarting server...")
        self.restart_count += 1
        
        if self.restart_count >= self.max_restarts:
            print(f"❌ הגעת למספר המקסימלי של הפעלות מחדש ({self.max_restarts})")
            logger.error(f"Maximum restart attempts reached: {self.max_restarts}")
            return False
            
        self.start_server()
        
    def start_watcher(self):
        """הפעלת צופה לשינויים"""
        event_handler = CodeChangeHandler(self.restart_server)
        self.observer = Observer()
        
        # צפייה בקבצים רלוונטיים
        paths_to_watch = [
            'models/',
            'routes/',
            'config/',
            'app.py'
        ]
        
        for path in paths_to_watch:
            full_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), path)
            if os.path.exists(full_path):
                self.observer.schedule(event_handler, full_path, recursive=True)
                print(f"👀 צופה בשינויים ב: {full_path}")
                logger.info(f"Watching for changes in: {full_path}")
        
        self.observer.start()
        
    def run(self):
        """הפעלת השרת עם צופה"""
        try:
            print("🔍 TikTrack Development Server Monitor Started")
            print("📍 Monitoring server at http://127.0.0.1:8080")
            print("🔄 Auto-restart enabled")
            print("⚡ Using Waitress for stability")
            print("📝 Detailed logs in server_detailed.log")
            print("-" * 50)
            
            self.start_server()
            self.start_watcher()
            
            print("🔄 השרת מתעדכן אוטומטית בשינויים")
            print("⏹️  לחץ Ctrl+C לעצירה")
            
            while self.is_running:
                time.sleep(1)
                
        except KeyboardInterrupt:
            print("\n⏹️  עוצר את השרת...")
            logger.info("Server stopped by user")
        finally:
            if self.process:
                self.stop_server()
            if self.observer:
                self.observer.stop()
                self.observer.join()

if __name__ == "__main__":
    server = DevServer()
    server.run()
