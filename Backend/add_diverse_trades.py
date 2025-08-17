#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
הוספת טריידים מגוונים למערכת
מגוון תאריכים, סוגים, סטטוסים וקישור לתכנונים
"""

import sqlite3
import random
from datetime import datetime, timedelta
import os

def get_db_connection():
    """יצירת חיבור לבסיס הנתונים"""
    db_path = 'db/simpleTrade_new.db'
    if not os.path.exists(db_path):
        print(f"❌ בסיס הנתונים לא נמצא: {db_path}")
        return None
    
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def get_open_trade_plans(conn):
    """קבלת תכנונים פתוחים או סגורים (לא מבוטלים)"""
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, status, created_at 
        FROM trade_plans 
        WHERE status IN ('open', 'closed')
        ORDER BY id
    """)
    return cursor.fetchall()

def get_tickers(conn):
    """קבלת כל הטיקרים"""
    cursor = conn.cursor()
    cursor.execute("SELECT id, symbol FROM tickers ORDER BY id")
    return cursor.fetchall()

def get_accounts(conn):
    """קבלת כל החשבונות"""
    cursor = conn.cursor()
    cursor.execute("SELECT id, name FROM accounts ORDER BY id")
    return cursor.fetchall()

def generate_random_date(start_date, end_date):
    """יצירת תאריך אקראי בטווח נתון"""
    time_between_dates = end_date - start_date
    days_between_dates = time_between_dates.days
    random_number_of_days = random.randrange(days_between_dates)
    return start_date + timedelta(days=random_number_of_days)

def add_diverse_trades():
    """הוספת טריידים מגוונים למערכת"""
    conn = get_db_connection()
    if not conn:
        return
    
    try:
        print("🚀 מתחיל הוספת טריידים מגוונים...")
        
        # קבלת נתונים קיימים
        trade_plans = get_open_trade_plans(conn)
        tickers = get_tickers(conn)
        accounts = get_accounts(conn)
        
        print(f"📊 נמצאו {len(trade_plans)} תכנונים, {len(tickers)} טיקרים, {len(accounts)} חשבונות")
        
        if len(trade_plans) == 0 or len(tickers) == 0 or len(accounts) == 0:
            print("❌ חסרים נתונים במערכת (תכנונים, טיקרים או חשבונות)")
            return
        
        # הגדרת טווח תאריכים (2024 עד היום)
        start_date = datetime(2024, 1, 1)
        end_date = datetime.now()
        
        # רשימת הערות מגוונות
        notes_list = [
            "קנייה של מניות טכנולוגיה",
            "השקעה ארוכת טווח",
            "מסחר יומי",
            "השקעה ב-ETF",
            "קנייה על בסיס ניתוח טכני",
            "השקעה על בסיס ניתוח פונדמנטלי",
            "מסחר סווינג",
            "השקעה פסיבית",
            "קנייה על בסיס חדשות",
            "השקעה על בסיס המלצות",
            "מסחר על בסיס אופציות",
            "השקעה ב-REIT",
            "קנייה על בסיס דיבידנדים",
            "מסחר על בסיס מומנטום",
            "השקעה על בסיס ערך"
        ]
        
        # רשימת סטטוסים
        statuses = ['open', 'closed', 'cancelled']
        status_weights = [0.6, 0.3, 0.1]  # 60% פתוחים, 30% סגורים, 10% מבוטלים
        
        # רשימת סוגים
        types = ['swing', 'invest', 'pasive']
        type_weights = [0.4, 0.4, 0.2]  # 40% סווינג, 40% השקעה, 20% פאסיבי
        
        cursor = conn.cursor()
        
        # הוספת 20 טריידים מגוונים
        for i in range(1, 21):
            # בחירה אקראית של נתונים
            trade_plan = random.choice(trade_plans)
            ticker = random.choice(tickers)
            account = random.choice(accounts)
            
            # בחירה אקראית של סטטוס
            status = random.choices(statuses, weights=status_weights)[0]
            
            # בחירה אקראית של סוג
            trade_type = random.choices(types, weights=type_weights)[0]
            
            # יצירת תאריך יצירה אקראי
            created_at = generate_random_date(start_date, end_date)
            
            # אם הסטטוס סגור, תאריך סגירה צריך להיות אחרי תאריך היצירה
            closed_at = None
            if status == 'closed':
                days_after_creation = random.randint(1, 90)  # 1-90 ימים אחרי היצירה
                closed_at = created_at + timedelta(days=days_after_creation)
                # וודא שתאריך הסגירה לא בעתיד
                if closed_at > datetime.now():
                    closed_at = datetime.now() - timedelta(days=random.randint(1, 30))
            
            # אם הסטטוס מבוטל, תאריך ביטול צריך להיות אחרי תאריך היצירה
            cancelled_at = None
            if status == 'cancelled':
                days_after_creation = random.randint(1, 30)  # 1-30 ימים אחרי היצירה
                cancelled_at = created_at + timedelta(days=days_after_creation)
                # וודא שתאריך הביטול לא בעתיד
                if cancelled_at > datetime.now():
                    cancelled_at = datetime.now() - timedelta(days=random.randint(1, 10))
            
            # רווח/הפסד אקראי (רק לטריידים סגורים)
            total_pl = 0
            if status == 'closed':
                total_pl = random.uniform(-5000, 10000)  # הפסד עד 5000$, רווח עד 10000$
            
            # הערה אקראית
            notes = random.choice(notes_list)
            
            # הכנסת הטרייד לבסיס הנתונים
            cursor.execute("""
                INSERT INTO trades 
                (account_id, ticker_id, trade_plan_id, status, type, created_at, closed_at, cancelled_at, total_pl, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                account['id'],
                ticker['id'],
                trade_plan['id'],
                status,
                trade_type,
                created_at.strftime('%Y-%m-%d %H:%M:%S'),
                closed_at.strftime('%Y-%m-%d %H:%M:%S') if closed_at else None,
                cancelled_at.strftime('%Y-%m-%d %H:%M:%S') if cancelled_at else None,
                total_pl,
                notes
            ))
            
            trade_id = cursor.lastrowid
            print(f"✅ נוצר טרייד {trade_id}: {ticker['symbol']} - {status} - {trade_type} - {created_at.strftime('%Y-%m-%d')}")
        
        conn.commit()
        print(f"🎉 נוצרו בהצלחה 20 טריידים מגוונים!")
        
        # הצגת סיכום
        cursor.execute("SELECT status, COUNT(*) as count FROM trades GROUP BY status")
        status_summary = cursor.fetchall()
        print("\n📊 סיכום לפי סטטוס:")
        for row in status_summary:
            print(f"  {row['status']}: {row['count']} טריידים")
        
        cursor.execute("SELECT type, COUNT(*) as count FROM trades GROUP BY type")
        type_summary = cursor.fetchall()
        print("\n📊 סיכום לפי סוג:")
        for row in type_summary:
            print(f"  {row['type']}: {row['count']} טריידים")
        
        cursor.execute("SELECT COUNT(*) as total FROM trades")
        total = cursor.fetchone()['total']
        print(f"\n📊 סה\"כ טריידים במערכת: {total}")
        
    except Exception as e:
        print(f"❌ שגיאה בהוספת טריידים: {str(e)}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    add_diverse_trades()
