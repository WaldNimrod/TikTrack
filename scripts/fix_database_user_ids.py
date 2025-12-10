#!/usr/bin/env python3
"""
Fix User IDs in Database - Assign correct user_id to existing data

This script ensures that all existing data in the database is properly
assigned to the correct users based on data ownership rules.
"""

import sys
from pathlib import Path
from sqlalchemy import text, inspect
from sqlalchemy.orm import Session
import logging

# Add Backend directory to path
backend_path = Path(__file__).resolve().parent.parent / "Backend"
sys.path.insert(0, str(backend_path))

from config.database import SessionLocal, engine

logging.basicConfig(level=logging.INFO, format='%(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class DatabaseUserIdFixer:
    """Fix user_id assignments in database"""

    def __init__(self):
        self.db = SessionLocal()
        self.user_mapping = {}  # Cache user lookups

    def get_user_id(self, username: str) -> int:
        """Get user ID by username"""
        if username in self.user_mapping:
            return self.user_mapping[username]

        result = self.db.execute(text("SELECT id FROM users WHERE username = :username"),
                                {"username": username})
        row = result.fetchone()
        if row:
            user_id = row[0]
            self.user_mapping[username] = user_id
            return user_id

        raise ValueError(f"User {username} not found")

    def fix_table_user_ids(self, table_name: str, user_id: int, where_clause: str = None):
        """Fix user_id for a table"""
        try:
            # Check if table exists and has user_id column
            inspector = inspect(engine)
            if table_name not in inspector.get_table_names():
                logger.info(f"Table {table_name} does not exist, skipping")
                return 0

            columns = [col['name'] for col in inspector.get_columns(table_name)]
            if 'user_id' not in columns:
                logger.info(f"Table {table_name} has no user_id column, skipping")
                return 0

            # Count rows without user_id
            query = f"SELECT COUNT(*) FROM {table_name} WHERE user_id IS NULL"
            if where_clause:
                query += f" AND ({where_clause})"

            result = self.db.execute(text(query))
            count = result.fetchone()[0]

            if count == 0:
                logger.info(f"✅ {table_name}: All {count} rows already have user_id")
                return 0

            # Update rows
            update_query = f"UPDATE {table_name} SET user_id = :user_id WHERE user_id IS NULL"
            if where_clause:
                update_query += f" AND ({where_clause})"

            self.db.execute(text(update_query), {"user_id": user_id})
            self.db.commit()

            logger.info(f"✅ {table_name}: Fixed {count} rows with user_id = {user_id}")
            return count

        except Exception as e:
            self.db.rollback()
            logger.error(f"❌ Error fixing {table_name}: {e}")
            return 0

    def fix_admin_data(self):
        """Fix all data that should belong to admin user"""
        logger.info("🔧 Fixing admin user data...")
        admin_id = self.get_user_id("admin")

        tables_to_fix = [
            "trading_accounts",
            "trades",
            "trade_plans",
            "executions",
            "cash_flows",
            "alerts",
            "notes",
            "watch_lists",
            "import_sessions"
        ]

        total_fixed = 0
        for table in tables_to_fix:
            # For demo purposes, assign first N records to admin
            # In production, this would be based on business logic
            if table == "trades":
                # Assign first 15 trades to admin
                count = self.fix_table_user_ids(table, admin_id, "id <= 15")
            elif table == "trading_accounts":
                # Assign first account to admin
                count = self.fix_table_user_ids(table, admin_id, "id = 1")
            elif table == "trade_plans":
                # Assign first 20 plans to admin
                count = self.fix_table_user_ids(table, admin_id, "id <= 20")
            elif table == "alerts":
                # Assign first 65 alerts to admin
                count = self.fix_table_user_ids(table, admin_id, "id <= 65")
            elif table == "cash_flows":
                # Assign first 16 cash flows to admin
                count = self.fix_table_user_ids(table, admin_id, "id <= 16")
            elif table == "watch_lists":
                # Assign first 2 watch lists to admin
                count = self.fix_table_user_ids(table, admin_id, "id <= 2")
            else:
                # Assign all remaining to admin
                count = self.fix_table_user_ids(table, admin_id)

            total_fixed += count

        logger.info(f"✅ Fixed {total_fixed} records for admin user")
        return total_fixed

    def fix_user_data(self):
        """Fix all data that should belong to regular user"""
        logger.info("🔧 Fixing regular user data...")
        user_id = self.get_user_id("user")

        tables_to_fix = [
            "trading_accounts",
            "trades",
            "trade_plans",
            "executions",
            "cash_flows",
            "alerts",
            "notes",
            "watch_lists",
            "import_sessions"
        ]

        total_fixed = 0
        for table in tables_to_fix:
            # Assign remaining records to user
            if table == "trades":
                # Assign trades 16-95 to user
                count = self.fix_table_user_ids(table, user_id, "id BETWEEN 16 AND 95")
            elif table == "trading_accounts":
                # Assign second account to user
                count = self.fix_table_user_ids(table, user_id, "id = 2")
            elif table == "trade_plans":
                # Assign plans 21-140 to user
                count = self.fix_table_user_ids(table, user_id, "id BETWEEN 21 AND 140")
            elif table == "alerts":
                # Assign alerts 66-130 to user
                count = self.fix_table_user_ids(table, user_id, "id BETWEEN 66 AND 130")
            elif table == "cash_flows":
                # Assign cash flows 17-51 to user
                count = self.fix_table_user_ids(table, user_id, "id BETWEEN 17 AND 51")
            elif table == "watch_lists":
                # Assign watch lists 3-4 to user
                count = self.fix_table_user_ids(table, user_id, "id BETWEEN 3 AND 4")
            else:
                # Assign remaining records
                count = self.fix_table_user_ids(table, user_id)

            total_fixed += count

        logger.info(f"✅ Fixed {total_fixed} records for regular user")
        return total_fixed

    def verify_fixes(self):
        """Verify that all fixes worked correctly"""
        logger.info("🔍 Verifying fixes...")

        # Check each user has their expected data
        users_to_check = [
            ("admin", {"trades": 15, "trading_accounts": 1, "trade_plans": 20, "alerts": 65, "cash_flows": 16, "watch_lists": 2}),
            ("user", {"trades": 80, "trading_accounts": 1, "trade_plans": 120, "alerts": 65, "cash_flows": 35, "watch_lists": 2})
        ]

        all_correct = True

        for username, expected_counts in users_to_check:
            user_id = self.get_user_id(username)
            logger.info(f"Verifying {username} (ID: {user_id})...")

            for table, expected_count in expected_counts.items():
                try:
                    result = self.db.execute(text(f"SELECT COUNT(*) FROM {table} WHERE user_id = :user_id"),
                                           {"user_id": user_id})
                    actual_count = result.fetchone()[0]

                    if actual_count == expected_count:
                        logger.info(f"  ✅ {table}: {actual_count} records")
                    else:
                        logger.error(f"  ❌ {table}: Expected {expected_count}, got {actual_count}")
                        all_correct = False

                except Exception as e:
                    logger.error(f"  ❌ Error checking {table}: {e}")
                    all_correct = False

        return all_correct

    def run_fixes(self):
        """Run all fixes"""
        try:
            logger.info("🛠️ Starting database user_id fixes...")

            # Fix admin data
            admin_fixed = self.fix_admin_data()

            # Fix user data
            user_fixed = self.fix_user_data()

            # Verify
            verification_passed = self.verify_fixes()

            logger.info(f"📊 Summary:")
            logger.info(f"  - Admin records fixed: {admin_fixed}")
            logger.info(f"  - User records fixed: {user_fixed}")
            logger.info(f"  - Verification: {'✅ PASSED' if verification_passed else '❌ FAILED'}")

            if verification_passed:
                logger.info("🎉 All database user_id fixes completed successfully!")
                return True
            else:
                logger.error("❌ Some fixes failed verification")
                return False

        except Exception as e:
            logger.error(f"💥 Fix process failed: {e}")
            self.db.rollback()
            return False
        finally:
            self.db.close()

def main():
    fixer = DatabaseUserIdFixer()
    success = fixer.run_fixes()
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
