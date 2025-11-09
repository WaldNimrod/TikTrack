#!/usr/bin/env python3
"""
Connector-Only Test Suite for User Data Import System
====================================================

This test suite focuses only on testing the connectors without
requiring the full system setup.

Author: TikTrack Development Team
Version: 1.0
Date: 2025-01-16
"""

import os
import sys
import unittest
from datetime import datetime

# Add the Backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

# Import only connectors
from connectors.user_data_import.ibkr_connector import IBKRConnector
from connectors.user_data_import.demo_connector import DemoConnector


class TestConnectorsOnly(unittest.TestCase):
    """Test suite for user data import connectors only"""
    
    def setUp(self):
        """Set up test data"""
        self.ibkr_connector = IBKRConnector()
        self.demo_connector = DemoConnector()
    
    def test_ibkr_connector_identification(self):
        """Test IBKR connector file identification"""
        # Test valid IBKR file
        valid_content = """
        Statement,Header,Field Name,Field Value
        Account Information,Data,Account,U16011759
        Interactive Brokers Activity Statement
        Trades,Header,DataDiscriminator,Asset Category,Symbol,Date/Time,Quantity,T. Price,C. Price,Proceeds,Comm/Fee,Basis,Realized P/L,MTM P/L,Code
        """
        self.assertTrue(self.ibkr_connector.identify_file(valid_content, "test.csv"))
        
        # Test invalid file
        invalid_content = "This is not an IBKR file"
        self.assertFalse(self.ibkr_connector.identify_file(invalid_content, "test.csv"))
        
        # Test wrong file extension
        self.assertFalse(self.ibkr_connector.identify_file(valid_content, "test.txt"))
    
    def test_ibkr_connector_parsing(self):
        """Test IBKR connector parsing functionality"""
        # Create test IBKR file content
        ibkr_content = """Statement,Header,Field Name,Field Value
Account Information,Data,Account,U16011759
Account Information,Data,Name,Test User
Trades,Header,DataDiscriminator,Asset Category,Symbol,Date/Time,Quantity,T. Price,C. Price,Proceeds,Comm/Fee,Basis,Realized P/L,MTM P/L,Code
Trades,Data,Order,Stocks,AAPL,2025-01-15, 10:30:00,100,150.25,150.25,15025,1.50,15026.50,0,0,O
Trades,Data,Order,Stocks,TSLA,2025-01-15, 11:45:00,-50,200.75,200.75,-10037.50,2.00,-10039.50,0,0,O
Trades,Total,Stocks,2,150,150,5000,3.50,5003.50,0,0"""
        
        # Parse file
        records = self.ibkr_connector.parse_file(ibkr_content, "test.csv")
        
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
        
        normalized = self.ibkr_connector.normalize_record(buy_record)
        
        self.assertEqual(normalized['symbol'], 'AAPL')
        self.assertEqual(normalized['action'], 'buy')
        self.assertEqual(normalized['quantity'], 100.0)
        self.assertEqual(normalized['price'], 150.25)
        self.assertEqual(normalized['fee'], 1.50)
        self.assertEqual(normalized['currency'], 'USD')
        self.assertIn('utc', normalized['date'])
        
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
        
        normalized = self.ibkr_connector.normalize_record(sell_record)
        
        self.assertEqual(normalized['symbol'], 'TSLA')
        self.assertEqual(normalized['action'], 'sell')
        self.assertEqual(normalized['quantity'], 50.0)  # Should be positive
        self.assertEqual(normalized['price'], 200.75)
        self.assertEqual(normalized['fee'], 2.00)
        self.assertIn('utc', normalized['date'])
    
    def test_demo_connector(self):
        """Test Demo connector functionality"""
        # Test file identification
        demo_content = "symbol,action,date,quantity,price,fee\nAAPL,buy,2025-01-15T10:30:00,100,150.25,1.50"
        self.assertTrue(self.demo_connector.identify_file(demo_content, "demo.csv"))
        
        # Test parsing
        records = self.demo_connector.parse_file(demo_content, "demo.csv")
        self.assertEqual(len(records), 1)
        self.assertEqual(records[0]['symbol'], 'AAPL')
        self.assertEqual(records[0]['action'], 'buy')

        # Test normalization
        normalized = self.demo_connector.normalize_record(records[0])
        self.assertEqual(normalized['symbol'], 'AAPL')
        self.assertEqual(normalized['action'], 'buy')
        self.assertEqual(normalized['quantity'], 100.0)
        self.assertEqual(normalized['price'], 150.25)
        self.assertIsInstance(normalized['date'], dict)
        self.assertIn('utc', normalized['date'])
    
    def test_ibkr_connector_with_real_file(self):
        """Test IBKR connector with real sample file"""
        # Read the real IBKR sample file
        sample_file_path = os.path.join(os.path.dirname(__file__), '..', 'connectors', 'user_data_import', 'test_files', 'ibkr_sample.csv')
        
        if os.path.exists(sample_file_path):
            with open(sample_file_path, 'r', encoding='utf-8') as f:
                file_content = f.read()
            
            # Test identification
            self.assertTrue(self.ibkr_connector.identify_file(file_content, "ibkr_sample.csv"))
            
            # Test parsing
            records = self.ibkr_connector.parse_file(file_content, "ibkr_sample.csv")
            self.assertGreater(len(records), 0, "Should parse at least one record from sample file")
            
            # Test normalization of first record
            if records:
                try:
                    normalized = self.ibkr_connector.normalize_record(records[0])
                    self.assertIn('symbol', normalized)
                    self.assertIn('action', normalized)
                    self.assertIn('quantity', normalized)
                    self.assertIn('price', normalized)
                    self.assertIn('utc', normalized['date'])
                    print(f"✅ Successfully normalized record: {normalized['symbol']} - {normalized['action']} - {normalized['quantity']}")
                except Exception as e:
                    self.fail(f"Failed to normalize record: {e}")
        else:
            self.skipTest("Sample IBKR file not found")
    
    def test_demo_connector_with_real_file(self):
        """Test Demo connector with real sample file"""
        # Read the real Demo sample file
        sample_file_path = os.path.join(os.path.dirname(__file__), '..', 'connectors', 'user_data_import', 'test_files', 'demo_sample.csv')
        
        if os.path.exists(sample_file_path):
            with open(sample_file_path, 'r', encoding='utf-8') as f:
                file_content = f.read()
            
            # Test identification
            self.assertTrue(self.demo_connector.identify_file(file_content, "demo_sample.csv"))
            
            # Test parsing
            records = self.demo_connector.parse_file(file_content, "demo_sample.csv")
            self.assertGreater(len(records), 0, "Should parse at least one record from sample file")
            
            # Test normalization of first record
            if records:
                try:
                    normalized = self.demo_connector.normalize_record(records[0])
                    self.assertIn('symbol', normalized)
                    self.assertIn('action', normalized)
                    self.assertIn('quantity', normalized)
                    self.assertIn('price', normalized)
                    print(f"✅ Successfully normalized record: {normalized['symbol']} - {normalized['action']} - {normalized['quantity']}")
                except Exception as e:
                    self.fail(f"Failed to normalize record: {e}")
        else:
            self.skipTest("Sample Demo file not found")
    
    def test_edge_cases(self):
        """Test edge cases"""
        # Test empty file
        records = self.ibkr_connector.parse_file("", "empty.csv")
        self.assertEqual(len(records), 0)
        
        # Test malformed file
        with self.assertRaises(ValueError):
            self.ibkr_connector.parse_file("This is not a valid IBKR file", "malformed.csv")
        
        # Test large file performance
        large_content = """Statement,Header,Field Name,Field Value
Account Information,Data,Account,U16011759
Trades,Header,DataDiscriminator,Asset Category,Symbol,Date/Time,Quantity,T. Price,C. Price,Proceeds,Comm/Fee,Basis,Realized P/L,MTM P/L,Code"""
        
        # Add 100 trade records
        for i in range(100):
            large_content += f"\nTrades,Data,Order,Stocks,AAPL,2025-01-15, 10:30:00,100,150.25,150.25,15025,1.50,15026.50,0,0,O"
        
        large_content += "\nTrades,Total,Stocks,100,10000,10000,1502500,150,1502650,0,0"
        
        # Test parsing performance
        start_time = datetime.now()
        records = self.ibkr_connector.parse_file(large_content, "large.csv")
        end_time = datetime.now()
        
        # Should parse all records
        self.assertEqual(len(records), 100)
        
        # Should complete within reasonable time (2 seconds)
        processing_time = (end_time - start_time).total_seconds()
        self.assertLess(processing_time, 2.0)
        print(f"✅ Parsed 100 records in {processing_time:.2f} seconds")


def run_tests():
    """Run all tests and generate report"""
    print("🧪 Starting Connector-Only Tests...")
    print("=" * 60)
    
    # Create test suite
    suite = unittest.TestLoader().loadTestsFromTestCase(TestConnectorsOnly)
    
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
    success = run_tests()
    sys.exit(0 if success else 1)
