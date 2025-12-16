#!/usr/bin/env python3
"""
Comprehensive script to test console errors on ALL pages
This script uses Selenium to check JavaScript console errors
"""

import json
import time
import argparse
from datetime import datetime
from pathlib import Path
from collections import deque
from typing import Optional
import requests

try:
    from selenium import webdriver
    from selenium.webdriver.chrome.service import Service
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.chrome.service import Service as FirefoxService
    from selenium.webdriver.chrome.options import Options as ChromeOptions
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.common.exceptions import TimeoutException, WebDriverException
    from webdriver_manager.firefox import GeckoDriverManager
except ImportError:
    print("❌ Error: selenium or webdriver-manager not installed.")
    print("   Install with: pip install selenium webdriver-manager")
    exit(1)

BASE_URL = "http://localhost:5001"

# Test credentials (admin) - CRITICAL: Always use admin/admin123 for tests
TEST_USERNAME = "admin"
TEST_PASSWORD = "admin123"

# Rate limiting configuration
# Server limits: 5000 requests/minute = ~83 requests/second
# Additional limit in app.py: 10 requests/second
# We'll be conservative and use 5 requests/second to avoid hitting limits
RATE_LIMIT_CONFIG = {
    'max_requests_per_second': 5,  # Conservative limit
    'window_seconds': 1,  # 1 second window
    'min_delay_between_pages': 2.0,  # Minimum delay between page loads
    'max_delay_between_pages': 5.0,  # Maximum delay if rate limited
    'retry_max_attempts': 3,  # Max retries for 429 errors
    'retry_base_delay': 2.0,  # Base delay for exponential backoff
    'adaptive_delay': True,  # Enable adaptive delay adjustment
}

# All pages from test_all_pages_comprehensive.py
ALL_PAGES = [
    # עמודים מרכזיים (Main Pages)
    {"name": "דף הבית", "url": "/", "category": "main", "priority": "high"},
    {"name": "טריידים", "url": "/trades.html", "category": "main", "priority": "high"},
    {"name": "תכניות מסחר", "url": "/trade_plans.html", "category": "main", "priority": "high"},
    {"name": "התראות", "url": "/alerts.html", "category": "main", "priority": "high"},
    {"name": "טיקרים", "url": "/tickers.html", "category": "main", "priority": "high"},
    {"name": "דשבורד טיקר", "url": "/ticker-dashboard.html", "category": "main", "priority": "medium"},
    {"name": "חשבונות מסחר", "url": "/trading_accounts.html", "category": "main", "priority": "high"},
    {"name": "ביצועים", "url": "/executions.html", "category": "main", "priority": "high"},
    {"name": "ייבוא נתונים", "url": "/data_import.html", "category": "main", "priority": "medium"},
    {"name": "תזרימי מזומן", "url": "/cash_flows.html", "category": "main", "priority": "high"},
    {"name": "הערות", "url": "/notes.html", "category": "main", "priority": "high"},
    {"name": "מחקר", "url": "/research.html", "category": "main", "priority": "medium"},
    {"name": "ניתוח AI", "url": "/ai-analysis.html", "category": "main", "priority": "medium"},
    {"name": "העדפות", "url": "/preferences.html", "category": "main", "priority": "high"},
    {"name": "פרופיל משתמש", "url": "/user-profile.html", "category": "main", "priority": "medium"},
    
    # עמודים טכניים (Technical Pages)
    {"name": "תצוגת בסיס נתונים", "url": "/db_display.html", "category": "technical", "priority": "low"},
    {"name": "נתונים נוספים", "url": "/db_extradata.html", "category": "technical", "priority": "low"},
    {"name": "אילוצי מערכת", "url": "/constraints.html", "category": "technical", "priority": "low"},
    {"name": "משימות רקע", "url": "/background-tasks.html", "category": "technical", "priority": "low"},
    {"name": "ניטור שרת", "url": "/server-monitor.html", "category": "technical", "priority": "low"},
    {"name": "ניהול מערכת", "url": "/system-management.html", "category": "technical", "priority": "low"},
    {"name": "מרכז התראות", "url": "/notifications-center.html", "category": "technical", "priority": "low"},
    {"name": "ניהול CSS", "url": "/css-management.html", "category": "technical", "priority": "low"},
    {"name": "תצוגת צבעים", "url": "/dynamic-colors-display.html", "category": "technical", "priority": "low"},
    {"name": "עיצובים", "url": "/designs.html", "category": "technical", "priority": "low"},
    
    # עמודים משניים (Secondary Pages)
    {"name": "דשבורד נתונים חיצוניים", "url": "/external-data-dashboard.html", "category": "secondary", "priority": "low"},
    {"name": "ניהול גרפים", "url": "/chart-management.html", "category": "secondary", "priority": "low"},
    {"name": "דשבורד בדיקות CRUD", "url": "/crud-testing-dashboard.html", "category": "secondary", "priority": "low"},
    
    # עמודי אימות (Auth Pages) - login is via modal on base pages
    {"name": "הרשמה למערכת", "url": "/register.html", "category": "auth", "priority": "medium"},
    {"name": "שחזור סיסמה", "url": "/forgot-password.html", "category": "auth", "priority": "medium"},
    {"name": "איפוס סיסמה", "url": "/reset-password.html", "category": "auth", "priority": "medium"},
    
    # עמודי כלים לפיתוח (Dev Tools)
    {"name": "מיפוי צבעי כפתורים", "url": "/button-color-mapping.html", "category": "dev", "priority": "low"},
    {"name": "מיפוי צבעי כפתורים - פשוט", "url": "/button-color-mapping-simple.html", "category": "dev", "priority": "low"},
    {"name": "מודלים של תנאים", "url": "/conditions-modals.html", "category": "dev", "priority": "low"},
    {"name": "ניהול קבוצות העדפות", "url": "/preferences-groups-management.html", "category": "dev", "priority": "low"},
    {"name": "ניהול תגיות", "url": "/tag-management.html", "category": "dev", "priority": "low"},
    {"name": "ניהול מטמון", "url": "/cache-management.html", "category": "dev", "priority": "low"},
    {"name": "דשבורד איכות קוד", "url": "/code-quality-dashboard.html", "category": "dev", "priority": "low"},
    {"name": "ניהול מערכת אתחול", "url": "/init-system-management.html", "category": "dev", "priority": "low"},
    {"name": "בדיקת תנאים", "url": "/conditions-test.html", "category": "dev", "priority": "low"},
    
    # עמודי רשימות מעקב (Watch Lists)
    {"name": "ניהול רשימות צפייה", "url": "/watch-list.html", "category": "watchlists", "priority": "high"},
    {"name": "ניהול רשימות צפייה (מוקאפ)", "url": "/mockups/watch-lists-page.html", "category": "watchlists", "priority": "medium"},
    
    # עמודי מחקר (Research Pages) - משולבים
    {"name": "היסטוריית טרייד", "url": "/trade-history", "category": "main", "priority": "high"},
    {"name": "מצב תיק היסטורי", "url": "/portfolio-state.html", "category": "main", "priority": "high"},
    {"name": "יומן מסחר", "url": "/trading-journal.html", "category": "main", "priority": "high"},
    {"name": "ניתוח אסטרטגיות", "url": "/strategy-analysis", "category": "main", "priority": "high"},
    {"name": "מודל רשימת צפייה", "url": "/mockups/watch-list-modal.html", "category": "watchlists", "priority": "medium"},
    {"name": "מודל הוספת טיקר", "url": "/mockups/add-ticker-modal.html", "category": "watchlists", "priority": "medium"},
    {"name": "פעולה מהירה דגלים", "url": "/mockups/flag-quick-action.html", "category": "watchlists", "priority": "medium"},
    
    # עמודים נוספים
    {"name": "תצוגת ווידג'טים TradingView", "url": "/tradingview-widgets-showcase.html", "category": "additional", "priority": "low"},
    {"name": "טריידים מעוצבים", "url": "/trades_formatted.html", "category": "additional", "priority": "low"},
]

class RateLimitTracker:
    """Track requests to avoid hitting rate limits"""
    
    def __init__(self, max_requests_per_second: int = 5, window_seconds: int = 1):
        self.max_requests_per_second = max_requests_per_second
        self.window_seconds = window_seconds
        self.request_times = deque()
        self.rate_limit_hits = 0
        self.last_rate_limit_time = None
        self.adaptive_delay = 2.0  # Start with base delay
    
    def record_request(self):
        """Record a request timestamp"""
        current_time = time.time()
        self.request_times.append(current_time)
        
        # Remove old requests outside the window
        cutoff_time = current_time - self.window_seconds
        while self.request_times and self.request_times[0] < cutoff_time:
            self.request_times.popleft()
    
    def should_wait(self) -> bool:
        """Check if we should wait before making another request"""
        return len(self.request_times) >= self.max_requests_per_second
    
    def get_wait_time(self) -> float:
        """Calculate how long to wait before next request"""
        if not self.request_times:
            return 0.0
        
        # Calculate time until oldest request expires
        oldest_request = self.request_times[0]
        wait_time = (oldest_request + self.window_seconds) - time.time()
        return max(0.0, wait_time)
    
    def record_rate_limit_hit(self):
        """Record that we hit a rate limit"""
        self.rate_limit_hits += 1
        self.last_rate_limit_time = time.time()
        # Increase adaptive delay
        self.adaptive_delay = min(
            self.adaptive_delay * 1.5,
            RATE_LIMIT_CONFIG['max_delay_between_pages']
        )
    
    def record_success(self):
        """Record successful request - gradually decrease delay"""
        if self.rate_limit_hits == 0:
            # Only decrease if we haven't hit rate limits recently
            self.adaptive_delay = max(
                self.adaptive_delay * 0.95,
                RATE_LIMIT_CONFIG['min_delay_between_pages']
            )
    
    def get_adaptive_delay(self) -> float:
        """Get adaptive delay based on rate limit history"""
        return self.adaptive_delay
    
    def get_stats(self) -> dict:
        """Get rate limiting statistics"""
        return {
            'rate_limit_hits': self.rate_limit_hits,
            'current_requests_in_window': len(self.request_times),
            'adaptive_delay': self.adaptive_delay,
            'last_rate_limit_time': self.last_rate_limit_time
        }

# Global rate limit tracker
rate_tracker = RateLimitTracker(
    max_requests_per_second=RATE_LIMIT_CONFIG['max_requests_per_second'],
    window_seconds=RATE_LIMIT_CONFIG['window_seconds']
)

def setup_driver(prefer_chrome: bool = False):
    """
    Setup WebDriver (Chrome fallback) with options for console error testing.
    prefer_chrome: if True, use Chrome; otherwise try Firefox Dev first, then Chrome.
    """
    last_error = None

    def create_chrome():
        chrome_options = Options()
        # chrome_options.add_argument('--headless')  # intentionally visible for debugging
        chrome_options.set_preference('devtools.console.stdout.content', True)
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--width=1920')
        chrome_options.add_argument('--height=1080')
        dev_edition_path = "/Applications/Firefox Developer Edition.app/Contents/MacOS/chrome"
        if Path(dev_edition_path).exists():
            chrome_options.binary_location = dev_edition_path
        service = Service(GeckoDriverManager().install())
        driver = webdriver.Firefox(service=service, options=chrome_options)
        driver.set_script_timeout(60)
        return driver

    def create_chrome():
        chrome_options = ChromeOptions()
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--window-size=1920,1080')
        service = FirefoxService(GeckoDriverManager().install())
        driver = webdriver.Firefox(service=service, options=chrome_options)
        driver.set_script_timeout(60)
        return driver

    try:
        if prefer_chrome:
            return create_chrome()
        # Try Firefox first
        return create_chrome()
    except Exception as e1:
        last_error = e1
        print(f"⚠️ Firefox driver failed: {e1}")
        # Fallback to Chrome
        try:
            return create_chrome()
        except Exception as e2:
            print(f"❌ Error setting up any driver: Firefox: {e1} | Chrome: {e2}")
            print("💡 Make sure Firefox Dev or Chrome is installed. Using webdriver-manager for drivers.")
            return None

def login(driver):
    """Login using API token (requests) + sessionStorage injection; fallback to modal if needed."""
    try:
        print("🔐 Logging in as admin via API token (backend request) ...")
        token = None
        user = None
        try:
            api_resp = requests.post(
                f"{BASE_URL}/api/auth/login",
                json={"username": TEST_USERNAME, "password": TEST_PASSWORD},
                timeout=15,
                allow_redirects=False,
            )
            if api_resp.status_code == 200:
                data = api_resp.json()
                token = data.get("data", {}).get("access_token") or data.get("access_token")
                user = data.get("data", {}).get("user") or data.get("user")
        except Exception as api_err:
            print(f"⚠️  API token login request failed: {api_err}")

        if token:
            driver.get(f"{BASE_URL}/")
            WebDriverWait(driver, 15).until(
                lambda d: d.execute_script('return document.readyState') == 'complete'
            )

            driver.execute_script(
                """
                sessionStorage.setItem('dev_authToken', arguments[0]);
                sessionStorage.setItem('dev_currentUser', JSON.stringify(arguments[1] || {}));
                localStorage.setItem('authToken', arguments[0]);
                localStorage.setItem('currentUser', JSON.stringify(arguments[1] || {}));
                window.authToken = arguments[0];
                window.currentUser = arguments[1] || null;
                """,
                token,
                user or {},
            )

            driver.refresh()
            WebDriverWait(driver, 20).until(
                lambda d: d.execute_script('return document.readyState') == 'complete'
            )

            # Verify token via backend directly (Python requests)
            verify = requests.get(
                f"{BASE_URL}/api/auth/me",
                headers={"Authorization": f"Bearer {token}"},
                timeout=10,
            )
            if verify.status_code == 200 and verify.json().get("status") == "success":
                print("✅ API token login successful")
                return True
            else:
                print(f"⚠️  API token set but backend verify failed: {verify.status_code} {verify.text[:200]}")

        print("🔄 API token path failed or incomplete, falling back to modal flow ...")
        driver.get(f"{BASE_URL}/")

        WebDriverWait(driver, 15).until(
            lambda d: d.execute_script('return document.readyState') == 'complete'
        )

        WebDriverWait(driver, 20).until(
            lambda d: d.execute_script(
                "return !!window.TikTrackAuth && typeof window.TikTrackAuth.showLoginModal === 'function';"
            )
        )

        driver.execute_async_script(
            """
            const done = arguments[0];
            const timeout = setTimeout(() => done('timeout waiting for showLoginModal'), 10000);
            if (!window.TikTrackAuth || typeof window.TikTrackAuth.showLoginModal !== 'function') {
                clearTimeout(timeout);
                done('TikTrackAuth missing');
                return;
            }
            Promise.resolve(window.TikTrackAuth.showLoginModal())
              .then(() => { clearTimeout(timeout); done('ok'); })
              .catch(err => { clearTimeout(timeout); done(err && err.message ? err.message : String(err)); });
            """
        )

        WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.ID, "loginModalContainer"))
        )
        WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.ID, "loginForm"))
        )

        username_field = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.ID, "username"))
        )
        password_field = driver.find_element(By.ID, "password")

        driver.execute_script("arguments[0].scrollIntoView(true);", username_field)
        time.sleep(0.2)

        username_field.clear()
        username_field.send_keys(TEST_USERNAME)
        password_field.clear()
        password_field.send_keys(TEST_PASSWORD)

        login_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.ID, "loginBtn"))
        )
        driver.execute_script("arguments[0].scrollIntoView(true);", login_button)
        time.sleep(0.2)
        driver.execute_script("arguments[0].click();", login_button)

        try:
            reload_btn = WebDriverWait(driver, 5).until(
                EC.element_to_be_clickable((By.ID, "loginReloadButton"))
            )
            print("🛈 Reload button available - clicking to continue flow")
            driver.execute_script("arguments[0].scrollIntoView(true);", reload_btn)
            time.sleep(0.2)
            driver.execute_script("arguments[0].click();", reload_btn)
            WebDriverWait(driver, 20).until(
                lambda d: d.execute_script('return document.readyState') == 'complete'
            )
            time.sleep(1)
        except TimeoutException:
            print("⚠️  Reload button not found; continuing without manual reload")

        auth_status = driver.execute_async_script(
            """
            const done = arguments[0];
            const controller = new AbortController();
            const timeout = setTimeout(() => {
                controller.abort();
                done({ status: 0, error: 'timeout' });
            }, 10000);
            fetch('/api/auth/me', { method: 'GET', signal: controller.signal })
              .then(res => res.json().then(body => {
                  clearTimeout(timeout);
                  done({status: res.status, body});
              }))
              .catch(err => {
                  clearTimeout(timeout);
                  done({status: 0, error: err && err.message ? err.message : String(err)});
              });
            """
        )
        if auth_status.get("status") == 200 and auth_status.get("body", {}).get("status") == "success":
            print("✅ Login successful via modal flow")
            return True
        else:
            print(f"❌ Login failed: {auth_status}")
            return False
    except Exception as e:
        print(f"❌ Login process failed: {e}")
        return False

def test_page_console(driver, page_info, retry_count: int = 0):
    """Test a single page for console errors with rate limiting and retry logic"""
    url = BASE_URL + page_info["url"]
    result = {
        "page": page_info["name"],
        "url": page_info["url"],
        "category": page_info["category"],
        "priority": page_info["priority"],
        "success": False,
        "load_time": None,
        "console_errors": [],
        "console_warnings": [],
        "page_errors": [],
        "has_header": False,
        "has_core_systems": False,
        "initialization_status": {},
        "rate_limit_retries": retry_count,
        "timestamp": datetime.now().isoformat(),
        "login_modal_present": False,
        "login_modal_visible": False,
    }
    
    try:
        # Wait if we're hitting rate limits
        if rate_tracker.should_wait():
            wait_time = rate_tracker.get_wait_time()
            if wait_time > 0:
                print(f"  ⏳ Rate limit: waiting {wait_time:.2f}s...")
                time.sleep(wait_time)
        
        # Record request
        rate_tracker.record_request()
        
        # Clear previous logs (if supported)
        try:
            driver.get_log('browser')
        except AttributeError:
            pass
        
        # Navigate to page
        start_time = time.time()
        driver.get(url)
        
        # Wait for page to load
        try:
            WebDriverWait(driver, 10).until(
                lambda d: d.execute_script('return document.readyState') == 'complete'
            )
        except TimeoutException:
            result["page_errors"].append("Page load timeout")
        
        # Always update load_time, even if there was an exception
        result["load_time"] = time.time() - start_time
        
        # Wait additional time for JavaScript to execute
        time.sleep(2)
        
        # Get console logs (if supported)
        try:
            logs = driver.get_log('browser')
        except AttributeError:
            logs = []
        for log in logs:
            level = log.get('level', '').upper()
            message = log.get('message', '')
            
            # Filter out non-critical messages
            if 'favicon' in message.lower() or 'chrome-extension' in message.lower():
                continue
            
            # Filter out expected auth errors (401) - but we should be logged in as admin
            # Only filter /api/auth/me errors as they might be transient
            if '401 (UNAUTHORIZED)' in message and '/api/auth/me' in message:
                continue
            # Other 401 errors should be reported as we're logged in
            
            # Filter out network errors for missing optional resources
            if 'Failed to load resource' in message:
                # Check for 429 rate limit errors
                if '429' in message or 'Too Many Requests' in message:
                    rate_tracker.record_rate_limit_hit()
                    # Retry with exponential backoff
                    if retry_count < RATE_LIMIT_CONFIG['retry_max_attempts']:
                        retry_delay = RATE_LIMIT_CONFIG['retry_base_delay'] * (2 ** retry_count)
                        print(f"  ⚠️  Rate limit hit (429), retrying in {retry_delay:.1f}s (attempt {retry_count + 1}/{RATE_LIMIT_CONFIG['retry_max_attempts']})...")
                        time.sleep(retry_delay)
                        return test_page_console(driver, page_info, retry_count + 1)
                    else:
                        result["console_errors"].append({
                            "level": level,
                            "message": f"Rate limit exceeded after {retry_count} retries: {message}",
                            "timestamp": log.get('timestamp', 0)
                        })
                        continue
                
                # Only count as error if it's a critical resource
                if any(critical in message.lower() for critical in ['core-systems', 'unified-app-initializer', 'preferences-core']):
                    result["console_errors"].append({
                        "level": level,
                        "message": message,
                        "timestamp": log.get('timestamp', 0)
                    })
                # Otherwise, it's a warning
                elif level == 'SEVERE':
                    result["console_warnings"].append({
                        "level": "WARNING",
                        "message": message,
                        "timestamp": log.get('timestamp', 0)
                    })
                continue
            
            if level == 'SEVERE' or 'error' in message.lower():
                result["console_errors"].append({
                    "level": level,
                    "message": message,
                    "timestamp": log.get('timestamp', 0)
                })
            elif level == 'WARNING' or 'warning' in message.lower():
                result["console_warnings"].append({
                    "level": level,
                    "message": message,
                    "timestamp": log.get('timestamp', 0)
                })
        
        # Check for page errors using JavaScript
        page_status = driver.execute_script("""
            return {
                hasHeader: !!(document.querySelector('unified-header') || 
                             document.querySelector('app-header') || 
                             document.querySelector('.header-container') ||
                             document.querySelector('header')),
                hasCoreSystems: !!(window.initializeUnifiedApp || 
                                  document.querySelector('script[src*="core-systems.js"]')),
                recursionFlags: {
                    getPreferenceInProgress: !!(window.__GET_PREFERENCE_IN_PROGRESS__),
                    showNotificationInProgress: !!(window.__SHOW_NOTIFICATION_IN_PROGRESS__),
                    loadActiveAlertsInProgress: !!(window.__LOAD_ACTIVE_ALERTS_CALL_STACK__)
                },
                globalErrors: window.__LAST_GLOBAL_ERROR || null,
                documentReadyState: document.readyState
            };
        """)
        
        result["has_header"] = page_status.get("hasHeader", False)
        result["has_core_systems"] = page_status.get("hasCoreSystems", False)
        result["initialization_status"] = page_status.get("recursionFlags", {})
        
        if page_status.get("globalErrors"):
            result["page_errors"].append(page_status["globalErrors"])

        # Detect login modal presence + visibility (to avoid false positives from hidden markup)
        try:
            login_modal_info = driver.execute_script("""
                const selectors = [
                    '#loginModalContainer',
                    '#login-modal',
                    '.login-modal',
                    '[data-modal="login"]',
                    '[data-modal-type="login"]'
                ];
                const els = selectors.flatMap(sel => Array.from(document.querySelectorAll(sel)));
                const visible = els.some(el => {
                    const style = window.getComputedStyle(el);
                    const rect = el.getBoundingClientRect();
                    return style.display !== 'none' &&
                           style.visibility !== 'hidden' &&
                           style.opacity !== '0' &&
                           rect.width > 1 && rect.height > 1;
                });
                return { present: els.length > 0, visible };
            """)
            result["login_modal_present"] = bool(login_modal_info.get("present"))
            result["login_modal_visible"] = bool(login_modal_info.get("visible"))
        except Exception:
            # Non-fatal; ignore detection errors
            pass
        
        # Check for critical errors
        critical_errors = [
            "Maximum call stack size exceeded",
            "Uncaught",
            "ReferenceError",
            "TypeError",
            "SyntaxError"
        ]
        
        for error in result["console_errors"]:
            message = error.get("message", "").lower()
            if any(critical in message for critical in critical_errors):
                result["page_errors"].append(error["message"])
        
        # Success if no errors
        result["success"] = len(result["console_errors"]) == 0 and len(result["page_errors"]) == 0
        
        # Record success for adaptive delay
        if result["success"]:
            rate_tracker.record_success()
        
    except WebDriverException as e:
        error_msg = str(e)
        result["page_errors"].append(f"WebDriver error: {error_msg}")
        
        # Update load_time even if there was an exception
        if 'start_time' in locals():
            result["load_time"] = time.time() - start_time
        
        # Check if it's a rate limit error
        if '429' in error_msg or 'Too Many Requests' in error_msg:
            rate_tracker.record_rate_limit_hit()
            if retry_count < RATE_LIMIT_CONFIG['retry_max_attempts']:
                retry_delay = RATE_LIMIT_CONFIG['retry_base_delay'] * (2 ** retry_count)
                print(f"  ⚠️  Rate limit error, retrying in {retry_delay:.1f}s...")
                time.sleep(retry_delay)
                return test_page_console(driver, page_info, retry_count + 1)
    except Exception as e:
        result["page_errors"].append(f"Exception: {str(e)}")
        
        # Update load_time even if there was an exception
        if 'start_time' in locals():
            result["load_time"] = time.time() - start_time
    
    # Adaptive delay based on rate limit history
    if RATE_LIMIT_CONFIG['adaptive_delay']:
        delay = rate_tracker.get_adaptive_delay()
    else:
        delay = RATE_LIMIT_CONFIG['min_delay_between_pages']
    
    # Ensure minimum delay
    delay = max(delay, RATE_LIMIT_CONFIG['min_delay_between_pages'])
    
    # Additional wait if we're hitting rate limits
    if rate_tracker.should_wait():
        additional_wait = rate_tracker.get_wait_time()
        delay = max(delay, additional_wait)
    
    time.sleep(delay)
    
    return result

def main():
    """Main test function"""
    parser = argparse.ArgumentParser(description='Test console errors on pages')
    parser.add_argument('--page', type=str, help='Test specific page URL (e.g., /watch-list.html)')
    parser.add_argument('--all', action='store_true', help='Test all pages (default without flag = quick 3-page smoke)')
    args = parser.parse_args()
    
    # Filter pages if --page is specified, or use quick test pages
    pages_to_test = ALL_PAGES
    if args.page:
        page_url = args.page if args.page.startswith('/') else '/' + args.page
        pages_to_test = [p for p in ALL_PAGES if p['url'] == page_url]
        if not pages_to_test:
            print(f"❌ Page not found: {page_url}")
            print(f"Available pages with 'watch-list' in URL:")
            for p in [p for p in ALL_PAGES if 'watch-list' in p['url'].lower()]:
                print(f"  - {p['url']} ({p['name']})")
            return
    elif not args.all:
        # Quick test - only 3 critical pages to verify login modal fix
        pages_to_test = [
            p for p in ALL_PAGES
            if p['url'] in ['/', '/trades.html', '/alerts.html']
        ]
    
    print("=" * 80)
    if args.page:
        print(f"🔍 בדיקת שגיאות קונסול בעמוד: {args.page}")
    else:
        print("🔍 בדיקת שגיאות קונסול בכל העמודים")
    print("=" * 80)
    print(f"Base URL: {BASE_URL}")
    print(f"Total pages to test: {len(pages_to_test)}")
    print(f"Start time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80)
    print()
    
    # Prefer Chrome to avoid GitHub rate limits on geckodriver download
    driver = setup_driver(prefer_chrome=True)
    if not driver:
        print("❌ Failed to setup WebDriver. Exiting.")
        return
    
    # Login as admin before testing pages (CRITICAL: Always use admin/admin123)
    login_success = login(driver)
    time.sleep(2)  # Wait for login to complete
    if not login_success:
        print("❌ Login failed - aborting tests to avoid false results.")
        driver.quit()
        return
    
    results = []
    
    try:
        for i, page in enumerate(pages_to_test, 1):
            print(f"[{i}/{len(pages_to_test)}] Testing: {page['name']} ({page['url']}) [{page['category']}]")
            
            # Show rate limit stats if we've hit limits
            if rate_tracker.rate_limit_hits > 0:
                stats = rate_tracker.get_stats()
                if stats['adaptive_delay'] > RATE_LIMIT_CONFIG['min_delay_between_pages']:
                    print(f"  📊 Rate limit stats: {stats['rate_limit_hits']} hits, delay: {stats['adaptive_delay']:.2f}s")
            
            result = test_page_console(driver, page)
            results.append(result)
            
            status_icon = "✅" if result["success"] else "❌"
            errors_count = len(result["console_errors"]) + len(result["page_errors"])
            warnings_count = len(result["console_warnings"])
            
            print(f"  {status_icon} Status: {'SUCCESS' if result['success'] else 'ERRORS FOUND'}")
            if result.get('load_time') is not None:
                print(f"  ⏱️  Load time: {result['load_time']:.2f}s")
            else:
                print(f"  ⏱️  Load time: N/A")
            if result.get("rate_limit_retries", 0) > 0:
                print(f"  🔄 Retries: {result['rate_limit_retries']}")
            if errors_count > 0:
                print(f"  ❌ Errors: {errors_count}")
            if warnings_count > 0:
                print(f"  ⚠️  Warnings: {warnings_count}")
            if result["has_header"]:
                print(f"  📄 Header: ✅")
            if result["has_core_systems"]:
                print(f"  ⚙️  Core Systems: ✅")
            print()
    
    finally:
        driver.quit()
    
    # Summary
    print("=" * 80)
    print("📊 סיכום תוצאות")
    print("=" * 80)
    
    successful = [r for r in results if r["success"]]
    failed = [r for r in results if not r["success"]]
    with_errors = [r for r in results if r["console_errors"] or r["page_errors"]]
    with_warnings = [r for r in results if r["console_warnings"]]
    with_header = [r for r in results if r["has_header"]]
    with_core_systems = [r for r in results if r["has_core_systems"]]
    
    print(f"✅ עמודים ללא שגיאות: {len(successful)}/{len(results)} ({len(successful)/len(results)*100:.1f}%)")
    print(f"❌ עמודים עם שגיאות: {len(failed)}/{len(results)} ({len(failed)/len(results)*100:.1f}%)")
    print(f"⚠️  עמודים עם אזהרות: {len(with_warnings)}/{len(results)}")
    print(f"📄 עמודים עם Header: {len(with_header)}/{len(results)} ({len(with_header)/len(results)*100:.1f}%)")
    print(f"⚙️  עמודים עם Core Systems: {len(with_core_systems)}/{len(results)} ({len(with_core_systems)/len(results)*100:.1f}%)")
    print(f"🔐 עמודים עם מודל Login (נוכחות): {len([r for r in results if r.get('login_modal_present')])}/{len(results)}")
    print(f"🔓 עמודים עם מודל Login גלוי: {len([r for r in results if r.get('login_modal_visible')])}/{len(results)}")
    
    # Rate limiting statistics
    rate_stats = rate_tracker.get_stats()
    if rate_stats['rate_limit_hits'] > 0:
        print(f"📊 Rate Limiting: {rate_stats['rate_limit_hits']} rate limit hits detected")
        print(f"   Final adaptive delay: {rate_stats['adaptive_delay']:.2f}s")
    print()
    
    if failed:
        print("❌ עמודים עם שגיאות:")
        for r in failed:
            error_count = len(r["console_errors"]) + len(r["page_errors"])
            print(f"  - {r['page']} ({r['url']}) [{r['category']}]: {error_count} errors")
            if r["console_errors"]:
                for error in r["console_errors"][:3]:  # Show first 3 errors
                    print(f"    • {error['message'][:100]}")
            if r["page_errors"]:
                for error in r["page_errors"][:3]:  # Show first 3 errors
                    print(f"    • {str(error)[:100]}")
        print()
    
    # Save results to file
    output_file = Path(__file__).parent.parent / "console_errors_report.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump({
            "timestamp": datetime.now().isoformat(),
            "base_url": BASE_URL,
            "total_pages": len(results),
            "successful": len(successful),
            "failed": len(failed),
            "with_errors": len(with_errors),
            "with_warnings": len(with_warnings),
            "with_header": len(with_header),
            "with_core_systems": len(with_core_systems),
            "rate_limiting_stats": rate_tracker.get_stats(),
            "summary_by_category": {
                cat: {
                    "total": len([r for r in results if r["category"] == cat]),
                    "successful": len([r for r in results if r["category"] == cat and r["success"]])
                }
                for cat in set(r["category"] for r in results)
            },
            "results": results
        }, f, ensure_ascii=False, indent=2)
    
    print(f"💾 תוצאות נשמרו ל: {output_file}")
    print()
    print("=" * 80)
    print(f"✅ בדיקה הושלמה: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80)

if __name__ == "__main__":
    main()

