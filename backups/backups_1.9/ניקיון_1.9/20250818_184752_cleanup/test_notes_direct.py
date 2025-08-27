#!/usr/bin/env python3
"""
בדיקה ישירה של בסיס הנתונים
"""

import sqlite3

def test_notes_direct():
    """בדיקה ישירה של טבלת ההערות"""
    
    try:
        conn = sqlite3.connect('db/simpleTrade_new.db')
        cursor = conn.cursor()
        
        print("🔄 בודק טבלת הערות...")
        
        # בדיקת המבנה
        cursor.execute("PRAGMA table_info(notes)")
        columns = cursor.fetchall()
        print("📋 מבנה הטבלה:")
        for col in columns:
            print(f"  - {col[1]} ({col[2]})")
        
        # בדיקת הנתונים
        cursor.execute("SELECT COUNT(*) FROM notes")
        count = cursor.fetchone()[0]
        print(f"📊 מספר הערות: {count}")
        
        # בדיקת דוגמה
        cursor.execute("SELECT * FROM notes LIMIT 3")
        notes = cursor.fetchall()
        print("📝 דוגמאות הערות:")
        for note in notes:
            print(f"  - ID: {note[0]}, Content: {note[1][:50]}..., Type: {note[4]}, Related ID: {note[5]}")
        
        conn.close()
        print("✅ בדיקה הושלמה בהצלחה")
        
    except Exception as e:
        print(f"❌ שגיאה: {e}")

if __name__ == "__main__":
    test_notes_direct()
