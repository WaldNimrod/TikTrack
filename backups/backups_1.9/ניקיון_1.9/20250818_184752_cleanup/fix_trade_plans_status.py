#!/usr/bin/env python3
"""
סקריפט לתיקון מבנה טבלת trade_plans
מוסיף עמודת status ועדכן את הנתונים לפי הכללים:
- תכנון עם canceled_at = 'סגור'
- תכנון ללא canceled_at = 'פתוח'
- תכנון עם canceled_at = 'מבוטל'
"""

import sqlite3
import os

def get_db_connection():
    """יצירת חיבור לבסיס הנתונים"""
    db_path = os.path.join(os.path.dirname(__file__), 'db', 'simpleTrade.db')
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def add_status_column():
    """הוספת עמודת status לטבלת trade_plans"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    print("🔧 מוסיף עמודת status לטבלת trade_plans...")
    
    try:
        # הוספת עמודת status
        cursor.execute("ALTER TABLE trade_plans ADD COLUMN status TEXT DEFAULT 'פתוח'")
        print("✅ עמודת status נוספה בהצלחה")
        
        conn.commit()
        conn.close()
        return True
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print("ℹ️  עמודת status כבר קיימת")
            conn.close()
            return True
        else:
            print(f"❌ שגיאה בהוספת עמודת status: {e}")
            conn.close()
            return False

def update_plan_statuses():
    """עדכון סטטוס התכנונים לפי הכללים"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    print("\n🔧 מעדכן סטטוס התכנונים...")
    
    # עדכון תכנונים מבוטלים
    cursor.execute("""
        UPDATE trade_plans 
        SET status = 'מבוטל' 
        WHERE canceled_at IS NOT NULL AND canceled_at != ''
    """)
    canceled_count = cursor.rowcount
    print(f"✅ עודכנו {canceled_count} תכנונים מבוטלים")
    
    # עדכון תכנונים סגורים (יש להם טריידים)
    cursor.execute("""
        UPDATE trade_plans 
        SET status = 'סגור' 
        WHERE id IN (
            SELECT DISTINCT trade_plan_id 
            FROM trades 
            WHERE trade_plan_id IS NOT NULL
        ) AND (canceled_at IS NULL OR canceled_at = '')
    """)
    closed_count = cursor.rowcount
    print(f"✅ עודכנו {closed_count} תכנונים סגורים")
    
    # תכנונים פתוחים נשארים עם ברירת המחדל 'פתוח'
    
    conn.commit()
    conn.close()
    return canceled_count, closed_count

def verify_trade_plan_rules():
    """אימות שהכללים נאכפו"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    print("\n🔍 אימות הכללים...")
    
    # בדיקה 1: כל טרייד מקושר לתכנון
    cursor.execute("""
        SELECT COUNT(*) as count
        FROM trades 
        WHERE trade_plan_id IS NULL
    """)
    trades_without_plans = cursor.fetchone()['count']
    print(f"📋 טריידים ללא תכנון: {trades_without_plans}")
    
    # בדיקה 2: התאמת טיקרים
    cursor.execute("""
        SELECT COUNT(*) as count
        FROM trades t
        JOIN trade_plans tp ON t.trade_plan_id = tp.id
        WHERE t.ticker_id != tp.ticker_id
    """)
    mismatched_tickers = cursor.fetchone()['count']
    print(f"📋 טריידים עם טיקרים לא תואמים: {mismatched_tickers}")
    
    # בדיקה 3: טריידים לתכנונים פתוחים
    cursor.execute("""
        SELECT COUNT(*) as count
        FROM trades t
        JOIN trade_plans tp ON t.trade_plan_id = tp.id
        WHERE tp.status = 'פתוח'
    """)
    trades_for_open_plans = cursor.fetchone()['count']
    print(f"📋 טריידים לתכנונים פתוחים: {trades_for_open_plans}")
    
    # בדיקה 4: טריידים לתכנונים מבוטלים
    cursor.execute("""
        SELECT COUNT(*) as count
        FROM trades t
        JOIN trade_plans tp ON t.trade_plan_id = tp.id
        WHERE tp.status = 'מבוטל'
    """)
    trades_for_canceled_plans = cursor.fetchone()['count']
    print(f"📋 טריידים לתכנונים מבוטלים: {trades_for_canceled_plans}")
    
    # הצגת פירוט התכנונים
    print("\n📊 פירוט התכנונים:")
    cursor.execute("""
        SELECT 
            tp.id,
            tp.status,
            tp.created_at,
            tp.canceled_at,
            COUNT(t.id) as trades_count
        FROM trade_plans tp
        LEFT JOIN trades t ON tp.id = t.trade_plan_id
        GROUP BY tp.id
        ORDER BY tp.id
    """)
    
    plans = cursor.fetchall()
    for plan in plans:
        print(f"   - תכנון {plan['id']}: {plan['status']} ({plan['trades_count']} טריידים)")
    
    conn.close()
    
    # בדיקה אם הכל תקין
    is_valid = (
        trades_without_plans == 0 and
        mismatched_tickers == 0 and
        trades_for_open_plans == 0 and
        trades_for_canceled_plans == 0
    )
    
    return is_valid

def fix_violations():
    """תיקון הפרות הכללים"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    print("\n🔧 מתקן הפרות הכללים...")
    
    # תיקון 1: מחיקת טריידים לתכנונים פתוחים
    cursor.execute("""
        DELETE FROM trades 
        WHERE trade_plan_id IN (
            SELECT id FROM trade_plans WHERE status = 'פתוח'
        )
    """)
    deleted_open_trades = cursor.rowcount
    print(f"🗑️  נמחקו {deleted_open_trades} טריידים לתכנונים פתוחים")
    
    # תיקון 2: מחיקת טריידים לתכנונים מבוטלים
    cursor.execute("""
        DELETE FROM trades 
        WHERE trade_plan_id IN (
            SELECT id FROM trade_plans WHERE status = 'מבוטל'
        )
    """)
    deleted_canceled_trades = cursor.rowcount
    print(f"🗑️  נמחקו {deleted_canceled_trades} טריידים לתכנונים מבוטלים")
    
    # תיקון 3: עדכון סטטוס תכנונים עם טריידים ל'סגור'
    cursor.execute("""
        UPDATE trade_plans 
        SET status = 'סגור' 
        WHERE id IN (
            SELECT DISTINCT trade_plan_id 
            FROM trades 
            WHERE trade_plan_id IS NOT NULL
        ) AND status != 'מבוטל'
    """)
    updated_to_closed = cursor.rowcount
    print(f"✅ עודכנו {updated_to_closed} תכנונים לסטטוס 'סגור'")
    
    conn.commit()
    conn.close()
    
    return deleted_open_trades, deleted_canceled_trades, updated_to_closed

def main():
    """הפונקציה הראשית"""
    print("🚀 מתחיל תהליך תיקון מבנה trade_plans")
    print("=" * 50)
    
    # הוספת עמודת status
    if not add_status_column():
        print("❌ נכשל בהוספת עמודת status")
        return
    
    # עדכון סטטוס התכנונים
    canceled_count, closed_count = update_plan_statuses()
    print(f"   🔧 תכנונים מבוטלים: {canceled_count}")
    print(f"   🔧 תכנונים סגורים: {closed_count}")
    
    # אימות הכללים
    print("\n🔍 בודק הפרות כללים...")
    is_valid = verify_trade_plan_rules()
    
    if not is_valid:
        print("\n⚠️  נמצאו הפרות כללים, מתחיל תיקון...")
        deleted_open, deleted_canceled, updated_closed = fix_violations()
        
        print(f"\n📈 סיכום התיקונים:")
        print(f"   🗑️  נמחקו טריידים לתכנונים פתוחים: {deleted_open}")
        print(f"   🗑️  נמחקו טריידים לתכנונים מבוטלים: {deleted_canceled}")
        print(f"   ✅ עודכנו תכנונים לסטטוס 'סגור': {updated_closed}")
        
        # אימות סופי
        print("\n🔍 אימות סופי...")
        is_valid = verify_trade_plan_rules()
    
    if is_valid:
        print("\n🎉 כל הכללים נאכפו בהצלחה!")
    else:
        print("\n❌ עדיין יש הפרות כללים שדורשות טיפול ידני")

if __name__ == "__main__":
    main()

