"""
Unit tests for TikTrack database models
"""
import pytest
import time
from datetime import datetime, timedelta

class TestModels:
    """Test database models functionality"""
    
    def test_ticker_creation(self, db_session):
        """Test creating a ticker"""
        from models.ticker import Ticker
        
        # Create a test ticker
        ticker = Ticker(
            symbol='TEST_AAPL_' + str(int(time.time())),
            type='stock',
            currency='USD',
            remarks='Test ticker'
        )
        
        db_session.add(ticker)
        db_session.commit()
        
        # Verify the ticker was created
        assert ticker.id is not None
        assert ticker.symbol.startswith('TEST_AAPL_')
        assert ticker.type == 'stock'
        assert ticker.currency == 'USD'
    
    def test_ticker_to_dict(self, db_session):
        """Test converting ticker to dictionary"""
        from models.ticker import Ticker
        
        # Create a test ticker
        ticker = Ticker(
            symbol='TEST_GOOGL_' + str(int(time.time())),
            type='stock',
            currency='USD',
            remarks='Test ticker for dict'
        )
        
        db_session.add(ticker)
        db_session.commit()
        
        # Convert to dictionary
        ticker_dict = ticker.to_dict()
        
        # Verify all fields are present
        assert 'id' in ticker_dict
        assert 'symbol' in ticker_dict
        assert 'type' in ticker_dict
        assert 'currency' in ticker_dict
        assert ticker_dict['symbol'].startswith('TEST_GOOGL_')
    
    def test_account_creation(self, db_session):
        """Test creating an account"""
        from models.account import Account
        
        # Create a test account
        account = Account(
            name='Test Account',
            currency='USD',
            notes='Test account for unit tests'
        )
        
        db_session.add(account)
        db_session.commit()
        
        # Verify the account was created
        assert account.id is not None
        assert account.name == 'Test Account'
        assert account.currency == 'USD'
        assert account.status == 'open'  # default value
    
    def test_user_creation(self, db_session):
        """Test creating a user - SKIP if User model doesn't exist"""
        try:
            from models.user import User
            
            # Create a test user
            user = User(
                username='test_user_' + str(int(time.time())),
                email='test@example.com',
                role='user'
            )
            user.set_password('test_password')
            
            db_session.add(user)
            db_session.commit()
            
            # Verify the user was created
            assert user.id is not None
            assert user.username.startswith('test_user_')
            assert user.email == 'test@example.com'
            assert user.role == 'user'
            assert user.check_password('test_password')
        except ImportError:
            pytest.skip("User model not available")
    
    def test_trade_creation(self, db_session):
        """Test creating a trade"""
        from models.trade import Trade
        from models.ticker import Ticker
        from models.account import Account
        
        # Create required dependencies
        ticker = Ticker(
            symbol='TEST_TRADE_' + str(int(time.time())),
            type='stock',
            currency='USD',
            remarks='Test ticker for trade'
        )
        
        account = Account(
            name='Test Account for Trade',
            currency='USD',
            notes='Test account for trade tests'
        )
        
        db_session.add(ticker)
        db_session.add(account)
        db_session.commit()
        
        # Create a test trade
        trade = Trade(
            ticker_id=ticker.id,
            account_id=account.id,
            type='buy',
            notes='Test trade'
        )
        
        db_session.add(trade)
        db_session.commit()
        
        # Verify the trade was created
        assert trade.id is not None
        assert trade.ticker_id == ticker.id
        assert trade.account_id == account.id
        assert trade.type == 'buy'
        assert trade.status == 'open'  # default value
    
    def test_alert_creation(self, db_session):
        """Test creating an alert"""
        from models.alert import Alert
        from models.ticker import Ticker
        
        # Create a test ticker
        ticker = Ticker(
            symbol='TEST_ALERT_' + str(int(time.time())),
            type='stock',
            currency='USD',
            remarks='Test ticker for alert'
        )
        
        db_session.add(ticker)
        db_session.commit()
        
        # Create a test alert
        alert = Alert(
            type='price_alert',
            condition='price > 200.0',
            message='Test alert for price above 200',
            related_type_id=4,  # ticker
            related_id=ticker.id
        )
        
        db_session.add(alert)
        db_session.commit()
        
        # Verify the alert was created
        assert alert.id is not None
        assert alert.related_id == ticker.id
        assert alert.type == 'price_alert'
        assert alert.condition == 'price > 200.0'
        assert alert.status == 'open'  # default value
