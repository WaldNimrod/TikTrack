"""
Performance Monitoring Utility
Monitor system performance and log metrics
"""

import time
import logging
from functools import wraps
from typing import Callable, Any
from config.logging import get_logger

logger = get_logger(__name__)

def monitor_performance(func_name: str = None):
    """
    Decorator to monitor function performance
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs) -> Any:
            start_time = time.time()
            func_name_actual = func_name or func.__name__
            
            try:
                result = func(*args, **kwargs)
                success = True
                error_msg = None
            except Exception as e:
                success = False
                error_msg = str(e)
                raise
            finally:
                duration = time.time() - start_time
                
                # Log performance metrics
                logger.info(
                    f"Performance: {func_name_actual} - "
                    f"Duration: {duration:.3f}s - "
                    f"Success: {success}"
                )
                
                # Log errors separately
                if not success and error_msg:
                    logger.error(
                        f"Error in {func_name_actual}: {error_msg} - "
                        f"Duration: {duration:.3f}s"
                    )
                
                # Log slow operations
                if duration > 1.0:  # More than 1 second
                    logger.warning(
                        f"Slow operation detected: {func_name_actual} - "
                        f"Duration: {duration:.3f}s"
                    )
            
            return result
        return wrapper
    return decorator

def monitor_database_query(query_type: str = "query"):
    """
    Decorator to monitor database query performance
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs) -> Any:
            start_time = time.time()
            
            try:
                result = func(*args, **kwargs)
                success = True
                error_msg = None
            except Exception as e:
                success = False
                error_msg = str(e)
                raise
            finally:
                duration = time.time() - start_time
                
                # Log database performance
                logger.info(
                    f"Database {query_type}: {func.__name__} - "
                    f"Duration: {duration:.3f}s - "
                    f"Success: {success}"
                )
                
                # Log slow database operations
                if duration > 0.5:  # More than 500ms
                    logger.warning(
                        f"Slow database operation: {func.__name__} - "
                        f"Duration: {duration:.3f}s"
                    )
            
            return result
        return wrapper
    return decorator

class PerformanceTracker:
    """Class for tracking performance metrics"""
    
    def __init__(self, operation_name: str):
        self.operation_name = operation_name
        self.start_time = None
        self.end_time = None
    
    def __enter__(self):
        self.start_time = time.time()
        logger.info(f"Starting operation: {self.operation_name}")
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.end_time = time.time()
        duration = self.end_time - self.start_time
        
        if exc_type is None:
            logger.info(
                f"Completed operation: {self.operation_name} - "
                f"Duration: {duration:.3f}s"
            )
        else:
            logger.error(
                f"Failed operation: {self.operation_name} - "
                f"Duration: {duration:.3f}s - "
                f"Error: {exc_val}"
            )

def log_memory_usage():
    """Log current memory usage"""
    try:
        import psutil
        process = psutil.Process()
        memory_info = process.memory_info()
        
        logger.info(
            f"Memory usage: "
            f"RSS: {memory_info.rss / 1024 / 1024:.1f}MB, "
            f"VMS: {memory_info.vms / 1024 / 1024:.1f}MB"
        )
    except ImportError:
        logger.warning("psutil not available for memory monitoring")

def log_system_metrics():
    """Log system performance metrics"""
    try:
        import psutil
        
        # CPU usage
        cpu_percent = psutil.cpu_percent(interval=1)
        
        # Memory usage
        memory = psutil.virtual_memory()
        
        # Disk usage
        disk = psutil.disk_usage('/')
        
        logger.info(
            f"System metrics: "
            f"CPU: {cpu_percent:.1f}%, "
            f"Memory: {memory.percent:.1f}%, "
            f"Disk: {disk.percent:.1f}%"
        )
        
        # Log warnings for high usage
        if cpu_percent > 80:
            logger.warning(f"High CPU usage detected: {cpu_percent:.1f}%")
        
        if memory.percent > 80:
            logger.warning(f"High memory usage detected: {memory.percent:.1f}%")
        
        if disk.percent > 90:
            logger.warning(f"High disk usage detected: {disk.percent:.1f}%")
            
    except ImportError:
        logger.warning("psutil not available for system monitoring")
