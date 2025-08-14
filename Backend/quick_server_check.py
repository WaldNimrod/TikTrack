#!/usr/bin/env python3
"""
Quick Server Check - פונקציה מהירה לבדיקת זמינות השרת
לשימוש ב-Cursor במקום curl מורכב

📋 מטרה:
- לפתור בעיה של בדיקות curl שנתקעות בלופים
- לספק בדיקה מהירה ואמינה של זמינות השרת
- להתאים לשימוש יומיומי ב-Cursor

🚀 שימוש:
- python3 quick_server_check.py - בדיקה מהירה
- quick_server_check() - פונקציה לשימוש בקוד

📝 היסטוריה:
- נוצר ב-2024 לפתרון בעיות ביצועים ב-Cursor
- מחליף בדיקות curl מורכבות שנתקעות
- מותאם לפרויקט TikTrack (פורט 8080)

🔧 תלות:
- requests
- socket
- time
"""

import requests
import socket
import time

def quick_server_check(host='localhost', port=8080, timeout=2.0):
    """
    בדיקה מהירה של זמינות השרת
    
    Args:
        host (str): כתובת השרת (ברירת מחדל: localhost)
        port (int): פורט השרת (ברירת מחדל: 8080 - TikTrack)
        timeout (float): זמן timeout בשניות (ברירת מחדל: 2.0)
    
    Returns:
        bool: True אם השרת זמין, False אחרת
    
    Note:
        - בדיקה מהירה של פורט לפני HTTP request
        - timeout קצר למניעת לופים
        - מותאם לפרויקט TikTrack
    """
    try:
        # בדיקה מהירה של הפורט
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1.0)
        result = sock.connect_ex((host, port))
        sock.close()
        
        if result != 0:
            return False
        
        # בדיקה מהירה של התגובה
        response = requests.get(f"http://{host}:{port}/api/health", timeout=timeout)
        return response.status_code == 200
        
    except Exception:
        return False

def server_status():
    """
    מחזיר סטטוס מפורט של השרת
    
    Returns:
        dict: מידע על סטטוס השרת כולל:
            - running (bool): האם השרת רץ
            - status (str): סטטוס השרת
            - database (str): סטטוס בסיס הנתונים
            - timestamp (str): זמן הבדיקה
            - error (str): הודעת שגיאה אם יש
    
    Note:
        - משתמש ב-endpoint /api/health של TikTrack
        - מחזיר JSON response מהשרת
        - timeout של 2 שניות למניעת לופים
    """
    try:
        response = requests.get("http://localhost:8080/api/health", timeout=2.0)
        if response.status_code == 200:
            data = response.json()
            return {
                "running": True,
                "status": data.get("status", "unknown"),
                "database": data.get("database", "unknown"),
                "timestamp": data.get("timestamp", "unknown")
            }
        else:
            return {"running": False, "error": f"Status: {response.status_code}"}
    except Exception as e:
        return {"running": False, "error": str(e)}

if __name__ == "__main__":
    # בדיקה מהירה
    if quick_server_check():
        print("✅ השרת זמין")
        status = server_status()
        print(f"📊 סטטוס: {status}")
    else:
        print("❌ השרת לא זמין")
        print("💡 נסה: ./run_monitored.sh או ./run_stable.sh")
