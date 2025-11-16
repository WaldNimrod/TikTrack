"""
API Route Tests for Trade Planning Fields
==========================================

Tests for /api/trades endpoints with planning fields (planned_quantity, planned_amount, entry_price)
"""

import pytest
import os
import sys
import json

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)
BACKEND_ROOT = os.path.join(PROJECT_ROOT, "Backend")
if BACKEND_ROOT not in sys.path:
    sys.path.insert(0, BACKEND_ROOT)

from Backend.app import create_app
from config.database import SessionLocal
from models.trade import Trade
from models.trade_plan import TradePlan
from models.ticker import Ticker
from models.trading_account import TradingAccount


@pytest.fixture
def app():
    """Create Flask app for testing"""
    app = create_app({"TESTING": True})
    return app


@pytest.fixture
def client(app):
    """Create test client"""
    return app.test_client()


@pytest.fixture
def db_session():
    """Provide a database session for tests"""
    session = SessionLocal()
    try:
        yield session
    finally:
        session.rollback()
        session.close()


@pytest.fixture
def sample_ticker(db_session):
    """Create a sample ticker"""
    import uuid
    unique_symbol = f'TEST_{uuid.uuid4().hex[:8]}'
    
    existing = db_session.query(Ticker).filter(Ticker.symbol == unique_symbol).first()
    if existing:
        return existing
    
    ticker = Ticker(symbol=unique_symbol, name='Test Ticker', type='stock', status='active')
    db_session.add(ticker)
    db_session.commit()
    db_session.refresh(ticker)
    return ticker


@pytest.fixture
def sample_account(db_session):
    """Create a sample trading account"""
    import uuid
    unique_name = f'Test Account {uuid.uuid4().hex[:8]}'
    
    existing = db_session.query(TradingAccount).filter(TradingAccount.name == unique_name).first()
    if existing:
        return existing
    
    account = TradingAccount(name=unique_name, status='active')
    db_session.add(account)
    db_session.commit()
    db_session.refresh(account)
    return account


class TestTradesPlanningFieldsAPI:
    """Test suite for trades API with planning fields"""

    def test_create_trade_with_planning_fields(self, client, sample_ticker, sample_account):
        """POST /api/trades should accept planning fields"""
        payload = {
            'trading_account_id': sample_account.id,
            'ticker_id': sample_ticker.id,
            'status': 'open',
            'investment_type': 'swing',
            'side': 'Long',
            'planned_quantity': 100.0,
            'planned_amount': 10000.0,
            'entry_price': 100.0,
            'notes': 'Test trade with planning'
        }
        
        response = client.post(
            '/api/trades',
            data=json.dumps(payload),
            content_type='application/json'
        )
        
        assert response.status_code in [200, 201], f"Expected 200/201, got {response.status_code}: {response.data}"
        data = response.get_json()
        
        if 'data' in data:
            trade_data = data['data']
        else:
            trade_data = data
        
        assert 'planned_quantity' in trade_data or trade_data.get('planned_quantity') is not None
        assert 'planned_amount' in trade_data or trade_data.get('planned_amount') is not None
        assert 'entry_price' in trade_data or trade_data.get('entry_price') is not None

    def test_get_trades_includes_planning_fields(self, client, db_session, sample_ticker, sample_account):
        """GET /api/trades should return planning fields"""
        # Create a trade with planning fields
        trade = Trade(
            trading_account_id=sample_account.id,
            ticker_id=sample_ticker.id,
            status='open',
            investment_type='swing',
            side='Long',
            planned_quantity=50.0,
            planned_amount=5000.0,
            entry_price=100.0
        )
        db_session.add(trade)
        db_session.commit()
        db_session.refresh(trade)
        
        response = client.get('/api/trades')
        assert response.status_code == 200
        
        data = response.get_json()
        trades = data.get('data', [])
        
        # Find our trade
        our_trade = next((t for t in trades if t.get('id') == trade.id), None)
        assert our_trade is not None, "Created trade not found in response"
        
        # Verify planning fields are present
        assert 'planned_quantity' in our_trade
        assert 'planned_amount' in our_trade
        assert 'entry_price' in our_trade

    def test_update_trade_planning_fields(self, client, db_session, sample_ticker, sample_account):
        """PUT /api/trades/:id should update planning fields"""
        # Create trade without planning fields
        trade = Trade(
            trading_account_id=sample_account.id,
            ticker_id=sample_ticker.id,
            status='open',
            investment_type='swing',
            side='Long'
        )
        db_session.add(trade)
        db_session.commit()
        db_session.refresh(trade)
        
        # Update with planning fields
        payload = {
            'planned_quantity': 75.0,
            'planned_amount': 7500.0,
            'entry_price': 100.0
        }
        
        response = client.put(
            f'/api/trades/{trade.id}',
            data=json.dumps(payload),
            content_type='application/json'
        )
        
        assert response.status_code in [200, 204], f"Expected 200/204, got {response.status_code}"
        
        # Verify update
        db_session.refresh(trade)
        assert trade.planned_quantity == 75.0
        assert trade.planned_amount == 7500.0
        assert trade.entry_price == 100.0

