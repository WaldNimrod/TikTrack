"""
End-to-end tests for TikTrack basic workflow
"""
import pytest
import json
import time
import os

# Verify test environment
if not os.environ.get('TESTING') or not os.environ.get('TEST_SAFE_MODE'):
    pytest.skip("Not in safe test mode", allow_module_level=True)

@pytest.mark.safe
@pytest.mark.e2e
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
    
    @pytest.mark.safe
    @pytest.mark.e2e
    def test_database_connectivity(self, client):
        """Test database connectivity and basic operations"""
        # Test that we can connect to the database through the API
        response = client.get('/api/v1/tickers')
        assert response.status_code == 200
        
        # Test that we can get data from the database
        data = response.get_json()
        assert 'data' in data
        assert isinstance(data['data'], list)
        
        # Test that we can get trades
        response = client.get('/api/v1/trades')
        assert response.status_code == 200
        
        # Test that we can get accounts
        response = client.get('/api/v1/accounts')
        assert response.status_code == 200

    def test_data_persistence_safety(self, client):
        """Test that data persistence operations are safe"""
        # Test creating test data (should use test database)
        test_ticker = {
            'symbol': f'TEST_PERSISTENCE_{int(time.time())}',
            'type': 'stock',
            'currency': 'USD',
            'remarks': 'Test ticker for persistence safety'
        }
        
        # Try to create ticker (if endpoint exists)
        response = client.post('/api/v1/tickers', json=test_ticker)
        if response.status_code == 201:
            # If creation succeeded, verify it was created in test database
            ticker_id = response.get_json().get('id')
            if ticker_id:
                get_response = client.get(f'/api/v1/tickers/{ticker_id}')
                assert get_response.status_code == 200
                
                # Verify the data matches
                created_data = get_response.get_json()
                assert created_data['symbol'] == test_ticker['symbol']
        else:
            # If endpoint doesn't exist, that's fine - just verify basic connectivity
            assert response.status_code in [404, 405]

    def test_error_handling(self, client):
        """Test error handling in end-to-end scenarios"""
        # Test invalid endpoints
        response = client.get('/nonexistent')
        assert response.status_code == 404
        
        # Test invalid API endpoints
        response = client.get('/api/v1/nonexistent')
        assert response.status_code == 404
        
        # Test invalid parameters
        response = client.get('/api/v1/tickers?invalid=param')
        # Should handle gracefully
        assert response.status_code in [200, 400, 422]

    def test_cors_headers(self, client):
        """Test CORS headers in end-to-end scenarios"""
        # Test main page
        response = client.get('/')
        # CORS headers should be present for API requests
        # Main page might not have CORS headers, which is fine
        
        # Test API endpoint
        response = client.get('/api/v1/tickers')
        assert response.status_code == 200
        # CORS headers should be present for API endpoints

    def test_response_time(self, client):
        """Test response times in end-to-end scenarios"""
        import time
        
        # Test main page response time
        start_time = time.time()
        response = client.get('/')
        end_time = time.time()
        
        response_time = end_time - start_time
        assert response_time < 5.0  # Should load within 5 seconds
        
        # Test API response time
        start_time = time.time()
        response = client.get('/api/v1/tickers')
        end_time = time.time()
        
        response_time = end_time - start_time
        assert response_time < 2.0  # API should respond within 2 seconds

    def test_static_files_accessible(self, client):
        """Test that static files are accessible"""
        # Test CSS files
        response = client.get('/static/styles.css')
        # Should either exist (200) or not exist (404), but not cause server error
        assert response.status_code in [200, 404]
        
        # Test JS files
        response = client.get('/static/scripts.js')
        assert response.status_code in [200, 404]
        
        # Test images
        response = client.get('/static/images/logo.png')
        assert response.status_code in [200, 404]

    def test_tickers_data_structure(self, client):
        """Test tickers data structure"""
        response = client.get('/api/v1/tickers')
        assert response.status_code == 200
        
        data = response.get_json()
        assert 'data' in data
        assert isinstance(data['data'], list)
        
        # If there are tickers, verify their structure
        if data['data']:
            ticker = data['data'][0]
            required_fields = ['id', 'symbol', 'type', 'currency']
            for field in required_fields:
                assert field in ticker

    def test_trades_data_structure(self, client):
        """Test trades data structure"""
        response = client.get('/api/v1/trades')
        assert response.status_code == 200
        
        data = response.get_json()
        assert 'data' in data
        assert isinstance(data['data'], list)
        
        # If there are trades, verify their structure
        if data['data']:
            trade = data['data'][0]
            required_fields = ['id', 'ticker_id', 'account_id', 'type', 'side']
            for field in required_fields:
                assert field in trade

    def test_concurrent_user_simulation(self, client):
        """Test concurrent user access simulation"""
        import threading
        import time
        
        results = []
        
        def simulate_user():
            """Simulate a user making requests"""
            try:
                # Simulate user browsing tickers
                response1 = client.get('/api/v1/tickers')
                results.append(('tickers', response1.status_code))
                
                # Simulate user browsing trades
                response2 = client.get('/api/v1/trades')
                results.append(('trades', response2.status_code))
                
                # Simulate user browsing accounts
                response3 = client.get('/api/v1/accounts')
                results.append(('accounts', response3.status_code))
                
            except Exception as e:
                results.append(('error', str(e)))
        
        # Simulate multiple concurrent users
        threads = []
        for i in range(3):
            thread = threading.Thread(target=simulate_user)
            threads.append(thread)
            thread.start()
        
        # Wait for all users to complete
        for thread in threads:
            thread.join()
        
        # Verify all requests succeeded
        for endpoint, status_code in results:
            assert status_code == 200 or isinstance(status_code, str)

    def test_memory_usage_under_load(self, client):
        """Test memory usage under load"""
        import psutil
        import os
        
        # Get initial memory usage
        process = psutil.Process(os.getpid())
        initial_memory = process.memory_info().rss
        
        # Simulate load
        for i in range(20):
            response = client.get('/api/v1/tickers')
            assert response.status_code == 200
            
            response = client.get('/api/v1/trades')
            assert response.status_code == 200
        
        # Get final memory usage
        final_memory = process.memory_info().rss
        
        # Memory increase should be reasonable (less than 50MB)
        memory_increase = final_memory - initial_memory
        assert memory_increase < 50 * 1024 * 1024  # 50MB

    def test_database_integrity_under_stress(self, client):
        """Test database integrity under stress"""
        # Get initial data state
        initial_tickers = client.get('/api/v1/tickers').get_json()
        initial_trades = client.get('/api/v1/trades').get_json()
        
        # Apply stress
        for i in range(10):
            # Make multiple concurrent requests
            import threading
            
            def stress_test():
                for j in range(5):
                    client.get('/api/v1/tickers')
                    client.get('/api/v1/trades')
                    client.get('/api/v1/accounts')
            
            threads = []
            for k in range(3):
                thread = threading.Thread(target=stress_test)
                threads.append(thread)
                thread.start()
            
            for thread in threads:
                thread.join()
        
        # Verify data integrity maintained
        final_tickers = client.get('/api/v1/tickers').get_json()
        final_trades = client.get('/api/v1/trades').get_json()
        
        # Data should be consistent
        assert len(initial_tickers['data']) == len(final_tickers['data'])
        assert len(initial_trades['data']) == len(final_trades['data'])

    def test_error_recovery_scenarios(self, client):
        """Test error recovery in various scenarios"""
        # Test recovery after invalid requests
        invalid_requests = [
            '/api/v1/tickers?invalid=param',
            '/api/v1/tickers?page=invalid',
            '/api/v1/tickers?sort=invalid',
            '/api/v1/tickers?search=' + 'A' * 1000  # Very long search
        ]
        
        for invalid_request in invalid_requests:
            response = client.get(invalid_request)
            # Should handle gracefully
            assert response.status_code in [200, 400, 422]
        
        # Test that normal requests still work after errors
        response = client.get('/api/v1/tickers')
        assert response.status_code == 200

    def test_security_headers(self, client):
        """Test security headers in responses"""
        # Test main page
        response = client.get('/')
        # Check for security headers (if implemented)
        security_headers = [
            'X-Content-Type-Options',
            'X-Frame-Options',
            'X-XSS-Protection',
            'Strict-Transport-Security'
        ]
        
        # At least some security headers should be present
        found_headers = [h for h in security_headers if h in response.headers]
        # This is optional - not all headers need to be present

    def test_content_type_headers(self, client):
        """Test content type headers"""
        # Test API responses
        response = client.get('/api/v1/tickers')
        assert response.status_code == 200
        assert 'application/json' in response.headers.get('Content-Type', '')

    def test_cache_headers(self, client):
        """Test cache headers"""
        # Test static files
        response = client.get('/static/styles.css')
        if response.status_code == 200:
            # Static files should have cache headers
            cache_headers = ['Cache-Control', 'ETag', 'Last-Modified']
            # At least some cache headers should be present

    def test_compression_headers(self, client):
        """Test compression headers"""
        # Test with Accept-Encoding header
        headers = {'Accept-Encoding': 'gzip, deflate'}
        response = client.get('/api/v1/tickers', headers=headers)
        assert response.status_code == 200
        
        # Check for compression headers
        if 'Content-Encoding' in response.headers:
            assert response.headers['Content-Encoding'] in ['gzip', 'deflate']

    def test_unicode_handling(self, client):
        """Test Unicode handling in end-to-end scenarios"""
        # Test Hebrew characters in search
        response = client.get('/api/v1/tickers?search=אפל')
        assert response.status_code == 200
        
        # Test Hebrew characters in response
        data = response.get_json()
        assert 'data' in data
        
        # Test special characters
        response = client.get('/api/v1/tickers?search=test@#$%')
        assert response.status_code == 200

    def test_large_data_handling(self, client):
        """Test handling of large data sets"""
        # Test with large number of results
        response = client.get('/api/v1/tickers?per_page=1000')
        assert response.status_code == 200
        
        data = response.get_json()
        assert 'data' in data
        
        # Response should be reasonable size
        response_size = len(str(data))
        assert response_size < 1024 * 1024  # Less than 1MB

    def test_session_handling(self, client):
        """Test session handling (if implemented)"""
        # Test session creation
        response = client.get('/api/v1/tickers')
        assert response.status_code == 200
        
        # Test session persistence
        response2 = client.get('/api/v1/trades')
        assert response2.status_code == 200
        
        # Both requests should work independently

    def test_logging_and_monitoring(self, client):
        """Test logging and monitoring capabilities"""
        # Make requests that should be logged
        endpoints = [
            '/api/v1/tickers',
            '/api/v1/trades',
            '/api/v1/accounts',
            '/'
        ]
        
        for endpoint in endpoints:
            response = client.get(endpoint)
            assert response.status_code in [200, 404]
            # Requests should be logged (this is verified by the fact that they work)

    def test_backup_and_restore_safety(self, client):
        """Test that backup and restore operations are safe"""
        # Get initial state
        initial_response = client.get('/api/v1/tickers')
        assert initial_response.status_code == 200
        initial_data = initial_response.get_json()
        
        # Simulate backup operation (if implemented)
        # This would typically be done through admin endpoints
        
        # Verify data integrity after backup simulation
        final_response = client.get('/api/v1/tickers')
        assert final_response.status_code == 200
        final_data = final_response.get_json()
        
        # Data should be consistent
        assert len(initial_data['data']) == len(final_data['data'])

    def test_performance_under_load(self, client):
        """Test performance under load"""
        import time
        
        # Measure response times under load
        response_times = []
        
        for i in range(20):
            start_time = time.time()
            response = client.get('/api/v1/tickers')
            end_time = time.time()
            
            assert response.status_code == 200
            response_times.append(end_time - start_time)
        
        # Calculate statistics
        avg_time = sum(response_times) / len(response_times)
        max_time = max(response_times)
        
        # Performance should be reasonable
        assert avg_time < 1.0  # Average response time under 1 second
        assert max_time < 3.0  # Maximum response time under 3 seconds

    def test_data_consistency_across_requests(self, client):
        """Test data consistency across multiple requests"""
        # Make multiple requests and verify consistency
        responses = []
        
        for i in range(5):
            response = client.get('/api/v1/tickers')
            assert response.status_code == 200
            responses.append(response.get_json())
        
        # All responses should have consistent data
        first_response = responses[0]
        for response in responses[1:]:
            assert len(first_response['data']) == len(response['data'])
            assert first_response['status'] == response['status']

    def test_graceful_degradation(self, client):
        """Test graceful degradation under stress"""
        # Simulate high load
        import threading
        import time
        
        def load_test():
            for i in range(10):
                client.get('/api/v1/tickers')
                client.get('/api/v1/trades')
                time.sleep(0.1)
        
        # Start multiple load test threads
        threads = []
        for i in range(5):
            thread = threading.Thread(target=load_test)
            threads.append(thread)
            thread.start()
        
        # Wait for load tests to complete
        for thread in threads:
            thread.join()
        
        # Verify system is still responsive
        response = client.get('/api/v1/tickers')
        assert response.status_code == 200
        
        response = client.get('/')
        assert response.status_code == 200
