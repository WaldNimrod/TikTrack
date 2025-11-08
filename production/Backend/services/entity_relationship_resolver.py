"""
Entity Relationship Resolver - TikTrack
========================================

Generic resolver for fetching linked items based on the Entity Relationship Schema.
This resolver interprets the schema and dynamically builds SQLAlchemy queries to
fetch related entities.

Author: TikTrack Development Team
Version: 1.0.0
Date: 2025-11-08

Usage:
    >>> from services.entity_relationship_schema import ENTITY_RELATIONSHIPS
    >>> resolver = EntityRelationshipResolver(ENTITY_RELATIONSHIPS)
    >>> linked_items = resolver.get_linked_items(db, 'trade', 1)
"""

from sqlalchemy.orm import Session, joinedload
from typing import Dict, Any, List, Optional, Set
import logging

# Import models
from models.ticker import Ticker
from models.trade import Trade
from models.trade_plan import TradePlan
from models.execution import Execution
from models.trading_account import TradingAccount
from models.alert import Alert
from models.cash_flow import CashFlow
from models.note import Note
from models.note_relation_type import NoteRelationType

# Import schema
from services.entity_relationship_schema import (
    ENTITY_RELATIONSHIPS,
    RELATIONSHIP_DIRECT,
    RELATIONSHIP_THROUGH,
    RELATIONSHIP_CONDITIONAL,
    RELATIONSHIP_LEGACY,
    LINKED_ITEM_FIELDS,
    FIELD_FORMATTERS,
    get_field_formatter,
    validate_linked_item
)

logger = logging.getLogger(__name__)

# Model mapping for dynamic queries
MODEL_MAP = {
    'ticker': Ticker,
    'trade': Trade,
    'trade_plan': TradePlan,
    'execution': Execution,
    'trading_account': TradingAccount,
    'alert': Alert,
    'cash_flow': CashFlow,
    'note': Note
}


class EntityRelationshipResolver:
    """
    Generic resolver for entity relationships based on schema configuration.
    
    This resolver interprets the entity relationship schema and dynamically
    builds queries to fetch linked items for any entity type.
    """
    
    def __init__(self, schema: Dict[str, Dict[str, Any]]):
        """
        Initialize resolver with schema.
        
        Args:
            schema: Entity relationship schema from entity_relationship_schema.py
        """
        self.schema = schema
        self.seen_ids: Set[tuple] = set()  # Track seen (type, id) pairs to prevent duplicates
    
    def get_linked_items(self, db: Session, entity_type: str, entity_id: int) -> List[Dict[str, Any]]:
        """
        Get all linked items (parents and children) for an entity.
        
        Args:
            db: Database session
            entity_type: Type of entity (e.g., 'trade', 'ticker')
            entity_id: ID of the entity
            
        Returns:
            List of linked item dictionaries conforming to canonical schema
        """
        if entity_type not in self.schema:
            logger.warning(f"Unknown entity type: {entity_type}")
            return []
        
        self.seen_ids.clear()  # Reset for each call
        linked_items = []
        
        entity_schema = self.schema[entity_type]
        
        # Fetch parents
        if 'parents' in entity_schema:
            for parent_type, parent_config in entity_schema['parents'].items():
                parent_items = self._fetch_relationship(
                    db, entity_type, entity_id, parent_type, parent_config, is_parent=True
                )
                linked_items.extend(parent_items)
        
        # Fetch children
        if 'children' in entity_schema:
            for child_type, child_config in entity_schema['children'].items():
                child_items = self._fetch_relationship(
                    db, entity_type, entity_id, child_type, child_config, is_parent=False
                )
                linked_items.extend(child_items)
                
                # Handle legacy_support in children config (e.g., alert -> trade_plan via legacy)
                if 'legacy_support' in child_config:
                    legacy_items = self._fetch_relationship(
                        db, entity_type, entity_id, child_type, child_config['legacy_support'], is_parent=False
                    )
                    linked_items.extend(legacy_items)
        
        # Handle cascades (e.g., execution -> trade -> ticker)
        linked_items = self._apply_cascades(db, linked_items, entity_type, entity_id)
        
        logger.debug(f"Found {len(linked_items)} linked items for {entity_type} {entity_id}")
        return linked_items
    
    def _fetch_relationship(
        self,
        db: Session,
        source_type: str,
        source_id: int,
        target_type: str,
        config: Dict[str, Any],
        is_parent: bool
    ) -> List[Dict[str, Any]]:
        """
        Fetch entities based on relationship configuration.
        
        Args:
            db: Database session
            source_type: Type of source entity
            source_id: ID of source entity
            target_type: Type of target entity
            config: Relationship configuration from schema
            is_parent: True if fetching parents, False if fetching children
            
        Returns:
            List of formatted linked item dictionaries
        """
        relationship_type = config.get('type')
        
        if relationship_type == RELATIONSHIP_DIRECT:
            return self._fetch_direct_relationship(db, source_type, source_id, target_type, config, is_parent)
        elif relationship_type == RELATIONSHIP_THROUGH:
            return self._fetch_through_relationship(db, source_type, source_id, target_type, config, is_parent)
        elif relationship_type == RELATIONSHIP_CONDITIONAL:
            return self._fetch_conditional_relationship(db, source_type, source_id, target_type, config, is_parent)
        elif relationship_type == RELATIONSHIP_LEGACY:
            return self._fetch_legacy_relationship(db, source_type, source_id, target_type, config, is_parent)
        else:
            logger.warning(f"Unknown relationship type: {relationship_type}")
            return []
    
    def _fetch_direct_relationship(
        self,
        db: Session,
        source_type: str,
        source_id: int,
        target_type: str,
        config: Dict[str, Any],
        is_parent: bool
    ) -> List[Dict[str, Any]]:
        """
        Fetch entities via direct foreign key relationship.
        
        For children: target.field == source_id (standard FK)
        For parents: source.field == target_id (reverse FK)
        Special case: alert -> trade via ticker_id (both have ticker_id, find trades with same ticker)
        """
        target_model = MODEL_MAP.get(target_type)
        if not target_model:
            logger.warning(f"Unknown target model: {target_type}")
            return []
        
        field = config.get('field')
        if not field:
            logger.warning(f"No field specified for direct relationship {source_type} -> {target_type}")
            return []
        
        try:
            # Special case: alert -> trade via ticker_id
            # Both alert and trade have ticker_id, we want trades with same ticker as alert
            if source_type == 'alert' and target_type == 'trade' and field == 'ticker_id':
                # Get alert's ticker_id
                source_model = MODEL_MAP.get(source_type)
                source_entity = db.query(source_model).filter(source_model.id == source_id).first()
                if not source_entity or not hasattr(source_entity, 'ticker_id') or not source_entity.ticker_id:
                    return []
                
                # Find trades with same ticker_id
                query = db.query(target_model).filter(getattr(target_model, field) == source_entity.ticker_id)
                entities = query.all()
            else:
                # Standard direct relationship: target.field == source_id (for children)
                # For parents, this would be reversed, but we handle parents differently
                query = db.query(target_model).filter(getattr(target_model, field) == source_id)
                entities = query.all()
            
            # Format results
            results = []
            for entity in entities:
                item = self._format_entity(entity, target_type, db)
                if item and self._should_add_item(target_type, item['id'], config):
                    results.append(item)
            
            return results
            
        except Exception as e:
            logger.error(f"Error fetching direct relationship {source_type} -> {target_type}: {e}")
            return []
    
    def _fetch_through_relationship(
        self,
        db: Session,
        source_type: str,
        source_id: int,
        target_type: str,
        config: Dict[str, Any],
        is_parent: bool
    ) -> List[Dict[str, Any]]:
        """Fetch entities via intermediate entity (through relationship)."""
        through_model_name = config.get('through')
        if not through_model_name:
            logger.warning(f"No 'through' model specified for relationship {source_type} -> {target_type}")
            return []
        
        # Import through model dynamically
        try:
            if through_model_name == 'PlanCondition':
                from models.plan_condition import PlanCondition
                through_model = PlanCondition
            elif through_model_name == 'TradeCondition':
                from models.trade_condition import TradeCondition
                through_model = TradeCondition
            else:
                logger.warning(f"Unknown through model: {through_model_name}")
                return []
        except ImportError as e:
            logger.error(f"Failed to import through model {through_model_name}: {e}")
            return []
        
        target_model = MODEL_MAP.get(target_type)
        if not target_model:
            logger.warning(f"Unknown target model: {target_type}")
            return []
        
        try:
            # Build query based on relationship direction
            if is_parent:
                # Fetch parents: source -> through -> target
                # Example: alert -> plan_condition -> trade_plan
                # 1. Get source entity (alert)
                # 2. Get through_id from source (alert.plan_condition_id)
                # 3. Get through entity (PlanCondition where id == through_id)
                # 4. Get target_id from through (PlanCondition.trade_plan_id)
                # 5. Get target entity (TradePlan where id == target_id)
                source_model = MODEL_MAP.get(source_type)
                if not source_model:
                    logger.warning(f"Unknown source model: {source_type}")
                    return []
                
                # Get source entity
                source_entity = db.query(source_model).filter(source_model.id == source_id).first()
                if not source_entity:
                    return []
                
                # Get through_id from source (e.g., alert.plan_condition_id)
                through_field = config.get('field')  # e.g., 'plan_condition_id'
                through_id = getattr(source_entity, through_field, None)
                if not through_id:
                    return []
                
                # Get through entity
                through_entity = db.query(through_model).filter(through_model.id == through_id).first()
                if not through_entity:
                    return []
                
                # Get target_id from through entity (e.g., PlanCondition.trade_plan_id)
                target_field = config.get('target_query')  # e.g., 'PlanCondition.trade_plan_id'
                target_id = getattr(through_entity, self._extract_target_field(target_field))
                if not target_id:
                    return []
                
                # Get target entity
                target_entity = db.query(target_model).filter(target_model.id == target_id).first()
                if target_entity:
                    item = self._format_entity(target_entity, target_type, db)
                    if item and self._should_add_item(target_type, item['id'], config):
                        return [item]
                
                return []
            else:
                # Fetch children: source -> through -> target
                # Example: trade_plan -> PlanCondition -> alert
                # Find PlanConditions where trade_plan_id == source_id
                # Then find Alerts where plan_condition_id == PlanCondition.id
                through_entities = db.query(through_model).filter(
                    getattr(through_model, self._extract_source_field_for_through(source_type, through_model_name)) == source_id
                ).all()
                
                results = []
                for through_entity in through_entities:
                    # Get target entities via through entity
                    # Target has a field pointing to through entity (e.g., Alert.plan_condition_id)
                    through_id = through_entity.id
                    target_field = config.get('field')  # e.g., 'plan_condition_id' in Alert
                    target_entities = db.query(target_model).filter(
                        getattr(target_model, target_field) == through_id
                    ).all()
                    
                    for target_entity in target_entities:
                        item = self._format_entity(target_entity, target_type, db)
                        if item and self._should_add_item(target_type, item['id'], config):
                            results.append(item)
                
                return results
                
        except Exception as e:
            logger.error(f"Error fetching through relationship {source_type} -> {target_type}: {e}")
            return []
    
    def _fetch_conditional_relationship(
        self,
        db: Session,
        source_type: str,
        source_id: int,
        target_type: str,
        config: Dict[str, Any],
        is_parent: bool
    ) -> List[Dict[str, Any]]:
        """Fetch entities via conditional relationship (e.g., via TradeCondition, PlanCondition)."""
        # Conditional relationships are similar to through relationships
        # but use condition tables (TradeCondition, PlanCondition)
        return self._fetch_through_relationship(db, source_type, source_id, target_type, config, is_parent)
    
    def _fetch_legacy_relationship(
        self,
        db: Session,
        source_type: str,
        source_id: int,
        target_type: str,
        config: Dict[str, Any],
        is_parent: bool
    ) -> List[Dict[str, Any]]:
        """
        Fetch entities via legacy relationship (related_type_id/related_id).
        
        Legacy relationships work as follows:
        - For children: Find entities (e.g., Note) where related_type_id matches target_type
          and related_id matches source_id
        - For parents: Get the source entity and check its related_type_id/related_id to find parent
        """
        relation_type_id = config.get('value')  # e.g., NOTE_RELATION_TYPE_TRADE = 2
        
        try:
            if is_parent:
                # Fetch parent: Get source entity and find what it points to
                # Example: Note(id=10) has related_type_id=2, related_id=5 -> find Trade(id=5)
                source_model = MODEL_MAP.get(source_type)
                if not source_model:
                    logger.warning(f"Unknown source model: {source_type}")
                    return []
                
                source_entity = db.query(source_model).filter(source_model.id == source_id).first()
                if not source_entity:
                    return []
                
                # Check if source entity points to target type
                if hasattr(source_entity, 'related_type_id') and hasattr(source_entity, 'related_id'):
                    if getattr(source_entity, 'related_type_id') == relation_type_id:
                        target_id = getattr(source_entity, 'related_id')
                        if target_id:
                            target_model = MODEL_MAP.get(target_type)
                            if target_model:
                                target_entity = db.query(target_model).filter(target_model.id == target_id).first()
                                if target_entity:
                                    item = self._format_entity(target_entity, target_type, db)
                                    if item and self._should_add_item(target_type, item['id'], config):
                                        return [item]
                
                return []
            else:
                # Fetch children: Find entities (e.g., Note) that point to source_id
                # Example: Find all Notes where related_type_id=2 and related_id=5 (for Trade id=5)
                child_model = MODEL_MAP.get(target_type)  # target_type is the child type (e.g., 'note')
                if not child_model:
                    logger.warning(f"Unknown child model: {target_type}")
                    return []
                
                # Query: child.related_type_id == relation_type_id AND child.related_id == source_id
                children = db.query(child_model).filter(
                    getattr(child_model, 'related_type_id') == relation_type_id,
                    getattr(child_model, 'related_id') == source_id
                ).all()
                
                results = []
                for child in children:
                    item = self._format_entity(child, target_type, db)
                    if item and self._should_add_item(target_type, item['id'], config):
                        results.append(item)
                
                return results
                
        except Exception as e:
            logger.error(f"Error fetching legacy relationship {source_type} -> {target_type}: {e}")
            return []
    
    def _apply_cascades(
        self,
        db: Session,
        linked_items: List[Dict[str, Any]],
        source_type: str,
        source_id: int
    ) -> List[Dict[str, Any]]:
        """
        Apply cascade logic (e.g., execution -> trade -> ticker).
        
        For each linked item that has cascade rules, fetch additional related entities.
        """
        # Get schema for source entity
        if source_type not in self.schema:
            return linked_items
        
        entity_schema = self.schema[source_type]
        cascaded_items = []
        
        # Check parents for cascade rules
        if 'parents' in entity_schema:
            for parent_type, parent_config in entity_schema['parents'].items():
                if parent_config.get('cascade_ticker'):
                    # Find parent items of this type
                    parent_items = [item for item in linked_items if item.get('type') == parent_type]
                    for parent_item in parent_items:
                        # Cascade to ticker
                        if parent_type == 'trade':
                            # Get ticker from trade
                            trade = db.query(Trade).options(joinedload(Trade.ticker)).filter(
                                Trade.id == parent_item['id']
                            ).first()
                            if trade and trade.ticker:
                                ticker_item = self._format_entity(trade.ticker, 'ticker', db)
                                if ticker_item and self._should_add_item('ticker', ticker_item['id'], {}):
                                    cascaded_items.append(ticker_item)
                
                if parent_config.get('cascade_account'):
                    # Find parent items and cascade to trading_account
                    parent_items = [item for item in linked_items if item.get('type') == parent_type]
                    for parent_item in parent_items:
                        if parent_type == 'trade_plan':
                            trade_plan = db.query(TradePlan).filter(TradePlan.id == parent_item['id']).first()
                            if trade_plan and trade_plan.trading_account_id:
                                account = db.query(TradingAccount).filter(
                                    TradingAccount.id == trade_plan.trading_account_id
                                ).first()
                                if account:
                                    account_item = self._format_entity(account, 'trading_account', db)
                                    if account_item and self._should_add_item('trading_account', account_item['id'], parent_config):
                                        cascaded_items.append(account_item)
                        elif parent_type == 'trade':
                            trade = db.query(Trade).filter(Trade.id == parent_item['id']).first()
                            if trade and trade.trading_account_id:
                                account = db.query(TradingAccount).filter(
                                    TradingAccount.id == trade.trading_account_id
                                ).first()
                                if account:
                                    account_item = self._format_entity(account, 'trading_account', db)
                                    if account_item and self._should_add_item('trading_account', account_item['id'], parent_config):
                                        cascaded_items.append(account_item)
                
                if parent_config.get('cascade_plan'):
                    # Find trade items and cascade to trade_plan
                    parent_items = [item for item in linked_items if item.get('type') == parent_type]
                    for parent_item in parent_items:
                        if parent_type == 'trade':
                            trade = db.query(Trade).filter(Trade.id == parent_item['id']).first()
                            if trade and trade.trade_plan_id:
                                trade_plan = db.query(TradePlan).filter(TradePlan.id == trade.trade_plan_id).first()
                                if trade_plan:
                                    plan_item = self._format_entity(trade_plan, 'trade_plan', db)
                                    if plan_item and self._should_add_item('trade_plan', plan_item['id'], parent_config):
                                        cascaded_items.append(plan_item)
        
        # Combine original items with cascaded items
        all_items = linked_items + cascaded_items
        
        # Remove duplicates based on (type, id) pairs
        seen = set()
        unique_items = []
        for item in all_items:
            key = (item.get('type'), item.get('id'))
            if key not in seen:
                seen.add(key)
                unique_items.append(item)
        
        return unique_items
    
    def _format_entity(self, entity: Any, entity_type: str, db: Session) -> Optional[Dict[str, Any]]:
        """
        Format entity to canonical linked item schema.
        
        Args:
            entity: SQLAlchemy entity object
            entity_type: Type of entity
            db: Database session (for fetching related data)
            
        Returns:
            Formatted dictionary conforming to canonical schema
        """
        if not entity:
            return None
        
        try:
            # Get field definitions
            field_defs = LINKED_ITEM_FIELDS.get(entity_type, {
                'required': ['id', 'type', 'name', 'title', 'status', 'created_at'],
                'optional': ['description', 'updated_at'],
                'never': []
            })
            
            # Build base item
            item = {
                'id': getattr(entity, 'id', None),
                'type': entity_type,
                'status': getattr(entity, 'status', 'active'),
                'created_at': self._format_datetime(getattr(entity, 'created_at', None)),
                'updated_at': self._format_datetime(getattr(entity, 'updated_at', None))
            }
            
            # Add required fields
            for field in field_defs.get('required', []):
                if field not in item:
                    value = getattr(entity, field, None)
                    if value is not None:
                        item[field] = value
            
            # Add optional fields if present
            for field in field_defs.get('optional', []):
                value = getattr(entity, field, None)
                if value is not None:
                    if hasattr(value, 'isoformat'):  # datetime
                        item[field] = value.isoformat()
                    else:
                        item[field] = value
            
            # Entity-specific formatting
            if entity_type == 'trade':
                # Add ticker symbol
                if hasattr(entity, 'ticker') and entity.ticker:
                    item['ticker_symbol'] = entity.ticker.symbol
                elif hasattr(entity, 'ticker_id') and entity.ticker_id:
                    ticker = db.query(Ticker).filter(Ticker.id == entity.ticker_id).first()
                    if ticker:
                        item['ticker_symbol'] = ticker.symbol
                
                # Format name and title
                ticker_symbol = item.get('ticker_symbol', '')
                side = item.get('side', '')
                item['name'] = f"טרייד {side} על {ticker_symbol}".strip() if ticker_symbol else f"טרייד #{item['id']}"
                item['title'] = item['name']
                item['description'] = item['name']
            
            elif entity_type == 'trade_plan':
                # Add ticker symbol
                if hasattr(entity, 'ticker') and entity.ticker:
                    item['ticker_symbol'] = entity.ticker.symbol
                elif hasattr(entity, 'ticker_id') and entity.ticker_id:
                    ticker = db.query(Ticker).filter(Ticker.id == entity.ticker_id).first()
                    if ticker:
                        item['ticker_symbol'] = ticker.symbol
                
                # Format name and title
                ticker_symbol = item.get('ticker_symbol', '')
                side = item.get('side', '')
                item['name'] = f"תכנית {side} על {ticker_symbol}".strip() if ticker_symbol else f"תכנית #{item['id']}"
                item['title'] = item['name']
                item['description'] = f"תכנית השקעה #{item['id']}"
            
            elif entity_type == 'execution':
                # Add ticker symbol
                if hasattr(entity, 'ticker') and entity.ticker:
                    item['ticker_symbol'] = entity.ticker.symbol
                elif hasattr(entity, 'ticker_id') and entity.ticker_id:
                    ticker = db.query(Ticker).filter(Ticker.id == entity.ticker_id).first()
                    if ticker:
                        item['ticker_symbol'] = ticker.symbol
                elif hasattr(entity, 'trade') and entity.trade:
                    if hasattr(entity.trade, 'ticker') and entity.trade.ticker:
                        item['ticker_symbol'] = entity.trade.ticker.symbol
                
                # Format name and title
                action = item.get('action', '')
                quantity = getattr(entity, 'quantity', None) or ''
                ticker_symbol = item.get('ticker_symbol', '')
                item['name'] = f"ביצוע {action} {quantity} יחידות {ticker_symbol}".strip() if ticker_symbol else f"ביצוע {action} #{item['id']}"
                item['title'] = item['name']
                item['description'] = item['name']
                item['date'] = self._format_datetime(getattr(entity, 'date', None) or getattr(entity, 'created_at', None))
            
            elif entity_type == 'cash_flow':
                # Add currency symbol
                if hasattr(entity, 'currency') and entity.currency:
                    from services.currency_service import CurrencyService
                    currency_symbol = CurrencyService.get_display_symbol(entity.currency.symbol) or entity.currency.symbol
                    item['currency_symbol'] = currency_symbol
                elif hasattr(entity, 'currency_id') and entity.currency_id:
                    from models.currency import Currency
                    from services.currency_service import CurrencyService
                    currency = db.query(Currency).filter(Currency.id == entity.currency_id).first()
                    if currency:
                        item['currency_symbol'] = CurrencyService.get_display_symbol(currency.symbol) or currency.symbol
                
                # Format name and title
                amount = item.get('amount', '')
                currency_symbol = item.get('currency_symbol', '')
                item['name'] = f"{currency_symbol}{amount}" if amount else f"תזרים #{item['id']}"
                item['title'] = f"תזרים {item.get('type', '')}" or f"תזרים #{item['id']}"
                item['description'] = item['title']
                item['date'] = self._format_datetime(getattr(entity, 'date', None) or getattr(entity, 'created_at', None))
            
            elif entity_type == 'alert':
                # Format name and title
                message = getattr(entity, 'message', None)
                item['name'] = message or f"התראה #{item['id']}"
                item['title'] = item['name']
                item['description'] = f"התראה לטיקר {entity.ticker_id}" if hasattr(entity, 'ticker_id') and entity.ticker_id else f"התראה #{item['id']}"
                item['is_triggered'] = getattr(entity, 'is_triggered', None)
            
            elif entity_type == 'note':
                # Format name and title from content
                content = getattr(entity, 'content', '') or ''
                if content:
                    first_line = content.split('\n')[0]
                    item['name'] = (first_line[:50] + '...') if len(first_line) > 50 else first_line
                else:
                    item['name'] = f"הערה #{item['id']}"
                item['title'] = item['name']
                item['description'] = content[:50] + '...' if len(content) > 50 else content
                item['content'] = content
            
            elif entity_type == 'ticker':
                # Format name and title
                symbol = getattr(entity, 'symbol', None)
                item['name'] = symbol or f"טיקר #{item['id']}"
                item['title'] = item['name']
                item['description'] = item['name']
            
            elif entity_type == 'trading_account':
                # Format name and title
                name = getattr(entity, 'name', None)
                item['name'] = name or f"חשבון #{item['id']}"
                item['title'] = item['name']
                item['description'] = f"חשבון מסחר {item['name']}"
            
            # Ensure required fields are present
            if 'name' not in item or not item['name']:
                item['name'] = f"{entity_type} #{item['id']}"
            if 'title' not in item or not item['title']:
                item['title'] = item['name']
            if 'description' not in item:
                item['description'] = item.get('name', '')
            
            # Validate item
            if not validate_linked_item(item):
                logger.warning(f"Invalid linked item: {item}")
                return None
            
            return item
            
        except Exception as e:
            logger.error(f"Error formatting entity {entity_type} {entity.id if hasattr(entity, 'id') else 'unknown'}: {e}")
            return None
    
    def _format_datetime(self, value: Any) -> Optional[str]:
        """Format datetime to ISO string."""
        if not value:
            return None
        try:
            return value.isoformat()
        except AttributeError:
            return str(value)
    
    def _should_add_item(self, entity_type: str, entity_id: int, config: Dict[str, Any]) -> bool:
        """
        Check if item should be added (duplicate prevention).
        
        Args:
            entity_type: Type of entity
            entity_id: ID of entity
            config: Relationship configuration
            
        Returns:
            True if item should be added, False otherwise
        """
        if config.get('prevent_duplicates'):
            key = (entity_type, entity_id)
            if key in self.seen_ids:
                return False
            self.seen_ids.add(key)
        
        return True
    
    def _extract_through_field(self, source_type: str, through_model_name: str) -> str:
        """Extract field name for through relationship."""
        # For alert -> plan_condition -> trade_plan:
        # alert has plan_condition_id field
        if through_model_name == 'PlanCondition':
            return 'plan_condition_id'
        elif through_model_name == 'TradeCondition':
            return 'trade_condition_id'
        else:
            return 'id'
    
    def _extract_target_field(self, target_query: str) -> str:
        """Extract target field name from query string."""
        # Example: 'PlanCondition.trade_plan_id' -> 'trade_plan_id'
        if '.' in target_query:
            return target_query.split('.')[-1]
        return 'id'
    
    def _extract_source_field_for_through(self, source_type: str, through_model_name: str) -> str:
        """Extract source field name for through relationship (children direction)."""
        # For trade_plan -> PlanCondition -> alert:
        # PlanCondition has trade_plan_id field
        if through_model_name == 'PlanCondition':
            return 'trade_plan_id'
        elif through_model_name == 'TradeCondition':
            return 'trade_id'
        else:
            return 'id'

