#!/usr/bin/env python3
"""
Fix trade dates created before plans
Fixes created_at dates of trades to be after plan dates
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from config.database import SessionLocal
from models import Trade, TradePlan
from datetime import datetime, timedelta

def fix_trade_dates():
    """Fix trade dates"""
    print("🔧 Fixing trade dates...")
    
    db = SessionLocal()
    
    try:
        # Find trades created before plans
        trades_before_plans = db.query(Trade).join(TradePlan).filter(
            Trade.created_at < TradePlan.created_at
        ).all()
        
        print(f"📊 Found {len(trades_before_plans)} trades created before plans")
        
        # Fix dates
        fixed_count = 0
        
        if not trades_before_plans:
            print("✅ All trades were created after plans")
        else:
            for trade in trades_before_plans:
                plan = trade.trade_plan
                if plan and plan.created_at:
                    # Set trade date to day after plan creation
                    new_date = plan.created_at + timedelta(days=1)
                    trade.created_at = new_date
                    fixed_count += 1
                    print(f"✅ Trade {trade.id}: date updated to {new_date}")
        

        
        # Fix closed_at dates before created_at
        trades_with_invalid_closed = db.query(Trade).filter(
            Trade.closed_at.isnot(None),
            Trade.closed_at < Trade.created_at
        ).all()
        
        print(f"📊 Found {len(trades_with_invalid_closed)} trades with closing date before creation")
        
        for trade in trades_with_invalid_closed:
            # Set closing date to day after creation date
            new_closed_date = trade.created_at + timedelta(days=1)
            old_closed_date = trade.closed_at
            trade.closed_at = new_closed_date
            fixed_count += 1
            print(f"✅ Trade {trade.id}: closing date updated from {old_closed_date} to {new_closed_date}")
        
        db.commit()
        print(f"✅ Fixed {fixed_count} trade dates")
        
        # Final check
        remaining_before_plans = db.query(Trade).join(TradePlan).filter(
            Trade.created_at < TradePlan.created_at
        ).count()
        print(f"📊 Remaining {remaining_before_plans} trades created before plans")
        
    except Exception as e:
        print(f"❌ Error fixing dates: {str(e)}")
        db.rollback()
    finally:
        db.close()

def validate_trade_dates():
    """Validate trade date integrity"""
    print("🔍 Checking trade date integrity...")
    
    db = SessionLocal()
    
    try:
        # Check trades created before plans
        trades_before_plans = db.query(Trade).join(TradePlan).filter(
            Trade.created_at < TradePlan.created_at
        ).count()
        print(f"📊 Trades created before plans: {trades_before_plans}")
        
        # Check trades with closed_at before created_at
        invalid_closed_dates = db.query(Trade).filter(
            Trade.closed_at.isnot(None),
            Trade.closed_at < Trade.created_at
        ).count()
        print(f"📊 Trades with closing date before creation: {invalid_closed_dates}")
        
        if trades_before_plans == 0 and invalid_closed_dates == 0:
            print("✅ All dates are valid!")
        else:
            print("⚠️ Found date issues")
            
    except Exception as e:
        print(f"❌ Error in validation: {str(e)}")
    finally:
        db.close()

def main():
    """Main function"""
    print("🚀 Starting trade date fix...")
    
    # Check before fix
    print("\n📋 Check before fix:")
    validate_trade_dates()
    
    # Fix dates
    print("\n🔧 Fixing dates...")
    fix_trade_dates()
    
    # Check after fix
    print("\n📋 Check after fix:")
    validate_trade_dates()
    
    print("\n🎉 Fix completed!")

if __name__ == "__main__":
    main()
