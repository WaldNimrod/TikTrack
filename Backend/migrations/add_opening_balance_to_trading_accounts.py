"""
Migration: Add opening_balance to trading_accounts table
Date: 2025-01-27
Description: Add opening_balance column to trading_accounts table for initial balance tracking
- Column: opening_balance FLOAT NULL (stores opening balance in base currency)
- Default: 0.0
- Nullable: True (allows NULL for existing accounts)
"""
import sqlite3
import os
from datetime import datetime

def migrate():
    """Add opening_balance column to trading_accounts table"""
    
    # Database path
    db_path = os.path.join(os.path.dirname(__file__), '..', 'db', 'simpleTrade_new.db')
    
    if not os.path.exists(db_path):
        print(f"❌ Database not found: {db_path}")
        return False
    
    try:
        # Connect to database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if column already exists
        cursor.execute("PRAGMA table_info(trading_accounts)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'opening_balance' in columns:
            print("⚠️ Column opening_balance already exists in trading_accounts table")
            return True
        
        # Add opening_balance column
        cursor.execute("""
            ALTER TABLE trading_accounts ADD COLUMN opening_balance FLOAT DEFAULT 0.0
        """)
        
        # Commit changes
        conn.commit()
        print("✅ Successfully added opening_balance column to trading_accounts table")
        
        # Verify the column was added
        cursor.execute("PRAGMA table_info(trading_accounts)")
        columns_after = [column[1] for column in cursor.fetchall()]
        
        if 'opening_balance' in columns_after:
            print("✅ Verified: opening_balance column exists in trading_accounts table")
            
            # Update existing accounts to have 0.0 as opening_balance if NULL
            cursor.execute("""
                UPDATE trading_accounts 
                SET opening_balance = 0.0 
                WHERE opening_balance IS NULL
            """)
            conn.commit()
            print("✅ Updated existing accounts with default opening_balance = 0.0")
            
            return True
        else:
            print("❌ Error: opening_balance column was not added")
            return False
        
    except Exception as e:
        if conn:
            conn.rollback()
        print(f"❌ Error adding opening_balance column: {str(e)}")
        return False
        
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    print("🔄 Starting migration: Add opening_balance to trading_accounts table...")
    print(f"⏰ Migration started at: {datetime.now().isoformat()}")
    print("=" * 60)
    
    success = migrate()
    
    print("=" * 60)
    if success:
        print("✅ Migration completed successfully")
        print(f"⏰ Migration completed at: {datetime.now().isoformat()}")
    else:
        print("❌ Migration failed")
        exit(1)
