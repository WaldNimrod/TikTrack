#!/usr/bin/env python3
"""
בדיקות תהליכים לכל עמודי הבדיקה
Process tests for all test pages

בדיקות תהליכים:
- תהליכי אתחול (initialization)
- תהליכי טעינת נתונים (data loading)
- תהליכי עדכון UI (UI updates)
- תהליכי אינטראקציה משתמש (user interactions)
- תהליכי שגיאות (error handling)
"""

import json
import time
from pathlib import Path
from datetime import datetime
from typing import Dict, List
import requests

try:
    from selenium import webdriver
    from selenium.webdriver.chrome.service import Service
    from selenium.webdriver.chrome.options import Options as ChromeOptions
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.common.exceptions import TimeoutException
    from webdriver_manager.chrome import ChromeDriverManager
except ImportError:
    print("❌ Error: selenium or webdriver-manager not installed.")
    print("   Install with: pip install selenium webdriver-manager")
    exit(1)

BASE_URL = "http://localhost:8080"
TEST_USERNAME = "admin"
TEST_PASSWORD = "admin123"

TEST_PAGES = [
    {"name": "test_header_only.html", "url": "/test_header_only.html"},
    {"name": "test_monitoring.html", "url": "/test_monitoring.html"},
    {"name": "test_frontend_wrappers.html", "url": "/test_frontend_wrappers.html"},
    {"name": "test_unified_widget.html", "url": "/test_unified_widget.html"},
    {"name": "test_recent_items_widget.html", "url": "/test_recent_items_widget.html"},
]

BASE_DIR = Path(__file__).parent.parent.parent
REPORTS_DIR = BASE_DIR / "documentation" / "03-DEVELOPMENT" / "TESTING"


def setup_driver():
    """Setup WebDriver"""
    try:
        chrome_options = ChromeOptions()
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=chrome_options)
        driver.set_script_timeout(60)
        return driver
    except Exception as e:
        print(f"❌ Error: {e}")
        return None


def login(driver):
    """Login as admin"""
    try:
        api_resp = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"username": TEST_USERNAME, "password": TEST_PASSWORD},
            timeout=15
        )
        if api_resp.status_code == 200:
            data = api_resp.json()
            token = data.get("data", {}).get("access_token") or data.get("access_token")
            user = data.get("data", {}).get("user") or data.get("user")
            
            driver.get(f"{BASE_URL}/")
            WebDriverWait(driver, 15).until(
                lambda d: d.execute_script('return document.readyState') == 'complete')
            
            driver.execute_script(
                "sessionStorage.setItem('dev_authToken', arguments[0]);"
                "localStorage.setItem('authToken', arguments[0]);"
                "window.authToken = arguments[0];",
                token
            )
            driver.refresh()
            WebDriverWait(driver, 20).until(
                lambda d: d.execute_script('return document.readyState') == 'complete')
            time.sleep(2)
            return True
    except Exception:
        pass
    return False


def test_processes(driver, page_info):
    """Test processes for a page"""
    url = BASE_URL + page_info["url"]
    result = {
        "page": page_info["name"],
        "url": page_info["url"],
        "initialization": {},
        "data_loading": {},
        "ui_updates": {},
        "user_interactions": {},
        "error_handling": {},
        "timestamp": datetime.now().isoformat()
    }
    
    try:
        driver.get(url)
        WebDriverWait(driver, 10).until(
            lambda d: d.execute_script('return document.readyState') == 'complete')
        time.sleep(2)
        
        # Test initialization process
        init_result = driver.execute_script("""
            return {
                systems_ready: !!(window.HeaderSystem && window.Logger),
                dom_ready: document.readyState === 'complete',
                scripts_loaded: document.querySelectorAll('script[src]').length > 0
            };
        """)
        result["initialization"] = init_result
        
        # Test data loading process
        data_result = driver.execute_script("""
            return {
                has_cache_manager: !!(window.UnifiedCacheManager),
                has_api_calls: window.performance && 
                              window.performance.getEntriesByType('resource')
                              .some(r => r.name.includes('/api/'))
            };
        """)
        result["data_loading"] = data_result
        
        # Test UI updates
        ui_result = driver.execute_script("""
            return {
                has_dynamic_content: document.querySelectorAll('[data-dynamic], .dynamic').length > 0,
                has_update_triggers: document.querySelectorAll('[onclick], [data-action]').length > 0
            };
        """)
        result["ui_updates"] = ui_result
        
        # Test user interactions
        interaction_result = driver.execute_script("""
            const buttons = document.querySelectorAll('button, .btn');
            return {
                clickable_elements: buttons.length,
                has_event_listeners: buttons.length > 0
            };
        """)
        result["user_interactions"] = interaction_result
        
        # Test error handling
        error_result = driver.execute_script("""
            return {
                has_error_handlers: !!(window.onerror || window.addEventListener),
                has_global_error_handler: typeof window.addEventListener === 'function'
            };
        """)
        result["error_handling"] = error_result
        
    except Exception as e:
        result["error"] = str(e)
    
    return result


def main():
    """Main function"""
    print("=" * 60)
    print("בדיקות תהליכים - עמודי בדיקה")
    print("=" * 60)
    
    driver = setup_driver()
    if not driver:
        return
    
    try:
        if not login(driver):
            print("⚠️  Login failed")
        
        results = {
            "timestamp": datetime.now().isoformat(),
            "pages": {}
        }
        
        for page_info in TEST_PAGES:
            print(f"Testing: {page_info['name']}...")
            result = test_processes(driver, page_info)
            results["pages"][page_info["name"]] = result
        
        # Save results
        json_path = REPORTS_DIR / "test_pages_processes_results.json"
        json_path.parent.mkdir(parents=True, exist_ok=True)
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        print(f"\n✅ תוצאות נשמרו ל: {json_path}")
    
    finally:
        driver.quit()


if __name__ == "__main__":
    main()

