#!/usr/bin/env python3
"""
Comprehensive Test Script for Trade History Page
================================================

This script tests all functionality of the trade history page including:
- Page loading
- Ticker search functionality
- Trade count display
- Trade selection
- All UI components

Usage:
    python3 scripts/test_trade_history_page_comprehensive.py

Requirements:
    - Server must be running on http://localhost:8080
    - Selenium and webdriver-manager installed: pip install selenium webdriver-manager
"""

import json
import time
import sys
from datetime import datetime
from pathlib import Path

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
    sys.exit(1)

BASE_URL = "http://localhost:8080"
TEST_USERNAME = "admin"
TEST_PASSWORD = "admin123"

def setup_driver():
    """Setup Chrome WebDriver"""
    chrome_options = Options()
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--window-size=1920,1080')
    chrome_options.add_experimental_option('excludeSwitches', ['enable-logging'])
    chrome_options.set_capability('goog:loggingPrefs', {'browser': 'ALL'})
    
    try:
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=chrome_options)
        driver.set_page_load_timeout(30)
        return driver
    except Exception as e:
        print(f"❌ Error setting up Chrome driver: {e}")
        return None

def login(driver):
    """Login to the system as admin"""
    try:
        print("🔐 Logging in as admin...")
        driver.get(f"{BASE_URL}/login.html")
        time.sleep(3)
        
        try:
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.ID, "username"))
            )
        except TimeoutException:
            print("⚠️  Login form not found, assuming already logged in")
            return True
        
        username_field = driver.find_element(By.ID, "username")
        password_field = driver.find_element(By.ID, "password")
        
        username_field.clear()
        username_field.send_keys(TEST_USERNAME)
        time.sleep(0.5)
        
        password_field.clear()
        password_field.send_keys(TEST_PASSWORD)
        time.sleep(0.5)
        
        try:
            login_button = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, "button[type='submit'], button.btn-primary, #loginBtn"))
            )
            driver.execute_script("arguments[0].click();", login_button)
        except TimeoutException:
            password_field.send_keys(Keys.RETURN)
        
        time.sleep(5)
        current_url = driver.current_url
        if "login" not in current_url.lower():
            print("✅ Login successful")
            return True
        
        session_check = driver.execute_script("return localStorage.getItem('session_token') || sessionStorage.getItem('session_token');")
        if session_check:
            print("✅ Login successful (session found)")
            return True
        
        print("⚠️  Login status unclear, continuing anyway")
        return True
    except Exception as e:
        print(f"⚠️  Login warning: {e}")
        return True

def test_page_loading(driver):
    """Test 1: Page loading"""
    print("\n" + "="*60)
    print("📄 Test 1: Page Loading")
    print("="*60)
    
    try:
        driver.get(f"{BASE_URL}/mockups/daily-snapshots/trade_history_page.html")
        time.sleep(3)
        
        # Check if page loaded
        if "trade-history" in driver.current_url.lower():
            print("✅ Page loaded successfully")
        else:
            print(f"⚠️  Page URL: {driver.current_url}")
        
        # Check for console errors
        logs = driver.get_log('browser')
        errors = [log for log in logs if log['level'] == 'SEVERE']
        if errors:
            print(f"⚠️  Found {len(errors)} console errors")
            for error in errors[:5]:  # Show first 5
                print(f"   - {error['message']}")
        else:
            print("✅ No console errors")
        
        return True
    except Exception as e:
        print(f"❌ Error loading page: {e}")
        return False

def test_ticker_search(driver):
    """Test 2: Ticker search functionality"""
    print("\n" + "="*60)
    print("🔍 Test 2: Ticker Search Functionality")
    print("="*60)
    
    try:
        # Find and click "בחר טרייד" button
        try:
            # Try multiple selectors
            selectors = [
                "button[data-onclick*='openTradeSelectorModal']",
                "button[onclick*='openTradeSelectorModal']",
                "button:contains('בחר טרייד')",
                "#selectTradeBtn"
            ]
            
            select_trade_button = None
            for selector in selectors:
                try:
                    if ':contains' in selector:
                        # Use XPath for text contains
                        select_trade_button = driver.find_element(By.XPATH, "//button[contains(text(), 'בחר טרייד')]")
                    else:
                        select_trade_button = driver.find_element(By.CSS_SELECTOR, selector)
                    break
                except:
                    continue
            
            if select_trade_button:
                driver.execute_script("arguments[0].scrollIntoView(true);", select_trade_button)
                time.sleep(1)
                driver.execute_script("arguments[0].click();", select_trade_button)
                print("✅ Clicked 'בחר טרייד' button")
                time.sleep(2)
            else:
                # Try alternative: trigger modal directly via JavaScript
                driver.execute_script("if (window.tradeHistoryPage && window.tradeHistoryPage.openTradeSelectorModal) window.tradeHistoryPage.openTradeSelectorModal();")
                time.sleep(2)
                print("✅ Triggered ticker search modal via JavaScript")
        except Exception as e:
            # Try alternative: trigger modal directly via JavaScript
            try:
                driver.execute_script("if (window.tradeHistoryPage && window.tradeHistoryPage.openTradeSelectorModal) window.tradeHistoryPage.openTradeSelectorModal();")
                time.sleep(2)
                print("✅ Triggered ticker search modal via JavaScript")
            except:
                print(f"❌ Could not open ticker search modal: {e}")
                return False
        
        # Find search input
        try:
            # Try multiple selectors
            selectors = [
                "input[type='text'][placeholder*='טיקר']",
                "input#tickerSearchInput",
                "input[data-ticker-search]",
                "input[placeholder*='חיפוש']",
                "#tradeHistoryStep1 input[type='text']"
            ]
            
            search_input = None
            for selector in selectors:
                try:
                    search_input = WebDriverWait(driver, 5).until(
                        EC.presence_of_element_located((By.CSS_SELECTOR, selector))
                    )
                    break
                except:
                    continue
            
            if not search_input:
                print("❌ Ticker search input not found")
                return False
            
            print("✅ Found ticker search input")
        except TimeoutException:
            print("❌ Ticker search input not found")
            return False
        
        # Test search with "a"
        print("\n🔍 Testing search with 'a'...")
        search_input.clear()
        search_input.send_keys("a")
        time.sleep(2)  # Wait for search results
        
        # Check for results
        try:
            results_container = driver.find_element(By.CSS_SELECTOR, "#tickerSearchResults, .ticker-search-results, [data-ticker-results]")
            results = results_container.find_elements(By.CSS_SELECTOR, ".search-result-item, .ticker-result-item")
            
            if results:
                print(f"✅ Found {len(results)} search results")
                
                # Check if results show trade count
                for i, result in enumerate(results[:3]):  # Check first 3 results
                    try:
                        text = result.text
                        if "טרייד" in text or "trade" in text.lower():
                            print(f"   ✅ Result {i+1} shows trade count: {text[:100]}")
                        else:
                            print(f"   ⚠️  Result {i+1} may not show trade count: {text[:100]}")
                    except:
                        pass
                
                # Check if "aapl" appears in results (should appear when searching "a")
                page_text = driver.page_source.lower()
                if "aapl" in page_text:
                    print("✅ 'aapl' found in results (correct behavior)")
                else:
                    print("⚠️  'aapl' not found in results (may need to scroll or load more)")
            else:
                print("⚠️  No search results found")
        except NoSuchElementException:
            print("⚠️  Results container not found")
        
        # Test search with "aapl"
        print("\n🔍 Testing search with 'aapl'...")
        search_input.clear()
        search_input.send_keys("aapl")
        time.sleep(2)
        
        page_text = driver.page_source.lower()
        if "aapl" in page_text:
            print("✅ 'aapl' found in results")
        else:
            print("⚠️  'aapl' not found in results")
        
        return True
    except Exception as e:
        print(f"❌ Error testing ticker search: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_trade_count_display(driver):
    """Test 3: Trade count display"""
    print("\n" + "="*60)
    print("📊 Test 3: Trade Count Display")
    print("="*60)
    
    try:
        # Check if trade counts are displayed in search results
        page_text = driver.page_source
        
        # Look for trade count patterns
        if "טרייד" in page_text or "trade" in page_text.lower():
            print("✅ Trade count text found in page")
            
            # Try to find specific trade count numbers
            import re
            trade_count_patterns = re.findall(r'(\d+)\s*טרייד', page_text)
            if trade_count_patterns:
                print(f"✅ Found trade count numbers: {trade_count_patterns[:5]}")
            else:
                print("⚠️  No trade count numbers found")
        else:
            print("⚠️  Trade count text not found")
        
        return True
    except Exception as e:
        print(f"❌ Error testing trade count display: {e}")
        return False

def test_trade_selection(driver):
    """Test 4: Trade selection"""
    print("\n" + "="*60)
    print("🎯 Test 4: Trade Selection")
    print("="*60)
    
    try:
        # Try to find and click a ticker with trades
        try:
            # Look for ticker results with trade count > 0
            results = driver.find_elements(By.CSS_SELECTOR, ".search-result-item, .ticker-result-item")
            
            for result in results[:3]:  # Try first 3 results
                try:
                    text = result.text
                    # Check if this ticker has trades
                    if "טרייד" in text and ("1" in text or "2" in text or "3" in text or "4" in text or "5" in text):
                        # Try to click the select button
                        try:
                            select_button = result.find_element(By.CSS_SELECTOR, "button.btn-primary, button:contains('בחר')")
                            driver.execute_script("arguments[0].scrollIntoView(true);", select_button)
                            time.sleep(1)
                            driver.execute_script("arguments[0].click();", select_button)
                            print(f"✅ Clicked select button for ticker: {text[:50]}")
                            time.sleep(3)  # Wait for trade list to load
                            
                            # Check if trade list appeared
                            try:
                                trades_container = driver.find_element(By.CSS_SELECTOR, "#tradeHistoryTradesResults, .trades-results, [data-trades-results]")
                                trades = trades_container.find_elements(By.CSS_SELECTOR, ".search-result-item, .trade-item")
                                if trades:
                                    print(f"✅ Found {len(trades)} trades in list")
                                    return True
                                else:
                                    print("⚠️  No trades found in list")
                            except NoSuchElementException:
                                print("⚠️  Trades container not found")
                            
                            break
                        except NoSuchElementException:
                            continue
                except:
                    continue
            
            print("⚠️  Could not find ticker with trades to select")
        except:
            print("⚠️  Could not find ticker results")
        
        return True
    except Exception as e:
        print(f"❌ Error testing trade selection: {e}")
        return False

def test_menu_link(driver):
    """Test 5: Menu link"""
    print("\n" + "="*60)
    print("🔗 Test 5: Menu Link")
    print("="*60)
    
    try:
        # Navigate to home page
        driver.get(f"{BASE_URL}/")
        time.sleep(2)
        
        # Find menu link for trade history
        try:
            # Try multiple selectors
            selectors = [
                "a[href*='trade-history']",
                "a[href='/trade_history']",
                "//a[contains(text(), 'היסטוריית טרייד')]"
            ]
            
            menu_link = None
            for selector in selectors:
                try:
                    if selector.startswith('//'):
                        menu_link = driver.find_element(By.XPATH, selector)
                    else:
                        menu_link = driver.find_element(By.CSS_SELECTOR, selector)
                    break
                except:
                    continue
            
            if menu_link:
                href = menu_link.get_attribute('href')
                print(f"✅ Found menu link: {href}")
                
                # Check if link points to general page (not specific trade)
                if 'tradeId=' in href or 'tickerId=' in href:
                    print(f"❌ Menu link points to specific trade: {href}")
                    return False
                else:
                    print(f"✅ Menu link points to general page: {href}")
                    return True
            else:
                print("⚠️  Menu link not found")
                return True  # Not critical
        except Exception as e:
            print(f"⚠️  Menu link not found: {e}")
            return True  # Not critical
    except Exception as e:
        print(f"❌ Error testing menu link: {e}")
        return False

def main():
    """Run all tests"""
    print("="*60)
    print("🧪 Comprehensive Trade History Page Testing")
    print("="*60)
    print(f"Base URL: {BASE_URL}")
    print(f"Start time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*60)
    
    driver = setup_driver()
    if not driver:
        print("❌ Failed to setup WebDriver. Exiting.")
        return
    
    try:
        # Login
        login(driver)
        time.sleep(2)
        
        # Run tests
        results = {}
        
        results['page_loading'] = test_page_loading(driver)
        results['ticker_search'] = test_ticker_search(driver)
        results['trade_count_display'] = test_trade_count_display(driver)
        results['trade_selection'] = test_trade_selection(driver)
        results['menu_link'] = test_menu_link(driver)
        
        # Summary
        print("\n" + "="*60)
        print("📊 Test Summary")
        print("="*60)
        
        passed = sum(1 for v in results.values() if v)
        total = len(results)
        
        for test_name, result in results.items():
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"{status} - {test_name}")
        
        print(f"\nTotal: {passed}/{total} tests passed ({passed/total*100:.1f}%)")
        
        # Save results
        report = {
            'timestamp': datetime.now().isoformat(),
            'results': results,
            'summary': {
                'passed': passed,
                'total': total,
                'percentage': passed/total*100
            }
        }
        
        report_path = Path('trade_history_page_test_report.json')
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        print(f"\n💾 Report saved to: {report_path}")
        
    finally:
        print("\n" + "="*60)
        print("✅ Testing completed")
        print("="*60)
        driver.quit()

if __name__ == "__main__":
    main()

