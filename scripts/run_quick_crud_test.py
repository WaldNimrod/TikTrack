#!/usr/bin/env python3
"""
Quick CRUD test runner - runs comprehensive tests on 3 main pages
"""

import json
import os
import time
import sys
from pathlib import Path

try:
    from selenium import webdriver
    from selenium.webdriver.firefox.service import Service as FirefoxService
    from selenium.webdriver.firefox.options import Options as FirefoxOptions
    from selenium.webdriver.chrome.service import Service as ChromeService
    from selenium.webdriver.chrome.options import Options as ChromeOptions
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.common.exceptions import TimeoutException, WebDriverException
    from webdriver_manager.firefox import GeckoDriverManager
    from webdriver_manager.chrome import ChromeDriverManager
except ImportError:
    print("❌ Error: selenium or webdriver-manager not installed.")
    print("   Install with: pip install selenium webdriver-manager")
    exit(1)

BASE_URL = "http://localhost:8080"
DEFAULT_PAGES = ['index', 'trades', 'alerts']
SKIP_PAGES = {
    'ai_analysis',
    'ticker_dashboard',
    'trading_journal',
    'trade_history',
    'portfolio_state',
    'data_import',
}

def _extract_pages_from_md(content, start_marker, end_marker):
    start_idx = content.find(start_marker)
    if start_idx == -1:
        return []
    end_idx = content.find(end_marker, start_idx)
    if end_idx == -1:
        end_idx = len(content)
    segment = content[start_idx:end_idx]
    pages = []
    for line in segment.splitlines():
        if "|" not in line:
            continue
        if "**" not in line:
            continue
        cells = [c.strip() for c in line.split("|") if c.strip()]
        if not cells:
            continue
        first_cell = cells[0]
        name = first_cell.replace("**", "").strip()
        if not name or name.lower().startswith("עמוד"):
            continue
        if name.endswith(".html"):
            name = name[:-5]
        pages.append(name)
    return pages

def load_documented_user_pages():
    doc_path = Path(__file__).parent.parent / "documentation" / "PAGES_LIST.md"
    if not doc_path.exists():
        return []
    content = doc_path.read_text(encoding="utf-8")
    pages = _extract_pages_from_md(
        content,
        "## 🟢 עמודי משתמש עיקריים",
        "## 🔵 עמודי אימות"
    )
    deduped = []
    seen = set()
    for page in pages:
        if page and page not in seen:
            deduped.append(page)
            seen.add(page)
    return deduped

def setup_driver():
    """Setup Firefox driver"""
    os.environ.setdefault("WDM_LOCAL", "1")

    gecko_path = os.environ.get("GECKODRIVER_PATH")
    chrome_path = os.environ.get("CHROMEDRIVER_PATH")

    firefox_options = FirefoxOptions()
    firefox_options.add_argument("--headless")
    firefox_options.add_argument("--no-sandbox")
    firefox_options.add_argument("--disable-dev-shm-usage")
    firefox_options.add_argument("--disable-gpu")
    firefox_options.add_argument("--window-size=1920,1080")

    try:
        service = FirefoxService(gecko_path or GeckoDriverManager().install())
        driver = webdriver.Firefox(service=service, options=firefox_options)
        driver.set_page_load_timeout(30)
        driver.set_script_timeout(180)
        return driver
    except Exception as exc:
        print(f"⚠️ Firefox driver failed: {exc}")
        print("↪️ Trying Chrome driver...")

    chrome_options = ChromeOptions()
    chrome_options.add_argument("--headless=new")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920,1080")

    service = ChromeService(chrome_path or ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    driver.set_page_load_timeout(30)
    driver.set_script_timeout(180)
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
            var timeoutMs = 90000;
            var doneCalled = false;

            function done(payload) {{
                if (doneCalled) return;
                doneCalled = true;
                clearTimeout(timeoutId);
                callback(payload);
            }}

            var timeoutId = setTimeout(function() {{
                done({{
                    page: pageName,
                    loadingOrder: {{loadingOrder: 'ERROR', error: 'Timeout waiting for CRUD test'}},
                    crud: {{crud: 'ERROR', error: 'Timeout waiting for CRUD test'}},
                    success: false
                }});
            }}, timeoutMs);

            function loadScriptOnce(src) {{
                return new Promise(function(resolve, reject) {{
                    if (document.querySelector('script[src=\"' + src + '\"]')) {{
                        resolve('already_loaded');
                        return;
                    }}
                    var script = document.createElement('script');
                    script.src = src;
                    script.onload = function() {{ resolve('loaded'); }};
                    script.onerror = function() {{ reject(new Error('Failed to load ' + src)); }};
                    document.head.appendChild(script);
                }});
            }}

            function checkLoadingOrderInline() {{
                try {{
                    var scripts = Array.from(document.querySelectorAll('script[src]'));
                    var modalManagerIndex = scripts.findIndex(s => s.src.includes('modal-manager-v2.js'));
                    var modalConfigs = scripts.filter(s => s.src.includes('modal-configs/'));
                    var issues = [];
                    modalConfigs.forEach(config => {{
                        var configIndex = scripts.indexOf(config);
                        if (configIndex > modalManagerIndex) {{
                            issues.push(config.src.split('/').pop() + ' loads AFTER modal-manager-v2.js');
                        }}
                    }});
                    return Promise.resolve({{
                        page: pageName,
                        loadingOrder: issues.length === 0 ? 'OK' : 'ISSUES',
                        issues: issues
                    }});
                }} catch (error) {{
                    return Promise.resolve({{
                        page: pageName,
                        loadingOrder: 'ERROR',
                        error: error.message
                    }});
                }}
            }}

            try {{
                checkLoadingOrderInline().then(function(loadingResult) {{
                    var ensureCrudTester = Promise.resolve();
                    if (!window.CRUDEnhancedTester) {{
                        ensureCrudTester = loadScriptOnce('/scripts/crud-testing-enhanced.js');
                    }}

                    ensureCrudTester.then(function() {{
                        if (typeof testPageCRUD !== 'function') {{
                            throw new Error('testPageCRUD is not available');
                        }}
                        testPageCRUD(pageName).then(function(crudResult) {{
                            done({{
                                page: pageName,
                                loadingOrder: loadingResult,
                                crud: crudResult,
                                success: true
                            }});
                        }}).catch(function(crudError) {{
                            done({{
                                page: pageName,
                                loadingOrder: loadingResult,
                                crud: {{crud: 'ERROR', error: crudError.message}},
                                success: false
                            }});
                        }});
                    }}).catch(function(loadError) {{
                        done({{
                            page: pageName,
                            loadingOrder: loadingResult,
                            crud: {{crud: 'ERROR', error: loadError.message}},
                            success: false
                        }});
                    }});
                }}).catch(function(loadError) {{
                    done({{
                        page: pageName,
                        loadingOrder: {{loadingOrder: 'ERROR', error: loadError.message}},
                        crud: {{crud: 'ERROR', error: loadError.message}},
                        success: false
                    }});
                }});
            }} catch (globalError) {{
                done({{
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
    documented_pages = load_documented_user_pages()
    main_pages = [p for p in (documented_pages or DEFAULT_PAGES) if p not in SKIP_PAGES]
    print("🎯 Quick Comprehensive CRUD Tests")
    print(f"📋 Testing pages: {', '.join(main_pages)}")

    driver = None
    try:
        driver = setup_driver()

        if not login_admin(driver):
            return False

        results = []
        for page in main_pages:
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
            if crud.get('crud') in ('OK', 'PASSED'):
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
        print("\n📊 SUMMARY:")
        print(f"   ✅ Successful: {success_count}/{len(main_pages)}")
        print(f"   ❌ Failed: {len(main_pages) - success_count}/{len(main_pages)}")
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
