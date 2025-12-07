#!/usr/bin/env python3
"""
Migration: Add retry_count to AI Analysis Requests
Date: 2025-12-04
Version: 1.0.0

Adds retry_count column to ai_analysis_requests table for tracking retry attempts.
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


def column_exists(table_name: str, column_name: str) -> bool:
    """Check if a column exists in a table"""
    try:
        inspector = inspect(engine)
        columns = [col['name'] for col in inspector.get_columns(table_name)]
        return column_name in columns
    except Exception as e:
        logger.warning(f"Error checking column {table_name}.{column_name}: {e}")
        return False


def add_retry_count_column(db: Session):
    """Add retry_count column to ai_analysis_requests table"""
    
    logger.info("🚀 Starting retry_count column migration...")
    
    table_name = 'ai_analysis_requests'
    column_name = 'retry_count'
    
    # Check if column already exists
    if column_exists(table_name, column_name):
        logger.info(f"⏭️  Column {table_name}.{column_name} already exists - skipping")
        return
    
    try:
        logger.info(f"📋 Adding {column_name} column to {table_name} table...")
        
        # Add column as nullable first
        db.execute(text(f"""
            ALTER TABLE {table_name} 
            ADD COLUMN {column_name} INTEGER DEFAULT 0 NOT NULL
        """))
        
        logger.info(f"✅ Added {column_name} column to {table_name} table")
        
        # Commit changes
        db.commit()
        logger.info("✅ Retry count column migration completed successfully!")
        
    except Exception as e:
        logger.error(f"❌ Error adding retry_count column: {e}", exc_info=True)
        db.rollback()
        raise


def main():
    """Run migration"""
    db: Session = SessionLocal()
    
    try:
        add_retry_count_column(db)
        logger.info("🎉 Migration completed successfully!")
    except Exception as e:
        logger.error(f"❌ Migration failed: {e}", exc_info=True)
        db.rollback()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()

