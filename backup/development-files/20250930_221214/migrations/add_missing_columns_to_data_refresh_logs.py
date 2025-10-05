"""
Migration: Add Missing Columns to data_refresh_logs Table
Adds the missing columns that are defined in the model but not in the database
"""

import sqlite3
import os
import sys
from pathlib import Path

# Get the database path
BASE_DIR = Path(__file__).parent.parent
DB_PATH = BASE_DIR / "db" / "simpleTrade_new.db"

def upgrade():
    """Add missing columns to data_refresh_logs table"""
    if not DB_PATH.exists():
        print(f"❌ Database not found at: {DB_PATH}")
        return
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Check if table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='data_refresh_logs'")
        if not cursor.fetchone():
            print("❌ data_refresh_logs table does not exist")
            return
        
        # Add missing columns one by one
        columns_to_add = [
            ("category", "VARCHAR(50)"),
            ("time_period", "VARCHAR(50)"),
            ("ticker_count", "INTEGER"),
            ("successful_count", "INTEGER"),
            ("failed_count", "INTEGER"),
            ("message", "TEXT")
        ]
        
        for column_name, column_type in columns_to_add:
            try:
                # Check if column already exists
                cursor.execute(f"PRAGMA table_info(data_refresh_logs)")
                columns = [row[1] for row in cursor.fetchall()]
                
                if column_name not in columns:
                    cursor.execute(f"ALTER TABLE data_refresh_logs ADD COLUMN {column_name} {column_type}")
                    print(f"✅ Added column: {column_name}")
                else:
                    print(f"⚠️ Column {column_name} already exists")
                    
            except Exception as e:
                print(f"❌ Error adding column {column_name}: {e}")
        
        # Make provider_id nullable (it's already nullable in the model)
        # SQLite doesn't support changing column constraints directly, so we'll skip this
        
        conn.commit()
        print("✅ All missing columns added successfully")
        
    except Exception as e:
        print(f"❌ Error adding columns: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()


def downgrade():
    """Remove the added columns from data_refresh_logs table"""
    if not DB_PATH.exists():
        print(f"❌ Database not found at: {DB_PATH}")
        return
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # SQLite doesn't support DROP COLUMN directly, so we'll create a new table
        # and copy the data, then replace the old table
        
        # Get the original table structure (without the new columns)
        cursor.execute("""
            CREATE TABLE data_refresh_logs_backup AS 
            SELECT id, provider_id, operation_type, symbols_requested, 
                   symbols_successful, symbols_failed, start_time, end_time, 
                   total_duration_ms, status, error_message, error_code, 
                   rate_limit_remaining, rate_limit_reset_time, 
                   cache_hit_count, cache_miss_count, created_at
            FROM data_refresh_logs
        """)
        
        # Drop the original table
        cursor.execute("DROP TABLE data_refresh_logs")
        
        # Rename backup to original
        cursor.execute("ALTER TABLE data_refresh_logs_backup RENAME TO data_refresh_logs")
        
        # Recreate indexes
        indexes = [
            ("idx_data_refresh_logs_provider", "data_refresh_logs(provider_id)"),
            ("idx_data_refresh_logs_operation_type", "data_refresh_logs(operation_type)"),
            ("idx_data_refresh_logs_status", "data_refresh_logs(status)"),
            ("idx_data_refresh_logs_start_time", "data_refresh_logs(start_time)")
        ]
        
        for index_name, index_def in indexes:
            try:
                cursor.execute(f"CREATE INDEX IF NOT EXISTS {index_name} ON {index_def}")
                print(f"✅ Recreated index: {index_name}")
            except Exception as e:
                print(f"⚠️ Error recreating index {index_name}: {e}")
        
        conn.commit()
        print("✅ Columns removed successfully")
        
    except Exception as e:
        print(f"❌ Error removing columns: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "down":
        print("🔄 Downgrading - removing columns from data_refresh_logs...")
        downgrade()
    else:
        print("🔄 Upgrading - adding missing columns to data_refresh_logs...")
        upgrade()
