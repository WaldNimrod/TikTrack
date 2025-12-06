#!/usr/bin/env python3
"""
Watch Lists API Testing Script
==============================

Comprehensive testing of Watch Lists API endpoints:
- GET /api/watch-lists - Get all lists
- POST /api/watch-lists - Create list
- GET /api/watch-lists/<id> - Get single list
- PUT /api/watch-lists/<id> - Update list
- DELETE /api/watch-lists/<id> - Delete list
- GET /api/watch-lists/<id>/items - Get items
- POST /api/watch-lists/<id>/items - Add ticker
- PUT /api/watch-lists/items/<item_id> - Update item
- DELETE /api/watch-lists/items/<item_id> - Remove item
- POST /api/watch-lists/<id>/items/reorder - Reorder items

Author: TikTrack Development Team
Date: January 2025
"""

import os
import sys
import json
import requests
import time
from pathlib import Path

# Add Backend directory to path
backend_path = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_path))

# Set up environment variables if not set
if not os.getenv('POSTGRES_HOST'):
    os.environ['POSTGRES_HOST'] = 'localhost'
    os.environ['POSTGRES_DB'] = 'TikTrack-db-development'
    os.environ['POSTGRES_USER'] = 'TikTrakDBAdmin'
    os.environ['POSTGRES_PASSWORD'] = 'BigMeZoo1974!?'

BASE_URL = 'http://127.0.0.1:8080'
API_BASE = f'{BASE_URL}/api/watch-lists'

# Test results
test_results = {
    'passed': [],
    'failed': [],
    'errors': []
}

def print_test(name, status, message=''):
    """Print test result"""
    status_symbol = '✅' if status else '❌'
    print(f"{status_symbol} {name}")
    if message:
        print(f"   {message}")
    
    if status:
        test_results['passed'].append(name)
    else:
        test_results['failed'].append(name)
        if message:
            test_results['errors'].append(f"{name}: {message}")

def test_get_all_lists():
    """Test GET /api/watch-lists"""
    print("\n📋 Testing GET /api/watch-lists...")
    try:
        response = requests.get(API_BASE)
        if response.status_code == 200:
            data = response.json()
            print_test("GET all lists", True, f"Retrieved {len(data.get('data', []))} lists")
            return data.get('data', [])
        else:
            print_test("GET all lists", False, f"Status: {response.status_code}")
            return []
    except Exception as e:
        print_test("GET all lists", False, str(e))
        return []

def test_create_list():
    """Test POST /api/watch-lists"""
    print("\n📋 Testing POST /api/watch-lists...")
    try:
        payload = {
            "name": f"Test Tech Stocks {int(time.time())}",
            "icon": "chart-line",
            "color_hex": "#26baac",
            "view_mode": "table",
            "default_sort_column": "symbol",
            "default_sort_direction": "asc"
        }
        response = requests.post(API_BASE, json=payload)
        if response.status_code == 201:
            data = response.json()
            list_data = data.get('data', {})
            list_id = list_data.get('id')
            print_test("CREATE list", True, f"Created list ID: {list_id}")
            return list_id
        else:
            error_data = response.json() if response.content else {}
            print_test("CREATE list", False, f"Status: {response.status_code}, Error: {error_data.get('error', {}).get('message', 'Unknown')}")
            return None
    except Exception as e:
        print_test("CREATE list", False, str(e))
        return None

def test_get_single_list(list_id):
    """Test GET /api/watch-lists/<id>"""
    print(f"\n📋 Testing GET /api/watch-lists/{list_id}...")
    try:
        response = requests.get(f"{API_BASE}/{list_id}")
        if response.status_code == 200:
            data = response.json()
            list_data = data.get('data', {})
            print_test("GET single list", True, f"List name: {list_data.get('name')}")
            return list_data
        else:
            print_test("GET single list", False, f"Status: {response.status_code}")
            return None
    except Exception as e:
        print_test("GET single list", False, str(e))
        return None

def test_update_list(list_id):
    """Test PUT /api/watch-lists/<id>"""
    print(f"\n📋 Testing PUT /api/watch-lists/{list_id}...")
    try:
        payload = {
            "name": "Updated Tech Stocks",
            "view_mode": "cards",
            "color_hex": "#fc5a06"
        }
        response = requests.put(f"{API_BASE}/{list_id}", json=payload)
        if response.status_code == 200:
            data = response.json()
            list_data = data.get('data', {})
            print_test("UPDATE list", True, f"Updated name: {list_data.get('name')}")
            return True
        else:
            error_data = response.json() if response.content else {}
            print_test("UPDATE list", False, f"Status: {response.status_code}, Error: {error_data.get('error', {}).get('message', 'Unknown')}")
            return False
    except Exception as e:
        print_test("UPDATE list", False, str(e))
        return False

def test_get_items(list_id):
    """Test GET /api/watch-lists/<id>/items"""
    print(f"\n📋 Testing GET /api/watch-lists/{list_id}/items...")
    try:
        response = requests.get(f"{API_BASE}/{list_id}/items")
        if response.status_code == 200:
            data = response.json()
            items = data.get('data', [])
            print_test("GET items", True, f"Retrieved {len(items)} items")
            return items
        else:
            print_test("GET items", False, f"Status: {response.status_code}")
            return []
    except Exception as e:
        print_test("GET items", False, str(e))
        return []

def test_add_ticker_to_list(list_id, use_external=False):
    """Test POST /api/watch-lists/<id>/items"""
    print(f"\n📋 Testing POST /api/watch-lists/{list_id}/items...")
    try:
        if use_external:
            payload = {
                "external_symbol": "AAPL",
                "external_name": "Apple Inc.",
                "flag_color": "#26baac",
                "notes": "Test external ticker"
            }
        else:
            # Try to get a ticker ID first
            tickers_response = requests.get(f"{BASE_URL}/api/tickers/my")
            ticker_id = None
            if tickers_response.status_code == 200:
                tickers_data = tickers_response.json()
                tickers = tickers_data.get('data', [])
                if tickers:
                    ticker_id = tickers[0].get('id')
            
            if not ticker_id:
                # Fallback to external
                payload = {
                    "external_symbol": "TSLA",
                    "external_name": "Tesla Inc.",
                    "flag_color": "#fc5a06"
                }
            else:
                payload = {
                    "ticker_id": ticker_id,
                    "flag_color": "#26baac",
                    "notes": "Test ticker from system"
                }
        
        response = requests.post(f"{API_BASE}/{list_id}/items", json=payload)
        if response.status_code == 201:
            data = response.json()
            item_data = data.get('data', {})
            item_id = item_data.get('id')
            print_test("ADD ticker to list", True, f"Added item ID: {item_id}")
            return item_id
        else:
            error_data = response.json() if response.content else {}
            print_test("ADD ticker to list", False, f"Status: {response.status_code}, Error: {error_data.get('error', {}).get('message', 'Unknown')}")
            return None
    except Exception as e:
        print_test("ADD ticker to list", False, str(e))
        return None

def test_update_item(item_id):
    """Test PUT /api/watch-lists/items/<item_id>"""
    print(f"\n📋 Testing PUT /api/watch-lists/items/{item_id}...")
    try:
        payload = {
            "flag_color": "#fc5a06",
            "notes": "Updated notes"
        }
        response = requests.put(f"{API_BASE}/items/{item_id}", json=payload)
        if response.status_code == 200:
            data = response.json()
            item_data = data.get('data', {})
            print_test("UPDATE item", True, f"Updated flag color: {item_data.get('flag_color')}")
            return True
        else:
            error_data = response.json() if response.content else {}
            print_test("UPDATE item", False, f"Status: {response.status_code}, Error: {error_data.get('error', {}).get('message', 'Unknown')}")
            return False
    except Exception as e:
        print_test("UPDATE item", False, str(e))
        return False

def test_reorder_items(list_id, item_ids):
    """Test POST /api/watch-lists/<id>/items/reorder"""
    print(f"\n📋 Testing POST /api/watch-lists/{list_id}/items/reorder...")
    try:
        items_order = [{"id": item_id, "display_order": idx} for idx, item_id in enumerate(item_ids)]
        payload = {"items": items_order}
        response = requests.post(f"{API_BASE}/{list_id}/items/reorder", json=payload)
        if response.status_code == 200:
            print_test("REORDER items", True, f"Reordered {len(item_ids)} items")
            return True
        else:
            error_data = response.json() if response.content else {}
            print_test("REORDER items", False, f"Status: {response.status_code}, Error: {error_data.get('error', {}).get('message', 'Unknown')}")
            return False
    except Exception as e:
        print_test("REORDER items", False, str(e))
        return False

def test_delete_item(item_id):
    """Test DELETE /api/watch-lists/items/<item_id>"""
    print(f"\n📋 Testing DELETE /api/watch-lists/items/{item_id}...")
    try:
        response = requests.delete(f"{API_BASE}/items/{item_id}")
        if response.status_code == 200:
            print_test("DELETE item", True, f"Deleted item ID: {item_id}")
            return True
        else:
            print_test("DELETE item", False, f"Status: {response.status_code}")
            return False
    except Exception as e:
        print_test("DELETE item", False, str(e))
        return False

def test_delete_list(list_id):
    """Test DELETE /api/watch-lists/<id>"""
    print(f"\n📋 Testing DELETE /api/watch-lists/{list_id}...")
    try:
        response = requests.delete(f"{API_BASE}/{list_id}")
        if response.status_code == 200:
            print_test("DELETE list", True, f"Deleted list ID: {list_id}")
            return True
        else:
            print_test("DELETE list", False, f"Status: {response.status_code}")
            return False
    except Exception as e:
        print_test("DELETE list", False, str(e))
        return False

def test_validation_errors():
    """Test validation error handling"""
    print("\n📋 Testing validation errors...")
    
    # Test duplicate name
    try:
        payload1 = {"name": "Duplicate Test"}
        payload2 = {"name": "Duplicate Test"}
        response1 = requests.post(API_BASE, json=payload1)
        if response1.status_code == 201:
            response2 = requests.post(API_BASE, json=payload2)
            if response2.status_code == 400:
                print_test("Validation: duplicate name", True, "Correctly rejected duplicate name")
                # Clean up
                list_id = response1.json().get('data', {}).get('id')
                if list_id:
                    requests.delete(f"{API_BASE}/{list_id}")
            else:
                print_test("Validation: duplicate name", False, f"Expected 400, got {response2.status_code}")
        else:
            print_test("Validation: duplicate name", False, "Failed to create first list")
    except Exception as e:
        print_test("Validation: duplicate name", False, str(e))
    
    # Test invalid view_mode
    try:
        payload = {"name": "Invalid View Mode", "view_mode": "invalid"}
        response = requests.post(API_BASE, json=payload)
        if response.status_code == 400:
            print_test("Validation: invalid view_mode", True, "Correctly rejected invalid view_mode")
        else:
            print_test("Validation: invalid view_mode", False, f"Expected 400, got {response.status_code}")
    except Exception as e:
        print_test("Validation: invalid view_mode", False, str(e))

def main():
    """Run all tests"""
    print("=" * 60)
    print("Watch Lists API Comprehensive Testing")
    print("=" * 60)
    
    # Check if server is running
    try:
        response = requests.get(f"{BASE_URL}/api/watch-lists", timeout=5)
        # If we get any response (even 401/500), server is running
        print(f"✅ Server is running (status: {response.status_code})")
    except requests.exceptions.RequestException as e:
        print(f"\n❌ Server is not running or not accessible!")
        print(f"   Error: {str(e)}")
        print(f"   Please start the server: ./start_server.sh")
        print(f"   Then run this script again.")
        sys.exit(1)
    
    # Run tests
    print("\n🚀 Starting tests...\n")
    
    # 1. Get all lists (should be empty initially)
    initial_lists = test_get_all_lists()
    
    # 2. Create a list
    list_id = test_create_list()
    if not list_id:
        print("\n❌ Cannot continue - failed to create list")
        return
    
    # 3. Get single list
    list_data = test_get_single_list(list_id)
    
    # 4. Update list
    test_update_list(list_id)
    
    # 5. Get items (should be empty)
    items = test_get_items(list_id)
    
    # 6. Add ticker to list
    item_id1 = test_add_ticker_to_list(list_id, use_external=False)
    item_id2 = test_add_ticker_to_list(list_id, use_external=True)
    
    # 7. Get items again (should have 2 items)
    items = test_get_items(list_id)
    
    # 8. Update item
    if item_id1:
        test_update_item(item_id1)
    
    # 9. Reorder items
    item_ids = [item.get('id') for item in items if item.get('id')]
    if len(item_ids) >= 2:
        test_reorder_items(list_id, item_ids)
    
    # 10. Delete item
    if item_id2:
        test_delete_item(item_id2)
    
    # 11. Validation tests
    test_validation_errors()
    
    # 12. Delete list (cleanup)
    test_delete_list(list_id)
    
    # Print summary
    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)
    print(f"✅ Passed: {len(test_results['passed'])}")
    print(f"❌ Failed: {len(test_results['failed'])}")
    
    if test_results['failed']:
        print("\nFailed tests:")
        for error in test_results['errors']:
            print(f"   - {error}")
    
    if len(test_results['failed']) == 0:
        print("\n🎉 All tests passed!")
        return 0
    else:
        print(f"\n⚠️  {len(test_results['failed'])} test(s) failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())

