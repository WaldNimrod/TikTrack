#!/usr/bin/env python3
"""
סקריפט להוספת מטבעות בסיסיים
"""

import sqlite3
import os

# נתיב לבסיס הנתונים
DB_PATH = "Backend/db/simpleTrade_new.db"

def add_currencies():
    """הוספת מטבעות בסיסיים"""
    
    if not os.path.exists(DB_PATH):
        print(f"❌ בסיס הנתונים לא נמצא: {DB_PATH}")
        return
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        print("🔄 מוסיף מטבעות בסיסיים...")
        
        # מטבעות בסיסיים
        currencies_data = [
            ('USD', 'US Dollar', 1.000000),
            ('ILS', 'Israeli Shekel', 3.650000),
            ('EUR', 'Euro', 0.920000),
            ('GBP', 'British Pound', 0.790000),
            ('JPY', 'Japanese Yen', 150.000000),
            ('CAD', 'Canadian Dollar', 1.350000),
            ('AUD', 'Australian Dollar', 1.520000),
            ('CHF', 'Swiss Franc', 0.880000),
        ]
        
        for symbol, name, usd_rate in currencies_data:
            try:
                cursor.execute("""
                    INSERT INTO currencies (symbol, name, usd_rate)
                    VALUES (?, ?, ?)
                """, (symbol, name, usd_rate))
                print(f"✅ נוסף מטבע: {symbol} - {name}")
            except sqlite3.IntegrityError:
                print(f"⚠️  מטבע {symbol} כבר קיים")
        
        conn.commit()
        print("✅ המטבעות נוספו בהצלחה")
        
        # הצגת המטבעות שנוספו
        cursor.execute("SELECT symbol, name, usd_rate FROM currencies ORDER BY symbol")
        currencies = cursor.fetchall()
        
        print("\n📊 מטבעות במערכת:")
        for symbol, name, rate in currencies:
            print(f"  {symbol}: {name} (שער: {rate})")
        
    except Exception as e:
        print(f"❌ שגיאה בהוספת מטבעות: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    print("🔄 הוספת מטבעות בסיסיים...")
    add_currencies()
    print("✅ הסתיים")
