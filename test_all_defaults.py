#!/usr/bin/env python3
"""
Test runner to execute all defaults tests and analyze the pattern of errors.
This will help identify the root cause of the widespread failures.
"""

import sys
import time
import json
from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, WebDriverException

class DefaultsTestAnalyzer:
    def __init__(self):
        self.driver = None
        self.results = {
            'pages_tested': 0,
            'success': 0,
            'failed': 0,
            'warning': 0,
            'errors': [],
            'patterns': {
                'api_connection_refused': 0,
                'iframe_timeout': 0,
                'server_unreachable': 0,
                'long_execution': 0
            }
        }

    def setup_driver(self):
        """Setup Firefox driver with proper configuration"""
        options = Options()
        options.add_argument("--headless")
        options.set_preference("dom.webdriver.enabled", False)
        options.set_preference('useAutomationExtension', False)

        self.driver = webdriver.Firefox(options=options)
        self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")

    def load_dashboard(self):
        """Load the dashboard directly (no login required)"""
        try:
            self.driver.get("http://127.0.0.1:8080/crud_testing_dashboard")

            # Wait for page load
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.CLASS_NAME, "card"))
            )

            print("✅ Dashboard loaded successfully")
            return True

        except Exception as e:
            print(f"❌ Failed to load dashboard: {e}")
            return False

    def run_all_defaults_test(self):
        """Run the 'ברירות מחדל' (Defaults) test for all user pages"""
        try:
            # Click the "הרץ" (Run) button for all defaults tests
            # This calls runAllDefaultsTests() which runs defaults for all 60 pages
            run_button = WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, "//button[contains(@onclick, 'runAllDefaultsTests()') and contains(text(), 'הרץ')]"))
            )

            print("🔍 Found 'Run All Defaults' button, clicking...")
            run_button.click()

            # Wait for test to start
            time.sleep(2)

            # Monitor test execution
            start_time = time.time()
            timeout = 300  # 5 minutes max

            while time.time() - start_time < timeout:
                try:
                    # Check for test results table
                    results_table = self.driver.find_element(By.ID, "testResultsTable")
                    tbody = results_table.find_element(By.TAG_NAME, "tbody")
                    rows = tbody.find_elements(By.TAG_NAME, "tr")

                    if len(rows) > 1:  # More than just the waiting row
                        # Extract results
                        for row in rows:
                            cells = row.find_elements(By.TAG_NAME, "td")
                            if len(cells) >= 5:
                                page = cells[1].text.strip()
                                status = cells[3].text.strip()
                                execution_time = cells[4].text.strip()
                                details = cells[5].text.strip() if len(cells) > 5 else ""

                                if page and not page.startswith("Waiting"):
                                    self.results['pages_tested'] += 1

                                    if "✓ success" in status:
                                        self.results['success'] += 1
                                    elif "✗ failed" in status:
                                        self.results['failed'] += 1
                                        self.results['errors'].append({
                                            'page': page,
                                            'status': status,
                                            'execution_time': execution_time,
                                            'details': details
                                        })
                                    elif "⚠ warning" in status:
                                        self.results['warning'] += 1

                                    # Analyze error patterns
                                    if "ERR_CONNECTION_REFUSED" in details or "connection refused" in details.lower():
                                        self.results['patterns']['api_connection_refused'] += 1
                                    if "Timeout loading iframe" in details:
                                        self.results['patterns']['iframe_timeout'] += 1
                                    if "ERR_EMPTY_RESPONSE" in details or "server unreachable" in details.lower():
                                        self.results['patterns']['server_unreachable'] += 1
                                    if execution_time and "ms" in execution_time:
                                        try:
                                            ms = int(execution_time.replace("ms", "").strip())
                                            if ms > 30000:  # More than 30 seconds
                                                self.results['patterns']['long_execution'] += 1
                                        except:
                                            pass

                        # Check if test is complete by looking for summary row
                        summary_rows = [row for row in rows if "סיכום" in row.text or "∑" in row.text]
                        if summary_rows:
                            print("✅ Test completed!")
                            break

                    time.sleep(1)

                except Exception as e:
                    print(f"⚠️ Error checking results: {e}")
                    time.sleep(1)

            else:
                print("⏰ Test timed out")
                return False

            return True

        except Exception as e:
            print(f"❌ Error running defaults test: {e}")
            return False

    def analyze_console_logs(self):
        """Analyze browser console logs for error patterns"""
        try:
            logs = self.driver.get_log('browser')
            error_patterns = {
                'connection_refused': 0,
                'timeout': 0,
                'aborted': 0,
                'failed': 0
            }

            for log in logs:
                message = log['message'].lower()
                if 'connection refused' in message or 'err_connection_refused' in message:
                    error_patterns['connection_refused'] += 1
                elif 'timeout' in message:
                    error_patterns['timeout'] += 1
                elif 'aborted' in message:
                    error_patterns['aborted'] += 1
                elif 'failed' in message or 'error' in message:
                    error_patterns['failed'] += 1

            return error_patterns

        except Exception as e:
            print(f"⚠️ Could not analyze console logs: {e}")
            return {}

    def run_analysis(self):
        """Run the complete analysis"""
        try:
            print("🚀 Starting Defaults Test Analysis...")

            self.setup_driver()

            if not self.load_dashboard():
                return False

            if not self.run_all_defaults_test():
                return False

            # Analyze console logs
            console_errors = self.analyze_console_logs()

            # Print results
            print("\n" + "="*60)
            print("📊 TEST RESULTS SUMMARY")
            print("="*60)
            print(f"📄 Pages tested: {self.results['pages_tested']}")
            print(f"✅ Success: {self.results['success']}")
            print(f"❌ Failed: {self.results['failed']}")
            print(f"⚠️  Warnings: {self.results['warning']}")
            print()

            print("🔍 ERROR PATTERNS:")
            for pattern, count in self.results['patterns'].items():
                if count > 0:
                    print(f"  • {pattern.replace('_', ' ').title()}: {count}")

            print()
            print("🌐 CONSOLE ERRORS:")
            for error_type, count in console_errors.items():
                if count > 0:
                    print(f"  • {error_type.replace('_', ' ').title()}: {count}")

            if self.results['errors']:
                print("\n❌ FAILED TESTS DETAILS:")
                for error in self.results['errors'][:5]:  # Show first 5
                    print(f"  • {error['page']}: {error['details'][:100]}...")

            print("\n" + "="*60)

            return self.results

        finally:
            if self.driver:
                self.driver.quit()

def main():
    analyzer = DefaultsTestAnalyzer()
    results = analyzer.run_analysis()

    if results:
        # Save results to file
        with open('/Users/nimrod/Documents/TikTrack/TikTrackApp/defaults_test_analysis.json', 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)

        print("💾 Results saved to defaults_test_analysis.json")

        # Return non-zero exit code if there were failures
        if results['failed'] > 0:
            sys.exit(1)

if __name__ == "__main__":
    main()
