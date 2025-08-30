"""
Migration: Update trade_plans table constraints and add percentage fields
Date: 2025-08-30
Description: Update constraints for trade_plans table and add percentage-based stop/target fields
"""

import sqlite3
import os
from datetime import datetime

def migrate():
    """Update trade_plans table with new constraints and fields"""
    
    # Database path
    db_path = os.path.join(os.path.dirname(__file__), '..', 'db', 'simpleTrade_new.db')
    
    print(f"🔄 Starting migration: Update trade_plans constraints")
    print(f"📁 Database: {db_path}")
    
    try:
        # Connect to database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Disable foreign keys temporarily
        cursor.execute("PRAGMA foreign_keys=OFF;")
        
        # Add new columns if they don't exist
        print("📝 Adding new columns...")
        
        # Check if columns exist
        cursor.execute("PRAGMA table_info(trade_plans);")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'stop_percentage' not in columns:
            cursor.execute("ALTER TABLE trade_plans ADD COLUMN stop_percentage FLOAT DEFAULT 0.1;")
            print("✅ Added stop_percentage column")
        
        if 'target_percentage' not in columns:
            cursor.execute("ALTER TABLE trade_plans ADD COLUMN target_percentage FLOAT DEFAULT 2000;")
            print("✅ Added target_percentage column")
        
        if 'current_price' not in columns:
            cursor.execute("ALTER TABLE trade_plans ADD COLUMN current_price FLOAT DEFAULT 0;")
            print("✅ Added current_price column")
        
        # Update existing records with default values
        print("🔄 Updating existing records...")
        cursor.execute("UPDATE trade_plans SET stop_percentage = 0.1 WHERE stop_percentage IS NULL;")
        cursor.execute("UPDATE trade_plans SET target_percentage = 2000 WHERE target_percentage IS NULL;")
        cursor.execute("UPDATE trade_plans SET current_price = 0 WHERE current_price IS NULL;")
        
        # Update planned_amount for records with NULL or 0 values
        cursor.execute("UPDATE trade_plans SET planned_amount = 1000 WHERE planned_amount IS NULL OR planned_amount = 0;")
        
        # Update investment_type for records with NULL values
        cursor.execute("UPDATE trade_plans SET investment_type = 'swing' WHERE investment_type IS NULL;")
        
        # Update side for records with NULL values
        cursor.execute("UPDATE trade_plans SET side = 'Long' WHERE side IS NULL;")
        
        # Update status for records with NULL values
        cursor.execute("UPDATE trade_plans SET status = 'open' WHERE status IS NULL;")
        
        # Update created_at for records with NULL values
        cursor.execute("UPDATE trade_plans SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL;")
        
        # Re-enable foreign keys
        cursor.execute("PRAGMA foreign_keys=ON;")
        
        # Commit changes
        conn.commit()
        
        # Verify changes
        cursor.execute("SELECT COUNT(*) FROM trade_plans;")
        count = cursor.fetchone()[0]
        
        cursor.execute("PRAGMA table_info(trade_plans);")
        columns = cursor.fetchall()
        
        print(f"✅ Migration completed successfully!")
        print(f"📊 Total records: {count}")
        print(f"📋 Updated columns:")
        for column in columns:
            print(f"   - {column[1]} ({column[2]}) - NOT NULL: {column[3]}, Default: {column[4]}")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Migration failed: {str(e)}")
        if conn:
            conn.rollback()
            conn.close()
        return False

if __name__ == "__main__":
    migrate()




