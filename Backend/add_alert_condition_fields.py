#!/usr/bin/env python3
"""
Migration script to replace condition field with three separate fields:
1. condition_attribute - price, change, ma, volume
2. condition_operator - more_than, less_than, cross, cross_up, cross_down, change, change_up, change_down
3. condition_number - numeric value > 0
"""
import sqlite3
import os

def add_alert_condition_fields():
    # Path to database
    db_path = 'db/simpleTrade_new.db'
    
    if not os.path.exists(db_path):
        return
    
    # Connect to database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    
    # Create backup
    cursor.execute("CREATE TABLE IF NOT EXISTS alerts_backup_condition AS SELECT * FROM alerts")
    
    # Add new fields
    
    # Add condition_attribute field
    cursor.execute("ALTER TABLE alerts ADD COLUMN condition_attribute VARCHAR(50)")
    
    # Add condition_operator field  
    cursor.execute("ALTER TABLE alerts ADD COLUMN condition_operator VARCHAR(50)")
    
    # Add condition_number field
    cursor.execute("ALTER TABLE alerts ADD COLUMN condition_number DECIMAL(10,2)")
    
    # Define mapping from old conditions to new fields
    condition_mapping = {
        'below': ('price', 'less_than', 0),
        'above': ('price', 'more_than', 0),
        'equals': ('price', 'equals', 0),
        'price_target': ('price', 'more_than', 0),
        'volume_high': ('volume', 'more_than', 0),
        'stop_loss': ('price', 'less_than', 0),
        'breakout': ('price', 'more_than', 0),
        'daily_change_positive': ('change', 'more_than', 0),
        'profit_target': ('price', 'more_than', 0),
        'entry_condition': ('price', 'cross', 0),
        'balance_low': ('price', 'less_than', 0),
        'profit_milestone': ('price', 'more_than', 0)
    }
    
    # Update existing records
    updated_count = 0
    for old_condition, (attribute, operator, number) in condition_mapping.items():
        cursor.execute("""
            UPDATE alerts 
            SET condition_attribute = ?, condition_operator = ?, condition_number = ?
            WHERE condition = ?
        """, (attribute, operator, number, old_condition))
        
        if cursor.rowcount > 0:
            updated_count += cursor.rowcount
    
    # Set default values for any remaining records
    cursor.execute("""
        UPDATE alerts 
        SET condition_attribute = 'price', condition_operator = 'more_than', condition_number = 0
        WHERE condition_attribute IS NULL
    """)
    
    remaining_updated = cursor.rowcount
    if remaining_updated > 0:
        updated_count += remaining_updated
    
    # Add constraints
    
    # Constraint for condition_attribute
    cursor.execute("""
        UPDATE alerts 
        SET condition_attribute = 'price' 
        WHERE condition_attribute NOT IN ('price', 'change', 'ma', 'volume')
    """)
    
    # Constraint for condition_operator  
    cursor.execute("""
        UPDATE alerts 
        SET condition_operator = 'more_than' 
        WHERE condition_operator NOT IN ('more_than', 'less_than', 'cross', 'cross_up', 'cross_down', 'change', 'change_up', 'change_down', 'equals')
    """)
    
    # Constraint for condition_number
    cursor.execute("""
        UPDATE alerts 
        SET condition_number = 0 
        WHERE condition_number IS NULL OR condition_number < 0
    """)
    
    # Commit changes
    conn.commit()
    
    # Show results
    
    # Show sample data
    cursor.execute("""
        SELECT condition_attribute, condition_operator, condition_number, COUNT(*) as count 
        FROM alerts 
        GROUP BY condition_attribute, condition_operator, condition_number 
        ORDER BY count DESC 
        LIMIT 5
    """)
    
    for row in cursor.fetchall():
    
    conn.close()

if __name__ == "__main__":
    add_alert_condition_fields()
