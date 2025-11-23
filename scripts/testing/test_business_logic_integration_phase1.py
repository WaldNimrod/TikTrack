#!/usr/bin/env python3
"""
Business Logic Integration Testing - Phase 1
============================================

Comprehensive testing of Business Logic API endpoints and Frontend wrappers.

Usage:
    python scripts/testing/test_business_logic_integration_phase1.py

Requirements:
    - Server must be running on http://127.0.0.1:8080
    - PostgreSQL database must be available
"""

import requests
import json
import sys
import time
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
    "errors": [],
    "response_times": []
}


def log_test(test_name: str, passed: bool, error: Optional[str] = None, response_time: Optional[float] = None):
    """Log test result."""
    test_results["total_tests"] += 1
    if passed:
        test_results["passed_tests"] += 1
        status = "✅"
        if response_time:
            test_results["response_times"].append(response_time)
            if response_time > 0.2:
                status = "⚠️"
                print(f"{status} {test_name} (Response time: {response_time*1000:.0f}ms - SLOW)")
            else:
                print(f"{status} {test_name} (Response time: {response_time*1000:.0f}ms)")
        else:
            print(f"{status} {test_name}")
    else:
        test_results["failed_tests"] += 1
        test_results["errors"].append(f"{test_name}: {error}")
        print(f"❌ {test_name}: {error}")


def test_api_endpoint(method: str, url: str, data: Optional[Dict] = None, expected_status: int = 200, 
                     expected_data: Optional[Dict] = None) -> Optional[Dict]:
    """Test API endpoint and return response data with timing."""
    try:
        start_time = time.time()
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
        
        response_time = time.time() - start_time
        
        if response.status_code == expected_status:
            try:
                result = response.json()
                if expected_data:
                    for key, value in expected_data.items():
                        if key not in result.get("data", {}):
                            return {"status": "error", "error": f"Missing expected key: {key}", "response_time": response_time}
                        if result["data"][key] != value:
                            return {"status": "error", "error": f"Expected {key}={value}, got {result['data'][key]}", "response_time": response_time}
                result["response_time"] = response_time
                return result
            except:
                return {"status": "success", "data": response.text, "response_time": response_time}
        else:
            return {"status": "error", "error": f"Expected {expected_status}, got {response.status_code}", "response_time": response_time}
    except Exception as e:
        return {"status": "error", "error": str(e), "response_time": None}


# ============================================================================
# Phase 1.1: Server Health Check
# ============================================================================

def test_server_health():
    """Test server health and Business Logic API availability."""
    print("\n" + "="*60)
    print("Phase 1.1: Server Health Check")
    print("="*60)
    
    # Test 1: Server health
    print("\n1. Testing Server Health")
    try:
        response = requests.get(f"{BASE_URL}/api/health", timeout=5)
        log_test("Server Health Check", response.status_code == 200, 
                None if response.status_code == 200 else f"Status: {response.status_code}")
    except Exception as e:
        log_test("Server Health Check", False, str(e))
        return False
    
    # Test 2: Business Logic API availability
    print("\n2. Testing Business Logic API Availability")
    result = test_api_endpoint("POST", f"{BUSINESS_API_BASE}/trade/calculate-stop-price", {
        "current_price": 100.0,
        "stop_percentage": 10.0,
        "side": "Long"
    })
    log_test("Business Logic API Available", result.get("status") == "success", 
            result.get("error"), result.get("response_time"))
    
    return True


# ============================================================================
# Phase 1.2: Trade Business Service API Endpoints
# ============================================================================

def test_trade_business_service():
    """Test all Trade Business Service API endpoints."""
    print("\n" + "="*60)
    print("Phase 1.2: Trade Business Service API Endpoints")
    print("="*60)
    
    # Test 1: Calculate Stop Price (Long)
    print("\n1. Testing Calculate Stop Price (Long)")
    result = test_api_endpoint("POST", f"{BUSINESS_API_BASE}/trade/calculate-stop-price", {
        "current_price": 100.0,
        "stop_percentage": 10.0,
        "side": "Long"
    }, expected_data={"stop_price": 90.0})
    log_test("Calculate Stop Price (Long)", result.get("status") == "success" and 
            result.get("data", {}).get("stop_price") == 90.0, result.get("error"), result.get("response_time"))
    
    # Test 2: Calculate Stop Price (Short)
    print("\n2. Testing Calculate Stop Price (Short)")
    result = test_api_endpoint("POST", f"{BUSINESS_API_BASE}/trade/calculate-stop-price", {
        "current_price": 100.0,
        "stop_percentage": 10.0,
        "side": "Short"
    }, expected_data={"stop_price": 110.0})
    log_test("Calculate Stop Price (Short)", result.get("status") == "success" and 
            result.get("data", {}).get("stop_price") == 110.0, result.get("error"), result.get("response_time"))
    
    # Test 3: Calculate Stop Price (Invalid)
    print("\n3. Testing Calculate Stop Price (Invalid Price)")
    result = test_api_endpoint("POST", f"{BUSINESS_API_BASE}/trade/calculate-stop-price", {
        "current_price": -10.0,
        "stop_percentage": 10.0,
        "side": "Long"
    }, expected_status=400)
    log_test("Calculate Stop Price (Invalid)", result.get("status") == "error", 
            None if result.get("status") == "error" else "Should have failed", result.get("response_time"))
    
    # Test 4: Calculate Target Price (Long)
    print("\n4. Testing Calculate Target Price (Long)")
    result = test_api_endpoint("POST", f"{BUSINESS_API_BASE}/trade/calculate-target-price", {
        "current_price": 100.0,
        "target_percentage": 20.0,
        "side": "Long"
    }, expected_data={"target_price": 120.0})
    log_test("Calculate Target Price (Long)", result.get("status") == "success" and 
            result.get("data", {}).get("target_price") == 120.0, result.get("error"), result.get("response_time"))
    
    # Test 5: Calculate Target Price (Short)
    print("\n5. Testing Calculate Target Price (Short)")
    result = test_api_endpoint("POST", f"{BUSINESS_API_BASE}/trade/calculate-target-price", {
        "current_price": 100.0,
        "target_percentage": 20.0,
        "side": "Short"
    })
    log_test("Calculate Target Price (Short)", result.get("status") == "success", 
            result.get("error"), result.get("response_time"))
    
    # Test 6: Calculate Percentage From Price
    print("\n6. Testing Calculate Percentage From Price")
    result = test_api_endpoint("POST", f"{BUSINESS_API_BASE}/trade/calculate-percentage-from-price", {
        "current_price": 100.0,
        "target_price": 110.0,
        "side": "Long"
    })
    log_test("Calculate Percentage From Price", result.get("status") == "success", 
            result.get("error"), result.get("response_time"))
    
    # Test 7: Calculate Investment
    print("\n7. Testing Calculate Investment")
    result = test_api_endpoint("POST", f"{BUSINESS_API_BASE}/trade/calculate-investment", {
        "price": 100.0,
        "quantity": 10.0
    })
    log_test("Calculate Investment", result.get("status") == "success", 
            result.get("error"), result.get("response_time"))
    
    # Test 8: Calculate P/L
    print("\n8. Testing Calculate P/L")
    result = test_api_endpoint("POST", f"{BUSINESS_API_BASE}/trade/calculate-pl", {
        "entry_price": 100.0,
        "exit_price": 110.0,
        "quantity": 10.0,
        "side": "Long"
    })
    log_test("Calculate P/L", result.get("status") == "success", 
            result.get("error"), result.get("response_time"))
    
    # Test 9: Calculate Risk/Reward
    print("\n9. Testing Calculate Risk/Reward")
    result = test_api_endpoint("POST", f"{BUSINESS_API_BASE}/trade/calculate-risk-reward", {
        "entry_price": 100.0,
        "stop_price": 90.0,
        "target_price": 120.0,
        "quantity": 10.0,
        "side": "Long"
    })
    log_test("Calculate Risk/Reward", result.get("status") == "success", 
            result.get("error"), result.get("response_time"))
    
    # Test 10: Validate Trade (Valid)
    print("\n10. Testing Validate Trade (Valid)")
    result = test_api_endpoint("POST", f"{BUSINESS_API_BASE}/trade/validate", {
        "price": 100.0,
        "quantity": 10.0,
        "side": "Long",
        "investment_type": "Investment",
        "status": "open"
    })
    log_test("Validate Trade (Valid)", result.get("status") == "success", 
            result.get("error"), result.get("response_time"))
    
    # Test 11: Validate Trade (Invalid)
    print("\n11. Testing Validate Trade (Invalid)")
    result = test_api_endpoint("POST", f"{BUSINESS_API_BASE}/trade/validate", {
        "price": 100.0
        # Missing required fields
    }, expected_status=400)
    log_test("Validate Trade (Invalid)", result.get("status") == "error", 
            None if result.get("status") == "error" else "Should have failed", result.get("response_time"))


# ============================================================================
# Phase 1.3: Execution Business Service API Endpoints
# ============================================================================

def test_execution_business_service():
    """Test all Execution Business Service API endpoints."""
    print("\n" + "="*60)
    print("Phase 1.3: Execution Business Service API Endpoints")
    print("="*60)
    
    # Test 1: Calculate Execution Values (Buy)
    print("\n1. Testing Calculate Execution Values (Buy)")
    result = test_api_endpoint("POST", f"{BUSINESS_API_BASE}/execution/calculate-values", {
        "quantity": 10.0,
        "price": 100.0,
        "commission": 1.0,
        "action": "buy"
    })
    log_test("Calculate Execution Values (Buy)", result.get("status") == "success" and 
            result.get("data", {}).get("total") == -1001.0, result.get("error"), result.get("response_time"))
    
    # Test 2: Calculate Execution Values (Sell)
    print("\n2. Testing Calculate Execution Values (Sell)")
    result = test_api_endpoint("POST", f"{BUSINESS_API_BASE}/execution/calculate-values", {
        "quantity": 10.0,
        "price": 100.0,
        "commission": 1.0,
        "action": "sell"
    })
    log_test("Calculate Execution Values (Sell)", result.get("status") == "success" and 
            result.get("data", {}).get("total") == 999.0, result.get("error"), result.get("response_time"))
    
    # Test 3: Calculate Average Price
    print("\n3. Testing Calculate Average Price")
    result = test_api_endpoint("POST", f"{BUSINESS_API_BASE}/execution/calculate-average-price", {
        "executions": [
            {"quantity": 10.0, "price": 100.0},
            {"quantity": 5.0, "price": 110.0}
        ]
    })
    log_test("Calculate Average Price", result.get("status") == "success", 
            result.get("error"), result.get("response_time"))
    
    # Test 4: Validate Execution
    print("\n4. Testing Validate Execution")
    result = test_api_endpoint("POST", f"{BUSINESS_API_BASE}/execution/validate", {
        "quantity": 10.0,
        "price": 100.0,
        "action": "buy"
    })
    log_test("Validate Execution", result.get("status") == "success", 
            result.get("error"), result.get("response_time"))


# ============================================================================
# Phase 1.4: Alert Business Service API Endpoints
# ============================================================================

def test_alert_business_service():
    """Test all Alert Business Service API endpoints."""
    print("\n" + "="*60)
    print("Phase 1.4: Alert Business Service API Endpoints")
    print("="*60)
    
    # Test 1: Validate Alert
    print("\n1. Testing Validate Alert")
    result = test_api_endpoint("POST", f"{BUSINESS_API_BASE}/alert/validate", {
        "condition_attribute": "price",
        "condition_operator": ">",
        "condition_number": 100.0
    })
    log_test("Validate Alert", result.get("status") == "success", 
            result.get("error"), result.get("response_time"))
    
    # Test 2: Validate Condition Value (Price)
    print("\n2. Testing Validate Condition Value (Price)")
    result = test_api_endpoint("POST", f"{BUSINESS_API_BASE}/alert/validate-condition-value", {
        "condition_attribute": "price",
        "condition_number": 100.0
    })
    log_test("Validate Condition Value (Price)", result.get("status") == "success", 
            result.get("error"), result.get("response_time"))
    
    # Test 3: Validate Condition Value (Change)
    print("\n3. Testing Validate Condition Value (Change)")
    result = test_api_endpoint("POST", f"{BUSINESS_API_BASE}/alert/validate-condition-value", {
        "condition_attribute": "change",
        "condition_number": 50.0
    })
    log_test("Validate Condition Value (Change)", result.get("status") == "success", 
            result.get("error"), result.get("response_time"))


# ============================================================================
# Phase 1.5: Statistics & CashFlow Business Services API Endpoints
# ============================================================================

def test_statistics_cashflow_business_service():
    """Test Statistics and CashFlow Business Service API endpoints."""
    print("\n" + "="*60)
    print("Phase 1.5: Statistics & CashFlow Business Service API Endpoints")
    print("="*60)
    
    # Test 1: Statistics - Calculate Sum
    print("\n1. Testing Statistics - Calculate Sum")
    result = test_api_endpoint("POST", f"{BUSINESS_API_BASE}/statistics/calculate-sum", {
        "data": [{"amount": 100.0}, {"amount": 200.0}, {"amount": 300.0}],
        "field": "amount"
    })
    log_test("Statistics - Calculate Sum", result.get("status") == "success", 
            result.get("error"), result.get("response_time"))
    
    # Test 2: Statistics - Calculate Average
    print("\n2. Testing Statistics - Calculate Average")
    result = test_api_endpoint("POST", f"{BUSINESS_API_BASE}/statistics/calculate-average", {
        "data": [{"price": 100.0}, {"price": 200.0}, {"price": 300.0}],
        "field": "price"
    })
    log_test("Statistics - Calculate Average", result.get("status") == "success", 
            result.get("error"), result.get("response_time"))
    
    # Test 3: Statistics - Count Records
    print("\n3. Testing Statistics - Count Records")
    result = test_api_endpoint("POST", f"{BUSINESS_API_BASE}/statistics/count-records", {
        "data": [{"status": "open"}, {"status": "closed"}, {"status": "open"}]
    })
    log_test("Statistics - Count Records", result.get("status") == "success", 
            result.get("error"), result.get("response_time"))
    
    # Test 4: CashFlow - Calculate Account Balance
    print("\n4. Testing CashFlow - Calculate Account Balance")
    result = test_api_endpoint("POST", f"{BUSINESS_API_BASE}/cash-flow/calculate-balance", {
        "account_id": 1,
        "initial_balance": 1000.0
    })
    log_test("CashFlow - Calculate Account Balance", result is not None, 
            result.get("error") if result else "No response", result.get("response_time") if result else None)
    
    # Test 5: CashFlow - Calculate Currency Conversion
    print("\n5. Testing CashFlow - Calculate Currency Conversion")
    result = test_api_endpoint("POST", f"{BUSINESS_API_BASE}/cash-flow/calculate-currency-conversion", {
        "amount": 100.0,
        "from_currency_rate": 3.5,
        "to_currency_rate": 1.0
    })
    log_test("CashFlow - Calculate Currency Conversion", result.get("status") == "success", 
            result.get("error"), result.get("response_time"))
    
    # Test 6: CashFlow - Validate
    print("\n6. Testing CashFlow - Validate")
    result = test_api_endpoint("POST", f"{BUSINESS_API_BASE}/cash-flow/validate", {
        "amount": 100.0,
        "type": "income"
    })
    log_test("CashFlow - Validate", result.get("status") == "success", 
            result.get("error"), result.get("response_time"))


# ============================================================================
# Main Test Runner
# ============================================================================

def main():
    """Run all Phase 1 integration tests."""
    print("="*60)
    print("Business Logic Integration Testing - Phase 1")
    print("="*60)
    print(f"Base URL: {BASE_URL}")
    print(f"Timestamp: {datetime.now().isoformat()}")
    
    # Check server availability
    if not test_server_health():
        print("\n❌ Server health check failed. Please start the server:")
        print("   ./start_server.sh")
        sys.exit(1)
    
    # Run all tests
    try:
        test_trade_business_service()
        test_execution_business_service()
        test_alert_business_service()
        test_statistics_cashflow_business_service()
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
    
    if test_results['response_times']:
        avg_time = sum(test_results['response_times']) / len(test_results['response_times'])
        max_time = max(test_results['response_times'])
        min_time = min(test_results['response_times'])
        print(f"\nResponse Time Statistics:")
        print(f"  Average: {avg_time*1000:.0f}ms")
        print(f"  Min: {min_time*1000:.0f}ms")
        print(f"  Max: {max_time*1000:.0f}ms")
        slow_tests = [t for t in test_results['response_times'] if t > 0.2]
        if slow_tests:
            print(f"  ⚠️  {len(slow_tests)} tests exceeded 200ms threshold")
    
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

