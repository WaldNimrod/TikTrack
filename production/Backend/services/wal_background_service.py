"""
WAL Background Service - Automatic WAL Management
===============================================

This service provides automatic WAL checkpoint management in the background
to ensure data consistency without manual intervention.

Features:
- Automatic WAL checkpoint scheduling
- WAL file size monitoring
- Background cleanup operations
- Health monitoring and alerts

Author: TikTrack Development Team
Version: 1.0
Date: September 2025
"""

import threading
import time
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from utils.wal_manager import get_wal_manager

logger = logging.getLogger(__name__)

class WALBackgroundService:
    """
    Background service for automatic WAL management
    
    This service runs in the background and automatically manages
    WAL files to ensure data consistency.
    """
    
    def __init__(self, db_path: str = None):
        """
        Initialize WAL Background Service
        
        Args:
            db_path (str): Database path (optional)
        """
        self.db_path = db_path
        self.wal_manager = get_wal_manager(db_path)
        self.running = False
        self.thread = None
        self.checkpoint_interval = 300  # 5 minutes
        self.max_wal_size = 10 * 1024 * 1024  # 10MB
        self.last_checkpoint = None
        self.stats = {
            'checkpoints_performed': 0,
            'last_checkpoint_time': None,
            'last_error': None,
            'total_errors': 0
        }
    
    def start(self):
        """Start the background WAL service"""
        if self.running:
            logger.warning("WAL Background Service is already running")
            return
        
        self.running = True
        self.thread = threading.Thread(target=self._run_background_loop, daemon=True)
        self.thread.start()
        logger.info("WAL Background Service started")
    
    def stop(self):
        """Stop the background WAL service"""
        if not self.running:
            logger.warning("WAL Background Service is not running")
            return
        
        self.running = False
        if self.thread:
            self.thread.join(timeout=5)
        logger.info("WAL Background Service stopped")
    
    def _run_background_loop(self):
        """Main background loop"""
        logger.info("WAL Background Service loop started")
        
        while self.running:
            try:
                self._perform_background_checkpoint()
                time.sleep(self.checkpoint_interval)
            except Exception as e:
                logger.error(f"Error in WAL background loop: {e}")
                self.stats['last_error'] = str(e)
                self.stats['total_errors'] += 1
                time.sleep(60)  # Wait 1 minute before retrying
        
        logger.info("WAL Background Service loop ended")
    
    def _perform_background_checkpoint(self):
        """Perform background checkpoint if needed"""
        try:
            # Get WAL information
            wal_info = self.wal_manager.get_wal_info()
            
            # Check if checkpoint is needed
            should_checkpoint = False
            reason = ""
            
            # Check WAL file size
            if wal_info['wal_size'] > self.max_wal_size:
                should_checkpoint = True
                reason = f"WAL file too large ({wal_info['wal_size']} bytes)"
            
            # Check time since last checkpoint
            elif self.last_checkpoint is None:
                should_checkpoint = True
                reason = "First checkpoint"
            elif datetime.now() - self.last_checkpoint > timedelta(hours=1):
                should_checkpoint = True
                reason = "Hourly checkpoint"
            
            # Perform checkpoint if needed
            if should_checkpoint:
                logger.info(f"Performing background WAL checkpoint: {reason}")
                success, message = self.wal_manager.force_checkpoint('PASSIVE')
                
                if success:
                    self.last_checkpoint = datetime.now()
                    self.stats['checkpoints_performed'] += 1
                    self.stats['last_checkpoint_time'] = self.last_checkpoint.isoformat()
                    logger.info(f"Background WAL checkpoint successful: {message}")
                else:
                    logger.warning(f"Background WAL checkpoint failed: {message}")
                    self.stats['last_error'] = message
                    self.stats['total_errors'] += 1
            
        except Exception as e:
            logger.error(f"Error in background checkpoint: {e}")
            self.stats['last_error'] = str(e)
            self.stats['total_errors'] += 1
    
    def force_checkpoint_now(self) -> Dict[str, Any]:
        """
        Force an immediate checkpoint
        
        Returns:
            Dict[str, Any]: Checkpoint result
        """
        try:
            success, message = self.wal_manager.force_checkpoint('TRUNCATE')
            
            if success:
                self.last_checkpoint = datetime.now()
                self.stats['checkpoints_performed'] += 1
                self.stats['last_checkpoint_time'] = self.last_checkpoint.isoformat()
            
            return {
                'success': success,
                'message': message,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error in forced checkpoint: {e}")
            return {
                'success': False,
                'message': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def get_status(self) -> Dict[str, Any]:
        """
        Get service status
        
        Returns:
            Dict[str, Any]: Service status information
        """
        wal_info = self.wal_manager.get_wal_info()
        
        return {
            'service_running': self.running,
            'checkpoint_interval': self.checkpoint_interval,
            'max_wal_size': self.max_wal_size,
            'last_checkpoint': self.last_checkpoint.isoformat() if self.last_checkpoint else None,
            'wal_info': wal_info,
            'stats': self.stats.copy()
        }
    
    def update_settings(self, **kwargs):
        """
        Update service settings
        
        Args:
            **kwargs: Settings to update
        """
        if 'checkpoint_interval' in kwargs:
            self.checkpoint_interval = max(60, kwargs['checkpoint_interval'])  # Minimum 1 minute
        
        if 'max_wal_size' in kwargs:
            self.max_wal_size = max(1024 * 1024, kwargs['max_wal_size'])  # Minimum 1MB
        
        logger.info(f"WAL Background Service settings updated: {kwargs}")

# Global service instance
_wal_background_service = None

def get_wal_background_service(db_path: str = None) -> WALBackgroundService:
    """
    Get global WAL Background Service instance
    
    Args:
        db_path (str): Database path (optional)
        
    Returns:
        WALBackgroundService: Service instance
    """
    global _wal_background_service
    
    if _wal_background_service is None or (db_path and _wal_background_service.db_path != db_path):
        _wal_background_service = WALBackgroundService(db_path)
    
    return _wal_background_service

def start_wal_background_service(db_path: str = None):
    """Start the global WAL background service"""
    service = get_wal_background_service(db_path)
    service.start()

def stop_wal_background_service():
    """Stop the global WAL background service"""
    global _wal_background_service
    if _wal_background_service:
        _wal_background_service.stop()
