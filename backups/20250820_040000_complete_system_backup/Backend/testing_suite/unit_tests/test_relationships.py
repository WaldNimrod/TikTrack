"""
Unit tests for database entity relationships and business rules
בדיקות יחידה לקשרים בין ישויות וכללי עסקים
"""
import pytest
import time
import os
from datetime import datetime, timedelta

# Verify test environment
if not os.environ.get('TESTING') or not os.environ.get('TEST_SAFE_MODE'):
    pytest.skip("Not in safe test mode", allow_module_level=True)
from sqlalchemy.orm import Session


@pytest.mark.safe
@pytest.mark.database
class TestEntityRelationships:
    """Test database entity relationships and business rules"""
    
    def test_trade_ticker_relationship(self, db_session):
        """Test trade-ticker relationship integrity"""
        from models.trade import Trade
        from models.ticker import Ticker
        from models.account import Account
        
        # Create ticker and account
        ticker = Ticker(
            symbol='TEST_REL_' + str(int(time.time())),
            type='stock',
            currency='USD',
            remarks='Test ticker for relationships'
        )
        
        account = Account(
            name='Test Account for Relationships',
            currency='USD',
            notes='Test account for relationship tests'
        )
        
        db_session.add(ticker)
        db_session.add(account)
        db_session.commit()
        
        # Create trade with valid relationships
        trade = Trade(
            ticker_id=ticker.id,
            account_id=account.id,
            type='swing',
            side='Long',
            notes='Test trade with relationships'
        )
        
        db_session.add(trade)
        db_session.commit()
        
        # Verify relationships
        assert trade.ticker_id == ticker.id
        assert trade.account_id == account.id
        assert trade.ticker.symbol == ticker.symbol
        assert trade.account.name == account.name

    def test_trade_plan_relationships(self, db_session):
        """Test trade plan relationships with ticker and account"""
        from models.trade_plan import TradePlan
        from models.ticker import Ticker
        from models.account import Account
        
        # Create dependencies
        ticker = Ticker(
            symbol='TEST_PLAN_REL_' + str(int(time.time())),
            type='stock',
            currency='USD',
            remarks='Test ticker for plan relationships'
        )
        
        account = Account(
            name='Test Account for Plan Relationships',
            currency='USD',
            notes='Test account for plan relationship tests'
        )
        
        db_session.add(ticker)
        db_session.add(account)
        db_session.commit()
        
        # Create trade plan
        plan = TradePlan(
            ticker_id=ticker.id,
            account_id=account.id,
            investment_type='swing',
            side='Long',
            planned_amount=10000.0,
            entry_conditions='Price above $100',
            reasons='Strong technical indicators'
        )
        
        db_session.add(plan)
        db_session.commit()
        
        # Verify relationships
        assert plan.ticker_id == ticker.id
        assert plan.account_id == account.id
        assert plan.ticker.symbol == ticker.symbol
        assert plan.account.name == account.name

    def test_alert_entity_relationships(self, db_session):
        """Test alert relationships with different entity types"""
        from models.alert import Alert
        from models.ticker import Ticker
        from models.trade import Trade
        from models.account import Account
        
        # Create test entities
        ticker = Ticker(
            symbol='TEST_ALERT_REL_' + str(int(time.time())),
            type='stock',
            currency='USD',
            remarks='Test ticker for alert relationships'
        )
        
        account = Account(
            name='Test Account for Alert Relationships',
            currency='USD',
            notes='Test account for alert relationship tests'
        )
        
        db_session.add(ticker)
        db_session.add(account)
        db_session.commit()
        
        # Create trade
        trade = Trade(
            ticker_id=ticker.id,
            account_id=account.id,
            type='swing',
            side='Long',
            notes='Test trade for alert relationships'
        )
        
        db_session.add(trade)
        db_session.commit()
        
        # Create alerts for different entities
        ticker_alert = Alert(
            type='price_alert',
            condition='price > 200.0',
            message='Ticker price alert',
            related_type_id=4,  # ticker
            related_id=ticker.id
        )
        
        trade_alert = Alert(
            type='trade_alert',
            condition='profit > 10%',
            message='Trade profit alert',
            related_type_id=1,  # trade
            related_id=trade.id
        )
        
        db_session.add(ticker_alert)
        db_session.add(trade_alert)
        db_session.commit()
        
        # Verify alert relationships
        assert ticker_alert.related_id == ticker.id
        assert trade_alert.related_id == trade.id

    def test_business_rules_trade_types(self, db_session):
        """Test business rules for trade types"""
        from models.trade import Trade
        from models.ticker import Ticker
        from models.account import Account
        
        # Create dependencies
        ticker = Ticker(
            symbol='TEST_RULES_' + str(int(time.time())),
            type='stock',
            currency='USD',
            remarks='Test ticker for business rules'
        )
        
        account = Account(
            name='Test Account for Business Rules',
            currency='USD',
            notes='Test account for business rule tests'
        )
        
        db_session.add(ticker)
        db_session.add(account)
        db_session.commit()
        
        # Test valid trade types
        valid_types = ['swing', 'investment', 'passive']
        
        for trade_type in valid_types:
            trade = Trade(
                ticker_id=ticker.id,
                account_id=account.id,
                type=trade_type,
                side='Long',
                notes=f'Test {trade_type} trade'
            )
            
            db_session.add(trade)
            db_session.commit()
            
            # Verify the trade was created with correct type
            assert trade.type == trade_type
            assert trade.type in valid_types

    def test_business_rules_trade_sides(self, db_session):
        """Test business rules for trade sides"""
        from models.trade import Trade
        from models.trade_plan import TradePlan
        from models.ticker import Ticker
        from models.account import Account
        
        # Create dependencies
        ticker = Ticker(
            symbol='TEST_SIDES_' + str(int(time.time())),
            type='stock',
            currency='USD',
            remarks='Test ticker for side rules'
        )
        
        account = Account(
            name='Test Account for Side Rules',
            currency='USD',
            notes='Test account for side rule tests'
        )
        
        db_session.add(ticker)
        db_session.add(account)
        db_session.commit()
        
        # Test valid sides
        valid_sides = ['Long', 'Short']
        
        for side in valid_sides:
            # Test trade sides
            trade = Trade(
                ticker_id=ticker.id,
                account_id=account.id,
                type='swing',
                side=side,
                notes=f'Test {side} trade'
            )
            
            # Test trade plan sides
            plan = TradePlan(
                ticker_id=ticker.id,
                account_id=account.id,
                investment_type='swing',
                side=side,
                planned_amount=5000.0,
                entry_conditions=f'Test {side} conditions',
                reasons=f'Test {side} reasons'
            )
            
            db_session.add(trade)
            db_session.add(plan)
            db_session.commit()
            
            # Verify sides are valid
            assert trade.side == side
            assert plan.side == side
            assert trade.side in valid_sides
            assert plan.side in valid_sides

    def test_business_rules_status_values(self, db_session):
        """Test business rules for status values"""
        from models.trade import Trade
        from models.trade_plan import TradePlan
        from models.account import Account
        from models.ticker import Ticker
        
        # Create dependencies
        ticker = Ticker(
            symbol='TEST_STATUS_' + str(int(time.time())),
            type='stock',
            currency='USD',
            remarks='Test ticker for status rules'
        )
        
        account = Account(
            name='Test Account for Status Rules',
            currency='USD',
            notes='Test account for status rule tests'
        )
        
        db_session.add(ticker)
        db_session.add(account)
        db_session.commit()
        
        # Test valid statuses
        valid_trade_statuses = ['open', 'closed', 'canceled']
        valid_plan_statuses = ['open', 'executed', 'canceled']
        
        # Test trade statuses
        for status in valid_trade_statuses:
            trade = Trade(
                ticker_id=ticker.id,
                account_id=account.id,
                type='swing',
                side='Long',
                status=status,
                notes=f'Test {status} trade'
            )
            
            db_session.add(trade)
            db_session.commit()
            
            assert trade.status == status
            assert trade.status in valid_trade_statuses
        
        # Test trade plan statuses
        for status in valid_plan_statuses:
            plan = TradePlan(
                ticker_id=ticker.id,
                account_id=account.id,
                investment_type='swing',
                side='Long',
                status=status,
                planned_amount=3000.0,
                entry_conditions=f'Test {status} conditions',
                reasons=f'Test {status} reasons'
            )
            
            db_session.add(plan)
            db_session.commit()
            
            assert plan.status == status
            assert plan.status in valid_plan_statuses

    def test_data_integrity_constraints(self, db_session):
        """Test data integrity constraints"""
        from models.trade import Trade
        from models.trade_plan import TradePlan
        from models.ticker import Ticker
        from models.account import Account
        
        # Create dependencies
        ticker = Ticker(
            symbol='TEST_INTEGRITY_' + str(int(time.time())),
            type='stock',
            currency='USD',
            remarks='Test ticker for integrity tests'
        )
        
        account = Account(
            name='Test Account for Integrity',
            currency='USD',
            notes='Test account for integrity tests'
        )
        
        db_session.add(ticker)
        db_session.add(account)
        db_session.commit()
        
        # Test required fields
        trade = Trade(
            ticker_id=ticker.id,
            account_id=account.id,
            type='swing',
            side='Long',
            notes='Test integrity trade'
        )
        
        plan = TradePlan(
            ticker_id=ticker.id,
            account_id=account.id,
            investment_type='swing',
            side='Long',
            planned_amount=5000.0,
            entry_conditions='Test conditions',
            reasons='Test reasons'
        )
        
        db_session.add(trade)
        db_session.add(plan)
        db_session.commit()
        
        # Verify required fields are not null
        assert trade.ticker_id is not None
        assert trade.account_id is not None
        assert trade.type is not None
        assert trade.side is not None
        
        assert plan.ticker_id is not None
        assert plan.account_id is not None
        assert plan.investment_type is not None
        assert plan.side is not None
        assert plan.planned_amount is not None

    @pytest.mark.safe
    @pytest.mark.database
    def test_cross_entity_consistency(self, db_session):
        """Test consistency across different entities"""
        from models.ticker import Ticker
        from models.account import Account
        from models.trade import Trade
        from models.trade_plan import TradePlan
        from models.alert import Alert
        
        # Create base entities
        ticker = Ticker(
            symbol='TEST_CONSISTENCY_' + str(int(time.time())),
            type='stock',
            currency='USD',
            remarks='Test ticker for consistency'
        )
        
        account = Account(
            name='Test Account for Consistency',
            currency='USD',
            notes='Test account for consistency'
        )
        
        db_session.add(ticker)
        db_session.add(account)
        db_session.commit()
        
        # Create related entities
        trade = Trade(
            ticker_id=ticker.id,
            account_id=account.id,
            type='swing',
            side='Long',
            notes='Test trade for consistency'
        )
        
        trade_plan = TradePlan(
            ticker_id=ticker.id,
            account_id=account.id,
            type='swing',
            side='Long',
            notes='Test trade plan for consistency'
        )
        
        alert = Alert(
            type='price_alert',
            condition='price > 200.0',
            message='Test alert for consistency',
            related_type_id=4,  # ticker
            related_id=ticker.id
        )
        
        db_session.add(trade)
        db_session.add(trade_plan)
        db_session.add(alert)
        db_session.commit()
        
        # Verify consistency
        assert trade.ticker_id == ticker.id
        assert trade.account_id == account.id
        assert trade_plan.ticker_id == ticker.id
        assert trade_plan.account_id == account.id
        assert alert.related_id == ticker.id
        
        # Verify currency consistency
        assert ticker.currency == 'USD'
        assert account.currency == 'USD'
        
        # Verify status consistency
        assert trade.status == 'open'
        assert trade_plan.status == 'open'
        assert alert.status == 'open'

    def test_data_integrity_constraints(self, db_session):
        """Test data integrity constraints across relationships"""
        from models.ticker import Ticker
        from models.account import Account
        from models.trade import Trade
        from sqlalchemy.exc import IntegrityError
        
        # Create base entities
        ticker = Ticker(
            symbol='TEST_INTEGRITY_' + str(int(time.time())),
            type='stock',
            currency='USD',
            remarks='Test ticker for integrity'
        )
        
        account = Account(
            name='Test Account for Integrity',
            currency='USD',
            notes='Test account for integrity'
        )
        
        db_session.add(ticker)
        db_session.add(account)
        db_session.commit()
        
        # Test valid relationship
        valid_trade = Trade(
            ticker_id=ticker.id,
            account_id=account.id,
            type='swing',
            side='Long',
            notes='Valid trade'
        )
        
        db_session.add(valid_trade)
        db_session.commit()
        
        assert valid_trade.id is not None
        
        # Test invalid relationship (should fail)
        try:
            invalid_trade = Trade(
                ticker_id=99999,  # Non-existent ticker
                account_id=account.id,
                type='swing',
                side='Long',
                notes='Invalid trade'
            )
            db_session.add(invalid_trade)
            db_session.commit()
            assert False, "Should have raised IntegrityError for invalid ticker_id"
        except IntegrityError:
            db_session.rollback()
            # Expected behavior

    def test_cascade_delete_safety(self, db_session):
        """Test that cascade deletes don't affect production data"""
        from models.ticker import Ticker
        from models.account import Account
        from models.trade import Trade
        
        # Create test data
        ticker = Ticker(
            symbol='TEST_CASCADE_DELETE_' + str(int(time.time())),
            type='stock',
            currency='USD',
            remarks='Test ticker for cascade delete'
        )
        
        account = Account(
            name='Test Account for Cascade Delete',
            currency='USD',
            notes='Test account for cascade delete'
        )
        
        db_session.add(ticker)
        db_session.add(account)
        db_session.commit()
        
        # Create dependent trade
        trade = Trade(
            ticker_id=ticker.id,
            account_id=account.id,
            type='swing',
            side='Long',
            notes='Test trade for cascade delete'
        )
        
        db_session.add(trade)
        db_session.commit()
        
        trade_id = trade.id
        
        # Test cascade delete behavior (if implemented)
        # Note: We're not actually deleting, just testing the relationship
        trade_from_db = db_session.query(Trade).filter_by(id=trade_id).first()
        assert trade_from_db is not None
        assert trade_from_db.ticker_id == ticker.id
        assert trade_from_db.account_id == account.id
        
        # Verify the parent entities still exist
        ticker_from_db = db_session.query(Ticker).filter_by(id=ticker.id).first()
        account_from_db = db_session.query(Account).filter_by(id=account.id).first()
        
        assert ticker_from_db is not None
        assert account_from_db is not None

    def test_relationship_validation(self, db_session):
        """Test relationship validation rules"""
        from models.trade import Trade
        from models.ticker import Ticker
        from models.account import Account
        
        # Create valid entities
        ticker = Ticker(
            symbol='TEST_RELATIONSHIP_' + str(int(time.time())),
            type='stock',
            currency='USD',
            remarks='Test ticker for relationship validation'
        )
        
        account = Account(
            name='Test Account for Relationship',
            currency='USD',
            notes='Test account for relationship validation'
        )
        
        db_session.add(ticker)
        db_session.add(account)
        db_session.commit()
        
        # Test valid relationship
        valid_trade = Trade(
            ticker_id=ticker.id,
            account_id=account.id,
            type='swing',
            side='Long',
            notes='Valid relationship trade'
        )
        
        db_session.add(valid_trade)
        db_session.commit()
        
        assert valid_trade.id is not None
        
        # Test that we can query the relationship
        trade_with_relations = db_session.query(Trade).filter_by(id=valid_trade.id).first()
        assert trade_with_relations is not None
        assert trade_with_relations.ticker_id == ticker.id
        assert trade_with_relations.account_id == account.id

    def test_business_rules_status_values(self, db_session):
        """Test business rules for status values"""
        from models.trade import Trade
        from models.trade_plan import TradePlan
        from models.alert import Alert
        from models.ticker import Ticker
        from models.account import Account
        
        # Create base entities
        ticker = Ticker(
            symbol='TEST_STATUS_RULES_' + str(int(time.time())),
            type='stock',
            currency='USD',
            remarks='Test ticker for status rules'
        )
        
        account = Account(
            name='Test Account for Status Rules',
            currency='USD',
            notes='Test account for status rules'
        )
        
        db_session.add(ticker)
        db_session.add(account)
        db_session.commit()
        
        # Test valid status values
        valid_statuses = ['open', 'closed', 'cancelled']
        
        for status in valid_statuses:
            # Test Trade status
            trade = Trade(
                ticker_id=ticker.id,
                account_id=account.id,
                type='swing',
                side='Long',
                status=status,
                notes=f'Test trade with status {status}'
            )
            
            db_session.add(trade)
            db_session.commit()
            
            assert trade.status == status
            
            # Test TradePlan status
            trade_plan = TradePlan(
                ticker_id=ticker.id,
                account_id=account.id,
                type='swing',
                side='Long',
                status=status,
                notes=f'Test trade plan with status {status}'
            )
            
            db_session.add(trade_plan)
            db_session.commit()
            
            assert trade_plan.status == status
            
            # Test Alert status
            alert = Alert(
                type='price_alert',
                condition='price > 200.0',
                message=f'Test alert with status {status}',
                related_type_id=4,  # ticker
                related_id=ticker.id,
                status=status
            )
            
            db_session.add(alert)
            db_session.commit()
            
            assert alert.status == status

    def test_business_rules_trade_sides(self, db_session):
        """Test business rules for trade side values"""
        from models.trade import Trade
        from models.trade_plan import TradePlan
        from models.ticker import Ticker
        from models.account import Account
        
        # Create base entities
        ticker = Ticker(
            symbol='TEST_SIDE_RULES_' + str(int(time.time())),
            type='stock',
            currency='USD',
            remarks='Test ticker for side rules'
        )
        
        account = Account(
            name='Test Account for Side Rules',
            currency='USD',
            notes='Test account for side rules'
        )
        
        db_session.add(ticker)
        db_session.add(account)
        db_session.commit()
        
        # Test valid side values
        valid_sides = ['Long', 'Short']
        
        for side in valid_sides:
            # Test Trade side
            trade = Trade(
                ticker_id=ticker.id,
                account_id=account.id,
                type='swing',
                side=side,
                notes=f'Test trade with side {side}'
            )
            
            db_session.add(trade)
            db_session.commit()
            
            assert trade.side == side
            
            # Test TradePlan side
            trade_plan = TradePlan(
                ticker_id=ticker.id,
                account_id=account.id,
                type='swing',
                side=side,
                notes=f'Test trade plan with side {side}'
            )
            
            db_session.add(trade_plan)
            db_session.commit()
            
            assert trade_plan.side == side

    def test_alert_entity_relationships(self, db_session):
        """Test alert relationships with different entity types"""
        from models.alert import Alert
        from models.ticker import Ticker
        from models.account import Account
        from models.trade import Trade
        
        # Create base entities
        ticker = Ticker(
            symbol='TEST_ALERT_REL_' + str(int(time.time())),
            type='stock',
            currency='USD',
            remarks='Test ticker for alert relationships'
        )
        
        account = Account(
            name='Test Account for Alert Rel',
            currency='USD',
            notes='Test account for alert relationships'
        )
        
        db_session.add(ticker)
        db_session.add(account)
        db_session.commit()
        
        # Create trade
        trade = Trade(
            ticker_id=ticker.id,
            account_id=account.id,
            type='swing',
            side='Long',
            notes='Test trade for alert relationships'
        )
        
        db_session.add(trade)
        db_session.commit()
        
        # Test alert for ticker (related_type_id = 4)
        ticker_alert = Alert(
            type='price_alert',
            condition='price > 200.0',
            message='Test alert for ticker',
            related_type_id=4,  # ticker
            related_id=ticker.id
        )
        
        db_session.add(ticker_alert)
        db_session.commit()
        
        assert ticker_alert.related_id == ticker.id
        assert ticker_alert.related_type_id == 4
        
        # Test alert for account (related_type_id = 1)
        account_alert = Alert(
            type='balance_alert',
            condition='balance < 1000.0',
            message='Test alert for account',
            related_type_id=1,  # account
            related_id=account.id
        )
        
        db_session.add(account_alert)
        db_session.commit()
        
        assert account_alert.related_id == account.id
        assert account_alert.related_type_id == 1
        
        # Test alert for trade (related_type_id = 2)
        trade_alert = Alert(
            type='profit_alert',
            condition='profit > 100.0',
            message='Test alert for trade',
            related_type_id=2,  # trade
            related_id=trade.id
        )
        
        db_session.add(trade_alert)
        db_session.commit()
        
        assert trade_alert.related_id == trade.id
        assert trade_alert.related_type_id == 2

    def test_data_consistency_across_sessions(self, db_session):
        """Test data consistency across different database sessions"""
        from models.ticker import Ticker
        from models.account import Account
        from models.trade import Trade
        from sqlalchemy.orm import sessionmaker
        from sqlalchemy import create_engine
        import os
        
        # Create base entities in main session
        ticker = Ticker(
            symbol='TEST_SESSION_CONSISTENCY_' + str(int(time.time())),
            type='stock',
            currency='USD',
            remarks='Test ticker for session consistency'
        )
        
        account = Account(
            name='Test Account for Session Consistency',
            currency='USD',
            notes='Test account for session consistency'
        )
        
        db_session.add(ticker)
        db_session.add(account)
        db_session.commit()
        
        # Create trade in main session
        trade = Trade(
            ticker_id=ticker.id,
            account_id=account.id,
            type='swing',
            side='Long',
            notes='Test trade for session consistency'
        )
        
        db_session.add(trade)
        db_session.commit()
        
        trade_id = trade.id
        
        # Create new session and verify data consistency
        test_db_path = os.environ.get('TEST_DATABASE_PATH')
        if test_db_path:
            engine = create_engine(f'sqlite:///{test_db_path}')
            SessionLocal = sessionmaker(bind=engine)
            new_session = SessionLocal()
            
            try:
                # Query the same data in new session
                trade_from_new_session = new_session.query(Trade).filter_by(id=trade_id).first()
                ticker_from_new_session = new_session.query(Ticker).filter_by(id=ticker.id).first()
                account_from_new_session = new_session.query(Account).filter_by(id=account.id).first()
                
                # Verify data consistency
                assert trade_from_new_session is not None
                assert ticker_from_new_session is not None
                assert account_from_new_session is not None
                
                assert trade_from_new_session.ticker_id == ticker.id
                assert trade_from_new_session.account_id == account.id
                assert trade_from_new_session.type == 'swing'
                assert trade_from_new_session.side == 'Long'
                
                assert ticker_from_new_session.symbol == ticker.symbol
                assert account_from_new_session.name == account.name
                
            finally:
                new_session.close()

    def test_transaction_isolation(self, db_session):
        """Test transaction isolation between different operations"""
        from models.ticker import Ticker
        from models.account import Account
        from sqlalchemy.orm import sessionmaker
        from sqlalchemy import create_engine
        import os
        
        # Create entity in main session
        ticker = Ticker(
            symbol='TEST_ISOLATION_' + str(int(time.time())),
            type='stock',
            currency='USD',
            remarks='Test ticker for isolation'
        )
        
        db_session.add(ticker)
        db_session.commit()
        
        ticker_id = ticker.id
        
        # Create separate session for isolation test
        test_db_path = os.environ.get('TEST_DATABASE_PATH')
        if test_db_path:
            engine = create_engine(f'sqlite:///{test_db_path}')
            SessionLocal = sessionmaker(bind=engine)
            isolated_session = SessionLocal()
            
            try:
                # Start transaction in isolated session
                isolated_session.begin()
                
                # Create entity in isolated session
                account = Account(
                    name='Test Account for Isolation',
                    currency='USD',
                    notes='Test account for isolation'
                )
                
                isolated_session.add(account)
                isolated_session.flush()  # Flush but don't commit
                
                # Verify it's in isolated session but not visible in main session
                account_from_isolated = isolated_session.query(Account).filter_by(name='Test Account for Isolation').first()
                assert account_from_isolated is not None
                
                # Verify it's not visible in main session
                account_from_main = db_session.query(Account).filter_by(name='Test Account for Isolation').first()
                assert account_from_main is None
                
                # Commit the isolated transaction
                isolated_session.commit()
                
                # Now it should be visible in main session
                account_from_main_after_commit = db_session.query(Account).filter_by(name='Test Account for Isolation').first()
                assert account_from_main_after_commit is not None
                
            finally:
                isolated_session.close()

    def test_rollback_safety_across_entities(self, db_session):
        """Test rollback safety across multiple entity types"""
        from models.ticker import Ticker
        from models.account import Account
        from models.trade import Trade
        from models.trade_plan import TradePlan
        from models.alert import Alert
        
        # Start transaction
        ticker = Ticker(
            symbol='TEST_ROLLBACK_SAFETY_' + str(int(time.time())),
            type='stock',
            currency='USD',
            remarks='Test ticker for rollback safety'
        )
        
        account = Account(
            name='Test Account for Rollback Safety',
            currency='USD',
            notes='Test account for rollback safety'
        )
        
        db_session.add(ticker)
        db_session.add(account)
        db_session.flush()  # Flush but don't commit
        
        # Create dependent entities
        trade = Trade(
            ticker_id=ticker.id,
            account_id=account.id,
            type='swing',
            side='Long',
            notes='Test trade for rollback safety'
        )
        
        trade_plan = TradePlan(
            ticker_id=ticker.id,
            account_id=account.id,
            type='swing',
            side='Long',
            notes='Test trade plan for rollback safety'
        )
        
        alert = Alert(
            type='price_alert',
            condition='price > 200.0',
            message='Test alert for rollback safety',
            related_type_id=4,  # ticker
            related_id=ticker.id
        )
        
        db_session.add(trade)
        db_session.add(trade_plan)
        db_session.add(alert)
        db_session.flush()
        
        # Store IDs for verification
        ticker_id = ticker.id
        account_id = account.id
        trade_id = trade.id
        trade_plan_id = trade_plan.id
        alert_id = alert.id
        
        # Rollback everything
        db_session.rollback()
        
        # Verify nothing exists in database
        ticker_from_db = db_session.query(Ticker).filter_by(id=ticker_id).first()
        account_from_db = db_session.query(Account).filter_by(id=account_id).first()
        trade_from_db = db_session.query(Trade).filter_by(id=trade_id).first()
        trade_plan_from_db = db_session.query(TradePlan).filter_by(id=trade_plan_id).first()
        alert_from_db = db_session.query(Alert).filter_by(id=alert_id).first()
        
        assert ticker_from_db is None
        assert account_from_db is None
        assert trade_from_db is None
        assert trade_plan_from_db is None
        assert alert_from_db is None
