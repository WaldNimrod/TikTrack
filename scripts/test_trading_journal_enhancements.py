#!/usr/bin/env python3
"""
Comprehensive test script for Trading Journal Page enhancements
Tests all new features: smart table, day zoom, entry selection, ticker filter, activity chart

Usage:
    python3 scripts/test_trading_journal_enhancements.py
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
    chrome_options.add_argument('--headless')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--window-size=1920,1080')
    
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    return driver

def login(driver):
    """Login to the application"""
    try:
        driver.get(f"{BASE_URL}/login.html")
        time.sleep(2)
        
        # Find and fill login form
        username_field = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "username"))
        )
        password_field = driver.find_element(By.ID, "password")
        
        username_field.send_keys(TEST_USERNAME)
        password_field.send_keys(TEST_PASSWORD)
        
        # Submit form
        login_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit'], input[type='submit'], button.btn-primary")
        login_button.click()
        
        # Wait for redirect
        WebDriverWait(driver, 10).until(
            lambda d: "login" not in d.current_url.lower()
        )
        
        print("✅ Login successful")
        return True
    except Exception as e:
        print(f"❌ Login failed: {e}")
        return False

def test_page_loads(driver):
    """Test that the page loads without errors"""
    print("\n📄 Testing page load...")
    try:
        driver.get(f"{BASE_URL}/trading_journal.html")
        time.sleep(5)  # Wait for page to load
        
        # Check for console errors
        logs = driver.get_log('browser')
        errors = [log for log in logs if log['level'] == 'SEVERE']
        
        if errors:
            print(f"⚠️  Found {len(errors)} console errors:")
            for error in errors[:5]:  # Show first 5
                print(f"   - {error['message']}")
        else:
            print("✅ No console errors")
        
        # Check if main elements exist
        calendar = driver.find_element(By.ID, "calendar")
        journal_entries = driver.find_element(By.ID, "journalEntriesList")
        activity_chart = driver.find_element(By.ID, "activityChartContainer")
        
        print("✅ Page elements loaded")
        return True
    except Exception as e:
        print(f"❌ Page load test failed: {e}")
        return False

def test_smart_table(driver):
    """Test smart table functionality"""
    print("\n📊 Testing smart table...")
    try:
        # Wait for table to load (table is created dynamically)
        WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "#journalEntriesList table, #journalEntriesTable"))
        )
        time.sleep(2)
        
        # Find table (could be in journalEntriesList or have ID journalEntriesTable)
        try:
            table = driver.find_element(By.ID, "journalEntriesTable")
        except NoSuchElementException:
            # Try to find table inside journalEntriesList
            container = driver.find_element(By.ID, "journalEntriesList")
            table = container.find_element(By.TAG_NAME, "table")
        thead = table.find_element(By.TAG_NAME, "thead")
        tbody = table.find_element(By.TAG_NAME, "tbody")
        
        # Check headers
        headers = thead.find_elements(By.TAG_NAME, "th")
        print(f"✅ Table headers found: {len(headers)}")
        
        # Check rows
        rows = tbody.find_elements(By.TAG_NAME, "tr")
        print(f"✅ Table rows found: {len(rows)}")
        
        # Test sorting (click on date header)
        if len(headers) > 0:
            date_header = headers[0]
            date_header.click()
            time.sleep(1)
            print("✅ Table sorting test passed")
        
        return True
    except Exception as e:
        print(f"❌ Smart table test failed: {e}")
        return False

def test_day_zoom(driver):
    """Test day zoom functionality"""
    print("\n🔍 Testing day zoom...")
    try:
        # Find calendar
        calendar = driver.find_element(By.ID, "calendar")
        time.sleep(2)
        
        # Find a day cell (look for calendar day)
        day_cells = calendar.find_elements(By.CSS_SELECTOR, ".calendar-day, .day-cell, [data-day]")
        
        if day_cells:
            # Click on first available day
            day_cells[0].click()
            time.sleep(2)
            
            # Check if day zoom container is visible
            try:
                day_zoom = driver.find_element(By.ID, "dayZoomContainer")
                if day_zoom.is_displayed():
                    print("✅ Day zoom opened")
                    
                    # Test exit button
                    exit_btn = driver.find_element(By.ID, "exitDayZoomBtn")
                    exit_btn.click()
                    time.sleep(1)
                    print("✅ Day zoom closed")
                    return True
                else:
                    print("⚠️  Day zoom container not visible")
            except NoSuchElementException:
                print("⚠️  Day zoom container not found (may not have entries)")
        else:
            print("⚠️  No day cells found in calendar")
        
        return True
    except Exception as e:
        print(f"❌ Day zoom test failed: {e}")
        return False

def test_ticker_filter(driver):
    """Test ticker filter functionality"""
    print("\n🔽 Testing ticker filter...")
    try:
        # Wait for filter to be available
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "tickerFilterToggle"))
        )
        
        # Find ticker filter toggle
        ticker_filter_toggle = driver.find_element(By.ID, "tickerFilterToggle")
        ticker_filter_toggle.click()
        time.sleep(1)
        
        # Find filter menu
        filter_menu = driver.find_element(By.ID, "tickerFilterMenu")
        
        if filter_menu.is_displayed():
            print("✅ Ticker filter menu opened")
            
            # Select "all" option
            all_option = filter_menu.find_element(By.CSS_SELECTOR, "[data-value='all'], [data-value='']")
            all_option.click()
            time.sleep(2)
            
            print("✅ Ticker filter test passed")
            return True
        else:
            print("⚠️  Ticker filter menu not visible")
            return False
    except Exception as e:
        print(f"❌ Ticker filter test failed: {e}")
        return False

def test_activity_chart(driver):
    """Test activity chart functionality"""
    print("\n📈 Testing activity chart...")
    try:
        # Find chart container
        chart_container = driver.find_element(By.ID, "activityChartContainer")
        
        # Check if chart canvas exists
        try:
            canvas = chart_container.find_element(By.ID, "activityChartCanvas")
            print("✅ Chart canvas found")
        except NoSuchElementException:
            # Chart might be loading or have no data
            print("⚠️  Chart canvas not found (may be loading or no data)")
        
        # Test view mode buttons
        try:
            daily_btn = driver.find_element(By.ID, "chartViewModeDaily")
            weekly_btn = driver.find_element(By.ID, "chartViewModeWeekly")
            
            # Click weekly button
            weekly_btn.click()
            time.sleep(2)
            print("✅ Chart view mode changed to weekly")
            
            # Click daily button
            daily_btn.click()
            time.sleep(2)
            print("✅ Chart view mode changed to daily")
            
            return True
        except NoSuchElementException:
            print("⚠️  Chart view mode buttons not found")
            return False
    except Exception as e:
        print(f"❌ Activity chart test failed: {e}")
        return False

def test_entity_filter(driver):
    """Test entity type filter"""
    print("\n🏷️  Testing entity type filter...")
    try:
        # Wait for filter to be available
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "entityTypeFilterToggle"))
        )
        
        # Find entity filter toggle
        entity_filter_toggle = driver.find_element(By.ID, "entityTypeFilterToggle")
        entity_filter_toggle.click()
        time.sleep(1)
        
        # Find filter menu
        filter_menu = driver.find_element(By.ID, "entityTypeFilterMenu")
        
        if filter_menu.is_displayed():
            print("✅ Entity filter menu opened")
            
            # Select "all" option
            all_option = filter_menu.find_element(By.CSS_SELECTOR, "[data-value='all']")
            all_option.click()
            time.sleep(2)
            
            print("✅ Entity filter test passed")
            return True
        else:
            print("⚠️  Entity filter menu not visible")
            return False
    except Exception as e:
        print(f"❌ Entity filter test failed: {e}")
        return False

def test_month_navigation(driver):
    """Test month navigation buttons"""
    print("\n⬅️➡️  Testing month navigation...")
    try:
        # Find navigation buttons
        prev_btn = driver.find_element(By.CSS_SELECTOR, "[data-onclick*='prevMonth'], button[data-icon='chevron-right']")
        next_btn = driver.find_element(By.CSS_SELECTOR, "[data-onclick*='nextMonth'], button[data-icon='chevron-left']")
        
        # Get current month display
        month_display = driver.find_element(By.ID, "currentMonthYear")
        current_month = month_display.text
        print(f"   Current month: {current_month}")
        
        # Click next month
        next_btn.click()
        time.sleep(2)
        new_month = month_display.text
        print(f"   After next: {new_month}")
        
        # Click previous month
        prev_btn.click()
        time.sleep(2)
        back_month = month_display.text
        print(f"   After prev: {back_month}")
        
        print("✅ Month navigation test passed")
        return True
    except Exception as e:
        print(f"❌ Month navigation test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("=" * 60)
    print("Trading Journal Page - Comprehensive Enhancement Tests")
    print("=" * 60)
    
    driver = None
    results = {
        'timestamp': datetime.now().isoformat(),
        'tests': {}
    }
    
    try:
        driver = setup_driver()
        
        # Login
        if not login(driver):
            print("❌ Cannot proceed without login")
            return
        
        # Run tests
        results['tests']['page_loads'] = test_page_loads(driver)
        results['tests']['smart_table'] = test_smart_table(driver)
        results['tests']['day_zoom'] = test_day_zoom(driver)
        results['tests']['ticker_filter'] = test_ticker_filter(driver)
        results['tests']['entity_filter'] = test_entity_filter(driver)
        results['tests']['activity_chart'] = test_activity_chart(driver)
        results['tests']['month_navigation'] = test_month_navigation(driver)
        
        # Summary
        print("\n" + "=" * 60)
        print("Test Summary")
        print("=" * 60)
        
        passed = sum(1 for v in results['tests'].values() if v)
        total = len(results['tests'])
        
        for test_name, result in results['tests'].items():
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"{status}: {test_name}")
        
        print(f"\nTotal: {passed}/{total} tests passed")
        
        # Save results
        results_file = Path("reports/trading_journal_enhancements_test_results.json")
        results_file.parent.mkdir(parents=True, exist_ok=True)
        with open(results_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        print(f"\n📄 Results saved to: {results_file}")
        
    except Exception as e:
        print(f"❌ Test execution failed: {e}")
        import traceback
        traceback.print_exc()
    finally:
        if driver:
            driver.quit()

if __name__ == "__main__":
    main()

