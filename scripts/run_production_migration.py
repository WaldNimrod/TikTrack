#!/usr/bin/env python3
"""
Run migration script on production database

This script runs a migration file on the production database.
PostgreSQL only.

Usage: python3 scripts/run_production_migration.py <migration_file>
"""

import importlib.util
import sys
from pathlib import Path

# Add Backend to path
sys.path.insert(0, str(Path(__file__).parent.parent / "Backend"))

from config.settings import DATABASE_URL
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError

def run_migration(migration_file: Path, database_url: str = None):
    """Run migration on database
    
    Args:
        migration_file: Path to migration file
        database_url: Database URL (defaults to production DATABASE_URL)
    """
    if database_url is None:
        database_url = DATABASE_URL
    
    print(f"🔄 Running migration: {migration_file.name}")
    print(f"📁 Database: {database_url[:50]}...")
    print("📊 Type: PostgreSQL")
    print()
    
    # Import migration module
    spec = importlib.util.spec_from_file_location("migration", migration_file)
    migration = importlib.util.module_from_spec(spec)
    sys.path.insert(0, str(migration_file.parent))
    spec.loader.exec_module(migration)
    
    try:
        engine = create_engine(database_url)
        
        # Check for run_migration function (takes DATABASE_URL)
        if hasattr(migration, 'run_migration'):
            print("📝 Using run_migration() function...")
            result = migration.run_migration(database_url)
            if result:
                print("✅ Migration completed successfully")
                return True
            else:
                print("❌ Migration returned False")
                return False
        
        # Check for upgrade function (SQLAlchemy style)
        elif hasattr(migration, 'upgrade'):
            print("📝 Using upgrade() function...")
            with engine.begin() as conn:
                sql = migration.upgrade()
                if sql:
                    # If upgrade() returns SQL string, execute it
                    if isinstance(sql, str):
                        conn.execute(text(sql))
                    else:
                        # upgrade() might modify schema directly
                        migration.upgrade()
                else:
                    # upgrade() might modify schema directly
                    migration.upgrade()
            print("✅ Migration completed successfully")
            return True
        
        # Check for migrate function
        elif hasattr(migration, 'migrate'):
            print("📝 Using migrate() function...")
            result = migration.migrate()
            if result:
                print("✅ Migration completed successfully")
                return True
            else:
                print("❌ Migration returned False")
                return False
        
        else:
            print("❌ Migration file must have 'run_migration()', 'upgrade()', or 'migrate()' function")
            return False
            
    except SQLAlchemyError as e:
        print(f"❌ Database error during migration: {e}")
        import traceback
        traceback.print_exc()
        return False
    except Exception as e:
        print(f"❌ Migration failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

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
    
    # Use production database URL from config
    # Note: This script should be run from project root
    # Production config is at production/Backend/config/settings.py
    sys.path.insert(0, str(Path(__file__).parent.parent / "production" / "Backend"))
    try:
        from config.settings import DATABASE_URL as PROD_DATABASE_URL
    except ImportError:
        print("❌ Could not import production database settings")
        print("   Please ensure production/Backend/config/settings.py exists")
        sys.exit(1)
    
    print(f"🎯 Production Database: {PROD_DATABASE_URL[:50]}...")
    print(f"📄 Migration File: {migration_file}")
    print()
    
    # Run migration
    success = run_migration(migration_file, PROD_DATABASE_URL)
    
    if success:
        print("\n✅ Migration completed successfully!")
        print("   You can now restart the production server.")
    else:
        print("\n❌ Migration failed!")
        sys.exit(1)
