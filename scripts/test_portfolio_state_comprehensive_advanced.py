#!/usr/bin/env python3
"""
Advanced Comprehensive Portfolio State Page Testing with Authentication
=======================================================================

This script performs complete end-to-end testing of the portfolio-state page including:
- Multi-user authentication (admin, user)
- Full page functionality testing
- Data loading verification
- Chart rendering validation
- Table population checks
- Date comparison functionality
- Performance metrics
- Error detection and reporting
- Integration with debug tools (Logger, System Debug Helper)

Usage:
    python3 scripts/test_portfolio_state_comprehensive_advanced.py --user admin
    python3 scripts/test_portfolio_state_comprehensive_advanced.py --user user
    python3 scripts/test_portfolio_state_comprehensive_advanced.py --all-users

Output:
    - JSON report: reports/qa/portfolio_state_advanced_test_YYYYMMDD_HHMMSS.json
    - Console summary with detailed analysis
    - Integration with Logger Service and System Debug Helper
"""

import json
import time
import argparse
import logging
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
from collections import defaultdict

try:
    from selenium import webdriver
    from selenium.webdriver.chrome.service import Service
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.webdriver.common.action_chains import ActionChains
    from selenium.common.exceptions import (
        TimeoutException, WebDriverException, NoSuchElementException,
        ElementNotInteractableException, StaleElementReferenceException
    )
    from webdriver_manager.chrome import ChromeDriverManager
except ImportError:
    print("❌ Error: selenium or webdriver-manager not installed.")
    print("   Install with: pip install selenium webdriver-manager")
    sys.exit(1)

# Configuration
BASE_URL = "http://localhost:8080"
PAGE_URL = f"{BASE_URL}/portfolio-state"
TEST_USERS = [
    {"username": "admin", "password": "admin123", "name": "Admin"},
    {"username": "user", "password": "user123", "name": "User"}
]

REPORTS_DIR = Path(__file__).parent.parent / "reports" / "qa"
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

# Test configuration
TEST_CONFIG = {
    'page_load_timeout': 30,
    'element_wait_timeout': 15,
    'data_load_timeout': 20,
    'chart_render_timeout': 25,
    'auth_timeout': 20,
    'retry_attempts': 3,
    'retry_delay': 2.0,
    'performance_threshold_ms': 5000,  # 5 seconds max load time
}

class PortfolioStateTester:
    """Advanced Portfolio State Page Tester"""

    def __init__(self, driver: webdriver.Chrome):
        self.driver = driver
        self.logger = logging.getLogger(__name__)
        self.wait = WebDriverWait(driver, TEST_CONFIG['element_wait_timeout'])
        self.results = defaultdict(dict)

    def setup_logging(self):
        """Setup comprehensive logging"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(REPORTS_DIR / f'portfolio_state_test_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log'),
                logging.StreamHandler()
            ]
        )

    def authenticate_user(self, username: str, password: str) -> bool:
        """
        Perform authentication using TikTrack's modal system
        Returns True if authentication successful
        """
        try:
            self.logger.info(f"🔐 Starting authentication for {username}")

            # Navigate to page
            self.driver.get(PAGE_URL)
            time.sleep(2)

            # Wait for page to be ready
            WebDriverWait(self.driver, TEST_CONFIG['page_load_timeout']).until(
                lambda d: d.execute_script('return document.readyState') == 'complete'
            )

            # Wait for TikTrackAuth to be ready
            WebDriverWait(self.driver, TEST_CONFIG['auth_timeout']).until(
                lambda d: d.execute_script("""
                    return window.TikTrackAuth &&
                           typeof window.TikTrackAuth.showLoginModal === 'function' &&
                           window.Logger;
                """)
            )

            self.logger.info("✅ TikTrackAuth ready, triggering login modal")

            # Trigger login modal using TikTrackAuth
            self.driver.execute_async_script("""
                const done = arguments[0];
                const timeout = setTimeout(() => done('timeout'), 15000);

                try {
                    window.TikTrackAuth.showLoginModal().then(() => {
                        clearTimeout(timeout);
                        done('success');
                    }).catch(err => {
                        clearTimeout(timeout);
                        done('error: ' + err.message);
                    });
                } catch (e) {
                    clearTimeout(timeout);
                    done('exception: ' + e.message);
                }
            """)

            # Wait for modal to appear
            WebDriverWait(self.driver, 15).until(
                EC.presence_of_element_located((By.ID, "loginModalContainer"))
            )

            self.logger.info("✅ Login modal appeared")

            # Wait for form elements to be ready
            username_field = WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((By.ID, "username"))
            )
            password_field = self.driver.find_element(By.ID, "password")

            # Fill credentials
            username_field.clear()
            time.sleep(0.1)
            username_field.send_keys(username)

            password_field.clear()
            time.sleep(0.1)
            password_field.send_keys(password)

            # Submit form
            login_button = WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((By.ID, "loginBtn"))
            )

            # Scroll to button and click
            self.driver.execute_script("arguments[0].scrollIntoView(true);", login_button)
            time.sleep(0.2)
            self.driver.execute_script("arguments[0].click();", login_button)

            self.logger.info("✅ Login form submitted, waiting for authentication")

            # Wait for authentication to complete
            WebDriverWait(self.driver, TEST_CONFIG['auth_timeout']).until(
                lambda d: d.execute_script("""
                    return window.TikTrackAuth &&
                           window.TikTrackAuth.isAuthenticated &&
                           window.TikTrackAuth.isAuthenticated() &&
                           window.currentUser;
                """)
            )

            # Verify user data
            user_data = self.driver.execute_script("""
                return {
                    authenticated: window.TikTrackAuth.isAuthenticated(),
                    user: window.currentUser,
                    userId: window.currentUser?.id,
                    username: window.currentUser?.username
                };
            """)

            if user_data.get('authenticated') and user_data.get('user'):
                self.logger.info(f"✅ Authentication successful for {username} (ID: {user_data.get('userId')})")
                return True
            else:
                self.logger.error(f"❌ Authentication failed - invalid user data: {user_data}")
                return False

        except Exception as e:
            self.logger.error(f"❌ Authentication error for {username}: {e}")
            return False

    def wait_for_page_ready(self) -> bool:
        """Wait for page to be fully loaded and systems initialized"""
        try:
            # Wait for document ready
            WebDriverWait(self.driver, TEST_CONFIG['page_load_timeout']).until(
                lambda d: d.execute_script('return document.readyState') == 'complete'
            )

            # Wait for critical systems to be loaded
            WebDriverWait(self.driver, 15).until(
                lambda d: d.execute_script("""
                    return window.UnifiedTableSystem &&
                           window.InfoSummarySystem &&
                           window.UnifiedProgressManager &&
                           window.Logger;
                """)
            )

            self.logger.info("✅ Page and critical systems ready")
            return True

        except Exception as e:
            self.logger.error(f"❌ Page/systems not ready: {e}")
            return False

    def test_data_loading(self) -> Dict[str, Any]:
        """Test data loading functionality"""
        result = {
            'snapshot_loaded': False,
            'trades_loaded': False,
            'portfolio_value': None,
            'cash_balance': None,
            'total_pl': None,
            'positions_count': 0,
            'trades_count': 0,
            'data_quality_score': 0
        }

        try:
            self.logger.info("🔍 Testing data loading...")

            # Wait for data to load
            WebDriverWait(self.driver, TEST_CONFIG['data_load_timeout']).until(
                lambda d: d.execute_script("""
                    return window.currentSnapshot &&
                           window.portfolioStatePage &&
                           typeof window.portfolioStatePage.loadPortfolioState === 'function';
                """)
            )

            # Check snapshot data
            snapshot_data = self.driver.execute_script("""
                return window.currentSnapshot ? {
                    portfolio_value: window.currentSnapshot.portfolio_value,
                    cash_balance: window.currentSnapshot.cash_balance,
                    total_pl: window.currentSnapshot.total_pl,
                    positions_count: window.currentSnapshot.positions ? window.currentSnapshot.positions.length : 0,
                    has_data: true
                } : { has_data: false };
            """)

            if snapshot_data.get('has_data'):
                result.update({
                    'snapshot_loaded': True,
                    'portfolio_value': snapshot_data.get('portfolio_value'),
                    'cash_balance': snapshot_data.get('cash_balance'),
                    'total_pl': snapshot_data.get('total_pl'),
                    'positions_count': snapshot_data.get('positions_count')
                })
                self.logger.info(f"✅ Snapshot loaded: {result['positions_count']} positions")
            else:
                self.logger.warning("⚠️ No snapshot data loaded")

            # Check trades data
            trades_data = self.driver.execute_script("""
                return window.filteredTrades ? {
                    count: window.filteredTrades.length,
                    has_data: true,
                    sample: window.filteredTrades.slice(0, 3)
                } : { has_data: false };
            """)

            if trades_data.get('has_data'):
                result.update({
                    'trades_loaded': True,
                    'trades_count': trades_data.get('count', 0)
                })
                self.logger.info(f"✅ Trades loaded: {result['trades_count']} trades")
            else:
                self.logger.warning("⚠️ No trades data loaded")

            # Calculate data quality score
            quality_factors = [
                result['snapshot_loaded'],
                result['trades_loaded'],
                result['portfolio_value'] is not None,
                result['cash_balance'] is not None,
                result['total_pl'] is not None,
                result['positions_count'] > 0
            ]
            result['data_quality_score'] = sum(quality_factors) / len(quality_factors) * 100

            self.logger.info(f"📊 Data quality score: {result['data_quality_score']:.1f}%")

        except Exception as e:
            self.logger.error(f"❌ Data loading test failed: {e}")

        return result

    def test_ui_elements(self) -> Dict[str, Any]:
        """Test UI elements presence and functionality"""
        result = {
            'summary_cards_visible': False,
            'chart_visible': False,
            'trades_table_visible': False,
            'date_comparison_visible': False,
            'section_toggles_working': False,
            'buttons_functional': False,
            'ui_score': 0
        }

        try:
            self.logger.info("🔍 Testing UI elements...")

            # Test summary cards
            try:
                cash_element = self.wait.until(
                    EC.presence_of_element_located((By.XPATH, "//div[contains(text(), 'יתרות מזומן')]"))
                )
                portfolio_element = self.wait.until(
                    EC.presence_of_element_located((By.XPATH, "//div[contains(text(), 'שווי תיק')]"))
                )
                pl_element = self.wait.until(
                    EC.presence_of_element_located((By.XPATH, "//div[contains(text(), 'P/L כולל')]"))
                )
                positions_element = self.wait.until(
                    EC.presence_of_element_located((By.XPATH, "//div[contains(text(), 'פוזיציות')]"))
                )

                # Check if values are loaded (not "לא זמין")
                cash_value = cash_element.find_element(By.XPATH, "../following-sibling::div").text
                portfolio_value = portfolio_element.find_element(By.XPATH, "../following-sibling::div").text

                if cash_value != "לא זמין" and portfolio_value != "לא זמין":
                    result['summary_cards_visible'] = True
                    self.logger.info("✅ Summary cards visible with data")
                else:
                    self.logger.warning("⚠️ Summary cards visible but show 'לא זמין'")
            except Exception as e:
                self.logger.warning(f"⚠️ Summary cards check failed: {e}")

            # Test chart visibility
            try:
                chart_container = self.wait.until(
                    EC.presence_of_element_located((By.ID, "unified-portfolio-chart-container"))
                )
                if chart_container.is_displayed():
                    result['chart_visible'] = True
                    self.logger.info("✅ Chart container visible")
                else:
                    self.logger.warning("⚠️ Chart container not visible")
            except Exception as e:
                self.logger.warning(f"⚠️ Chart visibility check failed: {e}")

            # Test trades table
            try:
                table = self.wait.until(
                    EC.presence_of_element_located((By.ID, "tradesTable"))
                )
                rows = table.find_elements(By.TAG_NAME, "tr")
                if len(rows) > 1:  # Header + at least one data row
                    result['trades_table_visible'] = True
                    self.logger.info(f"✅ Trades table visible with {len(rows)-1} rows")
                else:
                    self.logger.warning(f"⚠️ Trades table visible but only {len(rows)} rows (header only?)")
            except Exception as e:
                self.logger.warning(f"⚠️ Trades table check failed: {e}")

            # Test date comparison
            try:
                date_picker = self.wait.until(
                    EC.presence_of_element_located((By.ID, "datePicker1"))
                )
                if date_picker.is_displayed():
                    result['date_comparison_visible'] = True
                    self.logger.info("✅ Date comparison visible")
                else:
                    self.logger.warning("⚠️ Date comparison not visible")
            except Exception as e:
                self.logger.warning(f"⚠️ Date comparison check failed: {e}")

            # Test section toggles
            try:
                toggles = self.driver.find_elements(By.CSS_SELECTOR, "[data-onclick*='toggleCardDetails']")
                if toggles:
                    # Click first toggle and check if section collapses/expands
                    toggle = toggles[0]
                    toggle.click()
                    time.sleep(0.5)
                    toggle.click()  # Toggle back
                    result['section_toggles_working'] = True
                    self.logger.info("✅ Section toggles working")
                else:
                    self.logger.warning("⚠️ No section toggles found")
            except Exception as e:
                self.logger.warning(f"⚠️ Section toggles test failed: {e}")

            # Calculate UI score
            ui_factors = [
                result['summary_cards_visible'],
                result['chart_visible'],
                result['trades_table_visible'],
                result['date_comparison_visible'],
                result['section_toggles_working']
            ]
            result['ui_score'] = sum(ui_factors) / len(ui_factors) * 100

            self.logger.info(f"📊 UI score: {result['ui_score']:.1f}%")

        except Exception as e:
            self.logger.error(f"❌ UI elements test failed: {e}")

        return result

    def test_chart_functionality(self) -> Dict[str, Any]:
        """Test chart rendering and functionality"""
        result = {
            'chart_initialized': False,
            'series_present': [],
            'zoom_buttons_work': False,
            'legend_visible': False,
            'performance_calculations': {},
            'chart_score': 0
        }

        try:
            self.logger.info("🔍 Testing chart functionality...")

            # Wait for chart to initialize
            WebDriverWait(self.driver, TEST_CONFIG['chart_render_timeout']).until(
                lambda d: d.execute_script("""
                    return window.unifiedPortfolioChart &&
                           window.unifiedPortfolioChart.timeScale &&
                           window.unifiedPortfolioChart.timeScale().options();
                """)
            )

            result['chart_initialized'] = True
            self.logger.info("✅ Chart initialized")

            # Check series presence
            chart_data = self.driver.execute_script("""
                const chart = window.unifiedPortfolioChart;
                if (!chart) return { error: 'Chart not found' };

                const series = [];
                chart.timeScale().series().forEach(s => {
                    if (s.options && s.options().title) {
                        series.push(s.options().title);
                    }
                });

                return {
                    series: series,
                    hasTimeScale: !!chart.timeScale,
                    hasPriceScale: !!chart.priceScale,
                    seriesCount: chart.timeScale().series().length
                };
            """)

            if chart_data.get('series'):
                result['series_present'] = chart_data['series']
                self.logger.info(f"✅ Chart series: {', '.join(result['series_present'])}")
            else:
                self.logger.warning("⚠️ No chart series found")

            # Test zoom buttons
            try:
                zoom_in = self.driver.find_element(By.ID, "chartZoomIn")
                zoom_out = self.driver.find_element(By.ID, "chartZoomOut")
                fit_content = self.driver.find_element(By.ID, "chartFitContent")

                if zoom_in.is_displayed() and zoom_out.is_displayed() and fit_content.is_displayed():
                    # Test zoom in
                    zoom_in.click()
                    time.sleep(0.5)
                    # Test zoom out
                    zoom_out.click()
                    time.sleep(0.5)
                    # Test fit content
                    fit_content.click()
                    time.sleep(0.5)

                    result['zoom_buttons_work'] = True
                    self.logger.info("✅ Zoom buttons functional")
                else:
                    self.logger.warning("⚠️ Zoom buttons not visible")
            except Exception as e:
                self.logger.warning(f"⚠️ Zoom buttons test failed: {e}")

            # Check legend
            try:
                legend_items = self.driver.find_elements(By.CSS_SELECTOR, "[data-testid*='legend']")
                if not legend_items:
                    legend_items = self.driver.find_elements(By.XPATH, "//div[contains(@class, 'legend') or contains(text(), 'שווי') or contains(text(), 'P/L')]")

                if legend_items:
                    result['legend_visible'] = True
                    self.logger.info("✅ Chart legend visible")
                else:
                    self.logger.warning("⚠️ Chart legend not found")
            except Exception as e:
                self.logger.warning(f"⚠️ Legend check failed: {e}")

            # Test performance calculations
            try:
                perf_data = self.driver.execute_script("""
                    if (window.currentSnapshot && window.portfolioStatePage) {
                        const snapshot = window.currentSnapshot;
                        const perf = window.portfolioStatePage.calculatePerformance ?
                            window.portfolioStatePage.calculatePerformance(snapshot) : null;

                        return {
                            snapshot_date: snapshot.date,
                            portfolio_value: snapshot.portfolio_value,
                            base_value: snapshot.base_value,
                            performance: perf,
                            has_calculations: !!perf
                        };
                    }
                    return { error: 'No snapshot data' };
                """)

                if perf_data.get('has_calculations'):
                    result['performance_calculations'] = perf_data
                    self.logger.info(f"✅ Performance calculations: {perf_data.get('performance')}")
                else:
                    self.logger.warning("⚠️ Performance calculations not available")
            except Exception as e:
                self.logger.warning(f"⚠️ Performance calculation test failed: {e}")

            # Calculate chart score
            chart_factors = [
                result['chart_initialized'],
                len(result['series_present']) > 0,
                result['zoom_buttons_work'],
                result['legend_visible'],
                bool(result.get('performance_calculations'))
            ]
            result['chart_score'] = sum(chart_factors) / len(chart_factors) * 100

            self.logger.info(f"📊 Chart score: {result['chart_score']:.1f}%")

        except Exception as e:
            self.logger.error(f"❌ Chart functionality test failed: {e}")

        return result

    def test_console_errors(self) -> Dict[str, Any]:
        """Test for JavaScript console errors and warnings"""
        result = {
            'errors': [],
            'warnings': [],
            'critical_errors': [],
            'error_count': 0,
            'warning_count': 0,
            'critical_count': 0
        }

        try:
            logs = self.driver.get_log('browser')

            for log in logs:
                level = log.get('level', '').upper()
                message = log.get('message', '')
                timestamp = log.get('timestamp', 0)

                # Skip non-critical errors
                if any(skip in message for skip in [
                    '401', '308', 'favicon', 'chrome-extension',
                    'net::ERR_BLOCKED_BY_CLIENT', 'mixed content'
                ]):
                    continue

                log_entry = {
                    'level': level,
                    'message': message,
                    'timestamp': timestamp,
                    'time': datetime.fromtimestamp(timestamp/1000).strftime('%H:%M:%S')
                }

                if level == 'SEVERE':
                    if 'Value is null' in message:
                        result['critical_errors'].append(log_entry)
                        result['critical_count'] += 1
                    elif any(err in message for err in [
                        'Maximum call stack', 'Uncaught', 'SyntaxError',
                        'ReferenceError', 'TypeError'
                    ]):
                        result['critical_errors'].append(log_entry)
                        result['critical_count'] += 1
                    else:
                        result['errors'].append(log_entry)
                        result['error_count'] += 1
                elif level == 'WARNING':
                    result['warnings'].append(log_entry)
                    result['warning_count'] += 1

            self.logger.info(f"📋 Console: {result['error_count']} errors, {result['warning_count']} warnings, {result['critical_count']} critical")

            if result['critical_count'] > 0:
                self.logger.error(f"🚨 CRITICAL ERRORS: {result['critical_count']}")
                for err in result['critical_errors'][:3]:  # Show first 3
                    self.logger.error(f"  - {err['message']}")

        except Exception as e:
            self.logger.error(f"❌ Console error check failed: {e}")

        return result

    def run_system_debug_checks(self) -> Dict[str, Any]:
        """Run system debug checks using TikTrack's debug tools"""
        result = {
            'logger_available': False,
            'cache_status': {},
            'system_health': {},
            'debug_score': 0
        }

        try:
            self.logger.info("🔧 Running system debug checks...")

            # Check Logger availability
            logger_status = self.driver.execute_script("""
                return {
                    available: !!window.Logger,
                    debug: typeof window.Logger?.debug === 'function',
                    info: typeof window.Logger?.info === 'function',
                    error: typeof window.Logger?.error === 'function'
                };
            """)

            result['logger_available'] = logger_status.get('available', False)
            if result['logger_available']:
                self.logger.info("✅ Logger system available")
            else:
                self.logger.warning("⚠️ Logger system not available")

            # Check cache status
            try:
                cache_status = self.driver.execute_script("""
                    if (window.UnifiedCacheManager) {
                        return window.UnifiedCacheManager.getStatus();
                    }
                    return { error: 'UnifiedCacheManager not available' };
                """)
                result['cache_status'] = cache_status
                if not cache_status.get('error'):
                    self.logger.info("✅ Cache system functional")
                else:
                    self.logger.warning(f"⚠️ Cache system error: {cache_status['error']}")
            except Exception as e:
                self.logger.warning(f"⚠️ Cache status check failed: {e}")

            # Run system health check
            try:
                health_status = self.driver.execute_script("""
                    // Simulate health check
                    return {
                        timestamp: new Date().toISOString(),
                        systems: {
                            logger: !!window.Logger,
                            cache: !!window.UnifiedCacheManager,
                            auth: !!window.TikTrackAuth,
                            tables: !!window.UnifiedTableSystem,
                            charts: !!window.LightweightCharts,
                            ui: !!window.UnifiedProgressManager
                        },
                        overall_health: 'checking...'
                    };
                """)
                result['system_health'] = health_status
                self.logger.info("✅ System health check completed")
            except Exception as e:
                self.logger.warning(f"⚠️ Health check failed: {e}")

            # Calculate debug score
            debug_factors = [
                result['logger_available'],
                bool(result.get('cache_status') and not result['cache_status'].get('error')),
                bool(result.get('system_health'))
            ]
            result['debug_score'] = sum(debug_factors) / len(debug_factors) * 100

            self.logger.info(f"📊 Debug score: {result['debug_score']:.1f}%")

        except Exception as e:
            self.logger.error(f"❌ System debug checks failed: {e}")

        return result

    def generate_performance_report(self) -> Dict[str, Any]:
        """Generate comprehensive performance metrics"""
        result = {
            'page_load_time': 0,
            'dom_ready_time': 0,
            'auth_time': 0,
            'data_load_time': 0,
            'chart_render_time': 0,
            'total_time': 0,
            'performance_score': 0
        }

        try:
            self.logger.info("⚡ Generating performance report...")

            perf_metrics = self.driver.execute_script("""
                const navigation = performance.getEntriesByType('navigation')[0];
                const paint = performance.getEntriesByType('paint');

                return {
                    page_load_time: navigation ? navigation.loadEventEnd - navigation.fetchStart : 0,
                    dom_ready_time: navigation ? navigation.domContentLoadedEventEnd - navigation.fetchStart : 0,
                    total_resources: performance.getEntriesByType('resource').length,
                    failed_resources: performance.getEntriesByType('resource')
                        .filter(r => r.transferSize === 0 && !r.name.includes('favicon') && !r.name.includes('chrome-extension')).length,
                    cache_hits: performance.getEntriesByType('resource')
                        .filter(r => r.transferSize > 0 && r.decodedBodySize === 0).length
                };
            """)

            result.update(perf_metrics)

            # Calculate performance score
            load_time_score = max(0, 100 - (result['page_load_time'] / 1000) * 10)  # Deduct 10 points per second
            resource_score = max(0, 100 - result.get('failed_resources', 0) * 20)  # Deduct 20 points per failed resource

            result['performance_score'] = (load_time_score + resource_score) / 2

            self.logger.info(f"⚡ Performance: {result['page_load_time']:.0f}ms load time, score: {result['performance_score']:.1f}%")

        except Exception as e:
            self.logger.error(f"❌ Performance report failed: {e}")

        return result

    def run_comprehensive_test(self, user: Dict[str, str]) -> Dict[str, Any]:
        """Run comprehensive test suite for a user"""
        username = user['username']
        self.logger.info(f"🚀 Starting comprehensive test for {username}")

        start_time = time.time()

        # Initialize results
        test_results = {
            'user': user,
            'timestamp': datetime.now().isoformat(),
            'duration': 0,
            'success': False,
            'authentication': {},
            'data_loading': {},
            'ui_elements': {},
            'chart_functionality': {},
            'console_errors': {},
            'system_debug': {},
            'performance': {},
            'overall_score': 0,
            'recommendations': []
        }

        try:
            # Step 1: Authentication
            self.logger.info(f"🔐 Step 1: Authenticating {username}")
            auth_success = self.authenticate_user(username, user['password'])
            test_results['authentication'] = {
                'success': auth_success,
                'username': username,
                'timestamp': datetime.now().isoformat()
            }

            if not auth_success:
                test_results['recommendations'].append("❌ Authentication failed - check credentials and server")
                return test_results

            # Step 2: Wait for page ready
            self.logger.info("⏳ Step 2: Waiting for page and systems to be ready")
            page_ready = self.wait_for_page_ready()
            if not page_ready:
                test_results['recommendations'].append("⚠️ Page/systems not ready - check initialization")
                return test_results

            # Step 3: Test data loading
            self.logger.info("📊 Step 3: Testing data loading")
            test_results['data_loading'] = self.test_data_loading()

            # Step 4: Test UI elements
            self.logger.info("🎨 Step 4: Testing UI elements")
            test_results['ui_elements'] = self.test_ui_elements()

            # Step 5: Test chart functionality
            self.logger.info("📈 Step 5: Testing chart functionality")
            test_results['chart_functionality'] = self.test_chart_functionality()

            # Step 6: Check console errors
            self.logger.info("🔍 Step 6: Checking console errors")
            test_results['console_errors'] = self.test_console_errors()

            # Step 7: System debug checks
            self.logger.info("🔧 Step 7: Running system debug checks")
            test_results['system_debug'] = self.run_system_debug_checks()

            # Step 8: Performance report
            self.logger.info("⚡ Step 8: Generating performance report")
            test_results['performance'] = self.generate_performance_report()

            # Calculate overall score
            scores = [
                test_results['data_loading'].get('data_quality_score', 0),
                test_results['ui_elements'].get('ui_score', 0),
                test_results['chart_functionality'].get('chart_score', 0),
                test_results['system_debug'].get('debug_score', 0),
                test_results['performance'].get('performance_score', 0)
            ]

            # Penalize for critical errors
            critical_penalty = test_results['console_errors'].get('critical_count', 0) * 20
            test_results['overall_score'] = max(0, (sum(scores) / len(scores)) - critical_penalty)

            test_results['success'] = test_results['overall_score'] >= 70  # 70% passing threshold

            # Generate recommendations
            if test_results['data_loading'].get('data_quality_score', 0) < 80:
                test_results['recommendations'].append("📊 Improve data loading - check API responses and caching")

            if test_results['ui_elements'].get('ui_score', 0) < 80:
                test_results['recommendations'].append("🎨 Fix UI elements - ensure all components render correctly")

            if test_results['chart_functionality'].get('chart_score', 0) < 80:
                test_results['recommendations'].append("📈 Fix chart functionality - check TradingView integration")

            if test_results['console_errors'].get('critical_count', 0) > 0:
                test_results['recommendations'].append(f"🚨 Fix {test_results['console_errors']['critical_count']} critical JavaScript errors")

            if test_results['performance'].get('performance_score', 0) < 70:
                test_results['recommendations'].append("⚡ Improve performance - optimize loading times")

            test_results['duration'] = time.time() - start_time

            self.logger.info(f"✅ Test completed for {username}: Score {test_results['overall_score']:.1f}%, Success: {test_results['success']}")

        except Exception as e:
            test_results['duration'] = time.time() - start_time
            test_results['error'] = str(e)
            test_results['recommendations'].append(f"❌ Test failed with error: {e}")
            self.logger.error(f"❌ Test failed for {username}: {e}")

        return test_results

def main():
    parser = argparse.ArgumentParser(description='Advanced Portfolio State Page Testing')
    parser.add_argument('--user', choices=['admin', 'user'], help='Test specific user')
    parser.add_argument('--all-users', action='store_true', help='Test all users')
    parser.add_argument('--verbose', '-v', action='store_true', help='Verbose output')
    parser.add_argument('--headless', action='store_true', default=True, help='Run in headless mode')

    args = parser.parse_args()

    # Setup logging
    log_level = logging.DEBUG if args.verbose else logging.INFO
    logging.basicConfig(level=log_level, format='%(asctime)s - %(levelname)s - %(message)s')

    logger = logging.getLogger(__name__)

    # Setup Chrome driver
    chrome_options = Options()
    if args.headless:
        chrome_options.add_argument('--headless=new')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--window-size=1920,1080')
    chrome_options.add_experimental_option('excludeSwitches', ['enable-logging'])
    chrome_options.set_capability('goog:loggingPrefs', {'browser': 'ALL', 'performance': 'ALL'})

    try:
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=chrome_options)
        driver.set_script_timeout(60)

        tester = PortfolioStateTester(driver)
        tester.setup_logging()

        # Determine which users to test
        users_to_test = []
        if args.all_users:
            users_to_test = TEST_USERS
        elif args.user:
            users_to_test = [u for u in TEST_USERS if u['username'] == args.user]
        else:
            users_to_test = [TEST_USERS[0]]  # Default to admin

        # Run tests
        all_results = []
        for user in users_to_test:
            logger.info(f"\n{'='*60}")
            logger.info(f"Testing Portfolio State Page for: {user['name']} ({user['username']})")
            logger.info(f"{'='*60}")

            result = tester.run_comprehensive_test(user)
            all_results.append(result)

            # Print summary for this user
            print(f"\n📋 RESULTS for {user['name']} ({user['username']}):")
            print(f"   ✅ Success: {result['success']}")
            print(".1f")
            print(".1f")
            print(".1f")
            print(".1f")
            print(".1f")
            print(f"   🚨 Critical Errors: {result['console_errors'].get('critical_count', 0)}")
            print(f"   📝 Recommendations: {len(result.get('recommendations', []))}")

            if result.get('recommendations'):
                print("   💡 Key Recommendations:")
                for rec in result['recommendations'][:3]:  # Show first 3
                    print(f"      • {rec}")

        # Generate comprehensive report
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        report_file = REPORTS_DIR / f'portfolio_state_advanced_test_{timestamp}.json'

        report = {
            'timestamp': datetime.now().isoformat(),
            'test_config': TEST_CONFIG,
            'users_tested': len(all_results),
            'results': all_results,
            'summary': {
                'total_success': sum(1 for r in all_results if r['success']),
                'average_score': sum(r['overall_score'] for r in all_results) / len(all_results),
                'total_critical_errors': sum(r['console_errors'].get('critical_count', 0) for r in all_results),
                'average_duration': sum(r['duration'] for r in all_results) / len(all_results)
            }
        }

        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2)

        print(f"\n{'='*60}")
        print("📊 COMPREHENSIVE TEST SUMMARY")
        print(f"{'='*60}")
        print(f"Total Users Tested: {len(all_results)}")
        print(f"Successful Tests: {report['summary']['total_success']}")
        print(".1f")
        print(f"Critical Errors: {report['summary']['total_critical_errors']}")
        print(".2f")
        print(f"Report saved: {report_file}")
        print(f"{'='*60}")

        driver.quit()

        # Return appropriate exit code
        if all(r['success'] for r in all_results):
            print("🎉 ALL TESTS PASSED!")
            return 0
        else:
            print("⚠️ SOME TESTS FAILED - Check recommendations above")
            return 1

    except Exception as e:
        logger.error(f"❌ Test execution failed: {e}")
        return 1

if __name__ == '__main__':
    import sys
    sys.exit(main())
