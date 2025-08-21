import pytest
import json
from decimal import Decimal
from sqlalchemy.orm import Session
from models.currency import Currency
from models.account import Account
from models.ticker import Ticker


class TestCurrencyAPI:
    """Integration tests for Currency API endpoints"""
    
    def test_get_currencies(self, client, db_session: Session):
        """Test GET /api/v1/currencies/ endpoint"""
        # Create test currencies
        usd = Currency(symbol="USD", name="US Dollar", usd_rate=Decimal('1.000000'))
        eur = Currency(symbol="EUR", name="Euro", usd_rate=Decimal('0.850000'))
        db_session.add_all([usd, eur])
        db_session.commit()
        
        # Test GET request
        response = client.get('/api/v1/currencies/')
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert data['status'] == 'success'
        assert len(data['data']) == 2
        
        # Check currency data
        currencies = data['data']
        usd_data = next(c for c in currencies if c['symbol'] == 'USD')
        eur_data = next(c for c in currencies if c['symbol'] == 'EUR')
        
        assert usd_data['name'] == 'US Dollar'
        assert usd_data['usd_rate'] == 1.0
        assert eur_data['name'] == 'Euro'
        assert eur_data['usd_rate'] == 0.85
    
    def test_get_currency_by_id(self, client, db_session: Session):
        """Test GET /api/v1/currencies/<id> endpoint"""
        # Create test currency
        currency = Currency(symbol="ILS", name="Israeli Shekel", usd_rate=Decimal('3.650000'))
        db_session.add(currency)
        db_session.commit()
        
        # Test GET request
        response = client.get(f'/api/v1/currencies/{currency.id}')
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert data['status'] == 'success'
        assert data['data']['symbol'] == 'ILS'
        assert data['data']['name'] == 'Israeli Shekel'
        assert data['data']['usd_rate'] == 3.65
    
    def test_get_currency_by_id_not_found(self, client, db_session: Session):
        """Test GET /api/v1/currencies/<id> with non-existent ID"""
        response = client.get('/api/v1/currencies/999')
        assert response.status_code == 404
        
        data = json.loads(response.data)
        assert data['status'] == 'error'
        assert 'not found' in data['error']['message'].lower()
    
    def test_create_currency(self, client, db_session: Session):
        """Test POST /api/v1/currencies/ endpoint"""
        currency_data = {
            'symbol': 'GBP',
            'name': 'British Pound',
            'usd_rate': 1.25
        }
        
        # Test POST request
        response = client.post('/api/v1/currencies/',
                             data=json.dumps(currency_data),
                             content_type='application/json')
        assert response.status_code == 201
        
        data = json.loads(response.data)
        assert data['status'] == 'success'
        assert data['data']['symbol'] == 'GBP'
        assert data['data']['name'] == 'British Pound'
        assert data['data']['usd_rate'] == 1.25
        
        # Verify currency was created in database
        currency = db_session.query(Currency).filter_by(symbol='GBP').first()
        assert currency is not None
        assert currency.name == 'British Pound'
    
    def test_create_currency_duplicate_symbol(self, client, db_session: Session):
        """Test POST /api/v1/currencies/ with duplicate symbol"""
        # Create existing currency
        existing = Currency(symbol="USD", name="US Dollar", usd_rate=Decimal('1.000000'))
        db_session.add(existing)
        db_session.commit()
        
        # Try to create duplicate
        currency_data = {
            'symbol': 'USD',  # Duplicate symbol
            'name': 'Different Dollar',
            'usd_rate': 1.0
        }
        
        response = client.post('/api/v1/currencies/',
                             data=json.dumps(currency_data),
                             content_type='application/json')
        assert response.status_code == 400
        
        data = json.loads(response.data)
        assert data['status'] == 'error'
    
    def test_create_currency_invalid_data(self, client, db_session: Session):
        """Test POST /api/v1/currencies/ with invalid data"""
        # Test without required fields
        currency_data = {
            'name': 'Currency without symbol',
            'usd_rate': 1.0
        }
        
        response = client.post('/api/v1/currencies/',
                             data=json.dumps(currency_data),
                             content_type='application/json')
        assert response.status_code == 400
        
        data = json.loads(response.data)
        assert data['status'] == 'error'
    
    def test_update_currency(self, client, db_session: Session):
        """Test PUT /api/v1/currencies/<id> endpoint"""
        # Create test currency
        currency = Currency(symbol="EUR", name="אירו", usd_rate=Decimal('0.850000'))
        db_session.add(currency)
        db_session.commit()
        
        # Update data
        update_data = {
            'name': 'Updated Euro',
            'usd_rate': 0.86
        }
        
        response = client.put(f'/api/v1/currencies/{currency.id}',
                            data=json.dumps(update_data),
                            content_type='application/json')
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert data['status'] == 'success'
        assert data['data']['name'] == 'Updated Euro'
        assert data['data']['usd_rate'] == 0.86
        assert data['data']['symbol'] == 'EUR'  # Should not change
    
    def test_update_currency_not_found(self, client, db_session: Session):
        """Test PUT /api/v1/currencies/<id> with non-existent ID"""
        update_data = {
            'name': 'Currency not found',
            'usd_rate': 1.0
        }
        
        response = client.put('/api/v1/currencies/999',
                            data=json.dumps(update_data),
                            content_type='application/json')
        assert response.status_code == 404
        
        data = json.loads(response.data)
        assert data['status'] == 'error'
    
    def test_update_currency_rate(self, client, db_session: Session):
        """Test PUT /api/v1/currencies/<id>/rate endpoint"""
        # Create test currency
        currency = Currency(symbol="ILS", name="שקל ישראלי", usd_rate=Decimal('3.650000'))
        db_session.add(currency)
        db_session.commit()
        
        # Update rate only
        rate_data = {
            'usd_rate': 3.75
        }
        
        response = client.put(f'/api/v1/currencies/{currency.id}/rate',
                            data=json.dumps(rate_data),
                            content_type='application/json')
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert data['status'] == 'success'
        assert data['data']['usd_rate'] == 3.75
        assert data['data']['name'] == 'שקל ישראלי'  # Should not change
    
    def test_delete_currency(self, client, db_session: Session):
        """Test DELETE /api/v1/currencies/<id> endpoint"""
        # Create test currency
        currency = Currency(symbol="TEST", name="מטבע בדיקה", usd_rate=Decimal('1.000000'))
        db_session.add(currency)
        db_session.commit()
        currency_id = currency.id
        
        # Test DELETE request
        response = client.delete(f'/api/v1/currencies/{currency_id}')
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert data['status'] == 'success'
        
        # Verify currency was deleted
        deleted_currency = db_session.query(Currency).filter_by(id=currency_id).first()
        assert deleted_currency is None
    
    def test_delete_currency_not_found(self, client, db_session: Session):
        """Test DELETE /api/v1/currencies/<id> with non-existent ID"""
        response = client.delete('/api/v1/currencies/999')
        assert response.status_code == 404
        
        data = json.loads(response.data)
        assert data['status'] == 'error'
    
    def test_delete_currency_in_use(self, client, db_session: Session):
        """Test DELETE /api/v1/currencies/<id> when currency is in use"""
        # Create currency
        currency = Currency(symbol="USD", name="דולר אמריקאי", usd_rate=Decimal('1.000000'))
        db_session.add(currency)
        db_session.commit()
        
        # Create account using this currency
        account = Account(name="חשבון בדיקה", currency_id=currency.id, status="active")
        db_session.add(account)
        db_session.commit()
        
        # Try to delete currency
        response = client.delete(f'/api/v1/currencies/{currency.id}')
        assert response.status_code == 400
        
        data = json.loads(response.data)
        assert data['status'] == 'error'
        assert 'in use' in data['error']['message'].lower()


class TestCurrencyAPIIntegration:
    """Test currency API integration with other models"""
    
    def test_account_with_currency_api(self, client, db_session: Session):
        """Test account creation with currency through API"""
        # Create currency first
        currency = Currency(symbol="USD", name="דולר אמריקאי", usd_rate=Decimal('1.000000'))
        db_session.add(currency)
        db_session.commit()
        
        # Create account with currency_id
        account_data = {
            'name': 'חשבון בדיקה',
            'currency_id': currency.id,
            'status': 'active'
        }
        
        response = client.post('/api/v1/accounts/',
                             data=json.dumps(account_data),
                             content_type='application/json')
        assert response.status_code == 201
        
        data = json.loads(response.data)
        assert data['data']['currency_id'] == currency.id
        assert data['data']['currency']['symbol'] == 'USD'
    
    def test_ticker_with_currency_api(self, client, db_session: Session):
        """Test ticker creation with currency through API"""
        # Create currency first
        currency = Currency(symbol="USD", name="דולר אמריקאי", usd_rate=Decimal('1.000000'))
        db_session.add(currency)
        db_session.commit()
        
        # Create ticker with currency_id
        ticker_data = {
            'symbol': 'AAPL',
            'name': 'Apple Inc.',
            'type': 'stock',
            'currency_id': currency.id
        }
        
        response = client.post('/api/v1/tickers/',
                             data=json.dumps(ticker_data),
                             content_type='application/json')
        assert response.status_code == 201
        
        data = json.loads(response.data)
        assert data['data']['currency_id'] == currency.id
        assert data['data']['currency']['symbol'] == 'USD'
    
    def test_currency_usage_summary(self, client, db_session: Session):
        """Test currency usage summary endpoint"""
        # Create currency
        currency = Currency(symbol="USD", name="דולר אמריקאי", usd_rate=Decimal('1.000000'))
        db_session.add(currency)
        db_session.commit()
        
        # Create accounts and tickers using this currency
        account1 = Account(name="חשבון 1", currency_id=currency.id, status="active")
        account2 = Account(name="חשבון 2", currency_id=currency.id, status="active")
        ticker1 = Ticker(symbol="AAPL", name="Apple", type="stock", currency_id=currency.id)
        ticker2 = Ticker(symbol="GOOGL", name="Google", type="stock", currency_id=currency.id)
        
        db_session.add_all([account1, account2, ticker1, ticker2])
        db_session.commit()
        
        # Test usage summary
        response = client.get(f'/api/v1/currencies/{currency.id}/usage')
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert data['status'] == 'success'
        assert data['data']['accounts_count'] == 2
        assert data['data']['tickers_count'] == 2
        assert data['data']['cash_flows_count'] == 0
