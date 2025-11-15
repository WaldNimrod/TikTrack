#!/usr/bin/env python3
"""
Positions & Portfolio Routes - API Tests
========================================

Ensures the positions/portfolio endpoints wire parameters correctly,
emit expected responses, and handle service failures gracefully.
"""

import os
import sys
import pytest
from flask import Flask

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))

from routes.api.positions import positions_bp, portfolio_bp


class _DummySession:
    def commit(self):
        return None

    def rollback(self):
        return None

    def close(self):
        return None


@pytest.fixture(autouse=True)
def patch_db_session(monkeypatch):
    dummy = _DummySession()

    def fake_get_db():
        yield dummy

    monkeypatch.setattr('routes.api.base_entity_decorators.get_db', lambda: fake_get_db())


@pytest.fixture
def client():
    app = Flask(__name__)
    app.config.update(TESTING=True)
    app.register_blueprint(positions_bp)
    app.register_blueprint(portfolio_bp)
    return app.test_client()


def test_get_account_positions_honors_params_and_success(client, monkeypatch):
    captured = {}

    def fake_calc(db, trading_account_id, include_closed, include_market_data):
        captured.update({
            'db': db,
            'account': trading_account_id,
            'include_closed': include_closed,
            'include_market_data': include_market_data
        })
        return ([{'ticker_symbol': 'AAPL'}], {'execution_pairs_count': 1})

    monkeypatch.setattr(
        'routes.api.positions.PositionPortfolioService.calculate_all_account_positions_with_metadata',
        fake_calc
    )

    response = client.get('/api/positions/account/5?include_closed=true')
    assert response.status_code == 200
    payload = response.get_json()
    assert payload['data']['positions'][0]['ticker_symbol'] == 'AAPL'
    assert captured['account'] == 5
    assert captured['include_closed'] is True
    assert captured['include_market_data'] is True


def test_get_account_positions_handles_service_error(client, monkeypatch):
    def boom(**kwargs):
        raise RuntimeError('db unavailable')

    monkeypatch.setattr(
        'routes.api.positions.PositionPortfolioService.calculate_all_account_positions_with_metadata',
        lambda **kwargs: boom(**kwargs)
    )

    response = client.get('/api/positions/account/9')
    assert response.status_code == 500
    payload = response.get_json()
    assert payload['status'] == 'error'


def test_get_portfolio_applies_filters(client, monkeypatch):
    captured = {}

    def fake_summary(db, account_id_filter, include_closed, unify_accounts, side_filter):
        captured.update({
            'account': account_id_filter,
            'include_closed': include_closed,
            'unify_accounts': unify_accounts,
            'side_filter': side_filter
        })
        return {'positions': [], 'summary': {'accounts': 1}}

    monkeypatch.setattr(
        'routes.api.positions.PositionPortfolioService.calculate_portfolio_summary',
        fake_summary
    )

    response = client.get('/api/positions/portfolio?account_id=3&include_closed=true&unify_accounts=true&side=short')
    assert response.status_code == 200
    assert captured == {
        'account': 3,
        'include_closed': True,
        'unify_accounts': True,
        'side_filter': 'short'
    }


def test_get_portfolio_handles_failure(client, monkeypatch):
    def boom(**kwargs):
        raise ValueError('bad params')

    monkeypatch.setattr(
        'routes.api.positions.PositionPortfolioService.calculate_portfolio_summary',
        lambda **kwargs: boom(**kwargs)
    )

    response = client.get('/api/positions/portfolio')
    assert response.status_code == 500
    assert response.get_json()['status'] == 'error'


def test_get_position_details_success_and_not_found(client, monkeypatch):
    monkeypatch.setattr(
        'routes.api.positions.PositionPortfolioService.get_position_details',
        lambda **kwargs: {'ticker_symbol': 'MSFT'}
    )
    response = client.get('/api/positions/4/55/details')
    assert response.status_code == 200
    assert response.get_json()['data']['ticker_symbol'] == 'MSFT'

    monkeypatch.setattr(
        'routes.api.positions.PositionPortfolioService.get_position_details',
        lambda **kwargs: None
    )
    response = client.get('/api/positions/4/55/details')
    assert response.status_code == 404


def test_portfolio_summary_minimal_mode(client, monkeypatch):
    def fake_summary(db, account_id_filter, include_closed, unify_accounts, side_filter):
        return {'positions': [{'market_value': 100}], 'summary': {'total_market_value': 100}}

    monkeypatch.setattr(
        'routes.api.positions.PositionPortfolioService.calculate_portfolio_summary',
        fake_summary
    )

    response = client.get('/api/portfolio/summary?size=minimal')
    assert response.status_code == 200
    payload = response.get_json()
    assert payload['data']['summary']['total_market_value'] == 100
    assert payload['data']['positions_count'] == 1
