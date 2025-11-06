#!/usr/bin/env python3
"""
הוספת חשבון מסחר ברירת מחדל "חשבון מסחר חדש" לבסיס הנתונים
"""

import sqlite3
import sys
import os

# הוספת הנתיב למודולים
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

def add_default_trading_account():
    """הוספת חשבון מסחר ברירת מחדל"""
    
    # חיבור לבסיס הנתונים
    db_path = os.path.join(os.path.dirname(__file__), '..', 'db', 'simpleTrade_new.db')
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print("🔧 הוספת חשבון מסחר ברירת מחדל...")
    
    try:
        # 1. בדיקה אם חשבון המסחר כבר קיים
        cursor.execute('SELECT id FROM trading_accounts WHERE name = ?', ('חשבון מסחר חדש',))
        existing = cursor.fetchone()
        if existing:
            account_id = existing[0]
            print(f"⚠️  חשבון המסחר 'חשבון מסחר חדש' כבר קיים (ID: {account_id})")
            return account_id
        
        # 2. קבלת currency_id של USD (ID: 1)
        cursor.execute('SELECT id FROM currencies WHERE id = 1')
        currency_result = cursor.fetchone()
        
        if not currency_result:
            print("❌ מטבע USD לא נמצא. יוצר מטבע USD...")
            cursor.execute("""
                INSERT INTO currencies (symbol, name, usd_rate, usd_rate_default, created_at)
                VALUES ('USD', 'US Dollar', 1.0, 1.0, datetime('now'))
            """)
            currency_id = 1
        else:
            currency_id = 1
        
        print(f"✅ נמצא מטבע USD (ID: {currency_id})")
        
        # 3. הוספת חשבון המסחר
        cursor.execute("""
            INSERT INTO trading_accounts (name, currency_id, status, cash_balance, total_value, total_pl, created_at)
            VALUES (?, ?, 'open', 0, 0, 0, datetime('now'))
        """, ('חשבון מסחר חדש', currency_id))
        
        account_id = cursor.lastrowid
        conn.commit()
        
        print(f"✅ נוסף חשבון מסחר 'חשבון מסחר חדש' (ID: {account_id})")
        
        # 4. ספירה סופית
        cursor.execute('SELECT COUNT(*) FROM trading_accounts')
        total_count = cursor.fetchone()[0]
        print(f"  סה\"כ חשבונות: {total_count}")
        
        return account_id
        
    except Exception as e:
        print(f"❌ שגיאה: {e}")
        import traceback
        traceback.print_exc()
        conn.rollback()
        return None
    finally:
        conn.close()

if __name__ == "__main__":
    account_id = add_default_trading_account()
    sys.exit(0 if account_id else 1)

