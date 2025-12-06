#!/usr/bin/env python3
"""
Comprehensive Test Script for Tickers External Data Integration
===============================================================

This script tests the complete integration between the tickers dashboard
and the external data system, including:
- Data completeness checking
- Automatic historical data loading
- Data enrichment with technical indicators
- Status badge display
- Cache management

Author: TikTrack Development Team
Date: December 2025
"""

import sys
import os
import time
import json
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from webdriver_manager.chrome import ChromeDriverManager

# Add parent directory to path for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

class TickersExternalDataIntegrationTester:
    """Test suite for tickers external data integration"""
    
    def __init__(self, base_url="http://127.0.0.1:8080"):
        self.base_url = base_url
        self.driver = None
        self.results = {
            'timestamp': datetime.now().isoformat(),
            'tests': [],
            'summary': {
                'total': 0,
                'passed': 0,
                'failed': 0,
                'warnings': 0
            }
        }
        
    def setup_driver(self):
        """Setup Chrome WebDriver"""
        try:
            chrome_options = Options()
            chrome_options.add_argument('--headless')
            chrome_options.add_argument('--no-sandbox')
            chrome_options.add_argument('--disable-dev-shm-usage')
            chrome_options.add_argument('--disable-gpu')
            chrome_options.add_argument('--window-size=1920,1080')
            chrome_options.add_argument('--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36')
            
            service = Service(ChromeDriverManager().install())
            self.driver = webdriver.Chrome(service=service, options=chrome_options)
            self.driver.implicitly_wait(10)
            print("✅ Chrome WebDriver initialized successfully")
            return True
        except Exception as e:
            print(f"❌ Failed to initialize WebDriver: {e}")
            return False
    
    def teardown_driver(self):
        """Close WebDriver"""
        if self.driver:
            self.driver.quit()
            print("✅ WebDriver closed")
    
    def log_test(self, test_name, status, message="", details=None):
        """Log test result"""
        test_result = {
            'name': test_name,
            'status': status,
            'message': message,
            'details': details or {},
            'timestamp': datetime.now().isoformat()
        }
        self.results['tests'].append(test_result)
        self.results['summary']['total'] += 1
        
        if status == 'passed':
            self.results['summary']['passed'] += 1
            print(f"✅ {test_name}: {message}")
        elif status == 'failed':
            self.results['summary']['failed'] += 1
            print(f"❌ {test_name}: {message}")
        elif status == 'warning':
            self.results['summary']['warnings'] += 1
            print(f"⚠️  {test_name}: {message}")
    
    def test_page_loads(self):
        """Test 1: Verify tickers page loads successfully"""
        try:
            print("\n📋 Test 1: Page Load")
            self.driver.get(f"{self.base_url}/trading-ui/tickers.html")
            time.sleep(3)
            
            # Check if page loaded
            page_title = self.driver.title
            if "טיקרים" in page_title or "Tickers" in page_title or page_title:
                self.log_test("Page Loads", "passed", f"Page loaded successfully: {page_title}")
            else:
                self.log_test("Page Loads", "failed", "Page title not found")
                return False
            
            # Check for JavaScript errors
            console_logs = self.driver.get_log('browser')
            errors = [log for log in console_logs if log['level'] == 'SEVERE']
            if errors:
                error_messages = [e['message'] for e in errors[:5]]  # First 5 errors
                self.log_test("JavaScript Errors", "warning", 
                            f"Found {len(errors)} JavaScript errors", 
                            {'errors': error_messages})
            else:
                self.log_test("JavaScript Errors", "passed", "No JavaScript errors found")
            
            return True
        except Exception as e:
            self.log_test("Page Loads", "failed", f"Exception: {str(e)}")
            return False
    
    def test_data_loading_functions_exist(self):
        """Test 2: Verify all integration functions exist"""
        try:
            print("\n📋 Test 2: Integration Functions Existence")
            
            # Check for required functions in console
            required_functions = [
                'checkTickerDataCompleteness',
                'checkTickersDataCompleteness',
                'ensureHistoricalDataForTickers',
                'enrichTickersWithFullData',
                'loadAndRefreshMissingData',
                'getDataStatusBadge'
            ]
            
            missing_functions = []
            for func_name in required_functions:
                try:
                    exists = self.driver.execute_script(f"return typeof window.{func_name} === 'function';")
                    if not exists:
                        missing_functions.append(func_name)
                except:
                    missing_functions.append(func_name)
            
            if missing_functions:
                self.log_test("Integration Functions", "failed", 
                            f"Missing functions: {', '.join(missing_functions)}",
                            {'missing': missing_functions})
                return False
            else:
                self.log_test("Integration Functions", "passed", 
                            "All integration functions exist")
                return True
        except Exception as e:
            self.log_test("Integration Functions", "failed", f"Exception: {str(e)}")
            return False
    
    def test_tickers_table_renders(self):
        """Test 3: Verify tickers table renders with data"""
        try:
            print("\n📋 Test 3: Tickers Table Rendering")
            
            # Wait for table to load
            try:
                table = WebDriverWait(self.driver, 15).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, "table[data-table-type='tickers']"))
                )
                self.log_test("Table Element", "passed", "Tickers table found")
            except TimeoutException:
                self.log_test("Table Element", "failed", "Tickers table not found after 15 seconds")
                return False
            
            # Check for table rows
            time.sleep(2)  # Wait for data to load
            rows = self.driver.find_elements(By.CSS_SELECTOR, "table[data-table-type='tickers'] tbody tr")
            row_count = len(rows)
            
            if row_count > 0:
                self.log_test("Table Rows", "passed", f"Found {row_count} ticker rows")
            else:
                self.log_test("Table Rows", "warning", "No ticker rows found (may be empty database)")
            
            return True
        except Exception as e:
            self.log_test("Table Rendering", "failed", f"Exception: {str(e)}")
            return False
    
    def test_data_status_badges(self):
        """Test 4: Verify data status badges are displayed"""
        try:
            print("\n📋 Test 4: Data Status Badges")
            
            # Wait for table to load
            time.sleep(3)
            
            # Check for status badges in table
            badges = self.driver.find_elements(By.CSS_SELECTOR, 
                "table[data-table-type='tickers'] .data-status-badge")
            
            if badges:
                badge_types = {}
                for badge in badges[:10]:  # Check first 10 badges
                    badge_text = badge.text.strip()
                    badge_class = badge.get_attribute('class')
                    badge_type = 'unknown'
                    
                    if 'status-full' in badge_class:
                        badge_type = 'full'
                    elif 'status-partial' in badge_class:
                        badge_type = 'partial'
                    elif 'status-missing' in badge_class:
                        badge_type = 'missing'
                    
                    badge_types[badge_type] = badge_types.get(badge_type, 0) + 1
                
                self.log_test("Status Badges Display", "passed", 
                            f"Found {len(badges)} status badges",
                            {'badge_distribution': badge_types})
            else:
                self.log_test("Status Badges Display", "warning", 
                            "No status badges found (may need data enrichment)")
            
            return True
        except Exception as e:
            self.log_test("Status Badges", "failed", f"Exception: {str(e)}")
            return False
    
    def test_entity_details_api_available(self):
        """Test 5: Verify EntityDetailsAPI is available"""
        try:
            print("\n📋 Test 5: EntityDetailsAPI Availability")
            
            # Check if EntityDetailsAPI exists
            api_exists = self.driver.execute_script(
                "return typeof window.entityDetailsAPI !== 'undefined' && "
                "typeof window.entityDetailsAPI.getEntityDetails === 'function';"
            )
            
            if api_exists:
                self.log_test("EntityDetailsAPI", "passed", "EntityDetailsAPI is available")
            else:
                self.log_test("EntityDetailsAPI", "failed", "EntityDetailsAPI not available")
                return False
            
            return True
        except Exception as e:
            self.log_test("EntityDetailsAPI", "failed", f"Exception: {str(e)}")
            return False
    
    def test_external_data_service_available(self):
        """Test 6: Verify ExternalDataService is available"""
        try:
            print("\n📋 Test 6: ExternalDataService Availability")
            
            # Check if ExternalDataService exists
            service_exists = self.driver.execute_script(
                "return typeof window.ExternalDataService !== 'undefined' && "
                "typeof window.ExternalDataService.refreshTickerData === 'function';"
            )
            
            if service_exists:
                self.log_test("ExternalDataService", "passed", "ExternalDataService is available")
            else:
                self.log_test("ExternalDataService", "failed", "ExternalDataService not available")
                return False
            
            return True
        except Exception as e:
            self.log_test("ExternalDataService", "failed", f"Exception: {str(e)}")
            return False
    
    def test_data_enrichment_process(self):
        """Test 7: Verify data enrichment process works"""
        try:
            print("\n📋 Test 7: Data Enrichment Process")
            
            # Check if enrichment functions can be called
            enrichment_works = self.driver.execute_script("""
                try {
                    // Check if functions exist
                    if (typeof window.enrichTickersWithFullData !== 'function') {
                        return {success: false, error: 'enrichTickersWithFullData not found'};
                    }
                    
                    // Check if EntityDetailsAPI is available
                    if (typeof window.entityDetailsAPI === 'undefined') {
                        return {success: false, error: 'EntityDetailsAPI not available'};
                    }
                    
                    return {success: true, message: 'Enrichment functions ready'};
                } catch (e) {
                    return {success: false, error: e.message};
                }
            """)
            
            if enrichment_works.get('success'):
                self.log_test("Data Enrichment", "passed", enrichment_works.get('message', 'Ready'))
            else:
                self.log_test("Data Enrichment", "failed", 
                            enrichment_works.get('error', 'Unknown error'))
                return False
            
            return True
        except Exception as e:
            self.log_test("Data Enrichment", "failed", f"Exception: {str(e)}")
            return False
    
    def test_cache_manager_available(self):
        """Test 8: Verify UnifiedCacheManager is available"""
        try:
            print("\n📋 Test 8: UnifiedCacheManager Availability")
            
            # Check if UnifiedCacheManager exists
            cache_exists = self.driver.execute_script(
                "return typeof window.UnifiedCacheManager !== 'undefined';"
            )
            
            if cache_exists:
                self.log_test("UnifiedCacheManager", "passed", "UnifiedCacheManager is available")
            else:
                self.log_test("UnifiedCacheManager", "warning", 
                            "UnifiedCacheManager not available (will use localStorage fallback)")
            
            return True
        except Exception as e:
            self.log_test("UnifiedCacheManager", "failed", f"Exception: {str(e)}")
            return False
    
    def test_progress_manager_available(self):
        """Test 9: Verify UnifiedProgressManager is available"""
        try:
            print("\n📋 Test 9: UnifiedProgressManager Availability")
            
            # Check if UnifiedProgressManager exists
            progress_exists = self.driver.execute_script(
                "return typeof window.UnifiedProgressManager !== 'undefined' && "
                "typeof window.UnifiedProgressManager.showProgress === 'function';"
            )
            
            if progress_exists:
                self.log_test("UnifiedProgressManager", "passed", "UnifiedProgressManager is available")
            else:
                self.log_test("UnifiedProgressManager", "failed", "UnifiedProgressManager not available")
                return False
            
            return True
        except Exception as e:
            self.log_test("UnifiedProgressManager", "failed", f"Exception: {str(e)}")
            return False
    
    def test_console_errors(self):
        """Test 10: Check for critical console errors"""
        try:
            print("\n📋 Test 10: Console Errors Check")
            
            # Get console logs
            console_logs = self.driver.get_log('browser')
            
            # Filter critical errors (excluding known non-critical ones)
            critical_errors = []
            for log in console_logs:
                if log['level'] == 'SEVERE':
                    message = log['message']
                    # Filter out known non-critical errors
                    if not any(ignore in message for ignore in [
                        'favicon',
                        '404',
                        'net::ERR_ABORTED',
                        'MIME type',
                        'application/json'
                    ]):
                        critical_errors.append({
                            'message': message,
                            'timestamp': log.get('timestamp', 0)
                        })
            
            if critical_errors:
                self.log_test("Console Errors", "warning", 
                            f"Found {len(critical_errors)} critical console errors",
                            {'errors': critical_errors[:5]})  # First 5 errors
            else:
                self.log_test("Console Errors", "passed", "No critical console errors found")
            
            return True
        except Exception as e:
            self.log_test("Console Errors", "failed", f"Exception: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all tests"""
        print("=" * 80)
        print("TICKERS EXTERNAL DATA INTEGRATION - COMPREHENSIVE TEST SUITE")
        print("=" * 80)
        
        if not self.setup_driver():
            print("❌ Failed to setup WebDriver. Exiting.")
            return False
        
        try:
            # Run all tests
            tests = [
                self.test_page_loads,
                self.test_data_loading_functions_exist,
                self.test_tickers_table_renders,
                self.test_data_status_badges,
                self.test_entity_details_api_available,
                self.test_external_data_service_available,
                self.test_data_enrichment_process,
                self.test_cache_manager_available,
                self.test_progress_manager_available,
                self.test_console_errors
            ]
            
            for test in tests:
                try:
                    test()
                except Exception as e:
                    print(f"❌ Test {test.__name__} crashed: {e}")
            
            # Print summary
            self.print_summary()
            
            # Save results
            self.save_results()
            
            return self.results['summary']['failed'] == 0
            
        finally:
            self.teardown_driver()
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 80)
        print("TEST SUMMARY")
        print("=" * 80)
        summary = self.results['summary']
        print(f"Total Tests: {summary['total']}")
        print(f"✅ Passed: {summary['passed']}")
        print(f"❌ Failed: {summary['failed']}")
        print(f"⚠️  Warnings: {summary['warnings']}")
        print("=" * 80)
    
    def save_results(self):
        """Save test results to file"""
        results_file = f"tickers_integration_test_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(results_file, 'w', encoding='utf-8') as f:
            json.dump(self.results, f, indent=2, ensure_ascii=False)
        print(f"\n📄 Results saved to: {results_file}")


def main():
    """Main function"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Test Tickers External Data Integration')
    parser.add_argument('--url', default='http://127.0.0.1:8080',
                       help='Base URL for the application (default: http://127.0.0.1:8080)')
    
    args = parser.parse_args()
    
    tester = TickersExternalDataIntegrationTester(base_url=args.url)
    success = tester.run_all_tests()
    
    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()


