#!/usr/bin/env python3
"""
Create Sample Trade Plan with Conditions for QQQ Ticker
========================================================

This script creates a sample trade plan with conditions for QQQ ticker (ticker_id=7)
for testing purposes.

Usage:
    python3 Backend/scripts/create_sample_condition_for_qqq.py

Author: TikTrack Development Team
Date: November 2025
"""

import sys
import os
import json

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models.trade_plan import TradePlan
from models.plan_condition import PlanCondition
from models.trading_method import TradingMethod
from models.trading_account import TradingAccount
from models.ticker import Ticker
from config.settings import DATABASE_URL

def create_sample_condition():
    """Create sample trade plan with conditions for QQQ"""
    
    # Database setup - validate DATABASE_URL is not None
    if not DATABASE_URL:
        print("❌ DATABASE_URL is not configured")
        print("   Please set DATABASE_URL environment variable or configure PostgreSQL")
        return False
    
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    session = Session()
    
    try:
        # Get QQQ ticker (id=7)
        qqq_ticker = session.query(Ticker).filter(Ticker.id == 7).first()
        if not qqq_ticker:
            print("❌ QQQ ticker (id=7) not found")
            print("   Please ensure QQQ ticker exists in the database")
            return False
        
        print(f"✅ Found QQQ ticker: {qqq_ticker.symbol} (ID: {qqq_ticker.id})")
        
        # Get first trading account
        account = session.query(TradingAccount).first()
        if not account:
            print("❌ No trading account found")
            print("   Please create a trading account first")
            return False
        
        print(f"✅ Found trading account: {account.name} (ID: {account.id})")
        
        # Get trading methods - try to find by name_en
        # We'll use "Moving Averages" as a common method
        moving_avg_method = session.query(TradingMethod).filter(
            TradingMethod.name_en.ilike('%moving average%')
        ).first()
        
        # If not found, try to get any active method
        if not moving_avg_method:
            moving_avg_method = session.query(TradingMethod).filter(
                TradingMethod.is_active == True
            ).first()
        
        if not moving_avg_method:
            print("❌ No trading methods found")
            print("   Please ensure trading methods are seeded in the database")
            return False
        
        print(f"✅ Found trading method: {moving_avg_method.name_en} (ID: {moving_avg_method.id})")
        
        # Check if trade plan already exists for this ticker
        existing_plan = session.query(TradePlan).filter(
            TradePlan.ticker_id == qqq_ticker.id,
            TradePlan.status == 'open'
        ).first()
        
        if existing_plan:
            print(f"✅ Trade plan already exists for QQQ: Plan ID {existing_plan.id}")
            print("   Checking if it has conditions...")
            
            # Check existing conditions
            existing_conditions = session.query(PlanCondition).filter(
                PlanCondition.trade_plan_id == existing_plan.id
            ).all()
            
            if len(existing_conditions) > 0:
                print(f"   Plan already has {len(existing_conditions)} condition(s)")
                print("   Skipping creation to avoid duplicates")
                return True
            else:
                print("   Plan has no conditions - will add conditions to existing plan")
                trade_plan = existing_plan
        
        # Create trade plan
        trade_plan = TradePlan(
            user_id=1,  # Default user
            trading_account_id=account.id,
            ticker_id=qqq_ticker.id,
            investment_type='swing',
            side='Long',
            status='open',
            planned_amount=10000,
            entry_price=400.0,
            stop_price=380.0,
            target_price=450.0,
            notes='תוכנית דוגמה לטיקר QQQ - נוצרה אוטומטית לבדיקות'
        )
        session.add(trade_plan)
        session.flush()
        
        print(f"✅ Created trade plan: ID {trade_plan.id}")
        
        # Create conditions
        conditions_created = 0
        
        # Condition 1: Moving Average (if method found)
        if moving_avg_method:
            try:
                condition1 = PlanCondition(
                    trade_plan_id=trade_plan.id,
                    method_id=moving_avg_method.id,
                    condition_group=0,
                    parameters_json=json.dumps({
                        'ma_period': 20,
                        'ma_type': 'SMA',
                        'comparison_type': 'above'
                    }, ensure_ascii=False),
                    logical_operator='NONE',
                    is_active=True,
                    auto_generate_alerts=True,
                    trigger_action='enter_trade_positive',
                    action_notes='מחיר מעל ממוצע נע 20 תקופות'
                )
                session.add(condition1)
                conditions_created += 1
                print(f"✅ Created condition 1: Moving Average")
            except Exception as e:
                print(f"⚠️  Error creating condition 1: {e}")
        
        # Commit all changes
        session.commit()
        
        print(f"\n✅ Successfully created trade plan {trade_plan.id} with {conditions_created} condition(s) for QQQ")
        print(f"   Ticker: {qqq_ticker.symbol}")
        print(f"   Account: {account.name}")
        print(f"   Entry Price: ${trade_plan.entry_price}")
        print(f"   Stop Price: ${trade_plan.stop_price}")
        print(f"   Target Price: ${trade_plan.target_price}")
        
        return True
        
    except Exception as e:
        session.rollback()
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        session.close()

if __name__ == '__main__':
    print("=" * 60)
    print("Create Sample Trade Plan with Conditions for QQQ")
    print("=" * 60)
    print()
    
    success = create_sample_condition()
    
    if success:
        print("\n✅ Script completed successfully")
        sys.exit(0)
    else:
        print("\n❌ Script failed")
        sys.exit(1)

