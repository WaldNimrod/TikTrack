"""
Watch List Models - TikTrack
=============================

SQLAlchemy models for Watch Lists system.

Models:
    - WatchList: Represents a user's watch list
    - WatchListItem: Represents a ticker in a watch list

Author: TikTrack Development Team
Version: 1.0.0
Date: January 2025
"""

from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, CheckConstraint, UniqueConstraint
from sqlalchemy.orm import relationship, Mapped, Session
from .base import BaseModel
from typing import Dict, Any, Optional, List
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)


class WatchList(BaseModel):
    """
    Watch List model - represents a user's custom watch list
    
    Attributes:
        user_id (int): User ID - foreign key to users table
        name (str): List name - must be unique per user, max 100 chars
        icon (str): Icon name from IconSystem - max 50 chars, optional
        color_hex (str): List color in hex format (#RRGGBB) - max 7 chars, optional
        display_order (int): Manual display order for sorting - default 0
        view_mode (str): Default view mode - 'table', 'cards', or 'compact', default 'table'
        default_sort_column (str): Default sort column - max 50 chars, optional
        default_sort_direction (str): Default sort direction - 'asc' or 'desc', default 'asc'
        
    Relationships:
        items: List of WatchListItem objects in this list
        user: User who owns this list
        
    Constraints:
        - name must be unique per user
        - view_mode must be 'table', 'cards', or 'compact'
        - default_sort_direction must be 'asc' or 'desc'
        
    Example:
        >>> watch_list = WatchList(
        ...     user_id=1,
        ...     name="Tech Stocks",
        ...     icon="chart-line",
        ...     color_hex="#26baac",
        ...     view_mode="table"
        ... )
    """
    __tablename__ = "watch_lists"
    __table_args__ = (
        UniqueConstraint('user_id', 'name', name='uq_watch_lists_user_name'),
        CheckConstraint(
            "view_mode IN ('table', 'cards', 'compact')",
            name='check_watch_lists_view_mode'
        ),
        CheckConstraint(
            "default_sort_direction IN ('asc', 'desc')",
            name='check_watch_lists_sort_direction'
        ),
        {'extend_existing': True}
    )
    
    # Primary fields
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True,
                    comment="User ID - foreign key to users table")
    name = Column(String(100), nullable=False,
                 comment="List name - must be unique per user, max 100 chars")
    icon = Column(String(50), nullable=True,
                 comment="Icon name from IconSystem - max 50 chars, optional")
    color_hex = Column(String(7), nullable=True,
                      comment="List color in hex format (#RRGGBB) - max 7 chars, optional")
    display_order = Column(Integer, nullable=False, default=0,
                          comment="Manual display order for sorting - default 0")
    view_mode = Column(String(20), nullable=False, default='table',
                      comment="Default view mode - 'table', 'cards', or 'compact', default 'table'")
    default_sort_column = Column(String(50), nullable=True,
                                comment="Default sort column - max 50 chars, optional")
    default_sort_direction = Column(String(4), nullable=False, default='asc',
                                   comment="Default sort direction - 'asc' or 'desc', default 'asc'")
    is_default = Column(Integer, nullable=False, default=0,
                        comment="Whether this is the user's default watch list (0=no, 1=yes)")
    is_flag_list = Column(Integer, nullable=False, default=0,
                         comment="Whether this is an automatic flag list (0=no, 1=yes)")
    flag_color = Column(String(7), nullable=True,
                       comment="Flag color for flag lists - only set if is_flag_list=1")
    flag_entity_type = Column(String(50), nullable=True,
                             comment="Flag entity type (trade, trade_plan, etc.) - constant identifier, not color")
    updated_at = Column(DateTime(timezone=True), nullable=True,
                       comment="Last update timestamp")
    
    # Relationships
    items = relationship("WatchListItem", back_populates="watch_list",
                       cascade="all, delete-orphan", order_by="WatchListItem.display_order")
    user = relationship("User", back_populates="watch_lists")
    
    def __repr__(self) -> str:
        """String representation of the watch list"""
        return f"<WatchList(id={self.id}, name='{self.name}', user_id={self.user_id})>"
    
    def to_dict(self, db: Optional[Session] = None, user_id: Optional[int] = None) -> Dict[str, Any]:
        """
        Convert watch list to JSON dictionary
        
        Returns:
            Dict[str, Any]: Dictionary with all watch list fields
            
        Example:
            >>> watch_list.to_dict()
            {
                'id': 1,
                'user_id': 1,
                'name': 'Tech Stocks',
                'icon': 'chart-line',
                'color_hex': '#26baac',
                'display_order': 0,
                'view_mode': 'table',
                'default_sort_column': 'symbol',
                'default_sort_direction': 'asc',
                'item_count': 15,
                'created_at': '2025-01-28T10:00:00Z',
                'updated_at': '2025-01-28T12:30:00Z'
            }
        """
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'icon': self.icon,
            'color_hex': self.color_hex,
            'display_order': self.display_order,
            'view_mode': self.view_mode,
            'default_sort_column': self.default_sort_column,
            'default_sort_direction': self.default_sort_direction,
            'is_default': bool(getattr(self, 'is_default', 0)),
            'is_flag_list': bool(getattr(self, 'is_flag_list', 0)),
            'flag_color': getattr(self, 'flag_color', None),
            'flag_entity_type': getattr(self, 'flag_entity_type', None),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': getattr(self, 'updated_at', None)
        }
        if data['updated_at']:
            data['updated_at'] = data['updated_at'].isoformat()
        
        # Add items and item count if items are loaded
        if hasattr(self, 'items') and self.items is not None:
            data['item_count'] = len(self.items)
            data['items'] = [item.to_dict(db, user_id) for item in self.items]
        
        return data


class WatchListItem(BaseModel):
    """
    Watch List Item model - represents a ticker in a watch list
    
    Attributes:
        watch_list_id (int): Watch list ID - foreign key to watch_lists table
        ticker_id (int): Ticker ID - foreign key to tickers table, optional (NULL if external)
        external_symbol (str): External ticker symbol - max 10 chars, optional (NULL if ticker_id exists)
        external_name (str): External ticker name - max 100 chars, optional
        flag_color (str): Flag color in hex format (#RRGGBB) - max 7 chars, optional
        display_order (int): Manual display order within list - default 0
        notes (str): User notes about the ticker - max 500 chars, optional
        
    Relationships:
        watch_list: WatchList that contains this item
        ticker: Ticker object if ticker_id is set (optional)
        
    Constraints:
        - Must have either ticker_id OR external_symbol (but not both)
        - ticker_id must be unique per watch_list_id (if not NULL)
        - external_symbol must be unique per watch_list_id (if not NULL)
        
    Example:
        >>> item = WatchListItem(
        ...     watch_list_id=1,
        ...     ticker_id=5,
        ...     flag_color="#26baac",
        ...     display_order=0
        ... )
    """
    __tablename__ = "watch_list_items"
    __table_args__ = (
        CheckConstraint(
            "(ticker_id IS NOT NULL AND external_symbol IS NULL) OR (ticker_id IS NULL AND external_symbol IS NOT NULL)",
            name='check_watch_list_items_ticker_or_external'
        ),
        {'extend_existing': True}
    )
    
    # Primary fields
    watch_list_id = Column(Integer, ForeignKey('watch_lists.id', ondelete='CASCADE'), nullable=False, index=True,
                          comment="Watch list ID - foreign key to watch_lists table")
    ticker_id = Column(Integer, ForeignKey('tickers.id', ondelete='SET NULL'), nullable=True, index=True,
                      comment="Ticker ID - foreign key to tickers table, optional (NULL if external)")
    external_symbol = Column(String(10), nullable=True, index=True,
                            comment="External ticker symbol - max 10 chars, optional (NULL if ticker_id exists)")
    external_name = Column(String(100), nullable=True,
                          comment="External ticker name - max 100 chars, optional")
    flag_color = Column(String(7), nullable=True, index=True,
                       comment="Flag color in hex format (#RRGGBB) - max 7 chars, optional")
    flag_entity_type = Column(String(50), nullable=True, index=True,
                             comment="Flag entity type (trade, trade_plan, etc.) - constant identifier, not color")
    display_order = Column(Integer, nullable=False, default=0,
                          comment="Manual display order within list - default 0")
    notes = Column(String(500), nullable=True,
                  comment="User notes about the ticker - max 500 chars, optional")
    updated_at = Column(DateTime(timezone=True), nullable=True,
                       comment="Last update timestamp")
    
    # Relationships
    watch_list = relationship("WatchList", back_populates="items")
    ticker = relationship("Ticker", foreign_keys=[ticker_id])
    
    def __repr__(self) -> str:
        """String representation of the watch list item"""
        ticker_ref = f"ticker_id={self.ticker_id}" if self.ticker_id else f"external_symbol='{self.external_symbol}'"
        return f"<WatchListItem(id={self.id}, watch_list_id={self.watch_list_id}, {ticker_ref})>"
    
    def to_dict(self, db: Optional[Session] = None, user_id: Optional[int] = None) -> Dict[str, Any]:
        """
        Convert watch list item to JSON dictionary
        
        Args:
            db: Optional database session to check flag lists
            user_id: Optional user ID to check flag lists
        
        Returns:
            Dict[str, Any]: Dictionary with all watch list item fields
            
        Example:
            >>> item.to_dict()
            {
                'id': 1,
                'watch_list_id': 1,
                'ticker_id': 5,
                'external_symbol': None,
                'external_name': None,
                'flag_color': '#26baac',  # From flag list if ticker is in one
                'flag_entity_type': 'trade',  # From flag list if ticker is in one
                'display_order': 0,
                'notes': 'Tech stock to watch',
                'created_at': '2025-01-28T10:00:00Z',
                'updated_at': '2025-01-28T12:30:00Z'
            }
        """
        data = {
            'id': self.id,
            'watch_list_id': self.watch_list_id,
            'ticker_id': self.ticker_id,
            'external_symbol': self.external_symbol,
            'external_name': self.external_name,
            'display_order': self.display_order,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': getattr(self, 'updated_at', None)
        }
        if data['updated_at']:
            data['updated_at'] = data['updated_at'].isoformat()
        
        # CRITICAL: Flag color is determined by which flag list the ticker is in
        # Check if this ticker is in any flag list for this user
        flag_color = None
        flag_entity_type = None
        
        if db and user_id and (self.ticker_id or self.external_symbol):
            # Get all flag lists for this user
            flag_lists = db.query(WatchList).filter(
                WatchList.user_id == user_id,
                WatchList.is_flag_list == 1,
                WatchList.flag_entity_type.isnot(None)
            ).all()
            
            # Check if ticker is in any flag list
            for flag_list in flag_lists:
                # Check if ticker is in this flag list
                if self.ticker_id:
                    # Check by ticker_id
                    flag_item = db.query(WatchListItem).filter(
                        WatchListItem.watch_list_id == flag_list.id,
                        WatchListItem.ticker_id == self.ticker_id
                    ).first()
                elif self.external_symbol:
                    # Check by external_symbol
                    flag_item = db.query(WatchListItem).filter(
                        WatchListItem.watch_list_id == flag_list.id,
                        WatchListItem.external_symbol == self.external_symbol
                    ).first()
                else:
                    flag_item = None
                
                if flag_item:
                    # Ticker is in this flag list - use its flag color
                    flag_color = flag_list.flag_color
                    flag_entity_type = flag_list.flag_entity_type
                    break  # Only one flag per ticker
        
        data['flag_color'] = flag_color
        data['flag_entity_type'] = flag_entity_type
        
        # Add ticker data if ticker relationship is loaded
        if hasattr(self, 'ticker') and self.ticker is not None:
            data['ticker'] = self.ticker.to_dict()
        
        return data

