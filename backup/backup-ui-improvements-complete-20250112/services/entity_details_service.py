"""
Entity Details Service - TikTrack
================================

This module provides unified access to entity details across all entity types in the system.
Includes fetching entity data, linked items, external data integration, and more.

Classes:
    EntityDetailsService: Main service for entity details management

Author: Nimrod
Version: 1.0.0  
Date: September 4, 2025
"""

from sqlalchemy.orm import Session
from models.ticker import Ticker
from models.trade import Trade
from models.trade_plan import TradePlan
from models.execution import Execution
from models.trading_account import TradingAccount
from models.alert import Alert
from models.cash_flow import CashFlow
from models.note import Note
from services.validation_service import ValidationService
from services.advanced_cache_service import cache_for, cache_with_deps, invalidate_cache
from services.smart_query_optimizer import optimize_query, profile_query
from typing import List, Optional, Dict, Any, Union, Tuple
import logging
import time

logger = logging.getLogger(__name__)

class EntityDetailsService:
    """
    Service for managing entity details in TikTrack system
    
    This service provides unified functionality for accessing detailed information
    about any entity in the system:
    - Get entity details by type and ID
    - Fetch linked items for any entity
    - Integration with external data systems
    - Unified data formatting and validation
    
    Supported Entity Types:
        - ticker: Stock tickers and financial instruments
        - trade: Trading positions
        - trade_plan: Investment plans
        - execution: Trade executions
        - account: Trading accounts
        - alert: System alerts
        - cash_flow: Cash flow records
        - note: User notes
        
    Example:
        >>> service = EntityDetailsService()
        >>> details = service.get_entity_details(db_session, 'ticker', 1)
        >>> linked = service.get_linked_items(db_session, 'ticker', 1)
    """
    
    # Entity type mappings
    ENTITY_MODELS = {
        'ticker': Ticker,
        'trade': Trade, 
        'trade_plan': TradePlan,
        'execution': Execution,
        'account': TradingAccount,
        'alert': Alert,
        'cash_flow': CashFlow,
        'note': Note
    }
    
    # Fields to include in entity responses
    ENTITY_FIELDS = {
        'ticker': ['id', 'symbol', 'name', 'type', 'status', 'sector', 'currency_id', 
                  'remarks', 'created_at', 'updated_at', 'deleted_at'],
        'trade': ['id', 'symbol', 'account_id', 'ticker_id', 'quantity', 'entry_price',
                 'exit_price', 'trade_type', 'status', 'profit_loss', 'created_at', 'updated_at'],
        'trade_plan': ['id', 'symbol', 'account_id', 'ticker_id', 'target_price', 'stop_loss',
                      'strategy', 'risk_level', 'status', 'plan_type', 'created_at', 'updated_at'],
        'execution': ['id', 'trade_id', 'symbol', 'execution_type', 'quantity', 'price',
                     'commission', 'execution_date', 'status', 'created_at'],
        'account': ['id', 'name', 'account_number', 'account_type', 'bank_name', 'balance',
                   'currency_id', 'status', 'remarks', 'created_at', 'updated_at'],
        'alert': ['id', 'title', 'ticker_id', 'alert_type', 'condition', 'target_value',
                 'is_active', 'status', 'triggered_at', 'created_at', 'updated_at'],
        'cash_flow': ['id', 'account_id', 'flow_type', 'amount', 'flow_date', 'category',
                     'description', 'status', 'created_at', 'updated_at'],
        'note': ['id', 'title', 'content', 'category', 'importance', 'linked_object_type',
                'linked_object_id', 'created_at', 'updated_at']
    }
    
    @staticmethod
    @cache_for(ttl=300)  # Cache for 5 minutes
    def get_entity_details(db: Session, entity_type: str, entity_id: int) -> Optional[Dict[str, Any]]:
        """
        Get detailed information for a specific entity
        
        Args:
            db (Session): Database connection
            entity_type (str): Type of entity (ticker, trade, etc.)
            entity_id (int): ID of the entity
            
        Returns:
            Optional[Dict[str, Any]]: Entity details or None if not found
            
        Raises:
            ValueError: If entity_type is not supported
            ValidationError: If entity_id is invalid
            
        Example:
            >>> details = EntityDetailsService.get_entity_details(db, 'ticker', 1)
            >>> print(details['symbol'])  # 'AAPL'
        """
        try:
            # Validate input parameters
            if not entity_type or not isinstance(entity_type, str):
                raise ValueError("entity_type must be a non-empty string")
                
            if not entity_id or not isinstance(entity_id, int):
                raise ValueError("entity_id must be a positive integer")
            
            entity_type = entity_type.lower().strip()
            
            # Check if entity type is supported
            if entity_type not in EntityDetailsService.ENTITY_MODELS:
                raise ValueError(f"Unsupported entity type: {entity_type}")
            
            # Get the model class
            model_class = EntityDetailsService.ENTITY_MODELS[entity_type]
            
            # Create optimized query
            base_query = db.query(model_class).filter(model_class.id == entity_id)
            
            # Optimize query using smart query optimizer
            optimization_result = optimize_query(
                base_query,
                expected_usage='read',
                context=f'{entity_type}_details_query'
            )
            
            # Execute query with profiling
            start_time = time.time()
            entity = optimization_result.optimized_query.first()
            execution_time = time.time() - start_time
            
            # Profile the query for performance monitoring
            profile_query(
                base_query,
                execution_time=execution_time,
                operation_type='entity_details_fetch',
                context=f'{entity_type}_details'
            )
            
            if not entity:
                logger.info(f"Entity not found: {entity_type} {entity_id}")
                return None
            
            # Convert to dictionary with only specified fields
            entity_dict = EntityDetailsService._entity_to_dict(entity, entity_type)
            
            # Add linked items count (not full data to avoid circular references)
            entity_dict['linked_items_count'] = EntityDetailsService.get_linked_items_count(db, entity_type, entity_id)
            
            # Add external data if applicable (for tickers)
            if entity_type == 'ticker':
                entity_dict['external_data'] = EntityDetailsService._get_external_data_summary(entity)
            
            logger.debug(f"Successfully fetched details for {entity_type} {entity_id}")
            return entity_dict
            
        except Exception as e:
            logger.error(f"Error getting entity details for {entity_type} {entity_id}: {str(e)}")
            raise
    
    @staticmethod
    @cache_for(ttl=180)  # Cache for 3 minutes (shorter for linked items)
    def get_linked_items(db: Session, entity_type: str, entity_id: int) -> List[Dict[str, Any]]:
        """
        Get linked items for a specific entity
        
        Args:
            db (Session): Database connection
            entity_type (str): Type of parent entity
            entity_id (int): ID of the parent entity
            
        Returns:
            List[Dict[str, Any]]: List of linked items with basic info
            
        Example:
            >>> linked = EntityDetailsService.get_linked_items(db, 'ticker', 1)
            >>> print(len(linked))  # Number of linked items
        """
        try:
            # Validate input
            if entity_type not in EntityDetailsService.ENTITY_MODELS:
                raise ValueError(f"Unsupported entity type: {entity_type}")
            
            linked_items = []
            
            # Get linked items based on entity type
            if entity_type == 'ticker':
                linked_items.extend(EntityDetailsService._get_ticker_linked_items(db, entity_id))
            elif entity_type == 'trade':
                linked_items.extend(EntityDetailsService._get_trade_linked_items(db, entity_id))
            elif entity_type == 'trade_plan':
                linked_items.extend(EntityDetailsService._get_trade_plan_linked_items(db, entity_id))
            elif entity_type == 'account':
                linked_items.extend(EntityDetailsService._get_account_linked_items(db, entity_id))
            elif entity_type == 'alert':
                linked_items.extend(EntityDetailsService._get_alert_linked_items(db, entity_id))
            # Add other entity types as needed...
            
            logger.debug(f"Found {len(linked_items)} linked items for {entity_type} {entity_id}")
            return linked_items
            
        except Exception as e:
            logger.error(f"Error getting linked items for {entity_type} {entity_id}: {str(e)}")
            return []  # Return empty list on error rather than raising
    
    @staticmethod
    def get_linked_items_count(db: Session, entity_type: str, entity_id: int) -> int:
        """
        Get count of linked items for entity (for quick display)
        
        Args:
            db (Session): Database connection
            entity_type (str): Type of parent entity
            entity_id (int): ID of the parent entity
            
        Returns:
            int: Count of linked items
        """
        try:
            linked_items = EntityDetailsService.get_linked_items(db, entity_type, entity_id)
            return len(linked_items)
        except Exception as e:
            logger.error(f"Error counting linked items for {entity_type} {entity_id}: {str(e)}")
            return 0
    
    @staticmethod
    def get_entity_with_linked_items(db: Session, entity_type: str, entity_id: int) -> Optional[Dict[str, Any]]:
        """
        Get entity details with full linked items data
        
        Args:
            db (Session): Database connection
            entity_type (str): Type of entity
            entity_id (int): ID of the entity
            
        Returns:
            Optional[Dict[str, Any]]: Entity with linked items or None if not found
        """
        try:
            # Get base entity details
            entity_details = EntityDetailsService.get_entity_details(db, entity_type, entity_id)
            if not entity_details:
                return None
            
            # Get full linked items
            linked_items = EntityDetailsService.get_linked_items(db, entity_type, entity_id)
            entity_details['linked_items'] = linked_items
            
            return entity_details
            
        except Exception as e:
            logger.error(f"Error getting entity with linked items for {entity_type} {entity_id}: {str(e)}")
            raise
    
    # ===== PRIVATE HELPER METHODS =====
    
    @staticmethod
    def _entity_to_dict(entity, entity_type: str) -> Dict[str, Any]:
        """
        Convert entity object to dictionary with specified fields
        
        Args:
            entity: SQLAlchemy entity object
            entity_type (str): Type of entity
            
        Returns:
            Dict[str, Any]: Entity data as dictionary
        """
        try:
            fields = EntityDetailsService.ENTITY_FIELDS.get(entity_type, [])
            entity_dict = {}
            
            for field in fields:
                if hasattr(entity, field):
                    value = getattr(entity, field)
                    # Convert datetime to ISO string for JSON serialization
                    if hasattr(value, 'isoformat'):
                        value = value.isoformat()
                    entity_dict[field] = value
                else:
                    entity_dict[field] = None
            
            # Add entity type for frontend
            entity_dict['entity_type'] = entity_type
            
            return entity_dict
            
        except Exception as e:
            logger.error(f"Error converting entity to dict: {str(e)}")
            return {'id': getattr(entity, 'id', None), 'entity_type': entity_type}
    
    @staticmethod
    def _get_ticker_linked_items(db: Session, ticker_id: int) -> List[Dict[str, Any]]:
        """Get linked items for ticker"""
        linked_items = []
        
        try:
            # Get related trades
            trades = db.query(Trade).filter(Trade.ticker_id == ticker_id).all()
            for trade in trades:
                linked_items.append({
                    'id': trade.id,
                    'type': 'trade',
                    'title': f"טרייד {trade.symbol}",
                    'status': trade.status,
                    'created_at': trade.created_at.isoformat() if trade.created_at else None
                })
            
            # Get related trade plans
            trade_plans = db.query(TradePlan).filter(TradePlan.ticker_id == ticker_id).all()
            for plan in trade_plans:
                linked_items.append({
                    'id': plan.id,
                    'type': 'trade_plan',
                    'title': f"תכנית {plan.symbol}",
                    'status': plan.status,
                    'created_at': plan.created_at.isoformat() if plan.created_at else None
                })
            
            # Get related alerts
            alerts = db.query(Alert).filter(Alert.ticker_id == ticker_id).all()
            for alert in alerts:
                linked_items.append({
                    'id': alert.id,
                    'type': 'alert',
                    'title': alert.title or f"התראה #{alert.id}",
                    'status': alert.status,
                    'created_at': alert.created_at.isoformat() if alert.created_at else None
                })
            
            # Get related notes (by linked_object_id and linked_object_type)
            notes = db.query(Note).filter(
                Note.linked_object_type == 'ticker',
                Note.linked_object_id == ticker_id
            ).all()
            for note in notes:
                linked_items.append({
                    'id': note.id,
                    'type': 'note',
                    'title': note.title or f"הערה #{note.id}",
                    'status': 'active',
                    'created_at': note.created_at.isoformat() if note.created_at else None
                })
                
        except Exception as e:
            logger.error(f"Error getting ticker linked items: {str(e)}")
        
        return linked_items
    
    @staticmethod
    def _get_trade_linked_items(db: Session, trade_id: int) -> List[Dict[str, Any]]:
        """Get linked items for trade"""
        linked_items = []
        
        try:
            # Get related executions
            executions = db.query(Execution).filter(Execution.trade_id == trade_id).all()
            for execution in executions:
                linked_items.append({
                    'id': execution.id,
                    'type': 'execution',
                    'title': f"ביצוע {execution.symbol}",
                    'status': execution.status,
                    'created_at': execution.created_at.isoformat() if execution.created_at else None
                })
            
            # Get the ticker
            trade = db.query(Trade).filter(Trade.id == trade_id).first()
            if trade and trade.ticker_id:
                ticker = db.query(Ticker).filter(Ticker.id == trade.ticker_id).first()
                if ticker:
                    linked_items.append({
                        'id': ticker.id,
                        'type': 'ticker',
                        'title': f"טיקר {ticker.symbol}",
                        'status': ticker.status,
                        'created_at': ticker.created_at.isoformat() if ticker.created_at else None
                    })
            
            # Get related notes
            notes = db.query(Note).filter(
                Note.linked_object_type == 'trade',
                Note.linked_object_id == trade_id
            ).all()
            for note in notes:
                linked_items.append({
                    'id': note.id,
                    'type': 'note',
                    'title': note.title or f"הערה #{note.id}",
                    'status': 'active',
                    'created_at': note.created_at.isoformat() if note.created_at else None
                })
                
        except Exception as e:
            logger.error(f"Error getting trade linked items: {str(e)}")
        
        return linked_items
    
    @staticmethod
    def _get_trade_plan_linked_items(db: Session, plan_id: int) -> List[Dict[str, Any]]:
        """Get linked items for trade plan"""
        linked_items = []
        
        try:
            # Get the ticker
            plan = db.query(TradePlan).filter(TradePlan.id == plan_id).first()
            if plan and plan.ticker_id:
                ticker = db.query(Ticker).filter(Ticker.id == plan.ticker_id).first()
                if ticker:
                    linked_items.append({
                        'id': ticker.id,
                        'type': 'ticker',
                        'title': f"טיקר {ticker.symbol}",
                        'status': ticker.status,
                        'created_at': ticker.created_at.isoformat() if ticker.created_at else None
                    })
            
            # Get related trades (same ticker)
            if plan and plan.ticker_id:
                trades = db.query(Trade).filter(Trade.ticker_id == plan.ticker_id).all()
                for trade in trades:
                    linked_items.append({
                        'id': trade.id,
                        'type': 'trade',
                        'title': f"טרייד {trade.symbol}",
                        'status': trade.status,
                        'created_at': trade.created_at.isoformat() if trade.created_at else None
                    })
            
            # Get related notes
            notes = db.query(Note).filter(
                Note.linked_object_type == 'trade_plan',
                Note.linked_object_id == plan_id
            ).all()
            for note in notes:
                linked_items.append({
                    'id': note.id,
                    'type': 'note',
                    'title': note.title or f"הערה #{note.id}",
                    'status': 'active',
                    'created_at': note.created_at.isoformat() if note.created_at else None
                })
                
        except Exception as e:
            logger.error(f"Error getting trade plan linked items: {str(e)}")
        
        return linked_items
    
    @staticmethod
    def _get_account_linked_items(db: Session, account_id: int) -> List[Dict[str, Any]]:
        """Get linked items for account"""
        linked_items = []
        
        try:
            # Get related trades
            trades = db.query(Trade).filter(Trade.trading_account_id == account_id).all()
            for trade in trades:
                linked_items.append({
                    'id': trade.id,
                    'type': 'trade',
                    'title': f"טרייד {trade.symbol}",
                    'status': trade.status,
                    'created_at': trade.created_at.isoformat() if trade.created_at else None
                })
            
            # Get related trade plans
            trade_plans = db.query(TradePlan).filter(TradePlan.trading_account_id == account_id).all()
            for plan in trade_plans:
                linked_items.append({
                    'id': plan.id,
                    'type': 'trade_plan',
                    'title': f"תכנית {plan.symbol}",
                    'status': plan.status,
                    'created_at': plan.created_at.isoformat() if plan.created_at else None
                })
            
            # Get related cash flows
            cash_flows = db.query(CashFlow).filter(CashFlow.trading_account_id == account_id).all()
            for flow in cash_flows:
                linked_items.append({
                    'id': flow.id,
                    'type': 'cash_flow',
                    'title': f"תזרים {flow.flow_type}",
                    'status': flow.status,
                    'created_at': flow.created_at.isoformat() if flow.created_at else None
                })
                
        except Exception as e:
            logger.error(f"Error getting account linked items: {str(e)}")
        
        return linked_items
    
    @staticmethod
    def _get_alert_linked_items(db: Session, alert_id: int) -> List[Dict[str, Any]]:
        """Get linked items for alert - using new generic system"""
        linked_items = []
        
        try:
            alert = db.query(Alert).filter(Alert.id == alert_id).first()
            if not alert:
                return []
            
            # Use the new generic relationship system
            if alert.related_type_id == 1:  # Ticker
                ticker = db.query(Ticker).filter(Ticker.id == alert.related_id).first()
                if ticker:
                    linked_items.append({
                        'id': ticker.id,
                        'type': 'ticker',
                        'title': f"טיקר {ticker.symbol}",
                        'status': ticker.status,
                        'created_at': ticker.created_at.isoformat() if ticker.created_at else None
                    })
                    
                    # Get related trades for this ticker
                    trades = db.query(Trade).filter(Trade.ticker_id == alert.related_id).all()
                    for trade in trades:
                        linked_items.append({
                            'id': trade.id,
                            'type': 'trade',
                            'title': f"טרייד #{trade.id}",
                            'status': trade.status,
                            'created_at': trade.created_at.isoformat() if trade.created_at else None
                        })
                        
            elif alert.related_type_id == 2:  # Trade
                trade = db.query(Trade).filter(Trade.id == alert.related_id).first()
                if trade:
                    linked_items.append({
                        'id': trade.id,
                        'type': 'trade',
                        'title': f"טרייד #{trade.id}",
                        'status': trade.status,
                        'created_at': trade.created_at.isoformat() if trade.created_at else None
                    })
                    
            elif alert.related_type_id == 3:  # Trading Account
                account = db.query(TradingAccount).filter(TradingAccount.id == alert.related_id).first()
                if account:
                    linked_items.append({
                        'id': account.id,
                        'type': 'trading_account',
                        'title': f"חשבון {account.name}",
                        'status': account.status,
                        'created_at': account.created_at.isoformat() if account.created_at else None
                    })
                    
            elif alert.related_type_id == 4:  # Trade Plan
                plan = db.query(TradePlan).filter(TradePlan.id == alert.related_id).first()
                if plan:
                    linked_items.append({
                        'id': plan.id,
                        'type': 'trade_plan',
                        'title': f"תכנון #{plan.id}",
                        'status': plan.status,
                        'created_at': plan.created_at.isoformat() if plan.created_at else None
                    })
                
        except Exception as e:
            logger.error(f"Error getting alert linked items: {str(e)}")
        
        return linked_items
    
    @staticmethod
    def _get_external_data_summary(ticker_entity) -> Optional[Dict[str, Any]]:
        """
        Get external data summary for ticker
        
        Args:
            ticker_entity: Ticker entity object
            
        Returns:
            Optional[Dict[str, Any]]: External data summary or None
        """
        try:
            # This would integrate with the external data system
            # For now, return basic structure
            return {
                'has_external_data': True,
                'last_price_update': None,
                'market_status': 'unknown',
                'data_source': 'yahoo_finance'
            }
            
        except Exception as e:
            logger.error(f"Error getting external data summary: {str(e)}")
            return None
    
    @staticmethod
    def invalidate_entity_cache(entity_type: str, entity_id: int) -> None:
        """
        Invalidate cache for specific entity
        
        Args:
            entity_type (str): Type of entity
            entity_id (int): ID of the entity
        """
        try:
            # Clear entity details cache
            cache_key = f"get_entity_details_{entity_type}_{entity_id}"
            invalidate_cache(cache_key)
            
            # Clear linked items cache
            linked_cache_key = f"get_linked_items_{entity_type}_{entity_id}"
            invalidate_cache(linked_cache_key)
            
            logger.debug(f"Invalidated cache for {entity_type} {entity_id}")
            
        except Exception as e:
            logger.error(f"Error invalidating cache for {entity_type} {entity_id}: {str(e)}")
    
    @staticmethod
    def get_supported_entity_types() -> List[str]:
        """
        Get list of supported entity types
        
        Returns:
            List[str]: List of supported entity types
        """
        return list(EntityDetailsService.ENTITY_MODELS.keys())
    
    @staticmethod
    def validate_entity_type(entity_type: str) -> bool:
        """
        Validate if entity type is supported
        
        Args:
            entity_type (str): Entity type to validate
            
        Returns:
            bool: True if supported, False otherwise
        """
        return entity_type.lower().strip() in EntityDetailsService.ENTITY_MODELS