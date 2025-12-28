#!/usr/bin/env python3
"""
Debug Watch Lists API to check if SPY is in default list
"""

import requests
import json

def test_watch_lists_api():
    # Login first
    login_url = "http://localhost:8080/api/auth/login"
    login_data = {"username": "admin", "password": "admin123"}

    try:
        login_response = requests.post(login_url, json=login_data)
        print(f"Login response status: {login_response.status_code}")
        print(f"Login response: {login_response.text}")
        if login_response.status_code == 200:
            login_data = login_response.json()
            token = login_data.get('data', {}).get('access_token')
            print(f"Got token: {token[:20] if token else 'None'}...")

            # Get watch lists
            watch_lists_url = "http://localhost:8080/api/watch_lists"
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }

            response = requests.get(watch_lists_url, headers=headers)
            print(f"Watch lists response status: {response.status_code}")

            if response.status_code == 200:
                response_data = response.json()
                data = response_data.get('data', [])
                print(f"Number of watch lists: {len(data)}")
                print(f"Raw response data keys: {list(data[0].keys()) if data else 'No data'}")

                for i, watch_list in enumerate(data):
                    print(f"\nWatch List {i+1}:")
                    print(f"  ID: {watch_list.get('id')}")
                    print(f"  Name: {watch_list.get('name')}")
                    print(f"  User ID: {watch_list.get('user_id')}")
                    print(f"  Is Default: {watch_list.get('is_default', False)}")

                    items = watch_list.get('items', [])
                    print(f"  Items count: {len(items)}")

                    spy_found = False
                    for item in items:
                        symbol = item.get('ticker', {}).get('symbol', '') if item.get('ticker') else item.get('external_symbol', '')
                        if symbol == 'SPY':
                            spy_found = True
                            print(f"  ✅ SPY found: {item}")
                        else:
                            print(f"    Item: {symbol}")

                    if not spy_found:
                        print("  ❌ SPY NOT found in this list")
            else:
                print(f"Error getting watch lists: {response.text}")
        else:
            print(f"Login failed: {login_response.text}")

    except Exception as e:
        print(f"Error: {e}")

def check_spy_ticker():
    """Check if SPY exists in tickers table"""
    # This will be done via the API if available, or we can check directly
    import requests
    import json

    # Check if there's a tickers API endpoint
    try:
        response = requests.get("http://localhost:8080/api/tickers?symbol=SPY", headers=headers)
        if response.status_code == 200:
            data = response.json()
            print(f"SPY ticker API response: {len(data.get('data', []))} results")
            if data.get('data'):
                print(f"SPY ticker: {data['data'][0]}")
    except Exception as e:
        print(f"Could not check SPY ticker via API: {e}")

if __name__ == "__main__":
    test_watch_lists_api()
    check_spy_ticker()
