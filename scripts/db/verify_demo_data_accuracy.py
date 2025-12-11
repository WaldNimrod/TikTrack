#!/usr/bin/env python3
"""
Demo Data Accuracy Verification Script
======================================

Verifies that generated demo data matches the MULTI_USER_DATA_DISTRIBUTION.md specifications.
Checks data counts, user assignments, and data integrity for all users.

Usage:
    python3 scripts/db/verify_demo_data_accuracy.py [--verbose] [--json]

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

from sqlalchemy import create_engine, text, inspect
from sqlalchemy.pool import QueuePool


@dataclass
class UserDataCounts:
    """Data counts for a specific user"""
    username: str
    user_id: int
    trading_accounts: int
    trades: int
    trade_plans: int
    user_tickers: int
    alerts: int
    notes: int
    cash_flows: int
    ai_analysis_requests: int
    executions: int
    watch_lists: int


@dataclass
class DataVerificationResult:
    """Result of data verification"""
    users: List[UserDataCounts]
    issues: List[str]
    is_accurate: bool
    total_issues: int


class DemoDataVerifier:
    """Verifies demo data accuracy against specifications"""

    def __init__(self, database_url: str, verbose: bool = False):
        self.database_url = database_url
        self.verbose = verbose
        self.engine = None
        self.logger = get_logger()

        # Expected counts per user (from MULTI_USER_DATA_DISTRIBUTION.md)
        self.EXPECTED_COUNTS = {
            'user': {
                'trading_accounts': 2,
                'trades': 80,
                'trade_plans': 120,
                'user_tickers': 50,  # Should have all 50 tickers
                'alerts': None,  # Not specified exactly
                'notes': None,   # Not specified exactly
                'cash_flows': None,  # Derived from trades
                'ai_analysis_requests': None,  # Not specified exactly
                'executions': None,  # Derived from trades
                'watch_lists': 3
            },
            'admin': {
                'trading_accounts': 1,
                'trades': 15,
                'trade_plans': 20,
                'user_tickers': 10,
                'alerts': None,
                'notes': None,
                'cash_flows': None,
                'ai_analysis_requests': None,
                'executions': None,
                'watch_lists': 2
            },
            'nimrod': {
                'trading_accounts': 0,
                'trades': 0,
                'trade_plans': 0,
                'user_tickers': 0,
                'alerts': 0,
                'notes': 0,
                'cash_flows': 0,
                'ai_analysis_requests': 0,
                'executions': 0,
                'watch_lists': 0
            }
        }

        self._init_engine()

    def _init_engine(self):
        """Initialize database engine"""
        try:
            self.engine = create_engine(
                self.database_url,
                poolclass=QueuePool,
                pool_size=5,
                max_overflow=10,
                pool_pre_ping=True,
                echo=False
            )
        except Exception as e:
            self.logger.error(f"❌ Failed to initialize database engine: {e}")
            sys.exit(1)

    def get_user_data_counts(self, username: str) -> Optional[UserDataCounts]:
        """Get data counts for a specific user"""
        try:
            with self.engine.connect() as conn:
                # Get user ID
                user_result = conn.execute(text("SELECT id FROM users WHERE username = :username"), {'username': username})
                user_row = user_result.fetchone()
                if not user_row:
                    return None

                user_id = user_row[0]

                # Get counts for each table
                queries = {
                    'trading_accounts': "SELECT COUNT(*) FROM trading_accounts WHERE user_id = :user_id",
                    'trades': "SELECT COUNT(*) FROM trades WHERE user_id = :user_id",
                    'trade_plans': "SELECT COUNT(*) FROM trade_plans WHERE user_id = :user_id",
                    'user_tickers': "SELECT COUNT(*) FROM user_tickers WHERE user_id = :user_id",
                    'alerts': "SELECT COUNT(*) FROM alerts WHERE user_id = :user_id",
                    'notes': "SELECT COUNT(*) FROM notes WHERE user_id = :user_id",
                    'cash_flows': "SELECT COUNT(*) FROM cash_flows WHERE user_id = :user_id",
                    'ai_analysis_requests': "SELECT COUNT(*) FROM ai_analysis_requests WHERE user_id = :user_id",
                    'executions': "SELECT COUNT(*) FROM executions WHERE user_id = :user_id",
                    'watch_lists': "SELECT COUNT(*) FROM watch_lists WHERE user_id = :user_id"
                }

                counts = {}
                for table, query in queries.items():
                    result = conn.execute(text(query), {'user_id': user_id})
                    counts[table] = result.fetchone()[0]

                return UserDataCounts(
                    username=username,
                    user_id=user_id,
                    trading_accounts=counts['trading_accounts'],
                    trades=counts['trades'],
                    trade_plans=counts['trade_plans'],
                    user_tickers=counts['user_tickers'],
                    alerts=counts['alerts'],
                    notes=counts['notes'],
                    cash_flows=counts['cash_flows'],
                    ai_analysis_requests=counts['ai_analysis_requests'],
                    executions=counts['executions'],
                    watch_lists=counts['watch_lists']
                )

        except Exception as e:
            self.logger.error(f"❌ Error getting data counts for user {username}: {e}")
            return None

    def verify_user_data(self, user_counts: UserDataCounts) -> List[str]:
        """Verify data counts for a user against expected values"""
        issues = []
        expected = self.EXPECTED_COUNTS.get(user_counts.username)

        if not expected:
            issues.append(f"Unknown user {user_counts.username} - no expected counts defined")
            return issues

        # Check exact matches
        exact_checks = [
            ('trading_accounts', 'trading_accounts'),
            ('trades', 'trades'),
            ('trade_plans', 'trade_plans'),
            ('user_tickers', 'user_tickers'),
            ('watch_lists', 'watch_lists')
        ]

        for field, expected_key in exact_checks:
            expected_value = expected.get(expected_key)
            actual_value = getattr(user_counts, field)

            if expected_value is not None:
                if actual_value != expected_value:
                    issues.append(f"{user_counts.username}.{field}: expected {expected_value}, got {actual_value}")
                elif self.verbose:
                    self.logger.info(f"✅ {user_counts.username}.{field}: {actual_value} (matches expected)")

        # Check that nimrod has no data
        if user_counts.username == 'nimrod':
            data_fields = ['trading_accounts', 'trades', 'trade_plans', 'user_tickers',
                          'alerts', 'notes', 'cash_flows', 'ai_analysis_requests',
                          'executions', 'watch_lists']
            for field in data_fields:
                value = getattr(user_counts, field)
                if value != 0:
                    issues.append(f"{user_counts.username}.{field}: expected 0, got {value}")

        # Check derived relationships
        # Executions should be roughly equal to trades (or more if there are partial fills)
        if user_counts.username in ['user', 'admin']:
            if user_counts.executions < user_counts.trades:
                issues.append(f"{user_counts.username}.executions: {user_counts.executions} < trades: {user_counts.trades}")

        # Cash flows should be roughly equal to trades (entry + exit)
        if user_counts.username in ['user', 'admin']:
            expected_min_cash_flows = user_counts.trades * 2  # At least entry and exit
            if user_counts.cash_flows < expected_min_cash_flows:
                issues.append(f"{user_counts.username}.cash_flows: {user_counts.cash_flows} < expected min {expected_min_cash_flows}")

        return issues

    def verify_data_integrity(self) -> List[str]:
        """Verify data integrity across the database"""
        issues = []

        try:
            with self.engine.connect() as conn:
                # Check for orphaned records
                orphan_checks = [
                    ("executions", "trades", "trade_id"),
                    ("cash_flows", "trades", "trade_id"),
                    ("alerts", "tickers", "ticker_id"),
                    ("user_tickers", "tickers", "ticker_id"),
                    ("user_tickers", "users", "user_id"),
                ]

                for child_table, parent_table, fk_column in orphan_checks:
                    query = f"""
                    SELECT COUNT(*) FROM {child_table} c
                    LEFT JOIN {parent_table} p ON c.{fk_column} = p.id
                    WHERE p.id IS NULL
                    """
                    result = conn.execute(text(query))
                    orphan_count = result.fetchone()[0]

                    if orphan_count > 0:
                        issues.append(f"Orphaned records in {child_table}: {orphan_count} records with invalid {fk_column}")

                # Check for duplicate user_ticker assignments
                duplicate_query = """
                SELECT user_id, ticker_id, COUNT(*)
                FROM user_tickers
                GROUP BY user_id, ticker_id
                HAVING COUNT(*) > 1
                """
                result = conn.execute(text(duplicate_query))
                duplicates = result.fetchall()

                if duplicates:
                    issues.append(f"Duplicate user_ticker assignments: {len(duplicates)} duplicates found")

                # Check that all tickers have at least one user (except system tickers like SPY)
                unassigned_query = """
                SELECT COUNT(*) FROM tickers t
                WHERE NOT EXISTS (
                    SELECT 1 FROM user_tickers ut WHERE ut.ticker_id = t.id
                ) AND t.symbol != 'SPY'
                """
                result = conn.execute(text(unassigned_query))
                unassigned_count = result.fetchone()[0]

                if unassigned_count > 0:
                    issues.append(f"Unassigned tickers (excluding SPY): {unassigned_count}")

        except Exception as e:
            issues.append(f"Data integrity check error: {str(e)}")

        return issues

    def verify_demo_data_accuracy(self) -> DataVerificationResult:
        """Perform complete demo data accuracy verification"""
        if self.verbose:
            self.logger.info("🔍 Starting demo data accuracy verification...")

        users_to_check = ['nimrod', 'admin', 'user']
        user_data = []
        all_issues = []

        # Get data for each user
        for username in users_to_check:
            if self.verbose:
                self.logger.info(f"  Checking user: {username}")

            user_counts = self.get_user_data_counts(username)
            if user_counts:
                user_data.append(user_counts)
                user_issues = self.verify_user_data(user_counts)
                all_issues.extend(user_issues)
            else:
                all_issues.append(f"Could not get data counts for user {username}")

        # Check data integrity
        if self.verbose:
            self.logger.info("  Checking data integrity...")

        integrity_issues = self.verify_data_integrity()
        all_issues.extend(integrity_issues)

        # Determine if data is accurate
        is_accurate = len(all_issues) == 0

        return DataVerificationResult(
            users=user_data,
            issues=all_issues,
            is_accurate=is_accurate,
            total_issues=len(all_issues)
        )

    def generate_report(self, result: DataVerificationResult, format_type: str = 'text') -> str:
        """Generate verification report"""
        if format_type == 'json':
            # Convert dataclasses to dicts for JSON serialization
            users_dict = []
            for user in result.users:
                users_dict.append({
                    'username': user.username,
                    'user_id': user.user_id,
                    'trading_accounts': user.trading_accounts,
                    'trades': user.trades,
                    'trade_plans': user.trade_plans,
                    'user_tickers': user.user_tickers,
                    'alerts': user.alerts,
                    'notes': user.notes,
                    'cash_flows': user.cash_flows,
                    'ai_analysis_requests': user.ai_analysis_requests,
                    'executions': user.executions,
                    'watch_lists': user.watch_lists
                })

            return json.dumps({
                'summary': {
                    'total_users': len(result.users),
                    'is_accurate': result.is_accurate,
                    'total_issues': result.total_issues
                },
                'users': users_dict,
                'issues': result.issues
            }, indent=2, ensure_ascii=False)

        # Text format
        report = []
        report.append("=" * 70)
        report.append("Demo Data Accuracy Verification Report")
        report.append("=" * 70)
        report.append("")

        # Summary
        report.append("📊 SUMMARY")
        report.append("-" * 40)
        report.append(f"Users Checked:    {len(result.users)}")
        report.append(f"Total Issues:     {result.total_issues}")
        report.append(f"Data Accuracy:    {'✅ ACCURATE' if result.is_accurate else '❌ ISSUES FOUND'}")
        report.append("")

        # User Data
        if result.users:
            report.append("👥 USER DATA COUNTS")
            report.append("-" * 40)
            report.append("<15")
            report.append("-" * 90)

            for user in result.users:
                report.append("<15")
                report.append("<15")
                report.append("<15")
                report.append("<15")
                report.append("<15")
                report.append("<15")
                report.append("<15")
                report.append("<15")
                report.append("<15")
                report.append("<15")
                report.append("<15")

        # Expected vs Actual Summary
        report.append("")
        report.append("🎯 EXPECTED VS ACTUAL SUMMARY")
        report.append("-" * 40)

        expected_summary = {
            'user': {'trading_accounts': 2, 'trades': 80, 'trade_plans': 120, 'user_tickers': 50, 'watch_lists': 3},
            'admin': {'trading_accounts': 1, 'trades': 15, 'trade_plans': 20, 'user_tickers': 10, 'watch_lists': 2},
            'nimrod': {'trading_accounts': 0, 'trades': 0, 'trade_plans': 0, 'user_tickers': 0, 'watch_lists': 0}
        }

        report.append("<12")
        report.append("-" * 80)

        for user in result.users:
            expected = expected_summary.get(user.username, {})
            report.append("<12")
            report.append("<12")

            # Check key metrics
            key_metrics = ['trading_accounts', 'trades', 'trade_plans', 'user_tickers', 'watch_lists']
            for metric in key_metrics:
                expected_val = expected.get(metric)
                actual_val = getattr(user, metric)
                status = "✅" if expected_val is not None and actual_val == expected_val else ("❌" if expected_val is not None else "⚠️")
                report.append("<12")

        # Issues
        if result.issues:
            report.append("")
            report.append("❌ ISSUES FOUND")
            report.append("-" * 40)
            for i, issue in enumerate(result.issues, 1):
                report.append(f"{i:2d}. {issue}")
        else:
            report.append("")
            report.append("✅ NO ISSUES FOUND")
            report.append("Demo data matches specifications perfectly!")

        report.append("")
        report.append("=" * 70)

        return "\n".join(report)


def main():
    """Main entry point"""
    import argparse

    parser = argparse.ArgumentParser(
        description='Verify demo data accuracy against specifications',
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
        '--database-url',
        help='Database URL (default: from environment)'
    )

    args = parser.parse_args()

    logger = get_logger()

    if args.verbose:
        logger.info("🚀 Starting Demo Data Accuracy Verification")

    # Set database URL
    database_url = args.database_url
    if not database_url:
        # Try to get from environment or use defaults
        database_url = os.getenv("DATABASE_URL")
        if not database_url:
            # Default to development database
            database_url = "postgresql://TikTrakDBAdmin:BigMeZoo1974!?@localhost:5432/TikTrack-db-development"

    if args.verbose:
        logger.info(f"📊 Database: {database_url.split('@')[-1]}")

    # Create verifier
    verifier = DemoDataVerifier(database_url, args.verbose)

    # Verify data accuracy
    result = verifier.verify_demo_data_accuracy()

    # Generate and output report
    format_type = 'json' if args.json else 'text'
    report = verifier.generate_report(result, format_type)

    print(report)

    # Save report to file if not JSON
    if not args.json:
        output_file = project_root / "documentation" / "05-REPORTS" / "DEMO_DATA_ACCURACY_VERIFICATION.md"
        output_file.parent.mkdir(parents=True, exist_ok=True)

        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(report)

        if args.verbose:
            logger.info(f"📄 Report saved to: {output_file}")

    # Exit with appropriate code
    sys.exit(0 if result.is_accurate else 1)


if __name__ == '__main__':
    main()


