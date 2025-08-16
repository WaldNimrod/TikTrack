#!/usr/bin/env python3
"""
סקריפט להוספת התראות דוגמה לבסיס הנתונים
"""

import sqlite3
import datetime
import random
from pathlib import Path

# נתיב לבסיס הנתונים
DB_PATH = Path(__file__).parent / "db" / "simpleTrade.db"

def create_alerts_table():
    """יצירת טבלת התראות אם לא קיימת"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            ticker TEXT,
            alert_type TEXT,
            current_price REAL,
            target_price REAL,
            volume INTEGER,
            avg_volume INTEGER,
            price_change REAL,
            support_level REAL,
            profit_target REAL,
            current_profit REAL,
            stop_loss REAL,
            is_triggered TEXT DEFAULT 'new',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()
    print("✅ טבלת התראות נוצרה/נבדקה")

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
            'title': 'התראה על מחיר נכס',
            'message': 'מחיר AAPL הגיע ליעד המחיר שהוגדר',
            'ticker': 'AAPL',
            'alert_type': 'price_target',
            'current_price': 185.50,
            'target_price': 185.00,
            'created_at': datetime.datetime.now() - datetime.timedelta(minutes=30)
        },
        {
            'title': 'התראה על נפח מסחר',
            'message': 'נפח המסחר ב-TSLA עלה ב-50% מהממוצע היומי',
            'ticker': 'TSLA',
            'alert_type': 'volume_spike',
            'volume': 15000000,
            'avg_volume': 10000000,
            'created_at': datetime.datetime.now() - datetime.timedelta(hours=2)
        },
        {
            'title': 'התראה על תנועת מחיר',
            'message': 'MSFT עלה ב-3% במהלך השעה האחרונה',
            'ticker': 'MSFT',
            'alert_type': 'price_movement',
            'price_change': 3.2,
            'created_at': datetime.datetime.now() - datetime.timedelta(minutes=45)
        },
        {
            'title': 'התראה על תמיכה/התנגדות',
            'message': 'GOOGL מתקרב לקו התמיכה הקריטי',
            'ticker': 'GOOGL',
            'alert_type': 'support_resistance',
            'support_level': 140.00,
            'current_price': 141.50,
            'created_at': datetime.datetime.now() - datetime.timedelta(minutes=15)
        },
        {
            'title': 'התראה על רווח',
            'message': 'NVDA הגיע ליעד הרווח שהוגדר',
            'ticker': 'NVDA',
            'alert_type': 'profit_target',
            'profit_target': 5.0,
            'current_profit': 5.2,
            'created_at': datetime.datetime.now() - datetime.timedelta(minutes=10)
        }
    ]
    
    # הוספת התראות - כולן חדשות
    for i, alert in enumerate(sample_alerts):
        # כל ההתראות חדשות (is_triggered = new)
        is_triggered = 'new'
        
        cursor.execute('''
            INSERT INTO alerts (
                title, message, ticker, alert_type, current_price, target_price,
                volume, avg_volume, price_change, support_level, profit_target,
                current_profit, stop_loss, is_triggered, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            alert['title'],
            alert['message'],
            alert['ticker'],
            alert['alert_type'],
            alert.get('current_price'),
            alert.get('target_price'),
            alert.get('volume'),
            alert.get('avg_volume'),
            alert.get('price_change'),
            alert.get('support_level'),
            alert.get('profit_target'),
            alert.get('current_profit'),
            alert.get('stop_loss'),
            is_triggered,
            alert['created_at']
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
