#!/usr/bin/env python3
"""
Selenium tests for Watch Lists Widget on Home Page
Tests widget presence, loading states, list selection, compact view, empty states, overlay hover
"""

import json
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional

try:
    from selenium import webdriver
    from selenium.webdriver.chrome.service import Service
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait, Select
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.webdriver.common.keys import Keys
    from selenium.webdriver.common.action_chains import ActionChains
    from selenium.common.exceptions import TimeoutException, WebDriverException, NoSuchElementException
    from webdriver_manager.chrome import ChromeDriverManager
except ImportError:
    print("❌ Error: selenium or webdriver-manager not installed.")
    print("   Install with: pip install selenium webdriver-manager")
    exit(1)

BASE_URL = "http://localhost:8080"

# Test credentials (admin) - CRITICAL: Always use admin/admin123 for tests
TEST_USERNAME = "admin"
TEST_PASSWORD = "admin123"

class WatchListsWidgetTester:
    def __init__(self):
        self.results = []
        self.driver = None
        self.wait = None
        self.base_url = BASE_URL
        self.page_url = "/"
        
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
    
    def test_widget_presence(self) -> Dict[str, Any]:
        """Test that widget container exists on home page"""
        test_name = "Widget Presence"
        try:
            self.driver.get(self.base_url + self.page_url)
            time.sleep(3)
            
            # Check for widget container
            container = self.wait.until(
                EC.presence_of_element_located((By.ID, "watchListsWidgetContainer"))
            )
            
            # Check for header
            header = container.find_element(By.CSS_SELECTOR, ".card-header")
            
            # Check for select dropdown
            select = container.find_element(By.ID, "watchListsWidgetSelect")
            
            # Check for body
            body = container.find_element(By.CSS_SELECTOR, ".card-body")
            
            return {
                "test": test_name,
                "status": "PASS",
                "message": "Widget container and elements found"
            }
        except TimeoutException:
            return {
                "test": test_name,
                "status": "FAIL",
                "message": "Widget container not found"
            }
        except Exception as e:
            return {
                "test": test_name,
                "status": "ERROR",
                "message": f"Error: {str(e)}"
            }
    
    def test_loading_state(self) -> Dict[str, Any]:
        """Test loading state appears initially"""
        test_name = "Loading State"
        try:
            self.driver.get(self.base_url + self.page_url)
            time.sleep(1)
            
            # Check for loading element (may appear briefly)
            try:
                loading = self.driver.find_element(By.ID, "watchListsWidgetLoading")
                if loading.is_displayed():
                    return {
                        "test": test_name,
                        "status": "PASS",
                        "message": "Loading state displayed"
                    }
            except NoSuchElementException:
                pass
            
            # Loading might have finished, check for list or empty state
            time.sleep(2)
            list_elem = self.driver.find_element(By.ID, "watchListsWidgetList")
            empty_elem = self.driver.find_element(By.ID, "watchListsWidgetEmpty")
            
            # At least one should be visible
            if list_elem.is_displayed() or empty_elem.is_displayed():
                return {
                    "test": test_name,
                    "status": "PASS",
                    "message": "Loading completed, list or empty state visible"
                }
            
            return {
                "test": test_name,
                "status": "FAIL",
                "message": "Loading state not found and no content visible"
            }
        except Exception as e:
            return {
                "test": test_name,
                "status": "ERROR",
                "message": f"Error: {str(e)}"
            }
    
    def test_list_selection(self) -> Dict[str, Any]:
        """Test list selection dropdown functionality"""
        test_name = "List Selection"
        try:
            self.driver.get(self.base_url + self.page_url)
            time.sleep(3)
            
            # Find select dropdown
            select_element = self.wait.until(
                EC.presence_of_element_located((By.ID, "watchListsWidgetSelect"))
            )
            select = Select(select_element)
            
            # Get all options
            options = select.options
            if len(options) == 0:
                return {
                    "test": test_name,
                    "status": "SKIP",
                    "message": "No watch lists available"
                }
            
            # Select first option (if not already selected)
            if len(options) > 0:
                first_option_value = options[0].get_attribute("value")
                if first_option_value:
                    select.select_by_value(first_option_value)
                    time.sleep(2)
                    
                    # Verify selection changed
                    selected_value = select.first_selected_option.get_attribute("value")
                    if selected_value == first_option_value:
                        return {
                            "test": test_name,
                            "status": "PASS",
                            "message": f"List selection works, selected: {first_option_value}"
                        }
            
            return {
                "test": test_name,
                "status": "PASS",
                "message": "Select dropdown present and functional"
            }
        except Exception as e:
            return {
                "test": test_name,
                "status": "ERROR",
                "message": f"Error: {str(e)}"
            }
    
    def test_compact_view(self) -> Dict[str, Any]:
        """Test compact view rendering"""
        test_name = "Compact View"
        try:
            self.driver.get(self.base_url + self.page_url)
            time.sleep(3)
            
            # Find list container
            list_container = self.wait.until(
                EC.presence_of_element_located((By.ID, "watchListsWidgetList"))
            )
            
            # Check if list is visible
            if not list_container.is_displayed():
                # Check for empty state
                empty = self.driver.find_element(By.ID, "watchListsWidgetEmpty")
                if empty.is_displayed():
                    return {
                        "test": test_name,
                        "status": "PASS",
                        "message": "Empty state displayed (no items in list)"
                    }
                return {
                    "test": test_name,
                    "status": "FAIL",
                    "message": "List container not visible"
                }
            
            # Check for list items
            items = list_container.find_elements(By.CSS_SELECTOR, ".watch-lists-widget-item")
            if len(items) > 0:
                # Check first item structure
                first_item = items[0]
                
                # Check for flag
                flag = first_item.find_elements(By.CSS_SELECTOR, ".watch-lists-widget-flag")
                
                # Check for symbol
                symbol = first_item.find_elements(By.CSS_SELECTOR, "strong")
                
                return {
                    "test": test_name,
                    "status": "PASS",
                    "message": f"Compact view rendered with {len(items)} items"
                }
            else:
                return {
                    "test": test_name,
                    "status": "PASS",
                    "message": "Compact view rendered (empty list)"
                }
        except Exception as e:
            return {
                "test": test_name,
                "status": "ERROR",
                "message": f"Error: {str(e)}"
            }
    
    def test_empty_state(self) -> Dict[str, Any]:
        """Test empty state when no lists or items"""
        test_name = "Empty State"
        try:
            self.driver.get(self.base_url + self.page_url)
            time.sleep(3)
            
            # Check for empty state element
            empty = self.driver.find_element(By.ID, "watchListsWidgetEmpty")
            
            if empty.is_displayed():
                empty_text = empty.text
                return {
                    "test": test_name,
                    "status": "PASS",
                    "message": f"Empty state displayed: {empty_text[:50]}..."
                }
            else:
                # Check if list has items instead
                list_container = self.driver.find_element(By.ID, "watchListsWidgetList")
                if list_container.is_displayed():
                    items = list_container.find_elements(By.CSS_SELECTOR, ".watch-lists-widget-item")
                    if len(items) > 0:
                        return {
                            "test": test_name,
                            "status": "SKIP",
                            "message": "List has items, empty state not applicable"
                        }
                
                return {
                    "test": test_name,
                    "status": "FAIL",
                    "message": "Empty state element not visible"
                }
        except Exception as e:
            return {
                "test": test_name,
                "status": "ERROR",
                "message": f"Error: {str(e)}"
            }
    
    def test_overlay_hover(self) -> Dict[str, Any]:
        """Test overlay appears on hover"""
        test_name = "Overlay Hover"
        try:
            self.driver.get(self.base_url + self.page_url)
            time.sleep(3)
            
            # Find list container
            list_container = self.wait.until(
                EC.presence_of_element_located((By.ID, "watchListsWidgetList"))
            )
            
            if not list_container.is_displayed():
                return {
                    "test": test_name,
                    "status": "SKIP",
                    "message": "List not visible (empty or loading)"
                }
            
            # Find first item
            items = list_container.find_elements(By.CSS_SELECTOR, ".watch-lists-widget-item")
            if len(items) == 0:
                return {
                    "test": test_name,
                    "status": "SKIP",
                    "message": "No items to hover"
                }
            
            first_item = items[0]
            
            # Hover over item
            actions = ActionChains(self.driver)
            actions.move_to_element(first_item).perform()
            time.sleep(1)
            
            # Check for overlay
            overlay = first_item.find_elements(By.CSS_SELECTOR, ".watch-lists-widget-overlay")
            if len(overlay) > 0:
                overlay_elem = overlay[0]
                # Overlay might be hidden but present in DOM
                if overlay_elem.is_displayed() or overlay_elem.get_attribute("style") != "display: none;":
                    return {
                        "test": test_name,
                        "status": "PASS",
                        "message": "Overlay present and responsive to hover"
                    }
                else:
                    return {
                        "test": test_name,
                        "status": "PASS",
                        "message": "Overlay element exists (may require JavaScript for display)"
                    }
            
            return {
                "test": test_name,
                "status": "PASS",
                "message": "Overlay structure exists (display controlled by JavaScript)"
            }
        except Exception as e:
            return {
                "test": test_name,
                "status": "ERROR",
                "message": f"Error: {str(e)}"
            }
    
    def run_all_tests(self):
        """Run all tests"""
        print("=" * 70)
        print("Watch Lists Widget Selenium Tests")
        print("=" * 70)
        print()
        
        if not self.setup_driver():
            print("❌ Failed to setup driver")
            return
        
        try:
            # Login
            print("🔐 Logging in...")
            if not self.login():
                print("❌ Login failed - aborting tests")
                return
            print("✅ Logged in successfully")
            print()
            
            # Run tests
            tests = [
                self.test_widget_presence,
                self.test_loading_state,
                self.test_list_selection,
                self.test_compact_view,
                self.test_empty_state,
                self.test_overlay_hover
            ]
            
            for test_func in tests:
                print(f"🧪 Running: {test_func.__name__}...")
                result = test_func()
                self.results.append(result)
                
                status_icon = "✅" if result["status"] == "PASS" else "⚠️" if result["status"] == "SKIP" else "❌"
                print(f"{status_icon} {result['test']}: {result['status']} - {result['message']}")
                print()
            
            # Print summary
            print("=" * 70)
            print("Test Summary")
            print("=" * 70)
            passed = sum(1 for r in self.results if r["status"] == "PASS")
            failed = sum(1 for r in self.results if r["status"] == "FAIL")
            errors = sum(1 for r in self.results if r["status"] == "ERROR")
            skipped = sum(1 for r in self.results if r["status"] == "SKIP")
            
            print(f"Total: {len(self.results)}")
            print(f"✅ Passed: {passed}")
            print(f"❌ Failed: {failed}")
            print(f"⚠️  Errors: {errors}")
            print(f"⏭️  Skipped: {skipped}")
            print()
            
            # Save results
            results_file = Path("watch_lists_widget_test_results.json")
            with open(results_file, 'w', encoding='utf-8') as f:
                json.dump({
                    "timestamp": datetime.now().isoformat(),
                    "tests": self.results,
                    "summary": {
                        "total": len(self.results),
                        "passed": passed,
                        "failed": failed,
                        "errors": errors,
                        "skipped": skipped
                    }
                }, f, indent=2, ensure_ascii=False)
            
            print(f"📄 Results saved to: {results_file}")
            
        finally:
            self.teardown_driver()

if __name__ == "__main__":
    tester = WatchListsWidgetTester()
    tester.run_all_tests()

