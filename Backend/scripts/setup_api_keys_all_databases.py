#!/usr/bin/env python3
"""
Setup API Keys for All Users in All Databases
==============================================
Sets up Gemini and Perplexity API keys for all users in all three databases:
1. TikTrack-db-development
2. TikTrack-db-production
3. TikTrack-db-cleanup-test

Usage:
    python3 Backend/scripts/setup_api_keys_all_databases.py \
        --gemini-key "YOUR_GEMINI_API_KEY" \
        --perplexity-key "YOUR_PERPLEXITY_API_KEY"
    
Or with environment variables:
    export GEMINI_API_KEY="your_key"
    export PERPLEXITY_API_KEY="your_key"
    python3 Backend/scripts/setup_api_keys_all_databases.py
"""

import sys
import os
import argparse
import logging
from pathlib import Path
from typing import Dict, Any, Optional

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from models.ai_analysis import UserLLMProvider
from models.user import User
from services.api_key_encryption_service import APIKeyEncryptionService

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# Database configurations
DATABASES = [
    {
        'name': 'TikTrack-db-development',
        'url': 'postgresql+psycopg2://TikTrakDBAdmin:BigMeZoo1974!?@localhost:5432/TikTrack-db-development'
    },
    {
        'name': 'TikTrack-db-production',
        'url': 'postgresql+psycopg2://TikTrakDBAdmin:BigMeZoo1974!?@localhost:5432/TikTrack-db-production'
    },
    {
        'name': 'TikTrack-db-cleanup-test',
        'url': 'postgresql+psycopg2://TikTrakDBAdmin:BigMeZoo1974!?@localhost:5432/TikTrack-db-cleanup-test'
    }
]


def setup_api_keys_for_user(
    session: Session,
    user_id: int,
    username: str,
    gemini_key: Optional[str] = None,
    perplexity_key: Optional[str] = None,
    encryption_service: APIKeyEncryptionService = None
) -> Dict[str, Any]:
    """
    Setup API keys for a single user
    
    Args:
        session: Database session
        user_id: User ID
        username: Username (for logging)
        gemini_key: Gemini API key (optional)
        perplexity_key: Perplexity API key (optional)
        encryption_service: Encryption service instance
        
    Returns:
        Dict with setup results
    """
    if not encryption_service:
        encryption_service = APIKeyEncryptionService()
    
    # Get or create LLM provider settings
    provider = session.query(UserLLMProvider).filter(
        UserLLMProvider.user_id == user_id
    ).first()
    
    if not provider:
        provider = UserLLMProvider(
            user_id=user_id,
            default_provider='gemini'
        )
        session.add(provider)
        logger.info(f"  Created new LLM provider settings for user_id={user_id} ({username})")
    else:
        logger.info(f"  Found existing LLM provider settings for user_id={user_id} ({username})")
    
    keys_set = []
    
    # Set Gemini key if provided
    if gemini_key:
        encrypted_gemini = encryption_service.encrypt_api_key(gemini_key)
        provider.gemini_api_key = encrypted_gemini
        provider.gemini_api_key_encrypted = True
        keys_set.append('Gemini')
        logger.info(f"    ✅ Set Gemini API key for user_id={user_id}")
    
    # Set Perplexity key if provided
    if perplexity_key:
        encrypted_perplexity = encryption_service.encrypt_api_key(perplexity_key)
        provider.perplexity_api_key = encrypted_perplexity
        provider.perplexity_api_key_encrypted = True
        keys_set.append('Perplexity')
        logger.info(f"    ✅ Set Perplexity API key for user_id={user_id}")
    
    # Set default provider if Gemini is available
    if gemini_key and not provider.default_provider:
        provider.default_provider = 'gemini'
    
    return {
        'user_id': user_id,
        'username': username,
        'keys_set': keys_set,
        'success': True
    }


def setup_api_keys_for_database(
    db_config: Dict[str, str],
    gemini_key: Optional[str] = None,
    perplexity_key: Optional[str] = None
) -> Dict[str, Any]:
    """
    Setup API keys for all users in a database
    
    Args:
        db_config: Database configuration dict with 'name' and 'url'
        gemini_key: Gemini API key (optional)
        perplexity_key: Perplexity API key (optional)
        
    Returns:
        Dict with setup results
    """
    logger.info(f"\n{'='*70}")
    logger.info(f"Database: {db_config['name']}")
    logger.info(f"{'='*70}")
    
    results = {
        'database': db_config['name'],
        'users_processed': 0,
        'users_skipped': 0,
        'errors': []
    }
    
    try:
        engine = create_engine(db_config['url'])
        Session = sessionmaker(bind=engine)
        session = Session()
        
        # Get all users
        users = session.query(User).all()
        logger.info(f"\nFound {len(users)} users in database")
        
        if not users:
            logger.warning(f"  ⚠️  No users found in database {db_config['name']}")
            session.close()
            return results
        
        # Initialize encryption service once per database
        encryption_service = APIKeyEncryptionService()
        
        # Process each user
        for user in users:
            try:
                setup_api_keys_for_user(
                    session=session,
                    user_id=user.id,
                    username=user.username,
                    gemini_key=gemini_key,
                    perplexity_key=perplexity_key,
                    encryption_service=encryption_service
                )
                results['users_processed'] += 1
            except Exception as e:
                logger.error(f"  ❌ Error setting up keys for user_id={user.id} ({user.username}): {e}")
                results['errors'].append({
                    'user_id': user.id,
                    'username': user.username,
                    'error': str(e)
                })
                results['users_skipped'] += 1
        
        # Commit changes
        session.commit()
        logger.info(f"\n✅ Successfully processed {results['users_processed']} users in {db_config['name']}")
        
        session.close()
        
    except Exception as e:
        logger.error(f"❌ Error connecting to database {db_config['name']}: {e}")
        results['errors'].append({
            'database': db_config['name'],
            'error': str(e)
        })
    
    return results


def main():
    parser = argparse.ArgumentParser(
        description='Setup API keys for all users in all databases'
    )
    parser.add_argument(
        '--gemini-key',
        type=str,
        help='Gemini API key (or set GEMINI_API_KEY env var)'
    )
    parser.add_argument(
        '--perplexity-key',
        type=str,
        help='Perplexity API key (or set PERPLEXITY_API_KEY env var)'
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Show what would be done without making changes'
    )
    
    args = parser.parse_args()
    
    # Get API keys from args or environment
    gemini_key = args.gemini_key or os.getenv('GEMINI_API_KEY')
    perplexity_key = args.perplexity_key or os.getenv('PERPLEXITY_API_KEY')
    
    # Validate that at least one key is provided
    if not gemini_key and not perplexity_key:
        logger.error("❌ No API keys provided!")
        logger.info("Please provide API keys using:")
        logger.info("  --gemini-key KEY or GEMINI_API_KEY env var")
        logger.info("  --perplexity-key KEY or PERPLEXITY_API_KEY env var")
        sys.exit(1)
    
    if args.dry_run:
        logger.info("="*70)
        logger.info("DRY RUN MODE - No changes will be made")
        logger.info("="*70)
        logger.info(f"Gemini key: {'Provided' if gemini_key else 'Not provided'}")
        logger.info(f"Perplexity key: {'Provided' if perplexity_key else 'Not provided'}")
        logger.info(f"\nWould process {len(DATABASES)} databases:")
        for db in DATABASES:
            logger.info(f"  - {db['name']}")
        return
    
    logger.info("="*70)
    logger.info("Setting up API keys for all users in all databases")
    logger.info("="*70)
    logger.info(f"Gemini key: {'Provided' if gemini_key else 'Not provided'}")
    logger.info(f"Perplexity key: {'Provided' if perplexity_key else 'Not provided'}")
    
    all_results = []
    
    # Process each database
    for db_config in DATABASES:
        results = setup_api_keys_for_database(
            db_config=db_config,
            gemini_key=gemini_key,
            perplexity_key=perplexity_key
        )
        all_results.append(results)
    
    # Summary
    logger.info("\n" + "="*70)
    logger.info("SUMMARY")
    logger.info("="*70)
    
    total_users = sum(r['users_processed'] for r in all_results)
    total_errors = sum(len(r['errors']) for r in all_results)
    
    for result in all_results:
        logger.info(f"\n{result['database']}:")
        logger.info(f"  ✅ Users processed: {result['users_processed']}")
        if result['users_skipped'] > 0:
            logger.info(f"  ⚠️  Users skipped: {result['users_skipped']}")
        if result['errors']:
            logger.info(f"  ❌ Errors: {len(result['errors'])}")
            for error in result['errors']:
                logger.error(f"    - {error}")
    
    logger.info(f"\n{'='*70}")
    logger.info(f"Total: {total_users} users processed across {len(DATABASES)} databases")
    if total_errors > 0:
        logger.warning(f"⚠️  {total_errors} errors occurred")
    else:
        logger.info("✅ All operations completed successfully!")
    logger.info("="*70)


if __name__ == '__main__':
    main()

