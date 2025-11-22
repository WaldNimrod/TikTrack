#!/usr/bin/env python3
"""
Check Session Records - Check what data is in the records
"""

import sys
import os
import sqlite3
import json
from pathlib import Path

# Get database path
backend_dir = Path(__file__).parent.parent
db_path = backend_dir / 'db' / 'tiktrack.db'

if not db_path.exists():
    print(f"❌ Database not found at: {db_path}")
    sys.exit(1)

conn = sqlite3.connect(str(db_path))
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

# Get last import session
cursor.execute("""
    SELECT id, status, provider, connector_type, summary_data
    FROM import_sessions
    ORDER BY id DESC
    LIMIT 1
""")
session_row = cursor.fetchone()

if not session_row:
    print("❌ No import sessions found")
    sys.exit(1)

session_id = session_row['id']
print(f"📋 Last Import Session: {session_id}")
print(f"  Status: {session_row['status']}")
print(f"  Provider: {session_row['provider'] or session_row['connector_type']}")

# Parse summary_data
summary_data_str = session_row['summary_data']
if summary_data_str:
    try:
        if isinstance(summary_data_str, str):
            summary_data = json.loads(summary_data_str)
        else:
            summary_data = summary_data_str
        
        # Check preview_data
        preview_data = summary_data.get('preview_data', {})
        records_to_import = preview_data.get('records_to_import', [])
        
        print(f"\n📊 Records in Preview: {len(records_to_import)}")
        
        # Check first few records for section field
        for i, rec in enumerate(records_to_import[:5]):
            # Handle both formats
            if isinstance(rec, dict) and 'record' in rec:
                record = rec['record']
            else:
                record = rec
            
            section = record.get('section')
            cashflow_type = record.get('cashflow_type') or record.get('type')
            storage_type = record.get('storage_type')
            
            print(f"\n  Record {i+1}:")
            print(f"    section: {section}")
            print(f"    cashflow_type: {cashflow_type}")
            print(f"    storage_type: {storage_type}")
            print(f"    amount: {record.get('amount')}")
            print(f"    currency: {record.get('currency')}")
            
            # Show all keys
            print(f"    All keys: {list(record.keys())}")
        
        # Check raw_records
        raw_records = summary_data.get('raw_records', [])
        print(f"\n📋 Raw Records: {len(raw_records)}")
        
        if raw_records:
            # Check first raw record
            first_raw = raw_records[0]
            if isinstance(first_raw, dict):
                print(f"  First raw record keys: {list(first_raw.keys())}")
                print(f"  First raw record section: {first_raw.get('section')}")
    except Exception as e:
        print(f"❌ Error parsing summary_data: {e}")
        import traceback
        traceback.print_exc()

conn.close()

