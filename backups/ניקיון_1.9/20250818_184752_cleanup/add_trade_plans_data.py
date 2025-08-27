#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
סקריפט להוספת נתוני תכנונים לבסיס הנתונים
מוסיף 4 תכנונים: 2 במצב פתוח ו-2 במצב סגור
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

def validate_trade_plan_data(data):
    """
    וולידציה של נתוני תכנון הטרייד
    מחזיר רשימת שגיאות או רשימה ריקה אם הכל תקין
    """
    errors = []
    
    # בדיקת שדות חובה
    if not data.get('account_id'):
        errors.append("account_id הוא שדה חובה")
    
    if not data.get('ticker_id'):
        errors.append("ticker_id הוא שדה חובה")
    
    # בדיקת ערכים חיוביים
    if data.get('planned_amount') is not None and data['planned_amount'] <= 0:
        errors.append("planned_amount חייב להיות חיובי")
    
    if data.get('stop_price') is not None and data['stop_price'] <= 0:
        errors.append("stop_price חייב להיות חיובי")
    
    if data.get('target_price') is not None and data['target_price'] <= 0:
        errors.append("target_price חייב להיות חיובי")
    
    # בדיקת אורך מחרוזות
    if data.get('investment_type') and len(data['investment_type']) > 20:
        errors.append("investment_type לא יכול להיות ארוך מ-20 תווים")
    
    if data.get('entry_conditions') and len(data['entry_conditions']) > 500:
        errors.append("entry_conditions לא יכול להיות ארוך מ-500 תווים")
    
    if data.get('reasons') and len(data['reasons']) > 500:
        errors.append("reasons לא יכול להיות ארוך מ-500 תווים")
    
    if data.get('cancel_reason') and len(data['cancel_reason']) > 500:
        errors.append("cancel_reason לא יכול להיות ארוך מ-500 תווים")
    
    # בדיקת עקביות מחירים
    if (data.get('stop_price') and data.get('target_price') and 
        data.get('investment_type') == 'long' and 
        data['stop_price'] >= data['target_price']):
        errors.append("עבור long trade, stop_price חייב להיות נמוך מ-target_price")
    
    if (data.get('stop_price') and data.get('target_price') and 
        data.get('investment_type') == 'short' and 
        data['stop_price'] <= data['target_price']):
        errors.append("עבור short trade, stop_price חייב להיות גבוה מ-target_price")
    
    return errors

def add_trade_plans():
    """הוספת 4 תכנונים חדשים לבסיס הנתונים"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # קבלת חשבונות וטיקרים קיימים
        cursor.execute("SELECT id, name FROM accounts WHERE status = 'open' LIMIT 2")
        accounts = cursor.fetchall()
        
        cursor.execute("SELECT id, symbol FROM tickers ORDER BY id LIMIT 4")
        tickers = cursor.fetchall()
        
        if not accounts:
            print("❌ לא נמצאו חשבונות פעילים")
            return
        
        if not tickers:
            print("❌ לא נמצאו טיקרים")
            return
        
        print(f"✅ נמצאו {len(accounts)} חשבונות ו-{len(tickers)} טיקרים")
        
        # נתוני תכנונים להוספה
        trade_plans_data = [
            # תכנון 1 - פתוח (long)
            {
                'account_id': accounts[0]['id'],
                'ticker_id': tickers[0]['id'],
                'investment_type': 'long',
                'planned_amount': 15000.0,
                'entry_conditions': 'כניסה במחיר 160$ עם אמון גבוה בתמיכה',
                'stop_price': 145.0,
                'target_price': 200.0,
                'reasons': 'חברה חזקה עם מוצרים פופולריים, צמיחה עקבית ברווחים',
                'canceled_at': None,
                'cancel_reason': None
            },
            
            # תכנון 2 - פתוח (short)
            {
                'account_id': accounts[0]['id'],
                'ticker_id': tickers[1]['id'],
                'investment_type': 'short',
                'planned_amount': 12000.0,
                'entry_conditions': 'כניסה במחיר 2800$ עם חשש לירידה',
                'stop_price': 2950.0,
                'target_price': 2500.0,
                'reasons': 'חששות רגולטוריים, תחרות גוברת בשוק החיפוש',
                'canceled_at': None,
                'cancel_reason': None
            },
            
            # תכנון 3 - סגור (long)
            {
                'account_id': accounts[1]['id'] if len(accounts) > 1 else accounts[0]['id'],
                'ticker_id': tickers[2]['id'],
                'investment_type': 'long',
                'planned_amount': 8000.0,
                'entry_conditions': 'כניסה במחיר 320$ עם אמון בטכנולוגיה',
                'stop_price': 300.0,
                'target_price': 380.0,
                'reasons': 'חברת טכנולוגיה מובילה, שוק ענן מתפתח',
                'canceled_at': datetime.now() - timedelta(days=5),
                'cancel_reason': 'שינוי באסטרטגיה השקעות, העדפה לנכסים אחרים'
            },
            
            # תכנון 4 - סגור (short)
            {
                'account_id': accounts[1]['id'] if len(accounts) > 1 else accounts[0]['id'],
                'ticker_id': tickers[3]['id'],
                'investment_type': 'short',
                'planned_amount': 10000.0,
                'entry_conditions': 'כניסה במחיר 850$ עם חשש לירידה',
                'stop_price': 900.0,
                'target_price': 750.0,
                'reasons': 'חששות לגבי ביקוש לרכבים חשמליים, תחרות גוברת',
                'canceled_at': datetime.now() - timedelta(days=3),
                'cancel_reason': 'שיפור בביצועי החברה, שינוי בהערכה'
            }
        ]
        
        added_plans = []
        validation_errors = []
        
        print("\n🔍 מתחיל הוספת תכנונים...")
        
        for i, plan_data in enumerate(trade_plans_data, 1):
            print(f"\n📋 תכנון {i}:")
            ticker_symbol = next((t['symbol'] for t in tickers if t['id'] == plan_data['ticker_id']), 'לא ידוע')
            print(f"   טיקר: {ticker_symbol}")
            print(f"   סוג: {plan_data['investment_type']}")
            print(f"   סכום: ${plan_data['planned_amount']:,.0f}")
            print(f"   סטטוס: {'סגור' if plan_data['canceled_at'] else 'פתוח'}")
            
            # וולידציה
            errors = validate_trade_plan_data(plan_data)
            if errors:
                print(f"   ❌ שגיאות וולידציה:")
                for error in errors:
                    print(f"      - {error}")
                validation_errors.extend([f"תכנון {i}: {error}" for error in errors])
                continue
            
            # הוספה לבסיס הנתונים
            try:
                cursor.execute("""
                    INSERT INTO trade_plans 
                    (account_id, ticker_id, investment_type, planned_amount, 
                     entry_conditions, stop_price, target_price, reasons, 
                     canceled_at, cancel_reason, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    plan_data['account_id'],
                    plan_data['ticker_id'],
                    plan_data['investment_type'],
                    plan_data['planned_amount'],
                    plan_data['entry_conditions'],
                    plan_data['stop_price'],
                    plan_data['target_price'],
                    plan_data['reasons'],
                    plan_data['canceled_at'],
                    plan_data['cancel_reason'],
                    datetime.now()
                ))
                
                plan_id = cursor.lastrowid
                ticker_symbol = next((t['symbol'] for t in tickers if t['id'] == plan_data['ticker_id']), 'לא ידוע')
                added_plans.append({
                    'id': plan_id,
                    'ticker': ticker_symbol,
                    'type': plan_data['investment_type'],
                    'amount': plan_data['planned_amount'],
                    'status': 'סגור' if plan_data['canceled_at'] else 'פתוח'
                })
                
                print(f"   ✅ נוסף בהצלחה (ID: {plan_id})")
                
            except Exception as e:
                print(f"   ❌ שגיאה בהוספה: {e}")
                validation_errors.append(f"תכנון {i}: שגיאה בהוספה - {e}")
        
        # עדכון שדה active_trades של הטיקרים
        print("\n🔄 מעדכן שדה active_trades של הטיקרים...")
        for plan_data in trade_plans_data:
            ticker_id = plan_data['ticker_id']
            
            # בדיקה אם יש תכנונים פעילים
            cursor.execute("""
                SELECT COUNT(*) as count 
                FROM trade_plans 
                WHERE ticker_id = ? AND (canceled_at IS NULL OR canceled_at = '')
            """, (ticker_id,))
            active_plans = cursor.fetchone()['count']
            
            # עדכון שדה active_trades
            is_active = active_plans > 0
            cursor.execute("""
                UPDATE tickers 
                SET active_trades = ? 
                WHERE id = ?
            """, (is_active, ticker_id))
            
            ticker_symbol = next((t['symbol'] for t in tickers if t['id'] == ticker_id), 'לא ידוע')
            print(f"   {ticker_symbol}: {'פעיל' if is_active else 'לא פעיל'} ({active_plans} תכנונים)")
        
        conn.commit()
        
        print(f"\n✅ הוספה הושלמה!")
        print(f"   תכנונים שנוספו: {len(added_plans)}")
        print(f"   שגיאות וולידציה: {len(validation_errors)}")
        
        if added_plans:
            print("\n📊 תכנונים שנוספו:")
            for plan in added_plans:
                print(f"   ID {plan['id']}: {plan['ticker']} - {plan['type']} - ${plan['amount']:,.0f} - {plan['status']}")
        
        if validation_errors:
            print("\n❌ שגיאות וולידציה:")
            for error in validation_errors:
                print(f"   - {error}")
        
        return {
            'added_plans': added_plans,
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
    print("📋 כללי הולידציה לתכנוני טריידים")
    print("="*60)
    
    rules = [
        "1. שדות חובה: account_id, ticker_id",
        "2. ערכים חיוביים: planned_amount, stop_price, target_price",
        "3. אורך מחרוזות:",
        "   - investment_type: עד 20 תווים",
        "   - entry_conditions: עד 500 תווים", 
        "   - reasons: עד 500 תווים",
        "   - cancel_reason: עד 500 תווים",
        "4. עקביות מחירים:",
        "   - long trade: stop_price < target_price",
        "   - short trade: stop_price > target_price",
        "5. תאריכים: canceled_at ו-cancel_reason חייבים להיות יחד או לא להיות בכלל",
        "6. קשרים: account_id ו-ticker_id חייבים להתקיים בטבלאות המתאימות"
    ]
    
    for rule in rules:
        print(f"   {rule}")
    
    print("="*60)

if __name__ == "__main__":
    print("🚀 מתחיל הוספת נתוני תכנונים לבסיס הנתונים...")
    
    # הדפסת כללי הולידציה
    print_validation_rules()
    
    # הוספת התכנונים
    result = add_trade_plans()
    
    if result:
        print(f"\n✅ הסקריפט הושלם בהצלחה!")
        print(f"   תכנונים שנוספו: {len(result['added_plans'])}")
        print(f"   שגיאות: {len(result['validation_errors'])}")
    else:
        print("\n❌ הסקריפט נכשל")
