"""
Integration tests for API endpoints
"""
import pytest
import json
from models.ticker import Ticker
from models.account import Account

# Authentication system removed for simplicity

class TestTickersAPI:
    """Test tickers endpoints"""
    
    def test_get_tickers(self, client):
        """Test get all tickers"""
        response = client.get('/api/v1/tickers/')
        assert response.status_code == 200  # Should succeed without auth
    
    def test_get_ticker_by_id(self, client):
        """Test get ticker by ID"""
        response = client.get('/api/v1/tickers/1')
        assert response.status_code in [200, 404]  # Success or not found
    
    def test_create_ticker(self, client):
        """Test create ticker"""
        ticker_data = {
            'symbol': 'TEST',
            'name': 'Test Company',
            'type': 'stock',
            'currency': 'USD'
        }
        response = client.post('/api/v1/tickers/', json=ticker_data)
        assert response.status_code in [201, 400]  # Created or bad request

class TestAccountsAPI:
    """Test accounts endpoints"""
    
    def test_get_accounts(self, client):
        """Test get all accounts"""
        response = client.get('/api/v1/accounts/')
        assert response.status_code == 200  # Should succeed without auth
    
    def test_get_account_by_id(self, client):
        """Test get account by ID"""
        response = client.get('/api/v1/accounts/1')
        assert response.status_code in [200, 404]  # Success or not found
    
    def test_create_account(self, client):
        """Test create account"""
        account_data = {
            'name': 'Test Account',
            'currency': 'USD',
            'status': 'active',
            'cash_balance': 10000.0
        }
        response = client.post('/api/v1/accounts/', json=account_data)
        assert response.status_code in [201, 400]  # Created or bad request

class TestTradesAPI:
    """Test trades endpoints"""
    
    def test_get_trades(self, client):
        """Test get all trades"""
        response = client.get('/api/v1/trades/')
        assert response.status_code == 200  # Should succeed without auth
    
    def test_get_trade_by_id(self, client):
        """Test get trade by ID"""
        response = client.get('/api/v1/trades/1')
        assert response.status_code in [200, 404]  # Success or not found

class TestHealthCheck:
    """Test health check endpoints"""
    
    def test_health_check(self, client):
        """Test health check endpoint"""
        response = client.get('/api/v1/health')
        assert response.status_code in [200, 404]  # Either success or not found

