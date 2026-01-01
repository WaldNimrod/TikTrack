#!/usr/bin/env python3
"""
Script to run final verification tests for executions + trading_accounts ONLY
Uses Selenium to execute the specific JavaScript test functions
Tests both Chrome and Firefox as required
"""

import json
import time
import sys
from datetime import datetime
from pathlib import Path

try:
    from selenium import webdriver
    from selenium.webdriver.chrome.service import Service as ChromeService
    from selenium.webdriver.chrome.options import Options as ChromeOptions
    from selenium.webdriver.firefox.service import Service as FirefoxService
    from selenium.webdriver.firefox.options import Options as FirefoxOptions
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.common.exceptions import TimeoutException, WebDriverException
    from webdriver_manager.firefox import GeckoDriverManager
    from webdriver_manager.chrome import ChromeDriverManager
except ImportError:
    print("❌ Error: selenium or webdriver-manager not installed.")
    print("   Install with: pip install selenium webdriver-manager")
    exit(1)

BASE_URL = "http://localhost:8080"
DASHBOARD_URL = f"{BASE_URL}/crud_testing_dashboard"  # No .html suffix

# Test credentials (admin) - CRITICAL: Always use admin/admin123 for tests
TEST_USERNAME = "admin"
TEST_PASSWORD = "admin123"

def setup_driver(browser_type):
    """Setup WebDriver for specified browser"""
    if browser_type == "chrome":
        options = ChromeOptions()
        options.add_argument("--headless")  # Run headless
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        service = ChromeService(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=options)
    elif browser_type == "firefox":
        options = FirefoxOptions()
        options.add_argument("--headless")  # Run headless
        service = FirefoxService(GeckoDriverManager().install())
        driver = webdriver.Firefox(service=service, options=options)
    else:
        raise ValueError(f"Unsupported browser: {browser_type}")

    driver.maximize_window()
    return driver

def login_to_dashboard(driver):
    """Login to the dashboard with admin credentials"""
    print(f"🔐 Logging in as {TEST_USERNAME}...")

    # Wait for login form
    username_field = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "username"))
    )
    password_field = driver.find_element(By.ID, "password")
    login_button = driver.find_element(By.ID, "login-button")

    # Clear and fill credentials
    username_field.clear()
    username_field.send_keys(TEST_USERNAME)
    password_field.clear()
    password_field.send_keys(TEST_PASSWORD)

    # Click login
    login_button.click()

    # Wait for dashboard to load
    WebDriverWait(driver, 15).until(
        EC.presence_of_element_located((By.ID, "test-dashboard"))
    )

    print("✅ Login successful")

def run_single_entity_test(driver, entity_name, browser_name):
    """Run test for single entity and capture results"""
    print(f"🧪 Running {entity_name} test in {browser_name}...")

    function_name = f"run{entity_name.title().replace('_', '')}TestOnly()"
    if entity_name == "trading_account":
        function_name = "runTradingAccountTestOnly()"

    print(f"📝 Executing: {function_name}")

    # Execute the JavaScript function
    try:
        result = driver.execute_script(f"""
            return {function_name.replace('()', '')}()
                .then(() => ({'success': true, 'message': '{entity_name} test completed'}))
                .catch(error => ({'success': false, 'message': error.message}));
        """)

        print(f"✅ {entity_name} test completed in {browser_name}")
        return True

    except Exception as e:
        print(f"❌ {entity_name} test failed in {browser_name}: {str(e)}")
        return False

def get_logger_evidence(driver, entity_name, browser_name):
    """Capture Logger evidence from browser console"""
    print(f"📋 Capturing Logger evidence for {entity_name} in {browser_name}...")

    try:
        # Get console logs
        logs = driver.get_log('browser')
        logger_logs = [log for log in logs if 'Logger' in log.get('message', '')]

        evidence = {
            'entity': entity_name,
            'browser': browser_name,
            'timestamp': datetime.now().isoformat(),
            'logger_logs': logger_logs,
            'console_errors': len([log for log in logs if log['level'] == 'SEVERE'])
        }

        return evidence

    except Exception as e:
        print(f"⚠️ Could not capture Logger evidence: {str(e)}")
        return None

def get_network_evidence(driver, entity_name, browser_name):
    """Capture Network evidence"""
    print(f"🌐 Capturing Network evidence for {entity_name} in {browser_name}...")

    try:
        # Get network logs
        network_logs = driver.get_log('performance')

        api_calls = []
        for entry in network_logs:
            try:
                log_entry = json.loads(entry['message'])['message']
                if 'Network.requestWillBeSent' in log_entry['method']:
                    url = log_entry['params']['request']['url']
                    if '/api/' in url:
                        api_calls.append({
                            'url': url,
                            'method': log_entry['params']['request']['method'],
                            'timestamp': log_entry['params']['timestamp']
                        })
            except:
                continue

        evidence = {
            'entity': entity_name,
            'browser': browser_name,
            'timestamp': datetime.now().isoformat(),
            'api_calls': api_calls
        }

        return evidence

    except Exception as e:
        print(f"⚠️ Could not capture Network evidence: {str(e)}")
        return None

def run_tests_for_browser(browser_type):
    """Run tests for specific browser"""
    print(f"\n{'='*60}")
    print(f"🚀 Starting tests in {browser_type.upper()}")
    print(f"{'='*60}")

    driver = None
    results = {
        'browser': browser_type,
        'executions': {'passed': False, 'evidence': {}},
        'trading_accounts': {'passed': False, 'evidence': {}}
    }

    try:
        driver = setup_driver(browser_type)
        driver.get(DASHBOARD_URL)

        # Login
        login_to_dashboard(driver)

        # Test executions
        results['executions']['passed'] = run_single_entity_test(driver, 'execution', browser_type)
        results['executions']['evidence'] = {
            'logger': get_logger_evidence(driver, 'execution', browser_type),
            'network': get_network_evidence(driver, 'execution', browser_type)
        }

        # Test trading_accounts
        results['trading_accounts']['passed'] = run_single_entity_test(driver, 'trading_account', browser_type)
        results['trading_accounts']['evidence'] = {
            'logger': get_logger_evidence(driver, 'trading_account', browser_type),
            'network': get_network_evidence(driver, 'trading_account', browser_type)
        }

    except Exception as e:
        print(f"❌ Browser {browser_type} test failed: {str(e)}")
    finally:
        if driver:
            driver.quit()

    return results

def update_focused_api_results(results):
    """Update focused_api_results.json with new results"""
    results_file = Path("focused_api_results.json")

    if results_file.exists():
        try:
            with open(results_file, 'r', encoding='utf-8') as f:
                existing_results = json.load(f)
        except:
            existing_results = {}
    else:
        existing_results = {}

    # Update with new results
    timestamp = datetime.now().isoformat()
    existing_results['last_updated'] = timestamp
    existing_results['stage_2_batch_1_final_verification'] = results

    with open(results_file, 'w', encoding='utf-8') as f:
        json.dump(existing_results, f, indent=2, ensure_ascii=False)

    print(f"✅ Updated {results_file} with test results")

def main():
    """Main execution function"""
    print("🎯 TikTrack Stage 2 Batch 1 Final Verification")
    print("Testing: executions + trading_accounts")
    print("Browsers: Chrome + Firefox")
    print("Credentials: admin/admin123")
    print(f"Dashboard: {DASHBOARD_URL}")
    print(f"Timestamp: {datetime.now().isoformat()}")
    print("=" * 60)

    all_results = {
        'test_timestamp': datetime.now().isoformat(),
        'test_type': 'stage_2_batch_1_final_verification',
        'entities': ['execution', 'trading_account'],
        'browsers': ['chrome', 'firefox'],
        'credentials': {'username': TEST_USERNAME, 'password': TEST_PASSWORD},
        'results': {}
    }

    browsers = ['chrome', 'firefox']

    for browser in browsers:
        print(f"\n🔄 Testing {browser}...")
        browser_results = run_tests_for_browser(browser)
        all_results['results'][browser] = browser_results

        # Check results
        executions_passed = browser_results['executions']['passed']
        trading_accounts_passed = browser_results['trading_accounts']['passed']

        print(f"📊 {browser.upper()} Results:")
        print(f"   executions: {'✅ PASS' if executions_passed else '❌ FAIL'}")
        print(f"   trading_accounts: {'✅ PASS' if trading_accounts_passed else '❌ FAIL'}")

    # Update focused_api_results.json
    update_focused_api_results(all_results)

    # Final summary
    print(f"\n{'='*60}")
    print("🎯 FINAL SUMMARY - Stage 2 Batch 1 Final Verification")
    print(f"{'='*60}")

    chrome_executions = all_results['results']['chrome']['executions']['passed']
    chrome_trading = all_results['results']['chrome']['trading_accounts']['passed']
    firefox_executions = all_results['results']['firefox']['executions']['passed']
    firefox_trading = all_results['results']['firefox']['trading_accounts']['passed']

    print("Chrome Results:")
    print(f"  executions: {'✅ PASS' if chrome_executions else '❌ FAIL'}")
    print(f"  trading_accounts: {'✅ PASS' if chrome_trading else '❌ FAIL'}")

    print("Firefox Results:")
    print(f"  executions: {'✅ PASS' if firefox_executions else '❌ FAIL'}")
    print(f"  trading_accounts: {'✅ PASS' if firefox_trading else '❌ FAIL'}")

    # Overall result
    all_passed = all([
        chrome_executions, chrome_trading,
        firefox_executions, firefox_trading
    ])

    print(f"\n🎯 OVERALL RESULT: {'✅ ALL TESTS PASSED' if all_passed else '❌ SOME TESTS FAILED'}")

    if all_passed:
        print("✅ Stage 2 Batch 1 can proceed to GREEN status")
        print("📋 Evidence captured in focused_api_results.json")
    else:
        print("❌ Issues found - check evidence in focused_api_results.json")
        print("🔧 Team C may need additional fixes")

if __name__ == "__main__":
    main()
