#!/usr/bin/env python3
"""
User Data Import - Portfolio & Tax Tasks
=======================================

Unit tests covering the new portfolio_positions and taxes_and_fx task plugins.
"""

import os
import sys
import unittest
from datetime import datetime, timezone
from unittest.mock import MagicMock
from types import SimpleNamespace

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))

from services.user_data_import.normalization_service import NormalizationService
from services.user_data_import.validation_service import ValidationService
from services.user_data_import.duplicate_detection_service import DuplicateDetectionService
from services.user_data_import.import_orchestrator import ImportOrchestrator
from connectors.user_data_import.ibkr_connector import IBKRConnector


class _DummyConnector:
    """Minimal connector stub providing a source value."""

    def __init__(self, source: str = 'ibkr'):
        self._source = source

    def get_source_value(self) -> str:
        return self._source


class _SessionStub:
    """Simple import session stub for linking tests."""

    def __init__(self, summary=None, trading_account_id=None):
        self.id = 1
        self.trading_account_id = trading_account_id
        self.summary_data = summary or {}

    def get_summary_data(self, key=None):
        if key is None:
            return self.summary_data
        return self.summary_data.get(key)

    def add_summary_data(self, data):
        self.summary_data.update(data)
class TestUserDataImportTasks(unittest.TestCase):
    """Test suite for the new user data import tasks."""

    def setUp(self):
        self.normalizer = NormalizationService()
        self.validator = ValidationService()
        self.connector = _DummyConnector()
        self.statement_envelope = self.normalizer._normalize_date_envelope(
            datetime(2025, 11, 30, tzinfo=timezone.utc)
        )
        self.mock_db = MagicMock()
        self.mock_db.flush = MagicMock()

    def test_normalize_portfolio_record_generates_envelope_and_external_id(self):
        """Portfolio normalization should coerce numeric values and build an external id."""
        raw_record = {
            'record_type': 'open_position',
            'account_id': 'U123',
            'symbol': 'AAPL',
            'description': 'Apple Inc.',
            'asset_category': 'EQUITY',
            'currency': 'usd',
            'quantity': '25',
            'market_value': '1200.5',
            'statement_period_end': datetime(2025, 11, 1, tzinfo=timezone.utc),
        }

        result = self.normalizer.normalize_records(
            [raw_record],
            self.connector,
            task_type='portfolio_positions'
        )
        self.assertEqual(result['failed'], 0, result['errors'])
        normalized = result['normalized_records'][0]
        self.assertEqual(normalized['task_type'], 'portfolio_positions')
        self.assertEqual(normalized['currency'], 'USD')
        self.assertEqual(normalized['quantity'], 25.0)
        self.assertTrue(normalized['external_id'].startswith('U123_open_position'))
        self.assertIsInstance(normalized['statement_period_end'], dict)
        self.assertIn('utc', normalized['statement_period_end'])

    def test_normalize_tax_fx_record_handles_forex_metadata(self):
        """Tax/FX normalization should capture forex metadata and generate IDs."""
        raw_record = {
            'record_type': 'withholding_tax',
            'currency': 'usd',
            'amount': '42.5',
            'description': 'Dividend tax',
            'symbol': 'AAPL',
            'effective_date': datetime(2025, 11, 2, tzinfo=timezone.utc),
            'statement_period_end': datetime(2025, 11, 2, tzinfo=timezone.utc),
            'source_currency': 'usd',
            'target_currency': 'ils',
            'quantity': '100',
            'trade_price': '3.5',
        }

        result = self.normalizer.normalize_records(
            [raw_record],
            self.connector,
            task_type='taxes_and_fx'
        )
        self.assertEqual(result['failed'], 0, result['errors'])
        normalized = result['normalized_records'][0]
        self.assertEqual(normalized['task_type'], 'taxes_and_fx')
        self.assertEqual(normalized['amount'], 42.5)
        self.assertEqual(normalized['currency'], 'USD')
        self.assertTrue(normalized['external_id'].startswith('withholding_tax'))
        self.assertIsInstance(normalized['statement_period_end'], dict)

    def test_validate_portfolio_records_reports_zero_quantity_positions(self):
        """Validation should separate valid/invalid positions and track zero-value positions."""
        records = [
            {
                'record_type': 'open_position',
                'symbol': 'NVDA',
                'currency': 'USD',
                'account_id': 'U999',
                'asset_category': 'TECH',
                'market_value': 3200,
                'quantity': 40,
                'statement_period_end': self.statement_envelope,
            },
            {
                'record_type': 'open_position',
                'symbol': '',
                'currency': 'USD',
                'account_id': 'U999',
                'market_value': 0,
                'quantity': 0,
                'statement_period_end': self.statement_envelope,
            },
        ]

        result = self.validator._validate_portfolio_records(records)
        self.assertEqual(result['valid_count'], 1)
        self.assertEqual(result['invalid_count'], 1)
        self.assertEqual(result['currency_totals']['USD'], 3200)
        self.assertEqual(len(result['zero_quantity_positions']), 1)

    def test_validate_tax_fx_records_tracks_totals_and_nav_components(self):
        """Validation should aggregate currency totals, NAV components, and forex trades."""
        records = [
            {
                'record_type': 'withholding_tax',
                'currency': 'USD',
                'amount': 50,
                'description': 'IRS',
                'statement_period_end': self.statement_envelope,
                'effective_date': self.statement_envelope,
            },
            {
                'record_type': 'nav_component',
                'currency': '',
                'amount': 125,
                'component': 'mtm',
                'statement_period_end': self.statement_envelope,
                'effective_date': self.statement_envelope,
            },
            {
                'record_type': 'forex_conversion',
                'currency': 'USD',
                'amount': 20,
                'source_currency': 'USD',
                'target_currency': 'ILS',
                'quantity': 100,
                'trade_price': 3.5,
                'statement_period_end': self.statement_envelope,
                'effective_date': self.statement_envelope,
            },
            {
                'record_type': 'tax_cashflow',
                'currency': '',
                'amount': 15,
                'description': 'Missing currency',
                'statement_period_end': self.statement_envelope,
                'effective_date': self.statement_envelope,
            },
        ]

        result = self.validator._validate_tax_fx_records(records)
        self.assertEqual(result['valid_count'], 3)
        self.assertEqual(result['invalid_count'], 1)
        self.assertEqual(result['totals_by_currency']['USD'], 50.0)
        self.assertEqual(result['totals_by_type']['withholding_tax'], 50.0)
        self.assertEqual(result['nav_components']['mtm'], 125.0)
        self.assertEqual(len(result['forex_trades']), 1)
        self.assertTrue(result['validation_errors'])

    def test_duplicate_detection_passthrough_for_report_only_tasks(self):
        """Report-only tasks should return all records as clean with no duplicates."""
        duplicate_detector = DuplicateDetectionService(db_session=None)
        records = [
            {'external_id': 'portfolio_1', 'statement_period_end': self.statement_envelope},
            {'external_id': 'portfolio_2', 'statement_period_end': self.statement_envelope},
        ]

        portfolio_result = duplicate_detector.detect_duplicates(
            records,
            trading_trading_account_id=1,
            task_type='portfolio_positions'
        )
        self.assertEqual(portfolio_result['duplicate_count'], 0)
        self.assertEqual(portfolio_result['clean_count'], 2)

        tax_result = duplicate_detector.detect_duplicates(
            records,
            trading_trading_account_id=1,
            task_type='taxes_and_fx'
        )
        self.assertEqual(tax_result['duplicate_count'], 0)
        self.assertEqual(tax_result['clean_count'], 2)

    def test_detect_account_binding_returns_matched_account(self):
        """detect_account_binding should surface metadata and matched account."""
        matched_account = SimpleNamespace(
            id=77,
            name='Auto',
            currency=None,
            external_account_number='U777'
        )
        self.mock_db.query.return_value.filter.return_value.first.return_value = matched_account
        orchestrator = ImportOrchestrator(self.mock_db)
        orchestrator.connectors['auto'] = SimpleNamespace(
            extract_account_metadata=lambda content: {'account_id': 'U777'}
        )

        result = orchestrator.detect_account_binding('auto', 'FAKE')

        self.assertEqual(result['file_account_number'], 'U777')
        self.assertIs(result['matched_account'], matched_account)

    def test_confirm_account_link_updates_session(self):
        """confirm_account_link should mark the session as confirmed and assign account."""
        session_stub = _SessionStub({'linking_matched_account_id': 5, 'linking_confirmed': False})
        matched_account = SimpleNamespace(
            id=5,
            name='Linked',
            currency=None,
            currency_id=1,
            status='open',
            external_account_number='U555'
        )

        query_mock = self.mock_db.query.return_value
        filter_mock = query_mock.filter.return_value
        filter_mock.first.side_effect = [session_stub, matched_account]

        orchestrator = ImportOrchestrator(self.mock_db)
        result = orchestrator.confirm_account_link(session_id=1)

        self.assertTrue(result['success'])
        self.assertTrue(session_stub.get_summary_data('linking_confirmed'))
        self.assertEqual(session_stub.trading_account_id, matched_account.id)
        self.mock_db.flush.assert_called()

    def test_syep_cashflows_map_to_dedicated_storage_type(self):
        """SYEP interest cashflows should retain their dedicated storage type."""
        orchestrator = ImportOrchestrator(self.mock_db)
        storage_type, note = orchestrator._resolve_cashflow_storage_type({
            'cashflow_type': 'syep_interest',
            'amount': 12.34
        })

        self.assertEqual(storage_type, 'syep_interest')
        self.assertEqual(note, 'SYEP interest')

    def test_ibkr_precheck_rejects_missing_headers(self):
        """IBKR precheck should fail when essential headers are missing."""
        connector = IBKRConnector()
        sample_content = "Interactive Brokers LLC\nTrades,Header,DataDiscriminator,Asset Category\n"
        result = connector.precheck_file(sample_content, file_name='ibkr.csv')

        self.assertFalse(result['success'])
        self.assertTrue(result['errors'])

    def test_ibkr_precheck_accepts_valid_statement(self):
        """IBKR precheck should succeed when required headers and account info exist."""
        connector = IBKRConnector()
        sample_content = "\n".join([
            "Interactive Brokers LLC",
            "Activity Statement",
            "Statement,Header,Field Name,Field Value",
            "Account Information,Header,Field Name,Field Value",
            "Account Information,Data,Account ID,U12345",
            "Trades,Header,DataDiscriminator,Asset Category"
        ])
        result = connector.precheck_file(sample_content, file_name='statement.csv')

        self.assertTrue(result['success'])
        self.assertTrue(result.get('message'))


if __name__ == '__main__':
    unittest.main()

