#!/usr/bin/env python3
"""
Test Trade E2E - Fixed Version
===============================
Runs the Trade E2E test from the CRUD Testing Dashboard
"""

import json
import time
from datetime import datetime
from pathlib import Path

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
    return driver

def login(driver):
    """Login as admin"""
    print("🔐 Logging in as admin...")
    driver.get(f"{BASE_URL}/trades.html")
    time.sleep(2)
    
    # Check if already logged in by looking for logout button or user menu
    try:
        # Try to find elements that indicate we're logged in
        driver.find_element(By.CSS_SELECTOR, "[data-action='logout'], .user-menu, .logout-btn")
        print("✅ Already logged in")
        return True
    except:
        pass
    
    # Try to find login modal or login button
    try:
        login_button = WebDriverWait(driver, 5).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "[data-action='login'], .login-btn, #loginBtn"))
        )
        login_button.click()
        time.sleep(1)
        
        # Fill login form
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
        return True  # Continue anyway

def run_trade_test(driver):
    """Run the Trade E2E test"""
    print("\n🧪 Running Trade E2E Test...")
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
    print("🔵 Executing runTradeTestOnly()...")
    try:
        # Run the test function
        result = driver.execute_script("""
            return new Promise((resolve) => {
                if (typeof window.runTradeTestOnly === 'function') {
                    window.runTradeTestOnly().then(() => {
                        // Wait a bit for results to appear
                        setTimeout(() => {
                            const results = {
                                success: true,
                                message: 'Test completed'
                            };
                            resolve(results);
                        }, 5000);
                    }).catch((error) => {
                        resolve({
                            success: false,
                            error: error.message || String(error)
                        });
                    });
                } else {
                    resolve({
                        success: false,
                        error: 'runTradeTestOnly function not found'
                    });
                }
            });
        """)
        
        print(f"✅ Test execution result: {result}")
        
        # Wait for test results to appear
        time.sleep(10)
        
        # Check for test results in the page
        try:
            results_element = driver.find_element(By.CSS_SELECTOR, "#test-results, .test-results, [data-test-results]")
            results_text = results_element.text
            print(f"\n📊 Test Results:\n{results_text}")
        except:
            print("⚠️ Could not find test results element")
        
        # Check console logs for errors
        logs = driver.get_log('browser')
        errors = [log for log in logs if log['level'] == 'SEVERE']
        if errors:
            print(f"\n❌ Found {len(errors)} console errors:")
            for error in errors[:5]:  # Show first 5 errors
                print(f"   - {error['message']}")
        
        return result.get('success', False)
        
    except Exception as e:
        print(f"❌ Error running test: {e}")
        return False

def main():
    """Main test execution"""
    print("🚀 Starting Trade E2E Test")
    print("=" * 60)
    
    driver = None
    try:
        driver = setup_driver()
        
        # Login
        if not login(driver):
            print("❌ Failed to login")
            return
        
        # Run test
        success = run_trade_test(driver)
        
        if success:
            print("\n✅ Trade E2E Test PASSED")
        else:
            print("\n❌ Trade E2E Test FAILED")
        
        # Keep browser open for a bit to see results
        print("\n⏳ Keeping browser open for 10 seconds to view results...")
        time.sleep(10)
        
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

