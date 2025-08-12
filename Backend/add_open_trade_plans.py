#!/usr/bin/env python3
"""
סקריפט להוספת 6 תכנוני טרייד פתוחים חדשים
"""
import sqlite3
import os
from datetime import datetime, timedelta

def get_db_connection():
    db_path = os.path.join(os.path.dirname(__file__), 'db', 'simpleTrade.db')
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def get_accounts_and_tickers():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # קבלת חשבונות
    cursor.execute("SELECT id, name FROM accounts ORDER BY id")
    accounts = cursor.fetchall()
    
    # קבלת טיקרים
    cursor.execute("SELECT id, symbol FROM tickers ORDER BY id")
    tickers = cursor.fetchall()
    
    conn.close()
    return accounts, tickers

def add_open_trade_plans():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    accounts, tickers = get_accounts_and_tickers()
    
    if not accounts:
        print("❌ אין חשבונות במערכת")
        return
    
    if not tickers:
        print("❌ אין טיקרים במערכת")
        return
    
    print(f"📋 נמצאו {len(accounts)} חשבונות ו-{len(tickers)} טיקרים")
    
    # נתונים לדוגמה לתכנונים פתוחים
    sample_plans = [
        {
            'account_id': accounts[0]['id'],
            'ticker_id': tickers[0]['id'],
            'investment_type': 'מניות',
            'side': 'קנייה',
            'planned_amount': 10000,
            'entry_conditions': 'מחיר מתחת ל-50$',
            'stop_price': 45.0,
            'target_price': 60.0,
            'reasons': 'אנליזה טכנית חיובית, תמיכה חזקה',
            'status': 'פתוח'
        },
        {
            'account_id': accounts[0]['id'] if len(accounts) > 0 else 1,
            'ticker_id': tickers[1]['id'] if len(tickers) > 1 else 1,
            'investment_type': 'אופציות',
            'side': 'מכירה',
            'planned_amount': 5000,
            'entry_conditions': 'מחיר מעל 100$',
            'stop_price': 105.0,
            'target_price': 90.0,
            'reasons': 'התנגדות חזקה, סימני היחלשות',
            'status': 'פתוח'
        },
        {
            'account_id': accounts[1]['id'] if len(accounts) > 1 else accounts[0]['id'],
            'ticker_id': tickers[2]['id'] if len(tickers) > 2 else tickers[0]['id'],
            'investment_type': 'מניות',
            'side': 'קנייה',
            'planned_amount': 15000,
            'entry_conditions': 'פריצת התנגדות ב-75$',
            'stop_price': 70.0,
            'target_price': 85.0,
            'reasons': 'פריצה טכנית, נפח גבוה',
            'status': 'פתוח'
        },
        {
            'account_id': accounts[0]['id'],
            'ticker_id': tickers[3]['id'] if len(tickers) > 3 else tickers[1]['id'],
            'investment_type': 'אופציות',
            'side': 'קנייה',
            'planned_amount': 8000,
            'entry_conditions': 'תיקון טכני עד 30$',
            'stop_price': 28.0,
            'target_price': 40.0,
            'reasons': 'תיקון טבעי, תמיכה היסטורית',
            'status': 'פתוח'
        },
        {
            'account_id': accounts[1]['id'] if len(accounts) > 1 else accounts[0]['id'],
            'ticker_id': tickers[4]['id'] if len(tickers) > 4 else tickers[2]['id'],
            'investment_type': 'מניות',
            'side': 'מכירה',
            'planned_amount': 12000,
            'entry_conditions': 'שבירת תמיכה ב-25$',
            'stop_price': 27.0,
            'target_price': 20.0,
            'reasons': 'שבירה טכנית, נפח גבוה',
            'status': 'פתוח'
        },
        {
            'account_id': accounts[0]['id'],
            'ticker_id': tickers[5]['id'] if len(tickers) > 5 else tickers[0]['id'],
            'investment_type': 'אופציות',
            'side': 'מכירה',
            'planned_amount': 6000,
            'entry_conditions': 'מחיר מתחת ל-15$',
            'stop_price': 16.0,
            'target_price': 12.0,
            'reasons': 'מגמה יורדת, התנגדות חזקה',
            'status': 'פתוח'
        }
    ]
    
    print("\n🚀 מוסיף 6 תכנונים פתוחים...")
    
    for i, plan_data in enumerate(sample_plans, 1):
        # הוספת תאריך יצירה (לפני כמה ימים)
        created_at = datetime.now() - timedelta(days=i)
        
        cursor.execute("""
            INSERT INTO trade_plans 
            (account_id, ticker_id, investment_type, side, planned_amount, 
             entry_conditions, stop_price, target_price, reasons, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            plan_data['account_id'],
            plan_data['ticker_id'],
            plan_data['investment_type'],
            plan_data['side'],
            plan_data['planned_amount'],
            plan_data['entry_conditions'],
            plan_data['stop_price'],
            plan_data['target_price'],
            plan_data['reasons'],
            plan_data['status'],
            created_at.strftime('%Y-%m-%d %H:%M:%S')
        ))
        
        plan_id = cursor.lastrowid
        print(f"   ✅ תכנון {plan_id}: {plan_data['investment_type']} - {plan_data['side']} - {plan_data['planned_amount']:,} ₪")
    
    conn.commit()
    conn.close()
    
    print(f"\n🎉 נוספו בהצלחה 6 תכנונים פתוחים!")

def verify_open_plans():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    print("\n🔍 אימות התכנונים הפתוחים...")
    
    cursor.execute("""
        SELECT 
            tp.id,
            tp.status,
            tp.created_at,
            tp.investment_type,
            tp.side,
            tp.planned_amount,
            a.name as account_name,
            t.symbol as ticker_symbol
        FROM trade_plans tp
        JOIN accounts a ON tp.account_id = a.id
        JOIN tickers t ON tp.ticker_id = t.id
        WHERE tp.status = 'פתוח'
        ORDER BY tp.id DESC
        LIMIT 10
    """)
    
    open_plans = cursor.fetchall()
    
    print(f"📊 תכנונים פתוחים במערכת: {len(open_plans)}")
    for plan in open_plans:
        print(f"   - תכנון {plan['id']}: {plan['investment_type']} {plan['side']} {plan['ticker_symbol']} - {plan['planned_amount']:,} ₪ ({plan['account_name']})")
    
    cursor.execute("SELECT COUNT(*) as count, status FROM trade_plans GROUP BY status ORDER BY status")
    status_summary = cursor.fetchall()
    
    print("\n📈 סיכום סטטוסי תכנונים:")
    for status in status_summary:
        print(f"   - {status['status']}: {status['count']} תכנונים")
    
    conn.close()

def main():
    print("🚀 מתחיל הוספת תכנונים פתוחים")
    print("=" * 50)
    
    add_open_trade_plans()
    verify_open_plans()
    
    print("\n✅ התהליך הושלם בהצלחה!")

if __name__ == "__main__":
    main()

