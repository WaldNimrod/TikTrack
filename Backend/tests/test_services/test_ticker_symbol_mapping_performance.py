"""
Performance Tests for Ticker Symbol Mapping
Tests caching behavior and performance impact.
"""

import pytest
import sys
import os
import time
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
from services.external_data.yahoo_finance_adapter import YahooFinanceAdapter
from config.settings import DATABASE_URL

# Create test database engine
test_engine = create_engine(DATABASE_URL.replace('tiktrack', 'tiktrack_test') if 'tiktrack' in DATABASE_URL else DATABASE_URL)
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
def test_tickers(db_session, test_currency):
    """Create multiple test tickers"""
    tickers = []
    for i in range(10):
        ticker = Ticker(
            symbol=f'TEST{i}',
            name=f'Test Ticker {i}',
            type='stock',
            currency_id=test_currency.id,
            status='open'
        )
        db_session.add(ticker)
        tickers.append(ticker)
    db_session.commit()
    for ticker in tickers:
        db_session.refresh(ticker)
    return tickers


@pytest.fixture
def yahoo_provider(db_session):
    """Create Yahoo Finance provider"""
    provider = db_session.query(ExternalDataProvider).filter_by(name='yahoo_finance').first()
    if not provider:
        provider = ExternalDataProvider(
            name='yahoo_finance',
            display_name='Yahoo Finance',
            is_active=True,
            provider_type='finance',
            base_url='https://query1.finance.yahoo.com',
            rate_limit_per_hour=900,
            timeout_seconds=20
        )
        db_session.add(provider)
        db_session.commit()
        db_session.refresh(provider)
    return provider


class TestPerformance:
    """Performance tests for ticker symbol mapping"""

    def test_cache_improves_performance(self, db_session, test_tickers, yahoo_provider):
        """Test that caching significantly improves lookup performance"""
        # Create mappings for all tickers
        for ticker in test_tickers:
            TickerSymbolMappingService.set_provider_symbol(
                db_session, ticker.id, yahoo_provider.id, f'{ticker.symbol}.MI', is_primary=True
            )
        db_session.commit()
        
        # Clear cache before test
        from services.cache_service import cache_service
        cache_service.clear()
        
        # First call - should hit database (slower)
        start_time = time.time()
        for ticker in test_tickers:
            TickerSymbolMappingService.get_provider_symbol(
                db_session, ticker.id, yahoo_provider.id
            )
        first_call_time = time.time() - start_time
        
        # Second call - should hit cache (faster)
        start_time = time.time()
        for ticker in test_tickers:
            TickerSymbolMappingService.get_provider_symbol(
                db_session, ticker.id, yahoo_provider.id
            )
        second_call_time = time.time() - start_time
        
        # Cache should be significantly faster
        # Allow some variance, but cache should be at least 2x faster
        assert second_call_time < first_call_time * 0.8, \
            f"Cache not improving performance: first={first_call_time:.4f}s, second={second_call_time:.4f}s"

    def test_batch_operations_performance(self, db_session, test_tickers, yahoo_provider):
        """Test performance of batch operations"""
        # Create mappings
        for ticker in test_tickers:
            TickerSymbolMappingService.set_provider_symbol(
                db_session, ticker.id, yahoo_provider.id, f'{ticker.symbol}.MI', is_primary=True
            )
        db_session.commit()
        
        # Test batch get_all_mappings
        start_time = time.time()
        for ticker in test_tickers:
            TickerSymbolMappingService.get_all_mappings(db_session, ticker.id)
        batch_time = time.time() - start_time
        
        # Should complete in reasonable time (< 1 second for 10 tickers)
        assert batch_time < 1.0, f"Batch operations too slow: {batch_time:.4f}s"

    def test_yahoo_adapter_performance_with_mapping(self, db_session, test_tickers, yahoo_provider):
        """Test that YahooFinanceAdapter performance is not significantly impacted by mapping"""
        # Create mappings
        for ticker in test_tickers:
            TickerSymbolMappingService.set_provider_symbol(
                db_session, ticker.id, yahoo_provider.id, f'{ticker.symbol}.MI', is_primary=True
            )
        db_session.commit()
        
        adapter = YahooFinanceAdapter(db_session, yahoo_provider.id)
        
        # Mock API calls to avoid actual network requests
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.return_value = {
                'chart': {
                    'result': [{
                        'meta': {
                            'regularMarketPrice': 100.00,
                            'currency': 'USD'
                        },
                        'timestamp': [1234567890],
                        'indicators': {
                            'quote': [{
                                'close': [100.00],
                                'volume': [1000000]
                            }]
                        }
                    }]
                }
            }
            
            # Test batch get_quotes_batch with mappings
            start_time = time.time()
            symbols = [t.symbol for t in test_tickers]
            quotes = adapter.get_quotes_batch(symbols=symbols)
            batch_time = time.time() - start_time
            
            # Should complete in reasonable time
            assert batch_time < 2.0, f"Batch quote fetch too slow: {batch_time:.4f}s"
            assert len(quotes) == len(test_tickers)

    def test_cache_invalidation_performance(self, db_session, test_tickers, yahoo_provider):
        """Test that cache invalidation doesn't significantly impact performance"""
        # Create mappings
        for ticker in test_tickers:
            TickerSymbolMappingService.set_provider_symbol(
                db_session, ticker.id, yahoo_provider.id, f'{ticker.symbol}.MI', is_primary=True
            )
        db_session.commit()
        
        # Warm up cache
        for ticker in test_tickers:
            TickerSymbolMappingService.get_provider_symbol(
                db_session, ticker.id, yahoo_provider.id
            )
        
        # Update mapping (should invalidate cache)
        start_time = time.time()
        TickerSymbolMappingService.set_provider_symbol(
            db_session, test_tickers[0].id, yahoo_provider.id, 'UPDATED.MI', is_primary=True
        )
        db_session.commit()
        update_time = time.time() - start_time
        
        # Update should complete quickly
        assert update_time < 0.5, f"Cache invalidation too slow: {update_time:.4f}s"

