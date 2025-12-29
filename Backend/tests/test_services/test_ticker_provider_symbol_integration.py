"""
Integration Tests for Ticker Provider Symbol Mapping
Tests the integration between TickerSymbolMappingService, YahooFinanceAdapter, and ImportOrchestrator.
"""

import pytest
import sys
import os
from pathlib import Path
from unittest.mock import Mock, patch, MagicMock

# Add Backend to path
backend_dir = Path(__file__).parent.parent.parent
sys.path.insert(0, str(backend_dir))

from models.ticker import Ticker, TickerProviderSymbol
from models.external_data import ExternalDataProvider
from services.ticker_symbol_mapping_service import TickerSymbolMappingService
from services.external_data.yahoo_finance_adapter import YahooFinanceAdapter
from services.user_data_import.import_orchestrator import ImportOrchestrator



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


class TestYahooFinanceAdapterIntegration:
    """Test integration with YahooFinanceAdapter"""

    def test_yahoo_adapter_uses_mapping(self, db_session, yahoo_provider, test_currency):
        """Test that YahooFinanceAdapter uses provider symbol mapping"""
        # Create ticker with unique symbol
        ticker = Ticker(
            symbol='500X_TEST1',
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
            db_session, ticker.id, yahoo_provider.id, '500X.MI', is_primary=True
        )
        
        # Create adapter
        adapter = YahooFinanceAdapter(db_session, yahoo_provider.id)
        
        # Test _get_provider_symbol method
        provider_symbol = adapter._get_provider_symbol(ticker)
        assert provider_symbol == '500X.MI'
        
        # Verify fallback works
        TickerSymbolMappingService.delete_mapping(db_session, ticker.id, yahoo_provider.id)
        provider_symbol = adapter._get_provider_symbol(ticker)
        assert provider_symbol == '500X_TEST1'  # Falls back to internal symbol

    def test_yahoo_adapter_get_quote_with_mapping(self, db_session, yahoo_provider, test_currency):
        """Test get_quote with ticker object uses mapping"""
        # Create ticker with unique symbol
        ticker = Ticker(
            symbol='500X_TEST2',
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
            db_session, ticker.id, yahoo_provider.id, '500X.MI', is_primary=True
        )
        
        # Create adapter
        adapter = YahooFinanceAdapter(db_session, yahoo_provider.id)
        
        # Mock the API call to verify correct symbol is used
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.return_value = {
                'chart': {
                    'result': [{
                        'meta': {
                            'regularMarketPrice': 150.25,
                            'currency': 'EUR'
                        },
                        'timestamp': [1234567890],
                        'indicators': {
                            'quote': [{
                                'close': [150.25]
                            }]
                        }
                    }]
                }
            }
            
            # Call get_quote with symbol and ticker object
            quote = adapter.get_quote(symbol=ticker.symbol, ticker=ticker)
            
            # Verify API was called with provider symbol
            assert mock_request.called
            call_args = mock_request.call_args
            assert '500X.MI' in call_args[0][0]  # URL contains provider symbol
            
            # Verify quote uses internal symbol
            if quote:
                assert quote.symbol == '500X_TEST2'  # Internal symbol

    def test_yahoo_adapter_get_quotes_batch_with_mapping(self, db_session, yahoo_provider, test_currency):
        """Test get_quotes_batch with ticker objects uses mappings"""
        # Create tickers with unique symbols
        ticker1 = Ticker(symbol='500X_TEST3', name='Test 1', type='etf', currency_id=test_currency.id, status='open')
        ticker2 = Ticker(symbol='ANAU_TEST3', name='Test 2', type='stock', currency_id=test_currency.id, status='open')
        db_session.add_all([ticker1, ticker2])
        db_session.commit()
        db_session.refresh(ticker1)
        db_session.refresh(ticker2)
        
        # Create mappings
        TickerSymbolMappingService.set_provider_symbol(
            db_session, ticker1.id, yahoo_provider.id, '500X.MI', is_primary=True
        )
        TickerSymbolMappingService.set_provider_symbol(
            db_session, ticker2.id, yahoo_provider.id, 'ANAU.DE', is_primary=True
        )
        
        # Create adapter
        adapter = YahooFinanceAdapter(db_session, yahoo_provider.id)
        
        # Mock API calls
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.return_value = {
                'chart': {
                    'result': [{
                        'meta': {
                            'regularMarketPrice': 150.25,
                            'currency': 'EUR'
                        },
                        'timestamp': [1234567890],
                        'indicators': {
                            'quote': [{
                                'close': [150.25]
                            }]
                        }
                    }]
                }
            }
            
            # Call get_quotes_batch with symbols (adapter will use mappings internally)
            quotes = adapter.get_quotes_batch(symbols=[ticker1.symbol, ticker2.symbol])
            
            # Verify API was called with provider symbols
            assert mock_request.called
            # Should be called for each ticker with provider symbol
            call_urls = [call[0][0] for call in mock_request.call_args_list]
            assert any('500X.MI' in url for url in call_urls)
            assert any('ANAU.DE' in url for url in call_urls)


class TestImportOrchestratorIntegration:
    """Test integration with ImportOrchestrator"""

    def test_import_creates_mapping_automatically(self, db_session, yahoo_provider, test_currency):
        """Test that import creates mapping automatically when display_symbol differs"""
        # Create orchestrator
        orchestrator = ImportOrchestrator(db_session)
        
        # Create ticker (simulating import process)
        ticker = Ticker(
            symbol='500X_TEST4',
            name='iShares Core S&P 500 UCITS ETF',
            type='etf',
            currency_id=test_currency.id,
            status='open'
        )
        db_session.add(ticker)
        db_session.commit()
        db_session.refresh(ticker)
        
        # Simulate metadata with display_symbol different from internal symbol
        metadata = {
            '500X_TEST4': {
                'symbol': '500X_TEST4',
                'display_symbol': '500X.MI',  # Different from internal symbol
                'company_name': 'iShares Core S&P 500 UCITS ETF'
            }
        }

        # Simulate enriched records
        enriched_records = [{
            'ticker_id': ticker.id,
            'symbol': '500X_TEST4'
        }]
        
        # Call _update_ticker_metadata (which should create mapping)
        orchestrator._update_ticker_metadata(enriched_records, metadata)
        db_session.commit()
        
        # Verify mapping was created
        mapping = db_session.query(TickerProviderSymbol).filter_by(
            ticker_id=ticker.id,
            provider_id=yahoo_provider.id
        ).first()
        
        assert mapping is not None
        assert mapping.provider_symbol == '500X.MI'

    def test_import_no_mapping_when_symbols_match(self, db_session, yahoo_provider, test_currency):
        """Test that import doesn't create mapping when display_symbol matches internal symbol"""
        # Create orchestrator
        orchestrator = ImportOrchestrator(db_session)
        
        # Create ticker
        ticker = Ticker(
            symbol='AAPL_TEST5',
            name='Apple Inc.',
            type='stock',
            currency_id=test_currency.id,
            status='open'
        )
        db_session.add(ticker)
        db_session.commit()
        db_session.refresh(ticker)
        
        # Simulate metadata with display_symbol same as internal symbol
        metadata = {
            'AAPL_TEST5': {
                'symbol': 'AAPL_TEST5',
                'display_symbol': 'AAPL_TEST5',  # Same as internal symbol
                'company_name': 'Apple Inc.'
            }
        }

        # Simulate enriched records
        enriched_records = [{
            'ticker_id': ticker.id,
            'symbol': 'AAPL_TEST5'
        }]
        
        # Call _update_ticker_metadata
        orchestrator._update_ticker_metadata(enriched_records, metadata)
        db_session.commit()
        
        # Verify no mapping was created
        mapping = db_session.query(TickerProviderSymbol).filter_by(
            ticker_id=ticker.id,
            provider_id=yahoo_provider.id
        ).first()
        
        assert mapping is None


class TestAPIIntegration:
    """Test API integration"""

    def test_create_ticker_with_provider_symbols(self, db_session, yahoo_provider, test_currency):
        """Test creating ticker via API with provider_symbols"""
        from services.ticker_service import TickerService
        
        # Simulate API request data
        ticker_data = {
            'symbol': '500X',
            'name': 'iShares Core S&P 500 UCITS ETF',
            'type': 'etf',
            'currency_id': test_currency.id,
            'status': 'open',
            'provider_symbols': {
                'yahoo_finance': '500X.MI'
            }
        }
        
        # Create ticker (simulating API create_ticker endpoint)
        provider_symbols = ticker_data.pop('provider_symbols', None)
        ticker = TickerService.create(db_session, ticker_data)
        
        # Create mappings (simulating API endpoint logic)
        if provider_symbols and isinstance(provider_symbols, dict):
            for provider_name, provider_symbol in provider_symbols.items():
                if provider_symbol and isinstance(provider_symbol, str):
                    provider = db_session.query(ExternalDataProvider).filter_by(name=provider_name).first()
                    if provider:
                        TickerSymbolMappingService.set_provider_symbol(
                            db_session, ticker.id, provider.id, provider_symbol.strip(), is_primary=True
                        )
        
        db_session.commit()
        
        # Verify ticker created
        assert ticker.id is not None
        assert ticker.symbol == '500X'
        
        # Verify mapping created
        mapping = db_session.query(TickerProviderSymbol).filter_by(
            ticker_id=ticker.id,
            provider_id=yahoo_provider.id
        ).first()
        
        assert mapping is not None
        assert mapping.provider_symbol == '500X.MI'

    def test_update_ticker_with_provider_symbols(self, db_session, yahoo_provider, test_currency):
        """Test updating ticker via API with provider_symbols"""
        import uuid
        from services.ticker_service import TickerService

        # Create ticker first with unique symbol (max 10 chars)
        unique_symbol = f'UPD{uuid.uuid4().hex[:4]}'
        ticker = TickerService.create(db_session, {
            'symbol': unique_symbol,
            'name': 'iShares Core S&P 500 UCITS ETF',
            'type': 'etf',
            'currency_id': test_currency.id,
            'status': 'open'
        })
        db_session.commit()
        
        # Simulate API update request
        update_data = {
            'name': 'Updated Name',
            'provider_symbols': {
                'yahoo_finance': '500X.MI'
            }
        }
        
        # Update ticker (simulating API update_ticker endpoint)
        provider_symbols = update_data.pop('provider_symbols', None)
        # Keep symbol in update_data for TickerService.update
        update_data['symbol'] = ticker.symbol
        TickerService.update(db_session, ticker.id, update_data)
        
        # Update mappings (simulating API endpoint logic)
        if provider_symbols is not None and isinstance(provider_symbols, dict):
            for provider_name, provider_symbol in provider_symbols.items():
                if provider_symbol and isinstance(provider_symbol, str):
                    provider = db_session.query(ExternalDataProvider).filter_by(name=provider_name).first()
                    if provider:
                        TickerSymbolMappingService.set_provider_symbol(
                            db_session, ticker.id, provider.id, provider_symbol.strip(), is_primary=True
                        )
        
        db_session.commit()
        
        # Verify mapping created
        mapping = db_session.query(TickerProviderSymbol).filter_by(
            ticker_id=ticker.id,
            provider_id=yahoo_provider.id
        ).first()
        
        assert mapping is not None
        assert mapping.provider_symbol == '500X.MI'

