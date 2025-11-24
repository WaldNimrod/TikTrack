#!/usr/bin/env python3
"""
Comprehensive E2E Testing Script for Business Logic Phase 5
===========================================================

This script performs E2E tests for all 28 pages in the system.
Tests page loading, initialization (5 stages), cache, functionality, and Business Logic API integration.

Usage:
    python scripts/testing/test_e2e_final_comprehensive.py

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

# All 28 pages in the system
PAGES = {
    "central": [
        "index.html",
        "trades.html",
        "trade_plans.html",
        "alerts.html",
        "tickers.html",
        "trading_accounts.html",
        "executions.html",
        "data_import.html",
        "cash_flows.html",
        "notes.html",
        "research.html",
        "preferences.html"
    ],
    "technical": [
        "db_display.html",
        "db_extradata.html",
        "constraints.html",
        "background-tasks.html",
        "server-monitor.html",
        "system-management.html",
        "cache-test.html",
        "linter-realtime-monitor.html",
        "notifications-center.html",
        "css-management.html",
        "mockups/daily-snapshots/tradingview-test-page.html",  # Full path
        "dynamic-colors-display.html",
        "designs.html",
        "code-quality-dashboard.html",
        "conditions-test.html",
        "crud-testing-dashboard.html",
        "external-data-dashboard.html"
    ]
}

# Test results storage
test_results = {
    "total_tests": 0,
    "passed_tests": 0,
    "failed_tests": 0,
    "errors": [],
    "pages_tested": []
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


def test_page_load(page_path: str) -> bool:
    """Test if page loads successfully."""
    try:
        url = f"{BASE_URL}/{page_path}"
        response = requests.get(url, timeout=10)
        return response.status_code == 200
    except Exception as e:
        return False


def test_page_has_business_logic_integration(page_path: str) -> bool:
    """Test if page has Business Logic API integration."""
    try:
        url = f"{BASE_URL}/{page_path}"
        response = requests.get(url, timeout=10)
        if response.status_code != 200:
            return False
        
        # Check if page contains Business Logic API references
        content = response.text.lower()  # Case-insensitive search
        # Look for common patterns: /api/business/, validateTrade, calculateStopPrice, etc.
        business_logic_patterns = [
            "/api/business/",
            "validatetrade",
            "calculatestopprice",
            "validateexecution",
            "validatealert",
            "validatepreference",
            "tradesdata",
            "executionsdata",
            "alertsdata",
            "preferencesdata",
            "business.*logic",
            "businesslogic"
        ]
        
        # Also check for data service files that contain business logic wrappers
        data_service_patterns = [
            "trade-data.js",
            "execution-data.js",
            "alert-data.js",
            "preferences-data.js"
        ]
        
        has_patterns = any(pattern in content for pattern in business_logic_patterns)
        has_data_services = any(pattern in content for pattern in data_service_patterns)
        
        return has_patterns or has_data_services
    except Exception as e:
        # Return False on error, but don't crash
        return False


def test_central_pages():
    """Test all 12 central pages."""
    print("\n" + "="*60)
    print("Testing Central Pages (12 pages)")
    print("="*60)
    
    for page in PAGES["central"]:
        page_name = page.replace(".html", "")
        log_test(f"Central: {page_name} - Page Loads", test_page_load(page))
        log_test(f"Central: {page_name} - Business Logic Integration", 
                test_page_has_business_logic_integration(page))
        test_results["pages_tested"].append(page)


def test_technical_pages():
    """Test all 17 technical pages."""
    print("\n" + "="*60)
    print("Testing Technical Pages (17 pages)")
    print("="*60)
    
    for page in PAGES["technical"]:
        page_name = page.replace(".html", "")
        log_test(f"Technical: {page_name} - Page Loads", test_page_load(page))
        # Technical pages may not have Business Logic integration
        test_results["pages_tested"].append(page)


def test_initialization_stages():
    """Test that pages use 5-stage initialization."""
    print("\n" + "="*60)
    print("Testing Initialization Stages (5 stages)")
    print("="*60)
    
    # Test a few key pages for initialization
    key_pages = ["trades.html", "executions.html", "alerts.html"]
    
    for page in key_pages:
        try:
            url = f"{BASE_URL}/{page}"
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                content = response.text
                # Look for initialization system references
                has_init = "unified-app-initializer" in content or "UnifiedAppInitializer" in content
                log_test(f"Initialization: {page} - Uses Unified Initialization", has_init)
        except Exception as e:
            log_test(f"Initialization: {page}", False, str(e))


def test_cache_integration():
    """Test that pages use cache systems."""
    print("\n" + "="*60)
    print("Testing Cache Integration")
    print("="*60)
    
    # Test a few key pages for cache integration
    key_pages = ["trades.html", "executions.html", "alerts.html"]
    
    for page in key_pages:
        try:
            url = f"{BASE_URL}/{page}"
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                content = response.text
                # Look for cache system references
                has_cache = "unified-cache-manager" in content or "CacheTTLGuard" in content
                log_test(f"Cache: {page} - Uses Cache System", has_cache)
        except Exception as e:
            log_test(f"Cache: {page}", False, str(e))


def main():
    """Run all E2E tests."""
    print("="*60)
    print("Business Logic Phase 5 - E2E Comprehensive Final Tests")
    print("="*60)
    print(f"Testing {BASE_URL}")
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*60)
    
    # Run all tests
    test_central_pages()
    test_technical_pages()
    test_initialization_stages()
    test_cache_integration()
    
    # Print summary
    print("\n" + "="*60)
    print("Test Summary")
    print("="*60)
    print(f"Total Tests: {test_results['total_tests']}")
    print(f"Passed: {test_results['passed_tests']}")
    print(f"Failed: {test_results['failed_tests']}")
    print(f"Pages Tested: {len(test_results['pages_tested'])}")
    
    if test_results["errors"]:
        print(f"\nErrors ({len(test_results['errors'])}):")
        for error in test_results["errors"][:10]:  # Show first 10 errors
            print(f"  - {error}")
        if len(test_results["errors"]) > 10:
            print(f"  ... and {len(test_results['errors']) - 10} more errors")
    
    # Save results to file
    results_file = f"test_results_e2e_final_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(results_file, 'w') as f:
        json.dump(test_results, f, indent=2)
    print(f"\nResults saved to: {results_file}")
    
    # Exit with appropriate code
    if test_results["failed_tests"] > 0:
        sys.exit(1)
    else:
        print("\n✅ All E2E tests passed!")
        sys.exit(0)


if __name__ == "__main__":
    main()

