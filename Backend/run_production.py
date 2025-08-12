#!/usr/bin/env python3
"""
סקריפט הפעלה עם Gunicorn לשרת יציב יותר
"""

import os
import sys
import subprocess

def main():
    """הפעלת השרת עם Gunicorn"""
    print("🚀 מפעיל את שרת SimpleTrade עם Gunicorn...")
    
    # הגדרות Gunicorn
    gunicorn_config = [
        "gunicorn",
        "--bind", "127.0.0.1:5002",
        "--workers", "2",  # מספר workers
        "--timeout", "30",  # timeout ארוך
        "--keep-alive", "5",  # keep-alive
        "--max-requests", "1000",  # restart כל 1000 בקשות
        "--max-requests-jitter", "100",  # jitter למניעת restart סינכרוני
        "--preload",  # טעינה מקדימה
        "--access-logfile", "-",  # log למוניטור
        "--error-logfile", "-",  # error log למוניטור
        "app:app"  # המודול והאפליקציה
    ]
    
    try:
        subprocess.run(gunicorn_config, check=True)
    except KeyboardInterrupt:
        print('\n🛑 השרת נסגר על ידי המשתמש')
    except subprocess.CalledProcessError as e:
        print(f'❌ שגיאה בהפעלת השרת: {e}')
        sys.exit(1)
    except FileNotFoundError:
        print('❌ Gunicorn לא מותקן. התקן עם: pip install gunicorn')
        sys.exit(1)

if __name__ == "__main__":
    main()
