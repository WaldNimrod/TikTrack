#!/usr/bin/env python3
"""
Add Provider Index to AI Analysis Requests
==========================================
Adds index on provider column for better query performance

Date: 2025-12-04
"""

import os
import sys
from datetime import datetime
from pathlib import Path

# Add Backend directory to path
backend_path = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_path))

from sqlalchemy import text, inspect
from sqlalchemy.orm import Session
from config.database import SessionLocal, engine
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def index_exists(engine, table_name: str, index_name: str) -> bool:
    """Check if an index exists in a table"""
    try:
        inspector = inspect(engine)
        indexes = inspector.get_indexes(table_name)
        return any(idx['name'] == index_name for idx in indexes)
    except Exception as e:
        logger.warning(f"Error checking index {table_name}.{index_name}: {e}")
        return False


def add_provider_index(db: Session, db_name: str):
    """Add provider index to ai_analysis_requests table"""

    logger.info(f"🚀 Starting provider index migration for database: {db_name}")

    table_name = 'ai_analysis_requests'
    index_name = 'idx_ai_analysis_requests_provider'

    # Get engine from session
    current_engine = db.get_bind()

    # Check if table exists
    inspector = inspect(current_engine)
    if not inspector.has_table(table_name):
        logger.warning(f"⏭️  Table {table_name} does not exist in {db_name} - skipping")
        return  # Not an error, just skip

    # Check if index already exists
    if index_exists(current_engine, table_name, index_name):
        logger.info(f"⏭️  Index {index_name} already exists in {db_name} - skipping")
        return

    try:
        logger.info(f"📋 Adding {index_name} index to {table_name} table in {db_name}...")

        # Add index
        db.execute(text(f"""
            CREATE INDEX {index_name}
            ON {table_name}(provider)
        """))

        logger.info(f"✅ Added {index_name} index to {table_name} table in {db_name}")

        # Commit changes
        db.commit()
        logger.info(f"✅ Provider index migration completed successfully for {db_name}!")

    except Exception as e:
        logger.error(f"❌ Error adding provider index to {db_name}: {e}", exc_info=True)
        db.rollback()
        raise


def main():
    """Run migration"""
    db: Session = SessionLocal()

    try:
        db_name = os.getenv('POSTGRES_DB', 'Standalone_DB')
        add_provider_index(db, db_name)
        logger.info("🎉 Migration completed successfully!")
    except Exception as e:
        logger.error(f"❌ Migration failed: {e}", exc_info=True)
        db.rollback()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()


