#!/usr/bin/env python3
"""
Script to create sample records for testing Select Populator Service edit modals
"""
import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8080"

def create_sample_trade():
    """Create a sample trade record"""
    url = f"{BASE_URL}/api/trades/"
    
    # Get first ticker
    tickers_response = requests.get(f"{BASE_URL}/api/tickers/")
    tickers_data = tickers_response.json()
    first_ticker = tickers_data.get('data', [{}])[0] if tickers_data.get('data') else None
    
    if not first_ticker:
        print("❌ No tickers found")
        return None
    
    # Get first account
    accounts_response = requests.get(f"{BASE_URL}/api/trading-accounts/")
    accounts_data = accounts_response.json()
    first_account = accounts_data.get('data', [{}])[0] if accounts_data.get('data') else None
    
    if not first_account:
        print("❌ No accounts found")
        return None
    
    trade_data = {
        "ticker_id": first_ticker['id'],
        "trading_account_id": first_account['id'],
        "side": "Long",  # "Long" or "Short"
        "planned_quantity": 100,
        "planned_amount": 15050,  # planned_quantity * entry_price
        "entry_price": 150.50,
        "status": "open",
        "investment_type": "swing"  # swing, investment, passive
    }
    
    response = requests.post(url, json=trade_data)
    if response.ok:
        result = response.json()
        print(f"✅ Created trade: {result.get('data', {}).get('id')}")
        return result.get('data')
    else:
        print(f"❌ Failed to create trade: {response.status_code} - {response.text}")
        return None

def create_sample_trade_plan():
    """Create a sample trade plan record"""
    url = f"{BASE_URL}/api/trade-plans/"
    
    # Get first ticker
    tickers_response = requests.get(f"{BASE_URL}/api/tickers/")
    tickers_data = tickers_response.json()
    first_ticker = tickers_data.get('data', [{}])[0] if tickers_data.get('data') else None
    
    if not first_ticker:
        print("❌ No tickers found")
        return None
    
    # Get first account
    accounts_response = requests.get(f"{BASE_URL}/api/trading-accounts/")
    accounts_data = accounts_response.json()
    first_account = accounts_data.get('data', [{}])[0] if accounts_data.get('data') else None
    
    if not first_account:
        print("❌ No accounts found")
        return None
    
    trade_plan_data = {
        "ticker_id": first_ticker['id'],
        "trading_account_id": first_account['id'],
        "side": "Long",  # "Long" or "Short"
        "planned_amount": 15050,
        "entry_price": 150.50,  # Required field
        "status": "open",
        "investment_type": "swing"
    }
    
    response = requests.post(url, json=trade_plan_data)
    if response.ok:
        result = response.json()
        print(f"✅ Created trade plan: {result.get('data', {}).get('id')}")
        return result.get('data')
    else:
        print(f"❌ Failed to create trade plan: {response.status_code} - {response.text}")
        return None

def create_sample_cash_flow():
    """Create a sample cash flow record"""
    url = f"{BASE_URL}/api/cash-flows/"
    
    # Get first account
    accounts_response = requests.get(f"{BASE_URL}/api/trading-accounts/")
    accounts_data = accounts_response.json()
    first_account = accounts_data.get('data', [{}])[0] if accounts_data.get('data') else None
    
    if not first_account:
        print("❌ No accounts found")
        return None
    
    # Get first currency
    currencies_response = requests.get(f"{BASE_URL}/api/currencies/")
    currencies_data = currencies_response.json()
    first_currency = currencies_data.get('data', [{}])[0] if currencies_data.get('data') else None
    
    if not first_currency:
        print("❌ No currencies found")
        return None
    
    cash_flow_data = {
        "trading_account_id": first_account['id'],
        "currency_id": first_currency['id'],
        "amount": 1000,
        "date": datetime.now().strftime("%Y-%m-%d"),  # YYYY-MM-DD
        "type": "deposit",
        "description": "Test deposit for testing"
    }
    
    response = requests.post(url, json=cash_flow_data)
    if response.ok:
        result = response.json()
        print(f"✅ Created cash flow: {result.get('data', {}).get('id')}")
        return result.get('data')
    else:
        print(f"❌ Failed to create cash flow: {response.status_code} - {response.text}")
        return None

def main():
    print("Creating sample records for testing...")
    print("=" * 50)
    
    trade = create_sample_trade()
    trade_plan = create_sample_trade_plan()
    cash_flow = create_sample_cash_flow()
    
    print("=" * 50)
    print("Summary:")
    print(f"  Trade: {'✅' if trade else '❌'}")
    print(f"  Trade Plan: {'✅' if trade_plan else '❌'}")
    print(f"  Cash Flow: {'✅' if cash_flow else '❌'}")

if __name__ == "__main__":
    main()

