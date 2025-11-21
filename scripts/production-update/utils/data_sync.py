#!/usr/bin/env python3
"""
Data Synchronization
====================

Synchronizes data between development and production databases.
Handles schema updates (migrations), reference data, preferences, and groups.
"""

import sqlite3
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


class DataSync:
    """Synchronizes data between databases"""
    
    def __init__(self, project_root: Path, require_approval: bool = True):
        self.project_root = project_root
        self.require_approval = require_approval
        self.logger = get_logger()
        self.detector = SchemaDetector(project_root)
        
        dev_db = self.detector.get_dev_db()
        self.dev_db = dev_db
        self.prod_db = project_root / "production" / "Backend" / "db" / "tiktrack.db"
    
    def sync_schema(self) -> bool:
        """Sync schema changes (run migrations)"""
        if not self.dev_db or not self.prod_db.exists():
            self.logger.warning("  ⚠️  Cannot sync schema - databases not found")
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
        if not self.dev_db or not self.prod_db.exists():
            return False
        
        if diff is None:
            diff = self.detector.compare_reference_data()
        
        if not diff:
            self.logger.info("  ✅ No reference data changes detected")
            return True
        
        self.logger.info("  🔄 Syncing reference data...")
        
        try:
            with sqlite3.connect(self.dev_db) as dev_conn, sqlite3.connect(self.prod_db) as prod_conn:
                # Sync missing records
                for table, records in diff.missing_records.items():
                    if not records:
                        continue
                    
                    self.logger.info(f"    Adding {len(records)} records to {table}")
                    
                    # Get column names from first record
                    if not records:
                        continue
                    
                    columns = list(records[0].keys())
                    placeholders = ', '.join(['?' for _ in columns])
                    columns_str = ', '.join(columns)
                    
                    for record in records:
                        values = [record[col] for col in columns]
                        try:
                            prod_conn.execute(
                                f"INSERT OR REPLACE INTO {table} ({columns_str}) VALUES ({placeholders})",
                                values
                            )
                        except Exception as e:
                            self.logger.warning(f"      ⚠️  Failed to insert record: {e}")
                    
                    prod_conn.commit()
                
                # Sync changed records
                for table, changes in diff.changed_records.items():
                    if not changes:
                        continue
                    
                    self.logger.info(f"    Updating {len(changes)} records in {table}")
                    
                    for change in changes:
                        pk = change['pk']
                        dev_record = change['dev']
                        
                        columns = list(dev_record.keys())
                        set_clause = ', '.join([f"{col} = ?" for col in columns if col != 'id'])
                        values = [dev_record[col] for col in columns if col != 'id']
                        values.append(pk)
                        
                        try:
                            prod_conn.execute(
                                f"UPDATE {table} SET {set_clause} WHERE id = ?",
                                values
                            )
                        except Exception as e:
                            self.logger.warning(f"      ⚠️  Failed to update record: {e}")
                    
                    prod_conn.commit()
                
                self.logger.info("  ✅ Reference data synced")
                return True
                
        except Exception as e:
            self.logger.error(f"  ❌ Error syncing reference data: {e}")
            return False
    
    def sync_preferences(self, diff: Optional[DataDiff] = None) -> bool:
        """Sync system preferences"""
        if not self.dev_db or not self.prod_db.exists():
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
        if not self.dev_db or not self.prod_db.exists():
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


