"""
Integration Tests for Import System - New Architecture

This module contains integration tests for the complete import system workflow,
testing the interaction between all components.

Author: TikTrack Development Team
Version: 2.0 - New Architecture
Last Updated: 2025-01-27
"""

import unittest
import tempfile
import os
from datetime import datetime, date
from flask import Flask
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Import the application components
from app import create_app
from models.import_session import ImportSession
from models.trading_account import TradingAccount
from models.ticker import Ticker
from models.execution import Execution

class TestImportSystemIntegration(unittest.TestCase):
    """Integration tests for the complete import system"""
    
    @classmethod
    def setUpClass(cls):
        """Set up test database and app"""
        # Create test database
        cls.test_db_path = tempfile.mktemp(suffix='.db')
        cls.engine = create_engine(f'sqlite:///{cls.test_db_path}')
        
        # Create test app
        cls.app = create_app()
        cls.app.config['TESTING'] = True
        cls.app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{cls.test_db_path}'
        
        # Create tables
        from models.base import BaseModel
        BaseModel.metadata.create_all(cls.engine)
        
        cls.Session = sessionmaker(bind=cls.engine)
    
    @classmethod
    def tearDownClass(cls):
        """Clean up test database"""
        if os.path.exists(cls.test_db_path):
            os.unlink(cls.test_db_path)
    
    def setUp(self):
        """Set up test data"""
        self.db_session = self.Session()
        
        # Create test trading account
        self.test_account = TradingAccount(
            name="Test Account",
            account_number="TEST123",
            is_active=True
        )
        self.db_session.add(self.test_account)
        self.db_session.commit()
        
        # Create test tickers
        test_tickers = ['AAPL', 'TSLA', 'MSFT', 'GOOGL']
        for symbol in test_tickers:
            ticker = Ticker(
                symbol=symbol,
                name=f"{symbol} Inc.",
                is_active=True
            )
            self.db_session.add(ticker)
        self.db_session.commit()
    
    def tearDown(self):
        """Clean up test data"""
        self.db_session.rollback()
        self.db_session.close()
    
    def test_complete_import_workflow(self):
        """Test complete import workflow from upload to execution"""
        from services.user_data_import.import_orchestrator import ImportOrchestrator
        
        # Test data
        test_csv_content = """Symbol,Date,Quantity,Price
AAPL,2025-01-01,100,150.00
TSLA,2025-01-02,50,200.00
MSFT,2025-01-03,75,300.00"""
        
        orchestrator = ImportOrchestrator(self.db_session)
        
        # Step 1: Create import session
        result = orchestrator.create_import_session(
            trading_account_id=self.test_account.id,
            file_name="test_import.csv",
            file_content=test_csv_content
        )
        
        self.assertTrue(result['success'])
        session_id = result['session_id']
        
        # Step 2: Analyze file
        analysis_result = orchestrator.analyze_file(session_id)
        self.assertTrue(analysis_result['success'])
        
        # Step 3: Generate preview
        preview_result = orchestrator.generate_preview(session_id)
        self.assertTrue(preview_result['success'])
        
        # Step 4: Execute import
        execution_result = orchestrator.execute_import(session_id)
        self.assertTrue(execution_result['success'])
        
        # Verify data was imported
        executions = self.db_session.query(Execution).filter(
            Execution.trading_account_id == self.test_account.id
        ).all()
        
        self.assertEqual(len(executions), 3)  # Should have 3 executions
    
    def test_duplicate_detection_integration(self):
        """Test duplicate detection with existing data"""
        from services.user_data_import.import_orchestrator import ImportOrchestrator
        
        # Create existing execution
        existing_ticker = self.db_session.query(Ticker).filter(Ticker.symbol == 'AAPL').first()
        existing_execution = Execution(
            trading_account_id=self.test_account.id,
            ticker_id=existing_ticker.id,
            date=date(2025, 1, 1),
            quantity=100,
            price=150.00,
            side='BUY'
        )
        self.db_session.add(existing_execution)
        self.db_session.commit()
        
        # Test import with duplicate
        test_csv_content = """Symbol,Date,Quantity,Price
AAPL,2025-01-01,100,150.00
TSLA,2025-01-02,50,200.00"""
        
        orchestrator = ImportOrchestrator(self.db_session)
        
        # Create session and analyze
        result = orchestrator.create_import_session(
            trading_account_id=self.test_account.id,
            file_name="test_duplicate.csv",
            file_content=test_csv_content
        )
        
        analysis_result = orchestrator.analyze_file(result['session_id'])
        self.assertTrue(analysis_result['success'])
        
        # Check that duplicate was detected
        analysis_data = analysis_result['analysis_results']
        self.assertIn('duplicates', analysis_data)
        self.assertGreater(len(analysis_data['duplicates']), 0)
    
    def test_missing_ticker_handling(self):
        """Test handling of missing tickers"""
        from services.user_data_import.import_orchestrator import ImportOrchestrator
        
        # Test import with unknown ticker
        test_csv_content = """Symbol,Date,Quantity,Price
UNKNOWN,2025-01-01,100,150.00
AAPL,2025-01-02,50,200.00"""
        
        orchestrator = ImportOrchestrator(self.db_session)
        
        # Create session and analyze
        result = orchestrator.create_import_session(
            trading_account_id=self.test_account.id,
            file_name="test_missing.csv",
            file_content=test_csv_content
        )
        
        analysis_result = orchestrator.analyze_file(result['session_id'])
        self.assertTrue(analysis_result['success'])
        
        # Check that missing ticker was detected
        analysis_data = analysis_result['analysis_results']
        self.assertIn('missing_tickers', analysis_data)
        self.assertIn('UNKNOWN', analysis_data['missing_tickers'])
    
    def test_file_storage_integration(self):
        """Test file storage service integration"""
        from services.user_data_import.file_storage_service import FileStorageService
        
        storage = FileStorageService()
        test_content = "Symbol,Date,Quantity,Price\nAAPL,2025-01-01,100,150.00"
        
        # Save file
        save_result = storage.save_file(123, test_content, "test.csv")
        self.assertTrue(save_result['success'])
        
        # Retrieve file
        get_result = storage.get_file(123)
        self.assertTrue(get_result['success'])
        self.assertEqual(get_result['content'], test_content)
        
        # Delete file
        delete_result = storage.delete_file(123)
        self.assertTrue(delete_result['success'])
        
        # Verify file is deleted
        get_result = storage.get_file(123)
        self.assertFalse(get_result['success'])
    
    def test_connector_registry_integration(self):
        """Test connector registry with different file formats"""
        from services.user_data_import.connector_registry import ConnectorRegistry
        
        registry = ConnectorRegistry()
        
        # Test IBKR format
        ibkr_content = """Symbol,Date,Quantity,Price
AAPL,2025-01-01,100,150.00"""
        
        result = registry.detect_connector(ibkr_content, "activity.csv")
        self.assertTrue(result['success'])
        self.assertEqual(result['provider'], 'ibkr')
        
        # Test Demo format
        demo_content = """symbol,date,qty,price
TSLA,2025-01-01,50,200.00"""
        
        result = registry.detect_connector(demo_content, "demo.csv")
        self.assertTrue(result['success'])
        self.assertEqual(result['provider'], 'demo')
    
    def test_performance_optimization(self):
        """Test performance optimizations"""
        from services.user_data_import.validation_service import ValidationService
        from services.user_data_import.duplicate_detection_service import DuplicateDetectionService
        
        # Test ticker cache performance
        validation = ValidationService(self.db_session)
        validation._load_ticker_cache()
        
        # Verify cache is loaded
        self.assertTrue(validation.cache_loaded)
        self.assertGreater(len(validation.ticker_cache), 0)
        
        # Test duplicate detection optimization
        duplicate_service = DuplicateDetectionService(self.db_session)
        
        # Create test records
        test_records = [
            {'symbol': 'AAPL', 'date': date(2025, 1, 1), 'quantity': 100, 'price': 150.00},
            {'symbol': 'TSLA', 'date': date(2025, 1, 2), 'quantity': 50, 'price': 200.00}
        ]
        
        # Test optimized query
        existing = duplicate_service._get_existing_executions(self.test_account.id, test_records)
        self.assertIsInstance(existing, list)

class TestAPIIntegration(unittest.TestCase):
    """Integration tests for API endpoints"""
    
    @classmethod
    def setUpClass(cls):
        """Set up test app"""
        cls.app = create_app()
        cls.app.config['TESTING'] = True
        cls.client = cls.app.test_client()
    
    def test_upload_endpoint(self):
        """Test file upload endpoint"""
        # Create test CSV content
        test_csv_content = "Symbol,Date,Quantity,Price\nAAPL,2025-01-01,100,150.00"
        
        # Test upload
        response = self.client.post('/api/user-data-import/upload', 
                                  data={'file': (io.BytesIO(test_csv_content.encode()), 'test.csv'),
                                        'trading_account_id': 1},
                                  content_type='multipart/form-data')
        
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data['success'])
        self.assertIn('session_id', data)
    
    def test_analyze_endpoint(self):
        """Test analyze endpoint"""
        # First upload a file
        test_csv_content = "Symbol,Date,Quantity,Price\nAAPL,2025-01-01,100,150.00"
        
        upload_response = self.client.post('/api/user-data-import/upload',
                                         data={'file': (io.BytesIO(test_csv_content.encode()), 'test.csv'),
                                               'trading_account_id': 1},
                                         content_type='multipart/form-data')
        
        session_id = upload_response.get_json()['session_id']
        
        # Test analyze
        response = self.client.post(f'/api/user-data-import/session/{session_id}/analyze')
        
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data['success'])
        self.assertIn('analysis_results', data)
    
    def test_preview_endpoint(self):
        """Test preview endpoint"""
        # First upload and analyze
        test_csv_content = "Symbol,Date,Quantity,Price\nAAPL,2025-01-01,100,150.00"
        
        upload_response = self.client.post('/api/user-data-import/upload',
                                         data={'file': (io.BytesIO(test_csv_content.encode()), 'test.csv'),
                                               'trading_account_id': 1},
                                         content_type='multipart/form-data')
        
        session_id = upload_response.get_json()['session_id']
        
        # Analyze
        self.client.post(f'/api/user-data-import/session/{session_id}/analyze')
        
        # Test preview
        response = self.client.get(f'/api/user-data-import/session/{session_id}/preview')
        
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data['success'])
        self.assertIn('preview_data', data)

if __name__ == '__main__':
    # Run integration tests
    unittest.main(verbosity=2)

