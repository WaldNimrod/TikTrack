"""
API Routes for Watch Lists Management - TikTrack
================================================

This module contains all API endpoints for managing watch lists in the system.
Includes CRUD operations for watch lists and watch list items.

Endpoints:
    GET /api/watch-lists - Get all watch lists for user
    POST /api/watch-lists - Create new watch list
    GET /api/watch-lists/<id> - Get watch list by ID
    PUT /api/watch-lists/<id> - Update watch list
    DELETE /api/watch-lists/<id> - Delete watch list
    GET /api/watch-lists/<id>/items - Get items in watch list
    POST /api/watch-lists/<id>/items - Add ticker to watch list
    PUT /api/watch-lists/items/<item_id> - Update watch list item
    DELETE /api/watch-lists/items/<item_id> - Remove item from watch list
    POST /api/watch-lists/<id>/items/reorder - Update item order

Author: TikTrack Development Team
Version: 1.0.0
Date: January 2025
"""

from flask import Blueprint, jsonify, request, g
from sqlalchemy.orm import Session
from services.watch_list_service import WatchListService
from services.date_normalization_service import DateNormalizationService
from services.preferences_service import PreferencesService
from services.user_service import UserService
from .base_entity_decorators import api_endpoint, handle_database_session, validate_request
from .base_entity_utils import BaseEntityUtils
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

watch_lists_bp = Blueprint('watch_lists', __name__, url_prefix='/api/watch-lists')

# Initialize services
preferences_service = PreferencesService()
user_service = UserService()


def _resolve_user_id() -> int:
    """
    Return active user id from Flask context (set by auth middleware).
    Falls back to default user if not authenticated (for backward compatibility).
    """
    # Primary: Get from Flask context (set by auth middleware)
    user_id = getattr(g, 'user_id', None)
    if user_id is not None:
        return user_id
    
    # Fallback: Check query parameter
    user_id = request.args.get('user_id', type=int)
    if user_id is not None:
        return user_id
    
    # Fallback: Default user (for backward compatibility and tools)
    default_user = user_service.get_default_user()
    return default_user["id"] if default_user else 1


def _get_watch_lists_normalizer() -> DateNormalizationService:
    """Resolve timezone and create a DateNormalizationService for watch lists endpoints."""
    try:
        timezone_name = DateNormalizationService.resolve_timezone(
            request,
            preferences_service=preferences_service
        )
        return DateNormalizationService(timezone_name)
    except Exception as e:
        logger.warning(f"Failed to resolve timezone for watch lists, using UTC: {str(e)}")
        return DateNormalizationService("UTC")


@watch_lists_bp.route('/', methods=['GET'], endpoint='get_watch_lists')
@handle_database_session()
@api_endpoint(cache_ttl=60, rate_limit=60)
def get_watch_lists():
    """
    Get all watch lists for the current user.
    
    Returns:
        JSON response with list of watch lists
    """
    db: Session = g.db
    user_id = _resolve_user_id()
    
    try:
        normalizer = _get_watch_lists_normalizer()
        lists = WatchListService.get_watch_lists(db, user_id)
        
        # Convert to dict and normalize dates
        lists_data = [list_obj.to_dict() for list_obj in lists]
        lists_data = normalizer.normalize_output(lists_data)
        
        return jsonify({
            "status": "success",
            "data": lists_data,
            "count": len(lists_data),
            "timestamp": normalizer.now_envelope(),
            "version": "1.0"
        }), 200
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        logger.error(f"Error getting watch lists: {str(e)}\nTraceback:\n{error_trace}")
        return jsonify({
            "status": "error",
            "error": {"message": f"Failed to retrieve watch lists: {str(e)}"},
            "version": "1.0"
        }), 500


@watch_lists_bp.route('/', methods=['POST'], endpoint='create_watch_list')
@handle_database_session()
def create_watch_list():
    """
    Create a new watch list.
    
    Request Body:
        {
            "name": "Tech Stocks",
            "icon": "chart-line",
            "color_hex": "#26baac",
            "view_mode": "table",
            "default_sort_column": "symbol",
            "default_sort_direction": "asc"
        }
    
    Returns:
        JSON response with created watch list
    """
    db: Session = g.db
    user_id = _resolve_user_id()
    data = request.get_json() or {}
    
    try:
        normalizer = _get_watch_lists_normalizer()
        
        # Validate required fields
        if 'name' not in data or not data['name']:
            return jsonify({
                "status": "error",
                "error": {"message": "List name is required"},
                "version": "1.0"
            }), 400
        
        # Create watch list
        watch_list = WatchListService.create_watch_list(
            db=db,
            user_id=user_id,
            name=data['name'],
            icon=data.get('icon'),
            color_hex=data.get('color_hex'),
            view_mode=data.get('view_mode', 'table'),
            default_sort_column=data.get('default_sort_column'),
            default_sort_direction=data.get('default_sort_direction', 'asc')
        )
        
        # Convert to dict and normalize dates
        list_data = watch_list.to_dict()
        list_data = normalizer.normalize_output([list_data])[0]
        
        return jsonify({
            "status": "success",
            "data": list_data,
            "message": "Watch list created successfully",
            "timestamp": normalizer.now_envelope(),
            "version": "1.0"
        }), 201
    except ValueError as e:
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "1.0"
        }), 400
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        logger.error(f"Error creating watch list: {str(e)}\nTraceback:\n{error_trace}")
        return jsonify({
            "status": "error",
            "error": {"message": f"Failed to create watch list: {str(e)}"},
            "version": "1.0"
        }), 500


@watch_lists_bp.route('/<int:list_id>', methods=['GET'], endpoint='get_watch_list')
@handle_database_session()
@api_endpoint(cache_ttl=60, rate_limit=60)
def get_watch_list(list_id: int):
    """
    Get a specific watch list by ID.
    
    Args:
        list_id: Watch list ID
    
    Returns:
        JSON response with watch list data
    """
    db: Session = g.db
    user_id = _resolve_user_id()
    
    try:
        normalizer = _get_watch_lists_normalizer()
        watch_list = WatchListService.get_watch_list_by_id(db, list_id, user_id)
        
        if not watch_list:
            return jsonify({
                "status": "error",
                "error": {"message": f"Watch list {list_id} not found"},
                "version": "1.0"
            }), 404
        
        # Convert to dict and normalize dates
        list_data = watch_list.to_dict()
        list_data = normalizer.normalize_output([list_data])[0]
        
        return jsonify({
            "status": "success",
            "data": list_data,
            "timestamp": normalizer.now_envelope(),
            "version": "1.0"
        }), 200
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        logger.error(f"Error getting watch list {list_id}: {str(e)}\nTraceback:\n{error_trace}")
        return jsonify({
            "status": "error",
            "error": {"message": f"Failed to retrieve watch list: {str(e)}"},
            "version": "1.0"
        }), 500


@watch_lists_bp.route('/<int:list_id>', methods=['PUT'], endpoint='update_watch_list')
@handle_database_session()
def update_watch_list(list_id: int):
    """
    Update an existing watch list.
    
    Args:
        list_id: Watch list ID
    
    Request Body:
        {
            "name": "Updated Name",
            "icon": "star",
            "color_hex": "#fc5a06",
            "view_mode": "cards",
            ...
        }
    
    Returns:
        JSON response with updated watch list
    """
    db: Session = g.db
    user_id = _resolve_user_id()
    data = request.get_json() or {}
    
    try:
        normalizer = _get_watch_lists_normalizer()
        
        watch_list = WatchListService.update_watch_list(
            db=db,
            list_id=list_id,
            user_id=user_id,
            name=data.get('name'),
            icon=data.get('icon'),
            color_hex=data.get('color_hex'),
            display_order=data.get('display_order'),
            view_mode=data.get('view_mode'),
            default_sort_column=data.get('default_sort_column'),
            default_sort_direction=data.get('default_sort_direction')
        )
        
        if not watch_list:
            return jsonify({
                "status": "error",
                "error": {"message": f"Watch list {list_id} not found"},
                "version": "1.0"
            }), 404
        
        # Convert to dict and normalize dates
        list_data = watch_list.to_dict()
        list_data = normalizer.normalize_output([list_data])[0]
        
        return jsonify({
            "status": "success",
            "data": list_data,
            "message": "Watch list updated successfully",
            "timestamp": normalizer.now_envelope(),
            "version": "1.0"
        }), 200
    except ValueError as e:
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "1.0"
        }), 400
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        logger.error(f"Error updating watch list {list_id}: {str(e)}\nTraceback:\n{error_trace}")
        return jsonify({
            "status": "error",
            "error": {"message": f"Failed to update watch list: {str(e)}"},
            "version": "1.0"
        }), 500


@watch_lists_bp.route('/<int:list_id>', methods=['DELETE'], endpoint='delete_watch_list')
@handle_database_session()
def delete_watch_list(list_id: int):
    """
    Delete a watch list and all its items.
    
    Args:
        list_id: Watch list ID
    
    Returns:
        JSON response with success status
    """
    db: Session = g.db
    user_id = _resolve_user_id()
    
    try:
        normalizer = _get_watch_lists_normalizer()
        deleted = WatchListService.delete_watch_list(db, list_id, user_id)
        
        if not deleted:
            return jsonify({
                "status": "error",
                "error": {"message": f"Watch list {list_id} not found"},
                "version": "1.0"
            }), 404
        
        return jsonify({
            "status": "success",
            "message": "Watch list deleted successfully",
            "timestamp": normalizer.now_envelope(),
            "version": "1.0"
        }), 200
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        logger.error(f"Error deleting watch list {list_id}: {str(e)}\nTraceback:\n{error_trace}")
        return jsonify({
            "status": "error",
            "error": {"message": f"Failed to delete watch list: {str(e)}"},
            "version": "1.0"
        }), 500


@watch_lists_bp.route('/<int:list_id>/items', methods=['GET'], endpoint='get_watch_list_items')
@handle_database_session()
@api_endpoint(cache_ttl=30, rate_limit=60)
def get_watch_list_items(list_id: int):
    """
    Get all items in a watch list.
    
    Args:
        list_id: Watch list ID
    
    Returns:
        JSON response with list of items
    """
    db: Session = g.db
    user_id = _resolve_user_id()
    
    try:
        normalizer = _get_watch_lists_normalizer()
        items = WatchListService.get_watch_list_items(db, list_id, user_id)
        
        # Convert to dict and normalize dates
        items_data = [item.to_dict() for item in items]
        items_data = normalizer.normalize_output(items_data)
        
        return jsonify({
            "status": "success",
            "data": items_data,
            "count": len(items_data),
            "timestamp": normalizer.now_envelope(),
            "version": "1.0"
        }), 200
    except ValueError as e:
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "1.0"
        }), 400
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        logger.error(f"Error getting watch list items: {str(e)}\nTraceback:\n{error_trace}")
        return jsonify({
            "status": "error",
            "error": {"message": f"Failed to retrieve watch list items: {str(e)}"},
            "version": "1.0"
        }), 500


@watch_lists_bp.route('/<int:list_id>/items', methods=['POST'], endpoint='add_ticker_to_list')
@handle_database_session()
def add_ticker_to_list(list_id: int):
    """
    Add a ticker to a watch list.
    
    Args:
        list_id: Watch list ID
    
    Request Body:
        {
            "ticker_id": 5,  // OR
            "external_symbol": "AAPL",
            "external_name": "Apple Inc.",
            "flag_color": "#26baac",
            "notes": "Tech stock to watch"
        }
    
    Returns:
        JSON response with created item
    """
    db: Session = g.db
    user_id = _resolve_user_id()
    data = request.get_json() or {}
    
    try:
        normalizer = _get_watch_lists_normalizer()
        
        item = WatchListService.add_ticker_to_list(
            db=db,
            list_id=list_id,
            user_id=user_id,
            ticker_id=data.get('ticker_id'),
            external_symbol=data.get('external_symbol'),
            external_name=data.get('external_name'),
            flag_color=data.get('flag_color'),
            notes=data.get('notes')
        )
        
        # Convert to dict and normalize dates
        item_data = item.to_dict()
        item_data = normalizer.normalize_output([item_data])[0]
        
        return jsonify({
            "status": "success",
            "data": item_data,
            "message": "Ticker added to watch list successfully",
            "timestamp": normalizer.now_envelope(),
            "version": "1.0"
        }), 201
    except ValueError as e:
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "1.0"
        }), 400
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        logger.error(f"Error adding ticker to watch list: {str(e)}\nTraceback:\n{error_trace}")
        return jsonify({
            "status": "error",
            "error": {"message": f"Failed to add ticker to watch list: {str(e)}"},
            "version": "1.0"
        }), 500


@watch_lists_bp.route('/items/<int:item_id>', methods=['PUT'], endpoint='update_watch_list_item')
@handle_database_session()
def update_watch_list_item(item_id: int):
    """
    Update a watch list item.
    
    Args:
        item_id: Watch list item ID
    
    Request Body:
        {
            "flag_color": "#26baac",
            "display_order": 2,
            "notes": "Updated notes"
        }
    
    Returns:
        JSON response with updated item
    """
    db: Session = g.db
    user_id = _resolve_user_id()
    data = request.get_json() or {}
    
    try:
        normalizer = _get_watch_lists_normalizer()
        
        item = WatchListService.update_item(
            db=db,
            item_id=item_id,
            user_id=user_id,
            flag_color=data.get('flag_color'),
            display_order=data.get('display_order'),
            notes=data.get('notes')
        )
        
        if not item:
            return jsonify({
                "status": "error",
                "error": {"message": f"Watch list item {item_id} not found"},
                "version": "1.0"
            }), 404
        
        # Convert to dict and normalize dates
        item_data = item.to_dict()
        item_data = normalizer.normalize_output([item_data])[0]
        
        return jsonify({
            "status": "success",
            "data": item_data,
            "message": "Watch list item updated successfully",
            "timestamp": normalizer.now_envelope(),
            "version": "1.0"
        }), 200
    except ValueError as e:
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "1.0"
        }), 400
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        logger.error(f"Error updating watch list item {item_id}: {str(e)}\nTraceback:\n{error_trace}")
        return jsonify({
            "status": "error",
            "error": {"message": f"Failed to update watch list item: {str(e)}"},
            "version": "1.0"
        }), 500


@watch_lists_bp.route('/items/<int:item_id>', methods=['DELETE'], endpoint='remove_ticker_from_list')
@handle_database_session()
def remove_ticker_from_list(item_id: int):
    """
    Remove a ticker from a watch list.
    
    Args:
        item_id: Watch list item ID
    
    Returns:
        JSON response with success status
    """
    db: Session = g.db
    user_id = _resolve_user_id()
    
    try:
        normalizer = _get_watch_lists_normalizer()
        deleted = WatchListService.remove_ticker_from_list(db, item_id, user_id)
        
        if not deleted:
            return jsonify({
                "status": "error",
                "error": {"message": f"Watch list item {item_id} not found"},
                "version": "1.0"
            }), 404
        
        return jsonify({
            "status": "success",
            "message": "Ticker removed from watch list successfully",
            "timestamp": normalizer.now_envelope(),
            "version": "1.0"
        }), 200
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        logger.error(f"Error removing ticker from watch list: {str(e)}\nTraceback:\n{error_trace}")
        return jsonify({
            "status": "error",
            "error": {"message": f"Failed to remove ticker from watch list: {str(e)}"},
            "version": "1.0"
        }), 500


@watch_lists_bp.route('/<int:list_id>/items/reorder', methods=['POST'], endpoint='reorder_items')
@handle_database_session()
def reorder_items(list_id: int):
    """
    Update display order of items in a watch list.
    
    Args:
        list_id: Watch list ID
    
    Request Body:
        {
            "items": [
                {"id": 1, "display_order": 0},
                {"id": 2, "display_order": 1},
                ...
            ]
        }
    
    Returns:
        JSON response with success status
    """
    db: Session = g.db
    user_id = _resolve_user_id()
    data = request.get_json() or {}
    
    try:
        normalizer = _get_watch_lists_normalizer()
        
        items_order = data.get('items', [])
        if not items_order:
            return jsonify({
                "status": "error",
                "error": {"message": "items array is required"},
                "version": "1.0"
            }), 400
        
        WatchListService.update_item_order(db, list_id, user_id, items_order)
        
        return jsonify({
            "status": "success",
            "message": "Item order updated successfully",
            "timestamp": normalizer.now_envelope(),
            "version": "1.0"
        }), 200
    except ValueError as e:
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "1.0"
        }), 400
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        logger.error(f"Error reordering items: {str(e)}\nTraceback:\n{error_trace}")
        return jsonify({
            "status": "error",
            "error": {"message": f"Failed to reorder items: {str(e)}"},
            "version": "1.0"
        }), 500


@watch_lists_bp.route('/flags/<color>', methods=['GET'], endpoint='get_flagged_tickers')
@handle_database_session()
@api_endpoint(cache_ttl=60, rate_limit=60)
def get_flagged_tickers(color: str):
    """
    Get all tickers with a specific flag color across all user's watch lists.
    
    Args:
        color: Flag color in hex format (e.g., '#26baac')
    
    Returns:
        JSON response with list of flagged items
    """
    db: Session = g.db
    user_id = _resolve_user_id()
    
    try:
        normalizer = _get_watch_lists_normalizer()
        
        # Get all watch lists for user
        watch_lists = WatchListService.get_watch_lists(db, user_id)
        list_ids = [wl.id for wl in watch_lists]
        
        if not list_ids:
            return jsonify({
                "status": "success",
                "data": [],
                "count": 0,
                "timestamp": normalizer.now_envelope(),
                "version": "1.0"
            }), 200
        
        # Get all items with the specified flag color from user's lists
        from models.watch_list import WatchListItem
        items = (
            db.query(WatchListItem)
            .filter(
                WatchListItem.watch_list_id.in_(list_ids),
                WatchListItem.flag_color == color
            )
            .order_by(WatchListItem.display_order.asc())
            .all()
        )
        
        # Convert to dict and add watch list name
        items_data = []
        for item in items:
            item_dict = item.to_dict()
            # Add watch list name
            watch_list = next((wl for wl in watch_lists if wl.id == item.watch_list_id), None)
            if watch_list:
                item_dict['watch_list_name'] = watch_list.name
            items_data.append(item_dict)
        
        items_data = normalizer.normalize_output(items_data)
        
        return jsonify({
            "status": "success",
            "data": items_data,
            "count": len(items_data),
            "timestamp": normalizer.now_envelope(),
            "version": "1.0"
        }), 200
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        logger.error(f"Error getting flagged tickers: {str(e)}\nTraceback:\n{error_trace}")
        return jsonify({
            "status": "error",
            "error": {"message": f"Failed to retrieve flagged tickers: {str(e)}"},
            "version": "1.0"
        }), 500


@watch_lists_bp.route('/flag-lists/sync', methods=['POST'], endpoint='sync_flag_lists')
@handle_database_session()
def sync_flag_lists():
    """
    Sync all flag lists for the current user.
    Creates flag lists if they don't exist and syncs their items.
    
    Returns:
        JSON response with sync status
    """
    db: Session = g.db
    user_id = _resolve_user_id()
    
    try:
        normalizer = _get_watch_lists_normalizer()
        
        # Get all 8 flag colors
        flag_colors = [
            '#26baac',  # Trade
            '#0056b3',  # Trade Plan
            '#28a745',  # Account
            '#20c997',  # Cash Flow
            '#dc3545',  # Ticker
            '#fc5a06',  # Alert
            '#6f42c1',  # Note
            '#17a2b8'   # Execution
        ]
        
        synced_lists = []
        
        # Get or create flag lists and sync them
        for flag_color in flag_colors:
            flag_list = WatchListService.get_or_create_flag_list(db, user_id, flag_color)
            WatchListService.sync_flag_list_items(db, flag_list.id, user_id)
            synced_lists.append(flag_list.to_dict())
        
        # Normalize dates
        synced_lists = normalizer.normalize_output(synced_lists)
        
        return jsonify({
            "status": "success",
            "data": synced_lists,
            "count": len(synced_lists),
            "message": "Flag lists synced successfully",
            "timestamp": normalizer.now_envelope(),
            "version": "1.0"
        }), 200
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        logger.error(f"Error syncing flag lists: {str(e)}\nTraceback:\n{error_trace}")
        return jsonify({
            "status": "error",
            "error": {"message": f"Failed to sync flag lists: {str(e)}"},
            "version": "1.0"
        }), 500


@watch_lists_bp.route('/flag-lists/<color>/sync', methods=['POST'], endpoint='sync_single_flag_list')
@handle_database_session()
def sync_single_flag_list(color: str):
    """
    Sync a single flag list for a specific flag color.
    
    Args:
        color: Flag color in hex format (e.g., '#26baac')
    
    Returns:
        JSON response with sync status
    """
    db: Session = g.db
    user_id = _resolve_user_id()
    
    try:
        normalizer = _get_watch_lists_normalizer()
        
        # Get or create flag list
        flag_list = WatchListService.get_or_create_flag_list(db, user_id, color)
        
        # Sync items
        WatchListService.sync_flag_list_items(db, flag_list.id, user_id)
        
        # Get updated list data
        list_data = flag_list.to_dict()
        list_data = normalizer.normalize_output([list_data])[0]
        
        return jsonify({
            "status": "success",
            "data": list_data,
            "message": "Flag list synced successfully",
            "timestamp": normalizer.now_envelope(),
            "version": "1.0"
        }), 200
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        logger.error(f"Error syncing flag list {color}: {str(e)}\nTraceback:\n{error_trace}")
        return jsonify({
            "status": "error",
            "error": {"message": f"Failed to sync flag list: {str(e)}"},
            "version": "1.0"
        }), 500

