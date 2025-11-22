#!/usr/bin/env python3
"""
Test script to verify linked items API returns all required fields for all entity types
"""

import sys
import os
import json
from pathlib import Path

# Add Backend to path
BACKEND_DIR = Path(__file__).parent.parent
sys.path.insert(0, str(BACKEND_DIR))

# Change to Backend directory for imports
os.chdir(str(BACKEND_DIR))

from routes.api.linked_items import (
    get_child_entities, 
    get_parent_entities,
    get_trade_child_entities,
    get_account_child_entities,
    get_ticker_child_entities,
    get_execution_parent_entities,
    get_cash_flow_parent_entities
)
import sqlite3

# Required fields according to specification
REQUIRED_FIELDS = {
    'base': ['id', 'type', 'title', 'description', 'created_at', 'status'],
    'trade': ['id', 'type', 'title', 'description', 'created_at', 'status', 'side', 'investment_type'],
    'trade_plan': ['id', 'type', 'title', 'description', 'created_at', 'status', 'side', 'investment_type'],
    'execution': ['id', 'type', 'title', 'description', 'created_at', 'status'],
    'cash_flow': ['id', 'type', 'title', 'description', 'created_at', 'status'],
    'note': ['id', 'type', 'title', 'description', 'created_at', 'status'],
    'alert': ['id', 'type', 'title', 'description', 'created_at', 'status'],
    'trading_account': ['id', 'type', 'title', 'description', 'created_at', 'status']
}

def get_db_connection():
    """Get database connection"""
    # Use Backend directory as base
    DB_PATH = BACKEND_DIR / "db" / "tiktrack.db"
    
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def check_fields(entity, entity_type, required_fields):
    """Check if entity has all required fields"""
    missing_fields = []
    for field in required_fields:
        if field not in entity:
            missing_fields.append(field)
        elif entity[field] is None and field in ['title', 'description', 'status']:
            missing_fields.append(f"{field} (is None)")
    
    return missing_fields

def test_trade_child_entities():
    """Test trade child entities"""
    print("\n=== Testing Trade Child Entities ===")
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get a trade ID
    cursor.execute("SELECT id FROM trades LIMIT 1")
    row = cursor.fetchone()
    if not row:
        print("⚠️  No trades found in database")
        return
    
    trade_id = row['id']
    print(f"Testing with trade_id: {trade_id}")
    
    children = get_trade_child_entities(cursor, trade_id)
    print(f"Found {len(children)} child entities")
    
    for i, child in enumerate(children):
        print(f"\n  Child {i+1}: type={child.get('type')}, id={child.get('id')}")
        required = REQUIRED_FIELDS.get(child.get('type', ''), REQUIRED_FIELDS['base'])
        missing = check_fields(child, child.get('type'), required)
        if missing:
            print(f"    ❌ Missing fields: {missing}")
            print(f"    Available fields: {list(child.keys())}")
        else:
            print(f"    ✅ All required fields present")
            # Print sample values
            print(f"    Sample: title='{child.get('title')}', description='{child.get('description', '')[:50]}...'")
    
    conn.close()

def test_account_child_entities():
    """Test account child entities"""
    print("\n=== Testing Account Child Entities ===")
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get an account ID
    cursor.execute("SELECT id FROM trading_accounts LIMIT 1")
    row = cursor.fetchone()
    if not row:
        print("⚠️  No accounts found in database")
        return
    
    account_id = row['id']
    print(f"Testing with account_id: {account_id}")
    
    children = get_account_child_entities(cursor, account_id)
    print(f"Found {len(children)} child entities")
    
    for i, child in enumerate(children):
        print(f"\n  Child {i+1}: type={child.get('type')}, id={child.get('id')}")
        required = REQUIRED_FIELDS.get(child.get('type', ''), REQUIRED_FIELDS['base'])
        missing = check_fields(child, child.get('type'), required)
        if missing:
            print(f"    ❌ Missing fields: {missing}")
            print(f"    Available fields: {list(child.keys())}")
        else:
            print(f"    ✅ All required fields present")
            # Print sample values
            print(f"    Sample: title='{child.get('title')}', description='{child.get('description', '')[:50]}...'")
    
    conn.close()

def test_ticker_child_entities():
    """Test ticker child entities"""
    print("\n=== Testing Ticker Child Entities ===")
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get a ticker ID
    cursor.execute("SELECT id FROM tickers LIMIT 1")
    row = cursor.fetchone()
    if not row:
        print("⚠️  No tickers found in database")
        return
    
    ticker_id = row['id']
    print(f"Testing with ticker_id: {ticker_id}")
    
    children = get_ticker_child_entities(cursor, ticker_id)
    print(f"Found {len(children)} child entities")
    
    for i, child in enumerate(children):
        print(f"\n  Child {i+1}: type={child.get('type')}, id={child.get('id')}")
        required = REQUIRED_FIELDS.get(child.get('type', ''), REQUIRED_FIELDS['base'])
        missing = check_fields(child, child.get('type'), required)
        if missing:
            print(f"    ❌ Missing fields: {missing}")
            print(f"    Available fields: {list(child.keys())}")
        else:
            print(f"    ✅ All required fields present")
            # Print sample values
            print(f"    Sample: title='{child.get('title')}', description='{child.get('description', '')[:50]}...'")
    
    conn.close()

def test_execution_parent_entities():
    """Test execution parent entities"""
    print("\n=== Testing Execution Parent Entities ===")
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get an execution ID
    cursor.execute("SELECT id FROM executions LIMIT 1")
    row = cursor.fetchone()
    if not row:
        print("⚠️  No executions found in database")
        return
    
    execution_id = row['id']
    print(f"Testing with execution_id: {execution_id}")
    
    parents = get_execution_parent_entities(cursor, execution_id)
    print(f"Found {len(parents)} parent entities")
    
    for i, parent in enumerate(parents):
        print(f"\n  Parent {i+1}: type={parent.get('type')}, id={parent.get('id')}")
        required = REQUIRED_FIELDS.get(parent.get('type', ''), REQUIRED_FIELDS['base'])
        missing = check_fields(parent, parent.get('type'), required)
        if missing:
            print(f"    ❌ Missing fields: {missing}")
            print(f"    Available fields: {list(parent.keys())}")
        else:
            print(f"    ✅ All required fields present")
            # Print sample values
            print(f"    Sample: title='{parent.get('title')}', description='{parent.get('description', '')[:50]}...'")
    
    conn.close()

def test_cash_flow_parent_entities():
    """Test cash flow parent entities"""
    print("\n=== Testing Cash Flow Parent Entities ===")
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get a cash flow ID
    cursor.execute("SELECT id FROM cash_flows LIMIT 1")
    row = cursor.fetchone()
    if not row:
        print("⚠️  No cash flows found in database")
        return
    
    cash_flow_id = row['id']
    print(f"Testing with cash_flow_id: {cash_flow_id}")
    
    parents = get_cash_flow_parent_entities(cursor, cash_flow_id)
    print(f"Found {len(parents)} parent entities")
    
    for i, parent in enumerate(parents):
        print(f"\n  Parent {i+1}: type={parent.get('type')}, id={parent.get('id')}")
        required = REQUIRED_FIELDS.get(parent.get('type', ''), REQUIRED_FIELDS['base'])
        missing = check_fields(parent, parent.get('type'), required)
        if missing:
            print(f"    ❌ Missing fields: {missing}")
            print(f"    Available fields: {list(parent.keys())}")
        else:
            print(f"    ✅ All required fields present")
            # Print sample values
            print(f"    Sample: title='{parent.get('title')}', description='{parent.get('description', '')[:50]}...'")
    
    conn.close()

def main():
    """Run all tests"""
    print("=" * 60)
    print("Linked Items API Fields Verification Test")
    print("=" * 60)
    
    test_trade_child_entities()
    test_account_child_entities()
    test_ticker_child_entities()
    test_execution_parent_entities()
    test_cash_flow_parent_entities()
    
    print("\n" + "=" * 60)
    print("Test completed!")
    print("=" * 60)

if __name__ == '__main__':
    main()

