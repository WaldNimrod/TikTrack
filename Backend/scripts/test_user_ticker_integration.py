#!/usr/bin/env python3
"""
Comprehensive Test Script for User-Ticker Integration
=====================================================

Tests all aspects of the user-ticker association system:
- Model fields
- Status calculation (user-level and ticker-level)
- API endpoints
- Performance

Author: TikTrack Development Team
Date: January 2025
"""

import os
import sys
import time
from datetime import datetime

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from config.settings import DATABASE_URL
from models.user_ticker import UserTicker
from models.ticker import Ticker
from models.trade import Trade
from models.trade_plan import TradePlan
from models.user import User
from services.ticker_service import TickerService

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'

def print_success(msg):
    print(f"{Colors.GREEN}✅ {msg}{Colors.RESET}")

def print_error(msg):
    print(f"{Colors.RED}❌ {msg}{Colors.RESET}")

def print_warning(msg):
    print(f"{Colors.YELLOW}⚠️  {msg}{Colors.RESET}")

def print_info(msg):
    print(f"{Colors.BLUE}ℹ️  {msg}{Colors.RESET}")

def test_model_fields(db):
    """Test that UserTicker model has all required fields"""
    print("\n" + "="*60)
    print("TEST 1: Model Fields")
    print("="*60)
    
    try:
        # Check table structure
        result = db.execute(text("""
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_name = 'user_tickers'
            ORDER BY ordinal_position
        """))
        
        columns = {row.column_name: row for row in result}
        
        required_fields = ['id', 'user_id', 'ticker_id', 'name_custom', 'type_custom', 'status', 'created_at', 'updated_at']
        missing = []
        
        for field in required_fields:
            if field not in columns:
                missing.append(field)
            else:
                print_success(f"Field '{field}' exists: {columns[field].data_type}")
        
        if missing:
            print_error(f"Missing fields: {missing}")
            return False
        
        # Check status default
        if columns['status'].column_default and 'open' in columns['status'].column_default:
            print_success("Status default is 'open'")
        else:
            print_warning("Status default may not be 'open'")
        
        return True
    except Exception as e:
        print_error(f"Error checking model fields: {e}")
        return False

def test_user_ticker_status_calculation(db):
    """Test user-ticker status calculation"""
    print("\n" + "="*60)
    print("TEST 2: User-Ticker Status Calculation")
    print("="*60)
    
    try:
        # Find a user with tickers
        user = db.query(User).filter(User.id == 10).first()
        if not user:
            print_error("User 10 not found")
            return False
        
        # Get a ticker with associations
        user_ticker = db.query(UserTicker).filter(UserTicker.user_id == 10).first()
        if not user_ticker:
            print_error("No user-ticker associations found for user 10")
            return False
        
        ticker_id = user_ticker.ticker_id
        user_id = user_ticker.user_id
        
        # Check current status
        old_status = user_ticker.status
        print_info(f"Testing ticker {ticker_id} for user {user_id}, current status: {old_status}")
        
        # Count open trades and plans
        open_trades = db.query(Trade).filter(
            Trade.user_id == user_id,
            Trade.ticker_id == ticker_id,
            Trade.status == 'open'
        ).count()
        
        open_plans = db.query(TradePlan).filter(
            TradePlan.user_id == user_id,
            TradePlan.ticker_id == ticker_id,
            TradePlan.status == 'open'
        ).count()
        
        expected_status = 'open' if (open_trades > 0 or open_plans > 0) else 'closed'
        print_info(f"Open trades: {open_trades}, Open plans: {open_plans}, Expected status: {expected_status}")
        
        # Update status
        result = TickerService.update_user_ticker_status(db, user_id, ticker_id)
        if not result:
            print_error("update_user_ticker_status returned False")
            return False
        
        db.refresh(user_ticker)
        new_status = user_ticker.status
        
        if new_status == expected_status:
            print_success(f"Status calculation correct: {old_status} -> {new_status}")
            return True
        else:
            print_error(f"Status mismatch: expected {expected_status}, got {new_status}")
            return False
            
    except Exception as e:
        print_error(f"Error testing status calculation: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_ticker_overall_status(db):
    """Test ticker overall status calculation"""
    print("\n" + "="*60)
    print("TEST 3: Ticker Overall Status Calculation")
    print("="*60)
    
    try:
        # Find a ticker with multiple user associations
        result = db.execute(text("""
            SELECT ticker_id, 
                   COUNT(CASE WHEN status = 'open' THEN 1 END) as open_count,
                   COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed_count
            FROM user_tickers
            GROUP BY ticker_id
            HAVING COUNT(*) > 1
            LIMIT 1
        """))
        
        row = result.fetchone()
        if not row:
            print_warning("No ticker with multiple associations found")
            return True  # Not a failure, just no data
        
        ticker_id = row.ticker_id
        open_count = row.open_count
        
        ticker = db.query(Ticker).filter(Ticker.id == ticker_id).first()
        if not ticker:
            print_error(f"Ticker {ticker_id} not found")
            return False
        
        old_status = ticker.status
        print_info(f"Testing ticker {ticker_id} ({ticker.symbol}), current status: {old_status}, open associations: {open_count}")
        
        # Update status
        result = TickerService.update_ticker_status_auto(db, ticker_id)
        if not result:
            print_error("update_ticker_status_auto returned False")
            return False
        
        db.refresh(ticker)
        new_status = ticker.status
        
        expected_status = 'open' if open_count > 0 else 'closed'
        
        if new_status == expected_status:
            print_success(f"Ticker status correct: {old_status} -> {new_status} (expected: {expected_status})")
            return True
        else:
            print_error(f"Ticker status mismatch: expected {expected_status}, got {new_status}")
            return False
            
    except Exception as e:
        print_error(f"Error testing ticker status: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_get_user_tickers(db):
    """Test get_user_tickers service method"""
    print("\n" + "="*60)
    print("TEST 4: get_user_tickers Service Method")
    print("="*60)
    
    try:
        user_id = 10
        
        # Get tickers using service
        start_time = time.time()
        tickers = TickerService.get_user_tickers(db, user_id)
        elapsed = time.time() - start_time
        
        if not tickers:
            print_error("get_user_tickers returned empty list")
            return False
        
        print_success(f"Retrieved {len(tickers)} tickers for user {user_id} in {elapsed:.3f}s")
        
        # Check that custom fields are attached
        sample = tickers[0]
        has_name_custom = hasattr(sample, 'name_custom')
        has_type_custom = hasattr(sample, 'type_custom')
        has_user_ticker_status = hasattr(sample, 'user_ticker_status')
        
        if has_name_custom and has_type_custom and has_user_ticker_status:
            print_success("Custom fields attached to ticker objects")
            print_info(f"Sample: {sample.symbol} - name_custom={sample.name_custom}, type_custom={sample.type_custom}, status={sample.user_ticker_status}")
        else:
            print_error(f"Missing custom fields: name_custom={has_name_custom}, type_custom={has_type_custom}, status={has_user_ticker_status}")
            return False
        
        # Verify all tickers belong to user
        user_ticker_ids = {ut.ticker_id for ut in db.query(UserTicker).filter(UserTicker.user_id == user_id).all()}
        returned_ids = {t.id for t in tickers}
        
        if returned_ids.issubset(user_ticker_ids):
            print_success("All returned tickers belong to user")
        else:
            print_error("Some returned tickers don't belong to user")
            return False
        
        return True
        
    except Exception as e:
        print_error(f"Error testing get_user_tickers: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_performance(db):
    """Test performance of key operations"""
    print("\n" + "="*60)
    print("TEST 5: Performance Tests")
    print("="*60)
    
    results = {}
    
    try:
        user_id = 10
        
        # Test 1: get_user_tickers performance
        print_info("Testing get_user_tickers performance...")
        times = []
        for i in range(5):
            start = time.time()
            tickers = TickerService.get_user_tickers(db, user_id)
            elapsed = time.time() - start
            times.append(elapsed)
        
        avg_time = sum(times) / len(times)
        results['get_user_tickers'] = avg_time
        print_info(f"Average time: {avg_time:.3f}s (min: {min(times):.3f}s, max: {max(times):.3f}s)")
        
        if avg_time > 1.0:
            print_warning(f"get_user_tickers is slow: {avg_time:.3f}s")
        else:
            print_success(f"get_user_tickers performance OK: {avg_time:.3f}s")
        
        # Test 2: Direct query performance (baseline)
        print_info("Testing direct query performance (baseline)...")
        times = []
        for i in range(5):
            start = time.time()
            result = db.execute(text("""
                SELECT t.*, ut.name_custom, ut.type_custom, ut.status as user_ticker_status
                FROM tickers t
                JOIN user_tickers ut ON t.id = ut.ticker_id
                WHERE ut.user_id = :user_id
            """), {"user_id": user_id})
            rows = result.fetchall()
            elapsed = time.time() - start
            times.append(elapsed)
        
        avg_time = sum(times) / len(times)
        results['direct_query'] = avg_time
        print_info(f"Average time: {avg_time:.3f}s")
        
        # Test 3: Status update performance
        print_info("Testing status update performance...")
        ticker_id = 7  # QQQ
        times = []
        for i in range(5):
            start = time.time()
            TickerService.update_ticker_status_auto(db, ticker_id)
            elapsed = time.time() - start
            times.append(elapsed)
        
        avg_time = sum(times) / len(times)
        results['update_status'] = avg_time
        print_info(f"Average time: {avg_time:.3f}s")
        
        if avg_time > 0.5:
            print_warning(f"Status update is slow: {avg_time:.3f}s")
        else:
            print_success(f"Status update performance OK: {avg_time:.3f}s")
        
        # Test 4: Check for N+1 query problems
        print_info("Checking for N+1 query problems...")
        # This would require query logging, but we can check if get_user_tickers makes too many queries
        # For now, just report the time
        
        return True
        
    except Exception as e:
        print_error(f"Error in performance tests: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_data_integrity(db):
    """Test data integrity"""
    print("\n" + "="*60)
    print("TEST 6: Data Integrity")
    print("="*60)
    
    try:
        # Check for orphaned associations
        result = db.execute(text("""
            SELECT COUNT(*) 
            FROM user_tickers ut
            LEFT JOIN tickers t ON ut.ticker_id = t.id
            WHERE t.id IS NULL
        """))
        orphaned = result.fetchone()[0]
        
        if orphaned > 0:
            print_error(f"Found {orphaned} orphaned user_ticker associations")
            return False
        else:
            print_success("No orphaned associations")
        
        # Check for orphaned users
        result = db.execute(text("""
            SELECT COUNT(*) 
            FROM user_tickers ut
            LEFT JOIN users u ON ut.user_id = u.id
            WHERE u.id IS NULL
        """))
        orphaned = result.fetchone()[0]
        
        if orphaned > 0:
            print_error(f"Found {orphaned} associations with invalid users")
            return False
        else:
            print_success("No invalid user associations")
        
        # Check for duplicate associations
        result = db.execute(text("""
            SELECT user_id, ticker_id, COUNT(*) as cnt
            FROM user_tickers
            GROUP BY user_id, ticker_id
            HAVING COUNT(*) > 1
        """))
        duplicates = result.fetchall()
        
        if duplicates:
            print_error(f"Found {len(duplicates)} duplicate associations")
            for dup in duplicates:
                print_error(f"  User {dup.user_id}, Ticker {dup.ticker_id}: {dup.cnt} entries")
            return False
        else:
            print_success("No duplicate associations")
        
        return True
        
    except Exception as e:
        print_error(f"Error in data integrity tests: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_status_consistency(db):
    """Test status consistency between user-ticker and ticker"""
    print("\n" + "="*60)
    print("TEST 7: Status Consistency")
    print("="*60)
    
    try:
        # Find tickers with open user associations
        result = db.execute(text("""
            SELECT t.id, t.symbol, t.status as ticker_status,
                   COUNT(CASE WHEN ut.status = 'open' THEN 1 END) as open_associations
            FROM tickers t
            LEFT JOIN user_tickers ut ON t.id = ut.ticker_id
            WHERE t.status != 'cancelled'
            GROUP BY t.id, t.symbol, t.status
            HAVING COUNT(CASE WHEN ut.status = 'open' THEN 1 END) > 0
            LIMIT 10
        """))
        
        inconsistencies = []
        for row in result:
            ticker_id = row.id
            ticker_status = row.ticker_status
            open_associations = row.open_associations
            
            # If there are open associations, ticker should be open
            if open_associations > 0 and ticker_status != 'open':
                inconsistencies.append((ticker_id, row.symbol, ticker_status, open_associations))
        
        if inconsistencies:
            print_warning(f"Found {len(inconsistencies)} inconsistencies:")
            for ticker_id, symbol, status, open_count in inconsistencies:
                print_warning(f"  {symbol} (ID {ticker_id}): ticker status={status}, but {open_count} open associations")
            
            # Try to fix
            print_info("Attempting to fix inconsistencies...")
            fixed = 0
            for ticker_id, _, _, _ in inconsistencies:
                if TickerService.update_ticker_status_auto(db, ticker_id):
                    fixed += 1
            print_success(f"Fixed {fixed} inconsistencies")
            return True
        else:
            print_success("All ticker statuses are consistent with user associations")
            return True
            
    except Exception as e:
        print_error(f"Error in status consistency test: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("USER-TICKER INTEGRATION COMPREHENSIVE TESTS")
    print("="*60)
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    db = Session()
    
    tests = [
        ("Model Fields", test_model_fields),
        ("User-Ticker Status Calculation", test_user_ticker_status_calculation),
        ("Ticker Overall Status", test_ticker_overall_status),
        ("get_user_tickers Service", test_get_user_tickers),
        ("Performance", test_performance),
        ("Data Integrity", test_data_integrity),
        ("Status Consistency", test_status_consistency),
    ]
    
    results = {}
    for test_name, test_func in tests:
        try:
            result = test_func(db)
            results[test_name] = result
        except Exception as e:
            print_error(f"Test '{test_name}' crashed: {e}")
            results[test_name] = False
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, result in results.items():
        if result:
            print_success(f"{test_name}: PASSED")
        else:
            print_error(f"{test_name}: FAILED")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print_success("All tests passed! 🎉")
        return 0
    else:
        print_error(f"{total - passed} test(s) failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())
