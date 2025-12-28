#!/usr/bin/env python3
"""
Test script for user data isolation - ensures each user can only access their own data
Based on the critical security report USER_DATA_ISOLATION_SECURITY_REPORT.md
"""

import requests
import json
import sys
from typing import Dict, List, Tuple

# Configuration
BASE_URL = "http://localhost:8080"
TEST_USERS = {
    "nimrod": {"username": "nimrod", "password": "nimw", "expected_empty": True},
    "admin": {"username": "admin", "password": "admin123", "expected_empty": False},
    "user": {"username": "user", "password": "user123", "expected_empty": False}
}

# Endpoints to test
ENDPOINTS_TO_TEST = [
    "/api/trades/",
    "/api/trade-plans/",
    "/api/trading-accounts/",
    "/api/alerts/",
    "/api/notes/",
    "/api/cash-flows/",
    "/api/watch_lists/"
]

def login_and_get_token(username: str, password: str) -> str:
    """Login and return access token"""
    try:
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"username": username, "password": password},
            timeout=10
        )
        response.raise_for_status()
        data = response.json()
        return data.get("data", {}).get("access_token", "")
    except Exception as e:
        print(f"❌ Login failed for {username}: {e}")
        return ""

def test_endpoint_isolation(endpoint: str, token: str, username: str) -> Tuple[int, bool]:
    """Test if endpoint properly isolates data by user"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}{endpoint}", headers=headers, timeout=10)

        if response.status_code == 401:
            print(f"⚠️  {username}@{endpoint}: 401 Unauthorized (authentication issue)")
            return 0, False
        elif response.status_code != 200:
            print(f"❌ {username}@{endpoint}: HTTP {response.status_code}")
            return 0, False

        data = response.json()
        items = data.get("data", []) if isinstance(data, dict) else data if isinstance(data, list) else []

        # Special handling for endpoints that return different structures
        if endpoint == "/api/notes/":
            # Notes endpoint has nested structure
            items = data.get("notes", []) if isinstance(data, dict) else []

        count = len(items)
        print(f"✅ {username}@{endpoint}: {count} items")

        return count, True

    except Exception as e:
        print(f"❌ {username}@{endpoint}: Error - {e}")
        return 0, False

def main():
    print("🔒 Testing User Data Isolation")
    print("=" * 50)

    # Test each user
    user_results = {}

    for username, user_config in TEST_USERS.items():
        print(f"\n👤 Testing user: {username}")
        print("-" * 30)

        token = login_and_get_token(user_config["username"], user_config["password"])
        if not token:
            print(f"⚠️  Skipping {username} - login failed")
            continue

        endpoint_results = {}
        for endpoint in ENDPOINTS_TO_TEST:
            count, success = test_endpoint_isolation(endpoint, token, username)
            if success:
                endpoint_results[endpoint] = count

        user_results[username] = endpoint_results

    # Analyze results
    print("\n" + "=" * 50)
    print("📊 ANALYSIS")
    print("=" * 50)

    # Check if users see different data
    isolation_broken = False

    for endpoint in ENDPOINTS_TO_TEST:
        counts = {}
        for username, results in user_results.items():
            if endpoint in results:
                counts[username] = results[endpoint]

        if len(counts) >= 2:  # Need at least 2 users to compare
            unique_counts = set(counts.values())
            if len(unique_counts) == 1 and list(unique_counts)[0] > 0:
                # All users see the same non-zero number of items
                print(f"🚨 CRITICAL: {endpoint} - All users see same data ({list(unique_counts)[0]} items)")
                isolation_broken = True
            else:
                print(f"✅ {endpoint} - Data properly isolated")

    # Summary
    print("\n" + "=" * 50)
    if isolation_broken:
        print("🚨 FAILURE: User data isolation is BROKEN!")
        print("Users can see each other's data - SECURITY BREACH!")
        return 1
    else:
        print("✅ SUCCESS: User data isolation is working correctly")
        return 0

if __name__ == "__main__":
    sys.exit(main())
