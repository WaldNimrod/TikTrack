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

Author: Tik.track Development Team
Last Updated: 2025-01-15
"""

from flask import Blueprint, jsonify, request
from sqlalchemy import text
from typing import Dict, List, Any, Optional
import logging

# Setup logging
logger = logging.getLogger(__name__)

# Create blueprint
linked_items_bp = Blueprint('linked_items', __name__, url_prefix='/api/v1/linked-items')

def get_db_connection():
    """Get database connection"""
    from Backend.app import get_db_connection
    return get_db_connection()

@linked_items_bp.route('/<entity_type>/<int:entity_id>', methods=['GET'])
def get_linked_items(entity_type: str, entity_id: int) -> Dict[str, Any]:
    """
    Get linked items for a specific entity
    
    Args:
        entity_type: Type of entity (trade, account, ticker, alert, etc.)
        entity_id: ID of the entity
        
    Returns:
        Dictionary with child_entities and parent_entities lists
    """
    try:
        logger.info(f"Getting linked items for {entity_type} {entity_id}")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get child entities (entities that reference this entity)
        child_entities = get_child_entities(cursor, entity_type, entity_id)
        
        # Get parent entities (entities that this entity references)
        parent_entities = get_parent_entities(cursor, entity_type, entity_id)
        
        result = {
            'entity_type': entity_type,
            'entity_id': entity_id,
            'child_entities': child_entities,
            'parent_entities': parent_entities,
            'total_child_count': len(child_entities),
            'total_parent_count': len(parent_entities)
        }
        
        logger.info(f"Found {len(child_entities)} child entities and {len(parent_entities)} parent entities")
        
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Error getting linked items for {entity_type} {entity_id}: {str(e)}")
        return jsonify({'error': f'Failed to get linked items: {str(e)}'}), 500
    finally:
        if 'conn' in locals():
            conn.close()

def get_child_entities(cursor, entity_type: str, entity_id: int) -> List[Dict[str, Any]]:
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
            
        elif entity_type == 'account':
            # Accounts can have trades, cash_flows, notes
            child_entities.extend(get_account_child_entities(cursor, entity_id))
            
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

def get_parent_entities(cursor, entity_type: str, entity_id: int) -> List[Dict[str, Any]]:
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
            
        elif entity_type == 'note':
            # Notes can reference any entity
            parent_entities.extend(get_note_parent_entities(cursor, entity_id))
            
        elif entity_type == 'alert':
            # Alerts can reference any entity
            parent_entities.extend(get_alert_parent_entities(cursor, entity_id))
            
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
               CONCAT('ביצוע ', action, ' ', quantity, ' יחידות') as description,
               created_at, status
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
    
    # Get notes
    cursor.execute("""
        SELECT n.id, 'note' as type, 'הערה' as title, 
               LEFT(n.content, 100) as description,
               n.created_at, 'active' as status
        FROM notes n
        WHERE n.related_type = 'trade' AND n.related_id = ?
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
               CONCAT('התראה: ', message) as description,
               created_at, status
        FROM alerts 
        WHERE related_type = 'trade' AND related_id = ?
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

# Account child entities
def get_account_child_entities(cursor, account_id: int) -> List[Dict[str, Any]]:
    """Get child entities for an account"""
    children = []
    
    # Get trades
    cursor.execute("""
        SELECT id, 'trade' as type, 'טרייד' as title, 
               CONCAT('טרייד ', side, ' על ', ticker_symbol) as description,
               created_at, status
        FROM trades t
        JOIN tickers tk ON t.ticker_id = tk.id
        WHERE t.account_id = ?
    """, (account_id,))
    
    for row in cursor.fetchall():
        children.append({
            'id': row[0],
            'type': row[1],
            'title': row[2],
            'description': row[3],
            'created_at': row[4],
            'status': row[5]
        })
    
    # Get cash flows
    cursor.execute("""
        SELECT id, 'cash_flow' as type, 'תזרים מזומנים' as title, 
               CONCAT(type, ': ', amount, ' ', currency) as description,
               date, 'active' as status
        FROM cash_flows 
        WHERE account_id = ?
    """, (account_id,))
    
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
               LEFT(n.content, 100) as description,
               n.created_at, 'active' as status
        FROM notes n
        WHERE n.related_type = 'account' AND n.related_id = ?
    """, (account_id,))
    
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

# Ticker child entities
def get_ticker_child_entities(cursor, ticker_id: int) -> List[Dict[str, Any]]:
    """Get child entities for a ticker"""
    children = []
    
    # Get trades
    cursor.execute("""
        SELECT t.id, 'trade' as type, 'טרייד' as title, 
               CONCAT('טרייד ', t.side, ' - ', t.investment_type) as description,
               t.created_at, t.status
        FROM trades t
        WHERE t.ticker_id = ?
    """, (ticker_id,))
    
    for row in cursor.fetchall():
        children.append({
            'id': row[0],
            'type': row[1],
            'title': row[2],
            'description': row[3],
            'created_at': row[4],
            'status': row[5]
        })
    
    # Get trade plans
    cursor.execute("""
        SELECT id, 'trade_plan' as type, 'תוכנית טרייד' as title, 
               CONCAT('תוכנית ', side, ' - ', investment_type) as description,
               created_at, status
        FROM trade_plans 
        WHERE ticker_id = ?
    """, (ticker_id,))
    
    for row in cursor.fetchall():
        children.append({
            'id': row[0],
            'type': row[1],
            'title': row[2],
            'description': row[3],
            'created_at': row[4],
            'status': row[5]
        })
    
    # Get alerts
    cursor.execute("""
        SELECT id, 'alert' as type, 'התראה' as title, 
               CONCAT('התראה: ', message) as description,
               created_at, status
        FROM alerts 
        WHERE related_type = 'ticker' AND related_id = ?
    """, (ticker_id,))
    
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
               LEFT(n.content, 100) as description,
               n.created_at, 'active' as status
        FROM notes n
        WHERE n.related_type = 'ticker' AND n.related_id = ?
    """, (ticker_id,))
    
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

# Trade parent entities
def get_trade_parent_entities(cursor, trade_id: int) -> List[Dict[str, Any]]:
    """Get parent entities for a trade"""
    parents = []
    
    # Get account
    cursor.execute("""
        SELECT a.id, 'account' as type, 'חשבון' as title, 
               a.name as description,
               a.created_at, a.status
        FROM trades t
        JOIN accounts a ON t.account_id = a.id
        WHERE t.id = ?
    """, (trade_id,))
    
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
    
    # Get ticker
    cursor.execute("""
        SELECT tk.id, 'ticker' as type, 'טיקר' as title, 
               CONCAT(tk.symbol, ' - ', tk.name) as description,
               tk.created_at, 'active' as status
        FROM trades t
        JOIN tickers tk ON t.ticker_id = tk.id
        WHERE t.id = ?
    """, (trade_id,))
    
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
    
    # Get trade plan
    cursor.execute("""
        SELECT tp.id, 'trade_plan' as type, 'תוכנית טרייד' as title, 
               CONCAT('תוכנית ', tp.side, ' - ', tp.investment_type) as description,
               tp.created_at, tp.status
        FROM trades t
        JOIN trade_plans tp ON t.trade_plan_id = tp.id
        WHERE t.id = ?
    """, (trade_id,))
    
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

# Execution parent entities
def get_execution_parent_entities(cursor, execution_id: int) -> List[Dict[str, Any]]:
    """Get parent entities for an execution"""
    parents = []
    
    # Get trade
    cursor.execute("""
        SELECT t.id, 'trade' as type, 'טרייד' as title, 
               CONCAT('טרייד ', t.side, ' על ', tk.symbol) as description,
               t.created_at, t.status
        FROM executions e
        JOIN trades t ON e.trade_id = t.id
        JOIN tickers tk ON t.ticker_id = tk.id
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
    
    return parents

# Note parent entities
def get_note_parent_entities(cursor, note_id: int) -> List[Dict[str, Any]]:
    """Get parent entities for a note"""
    parents = []
    
    cursor.execute("""
        SELECT related_id, related_type, content
        FROM notes
        WHERE id = ?
    """, (note_id,))
    
    row = cursor.fetchone()
    if row and row[0] and row[1]:
        related_id = row[0]
        related_type = row[1]
        
        # Get the related entity based on type
        if related_type == 'trade':
            cursor.execute("""
                SELECT t.id, 'trade' as type, 'טרייד' as title, 
                       CONCAT('טרייד ', t.side, ' על ', tk.symbol) as description,
                       t.created_at, t.status
                FROM trades t
                JOIN tickers tk ON t.ticker_id = tk.id
                WHERE t.id = ?
            """, (related_id,))
        elif related_type == 'account':
            cursor.execute("""
                SELECT id, 'account' as type, 'חשבון' as title, 
                       name as description,
                       created_at, status
                FROM accounts
                WHERE id = ?
            """, (related_id,))
        elif related_type == 'ticker':
            cursor.execute("""
                SELECT id, 'ticker' as type, 'טיקר' as title, 
                       CONCAT(symbol, ' - ', name) as description,
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
        SELECT related_id, related_type, message
        FROM alerts
        WHERE id = ?
    """, (alert_id,))
    
    row = cursor.fetchone()
    if row and row[0] and row[1]:
        related_id = row[0]
        related_type = row[1]
        
        # Get the related entity based on type
        if related_type == 'trade':
            cursor.execute("""
                SELECT t.id, 'trade' as type, 'טרייד' as title, 
                       CONCAT('טרייד ', t.side, ' על ', tk.symbol) as description,
                       t.created_at, t.status
                FROM trades t
                JOIN tickers tk ON t.ticker_id = tk.id
                WHERE t.id = ?
            """, (related_id,))
        elif related_type == 'ticker':
            cursor.execute("""
                SELECT id, 'ticker' as type, 'טיקר' as title, 
                       CONCAT(symbol, ' - ', name) as description,
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
               LEFT(n.content, 100) as description,
               n.created_at, 'active' as status
        FROM notes n
        WHERE n.related_type = 'alert' AND n.related_id = ?
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
               CONCAT('טרייד ', t.side, ' על ', tk.symbol) as description,
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
               LEFT(n.content, 100) as description,
               n.created_at, 'active' as status
        FROM notes n
        WHERE n.related_type = 'trade_plan' AND n.related_id = ?
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
               LEFT(n.content, 100) as description,
               n.created_at, 'active' as status
        FROM notes n
        WHERE n.related_type = 'cash_flow' AND n.related_id = ?
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
               LEFT(n.content, 100) as description,
               n.created_at, 'active' as status
        FROM notes n
        WHERE n.related_type = 'execution' AND n.related_id = ?
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
