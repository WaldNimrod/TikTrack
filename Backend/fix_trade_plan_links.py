#!/usr/bin/env python3
"""
תיקון קישורי טריידים-תוכניות בבסיס הנתונים הפעיל
מתקן טריידים ללא קישור לתוכניות לפי כללי הקישור
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from config.database import SessionLocal
from models import Trade, TradePlan, Account, Ticker
from datetime import datetime

def fix_trade_plan_links():
    """תיקון קישורי טריידים-תוכניות"""
    print("🔧 מתקן קישורי טריידים-תוכניות...")
    
    db = SessionLocal()
    
    try:
        # מציאת טריידים ללא קישור לתוכניות
        trades_without_plans = db.query(Trade).filter(Trade.trade_plan_id.is_(None)).all()
        print(f"📊 נמצאו {len(trades_without_plans)} טריידים ללא קישור לתוכניות")
        
        if not trades_without_plans:
            print("✅ כל הטריידים מקושרים לתוכניות")
            return
        
        # קבלת כל התכנונים
        all_plans = db.query(TradePlan).all()
        print(f"📊 נמצאו {len(all_plans)} תכנונים זמינים")
        
        if not all_plans:
            print("❌ אין תכנונים זמינים - לא ניתן לקשר טריידים")
            return
        
        # קישור טריידים לתכנונים מתאימים
        linked_count = 0
        
        for trade in trades_without_plans:
            # מציאת תכנון מתאים לפי ticker_id
            matching_plan = db.query(TradePlan).filter(
                TradePlan.ticker_id == trade.ticker_id,
                TradePlan.side == trade.side
            ).first()
            
            if matching_plan:
                trade.trade_plan_id = matching_plan.id
                linked_count += 1
                print(f"✅ טרייד {trade.id} מקושר לתכנון {matching_plan.id} (ticker: {trade.ticker_id})")
            else:
                # אם אין תכנון מתאים, נשתמש בתכנון הראשון עם אותו side
                fallback_plan = db.query(TradePlan).filter(
                    TradePlan.side == trade.side
                ).first()
                
                if fallback_plan:
                    trade.trade_plan_id = fallback_plan.id
                    linked_count += 1
                    print(f"⚠️ טרייד {trade.id} מקושר לתכנון חלופי {fallback_plan.id} (side: {trade.side})")
                else:
                    print(f"❌ לא ניתן לקשר טרייד {trade.id} - אין תכנונים מתאימים")
        
        db.commit()
        print(f"✅ קושרו {linked_count} טריידים לתכנונים")
        
        # בדיקה סופית
        remaining_unlinked = db.query(Trade).filter(Trade.trade_plan_id.is_(None)).count()
        print(f"📊 נשארו {remaining_unlinked} טריידים ללא קישור")
        
    except Exception as e:
        print(f"❌ שגיאה בתיקון קישורים: {str(e)}")
        db.rollback()
    finally:
        db.close()

def validate_trade_plan_links():
    """בדיקת תקינות קישורי טריידים-תוכניות"""
    print("🔍 בודק תקינות קישורי טריידים-תוכניות...")
    
    db = SessionLocal()
    
    try:
        # בדיקת טריידים ללא קישור
        unlinked_trades = db.query(Trade).filter(Trade.trade_plan_id.is_(None)).count()
        print(f"📊 טריידים ללא קישור: {unlinked_trades}")
        
        # בדיקת אי-תאימות צד
        mismatched_sides = db.query(Trade).join(TradePlan).filter(
            Trade.side != TradePlan.side
        ).count()
        print(f"📊 אי-תאימות צד: {mismatched_sides}")
        
        # בדיקת אי-תאימות תאריכים
        trades_before_plans = db.query(Trade).join(TradePlan).filter(
            Trade.created_at < TradePlan.created_at
        ).count()
        print(f"📊 טריידים שנוצרו לפני תכנונים: {trades_before_plans}")
        
        # בדיקת ערכי type
        invalid_types = db.query(Trade).filter(
            ~Trade.type.in_(['swing', 'investment', 'passive'])
        ).count()
        print(f"📊 ערכי type לא תקינים: {invalid_types}")
        
        # בדיקת ערכי side
        invalid_sides = db.query(Trade).filter(
            ~Trade.side.in_(['Long', 'Short'])
        ).count()
        print(f"📊 ערכי side לא תקינים: {invalid_sides}")
        
        if unlinked_trades == 0 and mismatched_sides == 0 and invalid_types == 0 and invalid_sides == 0:
            print("✅ כל הקישורים תקינים!")
        else:
            print("⚠️ נמצאו בעיות בקישורים")
            
    except Exception as e:
        print(f"❌ שגיאה בבדיקה: {str(e)}")
    finally:
        db.close()

def main():
    """פונקציה ראשית"""
    print("🚀 מתחיל תיקון קישורי טריידים-תוכניות...")
    
    # בדיקה לפני תיקון
    print("\n📋 בדיקה לפני תיקון:")
    validate_trade_plan_links()
    
    # תיקון קישורים
    print("\n🔧 מתקן קישורים...")
    fix_trade_plan_links()
    
    # בדיקה אחרי תיקון
    print("\n📋 בדיקה אחרי תיקון:")
    validate_trade_plan_links()
    
    print("\n🎉 תיקון הושלם!")

if __name__ == "__main__":
    main()

