#!/usr/bin/env python3
"""
Cleanup Orphaned Tag Links - TikTrack
======================================

This script identifies and optionally removes tag links that reference
entity records that no longer exist in the database.

Uses TagService.cleanup_orphaned_tag_links() for centralized cleanup logic.

Author: TikTrack Development Team
Created: November 2025
Updated: January 2025 - Now uses TagService for cleanup
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy.orm import Session
from config.database import get_db
from services.tag_service import TagService
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def main():
    """Main function to run the cleanup."""
    import argparse
    
    parser = argparse.ArgumentParser(description='Cleanup orphaned tag links')
    parser.add_argument(
        '--entity-type',
        type=str,
        help='Filter by entity type (e.g., cash_flow)',
        default=None
    )
    parser.add_argument(
        '--remove',
        action='store_true',
        help='Actually remove orphaned links (default is dry-run)'
    )
    parser.add_argument(
        '--schedule',
        action='store_true',
        help='Run as scheduled task (for cron)'
    )
    parser.add_argument(
        '--verbose',
        action='store_true',
        help='Enable verbose logging'
    )
    
    args = parser.parse_args()
    
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    db: Session = next(get_db())
    
    try:
        # Use TagService to find and optionally remove orphaned links
        logger.info("Scanning for orphaned tag links...")
        
        if args.remove:
            logger.info("🗑️  Removing orphaned tag links...")
            results = TagService.cleanup_orphaned_tag_links(db, args.entity_type)
            
            if not results:
                logger.info("✅ No orphaned tag links found!")
                return 0
            
            # Commit changes
            db.commit()
            
            # Report results
            total_removed = sum(results.values())
            logger.info(f"\n✅ Successfully removed {total_removed} orphaned tag links:")
            for entity_type, count in results.items():
                logger.info(f"  - {entity_type}: {count} links")
        else:
            # Dry run: Use TagService but don't commit
            logger.info("🔍 DRY RUN: Scanning for orphaned tag links...")
            
            # We need to check what would be cleaned up without actually cleaning
            # TagService.cleanup_orphaned_tag_links() will actually remove them
            # So for dry run, we'll call it but rollback
            results = TagService.cleanup_orphaned_tag_links(db, args.entity_type)
            db.rollback()  # Rollback to prevent actual deletion
            
            if not results:
                logger.info("✅ No orphaned tag links found!")
                return 0
            
            # Report findings
            total_found = sum(results.values())
            logger.info(f"\n📊 Found {total_found} orphaned tag links (dry run):")
            for entity_type, count in results.items():
                logger.info(f"  - {entity_type}: {count} links")
            
            logger.info("\n💡 This was a dry run. Use --remove to actually delete orphaned links.")
            logger.info("   Example: python3 cleanup_orphaned_tag_links.py --remove --entity-type cash_flow")
        
        return 0
        
    except Exception as e:
        logger.error(f"❌ Error during cleanup: {e}", exc_info=True)
        db.rollback()
        return 1
    finally:
        db.close()


if __name__ == '__main__':
    sys.exit(main())

