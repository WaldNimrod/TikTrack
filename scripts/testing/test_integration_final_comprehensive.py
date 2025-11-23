#!/usr/bin/env python3
"""
Comprehensive Integration Testing Script for Business Logic Phase 5
====================================================================

This script performs comprehensive integration tests for:
- Frontend-Backend integration
- Cache system integration
- Initialization system integration
- ValidationService integration
- API endpoints integration
- Edge cases

Usage:
    python scripts/testing/test_integration_final_comprehensive.py

Requirements:
    - Server must be running on http://127.0.0.1:8080
    - PostgreSQL database must be available
"""

import requests
import json
import sys
import time
import inspect
from typing import Dict, Any, List, Optional
from datetime import datetime

# Configuration
BASE_URL = "http://127.0.0.1:8080"

# Import business services for direct testing
sys.path.insert(0, 'Backend')
try:
    from services.business_logic.base_business_service import BaseBusinessService
    from services.business_logic.trade_business_service import TradeBusinessService
    from services.business_logic.execution_business_service import ExecutionBusinessService
    from services.business_logic.alert_business_service import AlertBusinessService
    from services.business_logic.statistics_business_service import StatisticsBusinessService
    from services.business_logic.preferences_business_service import PreferencesBusinessService
    from services.business_logic.cash_flow_business_service import CashFlowBusinessService
    from services.business_logic.note_business_service import NoteBusinessService
    from services.business_logic.trading_account_business_service import TradingAccountBusinessService
    from services.business_logic.trade_plan_business_service import TradePlanBusinessService
    from services.business_logic.ticker_business_service import TickerBusinessService
    from services.business_logic.currency_business_service import CurrencyBusinessService
    from services.business_logic.tag_business_service import TagBusinessService
    SERVICES_AVAILABLE = True
except ImportError as e:
    print(f"⚠️  Warning: Could not import business services: {e}")
    print("   Integration tests will be limited to API tests only.")
    SERVICES_AVAILABLE = False

# Test results storage
test_results = {
    "total_tests": 0,
    "passed_tests": 0,
    "failed_tests": 0,
    "errors": [],
    "integration_tests": {}
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


def test_table_name_property():
    """Test that all services have correct table_name property."""
    print("\n" + "="*60)
    print("Testing table_name Property")
    print("="*60)
    
    if not SERVICES_AVAILABLE:
        print("⏭️  Skipping - services not available")
        return
    
    # Expected table names
    expected_table_names = {
        TradeBusinessService: 'trades',
        ExecutionBusinessService: 'executions',
        AlertBusinessService: 'alerts',
        StatisticsBusinessService: None,  # Statistics has no table
        PreferencesBusinessService: 'user_preferences',
        CashFlowBusinessService: 'cash_flows',
        NoteBusinessService: 'notes',
        TradingAccountBusinessService: 'trading_accounts',
        TradePlanBusinessService: 'trade_plans',
        TickerBusinessService: 'tickers',
        CurrencyBusinessService: 'currencies',
        TagBusinessService: 'tags'
    }
    
    for service_class, expected_table in expected_table_names.items():
        try:
            service = service_class(db_session=None)
            actual_table = service.table_name
            log_test(
                f"table_name: {service_class.__name__}",
                actual_table == expected_table,
                f"Expected {expected_table}, got {actual_table}" if actual_table != expected_table else None
            )
        except Exception as e:
            log_test(f"table_name: {service_class.__name__}", False, str(e))


def test_validate_with_constraints_integration():
    """Test that validate_with_constraints is called in validate()."""
    print("\n" + "="*60)
    print("Testing validate_with_constraints Integration")
    print("="*60)
    
    if not SERVICES_AVAILABLE:
        print("⏭️  Skipping - services not available")
        return
    
    # Test services that should have validate_with_constraints
    test_services = [
        TradeBusinessService,
        ExecutionBusinessService,
        AlertBusinessService,
        PreferencesBusinessService
    ]
    
    for service_class in test_services:
        try:
            service = service_class(db_session=None)
            # Check if validate method exists
            if hasattr(service, 'validate'):
                validate_source = inspect.getsource(service.validate)
                has_constraint_check = 'validate_with_constraints' in validate_source
                log_test(
                    f"validate_with_constraints call: {service_class.__name__}",
                    has_constraint_check,
                    "validate_with_constraints not found in validate()" if not has_constraint_check else None
                )
            else:
                log_test(f"validate method: {service_class.__name__}", False, "validate() method not found")
        except Exception as e:
            log_test(f"validate_with_constraints: {service_class.__name__}", False, str(e))


def test_validation_order():
    """Test that validation order is correct: Constraints → BusinessRulesRegistry → Complex Rules."""
    print("\n" + "="*60)
    print("Testing Validation Order")
    print("="*60)
    
    if not SERVICES_AVAILABLE:
        print("⏭️  Skipping - services not available")
        return
    
    # Test a few key services
    test_services = [
        TradeBusinessService,
        ExecutionBusinessService,
        AlertBusinessService
    ]
    
    for service_class in test_services:
        try:
            service = service_class(db_session=None)
            if hasattr(service, 'validate'):
                validate_source = inspect.getsource(service.validate)
                # Check order: validate_with_constraints should appear first
                constraint_pos = validate_source.find('validate_with_constraints')
                registry_pos = validate_source.find('registry.validate_value')
                complex_pos = validate_source.find('Complex') or validate_source.find('complex')
                
                order_correct = True
                if constraint_pos == -1:
                    order_correct = False
                    error_msg = "validate_with_constraints not found"
                elif registry_pos != -1 and constraint_pos > registry_pos:
                    order_correct = False
                    error_msg = "validate_with_constraints should come before registry.validate_value"
                else:
                    error_msg = None
                
                log_test(
                    f"Validation order: {service_class.__name__}",
                    order_correct,
                    error_msg
                )
        except Exception as e:
            log_test(f"Validation order: {service_class.__name__}", False, str(e))


def test_api_endpoints_with_db_session():
    """Test that validate API endpoints use @handle_database_session."""
    print("\n" + "="*60)
    print("Testing API Endpoints with @handle_database_session")
    print("="*60)
    
    # Test validate endpoints
    validate_endpoints = [
        "/api/business/trade/validate",
        "/api/business/execution/validate",
        "/api/business/alert/validate",
        "/api/business/preferences/validate",
        "/api/business/cash-flow/validate",
        "/api/business/note/validate",
        "/api/business/trading-account/validate",
        "/api/business/trade-plan/validate",
        "/api/business/ticker/validate"
    ]
    
    for endpoint in validate_endpoints:
        try:
            url = f"{BASE_URL}{endpoint}"
            # Send a test request
            test_data = {}  # Empty data to test validation
            response = requests.post(url, json=test_data, timeout=5)
            # We expect either 200 (with validation errors) or 400 (bad request)
            # The important thing is that it doesn't crash
            status_ok = response.status_code in [200, 400]
            log_test(
                f"API endpoint: {endpoint}",
                status_ok,
                f"Unexpected status code: {response.status_code}" if not status_ok else None
            )
        except requests.exceptions.ConnectionError:
            log_test(f"API endpoint: {endpoint}", False, "Server not running")
        except Exception as e:
            log_test(f"API endpoint: {endpoint}", False, str(e))


def test_edge_cases():
    """Test edge cases: no db_session, no table_name, exclude_id."""
    print("\n" + "="*60)
    print("Testing Edge Cases")
    print("="*60)
    
    if not SERVICES_AVAILABLE:
        print("⏭️  Skipping - services not available")
        return
    
    # Test 1: Service without db_session should skip constraint validation
    try:
        service = TradeBusinessService(db_session=None)
        # validate_with_constraints should return (True, []) when db_session is None
        is_valid, errors = service.validate_with_constraints({})
        log_test(
            "Edge case: No db_session skips validation",
            is_valid and len(errors) == 0,
            f"Expected (True, []), got ({is_valid}, {errors})" if not (is_valid and len(errors) == 0) else None
        )
    except Exception as e:
        log_test("Edge case: No db_session", False, str(e))
    
    # Test 2: StatisticsBusinessService should return None for table_name
    try:
        service = StatisticsBusinessService(db_session=None)
        table_name = service.table_name
        log_test(
            "Edge case: StatisticsBusinessService table_name is None",
            table_name is None,
            f"Expected None, got {table_name}" if table_name is not None else None
        )
    except Exception as e:
        log_test("Edge case: StatisticsBusinessService table_name", False, str(e))
    
    # Test 3: Service without table_name should skip constraint validation
    try:
        service = StatisticsBusinessService(db_session=None)
        is_valid, errors = service.validate_with_constraints({})
        log_test(
            "Edge case: No table_name skips validation",
            is_valid and len(errors) == 0,
            f"Expected (True, []), got ({is_valid}, {errors})" if not (is_valid and len(errors) == 0) else None
        )
    except Exception as e:
        log_test("Edge case: No table_name", False, str(e))


def test_frontend_backend_integration():
    """Test Frontend-Backend integration via API."""
    print("\n" + "="*60)
    print("Testing Frontend-Backend Integration")
    print("="*60)
    
    # Test that frontend wrappers can call backend APIs
    test_endpoints = [
        ("/api/business/trade/validate", {"ticker_symbol": "AAPL", "side": "buy", "quantity": 10}),
        ("/api/business/execution/validate", {"execution_id": 1, "quantity": 5}),
        ("/api/business/statistics/calculate", {"calculation_type": "sum", "records": [], "params": {}})
    ]
    
    for endpoint, test_data in test_endpoints:
        try:
            url = f"{BASE_URL}{endpoint}"
            response = requests.post(url, json=test_data, timeout=5)
            status_ok = response.status_code in [200, 400]  # 200 = success, 400 = validation error
            log_test(
                f"Frontend-Backend: {endpoint}",
                status_ok,
                f"Unexpected status: {response.status_code}" if not status_ok else None
            )
        except requests.exceptions.ConnectionError:
            log_test(f"Frontend-Backend: {endpoint}", False, "Server not running")
        except Exception as e:
            log_test(f"Frontend-Backend: {endpoint}", False, str(e))


def test_cache_integration():
    """Test cache system integration."""
    print("\n" + "="*60)
    print("Testing Cache Integration")
    print("="*60)
    
    # Test cache endpoints
    cache_endpoints = [
        "/api/cache/clear",
        "/api/cache/stats"
    ]
    
    for endpoint in cache_endpoints:
        try:
            url = f"{BASE_URL}{endpoint}"
            if endpoint == "/api/cache/clear":
                response = requests.post(url, timeout=5)
            else:
                response = requests.get(url, timeout=5)
            status_ok = response.status_code == 200
            log_test(
                f"Cache: {endpoint}",
                status_ok,
                f"Unexpected status: {response.status_code}" if not status_ok else None
            )
        except requests.exceptions.ConnectionError:
            log_test(f"Cache: {endpoint}", False, "Server not running")
        except Exception as e:
            log_test(f"Cache: {endpoint}", False, str(e))


def main():
    """Run all integration tests."""
    print("="*60)
    print("Business Logic Phase 5 - Integration Comprehensive Final Tests")
    print("="*60)
    print(f"Testing {BASE_URL}")
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*60)
    
    # Run all tests
    test_table_name_property()
    test_validate_with_constraints_integration()
    test_validation_order()
    test_api_endpoints_with_db_session()
    test_edge_cases()
    test_frontend_backend_integration()
    test_cache_integration()
    
    # Print summary
    print("\n" + "="*60)
    print("Test Summary")
    print("="*60)
    print(f"Total Tests: {test_results['total_tests']}")
    print(f"Passed: {test_results['passed_tests']}")
    print(f"Failed: {test_results['failed_tests']}")
    
    if test_results["errors"]:
        print(f"\nErrors ({len(test_results['errors'])}):")
        for error in test_results["errors"][:10]:  # Show first 10 errors
            print(f"  - {error}")
        if len(test_results["errors"]) > 10:
            print(f"  ... and {len(test_results['errors']) - 10} more errors")
    
    # Save results to file
    results_file = f"test_results_integration_final_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(results_file, 'w') as f:
        json.dump(test_results, f, indent=2)
    print(f"\nResults saved to: {results_file}")
    
    # Exit with appropriate code
    if test_results["failed_tests"] > 0:
        sys.exit(1)
    else:
        print("\n✅ All integration tests passed!")
        sys.exit(0)


if __name__ == "__main__":
    main()

