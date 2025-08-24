#!/usr/bin/env python3
"""
Script to add sample alerts to the database
"""

import sqlite3
import datetime
from pathlib import Path

# Database path
DB_PATH = Path("Backend/db/simpleTrade_new.db")

def add_sample_alerts():
    """Add sample alerts to the database"""
    
    # Connect to database
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Sample alerts data
    sample_alerts = [
        # טיקר התראות
        {
            'type': 'price_alert',
            'status': 'open',
            'condition': 'price_target',
            'message': 'Apple הגיע ליעד המחיר',
            'triggered_at': datetime.datetime.now() - datetime.timedelta(minutes=5),
            'is_triggered': 'new',
            'related_type_id': 4,  # טיקר
            'related_id': 1,  # AAPL
            'created_at': datetime.datetime.now() - datetime.timedelta(hours=2)
        },
        {
            'type': 'volume_alert',
            'status': 'open',
            'condition': 'volume_high',
            'message': 'נפח מסחר גבוה ב-NVIDIA',
            'triggered_at': datetime.datetime.now() - datetime.timedelta(minutes=15),
            'is_triggered': 'new',
            'related_type_id': 4,  # טיקר
            'related_id': 5,  # NVDA
            'created_at': datetime.datetime.now() - datetime.timedelta(hours=1)
        },
        {
            'type': 'price_alert',
            'status': 'open',
            'condition': 'stop_loss',
            'message': 'Google הגיע לעצירת הפסד',
            'triggered_at': datetime.datetime.now() - datetime.timedelta(minutes=30),
            'is_triggered': 'new',
            'related_type_id': 4,  # טיקר
            'related_id': 2,  # GOOGL
            'created_at': datetime.datetime.now() - datetime.timedelta(hours=3)
        },
        {
            'type': 'technical_alert',
            'status': 'open',
            'condition': 'breakout',
            'message': 'פריצת התנגדות ב-Microsoft',
            'triggered_at': datetime.datetime.now() - datetime.timedelta(minutes=45),
            'is_triggered': 'new',
            'related_type_id': 4,  # טיקר
            'related_id': 3,  # MSFT
            'created_at': datetime.datetime.now() - datetime.timedelta(hours=4)
        },
        {
            'type': 'price_alert',
            'status': 'open',
            'condition': 'daily_change_positive',
            'message': 'Tesla עלה 5% היום',
            'triggered_at': datetime.datetime.now() - datetime.timedelta(minutes=10),
            'is_triggered': 'new',
            'related_type_id': 4,  # טיקר
            'related_id': 4,  # TSLA
            'created_at': datetime.datetime.now() - datetime.timedelta(hours=2)
        },
        # טרייד התראות
        {
            'type': 'trade_alert',
            'status': 'open',
            'condition': 'profit_target',
            'message': 'טרייד AAPL הגיע ליעד רווח',
            'triggered_at': datetime.datetime.now() - datetime.timedelta(minutes=20),
            'is_triggered': 'new',
            'related_type_id': 2,  # טרייד
            'related_id': 1,
            'created_at': datetime.datetime.now() - datetime.timedelta(hours=1)
        },
        {
            'type': 'trade_alert',
            'status': 'open',
            'condition': 'stop_loss',
            'message': 'טרייד GOOGL הגיע לעצירת הפסד',
            'triggered_at': datetime.datetime.now() - datetime.timedelta(minutes=25),
            'is_triggered': 'new',
            'related_type_id': 2,  # טרייד
            'related_id': 2,
            'created_at': datetime.datetime.now() - datetime.timedelta(hours=2)
        },
        # תוכנית התראות
        {
            'type': 'plan_alert',
            'status': 'open',
            'condition': 'entry_condition',
            'message': 'תנאי כניסה לתוכנית SPY התקיים',
            'triggered_at': datetime.datetime.now() - datetime.timedelta(minutes=35),
            'is_triggered': 'new',
            'related_type_id': 3,  # תוכנית
            'related_id': 1,
            'created_at': datetime.datetime.now() - datetime.timedelta(hours=3)
        },
        {
            'type': 'plan_alert',
            'status': 'open',
            'condition': 'price_target',
            'message': 'תוכנית QQQ הגיעה ליעד המחיר',
            'triggered_at': datetime.datetime.now() - datetime.timedelta(minutes=40),
            'is_triggered': 'new',
            'related_type_id': 3,  # תוכנית
            'related_id': 2,
            'created_at': datetime.datetime.now() - datetime.timedelta(hours=4)
        },
        # חשבון התראות
        {
            'type': 'account_alert',
            'status': 'open',
            'condition': 'balance_low',
            'message': 'יתרה נמוכה בחשבון השקעות',
            'triggered_at': datetime.datetime.now() - datetime.timedelta(minutes=50),
            'is_triggered': 'new',
            'related_type_id': 1,  # חשבון
            'related_id': 1,
            'created_at': datetime.datetime.now() - datetime.timedelta(hours=5)
        },
        {
            'type': 'account_alert',
            'status': 'open',
            'condition': 'profit_milestone',
            'message': 'חשבון מסחר הגיע ליעד רווח חודשי',
            'triggered_at': datetime.datetime.now() - datetime.timedelta(minutes=55),
            'is_triggered': 'new',
            'related_type_id': 1,  # חשבון
            'related_id': 2,
            'created_at': datetime.datetime.now() - datetime.timedelta(hours=6)
        }
    ]
    
    # Insert alerts
    for alert in sample_alerts:
        cursor.execute("""
            INSERT INTO alerts (
                type, status, condition, message, triggered_at, is_triggered,
                related_type_id, related_id, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            alert['type'],
            alert['status'],
            alert['condition'],
            alert['message'],
            alert['triggered_at'].isoformat(),
            alert['is_triggered'],
            alert['related_type_id'],
            alert['related_id'],
            alert['created_at'].isoformat()
        ))
    
    # Commit changes
    conn.commit()
    conn.close()
    
    print(f"✅ Added {len(sample_alerts)} sample alerts to database")

if __name__ == "__main__":
    add_sample_alerts()
