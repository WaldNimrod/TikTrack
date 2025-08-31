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
        
        # Get all tickers
        cursor.execute("SELECT id, symbol, active_trades FROM tickers")
        tickers = cursor.fetchall()
        
        
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
            else:
                errors.append(f"  ❌ {symbol}: active_trades={current_active}, should be={should_be_active}")
        
        
        if errors:
            for error in errors:
        
        return len(errors) == 0
        
    except Exception as e:
        return False
    finally:
        conn.close()

def test_triggers():
    """Test the triggers work correctly"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        
        # Get a ticker with no active trades
        cursor.execute("""
            SELECT id, symbol, active_trades 
            FROM tickers 
            WHERE active_trades = 0 
            LIMIT 1
        """)
        
        ticker = cursor.fetchone()
        if not ticker:
            return True
        
        ticker_id, symbol, current_active = ticker
        
        # Create a test trade plan
        cursor.execute("""
            INSERT INTO trade_plans (ticker_id, account_id, investment_type, side, status, created_at)
            VALUES (?, 1, 'swing', 'Long', 'open', CURRENT_TIMESTAMP)
        """, (ticker_id,))
        
        plan_id = cursor.lastrowid
        
        # Check if active_trades was updated
        cursor.execute("SELECT active_trades FROM tickers WHERE id = ?", (ticker_id,))
        new_active = cursor.fetchone()[0]
        
        if new_active:
        else:
        
        # Clean up - delete the test plan
        cursor.execute("DELETE FROM trade_plans WHERE id = ?", (plan_id,))
        
        conn.commit()
        return new_active
        
    except Exception as e:
        conn.rollback()
        return False
    finally:
        conn.close()

def test_constraint_validation():
    """Test the constraint validation API"""
    import requests
    
    try:
        
        # Test validation endpoint
        response = requests.get('http://localhost:8080/api/v1/constraints/active-trades/validate')
        
        if response.status_code == 200:
            data = response.json()
            return data['data']['is_valid']
        else:
            return False
            
    except Exception as e:
        return False

def main():
    """Main test function"""
    
    # Test 1: Logic validation
    logic_ok = test_active_trades_logic()
    
    # Test 2: Trigger functionality
    trigger_ok = test_triggers()
    
    # Test 3: API validation
    api_ok = test_constraint_validation()
    
    
    if logic_ok and trigger_ok and api_ok:
    else:

if __name__ == "__main__":
    main()
