#!/usr/bin/env python3
"""
Add is_default column to watch_lists table
==========================================

This migration adds is_default column to watch_lists table to mark
the user's default watch list.

Author: TikTrack Development Team
Date: December 2025
"""

import os
import sys
import logging

# Add Backend directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set PostgreSQL environment variables if not already set
if not os.getenv('POSTGRES_HOST'):
    os.environ['POSTGRES_HOST'] = 'localhost'
if not os.getenv('POSTGRES_DB'):
    os.environ['POSTGRES_DB'] = 'TikTrack-db-development'
if not os.getenv('POSTGRES_USER'):
    os.environ['POSTGRES_USER'] = 'TikTrakDBAdmin'
if not os.getenv('POSTGRES_PASSWORD'):
    os.environ['POSTGRES_PASSWORD'] = 'BigMeZoo1974!?'
if not os.getenv('POSTGRES_PORT'):
    os.environ['POSTGRES_PORT'] = '5432'

from config.database import engine, SessionLocal
from sqlalchemy import text

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def add_is_default_column():
    """Add is_default column to watch_lists table"""

    db = SessionLocal()
    try:
        logger.info("🔄 Starting migration: Add is_default column")

        # Check if column already exists
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT column_name
                FROM information_schema.columns
                WHERE table_name = 'watch_lists'
                AND column_name = 'is_default'
            """))
            column_exists = result.fetchone() is not None

        if column_exists:
            logger.info("✅ Column already exists, skipping migration")
            return True

        # Add column
        logger.info("📝 Adding is_default to watch_lists table...")
        with engine.connect() as conn:
            conn.execute(text("""
                ALTER TABLE watch_lists
                ADD COLUMN is_default INTEGER NOT NULL DEFAULT 0
            """))
            conn.commit()
        logger.info("✅ Added is_default to watch_lists")

        logger.info("✅ Migration completed successfully")
        return True

    except Exception as e:
        logger.error(f"❌ Migration failed: {e}")
        import traceback
        logger.error(traceback.format_exc())
        db.rollback()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    success = add_is_default_column()
    sys.exit(0 if success else 1)
