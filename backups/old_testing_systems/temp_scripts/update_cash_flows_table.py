#!/usr/bin/env python3
"""
Script to add new fields to the cash_flows table
"""

import sqlite3
import os

# Database path
DB_PATH = "Backend/db/simpleTrade_new.db"

def update_cash_flows_table():
    """Add new fields to the cash_flows table"""
    
    if not os.path.exists(DB_PATH):
        print(f"❌ Database not found: {DB_PATH}")
        return
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        print("🔄 Adding new fields to cash_flows table...")
        
        # Add new fields
        alter_queries = [
            "ALTER TABLE cash_flows ADD COLUMN currency_id INTEGER REFERENCES currencies(id)",
            "ALTER TABLE cash_flows ADD COLUMN usd_rate DECIMAL(10,6) DEFAULT 1.000000",
            "ALTER TABLE cash_flows ADD COLUMN source VARCHAR(20) DEFAULT 'manual'",
            "ALTER TABLE cash_flows ADD COLUMN external_id VARCHAR(100) DEFAULT '0'"
        ]
        
        for query in alter_queries:
            try:
                cursor.execute(query)
                print(f"✅ Added field: {query}")
            except sqlite3.OperationalError as e:
                if "duplicate column name" in str(e):
                    print(f"⚠️  Field already exists: {query}")
                else:
                    print(f"❌ Error adding field: {e}")
        
        conn.commit()
        print("✅ Fields added successfully")
        
        # Display new structure
        cursor.execute("PRAGMA table_info(cash_flows)")
        columns = cursor.fetchall()
        
        print("\n📊 New cash_flows table structure:")
        for col in columns:
            print(f"  {col[1]} ({col[2]}) - {col[3]}")
        
        # Update existing records with default values
        print("\n🔄 Updating existing records...")
        
        # Get default currency ID (USD)
        cursor.execute("SELECT id FROM currencies WHERE symbol = 'USD' LIMIT 1")
        usd_currency = cursor.fetchone()
        
        if usd_currency:
            usd_id = usd_currency[0]
            cursor.execute("""
                UPDATE cash_flows 
                SET currency_id = ?, usd_rate = 1.000000, source = 'manual', external_id = '0'
                WHERE currency_id IS NULL
            """, (usd_id,))
            print(f"✅ Updated {cursor.rowcount} records with default values")
        else:
            print("⚠️  USD currency not found, please create it first")
        
        conn.commit()
        
    except Exception as e:
        print(f"❌ Error updating table: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    print("🔄 Updating cash_flows table...")
    update_cash_flows_table()
    print("✅ Completed")
