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
        
        trades = db.query(Trade).options(
            joinedload(Trade.account),
            joinedload(Trade.ticker)
        ).all()
        
        logger.info(f"Loaded {len(trades)} trades")
        if trades:
            first_trade = trades[0]
            logger.info(f"First trade account: {hasattr(first_trade, 'account') and first_trade.account}")
            logger.info(f"First trade ticker: {hasattr(first_trade, 'ticker') and first_trade.ticker}")
        
        return trades
    
    @staticmethod
    def get_by_id(db: Session, trade_id: int) -> Optional[Trade]:
        """Get trade by ID"""
        return db.query(Trade).options(
            joinedload(Trade.account),
            joinedload(Trade.ticker)
        ).filter(Trade.id == trade_id).first()
    
    @staticmethod
    def get_by_account(db: Session, account_id: int) -> List[Trade]:
        """Get trades by account"""
        return db.query(Trade).filter(Trade.account_id == account_id).all()
    
    @staticmethod
    def get_by_ticker(db: Session, ticker_id: int) -> List[Trade]:
        """Get trades by ticker"""
        return db.query(Trade).filter(Trade.ticker_id == ticker_id).all()
    
    @staticmethod
    def get_open_trades(db: Session) -> List[Trade]:
        """Get open trades"""
        return db.query(Trade).filter(Trade.status == 'open').all()
    
    @staticmethod
    def get_by_status(db: Session, status: str) -> List[Trade]:
        """Get trades by status"""
        return db.query(Trade).filter(Trade.status == status).all()
    
    @staticmethod
    def get_by_account_and_status(db: Session, account_id: int, status: str) -> List[Trade]:
        """Get trades by account and status"""
        import logging
        logger = logging.getLogger(__name__)
        
        logger.info(f"Getting trades for account_id={account_id} and status={status}")
        
        # Check all trades in system
        all_trades = db.query(Trade).all()
        logger.info(f"Total trades in system: {len(all_trades)}")
        
        # Check trades by account
        account_trades = db.query(Trade).filter(Trade.account_id == account_id).all()
        logger.info(f"Trades for account {account_id}: {len(account_trades)}")
        
        # Check trades by status
        status_trades = db.query(Trade).filter(Trade.status == status).all()
        logger.info(f"Trades with status {status}: {len(status_trades)}")
        
        # Combined filtering
        filtered_trades = db.query(Trade).filter(
            Trade.account_id == account_id,
            Trade.status == status
        ).all()
        
        logger.info(f"Filtered trades for account {account_id} with status {status}: {len(filtered_trades)}")
        
        return filtered_trades
    
    @staticmethod
    def create(db: Session, data: Dict[str, Any]) -> Trade:
        """Create a new trade"""
        
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
        db.refresh(trade)
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
    def get_trade_summary(db: Session, account_id: Optional[int] = None) -> Dict[str, Any]:
        """Get trade summary"""
        query = db.query(Trade)
        if account_id:
            query = query.filter(Trade.account_id == account_id)
        
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
