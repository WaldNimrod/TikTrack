#!/usr/bin/env python3
"""
מיגרציה לעדכון מבנה טבלת alerts
==================================

מיגרציה זו מעדכנת את טבלת alerts לשימוש במערכת שיוך גמישה:
- מוסיפה שדות related_type_id ו-related_id
- מסירה שדות account_id ו-ticker_id
- מעבירה נתונים קיימים למערכת החדשה
- מוסיפה את סוג השיוך 'ticker' לטבלת note_relation_types

Author: TikTrack Development Team
Date: 2025-08-18
"""

import sqlite3
import os
from datetime import datetime

def update_alerts_structure():
    """עדכון מבנה טבלת alerts למערכת שיוך גמישה"""
    
    # נתיב לבסיס הנתונים
    db_path = os.path.join(os.path.dirname(__file__), '..', 'db', 'simpleTrade_new.db')
    
    if not os.path.exists(db_path):
        print(f"❌ בסיס הנתונים לא נמצא: {db_path}")
        return False
    
    print("🚀 מתחיל מיגרציה לעדכון מבנה טבלת alerts...")
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # בדיקה אם השדות החדשים כבר קיימים
        cursor.execute("PRAGMA table_info(alerts)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'related_type_id' in columns and 'related_id' in columns:
            print("✅ השדות החדשים כבר קיימים בטבלת alerts")
            return True
        
        # 1. הוספת סוג שיוך 'ticker' לטבלת note_relation_types
        print("📝 מוסיף סוג שיוך 'ticker'...")
        try:
            cursor.execute("INSERT INTO note_relation_types (note_relation_type) VALUES (?)", ('ticker',))
            ticker_relation_id = cursor.lastrowid
            print(f"   ✅ נוסף סוג שיוך 'ticker' עם מזהה {ticker_relation_id}")
        except sqlite3.IntegrityError:
            # אם כבר קיים, קבל את המזהה
            cursor.execute("SELECT id FROM note_relation_types WHERE note_relation_type = ?", ('ticker',))
            ticker_relation_id = cursor.fetchone()[0]
            print(f"   ℹ️ סוג שיוך 'ticker' כבר קיים עם מזהה {ticker_relation_id}")
        
        # קבלת מזהי סוגי השיוך הקיימים
        cursor.execute("SELECT id, note_relation_type FROM note_relation_types")
        relation_types = {row[1]: row[0] for row in cursor.fetchall()}
        print(f"   📊 סוגי שיוך קיימים: {relation_types}")
        
        # 2. הוספת השדות החדשים
        print("📝 מוסיף שדות חדשים לטבלת alerts...")
        cursor.execute("ALTER TABLE alerts ADD COLUMN related_type_id INTEGER")
        cursor.execute("ALTER TABLE alerts ADD COLUMN related_id INTEGER")
        print("   ✅ נוספו שדות related_type_id ו-related_id")
        
        # 3. העברת נתונים קיימים
        print("📝 מעביר נתונים קיימים למערכת החדשה...")
        
        # העברת התראות משויכות לחשבונות
        cursor.execute("""
            UPDATE alerts 
            SET related_type_id = ?, related_id = account_id 
            WHERE account_id IS NOT NULL
        """, (relation_types.get('account', 1),))
        account_alerts_updated = cursor.rowcount
        print(f"   ✅ עודכנו {account_alerts_updated} התראות משויכות לחשבונות")
        
        # העברת התראות משויכות לטיקרים
        cursor.execute("""
            UPDATE alerts 
            SET related_type_id = ?, related_id = ticker_id 
            WHERE ticker_id IS NOT NULL
        """, (ticker_relation_id,))
        ticker_alerts_updated = cursor.rowcount
        print(f"   ✅ עודכנו {ticker_alerts_updated} התראות משויכות לטיקרים")
        
        # 4. הסרת השדות הישנים
        print("📝 מסיר שדות ישנים...")
        
        # יצירת טבלה זמנית עם המבנה החדש
        cursor.execute("""
            CREATE TABLE alerts_new (
                id INTEGER PRIMARY KEY,
                type VARCHAR(50) NOT NULL,
                status VARCHAR(20) DEFAULT 'open',
                condition VARCHAR(500) NOT NULL,
                message VARCHAR(500),
                triggered_at DATETIME,
                is_triggered VARCHAR(20) DEFAULT 'false',
                related_type_id INTEGER NOT NULL,
                related_id INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (related_type_id) REFERENCES note_relation_types(id)
            )
        """)
        
        # העתקת נתונים לטבלה החדשה
        cursor.execute("""
            INSERT INTO alerts_new 
            SELECT id, type, status, condition, message, triggered_at, is_triggered, 
                   related_type_id, related_id, created_at
            FROM alerts
        """)
        
        # מחיקת הטבלה הישנה
        cursor.execute("DROP TABLE alerts")
        
        # שינוי שם הטבלה החדשה
        cursor.execute("ALTER TABLE alerts_new RENAME TO alerts")
        
        print("   ✅ הוסרו השדות הישנים account_id ו-ticker_id")
        
        # 5. יצירת אינדקסים
        print("📝 יוצר אינדקסים...")
        cursor.execute("CREATE INDEX IF NOT EXISTS ix_alerts_related_type_id ON alerts(related_type_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS ix_alerts_related_id ON alerts(related_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS ix_alerts_is_triggered ON alerts(is_triggered)")
        cursor.execute("CREATE INDEX IF NOT EXISTS ix_alerts_status ON alerts(status)")
        print("   ✅ נוצרו אינדקסים")
        
        # 6. בדיקה סופית
        cursor.execute("PRAGMA table_info(alerts)")
        final_columns = [column[1] for column in cursor.fetchall()]
        print(f"   📊 שדות סופיים בטבלת alerts: {final_columns}")
        
        # בדיקת נתונים
        cursor.execute("SELECT COUNT(*) FROM alerts")
        total_alerts = cursor.fetchone()[0]
        print(f"   📊 סה\"כ התראות בטבלה: {total_alerts}")
        
        conn.commit()
        conn.close()
        
        print("✅ מיגרציה הושלמה בהצלחה!")
        return True
        
    except Exception as e:
        print(f"❌ שגיאה במיגרציה: {e}")
        if 'conn' in locals():
            conn.rollback()
            conn.close()
        return False

if __name__ == "__main__":
    success = update_alerts_structure()
    if success:
        print("🎉 מיגרציה הושלמה בהצלחה!")
    else:
        print("💥 מיגרציה נכשלה!")
        exit(1)
