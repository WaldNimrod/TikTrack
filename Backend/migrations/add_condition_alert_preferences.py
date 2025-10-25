#!/usr/bin/env python3
"""
Migration: Add condition alert preferences
Adds condition_alert_cooldown_minutes preference for controlling alert reactivation timing
"""

import sqlite3
import os
import sys
from pathlib import Path

def get_database_path():
    """Get the database path"""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.dirname(current_dir)
    db_path = os.path.join(backend_dir, "db", "simpleTrade_new.db")
    return db_path

def upgrade(conn: sqlite3.Connection):
    """Add condition alert preferences"""
    cursor = conn.cursor()
    
    try:
        # First, get or create the conditions preference group
        cursor.execute("""
            SELECT id FROM preference_groups WHERE group_name = 'conditions'
        """)
        group_result = cursor.fetchone()
        
        if not group_result:
            cursor.execute("""
                INSERT INTO preference_groups (group_name, description)
                VALUES ('conditions', 'העדפות למערכת התנאים והתראות')
            """)
            group_id = cursor.lastrowid
            print("✅ Created conditions preference group")
        else:
            group_id = group_result[0]
            print("✅ Found existing conditions preference group")
        
        # Add condition_alert_cooldown_minutes preference
        cursor.execute("""
            INSERT OR IGNORE INTO preference_types 
            (group_id, data_type, preference_name, description, constraints, default_value, is_required, is_active)
            VALUES 
            (?, 'integer', 'condition_alert_cooldown_minutes', 
             'זמן המתנה מינימלי בין הפעלות חוזרות של אותה התראה (בדקות)', 
             '{"min": 1, "max": 1440}', '60', 0, 1)
        """, (group_id,))
        print("✅ condition_alert_cooldown_minutes preference type added")
        
        # Add condition_alert_auto_create preference
        cursor.execute("""
            INSERT OR IGNORE INTO preference_types 
            (group_id, data_type, preference_name, description, constraints, default_value, is_required, is_active)
            VALUES 
            (?, 'boolean', 'condition_alert_auto_create', 
             'צור התראות אוטומטית עבור תנאים חדשים', 
             '{"type": "boolean"}', 'true', 0, 1)
        """, (group_id,))
        print("✅ condition_alert_auto_create preference type added")
        
        # Add condition_alert_show_condition_info preference
        cursor.execute("""
            INSERT OR IGNORE INTO preference_types 
            (group_id, data_type, preference_name, description, constraints, default_value, is_required, is_active)
            VALUES 
            (?, 'boolean', 'condition_alert_show_condition_info', 
             'הצג מידע על התנאי בהתראות שנוצרו ממערכת התנאים', 
             '{"type": "boolean"}', 'true', 0, 1)
        """, (group_id,))
        print("✅ condition_alert_show_condition_info preference type added")
        
        conn.commit()
        print("✅ Condition alert preferences migration completed successfully")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Migration failed: {str(e)}")
        raise

def downgrade(conn: sqlite3.Connection):
    """Remove condition alert preferences"""
    cursor = conn.cursor()
    
    try:
        # Remove the preference types
        cursor.execute("""
            DELETE FROM preference_types 
            WHERE preference_name IN (
                'condition_alert_cooldown_minutes',
                'condition_alert_auto_create',
                'condition_alert_show_condition_info'
            )
        """)
        
        conn.commit()
        print("✅ Condition alert preferences removed")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Downgrade failed: {str(e)}")
        raise

def main():
    """Run the migration"""
    db_path = get_database_path()
    
    if not os.path.exists(db_path):
        print(f"❌ Database not found at: {db_path}")
        return False
    
    try:
        conn = sqlite3.connect(db_path)
        upgrade(conn)
        conn.close()
        return True
    except Exception as e:
        print(f"❌ Migration failed: {str(e)}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
