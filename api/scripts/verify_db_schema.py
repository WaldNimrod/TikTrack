"""
Database Schema Verification Script
Task: 20.1.1
Status: COMPLETED

Verifies that required tables, indexes, and constraints exist in the database.
"""

import os
import sys
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import List, Dict, Tuple
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DBSchemaVerifier:
    """Verifies database schema matches requirements."""

    REQUIRED_TABLES = [
        "user_data.users",
        "user_data.password_reset_requests",
        "user_data.user_api_keys",
    ]

    REQUIRED_INDEXES = [
        ("user_data.users", "idx_users_email"),
        ("user_data.users", "idx_users_username"),
        ("user_data.users", "idx_users_phone_unique"),
        ("user_data.users", "idx_users_phone"),
        ("user_data.password_reset_requests", "idx_password_reset_token"),
        ("user_data.password_reset_requests", "idx_password_reset_user_id"),
        ("user_data.password_reset_requests", "idx_password_reset_expired"),
        ("user_data.user_api_keys", "idx_user_api_keys_user_id"),
        ("user_data.user_api_keys", "idx_user_api_keys_provider"),
        ("user_data.user_api_keys", "idx_user_api_keys_verified"),
    ]

    REQUIRED_CONSTRAINTS = [
        ("user_data.users", "users_phone_format"),
        ("user_data.password_reset_requests", "password_reset_token_length"),
        ("user_data.password_reset_requests", "password_reset_code_length"),
        ("user_data.password_reset_requests", "password_reset_attempts_limit"),
        ("user_data.user_api_keys", "user_api_keys_unique_user_provider"),
        ("user_data.user_api_keys", "user_api_keys_encrypted_not_empty"),
    ]

    def __init__(self, db_url: str = None):
        """
        Initialize verifier.

        Args:
            db_url: PostgreSQL connection string. If not provided, reads from DATABASE_URL env var.
        """
        self.db_url = db_url or os.getenv("DATABASE_URL")
        if not self.db_url:
            raise ValueError("DATABASE_URL environment variable not set")
        self.conn = None

    def connect(self):
        """Establish database connection."""
        try:
            self.conn = psycopg2.connect(self.db_url)
            logger.info("Connected to database")
        except Exception as e:
            logger.error(f"Failed to connect to database: {e}")
            raise

    def disconnect(self):
        """Close database connection."""
        if self.conn:
            self.conn.close()
            logger.info("Disconnected from database")

    def verify_tables(self) -> Tuple[bool, List[str]]:
        """
        Verify required tables exist.

        Returns:
            Tuple of (all_exist: bool, missing_tables: List[str])
        """
        with self.conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT schemaname || '.' || tablename AS full_name
                FROM pg_tables
                WHERE schemaname IN ('user_data', 'market_data')
                ORDER BY schemaname, tablename;
            """
            )
            existing_tables = {row["full_name"] for row in cur.fetchall()}

        missing = [t for t in self.REQUIRED_TABLES if t not in existing_tables]
        all_exist = len(missing) == 0

        if all_exist:
            logger.info("✅ All required tables exist")
        else:
            logger.error(f"❌ Missing tables: {missing}")

        return all_exist, missing

    def verify_indexes(self) -> Tuple[bool, List[str]]:
        """
        Verify required indexes exist.

        Returns:
            Tuple of (all_exist: bool, missing_indexes: List[str])
        """
        with self.conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT 
                    schemaname || '.' || tablename AS table_name,
                    indexname AS index_name
                FROM pg_indexes
                WHERE schemaname = 'user_data'
                ORDER BY tablename, indexname;
            """
            )
            existing_indexes = {(row["table_name"], row["index_name"]) for row in cur.fetchall()}

        missing = [
            f"{table}.{index}"
            for table, index in self.REQUIRED_INDEXES
            if (table, index) not in existing_indexes
        ]
        all_exist = len(missing) == 0

        if all_exist:
            logger.info("✅ All required indexes exist")
        else:
            logger.error(f"❌ Missing indexes: {missing}")

        return all_exist, missing

    def verify_constraints(self) -> Tuple[bool, List[str]]:
        """
        Verify required constraints exist.

        Returns:
            Tuple of (all_exist: bool, missing_constraints: List[str])
        """
        with self.conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT 
                    n.nspname || '.' || t.relname AS table_name,
                    c.conname AS constraint_name
                FROM pg_constraint c
                JOIN pg_class t ON c.conrelid = t.oid
                JOIN pg_namespace n ON t.relnamespace = n.oid
                WHERE n.nspname = 'user_data'
                AND c.contype IN ('c', 'u', 'f', 'p')
                ORDER BY t.relname, c.conname;
            """
            )
            existing_constraints = {
                (row["table_name"], row["constraint_name"]) for row in cur.fetchall()
            }

        missing = [
            f"{table}.{constraint}"
            for table, constraint in self.REQUIRED_CONSTRAINTS
            if (table, constraint) not in existing_constraints
        ]
        all_exist = len(missing) == 0

        if all_exist:
            logger.info("✅ All required constraints exist")
        else:
            logger.error(f"❌ Missing constraints: {missing}")

        return all_exist, missing

    def verify_foreign_keys(self) -> Tuple[bool, List[str]]:
        """
        Verify foreign key relationships.

        Returns:
            Tuple of (all_valid: bool, issues: List[str])
        """
        issues = []

        # Verify password_reset_requests.user_id → users.id
        with self.conn.cursor() as cur:
            cur.execute(
                """
                SELECT COUNT(*) 
                FROM information_schema.table_constraints tc
                JOIN information_schema.key_column_usage kcu
                    ON tc.constraint_name = kcu.constraint_name
                WHERE tc.table_schema = 'user_data'
                AND tc.table_name = 'password_reset_requests'
                AND tc.constraint_type = 'FOREIGN KEY'
                AND kcu.column_name = 'user_id'
                AND kcu.referenced_table_schema = 'user_data'
                AND kcu.referenced_table_name = 'users';
            """
            )
            if cur.fetchone()[0] == 0:
                issues.append("password_reset_requests.user_id FK to users.id missing")

        # Verify user_api_keys.user_id → users.id
        with self.conn.cursor() as cur:
            cur.execute(
                """
                SELECT COUNT(*) 
                FROM information_schema.table_constraints tc
                JOIN information_schema.key_column_usage kcu
                    ON tc.constraint_name = kcu.constraint_name
                WHERE tc.table_schema = 'user_data'
                AND tc.table_name = 'user_api_keys'
                AND tc.constraint_type = 'FOREIGN KEY'
                AND kcu.column_name = 'user_id'
                AND kcu.referenced_table_schema = 'user_data'
                AND kcu.referenced_table_name = 'users';
            """
            )
            if cur.fetchone()[0] == 0:
                issues.append("user_api_keys.user_id FK to users.id missing")

        all_valid = len(issues) == 0

        if all_valid:
            logger.info("✅ All foreign keys valid")
        else:
            logger.error(f"❌ Foreign key issues: {issues}")

        return all_valid, issues

    def verify_all(self) -> Dict[str, bool]:
        """
        Run all verification checks.

        Returns:
            Dictionary with verification results
        """
        logger.info("Starting database schema verification...")

        results = {}

        # Verify tables
        tables_ok, _ = self.verify_tables()
        results["tables"] = tables_ok

        # Verify indexes
        indexes_ok, _ = self.verify_indexes()
        results["indexes"] = indexes_ok

        # Verify constraints
        constraints_ok, _ = self.verify_constraints()
        results["constraints"] = constraints_ok

        # Verify foreign keys
        fks_ok, _ = self.verify_foreign_keys()
        results["foreign_keys"] = fks_ok

        # Overall status
        all_ok = all(results.values())
        results["overall"] = all_ok

        if all_ok:
            logger.info("✅ Database schema verification PASSED")
        else:
            logger.error("❌ Database schema verification FAILED")

        return results


def main():
    """Main entry point for verification script."""
    verifier = DBSchemaVerifier()

    try:
        verifier.connect()
        results = verifier.verify_all()

        # Exit with error code if verification failed
        sys.exit(0 if results["overall"] else 1)
    except Exception as e:
        logger.error(f"Verification failed: {e}")
        sys.exit(1)
    finally:
        verifier.disconnect()


if __name__ == "__main__":
    main()
