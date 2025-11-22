#!/usr/bin/env python3
"""
Check Import Tags - Verify tags on imported cash flows

This script checks the last import session and verifies if tags were assigned.
"""

import sys
import os
import sqlite3
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
    SELECT id, status, provider, connector_type, created_at, completed_at, imported_records
    FROM import_sessions
    ORDER BY id DESC
    LIMIT 1
""")
session_row = cursor.fetchone()

if not session_row:
    print("❌ No import sessions found")
    sys.exit(1)

session_id = session_row['id']
print(f"📋 Last Import Session:")
print(f"  ID: {session_id}")
print(f"  Status: {session_row['status']}")
print(f"  Provider: {session_row['provider'] or session_row['connector_type']}")
print(f"  Created: {session_row['created_at']}")
print(f"  Completed: {session_row['completed_at']}")
print(f"  Imported Records: {session_row['imported_records']}")

# Get cash flows from this session (by external_id pattern or source)
cursor.execute("""
    SELECT id, type, amount, currency_id, date, description, external_id, source
    FROM cash_flows
    WHERE source = 'file_import'
    ORDER BY id DESC
    LIMIT 20
""")
cash_flows = cursor.fetchall()

print(f"\n💰 Recent Imported Cash Flows: {len(cash_flows)}")

# Check tags for each cash flow
tagged_count = 0
untagged_count = 0
tag_details = []

for cf in cash_flows:
    cf_id = cf['id']
    
    # Get tags for this cash flow
    cursor.execute("""
        SELECT t.id, t.name, t.category_id, tc.name as category_name
        FROM tags t
        JOIN tag_links tl ON t.id = tl.tag_id
        LEFT JOIN tag_categories tc ON t.category_id = tc.id
        WHERE tl.entity_type = 'cash_flow' AND tl.entity_id = ?
    """, (cf_id,))
    
    tags = cursor.fetchall()
    
    if tags:
        tagged_count += 1
        for tag in tags:
            tag_details.append({
                'cashflow_id': cf_id,
                'cashflow_type': cf['type'],
                'tag_name': tag['name'],
                'category_name': tag['category_name']
            })
    else:
        untagged_count += 1
        print(f"  ⚠️  Cash Flow {cf_id}: type={cf['type']}, amount={cf['amount']}, NO TAGS")
        print(f"      external_id: {cf['external_id']}")

print(f"\n📊 Tag Summary:")
print(f"  ✅ Tagged: {tagged_count}")
print(f"  ❌ Untagged: {untagged_count}")

if tag_details:
    print(f"\n🏷️  Tag Details (first 10):")
    for detail in tag_details[:10]:
        print(f"  Cash Flow {detail['cashflow_id']} ({detail['cashflow_type']}): {detail['tag_name']} [{detail['category_name']}]")

# Check if tags exist in database
cursor.execute("""
    SELECT name, category_id
    FROM tags
    WHERE LOWER(name) IN ('dividends', 'interest', 'deposits & withdrawals', 'withholding tax', 'borrow fee details', 'transfers', 'forex conversion')
    ORDER BY name
""")
existing_tags = cursor.fetchall()

print(f"\n🏷️  Available Import Tags in Database: {len(existing_tags)}")
for tag in existing_tags:
    cursor.execute("SELECT name FROM tag_categories WHERE id = ?", (tag['category_id'],))
    cat_row = cursor.fetchone()
    cat_name = cat_row['name'] if cat_row else 'N/A'
    print(f"  - {tag['name']} (Category: {cat_name})")

conn.close()

