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
            print(f"🔍 Found TikTrack service on {host}:{target_port}")
            return host, target_port
    
    return None

def check_server_health() -> dict:
    """
    Complete server health check - adapted for TikTrack
    
    Returns:
        dict: Detailed server health information including:
            - running (bool): Whether the server is running
            - host (str): Server address
            - port (int): Server port
            - response_time (float): Response time
            - status (str): Server status
            - server_type (str): Server type
            - error (str): Error message if any
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
    
    # Find running server
    server_info = find_running_server()
    if not server_info:
        result["error"] = "No running TikTrack server found on port 8080"
        return result
    
    host, port = server_info
    result["host"] = host
    result["port"] = port
    
    # Check server response
    start_time = time.time()
    url = f"http://{host}:{port}"
    
    # Try TikTrack endpoints
    endpoints = [
        "/api/health",  # main health endpoint
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
            
            # Identify server type
            if "database" in response and "connected" in response:
                result["server_type"] = "TikTrack API Server"
            else:
                result["server_type"] = "Web Server"
            break
    
    if not result["running"]:
        result["error"] = f"Server on {host}:{port} is not responding"
    
    return result

def get_process_info() -> list:
    """
    Returns information about running Python processes - adapted for TikTrack
    
    Returns:
        Tuple[list, list]: (TikTrack processes, other Python processes)
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
        return [], [f"Error getting process information: {e}"]

def check_monitoring_system() -> dict:
    """
    Checks the monitoring system
    
    Returns:
        dict: Information about the monitoring system:
            - monitor_process_running (bool): Whether monitoring process is running
            - log_files_exist (bool): Whether log files exist
    """
    monitoring_info = {
        "monitored_server_running": False,
        "monitor_process_running": False,
        "log_files_exist": False
    }
    
    # Check if there's a monitoring process
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
    
    # Check log files
    log_files = ['server_detailed.log', 'server.log']
    for log_file in log_files:
        if os.path.exists(log_file):
            monitoring_info["log_files_exist"] = True
            break
    
    return monitoring_info

def main():
    """
    Main function for server health check - adapted for TikTrack
    
    Returns:
        dict: Complete check results
    
    Note:
        - Displays detailed server information
        - Provides troubleshooting recommendations
        - Suitable for use in Cursor
    """
    print("🏥 Checking TikTrack server health...")
    
    # Check monitoring system
    monitoring = check_monitoring_system()
    if monitoring["monitor_process_running"]:
        print("🔄 Monitoring system active")
    if monitoring["log_files_exist"]:
        print("📝 Log files exist")
    
    # Check processes
    tiktrack_processes, other_processes = get_process_info()
    if tiktrack_processes:
        print("📋 Running TikTrack processes:")
        for proc in tiktrack_processes:
            print(f"  🟢 {proc}")
    
    if other_processes:
        print("📋 Other Python processes:")
        for proc in other_processes:
            print(f"  ⚪ {proc}")
    
    # Check server health
    health = check_server_health()
    
    print(f"\n📊 Check results:")
    print(f"  🟢 Running: {health['running']}")
    if health['host'] and health['port']:
        print(f"  🌐 Address: {health['host']}:{health['port']}")
    if health['server_type']:
        print(f"  🖥️  Server type: {health['server_type']}")
    if health['response_time']:
        print(f"  ⏱️  Response time: {health['response_time']}s")
    if health['status']:
        print(f"  📈 Status: {health['status']}")
    if health['error']:
        print(f"  ❌ Error: {health['error']}")
    
    # Recommendations
    if not health['running']:
        print(f"\n💡 Recommendations:")
        print(f"  1. Run: ./run_monitored.sh")
        print(f"  2. Or: ./run_stable.sh")
        print(f"  3. Check: lsof -i :8080")
    
    return health

if __name__ == "__main__":
    health = main()
    exit(0 if health['running'] else 1)
