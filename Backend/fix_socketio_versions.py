#!/usr/bin/env python3
"""
Socket.IO Version Fixer - TikTrack
=================================

סקריפט פשוט לתיקון אוטומטי של גרסאות Socket.IO
מריץ את הפקודות הנדרשות לתיקון הבעיה

שימוש:
    python3 fix_socketio_versions.py
"""

import sys
import subprocess
import os

def run_command(command, description):
    """הרצת פקודה עם תיאור"""
    print(f"🔧 {description}...")
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ {description} - הצליח")
            return True
        else:
            print(f"❌ {description} - נכשל")
            print(f"   שגיאה: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ {description} - שגיאה: {e}")
        return False

def main():
    """פונקציה ראשית"""
    print("🚀 TikTrack Socket.IO Version Fixer")
    print("=" * 40)
    
    # בדיקה שהשרת לא רץ
    print("🔍 בדיקה שהשרת לא רץ...")
    try:
        result = subprocess.run(["pgrep", "-f", "dev_server.py"], 
                              capture_output=True, text=True)
        if result.stdout.strip():
            print("⚠️ השרת רץ - עצור אותו תחילה")
            print("   הרץ: pkill -f dev_server.py")
            return 1
    except:
        pass
    
    # תיקון גרסאות מתקדמות
    commands = [
        ("pip install Flask-SocketIO==5.3.6 python-socketio==5.8.0 python-engineio==4.7.1 --force-reinstall", 
         "התקנת גרסאות Socket.IO מתקדמות"),
        ("python3 check_socketio_compatibility.py", 
         "בדיקת תאימות גרסאות מתקדמות")
    ]
    
    success = True
    for command, description in commands:
        if not run_command(command, description):
            success = False
            break
    
    print("\n📊 תוצאות:")
    print("=" * 20)
    
    if success:
        print("✅ תיקון הושלם בהצלחה")
        print("🚀 כעת תוכל להריץ את השרת")
        return 0
    else:
        print("❌ תיקון נכשל")
        print("🔧 נסה להריץ את הפקודות ידנית")
        return 1

if __name__ == "__main__":
    sys.exit(main())
