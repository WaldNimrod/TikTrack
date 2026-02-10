#!/usr/bin/env python3
"""
Database Test Data Clean Script
Team 60 (DevOps & Platform)
Purpose: Delete all test data (is_test_data = true) from database
"""

import sys
import os
import psycopg2
from pathlib import Path

# Read DATABASE_URL from .env
env_file = Path(__file__).parent.parent / "api" / ".env"
DATABASE_URL = None

if env_file.exists():
    with open(env_file, 'r') as f:
        for line in f:
            if line.startswith("DATABASE_URL=") and not line.startswith("#"):
                DATABASE_URL = line.split("=", 1)[1].strip().strip('"').strip("'")
                break

if not DATABASE_URL:
    print("❌ ERROR: DATABASE_URL not found.")
    print("   Please set it in api/.env file (DATABASE_URL=...)")
    sys.exit(1)

# Parse DATABASE_URL
if "postgresql+asyncpg://" in DATABASE_URL:
    db_url = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")
elif "postgresql://" not in DATABASE_URL:
    print(f"❌ ERROR: Invalid DATABASE_URL format: {DATABASE_URL}")
    sys.exit(1)
else:
    db_url = DATABASE_URL

# Tables to clean (with is_test_data flag)
TABLES_TO_CLEAN = [
    ("user_data", "executions"),      # Child tables first (CASCADE)
    ("user_data", "trades"),
    ("user_data", "cash_flows"),
    ("user_data", "trading_accounts"),
    ("user_data", "brokers_fees"),
    ("user_data", "strategies"),
    ("user_data", "trade_plans"),
    ("market_data", "ticker_prices"),  # Child tables first
    ("market_data", "tickers"),
]

def clean_test_data(conn):
    """Delete all test data (is_test_data = true) from specified tables."""
    total_deleted = 0
    
    try:
        with conn.cursor() as cur:
            for schema, table in TABLES_TO_CLEAN:
                # Check if table exists
                cur.execute("""
                    SELECT EXISTS (
                        SELECT 1 FROM information_schema.tables 
                        WHERE table_schema = %s AND table_name = %s
                    )
                """, (schema, table))
                
                if not cur.fetchone()[0]:
                    print(f"⚠️  Table {schema}.{table} does not exist. Skipping.")
                    continue
                
                # Check if column exists
                cur.execute("""
                    SELECT EXISTS (
                        SELECT 1 FROM information_schema.columns 
                        WHERE table_schema = %s 
                        AND table_name = %s 
                        AND column_name = 'is_test_data'
                    )
                """, (schema, table))
                
                if not cur.fetchone()[0]:
                    print(f"⚠️  Column is_test_data does not exist in {schema}.{table}. Skipping.")
                    continue
                
                # Delete test data
                cur.execute(f"""
                    DELETE FROM {schema}.{table}
                    WHERE is_test_data = true
                """)
                
                deleted_count = cur.rowcount
                total_deleted += deleted_count
                
                if deleted_count > 0:
                    print(f"✅ Deleted test data from {schema}.{table}: {deleted_count} rows")
                else:
                    print(f"ℹ️  No test data found in {schema}.{table}")
            
            conn.commit()
            return total_deleted
            
    except Exception as e:
        conn.rollback()
        print(f"❌ Error cleaning test data: {e}")
        raise

def main():
    """Main entry point."""
    print("🧹 Cleaning test data from database...")
    
    # Connect to database
    try:
        conn = psycopg2.connect(db_url)
        print("✅ Connected to database")
    except Exception as e:
        print(f"❌ Failed to connect to database: {e}")
        sys.exit(1)
    
    try:
        # Clean test data
        deleted_count = clean_test_data(conn)
        
        if deleted_count > 0:
            print(f"\n✅ Database cleaned successfully. {deleted_count} test data rows removed.")
        else:
            print("\n✅ Database cleaned successfully. No test data found.")
        
        print("✅ Base data preserved. Database is sterile.")
        
    except Exception as e:
        print(f"\n❌ Failed to clean test data: {e}")
        sys.exit(1)
    finally:
        conn.close()
        print("🔌 Disconnected from database")

if __name__ == "__main__":
    main()
