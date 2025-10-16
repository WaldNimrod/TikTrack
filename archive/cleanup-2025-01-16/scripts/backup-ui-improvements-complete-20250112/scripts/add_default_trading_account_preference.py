#!/usr/bin/env python3
"""
הוספת העדפת חשבון מסחר ברירת מחדל לבסיס הנתונים
"""

import sqlite3
import sys
import os

# הוספת הנתיב למודולים
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

def add_default_trading_account_preference():
    """הוספת העדפת חשבון מסחר ברירת מחדל"""
    
    # חיבור לבסיס הנתונים
    db_path = os.path.join(os.path.dirname(__file__), '..', 'db', 'simpleTrade_new.db')
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print("🔧 הוספת העדפת חשבון מסחר ברירת מחדל...")
    
    try:
        # קבלת group_id של trading_settings
        cursor.execute('SELECT id FROM preference_groups WHERE group_name = ?', ('trading_settings',))
        group_result = cursor.fetchone()
        
        if not group_result:
            print("❌ קבוצה לא נמצאה: trading_settings")
            return False
            
        group_id = group_result[0]
        print(f"✅ נמצאה קבוצה: trading_settings (ID: {group_id})")
        
        # בדיקה אם ההגדרה כבר קיימת
        cursor.execute('''
            SELECT id FROM preference_types 
            WHERE preference_name = ? AND group_id = ?
        ''', ('default_trading_account', group_id))
        
        if cursor.fetchone():
            print(f"⚠️  ההעדפה כבר קיימת: default_trading_account")
            return True
        
        # הוספת ההעדפה
        cursor.execute('''
            INSERT INTO preference_types 
            (group_id, data_type, preference_name, description, constraints, default_value, is_required, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, 1)
        ''', (
            group_id,
            'integer',
            'default_trading_account',
            'חשבון מסחר ברירת מחדל',
            '{"min": 1}',
            '1',
            False
        ))
        
        conn.commit()
        print(f"✅ נוספה: default_trading_account (trading_settings)")
        
        # ספירה סופית
        cursor.execute('SELECT COUNT(*) FROM preference_types WHERE is_active = 1')
        total_count = cursor.fetchone()[0]
        print(f"  סה\"כ העדפות פעילות: {total_count}")
        
        return True
        
    except Exception as e:
        print(f"❌ שגיאה: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()

if __name__ == "__main__":
    success = add_default_trading_account_preference()
    sys.exit(0 if success else 1)


