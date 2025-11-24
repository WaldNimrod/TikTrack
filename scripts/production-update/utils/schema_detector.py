#!/usr/bin/env python3
"""
Schema & Data Detector
======================

Detects schema and data changes between development and production databases.
Handles schema comparison, reference data comparison, preferences, and groups.

Note: Uses SQLAlchemy to support PostgreSQL databases (SQLite support removed).
"""

import json
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

# Import SQLAlchemy for database connections
from sqlalchemy import create_engine, text, inspect, MetaData
from sqlalchemy.engine import Engine


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
    
    def get_dev_db_url(self) -> Optional[str]:
        """Get development database URL"""
        return self.dev_db_url
    
    def get_prod_db_url(self) -> Optional[str]:
        """Get production database URL"""
        return self.prod_db_url
    
    def fetch_tables(self, engine: Engine) -> List[str]:
        """Get all table names"""
        inspector = inspect(engine)
        return inspector.get_table_names()
    
    def fetch_columns(self, engine: Engine, table: str) -> List[ColumnInfo]:
        """Get column information for a table"""
        inspector = inspect(engine)
        columns = inspector.get_columns(table)
        
        # Get primary key columns
        pk_constraint = inspector.get_pk_constraint(table)
        pk_columns = set(pk_constraint.get('constrained_columns', []))
        
        return [
            ColumnInfo(
                name=col['name'],
                type=str(col['type']),
                notnull=1 if not col.get('nullable', True) else 0,
                default=str(col.get('default', '')) if col.get('default') is not None else None,
                pk=1 if col['name'] in pk_columns else 0
            )
            for col in columns
        ]
    
    def fetch_indexes(self, engine: Engine) -> Dict[str, str]:
        """Get all indexes"""
        inspector = inspect(engine)
        indexes = {}
        
        for table_name in inspector.get_table_names():
            table_indexes = inspector.get_indexes(table_name)
            for idx in table_indexes:
                # Generate index SQL representation
                idx_name = idx['name']
                idx_cols = ', '.join(idx['column_names'])
                idx_unique = 'UNIQUE ' if idx.get('unique', False) else ''
                indexes[idx_name] = f"CREATE {idx_unique}INDEX {idx_name} ON {table_name} ({idx_cols})"
        
        return indexes
    
    def fetch_triggers(self, engine: Engine) -> Dict[str, str]:
        """Get all triggers"""
        # PostgreSQL doesn't expose triggers via inspect, need to query system tables
        triggers = {}
        
        try:
            with engine.connect() as conn:
                # PostgreSQL system query for triggers
                result = conn.execute(text("""
                    SELECT trigger_name, event_manipulation, event_object_table, action_statement
                    FROM information_schema.triggers
                    WHERE trigger_schema = 'public'
                """))
                
                for row in result:
                    trigger_name = row[0]
                    # Build trigger SQL representation
                    triggers[trigger_name] = f"CREATE TRIGGER {trigger_name} ..."
        except Exception as e:
            # If query fails, return empty dict
            self.logger.warning(f"  ⚠️  Could not fetch triggers: {e}")
        
        return triggers
    
    def get_table_info(self, engine: Engine, table: str) -> TableInfo:
        """Get complete table information"""
        return TableInfo(
            name=table,
            columns=self.fetch_columns(engine, table),
            indexes=self.fetch_indexes(engine),
            triggers=self.fetch_triggers(engine)
        )
    
    def compare_schema(self) -> Optional[SchemaDiff]:
        """Compare schema between dev and production"""
        try:
            # Test connections
            with self.dev_engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            with self.prod_engine.connect() as conn:
                conn.execute(text("SELECT 1"))
        except Exception as e:
            self.logger.error(f"  ❌ Database connection failed: {e}")
            return None
        
        self.logger.info("  🔍 Comparing schema: dev vs production")
        
        try:
            dev_tables = set(self.fetch_tables(self.dev_engine))
            prod_tables = set(self.fetch_tables(self.prod_engine))
            
            missing_tables = sorted(dev_tables - prod_tables)
            extra_tables = sorted(prod_tables - dev_tables)
            shared_tables = sorted(dev_tables & prod_tables)
            
            table_diffs = {}
            
            # Compare shared tables
            for table in shared_tables:
                dev_cols = self.fetch_columns(self.dev_engine, table)
                prod_cols = self.fetch_columns(self.prod_engine, table)
                
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
            dev_indexes = self.fetch_indexes(self.dev_engine)
            prod_indexes = self.fetch_indexes(self.prod_engine)
            missing_indexes = sorted(set(dev_indexes.keys()) - set(prod_indexes.keys()))
            extra_indexes = sorted(set(prod_indexes.keys()) - set(dev_indexes.keys()))
            
            # Compare triggers
            dev_triggers = self.fetch_triggers(self.dev_engine)
            prod_triggers = self.fetch_triggers(self.prod_engine)
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
            import traceback
            traceback.print_exc()
            return None
    
    def compare_reference_data(self, tables: Optional[List[str]] = None) -> Optional[DataDiff]:
        """Compare reference data between dev and production"""
        try:
            # Test connections
            with self.dev_engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            with self.prod_engine.connect() as conn:
                conn.execute(text("SELECT 1"))
        except Exception as e:
            self.logger.error(f"  ❌ Database connection failed: {e}")
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
            with self.dev_engine.connect() as dev_conn, self.prod_engine.connect() as prod_conn:
                for table in tables:
                    # Check if table exists in both
                    dev_tables = self.fetch_tables(self.dev_engine)
                    prod_tables = self.fetch_tables(self.prod_engine)
                    
                    if table not in dev_tables:
                        continue
                    if table not in prod_tables:
                        missing_records[table] = []
                        continue
                    
                    # Get all records from both
                    dev_result = dev_conn.execute(text(f"SELECT * FROM {table}"))
                    dev_cols = list(dev_result.keys())
                    dev_rows = [dict(row._mapping) for row in dev_result.fetchall()]
                    
                    prod_result = prod_conn.execute(text(f"SELECT * FROM {table}"))
                    prod_cols = list(prod_result.keys())
                    prod_rows = [dict(row._mapping) for row in prod_result.fetchall()]
                    
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
            import traceback
            traceback.print_exc()
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
        try:
            existing_tables = self.fetch_tables(self.dev_engine)
            group_tables = [t for t in group_tables if t in existing_tables]
        except Exception as e:
            self.logger.warning(f"  ⚠️  Could not check existing tables: {e}")
            return None
        
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

