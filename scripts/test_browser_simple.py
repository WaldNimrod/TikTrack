#!/usr/bin/env python3
"""
Simple automated browser testing
Tests pages for console errors and basic functionality
"""

import sys
import time
import json
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.firefox.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, WebDriverException
from webdriver_manager.firefox import GeckoDriverManager

PROJECT_ROOT = Path(__file__).parent.parent
BASE_URL = "http://localhost:5001"

TEST_PAGES = [
    'cash_flows.html',
    'trades.html',
    'trade_plans.html'
]

def test_page_in_browser(page_url):
    """Test a single page"""
    print(f"\n🧪 Testing {page_url}...")

    driver = None
    try:
        # Setup Firefox
        firefox_options = Options()
        firefox_options.add_argument('--headless')
        firefox_options.add_argument('--no-sandbox')
        firefox_options.add_argument('--disable-dev-shm-usage')

        driver = webdriver.Firefox(
            service=Service(GeckoDriverManager().install()),
            options=firefox_options
        )

        # Navigate to page
        driver.get(f"{BASE_URL}/{page_url}")

        # Wait for page load
        WebDriverWait(driver, 20).until(
            lambda d: d.execute_script("return document.readyState") == "complete"
        )

        # Wait for systems to load
        time.sleep(3)

        # Check for JavaScript errors (using a simple method)
        try:
            errors = driver.execute_script("""
                return window.jsErrors || [];
            """)
        except:
            errors = []

        # Check critical systems
        modal_manager = driver.execute_script("return typeof window.ModalManagerV2 !== 'undefined'")
        logger = driver.execute_script("return typeof window.Logger !== 'undefined'")

        # Get page title
        title = driver.title

        # Check for basic functionality
        add_buttons = driver.find_elements(By.CSS_SELECTOR, "button[data-action='add'], .add-btn")
        has_add_buttons = len(add_buttons) > 0

        result = {
            'page': page_url,
            'title': title,
            'modal_manager': modal_manager,
            'logger': logger,
            'has_add_buttons': has_add_buttons,
            'errors': len(errors) if isinstance(errors, list) else 0,
            'status': 'PASS' if modal_manager and logger and len(errors) == 0 else 'FAIL'
        }

        print(f"  📄 Title: {title}")
        print(f"  🔧 ModalManagerV2: {modal_manager}")
        print(f"  🔧 Logger: {logger}")
        print(f"  🎯 Add buttons: {has_add_buttons}")
        print(f"  ⚠️  Errors: {result['errors']}")
        print(f"  📊 Status: {result['status']}")

        return result

    except Exception as e:
        print(f"  ❌ Failed: {e}")
        return {
            'page': page_url,
            'status': 'ERROR',
            'error': str(e)
        }
    finally:
        if driver:
            driver.quit()

def main():
    print("🚀 Simple Browser Testing")
    print("Testing pages for console errors and functionality\n")

    results = []

    for page in TEST_PAGES:
        result = test_page_in_browser(page)
        results.append(result)

    # Summary
    print("\n" + "="*50)
    print("📊 RESULTS SUMMARY")
    print("="*50)

    passed = 0
    failed = 0

    for result in results:
        status = result.get('status', 'UNKNOWN')
        if status == 'PASS':
            passed += 1
            print(f"✅ {result['page']}: PASS")
        else:
            failed += 1
            print(f"❌ {result['page']}: {status}")

    print(f"\n📈 Total: {passed} passed, {failed} failed")

    if failed == 0:
        print("\n🎉 ALL TESTS PASSED!")
        print("✅ Browser functionality working correctly")
        return True
    else:
        print("\n⚠️  SOME TESTS FAILED")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)









