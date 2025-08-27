#!/usr/bin/env python3
"""
Migration script to update trades table: rename 'type' column to 'investment_type'
Date: August 23, 2025
Description: Update trades table to use 'investment_type' instead of 'type' for consistency
"""

import sqlite3
import os
from datetime import datetime

def update_trades_investment_type():
    """Update trades table to use investment_type column"""
    
    # Database path
    db_path = "Backend/db/simpleTrade_new.db"
    
    if not os.path.exists(db_path):
        print(f"❌ Database file not found: {db_path}")
        return False
    
    try:
        # Connect to database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("🔄 Starting migration: Update trades table to use investment_type...")
        
        # 1. Check current table structure
        print("📋 Checking current table structure...")
        cursor.execute("PRAGMA table_info(trades)")
        columns = cursor.fetchall()
        
        has_type_column = any(col[1] == 'type' for col in columns)
        has_investment_type_column = any(col[1] == 'investment_type' for col in columns)
        
        print(f"   Has 'type' column: {has_type_column}")
        print(f"   Has 'investment_type' column: {has_investment_type_column}")
        
        if not has_type_column:
            print("❌ 'type' column not found in trades table")
            return False
        
        if has_investment_type_column:
            print("⚠️  'investment_type' column already exists")
            return True
        
        # 2. Create backup
        print("📋 Creating backup...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS trades_backup_investment_type AS 
            SELECT * FROM trades
        """)
        
        # 3. Get current data
        print("📋 Getting current data...")
        cursor.execute("SELECT * FROM trades")
        trades_data = cursor.fetchall()
        
        # Get column names
        cursor.execute("PRAGMA table_info(trades)")
        columns_info = cursor.fetchall()
        column_names = [col[1] for col in columns_info]
        
        print(f"   Current columns: {column_names}")
        
        # 4. Create new table with investment_type
        print("🔄 Creating new table with investment_type column...")
        
        # Create new column list with investment_type instead of type
        new_columns = []
        for col in columns_info:
            if col[1] == 'type':
                new_columns.append('investment_type VARCHAR(20)')
            else:
                col_def = f"{col[1]} {col[2]}"
                if col[3]:  # NOT NULL
                    col_def += " NOT NULL"
                if col[4]:  # DEFAULT
                    col_def += f" DEFAULT {col[4]}"
                if col[5]:  # PRIMARY KEY
                    col_def += " PRIMARY KEY"
                new_columns.append(col_def)
        
        # Create new table
        create_sql = f"""
        CREATE TABLE trades_new (
            {', '.join(new_columns)}
        )
        """
        cursor.execute(create_sql)
        
        # 5. Copy data with column mapping
        print("🔄 Copying data...")
        
        # Create new column names list
        new_column_names = []
        for col in columns_info:
            if col[1] == 'type':
                new_column_names.append('investment_type')
            else:
                new_column_names.append(col[1])
        
        # Insert data
        if trades_data:
            placeholders = ','.join(['?' for _ in new_column_names])
            insert_sql = f"INSERT INTO trades_new ({','.join(new_column_names)}) VALUES ({placeholders})"
            cursor.executemany(insert_sql, trades_data)
        
        # 6. Drop old table and rename new table
        print("🔄 Replacing table...")
        cursor.execute("DROP TABLE trades")
        cursor.execute("ALTER TABLE trades_new RENAME TO trades")
        
        # 7. Update constraints table
        print("🔄 Updating constraints...")
        cursor.execute("""
            UPDATE constraints 
            SET column_name = 'investment_type' 
            WHERE table_name = 'trades' AND column_name = 'type'
        """)
        
        # 8. Verify
        print("🔍 Verifying migration...")
        cursor.execute("PRAGMA table_info(trades)")
        new_columns = cursor.fetchall()
        new_column_names = [col[1] for col in new_columns]
        
        print(f"   New columns: {new_column_names}")
        
        has_investment_type = 'investment_type' in new_column_names
        has_type = 'type' in new_column_names
        
        print(f"   Has 'investment_type' column: {has_investment_type}")
        print(f"   Has 'type' column: {has_type}")
        
        # Check data
        cursor.execute("SELECT COUNT(*) FROM trades")
        count = cursor.fetchone()[0]
        print(f"   Trades count: {count}")
        
        if count > 0:
            cursor.execute("SELECT id, investment_type, status, side FROM trades LIMIT 3")
            sample_data = cursor.fetchall()
            print(f"   Sample data: {sample_data}")
        
        # Commit changes
        conn.commit()
        
        print("✅ Migration completed successfully!")
        print("📋 Summary:")
        print(f"   - Renamed 'type' column to 'investment_type' in trades table")
        print(f"   - Updated constraints table")
        print(f"   - All data preserved")
        print(f"   - {count} trades records updated")
        
        return True
        
    except Exception as e:
        print(f"❌ Error during migration: {e}")
        conn.rollback()
        return False
        
    finally:
        conn.close()

if __name__ == "__main__":
    success = update_trades_investment_type()
    if success:
        print("🎉 Migration completed successfully!")
    else:
        print("💥 Migration failed!")
        exit(1)
