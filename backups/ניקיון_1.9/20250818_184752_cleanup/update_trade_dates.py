#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
עדכון תאריכי טריידים עם מגוון משנת 2024 ועד היום

עדכון: אוגוסט 2025
מטרה: יצירת מגוון תאריכים ריאליסטי לטריידים קיימים

שינויים:
- עדכון שדה created_at לתאריכים בין 2024 להיום
- עדכון שדה closed_at לטריידים סגורים בלבד
- יצירת מגוון תאריכים אקראי וריאליסטי

לוגיקה:
- תאריך פתיחה: אקראי בין 1.1.2024 להיום
- תאריך סגירה: רק לטריידים עם סטטוס 'closed'
- משך טרייד: 1-90 ימים לטריידים סגורים
- וידוא: תאריך סגירה לא עובר את היום

תוצאה: נתונים ריאליסטיים לבדיקת המערכת
"""

import sqlite3
import random
from datetime import datetime, timedelta
import json

def get_db_connection():
    """יצירת חיבור לבסיס הנתונים"""
    return sqlite3.connect('db/simpleTrade_new.db')

def update_trade_dates():
    """עדכון תאריכי הטריידים עם מגוון משנת 2024 ועד היום"""
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # קבלת כל הטריידים
        cursor.execute('SELECT id, status FROM trades ORDER BY id')
        trades = cursor.fetchall()
        
        print(f"📝 עדכון תאריכים ל-{len(trades)} טריידים...")
        
        # הגדרת טווחי תאריכים
        end_date = datetime.now()
        start_date_2024 = datetime(2024, 1, 1)
        
        # יצירת מגוון תאריכים משנת 2024 ועד היום
        date_range_days = (end_date - start_date_2024).days
        
        for trade_id, status in trades:
            # תאריך פתיחה אקראי בין 2024 להיום
            opened_at = start_date_2024 + timedelta(
                days=random.randint(0, date_range_days)
            )
            
            # תאריך סגירה (רק אם הסטטוס הוא סגור)
            closed_at = None
            if status == 'closed':
                # תאריך סגירה בין יום אחד ל-90 ימים אחרי הפתיחה
                days_after_opening = random.randint(1, 90)
                closed_at = opened_at + timedelta(days=days_after_opening)
                
                # וידוא שתאריך הסגירה לא עובר את היום
                if closed_at > end_date:
                    closed_at = end_date - timedelta(days=random.randint(0, 7))
            
            # עדכון הטרייד
            if closed_at:
                cursor.execute('''
                    UPDATE trades 
                    SET created_at = ?, closed_at = ?
                    WHERE id = ?
                ''', (opened_at.strftime('%Y-%m-%d %H:%M:%S'), 
                      closed_at.strftime('%Y-%m-%d %H:%M:%S'), 
                      trade_id))
            else:
                cursor.execute('''
                    UPDATE trades 
                    SET created_at = ?
                    WHERE id = ?
                ''', (opened_at.strftime('%Y-%m-%d %H:%M:%S'), trade_id))
            
            print(f"  טרייד {trade_id}: פתיחה {opened_at.strftime('%Y-%m-%d')}, סגירה {closed_at.strftime('%Y-%m-%d') if closed_at else 'לא נסגר'}")
        
        conn.commit()
        print("✅ תאריכי הטריידים עודכנו בהצלחה!")
        
        # הצגת סטטיסטיקות
        cursor.execute('''
            SELECT 
                MIN(created_at) as earliest_date,
                MAX(created_at) as latest_date,
                COUNT(*) as total_trades,
                COUNT(closed_at) as closed_trades
            FROM trades
        ''')
        stats = cursor.fetchone()
        
        print(f"\n📊 סטטיסטיקות תאריכים:")
        print(f"  תאריך מוקדם ביותר: {stats[0]}")
        print(f"  תאריך מאוחר ביותר: {stats[1]}")
        print(f"  סה\"כ טריידים: {stats[2]}")
        print(f"  טריידים סגורים: {stats[3]}")
        
        # הצגת דוגמאות
        cursor.execute('''
            SELECT id, status, created_at, closed_at 
            FROM trades 
            ORDER BY created_at DESC 
            LIMIT 5
        ''')
        recent_trades = cursor.fetchall()
        
        print(f"\n📋 דוגמאות טריידים אחרונים:")
        for trade in recent_trades:
            print(f"  טרייד {trade[0]}: {trade[1]} - פתיחה: {trade[2]}, סגירה: {trade[3] or 'לא נסגר'}")
        
    except Exception as e:
        print(f"❌ שגיאה בעדכון תאריכים: {e}")
        conn.rollback()
    finally:
        conn.close()

def main():
    """פונקציה ראשית"""
    print("🚀 מתחיל עדכון תאריכי טריידים...")
    print("📅 מגוון תאריכים: 2024-01-01 עד היום")
    
    update_trade_dates()
    
    print("\n✅ עדכון תאריכי טריידים הושלם!")

if __name__ == "__main__":
    main()
