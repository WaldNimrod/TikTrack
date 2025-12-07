#!/usr/bin/env python3
"""
Copy API keys from one user to another
Usage: python3 copy_api_keys_between_users.py --from-user nimrod --to-user admin
"""

import sys
import os
import argparse
import logging
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import create_engine, select, text
from sqlalchemy.orm import sessionmaker
from models.ai_analysis import UserLLMProvider
from models.user import User
from config.settings import DATABASE_URL

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def get_user_id_by_username(session, username: str) -> int:
    """Get user ID by username"""
    user = session.scalars(select(User).where(User.username == username)).first()
    if not user:
        raise ValueError(f"User '{username}' not found")
    return user.id


def copy_api_keys(from_username: str, to_username: str):
    """Copy API keys from one user to another"""
    logger.info("=" * 70)
    logger.info(f"Copying API keys from '{from_username}' to '{to_username}'")
    logger.info("=" * 70)
    
    # Validate DATABASE_URL (type checker safety + runtime check)
    if not DATABASE_URL:
        raise ValueError(
            "DATABASE_URL is not configured. "
            "Please set PostgreSQL environment variables or use start_server.sh which sets them automatically."
        )
    
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    session = Session()
    
    try:
        # Get user IDs
        from_user_id = get_user_id_by_username(session, from_username)
        to_user_id = get_user_id_by_username(session, to_username)
        
        logger.info(f"From user ID: {from_user_id} ({from_username})")
        logger.info(f"To user ID: {to_user_id} ({to_username})")
        
        # Get source user's LLM provider settings
        from_provider = session.scalars(
            select(UserLLMProvider).where(UserLLMProvider.user_id == from_user_id)
        ).first()
        
        if not from_provider:
            logger.warning(f"⚠️  No LLM provider settings found for user '{from_username}'")
            logger.info("Nothing to copy.")
            return
        
        logger.info(f"\n📋 Source user settings:")
        logger.info(f"  - Default provider: {from_provider.default_provider}")
        logger.info(f"  - Gemini configured: {from_provider.gemini_api_key is not None}")
        logger.info(f"  - Perplexity configured: {from_provider.perplexity_api_key is not None}")
        
        # Get or create target user's LLM provider settings
        to_provider = session.scalars(
            select(UserLLMProvider).where(UserLLMProvider.user_id == to_user_id)
        ).first()
        
        if not to_provider:
            logger.info(f"\n📝 Creating new LLM provider settings for user '{to_username}'")
            to_provider = UserLLMProvider(
                user_id=to_user_id,
                default_provider=from_provider.default_provider,
                gemini_api_key=None,
                perplexity_api_key=None,
                gemini_api_key_encrypted=from_provider.gemini_api_key_encrypted,
                perplexity_api_key_encrypted=from_provider.perplexity_api_key_encrypted
            )
            session.add(to_provider)
        else:
            logger.info(f"\n📝 Updating existing LLM provider settings for user '{to_username}'")
            to_provider.default_provider = from_provider.default_provider
            to_provider.gemini_api_key_encrypted = from_provider.gemini_api_key_encrypted
            to_provider.perplexity_api_key_encrypted = from_provider.perplexity_api_key_encrypted
        
        # Copy API keys (they are already encrypted, so we can copy them directly)
        keys_copied = []
        
        if from_provider.gemini_api_key is not None:
            to_provider.gemini_api_key = from_provider.gemini_api_key
            keys_copied.append("Gemini")
            logger.info("  ✅ Copied Gemini API key")
        else:
            logger.info("  ⏭️  No Gemini API key to copy")
        
        if from_provider.perplexity_api_key is not None:
            to_provider.perplexity_api_key = from_provider.perplexity_api_key
            keys_copied.append("Perplexity")
            logger.info("  ✅ Copied Perplexity API key")
        else:
            logger.info("  ⏭️  No Perplexity API key to copy")
        
        # Commit changes
        session.commit()
        
        logger.info("\n" + "=" * 70)
        logger.info("✅ Successfully copied API keys!")
        logger.info(f"   Copied keys: {', '.join(keys_copied) if keys_copied else 'None'}")
        logger.info(f"   Default provider: {to_provider.default_provider}")
        logger.info("=" * 70)
        
    except Exception as e:
        session.rollback()
        logger.error(f"❌ Error copying API keys: {e}", exc_info=True)
        raise
    finally:
        session.close()


def main():
    parser = argparse.ArgumentParser(description='Copy API keys between users')
    parser.add_argument('--from-user', required=True, help='Source username')
    parser.add_argument('--to-user', required=True, help='Target username')
    
    args = parser.parse_args()
    
    try:
        copy_api_keys(args.from_user, args.to_user)
    except Exception as e:
        logger.error(f"Failed to copy API keys: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()

