#!/usr/bin/env python3
"""
Migration: Create Watch Lists Tables
Date: 2025-01-28
Version: 1.0.0

Creates tables for Watch Lists system:
- watch_lists
- watch_list_items
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


def table_exists(db: Session, table_name: str) -> bool:
    """Check if a table exists"""
    try:
        inspector = inspect(engine)
        return table_name in inspector.get_table_names()
    except Exception as e:
        logger.warning(f"Error checking table {table_name}: {e}")
        return False


def create_watch_lists_tables(db: Session):
    """Create Watch Lists tables"""
    
    logger.info("🚀 Starting Watch Lists tables migration...")
    
    # 1. Create watch_lists table
    if not table_exists(db, 'watch_lists'):
        logger.info("📋 Creating watch_lists table...")
        db.execute(text("""
            CREATE TABLE watch_lists (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                name VARCHAR(100) NOT NULL,
                icon VARCHAR(50),
                color_hex VARCHAR(7),
                display_order INTEGER NOT NULL DEFAULT 0,
                view_mode VARCHAR(20) NOT NULL DEFAULT 'table',
                default_sort_column VARCHAR(50),
                default_sort_direction VARCHAR(4) NOT NULL DEFAULT 'asc',
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE,
                
                CONSTRAINT fk_watch_lists_user 
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                CONSTRAINT uk_watch_lists_user_name 
                    UNIQUE (user_id, name),
                CONSTRAINT ck_watch_lists_view_mode 
                    CHECK (view_mode IN ('table', 'cards', 'compact')),
                CONSTRAINT ck_watch_lists_sort_direction 
                    CHECK (default_sort_direction IN ('asc', 'desc'))
            )
        """))
        logger.info("✅ Created watch_lists table")
    else:
        logger.info("⏭️  watch_lists table already exists")
    
    # 2. Create watch_list_items table
    if not table_exists(db, 'watch_list_items'):
        logger.info("📋 Creating watch_list_items table...")
        db.execute(text("""
            CREATE TABLE watch_list_items (
                id SERIAL PRIMARY KEY,
                watch_list_id INTEGER NOT NULL,
                ticker_id INTEGER,
                external_symbol VARCHAR(10),
                external_name VARCHAR(100),
                flag_color VARCHAR(7),
                display_order INTEGER NOT NULL DEFAULT 0,
                notes VARCHAR(500),
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE,
                
                CONSTRAINT fk_watch_list_items_list 
                    FOREIGN KEY (watch_list_id) REFERENCES watch_lists(id) ON DELETE CASCADE,
                CONSTRAINT fk_watch_list_items_ticker 
                    FOREIGN KEY (ticker_id) REFERENCES tickers(id) ON DELETE SET NULL,
                CONSTRAINT ck_watch_list_items_ticker_xor_external 
                    CHECK (
                        (ticker_id IS NOT NULL AND external_symbol IS NULL) OR
                        (ticker_id IS NULL AND external_symbol IS NOT NULL)
                    )
            )
        """))
        logger.info("✅ Created watch_list_items table")
    else:
        logger.info("⏭️  watch_list_items table already exists")
    
    # 3. Create unique constraints (partial indexes for PostgreSQL)
    logger.info("🔍 Creating unique constraints...")
    
    # Unique constraint for ticker_id per list
    try:
        db.execute(text("""
            CREATE UNIQUE INDEX IF NOT EXISTS uk_watch_list_items_list_ticker 
            ON watch_list_items(watch_list_id, ticker_id) 
            WHERE ticker_id IS NOT NULL
        """))
        logger.info("✅ Created unique constraint on (watch_list_id, ticker_id)")
    except Exception as e:
        logger.warning(f"Unique constraint may already exist: {e}")
    
    # Unique constraint for external_symbol per list
    try:
        db.execute(text("""
            CREATE UNIQUE INDEX IF NOT EXISTS uk_watch_list_items_list_external 
            ON watch_list_items(watch_list_id, external_symbol) 
            WHERE external_symbol IS NOT NULL
        """))
        logger.info("✅ Created unique constraint on (watch_list_id, external_symbol)")
    except Exception as e:
        logger.warning(f"Unique constraint may already exist: {e}")
    
    # 4. Create indexes
    logger.info("🔍 Creating indexes...")
    
    # Indexes for watch_lists
    indexes_watch_lists = [
        ("idx_watch_lists_user_id", "watch_lists(user_id)"),
        ("idx_watch_lists_user_order", "watch_lists(user_id, display_order)")
    ]
    
    for index_name, index_def in indexes_watch_lists:
        try:
            db.execute(text(f"""
                CREATE INDEX IF NOT EXISTS {index_name} 
                ON {index_def}
            """))
            logger.info(f"✅ Created index {index_name}")
        except Exception as e:
            logger.warning(f"Index {index_name} may already exist: {e}")
    
    # Indexes for watch_list_items
    indexes_items = [
        ("idx_watch_list_items_list_id", "watch_list_items(watch_list_id)"),
        ("idx_watch_list_items_ticker_id", "watch_list_items(ticker_id)"),
        ("idx_watch_list_items_external_symbol", "watch_list_items(external_symbol)"),
        ("idx_watch_list_items_flag_color", "watch_list_items(flag_color)"),
        ("idx_watch_list_items_list_order", "watch_list_items(watch_list_id, display_order)")
    ]
    
    for index_name, index_def in indexes_items:
        try:
            db.execute(text(f"""
                CREATE INDEX IF NOT EXISTS {index_name} 
                ON {index_def}
            """))
            logger.info(f"✅ Created index {index_name}")
        except Exception as e:
            logger.warning(f"Index {index_name} may already exist: {e}")
    
    # Commit changes
    db.commit()
    logger.info("✅ Watch Lists tables migration completed successfully!")


def main():
    """Run migration"""
    db: Session = SessionLocal()
    
    try:
        create_watch_lists_tables(db)
        logger.info("🎉 Migration completed successfully!")
    except Exception as e:
        logger.error(f"❌ Migration failed: {e}", exc_info=True)
        db.rollback()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
















