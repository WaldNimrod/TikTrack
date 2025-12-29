"""
Comprehensive tests for Trade planning fields (planned_quantity, planned_amount, entry_price)
Tests snapshot logic, CRUD operations, and API integration.

Author: TikTrack Development Team
Date: 2025-01-29
"""

import pytest
import os
import sys

# Ensure project root is on path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)
BACKEND_ROOT = os.path.join(PROJECT_ROOT, "Backend")
if BACKEND_ROOT not in sys.path:
    sys.path.insert(0, BACKEND_ROOT)

from sqlalchemy.orm import Session
from models.trade import Trade
from models.trade_plan import TradePlan
from models.ticker import Ticker
from models.trading_account import TradingAccount
from services.trade_service import TradeService
from config.database import SessionLocal
from datetime import datetime


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
def sample_ticker(db_session: Session):
    """Create a sample ticker for testing"""
    import uuid
    unique_symbol = f'T_{uuid.uuid4().hex[:3]}'
    
    # Check if ticker already exists
    existing = db_session.query(Ticker).filter(Ticker.symbol == unique_symbol).first()
    if existing:
        return existing
    
    ticker = Ticker(
        symbol=unique_symbol,
        name='Test Ticker',
        type='stock',
        currency_id=1,  # USD
        status='active'
    )
    db_session.add(ticker)
    db_session.commit()
    db_session.refresh(ticker)
    return ticker


@pytest.fixture
def sample_account(db_session: Session):
    """Create a sample trading account for testing"""
    import uuid
    unique_name = f'Test Account {uuid.uuid4().hex[:8]}'
    
    # Check if account already exists
    existing = db_session.query(TradingAccount).filter(TradingAccount.name == unique_name).first()
    if existing:
        return existing
    
    account = TradingAccount(
        name=unique_name,
        user_id=2,  # admin user
        currency_id=1,  # USD
        status='active'
    )
    db_session.add(account)
    db_session.commit()
    db_session.refresh(account)
    return account


class TestTradePlanningFields:
    """Test suite for Trade planning fields functionality"""

    def test_trade_model_has_planning_fields(self, db_session: Session):
        """Verify Trade model includes planning fields"""
        inspector = Trade.__table__.columns
        field_names = [col.name for col in inspector]
        
        assert 'planned_quantity' in field_names, "planned_quantity field missing from Trade model"
        assert 'planned_amount' in field_names, "planned_amount field missing from Trade model"
        assert 'entry_price' in field_names, "entry_price field missing from Trade model"

    def test_create_trade_with_planning_fields(self, db_session: Session, sample_ticker, sample_account):
        """Test creating a trade with explicit planning fields"""
        trade_data = {
            'trading_account_id': sample_account.id,
            'ticker_id': sample_ticker.id,
            'user_id': 2,  # admin user
            'status': 'open',
            'investment_type': 'swing',
            'side': 'Long',
            'planned_quantity': 100.0,
            'planned_amount': 10000.0,
            'entry_price': 100.0,
            'notes': 'Test trade with planning fields'
        }
        
        trade = TradeService.create(db_session, trade_data)
        db_session.refresh(trade)
        
        assert trade.planned_quantity == 100.0
        assert trade.planned_amount == 10000.0
        assert trade.entry_price == 100.0
        assert trade.trade_plan_id is None  # No plan linked

    def test_create_trade_without_planning_fields(self, db_session: Session, sample_ticker, sample_account):
        """Test creating a trade without planning fields (should be nullable)"""
        trade_data = {
            'trading_account_id': sample_account.id,
            'ticker_id': sample_ticker.id,
            'status': 'open',
            'investment_type': 'swing',
            'side': 'Long',
            'user_id': 1  # Add required user_id
        }

        trade = TradeService.create(db_session, trade_data)
        db_session.refresh(trade)
        
        assert trade.planned_quantity is None or trade.planned_quantity == 0
        assert trade.planned_amount is None or trade.planned_amount == 0
        assert trade.entry_price is None or trade.entry_price == 0

    def test_snapshot_from_trade_plan(self, db_session: Session, sample_ticker, sample_account):
        """Test snapshot logic: creating trade from plan copies planning fields"""
        # Create a trade plan first
        plan_data = {
            'user_id': 1,  # Add required user_id
            'trading_account_id': sample_account.id,
            'ticker_id': sample_ticker.id,
            'investment_type': 'swing',
            'side': 'Long',
            'status': 'open',
            'planned_amount': 5000.0,
            'entry_price': 50.0
        }
        plan = TradePlan(**plan_data)
        db_session.add(plan)
        db_session.commit()
        db_session.refresh(plan)
        
        # Create trade with trade_plan_id (should snapshot planning fields)
        trade_data = {
            'trading_account_id': sample_account.id,
            'ticker_id': sample_ticker.id,
            'status': 'open',
            'investment_type': 'swing',
            'side': 'Long',
            'trade_plan_id': plan.id,
            'user_id': 1  # Add required user_id
        }
        
        trade = TradeService.create(db_session, trade_data)
        db_session.refresh(trade)
        
        # Verify snapshot was applied
        assert trade.trade_plan_id == plan.id
        assert trade.planned_amount == 5000.0, f"Expected 5000.0, got {trade.planned_amount}"
        assert trade.entry_price == 50.0, f"Expected 50.0, got {trade.entry_price}"
        # planned_quantity should be calculated: 5000 / 50 = 100
        assert abs(trade.planned_quantity - 100.0) < 0.01, f"Expected ~100.0, got {trade.planned_quantity}"

    def test_snapshot_override_with_explicit_fields(self, db_session: Session, sample_ticker, sample_account):
        """Test that explicit planning fields override snapshot from plan"""
        # Create a trade plan
        plan_data = {
            'user_id': 1,  # Add required user_id
            'trading_account_id': sample_account.id,
            'ticker_id': sample_ticker.id,
            'investment_type': 'swing',
            'side': 'Long',
            'status': 'open',
            'planned_amount': 5000.0,
            'entry_price': 50.0
        }
        plan = TradePlan(**plan_data)
        db_session.add(plan)
        db_session.commit()
        db_session.refresh(plan)
        
        # Create trade with both trade_plan_id AND explicit planning fields
        trade_data = {
            'trading_account_id': sample_account.id,
            'ticker_id': sample_ticker.id,
            'status': 'open',
            'investment_type': 'swing',
            'side': 'Long',
            'trade_plan_id': plan.id,
            'planned_amount': 8000.0,  # Override plan value
            'entry_price': 80.0,  # Override plan value
            'planned_quantity': 100.0,  # Explicit quantity
            'user_id': 1  # Add required user_id
        }
        
        trade = TradeService.create(db_session, trade_data)
        db_session.refresh(trade)
        
        # Verify explicit values were used (not plan values)
        assert trade.planned_amount == 8000.0
        assert trade.entry_price == 80.0
        assert trade.planned_quantity == 100.0

    def test_update_trade_planning_fields(self, db_session: Session, sample_ticker, sample_account):
        """Test updating trade planning fields"""
        # Create trade without planning fields
        trade_data = {
            'trading_account_id': sample_account.id,
            'ticker_id': sample_ticker.id,
            'status': 'open',
            'investment_type': 'swing',
            'side': 'Long',
            'user_id': 1  # Add required user_id
        }
        trade = TradeService.create(db_session, trade_data)
        db_session.refresh(trade)
        
        # Update with planning fields
        update_data = {
            'planned_quantity': 150.0,
            'planned_amount': 15000.0,
            'entry_price': 100.0
        }
        
        updated_trade = TradeService.update(db_session, trade.id, update_data)
        db_session.refresh(updated_trade)
        
        assert updated_trade.planned_quantity == 150.0
        assert updated_trade.planned_amount == 15000.0
        assert updated_trade.entry_price == 100.0

    def test_trade_to_dict_includes_planning_fields(self, db_session: Session, sample_ticker, sample_account):
        """Test that Trade.to_dict() includes planning fields in response"""
        trade_data = {
            'trading_account_id': sample_account.id,
            'ticker_id': sample_ticker.id,
            'status': 'open',
            'investment_type': 'swing',
            'side': 'Long',
            'planned_quantity': 200.0,
            'planned_amount': 20000.0,
            'entry_price': 100.0,
            'user_id': 1  # Add required user_id
        }
        trade = TradeService.create(db_session, trade_data)
        db_session.refresh(trade)
        
        trade_dict = trade.to_dict()
        
        assert 'planned_quantity' in trade_dict
        assert 'planned_amount' in trade_dict
        assert 'entry_price' in trade_dict
        assert trade_dict['planned_quantity'] == 200.0
        assert trade_dict['planned_amount'] == 20000.0
        assert trade_dict['entry_price'] == 100.0

    def test_trade_to_dict_with_null_planning_fields(self, db_session: Session, sample_ticker, sample_account):
        """Test that Trade.to_dict() handles null planning fields correctly"""
        trade_data = {
            'trading_account_id': sample_account.id,
            'ticker_id': sample_ticker.id,
            'status': 'open',
            'investment_type': 'swing',
            'side': 'Long',
            'user_id': 1  # Add required user_id
        }
        trade = TradeService.create(db_session, trade_data)
        db_session.refresh(trade)
        
        trade_dict = trade.to_dict()
        
        # Should include fields even if null
        assert 'planned_quantity' in trade_dict
        assert 'planned_amount' in trade_dict
        assert 'entry_price' in trade_dict
        # Values can be None or 0 depending on DB defaults
        assert trade_dict['planned_quantity'] is None or trade_dict['planned_quantity'] == 0
        assert trade_dict['planned_amount'] is None or trade_dict['planned_amount'] == 0
        assert trade_dict['entry_price'] is None or trade_dict['entry_price'] == 0

    def test_snapshot_calculates_planned_quantity(self, db_session: Session, sample_ticker, sample_account):
        """Test that snapshot logic calculates planned_quantity from amount/price"""
        plan_data = {
            'user_id': 1,  # Add required user_id
            'trading_account_id': sample_account.id,
            'ticker_id': sample_ticker.id,
            'investment_type': 'swing',
            'side': 'Long',
            'status': 'open',
            'planned_amount': 10000.0,
            'entry_price': 100.0
        }
        plan = TradePlan(**plan_data)
        db_session.add(plan)
        db_session.commit()
        db_session.refresh(plan)
        
        # Create trade with plan (no explicit planned_quantity)
        trade_data = {
            'trading_account_id': sample_account.id,
            'ticker_id': sample_ticker.id,
            'status': 'open',
            'investment_type': 'swing',
            'side': 'Long',
            'trade_plan_id': plan.id,
            'user_id': 1  # Add required user_id
        }
        
        trade = TradeService.create(db_session, trade_data)
        db_session.refresh(trade)
        
        # planned_quantity should be calculated: 10000 / 100 = 100
        expected_quantity = 10000.0 / 100.0
        assert abs(trade.planned_quantity - expected_quantity) < 0.01, \
            f"Expected {expected_quantity}, got {trade.planned_quantity}"

    def test_snapshot_with_missing_plan_entry_price(self, db_session: Session, sample_ticker, sample_account):
        """Test snapshot when plan has planned_amount but no entry_price"""
        # Create plan without entry_price
        plan_data = {
            'user_id': 1,  # Add required user_id
            'trading_account_id': sample_account.id,
            'ticker_id': sample_ticker.id,
            'investment_type': 'swing',
            'side': 'Long',
            'status': 'open',
            'planned_amount': 5000.0,
            'entry_price': None  # Missing entry_price
        }
        plan = TradePlan(**plan_data)
        db_session.add(plan)
        db_session.commit()
        db_session.refresh(plan)
        
        trade_data = {
            'trading_account_id': sample_account.id,
            'ticker_id': sample_ticker.id,
            'status': 'open',
            'investment_type': 'swing',
            'side': 'Long',
            'trade_plan_id': plan.id,
            'user_id': 1  # Add required user_id
        }
        
        trade = TradeService.create(db_session, trade_data)
        db_session.refresh(trade)
        
        # Should snapshot planned_amount but entry_price should be None
        assert trade.planned_amount == 5000.0
        assert trade.entry_price is None
        # planned_quantity cannot be calculated without entry_price
        assert trade.planned_quantity is None or trade.planned_quantity == 0

