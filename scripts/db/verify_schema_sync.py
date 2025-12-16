#!/usr/bin/env python3
"""
Schema Sync Verification Script
===============================

Verifies that production database schema is 100% synchronized with development schema.
Runs after migration application to confirm successful synchronization.

Usage:
    python3 scripts/db/verify_schema_sync.py [--verbose] [--json]

Options:
    --verbose: Show detailed verification information
    --json: Output results in JSON format

Author: TikTrack Development Team
Version: 1.0.0
Date: December 2025
"""

import os
import sys
import json
from pathlib import Path
from typing import Dict, List, Any, Optional
from dataclasses import dataclass

# Add project root to path
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

try:
    from logger import get_logger
except ImportError:
    # Simple logger fallback
    class SimpleLogger:
        def info(self, msg): print(f"ℹ️  {msg}")
        def error(self, msg): print(f"❌ {msg}")
        def warning(self, msg): print(f"⚠️  {msg}")
        def success(self, msg): print(f"✅ {msg}")

    get_logger = lambda: SimpleLogger()

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.pool import QueuePool


@dataclass
class VerificationResult:
    """Result of schema verification"""
    total_tables: int
    matching_tables: int
    tables_with_issues: int
    issues: List[str]
    is_synced: bool


class SchemaVerifier:
    """Verifies schema synchronization between dev and production"""

    def __init__(self, dev_url: str, prod_url: str, verbose: bool = False):
        self.dev_url = dev_url
        self.prod_url = prod_url
        self.verbose = verbose
        self.dev_engine = None
        self.prod_engine = None
        self.logger = get_logger()

        self._init_engines()

    def _init_engines(self):
        """Initialize database engines"""
        try:
            self.dev_engine = create_engine(
                self.dev_url,
                poolclass=QueuePool,
                pool_size=5,
                max_overflow=10,
                pool_pre_ping=True,
                echo=False
            )

            self.prod_engine = create_engine(
                self.prod_url,
                poolclass=QueuePool,
                pool_size=5,
                max_overflow=10,
                pool_pre_ping=True,
                echo=False
            )

            if self.verbose:
                self.logger.info("✅ Database engines initialized")

        except Exception as e:
            self.logger.error(f"❌ Failed to initialize database engines: {e}")
            sys.exit(1)

    def test_connections(self) -> bool:
        """Test database connections"""
        try:
            with self.dev_engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            with self.prod_engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            return True
        except Exception as e:
            self.logger.error(f"❌ Database connection failed: {e}")
            return False

    def verify_table_exists(self, table: str) -> tuple[bool, Optional[str]]:
        """Verify a table exists in both databases"""
        try:
            dev_inspector = inspect(self.dev_engine)
            prod_inspector = inspect(self.prod_engine)

            dev_exists = dev_inspector.has_table(table)
            prod_exists = prod_inspector.has_table(table)

            if dev_exists and prod_exists:
                return True, None
            elif dev_exists and not prod_exists:
                return False, f"Table {table} missing in production"
            elif not dev_exists and prod_exists:
                return False, f"Table {table} exists in production but not in development"
            else:
                return False, f"Table {table} missing in both databases"

        except Exception as e:
            return False, f"Error checking table {table}: {str(e)}"

    def verify_table_structure(self, table: str) -> tuple[bool, Optional[List[str]]]:
        """Verify table structure matches between databases"""
        try:
            dev_inspector = inspect(self.dev_engine)
            prod_inspector = inspect(self.prod_engine)

            # Get columns
            dev_columns = dev_inspector.get_columns(table)
            prod_columns = prod_inspector.get_columns(table)

            # Convert to comparable format
            def column_signature(col):
                return {
                    'name': col['name'],
                    'type': str(col['type']),
                    'nullable': col.get('nullable', True),
                    'default': str(col.get('default')) if col.get('default') else None,
                    'primary_key': col.get('primary_key', False)
                }

            dev_sigs = {col['name']: column_signature(col) for col in dev_columns}
            prod_sigs = {col['name']: column_signature(col) for col in prod_columns}

            issues = []

            # Check for missing/extra columns
            dev_col_names = set(dev_sigs.keys())
            prod_col_names = set(prod_sigs.keys())

            missing_in_prod = dev_col_names - prod_col_names
            extra_in_prod = prod_col_names - dev_col_names

            if missing_in_prod:
                issues.append(f"Missing columns in production: {', '.join(missing_in_prod)}")

            if extra_in_prod:
                issues.append(f"Extra columns in production: {', '.join(extra_in_prod)}")

            # Check column differences
            shared_cols = dev_col_names & prod_col_names
            for col_name in shared_cols:
                dev_sig = dev_sigs[col_name]
                prod_sig = prod_sigs[col_name]

                if dev_sig != prod_sig:
                    issues.append(f"Column {col_name} differs: dev={dev_sig}, prod={prod_sig}")

            # Check indexes (basic check)
            dev_indexes = {idx['name']: idx for idx in dev_inspector.get_indexes(table)}
            prod_indexes = {idx['name']: idx for idx in prod_inspector.get_indexes(table)}

            dev_idx_names = set(dev_indexes.keys())
            prod_idx_names = set(prod_indexes.keys())

            missing_idx = dev_idx_names - prod_idx_names
            extra_idx = prod_idx_names - dev_idx_names

            if missing_idx:
                issues.append(f"Missing indexes in production: {', '.join(missing_idx)}")

            if extra_idx:
                issues.append(f"Extra indexes in production: {', '.join(extra_idx)}")

            return len(issues) == 0, issues if issues else None

        except Exception as e:
            return False, [f"Error verifying table structure: {str(e)}"]

    def verify_schema_sync(self) -> VerificationResult:
        """Perform complete schema synchronization verification"""
        if not self.test_connections():
            return VerificationResult(0, 0, 0, ["Database connection failed"], False)

        if self.verbose:
            self.logger.info("🔍 Starting schema synchronization verification...")

        issues = []
        total_tables = 0
        matching_tables = 0
        tables_with_issues = 0

        try:
            # Get all tables from development
            dev_inspector = inspect(self.dev_engine)
            dev_tables = set(dev_inspector.get_table_names())
            total_tables = len(dev_tables)

            if self.verbose:
                self.logger.info(f"📊 Verifying {total_tables} tables...")

            for table in sorted(dev_tables):
                if self.verbose:
                    self.logger.info(f"  Checking table: {table}")

                # Check table existence
                exists, exist_issue = self.verify_table_exists(table)
                if not exists:
                    issues.append(f"Table {table}: {exist_issue}")
                    tables_with_issues += 1
                    continue

                # Check table structure
                structure_ok, structure_issues = self.verify_table_structure(table)
                if not structure_ok:
                    issues.extend([f"Table {table}: {issue}" for issue in structure_issues])
                    tables_with_issues += 1
                else:
                    matching_tables += 1

                    if self.verbose:
                        self.logger.info(f"  ✅ {table}: OK")

        except Exception as e:
            issues.append(f"Verification error: {str(e)}")
            return VerificationResult(total_tables, matching_tables, tables_with_issues, issues, False)

        is_synced = len(issues) == 0

        result = VerificationResult(
            total_tables=total_tables,
            matching_tables=matching_tables,
            tables_with_issues=tables_with_issues,
            issues=issues,
            is_synced=is_synced
        )

        return result

    def generate_report(self, result: VerificationResult, format_type: str = 'text') -> str:
        """Generate verification report"""
        if format_type == 'json':
            return json.dumps({
                'summary': {
                    'total_tables': result.total_tables,
                    'matching_tables': result.matching_tables,
                    'tables_with_issues': result.tables_with_issues,
                    'is_synced': result.is_synced,
                    'sync_percentage': (result.matching_tables / result.total_tables * 100) if result.total_tables > 0 else 0
                },
                'issues': result.issues
            }, indent=2, ensure_ascii=False)

        # Text format
        report = []
        report.append("=" * 60)
        report.append("Schema Synchronization Verification Report")
        report.append("=" * 60)
        report.append("")
        report.append(f"Development: {self.dev_url.split('@')[-1]}")
        report.append(f"Production:  {self.prod_url.split('@')[-1]}")
        report.append("")

        # Summary
        report.append("📊 SUMMARY")
        report.append("-" * 30)
        report.append(f"Total Tables:     {result.total_tables}")
        report.append(f"Matching Tables:  {result.matching_tables}")
        report.append(f"Tables with Issues: {result.tables_with_issues}")

        if result.total_tables > 0:
            sync_percentage = result.matching_tables / result.total_tables * 100
            report.append(".1f")
            report.append(f"Sync Status:      {'✅ 100% SYNCHRONIZED' if result.is_synced else '❌ OUT OF SYNC'}")
        report.append("")

        # Issues
        if result.issues:
            report.append("❌ ISSUES FOUND")
            report.append("-" * 30)
            for i, issue in enumerate(result.issues, 1):
                report.append(f"{i:2d}. {issue}")
            report.append("")
        else:
            report.append("✅ NO ISSUES FOUND")
            report.append("")

        # Conclusion
        report.append("📋 CONCLUSION")
        report.append("-" * 30)
        if result.is_synced:
            report.append("🎉 Schema synchronization verification PASSED!")
            report.append("Both databases have identical structure.")
            report.append("Ready to proceed with data operations.")
        else:
            report.append("⚠️  Schema synchronization verification FAILED!")
            report.append(f"Found {len(result.issues)} issues that need to be resolved.")
            report.append("Please run migrations or fix schema differences.")

        report.append("")
        report.append("=" * 60)

        return "\n".join(report)


def main():
    """Main entry point"""
    import argparse

    parser = argparse.ArgumentParser(
        description='Verify schema synchronization between development and production',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    parser.add_argument(
        '--json',
        action='store_true',
        help='Output results in JSON format'
    )
    parser.add_argument(
        '--verbose',
        action='store_true',
        help='Show detailed verification information'
    )
    parser.add_argument(
        '--dev-url',
        help='Development database URL'
    )
    parser.add_argument(
        '--prod-url',
        help='Production database URL'
    )

    args = parser.parse_args()

    logger = get_logger()

    if args.verbose:
        logger.info("🚀 Starting Schema Sync Verification")

    # Set database URLs
    dev_url = args.dev_url or os.getenv("DEV_DATABASE_URL")
    prod_url = args.prod_url or os.getenv("PROD_DATABASE_URL")

    if not dev_url:
        dev_url = "postgresql://TikTrakDBAdmin:BigMeZoo1974!?@localhost:5432/TikTrack-db-development"

    if not prod_url:
        prod_url = "postgresql://tiktrack:tiktrack_dev_password@localhost:5432/tiktrack_dev"

    if args.verbose:
        logger.info(f"📊 Development: {dev_url.split('@')[-1]}")
        logger.info(f"🏭 Production: {prod_url.split('@')[-1]}")

    # Create verifier
    verifier = SchemaVerifier(dev_url, prod_url, args.verbose)

    # Verify schema sync
    result = verifier.verify_schema_sync()

    # Generate and output report
    format_type = 'json' if args.json else 'text'
    report = verifier.generate_report(result, format_type)

    print(report)

    # Save report to file if not JSON
    if not args.json:
        output_file = project_root / "documentation" / "production" / "SCHEMA_SYNC_VERIFICATION_REPORT.md"
        output_file.parent.mkdir(parents=True, exist_ok=True)

        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(report)

        if args.verbose:
            logger.info(f"📄 Report saved to: {output_file}")

    # Exit with appropriate code
    sys.exit(0 if result.is_synced else 1)


if __name__ == '__main__':
    main()



