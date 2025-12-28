#!/usr/bin/env python3
"""
Debug Tags Categories API
"""

import requests
import json

def test_tags_categories_api():
    # Login first
    login_url = "http://localhost:8080/api/auth/login"
    login_data = {"username": "admin", "password": "admin123"}

    try:
        login_response = requests.post(login_url, json=login_data)
        print(f"Login response status: {login_response.status_code}")
        if login_response.status_code == 200:
            login_data_resp = login_response.json()
            token = login_data_resp.get('data', {}).get('access_token')
            print(f"Got token: {token[:20] if token else 'None'}...")

            # Test POST /api/tags/categories
            tags_url = "http://localhost:8080/api/tags/categories"
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }

            # Test POST with valid data
            test_data = {
                "name": "Test Category",
                "color_hex": "#ff0000"
            }

            response = requests.post(tags_url, headers=headers, json=test_data)
            print(f"Tags categories POST response status: {response.status_code}")

            if response.status_code == 200:
                print("✅ POST successful")
                data = response.json()
                print(f"Response: {data}")
            else:
                print(f"❌ POST failed: {response.text}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_tags_categories_api()
