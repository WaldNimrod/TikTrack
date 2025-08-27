#!/usr/bin/env python3
"""
Script to validate full compatibility between alerts table constraints and frontend interfaces
"""
import sqlite3
import os
from datetime import datetime

def validate_alerts_compatibility():
    # Path to database
    db_path = 'db/simpleTrade_new.db'
    
    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        return
    
    # Connect to database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print("🔍 Validating alerts table compatibility...")
    
    # 1. Check table schema
    print("\n📋 1. Table Schema Validation:")
    cursor.execute("PRAGMA table_info(alerts)")
    columns = cursor.fetchall()
    
    required_columns = {
        'id': 'INTEGER PRIMARY KEY',
        'type': 'VARCHAR(50)',
        'condition': 'VARCHAR(500)',
        'condition_attribute': 'VARCHAR(50)',
        'condition_operator': 'VARCHAR(50)',
        'condition_number': 'DECIMAL(10,2)',
        'message': 'VARCHAR(500)',
        'status': 'VARCHAR(20)',
        'is_triggered': 'VARCHAR(20)',
        'related_type_id': 'INTEGER',
        'related_id': 'INTEGER',
        'created_at': 'DATETIME'
    }
    
    schema_valid = True
    for col_name, expected_type in required_columns.items():
        found = False
        for col in columns:
            if col[1] == col_name:
                found = True
                print(f"  ✅ {col_name}: {col[2]} (expected: {expected_type})")
                break
        if not found:
            print(f"  ❌ {col_name}: Missing")
            schema_valid = False
    
    # 2. Check data integrity
    print("\n📋 2. Data Integrity Validation:")
    
    # Check for alerts with missing condition fields
    cursor.execute("""
        SELECT COUNT(*) FROM alerts 
        WHERE condition_attribute IS NULL OR condition_operator IS NULL OR condition_number IS NULL
    """)
    missing_conditions = cursor.fetchone()[0]
    print(f"  {'❌' if missing_conditions > 0 else '✅'} Alerts with missing condition fields: {missing_conditions}")
    
    # Check for alerts with invalid condition_attribute values
    valid_attributes = ['price', 'change', 'ma', 'volume']
    cursor.execute("""
        SELECT COUNT(*) FROM alerts 
        WHERE condition_attribute NOT IN (?, ?, ?, ?)
    """, valid_attributes)
    invalid_attributes = cursor.fetchone()[0]
    print(f"  {'❌' if invalid_attributes > 0 else '✅'} Alerts with invalid condition_attribute: {invalid_attributes}")
    
    # Check for alerts with invalid condition_operator values
    valid_operators = ['more_than', 'less_than', 'cross', 'cross_up', 'cross_down', 
                      'change', 'change_up', 'change_down', 'equals']
    cursor.execute("""
        SELECT COUNT(*) FROM alerts 
        WHERE condition_operator NOT IN (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, valid_operators)
    invalid_operators = cursor.fetchone()[0]
    print(f"  {'❌' if invalid_operators > 0 else '✅'} Alerts with invalid condition_operator: {invalid_operators}")
    
    # Check for alerts with invalid status values
    valid_statuses = ['open', 'closed', 'cancelled']
    cursor.execute("""
        SELECT COUNT(*) FROM alerts 
        WHERE status NOT IN (?, ?, ?)
    """, valid_statuses)
    invalid_statuses = cursor.fetchone()[0]
    print(f"  {'❌' if invalid_statuses > 0 else '✅'} Alerts with invalid status: {invalid_statuses}")
    
    # Check for alerts with invalid is_triggered values
    valid_triggered = ['false', 'true', 'new']
    cursor.execute("""
        SELECT COUNT(*) FROM alerts 
        WHERE is_triggered NOT IN (?, ?, ?)
    """, valid_triggered)
    invalid_triggered = cursor.fetchone()[0]
    print(f"  {'❌' if invalid_triggered > 0 else '✅'} Alerts with invalid is_triggered: {invalid_triggered}")
    
    # Check for alerts with invalid related_type_id values
    valid_related_types = [1, 2, 3, 4]  # account, trade, trade_plan, ticker
    cursor.execute("""
        SELECT COUNT(*) FROM alerts 
        WHERE related_type_id NOT IN (?, ?, ?, ?)
    """, valid_related_types)
    invalid_related_types = cursor.fetchone()[0]
    print(f"  {'❌' if invalid_related_types > 0 else '✅'} Alerts with invalid related_type_id: {invalid_related_types}")
    
    # 3. Check condition field consistency
    print("\n📋 3. Condition Field Consistency:")
    
    # Check legacy condition format
    cursor.execute("""
        SELECT COUNT(*) FROM alerts 
        WHERE condition NOT LIKE '% | % | %'
    """)
    invalid_legacy_format = cursor.fetchone()[0]
    print(f"  {'❌' if invalid_legacy_format > 0 else '✅'} Alerts with invalid legacy condition format: {invalid_legacy_format}")
    
    # Check if new fields match legacy condition
    cursor.execute("""
        SELECT COUNT(*) FROM alerts 
        WHERE condition != (condition_attribute || ' | ' || condition_operator || ' | ' || condition_number)
    """)
    mismatched_conditions = cursor.fetchone()[0]
    print(f"  {'❌' if mismatched_conditions > 0 else '✅'} Alerts with mismatched condition fields: {mismatched_conditions}")
    
    # 4. Check data distribution
    print("\n📋 4. Data Distribution Analysis:")
    
    # Status distribution
    cursor.execute("SELECT status, COUNT(*) FROM alerts GROUP BY status ORDER BY COUNT(*) DESC")
    status_dist = cursor.fetchall()
    print("  Status distribution:")
    for status, count in status_dist:
        print(f"    - {status}: {count} alerts")
    
    # Type distribution
    cursor.execute("SELECT type, COUNT(*) FROM alerts GROUP BY type ORDER BY COUNT(*) DESC")
    type_dist = cursor.fetchall()
    print("  Type distribution:")
    for alert_type, count in type_dist:
        print(f"    - {alert_type}: {count} alerts")
    
    # Related type distribution
    cursor.execute("SELECT related_type_id, COUNT(*) FROM alerts GROUP BY related_type_id ORDER BY COUNT(*) DESC")
    related_dist = cursor.fetchall()
    print("  Related type distribution:")
    type_names = {1: 'Account', 2: 'Trade', 3: 'Trade Plan', 4: 'Ticker'}
    for related_type, count in related_dist:
        type_name = type_names.get(related_type, f'Unknown({related_type})')
        print(f"    - {type_name}: {count} alerts")
    
    # Condition attribute distribution
    cursor.execute("SELECT condition_attribute, COUNT(*) FROM alerts GROUP BY condition_attribute ORDER BY COUNT(*) DESC")
    attr_dist = cursor.fetchall()
    print("  Condition attribute distribution:")
    for attr, count in attr_dist:
        print(f"    - {attr}: {count} alerts")
    
    # Condition operator distribution
    cursor.execute("SELECT condition_operator, COUNT(*) FROM alerts GROUP BY condition_operator ORDER BY COUNT(*) DESC")
    op_dist = cursor.fetchall()
    print("  Condition operator distribution:")
    for op, count in op_dist:
        print(f"    - {op}: {count} alerts")
    
    # 5. Check for potential issues
    print("\n📋 5. Potential Issues Check:")
    
    # Check for alerts with zero or negative condition_number
    cursor.execute("SELECT COUNT(*) FROM alerts WHERE CAST(condition_number AS REAL) <= 0")
    zero_numbers = cursor.fetchone()[0]
    print(f"  {'⚠️' if zero_numbers > 0 else '✅'} Alerts with zero/negative condition_number: {zero_numbers}")
    
    # Check for alerts without messages
    cursor.execute("SELECT COUNT(*) FROM alerts WHERE message IS NULL OR message = ''")
    empty_messages = cursor.fetchone()[0]
    print(f"  {'⚠️' if empty_messages > 0 else '✅'} Alerts without messages: {empty_messages}")
    
    # Check for alerts with very old creation dates
    cursor.execute("SELECT COUNT(*) FROM alerts WHERE created_at < '2025-01-01'")
    old_alerts = cursor.fetchone()[0]
    print(f"  {'⚠️' if old_alerts > 0 else '✅'} Alerts with very old creation dates: {old_alerts}")
    
    # 6. Frontend compatibility check
    print("\n📋 6. Frontend Compatibility Check:")
    
    # Check if all alerts have valid data for frontend display
    cursor.execute("""
        SELECT COUNT(*) FROM alerts 
        WHERE id IS NULL OR type IS NULL OR status IS NULL OR is_triggered IS NULL
    """)
    missing_display_data = cursor.fetchone()[0]
    print(f"  {'❌' if missing_display_data > 0 else '✅'} Alerts missing display data: {missing_display_data}")
    
    # Check if all alerts have valid related objects
    cursor.execute("""
        SELECT COUNT(*) FROM alerts 
        WHERE related_id IS NULL OR related_type_id IS NULL
    """)
    missing_related_data = cursor.fetchone()[0]
    print(f"  {'❌' if missing_related_data > 0 else '✅'} Alerts missing related object data: {missing_related_data}")
    
    # 7. Summary
    print("\n📋 7. Compatibility Summary:")
    
    total_alerts = cursor.fetchone()[0] if cursor.execute("SELECT COUNT(*) FROM alerts") else 0
    
    issues = []
    if not schema_valid:
        issues.append("Schema validation failed")
    if missing_conditions > 0:
        issues.append(f"Missing condition fields: {missing_conditions}")
    if invalid_attributes > 0:
        issues.append(f"Invalid condition attributes: {invalid_attributes}")
    if invalid_operators > 0:
        issues.append(f"Invalid condition operators: {invalid_operators}")
    if invalid_statuses > 0:
        issues.append(f"Invalid statuses: {invalid_statuses}")
    if invalid_triggered > 0:
        issues.append(f"Invalid triggered states: {invalid_triggered}")
    if invalid_related_types > 0:
        issues.append(f"Invalid related types: {invalid_related_types}")
    if invalid_legacy_format > 0:
        issues.append(f"Invalid legacy condition format: {invalid_legacy_format}")
    if mismatched_conditions > 0:
        issues.append(f"Mismatched condition fields: {mismatched_conditions}")
    
    if issues:
        print(f"  ❌ Found {len(issues)} compatibility issues:")
        for issue in issues:
            print(f"    - {issue}")
    else:
        print(f"  ✅ All compatibility checks passed!")
    
    print(f"  📊 Total alerts validated: {total_alerts}")
    
    conn.close()
    return len(issues) == 0

if __name__ == "__main__":
    validate_alerts_compatibility()


