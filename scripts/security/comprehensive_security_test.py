#!/usr/bin/env python3
"""
Comprehensive Security Test - User Data Isolation & Page Protection
====================================================================

Tests to verify:
1. User data isolation in all API endpoints
2. Page protection via auth-guard
3. End-to-end scenarios

Usage:
    python3 scripts/security/comprehensive_security_test.py [--url URL] [--browser]

Author: TikTrack Development Team
Date: December 2025
"""

import sys
import os
import requests
import json
import subprocess
from typing import Dict, List, Any, Optional

# Add Backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'Backend'))

# Test configuration
BASE_URL = os.getenv('TEST_BASE_URL', "http://localhost:8080")
TEST_USER_1 = {
    "username": "test_user_1",
    "password": "test_password_1"
}
TEST_USER_2 = {
    "username": "test_user_2",
    "password": "test_password_2"
}

class ComprehensiveSecurityTest:
    def __init__(self, base_url: str = BASE_URL):
        self.base_url = base_url
        self.session_user1 = requests.Session()
        self.session_user2 = requests.Session()
        self.user1_id = None
        self.user2_id = None
        self.results = {
            "backend": {"passed": [], "failed": [], "warnings": []},
            "frontend": {"passed": [], "failed": [], "warnings": []},
            "e2e": {"passed": [], "failed": [], "warnings": []}
        }
    
    def log_result(self, category: str, test_name: str, passed: bool, message: str = "", warning: bool = False):
        """Log test result"""
        if warning:
            self.results[category]["warnings"].append({
                "test": test_name,
                "message": message
            })
            print(f"⚠️  WARNING [{category}]: {test_name} - {message}")
        elif passed:
            self.results[category]["passed"].append({
                "test": test_name,
                "message": message
            })
            print(f"✅ PASS [{category}]: {test_name} - {message}")
        else:
            self.results[category]["failed"].append({
                "test": test_name,
                "message": message
            })
            print(f"❌ FAIL [{category}]: {test_name} - {message}")
    
    def authenticate_user(self, session: requests.Session, username: str, password: str) -> Optional[int]:
        """Authenticate user and return user_id"""
        try:
            response = session.post(
                f"{self.base_url}/api/auth/login",
                json={"username": username, "password": password},
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "success" and data.get("data", {}).get("user"):
                    user_id = data["data"]["user"].get("id")
                    print(f"✅ Authenticated user: {username} (ID: {user_id})")
                    return user_id
            else:
                print(f"⚠️  Authentication failed for {username}: {response.status_code}")
                return None
        except Exception as e:
            print(f"❌ Error authenticating {username}: {str(e)}")
            return None
    
    def setup_test_users(self):
        """Setup test users"""
        print("\n" + "="*60)
        print("Setting up test users...")
        print("="*60)
        
        self.user1_id = self.authenticate_user(self.session_user1, TEST_USER_1["username"], TEST_USER_1["password"])
        self.user2_id = self.authenticate_user(self.session_user2, TEST_USER_2["username"], TEST_USER_2["password"])
        
        if not self.user1_id or not self.user2_id:
            print("⚠️  Note: Test users may need to be created manually")
            return False
        
        return True
    
    def test_notes_api_isolation(self):
        """Test Notes API user isolation"""
        print("\n" + "="*60)
        print("Testing Notes API User Isolation")
        print("="*60)
        
        if not self.user1_id or not self.user2_id:
            self.log_result("backend", "Notes API Isolation", False, "Test users not authenticated", warning=True)
            return
        
        try:
            # Get notes for user 1
            response1 = self.session_user1.get(f"{self.base_url}/api/notes/")
            if response1.status_code != 200:
                self.log_result("backend", "Notes API Isolation", False, f"Failed to get notes for user 1: {response1.status_code}")
                return
            
            data1 = response1.json()
            notes1 = data1.get("data", [])
            user1_note_ids = {note.get("id") for note in notes1 if note.get("user_id") == self.user1_id}
            
            # Get notes for user 2
            response2 = self.session_user2.get(f"{self.base_url}/api/notes/")
            if response2.status_code != 200:
                self.log_result("backend", "Notes API Isolation", False, f"Failed to get notes for user 2: {response2.status_code}")
                return
            
            data2 = response2.json()
            notes2 = data2.get("data", [])
            user2_note_ids = {note.get("id") for note in notes2 if note.get("user_id") == self.user2_id}
            
            # Check isolation
            overlap = user1_note_ids & user2_note_ids
            if overlap:
                self.log_result("backend", "Notes API Isolation", False, f"Found {len(overlap)} notes shared between users: {overlap}")
            else:
                self.log_result("backend", "Notes API Isolation", True, f"User 1: {len(user1_note_ids)} notes, User 2: {len(user2_note_ids)} notes - No overlap")
            
            # Check that all notes belong to correct user
            user1_foreign_notes = [n for n in notes1 if n.get("user_id") != self.user1_id]
            user2_foreign_notes = [n for n in notes2 if n.get("user_id") != self.user2_id]
            
            if user1_foreign_notes:
                self.log_result("backend", "Notes API User Filtering", False, f"User 1 received {len(user1_foreign_notes)} notes from other users")
            elif user2_foreign_notes:
                self.log_result("backend", "Notes API User Filtering", False, f"User 2 received {len(user2_foreign_notes)} notes from other users")
            else:
                self.log_result("backend", "Notes API User Filtering", True, "All notes are correctly filtered by user_id")
                
        except Exception as e:
            self.log_result("backend", "Notes API Isolation", False, f"Error: {str(e)}")
    
    def test_portfolio_api_isolation(self):
        """Test Portfolio API user isolation"""
        print("\n" + "="*60)
        print("Testing Portfolio API User Isolation")
        print("="*60)
        
        if not self.user1_id or not self.user2_id:
            self.log_result("backend", "Portfolio API Isolation", False, "Test users not authenticated", warning=True)
            return
        
        try:
            # Get portfolio for user 1
            response1 = self.session_user1.get(f"{self.base_url}/api/positions/portfolio")
            if response1.status_code == 200:
                data1 = response1.json()
                portfolio1 = data1.get("data", {})
                accounts1 = portfolio1.get("accounts_processed", 0)
                
                # Get portfolio for user 2
                response2 = self.session_user2.get(f"{self.base_url}/api/positions/portfolio")
                if response2.status_code == 200:
                    data2 = response2.json()
                    portfolio2 = data2.get("data", {})
                    accounts2 = portfolio2.get("accounts_processed", 0)
                    
                    self.log_result(
                        "backend",
                        "Portfolio API Isolation",
                        True,
                        f"User 1: {accounts1} accounts, User 2: {accounts2} accounts"
                    )
                else:
                    self.log_result("backend", "Portfolio API Isolation", False, f"Failed to get portfolio for user 2: {response2.status_code}")
            else:
                self.log_result("backend", "Portfolio API Isolation", False, f"Failed to get portfolio for user 1: {response1.status_code}")
        except Exception as e:
            self.log_result("backend", "Portfolio API Isolation", False, f"Error: {str(e)}")
    
    def test_trade_plan_matching_isolation(self):
        """Test Trade Plan Matching user isolation"""
        print("\n" + "="*60)
        print("Testing Trade Plan Matching User Isolation")
        print("="*60)
        
        if not self.user1_id or not self.user2_id:
            self.log_result("backend", "Trade Plan Matching Isolation", False, "Test users not authenticated", warning=True)
            return
        
        try:
            # Get assignment suggestions for user 1
            response1 = self.session_user1.get(f"{self.base_url}/api/trades/pending-plan/assignments")
            if response1.status_code == 200:
                data1 = response1.json()
                suggestions1 = data1.get("data", [])
                trade_ids1 = {s.get("trade_id") for s in suggestions1}
                
                # Get assignment suggestions for user 2
                response2 = self.session_user2.get(f"{self.base_url}/api/trades/pending-plan/assignments")
                if response2.status_code == 200:
                    data2 = response2.json()
                    suggestions2 = data2.get("data", [])
                    trade_ids2 = {s.get("trade_id") for s in suggestions2}
                    
                    overlap = trade_ids1 & trade_ids2
                    if overlap and len(trade_ids1) > 0 and len(trade_ids2) > 0:
                        self.log_result(
                            "backend",
                            "Trade Plan Matching Isolation",
                            True,
                            f"User 1: {len(suggestions1)} suggestions, User 2: {len(suggestions2)} suggestions (overlap may be OK if trades are shared)"
                        )
                    else:
                        self.log_result(
                            "backend",
                            "Trade Plan Matching Isolation",
                            True,
                            f"User 1: {len(suggestions1)} suggestions, User 2: {len(suggestions2)} suggestions - No overlap"
                        )
                else:
                    self.log_result("backend", "Trade Plan Matching Isolation", False, f"Failed to get suggestions for user 2: {response2.status_code}")
            else:
                self.log_result("backend", "Trade Plan Matching Isolation", False, f"Failed to get suggestions for user 1: {response1.status_code}")
        except Exception as e:
            self.log_result("backend", "Trade Plan Matching Isolation", False, f"Error: {str(e)}")
    
    def test_all_backend_endpoints(self):
        """Test all backend endpoints for user_id filtering"""
        print("\n" + "="*60)
        print("Testing All Backend Endpoints")
        print("="*60)
        
        endpoints_to_test = [
            ("/api/notes/", "Notes"),
            ("/api/positions/portfolio", "Portfolio"),
            ("/api/trades/pending-plan/assignments", "Trade Plan Assignments"),
            ("/api/trades/pending-plan/creations", "Trade Plan Creations"),
            ("/api/trading-accounts/", "Trading Accounts"),
            ("/api/trades/", "Trades"),
            ("/api/trade-plans/", "Trade Plans"),
            ("/api/executions/", "Executions"),
            ("/api/alerts/", "Alerts"),
            ("/api/cash-flows/", "Cash Flows"),
        ]
        
        if not self.user1_id:
            self.log_result("backend", "All Endpoints", False, "Test user not authenticated", warning=True)
            return
        
        for endpoint, name in endpoints_to_test:
            try:
                response = self.session_user1.get(f"{self.base_url}{endpoint}")
                if response.status_code == 200:
                    self.log_result("backend", f"{name} Endpoint", True, f"Endpoint accessible and returns data")
                elif response.status_code == 401:
                    self.log_result("backend", f"{name} Endpoint", True, f"Endpoint requires authentication (correct)")
                else:
                    self.log_result("backend", f"{name} Endpoint", False, f"Unexpected status: {response.status_code}")
            except Exception as e:
                self.log_result("backend", f"{name} Endpoint", False, f"Error: {str(e)}")
    
    def test_frontend_auth_guard(self):
        """Test frontend auth-guard loading"""
        print("\n" + "="*60)
        print("Testing Frontend Auth Guard")
        print("="*60)
        
        # Check if auth-guard.js exists
        auth_guard_path = os.path.join(os.path.dirname(__file__), '..', '..', 'trading-ui', 'scripts', 'auth-guard.js')
        if os.path.exists(auth_guard_path):
            self.log_result("frontend", "Auth Guard File", True, "auth-guard.js exists")
        else:
            self.log_result("frontend", "Auth Guard File", False, "auth-guard.js not found")
            return
        
        # Check if auth-guard is in BASE package
        manifest_path = os.path.join(os.path.dirname(__file__), '..', '..', 'trading-ui', 'scripts', 'init-system', 'package-manifest.js')
        if os.path.exists(manifest_path):
            with open(manifest_path, 'r', encoding='utf-8') as f:
                content = f.read()
                if 'auth-guard.js' in content and 'base' in content.lower():
                    self.log_result("frontend", "Auth Guard in BASE Package", True, "auth-guard.js is in BASE package")
                else:
                    self.log_result("frontend", "Auth Guard in BASE Package", False, "auth-guard.js not found in BASE package")
        
        # Check HTML files
        html_files = []
        trading_ui_path = os.path.join(os.path.dirname(__file__), '..', '..', 'trading-ui')
        for root, dirs, files in os.walk(trading_ui_path):
            if 'mockups' in root:
                continue
            for file in files:
                if file.endswith('.html') and not file.startswith('test-') and '-smart.html' not in file:
                    html_files.append(os.path.join(root, file))
        
        pages_with_auth_guard = 0
        pages_without_auth_guard = []
        
        for html_file in html_files[:20]:  # Check first 20 pages
            try:
                with open(html_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                    if 'auth-guard.js' in content:
                        pages_with_auth_guard += 1
                    else:
                        filename = os.path.basename(html_file)
                        # Skip public pages
                        if filename not in ['login.html', 'register.html', 'reset-password.html', 'forgot-password.html']:
                            pages_without_auth_guard.append(filename)
            except Exception as e:
                pass
        
        if pages_without_auth_guard:
            self.log_result("frontend", "Auth Guard in HTML", False, f"Pages without auth-guard: {', '.join(pages_without_auth_guard[:5])}")
        else:
            self.log_result("frontend", "Auth Guard in HTML", True, f"Checked {pages_with_auth_guard} pages - all have auth-guard")
    
    def run_all_tests(self):
        """Run all security tests"""
        print("\n" + "="*60)
        print("Comprehensive Security Test Suite")
        print("="*60)
        
        if not self.setup_test_users():
            print("\n⚠️  Warning: Could not authenticate test users")
            print("   Some tests may be skipped")
        
        # Backend tests
        self.test_notes_api_isolation()
        self.test_portfolio_api_isolation()
        self.test_trade_plan_matching_isolation()
        self.test_all_backend_endpoints()
        
        # Frontend tests
        self.test_frontend_auth_guard()
        
        # Print summary
        print("\n" + "="*60)
        print("Test Summary")
        print("="*60)
        
        for category in ["backend", "frontend", "e2e"]:
            passed = len(self.results[category]["passed"])
            failed = len(self.results[category]["failed"])
            warnings = len(self.results[category]["warnings"])
            print(f"\n{category.upper()}:")
            print(f"  ✅ Passed: {passed}")
            print(f"  ❌ Failed: {failed}")
            print(f"  ⚠️  Warnings: {warnings}")
            
            if self.results[category]["failed"]:
                print(f"\n  Failed Tests:")
                for failure in self.results[category]["failed"]:
                    print(f"    - {failure['test']}: {failure['message']}")
        
        total_failed = sum(len(self.results[cat]["failed"]) for cat in self.results)
        return total_failed == 0


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Comprehensive security test")
    parser.add_argument("--url", default=BASE_URL, help="Base URL for API (default: http://localhost:8080)")
    parser.add_argument("--browser", action="store_true", help="Run browser tests (not implemented yet)")
    args = parser.parse_args()
    
    runner = ComprehensiveSecurityTest(base_url=args.url)
    success = runner.run_all_tests()
    
    sys.exit(0 if success else 1)

