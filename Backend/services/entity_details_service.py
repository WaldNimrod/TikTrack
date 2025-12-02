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

from sqlalchemy.orm import Session, joinedload  # type: ignore
from models.ticker import Ticker
from models.trade import Trade
from models.trade_plan import TradePlan
from models.execution import Execution
from models.trading_account import TradingAccount
from models.alert import Alert
from models.cash_flow import CashFlow
from models.note import Note
from models.note_relation_type import NoteRelationType
from models.currency import Currency
from services.validation_service import ValidationService
from services.advanced_cache_service import cache_for, cache_with_deps, invalidate_cache
from services.smart_query_optimizer import optimize_query, profile_query
from services.account_activity_service import AccountActivityService
from services.position_portfolio_service import PositionPortfolioService
from services.position_calculator_service import PositionCalculatorService
from services.currency_service import CurrencyService
from services.tag_service import TagService, SUPPORTED_ENTITY_TYPES as TAG_SUPPORTED_ENTITY_TYPES
from services.user_service import UserService
from services.cash_flow_service import CashFlowService as CashFlowHelperService
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
        - trading_account: Trading accounts
        - alert: System alerts
        - cash_flow: Cash flow records
        - note: User notes
        
    Example:
        >>> service = EntityDetailsService()
        >>> details = service.get_entity_details(db_session, 'ticker', 1)
        >>> linked = service.get_linked_items(db_session, 'ticker', 1)
    """
    
    USER_SERVICE = UserService()
    _default_user_id_cache: Optional[int] = None
    
    # Entity type mappings
    ENTITY_MODELS = {
        'ticker': Ticker,
        'trade': Trade, 
        'trade_plan': TradePlan,
        'execution': Execution,
        'trading_account': TradingAccount,
        'alert': Alert,
        'cash_flow': CashFlow,
        'note': Note
    }
    
    # Fields to include in entity responses
    ENTITY_FIELDS = {
        'ticker': ['id', 'symbol', 'name', 'type', 'status', 'sector', 'currency_id', 
                  'remarks', 'active_trades', 'created_at', 'updated_at', 'deleted_at'],
        'trade': [
            'id',
            'symbol',
            'trading_account_id',
            'ticker_id',
            'trade_plan_id',
            # Planning snapshot fields on the trade itself
            'planned_quantity',
            'planned_amount',
            'entry_price',
            # Legacy / derived fields (may be populated by other services)
            'quantity',
            'exit_price',
            'trade_type',
            'status',
            'profit_loss',
            'total_pl',
            'side',
            'investment_type',
            'closed_at',
            'cancelled_at',
            'cancel_reason',
            'notes',
            'created_at',
            'updated_at',
        ],
        'trade_plan': ['id', 'symbol', 'trading_account_id', 'ticker_id', 'investment_type', 'side', 
                      'planned_amount', 'entry_price', 'entry_conditions', 'target_price', 'stop_price', 
                      'target_percentage', 'stop_percentage', 'status', 'cancelled_at', 
                      'cancel_reason', 'created_at', 'updated_at'],
        'execution': ['id', 'trade_id', 'ticker_id', 'trading_account_id', 'action', 'date', 'quantity', 'price',
                     'fee', 'source', 'external_id', 'notes', 'realized_pl', 'mtm_pl', 'created_at', 'updated_at'],
        'trading_account': ['id', 'name', 'currency_id', 'status', 'opening_balance', 'total_value',
                           'total_pl', 'notes', 'created_at', 'updated_at'],
        'alert': ['id', 'title', 'ticker_id', 'alert_type', 'condition', 'target_value',
                 'is_active', 'status', 'triggered_at', 'created_at', 'updated_at'],
        'cash_flow': ['id', 'trading_account_id', 'type', 'amount', 'fee_amount', 'date',
                     'currency_id', 'usd_rate', 'description', 'source', 'external_id',
                     'trade_id', 'created_at', 'updated_at'],
        'note': ['id', 'content', 'attachment', 'related_type_id', 'related_id', 'created_at', 'updated_at']
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
            if entity_type == 'account':
                logger.warning("Deprecated entity type 'account' requested. Converting to 'trading_account'.")
                entity_type = 'trading_account'
            
            # Check if entity type is supported
            if entity_type not in EntityDetailsService.ENTITY_MODELS:
                raise ValueError(f"Unsupported entity type: {entity_type}")
            
            # Get the model class
            model_class = EntityDetailsService.ENTITY_MODELS[entity_type]
            
            # Create optimized query with relationships
            
            base_query = db.query(model_class).filter(model_class.id == entity_id)
            
            # Eager load relationships for better performance
            if entity_type == 'trade_plan':
                base_query = base_query.options(joinedload(TradePlan.account), joinedload(TradePlan.ticker))
            elif entity_type == 'trade':
                base_query = base_query.options(joinedload(Trade.account), joinedload(Trade.ticker), joinedload(Trade.trade_plan))
            elif entity_type == 'ticker':
                base_query = base_query.options(joinedload(Ticker.currency))
            elif entity_type == 'execution':
                from models.execution import Execution
                base_query = base_query.options(joinedload(Execution.ticker), joinedload(Execution.trading_account), joinedload(Execution.trade))
            elif entity_type == 'cash_flow':
                base_query = base_query.options(
                    joinedload(CashFlow.account),
                    joinedload(CashFlow.currency),
                    joinedload(CashFlow.trade).joinedload(Trade.ticker)  # type: ignore[attr-defined]
                )
            
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
            
            # Profile the query for performance monitoring (without unsupported parameters)
            try:
                profile_query(
                    base_query,
                    execution_time=execution_time
                )
            except Exception as e:
                logger.debug(f"Query profiling skipped (non-critical): {str(e)}")
            
            if not entity:
                logger.info(f"Entity not found: {entity_type} {entity_id}")
                return None
            
            # Convert to dictionary with only specified fields
            entity_dict = EntityDetailsService._entity_to_dict(entity, entity_type)

            # Normalize currency symbol display for trading accounts and other entities
            if entity_type == 'trading_account':
                if entity_dict.get('currency_symbol'):
                    display_symbol = CurrencyService.get_display_symbol(entity_dict['currency_symbol'])
                    if display_symbol:
                        entity_dict['currency_symbol'] = display_symbol
                if entity_dict.get('base_currency_symbol'):
                    display_symbol = CurrencyService.get_display_symbol(entity_dict['base_currency_symbol'])
                    if display_symbol:
                        entity_dict['base_currency_symbol'] = display_symbol

            # Special handling for trade: opened_at is mapped from created_at and calculate position
            if entity_type == 'trade':
                if 'created_at' in entity_dict and 'opened_at' not in entity_dict:
                    entity_dict['opened_at'] = entity_dict['created_at']
                
                # Add account name and total value for percent calculation
                if hasattr(entity, 'account') and entity.account:
                    entity_dict['account_name'] = entity.account.name
                elif hasattr(entity, 'trading_account_id') and entity.trading_account_id:
                    # Fallback: fetch account if relationship not loaded
                    account = db.query(TradingAccount).filter(TradingAccount.id == entity.trading_account_id).first()
                    if account:
                        entity_dict['account_name'] = account.name
                    else:
                        entity_dict['account_name'] = None
                
                # Get account total value (cash + positions) for percent calculation
                # Same calculation as in PositionPortfolioService.calculate_all_account_positions
                try:
                    # Get cash balance
                    activity_data = AccountActivityService.get_account_activity(
                        db=db,
                        account_id=entity.trading_account_id,
                        start_date=None,
                        end_date=None
                    )
                    cash_balance = activity_data.get('base_currency_total', 0.0) or 0.0
                    
                    # Get all positions for this account and sum market values
                    positions = PositionPortfolioService.calculate_all_account_positions(
                        db=db,
                        trading_account_id=entity.trading_account_id,
                        include_closed=False,
                        include_market_data=True
                    )
                    account_positions_value = sum(p.get('market_value', 0) or 0 for p in positions)
                    
                    # Total account value = cash balance + positions value
                    entity_dict['account_total_value'] = cash_balance + account_positions_value
                except Exception as balance_error:
                    logger.warning(f"Error getting account total value for trade {entity_id}: {str(balance_error)}")
                    entity_dict['account_total_value'] = 0.0
                
                # Calculate position for this trade
                try:
                    position_calculator = PositionCalculatorService()
                    position = position_calculator.calculate_position(db, entity_id)
                    if position:
                        entity_dict['position'] = position
                        entity_dict['position_quantity'] = position.get('quantity', 0)
                        entity_dict['position_amount'] = position.get('total_cost', 0)
                    else:
                        entity_dict['position'] = None
                        entity_dict['position_quantity'] = 0
                        entity_dict['position_amount'] = 0
                except Exception as position_error:
                    logger.warning(f"Error calculating position for trade {entity_id}: {str(position_error)}")
                    entity_dict['position'] = None
                    entity_dict['position_quantity'] = 0
                    entity_dict['position_amount'] = 0
            
            # Special handling for trade_plan: add account_name from relationship
            if entity_type == 'trade_plan':
                if hasattr(entity, 'account') and entity.account:
                    entity_dict['account_name'] = entity.account.name
                elif hasattr(entity, 'trading_account_id') and entity.trading_account_id:
                    # Fallback: fetch account name if relationship not loaded
                    account = db.query(TradingAccount).filter(TradingAccount.id == entity.trading_account_id).first()
                    if account:
                        entity_dict['account_name'] = account.name
                    else:
                        entity_dict['account_name'] = None
            
            # Special handling for execution: add ticker_symbol and account_name from relationships
            if entity_type == 'execution':
                # Add ticker symbol
                if hasattr(entity, 'ticker') and entity.ticker:
                    entity_dict['ticker_symbol'] = entity.ticker.symbol
                elif hasattr(entity, 'ticker_id') and entity.ticker_id:
                    # Fallback: fetch ticker if relationship not loaded
                    ticker = db.query(Ticker).filter(Ticker.id == entity.ticker_id).first()
                    if ticker:
                        entity_dict['ticker_symbol'] = ticker.symbol
                    else:
                        entity_dict['ticker_symbol'] = None
                else:
                    entity_dict['ticker_symbol'] = None
                
                # Add account name
                if hasattr(entity, 'trading_account') and entity.trading_account:
                    entity_dict['account_name'] = entity.trading_account.name
                    entity_dict['trading_account_name'] = entity.trading_account.name
                elif hasattr(entity, 'trading_account_id') and entity.trading_account_id:
                    # Fallback: fetch account if relationship not loaded
                    account = db.query(TradingAccount).filter(TradingAccount.id == entity.trading_account_id).first()
                    if account:
                        entity_dict['account_name'] = account.name
                        entity_dict['trading_account_name'] = account.name
                    else:
                        entity_dict['account_name'] = None
                        entity_dict['trading_account_name'] = None
                else:
                    entity_dict['account_name'] = None
                    entity_dict['trading_account_name'] = None
                
                # Add trade ticker symbol if trade exists
                if hasattr(entity, 'trade') and entity.trade:
                    if hasattr(entity.trade, 'ticker') and entity.trade.ticker:
                        entity_dict['trade_ticker_symbol'] = entity.trade.ticker.symbol
                    elif hasattr(entity.trade, 'ticker_id') and entity.trade.ticker_id:
                        trade_ticker = db.query(Ticker).filter(Ticker.id == entity.trade.ticker_id).first()
                        if trade_ticker:
                            entity_dict['trade_ticker_symbol'] = trade_ticker.symbol
                
                # Use to_dict() to get symbol field (from Execution.to_dict)
                execution_dict = entity.to_dict()
                if 'symbol' in execution_dict:
                    entity_dict['symbol'] = execution_dict['symbol']
            
            # Special handling for cash flow: enrich with related metadata
            if entity_type == 'cash_flow':
                # Ensure date is ISO formatted string if available
                if hasattr(entity, 'date') and entity.date and not isinstance(entity_dict.get('date'), str):
                    try:
                        entity_dict['date'] = entity.date.isoformat()
                    except AttributeError:
                        entity_dict['date'] = entity_dict.get('date')

                # Add account name
                account_name = None
                if hasattr(entity, 'account') and entity.account:
                    account_name = entity.account.name
                elif entity_dict.get('trading_account_id'):
                    account = db.query(TradingAccount).filter(TradingAccount.id == entity_dict['trading_account_id']).first()
                    account_name = account.name if account else None
                entity_dict['account_name'] = account_name
                entity_dict['trading_account_name'] = account_name

                # Add currency metadata
                currency_symbol = None
                currency_name = None
                if hasattr(entity, 'currency') and entity.currency:
                    currency_symbol = entity.currency.symbol
                    currency_name = entity.currency.name
                elif entity_dict.get('currency_id'):
                    currency = db.query(Currency).filter(Currency.id == entity_dict['currency_id']).first()
                    if currency:
                        currency_symbol = currency.symbol
                        currency_name = currency.name
                if currency_symbol:
                    entity_dict['currency_symbol'] = CurrencyService.get_display_symbol(currency_symbol) or currency_symbol
                    currency_symbol = entity_dict['currency_symbol']

                # Ensure type aliases for backward compatibility
                if 'type' in entity_dict and entity_dict.get('type') is not None:
                    entity_dict['flow_type'] = entity_dict['type']
                if 'date' in entity_dict and entity_dict.get('date') is not None:
                    entity_dict['flow_date'] = entity_dict['date']

                # Add trade metadata if linked
                trade_symbol = None
                trade_ticker_symbol = None
                trade_status = None
                trade_side = None
                trade_ticker_id = None

                if hasattr(entity, 'trade') and entity.trade:
                    trade_symbol = getattr(entity.trade, 'symbol', None)
                    trade_status = getattr(entity.trade, 'status', None)
                    trade_side = getattr(entity.trade, 'side', None)
                    if hasattr(entity.trade, 'ticker') and entity.trade.ticker:
                        trade_ticker_id = entity.trade.ticker.id
                        trade_ticker_symbol = entity.trade.ticker.symbol
                elif entity_dict.get('trade_id'):
                    trade = db.query(Trade).filter(Trade.id == entity_dict['trade_id']).first()
                    if trade:
                        trade_symbol = getattr(trade, 'symbol', None)
                        trade_status = getattr(trade, 'status', None)
                        trade_side = getattr(trade, 'side', None)
                        if hasattr(trade, 'ticker') and trade.ticker:
                            trade_ticker_id = trade.ticker.id
                            trade_ticker_symbol = trade.ticker.symbol
                entity_dict['trade_symbol'] = trade_symbol
                entity_dict['trade_ticker_id'] = trade_ticker_id
                entity_dict['trade_ticker_symbol'] = trade_ticker_symbol
                entity_dict['trade_status'] = trade_status
                entity_dict['trade_side'] = trade_side

                # Default values when not provided
                entity_dict['source'] = entity_dict.get('source') or 'manual'
                entity_dict['external_id'] = entity_dict.get('external_id') or None

                external_id = entity_dict.get('external_id')
                flow_type = entity_dict.get('type')
                if external_id and CashFlowHelperService.is_currency_exchange(external_id, flow_type):
                    exchange_flows = CashFlowHelperService.get_exchange_flows(db, external_id)
                    current_flow = next((flow for flow in exchange_flows if flow.id == entity_id), None)
                    counterpart_flow = next((flow for flow in exchange_flows if flow.id != entity_id), None)

                    entity_dict['exchange_group_id'] = external_id
                    if current_flow:
                        entity_dict['exchange_direction'] = CashFlowHelperService.get_exchange_direction(current_flow.type)

                    if counterpart_flow:
                        counterpart_date = getattr(counterpart_flow, 'date', None)
                        if counterpart_date and hasattr(counterpart_date, 'isoformat'):
                            counterpart_date = counterpart_date.isoformat()
                        entity_dict['linked_exchange_cash_flow_id'] = counterpart_flow.id
                        entity_dict['linked_exchange_summary'] = {
                            "cash_flow_id": counterpart_flow.id,
                            "amount": getattr(counterpart_flow, 'amount', None),
                            "currency_id": getattr(counterpart_flow, 'currency_id', None),
                            "currency_symbol": getattr(getattr(counterpart_flow, 'currency', None), 'symbol', None),
                            "currency_name": getattr(getattr(counterpart_flow, 'currency', None), 'name', None),
                            "usd_rate": getattr(counterpart_flow, 'usd_rate', None),
                            "date": counterpart_date,
                            "type": getattr(counterpart_flow, 'type', None)
                        }

                    from_flow_model = next((flow for flow in exchange_flows if CashFlowHelperService.get_exchange_direction(flow.type) == 'from'), None)
                    to_flow_model = next((flow for flow in exchange_flows if CashFlowHelperService.get_exchange_direction(flow.type) == 'to'), None)
                    pair_summary = CashFlowHelperService.build_exchange_pair_summary(from_flow_model, to_flow_model)
                    if pair_summary:
                        entity_dict['exchange_pair_summary'] = pair_summary

            # Attach tags metadata from tagging system without overriding existing data
            tag_assignments = EntityDetailsService._load_entity_tags(
                db,
                entity_type,
                entity_id
            )
            entity_dict['tag_assignments'] = tag_assignments
            if 'tags' not in entity_dict:
                entity_dict['tags'] = tag_assignments

            # Add ticker object with market data for trade and trade_plan
            if entity_type in ['trade', 'trade_plan']:
                # Add ticker object if ticker relationship is loaded
                if hasattr(entity, 'ticker') and entity.ticker:
                    # Create ticker object in entity_dict if not exists
                    if 'ticker' not in entity_dict:
                        entity_dict['ticker'] = {
                            'id': entity.ticker.id,
                            'symbol': entity.ticker.symbol,
                            'name': entity.ticker.name
                        }
                    
                    # Add market data to ticker object
                    from models.external_data import MarketDataQuote
                    latest_quote = db.query(MarketDataQuote).filter(
                        MarketDataQuote.ticker_id == entity.ticker.id
                    ).order_by(MarketDataQuote.fetched_at.desc()).first()
                    
                    if latest_quote:
                        # Add market data to ticker object
                        entity_dict['ticker']['current_price'] = latest_quote.price
                        entity_dict['ticker']['change_percent'] = latest_quote.change_pct_day
                        entity_dict['ticker']['change_amount'] = latest_quote.change_amount_day
                        entity_dict['ticker']['daily_change'] = latest_quote.change_amount_day  # For frontend compatibility
                        entity_dict['ticker']['daily_change_percent'] = latest_quote.change_pct_day  # For frontend compatibility
                        entity_dict['ticker']['volume'] = latest_quote.volume
                        entity_dict['ticker']['yahoo_updated_at'] = latest_quote.fetched_at.isoformat() if latest_quote.fetched_at else None
                        entity_dict['ticker']['data_source'] = latest_quote.source
                        # Open price data
                        entity_dict['ticker']['open_price'] = latest_quote.open_price
                        entity_dict['ticker']['change_from_open'] = latest_quote.change_amount_from_open
                        entity_dict['ticker']['change_from_open_percent'] = latest_quote.change_pct_from_open
                        # ATR data
                        entity_dict['ticker']['atr'] = latest_quote.atr
                        entity_dict['ticker']['atr_period'] = latest_quote.atr_period or 14
                        
                        # Calculate ATR if not available
                        if latest_quote.atr is None:
                            try:
                                from services.external_data.atr_calculator import ATRCalculator
                                from services.external_data.yahoo_finance_adapter import YahooFinanceAdapter
                                
                                user_id = EntityDetailsService._get_default_user_id()
                                atr_calculator = ATRCalculator(db)
                                adapter = YahooFinanceAdapter(db)
                                
                                atr_result = atr_calculator.get_atr_with_fallback(
                                    ticker_id=entity.ticker.id,
                                    adapter=adapter,
                                    user_id=user_id,
                                    db_session=db
                                )
                                
                                if atr_result and atr_result.atr:
                                    entity_dict['ticker']['atr'] = atr_result.atr
                                    entity_dict['ticker']['atr_period'] = atr_result.period
                                    if atr_result.warnings:
                                        entity_dict['ticker']['atr_warnings'] = atr_result.warnings
                            except Exception as atr_error:
                                logger.warning(f"Error calculating ATR for ticker {entity.ticker.id}: {atr_error}")
                        
                        # Calculate 52W range
                        try:
                            from services.external_data.week52_calculator import Week52Calculator
                            
                            week52_calculator = Week52Calculator(db)
                            week52_result = week52_calculator.calculate_52w_range(
                                ticker_id=entity.ticker.id,
                                db_session=db
                            )
                            
                            if week52_result:
                                entity_dict['ticker']['week52_high'] = week52_result.high
                                entity_dict['ticker']['week52_low'] = week52_result.low
                                if week52_result.warnings:
                                    entity_dict['ticker']['week52_warnings'] = week52_result.warnings
                        except Exception as week52_error:
                            logger.warning(f"Error calculating 52W range for ticker {entity.ticker.id}: {week52_error}")
                        
                        # Calculate volatility
                        try:
                            from services.external_data.technical_indicators_calculator import TechnicalIndicatorsCalculator
                            
                            tech_calculator = TechnicalIndicatorsCalculator(db)
                            volatility_result = tech_calculator.calculate_volatility(
                                ticker_id=entity.ticker.id,
                                period=30,  # 30 days default
                                db_session=db
                            )
                            
                            if volatility_result is not None:
                                entity_dict['ticker']['volatility'] = volatility_result
                        except Exception as volatility_error:
                            logger.warning(f"Error calculating volatility for ticker {entity.ticker.id}: {volatility_error}")
                        
                        logger.debug(f"Added market data to ticker {entity.ticker.id} for {entity_type} {entity_id}: price={latest_quote.price}, change={latest_quote.change_pct_day}%, change_from_open={latest_quote.change_pct_from_open}%, ATR={entity_dict['ticker'].get('atr')}")
                    else:
                        logger.debug(f"No market data found for ticker {entity.ticker.id} in {entity_type} {entity_id}")
                elif hasattr(entity, 'ticker_id') and entity.ticker_id:
                    # Ticker relationship not loaded - fetch ticker and add basic info
                    ticker = db.query(Ticker).filter(Ticker.id == entity.ticker_id).first()
                    if ticker:
                        entity_dict['ticker'] = {
                            'id': ticker.id,
                            'symbol': ticker.symbol,
                            'name': ticker.name
                        }
                        # Try to add market data
                        from models.external_data import MarketDataQuote
                        latest_quote = db.query(MarketDataQuote).filter(
                            MarketDataQuote.ticker_id == ticker.id
                        ).order_by(MarketDataQuote.fetched_at.desc()).first()
                        
                        if latest_quote:
                            entity_dict['ticker']['current_price'] = latest_quote.price
                            entity_dict['ticker']['change_percent'] = latest_quote.change_pct_day
                            entity_dict['ticker']['change_amount'] = latest_quote.change_amount_day
                            # Open price data
                            entity_dict['ticker']['open_price'] = latest_quote.open_price
                            entity_dict['ticker']['change_from_open'] = latest_quote.change_amount_from_open
                            # ATR data
                            entity_dict['ticker']['atr'] = latest_quote.atr
                            entity_dict['ticker']['atr_period'] = latest_quote.atr_period or 14
                            entity_dict['ticker']['change_from_open_percent'] = latest_quote.change_pct_from_open
            
            # Add trade_plan object for trade
            if entity_type == 'trade':
                # Add trade_plan object if trade_plan relationship is loaded
                if hasattr(entity, 'trade_plan') and entity.trade_plan:
                    entity_dict['trade_plan'] = {
                        'id': entity.trade_plan.id,
                        'planned_amount': entity.trade_plan.planned_amount,
                        'target_price': entity.trade_plan.target_price,
                        'stop_price': entity.trade_plan.stop_price,
                        'status': entity.trade_plan.status,
                        'side': entity.trade_plan.side,
                        'investment_type': entity.trade_plan.investment_type
                    }
                    # Add ticker symbol if available
                    if hasattr(entity.trade_plan, 'ticker') and entity.trade_plan.ticker:
                        entity_dict['trade_plan']['ticker_symbol'] = entity.trade_plan.ticker.symbol
                elif hasattr(entity, 'trade_plan_id') and entity.trade_plan_id:
                    # Trade plan relationship not loaded - fetch trade plan
                    trade_plan = db.query(TradePlan).filter(TradePlan.id == entity.trade_plan_id).first()
                    if trade_plan:
                        entity_dict['trade_plan'] = {
                            'id': trade_plan.id,
                            'planned_amount': trade_plan.planned_amount,
                            'target_price': trade_plan.target_price,
                            'stop_price': trade_plan.stop_price,
                            'status': trade_plan.status,
                            'side': trade_plan.side,
                            'investment_type': trade_plan.investment_type
                        }
                        # Add ticker symbol if available
                        if hasattr(trade_plan, 'ticker') and trade_plan.ticker:
                            entity_dict['trade_plan']['ticker_symbol'] = trade_plan.ticker.symbol
                        elif hasattr(trade_plan, 'ticker_id') and trade_plan.ticker_id:
                            ticker = db.query(Ticker).filter(Ticker.id == trade_plan.ticker_id).first()
                            if ticker:
                                entity_dict['trade_plan']['ticker_symbol'] = ticker.symbol
            
            if entity_type == 'note':
                EntityDetailsService._augment_note_details(db, entity, entity_dict)

            # Add linked items count (not full data to avoid circular references)
            entity_dict['linked_items_count'] = EntityDetailsService.get_linked_items_count(db, entity_type, entity_id)
            
            # Add external data if applicable (for tickers)
            if entity_type == 'ticker':
                entity_dict['external_data'] = EntityDetailsService._get_external_data_summary(entity)
                
                # Add provider symbol mappings if they exist
                try:
                    from services.ticker_symbol_mapping_service import TickerSymbolMappingService
                    mappings = TickerSymbolMappingService.get_all_mappings(db, entity_id)
                    if mappings:
                        entity_dict['provider_symbols'] = mappings
                        logger.debug(f"Added {len(mappings)} provider symbol mapping(s) to ticker {entity_id}")
                except Exception as mapping_error:
                    # Log but don't fail - mappings are optional
                    logger.debug(f"Could not load provider symbol mappings for ticker {entity_id}: {str(mapping_error)}")
                
                # Add market data directly to ticker entity (not just in nested ticker object)
                from models.external_data import MarketDataQuote
                latest_quote = db.query(MarketDataQuote).filter(
                    MarketDataQuote.ticker_id == entity_id
                ).order_by(MarketDataQuote.fetched_at.desc()).first()
                
                if latest_quote:
                    # Add market data directly to ticker entity_dict
                    entity_dict['current_price'] = latest_quote.price
                    entity_dict['price'] = latest_quote.price  # Alias for compatibility
                    entity_dict['change_percent'] = latest_quote.change_pct_day
                    entity_dict['change_amount'] = latest_quote.change_amount_day
                    entity_dict['daily_change'] = latest_quote.change_amount_day
                    entity_dict['daily_change_percent'] = latest_quote.change_pct_day
                    entity_dict['volume'] = latest_quote.volume
                    # Open price data
                    entity_dict['open_price'] = latest_quote.open_price
                    entity_dict['change_from_open'] = latest_quote.change_amount_from_open
                    entity_dict['change_from_open_percent'] = latest_quote.change_pct_from_open
                    entity_dict['yahoo_updated_at'] = latest_quote.fetched_at.isoformat() if latest_quote.fetched_at else None
                    entity_dict['updated_at'] = latest_quote.fetched_at.isoformat() if latest_quote.fetched_at else entity_dict.get('updated_at')
                    entity_dict['data_source'] = latest_quote.source
                    
                    # ATR data
                    entity_dict['atr'] = latest_quote.atr
                    entity_dict['atr_period'] = latest_quote.atr_period or 14
                    
                    # Calculate ATR if not available
                    if latest_quote.atr is None:
                        try:
                            from services.external_data.atr_calculator import ATRCalculator
                            from services.external_data.yahoo_finance_adapter import YahooFinanceAdapter
                            
                            user_id = EntityDetailsService._get_default_user_id()
                            atr_calculator = ATRCalculator(db)
                            adapter = YahooFinanceAdapter(db)
                            
                            atr_result = atr_calculator.get_atr_with_fallback(
                                ticker_id=entity_id,
                                adapter=adapter,
                                user_id=user_id,
                                db_session=db
                            )
                            
                            if atr_result and atr_result.atr:
                                entity_dict['atr'] = atr_result.atr
                                entity_dict['atr_period'] = atr_result.period
                                if atr_result.warnings:
                                    entity_dict['atr_warnings'] = atr_result.warnings
                        except Exception as atr_error:
                            logger.warning(f"Error calculating ATR for ticker {entity_id}: {atr_error}")
                    
                    # Calculate 52W range
                    try:
                        from services.external_data.week52_calculator import Week52Calculator
                        
                        week52_calculator = Week52Calculator(db)
                        week52_result = week52_calculator.calculate_52w_range(
                            ticker_id=entity_id,
                            db_session=db
                        )
                        
                        if week52_result:
                            entity_dict['week52_high'] = week52_result.high
                            entity_dict['week52_low'] = week52_result.low
                            if week52_result.warnings:
                                entity_dict['week52_warnings'] = week52_result.warnings
                    except Exception as week52_error:
                        logger.warning(f"Error calculating 52W range for ticker {entity_id}: {week52_error}")
                    
                    # Calculate volatility
                    try:
                        from services.external_data.technical_indicators_calculator import TechnicalIndicatorsCalculator
                        
                        tech_calculator = TechnicalIndicatorsCalculator(db)
                        volatility_result = tech_calculator.calculate_volatility(
                            ticker_id=entity_id,
                            period=30,  # 30 days default
                            db_session=db
                        )
                        
                        if volatility_result is not None:
                            entity_dict['volatility'] = volatility_result
                    except Exception as volatility_error:
                        logger.warning(f"Error calculating volatility for ticker {entity_id}: {volatility_error}")
                    
                    logger.debug(f"Added market data to ticker {entity_id}: price={latest_quote.price}, change={latest_quote.change_pct_day}%, ATR={entity_dict.get('atr')}, Week52High={entity_dict.get('week52_high')}, Volatility={entity_dict.get('volatility')}")
                else:
                    logger.debug(f"No market data found for ticker {entity_id}")
                
                # Load linked items for ticker
                try:
                    linked_items = EntityDetailsService.get_linked_items(db, entity_type, entity_id)
                    entity_dict['linked_items'] = linked_items
                    entity_dict['linked_items_count'] = len(linked_items)
                except Exception as linked_error:
                    logger.error(f"Error loading linked items for ticker {entity_id}: {linked_error}")
                    entity_dict['linked_items'] = []
                    entity_dict['linked_items_count'] = 0
            
            logger.debug(f"Successfully fetched details for {entity_type} {entity_id}")

            if entity_type == 'trading_account':
                try:
                    linked_items = EntityDetailsService.get_linked_items(db, entity_type, entity_id)
                    entity_dict['linked_items'] = linked_items
                    entity_dict['linked_items_count'] = len(linked_items)
                except Exception as linked_error:
                    logger.error(f"Error loading linked items for trading_account {entity_id}: {linked_error}")
                    entity_dict['linked_items'] = []
                    entity_dict['linked_items_count'] = 0
            
            if entity_type == 'execution':
                try:
                    linked_items = EntityDetailsService.get_linked_items(db, entity_type, entity_id)
                    entity_dict['linked_items'] = linked_items
                    entity_dict['linked_items_count'] = len(linked_items)
                except Exception as linked_error:
                    logger.error(f"Error loading linked items for execution {entity_id}: {linked_error}")
                    entity_dict['linked_items'] = []
                    entity_dict['linked_items_count'] = 0
            
            if entity_type == 'cash_flow':
                try:
                    linked_items = EntityDetailsService.get_linked_items(db, entity_type, entity_id)
                    entity_dict['linked_items'] = linked_items
                    entity_dict['linked_items_count'] = len(linked_items)
                except Exception as linked_error:
                    logger.error(f"Error loading linked items for cash_flow {entity_id}: {linked_error}")
                    entity_dict['linked_items'] = []
                    entity_dict['linked_items_count'] = 0
            
            if entity_type == 'trade':
                try:
                    linked_items = EntityDetailsService.get_linked_items(db, entity_type, entity_id)
                    entity_dict['linked_items'] = linked_items
                    entity_dict['linked_items_count'] = len(linked_items)
                except Exception as linked_error:
                    logger.error(f"Error loading linked items for trade {entity_id}: {linked_error}")
                    entity_dict['linked_items'] = []
                    entity_dict['linked_items_count'] = 0
            
            if entity_type == 'trade_plan':
                try:
                    linked_items = EntityDetailsService.get_linked_items(db, entity_type, entity_id)
                    entity_dict['linked_items'] = linked_items
                    entity_dict['linked_items_count'] = len(linked_items)
                except Exception as linked_error:
                    logger.error(f"Error loading linked items for trade_plan {entity_id}: {linked_error}")
                    entity_dict['linked_items'] = []
                    entity_dict['linked_items_count'] = 0
            
            if entity_type == 'alert':
                try:
                    linked_items = EntityDetailsService.get_linked_items(db, entity_type, entity_id)
                    entity_dict['linked_items'] = linked_items
                    entity_dict['linked_items_count'] = len(linked_items)
                except Exception as linked_error:
                    logger.error(f"Error loading linked items for alert {entity_id}: {linked_error}")
                    entity_dict['linked_items'] = []
                    entity_dict['linked_items_count'] = 0
            
            if entity_type == 'trading_account':
                try:
                    positions = PositionPortfolioService.calculate_all_account_positions(
                        db=db,
                        trading_account_id=entity_id,
                        include_closed=True,
                        include_market_data=True
                    )
                    positions_total_value = sum((position.get('market_value') or 0.0) for position in positions)
                    entity_dict['positions_total_value'] = round(positions_total_value, 2)
                    entity_dict['positions_total_count'] = len(positions)
                    entity_dict['positions'] = positions
                except Exception as positions_error:
                    logger.error(f"Error calculating positions for trading_account {entity_id}: {positions_error}")
                    entity_dict['positions_total_value'] = 0.0
                    entity_dict['positions_total_count'] = 0
                    entity_dict['positions'] = []

                try:
                    activity = AccountActivityService.get_account_activity(db, entity_id)
                    if activity:
                        entity_dict['base_currency_id'] = activity.get('base_currency_id')
                        entity_dict['base_currency_symbol'] = activity.get('base_currency') or entity_dict.get('currency_symbol')
                        entity_dict['base_currency_name'] = entity_dict.get('currency_name')
                        entity_dict['base_currency_total'] = round(activity.get('base_currency_total') or 0.0, 2)

                        currency_balances = []
                        for currency_data in activity.get('currencies', []):
                            balance_value = float(currency_data.get('balance') or 0.0)
                            currency_entry = {
                                'currency_id': currency_data.get('currency_id'),
                                'currency_symbol': currency_data.get('currency_symbol'),
                                'currency_name': currency_data.get('currency_name'),
                                'balance': round(balance_value, 2),
                                'is_base': currency_data.get('currency_id') == activity.get('base_currency_id')
                            }
                            if currency_entry['is_base']:
                                entity_dict['base_currency_balance'] = currency_entry['balance']
                                if not entity_dict.get('base_currency_name'):
                                    entity_dict['base_currency_name'] = currency_data.get('currency_name')
                            # Normalize symbol for display
                            if currency_entry['currency_symbol']:
                                currency_entry['currency_symbol'] = CurrencyService.get_display_symbol(currency_entry['currency_symbol']) or currency_entry['currency_symbol']
                            currency_balances.append(currency_entry)

                        if not currency_balances and entity_dict.get('base_currency_symbol'):
                            currency_balances.append({
                                'currency_id': entity_dict.get('base_currency_id'),
                                'currency_symbol': entity_dict.get('base_currency_symbol'),
                                'currency_name': entity_dict.get('base_currency_name'),
                                'balance': entity_dict.get('base_currency_balance', 0.0),
                                'is_base': True
                            })

                        entity_dict['currency_balances'] = currency_balances
                        entity_dict['balances'] = activity

                        if activity.get('last_transaction_date'):
                            entity_dict['last_transaction_date'] = activity.get('last_transaction_date')

                        if not entity_dict.get('currency_symbol') and entity_dict.get('base_currency_symbol'):
                            entity_dict['currency_symbol'] = entity_dict['base_currency_symbol']
                        if not entity_dict.get('currency_name') and entity_dict.get('base_currency_name'):
                            entity_dict['currency_name'] = entity_dict['base_currency_name']

                        total_account_value = entity_dict.get('base_currency_total', 0.0) + entity_dict.get('positions_total_value', 0.0)
                        entity_dict['total_account_value'] = round(total_account_value, 2)
                        entity_dict['last_transaction_date'] = activity.get('last_transaction_date')
                        entity_dict['exchange_rates_used'] = activity.get('exchange_rates_used', {})
                except Exception as activity_error:
                    logger.error(f"Error loading account activity for trading_account {entity_id}: {activity_error}")
                    if 'currency_balances' not in entity_dict:
                        entity_dict['currency_balances'] = []
                    if 'base_currency_total' not in entity_dict:
                        entity_dict['base_currency_total'] = 0.0
                    if 'total_account_value' not in entity_dict:
                        entity_dict['total_account_value'] = entity_dict.get('positions_total_value', 0.0)
                    entity_dict.setdefault('balances', None)
                    entity_dict.setdefault('exchange_rates_used', {})
                    entity_dict.setdefault('base_currency_balance', 0.0)
            return entity_dict
            
        except Exception as e:
            logger.error(f"Error getting entity details for {entity_type} {entity_id}: {str(e)}")
            raise
    
    @staticmethod
    @cache_for(ttl=180)  # Cache for 3 minutes (shorter for linked items)
    def get_linked_items(db: Session, entity_type: str, entity_id: int) -> List[Dict[str, Any]]:
        """
        Get linked items for a specific entity
        
        Uses the new EntityRelationshipResolver based on schema configuration.
        
        Args:
            db (Session): Database connection
            entity_type (str): Type of parent entity
            entity_id (int): ID of the parent entity
            
        Returns:
            List[Dict[str, Any]]: List of linked items with basic info conforming to canonical schema
            
        Example:
            >>> linked = EntityDetailsService.get_linked_items(db, 'ticker', 1)
            >>> print(len(linked))  # Number of linked items
        """
        try:
            if entity_type == 'account':
                logger.warning("Deprecated entity type 'account' requested for linked items. Converting to 'trading_account'.")
                entity_type = 'trading_account'

            # Validate input
            if entity_type not in EntityDetailsService.ENTITY_MODELS:
                raise ValueError(f"Unsupported entity type: {entity_type}")
            
            # Use new schema-based resolver
            from services.entity_relationship_resolver import EntityRelationshipResolver
            from services.entity_relationship_schema import ENTITY_RELATIONSHIPS
            
            resolver = EntityRelationshipResolver(ENTITY_RELATIONSHIPS)
            linked_items = resolver.get_linked_items(db, entity_type, entity_id)
            
            logger.debug(f"Found {len(linked_items)} linked items for {entity_type} {entity_id}")
            return linked_items
            
        except Exception as e:
            logger.error(f"Error getting linked items for {entity_type} {entity_id}: {str(e)}")
            return []  # Return empty list on error rather than raising
    
    # Mapping from note_relation_types entries to canonical entity types and models
    NOTE_RELATION_TYPE_MAP = {
        'trade': ('trade', Trade),
        'trades': ('trade', Trade),
        'trading_account': ('trading_account', TradingAccount),
        'trading_accounts': ('trading_account', TradingAccount),
        'account': ('trading_account', TradingAccount),
        'accounts': ('trading_account', TradingAccount),
        'ticker': ('ticker', Ticker),
        'tickers': ('ticker', Ticker),
        'trade_plan': ('trade_plan', TradePlan),
        'trade_plans': ('trade_plan', TradePlan),
        'execution': ('execution', Execution),
        'executions': ('execution', Execution),
        'cash_flow': ('cash_flow', CashFlow),
        'cash_flows': ('cash_flow', CashFlow),
        'alert': ('alert', Alert),
        'alerts': ('alert', Alert),
        'note': ('note', Note),
        'notes': ('note', Note)
    }

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

    @classmethod
    def _get_default_user_id(cls) -> Optional[int]:
        """Resolve and cache the default user ID for tagging operations."""
        if cls._default_user_id_cache is not None:
            return cls._default_user_id_cache

        try:
            default_user = cls.USER_SERVICE.get_default_user()
            if default_user and default_user.get('id'):
                cls._default_user_id_cache = int(default_user['id'])
                return cls._default_user_id_cache
            logger.warning("Default user not found while attempting to load entity tags")
        except Exception as exc:
            logger.error("Failed to resolve default user id for tagging: %s", exc)

        return None

    @classmethod
    def _load_entity_tags(cls, db: Session, entity_type: str, entity_id: int) -> List[Dict[str, Any]]:
        """
        Load tags for the requested entity using the unified TagService.
        Returns a list of serialized tags ready for the frontend renderer.
        """
        normalized_type = (entity_type or '').lower().strip()
        if normalized_type == 'account':
            normalized_type = 'trading_account'

        if normalized_type not in TAG_SUPPORTED_ENTITY_TYPES:
            return []

        user_id = cls._get_default_user_id()
        if not user_id:
            return []

        try:
            tags = TagService.get_tags_for_entity(db, normalized_type, entity_id, user_id)
            return [cls._serialize_tag(tag) for tag in tags]
        except Exception as exc:
            logger.warning(
                "Failed to load tags for %s %s: %s",
                normalized_type,
                entity_id,
                str(exc)
            )
            return []

    @classmethod
    def _serialize_tag(cls, tag) -> Dict[str, Any]:
        """Serialize tag ORM object to JSON-friendly structure with category metadata."""
        base = tag.to_dict() if hasattr(tag, 'to_dict') else dict(tag)
        category = base.get('category') or {}

        serialized = {
            'id': base.get('id'),
            'name': base.get('name'),
            'slug': base.get('slug'),
            'description': base.get('description'),
            'category_id': base.get('category_id'),
            'is_active': base.get('is_active', True),
            'usage_count': base.get('usage_count', 0),
            'last_used_at': cls._isoformat_if_possible(base.get('last_used_at')),
            'created_at': cls._isoformat_if_possible(base.get('created_at')),
            'updated_at': cls._isoformat_if_possible(base.get('updated_at')),
            'display_name': base.get('name'),
            'category_name': category.get('name'),
            'category_color': category.get('color_hex'),
            'color_hex': base.get('color_hex') or category.get('color_hex')
        }

        serialized['category'] = category if category else None

        return serialized

    @staticmethod
    def _isoformat_if_possible(value: Any) -> Optional[str]:
        """Convert datetime-like values to ISO strings when possible."""
        if value is None:
            return None
        if hasattr(value, 'isoformat'):
            try:
                return value.isoformat()
            except Exception:
                return str(value)
        return str(value)
    
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
    def _augment_note_details(db: Session, note: Note, entity_dict: Dict[str, Any]) -> None:
        """
        Enrich note details with relation metadata, attachment info, and linked entity summary.
        """
        try:
            relation_type_id = getattr(note, 'related_type_id', None)
            related_id = getattr(note, 'related_id', None)

            entity_dict['attachment'] = getattr(note, 'attachment', None)
            entity_dict['related_type_id'] = relation_type_id
            entity_dict['related_id'] = related_id

            relation_type_obj = None
            relation_type_label = None
            if relation_type_id:
                relation_type_obj = db.query(NoteRelationType).filter(NoteRelationType.id == relation_type_id).first()
                if relation_type_obj:
                    relation_type_label = relation_type_obj.note_relation_type

            entity_dict['related_type_label'] = relation_type_label

            related_summary = EntityDetailsService._build_note_related_summary(
                db,
                relation_type_obj,
                relation_type_id,
                related_id
            )

            if related_summary:
                entity_dict['related_entity'] = related_summary
                entity_dict['linked_items'] = [related_summary]
                entity_dict['related_entity_display'] = related_summary.get('display_name') or related_summary.get('name')
            else:
                entity_dict['related_entity'] = None
                entity_dict['linked_items'] = []
                entity_dict['related_entity_display'] = None
        except Exception as exc:
            logger.error(
                "Error augmenting note details for note %s: %s",
                getattr(note, 'id', None),
                str(exc)
            )
            entity_dict.setdefault('related_entity', None)
            entity_dict.setdefault('linked_items', [])
            entity_dict.setdefault('related_entity_display', None)

    @staticmethod
    def _build_note_related_summary(
        db: Session,
        relation_type_obj: Optional[NoteRelationType],
        relation_type_id: Optional[int],
        related_id: Optional[int]
    ) -> Optional[Dict[str, Any]]:
        """
        Build a summary dictionary for the entity linked to the note.
        """
        if not related_id:
            return None

        target_type, model = EntityDetailsService._resolve_note_relation_target(
            db,
            relation_type_obj,
            relation_type_id
        )

        if not target_type or model is None:
            return None

        entity = EntityDetailsService._fetch_related_entity(db, target_type, model, related_id)
        if not entity:
            return None

        return EntityDetailsService._serialize_linked_entity(entity, target_type, db)

    @staticmethod
    def _resolve_note_relation_target(
        db: Session,
        relation_type_obj: Optional[NoteRelationType],
        relation_type_id: Optional[int]
    ) -> Tuple[Optional[str], Optional[Any]]:
        """
        Resolve the canonical entity type and model class for a note relation.
        """
        label = None
        if relation_type_obj and relation_type_obj.note_relation_type:
            label = relation_type_obj.note_relation_type
        elif relation_type_id:
            lookup = db.query(NoteRelationType).filter(NoteRelationType.id == relation_type_id).first()
            if lookup and lookup.note_relation_type:
                label = lookup.note_relation_type

        if label:
            normalized = label.strip().lower()
            if normalized in EntityDetailsService.NOTE_RELATION_TYPE_MAP:
                return EntityDetailsService.NOTE_RELATION_TYPE_MAP[normalized]

        # Fallback: try mapping by numeric id (legacy systems)
        legacy_map = {
            1: ('trade', Trade),
            2: ('trading_account', TradingAccount),
            3: ('ticker', Ticker),
            4: ('trade_plan', TradePlan),
            5: ('execution', Execution),
            6: ('cash_flow', CashFlow),
            7: ('alert', Alert),
            8: ('note', Note)
        }

        if relation_type_id in legacy_map:
            return legacy_map[relation_type_id]

        return None, None

    @staticmethod
    def _fetch_related_entity(db: Session, target_type: str, model: Any, related_id: int):
        """
        Fetch related entity with required relationships for summary building.
        """
        try:
            if target_type == 'trade':
                return db.query(model).options(
                    joinedload(Trade.ticker)
                ).filter(model.id == related_id).first()
            if target_type == 'trade_plan':
                return db.query(model).options(
                    joinedload(TradePlan.ticker),
                    joinedload(TradePlan.account)
                ).filter(model.id == related_id).first()
            if target_type == 'execution':
                return db.query(model).options(
                    joinedload(Execution.ticker),
                    joinedload(Execution.trade)
                ).filter(model.id == related_id).first()
            if target_type == 'cash_flow':
                return db.query(model).options(
                    joinedload(CashFlow.trade).joinedload(Trade.ticker),
                    joinedload(CashFlow.account),
                    joinedload(CashFlow.currency)
                ).filter(model.id == related_id).first()
            if target_type == 'alert':
                return db.query(model).options(
                    joinedload(Alert.ticker)
                ).filter(model.id == related_id).first()
            if target_type == 'note':
                return db.query(model).filter(model.id == related_id).first()

            return db.query(model).filter(model.id == related_id).first()
        except Exception as exc:
            logger.error("Failed to fetch related entity %s:%s - %s", target_type, related_id, str(exc))
            return None

    @staticmethod
    def _serialize_linked_entity(entity: Any, entity_type: str, db: Session) -> Dict[str, Any]:
        """
        Serialize an entity into the structure expected by the frontend linked items systems.
        """
        def to_iso(value):
            return value.isoformat() if hasattr(value, 'isoformat') else None

        summary: Dict[str, Any] = {
            'id': getattr(entity, 'id', None),
            'type': entity_type,
            'status': getattr(entity, 'status', None),
            'side': getattr(entity, 'side', None),
            'investment_type': getattr(entity, 'investment_type', None),
            'created_at': to_iso(getattr(entity, 'created_at', None)),
            'updated_at': to_iso(getattr(entity, 'updated_at', None))
        }

        display_name = None
        ticker_symbol = None

        if entity_type == 'trade':
            if getattr(entity, 'ticker', None) and getattr(entity.ticker, 'symbol', None):
                ticker_symbol = entity.ticker.symbol
            elif getattr(entity, 'ticker_id', None):
                ticker = db.query(Ticker).filter(Ticker.id == entity.ticker_id).first()
                ticker_symbol = ticker.symbol if ticker else None
            display_name = ticker_symbol or f"טרייד #{entity.id}"
            summary['ticker'] = ticker_symbol
        elif entity_type == 'trade_plan':
            if getattr(entity, 'ticker', None) and getattr(entity.ticker, 'symbol', None):
                ticker_symbol = entity.ticker.symbol
            elif getattr(entity, 'ticker_id', None):
                ticker = db.query(Ticker).filter(Ticker.id == entity.ticker_id).first()
                ticker_symbol = ticker.symbol if ticker else None
            display_name = ticker_symbol or f"תכנית #{entity.id}"
            summary['ticker'] = ticker_symbol
            summary['planned_amount'] = getattr(entity, 'planned_amount', None)
            summary['date'] = to_iso(getattr(entity, 'created_at', None))
        elif entity_type == 'execution':
            if getattr(entity, 'ticker', None) and getattr(entity.ticker, 'symbol', None):
                ticker_symbol = entity.ticker.symbol
            elif getattr(entity, 'trade', None) and getattr(entity.trade, 'ticker', None) and getattr(entity.trade.ticker, 'symbol', None):
                ticker_symbol = entity.trade.ticker.symbol
            display_name = ticker_symbol or f"ביצוע #{entity.id}"
            summary['ticker'] = ticker_symbol
            summary['action'] = getattr(entity, 'action', None)
            summary['date'] = to_iso(getattr(entity, 'date', None) or getattr(entity, 'created_at', None))
        elif entity_type == 'cash_flow':
            amount = getattr(entity, 'amount', None)
            currency_symbol = None
            if getattr(entity, 'currency', None) and getattr(entity.currency, 'symbol', None):
                currency_symbol = entity.currency.symbol
            summary['amount'] = amount
            summary['currency_symbol'] = currency_symbol
            summary['type'] = getattr(entity, 'type', None)
            summary['date'] = to_iso(getattr(entity, 'date', None) or getattr(entity, 'created_at', None))
            display_name = f"{(currency_symbol or '')}{amount}" if amount is not None else f"תזרים #{entity.id}"
        elif entity_type == 'trading_account':
            name = getattr(entity, 'name', None)
            display_name = name or f"חשבון #{entity.id}"
        elif entity_type == 'ticker':
            symbol = getattr(entity, 'symbol', None)
            display_name = symbol or f"טיקר #{entity.id}"
            summary['status'] = getattr(entity, 'status', None)
        elif entity_type == 'alert':
            message = getattr(entity, 'message', None)
            display_name = message or f"התראה #{entity.id}"
            summary['is_triggered'] = getattr(entity, 'is_triggered', None)
            summary['ticker'] = getattr(entity.ticker, 'symbol', None) if getattr(entity, 'ticker', None) else None
            summary['date'] = to_iso(getattr(entity, 'created_at', None))
        elif entity_type == 'note':
            content = getattr(entity, 'content', '')
            display_name = (content.splitlines()[0][:40] + '...') if content else f"הערה #{entity.id}"
        else:
            display_name = getattr(entity, 'name', None) or getattr(entity, 'title', None) or f"{entity_type} #{entity.id}"

        summary['name'] = display_name
        summary['title'] = display_name
        summary['display_name'] = display_name

        # Provide date fallback for renderers expecting 'date'
        if 'date' not in summary or summary.get('date') is None:
            summary['date'] = summary.get('created_at')

        return summary

    @staticmethod
    def _get_note_linked_items(db: Session, note_id: int) -> List[Dict[str, Any]]:
        """
        Retrieve the single linked entity for a note in a structure suitable for frontend display.
        """
        note = db.query(Note).filter(Note.id == note_id).first()
        if not note:
            return []

        relation_type_obj = None
        if note.related_type_id:
            relation_type_obj = db.query(NoteRelationType).filter(NoteRelationType.id == note.related_type_id).first()

        summary = EntityDetailsService._build_note_related_summary(
            db,
            relation_type_obj,
            note.related_type_id,
            note.related_id
        )

        if summary:
            return [summary]

        return []
    
    @staticmethod
    def _get_ticker_linked_items(db: Session, ticker_id: int) -> List[Dict[str, Any]]:
        """Get linked items for ticker"""
        linked_items = []
        
        try:
            def _format_datetime(value):
                if not value:
                    return None
                try:
                    return value.isoformat()  # datetime objects
                except AttributeError:
                    return str(value)
            
            # Get related trades with ticker relationship loaded
            trades = db.query(Trade).options(joinedload(Trade.ticker)).filter(Trade.ticker_id == ticker_id).all()
            for trade in trades:
                ticker_symbol = trade.ticker.symbol if trade.ticker else f"טיקר #{ticker_id}"
                # BaseModel doesn't have updated_at, use created_at or None
                updated_at = getattr(trade, 'updated_at', None)
                linked_items.append({
                    'id': trade.id,
                    'type': 'trade',
                    'name': f"טרייד #{trade.id}",
                    'title': f"טרייד #{trade.id}",
                    'status': trade.status,
                    'side': trade.side,
                    'investment_type': trade.investment_type,
                    'created_at': trade.created_at.isoformat() if trade.created_at else None,
                    'updated_at': updated_at.isoformat() if updated_at else None
                })
            
            # Get related trade plans with ticker relationship loaded
            trade_plans = db.query(TradePlan).options(joinedload(TradePlan.ticker)).filter(TradePlan.ticker_id == ticker_id).all()
            for plan in trade_plans:
                ticker_symbol = plan.ticker.symbol if plan.ticker else f"טיקר #{ticker_id}"
                # BaseModel doesn't have updated_at, use created_at or None
                updated_at = getattr(plan, 'updated_at', None)
                linked_items.append({
                    'id': plan.id,
                    'type': 'trade_plan',
                    'name': f"תכנית #{plan.id}",
                    'title': f"תכנית #{plan.id}",
                    'status': plan.status,
                    'side': plan.side,
                    'investment_type': plan.investment_type,
                    'created_at': plan.created_at.isoformat() if plan.created_at else None,
                    'updated_at': updated_at.isoformat() if updated_at else None
                })
            
            # Get related alerts
            alerts = db.query(Alert).filter(Alert.ticker_id == ticker_id).all()
            for alert in alerts:
                # BaseModel doesn't have updated_at, use created_at or None
                updated_at = getattr(alert, 'updated_at', None)
                linked_items.append({
                    'id': alert.id,
                    'type': 'alert',
                    'name': alert.message or f"התראה #{alert.id}",
                    'title': alert.message or f"התראה #{alert.id}",
                    'status': alert.status,
                    'is_triggered': alert.is_triggered,
                    'created_at': alert.created_at.isoformat() if alert.created_at else None,
                    'updated_at': updated_at.isoformat() if updated_at else None
                })
            
            # Get executions directly linked to this ticker (not through trades)
            executions = (
                db.query(Execution)
                .options(joinedload(Execution.ticker))
                .filter(Execution.ticker_id == ticker_id)
                .all()
            )
            for execution in executions:
                ticker_symbol = execution.ticker.symbol if getattr(execution, 'ticker', None) else None
                action = execution.action or ''
                quantity = execution.quantity or 0
                title = f"ביצוע {action} {quantity} יחידות {ticker_symbol}".strip() if ticker_symbol else f"ביצוע {action} #{execution.id}"
                linked_items.append({
                    'id': execution.id,
                    'type': 'execution',
                    'name': title,
                    'title': title,
                    'status': 'active',
                    'side': execution.action,
                    'investment_type': None,
                    'created_at': _format_datetime(execution.date or getattr(execution, 'created_at', None)),
                    'updated_at': _format_datetime(getattr(execution, 'updated_at', None))
                })
            
            # Get related notes (by related_type_id = 4 for ticker and related_id)
            notes = db.query(Note).filter(
                Note.related_type_id == 4,  # 4 = ticker in note_relation_types
                Note.related_id == ticker_id
            ).all()
            for note in notes:
                # Extract title from content (first line or first 50 chars)
                note_title = note.content.split('\n')[0][:50] if note.content else f"הערה #{note.id}"
                # BaseModel doesn't have updated_at, use created_at or None
                updated_at = getattr(note, 'updated_at', None)
                linked_items.append({
                    'id': note.id,
                    'type': 'note',
                    'name': note_title,
                    'title': note_title,
                    'status': 'active',
                    'created_at': note.created_at.isoformat() if note.created_at else None,
                    'updated_at': updated_at.isoformat() if updated_at else None
                })
            
            # Get related executions (through trades)
            executions = db.query(Execution).join(Trade).filter(Trade.ticker_id == ticker_id).all()
            for execution in executions:
                # BaseModel doesn't have updated_at, use created_at or None
                updated_at = getattr(execution, 'updated_at', None)
                linked_items.append({
                    'id': execution.id,
                    'type': 'execution',
                    'name': f"ביצוע #{execution.id}",
                    'title': f"ביצוע #{execution.id}",
                    'action': execution.action,
                    'date': execution.date.isoformat() if execution.date else None,
                    'created_at': execution.created_at.isoformat() if execution.created_at else None,
                    'updated_at': updated_at.isoformat() if updated_at else None
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
            
            # Get the trading account (parent)
            trade = db.query(Trade).filter(Trade.id == trade_id).first()
            if trade and trade.trading_account_id:
                account = db.query(TradingAccount).filter(TradingAccount.id == trade.trading_account_id).first()
                if account:
                    linked_items.append({
                        'id': account.id,
                        'type': 'trading_account',
                        'title': f"חשבון {account.name}",
                        'name': account.name,
                        'description': f"חשבון מסחר {account.name}",
                        'status': account.status,
                        'created_at': account.created_at.isoformat() if account.created_at else None
                    })
            
            # Get the ticker (parent)
            if trade and trade.ticker_id:
                ticker = db.query(Ticker).filter(Ticker.id == trade.ticker_id).first()
                if ticker:
                    linked_items.append({
                        'id': ticker.id,
                        'type': 'ticker',
                        'title': f"טיקר {ticker.symbol}",
                        'name': ticker.symbol,
                        'description': f"טיקר {ticker.symbol}",
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
            plan = db.query(TradePlan).filter(TradePlan.id == plan_id).first()
            
            # Get the trading account (parent)
            if plan and plan.trading_account_id:
                account = db.query(TradingAccount).filter(TradingAccount.id == plan.trading_account_id).first()
                if account:
                    linked_items.append({
                        'id': account.id,
                        'type': 'trading_account',
                        'title': f"חשבון {account.name}",
                        'name': account.name,
                        'description': f"חשבון מסחר {account.name}",
                        'status': account.status,
                        'created_at': account.created_at.isoformat() if account.created_at else None
                    })
            
            # Get the ticker (parent)
            if plan and plan.ticker_id:
                ticker = db.query(Ticker).filter(Ticker.id == plan.ticker_id).first()
                if ticker:
                    linked_items.append({
                        'id': ticker.id,
                        'type': 'ticker',
                        'title': f"טיקר {ticker.symbol}",
                        'name': ticker.symbol,
                        'description': f"טיקר {ticker.symbol}",
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
                    'name': note.title or f"הערה #{note.id}",
                    'description': note.content[:50] + '...' if note.content and len(note.content) > 50 else (note.content or ''),
                    'status': 'active',
                    'created_at': note.created_at.isoformat() if note.created_at else None
                })
            
            # Get related alerts through plan_condition
            from models.plan_condition import PlanCondition
            plan_conditions = db.query(PlanCondition).filter(PlanCondition.trade_plan_id == plan_id).all()
            for condition in plan_conditions:
                alerts = db.query(Alert).filter(Alert.plan_condition_id == condition.id).all()
                for alert in alerts:
                    # Check if alert already added (avoid duplicates)
                    if not any(item['type'] == 'alert' and item['id'] == alert.id for item in linked_items):
                        linked_items.append({
                            'id': alert.id,
                            'type': 'alert',
                            'title': alert.message or f"התראה #{alert.id}",
                            'name': alert.message or f"התראה #{alert.id}",
                            'description': f"התראה לטיקר {alert.ticker_id}" if alert.ticker_id else f"התראה #{alert.id}",
                            'status': alert.status,
                            'is_triggered': alert.is_triggered,
                            'created_at': alert.created_at.isoformat() if alert.created_at else None
                        })
            
            # Also get alerts linked through related_id/related_type_id (legacy support)
            from models.note_relation_type import NoteRelationType
            trade_plan_relation_type = db.query(NoteRelationType).filter(NoteRelationType.name == 'trade_plan').first()
            if trade_plan_relation_type:
                alerts_legacy = db.query(Alert).filter(
                    Alert.related_type_id == trade_plan_relation_type.id,
                    Alert.related_id == plan_id
                ).all()
                for alert in alerts_legacy:
                    # Check if alert already added (avoid duplicates)
                    if not any(item['type'] == 'alert' and item['id'] == alert.id for item in linked_items):
                        linked_items.append({
                            'id': alert.id,
                            'type': 'alert',
                            'title': alert.message or f"התראה #{alert.id}",
                            'name': alert.message or f"התראה #{alert.id}",
                            'description': f"התראה לטיקר {alert.ticker_id}" if alert.ticker_id else f"התראה #{alert.id}",
                            'status': alert.status,
                            'is_triggered': alert.is_triggered,
                            'created_at': alert.created_at.isoformat() if alert.created_at else None
                        })
                
        except Exception as e:
            logger.error(f"Error getting trade plan linked items: {str(e)}")
        
        return linked_items
    
    @staticmethod
    def _get_account_linked_items(db: Session, trading_account_id: int) -> List[Dict[str, Any]]:
        """Get linked items for account"""
        linked_items = []
        
        try:
            def _format_datetime(value):
                if not value:
                    return None
                try:
                    return value.isoformat()  # datetime objects
                except AttributeError:
                    return str(value)

            # Trades linked to this account
            trades = (
                db.query(Trade)
                .options(joinedload(Trade.ticker))
                .filter(Trade.trading_account_id == trading_account_id)
                .all()
            )
            for trade in trades:
                ticker_symbol = trade.ticker.symbol if getattr(trade, 'ticker', None) else None
                title = f"טרייד {trade.side or ''} על {ticker_symbol}".strip() if ticker_symbol else f"טרייד #{trade.id}"
                linked_items.append({
                    'id': trade.id,
                    'type': 'trade',
                    'title': title,
                    'status': trade.status,
                    'side': trade.side,
                    'investment_type': trade.investment_type,
                    'created_at': _format_datetime(trade.created_at),
                    'updated_at': _format_datetime(getattr(trade, 'updated_at', None) or getattr(trade, 'closed_at', None))
                })

            # Trade plans owned by this account
            trade_plans = (
                db.query(TradePlan)
                .options(joinedload(TradePlan.ticker))
                .filter(TradePlan.trading_account_id == trading_account_id)
                .all()
            )
            for plan in trade_plans:
                ticker_symbol = plan.ticker.symbol if getattr(plan, 'ticker', None) else None
                title = f"תכנית {plan.side or ''} על {ticker_symbol}".strip() if ticker_symbol else f"תכנית #{plan.id}"
                linked_items.append({
                    'id': plan.id,
                    'type': 'trade_plan',
                    'title': title,
                    'status': plan.status,
                    'side': plan.side,
                    'investment_type': plan.investment_type,
                    'created_at': _format_datetime(plan.created_at),
                    'updated_at': _format_datetime(getattr(plan, 'updated_at', None) or getattr(plan, 'cancelled_at', None))
                })

            # Executions executed on this account
            executions = (
                db.query(Execution)
                .options(joinedload(Execution.ticker))
                .filter(Execution.trading_account_id == trading_account_id)
                .all()
            )
            for execution in executions:
                ticker_symbol = execution.ticker.symbol if getattr(execution, 'ticker', None) else None
                title = f"ביצוע {execution.action} {ticker_symbol}".strip() if ticker_symbol else f"ביצוע #{execution.id}"
                linked_items.append({
                    'id': execution.id,
                    'type': 'execution',
                    'title': title,
                    'status': 'active',
                    'side': execution.action,
                    'investment_type': None,
                    'created_at': _format_datetime(execution.date or getattr(execution, 'created_at', None)),
                    'updated_at': _format_datetime(getattr(execution, 'updated_at', None))
                })

            # Cash flows associated with this account
            cash_flows = (
                db.query(CashFlow)
                .options(joinedload(CashFlow.currency))
                .filter(CashFlow.trading_account_id == trading_account_id)
                .all()
            )
            for flow in cash_flows:
                currency_symbol_raw = flow.currency.symbol if getattr(flow, 'currency', None) else ''
                currency_symbol = CurrencyService.get_display_symbol(currency_symbol_raw) or currency_symbol_raw
                title = f"תזרים {flow.type}" if flow.type else f"תזרים #{flow.id}"
                linked_items.append({
                    'id': flow.id,
                    'type': 'cash_flow',
                    'title': title,
                    'status': 'active',
                    'side': None,
                    'investment_type': None,
                    'created_at': _format_datetime(getattr(flow, 'date', None) or getattr(flow, 'created_at', None)),
                    'updated_at': _format_datetime(getattr(flow, 'updated_at', None)),
                    'amount': flow.amount,
                    'currency_symbol': currency_symbol
                })

            # Alerts that relate to this account (related_type_id == 1)
            alerts = db.query(Alert).filter(Alert.related_type_id == 1, Alert.related_id == trading_account_id).all()
            for alert in alerts:
                alert_title = getattr(alert, 'title', None) or getattr(alert, 'message', None) or f"התראה #{alert.id}"
                linked_items.append({
                    'id': alert.id,
                    'type': 'alert',
                    'title': alert_title,
                    'status': alert.status,
                    'side': None,
                    'investment_type': None,
                    'created_at': _format_datetime(getattr(alert, 'created_at', None)),
                    'updated_at': _format_datetime(getattr(alert, 'updated_at', None) or getattr(alert, 'triggered_at', None))
                })

            # Notes linked to this account (related_type_id == 1)
            notes = db.query(Note).filter(Note.related_type_id == 1, Note.related_id == trading_account_id).all()
            for note in notes:
                raw_title = getattr(note, 'title', None)
                if not raw_title:
                    content = getattr(note, 'content', '') or ''
                    first_line = content.split('\n')[0]
                    raw_title = first_line[:50] if first_line else f"הערה #{note.id}"
                linked_items.append({
                    'id': note.id,
                    'type': 'note',
                    'title': raw_title,
                    'status': 'active',
                    'side': None,
                    'investment_type': None,
                    'created_at': _format_datetime(getattr(note, 'created_at', None)),
                    'updated_at': _format_datetime(getattr(note, 'updated_at', None))
                })

            logger.info(
                "_get_account_linked_items collected %s items for trading_account %s",
                len(linked_items),
                trading_account_id
            )

        except Exception as e:
            logger.error(f"Error getting account linked items: {str(e)}")
 
        return linked_items
    
    @staticmethod
    def _get_alert_linked_items(db: Session, alert_id: int) -> List[Dict[str, Any]]:
        """Get linked items for alert"""
        linked_items = []
        
        try:
            alert = db.query(Alert).filter(Alert.id == alert_id).first()
            if not alert:
                logger.warning(f"Alert {alert_id} not found")
                return []
            
            # Get the ticker this alert is for (parent)
            if alert.ticker_id:
                ticker = db.query(Ticker).filter(Ticker.id == alert.ticker_id).first()
                if ticker:
                    linked_items.append({
                        'id': ticker.id,
                        'type': 'ticker',
                        'title': f"טיקר {ticker.symbol}",
                        'name': ticker.symbol,
                        'description': f"טיקר {ticker.symbol}",
                        'status': ticker.status,
                        'created_at': ticker.created_at.isoformat() if ticker.created_at else None
                    })
            
            # Get trading_account through plan_condition -> trade_plan
            if alert.plan_condition_id:
                from models.plan_condition import PlanCondition
                plan_condition = db.query(PlanCondition).filter(PlanCondition.id == alert.plan_condition_id).first()
                if plan_condition and plan_condition.trade_plan_id:
                    trade_plan = db.query(TradePlan).filter(TradePlan.id == plan_condition.trade_plan_id).first()
                    if trade_plan and trade_plan.trading_account_id:
                        account = db.query(TradingAccount).filter(TradingAccount.id == trade_plan.trading_account_id).first()
                        if account:
                            # Check if already added
                            if not any(item['type'] == 'trading_account' and item['id'] == account.id for item in linked_items):
                                linked_items.append({
                                    'id': account.id,
                                    'type': 'trading_account',
                                    'title': f"חשבון {account.name}",
                                    'name': account.name,
                                    'description': f"חשבון מסחר {account.name}",
                                    'status': account.status,
                                    'created_at': account.created_at.isoformat() if account.created_at else None
                                })
                    
                    # Add trade_plan as parent
                    if trade_plan:
                        linked_items.append({
                            'id': trade_plan.id,
                            'type': 'trade_plan',
                            'title': f"תכנית #{trade_plan.id}",
                            'name': f"תכנית #{trade_plan.id}",
                            'description': f"תכנית השקעה #{trade_plan.id}",
                            'status': trade_plan.status,
                            'side': trade_plan.side,
                            'investment_type': trade_plan.investment_type,
                            'created_at': trade_plan.created_at.isoformat() if trade_plan.created_at else None
                        })
            
            # Get trading_account and trade_plan through trade_condition -> trade
            if alert.trade_condition_id:
                from models.trade_condition import TradeCondition
                trade_condition = db.query(TradeCondition).filter(TradeCondition.id == alert.trade_condition_id).first()
                if trade_condition and trade_condition.trade_id:
                    trade = db.query(Trade).filter(Trade.id == trade_condition.trade_id).first()
                    if trade:
                        # Add trade as parent
                        linked_items.append({
                            'id': trade.id,
                            'type': 'trade',
                            'title': f"טרייד {trade.symbol}",
                            'name': trade.symbol,
                            'description': f"טרייד {trade.symbol}",
                            'status': trade.status,
                            'side': trade.side,
                            'created_at': trade.created_at.isoformat() if trade.created_at else None
                        })
                        
                        # Add trading_account through trade
                        if trade.trading_account_id:
                            account = db.query(TradingAccount).filter(TradingAccount.id == trade.trading_account_id).first()
                            if account:
                                # Check if already added
                                if not any(item['type'] == 'trading_account' and item['id'] == account.id for item in linked_items):
                                    linked_items.append({
                                        'id': account.id,
                                        'type': 'trading_account',
                                        'title': f"חשבון {account.name}",
                                        'name': account.name,
                                        'description': f"חשבון מסחר {account.name}",
                                        'status': account.status,
                                        'created_at': account.created_at.isoformat() if account.created_at else None
                                    })
                        
                        # Add trade_plan through trade
                        if trade.trade_plan_id:
                            trade_plan = db.query(TradePlan).filter(TradePlan.id == trade.trade_plan_id).first()
                            if trade_plan:
                                # Check if already added
                                if not any(item['type'] == 'trade_plan' and item['id'] == trade_plan.id for item in linked_items):
                                    linked_items.append({
                                        'id': trade_plan.id,
                                        'type': 'trade_plan',
                                        'title': f"תכנית #{trade_plan.id}",
                                        'name': f"תכנית #{trade_plan.id}",
                                        'description': f"תכנית השקעה #{trade_plan.id}",
                                        'status': trade_plan.status,
                                        'side': trade_plan.side,
                                        'investment_type': trade_plan.investment_type,
                                        'created_at': trade_plan.created_at.isoformat() if trade_plan.created_at else None
                                    })
            
            # Get related trades for this ticker (children)
            if alert.ticker_id:
                trades = db.query(Trade).filter(Trade.ticker_id == alert.ticker_id).all()
                for trade in trades:
                    # Check if already added as parent
                    if not any(item['type'] == 'trade' and item['id'] == trade.id for item in linked_items):
                        linked_items.append({
                            'id': trade.id,
                            'type': 'trade',
                            'title': f"טרייד {trade.symbol}",
                            'name': trade.symbol,
                            'description': f"טרייד {trade.symbol}",
                            'status': trade.status,
                            'side': trade.side,
                            'created_at': trade.created_at.isoformat() if trade.created_at else None
                        })
            
            # Get related notes (children)
            notes = db.query(Note).filter(
                Note.linked_object_type == 'alert',
                Note.linked_object_id == alert_id
            ).all()
            for note in notes:
                linked_items.append({
                    'id': note.id,
                    'type': 'note',
                    'title': note.title or f"הערה #{note.id}",
                    'name': note.title or f"הערה #{note.id}",
                    'description': note.content[:50] + '...' if note.content and len(note.content) > 50 else (note.content or ''),
                    'status': 'active',
                    'created_at': note.created_at.isoformat() if note.created_at else None
                })
                
        except Exception as e:
            logger.error(f"Error getting alert linked items: {str(e)}")
        
        return linked_items
    
    @staticmethod
    def _get_execution_linked_items(db: Session, execution_id: int) -> List[Dict[str, Any]]:
        """Get linked items for execution"""
        linked_items = []
        
        try:
            # Get the execution entity
            execution = db.query(Execution).filter(Execution.id == execution_id).first()
            if not execution:
                logger.warning(f"Execution {execution_id} not found")
                return []
            
            def _format_datetime(value):
                if not value:
                    return None
                try:
                    return value.isoformat()  # datetime objects
                except AttributeError:
                    return str(value)
            
            # Get trading account (always present)
            if execution.trading_account_id:
                account = db.query(TradingAccount).filter(TradingAccount.id == execution.trading_account_id).first()
                if account:
                    linked_items.append({
                        'id': account.id,
                        'type': 'trading_account',
                        'title': 'חשבון מסחר',
                        'name': account.name,
                        'description': account.name,
                        'status': account.status,
                        'side': None,
                        'investment_type': None,
                        'created_at': _format_datetime(account.created_at),
                        'updated_at': _format_datetime(getattr(account, 'updated_at', None))
                    })
            
            # Get trade if linked
            trade = None
            trade_ticker_id = None
            if execution.trade_id:
                trade = db.query(Trade).options(joinedload(Trade.ticker)).filter(Trade.id == execution.trade_id).first()
                if trade:
                    ticker_symbol = trade.ticker.symbol if getattr(trade, 'ticker', None) else None
                    trade_ticker_id = trade.ticker_id if hasattr(trade, 'ticker_id') else None
                    side = trade.side or ''
                    investment_type = trade.investment_type or ''
                    description = f"טרייד {side} על {ticker_symbol}" if ticker_symbol else f"טרייד {side} - {investment_type}".strip() or f"טרייד #{trade.id}"
                    linked_items.append({
                        'id': trade.id,
                        'type': 'trade',
                        'title': 'טרייד',
                        'name': ticker_symbol or f"טרייד #{trade.id}",
                        'description': description,
                        'status': trade.status,
                        'side': trade.side,
                        'investment_type': trade.investment_type,
                        'created_at': _format_datetime(trade.created_at),
                        'updated_at': _format_datetime(getattr(trade, 'updated_at', None) or getattr(trade, 'closed_at', None))
                    })
                    
                    # Add ticker from trade if it exists and not already added
                    if trade_ticker_id and hasattr(trade, 'ticker') and trade.ticker:
                        ticker_already_added = any(
                            item.get('type') == 'ticker' and item.get('id') == trade.ticker.id 
                            for item in linked_items
                        )
                        if not ticker_already_added:
                            linked_items.append({
                                'id': trade.ticker.id,
                                'type': 'ticker',
                                'title': 'טיקר',
                                'name': trade.ticker.symbol,
                                'description': f"טיקר {trade.ticker.symbol}",
                                'status': trade.ticker.status,
                                'side': None,
                                'investment_type': None,
                                'created_at': _format_datetime(trade.ticker.created_at),
                                'updated_at': _format_datetime(getattr(trade.ticker, 'updated_at', None))
                            })
            
            # Get ticker if directly linked (always add, even if also linked through trade)
            if execution.ticker_id:
                ticker = db.query(Ticker).filter(Ticker.id == execution.ticker_id).first()
                if ticker:
                    # Check if this ticker was already added through trade to avoid duplicates
                    ticker_already_added = any(
                        item.get('type') == 'ticker' and item.get('id') == ticker.id 
                        for item in linked_items
                    )
                    if not ticker_already_added:
                        linked_items.append({
                            'id': ticker.id,
                            'type': 'ticker',
                            'title': 'טיקר',
                            'name': ticker.symbol,
                            'description': f"טיקר {ticker.symbol}",
                            'status': ticker.status,
                            'side': None,
                            'investment_type': None,
                            'created_at': _format_datetime(ticker.created_at),
                            'updated_at': _format_datetime(getattr(ticker, 'updated_at', None))
                        })
            
            logger.debug(f"Found {len(linked_items)} linked items for execution {execution_id}")
                
        except Exception as e:
            logger.error(f"Error getting execution linked items: {str(e)}")
        
        return linked_items
    
    @staticmethod
    def _get_cash_flow_linked_items(db: Session, cash_flow_id: int) -> List[Dict[str, Any]]:
        """Get linked items for cash flow"""
        linked_items = []
        
        try:
            # Get the cash flow entity
            cash_flow = db.query(CashFlow).filter(CashFlow.id == cash_flow_id).first()
            if not cash_flow:
                logger.warning(f"Cash flow {cash_flow_id} not found")
                return []
            
            def _format_datetime(value):
                if not value:
                    return None
                try:
                    return value.isoformat()  # datetime objects
                except AttributeError:
                    return str(value)
            
            # Get trading account (always present)
            if cash_flow.trading_account_id:
                account = db.query(TradingAccount).filter(TradingAccount.id == cash_flow.trading_account_id).first()
                if account:
                    linked_items.append({
                        'id': account.id,
                        'type': 'trading_account',
                        'title': 'חשבון מסחר',
                        'name': account.name,
                        'description': account.name,
                        'status': account.status,
                        'side': None,
                        'investment_type': None,
                        'created_at': _format_datetime(account.created_at),
                        'updated_at': _format_datetime(getattr(account, 'updated_at', None))
                    })
            
            # Get trade if linked
            trade = None
            trade_ticker_id = None
            if cash_flow.trade_id:
                trade = db.query(Trade).options(joinedload(Trade.ticker)).filter(Trade.id == cash_flow.trade_id).first()
                if trade:
                    ticker_symbol = trade.ticker.symbol if getattr(trade, 'ticker', None) else None
                    trade_ticker_id = trade.ticker_id if hasattr(trade, 'ticker_id') else None
                    side = trade.side or ''
                    investment_type = trade.investment_type or ''
                    description = f"טרייד {side} על {ticker_symbol}" if ticker_symbol else f"טרייד {side} - {investment_type}".strip() or f"טרייד #{trade.id}"
                    linked_items.append({
                        'id': trade.id,
                        'type': 'trade',
                        'title': 'טרייד',
                        'name': ticker_symbol or f"טרייד #{trade.id}",
                        'description': description,
                        'status': trade.status,
                        'side': trade.side,
                        'investment_type': trade.investment_type,
                        'created_at': _format_datetime(trade.created_at),
                        'updated_at': _format_datetime(getattr(trade, 'updated_at', None) or getattr(trade, 'closed_at', None))
                    })
                    
                    # Add ticker from trade if it exists and not already added
                    if trade_ticker_id and hasattr(trade, 'ticker') and trade.ticker:
                        ticker_already_added = any(
                            item.get('type') == 'ticker' and item.get('id') == trade.ticker.id 
                            for item in linked_items
                        )
                        if not ticker_already_added:
                            linked_items.append({
                                'id': trade.ticker.id,
                                'type': 'ticker',
                                'title': 'טיקר',
                                'name': trade.ticker.symbol,
                                'description': f"טיקר {trade.ticker.symbol}",
                                'status': trade.ticker.status,
                                'side': None,
                                'investment_type': None,
                                'created_at': _format_datetime(trade.ticker.created_at),
                                'updated_at': _format_datetime(getattr(trade.ticker, 'updated_at', None))
                            })

            # Add paired cash flow for currency exchanges
            if CashFlowHelperService.is_currency_exchange(cash_flow.external_id, getattr(cash_flow, 'type', None)):
                exchange_flows = CashFlowHelperService.get_exchange_flows(db, cash_flow.external_id)
                counterpart_flow = next((flow for flow in exchange_flows if flow.id != cash_flow.id), None)
                from_flow_model = next((flow for flow in exchange_flows if CashFlowHelperService.get_exchange_direction(flow.type) == 'from'), None)
                to_flow_model = next((flow for flow in exchange_flows if CashFlowHelperService.get_exchange_direction(flow.type) == 'to'), None)
                pair_summary = CashFlowHelperService.build_exchange_pair_summary(from_flow_model, to_flow_model)

                if counterpart_flow:
                    direction = CashFlowHelperService.get_exchange_direction(counterpart_flow.type)
                    currency_symbol = getattr(getattr(counterpart_flow, 'currency', None), 'symbol', None)
                    currency_name = getattr(getattr(counterpart_flow, 'currency', None), 'name', None)
                    amount_value = getattr(counterpart_flow, 'amount', None)
                    amount_display = f"{abs(amount_value or 0):,.2f}" if amount_value is not None else 'N/A'
                    description = f"צד {'שלילי' if direction == 'from' else 'חיובי'} • {amount_display} {currency_symbol or ''}".strip()

                    linked_items.append({
                        'id': counterpart_flow.id,
                        'type': 'cash_flow',
                        'title': 'תזרים צמוד',
                        'name': description,
                        'description': description,
                        'status': 'exchange_pair',
                        'side': direction,
                        'investment_type': None,
                        'amount': amount_value,
                        'currency_symbol': currency_symbol,
                        'currency_name': currency_name,
                        'exchange_group_id': cash_flow.external_id,
                        'exchange_direction': direction,
                        'metadata': {
                            'exchange_pair_summary': pair_summary
                        },
                        'created_at': _format_datetime(counterpart_flow.created_at),
                        'updated_at': _format_datetime(getattr(counterpart_flow, 'updated_at', None))
                    })
            
            logger.debug(f"Found {len(linked_items)} linked items for cash_flow {cash_flow_id}")
                
        except Exception as e:
            logger.error(f"Error getting cash flow linked items: {str(e)}")
        
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