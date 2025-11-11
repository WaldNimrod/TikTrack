#!/usr/bin/env python3
"""
Run migration script on production database

This script runs a migration file on the production database.
Usage: python3 scripts/run_production_migration.py <migration_file>
"""

import sys
import sqlite3
from pathlib import Path

# Add Backend to path
sys.path.insert(0, str(Path(__file__).parent.parent / "Backend"))

from config.settings import DB_PATH as PROD_DB_PATH

def run_migration(migration_file: Path, db_path: Path):
    """Run migration on database"""
    print(f"🔄 Running migration: {migration_file.name}")
    print(f"📁 Database: {db_path}")
    
    # Import migration module
    import importlib.util
    spec = importlib.util.spec_from_file_location("migration", migration_file)
    migration = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(migration)
    
    # Get SQL from migration
    if not hasattr(migration, 'upgrade'):
        print("❌ Migration file must have 'upgrade()' function")
        return False
    
    sql = migration.upgrade()
    if not sql:
        print("❌ Migration returned empty SQL")
        return False
    
    # Connect to database
    conn = sqlite3.connect(str(db_path))
    cursor = conn.cursor()
    
    try:
        # Execute migration SQL
        print("📝 Executing migration SQL...")
        cursor.executescript(sql)
        conn.commit()
        print("✅ Migration completed successfully")
        return True
    except Exception as e:
        conn.rollback()
        print(f"❌ Migration failed: {str(e)}")
        return False
    finally:
        conn.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 scripts/run_production_migration.py <migration_file>")
        print("\nExample:")
        print("  python3 scripts/run_production_migration.py Backend/migrations/add_entry_price_to_trade_plans.py")
        sys.exit(1)
    
    migration_file = Path(sys.argv[1])
    if not migration_file.exists():
        print(f"❌ Migration file not found: {migration_file}")
        sys.exit(1)
    
    # Use production database
    # Note: This script should be run from project root
    # Production DB is at production/Backend/db/tiktrack.db
    prod_db = Path(__file__).parent.parent / "production" / "Backend" / "db" / "tiktrack.db"
    
    if not prod_db.exists():
        print(f"❌ Production database not found: {prod_db}")
        print("   Please create production database first using:")
        print("   python3 production/Backend/scripts/create_production_db.py")
        sys.exit(1)
    
    print(f"🎯 Production Database: {prod_db}")
    print(f"📄 Migration File: {migration_file}")
    print()
    
    # Run migration
    success = run_migration(migration_file, prod_db)
    
    if success:
        print("\n✅ Migration completed successfully!")
        print("   You can now restart the production server.")
    else:
        print("\n❌ Migration failed!")
        sys.exit(1)

