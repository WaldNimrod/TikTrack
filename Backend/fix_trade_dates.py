#!/usr/bin/env python3
"""
סקריפט לתיקון תאריכי טריידים
מעדכן את תאריכי הפתיחה של הטריידים כך שיהיו אחרי תאריך יצירת התכנון
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

def check_problematic_trades():
    """בדיקת טריידים עם תאריכים בעייתיים"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    print("🔍 בדיקת טריידים עם תאריכים בעייתיים...")
    
    query = """
    SELECT 
        t.id as trade_id,
        t.opened_at as trade_opened_at,
        tp.created_at as plan_created_at,
        tp.id as plan_id,
        t.status,
        CASE 
            WHEN t.opened_at < tp.created_at THEN 'בעייתי - טרייד לפני תכנון'
            ELSE 'תקין'
        END as status_check
    FROM trades t
    JOIN trade_plans tp ON t.trade_plan_id = tp.id
    WHERE t.opened_at IS NOT NULL
    ORDER BY t.id
    """
    
    cursor.execute(query)
    results = cursor.fetchall()
    
    problematic_count = 0
    for row in results:
        if 'בעייתי' in row['status_check']:
            problematic_count += 1
            print(f"❌ טרייד {row['trade_id']}: פתיחה {row['trade_opened_at']} לפני תכנון {row['plan_created_at']}")
        else:
            print(f"✅ טרייד {row['trade_id']}: תקין")
    
    print(f"\n📊 סיכום: {problematic_count} טריידים בעייתיים מתוך {len(results)}")
    
    conn.close()
    return problematic_count

def fix_trade_dates():
    """תיקון תאריכי הטריידים"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    print("\n🔧 מתחיל תיקון תאריכי טריידים...")
    
    # עדכון טריידים עם תאריכי פתיחה לפני תאריך יצירת התכנון
    update_query = """
    UPDATE trades 
    SET opened_at = (
        SELECT datetime(tp.created_at, '+30 minutes')
        FROM trade_plans tp 
        WHERE tp.id = trades.trade_plan_id
    )
    WHERE EXISTS (
        SELECT 1 
        FROM trade_plans tp 
        WHERE tp.id = trades.trade_plan_id 
        AND trades.opened_at < tp.created_at
        AND trades.opened_at IS NOT NULL
    )
    """
    
    cursor.execute(update_query)
    trades_updated = cursor.rowcount
    print(f"✅ עודכנו {trades_updated} טריידים")
    
    # עדכון טריידים עם תאריכי סגירה לפני תאריך הפתיחה
    update_closed_query = """
    UPDATE trades 
    SET closed_at = datetime(opened_at, '+2 hours')
    WHERE closed_at IS NOT NULL 
    AND closed_at < opened_at
    """
    
    cursor.execute(update_closed_query)
    closed_updated = cursor.rowcount
    print(f"✅ עודכנו {closed_updated} תאריכי סגירה")
    
    # עדכון טרנזקציות עם תאריכים לפני תאריך פתיחת הטרייד
    update_executions_query = """
    UPDATE executions 
    SET date = (
        SELECT datetime(t.opened_at, '+5 minutes')
        FROM trades t 
        WHERE t.id = executions.trade_id
    )
    WHERE EXISTS (
        SELECT 1 
        FROM trades t 
        WHERE t.id = executions.trade_id 
        AND executions.date < t.opened_at
    )
    """
    
    cursor.execute(update_executions_query)
    executions_updated = cursor.rowcount
    print(f"✅ עודכנו {executions_updated} טרנזקציות")
    
    conn.commit()
    conn.close()
    
    return trades_updated, closed_updated, executions_updated

def verify_fixes():
    """אימות שהתיקונים הצליחו"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    print("\n🔍 אימות התיקונים...")
    
    # בדיקה סופית
    verify_query = """
    SELECT 
        t.id as trade_id,
        t.opened_at as trade_opened_at,
        tp.created_at as plan_created_at,
        tp.id as plan_id,
        CASE 
            WHEN t.opened_at >= tp.created_at THEN 'תקין'
            ELSE 'עדיין בעייתי'
        END as status
    FROM trades t
    JOIN trade_plans tp ON t.trade_plan_id = tp.id
    WHERE t.opened_at IS NOT NULL
    ORDER BY t.id
    """
    
    cursor.execute(verify_query)
    results = cursor.fetchall()
    
    fixed_count = 0
    still_problematic = 0
    
    for row in results:
        if row['status'] == 'תקין':
            fixed_count += 1
            print(f"✅ טרייד {row['trade_id']}: תקין (פתיחה: {row['trade_opened_at']}, תכנון: {row['plan_created_at']})")
        else:
            still_problematic += 1
            print(f"❌ טרייד {row['trade_id']}: עדיין בעייתי")
    
    print(f"\n📊 סיכום אימות:")
    print(f"   ✅ תקינים: {fixed_count}")
    print(f"   ❌ בעייתיים: {still_problematic}")
    
    # בדיקת טרנזקציות
    executions_query = """
    SELECT 
        e.id as execution_id,
        e.date as execution_date,
        t.opened_at as trade_opened_at,
        CASE 
            WHEN e.date >= t.opened_at THEN 'תקין'
            ELSE 'בעייתי'
        END as status
    FROM executions e
    JOIN trades t ON e.trade_id = t.id
    ORDER BY e.id
    """
    
    cursor.execute(executions_query)
    executions = cursor.fetchall()
    
    exec_fixed = 0
    exec_problematic = 0
    
    for row in executions:
        if row['status'] == 'תקין':
            exec_fixed += 1
        else:
            exec_problematic += 1
            print(f"❌ טרנזקציה {row['execution_id']}: תאריך {row['execution_date']} לפני פתיחת טרייד {row['trade_opened_at']}")
    
    print(f"   📈 טרנזקציות תקינות: {exec_fixed}")
    print(f"   📉 טרנזקציות בעייתיות: {exec_problematic}")
    
    conn.close()
    
    return still_problematic == 0 and exec_problematic == 0

def main():
    """הפונקציה הראשית"""
    print("🚀 מתחיל תהליך תיקון תאריכי טריידים")
    print("=" * 50)
    
    # בדיקה ראשונית
    problematic_count = check_problematic_trades()
    
    if problematic_count == 0:
        print("\n🎉 אין טריידים בעייתיים! הכל תקין.")
        return
    
    # תיקון התאריכים
    trades_updated, closed_updated, executions_updated = fix_trade_dates()
    
    print(f"\n📈 סיכום התיקונים:")
    print(f"   🔧 טריידים שתוקנו: {trades_updated}")
    print(f"   🔧 תאריכי סגירה שתוקנו: {closed_updated}")
    print(f"   🔧 טרנזקציות שתוקנו: {executions_updated}")
    
    # אימות התיקונים
    success = verify_fixes()
    
    if success:
        print("\n🎉 כל התיקונים הושלמו בהצלחה!")
    else:
        print("\n⚠️  יש עדיין בעיות שדורשות טיפול ידני")

if __name__ == "__main__":
    main()

