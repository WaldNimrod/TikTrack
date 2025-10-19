"""
Cache Changes Tracker Service - TikTrack
=========================================

Service for tracking cache invalidation events for polling-based updates.
Logs all cache changes to database so Frontend clients can poll for updates.

Features:
- Log cache invalidation events
- Query changes since timestamp
- Auto-cleanup old logs
- Thread-safe operations

Author: TikTrack Development Team
Created: January 2025
Version: 1.0
"""

import logging
from typing import List, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.exc import SQLAlchemyError

logger = logging.getLogger(__name__)


class CacheChangesTracker:
    """
    Tracks cache invalidation events for polling clients.
    
    Stores a log of all cache changes in database, allowing Frontend
    clients to poll for updates without WebSocket/Socket.IO.
    """
    
    def __init__(self):
        """Initialize the cache changes tracker"""
        self.enabled = True
        logger.info("Cache Changes Tracker initialized")
    
    def log_change(self, keys: List[str], reason: str = None, created_by: str = "system") -> bool:
        """
        Log a cache invalidation event to database.
        
        Args:
            keys: List of cache keys that were invalidated (e.g. ['trades', 'tickers'])
            reason: Reason for invalidation (e.g. "API call: create_trade")
            created_by: Who triggered the change (e.g. "backend_api", "manual")
            
        Returns:
            True if logged successfully, False otherwise
            
        Example:
            cache_changes_tracker.log_change(
                keys=['trades', 'tickers', 'dashboard'],
                reason='Trade created via API',
                created_by='backend_api'
            )
        """
        if not self.enabled:
            return False
        
        try:
            # Import here to avoid circular dependency
            from models.cache_change_log import CacheChangeLog
            from config.database import SessionLocal
            
            db = SessionLocal()
            
            try:
                # Create log entry
                log_entry = CacheChangeLog(
                    keys=keys,
                    reason=reason,
                    created_by=created_by
                )
                
                db.add(log_entry)
                db.commit()
                
                logger.info(f"📝 Logged cache change: keys={keys}, reason={reason}")
                return True
                
            except SQLAlchemyError as e:
                logger.error(f"❌ Database error logging cache change: {e}")
                db.rollback()
                return False
            finally:
                db.close()
                
        except Exception as e:
            logger.error(f"❌ Failed to log cache change: {e}")
            return False
    
    def get_changes_since(self, since_timestamp: datetime, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Get all cache changes since a specific timestamp.
        
        Args:
            since_timestamp: Get changes after this time (UTC)
            limit: Maximum number of changes to return (default: 100)
            
        Returns:
            List of change dictionaries:
            [
                {
                    'keys': ['trades', 'tickers'],
                    'reason': 'API call: create_trade',
                    'timestamp': '2025-01-13T02:30:15.123456',
                    'created_by': 'backend_api'
                },
                ...
            ]
            
        Example:
            # Get changes in last 60 seconds
            since = datetime.utcnow() - timedelta(seconds=60)
            changes = cache_changes_tracker.get_changes_since(since)
        """
        try:
            from models.cache_change_log import CacheChangeLog
            from config.database import SessionLocal
            
            db = SessionLocal()
            
            try:
                # Query changes since timestamp
                changes = db.query(CacheChangeLog)\
                    .filter(CacheChangeLog.timestamp > since_timestamp)\
                    .order_by(CacheChangeLog.timestamp.desc())\
                    .limit(limit)\
                    .all()
                
                # Convert to dictionaries
                result = [change.to_dict() for change in changes]
                
                logger.debug(f"Retrieved {len(result)} cache changes since {since_timestamp}")
                return result
                
            except SQLAlchemyError as e:
                logger.error(f"❌ Database error getting changes: {e}")
                return []
            finally:
                db.close()
                
        except Exception as e:
            logger.error(f"❌ Failed to get cache changes: {e}")
            return []
    
    def cleanup_old_logs(self, days_to_keep: int = 7) -> int:
        """
        Clean up old log entries to prevent database bloat.
        Keeps only logs from last N days.
        
        Args:
            days_to_keep: Number of days to keep (default: 7)
            
        Returns:
            Number of entries deleted
            
        Example:
            # Keep only last 3 days
            deleted = cache_changes_tracker.cleanup_old_logs(days_to_keep=3)
        """
        try:
            from models.cache_change_log import CacheChangeLog
            from config.database import SessionLocal
            
            db = SessionLocal()
            
            try:
                # Calculate cutoff date
                cutoff_date = datetime.utcnow() - timedelta(days=days_to_keep)
                
                # Delete old entries
                deleted_count = db.query(CacheChangeLog)\
                    .filter(CacheChangeLog.timestamp < cutoff_date)\
                    .delete()
                
                db.commit()
                
                logger.info(f"🧹 Cleaned up {deleted_count} old cache change logs (older than {days_to_keep} days)")
                return deleted_count
                
            except SQLAlchemyError as e:
                logger.error(f"❌ Database error during cleanup: {e}")
                db.rollback()
                return 0
            finally:
                db.close()
                
        except Exception as e:
            logger.error(f"❌ Failed to cleanup old logs: {e}")
            return 0
    
    def get_stats(self) -> Dict[str, Any]:
        """
        Get statistics about cache change logs.
        
        Returns:
            Dictionary with statistics:
            - total_logs: Total number of log entries
            - logs_last_hour: Number of changes in last hour
            - logs_today: Number of changes today
            - oldest_log: Timestamp of oldest log
        """
        try:
            from models.cache_change_log import CacheChangeLog
            from config.database import SessionLocal
            
            db = SessionLocal()
            
            try:
                # Get total count
                total_logs = db.query(CacheChangeLog).count()
                
                # Get count in last hour
                one_hour_ago = datetime.utcnow() - timedelta(hours=1)
                logs_last_hour = db.query(CacheChangeLog)\
                    .filter(CacheChangeLog.timestamp > one_hour_ago)\
                    .count()
                
                # Get count today
                today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
                logs_today = db.query(CacheChangeLog)\
                    .filter(CacheChangeLog.timestamp > today_start)\
                    .count()
                
                # Get oldest log
                oldest = db.query(CacheChangeLog)\
                    .order_by(CacheChangeLog.timestamp.asc())\
                    .first()
                
                return {
                    'total_logs': total_logs,
                    'logs_last_hour': logs_last_hour,
                    'logs_today': logs_today,
                    'oldest_log': oldest.timestamp.isoformat() if oldest else None,
                    'enabled': self.enabled
                }
                
            finally:
                db.close()
                
        except Exception as e:
            logger.error(f"❌ Failed to get stats: {e}")
            return {
                'total_logs': 0,
                'logs_last_hour': 0,
                'logs_today': 0,
                'oldest_log': None,
                'enabled': self.enabled,
                'error': str(e)
            }


# Global instance
cache_changes_tracker = CacheChangesTracker()

