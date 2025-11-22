"""
Unit Tests for TickerSymbolMappingService
Tests the service for managing ticker provider symbol mappings.
"""

import pytest
import sys
import os
from pathlib import Path
from unittest.mock import Mock, patch

# Add Backend to path
backend_dir = Path(__file__).parent.parent.parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from models.ticker import Ticker, TickerProviderSymbol
from models.external_data import ExternalDataProvider
from services.ticker_symbol_mapping_service import TickerSymbolMappingService
from config.settings import DATABASE_URL

# Use test database or in-memory SQLite for tests
if 'test' in DATABASE_URL or DATABASE_URL.startswith('sqlite'):
    test_db_url = DATABASE_URL.replace('tiktrack', 'tiktrack_test') if 'tiktrack' in DATABASE_URL else 'sqlite:///:memory:'
else:
    test_db_url = 'sqlite:///:memory:'

test_engine = create_engine(test_db_url, echo=False)
TestSession = sessionmaker(bind=test_engine)


@pytest.fixture
def db_session():
    """Create a test database session"""
    # Create tables
    from models.base import Base
    from models.currency import Currency
    from models.ticker import Ticker, TickerProviderSymbol
    from models.external_data import ExternalDataProvider
    
    Base.metadata.create_all(test_engine)
    
    session = TestSession()
    try:
        yield session
    finally:
        session.rollback()
        session.close()
        # Clean up tables
        Base.metadata.drop_all(test_engine)


@pytest.fixture
def test_currency(db_session):
    """Create a test currency"""
    from models.currency import Currency
    # Check if currency already exists
    currency = db_session.query(Currency).filter_by(symbol='USD').first()
    if not currency:
        currency = Currency(
            name='US Dollar',
            symbol='USD',
            usd_rate=1.0
        )
        db_session.add(currency)
        db_session.commit()
        db_session.refresh(currency)
    return currency

@pytest.fixture
def test_ticker(db_session, test_currency):
    """Create a test ticker"""
    ticker = Ticker(
        symbol='TEST',
        name='Test Ticker',
        type='stock',
        currency_id=test_currency.id,
        status='open'
    )
    db_session.add(ticker)
    db_session.commit()
    db_session.refresh(ticker)
    return ticker


@pytest.fixture
def test_provider(db_session):
    """Create a test external data provider"""
    provider = ExternalDataProvider(
        name='test_provider',
        display_name='Test Provider',
        is_active=True,
        provider_type='finance',
        base_url='https://api.test.com',
        rate_limit_per_hour=1000,
        timeout_seconds=30
    )
    db_session.add(provider)
    db_session.commit()
    db_session.refresh(provider)
    return provider


class TestTickerSymbolMappingService:
    """Test suite for TickerSymbolMappingService"""

    def test_get_provider_symbol_with_fallback(self, db_session, test_ticker, test_provider):
        """Test getting provider symbol with fallback to internal symbol"""
        # Test without mapping - should return internal symbol
        symbol = TickerSymbolMappingService.get_provider_symbol_with_fallback(
            db_session, test_ticker.id, test_provider.id
        )
        assert symbol == 'TEST'
        
        # Create mapping
        TickerSymbolMappingService.set_provider_symbol(
            db_session, test_ticker.id, test_provider.id, 'TEST.MI', is_primary=True
        )
        
        # Test with mapping - should return provider symbol
        symbol = TickerSymbolMappingService.get_provider_symbol_with_fallback(
            db_session, test_ticker.id, test_provider.id
        )
        assert symbol == 'TEST.MI'

    def test_get_provider_symbol_none_when_no_mapping(self, db_session, test_ticker, test_provider):
        """Test getting provider symbol returns None when no mapping exists"""
        symbol = TickerSymbolMappingService.get_provider_symbol(
            db_session, test_ticker.id, test_provider.id
        )
        assert symbol is None

    def test_set_provider_symbol_create(self, db_session, test_ticker, test_provider):
        """Test creating a new provider symbol mapping"""
        mapping = TickerSymbolMappingService.set_provider_symbol(
            db_session, test_ticker.id, test_provider.id, 'TEST.MI', is_primary=True
        )
        
        assert mapping is not None
        assert mapping.ticker_id == test_ticker.id
        assert mapping.provider_id == test_provider.id
        assert mapping.provider_symbol == 'TEST.MI'
        assert mapping.is_primary is True
        
        # Verify it can be retrieved
        symbol = TickerSymbolMappingService.get_provider_symbol(
            db_session, test_ticker.id, test_provider.id
        )
        assert symbol == 'TEST.MI'

    def test_set_provider_symbol_update(self, db_session, test_ticker, test_provider):
        """Test updating an existing provider symbol mapping"""
        # Create initial mapping
        TickerSymbolMappingService.set_provider_symbol(
            db_session, test_ticker.id, test_provider.id, 'TEST.MI', is_primary=True
        )
        
        # Update mapping
        mapping = TickerSymbolMappingService.set_provider_symbol(
            db_session, test_ticker.id, test_provider.id, 'TEST.DE', is_primary=False
        )
        
        assert mapping.provider_symbol == 'TEST.DE'
        assert mapping.is_primary is False
        
        # Verify update
        symbol = TickerSymbolMappingService.get_provider_symbol(
            db_session, test_ticker.id, test_provider.id
        )
        assert symbol == 'TEST.DE'

    def test_delete_mapping(self, db_session, test_ticker, test_provider):
        """Test deleting a provider symbol mapping"""
        # Create mapping
        TickerSymbolMappingService.set_provider_symbol(
            db_session, test_ticker.id, test_provider.id, 'TEST.MI', is_primary=True
        )
        
        # Verify it exists
        symbol = TickerSymbolMappingService.get_provider_symbol(
            db_session, test_ticker.id, test_provider.id
        )
        assert symbol == 'TEST.MI'
        
        # Delete mapping
        success = TickerSymbolMappingService.delete_mapping(
            db_session, test_ticker.id, test_provider.id
        )
        assert success is True
        
        # Verify it's gone
        symbol = TickerSymbolMappingService.get_provider_symbol(
            db_session, test_ticker.id, test_provider.id
        )
        assert symbol is None

    def test_delete_mapping_not_found(self, db_session, test_ticker, test_provider):
        """Test deleting a non-existent mapping"""
        success = TickerSymbolMappingService.delete_mapping(
            db_session, test_ticker.id, test_provider.id
        )
        assert success is False

    def test_get_all_mappings(self, db_session, test_ticker, test_provider):
        """Test getting all mappings for a ticker"""
        # Create multiple mappings
        provider2 = ExternalDataProvider(
            name='test_provider_2',
            display_name='Test Provider 2',
            is_active=True,
            provider_type='finance',
            base_url='https://api.test2.com',
            rate_limit_per_hour=1000,
            timeout_seconds=30
        )
        db_session.add(provider2)
        db_session.commit()
        db_session.refresh(provider2)
        
        TickerSymbolMappingService.set_provider_symbol(
            db_session, test_ticker.id, test_provider.id, 'TEST.MI', is_primary=True
        )
        TickerSymbolMappingService.set_provider_symbol(
            db_session, test_ticker.id, provider2.id, 'TEST.DE', is_primary=True
        )
        
        # Get all mappings
        mappings = TickerSymbolMappingService.get_all_mappings(db_session, test_ticker.id)
        
        assert len(mappings) == 2
        provider_names = {m['provider_name'] for m in mappings}
        assert 'test_provider' in provider_names
        assert 'test_provider_2' in provider_names

    def test_get_all_mappings_empty(self, db_session, test_ticker):
        """Test getting all mappings when none exist"""
        mappings = TickerSymbolMappingService.get_all_mappings(db_session, test_ticker.id)
        assert mappings == []

    def test_get_provider_id_by_name(self, db_session, test_provider):
        """Test getting provider ID by name"""
        provider_id = TickerSymbolMappingService.get_provider_id_by_name(
            db_session, 'test_provider'
        )
        assert provider_id == test_provider.id

    def test_get_provider_id_by_name_not_found(self, db_session):
        """Test getting provider ID for non-existent provider"""
        provider_id = TickerSymbolMappingService.get_provider_id_by_name(
            db_session, 'non_existent_provider'
        )
        assert provider_id is None

    def test_cache_behavior(self, db_session, test_ticker, test_provider):
        """Test that caching works correctly"""
        # Create mapping
        TickerSymbolMappingService.set_provider_symbol(
            db_session, test_ticker.id, test_provider.id, 'TEST.MI', is_primary=True
        )
        
        # First call - should hit database
        symbol1 = TickerSymbolMappingService.get_provider_symbol(
            db_session, test_ticker.id, test_provider.id
        )
        assert symbol1 == 'TEST.MI'
        
        # Second call - should hit cache
        symbol2 = TickerSymbolMappingService.get_provider_symbol(
            db_session, test_ticker.id, test_provider.id
        )
        assert symbol2 == 'TEST.MI'
        
        # Update mapping - should invalidate cache
        TickerSymbolMappingService.set_provider_symbol(
            db_session, test_ticker.id, test_provider.id, 'TEST.DE', is_primary=True
        )
        
        # Should get new value
        symbol3 = TickerSymbolMappingService.get_provider_symbol(
            db_session, test_ticker.id, test_provider.id
        )
        assert symbol3 == 'TEST.DE'

    def test_fallback_to_internal_symbol(self, db_session, test_ticker, test_provider):
        """Test that fallback works when no mapping exists"""
        # No mapping created
        symbol = TickerSymbolMappingService.get_provider_symbol_with_fallback(
            db_session, test_ticker.id, test_provider.id
        )
        assert symbol == 'TEST'  # Internal symbol

    def test_example_500x_mapping(self, db_session, test_provider, test_currency):
        """Test the 500X -> 500X.MI example"""
        ticker = Ticker(
            symbol='500X',
            name='iShares Core S&P 500 UCITS ETF',
            type='etf',
            currency_id=test_currency.id,
            status='open'
        )
        db_session.add(ticker)
        db_session.commit()
        db_session.refresh(ticker)
        
        # Create mapping
        TickerSymbolMappingService.set_provider_symbol(
            db_session, ticker.id, test_provider.id, '500X.MI', is_primary=True
        )
        
        # Verify mapping
        symbol = TickerSymbolMappingService.get_provider_symbol_with_fallback(
            db_session, ticker.id, test_provider.id
        )
        assert symbol == '500X.MI'
        
        # Verify internal symbol is still '500X'
        assert ticker.symbol == '500X'

    def test_example_anau_mapping(self, db_session, test_provider, test_currency):
        """Test the ANAU -> ANAU.DE example"""
        ticker = Ticker(
            symbol='ANAU',
            name='Annaly Capital Management',
            type='stock',
            currency_id=test_currency.id,
            status='open'
        )
        db_session.add(ticker)
        db_session.commit()
        db_session.refresh(ticker)
        
        # Create mapping
        TickerSymbolMappingService.set_provider_symbol(
            db_session, ticker.id, test_provider.id, 'ANAU.DE', is_primary=True
        )
        
        # Verify mapping
        symbol = TickerSymbolMappingService.get_provider_symbol_with_fallback(
            db_session, ticker.id, test_provider.id
        )
        assert symbol == 'ANAU.DE'
        
        # Verify internal symbol is still 'ANAU'
        assert ticker.symbol == 'ANAU'

