#!/usr/bin/env python3
"""
Socket.IO Compatibility Checker - TikTrack
==========================================

סקריפט פשוט לבדיקת תאימות Socket.IO
מריץ בדיקה מהירה לוודא שהגרסאות תואמות

שימוש:
    python3 check_socketio_compatibility.py
"""

import sys
import subprocess
import requests
import json

def check_versions():
    """בדיקת גרסאות מותקנות"""
    print("🔍 בדיקת גרסאות Socket.IO...")
    
    try:
        # בדיקת גרסאות Python packages
        result = subprocess.run([sys.executable, '-m', 'pip', 'list'], 
                              capture_output=True, text=True)
        
        packages = {}
        for line in result.stdout.split('\n'):
            if any(keyword in line.lower() for keyword in ['socketio', 'flask-socketio', 'python-engineio', 'simple-websocket']):
                parts = line.split()
                if len(parts) >= 2:
                    packages[parts[0]] = parts[1]
        
        print("📦 גרסאות מותקנות:")
        for package, version in packages.items():
            print(f"   {package}: {version}")
        
        # בדיקת גרסאות מתקדמות
        expected_versions = {
            'Flask-SocketIO': '5.3.6',
            'python-socketio': '5.8.0',
            'python-engineio': '4.7.1'
        }
        
        print("\n🔍 בדיקת גרסאות מתקדמות:")
        for package, expected_version in expected_versions.items():
            if package in packages:
                if packages[package] == expected_version:
                    print(f"   ✅ {package}: {packages[package]} (תואם)")
                else:
                    print(f"   ❌ {package}: {packages[package]} (צפוי: {expected_version})")
            else:
                print(f"   ⚠️ {package}: לא מותקן")
        
        return packages
        
    except Exception as e:
        print(f"❌ שגיאה בבדיקת גרסאות: {e}")
        return {}

def test_socketio_connection():
    """בדיקת חיבור Socket.IO"""
    print("\n🔌 בדיקת חיבור Socket.IO...")
    
    try:
        # בדיקת endpoint
        response = requests.get("http://localhost:8080/socket.io/", timeout=5)
        
        if "unsupported version" in response.text.lower():
            print("❌ בעיית תאימות גרסאות")
            return False
        elif response.status_code == 200:
            print("✅ חיבור Socket.IO תקין")
            return True
        else:
            print(f"⚠️ תגובה לא צפויה: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ השרת לא זמין - הרץ את השרת תחילה")
        return False
    except Exception as e:
        print(f"❌ שגיאה בבדיקת חיבור: {e}")
        return False

def main():
    """פונקציה ראשית"""
    print("🚀 TikTrack Socket.IO Compatibility Checker")
    print("=" * 50)
    
    # בדיקת גרסאות
    packages = check_versions()
    
    # בדיקת חיבור
    connection_ok = test_socketio_connection()
    
    print("\n📊 תוצאות:")
    print("=" * 20)
    
    if connection_ok:
        print("✅ הכל תקין - Socket.IO עובד")
        return 0
    else:
        print("❌ יש בעיה - בדוק את הגרסאות")
        print("\n🔧 פתרונות אפשריים:")
        print("1. הרץ: pip install -r requirements.txt --force-reinstall")
        print("2. בדוק שהשרת רץ: python3 Backend/dev_server.py")
        print("3. בדוק את גרסת הלקוח ב-realtime-notifications-client.js")
        return 1

if __name__ == "__main__":
    sys.exit(main())
