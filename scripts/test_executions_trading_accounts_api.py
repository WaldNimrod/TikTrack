#!/usr/bin/env python3
"""
Script to test executions + trading_accounts CRUD operations via API
Uses requests library with authentication to perform full CRUD tests
Captures results for both entities
"""

import json
import time
import requests
from datetime import datetime
from pathlib import Path

# Configuration
BASE_URL = "http://localhost:8080"
AUTH_DATA = {"username": "admin", "password": "admin123"}

# Test data for executions
EXECUTION_TEST_DATA = {
    "ticker_id": 1,  # SPY
    "trading_account_id": 247,  # Admin Trading Account
    "action": "buy",
    "quantity": 100.0,
    "price": 100.0,
    "date": "2026-01-01",
    "source": "manual",
    "notes": "API Test Execution"
}

# Test data for trading_accounts
TRADING_ACCOUNT_TEST_DATA = {
    "name": "API Test Account",
    "currency_id": 1,  # USD
    "status": "active",
    "opening_balance": 10000.0,
    "notes": "API Test Trading Account"
}

def get_auth_token():
    """Get authentication token"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json=AUTH_DATA)
    response.raise_for_status()
    data = response.json()
    return data['data']['access_token']

def make_authenticated_request(method, url, token, json_data=None):
    """Make authenticated API request"""
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    if method.upper() == 'GET':
        response = requests.get(url, headers=headers)
    elif method.upper() == 'POST':
        response = requests.post(url, headers=headers, json=json_data)
    elif method.upper() == 'PUT':
        response = requests.put(url, headers=headers, json=json_data)
    elif method.upper() == 'DELETE':
        response = requests.delete(url, headers=headers)
    else:
        raise ValueError(f"Unsupported method: {method}")

    return response

def test_entity_crud(entity_name, test_data, token):
    """Test full CRUD operations for an entity"""
    print(f"\n🧪 Testing {entity_name} CRUD operations...")

    results = {
        'entity': entity_name,
        'timestamp': datetime.now().isoformat(),
        'operations': {}
    }

    base_url = f"{BASE_URL}/api/{entity_name}"

    # CREATE
    print(f"📝 CREATE {entity_name}...")
    try:
        response = make_authenticated_request('POST', base_url, token, test_data)
        results['operations']['create'] = {
            'status_code': response.status_code,
            'success': response.status_code == 201,
            'response': response.json() if response.status_code in [200, 201, 400] else None,
            'error': str(response.text) if response.status_code >= 400 else None
        }
        print(f"   Status: {response.status_code} {'✅' if response.status_code == 201 else '❌'}")

        if response.status_code == 201:
            created_id = response.json()['data']['id']
        else:
            print(f"   ❌ CREATE failed: {response.text}")
            return results

    except Exception as e:
        results['operations']['create'] = {
            'status_code': None,
            'success': False,
            'error': str(e)
        }
        print(f"   ❌ CREATE error: {str(e)}")
        return results

    # READ
    print(f"📖 READ {entity_name} (ID: {created_id})...")
    try:
        response = make_authenticated_request('GET', f"{base_url}/{created_id}", token)
        results['operations']['read'] = {
            'status_code': response.status_code,
            'success': response.status_code == 200,
            'response': response.json() if response.status_code == 200 else None,
            'error': str(response.text) if response.status_code >= 400 else None
        }
        print(f"   Status: {response.status_code} {'✅' if response.status_code == 200 else '❌'}")

    except Exception as e:
        results['operations']['read'] = {
            'status_code': None,
            'success': False,
            'error': str(e)
        }
        print(f"   ❌ READ error: {str(e)}")

    # UPDATE
    print(f"✏️  UPDATE {entity_name} (ID: {created_id})...")
    update_data = test_data.copy()
    if entity_name == 'executions':
        update_data['quantity'] = 200.0
        update_data['notes'] = "Updated API Test Execution"
    else:  # trading_accounts
        update_data['opening_balance'] = 20000.0
        update_data['notes'] = "Updated API Test Trading Account"

    try:
        response = make_authenticated_request('PUT', f"{base_url}/{created_id}", token, update_data)
        results['operations']['update'] = {
            'status_code': response.status_code,
            'success': response.status_code == 200,
            'response': response.json() if response.status_code == 200 else None,
            'error': str(response.text) if response.status_code >= 400 else None
        }
        print(f"   Status: {response.status_code} {'✅' if response.status_code == 200 else '❌'}")

    except Exception as e:
        results['operations']['update'] = {
            'status_code': None,
            'success': False,
            'error': str(e)
        }
        print(f"   ❌ UPDATE error: {str(e)}")

    # DELETE
    print(f"🗑️  DELETE {entity_name} (ID: {created_id})...")
    try:
        response = make_authenticated_request('DELETE', f"{base_url}/{created_id}", token)
        results['operations']['delete'] = {
            'status_code': response.status_code,
            'success': response.status_code == 200,
            'response': response.json() if response.status_code == 200 else None,
            'error': str(response.text) if response.status_code >= 400 else None
        }
        print(f"   Status: {response.status_code} {'✅' if response.status_code == 200 else '❌'}")

    except Exception as e:
        results['operations']['delete'] = {
            'status_code': None,
            'success': False,
            'error': str(e)
        }
        print(f"   ❌ DELETE error: {str(e)}")

    return results

def update_focused_api_results(results):
    """Update focused_api_results.json with test results"""
    results_file = Path("focused_api_results.json")

    if results_file.exists():
        try:
            with open(results_file, 'r', encoding='utf-8') as f:
                existing_results = json.load(f)
        except:
            existing_results = {}
    else:
        existing_results = {}

    # Update with new results
    existing_results['last_updated'] = datetime.now().isoformat()
    existing_results['stage_2_batch_1_final_api_test'] = results

    with open(results_file, 'w', encoding='utf-8') as f:
        json.dump(existing_results, f, indent=2, ensure_ascii=False)

    print(f"✅ Updated {results_file} with API test results")

def main():
    """Main execution function"""
    print("🎯 TikTrack Stage 2 Batch 1 Final API Test")
    print("Testing: executions + trading_accounts")
    print("Authentication: admin/admin123")
    print(f"Base URL: {BASE_URL}")
    print(f"Timestamp: {datetime.now().isoformat()}")
    print("=" * 60)

    # Get authentication token
    print("🔐 Getting authentication token...")
    try:
        token = get_auth_token()
        print("✅ Authentication successful")
    except Exception as e:
        print(f"❌ Authentication failed: {str(e)}")
        return

    all_results = {
        'test_timestamp': datetime.now().isoformat(),
        'test_type': 'stage_2_batch_1_final_api_test',
        'authentication': {'username': AUTH_DATA['username'], 'method': 'Bearer Token'},
        'entities': ['execution', 'trading_account'],
        'results': {}
    }

    # Test executions
    executions_results = test_entity_crud('executions', EXECUTION_TEST_DATA, token)
    all_results['results']['executions'] = executions_results

    # Test trading_accounts
    trading_accounts_results = test_entity_crud('trading_accounts', TRADING_ACCOUNT_TEST_DATA, token)
    all_results['results']['trading_accounts'] = trading_accounts_results

    # Update focused_api_results.json
    update_focused_api_results(all_results)

    # Final summary
    print(f"\n{'='*60}")
    print("🎯 FINAL API TEST SUMMARY - Stage 2 Batch 1")
    print(f"{'='*60}")

    executions_pass = all(
        op['success'] for op in executions_results['operations'].values()
    ) if executions_results['operations'] else False

    trading_accounts_pass = all(
        op['success'] for op in trading_accounts_results['operations'].values()
    ) if trading_accounts_results['operations'] else False

    print("Executions CRUD Results:")
    for op_name, op_result in executions_results['operations'].items():
        status = '✅ PASS' if op_result.get('success', False) else '❌ FAIL'
        code = op_result.get('status_code', 'N/A')
        print(f"  {op_name.upper()}: {status} (Status: {code})")

    print("\nTrading Accounts CRUD Results:")
    for op_name, op_result in trading_accounts_results['operations'].items():
        status = '✅ PASS' if op_result.get('success', False) else '❌ FAIL'
        code = op_result.get('status_code', 'N/A')
        print(f"  {op_name.upper()}: {status} (Status: {code})")

    # Overall result
    overall_success = executions_pass and trading_accounts_pass
    print(f"\n🎯 OVERALL RESULT: {'✅ ALL CRUD OPERATIONS PASSED' if overall_success else '❌ SOME CRUD OPERATIONS FAILED'}")

    if overall_success:
        print("✅ Stage 2 Batch 1 API tests completed successfully")
        print("📋 Evidence captured in focused_api_results.json")
        print("🎯 Ready to mark Batch 1 GREEN")
    else:
        print("❌ Issues found in CRUD operations")
        print("🔧 Check focused_api_results.json for details")

if __name__ == "__main__":
    main()
