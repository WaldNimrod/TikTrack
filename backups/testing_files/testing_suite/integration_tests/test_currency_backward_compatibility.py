import pytest
import json
from decimal import Decimal
from sqlalchemy.orm import Session
from models.currency import Currency
from models.account import Account
from models.ticker import Ticker
from models.cash_flow import CashFlow


class TestCurrencyBackwardCompatibility:
    """Test backward compatibility after currency migration"""
    
    def test_existing_data_still_accessible(self, db_session: Session):
        """Test that existing data is still accessible after migration"""
        # Create currency
        usd = Currency(symbol="USD", name="דולר אמריקאי", usd_rate=Decimal('1.000000'))
        db_session.add(usd)
        db_session.commit()
        
        # Create account with currency_id (new way)
        account = Account(
            name="חשבון בדיקה",
            currency_id=usd.id,
            status="active"
        )
        db_session.add(account)
        db_session.commit()
        
        # Test that account data is accessible
        retrieved_account = db_session.query(Account).filter_by(id=account.id).first()
        assert retrieved_account is not None
        assert retrieved_account.name == "חשבון בדיקה"
        assert retrieved_account.currency_id == usd.id
        
        # Test that currency relationship works
        assert retrieved_account.currency is not None
        assert retrieved_account.currency.symbol == "USD"
    
    def test_api_responses_include_currency_data(self, client, db_session: Session):
        """Test that API responses include currency data in expected format"""
        # Create currency
        usd = Currency(symbol="USD", name="דולר אמריקאי", usd_rate=Decimal('1.000000'))
        db_session.add(usd)
        db_session.commit()
        
        # Create account
        account = Account(
            name="חשבון בדיקה",
            currency_id=usd.id,
            status="active"
        )
        db_session.add(account)
        db_session.commit()
        
        # Test accounts API response
        response = client.get('/api/v1/accounts/')
        assert response.status_code == 200
        
        data = json.loads(response.data)
        accounts = data['data']
        
        # Find our test account
        test_account = next((acc for acc in accounts if acc['name'] == "חשבון בדיקה"), None)
        assert test_account is not None
        
        # Check that currency data is included
        assert 'currency_id' in test_account
        assert test_account['currency_id'] == usd.id
        assert 'currency' in test_account
        assert test_account['currency']['symbol'] == "USD"
        assert test_account['currency']['name'] == "דולר אמריקאי"
    
    def test_ticker_api_responses_include_currency_data(self, client, db_session: Session):
        """Test that ticker API responses include currency data"""
        # Create currency
        usd = Currency(symbol="USD", name="דולר אמריקאי", usd_rate=Decimal('1.000000'))
        db_session.add(usd)
        db_session.commit()
        
        # Create ticker
        ticker = Ticker(
            symbol="AAPL",
            name="Apple Inc.",
            type="stock",
            currency_id=usd.id
        )
        db_session.add(ticker)
        db_session.commit()
        
        # Test tickers API response
        response = client.get('/api/v1/tickers/')
        assert response.status_code == 200
        
        data = json.loads(response.data)
        tickers = data['data']
        
        # Find our test ticker
        test_ticker = next((t for t in tickers if t['symbol'] == "AAPL"), None)
        assert test_ticker is not None
        
        # Check that currency data is included
        assert 'currency_id' in test_ticker
        assert test_ticker['currency_id'] == usd.id
        assert 'currency' in test_ticker
        assert test_ticker['currency']['symbol'] == "USD"
    
    def test_currency_display_functions_work(self, db_session: Session):
        """Test that currency display functions work correctly"""
        # Create currency
        usd = Currency(symbol="USD", name="דולר אמריקאי", usd_rate=Decimal('1.000000'))
        db_session.add(usd)
        db_session.commit()
        
        # Create account
        account = Account(
            name="חשבון בדיקה",
            currency_id=usd.id,
            status="active",
            cash_balance=1000.0
        )
        db_session.add(account)
        db_session.commit()
        
        # Test get_balance_info method
        balance_info = account.get_balance_info()
        assert "1,000.00 $" in balance_info['cash_balance']  # Should show USD symbol
        
        # Test to_dict method
        account_dict = account.to_dict()
        assert account_dict['currency_id'] == usd.id
        assert account_dict['currency']['symbol'] == "USD"
    
    def test_currency_relationships_work_both_ways(self, db_session: Session):
        """Test that currency relationships work in both directions"""
        # Create currency
        usd = Currency(symbol="USD", name="דולר אמריקאי", usd_rate=Decimal('1.000000'))
        db_session.add(usd)
        db_session.commit()
        
        # Create multiple accounts with same currency
        accounts = []
        for i in range(3):
            account = Account(
                name=f"חשבון {i}",
                currency_id=usd.id,
                status="active"
            )
            accounts.append(account)
        
        db_session.add_all(accounts)
        db_session.commit()
        
        # Test currency -> accounts relationship
        assert len(usd.accounts) == 3
        for account in usd.accounts:
            assert account.currency_id == usd.id
        
        # Test account -> currency relationship
        for account in accounts:
            assert account.currency.symbol == "USD"
            assert account.currency_id == usd.id
    
    def test_currency_validation_still_works(self, db_session: Session):
        """Test that currency validation still works correctly"""
        # Create currency
        usd = Currency(symbol="USD", name="דולר אמריקאי", usd_rate=Decimal('1.000000'))
        db_session.add(usd)
        db_session.commit()
        
        # Test creating account with valid currency_id
        account = Account(
            name="חשבון תקין",
            currency_id=usd.id,
            status="active"
        )
        db_session.add(account)
        db_session.commit()
        
        # Test creating account with invalid currency_id
        invalid_account = Account(
            name="חשבון לא תקין",
            currency_id=999,  # Non-existent currency
            status="active"
        )
        db_session.add(invalid_account)
        
        with pytest.raises(Exception):  # Should raise foreign key constraint error
            db_session.commit()
    
    def test_currency_rate_updates_affect_all_related_entities(self, db_session: Session):
        """Test that currency rate updates affect all related entities"""
        # Create currency
        usd = Currency(symbol="USD", name="דולר אמריקאי", usd_rate=Decimal('1.000000'))
        db_session.add(usd)
        db_session.commit()
        
        # Create account and ticker with this currency
        account = Account(
            name="חשבון בדיקה",
            currency_id=usd.id,
            status="active"
        )
        ticker = Ticker(
            symbol="AAPL",
            name="Apple Inc.",
            type="stock",
            currency_id=usd.id
        )
        
        db_session.add_all([account, ticker])
        db_session.commit()
        
        # Update currency rate
        usd.usd_rate = Decimal('1.100000')
        db_session.commit()
        
        # Verify that all related entities see the updated rate
        updated_account = db_session.query(Account).filter_by(id=account.id).first()
        updated_ticker = db_session.query(Ticker).filter_by(id=ticker.id).first()
        
        assert updated_account.currency.usd_rate == Decimal('1.100000')
        assert updated_ticker.currency.usd_rate == Decimal('1.100000')
    
    def test_currency_deletion_protection(self, db_session: Session):
        """Test that currencies cannot be deleted when in use"""
        # Create currency
        usd = Currency(symbol="USD", name="דולר אמריקאי", usd_rate=Decimal('1.000000'))
        db_session.add(usd)
        db_session.commit()
        
        # Create account using this currency
        account = Account(
            name="חשבון בדיקה",
            currency_id=usd.id,
            status="active"
        )
        db_session.add(account)
        db_session.commit()
        
        # Try to delete currency
        db_session.delete(usd)
        
        with pytest.raises(Exception):  # Should raise foreign key constraint error
            db_session.commit()
        
        # Verify currency still exists
        db_session.rollback()
        existing_currency = db_session.query(Currency).filter_by(symbol="USD").first()
        assert existing_currency is not None
    
    def test_currency_migration_data_integrity(self, db_session: Session):
        """Test that migrated data maintains integrity"""
        # Create currency
        usd = Currency(symbol="USD", name="דולר אמריקאי", usd_rate=Decimal('1.000000'))
        db_session.add(usd)
        db_session.commit()
        
        # Create account and ticker
        account = Account(
            name="חשבון בדיקה",
            currency_id=usd.id,
            status="active",
            cash_balance=1000.0
        )
        ticker = Ticker(
            symbol="AAPL",
            name="Apple Inc.",
            type="stock",
            currency_id=usd.id
        )
        
        db_session.add_all([account, ticker])
        db_session.commit()
        
        # Test data integrity through multiple operations
        # 1. Reload from database
        reloaded_account = db_session.query(Account).filter_by(id=account.id).first()
        reloaded_ticker = db_session.query(Ticker).filter_by(id=ticker.id).first()
        
        assert reloaded_account.currency_id == usd.id
        assert reloaded_ticker.currency_id == usd.id
        
        # 2. Test relationships
        assert reloaded_account.currency.symbol == "USD"
        assert reloaded_ticker.currency.symbol == "USD"
        
        # 3. Test serialization
        account_dict = reloaded_account.to_dict()
        ticker_dict = reloaded_ticker.to_dict()
        
        assert account_dict['currency_id'] == usd.id
        assert account_dict['currency']['symbol'] == "USD"
        assert ticker_dict['currency_id'] == usd.id
        assert ticker_dict['currency']['symbol'] == "USD"
        
        # 4. Test balance display
        balance_info = reloaded_account.get_balance_info()
        assert "1,000.00 $" in balance_info['cash_balance']
    
    def test_currency_api_endpoints_work_with_migrated_data(self, client, db_session: Session):
        """Test that currency API endpoints work with migrated data"""
        # Create currency
        usd = Currency(symbol="USD", name="דולר אמריקאי", usd_rate=Decimal('1.000000'))
        db_session.add(usd)
        db_session.commit()
        
        # Test currencies API
        response = client.get('/api/v1/currencies/')
        assert response.status_code == 200
        
        data = json.loads(response.data)
        currencies = data['data']
        
        usd_data = next((c for c in currencies if c['symbol'] == "USD"), None)
        assert usd_data is not None
        assert usd_data['name'] == "דולר אמריקאי"
        assert usd_data['usd_rate'] == 1.0
        
        # Test specific currency endpoint
        response = client.get(f'/api/v1/currencies/{usd.id}')
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert data['data']['symbol'] == "USD"
        assert data['data']['name'] == "דולר אמריקאי"
    
    def test_currency_usage_summary_works(self, client, db_session: Session):
        """Test that currency usage summary works correctly"""
        # Create currency
        usd = Currency(symbol="USD", name="דולר אמריקאי", usd_rate=Decimal('1.000000'))
        db_session.add(usd)
        db_session.commit()
        
        # Create accounts and tickers using this currency
        account1 = Account(name="חשבון 1", currency_id=usd.id, status="active")
        account2 = Account(name="חשבון 2", currency_id=usd.id, status="active")
        ticker1 = Ticker(symbol="AAPL", name="Apple", type="stock", currency_id=usd.id)
        ticker2 = Ticker(symbol="GOOGL", name="Google", type="stock", currency_id=usd.id)
        
        db_session.add_all([account1, account2, ticker1, ticker2])
        db_session.commit()
        
        # Test usage summary endpoint
        response = client.get(f'/api/v1/currencies/{usd.id}/usage')
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert data['status'] == 'success'
        assert data['data']['accounts_count'] == 2
        assert data['data']['tickers_count'] == 2
        assert data['data']['cash_flows_count'] == 0
