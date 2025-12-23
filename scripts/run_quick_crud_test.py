#!/usr/bin/env python3
"""
Quick CRUD test runner - runs comprehensive tests on 3 main pages
"""

import json
import time
import sys
from pathlib import Path

try:
    from selenium import webdriver
    from selenium.webdriver.firefox.service import Service as FirefoxService
    from selenium.webdriver.firefox.options import Options as FirefoxOptions
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.common.exceptions import TimeoutException, WebDriverException
    from webdriver_manager.firefox import GeckoDriverManager
except ImportError:
    print("❌ Error: selenium or webdriver-manager not installed.")
    print("   Install with: pip install selenium webdriver-manager")
    exit(1)

BASE_URL = "http://localhost:8080"
MAIN_PAGES = ['index', 'trades', 'alerts']

def setup_driver():
    """Setup Firefox driver"""
    options = FirefoxOptions()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1920,1080")

    service = FirefoxService(GeckoDriverManager().install())
    driver = webdriver.Firefox(service=service, options=options)
    driver.set_script_timeout(60)
    return driver

def login_admin(driver):
    """Login as admin"""
    try:
        print("🔐 Logging in as admin...")
        driver.get(f"{BASE_URL}/login.html")

        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "username"))
        )

        username_field = driver.find_element(By.ID, "username")
        password_field = driver.find_element(By.ID, "password")
        login_button = driver.find_element(By.ID, "loginBtn")

        username_field.clear()
        username_field.send_keys("admin")
        password_field.clear()
        password_field.send_keys("admin123")
        login_button.click()

        time.sleep(3)
        print("✅ Admin login completed")
        return True

    except Exception as e:
        print(f"❌ Admin login failed: {e}")
        return False

def test_single_page(driver, page_name):
    """Test a single page"""
    try:
        print(f"🧪 Testing page: {page_name}")

        # Navigate to page
        driver.get(f"{BASE_URL}/{page_name}.html" if page_name != 'index' else BASE_URL)

        # Wait for page load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )
        time.sleep(3)

        # Load test script
        script_path = Path(__file__).parent.parent / "trading-ui" / "scripts" / "comprehensive-crud-test-runner.js"
        with open(script_path, 'r', encoding='utf-8') as f:
            test_script = f.read()

        driver.execute_script(test_script)

        # Run tests
        result = driver.execute_async_script(f"""
            var callback = arguments[arguments.length - 1];
            var pageName = '{page_name}';

            try {{
                checkPageLoadingOrder(pageName).then(function(loadingResult) {{
                    testPageCRUD(pageName).then(function(crudResult) {{
                        callback({{
                            page: pageName,
                            loadingOrder: loadingResult,
                            crud: crudResult,
                            success: true
                        }});
                    }}).catch(function(crudError) {{
                        callback({{
                            page: pageName,
                            loadingOrder: loadingResult,
                            crud: {{crud: 'ERROR', error: crudError.message}},
                            success: false
                        }});
                    }});
                }}).catch(function(loadingError) {{
                    callback({{
                        page: pageName,
                        loadingOrder: {{loadingOrder: 'ERROR', error: loadingError.message}},
                        crud: {{crud: 'ERROR', error: 'Loading failed'}},
                        success: false
                    }});
                }});
            }} catch (globalError) {{
                callback({{
                    page: pageName,
                    loadingOrder: {{loadingOrder: 'ERROR', error: globalError.message}},
                    crud: {{crud: 'ERROR', error: globalError.message}},
                    success: false
                }});
            }}
        """)

        return result

    except Exception as e:
        return {
            'page': page_name,
            'loadingOrder': {'loadingOrder': 'ERROR', 'error': str(e)},
            'crud': {'crud': 'ERROR', 'error': str(e)},
            'success': False
        }

def main():
    """Main execution"""
    print("🎯 Quick Comprehensive CRUD Tests")
    print(f"📋 Testing pages: {', '.join(MAIN_PAGES)}")

    driver = None
    try:
        driver = setup_driver()

        if not login_admin(driver):
            return False

        results = []
        for page in MAIN_PAGES:
            result = test_single_page(driver, page)
            results.append(result)

            status = "✅ SUCCESS" if result.get('success') else "❌ FAILED"
            print(f"  {status}: {page}")

            # Print loading order result
            loading = result.get('loadingOrder', {})
            if loading.get('loadingOrder') == 'OK':
                print("    🔍 Loading Order: ✅ OK")
            else:
                print(f"    🔍 Loading Order: ❌ ERROR - {loading.get('error', 'Unknown')}")

            # Print CRUD result
            crud = result.get('crud', {})
            if crud.get('crud') == 'OK':
                print("    🧪 CRUD Tests: ✅ OK")
            else:
                print(f"    🧪 CRUD Tests: ❌ ERROR - {crud.get('error', 'Unknown')}")

        # Save results
        output_file = Path(__file__).parent.parent / "quick_crud_test_results.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)

        print(f"\n💾 Results saved to: {output_file}")

        # Summary
        success_count = sum(1 for r in results if r.get('success'))
        print("
📊 SUMMARY:"        print(f"   ✅ Successful: {success_count}/{len(MAIN_PAGES)}")
        print(".1f"
        return success_count > 0

    except Exception as e:
        print(f"❌ Script failed: {e}")
        return False

    finally:
        if driver:
            driver.quit()

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
