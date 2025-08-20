#!/usr/bin/env python3
"""
סקריפט לתיקון קישורים בין טריידים לתוכניות
מתקן את הנתונים הקיימים ומגדיר כללים למערכת

כללים:
1. כל טרייד חייב להיות מקושר לתוכנית כלשהי
2. טרייד פתוח חייב להיות מקושר לתוכנית במצב פתוח או סגור
3. טרייד סגור או מבוטל יכול להיות משוייך לתוכנית בכל סטטוס
4. תאריך יצירת הטרייד לא יכול להיות מוקדם לתאריך יצירת התוכנית
"""

import sqlite3
import sys
import os
from datetime import datetime
from typing import List, Dict, Optional

# הוספת הנתיב לפרויקט
sys.path.append(os.path.join(os.path.dirname(__file__), 'Backend'))

def connect_to_db():
    """חיבור לבסיס הנתונים"""
    db_path = os.path.join(os.path.dirname(__file__), 'Backend', 'db', 'simpleTrade_new.db')
    return sqlite3.connect(db_path)

def get_trades_without_plans(cursor) -> List[Dict]:
    """קבלת טריידים ללא קישור לתוכנית"""
    cursor.execute("""
        SELECT id, status, type, created_at, ticker_id, account_id
        FROM trades 
        WHERE trade_plan_id IS NULL
        ORDER BY created_at
    """)
    return [dict(zip(['id', 'status', 'type', 'created_at', 'ticker_id', 'account_id'], row)) 
            for row in cursor.fetchall()]

def get_available_plans(cursor) -> List[Dict]:
    """קבלת תוכניות זמינות"""
    cursor.execute("""
        SELECT id, status, investment_type, created_at, ticker_id, account_id
        FROM trade_plans 
        ORDER BY created_at
    """)
    return [dict(zip(['id', 'status', 'investment_type', 'created_at', 'ticker_id', 'account_id'], row)) 
            for row in cursor.fetchall()]

def find_best_plan_for_trade(trade: Dict, plans: List[Dict]) -> Optional[int]:
    """
    מציאת התוכנית הטובה ביותר עבור טרייד
    
    כללים:
    1. תוכנית עם אותו ticker_id
    2. תוכנית עם אותו account_id (אם אפשר)
    3. תוכנית שנוצרה לפני הטרייד
    4. אם הטרייד פתוח - תוכנית פתוחה או סגורה
    5. אם הטרייד סגור/מבוטל - כל תוכנית
    6. אם אין תוכנית לאותו ticker - חיפוש תוכנית דומה
    7. צד התוכנית חייב להיות זהה לצד הטרייד
    """
    trade_created = datetime.fromisoformat(trade['created_at'].replace('Z', '+00:00'))
    
    # סינון תוכניות לפי ticker_id
    matching_plans = [p for p in plans if p['ticker_id'] == trade['ticker_id']]
    
    if not matching_plans:
        # אם אין תוכנית לאותו ticker, נחפש תוכנית דומה
        print(f"  ⚠️  אין תוכניות עבור ticker_id {trade['ticker_id']}, מחפש תוכנית דומה...")
        
        # חיפוש תוכנית עם אותו account_id
        account_matching = [p for p in plans if p['account_id'] == trade['account_id']]
        if account_matching:
            matching_plans = account_matching
            print(f"  📋 נמצאו {len(matching_plans)} תוכניות עם אותו account_id")
        else:
            # אם אין גם account_id מתאים, נשתמש בתוכנית הראשונה הזמינה
            matching_plans = plans
            print(f"  📋 משתמש בכל התוכניות הזמינות ({len(matching_plans)})")
    
    # סינון לפי תאריך יצירה
    valid_plans = []
    for plan in matching_plans:
        try:
            plan_created = datetime.fromisoformat(plan['created_at'].replace('Z', '+00:00'))
            if plan_created <= trade_created:
                valid_plans.append(plan)
        except ValueError:
            print(f"  ⚠️  תאריך לא תקין בתוכנית {plan['id']}: {plan['created_at']}")
    
    if not valid_plans:
        print(f"  ⚠️  אין תוכניות שנוצרו לפני הטרייד")
        return None
    
    # סינון לפי סטטוס (אם הטרייד פתוח)
    if trade['status'] == 'open':
        status_valid_plans = [p for p in valid_plans if p['status'] in ['open', 'closed']]
        if status_valid_plans:
            valid_plans = status_valid_plans
    
    # סינון לפי צד - חייב להיות זהה
    side_matching = [p for p in valid_plans if p.get('side', 'Long') == trade.get('side', 'Long')]
    if side_matching:
        valid_plans = side_matching
        print(f"  📋 נמצאו {len(valid_plans)} תוכניות עם אותו צד ({trade.get('side', 'Long')})")
    else:
        print(f"  ⚠️  אין תוכניות עם אותו צד ({trade.get('side', 'Long')})")
        return None
    
    # העדפת תוכנית עם אותו account_id
    account_matching = [p for p in valid_plans if p['account_id'] == trade['account_id']]
    if account_matching:
        valid_plans = account_matching
    
    # בחירת התוכנית הוותיקה ביותר
    if valid_plans:
        best_plan = min(valid_plans, key=lambda p: p['created_at'])
        return best_plan['id']
    
    return None

def update_trade_plan_link(cursor, trade_id: int, plan_id: int):
    """עדכון קישור טרייד לתוכנית"""
    # קבלת פרטי התוכנית
    cursor.execute("""
        SELECT investment_type, side 
        FROM trade_plans 
        WHERE id = ?
    """, (plan_id,))
    plan_data = cursor.fetchone()
    
    if plan_data:
        investment_type, side = plan_data
        
        # עדכון הטרייד עם פרטי התוכנית
        cursor.execute("""
            UPDATE trades 
            SET trade_plan_id = ?, type = ?, side = ?
            WHERE id = ?
        """, (plan_id, investment_type, side, trade_id))
        
        print(f"    📝 עודכן: type={investment_type}, side={side}")
    else:
        # אם לא נמצאה התוכנית, רק מעדכן את הקישור
        cursor.execute("""
            UPDATE trades 
            SET trade_plan_id = ? 
            WHERE id = ?
        """, (plan_id, trade_id))

def validate_trade_plan_links(cursor):
    """בדיקת תקינות הקישורים"""
    print("\n=== בדיקת תקינות קישורים ===")
    
    # בדיקת טריידים ללא קישור
    cursor.execute("SELECT COUNT(*) FROM trades WHERE trade_plan_id IS NULL")
    unlinked_count = cursor.fetchone()[0]
    print(f"טריידים ללא קישור: {unlinked_count}")
    
    # בדיקת טריידים פתוחים עם תוכניות סגורות/מבוטלות
    cursor.execute("""
        SELECT t.id, t.status, tp.status as plan_status
        FROM trades t
        JOIN trade_plans tp ON t.trade_plan_id = tp.id
        WHERE t.status = 'open' AND tp.status NOT IN ('open', 'closed')
    """)
    invalid_open_trades = cursor.fetchall()
    print(f"טריידים פתוחים עם תוכניות לא תקינות: {len(invalid_open_trades)}")
    
    # בדיקת תאריכי יצירה
    cursor.execute("""
        SELECT t.id, t.created_at, tp.created_at as plan_created
        FROM trades t
        JOIN trade_plans tp ON t.trade_plan_id = tp.id
        WHERE t.created_at < tp.created_at
    """)
    invalid_dates = cursor.fetchall()
    print(f"טריידים שנוצרו לפני התוכנית: {len(invalid_dates)}")
    
    # בדיקת צד - חייב להיות זהה
    cursor.execute("""
        SELECT t.id, t.side, tp.side as plan_side
        FROM trades t
        JOIN trade_plans tp ON t.trade_plan_id = tp.id
        WHERE t.side != tp.side
    """)
    invalid_sides = cursor.fetchall()
    print(f"טריידים עם צד שונה מהתוכנית: {len(invalid_sides)}")
    
    return unlinked_count == 0 and len(invalid_open_trades) == 0 and len(invalid_dates) == 0 and len(invalid_sides) == 0

def main():
    """פונקציה ראשית"""
    print("🔧 תיקון קישורים בין טריידים לתוכניות")
    print("=" * 50)
    
    try:
        conn = connect_to_db()
        cursor = conn.cursor()
        
        # קבלת נתונים
        trades_without_plans = get_trades_without_plans(cursor)
        available_plans = get_available_plans(cursor)
        
        print(f"נמצאו {len(trades_without_plans)} טריידים ללא קישור")
        print(f"נמצאו {len(available_plans)} תוכניות זמינות")
        
        if not trades_without_plans:
            print("✅ כל הטריידים כבר מקושרים לתוכניות")
            return
        
        # תיקון קישורים
        print("\n=== תיקון קישורים ===")
        fixed_count = 0
        
        for trade in trades_without_plans:
            print(f"\nטרייד {trade['id']} ({trade['status']} - {trade['type']}):")
            
            best_plan_id = find_best_plan_for_trade(trade, available_plans)
            
            if best_plan_id:
                update_trade_plan_link(cursor, trade['id'], best_plan_id)
                print(f"  ✅ מקושר לתוכנית {best_plan_id}")
                fixed_count += 1
            else:
                print(f"  ❌ לא נמצאה תוכנית מתאימה")
        
        # שמירת שינויים
        conn.commit()
        print(f"\n✅ תוקנו {fixed_count} קישורים")
        
        # בדיקת תקינות
        is_valid = validate_trade_plan_links(cursor)
        
        if is_valid:
            print("\n🎉 כל הקישורים תקינים!")
        else:
            print("\n⚠️  יש עדיין בעיות בקישורים")
        
        conn.close()
        
    except Exception as e:
        print(f"❌ שגיאה: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
