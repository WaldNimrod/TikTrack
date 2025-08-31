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
        return False
    
    try:
        # Connect to database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        
        # 1. Check current table structure
        cursor.execute("PRAGMA table_info(trades)")
        columns = cursor.fetchall()
        
        has_type_column = any(col[1] == 'type' for col in columns)
        has_investment_type_column = any(col[1] == 'investment_type' for col in columns)
        
        
        if not has_type_column:
            return False
        
        if has_investment_type_column:
            return True
        
        # 2. Create backup
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS trades_backup_investment_type AS 
            SELECT * FROM trades
        """)
        
        # 3. Get current data
        cursor.execute("SELECT * FROM trades")
        trades_data = cursor.fetchall()
        
        # Get column names
        cursor.execute("PRAGMA table_info(trades)")
        columns_info = cursor.fetchall()
        column_names = [col[1] for col in columns_info]
        
        
        # 4. Create new table with investment_type
        
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
        cursor.execute("DROP TABLE trades")
        cursor.execute("ALTER TABLE trades_new RENAME TO trades")
        
        # 7. Update constraints table
        cursor.execute("""
            UPDATE constraints 
            SET column_name = 'investment_type' 
            WHERE table_name = 'trades' AND column_name = 'type'
        """)
        
        # 8. Verify
        cursor.execute("PRAGMA table_info(trades)")
        new_columns = cursor.fetchall()
        new_column_names = [col[1] for col in new_columns]
        
        
        has_investment_type = 'investment_type' in new_column_names
        has_type = 'type' in new_column_names
        
        
        # Check data
        cursor.execute("SELECT COUNT(*) FROM trades")
        count = cursor.fetchone()[0]
        
        if count > 0:
            cursor.execute("SELECT id, investment_type, status, side FROM trades LIMIT 3")
            sample_data = cursor.fetchall()
        
        # Commit changes
        conn.commit()
        
        
        return True
        
    except Exception as e:
        conn.rollback()
        return False
        
    finally:
        conn.close()

if __name__ == "__main__":
    success = update_trades_investment_type()
    if success:
    else:
        exit(1)
