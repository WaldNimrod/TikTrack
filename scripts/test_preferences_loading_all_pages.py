#!/usr/bin/env python3
"""
Comprehensive script to test preferences loading on ALL pages
Tests that preferences are loaded correctly on every page
"""

import json
import time
import argparse
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any
import requests

try:
    from selenium import webdriver
    from selenium.webdriver.chrome.service import Service
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.common.exceptions import TimeoutException, WebDriverException, TimeoutException as SeleniumTimeout
    from webdriver_manager.chrome import ChromeDriverManager
except ImportError:
    print("❌ Error: selenium or webdriver-manager not installed.")
    print("   Install with: pip install selenium webdriver-manager")
    exit(1)

BASE_URL = "http://localhost:8080"

# Test credentials (admin) - CRITICAL: Always use admin/admin123 for tests
TEST_USERNAME = "admin"
TEST_PASSWORD = "admin123"

# Rate limiting configuration
RATE_LIMIT_CONFIG = {
    'min_delay_between_pages': 2.0,
    'max_delay_between_pages': 5.0,
    'retry_max_attempts': 3,
    'retry_base_delay': 2.0,
}

# All pages from PAGES_LIST.md
ALL_PAGES = [
    # עמודים מרכזיים (Main Pages)
    {"name": "דף הבית", "url": "/", "category": "main", "priority": "high"},
    {"name": "טריידים", "url": "/trades.html", "category": "main", "priority": "high"},
    {"name": "תכניות מסחר", "url": "/trade_plans.html", "category": "main", "priority": "high"},
    {"name": "התראות", "url": "/alerts.html", "category": "main", "priority": "high"},
    {"name": "טיקרים", "url": "/tickers.html", "category": "main", "priority": "high"},
    {"name": "דשבורד טיקר", "url": "/ticker_dashboard.html", "category": "main", "priority": "medium"},
    {"name": "חשבונות מסחר", "url": "/trading_accounts.html", "category": "main", "priority": "high"},
    {"name": "ביצועים", "url": "/executions.html", "category": "main", "priority": "high"},
    {"name": "ייבוא נתונים", "url": "/data_import.html", "category": "main", "priority": "medium"},
    {"name": "תזרימי מזומן", "url": "/cash_flows.html", "category": "main", "priority": "high"},
    {"name": "הערות", "url": "/notes.html", "category": "main", "priority": "high"},
    {"name": "מחקר", "url": "/research.html", "category": "main", "priority": "medium"},
    {"name": "ניתוח AI", "url": "/ai_analysis.html", "category": "main", "priority": "medium"},
    {"name": "העדפות", "url": "/preferences.html", "category": "main", "priority": "high"},
    {"name": "פרופיל משתמש", "url": "/user_profile.html", "category": "main", "priority": "medium"},
    
    # עמודים טכניים (Technical Pages)
    {"name": "תצוגת בסיס נתונים", "url": "/db_display.html", "category": "technical", "priority": "low"},
    {"name": "נתונים נוספים", "url": "/db_extradata.html", "category": "technical", "priority": "low"},
    {"name": "אילוצי מערכת", "url": "/constraints.html", "category": "technical", "priority": "low"},
    {"name": "משימות רקע", "url": "/background-tasks.html", "category": "technical", "priority": "low"},
    {"name": "ניטור שרת", "url": "/server-monitor.html", "category": "technical", "priority": "low"},
    {"name": "ניהול מערכת", "url": "/system-management.html", "category": "technical", "priority": "low"},
    {"name": "מרכז התראות", "url": "/notifications-center.html", "category": "technical", "priority": "low"},
    {"name": "ניהול CSS", "url": "/css-management.html", "category": "technical", "priority": "low"},
    {"name": "תצוגת צבעים", "url": "/dynamic-colors-display.html", "category": "technical", "priority": "low"},
    {"name": "עיצובים", "url": "/designs.html", "category": "technical", "priority": "low"},
    
    # עמודים משניים (Secondary Pages)
    {"name": "דשבורד נתונים חיצוניים", "url": "/external_data_dashboard.html", "category": "secondary", "priority": "low"},
    {"name": "ניהול גרפים", "url": "/chart_management.html", "category": "secondary", "priority": "low"},
    {"name": "דשבורד בדיקות CRUD", "url": "/crud_testing_dashboard.html", "category": "secondary", "priority": "low"},
    
    # עמודי אימות (Auth Pages)
    {"name": "הרשמה למערכת", "url": "/register.html", "category": "auth", "priority": "medium"},
    {"name": "שחזור סיסמה", "url": "/forgot-password.html", "category": "auth", "priority": "medium"},
    {"name": "איפוס סיסמה", "url": "/reset-password.html", "category": "auth", "priority": "medium"},
    
    # עמודי כלי פיתוח ראשי (Dev Tools Main)
    {"name": "כלי פיתוח ראשי", "url": "/dev_tools", "category": "dev", "priority": "high"},
]

def login(driver, username=TEST_USERNAME, password=TEST_PASSWORD):
    """Login using API token (requests) + sessionStorage injection; fallback to modal if needed."""
    try:
        print("🔐 Logging in as admin via API token (backend request) ...")
        token = None
        user = None
        try:
            api_resp = requests.post(
                f"{BASE_URL}/api/auth/login",
                json={"username": username, "password": password},
                timeout=15,
                allow_redirects=False,
            )
            if api_resp.status_code == 200:
                data = api_resp.json()
                token = data.get("data", {}).get("access_token") or data.get("access_token")
                user = data.get("data", {}).get("user") or data.get("user")
        except Exception as api_err:
            print(f"⚠️  API token login request failed: {api_err}")

        if token:
            driver.get(f"{BASE_URL}/")
            WebDriverWait(driver, 15).until(
                lambda d: d.execute_script('return document.readyState') == 'complete'
            )

            driver.execute_script(
                """
                sessionStorage.setItem('dev_authToken', arguments[0]);
                sessionStorage.setItem('dev_currentUser', JSON.stringify(arguments[1] || {}));
                localStorage.setItem('authToken', arguments[0]);
                localStorage.setItem('currentUser', JSON.stringify(arguments[1] || {}));
                window.authToken = arguments[0];
                window.currentUser = arguments[1] || null;
                """,
                token,
                user or {},
            )

            driver.refresh()
            WebDriverWait(driver, 20).until(
                lambda d: d.execute_script('return document.readyState') == 'complete'
            )

            # Verify token via backend directly (Python requests)
            verify = requests.get(
                f"{BASE_URL}/api/auth/me",
                headers={"Authorization": f"Bearer {token}"},
                timeout=10,
            )
            if verify.status_code == 200 and verify.json().get("status") == "success":
                print("✅ API token login successful")
                return True
            else:
                print(f"⚠️  API token set but backend verify failed: {verify.status_code} {verify.text[:200]}")
        
        # Fallback to modal login if API login failed
        print("⚠️  Falling back to modal login...")
        driver.get(f"{BASE_URL}/")
        time.sleep(2)
        
        # Try to find and click login modal trigger
        try:
            login_trigger = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-action='show-login-modal'], .login-trigger, #loginTrigger"))
            )
            driver.execute_script("arguments[0].click();", login_trigger)
            time.sleep(1)
        except:
            # Modal might already be open or auto-opens
            pass
        
        # Fill login form in modal
        try:
            username_input = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "#loginModal input[name='username'], #loginModal #username, input[name='username']"))
            )
            username_input.clear()
            username_input.send_keys(username)
            
            password_input = driver.find_element(By.CSS_SELECTOR, "#loginModal input[name='password'], #loginModal #password, input[name='password']")
            password_input.clear()
            password_input.send_keys(password)
            
            login_button = driver.find_element(By.CSS_SELECTOR, "#loginModal button[type='submit'], #loginModal #loginButton, button[type='submit']")
            driver.execute_script("arguments[0].click();", login_button)
            
            time.sleep(3)
            return True
        except Exception as modal_err:
            print(f"❌ Modal login failed: {modal_err}")
            return False
        
    except Exception as e:
        print(f"❌ Login failed: {e}")
        return False

def check_preferences_loading(driver, page_url: str, page_name: str) -> Dict[str, Any]:
    """Check if preferences are loaded correctly on a page"""
    result = {
        "page_name": page_name,
        "page_url": page_url,
        "success": False,
        "errors": [],
        "warnings": [],
        "checks": {}
    }
    
    try:
        # Navigate to page
        driver.get(f"{BASE_URL}{page_url}")
        time.sleep(3)  # Wait for page load
        
        # Check 1: PreferencesCore exists
        try:
            preferences_core_exists = driver.execute_script("return typeof window.PreferencesCore !== 'undefined';")
            result["checks"]["preferences_core_exists"] = preferences_core_exists
            if not preferences_core_exists:
                result["warnings"].append("PreferencesCore not found")
        except Exception as e:
            result["errors"].append(f"Error checking PreferencesCore: {e}")
        
        # Check 2: PreferencesCore.initializeWithLazyLoading exists
        try:
            init_method_exists = driver.execute_script(
                "return window.PreferencesCore && typeof window.PreferencesCore.initializeWithLazyLoading === 'function';"
            )
            result["checks"]["init_method_exists"] = init_method_exists
            if not init_method_exists:
                result["warnings"].append("initializeWithLazyLoading method not found")
        except Exception as e:
            result["errors"].append(f"Error checking initializeWithLazyLoading: {e}")
        
        # Check 3: Check if preferences were initialized
        try:
            initialized = driver.execute_script(
                "return window.PreferencesCore && window.PreferencesCore.currentUserId !== undefined;"
            )
            result["checks"]["preferences_initialized"] = initialized
            if not initialized:
                result["warnings"].append("Preferences not initialized")
        except Exception as e:
            result["errors"].append(f"Error checking initialization: {e}")
        
        # Check 4: Check if currentPreferences exists
        try:
            current_prefs_exists = driver.execute_script(
                "return typeof window.currentPreferences !== 'undefined' && window.currentPreferences !== null;"
            )
            result["checks"]["current_preferences_exists"] = current_prefs_exists
            if current_prefs_exists:
                pref_count = driver.execute_script(
                    "return window.currentPreferences ? Object.keys(window.currentPreferences).length : 0;"
                )
                result["checks"]["preferences_count"] = pref_count
            else:
                result["warnings"].append("window.currentPreferences not found")
        except Exception as e:
            result["errors"].append(f"Error checking currentPreferences: {e}")
        
        # Check 5: Try to get a preference value
        try:
            test_pref_value = driver.execute_script(
                """
                if (window.PreferencesCore && typeof window.PreferencesCore.getPreference === 'function') {
                    return window.PreferencesCore.getPreference('atr_period', 1, 0).then(v => v).catch(e => null);
                }
                return null;
                """
            )
            # Wait a bit for async operation
            time.sleep(1)
            # Try synchronous check
            test_pref_sync = driver.execute_script(
                """
                if (window.currentPreferences && window.currentPreferences['atr_period'] !== undefined) {
                    return window.currentPreferences['atr_period'];
                }
                return null;
                """
            )
            result["checks"]["test_preference_available"] = test_pref_sync is not None
            if test_pref_sync is not None:
                result["checks"]["test_preference_value"] = test_pref_sync
            else:
                result["warnings"].append("Test preference 'atr_period' not available")
        except Exception as e:
            result["errors"].append(f"Error checking test preference: {e}")
        
        # Check 6: Check console errors
        try:
            console_errors = driver.get_log('browser')
            js_errors = [log for log in console_errors if log['level'] == 'SEVERE']
            result["checks"]["console_errors_count"] = len(js_errors)
            if js_errors:
                result["warnings"].extend([f"Console error: {err['message']}" for err in js_errors[:5]])
        except Exception as e:
            # Some drivers don't support get_log
            pass
        
        # Determine success
        result["success"] = (
            result["checks"].get("preferences_core_exists", False) and
            result["checks"].get("init_method_exists", False) and
            len(result["errors"]) == 0
        )
        
    except Exception as e:
        result["errors"].append(f"Page load failed: {e}")
        result["success"] = False
    
    return result

def main():
    parser = argparse.ArgumentParser(description='Test preferences loading on all pages')
    parser.add_argument('--pages', nargs='+', help='Specific pages to test (by URL)')
    parser.add_argument('--category', choices=['main', 'technical', 'secondary', 'auth', 'dev', 'all'], 
                       default='all', help='Page category to test')
    parser.add_argument('--priority', choices=['high', 'medium', 'low', 'all'], 
                       default='all', help='Priority level to test')
    parser.add_argument('--output', default='preferences_loading_report.json', 
                       help='Output file for results')
    parser.add_argument('--headless', action='store_true', help='Run in headless mode')
    
    args = parser.parse_args()
    
    # Filter pages
    pages_to_test = ALL_PAGES
    if args.pages:
        pages_to_test = [p for p in ALL_PAGES if p["url"] in args.pages]
    elif args.category != 'all':
        pages_to_test = [p for p in ALL_PAGES if p["category"] == args.category]
    if args.priority != 'all':
        pages_to_test = [p for p in pages_to_test if p["priority"] == args.priority]
    
    print(f"🧪 Testing preferences loading on {len(pages_to_test)} pages...")
    print(f"   Category: {args.category}, Priority: {args.priority}")
    
    # Setup Chrome driver
    chrome_options = Options()
    if args.headless:
        chrome_options.add_argument('--headless')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.set_capability('goog:loggingPrefs', {'browser': 'ALL'})
    
    driver = None
    results = []
    
    try:
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=chrome_options)
        driver.set_page_load_timeout(30)
        
        # Login first
        print("🔐 Logging in...")
        if not login(driver):
            print("❌ Login failed, aborting tests")
            return
        
        print("✅ Login successful")
        
        # Test each page
        for i, page in enumerate(pages_to_test, 1):
            print(f"\n[{i}/{len(pages_to_test)}] Testing: {page['name']} ({page['url']})")
            
            result = check_preferences_loading(driver, page['url'], page['name'])
            results.append(result)
            
            if result["success"]:
                print(f"   ✅ Success")
            else:
                print(f"   ❌ Failed")
                if result["errors"]:
                    for error in result["errors"]:
                        print(f"      Error: {error}")
                if result["warnings"]:
                    for warning in result["warnings"][:3]:
                        print(f"      Warning: {warning}")
            
            # Rate limiting
            if i < len(pages_to_test):
                time.sleep(RATE_LIMIT_CONFIG['min_delay_between_pages'])
        
        # Generate summary
        total = len(results)
        successful = sum(1 for r in results if r["success"])
        failed = total - successful
        
        print(f"\n{'='*60}")
        print(f"📊 Summary")
        print(f"{'='*60}")
        print(f"Total pages tested: {total}")
        print(f"✅ Successful: {successful}")
        print(f"❌ Failed: {failed}")
        print(f"Success rate: {(successful/total*100):.1f}%")
        
        # Save results
        report = {
            "timestamp": datetime.now().isoformat(),
            "summary": {
                "total": total,
                "successful": successful,
                "failed": failed,
                "success_rate": successful/total*100 if total > 0 else 0
            },
            "results": results
        }
        
        with open(args.output, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        print(f"\n📄 Detailed report saved to: {args.output}")
        
        # Show failed pages
        if failed > 0:
            print(f"\n❌ Failed pages:")
            for result in results:
                if not result["success"]:
                    print(f"   - {result['page_name']} ({result['page_url']})")
                    if result["errors"]:
                        for error in result["errors"]:
                            print(f"     Error: {error}")
    
    except Exception as e:
        print(f"❌ Test execution failed: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        if driver:
            driver.quit()

if __name__ == "__main__":
    main()

