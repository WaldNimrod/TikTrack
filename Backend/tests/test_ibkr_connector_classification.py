"""
Unit tests for IBKR Connector classification logic

Tests the centralized _identify_record_type function and ensures
correct classification of cashflow records from IBKR CSV files.

Author: TikTrack Development Team
Version: 1.0
Last Updated: 2025-01-16
"""

import pytest
from connectors.user_data_import.ibkr_connector import IBKRConnector

# ============================================================================
# FUNCTION INDEX
# ============================================================================
# Test Functions:
#   - test_identify_record_type_direct_mapping(): Test direct section name mapping
#   - test_identify_record_type_skip_accounting_entries(): Test skipping accruals
#   - test_identify_record_type_deposit_withdrawal(): Test deposit/withdrawal resolution
#   - test_identify_record_type_interest_syep(): Test interest vs SYEP interest
#   - test_identify_record_type_transfer(): Test transfer type
#   - test_identify_record_type_borrow_fee(): Test borrow_fee type
# ============================================================================

class TestIBKRConnectorClassification:
    """Test IBKR Connector record classification"""
    
    def setup_method(self):
        """Set up test fixtures"""
        self.connector = IBKRConnector()
    
    def test_identify_record_type_direct_mapping(self):
        """Test direct mapping from section name to cashflow_type"""
        # Test dividend
        result = self.connector._identify_record_type('Dividends', {})
        assert result == 'dividend'
        
        # Test tax
        result = self.connector._identify_record_type('Withholding Tax', {})
        assert result == 'tax'
        
        # Test borrow_fee
        result = self.connector._identify_record_type('Borrow Fee Details', {})
        assert result == 'borrow_fee'
    
    def test_identify_record_type_skip_accounting_entries(self):
        """Test that accounting entries are skipped (return None)"""
        # Test dividend_accrual
        result = self.connector._identify_record_type('Change in Dividend Accruals', {})
        assert result is None
        
        # Test interest_accrual
        result = self.connector._identify_record_type('Interest Accruals', {})
        assert result is None
        
        # Test syep_activity
        result = self.connector._identify_record_type('Stock Yield Enhancement Program Securities Lent Activity', {})
        assert result is None
        
        # Test syep_interest
        result = self.connector._identify_record_type('Stock Yield Enhancement Program Securities Lent Interest Details', {})
        assert result is None
        
        # Test cash_report
        result = self.connector._identify_record_type('Cash Report', {})
        assert result is None
    
    def test_identify_record_type_deposit_withdrawal(self):
        """Test deposit_withdrawal resolves by amount sign"""
        # Test deposit (positive amount)
        row = {'Amount': '100.00'}
        result = self.connector._identify_record_type('Deposits & Withdrawals', row)
        assert result == 'deposit'
        
        # Test withdrawal (negative amount)
        row = {'Amount': '-100.00'}
        result = self.connector._identify_record_type('Deposits & Withdrawals', row)
        assert result == 'withdrawal'
    
    def test_identify_record_type_interest_syep(self):
        """Test interest vs SYEP interest detection"""
        # Test regular interest
        row = {'Description': 'Broker Interest Paid'}
        result = self.connector._identify_record_type('Interest', row)
        assert result == 'interest'
        
        # Test SYEP interest (should be skipped)
        row = {'Description': 'Stock Yield Enhancement Program Interest'}
        result = self.connector._identify_record_type('Interest', row)
        assert result is None
        
        # Test SYEP in memo
        row = {'Memo': 'SYEP interest payment'}
        result = self.connector._identify_record_type('Interest', row)
        assert result is None
    
    def test_identify_record_type_transfer(self):
        """Test transfer type"""
        result = self.connector._identify_record_type('Transfers', {})
        assert result == 'transfer'
    
    def test_identify_record_type_borrow_fee(self):
        """Test borrow_fee type"""
        result = self.connector._identify_record_type('Borrow Fee Details', {})
        assert result == 'borrow_fee'
    
    def test_identify_record_type_unknown_section(self):
        """Test unknown section returns None"""
        result = self.connector._identify_record_type('Unknown Section', {})
        assert result is None

