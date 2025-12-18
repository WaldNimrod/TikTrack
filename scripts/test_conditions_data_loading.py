#!/usr/bin/env python3
"""
Conditions Data Loading Testing Script
=======================================
Tests data loading functionality for conditions:
- Detecting missing data
- Triggering data refresh
- Updating readiness status after data load

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


def get_ticker_id_from_plan(plan_id: int) -> Optional[int]:
    """Get ticker_id from trade plan"""
    try:
        response = session.get(f"{BASE_URL}/api/trade-plans/{plan_id}")
        if response.status_code == 200:
            data = response.json()
            plan = data.get("data", {})
            return plan.get("ticker_id")
        return None
    except Exception as e:
        print(f"⚠️ Could not get ticker_id: {e}")
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


def create_test_condition(plan_id: int, method_id: int) -> Optional[int]:
    """Create a test condition"""
    try:
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
            return condition.get("id")
        return None
    except Exception as e:
        print(f"⚠️ Could not create condition: {e}")
        return None


def test_check_readiness_status(condition_id: int) -> Dict[str, Any]:
    """Test checking readiness status"""
    result = {
        "test": "check_readiness_status",
        "condition_id": condition_id,
        "status": "pending",
        "errors": []
    }
    
    try:
        print(f"🔍 Checking readiness status for condition {condition_id}")
        response = session.get(f"{BASE_URL}/api/plan-conditions/{condition_id}")
        
        if response.status_code == 200:
            data = response.json()
            condition = data.get("data", {})
            
            readiness_status = condition.get("readiness_status")
            readiness_message = condition.get("readiness_message")
            missing_data = condition.get("missing_data", [])
            
            result["status"] = "passed"
            result["readiness_status"] = readiness_status
            result["readiness_message"] = readiness_message
            result["missing_data"] = missing_data
            print(f"✅ Readiness: {readiness_status}, Missing: {missing_data}")
        else:
            result["status"] = "failed"
            result["errors"].append(f"HTTP {response.status_code}")
            print(f"❌ Failed: HTTP {response.status_code}")
    except Exception as e:
        result["status"] = "failed"
        result["errors"].append(str(e))
        print(f"❌ Error: {e}")
    
    return result


def test_refresh_ticker_data(ticker_id: int) -> Dict[str, Any]:
    """Test refreshing ticker data"""
    result = {
        "test": "refresh_ticker_data",
        "ticker_id": ticker_id,
        "status": "pending",
        "errors": []
    }
    
    try:
        print(f"🔄 Refreshing data for ticker {ticker_id}")
        response = session.post(
            f"{BASE_URL}/api/external-data/quotes/{ticker_id}/refresh",
            json={
                "force_refresh": False,
                "include_historical": True,
                "days_back": 150
            },
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            result["status"] = "passed"
            result["actions_taken"] = data.get("data", {}).get("actions_taken", [])
            result["historical_count"] = data.get("data", {}).get("historical_quotes_count", 0)
            print(f"✅ Data refreshed: {len(result['actions_taken'])} actions")
        else:
            result["status"] = "failed"
            result["errors"].append(f"HTTP {response.status_code}: {response.text}")
            print(f"❌ Failed: HTTP {response.status_code}")
    except Exception as e:
        result["status"] = "failed"
        result["errors"].append(str(e))
        print(f"❌ Error: {e}")
    
    return result


def test_readiness_after_refresh(condition_id: int) -> Dict[str, Any]:
    """Test readiness status after data refresh"""
    result = {
        "test": "readiness_after_refresh",
        "condition_id": condition_id,
        "status": "pending",
        "errors": []
    }
    
    try:
        print(f"🔍 Checking readiness after refresh for condition {condition_id}")
        time.sleep(3)  # Wait for refresh to complete
        
        response = session.get(f"{BASE_URL}/api/plan-conditions/{condition_id}")
        
        if response.status_code == 200:
            data = response.json()
            condition = data.get("data", {})
            
            readiness_status = condition.get("readiness_status")
            readiness_message = condition.get("readiness_message")
            
            result["status"] = "passed"
            result["readiness_status"] = readiness_status
            result["readiness_message"] = readiness_message
            print(f"✅ Readiness after refresh: {readiness_status}")
        else:
            result["status"] = "failed"
            result["errors"].append(f"HTTP {response.status_code}")
            print(f"❌ Failed: HTTP {response.status_code}")
    except Exception as e:
        result["status"] = "failed"
        result["errors"].append(str(e))
        print(f"❌ Error: {e}")
    
    return result


def test_conditions_data_loading() -> Dict[str, Any]:
    """Run all data loading tests"""
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
    methods = get_trading_methods()
    
    if not plan_id:
        print("⚠️ No trade plan found for testing")
        return results
    
    ticker_id = get_ticker_id_from_plan(plan_id)
    if not ticker_id:
        print("⚠️ No ticker found for plan")
        return results
    
    method_id = methods[0].get("id") if methods else 1
    
    # Create test condition
    print(f"\n📋 Creating test condition for plan {plan_id}")
    condition_id = create_test_condition(plan_id, method_id)
    
    if not condition_id:
        print("⚠️ Could not create test condition")
        return results
    
    print(f"✅ Created test condition {condition_id}")
    time.sleep(2)
    
    # Check initial readiness
    print(f"\n🔍 Testing Data Loading")
    results["tests"].append(test_check_readiness_status(condition_id))
    
    # Refresh ticker data
    results["tests"].append(test_refresh_ticker_data(ticker_id))
    
    # Check readiness after refresh
    results["tests"].append(test_readiness_after_refresh(condition_id))
    
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
    parser = argparse.ArgumentParser(description="Test conditions data loading")
    parser.add_argument("--output", type=str, help="Output JSON file path")
    args = parser.parse_args()
    
    try:
        print("🚀 Starting Conditions Data Loading Tests")
        results = test_conditions_data_loading()
        
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
            output_path = Path("reports/conditions-data-loading-test-results.json")
        
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
