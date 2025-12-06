#!/usr/bin/env python3
"""
Test script for AI Analysis Service Integration with Trade Aggregation
Tests the full flow: trade aggregation -> AI prompt building
"""

import os
import sys
from pathlib import Path

# Add Backend directory to path
backend_path = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_path))

from sqlalchemy.orm import Session
from config.database import SessionLocal
from services.ai_analysis_service import PromptTemplateService, AIAnalysisService
from services.trade_aggregation_service import TradeAggregationService
from models.trade import Trade
from models.ai_analysis import AIPromptTemplate
import logging
import json

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def test_prompt_with_trade_data(db: Session):
    """Test building prompt with trade data"""
    logger.info("=" * 60)
    logger.info("Test: AI Analysis Prompt with Trade Data")
    logger.info("=" * 60)
    
    try:
        # Get Portfolio Performance template (ID 3)
        template = PromptTemplateService.get_template(db, 3)
        if not template:
            logger.error("❌ Template ID 3 not found")
            return False
        
        logger.info(f"✅ Found template: {template.name_he}")
        
        # Get a user with trades
        trade = db.query(Trade).first()
        if not trade:
            logger.error("❌ No trades found")
            return False
        
        user_id = trade.user_id
        
        # Aggregate trades (get first few for testing)
        enriched_data = TradeAggregationService.aggregate_trades(
            db=db,
            user_id=user_id,
            include_closed=True
        )
        
        # Limit to 3 trades for display
        if enriched_data.get('trades'):
            enriched_data['trades'] = enriched_data['trades'][:3]
            enriched_data['total_trades'] = 3
        
        # Format for AI
        trade_data_str = TradeAggregationService.format_trades_for_ai(enriched_data)
        
        # Build variables (v2.0 structure)
        variables = {
            "version": "2.0",
            "prompt_variables": {
                "ticker_symbol": "TSLA",
                "date_range": "2024-01-01 - 2024-12-31",
                "analysis_focus": "Performance Review",
                "investment_type_filter": "Swing Trading"
            },
            "filters": {
                "trading_account_id": trade.trading_account_id
            },
            "trade_selection": {
                "type": "multiple",
                "criteria": {}
            }
        }
        
        # Build prompt
        prompt = PromptTemplateService.build_prompt(template, variables["prompt_variables"], trade_data_str)
        
        # Check results
        logger.info(f"✅ Prompt built successfully")
        logger.info(f"  - Prompt length: {len(prompt)} characters")
        logger.info(f"  - Contains trade_data_structured: {trade_data_str[:100] in prompt}")
        logger.info(f"  - Contains trading data section: {'=== TRADING DATA ===' in prompt}")
        logger.info(f"  - Contains ticker_symbol: {'TSLA' in prompt}")
        logger.info(f"  - Does NOT contain trading_account ID in prompt: {str(trade.trading_account_id) not in prompt}")
        
        # Show snippet
        logger.info(f"\nPrompt snippet (first 500 chars):")
        logger.info("-" * 60)
        logger.info(prompt[:500])
        logger.info("-" * 60)
        
        # Verify structure
        if "{trade_data_structured}" in prompt:
            logger.warning("⚠️  Placeholder {trade_data_structured} still in prompt!")
            return False
        
        if "Trading Account:" in prompt and str(trade.trading_account_id) in prompt:
            logger.warning("⚠️  Trading account ID found in prompt (should be filtered out)")
            return False
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Test failed: {str(e)}", exc_info=True)
        return False


def test_variables_structure_v2(db: Session):
    """Test variables structure v2.0"""
    logger.info("\n" + "=" * 60)
    logger.info("Test: Variables Structure v2.0")
    logger.info("=" * 60)
    
    try:
        # Test both structures
        legacy_vars = {
            "ticker_symbol": "TSLA",
            "date_range": "2024-01-01 - 2024-12-31",
            "response_language": "hebrew"
        }
        
        v2_vars = {
            "version": "2.0",
            "prompt_variables": {
                "ticker_symbol": "TSLA",
                "date_range": "2024-01-01 - 2024-12-31"
            },
            "filters": {
                "trading_account_id": 1
            },
            "trade_selection": {
                "type": "multiple",
                "criteria": {}
            }
        }
        
        # Get template
        template = PromptTemplateService.get_template(db, 3)
        if not template:
            return False
        
        # Test legacy structure
        prompt1 = PromptTemplateService.build_prompt(template, legacy_vars)
        logger.info(f"✅ Legacy structure works: {len(prompt1)} chars")
        
        # Test v2.0 structure
        prompt2 = PromptTemplateService.build_prompt(template, v2_vars["prompt_variables"])
        logger.info(f"✅ v2.0 structure works: {len(prompt2)} chars")
        
        # Verify filters are separate
        logger.info(f"✅ Filters separate in v2.0: trading_account_id in filters = {v2_vars['filters'].get('trading_account_id') is not None}")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Test failed: {str(e)}", exc_info=True)
        return False


def main():
    """Run all tests"""
    db: Session = SessionLocal()
    
    try:
        tests = [
            test_variables_structure_v2,
            test_prompt_with_trade_data
        ]
        
        results = []
        for test in tests:
            try:
                result = test(db)
                results.append(result)
            except Exception as e:
                logger.error(f"❌ Test {test.__name__} crashed: {str(e)}", exc_info=True)
                results.append(False)
        
        # Summary
        logger.info("\n" + "=" * 60)
        logger.info("Integration Test Summary")
        logger.info("=" * 60)
        passed = sum(results)
        total = len(results)
        logger.info(f"✅ Passed: {passed}/{total}")
        
        if passed == total:
            logger.info("🎉 All integration tests passed!")
        else:
            logger.warning(f"⚠️  {total - passed} test(s) failed")
        
    except Exception as e:
        logger.error(f"❌ Test suite failed: {str(e)}", exc_info=True)
    finally:
        db.close()


if __name__ == "__main__":
    main()

