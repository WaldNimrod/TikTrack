#!/usr/bin/env python3
"""
סקריפט להוספת מגוון תכנונים לבסיס הנתונים
מכיל תכנונים עם:
- מגוון תאריכים (לפילטר תאריכים)
- מגוון סוגים (swing, investment, passive)
- מגוון צדדים (Long, Short)
- מגוון סטטוסים (open, closed, cancelled)
- תכנונים ישנים וחדשים
"""

import sqlite3
from datetime import datetime, timedelta
import random

def add_diverse_trade_plans():
    # חיבור לבסיס הנתונים
    conn = sqlite3.connect('Backend/db/simpleTrade_new.db')
    cursor = conn.cursor()
    
    # נתוני טיקרים (רק הטיקרים האמיתיים, לא TEST)
    tickers = [
        (1, 'AAPL'), (2, 'GOOGL'), (3, 'MSFT'), (4, 'TSLA'), 
        (5, 'NVDA'), (6, 'AMZN'), (7, 'META'), (8, 'NFLX'),
        (9, 'SPY'), (10, 'QQQ')
    ]
    
    # נתוני חשבונות
    accounts = [
        (1, 'חשבון ראשי'), (2, 'חשבון טכנולוגיה'), 
        (3, 'חשבון ETF'), (4, 'חשבון ניסיוני')
    ]
    
    # סוגי השקעה
    investment_types = ['swing', 'investment', 'passive']
    
    # צדדים
    sides = ['Long', 'Short']
    
    # סטטוסים
    statuses = ['open', 'closed', 'cancelled']
    
    # הכנת תכנונים מגוונים
    trade_plans = []
    
    # תכנונים ישנים מאוד (לפני 6 חודשים)
    old_date = datetime.now() - timedelta(days=180)
    
    # תכנון ישן מאוד - סגור
    trade_plans.append({
        'account_id': 1,
        'ticker_id': 1,  # AAPL
        'investment_type': 'investment',
        'side': 'Long',
        'status': 'closed',
        'planned_amount': 15000.0,
        'entry_conditions': 'קנייה מתחת ל-150$',
        'stop_price': 140.0,
        'target_price': 200.0,
        'reasons': 'חברה חזקה עם מוצרים איכותיים',
        'created_at': old_date.strftime('%Y-%m-%d %H:%M:%S'),
        'canceled_at': None,
        'cancel_reason': None
    })
    
    # תכנון ישן מאוד - מבוטל
    trade_plans.append({
        'account_id': 2,
        'ticker_id': 2,  # GOOGL
        'investment_type': 'swing',
        'side': 'Short',
        'status': 'cancelled',
        'planned_amount': 8000.0,
        'entry_conditions': 'מכירה מעל 2800$',
        'stop_price': 2900.0,
        'target_price': 2600.0,
        'reasons': 'תנודתיות גבוהה בשוק',
        'created_at': old_date.strftime('%Y-%m-%d %H:%M:%S'),
        'canceled_at': (old_date + timedelta(days=30)).strftime('%Y-%m-%d %H:%M:%S'),
        'cancel_reason': 'שינוי בתנאי השוק'
    })
    
    # תכנונים ישנים (לפני 3 חודשים)
    medium_old_date = datetime.now() - timedelta(days=90)
    
    # תכנון ישן - סגור
    trade_plans.append({
        'account_id': 3,
        'ticker_id': 9,  # SPY
        'investment_type': 'passive',
        'side': 'Long',
        'status': 'closed',
        'planned_amount': 20000.0,
        'entry_conditions': 'קנייה מתחת ל-400$',
        'stop_price': 380.0,
        'target_price': 450.0,
        'reasons': 'השקעה פסיבית ב-S&P 500',
        'created_at': medium_old_date.strftime('%Y-%m-%d %H:%M:%S'),
        'canceled_at': None,
        'cancel_reason': None
    })
    
    # תכנון ישן - מבוטל
    trade_plans.append({
        'account_id': 1,
        'ticker_id': 4,  # TSLA
        'investment_type': 'swing',
        'side': 'Long',
        'status': 'cancelled',
        'planned_amount': 12000.0,
        'entry_conditions': 'קנייה מתחת ל-200$',
        'stop_price': 180.0,
        'target_price': 250.0,
        'reasons': 'טכנולוגיה מתקדמת',
        'created_at': medium_old_date.strftime('%Y-%m-%d %H:%M:%S'),
        'canceled_at': (medium_old_date + timedelta(days=45)).strftime('%Y-%m-%d %H:%M:%S'),
        'cancel_reason': 'תנודתיות גבוהה מדי'
    })
    
    # תכנונים מהחודש האחרון
    recent_date = datetime.now() - timedelta(days=30)
    
    # תכנון מהחודש האחרון - פתוח
    trade_plans.append({
        'account_id': 2,
        'ticker_id': 5,  # NVDA
        'investment_type': 'investment',
        'side': 'Long',
        'status': 'open',
        'planned_amount': 25000.0,
        'entry_conditions': 'קנייה מתחת ל-800$',
        'stop_price': 750.0,
        'target_price': 1000.0,
        'reasons': 'AI וטכנולוגיה מתקדמת',
        'created_at': recent_date.strftime('%Y-%m-%d %H:%M:%S'),
        'canceled_at': None,
        'cancel_reason': None
    })
    
    # תכנון מהחודש האחרון - פתוח
    trade_plans.append({
        'account_id': 3,
        'ticker_id': 10,  # QQQ
        'investment_type': 'passive',
        'side': 'Long',
        'status': 'open',
        'planned_amount': 18000.0,
        'entry_conditions': 'קנייה מתחת ל-350$',
        'stop_price': 330.0,
        'target_price': 400.0,
        'reasons': 'ETF טכנולוגיה',
        'created_at': recent_date.strftime('%Y-%m-%d %H:%M:%S'),
        'canceled_at': None,
        'cancel_reason': None
    })
    
    # תכנונים מהשבוע האחרון
    week_ago = datetime.now() - timedelta(days=7)
    
    # תכנון מהשבוע האחרון - פתוח
    trade_plans.append({
        'account_id': 1,
        'ticker_id': 6,  # AMZN
        'investment_type': 'swing',
        'side': 'Short',
        'status': 'open',
        'planned_amount': 15000.0,
        'entry_conditions': 'מכירה מעל 180$',
        'stop_price': 190.0,
        'target_price': 160.0,
        'reasons': 'תיקון טכני צפוי',
        'created_at': week_ago.strftime('%Y-%m-%d %H:%M:%S'),
        'canceled_at': None,
        'cancel_reason': None
    })
    
    # תכנון מהשבוע האחרון - פתוח
    trade_plans.append({
        'account_id': 4,
        'ticker_id': 7,  # META
        'investment_type': 'investment',
        'side': 'Long',
        'status': 'open',
        'planned_amount': 22000.0,
        'entry_conditions': 'קנייה מתחת ל-300$',
        'stop_price': 280.0,
        'target_price': 350.0,
        'reasons': 'מדיה חברתית ופרסום',
        'created_at': week_ago.strftime('%Y-%m-%d %H:%M:%S'),
        'canceled_at': None,
        'cancel_reason': None
    })
    
    # תכנונים מהיום
    today = datetime.now()
    
    # תכנון מהיום - פתוח
    trade_plans.append({
        'account_id': 2,
        'ticker_id': 8,  # NFLX
        'investment_type': 'swing',
        'side': 'Short',
        'status': 'open',
        'planned_amount': 10000.0,
        'entry_conditions': 'מכירה מעל 600$',
        'stop_price': 620.0,
        'target_price': 550.0,
        'reasons': 'תחרות בשוק הסטרימינג',
        'created_at': today.strftime('%Y-%m-%d %H:%M:%S'),
        'canceled_at': None,
        'cancel_reason': None
    })
    
    # תכנון מהיום - פתוח
    trade_plans.append({
        'account_id': 3,
        'ticker_id': 3,  # MSFT
        'investment_type': 'passive',
        'side': 'Long',
        'status': 'open',
        'planned_amount': 30000.0,
        'entry_conditions': 'קנייה מתחת ל-400$',
        'stop_price': 380.0,
        'target_price': 450.0,
        'reasons': 'חברה יציבה עם הכנסות קבועות',
        'created_at': today.strftime('%Y-%m-%d %H:%M:%S'),
        'canceled_at': None,
        'cancel_reason': None
    })
    
    # הוספת התכנונים לבסיס הנתונים
    for plan in trade_plans:
        cursor.execute('''
            INSERT INTO trade_plans (
                account_id, ticker_id, investment_type, side, status,
                planned_amount, entry_conditions, stop_price, target_price,
                reasons, created_at, canceled_at, cancel_reason
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            plan['account_id'], plan['ticker_id'], plan['investment_type'],
            plan['side'], plan['status'], plan['planned_amount'],
            plan['entry_conditions'], plan['stop_price'], plan['target_price'],
            plan['reasons'], plan['created_at'], plan['canceled_at'],
            plan['cancel_reason']
        ))
    
    # שמירת השינויים
    conn.commit()
    
    # הדפסת סיכום
    print(f"✅ נוספו {len(trade_plans)} תכנונים חדשים לבסיס הנתונים")
    print("\n📊 סיכום התכנונים שנוספו:")
    
    for i, plan in enumerate(trade_plans, 1):
        ticker_symbol = next((t[1] for t in tickers if t[0] == plan['ticker_id']), 'Unknown')
        account_name = next((a[1] for a in accounts if a[0] == plan['account_id']), 'Unknown')
        
        print(f"{i}. {ticker_symbol} - {plan['investment_type']} - {plan['side']} - {plan['status']}")
        print(f"   חשבון: {account_name}, סכום: ${plan['planned_amount']:,.0f}")
        print(f"   תאריך: {plan['created_at']}")
        print()
    
    # סגירת החיבור
    conn.close()
    
    print("🎉 הוספת התכנונים הושלמה בהצלחה!")

if __name__ == "__main__":
    add_diverse_trade_plans()
