"""
Watch List Service - TikTrack
==============================

Provides CRUD operations for watch lists and watch list items.

Author: TikTrack Development Team
Version: 1.0.0
Date: January 2025
"""

from __future__ import annotations

import logging
from typing import Dict, List, Optional, Any
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_

from models.watch_list import WatchList, WatchListItem
from models.ticker import Ticker

logger = logging.getLogger(__name__)

# Function Index
# --------------
# get_watch_lists, create_watch_list, update_watch_list, delete_watch_list
# get_watch_list_items, add_ticker_to_list, remove_ticker_from_list
# update_item_order, get_watch_list_by_id
# Internal validation and helper functions


class WatchListService:
    """
    Service wrapper for managing watch lists and items.

    All methods expect a SQLAlchemy Session managed by the caller.
    """

    # Maximum number of lists per user
    MAX_LISTS_PER_USER = 20

    # --------------------------------------------------------------------- #
    # Watch List Operations
    # --------------------------------------------------------------------- #

    @staticmethod
    def get_watch_lists(db: Session, user_id: int) -> List[WatchList]:
        """
        Get all watch lists for a user, ordered by display_order and name.

        Args:
            db: Database session
            user_id: User ID

        Returns:
            List of WatchList objects
        """
        logger.debug("Fetching watch lists for user_id=%s", user_id)
        return (
            db.query(WatchList)
            .filter(WatchList.user_id == user_id)
            .order_by(WatchList.display_order.asc(), WatchList.name.asc())
            .all()
        )

    @staticmethod
    def get_watch_list_by_id(db: Session, list_id: int, user_id: int) -> Optional[WatchList]:
        """
        Get a specific watch list by ID, ensuring it belongs to the user.

        Args:
            db: Database session
            list_id: Watch list ID
            user_id: User ID

        Returns:
            WatchList object or None if not found
        """
        logger.debug("Fetching watch list %s for user_id=%s", list_id, user_id)
        return (
            db.query(WatchList)
            .filter(WatchList.id == list_id, WatchList.user_id == user_id)
            .first()
        )

    @staticmethod
    def create_watch_list(
        db: Session,
        user_id: int,
        name: str,
        icon: Optional[str] = None,
        color_hex: Optional[str] = None,
        view_mode: str = 'table',
        default_sort_column: Optional[str] = None,
        default_sort_direction: str = 'asc'
    ) -> WatchList:
        """
        Create a new watch list.

        Args:
            db: Database session
            user_id: User ID
            name: List name (must be unique per user)
            icon: Icon name from IconSystem (optional)
            color_hex: Color in hex format (optional)
            view_mode: View mode ('table', 'cards', 'compact')
            default_sort_column: Default sort column (optional)
            default_sort_direction: Sort direction ('asc' or 'desc')

        Returns:
            Created WatchList object

        Raises:
            ValueError: If validation fails or max lists exceeded
        """
        # Validate name
        if not name or not name.strip():
            raise ValueError("List name cannot be empty")
        
        name = name.strip()
        if len(name) > 100:
            raise ValueError("List name cannot exceed 100 characters")

        # Check max lists per user
        existing_count = db.query(func.count(WatchList.id)).filter(
            WatchList.user_id == user_id
        ).scalar()
        
        if existing_count >= WatchListService.MAX_LISTS_PER_USER:
            raise ValueError(f"Maximum {WatchListService.MAX_LISTS_PER_USER} lists per user")

        # Check unique name per user
        existing = db.query(WatchList).filter(
            WatchList.user_id == user_id,
            WatchList.name == name
        ).first()
        
        if existing:
            raise ValueError(f"List with name '{name}' already exists for this user")

        # Validate view_mode
        if view_mode not in ['table', 'cards', 'compact']:
            raise ValueError("view_mode must be 'table', 'cards', or 'compact'")

        # Validate sort direction
        if default_sort_direction not in ['asc', 'desc']:
            raise ValueError("default_sort_direction must be 'asc' or 'desc'")

        # Get next display_order
        max_order = db.query(func.max(WatchList.display_order)).filter(
            WatchList.user_id == user_id
        ).scalar() or 0

        # Create watch list
        watch_list = WatchList(
            user_id=user_id,
            name=name,
            icon=icon,
            color_hex=color_hex,
            display_order=max_order + 1,
            view_mode=view_mode,
            default_sort_column=default_sort_column,
            default_sort_direction=default_sort_direction
        )

        db.add(watch_list)
        db.commit()
        db.refresh(watch_list)
        
        logger.info("Created watch list %s for user %s", watch_list.id, user_id)
        return watch_list

    @staticmethod
    def update_watch_list(
        db: Session,
        list_id: int,
        user_id: int,
        name: Optional[str] = None,
        icon: Optional[str] = None,
        color_hex: Optional[str] = None,
        display_order: Optional[int] = None,
        view_mode: Optional[str] = None,
        default_sort_column: Optional[str] = None,
        default_sort_direction: Optional[str] = None
    ) -> Optional[WatchList]:
        """
        Update an existing watch list.

        Args:
            db: Database session
            list_id: Watch list ID
            user_id: User ID
            name: New name (optional)
            icon: New icon (optional)
            color_hex: New color (optional)
            display_order: New display order (optional)
            view_mode: New view mode (optional)
            default_sort_column: New sort column (optional)
            default_sort_direction: New sort direction (optional)

        Returns:
            Updated WatchList object or None if not found

        Raises:
            ValueError: If validation fails
        """
        watch_list = WatchListService.get_watch_list_by_id(db, list_id, user_id)
        if not watch_list:
            logger.warning("Watch list %s not found for user %s during update", list_id, user_id)
            return None

        # Validate and update name
        if name is not None:
            if not name.strip():
                raise ValueError("List name cannot be empty")
            name = name.strip()
            if len(name) > 100:
                raise ValueError("List name cannot exceed 100 characters")
            
            # Check unique name (excluding current list)
            existing = db.query(WatchList).filter(
                WatchList.user_id == user_id,
                WatchList.name == name,
                WatchList.id != list_id
            ).first()
            
            if existing:
                raise ValueError(f"List with name '{name}' already exists for this user")
            
            watch_list.name = name

        # Update other fields
        if icon is not None:
            watch_list.icon = icon
        if color_hex is not None:
            watch_list.color_hex = color_hex
        if display_order is not None:
            watch_list.display_order = display_order
        if view_mode is not None:
            if view_mode not in ['table', 'cards', 'compact']:
                raise ValueError("view_mode must be 'table', 'cards', or 'compact'")
            watch_list.view_mode = view_mode
        if default_sort_column is not None:
            watch_list.default_sort_column = default_sort_column
        if default_sort_direction is not None:
            if default_sort_direction not in ['asc', 'desc']:
                raise ValueError("default_sort_direction must be 'asc' or 'desc'")
            watch_list.default_sort_direction = default_sort_direction

        db.commit()
        db.refresh(watch_list)
        
        logger.info("Updated watch list %s for user %s", list_id, user_id)
        return watch_list

    @staticmethod
    def delete_watch_list(db: Session, list_id: int, user_id: int) -> bool:
        """
        Delete a watch list and all its items (CASCADE).

        Args:
            db: Database session
            list_id: Watch list ID
            user_id: User ID

        Returns:
            True if deleted, False if not found
        """
        watch_list = WatchListService.get_watch_list_by_id(db, list_id, user_id)
        if not watch_list:
            logger.warning("Watch list %s not found for user %s during delete", list_id, user_id)
            return False

        db.delete(watch_list)
        db.commit()
        
        logger.info("Deleted watch list %s for user %s", list_id, user_id)
        return True

    # --------------------------------------------------------------------- #
    # Watch List Item Operations
    # --------------------------------------------------------------------- #

    @staticmethod
    def get_watch_list_items(db: Session, list_id: int, user_id: int) -> List[WatchListItem]:
        """
        Get all items in a watch list, ordered by display_order.
        For flag lists (is_flag_list=1), returns all items with the flag color from all user's lists.

        Args:
            db: Database session
            list_id: Watch list ID
            user_id: User ID (for validation)

        Returns:
            List of WatchListItem objects

        Raises:
            ValueError: If watch list not found or doesn't belong to user
        """
        # Verify watch list exists and belongs to user
        watch_list = WatchListService.get_watch_list_by_id(db, list_id, user_id)
        if not watch_list:
            raise ValueError(f"Watch list {list_id} not found or doesn't belong to user {user_id}")

        # Check if this is a flag list
        is_flag_list = getattr(watch_list, 'is_flag_list', 0)
        flag_entity_type = getattr(watch_list, 'flag_entity_type', None)
        flag_color = getattr(watch_list, 'flag_color', None)
        
        if is_flag_list and flag_entity_type:
            # Flag list: return all items that are in this flag list
            # Flag is determined by which flag list ticker is in, not stored in item
            logger.debug("Fetching items for flag list %s (entityType: %s, color: %s)", list_id, flag_entity_type, flag_color)
            
            # Get all items in this flag list
            # The flag list itself contains items - we just return them
            return (
                db.query(WatchListItem)
                .filter(WatchListItem.watch_list_id == list_id)
                .order_by(WatchListItem.display_order.asc())
                .all()
            )
        else:
            # Regular list: return items from this list only
            logger.debug("Fetching items for watch list %s", list_id)
            return (
                db.query(WatchListItem)
                .filter(WatchListItem.watch_list_id == list_id)
                .order_by(WatchListItem.display_order.asc())
                .all()
            )

    @staticmethod
    def add_ticker_to_list(
        db: Session,
        list_id: int,
        user_id: int,
        ticker_id: Optional[int] = None,
        external_symbol: Optional[str] = None,
        external_name: Optional[str] = None,
        flag_color: Optional[str] = None,
        flag_entity_type: Optional[str] = None,
        notes: Optional[str] = None
    ) -> WatchListItem:
        """
        Add a ticker to a watch list.

        Args:
            db: Database session
            list_id: Watch list ID
            user_id: User ID (for validation)
            ticker_id: Ticker ID from system (optional, if None then external_symbol required)
            external_symbol: External ticker symbol (optional, if None then ticker_id required)
            external_name: External ticker name (optional)
            flag_color: Flag color in hex format (optional, for display)
            flag_entity_type: Flag entity type (optional, constant identifier: trade, trade_plan, etc.)
            notes: User notes (optional)

        Returns:
            Created WatchListItem object

        Raises:
            ValueError: If validation fails
        """
        # Verify watch list exists and belongs to user
        watch_list = WatchListService.get_watch_list_by_id(db, list_id, user_id)
        if not watch_list:
            raise ValueError(f"Watch list {list_id} not found or doesn't belong to user {user_id}")

        # Validate: must have either ticker_id OR external_symbol (but not both)
        if ticker_id is not None and external_symbol is not None:
            raise ValueError("Cannot specify both ticker_id and external_symbol")
        
        if ticker_id is None and external_symbol is None:
            raise ValueError("Must specify either ticker_id or external_symbol")

        # If ticker_id provided, verify ticker exists
        if ticker_id is not None:
            ticker = db.query(Ticker).filter(Ticker.id == ticker_id).first()
            if not ticker:
                raise ValueError(f"Ticker {ticker_id} not found")

            # Check if ticker already in list
            existing = db.query(WatchListItem).filter(
                WatchListItem.watch_list_id == list_id,
                WatchListItem.ticker_id == ticker_id
            ).first()
            
            if existing:
                raise ValueError(f"Ticker {ticker_id} already in this list")

        # If external_symbol provided, check if already in list
        if external_symbol is not None:
            existing = db.query(WatchListItem).filter(
                WatchListItem.watch_list_id == list_id,
                WatchListItem.external_symbol == external_symbol
            ).first()
            
            if existing:
                raise ValueError(f"External ticker '{external_symbol}' already in this list")

        # Get next display_order
        max_order = db.query(func.max(WatchListItem.display_order)).filter(
            WatchListItem.watch_list_id == list_id
        ).scalar() or 0

        # Create item
        # NOTE: Do NOT store flag_color or flag_entity_type in item - flag is determined by which flag list the ticker is in
        item = WatchListItem(
            watch_list_id=list_id,
            ticker_id=ticker_id,
            external_symbol=external_symbol,
            external_name=external_name,
            display_order=max_order + 1,
            notes=notes
        )

        db.add(item)
        db.commit()
        db.refresh(item)
        
        logger.info("Added ticker to watch list %s (item_id=%s)", list_id, item.id)
        return item

    @staticmethod
    def remove_ticker_from_list(db: Session, item_id: int, user_id: int) -> bool:
        """
        Remove a ticker from a watch list.

        Args:
            db: Database session
            item_id: Watch list item ID
            user_id: User ID (for validation)

        Returns:
            True if removed, False if not found
        """
        # Get item and verify it belongs to user's watch list
        item = db.query(WatchListItem).join(WatchList).filter(
            WatchListItem.id == item_id,
            WatchList.user_id == user_id
        ).first()

        if not item:
            logger.warning("Watch list item %s not found for user %s during delete", item_id, user_id)
            return False

        list_id = item.watch_list_id
        db.delete(item)
        db.commit()
        
        logger.info("Removed item %s from watch list %s", item_id, list_id)
        return True

    @staticmethod
    def update_item(
        db: Session,
        item_id: int,
        user_id: int,
        flag_color: Optional[str] = None,
        flag_entity_type: Optional[str] = None,
        display_order: Optional[int] = None,
        notes: Optional[str] = None
    ) -> Optional[WatchListItem]:
        """
        Update a watch list item.

        Args:
            db: Database session
            item_id: Watch list item ID
            user_id: User ID (for validation)
            flag_color: New flag color (optional)
            display_order: New display order (optional)
            notes: New notes (optional)

        Returns:
            Updated WatchListItem object or None if not found
        """
        # Get item and verify it belongs to user's watch list
        item = db.query(WatchListItem).join(WatchList).filter(
            WatchListItem.id == item_id,
            WatchList.user_id == user_id
        ).first()

        if not item:
            logger.warning("Watch list item %s not found for user %s during update", item_id, user_id)
            return None

        # NOTE: Do NOT update flag_color or flag_entity_type - flag is determined by which flag list the ticker is in
        # These parameters are kept for backward compatibility but are ignored
        if display_order is not None:
            item.display_order = display_order
        if notes is not None:
            if len(notes) > 500:
                raise ValueError("Notes cannot exceed 500 characters")
            item.notes = notes

        db.commit()
        db.refresh(item)
        
        logger.info("Updated watch list item %s (display_order=%s, notes=%s)", item_id, item.display_order, item.notes)
        return item

    @staticmethod
    def update_item_order(
        db: Session,
        list_id: int,
        user_id: int,
        items_order: List[Dict[str, int]]
    ) -> bool:
        """
        Update display order of items in a watch list.

        Args:
            db: Database session
            list_id: Watch list ID
            user_id: User ID (for validation)
            items_order: List of dicts with 'id' and 'display_order' keys

        Returns:
            True if successful

        Raises:
            ValueError: If validation fails
        """
        # Verify watch list exists and belongs to user
        watch_list = WatchListService.get_watch_list_by_id(db, list_id, user_id)
        if not watch_list:
            raise ValueError(f"Watch list {list_id} not found or doesn't belong to user {user_id}")

        # Update each item's display_order
        for item_data in items_order:
            item_id = item_data.get('id')
            display_order = item_data.get('display_order')
            
            if item_id is None or display_order is None:
                continue

            item = db.query(WatchListItem).filter(
                WatchListItem.id == item_id,
                WatchListItem.watch_list_id == list_id
            ).first()

            if item:
                item.display_order = display_order

        db.commit()
        
        logger.info("Updated display order for watch list %s", list_id)
        return True

    # --------------------------------------------------------------------- #
    # Flag List Operations (Automatic Dynamic Lists)
    # --------------------------------------------------------------------- #

    @staticmethod
    def get_or_create_flag_list(db: Session, user_id: int, flag_entity_type: str, flag_color: Optional[str] = None) -> WatchList:
        """
        Get or create a dynamic flag list for a specific entity type.
        Flag lists are automatically managed - they show all tickers with the flag.
        
        Uses entityType (constant) for identification, not color (varies by user preferences).
        
        Args:
            db: Database session
            user_id: User ID
            flag_entity_type: Entity type (trade, trade_plan, account, etc.) - constant identifier
            flag_color: Flag color in hex format (optional, for display only)
        
        Returns:
            WatchList object (existing or newly created)
        """
        # Map entity types to Hebrew names (constant, not color-dependent)
        flag_names = {
            'trade': 'דגל Trade',
            'trade_plan': 'דגל Trade Plan',
            'account': 'דגל Account',
            'cash_flow': 'דגל Cash Flow',
            'ticker': 'דגל Ticker',
            'alert': 'דגל Alert',
            'note': 'דגל Note',
            'execution': 'דגל Execution'
        }
        
        flag_list_name = flag_names.get(flag_entity_type, f'דגל {flag_entity_type}')
        
        # Check if flag list exists by entityType (not color - colors vary by user)
        existing = db.query(WatchList).filter(
            WatchList.user_id == user_id,
            WatchList.is_flag_list == 1,
            WatchList.flag_entity_type == flag_entity_type
        ).first()
        
        if existing:
            # Update color if provided (user preferences may have changed)
            if flag_color and existing.flag_color != flag_color:
                existing.flag_color = flag_color
                existing.color_hex = flag_color
                db.commit()
                db.refresh(existing)
                logger.debug("Updated flag list %s color to %s (entityType: %s)", existing.id, flag_color, flag_entity_type)
            else:
                logger.debug("Found existing flag list %s for entityType %s", existing.id, flag_entity_type)
            return existing
        
        # Create new flag list
        # Get next display_order (flag lists should appear after regular lists)
        max_order = db.query(func.max(WatchList.display_order)).filter(
            WatchList.user_id == user_id
        ).scalar() or 0
        
        flag_list = WatchList(
            user_id=user_id,
            name=flag_list_name,
            icon='flag-filled',
            color_hex=flag_color,  # For display only
            display_order=max_order + 1,
            view_mode='table',
            is_flag_list=1,
            flag_color=flag_color,  # For display only
            flag_entity_type=flag_entity_type  # For identification (constant)
        )
        
        db.add(flag_list)
        db.commit()
        db.refresh(flag_list)
        
        logger.info("Created flag list %s for entityType %s (color: %s, user %s)", flag_list.id, flag_entity_type, flag_color, user_id)
        return flag_list

    @staticmethod
    def sync_flag_list_items(db: Session, list_id: int, user_id: int) -> bool:
        """
        Sync flag list - this is a no-op for flag lists since they are dynamic views.
        Flag lists don't store items - they dynamically show all items with the flag color.
        This method exists for API compatibility but doesn't need to do anything.
        
        Args:
            db: Database session
            list_id: Flag list ID
            user_id: User ID (for validation)
        
        Returns:
            True if successful
        """
        # Verify it's a flag list
        flag_list = WatchListService.get_watch_list_by_id(db, list_id, user_id)
        if not flag_list or not getattr(flag_list, 'is_flag_list', 0):
            raise ValueError(f"List {list_id} is not a flag list")
        
        # Flag lists are dynamic - no sync needed
        # The get_watch_list_items method already handles dynamic flag lists
        logger.debug("Flag list %s is dynamic - no sync needed", list_id)
        return True










