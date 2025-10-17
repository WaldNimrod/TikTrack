#!/usr/bin/env python3
"""
Add notification_mode to preference_types table
==============================================

סקריפט להוספת notification_mode לטבלת preference_types במסד הנתונים

Author: TikTrack Development Team
Date: January 2025
"""

import sqlite3
import os
import sys

def add_notification_mode():
    """הוסף notification_mode לטבלת preference_types"""
    
    # נתיב למסד הנתונים
    current_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(current_dir, "db", "simpleTrade_new.db")
    
    if not os.path.exists(db_path):
        print(f"❌ Database not found at: {db_path}")
        return False
    
    try:
        # התחבר למסד הנתונים
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # בדוק אם notification_mode כבר קיים
        cursor.execute("""
            SELECT COUNT(*) FROM preference_types 
            WHERE preference_name = 'notification_mode'
        """)
        
        exists = cursor.fetchone()[0] > 0
        
        if exists:
            print("✅ notification_mode already exists in preference_types")
            return True
        
        # מצא את group_id של notifications
        cursor.execute("""
            SELECT id FROM preference_groups 
            WHERE group_name = 'notifications'
        """)
        
        group_result = cursor.fetchone()
        if not group_result:
            print("❌ notifications group not found")
            return False
        
        group_id = group_result[0]
        
        # הוסף את notification_mode
        cursor.execute("""
            INSERT INTO preference_types (
                group_id, 
                data_type, 
                preference_name, 
                description, 
                constraints, 
                default_value, 
                is_required, 
                is_active,
                created_at,
                updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        """, (
            group_id,
            'string',
            'notification_mode',
            'מצב עבודה למערכת התראות - debug, development, work, silent',
            '{"allowed_values": ["debug", "development", "work", "silent"]}',
            'work',
            False,
            True
        ))
        
        # שמור שינויים
        conn.commit()
        
        print("✅ notification_mode added successfully to preference_types")
        print(f"   - Group ID: {group_id}")
        print("   - Data Type: string")
        print("   - Default Value: work")
        print("   - Allowed Values: debug, development, work, silent")
        
        return True
        
    except Exception as e:
        print(f"❌ Error adding notification_mode: {e}")
        return False
        
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    print("🔧 Adding notification_mode to preference_types...")
    success = add_notification_mode()
    
    if success:
        print("✅ Script completed successfully")
        sys.exit(0)
    else:
        print("❌ Script failed")
        sys.exit(1)
