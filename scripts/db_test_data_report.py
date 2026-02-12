#!/usr/bin/env python3
"""
Database Test Data Report Script
Team 20 (Backend) / Team 60 (DevOps & Platform)
Purpose: Report users and record counts per table (base vs test data)
Reference: SOP-011, scripts/README_SEED_TEST_DATA.md
"""

import sys
from pathlib import Path

try:
    import psycopg2
except ImportError:
    print("❌ ERROR: psycopg2 required. Run: pip install psycopg2-binary")
    sys.exit(1)

# Read DATABASE_URL from .env
env_file = Path(__file__).parent.parent / "api" / ".env"
DATABASE_URL = None

if env_file.exists():
    with open(env_file, "r") as f:
        for line in f:
            if line.startswith("DATABASE_URL=") and not line.startswith("#"):
                DATABASE_URL = line.split("=", 1)[1].strip().strip('"').strip("'")
                break

if not DATABASE_URL:
    print("❌ ERROR: DATABASE_URL not found.")
    print("   Please set it in api/.env file (DATABASE_URL=...)")
    sys.exit(1)

if "postgresql+asyncpg://" in DATABASE_URL:
    db_url = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")
elif "postgresql://" not in DATABASE_URL:
    print(f"❌ ERROR: Invalid DATABASE_URL format")
    sys.exit(1)
else:
    db_url = DATABASE_URL

# Base users (DO NOT DELETE) - from TT2_DATABASE_CREDENTIALS.md
BASE_USERS = {"TikTrackAdmin", "nimrod_wald", "test_user"}

# User data tables with user_id (for per-user counts)
USER_TABLES = [
    ("user_data", "trading_accounts", "user_id"),
    ("user_data", "brokers_fees", "user_id"),
    ("user_data", "cash_flows", "user_id"),
    ("user_data", "trades", "user_id"),
    ("user_data", "executions", "user_id"),
    ("user_data", "strategies", "user_id"),
    ("user_data", "trade_plans", "user_id"),
]


def table_exists(cur, schema, table):
    cur.execute(
        """
        SELECT EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = %s AND table_name = %s
        )
    """,
        (schema, table),
    )
    return cur.fetchone()[0]


def has_is_test_data(cur, schema, table):
    cur.execute(
        """
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = %s AND table_name = %s AND column_name = 'is_test_data'
        )
    """,
        (schema, table),
    )
    return cur.fetchone()[0]


def count_per_user(cur, schema, table, user_id_col):
    cur.execute(
        f"""
        SELECT u.id, u.username,
               COUNT(t.id) FILTER (WHERE COALESCE(t.is_test_data, false) = true) as test_count,
               COUNT(t.id) FILTER (WHERE COALESCE(t.is_test_data, false) = false) as base_count
        FROM user_data.users u
        LEFT JOIN {schema}.{table} t ON t.{user_id_col} = u.id AND (t.deleted_at IS NULL OR NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = %s AND table_name = %s AND column_name = 'deleted_at'
        ))
        GROUP BY u.id, u.username
    """,
        (schema, table),
    )
    rows = cur.fetchall()
    if not rows:
        return {}
    return {(r[0], r[1]): {"test": r[2] or 0, "base": r[3] or 0} for r in rows}


def count_simple(cur, schema, table, user_id_col):
    """Count when is_test_data might not exist."""
    cur.execute(
        f"""
        SELECT u.id, u.username, COUNT(t.id) as total
        FROM user_data.users u
        LEFT JOIN {schema}.{table} t ON t.{user_id_col} = u.id
        GROUP BY u.id, u.username
    """
    )
    return {(r[0], r[1]): {"total": r[2] or 0} for r in cur.fetchall()}


def run_report():
    try:
        conn = psycopg2.connect(db_url)
    except Exception as e:
        print(f"❌ Failed to connect: {e}")
        return None

    cur = conn.cursor()

    # Get all users
    cur.execute(
        """
        SELECT id, username, email, role, is_active
        FROM user_data.users
        ORDER BY username
    """
    )
    users = cur.fetchall()

    if not users:
        print("⚠️  No users found in user_data.users")
        conn.close()
        return None

    # Build report: user -> { table -> {test, base} }
    report = {}
    for (uid, username, email, role, is_active) in users:
        report[(uid, username)] = {
            "email": email,
            "role": role,
            "is_base": username in BASE_USERS,
            "tables": {},
        }

    for schema, table, user_id_col in USER_TABLES:
        if not table_exists(cur, schema, table):
            continue
        if has_is_test_data(cur, schema, table):
            # Count with test/base split (exclude soft-deleted if column exists)
            has_deleted = False
            cur.execute(
                """
                SELECT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema = %s AND table_name = %s AND column_name = 'deleted_at'
                )
            """,
                (schema, table),
            )
            has_deleted = cur.fetchone()[0]
            join_cond = (
                f"t.{user_id_col} = u.id AND t.deleted_at IS NULL"
                if has_deleted
                else f"t.{user_id_col} = u.id"
            )
            cur.execute(
                f"""
                SELECT u.id, u.username,
                       COUNT(t.id) FILTER (WHERE t.is_test_data = true) as test_count,
                       COUNT(t.id) FILTER (WHERE t.is_test_data = false OR t.is_test_data IS NULL) as base_count
                FROM user_data.users u
                LEFT JOIN {schema}.{table} t ON {join_cond}
                GROUP BY u.id, u.username
            """
            )
            rows = cur.fetchall()
            for r in rows:
                key = (r[0], r[1])
                if key in report:
                    report[key]["tables"][table] = {"test": r[2] or 0, "base": r[3] or 0}
        else:
            has_deleted = False
            cur.execute(
                """
                SELECT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema = %s AND table_name = %s AND column_name = 'deleted_at'
                )
            """,
                (schema, table),
            )
            has_deleted = cur.fetchone()[0]
            join_cond = (
                f"t.{user_id_col} = u.id AND t.deleted_at IS NULL"
                if has_deleted
                else f"t.{user_id_col} = u.id"
            )
            cur.execute(
                f"""
                SELECT u.id, u.username, COUNT(t.id) as total
                FROM user_data.users u
                LEFT JOIN {schema}.{table} t ON {join_cond}
                GROUP BY u.id, u.username
            """
            )
            for r in cur.fetchall():
                key = (r[0], r[1])
                if key in report:
                    report[key]["tables"][table] = {"test": 0, "base": r[2] or 0}

    conn.close()
    return report


def print_table(report):
    if not report:
        return

    tables = [
        "trading_accounts",
        "brokers_fees",
        "cash_flows",
        "trades",
        "executions",
        "strategies",
        "trade_plans",
    ]
    # Filter to tables that appear in data
    all_tables = set()
    for user_data in report.values():
        all_tables.update(user_data["tables"].keys())
    tables = [t for t in tables if t in all_tables] or list(all_tables)

    # Header
    cols = ["משתמש", "סוג"] + [t.replace("_", " ") for t in tables] + ["סה״כ בדיקה", "סה״כ בסיס"]
    widths = [20, 10] + [12] * len(tables) + [14, 14]
    header = "| " + " | ".join(c.ljust(w) for c, w in zip(cols, widths)) + " |"
    sep = "|" + "|".join("-" * (w + 2) for w in widths) + "|"

    print("\n" + "=" * 100)
    print("דוח משתמשים ומספר רשומות לפי טבלה")
    print("=" * 100)
    print()
    print(header)
    print(sep)

    for (_, username), data in sorted(report.items(), key=lambda x: x[0][1]):
        user_type = "🔒 בסיס" if data["is_base"] else "בדיקה"
        row_vals = [username[:18], user_type]
        total_test = 0
        total_base = 0
        for t in tables:
            counts = data["tables"].get(t, {"test": 0, "base": 0})
            test, base = counts.get("test", 0), counts.get("base", 0)
            total_test += test
            total_base += base
            cell = f"{test}|{base}" if test or base else "0"
            row_vals.append(cell)
        row_vals.append(str(total_test))
        row_vals.append(str(total_base))
        print("| " + " | ".join(str(v).ljust(w) for v, w in zip(row_vals, widths)) + " |")

    print()
    print("הערות:")
    print("- עמודות הטבלאות: פורמט test|base (נתוני בדיקה | נתוני בסיס)")
    print("- משתמשי בסיס (🔒): TikTrackAdmin, nimrod_wald, test_user — לא למחוק")
    print("- make db-test-clean מוחק רק שורות עם is_test_data=true")
    print()


def main():
    print("📊 Generating database test data report...")
    report = run_report()
    if report:
        print_table(report)
    print("✅ Done.")


if __name__ == "__main__":
    main()
