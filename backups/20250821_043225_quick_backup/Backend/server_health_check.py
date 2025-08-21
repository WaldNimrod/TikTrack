#!/usr/bin/env python3
"""
Server Health Check Utility - Enhanced Version
בודק איזה שרת רץ ואיזה פורט הוא משתמש
משתמש במערכת המוניטורינג הקיימת

📋 מטרה:
- לפתור בעיה של בדיקות curl שנתקעות בלופים
- לספק בדיקה מפורטת של בריאות השרת
- לזהות מערכת מוניטורינג ותהליכים
- לתת המלצות אוטומטיות לפתרון בעיות

🚀 שימוש:
- python3 server_health_check.py - בדיקה מפורטת
- main() - פונקציה לשימוש בקוד

📝 היסטוריה:
- נוצר ב-2024 לפתרון בעיות ביצועים ב-Cursor
- מחליף בדיקות curl מורכבות שנתקעות
- מותאם לפרויקט TikTrack (פורט 8080)
- משתמש במערכת המוניטורינג הקיימת

🔧 תלות:
- requests
- socket
- subprocess
- time
- json
- os
- typing

📊 פלט:
- מידע על תהליכי TikTrack
- סטטוס מערכת מוניטורינג
- זמן תגובה
- המלצות לפתרון בעיות
"""

import requests
import socket
import subprocess
import time
import json
import os
from typing import Optional, Tuple

def check_port_open(host: str, port: int, timeout: float = 1.0) -> bool:
    """
    בודק אם פורט פתוח
    
    Args:
        host (str): כתובת השרת
        port (int): מספר הפורט
        timeout (float): זמן timeout בשניות
    
    Returns:
        bool: True אם הפורט פתוח, False אחרת
    """
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(timeout)
        result = sock.connect_ex((host, port))
        sock.close()
        return result == 0
    except Exception:
        return False

def check_server_response(url: str, timeout: float = 2.0) -> Tuple[bool, Optional[str]]:
    """
    בודק תגובה מהשרת
    
    Args:
        url (str): כתובת URL לבדיקה
        timeout (float): זמן timeout בשניות
    
    Returns:
        Tuple[bool, Optional[str]]: (הצלחה, תגובה או שגיאה)
    """
    try:
        response = requests.get(url, timeout=timeout)
        if response.status_code == 200:
            return True, response.text[:100]  # 100 תווים ראשונים
        return False, f"Status: {response.status_code}"
    except requests.exceptions.RequestException as e:
        return False, str(e)

def find_running_server() -> Optional[Tuple[str, int]]:
    """
    מוצא איזה שרת רץ ואיזה פורט - מותאם לפרויקט TikTrack
    
    Returns:
        Optional[Tuple[str, int]]: (host, port) או None אם לא נמצא
    
    Note:
        - TikTrack תמיד רץ על פורט 8080
        - בודק localhost ו-127.0.0.1
    """
    # TikTrack תמיד רץ על פורט 8080
    target_port = 8080
    hosts = ['localhost', '127.0.0.1']
    
    for host in hosts:
        if check_port_open(host, target_port):
            print(f"🔍 נמצא שירות TikTrack על {host}:{target_port}")
            return host, target_port
    
    return None

def check_server_health() -> dict:
    """
    בדיקה מלאה של בריאות השרת - מותאמת ל-TikTrack
    
    Returns:
        dict: מידע מפורט על בריאות השרת כולל:
            - running (bool): האם השרת רץ
            - host (str): כתובת השרת
            - port (int): פורט השרת
            - response_time (float): זמן תגובה
            - status (str): סטטוס השרת
            - server_type (str): סוג השרת
            - error (str): הודעת שגיאה אם יש
    """
    result = {
        "running": False,
        "host": None,
        "port": None,
        "response_time": None,
        "status": "unknown",
        "error": None,
        "server_type": None
    }
    
    # מצא שרת רץ
    server_info = find_running_server()
    if not server_info:
        result["error"] = "לא נמצא שרת TikTrack רץ על פורט 8080"
        return result
    
    host, port = server_info
    result["host"] = host
    result["port"] = port
    
    # בדוק תגובה מהשרת
    start_time = time.time()
    url = f"http://{host}:{port}"
    
    # נסה endpoints של TikTrack
    endpoints = [
        "/api/health",  # endpoint בריאות ראשי
        "/api/v1/health",
        "/health",
        "/"  # fallback
    ]
    
    for endpoint in endpoints:
        full_url = url + endpoint
        success, response = check_server_response(full_url)
        if success:
            result["running"] = True
            result["response_time"] = round(time.time() - start_time, 3)
            result["status"] = "healthy"
            result["endpoint"] = endpoint
            result["response_preview"] = response
            
            # זיהוי סוג השרת
            if "database" in response and "connected" in response:
                result["server_type"] = "TikTrack API Server"
            else:
                result["server_type"] = "Web Server"
            break
    
    if not result["running"]:
        result["error"] = f"השרת על {host}:{port} לא מגיב"
    
    return result

def get_process_info() -> list:
    """
    מחזיר מידע על תהליכי Python רצים - מותאם ל-TikTrack
    
    Returns:
        Tuple[list, list]: (תהליכי TikTrack, תהליכי Python אחרים)
    """
    try:
        result = subprocess.run(
            ["ps", "aux"], 
            capture_output=True, 
            text=True, 
            timeout=5
        )
        
        processes = []
        tiktrack_processes = []
        
        for line in result.stdout.split('\n'):
            if 'python' in line.lower():
                if any(keyword in line.lower() for keyword in ['app.py', 'monitor', 'waitress', 'tiktrack']):
                    tiktrack_processes.append(line.strip())
                else:
                    processes.append(line.strip())
        
        return tiktrack_processes, processes
    except Exception as e:
        return [], [f"שגיאה בקבלת מידע על תהליכים: {e}"]

def check_monitoring_system() -> dict:
    """
    בודק את מערכת המוניטורינג
    
    Returns:
        dict: מידע על מערכת המוניטורינג:
            - monitor_process_running (bool): האם תהליך מוניטורינג רץ
            - log_files_exist (bool): האם קבצי לוג קיימים
    """
    monitoring_info = {
        "monitored_server_running": False,
        "monitor_process_running": False,
        "log_files_exist": False
    }
    
    # בדוק אם יש תהליך מוניטורינג
    try:
        result = subprocess.run(
            ["ps", "aux"], 
            capture_output=True, 
            text=True, 
            timeout=5
        )
        
        for line in result.stdout.split('\n'):
            if 'monitor_server.py' in line:
                monitoring_info["monitor_process_running"] = True
                break
    except:
        pass
    
    # בדוק קבצי לוג
    log_files = ['server_detailed.log', 'server.log']
    for log_file in log_files:
        if os.path.exists(log_file):
            monitoring_info["log_files_exist"] = True
            break
    
    return monitoring_info

def main():
    """
    פונקציה ראשית לבדיקת בריאות השרת - מותאמת ל-TikTrack
    
    Returns:
        dict: תוצאות הבדיקה המלאה
    
    Note:
        - מציג מידע מפורט על השרת
        - נותן המלצות לפתרון בעיות
        - מתאים לשימוש ב-Cursor
    """
    print("🏥 בודק בריאות שרת TikTrack...")
    
    # בדוק מערכת מוניטורינג
    monitoring = check_monitoring_system()
    if monitoring["monitor_process_running"]:
        print("🔄 מערכת מוניטורינג פעילה")
    if monitoring["log_files_exist"]:
        print("📝 קבצי לוג קיימים")
    
    # בדוק תהליכים
    tiktrack_processes, other_processes = get_process_info()
    if tiktrack_processes:
        print("📋 תהליכי TikTrack רצים:")
        for proc in tiktrack_processes:
            print(f"  🟢 {proc}")
    
    if other_processes:
        print("📋 תהליכי Python אחרים:")
        for proc in other_processes:
            print(f"  ⚪ {proc}")
    
    # בדוק בריאות השרת
    health = check_server_health()
    
    print(f"\n📊 תוצאות בדיקה:")
    print(f"  🟢 רץ: {health['running']}")
    if health['host'] and health['port']:
        print(f"  🌐 כתובת: {health['host']}:{health['port']}")
    if health['server_type']:
        print(f"  🖥️  סוג שרת: {health['server_type']}")
    if health['response_time']:
        print(f"  ⏱️  זמן תגובה: {health['response_time']}s")
    if health['status']:
        print(f"  📈 סטטוס: {health['status']}")
    if health['error']:
        print(f"  ❌ שגיאה: {health['error']}")
    
    # המלצות
    if not health['running']:
        print(f"\n💡 המלצות:")
        print(f"  1. הפעל: ./run_monitored.sh")
        print(f"  2. או: ./run_stable.sh")
        print(f"  3. בדוק: lsof -i :8080")
    
    return health

if __name__ == "__main__":
    health = main()
    exit(0 if health['running'] else 1)
