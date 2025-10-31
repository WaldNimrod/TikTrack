#!/usr/bin/env python3
"""
Drop user_preferences_v3 Table Migration
========================================

מחיקת טבלת user_preferences_v3 הישנה - לא נמצא בשימוש
הטבלה user_preferences היא הטבלה הפעילה

Author: TikTrack Development Team
Date: January 31, 2025
"""

import sqlite3
import os
import sys
from datetime import datetime

# הוסף את הנתיב למודולים
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def drop_user_preferences_v3_table():
    """מחיקת טבלת user_preferences_v3"""
    
    # נתיב לבסיס הנתונים
    db_path = os.path.join(os.path.dirname(__file__), '..', 'db', 'simpleTrade_new.db')
    
    if not os.path.exists(db_path):
        print(f"❌ בסיס הנתונים לא נמצא: {db_path}")
        return False
    
    try:
        # חיבור לבסיס הנתונים
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("🚀 מתחיל מחיקת טבלת user_preferences_v3...")
        print(f"📁 Database: {db_path}")
        print("=" * 60)
        
        # ============================================================
        # שלב 1: בדיקת מצב נוכחי
        # ============================================================
        print("\n📊 שלב 1: בדיקת מצב נוכחי...")
        
        # בדיקה אם הטבלה קיימת
        cursor.execute('''
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name='user_preferences_v3'
        ''')
        table_exists = cursor.fetchone()
        
        if not table_exists:
            print("✅ הטבלה user_preferences_v3 כבר לא קיימת")
            return True
        
        # בדיקה כמה שורות יש
        cursor.execute('SELECT COUNT(*) FROM user_preferences_v3')
        count = cursor.fetchone()[0]
        print(f"  שורות בטבלה: {count}")
        
        if count > 0:
            print(f"⚠️  אזהרה: יש {count} שורות בטבלה!")
            response = input("להמשיך למחיקה? (yes/no): ")
            if response.lower() != 'yes':
                print("❌ בוטל")
                return False
        
        # ============================================================
        # שלב 2: מחיקת indexes
        # ============================================================
        print("\n🗑️  שלב 2: מחיקת indexes...")
        
        cursor.execute("SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='user_preferences_v3'")
        indexes = cursor.fetchall()
        
        for (index_name,) in indexes:
            cursor.execute(f"DROP INDEX IF EXISTS {index_name}")
            print(f"  ✓ נמחק index: {index_name}")
        
        # ============================================================
        # שלב 3: מחיקת הטבלה
        # ============================================================
        print("\n🗑️  שלב 3: מחיקת הטבלה...")
        
        cursor.execute('DROP TABLE IF EXISTS user_preferences_v3')
        print("  ✓ נמחקה הטבלה user_preferences_v3")
        
        # Commit changes
        conn.commit()
        
        print("\n✅ המחיקה הושלמה בהצלחה!")
        print("=" * 60)
        
        # בדיקת final
        cursor.execute('''
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name='user_preferences_v3'
        ''')
        still_exists = cursor.fetchone()
        
        if still_exists:
            print("❌ הטבלה עדיין קיימת - משהו השתבש!")
            return False
        
        print("✅ הטבלה נמחקה בהצלחה מהמסד נתונים")
        
        return True
        
    except Exception as e:
        print(f"❌ שגיאה: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    finally:
        conn.close()


if __name__ == '__main__':
    success = drop_user_preferences_v3_table()
    sys.exit(0 if success else 1)

