from sqlalchemy.orm import Session, joinedload
from models.trade import Trade
from models.trade_plan import TradePlan
from services.validation_service import ValidationService
from typing import List, Optional, Dict, Any
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class TradeService:
    @staticmethod
    def get_all(db: Session) -> List[Trade]:
        """Get all trades"""
        import logging
        logger = logging.getLogger(__name__)
        
        logger.info("Loading trades with joinedload for account and ticker")
        
        # Ensure transaction is in clean state before query
        try:
            from sqlalchemy import text
            db.execute(text("SELECT 1"))
        except Exception as tx_error:
            logger.warning(f"Transaction aborted detected, rolling back: {str(tx_error)}")
            db.rollback()
        
        trades = db.query(Trade).options(
            joinedload(Trade.account),
            joinedload(Trade.ticker),
            joinedload(Trade.trade_plan)
        ).all()
        
        logger.info(f"Loaded {len(trades)} trades")
        if trades:
            first_trade = trades[0]
            logger.info(f"First trade ID: {first_trade.id}")
            logger.info(f"First trade trading_account_id: {first_trade.trading_account_id}")
            logger.info(f"First trade ticker_id: {first_trade.ticker_id}")
            logger.info(f"First trade has account attribute: {hasattr(first_trade, 'account')}")
            logger.info(f"First trade account object: {first_trade.account}")
            logger.info(f"First trade has ticker attribute: {hasattr(first_trade, 'ticker')}")
            logger.info(f"First trade ticker object: {first_trade.ticker}")
            if hasattr(first_trade, 'account') and first_trade.account:
                logger.info(f"First trade account name: {first_trade.account.name}")
            if hasattr(first_trade, 'ticker') and first_trade.ticker:
                logger.info(f"First trade ticker symbol: {first_trade.ticker.symbol}")
        
        return trades
    
    @staticmethod
    def get_by_id(db: Session, trade_id: int) -> Optional[Trade]:
        """Get trade by ID"""
        return db.query(Trade).options(
            joinedload(Trade.account),
            joinedload(Trade.ticker)
        ).filter(Trade.id == trade_id).first()
    
    @staticmethod
    def get_by_account(db: Session, trading_account_id: int) -> List[Trade]:
        """Get trades by account"""
        return db.query(Trade).filter(Trade.trading_account_id == trading_account_id).all()
    
    @staticmethod
    def get_by_ticker(db: Session, ticker_id: int) -> List[Trade]:
        """Get trades by ticker"""
        return db.query(Trade).filter(Trade.ticker_id == ticker_id).all()
    
    @staticmethod
    def get_open_trades(db: Session) -> List[Trade]:
        """Get open trades"""
        return db.query(Trade).filter(Trade.status == 'open').all()
    
    @staticmethod
    def get_trades_without_plan(
        db: Session,
        status_filter: Optional[List[str]] = None,
        *,
        load_relationships: bool = False,
    ) -> List[Trade]:
        """
        Get trades without an associated trade plan.

        Args:
            db: Database session.
            status_filter: Optional list of statuses to include (defaults to ['open']).
            load_relationships: When True, eager-load ticker, account, executions.
        """
        query = db.query(Trade)
        if load_relationships:
            query = query.options(
                joinedload(Trade.account),
                joinedload(Trade.ticker),
                joinedload(Trade.executions),
            )

        query = query.filter(Trade.trade_plan_id.is_(None))

        statuses = status_filter or ['open']
        if statuses:
            query = query.filter(Trade.status.in_(statuses))

        return query.order_by(Trade.created_at.desc()).all()
    
    @staticmethod
    def get_by_status(db: Session, status: str) -> List[Trade]:
        """Get trades by status"""
        return db.query(Trade).filter(Trade.status == status).all()
    
    @staticmethod
    def get_by_account_and_status(db: Session, trading_account_id: int, status: str) -> List[Trade]:
        """Get trades by account and status"""
        import logging
        logger = logging.getLogger(__name__)
        
        logger.info(f"Getting trades for trading_account_id={trading_account_id} and status={status}")
        
        # Check all trades in system
        all_trades = db.query(Trade).all()
        logger.info(f"Total trades in system: {len(all_trades)}")
        
        # Check trades by account
        account_trades = db.query(Trade).filter(Trade.trading_account_id == trading_account_id).all()
        logger.info(f"Trades for account {trading_account_id}: {len(account_trades)}")
        
        # Check trades by status
        status_trades = db.query(Trade).filter(Trade.status == status).all()
        logger.info(f"Trades with status {status}: {len(status_trades)}")
        
        # Combined filtering
        filtered_trades = db.query(Trade).filter(
            Trade.trading_account_id == trading_account_id,
            Trade.status == status
        ).all()
        
        logger.info(f"Filtered trades for account {trading_account_id} with status {status}: {len(filtered_trades)}")
        
        return filtered_trades
    
    @staticmethod
    def create(db: Session, data: Dict[str, Any]) -> Trade:
        """
        Create a new trade with snapshot support for planning fields.
        
        **Snapshot Pattern (2025-01-29):**
        When a trade_plan_id is provided, this method implements the "snapshot" pattern:
        - TradePlan is the source of truth by default
        - Planning fields (planned_quantity, planned_amount, entry_price) are copied 
          from the linked TradePlan as a snapshot at trade creation time
        - Explicit planning fields in data override snapshot values (allows manual override)
        - planned_quantity is calculated automatically: planned_amount / entry_price
        
        **No Fallbacks Policy:**
        - Only uses TradePlan data if trade_plan_id is provided
        - Does not use position data or other fallback sources
        - If planning fields are missing, they remain NULL (no automatic calculation from other sources)
        
        Args:
            db (Session): Database session
            data (Dict[str, Any]): Trade data including:
                - trading_account_id (required)
                - ticker_id (required)
                - trade_plan_id (optional) - if provided, planning fields are snapshotted from plan
                - planned_quantity (optional) - overrides snapshot if provided
                - planned_amount (optional) - overrides snapshot if provided
                - entry_price (optional) - overrides snapshot if provided
                - Other standard trade fields (status, side, investment_type, etc.)
        
        Returns:
            Trade: Created trade entity
        
        Raises:
            ValueError: If validation fails or date format is invalid
        
        Example:
            # Create trade from plan (snapshot)
            trade = TradeService.create(db, {
                'trading_account_id': 1,
                'ticker_id': 2,
                'trade_plan_id': 5  # Planning fields will be copied from plan #5
            })
            
            # Create trade with explicit planning fields (override)
            trade = TradeService.create(db, {
                'trading_account_id': 1,
                'ticker_id': 2,
                'trade_plan_id': 5,
                'planned_amount': 15000,  # Overrides plan's planned_amount
                'entry_price': 150  # Overrides plan's entry_price
            })
        """
        # Snapshot planning data when a trade_plan_id is provided
        # This implements the "snapshot" pattern: Trade Plan is the source of truth by default
        # When creating a trade from a plan, we copy planning fields as a snapshot at trade creation time
        trade_plan_id = data.get('trade_plan_id')
        if trade_plan_id:
            try:
                plan = db.query(TradePlan).filter(TradePlan.id == trade_plan_id).first()
            except Exception as e:
                logger.warning(f"Could not load trade plan {trade_plan_id} for planning snapshot: {e}")
                plan = None
            if plan:
                # Only fill snapshot fields when not explicitly provided in payload
                # This allows manual override while defaulting to plan values
                plan_amount = getattr(plan, 'planned_amount', None)
                plan_entry_price = getattr(plan, 'entry_price', None)
                
                data.setdefault('planned_amount', plan_amount)
                data.setdefault('entry_price', plan_entry_price)
                
                # Calculate planned_quantity from planned_amount and entry_price if both are available
                if 'planned_quantity' not in data and plan_amount and plan_entry_price and plan_entry_price > 0:
                    data['planned_quantity'] = plan_amount / plan_entry_price
                elif 'planned_quantity' not in data:
                    # Fallback: try to get quantity from plan if it exists (future field)
                    data.setdefault('planned_quantity', getattr(plan, 'quantity', None))

        # Convert string dates to datetime objects
        if 'created_at' in data and isinstance(data['created_at'], str):
            try:
                data['created_at'] = datetime.fromisoformat(data['created_at'].replace('Z', '+00:00'))
            except ValueError:
                # Try other date formats
                try:
                    data['created_at'] = datetime.strptime(data['created_at'], '%Y-%m-%d %H:%M:%S')
                except ValueError:
                    raise ValueError(f"Invalid date format for created_at: {data['created_at']}")
        
        if 'closed_at' in data and isinstance(data['closed_at'], str):
            try:
                data['closed_at'] = datetime.fromisoformat(data['closed_at'].replace('Z', '+00:00'))
            except ValueError:
                try:
                    data['closed_at'] = datetime.strptime(data['closed_at'], '%Y-%m-%d %H:%M:%S')
                except ValueError:
                    raise ValueError(f"Invalid date format for closed_at: {data['closed_at']}")
        
        # Validate data against dynamic constraints
        logger.info("About to call ValidationService.validate_data")
        logger.info(f"Data to validate: {data}")
        is_valid, errors = ValidationService.validate_data(db, 'trades', data)
        logger.info(f"ValidationService returned: is_valid={is_valid}, errors={errors}")
        if not is_valid:
            raise ValueError(f"Validation failed: {'; '.join(errors)}")
        
        trade = Trade(**data)
        db.add(trade)
        db.commit()
        db.refresh(trade)
        logger.info(f"Created trade: {trade.id} for ticker {trade.ticker_id}")
        return trade
    
    @staticmethod
    def update(db: Session, trade_id: int, data: Dict[str, Any]) -> Optional[Trade]:
        """Update trade"""
        trade = db.query(Trade).filter(Trade.id == trade_id).first()
        if not trade:
            return None
        
        # Convert string dates to datetime objects
        if 'created_at' in data and isinstance(data['created_at'], str):
            try:
                data['created_at'] = datetime.fromisoformat(data['created_at'].replace('Z', '+00:00'))
            except ValueError:
                try:
                    data['created_at'] = datetime.strptime(data['created_at'], '%Y-%m-%d %H:%M:%S')
                except ValueError:
                    raise ValueError(f"Invalid date format for created_at: {data['created_at']}")
        
        if 'closed_at' in data and isinstance(data['closed_at'], str):
            try:
                data['closed_at'] = datetime.fromisoformat(data['closed_at'].replace('Z', '+00:00'))
            except ValueError:
                try:
                    data['closed_at'] = datetime.strptime(data['closed_at'], '%Y-%m-%d %H:%M:%S')
                except ValueError:
                    raise ValueError(f"Invalid date format for closed_at: {data['closed_at']}")
        
        # Validate data against dynamic constraints (excluding current ID for unique checks)
        is_valid, errors = ValidationService.validate_data(db, 'trades', data, exclude_id=trade_id)
        if not is_valid:
            raise ValueError(f"Validation failed: {'; '.join(errors)}")
        
        for key, value in data.items():
            if hasattr(trade, key):
                setattr(trade, key, value)
        
        db.commit()
        logger.info(f"Updated trade: {trade.id}")
        return trade
    
    @staticmethod
    def delete(db: Session, trade_id: int) -> bool:
        """Delete trade"""
        from models.execution import Execution
        
        trade = db.query(Trade).filter(Trade.id == trade_id).first()
        if not trade:
            return False
        
        # Check for linked executions
        executions = db.query(Execution).filter(Execution.trade_id == trade_id).all()
        if executions:
            logger.warning(f"Cannot delete trade {trade_id}: has {len(executions)} linked executions")
            return False
        
        # Safe to delete
        db.delete(trade)
        db.commit()
        logger.info(f"Deleted trade: {trade_id}")
        return True
    
    @staticmethod
    def assign_plan(
        db: Session,
        trade_id: int,
        trade_plan_id: int,
        *,
        validate_ticker: bool = False
    ) -> Optional[Trade]:
        """
        Assign a trade plan to a trade after validating constraints.

        Args:
            db: Database session.
            trade_id: Trade identifier.
            trade_plan_id: Trade plan identifier.
            validate_ticker: When True, ensure ticker ids match.
        """
        trade = db.query(Trade).options(joinedload(Trade.ticker)).filter(Trade.id == trade_id).first()
        if not trade:
            return None

        if trade.trade_plan_id is not None:
            raise ValueError("Trade is already linked to a trade plan")

        plan = db.query(TradePlan).filter(TradePlan.id == trade_plan_id).first()
        if not plan:
            raise ValueError("Trade plan not found")

        if validate_ticker and trade.ticker_id != plan.ticker_id:
            raise ValueError("Ticker mismatch between trade and trade plan")

        trade.trade_plan_id = trade_plan_id

        # Planning snapshot on late assignment:
        # Only fill snapshot fields if they are currently empty on the trade
        if getattr(trade, 'planned_amount', None) is None:
            trade.planned_amount = getattr(plan, 'planned_amount', None)
        if getattr(trade, 'entry_price', None) is None:
            trade.entry_price = getattr(plan, 'entry_price', None)
        # planned_quantity remains optional and can be derived when needed
        db.add(trade)
        db.commit()
        logger.info(f"Linked trade {trade_id} to trade plan {trade_plan_id}")
        return trade
    
    @staticmethod
    def close_trade(db: Session, trade_id: int, close_data: Dict[str, Any]) -> Optional[Trade]:
        """Close trade"""
        trade = db.query(Trade).filter(Trade.id == trade_id).first()
        if trade and trade.status == 'open':
            trade.status = 'closed'
            trade.closed_at = datetime.utcnow()
            trade.total_pl = close_data.get('total_pl', trade.total_pl)
            db.commit()
            db.refresh(trade)
            logger.info(f"Closed trade: {trade_id}")
            
            # Update ticker active_trades status (triggers will handle this automatically)
            # But we can also call the manual update for immediate consistency
            try:
                from app import update_ticker_open_status
                update_ticker_open_status(trade.ticker_id)
                logger.info(f"Updated ticker {trade.ticker_id} active_trades status after closing trade")
            except Exception as e:
                logger.warning(f"Could not update ticker active_trades status: {e}")
            
            return trade
        return None
    
    @staticmethod
    def cancel_trade(db: Session, trade_id: int, cancel_reason: str) -> Optional[Trade]:
        """Cancel trade"""
        trade = db.query(Trade).filter(Trade.id == trade_id).first()
        if trade and trade.status == 'open':
            trade.status = 'cancelled'
            trade.cancelled_at = datetime.utcnow()
            trade.cancel_reason = cancel_reason
            db.commit()
            db.refresh(trade)
            logger.info(f"Cancelled trade: {trade_id}")
            
            # Update ticker active_trades status (triggers will handle this automatically)
            try:
                from app import update_ticker_open_status
                update_ticker_open_status(trade.ticker_id)
                logger.info(f"Updated ticker {trade.ticker_id} active_trades status after cancelling trade")
            except Exception as e:
                logger.warning(f"Could not update ticker active_trades status: {e}")
            
            return trade
        return None
    
    @staticmethod
    def calculate_trade_pl(db: Session, trade_id: int) -> float:
        """Calculate trade profit/loss"""
        from models.execution import Execution
        
        trade = db.query(Trade).filter(Trade.id == trade_id).first()
        if not trade:
            return 0.0
        
        executions = db.query(Execution).filter(Execution.trade_id == trade_id).all()
        
        total_cost = 0.0
        total_proceeds = 0.0
        
        for execution in executions:
            if execution.action == 'buy':
                total_cost += execution.quantity * execution.price + execution.fee
            elif execution.action == 'sell':
                total_proceeds += execution.quantity * execution.price - execution.fee
        
        return total_proceeds - total_cost
    
    @staticmethod
    def update_trade_pl(db: Session, trade_id: int) -> bool:
        """Update trade profit/loss"""
        trade = db.query(Trade).filter(Trade.id == trade_id).first()
        if trade:
            trade.total_pl = TradeService.calculate_trade_pl(db, trade_id)
            db.commit()
            logger.info(f"Updated PL for trade: {trade_id}")
            return True
        return False
    
    @staticmethod
    def get_trade_summary(db: Session, trading_account_id: Optional[int] = None) -> Dict[str, Any]:
        """Get trade summary"""
        query = db.query(Trade)
        if trading_account_id:
            query = query.filter(Trade.trading_account_id == trading_account_id)
        
        trades = query.all()
        
        total_trades = len(trades)
        open_trades = len([t for t in trades if t.status == 'open'])
        closed_trades = len([t for t in trades if t.status == 'closed'])
        cancelled_trades = len([t for t in trades if t.status == 'cancelled'])
        
        total_pl = sum(trade.total_pl for trade in trades)
        realized_pl = sum(trade.total_pl for trade in trades if trade.status == 'closed')
        unrealized_pl = sum(trade.total_pl for trade in trades if trade.status == 'open')
        
        return {
            'total_trades': total_trades,
            'open_trades': open_trades,
            'closed_trades': closed_trades,
            'cancelled_trades': cancelled_trades,
            'total_pl': total_pl,
            'realized_pl': realized_pl,
            'unrealized_pl': unrealized_pl
        }
