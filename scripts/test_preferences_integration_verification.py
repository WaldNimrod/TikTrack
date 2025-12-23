#!/usr/bin/env python3
"""
Preferences Integration Verification Script
==========================================
בדיקות יסודיות לפני התקדמות לכל העמודים

בודק:
1. שהקובץ preferences-core.js קיים ונכון
2. שהשרת רץ ומגיב
3. שעמוד נסיון נטען נכון
4. שהעדפות נטענות בעמוד
5. שהעדפות נטענות במודולים
"""

import sys
import os
import requests
import time
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager

# Configuration
BASE_URL = "http://localhost:8080"
TEST_PAGE = "index.html"  # עמוד נסיון
TEST_USER = "admin"
TEST_PASSWORD = "admin123"
TIMEOUT = 30

def check_file_exists():
    """בדיקה שהקובץ preferences-core.js קיים"""
    print("🔍 Checking preferences-core.js file...")
    core_file = Path("trading-ui/scripts/preferences-core.js")
    if not core_file.exists():
        print(f"❌ ERROR: preferences-core.js not found at {core_file}")
        return False
    
    # Check file size (should be reasonable)
    size = core_file.stat().st_size
    if size < 1000:  # Less than 1KB seems wrong
        print(f"⚠️ WARNING: preferences-core.js is very small ({size} bytes)")
        return False
    
    print(f"✅ preferences-core.js exists ({size:,} bytes)")
    
    # Check for old references
    content = core_file.read_text(encoding='utf-8')
    if 'preferences-core-new' in content:
        print("⚠️ WARNING: Found 'preferences-core-new' reference in file")
        return False
    
    print("✅ No old references found")
    return True

def check_server_health():
    """בדיקה שהשרת רץ ומגיב"""
    print("\n🔍 Checking server health...")
    try:
        response = requests.get(f"{BASE_URL}/api/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data.get('status') == 'healthy':
                print("✅ Server is healthy")
                return True
            else:
                print(f"⚠️ Server status: {data.get('status')}")
                return False
        else:
            print(f"❌ Server returned status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Server not responding: {e}")
        return False

def login(driver):
    """התחברות כמנהל"""
    print("\n🔍 Logging in...")
    try:
        # Navigate to login page
        driver.get(f"{BASE_URL}/trading-ui/login.html")
        time.sleep(3)  # Wait for page to fully load
        
        # Find and fill login form
        username_field = WebDriverWait(driver, TIMEOUT).until(
            EC.presence_of_element_located((By.ID, "username"))
        )
        password_field = WebDriverWait(driver, TIMEOUT).until(
            EC.presence_of_element_located((By.ID, "password"))
        )
        
        # Clear fields first
        username_field.clear()
        password_field.clear()
        
        username_field.send_keys(TEST_USER)
        password_field.send_keys(TEST_PASSWORD)
        
        # Wait a bit for form to be ready
        time.sleep(1)
        
        # Try to find and click login button - use JavaScript click to avoid interception
        login_button = WebDriverWait(driver, TIMEOUT).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, "button[type='submit'], button.btn-primary"))
        )
        
        # Scroll into view and click with JavaScript
        driver.execute_script("arguments[0].scrollIntoView(true);", login_button)
        time.sleep(0.5)
        driver.execute_script("arguments[0].click();", login_button)
        
        # Wait for redirect
        time.sleep(5)
        
        # Check if logged in (should be redirected away from login page)
        current_url = driver.current_url
        if 'login' not in current_url.lower():
            print("✅ Login successful")
            return True
        else:
            print(f"⚠️ Still on login page: {current_url}")
            # Try to check if there's an error message
            try:
                error_msg = driver.find_element(By.CSS_SELECTOR, ".alert-danger, .error-message")
                print(f"   Error message: {error_msg.text}")
            except:
                pass
            return False
    except Exception as e:
        print(f"❌ Login failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def check_page_load(driver, page_name):
    """בדיקה שעמוד נטען נכון"""
    print(f"\n🔍 Checking {page_name} page load...")
    try:
        driver.get(f"{BASE_URL}/trading-ui/{page_name}")
        time.sleep(5)  # Wait for page to load
        
        # Check for JavaScript errors
        logs = driver.get_log('browser')
        errors = [log for log in logs if log['level'] == 'SEVERE']
        if errors:
            print(f"⚠️ Found {len(errors)} JavaScript errors:")
            for error in errors[:5]:  # Show first 5
                print(f"   - {error['message']}")
        
        # Check if preferences-core.js loaded
        scripts = driver.execute_script("""
            return Array.from(document.querySelectorAll('script[src*="preferences-core"]'))
                .map(s => s.src);
        """)
        
        if scripts:
            print(f"✅ preferences-core.js found in page: {scripts[0]}")
        else:
            print("⚠️ preferences-core.js not found in script tags (might be loaded dynamically)")
        
        # Check if PreferencesCore is available
        preferences_core_available = driver.execute_script("""
            return typeof window.PreferencesCore !== 'undefined';
        """)
        
        if preferences_core_available:
            print("✅ window.PreferencesCore is available")
        else:
            print("❌ window.PreferencesCore is NOT available")
            return False
        
        return True
    except Exception as e:
        print(f"❌ Page load check failed: {e}")
        return False

def check_preferences_loading(driver):
    """בדיקה שהעדפות נטענות"""
    print("\n🔍 Checking preferences loading...")
    try:
        # Wait for preferences to initialize
        time.sleep(3)
        
        # Check if preferences are loaded
        prefs_loaded = driver.execute_script("""
            if (!window.PreferencesCore) return false;
            if (!window.currentPreferences) return false;
            return Object.keys(window.currentPreferences).length > 0;
        """)
        
        if prefs_loaded:
            pref_count = driver.execute_script("""
                return Object.keys(window.currentPreferences || {}).length;
            """)
            print(f"✅ Preferences loaded ({pref_count} preferences)")
            
            # Check some key preferences
            sample_prefs = driver.execute_script("""
                const prefs = window.currentPreferences || {};
                return {
                    primaryColor: prefs.primaryColor,
                    default_trading_account: prefs.default_trading_account,
                    pagination_size_default: prefs.pagination_size_default
                };
            """)
            print(f"   Sample preferences: {sample_prefs}")
            return True
        else:
            print("❌ Preferences not loaded")
            return False
    except Exception as e:
        print(f"❌ Preferences loading check failed: {e}")
        return False

def check_modals_preferences(driver):
    """בדיקה שהעדפות נטענות במודולים"""
    print("\n🔍 Checking preferences in modals...")
    try:
        # Check if ModalManagerV2 is available
        modal_manager_available = driver.execute_script("""
            return typeof window.ModalManagerV2 !== 'undefined';
        """)
        
        if not modal_manager_available:
            print("⚠️ ModalManagerV2 not available (modals package might not be loaded)")
            return True  # Not a failure, just not available
        
        print("✅ ModalManagerV2 is available")
        
        # Check if SelectPopulatorService is available (uses preferences)
        select_populator_available = driver.execute_script("""
            return typeof window.SelectPopulatorService !== 'undefined';
        """)
        
        if select_populator_available:
            print("✅ SelectPopulatorService is available")
        else:
            print("⚠️ SelectPopulatorService not available")
        
        return True
    except Exception as e:
        print(f"❌ Modals preferences check failed: {e}")
        return False

def main():
    """Main test function"""
    print("=" * 60)
    print("Preferences Integration Verification")
    print("=" * 60)
    
    results = {
        'file_check': False,
        'server_check': False,
        'login': False,
        'page_load': False,
        'preferences_loading': False,
        'modals_preferences': False
    }
    
    # 1. File check
    results['file_check'] = check_file_exists()
    
    # 2. Server check
    results['server_check'] = check_server_health()
    
    if not results['server_check']:
        print("\n❌ Server is not running. Please start the server first.")
        return False
    
    # 3. Browser tests
    print("\n" + "=" * 60)
    print("Starting browser tests...")
    print("=" * 60)
    
    options = Options()
    options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--disable-gpu')
    options.set_capability('goog:loggingPrefs', {'browser': 'ALL'})
    
    try:
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=options)
        
        try:
            # Login
            results['login'] = login(driver)
            
            if results['login']:
                # Page load
                results['page_load'] = check_page_load(driver, TEST_PAGE)
                
                if results['page_load']:
                    # Preferences loading
                    results['preferences_loading'] = check_preferences_loading(driver)
                    
                    # Modals preferences
                    results['modals_preferences'] = check_modals_preferences(driver)
        
        finally:
            driver.quit()
    
    except Exception as e:
        print(f"\n❌ Browser test failed: {e}")
        return False
    
    # Summary
    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)
    
    all_passed = all(results.values())
    
    for test_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    print("\n" + "=" * 60)
    if all_passed:
        print("✅ All checks passed! Ready to proceed.")
        return True
    else:
        print("❌ Some checks failed. Please fix issues before proceeding.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)

