#!/usr/bin/env python3
"""
Create Password Reset Tokens Table Migration
יצירת טבלת password_reset_tokens

This script creates the password_reset_tokens table in the database.

Author: TikTrack Development Team
Version: 1.0.0
Last Updated: January 28, 2025
"""

import sys
import os
from pathlib import Path

# Add Backend to path
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

from sqlalchemy import text, inspect
from config.database import get_db, engine
from models.password_reset_token import PasswordResetToken
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def create_password_reset_table():
    """Create password_reset_tokens table if it doesn't exist"""
    logger.info("=" * 70)
    logger.info("Creating password_reset_tokens table")
    logger.info("=" * 70)
    
    db = None
    try:
        db = next(get_db())
        
        # Check if table already exists
        inspector = inspect(engine)
        existing_tables = inspector.get_table_names()
        
        if 'password_reset_tokens' in existing_tables:
            logger.info("✅ Table password_reset_tokens already exists")
            return True
        
        # Create table using SQLAlchemy
        logger.info("Creating password_reset_tokens table...")
        PasswordResetToken.__table__.create(engine, checkfirst=True)
        
        logger.info("✅ Table password_reset_tokens created successfully")
        return True
        
    except Exception as e:
        logger.error(f"❌ Error creating password_reset_tokens table: {e}")
        import traceback
        logger.error(traceback.format_exc())
        if db:
            db.rollback()
        return False
    finally:
        if db:
            db.close()


if __name__ == "__main__":
    success = create_password_reset_table()
    sys.exit(0 if success else 1)

