#!/usr/bin/env python3
"""
Test CRUD operations for Executions with flexible association
Testing both ticker_id and trade_id scenarios
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'Backend'))

from config.database import SessionLocal
from models.execution import Execution
from models.ticker import Ticker
from models.trade import Trade
from models.trading_account import TradingAccount
from datetime import datetime
from sqlalchemy.exc import IntegrityError

def test_create_with_ticker():
    """Test: Create execution with ticker_id only"""
    print("\n" + "="*70)
    print("TEST 1: CREATE Execution with ticker_id")
    print("="*70)
    
    db = SessionLocal()
    try:
        # Get first ticker
        ticker = db.query(Ticker).first()
        if not ticker:
            print("❌ No tickers found - cannot test")
            return False
        
        print(f"📊 Using ticker: {ticker.symbol} (ID: {ticker.id})")
        
        # Create execution with ticker_id
        execution = Execution(
            ticker_id=ticker.id,
            trade_id=None,
            trading_account_id=None,
            action='buy',
            quantity=100,
            price=150.5,
            date=datetime.now(),
            fee=1.0,
            source='manual',
            notes='Test execution with ticker'
        )
        
        db.add(execution)
        db.commit()
        db.refresh(execution)
        
        print(f"✅ Created execution ID: {execution.id}")
        print(f"   ticker_id: {execution.ticker_id}")
        print(f"   trade_id: {execution.trade_id}")
        
        # Test to_dict()
        exec_dict = execution.to_dict()
        print(f"✅ to_dict() works:")
        print(f"   linked_type: {exec_dict.get('linked_type')}")
        print(f"   linked_display: {exec_dict.get('linked_display')}")
        
        # Clean up
        test_id = execution.id
        db.delete(execution)
        db.commit()
        print(f"✅ Cleaned up test execution {test_id}")
        
        return True
        
    except IntegrityError as e:
        db.rollback()
        print(f"❌ IntegrityError: {e}")
        return False
    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
        return False
    finally:
        db.close()

def test_create_with_trade():
    """Test: Create execution with trade_id (existing functionality)"""
    print("\n" + "="*70)
    print("TEST 2: CREATE Execution with trade_id")
    print("="*70)
    
    db = SessionLocal()
    try:
        # Get first trade
        trade = db.query(Trade).first()
        if not trade:
            print("❌ No trades found - cannot test")
            return False
        
        print(f"📊 Using trade ID: {trade.id}")
        print(f"   Trade account: {trade.trading_account_id}")
        
        # Create execution with trade_id
        execution = Execution(
            ticker_id=None,
            trade_id=trade.id,
            trading_account_id=trade.trading_account_id,
            action='buy',
            quantity=50,
            price=200.0,
            date=datetime.now(),
            fee=0.5,
            source='manual',
            notes='Test execution with trade'
        )
        
        db.add(execution)
        db.commit()
        db.refresh(execution)
        
        print(f"✅ Created execution ID: {execution.id}")
        print(f"   ticker_id: {execution.ticker_id}")
        print(f"   trade_id: {execution.trade_id}")
        
        # Test to_dict()
        exec_dict = execution.to_dict()
        print(f"✅ to_dict() works:")
        print(f"   linked_type: {exec_dict.get('linked_type')}")
        print(f"   linked_display: {exec_dict.get('linked_display')}")
        
        # Clean up
        test_id = execution.id
        db.delete(execution)
        db.commit()
        print(f"✅ Cleaned up test execution {test_id}")
        
        return True
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
        return False
    finally:
        db.close()

def test_create_with_both():
    """Test: Should FAIL - both ticker_id and trade_id"""
    print("\n" + "="*70)
    print("TEST 3: CREATE Execution with BOTH (should fail)")
    print("="*70)
    
    db = SessionLocal()
    try:
        ticker = db.query(Ticker).first()
        trade = db.query(Trade).first()
        
        execution = Execution(
            ticker_id=ticker.id,
            trade_id=trade.id,  # Both set - should fail!
            action='buy',
            quantity=10,
            price=100.0,
            date=datetime.now()
        )
        
        db.add(execution)
        db.commit()
        
        print("❌ FAILED: Should have raised IntegrityError but didn't!")
        return False
        
    except IntegrityError as e:
        db.rollback()
        print(f"✅ Correctly rejected: CHECK constraint working")
        print(f"   Error: {str(e)[:100]}...")
        return True
    except Exception as e:
        db.rollback()
        print(f"⚠️  Different error: {e}")
        return False
    finally:
        db.close()

def test_create_with_neither():
    """Test: Should FAIL - neither ticker_id nor trade_id"""
    print("\n" + "="*70)
    print("TEST 4: CREATE Execution with NEITHER (should fail)")
    print("="*70)
    
    db = SessionLocal()
    try:
        execution = Execution(
            ticker_id=None,
            trade_id=None,  # Both None - should fail!
            action='buy',
            quantity=10,
            price=100.0,
            date=datetime.now()
        )
        
        db.add(execution)
        db.commit()
        
        print("❌ FAILED: Should have raised IntegrityError but didn't!")
        return False
        
    except IntegrityError as e:
        db.rollback()
        print(f"✅ Correctly rejected: CHECK constraint working")
        print(f"   Error: {str(e)[:100]}...")
        return True
    except Exception as e:
        db.rollback()
        print(f"⚠️  Different error: {e}")
        return False
    finally:
        db.close()

def test_read_all():
    """Test: READ all executions"""
    print("\n" + "="*70)
    print("TEST 5: READ All Executions")
    print("="*70)
    
    db = SessionLocal()
    try:
        executions = db.query(Execution).all()
        print(f"✅ Found {len(executions)} executions")
        
        for i, ex in enumerate(executions[:3], 1):
            print(f"\nExecution {i}:")
            print(f"   ID: {ex.id}")
            print(f"   ticker_id: {ex.ticker_id}")
            print(f"   trade_id: {ex.trade_id}")
            print(f"   action: {ex.action}")
            print(f"   quantity: {ex.quantity}")
        
        if len(executions) > 3:
            print(f"\n   ... and {len(executions) - 3} more")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    finally:
        db.close()

def test_update():
    """Test: UPDATE execution - change from trade to ticker"""
    print("\n" + "="*70)
    print("TEST 6: UPDATE Execution (trade → ticker)")
    print("="*70)
    
    db = SessionLocal()
    try:
        # Create test execution with trade
        trade = db.query(Trade).first()
        ticker = db.query(Ticker).first()
        
        execution = Execution(
            ticker_id=None,
            trade_id=trade.id,
            trading_account_id=trade.trading_account_id,
            action='buy',
            quantity=25,
            price=175.0,
            date=datetime.now()
        )
        
        db.add(execution)
        db.commit()
        db.refresh(execution)
        
        test_id = execution.id
        print(f"✅ Created test execution {test_id} with trade_id={execution.trade_id}")
        
        # Update to ticker association
        execution.ticker_id = ticker.id
        execution.trade_id = None
        execution.trading_account_id = None
        
        db.commit()
        db.refresh(execution)
        
        print(f"✅ Updated execution {test_id}")
        print(f"   ticker_id: {execution.ticker_id}")
        print(f"   trade_id: {execution.trade_id}")
        
        # Clean up
        db.delete(execution)
        db.commit()
        print(f"✅ Cleaned up test execution {test_id}")
        
        return True
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
        return False
    finally:
        db.close()

def test_delete():
    """Test: DELETE execution"""
    print("\n" + "="*70)
    print("TEST 7: DELETE Execution")
    print("="*70)
    
    db = SessionLocal()
    try:
        # Create test execution
        ticker = db.query(Ticker).first()
        
        execution = Execution(
            ticker_id=ticker.id,
            trade_id=None,
            action='buy',
            quantity=10,
            price=100.0,
            date=datetime.now()
        )
        
        db.add(execution)
        db.commit()
        db.refresh(execution)
        
        test_id = execution.id
        print(f"✅ Created test execution {test_id}")
        
        # Delete
        db.delete(execution)
        db.commit()
        
        # Verify deleted
        check = db.query(Execution).filter(Execution.id == test_id).first()
        if check is None:
            print(f"✅ Execution {test_id} deleted successfully")
            return True
        else:
            print(f"❌ Execution {test_id} still exists!")
            return False
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
        return False
    finally:
        db.close()

if __name__ == "__main__":
    print("\n" + "="*70)
    print("EXECUTIONS CRUD TESTING SUITE")
    print("="*70)
    
    results = []
    
    # Run all tests
    results.append(("CREATE with ticker", test_create_with_ticker()))
    results.append(("CREATE with trade", test_create_with_trade()))
    results.append(("CREATE with both (fail)", test_create_with_both()))
    results.append(("CREATE with neither (fail)", test_create_with_neither()))
    results.append(("READ all", test_read_all()))
    results.append(("UPDATE", test_update()))
    results.append(("DELETE", test_delete()))
    
    # Summary
    print("\n" + "="*70)
    print("TEST RESULTS SUMMARY")
    print("="*70)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    print("="*70)
    print(f"TOTAL: {passed}/{total} tests passed")
    print("="*70)
    
    sys.exit(0 if passed == total else 1)

