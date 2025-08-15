#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
סקריפט להוספת נתוני טריידים לבסיס הנתונים
מוסיף 4 טריידים: 2 במצב פתוח ו-2 במצב סגור
"""

import sqlite3
from datetime import datetime, timedelta
import sys
import os

# הוספת הנתיב לפרויקט
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def get_db_connection():
    """יצירת חיבור לבסיס הנתונים"""
    try:
        conn = sqlite3.connect('db/simpleTrade.db')
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys=ON")
        return conn
    except Exception as e:
        print(f"שגיאה בחיבור לבסיס הנתונים: {e}")
        raise

def validate_trade_data(data):
    """
    וולידציה של נתוני הטרייד
    מחזיר רשימת שגיאות או רשימה ריקה אם הכל תקין
    """
    errors = []
    
    # בדיקת שדות חובה
    if not data.get('account_id'):
        errors.append("account_id הוא שדה חובה")
    
    if not data.get('ticker_id'):
        errors.append("ticker_id הוא שדה חובה")
    
    # בדיקת ערכים חיוביים
    if data.get('total_pl') is not None and data['total_pl'] < 0:
        # total_pl יכול להיות שלילי (הפסד)
        pass
    
    # בדיקת אורך מחרוזות
    if data.get('status') and len(data['status']) > 20:
        errors.append("status לא יכול להיות ארוך מ-20 תווים")
    
    if data.get('type') and len(data['type']) > 20:
        errors.append("type לא יכול להיות ארוך מ-20 תווים")
    
    if data.get('notes') and len(data['notes']) > 500:
        errors.append("notes לא יכול להיות ארוך מ-500 תווים")
    
    if data.get('cancel_reason') and len(data['cancel_reason']) > 500:
        errors.append("cancel_reason לא יכול להיות ארוך מ-500 תווים")
    
    # בדיקת עקביות סטטוס
    if data.get('status') == 'closed' and not data.get('closed_at'):
        errors.append("טרייד סגור חייב לכלול closed_at")
    
    if data.get('status') == 'cancelled' and not data.get('cancelled_at'):
        errors.append("טרייד מבוטל חייב לכלול cancelled_at")
    
    if data.get('cancelled_at') and not data.get('cancel_reason'):
        errors.append("טרייד מבוטל חייב לכלול cancel_reason")
    
    # בדיקת תאריכים
    if (data.get('opened_at') and data.get('closed_at') and 
        data['opened_at'] >= data['closed_at']):
        errors.append("opened_at חייב להיות מוקדם מ-closed_at")
    
    if (data.get('opened_at') and data.get('cancelled_at') and 
        data['opened_at'] >= data['cancelled_at']):
        errors.append("opened_at חייב להיות מוקדם מ-cancelled_at")
    
    return errors

def add_trades():
    """הוספת 4 טריידים חדשים לבסיס הנתונים"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # קבלת חשבונות, טיקרים ותכנונים קיימים
        cursor.execute("SELECT id, name FROM accounts WHERE status = 'active' LIMIT 2")
        accounts = cursor.fetchall()
        
        cursor.execute("SELECT id, symbol FROM tickers ORDER BY id LIMIT 4")
        tickers = cursor.fetchall()
        
        cursor.execute("SELECT id FROM trade_plans WHERE canceled_at IS NULL ORDER BY id LIMIT 2")
        active_plans = cursor.fetchall()
        
        if not accounts:
            print("❌ לא נמצאו חשבונות פעילים")
            return
        
        if not tickers:
            print("❌ לא נמצאו טיקרים")
            return
        
        print(f"✅ נמצאו {len(accounts)} חשבונות, {len(tickers)} טיקרים ו-{len(active_plans)} תכנונים פעילים")
        
        # נתוני טריידים להוספה
        trades_data = [
            # טרייד 1 - פתוח (buy)
            {
                'account_id': accounts[0]['id'],
                'ticker_id': tickers[0]['id'],
                'trade_plan_id': active_plans[0]['id'] if active_plans else None,
                'status': 'open',
                'type': 'buy',
                'opened_at': datetime.now() - timedelta(days=3),
                'closed_at': None,
                'cancelled_at': None,
                'cancel_reason': None,
                'total_pl': 1200.0,
                'notes': 'טרייד פתוח עם ביצועים טובים, ממתין ליעד'
            },
            
            # טרייד 2 - פתוח (sell)
            {
                'account_id': accounts[0]['id'],
                'ticker_id': tickers[1]['id'],
                'trade_plan_id': active_plans[1]['id'] if len(active_plans) > 1 else active_plans[0]['id'] if active_plans else None,
                'status': 'open',
                'type': 'sell',
                'opened_at': datetime.now() - timedelta(days=1),
                'closed_at': None,
                'cancelled_at': None,
                'cancel_reason': None,
                'total_pl': -300.0,
                'notes': 'טרייד קצר עם הפסד זמני, ממתין לירידה'
            },
            
            # טרייד 3 - סגור (buy)
            {
                'account_id': accounts[1]['id'] if len(accounts) > 1 else accounts[0]['id'],
                'ticker_id': tickers[2]['id'],
                'trade_plan_id': None,
                'status': 'closed',
                'type': 'buy',
                'opened_at': datetime.now() - timedelta(days=15),
                'closed_at': datetime.now() - timedelta(days=2),
                'cancelled_at': None,
                'cancel_reason': None,
                'total_pl': 2500.0,
                'notes': 'טרייד מוצלח, הושג היעד במלואו'
            },
            
            # טרייד 4 - מבוטל (sell)
            {
                'account_id': accounts[1]['id'] if len(accounts) > 1 else accounts[0]['id'],
                'ticker_id': tickers[3]['id'],
                'trade_plan_id': None,
                'status': 'cancelled',
                'type': 'sell',
                'opened_at': datetime.now() - timedelta(days=10),
                'closed_at': None,
                'cancelled_at': datetime.now() - timedelta(days=1),
                'cancel_reason': 'שינוי בתנאי השוק, העדפה לסגירה מוקדמת',
                'total_pl': -150.0,
                'notes': 'טרייד בוטל עקב שינוי באסטרטגיה'
            }
        ]
        
        added_trades = []
        validation_errors = []
        
        print("\n🔍 מתחיל הוספת טריידים...")
        
        for i, trade_data in enumerate(trades_data, 1):
            ticker_symbol = next((t['symbol'] for t in tickers if t['id'] == trade_data['ticker_id']), 'לא ידוע')
            print(f"\n📊 טרייד {i}:")
            print(f"   טיקר: {ticker_symbol}")
            print(f"   סוג: {trade_data['type']}")
            print(f"   סטטוס: {trade_data['status']}")
            print(f"   רווח/הפסד: ${trade_data['total_pl']:,.0f}")
            
            # וולידציה
            errors = validate_trade_data(trade_data)
            if errors:
                print(f"   ❌ שגיאות וולידציה:")
                for error in errors:
                    print(f"      - {error}")
                validation_errors.extend([f"טרייד {i}: {error}" for error in errors])
                continue
            
            # הוספה לבסיס הנתונים
            try:
                cursor.execute("""
                    INSERT INTO trades 
                    (account_id, ticker_id, trade_plan_id, status, type, 
                     opened_at, closed_at, cancelled_at, cancel_reason, 
                     total_pl, notes, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    trade_data['account_id'],
                    trade_data['ticker_id'],
                    trade_data['trade_plan_id'],
                    trade_data['status'],
                    trade_data['type'],
                    trade_data['opened_at'],
                    trade_data['closed_at'],
                    trade_data['cancelled_at'],
                    trade_data['cancel_reason'],
                    trade_data['total_pl'],
                    trade_data['notes'],
                    datetime.now()
                ))
                
                trade_id = cursor.lastrowid
                added_trades.append({
                    'id': trade_id,
                    'ticker': ticker_symbol,
                    'type': trade_data['type'],
                    'status': trade_data['status'],
                    'pl': trade_data['total_pl']
                })
                
                print(f"   ✅ נוסף בהצלחה (ID: {trade_id})")
                
            except Exception as e:
                print(f"   ❌ שגיאה בהוספה: {e}")
                validation_errors.append(f"טרייד {i}: שגיאה בהוספה - {e}")
        
        # עדכון שדה active_trades של הטיקרים
        print("\n🔄 מעדכן שדה active_trades של הטיקרים...")
        for trade_data in trades_data:
            ticker_id = trade_data['ticker_id']
            
            # בדיקה אם יש טריידים פעילים
            cursor.execute("""
                SELECT COUNT(*) as count 
                FROM trades 
                WHERE ticker_id = ? AND status IN ('open', 'pending', 'פתוח', 'ממתין')
            """, (ticker_id,))
            active_trades = cursor.fetchone()['count']
            
            # בדיקה אם יש תכנונים פעילים
            cursor.execute("""
                SELECT COUNT(*) as count 
                FROM trade_plans 
                WHERE ticker_id = ? AND (canceled_at IS NULL OR canceled_at = '')
            """, (ticker_id,))
            active_plans = cursor.fetchone()['count']
            
            # עדכון שדה active_trades
            is_active = (active_trades > 0 or active_plans > 0)
            cursor.execute("""
                UPDATE tickers 
                SET active_trades = ? 
                WHERE id = ?
            """, (is_active, ticker_id))
            
            ticker_symbol = next((t['symbol'] for t in tickers if t['id'] == ticker_id), 'לא ידוע')
            print(f"   {ticker_symbol}: {'פעיל' if is_active else 'לא פעיל'} ({active_trades} טריידים, {active_plans} תכנונים)")
        
        conn.commit()
        
        print(f"\n✅ הוספה הושלמה!")
        print(f"   טריידים שנוספו: {len(added_trades)}")
        print(f"   שגיאות וולידציה: {len(validation_errors)}")
        
        if added_trades:
            print("\n📊 טריידים שנוספו:")
            for trade in added_trades:
                pl_color = "🟢" if trade['pl'] >= 0 else "🔴"
                print(f"   ID {trade['id']}: {trade['ticker']} - {trade['type']} - {trade['status']} - {pl_color}${trade['pl']:,.0f}")
        
        if validation_errors:
            print("\n❌ שגיאות וולידציה:")
            for error in validation_errors:
                print(f"   - {error}")
        
        return {
            'added_trades': added_trades,
            'validation_errors': validation_errors
        }
        
    except Exception as e:
        print(f"❌ שגיאה כללית: {e}")
        conn.rollback()
        return None
    finally:
        conn.close()

def print_validation_rules():
    """הדפסת כללי הולידציה"""
    print("\n" + "="*60)
    print("📋 כללי הולידציה לטריידים")
    print("="*60)
    
    rules = [
        "1. שדות חובה: account_id, ticker_id",
        "2. ערכים: total_pl יכול להיות חיובי או שלילי",
        "3. אורך מחרוזות:",
        "   - status: עד 20 תווים",
        "   - type: עד 20 תווים",
        "   - notes: עד 500 תווים",
        "   - cancel_reason: עד 500 תווים",
        "4. עקביות סטטוס:",
        "   - status='closed' → חייב closed_at",
        "   - status='cancelled' → חייב cancelled_at ו-cancel_reason",
        "5. תאריכים:",
        "   - opened_at < closed_at",
        "   - opened_at < cancelled_at",
        "6. קשרים: account_id, ticker_id, trade_plan_id חייבים להתקיים בטבלאות המתאימות",
        "7. ערכי status תקינים: 'open', 'closed', 'cancelled', 'pending'",
        "8. ערכי type תקינים: 'buy', 'sell'"
    ]
    
    for rule in rules:
        print(f"   {rule}")
    
    print("="*60)

if __name__ == "__main__":
    print("🚀 מתחיל הוספת נתוני טריידים לבסיס הנתונים...")
    
    # הדפסת כללי הולידציה
    print_validation_rules()
    
    # הוספת הטריידים
    result = add_trades()
    
    if result:
        print(f"\n✅ הסקריפט הושלם בהצלחה!")
        print(f"   טריידים שנוספו: {len(result['added_trades'])}")
        print(f"   שגיאות: {len(result['validation_errors'])}")
    else:
        print("\n❌ הסקריפט נכשל")
