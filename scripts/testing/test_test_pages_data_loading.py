#!/usr/bin/env python3
"""
בדיקת טעינת נתונים לכל עמודי הבדיקה
Data loading tests for all test pages

בדיקות:
- קריאות API (אם יש)
- שימוש ב-UnifiedCacheManager (אם יש)
- טעינת נתונים מטבלאות (אם יש)
- טעינת נתונים מווידג'טים (אם יש)
- בדיקת שגיאות טעינה
"""

import json
import time
from pathlib import Path
from datetime import datetime
from typing import Dict
import requests

try:
    from selenium import webdriver
    from selenium.webdriver.chrome.service import Service
    from selenium.webdriver.chrome.options import Options as ChromeOptions
    from selenium.webdriver.support.ui import WebDriverWait
    from webdriver_manager.chrome import ChromeDriverManager
except ImportError:
    print("❌ Error: selenium or webdriver-manager not installed.")
    exit(1)

BASE_URL = "http://localhost:8080"
TEST_USERNAME = "admin"
TEST_PASSWORD = "admin123"

TEST_PAGES = [
    {"name": "test-header-only.html", "url": "/test-header-only.html"},
    {"name": "test-unified-widget.html", "url": "/test-unified-widget.html"},
    {"name": "test-recent-items-widget.html", "url": "/test-recent-items-widget.html"},
]

BASE_DIR = Path(__file__).parent.parent.parent
REPORTS_DIR = BASE_DIR / "documentation" / "03-DEVELOPMENT" / "TESTING"


def setup_driver():
    """Setup WebDriver"""
    try:
        chrome_options = ChromeOptions()
        chrome_options.add_argument('--no-sandbox')
        service = Service(ChromeDriverManager().install())
        return webdriver.Chrome(service=service, options=chrome_options)
    except Exception:
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
            token = api_resp.json().get("data", {}).get("access_token")
            driver.get(f"{BASE_URL}/")
            WebDriverWait(driver, 15).until(
                lambda d: d.execute_script('return document.readyState') == 'complete')
            driver.execute_script("sessionStorage.setItem('dev_authToken', arguments[0]);", token)
            driver.refresh()
            time.sleep(2)
            return True
    except Exception:
        pass
    return False


def test_data_loading(driver, page_info):
    """Test data loading for a page"""
    url = BASE_URL + page_info["url"]
    result = {
        "page": page_info["name"],
        "api_calls": [],
        "cache_usage": {},
        "table_loading": {},
        "widget_loading": {},
        "loading_errors": [],
        "timestamp": datetime.now().isoformat()
    }
    
    try:
        driver.get(url)
        WebDriverWait(driver, 10).until(
            lambda d: d.execute_script('return document.readyState') == 'complete')
        time.sleep(3)
        
        # Check API calls
        api_result = driver.execute_script("""
            if (!window.performance) return [];
            const resources = window.performance.getEntriesByType('resource');
            return resources
                .filter(r => r.name.includes('/api/'))
                .map(r => ({url: r.name, duration: r.duration}));
        """)
        result["api_calls"] = api_result
        
        # Check cache usage
        cache_result = driver.execute_script("""
            return {
                has_cache_manager: !!(window.UnifiedCacheManager),
                cache_available: !!(window.UnifiedCacheManager && 
                                   typeof window.UnifiedCacheManager.get === 'function')
            };
        """)
        result["cache_usage"] = cache_result
        
        # Check table loading
        table_result = driver.execute_script("""
            const tables = document.querySelectorAll('table');
            return {
                tables_count: tables.length,
                tables_with_data: Array.from(tables).filter(t => 
                    t.querySelectorAll('tbody tr').length > 0).length
            };
        """)
        result["table_loading"] = table_result
        
        # Check widget loading
        widget_result = driver.execute_script("""
            return {
                has_widgets: document.querySelectorAll('[id*="widget"], [class*="widget"]').length > 0,
                widgets_visible: document.querySelectorAll('[id*="widget"]:not([style*="display: none"])').length > 0
            };
        """)
        result["widget_loading"] = widget_result
        
    except Exception as e:
        result["loading_errors"].append(str(e))
    
    return result


def main():
    """Main function"""
    print("=" * 60)
    print("בדיקת טעינת נתונים")
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
            result = test_data_loading(driver, page_info)
            results["pages"][page_info["name"]] = result
        
        json_path = REPORTS_DIR / "test_pages_data_loading_results.json"
        json_path.parent.mkdir(parents=True, exist_ok=True)
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        print(f"\n✅ תוצאות נשמרו ל: {json_path}")
    
    finally:
        driver.quit()


if __name__ == "__main__":
    main()

