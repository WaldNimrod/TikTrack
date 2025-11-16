#!/usr/bin/env python3
"""
Verify SQLAlchemy models match the actual database structure.

This script compares the SQLAlchemy model definitions with the actual
SQLite database structure to identify mismatches before migration.

Usage:
    python scripts/db/verify_models_vs_db.py [--db-path PATH]
"""

from __future__ import annotations

import argparse
import sqlite3
from collections import defaultdict
from pathlib import Path
from typing import Dict, List, Set

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_DB_PATH = ROOT / "Backend" / "db" / "tiktrack.db"


def get_db_tables(conn: sqlite3.Connection) -> Set[str]:
    """Get all table names from database."""
    cursor = conn.cursor()
    cursor.execute("""
        SELECT name FROM sqlite_master 
        WHERE type='table' 
        AND name NOT LIKE 'sqlite_%'
        AND name != 'lost_and_found'
    """)
    return {row[0] for row in cursor.fetchall()}


def get_db_columns(conn: sqlite3.Connection, table_name: str) -> Dict[str, Dict]:
    """Get column information from database."""
    cursor = conn.cursor()
    cursor.execute(f"PRAGMA table_info({table_name})")
    columns = {}
    for row in cursor.fetchall():
        columns[row[1]] = {
            "type": row[2],
            "not_null": bool(row[3]),
            "default": row[4],
            "pk": bool(row[5])
        }
    return columns


def get_db_foreign_keys(conn: sqlite3.Connection, table_name: str) -> List[Dict]:
    """Get foreign key information from database."""
    cursor = conn.cursor()
    cursor.execute(f"PRAGMA foreign_key_list({table_name})")
    fks = []
    for row in cursor.fetchall():
        fks.append({
            "from": row[3],
            "to_table": row[2],
            "to_column": row[4] if row[4] else "id"
        })
    return fks


def get_model_tables() -> Set[str]:
    """Get all table names from SQLAlchemy models."""
    try:
        import sys
        sys.path.insert(0, str(ROOT / "Backend"))
        
        from models import Base
        from sqlalchemy import inspect
        
        inspector = inspect(Base)
        return set(inspector.get_table_names())
    except Exception as e:
        print(f"⚠️  Warning: Could not load models: {e}")
        return set()


def get_model_columns(model_class) -> Dict[str, Dict]:
    """Get column information from SQLAlchemy model."""
    columns = {}
    for column in model_class.__table__.columns:
        columns[column.name] = {
            "type": str(column.type),
            "not_null": not column.nullable,
            "default": str(column.default) if column.default else None,
            "pk": column.primary_key
        }
    return columns


def get_model_foreign_keys(model_class) -> List[Dict]:
    """Get foreign key information from SQLAlchemy model."""
    fks = []
    for fk in model_class.__table__.foreign_keys:
        fks.append({
            "from": fk.parent.name,
            "to_table": fk.column.table.name,
            "to_column": fk.column.name
        })
    return fks


def verify_table_structure(
    db_columns: Dict[str, Dict],
    model_columns: Dict[str, Dict],
    table_name: str
) -> List[str]:
    """Verify table structure matches between DB and model."""
    issues = []
    
    # Check for columns in DB but not in model
    db_only = set(db_columns.keys()) - set(model_columns.keys())
    if db_only:
        issues.append(f"  ⚠️  Columns in DB but not in model: {', '.join(db_only)}")
    
    # Check for columns in model but not in DB
    model_only = set(model_columns.keys()) - set(db_columns.keys())
    if model_only:
        issues.append(f"  ⚠️  Columns in model but not in DB: {', '.join(model_only)}")
    
    # Check common columns for type mismatches
    common = set(db_columns.keys()) & set(model_columns.keys())
    for col_name in common:
        db_col = db_columns[col_name]
        model_col = model_columns[col_name]
        
        # Check nullable
        if db_col["not_null"] != model_col["not_null"]:
            issues.append(
                f"  ⚠️  Column '{col_name}': nullable mismatch "
                f"(DB: {not db_col['not_null']}, Model: {not model_col['not_null']})"
            )
        
        # Check primary key
        if db_col["pk"] != model_col["pk"]:
            issues.append(
                f"  ⚠️  Column '{col_name}': primary key mismatch "
                f"(DB: {db_col['pk']}, Model: {model_col['pk']})"
            )
    
    return issues


def main() -> None:
    parser = argparse.ArgumentParser(description="Verify models match database")
    parser.add_argument(
        "--db-path",
        type=Path,
        default=DEFAULT_DB_PATH,
        help=f"Path to SQLite database (default: {DEFAULT_DB_PATH.relative_to(ROOT)})"
    )
    args = parser.parse_args()
    
    if not args.db_path.exists():
        print(f"❌ Database not found: {args.db_path}")
        return
    
    print(f"🔍 Verifying models against database: {args.db_path}")
    print()
    
    conn = sqlite3.connect(str(args.db_path))
    conn.row_factory = sqlite3.Row
    
    try:
        db_tables = get_db_tables(conn)
        model_tables = get_model_tables()
        
        # Tables in DB but not in models
        db_only_tables = db_tables - model_tables
        if db_only_tables:
            print("⚠️  Tables in DB but not in models:")
            for table in sorted(db_only_tables):
                print(f"  - {table}")
            print()
        
        # Tables in models but not in DB
        model_only_tables = model_tables - db_tables
        if model_only_tables:
            print("⚠️  Tables in models but not in DB:")
            for table in sorted(model_only_tables):
                print(f"  - {table}")
            print()
        
        # Verify common tables
        common_tables = db_tables & model_tables
        print(f"✅ Verifying {len(common_tables)} common tables...")
        print()
        
        issues_found = False
        
        for table_name in sorted(common_tables):
            try:
                # Get DB structure
                db_columns = get_db_columns(conn, table_name)
                db_fks = get_db_foreign_keys(conn, table_name)
                
                # Get model structure
                import sys
                import importlib
                sys.path.insert(0, str(ROOT / "Backend"))
                
                # Import models module
                models_module = importlib.import_module('models')
                
                # Find model class
                model_class = None
                for name in models_module.__all__:
                    obj = getattr(models_module, name, None)
                    if (obj and hasattr(obj, '__tablename__') and 
                        obj.__tablename__ == table_name):
                        model_class = obj
                        break
                
                if not model_class:
                    print(f"⚠️  {table_name}: Model class not found")
                    issues_found = True
                    continue
                
                model_columns = get_model_columns(model_class)
                model_fks = get_model_foreign_keys(model_class)
                
                # Verify structure
                issues = verify_table_structure(db_columns, model_columns, table_name)
                
                if issues:
                    print(f"⚠️  {table_name}:")
                    for issue in issues:
                        print(issue)
                    issues_found = True
                else:
                    print(f"✅ {table_name}: Structure matches")
                
            except Exception as e:
                print(f"❌ {table_name}: Error - {e}")
                issues_found = True
        
        print()
        if issues_found:
            print("⚠️  Some issues found. Review above.")
        else:
            print("✅ All tables verified successfully!")
        
    finally:
        conn.close()


if __name__ == "__main__":
    main()

