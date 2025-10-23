#!/usr/bin/env python3
"""
Migration Template for New Preferences
======================================

Usage: 
1. Copy this file: cp _template_preference.py add_[your_preference].py
2. Modify the preferences list below
3. Run: python3 add_[your_preference].py

Author: TikTrack Development Team
Date: 2025-01-23
"""

import sqlite3
import os
import sys
from datetime import datetime

def add_new_preferences():
    """
    הוספת העדפות חדשות לבסיס הנתונים
    
    Preference Groups:
    - 1: General (הגדרות כלליות)
    - 2: Filters (פילטרים)
    - 3: Colors (צבעים)
    - 4: Notifications (התראות)
    - 5: Display (תצוגה)
    
    Data Types:
    - string: מחרוזת
    - number: מספר
    - boolean: בוליאני
    - json: JSON object
    """
    
    # === MODIFY THIS LIST WITH YOUR NEW PREFERENCES ===
    preferences_to_add = [
        {
            'name': 'myNewPreference',          # שם ההעדפה (camelCase)
            'group_id': 1,                       # מזהה קבוצה (1-5)
            'data_type': 'string',               # סוג נתונים (string/number/boolean/json)
            'description': 'תיאור ההעדפה',      # תיאור בעברית
            'default_value': 'defaultValue',     # ערך ברירת מחדל
            'is_required': False,                # האם חובה?
            'constraints': None                  # constraints (JSON string) - אופציונלי
        },
        # Add more preferences here...
    ]
    # ===================================================
    
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
        pref_names = [p['name'] for p in preferences_to_add]
        placeholders = ','.join('?' * len(pref_names))
        
        cursor.execute(f'''
            SELECT preference_name FROM preference_types 
            WHERE preference_name IN ({placeholders})
        ''', pref_names)
        
        existing = [row[0] for row in cursor.fetchall()]
        
        if existing:
            print(f"⚠️ Some preferences already exist: {existing}")
        
        # הוספת העדפות חסרות
        added_count = 0
        for pref in preferences_to_add:
            if pref['name'] not in existing:
                cursor.execute('''
                    INSERT INTO preference_types (
                        group_id, data_type, preference_name,
                        description, default_value, constraints,
                        is_required, is_active
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    pref['group_id'],
                    pref['data_type'],
                    pref['name'],
                    pref['description'],
                    pref['default_value'],
                    pref.get('constraints'),
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
    print("🚀 Starting Preferences Migration...")
    print("=" * 50)
    
    success = add_new_preferences()
    
    if success:
        print("\n✅ Migration completed successfully!")
        print("\n📝 Next steps:")
        print("1. Add input field to trading-ui/preferences.html")
        print("2. Test the preference via API")
        print("3. Git commit with descriptive message")
        sys.exit(0)
    else:
        print("\n❌ Migration failed!")
        sys.exit(1)

