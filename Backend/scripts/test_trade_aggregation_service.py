#!/usr/bin/env python3
"""
Test script for Trade Aggregation Service
Tests the new trade aggregation system
"""

import os
import sys
from pathlib import Path

# Add Backend directory to path
backend_path = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_path))

from sqlalchemy.orm import Session
from config.database import SessionLocal
from services.trade_aggregation_service import TradeAggregationService
from models.trade import Trade
from models.user import User
import logging
import json

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def test_basic_aggregation(db: Session, user_id: int):
    """Test basic trade aggregation"""
    logger.info("=" * 60)
    logger.info("Test 1: Basic Trade Aggregation")
    logger.info("=" * 60)
    
    try:
        # Get all trades for user
        result = TradeAggregationService.aggregate_trades(
            db=db,
            user_id=user_id,
            include_closed=True,
            include_cancelled=False
        )
        
        logger.info(f"✅ Aggregated {result.get('total_trades', 0)} trades")
        logger.info(f"Summary: {json.dumps(result.get('aggregate_summary', {}), indent=2, default=str)}")
        
        if result.get('trades'):
            first_trade = result['trades'][0]
            logger.info(f"\nFirst trade structure:")
            logger.info(f"  - Trade ID: {first_trade.get('trade', {}).get('id')}")
            logger.info(f"  - Ticker: {first_trade.get('trade', {}).get('ticker', {}).get('symbol')}")
            logger.info(f"  - Executions: {len(first_trade.get('executions', []))}")
            logger.info(f"  - Has Trade Plan: {first_trade.get('trade_plan') is not None}")
            logger.info(f"  - Conditions: {len(first_trade.get('conditions', []))}")
            logger.info(f"  - Has Position: {first_trade.get('position') is not None}")
        
        return True
    except Exception as e:
        logger.error(f"❌ Test failed: {str(e)}", exc_info=True)
        return False


def test_filtered_aggregation(db: Session, user_id: int):
    """Test filtered trade aggregation"""
    logger.info("\n" + "=" * 60)
    logger.info("Test 2: Filtered Trade Aggregation")
    logger.info("=" * 60)
    
    try:
        # Get a ticker from existing trades
        trade = db.query(Trade).filter(Trade.user_id == user_id).first()
        if not trade:
            logger.warning("⚠️  No trades found for filtering test")
            return True
        
        ticker_id = trade.ticker_id
        
        result = TradeAggregationService.aggregate_trades(
            db=db,
            user_id=user_id,
            ticker_id=ticker_id,
            include_closed=True
        )
        
        logger.info(f"✅ Filtered by ticker_id={ticker_id}: {result.get('total_trades', 0)} trades")
        logger.info(f"Filters applied: {json.dumps(result.get('filters_applied', {}), indent=2, default=str)}")
        
        return True
    except Exception as e:
        logger.error(f"❌ Test failed: {str(e)}", exc_info=True)
        return False


def test_ai_formatting(db: Session, user_id: int):
    """Test AI formatting"""
    logger.info("\n" + "=" * 60)
    logger.info("Test 3: AI Formatting")
    logger.info("=" * 60)
    
    try:
        # Aggregate trades (get first few)
        result = TradeAggregationService.aggregate_trades(
            db=db,
            user_id=user_id,
            include_closed=True
        )
        
        # Limit manually for display
        if result.get('trades'):
            result['trades'] = result['trades'][:5]
        
        # Format for AI
        formatted = TradeAggregationService.format_trades_for_ai(result)
        
        logger.info(f"✅ Formatted {result.get('total_trades', 0)} trades for AI")
        logger.info(f"\nFormatted output (first 1000 chars):")
        logger.info("-" * 60)
        logger.info(formatted[:1000])
        logger.info("-" * 60)
        
        # Check that trade_data_structured placeholder would be replaced
        if "{trade_data_structured}" in formatted:
            logger.warning("⚠️  Placeholder {trade_data_structured} found in formatted output")
        else:
            logger.info("✅ No placeholder in formatted output (good)")
        
        return True
    except Exception as e:
        logger.error(f"❌ Test failed: {str(e)}", exc_info=True)
        return False


def test_enrich_trade_data(db: Session, user_id: int):
    """Test individual trade enrichment"""
    logger.info("\n" + "=" * 60)
    logger.info("Test 4: Individual Trade Enrichment")
    logger.info("=" * 60)
    
    try:
        # Get a trade with relationships
        from sqlalchemy.orm import joinedload
        trade = db.query(Trade).options(
            joinedload(Trade.account),
            joinedload(Trade.ticker),
            joinedload(Trade.trade_plan),
            joinedload(Trade.executions),
            joinedload(Trade.conditions)
        ).filter(Trade.user_id == user_id).first()
        
        if not trade:
            logger.warning("⚠️  No trades found for enrichment test")
            return True
        
        enriched = TradeAggregationService._enrich_trade_data(
            db, trade, include_position=True, include_market_data=False
        )
        
        logger.info(f"✅ Enriched trade {trade.id}")
        logger.info(f"  - Ticker: {enriched.get('trade', {}).get('ticker', {}).get('symbol')}")
        logger.info(f"  - Executions: {len(enriched.get('executions', []))}")
        logger.info(f"  - Trade Plan: {enriched.get('trade_plan') is not None}")
        logger.info(f"  - Conditions: {len(enriched.get('conditions', []))}")
        logger.info(f"  - Position: {enriched.get('position') is not None}")
        logger.info(f"  - Summary: {json.dumps(enriched.get('summary', {}), indent=2, default=str)}")
        
        return True
    except Exception as e:
        logger.error(f"❌ Test failed: {str(e)}", exc_info=True)
        return False


def main():
    """Run all tests"""
    db: Session = SessionLocal()
    
    try:
        # Get first user that has trades
        trade = db.query(Trade).first()
        if not trade:
            logger.error("❌ No trades found in database - cannot test aggregation")
            return
        
        user_id = trade.user_id
        logger.info(f"🧪 Testing with user_id: {user_id} (has trades)")
        
        # Count trades for this user
        trade_count = db.query(Trade).filter(Trade.user_id == user_id).count()
        logger.info(f"📊 User has {trade_count} trades")
        
        # Run tests
        tests = [
            test_basic_aggregation,
            test_filtered_aggregation,
            test_enrich_trade_data,
            test_ai_formatting
        ]
        
        results = []
        for test in tests:
            try:
                result = test(db, user_id)
                results.append(result)
            except Exception as e:
                logger.error(f"❌ Test {test.__name__} crashed: {str(e)}", exc_info=True)
                results.append(False)
        
        # Summary
        logger.info("\n" + "=" * 60)
        logger.info("Test Summary")
        logger.info("=" * 60)
        passed = sum(results)
        total = len(results)
        logger.info(f"✅ Passed: {passed}/{total}")
        
        if passed == total:
            logger.info("🎉 All tests passed!")
        else:
            logger.warning(f"⚠️  {total - passed} test(s) failed")
        
    except Exception as e:
        logger.error(f"❌ Test suite failed: {str(e)}", exc_info=True)
    finally:
        db.close()


if __name__ == "__main__":
    main()

