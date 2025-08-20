#!/usr/bin/env python3
"""
תיקון תאריכי טריידים שנוצרו לפני תכנונים
מתקן תאריכי created_at של טריידים כך שיהיו אחרי תאריכי התכנונים
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from config.database import SessionLocal
from models import Trade, TradePlan
from datetime import datetime, timedelta

def fix_trade_dates():
    """תיקון תאריכי טריידים"""
    print("🔧 מתקן תאריכי טריידים...")
    
    db = SessionLocal()
    
    try:
        # מציאת טריידים שנוצרו לפני תכנונים
        trades_before_plans = db.query(Trade).join(TradePlan).filter(
            Trade.created_at < TradePlan.created_at
        ).all()
        
        print(f"📊 נמצאו {len(trades_before_plans)} טריידים שנוצרו לפני תכנונים")
        
        # תיקון תאריכים
        fixed_count = 0
        
        if not trades_before_plans:
            print("✅ כל הטריידים נוצרו אחרי תכנונים")
        else:
            for trade in trades_before_plans:
                plan = trade.trade_plan
                if plan and plan.created_at:
                    # הגדרת תאריך הטרייד ליום אחרי יצירת התוכנית
                    new_date = plan.created_at + timedelta(days=1)
                    trade.created_at = new_date
                    fixed_count += 1
                    print(f"✅ טרייד {trade.id}: תאריך עודכן ל-{new_date}")
        

        
        # תיקון תאריכי closed_at לפני created_at
        trades_with_invalid_closed = db.query(Trade).filter(
            Trade.closed_at.isnot(None),
            Trade.closed_at < Trade.created_at
        ).all()
        
        print(f"📊 נמצאו {len(trades_with_invalid_closed)} טריידים עם תאריך סגירה לפני יצירה")
        
        for trade in trades_with_invalid_closed:
            # הגדרת תאריך הסגירה ליום אחרי תאריך היצירה
            new_closed_date = trade.created_at + timedelta(days=1)
            old_closed_date = trade.closed_at
            trade.closed_at = new_closed_date
            fixed_count += 1
            print(f"✅ טרייד {trade.id}: תאריך סגירה עודכן מ-{old_closed_date} ל-{new_closed_date}")
        
        db.commit()
        print(f"✅ תוקנו {fixed_count} תאריכי טריידים")
        
        # בדיקה סופית
        remaining_before_plans = db.query(Trade).join(TradePlan).filter(
            Trade.created_at < TradePlan.created_at
        ).count()
        print(f"📊 נשארו {remaining_before_plans} טריידים שנוצרו לפני תכנונים")
        
    except Exception as e:
        print(f"❌ שגיאה בתיקון תאריכים: {str(e)}")
        db.rollback()
    finally:
        db.close()

def validate_trade_dates():
    """בדיקת תקינות תאריכי טריידים"""
    print("🔍 בודק תקינות תאריכי טריידים...")
    
    db = SessionLocal()
    
    try:
        # בדיקת טריידים שנוצרו לפני תכנונים
        trades_before_plans = db.query(Trade).join(TradePlan).filter(
            Trade.created_at < TradePlan.created_at
        ).count()
        print(f"📊 טריידים שנוצרו לפני תכנונים: {trades_before_plans}")
        
        # בדיקת טריידים עם תאריכי closed_at לפני created_at
        invalid_closed_dates = db.query(Trade).filter(
            Trade.closed_at.isnot(None),
            Trade.closed_at < Trade.created_at
        ).count()
        print(f"📊 טריידים עם תאריך סגירה לפני יצירה: {invalid_closed_dates}")
        
        if trades_before_plans == 0 and invalid_closed_dates == 0:
            print("✅ כל התאריכים תקינים!")
        else:
            print("⚠️ נמצאו בעיות בתאריכים")
            
    except Exception as e:
        print(f"❌ שגיאה בבדיקה: {str(e)}")
    finally:
        db.close()

def main():
    """פונקציה ראשית"""
    print("🚀 מתחיל תיקון תאריכי טריידים...")
    
    # בדיקה לפני תיקון
    print("\n📋 בדיקה לפני תיקון:")
    validate_trade_dates()
    
    # תיקון תאריכים
    print("\n🔧 מתקן תאריכים...")
    fix_trade_dates()
    
    # בדיקה אחרי תיקון
    print("\n📋 בדיקה אחרי תיקון:")
    validate_trade_dates()
    
    print("\n🎉 תיקון הושלם!")

if __name__ == "__main__":
    main()
