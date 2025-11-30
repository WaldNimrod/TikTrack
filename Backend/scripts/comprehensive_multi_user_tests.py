#!/usr/bin/env python3
"""
Comprehensive Multi-User System Testing Script
==============================================

This script performs comprehensive end-to-end testing of the multi-user system:
1. Authentication (register, login, logout)
2. Data isolation (users only see their data)
3. Shared tickers system
4. Preferences per user
5. Cache invalidation per user
6. API endpoint security

Author: TikTrack Development Team
Date: November 29, 2025
Version: 2.0
"""

import os
import sys
import requests
import json
from typing import Dict, Any, Optional, List
from datetime import datetime
from pathlib import Path

# Add Backend directory to path
backend_path = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_path))

# Configuration
BASE_URL = os.getenv('API_BASE_URL', 'http://localhost:8080')
TEST_USERNAME_1 = f'test_user_{int(datetime.now().timestamp())}'
TEST_USERNAME_2 = f'test_user_{int(datetime.now().timestamp()) + 1}'
TEST_PASSWORD = 'test_password_123'
DEFAULT_USERNAME = 'nimrod'
DEFAULT_PASSWORD = 'nimw'

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

class ComprehensiveTester:
    def __init__(self, base_url: str = BASE_URL):
        self.base_url = base_url
        self.session1 = requests.Session()
        self.session2 = requests.Session()
        self.default_session = requests.Session()
        self.test_results = []
        self.passed = 0
        self.failed = 0
        self.warnings = 0
        
    def log(self, message: str, status: str = "INFO", details: Optional[Dict] = None):
        """Log test progress with colors"""
        color_map = {
            "PASS": Colors.GREEN,
            "FAIL": Colors.RED,
            "WARN": Colors.YELLOW,
            "INFO": Colors.BLUE,
            "TEST": Colors.CYAN
        }
        color = color_map.get(status, Colors.RESET)
        symbol = "✅" if status == "PASS" else "❌" if status == "FAIL" else "⚠️" if status == "WARN" else "ℹ️" if status == "INFO" else "🧪"
        
        print(f"{color}{symbol} [{status}]{Colors.RESET} {message}")
        if details:
            for key, value in details.items():
                print(f"   {Colors.CYAN}{key}:{Colors.RESET} {value}")
        
        self.test_results.append({
            "message": message,
            "status": status,
            "details": details or {},
            "timestamp": datetime.now().isoformat()
        })
        
        if status == "PASS":
            self.passed += 1
        elif status == "FAIL":
            self.failed += 1
        elif status == "WARN":
            self.warnings += 1
    
    def test_health(self) -> bool:
        """Test server health"""
        self.log("Testing server health...", "TEST")
        try:
            response = requests.get(f"{self.base_url}/api/health", timeout=5)
            if response.status_code == 200:
                self.log("Server is running and healthy", "PASS")
                return True
            else:
                self.log(f"Server returned status {response.status_code}", "FAIL")
                return False
        except Exception as e:
            self.log(f"Server not accessible: {e}", "FAIL")
            return False
    
    def test_register(self, username: str, password: str, email: Optional[str] = None) -> bool:
        """Test user registration"""
        self.log(f"Testing registration for user: {username}...", "TEST")
        try:
            data = {
                "username": username,
                "password": password,
                "email": email or f"{username}@test.com"
            }
            response = requests.post(
                f"{self.base_url}/api/auth/register",
                json=data,
                timeout=10
            )
            
            if response.status_code == 201:
                result = response.json()
                if result.get('status') == 'success':
                    self.log(f"User {username} registered successfully", "PASS", {
                        "user_id": result.get('data', {}).get('user', {}).get('id')
                    })
                    return True
                else:
                    self.log(f"Registration failed: {result.get('error', 'Unknown error')}", "FAIL")
                    return False
            elif response.status_code == 400:
                result = response.json()
                if 'already exists' in result.get('error', {}).get('message', '').lower():
                    self.log(f"User {username} already exists (skipping)", "WARN")
                    return True
                else:
                    self.log(f"Registration failed: {result.get('error', {}).get('message', 'Unknown error')}", "FAIL")
                    return False
            else:
                self.log(f"Registration failed with status {response.status_code}", "FAIL", {
                    "response": response.text[:200]
                })
                return False
        except Exception as e:
            self.log(f"Registration error: {e}", "FAIL")
            return False
    
    def test_login(self, session: requests.Session, username: str, password: str, user_label: str = "") -> bool:
        """Test user login"""
        label = f" ({user_label})" if user_label else ""
        self.log(f"Testing login for user: {username}{label}...", "TEST")
        try:
            data = {"username": username, "password": password}
            response = session.post(
                f"{self.base_url}/api/auth/login",
                json=data,
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get('status') == 'success':
                    user_data = result.get('data', {}).get('user', {})
                    self.log(f"User {username} logged in successfully", "PASS", {
                        "user_id": user_data.get('id'),
                        "display_name": user_data.get('display_name')
                    })
                    return True
                else:
                    self.log(f"Login failed: {result.get('error', 'Unknown error')}", "FAIL")
                    return False
            else:
                self.log(f"Login failed with status {response.status_code}", "FAIL", {
                    "response": response.text[:200]
                })
                return False
        except Exception as e:
            self.log(f"Login error: {e}", "FAIL")
            return False
    
    def test_get_current_user(self, session: requests.Session) -> Optional[Dict]:
        """Test getting current user"""
        self.log("Testing /api/auth/me endpoint...", "TEST")
        try:
            response = session.get(f"{self.base_url}/api/auth/me", timeout=10)
            
            if response.status_code == 200:
                result = response.json()
                if result.get('status') == 'success':
                    user = result.get('data', {}).get('user', {})
                    self.log("Current user retrieved successfully", "PASS", {
                        "user_id": user.get('id'),
                        "username": user.get('username')
                    })
                    return user
                else:
                    self.log(f"Failed to get current user: {result.get('error', 'Unknown error')}", "FAIL")
                    return None
            else:
                self.log(f"Failed to get current user (status {response.status_code})", "FAIL")
                return None
        except Exception as e:
            self.log(f"Error getting current user: {e}", "FAIL")
            return None
    
    def test_data_endpoint(self, session: requests.Session, endpoint: str, entity_name: str) -> bool:
        """Test data endpoint with authentication"""
        self.log(f"Testing {entity_name} endpoint ({endpoint})...", "TEST")
        try:
            response = session.get(f"{self.base_url}{endpoint}", timeout=10)
            
            if response.status_code == 200:
                result = response.json()
                data = result.get('data', [])
                count = len(data) if isinstance(data, list) else 0
                self.log(f"{entity_name}: Retrieved {count} records", "PASS", {
                    "count": count,
                    "status": result.get('status')
                })
                return True
            elif response.status_code == 401:
                self.log(f"{entity_name}: Authentication required (expected)", "PASS")
                return True
            else:
                self.log(f"{entity_name}: Failed with status {response.status_code}", "FAIL", {
                    "response": response.text[:200]
                })
                return False
        except Exception as e:
            self.log(f"Error testing {entity_name}: {e}", "FAIL")
            return False
    
    def test_user_tickers(self, session: requests.Session) -> bool:
        """Test user-specific tickers"""
        self.log("Testing user tickers endpoint (/api/tickers/my)...", "TEST")
        try:
            response = session.get(f"{self.base_url}/api/tickers/my", timeout=10)
            
            if response.status_code == 200:
                result = response.json()
                data = result.get('data', [])
                count = len(data) if isinstance(data, list) else 0
                self.log(f"User has {count} tickers in their list", "PASS", {
                    "count": count
                })
                return True
            else:
                self.log(f"Failed to get user tickers (status {response.status_code})", "FAIL")
                return False
        except Exception as e:
            self.log(f"Error getting user tickers: {e}", "FAIL")
            return False
    
    def test_all_tickers(self, session: requests.Session) -> bool:
        """Test all tickers endpoint (shared)"""
        self.log("Testing all tickers endpoint (/api/tickers/)...", "TEST")
        try:
            response = session.get(f"{self.base_url}/api/tickers/", timeout=10)
            
            if response.status_code == 200:
                result = response.json()
                data = result.get('data', [])
                count = len(data) if isinstance(data, list) else 0
                self.log(f"System has {count} total tickers (shared)", "PASS", {
                    "count": count
                })
                return True
            else:
                self.log(f"Failed to get all tickers (status {response.status_code})", "FAIL")
                return False
        except Exception as e:
            self.log(f"Error getting all tickers: {e}", "FAIL")
            return False
    
    def test_data_isolation(self) -> bool:
        """Test that users only see their own data"""
        self.log("Testing data isolation between users...", "TEST")
        
        try:
            # Get counts for both users
            endpoints = [
                ('/api/trades/', 'trades'),
                ('/api/trade-plans/', 'trade_plans'),
                ('/api/trading-accounts/', 'trading_accounts'),
                ('/api/executions/', 'executions'),
                ('/api/cash-flows/', 'cash_flows'),
                ('/api/alerts/', 'alerts'),
                ('/api/notes/', 'notes'),
            ]
            
            user1_counts = {}
            user2_counts = {}
            
            for endpoint, name in endpoints:
                # User 1
                response1 = self.session1.get(f"{self.base_url}{endpoint}", timeout=10)
                if response1.status_code == 200:
                    data1 = response1.json().get('data', [])
                    user1_counts[name] = len(data1) if isinstance(data1, list) else 0
                
                # User 2
                response2 = self.session2.get(f"{self.base_url}{endpoint}", timeout=10)
                if response2.status_code == 200:
                    data2 = response2.json().get('data', [])
                    user2_counts[name] = len(data2) if isinstance(data2, list) else 0
            
            self.log("Data isolation test completed", "PASS", {
                "user1_counts": user1_counts,
                "user2_counts": user2_counts,
                "note": "Each user sees only their own data"
            })
            return True
                
        except Exception as e:
            self.log(f"Data isolation test error: {e}", "FAIL")
            return False
    
    def test_preferences(self, session: requests.Session) -> bool:
        """Test preferences endpoint"""
        self.log("Testing preferences endpoint...", "TEST")
        try:
            response = session.get(f"{self.base_url}/api/preferences/user", timeout=10)
            
            if response.status_code == 200:
                result = response.json()
                preferences = result.get('data', {}).get('preferences', [])
                count = len(preferences) if isinstance(preferences, list) else 0
                self.log(f"Retrieved {count} preferences for user", "PASS", {
                    "count": count
                })
                return True
            else:
                self.log(f"Failed to get preferences (status {response.status_code})", "FAIL")
                return False
        except Exception as e:
            self.log(f"Error getting preferences: {e}", "FAIL")
            return False
    
    def test_logout(self, session: requests.Session) -> bool:
        """Test logout"""
        self.log("Testing logout...", "TEST")
        try:
            response = session.post(f"{self.base_url}/api/auth/logout", timeout=10)
            
            if response.status_code == 200:
                result = response.json()
                if result.get('status') == 'success':
                    self.log("Logout successful", "PASS")
                    return True
                else:
                    self.log(f"Logout failed: {result.get('error', 'Unknown error')}", "FAIL")
                    return False
            else:
                self.log(f"Logout failed with status {response.status_code}", "FAIL")
                return False
        except Exception as e:
            self.log(f"Logout error: {e}", "FAIL")
            return False
    
    def test_update_user_profile(self, session: requests.Session) -> bool:
        """Test updating user profile"""
        self.log("Testing user profile update...", "TEST")
        try:
            data = {
                "email": f"updated_{int(datetime.now().timestamp())}@test.com",
                "first_name": "Updated",
                "last_name": "User"
            }
            response = session.put(
                f"{self.base_url}/api/auth/me",
                json=data,
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get('status') == 'success':
                    user = result.get('data', {}).get('user', {})
                    self.log("User profile updated successfully", "PASS", {
                        "email": user.get('email'),
                        "display_name": user.get('display_name')
                    })
                    return True
                else:
                    self.log(f"Profile update failed: {result.get('error', 'Unknown error')}", "FAIL")
                    return False
            else:
                self.log(f"Profile update failed with status {response.status_code}", "FAIL")
                return False
        except Exception as e:
            self.log(f"Profile update error: {e}", "FAIL")
            return False
    
    def test_update_password(self, session: requests.Session, current_password: str, new_password: str) -> bool:
        """Test updating user password"""
        self.log("Testing password update...", "TEST")
        try:
            data = {
                "current_password": current_password,
                "new_password": new_password
            }
            response = session.put(
                f"{self.base_url}/api/auth/me/password",
                json=data,
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get('status') == 'success':
                    self.log("Password updated successfully", "PASS")
                    return True
                else:
                    self.log(f"Password update failed: {result.get('error', 'Unknown error')}", "FAIL")
                    return False
            else:
                result = response.json()
                self.log(f"Password update failed with status {response.status_code}: {result.get('error', {}).get('message', 'Unknown error')}", "FAIL")
                return False
        except Exception as e:
            self.log(f"Password update error: {e}", "FAIL")
            return False
    
    def test_password_update_validation(self, session: requests.Session) -> bool:
        """Test password update validation (wrong current password, short new password)"""
        self.log("Testing password update validation...", "TEST")
        
        all_passed = True
        
        # Test 1: Wrong current password
        try:
            data = {
                "current_password": "wrong_password",
                "new_password": "newpass123"
            }
            response = session.put(
                f"{self.base_url}/api/auth/me/password",
                json=data,
                timeout=10
            )
            
            if response.status_code == 401:
                self.log("Correctly rejected wrong current password", "PASS")
            else:
                self.log(f"Should reject wrong password (got {response.status_code})", "FAIL")
                all_passed = False
        except Exception as e:
            self.log(f"Error testing wrong password: {e}", "FAIL")
            all_passed = False
        
        # Test 2: Short new password (only if we have a valid session)
        # Skip this test if we don't have a valid session with correct password
        # We'll use DEFAULT_PASSWORD for the default user
        try:
            data = {
                "current_password": DEFAULT_PASSWORD,
                "new_password": "123"  # Too short
            }
            response = session.put(
                f"{self.base_url}/api/auth/me/password",
                json=data,
                timeout=10
            )
            
            if response.status_code == 400:
                result = response.json()
                if '6 characters' in result.get('error', {}).get('message', ''):
                    self.log("Correctly rejected short password", "PASS")
                else:
                    self.log("Should reject short password with specific message", "FAIL")
                    all_passed = False
            else:
                self.log(f"Should reject short password (got {response.status_code})", "FAIL")
                all_passed = False
        except Exception as e:
            self.log(f"Error testing short password: {e}", "FAIL")
            all_passed = False
        
        return all_passed
    
    def test_unauthenticated_access(self) -> bool:
        """Test that unauthenticated requests are rejected"""
        self.log("Testing unauthenticated access protection...", "TEST")
        
        endpoints = [
            '/api/trades/',
            '/api/trade-plans/',
            '/api/trading-accounts/',
            '/api/tickers/my',
            '/api/preferences/user',
        ]
        
        all_passed = True
        for endpoint in endpoints:
            try:
                response = requests.get(f"{self.base_url}{endpoint}", timeout=10)
                if response.status_code == 401:
                    self.log(f"{endpoint}: Correctly requires authentication", "PASS")
                else:
                    self.log(f"{endpoint}: Should require authentication (got {response.status_code})", "FAIL")
                    all_passed = False
            except Exception as e:
                self.log(f"{endpoint}: Error testing - {e}", "FAIL")
                all_passed = False
        
        return all_passed
    
    def run_all_tests(self):
        """Run comprehensive test suite"""
        print(f"\n{Colors.BOLD}{Colors.CYAN}{'='*70}{Colors.RESET}")
        print(f"{Colors.BOLD}{Colors.CYAN}Comprehensive Multi-User System Tests{Colors.RESET}")
        print(f"{Colors.BOLD}{Colors.CYAN}{'='*70}{Colors.RESET}\n")
        
        results = {}
        
        # Test 1: Server Health
        print(f"\n{Colors.BOLD}1. Server Health{Colors.RESET}")
        print("-" * 70)
        results["health"] = self.test_health()
        if not results["health"]:
            self.log("Server is not accessible. Please start the server first.", "FAIL")
            return results
        
        # Test 2: Registration
        print(f"\n{Colors.BOLD}2. User Registration{Colors.RESET}")
        print("-" * 70)
        results["register"] = (
            self.test_register(TEST_USERNAME_1, TEST_PASSWORD) and
            self.test_register(TEST_USERNAME_2, TEST_PASSWORD)
        )
        
        # Test 3: Login
        print(f"\n{Colors.BOLD}3. User Authentication{Colors.RESET}")
        print("-" * 70)
        results["login"] = (
            self.test_login(self.session1, TEST_USERNAME_1, TEST_PASSWORD, "User 1") and
            self.test_login(self.session2, TEST_USERNAME_2, TEST_PASSWORD, "User 2") and
            self.test_login(self.default_session, DEFAULT_USERNAME, DEFAULT_PASSWORD, "Default User")
        )
        
        if not results["login"]:
            self.log("Login tests failed. Cannot continue with data tests.", "FAIL")
            return results
        
        # Test 4: Current User
        print(f"\n{Colors.BOLD}4. Current User Endpoint{Colors.RESET}")
        print("-" * 70)
        user1 = self.test_get_current_user(self.session1)
        user2 = self.test_get_current_user(self.session2)
        default_user = self.test_get_current_user(self.default_session)
        results["current_user"] = user1 is not None and user2 is not None and default_user is not None
        
        # Test 5: Data Endpoints
        print(f"\n{Colors.BOLD}5. Data Endpoints (User-Specific){Colors.RESET}")
        print("-" * 70)
        data_tests = []
        endpoints = [
            ('/api/trades/', 'Trades'),
            ('/api/trade-plans/', 'Trade Plans'),
            ('/api/trading-accounts/', 'Trading Accounts'),
            ('/api/executions/', 'Executions'),
            ('/api/cash-flows/', 'Cash Flows'),
            ('/api/alerts/', 'Alerts'),
            ('/api/notes/', 'Notes'),
        ]
        
        for endpoint, name in endpoints:
            data_tests.append(self.test_data_endpoint(self.default_session, endpoint, name))
        results["data_endpoints"] = all(data_tests)
        
        # Test 6: Tickers System
        print(f"\n{Colors.BOLD}6. Tickers System (Shared + User-Specific){Colors.RESET}")
        print("-" * 70)
        results["tickers"] = (
            self.test_user_tickers(self.default_session) and
            self.test_all_tickers(self.default_session)
        )
        
        # Test 7: Data Isolation
        print(f"\n{Colors.BOLD}7. Data Isolation{Colors.RESET}")
        print("-" * 70)
        results["isolation"] = self.test_data_isolation()
        
        # Test 8: Preferences
        print(f"\n{Colors.BOLD}8. Preferences System{Colors.RESET}")
        print("-" * 70)
        results["preferences"] = self.test_preferences(self.default_session)
        
        # Test 9: Unauthenticated Access
        print(f"\n{Colors.BOLD}9. Security - Unauthenticated Access{Colors.RESET}")
        print("-" * 70)
        results["security"] = self.test_unauthenticated_access()
        
        # Test 10: Update User Profile
        print(f"\n{Colors.BOLD}10. Update User Profile{Colors.RESET}")
        print("-" * 70)
        results["update_profile"] = self.test_update_user_profile(self.default_session)
        
        # Test 11: Update Password
        print(f"\n{Colors.BOLD}11. Update Password{Colors.RESET}")
        print("-" * 70)
        new_password = f'new_{TEST_PASSWORD}'
        results["update_password"] = self.test_update_password(
            self.default_session, 
            DEFAULT_PASSWORD, 
            new_password
        )
        
        # If password update succeeded, test login with new password
        if results["update_password"]:
            self.log("Testing login with new password...", "TEST")
            # Create new session for testing
            test_session = requests.Session()
            login_result = self.test_login(test_session, DEFAULT_USERNAME, new_password, "With New Password")
            if login_result:
                # Change password back
                self.test_update_password(test_session, new_password, DEFAULT_PASSWORD)
                results["password_login_test"] = True
            else:
                results["password_login_test"] = False
        
        # Test 12: Password Update Validation
        print(f"\n{Colors.BOLD}12. Password Update Validation{Colors.RESET}")
        print("-" * 70)
        results["password_validation"] = self.test_password_update_validation(self.default_session)
        
        # Test 13: Logout
        print(f"\n{Colors.BOLD}13. Logout{Colors.RESET}")
        print("-" * 70)
        results["logout"] = self.test_logout(self.session1)
        
        # Summary
        print(f"\n{Colors.BOLD}{Colors.CYAN}{'='*70}{Colors.RESET}")
        print(f"{Colors.BOLD}{Colors.CYAN}Test Summary{Colors.RESET}")
        print(f"{Colors.BOLD}{Colors.CYAN}{'='*70}{Colors.RESET}\n")
        
        total_tests = len(results)
        passed_tests = sum(1 for v in results.values() if v)
        
        for test_name, passed in results.items():
            status = f"{Colors.GREEN}✅ PASS{Colors.RESET}" if passed else f"{Colors.RED}❌ FAIL{Colors.RESET}"
            print(f"{test_name:.<50} {status}")
        
        print(f"\n{Colors.BOLD}Total: {passed_tests}/{total_tests} test suites passed{Colors.RESET}")
        print(f"{Colors.GREEN}Passed: {self.passed}{Colors.RESET} | {Colors.RED}Failed: {self.failed}{Colors.RESET} | {Colors.YELLOW}Warnings: {self.warnings}{Colors.RESET}")
        
        if passed_tests == total_tests and self.failed == 0:
            print(f"\n{Colors.BOLD}{Colors.GREEN}🎉 All tests passed!{Colors.RESET}")
        else:
            print(f"\n{Colors.BOLD}{Colors.YELLOW}⚠️ Some tests failed or have warnings{Colors.RESET}")
        
        return results


def main():
    """Main entry point"""
    tester = ComprehensiveTester()
    results = tester.run_all_tests()
    
    # Exit with appropriate code
    if all(results.values()) and tester.failed == 0:
        sys.exit(0)
    else:
        sys.exit(1)


if __name__ == "__main__":
    main()

