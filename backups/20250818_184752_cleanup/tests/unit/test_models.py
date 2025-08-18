"""
Unit tests for database models
"""
import pytest
import time
from datetime import datetime
from models.ticker import Ticker
from models.account import Account
from models.trade import Trade
from models.user import User
from models.role import Role

class TestTickerModel:
    """Test Ticker model"""
    
    def test_ticker_creation(self, db_session):
        """Test creating a ticker"""
        # Use unique symbol for testing
        ticker = Ticker(
            symbol='TEST_AAPL_' + str(int(time.time())),
            name='Apple Inc.',
            type='stock',
            currency='USD',
            remarks='Technology company'
        )
        db_session.add(ticker)
        db_session.commit()
        
        assert ticker.id is not None
        assert ticker.symbol.startswith('TEST_AAPL_')
        assert ticker.name == 'Apple Inc.'
        assert ticker.type == 'stock'
        assert ticker.currency == 'USD'
        assert ticker.active_trades == False
        assert ticker.created_at is not None
    
    def test_ticker_to_dict(self, db_session):
        """Test ticker to_dict method"""
        # Use unique symbol for testing
        ticker = Ticker(
            symbol='TEST_GOOGL_' + str(int(time.time())),
            name='Alphabet Inc.',
            type='stock',
            currency='USD'
        )
        db_session.add(ticker)
        db_session.commit()
        
        ticker_dict = ticker.to_dict()
        assert 'id' in ticker_dict
        assert ticker_dict['symbol'].startswith('TEST_GOOGL_')
        assert ticker_dict['name'] == 'Alphabet Inc.'
        assert 'created_at' in ticker_dict

class TestAccountModel:
    """Test Account model"""
    
    def test_account_creation(self, db_session):
        """Test creating an account"""
        account = Account(
            name='Test Account',
            currency='USD',
            status='open',
            cash_balance=10000.0,
            notes='Test account'
        )
        db_session.add(account)
        db_session.commit()
        
        assert account.id is not None
        assert account.name == 'Test Account'
        assert account.currency == 'USD'
        assert account.status == 'open'
        assert account.cash_balance == 10000.0
        assert account.total_value == 0.0
        assert account.total_pl == 0.0

class TestUserModel:
    """Test User model"""
    
    def test_user_creation(self, db_session):
        """Test creating a user"""
        # Use unique username for testing
        unique_username = 'testuser_' + str(int(time.time()))
        user = User(
            username=unique_username,
            email=f'{unique_username}@example.com',
            password_hash='hashed_password'
        )
        db_session.add(user)
        db_session.commit()
        
        assert user.id is not None
        assert user.username.startswith('testuser_')
        assert user.email.startswith('testuser_')
        assert user.password_hash == 'hashed_password'
        assert user.is_active == True
        assert user.created_at is not None
