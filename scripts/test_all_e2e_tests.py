#!/usr/bin/env python3
"""
Test All E2E Tests - Run full E2E test suite
=============================================
Runs all E2E tests from the CRUD Testing Dashboard
"""

import json
import time
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
except ImportError:
    print("❌ Error: selenium or webdriver-manager not installed.")
    print("   Install with: pip install selenium webdriver-manager")
    exit(1)

BASE_URL = "http://127.0.0.1:8080"
TEST_USERNAME = "admin"
TEST_PASSWORD = "admin123"

def setup_driver():
    """Setup Chrome driver with options"""
    chrome_options = Options()
    chrome_options.add_argument('--headless')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--window-size=1920,1080')
    
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    # Set longer timeouts for E2E tests
    driver.set_page_load_timeout(60)
    driver.implicitly_wait(10)
    return driver

def login(driver):
    """Login as admin"""
    print("🔐 Logging in as admin...")
    driver.get(f"{BASE_URL}/trades.html")
    time.sleep(2)
    
    # Check if already logged in
    try:
        driver.find_element(By.CSS_SELECTOR, "[data-action='logout'], .user-menu, .logout-btn")
        print("✅ Already logged in")
        return True
    except:
        pass
    
    # Try to login
    try:
        login_button = WebDriverWait(driver, 5).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "[data-action='login'], .login-btn, #loginBtn"))
        )
        login_button.click()
        time.sleep(1)
        
        username_field = driver.find_element(By.CSS_SELECTOR, "#username, input[name='username'], input[type='text']")
        password_field = driver.find_element(By.CSS_SELECTOR, "#password, input[name='password'], input[type='password']")
        
        username_field.send_keys(TEST_USERNAME)
        password_field.send_keys(TEST_PASSWORD)
        
        submit_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit'], .btn-primary, [data-action='submit']")
        submit_button.click()
        
        time.sleep(2)
        print("✅ Logged in successfully")
        return True
    except Exception as e:
        print(f"⚠️ Login attempt failed (might already be logged in): {e}")
        return True

def run_all_e2e_tests(driver):
    """Run all E2E tests"""
    print("\n🧪 Running All E2E Tests...")
    print("=" * 60)
    
    # Navigate to CRUD Testing Dashboard
    driver.get(f"{BASE_URL}/crud_testing_dashboard.html")
    time.sleep(3)
    
    # Wait for page to load
    try:
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "body"))
        )
    except TimeoutException:
        print("❌ Page failed to load")
        return False
    
    # Execute the test function
    print("🔵 Executing runE2ETests()...")
    try:
        # Set script timeout to 5 minutes for E2E tests
        driver.set_script_timeout(300)  # 5 minutes
        
        # Run the test function - wait longer for all tests
        result = driver.execute_async_script("""
            const callback = arguments[arguments.length - 1];
            if (typeof window.runE2ETests === 'function') {
                window.runE2ETests().then(() => {
                    // Wait for results to appear
                    setTimeout(() => {
                        callback({
                            success: true,
                            message: 'All tests completed'
                        });
                    }, 10000); // 10 seconds after tests complete
                }).catch((error) => {
                    callback({
                        success: false,
                        error: error.message || String(error)
                    });
                });
            } else {
                callback({
                    success: false,
                    error: 'runE2ETests function not found'
                });
            }
        """)
        
        print(f"✅ Test execution result: {result}")
        
        # Wait for test results
        time.sleep(5)
        
        # Get results from JavaScript
        try:
            results = driver.execute_script("""
                if (window.integratedTester && window.integratedTester.results) {
                    return {
                        e2e: window.integratedTester.results.e2e || [],
                        stats: window.integratedTester.stats || {}
                    };
                }
                return { e2e: [], stats: {} };
            """)
            
            if results.get('e2e'):
                print(f"\n📊 E2E Test Results ({len(results['e2e'])} tests):")
                passed = 0
                failed = 0
                for result in results['e2e']:
                    status = "✅" if result.get('status') == 'success' else "❌"
                    workflow = result.get('workflow', 'Unknown')
                    print(f"   {status} {workflow}: {result.get('status', 'unknown')}")
                    if result.get('status') == 'success':
                        passed += 1
                    else:
                        failed += 1
                        if result.get('error'):
                            print(f"      Error: {result.get('error')}")
                
                print(f"\n📈 Summary: {passed} passed, {failed} failed out of {len(results['e2e'])} tests")
        except Exception as e:
            print(f"⚠️ Could not get test results: {e}")
        
        # Check console logs for errors
        logs = driver.get_log('browser')
        errors = [log for log in logs if log['level'] == 'SEVERE']
        if errors:
            print(f"\n❌ Found {len(errors)} console errors (showing first 10):")
            for error in errors[:10]:
                print(f"   - {error['message']}")
        
        return result.get('success', False)
        
    except Exception as e:
        print(f"❌ Error running tests: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Main test execution"""
    print("🚀 Starting All E2E Tests")
    print("=" * 60)
    
    driver = None
    try:
        driver = setup_driver()
        
        # Login
        if not login(driver):
            print("❌ Failed to login")
            return
        
        # Run tests
        success = run_all_e2e_tests(driver)
        
        if success:
            print("\n✅ All E2E Tests COMPLETED")
        else:
            print("\n❌ Some E2E Tests FAILED")
        
        # Keep browser open
        print("\n⏳ Keeping browser open for 15 seconds to view results...")
        time.sleep(15)
        
    except Exception as e:
        print(f"\n❌ Test execution failed: {e}")
        import traceback
        traceback.print_exc()
    finally:
        if driver:
            driver.quit()
            print("\n✅ Browser closed")

if __name__ == "__main__":
    main()

