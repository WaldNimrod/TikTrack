#!/usr/bin/env python3
"""
Team B Auth UI Impact Classification Test
Tests auth_401 and auth_required pages to classify UI impact
"""

import time
import json
from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException

def setup_driver():
    """Setup Firefox driver for testing"""
    options = Options()
    options.add_argument('--headless')  # Run in headless mode
    options.add_argument('--disable-gpu')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')

    driver = webdriver.Firefox(options=options)
    driver.implicitly_wait(10)
    return driver

def test_auth_page(driver, url, page_name):
    """Test a single auth page and classify UI impact"""
    try:
        print(f"Testing {page_name}: {url}")

        # Navigate to page
        driver.get(url)
        time.sleep(2)  # Wait for page to load

        # Check for auth-related elements
        auth_indicators = {
            'login_form': False,
            'error_message': False,
            'loading_spinner': False,
            'redirect_message': False,
            'broken_ui': False
        }

        # Look for login form
        try:
            login_form = driver.find_element(By.ID, 'login-form') or \
                        driver.find_element(By.CLASS_NAME, 'login-form') or \
                        driver.find_elements(By.XPATH, "//input[@type='password']")
            if login_form:
                auth_indicators['login_form'] = True
        except:
            pass

        # Look for error messages
        try:
            error_elements = driver.find_elements(By.XPATH, "//*[contains(text(), '401') or contains(text(), 'UNAUTHORIZED') or contains(text(), 'Authentication required')]")
            if error_elements:
                auth_indicators['error_message'] = True
        except:
            pass

        # Look for loading spinners that never resolve
        try:
            spinners = driver.find_elements(By.CLASS_NAME, 'spinner') or \
                      driver.find_elements(By.CLASS_NAME, 'loading') or \
                      driver.find_elements(By.XPATH, "//*[contains(@class, 'spin') or contains(@class, 'load')]")
            if spinners:
                auth_indicators['loading_spinner'] = True
        except:
            pass

        # Look for redirect messages
        try:
            redirects = driver.find_elements(By.XPATH, "//*[contains(text(), 'redirect') or contains(text(), 'login required')]")
            if redirects:
                auth_indicators['redirect_message'] = True
        except:
            pass

        # Check for broken UI (empty page, missing content)
        try:
            body_text = driver.find_element(By.TAG_NAME, 'body').text.strip()
            if len(body_text) < 50:  # Very little content
                auth_indicators['broken_ui'] = True
        except:
            pass

        # Get console errors
        console_errors = []
        try:
            logs = driver.get_log('browser')
            for log in logs:
                if log['level'] == 'SEVERE':
                    console_errors.append(log['message'])
        except:
            pass

        return {
            'page': page_name,
            'url': url,
            'auth_indicators': auth_indicators,
            'console_errors': len(console_errors),
            'ui_impact_classification': classify_ui_impact(auth_indicators, console_errors)
        }

    except Exception as e:
        return {
            'page': page_name,
            'url': url,
            'error': str(e),
            'ui_impact_classification': 'TEST_FAILED'
        }

def classify_ui_impact(auth_indicators, console_errors):
    """Classify the UI impact based on auth indicators"""

    # Critical: Broken UI or excessive errors
    if auth_indicators.get('broken_ui') or len(console_errors) > 5:
        return 'CRITICAL_UI_BROKEN'

    # High: Login form present but broken, or error messages visible
    if auth_indicators.get('login_form') and (auth_indicators.get('error_message') or auth_indicators.get('broken_ui')):
        return 'HIGH_AUTH_FORM_BROKEN'

    # Medium: Loading spinners that don't resolve
    if auth_indicators.get('loading_spinner'):
        return 'MEDIUM_LOADING_STUCK'

    # Low: Error messages but UI still functional
    if auth_indicators.get('error_message'):
        return 'LOW_ERROR_VISIBLE'

    # Minimal: Redirect messages or subtle auth hints
    if auth_indicators.get('redirect_message'):
        return 'MINIMAL_REDIRECT_MESSAGE'

    # Unknown: No clear auth UI impact detected
    return 'UNKNOWN_NO_UI_IMPACT'

def main():
    """Main test execution"""
    driver = None
    results = []

    try:
        driver = setup_driver()

        # Test key auth pages from the matrix
        auth_pages = [
            ('/', 'homepage', 'auth_required'),
            ('/trades', 'trades', 'auth_401'),
            ('/executions', 'executions', 'auth_401'),
            ('/trade_plans', 'trade_plans', 'auth_401'),
            ('/tickers', 'tickers', 'auth_401'),
            ('/crud_testing_dashboard', 'crud_testing_dashboard', 'auth_required'),
            ('/register', 'register', 'auth_required'),
            ('/forgot_password', 'forgot_password', 'auth_required'),
            ('/reset_password', 'reset_password', 'auth_required')
        ]

        base_url = 'http://localhost:8080'

        for path, name, auth_type in auth_pages:
            url = f"{base_url}{path}"
            result = test_auth_page(driver, url, name)
            result['auth_type'] = auth_type
            results.append(result)

            print(f"✓ {name}: {result['ui_impact_classification']}")

    except Exception as e:
        print(f"Test setup failed: {e}")
        results.append({
            'error': 'TEST_SETUP_FAILED',
            'details': str(e)
        })

    finally:
        if driver:
            driver.quit()

    # Save results
    with open('documentation/05-REPORTS/artifacts/2026_01_02/team_b_auth_ui_impact_classification_2026_01_02.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    # Print summary
    print("\n=== Team B Auth UI Impact Classification Results ===")
    for result in results:
        if 'error' not in result:
            print(f"{result['page']}: {result['ui_impact_classification']} ({result['auth_type']})")

if __name__ == '__main__':
    main()
