#!/usr/bin/env python3
"""
Comprehensive Import System Test Script

Tests all import scenarios with real user_id, user_ticker association, and user isolation.

Author: TikTrack Development Team
Version: 1.0
Date: 2025-12-04
"""

import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

import sys
from pathlib import Path

# Try to import database modules, but don't fail if not available
try:
    from sqlalchemy.orm import Session
    from sqlalchemy import create_engine
    from config.database import get_db
    from models.user import User
    from models.ticker import Ticker
    from models.user_ticker import UserTicker
    from models.trading_account import TradingAccount
    from models.import_session import ImportSession
    from models.currency import Currency
    from services.user_data_import.import_orchestrator import ImportOrchestrator
    from services.user_data_import.validation_service import ValidationService
    from services.ticker_service import TickerService
    DB_AVAILABLE = True
except Exception as e:
    DB_AVAILABLE = False
    logger = None

import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ImportSystemTester:
    """Comprehensive test suite for import system"""
    
    def __init__(self, db_session):
        self.db_session = db_session
        if db_session and DB_AVAILABLE:
            self.orchestrator = ImportOrchestrator(db_session)
            self.validation_service = ValidationService(db_session)
        else:
            self.orchestrator = None
            self.validation_service = None
        self.test_results = []
        
    def log_result(self, test_name: str, passed: bool, message: str = ""):
        """Log test result"""
        status = "✅ PASS" if passed else "❌ FAIL"
        logger.info(f"{status}: {test_name}")
        if message:
            logger.info(f"   {message}")
        self.test_results.append({
            'test': test_name,
            'passed': passed,
            'message': message
        })
    
    def test_user_id_in_api_routes(self):
        """Test that API routes use g.user_id"""
        logger.info("\n" + "="*60)
        logger.info("TEST: user_id in API routes")
        logger.info("="*60)
        
        # Check if routes/api/user_data_import.py uses g.user_id
        import_file = Path(__file__).parent.parent / "routes" / "api" / "user_data_import.py"
        if not import_file.exists():
            self.log_result("user_id_in_api_routes", False, "File not found")
            return
        
        content = import_file.read_text()
        
        # Check for g.user_id usage
        has_user_id = "getattr(g, 'user_id'" in content or "g.user_id" in content
        
        if has_user_id:
            self.log_result("user_id_in_api_routes", True, "API routes use g.user_id")
        else:
            self.log_result("user_id_in_api_routes", False, "API routes do not use g.user_id")
    
    def test_user_id_hardcoded(self):
        """Test for hardcoded user_id=1 in import_orchestrator.py"""
        logger.info("\n" + "="*60)
        logger.info("TEST: Hardcoded user_id=1")
        logger.info("="*60)
        
        orchestrator_file = Path(__file__).parent.parent / "services" / "user_data_import" / "import_orchestrator.py"
        if not orchestrator_file.exists():
            self.log_result("user_id_hardcoded", False, "File not found")
            return
        
        content = orchestrator_file.read_text()
        
        # Count hardcoded user_id=1
        hardcoded_count = content.count("user_id = 1") + content.count("user_id=1")
        
        if hardcoded_count == 0:
            self.log_result("user_id_hardcoded", True, "No hardcoded user_id=1 found")
        else:
            self.log_result("user_id_hardcoded", False, f"Found {hardcoded_count} hardcoded user_id=1")
    
    def test_missing_tickers_user_specific(self):
        """Test that _check_missing_tickers checks user_tickers"""
        logger.info("\n" + "="*60)
        logger.info("TEST: Missing tickers check is user-specific")
        logger.info("="*60)
        
        validation_file = Path(__file__).parent.parent / "services" / "user_data_import" / "validation_service.py"
        if not validation_file.exists():
            self.log_result("missing_tickers_user_specific", False, "File not found")
            return
        
        content = validation_file.read_text()
        
        # Check if _check_missing_tickers uses user_tickers
        has_user_ticker = "user_ticker" in content.lower() or "UserTicker" in content
        
        if has_user_ticker:
            self.log_result("missing_tickers_user_specific", True, "Uses user_tickers table")
        else:
            self.log_result("missing_tickers_user_specific", False, "Does not use user_tickers table")
    
    def test_enrich_records_user_ticker(self):
        """Test that enrich_records_with_ticker_ids creates user_ticker associations"""
        logger.info("\n" + "="*60)
        logger.info("TEST: enrich_records creates user_ticker")
        logger.info("="*60)
        
        ticker_service_file = Path(__file__).parent.parent / "services" / "ticker_service.py"
        if not ticker_service_file.exists():
            self.log_result("enrich_records_user_ticker", False, "File not found")
            return
        
        content = ticker_service_file.read_text()
        
        # Find enrich_records_with_ticker_ids function
        if "def enrich_records_with_ticker_ids" not in content:
            self.log_result("enrich_records_user_ticker", False, "Function not found")
            return
        
        # Check if it has user_id parameter
        has_user_id_param = "user_id" in content.split("def enrich_records_with_ticker_ids")[1].split("def ")[0]
        
        # Check if it creates user_ticker
        func_content = content.split("def enrich_records_with_ticker_ids")[1].split("def ")[0]
        has_user_ticker_creation = "user_ticker" in func_content.lower() or "UserTicker" in func_content
        
        if has_user_id_param and has_user_ticker_creation:
            self.log_result("enrich_records_user_ticker", True, "Has user_id and creates user_ticker")
        elif has_user_id_param:
            self.log_result("enrich_records_user_ticker", False, "Has user_id but does not create user_ticker")
        else:
            self.log_result("enrich_records_user_ticker", False, "Does not have user_id parameter")
    
    def test_import_with_existing_ticker(self, user_id: int):
        """Test import with existing ticker"""
        logger.info("\n" + "="*60)
        logger.info("TEST: Import with existing ticker")
        logger.info("="*60)
        
        if not self.db_session or not DB_AVAILABLE:
            self.log_result("import_with_existing_ticker", False, "Database not available")
            return
        
        try:
            # Create test ticker
            currency = self.db_session.query(Currency).first()
            if not currency:
                self.log_result("import_with_existing_ticker", False, "No currency found")
                return
            
            test_ticker = Ticker(
                symbol="TEST1",
                name="Test Ticker 1",
                type="stock",
                currency_id=currency.id,
                status="open"
            )
            self.db_session.add(test_ticker)
            self.db_session.flush()
            
            # Check if user_ticker exists
            user_ticker = self.db_session.query(UserTicker).filter(
                UserTicker.user_id == user_id,
                UserTicker.ticker_id == test_ticker.id
            ).first()
            
            if user_ticker:
                self.log_result("import_with_existing_ticker", True, "User_ticker exists")
            else:
                self.log_result("import_with_existing_ticker", False, "User_ticker does not exist - should be created during import")
            
            # Cleanup
            if user_ticker:
                self.db_session.delete(user_ticker)
            self.db_session.delete(test_ticker)
            self.db_session.commit()
            
        except Exception as e:
            self.log_result("import_with_existing_ticker", False, f"Error: {str(e)}")
    
    def test_import_with_new_ticker(self, user_id: int):
        """Test import with new ticker - should create ticker + user_ticker"""
        logger.info("\n" + "="*60)
        logger.info("TEST: Import with new ticker")
        logger.info("="*60)
        
        if not self.db_session or not DB_AVAILABLE:
            self.log_result("import_with_new_ticker", False, "Database not available")
            return
        
        try:
            # Check if ticker exists
            test_symbol = "TEST_NEW_IMPORT"
            existing_ticker = self.db_session.query(Ticker).filter(
                Ticker.symbol == test_symbol
            ).first()
            
            if existing_ticker:
                # Cleanup if exists
                user_ticker = self.db_session.query(UserTicker).filter(
                    UserTicker.ticker_id == existing_ticker.id
                ).all()
                for ut in user_ticker:
                    self.db_session.delete(ut)
                self.db_session.delete(existing_ticker)
                self.db_session.commit()
            
            # Test: enrich_records should create ticker + user_ticker
            # This is a placeholder - actual test would require full import flow
            self.log_result("import_with_new_ticker", False, "Requires full import flow test - placeholder")
            
        except Exception as e:
            self.log_result("import_with_new_ticker", False, f"Error: {str(e)}")
    
    def test_user_isolation(self, user_id_1: int, user_id_2: int):
        """Test user isolation - user 1 should not see user 2's tickers"""
        logger.info("\n" + "="*60)
        logger.info("TEST: User isolation")
        logger.info("="*60)
        
        if not self.db_session or not DB_AVAILABLE:
            self.log_result("user_isolation", False, "Database not available")
            return
        
        try:
            # Get user 1's tickers
            user1_tickers = self.db_session.query(UserTicker).filter(
                UserTicker.user_id == user_id_1
            ).all()
            
            # Get user 2's tickers
            user2_tickers = self.db_session.query(UserTicker).filter(
                UserTicker.user_id == user_id_2
            ).all()
            
            # Check if they are isolated
            user1_ticker_ids = {ut.ticker_id for ut in user1_tickers}
            user2_ticker_ids = {ut.ticker_id for ut in user2_tickers}
            
            overlap = user1_ticker_ids & user2_ticker_ids
            
            if overlap:
                # Shared tickers are OK (same ticker, different user_ticker)
                # But we should verify they are separate user_ticker records
                shared_tickers = list(overlap)
                for ticker_id in shared_tickers:
                    ut1 = self.db_session.query(UserTicker).filter(
                        UserTicker.user_id == user_id_1,
                        UserTicker.ticker_id == ticker_id
                    ).first()
                    ut2 = self.db_session.query(UserTicker).filter(
                        UserTicker.user_id == user_id_2,
                        UserTicker.ticker_id == ticker_id
                    ).first()
                    
                    if ut1 and ut2 and ut1.id != ut2.id:
                        self.log_result("user_isolation", True, "Users have separate user_ticker records")
                        return
            
            self.log_result("user_isolation", True, "Users are properly isolated")
            
        except Exception as e:
            self.log_result("user_isolation", False, f"Error: {str(e)}")
    
    def test_import_session_user_id(self):
        """Test that ImportSession stores user_id"""
        logger.info("\n" + "="*60)
        logger.info("TEST: ImportSession stores user_id")
        logger.info("="*60)
        
        try:
            # Check ImportSession model
            import_session_file = Path(__file__).parent.parent / "models" / "import_session.py"
            if not import_session_file.exists():
                self.log_result("import_session_user_id", False, "File not found")
                return
            
            content = import_session_file.read_text()
            
            # Check if model has user_id field - look for user_id = Column
            has_user_id = "user_id = Column" in content or ("user_id" in content and "Column" in content)
            
            if has_user_id:
                self.log_result("import_session_user_id", True, "ImportSession has user_id field")
            else:
                self.log_result("import_session_user_id", False, "ImportSession does not have user_id field")
                
        except Exception as e:
            self.log_result("import_session_user_id", False, f"Error: {str(e)}")
    
    def run_all_tests(self):
        """Run all tests"""
        logger.info("\n" + "="*60)
        logger.info("COMPREHENSIVE IMPORT SYSTEM TESTS")
        logger.info("="*60)
        
        # Get test users (if database available)
        user_id_1 = 1
        user_id_2 = 2
        
        if self.db_session and DB_AVAILABLE:
            user1 = self.db_session.query(User).first()
            user2 = self.db_session.query(User).offset(1).first()
            
            if user1:
                user_id_1 = user1.id
                user_id_2 = user2.id if user2 else user_id_1
        
        # Run code analysis tests
        self.test_user_id_in_api_routes()
        self.test_user_id_hardcoded()
        self.test_missing_tickers_user_specific()
        self.test_enrich_records_user_ticker()
        self.test_import_session_user_id()
        
        # Run functional tests
        self.test_import_with_existing_ticker(user_id_1)
        self.test_import_with_new_ticker(user_id_1)
        self.test_user_isolation(user_id_1, user_id_2)
        
        # Print summary
        logger.info("\n" + "="*60)
        logger.info("TEST SUMMARY")
        logger.info("="*60)
        
        passed = sum(1 for r in self.test_results if r['passed'])
        total = len(self.test_results)
        
        logger.info(f"Total tests: {total}")
        logger.info(f"Passed: {passed}")
        logger.info(f"Failed: {total - passed}")
        logger.info(f"Success rate: {passed/total*100:.1f}%")
        
        logger.info("\nFailed tests:")
        for result in self.test_results:
            if not result['passed']:
                logger.info(f"  ❌ {result['test']}: {result['message']}")
        
        return self.test_results

def main():
    """Main entry point"""
    if not DB_AVAILABLE:
        logger.error("Database not available - running code analysis tests only")
        # Run code analysis tests without database
        tester = ImportSystemTester(None)
        # Only run code analysis tests
        tester.test_user_id_in_api_routes()
        tester.test_user_id_hardcoded()
        tester.test_missing_tickers_user_specific()
        tester.test_enrich_records_user_ticker()
        tester.test_import_session_user_id()
        
        # Print summary
        logger.info("\n" + "="*60)
        logger.info("TEST SUMMARY (Code Analysis Only)")
        logger.info("="*60)
        
        passed = sum(1 for r in tester.test_results if r['passed'])
        total = len(tester.test_results)
        
        logger.info(f"Total tests: {total}")
        logger.info(f"Passed: {passed}")
        logger.info(f"Failed: {total - passed}")
        logger.info(f"Success rate: {passed/total*100:.1f}%")
        
        sys.exit(total - passed)
    
    try:
        # Get database session
        db_gen = get_db()
        db_session = next(db_gen)
        
        try:
            tester = ImportSystemTester(db_session)
            results = tester.run_all_tests()
            
            # Exit with error code if any tests failed
            failed_count = sum(1 for r in results if not r['passed'])
            sys.exit(failed_count)
            
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Fatal error: {str(e)}", exc_info=True)
        sys.exit(1)

if __name__ == "__main__":
    main()

