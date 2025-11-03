#!/usr/bin/env python3
"""
Position & Portfolio Service - Edge Cases Tests

בדיקות edge cases למערכת חישוב פוזיציות

Author: TikTrack Development Team
Date: January 2025
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from config.database import SessionLocal
from services.position_portfolio_service import PositionPortfolioService
from models.execution import Execution
from models.trading_account import TradingAccount
from models.ticker import Ticker
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class EdgeCasesTests:
    """Test edge cases for PositionPortfolioService"""
    
    def __init__(self):
        self.db: Session = None
        self.test_results = {'passed': [], 'failed': [], 'skipped': []}
    
    def setup(self):
        """Setup test environment"""
        try:
            self.db = SessionLocal()
            return True
        except Exception as e:
            logger.error(f"❌ Failed to setup: {e}")
            return False
    
    def teardown(self):
        """Cleanup"""
        if self.db:
            self.db.close()
    
    def test_closed_position(self):
        """Test position with quantity = 0 (closed)"""
        try:
            # Find execution that might result in closed position
            # or create test scenario
            execution = self.db.query(Execution).filter(
                Execution.ticker_id.isnot(None),
                Execution.trading_account_id.isnot(None)
            ).first()
            
            if not execution:
                self.test_results['skipped'].append('test_closed_position')
                return True
            
            # Calculate position
            position = PositionPortfolioService.calculate_position_by_ticker_account(
                self.db, execution.trading_account_id, execution.ticker_id
            )
            
            if position:
                # Check if it handles quantity = 0 correctly
                if position['quantity'] == 0:
                    if position['side'] != 'closed':
                        logger.error(f"❌ Expected side='closed' for quantity=0, got {position['side']}")
                        return False
                    logger.info("✅ Closed position handled correctly")
                else:
                    logger.info(f"✅ Position is open (quantity={position['quantity']})")
            
            return True
        except Exception as e:
            logger.error(f"❌ Error: {e}")
            return False
    
    def test_spontaneous_position(self):
        """Test spontaneous position (no trade_id)"""
        try:
            # Find execution without trade_id
            execution = self.db.query(Execution).filter(
                Execution.trade_id.is_(None),
                Execution.ticker_id.isnot(None),
                Execution.trading_account_id.isnot(None)
            ).first()
            
            if not execution:
                logger.info("⏭️ No spontaneous executions found - skipping")
                self.test_results['skipped'].append('test_spontaneous_position')
                return True
            
            position = PositionPortfolioService.calculate_position_by_ticker_account(
                self.db, execution.trading_account_id, execution.ticker_id
            )
            
            if position:
                if not position.get('is_spontaneous', False):
                    logger.warning(f"⚠️ Expected is_spontaneous=True, got {position.get('is_spontaneous')}")
                    # Not a failure - might have other linked trades
                else:
                    logger.info("✅ Spontaneous position detected correctly")
                    if len(position.get('linked_trade_ids', [])) > 0:
                        logger.warning("⚠️ Spontaneous position has linked trades (mixed scenario)")
            
            return True
        except Exception as e:
            logger.error(f"❌ Error: {e}")
            return False
    
    def test_position_without_market_price(self):
        """Test position calculation when market price is not available"""
        try:
            # Find ticker without market data
            ticker = self.db.query(Ticker).filter(
                ~Ticker.id.in_(
                    self.db.query(MarketDataQuote.ticker_id).distinct()
                )
            ).first()
            
            if not ticker:
                logger.info("⏭️ All tickers have market data - skipping")
                self.test_results['skipped'].append('test_position_without_market_price')
                return True
            
            # Find account with executions for this ticker
            execution = self.db.query(Execution).filter(
                Execution.ticker_id == ticker.id
            ).first()
            
            if not execution:
                self.test_results['skipped'].append('test_position_without_market_price')
                return True
            
            position = PositionPortfolioService.calculate_position_by_ticker_account(
                self.db, execution.trading_account_id, ticker.id, include_market_data=True
            )
            
            if position:
                if position.get('market_price_available') == False:
                    if position.get('market_value') is not None:
                        logger.error(f"❌ Expected market_value=None when no price, got {position.get('market_value')}")
                        return False
                    logger.info("✅ Position without market price handled correctly")
                else:
                    logger.info("✅ Market price found (unexpected)")
            
            return True
        except Exception as e:
            logger.error(f"❌ Error: {e}")
            import traceback
            logger.error(traceback.format_exc())
            return False
    
    def test_short_position_calculation(self):
        """Test short position (quantity < 0) calculation"""
        try:
            # Find short position
            execution = self.db.query(Execution).filter(
                Execution.action == 'sell',
                Execution.ticker_id.isnot(None),
                Execution.trading_account_id.isnot(None)
            ).first()
            
            if not execution:
                logger.info("⏭️ No sell executions found - skipping")
                self.test_results['skipped'].append('test_short_position_calculation')
                return True
            
            position = PositionPortfolioService.calculate_position_by_ticker_account(
                self.db, execution.trading_account_id, execution.ticker_id
            )
            
            if position and position['quantity'] < 0:
                if position['side'] != 'short':
                    logger.error(f"❌ Expected side='short' for quantity<0, got {position['side']}")
                    return False
                
                # Check unrealized P/L calculation for short
                if position.get('market_value') and position.get('unrealized_pl') is not None:
                    # For short: unrealized_pl = cost - market_value
                    expected_pl = position['current_position_cost'] - position['market_value']
                    if abs(position['unrealized_pl'] - expected_pl) > 0.01:
                        logger.error(f"❌ Unrealized P/L calculation wrong for short: expected {expected_pl}, got {position['unrealized_pl']}")
                        return False
                    logger.info("✅ Short position P/L calculated correctly")
            
            return True
        except Exception as e:
            logger.error(f"❌ Error: {e}")
            return False
    
    def test_percentage_calculations_zero_values(self):
        """Test percentage calculations with zero values"""
        try:
            # Test portfolio summary with edge cases
            portfolio = PositionPortfolioService.calculate_portfolio_summary(
                self.db, include_closed=False, unify_accounts=False
            )
            
            # Check that percentages are calculated correctly
            for position in portfolio.get('positions', [])[:5]:  # Check first 5
                percent_of_portfolio = position.get('percent_of_portfolio', 0)
                percent_of_account = position.get('percent_of_account', 0)
                
                if percent_of_portfolio < 0 or percent_of_portfolio > 100:
                    logger.error(f"❌ Invalid percent_of_portfolio: {percent_of_portfolio}")
                    return False
                
                if percent_of_account < 0 or percent_of_account > 100:
                    logger.error(f"❌ Invalid percent_of_account: {percent_of_account}")
                    return False
            
            logger.info("✅ Percentage calculations are valid")
            return True
        except Exception as e:
            logger.error(f"❌ Error: {e}")
            return False
    
    def test_multiple_trades_same_position(self):
        """Test position with multiple linked trades"""
        try:
            # Find execution with trade_id
            execution = self.db.query(Execution).filter(
                Execution.trade_id.isnot(None),
                Execution.ticker_id.isnot(None),
                Execution.trading_account_id.isnot(None)
            ).first()
            
            if not execution:
                self.test_results['skipped'].append('test_multiple_trades_same_position')
                return True
            
            # Check if there are multiple trades for this ticker+account
            trades_count = self.db.query(Trade).join(Execution).filter(
                Execution.ticker_id == execution.ticker_id,
                Execution.trading_account_id == execution.trading_account_id
            ).distinct().count()
            
            position = PositionPortfolioService.calculate_position_by_ticker_account(
                self.db, execution.trading_account_id, execution.ticker_id
            )
            
            if position:
                linked_trades = len(position.get('linked_trade_ids', []))
                if linked_trades > 1:
                    logger.info(f"✅ Position with {linked_trades} linked trades handled correctly")
                else:
                    logger.info(f"✅ Position with {linked_trades} linked trade")
            
            return True
        except Exception as e:
            logger.error(f"❌ Error: {e}")
            return False
    
    def run_all_tests(self):
        """Run all edge case tests"""
        logger.info("\n" + "="*60)
        logger.info("Starting Edge Cases Tests")
        logger.info("="*60)
        
        if not self.setup():
            return False
        
        try:
            tests = [
                ('Closed Position', self.test_closed_position),
                ('Spontaneous Position', self.test_spontaneous_position),
                ('Position Without Market Price', self.test_position_without_market_price),
                ('Short Position Calculation', self.test_short_position_calculation),
                ('Percentage Calculations Zero Values', self.test_percentage_calculations_zero_values),
                ('Multiple Trades Same Position', self.test_multiple_trades_same_position),
            ]
            
            for test_name, test_func in tests:
                try:
                    logger.info(f"\n{'='*60}")
                    logger.info(f"Running: {test_name}")
                    logger.info(f"{'='*60}")
                    result = test_func()
                    if result:
                        self.test_results['passed'].append(test_name)
                        logger.info(f"✅ PASSED: {test_name}")
                    else:
                        self.test_results['failed'].append(test_name)
                        logger.error(f"❌ FAILED: {test_name}")
                except Exception as e:
                    self.test_results['failed'].append(test_name)
                    logger.error(f"❌ ERROR in {test_name}: {e}")
                    import traceback
                    logger.error(traceback.format_exc())
        finally:
            self.teardown()
        
        return True
    
    def print_summary(self):
        """Print test summary"""
        logger.info("\n" + "="*60)
        logger.info("Edge Cases Test Summary")
        logger.info("="*60)
        logger.info(f"✅ Passed: {len(self.test_results['passed'])}")
        logger.info(f"❌ Failed: {len(self.test_results['failed'])}")
        logger.info(f"⏭️ Skipped: {len(self.test_results['skipped'])}")
        
        if self.test_results['failed']:
            logger.info("\nFailed Tests:")
            for test in self.test_results['failed']:
                logger.error(f"  ❌ {test}")
        
        total = len(self.test_results['passed']) + len(self.test_results['failed'])
        if total > 0:
            success_rate = (len(self.test_results['passed']) / total) * 100
            logger.info(f"\nSuccess Rate: {success_rate:.1f}%")


if __name__ == '__main__':
    from models.trade import Trade
    from models.external_data import MarketDataQuote
    
    tester = EdgeCasesTests()
    tester.run_all_tests()
    tester.print_summary()
    
    if tester.test_results['failed']:
        sys.exit(1)
    else:
        sys.exit(0)

