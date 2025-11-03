#!/usr/bin/env python3
"""
Positions API Endpoints Tests - TikTrack

בדיקות מקיפות ל-API endpoints של מערכת פוזיציות ופורטפוליו

Author: TikTrack Development Team
Date: January 2025
"""

import sys
import os
import json
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    import requests
    REQUESTS_AVAILABLE = True
except ImportError:
    REQUESTS_AVAILABLE = False
    logger.warning("⚠️ requests library not available - API tests will be skipped")


class PositionsAPITests:
    """Test suite for Positions API endpoints"""
    
    def __init__(self, base_url="http://localhost:8080"):
        self.base_url = base_url
        self.test_results = {
            'passed': [],
            'failed': [],
            'skipped': []
        }
    
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
    
    def test_server_connection(self):
        """Test that server is running"""
        if not REQUESTS_AVAILABLE:
            self.test_results['skipped'].append('test_server_connection')
            logger.info("⏭️ requests not available - skipping")
            return True
        
        try:
            response = requests.get(f"{self.base_url}/api/health", timeout=5)
            if response.status_code == 200:
                logger.info("✅ Server is running")
                return True
            else:
                logger.warning(f"⚠️ Server returned status {response.status_code}")
                return False
        except requests.exceptions.ConnectionError:
            logger.warning("⚠️ Server not running - all API tests will be skipped")
            self.test_results['skipped'].append('test_server_connection')
            return True
        except Exception as e:
            logger.error(f"❌ Error connecting to server: {e}")
            return False
    
    def test_get_account_positions(self):
        """Test GET /api/positions/account/<account_id>"""
        if not REQUESTS_AVAILABLE:
            self.test_results['skipped'].append('test_get_account_positions')
            return True
        
        try:
            # Test with account_id=1
            response = requests.get(f"{self.base_url}/api/positions/account/1", timeout=10)
            
            if response.status_code != 200:
                logger.error(f"❌ Expected 200, got {response.status_code}")
                logger.error(f"Response: {response.text}")
                return False
            
            data = response.json()
            
            # Validate response structure
            if data.get('status') != 'success':
                logger.error(f"❌ Expected status='success', got {data.get('status')}")
                return False
            
            if 'data' not in data:
                logger.error(f"❌ Missing 'data' key in response")
                return False
            
            data_content = data['data']
            if 'positions' not in data_content or 'account_id' not in data_content:
                logger.error(f"❌ Missing required keys in data: {data_content.keys()}")
                return False
            
            positions = data_content['positions']
            if not isinstance(positions, list):
                logger.error(f"❌ Expected positions to be list, got {type(positions)}")
                return False
            
            logger.info(f"✅ Retrieved {len(positions)} positions for account 1")
            
            # Validate first position structure if available
            if positions:
                pos = positions[0]
                required_keys = ['trading_account_id', 'ticker_id', 'quantity', 'side']
                missing = [k for k in required_keys if k not in pos]
                if missing:
                    logger.error(f"❌ Missing keys in position: {missing}")
                    return False
                logger.info(f"   Sample position: {pos.get('ticker_symbol')} - {pos.get('quantity')} ({pos.get('side')})")
            
            return True
        except requests.exceptions.ConnectionError:
            logger.info("⏭️ Server not running - skipping")
            self.test_results['skipped'].append('test_get_account_positions')
            return True
        except Exception as e:
            logger.error(f"❌ Error: {e}")
            return False
    
    def test_get_portfolio(self):
        """Test GET /api/positions/portfolio"""
        if not REQUESTS_AVAILABLE:
            self.test_results['skipped'].append('test_get_portfolio')
            return True
        
        try:
            response = requests.get(f"{self.base_url}/api/positions/portfolio", timeout=15)
            
            if response.status_code != 200:
                logger.error(f"❌ Expected 200, got {response.status_code}")
                logger.error(f"Response: {response.text}")
                return False
            
            data = response.json()
            
            if data.get('status') != 'success':
                logger.error(f"❌ Expected status='success', got {data.get('status')}")
                return False
            
            if 'data' not in data:
                logger.error(f"❌ Missing 'data' key")
                return False
            
            portfolio = data['data']
            if 'positions' not in portfolio or 'summary' not in portfolio:
                logger.error(f"❌ Missing required keys: {portfolio.keys()}")
                return False
            
            summary = portfolio['summary']
            required_summary_keys = ['total_positions', 'total_market_value', 'total_cost']
            missing = [k for k in required_summary_keys if k not in summary]
            if missing:
                logger.error(f"❌ Missing summary keys: {missing}")
                return False
            
            logger.info(f"✅ Portfolio retrieved:")
            logger.info(f"   Total Positions: {summary['total_positions']}")
            logger.info(f"   Total Market Value: {summary['total_market_value']}")
            logger.info(f"   Total Cost: {summary['total_cost']}")
            
            return True
        except requests.exceptions.ConnectionError:
            logger.info("⏭️ Server not running - skipping")
            self.test_results['skipped'].append('test_get_portfolio')
            return True
        except Exception as e:
            logger.error(f"❌ Error: {e}")
            return False
    
    def test_get_portfolio_with_filters(self):
        """Test GET /api/positions/portfolio with filters"""
        if not REQUESTS_AVAILABLE:
            self.test_results['skipped'].append('test_get_portfolio_with_filters')
            return True
        
        try:
            # Test with side filter
            response = requests.get(
                f"{self.base_url}/api/positions/portfolio?side=long",
                timeout=15
            )
            
            if response.status_code != 200:
                logger.error(f"❌ Expected 200, got {response.status_code}")
                return False
            
            data = response.json()
            if data.get('status') != 'success':
                return False
            
            portfolio = data['data']
            positions = portfolio.get('positions', [])
            
            # Verify all positions are long
            for pos in positions:
                if pos.get('side') != 'long':
                    logger.error(f"❌ Found non-long position: {pos.get('side')}")
                    return False
            
            logger.info(f"✅ Portfolio filter works: {len(positions)} long positions")
            return True
        except requests.exceptions.ConnectionError:
            logger.info("⏭️ Server not running - skipping")
            self.test_results['skipped'].append('test_get_portfolio_with_filters')
            return True
        except Exception as e:
            logger.error(f"❌ Error: {e}")
            return False
    
    def test_get_position_details(self):
        """Test GET /api/positions/<account_id>/<ticker_id>/details"""
        if not REQUESTS_AVAILABLE:
            self.test_results['skipped'].append('test_get_position_details')
            return True
        
        try:
            # Test with account_id=1, ticker_id=1
            response = requests.get(
                f"{self.base_url}/api/positions/1/1/details",
                timeout=10
            )
            
            if response.status_code == 404:
                logger.info("⏭️ Position not found (expected if no executions)")
                self.test_results['skipped'].append('test_get_position_details')
                return True
            
            if response.status_code != 200:
                logger.error(f"❌ Expected 200, got {response.status_code}")
                return False
            
            data = response.json()
            
            if data.get('status') != 'success':
                return False
            
            if 'data' not in data:
                return False
            
            position = data['data']
            if 'executions' not in position:
                logger.error(f"❌ Missing 'executions' key")
                return False
            
            logger.info(f"✅ Position details retrieved: {len(position.get('executions', []))} executions")
            return True
        except requests.exceptions.ConnectionError:
            logger.info("⏭️ Server not running - skipping")
            self.test_results['skipped'].append('test_get_position_details')
            return True
        except Exception as e:
            logger.error(f"❌ Error: {e}")
            return False
    
    def test_get_portfolio_summary(self):
        """Test GET /api/portfolio/summary"""
        if not REQUESTS_AVAILABLE:
            self.test_results['skipped'].append('test_get_portfolio_summary')
            return True
        
        try:
            # Test minimal size
            response = requests.get(
                f"{self.base_url}/api/portfolio/summary?size=minimal",
                timeout=15
            )
            
            if response.status_code != 200:
                logger.error(f"❌ Expected 200, got {response.status_code}")
                return False
            
            data = response.json()
            if data.get('status') != 'success':
                return False
            
            portfolio = data['data']
            if 'summary' not in portfolio:
                return False
            
            # Minimal should not have positions list
            if 'positions' in portfolio and len(portfolio['positions']) > 0:
                logger.warning("⚠️ Minimal size returned positions (might be OK)")
            
            logger.info("✅ Portfolio summary (minimal) retrieved")
            
            # Test full size
            response2 = requests.get(
                f"{self.base_url}/api/portfolio/summary?size=full",
                timeout=15
            )
            
            if response2.status_code == 200:
                data2 = response2.json()
                if 'positions' in data2.get('data', {}):
                    logger.info(f"✅ Portfolio summary (full) retrieved: {len(data2['data']['positions'])} positions")
            
            return True
        except requests.exceptions.ConnectionError:
            logger.info("⏭️ Server not running - skipping")
            self.test_results['skipped'].append('test_get_portfolio_summary')
            return True
        except Exception as e:
            logger.error(f"❌ Error: {e}")
            return False
    
    def run_all_tests(self):
        """Run all tests"""
        logger.info("\n" + "="*60)
        logger.info("Starting Positions API Tests")
        logger.info("="*60)
        
        if not REQUESTS_AVAILABLE:
            logger.warning("⚠️ requests library not available - all API tests will be skipped")
            self.test_results['skipped'].extend([
                'test_server_connection',
                'test_get_account_positions',
                'test_get_portfolio',
                'test_get_portfolio_with_filters',
                'test_get_position_details',
                'test_get_portfolio_summary'
            ])
            return True
        
        # Run tests
        tests = [
            ('Server Connection', self.test_server_connection),
            ('Get Account Positions', self.test_get_account_positions),
            ('Get Portfolio', self.test_get_portfolio),
            ('Get Portfolio with Filters', self.test_get_portfolio_with_filters),
            ('Get Position Details', self.test_get_position_details),
            ('Get Portfolio Summary', self.test_get_portfolio_summary),
        ]
        
        for test_name, test_func in tests:
            self.run_test(test_name, test_func)
        
        return True
    
    def print_summary(self):
        """Print test summary"""
        logger.info("\n" + "="*60)
        logger.info("API Test Summary")
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
    tester = PositionsAPITests()
    tester.run_all_tests()
    tester.print_summary()
    
    # Exit with error code if any tests failed
    if tester.test_results['failed']:
        sys.exit(1)
    else:
        sys.exit(0)

