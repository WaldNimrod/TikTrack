#!/usr/bin/env python3
"""
בדיקות פונקציונליות לכל עמודי הבדיקה
Functionality tests for all test pages

בדיקות לכל עמוד:
- בדיקת אתחול עמוד (DOMContentLoaded)
- בדיקת פונקציות עיקריות (אם יש)
- בדיקת אינטראקציות (כפתורים, טבלאות, מודלים)
- בדיקת טעינת נתונים (אם יש)
- בדיקת הצגת נתונים בממשק
"""

import json
import time
import subprocess
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional
import requests

try:
    from selenium import webdriver
    from selenium.webdriver.chrome.service import Service
    from selenium.webdriver.chrome.options import Options as ChromeOptions
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.common.exceptions import TimeoutException, WebDriverException
    from webdriver_manager.chrome import ChromeDriverManager
except ImportError:
    print("❌ Error: selenium or webdriver-manager not installed.")
    print("   Install with: pip install selenium webdriver-manager")
    exit(1)

BASE_URL = "http://localhost:8080"
TEST_USERNAME = "admin"
TEST_PASSWORD = "admin123"

# כל 17 עמודי הבדיקה
TEST_PAGES = [
    {"name": "test-header-only.html", "url": "/test-header-only.html", "category": "core_systems"},
    {"name": "test-monitoring.html", "url": "/test-monitoring.html", "category": "core_systems"},
    {"name": "test-frontend-wrappers.html", "url": "/test-frontend-wrappers.html", "category": "integration"},
    {"name": "test-bootstrap-popover-comparison.html", "url": "/test-bootstrap-popover-comparison.html", "category": "ui_components"},
    {"name": "test-quill.html", "url": "/test-quill.html", "category": "ui_components"},
    {"name": "test-nested-modal-rich-text.html", "url": "/test-nested-modal-rich-text.html", "category": "ui_components"},
    {"name": "test-overlay-debug.html", "url": "/test-overlay-debug.html", "category": "debug"},
    {"name": "test-phase1-recovery.html", "url": "/test-phase1-recovery.html", "category": "phases"},
    {"name": "test-phase3-1-comprehensive.html", "url": "/test-phase3-1-comprehensive.html", "category": "phases"},
    {"name": "test-unified-widget.html", "url": "/test-unified-widget.html", "category": "widgets"},
    {"name": "test-unified-widget-comprehensive.html", "url": "/test-unified-widget-comprehensive.html", "category": "widgets"},
    {"name": "test-unified-widget-integration.html", "url": "/test-unified-widget-integration.html", "category": "widgets"},
    {"name": "test-recent-items-widget.html", "url": "/test-recent-items-widget.html", "category": "widgets"},
    {"name": "test-ticker-widgets-performance.html", "url": "/test-ticker-widgets-performance.html", "category": "widgets"},
    {"name": "test-user-ticker-integration.html", "url": "/test-user-ticker-integration.html", "category": "integration"},
    {"name": "conditions-test.html", "url": "/conditions-test.html", "category": "conditions"},
    {"name": "test-user-ticker-frontend.html", "url": "/scripts/test-user-ticker-frontend.html", "category": "integration"},
]

BASE_DIR = Path(__file__).parent.parent.parent
REPORTS_DIR = BASE_DIR / "documentation" / "03-DEVELOPMENT" / "TESTING"


def setup_driver():
    """Setup WebDriver"""
    try:
        chrome_options = ChromeOptions()
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--window-size=1920,1080')
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=chrome_options)
        driver.set_script_timeout(60)
        return driver
    except Exception as e:
        print(f"❌ Error setting up driver: {e}")
        return None


def login(driver):
    """Login as admin"""
    try:
        # Try API token login first
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
                user or {}
            )
            
            driver.refresh()
            WebDriverWait(driver, 20).until(
                lambda d: d.execute_script('return document.readyState') == 'complete'
            )
            time.sleep(2)
            return True
    except Exception as e:
        print(f"⚠️  Login error: {e}")
    return False


def test_page_functionality(driver, page_info):
    """Test functionality of a single page"""
    url = BASE_URL + page_info["url"]
    result = {
        "page": page_info["name"],
        "url": page_info["url"],
        "category": page_info["category"],
        "success": False,
        "load_time": None,
        "dom_ready": False,
        "functions_available": {},
        "interactions": {},
        "data_loading": {},
        "data_display": {},
        "errors": [],
        "timestamp": datetime.now().isoformat()
    }
    
    try:
        # Navigate to page
        start_time = time.time()
        driver.get(url)
        
        # Wait for DOM ready
        try:
            WebDriverWait(driver, 10).until(
                lambda d: d.execute_script('return document.readyState') == 'complete')
            result["dom_ready"] = True
        except TimeoutException:
            result["errors"].append("DOM ready timeout")
        
        result["load_time"] = time.time() - start_time
        
        # Wait for JavaScript execution
        time.sleep(2)
        
        # Check page initialization
        try:
            init_check = driver.execute_script("""
                return {
                    domContentLoaded: document.readyState === 'complete',
                    windowLoaded: typeof window.onload !== 'undefined' || window.performance.timing.loadEventEnd > 0,
                    hasContent: document.body && document.body.children.length > 0
                };
            """)
            result["initialization"] = init_check
        except Exception as e:
            result["errors"].append(f"Initialization check error: {e}")
        
        # Check for main functions (page-specific)
        try:
            functions_check = driver.execute_script("""
                // Check for common test page functions
                return {
                    hasTestFunctions: typeof window.runAllTests === 'function' || 
                                     typeof window.testQuill === 'function' ||
                                     typeof window.loadTestData === 'function' ||
                                     typeof window.testNotification === 'function',
                    hasWidgetFunctions: typeof window.UnifiedPendingActionsWidget !== 'undefined' ||
                                       typeof window.RecentItemsWidget !== 'undefined',
                    hasSystemFunctions: typeof window.HeaderSystem !== 'undefined' ||
                                       typeof window.Logger !== 'undefined'
                };
            """)
            result["functions_available"] = functions_check
        except Exception as e:
            result["errors"].append(f"Functions check error: {e}")
        
        # Check for interactive elements
        try:
            interactions_check = driver.execute_script("""
                const buttons = document.querySelectorAll('button, [role="button"], .btn');
                const modals = document.querySelectorAll('[data-bs-toggle="modal"], .modal');
                const tabs = document.querySelectorAll('[data-bs-toggle="tab"], .nav-tabs');
                const tables = document.querySelectorAll('table');
                
                return {
                    buttons_count: buttons.length,
                    modals_count: modals.length,
                    tabs_count: tabs.length,
                    tables_count: tables.length,
                    hasClickableElements: buttons.length > 0 || 
                                        document.querySelectorAll('a[href]').length > 0
                };
            """)
            result["interactions"] = interactions_check
        except Exception as e:
            result["errors"].append(f"Interactions check error: {e}")
        
        # Check data loading (if applicable)
        try:
            data_check = driver.execute_script("""
                // Check for data loading indicators
                const loadingElements = document.querySelectorAll('.spinner, .loading, [data-loading]');
                const errorElements = document.querySelectorAll('.alert-danger, .error-message');
                const emptyElements = document.querySelectorAll('.empty-state, [data-empty]');
                
                return {
                    loading_indicators: loadingElements.length,
                    error_indicators: errorElements.length,
                    empty_indicators: emptyElements.length,
                    hasDataContainers: document.querySelectorAll('[id*="widget"], [id*="list"], [id*="table"]').length > 0
                };
            """)
            result["data_loading"] = data_check
        except Exception as e:
            result["errors"].append(f"Data loading check error: {e}")
        
        # Check data display
        try:
            display_check = driver.execute_script("""
                const tables = document.querySelectorAll('table');
                const lists = document.querySelectorAll('ul, ol');
                const cards = document.querySelectorAll('.card, [class*="card"]');
                
                return {
                    tables_with_data: Array.from(tables).filter(t => t.querySelectorAll('tbody tr').length > 0).length,
                    lists_with_items: Array.from(lists).filter(l => l.querySelectorAll('li').length > 0).length,
                    cards_count: cards.length,
                    hasVisibleContent: document.body.textContent.trim().length > 100
                };
            """)
            result["data_display"] = display_check
        except Exception as e:
            result["errors"].append(f"Data display check error: {e}")
        
        result["success"] = len(result["errors"]) == 0
        
    except Exception as e:
        result["errors"].append(f"Page test error: {e}")
        result["success"] = False
    
    return result


def test_all_pages():
    """Test all test pages"""
    driver = setup_driver()
    if not driver:
        print("❌ Failed to setup driver")
        return None
    
    try:
        # Login first
        print("🔐 Logging in...")
        if not login(driver):
            print("⚠️  Login failed, continuing anyway...")
        
        results = {
            "timestamp": datetime.now().isoformat(),
            "total_pages": len(TEST_PAGES),
            "pages_tested": 0,
            "pages_passed": 0,
            "pages_failed": 0,
            "pages": {}
        }
        
        for page_info in TEST_PAGES:
            print(f"\n📄 Testing: {page_info['name']}...")
            result = test_page_functionality(driver, page_info)
            results["pages_tested"] += 1
            if result["success"]:
                results["pages_passed"] += 1
            else:
                results["pages_failed"] += 1
            results["pages"][page_info["name"]] = result
        
        return results
    
    finally:
        driver.quit()


def generate_report(results):
    """Generate text report"""
    report = []
    report.append("# דוח בדיקות פונקציונליות - כל עמודי הבדיקה\n")
    report.append(f"**תאריך:** {results['timestamp']}\n")
    report.append(f"**סה\"כ עמודים:** {results['total_pages']}\n")
    report.append(f"**עמודים שנבדקו:** {results['pages_tested']}\n")
    report.append(f"**עמודים עברו:** {results['pages_passed']}\n")
    report.append(f"**עמודים נכשלו:** {results['pages_failed']}\n\n")
    
    report.append("## פירוט לפי עמוד\n\n")
    
    for page_name, result in results["pages"].items():
        report.append(f"### {page_name}\n")
        report.append(f"**URL:** {result['url']}\n")
        report.append(f"**קטגוריה:** {result['category']}\n")
        
        if result["success"]:
            report.append("✅ **עבר**\n\n")
        else:
            report.append("❌ **נכשל**\n\n")
        
        report.append(f"**זמן טעינה:** {result['load_time']:.2f}s\n")
        report.append(f"**DOM Ready:** {'✅' if result['dom_ready'] else '❌'}\n\n")
        
        if result.get("errors"):
            report.append("**שגיאות:**\n")
            for error in result["errors"]:
                report.append(f"- ❌ {error}\n")
            report.append("\n")
        
        report.append("---\n\n")
    
    return "".join(report)


def main():
    """Main function"""
    print("=" * 60)
    print("בדיקות פונקציונליות - כל עמודי הבדיקה")
    print("=" * 60)
    print()
    
    results = test_all_pages()
    if not results:
        return
    
    # Save JSON results
    json_path = REPORTS_DIR / "test_pages_functionality_results.json"
    json_path.parent.mkdir(parents=True, exist_ok=True)
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    print(f"\n✅ תוצאות JSON נשמרו ל: {json_path}")
    
    # Generate report
    report = generate_report(results)
    report_path = REPORTS_DIR / "TEST_PAGES_FUNCTIONALITY_REPORT.md"
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(report)
    print(f"✅ דוח נשמר ל: {report_path}")
    
    # Print summary
    print()
    print("=" * 60)
    print("סיכום בדיקות")
    print("=" * 60)
    print(f"עמודים שנבדקו: {results['pages_tested']}/{results['total_pages']}")
    print(f"עמודים עברו: {results['pages_passed']}")
    print(f"עמודים נכשלו: {results['pages_failed']}")


if __name__ == "__main__":
    main()

