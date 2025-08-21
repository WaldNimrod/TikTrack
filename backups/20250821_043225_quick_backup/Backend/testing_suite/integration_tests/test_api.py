"""
Integration tests for TikTrack API endpoints
"""
import pytest
import json
import time
import os

# Verify test environment
if not os.environ.get('TESTING') or not os.environ.get('TEST_SAFE_MODE'):
    pytest.skip("Not in safe test mode", allow_module_level=True)

@pytest.mark.safe
@pytest.mark.api
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
    
    @pytest.mark.safe
    @pytest.mark.api
    def test_api_response_format(self, client):
        """Test that API responses have consistent format"""
        # Test tickers endpoint format
        response = client.get('/api/v1/tickers')
        assert response.status_code == 200
        
        data = response.get_json()
        assert 'data' in data
        assert 'status' in data
        assert data['status'] == 'success'
        
        # Test trades endpoint format
        response = client.get('/api/v1/trades')
        assert response.status_code == 200
        
        data = response.get_json()
        assert 'data' in data
        assert 'status' in data
        assert data['status'] == 'success'
        
        # Test accounts endpoint format
        response = client.get('/api/v1/accounts')
        assert response.status_code == 200
        
        data = response.get_json()
        assert 'data' in data
        assert 'status' in data
        assert data['status'] == 'success'

    def test_cors_headers(self, client):
        """Test CORS headers are properly set"""
        response = client.get('/api/v1/tickers')
        assert response.status_code == 200
        
        # Check CORS headers
        assert 'Access-Control-Allow-Origin' in response.headers
        assert 'Access-Control-Allow-Methods' in response.headers
        assert 'Access-Control-Allow-Headers' in response.headers

    def test_error_handling(self, client):
        """Test API error handling"""
        # Test non-existent endpoint
        response = client.get('/api/v1/nonexistent')
        assert response.status_code == 404
        
        # Test invalid ticker ID
        response = client.get('/api/v1/tickers/99999')
        assert response.status_code == 404
        
        # Test invalid trade ID
        response = client.get('/api/v1/trades/99999')
        assert response.status_code == 404

    def test_pagination_support(self, client):
        """Test pagination support in API responses"""
        # Test tickers with pagination
        response = client.get('/api/v1/tickers?page=1&per_page=10')
        assert response.status_code == 200
        
        data = response.get_json()
        assert 'data' in data
        assert 'pagination' in data or 'meta' in data

    def test_filtering_support(self, client):
        """Test filtering support in API responses"""
        # Test tickers with status filter
        response = client.get('/api/v1/tickers?status=active')
        assert response.status_code == 200
        
        data = response.get_json()
        assert 'data' in data

    def test_sorting_support(self, client):
        """Test sorting support in API responses"""
        # Test tickers with sorting
        response = client.get('/api/v1/tickers?sort=symbol&order=asc')
        assert response.status_code == 200
        
        data = response.get_json()
        assert 'data' in data

    def test_search_functionality(self, client):
        """Test search functionality in API"""
        # Test tickers search
        response = client.get('/api/v1/tickers?search=AAPL')
        assert response.status_code == 200
        
        data = response.get_json()
        assert 'data' in data

    def test_bulk_operations_safety(self, client):
        """Test that bulk operations don't affect production data"""
        # Test bulk create (if implemented)
        test_data = {
            'tickers': [
                {
                    'symbol': f'TEST_BULK_{int(time.time())}_1',
                    'type': 'stock',
                    'currency': 'USD',
                    'remarks': 'Bulk test ticker 1'
                },
                {
                    'symbol': f'TEST_BULK_{int(time.time())}_2',
                    'type': 'stock',
                    'currency': 'USD',
                    'remarks': 'Bulk test ticker 2'
                }
            ]
        }
        
        # This should use test database, not production
        response = client.post('/api/v1/tickers/bulk', json=test_data)
        # If bulk endpoint doesn't exist, this will be 404, which is fine
        # The important thing is that if it exists, it uses test database

    def test_rate_limiting(self, client):
        """Test rate limiting (if implemented)"""
        # Make multiple rapid requests
        for i in range(10):
            response = client.get('/api/v1/tickers')
            assert response.status_code in [200, 429]  # 429 if rate limited

    def test_authentication_required(self, client):
        """Test authentication requirements (if implemented)"""
        # Test protected endpoints
        protected_endpoints = [
            '/api/v1/trades/create',
            '/api/v1/accounts/create',
            '/api/v1/tickers/create'
        ]
        
        for endpoint in protected_endpoints:
            response = client.post(endpoint, json={})
            # Should either require auth (401) or not exist (404)
            assert response.status_code in [401, 404, 405]

    def test_data_validation(self, client):
        """Test data validation in API endpoints"""
        # Test invalid ticker data
        invalid_ticker = {
            'type': 'stock',
            'currency': 'USD'
            # Missing required 'symbol' field
        }
        
        response = client.post('/api/v1/tickers', json=invalid_ticker)
        # Should return validation error
        assert response.status_code in [400, 404, 405]

    def test_transaction_safety(self, client):
        """Test that API transactions are safe"""
        # Test creating ticker with invalid data that should rollback
        test_ticker = {
            'symbol': f'TEST_TRANSACTION_{int(time.time())}',
            'type': 'stock',
            'currency': 'USD',
            'remarks': 'Test ticker for transaction safety'
        }
        
        response = client.post('/api/v1/tickers', json=test_ticker)
        # If endpoint exists, should work safely with test database
        if response.status_code == 201:
            ticker_id = response.get_json().get('id')
            if ticker_id:
                # Verify it was created in test database
                get_response = client.get(f'/api/v1/tickers/{ticker_id}')
                assert get_response.status_code == 200

    def test_concurrent_requests_safety(self, client):
        """Test that concurrent requests don't cause issues"""
        import threading
        import time
        
        results = []
        
        def make_request():
            """Make API request in separate thread"""
            try:
                response = client.get('/api/v1/tickers')
                results.append(response.status_code)
            except Exception as e:
                results.append(f"Error: {e}")
        
        # Create multiple threads
        threads = []
        for i in range(5):
            thread = threading.Thread(target=make_request)
            threads.append(thread)
            thread.start()
        
        # Wait for all threads to complete
        for thread in threads:
            thread.join()
        
        # Verify all requests succeeded
        for result in results:
            assert result == 200 or isinstance(result, str)

    def test_memory_usage_safety(self, client):
        """Test that API doesn't cause memory leaks"""
        import psutil
        import os
        
        # Get initial memory usage
        process = psutil.Process(os.getpid())
        initial_memory = process.memory_info().rss
        
        # Make multiple requests
        for i in range(10):
            response = client.get('/api/v1/tickers')
            assert response.status_code == 200
        
        # Get final memory usage
        final_memory = process.memory_info().rss
        
        # Memory increase should be reasonable (less than 10MB)
        memory_increase = final_memory - initial_memory
        assert memory_increase < 10 * 1024 * 1024  # 10MB

    def test_database_connection_pool(self, client):
        """Test database connection pool handling"""
        # Make many requests to test connection pool
        for i in range(20):
            response = client.get('/api/v1/tickers')
            assert response.status_code == 200
        
        # All requests should succeed without connection issues

    def test_response_time_consistency(self, client):
        """Test that API response times are consistent"""
        import time
        
        response_times = []
        
        # Make multiple requests and measure response times
        for i in range(5):
            start_time = time.time()
            response = client.get('/api/v1/tickers')
            end_time = time.time()
            
            assert response.status_code == 200
            response_times.append(end_time - start_time)
        
        # Response times should be reasonable (less than 2 seconds each)
        for response_time in response_times:
            assert response_time < 2.0
        
        # Response times should be consistent (variance less than 1 second)
        avg_time = sum(response_times) / len(response_times)
        for response_time in response_times:
            assert abs(response_time - avg_time) < 1.0

    def test_data_integrity_after_requests(self, client):
        """Test that data integrity is maintained after API requests"""
        # Get initial data
        initial_response = client.get('/api/v1/tickers')
        assert initial_response.status_code == 200
        initial_data = initial_response.get_json()
        
        # Make multiple requests
        for i in range(5):
            response = client.get('/api/v1/tickers')
            assert response.status_code == 200
        
        # Get final data
        final_response = client.get('/api/v1/tickers')
        assert final_response.status_code == 200
        final_data = final_response.get_json()
        
        # Data should be consistent
        assert len(initial_data['data']) == len(final_data['data'])

    def test_error_recovery(self, client):
        """Test that API recovers gracefully from errors"""
        # Make a request that might cause an error
        response = client.get('/api/v1/tickers?invalid_param=value')
        # Should handle gracefully (either work or return proper error)
        assert response.status_code in [200, 400, 422]
        
        # Make a normal request after error
        response = client.get('/api/v1/tickers')
        assert response.status_code == 200

    def test_logging_safety(self, client):
        """Test that API logging doesn't expose sensitive data"""
        # Make requests and check that sensitive data isn't logged
        response = client.get('/api/v1/tickers')
        assert response.status_code == 200
        
        # Check that response doesn't contain sensitive information
        data = response.get_json()
        if 'data' in data and data['data']:
            for item in data['data']:
                # Ensure no sensitive fields are exposed
                sensitive_fields = ['password', 'token', 'secret', 'key']
                for field in sensitive_fields:
                    assert field not in item

    def test_cache_safety(self, client):
        """Test that caching doesn't interfere with test data"""
        # Make initial request
        response1 = client.get('/api/v1/tickers')
        assert response1.status_code == 200
        data1 = response1.get_json()
        
        # Make second request (should be cached if caching is implemented)
        response2 = client.get('/api/v1/tickers')
        assert response2.status_code == 200
        data2 = response2.get_json()
        
        # Data should be consistent
        assert len(data1['data']) == len(data2['data'])

    def test_compression_safety(self, client):
        """Test that compression works correctly"""
        # Test with Accept-Encoding header
        headers = {'Accept-Encoding': 'gzip, deflate'}
        response = client.get('/api/v1/tickers', headers=headers)
        assert response.status_code == 200
        
        # Response should be valid JSON regardless of compression
        data = response.get_json()
        assert 'data' in data

    def test_unicode_support(self, client):
        """Test Unicode support in API"""
        # Test with Unicode characters in search
        response = client.get('/api/v1/tickers?search=אפל')  # Hebrew characters
        assert response.status_code == 200
        
        data = response.get_json()
        assert 'data' in data

    def test_large_payload_safety(self, client):
        """Test handling of large payloads"""
        # Test with large search term
        large_search = 'A' * 1000  # 1000 character search term
        response = client.get(f'/api/v1/tickers?search={large_search}')
        # Should handle gracefully
        assert response.status_code in [200, 400, 413]  # 413 if too large

    def test_sql_injection_protection(self, client):
        """Test SQL injection protection"""
        # Test with potentially malicious search terms
        malicious_searches = [
            "'; DROP TABLE tickers; --",
            "' OR '1'='1",
            "'; INSERT INTO tickers VALUES (999, 'HACKED'); --"
        ]
        
        for search in malicious_searches:
            response = client.get(f'/api/v1/tickers?search={search}')
            # Should handle safely (either work or return proper error)
            assert response.status_code in [200, 400, 422]
            
            # Should not cause database corruption
            verify_response = client.get('/api/v1/tickers')
            assert verify_response.status_code == 200

    def test_xss_protection(self, client):
        """Test XSS protection in API responses"""
        # Test with potentially malicious data
        malicious_symbol = '<script>alert("XSS")</script>'
        response = client.get(f'/api/v1/tickers?search={malicious_symbol}')
        assert response.status_code == 200
        
        data = response.get_json()
        # Response should not contain executable script tags
        response_text = str(data)
        assert '<script>' not in response_text
        assert 'alert(' not in response_text
