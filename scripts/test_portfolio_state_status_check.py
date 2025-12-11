#!/usr/bin/env python3
"""
Simple status check for portfolio-state page
Tests if the page loads correctly and shows current state
"""

import json
import time
from datetime import datetime
from pathlib import Path

try:
    from selenium import webdriver
    from selenium.webdriver.chrome.service import Service
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from webdriver_manager.chrome import ChromeDriverManager
except ImportError:
    print("❌ Error: selenium or webdriver-manager not installed.")
    print("   Install with: pip install selenium webdriver-manager")
    exit(1)

BASE_URL = "http://localhost:8080"
PAGE_URL = f"{BASE_URL}/portfolio-state"

REPORTS_DIR = Path(__file__).parent.parent / "reports" / "qa"
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

def setup_driver():
    chrome_options = Options()
    chrome_options.add_argument('--headless=new')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--window-size=1920,1080')

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    driver.set_script_timeout(60)
    return driver

def check_page_status(driver):
    """Check basic page status without authentication"""
    print("🔍 Checking portfolio-state page status...")

    driver.get(PAGE_URL)

    # Wait for page to load
    WebDriverWait(driver, 30).until(
        lambda d: d.execute_script('return document.readyState') == 'complete'
    )

    time.sleep(3)  # Wait for JS to initialize

    # Check basic page elements
    status = {
        'page_loaded': True,
        'title': driver.title,
        'url': driver.current_url
    }

    # Check for login modal
    try:
        login_modal = driver.find_element(By.ID, "loginModal")
        status['login_modal_visible'] = login_modal.is_displayed()
        print(f"🔐 Login modal visible: {status['login_modal_visible']}")
    except:
        status['login_modal_visible'] = False
        print("🔐 No login modal found")

    # Check authentication status
    try:
        auth_status = driver.execute_script("""
            return {
                tikTrackAuth: !!window.TikTrackAuth,
                isAuthenticated: window.TikTrackAuth ? window.TikTrackAuth.isAuthenticated() : false,
                currentUser: !!window.currentUser,
                userId: window.currentUser ? window.currentUser.id : null,
                username: window.currentUser ? window.currentUser.username : null
            };
        """)
        status['authentication'] = auth_status
        print(f"🔑 Auth status: {auth_status}")
    except Exception as e:
        status['authentication'] = {'error': str(e)}
        print(f"❌ Auth check failed: {e}")

    # Check systems availability
    try:
        systems_status = driver.execute_script("""
            return {
                unifiedTableSystem: !!window.UnifiedTableSystem,
                infoSummarySystem: !!window.InfoSummarySystem,
                unifiedProgressManager: !!window.UnifiedProgressManager,
                buttonSystem: !!window.ButtonSystem,
                logger: !!window.Logger,
                cacheManager: !!window.UnifiedCacheManager
            };
        """)
        status['systems'] = systems_status
        print(f"⚙️ Systems status: {systems_status}")
    except Exception as e:
        status['systems'] = {'error': str(e)}
        print(f"❌ Systems check failed: {e}")

    # Check for data elements
    try:
        data_elements = driver.execute_script("""
            return {
                summaryCards: document.querySelectorAll('[data-summary-card]').length,
                chartContainer: !!document.getElementById('unified-portfolio-chart-container'),
                tradesTable: !!document.getElementById('tradesTable'),
                datePickers: document.querySelectorAll('input[type="date"]').length
            };
        """)
        status['data_elements'] = data_elements
        print(f"📊 Data elements: {data_elements}")
    except Exception as e:
        status['data_elements'] = {'error': str(e)}
        print(f"❌ Data elements check failed: {e}")

    # Check console errors
    try:
        logs = driver.get_log('browser')
        errors = [log for log in logs if log.get('level') == 'SEVERE']
        warnings = [log for log in logs if log.get('level') == 'WARNING']
        status['console'] = {
            'errors': len(errors),
            'warnings': len(warnings),
            'total_logs': len(logs)
        }
        print(f"📋 Console: {len(errors)} errors, {len(warnings)} warnings, {len(logs)} total logs")

        if errors:
            print("🚨 Critical errors found:")
            for error in errors[:3]:  # Show first 3
                print(f"  - {error.get('message', '')}")
    except Exception as e:
        status['console'] = {'error': str(e)}
        print(f"❌ Console check failed: {e}")

    return status

def main():
    print("🚀 Portfolio State Page Status Check")
    print("=" * 50)

    driver = setup_driver()

    try:
        status = check_page_status(driver)

        # Save report
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        report_file = REPORTS_DIR / f'portfolio_state_status_{timestamp}.json'

        report = {
            'timestamp': datetime.now().isoformat(),
            'status': status
        }

        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2)

        print(f"\n📄 Report saved: {report_file}")

        # Summary
        print("\n📊 SUMMARY:")
        print(f"  ✅ Page loaded: {status.get('page_loaded', False)}")
        print(f"  🔐 Login required: {status.get('login_modal_visible', True)}")
        print(f"  🔑 Authenticated: {status.get('authentication', {}).get('isAuthenticated', False)}")
        print(f"  ⚙️ Systems ready: {all(status.get('systems', {}).values())}")
        print(f"  📊 Data elements present: {bool(status.get('data_elements', {}).get('chartContainer'))}")
        print(f"  🚨 Console errors: {status.get('console', {}).get('errors', 0)}")

        # Recommendations
        recommendations = []

        if status.get('login_modal_visible'):
            recommendations.append("🔐 Page requires authentication")

        if not status.get('authentication', {}).get('isAuthenticated', False):
            recommendations.append("🔑 User not authenticated")

        if not all(status.get('systems', {}).values()):
            recommendations.append("⚙️ Some systems not loaded")

        if status.get('console', {}).get('errors', 0) > 0:
            recommendations.append(f"🚨 {status['console']['errors']} console errors detected")

        if recommendations:
            print("\n💡 RECOMMENDATIONS:")
            for rec in recommendations:
                print(f"  • {rec}")

    finally:
        driver.quit()

if __name__ == '__main__':
    main()

