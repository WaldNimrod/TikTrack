"""
Linked Items API - TikTrack Backend
====================================

This module provides API endpoints for retrieving linked items (parent and child entities)
for any entity in the system.

Features:
- Get child entities (entities that reference this entity)
- Get parent entities (entities that this entity references)
- Support for all entity types: trades, accounts, tickers, alerts, etc.
- Comprehensive relationship mapping
- SQLite-specific optimizations with proper type handling

Database Schema:
- Uses related_type_id (integer) instead of related_type (string)
- Entity type mappings: 1=account, 2=trade, 3=trade_plan, 4=ticker, 5=alert, 6=cash_flow, 7=execution
- Proper foreign key relationships with related_item_id

API Endpoints:
- GET /api/linked-items/<entity_type>/<entity_id>
  Returns: {child_entities: [], parent_entities: [], total_counts}

Author: Tik.track Development Team
Last Updated: August 26, 2025
Version: 2.0

Recent Updates:
- Fixed SQLite compatibility (CONCAT -> ||)
- Updated to use related_type_id instead of related_type
- Enhanced error handling and logging
- Improved performance with optimized queries
"""

from flask import Blueprint, jsonify, request, g
from typing import Dict, List, Any, Optional
from services.advanced_cache_service import cache_for, invalidate_cache
from services.currency_service import CurrencyService
from services.entity_details_service import EntityDetailsService
import logging

# Import base classes
from .base_entity import BaseEntityAPI
from .base_entity_decorators import api_endpoint, handle_database_session, validate_request
from .base_entity_utils import BaseEntityUtils

# Setup logging
logger = logging.getLogger(__name__)

# Create blueprint
linked_items_bp = Blueprint('linked_items', __name__, url_prefix='/api/linked-items')

# Initialize base API (linked_items is complex, so we'll use it selectively)

def get_db_connection():
    """Get database connection - uses production DB path from config"""
    import sqlite3
    from config.settings import DB_PATH  # Use production DB path
    
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

@linked_items_bp.route('/types', methods=['GET'])
@cache_for(ttl=600)  # Cache for 10 minutes - entity types don't change
def get_entity_types():
    """Get all available entity types and their mappings"""
    try:
        entity_types = {
            'trading_account': {
                'id': 1,
                'name': 'TradingAccount',
                'description': 'Trading accounts',
                'can_have_children': True,
                'can_have_parents': False
            },
            'trade': {
                'id': 2,
                'name': 'Trade',
                'description': 'Individual trades',
                'can_have_children': True,
                'can_have_parents': True
            },
            'trade_plan': {
                'id': 3,
                'name': 'Trade Plan',
                'description': 'Trading strategies and plans',
                'can_have_children': True,
                'can_have_parents': False
            },
            'ticker': {
                'id': 4,
                'name': 'Ticker',
                'description': 'Stock symbols and instruments',
                'can_have_children': True,
                'can_have_parents': False
            },
            'alert': {
                'id': 5,
                'name': 'Alert',
                'description': 'Trading alerts and notifications',
                'can_have_children': True,
                'can_have_parents': True
            },
            'cash_flow': {
                'id': 6,
                'name': 'Cash Flow',
                'description': 'Money movements and transactions',
                'can_have_children': True,
                'can_have_parents': True
            },
            'execution': {
                'id': 7,
                'name': 'Execution',
                'description': 'Trade executions and fills',
                'can_have_children': True,
                'can_have_parents': True
            },
            'note': {
                'id': 8,
                'name': 'Note',
                'description': 'General notes and comments',
                'can_have_children': True,
                'can_have_parents': True
            }
        }
        
        return jsonify({
            'status': 'success',
            'data': {
                'entity_types': entity_types,
                'total_types': len(entity_types),
                'timestamp': '2025-09-01T23:18:00.000000'
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting entity types: {str(e)}")
        return jsonify({'error': f'Failed to get entity types: {str(e)}'}), 500


@linked_items_bp.route('/<entity_type>/<entity_id>', methods=['GET'])
@api_endpoint(cache_ttl=60, rate_limit=60)
@handle_database_session()
def get_linked_items(entity_type: str, entity_id: str) -> Dict[str, Any]:
    """
    Get linked items for a specific entity using the new schema-based resolver
    
    Uses EntityDetailsService.get_linked_items which uses EntityRelationshipResolver
    based on the centralized schema configuration.
    
    Args:
        entity_type: Type of entity (trade, account, ticker, alert, etc.)
        entity_id: ID of the entity
        
    Returns:
        Dictionary with child_entities and parent_entities lists
        (separated from unified linked_items array based on schema)
    """
    try:
        entity_id_normalized, context = normalize_entity_identifier(entity_type, entity_id)
        logger.info(f"Getting linked items for {entity_type} {entity_id_normalized} using schema-based resolver")
        
        # Use SQLAlchemy session from Flask g context
        db_session = getattr(g, 'db', None)
        if not db_session:
            # Fallback: try to get from get_db() if available
            try:
                from config.database import get_db
                db_session = next(get_db())
            except Exception:
                logger.error("No database session available")
                return jsonify({'error': 'Database session not available'}), 500
        
        # Use new schema-based resolver via EntityDetailsService
        linked_items = EntityDetailsService.get_linked_items(db_session, entity_type, entity_id_normalized)
        
        # Separate into children and parents based on schema
        from services.entity_relationship_schema import ENTITY_RELATIONSHIPS
        
        child_entities = []
        parent_entities = []
        
        if entity_type in ENTITY_RELATIONSHIPS:
            entity_schema = ENTITY_RELATIONSHIPS[entity_type]
            
            # Get list of child types from schema
            child_types = set()
            if 'children' in entity_schema:
                child_types = set(entity_schema['children'].keys())
            
            # Get list of parent types from schema
            parent_types = set()
            if 'parents' in entity_schema:
                parent_types = set(entity_schema['parents'].keys())
            
            # Separate linked items
            for item in linked_items:
                item_type = item.get('type')
                if item_type in child_types:
                    child_entities.append(item)
                elif item_type in parent_types:
                    parent_entities.append(item)
                else:
                    # If not in schema, assume it's a child (for backward compatibility)
                    logger.warning(f"Linked item type {item_type} not found in schema for {entity_type}, treating as child")
                    child_entities.append(item)
        
        else:
            # Fallback: if schema not found, treat all as children (backward compatibility)
            logger.warning(f"Schema not found for {entity_type}, treating all linked items as children")
            child_entities = linked_items
        
        # Get entity details for display (using old method for now)
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            entity_details = get_entity_details(cursor, entity_type, entity_id_normalized, context)
            conn.close()
        except Exception as e:
            logger.warning(f"Could not get entity details: {e}")
            entity_details = {}
        
        result = {
            'entity_type': entity_type,
            'entity_id': context.get('composite_id', entity_id_normalized),
            'child_entities': child_entities,
            'parent_entities': parent_entities,
            'total_child_count': len(child_entities),
            'total_parent_count': len(parent_entities),
            'entity_details': entity_details
        }
        
        logger.info(f"Found {len(child_entities)} child entities and {len(parent_entities)} parent entities using schema-based resolver")
        
        return jsonify(result), 200
        
    except ValueError as ve:
        logger.error(f"Validation error for linked items {entity_type} {entity_id}: {str(ve)}")
        return jsonify({'error': str(ve)}), 400
    except Exception as e:
        logger.error(f"Error getting linked items for {entity_type} {entity_id}: {str(e)}", exc_info=True)
        return jsonify({'error': f'Failed to get linked items: {str(e)}'}), 500


def normalize_entity_identifier(entity_type: str, raw_entity_id: str):
    """Normalize raw entity identifier based on entity type"""
    context: Dict[str, Any] = {}
    if entity_type == 'position':
        if not raw_entity_id or '-' not in raw_entity_id:
            raise ValueError("Position entity id must be in <account_id>-<ticker_id> format")
        account_part, ticker_part = raw_entity_id.split('-', 1)
        try:
            trading_account_id = int(account_part)
            ticker_id = int(ticker_part)
        except ValueError:
            raise ValueError("Position entity id parts must be integers")
        context.update({
            'trading_account_id': trading_account_id,
            'ticker_id': ticker_id,
            'composite_id': f"{trading_account_id}-{ticker_id}"
        })
        return (trading_account_id, ticker_id), context
    
    try:
        entity_id_int = int(raw_entity_id)
    except (TypeError, ValueError):
        raise ValueError(f"Entity id for {entity_type} must be numeric")
    return entity_id_int, context

def get_child_entities(cursor, entity_type: str, entity_id: Any, context: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
    """
    Get child entities that reference this entity
    
    Args:
        cursor: Database cursor
        entity_type: Type of parent entity
        entity_id: ID of parent entity
        
    Returns:
        List of child entity dictionaries
    """
    child_entities = []
    
    try:
        if entity_type == 'trade':
            # Trades can have executions, notes, alerts
            child_entities.extend(get_trade_child_entities(cursor, entity_id))
            
        elif entity_type == 'trading_account':
            # Prefer the SQLAlchemy service to avoid duplicated logic and missing schema columns
            db_session = getattr(g, 'db', None)
            if db_session is not None:
                child_entities.extend(EntityDetailsService._get_account_linked_items(db_session, entity_id))
            else:
                child_entities.extend(get_account_child_entities(cursor, entity_id))
        elif entity_type == 'position':
            if not context:
                raise ValueError("Context required for position entity type")
            child_entities.extend(get_position_child_entities(
                cursor,
                context['trading_account_id'],
                context['ticker_id']
            ))
        elif entity_type == 'account':
            # DEPRECATED - use trading_account instead!
            raise ValueError(f"❌ DEPRECATED: 'account' entity type is no longer supported. Use 'trading_account' instead!")
            
        elif entity_type == 'ticker':
            # Tickers can have trades, trade_plans, alerts, notes
            child_entities.extend(get_ticker_child_entities(cursor, entity_id))
            
        elif entity_type == 'alert':
            # Alerts can have notes
            child_entities.extend(get_alert_child_entities(cursor, entity_id))
            
        elif entity_type == 'trade_plan':
            # Trade plans can have trades, notes
            child_entities.extend(get_trade_plan_child_entities(cursor, entity_id))
            
        elif entity_type == 'cash_flow':
            # Cash flows can have notes
            child_entities.extend(get_cash_flow_child_entities(cursor, entity_id))
            
        elif entity_type == 'note':
            # Notes can have other notes (replies)
            child_entities.extend(get_note_child_entities(cursor, entity_id))
            
        elif entity_type == 'execution':
            # Executions can have notes
            child_entities.extend(get_execution_child_entities(cursor, entity_id))
            
    except Exception as e:
        logger.error(f"Error getting child entities for {entity_type} {entity_id}: {str(e)}")
    
    return child_entities

def get_entity_details(cursor, entity_type: str, entity_id: Any, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Get entity details for display in linked items modal
    
    Args:
        cursor: Database cursor
        entity_type: Type of entity
        entity_id: ID of entity
        
    Returns:
        Dictionary with entity details
    """
    try:
        if entity_type == 'trade_plan':
            cursor.execute("""
                SELECT tp.id, tp.created_at, t.symbol as ticker_symbol
                FROM trade_plans tp
                LEFT JOIN tickers t ON tp.ticker_id = t.id
                WHERE tp.id = ?
            """, (entity_id,))
            row = cursor.fetchone()
            if row:
                return {
                    'id': row['id'],
                    'created_at': row['created_at'],
                    'ticker_symbol': row['ticker_symbol']
                }
        elif entity_type == 'trade':
            cursor.execute("""
                SELECT t.id, t.created_at, tk.symbol as ticker_symbol
                FROM trades t
                LEFT JOIN tickers tk ON t.ticker_id = tk.id
                WHERE t.id = ?
            """, (entity_id,))
            row = cursor.fetchone()
            if row:
                return {
                    'id': row['id'],
                    'created_at': row['created_at'],
                    'ticker_symbol': row['ticker_symbol']
                }
        elif entity_type == 'ticker':
            cursor.execute("""
                SELECT t.id, t.symbol
                FROM tickers t
                WHERE t.id = ?
            """, (entity_id,))
            row = cursor.fetchone()
            if row:
                return {
                    'id': row['id'],
                    'symbol': row['symbol']
                }
        elif entity_type == 'trading_account':
            cursor.execute("""
                SELECT id, name, currency_name, created_at
                FROM trading_accounts
                WHERE id = ?
            """, (entity_id,))
            row = cursor.fetchone()
            if row:
                return {
                    'id': row['id'],
                    'name': row['name'],
                    'currency_name': row['currency_name'],
                    'created_at': row['created_at'],
                    'accountName': row['name']
                }
        elif entity_type == 'position':
            if not context:
                raise ValueError("Context required for position entity type")
            cursor.execute("""
                SELECT name, currency_name
                FROM trading_accounts
                WHERE id = ?
            """, (context['trading_account_id'],))
            account_row = cursor.fetchone()
            cursor.execute("""
                SELECT symbol, name
                FROM tickers
                WHERE id = ?
            """, (context['ticker_id'],))
            ticker_row = cursor.fetchone()
            return {
                'id': context['composite_id'],
                'trading_account_id': context['trading_account_id'],
                'ticker_id': context['ticker_id'],
                'account_name': account_row['name'] if account_row else None,
                'account_currency': account_row['currency_name'] if account_row else None,
                'ticker_symbol': ticker_row['symbol'] if ticker_row else None,
                'ticker_name': ticker_row['name'] if ticker_row else None
            }
        elif entity_type == 'account':
            # DEPRECATED - use trading_account instead!
            raise ValueError(f"❌ DEPRECATED: 'account' entity type is no longer supported. Use 'trading_account' instead!")
        # Add more entity types as needed
        
    except Exception as e:
        logger.error(f"Error getting entity details for {entity_type} {entity_id}: {str(e)}")
    
    return {}

def get_parent_entities(cursor, entity_type: str, entity_id: Any, context: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
    """
    Get parent entities that this entity references
    
    Args:
        cursor: Database cursor
        entity_type: Type of child entity
        entity_id: ID of child entity
        
    Returns:
        List of parent entity dictionaries
    """
    parent_entities = []
    
    try:
        if entity_type == 'trade':
            # Trades reference accounts, tickers, trade_plans
            parent_entities.extend(get_trade_parent_entities(cursor, entity_id))
            
        elif entity_type == 'execution':
            # Executions reference trades
            parent_entities.extend(get_execution_parent_entities(cursor, entity_id))
            
        elif entity_type == 'cash_flow':
            # Cash flows can reference trades
            parent_entities.extend(get_cash_flow_parent_entities(cursor, entity_id))
            
        elif entity_type == 'note':
            # Notes can reference any entity
            parent_entities.extend(get_note_parent_entities(cursor, entity_id))
            
        elif entity_type == 'alert':
            # Alerts can reference any entity
            parent_entities.extend(get_alert_parent_entities(cursor, entity_id))
        elif entity_type == 'position':
            if not context:
                raise ValueError("Context required for position entity type")
            parent_entities.extend(get_position_parent_entities(
                cursor,
                context['trading_account_id'],
                context['ticker_id']
            ))
            
    except Exception as e:
        logger.error(f"Error getting parent entities for {entity_type} {entity_id}: {str(e)}")
    
    return parent_entities

# Trade child entities
def get_trade_child_entities(cursor, trade_id: int) -> List[Dict[str, Any]]:
    """Get child entities for a trade"""
    children = []
    
    # Get executions
    cursor.execute("""
        SELECT id, 'execution' as type, 'ביצוע' as title, 
               'ביצוע ' || action || ' ' || quantity || ' יחידות' as description,
               created_at, 'active' as status
        FROM executions 
        WHERE trade_id = ?
    """, (trade_id,))
    
    for row in cursor.fetchall():
        children.append({
            'id': row[0],
            'type': row[1],
            'title': row[2],
            'description': row[3],
            'created_at': row[4],
            'status': row[5]
        })
    
    # Get cash flows linked to this trade
    cursor.execute("""
        SELECT cf.id,
               'cash_flow' AS type,
               CASE 
                   WHEN cf.type = 'deposit' THEN 'הפקדה'
                   WHEN cf.type = 'withdrawal' THEN 'משיכה'
                   WHEN cf.type = 'transfer_in' THEN 'העברה פנימה'
                   WHEN cf.type = 'transfer_out' THEN 'העברה החוצה'
                   WHEN cf.type = 'fee' THEN 'עמלה'
                   WHEN cf.type = 'dividend' THEN 'דיבידנד'
                   WHEN cf.type = 'other_positive' THEN 'אחר חיובי'
                   WHEN cf.type = 'other_negative' THEN 'אחר שלילי'
                   ELSE cf.type
               END AS title,
               cf.date AS created_at,
               cf.amount AS amount,
               'active' AS status,
               c.symbol AS currency_symbol
        FROM cash_flows cf
        LEFT JOIN currencies c ON cf.currency_id = c.id
        WHERE cf.trade_id = ?
    """, (trade_id,))

    for row in cursor.fetchall():
        currency_code = row['currency_symbol']
        currency_display = CurrencyService.get_display_symbol(currency_code)
        amount_value = row['amount']
        description = row['title']
        if amount_value is not None:
            description = f"{description} - {currency_display or currency_code or ''} {amount_value}"
        children.append({
            'id': row['id'],
            'type': row['type'],
            'title': row['title'],
            'description': description.strip(),
            'created_at': row['created_at'],
            'status': row['status']
        })
    
    # Get notes
    cursor.execute("""
        SELECT n.id, 'note' as type, 'הערה' as title, 
               substr(n.content, 1, 100) as description,
               n.created_at, 'active' as status
        FROM notes n
        WHERE n.related_type_id = 2 AND n.related_id = ?
    """, (trade_id,))
    
    for row in cursor.fetchall():
        children.append({
            'id': row[0],
            'type': row[1],
            'title': row[2],
            'description': row[3] + ('...' if len(row[3]) == 100 else ''),
            'created_at': row[4],
            'status': row[5]
        })
    
    # Get alerts
    cursor.execute("""
        SELECT id, 'alert' as type, 'התראה' as title, 
               'התראה: ' || message as description,
               created_at, status
        FROM alerts 
        WHERE related_type_id = 2 AND related_id = ?
    """, (trade_id,))
    
    for row in cursor.fetchall():
        children.append({
            'id': row[0],
            'type': row[1],
            'title': row[2],
            'description': row[3],
            'created_at': row[4],
            'status': row[5]
        })
    
    return children

# TradingAccount child entities
def get_account_child_entities(cursor, trading_account_id: int) -> List[Dict[str, Any]]:
    """Get child entities for an account"""
    children = []
    
    # Get trades
    cursor.execute("""
        SELECT t.id,
               'trade' AS type,
               'טרייד' AS title,
               'טרייד ' || COALESCE(t.side, '') || ' על ' || COALESCE(tk.symbol, '') AS description,
               t.created_at AS created_at,
               t.closed_at AS closed_at,
               t.status AS status,
               t.side AS side,
               t.investment_type AS investment_type
        FROM trades t
        LEFT JOIN tickers tk ON t.ticker_id = tk.id
        WHERE t.trading_account_id = ?
    """, (trading_account_id,))

    for row in cursor.fetchall():
        updated_at = row['closed_at'] or row['created_at']
        children.append({
            'id': row['id'],
            'type': row['type'],
            'title': row['title'],
            'description': row['description'],
            'created_at': row['created_at'],
            'updated_at': updated_at,
            'status': row['status'],
            'side': row['side'],
            'investment_type': row['investment_type']
        })

    # Get trade plans
    cursor.execute("""
        SELECT tp.id,
               'trade_plan' AS type,
               'תוכנית מסחר' AS title,
               'תוכנית ' || COALESCE(tp.side, '') || ' על ' || COALESCE(tk.symbol, '') AS description,
               tp.created_at AS created_at,
               tp.cancelled_at AS cancelled_at,
               tp.status AS status,
               tp.side AS side,
               tp.investment_type AS investment_type
        FROM trade_plans tp
        LEFT JOIN tickers tk ON tp.ticker_id = tk.id
        WHERE tp.trading_account_id = ?
    """, (trading_account_id,))

    for row in cursor.fetchall():
        updated_at = row['cancelled_at'] or row['created_at']
        children.append({
            'id': row['id'],
            'type': row['type'],
            'title': row['title'],
            'description': row['description'],
            'created_at': row['created_at'],
            'updated_at': updated_at,
            'status': row['status'],
            'side': row['side'],
            'investment_type': row['investment_type']
        })

    # Get executions directly linked to this account
    cursor.execute("""
        SELECT e.id,
               'execution' AS type,
               'ביצוע' AS title,
               'ביצוע ' || COALESCE(e.action, '') || ' ' || COALESCE(CAST(e.quantity AS TEXT), '') || ' יחידות' || 
               CASE WHEN tk.symbol IS NOT NULL THEN ' על ' || tk.symbol ELSE '' END AS description,
               e.date AS created_at,
               e.created_at AS updated_at,
               'active' AS status,
               e.action AS side
        FROM executions e
        LEFT JOIN tickers tk ON e.ticker_id = tk.id
        WHERE e.trading_account_id = ?
    """, (trading_account_id,))

    for row in cursor.fetchall():
        children.append({
            'id': row['id'],
            'type': row['type'],
            'title': row['title'],
            'description': row['description'],
            'created_at': row['created_at'],
            'updated_at': row['updated_at'],
            'status': row['status'],
            'side': row['side']
        })

    # Get notes
    cursor.execute("""
        SELECT n.id,
               'note' AS type,
               'הערה' AS title,
               substr(n.content, 1, 100) AS description,
               n.created_at AS created_at,
               NULL AS updated_at,
               'active' AS status
        FROM notes n
        WHERE n.related_type_id = 1 AND n.related_id = ?
    """, (trading_account_id,))

    for row in cursor.fetchall():
        description = row['description'] if row['description'] is not None else ''
        children.append({
            'id': row['id'],
            'type': row['type'],
            'title': row['title'],
            'description': description + ('...' if len(description) == 100 else ''),
            'created_at': row['created_at'],
            'status': row['status']
        })

    # Get alerts
    cursor.execute("""
        SELECT a.id,
               'alert' AS type,
               'התראה' AS title,
               'התראה: ' || COALESCE(a.message, '') AS description,
               a.created_at AS created_at,
               a.triggered_at AS triggered_at,
               a.status AS status
        FROM alerts a
        WHERE a.related_type_id = 1 AND a.related_id = ?
    """, (trading_account_id,))

    for row in cursor.fetchall():
        updated_at = row['triggered_at'] or row['created_at']
        children.append({
            'id': row['id'],
            'type': row['type'],
            'title': row['title'],
            'description': row['description'],
            'created_at': row['created_at'],
            'updated_at': updated_at,
            'status': row['status']
        })
 
    return children

# Ticker child entities
def get_ticker_child_entities(cursor, ticker_id: int) -> List[Dict[str, Any]]:
    """Get child entities for a ticker"""
    children = []
    logger.info(f"Getting child entities for ticker {ticker_id}")
    
    # Get trades (trades don't have updated_at - only created_at and closed_at)
    cursor.execute("""
        SELECT t.id, 'trade' as type, 'טרייד' as title,
               'טרייד ' || COALESCE(t.side, '') || ' - ' || COALESCE(t.investment_type, '') as description,
               t.created_at,
               t.closed_at,
               t.status,
               t.side,
               t.investment_type
        FROM trades t
        WHERE t.ticker_id = ?
    """, (ticker_id,))
    
    for row in cursor.fetchall():
        children.append({
            'id': row['id'],
            'type': row['type'],
            'title': row['title'],
            'description': row['description'],
            'created_at': row['created_at'],
            'status': row['status'],
            'side': row['side'],
            'investment_type': row['investment_type']
        })
    
    # Get trade plans (trade_plans don't have updated_at - only created_at and cancelled_at)
    cursor.execute("""
        SELECT tp.id, 'trade_plan' as type, 'תוכנית טרייד' as title,
               'תוכנית ' || COALESCE(tp.side, '') || ' - ' || COALESCE(tp.investment_type, '') as description,
               tp.created_at,
               tp.cancelled_at,
               tp.status,
               tp.side,
               tp.investment_type
        FROM trade_plans tp
        WHERE tp.ticker_id = ?
    """, (ticker_id,))
    
    for row in cursor.fetchall():
        children.append({
            'id': row['id'],
            'type': row['type'],
            'title': row['title'],
            'description': row['description'],
            'created_at': row['created_at'],
            'status': row['status'],
            'side': row['side'],
            'investment_type': row['investment_type']
        })
    
    # Get alerts (alerts don't have updated_at - only created_at and triggered_at)
    cursor.execute("""
        SELECT a.id, 'alert' as type, 'התראה' as title,
               'התראה: ' || COALESCE(a.message, '') as description,
               a.created_at,
               a.triggered_at,
               a.status
        FROM alerts a
        WHERE a.related_type_id = 4 AND a.related_id = ?
    """, (ticker_id,))
    
    for row in cursor.fetchall():
        children.append({
            'id': row['id'],
            'type': row['type'],
            'title': row['title'],
            'description': row['description'],
            'created_at': row['created_at'],
            'status': row['status']
        })
    
    # Get notes (notes don't have updated_at - only created_at)
    cursor.execute("""
        SELECT n.id, 'note' as type, 'הערה' as title,
               substr(COALESCE(n.content, ''), 1, 100) as description,
               n.created_at,
               'active' as status
        FROM notes n
        WHERE n.related_type_id = 4 AND n.related_id = ?
    """, (ticker_id,))
    
    for row in cursor.fetchall():
        description = row['description'] if row['description'] is not None else ''
        children.append({
            'id': row['id'],
            'type': row['type'],
            'title': row['title'],
            'description': description + ('...' if len(description) == 100 else ''),
            'created_at': row['created_at'],
            'status': row['status']
        })
    
    # Get executions directly linked to this ticker (not through trades)
    cursor.execute("""
        SELECT e.id, 'execution' as type, 'ביצוע' as title,
               'ביצוע ' || COALESCE(e.action, '') || ' ' || COALESCE(CAST(e.quantity AS TEXT), '') || ' יחידות' as description,
               e.date as created_at,
               e.created_at as updated_at,
               e.action,
               'active' as status
        FROM executions e
        WHERE e.ticker_id = ?
    """, (ticker_id,))
    
    for row in cursor.fetchall():
        children.append({
            'id': row['id'],
            'type': row['type'],
            'title': row['title'],
            'description': row['description'],
            'created_at': row['created_at'],
            'updated_at': row['updated_at'],
            'action': row['action'],
            'side': row['action'],
            'status': row['status']
        })
    
    # Get executions through trades (for backward compatibility)
    cursor.execute("""
        SELECT e.id, 'execution' as type, 'ביצוע' as title,
               'ביצוע ' || COALESCE(e.action, '') || ' ' || COALESCE(CAST(e.quantity AS TEXT), '') || ' יחידות' as description,
               e.created_at,
               e.action
        FROM executions e
        JOIN trades t ON e.trade_id = t.id
        WHERE t.ticker_id = ? AND e.ticker_id IS NULL
    """, (ticker_id,))
    
    for row in cursor.fetchall():
        # Check if this execution was already added (by ticker_id)
        if not any(child['id'] == row['id'] for child in children):
            children.append({
                'id': row['id'],
                'type': row['type'],
                'title': row['title'],
                'description': row['description'],
                'created_at': row['created_at'],
                'action': row['action'],
                'side': row['action'],
                'status': 'active'
            })
    
    return children

# Trade parent entities
def get_trade_parent_entities(cursor, trade_id: int) -> List[Dict[str, Any]]:
    """Get parent entities for a trade"""
    parents = []
    
    logger.info(f"get_trade_parent_entities called for trade_id={trade_id}")
    
    # Get account
    try:
        cursor.execute("""
            SELECT a.id, 'trading_account' as type, 'חשבון מסחר' as title,
                   a.name as description,
                   a.created_at,
                   a.status
            FROM trades t
            JOIN trading_accounts a ON t.trading_account_id = a.id
            WHERE t.id = ?
        """, (trade_id,))
        
        row = cursor.fetchone()
        if row:
            parents.append({
                'id': row['id'],
                'type': row['type'],
                'title': row['title'],
                'description': row['description'],
                'created_at': row['created_at'],
                'status': row['status']
            })
            logger.info(f"Found account parent: {parents[-1]}")
    except Exception as e:
        logger.error(f"Error getting account parent for trade {trade_id}: {e}")
    
    # Get ticker
    try:
        cursor.execute("""
            SELECT tk.id, 'ticker' as type, 'טיקר' as title, 
                   tk.symbol || ' - ' || tk.name as description,
                   tk.created_at, 'active' as status
            FROM trades t
            JOIN tickers tk ON t.ticker_id = tk.id
            WHERE t.id = ?
        """, (trade_id,))
        
        row = cursor.fetchone()
        if row:
            parents.append({
                'id': row['id'],
                'type': row['type'],
                'title': row['title'],
                'description': row['description'],
                'created_at': row['created_at'],
                'status': row['status']
            })
            logger.info(f"Found ticker parent: {parents[-1]}")
    except Exception as e:
        logger.error(f"Error getting ticker parent for trade {trade_id}: {e}")
    
    # Get trade plan
    try:
        logger.info(f"Executing trade_plan query for trade_id={trade_id}")
        cursor.execute("""
            SELECT tp.id, 'trade_plan' as type, 'תוכנית טרייד' as title, 
                   'תוכנית ' || tp.side || ' - ' || tp.investment_type as description,
                   tp.created_at, tp.status
            FROM trades t
            JOIN trade_plans tp ON t.trade_plan_id = tp.id
            WHERE t.id = ?
        """, (trade_id,))
        
        row = cursor.fetchone()
        logger.info(f"Query result for trade_plan: row={row}")
        if row:
            trade_plan_parent = {
                'id': row[0],
                'type': row[1],
                'title': row[2],
                'description': row[3],
                'created_at': row[4],
                'status': row[5]
            }
            parents.append(trade_plan_parent)
            logger.info(f"Found trade_plan parent: {trade_plan_parent}")
        else:
            logger.warning(f"No trade_plan found for trade_id={trade_id}")
            # בואו נבדוק אם יש trade_plan_id בכלל
            cursor.execute("SELECT trade_plan_id FROM trades WHERE id = ?", (trade_id,))
            check_row = cursor.fetchone()
            if check_row:
                logger.info(f"Trade {trade_id} has trade_plan_id={check_row[0]}")
            else:
                logger.warning(f"Trade {trade_id} not found in database")
    except Exception as e:
        logger.error(f"Error getting trade_plan parent for trade {trade_id}: {e}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
    
    logger.info(f"get_trade_parent_entities returning {len(parents)} parents: {parents}")
    return parents

# Execution parent entities
def get_execution_parent_entities(cursor, execution_id: int) -> List[Dict[str, Any]]:
    """Get parent entities for an execution"""
    parents = []
    
    # Get trade if linked
    cursor.execute("""
        SELECT t.id, 'trade' as type, 'טרייד' as title, 
               'טרייד ' || t.side || ' על ' || tk.symbol as description,
               t.created_at, t.status, t.ticker_id, tk.id as ticker_db_id, tk.symbol as ticker_symbol, 
               COALESCE(tk.name, '') as ticker_name, tk.status as ticker_status, tk.created_at as ticker_created_at
        FROM executions e
        JOIN trades t ON e.trade_id = t.id
        LEFT JOIN tickers tk ON t.ticker_id = tk.id
        WHERE e.id = ? AND e.trade_id IS NOT NULL
    """, (execution_id,))
    
    row = cursor.fetchone()
    if row:
        parents.append({
            'id': row[0],
            'type': row[1],
            'title': row[2],
            'description': row[3],
            'created_at': row[4],
            'status': row[5]
        })
        
        # Add ticker from trade if it exists and not already added
        if row[6] and row[7]:  # ticker_id and ticker_db_id
            ticker_id = row[7]
            ticker_already_added = any(
                p.get('type') == 'ticker' and p.get('id') == ticker_id 
                for p in parents
            )
            if not ticker_already_added:
                ticker_symbol = row[8] or ''
                ticker_name = row[9] or ''
                ticker_description = f"{ticker_symbol} - {ticker_name}".strip(' - ') if ticker_name else ticker_symbol
                parents.append({
                    'id': ticker_id,
                    'type': 'ticker',
                    'title': 'טיקר',
                    'description': ticker_description,
                    'created_at': row[11],  # ticker_created_at
                    'status': row[10]  # ticker_status
                })
    
    # Get trading account (always present)
    cursor.execute("""
        SELECT ta.id, 'trading_account' as type, 'חשבון מסחר' as title,
               ta.name as description,
               ta.created_at, ta.status
        FROM executions e
        JOIN trading_accounts ta ON e.trading_account_id = ta.id
        WHERE e.id = ?
    """, (execution_id,))
    
    row = cursor.fetchone()
    if row:
        parents.append({
            'id': row[0],
            'type': row[1],
            'title': row[2],
            'description': row[3],
            'created_at': row[4],
            'status': row[5]
        })
    
    # Get ticker if directly linked (always add, even if also linked through trade)
    cursor.execute("""
        SELECT tk.id, 'ticker' as type, 'טיקר' as title,
               tk.symbol || ' - ' || COALESCE(tk.name, '') as description,
               tk.created_at, tk.status
        FROM executions e
        JOIN tickers tk ON e.ticker_id = tk.id
        WHERE e.id = ? AND e.ticker_id IS NOT NULL
    """, (execution_id,))
    
    row = cursor.fetchone()
    if row:
        # Check if this specific ticker was already added through trade to avoid duplicates
        ticker_id = row[0]
        ticker_already_added = any(
            p.get('type') == 'ticker' and p.get('id') == ticker_id 
            for p in parents
        )
        if not ticker_already_added:
            parents.append({
                'id': row[0],
                'type': row[1],
                'title': row[2],
                'description': row[3],
                'created_at': row[4],
                'status': row[5]
            })
    
    return parents

# Cash flow parent entities
def get_cash_flow_parent_entities(cursor, cash_flow_id: int) -> List[Dict[str, Any]]:
    """Get parent entities for a cash flow"""
    parents = []
    
    # Get trade if linked
    cursor.execute("""
        SELECT t.id, 'trade' as type, 'טרייד' as title, 
               'טרייד ' || t.side || ' על ' || tk.symbol as description,
               t.created_at, t.status, t.ticker_id, tk.id as ticker_db_id, tk.symbol as ticker_symbol, 
               COALESCE(tk.name, '') as ticker_name, tk.status as ticker_status, tk.created_at as ticker_created_at
        FROM cash_flows cf
        JOIN trades t ON cf.trade_id = t.id
        LEFT JOIN tickers tk ON t.ticker_id = tk.id
        WHERE cf.id = ? AND cf.trade_id IS NOT NULL
    """, (cash_flow_id,))
    
    row = cursor.fetchone()
    if row:
        parents.append({
            'id': row[0],
            'type': row[1],
            'title': row[2],
            'description': row[3],
            'created_at': row[4],
            'status': row[5]
        })
        
        # Add ticker from trade if it exists and not already added
        if row[6] and row[7]:  # ticker_id and ticker_db_id
            ticker_id = row[7]
            ticker_already_added = any(
                p.get('type') == 'ticker' and p.get('id') == ticker_id 
                for p in parents
            )
            if not ticker_already_added:
                ticker_symbol = row[8] or ''
                ticker_name = row[9] or ''
                ticker_description = f"{ticker_symbol} - {ticker_name}".strip(' - ') if ticker_name else ticker_symbol
                parents.append({
                    'id': ticker_id,
                    'type': 'ticker',
                    'title': 'טיקר',
                    'description': ticker_description,
                    'created_at': row[11],  # ticker_created_at
                    'status': row[10]  # ticker_status
                })
    
    # Get trading account (always present)
    cursor.execute("""
        SELECT ta.id, 'trading_account' as type, 'חשבון מסחר' as title,
               ta.name as description,
               ta.created_at, ta.status
        FROM cash_flows cf
        JOIN trading_accounts ta ON cf.trading_account_id = ta.id
        WHERE cf.id = ?
    """, (cash_flow_id,))
    
    row = cursor.fetchone()
    if row:
        parents.append({
            'id': row[0],
            'type': row[1],
            'title': row[2],
            'description': row[3],
            'created_at': row[4],
            'status': row[5]
        })
    
    return parents

# Note parent entities
def get_note_parent_entities(cursor, note_id: int) -> List[Dict[str, Any]]:
    """Get parent entities for a note"""
    parents = []
    
    cursor.execute("""
        SELECT related_id, related_type_id, content
        FROM notes
        WHERE id = ?
    """, (note_id,))
    
    row = cursor.fetchone()
    if row and row[0] and row[1]:
        related_id = row[0]
        related_type_id = row[1]
        
        # Get the related entity based on type
        if related_type_id == 2:  # trade
            cursor.execute("""
                SELECT t.id, 'trade' as type, 'טרייד' as title, 
                       'טרייד ' || t.side || ' על ' || tk.symbol as description,
                       t.created_at, t.status
                FROM trades t
                JOIN tickers tk ON t.ticker_id = tk.id
                WHERE t.id = ?
            """, (related_id,))
        elif related_type_id == 1:  # trading_account (was account)
            cursor.execute("""
                SELECT id, 'trading_account' as type, 'חשבון מסחר' as title, 
                       name as description,
                       created_at, status
                FROM trading_accounts
                WHERE id = ?
            """, (related_id,))
        elif related_type_id == 4:  # ticker
            cursor.execute("""
                SELECT id, 'ticker' as type, 'טיקר' as title, 
                       symbol || ' - ' || name as description,
                       created_at, 'active' as status
                FROM tickers
                WHERE id = ?
            """, (related_id,))
        else:
            return parents
        
        row = cursor.fetchone()
        if row:
            parents.append({
                'id': row[0],
                'type': row[1],
                'title': row[2],
                'description': row[3],
                'created_at': row[4],
                'status': row[5]
            })
    
    return parents

# Alert parent entities
def get_alert_parent_entities(cursor, alert_id: int) -> List[Dict[str, Any]]:
    """Get parent entities for an alert"""
    parents = []
    
    cursor.execute("""
        SELECT related_id, related_type_id, message
        FROM alerts
        WHERE id = ?
    """, (alert_id,))
    
    row = cursor.fetchone()
    if row and row[0] and row[1]:
        related_id = row[0]
        related_type_id = row[1]
        
        # Get the related entity based on type
        if related_type_id == 2:  # trade
            cursor.execute("""
                SELECT t.id, 'trade' as type, 'טרייד' as title, 
                       'טרייד ' || t.side || ' על ' || tk.symbol as description,
                       t.created_at, t.status
                FROM trades t
                JOIN tickers tk ON t.ticker_id = tk.id
                WHERE t.id = ?
            """, (related_id,))
        elif related_type_id == 4:  # ticker
            cursor.execute("""
                SELECT id, 'ticker' as type, 'טיקר' as title, 
                       symbol || ' - ' || name as description,
                       created_at, 'active' as status
                FROM tickers
                WHERE id = ?
            """, (related_id,))
        else:
            return parents
        
        row = cursor.fetchone()
        if row:
            parents.append({
                'id': row[0],
                'type': row[1],
                'title': row[2],
                'description': row[3],
                'created_at': row[4],
                'status': row[5]
            })
    
    return parents

# Additional helper functions for other entity types
def get_alert_child_entities(cursor, alert_id: int) -> List[Dict[str, Any]]:
    """Get child entities for an alert"""
    children = []
    
    # Get notes
    cursor.execute("""
        SELECT n.id, 'note' as type, 'הערה' as title, 
               substr(n.content, 1, 100) as description,
               n.created_at, 'active' as status
        FROM notes n
        WHERE n.related_type_id = 5 AND n.related_id = ?
    """, (alert_id,))
    
    for row in cursor.fetchall():
        children.append({
            'id': row[0],
            'type': row[1],
            'title': row[2],
            'description': row[3] + ('...' if len(row[3]) == 100 else ''),
            'created_at': row[4],
            'status': row[5]
        })
    
    return children

def get_trade_plan_child_entities(cursor, trade_plan_id: int) -> List[Dict[str, Any]]:
    """Get child entities for a trade plan"""
    children = []
    
    # Get trades
    cursor.execute("""
        SELECT t.id, 'trade' as type, 'טרייד' as title, 
               'טרייד ' || t.side || ' על ' || tk.symbol as description,
               t.created_at, t.status
        FROM trades t
        JOIN tickers tk ON t.ticker_id = tk.id
        WHERE t.trade_plan_id = ?
    """, (trade_plan_id,))
    
    for row in cursor.fetchall():
        children.append({
            'id': row[0],
            'type': row[1],
            'title': row[2],
            'description': row[3],
            'created_at': row[4],
            'status': row[5]
        })
    
    # Get notes
    cursor.execute("""
        SELECT n.id, 'note' as type, 'הערה' as title, 
               substr(n.content, 1, 100) as description,
               n.created_at, 'active' as status
        FROM notes n
        WHERE n.related_type_id = 3 AND n.related_id = ?
    """, (trade_plan_id,))
    
    for row in cursor.fetchall():
        children.append({
            'id': row[0],
            'type': row[1],
            'title': row[2],
            'description': row[3] + ('...' if len(row[3]) == 100 else ''),
            'created_at': row[4],
            'status': row[5]
        })
    
    return children

def get_cash_flow_child_entities(cursor, cash_flow_id: int) -> List[Dict[str, Any]]:
    """Get child entities for a cash flow"""
    children = []
    
    # Get notes
    cursor.execute("""
        SELECT n.id, 'note' as type, 'הערה' as title, 
               substr(n.content, 1, 100) as description,
               n.created_at, 'active' as status
        FROM notes n
        WHERE n.related_type_id = 6 AND n.related_id = ?
    """, (cash_flow_id,))
    
    for row in cursor.fetchall():
        children.append({
            'id': row[0],
            'type': row[1],
            'title': row[2],
            'description': row[3] + ('...' if len(row[3]) == 100 else ''),
            'created_at': row[4],
            'status': row[5]
        })
    
    return children

def get_note_child_entities(cursor, note_id: int) -> List[Dict[str, Any]]:
    """Get child entities for a note (replies)"""
    children = []
    
    # Get reply notes
    cursor.execute("""
        SELECT n.id, 'note' as type, 'תגובה' as title, 
               LEFT(n.content, 100) as description,
               n.created_at, 'active' as status
        FROM notes n
        WHERE n.parent_note_id = ?
    """, (note_id,))
    
    for row in cursor.fetchall():
        children.append({
            'id': row[0],
            'type': row[1],
            'title': row[2],
            'description': row[3] + ('...' if len(row[3]) == 100 else ''),
            'created_at': row[4],
            'status': row[5]
        })
    
    return children

def get_execution_child_entities(cursor, execution_id: int) -> List[Dict[str, Any]]:
    """Get child entities for an execution"""
    children = []
    
    # Get notes
    cursor.execute("""
        SELECT n.id, 'note' as type, 'הערה' as title, 
               substr(n.content, 1, 100) as description,
               n.created_at, 'active' as status
        FROM notes n
        WHERE n.related_type_id = 7 AND n.related_id = ?
    """, (execution_id,))
    
    for row in cursor.fetchall():
        children.append({
            'id': row[0],
            'type': row[1],
            'title': row[2],
            'description': row[3] + ('...' if len(row[3]) == 100 else ''),
            'created_at': row[4],
            'status': row[5]
        })
    
    return children


def get_position_child_entities(cursor, trading_account_id: int, ticker_id: int) -> List[Dict[str, Any]]:
    """Get child entities for a position (account + ticker combination)"""
    children: List[Dict[str, Any]] = []

    # Trades linked to this position
    cursor.execute("""
        SELECT t.id, 'trade' as type, 'טרייד' as title,
               'טרייד ' || t.side || ' על ' || tk.symbol as description,
               t.created_at,
               t.closed_at,
               t.status,
               t.side,
               t.investment_type
        FROM trades t
        JOIN tickers tk ON t.ticker_id = tk.id
        WHERE t.trading_account_id = ? AND t.ticker_id = ?
    """, (trading_account_id, ticker_id))

    for row in cursor.fetchall():
        children.append({
            'id': row['id'],
            'type': row['type'],
            'title': row['title'],
            'description': row['description'],
            'created_at': row['created_at'],
            'status': row['status'],
            'side': row['side'],
            'investment_type': row['investment_type']
        })

    # Executions for this position
    cursor.execute("""
        SELECT e.id, 'execution' as type, 'ביצוע' as title,
               'ביצוע ' || e.action || ' ' || e.quantity || ' יחידות' as description,
               e.created_at,
               CASE WHEN e.action = 'sell' THEN 'closed' ELSE 'active' END as status,
               e.action as side,
               NULL as investment_type
        FROM executions e
        WHERE e.trading_account_id = ? AND e.ticker_id = ?
    """, (trading_account_id, ticker_id))

    for row in cursor.fetchall():
        children.append({
            'id': row['id'],
            'type': row['type'],
            'title': row['title'],
            'description': row['description'],
            'created_at': row['created_at'],
            'status': row['status'],
            'side': row['side'],
            'investment_type': row['investment_type']
        })

    # Trade plans associated with this account and ticker
    cursor.execute("""
        SELECT tp.id, 'trade_plan' as type, 'תוכנית מסחר' as title,
               'תוכנית ' || tp.side || ' על ' || tk.symbol as description,
               tp.created_at,
               tp.cancelled_at,
               tp.status,
               tp.side,
               tp.investment_type
        FROM trade_plans tp
        JOIN tickers tk ON tp.ticker_id = tk.id
        WHERE tp.trading_account_id = ? AND tp.ticker_id = ?
    """, (trading_account_id, ticker_id))

    for row in cursor.fetchall():
        children.append({
            'id': row['id'],
            'type': row['type'],
            'title': row['title'],
            'description': row['description'],
            'created_at': row['created_at'],
            'status': row['status'],
            'side': row['side'],
            'investment_type': row['investment_type']
        })

    # Cash flows linked via trades
    cursor.execute("""
        SELECT cf.id, 'cash_flow' as type, 'תזרים מזומנים' as title,
               CASE 
                   WHEN cf.type = 'deposit' THEN 'הפקדה'
                   WHEN cf.type = 'withdrawal' THEN 'משיכה'
                   WHEN cf.type = 'fee' THEN 'עמלה'
                   WHEN cf.type = 'dividend' THEN 'דיבידנד'
                   WHEN cf.type = 'other_positive' THEN 'אחר חיובי'
                   WHEN cf.type = 'other_negative' THEN 'אחר שלילי'
                   ELSE cf.type
               END || ' - ' || COALESCE(c.currency_symbol, '') || ' ' || cf.amount as description,
               cf.date as created_at,
               'active' as status,
               NULL as side,
               NULL as investment_type
        FROM cash_flows cf
        LEFT JOIN currencies c ON cf.currency_id = c.id
        WHERE cf.trading_account_id = ? AND cf.ticker_id = ?
    """, (trading_account_id, ticker_id))

    for row in cursor.fetchall():
        children.append({
            'id': row['id'],
            'type': row['type'],
            'title': row['title'],
            'description': row['description'] if row['description'] else '',
            'created_at': row['created_at'],
            'status': row['status'],
            'side': row['side'],
            'investment_type': row['investment_type']
        })

    # Notes linked to this account+ticker position (via executions or direct linkage)
    cursor.execute("""
        SELECT n.id, 'note' as type, 'הערה' as title,
               substr(n.content, 1, 100) as description,
               n.created_at,
               'active' as status
        FROM notes n
        WHERE (
            (n.related_type_id = 7 AND n.related_id IN (
                SELECT e.id FROM executions e WHERE e.trading_account_id = ? AND e.ticker_id = ?
            ))
            OR (n.related_type_id = 2 AND n.related_id IN (
                SELECT t.id FROM trades t WHERE t.trading_account_id = ? AND t.ticker_id = ?
            ))
        )
    """, (trading_account_id, ticker_id, trading_account_id, ticker_id))

    for row in cursor.fetchall():
        description = row['description'] if row['description'] is not None else ''
        children.append({
            'id': row['id'],
            'type': row['type'],
            'title': row['title'],
            'description': description + ('...' if len(description) == 100 else ''),
            'created_at': row['created_at'],
            'status': row['status'],
            'side': None,
            'investment_type': None
        })

    # Alerts linked to trades or ticker for this position
    cursor.execute("""
        SELECT a.id, 'alert' as type, 'התראה' as title,
               'התראה: ' || a.message as description,
               a.created_at,
               a.triggered_at,
               a.status
        FROM alerts a
        WHERE (
            (a.related_type_id = 2 AND a.related_id IN (
                SELECT t.id FROM trades t WHERE t.trading_account_id = ? AND t.ticker_id = ?
            ))
            OR (a.related_type_id = 4 AND a.related_id = ?)
        )
    """, (trading_account_id, ticker_id, ticker_id))

    for row in cursor.fetchall():
        children.append({
            'id': row['id'],
            'type': row['type'],
            'title': row['title'],
            'description': row['description'],
            'created_at': row['created_at'],
            'status': row['status'],
            'side': None,
            'investment_type': None
        })

    return children


def get_position_parent_entities(cursor, trading_account_id: int, ticker_id: int) -> List[Dict[str, Any]]:
    """Get parent entities for a position (account + ticker)"""
    parents: List[Dict[str, Any]] = []

    # Trading account parent
    cursor.execute("""
        SELECT id, 'trading_account' as type, 'חשבון מסחר' as title,
               name as description,
               created_at,
               updated_at,
               status
        FROM trading_accounts
        WHERE id = ?
    """, (trading_account_id,))

    row = cursor.fetchone()
    if row:
        parents.append({
            'id': row['id'],
            'type': row['type'],
            'title': row['title'],
            'description': row['description'],
            'created_at': row['created_at'],
            'status': row['status']
        })

    # Ticker parent
    cursor.execute("""
        SELECT id, 'ticker' as type, 'טיקר' as title,
               symbol || ' - ' || name as description,
               created_at,
               'active' as status
        FROM tickers
        WHERE id = ?
    """, (ticker_id,))

    row = cursor.fetchone()
    if row:
        parents.append({
            'id': row['id'],
            'type': row['type'],
            'title': row['title'],
            'description': row['description'],
            'created_at': row['created_at'],
            'updated_at': None,
            'status': row['status']
        })

    return parents
