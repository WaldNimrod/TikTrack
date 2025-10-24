#!/usr/bin/env python3
"""
Migration: Add Missing Value Color Variants
==========================================

הוספת 6 העדפות צבע חסרות:
- valuePositiveColorLight, valuePositiveColorDark
- valueNegativeColorLight, valueNegativeColorDark  
- valueNeutralColorLight, valueNeutralColorDark

Author: TikTrack Development Team
Date: 2025-01-23
"""

import sqlite3
import os
import sys
from datetime import datetime

def add_value_color_variants():
    """הוספת העדפות צבע חסרות לבסיס הנתונים"""
    
    # נתיב לבסיס הנתונים
    current_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(current_dir, "..", "db", "simpleTrade_new.db")
    
    if not os.path.exists(db_path):
        print(f"❌ Database not found: {db_path}")
        return False
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # בדיקה אם ההעדפות כבר קיימות
        cursor.execute('''
            SELECT preference_name FROM preference_types 
            WHERE preference_name IN (
                'valuePositiveColorLight', 'valuePositiveColorDark',
                'valueNegativeColorLight', 'valueNegativeColorDark',
                'valueNeutralColorLight', 'valueNeutralColorDark'
            )
        ''')
        existing = [row[0] for row in cursor.fetchall()]
        
        if existing:
            print(f"⚠️ Some preferences already exist: {existing}")
        
        # הוספת העדפות חסרות
        preferences_to_add = [
            {
                'name': 'valuePositiveColorLight',
                'group_id': 3,  # colors group
                'data_type': 'string',
                'description': 'צבע בהיר לערכים חיוביים',
                'default_value': '#e8f5e8',
                'is_required': False
            },
            {
                'name': 'valuePositiveColorDark',
                'group_id': 3,
                'data_type': 'string', 
                'description': 'צבע כהה לערכים חיוביים',
                'default_value': '#1e7e34',
                'is_required': False
            },
            {
                'name': 'valueNegativeColorLight',
                'group_id': 3,
                'data_type': 'string',
                'description': 'צבע בהיר לערכים שליליים',
                'default_value': '#fdeaea',
                'is_required': False
            },
            {
                'name': 'valueNegativeColorDark',
                'group_id': 3,
                'data_type': 'string',
                'description': 'צבע כהה לערכים שליליים', 
                'default_value': '#c82333',
                'is_required': False
            },
            {
                'name': 'valueNeutralColorLight',
                'group_id': 3,
                'data_type': 'string',
                'description': 'צבע בהיר לערכים ניטרליים',
                'default_value': '#f8f9fa',
                'is_required': False
            },
            {
                'name': 'valueNeutralColorDark',
                'group_id': 3,
                'data_type': 'string',
                'description': 'צבע כהה לערכים ניטרליים',
                'default_value': '#495057',
                'is_required': False
            }
        ]
        
        added_count = 0
        for pref in preferences_to_add:
            if pref['name'] not in existing:
                cursor.execute('''
                    INSERT INTO preference_types (
                        group_id, data_type, preference_name,
                        description, default_value, is_required, is_active
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                ''', (
                    pref['group_id'],
                    pref['data_type'],
                    pref['name'],
                    pref['description'],
                    pref['default_value'],
                    pref['is_required'],
                    True
                ))
                added_count += 1
                print(f"✅ Added: {pref['name']}")
            else:
                print(f"⏭️ Skipped: {pref['name']} (already exists)")
        
        conn.commit()
        conn.close()
        
        print(f"\n🎉 Migration completed successfully!")
        print(f"📊 Added {added_count} new preferences")
        print(f"⏰ Completed at: {datetime.now().isoformat()}")
        
        return True
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        if 'conn' in locals():
            conn.close()
        return False

if __name__ == '__main__':
    print("🚀 Starting Value Color Variants Migration...")
    print("=" * 50)
    
    success = add_value_color_variants()
    
    if success:
        print("\n✅ Migration completed successfully!")
        sys.exit(0)
    else:
        print("\n❌ Migration failed!")
        sys.exit(1)

