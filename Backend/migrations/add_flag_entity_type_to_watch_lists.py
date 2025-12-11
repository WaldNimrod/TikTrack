#!/usr/bin/env python3
"""
Add flag_entity_type to watch_lists and watch_list_items
========================================================

This migration adds flag_entity_type column to both watch_lists and watch_list_items tables.
This allows identifying flags by entityType (constant) instead of color (varies by user preferences).

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

from config.database import engine, SessionLocal
from sqlalchemy import text

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Map flag colors to entity types (for migration of existing data)
FLAG_COLOR_TO_ENTITY_TYPE = {
    '#26baac': 'trade',
    '#0056b3': 'trade_plan',
    '#28a745': 'account',
    '#20c997': 'cash_flow',
    '#dc3545': 'ticker',
    '#fc5a06': 'alert',
    '#6f42c1': 'note',
    '#17a2b8': 'execution'
}

def add_flag_entity_type_columns():
    """Add flag_entity_type columns to watch_lists and watch_list_items tables"""
    
    db = SessionLocal()
    try:
        logger.info("🔄 Starting migration: Add flag_entity_type columns")
        
        # Check if columns already exist
        with engine.connect() as conn:
            # Check watch_lists table
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'watch_lists' 
                AND column_name = 'flag_entity_type'
            """))
            watch_lists_has_column = result.fetchone() is not None
            
            # Check watch_list_items table
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'watch_list_items' 
                AND column_name = 'flag_entity_type'
            """))
            watch_list_items_has_column = result.fetchone() is not None
        
        if watch_lists_has_column and watch_list_items_has_column:
            logger.info("✅ Columns already exist, skipping migration")
            return True
        
        # Add column to watch_lists if needed
        if not watch_lists_has_column:
            logger.info("📝 Adding flag_entity_type to watch_lists table...")
            with engine.connect() as conn:
                conn.execute(text("""
                    ALTER TABLE watch_lists 
                    ADD COLUMN flag_entity_type VARCHAR(50) NULL
                """))
                conn.commit()
            logger.info("✅ Added flag_entity_type to watch_lists")
        
        # Add column to watch_list_items if needed
        if not watch_list_items_has_column:
            logger.info("📝 Adding flag_entity_type to watch_list_items table...")
            with engine.connect() as conn:
                conn.execute(text("""
                    ALTER TABLE watch_list_items 
                    ADD COLUMN flag_entity_type VARCHAR(50) NULL
                """))
                conn.commit()
            logger.info("✅ Added flag_entity_type to watch_list_items")
        
        # Migrate existing data: set flag_entity_type based on flag_color
        logger.info("🔄 Migrating existing flag_color values to flag_entity_type...")
        with engine.connect() as conn:
            # Update watch_lists
            for color, entity_type in FLAG_COLOR_TO_ENTITY_TYPE.items():
                conn.execute(text("""
                    UPDATE watch_lists 
                    SET flag_entity_type = :entity_type 
                    WHERE flag_color = :color AND flag_entity_type IS NULL
                """), {"entity_type": entity_type, "color": color})
            
            # Update watch_list_items
            for color, entity_type in FLAG_COLOR_TO_ENTITY_TYPE.items():
                conn.execute(text("""
                    UPDATE watch_list_items 
                    SET flag_entity_type = :entity_type 
                    WHERE flag_color = :color AND flag_entity_type IS NULL
                """), {"entity_type": entity_type, "color": color})
            
            conn.commit()
        
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
    success = add_flag_entity_type_columns()
    sys.exit(0 if success else 1)

