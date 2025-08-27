#!/usr/bin/env python3
"""
סקריפט לעדכון מבנה טבלת ההערות
משנה את המבנה כך שכל הערה תהיה משויכת רק לאלמנט אחד
"""

import sqlite3
import os
from datetime import datetime

def update_notes_structure():
    """עדכון מבנה טבלת ההערות"""
    
    db_path = "db/simpleTrade_new.db"
    
    if not os.path.exists(db_path):
        print(f"❌ קובץ בסיס הנתונים לא נמצא: {db_path}")
        return
    
    try:
        # חיבור לבסיס הנתונים
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("🔄 מתחיל עדכון מבנה טבלת ההערות...")
        
        # 1. יצירת טבלה זמנית עם המבנה החדש
        print("📋 יוצר טבלה זמנית...")
        cursor.execute("""
            CREATE TABLE notes_new (
                id INTEGER PRIMARY KEY,
                content VARCHAR(1000) NOT NULL,
                attachment VARCHAR(500),
                created_at DATETIME DEFAULT (CURRENT_TIMESTAMP),
                related_type VARCHAR(20),  -- 'account', 'trade', 'trade_plan'
                related_id INTEGER
            )
        """)
        
        # 2. העתקת הנתונים הקיימים עם לוגיקה לקביעת הקשר
        print("📊 מעתיק נתונים קיימים...")
        cursor.execute("SELECT id, account_id, trade_id, trade_plan_id, content, attachment, created_at FROM notes")
        notes = cursor.fetchall()
        
        for note in notes:
            note_id, account_id, trade_id, trade_plan_id, content, attachment, created_at = note
            
            # קביעת הקשר לפי עדיפות: trade_plan > trade > account
            if trade_plan_id:
                related_type = 'trade_plan'
                related_id = trade_plan_id
            elif trade_id:
                related_type = 'trade'
                related_id = trade_id
            elif account_id:
                related_type = 'account'
                related_id = account_id
            else:
                # אם אין קשר, נשתמש בחשבון ברירת מחדל (1)
                related_type = 'account'
                related_id = 1
                print(f"⚠️ הערה {note_id} לא הייתה משויכת - משויכת לחשבון 1")
            
            cursor.execute("""
                INSERT INTO notes_new (id, content, attachment, created_at, related_type, related_id)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (note_id, content, attachment, created_at, related_type, related_id))
        
        # 3. מחיקת הטבלה הישנה ויצירת הטבלה החדשה
        print("🗑️ מחליף טבלות...")
        cursor.execute("DROP TABLE notes")
        cursor.execute("ALTER TABLE notes_new RENAME TO notes")
        
        # 4. יצירת אינדקסים
        print("🔍 יוצר אינדקסים...")
        cursor.execute("CREATE INDEX ix_notes_id ON notes (id)")
        cursor.execute("CREATE INDEX ix_notes_related_type ON notes (related_type)")
        cursor.execute("CREATE INDEX ix_notes_related_id ON notes (related_id)")
        
        # 5. שמירת השינויים
        conn.commit()
        
        print("✅ מבנה טבלת ההערות עודכן בהצלחה!")
        
        # 6. הצגת סיכום
        cursor.execute("SELECT related_type, COUNT(*) FROM notes GROUP BY related_type")
        summary = cursor.fetchall()
        
        print("\n📊 סיכום הנתונים:")
        for related_type, count in summary:
            print(f"  - {related_type}: {count} הערות")
        
        cursor.execute("SELECT COUNT(*) FROM notes")
        total = cursor.fetchone()[0]
        print(f"  - סה״כ: {total} הערות")
        
    except Exception as e:
        print(f"❌ שגיאה בעדכון מבנה: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    update_notes_structure()
