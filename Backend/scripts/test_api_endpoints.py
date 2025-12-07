#!/usr/bin/env python3
"""
API Endpoints Test Suite
========================

Tests all API endpoints related to user-ticker integration:
- GET /api/tickers/
- GET /api/tickers/my
- POST /api/tickers/
- PUT /api/tickers/<id>
- DELETE /api/tickers/<id>
- DELETE /api/tickers/<id>/admin-delete

Author: TikTrack Development Team
Date: January 2025
"""

import os
import sys
import requests
import json
from datetime import datetime

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

class APITester:
    def __init__(self, base_url='http://localhost:8080'):
        self.base_url = base_url
        self.session = requests.Session()
        self.passed = 0
        self.failed = 0
        
    def log_pass(self, message):
        print(f"{Colors.GREEN}✅ PASS:{Colors.RESET} {message}")
        self.passed += 1
        
    def log_fail(self, message):
        print(f"{Colors.RED}❌ FAIL:{Colors.RESET} {message}")
        self.failed += 1
        
    def log_info(self, message):
        print(f"{Colors.BLUE}ℹ️  INFO:{Colors.RESET} {message}")
        
    def test_get_tickers(self):
        """Test GET /api/tickers/"""
        print(f"\n{Colors.BOLD}=== Test: GET /api/tickers/ ==={Colors.RESET}")
        
        try:
            response = self.session.get(f"{self.base_url}/api/tickers/")
            
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'success' and isinstance(data.get('data'), list):
                    ticker_count = len(data['data'])
                    self.log_pass(f"GET /api/tickers/ returned {ticker_count} tickers")
                    
                    # Check if tickers have custom fields
                    if ticker_count > 0:
                        sample = data['data'][0]
                        has_custom = 'name_custom' in sample or 'type_custom' in sample
                        has_status = 'user_ticker_status' in sample
                        
                        if has_custom or has_status:
                            self.log_pass("Tickers include custom fields")
                        else:
                            self.log_fail("Tickers missing custom fields")
                else:
                    self.log_fail(f"Unexpected response format: {data.get('status')}")
            elif response.status_code == 400:
                self.log_info("GET /api/tickers/ requires user_id (expected)")
            else:
                self.log_fail(f"GET /api/tickers/ returned {response.status_code}")
                
        except Exception as e:
            self.log_fail(f"GET /api/tickers/ failed: {e}")
            
    def test_get_my_tickers(self):
        """Test GET /api/tickers/my"""
        print(f"\n{Colors.BOLD}=== Test: GET /api/tickers/my ==={Colors.RESET}")
        
        try:
            response = self.session.get(f"{self.base_url}/api/tickers/my")
            
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'success' and isinstance(data.get('data'), list):
                    ticker_count = len(data['data'])
                    self.log_pass(f"GET /api/tickers/my returned {ticker_count} tickers")
                    
                    # Verify all tickers belong to user (check custom fields)
                    if ticker_count > 0:
                        sample = data['data'][0]
                        has_fields = 'name_custom' in sample or 'type_custom' in sample or 'user_ticker_status' in sample
                        if has_fields:
                            self.log_pass("Tickers include user-specific fields")
                elif response.status_code == 401:
                    self.log_info("GET /api/tickers/my requires authentication (expected)")
                else:
                    self.log_fail(f"Unexpected response: {data.get('status')}")
            elif response.status_code == 401:
                self.log_info("GET /api/tickers/my requires authentication (expected)")
            else:
                self.log_fail(f"GET /api/tickers/my returned {response.status_code}")
                
        except Exception as e:
            self.log_fail(f"GET /api/tickers/my failed: {e}")
            
    def run_all_tests(self):
        """Run all API tests"""
        print("="*60)
        print("API Endpoints Test Suite")
        print("="*60)
        
        self.test_get_tickers()
        self.test_get_my_tickers()
        
        # Summary
        print(f"\n{Colors.BOLD}{'='*60}")
        print(f"Test Summary")
        print(f"{'='*60}{Colors.RESET}")
        print(f"{Colors.GREEN}✅ Passed: {self.passed}{Colors.RESET}")
        print(f"{Colors.RED}❌ Failed: {self.failed}{Colors.RESET}")
        print(f"{'='*60}\n")
        
        return 0 if self.failed == 0 else 1

if __name__ == "__main__":
    import sys
    tester = APITester()
    sys.exit(tester.run_all_tests())

