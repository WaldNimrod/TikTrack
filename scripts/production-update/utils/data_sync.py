#!/usr/bin/env python3
"""
Data Synchronization
====================

Synchronizes data between development and production databases.
Handles schema updates (migrations), reference data, preferences, and groups.

Note: Uses SQLAlchemy to support both PostgreSQL and SQLite databases.
"""

import sys
from pathlib import Path
from typing import Dict, List, Optional

# Add project root to path
PROJECT_ROOT = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

try:
    from logger import get_logger
except ImportError:
    sys.path.insert(0, str(Path(__file__).parent))
    from logger import get_logger

from schema_detector import SchemaDetector, DataDiff

# Import SQLAlchemy for database connections
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session, sessionmaker


class DataSync:
    """Synchronizes data between databases"""
    
    def __init__(self, project_root: Path, require_approval: bool = True):
        self.project_root = project_root
        self.require_approval = require_approval
        self.logger = get_logger()
        self.detector = SchemaDetector(project_root)
        
        # Get database URLs from config
        sys.path.insert(0, str(project_root / "Backend"))
        from config.settings import DATABASE_URL as DEV_DATABASE_URL
        
        sys.path.insert(0, str(project_root / "production" / "Backend"))
        try:
            from config.settings import DATABASE_URL as PROD_DATABASE_URL
        except ImportError:
            # Fallback if production config not available
            PROD_DATABASE_URL = DEV_DATABASE_URL
        
        self.dev_db_url = DEV_DATABASE_URL
        self.prod_db_url = PROD_DATABASE_URL
        
        # Create engines
        self.dev_engine = create_engine(DEV_DATABASE_URL)
        self.prod_engine = create_engine(PROD_DATABASE_URL)
    
    def sync_schema(self) -> bool:
        """Sync schema changes (run migrations)"""
        try:
            # Test connections
            with self.dev_engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            with self.prod_engine.connect() as conn:
                conn.execute(text("SELECT 1"))
        except Exception as e:
            self.logger.warning(f"  ⚠️  Cannot sync schema - database connection failed: {e}")
            return False
        
        self.logger.info("  🔄 Syncing schema changes...")
        
        # Check for pending migrations
        migrations_dir = self.project_root / "Backend" / "migrations"
        if not migrations_dir.exists():
            self.logger.info("  ✅ No migrations directory found")
            return True
        
        # TODO: Implement migration runner
        # For now, just log that schema sync is needed
        self.logger.info("  ℹ️  Schema sync requires manual migration execution")
        self.logger.info("  ℹ️  Run migrations manually if schema changes detected")
        
        return True
    
    def sync_reference_data(self, diff: Optional[DataDiff] = None) -> bool:
        """Sync reference data (currencies, accounts, etc.)"""
        try:
            # Test connections
            with self.dev_engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            with self.prod_engine.connect() as conn:
                conn.execute(text("SELECT 1"))
        except Exception as e:
            self.logger.warning(f"  ⚠️  Cannot sync reference data - database connection failed: {e}")
            return False
        
        if diff is None:
            diff = self.detector.compare_reference_data()
        
        if not diff:
            self.logger.info("  ✅ No reference data changes detected")
            return True
        
        self.logger.info("  🔄 Syncing reference data...")
        
        try:
            with self.dev_engine.connect() as dev_conn, self.prod_engine.connect() as prod_conn:
                # Sync missing records
                for table, records in diff.missing_records.items():
                    if not records:
                        continue
                    
                    self.logger.info(f"    Adding {len(records)} records to {table}")
                    
                    # Get column names from first record
                    if not records:
                        continue
                    
                    columns = list(records[0].keys())
                    # Use PostgreSQL/SQLite compatible syntax
                    placeholders = ', '.join([':col' + str(i) for i in range(len(columns))])
                    columns_str = ', '.join(columns)
                    
                    for record in records:
                        values = {f'col{i}': record[col] for i, col in enumerate(columns)}
                        try:
                            # Use ON CONFLICT for PostgreSQL, INSERT OR REPLACE for SQLite
                            insert_sql = f"""
                                INSERT INTO {table} ({columns_str}) 
                                VALUES ({placeholders})
                                ON CONFLICT (id) DO UPDATE SET 
                                {', '.join([f"{col} = EXCLUDED.{col}" for col in columns if col != 'id'])}
                            """
                            prod_conn.execute(text(insert_sql), values)
                            prod_conn.commit()
                        except Exception as e:
                            # Fallback for SQLite (deprecated - system uses PostgreSQL)
                            try:
                                insert_sql = f"INSERT OR REPLACE INTO {table} ({columns_str}) VALUES ({placeholders})"
                                prod_conn.execute(text(insert_sql), values)
                                prod_conn.commit()
                            except Exception as e2:
                                self.logger.warning(f"      ⚠️  Failed to insert record: {e2}")
                    
                # Sync changed records
                for table, changes in diff.changed_records.items():
                    if not changes:
                        continue
                    
                    self.logger.info(f"    Updating {len(changes)} records in {table}")
                    
                    for change in changes:
                        pk = change['pk']
                        dev_record = change['dev']
                        
                        columns = list(dev_record.keys())
                        set_clause = ', '.join([f"{col} = :{col}" for col in columns if col != 'id'])
                        values = {col: dev_record[col] for col in columns if col != 'id'}
                        values['id'] = pk
                        
                        try:
                            update_sql = f"UPDATE {table} SET {set_clause} WHERE id = :id"
                            prod_conn.execute(text(update_sql), values)
                            prod_conn.commit()
                        except Exception as e:
                            self.logger.warning(f"      ⚠️  Failed to update record: {e}")
                
                self.logger.info("  ✅ Reference data synced")
                return True
                
        except Exception as e:
            self.logger.error(f"  ❌ Error syncing reference data: {e}")
            return False
    
    def sync_preferences(self, diff: Optional[DataDiff] = None) -> bool:
        """Sync system preferences"""
        try:
            # Test connections
            with self.dev_engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            with self.prod_engine.connect() as conn:
                conn.execute(text("SELECT 1"))
        except Exception as e:
            self.logger.warning(f"  ⚠️  Cannot sync preferences - database connection failed: {e}")
            return False
        
        if diff is None:
            diff = self.detector.compare_preferences()
        
        if not diff:
            self.logger.info("  ✅ No preferences changes detected")
            return True
        
        self.logger.info("  🔄 Syncing system preferences...")
        return self.sync_reference_data(diff)
    
    def sync_groups(self, diff: Optional[DataDiff] = None, approved: bool = False) -> bool:
        """Sync groups (CRITICAL - requires approval)"""
        try:
            # Test connections
            with self.dev_engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            with self.prod_engine.connect() as conn:
                conn.execute(text("SELECT 1"))
        except Exception as e:
            self.logger.warning(f"  ⚠️  Cannot sync groups - database connection failed: {e}")
            return False
        
        if not approved and self.require_approval:
            self.logger.warning("  ⚠️  Groups sync requires explicit approval")
            return False
        
        if diff is None:
            diff = self.detector.compare_groups()
        
        if not diff:
            self.logger.info("  ✅ No groups changes detected")
            return True
        
        self.logger.warning("  ⚠️  CRITICAL: Syncing groups changes...")
        return self.sync_reference_data(diff)
    
    def sync_all(self, groups_approved: bool = False) -> Dict[str, bool]:
        """Sync all data"""
        results = {}
        
        results['schema'] = self.sync_schema()
        results['reference_data'] = self.sync_reference_data()
        results['preferences'] = self.sync_preferences()
        results['groups'] = self.sync_groups(approved=groups_approved)
        
        return results


def sync_data(project_root: Optional[Path] = None, 
              groups_approved: bool = False) -> Dict[str, bool]:
    """
    Main entry point for data synchronization
    
    Args:
        project_root: Project root path (defaults to auto-detect)
        groups_approved: Whether groups sync is approved
    
    Returns:
        Dict with sync results
    """
    if project_root is None:
        project_root = PROJECT_ROOT
    
    syncer = DataSync(project_root, require_approval=True)
    return syncer.sync_all(groups_approved=groups_approved)


if __name__ == '__main__':
    results = sync_data(groups_approved=False)
    print(f"Sync results: {results}")


