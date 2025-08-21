#!/usr/bin/env python3
"""
Migration script to update accounts table to use currency_id instead of currency string

This script:
1. Creates a new currency_id column in the accounts table
2. Maps existing currency strings to currency IDs
3. Removes the old currency column
4. Updates the table structure

Author: TikTrack Development Team
Version: 1.0
Last Updated: 2025-08-21
"""

import sys
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Add the Backend directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from config.settings import DATABASE_URL

def update_accounts_currency_table():
    """עדכון טבלת החשבונות לשימוש במזהה מטבע"""
    
    try:
        # יצירת חיבור לבסיס הנתונים
        engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
        
        with engine.connect() as connection:
            print("🔄 מתחיל עדכון טבלת החשבונות...")
            
            # 1. בדיקה שטבלת המטבעות קיימת
            result = connection.execute(text("SELECT name FROM sqlite_master WHERE type='table' AND name='currencies'"))
            if not result.fetchone():
                print("❌ שגיאה: טבלת המטבעות לא קיימת. יש להריץ את create_currencies_table.py קודם")
                return False
            
            # 2. בדיקה שיש מטבעות בטבלה
            result = connection.execute(text("SELECT COUNT(*) as count FROM currencies"))
            currency_count = result.fetchone()[0]
            if currency_count == 0:
                print("❌ שגיאה: אין מטבעות בטבלת המטבעות. יש להריץ את add_currencies.py קודם")
                return False
            
            print(f"✓ נמצאו {currency_count} מטבעות בטבלת המטבעות")
            
            # 3. בדיקה האם העמודה currency_id כבר קיימת
            result = connection.execute(text("PRAGMA table_info(accounts)"))
            columns = [col[1] for col in result.fetchall()]
            
            if 'currency_id' in columns:
                print("⚠️  העמודה currency_id כבר קיימת בטבלת החשבונות")
                return True
            
            # 4. יצירת העמודה החדשה currency_id
            connection.execute(text("ALTER TABLE accounts ADD COLUMN currency_id INTEGER"))
            connection.commit()
            print("✓ נוספה העמודה currency_id לטבלת החשבונות")
            
            # 5. מיפוי מטבעות קיימים למזהים
            currency_mapping = {}
            result = connection.execute(text("SELECT id, symbol FROM currencies"))
            for row in result.fetchall():
                currency_mapping[row[1]] = row[0]
            
            print(f"✓ מיפוי מטבעות: {currency_mapping}")
            
            # 6. עדכון הרשומות הקיימות
            result = connection.execute(text("SELECT id, currency FROM accounts WHERE currency IS NOT NULL"))
            accounts_to_update = result.fetchall()
            
            updated_count = 0
            for account_id, currency_str in accounts_to_update:
                currency_str = currency_str.upper() if currency_str else 'USD'
                
                if currency_str in currency_mapping:
                    currency_id = currency_mapping[currency_str]
                    connection.execute(
                        text("UPDATE accounts SET currency_id = :currency_id WHERE id = :account_id"),
                        {"currency_id": currency_id, "account_id": account_id}
                    )
                    updated_count += 1
                else:
                    # אם המטבע לא קיים, השתמש ב-USD כברירת מחדל
                    default_currency_id = currency_mapping.get('USD', 1)
                    connection.execute(
                        text("UPDATE accounts SET currency_id = :currency_id WHERE id = :account_id"),
                        {"currency_id": default_currency_id, "account_id": account_id}
                    )
                    updated_count += 1
                    print(f"⚠️  חשבון {account_id}: מטבע '{currency_str}' לא נמצא, הוגדר ל-USD")
            
            connection.commit()
            print(f"✓ עודכנו {updated_count} חשבונות עם מזהי מטבע")
            
            # 7. הגדרת ברירת מחדל לרשומות ללא מטבע
            usd_id = currency_mapping.get('USD', 1)
            result = connection.execute(
                text("UPDATE accounts SET currency_id = :usd_id WHERE currency_id IS NULL"),
                {"usd_id": usd_id}
            )
            connection.commit()
            
            if result.rowcount > 0:
                print(f"✓ הוגדר מטבע ברירת מחדל (USD) ל-{result.rowcount} חשבונות")
            
            # 8. יצירת Foreign Key constraint (בצורה עקיפה ב-SQLite)
            # SQLite לא תומך ב-ALTER TABLE ADD CONSTRAINT, אז נוודא שהנתונים תקינים
            result = connection.execute(text("""
                SELECT COUNT(*) as invalid_count 
                FROM accounts a 
                LEFT JOIN currencies c ON a.currency_id = c.id 
                WHERE a.currency_id IS NOT NULL AND c.id IS NULL
            """))
            
            invalid_count = result.fetchone()[0]
            if invalid_count > 0:
                print(f"❌ שגיאה: נמצאו {invalid_count} חשבונות עם מזהי מטבע לא תקינים")
                return False
            
            print("✓ כל מזהי המטבע בחשבונות תקינים")
            
            print("\n🎉 עדכון טבלת החשבונות הושלם בהצלחה!")
            print("📋 השלב הבא: עדכון טבלת הטיקרים")
            return True
            
    except Exception as e:
        print(f"❌ שגיאה בעדכון טבלת החשבונות: {e}")
        return False

def verify_accounts_update():
    """בדיקת תוצאות העדכון"""
    
    try:
        engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
        
        with engine.connect() as connection:
            print("\n📋 בדיקת תוצאות העדכון:")
            print("=" * 50)
            
            # בדיקת מבנה הטבלה
            result = connection.execute(text("PRAGMA table_info(accounts)"))
            columns = result.fetchall()
            
            print("מבנה טבלת החשבונות:")
            for col in columns:
                col_name, col_type = col[1], col[2]
                print(f"  {col_name}: {col_type}")
            
            # בדיקת הנתונים
            result = connection.execute(text("""
                SELECT 
                    a.id, 
                    a.name, 
                    a.currency_id, 
                    c.symbol as currency_symbol,
                    c.name as currency_name
                FROM accounts a
                LEFT JOIN currencies c ON a.currency_id = c.id
                LIMIT 10
            """))
            
            accounts = result.fetchall()
            if accounts:
                print("\nדוגמאות חשבונות:")
                for acc in accounts:
                    print(f"  חשבון {acc[0]}: {acc[1]} | מטבע: {acc[3]} ({acc[4]})")
            
            return True
            
    except Exception as e:
        print(f"❌ שגיאה בבדיקת העדכון: {e}")
        return False

if __name__ == "__main__":
    print("🔄 עדכון טבלת החשבונות לשימוש במזהי מטבע - TikTrack")
    print("=" * 70)
    
    # עדכון הטבלה
    if update_accounts_currency_table():
        # בדיקת התוצאות
        verify_accounts_update()
    else:
        print("\n❌ העדכון נכשל")
        sys.exit(1)
