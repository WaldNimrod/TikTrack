#!/usr/bin/env python3
"""
Fix trade-plan links in active database
Fixes trades without plan links according to linking rules
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from config.database import SessionLocal
from models import Trade, TradePlan, Account, Ticker
from datetime import datetime

def fix_trade_plan_links():
    """Fix trade-plan links"""
    print("🔧 Fixing trade-plan links...")
    
    db = SessionLocal()
    
    try:
        # Find trades without plan links
        trades_without_plans = db.query(Trade).filter(Trade.trade_plan_id.is_(None)).all()
        print(f"📊 Found {len(trades_without_plans)} trades without plan links")
        
        if not trades_without_plans:
            print("✅ All trades are linked to plans")
            return
        
        # Get all plans
        all_plans = db.query(TradePlan).all()
        print(f"📊 Found {len(all_plans)} available plans")
        
        if not all_plans:
            print("❌ No available plans - cannot link trades")
            return
        
        # Link trades to appropriate plans
        linked_count = 0
        
        for trade in trades_without_plans:
            # Find matching plan by ticker_id
            matching_plan = db.query(TradePlan).filter(
                TradePlan.ticker_id == trade.ticker_id,
                TradePlan.side == trade.side
            ).first()
            
            if matching_plan:
                trade.trade_plan_id = matching_plan.id
                linked_count += 1
                print(f"✅ Trade {trade.id} linked to plan {matching_plan.id} (ticker: {trade.ticker_id})")
            else:
                # If no matching plan, use first plan with same side
                fallback_plan = db.query(TradePlan).filter(
                    TradePlan.side == trade.side
                ).first()
                
                if fallback_plan:
                    trade.trade_plan_id = fallback_plan.id
                    linked_count += 1
                    print(f"⚠️ Trade {trade.id} linked to fallback plan {fallback_plan.id} (side: {trade.side})")
                else:
                    print(f"❌ Cannot link trade {trade.id} - no suitable plans")
        
        db.commit()
        print(f"✅ Linked {linked_count} trades to plans")
        
        # Final check
        remaining_unlinked = db.query(Trade).filter(Trade.trade_plan_id.is_(None)).count()
        print(f"📊 Remaining {remaining_unlinked} unlinked trades")
        
    except Exception as e:
        print(f"❌ Error fixing links: {str(e)}")
        db.rollback()
    finally:
        db.close()

def validate_trade_plan_links():
    """Validate trade-plan link integrity"""
    print("🔍 Checking trade-plan link integrity...")
    
    db = SessionLocal()
    
    try:
        # Check unlinked trades
        unlinked_trades = db.query(Trade).filter(Trade.trade_plan_id.is_(None)).count()
        print(f"📊 Unlinked trades: {unlinked_trades}")
        
        # Check side mismatches
        mismatched_sides = db.query(Trade).join(TradePlan).filter(
            Trade.side != TradePlan.side
        ).count()
        print(f"📊 Side mismatches: {mismatched_sides}")
        
        # Check date mismatches
        trades_before_plans = db.query(Trade).join(TradePlan).filter(
            Trade.created_at < TradePlan.created_at
        ).count()
        print(f"📊 Trades created before plans: {trades_before_plans}")
        
        # Check type values
        invalid_types = db.query(Trade).filter(
            ~Trade.type.in_(['swing', 'investment', 'passive'])
        ).count()
        print(f"📊 Invalid type values: {invalid_types}")
        
        # Check side values
        invalid_sides = db.query(Trade).filter(
            ~Trade.side.in_(['Long', 'Short'])
        ).count()
        print(f"📊 Invalid side values: {invalid_sides}")
        
        if unlinked_trades == 0 and mismatched_sides == 0 and invalid_types == 0 and invalid_sides == 0:
            print("✅ All links are valid!")
        else:
            print("⚠️ Found link issues")
            
    except Exception as e:
        print(f"❌ Error in validation: {str(e)}")
    finally:
        db.close()

def main():
    """Main function"""
    print("🚀 Starting trade-plan link fix...")
    
    # Check before fix
    print("\n📋 Check before fix:")
    validate_trade_plan_links()
    
    # Fix links
    print("\n🔧 Fixing links...")
    fix_trade_plan_links()
    
    # Check after fix
    print("\n📋 Check after fix:")
    validate_trade_plan_links()
    
    print("\n🎉 Fix completed!")

if __name__ == "__main__":
    main()

