#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
מחיקת השדה opened_at מבסיס הנתונים
"""

import sqlite3
import os

def get_db_connection():
    """יצירת חיבור לבסיס הנתונים"""
    return sqlite3.connect('db/simpleTrade_new.db')

def remove_opened_at_column():
    """מחיקת השדה opened_at מהטבלה"""
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        print("🗑️  מתחיל מחיקת השדה opened_at...")
        
        # יצירת טבלה זמנית עם המבנה החדש (ללא opened_at)
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
        
        # העתקת הנתונים מהטבלה הישנה לחדשה (ללא opened_at)
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
        
        # הצגת המבנה החדש
        cursor.execute('PRAGMA table_info(trades)')
        columns = cursor.fetchall()
        
        print("\n📋 מבנה טבלת trades החדש:")
        for col in columns:
            print(f"  {col[1]} ({col[2]})")
        
        # הצגת דוגמה לנתונים
        cursor.execute('SELECT id, status, created_at, closed_at FROM trades LIMIT 3')
        sample_data = cursor.fetchall()
        
        print("\n📊 דוגמה לנתונים:")
        for row in sample_data:
            print(f"  טרייד {row[0]}: {row[1]} - יצירה: {row[2]}, סגירה: {row[3] or 'לא נסגר'}")
        
    except Exception as e:
        print(f"❌ שגיאה במחיקת השדה: {e}")
        conn.rollback()
    finally:
        conn.close()

def main():
    """פונקציה ראשית"""
    print("🚀 מתחיל מחיקת השדה opened_at...")
    
    # גיבוי בסיס הנתונים
    if os.path.exists('db/simpleTrade_new.db'):
        import shutil
        backup_path = f'db/simpleTrade_new_backup_{datetime.now().strftime("%Y%m%d_%H%M%S")}.db'
        shutil.copy2('db/simpleTrade_new.db', backup_path)
        print(f"💾 גיבוי נוצר: {backup_path}")
    
    remove_opened_at_column()
    
    print("\n✅ מחיקת השדה opened_at הושלמה!")

if __name__ == "__main__":
    from datetime import datetime
    main()
