#!/usr/bin/env python3
"""
Comprehensive Test Suite for User Data Import System
====================================================

This test suite covers all aspects of the user data import system:
- Backend models and services
- Connectors (IBKR, Demo)
- API endpoints
- Integration flows
- Edge cases and performance

Author: TikTrack Development Team
Version: 1.0
Date: 2025-01-16
"""

import os
import sys
import json
import tempfile
import unittest
from datetime import datetime, timedelta
from unittest.mock import patch, MagicMock

# Add the Backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

# Import Flask app and database
from app import app, db
from models.import_session import ImportSession
from models.trading_account import TradingAccount
from models.ticker import Ticker
from models.execution import Execution

# Import import system components
from connectors.user_data_import.ibkr_connector import IBKRConnector
from connectors.user_data_import.demo_connector import DemoConnector
from services.user_data_import.import_orchestrator import ImportOrchestrator
from services.user_data_import.normalization_service import NormalizationService
from services.user_data_import.validation_service import ValidationService
from services.user_data_import.duplicate_detection_service import DuplicateDetectionService


class TestUserDataImportSystem(unittest.TestCase):
    """Comprehensive test suite for user data import system"""
    
    @classmethod
    def setUpClass(cls):
        """Set up test database and sample data"""
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        cls.app = app
        cls.client = app.test_client()
        
        with app.app_context():
            db.create_all()
            cls._create_test_data()
    
    @classmethod
    def tearDownClass(cls):
        """Clean up test database"""
        with app.app_context():
            db.drop_all()
    
    @classmethod
    def _create_test_data(cls):
        """Create test data for all tests"""
        # Create test trading account
        cls.test_account = TradingAccount(
            name="Test Account",
            account_number="TEST123",
            broker="Test Broker",
            currency="USD",
            is_active=True
        )
        db.session.add(cls.test_account)
        
        # Create test tickers
        test_tickers = [
            {"symbol": "AAPL", "name": "Apple Inc.", "exchange": "NASDAQ", "currency": "USD", "asset_type": "Stock"},
            {"symbol": "TSLA", "name": "Tesla Inc.", "exchange": "NASDAQ", "currency": "USD", "asset_type": "Stock"},
            {"symbol": "GOOGL", "name": "Alphabet Inc.", "exchange": "NASDAQ", "currency": "USD", "asset_type": "Stock"},
            {"symbol": "AAL", "name": "American Airlines", "exchange": "NASDAQ", "currency": "USD", "asset_type": "Stock"},
            {"symbol": "MSFT", "name": "Microsoft Corp", "exchange": "NASDAQ", "currency": "USD", "asset_type": "Stock"}
        ]
        
        for ticker_data in test_tickers:
            ticker = Ticker(**ticker_data)
            db.session.add(ticker)
        
        # Create some existing executions for duplicate testing
        existing_execution = Execution(
            ticker_id=1,  # AAPL
            trading_trading_account_id=cls.test_account.id,
            side="buy",
            quantity=100,
            price=150.25,
            fee=1.50,
            execution_date=datetime.now() - timedelta(days=1),
            source="manual"
        )
        db.session.add(existing_execution)
        
        db.session.commit()
    
    def setUp(self):
        """Set up for each test"""
        self.app_context = self.app.app_context()
        self.app_context.push()
    
    def tearDown(self):
        """Clean up after each test"""
        self.app_context.pop()
    
    # ===== BACKEND MODEL TESTS =====
    
    def test_import_session_model(self):
        """Test ImportSession model functionality"""
        # Create session
        session = ImportSession(
            trading_account_id=self.test_account.id,
            provider="ibkr",
            file_name="test_file.csv",
            total_records=100,
            status="analyzing"
        )
        db.session.add(session)
        db.session.commit()
        
        # Test basic properties
        self.assertEqual(session.provider, "ibkr")
        self.assertEqual(session.file_name, "test_file.csv")
        self.assertEqual(session.total_records, 100)
        self.assertEqual(session.status, "analyzing")
        self.assertTrue(session.is_active())
        self.assertFalse(session.can_execute())
        
        # Test summary data
        test_data = {"test_key": "test_value", "count": 42}
        session.add_summary_data(test_data)
        db.session.commit()
        
        retrieved_data = session.get_summary_data()
        self.assertEqual(retrieved_data["test_key"], "test_value")
        self.assertEqual(retrieved_data["count"], 42)
        
        # Test status update
        session.update_status("ready")
        db.session.commit()
        self.assertTrue(session.can_execute())
        self.assertFalse(session.is_active())
        
        # Test progress calculation
        session.imported_records = 50
        session.skipped_records = 30
        progress = session.get_progress_percentage()
        self.assertEqual(progress, 80.0)
    
    # ===== CONNECTOR TESTS =====
    
    def test_ibkr_connector_identification(self):
        """Test IBKR connector file identification"""
        connector = IBKRConnector()
        
        # Test valid IBKR file
        valid_content = """
        Statement,Header,Field Name,Field Value
        Account Information,Data,Account,U16011759
        Interactive Brokers Activity Statement
        Trades,Header,DataDiscriminator,Asset Category,Symbol,Date/Time,Quantity,T. Price,C. Price,Proceeds,Comm/Fee,Basis,Realized P/L,MTM P/L,Code
        """
        self.assertTrue(connector.identify_file(valid_content, "test.csv"))
        
        # Test invalid file
        invalid_content = "This is not an IBKR file"
        self.assertFalse(connector.identify_file(invalid_content, "test.csv"))
        
        # Test wrong file extension
        self.assertFalse(connector.identify_file(valid_content, "test.txt"))
    
    def test_ibkr_connector_parsing(self):
        """Test IBKR connector parsing functionality"""
        connector = IBKRConnector()
        
        # Create test IBKR file content
        ibkr_content = """Statement,Header,Field Name,Field Value
Account Information,Data,Account,U16011759
Account Information,Data,Name,Test User
Trades,Header,DataDiscriminator,Asset Category,Symbol,Date/Time,Quantity,T. Price,C. Price,Proceeds,Comm/Fee,Basis,Realized P/L,MTM P/L,Code
Trades,Data,Order,Stocks,AAPL,2025-01-15, 10:30:00,100,150.25,150.25,15025,1.50,15026.50,0,0,O
Trades,Data,Order,Stocks,TSLA,2025-01-15, 11:45:00,-50,200.75,200.75,-10037.50,2.00,-10039.50,0,0,O
Trades,Total,Stocks,2,150,150,5000,3.50,5003.50,0,0"""
        
        # Parse file
        records = connector.parse_file(ibkr_content, "test.csv")
        
        # Verify parsing results
        self.assertEqual(len(records), 2)  # Should parse 2 trade records
        
        # Check first record (buy)
        first_record = records[0]
        self.assertEqual(first_record['Symbol'], 'AAPL')
        self.assertEqual(first_record['Quantity'], '100')
        self.assertEqual(first_record['T. Price'], '150.25')
        
        # Check second record (sell)
        second_record = records[1]
        self.assertEqual(second_record['Symbol'], 'TSLA')
        self.assertEqual(second_record['Quantity'], '-50')
        self.assertEqual(second_record['T. Price'], '200.75')
    
    def test_ibkr_connector_normalization(self):
        """Test IBKR connector normalization"""
        connector = IBKRConnector()
        
        # Test buy record normalization
        buy_record = {
            'Symbol': 'AAPL',
            'Asset Category': 'Stocks',
            'Currency': 'USD',
            'Date/Time': '2025-01-15, 10:30:00',
            'Quantity': '100',
            'T. Price': '150.25',
            'C. Price': '150.25',
            'Proceeds': '15025',
            'Comm/Fee': '1.50',
            'Basis': '15026.50',
            'Realized P/L': '0',
            'MTM P/L': '0',
            'Code': 'O'
        }
        
        normalized = connector.normalize_record(buy_record)
        
        self.assertEqual(normalized['symbol'], 'AAPL')
        self.assertEqual(normalized['action'], 'buy')
        self.assertEqual(normalized['quantity'], 100.0)
        self.assertEqual(normalized['price'], 150.25)
        self.assertEqual(normalized['fee'], 1.50)
        self.assertEqual(normalized['currency'], 'USD')
        
        # Test sell record normalization
        sell_record = {
            'Symbol': 'TSLA',
            'Asset Category': 'Stocks',
            'Currency': 'USD',
            'Date/Time': '2025-01-15, 11:45:00',
            'Quantity': '-50',
            'T. Price': '200.75',
            'C. Price': '200.75',
            'Proceeds': '-10037.50',
            'Comm/Fee': '2.00',
            'Basis': '-10039.50',
            'Realized P/L': '0',
            'MTM P/L': '0',
            'Code': 'O'
        }
        
        normalized = connector.normalize_record(sell_record)
        
        self.assertEqual(normalized['symbol'], 'TSLA')
        self.assertEqual(normalized['action'], 'sell')
        self.assertEqual(normalized['quantity'], 50.0)  # Should be positive
        self.assertEqual(normalized['price'], 200.75)
        self.assertEqual(normalized['fee'], 2.00)
    
    def test_demo_connector(self):
        """Test Demo connector functionality"""
        connector = DemoConnector()
        
        # Test file identification
        demo_content = "symbol,action,date,quantity,price,fee\nAAPL,buy,2025-01-15T10:30:00,100,150.25,1.50"
        self.assertTrue(connector.identify_file(demo_content, "demo.csv"))
        
        # Test parsing
        records = connector.parse_file(demo_content, "demo.csv")
        self.assertEqual(len(records), 1)
        self.assertEqual(records[0]['symbol'], 'AAPL')
        self.assertEqual(records[0]['action'], 'buy')
        
        # Test normalization
        normalized = connector.normalize_record(records[0])
        self.assertEqual(normalized['symbol'], 'AAPL')
        self.assertEqual(normalized['action'], 'buy')
        self.assertEqual(normalized['quantity'], 100.0)
        self.assertEqual(normalized['price'], 150.25)
    
    # ===== SERVICE TESTS =====
    
    def test_normalization_service(self):
        """Test normalization service"""
        service = NormalizationService()
        connector = IBKRConnector()
        
        # Test data
        raw_records = [
            {
                'Symbol': 'AAPL',
                'Quantity': '100',
                'T. Price': '150.25',
                'Date/Time': '2025-01-15, 10:30:00',
                'Comm/Fee': '1.50'
            }
        ]
        
        result = service.normalize_records(raw_records, connector)
        
        self.assertTrue(result['success'])
        self.assertEqual(len(result['normalized_records']), 1)
        self.assertEqual(len(result['errors']), 0)
        
        normalized = result['normalized_records'][0]
        self.assertEqual(normalized['symbol'], 'AAPL')
        self.assertEqual(normalized['action'], 'buy')
        self.assertIn('external_id', normalized)
        self.assertIn('source', normalized)
    
    def test_validation_service(self):
        """Test validation service"""
        service = ValidationService()
        
        # Test valid records
        valid_records = [
            {
                'symbol': 'AAPL',
                'action': 'buy',
                'quantity': 100.0,
                'price': 150.25,
                'date': datetime.now(),
                'fee': 1.50
            }
        ]
        
        result = service.validate_records(valid_records)
        self.assertEqual(len(result['valid_records']), 1)
        self.assertEqual(len(result['invalid_records']), 0)
        
        # Test invalid records
        invalid_records = [
            {
                'symbol': 'AAPL',
                'action': 'buy',
                'quantity': 0,  # Invalid: zero quantity
                'price': 150.25,
                'date': datetime.now(),
                'fee': 1.50
            },
            {
                'symbol': 'AAPL',
                'action': 'buy',
                'quantity': 100.0,
                'price': -10.0,  # Invalid: negative price
                'date': datetime.now(),
                'fee': 1.50
            }
        ]
        
        result = service.validate_records(invalid_records)
        self.assertEqual(len(result['valid_records']), 0)
        self.assertEqual(len(result['invalid_records']), 2)
        self.assertTrue(len(result['validation_errors']) > 0)
    
    def test_duplicate_detection_service(self):
        """Test duplicate detection service"""
        service = DuplicateDetectionService(db.session)
        
        # Test records with potential duplicates
        records = [
            {
                'symbol': 'AAPL',
                'action': 'buy',
                'quantity': 100.0,
                'price': 150.25,
                'date': datetime.now(),
                'external_id': 'test1'
            },
            {
                'symbol': 'AAPL',
                'action': 'buy',
                'quantity': 100.0,
                'price': 150.25,
                'date': datetime.now(),
                'external_id': 'test2'  # Different external_id but same data
            }
        ]
        
        result = service.detect_duplicates(records, self.test_account.id)
        
        self.assertIn('clean_records', result)
        self.assertIn('within_file_duplicates', result)
        self.assertIn('system_duplicates', result)
        
        # Should detect within-file duplicates
        self.assertTrue(len(result['within_file_duplicates']) > 0)
    
    def test_import_orchestrator(self):
        """Test import orchestrator full flow"""
        orchestrator = ImportOrchestrator(db.session)
        
        # Test file content
        file_content = """Statement,Header,Field Name,Field Value
Account Information,Data,Account,U16011759
Trades,Header,DataDiscriminator,Asset Category,Symbol,Date/Time,Quantity,T. Price,C. Price,Proceeds,Comm/Fee,Basis,Realized P/L,MTM P/L,Code
Trades,Data,Order,Stocks,AAPL,2025-01-15, 10:30:00,100,150.25,150.25,15025,1.50,15026.50,0,0,O
Trades,Total,Stocks,1,100,100,15025,1.50,15026.50,0,0"""
        
        # Test create session
        result = orchestrator.create_import_session(
            trading_account_id=self.test_account.id,
            file_name="test_import.csv",
            file_content=file_content
        )
        
        self.assertTrue(result['success'])
        session_id = result['session_id']
        
        # Test analyze file
        analysis_result = orchestrator.analyze_file(session_id)
        self.assertTrue(analysis_result['success'])
        
        # Verify session was updated
        session = db.session.query(ImportSession).filter(ImportSession.id == session_id).first()
        self.assertEqual(session.status, 'ready')
        self.assertIsNotNone(session.get_summary_data())
    
    # ===== API ENDPOINT TESTS =====
    
    def test_upload_endpoint(self):
        """Test file upload endpoint"""
        # Create test file
        test_file_content = """Statement,Header,Field Name,Field Value
Account Information,Data,Account,U16011759
Trades,Header,DataDiscriminator,Asset Category,Symbol,Date/Time,Quantity,T. Price,C. Price,Proceeds,Comm/Fee,Basis,Realized P/L,MTM P/L,Code
Trades,Data,Order,Stocks,AAPL,2025-01-15, 10:30:00,100,150.25,150.25,15025,1.50,15026.50,0,0,O
Trades,Total,Stocks,1,100,100,15025,1.50,15026.50,0,0"""
        
        # Test upload
        response = self.client.post('/api/user-data-import/upload', 
                                   data={
                                       'file': (io.BytesIO(test_file_content.encode()), 'test.csv'),
                                       'trading_account_id': str(self.test_account.id)
                                   },
                                   content_type='multipart/form-data')
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['status'], 'success')
        self.assertIn('session_id', data)
        self.assertIn('analysis_results', data)
    
    def test_session_endpoint(self):
        """Test session retrieval endpoint"""
        # Create a test session
        session = ImportSession(
            trading_account_id=self.test_account.id,
            provider="ibkr",
            file_name="test.csv",
            status="ready"
        )
        db.session.add(session)
        db.session.commit()
        
        # Test session retrieval
        response = self.client.get(f'/api/user-data-import/session/{session.id}')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertEqual(data['status'], 'success')
        self.assertEqual(data['session']['id'], session.id)
        self.assertEqual(data['session']['provider'], 'ibkr')
    
    def test_preview_endpoint(self):
        """Test preview endpoint"""
        # Create a test session with analysis data
        session = ImportSession(
            trading_account_id=self.test_account.id,
            provider="ibkr",
            file_name="test.csv",
            status="ready"
        )
        session.add_summary_data({
            'valid_records': [{'symbol': 'AAPL', 'action': 'buy', 'quantity': 100}],
            'invalid_records': [],
            'duplicate_records': []
        })
        db.session.add(session)
        db.session.commit()
        
        # Test preview
        response = self.client.get(f'/api/user-data-import/session/{session.id}/preview')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertEqual(data['status'], 'success')
        self.assertIn('preview_data', data)
    
    # ===== INTEGRATION TESTS =====
    
    def test_full_import_flow(self):
        """Test complete import flow from upload to execution"""
        # This test would require more complex setup
        # For now, we'll test the orchestrator flow
        orchestrator = ImportOrchestrator(db.session)
        
        # Test file content
        file_content = """Statement,Header,Field Name,Field Value
Account Information,Data,Account,U16011759
Trades,Header,DataDiscriminator,Asset Category,Symbol,Date/Time,Quantity,T. Price,C. Price,Proceeds,Comm/Fee,Basis,Realized P/L,MTM P/L,Code
Trades,Data,Order,Stocks,AAPL,2025-01-15, 10:30:00,100,150.25,150.25,15025,1.50,15026.50,0,0,O
Trades,Total,Stocks,1,100,100,15025,1.50,15026.50,0,0"""
        
        # Create session
        result = orchestrator.create_import_session(
            trading_account_id=self.test_account.id,
            file_name="test_import.csv",
            file_content=file_content
        )
        self.assertTrue(result['success'])
        
        # Analyze file
        analysis_result = orchestrator.analyze_file(result['session_id'])
        self.assertTrue(analysis_result['success'])
        
        # Get preview
        preview_result = orchestrator.get_preview_data(result['session_id'])
        self.assertTrue(preview_result['success'])
    
    # ===== EDGE CASE TESTS =====
    
    def test_empty_file(self):
        """Test handling of empty file"""
        connector = IBKRConnector()
        result = connector.parse_file("", "empty.csv")
        self.assertEqual(len(result), 0)
    
    def test_malformed_file(self):
        """Test handling of malformed file"""
        connector = IBKRConnector()
        malformed_content = "This is not a valid IBKR file"
        
        with self.assertRaises(ValueError):
            connector.parse_file(malformed_content, "malformed.csv")
    
    def test_large_file_performance(self):
        """Test performance with large file"""
        # Create large file content
        large_content = """Statement,Header,Field Name,Field Value
Account Information,Data,Account,U16011759
Trades,Header,DataDiscriminator,Asset Category,Symbol,Date/Time,Quantity,T. Price,C. Price,Proceeds,Comm/Fee,Basis,Realized P/L,MTM P/L,Code"""
        
        # Add 1000 trade records
        for i in range(1000):
            large_content += f"\nTrades,Data,Order,Stocks,AAPL,2025-01-15, 10:30:00,100,150.25,150.25,15025,1.50,15026.50,0,0,O"
        
        large_content += "\nTrades,Total,Stocks,1000,100000,100000,15025000,1500,15026500,0,0"
        
        # Test parsing performance
        start_time = datetime.now()
        connector = IBKRConnector()
        records = connector.parse_file(large_content, "large.csv")
        end_time = datetime.now()
        
        # Should parse all records
        self.assertEqual(len(records), 1000)
        
        # Should complete within reasonable time (5 seconds)
        processing_time = (end_time - start_time).total_seconds()
        self.assertLess(processing_time, 5.0)


def run_tests():
    """Run all tests and generate report"""
    print("🧪 Starting Comprehensive User Data Import Tests...")
    print("=" * 60)
    
    # Create test suite
    suite = unittest.TestLoader().loadTestsFromTestCase(TestUserDataImportSystem)
    
    # Run tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    # Generate report
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    print(f"Tests run: {result.testsRun}")
    print(f"Failures: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")
    print(f"Success rate: {((result.testsRun - len(result.failures) - len(result.errors)) / result.testsRun * 100):.1f}%")
    
    if result.failures:
        print("\n❌ FAILURES:")
        for test, traceback in result.failures:
            print(f"  - {test}: {traceback}")
    
    if result.errors:
        print("\n💥 ERRORS:")
        for test, traceback in result.errors:
            print(f"  - {test}: {traceback}")
    
    if result.wasSuccessful():
        print("\n✅ ALL TESTS PASSED!")
    else:
        print(f"\n❌ {len(result.failures + result.errors)} TESTS FAILED")
    
    return result.wasSuccessful()


if __name__ == '__main__':
    import io
    success = run_tests()
    sys.exit(0 if success else 1)
