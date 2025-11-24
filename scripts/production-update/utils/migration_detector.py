#!/usr/bin/env python3
"""
Migration Detector
==================

Detects which migrations need to be run in production by comparing
database schemas between development and production.

Note: Uses SQLAlchemy to support PostgreSQL databases.
"""

import sys
import re
from pathlib import Path
from typing import Dict, List, Optional, Set, Tuple
from dataclasses import dataclass

# Add project root to path
PROJECT_ROOT = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

try:
    from logger import get_logger
except ImportError:
    sys.path.insert(0, str(Path(__file__).parent))
    from logger import get_logger

from sqlalchemy import create_engine, inspect, text, MetaData
from sqlalchemy.engine import Engine

# Import schema detector for comparison
from schema_detector import SchemaDetector


@dataclass
class MigrationInfo:
    """Information about a migration file"""
    file_path: Path
    name: str
    tables_created: List[str]
    columns_added: Dict[str, List[str]]  # table -> [columns]
    indexes_created: List[str]
    dependencies: List[str]  # Other migrations this depends on


class MigrationDetector:
    """Detects which migrations need to be run"""
    
    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.logger = get_logger()
        self.schema_detector = SchemaDetector(project_root)
        self.migrations_dir = project_root / "Backend" / "migrations"
    
    def detect_missing_tables(self) -> Set[str]:
        """Detect tables that exist in dev but not in production"""
        schema_diff = self.schema_detector.compare_schema()
        if not schema_diff:
            return set()
        
        return set(schema_diff.missing_tables)
    
    def detect_missing_columns(self) -> Dict[str, List[str]]:
        """Detect columns that exist in dev but not in production
        
        Returns:
            Dict mapping table name to list of missing column names
        """
        schema_diff = self.schema_detector.compare_schema()
        if not schema_diff:
            return {}
        
        missing_columns = {}
        
        # Check table diffs for column differences
        for table, diff in schema_diff.table_diffs.items():
            if diff.get('type') == 'column_differences':
                differences = diff.get('differences', [])
                for col_diff in differences:
                    table_name = table
                    if table_name not in missing_columns:
                        missing_columns[table_name] = []
                    # Column name is in the diff structure
                    if 'column' in col_diff:
                        missing_columns[table_name].append(col_diff['column'])
        
        return missing_columns
    
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
            for match in re.finditer(create_table_pattern, content, re.IGNORECASE):
                tables_created.append(match.group(1))
            
            # Extract column additions (ALTER TABLE ... ADD COLUMN)
            columns_added = {}
            alter_table_pattern = r'ALTER\s+TABLE\s+["\']?(\w+)["\']?\s+ADD\s+(?:COLUMN\s+)?["\']?(\w+)["\']?'
            for match in re.finditer(alter_table_pattern, content, re.IGNORECASE):
                table = match.group(1)
                column = match.group(2)
                if table not in columns_added:
                    columns_added[table] = []
                columns_added[table].append(column)
            
            # Extract indexes
            indexes_created = []
            create_index_pattern = r'CREATE\s+(?:UNIQUE\s+)?INDEX\s+(?:IF\s+NOT\s+EXISTS\s+)?["\']?(\w+)["\']?'
            for match in re.finditer(create_index_pattern, content, re.IGNORECASE):
                indexes_created.append(match.group(1))
            
            # Try to detect dependencies from imports or comments
            dependencies = []
            # Look for imports of other migrations
            import_pattern = r'from\s+migrations\.(\w+)\s+import|import\s+migrations\.(\w+)'
            for match in re.finditer(import_pattern, content):
                dep = match.group(1) or match.group(2)
                if dep:
                    dependencies.append(dep)
            
            return MigrationInfo(
                file_path=migration_path,
                name=migration_path.stem,
                tables_created=tables_created,
                columns_added=columns_added,
                indexes_created=indexes_created,
                dependencies=dependencies
            )
        except Exception as e:
            self.logger.warning(f"  ⚠️  Could not parse migration {migration_path.name}: {e}")
            return None
    
    def find_required_migrations(self) -> List[MigrationInfo]:
        """Find migrations that need to be run"""
        if not self.migrations_dir.exists():
            self.logger.warning("  ⚠️  Migrations directory not found")
            return []
        
        # Get current state
        missing_tables = self.detect_missing_tables()
        missing_columns = self.detect_missing_columns()
        
        self.logger.info(f"  🔍 Found {len(missing_tables)} missing tables")
        self.logger.info(f"  🔍 Found {sum(len(cols) for cols in missing_columns.values())} missing columns")
        
        # Scan all migration files
        migration_files = list(self.migrations_dir.glob("*.py"))
        migration_files.sort(key=lambda p: p.stat().st_mtime)  # Sort by modification time
        
        required_migrations = []
        
        for migration_file in migration_files:
            # Skip template and test files
            if migration_file.name.startswith('_') or 'test' in migration_file.name.lower():
                continue
            
            migration_info = self.parse_migration_file(migration_file)
            if not migration_info:
                continue
            
            # Check if this migration is needed
            is_needed = False
            
            # Check if it creates missing tables
            for table in migration_info.tables_created:
                if table in missing_tables:
                    is_needed = True
                    self.logger.info(f"    📋 Migration {migration_info.name} needed: creates table {table}")
                    break
            
            # Check if it adds missing columns
            if not is_needed:
                for table, columns in migration_info.columns_added.items():
                    if table in missing_columns:
                        for col in columns:
                            if col in missing_columns[table]:
                                is_needed = True
                                self.logger.info(f"    📋 Migration {migration_info.name} needed: adds column {table}.{col}")
                                break
                        if is_needed:
                            break
            
            if is_needed:
                required_migrations.append(migration_info)
        
        return required_migrations
    
    def order_migrations(self, migrations: List[MigrationInfo]) -> List[MigrationInfo]:
        """Order migrations by dependencies (topological sort)"""
        # Simple ordering: by file modification time
        # More sophisticated dependency resolution can be added later
        migrations.sort(key=lambda m: m.file_path.stat().st_mtime)
        
        # Check for explicit dependencies
        ordered = []
        remaining = migrations.copy()
        
        while remaining:
            # Find migrations with no unresolved dependencies
            for migration in remaining:
                deps_resolved = True
                for dep in migration.dependencies:
                    # Check if dependency is in remaining (not yet added)
                    if any(m.name == dep for m in remaining if m != migration):
                        deps_resolved = False
                        break
                
                if deps_resolved:
                    ordered.append(migration)
                    remaining.remove(migration)
                    break
            else:
                # No migration with resolved dependencies - add remaining by time
                ordered.extend(remaining)
                break
        
        return ordered
    
    def generate_migration_report(self, migrations: List[MigrationInfo]) -> Dict:
        """Generate a report on required migrations"""
        return {
            'count': len(migrations),
            'migrations': [
                {
                    'name': m.name,
                    'file': str(m.file_path.relative_to(self.project_root)),
                    'tables_created': m.tables_created,
                    'columns_added': m.columns_added,
                    'indexes_created': m.indexes_created,
                    'dependencies': m.dependencies
                }
                for m in migrations
            ],
            'warnings': []
        }


def detect_required_migrations(project_root: Optional[Path] = None) -> Dict:
    """
    Main entry point for migration detection
    
    Args:
        project_root: Project root path (defaults to auto-detect)
    
    Returns:
        Dict with detection results
    """
    if project_root is None:
        project_root = PROJECT_ROOT
    
    detector = MigrationDetector(project_root)
    
    required = detector.find_required_migrations()
    ordered = detector.order_migrations(required)
    
    report = detector.generate_migration_report(ordered)
    
    return report


if __name__ == '__main__':
    report = detect_required_migrations()
    import json
    print(json.dumps(report, indent=2, default=str))

