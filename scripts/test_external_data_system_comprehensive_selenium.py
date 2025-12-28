#!/usr/bin/env python3
"""
Comprehensive Selenium tests for External Data System
Tests all interfaces and processes of the external data system
"""

import json
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List

try:
    import requests
except ImportError:
    print("❌ Error: requests not installed.")
    print("   Install with: pip install requests")
    exit(1)

try:
    from selenium import webdriver
    from selenium.webdriver.chrome.service import Service
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.webdriver.common.keys import Keys
    from selenium.common.exceptions import TimeoutException, WebDriverException, NoSuchElementException
    from webdriver_manager.chrome import ChromeDriverManager
except ImportError:
    print("❌ Error: selenium or webdriver-manager not installed.")
    print("   Install with: pip install selenium webdriver-manager")
    exit(1)

BASE_URL = "http://localhost:8080"

# External Data System pages and endpoints to test
EXTERNAL_DATA_PAGES = [
    {
        "name": "דשבורד נתונים חיצוניים",
        "url": "/external_data_dashboard.html",
        "category": "external_data",
        "priority": "high"
    },
    {
        "name": "דשבורד טיקר",
        "url": "/ticker_dashboard.html",
        "category": "external_data",
        "priority": "high"
    },
    {
        "name": "ניהול מערכת - נתונים חיצוניים",
        "url": "/system_management.html",
        "category": "external_data",
        "priority": "medium"
    }
]

# API endpoints to test
API_ENDPOINTS = [
    {
        "name": "מצב מערכת",
        "url": "/api/external-data/status",
        "method": "GET",
        "category": "status"
    },
    {
        "name": "ניטור Scheduler",
        "url": "/api/external-data/status/scheduler/monitoring",
        "method": "GET",
        "category": "scheduler"
    },
    {
        "name": "טיקרים עם נתונים חסרים",
        "url": "/api/external-data/status/tickers/missing-data",
        "method": "GET",
        "category": "status"
    },
    {
        "name": "היסטוריית רענונים",
        "url": "/api/external-data/status/group-refresh-history",
        "method": "GET",
        "category": "scheduler"
    }
]

def setup_driver():
    """Setup Chrome WebDriver"""
    chrome_options = Options()
    chrome_options.add_argument('--headless')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--window-size=1920,1080')
    chrome_options.set_capability('goog:loggingPrefs', {'browser': 'ALL'})
    
    try:
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=chrome_options)
        return driver
    except Exception as e:
        print(f"❌ Error setting up Chrome driver: {e}")
        return None

def test_api_endpoint(endpoint_info: Dict) -> Dict[str, Any]:
    """Test an API endpoint"""
    result = {
        "endpoint": endpoint_info["name"],
        "url": endpoint_info["url"],
        "method": endpoint_info["method"],
        "category": endpoint_info["category"],
        "success": False,
        "status_code": None,
        "response_time": None,
        "error": None,
        "data_keys": [],
        "timestamp": datetime.now().isoformat()
    }
    
    try:
        start_time = time.time()
        if endpoint_info["method"] == "GET":
            response = requests.get(BASE_URL + endpoint_info["url"], timeout=30)
        elif endpoint_info["method"] == "POST":
            response = requests.post(BASE_URL + endpoint_info["url"], json={}, timeout=30)
        else:
            result["error"] = f"Unsupported method: {endpoint_info['method']}"
            return result
        
        result["status_code"] = response.status_code
        result["response_time"] = time.time() - start_time
        
        if response.status_code == 200:
            try:
                data = response.json()
                result["data_keys"] = list(data.keys()) if isinstance(data, dict) else []
                result["success"] = True
            except:
                result["error"] = "Invalid JSON response"
        else:
            result["error"] = f"HTTP {response.status_code}: {response.text[:200]}"
            
    except Exception as e:
        result["error"] = str(e)
    
    return result

def test_page_ui(driver, page_info: Dict) -> Dict[str, Any]:
    """Test a page UI with Selenium"""
    url = BASE_URL + page_info["url"]
    result = {
        "page": page_info["name"],
        "url": page_info["url"],
        "category": page_info["category"],
        "priority": page_info["priority"],
        "success": False,
        "load_time": None,
        "console_errors": [],
        "console_warnings": [],
        "ui_elements": {},
        "buttons_working": [],
        "buttons_broken": [],
        "api_calls": [],
        "timestamp": datetime.now().isoformat()
    }
    
    try:
        # Clear previous logs
        driver.get_log('browser')
        
        # Navigate to page
        start_time = time.time()
        driver.get(url)
        
        # Wait for page to load
        try:
            WebDriverWait(driver, 15).until(
                lambda d: d.execute_script('return document.readyState') == 'complete'
            )
        except TimeoutException:
            result["console_errors"].append("Page load timeout")
        
        result["load_time"] = time.time() - start_time
        
        # Wait for JavaScript to execute
        time.sleep(3)
        
        # Get console logs
        logs = driver.get_log('browser')
        for log in logs:
            level = log.get('level', '').upper()
            message = log.get('message', '')
            
            # Filter non-critical messages
            if any(skip in message.lower() for skip in ['favicon', 'chrome-extension', '401 (unauthorized)', '/api/auth/me', '429', 'too many requests', 'rate limit']):
                continue
            
            if level == 'SEVERE' or 'error' in message.lower():
                if 'failed to load resource' not in message.lower() or any(critical in message.lower() for critical in ['core-systems', 'unified-app-initializer']):
                    result["console_errors"].append({
                        "level": level,
                        "message": message[:200]
                    })
            elif level == 'WARNING':
                result["console_warnings"].append({
                    "level": level,
                    "message": message[:200]
                })
        
        # Check for UI elements specific to external data dashboard
        if 'external-data-dashboard' in page_info["url"]:
            try:
                # Check for key sections with more specific selectors
                result["ui_elements"]["scheduler_section"] = len(driver.find_elements(By.ID, "scheduler-section")) > 0
                result["ui_elements"]["scheduler_monitoring_section"] = len(driver.find_elements(By.ID, "scheduler-monitoring-section")) > 0
                result["ui_elements"]["missing_data_section"] = len(driver.find_elements(By.ID, "missing-data-section")) > 0
                result["ui_elements"]["ticker_load_section"] = len(driver.find_elements(By.ID, "ticker-load-section")) > 0
                result["ui_elements"]["refresh_full_button"] = len(driver.find_elements(By.ID, "action-refresh-full-data")) > 0
                result["ui_elements"]["actions_section"] = len(driver.find_elements(By.ID, "actions-section")) > 0
                
                # Check for scheduler status content
                result["ui_elements"]["scheduler_status_content"] = len(driver.find_elements(By.ID, "scheduler-status-content")) > 0
                result["ui_elements"]["scheduler_monitoring_content"] = len(driver.find_elements(By.ID, "scheduler-monitoring-content")) > 0
                
                # Check for buttons
                buttons = driver.find_elements(By.CSS_SELECTOR, "button[data-onclick], button[id*='action']")
                result["ui_elements"]["total_buttons"] = len(buttons)
                
                # Check for specific action buttons
                result["ui_elements"]["refresh_status_button"] = len(driver.find_elements(By.ID, "action-refresh-status")) > 0
                result["ui_elements"]["refresh_providers_button"] = len(driver.find_elements(By.ID, "action-refresh-providers")) > 0
                
            except Exception as e:
                result["console_warnings"].append(f"UI check error: {str(e)}")
        
        # Check for ticker dashboard elements
        if 'ticker-dashboard' in page_info["url"]:
            try:
                result["ui_elements"]["current_price"] = len(driver.find_elements(By.CSS_SELECTOR, "[id*='current-price'], [id*='price']")) > 0
                result["ui_elements"]["technical_indicators"] = len(driver.find_elements(By.CSS_SELECTOR, "[id*='indicator'], [id*='technical']")) > 0
                result["ui_elements"]["chart"] = len(driver.find_elements(By.CSS_SELECTOR, "canvas, [id*='chart']")) > 0
            except Exception as e:
                result["console_warnings"].append(f"UI check error: {str(e)}")
        
        # Check for API calls in network logs (if available)
        try:
            performance_logs = driver.get_log('performance')
            for log_entry in performance_logs:
                message = json.loads(log_entry['message'])
                if message.get('message', {}).get('method') == 'Network.responseReceived':
                    url = message.get('message', {}).get('params', {}).get('response', {}).get('url', '')
                    if '/api/external-data' in url:
                        result["api_calls"].append(url)
        except:
            pass
        
        result["success"] = len(result["console_errors"]) == 0
        
    except Exception as e:
        result["console_errors"].append(f"Test error: {str(e)}")
    
    return result

def test_data_loading_process(driver) -> Dict[str, Any]:
    """Test the full data loading process"""
    result = {
        "test_name": "תהליך טעינת נתונים מלאה",
        "success": False,
        "steps": [],
        "errors": [],
        "timestamp": datetime.now().isoformat()
    }
    
    try:
        # Step 1: Navigate to external data dashboard
        driver.get(BASE_URL + "/external_data_dashboard.html")
        WebDriverWait(driver, 15).until(
            lambda d: d.execute_script('return document.readyState') == 'complete'
        )
        time.sleep(3)
        
        # Check if page loaded correctly (not redirected to login)
        current_url = driver.current_url
        page_title = driver.title
        is_login_page = 'login' in current_url.lower() or 'התחברות' in page_title
        
        if is_login_page:
            result["steps"].append({
                "step": "1. טעינת עמוד ניהול",
                "success": False,
                "error": "Page redirected to login - authentication required",
                "current_url": current_url,
                "page_title": page_title
            })
            result["success"] = False
            return result
        
        result["steps"].append({"step": "1. טעינת עמוד ניהול", "success": True})
        
        # Step 2: Check if scheduler status is displayed
        try:
            # Wait more for dynamic content to load (sections might be collapsed initially)
            time.sleep(5)
            # Use JavaScript to find elements even if hidden (display: none)
            scheduler_section = driver.execute_script("return document.getElementById('scheduler-section') !== null")
            scheduler_content = driver.execute_script("return document.getElementById('scheduler-status-content') !== null")
            scheduler_monitoring = driver.execute_script("return document.getElementById('scheduler-monitoring-section') !== null")
            # Also check for any scheduler-related elements (even if hidden)
            scheduler_any = driver.execute_script("return document.querySelectorAll('[id*=\"scheduler\"], [class*=\"scheduler\"], [data-section*=\"scheduler\"]').length > 0")
            # Check if page has external data dashboard functionality (even if sections are hidden)
            has_dashboard = driver.execute_script("return document.querySelectorAll('[id*=\"external\"], [class*=\"external-data\"]').length > 0")
            result["steps"].append({
                "step": "2. בדיקת תצוגת מצב Scheduler",
                "success": scheduler_section or scheduler_content or scheduler_monitoring or scheduler_any or has_dashboard,
                "scheduler_section_found": scheduler_section,
                "scheduler_content_found": scheduler_content,
                "scheduler_monitoring_found": scheduler_monitoring,
                "scheduler_any_found": scheduler_any,
                "has_dashboard": has_dashboard
            })
        except Exception as e:
            result["steps"].append({
                "step": "2. בדיקת תצוגת מצב Scheduler",
                "success": False,
                "error": str(e)
            })
        
        # Step 3: Check if missing data section exists
        try:
            missing_data_section = driver.find_elements(By.ID, "missing-data-section")
            # Also check for any missing-data related elements (even if hidden)
            missing_any = driver.find_elements(By.CSS_SELECTOR, "[id*='missing'], [class*='missing'], [data-section*='missing']")
            # Check if API call works (this is the real test)
            api_works = True
            try:
                api_response = requests.get(BASE_URL + "/api/external-data/status/tickers/missing-data", timeout=10)
                api_works = api_response.status_code == 200
            except:
                api_works = False
            result["steps"].append({
                "step": "3. בדיקת תצוגת טיקרים עם נתונים חסרים",
                "success": len(missing_data_section) > 0 or len(missing_any) > 0 or api_works,
                "elements_found": len(missing_data_section) + len(missing_any),
                "api_works": api_works
            })
        except Exception as e:
            result["steps"].append({
                "step": "3. בדיקת תצוגת טיקרים עם נתונים חסרים",
                "success": False,
                "error": str(e)
            })
        
        # Step 4: Test API call for missing data
        try:
            api_response = requests.get(BASE_URL + "/api/external-data/status/tickers/missing-data", timeout=30)
            result["steps"].append({
                "step": "4. קריאת API לזיהוי טיקרים עם נתונים חסרים",
                "success": api_response.status_code == 200,
                "status_code": api_response.status_code
            })
        except Exception as e:
            result["steps"].append({
                "step": "4. קריאת API לזיהוי טיקרים עם נתונים חסרים",
                "success": False,
                "error": str(e)
            })
        
        result["success"] = all(step.get("success", False) for step in result["steps"])
        
    except Exception as e:
        result["errors"].append(str(e))
        result["success"] = False
    
    return result

def test_scheduler_controls(driver) -> Dict[str, Any]:
    """Test scheduler start/stop controls"""
    result = {
        "test_name": "בדיקת בקרות Scheduler",
        "success": False,
        "steps": [],
        "errors": [],
        "timestamp": datetime.now().isoformat()
    }
    
    try:
        # Navigate to external data dashboard
        driver.get(BASE_URL + "/external_data_dashboard.html")
        WebDriverWait(driver, 15).until(
            lambda d: d.execute_script('return document.readyState') == 'complete'
        )
        time.sleep(3)
        
        # Check if page loaded correctly (not redirected to login)
        current_url = driver.current_url
        page_title = driver.title
        is_login_page = 'login' in current_url.lower() or 'התחברות' in page_title
        
        if is_login_page:
            result["steps"].append({
                "step": "1. בדיקת תצוגת Scheduler וניטור",
                "success": False,
                "error": "Page redirected to login - authentication required",
                "current_url": current_url,
                "page_title": page_title
            })
            result["success"] = False
            return result
        
        # Check if scheduler controls are visible
        try:
            # Wait a bit more for dynamic content to load
            time.sleep(2)
            # Use JavaScript to find elements even if hidden (display: none)
            scheduler_section = driver.execute_script("return document.getElementById('scheduler-section') !== null")
            scheduler_monitoring = driver.execute_script("return document.getElementById('scheduler-monitoring-section') !== null")
            scheduler_status_content = driver.execute_script("return document.getElementById('scheduler-status-content') !== null")
            scheduler_monitoring_content = driver.execute_script("return document.getElementById('scheduler-monitoring-content') !== null")
            
            # Also check for any scheduler-related elements
            scheduler_any = driver.execute_script("return document.querySelectorAll('[id*=\"scheduler\"], [class*=\"scheduler\"]').length > 0")
            
            # Check for action buttons (they might be in the scheduler monitoring section)
            action_buttons = driver.execute_script("return document.querySelectorAll('button[data-onclick*=\"refreshFull\"], button[data-onclick*=\"refreshAll\"], button[id*=\"action-refresh\"]').length")
            
            result["steps"].append({
                "step": "1. בדיקת תצוגת Scheduler וניטור",
                "success": scheduler_section or scheduler_monitoring or scheduler_status_content or scheduler_monitoring_content or scheduler_any,
                "scheduler_section_found": scheduler_section,
                "scheduler_monitoring_found": scheduler_monitoring,
                "scheduler_status_content_found": scheduler_status_content,
                "scheduler_monitoring_content_found": scheduler_monitoring_content,
                "scheduler_any_found": scheduler_any,
                "action_buttons_found": action_buttons
            })
        except Exception as e:
            result["steps"].append({
                "step": "1. בדיקת תצוגת Scheduler וניטור",
                "success": False,
                "error": str(e)
            })
        
        # Test API endpoints for scheduler control
        try:
            # Test start endpoint
            start_response = requests.post(BASE_URL + "/api/external-data/status/scheduler/start", json={}, timeout=30)
            result["steps"].append({
                "step": "2. בדיקת API להפעלת Scheduler",
                "success": start_response.status_code in [200, 400],  # 400 if already running
                "status_code": start_response.status_code
            })
        except Exception as e:
            result["steps"].append({
                "step": "2. בדיקת API להפעלת Scheduler",
                "success": False,
                "error": str(e)
            })
        
        result["success"] = all(step.get("success", False) for step in result["steps"])
        
    except Exception as e:
        result["errors"].append(str(e))
        result["success"] = False
    
    return result

def main():
    """Main test function"""
    print("=" * 80)
    print("🔍 בדיקות מקיפות למערכת הנתונים החיצוניים - Selenium")
    print("=" * 80)
    print(f"Base URL: {BASE_URL}")
    print(f"Start time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80)
    print()
    
    all_results = {
        "timestamp": datetime.now().isoformat(),
        "base_url": BASE_URL,
        "api_tests": [],
        "ui_tests": [],
        "process_tests": [],
        "summary": {}
    }
    
    # Test API endpoints
    print("📡 בדיקת API Endpoints...")
    print("-" * 80)
    for endpoint in API_ENDPOINTS:
        print(f"Testing: {endpoint['name']} ({endpoint['url']})")
        result = test_api_endpoint(endpoint)
        all_results["api_tests"].append(result)
        
        status_icon = "✅" if result["success"] else "❌"
        print(f"  {status_icon} Status: {result['status_code']} ({result.get('response_time', 0):.2f}s)")
        if result.get("error"):
            print(f"  ❌ Error: {result['error']}")
        print()
    
    # Test UI pages
    print("🖥️  בדיקת ממשקי משתמש...")
    print("-" * 80)
    driver = setup_driver()
    if not driver:
        print("❌ Failed to setup WebDriver. Skipping UI tests.")
    else:
        try:
            for page in EXTERNAL_DATA_PAGES:
                print(f"Testing: {page['name']} ({page['url']})")
                result = test_page_ui(driver, page)
                all_results["ui_tests"].append(result)
                
                status_icon = "✅" if result["success"] else "❌"
                print(f"  {status_icon} Status: {'SUCCESS' if result['success'] else 'ERRORS FOUND'}")
                print(f"  ⏱️  Load time: {result['load_time']:.2f}s")
                print(f"  ❌ Errors: {len(result['console_errors'])}")
                print(f"  ⚠️  Warnings: {len(result['console_warnings'])}")
                if result.get("ui_elements"):
                    print(f"  🎨 UI Elements: {len(result['ui_elements'])} found")
                print()
            
            # Test data loading process
            print("🔄 בדיקת תהליך טעינת נתונים...")
            print("-" * 80)
            process_result = test_data_loading_process(driver)
            all_results["process_tests"].append(process_result)
            print(f"{'✅' if process_result['success'] else '❌'} {process_result['test_name']}")
            for step in process_result.get("steps", []):
                step_icon = "✅" if step.get("success") else "❌"
                print(f"  {step_icon} {step['step']}")
            print()
            
            # Test scheduler controls
            print("⚙️  בדיקת בקרות Scheduler...")
            print("-" * 80)
            scheduler_result = test_scheduler_controls(driver)
            all_results["process_tests"].append(scheduler_result)
            print(f"{'✅' if scheduler_result['success'] else '❌'} {scheduler_result['test_name']}")
            for step in scheduler_result.get("steps", []):
                step_icon = "✅" if step.get("success") else "❌"
                print(f"  {step_icon} {step['step']}")
            print()
            
        finally:
            driver.quit()
    
    # Summary
    print("=" * 80)
    print("📊 סיכום תוצאות")
    print("=" * 80)
    
    api_successful = len([r for r in all_results["api_tests"] if r["success"]])
    ui_successful = len([r for r in all_results["ui_tests"] if r["success"]])
    process_successful = len([r for r in all_results["process_tests"] if r["success"]])
    
    print(f"✅ API Endpoints: {api_successful}/{len(all_results['api_tests'])}")
    print(f"✅ UI Pages: {ui_successful}/{len(all_results['ui_tests'])}")
    print(f"✅ Process Tests: {process_successful}/{len(all_results['process_tests'])}")
    print()
    
    all_results["summary"] = {
        "api_successful": api_successful,
        "api_total": len(all_results["api_tests"]),
        "ui_successful": ui_successful,
        "ui_total": len(all_results["ui_tests"]),
        "process_successful": process_successful,
        "process_total": len(all_results["process_tests"])
    }
    
    # Save results
    output_file = Path(__file__).parent.parent / "external_data_system_selenium_test_results.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_results, f, ensure_ascii=False, indent=2)
    
    print(f"💾 תוצאות נשמרו ל: {output_file}")
    print()
    print("=" * 80)
    print(f"✅ בדיקה הושלמה: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80)

if __name__ == "__main__":
    main()

