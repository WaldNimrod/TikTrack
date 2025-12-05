#!/usr/bin/env python3
"""
Add a condition to a ticker's trade plan for testing the dashboard
Usage: python3 scripts/add_condition_to_ticker.py [ticker_id]
"""

import sys
import os
import json
import requests

# Add Backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'Backend'))

BASE_URL = "http://localhost:8080"

def get_trade_plans_for_ticker(ticker_id):
    """Get trade plans for a ticker"""
    url = f"{BASE_URL}/api/trade-plans"
    params = {"ticker_id": ticker_id, "limit": 10}
    
    try:
        response = requests.get(url, params=params, timeout=10)
        if response.status_code == 200:
            data = response.json()
            return data.get('data', [])
        else:
            print(f"❌ Error getting trade plans: {response.status_code}")
            print(response.text)
            return []
    except Exception as e:
        print(f"❌ Error: {e}")
        return []

def get_trading_methods():
    """Get available trading methods - use default method ID 1 (Moving Averages)"""
    # Default to method ID 1 (Moving Averages) if API not available
    # This is a common method that should exist
    return [{"id": 1, "name_en": "Moving Averages", "name_he": "ממוצעים נעים", "parameters": [
        {"parameter_key": "ma_period", "default_value": "20"},
        {"parameter_key": "ma_type", "default_value": "SMA"},
        {"parameter_key": "comparison_type", "default_value": "above"}
    ]}]

def get_plan_conditions(plan_id):
    """Get conditions for a trade plan"""
    url = f"{BASE_URL}/api/plan-conditions/trade-plans/{plan_id}/conditions"
    
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            data = response.json()
            return data.get('data', [])
        elif response.status_code == 404:
            return []  # No conditions
        else:
            print(f"⚠️  Status {response.status_code} getting conditions")
            return []
    except Exception as e:
        print(f"⚠️  Error getting conditions: {e}")
        return []

def create_condition(plan_id, method_id, parameters_json):
    """Create a condition for a trade plan"""
    url = f"{BASE_URL}/api/plan-conditions/trade-plans/{plan_id}/conditions"
    
    payload = {
        "method_id": method_id,
        "condition_group": 0,
        "parameters_json": parameters_json,
        "logical_operator": "NONE",
        "is_active": True,
        "auto_generate_alerts": True,
        "trigger_action": "enter_trade_positive",
        "action_notes": "תנאי בדיקה לדשבורד טיקר"
    }
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        if response.status_code == 201:
            data = response.json()
            return data.get('data', {})
        else:
            print(f"❌ Error creating condition: {response.status_code}")
            print(response.text)
            return None
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def main():
    ticker_id = int(sys.argv[1]) if len(sys.argv) > 1 else 1424
    
    print(f"🔍 Checking ticker {ticker_id}...")
    
    # Get trade plans
    plans = get_trade_plans_for_ticker(ticker_id)
    if not plans:
        print(f"❌ No trade plans found for ticker {ticker_id}")
        print("💡 Create a trade plan first for this ticker")
        return
    
    print(f"✅ Found {len(plans)} trade plan(s)")
    for plan in plans:
        print(f"   Plan ID: {plan.get('id')}, Name: {plan.get('name', 'N/A')}")
    
    # Check if any plan has conditions
    plan_with_conditions = None
    for plan in plans:
        conditions = get_plan_conditions(plan['id'])
        if conditions:
            plan_with_conditions = plan
            print(f"\n✅ Plan {plan['id']} already has {len(conditions)} condition(s)")
            for cond in conditions:
                method_name = cond.get('method', {}).get('name_he', 'N/A') if isinstance(cond.get('method'), dict) else 'N/A'
                print(f"   - Condition ID: {cond.get('id')}, Method: {method_name}")
            break
    
    if plan_with_conditions:
        print("\n✅ Ticker already has conditions - dashboard should display them")
        return
    
    # Get trading methods
    methods = get_trading_methods()
    if not methods:
        print("❌ No trading methods found")
        return
    
    # Find a simple method (Moving Averages)
    method = None
    for m in methods:
        if 'ממוצעים' in m.get('name_he', '') or 'Moving Average' in m.get('name_en', ''):
            method = m
            break
    
    if not method:
        method = methods[0]  # Use first method
    
    print(f"\n📊 Using method: {method.get('name_he', 'N/A')} (ID: {method.get('id')})")
    
    # Create condition for first plan
    plan = plans[0]
    plan_id = plan['id']
    
    # Create parameters JSON based on method
    method_params = method.get('parameters', [])
    parameters = {}
    for param in method_params:
        param_key = param.get('parameter_key')
        default_value = param.get('default_value')
        if param_key and default_value:
            parameters[param_key] = default_value
    
    # If no parameters, use simple default
    if not parameters:
        parameters = {"ma_period": "20", "ma_type": "SMA", "comparison_type": "above"}
    
    print(f"\n➕ Creating condition for plan {plan_id}...")
    print(f"   Parameters: {json.dumps(parameters, ensure_ascii=False, indent=2)}")
    
    condition = create_condition(plan_id, method['id'], parameters)
    
    if condition:
        print(f"\n✅ Condition created successfully!")
        print(f"   Condition ID: {condition.get('id')}")
        print(f"   Method: {method.get('name_he', 'N/A')}")
        print(f"\n💡 Now check the dashboard: http://localhost:8080/ticker-dashboard.html?tickerId={ticker_id}")
    else:
        print("\n❌ Failed to create condition")

if __name__ == "__main__":
    main()

