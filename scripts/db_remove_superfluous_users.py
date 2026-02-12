#!/usr/bin/env python3
"""
Remove Superfluous Users (non-base)
Team 20 (Backend)
Purpose: Delete users not in base list. Base users: TikTrackAdmin, nimrod_wald, test_user.
"""

import sys
from pathlib import Path

try:
    import psycopg2
except ImportError:
    print("❌ ERROR: psycopg2 required.")
    sys.exit(1)

env_file = Path(__file__).parent.parent / "api" / ".env"
if env_file.exists():
    with open(env_file) as f:
        for line in f:
            if line.startswith("DATABASE_URL=") and not line.startswith("#"):
                db_url = line.split("=", 1)[1].strip().strip('"').strip("'")
                if "postgresql+asyncpg://" in db_url:
                    db_url = db_url.replace("postgresql+asyncpg://", "postgresql://")
                break
        else:
            db_url = None
else:
    db_url = None

if not db_url:
    print("❌ DATABASE_URL not found.")
    sys.exit(1)

BASE_USERNAMES = ("TikTrackAdmin", "nimrod_wald", "test_user")


def main():
    conn = psycopg2.connect(db_url)
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                DELETE FROM user_data.users
                WHERE username NOT IN %s
                RETURNING id, username
                """,
                (BASE_USERNAMES,),
            )
            deleted = cur.fetchall()
            conn.commit()
            for uid, uname in deleted:
                print(f"   Deleted user: {uname}")
            if deleted:
                print(f"✅ Removed {len(deleted)} superfluous user(s).")
            else:
                print("ℹ️  No superfluous users found.")
    finally:
        conn.close()


if __name__ == "__main__":
    print("Removing superfluous users (keeping TikTrackAdmin, nimrod_wald, test_user)...")
    main()
