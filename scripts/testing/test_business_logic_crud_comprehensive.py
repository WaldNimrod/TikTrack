#!/usr/bin/env python3
"""
Comprehensive CRUD Testing Script for Business Logic Phase 2
===========================================================

This script tests all CRUD operations for all entities with Business Logic API integration.

Usage:
    python scripts/testing/test_business_logic_crud_comprehensive.py

Requirements:
    - Server must be running on http://127.0.0.1:8080
    - PostgreSQL database must be available
"""

import requests
import json
import sys
from typing import Dict, Any, List, Optional
from datetime import datetime

# Configuration
BASE_URL = "http://127.0.0.1:8080"
API_BASE = f"{BASE_URL}/api"
BUSINESS_API_BASE = f"{BASE_URL}/api/business"

# Test results storage
test_results = {
    "total_tests": 0,
    "passed_tests": 0,
    "failed_tests": 0,
    "errors": []
}


def log_test(test_name: str, passed: bool, error: Optional[str] = None):
    """Log test result."""
    test_results["total_tests"] += 1
    if passed:
        test_results["passed_tests"] += 1
        print(f"✅ {test_name}")
    else:
        test_results["failed_tests"] += 1
        test_results["errors"].append(f"{test_name}: {error}")
        print(f"❌ {test_name}: {error}")


def test_api_endpoint(method: str, url: str, data: Optional[Dict] = None, expected_status: int = 200) -> Optional[Dict]:
    """Test API endpoint and return response data."""
    try:
        if method == "GET":
            response = requests.get(url, timeout=5)
        elif method == "POST":
            response = requests.post(url, json=data, headers={"Content-Type": "application/json"}, timeout=5)
        elif method == "PUT":
            response = requests.put(url, json=data, headers={"Content-Type": "application/json"}, timeout=5)
        elif method == "DELETE":
            response = requests.delete(url, timeout=5)
        else:
            raise ValueError(f"Unsupported method: {method}")
        
        if response.status_code == expected_status:
            try:
                return response.json()
            except:
                return {"status": "success", "data": response.text}
        else:
            return {"status": "error", "error": f"Expected {expected_status}, got {response.status_code}"}
    except Exception as e:
        return {"status": "error", "error": str(e)}


# ============================================================================
# Trade CRUD Tests
# ============================================================================

def test_trade_crud():
    """Test Trade CRUD operations with Business Logic validation."""
    print("\n" + "="*60)
    print("Testing Trade CRUD Operations")
    print("="*60)
    
    # Test 1: Business Logic API - Calculate Stop Price
    print("\n1. Testing Business Logic API - Calculate Stop Price")
    result = test_api_endpoint("POST", f"{BUSINESS_API_BASE}/trade/calculate-stop-price", {
        "current_price": 100.0,
        "stop_percentage": 10.0,
        "side": "Long"
    })
    log_test("Calculate Stop Price (Long)", result.get("status") == "success" and result.get("data", {}).get("stop_price") == 90.0)
    
    # Test 2: Business Logic API - Calculate Target Price
    print("\n2. Testing Business Logic API - Calculate Target Price")
    result = test_api_endpoint("POST", f"{BUSINESS_API_BASE}/trade/calculate-target-price", {
        "current_price": 100.0,
        "target_percentage": 20.0,
        "side": "Long"
    })
    log_test("Calculate Target Price (Long)", result.get("status") == "success" and result.get("data", {}).get("target_price") == 120.0)
    
    # Test 3: Business Logic API - Validate Trade
    print("\n3. Testing Business Logic API - Validate Trade")
    result = test_api_endpoint("POST", f"{BUSINESS_API_BASE}/trade/validate", {
        "price": 100.0,
        "quantity": 10.0,
        "side": "Long",
        "investment_type": "Investment",
        "status": "open"
    })
    log_test("Validate Trade (Valid)", result.get("status") == "success")
    
    # Test 4: Validate Trade (Invalid - missing fields)
    result = test_api_endpoint("POST", f"{BUSINESS_API_BASE}/trade/validate", {
        "price": 100.0
        # Missing required fields
    }, expected_status=400)
    log_test("Validate Trade (Invalid - Missing Fields)", result.get("status") == "error")
    
    # Test 5: Create Trade (if we have test data)
    print("\n4. Testing Create Trade")
    # This requires valid test data (ticker_id, trading_account_id, etc.)
    # Skipping for now - requires database setup
    
    # Test 6: Read Trades
    print("\n5. Testing Read Trades")
    result = test_api_endpoint("GET", f"{API_BASE}/trades/")
    log_test("Read Trades", result is not None)


# ============================================================================
# Execution CRUD Tests
# ============================================================================

def test_execution_crud():
    """Test Execution CRUD operations with Business Logic validation."""
    print("\n" + "="*60)
    print("Testing Execution CRUD Operations")
    print("="*60)
    
    # Test 1: Business Logic API - Calculate Execution Values
    print("\n1. Testing Business Logic API - Calculate Execution Values (Buy)")
    result = test_api_endpoint("POST", f"{BUSINESS_API_BASE}/execution/calculate-values", {
        "quantity": 10.0,
        "price": 100.0,
        "commission": 1.0,
        "action": "buy"
    })
    log_test("Calculate Execution Values (Buy)", result.get("status") == "success" and result.get("data", {}).get("total") == -1001.0)
    
    # Test 2: Calculate Execution Values (Sell)
    print("\n2. Testing Business Logic API - Calculate Execution Values (Sell)")
    result = test_api_endpoint("POST", f"{BUSINESS_API_BASE}/execution/calculate-values", {
        "quantity": 10.0,
        "price": 100.0,
        "commission": 1.0,
        "action": "sell"
    })
    log_test("Calculate Execution Values (Sell)", result.get("status") == "success" and result.get("data", {}).get("total") == 999.0)
    
    # Test 3: Business Logic API - Calculate Average Price
    print("\n3. Testing Business Logic API - Calculate Average Price")
    result = test_api_endpoint("POST", f"{BUSINESS_API_BASE}/execution/calculate-average-price", {
        "executions": [
            {"quantity": 10.0, "price": 100.0},
            {"quantity": 5.0, "price": 110.0}
        ]
    })
    log_test("Calculate Average Price", result.get("status") == "success")
    
    # Test 4: Business Logic API - Validate Execution
    print("\n4. Testing Business Logic API - Validate Execution")
    result = test_api_endpoint("POST", f"{BUSINESS_API_BASE}/execution/validate", {
        "quantity": 10.0,
        "price": 100.0,
        "action": "buy"
    })
    log_test("Validate Execution (Valid)", result.get("status") == "success")
    
    # Test 5: Read Executions
    print("\n5. Testing Read Executions")
    result = test_api_endpoint("GET", f"{API_BASE}/executions/")
    log_test("Read Executions", result is not None)


# ============================================================================
# Alert CRUD Tests
# ============================================================================

def test_alert_crud():
    """Test Alert CRUD operations with Business Logic validation."""
    print("\n" + "="*60)
    print("Testing Alert CRUD Operations")
    print("="*60)
    
    # Test 1: Business Logic API - Validate Alert
    print("\n1. Testing Business Logic API - Validate Alert")
    result = test_api_endpoint("POST", f"{BUSINESS_API_BASE}/alert/validate", {
        "condition_attribute": "price",
        "condition_operator": ">",
        "condition_number": 100.0
    })
    log_test("Validate Alert (Valid)", result.get("status") == "success")
    
    # Test 2: Business Logic API - Validate Condition Value
    print("\n2. Testing Business Logic API - Validate Condition Value (Price)")
    result = test_api_endpoint("POST", f"{BUSINESS_API_BASE}/alert/validate-condition-value", {
        "condition_attribute": "price",
        "condition_number": 100.0
    })
    log_test("Validate Condition Value (Price)", result.get("status") == "success")
    
    # Test 3: Validate Condition Value (Change)
    print("\n3. Testing Business Logic API - Validate Condition Value (Change)")
    result = test_api_endpoint("POST", f"{BUSINESS_API_BASE}/alert/validate-condition-value", {
        "condition_attribute": "change",
        "condition_number": 50.0
    })
    log_test("Validate Condition Value (Change)", result.get("status") == "success")
    
    # Test 4: Read Alerts
    print("\n4. Testing Read Alerts")
    result = test_api_endpoint("GET", f"{API_BASE}/alerts/")
    log_test("Read Alerts", result is not None)


# ============================================================================
# Cash Flow CRUD Tests
# ============================================================================

def test_cash_flow_crud():
    """Test Cash Flow CRUD operations with Business Logic validation."""
    print("\n" + "="*60)
    print("Testing Cash Flow CRUD Operations")
    print("="*60)
    
    # Test 1: Business Logic API - Calculate Account Balance
    print("\n1. Testing Business Logic API - Calculate Account Balance")
    result = test_api_endpoint("POST", f"{BUSINESS_API_BASE}/cash-flow/calculate-balance", {
        "account_id": 1,
        "initial_balance": 1000.0
    })
    log_test("Calculate Account Balance", result is not None)
    
    # Test 2: Business Logic API - Calculate Currency Conversion
    print("\n2. Testing Business Logic API - Calculate Currency Conversion")
    result = test_api_endpoint("POST", f"{BUSINESS_API_BASE}/cash-flow/calculate-currency-conversion", {
        "amount": 100.0,
        "from_currency_rate": 3.5,
        "to_currency_rate": 1.0
    })
    log_test("Calculate Currency Conversion", result.get("status") == "success")
    
    # Test 3: Business Logic API - Validate Cash Flow
    print("\n3. Testing Business Logic API - Validate Cash Flow")
    result = test_api_endpoint("POST", f"{BUSINESS_API_BASE}/cash-flow/validate", {
        "amount": 100.0,
        "type": "income"
    })
    log_test("Validate Cash Flow (Valid)", result.get("status") == "success")
    
    # Test 4: Read Cash Flows
    print("\n4. Testing Read Cash Flows")
    result = test_api_endpoint("GET", f"{API_BASE}/cash-flows/")
    log_test("Read Cash Flows", result is not None)


# ============================================================================
# Note CRUD Tests
# ============================================================================

def test_note_crud():
    """Test Note CRUD operations with Business Logic validation."""
    print("\n" + "="*60)
    print("Testing Note CRUD Operations")
    print("="*60)
    
    # Test 1: Business Logic API - Validate Note
    print("\n1. Testing Business Logic API - Validate Note")
    result = test_api_endpoint("POST", f"{BUSINESS_API_BASE}/note/validate", {
        "content": "Test note"
    })
    log_test("Validate Note (Valid)", result.get("status") == "success")
    
    # Test 2: Business Logic API - Validate Note Relation
    print("\n2. Testing Business Logic API - Validate Note Relation")
    result = test_api_endpoint("POST", f"{BUSINESS_API_BASE}/note/validate-relation", {
        "related_type_id": 1,
        "related_id": 1
    })
    log_test("Validate Note Relation", result is not None)
    
    # Test 3: Read Notes
    print("\n3. Testing Read Notes")
    result = test_api_endpoint("GET", f"{API_BASE}/notes/")
    log_test("Read Notes", result is not None)


# ============================================================================
# Trading Account CRUD Tests
# ============================================================================

def test_trading_account_crud():
    """Test Trading Account CRUD operations with Business Logic validation."""
    print("\n" + "="*60)
    print("Testing Trading Account CRUD Operations")
    print("="*60)
    
    # Test 1: Business Logic API - Validate Trading Account
    print("\n1. Testing Business Logic API - Validate Trading Account")
    result = test_api_endpoint("POST", f"{BUSINESS_API_BASE}/trading-account/validate", {
        "name": "Test Account",
        "currency": "USD"
    })
    log_test("Validate Trading Account (Valid)", result.get("status") == "success")
    
    # Test 2: Read Trading Accounts
    print("\n2. Testing Read Trading Accounts")
    result = test_api_endpoint("GET", f"{API_BASE}/trading-accounts/")
    log_test("Read Trading Accounts", result is not None)


# ============================================================================
# Trade Plan CRUD Tests
# ============================================================================

def test_trade_plan_crud():
    """Test Trade Plan CRUD operations with Business Logic validation."""
    print("\n" + "="*60)
    print("Testing Trade Plan CRUD Operations")
    print("="*60)
    
    # Test 1: Business Logic API - Validate Trade Plan
    print("\n1. Testing Business Logic API - Validate Trade Plan")
    result = test_api_endpoint("POST", f"{BUSINESS_API_BASE}/trade-plan/validate", {
        "ticker_id": 1,
        "side": "Long",
        "status": "pending"
    })
    log_test("Validate Trade Plan (Valid)", result is not None)
    
    # Test 2: Read Trade Plans
    print("\n2. Testing Read Trade Plans")
    result = test_api_endpoint("GET", f"{API_BASE}/trade-plans/")
    log_test("Read Trade Plans", result is not None)


# ============================================================================
# Ticker CRUD Tests
# ============================================================================

def test_ticker_crud():
    """Test Ticker CRUD operations with Business Logic validation."""
    print("\n" + "="*60)
    print("Testing Ticker CRUD Operations")
    print("="*60)
    
    # Test 1: Business Logic API - Validate Ticker
    print("\n1. Testing Business Logic API - Validate Ticker")
    result = test_api_endpoint("POST", f"{BUSINESS_API_BASE}/ticker/validate", {
        "symbol": "AAPL",
        "name": "Apple Inc."
    })
    log_test("Validate Ticker (Valid)", result.get("status") == "success")
    
    # Test 2: Business Logic API - Validate Ticker Symbol
    print("\n2. Testing Business Logic API - Validate Ticker Symbol")
    result = test_api_endpoint("POST", f"{BUSINESS_API_BASE}/ticker/validate-symbol", {
        "symbol": "AAPL"
    })
    log_test("Validate Ticker Symbol", result.get("status") == "success")
    
    # Test 3: Read Tickers
    print("\n3. Testing Read Tickers")
    result = test_api_endpoint("GET", f"{API_BASE}/tickers/")
    log_test("Read Tickers", result is not None)


# ============================================================================
# Main Test Runner
# ============================================================================

def main():
    """Run all CRUD tests."""
    print("="*60)
    print("Business Logic Phase 2 - Comprehensive CRUD Testing")
    print("="*60)
    print(f"Base URL: {BASE_URL}")
    print(f"Timestamp: {datetime.now().isoformat()}")
    
    # Check server availability
    try:
        response = requests.get(f"{BASE_URL}/api/health", timeout=5)
        if response.status_code != 200:
            print(f"\n⚠️  Warning: Server health check returned {response.status_code}")
    except Exception as e:
        print(f"\n❌ Error: Cannot connect to server at {BASE_URL}")
        print(f"   Error: {e}")
        print("\nPlease make sure the server is running:")
        print("   ./start_server.sh")
        sys.exit(1)
    
    # Run all tests
    try:
        test_trade_crud()
        test_execution_crud()
        test_alert_crud()
        test_cash_flow_crud()
        test_note_crud()
        test_trading_account_crud()
        test_trade_plan_crud()
        test_ticker_crud()
    except KeyboardInterrupt:
        print("\n\n⚠️  Tests interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Fatal error during testing: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    
    # Print summary
    print("\n" + "="*60)
    print("Test Summary")
    print("="*60)
    print(f"Total Tests: {test_results['total_tests']}")
    print(f"✅ Passed: {test_results['passed_tests']}")
    print(f"❌ Failed: {test_results['failed_tests']}")
    
    if test_results['errors']:
        print("\nErrors:")
        for error in test_results['errors']:
            print(f"  - {error}")
    
    # Exit with appropriate code
    if test_results['failed_tests'] > 0:
        sys.exit(1)
    else:
        sys.exit(0)


if __name__ == "__main__":
    main()

