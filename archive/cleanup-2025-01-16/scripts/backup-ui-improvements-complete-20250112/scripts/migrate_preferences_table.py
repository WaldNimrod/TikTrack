#!/usr/bin/env python3
"""
Preferences Table Migration Script - TikTrack
==============================================

מיגרציה בטוחה של טבלת user_preferences_v3 ל-user_preferences

Author: TikTrack Development Team
Date: September 30, 2025
"""

import sqlite3
import os
import shutil
from datetime import datetime
import json

def create_backup():
    """יצירת גיבוי לפני המיגרציה"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = f"./db/simpleTrade_new_backup_preferences_migration_{timestamp}.db"
    
    shutil.copy2("./db/simpleTrade_new.db", backup_path)
    print(f"✅ גיבוי נוצר: {backup_path}")
    return backup_path

def check_table_exists(cursor, table_name):
    """בדיקה אם טבלה קיימת"""
    cursor.execute("""
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name=?
    """, (table_name,))
    return cursor.fetchone() is not None

def migrate_preferences_table():
    """מיגרציה של טבלת ההעדפות"""
    db_path = "./db/simpleTrade_new.db"
    
    print("🔄 מתחיל מיגרציה של טבלת user_preferences...")
    
    # יצירת גיבוי
    backup_path = create_backup()
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # בדיקה אם הטבלה החדשה כבר קיימת
        if check_table_exists(cursor, 'user_preferences'):
            print("⚠️  הטבלה user_preferences כבר קיימת!")
            response = input("האם להמשיך ולהחליף אותה? (y/N): ")
            if response.lower() != 'y':
                print("❌ המיגרציה בוטלה")
                return False
            
            # מחיקת הטבלה הקיימת
            cursor.execute("DROP TABLE IF EXISTS user_preferences")
            print("🗑️  הטבלה הישנה נמחקה")
        
        # יצירת הטבלה החדשה עם אותו מבנה
        cursor.execute("""
            CREATE TABLE user_preferences (
                id INTEGER,
                user_id INTEGER NOT NULL,
                profile_id INTEGER NOT NULL,
                preference_id INTEGER NOT NULL,
                saved_value TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (id),
                FOREIGN KEY (preference_id) REFERENCES preference_types(id),
                FOREIGN KEY (user_id, profile_id) REFERENCES preference_profiles(user_id, profile_name)
            )
        """)
        print("✅ נוצרה הטבלה החדשה user_preferences")
        
        # העתקת הנתונים
        cursor.execute("""
            INSERT INTO user_preferences 
            (id, user_id, profile_id, preference_id, saved_value, created_at, updated_at)
            SELECT id, user_id, profile_id, preference_id, saved_value, created_at, updated_at
            FROM user_preferences_v3
        """)
        
        copied_records = cursor.rowcount
        print(f"✅ הועתקו {copied_records} רשומות")
        
        # יצירת אינדקסים
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id 
            ON user_preferences(user_id)
        """)
        
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_user_preferences_profile_id 
            ON user_preferences(profile_id)
        """)
        
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_user_preferences_preference_id 
            ON user_preferences(preference_id)
        """)
        
        print("✅ נוצרו אינדקסים")
        
        # בדיקת תקינות
        cursor.execute("SELECT COUNT(*) FROM user_preferences")
        new_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM user_preferences_v3")
        old_count = cursor.fetchone()[0]
        
        if new_count == old_count:
            print(f"✅ בדיקת תקינות עברה: {new_count} רשומות בשתי הטבלאות")
        else:
            raise Exception(f"❌ שגיאה בבדיקת תקינות: {new_count} vs {old_count}")
        
        # שמירת השינויים
        conn.commit()
        print("✅ המיגרציה הושלמה בהצלחה!")
        
        return True
        
    except Exception as e:
        print(f"❌ שגיאה במיגרציה: {e}")
        conn.rollback()
        return False
        
    finally:
        conn.close()

def verify_migration():
    """בדיקת תקינות המיגרציה"""
    print("\n🔍 בודק תקינות המיגרציה...")
    
    try:
        conn = sqlite3.connect("./db/simpleTrade_new.db")
        cursor = conn.cursor()
        
        # בדיקת קיום הטבלה החדשה
        if not check_table_exists(cursor, 'user_preferences'):
            print("❌ הטבלה user_preferences לא קיימת!")
            return False
        
        # בדיקת מספר רשומות
        cursor.execute("SELECT COUNT(*) FROM user_preferences")
        count = cursor.fetchone()[0]
        print(f"✅ מספר רשומות בטבלה החדשה: {count}")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ שגיאה בבדיקת תקינות: {e}")
        return False

if __name__ == "__main__":
    print("🚀 מתחיל מיגרציה של טבלת user_preferences")
    print("=" * 50)
    
    success = migrate_preferences_table()
    
    if success:
        verify_migration()
        print("\n🎉 המיגרציה הושלמה בהצלחה!")
        print("📝 עכשיו צריך לעדכן את PreferencesService להשתמש בטבלה החדשה")
    else:
        print("\n❌ המיגרציה נכשלה!")
        print("🔄 השתמש בגיבוי כדי לשחזר את המצב הקודם")
