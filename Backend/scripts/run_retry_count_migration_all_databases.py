#!/usr/bin/env python3
"""
Run retry_count migration on all databases
==========================================
Runs the add_retry_count_to_ai_analysis migration on all 3 databases:
- TikTrack-db-development
- TikTrack-db-production
- TikTrack-db-cleanup-test

Date: 2025-12-04
"""

import os
import sys
from pathlib import Path

# Add Backend directory to path
backend_path = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_path))

from sqlalchemy import create_engine, text, inspect
from sqlalchemy.orm import Session, sessionmaker
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Database configurations
DATABASES = {
    'development': {
        'name': 'TikTrack-db-development',
        'host': os.getenv('POSTGRES_HOST', 'localhost'),
        'user': os.getenv('POSTGRES_USER', 'TikTrakDBAdmin'),
        'password': os.getenv('POSTGRES_PASSWORD', 'BigMeZoo1974!?'),
        'port': os.getenv('POSTGRES_PORT', '5432')
    },
    'production': {
        'name': 'TikTrack-db-production',
        'host': os.getenv('POSTGRES_HOST', 'localhost'),
        'user': os.getenv('POSTGRES_USER', 'TikTrakDBAdmin'),
        'password': os.getenv('POSTGRES_PASSWORD', 'BigMeZoo1974!?'),
        'port': os.getenv('POSTGRES_PORT', '5432')
    },
    'cleanup-test': {
        'name': 'TikTrack-db-cleanup-test',
        'host': os.getenv('POSTGRES_HOST', 'localhost'),
        'user': os.getenv('POSTGRES_USER', 'TikTrakDBAdmin'),
        'password': os.getenv('POSTGRES_PASSWORD', 'BigMeZoo1974!?'),
        'port': os.getenv('POSTGRES_PORT', '5432')
    }
}


def column_exists(engine, table_name: str, column_name: str) -> bool:
    """Check if a column exists in a table"""
    try:
        inspector = inspect(engine)
        if not inspector.has_table(table_name):
            logger.warning(f"⚠️  Table {table_name} does not exist - skipping column check")
            return False
        columns = [col['name'] for col in inspector.get_columns(table_name)]
        return column_name in columns
    except Exception as e:
        logger.warning(f"⚠️  Error checking column {table_name}.{column_name}: {e}")
        return False


def add_retry_count_column(engine, db_name: str):
    """Add retry_count column to ai_analysis_requests table"""
    
    logger.info(f"🚀 Starting retry_count column migration for database: {db_name}")
    
    table_name = 'ai_analysis_requests'
    column_name = 'retry_count'
    
    SessionLocal = sessionmaker(bind=engine)
    db: Session = SessionLocal()
    
    try:
        # Check if table exists
        inspector = inspect(engine)
        if not inspector.has_table(table_name):
            logger.warning(f"⏭️  Table {table_name} does not exist in {db_name} - skipping")
            return True  # Not an error, just skip
        
        # Check if column already exists
        if column_exists(engine, table_name, column_name):
            logger.info(f"⏭️  Column {table_name}.{column_name} already exists in {db_name} - skipping")
            return True
        
        logger.info(f"📋 Adding {column_name} column to {table_name} table in {db_name}...")
        
        # Add column
        db.execute(text(f"""
            ALTER TABLE {table_name} 
            ADD COLUMN {column_name} INTEGER DEFAULT 0 NOT NULL
        """))
        
        logger.info(f"✅ Added {column_name} column to {table_name} table in {db_name}")
        
        # Commit changes
        db.commit()
        logger.info(f"✅ Retry count column migration completed successfully for {db_name}!")
        return True
        
    except Exception as e:
        logger.error(f"❌ Error adding retry_count column to {db_name}: {e}", exc_info=True)
        db.rollback()
        return False
    finally:
        db.close()


def run_migration_on_database(db_config: dict, db_key: str) -> tuple[bool, str]:
    """
    Run migration on a specific database
    
    Args:
        db_config: Database configuration dictionary
        db_key: Database key name (for logging)
        
    Returns:
        Tuple of (success: bool, message: str)
    """
    db_name = db_config['name']
    host = db_config['host']
    user = db_config['user']
    password = db_config['password']
    port = db_config['port']
    
    try:
        # Create database URL
        database_url = f"postgresql+psycopg2://{user}:{password}@{host}:{port}/{db_name}"
        
        logger.info(f"\n{'=' * 60}")
        logger.info(f"📦 Running migration on: {db_key} ({db_name})")
        logger.info(f"{'=' * 60}")
        
        # Create engine
        engine = create_engine(database_url, echo=False)
        
        # Test connection
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        
        logger.info(f"✅ Connected to {db_name}")
        
        # Run migration
        success = add_retry_count_column(engine, db_name)
        
        if success:
            return True, f"Migration successful on {db_name}"
        else:
            return False, f"Migration failed on {db_name}"
            
    except Exception as e:
        error_msg = f"Connection or migration error on {db_name}: {str(e)}"
        logger.error(f"❌ {error_msg}")
        return False, error_msg


def main():
    """Run migration on all databases"""
    logger.info("=" * 60)
    logger.info("🚀 Retry Count Column Migration - All Databases")
    logger.info("=" * 60)
    
    results = {}
    
    # Run migration on each database
    for db_key, db_config in DATABASES.items():
        success, message = run_migration_on_database(db_config, db_key)
        results[db_key] = (success, message)
        
        if not success:
            logger.error(f"\n❌ Migration failed on {db_key}!")
            logger.error(f"   Error: {message}")
            # Continue to other databases even if one fails
    
    # Summary
    logger.info("\n" + "=" * 60)
    logger.info("📊 Migration Summary")
    logger.info("=" * 60)
    
    success_count = sum(1 for success, _ in results.values() if success)
    total_count = len(results)
    
    for db_key, (success, message) in results.items():
        status = "✅ PASS" if success else "❌ FAIL"
        logger.info(f"  {status}: {db_key} - {message}")
    
    logger.info(f"\nTotal: {success_count}/{total_count} databases migrated successfully")
    
    if success_count == total_count:
        logger.info("\n🎉 All migrations completed successfully!")
        return 0
    else:
        logger.warning(f"\n⚠️  {total_count - success_count} database(s) failed migration")
        return 1


if __name__ == "__main__":
    sys.exit(main())

