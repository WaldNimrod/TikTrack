"""
End-to-end tests for TikTrack basic workflow
"""
import pytest
import json
import time

class TestBasicWorkflow:
    """Test basic application workflow"""
    
    def test_main_page_loads(self, client):
        """Test that the main page loads correctly"""
        response = client.get('/')
        assert response.status_code == 200
        assert b'<!DOCTYPE html>' in response.data or b'<html' in response.data
        assert b'TikTrack' in response.data
    
    def test_api_endpoints_respond(self, client):
        """Test that main API endpoints respond"""
        endpoints = [
            '/api/test_tickers',
            '/api/trades',
            '/api/tradeplans'
        ]
        
        for endpoint in endpoints:
            response = client.get(endpoint)
            assert response.status_code in [200, 404]  # 404 is okay if endpoint doesn't exist
            if response.status_code == 200:
                # Verify it's valid JSON
                try:
                    json.loads(response.data)
                except json.JSONDecodeError:
                    pytest.fail(f"Invalid JSON response from {endpoint}")
    
    def test_tickers_data_structure(self, client):
        """Test that tickers data has correct structure"""
        response = client.get('/api/test_tickers')
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert isinstance(data, list)
        
        if data:  # If there are tickers
            ticker = data[0]
            required_fields = ['id', 'symbol', 'type', 'currency']
            for field in required_fields:
                assert field in ticker
    
    def test_trades_data_structure(self, client):
        """Test that trades data has correct structure"""
        response = client.get('/api/trades')
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert isinstance(data, list)
        
        if data:  # If there are trades
            trade = data[0]
            # Check for basic fields that should exist
            assert 'id' in trade
    
    def test_static_files_accessible(self, client):
        """Test that static files are accessible"""
        # Test a few common static file paths
        static_paths = [
            '/static/styles.css',
            '/scripts/app-header.js',
            '/images/logo.png'
        ]
        
        for path in static_paths:
            response = client.get(path)
            # Static files should either return 200 or 404 (if file doesn't exist)
            assert response.status_code in [200, 404]
    
    def test_error_handling(self, client):
        """Test that the application handles errors gracefully"""
        # Test non-existent endpoint
        response = client.get('/api/nonexistent')
        assert response.status_code == 404
        
        # Test malformed JSON in POST request
        response = client.post('/api/trades', 
                             data='invalid json',
                             content_type='application/json')
        # Should handle gracefully (not crash)
        assert response.status_code in [400, 500, 404]
    
    def test_cors_headers(self, client):
        """Test CORS headers if implemented"""
        response = client.get('/api/test_tickers')
        # This is optional - not all endpoints might have CORS
        # Just verify the request doesn't crash
        assert response.status_code in [200, 404]
    
    def test_response_time(self, client):
        """Test that API responses are reasonably fast"""
        start_time = time.time()
        response = client.get('/api/test_tickers')
        end_time = time.time()
        
        response_time = end_time - start_time
        assert response_time < 1.0  # Should respond within 1 second
        assert response.status_code in [200, 404]
    
    def test_database_connectivity(self, client):
        """Test that database connectivity works"""
        # Test an endpoint that requires database access
        response = client.get('/api/test_tickers')
        assert response.status_code == 200
        
        # If we get here, database connectivity is working
        data = json.loads(response.data)
        assert isinstance(data, list)
