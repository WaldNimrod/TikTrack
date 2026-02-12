#!/usr/bin/env python3
"""
Seed Base Dataset for test_user
Team 20 (Backend)
Purpose: Minimal representative dataset (is_test_data = false) for test_user
Reference: documentation/05-REPORTS/artifacts/SPEC_BASE_TEST_USER_DATASET.md
"""

import sys
from pathlib import Path
from datetime import datetime, timedelta

try:
    import psycopg2
except ImportError:
    print("❌ ERROR: psycopg2 required. Run: pip install psycopg2-binary")
    sys.exit(1)

env_file = Path(__file__).parent.parent / "api" / ".env"
DATABASE_URL = None
if env_file.exists():
    with open(env_file, "r") as f:
        for line in f:
            if line.startswith("DATABASE_URL=") and not line.startswith("#"):
                DATABASE_URL = line.split("=", 1)[1].strip().strip('"').strip("'")
                break

if not DATABASE_URL:
    print("❌ ERROR: DATABASE_URL not found in api/.env")
    sys.exit(1)

db_url = (
    DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")
    if "postgresql+asyncpg://" in DATABASE_URL
    else DATABASE_URL
)

BASE_USERNAME = "test_user"


def get_user_id(conn, username):
    with conn.cursor() as cur:
        cur.execute(
            "SELECT id FROM user_data.users WHERE username = %s",
            (username,),
        )
        r = cur.fetchone()
        return r[0] if r else None


def ensure_is_test_data(conn, schema, table):
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_schema = %s AND table_name = %s AND column_name = 'is_test_data'
            )
        """,
            (schema, table),
        )
        if not cur.fetchone()[0]:
            cur.execute(
                f"ALTER TABLE {schema}.{table} ADD COLUMN IF NOT EXISTS is_test_data BOOLEAN NOT NULL DEFAULT FALSE"
            )
            conn.commit()


def has_trading_account_id_in_brokers_fees(conn):
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_schema = 'user_data' AND table_name = 'brokers_fees'
                AND column_name = 'trading_account_id'
            )
        """
        )
        return cur.fetchone()[0]


def already_seeded(conn, user_id):
    """Check if test_user already has base trading_accounts."""
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT COUNT(*) FROM user_data.trading_accounts
            WHERE user_id = %s AND (is_test_data = false OR is_test_data IS NULL)
        """,
            (user_id,),
        )
        return cur.fetchone()[0] >= 2


def seed_trading_accounts(conn, user_id):
    ensure_is_test_data(conn, "user_data", "trading_accounts")
    with conn.cursor() as cur:
        accounts = [
            ("חשבון מרכזי", "Interactive Brokers", "USD", True, "BASE001"),
            ("חשבון אירופה", "eToro", "EUR", False, "BASE002"),
        ]
        for name, broker, currency, is_active, acct_num in accounts:
            cur.execute(
                """
                INSERT INTO user_data.trading_accounts (
                    id, user_id, account_name, broker, account_number,
                    initial_balance, cash_balance, total_deposits, total_withdrawals,
                    currency, is_active, created_by, updated_by,
                    is_test_data, created_at, updated_at
                ) VALUES (
                    gen_random_uuid(), %s, %s, %s, %s,
                    10000, 9500, 2000, 500,
                    %s, %s, %s, %s,
                    FALSE, NOW(), NOW()
                )
            """,
                (user_id, name, broker, acct_num, currency, is_active, user_id, user_id),
            )
        conn.commit()
        cur.execute(
            "SELECT id FROM user_data.trading_accounts WHERE user_id = %s AND (is_test_data = false OR is_test_data IS NULL) ORDER BY created_at",
            (user_id,),
        )
        return [r[0] for r in cur.fetchall()]


def seed_brokers_fees(conn, user_id, account_ids):
    ensure_is_test_data(conn, "user_data", "brokers_fees")
    if has_trading_account_id_in_brokers_fees(conn):
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO user_data.brokers_fees (
                    id, user_id, trading_account_id, commission_type, commission_value,
                    minimum, is_test_data, created_at, updated_at
                ) VALUES
                    (gen_random_uuid(), %s, %s, 'TIERED'::user_data.commission_type, 0.005, 0.50, FALSE, NOW(), NOW()),
                    (gen_random_uuid(), %s, %s, 'FLAT'::user_data.commission_type, 1.00, 1.00, FALSE, NOW(), NOW())
            """,
                (
                    user_id,
                    account_ids[0],
                    user_id,
                    account_ids[1],
                ),
            )
            conn.commit()
    else:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO user_data.brokers_fees (
                    id, user_id, broker, commission_type, commission_value,
                    minimum, is_test_data, created_at, updated_at
                ) VALUES
                    (gen_random_uuid(), %s, 'Interactive Brokers', 'TIERED'::user_data.commission_type, 0.005, 0.50, FALSE, NOW(), NOW()),
                    (gen_random_uuid(), %s, 'eToro', 'FLAT'::user_data.commission_type, 1.00, 1.00, FALSE, NOW(), NOW())
            """,
                (user_id, user_id),
            )
            conn.commit()


def seed_cash_flows(conn, user_id, account_ids):
    ensure_is_test_data(conn, "user_data", "cash_flows")
    flows = [
        ("DEPOSIT", 1000.00, account_ids[0], "הפקדה ראשונית"),
        ("WITHDRAWAL", -200.00, account_ids[0], "משיכה"),
        ("DIVIDEND", 50.00, account_ids[0], "דיבידנד"),
        ("INTEREST", 2.50, account_ids[0], "ריבית"),
        ("FEE", -5.00, account_ids[1], "עמלה"),
    ]
    with conn.cursor() as cur:
        for i, (ft, amt, acc_id, desc) in enumerate(flows):
            cur.execute(
                """
                INSERT INTO user_data.cash_flows (
                    id, user_id, trading_account_id, flow_type, amount,
                    currency, description, transaction_date,
                    created_by, updated_by, is_test_data, created_at, updated_at
                ) VALUES (
                    gen_random_uuid(), %s, %s, %s, %s,
                    'USD', %s, %s,
                    %s, %s, FALSE, NOW(), NOW()
                )
            """,
                (
                    user_id,
                    acc_id,
                    ft,
                    amt,
                    desc,
                    (datetime.now() - timedelta(days=i)).date(),
                    user_id,
                    user_id,
                ),
            )
        conn.commit()


def main():
    print("=" * 60)
    print("Seed Base Dataset — test_user")
    print("Reference: SPEC_BASE_TEST_USER_DATASET.md")
    print("=" * 60)

    try:
        conn = psycopg2.connect(db_url)
    except Exception as e:
        print(f"❌ Failed to connect: {e}")
        sys.exit(1)

    try:
        user_id = get_user_id(conn, BASE_USERNAME)
        if not user_id:
            print(f"❌ User '{BASE_USERNAME}' not found. Create user first.")
            conn.close()
            sys.exit(1)

        if already_seeded(conn, user_id):
            print(f"✅ {BASE_USERNAME} already has base data. Skip (or delete existing base data to re-seed).")
            conn.close()
            return

        account_ids = seed_trading_accounts(conn, user_id)
        print(f"✅ Seeded 2 trading accounts")
        seed_brokers_fees(conn, user_id, account_ids)
        print(f"✅ Seeded 2 brokers fees")
        seed_cash_flows(conn, user_id, account_ids)
        print(f"✅ Seeded 5 cash flows")
        print(f"\n✅ Base dataset for {BASE_USERNAME} seeded successfully (9 rows).")
    except Exception as e:
        conn.rollback()
        print(f"❌ Error: {e}")
        sys.exit(1)
    finally:
        conn.close()


if __name__ == "__main__":
    main()
