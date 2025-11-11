#!/usr/bin/env python3
"""
List all database tables and record counts
"""
import sqlite3
import sys
from pathlib import Path

from config.settings import DB_PATH

# Database path
db_path = Path(DB_PATH)

if not db_path.exists():
    print(f"❌ Database not found at: {db_path}")
    sys.exit(1)

conn = sqlite3.connect(str(db_path))
cursor = conn.cursor()

# Get all tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
tables = [row[0] for row in cursor.fetchall()]

# Count records in each table
table_counts = []
for table in tables:
    try:
        cursor.execute(f'SELECT COUNT(*) FROM "{table}"')
        count = cursor.fetchone()[0]
        table_counts.append((table, count))
    except Exception as e:
        table_counts.append((table, f"Error: {str(e)}"))

# Sort by count descending
table_counts.sort(key=lambda x: x[1] if isinstance(x[1], int) else -1, reverse=True)

# Print results
print("=" * 85)
print("רשימת טבלאות ומספר רשומות בבסיס הנתונים - TikTrack")
print("=" * 85)
print(f"\n{'טבלה':<45} {'מספר רשומות':>20}")
print("-" * 85)

total_records = 0
for table, count in table_counts:
    if isinstance(count, int):
        total_records += count
        print(f"{table:<45} {count:>20,}")
    else:
        print(f"{table:<45} {str(count):>20}")

print("-" * 85)
total_label = "סה\"כ רשומות"
total_tables_label = "סה\"כ טבלאות"
print(f"{total_label:<45} {total_records:>20,}")
print(f"{total_tables_label:<45} {len(tables):>20}")
print("=" * 85)

conn.close()


