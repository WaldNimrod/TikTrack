#!/usr/bin/env python3
"""
Database Schema Comparison Script
=================================

Compares database schemas between development and production databases
to identify differences in tables, columns, indexes, constraints, and triggers.

Usage:
    python3 scripts/db/compare_database_schemas.py [--json] [--markdown] [--verbose]

Options:
    --json: Output results in JSON format
    --markdown: Output results in Markdown format (default)
    --verbose: Show detailed progress information

Author: TikTrack Development Team
Version: 1.0.0
Date: December 2025
"""

import os
import sys
import json
import argparse
from pathlib import Path
from typing import Dict, List, Optional, Set, Tuple, Any
from dataclasses import dataclass, asdict

# Add project root to path
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

try:
    from config.settings import DATABASE_URL
except ImportError:
    # Try to load from production config
    sys.path.insert(0, str(project_root / "TikTrackApp-Production"))
    try:
        from config.settings import DATABASE_URL
    except ImportError:
        print("❌ Could not load database configuration")
        sys.exit(1)

from sqlalchemy import create_engine, inspect, text, MetaData
from sqlalchemy.engine import Engine
from sqlalchemy.pool import QueuePool


@dataclass
class ColumnInfo:
    """Column information"""
    name: str
    type: str
    notnull: int
    default: Optional[str]
    pk: int


@dataclass
class TableInfo:
    """Table information"""
    name: str
    columns: List[ColumnInfo]
    indexes: List[str]
    constraints: List[str]
    triggers: List[str]


@dataclass
class SchemaComparison:
    """Schema comparison results"""
    dev_tables: Set[str]
    prod_tables: Set[str]
    missing_tables: List[str]
    extra_tables: List[str]
    shared_tables: List[str]
    table_differences: Dict[str, Dict[str, Any]]


class SchemaComparator:
    """Compares database schemas between dev and production"""

    def __init__(self, dev_url: str, prod_url: str, verbose: bool = False):
        self.dev_url = dev_url
        self.prod_url = prod_url
        self.verbose = verbose
        self.dev_engine: Optional[Engine] = None
        self.prod_engine: Optional[Engine] = None

        # Initialize engines
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
                print("✅ Database engines initialized")

        except Exception as e:
            print(f"❌ Failed to initialize database engines: {e}")
            sys.exit(1)

    def test_connections(self) -> bool:
        """Test database connections"""
        try:
            with self.dev_engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            with self.prod_engine.connect() as conn:
                conn.execute(text("SELECT 1"))

            if self.verbose:
                print("✅ Database connections tested successfully")
            return True

        except Exception as e:
            print(f"❌ Database connection failed: {e}")
            return False

    def get_table_info(self, engine: Engine, table: str) -> TableInfo:
        """Get comprehensive table information"""
        inspector = inspect(engine)

        # Get columns
        columns = []
        for col in inspector.get_columns(table):
            columns.append(ColumnInfo(
                name=col['name'],
                type=str(col['type']),
                notnull=1 if col.get('nullable', True) == False else 0,
                default=str(col.get('default')) if col.get('default') else None,
                pk=1 if col.get('primary_key') else 0
            ))

        # Get indexes
        indexes = []
        for idx in inspector.get_indexes(table):
            indexes.append(idx['name'])

        # Get constraints (foreign keys, etc.)
        constraints = []
        try:
            for fk in inspector.get_foreign_keys(table):
                constraints.append(f"FK_{fk['name']}" if fk.get('name') else f"FK_{table}_unnamed")
        except:
            pass

        # Get triggers (PostgreSQL specific)
        triggers = []
        try:
            with engine.connect() as conn:
                result = conn.execute(text(f"""
                    SELECT trigger_name
                    FROM information_schema.triggers
                    WHERE event_object_table = '{table}'
                """))
                triggers = [row[0] for row in result]
        except:
            pass

        return TableInfo(
            name=table,
            columns=columns,
            indexes=sorted(indexes),
            constraints=sorted(constraints),
            triggers=sorted(triggers)
        )

    def compare_table_details(self, table: str) -> Dict[str, Any]:
        """Compare detailed table information"""
        differences = {}

        try:
            dev_info = self.get_table_info(self.dev_engine, table)
            prod_info = self.get_table_info(self.prod_engine, table)

            # Compare columns
            dev_cols = {col.name: col for col in dev_info.columns}
            prod_cols = {col.name: col for col in prod_info.columns}

            missing_cols = set(dev_cols.keys()) - set(prod_cols.keys())
            extra_cols = set(prod_cols.keys()) - set(dev_cols.keys())
            shared_cols = set(dev_cols.keys()) & set(prod_cols.keys())

            col_differences = []
            for col_name in shared_cols:
                dev_col = dev_cols[col_name]
                prod_col = prod_cols[col_name]
                if (dev_col.type != prod_col.type or
                    dev_col.notnull != prod_col.notnull or
                    dev_col.default != prod_col.default or
                    dev_col.pk != prod_col.pk):
                    col_differences.append({
                        'column': col_name,
                        'dev': asdict(dev_col),
                        'prod': asdict(prod_col)
                    })

            if missing_cols or extra_cols or col_differences:
                differences['columns'] = {
                    'missing_in_prod': sorted(missing_cols),
                    'extra_in_prod': sorted(extra_cols),
                    'differences': col_differences
                }

            # Compare indexes
            if set(dev_info.indexes) != set(prod_info.indexes):
                differences['indexes'] = {
                    'dev': sorted(dev_info.indexes),
                    'prod': sorted(prod_info.indexes),
                    'missing_in_prod': sorted(set(dev_info.indexes) - set(prod_info.indexes)),
                    'extra_in_prod': sorted(set(prod_info.indexes) - set(dev_info.indexes))
                }

            # Compare constraints
            if set(dev_info.constraints) != set(prod_info.constraints):
                differences['constraints'] = {
                    'dev': sorted(dev_info.constraints),
                    'prod': sorted(prod_info.constraints),
                    'missing_in_prod': sorted(set(dev_info.constraints) - set(prod_info.constraints)),
                    'extra_in_prod': sorted(set(prod_info.constraints) - set(dev_info.constraints))
                }

            # Compare triggers
            if set(dev_info.triggers) != set(prod_info.triggers):
                differences['triggers'] = {
                    'dev': sorted(dev_info.triggers),
                    'prod': sorted(prod_info.triggers),
                    'missing_in_prod': sorted(set(dev_info.triggers) - set(prod_info.triggers)),
                    'extra_in_prod': sorted(set(prod_info.triggers) - set(dev_info.triggers))
                }

        except Exception as e:
            differences['error'] = str(e)

        return differences

    def compare_schemas(self) -> Optional[SchemaComparison]:
        """Compare schemas between dev and production"""
        if not self.test_connections():
            return None

        if self.verbose:
            print("🔍 Comparing database schemas...")

        try:
            # Get all tables
            dev_inspector = inspect(self.dev_engine)
            prod_inspector = inspect(self.prod_engine)

            dev_tables = set(dev_inspector.get_table_names())
            prod_tables = set(prod_inspector.get_table_names())

            missing_tables = sorted(dev_tables - prod_tables)  # Tables in dev but not in prod
            extra_tables = sorted(prod_tables - dev_tables)    # Tables in prod but not in dev
            shared_tables = sorted(dev_tables & prod_tables)

            # Compare shared tables in detail
            table_differences = {}
            for table in shared_tables:
                if self.verbose:
                    print(f"  Comparing table: {table}")

                differences = self.compare_table_details(table)
                if differences:
                    table_differences[table] = differences

            return SchemaComparison(
                dev_tables=dev_tables,
                prod_tables=prod_tables,
                missing_tables=missing_tables,
                extra_tables=extra_tables,
                shared_tables=shared_tables,
                table_differences=table_differences
            )

        except Exception as e:
            print(f"❌ Schema comparison failed: {e}")
            return None

    def generate_report(self, comparison: SchemaComparison, format_type: str = 'markdown') -> str:
        """Generate comparison report"""
        if format_type == 'json':
            return json.dumps({
                'summary': {
                    'dev_tables_count': len(comparison.dev_tables),
                    'prod_tables_count': len(comparison.prod_tables),
                    'missing_tables_count': len(comparison.missing_tables),
                    'extra_tables_count': len(comparison.extra_tables),
                    'shared_tables_count': len(comparison.shared_tables),
                    'tables_with_differences_count': len(comparison.table_differences)
                },
                'details': asdict(comparison)
            }, indent=2, ensure_ascii=False)

        # Markdown format
        report = []

        # Header
        report.append("# Database Schema Comparison Report")
        report.append("")
        report.append("**Generated:** " + str(Path(__file__).name))
        report.append("**Development Database:** " + self.dev_url.split('@')[-1])
        report.append("**Production Database:** " + self.prod_url.split('@')[-1])
        report.append("")

        # Summary
        report.append("## 📊 Summary")
        report.append("")
        report.append("| Metric | Development | Production | Status |")
        report.append("|--------|-------------|------------|--------|")
        report.append(f"| Tables | {len(comparison.dev_tables)} | {len(comparison.prod_tables)} | {'✅ Match' if len(comparison.dev_tables) == len(comparison.prod_tables) else '❌ Different'} |")
        report.append(f"| Missing in Prod | - | {len(comparison.missing_tables)} | {'✅ None' if len(comparison.missing_tables) == 0 else '❌ Issues'} |")
        report.append(f"| Extra in Prod | - | {len(comparison.extra_tables)} | {'✅ None' if len(comparison.extra_tables) == 0 else '⚠️ Extra'} |")
        report.append(f"| Tables with Differences | - | {len(comparison.table_differences)} | {'✅ None' if len(comparison.table_differences) == 0 else '❌ Issues'} |")
        report.append("")

        # Missing Tables
        if comparison.missing_tables:
            report.append("## ❌ Tables Missing in Production")
            report.append("")
            for table in comparison.missing_tables:
                report.append(f"- `{table}`")
            report.append("")

        # Extra Tables
        if comparison.extra_tables:
            report.append("## ⚠️ Extra Tables in Production")
            report.append("")
            for table in comparison.extra_tables:
                report.append(f"- `{table}`")
            report.append("")

        # Table Differences
        if comparison.table_differences:
            report.append("## 🔍 Table Differences")
            report.append("")

            for table, differences in comparison.table_differences.items():
                report.append(f"### Table: `{table}`")
                report.append("")

                if 'columns' in differences:
                    cols = differences['columns']
                    if cols.get('missing_in_prod'):
                        report.append("**Missing Columns in Production:**")
                        for col in cols['missing_in_prod']:
                            report.append(f"- `{col}`")
                        report.append("")

                    if cols.get('extra_in_prod'):
                        report.append("**Extra Columns in Production:**")
                        for col in cols['extra_in_prod']:
                            report.append(f"- `{col}`")
                        report.append("")

                    if cols.get('differences'):
                        report.append("**Column Differences:**")
                        for diff in cols['differences']:
                            report.append(f"- `{diff['column']}`: {diff['dev']} vs {diff['prod']}")
                        report.append("")

                if 'indexes' in differences:
                    idx = differences['indexes']
                    if idx.get('missing_in_prod'):
                        report.append("**Missing Indexes in Production:**")
                        for index in idx['missing_in_prod']:
                            report.append(f"- `{index}`")
                        report.append("")

                    if idx.get('extra_in_prod'):
                        report.append("**Extra Indexes in Production:**")
                        for index in idx['extra_in_prod']:
                            report.append(f"- `{index}`")
                        report.append("")

                if 'constraints' in differences:
                    cons = differences['constraints']
                    if cons.get('missing_in_prod'):
                        report.append("**Missing Constraints in Production:**")
                        for constraint in cons['missing_in_prod']:
                            report.append(f"- `{constraint}`")
                        report.append("")

                    if cons.get('extra_in_prod'):
                        report.append("**Extra Constraints in Production:**")
                        for constraint in cons['extra_in_prod']:
                            report.append(f"- `{constraint}`")
                        report.append("")

                if 'triggers' in differences:
                    trig = differences['triggers']
                    if trig.get('missing_in_prod'):
                        report.append("**Missing Triggers in Production:**")
                        for trigger in trig['missing_in_prod']:
                            report.append(f"- `{trigger}`")
                        report.append("")

                    if trig.get('extra_in_prod'):
                        report.append("**Extra Triggers in Production:**")
                        for trigger in trig['extra_in_prod']:
                            report.append(f"- `{trigger}`")
                        report.append("")

                if 'error' in differences:
                    report.append(f"**Error:** {differences['error']}")
                    report.append("")

        # Conclusion
        report.append("## 📋 Conclusion")
        report.append("")

        total_issues = len(comparison.missing_tables) + len(comparison.extra_tables) + len(comparison.table_differences)

        if total_issues == 0:
            report.append("✅ **Schemas are 100% identical!**")
            report.append("")
            report.append("Both databases have identical structure and can proceed with data operations.")
        else:
            report.append(f"❌ **Found {total_issues} schema differences that need to be addressed.**")
            report.append("")
            report.append("The production database needs to be updated to match the development schema before proceeding.")

        return "\n".join(report)


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description='Compare database schemas between development and production',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    parser.add_argument(
        '--json',
        action='store_true',
        help='Output results in JSON format'
    )
    parser.add_argument(
        '--markdown',
        action='store_true',
        default=True,
        help='Output results in Markdown format (default)'
    )
    parser.add_argument(
        '--verbose',
        action='store_true',
        help='Show detailed progress information'
    )
    parser.add_argument(
        '--dev-url',
        help='Development database URL (default: from config)'
    )
    parser.add_argument(
        '--prod-url',
        help='Production database URL (default: from config)'
    )

    args = parser.parse_args()

    # Set database URLs
    dev_url = args.dev_url or DATABASE_URL
    prod_url = args.prod_url

    # For production, we need to construct the URL
    if not prod_url:
        # Try to get production database URL from environment
        prod_host = os.getenv("PROD_POSTGRES_HOST", "localhost")
        prod_db = os.getenv("PROD_POSTGRES_DB", "tiktrack_dev")
        prod_user = os.getenv("PROD_POSTGRES_USER", "tiktrack")
        prod_password = os.getenv("PROD_POSTGRES_PASSWORD", "tiktrack_dev_password")

        prod_url = f"postgresql+psycopg2://{prod_user}:{prod_password}@{prod_host}:5432/{prod_db}"

    if args.verbose:
        print("🚀 Starting Database Schema Comparison")
        print(f"📊 Development: {dev_url.split('@')[-1]}")
        print(f"🏭 Production: {prod_url.split('@')[-1]}")
        print()

    # Create comparator
    comparator = SchemaComparator(dev_url, prod_url, args.verbose)

    # Compare schemas
    comparison = comparator.compare_schemas()

    if not comparison:
        print("❌ Schema comparison failed")
        sys.exit(1)

    # Generate report
    format_type = 'json' if args.json else 'markdown'
    report = comparator.generate_report(comparison, format_type)

    # Output report
    if args.json:
        print(report)
    else:
        print(report)

        # Save to file
        output_file = project_root / "documentation" / "production" / "DATABASE_SCHEMA_COMPARISON_REPORT.md"
        output_file.parent.mkdir(parents=True, exist_ok=True)

        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(report)

        if args.verbose:
            print(f"\n📄 Report saved to: {output_file}")


if __name__ == '__main__':
    main()

