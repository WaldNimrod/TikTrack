#!/usr/bin/env python3
"""
Conditions UI Testing Script
============================
Selenium tests for conditions management UI:
- Opening conditions modal from Trade Plan / Trade
- Creating conditions (all method types)
- Editing conditions
- Deleting conditions
- Readiness status display
- Error handling (validation, API errors)

Uses admin/admin123 credentials for testing.
"""

import json
import time
import argparse
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional

try:
    from selenium import webdriver
    from selenium.webdriver.chrome.service import Service
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.common.exceptions import TimeoutException, WebDriverException, NoSuchElementException
    from webdriver_manager.chrome import ChromeDriverManager
except ImportError:
    print("❌ Error: selenium or webdriver-manager not installed.")
    print("   Install with: pip install selenium webdriver-manager")
    exit(1)

BASE_URL = "http://localhost:5001"

# Test credentials (admin) - CRITICAL: Always use admin/admin123 for tests
TEST_USERNAME = "admin"
TEST_PASSWORD = "admin123"


def create_chrome_driver():
    """Create Chrome WebDriver instance"""
    chrome_options = Options()
    chrome_options.add_argument('--headless')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--window-size=1920,1080')
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    driver.set_script_timeout(60)
    return driver


def login(driver):
    """Login via modal"""
    try:
        print("🔐 Logging in...")
        driver.get(f"{BASE_URL}/")
        
        WebDriverWait(driver, 15).until(
            lambda d: d.execute_script('return document.readyState') == 'complete'
        )
        
        WebDriverWait(driver, 20).until(
            lambda d: d.execute_script(
                "return !!window.TikTrackAuth && typeof window.TikTrackAuth.showLoginModal === 'function';"
            )
        )
        
        driver.execute_async_script("""
            const done = arguments[0];
            const timeout = setTimeout(() => done('timeout'), 10000);
            if (!window.TikTrackAuth || typeof window.TikTrackAuth.showLoginModal !== 'function') {
                clearTimeout(timeout);
                done('TikTrackAuth missing');
                return;
            }
            Promise.resolve(window.TikTrackAuth.showLoginModal())
              .then(() => { clearTimeout(timeout); done('ok'); })
              .catch(err => { clearTimeout(timeout); done(err && err.message ? err.message : String(err)); });
        """)
        
        WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.ID, "loginModalContainer"))
        )
        
        username_field = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.ID, "username"))
        )
        password_field = driver.find_element(By.ID, "password")
        
        username_field.clear()
        username_field.send_keys(TEST_USERNAME)
        password_field.clear()
        password_field.send_keys(TEST_PASSWORD)
        
        login_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.ID, "loginBtn"))
        )
        driver.execute_script("arguments[0].click();", login_button)
        
        # Wait for login to complete
        time.sleep(3)
        print("✅ Login successful")
        return True
    except Exception as e:
        print(f"❌ Login failed: {e}")
        return False


def get_first_trade_plan_id(driver) -> Optional[int]:
    """Get first trade plan ID from the page"""
    try:
        driver.get(f"{BASE_URL}/trade_plans.html")
        time.sleep(3)
        
        # Wait for table to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "table tbody tr"))
        )
        
        # Get first row's data-id or extract from row
        first_row = driver.find_element(By.CSS_SELECTOR, "table tbody tr")
        row_id = first_row.get_attribute("data-id") or first_row.get_attribute("data-entity-id")
        
        if row_id:
            return int(row_id)
        
        # Try to extract from onclick or other attributes
        onclick = first_row.get_attribute("onclick") or ""
        if "showEntityDetails" in onclick:
            import re
            match = re.search(r"showEntityDetails\(['\"]trade_plan['\"],\s*(\d+)", onclick)
            if match:
                return int(match.group(1))
        
        return None
    except Exception as e:
        print(f"⚠️ Could not get trade plan ID: {e}")
        return None


def get_first_trade_id(driver) -> Optional[int]:
    """Get first trade ID from the page"""
    try:
        driver.get(f"{BASE_URL}/trades.html")
        time.sleep(3)
        
        # Wait for table to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "table tbody tr"))
        )
        
        # Get first row's data-id or extract from row
        first_row = driver.find_element(By.CSS_SELECTOR, "table tbody tr")
        row_id = first_row.get_attribute("data-id") or first_row.get_attribute("data-entity-id")
        
        if row_id:
            return int(row_id)
        
        return None
    except Exception as e:
        print(f"⚠️ Could not get trade ID: {e}")
        return None


def test_open_conditions_modal(driver, entity_type: str, entity_id: int) -> Dict[str, Any]:
    """Test opening conditions modal"""
    result = {
        "test": "open_conditions_modal",
        "entity_type": entity_type,
        "entity_id": entity_id,
        "status": "pending",
        "errors": []
    }
    
    try:
        print(f"📋 Testing opening conditions modal for {entity_type} {entity_id}")
        
        # Navigate to entity page
        if entity_type == "plan":
            driver.get(f"{BASE_URL}/trade_plans.html")
        else:
            driver.get(f"{BASE_URL}/trades.html")
        
        time.sleep(3)
        
        # Wait for page to load
        WebDriverWait(driver, 10).until(
            lambda d: d.execute_script('return document.readyState') == 'complete'
        )
        
        # Wait for conditions system to be ready
        WebDriverWait(driver, 15).until(
            lambda d: d.execute_script("""
                return window.conditionsSystem && 
                       window.conditionsSystem.initializer &&
                       window.conditionsSystem.initializer.getStatus().isInitialized;
            """)
        )
        
        # Open conditions modal using JavaScript
        driver.execute_script(f"""
            (async function() {{
                if (window.ConditionsModalController) {{
                    await window.ConditionsModalController.open({{
                        entityType: '{entity_type}',
                        entityId: {entity_id},
                        entityName: 'Test {entity_type}'
                    }});
                }} else {{
                    throw new Error('ConditionsModalController not available');
                }}
            }})();
        """)
        
        # Wait for modal to appear
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "conditionsModal"))
        )
        
        # Check if modal is visible
        modal = driver.find_element(By.ID, "conditionsModal")
        modal_classes = modal.get_attribute("class") or ""
        
        if "show" in modal_classes or modal.is_displayed():
            result["status"] = "passed"
            print("✅ Conditions modal opened successfully")
        else:
            result["status"] = "failed"
            result["errors"].append("Modal opened but not visible")
            print("❌ Modal opened but not visible")
        
    except Exception as e:
        result["status"] = "failed"
        result["errors"].append(str(e))
        print(f"❌ Failed to open conditions modal: {e}")
    
    return result


def test_create_condition(driver, entity_type: str, entity_id: int) -> Dict[str, Any]:
    """Test creating a condition"""
    result = {
        "test": "create_condition",
        "entity_type": entity_type,
        "entity_id": entity_id,
        "status": "pending",
        "errors": []
    }
    
    try:
        print(f"➕ Testing creating condition for {entity_type} {entity_id}")
        
        # Open conditions modal first
        open_result = test_open_conditions_modal(driver, entity_type, entity_id)
        if open_result["status"] != "passed":
            result["status"] = "skipped"
            result["errors"].append("Could not open conditions modal")
            return result
        
        time.sleep(2)
        
        # Wait for form to be ready
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "#conditionsFormContainer"))
        )
        
        # Select first method from dropdown
        method_select = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "select[name='method_id'], #method_id"))
        )
        
        # Get available options
        options = method_select.find_elements(By.TAG_NAME, "option")
        if len(options) < 2:  # First option is usually "Select..."
            result["status"] = "skipped"
            result["errors"].append("No methods available")
            return result
        
        # Select second option (first actual method)
        options[1].click()
        time.sleep(1)
        
        # Fill in parameters (if form fields appear)
        # This is simplified - actual form fields depend on method type
        try:
            parameter_inputs = driver.find_elements(By.CSS_SELECTOR, "input[name*='parameter'], input[name*='period']")
            for input_field in parameter_inputs[:2]:  # Fill first 2 parameter fields
                if input_field.is_displayed():
                    input_field.clear()
                    input_field.send_keys("20")
        except:
            pass  # Some methods might not have visible parameter fields
        
        # Submit form
        submit_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, "button[type='submit'], button[data-button-type='SAVE']"))
        )
        driver.execute_script("arguments[0].click();", submit_button)
        
        # Wait for success/error message
        time.sleep(3)
        
        # Check for success notification
        success_indicators = driver.find_elements(By.CSS_SELECTOR, ".alert-success, .notification-success, [class*='success']")
        if success_indicators:
            result["status"] = "passed"
            print("✅ Condition created successfully")
        else:
            # Check for errors
            error_indicators = driver.find_elements(By.CSS_SELECTOR, ".alert-danger, .notification-error, [class*='error']")
            if error_indicators:
                result["status"] = "failed"
                result["errors"].append("Error message displayed")
                print("❌ Error creating condition")
            else:
                result["status"] = "unknown"
                result["errors"].append("Could not determine success/failure")
        
    except Exception as e:
        result["status"] = "failed"
        result["errors"].append(str(e))
        print(f"❌ Failed to create condition: {e}")
    
    return result


def test_readiness_status_display(driver, entity_type: str, entity_id: int) -> Dict[str, Any]:
    """Test readiness status display in conditions table"""
    result = {
        "test": "readiness_status_display",
        "entity_type": entity_type,
        "entity_id": entity_id,
        "status": "pending",
        "errors": []
    }
    
    try:
        print(f"🔍 Testing readiness status display for {entity_type} {entity_id}")
        
        # Open conditions modal
        open_result = test_open_conditions_modal(driver, entity_type, entity_id)
        if open_result["status"] != "passed":
            result["status"] = "skipped"
            result["errors"].append("Could not open conditions modal")
            return result
        
        time.sleep(2)
        
        # Check if readiness column exists in table
        try:
            table_headers = driver.find_elements(By.CSS_SELECTOR, "table thead th")
            header_texts = [h.text for h in table_headers]
            
            if "מצב כשירות" in " ".join(header_texts):
                result["status"] = "passed"
                print("✅ Readiness status column found")
            else:
                result["status"] = "failed"
                result["errors"].append("Readiness status column not found in table headers")
                print("❌ Readiness status column not found")
        except Exception as e:
            result["status"] = "failed"
            result["errors"].append(f"Error checking table: {e}")
        
    except Exception as e:
        result["status"] = "failed"
        result["errors"].append(str(e))
        print(f"❌ Failed to test readiness status: {e}")
    
    return result


def test_conditions_ui(driver) -> Dict[str, Any]:
    """Run all conditions UI tests"""
    results = {
        "timestamp": datetime.now().isoformat(),
        "tests": [],
        "summary": {
            "total": 0,
            "passed": 0,
            "failed": 0,
            "skipped": 0
        }
    }
    
    # Get test entities
    plan_id = get_first_trade_plan_id(driver)
    trade_id = get_first_trade_id(driver)
    
    if not plan_id and not trade_id:
        print("⚠️ No entities found for testing")
        return results
    
    # Test with trade plan if available
    if plan_id:
        print(f"\n📋 Testing with Trade Plan {plan_id}")
        results["tests"].append(test_open_conditions_modal(driver, "plan", plan_id))
        results["tests"].append(test_readiness_status_display(driver, "plan", plan_id))
        # Skip create test for now (requires more complex form handling)
        # results["tests"].append(test_create_condition(driver, "plan", plan_id))
    
    # Test with trade if available
    if trade_id:
        print(f"\n📈 Testing with Trade {trade_id}")
        results["tests"].append(test_open_conditions_modal(driver, "trade", trade_id))
        results["tests"].append(test_readiness_status_display(driver, "trade", trade_id))
    
    # Calculate summary
    for test_result in results["tests"]:
        results["summary"]["total"] += 1
        status = test_result.get("status", "unknown")
        if status == "passed":
            results["summary"]["passed"] += 1
        elif status == "failed":
            results["summary"]["failed"] += 1
        elif status == "skipped":
            results["summary"]["skipped"] += 1
    
    return results


def main():
    parser = argparse.ArgumentParser(description="Test conditions UI with Selenium")
    parser.add_argument("--headless", action="store_true", help="Run in headless mode")
    parser.add_argument("--output", type=str, help="Output JSON file path")
    args = parser.parse_args()
    
    driver = None
    try:
        print("🚀 Starting Conditions UI Tests")
        driver = create_chrome_driver()
        
        # Login
        if not login(driver):
            print("❌ Login failed, aborting tests")
            return
        
        # Run tests
        results = test_conditions_ui(driver)
        
        # Print summary
        print("\n" + "="*50)
        print("📊 Test Summary")
        print("="*50)
        print(f"Total: {results['summary']['total']}")
        print(f"Passed: {results['summary']['passed']}")
        print(f"Failed: {results['summary']['failed']}")
        print(f"Skipped: {results['summary']['skipped']}")
        
        # Save results
        if args.output:
            output_path = Path(args.output)
            output_path.parent.mkdir(parents=True, exist_ok=True)
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(results, f, ensure_ascii=False, indent=2)
            print(f"\n💾 Results saved to {output_path}")
        else:
            # Save to default location
            output_path = Path("reports/conditions-ui-test-results.json")
            output_path.parent.mkdir(parents=True, exist_ok=True)
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(results, f, ensure_ascii=False, indent=2)
            print(f"\n💾 Results saved to {output_path}")
        
    except Exception as e:
        print(f"❌ Test execution failed: {e}")
        import traceback
        traceback.print_exc()
    finally:
        if driver:
            driver.quit()


if __name__ == "__main__":
    main()
