"""
Migration: Normalize cash flow "other" types
Date: 2025-11-07
Description:
- Convert legacy cash flow records with type="other" into
  "other_positive" or "other_negative" based on the amount sign
- Ensure ENUM constraint values reflect the new set (deactivate "other")
"""

import os
import sqlite3
from datetime import datetime


def migrate():
    db_path = os.path.join(os.path.dirname(__file__), '..', 'db', 'simpleTrade_new.db')

    if not os.path.exists(db_path):
        print(f"❌ Database not found: {db_path}")
        return False

    conn = None

    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # --- Step 1: update data rows ---
        cursor.execute(
            """
            UPDATE cash_flows
            SET type = CASE
                WHEN amount >= 0 THEN 'other_positive'
                ELSE 'other_negative'
            END
            WHERE type = 'other'
            """
        )
        updated_rows = cursor.rowcount
        print(f"ℹ️ Updated {updated_rows} cash_flows rows from 'other' to positive/negative variants")

        # --- Step 2: ensure enum values ---
        cursor.execute(
            """
            SELECT id FROM constraints
            WHERE table_name = 'cash_flows' AND column_name = 'type' AND is_active = 1
            LIMIT 1
            """
        )
        result = cursor.fetchone()

        if result:
            constraint_id = result[0]

            # Deactivate legacy 'other' value if it exists
            cursor.execute(
                """
                UPDATE enum_values
                SET is_active = 0
                WHERE constraint_id = ? AND value = 'other' AND is_active = 1
                """,
                (constraint_id,)
            )

            # Ensure new variants are active
            cursor.execute(
                """
                UPDATE enum_values
                SET is_active = 1
                WHERE constraint_id = ? AND value IN ('other_positive', 'other_negative')
                """,
                (constraint_id,)
            )

            # Add display names if the rows exist but missing labels
            cursor.execute(
                """
                UPDATE enum_values
                SET display_name = 'אחר חיובי'
                WHERE constraint_id = ? AND value = 'other_positive' AND (display_name IS NULL OR display_name = '')
                """,
                (constraint_id,)
            )
            cursor.execute(
                """
                UPDATE enum_values
                SET display_name = 'אחר שלילי'
                WHERE constraint_id = ? AND value = 'other_negative' AND (display_name IS NULL OR display_name = '')
                """,
                (constraint_id,)
            )

        conn.commit()
        print("✅ Cash flow type migration completed successfully")
        return True

    except Exception as exc:
        if conn:
            conn.rollback()
        print(f"❌ Migration failed: {exc}")
        return False

    finally:
        if conn:
            conn.close()


if __name__ == "__main__":
    print("🔄 Starting migration: Normalize cash flow 'other' types...")
    print(f"⏰ Migration started at: {datetime.now().isoformat()}")
    print("=" * 60)

    success = migrate()

    print("=" * 60)
    if success:
        print("✅ Migration completed successfully")
        print(f"⏰ Migration completed at: {datetime.now().isoformat()}")
    else:
        print("❌ Migration failed")
        raise SystemExit(1)


