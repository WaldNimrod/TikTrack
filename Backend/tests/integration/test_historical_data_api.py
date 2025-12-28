"""
Integration Tests for Historical Data API
==============================================

Tests all Historical Data API endpoints including:
- Trade History API
- Portfolio State API
- Trading Journal API
"""

import pytest
from flask import Flask, g
from unittest.mock import Mock, patch, MagicMock
import json
from datetime import datetime, timezone


@pytest.fixture
def app():
    """Create Flask app for testing."""
    from Backend.app import create_app
    app = create_app({'TESTING': True})
    return app


@pytest.fixture
def client(app):
    """Create test client."""
    return app.test_client()


@pytest.fixture
def mock_user_id():
    """Mock user ID for testing."""
    return 1


def patch_getattr_for_routes(mock_user_id):
    """Helper to patch getattr in route modules."""
    patches = []
    
    # Patch getattr in all route modules
    for module_path in [
        'routes.api.trade_history.getattr',
        'routes.api.portfolio_state.getattr',
        'routes.api.trading_journal.getattr'
    ]:
        p = patch(module_path, side_effect=lambda obj, attr, default=None: mock_user_id if attr == 'user_id' and hasattr(obj, '__class__') and obj.__class__.__name__ == '_AppCtxGlobals' else getattr(obj, attr, default))
        patches.append(p)
        p.start()
    
    return patches


class TestTradeHistoryAPI:
    """Test suite for Trade History API endpoints."""
    
    def test_get_trade_history_success(self, client, mock_user_id):
        """Test GET /api/trade_history/ with valid filters."""
        patches = patch_getattr_for_routes(mock_user_id)
        try:
            with patch('routes.api.trade_history.HistoricalDataBusinessService') as mock_service:
                mock_service_instance = Mock()
                mock_service_instance.validate.return_value = {
                    'is_valid': True,
                    'errors': []
                }
                mock_service_instance.aggregate_trade_history.return_value = {
                    'trades': [],
                    'count': 0,
                    'is_valid': True
                }
                mock_service.return_value = mock_service_instance
                
                response = client.get('/api/trade_history/?account_id=1&start_date=2025-01-01&end_date=2025-01-31')
                
                assert response.status_code == 200
                data = json.loads(response.data)
                assert data['status'] == 'success'
                assert 'trades' in data['data']
        finally:
            for p in patches:
                p.stop()
    
    def test_get_trade_history_statistics_success(self, client, mock_user_id):
        """Test GET /api/trade_history/statistics with valid filters."""
        patches = patch_getattr_for_routes(mock_user_id)
        try:
            with patch('routes.api.trade_history.HistoricalDataBusinessService') as mock_service:
                mock_service_instance = Mock()
                mock_service_instance.validate.return_value = {
                    'is_valid': True,
                    'errors': []
                }
                mock_service_instance.calculate_trade_statistics.return_value = {
                    'total_trades': 10,
                    'total_pl': 1000.0,
                    'win_rate': 60.0,
                    'average_pl': 100.0,
                    'is_valid': True
                }
                mock_service.return_value = mock_service_instance
                
                response = client.get('/api/trade_history/statistics?account_id=1&start_date=2025-01-01&end_date=2025-01-31')
                
                assert response.status_code == 200
                data = json.loads(response.data)
                assert data['status'] == 'success'
                assert 'total_trades' in data['data']
        finally:
            for p in patches:
                p.stop()
    
    def test_get_trade_history_plan_vs_execution_success(self, client, mock_user_id):
        """Test GET /api/trade_history/plan-vs-execution with valid date range."""
        patches = patch_getattr_for_routes(mock_user_id)
        try:
            with patch('routes.api.trade_history.HistoricalDataBusinessService') as mock_service:
                mock_service_instance = Mock()
                mock_service_instance.validate.return_value = {
                    'is_valid': True,
                    'errors': []
                }
                mock_service_instance.calculate_plan_vs_execution_analysis.return_value = {
                    'analysis': {},
                    'is_valid': True
                }
                mock_service.return_value = mock_service_instance
                
                response = client.get('/api/trade_history/plan-vs-execution?start_date=2025-01-01&end_date=2025-01-31')
                
                assert response.status_code == 200
                data = json.loads(response.data)
                assert data['status'] == 'success'
                assert 'analysis' in data['data']
        finally:
            for p in patches:
                p.stop()
    
    def test_get_trade_history_aggregated_success(self, client, mock_user_id):
        """Test GET /api/trade_history/aggregated with valid group_by."""
        patches = patch_getattr_for_routes(mock_user_id)
        try:
            with patch('routes.api.trade_history.HistoricalDataBusinessService') as mock_service:
                mock_service_instance = Mock()
                mock_service_instance.validate.return_value = {
                    'is_valid': True,
                    'errors': []
                }
                mock_service_instance.aggregate_trade_history.return_value = {
                    'trades': [],
                    'grouped': {},
                    'count': 0,
                    'is_valid': True
                }
                mock_service.return_value = mock_service_instance
                
                response = client.get('/api/trade_history/aggregated?group_by=period&start_date=2025-01-01&end_date=2025-01-31')
                
                assert response.status_code == 200
                data = json.loads(response.data)
                assert data['status'] == 'success'
                assert 'grouped' in data['data']
        finally:
            for p in patches:
                p.stop()


class TestPortfolioStateAPI:
    """Test suite for Portfolio State API endpoints."""
    
    def test_get_portfolio_state_snapshot_success(self, client, mock_user_id):
        """Test GET /api/portfolio_state/snapshot with valid date."""
        patches = patch_getattr_for_routes(mock_user_id)
        try:
            with patch('routes.api.portfolio_state.HistoricalDataBusinessService') as mock_service:
                mock_service_instance = Mock()
                mock_service_instance.validate.return_value = {
                    'is_valid': True,
                    'errors': []
                }
                mock_service_instance.calculate_portfolio_state_at_date.return_value = {
                    'positions': [],
                    'total_value': 0.0,
                    'total_pl': 0.0,
                    'total_pl_percent': 0.0,
                    'snapshot_date': '2025-01-15T00:00:00Z',
                    'account_id': None,
                    'is_valid': True
                }
                mock_service.return_value = mock_service_instance
                
                response = client.get('/api/portfolio_state/snapshot?date=2025-01-15')
                
                assert response.status_code == 200
                data = json.loads(response.data)
                assert data['status'] == 'success'
                assert 'positions' in data['data']
                assert 'total_value' in data['data']
        finally:
            for p in patches:
                p.stop()
    
    def test_get_portfolio_state_series_success(self, client, mock_user_id):
        """Test GET /api/portfolio_state/series with valid date range."""
        patches = patch_getattr_for_routes(mock_user_id)
        try:
            with patch('routes.api.portfolio_state.HistoricalDataBusinessService') as mock_service:
                mock_service_instance = Mock()
                mock_service_instance.validate.return_value = {
                    'is_valid': True,
                    'errors': []
                }
                mock_service_instance.calculate_portfolio_snapshot_series.return_value = {
                    'snapshots': [],
                    'count': 0,
                    'is_valid': True
                }
                mock_service.return_value = mock_service_instance
                
                response = client.get('/api/portfolio_state/series?start_date=2025-01-01&end_date=2025-01-31&interval=day')
                
                assert response.status_code == 200
                data = json.loads(response.data)
                assert data['status'] == 'success'
                assert 'snapshots' in data['data']
        finally:
            for p in patches:
                p.stop()
    
    def test_get_portfolio_state_performance_success(self, client, mock_user_id):
        """Test GET /api/portfolio_state/performance with valid date range."""
        patches = patch_getattr_for_routes(mock_user_id)
        try:
            with patch('routes.api.portfolio_state.HistoricalDataBusinessService') as mock_service:
                mock_service_instance = Mock()
                mock_service_instance.validate.return_value = {
                    'is_valid': True,
                    'errors': []
                }
                mock_service_instance.calculate_portfolio_performance_range.return_value = {
                    'start_state': {'total_value': 1000.0},
                    'end_state': {'total_value': 1100.0},
                    'performance': {
                        'value_change': 100.0,
                        'value_change_percent': 10.0,
                        'pl_change': 50.0
                    },
                    'is_valid': True
                }
                mock_service.return_value = mock_service_instance
                
                response = client.get('/api/portfolio_state/performance?start_date=2025-01-01&end_date=2025-01-31')
                
                assert response.status_code == 200
                data = json.loads(response.data)
                assert data['status'] == 'success'
                assert 'performance' in data['data']
        finally:
            for p in patches:
                p.stop()
    
    def test_get_portfolio_state_comparison_success(self, client, mock_user_id):
        """Test GET /api/portfolio_state/comparison with valid dates."""
        patches = patch_getattr_for_routes(mock_user_id)
        try:
            with patch('routes.api.portfolio_state.HistoricalDataBusinessService') as mock_service:
                mock_service_instance = Mock()
                mock_service_instance.validate.return_value = {
                    'is_valid': True,
                    'errors': []
                }
                # Updated to use calculate_portfolio_comparison instead of two separate calls
                mock_service_instance.calculate_portfolio_comparison.return_value = {
                    'date1_state': {
                        'date': '2025-01-01T00:00:00Z',
                        'cash_balance': 5000.0,
                        'portfolio_value': 10000.0,
                        'total_pl': 1000.0,
                        'total_pl_percent': 10.0,
                        'positions_count': 5
                    },
                    'date2_state': {
                        'date': '2025-01-31T00:00:00Z',
                        'cash_balance': 5500.0,
                        'portfolio_value': 11000.0,
                        'total_pl': 1500.0,
                        'total_pl_percent': 13.6,
                        'positions_count': 6
                    },
                    'comparison': {
                        'cash_balance_change': 500.0,
                        'portfolio_value_change': 1000.0,
                        'portfolio_value_change_percent': 10.0,
                        'total_pl_change': 500.0,
                        'total_pl_change_percent': 50.0,
                        'positions_count_change': 1
                    },
                    'is_valid': True
                }
                mock_service.return_value = mock_service_instance
                
                response = client.get('/api/portfolio_state/comparison?date1=2025-01-01&date2=2025-01-31')
                
                assert response.status_code == 200
                data = json.loads(response.data)
                assert data['status'] == 'success'
                assert 'data' in data
                assert 'comparison' in data['data']
                assert 'date1_state' in data['data']
                assert 'date2_state' in data['data']
        finally:
            for p in patches:
                p.stop()


class TestTradingJournalAPI:
    """Test suite for Trading Journal API endpoints."""
    
    def test_get_trading_journal_entries_success(self, client, mock_user_id):
        """Test GET /api/trading_journal/entries with valid date range."""
        patches = patch_getattr_for_routes(mock_user_id)
        try:
            with patch('routes.api.trading_journal.HistoricalDataBusinessService') as mock_service:
                mock_service_instance = Mock()
                mock_service_instance.validate.return_value = {
                    'is_valid': True,
                    'errors': []
                }
                mock_service_instance.aggregate_journal_entries.return_value = {
                    'entries': [],
                    'count': 0,
                    'is_valid': True
                }
                mock_service.return_value = mock_service_instance
                
                response = client.get('/api/trading_journal/entries?start_date=2025-01-01&end_date=2025-01-31')
                
                assert response.status_code == 200
                data = json.loads(response.data)
                assert data['status'] == 'success'
                assert 'entries' in data['data']
        finally:
            for p in patches:
                p.stop()
    
    def test_get_trading_journal_statistics_success(self, client, mock_user_id):
        """Test GET /api/trading_journal/statistics with valid date range."""
        patches = patch_getattr_for_routes(mock_user_id)
        try:
            with patch('routes.api.trading_journal.HistoricalDataBusinessService') as mock_service:
                mock_service_instance = Mock()
                mock_service_instance.validate.return_value = {
                    'is_valid': True,
                    'errors': []
                }
                mock_service_instance.calculate_journal_statistics.return_value = {
                    'total_entries': 10,
                    'by_type': {'note': 5, 'trade': 3, 'execution': 2},
                    'is_valid': True
                }
                mock_service.return_value = mock_service_instance
                
                response = client.get('/api/trading_journal/statistics?start_date=2025-01-01&end_date=2025-01-31')
                
                assert response.status_code == 200
                data = json.loads(response.data)
                assert data['status'] == 'success'
                assert 'total_entries' in data['data']
        finally:
            for p in patches:
                p.stop()
    
    def test_get_trading_journal_calendar_success(self, client, mock_user_id):
        """Test GET /api/trading_journal/calendar with valid month/year."""
        patches = patch_getattr_for_routes(mock_user_id)
        try:
            with patch('routes.api.trading_journal.HistoricalDataBusinessService') as mock_service:
                mock_service_instance = Mock()
                mock_service_instance.validate.return_value = {
                    'is_valid': True,
                    'errors': []
                }
                mock_service_instance.aggregate_journal_entries.return_value = {
                    'entries': [],
                    'count': 0,
                    'is_valid': True
                }
                mock_service.return_value = mock_service_instance
                
                response = client.get('/api/trading_journal/calendar?month=1&year=2025')
                
                assert response.status_code == 200
                data = json.loads(response.data)
                assert data['status'] == 'success'
        finally:
            for p in patches:
                p.stop()
    
    def test_get_trading_journal_by_entity_success(self, client, mock_user_id):
        """Test GET /api/trading_journal/by-entity with valid entity type and ID."""
        patches = patch_getattr_for_routes(mock_user_id)
        try:
            with patch('routes.api.trading_journal.HistoricalDataBusinessService') as mock_service:
                mock_service_instance = Mock()
                mock_service_instance.validate.return_value = {
                    'is_valid': True,
                    'errors': []
                }
                mock_service_instance.aggregate_journal_entries.return_value = {
                    'entries': [],
                    'count': 0,
                    'is_valid': True
                }
                mock_service.return_value = mock_service_instance
                
                response = client.get('/api/trading_journal/by-entity?entity_type=trade&entity_id=123')
                
                assert response.status_code == 200
                data = json.loads(response.data)
                assert data['status'] == 'success'
                assert 'entries' in data['data']
        finally:
            for p in patches:
                p.stop()


class TestHistoricalDataAPIErrorHandling:
    """Test suite for error handling in Historical Data API."""
    
    def test_trade_history_missing_required_params(self, client, mock_user_id):
        """Test Trade History API with missing required parameters."""
        patches = patch_getattr_for_routes(mock_user_id)
        try:
            response = client.get('/api/trade_history/')
            # Should still return 200 (empty result) or 400 (validation error)
            assert response.status_code in [200, 400]
        finally:
            for p in patches:
                p.stop()
    
    def test_portfolio_state_missing_date(self, client, mock_user_id):
        """Test Portfolio State API with missing date parameter."""
        patches = patch_getattr_for_routes(mock_user_id)
        try:
            response = client.get('/api/portfolio_state/snapshot')
            # Should return 400 (validation error) or 200 (empty result)
            assert response.status_code in [200, 400]
        finally:
            for p in patches:
                p.stop()
    
    def test_trading_journal_missing_date_range(self, client, mock_user_id):
        """Test Trading Journal API with missing date range."""
        patches = patch_getattr_for_routes(mock_user_id)
        try:
            response = client.get('/api/trading_journal/entries')
            # Should return 400 (validation error) or 200 (empty result)
            assert response.status_code in [200, 400]
        finally:
            for p in patches:
                p.stop()
