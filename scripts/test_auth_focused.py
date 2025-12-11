#!/usr/bin/env python3
"""
Focused test for authentication - ensures NO auth warnings/errors on all pages
Tests only the core pages mentioned in user requirements
"""

import requests
import json
import time
import sys
from typing import List, Dict

BASE_URL = "http://localhost:8080"

# Core pages that MUST have clean auth behavior
CORE_PAGES = [
    "/",
    "/trades.html",
    "/executions.html",
    "/alerts.html",
    "/trade-plans.html",
    "/cash-flows.html",
    "/tickers.html",
    "/trading-accounts.html",
    "/notes.html",
    "/watch-list.html",
    "/preferences.html",
    "/research.html"
]

def get_auth_token() -> str:
    """Get admin token for testing"""
    try:
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"username": "admin", "password": "admin123"},
            timeout=10
        )
        response.raise_for_status()
        data = response.json()
        return data.get("data", {}).get("access_token", "")
    except Exception as e:
        print(f"❌ Failed to get auth token: {e}")
        return ""

def test_page_auth_clean(token: str, page: str) -> Dict:
    """Test page for auth-related issues"""
    result = {
        "page": page,
        "auth_warnings": 0,
        "auth_errors": 0,
        "login_modal_shown": False,
        "api_401_count": 0,
        "details": []
    }

    try:
        # Test direct page load (should trigger auth-guard)
        response = requests.get(f"{BASE_URL}{page}", timeout=15)
        html_content = response.text

        # Check for auth-related issues in HTML
        if "loginModal" in html_content or "כניסה למערכת" in html_content:
            result["login_modal_shown"] = True
            result["details"].append("Login modal visible on page load")

        # Test API calls that should work with auth
        api_tests = [
            "/api/auth/me",
            "/api/tickers/my",
            "/api/trades/",
            "/api/preferences/user"
        ]

        for api in api_tests:
            try:
                headers = {"Authorization": f"Bearer {token}"}
                api_response = requests.get(f"{BASE_URL}{api}", headers=headers, timeout=10)

                if api_response.status_code == 401:
                    result["api_401_count"] += 1
                    result["details"].append(f"401 on {api}")

            except Exception as e:
                result["details"].append(f"API error on {api}: {str(e)[:50]}")

    except Exception as e:
        result["details"].append(f"Page load error: {str(e)[:50]}")

    return result

def main():
    print("🔐 Focused Auth Testing - Core Pages")
    print("=" * 50)

    # Get auth token
    token = get_auth_token()
    if not token:
        print("❌ Cannot proceed without auth token")
        return 1

    print("✅ Got auth token, testing pages...")

    results = []
    total_warnings = 0
    total_errors = 0
    pages_with_issues = 0

    for page in CORE_PAGES:
        print(f"Testing {page}...")
        result = test_page_auth_clean(token, page)
        results.append(result)

        if result["login_modal_shown"] or result["api_401_count"] > 0 or result["details"]:
            pages_with_issues += 1

        total_warnings += result["auth_warnings"]
        total_errors += result["api_401_count"]

    # Summary
    print("\n" + "=" * 50)
    print("📊 AUTH TESTING RESULTS")
    print("=" * 50)

    print(f"Pages tested: {len(CORE_PAGES)}")
    print(f"Pages with auth issues: {pages_with_issues}")
    print(f"Total API 401 errors: {total_errors}")

    if pages_with_issues == 0:
        print("✅ SUCCESS: All pages have clean auth behavior!")
        print("✅ No login modals on authenticated pages!")
        print("✅ No 401 errors on protected APIs!")
        return 0
    else:
        print("❌ FAILURE: Auth issues detected!")
        print("\nDetailed issues:")

        for result in results:
            if result["login_modal_shown"] or result["api_401_count"] > 0 or result["details"]:
                print(f"\n❌ {result['page']}:")
                if result["login_modal_shown"]:
                    print("  - Login modal shown")
                if result["api_401_count"] > 0:
                    print(f"  - {result['api_401_count']} API 401 errors")
                for detail in result["details"]:
                    print(f"  - {detail}")

        return 1

if __name__ == "__main__":
    sys.exit(main())
