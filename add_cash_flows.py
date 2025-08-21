#!/usr/bin/env python3
"""
סקריפט להוספת נתוני בדיקה לתזרימי מזומנים
"""

import sqlite3
import os
from datetime import datetime, timedelta
import random

# נתיב לבסיס הנתונים
DB_PATH = "Backend/db/simpleTrade_new.db"

def add_cash_flows():
    """הוספת נתוני בדיקה לתזרימי מזומנים"""
    
    if not os.path.exists(DB_PATH):
        print(f"❌ בסיס הנתונים לא נמצא: {DB_PATH}")
        return
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # בדיקה אם יש חשבונות
        cursor.execute("SELECT id FROM accounts LIMIT 1")
        accounts = cursor.fetchall()
        
        if not accounts:
            print("❌ אין חשבונות בבסיס הנתונים. יש להוסיף חשבונות תחילה.")
            return
        
        account_ids = [acc[0] for acc in accounts]
        
        # נתוני בדיקה לתזרימי מזומנים
        cash_flows_data = [
            # הפקדות
            (account_ids[0], 'deposit', 10000.00, '2025-01-15', 'הפקדה ראשונית'),
            (account_ids[0], 'deposit', 5000.00, '2025-02-01', 'הפקדה נוספת'),
            (account_ids[0], 'deposit', 3000.00, '2025-03-10', 'הפקדה חודשית'),
            
            # משיכות
            (account_ids[0], 'withdrawal', 2000.00, '2025-02-15', 'משיכה לצרכים אישיים'),
            (account_ids[0], 'withdrawal', 1500.00, '2025-03-20', 'משיכה נוספת'),
            
            # דיבידנדים
            (account_ids[0], 'dividend', 250.00, '2025-02-28', 'דיבידנד AAPL'),
            (account_ids[0], 'dividend', 180.00, '2025-03-31', 'דיבידנד MSFT'),
            
            # עמלות
            (account_ids[0], 'fee', -25.00, '2025-01-31', 'עמלת ברוקר'),
            (account_ids[0], 'fee', -15.00, '2025-02-28', 'עמלת ברוקר'),
            (account_ids[0], 'fee', -20.00, '2025-03-31', 'עמלת ברוקר'),
            
            # אם יש יותר מחשבון אחד
            (account_ids[-1], 'deposit', 8000.00, '2025-01-20', 'הפקדה לחשבון שני'),
            (account_ids[-1], 'withdrawal', 1000.00, '2025-02-10', 'משיכה מחשבון שני'),
            (account_ids[-1], 'dividend', 120.00, '2025-03-15', 'דיבידנד GOOGL'),
        ]
        
        # הוספת הנתונים
        for account_id, flow_type, amount, date, description in cash_flows_data:
            cursor.execute("""
                INSERT INTO cash_flows (account_id, type, amount, date, description, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                account_id,
                flow_type,
                amount,
                date,
                description,
                datetime.now().isoformat()
            ))
        
        conn.commit()
        print(f"✅ נוספו {len(cash_flows_data)} תזרימי מזומנים בהצלחה")
        
        # הצגת סיכום
        cursor.execute("""
            SELECT 
                type,
                COUNT(*) as count,
                SUM(amount) as total_amount
            FROM cash_flows 
            GROUP BY type
        """)
        
        summary = cursor.fetchall()
        print("\n📊 סיכום תזרימי מזומנים:")
        for flow_type, count, total in summary:
            print(f"  {flow_type}: {count} פריטים, סה״כ {total:,.2f}")
        
    except Exception as e:
        print(f"❌ שגיאה בהוספת תזרימי מזומנים: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    print("🔄 הוספת נתוני בדיקה לתזרימי מזומנים...")
    add_cash_flows()
    print("✅ הסתיים")
