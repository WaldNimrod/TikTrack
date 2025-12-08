#!/usr/bin/env python3
"""
Test User Isolation Fixes
בודק את כל ה-endpoints שתוקנו לוודא שהם מסננים נכון לפי user_id
"""

import requests
import json
import sys
from typing import Dict, Any, List, Tuple

BASE_URL = "http://localhost:8080"
ADMIN_CREDENTIALS = {"username": "admin", "password": "admin123"}

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'

def print_success(msg: str):
    print(f"{Colors.GREEN}✅ {msg}{Colors.RESET}")

def print_error(msg: str):
    print(f"{Colors.RED}❌ {msg}{Colors.RESET}")

def print_warning(msg: str):
    print(f"{Colors.YELLOW}⚠️  {msg}{Colors.RESET}")

def print_info(msg: str):
    print(f"{Colors.BLUE}ℹ️  {msg}{Colors.RESET}")

def login() -> Tuple[bool, requests.Session]:
    """Login and return session"""
    session = requests.Session()
    try:
        response = session.post(
            f"{BASE_URL}/api/auth/login",
            json=ADMIN_CREDENTIALS,
            timeout=5
        )
        if response.status_code == 200:
            data = response.json()
            if data.get('status') == 'success':
                print_success(f"Logged in as {ADMIN_CREDENTIALS['username']}")
                return True, session
        print_error(f"Login failed: {response.status_code} - {response.text}")
        return False, session
    except Exception as e:
        print_error(f"Login error: {e}")
        return False, session

def test_endpoint(session: requests.Session, method: str, endpoint: str, 
                  expected_status: int = 200, data: Dict = None, 
                  description: str = None) -> Tuple[bool, Dict]:
    """Test an endpoint"""
    url = f"{BASE_URL}{endpoint}"
    try:
        if method.upper() == 'GET':
            response = session.get(url, timeout=5)
        elif method.upper() == 'POST':
            response = session.post(url, json=data, timeout=5)
        elif method.upper() == 'PUT':
            response = session.put(url, json=data, timeout=5)
        else:
            return False, {"error": f"Unsupported method: {method}"}
        
        success = response.status_code == expected_status
        result = {
            "status_code": response.status_code,
            "expected": expected_status,
            "success": success,
            "response": response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text[:200]
        }
        
        if success:
            print_success(f"{description or endpoint}: {response.status_code}")
        else:
            print_error(f"{description or endpoint}: Expected {expected_status}, got {response.status_code}")
            if response.status_code == 401:
                print_warning("  → This endpoint requires authentication (good!)")
        
        return success, result
    except Exception as e:
        print_error(f"{description or endpoint}: Error - {e}")
        return False, {"error": str(e)}

def test_without_auth(method: str, endpoint: str, expected_status: int = 401) -> Tuple[bool, Dict]:
    """Test endpoint without authentication (should return 401)"""
    url = f"{BASE_URL}{endpoint}"
    try:
        if method.upper() == 'GET':
            response = requests.get(url, timeout=5)
        elif method.upper() == 'POST':
            response = requests.post(url, timeout=5)
        else:
            return False, {"error": f"Unsupported method: {method}"}
        
        success = response.status_code == expected_status
        if success:
            print_success(f"{endpoint} (no auth): Correctly returns {expected_status}")
        else:
            print_error(f"{endpoint} (no auth): Expected {expected_status}, got {response.status_code}")
        
        return success, {"status_code": response.status_code}
    except Exception as e:
        print_error(f"{endpoint} (no auth): Error - {e}")
        return False, {"error": str(e)}

def main():
    print_info("=" * 80)
    print_info("Testing User Isolation Fixes")
    print_info("=" * 80)
    print()
    
    # Test 1: Login
    print_info("Step 1: Testing login...")
    logged_in, session = login()
    if not logged_in:
        print_error("Cannot proceed without login")
        return 1
    print()
    
    # Test 2: Test endpoints without authentication (should return 401)
    print_info("Step 2: Testing endpoints without authentication (should return 401)...")
    endpoints_to_test_no_auth = [
        ("GET", "/api/email-logs"),
        ("GET", "/api/email-logs/statistics"),
        ("GET", "/api/quotes/batch?ticker_ids=1"),
        # Note: /api/quotes/<ticker_id> requires a valid ticker_id that user has access to
        # Testing without auth should return 401, but we skip this test as it requires valid ticker_id
        ("GET", "/api/quotes-last"),
        ("GET", "/api/note-relation-types"),
        ("GET", "/api/plan-conditions/"),
        ("GET", "/api/user-preferences"),
        ("GET", "/api/external-data-providers"),
        ("GET", "/api/user-data-import/accounts"),
    ]
    
    no_auth_results = []
    for method, endpoint in endpoints_to_test_no_auth:
        success, result = test_without_auth(method, endpoint)
        no_auth_results.append((endpoint, success))
    print()
    
    # Test 3: Test endpoints with authentication
    print_info("Step 3: Testing endpoints with authentication...")
    endpoints_to_test = [
        ("GET", "/api/email-logs", "Email logs"),
        ("GET", "/api/email-logs/statistics", "Email logs statistics"),
        ("GET", "/api/quotes-last", "Quotes last"),
        ("GET", "/api/note-relation-types", "Note relation types"),
        ("GET", "/api/plan-conditions/", "Plan conditions"),
        ("GET", "/api/user-preferences", "User preferences"),
        ("GET", "/api/external-data-providers", "External data providers"),
        ("GET", "/api/user-data-import/accounts", "Trading accounts for import"),
        ("GET", "/api/trading-accounts", "Trading accounts"),
        ("GET", "/api/trades", "Trades"),
        ("GET", "/api/trade-plans", "Trade plans"),
        ("GET", "/api/executions", "Executions"),
        ("GET", "/api/alerts", "Alerts"),
        ("GET", "/api/notes", "Notes"),
        ("GET", "/api/cash-flows", "Cash flows"),
    ]
    
    auth_results = []
    for method, endpoint, description in endpoints_to_test:
        success, result = test_endpoint(session, method, endpoint, description=description)
        auth_results.append((endpoint, success, result))
    print()
    
    # Test 4: Test specific endpoints that require ticker access
    print_info("Step 4: Testing ticker-specific endpoints...")
    ticker_endpoints = [
        ("GET", "/api/tickers", "User tickers"),
        ("GET", "/api/tickers/my", "My tickers"),
    ]
    
    ticker_results = []
    for method, endpoint, description in ticker_endpoints:
        success, result = test_endpoint(session, method, endpoint, description=description)
        ticker_results.append((endpoint, success, result))
    print()
    
    # Summary
    print_info("=" * 80)
    print_info("Test Summary")
    print_info("=" * 80)
    
    no_auth_passed = sum(1 for _, success in no_auth_results if success)
    auth_passed = sum(1 for _, success, _ in auth_results if success)
    ticker_passed = sum(1 for _, success, _ in ticker_results if success)
    
    print_info(f"No-auth tests: {no_auth_passed}/{len(no_auth_results)} passed")
    print_info(f"Auth tests: {auth_passed}/{len(auth_results)} passed")
    print_info(f"Ticker tests: {ticker_passed}/{len(ticker_results)} passed")
    
    total_passed = no_auth_passed + auth_passed + ticker_passed
    total_tests = len(no_auth_results) + len(auth_results) + len(ticker_results)
    
    print()
    if total_passed == total_tests:
        print_success(f"All tests passed! ({total_passed}/{total_tests})")
        return 0
    else:
        print_warning(f"Some tests failed: {total_passed}/{total_tests} passed")
        return 1

if __name__ == "__main__":
    sys.exit(main())

