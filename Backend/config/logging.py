import logging
import logging.handlers
import os
from pathlib import Path
from datetime import datetime

def setup_logging():
    """הגדרת מערכת הלוגים"""
    
    # יצירת תיקיית לוגים
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)
    
    # הגדרת פורמט הלוגים
    log_format = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # הגדרת הלוגר הראשי
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    
    # לוג לקונסול
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(log_format)
    logger.addHandler(console_handler)
    
    # לוג לקובץ
    file_handler = logging.handlers.RotatingFileHandler(
        log_dir / "app.log",
        maxBytes=10*1024*1024,  # 10MB
        backupCount=5
    )
    file_handler.setLevel(logging.INFO)
    file_handler.setFormatter(log_format)
    logger.addHandler(file_handler)
    
    # לוג שגיאות לקובץ נפרד
    error_handler = logging.handlers.RotatingFileHandler(
        log_dir / "errors.log",
        maxBytes=10*1024*1024,  # 10MB
        backupCount=5
    )
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(log_format)
    logger.addHandler(error_handler)
    
    # לוג SQL queries (רק ב-development)
    if os.getenv('FLASK_ENV') == 'development':
        sql_logger = logging.getLogger('sqlalchemy.engine')
        sql_logger.setLevel(logging.INFO)
    
    return logger

def get_logger(name: str) -> logging.Logger:
    """קבלת לוגר עם שם ספציפי"""
    return logging.getLogger(name)

# יצירת correlation ID לכל request
def generate_correlation_id() -> str:
    """יצירת מזהה קורלציה ייחודי"""
    return f"req_{datetime.now().strftime('%Y%m%d_%H%M%S_%f')}"

class CorrelationFilter(logging.Filter):
    """פילטר להוספת correlation ID לכל לוג"""
    
    def __init__(self):
        super().__init__()
        self.correlation_id = None
    
    def filter(self, record):
        if self.correlation_id:
            record.correlation_id = self.correlation_id
        return True
