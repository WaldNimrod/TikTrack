#!/usr/bin/env python3
"""
Script to fix alert conditions to match the new constraint format
"""
import sqlite3
import os

def fix_alert_conditions():
    # Path to database
    db_path = 'db/simpleTrade_new.db'
    
    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        return
    
    # Connect to database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Create backup
    cursor.execute("CREATE TABLE IF NOT EXISTS alerts_backup AS SELECT * FROM alerts")
    print("Created backup table alerts_backup")
    
    # Define condition mapping
    condition_mapping = {
        'below': 'price | lessThen | 0',
        'above': 'price | moreThen | 0', 
        'equals': 'price | equals | 0',
        'price_target': 'price | moreThen | 0',
        'volume_high': 'volume | moreThen | 0',
        'stop_loss': 'price | lessThen | 0',
        'breakout': 'price | moreThen | 0',
        'daily_change_positive': 'change | moreThen | 0',
        'profit_target': 'price | moreThen | 0',
        'entry_condition': 'price | cross | 0'
    }
    
    # Update each condition based on mapping
    updated_count = 0
    for old_condition, new_condition in condition_mapping.items():
        cursor.execute("""
            UPDATE alerts 
            SET condition = ? 
            WHERE condition = ?
        """, (new_condition, old_condition))
        
        if cursor.rowcount > 0:
            print(f"Updated {cursor.rowcount} alerts from '{old_condition}' to '{new_condition}'")
            updated_count += cursor.rowcount
    
    # For any remaining conditions that don't follow the format, set a default
    cursor.execute("""
        UPDATE alerts 
        SET condition = 'price | moreThen | 0' 
        WHERE condition NOT LIKE '%|%'
    """)
    
    remaining_updated = cursor.rowcount
    if remaining_updated > 0:
        print(f"Updated {remaining_updated} alerts with default condition")
        updated_count += remaining_updated
    
    # Commit changes
    conn.commit()
    
    # Show results
    print(f"\nTotal alerts updated: {updated_count}")
    
    # Show current conditions
    cursor.execute("SELECT DISTINCT condition FROM alerts LIMIT 10")
    current_conditions = cursor.fetchall()
    print("\nCurrent conditions in database:")
    for condition in current_conditions:
        print(f"  - {condition[0]}")
    
    conn.close()
    print("\nAlert conditions fixed successfully!")

if __name__ == "__main__":
    fix_alert_conditions()
