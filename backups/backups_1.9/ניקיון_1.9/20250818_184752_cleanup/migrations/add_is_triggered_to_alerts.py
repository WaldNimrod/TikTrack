#!/usr/bin/env python3
"""
מיגרציה להוספת שדה is_triggered לטבלת alerts
"""

import sqlite3
import os
from datetime import datetime

def add_is_triggered_column():
    """הוספת שדה is_triggered לטבלת alerts"""
    
    # נתיב לבסיס הנתונים
    db_path = os.path.join(os.path.dirname(__file__), '..', 'db', 'simpleTrade_new.db')
    
    try:
        # חיבור לבסיס הנתונים
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print(f"🔧 מתחבר לבסיס הנתונים: {db_path}")
        
        # בדיקה אם השדה כבר קיים
        cursor.execute("PRAGMA table_info(alerts)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'is_triggered' in columns:
            print("✅ השדה is_triggered כבר קיים בטבלת alerts")
            return True
        
        # הוספת השדה
        print("🔄 מוסיף שדה is_triggered לטבלת alerts...")
        cursor.execute("""
            ALTER TABLE alerts 
            ADD COLUMN is_triggered TEXT DEFAULT 'false'
        """)
        
        # עדכון רשומות קיימות
        print("🔄 מעדכן רשומות קיימות...")
        cursor.execute("""
            UPDATE alerts 
            SET is_triggered = 'false' 
            WHERE is_triggered IS NULL
        """)
        
        # שמירת השינויים
        conn.commit()
        
        # בדיקה שהשדה נוסף
        cursor.execute("PRAGMA table_info(alerts)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'is_triggered' in columns:
            print("✅ השדה is_triggered נוסף בהצלחה!")
            print(f"📊 שדות בטבלת alerts: {columns}")
            return True
        else:
            print("❌ שגיאה: השדה לא נוסף")
            return False
            
    except sqlite3.Error as e:
        print(f"❌ שגיאת SQLite: {e}")
        return False
    except Exception as e:
        print(f"❌ שגיאה כללית: {e}")
        return False
    finally:
        if conn:
            conn.close()

def main():
    """פונקציה ראשית"""
    print("🚀 מתחיל מיגרציה להוספת שדה is_triggered לטבלת alerts")
    print(f"⏰ זמן התחלה: {datetime.now()}")
    
    success = add_is_triggered_column()
    
    if success:
        print("✅ מיגרציה הושלמה בהצלחה!")
    else:
        print("❌ מיגרציה נכשלה!")
    
    print(f"⏰ זמן סיום: {datetime.now()}")

if __name__ == "__main__":
    main()
