#!/usr/bin/env python3
"""
Migration: Add condition linking fields to alerts table
Adds plan_condition_id and trade_condition_id fields to link alerts to conditions
"""

import sqlite3
import os
import sys
from pathlib import Path

def get_database_path():
    """Get the database path"""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.dirname(current_dir)
    db_path = os.path.join(backend_dir, "db", "simpleTrade_new.db")
    return db_path

def upgrade(conn: sqlite3.Connection):
    """Add condition linking fields to alerts table"""
    cursor = conn.cursor()
    
    try:
        # Add plan_condition_id field
        cursor.execute("""
            ALTER TABLE alerts ADD COLUMN plan_condition_id INTEGER
        """)
        print("✅ plan_condition_id field added to alerts table")
        
        # Add trade_condition_id field
        cursor.execute("""
            ALTER TABLE alerts ADD COLUMN trade_condition_id INTEGER
        """)
        print("✅ trade_condition_id field added to alerts table")
        
        # Add foreign key constraints
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_alerts_plan_condition 
            ON alerts(plan_condition_id)
        """)
        print("✅ Index created for plan_condition_id")
        
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_alerts_trade_condition 
            ON alerts(trade_condition_id)
        """)
        print("✅ Index created for trade_condition_id")
        
        # Add constraints for the new fields
        cursor.execute("""
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name='constraints'
        """)
        
        if cursor.fetchone():
            cursor.execute("""
                INSERT OR IGNORE INTO constraints 
                (table_name, column_name, constraint_type, constraint_name, constraint_definition, is_active)
                VALUES 
                ('alerts', 'plan_condition_id', 'foreign_key', 'fk_alerts_plan_condition', 'REFERENCES plan_conditions(id)', 1),
                ('alerts', 'trade_condition_id', 'foreign_key', 'fk_alerts_trade_condition', 'REFERENCES trade_conditions(id)', 1)
            """)
            print("✅ Constraints added for condition linking fields")
        else:
            print("ℹ️ Constraints table not found, skipping constraint addition")
        
        conn.commit()
        print("✅ Migration completed successfully")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Migration failed: {str(e)}")
        raise

def downgrade(conn: sqlite3.Connection):
    """Remove condition linking fields from alerts table"""
    cursor = conn.cursor()
    
    try:
        # Drop indexes
        cursor.execute("DROP INDEX IF EXISTS idx_alerts_plan_condition")
        cursor.execute("DROP INDEX IF EXISTS idx_alerts_trade_condition")
        
        # Note: SQLite doesn't support DROP COLUMN directly
        # We would need to recreate the table, which is complex
        # For now, we'll just mark the fields as deprecated
        print("⚠️ SQLite doesn't support DROP COLUMN directly")
        print("⚠️ Fields will remain but should be ignored")
        
        conn.commit()
        print("✅ Downgrade completed (fields marked as deprecated)")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Downgrade failed: {str(e)}")
        raise

def main():
    """Run the migration"""
    db_path = get_database_path()
    
    if not os.path.exists(db_path):
        print(f"❌ Database not found at: {db_path}")
        return False
    
    try:
        conn = sqlite3.connect(db_path)
        upgrade(conn)
        conn.close()
        return True
    except Exception as e:
        print(f"❌ Migration failed: {str(e)}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)












































