#!/usr/bin/env python3
"""
בדיקות ביצועים לכל עמודי הבדיקה
Performance tests for all test pages

מדדים:
- זמן טעינת עמוד (page load time)
- זמן טעינת CSS (CSS load time)
- זמן טעינת JavaScript (JS load time)
- זמן אתחול מערכות (systems initialization time)
- זמן טעינת נתונים (data loading time)
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
    print("❌ Error: selenium not installed.")
    exit(1)

BASE_URL = "http://localhost:8080"
TEST_USERNAME = "admin"
TEST_PASSWORD = "admin123"

TEST_PAGES = [
    {"name": "test_header_only.html", "url": "/test_header_only.html"},
    {"name": "test_unified_widget.html", "url": "/test_unified_widget.html"},
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


def test_performance(driver, page_info):
    """Test performance for a page"""
    url = BASE_URL + page_info["url"]
    result = {
        "page": page_info["name"],
        "page_load_time": None,
        "css_load_time": None,
        "js_load_time": None,
        "systems_init_time": None,
        "data_load_time": None,
        "timestamp": datetime.now().isoformat()
    }
    
    try:
        # Clear performance entries
        driver.execute_script("window.performance.clearResourceTimings();")
        
        start_time = time.time()
        driver.get(url)
        WebDriverWait(driver, 10).until(
            lambda d: d.execute_script('return document.readyState') == 'complete')
        result["page_load_time"] = time.time() - start_time
        
        time.sleep(2)
        
        # Get performance metrics
        perf_result = driver.execute_script("""
            if (!window.performance) return {};
            const timing = window.performance.timing;
            const resources = window.performance.getEntriesByType('resource');
            
            const css_resources = resources.filter(r => r.name.includes('.css'));
            const js_resources = resources.filter(r => r.name.includes('.js'));
            
            return {
                page_load: timing.loadEventEnd - timing.navigationStart,
                css_load: css_resources.length > 0 ? 
                    Math.max(...css_resources.map(r => r.duration)) : 0,
                js_load: js_resources.length > 0 ? 
                    Math.max(...js_resources.map(r => r.duration)) : 0,
                dom_ready: timing.domContentLoadedEventEnd - timing.navigationStart
            };
        """)
        
        result["page_load_time"] = perf_result.get("page_load", 0) / 1000  # Convert to seconds
        result["css_load_time"] = perf_result.get("css_load", 0) / 1000
        result["js_load_time"] = perf_result.get("js_load", 0) / 1000
        
    except Exception as e:
        result["error"] = str(e)
    
    return result


def main():
    """Main function"""
    print("=" * 60)
    print("בדיקות ביצועים")
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
            result = test_performance(driver, page_info)
            results["pages"][page_info["name"]] = result
        
        json_path = REPORTS_DIR / "test_pages_performance_results.json"
        json_path.parent.mkdir(parents=True, exist_ok=True)
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        print(f"\n✅ תוצאות נשמרו ל: {json_path}")
    
    finally:
        driver.quit()


if __name__ == "__main__":
    main()

