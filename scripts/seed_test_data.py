#!/usr/bin/env python3
"""
Database Test Data Seed Script
Team 60 (DevOps & Platform)
Purpose: Seed test data (is_test_data = true) for Phase 2 tables
"""

import sys
import os
import psycopg2
from pathlib import Path
from datetime import datetime, timedelta
import uuid

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

# Get QA test user ID (TikTrackAdmin) for foreign keys
QA_USERNAME = "TikTrackAdmin"

def get_user_id(conn, username):
    """Get user ID by username."""
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT id FROM user_data.users WHERE username = %s
            """, (username,))
            result = cur.fetchone()
            if result:
                return result[0]
            return None
    except Exception as e:
        print(f"⚠️  Warning: Could not get user ID for {username}: {e}")
        return None

def ensure_is_test_data_column(conn, schema, table):
    """Ensure is_test_data column exists in table."""
    try:
        with conn.cursor() as cur:
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
                # Add column if it doesn't exist
                cur.execute(f"""
                    ALTER TABLE {schema}.{table}
                    ADD COLUMN IF NOT EXISTS is_test_data BOOLEAN NOT NULL DEFAULT FALSE
                """)
                conn.commit()
                print(f"✅ Added is_test_data column to {schema}.{table}")
                return True
            return True
    except Exception as e:
        print(f"⚠️  Warning: Could not ensure is_test_data column in {schema}.{table}: {e}")
        return False

def seed_trading_accounts(conn, user_id, count=3):
    """Seed test trading accounts."""
    if not user_id:
        print("⚠️  Skipping trading_accounts: No user ID available")
        return 0
    
    # Ensure is_test_data column exists
    if not ensure_is_test_data_column(conn, "user_data", "trading_accounts"):
        print("⚠️  Skipping trading_accounts: Could not ensure is_test_data column")
        return 0
    
    try:
        with conn.cursor() as cur:
            brokers = ["Interactive Brokers", "TD Ameritrade", "Charles Schwab", "E*TRADE", "Fidelity", "Robinhood"]
            currencies = ["USD", "EUR", "GBP", "ILS"]
            
            inserted = 0
            for i in range(count):
                broker = brokers[i % len(brokers)]
                currency = currencies[i % len(currencies)]
                
                cur.execute("""
                    INSERT INTO user_data.trading_accounts (
                        id, user_id, account_name, broker, account_number,
                        initial_balance, cash_balance, total_deposits, total_withdrawals,
                        currency, is_active, created_by, updated_by,
                        is_test_data, created_at, updated_at
                    ) VALUES (
                        gen_random_uuid(), %s, %s, %s, %s,
                        %s, %s, %s, %s,
                        %s, TRUE, %s, %s,
                        TRUE, NOW(), NOW()
                    )
                """, (
                    user_id,
                    f"Test Account {i+1}",
                    broker,
                    f"TEST{i+1:04d}",
                    10000.00 + (i * 5000),
                    10000.00 + (i * 5000),
                    (i+1) * 2000.00,
                    i * 500.00,
                    currency,
                    user_id,
                    user_id
                ))
                inserted += 1
            
            conn.commit()
            print(f"✅ Seeded {inserted} test trading accounts")
            return inserted
    except Exception as e:
        conn.rollback()
        print(f"❌ Error seeding trading_accounts: {e}")
        return 0

def seed_brokers_fees(conn, user_id, count=6):
    """Seed test brokers fees."""
    if not user_id:
        print("⚠️  Skipping brokers_fees: No user ID available")
        return 0
    
    # Ensure is_test_data column exists
    if not ensure_is_test_data_column(conn, "user_data", "brokers_fees"):
        print("⚠️  Skipping brokers_fees: Could not ensure is_test_data column")
        return 0
    
    try:
        with conn.cursor() as cur:
            brokers = ["Interactive Brokers", "TD Ameritrade", "Charles Schwab", "E*TRADE", "Fidelity", "Robinhood"]
            commission_types = ["TIERED", "FLAT", "TIERED", "FLAT", "TIERED", "FLAT"]
            
            inserted = 0
            for i in range(count):
                commission_type = commission_types[i % len(commission_types)]
                cur.execute("""
                    INSERT INTO user_data.brokers_fees (
                        id, user_id, broker, commission_type, commission_value,
                        minimum, is_test_data, created_at, updated_at
                    ) VALUES (
                        gen_random_uuid(), %s, %s, %s::user_data.commission_type, %s,
                        %s, TRUE, NOW(), NOW()
                    )
                """, (
                    user_id,
                    brokers[i % len(brokers)],
                    commission_type,
                    "0.005" if commission_type == "TIERED" else "1.00",
                    0.00 if commission_type == "TIERED" else 1.00
                ))
                inserted += 1
            
            conn.commit()
            print(f"✅ Seeded {inserted} test brokers fees")
            return inserted
    except Exception as e:
        conn.rollback()
        if "does not exist" in str(e) or "relation" in str(e).lower():
            print(f"⚠️  Skipping brokers_fees: Table or type does not exist")
        else:
            print(f"❌ Error seeding brokers_fees: {e}")
        return 0

def seed_cash_flows(conn, user_id, account_ids, count=10):
    """Seed test cash flows."""
    if not user_id or not account_ids:
        print("⚠️  Skipping cash_flows: No user ID or account IDs available")
        return 0
    
    # Ensure is_test_data column exists
    if not ensure_is_test_data_column(conn, "user_data", "cash_flows"):
        print("⚠️  Skipping cash_flows: Could not ensure is_test_data column")
        return 0
    
    try:
        with conn.cursor() as cur:
            flow_types = ["DEPOSIT", "WITHDRAWAL", "DIVIDEND", "INTEREST", "FEE"]
            
            inserted = 0
            for i in range(count):
                account_id = account_ids[i % len(account_ids)]
                flow_type = flow_types[i % len(flow_types)]
                amount = 100.00 + (i * 50.00) if flow_type in ["DEPOSIT", "DIVIDEND", "INTEREST"] else -(10.00 + (i * 5.00))
                
                cur.execute("""
                    INSERT INTO user_data.cash_flows (
                        id, user_id, trading_account_id, flow_type, amount,
                        currency, description, transaction_date,
                        created_by, updated_by,
                        is_test_data, created_at, updated_at
                    ) VALUES (
                        gen_random_uuid(), %s, %s, %s, %s,
                        'USD', %s, %s,
                        %s, %s,
                        TRUE, NOW(), NOW()
                    )
                """, (
                    user_id,
                    account_id,
                    flow_type,
                    amount,
                    f"Test {flow_type} {i+1}",
                    datetime.now() - timedelta(days=i),
                    user_id,
                    user_id
                ))
                inserted += 1
            
            conn.commit()
            print(f"✅ Seeded {inserted} test cash flows")
            return inserted
    except Exception as e:
        conn.rollback()
        if "does not exist" in str(e) or "relation" in str(e).lower():
            print(f"⚠️  Skipping cash_flows: Table does not exist")
        else:
            print(f"❌ Error seeding cash_flows: {e}")
        return 0

def get_trading_account_ids(conn, user_id):
    """Get test trading account IDs."""
    if not user_id:
        return []
    
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT id FROM user_data.trading_accounts
                WHERE user_id = %s AND is_test_data = true
            """, (user_id,))
            return [row[0] for row in cur.fetchall()]
    except Exception as e:
        print(f"⚠️  Warning: Could not get trading account IDs: {e}")
        return []

def seed_test_data(conn, user_id):
    """Seed all test data."""
    total_seeded = 0
    
    # Seed trading accounts first (parent table) — 3 accounts
    accounts_seeded = seed_trading_accounts(conn, user_id, count=3)
    total_seeded += accounts_seeded
    
    # Get account IDs for foreign keys
    account_ids = get_trading_account_ids(conn, user_id)
    
    # Seed brokers fees — 6 rows
    fees_seeded = seed_brokers_fees(conn, user_id, count=6)
    total_seeded += fees_seeded
    
    # Seed cash flows (depends on trading accounts) — 10 rows
    if account_ids:
        cash_flows_seeded = seed_cash_flows(conn, user_id, account_ids, count=10)
        total_seeded += cash_flows_seeded
    
    return total_seeded

def main():
    """Main entry point."""
    print("=" * 60)
    print("Database Test Data Seed Script")
    print("Team 60 (DevOps & Platform)")
    print("=" * 60)
    print("\n🌱 Seeding test data (is_test_data = true)...")
    
    # Connect to database
    try:
        conn = psycopg2.connect(db_url)
        print("✅ Connected to database")
    except Exception as e:
        print(f"❌ Failed to connect to database: {e}")
        sys.exit(1)
    
    try:
        # Get QA test user ID
        user_id = get_user_id(conn, QA_USERNAME)
        
        if not user_id:
            print(f"⚠️  Warning: User '{QA_USERNAME}' not found.")
            print("   Creating test data without user_id (may fail if foreign keys are required)")
        
        # Seed test data
        total_seeded = seed_test_data(conn, user_id)
        
        if total_seeded > 0:
            print(f"\n✅ Test data seeded successfully. {total_seeded} rows inserted.")
        else:
            print("\n⚠️  No test data was seeded. Check table existence and user availability.")
        
    except Exception as e:
        print(f"\n❌ Failed to seed test data: {e}")
        sys.exit(1)
    finally:
        conn.close()
        print("🔌 Disconnected from database")

if __name__ == "__main__":
    main()
