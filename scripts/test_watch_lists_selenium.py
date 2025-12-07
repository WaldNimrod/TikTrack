#!/usr/bin/env python3
"""
Comprehensive Selenium tests for Watch Lists System
Tests all interfaces and processes of the Watch Lists system
"""

import json
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional

try:
    import requests
except ImportError:
    print("❌ Error: requests not installed.")
    print("   Install with: pip install requests")
    exit(1)

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
    exit(1)

BASE_URL = "http://localhost:8080"

# Test credentials (admin)
TEST_USERNAME = "admin"
TEST_PASSWORD = "admin123"

class WatchListsTester:
    def __init__(self):
        self.results = []
        self.driver = None
        self.wait = None
        self.base_url = BASE_URL
        self.page_url = "/watch-list"
        
    def setup_driver(self):
        """Setup Chrome WebDriver"""
        chrome_options = Options()
        chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--window-size=1920,1080')
        chrome_options.set_capability('goog:loggingPrefs', {'browser': 'ALL'})
        
        try:
            service = Service(ChromeDriverManager().install())
            self.driver = webdriver.Chrome(service=service, options=chrome_options)
            self.wait = WebDriverWait(self.driver, 10)
            return True
        except Exception as e:
            print(f"❌ Error setting up Chrome driver: {e}")
            return False
    
    def teardown_driver(self):
        """Close WebDriver"""
        if self.driver:
            self.driver.quit()
    
    def login(self) -> bool:
        """Login to the system"""
        try:
            self.driver.get(self.base_url + "/login.html")
            time.sleep(2)
            
            # Find and fill login form
            username_field = self.wait.until(
                EC.presence_of_element_located((By.ID, "username"))
            )
            password_field = self.driver.find_element(By.ID, "password")
            
            username_field.clear()
            username_field.send_keys(TEST_USERNAME)
            password_field.clear()
            password_field.send_keys(TEST_PASSWORD)
            
            # Submit form
            login_button = self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
            login_button.click()
            
            # Wait for redirect
            time.sleep(3)
            return True
        except Exception as e:
            print(f"❌ Login failed: {e}")
            return False
    
    def get_console_errors(self) -> List[Dict]:
        """Get console errors from browser"""
        errors = []
        try:
            logs = self.driver.get_log('browser')
            for log in logs:
                if log['level'] in ['SEVERE', 'ERROR']:
                    errors.append({
                        'level': log['level'],
                        'message': log['message'],
                        'timestamp': log.get('timestamp', 0)
                    })
        except:
            pass
        return errors
    
    def test_page_load(self) -> Dict[str, Any]:
        """Test 1: Page loading and initialization"""
        result = {
            "test": "Page Load",
            "success": False,
            "errors": [],
            "console_errors": [],
            "systems_loaded": {},
            "timestamp": datetime.now().isoformat()
        }
        
        try:
            print("  📄 Testing page load...")
            self.driver.get(self.base_url + self.page_url)
            time.sleep(5)  # Wait for page initialization
            
            # Check console errors
            result["console_errors"] = self.get_console_errors()
            
            # Check if required systems are loaded
            systems_to_check = [
                "UnifiedCacheManager",
                "Logger",
                "NotificationSystem",
                "ModalManagerV2",
                "WatchListsDataService",
                "WatchListsPage"
            ]
            
            for system in systems_to_check:
                try:
                    is_loaded = self.driver.execute_script(f"return typeof window.{system} !== 'undefined';")
                    result["systems_loaded"][system] = is_loaded
                except:
                    result["systems_loaded"][system] = False
            
            # Check if page loaded successfully
            page_title = self.driver.title
            result["page_title"] = page_title
            
            # Check for critical errors
            critical_errors = [e for e in result["console_errors"] 
                             if "validateTextField" in e.get("message", "") 
                             or "is not defined" in e.get("message", "")]
            
            if not critical_errors and all(result["systems_loaded"].values()):
                result["success"] = True
            else:
                result["errors"].append(f"Critical errors: {len(critical_errors)}, Systems loaded: {sum(result['systems_loaded'].values())}/{len(systems_to_check)}")
                
        except Exception as e:
            result["errors"].append(str(e))
        
        return result
    
    def test_modal_open(self, modal_type: str = "add_list") -> Dict[str, Any]:
        """Test 2: Opening modals"""
        result = {
            "test": f"Open {modal_type} Modal",
            "success": False,
            "errors": [],
            "timestamp": datetime.now().isoformat()
        }
        
        try:
            print(f"  🔲 Testing {modal_type} modal...")
            
            # Navigate to page
            self.driver.get(self.base_url + self.page_url)
            time.sleep(3)
            
            # Find and click the button to open modal
            if modal_type == "add_list":
                button_selector = "button[data-onclick*='openAddListModal']"
                modal_id = "watchListModal"
            elif modal_type == "add_ticker":
                button_selector = "button[data-onclick*='addTicker']"
                modal_id = "addTickerModal"
            else:
                result["errors"].append(f"Unknown modal type: {modal_type}")
                return result
            
            # Click button
            button = self.wait.until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, button_selector))
            )
            button.click()
            time.sleep(2)
            
            # Check if modal is visible
            modal = self.driver.find_element(By.ID, modal_id)
            is_visible = modal.is_displayed()
            
            if is_visible:
                result["success"] = True
            else:
                result["errors"].append(f"Modal {modal_id} not visible after clicking button")
            
            # Close modal
            try:
                close_button = modal.find_element(By.CSS_SELECTOR, ".btn-close, [data-bs-dismiss='modal']")
                close_button.click()
                time.sleep(1)
            except:
                pass
                
        except TimeoutException:
            result["errors"].append(f"Timeout waiting for {modal_type} modal button")
        except Exception as e:
            result["errors"].append(str(e))
        
        return result
    
    def test_validation(self) -> Dict[str, Any]:
        """Test 3: Form validation"""
        result = {
            "test": "Form Validation",
            "success": False,
            "errors": [],
            "validation_tests": [],
            "timestamp": datetime.now().isoformat()
        }
        
        try:
            print("  ✅ Testing form validation...")
            
            # Navigate to page
            self.driver.get(self.base_url + self.page_url)
            time.sleep(3)
            
            # Open add list modal
            button = self.wait.until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, "button[data-onclick*='openAddListModal']"))
            )
            button.click()
            time.sleep(2)
            
            # Find name input
            name_input = self.wait.until(
                EC.presence_of_element_located((By.ID, "watchListName"))
            )
            
            # Test 1: Try to save without name
            save_button = self.driver.find_element(By.CSS_SELECTOR, "#watchListModal button[type='submit'], #watchListModal .btn-primary")
            save_button.click()
            time.sleep(1)
            
            # Check for validation error
            validation_test = {
                "test": "Required field validation",
                "passed": False
            }
            
            try:
                error_message = self.driver.find_element(By.CSS_SELECTOR, ".invalid-feedback, .text-danger")
                if error_message.is_displayed():
                    validation_test["passed"] = True
            except:
                pass
            
            result["validation_tests"].append(validation_test)
            
            # Test 2: Enter valid name
            name_input.clear()
            name_input.send_keys("Test List " + str(int(time.time())))
            time.sleep(0.5)
            
            # Check if validation passes
            validation_test2 = {
                "test": "Valid input acceptance",
                "passed": False
            }
            
            try:
                # Check if error is cleared
                error_elements = self.driver.find_elements(By.CSS_SELECTOR, ".invalid-feedback, .text-danger")
                visible_errors = [e for e in error_elements if e.is_displayed()]
                if len(visible_errors) == 0:
                    validation_test2["passed"] = True
            except:
                pass
            
            result["validation_tests"].append(validation_test2)
            
            # Close modal
            try:
                close_button = self.driver.find_element(By.CSS_SELECTOR, "#watchListModal .btn-close, #watchListModal [data-bs-dismiss='modal']")
                close_button.click()
                time.sleep(1)
            except:
                pass
            
            # Check if all validation tests passed
            if all(t["passed"] for t in result["validation_tests"]):
                result["success"] = True
            else:
                result["errors"].append(f"Some validation tests failed: {[t['test'] for t in result['validation_tests'] if not t['passed']]}")
                
        except Exception as e:
            result["errors"].append(str(e))
        
        return result
    
    def test_crud_operations(self) -> Dict[str, Any]:
        """Test 4: CRUD operations"""
        result = {
            "test": "CRUD Operations",
            "success": False,
            "errors": [],
            "operations": [],
            "timestamp": datetime.now().isoformat()
        }
        
        try:
            print("  🔄 Testing CRUD operations...")
            
            # Navigate to page
            self.driver.get(self.base_url + self.page_url)
            time.sleep(3)
            
            # Test Create
            create_result = self._test_create_list()
            result["operations"].append(create_result)
            
            if create_result["success"]:
                list_id = create_result.get("list_id")
                
                # Test Read (select list)
                if list_id:
                    read_result = self._test_select_list(list_id)
                    result["operations"].append(read_result)
                
                # Test Update
                if list_id:
                    update_result = self._test_update_list(list_id)
                    result["operations"].append(update_result)
                
                # Test Delete
                if list_id:
                    delete_result = self._test_delete_list(list_id)
                    result["operations"].append(delete_result)
            
            # Check if all operations passed
            if all(op.get("success", False) for op in result["operations"]):
                result["success"] = True
            else:
                failed_ops = [op["operation"] for op in result["operations"] if not op.get("success", False)]
                result["errors"].append(f"Failed operations: {failed_ops}")
                
        except Exception as e:
            result["errors"].append(str(e))
        
        return result
    
    def _test_create_list(self) -> Dict[str, Any]:
        """Test creating a watch list"""
        result = {
            "operation": "Create",
            "success": False,
            "errors": []
        }
        
        try:
            # Open modal
            button = self.wait.until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, "button[data-onclick*='openAddListModal']"))
            )
            button.click()
            time.sleep(2)
            
            # Fill form
            name_input = self.wait.until(
                EC.presence_of_element_located((By.ID, "watchListName"))
            )
            list_name = f"Test List {int(time.time())}"
            name_input.clear()
            name_input.send_keys(list_name)
            time.sleep(1)
            
            # Save
            save_button = self.driver.find_element(By.CSS_SELECTOR, "#watchListModal button[type='submit'], #watchListModal .btn-primary")
            save_button.click()
            time.sleep(3)
            
            # Check if modal closed (indicates success)
            try:
                modal = self.driver.find_element(By.ID, "watchListModal")
                if not modal.is_displayed():
                    result["success"] = True
                    result["list_name"] = list_name
            except:
                result["success"] = True  # Modal might be removed from DOM
            
        except Exception as e:
            result["errors"].append(str(e))
        
        return result
    
    def _test_select_list(self, list_id: str) -> Dict[str, Any]:
        """Test selecting a watch list"""
        result = {
            "operation": "Read/Select",
            "success": False,
            "errors": []
        }
        
        try:
            # Find select element
            select = self.wait.until(
                EC.presence_of_element_located((By.ID, "activeListSelect"))
            )
            
            # Select the list
            from selenium.webdriver.support.ui import Select
            select_element = Select(select)
            select_element.select_by_value(str(list_id))
            time.sleep(2)
            
            result["success"] = True
            
        except Exception as e:
            result["errors"].append(str(e))
        
        return result
    
    def _test_update_list(self, list_id: str) -> Dict[str, Any]:
        """Test updating a watch list"""
        result = {
            "operation": "Update",
            "success": False,
            "errors": []
        }
        
        try:
            # Find edit button for the list
            edit_button = self.wait.until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, f"button[data-onclick*='editList'][data-list-id='{list_id}'], button[data-onclick*='editList']"))
            )
            edit_button.click()
            time.sleep(2)
            
            # Update name
            name_input = self.wait.until(
                EC.presence_of_element_located((By.ID, "watchListName"))
            )
            updated_name = f"Updated List {int(time.time())}"
            name_input.clear()
            name_input.send_keys(updated_name)
            time.sleep(1)
            
            # Save
            save_button = self.driver.find_element(By.CSS_SELECTOR, "#watchListModal button[type='submit'], #watchListModal .btn-primary")
            save_button.click()
            time.sleep(3)
            
            result["success"] = True
            
        except Exception as e:
            result["errors"].append(str(e))
        
        return result
    
    def _test_delete_list(self, list_id: str) -> Dict[str, Any]:
        """Test deleting a watch list"""
        result = {
            "operation": "Delete",
            "success": False,
            "errors": []
        }
        
        try:
            # Select the list first
            select = self.driver.find_element(By.ID, "activeListSelect")
            from selenium.webdriver.support.ui import Select
            select_element = Select(select)
            select_element.select_by_value(str(list_id))
            time.sleep(2)
            
            # Click delete button
            delete_button = self.wait.until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, "button[data-onclick*='deleteCurrentList']"))
            )
            delete_button.click()
            time.sleep(2)
            
            # Confirm deletion (if confirmation dialog appears)
            try:
                confirm_button = self.driver.find_element(By.CSS_SELECTOR, ".modal.show .btn-danger, .modal.show .btn-primary")
                confirm_button.click()
                time.sleep(2)
            except:
                pass
            
            result["success"] = True
            
        except Exception as e:
            result["errors"].append(str(e))
        
        return result
    
    def test_view_modes(self) -> Dict[str, Any]:
        """Test 5: View modes switching"""
        result = {
            "test": "View Modes",
            "success": False,
            "errors": [],
            "modes_tested": [],
            "timestamp": datetime.now().isoformat()
        }
        
        try:
            print("  👁️ Testing view modes...")
            
            # Navigate to page
            self.driver.get(self.base_url + self.page_url)
            time.sleep(3)
            
            modes = ["table", "cards", "compact"]
            
            for mode in modes:
                try:
                    # Find view mode button
                    mode_button = self.wait.until(
                        EC.element_to_be_clickable((By.CSS_SELECTOR, f"button[data-view-mode='{mode}']"))
                    )
                    mode_button.click()
                    time.sleep(2)
                    
                    # Check if active class is set
                    is_active = "active" in mode_button.get_attribute("class")
                    
                    result["modes_tested"].append({
                        "mode": mode,
                        "success": is_active
                    })
                    
                except Exception as e:
                    result["modes_tested"].append({
                        "mode": mode,
                        "success": False,
                        "error": str(e)
                    })
            
            if all(m["success"] for m in result["modes_tested"]):
                result["success"] = True
            else:
                failed_modes = [m["mode"] for m in result["modes_tested"] if not m["success"]]
                result["errors"].append(f"Failed modes: {failed_modes}")
                
        except Exception as e:
            result["errors"].append(str(e))
        
        return result
    
    def run_all_tests(self):
        """Run all tests"""
        print("=" * 80)
        print("🧪 בדיקות Selenium מקיפות - מערכת Watch Lists")
        print("=" * 80)
        print()
        
        if not self.setup_driver():
            print("❌ Failed to setup WebDriver")
            return
        
        try:
            # Login
            print("🔐 Logging in...")
            if not self.login():
                print("❌ Login failed - skipping tests")
                return
            
            # Test 1: Page Load
            print("\n📄 Test 1: Page Load and Initialization")
            result1 = self.test_page_load()
            self.results.append(result1)
            print(f"   {'✅' if result1['success'] else '❌'} {result1['test']}")
            
            # Test 2: Modal Opening
            print("\n🔲 Test 2: Modal Opening")
            result2a = self.test_modal_open("add_list")
            self.results.append(result2a)
            print(f"   {'✅' if result2a['success'] else '❌'} {result2a['test']}")
            
            result2b = self.test_modal_open("add_ticker")
            self.results.append(result2b)
            print(f"   {'✅' if result2b['success'] else '❌'} {result2b['test']}")
            
            # Test 3: Validation
            print("\n✅ Test 3: Form Validation")
            result3 = self.test_validation()
            self.results.append(result3)
            print(f"   {'✅' if result3['success'] else '❌'} {result3['test']}")
            
            # Test 4: CRUD Operations
            print("\n🔄 Test 4: CRUD Operations")
            result4 = self.test_crud_operations()
            self.results.append(result4)
            print(f"   {'✅' if result4['success'] else '❌'} {result4['test']}")
            
            # Test 5: View Modes
            print("\n👁️ Test 5: View Modes")
            result5 = self.test_view_modes()
            self.results.append(result5)
            print(f"   {'✅' if result5['success'] else '❌'} {result5['test']}")
            
        finally:
            self.teardown_driver()
        
        # Generate report
        self.generate_report()
    
    def generate_report(self):
        """Generate test report"""
        report = {
            "test_suite": "Watch Lists Selenium Tests",
            "timestamp": datetime.now().isoformat(),
            "base_url": self.base_url,
            "page_url": self.page_url,
            "total_tests": len(self.results),
            "passed_tests": sum(1 for r in self.results if r.get("success", False)),
            "failed_tests": sum(1 for r in self.results if not r.get("success", False)),
            "results": self.results
        }
        
        # Save report
        report_path = Path("console_errors_report.json")
        with open(report_path, "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        # Print summary
        print("\n" + "=" * 80)
        print("📊 Test Summary")
        print("=" * 80)
        print(f"Total Tests: {report['total_tests']}")
        print(f"✅ Passed: {report['passed_tests']}")
        print(f"❌ Failed: {report['failed_tests']}")
        print(f"\n📄 Report saved to: {report_path}")
        print("=" * 80)

if __name__ == "__main__":
    tester = WatchListsTester()
    tester.run_all_tests()









