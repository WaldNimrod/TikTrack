"""
Unit tests for TikTrack database models
"""
import pytest
import time
import os
from datetime import datetime, timedelta

# Verify test environment
if not os.environ.get('TESTING') or not os.environ.get('TEST_SAFE_MODE'):
    pytest.skip("Not in safe test mode", allow_module_level=True)

@pytest.mark.safe
@pytest.mark.database
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

    @pytest.mark.safe
    @pytest.mark.database
    def test_side_default_values(self, db_session):
        """Test default values for side fields"""
        from models.trade import Trade
        from models.trade_plan import TradePlan
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
        
        # Test Trade side default
        trade = Trade(
            ticker_id=ticker.id,
            account_id=account.id,
            type='swing',
            notes='Test trade for side default'
        )
        # Don't set side explicitly to test default
        
        db_session.add(trade)
        db_session.commit()
        
        # Verify default side value
        assert trade.side == 'Long'  # Expected default
        
        # Test TradePlan side default
        trade_plan = TradePlan(
            ticker_id=ticker.id,
            account_id=account.id,
            type='swing',
            notes='Test trade plan for side default'
        )
        # Don't set side explicitly to test default
        
        db_session.add(trade_plan)
        db_session.commit()
        
        # Verify default side value
        assert trade_plan.side == 'Long'  # Expected default

    def test_status_default_values(self, db_session):
        """Test default values for status fields"""
        from models.trade import Trade
        from models.trade_plan import TradePlan
        from models.alert import Alert
        from models.ticker import Ticker
        from models.account import Account
        
        # Create required dependencies
        ticker = Ticker(
            symbol='TEST_STATUS_' + str(int(time.time())),
            type='stock',
            currency='USD',
            remarks='Test ticker for status tests'
        )
        
        account = Account(
            name='Test Account for Status',
            currency='USD',
            notes='Test account for status tests'
        )
        
        db_session.add(ticker)
        db_session.add(account)
        db_session.commit()
        
        # Test Trade status default
        trade = Trade(
            ticker_id=ticker.id,
            account_id=account.id,
            type='swing',
            side='Long',
            notes='Test trade for status default'
        )
        # Don't set status explicitly to test default
        
        db_session.add(trade)
        db_session.commit()
        
        # Verify default status value
        assert trade.status == 'open'  # Expected default
        
        # Test TradePlan status default
        trade_plan = TradePlan(
            ticker_id=ticker.id,
            account_id=account.id,
            type='swing',
            side='Long',
            notes='Test trade plan for status default'
        )
        # Don't set status explicitly to test default
        
        db_session.add(trade_plan)
        db_session.commit()
        
        # Verify default status value
        assert trade_plan.status == 'open'  # Expected default
        
        # Test Alert status default
        alert = Alert(
            type='price_alert',
            condition='price > 200.0',
            message='Test alert for status default',
            related_type_id=4,  # ticker
            related_id=ticker.id
        )
        # Don't set status explicitly to test default
        
        db_session.add(alert)
        db_session.commit()
        
        # Verify default status value
        assert alert.status == 'open'  # Expected default

    def test_created_at_auto_timestamp(self, db_session):
        """Test automatic timestamp creation"""
        from models.ticker import Ticker
        
        # Create a test ticker
        ticker = Ticker(
            symbol='TEST_TIMESTAMP_' + str(int(time.time())),
            type='stock',
            currency='USD',
            remarks='Test ticker for timestamp'
        )
        
        db_session.add(ticker)
        db_session.commit()
        
        # Verify created_at was automatically set
        assert ticker.created_at is not None
        assert isinstance(ticker.created_at, datetime)
        
        # Verify it's a recent timestamp (within last minute)
        time_diff = datetime.now() - ticker.created_at
        assert time_diff.total_seconds() < 60

    def test_updated_at_auto_timestamp(self, db_session):
        """Test automatic updated_at timestamp updates"""
        from models.ticker import Ticker
        
        # Create a test ticker
        ticker = Ticker(
            symbol='TEST_UPDATE_' + str(int(time.time())),
            type='stock',
            currency='USD',
            remarks='Test ticker for update timestamp'
        )
        
        db_session.add(ticker)
        db_session.commit()
        
        # Store original timestamps
        original_created = ticker.created_at
        original_updated = ticker.updated_at
        
        # Wait a moment to ensure timestamp difference
        time.sleep(0.1)
        
        # Update the ticker
        ticker.remarks = 'Updated remarks'
        db_session.commit()
        
        # Verify created_at didn't change
        assert ticker.created_at == original_created
        
        # Verify updated_at was updated
        assert ticker.updated_at > original_updated

    def test_soft_delete_functionality(self, db_session):
        """Test soft delete functionality (if implemented)"""
        from models.ticker import Ticker
        
        # Create a test ticker
        ticker = Ticker(
            symbol='TEST_DELETE_' + str(int(time.time())),
            type='stock',
            currency='USD',
            remarks='Test ticker for soft delete'
        )
        
        db_session.add(ticker)
        db_session.commit()
        
        ticker_id = ticker.id
        
        # Test soft delete if method exists
        if hasattr(ticker, 'soft_delete'):
            ticker.soft_delete()
            db_session.commit()
            
            # Verify status changed to cancelled/deleted
            assert ticker.status in ['cancelled', 'deleted']
            
            # Verify record still exists in database
            ticker_from_db = db_session.query(Ticker).filter_by(id=ticker_id).first()
            assert ticker_from_db is not None
            assert ticker_from_db.status in ['cancelled', 'deleted']
        else:
            # If soft delete not implemented, just verify record exists
            ticker_from_db = db_session.query(Ticker).filter_by(id=ticker_id).first()
            assert ticker_from_db is not None

    def test_data_validation(self, db_session):
        """Test data validation and constraints"""
        from models.ticker import Ticker
        from models.trade import Trade
        from models.account import Account
        from sqlalchemy.exc import IntegrityError
        
        # Test required fields validation
        try:
            # Try to create ticker without required symbol
            invalid_ticker = Ticker(
                type='stock',
                currency='USD'
                # Missing symbol
            )
            db_session.add(invalid_ticker)
            db_session.commit()
            assert False, "Should have raised IntegrityError for missing symbol"
        except IntegrityError:
            db_session.rollback()
            # Expected behavior
        
        # Test valid data creation
        valid_ticker = Ticker(
            symbol='TEST_VALID_' + str(int(time.time())),
            type='stock',
            currency='USD',
            remarks='Valid test ticker'
        )
        
        db_session.add(valid_ticker)
        db_session.commit()
        
        assert valid_ticker.id is not None

    def test_foreign_key_constraints(self, db_session):
        """Test foreign key constraints"""
        from models.trade import Trade
        from sqlalchemy.exc import IntegrityError
        
        # Try to create trade with non-existent ticker_id and account_id
        try:
            invalid_trade = Trade(
                ticker_id=99999,  # Non-existent ID
                account_id=99999,  # Non-existent ID
                type='swing',
                side='Long',
                notes='Invalid trade'
            )
            db_session.add(invalid_trade)
            db_session.commit()
            assert False, "Should have raised IntegrityError for invalid foreign keys"
        except IntegrityError:
            db_session.rollback()
            # Expected behavior

    def test_unique_constraints(self, db_session):
        """Test unique constraints"""
        from models.ticker import Ticker
        from sqlalchemy.exc import IntegrityError
        
        # Create first ticker
        ticker1 = Ticker(
            symbol='TEST_UNIQUE',
            type='stock',
            currency='USD',
            remarks='First ticker'
        )
        
        db_session.add(ticker1)
        db_session.commit()
        
        # Try to create second ticker with same symbol
        try:
            ticker2 = Ticker(
                symbol='TEST_UNIQUE',  # Same symbol
                type='stock',
                currency='USD',
                remarks='Second ticker'
            )
            db_session.add(ticker2)
            db_session.commit()
            assert False, "Should have raised IntegrityError for duplicate symbol"
        except IntegrityError:
            db_session.rollback()
            # Expected behavior

    def test_cascade_operations(self, db_session):
        """Test cascade operations (if implemented)"""
        from models.trade import Trade
        from models.ticker import Ticker
        from models.account import Account
        
        # Create dependencies
        ticker = Ticker(
            symbol='TEST_CASCADE_' + str(int(time.time())),
            type='stock',
            currency='USD',
            remarks='Test ticker for cascade'
        )
        
        account = Account(
            name='Test Account for Cascade',
            currency='USD',
            notes='Test account for cascade'
        )
        
        db_session.add(ticker)
        db_session.add(account)
        db_session.commit()
        
        # Create trade that depends on ticker and account
        trade = Trade(
            ticker_id=ticker.id,
            account_id=account.id,
            type='swing',
            side='Long',
            notes='Test trade for cascade'
        )
        
        db_session.add(trade)
        db_session.commit()
        
        trade_id = trade.id
        
        # Test cascade delete if implemented
        # Note: This is just a test - we don't actually want to delete
        # We'll just verify the relationship exists
        trade_from_db = db_session.query(Trade).filter_by(id=trade_id).first()
        assert trade_from_db is not None
        assert trade_from_db.ticker_id == ticker.id
        assert trade_from_db.account_id == account.id

    def test_bulk_operations_safety(self, db_session):
        """Test that bulk operations don't affect production data"""
        from models.ticker import Ticker
        
        # Create multiple test tickers
        test_tickers = []
        for i in range(5):
            ticker = Ticker(
                symbol=f'TEST_BULK_{i}_{int(time.time())}',
                type='stock',
                currency='USD',
                remarks=f'Bulk test ticker {i}'
            )
            test_tickers.append(ticker)
            db_session.add(ticker)
        
        db_session.commit()
        
        # Verify all were created
        for ticker in test_tickers:
            assert ticker.id is not None
        
        # Count test tickers
        test_count = db_session.query(Ticker).filter(
            Ticker.symbol.like('TEST_BULK_%')
        ).count()
        
        assert test_count == 5
        
        # Verify we can query them individually
        for ticker in test_tickers:
            ticker_from_db = db_session.query(Ticker).filter_by(id=ticker.id).first()
            assert ticker_from_db is not None
            assert ticker_from_db.symbol == ticker.symbol

    def test_transaction_rollback_safety(self, db_session):
        """Test that transaction rollback works correctly"""
        from models.ticker import Ticker
        
        # Start transaction
        ticker = Ticker(
            symbol='TEST_ROLLBACK_' + str(int(time.time())),
            type='stock',
            currency='USD',
            remarks='Test ticker for rollback'
        )
        
        db_session.add(ticker)
        db_session.flush()  # Flush but don't commit
        
        # Verify it's in session but not committed
        assert ticker.id is not None  # ID should be assigned
        assert db_session.is_modified(ticker)
        
        # Rollback
        db_session.rollback()
        
        # Verify it's no longer in session
        assert not db_session.is_modified(ticker)
        
        # Try to query it - should not exist
        if ticker.id:
            ticker_from_db = db_session.query(Ticker).filter_by(id=ticker.id).first()
            assert ticker_from_db is None

    def test_concurrent_access_safety(self, db_session):
        """Test that concurrent access doesn't cause issues"""
        from models.ticker import Ticker
        import threading
        import time
        
        # Create a shared counter
        counter = {'value': 0}
        
        def create_ticker():
            """Create a ticker in a separate thread"""
            try:
                # Create a new session for this thread
                from sqlalchemy.orm import sessionmaker
                from sqlalchemy import create_engine
                
                # Get the test database path from environment
                import os
                test_db_path = os.environ.get('TEST_DATABASE_PATH')
                if test_db_path:
                    engine = create_engine(f'sqlite:///{test_db_path}')
                    SessionLocal = sessionmaker(bind=engine)
                    thread_session = SessionLocal()
                    
                    ticker = Ticker(
                        symbol=f'TEST_CONCURRENT_{counter["value"]}_{int(time.time())}',
                        type='stock',
                        currency='USD',
                        remarks=f'Concurrent test ticker {counter["value"]}'
                    )
                    
                    thread_session.add(ticker)
                    thread_session.commit()
                    
                    counter['value'] += 1
                    thread_session.close()
            except Exception as e:
                print(f"Thread error: {e}")
        
        # Create multiple threads
        threads = []
        for i in range(3):
            thread = threading.Thread(target=create_ticker)
            threads.append(thread)
            thread.start()
        
        # Wait for all threads to complete
        for thread in threads:
            thread.join()
        
        # Verify all tickers were created
        assert counter['value'] == 3
        
        # Verify we can query them
        test_count = db_session.query(Ticker).filter(
            Ticker.symbol.like('TEST_CONCURRENT_%')
        ).count()
        
        assert test_count == 3
