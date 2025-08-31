#!/usr/bin/env python3
"""
Script to update alert constraints from old format to new format
"""
import sqlite3
import os

def update_alert_constraints():
    # Path to database
    db_path = 'db/simpleTrade_new.db'
    
    if not os.path.exists(db_path):
        return
    
    # Connect to database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    
    # Create backup
    cursor.execute("CREATE TABLE IF NOT EXISTS alerts_backup_old AS SELECT * FROM alerts")
    
    # Remove the old CHECK constraint by recreating the table
    
    # Get current data
    cursor.execute("SELECT * FROM alerts")
    alerts_data = cursor.fetchall()
    
    # Get column names
    cursor.execute("PRAGMA table_info(alerts)")
    columns_info = cursor.fetchall()
    column_names = [col[1] for col in columns_info]
    
    # Drop old table
    cursor.execute("DROP TABLE alerts")
    
    # Create new table without the old CHECK constraint
    create_table_sql = """
    CREATE TABLE alerts (
        account_id INTEGER,
        ticker_id INTEGER,
        type VARCHAR(50) NOT NULL,
        condition VARCHAR(500) NOT NULL,
        message VARCHAR(500),
        is_active BOOLEAN,
        triggered_at DATETIME,
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) DEFAULT 'open',
        is_triggered VARCHAR(20) DEFAULT 'false',
        related_type_id INTEGER,
        related_id INTEGER,
        type_default VARCHAR(50) DEFAULT 'price',
        related_type_id_default INTEGER DEFAULT 4
    )
    """
    cursor.execute(create_table_sql)
    
    # Recreate indexes
    cursor.execute("CREATE INDEX idx_alerts_type ON alerts(type)")
    cursor.execute("CREATE INDEX idx_alerts_status ON alerts(status)")
    cursor.execute("CREATE INDEX idx_alerts_is_triggered ON alerts(is_triggered)")
    cursor.execute("CREATE INDEX idx_alerts_related_type_id ON alerts(related_type_id)")
    cursor.execute("CREATE INDEX idx_alerts_created_at ON alerts(created_at)")
    
    
    # Insert data back
    if alerts_data:
        placeholders = ','.join(['?' for _ in column_names])
        insert_sql = f"INSERT INTO alerts ({','.join(column_names)}) VALUES ({placeholders})"
        cursor.executemany(insert_sql, alerts_data)
    
    # Define condition mapping to new format
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
        'entry_condition': 'price | cross | 0',
        'balance_low': 'price | lessThen | 0',
        'profit_milestone': 'price | moreThen | 0'
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
            updated_count += cursor.rowcount
    
    # For any remaining conditions that don't follow the format, set a default
    cursor.execute("""
        UPDATE alerts 
        SET condition = 'price | moreThen | 0' 
        WHERE condition NOT LIKE '%|%'
    """)
    
    remaining_updated = cursor.rowcount
    if remaining_updated > 0:
        updated_count += remaining_updated
    
    # Commit changes
    conn.commit()
    
    # Show results
    
    # Show current conditions
    cursor.execute("SELECT DISTINCT condition FROM alerts LIMIT 10")
    current_conditions = cursor.fetchall()
    for condition in current_conditions:
    
    conn.close()

if __name__ == "__main__":
    update_alert_constraints()
