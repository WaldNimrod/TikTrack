#!/usr/bin/env python3
"""
Script to fix ticker statuses based on linked trades and trade plans
This script ensures all ticker statuses are consistent with their linked items
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from config.database import get_db
from models.ticker import Ticker
from models.trade import Trade
from models.trade_plan import TradePlan
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def fix_all_ticker_statuses():
    """
    Fix all ticker statuses to be consistent with their linked items
    """
    db: Session = next(get_db())
    
    try:
        logger.info("Starting ticker status fix process...")
        
        # Get all tickers
        tickers = db.query(Ticker).all()
        logger.info(f"Found {len(tickers)} tickers to process")
        
        fixed_count = 0
        
        for ticker in tickers:
            logger.info(f"Processing ticker {ticker.id} ({ticker.symbol}) - current status: {ticker.status}")
            
            # Skip cancelled tickers (manual status)
            if ticker.status == 'cancelled':
                logger.info(f"Ticker {ticker.symbol} is cancelled - skipping")
                continue
            
            # Count open trades for this ticker
            open_trades_count = db.query(Trade).filter(
                Trade.ticker_id == ticker.id,
                Trade.status == 'open'
            ).count()
            
            # Count open trade plans for this ticker
            open_plans_count = db.query(TradePlan).filter(
                TradePlan.ticker_id == ticker.id,
                TradePlan.status == 'open'
            ).count()
            
            # Determine correct status
            has_open_items = open_trades_count > 0 or open_plans_count > 0
            correct_status = 'open' if has_open_items else 'closed'
            
            # Update active_trades field
            ticker.active_trades = open_trades_count > 0
            
            # Update status if needed
            if ticker.status != correct_status:
                old_status = ticker.status
                ticker.status = correct_status
                ticker.updated_at = datetime.now()
                fixed_count += 1
                logger.info(f"Fixed ticker {ticker.symbol}: {old_status} -> {correct_status}")
            else:
                logger.info(f"Ticker {ticker.symbol} status is correct: {ticker.status}")
        
        # Commit all changes
        db.commit()
        logger.info(f"Fixed {fixed_count} ticker statuses out of {len(tickers)} total tickers")
        
        return fixed_count
        
    except Exception as e:
        logger.error(f"Error fixing ticker statuses: {e}")
        db.rollback()
        raise
    finally:
        db.close()

def verify_ticker_statuses():
    """
    Verify that all ticker statuses are correct
    """
    db: Session = next(get_db())
    
    try:
        logger.info("Verifying ticker statuses...")
        
        # Get all tickers
        tickers = db.query(Ticker).all()
        incorrect_count = 0
        
        for ticker in tickers:
            # Skip cancelled tickers
            if ticker.status == 'cancelled':
                continue
            
            # Count open trades and plans
            open_trades_count = db.query(Trade).filter(
                Trade.ticker_id == ticker.id,
                Trade.status == 'open'
            ).count()
            
            open_plans_count = db.query(TradePlan).filter(
                TradePlan.ticker_id == ticker.id,
                TradePlan.status == 'open'
            ).count()
            
            # Determine correct status
            has_open_items = open_trades_count > 0 or open_plans_count > 0
            correct_status = 'open' if has_open_items else 'closed'
            
            if ticker.status != correct_status:
                incorrect_count += 1
                logger.warning(f"Ticker {ticker.symbol} has incorrect status: {ticker.status} (should be {correct_status})")
        
        if incorrect_count == 0:
            logger.info("All ticker statuses are correct!")
        else:
            logger.warning(f"Found {incorrect_count} tickers with incorrect statuses")
        
        return incorrect_count
        
    except Exception as e:
        logger.error(f"Error verifying ticker statuses: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    import argparse
    from datetime import datetime
    
    parser = argparse.ArgumentParser(description="Fix ticker statuses")
    parser.add_argument("--verify-only", action="store_true", help="Only verify statuses, don't fix")
    parser.add_argument("--fix", action="store_true", help="Fix incorrect statuses")
    
    args = parser.parse_args()
    
    if args.verify_only:
        verify_ticker_statuses()
    elif args.fix:
        fixed_count = fix_all_ticker_statuses()
        print(f"Fixed {fixed_count} ticker statuses")
    else:
        # Default: verify first, then fix if needed
        incorrect_count = verify_ticker_statuses()
        if incorrect_count > 0:
            print(f"Found {incorrect_count} incorrect statuses. Running fix...")
            fixed_count = fix_all_ticker_statuses()
            print(f"Fixed {fixed_count} ticker statuses")
        else:
            print("All statuses are correct!")
