#!/usr/bin/env python3
"""
Stage 2 QA Test Script - Executions + Trading Accounts
Tests CRUD operations for executions and trading_accounts entities
"""

import requests
import json
import time
from datetime import datetime

BASE_URL = "http://localhost:8080"

def login():
    """Login as admin and get session"""
    session = requests.Session()
    login_data = {
        "username": "admin",
        "password": "admin123"
    }
    response = session.post(f"{BASE_URL}/api/auth/login", json=login_data)
    if response.status_code != 200:
        raise Exception(f"Login failed: {response.status_code}")

    # Store token in session headers for subsequent requests
    response_data = response.json()
    if 'data' in response_data and 'access_token' in response_data['data']:
        session.headers.update({'Authorization': f'Bearer {response_data["data"]["access_token"]}'})
    elif 'access_token' in response_data:
        session.headers.update({'Authorization': f'Bearer {response_data["access_token"]}'})

    return session

def test_entity_crud(session, entity_name, test_data):
    """Test CRUD operations for an entity"""
    print(f"\n🧪 Testing {entity_name} CRUD operations:")

    # CREATE
    print("  📝 CREATE operation...")
    create_response = session.post(f"{BASE_URL}/api/{entity_name}/", json=test_data)
    print(f"    Status: {create_response.status_code}")
    if create_response.status_code not in [200, 201]:
        print(f"    ❌ CREATE failed: {create_response.text}")
        return False

    created_data = create_response.json()
    record_id = created_data.get('data', {}).get('id') or created_data.get('id')
    if not record_id:
        print("    ❌ No ID returned from CREATE")
        return False
    print(f"    ✅ Created record ID: {record_id}")

    # READ
    print("  📖 READ operation...")
    read_response = session.get(f"{BASE_URL}/api/{entity_name}/{record_id}")
    print(f"    Status: {read_response.status_code}")
    if read_response.status_code != 200:
        print(f"    ❌ READ failed: {read_response.text}")
        return False
    print("    ✅ READ successful")

    # UPDATE
    print("  ✏️  UPDATE operation...")
    update_data = test_data.copy()
    update_data['id'] = record_id
    if 'notes' in update_data:
        update_data['notes'] = f"Updated notes - {datetime.now().isoformat()}"

    update_response = session.put(f"{BASE_URL}/api/{entity_name}/{record_id}", json=update_data)
    print(f"    Status: {update_response.status_code}")
    if update_response.status_code not in [200, 204]:
        print(f"    ❌ UPDATE failed: {update_response.text}")
        return False
    print("    ✅ UPDATE successful")

    # DELETE
    print("  🗑️  DELETE operation...")
    delete_response = session.delete(f"{BASE_URL}/api/{entity_name}/{record_id}")
    print(f"    Status: {delete_response.status_code}")
    if delete_response.status_code not in [200, 204]:
        print(f"    ❌ DELETE failed: {delete_response.text}")
        return False
    print("    ✅ DELETE successful")

    return True

def main():
    print("🚀 Stage 2 QA Test - Executions + Trading Accounts")
    print(f"Base URL: {BASE_URL}")
    print(f"Timestamp: {datetime.now().isoformat()}")

    try:
        # Login
        session = login()
        print("✅ Login successful")

        results = {}

        # Test Trading Accounts
        trading_account_data = {
            "name": f"Test Account QA {int(time.time())}",
            "currency_id": 1,  # USD
            "status": "open",
            "opening_balance": 10000.0,
            "notes": "QA Test Record - Safe to delete"
        }

        results['trading_accounts'] = test_entity_crud(session, 'trading-accounts', trading_account_data)

        # Test Executions - need valid ticker and trading account
        # First get/create required dependencies
        tickers_response = session.get(f"{BASE_URL}/api/tickers/")
        if tickers_response.status_code == 200:
            tickers = tickers_response.json().get('data', [])
            if tickers:
                ticker_id = tickers[0]['id']
                print(f"  📊 Using existing ticker ID: {ticker_id}")

                # Get trading accounts
                accounts_response = session.get(f"{BASE_URL}/api/trading-accounts/")
                if accounts_response.status_code == 200:
                    accounts = accounts_response.json().get('data', [])
                    if accounts:
                        account_id = accounts[0]['id']
                        print(f"  📊 Using existing trading account ID: {account_id}")

                        execution_data = {
                            "ticker_id": ticker_id,
                            "trading_account_id": account_id,
                            "action": "buy",
                            "quantity": 100,
                            "price": 50.0,
                            "date": datetime.now().isoformat(),
                            "fee": 5.0,
                            "source": "manual",
                            "notes": "QA Test Record - Safe to delete"
                        }

                        results['executions'] = test_entity_crud(session, 'executions', execution_data)
                    else:
                        print("❌ No trading accounts found for executions test")
                        results['executions'] = False
                else:
                    print(f"❌ Failed to get trading accounts: {accounts_response.status_code}")
                    results['executions'] = False
            else:
                print("❌ No tickers found for executions test")
                results['executions'] = False
        else:
            print(f"❌ Failed to get tickers: {tickers_response.status_code}")
            results['executions'] = False

        # Summary
        print("\n📊 Test Results Summary:")
        print(f"  Trading Accounts: {'✅ PASS' if results.get('trading_accounts') else '❌ FAIL'}")
        print(f"  Executions: {'✅ PASS' if results.get('executions') else '❌ FAIL'}")

        total_passed = sum(1 for result in results.values() if result)
        total_tests = len(results)

        print(f"\n🎯 Overall: {total_passed}/{total_tests} entities passed CRUD tests")

        if total_passed == total_tests:
            print("🎉 Stage 2 QA: ALL TESTS PASSED! ✅")
            return True
        else:
            print("⚠️  Stage 2 QA: Some tests failed")
            return False

    except Exception as e:
        print(f"❌ Test execution failed: {e}")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
