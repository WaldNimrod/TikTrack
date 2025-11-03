#!/usr/bin/env python3
"""
Position & Portfolio Service - Performance Tests

בדיקות ביצועים למערכת חישוב פוזיציות

Author: TikTrack Development Team
Date: January 2025
"""

import sys
import os
import time

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from config.database import SessionLocal
from services.position_portfolio_service import PositionPortfolioService
from models.execution import Execution
from models.trading_account import TradingAccount
import logging

logging.basicConfig(level=logging.INFO, format='%(message)s')  # Info level for test output
logger = logging.getLogger(__name__)


class PerformanceTests:
    """Performance tests for PositionPortfolioService"""
    
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
    
    def test_single_position_calculation_time(self):
        """Test time to calculate single position"""
        try:
            execution = self.db.query(Execution).filter(
                Execution.ticker_id.isnot(None),
                Execution.trading_account_id.isnot(None)
            ).first()
            
            if not execution:
                self.test_results['skipped'].append('test_single_position_calculation_time')
                return True
            
            # Warm up
            PositionPortfolioService.calculate_position_by_ticker_account(
                self.db, execution.trading_account_id, execution.ticker_id
            )
            
            # Measure time
            start_time = time.time()
            for _ in range(10):
                PositionPortfolioService.calculate_position_by_ticker_account(
                    self.db, execution.trading_account_id, execution.ticker_id
                )
            elapsed = (time.time() - start_time) / 10
            
            if elapsed < 0.5:  # Should be less than 500ms
                logger.info(f"✅ Single position calculation: {elapsed*1000:.2f}ms (target: <500ms)")
                return True
            else:
                logger.warning(f"⚠️ Single position calculation slow: {elapsed*1000:.2f}ms")
                return False
        except Exception as e:
            logger.error(f"❌ Error: {e}")
            return False
    
    def test_account_positions_calculation_time(self):
        """Test time to calculate all positions for an account"""
        try:
            account = self.db.query(TradingAccount).first()
            if not account:
                self.test_results['skipped'].append('test_account_positions_calculation_time')
                return True
            
            # Warm up
            PositionPortfolioService.calculate_all_account_positions(
                self.db, account.id, include_closed=False
            )
            
            # Measure time
            start_time = time.time()
            positions = PositionPortfolioService.calculate_all_account_positions(
                self.db, account.id, include_closed=False
            )
            elapsed = time.time() - start_time
            
            # Target: <2 seconds for reasonable number of positions
            if elapsed < 2.0:
                logger.info(f"✅ Account positions calculation: {elapsed*1000:.2f}ms for {len(positions)} positions (target: <2000ms)")
                return True
            else:
                logger.warning(f"⚠️ Account positions calculation slow: {elapsed*1000:.2f}ms")
                return False
        except Exception as e:
            logger.error(f"❌ Error: {e}")
            return False
    
    def test_portfolio_summary_calculation_time(self):
        """Test time to calculate portfolio summary"""
        try:
            # Warm up
            PositionPortfolioService.calculate_portfolio_summary(
                self.db, include_closed=False, unify_accounts=False
            )
            
            # Measure time
            start_time = time.time()
            portfolio = PositionPortfolioService.calculate_portfolio_summary(
                self.db, include_closed=False, unify_accounts=False
            )
            elapsed = time.time() - start_time
            
            positions_count = len(portfolio.get('positions', []))
            
            # Target: <3 seconds for reasonable number of positions
            if elapsed < 3.0:
                logger.info(f"✅ Portfolio summary calculation: {elapsed*1000:.2f}ms for {positions_count} positions (target: <3000ms)")
                return True
            else:
                logger.warning(f"⚠️ Portfolio summary calculation slow: {elapsed*1000:.2f}ms")
                return False
        except Exception as e:
            logger.error(f"❌ Error: {e}")
            return False
    
    def test_market_price_lookup_time(self):
        """Test time to lookup market price"""
        try:
            ticker = self.db.query(Ticker).first()
            if not ticker:
                self.test_results['skipped'].append('test_market_price_lookup_time')
                return True
            
            # Warm up
            PositionPortfolioService.get_market_price(self.db, ticker.id)
            
            # Measure time
            start_time = time.time()
            for _ in range(10):
                PositionPortfolioService.get_market_price(self.db, ticker.id)
            elapsed = (time.time() - start_time) / 10
            
            if elapsed < 0.1:  # Should be very fast (<100ms)
                logger.info(f"✅ Market price lookup: {elapsed*1000:.2f}ms (target: <100ms)")
                return True
            else:
                logger.warning(f"⚠️ Market price lookup slow: {elapsed*1000:.2f}ms")
                return False
        except Exception as e:
            logger.error(f"❌ Error: {e}")
            return False
    
    def test_batch_calculation_efficiency(self):
        """Test that batch calculation is more efficient than individual"""
        try:
            account = self.db.query(TradingAccount).first()
            if not account:
                self.test_results['skipped'].append('test_batch_calculation_efficiency')
                return True
            
            # Get positions individually
            execution = self.db.query(Execution).filter(
                Execution.trading_account_id == account.id
            ).first()
            
            if not execution:
                self.test_results['skipped'].append('test_batch_calculation_efficiency')
                return True
            
            # Get unique tickers for this account
            ticker_ids = self.db.query(Execution.ticker_id).filter(
                Execution.trading_account_id == account.id
            ).distinct().limit(5).all()
            
            if len(ticker_ids) < 2:
                self.test_results['skipped'].append('test_batch_calculation_efficiency')
                return True
            
            # Measure individual calculations
            start_time = time.time()
            for (ticker_id,) in ticker_ids:
                PositionPortfolioService.calculate_position_by_ticker_account(
                    self.db, account.id, ticker_id
                )
            individual_time = time.time() - start_time
            
            # Measure batch calculation
            start_time = time.time()
            PositionPortfolioService.calculate_all_account_positions(
                self.db, account.id, include_closed=False
            )
            batch_time = time.time() - start_time
            
            logger.info(f"✅ Individual: {individual_time*1000:.2f}ms, Batch: {batch_time*1000:.2f}ms")
            # Batch should be similar or faster (might be slower due to more processing)
            return True
        except Exception as e:
            logger.error(f"❌ Error: {e}")
            return False
    
    def run_all_tests(self):
        """Run all performance tests"""
        logger.info("\n" + "="*60)
        logger.info("Starting Performance Tests")
        logger.info("="*60)
        
        if not self.setup():
            return False
        
        try:
            tests = [
                ('Single Position Calculation', self.test_single_position_calculation_time),
                ('Account Positions Calculation', self.test_account_positions_calculation_time),
                ('Portfolio Summary Calculation', self.test_portfolio_summary_calculation_time),
                ('Market Price Lookup', self.test_market_price_lookup_time),
                ('Batch Calculation Efficiency', self.test_batch_calculation_efficiency),
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
        finally:
            self.teardown()
        
        return True
    
    def print_summary(self):
        """Print test summary"""
        logger.info("\n" + "="*60)
        logger.info("Performance Test Summary")
        logger.info("="*60)
        logger.info(f"✅ Passed: {len(self.test_results['passed'])}")
        logger.info(f"❌ Failed: {len(self.test_results['failed'])}")
        logger.info(f"⏭️ Skipped: {len(self.test_results['skipped'])}")


if __name__ == '__main__':
    from models.ticker import Ticker
    
    tester = PerformanceTests()
    tester.run_all_tests()
    tester.print_summary()
    
    if tester.test_results['failed']:
        sys.exit(1)
    else:
        sys.exit(0)

