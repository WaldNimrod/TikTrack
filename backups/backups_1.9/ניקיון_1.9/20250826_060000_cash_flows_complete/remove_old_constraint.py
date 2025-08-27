#!/usr/bin/env python3
"""
Script to remove the old CHECK constraint from alerts table
"""
import sqlite3
import os

def remove_old_constraint():
    # Path to database
    db_path = 'db/simpleTrade_new.db'
    
    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        return
    
    # Connect to database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print("Removing old CHECK constraint from alerts table...")
    
    # Create a new table without the CHECK constraint
    cursor.execute("""
        CREATE TABLE alerts_new (
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
            related_type_id_default INTEGER DEFAULT 4,
            condition_attribute VARCHAR(50),
            condition_operator VARCHAR(50),
            condition_number DECIMAL(10,2)
        )
    """)
    
    # Copy all data from old table to new table
    cursor.execute("""
        INSERT INTO alerts_new 
        SELECT * FROM alerts
    """)
    
    # Drop the old table
    cursor.execute("DROP TABLE alerts")
    
    # Rename new table to original name
    cursor.execute("ALTER TABLE alerts_new RENAME TO alerts")
    
    # Recreate indexes
    cursor.execute("CREATE INDEX idx_alerts_type ON alerts(type)")
    cursor.execute("CREATE INDEX idx_alerts_status ON alerts(status)")
    cursor.execute("CREATE INDEX idx_alerts_is_triggered ON alerts(is_triggered)")
    cursor.execute("CREATE INDEX idx_alerts_related_type_id ON alerts(related_type_id)")
    cursor.execute("CREATE INDEX idx_alerts_created_at ON alerts(created_at)")
    
    # Commit changes
    conn.commit()
    
    print("✅ Old CHECK constraint removed successfully!")
    
    # Verify the new schema
    cursor.execute("PRAGMA table_info(alerts)")
    columns = cursor.fetchall()
    
    print("\n📋 New table schema:")
    for col in columns:
        print(f"  - {col[1]} {col[2]}")
    
    conn.close()

if __name__ == "__main__":
    remove_old_constraint()
