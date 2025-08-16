#!/usr/bin/env python3
"""
סקריפט להוספת התראות דוגמה לבסיס הנתונים
"""

import sqlite3
import datetime
import random
from pathlib import Path

# נתיב לבסיס הנתונים
DB_PATH = Path(__file__).parent / "db" / "simpleTrade_new.db"

def create_alerts_table():
    """יצירת טבלת התראות אם לא קיימת"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # בדיקה אם הטבלה קיימת
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='alerts'")
    if cursor.fetchone():
        print("✅ טבלת התראות קיימת")
    else:
        print("❌ טבלת התראות לא קיימת - יש ליצור אותה דרך השרת")
    
    conn.close()

def add_sample_alerts():
    """הוספת התראות דוגמה"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # מחיקת התראות קיימות
    cursor.execute("DELETE FROM alerts")
    print("🗑️ התראות קיימות נמחקו")
    
    # רשימת התראות דוגמה - 5 התראות חדשות בלבד
    sample_alerts = [
        {
            'type': 'price_target',
            'condition': 'מחיר AAPL הגיע ליעד המחיר שהוגדר',
            'message': 'מחיר AAPL הגיע ליעד המחיר שהוגדר',
            'is_active': True,
            'is_triggered': 'new'
        },
        {
            'type': 'volume_spike',
            'condition': 'נפח המסחר ב-TSLA עלה ב-50% מהממוצע היומי',
            'message': 'נפח המסחר ב-TSLA עלה ב-50% מהממוצע היומי',
            'is_active': True,
            'is_triggered': 'new'
        },
        {
            'type': 'price_movement',
            'condition': 'MSFT עלה ב-3% במהלך השעה האחרונה',
            'message': 'MSFT עלה ב-3% במהלך השעה האחרונה',
            'is_active': True,
            'is_triggered': 'new'
        },
        {
            'type': 'support_resistance',
            'condition': 'GOOGL מתקרב לקו התמיכה הקריטי',
            'message': 'GOOGL מתקרב לקו התמיכה הקריטי',
            'is_active': True,
            'is_triggered': 'new'
        },
        {
            'type': 'profit_target',
            'condition': 'NVDA הגיע ליעד הרווח שהוגדר',
            'message': 'NVDA הגיע ליעד הרווח שהוגדר',
            'is_active': True,
            'is_triggered': 'new'
        }
    ]
    
    # הוספת התראות - כולן חדשות
    for i, alert in enumerate(sample_alerts):
        # כל ההתראות חדשות (is_triggered = new)
        is_triggered = 'new'
        
        cursor.execute('''
            INSERT INTO alerts (
                type, condition, message, is_active, is_triggered, created_at
            ) VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            alert['type'],
            alert['condition'],
            alert['message'],
            alert['is_active'],
            alert['is_triggered'],
            datetime.datetime.now()
        ))
    
    conn.commit()
    conn.close()
    print(f"✅ {len(sample_alerts)} התראות דוגמה נוספו לבסיס הנתונים")
    print("📊 5 התראות חדשות (is_triggered = 'new')")
    print("🔔 מוכנות לתצוגה בכרטיסיות")

def main():
    """פונקציה ראשית"""
    print("🚀 התחלת הוספת התראות דוגמה...")
    
    try:
        create_alerts_table()
        add_sample_alerts()
        print("✅ הוספת התראות דוגמה הושלמה בהצלחה!")
        
    except Exception as e:
        print(f"❌ שגיאה: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())
