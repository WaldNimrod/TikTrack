#!/usr/bin/env python3
"""
Migrate User-Ticker Associations
==================================

This script creates user_ticker associations for all users based on their:
- Trades (trades.ticker_id)
- Trade plans (trade_plans.ticker_id)
- Executions (executions.ticker_id)

For each unique ticker, it creates a user_ticker association with:
- Initial status based on open trades/plans ('open' if has open, 'closed' otherwise)

Author: TikTrack Development Team
Date: January 2025
"""

import os
import sys
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from config.settings import DATABASE_URL
from models.user import User
from models.trade import Trade
from models.trade_plan import TradePlan
from models.execution import Execution
from models.user_ticker import UserTicker
from models.ticker import Ticker

def migrate_user_ticker_associations():
    """Create user_ticker associations for all users based on their trades/plans/executions"""
    
    print("🔄 Starting user-ticker associations migration...")
    print(f"➡️  Using database: PostgreSQL")
    
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    db = Session()
    
    try:
        users = db.query(User).all()
        print(f"📊 Found {len(users)} users")
        
        total_associations_created = 0
        
        for user in users:
            print(f"\n👤 Processing user {user.id} ({user.username or 'N/A'})...")
            
            # Get unique ticker IDs from trades
            trade_tickers = db.query(Trade.ticker_id).filter(
                Trade.user_id == user.id,
                Trade.ticker_id.isnot(None)
            ).distinct().all()
            trade_ticker_ids = [t[0] for t in trade_tickers if t[0]]
            
            # Get unique ticker IDs from trade plans
            plan_tickers = db.query(TradePlan.ticker_id).filter(
                TradePlan.user_id == user.id,
                TradePlan.ticker_id.isnot(None)
            ).distinct().all()
            plan_ticker_ids = [t[0] for t in plan_tickers if t[0]]
            
            # Get unique ticker IDs from executions
            execution_tickers = db.query(Execution.ticker_id).filter(
                Execution.user_id == user.id,
                Execution.ticker_id.isnot(None)
            ).distinct().all()
            execution_ticker_ids = [t[0] for t in execution_tickers if t[0]]
            
            # Combine all unique ticker IDs
            all_ticker_ids = set(trade_ticker_ids + plan_ticker_ids + execution_ticker_ids)
            
            print(f"   📈 Found {len(trade_ticker_ids)} tickers from trades")
            print(f"   📋 Found {len(plan_ticker_ids)} tickers from trade plans")
            print(f"   ⚡ Found {len(execution_ticker_ids)} tickers from executions")
            print(f"   🔢 Total unique tickers: {len(all_ticker_ids)}")
            
            # Create associations
            associations_created = 0
            for ticker_id in all_ticker_ids:
                # Check if association already exists
                existing = db.query(UserTicker).filter(
                    UserTicker.user_id == user.id,
                    UserTicker.ticker_id == ticker_id
                ).first()
                
                if existing:
                    print(f"   ⏭️  Skipping ticker {ticker_id} - association already exists")
                    continue
                
                # Verify ticker exists
                ticker = db.query(Ticker).filter(Ticker.id == ticker_id).first()
                if not ticker:
                    print(f"   ⚠️  Warning: Ticker {ticker_id} not found - skipping")
                    continue
                
                # Determine initial status
                has_open_trades = db.query(Trade).filter(
                    Trade.user_id == user.id,
                    Trade.ticker_id == ticker_id,
                    Trade.status == 'open'
                ).count() > 0
                
                has_open_plans = db.query(TradePlan).filter(
                    TradePlan.user_id == user.id,
                    TradePlan.ticker_id == ticker_id,
                    TradePlan.status == 'open'
                ).count() > 0
                
                status = 'open' if (has_open_trades or has_open_plans) else 'closed'
                
                user_ticker = UserTicker(
                    user_id=user.id,
                    ticker_id=ticker_id,
                    status=status,
                    created_at=datetime.utcnow()
                )
                db.add(user_ticker)
                associations_created += 1
                total_associations_created += 1
                
                print(f"   ✅ Created association for ticker {ticker_id} ({ticker.symbol}) - status: {status}")
            
            db.commit()
            print(f"   ✨ Created {associations_created} associations for user {user.id}")
        
        print(f"\n🎉 Migration completed successfully!")
        print(f"📊 Total associations created: {total_associations_created}")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error during migration: {e}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    migrate_user_ticker_associations()

