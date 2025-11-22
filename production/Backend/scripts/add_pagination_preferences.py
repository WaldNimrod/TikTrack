#!/usr/bin/env python3
"""
הוספת הגדרות חלוקה לעמודים לבסיס הנתונים
"""

import sqlite3
import sys
import os

# הוספת הנתיב למודולים
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

def add_pagination_preferences():
    """הוספת הגדרות חלוקה לעמודים לבסיס הנתונים"""
    
    # חיבור לבסיס הנתונים
    conn = sqlite3.connect('db/tiktrack.db')
    cursor = conn.cursor()
    
    print("🔧 הוספת הגדרות חלוקה לעמודים לבסיס הנתונים...")
    
    # הגדרות חלוקה לעמודים
    pagination_preferences = [
        {
            'group_name': 'ui_settings',
            'preference_name': 'pagination_size_logs',
            'data_type': 'integer',
            'description': 'מספר רשומות בעמוד עבור לוגים',
            'default_value': '25',
            'is_required': False,
            'constraints': '{"min": 10, "max": 100}'
        },
        {
            'group_name': 'ui_settings',
            'preference_name': 'pagination_size_unified-log-table',
            'data_type': 'integer',
            'description': 'מספר רשומות בעמוד עבור טבלת לוג מאוחד',
            'default_value': '25',
            'is_required': False,
            'constraints': '{"min": 10, "max": 100}'
        },
        {
            'group_name': 'ui_settings',
            'preference_name': 'pagination_size_default',
            'data_type': 'integer',
            'description': 'מספר רשומות ברירת מחדל בעמוד',
            'default_value': '25',
            'is_required': False,
            'constraints': '{"min": 10, "max": 100}'
        }
    ]
    
    added_count = 0
    
    for pref in pagination_preferences:
        try:
            # קבלת group_id
            cursor.execute('SELECT id FROM preference_groups WHERE group_name = ?', (pref['group_name'],))
            group_result = cursor.fetchone()
            
            if not group_result:
                print(f"❌ קבוצה לא נמצאה: {pref['group_name']}")
                continue
                
            group_id = group_result[0]
            
            # בדיקה אם ההגדרה כבר קיימת
            cursor.execute('''
                SELECT id FROM preference_types 
                WHERE preference_name = ? AND group_id = ?
            ''', (pref['preference_name'], group_id))
            
            if cursor.fetchone():
                print(f"⚠️  ההגדרה כבר קיימת: {pref['preference_name']}")
                continue
            
            # הוספת ההגדרה
            cursor.execute('''
                INSERT INTO preference_types 
                (group_id, data_type, preference_name, description, constraints, default_value, is_required, is_active)
                VALUES (?, ?, ?, ?, ?, ?, ?, 1)
            ''', (
                group_id,
                pref['data_type'],
                pref['preference_name'],
                pref['description'],
                pref['constraints'],
                pref['default_value'],
                pref['is_required']
            ))
            
            print(f"✅ נוספה: {pref['preference_name']} ({pref['group_name']})")
            added_count += 1
            
        except Exception as e:
            print(f"❌ שגיאה בהוספת {pref['preference_name']}: {e}")
    
    # שמירת השינויים
    conn.commit()
    
    print(f"\n📊 סיכום:")
    print(f"  נוספו {added_count} הגדרות חדשות")
    
    # ספירה סופית
    cursor.execute('SELECT COUNT(*) FROM preference_types WHERE is_active = 1')
    total_count = cursor.fetchone()[0]
    print(f"  סה\"כ הגדרות פעילות: {total_count}")
    
    conn.close()
    return added_count

if __name__ == "__main__":
    add_pagination_preferences()
