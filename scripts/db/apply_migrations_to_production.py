#!/usr/bin/env python3
"""
Apply Migrations to Production Database Script
==============================================

Detects and applies required database migrations to production database.
Ensures production database schema matches development database schema.

Usage:
    python3 scripts/db/apply_migrations_to_production.py [--dry-run] [--verbose] [--migration-file FILE]

Options:
    --dry-run: Detect migrations but don't apply them
    --verbose: Show detailed progress information
    --migration-file FILE: Apply specific migration file only

Author: TikTrack Development Team
Version: 1.0.0
Date: December 2025
"""

import os
import sys
import importlib.util
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Set
from dataclasses import dataclass
from enum import Enum

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
from sqlalchemy.engine import Engine
from sqlalchemy.pool import QueuePool


class MigrationStatus(Enum):
    """Migration execution status"""
    PENDING = "pending"
    RUNNING = "running"
    SUCCESS = "success"
    FAILED = "failed"
    SKIPPED = "skipped"


@dataclass
class MigrationInfo:
    """Information about a migration file"""
    file_path: Path
    name: str
    tables_created: List[str]
    columns_added: Dict[str, List[str]]  # table -> [columns]
    indexes_created: List[str]
    dependencies: List[str]  # Other migrations this depends on
    status: MigrationStatus = MigrationStatus.PENDING
    error_message: Optional[str] = None


@dataclass
class MigrationResult:
    """Result of migration execution"""
    migration: MigrationInfo
    success: bool
    error_message: Optional[str] = None
    execution_time: Optional[float] = None


class MigrationDetector:
    """Detects which migrations need to be run"""

    def __init__(self, project_root: Path, dev_engine: Engine, prod_engine: Engine, logger):
        self.project_root = project_root
        self.dev_engine = dev_engine
        self.prod_engine = prod_engine
        self.logger = logger
        self.migrations_dir = project_root / "Backend" / "migrations"

    def get_dev_tables(self) -> Set[str]:
        """Get all tables from development database"""
        inspector = inspect(self.dev_engine)
        return set(inspector.get_table_names())

    def get_prod_tables(self) -> Set[str]:
        """Get all tables from production database"""
        inspector = inspect(self.prod_engine)
        return set(inspector.get_table_names())

    def detect_missing_tables(self) -> Set[str]:
        """Detect tables that exist in dev but not in production"""
        dev_tables = self.get_dev_tables()
        prod_tables = self.get_prod_tables()
        return dev_tables - prod_tables

    def detect_missing_columns(self) -> Dict[str, List[str]]:
        """Detect columns that exist in dev but not in production"""
        inspector_dev = inspect(self.dev_engine)
        inspector_prod = inspect(self.prod_engine)

        missing_columns = {}

        # Check shared tables for missing columns
        shared_tables = self.get_dev_tables() & self.get_prod_tables()

        for table in shared_tables:
            dev_columns = {col['name'] for col in inspector_dev.get_columns(table)}
            prod_columns = {col['name'] for col in inspector_prod.get_columns(table)}

            missing = dev_columns - prod_columns
            if missing:
                missing_columns[table] = sorted(missing)

        return missing_columns

    def find_required_migrations(self) -> List[MigrationInfo]:
        """Find migrations that need to be applied to production"""
        required_migrations = []

        # Check for missing tables
        missing_tables = self.detect_missing_tables()
        if missing_tables:
            self.logger.info(f"Found {len(missing_tables)} missing tables: {', '.join(missing_tables)}")

            # Find migrations that create these tables
            for table in missing_tables:
                migration = self.find_migration_for_table(table)
                if migration and migration not in required_migrations:
                    required_migrations.append(migration)

        # Check for missing columns
        missing_columns = self.detect_missing_columns()
        if missing_columns:
            self.logger.info(f"Found missing columns in {len(missing_columns)} tables")

            # Find migrations that add these columns
            for table, columns in missing_columns.items():
                for column in columns:
                    migration = self.find_migration_for_column(table, column)
                    if migration and migration not in required_migrations:
                        required_migrations.append(migration)

        return required_migrations

    def find_migration_for_table(self, table_name: str) -> Optional[MigrationInfo]:
        """Find migration that creates a specific table"""
        return self._scan_migrations_for_pattern(table_name, 'table')

    def find_migration_for_column(self, table_name: str, column_name: str) -> Optional[MigrationInfo]:
        """Find migration that adds a specific column"""
        return self._scan_migrations_for_pattern(f"{table_name}.{column_name}", 'column')

    def _scan_migrations_for_pattern(self, pattern: str, pattern_type: str) -> Optional[MigrationInfo]:
        """Scan migration files for a specific pattern"""
        if not self.migrations_dir.exists():
            return None

        for migration_file in sorted(self.migrations_dir.glob("*.py")):
            if migration_file.name.startswith('__'):
                continue

            try:
                migration_info = self.parse_migration_file(migration_file)
                if migration_info:
                    # Check if this migration handles the pattern
                    if pattern_type == 'table' and pattern in migration_info.tables_created:
                        return migration_info
                    elif pattern_type == 'column':
                        table, column = pattern.split('.')
                        if table in migration_info.columns_added and column in migration_info.columns_added[table]:
                            return migration_info
            except Exception as e:
                self.logger.warning(f"Error parsing migration {migration_file.name}: {e}")
                continue

        return None

    def parse_migration_file(self, migration_path: Path) -> Optional[MigrationInfo]:
        """Parse a migration file to extract what it does"""
        if not migration_path.exists():
            return None

        try:
            with open(migration_path, 'r', encoding='utf-8') as f:
                content = f.read()

            # Extract table names from CREATE TABLE statements
            tables_created = []
            create_table_pattern = r'CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?["\']?(\w+)["\']?'
            import re
            matches = re.findall(create_table_pattern, content, re.IGNORECASE)
            tables_created = list(set(matches))

            # Extract column additions (simplified)
            columns_added = {}
            # This is a simplified implementation - in practice you'd need more sophisticated parsing

            # Extract migration name
            name = migration_path.stem

            return MigrationInfo(
                file_path=migration_path,
                name=name,
                tables_created=tables_created,
                columns_added=columns_added,
                indexes_created=[],
                dependencies=[]
            )

        except Exception as e:
            self.logger.warning(f"Error parsing migration file {migration_path}: {e}")
            return None

    def order_migrations(self, migrations: List[MigrationInfo]) -> List[MigrationInfo]:
        """Order migrations by dependencies"""
        # For now, just sort by filename (assuming chronological order)
        return sorted(migrations, key=lambda m: m.file_path.name)


class MigrationExecutor:
    """Executes migrations on production database"""

    def __init__(self, prod_engine: Engine, logger):
        self.prod_engine = prod_engine
        self.logger = logger

    def run_migration(self, migration_info: MigrationInfo, dry_run: bool = False) -> MigrationResult:
        """Run a single migration"""
        import time
        start_time = time.time()

        self.logger.info(f"🔄 Running migration: {migration_info.name}")

        if dry_run:
            self.logger.info("  📋 Dry run - would execute migration")
            return MigrationResult(
                migration=migration_info,
                success=True,
                execution_time=time.time() - start_time
            )

        try:
            # Load migration module
            spec = importlib.util.spec_from_file_location(
                migration_info.name,
                migration_info.file_path
            )
            if not spec or not spec.loader:
                raise Exception("Could not load migration module")

            migration_module = importlib.util.module_from_spec(spec)
            sys.path.insert(0, str(migration_info.file_path.parent))
            spec.loader.exec_module(migration_module)

            # Try to run migration
            # Check for run_migration function (takes database URL)
            database_url = self._get_database_url()

            if hasattr(migration_module, 'run_migration'):
                self.logger.info("  Using run_migration() function")
                result = migration_module.run_migration(database_url)
                if result:
                    success = True
                else:
                    raise Exception("Migration returned False")

            # Check for upgrade function (SQLAlchemy style)
            elif hasattr(migration_module, 'upgrade'):
                self.logger.info("  Using upgrade() function")
                with self.prod_engine.begin() as conn:
                    sql = migration_module.upgrade()
                    if sql:
                        conn.execute(text(sql))
                    else:
                        # upgrade() might modify schema directly
                        migration_module.upgrade()
                success = True

            # Check for migrate function
            elif hasattr(migration_module, 'migrate'):
                self.logger.info("  Using migrate() function")
                result = migration_module.migrate()
                if result:
                    success = True
                else:
                    raise Exception("Migration returned False")

            else:
                raise Exception("Migration file does not have run_migration(), upgrade(), or migrate() function")

            execution_time = time.time() - start_time
            self.logger.success(f"✅ Migration {migration_info.name} completed successfully ({execution_time:.2f}s)")

            return MigrationResult(
                migration=migration_info,
                success=True,
                execution_time=execution_time
            )

        except Exception as e:
            execution_time = time.time() - start_time
            error_msg = str(e)
            self.logger.error(f"❌ Migration {migration_info.name} failed: {error_msg}")

            return MigrationResult(
                migration=migration_info,
                success=False,
                error_message=error_msg,
                execution_time=execution_time
            )

    def _get_database_url(self) -> str:
        """Get database URL from environment or config"""
        # This is a simplified implementation
        # In practice, you'd get this from the config
        return "postgresql://placeholder"


def main():
    """Main entry point"""
    import argparse

    parser = argparse.ArgumentParser(
        description='Apply required migrations to production database',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Detect migrations but don\'t apply them'
    )
    parser.add_argument(
        '--verbose',
        action='store_true',
        help='Show detailed progress information'
    )
    parser.add_argument(
        '--migration-file',
        type=str,
        help='Apply specific migration file only'
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
        logger.info("🚀 Starting Migration Application Process")

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

    # Create database engines
    try:
        dev_engine = create_engine(
            dev_url,
            poolclass=QueuePool,
            pool_size=5,
            max_overflow=10,
            pool_pre_ping=True,
            echo=False
        )

        prod_engine = create_engine(
            prod_url,
            poolclass=QueuePool,
            pool_size=5,
            max_overflow=10,
            pool_pre_ping=True,
            echo=False
        )

        # Test connections
        with dev_engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        with prod_engine.connect() as conn:
            conn.execute(text("SELECT 1"))

        if args.verbose:
            logger.info("✅ Database connections established")

    except Exception as e:
        logger.error(f"❌ Failed to connect to databases: {e}")
        sys.exit(1)

    # Create detector and executor
    detector = MigrationDetector(project_root, dev_engine, prod_engine, logger)
    executor = MigrationExecutor(prod_engine, logger)

    # Handle specific migration file
    if args.migration_file:
        migration_path = project_root / "Backend" / "migrations" / args.migration_file
        if not migration_path.exists():
            logger.error(f"Migration file not found: {migration_path}")
            sys.exit(1)

        migration_info = detector.parse_migration_file(migration_path)
        if not migration_info:
            logger.error(f"Could not parse migration file: {args.migration_file}")
            sys.exit(1)

        result = executor.run_migration(migration_info, args.dry_run)

        if result.success:
            logger.success(f"Migration {args.migration_file} applied successfully")
        else:
            logger.error(f"Migration {args.migration_file} failed: {result.error_message}")
            sys.exit(1)

        return

    # Detect required migrations
    logger.info("🔍 Detecting required migrations...")
    required_migrations = detector.find_required_migrations()

    if not required_migrations:
        logger.success("✅ No migrations required - schemas are in sync")
        return

    logger.info(f"📋 Found {len(required_migrations)} required migrations:")
    for migration in required_migrations:
        logger.info(f"  - {migration.name}")

    if args.dry_run:
        logger.info("📋 Dry run complete - no changes made")
        return

    # Order migrations
    ordered_migrations = detector.order_migrations(required_migrations)

    # Execute migrations
    results = []
    for migration_info in ordered_migrations:
        result = executor.run_migration(migration_info, args.dry_run)
        results.append(result)

        if not result.success:
            logger.error(f"❌ Migration failed: {migration_info.name}")
            if result.error_message:
                logger.error(f"   Error: {result.error_message}")
            break

    # Summary
    successful = sum(1 for r in results if r.success)
    failed = len(results) - successful

    logger.info("=" * 50)
    if failed == 0:
        logger.success(f"✅ All {successful} migrations applied successfully")
    else:
        logger.error(f"❌ {failed} migrations failed out of {len(results)} total")

        # Show failed migrations
        logger.info("Failed migrations:")
        for result in results:
            if not result.success:
                logger.error(f"  - {result.migration.name}: {result.error_message}")

    logger.info("=" * 50)


if __name__ == '__main__':
    main()


