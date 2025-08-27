#!/usr/bin/env python3
"""
הוספת תכנונים עם תאריכים שונים לבדיקת פילטר התאריכים
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from config.database import SessionLocal, init_db
from models import TradePlan, Account, Ticker
from datetime import datetime, timedelta
import random

def add_trade_plans_with_dates():
    """הוספת תכנונים עם תאריכים שונים"""
    db = SessionLocal()
    
    try:
        # קבלת חשבונות וטיקרים קיימים
        accounts = db.query(Account).filter(Account.status == "open").all()
        tickers = db.query(Ticker).all()
        
        if not accounts or not tickers:
            print("⚠️ No accounts or tickers found")
            return
        
        # יצירת תאריכים שונים
        dates = [
            datetime.now() - timedelta(days=1),    # אתמול
            datetime.now() - timedelta(days=3),    # לפני 3 ימים
            datetime.now() - timedelta(days=7),    # לפני שבוע
            datetime.now() - timedelta(days=15),   # לפני שבועיים
            datetime.now() - timedelta(days=30),   # לפני חודש
            datetime.now() - timedelta(days=60),   # לפני חודשיים
            datetime.now() - timedelta(days=90),   # לפני 3 חודשים
            datetime.now() - timedelta(days=180),  # לפני 6 חודשים
            datetime.now() - timedelta(days=365),  # לפני שנה
        ]
        
        # סוגי השקעה שונים
        investment_types = ["long", "short", "swing"]
        
        # יצירת תכנונים עם תאריכים שונים
        plans_data = []
        
        for i, date in enumerate(dates):
            plan_data = {
                "account_id": accounts[i % len(accounts)].id,
                "ticker_id": tickers[i % len(tickers)].id,
                "investment_type": investment_types[i % len(investment_types)],
                "planned_amount": random.randint(5000, 25000),
                "entry_conditions": f"תנאי כניסה לתכנון {i+1}",
                "stop_price": random.uniform(50, 200),
                "target_price": random.uniform(100, 300),
                "reasons": f"סיבה לתכנון {i+1}",
                "created_at": date
            }
            plans_data.append(plan_data)
        
        # הוספת התכנונים לבסיס הנתונים
        for plan_data in plans_data:
            plan = TradePlan(**plan_data)
            db.add(plan)
        
        db.commit()
        print(f"✅ Added {len(plans_data)} trade plans with different dates")
        
        # הדפסת סיכום
        print("\n📅 Trade Plans Summary:")
        for i, plan_data in enumerate(plans_data):
            ticker = db.query(Ticker).filter(Ticker.id == plan_data["ticker_id"]).first()
            account = db.query(Account).filter(Account.id == plan_data["account_id"]).first()
            date = plan_data["created_at"].strftime("%Y-%m-%d")
            print(f"  {i+1}. {ticker.symbol} - {account.name} - {date}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 Adding trade plans with different dates...")
    add_trade_plans_with_dates()
    print("✅ Done!")
