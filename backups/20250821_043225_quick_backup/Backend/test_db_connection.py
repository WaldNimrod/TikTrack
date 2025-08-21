#!/usr/bin/env python3
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session, joinedload
from config.database import get_db
from models.trade_plan import TradePlan
from models.trade import Trade
from models.account import Account
from models.ticker import Ticker

def test_db_connection():
    """בדיקת database connection"""
    try:
        db: Session = next(get_db())
        print("✅ Database connection successful")
        
        # בדיקת trade_plans
        plans = db.query(TradePlan).all()
        print(f"✅ Found {len(plans)} trade plans")
        
        # בדיקת trades
        trades = db.query(Trade).all()
        print(f"✅ Found {len(trades)} trades")
        
        # בדיקת accounts
        accounts = db.query(Account).all()
        print(f"✅ Found {len(accounts)} accounts")
        
        # בדיקת tickers
        tickers = db.query(Ticker).all()
        print(f"✅ Found {len(tickers)} tickers")
        
        # בדיקת trade_plans עם relationships
        plans_with_relations = db.query(TradePlan).options(
            joinedload(TradePlan.ticker),
            joinedload(TradePlan.account)
        ).all()
        print(f"✅ Loaded {len(plans_with_relations)} trade plans with relationships")
        
        if plans_with_relations:
            plan = plans_with_relations[0]
            print(f"✅ First plan: ID={plan.id}, Ticker={plan.ticker.symbol if plan.ticker else 'None'}, Account={plan.account.name if plan.account else 'None'}")
        
        db.close()
        print("✅ Database connection closed successfully")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_db_connection()
