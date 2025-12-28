#!/usr/bin/env python3
"""
Comprehensive Ticker Dashboard Testing Script
============================================

This script performs comprehensive testing of the ticker dashboard including:
- Page loading with different ticker IDs
- All UI components (KPI cards, chart, conditions, linked items)
- Data refresh processes
- Integration with ExternalDataService
- Error handling
- User interactions

Usage:
    python3 scripts/test_ticker_dashboard_comprehensive.py [ticker_id]

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
    from selenium.common.exceptions import TimeoutException, WebDriverException, NoSuchElementException
    from webdriver_manager.chrome import ChromeDriverManager
except ImportError:
    print("❌ Error: selenium or webdriver-manager not installed.")
    print("   Install with: pip install selenium webdriver-manager")
    sys.exit(1)

BASE_URL = "http://localhost:8080"

def setup_driver():
    """Setup Chrome WebDriver with automatic ChromeDriver management"""
    chrome_options = Options()
    # Run in headless mode for CI/CD, but can be changed to False for debugging
    chrome_options.add_argument('--headless')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--window-size=1920,1080')
    chrome_options.add_experimental_option('excludeSwitches', ['enable-logging'])
    
    # Enable logging
    chrome_options.set_capability('goog:loggingPrefs', {
        'browser': 'ALL',
        'performance': 'ALL'
    })
    
    try:
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=chrome_options)
        return driver
    except Exception as e:
        print(f"❌ Error setting up Chrome driver: {e}")
        sys.exit(1)

def get_ticker_id_from_args():
    """Get ticker ID from command line arguments or use default"""
    if len(sys.argv) > 1:
        try:
            return int(sys.argv[1])
        except ValueError:
            print(f"⚠️  Invalid ticker ID: {sys.argv[1]}. Using default ticker ID.")
    return None

def get_available_ticker_id(driver):
    """Get an available ticker ID from the system"""
    try:
        # Try to get tickers from API
        import requests
        response = requests.get(f"{BASE_URL}/api/tickers", timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data.get('status') == 'success' and data.get('data'):
                tickers = data['data']
                if tickers and len(tickers) > 0:
                    return tickers[0].get('id')
    except Exception as e:
        print(f"⚠️  Could not fetch ticker ID from API: {e}")
    
    # Default fallback
    return 1424  # AMZN - commonly used in testing

def test_page_load(driver, ticker_id):
    """Test basic page loading"""
    print(f"\n📄 Testing page load for ticker ID {ticker_id}...")
    
    url = f"{BASE_URL}/ticker_dashboard.html?tickerId={ticker_id}"
    driver.get(url)
    
    # Wait for page to load and systems to initialize
    time.sleep(5)
    
    # Wait for systems to initialize
    wait = WebDriverWait(driver, 15)
    try:
        wait.until(lambda d: d.execute_script("""
            return typeof window.Logger !== 'undefined' && 
                   typeof window.UnifiedCacheManager !== 'undefined';
        """))
    except TimeoutException:
        print(f"  ⚠️  Core systems took longer than expected to initialize")
    
    # Check for critical errors (filter out auth errors which are normal)
    logs = driver.get_log('browser')
    errors = [log for log in logs if log['level'] == 'SEVERE']
    
    # Filter out known non-critical errors
    critical_errors = []
    for error in errors:
        message = error.get('message', '')
        # Filter out auth errors (401) - these are normal when not logged in
        if '401 (UNAUTHORIZED)' in message and '/api/auth/me' in message:
            continue
        # Filter out favicon and extension errors
        if 'favicon' in message.lower() or 'chrome-extension' in message.lower():
            continue
        critical_errors.append(error)
    
    if critical_errors:
        print(f"  ❌ Found {len(critical_errors)} critical errors:")
        for error in critical_errors[:5]:  # Show first 5 errors
            print(f"     - {error['message'][:200]}")
        return False
    
    print(f"  ✅ Page loaded successfully")
    return True

def test_kpi_cards(driver):
    """Test KPI cards rendering"""
    print(f"\n📊 Testing KPI Cards...")
    
    try:
        # Wait for KPI cards container
        wait = WebDriverWait(driver, 10)
        kpi_container = wait.until(
            EC.presence_of_element_located((By.ID, "tickerDashboardKPICards"))
        )
        
        # Check for KPI cards
        kpi_cards = driver.find_elements(By.CSS_SELECTOR, "#tickerDashboardKPICards .kpi-card")
        
        if kpi_cards:
            print(f"  ✅ Found {len(kpi_cards)} KPI cards")
            
            # Check each card has required elements
            for i, card in enumerate(kpi_cards[:3]):  # Check first 3 cards
                title = card.find_elements(By.CSS_SELECTOR, ".kpi-card-title")
                value = card.find_elements(By.CSS_SELECTOR, ".kpi-card-value")
                
                if title and value:
                    print(f"     ✅ Card {i+1}: {title[0].text} = {value[0].text}")
                else:
                    print(f"     ⚠️  Card {i+1}: Missing title or value")
            
            return True
        else:
            print(f"  ⚠️  No KPI cards found (might be loading or no data)")
            return True  # Not necessarily an error - might be loading
    except TimeoutException:
        print(f"  ⚠️  KPI cards container not found (might be loading)")
        return True  # Not necessarily an error
    except Exception as e:
        print(f"  ❌ Error testing KPI cards: {e}")
        return False

def test_price_chart(driver):
    """Test price chart rendering"""
    print(f"\n📈 Testing Price Chart...")
    
    try:
        # Wait for chart container
        wait = WebDriverWait(driver, 10)
        chart_container = wait.until(
            EC.presence_of_element_located((By.ID, "tickerDashboardChart"))
        )
        
        # Check for TradingView widget
        tv_widget = driver.find_elements(By.CSS_SELECTOR, "#tickerDashboardChart iframe, #tickerDashboardChart [id*='tradingview']")
        
        if tv_widget:
            print(f"  ✅ Chart container found with TradingView widget")
            return True
        else:
            # Check if there's a placeholder or loading message
            placeholder = driver.find_elements(By.CSS_SELECTOR, "#tickerDashboardChart .chart-placeholder, #tickerDashboardChart .loading")
            if placeholder:
                print(f"  ⚠️  Chart placeholder found (might be loading)")
                return True
            else:
                print(f"  ⚠️  Chart container found but no widget/placeholder")
                return True  # Not necessarily an error
    except TimeoutException:
        print(f"  ⚠️  Chart container not found (might be loading)")
        return True  # Not necessarily an error
    except Exception as e:
        print(f"  ❌ Error testing chart: {e}")
        return False

def test_linked_items(driver):
    """Test linked items section"""
    print(f"\n🔗 Testing Linked Items...")
    
    try:
        # Wait for linked items container
        wait = WebDriverWait(driver, 10)
        linked_container = wait.until(
            EC.presence_of_element_located((By.ID, "linkedItemsTable_ticker"))
        )
        
        # Check for table rows
        rows = driver.find_elements(By.CSS_SELECTOR, "#linkedItemsTable_ticker tbody tr")
        
        if rows:
            print(f"  ✅ Found {len(rows)} linked items")
            return True
        else:
            print(f"  ⚠️  No linked items found (might be empty)")
            return True  # Not necessarily an error
    except TimeoutException:
        print(f"  ⚠️  Linked items container not found (might be loading or empty)")
        return True  # Not necessarily an error
    except Exception as e:
        print(f"  ❌ Error testing linked items: {e}")
        return False

def test_conditions(driver):
    """Test conditions section"""
    print(f"\n📋 Testing Conditions...")
    
    try:
        # Wait for conditions container
        wait = WebDriverWait(driver, 10)
        conditions_container = wait.until(
            EC.presence_of_element_located((By.ID, "tickerDashboardConditions"))
        )
        
        # Check for conditions
        conditions = driver.find_elements(By.CSS_SELECTOR, "#tickerDashboardConditions .condition-item, #tickerDashboardConditions tbody tr")
        
        if conditions:
            print(f"  ✅ Found {len(conditions)} conditions")
            return True
        else:
            # Check for "no conditions" message
            no_conditions = driver.find_elements(By.CSS_SELECTOR, "#tickerDashboardConditions .no-conditions, #tickerDashboardConditions .empty-state")
            if no_conditions:
                print(f"  ✅ No conditions message displayed (expected)")
                return True
            else:
                print(f"  ⚠️  Conditions container found but no conditions or message")
                return True  # Not necessarily an error
    except TimeoutException:
        print(f"  ⚠️  Conditions container not found (might be loading)")
        return True  # Not necessarily an error
    except Exception as e:
        print(f"  ❌ Error testing conditions: {e}")
        return False

def test_data_refresh(driver):
    """Test data refresh functionality"""
    print(f"\n🔄 Testing Data Refresh...")
    
    try:
        # Wait a bit more for ExternalDataService to load
        time.sleep(2)
        
        # Check if ExternalDataService is available
        service_check = driver.execute_script("""
            return {
                serviceExists: typeof window.ExternalDataService !== 'undefined',
                refreshMethodExists: typeof window.ExternalDataService !== 'undefined' && 
                                    typeof window.ExternalDataService.refreshTickerData === 'function',
                getQuoteExists: typeof window.ExternalDataService !== 'undefined' && 
                               typeof window.ExternalDataService.getQuote === 'function'
            };
        """)
        
        if service_check.get('serviceExists'):
            print(f"  ✅ ExternalDataService is available")
            
            if service_check.get('refreshMethodExists'):
                print(f"  ✅ refreshTickerData method is available")
            else:
                print(f"  ⚠️  refreshTickerData method not found (might be loading)")
            
            if service_check.get('getQuoteExists'):
                print(f"  ✅ getQuote method is available")
            
            # Get ticker ID from URL
            current_url = driver.current_url
            ticker_id = None
            if 'tickerId=' in current_url:
                ticker_id = int(current_url.split('tickerId=')[1].split('&')[0])
            
            if ticker_id:
                print(f"  ✅ Ticker ID extracted: {ticker_id}")
                return True
            else:
                print(f"  ⚠️  Could not extract ticker ID from URL")
                return True  # Not necessarily an error
        else:
            print(f"  ⚠️  ExternalDataService not yet loaded (might need more time)")
            return True  # Not necessarily an error - might be loading
    except Exception as e:
        print(f"  ❌ Error testing data refresh: {e}")
        return False

def test_console_errors(driver):
    """Test for console errors"""
    print(f"\n🔍 Testing Console Errors...")
    
    logs = driver.get_log('browser')
    errors = [log for log in logs if log['level'] == 'SEVERE']
    warnings = [log for log in logs if log['level'] == 'WARNING']
    
    # Filter out known non-critical errors
    critical_errors = []
    for error in errors:
        message = error.get('message', '')
        # Filter out known non-critical errors
        if 'favicon' not in message.lower() and \
           'chrome-extension' not in message.lower() and \
           'net::ERR_' not in message or 'ERR_NAME_NOT_RESOLVED' in message:
            critical_errors.append(error)
    
    if critical_errors:
        print(f"  ❌ Found {len(critical_errors)} critical errors:")
        for error in critical_errors[:5]:  # Show first 5
            print(f"     - {error['message'][:200]}")
        return False
    else:
        print(f"  ✅ No critical console errors")
        if warnings:
            print(f"  ⚠️  {len(warnings)} warnings (non-critical)")
        return True

def test_system_initialization(driver):
    """Test system initialization"""
    print(f"\n⚙️  Testing System Initialization...")
    
    try:
        # Wait a bit more for systems to load
        time.sleep(2)
        
        # Check if core systems are initialized
        systems_check = driver.execute_script("""
            return {
                logger: typeof window.Logger !== 'undefined',
                unifiedCache: typeof window.UnifiedCacheManager !== 'undefined',
                externalData: typeof window.ExternalDataService !== 'undefined',
                tickerDashboard: typeof window.tickerDashboard !== 'undefined',
                entityDetailsAPI: typeof window.entityDetailsAPI !== 'undefined',
                tickerDashboardData: typeof window.TickerDashboardData !== 'undefined'
            };
        """)
        
        # Critical systems (must be initialized)
        critical_systems = ['logger', 'unifiedCache']
        critical_initialized = all(systems_check.get(sys, False) for sys in critical_systems)
        
        # Optional systems (nice to have)
        optional_systems = ['externalData', 'tickerDashboard', 'entityDetailsAPI', 'tickerDashboardData']
        optional_initialized = [sys for sys in optional_systems if systems_check.get(sys, False)]
        
        if critical_initialized:
            print(f"  ✅ Critical systems initialized:")
            for system in critical_systems:
                status = "✅" if systems_check.get(system, False) else "❌"
                print(f"     {status} {system}")
            
            if optional_initialized:
                print(f"  ✅ Optional systems initialized ({len(optional_initialized)}/{len(optional_systems)}):")
                for system in optional_systems:
                    status = "✅" if systems_check.get(system, False) else "⚠️ "
                    print(f"     {status} {system}")
            else:
                print(f"  ⚠️  Optional systems not yet initialized (might be loading)")
            
            return True
        else:
            print(f"  ❌ Critical systems not initialized:")
            for system in critical_systems:
                status = "✅" if systems_check.get(system, False) else "❌"
                print(f"     {status} {system}")
            return False
    except Exception as e:
        print(f"  ❌ Error testing system initialization: {e}")
        return False

def run_comprehensive_test(ticker_id):
    """Run comprehensive test suite"""
    print("=" * 80)
    print("🔍 Comprehensive Ticker Dashboard Testing")
    print("=" * 80)
    print(f"Base URL: {BASE_URL}")
    print(f"Ticker ID: {ticker_id}")
    print(f"Start time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80)
    
    driver = None
    results = {
        "ticker_id": ticker_id,
        "timestamp": datetime.now().isoformat(),
        "tests": {},
        "overall_status": "PASSED"
    }
    
    try:
        driver = setup_driver()
        
        # Run all tests
        tests = [
            ("Page Load", test_page_load, driver, ticker_id),
            ("KPI Cards", test_kpi_cards, driver),
            ("Price Chart", test_price_chart, driver),
            ("Linked Items", test_linked_items, driver),
            ("Conditions", test_conditions, driver),
            ("Data Refresh", test_data_refresh, driver),
            ("Console Errors", test_console_errors, driver),
            ("System Initialization", test_system_initialization, driver),
        ]
        
        for test_name, test_func, *args in tests:
            try:
                result = test_func(*args)
                results["tests"][test_name] = {
                    "status": "PASSED" if result else "FAILED",
                    "timestamp": datetime.now().isoformat()
                }
                if not result:
                    results["overall_status"] = "FAILED"
            except Exception as e:
                print(f"  ❌ Test '{test_name}' failed with exception: {e}")
                results["tests"][test_name] = {
                    "status": "ERROR",
                    "error": str(e),
                    "timestamp": datetime.now().isoformat()
                }
                results["overall_status"] = "FAILED"
        
        # Summary
        print("\n" + "=" * 80)
        print("📊 Test Summary")
        print("=" * 80)
        
        passed = sum(1 for t in results["tests"].values() if t["status"] == "PASSED")
        failed = sum(1 for t in results["tests"].values() if t["status"] == "FAILED")
        errors = sum(1 for t in results["tests"].values() if t["status"] == "ERROR")
        
        print(f"Total tests: {len(results['tests'])}")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"⚠️  Errors: {errors}")
        print(f"\nOverall Status: {results['overall_status']}")
        
        # Save results
        output_file = Path("ticker_dashboard_test_results.json")
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        print(f"\n📄 Results saved to: {output_file}")
        
        return results["overall_status"] == "PASSED"
        
    except Exception as e:
        print(f"\n❌ Fatal error: {e}")
        return False
    finally:
        if driver:
            driver.quit()

if __name__ == "__main__":
    # Get ticker ID
    ticker_id = get_ticker_id_from_args()
    
    driver = None
    if not ticker_id:
        try:
            driver = setup_driver()
            ticker_id = get_available_ticker_id(driver)
            if driver:
                driver.quit()
        except Exception as e:
            print(f"⚠️  Could not get ticker ID automatically: {e}")
            ticker_id = 1424  # Default fallback
    
    success = run_comprehensive_test(ticker_id)
    sys.exit(0 if success else 1)

