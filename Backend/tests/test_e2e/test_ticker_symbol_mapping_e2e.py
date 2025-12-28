"""
End-to-End Tests for Ticker Provider Symbol Mapping
Tests complete scenarios: 500X->500X.MI, ANAU->ANAU.DE, and import auto-mapping.
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
from services.ticker_service import TickerService

@pytest.fixture
def test_currency(db_session):
    """Create a test currency"""
    from models.currency import Currency
    # Use a unique symbol to avoid conflicts between tests
    import uuid
    symbol = f'USD_{uuid.uuid4().hex[:4].upper()}'
    currency = Currency(
        name='Test Dollar',
        symbol=symbol,
        usd_rate=1.0
    )
    db_session.add(currency)
    db_session.commit()
    db_session.refresh(currency)
    return currency


@pytest.fixture
def yahoo_provider(db_session):
    """Create Yahoo Finance provider"""
    # Check if provider already exists (for import tests that expect 'yahoo_finance')
    existing_provider = db_session.query(ExternalDataProvider).filter_by(name='yahoo_finance').first()
    if existing_provider:
        return existing_provider

    # Create new provider with fixed name for compatibility
    provider = ExternalDataProvider(
        name='yahoo_finance',  # Fixed name for import orchestrator compatibility
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


class TestE2EScenarios:
    """End-to-end test scenarios"""

    def test_scenario_500x_to_500x_mi(self, db_session, yahoo_provider, test_currency):
        """
        E2E Test: 500X -> 500X.MI

        Scenario:
        1. Create ticker "500X"
        2. Add mapping "500X.MI" for Yahoo Finance
        3. Fetch quote using YahooFinanceAdapter
        4. Verify Yahoo API called with "500X.MI"
        5. Verify quote stored with internal symbol "500X"
        """
        # Use unique symbol to avoid conflicts
        import uuid
        unique_symbol = f'500X_{uuid.uuid4().hex[:4].upper()}'

        # Step 1: Create ticker
        ticker = TickerService.create(db_session, {
            'symbol': unique_symbol,
            'name': 'iShares Core S&P 500 UCITS ETF',
            'type': 'etf',
            'currency_id': test_currency.id,
            'status': 'open'
        })
        db_session.commit()
        db_session.refresh(ticker)

        assert ticker.symbol == unique_symbol
        assert ticker.id is not None

        # Step 2: Create mapping
        mapping = TickerSymbolMappingService.set_provider_symbol(
            db_session, ticker.id, yahoo_provider.id, '500X.MI', is_primary=True
        )
        db_session.commit()

        assert mapping is not None
        assert mapping.provider_symbol == '500X.MI'

        # Step 3: Fetch quote using adapter
        adapter = YahooFinanceAdapter(db_session, yahoo_provider.id)

        # Mock API response
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.return_value = {
                'chart': {
                    'result': [{
                        'meta': {
                            'regularMarketPrice': 150.25,
                            'currency': 'EUR',
                            'regularMarketChange': 1.25,
                            'regularMarketChangePercent': 0.84
                        },
                        'timestamp': [1234567890],
                        'indicators': {
                            'quote': [{
                                'close': [150.25],
                                'volume': [1000000]
                            }]
                        }
                    }]
                }
            }

            # Fetch quote with symbol and ticker object
            quote = adapter.get_quote(symbol=ticker.symbol, ticker=ticker)

            # Step 4: Verify API called with provider symbol
            assert mock_request.called
            call_url = mock_request.call_args[0][0]
            assert '500X.MI' in call_url

            # Step 5: Verify quote uses internal symbol
            if quote:
                assert quote.symbol == unique_symbol  # Internal symbol
                assert quote.price == 150.25

    def test_scenario_anau_to_anau_de(self, db_session, yahoo_provider, test_currency):
        """
        E2E Test: ANAU -> ANAU.DE

        Scenario:
        1. Create ticker "ANAU"
        2. Add mapping "ANAU.DE" for Yahoo Finance
        3. Fetch quote using YahooFinanceAdapter
        4. Verify Yahoo API called with "ANAU.DE"
        5. Verify quote uses internal symbol "ANAU"
        """
        # Use unique symbol to avoid conflicts
        import uuid
        unique_symbol = f'ANAU_{uuid.uuid4().hex[:4].upper()}'

        # Step 1: Create ticker
        ticker = TickerService.create(db_session, {
            'symbol': unique_symbol,
            'name': 'Annaly Capital Management',
            'type': 'stock',
            'currency_id': test_currency.id,
            'status': 'open'
        })
        db_session.commit()
        db_session.refresh(ticker)

        assert ticker.symbol == unique_symbol

        # Step 2: Create mapping
        mapping = TickerSymbolMappingService.set_provider_symbol(
            db_session, ticker.id, yahoo_provider.id, 'ANAU.DE', is_primary=True
        )
        db_session.commit()

        assert mapping.provider_symbol == 'ANAU.DE'

        # Step 3: Fetch quote
        adapter = YahooFinanceAdapter(db_session, yahoo_provider.id)

        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.return_value = {
                'chart': {
                    'result': [{
                        'meta': {
                            'regularMarketPrice': 25.50,
                            'currency': 'EUR'
                        },
                        'timestamp': [1234567890],
                        'indicators': {
                            'quote': [{
                                'close': [25.50],
                                'volume': [500000]
                            }]
                        }
                    }]
                }
            }

            quote = adapter.get_quote(symbol=ticker.symbol, ticker=ticker)

            # Step 4: Verify API called with provider symbol
            assert mock_request.called
            call_url = mock_request.call_args[0][0]
            assert 'ANAU.DE' in call_url

            # Step 5: Verify quote uses internal symbol
            if quote:
                assert quote.symbol == unique_symbol  # Internal symbol

    def test_scenario_import_auto_mapping(self, db_session, yahoo_provider, test_currency):
        """
        E2E Test: Import Auto-Mapping
        
        Scenario:
        1. Import file contains "500X" (shortened symbol)
        2. Metadata contains display_symbol = "500X.MI"
        3. Import process creates ticker "500X"
        4. Import process automatically creates mapping "500X.MI"
        5. Verify mapping exists
        6. Verify Yahoo Finance can use mapping
        """
        # Use unique symbol to avoid conflicts
        import uuid
        unique_symbol = f'500X_{uuid.uuid4().hex[:4].upper()}'

        # Step 1-3: Simulate import process creating ticker
        orchestrator = ImportOrchestrator(db_session)

        ticker = Ticker(
            symbol=unique_symbol,
            name='iShares Core S&P 500 UCITS ETF',
            type='etf',
            currency_id=test_currency.id,
            status='open'
        )
        db_session.add(ticker)
        db_session.commit()
        db_session.refresh(ticker)
        
        # Step 2-4: Simulate metadata update (auto-mapping)
        metadata = {
            unique_symbol: {
                'symbol': unique_symbol,
                'display_symbol': '500X.MI',  # Different from internal symbol
                'company_name': 'iShares Core S&P 500 UCITS ETF'
            }
        }

        enriched_records = [{
            'ticker_id': ticker.id,
            'symbol': unique_symbol
        }]
        
        # This should create mapping automatically
        orchestrator._update_ticker_metadata(enriched_records, metadata)
        db_session.commit()
        
        # Step 5: Verify mapping exists
        mapping = db_session.query(TickerProviderSymbol).filter_by(
            ticker_id=ticker.id,
            provider_id=yahoo_provider.id
        ).first()
        
        assert mapping is not None
        assert mapping.provider_symbol == '500X.MI'
        
        # Step 6: Verify Yahoo Finance can use mapping
        adapter = YahooFinanceAdapter(db_session, yahoo_provider.id)
        provider_symbol = adapter._get_provider_symbol(ticker)
        assert provider_symbol == '500X.MI'

    def test_scenario_fallback_when_no_mapping(self, db_session, yahoo_provider, test_currency):
        """
        E2E Test: Fallback when no mapping exists

        Scenario:
        1. Create ticker "AAPL" (no mapping needed)
        2. Fetch quote using YahooFinanceAdapter
        3. Verify Yahoo API called with "AAPL" (internal symbol)
        4. Verify quote stored with "AAPL"
        """
        # Use unique symbol to avoid conflicts
        import uuid
        unique_symbol = f'AAPL_{uuid.uuid4().hex[:4].upper()}'

        # Step 1: Create ticker without mapping
        ticker = TickerService.create(db_session, {
            'symbol': unique_symbol,
            'name': 'Apple Inc.',
            'type': 'stock',
            'currency_id': test_currency.id,
            'status': 'open'
        })
        db_session.commit()
        db_session.refresh(ticker)

        # Step 2: Fetch quote
        adapter = YahooFinanceAdapter(db_session, yahoo_provider.id)

        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.return_value = {
                'chart': {
                    'result': [{
                        'meta': {
                            'regularMarketPrice': 175.00,
                            'currency': 'USD'
                        },
                        'timestamp': [1234567890],
                        'indicators': {
                            'quote': [{
                                'close': [175.00],
                                'volume': [50000000]
                            }]
                        }
                    }]
                }
            }

            quote = adapter.get_quote(symbol=ticker.symbol, ticker=ticker)

            # Step 3: Verify API called with internal symbol (no mapping)
            assert mock_request.called
            call_url = mock_request.call_args[0][0]
            assert unique_symbol in call_url  # Internal symbol used

            # Step 4: Verify quote stored with internal symbol
            if quote:
                assert quote.symbol == unique_symbol

    def test_scenario_update_mapping(self, db_session, yahoo_provider, test_currency):
        """
        E2E Test: Update existing mapping

        Scenario:
        1. Create ticker "500X" with mapping "500X.MI"
        2. Update mapping to "500X.IT"
        3. Verify new mapping is used
        """
        # Use unique symbol to avoid conflicts
        import uuid
        unique_symbol = f'500X_{uuid.uuid4().hex[:4].upper()}'

        # Step 1: Create ticker with initial mapping
        ticker = TickerService.create(db_session, {
            'symbol': unique_symbol,
            'name': 'iShares Core S&P 500 UCITS ETF',
            'type': 'etf',
            'currency_id': test_currency.id,
            'status': 'open'
        })
        db_session.commit()
        db_session.refresh(ticker)

        TickerSymbolMappingService.set_provider_symbol(
            db_session, ticker.id, yahoo_provider.id, '500X.MI', is_primary=True
        )
        db_session.commit()

        # Verify initial mapping
        symbol = TickerSymbolMappingService.get_provider_symbol(
            db_session, ticker.id, yahoo_provider.id
        )
        assert symbol == '500X.MI'

        # Step 2: Update mapping
        TickerSymbolMappingService.set_provider_symbol(
            db_session, ticker.id, yahoo_provider.id, '500X.IT', is_primary=True
        )
        db_session.commit()

        # Step 3: Verify new mapping
        symbol = TickerSymbolMappingService.get_provider_symbol(
            db_session, ticker.id, yahoo_provider.id
        )
        assert symbol == '500X.IT'

        # Verify adapter uses new mapping
        adapter = YahooFinanceAdapter(db_session, yahoo_provider.id)
        provider_symbol = adapter._get_provider_symbol(ticker)
        assert provider_symbol == '500X.IT'

    def test_scenario_delete_mapping_fallback(self, db_session, yahoo_provider, test_currency):
        """
        E2E Test: Delete mapping and verify fallback

        Scenario:
        1. Create ticker "500X" with mapping "500X.MI"
        2. Delete mapping
        3. Verify fallback to internal symbol "500X"
        """
        # Use unique symbol to avoid conflicts
        import uuid
        unique_symbol = f'500X_{uuid.uuid4().hex[:4].upper()}'

        # Step 1: Create ticker with mapping
        ticker = TickerService.create(db_session, {
            'symbol': unique_symbol,
            'name': 'iShares Core S&P 500 UCITS ETF',
            'type': 'etf',
            'currency_id': test_currency.id,
            'status': 'open'
        })
        db_session.commit()
        db_session.refresh(ticker)

        TickerSymbolMappingService.set_provider_symbol(
            db_session, ticker.id, yahoo_provider.id, '500X.MI', is_primary=True
        )
        db_session.commit()

        # Verify mapping exists
        symbol = TickerSymbolMappingService.get_provider_symbol(
            db_session, ticker.id, yahoo_provider.id
        )
        assert symbol == '500X.MI'

        # Step 2: Delete mapping
        success = TickerSymbolMappingService.delete_mapping(
            db_session, ticker.id, yahoo_provider.id
        )
        assert success is True
        db_session.commit()

        # Step 3: Verify fallback
        adapter = YahooFinanceAdapter(db_session, yahoo_provider.id)
        provider_symbol = adapter._get_provider_symbol(ticker)
        assert provider_symbol == unique_symbol  # Falls back to internal symbol

