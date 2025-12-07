#!/usr/bin/env python3
"""
Migration: Create AI Analysis Tables
Date: 2025-01-28
Version: 1.0.0

Creates tables for AI Analysis system:
- ai_prompt_templates
- ai_analysis_requests
- user_llm_providers
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


def create_ai_analysis_tables(db: Session):
    """Create AI Analysis tables"""
    
    logger.info("🚀 Starting AI Analysis tables migration...")
    
    # 1. Create ai_prompt_templates table
    if not table_exists(db, 'ai_prompt_templates'):
        logger.info("📋 Creating ai_prompt_templates table...")
        db.execute(text("""
            CREATE TABLE ai_prompt_templates (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE,
                name_he VARCHAR(100) NOT NULL,
                description TEXT,
                prompt_text TEXT NOT NULL,
                variables_json TEXT NOT NULL,
                is_active BOOLEAN DEFAULT TRUE NOT NULL,
                sort_order INTEGER DEFAULT 0 NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
            )
        """))
        logger.info("✅ Created ai_prompt_templates table")
    else:
        logger.info("⏭️  ai_prompt_templates table already exists")
    
    # 2. Create ai_analysis_requests table
    if not table_exists(db, 'ai_analysis_requests'):
        logger.info("📋 Creating ai_analysis_requests table...")
        db.execute(text("""
            CREATE TABLE ai_analysis_requests (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                template_id INTEGER NOT NULL,
                provider VARCHAR(50) NOT NULL,
                variables_json TEXT NOT NULL,
                prompt_text TEXT NOT NULL,
                response_text TEXT,
                response_json TEXT,
                status VARCHAR(20) DEFAULT 'pending' NOT NULL,
                error_message TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (template_id) REFERENCES ai_prompt_templates(id)
            )
        """))
        logger.info("✅ Created ai_analysis_requests table")
    else:
        logger.info("⏭️  ai_analysis_requests table already exists")
    
    # 3. Create user_llm_providers table
    if not table_exists(db, 'user_llm_providers'):
        logger.info("📋 Creating user_llm_providers table...")
        db.execute(text("""
            CREATE TABLE user_llm_providers (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL UNIQUE,
                default_provider VARCHAR(50) DEFAULT 'gemini' NOT NULL,
                gemini_api_key VARCHAR(500),
                perplexity_api_key VARCHAR(500),
                gemini_api_key_encrypted BOOLEAN DEFAULT TRUE NOT NULL,
                perplexity_api_key_encrypted BOOLEAN DEFAULT TRUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """))
        logger.info("✅ Created user_llm_providers table")
    else:
        logger.info("⏭️  user_llm_providers table already exists")
    
    # 4. Create indexes
    logger.info("🔍 Creating indexes...")
    
    # Index for ai_analysis_requests
    try:
        db.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_ai_analysis_requests_user_id 
            ON ai_analysis_requests(user_id)
        """))
        logger.info("✅ Created index on ai_analysis_requests.user_id")
    except Exception as e:
        logger.warning(f"Index may already exist: {e}")
    
    try:
        db.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_ai_analysis_requests_template_id 
            ON ai_analysis_requests(template_id)
        """))
        logger.info("✅ Created index on ai_analysis_requests.template_id")
    except Exception as e:
        logger.warning(f"Index may already exist: {e}")
    
    try:
        db.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_ai_analysis_requests_status 
            ON ai_analysis_requests(status)
        """))
        logger.info("✅ Created index on ai_analysis_requests.status")
    except Exception as e:
        logger.warning(f"Index may already exist: {e}")
    
    try:
        db.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_ai_analysis_requests_created_at 
            ON ai_analysis_requests(created_at DESC)
        """))
        logger.info("✅ Created index on ai_analysis_requests.created_at")
    except Exception as e:
        logger.warning(f"Index may already exist: {e}")
    
    # Index for user_llm_providers
    try:
        db.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_user_llm_providers_user_id 
            ON user_llm_providers(user_id)
        """))
        logger.info("✅ Created index on user_llm_providers.user_id")
    except Exception as e:
        logger.warning(f"Index may already exist: {e}")
    
    # Index for ai_prompt_templates
    try:
        db.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_ai_prompt_templates_is_active 
            ON ai_prompt_templates(is_active, sort_order)
        """))
        logger.info("✅ Created index on ai_prompt_templates.is_active")
    except Exception as e:
        logger.warning(f"Index may already exist: {e}")
    
    # Commit changes
    db.commit()
    logger.info("✅ AI Analysis tables migration completed successfully!")


def main():
    """Run migration"""
    db: Session = SessionLocal()
    
    try:
        create_ai_analysis_tables(db)
        logger.info("🎉 Migration completed successfully!")
    except Exception as e:
        logger.error(f"❌ Migration failed: {e}", exc_info=True)
        db.rollback()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
















