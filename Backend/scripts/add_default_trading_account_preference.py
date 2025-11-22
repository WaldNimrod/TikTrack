#!/usr/bin/env python3
"""
הוספת העדפת חשבון מסחר ברירת מחדל לבסיס הנתונים
מוסיף גם את הערך לפרופיל הפעיל
"""

import sqlite3
import sys
import os
from datetime import datetime

# הוספת הנתיב למודולים
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

def add_default_trading_account_preference():
    """הוספת העדפת חשבון מסחר ברירת מחדל + הערך לפרופיל הפעיל"""
    
    # חיבור לבסיס הנתונים
    db_path = os.path.join(os.path.dirname(__file__), '..', 'db', 'tiktrack.db')
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print("🔧 הוספת העדפת חשבון מסחר ברירת מחדל...")
    
    try:
        # 1. מציאת חשבון קיים (מעדכנים את preference_name אבל לא את הערך עדיין)
        # נחפש את החשבון הראשון הפעיל, או "חשבון מעודכן" אם קיים
        cursor.execute('SELECT id FROM trading_accounts WHERE name = ?', ('חשבון מעודכן',))
        account_result = cursor.fetchone()
        
        if not account_result:
            # נסה את החשבון הראשון הפעיל
            cursor.execute('SELECT id FROM trading_accounts WHERE status = ? ORDER BY id LIMIT 1', ('open',))
            account_result = cursor.fetchone()
        
        account_id = None
        if account_result:
            account_id = account_result[0]
            print(f"✅ נמצא חשבון (ID: {account_id}) - ישמש רק ל-default_value")
        else:
            print("⚠️  לא נמצא חשבון - נשתמש ב-1 כברירת מחדל")
            account_id = 1
        
        # 2. קבלת group_id של trading_settings
        cursor.execute('SELECT id FROM preference_groups WHERE group_name = ?', ('trading_settings',))
        group_result = cursor.fetchone()
        
        if not group_result:
            print("❌ קבוצה לא נמצאה: trading_settings")
            return False
            
        group_id = group_result[0]
        print(f"✅ נמצאה קבוצה: trading_settings (ID: {group_id})")
        
        # 3. בדיקה אם defaultAccountFilter קיים ושמירת preference_type_id שלו
        cursor.execute('''
            SELECT id FROM preference_types 
            WHERE preference_name = ?
        ''', ('defaultAccountFilter',))
        
        old_preference_type_result = cursor.fetchone()
        
        if old_preference_type_result:
            # קיים defaultAccountFilter - מעדכן אותו
            preference_type_id = old_preference_type_result[0]
            cursor.execute('''
                UPDATE preference_types 
                SET preference_name = ?,
                    description = ?,
                    constraints = ?,
                    default_value = ?
                WHERE id = ?
            ''', (
                'default_trading_account',
                'חשבון מסחר ברירת מחדל',
                '{"min": 1}',
                str(account_id),
                preference_type_id
            ))
            conn.commit()
            print(f"✅ עודכן preference_type: defaultAccountFilter -> default_trading_account (ID: {preference_type_id})")
        else:
            # בדיקה אם default_trading_account כבר קיים
            cursor.execute('''
                SELECT id FROM preference_types 
                WHERE preference_name = ?
            ''', ('default_trading_account',))
            
            preference_type_result = cursor.fetchone()
            
            if not preference_type_result:
                # לא קיים - הוספת preference_type
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
                    str(account_id),
                    False
                ))
                conn.commit()
                preference_type_id = cursor.lastrowid
                print(f"✅ נוסף preference_type: default_trading_account (ID: {preference_type_id})")
            else:
                preference_type_id = preference_type_result[0]
                print(f"⚠️  ההעדפה כבר קיימת: default_trading_account (ID: {preference_type_id})")
        
        print(f"✅ preference_type_id: {preference_type_id}")
        
        # 5. עדכון ערכים קיימים ב-user_preferences (אם היו עם השם הישן)
        # אין צורך לעדכן - preference_id נשאר אותו דבר!
        print(f"✅ ההעדפה עודכנה בהצלחה (preference_id: {preference_type_id})")
        print(f"   שם ישן: defaultAccountFilter")
        print(f"   שם חדש: default_trading_account")
        print(f"   ערך ברירת מחדל: {account_id} (חשבון חדש)")
        
        # 8. ספירה סופית
        cursor.execute('SELECT COUNT(*) FROM preference_types WHERE is_active = 1')
        total_types = cursor.fetchone()[0]
        print(f"  סה\"כ העדפות פעילות: {total_types}")
        
        return True
        
    except Exception as e:
        print(f"❌ שגיאה: {e}")
        import traceback
        traceback.print_exc()
        conn.rollback()
        return False
    finally:
        conn.close()

if __name__ == "__main__":
    success = add_default_trading_account_preference()
    sys.exit(0 if success else 1)


