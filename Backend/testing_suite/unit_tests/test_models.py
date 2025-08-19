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
            type='swing',
            side='Long',
            notes='Test trade'
        )
        
        db_session.add(trade)
        db_session.commit()
        
        # Verify the trade was created
        assert trade.id is not None
        assert trade.ticker_id == ticker.id
        assert trade.account_id == account.id
        assert trade.type == 'swing'
        assert trade.side == 'Long'
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

    def test_trade_plan_creation(self, db_session):
        """Test creating a trade plan"""
        from models.trade_plan import TradePlan
        from models.ticker import Ticker
        from models.account import Account
        
        # Create required dependencies
        ticker = Ticker(
            symbol='TEST_PLAN_' + str(int(time.time())),
            type='stock',
            currency='USD',
            remarks='Test ticker for trade plan'
        )
        
        account = Account(
            name='Test Account for Plan',
            currency='USD',
            notes='Test account for trade plan tests'
        )
        
        db_session.add(ticker)
        db_session.add(account)
        db_session.commit()
        
        # Create a test trade plan
        trade_plan = TradePlan(
            ticker_id=ticker.id,
            account_id=account.id,
            investment_type='swing',
            side='Long',
            planned_amount=10000.0,
            entry_conditions='Price above $100',
            reasons='Strong technical indicators'
        )
        
        db_session.add(trade_plan)
        db_session.commit()
        
        # Verify the trade plan was created
        assert trade_plan.id is not None
        assert trade_plan.ticker_id == ticker.id
        assert trade_plan.account_id == account.id
        assert trade_plan.investment_type == 'swing'
        assert trade_plan.side == 'Long'
        assert trade_plan.planned_amount == 10000.0
        assert trade_plan.status == 'open'  # default value

    def test_trade_side_values(self, db_session):
        """Test trade side field with different values"""
        from models.trade import Trade
        from models.ticker import Ticker
        from models.account import Account
        
        # Create required dependencies
        ticker = Ticker(
            symbol='TEST_SIDE_' + str(int(time.time())),
            type='stock',
            currency='USD',
            remarks='Test ticker for side tests'
        )
        
        account = Account(
            name='Test Account for Side',
            currency='USD',
            notes='Test account for side tests'
        )
        
        db_session.add(ticker)
        db_session.add(account)
        db_session.commit()
        
        # Test Long side
        long_trade = Trade(
            ticker_id=ticker.id,
            account_id=account.id,
            type='swing',
            side='Long',
            notes='Long trade test'
        )
        
        # Test Short side
        short_trade = Trade(
            ticker_id=ticker.id,
            account_id=account.id,
            type='investment',
            side='Short',
            notes='Short trade test'
        )
        
        db_session.add(long_trade)
        db_session.add(short_trade)
        db_session.commit()
        
        # Verify both sides work
        assert long_trade.side == 'Long'
        assert short_trade.side == 'Short'
        assert long_trade.type == 'swing'
        assert short_trade.type == 'investment'

    def test_trade_plan_side_values(self, db_session):
        """Test trade plan side field with different values"""
        from models.trade_plan import TradePlan
        from models.ticker import Ticker
        from models.account import Account
        
        # Create required dependencies
        ticker = Ticker(
            symbol='TEST_PLAN_SIDE_' + str(int(time.time())),
            type='stock',
            currency='USD',
            remarks='Test ticker for plan side tests'
        )
        
        account = Account(
            name='Test Account for Plan Side',
            currency='USD',
            notes='Test account for plan side tests'
        )
        
        db_session.add(ticker)
        db_session.add(account)
        db_session.commit()
        
        # Test Long side
        long_plan = TradePlan(
            ticker_id=ticker.id,
            account_id=account.id,
            investment_type='swing',
            side='Long',
            planned_amount=5000.0,
            entry_conditions='Price above $50',
            reasons='Bullish pattern'
        )
        
        # Test Short side
        short_plan = TradePlan(
            ticker_id=ticker.id,
            account_id=account.id,
            investment_type='investment',
            side='Short',
            planned_amount=3000.0,
            entry_conditions='Price below $30',
            reasons='Bearish pattern'
        )
        
        db_session.add(long_plan)
        db_session.add(short_plan)
        db_session.commit()
        
        # Verify both sides work
        assert long_plan.side == 'Long'
        assert short_plan.side == 'Short'
        assert long_plan.investment_type == 'swing'
        assert short_plan.investment_type == 'investment'

    def test_side_default_values(self, db_session):
        """Test that side field defaults to 'Long' when not specified"""
        from models.trade import Trade
        from models.trade_plan import TradePlan
        from models.ticker import Ticker
        from models.account import Account
        
        # Create required dependencies
        ticker = Ticker(
            symbol='TEST_DEFAULT_' + str(int(time.time())),
            type='stock',
            currency='USD',
            remarks='Test ticker for default tests'
        )
        
        account = Account(
            name='Test Account for Default',
            currency='USD',
            notes='Test account for default tests'
        )
        
        db_session.add(ticker)
        db_session.add(account)
        db_session.commit()
        
        # Test trade without specifying side
        trade = Trade(
            ticker_id=ticker.id,
            account_id=account.id,
            type='passive',
            notes='Trade without side'
        )
        
        # Test trade plan without specifying side
        plan = TradePlan(
            ticker_id=ticker.id,
            account_id=account.id,
            investment_type='passive',
            planned_amount=2000.0,
            entry_conditions='Price stable',
            reasons='Conservative approach'
        )
        
        db_session.add(trade)
        db_session.add(plan)
        db_session.commit()
        
        # Verify default values
        assert trade.side == 'Long'  # default from model
        assert plan.side == 'Long'   # default from model
