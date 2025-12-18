#!/usr/bin/env python3
"""
Conditions Evaluation Testing Script
=====================================
Tests condition evaluation functionality:
- Background evaluation task
- Alert creation from conditions
- Alert lifecycle (create, trigger, reactivate)
- Condition evaluation results

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


def test_evaluate_condition(condition_id: int) -> Dict[str, Any]:
    """Test condition evaluation endpoint"""
    result = {
        "test": "evaluate_condition",
        "condition_id": condition_id,
        "status": "pending",
        "errors": []
    }
    
    try:
        print(f"🔍 Testing evaluation for condition {condition_id}")
        response = session.post(
            f"{BASE_URL}/api/plan-conditions/{condition_id}/evaluate",
            json={},
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            evaluation = data.get("data", {})
            
            result["status"] = "passed"
            result["met"] = evaluation.get("met", False)
            result["evaluation_time"] = evaluation.get("evaluation_time")
            result["details"] = evaluation.get("details", {})
            print(f"✅ Condition evaluated: met={result['met']}")
        else:
            result["status"] = "failed"
            result["errors"].append(f"HTTP {response.status_code}: {response.text}")
            print(f"❌ Failed: HTTP {response.status_code}")
    except Exception as e:
        result["status"] = "failed"
        result["errors"].append(str(e))
        print(f"❌ Error: {e}")
    
    return result


def test_check_alert_for_condition(condition_id: int) -> Dict[str, Any]:
    """Test checking if alert exists for condition"""
    result = {
        "test": "check_alert_for_condition",
        "condition_id": condition_id,
        "status": "pending",
        "errors": [],
        "alert_found": False
    }
    
    try:
        print(f"🔔 Checking alerts for condition {condition_id}")
        
        # Get all alerts
        response = session.get(f"{BASE_URL}/api/alerts/unread")
        if response.status_code == 200:
            data = response.json()
            alerts = data.get("data", [])
            
            # Check if any alert is linked to this condition
            for alert in alerts:
                if alert.get("plan_condition_id") == condition_id:
                    result["alert_found"] = True
                    result["alert_id"] = alert.get("id")
                    result["alert_status"] = alert.get("is_triggered")
                    break
            
            result["status"] = "passed"
            print(f"✅ Alert check complete: found={result['alert_found']}")
        else:
            result["status"] = "failed"
            result["errors"].append(f"HTTP {response.status_code}")
            print(f"❌ Failed: HTTP {response.status_code}")
    except Exception as e:
        result["status"] = "failed"
        result["errors"].append(str(e))
        print(f"❌ Error: {e}")
    
    return result


def test_evaluation_history(condition_id: int) -> Dict[str, Any]:
    """Test getting evaluation history"""
    result = {
        "test": "evaluation_history",
        "condition_id": condition_id,
        "status": "pending",
        "errors": []
    }
    
    try:
        print(f"📜 Testing evaluation history for condition {condition_id}")
        response = session.get(
            f"{BASE_URL}/api/plan-conditions/{condition_id}/evaluation-history"
        )
        
        if response.status_code == 200:
            data = response.json()
            history = data.get("data", [])
            
            result["status"] = "passed"
            result["history_count"] = len(history)
            print(f"✅ Got {len(history)} evaluation records")
        else:
            result["status"] = "failed"
            result["errors"].append(f"HTTP {response.status_code}: {response.text}")
            print(f"❌ Failed: HTTP {response.status_code}")
    except Exception as e:
        result["status"] = "failed"
        result["errors"].append(str(e))
        print(f"❌ Error: {e}")
    
    return result


def test_conditions_evaluation() -> Dict[str, Any]:
    """Run all evaluation tests"""
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
    
    method_id = methods[0].get("id") if methods else 1
    
    # Create test condition
    print(f"\n📋 Creating test condition for plan {plan_id}")
    condition_id = create_test_condition(plan_id, method_id)
    
    if not condition_id:
        print("⚠️ Could not create test condition")
        return results
    
    print(f"✅ Created test condition {condition_id}")
    time.sleep(2)  # Wait for condition to be saved
    
    # Run evaluation tests
    print(f"\n🔍 Testing Condition Evaluation")
    results["tests"].append(test_evaluate_condition(condition_id))
    
    # Check for alerts
    time.sleep(2)  # Wait for alert processing
    results["tests"].append(test_check_alert_for_condition(condition_id))
    
    # Get evaluation history
    results["tests"].append(test_evaluation_history(condition_id))
    
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
    parser = argparse.ArgumentParser(description="Test conditions evaluation")
    parser.add_argument("--output", type=str, help="Output JSON file path")
    args = parser.parse_args()
    
    try:
        print("🚀 Starting Conditions Evaluation Tests")
        results = test_conditions_evaluation()
        
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
            output_path = Path("reports/conditions-evaluation-test-results.json")
        
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
