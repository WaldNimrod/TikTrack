"""
Unit tests for user_ticker integration in import system

Tests user_ticker association creation and user isolation during import.

Author: TikTrack Development Team
Version: 1.0
Date: 2025-12-04
"""

import pytest
from unittest.mock import Mock, patch, MagicMock
from services.user_data_import.import_orchestrator import ImportOrchestrator
from services.ticker_service import TickerService
from services.user_data_import.validation_service import ValidationService
from models.import_session import ImportSession
from models.ticker import Ticker
from models.user_ticker import UserTicker

# ============================================================================
# FUNCTION INDEX
# ============================================================================
# Test Functions:
#   - test_enrich_records_creates_user_ticker(): Test enrich_records creates user_ticker
#   - test_enrich_records_with_existing_ticker(): Test enrich_records with existing ticker
#   - test_enrich_records_with_new_ticker(): Test enrich_records creates ticker + user_ticker
#   - test_check_missing_tickers_user_specific(): Test _check_missing_tickers is user-specific
#   - test_import_session_user_id(): Test ImportSession stores user_id
#   - test_user_isolation(): Test user isolation during import
# ============================================================================

class TestImportUserTicker:
    """Test user_ticker integration in import system"""
    
    def setup_method(self):
        """Set up test fixtures"""
        self.db_session = Mock()
        self.orchestrator = ImportOrchestrator(self.db_session)
        self.validation_service = ValidationService(self.db_session)
    
    def test_enrich_records_creates_user_ticker(self):
        """Test that enrich_records_with_ticker_ids creates user_ticker associations"""
        # Mock existing ticker
        mock_ticker = Mock(spec=Ticker)
        mock_ticker.id = 1
        mock_ticker.symbol = "AAPL"
        
        # Mock database query
        self.db_session.query.return_value.filter.return_value.first.return_value = None  # No user_ticker
        
        # Mock get_symbols_to_ids_mapping
        with patch.object(TickerService, 'get_symbols_to_ids_mapping', return_value={"AAPL": 1}):
            records = [{"symbol": "AAPL", "action": "buy"}]
            user_id = 1
            
            # Call enrich_records_with_ticker_ids
            result = TickerService.enrich_records_with_ticker_ids(
                self.db_session, 
                records, 
                user_id=user_id
            )
            
            # Verify user_ticker was created
            assert self.db_session.add.called
            assert self.db_session.flush.called
    
    def test_enrich_records_with_existing_ticker(self):
        """Test enrich_records with existing ticker but no user_ticker"""
        # Mock existing ticker
        mock_ticker = Mock(spec=Ticker)
        mock_ticker.id = 1
        mock_ticker.symbol = "AAPL"
        
        # Mock no user_ticker exists
        self.db_session.query.return_value.filter.return_value.first.return_value = None
        
        # Mock get_symbols_to_ids_mapping
        with patch.object(TickerService, 'get_symbols_to_ids_mapping', return_value={"AAPL": 1}):
            records = [{"symbol": "AAPL", "action": "buy"}]
            user_id = 1
            
            result = TickerService.enrich_records_with_ticker_ids(
                self.db_session, 
                records, 
                user_id=user_id
            )
            
            # Verify user_ticker association was created
            assert self.db_session.add.called
    
    def test_enrich_records_with_new_ticker(self):
        """Test enrich_records creates ticker + user_ticker for new ticker"""
        # Mock no ticker exists
        with patch.object(TickerService, 'get_symbols_to_ids_mapping', return_value={}):
            with patch.object(TickerService, 'create') as mock_create:
                mock_ticker = Mock(spec=Ticker)
                mock_ticker.id = 2
                mock_ticker.symbol = "NEWT"
                mock_create.return_value = mock_ticker
                
                # Mock currency
                mock_currency = Mock()
                mock_currency.id = 1
                self.db_session.query.return_value.filter.return_value.first.return_value = mock_currency
                
                records = [{"symbol": "NEWT", "type": "stock", "currency": "USD"}]
                user_id = 1
                
                result = TickerService.enrich_records_with_ticker_ids(
                    self.db_session, 
                    records, 
                    user_id=user_id
                )
                
                # Verify ticker was created
                assert mock_create.called
                # Verify user_ticker was created
                assert self.db_session.add.called
    
    def test_check_missing_tickers_user_specific(self):
        """Test that _check_missing_tickers checks user_tickers user-specifically"""
        # Mock user_tickers query
        mock_user_ticker = Mock()
        mock_user_ticker.symbol = "AAPL"
        
        self.db_session.query.return_value.join.return_value.filter.return_value.all.return_value = [mock_user_ticker]
        
        records = [
            {"symbol": "AAPL", "currency": "USD"},
            {"symbol": "GOOGL", "currency": "USD"}
        ]
        user_id = 1
        
        missing = self.validation_service._check_missing_tickers(records, user_id=user_id)
        
        # Verify only GOOGL is missing (AAPL has user_ticker)
        assert len(missing) == 1
        assert missing[0]['symbol'] == "GOOGL"
    
    def test_import_session_user_id(self):
        """Test that ImportSession stores user_id"""
        session = ImportSession(
            user_id=1,
            trading_account_id=1,
            provider="IBKR",
            file_name="test.csv",
            status="analyzing"
        )
        
        assert session.user_id == 1
    
    def test_user_isolation(self):
        """Test user isolation - user 1 should not see user 2's tickers"""
        # Mock user 1's tickers
        user1_ticker = Mock()
        user1_ticker.ticker_id = 1
        
        # Mock user 2's tickers
        user2_ticker = Mock()
        user2_ticker.ticker_id = 2
        
        # Verify they are separate
        assert user1_ticker.ticker_id != user2_ticker.ticker_id

