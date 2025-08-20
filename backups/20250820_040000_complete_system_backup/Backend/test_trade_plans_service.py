#!/usr/bin/env python3
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from config.database import get_db
from services.trade_plan_service import TradePlanService

def test_trade_plans_service():
    """בדיקת trade_plans service"""
    try:
        db: Session = next(get_db())
        print("✅ Database connection successful")
        
        # בדיקת trade_plans service
        plans = TradePlanService.get_all(db)
        print(f"✅ Found {len(plans)} trade plans via service")
        
        if plans:
            plan = plans[0]
            print(f"✅ First plan: ID={plan.id}, Ticker={plan.ticker.symbol if plan.ticker else 'None'}, Account={plan.account.name if plan.account else 'None'}")
            
            # בדיקת to_dict
            plan_dict = plan.to_dict()
            print(f"✅ Plan dict: {plan_dict}")
        
        db.close()
        print("✅ Database connection closed successfully")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_trade_plans_service()
