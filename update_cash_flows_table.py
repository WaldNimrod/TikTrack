#!/usr/bin/env python3
"""
סקריפט להוספת שדות חדשים לטבלת cash_flows
"""

import sqlite3
import os

# נתיב לבסיס הנתונים
DB_PATH = "Backend/db/simpleTrade_new.db"

def update_cash_flows_table():
    """הוספת שדות חדשים לטבלת cash_flows"""
    
    if not os.path.exists(DB_PATH):
        print(f"❌ בסיס הנתונים לא נמצא: {DB_PATH}")
        return
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        print("🔄 מוסיף שדות חדשים לטבלת cash_flows...")
        
        # הוספת השדות החדשים
        alter_queries = [
            "ALTER TABLE cash_flows ADD COLUMN currency_id INTEGER REFERENCES currencies(id)",
            "ALTER TABLE cash_flows ADD COLUMN usd_rate DECIMAL(10,6) DEFAULT 1.000000",
            "ALTER TABLE cash_flows ADD COLUMN source VARCHAR(20) DEFAULT 'manual'",
            "ALTER TABLE cash_flows ADD COLUMN external_id VARCHAR(100) DEFAULT '0'"
        ]
        
        for query in alter_queries:
            try:
                cursor.execute(query)
                print(f"✅ הוספת שדה: {query}")
            except sqlite3.OperationalError as e:
                if "duplicate column name" in str(e):
                    print(f"⚠️  השדה כבר קיים: {query}")
                else:
                    print(f"❌ שגיאה בהוספת שדה: {e}")
        
        conn.commit()
        print("✅ השדות נוספו בהצלחה")
        
        # הצגת המבנה החדש
        cursor.execute("PRAGMA table_info(cash_flows)")
        columns = cursor.fetchall()
        
        print("\n📊 מבנה טבלת cash_flows החדש:")
        for col in columns:
            print(f"  {col[1]} ({col[2]}) - {col[3]}")
        
        # עדכון רשומות קיימות עם ערכים ברירת מחדל
        print("\n🔄 מעדכן רשומות קיימות...")
        
        # קבלת מזהה המטבע ברירת המחדל (USD)
        cursor.execute("SELECT id FROM currencies WHERE symbol = 'USD' LIMIT 1")
        usd_currency = cursor.fetchone()
        
        if usd_currency:
            usd_id = usd_currency[0]
            cursor.execute("""
                UPDATE cash_flows 
                SET currency_id = ?, usd_rate = 1.000000, source = 'manual', external_id = '0'
                WHERE currency_id IS NULL
            """, (usd_id,))
            print(f"✅ עודכנו {cursor.rowcount} רשומות עם ערכי ברירת מחדל")
        else:
            print("⚠️  לא נמצא מטבע USD, יש ליצור אותו תחילה")
        
        conn.commit()
        
    except Exception as e:
        print(f"❌ שגיאה בעדכון הטבלה: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    print("🔄 עדכון טבלת cash_flows...")
    update_cash_flows_table()
    print("✅ הסתיים")
