"""
Unit tests for database entity relationships and business rules
בדיקות יחידה לקשרים בין ישויות וכללי עסקים
"""
import pytest
import time
from datetime import datetime, timedelta
from sqlalchemy.orm import Session


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

    def test_cross_entity_consistency(self, db_session):
        """Test consistency across different entities"""
        from models.trade import Trade
        from models.trade_plan import TradePlan
        from models.ticker import Ticker
        from models.account import Account
        
        # Create shared dependencies
        ticker = Ticker(
            symbol='TEST_CONSISTENCY_' + str(int(time.time())),
            type='stock',
            currency='USD',
            remarks='Test ticker for consistency'
        )
        
        account = Account(
            name='Test Account for Consistency',
            currency='USD',
            notes='Test account for consistency tests'
        )
        
        db_session.add(ticker)
        db_session.add(account)
        db_session.commit()
        
        # Create related entities
        plan = TradePlan(
            ticker_id=ticker.id,
            account_id=account.id,
            investment_type='swing',
            side='Long',
            planned_amount=10000.0,
            entry_conditions='Price above $100',
            reasons='Strong indicators'
        )
        
        trade = Trade(
            ticker_id=ticker.id,
            account_id=account.id,
            type='swing',
            side='Long',
            notes='Trade from plan'
        )
        
        db_session.add(plan)
        db_session.add(trade)
        db_session.commit()
        
        # Test consistency
        assert plan.ticker_id == trade.ticker_id
        assert plan.account_id == trade.account_id
        assert plan.side == trade.side
        
        # Both should reference the same ticker and account
        assert plan.ticker.id == trade.ticker.id
        assert plan.account.id == trade.account.id
