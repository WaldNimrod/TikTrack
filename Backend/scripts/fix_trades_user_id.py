#!/usr/bin/env python3
"""
Fix Trades User ID Migration Script
====================================

This script fixes existing trades in the database that have user_id = NULL.
It assigns them to the default user (admin or user_id=1).

Usage:
    python3 Backend/scripts/fix_trades_user_id.py

Author: TikTrack Development Team
Date: 2025-12-07
"""

import sys
import os
from pathlib import Path

# Add Backend to path
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

# Set environment variables for PostgreSQL (same as start_server.sh)
workspace_name = Path.cwd().name
if 'Production' in workspace_name:
    # Production environment
    os.environ.setdefault('POSTGRES_HOST', 'localhost')
    os.environ.setdefault('POSTGRES_DB', 'TikTrack-db-production')
    os.environ.setdefault('POSTGRES_USER', 'TikTrakDBAdmin')
    os.environ.setdefault('POSTGRES_PASSWORD', 'BigMeZoo1974!?')
else:
    # Development environment
    os.environ.setdefault('POSTGRES_HOST', 'localhost')
    os.environ.setdefault('POSTGRES_DB', 'TikTrack-db-development')
    os.environ.setdefault('POSTGRES_USER', 'TikTrakDBAdmin')
    os.environ.setdefault('POSTGRES_PASSWORD', 'BigMeZoo1974!?')

from app import create_app
from models.trade import Trade
from services.user_service import UserService
from sqlalchemy.orm import Session
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def fix_trades_user_id():
    """
    Fix trades with NULL user_id by assigning them to default user.
    
    Returns:
        dict: Summary of fixes applied
    """
    app = create_app()
    
    with app.app_context():
        from config.database import get_db
        db: Session = next(get_db())
        
        try:
            # Get default user
            user_service = UserService()
            default_user = user_service.get_default_user()
            
            if not default_user:
                logger.error("No default user found. Cannot fix trades.")
                return {
                    'success': False,
                    'error': 'No default user found',
                    'fixed_count': 0
                }
            
            default_user_id = default_user['id']
            logger.info(f"Using default user_id: {default_user_id} (username: {default_user.get('username', 'N/A')})")
            
            # Find all trades with NULL user_id
            trades_without_user = db.query(Trade).filter(
                Trade.user_id.is_(None)
            ).all()
            
            total_count = len(trades_without_user)
            logger.info(f"Found {total_count} trades with NULL user_id")
            
            if total_count == 0:
                logger.info("No trades to fix. All trades have user_id assigned.")
                return {
                    'success': True,
                    'fixed_count': 0,
                    'message': 'No trades to fix'
                }
            
            # Fix each trade
            fixed_count = 0
            failed_count = 0
            fixed_trade_ids = []
            
            for trade in trades_without_user:
                try:
                    old_user_id = trade.user_id
                    trade.user_id = default_user_id
                    db.add(trade)
                    
                    fixed_trade_ids.append(trade.id)
                    fixed_count += 1
                    
                    logger.info(f"Fixed trade {trade.id}: user_id = {old_user_id} -> {default_user_id}")
                    
                except Exception as e:
                    logger.error(f"Failed to fix trade {trade.id}: {str(e)}")
                    failed_count += 1
            
            # Commit all changes
            if fixed_count > 0:
                db.commit()
                logger.info(f"✅ Successfully fixed {fixed_count} trades")
                logger.info(f"❌ Failed to fix {failed_count} trades")
                logger.info(f"Fixed trade IDs: {fixed_trade_ids[:10]}{'...' if len(fixed_trade_ids) > 10 else ''}")
            else:
                logger.warning("No trades were fixed")
            
            # Verify fix
            remaining_null = db.query(Trade).filter(
                Trade.user_id.is_(None)
            ).count()
            
            if remaining_null > 0:
                logger.warning(f"⚠️ Warning: {remaining_null} trades still have NULL user_id")
            else:
                logger.info("✅ Verification passed: All trades now have user_id assigned")
            
            return {
                'success': True,
                'fixed_count': fixed_count,
                'failed_count': failed_count,
                'remaining_null': remaining_null,
                'default_user_id': default_user_id,
                'fixed_trade_ids': fixed_trade_ids
            }
            
        except Exception as e:
            logger.error(f"Error fixing trades: {str(e)}", exc_info=True)
            db.rollback()
            return {
                'success': False,
                'error': str(e),
                'fixed_count': 0
            }
        finally:
            db.close()


if __name__ == '__main__':
    logger.info("=" * 60)
    logger.info("Starting Trade User ID Fix Migration")
    logger.info("=" * 60)
    
    result = fix_trades_user_id()
    
    logger.info("=" * 60)
    logger.info("Migration Summary:")
    logger.info(f"  Success: {result.get('success', False)}")
    logger.info(f"  Fixed: {result.get('fixed_count', 0)} trades")
    logger.info(f"  Failed: {result.get('failed_count', 0)} trades")
    logger.info(f"  Remaining NULL: {result.get('remaining_null', 0)} trades")
    logger.info("=" * 60)
    
    if not result.get('success', False):
        sys.exit(1)

