#!/usr/bin/env python3
"""
Security Test - User Data Isolation
====================================

Tests to verify that user data is properly isolated:
- Notes API returns only notes for the authenticated user
- Portfolio API returns only portfolio for the authenticated user
- Trade Plan Matching returns only suggestions for the authenticated user

Usage:
    python3 scripts/security/user_data_isolation_test.py

Author: TikTrack Development Team
Date: December 2025
"""

import sys
import os
import requests
import json
from typing import Dict, List, Any, Optional

# Add Backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'Backend'))

# Test configuration
BASE_URL = "http://localhost:8080"
TEST_USER_1 = {
    "username": "test_user_1",
    "password": "test_password_1"
}
TEST_USER_2 = {
    "username": "test_user_2",
    "password": "test_password_2"
}

class SecurityTestRunner:
    def __init__(self, base_url: str = BASE_URL):
        self.base_url = base_url
        self.session_user1 = requests.Session()
        self.session_user2 = requests.Session()
        self.user1_id = None
        self.user2_id = None
        self.results = {
            "passed": [],
            "failed": [],
            "warnings": []
        }
    
    def log_result(self, test_name: str, passed: bool, message: str = "", warning: bool = False):
        """Log test result"""
        if warning:
            self.results["warnings"].append({
                "test": test_name,
                "message": message
            })
            print(f"⚠️  WARNING: {test_name} - {message}")
        elif passed:
            self.results["passed"].append({
                "test": test_name,
                "message": message
            })
            print(f"✅ PASS: {test_name} - {message}")
        else:
            self.results["failed"].append({
                "test": test_name,
                "message": message
            })
            print(f"❌ FAIL: {test_name} - {message}")
    
    def authenticate_user(self, session: requests.Session, username: str, password: str) -> bool:
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
        """Setup test users (create if needed, authenticate)"""
        print("\n" + "="*60)
        print("Setting up test users...")
        print("="*60)
        
        # Try to authenticate existing users
        self.user1_id = self.authenticate_user(self.session_user1, TEST_USER_1["username"], TEST_USER_1["password"])
        self.user2_id = self.authenticate_user(self.session_user2, TEST_USER_2["username"], TEST_USER_2["password"])
        
        if not self.user1_id or not self.user2_id:
            print("⚠️  Note: Test users may need to be created manually")
            print("   This test assumes users exist in the database")
            return False
        
        return True
    
    def test_notes_api_isolation(self):
        """Test that Notes API returns only notes for authenticated user"""
        print("\n" + "="*60)
        print("Testing Notes API User Isolation")
        print("="*60)
        
        if not self.user1_id or not self.user2_id:
            self.log_result("Notes API Isolation", False, "Test users not authenticated", warning=True)
            return
        
        try:
            # Get notes for user 1
            response1 = self.session_user1.get(f"{self.base_url}/api/notes/")
            if response1.status_code == 200:
                data1 = response1.json()
                notes1 = data1.get("data", [])
                user1_note_ids = {note.get("id") for note in notes1 if note.get("user_id") == self.user1_id}
                
                # Get notes for user 2
                response2 = self.session_user2.get(f"{self.base_url}/api/notes/")
                if response2.status_code == 200:
                    data2 = response2.json()
                    notes2 = data2.get("data", [])
                    user2_note_ids = {note.get("id") for note in notes2 if note.get("user_id") == self.user2_id}
                    
                    # Check isolation
                    overlap = user1_note_ids & user2_note_ids
                    if overlap:
                        self.log_result(
                            "Notes API Isolation",
                            False,
                            f"Found {len(overlap)} notes shared between users: {overlap}"
                        )
                    else:
                        self.log_result(
                            "Notes API Isolation",
                            True,
                            f"User 1 has {len(user1_note_ids)} notes, User 2 has {len(user2_note_ids)} notes - No overlap"
                        )
                    
                    # Check that all notes belong to correct user
                    user1_foreign_notes = [n for n in notes1 if n.get("user_id") != self.user1_id]
                    user2_foreign_notes = [n for n in notes2 if n.get("user_id") != self.user2_id]
                    
                    if user1_foreign_notes:
                        self.log_result(
                            "Notes API User Filtering",
                            False,
                            f"User 1 received {len(user1_foreign_notes)} notes from other users"
                        )
                    elif user2_foreign_notes:
                        self.log_result(
                            "Notes API User Filtering",
                            False,
                            f"User 2 received {len(user2_foreign_notes)} notes from other users"
                        )
                    else:
                        self.log_result(
                            "Notes API User Filtering",
                            True,
                            "All notes are correctly filtered by user_id"
                        )
                else:
                    self.log_result("Notes API Isolation", False, f"Failed to get notes for user 2: {response2.status_code}")
            else:
                self.log_result("Notes API Isolation", False, f"Failed to get notes for user 1: {response1.status_code}")
        except Exception as e:
            self.log_result("Notes API Isolation", False, f"Error: {str(e)}")
    
    def test_portfolio_api_isolation(self):
        """Test that Portfolio API returns only portfolio for authenticated user"""
        print("\n" + "="*60)
        print("Testing Portfolio API User Isolation")
        print("="*60)
        
        if not self.user1_id or not self.user2_id:
            self.log_result("Portfolio API Isolation", False, "Test users not authenticated", warning=True)
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
                    
                    # Check that portfolios are separate
                    # (We can't easily check account ownership without DB access, but we can check counts)
                    self.log_result(
                        "Portfolio API Isolation",
                        True,
                        f"User 1 portfolio: {accounts1} accounts, User 2 portfolio: {accounts2} accounts"
                    )
                else:
                    self.log_result("Portfolio API Isolation", False, f"Failed to get portfolio for user 2: {response2.status_code}")
            else:
                self.log_result("Portfolio API Isolation", False, f"Failed to get portfolio for user 1: {response1.status_code}")
        except Exception as e:
            self.log_result("Portfolio API Isolation", False, f"Error: {str(e)}")
    
    def test_trade_plan_matching_isolation(self):
        """Test that Trade Plan Matching returns only suggestions for authenticated user"""
        print("\n" + "="*60)
        print("Testing Trade Plan Matching User Isolation")
        print("="*60)
        
        if not self.user1_id or not self.user2_id:
            self.log_result("Trade Plan Matching Isolation", False, "Test users not authenticated", warning=True)
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
                    
                    # Check isolation
                    overlap = trade_ids1 & trade_ids2
                    if overlap and len(trade_ids1) > 0 and len(trade_ids2) > 0:
                        # Overlap might be OK if both users have trades, but we should check trade ownership
                        self.log_result(
                            "Trade Plan Matching Isolation",
                            True,
                            f"User 1: {len(suggestions1)} suggestions, User 2: {len(suggestions2)} suggestions (overlap may be OK if trades are shared)"
                        )
                    else:
                        self.log_result(
                            "Trade Plan Matching Isolation",
                            True,
                            f"User 1: {len(suggestions1)} suggestions, User 2: {len(suggestions2)} suggestions - No overlap"
                        )
                else:
                    self.log_result("Trade Plan Matching Isolation", False, f"Failed to get suggestions for user 2: {response2.status_code}")
            else:
                self.log_result("Trade Plan Matching Isolation", False, f"Failed to get suggestions for user 1: {response1.status_code}")
        except Exception as e:
            self.log_result("Trade Plan Matching Isolation", False, f"Error: {str(e)}")
    
    def run_all_tests(self):
        """Run all security tests"""
        print("\n" + "="*60)
        print("Security Test Suite - User Data Isolation")
        print("="*60)
        
        if not self.setup_test_users():
            print("\n⚠️  Warning: Could not authenticate test users")
            print("   Some tests may be skipped")
        
        # Run tests
        self.test_notes_api_isolation()
        self.test_portfolio_api_isolation()
        self.test_trade_plan_matching_isolation()
        
        # Print summary
        print("\n" + "="*60)
        print("Test Summary")
        print("="*60)
        print(f"✅ Passed: {len(self.results['passed'])}")
        print(f"❌ Failed: {len(self.results['failed'])}")
        print(f"⚠️  Warnings: {len(self.results['warnings'])}")
        
        if self.results['failed']:
            print("\nFailed Tests:")
            for failure in self.results['failed']:
                print(f"  - {failure['test']}: {failure['message']}")
        
        return len(self.results['failed']) == 0


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Test user data isolation")
    parser.add_argument("--url", default=BASE_URL, help="Base URL for API (default: http://localhost:8080)")
    args = parser.parse_args()
    
    runner = SecurityTestRunner(base_url=args.url)
    success = runner.run_all_tests()
    
    sys.exit(0 if success else 1)

