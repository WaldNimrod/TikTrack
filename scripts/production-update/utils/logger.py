#!/usr/bin/env python3
"""
Unified Logger for Production Update
====================================

Provides consistent logging across all update steps.
"""

import logging
import sys
from datetime import datetime
from pathlib import Path
from typing import Optional


class UpdateLogger:
    """Unified logger for production update process"""
    
    def __init__(self, log_dir: Optional[Path] = None):
        self.log_dir = log_dir or Path("_Tmp/production-update-logs")
        self.log_dir.mkdir(parents=True, exist_ok=True)
        
        # Create logger
        self.logger = logging.getLogger("production-update")
        self.logger.setLevel(logging.INFO)
        
        # Clear existing handlers
        self.logger.handlers.clear()
        
        # Console handler
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(logging.INFO)
        console_format = logging.Formatter(
            '%(asctime)s - %(levelname)s - %(message)s',
            datefmt='%H:%M:%S'
        )
        console_handler.setFormatter(console_format)
        self.logger.addHandler(console_handler)
        
        # File handler
        log_file = self.log_dir / f"update_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
        file_handler = logging.FileHandler(log_file)
        file_handler.setLevel(logging.DEBUG)
        file_format = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        file_handler.setFormatter(file_format)
        self.logger.addHandler(file_handler)
        
        self.log_file = log_file
    
    def info(self, message: str):
        """Log info message"""
        self.logger.info(message)
    
    def error(self, message: str):
        """Log error message"""
        self.logger.error(message)
    
    def warning(self, message: str):
        """Log warning message"""
        self.logger.warning(message)
    
    def debug(self, message: str):
        """Log debug message"""
        self.logger.debug(message)
    
    def step_start(self, step_name: str, step_number: int):
        """Log start of a step"""
        self.info(f"\n{'='*70}")
        self.info(f"Step {step_number}: {step_name}")
        self.info(f"{'='*70}")
    
    def step_end(self, step_name: str, success: bool):
        """Log end of a step"""
        status = "✅ SUCCESS" if success else "❌ FAILED"
        self.info(f"{status}: {step_name}")
    
    def get_log_file(self) -> Path:
        """Get path to log file"""
        return self.log_file


# Global logger instance
_logger_instance: Optional[UpdateLogger] = None


def get_logger() -> UpdateLogger:
    """Get global logger instance"""
    global _logger_instance
    if _logger_instance is None:
        _logger_instance = UpdateLogger()
    return _logger_instance


def set_logger(logger: UpdateLogger):
    """Set global logger instance"""
    global _logger_instance
    _logger_instance = logger

