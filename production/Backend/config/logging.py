import logging
import logging.handlers
import os
from pathlib import Path
from datetime import datetime
from typing import Optional

def setup_logging() -> logging.Logger:
    """Setup logging system"""
    
    # Determine log directory based on environment
    import os
    ENVIRONMENT = os.getenv('TIKTRACK_ENV', 'development').lower()
    IS_PRODUCTION = ENVIRONMENT == 'production'
    IS_TESTING = ENVIRONMENT == 'testing'
    
    # Create logs directory - different for production/testing vs development
    if IS_PRODUCTION or IS_TESTING:
        log_dir = Path("logs-production")
    else:
        log_dir = Path("logs")
    
    log_dir.mkdir(exist_ok=True)
    
    # Set log format without correlation ID
    log_format = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Set main logger
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    
    # Console log
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(log_format)
    logger.addHandler(console_handler)
    
    # File log
    file_handler = logging.handlers.RotatingFileHandler(
        log_dir / "app.log",
        maxBytes=10*1024*1024,  # 10MB
        backupCount=5
    )
    file_handler.setLevel(logging.INFO)
    file_handler.setFormatter(log_format)
    logger.addHandler(file_handler)
    
    # Error log to separate file
    error_handler = logging.handlers.RotatingFileHandler(
        log_dir / "errors.log",
        maxBytes=10*1024*1024,  # 10MB
        backupCount=5
    )
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(log_format)
    logger.addHandler(error_handler)
    
    # SQL queries log (only in development)
    if os.getenv('FLASK_ENV') == 'development':
        sql_logger = logging.getLogger('sqlalchemy.engine')
        sql_logger.setLevel(logging.INFO)
    
    # Performance monitoring log
    perf_handler = logging.handlers.RotatingFileHandler(
        log_dir / "performance.log",
        maxBytes=10*1024*1024,  # 10MB
        backupCount=3
    )
    perf_handler.setLevel(logging.INFO)
    perf_handler.setFormatter(log_format)
    logger.addHandler(perf_handler)
    
    # Database operations log
    db_handler = logging.handlers.RotatingFileHandler(
        log_dir / "database.log",
        maxBytes=10*1024*1024,  # 10MB
        backupCount=3
    )
    db_handler.setLevel(logging.INFO)
    db_handler.setFormatter(log_format)
    logger.addHandler(db_handler)
    
    # Cache operations log
    cache_handler = logging.handlers.RotatingFileHandler(
        log_dir / "cache.log",
        maxBytes=10*1024*1024,  # 10MB
        backupCount=3
    )
    cache_handler.setLevel(logging.INFO)
    cache_handler.setFormatter(log_format)
    logger.addHandler(cache_handler)
    
    return logger

def get_logger(name: str) -> logging.Logger:
    """Get logger with specific name"""
    return logging.getLogger(name)

def get_cache_logger() -> logging.Logger:
    """Get dedicated cache logger that writes to cache.log"""
    cache_logger = logging.getLogger('cache')
    cache_logger.setLevel(logging.INFO)
    
    # Only add handler if it doesn't exist
    if not cache_logger.handlers:
        # Determine log directory based on environment
        import os
        ENVIRONMENT = os.getenv('TIKTRACK_ENV', 'development').lower()
        IS_PRODUCTION = ENVIRONMENT == 'production'
        IS_TESTING = ENVIRONMENT == 'testing'
        
        if IS_PRODUCTION or IS_TESTING:
            log_dir = Path("logs-production")
        else:
            log_dir = Path("logs")
        
        log_dir.mkdir(exist_ok=True)
        
        log_format = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        
        cache_handler = logging.handlers.RotatingFileHandler(
            log_dir / "cache.log",
            maxBytes=10*1024*1024,  # 10MB
            backupCount=3
        )
        cache_handler.setLevel(logging.INFO)
        cache_handler.setFormatter(log_format)
        cache_logger.addHandler(cache_handler)
    
    return cache_logger

# Create correlation ID for each request
def generate_correlation_id() -> str:
    """Generate unique correlation identifier"""
    return f"req_{datetime.now().strftime('%Y%m%d_%H%M%S_%f')}"

class CorrelationFilter(logging.Filter):
    """Filter to add correlation ID to each log"""
    
    def __init__(self) -> None:
        super().__init__()
        self.correlation_id: Optional[str] = None
    
    def filter(self, record: logging.LogRecord) -> bool:
        if self.correlation_id:
            record.correlation_id = self.correlation_id
        return True
