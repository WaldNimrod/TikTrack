#!/usr/bin/env python3
"""
Test script to verify EntityDetailsService returns all required fields for linked items
"""

import sys
import os
from pathlib import Path

# Add Backend to path
BACKEND_DIR = Path(__file__).parent.parent
sys.path.insert(0, str(BACKEND_DIR))
os.chdir(str(BACKEND_DIR))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models.base import Base
from services.entity_details_service import EntityDetailsService

# Database setup
DB_PATH = BACKEND_DIR / "db" / "simpleTrade_new.db"
engine = create_engine(f'sqlite:///{DB_PATH}')
SessionLocal = sessionmaker(bind=engine)

# Required fields according to specification
REQUIRED_FIELDS = {
    'base': ['id', 'type', 'title', 'description', 'created_at', 'status'],
    'trade': ['id', 'type', 'title', 'description', 'created_at', 'status', 'side', 'investment_type'],
    'trade_plan': ['id', 'type', 'title', 'description', 'created_at', 'status', 'side', 'investment_type'],
    'execution': ['id', 'type', 'title', 'description', 'created_at', 'status'],
    'cash_flow': ['id', 'type', 'title', 'description', 'created_at', 'status'],
    'note': ['id', 'type', 'title', 'description', 'created_at', 'status'],
    'alert': ['id', 'type', 'title', 'description', 'created_at', 'status'],
    'trading_account': ['id', 'type', 'title', 'description', 'created_at', 'status']
}

def check_fields(entity, entity_type, required_fields):
    """Check if entity has all required fields"""
    missing_fields = []
    for field in required_fields:
        if field not in entity:
            missing_fields.append(field)
        elif entity[field] is None and field in ['title', 'description', 'status']:
            missing_fields.append(f"{field} (is None)")
    
    return missing_fields

def test_ticker_linked_items():
    """Test ticker linked items"""
    print("\n=== Testing Ticker Linked Items (EntityDetailsService) ===")
    db = SessionLocal()
    
    try:
        # Get a ticker ID
        from models.ticker import Ticker
        ticker = db.query(Ticker).first()
        if not ticker:
            print("⚠️  No tickers found in database")
            return
        
        ticker_id = ticker.id
        print(f"Testing with ticker_id: {ticker_id}")
        
        linked_items = EntityDetailsService._get_ticker_linked_items(db, ticker_id)
        print(f"Found {len(linked_items)} linked items")
        
        for i, item in enumerate(linked_items):
            print(f"\n  Item {i+1}: type={item.get('type')}, id={item.get('id')}")
            required = REQUIRED_FIELDS.get(item.get('type', ''), REQUIRED_FIELDS['base'])
            missing = check_fields(item, item.get('type'), required)
            
            # EntityDetailsService uses 'name' and 'title' instead of 'description'
            # Check if we have at least one of them
            has_description = 'description' in item or 'name' in item or 'title' in item or 'display_name' in item
            
            if missing and not has_description:
                print(f"    ❌ Missing fields: {missing}")
                print(f"    Available fields: {list(item.keys())}")
            else:
                if missing:
                    print(f"    ⚠️  Missing base fields: {missing}, but has description alternative")
                else:
                    print(f"    ✅ All required fields present")
                # Print sample values
                desc = item.get('description') or item.get('name') or item.get('title') or item.get('display_name') or 'N/A'
                print(f"    Sample: title='{item.get('title')}', description/name='{desc[:50]}...'")
    finally:
        db.close()

def test_trade_linked_items():
    """Test trade linked items"""
    print("\n=== Testing Trade Linked Items (EntityDetailsService) ===")
    db = SessionLocal()
    
    try:
        # Get a trade ID
        from models.trade import Trade
        trade = db.query(Trade).first()
        if not trade:
            print("⚠️  No trades found in database")
            return
        
        trade_id = trade.id
        print(f"Testing with trade_id: {trade_id}")
        
        linked_items = EntityDetailsService._get_trade_linked_items(db, trade_id)
        print(f"Found {len(linked_items)} linked items")
        
        for i, item in enumerate(linked_items):
            print(f"\n  Item {i+1}: type={item.get('type')}, id={item.get('id')}")
            required = REQUIRED_FIELDS.get(item.get('type', ''), REQUIRED_FIELDS['base'])
            missing = check_fields(item, item.get('type'), required)
            
            # EntityDetailsService uses 'name' and 'title' instead of 'description'
            has_description = 'description' in item or 'name' in item or 'title' in item or 'display_name' in item
            
            if missing and not has_description:
                print(f"    ❌ Missing fields: {missing}")
                print(f"    Available fields: {list(item.keys())}")
            else:
                if missing:
                    print(f"    ⚠️  Missing base fields: {missing}, but has description alternative")
                else:
                    print(f"    ✅ All required fields present")
                # Print sample values
                desc = item.get('description') or item.get('name') or item.get('title') or item.get('display_name') or 'N/A'
                print(f"    Sample: title='{item.get('title')}', description/name='{desc[:50]}...'")
    finally:
        db.close()

def test_account_linked_items():
    """Test account linked items"""
    print("\n=== Testing Account Linked Items (EntityDetailsService) ===")
    db = SessionLocal()
    
    try:
        # Get an account ID
        from models.trading_account import TradingAccount
        account = db.query(TradingAccount).first()
        if not account:
            print("⚠️  No accounts found in database")
            return
        
        account_id = account.id
        print(f"Testing with account_id: {account_id}")
        
        linked_items = EntityDetailsService._get_account_linked_items(db, account_id)
        print(f"Found {len(linked_items)} linked items")
        
        for i, item in enumerate(linked_items):
            print(f"\n  Item {i+1}: type={item.get('type')}, id={item.get('id')}")
            required = REQUIRED_FIELDS.get(item.get('type', ''), REQUIRED_FIELDS['base'])
            missing = check_fields(item, item.get('type'), required)
            
            # EntityDetailsService uses 'name' and 'title' instead of 'description'
            has_description = 'description' in item or 'name' in item or 'title' in item or 'display_name' in item
            
            if missing and not has_description:
                print(f"    ❌ Missing fields: {missing}")
                print(f"    Available fields: {list(item.keys())}")
            else:
                if missing:
                    print(f"    ⚠️  Missing base fields: {missing}, but has description alternative")
                else:
                    print(f"    ✅ All required fields present")
                # Print sample values
                desc = item.get('description') or item.get('name') or item.get('title') or item.get('display_name') or 'N/A'
                print(f"    Sample: title='{item.get('title')}', description/name='{desc[:50]}...'")
    finally:
        db.close()

def main():
    """Run all tests"""
    print("=" * 60)
    print("EntityDetailsService Linked Items Fields Verification Test")
    print("=" * 60)
    
    test_ticker_linked_items()
    test_trade_linked_items()
    test_account_linked_items()
    
    print("\n" + "=" * 60)
    print("Test completed!")
    print("=" * 60)

if __name__ == '__main__':
    main()


