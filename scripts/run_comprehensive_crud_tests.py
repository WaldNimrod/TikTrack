#!/usr/bin/env python3
"""
Script to run comprehensive CRUD tests on all 15 main pages
Uses Selenium to execute the JavaScript test runner
"""

import json
import time
import sys
from datetime import datetime
from pathlib import Path

try:
    from selenium import webdriver
    from selenium.webdriver.firefox.service import Service as FirefoxService
    from selenium.webdriver.firefox.options import Options as FirefoxOptions
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.common.exceptions import TimeoutException, WebDriverException
    from webdriver_manager.firefox import GeckoDriverManager
except ImportError:
    print("❌ Error: selenium or webdriver-manager not installed.")
    print("   Install with: pip install selenium webdriver-manager")
    exit(1)

BASE_URL = "http://localhost:8080"
DASHBOARD_URL = f"{BASE_URL}/crud_testing_dashboard.html"

# Test credentials
TEST_USERNAME = "admin"
TEST_PASSWORD = "admin123"

# Main pages to test (15 pages)
MAIN_PAGES = [
    'index',
    'trades',
    'trade_plans',
    'alerts',
    'tickers',
    'trading_accounts',
    'executions',
    'cash_flows',
    'notes',
    'research',
    'preferences',
    'ai-analysis',
    'user-profile',
    'watch-list',
    'ticker-dashboard'
]

def setup_driver():
    """Setup Firefox driver with appropriate options"""
    options = FirefoxOptions()
    options.add_argument("--headless")  # Run in headless mode
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1920,1080")
    options.set_preference("dom.webdriver.enabled", False)
    options.set_preference('useAutomationExtension', False)

    service = FirefoxService(GeckoDriverManager().install())
    driver = webdriver.Firefox(service=service, options=options)

    return driver

def login_admin(driver):
    """Login as admin user"""
    try:
        print("🔐 Logging in as admin...")

        # Navigate to login page
        driver.get(f"{BASE_URL}/login.html")

        # Wait for page to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )

        # Fill login form
        username_field = WebDriverWait(driver, 5).until(
            EC.element_to_be_clickable((By.ID, "username"))
        )
        password_field = driver.find_element(By.ID, "password")
        login_button = driver.find_element(By.ID, "loginBtn")

        username_field.clear()
        username_field.send_keys(TEST_USERNAME)
        password_field.clear()
        password_field.send_keys(TEST_PASSWORD)

        login_button.click()

        # Wait for login to complete and redirect
        time.sleep(3)

        print("✅ Admin login completed")
        return True

    except Exception as e:
        print(f"❌ Admin login failed: {e}")
        return False

def load_test_script(driver):
    """Load the comprehensive test runner script"""
    try:
        print("📜 Loading comprehensive test script...")

        # Read the test script
        script_path = Path(__file__).parent.parent / "trading-ui" / "scripts" / "comprehensive-crud-test-runner.js"
        with open(script_path, 'r', encoding='utf-8') as f:
            script_content = f.read()

        # Execute the script in browser
        driver.execute_script(script_content)

        print("✅ Test script loaded successfully")
        return True

    except Exception as e:
        print(f"❌ Failed to load test script: {e}")
        return False

def run_page_tests(driver, page_name):
    """Run tests for a specific page"""
    try:
        print(f"🧪 Testing page: {page_name}")

        # Navigate to the page
        driver.get(f"{BASE_URL}/{page_name}.html")

        # Wait for page to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )

        # Give extra time for scripts to load
        time.sleep(3)

        # Load the full test script content directly in the page
        script_path = Path(__file__).parent.parent / "trading-ui" / "scripts" / "comprehensive-crud-test-runner.js"
        with open(script_path, 'r', encoding='utf-8') as f:
            script_content = f.read()

        # Inject the script into the page
        driver.execute_script(script_content)

        # Run individual page tests
        result = driver.execute_async_script(f"""
            var callback = arguments[arguments.length - 1];
            var pageName = '{page_name}';

            try {{
                // Run loading order check
                checkPageLoadingOrder(pageName).then(function(loadingResult) {{
                    // Run CRUD test
                    testPageCRUD(pageName).then(function(crudResult) {{
                        callback({{
                            page: pageName,
                            loadingOrder: loadingResult,
                            crud: crudResult
                        }});
                    }}).catch(function(crudError) {{
                        callback({{
                            page: pageName,
                            loadingOrder: loadingResult,
                            crud: {{ page: pageName, crud: 'ERROR', error: crudError.message }}
                        }});
                    }});
                }}).catch(function(loadingError) {{
                    callback({{
                        page: pageName,
                        loadingOrder: {{ page: pageName, loadingOrder: 'ERROR', error: loadingError.message }},
                        crud: {{ page: pageName, crud: 'ERROR', error: 'Loading failed' }}
                    }});
                }});
            }} catch (globalError) {{
                callback({{
                    page: pageName,
                    loadingOrder: {{ page: pageName, loadingOrder: 'ERROR', error: globalError.message }},
                    crud: {{ page: pageName, crud: 'ERROR', error: globalError.message }}
                }});
            }}
        """)

        print(f"✅ Page {page_name} tests completed")
        return result

    except Exception as e:
        print(f"❌ Page {page_name} test error: {e}")
        return {
            'page': page_name,
            'loadingOrder': { 'page': page_name, 'loadingOrder': 'ERROR', 'error': str(e) },
            'crud': { 'page': page_name, 'crud': 'ERROR', 'error': str(e) }
        }

def run_comprehensive_tests(driver):
    """Run the comprehensive tests on all pages"""
    try:
        print("🚀 Starting comprehensive CRUD tests on all 15 pages...")

        # Load test script once
        if not load_test_script(driver):
            return None

        all_results = {
            'loadingOrder': [],
            'crud': [],
            'summary': {
                'total': len(MAIN_PAGES),
                'loadingOrderPassed': 0,
                'loadingOrderFailed': 0,
                'crudPassed': 0,
                'crudFailed': 0,
                'crudErrors': 0
            }
        }

        # Test each page individually
        for page_name in MAIN_PAGES:
            page_result = run_page_tests(driver, page_name)

            if page_result:
                # Add to results
                all_results['loadingOrder'].append(page_result['loadingOrder'])
                all_results['crud'].append(page_result['crud'])

                # Update summary
                loading_result = page_result['loadingOrder']
                crud_result = page_result['crud']

                # Count loading order results
                if loading_result.get('loadingOrder') == 'OK':
                    all_results['summary']['loadingOrderPassed'] += 1
                else:
                    all_results['summary']['loadingOrderFailed'] += 1

                # Count CRUD results
                if crud_result.get('crud') == 'OK':
                    all_results['summary']['crudPassed'] += 1
                elif crud_result.get('crud') == 'ERROR':
                    all_results['summary']['crudErrors'] += 1
                else:
                    all_results['summary']['crudFailed'] += 1

        print("✅ All comprehensive tests completed successfully")
        return all_results

    except Exception as e:
        print(f"❌ Test execution error: {e}")
        return None

def save_results(results, filename="comprehensive_test_results.json"):
    """Save test results to file"""
    try:
        output_path = Path(__file__).parent.parent / filename
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)

        print(f"💾 Results saved to: {output_path}")
        return str(output_path)

    except Exception as e:
        print(f"❌ Failed to save results: {e}")
        return None

def print_summary(results):
    """Print test summary"""
    if not results or 'error' in results:
        print("❌ No valid results to display")
        return

    summary = results.get('summary', {})

    print("\n" + "="*60)
    print("📊 COMPREHENSIVE CRUD TEST RESULTS")
    print("="*60)

    print(f"\n📋 Total Pages Tested: {summary.get('total', 0)}")

    print(f"\n🔍 Loading Order Tests:")
    print(f"   ✅ Passed: {summary.get('loadingOrderPassed', 0)}")
    print(f"   ❌ Failed: {summary.get('loadingOrderFailed', 0)}")

    print(f"\n🧪 CRUD Tests:")
    print(f"   ✅ Passed: {summary.get('crudPassed', 0)}")
    print(f"   ❌ Failed: {summary.get('crudFailed', 0)}")
    print(f"   💥 Errors: {summary.get('crudErrors', 0)}")

    # Calculate success rates
    total_pages = summary.get('total', 0)
    if total_pages > 0:
        loading_success = (summary.get('loadingOrderPassed', 0) / total_pages) * 100
        crud_success = (summary.get('crudPassed', 0) / total_pages) * 100

        print(f"🔍 Loading Success Rate: {loading_success:.1f}%")
        print(f"🧪 CRUD Success Rate: {crud_success:.1f}%")
def main():
    """Main execution function"""
    print("🎯 Starting Comprehensive CRUD Tests Automation")
    print(f"📍 Dashboard URL: {DASHBOARD_URL}")
    print(f"🔐 Test User: {TEST_USERNAME}")

    driver = None
    try:
        # Setup driver
        driver = setup_driver()

        # Login as admin
        if not login_admin(driver):
            print("❌ Cannot proceed without admin login")
            return False

        # Navigate to dashboard
        print(f"🏠 Navigating to dashboard: {DASHBOARD_URL}")
        driver.get(DASHBOARD_URL)

        # Wait for page to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )

        # Load test script
        if not load_test_script(driver):
            print("❌ Cannot proceed without test script")
            return False

        # Run comprehensive tests
        results = run_comprehensive_tests(driver)

        if results:
            # Print summary
            print_summary(results)

            # Save results
            output_file = save_results(results)

            if output_file:
                print(f"\n📄 Detailed results saved to: {output_file}")

            return True
        else:
            print("❌ No test results obtained")
            return False

    except Exception as e:
        print(f"❌ Script execution failed: {e}")
        return False

    finally:
        if driver:
            driver.quit()

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
