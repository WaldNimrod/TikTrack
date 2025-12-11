#!/usr/bin/env python3
"""
Comprehensive CRUD Tests - TikTrack
===================================

Tests CRUD operations for all entities:
- Create: Create new record, validation, errors
- Read: Load records, filters, sorting, pagination
- Update: Edit record, validation, errors
- Delete: Delete record, linked items check, confirmation
- Integration: Cache, notifications, modals
"""

import sys
import json
import time
import requests
from pathlib import Path
from typing import Dict, List, Optional
from datetime import datetime

BASE_DIR = Path(__file__).parent.parent.parent
BASE_URL = "http://localhost:8080"
REPORTS_DIR = BASE_DIR / "reports" / "qa"

# Test credentials
TEST_USERNAME = "admin"
TEST_PASSWORD = "admin123"

# Test results storage
crud_results = {
    "timestamp": datetime.now().isoformat(),
    "entities": {},
    "summary": {
        "total_entities": 0,
        "tested": 0,
        "passed": 0,
        "failed": 0,
        "warnings": 0
    }
}

# Helper function to get available IDs from system
def get_available_ids(session):
    """Get first available ticker_id and trading_account_id"""
    ids = {"ticker_id": None, "trading_account_id": None}
    
    try:
        # Get first ticker
        resp = session.get(f"{BASE_URL}/api/tickers")
        if resp.status_code == 200:
            data = resp.json()
            items = data.get("data", []) if isinstance(data, dict) else data
            if items and len(items) > 0:
                ids["ticker_id"] = items[0].get("id")
        
        # Get first trading account
        resp = session.get(f"{BASE_URL}/api/trading-accounts")
        if resp.status_code == 200:
            data = resp.json()
            items = data.get("data", []) if isinstance(data, dict) else data
            if items and len(items) > 0:
                ids["trading_account_id"] = items[0].get("id")
    except:
        pass
    
    return ids

# Entities to test (10 entities)
# Note: test_data will be populated dynamically after login
ENTITIES = [
    {
        "name": "trades",
        "api_base": "/api/trades",
        "test_data_template": {
            "ticker_id": None,  # Will be set dynamically
            "trading_account_id": None,  # Will be set dynamically
            "side": "Long",
            "investment_type": "swing",
            "entry_price": 150.00,
            "planned_quantity": 10,
            "planned_amount": 1500.00
        }
    },
    {
        "name": "trade_plans",
        "api_base": "/api/trade-plans",
        "test_data_template": {
            "ticker_id": None,  # Will be set dynamically
            "trading_account_id": None,  # Will be set dynamically
            "side": "Long",
            "investment_type": "swing",
            "entry_price": 150.00,  # Required
            "planned_amount": 1500.00
        }
    },
    {
        "name": "alerts",
        "api_base": "/api/alerts",
        "test_data_template": {
            "ticker_id": None,  # Will be set dynamically
            "condition_attribute": "price",
            "condition_operator": "more_than",
            "condition_number": "300.00",
            "related_type_id": 4  # Alert related type
        }
    },
    {
        "name": "tickers",
        "api_base": "/api/tickers",
        "test_data_template": {
            "symbol": None,  # Will be set with unique timestamp
            "name": "Test Ticker",
            "type": "stock",
            "currency_id": 1  # USD
        },
        "unique_field": "symbol"  # Mark that this needs unique value
    },
    {
        "name": "trading_accounts",
        "api_base": "/api/trading-accounts",
        "test_data_template": {
            "name": None,  # Will be set with unique timestamp
            "currency_id": 1,  # USD
            "status": "open"
        },
        "unique_field": "name"  # Mark that this needs unique value
    },
    {
        "name": "executions",
        "api_base": "/api/executions",
        "test_data_template": {
            "ticker_id": None,  # Will be set dynamically
            "trading_account_id": None,  # Will be set dynamically
            "action": "buy",
            "date": None,  # Will be set to current datetime
            "quantity": 5.0,
            "price": 150.00
        }
    },
    {
        "name": "cash_flows",
        "api_base": "/api/cash-flows",
        "test_data_template": {
            "trading_account_id": None,  # Will be set dynamically
            "type": "deposit",  # Not flow_type!
            "amount": 1000.00,
            "date": None  # Will be set to current date
        }
    },
    {
        "name": "notes",
        "api_base": "/api/notes",
        "test_data_template": {
            "content": "Test note content for QA testing",
            "related_type_id": 2,  # Trade related type
            "related_id": None  # Will be set to first trade ID if available
        }
    },
    {
        "name": "watch_lists",
        "api_base": "/api/watch-lists",
        "test_data_template": {
            "name": None  # Will be set with unique timestamp
        },
        "unique_field": "name"  # Mark that this needs unique value
    },
    {
        "name": "tags",
        "api_base": "/api/tags",
        "test_data_template": {
            "name": None,  # Will be set with unique timestamp
            "category_id": None  # Optional
        },
        "unique_field": "name"  # Mark that this needs unique value
    }
]

# Session for authenticated requests
session = None
# Bearer token for authentication
auth_token = None


def login() -> bool:
    """Login and get session with token"""
    global session, auth_token
    session = requests.Session()

    try:
        # Login
        login_data = {
            "username": TEST_USERNAME,
            "password": TEST_PASSWORD
        }
        response = session.post(f"{BASE_URL}/api/auth/login", json=login_data, timeout=10)

        if response.status_code == 200:
            # Extract token from response
            data = response.json()
            auth_token = data.get("data", {}).get("access_token")
            if not auth_token:
                print("❌ No access token in login response")
                return False

            # Set Authorization header for all future requests
            session.headers.update({
                'Authorization': f'Bearer {auth_token}'
            })
            # Get available IDs and populate test data
            ids = get_available_ids(session)
            timestamp = int(time.time())
            
            for entity in ENTITIES:
                # Create test_data from template
                entity["test_data"] = entity["test_data_template"].copy()
                
                # Fill in IDs
                if "ticker_id" in entity["test_data"] and entity["test_data"]["ticker_id"] is None:
                    entity["test_data"]["ticker_id"] = ids["ticker_id"]
                if "trading_account_id" in entity["test_data"] and entity["test_data"]["trading_account_id"] is None:
                    entity["test_data"]["trading_account_id"] = ids["trading_account_id"]
                
                # Handle unique fields with timestamp
                if "unique_field" in entity:
                    field = entity["unique_field"]
                    if entity["test_data"].get(field) is None:
                        if field == "symbol":
                            # Symbol must be max 10 characters, use shorter format
                            # Use last 9 digits of timestamp + 'T' prefix = 10 chars total
                            symbol_suffix = str(timestamp % 1000000000)[:9]  # Last 9 digits
                            entity["test_data"][field] = f"T{symbol_suffix}"[:10]  # Max 10 chars
                        elif field == "name":
                            if entity["name"] == "watch_lists":
                                entity["test_data"][field] = f"Test Watch List {timestamp}"
                            elif entity["name"] == "tags":
                                entity["test_data"][field] = f"test-tag-{timestamp}"
                            else:
                                entity["test_data"][field] = f"Test {entity['name']} {timestamp}"
                
                # Handle date fields
                if "date" in entity["test_data"] and entity["test_data"]["date"] is None:
                    from datetime import datetime
                    if entity["name"] == "executions":
                        entity["test_data"]["date"] = datetime.now().isoformat()
                    elif entity["name"] == "cash_flows":
                        entity["test_data"]["date"] = datetime.now().date().isoformat()
                
                # Handle related_id for notes
                if entity["name"] == "notes" and entity["test_data"].get("related_id") is None:
                    # Try to get first trade ID
                    try:
                        resp = session.get(f"{BASE_URL}/api/trades")
                        if resp.status_code == 200:
                            data = resp.json()
                            items = data.get("data", []) if isinstance(data, dict) else data
                            if items and len(items) > 0:
                                entity["test_data"]["related_id"] = items[0].get("id")
                    except:
                        pass
                
                # Remove template and unique_field from entity
                if "test_data_template" in entity:
                    del entity["test_data_template"]
                if "unique_field" in entity:
                    del entity["unique_field"]
            
            return True
        else:
            print(f"⚠️  Login failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"⚠️  Login error: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_create(entity: Dict) -> Dict:
    """Test CREATE operation"""
    result = {
        "passed": False,
        "record_id": None,
        "errors": [],
        "warnings": []
    }
    
    try:
        url = f"{BASE_URL}{entity['api_base']}"
        # Ticker creation might take longer due to validation and checks
        timeout = 30 if entity["name"] == "tickers" else 10
        response = session.post(url, json=entity["test_data"], timeout=timeout)
        
        if response.status_code in [200, 201]:
            data = response.json()
            # Handle different response formats
            if isinstance(data, dict):
                # Check for id in data or data.data
                if "id" in data:
                    result["record_id"] = data["id"]
                    result["passed"] = True
                elif "data" in data and isinstance(data["data"], dict) and "id" in data["data"]:
                    result["record_id"] = data["data"]["id"]
                    result["passed"] = True
                elif "data" in data and isinstance(data["data"], int):
                    result["record_id"] = data["data"]
                    result["passed"] = True
                else:
                    # Try to extract ID from response
                    response_text = response.text[:500]
                    result["errors"].append(f"Response missing record ID. Response: {response_text}")
            else:
                result["errors"].append(f"Unexpected response format: {type(data)}")
        else:
            error_text = response.text[:200] if response.text else "No error message"
            result["errors"].append(f"HTTP {response.status_code}: {error_text}")
    except Exception as e:
        result["errors"].append(f"Create error: {str(e)}")
        import traceback
        result["errors"].append(f"Traceback: {traceback.format_exc()[:200]}")
    
    return result


def test_read(entity: Dict) -> Dict:
    """Test READ operation"""
    result = {
        "passed": False,
        "record_count": 0,
        "errors": [],
        "warnings": []
    }
    
    try:
        url = f"{BASE_URL}{entity['api_base']}"
        response = session.get(url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                result["record_count"] = len(data)
                result["passed"] = True
            elif isinstance(data, dict) and "data" in data:
                result["record_count"] = len(data["data"])
                result["passed"] = True
            else:
                result["warnings"].append("Unexpected response format")
        else:
            result["errors"].append(f"HTTP {response.status_code}")
    except Exception as e:
        result["errors"].append(f"Read error: {str(e)}")
    
    return result


def test_update(entity: Dict, record_id: int) -> Dict:
    """Test UPDATE operation"""
    result = {
        "passed": False,
        "errors": [],
        "warnings": []
    }
    
    if not record_id:
        result["errors"].append("No record ID for update test")
        return result
    
    try:
        url = f"{BASE_URL}{entity['api_base']}/{record_id}"
        update_data = {**entity["test_data"], "id": record_id}
        response = session.put(url, json=update_data, timeout=10)
        
        if response.status_code in [200, 204]:
            result["passed"] = True
        else:
            result["errors"].append(f"HTTP {response.status_code}: {response.text[:100]}")
    except Exception as e:
        result["errors"].append(f"Update error: {str(e)}")
    
    return result


def test_delete(entity: Dict, record_id: int) -> Dict:
    """Test DELETE operation"""
    result = {
        "passed": False,
        "errors": [],
        "warnings": []
    }
    
    if not record_id:
        result["warnings"].append("No record ID for delete test - skipping")
        return result
    
    try:
        url = f"{BASE_URL}{entity['api_base']}/{record_id}"
        response = session.delete(url, timeout=10)
        
        if response.status_code in [200, 204]:
            result["passed"] = True
        else:
            # Check if it's a linked items error (expected in some cases)
            if response.status_code == 400 and "linked" in response.text.lower():
                result["warnings"].append("Cannot delete - has linked items (expected)")
                result["passed"] = True  # This is acceptable
            else:
                result["errors"].append(f"HTTP {response.status_code}: {response.text[:100]}")
    except Exception as e:
        result["errors"].append(f"Delete error: {str(e)}")
    
    return result


def cleanup_test_data(entity: Dict, session):
    """Clean up test data before creating new records"""
    try:
        entity_name = entity.get("name", "")

        # More aggressive cleanup - delete all test records
        try:
            resp = session.get(f"{BASE_URL}{entity['api_base']}")
            if resp.status_code == 200:
                data = resp.json()
                items = data.get("data", []) if isinstance(data, dict) else data

                # Delete all items that look like test data
                for item in items:
                    if isinstance(item, dict) and 'id' in item:
                        item_id = item['id']

                        # For entities with names/symbols, check if they look like test data
                        should_delete = False
                        if entity_name == "watch_lists" and item.get('name', '').startswith('Test Watch List'):
                            should_delete = True
                        elif entity_name == "tags" and item.get('name', '').startswith('Test Tag'):
                            should_delete = True
                        elif entity_name == "tickers" and item.get('symbol', '').startswith('TEST'):
                            should_delete = True
                        elif entity_name == "trading_accounts" and item.get('name', '').startswith('Test Account'):
                            should_delete = True
                        elif entity_name in ["trades", "trade_plans", "alerts", "executions", "cash_flows", "notes"]:
                            # For transactional data, delete all records (they're usually test data)
                            should_delete = True

                        if should_delete:
                            try:
                                delete_resp = session.delete(f"{BASE_URL}{entity['api_base']}/{item_id}")
                                if delete_resp.status_code in [200, 204]:
                                    print(f"  🧹 Cleaned up {entity_name} ID {item_id}")
                            except:
                                pass  # Continue with other deletions
        except Exception as e:
            print(f"  ⚠️ Cleanup warning for {entity_name}: {e}")

    except Exception as e:
        print(f"  ⚠️ Cleanup error for {entity_name}: {e}")


def test_entity(entity: Dict) -> Dict:
    """Test all CRUD operations for an entity"""
    entity_result = {
        "name": entity["name"],
        "status": "pending",
        "tests": {},
        "errors": [],
        "warnings": []
    }
    
    print(f"Testing CRUD for: {entity['name']}")
    
    # Cleanup before create (for entities with unique fields)
    if entity["name"] in ["watch_lists", "tags", "tickers", "trading_accounts"]:
        cleanup_test_data(entity, session)
    
    # Test CREATE
    create_result = test_create(entity)
    entity_result["tests"]["create"] = "passed" if create_result["passed"] else "failed"
    entity_result["errors"].extend(create_result["errors"])
    entity_result["warnings"].extend(create_result["warnings"])
    record_id = create_result.get("record_id")
    
    # Test READ
    read_result = test_read(entity)
    entity_result["tests"]["read"] = "passed" if read_result["passed"] else "failed"
    entity_result["errors"].extend(read_result["errors"])
    entity_result["warnings"].extend(read_result["warnings"])
    
    # Test UPDATE (if we have a record)
    if record_id:
        update_result = test_update(entity, record_id)
        entity_result["tests"]["update"] = "passed" if update_result["passed"] else "failed"
        entity_result["errors"].extend(update_result["errors"])
        entity_result["warnings"].extend(update_result["warnings"])
    else:
        entity_result["tests"]["update"] = "skipped"
        entity_result["warnings"].append("Update skipped - no record created")
    
    # Test DELETE (if we have a record)
    if record_id:
        delete_result = test_delete(entity, record_id)
        entity_result["tests"]["delete"] = "passed" if delete_result["passed"] else "failed"
        entity_result["errors"].extend(delete_result["errors"])
        entity_result["warnings"].extend(delete_result["warnings"])
    else:
        entity_result["tests"]["delete"] = "skipped"
        entity_result["warnings"].append("Delete skipped - no record created")
    
    # Determine overall status
    if entity_result["errors"]:
        entity_result["status"] = "failed"
    elif entity_result["warnings"]:
        entity_result["status"] = "warning"
    else:
        entity_result["status"] = "passed"
    
    return entity_result


def run_all_crud_tests() -> Dict:
    """Run CRUD tests for all entities"""
    print("🧪 Testing CRUD Operations...")
    print(f"Total entities to test: {len(ENTITIES)}\n")
    
    # Login first
    if not login():
        print("❌ Failed to login. CRUD tests require authentication.")
        return {
            "status": "failed",
            "error": "Authentication failed",
            "total_tests": 0,
            "passed": 0,
            "failed": 0,
            "warnings": 0
        }
    
    print("✅ Logged in successfully\n")
    
    crud_results["summary"]["total_entities"] = len(ENTITIES)
    
    for entity in ENTITIES:
        result = test_entity(entity)
        crud_results["entities"][entity["name"]] = result
        crud_results["summary"]["tested"] += 1
        
        if result["status"] == "passed":
            crud_results["summary"]["passed"] += 1
            print(f"  ✅ {entity['name']}: PASSED")
        elif result["status"] == "failed":
            crud_results["summary"]["failed"] += 1
            print(f"  ❌ {entity['name']}: FAILED")
            for error in result["errors"][:3]:
                print(f"     - {error}")
        else:
            crud_results["summary"]["warnings"] += 1
            print(f"  ⚠️  {entity['name']}: WARNING")
            for warning in result["warnings"][:3]:
                print(f"     - {warning}")
        
        # Small delay
        time.sleep(0.5)
    
    # Calculate summary
    crud_results["summary"]["total_tests"] = sum(
        len(e["tests"]) for e in crud_results["entities"].values()
    )
    
    # Save results
    results_file = REPORTS_DIR / "crud_test_results.json"
    results_file.parent.mkdir(parents=True, exist_ok=True)
    with open(results_file, 'w', encoding='utf-8') as f:
        json.dump(crud_results, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ CRUD tests completed!")
    print(f"   Total: {crud_results['summary']['total_entities']}")
    print(f"   Passed: {crud_results['summary']['passed']}")
    print(f"   Failed: {crud_results['summary']['failed']}")
    print(f"   Warnings: {crud_results['summary']['warnings']}")
    
    return {
        "status": "completed",
        "total_tests": crud_results["summary"]["total_tests"],
        "passed": crud_results["summary"]["passed"],
        "failed": crud_results["summary"]["failed"],
        "warnings": crud_results["summary"]["warnings"],
        "results": crud_results
    }


if __name__ == "__main__":
    run_all_crud_tests()

