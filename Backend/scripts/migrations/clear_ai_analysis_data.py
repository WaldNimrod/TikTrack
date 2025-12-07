#!/usr/bin/env python3
"""
Migration Script: Clear AI Analysis Data
==========================================

This script deletes all AI Analysis data that is not associated with valid users.
According to the integration plan, existing data should be deleted (user decision).

Usage:
    python3 Backend/scripts/migrations/clear_ai_analysis_data.py

Safety:
    - Logs all operations
    - Shows count before deletion
    - Asks for confirmation before deletion
    - Can be run with --dry-run to see what would be deleted
"""

import sys
import os
import logging
from datetime import datetime

# Add project root to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from config.database import get_db
from models.ai_analysis import AIAnalysisRequest, UserLLMProvider
from models.user import User

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def get_valid_user_ids(db):
    """Get list of valid user IDs from users table"""
    users = db.query(User).all()
    user_ids = [user.id for user in users]
    logger.info(f"Found {len(user_ids)} valid users: {user_ids}")
    return set(user_ids)


def clear_ai_analysis_data(dry_run=False):
    """
    Clear all AI Analysis data
    
    Args:
        dry_run: If True, only show what would be deleted without actually deleting
    """
    db = next(get_db())
    
    try:
        logger.info("=" * 60)
        logger.info("AI Analysis Data Cleanup Script")
        logger.info("=" * 60)
        
        if dry_run:
            logger.info("🔍 DRY RUN MODE - No data will be deleted")
        else:
            logger.warning("⚠️  LIVE MODE - Data will be permanently deleted")
        
        # Get valid user IDs
        valid_user_ids = get_valid_user_ids(db)
        
        if not valid_user_ids:
            logger.error("❌ No valid users found in database. Aborting.")
            return
        
        # Count AI Analysis Requests
        total_requests = db.query(AIAnalysisRequest).count()
        logger.info(f"\n📊 AI Analysis Requests: {total_requests} total")
        
        if total_requests > 0:
            # Count by user_id
            requests_by_user = {}
            all_requests = db.query(AIAnalysisRequest).all()
            for req in all_requests:
                user_id = req.user_id
                if user_id not in requests_by_user:
                    requests_by_user[user_id] = 0
                requests_by_user[user_id] += 1
            
            logger.info(f"   Distribution by user_id:")
            for user_id, count in sorted(requests_by_user.items()):
                status = "✅ Valid" if user_id in valid_user_ids else "❌ Invalid"
                logger.info(f"   - user_id={user_id}: {count} requests ({status})")
        
        # Count User LLM Providers
        total_providers = db.query(UserLLMProvider).count()
        logger.info(f"\n📊 User LLM Providers: {total_providers} total")
        
        if total_providers > 0:
            # Count by user_id
            providers_by_user = {}
            all_providers = db.query(UserLLMProvider).all()
            for provider in all_providers:
                user_id = provider.user_id
                if user_id not in providers_by_user:
                    providers_by_user[user_id] = 0
                providers_by_user[user_id] += 1
            
            logger.info(f"   Distribution by user_id:")
            for user_id, count in sorted(providers_by_user.items()):
                status = "✅ Valid" if user_id in valid_user_ids else "❌ Invalid"
                logger.info(f"   - user_id={user_id}: {count} providers ({status})")
        
        # Delete AI Analysis Requests
        if total_requests > 0:
            logger.info(f"\n🗑️  Deleting {total_requests} AI Analysis Requests...")
            if not dry_run:
                deleted_requests = db.query(AIAnalysisRequest).delete(synchronize_session=False)
                db.commit()
                logger.info(f"✅ Deleted {deleted_requests} AI Analysis Requests")
            else:
                logger.info(f"   [DRY RUN] Would delete {total_requests} AI Analysis Requests")
        
        # Delete User LLM Providers
        if total_providers > 0:
            logger.info(f"\n🗑️  Deleting {total_providers} User LLM Providers...")
            if not dry_run:
                deleted_providers = db.query(UserLLMProvider).delete(synchronize_session=False)
                db.commit()
                logger.info(f"✅ Deleted {deleted_providers} User LLM Providers")
            else:
                logger.info(f"   [DRY RUN] Would delete {total_providers} User LLM Providers")
        
        if total_requests == 0 and total_providers == 0:
            logger.info("\n✅ No data to delete - tables are already empty")
        
        logger.info("\n" + "=" * 60)
        logger.info("✅ Cleanup completed successfully")
        logger.info("=" * 60)
        
    except Exception as e:
        logger.error(f"❌ Error during cleanup: {e}", exc_info=True)
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Clear AI Analysis data')
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Show what would be deleted without actually deleting'
    )
    parser.add_argument(
        '--confirm',
        action='store_true',
        help='Skip confirmation prompt (use with caution)'
    )
    
    args = parser.parse_args()
    
    if not args.dry_run and not args.confirm:
        print("\n⚠️  WARNING: This will permanently delete all AI Analysis data!")
        print("   - All AI Analysis Requests will be deleted")
        print("   - All User LLM Provider settings will be deleted")
        print("\n   This action cannot be undone!")
        response = input("\n   Type 'DELETE' to confirm: ")
        if response != 'DELETE':
            print("\n❌ Deletion cancelled.")
            sys.exit(0)
    
    clear_ai_analysis_data(dry_run=args.dry_run)


