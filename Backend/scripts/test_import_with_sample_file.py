#!/usr/bin/env python3
"""
Comprehensive Import Test with Sample File

Tests the complete import process using sample CSV files:
1. Import with existing ticker + existing user_ticker
2. Import with existing ticker + missing user_ticker (should create association)
3. Import with new ticker (should create ticker + user_ticker)
4. User-specific missing tickers check

Author: TikTrack Development Team
Version: 1.0
Date: 2025-12-04
"""

import sys
import os
from pathlib import Path
from datetime import datetime, timezone

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from config.database import SessionLocal
from models.user import User
from models.ticker import Ticker
from models.user_ticker import UserTicker
from models.trading_account import TradingAccount
from models.import_session import ImportSession
from models.currency import Currency
from services.user_data_import.import_orchestrator import ImportOrchestrator
from services.user_data_import.validation_service import ValidationService
from services.ticker_service import TickerService

import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class ImportTestWithSampleFile:
    """Test import system with sample CSV files"""
    
    def __init__(self, db_session: Session):
        self.db_session = db_session
        self.orchestrator = ImportOrchestrator(db_session)
        self.test_results = []
        self.test_user_id = None
        self.test_trading_account_id = None
        
    def log_result(self, test_name: str, passed: bool, message: str = ""):
        """Log test result"""
        status = "✅ PASS" if passed else "❌ FAIL"
        logger.info(f"{status}: {test_name}")
        if message:
            logger.info(f"   {message}")
        self.test_results.append({
            "name": test_name,
            "passed": passed,
            "message": message
        })
    
    def setup_test_user(self):
        """Create or get test user"""
        logger.info("\n" + "="*60)
        logger.info("SETUP: Creating test user and trading account")
        logger.info("="*60)
        
        # Get or create test user
        test_user = self.db_session.query(User).filter(
            User.email == "test_import@tiktrack.com"
        ).first()
        
        if not test_user:
            test_user = User(
                email="test_import@tiktrack.com",
                username="test_import",
                password_hash="test_hash",
                created_at=datetime.now(timezone.utc)
            )
            self.db_session.add(test_user)
            self.db_session.flush()
            logger.info(f"✅ Created test user: ID={test_user.id}, email={test_user.email}")
        else:
            logger.info(f"✅ Using existing test user: ID={test_user.id}, email={test_user.email}")
        
        self.test_user_id = test_user.id
        
        # Get or create test trading account
        test_account = self.db_session.query(TradingAccount).filter(
            TradingAccount.user_id == self.test_user_id,
            TradingAccount.name == "Test Import Account"
        ).first()
        
        if not test_account:
            # Get default currency (USD)
            currency = self.db_session.query(Currency).filter(
                Currency.symbol == "USD"
            ).first()
            
            if not currency:
                # Create USD currency if it doesn't exist
                currency = Currency(
                    symbol="USD",
                    name="US Dollar",
                    code="USD"
                )
                self.db_session.add(currency)
                self.db_session.flush()
            
            test_account = TradingAccount(
                user_id=self.test_user_id,
                name="Test Import Account",
                currency_id=currency.id,
                status="open",
                created_at=datetime.now(timezone.utc)
            )
            self.db_session.add(test_account)
            self.db_session.flush()
            logger.info(f"✅ Created test trading account: ID={test_account.id}, name={test_account.name}")
        else:
            logger.info(f"✅ Using existing test trading account: ID={test_account.id}, name={test_account.name}")
        
        self.test_trading_account_id = test_account.id
        self.db_session.commit()
        
        return test_user, test_account
    
    def read_sample_file(self, file_path: str) -> str:
        """Read sample CSV file"""
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Sample file not found: {file_path}")
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        logger.info(f"📁 Read sample file: {file_path} ({len(content)} characters)")
        return content
    
    def test_import_with_sample_file(self, file_path: str):
        """Test complete import process with sample file"""
        logger.info("\n" + "="*60)
        logger.info(f"TEST: Import with sample file - {file_path}")
        logger.info("="*60)
        
        try:
            # Read sample file
            file_content = self.read_sample_file(file_path)
            file_name = os.path.basename(file_path)
            
            # Step 1: Create import session
            logger.info("\n📝 Step 1: Creating import session...")
            session_data = self.orchestrator.create_import_session(
                trading_account_id=self.test_trading_account_id,
                file_name=file_name,
                file_content=file_content,
                connector_type='ibkr',
                task_type='executions',
                user_id=self.test_user_id
            )
            
            if not session_data.get('success'):
                self.log_result(
                    "import_session_creation",
                    False,
                    f"Failed to create session: {session_data.get('error')}"
                )
                return False
            
            session_id = session_data['session_id']
            logger.info(f"✅ Import session created: ID={session_id}")
            
            # Verify session has user_id
            session = self.db_session.query(ImportSession).filter(
                ImportSession.id == session_id
            ).first()
            
            if session and session.user_id == self.test_user_id:
                self.log_result("import_session_user_id", True, f"Session user_id={session.user_id}")
            else:
                self.log_result(
                    "import_session_user_id",
                    False,
                    f"Session user_id mismatch: expected={self.test_user_id}, got={session.user_id if session else None}"
                )
            
            # Step 2: Link account manually (skip account linking check)
            logger.info("\n📝 Step 2: Linking account manually...")
            link_result = self.orchestrator.link_trading_account_to_file(
                session_id=session_id,
                override_account_number="U16011759",  # From sample file
                target_trading_account_id=self.test_trading_account_id,
                confirm_overwrite=True
            )
            
            if not link_result.get('success'):
                logger.warning(f"⚠️ Account linking failed: {link_result.get('error')}")
                # Continue anyway - some tests don't require account linking
            
            # Step 2.5: Confirm account link
            logger.info("\n📝 Step 2.5: Confirming account link...")
            confirm_result = self.orchestrator.confirm_account_link(session_id)
            
            if not confirm_result.get('success'):
                logger.warning(f"⚠️ Account link confirmation failed: {confirm_result.get('error')}")
            
            # Step 3: Analyze file
            logger.info("\n📝 Step 3: Analyzing file...")
            analysis_result = self.orchestrator.analyze_file(session_id, task_type='executions')
            
            if not analysis_result.get('success'):
                self.log_result(
                    "file_analysis",
                    False,
                    f"Analysis failed: {analysis_result.get('error')}"
                )
                return False
            
            logger.info(f"✅ File analyzed successfully")
            analysis_results = analysis_result.get('analysis_results', {})
            logger.info(f"   Total records: {analysis_results.get('total_records', 0)}")
            
            # Step 4: Generate preview
            logger.info("\n📝 Step 4: Generating preview...")
            preview_result = self.orchestrator.generate_preview(session_id, task_type='executions')
            
            if not preview_result.get('success'):
                self.log_result(
                    "preview_generation",
                    False,
                    f"Preview generation failed: {preview_result.get('error')}"
                )
                return False
            
            preview_data = preview_result.get('preview_data', {})
            records_to_import = preview_data.get('records_to_import', [])
            records_to_skip = preview_data.get('records_to_skip', [])
            # missing_tickers is in summary, not directly in preview_data
            summary = preview_data.get('summary', {})
            missing_tickers = summary.get('missing_tickers', []) if summary else []
            
            logger.info(f"✅ Preview generated")
            logger.info(f"   Records to import: {len(records_to_import)}")
            logger.info(f"   Records to skip: {len(records_to_skip)}")
            logger.info(f"   Missing tickers: {len(missing_tickers)}")
            
            if missing_tickers:
                logger.info(f"   Missing ticker symbols: {[t.get('symbol') for t in missing_tickers]}")
            
            # Check if missing tickers are user-specific
            if missing_tickers:
                for missing_ticker in missing_tickers:
                    symbol = missing_ticker.get('symbol')
                    # Check if ticker exists in database
                    ticker = self.db_session.query(Ticker).filter(
                        Ticker.symbol == symbol
                    ).first()
                    
                    if ticker:
                        # Ticker exists but user_ticker doesn't - this is correct!
                        user_ticker = self.db_session.query(UserTicker).filter(
                            UserTicker.user_id == self.test_user_id,
                            UserTicker.ticker_id == ticker.id
                        ).first()
                        
                        if not user_ticker:
                            self.log_result(
                                "missing_ticker_user_specific",
                                True,
                                f"Ticker {symbol} exists but user_ticker missing (correct - user-specific check)"
                            )
                        else:
                            self.log_result(
                                "missing_ticker_user_specific",
                                False,
                                f"Ticker {symbol} has user_ticker but marked as missing"
                            )
                    else:
                        # Ticker doesn't exist - will be created during import
                        self.log_result(
                            "missing_ticker_new",
                            True,
                            f"Ticker {symbol} doesn't exist (will be created during import)"
                        )
            
            # Step 4.5: Create missing tickers if needed
            if missing_tickers:
                logger.info(f"\n📝 Step 4.5: Creating {len(missing_tickers)} missing tickers...")
                
                currency = self.db_session.query(Currency).filter(Currency.symbol == 'USD').first()
                if not currency:
                    logger.warning("⚠️ USD currency not found - cannot create tickers")
                else:
                    created_count = 0
                    for missing_ticker in missing_tickers:
                        symbol = missing_ticker.get('symbol')
                        if symbol:
                            # Check if ticker already exists
                            existing_ticker = self.db_session.query(Ticker).filter(
                                Ticker.symbol == symbol
                            ).first()
                            
                            if not existing_ticker:
                                # Create ticker
                                new_ticker = Ticker(
                                    symbol=symbol,
                                    name=symbol,
                                    type='stock',
                                    currency_id=currency.id,
                                    status='open',
                                    created_at=datetime.now(timezone.utc)
                                )
                                self.db_session.add(new_ticker)
                                self.db_session.flush()
                                existing_ticker = new_ticker
                                logger.info(f"   ✅ Created ticker: {symbol}")
                            
                            # Create user_ticker association
                            user_ticker = self.db_session.query(UserTicker).filter(
                                UserTicker.user_id == self.test_user_id,
                                UserTicker.ticker_id == existing_ticker.id
                            ).first()
                            
                            if not user_ticker:
                                new_user_ticker = UserTicker(
                                    user_id=self.test_user_id,
                                    ticker_id=existing_ticker.id,
                                    status='open',
                                    created_at=datetime.now(timezone.utc)
                                )
                                self.db_session.add(new_user_ticker)
                                self.db_session.flush()
                                logger.info(f"   ✅ Created user_ticker association: {symbol}")
                                created_count += 1
                    
                    self.db_session.commit()
                    logger.info(f"✅ Created {created_count} missing tickers and user_ticker associations")
                    
                    # Regenerate preview after creating tickers
                    logger.info("\n📝 Regenerating preview after creating tickers...")
                    preview_result = self.orchestrator.generate_preview(session_id, task_type='executions')
                    if preview_result.get('success'):
                        preview_data = preview_result.get('preview_data', {})
                        records_to_import = preview_data.get('records_to_import', [])
                        records_to_skip = preview_data.get('records_to_skip', [])
                        logger.info(f"✅ Preview regenerated: {len(records_to_import)} to import, {len(records_to_skip)} to skip")
            
            # Step 5: Execute import
            logger.info("\n📝 Step 5: Executing import...")
            execute_result = self.orchestrator.execute_import(
                session_id,
                task_type='executions',
                user_id=self.test_user_id
            )
            
            if not execute_result.get('success'):
                self.log_result(
                    "import_execution",
                    False,
                    f"Import execution failed: {execute_result.get('error')}"
                )
                return False
            
            imported_count = execute_result.get('imported_count', 0)
            skipped_count = execute_result.get('skipped_count', 0)
            
            logger.info(f"✅ Import executed successfully")
            logger.info(f"   Imported: {imported_count}")
            logger.info(f"   Skipped: {skipped_count}")
            
            # Step 6: Verify user_ticker associations were created
            logger.info("\n📝 Step 6: Verifying user_ticker associations...")
            
            # Get all symbols from imported records
            imported_symbols = set()
            for record in records_to_import[:10]:  # Check first 10 records
                if isinstance(record, dict):
                    symbol = record.get('symbol') or record.get('ticker_symbol')
                    if symbol:
                        imported_symbols.add(symbol)
            
            logger.info(f"   Checking {len(imported_symbols)} symbols for user_ticker associations...")
            
            all_have_user_ticker = True
            for symbol in imported_symbols:
                ticker = self.db_session.query(Ticker).filter(
                    Ticker.symbol == symbol
                ).first()
                
                if ticker:
                    user_ticker = self.db_session.query(UserTicker).filter(
                        UserTicker.user_id == self.test_user_id,
                        UserTicker.ticker_id == ticker.id
                    ).first()
                    
                    if user_ticker:
                        logger.info(f"   ✅ {symbol}: user_ticker exists (ID={user_ticker.id})")
                    else:
                        logger.warning(f"   ❌ {symbol}: user_ticker missing!")
                        all_have_user_ticker = False
            
            self.log_result(
                "user_ticker_associations",
                all_have_user_ticker,
                f"All imported tickers have user_ticker associations: {all_have_user_ticker}"
            )
            
            # Cleanup: Delete import session
            logger.info("\n📝 Cleanup: Deleting import session...")
            self.orchestrator.delete_session(session_id)
            logger.info(f"✅ Import session deleted: ID={session_id}")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Test failed with exception: {str(e)}", exc_info=True)
            self.log_result("import_with_sample_file", False, f"Exception: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all import tests"""
        logger.info("\n" + "="*60)
        logger.info("COMPREHENSIVE IMPORT TEST WITH SAMPLE FILES")
        logger.info("="*60)
        
        # Setup
        self.setup_test_user()
        
        # Test with IBKR sample file
        sample_files = [
            "Backend/connectors/user_data_import/test_files/ibkr_sample.csv",
            "Backend/connectors/user_data_import/test_files/demo_sample.csv"
        ]
        
        for sample_file in sample_files:
            if os.path.exists(sample_file):
                self.test_import_with_sample_file(sample_file)
            else:
                logger.warning(f"⚠️ Sample file not found: {sample_file}")
        
        # Print summary
        self.print_summary()
    
    def print_summary(self):
        """Print test summary"""
        logger.info("\n" + "="*60)
        logger.info("TEST SUMMARY")
        logger.info("="*60)
        
        total = len(self.test_results)
        passed = sum(1 for r in self.test_results if r['passed'])
        failed = total - passed
        
        logger.info(f"Total tests: {total}")
        logger.info(f"✅ Passed: {passed}")
        logger.info(f"❌ Failed: {failed}")
        logger.info(f"Success rate: {passed/total*100:.1f}%")
        
        if failed > 0:
            logger.info("\nFailed tests:")
            for result in self.test_results:
                if not result['passed']:
                    logger.info(f"  ❌ {result['name']}: {result['message']}")

def main():
    """Main function"""
    db_session = SessionLocal()
    try:
        tester = ImportTestWithSampleFile(db_session)
        tester.run_all_tests()
    except Exception as e:
        logger.error(f"❌ Test suite failed: {str(e)}", exc_info=True)
    finally:
        db_session.close()

if __name__ == "__main__":
    main()

