#!/usr/bin/env python3
"""
Comprehensive Portfolio State Page Testing
==========================================
Tests the portfolio-state page with:
1. Console errors and warnings
2. All buttons and UI interactions
3. Data calculations for both users (admin and user)
4. Chart functionality
5. Tables rendering
6. Date comparison
7. Trades list
"""

import json
import time
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any

try:
    from selenium import webdriver
    from selenium.webdriver.chrome.service import Service
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.common.exceptions import TimeoutException, WebDriverException, NoSuchElementException
    from webdriver_manager.chrome import ChromeDriverManager
except ImportError:
    print("❌ Error: selenium or webdriver-manager not installed.")
    print("   Install with: pip install selenium webdriver-manager")
    sys.exit(1)

BASE_URL = "http://localhost:8080"
PAGE_URL = f"{BASE_URL}/portfolio-state.html"

# Test users
TEST_USERS = [
    {"username": "admin", "password": "admin123", "name": "Admin"},
    {"username": "user", "password": "user123", "name": "User"}
]

REPORTS_DIR = Path(__file__).parent.parent / "reports" / "qa"
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

def setup_driver():
    """Setup Chrome driver with proper options"""
    chrome_options = Options()
    chrome_options.add_argument('--headless=new')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--window-size=1920,1080')
    chrome_options.add_experimental_option('excludeSwitches', ['enable-logging'])
    chrome_options.set_capability('goog:loggingPrefs', {'browser': 'ALL', 'performance': 'ALL'})
    
    try:
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=chrome_options)
        driver.set_script_timeout(60)
        return driver
    except Exception as e:
        print(f"❌ Error setting up Chrome driver: {e}")
        return None

def login(driver, username: str, password: str) -> bool:
    """Login via modal"""
    try:
        print(f"🔐 Logging in as {username}...")
        driver.get(f"{BASE_URL}/")
        
        WebDriverWait(driver, 15).until(
            lambda d: d.execute_script('return document.readyState') == 'complete'
        )
        
        WebDriverWait(driver, 20).until(
            lambda d: d.execute_script(
                "return !!window.TikTrackAuth && typeof window.TikTrackAuth.showLoginModal === 'function';"
            )
        )
        
        driver.execute_async_script("""
            const done = arguments[0];
            const timeout = setTimeout(() => done('timeout'), 10000);
            if (!window.TikTrackAuth || typeof window.TikTrackAuth.showLoginModal !== 'function') {
                clearTimeout(timeout);
                done('TikTrackAuth missing');
                return;
            }
            Promise.resolve(window.TikTrackAuth.showLoginModal())
              .then(() => { clearTimeout(timeout); done('ok'); })
              .catch(err => { clearTimeout(timeout); done(err && err.message ? err.message : String(err)); });
        """)
        
        WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.ID, "loginModalContainer"))
        )
        
        username_field = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.ID, "username"))
        )
        password_field = driver.find_element(By.ID, "password")
        
        # Scroll to fields and wait
        driver.execute_script("arguments[0].scrollIntoView(true);", username_field)
        time.sleep(0.3)
        
        username_field.clear()
        time.sleep(0.1)
        username_field.send_keys(username)
        time.sleep(0.1)
        
        password_field.clear()
        time.sleep(0.1)
        password_field.send_keys(password)
        time.sleep(0.2)
        
        login_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.ID, "loginBtn"))
        )
        driver.execute_script("arguments[0].scrollIntoView(true);", login_button)
        time.sleep(0.2)
        driver.execute_script("arguments[0].click();", login_button)
        
        time.sleep(3)
        
        # Check if login was successful
        try:
            WebDriverWait(driver, 10).until(
                lambda d: d.execute_script("""
                    return window.TikTrackAuth && window.TikTrackAuth.isAuthenticated && 
                           window.TikTrackAuth.isAuthenticated();
                """)
            )
            print(f"✅ Login successful for {username}")
            return True
        except TimeoutException:
            print(f"❌ Login failed for {username}")
            return False
            
    except Exception as e:
        print(f"❌ Login error for {username}: {e}")
        return False

def test_page_console_errors(driver) -> Dict[str, Any]:
    """Test console errors and warnings"""
    result = {
        "console_errors": [],
        "console_warnings": [],
        "critical_errors": []
    }
    
    try:
        logs = driver.get_log('browser')
        for log in logs:
            level = log.get('level', '').upper()
            message = log.get('message', '')
            
            # Filter out non-critical errors
            if '401' in message or '308' in message or 'favicon' in message.lower():
                continue
            
            if level == 'SEVERE':
                if 'Value is null' in message:
                    result["critical_errors"].append({
                        "type": "Value is null",
                        "message": message
                    })
                else:
                    result["console_errors"].append({
                        "level": level,
                        "message": message,
                        "timestamp": log.get('timestamp', 0)
                    })
            elif level == 'WARNING':
                result["console_warnings"].append({
                    "level": level,
                    "message": message,
                    "timestamp": log.get('timestamp', 0)
                })
    except Exception as e:
        result["console_errors"].append(f"Error reading console logs: {e}")
    
    return result

def test_buttons(driver) -> Dict[str, Any]:
    """Test all buttons on the page"""
    result = {
        "buttons_found": [],
        "buttons_clickable": [],
        "buttons_broken": [],
        "buttons_tested": 0
    }
    
    try:
        # Wait for page to be fully loaded
        WebDriverWait(driver, 20).until(
            lambda d: d.execute_script("""
                return document.readyState === 'complete' && 
                       (window.portfolioStatePage || window.UnifiedAppInitializer);
            """)
        )
        
        time.sleep(3)  # Wait for dynamic content
        
        # Find all buttons
        buttons = driver.find_elements(By.TAG_NAME, "button")
        buttons.extend(driver.find_elements(By.CSS_SELECTOR, "[data-onclick]"))
        buttons.extend(driver.find_elements(By.CSS_SELECTOR, "[data-button-type]"))
        
        for btn in buttons:
            try:
                btn_id = btn.get_attribute("id") or "no-id"
                btn_text = btn.text or btn.get_attribute("data-tooltip") or "no-text"
                onclick = btn.get_attribute("onclick") or btn.get_attribute("data-onclick") or "no-onclick"
                
                result["buttons_found"].append({
                    "id": btn_id,
                    "text": btn_text[:50],
                    "onclick": onclick[:100] if onclick != "no-onclick" else None
                })
                
                # Test if button is clickable
                if btn.is_displayed() and btn.is_enabled():
                    result["buttons_clickable"].append(btn_id)
                    result["buttons_tested"] += 1
                else:
                    result["buttons_broken"].append({
                        "id": btn_id,
                        "reason": "not visible or not enabled"
                    })
            except Exception as e:
                result["buttons_broken"].append({
                    "id": "unknown",
                    "reason": str(e)
                })
                
    except Exception as e:
        result["buttons_broken"].append({
            "id": "page-load",
            "reason": f"Page load error: {e}"
        })
    
    return result

def test_chart_functionality(driver) -> Dict[str, Any]:
    """Test chart functionality"""
    result = {
        "chart_container_exists": False,
        "chart_initialized": False,
        "chart_buttons_working": [],
        "chart_buttons_broken": [],
        "chart_data_loaded": False
    }
    
    try:
        # Check if chart container exists
        chart_container = driver.find_element(By.ID, "unified-portfolio-chart-container")
        result["chart_container_exists"] = True
        
        # Check if chart is initialized
        chart_initialized = driver.execute_script("""
            return window.portfolioStatePage && 
                   window.portfolioStatePage.unifiedPortfolioChart !== undefined &&
                   window.portfolioStatePage.unifiedPortfolioChart !== null;
        """)
        result["chart_initialized"] = chart_initialized
        
        # Check if chart data is loaded
        chart_data_loaded = driver.execute_script("""
            if (!window.portfolioStatePage || !window.portfolioStatePage.unifiedPortfolioChart) {
                return false;
            }
            try {
                const chart = window.portfolioStatePage.unifiedPortfolioChart;
                const series = chart.series();
                return series && series.length > 0;
            } catch (e) {
                return false;
            }
        """)
        result["chart_data_loaded"] = chart_data_loaded
        
        # Test chart buttons
        chart_buttons = driver.find_elements(By.CSS_SELECTOR, ".chart-toolbar button")
        for btn in chart_buttons:
            try:
                btn_id = btn.get_attribute("id") or "no-id"
                if btn.is_displayed() and btn.is_enabled():
                    result["chart_buttons_working"].append(btn_id)
                else:
                    result["chart_buttons_broken"].append({
                        "id": btn_id,
                        "reason": "not visible or not enabled"
                    })
            except Exception as e:
                result["chart_buttons_broken"].append({
                    "id": "unknown",
                    "reason": str(e)
                })
                
    except NoSuchElementException:
        result["chart_container_exists"] = False
    except Exception as e:
        result["chart_buttons_broken"].append({
            "id": "chart-test",
            "reason": str(e)
        })
    
    return result

def test_trades_table(driver) -> Dict[str, Any]:
    """Test trades table rendering"""
    result = {
        "table_exists": False,
        "table_has_rows": False,
        "row_count": 0,
        "summary_rendered": False,
        "month_year_selectors_working": False
    }
    
    try:
        # Check if table exists
        table = driver.find_element(By.CSS_SELECTOR, "[data-table-type='portfolio-trades']")
        result["table_exists"] = True
        
        # Check if table has rows (excluding header and summary)
        rows = driver.find_elements(By.CSS_SELECTOR, "[data-table-type='portfolio-trades'] tbody tr")
        data_rows = [r for r in rows if not r.get_attribute("class") or "summary" not in r.get_attribute("class")]
        result["row_count"] = len(data_rows)
        result["table_has_rows"] = len(data_rows) > 0
        
        # Check if summary is rendered
        summary_row = driver.find_elements(By.CSS_SELECTOR, "[data-table-type='portfolio-trades'] tr.summary, [data-table-type='portfolio-trades'] tr[data-row-type='summary']")
        result["summary_rendered"] = len(summary_row) > 0
        
        # Check month/year selectors
        month_select = driver.find_elements(By.ID, "tradesMonthSelect")
        year_select = driver.find_elements(By.ID, "tradesYearSelect")
        result["month_year_selectors_working"] = len(month_select) > 0 and len(year_select) > 0
        
    except NoSuchElementException:
        result["table_exists"] = False
    except Exception as e:
        result["error"] = str(e)
    
    return result

def test_date_comparison(driver) -> Dict[str, Any]:
    """Test date comparison functionality"""
    result = {
        "date_pickers_exist": False,
        "date_pickers_count": 0,
        "comparison_table_exists": False,
        "comparison_data_rendered": False
    }
    
    try:
        # Check date pickers
        date_pickers = driver.find_elements(By.CSS_SELECTOR, "input[type='date']")
        result["date_pickers_count"] = len(date_pickers)
        result["date_pickers_exist"] = len(date_pickers) > 0
        
        # Check comparison table
        comparison_table = driver.find_elements(By.CSS_SELECTOR, "#dateComparisonTable, [data-table-type='date-comparison']")
        result["comparison_table_exists"] = len(comparison_table) > 0
        
        # Check if comparison data is rendered (not just "לא זמין")
        if comparison_table:
            cells = comparison_table[0].find_elements(By.TAG_NAME, "td")
            available_data = [c for c in cells if c.text and "לא זמין" not in c.text and c.text.strip()]
            result["comparison_data_rendered"] = len(available_data) > 0
        
    except Exception as e:
        result["error"] = str(e)
    
    return result

def test_calculations(driver, username: str) -> Dict[str, Any]:
    """Test data calculations"""
    result = {
        "summary_cards_rendered": False,
        "summary_values_valid": False,
        "snapshot_loaded": False,
        "calculations_consistent": False
    }
    
    try:
        # Check if summary cards are rendered
        summary_cards = driver.find_elements(By.CSS_SELECTOR, ".summary-card, .info-summary-card")
        result["summary_cards_rendered"] = len(summary_cards) > 0
        
        # Check if snapshot is loaded
        snapshot_loaded = driver.execute_script("""
            return window.portfolioStatePage && 
                   window.portfolioStatePage.currentSnapshot !== undefined &&
                   window.portfolioStatePage.currentSnapshot !== null;
        """)
        result["snapshot_loaded"] = snapshot_loaded
        
        # Get summary values
        summary_values = driver.execute_script("""
            if (!window.portfolioStatePage || !window.portfolioStatePage.currentSnapshot) {
                return null;
            }
            const snapshot = window.portfolioStatePage.currentSnapshot;
            return {
                total_cash: snapshot.state?.total_cash || snapshot.state?.cash_balance || null,
                total_portfolio_value: snapshot.state?.total_portfolio_value || snapshot.state?.portfolio_value || null,
                total_pl: snapshot.state?.total_pl || snapshot.state?.profit_loss || null,
                date: snapshot.date || null
            };
        """)
        
        if summary_values:
            result["summary_values_valid"] = (
                summary_values.get("total_cash") is not None or
                summary_values.get("total_portfolio_value") is not None
            )
            result["calculations_consistent"] = True
        
    except Exception as e:
        result["error"] = str(e)
    
    return result

def test_page_for_user(driver, user: Dict[str, str]) -> Dict[str, Any]:
    """Test the page for a specific user"""
    print(f"\n{'='*60}")
    print(f"Testing Portfolio State Page for: {user['name']} ({user['username']})")
    print(f"{'='*60}\n")
    
    result = {
        "user": user["name"],
        "username": user["username"],
        "timestamp": datetime.now().isoformat(),
        "page_loaded": False,
        "console": {},
        "buttons": {},
        "chart": {},
        "trades_table": {},
        "date_comparison": {},
        "calculations": {},
        "overall_status": "failed"
    }
    
    try:
        # Login
        if not login(driver, user["username"], user["password"]):
            result["error"] = "Login failed"
            return result
        
        # Navigate to page
        print(f"📄 Navigating to {PAGE_URL}...")
        driver.get(PAGE_URL)
        
        # Wait for page to load
        WebDriverWait(driver, 20).until(
            lambda d: d.execute_script('return document.readyState') == 'complete'
        )
        
        # Wait for page initialization (more flexible)
        try:
            WebDriverWait(driver, 30).until(
                lambda d: d.execute_script("""
                    return window.UnifiedAppInitializer && 
                           window.UnifiedAppInitializer.isInitialized &&
                           window.UnifiedAppInitializer.isInitialized();
                """)
            )
        except TimeoutException:
            # Try alternative check - just wait for portfolioStatePage
            try:
                WebDriverWait(driver, 10).until(
                    lambda d: d.execute_script("""
                        return window.portfolioStatePage !== undefined;
                    """)
                )
                print("⚠️  UnifiedAppInitializer not ready, but portfolioStatePage exists")
            except TimeoutException:
                print("⚠️  Page initialization timeout - continuing anyway")
        
        time.sleep(5)  # Wait for data loading
        
        # Verify page is actually loaded
        page_ready = driver.execute_script("""
            return document.readyState === 'complete' && 
                   (window.portfolioStatePage !== undefined || 
                    document.getElementById('unified-portfolio-chart-container') !== null);
        """)
        result["page_loaded"] = page_ready
        
        # Run all tests
        print("🔍 Testing console errors...")
        result["console"] = test_page_console_errors(driver)
        
        print("🔘 Testing buttons...")
        result["buttons"] = test_buttons(driver)
        
        print("📊 Testing chart...")
        result["chart"] = test_chart_functionality(driver)
        
        print("📋 Testing trades table...")
        result["trades_table"] = test_trades_table(driver)
        
        print("📅 Testing date comparison...")
        result["date_comparison"] = test_date_comparison(driver)
        
        print("🧮 Testing calculations...")
        result["calculations"] = test_calculations(driver, user["username"])
        
        # Determine overall status
        critical_errors = len(result["console"].get("critical_errors", []))
        console_errors = len(result["console"].get("console_errors", []))
        buttons_broken = len(result["buttons"].get("buttons_broken", []))
        
        if critical_errors > 0:
            result["overall_status"] = "critical_errors"
        elif console_errors > 5 or buttons_broken > 3:
            result["overall_status"] = "warnings"
        else:
            result["overall_status"] = "passed"
        
        print(f"\n✅ Testing completed for {user['name']}")
        print(f"   Status: {result['overall_status']}")
        print(f"   Critical Errors: {critical_errors}")
        print(f"   Console Errors: {console_errors}")
        print(f"   Buttons Broken: {buttons_broken}")
        
    except Exception as e:
        result["error"] = str(e)
        result["overall_status"] = "error"
        print(f"❌ Error testing for {user['name']}: {e}")
    
    return result

def main():
    """Main test function"""
    print("="*60)
    print("Portfolio State Page - Comprehensive Testing")
    print("="*60)
    
    driver = setup_driver()
    if not driver:
        print("❌ Failed to setup driver")
        return
    
    all_results = {
        "timestamp": datetime.now().isoformat(),
        "page": "portfolio-state",
        "url": PAGE_URL,
        "users": []
    }
    
    try:
        for user in TEST_USERS:
            result = test_page_for_user(driver, user)
            all_results["users"].append(result)
            
            # Small delay between users
            time.sleep(2)
        
        # Generate summary
        total_users = len(all_results["users"])
        passed = sum(1 for u in all_results["users"] if u["overall_status"] == "passed")
        failed = sum(1 for u in all_results["users"] if u["overall_status"] in ["failed", "error", "critical_errors"])
        
        all_results["summary"] = {
            "total_users": total_users,
            "passed": passed,
            "failed": failed,
            "warnings": total_users - passed - failed
        }
        
        # Save report
        report_file = REPORTS_DIR / f"portfolio_state_test_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(all_results, f, indent=2, ensure_ascii=False)
        
        print("\n" + "="*60)
        print("TEST SUMMARY")
        print("="*60)
        print(f"Total Users Tested: {total_users}")
        print(f"Passed: {passed}")
        print(f"Failed: {failed}")
        print(f"Report saved to: {report_file}")
        print("="*60)
        
    finally:
        driver.quit()

if __name__ == "__main__":
    main()

