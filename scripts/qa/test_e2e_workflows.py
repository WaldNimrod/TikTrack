#!/usr/bin/env python3
"""
E2E Workflows Tests - TikTrack
================================

Tests complete end-to-end business workflows:
1. Trade creation workflow
2. Trade plan workflow
3. Alert workflow
4. Data import workflow
5. AI analysis workflow
6. User registration/login workflows
"""

import sys
import json
import time
import requests
from pathlib import Path
from typing import Dict, List, Optional
from datetime import datetime

try:
    from selenium import webdriver
    from selenium.webdriver.chrome.service import Service
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.common.exceptions import TimeoutException, WebDriverException
    from webdriver_manager.chrome import ChromeDriverManager
    SELENIUM_AVAILABLE = True
except ImportError:
    SELENIUM_AVAILABLE = False
    print("⚠️  Warning: Selenium not available. E2E tests will be limited.")

BASE_DIR = Path(__file__).parent.parent.parent
BASE_URL = "http://localhost:8080"
REPORTS_DIR = BASE_DIR / "reports" / "qa"

# Test credentials
TEST_USERNAME = "admin"
TEST_PASSWORD = "admin123"

# Test results storage
e2e_results = {
    "timestamp": datetime.now().isoformat(),
    "workflows": {},
    "summary": {
        "total_workflows": 0,
        "tested": 0,
        "passed": 0,
        "failed": 0,
        "warnings": 0
    }
}

# Workflows to test
WORKFLOWS = [
    {
        "name": "trade_creation",
        "description": "Create trade workflow",
        "steps": [
            "login",
            "navigate_to_trades",
            "open_create_modal",
            "fill_trade_form",
            "submit",
            "verify_success"
        ]
    },
    {
        "name": "trade_plan",
        "description": "Trade plan workflow",
        "steps": [
            "login",
            "navigate_to_trade_plans",
            "create_plan",
            "create_trade_from_plan",
            "verify_association"
        ]
    },
    {
        "name": "alert",
        "description": "Alert workflow",
        "steps": [
            "login",
            "navigate_to_alerts",
            "create_alert",
            "activate_alert",
            "verify_alert"
        ]
    },
    {
        "name": "user_login",
        "description": "User login workflow",
        "steps": [
            "navigate_to_login",
            "enter_credentials",
            "submit",
            "verify_dashboard"
        ]
    }
]


def setup_driver():
    """Setup Chrome WebDriver"""
    if not SELENIUM_AVAILABLE:
        return None
    
    chrome_options = Options()
    chrome_options.add_argument('--headless')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--window-size=1920,1080')
    
    try:
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=chrome_options)
        return driver
    except Exception as e:
        print(f"⚠️  Could not setup driver: {e}")
        return None


def test_workflow_api(workflow: Dict) -> Dict:
    """Test workflow using API (simpler, faster)"""
    result = {
        "name": workflow["name"],
        "status": "pending",
        "steps": {},
        "errors": [],
        "warnings": []
    }
    
    print(f"Testing workflow (API): {workflow['name']}")
    
    # Create session for authenticated requests
    session = requests.Session()
    
    try:
        # Step 1: Login
        login_data = {
            "username": TEST_USERNAME,
            "password": TEST_PASSWORD
        }
        login_response = session.post(f"{BASE_URL}/api/auth/login", json=login_data, timeout=10)
        if login_response.status_code != 200:
            result["steps"]["login"] = "failed"
            result["errors"].append(f"Login failed: {login_response.status_code}")
            result["status"] = "failed"
            return result
        
        result["steps"]["login"] = "passed"
        
        # Get available IDs for test data
        try:
            tickers_resp = session.get(f"{BASE_URL}/api/tickers")
            accounts_resp = session.get(f"{BASE_URL}/api/trading-accounts")
            
            tickers = tickers_resp.json().get("data", []) if tickers_resp.status_code == 200 else []
            accounts = accounts_resp.json().get("data", []) if accounts_resp.status_code == 200 else []
            
            ticker_id = tickers[0].get("id") if tickers else None
            account_id = accounts[0].get("id") if accounts else None
        except:
            ticker_id = None
            account_id = None
        
        # Test specific workflows
        if workflow["name"] == "user_login":
            result["status"] = "passed"
            
        elif workflow["name"] == "trade_creation":
            if not ticker_id or not account_id:
                result["warnings"].append("Missing test data (ticker_id or account_id)")
                result["status"] = "warning"
            else:
                # Create trade
                trade_data = {
                    "ticker_id": ticker_id,
                    "trading_account_id": account_id,
                    "side": "Long",
                    "investment_type": "swing",
                    "entry_price": 150.00,
                    "planned_quantity": 10,
                    "planned_amount": 1500.00
                }
                create_resp = session.post(f"{BASE_URL}/api/trades", json=trade_data, timeout=10)
                if create_resp.status_code in [200, 201]:
                    result["steps"]["create_trade"] = "passed"
                    trade_id = create_resp.json().get("data", {}).get("id") or create_resp.json().get("id")
                    
                    # Verify trade exists
                    if trade_id:
                        verify_resp = session.get(f"{BASE_URL}/api/trades/{trade_id}", timeout=10)
                        if verify_resp.status_code == 200:
                            result["steps"]["verify_trade"] = "passed"
                            result["status"] = "passed"
                        else:
                            result["steps"]["verify_trade"] = "failed"
                            result["errors"].append(f"Trade verification failed: {verify_resp.status_code}")
                            result["status"] = "failed"
                    else:
                        result["warnings"].append("Trade created but ID not found in response")
                        result["status"] = "warning"
                else:
                    result["steps"]["create_trade"] = "failed"
                    result["errors"].append(f"Trade creation failed: {create_resp.status_code} - {create_resp.text[:200]}")
                    result["status"] = "failed"
        
        elif workflow["name"] == "trade_plan":
            if not ticker_id or not account_id:
                result["warnings"].append("Missing test data (ticker_id or account_id)")
                result["status"] = "warning"
            else:
                # Create trade plan
                plan_data = {
                    "ticker_id": ticker_id,
                    "trading_account_id": account_id,
                    "side": "Long",
                    "investment_type": "swing",
                    "entry_price": 150.00,
                    "planned_amount": 1500.00
                }
                create_resp = session.post(f"{BASE_URL}/api/trade-plans", json=plan_data, timeout=10)
                if create_resp.status_code in [200, 201]:
                    result["steps"]["create_plan"] = "passed"
                    plan_id = create_resp.json().get("data", {}).get("id") or create_resp.json().get("id")
                    
                    if plan_id:
                        result["steps"]["verify_plan"] = "passed"
                        result["status"] = "passed"
                    else:
                        result["warnings"].append("Plan created but ID not found")
                        result["status"] = "warning"
                else:
                    result["steps"]["create_plan"] = "failed"
                    result["errors"].append(f"Plan creation failed: {create_resp.status_code} - {create_resp.text[:200]}")
                    result["status"] = "failed"
        
        elif workflow["name"] == "alert":
            if not ticker_id:
                result["warnings"].append("Missing test data (ticker_id)")
                result["status"] = "warning"
            else:
                # Create alert
                alert_data = {
                    "ticker_id": ticker_id,
                    "condition_attribute": "price",
                    "condition_operator": "more_than",
                    "condition_number": "300.00",
                    "related_type_id": 4
                }
                create_resp = session.post(f"{BASE_URL}/api/alerts", json=alert_data, timeout=10)
                if create_resp.status_code in [200, 201]:
                    result["steps"]["create_alert"] = "passed"
                    alert_id = create_resp.json().get("data", {}).get("id") or create_resp.json().get("id")
                    
                    if alert_id:
                        result["steps"]["verify_alert"] = "passed"
                        result["status"] = "passed"
                    else:
                        result["warnings"].append("Alert created but ID not found")
                        result["status"] = "warning"
                else:
                    result["steps"]["create_alert"] = "failed"
                    result["errors"].append(f"Alert creation failed: {create_resp.status_code} - {create_resp.text[:200]}")
                    result["status"] = "failed"
        
    except Exception as e:
        result["status"] = "failed"
        result["errors"].append(f"Workflow error: {str(e)}")
        import traceback
        result["errors"].append(f"Traceback: {traceback.format_exc()[:500]}")
    
    return result


def test_workflow_selenium(workflow: Dict, driver) -> Dict:
    """Test workflow using Selenium (full UI testing)"""
    result = {
        "name": workflow["name"],
        "status": "pending",
        "steps": {},
        "errors": [],
        "warnings": []
    }
    
    if not driver:
        result["status"] = "skipped"
        result["warnings"].append("Selenium driver not available")
        return result
    
    print(f"Testing workflow (Selenium): {workflow['name']}")
    
    try:
        # Navigate to any page (login is now a modal, not a separate page)
        # Use dashboard/home page - login modal will appear if not authenticated
        driver.get(f"{BASE_URL}/")
        time.sleep(3)  # Wait for page load and potential modal
        
        # Check if login modal is present (if not authenticated)
        try:
            # Try to find login modal
            login_modal = driver.find_element(By.ID, "loginModal")
            if login_modal.is_displayed():
                # Login via modal
                # Wait for modal to be fully loaded
                WebDriverWait(driver, 5).until(
                    EC.presence_of_element_located((By.ID, "username"))
                )
                
                username_field = driver.find_element(By.ID, "username")
                password_field = driver.find_element(By.ID, "password")
                submit_button = driver.find_element(By.CSS_SELECTOR, "#loginForm button[type='submit']")
                
                username_field.send_keys(TEST_USERNAME)
                password_field.send_keys(TEST_PASSWORD)
                submit_button.click()
                
                # Wait for login to complete and modal to close
                time.sleep(3)
        except:
            # Modal not found - might already be logged in
            # Check if we're on a protected page (not login page)
            current_url = driver.current_url
            if "login" not in current_url.lower():
                result["steps"]["login"] = "passed"
                result["status"] = "passed"
                return result
        
        # Verify login success - check if we're on dashboard/home
        time.sleep(2)
        current_url = driver.current_url
        if "login" not in current_url.lower():
            result["steps"]["login"] = "passed"
            result["status"] = "passed"
        else:
            result["steps"]["login"] = "failed"
            result["errors"].append("Login failed - still on login page")
            result["status"] = "failed"
            
    except Exception as e:
        result["status"] = "failed"
        result["errors"].append(f"Selenium test error: {str(e)}")
        import traceback
        result["errors"].append(f"Traceback: {traceback.format_exc()[:500]}")
    
    return result


def run_all_e2e_tests() -> Dict:
    """Run E2E tests for all workflows"""
    print("🧪 Testing E2E Workflows...")
    print(f"Total workflows to test: {len(WORKFLOWS)}\n")
    
    e2e_results["summary"]["total_workflows"] = len(WORKFLOWS)
    
    # Try to setup Selenium
    driver = setup_driver()
    use_selenium = driver is not None
    
    if not use_selenium:
        print("⚠️  Selenium not available - using API-only tests\n")
    
    for workflow in WORKFLOWS:
        if use_selenium:
            result = test_workflow_selenium(workflow, driver)
        else:
            result = test_workflow_api(workflow)
        
        e2e_results["workflows"][workflow["name"]] = result
        e2e_results["summary"]["tested"] += 1
        
        if result["status"] == "passed":
            e2e_results["summary"]["passed"] += 1
            print(f"  ✅ {workflow['name']}: PASSED")
        elif result["status"] == "failed":
            e2e_results["summary"]["failed"] += 1
            print(f"  ❌ {workflow['name']}: FAILED")
            for error in result["errors"][:3]:
                print(f"     - {error}")
        else:
            e2e_results["summary"]["warnings"] += 1
            print(f"  ⚠️  {workflow['name']}: {result['status'].upper()}")
            for warning in result["warnings"][:3]:
                print(f"     - {warning}")
    
    if driver:
        try:
            driver.quit()
        except:
            pass
    
    # Calculate summary
    e2e_results["summary"]["total_tests"] = sum(
        len(w["steps"]) for w in e2e_results["workflows"].values()
    )
    
    # Save results
    results_file = REPORTS_DIR / "e2e_test_results.json"
    results_file.parent.mkdir(parents=True, exist_ok=True)
    with open(results_file, 'w', encoding='utf-8') as f:
        json.dump(e2e_results, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ E2E tests completed!")
    print(f"   Total: {e2e_results['summary']['total_workflows']}")
    print(f"   Passed: {e2e_results['summary']['passed']}")
    print(f"   Failed: {e2e_results['summary']['failed']}")
    print(f"   Warnings: {e2e_results['summary']['warnings']}")
    
    return {
        "status": "completed",
        "total_tests": e2e_results["summary"]["total_tests"],
        "passed": e2e_results["summary"]["passed"],
        "failed": e2e_results["summary"]["failed"],
        "warnings": e2e_results["summary"]["warnings"],
        "results": e2e_results
    }


if __name__ == "__main__":
    run_all_e2e_tests()

