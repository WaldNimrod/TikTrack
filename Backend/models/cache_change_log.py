"""
Cache Change Log Model - TikTrack
==================================

Model for tracking cache invalidation events for polling-based updates.
Stores a log of all cache changes so Frontend clients can poll for updates.

Author: TikTrack Development Team
Created: January 2025
Version: 1.0
"""

from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import json

# Import Base from config
try:
    from config.database import Base
except ImportError:
    # Fallback if config.database not available
    Base = declarative_base()


class CacheChangeLog(Base):
    """
    Cache Change Log Model
    
    Tracks cache invalidation events for polling clients.
    Each entry represents a cache invalidation event with the keys that were invalidated.
    
    Attributes:
        id: Primary key
        keys_json: JSON string of cache keys that were invalidated (e.g. '["trades", "tickers"]')
        reason: Reason for invalidation (e.g. "API call: create_trade")
        timestamp: When the invalidation occurred (UTC)
        created_by: Who/what triggered the invalidation (e.g. "backend_api", "manual")
    """
    
    __tablename__ = 'cache_change_log'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    keys_json = Column(Text, nullable=False)  # JSON string of keys list
    reason = Column(String(200), nullable=True)
    timestamp = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)
    created_by = Column(String(100), nullable=True, default='system')
    
    def __init__(self, keys, reason=None, created_by='system'):
        """
        Initialize cache change log entry
        
        Args:
            keys: List of cache keys (will be stored as JSON)
            reason: Reason for invalidation
            created_by: Who triggered the change
        """
        self.keys_json = json.dumps(keys) if isinstance(keys, list) else keys
        self.reason = reason
        self.created_by = created_by
        self.timestamp = datetime.utcnow()
    
    @property
    def keys(self):
        """Get keys as Python list"""
        try:
            return json.loads(self.keys_json) if self.keys_json else []
        except:
            return []
    
    def to_dict(self):
        """Convert to dictionary for API responses"""
        return {
            'id': self.id,
            'keys': self.keys,
            'reason': self.reason,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'created_by': self.created_by
        }
    
    def __repr__(self):
        return f"<CacheChangeLog(id={self.id}, keys={self.keys}, reason='{self.reason}', timestamp={self.timestamp})>"

