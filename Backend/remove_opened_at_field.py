#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
מחיקת השדה opened_at מבסיס הנתונים
"""

import sqlite3
import os

def remove_opened_at_field():
    """מחיקת השדה opened_at מטבלת trades"""
    
    # יצירת גיבוי
    backup_path = 'db/simpleTrade_new_backup_before_opened_at_removal.db'
    if os.path.exists('db/simpleTrade_new.db'):
        import shutil
        shutil.copy2('db/simpleTrade_new.db', backup_path)
        print(f"✅ גיבוי נוצר: {backup_path}")
    
    conn = sqlite3.connect('db/simpleTrade_new.db')
    cursor = conn.cursor()
    
    try:
        print("🗑️  מתחיל מחיקת השדה opened_at...")
        
        # יצירת טבלה חדשה ללא השדה opened_at
        cursor.execute('''
            CREATE TABLE trades_new (
                account_id INTEGER NOT NULL,
                ticker_id INTEGER NOT NULL,
                trade_plan_id INTEGER,
                status VARCHAR(20),
                type VARCHAR(20),
                closed_at DATETIME,
                cancelled_at DATETIME,
                cancel_reason VARCHAR(500),
                total_pl FLOAT,
                notes VARCHAR(500),
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # העתקת הנתונים מהטבלה הישנה לחדשה
        cursor.execute('''
            INSERT INTO trades_new (
                account_id, ticker_id, trade_plan_id, status, type,
                closed_at, cancelled_at, cancel_reason, total_pl, notes, id, created_at
            )
            SELECT 
                account_id, ticker_id, trade_plan_id, status, type,
                closed_at, cancelled_at, cancel_reason, total_pl, notes, id, created_at
            FROM trades
        ''')
        
        # מחיקת הטבלה הישנה
        cursor.execute('DROP TABLE trades')
        
        # שינוי שם הטבלה החדשה
        cursor.execute('ALTER TABLE trades_new RENAME TO trades')
        
        conn.commit()
        print("✅ השדה opened_at נמחק בהצלחה!")
        
        # בדיקה שהטבלה עובדת
        cursor.execute('SELECT COUNT(*) FROM trades')
        count = cursor.fetchone()[0]
        print(f"📊 מספר טריידים בטבלה: {count}")
        
        # הצגת מבנה הטבלה החדש
        cursor.execute('PRAGMA table_info(trades)')
        columns = cursor.fetchall()
        print("\n📋 מבנה הטבלה החדש:")
        for col in columns:
            print(f"  {col[1]} ({col[2]})")
        
    except Exception as e:
        print(f"❌ שגיאה במחיקת השדה: {e}")
        conn.rollback()
        
        # שחזור מהגיבוי
        if os.path.exists(backup_path):
            import shutil
            shutil.copy2(backup_path, 'db/simpleTrade_new.db')
            print("🔄 שחזור מהגיבוי הושלם")
    finally:
        conn.close()

def main():
    """פונקציה ראשית"""
    print("🚀 מתחיל מחיקת השדה opened_at...")
    
    remove_opened_at_field()
    
    print("\n✅ מחיקת השדה opened_at הושלמה!")

if __name__ == "__main__":
    main()
