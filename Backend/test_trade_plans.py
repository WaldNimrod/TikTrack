#!/usr/bin/env python3
import requests
import json

def test_trade_plans_api():
    """בדיקת trade_plans API"""
    try:
        # בדיקת trade_plans
        response = requests.get('http://localhost:8080/api/v1/trade_plans/')
        print(f"Trade Plans Status: {response.status_code}")
        print(f"Trade Plans Response: {response.text}")
        
        # בדיקת trades
        response = requests.get('http://localhost:8080/api/v1/trades/')
        print(f"\nTrades Status: {response.status_code}")
        print(f"Trades Response: {response.text[:200]}...")
        
        # בדיקת accounts
        response = requests.get('http://localhost:8080/api/v1/accounts/')
        print(f"\nAccounts Status: {response.status_code}")
        print(f"Accounts Response: {response.text[:200]}...")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_trade_plans_api()
