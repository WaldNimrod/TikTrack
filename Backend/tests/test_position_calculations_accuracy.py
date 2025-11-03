#!/usr/bin/env python3
"""
Position Calculations Accuracy Tests - TikTrack

בדיקות דיוק מתמטי של חישובי פוזיציות

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
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class CalculationAccuracyTests:
    """Test calculation accuracy"""
    
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
    
    def test_average_price_calculation(self):
        """Test that average price calculation is correct"""
        try:
            # Find position with multiple buy executions
            execution = self.db.query(Execution).filter(
                Execution.action == 'buy',
                Execution.ticker_id.isnot(None),
                Execution.trading_account_id.isnot(None)
            ).first()
            
            if not execution:
                self.test_results['skipped'].append('test_average_price_calculation')
                return True
            
            # Get all executions for this position
            executions = self.db.query(Execution).filter(
                Execution.ticker_id == execution.ticker_id,
                Execution.trading_account_id == execution.trading_account_id,
                Execution.action == 'buy'
            ).all()
            
            if len(executions) < 2:
                logger.info("⏭️ Need at least 2 buy executions for test - skipping")
                self.test_results['skipped'].append('test_average_price_calculation')
                return True
            
            # Calculate manually
            total_quantity = sum(float(e.quantity) for e in executions)
            total_cost = sum(float(e.quantity) * float(e.price) + float(e.fee or 0) for e in executions)
            expected_avg_net = total_cost / total_quantity if total_quantity > 0 else 0
            
            # Calculate via service
            position = PositionPortfolioService.calculate_position_by_ticker_account(
                self.db, execution.trading_account_id, execution.ticker_id
            )
            
            if position:
                actual_avg_net = position['average_price_net']
                # Allow small floating point differences
                if abs(actual_avg_net - expected_avg_net) > 0.01:
                    logger.error(f"❌ Average price mismatch: expected {expected_avg_net}, got {actual_avg_net}")
                    return False
                logger.info(f"✅ Average price calculation correct: {actual_avg_net}")
            
            return True
        except Exception as e:
            logger.error(f"❌ Error: {e}")
            import traceback
            logger.error(traceback.format_exc())
            return False
    
    def test_quantity_calculation(self):
        """Test that quantity calculation is correct"""
        try:
            execution = self.db.query(Execution).filter(
                Execution.ticker_id.isnot(None),
                Execution.trading_account_id.isnot(None)
            ).first()
            
            if not execution:
                self.test_results['skipped'].append('test_quantity_calculation')
                return True
            
            # Get all executions
            executions = self.db.query(Execution).filter(
                Execution.ticker_id == execution.ticker_id,
                Execution.trading_account_id == execution.trading_account_id
            ).all()
            
            # Calculate manually
            total_bought = sum(float(e.quantity) for e in executions if e.action == 'buy')
            total_sold = sum(float(e.quantity) for e in executions if e.action == 'sell')
            expected_quantity = total_bought - total_sold
            
            # Calculate via service
            position = PositionPortfolioService.calculate_position_by_ticker_account(
                self.db, execution.trading_account_id, execution.ticker_id
            )
            
            if position:
                actual_quantity = position['quantity']
                if abs(actual_quantity - expected_quantity) > 0.01:
                    logger.error(f"❌ Quantity mismatch: expected {expected_quantity}, got {actual_quantity}")
                    return False
                logger.info(f"✅ Quantity calculation correct: {actual_quantity}")
            
            return True
        except Exception as e:
            logger.error(f"❌ Error: {e}")
            return False
    
    def test_market_value_calculation(self):
        """Test that market value calculation is correct"""
        try:
            execution = self.db.query(Execution).filter(
                Execution.ticker_id.isnot(None),
                Execution.trading_account_id.isnot(None)
            ).first()
            
            if not execution:
                self.test_results['skipped'].append('test_market_value_calculation')
                return True
            
            position = PositionPortfolioService.calculate_position_by_ticker_account(
                self.db, execution.trading_account_id, execution.ticker_id, include_market_data=True
            )
            
            if position and position.get('market_price_available'):
                quantity = abs(position['quantity'])
                market_price = position['market_price']
                expected_market_value = quantity * market_price
                actual_market_value = position.get('market_value', 0) or 0
                
                if abs(actual_market_value - expected_market_value) > 0.01:
                    logger.error(f"❌ Market value mismatch: expected {expected_market_value}, got {actual_market_value}")
                    return False
                logger.info(f"✅ Market value calculation correct: {actual_market_value}")
            else:
                logger.info("⏭️ Market price not available - skipping")
                self.test_results['skipped'].append('test_market_value_calculation')
            
            return True
        except Exception as e:
            logger.error(f"❌ Error: {e}")
            return False
    
    def test_unrealized_pl_calculation_long(self):
        """Test unrealized P/L calculation for long position"""
        try:
            # Find long position with market price
            execution = self.db.query(Execution).filter(
                Execution.action == 'buy',
                Execution.ticker_id.isnot(None),
                Execution.trading_account_id.isnot(None)
            ).first()
            
            if not execution:
                self.test_results['skipped'].append('test_unrealized_pl_calculation_long')
                return True
            
            position = PositionPortfolioService.calculate_position_by_ticker_account(
                self.db, execution.trading_account_id, execution.ticker_id, include_market_data=True
            )
            
            if position and position.get('quantity', 0) > 0 and position.get('market_price_available'):
                quantity = position['quantity']
                market_price = position['market_price']
                avg_price_net = position['average_price_net']
                
                market_value = quantity * market_price
                cost = quantity * avg_price_net
                expected_unrealized_pl = market_value - cost
                actual_unrealized_pl = position.get('unrealized_pl', 0) or 0
                
                if abs(actual_unrealized_pl - expected_unrealized_pl) > 0.01:
                    logger.error(f"❌ Unrealized P/L mismatch (long): expected {expected_unrealized_pl}, got {actual_unrealized_pl}")
                    return False
                logger.info(f"✅ Unrealized P/L calculation correct (long): {actual_unrealized_pl}")
            else:
                logger.info("⏭️ No long position with market price - skipping")
                self.test_results['skipped'].append('test_unrealized_pl_calculation_long')
            
            return True
        except Exception as e:
            logger.error(f"❌ Error: {e}")
            return False
    
    def test_unrealized_pl_calculation_short(self):
        """Test unrealized P/L calculation for short position"""
        try:
            # Find short position with market price
            execution = self.db.query(Execution).filter(
                Execution.action == 'sell',
                Execution.ticker_id.isnot(None),
                Execution.trading_account_id.isnot(None)
            ).first()
            
            if not execution:
                self.test_results['skipped'].append('test_unrealized_pl_calculation_short')
                return True
            
            position = PositionPortfolioService.calculate_position_by_ticker_account(
                self.db, execution.trading_account_id, execution.ticker_id, include_market_data=True
            )
            
            if position and position.get('quantity', 0) < 0 and position.get('market_price_available'):
                quantity = abs(position['quantity'])
                market_price = position['market_price']
                avg_price_net = position['average_price_net']
                
                market_value = quantity * market_price
                cost = quantity * avg_price_net
                expected_unrealized_pl = cost - market_value  # For short: cost - market_value
                actual_unrealized_pl = position.get('unrealized_pl', 0) or 0
                
                if abs(actual_unrealized_pl - expected_unrealized_pl) > 0.01:
                    logger.error(f"❌ Unrealized P/L mismatch (short): expected {expected_unrealized_pl}, got {actual_unrealized_pl}")
                    return False
                logger.info(f"✅ Unrealized P/L calculation correct (short): {actual_unrealized_pl}")
            else:
                logger.info("⏭️ No short position with market price - skipping")
                self.test_results['skipped'].append('test_unrealized_pl_calculation_short')
            
            return True
        except Exception as e:
            logger.error(f"❌ Error: {e}")
            return False
    
    def test_fees_included_in_cost(self):
        """Test that fees are included in total cost"""
        try:
            execution = self.db.query(Execution).filter(
                Execution.fee.isnot(None),
                Execution.fee > 0,
                Execution.ticker_id.isnot(None),
                Execution.trading_account_id.isnot(None)
            ).first()
            
            if not execution:
                logger.info("⏭️ No executions with fees - skipping")
                self.test_results['skipped'].append('test_fees_included_in_cost')
                return True
            
            # Get all executions (both buy and sell)
            all_executions = self.db.query(Execution).filter(
                Execution.ticker_id == execution.ticker_id,
                Execution.trading_account_id == execution.trading_account_id
            ).all()
            
            # Calculate manually - fees from all executions
            expected_total_fees = sum(float(e.fee or 0) for e in all_executions)
            # Total cost only from buy executions (for average price calculation)
            buy_executions = [e for e in all_executions if e.action == 'buy']
            expected_total_cost = sum(
                float(e.quantity) * float(e.price) + float(e.fee or 0)
                for e in buy_executions
            )
            
            # Calculate via service
            position = PositionPortfolioService.calculate_position_by_ticker_account(
                self.db, execution.trading_account_id, execution.ticker_id
            )
            
            if position:
                actual_total_fees = position['total_fees']
                actual_total_cost = position['total_cost']
                
                if abs(actual_total_fees - expected_total_fees) > 0.01:
                    logger.error(f"❌ Total fees mismatch: expected {expected_total_fees}, got {actual_total_fees}")
                    return False
                
                if abs(actual_total_cost - expected_total_cost) > 0.01:
                    logger.error(f"❌ Total cost mismatch: expected {expected_total_cost}, got {actual_total_cost}")
                    return False
                
                logger.info(f"✅ Fees included correctly: fees={actual_total_fees}, cost={actual_total_cost}")
            
            return True
        except Exception as e:
            logger.error(f"❌ Error: {e}")
            return False
    
    def run_all_tests(self):
        """Run all accuracy tests"""
        logger.info("\n" + "="*60)
        logger.info("Starting Calculation Accuracy Tests")
        logger.info("="*60)
        
        if not self.setup():
            return False
        
        try:
            tests = [
                ('Average Price Calculation', self.test_average_price_calculation),
                ('Quantity Calculation', self.test_quantity_calculation),
                ('Market Value Calculation', self.test_market_value_calculation),
                ('Unrealized P/L Long', self.test_unrealized_pl_calculation_long),
                ('Unrealized P/L Short', self.test_unrealized_pl_calculation_short),
                ('Fees Included in Cost', self.test_fees_included_in_cost),
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
        logger.info("Calculation Accuracy Test Summary")
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
    tester = CalculationAccuracyTests()
    tester.run_all_tests()
    tester.print_summary()
    
    if tester.test_results['failed']:
        sys.exit(1)
    else:
        sys.exit(0)

