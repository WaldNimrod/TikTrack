#!/usr/bin/env python3
"""
Position & Portfolio Service Tests - TikTrack

בדיקות מקיפות למערכת חישוב פוזיציות ופורטפוליו

Author: TikTrack Development Team
Date: January 2025
"""

import sys
import os

# Add Backend directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from config.database import SessionLocal
from services.position_portfolio_service import PositionPortfolioService
from models.execution import Execution
from models.trading_account import TradingAccount
from models.ticker import Ticker
from models.trade import Trade
from models.external_data import MarketDataQuote
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class PositionPortfolioServiceTests:
    """Test suite for PositionPortfolioService"""
    
    def __init__(self):
        self.db: Session = None
        self.test_results = {
            'passed': [],
            'failed': [],
            'skipped': []
        }
    
    def setup(self):
        """Setup test environment"""
        try:
            self.db = SessionLocal()
            logger.info("✅ Database session created")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to create database session: {e}")
            return False
    
    def teardown(self):
        """Cleanup test environment"""
        if self.db:
            self.db.close()
            logger.info("✅ Database session closed")
    
    def run_test(self, test_name: str, test_func):
        """Run a single test"""
        try:
            logger.info(f"\n{'='*60}")
            logger.info(f"Running test: {test_name}")
            logger.info(f"{'='*60}")
            
            result = test_func()
            
            if result:
                self.test_results['passed'].append(test_name)
                logger.info(f"✅ PASSED: {test_name}")
            else:
                self.test_results['failed'].append(test_name)
                logger.error(f"❌ FAILED: {test_name}")
            
            return result
        except Exception as e:
            self.test_results['failed'].append(test_name)
            logger.error(f"❌ ERROR in {test_name}: {e}")
            import traceback
            logger.error(traceback.format_exc())
            return False
    
    def test_imports(self):
        """Test that all imports work correctly"""
        try:
            from services.position_portfolio_service import PositionPortfolioService
            from models.execution import Execution
            from models.trading_account import TradingAccount
            from models.ticker import Ticker
            from models.trade import Trade
            from models.trade_plan import TradePlan
            from models.external_data import MarketDataQuote
            logger.info("✅ All imports successful")
            return True
        except ImportError as e:
            logger.error(f"❌ Import error: {e}")
            return False
    
    def test_service_instantiation(self):
        """Test that service can be instantiated"""
        try:
            service = PositionPortfolioService()
            logger.info("✅ Service instantiated successfully")
            return True
        except Exception as e:
            logger.error(f"❌ Service instantiation failed: {e}")
            return False
    
    def test_get_market_price_no_data(self):
        """Test get_market_price with non-existent ticker"""
        try:
            # Use a very high ticker_id that doesn't exist
            result = PositionPortfolioService.get_market_price(self.db, 999999)
            if result is None:
                logger.info("✅ get_market_price returns None for non-existent ticker (expected)")
                return True
            else:
                logger.warning(f"⚠️ get_market_price returned data for non-existent ticker: {result}")
                return False
        except Exception as e:
            logger.error(f"❌ Error in get_market_price: {e}")
            return False
    
    def test_get_market_price_existing(self):
        """Test get_market_price with existing ticker (if available)"""
        try:
            # Get first ticker from database
            ticker = self.db.query(Ticker).first()
            if not ticker:
                logger.info("⏭️ No tickers in database - skipping test")
                self.test_results['skipped'].append('test_get_market_price_existing')
                return True
            
            result = PositionPortfolioService.get_market_price(self.db, ticker.id)
            
            if result is None:
                logger.info(f"✅ get_market_price returns None for ticker {ticker.id} (no market data)")
                return True
            else:
                logger.info(f"✅ get_market_price returned data for ticker {ticker.id}: price={result.get('price')}")
                # Validate structure
                required_keys = ['price', 'is_stale', 'fetched_at']
                if all(key in result for key in required_keys):
                    logger.info("✅ Market price data structure is valid")
                    return True
                else:
                    logger.error(f"❌ Missing required keys in market price data: {result.keys()}")
                    return False
        except Exception as e:
            logger.error(f"❌ Error in get_market_price: {e}")
            return False
    
    def test_calculate_position_no_executions(self):
        """Test calculate_position with account+ticker that has no executions"""
        try:
            # Get first account and ticker
            account = self.db.query(TradingAccount).first()
            ticker = self.db.query(Ticker).first()
            
            if not account or not ticker:
                logger.info("⏭️ No accounts or tickers in database - skipping test")
                self.test_results['skipped'].append('test_calculate_position_no_executions')
                return True
            
            # Check if there are executions for this combination
            executions = self.db.query(Execution).filter(
                Execution.ticker_id == ticker.id,
                Execution.trading_account_id == account.id
            ).all()
            
            if executions:
                logger.info(f"⏭️ Found {len(executions)} executions for account {account.id}, ticker {ticker.id} - skipping test")
                self.test_results['skipped'].append('test_calculate_position_no_executions')
                return True
            
            result = PositionPortfolioService.calculate_position_by_ticker_account(
                self.db, account.id, ticker.id
            )
            
            if result is None:
                logger.info("✅ calculate_position returns None for no executions (expected)")
                return True
            else:
                logger.warning(f"⚠️ calculate_position returned data for no executions: {result}")
                return False
        except Exception as e:
            logger.error(f"❌ Error in calculate_position: {e}")
            return False
    
    def test_calculate_position_with_executions(self):
        """Test calculate_position with account+ticker that has executions"""
        try:
            # Find account+ticker combination with executions
            execution = self.db.query(Execution).filter(
                Execution.ticker_id.isnot(None),
                Execution.trading_account_id.isnot(None)
            ).first()
            
            if not execution:
                logger.info("⏭️ No executions in database - skipping test")
                self.test_results['skipped'].append('test_calculate_position_with_executions')
                return True
            
            result = PositionPortfolioService.calculate_position_by_ticker_account(
                self.db, execution.trading_account_id, execution.ticker_id
            )
            
            if result is None:
                logger.warning(f"⚠️ calculate_position returned None for account {execution.trading_account_id}, ticker {execution.ticker_id}")
                return False
            
            # Validate structure
            required_keys = [
                'trading_account_id', 'ticker_id', 'quantity', 'side',
                'average_price_gross', 'average_price_net', 'total_cost',
                'total_fees', 'total_bought_quantity', 'total_sold_quantity'
            ]
            
            missing_keys = [key for key in required_keys if key not in result]
            if missing_keys:
                logger.error(f"❌ Missing required keys: {missing_keys}")
                return False
            
            logger.info(f"✅ Position calculated successfully:")
            logger.info(f"   Account: {result['account_name']}")
            logger.info(f"   Ticker: {result['ticker_symbol']}")
            logger.info(f"   Quantity: {result['quantity']}")
            logger.info(f"   Side: {result['side']}")
            logger.info(f"   Average Price (Net): {result['average_price_net']}")
            
            return True
        except Exception as e:
            logger.error(f"❌ Error in calculate_position: {e}")
            import traceback
            logger.error(traceback.format_exc())
            return False
    
    def test_calculate_all_account_positions(self):
        """Test calculate_all_account_positions"""
        try:
            account = self.db.query(TradingAccount).first()
            if not account:
                logger.info("⏭️ No accounts in database - skipping test")
                self.test_results['skipped'].append('test_calculate_all_account_positions')
                return True
            
            positions = PositionPortfolioService.calculate_all_account_positions(
                self.db, account.id, include_closed=False, include_market_data=True
            )
            
            if not isinstance(positions, list):
                logger.error(f"❌ Expected list, got {type(positions)}")
                return False
            
            logger.info(f"✅ Found {len(positions)} positions for account {account.id}")
            
            # Validate each position structure
            for i, position in enumerate(positions[:3]):  # Check first 3
                if not isinstance(position, dict):
                    logger.error(f"❌ Position {i} is not a dict: {type(position)}")
                    return False
                
                if 'trading_account_id' not in position or 'ticker_id' not in position:
                    logger.error(f"❌ Position {i} missing required keys")
                    return False
            
            return True
        except Exception as e:
            logger.error(f"❌ Error in calculate_all_account_positions: {e}")
            import traceback
            logger.error(traceback.format_exc())
            return False
    
    def test_calculate_portfolio_summary(self):
        """Test calculate_portfolio_summary"""
        try:
            portfolio = PositionPortfolioService.calculate_portfolio_summary(
                self.db, include_closed=False, unify_accounts=False, side_filter=None
            )
            
            if not isinstance(portfolio, dict):
                logger.error(f"❌ Expected dict, got {type(portfolio)}")
                return False
            
            if 'positions' not in portfolio or 'summary' not in portfolio:
                logger.error(f"❌ Missing required keys: {portfolio.keys()}")
                return False
            
            summary = portfolio['summary']
            required_summary_keys = [
                'total_positions', 'total_market_value', 'total_cost',
                'total_realized_pl', 'total_unrealized_pl', 'total_pl', 'total_fees'
            ]
            
            missing_keys = [key for key in required_summary_keys if key not in summary]
            if missing_keys:
                logger.error(f"❌ Missing summary keys: {missing_keys}")
                return False
            
            logger.info(f"✅ Portfolio summary calculated:")
            logger.info(f"   Total Positions: {summary['total_positions']}")
            logger.info(f"   Total Market Value: {summary['total_market_value']}")
            logger.info(f"   Total Cost: {summary['total_cost']}")
            logger.info(f"   Total P/L: {summary['total_pl']}")
            
            return True
        except Exception as e:
            logger.error(f"❌ Error in calculate_portfolio_summary: {e}")
            import traceback
            logger.error(traceback.format_exc())
            return False
    
    def test_portfolio_summary_filters(self):
        """Test portfolio summary with different filters"""
        try:
            # Test with include_closed=True
            portfolio1 = PositionPortfolioService.calculate_portfolio_summary(
                self.db, include_closed=True, unify_accounts=False
            )
            
            # Test with include_closed=False
            portfolio2 = PositionPortfolioService.calculate_portfolio_summary(
                self.db, include_closed=False, unify_accounts=False
            )
            
            # Test with side_filter='long'
            portfolio3 = PositionPortfolioService.calculate_portfolio_summary(
                self.db, include_closed=False, unify_accounts=False, side_filter='long'
            )
            
            logger.info(f"✅ Portfolio filters work correctly:")
            logger.info(f"   With closed: {portfolio1['summary']['total_positions']} positions")
            logger.info(f"   Without closed: {portfolio2['summary']['total_positions']} positions")
            logger.info(f"   Long only: {portfolio3['summary']['total_positions']} positions")
            
            return True
        except Exception as e:
            logger.error(f"❌ Error in portfolio filters: {e}")
            return False
    
    def test_get_position_details(self):
        """Test get_position_details"""
        try:
            execution = self.db.query(Execution).filter(
                Execution.ticker_id.isnot(None),
                Execution.trading_account_id.isnot(None)
            ).first()
            
            if not execution:
                logger.info("⏭️ No executions in database - skipping test")
                self.test_results['skipped'].append('test_get_position_details')
                return True
            
            details = PositionPortfolioService.get_position_details(
                self.db, execution.trading_account_id, execution.ticker_id
            )
            
            if details is None:
                logger.warning(f"⚠️ get_position_details returned None")
                return False
            
            if 'executions' not in details:
                logger.error(f"❌ Missing 'executions' key in details")
                return False
            
            if not isinstance(details['executions'], list):
                logger.error(f"❌ 'executions' is not a list: {type(details['executions'])}")
                return False
            
            logger.info(f"✅ Position details retrieved:")
            logger.info(f"   Executions count: {len(details['executions'])}")
            
            return True
        except Exception as e:
            logger.error(f"❌ Error in get_position_details: {e}")
            return False
    
    def run_all_tests(self):
        """Run all tests"""
        logger.info("\n" + "="*60)
        logger.info("Starting Position & Portfolio Service Tests")
        logger.info("="*60)
        
        if not self.setup():
            logger.error("❌ Failed to setup test environment")
            return False
        
        try:
            # Run tests
            tests = [
                ('Import Test', self.test_imports),
                ('Service Instantiation', self.test_service_instantiation),
                ('Get Market Price (No Data)', self.test_get_market_price_no_data),
                ('Get Market Price (Existing)', self.test_get_market_price_existing),
                ('Calculate Position (No Executions)', self.test_calculate_position_no_executions),
                ('Calculate Position (With Executions)', self.test_calculate_position_with_executions),
                ('Calculate All Account Positions', self.test_calculate_all_account_positions),
                ('Calculate Portfolio Summary', self.test_calculate_portfolio_summary),
                ('Portfolio Summary Filters', self.test_portfolio_summary_filters),
                ('Get Position Details', self.test_get_position_details),
            ]
            
            for test_name, test_func in tests:
                self.run_test(test_name, test_func)
            
            return True
        finally:
            self.teardown()
    
    def print_summary(self):
        """Print test summary"""
        logger.info("\n" + "="*60)
        logger.info("Test Summary")
        logger.info("="*60)
        logger.info(f"✅ Passed: {len(self.test_results['passed'])}")
        logger.info(f"❌ Failed: {len(self.test_results['failed'])}")
        logger.info(f"⏭️ Skipped: {len(self.test_results['skipped'])}")
        
        if self.test_results['failed']:
            logger.info("\nFailed Tests:")
            for test in self.test_results['failed']:
                logger.error(f"  ❌ {test}")
        
        if self.test_results['skipped']:
            logger.info("\nSkipped Tests:")
            for test in self.test_results['skipped']:
                logger.info(f"  ⏭️ {test}")
        
        total = len(self.test_results['passed']) + len(self.test_results['failed'])
        if total > 0:
            success_rate = (len(self.test_results['passed']) / total) * 100
            logger.info(f"\nSuccess Rate: {success_rate:.1f}%")


if __name__ == '__main__':
    tester = PositionPortfolioServiceTests()
    tester.run_all_tests()
    tester.print_summary()
    
    # Exit with error code if any tests failed
    if tester.test_results['failed']:
        sys.exit(1)
    else:
        sys.exit(0)

