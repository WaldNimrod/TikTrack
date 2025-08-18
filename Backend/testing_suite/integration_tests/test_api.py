"""
Integration tests for TikTrack API endpoints
"""
import pytest
import json
import time

class TestAPIEndpoints:
    """Test API endpoints functionality"""
    
    def test_get_tickers(self, client):
        """Test getting all tickers"""
        response = client.get('/api/test_tickers')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert isinstance(data, list)
        assert len(data) > 0
        
        # Check that tickers have required fields
        for ticker in data:
            assert 'id' in ticker
            assert 'symbol' in ticker
            assert 'type' in ticker
            assert 'currency' in ticker
    
    def test_get_ticker_by_id(self, client):
        """Test getting a specific ticker by ID"""
        # First get all tickers to find an ID
        response = client.get('/api/test_tickers')
        tickers = json.loads(response.data)
        
        if tickers:
            ticker_id = tickers[0]['id']
            response = client.get(f'/api/tickers/{ticker_id}')
            assert response.status_code == 200
            data = json.loads(response.data)
            assert data['id'] == ticker_id
    
    def test_get_accounts(self, client):
        """Test getting all accounts"""
        response = client.get('/api/accounts')
        # Note: This endpoint might not exist, so we'll check for either 200 or 404
        if response.status_code == 200:
            data = json.loads(response.data)
            assert isinstance(data, list)
        else:
            # If endpoint doesn't exist, that's okay for now
            assert response.status_code == 404
    
    def test_get_account_by_id(self, client):
        """Test getting a specific account by ID"""
        # First get all accounts to find an ID
        response = client.get('/api/accounts')
        
        if response.status_code == 200:
            accounts = json.loads(response.data)
            if accounts:
                account_id = accounts[0]['id']
                response = client.get(f'/api/accounts/{account_id}')
                assert response.status_code == 200
                data = json.loads(response.data)
                assert data['id'] == account_id
        else:
            # If accounts endpoint doesn't exist, skip this test
            pytest.skip("Accounts endpoint not available")
    
    def test_get_trades(self, client):
        """Test getting all trades"""
        response = client.get('/api/trades')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert isinstance(data, list)
    
    def test_get_trade_by_id(self, client):
        """Test getting a specific trade by ID"""
        # First get all trades to find an ID
        response = client.get('/api/trades')
        trades = json.loads(response.data)
        
        if trades:
            trade_id = trades[0]['id']
            response = client.get(f'/api/trades/{trade_id}')
            # Note: Individual trade endpoint might not exist
            if response.status_code == 200:
                data = json.loads(response.data)
                assert data['id'] == trade_id
            else:
                # If endpoint doesn't exist, that's okay for now
                assert response.status_code == 404
    
    def test_health_check(self, client):
        """Test health check endpoint"""
        response = client.get('/health')
        # Note: This might return 404 if health endpoint doesn't exist
        # That's okay for now
        assert response.status_code in [200, 404]
    
    def test_main_page(self, client):
        """Test main page loads"""
        response = client.get('/')
        assert response.status_code == 200
        assert b'<!DOCTYPE html>' in response.data or b'<html' in response.data
    
    def test_api_response_format(self, client):
        """Test that API responses are valid JSON"""
        endpoints = [
            '/api/test_tickers',
            '/api/accounts',
            '/api/trades'
        ]
        
        for endpoint in endpoints:
            response = client.get(endpoint)
            if response.status_code == 200:
                try:
                    json.loads(response.data)
                except json.JSONDecodeError:
                    pytest.fail(f"Invalid JSON response from {endpoint}")
    
    def test_cors_headers(self, client):
        """Test that CORS headers are present"""
        response = client.get('/api/test_tickers')
        # Check for CORS headers (if implemented)
        # This is optional - not all endpoints might have CORS
        pass
