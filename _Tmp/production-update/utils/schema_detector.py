#!/usr/bin/env python3
"""
Schema & Data Detector
======================

Detects schema and data changes between development and production databases.
Handles schema comparison, reference data comparison, preferences, and groups.
"""

import json
import sqlite3
import sys
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Dict, List, Optional, Set, Tuple

# Add project root to path
PROJECT_ROOT = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

try:
    from logger import get_logger
except ImportError:
    sys.path.insert(0, str(Path(__file__).parent))
    from logger import get_logger


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
    indexes: Dict[str, str]
    triggers: Dict[str, str]


@dataclass
class SchemaDiff:
    """Schema differences"""
    missing_tables: List[str]
    extra_tables: List[str]
    table_diffs: Dict[str, Dict[str, any]]
    missing_indexes: List[str]
    extra_indexes: List[str]
    missing_triggers: List[str]
    extra_triggers: List[str]


@dataclass
class DataDiff:
    """Data differences"""
    missing_records: Dict[str, List[Dict]]
    extra_records: Dict[str, List[Dict]]
    changed_records: Dict[str, List[Dict]]


class SchemaDetector:
    """Detects schema changes between databases"""
    
    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.logger = get_logger()
        
        # Priority: _Tmp/tiktrack.db > Backend/db/tiktrack.db
        self.dev_db_candidates = [
            project_root / "_Tmp" / "tiktrack.db",
            project_root / "Backend" / "db" / "tiktrack.db"
        ]
        self.prod_db = project_root / "production" / "Backend" / "db" / "tiktrack.db"
    
    def get_dev_db(self) -> Optional[Path]:
        """Get development database path (prioritize _Tmp)"""
        for db_path in self.dev_db_candidates:
            if db_path.exists():
                return db_path
        return None
    
    def fetch_tables(self, conn: sqlite3.Connection) -> List[str]:
        """Get all table names"""
        cursor = conn.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
        )
        return [row[0] for row in cursor.fetchall()]
    
    def fetch_columns(self, conn: sqlite3.Connection, table: str) -> List[ColumnInfo]:
        """Get column information for a table"""
        cursor = conn.execute(f"PRAGMA table_info('{table}')")
        return [
            ColumnInfo(
                name=row[1],
                type=row[2],
                notnull=row[3],
                default=row[4],
                pk=row[5]
            )
            for row in cursor.fetchall()
        ]
    
    def fetch_indexes(self, conn: sqlite3.Connection) -> Dict[str, str]:
        """Get all indexes"""
        cursor = conn.execute(
            "SELECT name, sql FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%'"
        )
        return {row[0]: (row[1] or "") for row in cursor.fetchall()}
    
    def fetch_triggers(self, conn: sqlite3.Connection) -> Dict[str, str]:
        """Get all triggers"""
        cursor = conn.execute(
            "SELECT name, sql FROM sqlite_master WHERE type='trigger' AND name NOT LIKE 'sqlite_%'"
        )
        return {row[0]: (row[1] or "") for row in cursor.fetchall()}
    
    def get_table_info(self, conn: sqlite3.Connection, table: str) -> TableInfo:
        """Get complete table information"""
        return TableInfo(
            name=table,
            columns=self.fetch_columns(conn, table),
            indexes=self.fetch_indexes(conn),
            triggers=self.fetch_triggers(conn)
        )
    
    def compare_schema(self) -> Optional[SchemaDiff]:
        """Compare schema between dev and production"""
        dev_db = self.get_dev_db()
        if not dev_db:
            self.logger.error("  ❌ Development database not found")
            return None
        
        if not self.prod_db.exists():
            self.logger.warning("  ⚠️  Production database not found")
            return None
        
        self.logger.info(f"  🔍 Comparing schema: {dev_db.name} vs production")
        
        try:
            with sqlite3.connect(dev_db) as dev_conn, sqlite3.connect(self.prod_db) as prod_conn:
                dev_tables = set(self.fetch_tables(dev_conn))
                prod_tables = set(self.fetch_tables(prod_conn))
                
                missing_tables = sorted(dev_tables - prod_tables)
                extra_tables = sorted(prod_tables - dev_tables)
                shared_tables = sorted(dev_tables & prod_tables)
                
                table_diffs = {}
                
                # Compare shared tables
                for table in shared_tables:
                    dev_cols = self.fetch_columns(dev_conn, table)
                    prod_cols = self.fetch_columns(prod_conn, table)
                    
                    if len(dev_cols) != len(prod_cols):
                        table_diffs[table] = {
                            'type': 'column_count_mismatch',
                            'dev_count': len(dev_cols),
                            'prod_count': len(prod_cols)
                        }
                        continue
                    
                    col_diffs = []
                    for dev_col, prod_col in zip(dev_cols, prod_cols):
                        if dev_col != prod_col:
                            col_diffs.append({
                                'column': dev_col.name,
                                'dev': asdict(dev_col),
                                'prod': asdict(prod_col)
                            })
                    
                    if col_diffs:
                        table_diffs[table] = {
                            'type': 'column_differences',
                            'differences': col_diffs
                        }
                
                # Compare indexes
                dev_indexes = self.fetch_indexes(dev_conn)
                prod_indexes = self.fetch_indexes(prod_conn)
                missing_indexes = sorted(set(dev_indexes.keys()) - set(prod_indexes.keys()))
                extra_indexes = sorted(set(prod_indexes.keys()) - set(dev_indexes.keys()))
                
                # Compare triggers
                dev_triggers = self.fetch_triggers(dev_conn)
                prod_triggers = self.fetch_triggers(prod_conn)
                missing_triggers = sorted(set(dev_triggers.keys()) - set(prod_triggers.keys()))
                extra_triggers = sorted(set(prod_triggers.keys()) - set(dev_triggers.keys()))
                
                return SchemaDiff(
                    missing_tables=missing_tables,
                    extra_tables=extra_tables,
                    table_diffs=table_diffs,
                    missing_indexes=missing_indexes,
                    extra_indexes=extra_indexes,
                    missing_triggers=missing_triggers,
                    extra_triggers=extra_triggers
                )
                
        except Exception as e:
            self.logger.error(f"  ❌ Error comparing schema: {e}")
            return None
    
    def compare_reference_data(self, tables: Optional[List[str]] = None) -> Optional[DataDiff]:
        """Compare reference data between dev and production"""
        dev_db = self.get_dev_db()
        if not dev_db:
            return None
        
        if not self.prod_db.exists():
            return None
        
        # Default reference data tables
        if tables is None:
            tables = [
                'currencies',
                'trading_accounts',
                'trade_types',
                'system_settings',
                'system_setting_types',
                'system_setting_groups'
            ]
        
        self.logger.info(f"  🔍 Comparing reference data in {len(tables)} tables")
        
        missing_records = {}
        extra_records = {}
        changed_records = {}
        
        try:
            with sqlite3.connect(dev_db) as dev_conn, sqlite3.connect(self.prod_db) as prod_conn:
                for table in tables:
                    # Check if table exists in both
                    dev_tables = self.fetch_tables(dev_conn)
                    prod_tables = self.fetch_tables(prod_conn)
                    
                    if table not in dev_tables:
                        continue
                    if table not in prod_tables:
                        missing_records[table] = []
                        continue
                    
                    # Get all records from both
                    dev_cursor = dev_conn.execute(f"SELECT * FROM {table}")
                    dev_cols = [desc[0] for desc in dev_cursor.description]
                    dev_rows = [dict(zip(dev_cols, row)) for row in dev_cursor.fetchall()]
                    
                    prod_cursor = prod_conn.execute(f"SELECT * FROM {table}")
                    prod_cols = [desc[0] for desc in prod_cursor.description]
                    prod_rows = [dict(zip(prod_cols, row)) for row in prod_cursor.fetchall()]
                    
                    # Find primary key (assume 'id' or first column)
                    pk_col = 'id' if 'id' in dev_cols else dev_cols[0]
                    
                    # Create lookup dictionaries
                    dev_dict = {row[pk_col]: row for row in dev_rows}
                    prod_dict = {row[pk_col]: row for row in prod_rows}
                    
                    # Find differences
                    missing = [dev_dict[k] for k in dev_dict.keys() if k not in prod_dict]
                    extra = [prod_dict[k] for k in prod_dict.keys() if k not in dev_dict]
                    changed = []
                    
                    for pk in set(dev_dict.keys()) & set(prod_dict.keys()):
                        if dev_dict[pk] != prod_dict[pk]:
                            changed.append({
                                'pk': pk,
                                'dev': dev_dict[pk],
                                'prod': prod_dict[pk]
                            })
                    
                    if missing:
                        missing_records[table] = missing
                    if extra:
                        extra_records[table] = extra
                    if changed:
                        changed_records[table] = changed
                        
        except Exception as e:
            self.logger.error(f"  ❌ Error comparing reference data: {e}")
            return None
        
        return DataDiff(
            missing_records=missing_records,
            extra_records=extra_records,
            changed_records=changed_records
        )
    
    def compare_preferences(self) -> Optional[DataDiff]:
        """Compare preferences between dev and production"""
        preference_tables = [
            'preference_groups',
            'preference_types',
            'preference_profiles',
            'system_settings',
            'system_setting_types',
            'system_setting_groups'
        ]
        
        return self.compare_reference_data(preference_tables)
    
    def compare_groups(self) -> Optional[DataDiff]:
        """Compare groups between dev and production (CRITICAL!)"""
        group_tables = [
            'preference_groups',
            'user_groups',
            'group_permissions'
        ]
        
        # Filter to only existing tables
        dev_db = self.get_dev_db()
        if not dev_db:
            return None
        
        try:
            with sqlite3.connect(dev_db) as conn:
                existing_tables = self.fetch_tables(conn)
                group_tables = [t for t in group_tables if t in existing_tables]
        except:
            pass
        
        return self.compare_reference_data(group_tables)
    
    def generate_report(self, schema_diff: Optional[SchemaDiff], 
                       ref_data_diff: Optional[DataDiff],
                       preferences_diff: Optional[DataDiff],
                       groups_diff: Optional[DataDiff]) -> Dict:
        """Generate comprehensive report"""
        report = {
            'schema': {},
            'reference_data': {},
            'preferences': {},
            'groups': {},
            'has_changes': False,
            'critical_changes': []
        }
        
        # Schema report
        if schema_diff:
            report['schema'] = {
                'missing_tables': schema_diff.missing_tables,
                'extra_tables': schema_diff.extra_tables,
                'table_diffs': schema_diff.table_diffs,
                'missing_indexes': schema_diff.missing_indexes,
                'extra_indexes': schema_diff.extra_indexes,
                'missing_triggers': schema_diff.missing_triggers,
                'extra_triggers': schema_diff.extra_triggers
            }
            if (schema_diff.missing_tables or schema_diff.extra_tables or 
                schema_diff.table_diffs or schema_diff.missing_indexes):
                report['has_changes'] = True
                report['critical_changes'].append('Schema changes detected')
        
        # Reference data report
        if ref_data_diff:
            report['reference_data'] = {
                'missing_records': {k: len(v) for k, v in ref_data_diff.missing_records.items()},
                'extra_records': {k: len(v) for k, v in ref_data_diff.extra_records.items()},
                'changed_records': {k: len(v) for k, v in ref_data_diff.changed_records.items()}
            }
            if (ref_data_diff.missing_records or ref_data_diff.extra_records or 
                ref_data_diff.changed_records):
                report['has_changes'] = True
        
        # Preferences report
        if preferences_diff:
            report['preferences'] = {
                'missing_records': {k: len(v) for k, v in preferences_diff.missing_records.items()},
                'extra_records': {k: len(v) for k, v in preferences_diff.extra_records.items()},
                'changed_records': {k: len(v) for k, v in preferences_diff.changed_records.items()}
            }
            if (preferences_diff.missing_records or preferences_diff.extra_records or 
                preferences_diff.changed_records):
                report['has_changes'] = True
                report['critical_changes'].append('System preferences changes detected')
        
        # Groups report (CRITICAL!)
        if groups_diff:
            report['groups'] = {
                'missing_records': {k: len(v) for k, v in groups_diff.missing_records.items()},
                'extra_records': {k: len(v) for k, v in groups_diff.extra_records.items()},
                'changed_records': {k: len(v) for k, v in groups_diff.changed_records.items()}
            }
            if (groups_diff.missing_records or groups_diff.extra_records or 
                groups_diff.changed_records):
                report['has_changes'] = True
                report['critical_changes'].append('⚠️ CRITICAL: Groups changes detected - requires approval!')
        
        return report


def detect_changes(project_root: Optional[Path] = None) -> Dict:
    """
    Main entry point for detecting changes
    
    Args:
        project_root: Project root path (defaults to auto-detect)
    
    Returns:
        Dict with detection results
    """
    if project_root is None:
        project_root = PROJECT_ROOT
    
    detector = SchemaDetector(project_root)
    
    schema_diff = detector.compare_schema()
    ref_data_diff = detector.compare_reference_data()
    preferences_diff = detector.compare_preferences()
    groups_diff = detector.compare_groups()
    
    report = detector.generate_report(schema_diff, ref_data_diff, preferences_diff, groups_diff)
    
    return report


if __name__ == '__main__':
    report = detect_changes()
    print(json.dumps(report, indent=2, default=str))


