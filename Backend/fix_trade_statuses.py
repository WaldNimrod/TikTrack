#!/usr/bin/env python3
"""
סקריפט לתיקון סטטוסי טריידים
מחליף סטטוס 'pending' ב-'open' כי אין במערכת סטטוס pending
"""

import sqlite3
import os

def get_db_connection():
    """יצירת חיבור לבסיס הנתונים"""
    db_path = os.path.join(os.path.dirname(__file__), 'db', 'simpleTrade.db')
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def check_current_statuses():
    """בדיקת הסטטוסים הנוכחיים"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    print("🔍 בודק סטטוסי טריידים נוכחיים...")
    
    cursor.execute("SELECT COUNT(*) as count, status FROM trades GROUP BY status ORDER BY status")
    statuses = cursor.fetchall()
    
    print("📊 סטטוסי טריידים נוכחיים:")
    for status in statuses:
        print(f"   - {status['status']}: {status['count']} טריידים")
    
    # בדיקת טריידים עם סטטוס pending
    cursor.execute("""
        SELECT t.id, t.status, t.trade_plan_id, tp.status as plan_status, 
               t.ticker_id, tp.ticker_id as plan_ticker_id
        FROM trades t 
        JOIN trade_plans tp ON t.trade_plan_id = tp.id 
        WHERE t.status = 'pending'
    """)
    pending_trades = cursor.fetchall()
    
    print(f"\n⚠️  טריידים עם סטטוס 'pending': {len(pending_trades)}")
    for trade in pending_trades:
        print(f"   - טרייד {trade['id']}: תכנון {trade['trade_plan_id']} ({trade['plan_status']})")
    
    conn.close()
    return statuses, pending_trades

def fix_pending_status():
    """תיקון סטטוס pending ל-open"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    print("\n🔧 מתקן סטטוס 'pending' ל-'open'...")
    
    cursor.execute("UPDATE trades SET status = 'open' WHERE status = 'pending'")
    updated_count = cursor.rowcount
    
    print(f"✅ עודכנו {updated_count} טריידים מ-'pending' ל-'open'")
    
    conn.commit()
    conn.close()
    return updated_count

def verify_fix():
    """אימות התיקון"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    print("\n🔍 אימות התיקון...")
    
    # בדיקת סטטוסים אחרי התיקון
    cursor.execute("SELECT COUNT(*) as count, status FROM trades GROUP BY status ORDER BY status")
    statuses = cursor.fetchall()
    
    print("📊 סטטוסי טריידים אחרי התיקון:")
    for status in statuses:
        print(f"   - {status['status']}: {status['count']} טריידים")
    
    # בדיקה שאין יותר pending
    cursor.execute("SELECT COUNT(*) as count FROM trades WHERE status = 'pending'")
    pending_count = cursor.fetchone()['count']
    
    if pending_count == 0:
        print("✅ אין יותר טריידים עם סטטוס 'pending'")
    else:
        print(f"❌ עדיין יש {pending_count} טריידים עם סטטוס 'pending'")
    
    conn.close()
    return statuses, pending_count

def show_trade_plan_summary():
    """הצגת סיכום טריידים לפי תכנונים"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    print("\n📊 סיכום טריידים לפי תכנונים:")
    
    cursor.execute("""
        SELECT 
            tp.id as plan_id,
            tp.status as plan_status,
            tp.created_at,
            tp.canceled_at,
            COUNT(t.id) as trades_count,
            GROUP_CONCAT(t.status) as trade_statuses
        FROM trade_plans tp
        LEFT JOIN trades t ON tp.id = t.trade_plan_id
        GROUP BY tp.id
        ORDER BY tp.id
    """)
    
    plans = cursor.fetchall()
    
    for plan in plans:
        statuses = plan['trade_statuses'].split(',') if plan['trade_statuses'] else []
        status_counts = {}
        for status in statuses:
            status_counts[status] = status_counts.get(status, 0) + 1
        
        status_summary = []
        for status, count in status_counts.items():
            status_summary.append(f"{status}: {count}")
        
        print(f"   - תכנון {plan['plan_id']} ({plan['plan_status']}): {plan['trades_count']} טריידים [{', '.join(status_summary)}]")
    
    # סיכום כללי
    cursor.execute("""
        SELECT 
            tp.status as plan_status,
            COUNT(DISTINCT tp.id) as plans_count,
            COUNT(t.id) as trades_count
        FROM trade_plans tp
        LEFT JOIN trades t ON tp.id = t.trade_plan_id
        GROUP BY tp.status
        ORDER BY tp.status
    """)
    
    summary = cursor.fetchall()
    
    print("\n📈 סיכום כללי:")
    for row in summary:
        print(f"   - תכנונים {row['plan_status']}: {row['plans_count']} תכנונים, {row['trades_count']} טריידים")
    
    conn.close()

def main():
    """הפונקציה הראשית"""
    print("🚀 מתחיל תהליך תיקון סטטוסי טריידים")
    print("=" * 50)
    
    # בדיקה ראשונית
    statuses, pending_trades = check_current_statuses()
    
    if len(pending_trades) == 0:
        print("\n✅ אין טריידים עם סטטוס 'pending' - הכל תקין!")
        return
    
    # תיקון הסטטוסים
    updated_count = fix_pending_status()
    
    # אימות התיקון
    new_statuses, pending_count = verify_fix()
    
    # הצגת סיכום
    show_trade_plan_summary()
    
    if pending_count == 0:
        print("\n🎉 התיקון הושלם בהצלחה!")
        print(f"   🔧 עודכנו {updated_count} טריידים מ-'pending' ל-'open'")
    else:
        print(f"\n❌ עדיין יש {pending_count} טריידים עם סטטוס 'pending'")

if __name__ == "__main__":
    main()

