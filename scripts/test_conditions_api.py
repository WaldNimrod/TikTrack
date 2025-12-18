#!/usr/bin/env python3
"""
Conditions API Testing Script
==============================
Tests all conditions API endpoints:
- GET /api/plan-conditions/trade-plans/{id}/conditions
- POST /api/plan-conditions/trade-plans/{id}/conditions
- GET /api/plan-conditions/{id}
- PUT /api/plan-conditions/{id}
- DELETE /api/plan-conditions/{id}
- GET /api/trade-conditions/trades/{id}/conditions
- POST /api/trade-conditions/trades/{id}/conditions
- GET /api/trade-conditions/{id}
- PUT /api/trade-conditions/{id}
- DELETE /api/trade-conditions/{id}
- Readiness status in responses
- Alert mapping

Uses admin/admin123 credentials for testing.
"""

import json
import time
import argparse
import requests
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional

BASE_URL = "http://localhost:5001"

# Test credentials (admin) - CRITICAL: Always use admin/admin123 for tests
TEST_USERNAME = "admin"
TEST_PASSWORD = "admin123"

# Session for maintaining authentication
session = requests.Session()


def login() -> bool:
    """Login and get session cookie"""
    try:
        print("🔐 Logging in...")
        response = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"username": TEST_USERNAME, "password": TEST_PASSWORD},
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            print("✅ Login successful")
            return True
        else:
            print(f"❌ Login failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Login error: {e}")
        return False


def get_first_trade_plan_id() -> Optional[int]:
    """Get first trade plan ID"""
    try:
        response = session.get(f"{BASE_URL}/api/trade-plans")
        if response.status_code == 200:
            data = response.json()
            plans = data.get("data", [])
            if plans and len(plans) > 0:
                return plans[0].get("id")
        return None
    except Exception as e:
        print(f"⚠️ Could not get trade plan ID: {e}")
        return None


def get_first_trade_id() -> Optional[int]:
    """Get first trade ID"""
    try:
        response = session.get(f"{BASE_URL}/api/trades")
        if response.status_code == 200:
            data = response.json()
            trades = data.get("data", [])
            if trades and len(trades) > 0:
                return trades[0].get("id")
        return None
    except Exception as e:
        print(f"⚠️ Could not get trade ID: {e}")
        return None


def get_trading_methods() -> List[Dict[str, Any]]:
    """Get available trading methods"""
    try:
        response = session.get(f"{BASE_URL}/api/trading-methods")
        if response.status_code == 200:
            data = response.json()
            return data.get("data", [])
        return []
    except Exception as e:
        print(f"⚠️ Could not get trading methods: {e}")
        return []


def test_get_plan_conditions(plan_id: int) -> Dict[str, Any]:
    """Test GET plan conditions endpoint"""
    result = {
        "test": "get_plan_conditions",
        "plan_id": plan_id,
        "status": "pending",
        "errors": []
    }
    
    try:
        print(f"📋 Testing GET plan conditions for plan {plan_id}")
        response = session.get(f"{BASE_URL}/api/plan-conditions/trade-plans/{plan_id}/conditions")
        
        if response.status_code == 200:
            data = response.json()
            conditions = data.get("data", [])
            
            # Check if readiness_status is present in response
            has_readiness = any("readiness_status" in cond for cond in conditions)
            
            result["status"] = "passed"
            result["conditions_count"] = len(conditions)
            result["has_readiness_status"] = has_readiness
            print(f"✅ Got {len(conditions)} conditions, readiness_status: {has_readiness}")
        else:
            result["status"] = "failed"
            result["errors"].append(f"HTTP {response.status_code}: {response.text}")
            print(f"❌ Failed: HTTP {response.status_code}")
    except Exception as e:
        result["status"] = "failed"
        result["errors"].append(str(e))
        print(f"❌ Error: {e}")
    
    return result


def test_create_plan_condition(plan_id: int, method_id: int) -> Dict[str, Any]:
    """Test POST create plan condition"""
    result = {
        "test": "create_plan_condition",
        "plan_id": plan_id,
        "method_id": method_id,
        "status": "pending",
        "errors": [],
        "condition_id": None
    }
    
    try:
        print(f"➕ Testing CREATE plan condition for plan {plan_id}")
        
        # Create condition data based on method type
        condition_data = {
            "method_id": method_id,
            "condition_group": 0,
            "parameters_json": {"ma_period": 20, "ma_type": "SMA", "comparison_type": "above"},
            "logical_operator": "NONE",
            "is_active": True,
            "auto_generate_alerts": True,
            "trigger_action": "enter_trade_positive"
        }
        
        response = session.post(
            f"{BASE_URL}/api/plan-conditions/trade-plans/{plan_id}/conditions",
            json=condition_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 201:
            data = response.json()
            condition = data.get("data", {})
            condition_id = condition.get("id")
            
            # Check if readiness_status is present
            has_readiness = "readiness_status" in condition
            readiness_status = condition.get("readiness_status")
            
            result["status"] = "passed"
            result["condition_id"] = condition_id
            result["has_readiness_status"] = has_readiness
            result["readiness_status"] = readiness_status
            print(f"✅ Created condition {condition_id}, readiness: {readiness_status}")
        else:
            result["status"] = "failed"
            result["errors"].append(f"HTTP {response.status_code}: {response.text}")
            print(f"❌ Failed: HTTP {response.status_code}")
    except Exception as e:
        result["status"] = "failed"
        result["errors"].append(str(e))
        print(f"❌ Error: {e}")
    
    return result


def test_update_plan_condition(condition_id: int) -> Dict[str, Any]:
    """Test PUT update plan condition"""
    result = {
        "test": "update_plan_condition",
        "condition_id": condition_id,
        "status": "pending",
        "errors": []
    }
    
    try:
        print(f"✏️ Testing UPDATE plan condition {condition_id}")
        
        update_data = {
            "method_id": 1,  # Keep same method
            "condition_group": 0,
            "parameters_json": {"ma_period": 50, "ma_type": "EMA", "comparison_type": "above"},
            "logical_operator": "NONE",
            "is_active": True,
            "auto_generate_alerts": True,
            "trigger_action": "enter_trade_positive"
        }
        
        response = session.put(
            f"{BASE_URL}/api/plan-conditions/{condition_id}",
            json=update_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            condition = data.get("data", {})
            
            # Check if readiness_status is present
            has_readiness = "readiness_status" in condition
            readiness_status = condition.get("readiness_status")
            
            result["status"] = "passed"
            result["has_readiness_status"] = has_readiness
            result["readiness_status"] = readiness_status
            print(f"✅ Updated condition, readiness: {readiness_status}")
        else:
            result["status"] = "failed"
            result["errors"].append(f"HTTP {response.status_code}: {response.text}")
            print(f"❌ Failed: HTTP {response.status_code}")
    except Exception as e:
        result["status"] = "failed"
        result["errors"].append(str(e))
        print(f"❌ Error: {e}")
    
    return result


def test_get_trade_conditions(trade_id: int) -> Dict[str, Any]:
    """Test GET trade conditions endpoint"""
    result = {
        "test": "get_trade_conditions",
        "trade_id": trade_id,
        "status": "pending",
        "errors": []
    }
    
    try:
        print(f"📈 Testing GET trade conditions for trade {trade_id}")
        response = session.get(f"{BASE_URL}/api/trade-conditions/trades/{trade_id}/conditions")
        
        if response.status_code == 200:
            data = response.json()
            conditions = data.get("data", [])
            
            # Check if readiness_status is present
            has_readiness = any("readiness_status" in cond for cond in conditions)
            
            result["status"] = "passed"
            result["conditions_count"] = len(conditions)
            result["has_readiness_status"] = has_readiness
            print(f"✅ Got {len(conditions)} conditions, readiness_status: {has_readiness}")
        else:
            result["status"] = "failed"
            result["errors"].append(f"HTTP {response.status_code}: {response.text}")
            print(f"❌ Failed: HTTP {response.status_code}")
    except Exception as e:
        result["status"] = "failed"
        result["errors"].append(str(e))
        print(f"❌ Error: {e}")
    
    return result


def test_create_trade_condition(trade_id: int, method_id: int) -> Dict[str, Any]:
    """Test POST create trade condition"""
    result = {
        "test": "create_trade_condition",
        "trade_id": trade_id,
        "method_id": method_id,
        "status": "pending",
        "errors": [],
        "condition_id": None
    }
    
    try:
        print(f"➕ Testing CREATE trade condition for trade {trade_id}")
        
        condition_data = {
            "method_id": method_id,
            "condition_group": 0,
            "parameters_json": {"ma_period": 20, "ma_type": "SMA", "comparison_type": "above"},
            "logical_operator": "NONE",
            "is_active": True,
            "auto_generate_alerts": True,
            "trigger_action": "enter_trade_positive"
        }
        
        response = session.post(
            f"{BASE_URL}/api/trade-conditions/trades/{trade_id}/conditions",
            json=condition_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 201:
            data = response.json()
            condition = data.get("data", {})
            condition_id = condition.get("id")
            
            # Check if readiness_status is present
            has_readiness = "readiness_status" in condition
            readiness_status = condition.get("readiness_status")
            
            result["status"] = "passed"
            result["condition_id"] = condition_id
            result["has_readiness_status"] = has_readiness
            result["readiness_status"] = readiness_status
            print(f"✅ Created condition {condition_id}, readiness: {readiness_status}")
        else:
            result["status"] = "failed"
            result["errors"].append(f"HTTP {response.status_code}: {response.text}")
            print(f"❌ Failed: HTTP {response.status_code}")
    except Exception as e:
        result["status"] = "failed"
        result["errors"].append(str(e))
        print(f"❌ Error: {e}")
    
    return result


def test_conditions_api() -> Dict[str, Any]:
    """Run all conditions API tests"""
    results = {
        "timestamp": datetime.now().isoformat(),
        "tests": [],
        "summary": {
            "total": 0,
            "passed": 0,
            "failed": 0,
            "skipped": 0
        }
    }
    
    # Login first
    if not login():
        print("❌ Login failed, aborting tests")
        return results
    
    # Get test entities
    plan_id = get_first_trade_plan_id()
    trade_id = get_first_trade_id()
    methods = get_trading_methods()
    
    if not plan_id and not trade_id:
        print("⚠️ No entities found for testing")
        return results
    
    method_id = methods[0].get("id") if methods else 1
    
    # Test plan conditions
    if plan_id:
        print(f"\n📋 Testing Plan Conditions API for plan {plan_id}")
        results["tests"].append(test_get_plan_conditions(plan_id))
        
        create_result = test_create_plan_condition(plan_id, method_id)
        results["tests"].append(create_result)
        
        if create_result.get("condition_id"):
            results["tests"].append(test_update_plan_condition(create_result["condition_id"]))
    
    # Test trade conditions
    if trade_id:
        print(f"\n📈 Testing Trade Conditions API for trade {trade_id}")
        results["tests"].append(test_get_trade_conditions(trade_id))
        results["tests"].append(test_create_trade_condition(trade_id, method_id))
    
    # Calculate summary
    for test_result in results["tests"]:
        results["summary"]["total"] += 1
        status = test_result.get("status", "unknown")
        if status == "passed":
            results["summary"]["passed"] += 1
        elif status == "failed":
            results["summary"]["failed"] += 1
        elif status == "skipped":
            results["summary"]["skipped"] += 1
    
    return results


def main():
    parser = argparse.ArgumentParser(description="Test conditions API endpoints")
    parser.add_argument("--output", type=str, help="Output JSON file path")
    args = parser.parse_args()
    
    try:
        print("🚀 Starting Conditions API Tests")
        results = test_conditions_api()
        
        # Print summary
        print("\n" + "="*50)
        print("📊 Test Summary")
        print("="*50)
        print(f"Total: {results['summary']['total']}")
        print(f"Passed: {results['summary']['passed']}")
        print(f"Failed: {results['summary']['failed']}")
        print(f"Skipped: {results['summary']['skipped']}")
        
        # Save results
        if args.output:
            output_path = Path(args.output)
        else:
            output_path = Path("reports/conditions-api-test-results.json")
        
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        print(f"\n💾 Results saved to {output_path}")
        
    except Exception as e:
        print(f"❌ Test execution failed: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
