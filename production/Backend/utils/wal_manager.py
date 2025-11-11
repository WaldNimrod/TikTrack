"""
WAL Manager - SQLite Write-Ahead Log Management
==============================================

This module provides utilities for managing SQLite WAL files to ensure
data consistency and prevent deleted records from reappearing.

Features:
- Automatic WAL checkpoint management
- Manual checkpoint triggers
- WAL file size monitoring
- Database consistency checks

Author: TikTrack Development Team
Version: 1.0
Date: September 2025
"""

import sqlite3
import os
import logging
from typing import Dict, Any, Optional, Tuple
from datetime import datetime

from config.settings import DB_PATH

logger = logging.getLogger(__name__)

class WALManager:
    """
    Manager for SQLite WAL (Write-Ahead Log) operations
    
    This class provides methods to manage WAL files and ensure
    data consistency in SQLite databases.
    """
    
    def __init__(self, db_path: str):
        """
        Initialize WAL Manager
        
        Args:
            db_path (str): Path to SQLite database file
        """
        self.db_path = db_path
        self.wal_path = f"{db_path}-wal"
        self.shm_path = f"{db_path}-shm"
    
    def get_wal_info(self) -> Dict[str, Any]:
        """
        Get information about WAL files
        
        Returns:
            Dict[str, Any]: WAL file information
        """
        info = {
            'wal_exists': os.path.exists(self.wal_path),
            'shm_exists': os.path.exists(self.shm_path),
            'wal_size': 0,
            'shm_size': 0,
            'checkpoint_info': None
        }
        
        if info['wal_exists']:
            info['wal_size'] = os.path.getsize(self.wal_path)
        
        if info['shm_exists']:
            info['shm_size'] = os.path.getsize(self.shm_path)
        
        # Get checkpoint information
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Get WAL checkpoint info
            cursor.execute("PRAGMA wal_checkpoint(PASSIVE)")
            result = cursor.fetchone()
            if result:
                info['checkpoint_info'] = {
                    'busy': result[0],
                    'log_size': result[1],
                    'checkpointed': result[2]
                }
            
            conn.close()
        except Exception as e:
            logger.error(f"Error getting WAL info: {e}")
            info['error'] = str(e)
        
        return info
    
    def force_checkpoint(self, mode: str = 'TRUNCATE') -> Tuple[bool, str]:
        """
        Force a WAL checkpoint
        
        Args:
            mode (str): Checkpoint mode - 'PASSIVE', 'FULL', or 'TRUNCATE'
            
        Returns:
            Tuple[bool, str]: (success, message)
        """
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Perform checkpoint
            cursor.execute(f"PRAGMA wal_checkpoint({mode})")
            result = cursor.fetchone()
            
            if result:
                busy, log_size, checkpointed = result
                
                if busy:
                    return False, "Database is busy, checkpoint not completed"
                elif log_size == 0:
                    return True, "No WAL file to checkpoint"
                else:
                    return True, f"Checkpoint completed: {checkpointed}/{log_size} pages"
            else:
                return False, "Checkpoint failed - no result"
                
        except Exception as e:
            logger.error(f"Error during WAL checkpoint: {e}")
            return False, f"Checkpoint error: {str(e)}"
        finally:
            if 'conn' in locals():
                conn.close()
    
    def optimize_wal_settings(self) -> bool:
        """
        Optimize WAL settings for better consistency
        
        Returns:
            bool: True if optimization successful
        """
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Set optimal WAL settings
            cursor.execute("PRAGMA wal_autocheckpoint=100")  # More frequent checkpoints
            cursor.execute("PRAGMA synchronous=NORMAL")      # Balance between speed and safety
            cursor.execute("PRAGMA journal_mode=WAL")        # Ensure WAL mode
            
            conn.close()
            return True
            
        except Exception as e:
            logger.error(f"Error optimizing WAL settings: {e}")
            return False
    
    def cleanup_wal_files(self) -> Tuple[bool, str]:
        """
        Clean up WAL files (use with caution)
        
        Returns:
            Tuple[bool, str]: (success, message)
        """
        try:
            # First, try to checkpoint
            success, message = self.force_checkpoint('TRUNCATE')
            
            if not success:
                return False, f"Cannot cleanup WAL files: {message}"
            
            # Check if WAL files still exist
            wal_info = self.get_wal_info()
            
            if wal_info['wal_size'] == 0 and wal_info['shm_size'] == 0:
                return True, "WAL files cleaned up successfully"
            else:
                return False, f"WAL files still exist: WAL={wal_info['wal_size']} bytes, SHM={wal_info['shm_size']} bytes"
                
        except Exception as e:
            logger.error(f"Error cleaning up WAL files: {e}")
            return False, f"Cleanup error: {str(e)}"
    
    def monitor_wal_health(self) -> Dict[str, Any]:
        """
        Monitor WAL health and provide recommendations
        
        Returns:
            Dict[str, Any]: Health report and recommendations
        """
        wal_info = self.get_wal_info()
        
        health_report = {
            'timestamp': datetime.now().isoformat(),
            'wal_info': wal_info,
            'health_status': 'healthy',
            'recommendations': []
        }
        
        # Check WAL file size
        if wal_info['wal_size'] > 10 * 1024 * 1024:  # 10MB
            health_report['health_status'] = 'warning'
            health_report['recommendations'].append(
                f"WAL file is large ({wal_info['wal_size']} bytes). Consider running checkpoint."
            )
        
        # Check if WAL files exist but are empty
        if wal_info['wal_exists'] and wal_info['wal_size'] == 0:
            health_report['recommendations'].append(
                "WAL file exists but is empty. Consider cleanup."
            )
        
        # Check checkpoint status
        if wal_info['checkpoint_info']:
            checkpointed = wal_info['checkpoint_info']['checkpointed']
            log_size = wal_info['checkpoint_info']['log_size']
            
            if log_size > 0 and checkpointed < log_size:
                health_report['health_status'] = 'warning'
                health_report['recommendations'].append(
                    f"Checkpoint incomplete: {checkpointed}/{log_size} pages"
                )
        
        return health_report

# Global WAL Manager instance
_wal_manager = None

def get_wal_manager(db_path: str = None) -> WALManager:
    """
    Get global WAL Manager instance
    
    Args:
        db_path (str): Database path (optional, uses default if not provided)
        
    Returns:
        WALManager: WAL Manager instance
    """
    global _wal_manager
    
    if _wal_manager is None or (db_path and _wal_manager.db_path != db_path):
        if db_path is None:
            # Use default database path (production hardcoded)
            db_path = str(DB_PATH)
        
        _wal_manager = WALManager(db_path)
    
    return _wal_manager

def ensure_wal_consistency(db_path: str = None) -> bool:
    """
    Ensure WAL consistency by performing checkpoint
    
    Args:
        db_path (str): Database path (optional)
        
    Returns:
        bool: True if consistency ensured
    """
    try:
        wal_manager = get_wal_manager(db_path)
        success, message = wal_manager.force_checkpoint('TRUNCATE')
        
        if success:
            logger.info(f"WAL consistency ensured: {message}")
        else:
            logger.warning(f"WAL consistency check failed: {message}")
        
        return success
        
    except Exception as e:
        logger.error(f"Error ensuring WAL consistency: {e}")
        return False
