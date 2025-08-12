#!/usr/bin/env python3
"""
סקריפט לתיקון תאריכי טריידים - גרסה 2
מתקן בעיות נוספות:
1. טריידים pending ללא תאריך פתיחה
2. תכנונים משנת 2025 ללא טריידים
"""

import sqlite3
import os
from datetime import datetime, timedelta

def get_db_connection():
    """יצירת חיבור לבסיס הנתונים"""
    db_path = os.path.join(os.path.dirname(__file__), 'db', 'simpleTrade.db')
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def check_current_status():
    """בדיקת המצב הנוכחי"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    print("🔍 בדיקת המצב הנוכחי...")
    
    # בדיקת טריידים pending ללא תאריך
    cursor.execute("""
        SELECT t.id, t.status, t.opened_at, t.trade_plan_id, tp.created_at as plan_created_at
        FROM trades t 
        LEFT JOIN trade_plans tp ON t.trade_plan_id = tp.id 
        WHERE t.opened_at IS NULL AND t.status = 'pending'
    """)
    
    pending_trades = cursor.fetchall()
    print(f"📋 טריידים pending ללא תאריך: {len(pending_trades)}")
    for trade in pending_trades:
        print(f"   - טרייד {trade['id']}: תכנון {trade['trade_plan_id']} נוצר ב-{trade['plan_created_at']}")
    
    # בדיקת תכנונים משנת 2025 ללא טריידים
    cursor.execute("""
        SELECT tp.id, tp.created_at, tp.investment_type
        FROM trade_plans tp
        LEFT JOIN trades t ON tp.id = t.trade_plan_id
        WHERE tp.created_at LIKE '2025%' AND t.id IS NULL
        ORDER BY tp.created_at
    """)
    
    plans_without_trades = cursor.fetchall()
    print(f"📋 תכנונים משנת 2025 ללא טריידים: {len(plans_without_trades)}")
    for plan in plans_without_trades:
        print(f"   - תכנון {plan['id']}: נוצר ב-{plan['created_at']}, סוג: {plan['investment_type']}")
    
    conn.close()
    return pending_trades, plans_without_trades

def fix_pending_trades():
    """תיקון טריידים pending - הוספת תאריך פתיחה"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    print("\n🔧 מתחיל תיקון טריידים pending...")
    
    # עדכון טריידים pending עם תאריך פתיחה (30 דקות אחרי יצירת התכנון)
    update_query = """
    UPDATE trades 
    SET opened_at = (
        SELECT datetime(tp.created_at, '+30 minutes')
        FROM trade_plans tp 
        WHERE tp.id = trades.trade_plan_id
    )
    WHERE opened_at IS NULL AND status = 'pending'
    """
    
    cursor.execute(update_query)
    updated_count = cursor.rowcount
    print(f"✅ עודכנו {updated_count} טריידים pending")
    
    conn.commit()
    conn.close()
    return updated_count

def create_trades_for_2025_plans():
    """יצירת טריידים לתכנונים משנת 2025"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    print("\n🔧 יוצר טריידים לתכנונים משנת 2025...")
    
    # מציאת תכנונים משנת 2025 ללא טריידים
    cursor.execute("""
        SELECT tp.id, tp.account_id, tp.ticker_id, tp.investment_type, tp.created_at
        FROM trade_plans tp
        LEFT JOIN trades t ON tp.id = t.trade_plan_id
        WHERE tp.created_at LIKE '2025%' AND t.id IS NULL
        ORDER BY tp.created_at
    """)
    
    plans = cursor.fetchall()
    
    created_count = 0
    for plan in plans:
        # יצירת טרייד חדש
        opened_at = datetime.fromisoformat(plan['created_at'].replace('Z', '+00:00')) + timedelta(minutes=30)
        
        cursor.execute("""
            INSERT INTO trades (account_id, ticker_id, trade_plan_id, status, trade_type, opened_at, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            plan['account_id'],
            plan['ticker_id'],
            plan['id'],
            'open',
            'stock',
            opened_at.isoformat(),
            f'טרייד שנוצר אוטומטית מתכנון {plan["id"]}'
        ))
        
        trade_id = cursor.lastrowid
        print(f"✅ נוצר טרייד {trade_id} לתכנון {plan['id']} (נפתח ב-{opened_at.isoformat()})")
        created_count += 1
    
    conn.commit()
    conn.close()
    return created_count

def verify_final_status():
    """אימות המצב הסופי"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    print("\n🔍 אימות המצב הסופי...")
    
    # בדיקת כל הטריידים
    cursor.execute("""
        SELECT 
            t.id as trade_id,
            t.status,
            t.opened_at as trade_opened_at,
            tp.created_at as plan_created_at,
            tp.id as plan_id,
            CASE 
                WHEN t.opened_at IS NULL THEN 'ללא תאריך'
                WHEN t.opened_at >= tp.created_at THEN 'תקין'
                ELSE 'בעייתי'
            END as status_check
        FROM trades t
        JOIN trade_plans tp ON t.trade_plan_id = tp.id
        ORDER BY t.id
    """)
    
    trades = cursor.fetchall()
    
    valid_count = 0
    problematic_count = 0
    no_date_count = 0
    
    for trade in trades:
        if trade['status_check'] == 'תקין':
            valid_count += 1
            print(f"✅ טרייד {trade['trade_id']}: תקין (פתיחה: {trade['trade_opened_at']}, תכנון: {trade['plan_created_at']})")
        elif trade['status_check'] == 'ללא תאריך':
            no_date_count += 1
            print(f"⚠️  טרייד {trade['trade_id']}: ללא תאריך פתיחה")
        else:
            problematic_count += 1
            print(f"❌ טרייד {trade['trade_id']}: בעייתי")
    
    print(f"\n📊 סיכום סופי:")
    print(f"   ✅ תקינים: {valid_count}")
    print(f"   ⚠️  ללא תאריך: {no_date_count}")
    print(f"   ❌ בעייתיים: {problematic_count}")
    
    # בדיקת תכנונים משנת 2025
    cursor.execute("""
        SELECT COUNT(*) as count
        FROM trade_plans tp
        LEFT JOIN trades t ON tp.id = t.trade_plan_id
        WHERE tp.created_at LIKE '2025%' AND t.id IS NULL
    """)
    
    plans_without_trades = cursor.fetchone()['count']
    print(f"   📋 תכנונים 2025 ללא טריידים: {plans_without_trades}")
    
    conn.close()
    
    return problematic_count == 0 and no_date_count == 0 and plans_without_trades == 0

def main():
    """הפונקציה הראשית"""
    print("🚀 מתחיל תהליך תיקון תאריכי טריידים - גרסה 2")
    print("=" * 60)
    
    # בדיקה ראשונית
    pending_trades, plans_without_trades = check_current_status()
    
    if len(pending_trades) == 0 and len(plans_without_trades) == 0:
        print("\n🎉 הכל תקין! אין בעיות לתקן.")
        return
    
    # תיקון טריידים pending
    if len(pending_trades) > 0:
        updated_pending = fix_pending_trades()
        print(f"   🔧 תוקנו {updated_pending} טריידים pending")
    
    # יצירת טריידים לתכנונים משנת 2025
    if len(plans_without_trades) > 0:
        created_trades = create_trades_for_2025_plans()
        print(f"   🔧 נוצרו {created_trades} טריידים חדשים")
    
    # אימות סופי
    success = verify_final_status()
    
    if success:
        print("\n🎉 כל התיקונים הושלמו בהצלחה!")
    else:
        print("\n⚠️  יש עדיין בעיות שדורשות טיפול ידני")

if __name__ == "__main__":
    main()

