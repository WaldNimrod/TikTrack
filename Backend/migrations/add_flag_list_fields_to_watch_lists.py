#!/usr/bin/env python3
"""
Migration: Add Flag List Fields to Watch Lists
Date: 2025-01-28
Version: 1.0.1

Adds fields to watch_lists table for automatic flag list support:
- is_flag_list: Boolean flag indicating if this is an automatic flag list
- flag_color: Flag color for flag lists (only set if is_flag_list=1)
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


def column_exists(db: Session, table_name: str, column_name: str) -> bool:
    """Check if a column exists in a table"""
    try:
        inspector = inspect(engine)
        columns = [col['name'] for col in inspector.get_columns(table_name)]
        return column_name in columns
    except Exception as e:
        logger.warning(f"Error checking column {table_name}.{column_name}: {e}")
        return False


def add_flag_list_fields(db: Session):
    """Add flag list fields to watch_lists table"""
    
    logger.info("🚀 Starting flag list fields migration...")
    
    # Check if table exists
    inspector = inspect(engine)
    if 'watch_lists' not in inspector.get_table_names():
        logger.warning("⚠️  watch_lists table does not exist. Run create_watch_lists_tables.py first.")
        return
    
    # 1. Add is_flag_list column
    if not column_exists(db, 'watch_lists', 'is_flag_list'):
        logger.info("📋 Adding is_flag_list column to watch_lists...")
        db.execute(text("""
            ALTER TABLE watch_lists 
            ADD COLUMN is_flag_list INTEGER NOT NULL DEFAULT 0
        """))
        db.execute(text("""
            COMMENT ON COLUMN watch_lists.is_flag_list IS 
            'Whether this is an automatic flag list (0=no, 1=yes)'
        """))
        logger.info("✅ Added is_flag_list column")
    else:
        logger.info("⏭️  is_flag_list column already exists")
    
    # 2. Add flag_color column
    if not column_exists(db, 'watch_lists', 'flag_color'):
        logger.info("📋 Adding flag_color column to watch_lists...")
        db.execute(text("""
            ALTER TABLE watch_lists 
            ADD COLUMN flag_color VARCHAR(7)
        """))
        db.execute(text("""
            COMMENT ON COLUMN watch_lists.flag_color IS 
            'Flag color for flag lists - only set if is_flag_list=1'
        """))
        logger.info("✅ Added flag_color column")
    else:
        logger.info("⏭️  flag_color column already exists")
    
    # Commit changes
    db.commit()
    logger.info("✅ Flag list fields migration completed successfully!")


def main():
    """Run migration"""
    db: Session = SessionLocal()
    
    try:
        add_flag_list_fields(db)
        logger.info("🎉 Migration completed successfully!")
    except Exception as e:
        logger.error(f"❌ Migration failed: {e}", exc_info=True)
        db.rollback()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()

