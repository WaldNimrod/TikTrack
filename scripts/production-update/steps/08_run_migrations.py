#!/usr/bin/env python3
"""
Step 08: Run Migrations
=======================

Detects and runs required database migrations.
"""

import importlib.util
import sys
from pathlib import Path
from typing import Dict, List, Optional, Tuple

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

# Import utils
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent / "scripts" / "production-update" / "utils"))
from logger import get_logger
from reporter import get_reporter
from migration_detector import MigrationDetector, MigrationInfo

# Import SQLAlchemy for running migrations
from sqlalchemy import create_engine, text, inspect
from sqlalchemy.engine import Engine


def detect_required_migrations(project_root: Path) -> List[MigrationInfo]:
    """Detect which migrations need to be run"""
    detector = MigrationDetector(project_root)
    required = detector.find_required_migrations()
    ordered = detector.order_migrations(required)
    return ordered


def run_migration(migration_info: MigrationInfo, database_url: str, project_root: Path) -> Tuple[bool, Optional[str]]:
    """Run a single migration
    
    Returns:
        Tuple of (success, error_message)
    """
    logger = get_logger()
    
    try:
        logger.info(f"  🔄 Running migration: {migration_info.name}")
        
        # Load migration module
        spec = importlib.util.spec_from_file_location(
            migration_info.name,
            migration_info.file_path
        )
        if not spec or not spec.loader:
            return False, "Could not load migration module"
        
        migration_module = importlib.util.module_from_spec(spec)
        sys.path.insert(0, str(migration_info.file_path.parent))
        spec.loader.exec_module(migration_module)
        
        # Try to run migration
        # Check for run_migration function (takes DATABASE_URL)
        if hasattr(migration_module, 'run_migration'):
            logger.info(f"    Using run_migration() function")
            try:
                result = migration_module.run_migration(database_url)
                if result:
                    return True, None
                else:
                    return False, "Migration returned False"
            except Exception as e:
                return False, str(e)
        
        # Check for upgrade function (SQLAlchemy style)
        elif hasattr(migration_module, 'upgrade'):
            logger.info(f"    Using upgrade() function")
            try:
                engine = create_engine(database_url)
                with engine.begin() as conn:
                    sql = migration_module.upgrade()
                    if sql:
                        conn.execute(text(sql))
                    else:
                        # upgrade() might modify schema directly
                        migration_module.upgrade()
                return True, None
            except Exception as e:
                return False, str(e)
        
        # Check for migrate function
        elif hasattr(migration_module, 'migrate'):
            logger.info(f"    Using migrate() function")
            try:
                result = migration_module.migrate()
                if result:
                    return True, None
                else:
                    return False, "Migration returned False"
            except Exception as e:
                return False, str(e)
        
        else:
            return False, "Migration file does not have run_migration(), upgrade(), or migrate() function"
            
    except Exception as e:
        return False, f"Error running migration: {str(e)}"


def verify_migration(migration_info: MigrationInfo, database_url: str) -> Tuple[bool, Optional[str]]:
    """Verify that a migration was successful
    
    Returns:
        Tuple of (success, error_message)
    """
    logger = get_logger()
    
    try:
        engine = create_engine(database_url)
        inspector = inspect(engine)
        
        # Check if tables were created
        for table in migration_info.tables_created:
            if table not in inspector.get_table_names():
                return False, f"Table {table} was not created"
            logger.info(f"    ✅ Verified: Table {table} exists")
        
        # Check if columns were added
        for table, columns in migration_info.columns_added.items():
            if table not in inspector.get_table_names():
                continue  # Table doesn't exist, skip column check
            
            table_columns = [col['name'] for col in inspector.get_columns(table)]
            for col in columns:
                if col not in table_columns:
                    return False, f"Column {table}.{col} was not added"
                logger.info(f"    ✅ Verified: Column {table}.{col} exists")
        
        return True, None
        
    except Exception as e:
        return False, f"Error verifying migration: {str(e)}"


def run_all_migrations(project_root: Path, database_url: str, 
                      auto_approve: bool = False) -> Dict:
    """Run all required migrations
    
    Returns:
        Dict with results
    """
    logger = get_logger()
    
    # Detect required migrations
    logger.info("  🔍 Detecting required migrations...")
    migrations = detect_required_migrations(project_root)
    
    if not migrations:
        logger.info("  ✅ No migrations required")
        return {
            'success': True,
            'migrations_run': 0,
            'migrations': []
        }
    
    logger.info(f"  📋 Found {len(migrations)} migration(s) to run")
    
    if not auto_approve:
        # Show migrations to user
        logger.info("  📋 Migrations to run:")
        for i, mig in enumerate(migrations, 1):
            logger.info(f"    {i}. {mig.name}")
            if mig.tables_created:
                logger.info(f"       Creates tables: {', '.join(mig.tables_created)}")
            if mig.columns_added:
                logger.info(f"       Adds columns: {len(sum(mig.columns_added.values(), []))} columns")
        
        # In automated mode, we'll proceed
        logger.info("  ⚠️  Proceeding with migrations...")
    
    results = {
        'success': True,
        'migrations_run': 0,
        'migrations_failed': 0,
        'migrations': []
    }
    
    for migration in migrations:
        logger.info(f"  🔄 Running migration: {migration.name}")
        
        # Run migration
        success, error = run_migration(migration, database_url, project_root)
        
        if success:
            # Verify migration
            verify_success, verify_error = verify_migration(migration, database_url)
            
            if verify_success:
                logger.info(f"  ✅ Migration {migration.name} completed successfully")
                results['migrations_run'] += 1
                results['migrations'].append({
                    'name': migration.name,
                    'status': 'success'
                })
            else:
                logger.warning(f"  ⚠️  Migration {migration.name} ran but verification failed: {verify_error}")
                results['migrations_failed'] += 1
                results['migrations'].append({
                    'name': migration.name,
                    'status': 'verification_failed',
                    'error': verify_error
                })
        else:
            logger.error(f"  ❌ Migration {migration.name} failed: {error}")
            results['success'] = False
            results['migrations_failed'] += 1
            results['migrations'].append({
                'name': migration.name,
                'status': 'failed',
                'error': error
            })
    
    return results


def run_step(dry_run: bool = False, auto_approve: bool = False) -> dict:
    """
    Run required migrations
    
    Args:
        dry_run: If True, don't actually run migrations
        auto_approve: If True, run migrations without asking for approval
    
    Returns:
        Dict with step results
    """
    logger = get_logger()
    reporter = get_reporter()
    
    logger.step_start("Run Migrations", 8)
    
    project_root = Path(__file__).parent.parent.parent.parent
    
    if dry_run:
        logger.info("  [DRY RUN] Would detect and run required migrations")
        return {'success': True, 'dry_run': True}
    
    try:
        # Get production database URL
        sys.path.insert(0, str(project_root / "production" / "Backend"))
        from config.settings import DATABASE_URL
        
        logger.info(f"  📊 Database: {DATABASE_URL[:50]}...")
        
        # Run migrations
        results = run_all_migrations(project_root, DATABASE_URL, auto_approve)
        
        if results['success'] and results.get('migrations_failed', 0) == 0:
            logger.info(f"  ✅ All migrations completed successfully ({results['migrations_run']} migrations)")
        elif results['migrations_failed'] > 0:
            logger.warning(f"  ⚠️  {results['migrations_failed']} migration(s) failed")
            reporter.add_warning(f"{results['migrations_failed']} migration(s) failed", "run_migrations")
        
        return results
        
    except Exception as e:
        logger.error(f"  ❌ Error running migrations: {e}")
        reporter.add_error(f"Migration error: {e}", "run_migrations")
        import traceback
        traceback.print_exc()
        return {'success': False, 'error': str(e)}


if __name__ == '__main__':
    result = run_step()
    sys.exit(0 if result.get('success') else 1)

