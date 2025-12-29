#!/usr/bin/env python3
"""
Test CRUD Dashboard for Trades
===============================

Simulates the CRUD dashboard test for trades to verify the fix.
"""

import requests
import json
import time

def login():
    """Login and return token"""
    response = requests.post('http://localhost:8080/api/auth/login', json={
        'username': 'admin',
        'password': 'admin123'
    })
    if response.status_code == 200:
        data = response.json()
        return data['data']['access_token']
    else:
        raise Exception(f"Login failed: {response.text}")

def test_trades_crud():
    """Test CREATE/READ/UPDATE/DELETE for trades"""

    # Login
    token = login()
    headers = {'Authorization': f'Bearer {token}'}

    print("🔐 Logged in successfully")
    print(f"🔑 Token: {token[:50]}...")

    # === CREATE TEST ===
    print("\n📝 Testing CREATE...")

    create_data = {
        "ticker_id": 1,
        "trading_account_id": 1,
        "side": "Long",
        "investment_type": "swing",
        "planned_quantity": 100,
        "entry_price": 100.0,
        "notes": "CRUD Dashboard Test Trade"
    }

    create_response = requests.post('http://localhost:8080/api/trades/', json=create_data, headers=headers)

    if create_response.status_code in [200, 201]:
        create_result = create_response.json()
        print("✅ CREATE: Success")
        print(f"📊 Response: {json.dumps(create_result, indent=2)}")

        if create_result.get('status') == 'success' and create_result.get('data', {}).get('id'):
            trade_id = create_result['data']['id']
            print(f"🆔 Created trade ID: {trade_id}")
        else:
            print("❌ CREATE: API success but no entityId in response")
            return False
    else:
        print(f"❌ CREATE: HTTP {create_response.status_code}")
        print(f"❌ Response: {create_response.text}")
        return False

    # === READ TEST ===
    print(f"\n📖 Testing READ for trade {trade_id}...")

    read_response = requests.get(f'http://localhost:8080/api/trades/{trade_id}', headers=headers)

    if read_response.status_code == 200:
        read_result = read_response.json()
        print("✅ READ: Success")
        print(f"📊 Trade data: {json.dumps(read_result.get('data', {}), indent=2)}")
    else:
        print(f"❌ READ: HTTP {read_response.status_code}")
        print(f"❌ Response: {read_response.text}")
        return False

    # === UPDATE TEST ===
    print(f"\n✏️ Testing UPDATE for trade {trade_id}...")

    update_data = {
        "notes": "CRUD Dashboard Test Trade - UPDATED"
    }

    update_response = requests.put(f'http://localhost:8080/api/trades/{trade_id}', json=update_data, headers=headers)

    if update_response.status_code == 200:
        update_result = update_response.json()
        print("✅ UPDATE: Success")
        print(f"📊 Response: {json.dumps(update_result, indent=2)}")
    else:
        print(f"❌ UPDATE: HTTP {update_response.status_code}")
        print(f"❌ Response: {update_response.text}")
        return False

    # === DELETE TEST ===
    print(f"\n🗑️ Testing DELETE for trade {trade_id}...")

    delete_response = requests.delete(f'http://localhost:8080/api/trades/{trade_id}', headers=headers)

    if delete_response.status_code == 200:
        delete_result = delete_response.json()
        print("✅ DELETE: Success")
        print(f"📊 Response: {json.dumps(delete_result, indent=2)}")
    else:
        print(f"❌ DELETE: HTTP {delete_response.status_code}")
        print(f"❌ Response: {delete_response.text}")
        return False

    print("\n🎉 ALL CRUD TESTS PASSED!")
    return True

if __name__ == '__main__':
    try:
        success = test_trades_crud()
        exit(0 if success else 1)
    except Exception as e:
        print(f"❌ Test failed with exception: {e}")
        exit(1)
