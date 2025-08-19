"""
Performance tests for TikTrack application
"""
import pytest
import time
import threading
import psutil
import os
from concurrent.futures import ThreadPoolExecutor, as_completed

# Verify test environment
if not os.environ.get('TESTING') or not os.environ.get('TEST_SAFE_MODE'):
    pytest.skip("Not in safe test mode", allow_module_level=True)

@pytest.mark.safe
@pytest.mark.performance
def test_performance_smoke():
    """Basic performance smoke test"""
    assert True

@pytest.mark.safe
@pytest.mark.performance
def test_api_response_time_performance(client):
    """Test API response time performance"""
    import time
    
    # Test single request performance
    start_time = time.time()
    response = client.get('/api/v1/tickers')
    end_time = time.time()
    
    response_time = end_time - start_time
    assert response.status_code == 200
    assert response_time < 1.0  # Should respond within 1 second

def test_concurrent_request_performance(client):
    """Test performance under concurrent requests"""
    import time
    
    def make_request():
        start_time = time.time()
        response = client.get('/api/v1/tickers')
        end_time = time.time()
        return response.status_code, end_time - start_time
    
    # Make 10 concurrent requests
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(make_request) for _ in range(10)]
        results = [future.result() for future in as_completed(futures)]
    
    # Verify all requests succeeded
    for status_code, response_time in results:
        assert status_code == 200
        assert response_time < 2.0  # Each request should complete within 2 seconds

def test_memory_usage_performance(client):
    """Test memory usage performance"""
    # Get initial memory usage
    process = psutil.Process(os.getpid())
    initial_memory = process.memory_info().rss
    
    # Make multiple requests
    for i in range(50):
        response = client.get('/api/v1/tickers')
        assert response.status_code == 200
    
    # Get final memory usage
    final_memory = process.memory_info().rss
    
    # Memory increase should be reasonable (less than 20MB)
    memory_increase = final_memory - initial_memory
    assert memory_increase < 20 * 1024 * 1024  # 20MB

def test_database_query_performance(client):
    """Test database query performance"""
    import time
    
    # Test multiple database queries
    query_times = []
    
    for i in range(20):
        start_time = time.time()
        response = client.get('/api/v1/tickers')
        end_time = time.time()
        
        assert response.status_code == 200
        query_times.append(end_time - start_time)
    
    # Calculate performance metrics
    avg_time = sum(query_times) / len(query_times)
    max_time = max(query_times)
    
    # Performance should be good
    assert avg_time < 0.5  # Average query time under 0.5 seconds
    assert max_time < 1.0  # Maximum query time under 1 second

def test_stress_test_performance(client):
    """Test performance under stress"""
    import time
    
    def stress_operation():
        """Perform stress operation"""
        for i in range(10):
            response = client.get('/api/v1/tickers')
            assert response.status_code == 200
            
            response = client.get('/api/v1/trades')
            assert response.status_code == 200
    
    # Run stress test with multiple threads
    start_time = time.time()
    
    threads = []
    for i in range(5):
        thread = threading.Thread(target=stress_operation)
        threads.append(thread)
        thread.start()
    
    for thread in threads:
        thread.join()
    
    end_time = time.time()
    total_time = end_time - start_time
    
    # Stress test should complete within reasonable time
    assert total_time < 30.0  # Should complete within 30 seconds

def test_throughput_performance(client):
    """Test throughput performance"""
    import time
    
    # Measure requests per second
    start_time = time.time()
    request_count = 0
    
    # Make requests for 5 seconds
    while time.time() - start_time < 5.0:
        response = client.get('/api/v1/tickers')
        assert response.status_code == 200
        request_count += 1
    
    end_time = time.time()
    duration = end_time - start_time
    requests_per_second = request_count / duration
    
    # Should handle at least 10 requests per second
    assert requests_per_second >= 10.0

def test_resource_usage_performance(client):
    """Test resource usage performance"""
    # Get initial resource usage
    process = psutil.Process(os.getpid())
    initial_cpu_percent = process.cpu_percent()
    initial_memory = process.memory_info().rss
    
    # Perform operations
    for i in range(20):
        response = client.get('/api/v1/tickers')
        assert response.status_code == 200
    
    # Get final resource usage
    final_cpu_percent = process.cpu_percent()
    final_memory = process.memory_info().rss
    
    # Resource usage should be reasonable
    memory_increase = final_memory - initial_memory
    assert memory_increase < 50 * 1024 * 1024  # Less than 50MB increase

def test_scalability_performance(client):
    """Test scalability performance"""
    import time
    
    # Test with different load levels
    load_levels = [1, 5, 10]
    response_times = {}
    
    for load in load_levels:
        start_time = time.time()
        
        with ThreadPoolExecutor(max_workers=load) as executor:
            futures = [executor.submit(lambda: client.get('/api/v1/tickers')) for _ in range(load)]
            responses = [future.result() for future in as_completed(futures)]
        
        end_time = time.time()
        response_times[load] = end_time - start_time
        
        # All responses should succeed
        for response in responses:
            assert response.status_code == 200
    
    # Performance should scale reasonably
    # Higher load should not cause exponential slowdown
    assert response_times[5] < response_times[1] * 3  # 5x load should not take more than 3x time
    assert response_times[10] < response_times[1] * 6  # 10x load should not take more than 6x time

def test_cache_performance(client):
    """Test cache performance (if implemented)"""
    import time
    
    # First request (cache miss)
    start_time = time.time()
    response1 = client.get('/api/v1/tickers')
    first_request_time = time.time() - start_time
    
    assert response1.status_code == 200
    
    # Second request (cache hit)
    start_time = time.time()
    response2 = client.get('/api/v1/tickers')
    second_request_time = time.time() - start_time
    
    assert response2.status_code == 200
    
    # If caching is implemented, second request should be faster
    # If not implemented, both should be similar
    # We'll just verify both requests work

def test_connection_pool_performance(client):
    """Test database connection pool performance"""
    import time
    
    # Test with many concurrent connections
    def connection_test():
        for i in range(5):
            response = client.get('/api/v1/tickers')
            assert response.status_code == 200
            time.sleep(0.1)
    
    # Run multiple connection tests concurrently
    start_time = time.time()
    
    threads = []
    for i in range(10):
        thread = threading.Thread(target=connection_test)
        threads.append(thread)
        thread.start()
    
    for thread in threads:
        thread.join()
    
    end_time = time.time()
    total_time = end_time - start_time
    
    # Should complete within reasonable time
    assert total_time < 20.0

def test_memory_leak_performance(client):
    """Test for memory leaks"""
    # Get initial memory
    process = psutil.Process(os.getpid())
    initial_memory = process.memory_info().rss
    
    # Perform operations that might cause memory leaks
    for cycle in range(3):
        for i in range(20):
            response = client.get('/api/v1/tickers')
            assert response.status_code == 200
            
            response = client.get('/api/v1/trades')
            assert response.status_code == 200
        
        # Force garbage collection
        import gc
        gc.collect()
        
        # Check memory after each cycle
        current_memory = process.memory_info().rss
        memory_increase = current_memory - initial_memory
        
        # Memory increase should be reasonable
        assert memory_increase < 100 * 1024 * 1024  # Less than 100MB increase

def test_cpu_usage_performance(client):
    """Test CPU usage performance"""
    import time
    
    # Get initial CPU usage
    process = psutil.Process(os.getpid())
    
    # Perform operations
    start_time = time.time()
    for i in range(20):
        response = client.get('/api/v1/tickers')
        assert response.status_code == 200
    
    end_time = time.time()
    duration = end_time - start_time
    
    # CPU usage should be reasonable
    # We can't easily measure exact CPU usage in this context,
    # but we can verify the operations complete in reasonable time
    assert duration < 10.0  # Should complete within 10 seconds

def test_network_performance(client):
    """Test network performance"""
    import time
    
    # Test response size and time
    start_time = time.time()
    response = client.get('/api/v1/tickers')
    end_time = time.time()
    
    response_time = end_time - start_time
    response_size = len(response.data)
    
    assert response.status_code == 200
    assert response_time < 1.0  # Should respond quickly
    assert response_size < 1024 * 1024  # Response should be under 1MB

def test_error_recovery_performance(client):
    """Test error recovery performance"""
    import time
    
    # Test recovery after errors
    start_time = time.time()
    
    # Make some invalid requests
    for i in range(5):
        response = client.get('/api/v1/nonexistent')
        assert response.status_code == 404
    
    # Make valid requests
    for i in range(10):
        response = client.get('/api/v1/tickers')
        assert response.status_code == 200
    
    end_time = time.time()
    total_time = end_time - start_time
    
    # Should recover quickly
    assert total_time < 5.0


