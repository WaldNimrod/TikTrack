#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
הוספת נתוני טריידים מגוונים למערכת
"""

import sqlite3
import random
from datetime import datetime, timedelta
import json

def get_db_connection():
    """יצירת חיבור לבסיס הנתונים"""
    return sqlite3.connect('db/simpleTrade_new.db')

def get_existing_data():
    """קבלת נתונים קיימים מהמערכת"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # קבלת חשבונות
            cursor.execute('SELECT id, name, currency FROM accounts WHERE status = "open"')
    accounts = cursor.fetchall()
    
    # קבלת טיקרים
    cursor.execute('SELECT id, symbol, name FROM tickers')
    tickers = cursor.fetchall()
    
    # קבלת תוכניות
    cursor.execute('SELECT id, investment_type, planned_amount, created_at FROM trade_plans WHERE canceled_at IS NULL')
    trade_plans = cursor.fetchall()
    
    conn.close()
    
    return accounts, tickers, trade_plans

def generate_sample_trades():
    """יצירת נתוני טריידים מגוונים"""
    
    accounts, tickers, trade_plans = get_existing_data()
    
    if not accounts or not tickers:
        print("❌ אין מספיק נתונים במערכת (חשבונות או טיקרים)")
        return []
    
    # הגדרת טווחי תאריכים
    end_date = datetime.now()
    start_date = end_date - timedelta(days=180)  # 6 חודשים אחורה
    
    # סוגי השקעות מותרים
    investment_types = ['swing', 'investment', 'passive']
    
    # סטטוסים
    statuses = ['open', 'closed', 'cancelled']
    
    sample_trades = []
    
    # יצירת 15 טריידים מגוונים
    for i in range(1, 16):
        # בחירת נתונים אקראיים
        account = random.choice(accounts)
        ticker = random.choice(tickers)
        trade_plan = random.choice(trade_plans) if trade_plans else None
        
        # תאריך פתיחה אקראי
        opened_at = start_date + timedelta(
            days=random.randint(0, (end_date - start_date).days)
        )
        
        # סטטוס אקראי
        status = random.choice(statuses)
        
        # סוג השקעה אקראי
        investment_type = random.choice(investment_types)
        
        # תאריך סגירה (רק אם הסטטוס הוא סגור)
        closed_at = None
        if status == 'closed':
            closed_at = opened_at + timedelta(
                days=random.randint(1, 30)
            )
        
        # רווח/הפסד אקראי
        total_pl = 0
        if status == 'closed':
            # רווח/הפסד בין -5000 ל +8000
            total_pl = random.uniform(-5000, 8000)
        
        # הערות מגוונות
        notes_options = [
            "כניסה על בסיס ניתוח טכני",
            "יציאה עקב שבירת סטופ לוס",
            "רווח על בסיס דוח רווחים חיובי",
            "הפסד עקב שינויי שוק",
            "סווינג טרייד מוצלח",
            "השקעה ארוכת טווח",
            "יציאה מוקדמת עקב אי-ודאות",
            "רווח על בסיס חדשות חיוביות",
            "הפסד עקב חדשות שליליות",
            "טרייד פאסיבי",
            "כניסה על בסיס איתות טכני",
            "יציאה על בסיס יעד מחיר",
            "רווח על בסיס מגמה חזקה",
            "הפסד עקב היפוך מגמה",
            "טרייד על בסיס ניתוח פונדמנטלי"
        ]
        
        notes = random.choice(notes_options)
        
        trade = {
            'id': i,
            'account_id': account[0],
            'ticker_id': ticker[0],
            'trade_plan_id': trade_plan[0] if trade_plan else None,
            'status': status,
            'type': investment_type,
            'closed_at': closed_at.strftime('%Y-%m-%d %H:%M:%S') if closed_at else None,
            'total_pl': round(total_pl, 2),
            'notes': notes,
            'created_at': opened_at.strftime('%Y-%m-%d %H:%M:%S')
        }
        
        sample_trades.append(trade)
    
    return sample_trades

def insert_trades_to_db(trades):
    """הכנסת הטריידים לבסיס הנתונים"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # מחיקת טריידים קיימים (אופציונלי)
        cursor.execute('DELETE FROM trades')
        print("🗑️  נמחקו טריידים קיימים")
        
        # הכנסת הטריידים החדשים
        for trade in trades:
            cursor.execute('''
                INSERT INTO trades (
                    account_id, ticker_id, trade_plan_id, status, type,
                    closed_at, total_pl, notes, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                trade['account_id'], trade['ticker_id'], trade['trade_plan_id'],
                trade['status'], trade['type'], trade['closed_at'],
                trade['total_pl'], trade['notes'], trade['created_at']
            ))
        
        conn.commit()
        print(f"✅ הוכנסו {len(trades)} טריידים בהצלחה!")
        
        # הצגת סטטיסטיקות
        cursor.execute('SELECT status, COUNT(*) FROM trades GROUP BY status')
        status_stats = cursor.fetchall()
        print("\n📊 סטטיסטיקות טריידים:")
        for status, count in status_stats:
            print(f"  {status}: {count}")
        
        cursor.execute('SELECT type, COUNT(*) FROM trades GROUP BY type')
        type_stats = cursor.fetchall()
        print("\n📈 סוגי השקעות:")
        for type_name, count in type_stats:
            print(f"  {type_name}: {count}")
        
        cursor.execute('SELECT SUM(total_pl) FROM trades WHERE status = "closed"')
        total_pl = cursor.fetchone()[0] or 0
        print(f"\n💰 רווח/הפסד כולל (טריידים סגורים): ${total_pl:,.2f}")
        
    except Exception as e:
        print(f"❌ שגיאה בהכנסת הטריידים: {e}")
        conn.rollback()
    finally:
        conn.close()

def main():
    """פונקציה ראשית"""
    print("🚀 מתחיל הוספת נתוני טריידים מגוונים...")
    
    # יצירת נתוני טריידים
    trades = generate_sample_trades()
    
    if not trades:
        print("❌ לא נוצרו נתוני טריידים")
        return
    
    print(f"📝 נוצרו {len(trades)} טריידים")
    
    # הצגת דוגמה
    print("\n📋 דוגמה לטרייד:")
    sample_trade = trades[0]
    print(json.dumps(sample_trade, indent=2, ensure_ascii=False))
    
    # הכנסה לבסיס הנתונים
    insert_trades_to_db(trades)
    
    print("\n✅ הוספת נתוני טריידים הושלמה!")

if __name__ == "__main__":
    main()
