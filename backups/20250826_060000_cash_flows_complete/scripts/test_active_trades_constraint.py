#!/usr/bin/env python3
"""
Test Script: Active Trades Constraint
Date: August 24, 2025
Description: Test script for the active_trades dynamic constraint
"""

import sqlite3
import os
import sys
from datetime import datetime

def get_db_connection():
    """Get database connection"""
    db_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "db", "simpleTrade_new.db")
    return sqlite3.connect(db_path)

def test_active_trades_logic():
    """Test the active_trades logic"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        print("🧪 Testing active_trades logic...")
        
        # Get all tickers
        cursor.execute("SELECT id, symbol, active_trades FROM tickers")
        tickers = cursor.fetchall()
        
        print(f"📊 Found {len(tickers)} tickers to test")
        
        errors = []
        correct_count = 0
        
        for ticker in tickers:
            ticker_id, symbol, current_active = ticker
            
            # Calculate what active_trades should be
            cursor.execute("""
                SELECT 
                    (SELECT COUNT(*) > 0 FROM trades WHERE ticker_id = ? AND status = 'open') OR
                    (SELECT COUNT(*) > 0 FROM trade_plans WHERE ticker_id = ? AND status = 'open')
            """, (ticker_id, ticker_id))
            
            should_be_active = bool(cursor.fetchone()[0])
            
            if current_active == should_be_active:
                correct_count += 1
                print(f"  ✅ {symbol}: active_trades={current_active} (correct)")
            else:
                errors.append(f"  ❌ {symbol}: active_trades={current_active}, should be={should_be_active}")
                print(f"  ❌ {symbol}: active_trades={current_active}, should be={should_be_active}")
        
        print(f"\n📈 Results:")
        print(f"  ✅ Correct: {correct_count}/{len(tickers)}")
        print(f"  ❌ Errors: {len(errors)}")
        
        if errors:
            print(f"\n🔧 Errors found:")
            for error in errors:
                print(error)
        
        return len(errors) == 0
        
    except Exception as e:
        print(f"❌ Error testing active_trades logic: {e}")
        return False
    finally:
        conn.close()

def test_triggers():
    """Test the triggers work correctly"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        print("\n🧪 Testing triggers...")
        
        # Get a ticker with no active trades
        cursor.execute("""
            SELECT id, symbol, active_trades 
            FROM tickers 
            WHERE active_trades = 0 
            LIMIT 1
        """)
        
        ticker = cursor.fetchone()
        if not ticker:
            print("  ⚠️ No ticker with active_trades=0 found for testing")
            return True
        
        ticker_id, symbol, current_active = ticker
        print(f"  📊 Testing with ticker: {symbol} (ID: {ticker_id})")
        
        # Create a test trade plan
        cursor.execute("""
            INSERT INTO trade_plans (ticker_id, account_id, investment_type, side, status, created_at)
            VALUES (?, 1, 'swing', 'Long', 'open', CURRENT_TIMESTAMP)
        """, (ticker_id,))
        
        plan_id = cursor.lastrowid
        print(f"  ➕ Created test plan: {plan_id}")
        
        # Check if active_trades was updated
        cursor.execute("SELECT active_trades FROM tickers WHERE id = ?", (ticker_id,))
        new_active = cursor.fetchone()[0]
        
        if new_active:
            print(f"  ✅ Trigger worked: active_trades updated to {new_active}")
        else:
            print(f"  ❌ Trigger failed: active_trades still {new_active}")
        
        # Clean up - delete the test plan
        cursor.execute("DELETE FROM trade_plans WHERE id = ?", (plan_id,))
        print(f"  🗑️ Cleaned up test plan: {plan_id}")
        
        conn.commit()
        return new_active
        
    except Exception as e:
        print(f"❌ Error testing triggers: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()

def test_constraint_validation():
    """Test the constraint validation API"""
    import requests
    
    try:
        print("\n🧪 Testing constraint validation API...")
        
        # Test validation endpoint
        response = requests.get('http://localhost:8080/api/v1/constraints/active-trades/validate')
        
        if response.status_code == 200:
            data = response.json()
            print(f"  ✅ Validation API response: {data['message']}")
            return data['data']['is_valid']
        else:
            print(f"  ❌ Validation API failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"  ❌ Error testing validation API: {e}")
        return False

def main():
    """Main test function"""
    print("🚀 Starting Active Trades Constraint Tests")
    print("=" * 60)
    
    # Test 1: Logic validation
    logic_ok = test_active_trades_logic()
    
    # Test 2: Trigger functionality
    trigger_ok = test_triggers()
    
    # Test 3: API validation
    api_ok = test_constraint_validation()
    
    print("\n📋 Test Results Summary:")
    print(f"  ✅ Logic Test: {'PASS' if logic_ok else 'FAIL'}")
    print(f"  ✅ Trigger Test: {'PASS' if trigger_ok else 'FAIL'}")
    print(f"  ✅ API Test: {'PASS' if api_ok else 'FAIL'}")
    
    if logic_ok and trigger_ok and api_ok:
        print("\n🎉 All tests passed! Active trades constraint is working correctly.")
    else:
        print("\n⚠️ Some tests failed. Check the implementation.")

if __name__ == "__main__":
    main()
