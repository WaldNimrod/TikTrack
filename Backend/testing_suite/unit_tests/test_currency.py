import pytest
from decimal import Decimal
from sqlalchemy.orm import Session
from models.currency import Currency
from models.account import Account
from models.ticker import Ticker
from models.cash_flow import CashFlow


class TestCurrencyModel:
    """Unit tests for Currency model"""
    
    def test_currency_creation(self, db_session: Session):
        """Test creating a new currency"""
        currency = Currency(
            symbol="USD",
            name="US Dollar",
            usd_rate=Decimal('1.000000')
        )
        db_session.add(currency)
        db_session.commit()
        
        assert currency.id is not None
        assert currency.symbol == "USD"
        assert currency.name == "US Dollar"
        assert currency.usd_rate == Decimal('1.000000')
    
    def test_currency_to_dict(self, db_session: Session):
        """Test currency to_dict method"""
        currency = Currency(
            symbol="EUR",
            name="Euro",
            usd_rate=Decimal('0.850000')
        )
        db_session.add(currency)
        db_session.commit()
        
        currency_dict = currency.to_dict()
        
        assert currency_dict['id'] == currency.id
        assert currency_dict['symbol'] == "EUR"
        assert currency_dict['name'] == "Euro"
        assert currency_dict['usd_rate'] == 0.85  # Should be converted to float
        assert 'created_at' in currency_dict
        assert 'updated_at' in currency_dict
    
    def test_currency_repr(self, db_session: Session):
        """Test currency __repr__ method"""
        currency = Currency(
            symbol="ILS",
            name="Israeli Shekel",
            usd_rate=Decimal('3.650000')
        )
        db_session.add(currency)
        db_session.commit()
        
        repr_str = repr(currency)
        assert "Currency" in repr_str
        assert "ILS" in repr_str
        assert "Israeli Shekel" in repr_str
        assert "3.65" in repr_str
    
    def test_currency_unique_symbol(self, db_session: Session):
        """Test that currency symbols must be unique"""
        currency1 = Currency(
            symbol="USD",
            name="US Dollar",
            usd_rate=Decimal('1.000000')
        )
        db_session.add(currency1)
        db_session.commit()
        
        currency2 = Currency(
            symbol="USD",  # Same symbol
            name="Different Dollar",
            usd_rate=Decimal('1.000000')
        )
        db_session.add(currency2)
        
        with pytest.raises(Exception):  # Should raise integrity error
            db_session.commit()
    
    def test_currency_required_fields(self, db_session: Session):
        """Test that required fields are enforced"""
        # Test without symbol
        currency = Currency(
            name="US Dollar",
            usd_rate=Decimal('1.000000')
        )
        db_session.add(currency)
        
        with pytest.raises(Exception):  # Should raise constraint error
            db_session.commit()
    
    def test_currency_default_usd_rate(self, db_session: Session):
        """Test default USD rate"""
        currency = Currency(
            symbol="GBP",
            name="British Pound"
            # No usd_rate specified
        )
        db_session.add(currency)
        db_session.commit()
        
        assert currency.usd_rate == Decimal('1.0')  # Default value


class TestCurrencyRelationships:
    """Test currency relationships with other models"""
    
    def test_currency_accounts_relationship(self, db_session: Session):
        """Test currency relationship with accounts"""
        # Create currency
        currency = Currency(
            symbol="USD",
            name="דולר אמריקאי",
            usd_rate=Decimal('1.000000')
        )
        db_session.add(currency)
        db_session.commit()
        
        # Create account with currency
        account = Account(
            name="חשבון בדיקה",
            currency_id=currency.id,
            status="active"
        )
        db_session.add(account)
        db_session.commit()
        
        # Test relationship
        assert account.currency_id == currency.id
        assert account.currency.symbol == "USD"
        assert len(currency.accounts) == 1
        assert currency.accounts[0].name == "חשבון בדיקה"
    
    def test_currency_tickers_relationship(self, db_session: Session):
        """Test currency relationship with tickers"""
        # Create currency
        currency = Currency(
            symbol="USD",
            name="דולר אמריקאי",
            usd_rate=Decimal('1.000000')
        )
        db_session.add(currency)
        db_session.commit()
        
        # Create ticker with currency
        ticker = Ticker(
            symbol="AAPL",
            name="Apple Inc.",
            type="stock",
            currency_id=currency.id
        )
        db_session.add(ticker)
        db_session.commit()
        
        # Test relationship
        assert ticker.currency_id == currency.id
        assert ticker.currency.symbol == "USD"
        assert len(currency.tickers) == 1
        assert currency.tickers[0].symbol == "AAPL"
    
    def test_currency_cash_flows_relationship(self, db_session: Session):
        """Test currency relationship with cash flows"""
        # Create currency
        currency = Currency(
            symbol="USD",
            name="דולר אמריקאי",
            usd_rate=Decimal('1.000000')
        )
        db_session.add(currency)
        db_session.commit()
        
        # Create account for cash flow
        account = Account(
            name="חשבון בדיקה",
            currency_id=currency.id,
            status="active"
        )
        db_session.add(account)
        db_session.commit()
        
        # Create cash flow with currency
        cash_flow = CashFlow(
            account_id=account.id,
            amount=1000.0,
            type="deposit",
            currency_id=currency.id
        )
        db_session.add(cash_flow)
        db_session.commit()
        
        # Test relationship
        assert cash_flow.currency_id == currency.id
        assert cash_flow.currency.symbol == "USD"
        assert len(currency.cash_flows) == 1
        assert currency.cash_flows[0].amount == 1000.0


class TestCurrencyValidation:
    """Test currency validation rules"""
    
    def test_currency_symbol_length(self, db_session: Session):
        """Test currency symbol length validation"""
        # Test symbol too long
        currency = Currency(
            symbol="USDDDDDDDDDD",  # Too long
            name="דולר אמריקאי",
            usd_rate=Decimal('1.000000')
        )
        db_session.add(currency)
        
        with pytest.raises(Exception):  # Should raise constraint error
            db_session.commit()
    
    def test_currency_usd_rate_precision(self, db_session: Session):
        """Test USD rate precision"""
        currency = Currency(
            symbol="EUR",
            name="אירו",
            usd_rate=Decimal('0.123456789')  # Too many decimal places
        )
        db_session.add(currency)
        db_session.commit()
        
        # Should be truncated to 6 decimal places
        assert currency.usd_rate == Decimal('0.123457')
    
    def test_currency_negative_usd_rate(self, db_session: Session):
        """Test negative USD rate"""
        currency = Currency(
            symbol="TEST",
            name="מטבע בדיקה",
            usd_rate=Decimal('-1.000000')  # Negative rate
        )
        db_session.add(currency)
        db_session.commit()
        
        # Should allow negative rates (for testing purposes)
        assert currency.usd_rate == Decimal('-1.000000')


class TestCurrencyOperations:
    """Test currency operations and calculations"""
    
    def test_currency_conversion(self, db_session: Session):
        """Test currency conversion calculations"""
        usd = Currency(
            symbol="USD",
            name="דולר אמריקאי",
            usd_rate=Decimal('1.000000')
        )
        eur = Currency(
            symbol="EUR",
            name="אירו",
            usd_rate=Decimal('0.850000')
        )
        ils = Currency(
            symbol="ILS",
            name="שקל ישראלי",
            usd_rate=Decimal('3.650000')
        )
        
        db_session.add_all([usd, eur, ils])
        db_session.commit()
        
        # Test conversion calculations
        usd_amount = 100
        eur_amount = usd_amount * float(eur.usd_rate)
        ils_amount = usd_amount * float(ils.usd_rate)
        
        assert eur_amount == 85.0
        assert ils_amount == 365.0
    
    def test_currency_rate_update(self, db_session: Session):
        """Test updating currency rate"""
        currency = Currency(
            symbol="EUR",
            name="אירו",
            usd_rate=Decimal('0.850000')
        )
        db_session.add(currency)
        db_session.commit()
        
        # Update rate
        currency.usd_rate = Decimal('0.900000')
        db_session.commit()
        
        # Verify update
        updated_currency = db_session.query(Currency).filter_by(symbol="EUR").first()
        assert updated_currency.usd_rate == Decimal('0.900000')
    
    def test_currency_deletion_with_relationships(self, db_session: Session):
        """Test currency deletion with existing relationships"""
        # Create currency
        currency = Currency(
            symbol="USD",
            name="דולר אמריקאי",
            usd_rate=Decimal('1.000000')
        )
        db_session.add(currency)
        db_session.commit()
        
        # Create account with currency
        account = Account(
            name="חשבון בדיקה",
            currency_id=currency.id,
            status="active"
        )
        db_session.add(account)
        db_session.commit()
        
        # Try to delete currency
        db_session.delete(currency)
        
        with pytest.raises(Exception):  # Should raise foreign key constraint error
            db_session.commit()
