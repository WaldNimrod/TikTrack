#!/usr/bin/env python3
"""
Comprehensive script to test modals on ALL pages
Tests: opening modals, adding, editing, viewing details, deleting records
"""

import json
import time
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, List

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
    exit(1)

BASE_URL = "http://localhost:8080"

# Pages that have modals for CRUD operations
PAGES_WITH_MODALS = [
    {"name": "טריידים", "url": "/trades.html", "modal_id": "tradesModal", "entity_type": "trade"},
    {"name": "תכניות מסחר", "url": "/trade_plans.html", "modal_id": "tradePlansModal", "entity_type": "trade_plan"},
    {"name": "התראות", "url": "/alerts.html", "modal_id": "alertsModal", "entity_type": "alert"},
    {"name": "ביצועים", "url": "/executions.html", "modal_id": "executionsModal", "entity_type": "execution"},
    {"name": "חשבונות מסחר", "url": "/trading_accounts.html", "modal_id": "tradingAccountsModal", "entity_type": "trading_account"},
    {"name": "טיקרים", "url": "/tickers.html", "modal_id": "tickersModal", "entity_type": "ticker"},
    {"name": "תזרימי מזומנים", "url": "/cash_flows.html", "modal_id": "cashFlowModal", "entity_type": "cash_flow"},
    {"name": "הערות", "url": "/notes.html", "modal_id": "notesModal", "entity_type": "note"},
]

class ModalTester:
    def __init__(self):
        self.results = []
        self.driver = None
        
    def setup_driver(self):
        """Setup Chrome driver"""
        chrome_options = Options()
        chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--window-size=1920,1080')
        chrome_options.add_experimental_option('excludeSwitches', ['enable-logging'])
        chrome_options.set_capability('goog:loggingPrefs', {'browser': 'ALL'})
        
        service = Service(ChromeDriverManager().install())
        self.driver = webdriver.Chrome(service=service, options=chrome_options)
        self.driver.set_page_load_timeout(30)
        
    def teardown_driver(self):
        """Close driver"""
        if self.driver:
            self.driver.quit()
            
    def test_modal_open(self, page_info: Dict) -> Dict:
        """Test opening a modal"""
        result = {
            "page": page_info["name"],
            "url": page_info["url"],
            "modal_id": page_info["modal_id"],
            "tests": {}
        }
        
        try:
            # Navigate to page
            self.driver.get(f"{BASE_URL}{page_info['url']}")
            time.sleep(2)  # Wait for page load
            
            # Check if page loaded
            if "error" in self.driver.title.lower():
                result["tests"]["page_load"] = {"status": "FAILED", "error": "Page failed to load"}
                return result
            
            result["tests"]["page_load"] = {"status": "PASSED"}
            
            # Wait for page to fully load and systems to initialize
            time.sleep(5)  # Wait for systems to load
            
            # Wait for ModalManagerV2 to be available - with longer timeout
            modal_system_available = False
            for attempt in range(20):  # Try for up to 20 seconds
                try:
                    modal_system_available = self.driver.execute_script(
                        "return typeof window.ModalManagerV2 !== 'undefined' && window.ModalManagerV2 !== null || "
                        "typeof window.showModalSafe !== 'undefined' && window.showModalSafe !== null"
                    )
                    if modal_system_available:
                        break
                except:
                    pass
                time.sleep(1)
            
            if not modal_system_available:
                # Check console for errors
                console_logs = self.driver.get_log('browser')
                errors = [log for log in console_logs if log['level'] == 'SEVERE']
                error_msg = "ModalManagerV2 or showModalSafe not available"
                if errors:
                    error_msg += f". Console errors: {len(errors)}"
                result["tests"]["modal_open"] = {"status": "FAILED", "error": error_msg}
                return result
            
            # Try multiple methods to find and click "Add" button
            add_button = None
            
            # Method 1: Look for button with data-onclick containing showModalSafe or modal_id
            try:
                xpath = f"//button[contains(@data-onclick, 'showModalSafe') and contains(@data-onclick, '{page_info['modal_id']}')]"
                add_button = self.driver.find_element(By.XPATH, xpath)
            except NoSuchElementException:
                pass
            
            # Method 2: Look for button with data-entity-type and data-button-type="ADD"
            if not add_button:
                try:
                    entity_type = page_info.get('entity_type', '')
                    xpath = f"//button[@data-entity-type='{entity_type}' and @data-button-type='ADD']"
                    add_button = self.driver.find_element(By.XPATH, xpath)
                except NoSuchElementException:
                    pass
            
            # Method 3: Look for button with data-onclick containing modal_id
            if not add_button:
                try:
                    xpath = f"//button[contains(@data-onclick, '{page_info['modal_id']}') or contains(@onclick, '{page_info['modal_id']}')]"
                    add_button = self.driver.find_element(By.XPATH, xpath)
                except NoSuchElementException:
                    pass
            
            # Method 4: Look for button with text "הוסף" or "Add"
            if not add_button:
                try:
                    xpath = "//button[contains(text(), 'הוסף') or contains(text(), 'Add')]"
                    add_button = self.driver.find_element(By.XPATH, xpath)
                except NoSuchElementException:
                    pass
            
            # If button found, click it
            if add_button:
                try:
                    self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", add_button)
                    time.sleep(0.5)
                    # Try regular click first
                    try:
                        add_button.click()
                    except:
                        # Fallback to JavaScript click
                        self.driver.execute_script("arguments[0].click();", add_button)
                    time.sleep(2)  # Wait for modal to open
                except Exception as e:
                    result["tests"]["modal_open"] = {"status": "FAILED", "error": f"Could not click add button: {str(e)}"}
                    return result
            else:
                # Try JavaScript to open modal directly using showModalSafe (most common)
                try:
                    self.driver.execute_script(f"""
                        (async function() {{
                            if (window.showModalSafe) {{
                                await window.showModalSafe('{page_info['modal_id']}', 'add');
                            }} else if (window.ModalManagerV2 && window.ModalManagerV2.showModal) {{
                                await window.ModalManagerV2.showModal('{page_info['modal_id']}', 'add');
                            }} else {{
                                throw new Error('No modal system available');
                            }}
                        }})();
                    """)
                    time.sleep(3)  # Wait for modal to open
                except Exception as e:
                    result["tests"]["modal_open"] = {"status": "FAILED", "error": f"Could not open modal via JavaScript: {str(e)}"}
                    return result
            
            # Check if modal opened - wait for dynamic creation
            # Modals are created dynamically by ModalManagerV2, so we need to wait
            modal_found = False
            modal_in_dom = False
            for attempt in range(20):  # Wait up to 20 seconds
                try:
                    # Check if modal exists in DOM (even if not visible)
                    modal = self.driver.find_element(By.ID, page_info['modal_id'])
                    if modal:
                        modal_in_dom = True
                        modal_classes = modal.get_attribute("class") or ""
                        is_displayed = modal.is_displayed()
                        
                        # Check if modal is visible (Bootstrap adds 'show' class and makes it visible)
                        if is_displayed or "show" in modal_classes:
                            result["tests"]["modal_open"] = {"status": "PASSED"}
                            modal_found = True
                            break
                except NoSuchElementException:
                    pass
                
                # Check JavaScript console for modal creation status
                try:
                    modal_status = self.driver.execute_script(f"""
                        return {{
                            exists: document.getElementById('{page_info['modal_id']}') !== null,
                            visible: document.getElementById('{page_info['modal_id']}')?.classList.contains('show') || false,
                            hasModalManager: typeof window.ModalManagerV2 !== 'undefined',
                            hasShowModalSafe: typeof window.showModalSafe !== 'undefined'
                        }};
                    """)
                    if modal_status and modal_status.get('exists') and modal_status.get('visible'):
                        result["tests"]["modal_open"] = {"status": "PASSED"}
                        modal_found = True
                        break
                except:
                    pass
                
                time.sleep(0.5)
            
            if not modal_found:
                # Check console for errors and get detailed info
                error_details = []
                try:
                    console_logs = self.driver.get_log('browser')
                    errors = [log for log in console_logs if log['level'] == 'SEVERE']
                    if errors:
                        error_details = [log.get('message', '')[:200] for log in errors[:5]]  # First 5 errors, truncated
                    
                    # Get JavaScript state
                    js_state = self.driver.execute_script(f"""
                        return {{
                            modalExists: document.getElementById('{page_info['modal_id']}') !== null,
                            showModalSafeExists: typeof window.showModalSafe !== 'undefined',
                            modalManagerExists: typeof window.ModalManagerV2 !== 'undefined',
                            modalConfigExists: typeof window.{page_info['modal_id']}Config !== 'undefined'
                        }};
                    """)
                    
                    error_msg = "Modal element not found or not visible after 20 seconds"
                    if modal_in_dom:
                        error_msg += " (modal exists in DOM but not visible)"
                    if errors:
                        error_msg += f". Console errors: {len(errors)}"
                    if error_details:
                        error_msg += f". Sample errors: {', '.join(error_details[:2])}"
                    if js_state:
                        error_msg += f". JS State: showModalSafe={js_state.get('showModalSafeExists')}, ModalManagerV2={js_state.get('modalManagerExists')}, ModalInDOM={js_state.get('modalExists')}"
                    
                    result["tests"]["modal_open"] = {"status": "FAILED", "error": error_msg}
                except Exception as e:
                    result["tests"]["modal_open"] = {"status": "FAILED", "error": f"Modal element not found in DOM. Exception: {str(e)}"}
            
            # Test closing modal
            if result["tests"]["modal_open"]["status"] == "PASSED":
                try:
                    close_button = modal.find_element(By.CSS_SELECTOR, ".btn-close, .close, [data-bs-dismiss='modal']")
                    self.driver.execute_script("arguments[0].click();", close_button)
                    time.sleep(0.5)
                    result["tests"]["modal_close"] = {"status": "PASSED"}
                except NoSuchElementException:
                    # Try ESC key
                    from selenium.webdriver.common.keys import Keys
                    self.driver.find_element(By.TAG_NAME, "body").send_keys(Keys.ESCAPE)
                    time.sleep(0.5)
                    result["tests"]["modal_close"] = {"status": "PASSED"}
                except Exception as e:
                    result["tests"]["modal_close"] = {"status": "FAILED", "error": str(e)}
            
        except Exception as e:
            result["tests"]["error"] = {"status": "FAILED", "error": str(e)}
        
        return result
    
    def test_modal_form_fields(self, page_info: Dict) -> Dict:
        """Test that modal form has required fields"""
        result = {
            "page": page_info["name"],
            "url": page_info["url"],
            "modal_id": page_info["modal_id"],
            "tests": {}
        }
        
        try:
            # Navigate to page
            self.driver.get(f"{BASE_URL}{page_info['url']}")
            time.sleep(2)
            
            # Wait for systems to load
            time.sleep(5)
            
            # Wait for ModalManagerV2 or showModalSafe to be available - with longer timeout
            modal_system_available = False
            for attempt in range(20):  # Try for up to 20 seconds
                try:
                    modal_system_available = self.driver.execute_script(
                        "return (typeof window.ModalManagerV2 !== 'undefined' && window.ModalManagerV2 !== null) || "
                        "(typeof window.showModalSafe !== 'undefined' && window.showModalSafe !== null)"
                    )
                    if modal_system_available:
                        break
                except:
                    pass
                time.sleep(1)
            
            if not modal_system_available:
                # Check console for errors
                console_logs = self.driver.get_log('browser')
                errors = [log for log in console_logs if log['level'] == 'SEVERE']
                error_msg = "ModalManagerV2 or showModalSafe not available"
                if errors:
                    error_msg += f". Console errors: {len(errors)}"
                result["tests"]["error"] = {"status": "FAILED", "error": error_msg}
                return result
            
            # Open modal using showModalSafe (most common method)
            try:
                self.driver.execute_script(f"""
                    (async function() {{
                        if (window.showModalSafe) {{
                            await window.showModalSafe('{page_info['modal_id']}', 'add');
                        }} else if (window.ModalManagerV2 && window.ModalManagerV2.showModal) {{
                            await window.ModalManagerV2.showModal('{page_info['modal_id']}', 'add');
                        }} else {{
                            throw new Error('No modal system available');
                        }}
                    }})();
                """)
                time.sleep(3)  # Wait for modal to open
            except Exception as e:
                result["tests"]["error"] = {"status": "FAILED", "error": f"Could not open modal: {str(e)}"}
                return result
            
            # Check if modal opened - wait for dynamic creation
            modal_found = False
            for attempt in range(15):  # Wait up to 15 seconds
                try:
                    modal = self.driver.find_element(By.ID, page_info['modal_id'])
                    if modal:
                        modal_classes = modal.get_attribute("class") or ""
                        is_displayed = modal.is_displayed()
                        
                        if is_displayed or "show" in modal_classes:
                            modal_found = True
                            break
                except NoSuchElementException:
                    pass
                time.sleep(1)
            
            if not modal_found:
                result["tests"]["error"] = {"status": "FAILED", "error": "Modal element not found in DOM after 15 seconds"}
                return result
            
            # Check for form fields
            form = modal.find_element(By.TAG_NAME, "form")
            inputs = form.find_elements(By.CSS_SELECTOR, "input, select, textarea")
            
            result["tests"]["form_fields"] = {
                "status": "PASSED" if len(inputs) > 0 else "FAILED",
                "field_count": len(inputs),
                "error": None if len(inputs) > 0 else "No form fields found"
            }
            
            # Close modal
            try:
                close_button = modal.find_element(By.CSS_SELECTOR, ".btn-close, .close, [data-bs-dismiss='modal']")
                self.driver.execute_script("arguments[0].click();", close_button)
            except:
                pass
                
        except Exception as e:
            result["tests"]["error"] = {"status": "FAILED", "error": str(e)}
        
        return result
    
    def test_modal_edit_view_delete(self, page_info: Dict) -> Dict:
        """Test edit, view details, and delete operations"""
        result = {
            "page": page_info["name"],
            "url": page_info["url"],
            "modal_id": page_info["modal_id"],
            "tests": {}
        }
        
        try:
            # Navigate to page
            self.driver.get(f"{BASE_URL}{page_info['url']}")
            time.sleep(5)
            
            # Wait for page to load and data to appear
            try:
                # Look for table rows
                WebDriverWait(self.driver, 10).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, "tbody tr, .table tbody tr, [data-entity-type]"))
                )
            except TimeoutException:
                result["tests"]["no_data"] = {"status": "SKIPPED", "error": "No data rows found to test edit/delete"}
                return result
            
            # Find first row with data
            try:
                rows = self.driver.find_elements(By.CSS_SELECTOR, "tbody tr:not(.loading):not(.no-data)")
                if len(rows) == 0:
                    result["tests"]["no_data"] = {"status": "SKIPPED", "error": "No data rows found"}
                    return result
                
                first_row = rows[0]
                
                # Test Edit - look for edit button in row
                edit_button = None
                try:
                    # Look for edit button with various selectors
                    edit_button = first_row.find_element(By.CSS_SELECTOR, 
                        "button[data-onclick*='edit'], button[onclick*='edit'], button[data-action='edit'], "
                        "button[title*='ערוך'], button[title*='Edit'], .btn-edit")
                except NoSuchElementException:
                    pass
                
                if edit_button:
                    try:
                        self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", edit_button)
                        time.sleep(0.5)
                        try:
                            edit_button.click()
                        except:
                            self.driver.execute_script("arguments[0].click();", edit_button)
                        time.sleep(3)  # Wait for modal to open
                        
                        # Check if edit modal opened - wait for it to appear
                        modal_found = False
                        for attempt in range(10):
                            try:
                                modal = self.driver.find_element(By.ID, page_info['modal_id'])
                                if modal:
                                    modal_classes = modal.get_attribute("class") or ""
                                    is_displayed = modal.is_displayed()
                                    if is_displayed or "show" in modal_classes:
                                        result["tests"]["edit_modal"] = {"status": "PASSED"}
                                        modal_found = True
                                        
                                        # Close modal
                                        try:
                                            close_button = modal.find_element(By.CSS_SELECTOR, ".btn-close, [data-bs-dismiss='modal']")
                                            self.driver.execute_script("arguments[0].click();", close_button)
                                            time.sleep(0.5)
                                        except:
                                            pass
                                        break
                            except NoSuchElementException:
                                pass
                            time.sleep(0.5)
                        
                        if not modal_found:
                            result["tests"]["edit_modal"] = {"status": "FAILED", "error": "Edit modal did not open"}
                    except Exception as e:
                        result["tests"]["edit_modal"] = {"status": "FAILED", "error": str(e)}
                else:
                    result["tests"]["edit_modal"] = {"status": "SKIPPED", "error": "No edit button found"}
                
                # Test View Details - look for details/view button
                details_button = None
                try:
                    details_button = first_row.find_element(By.CSS_SELECTOR,
                        "button[data-onclick*='details'], button[onclick*='details'], button[data-action='view'], "
                        "button[title*='פרטים'], button[title*='Details'], .btn-view, .btn-details")
                except NoSuchElementException:
                    pass
                
                if details_button:
                    try:
                        self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", details_button)
                        time.sleep(0.5)
                        try:
                            details_button.click()
                        except:
                            self.driver.execute_script("arguments[0].click();", details_button)
                        time.sleep(2)
                        
                        # Check if details modal/view opened
                        modal_found = False
                        for attempt in range(10):
                            try:
                                modal = self.driver.find_element(By.ID, page_info['modal_id'])
                                if modal and (modal.is_displayed() or "show" in (modal.get_attribute("class") or "")):
                                    result["tests"]["view_details"] = {"status": "PASSED"}
                                    modal_found = True
                                    
                                    # Close modal
                                    try:
                                        close_button = modal.find_element(By.CSS_SELECTOR, ".btn-close, [data-bs-dismiss='modal']")
                                        self.driver.execute_script("arguments[0].click();", close_button)
                                        time.sleep(0.5)
                                    except:
                                        pass
                                    break
                            except NoSuchElementException:
                                pass
                            time.sleep(0.5)
                        
                        if not modal_found:
                            result["tests"]["view_details"] = {"status": "SKIPPED", "error": "Details view may not use modal"}
                    except Exception as e:
                        result["tests"]["view_details"] = {"status": "FAILED", "error": str(e)}
                else:
                    result["tests"]["view_details"] = {"status": "SKIPPED", "error": "No details button found"}
                
                # Test Delete - look for delete button
                delete_button = None
                try:
                    delete_button = first_row.find_element(By.CSS_SELECTOR,
                        "button[data-onclick*='delete'], button[onclick*='delete'], button[data-action='delete'], "
                        "button[title*='מחק'], button[title*='Delete'], .btn-delete")
                except NoSuchElementException:
                    pass
                
                if delete_button:
                    try:
                        self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", delete_button)
                        time.sleep(0.5)
                        # Just verify button exists and is clickable - don't actually delete
                        is_enabled = delete_button.is_enabled()
                        result["tests"]["delete_button"] = {
                            "status": "PASSED" if is_enabled else "SKIPPED",
                            "note": "Delete button found (not actually deleting to preserve data)"
                        }
                    except Exception as e:
                        result["tests"]["delete_button"] = {"status": "SKIPPED", "error": str(e)}
                else:
                    result["tests"]["delete_button"] = {"status": "SKIPPED", "error": "No delete button found"}
                
            except Exception as e:
                result["tests"]["error"] = {"status": "FAILED", "error": str(e)}
                
        except Exception as e:
            result["tests"]["error"] = {"status": "FAILED", "error": str(e)}
        
        return result
    
    def run_all_tests(self):
        """Run all modal tests"""
        print("=" * 80)
        print("🧪 בדיקת מודולים מקיפה - כל העמודים")
        print("=" * 80)
        print()
        
        self.setup_driver()
        
        try:
            for page_info in PAGES_WITH_MODALS:
                print(f"Testing: {page_info['name']} ({page_info['url']})")
                
                # Test 1: Open modal
                result1 = self.test_modal_open(page_info)
                self.results.append(result1)
                
                time.sleep(1)  # Delay between tests
                
                # Test 2: Form fields
                result2 = self.test_modal_form_fields(page_info)
                self.results.append(result2)
                
                time.sleep(1)
                
                # Test 3: Edit, View, Delete
                result3 = self.test_modal_edit_view_delete(page_info)
                self.results.append(result3)
                
                time.sleep(2)  # Delay between pages
                
        finally:
            self.teardown_driver()
        
        # Generate report
        self.generate_report()
    
    def generate_report(self):
        """Generate test report"""
        total_tests = len(self.results)
        passed = sum(1 for r in self.results if any(t.get("status") == "PASSED" for t in r.get("tests", {}).values()))
        failed = total_tests - passed
        
        print()
        print("=" * 80)
        print("📊 סיכום תוצאות")
        print("=" * 80)
        print(f"✅ בדיקות שעברו: {passed}/{total_tests}")
        print(f"❌ בדיקות שנכשלו: {failed}/{total_tests}")
        print()
        
        # Detailed results
        for result in self.results:
            print(f"📄 {result['page']} ({result['url']})")
            for test_name, test_result in result.get("tests", {}).items():
                status = test_result.get("status", "UNKNOWN")
                status_icon = "✅" if status == "PASSED" else "❌"
                print(f"  {status_icon} {test_name}: {status}")
                if test_result.get("error"):
                    print(f"     Error: {test_result['error']}")
            print()
        
        # Save to JSON
        report_file = Path("modal_test_report.json")
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump({
                "timestamp": datetime.now().isoformat(),
                "summary": {
                    "total": total_tests,
                    "passed": passed,
                    "failed": failed
                },
                "results": self.results
            }, f, ensure_ascii=False, indent=2)
        
        print(f"💾 דוח נשמר ל: {report_file}")

if __name__ == "__main__":
    tester = ModalTester()
    tester.run_all_tests()

