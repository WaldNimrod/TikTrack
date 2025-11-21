from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from models.trading_account import TradingAccount
from models.cash_flow import CashFlow
from models.execution import Execution
from services.validation_service import ValidationService
from typing import List, Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)

class TradingAccountService:
    @staticmethod
    def get_all(db: Session) -> List[TradingAccount]:
        """Get all trading_accounts"""
        return db.query(TradingAccount).all()
    
    @staticmethod
    def get_by_id(db: Session, trading_account_id: int) -> Optional[TradingAccount]:
        """Get trading_account by ID"""
        return db.query(TradingAccount).filter(TradingAccount.id == trading_account_id).first()
    
    @staticmethod
    def get_by_name(db: Session, account_name: str) -> Optional[TradingAccount]:
        """Get trading_account by name with currency relationship"""
        return db.query(TradingAccount).options(
            joinedload(TradingAccount.currency)
        ).filter(TradingAccount.name == account_name).first()
    
    @staticmethod
    def get_open_trading_accounts(db: Session) -> List[TradingAccount]:
        """Get all open trading_accounts"""
        return db.query(TradingAccount).filter(TradingAccount.status == 'open').all()
    
    @staticmethod
    def create(db: Session, data: Dict[str, Any]) -> TradingAccount:
        """Create new trading_account"""
        # Validate that all fields exist in the TradingAccount model
        allowed_fields = {
            'name',
            'currency_id',
            'status',
            'cash_balance',
            'total_value',
            'total_pl',
            'notes',
            'opening_balance',
            'external_account_number'
        }
        invalid_fields = set(data.keys()) - allowed_fields
        if invalid_fields:
            raise ValueError(f"Invalid fields: {', '.join(invalid_fields)}. Allowed fields: {', '.join(allowed_fields)}")
        
        # Validate data against dynamic constraints
        is_valid, errors = ValidationService.validate_data(db, 'trading_accounts', data)
        if not is_valid:
            raise ValueError(f"Validation failed: {'; '.join(errors)}")
        
        trading_account = TradingAccount(**data)
        db.add(trading_account)
        db.commit()
        db.refresh(trading_account)
        logger.info(f"Created trading_account: {trading_account.name}")
        return trading_account
    
    @staticmethod
    def update(db: Session, trading_account_id: int, data: Dict[str, Any]) -> Optional[TradingAccount]:
        """Update trading_account"""
        logger.info(f"Updating trading_account {trading_account_id} with data: {data}")
        trading_account = db.query(TradingAccount).filter(TradingAccount.id == trading_account_id).first()
        if not trading_account:
            logger.error(f"TradingAccount {trading_account_id} not found")
            return None
        
        # Prevent base currency changes for existing accounts
        if 'currency_id' in data and data['currency_id'] is not None:
            try:
                new_currency_id = int(data['currency_id'])
            except (TypeError, ValueError):
                new_currency_id = data['currency_id']
            if trading_account.currency_id != new_currency_id:
                logger.warning(
                    "Rejected base currency change for trading account %s: current=%s, requested=%s",
                    trading_account_id,
                    trading_account.currency_id,
                    new_currency_id
                )
                raise ValueError("Changing base currency for an existing trading account is not supported")

        # Validate data against dynamic constraints (excluding current ID for unique checks)
        logger.info(f"Validating data with exclude_id={trading_account_id}")
        is_valid, errors = ValidationService.validate_data(db, 'trading_accounts', data, exclude_id=trading_account_id)
        logger.info(f"Validation result: valid={is_valid}, errors={errors}")
        if not is_valid:
            raise ValueError(f"Validation failed: {'; '.join(errors)}")
        
        for key, value in data.items():
            if hasattr(trading_account, key):
                setattr(trading_account, key, value)
        db.commit()
        db.refresh(trading_account)
        logger.info(f"Updated trading_account: {trading_account.name}")
        return trading_account
    
    @staticmethod
    def delete(db: Session, trading_account_id: int) -> bool:
        """Delete trading_account"""
        from models.trade import Trade
        from models.execution import Execution
        
        trading_account = db.query(TradingAccount).filter(TradingAccount.id == trading_account_id).first()
        if not trading_account:
            return False
        
        # הגנה על החשבון האחרון
        all_trading_accounts = db.query(TradingAccount).all()
        if len(all_trading_accounts) == 1:
            logger.warning(f"Cannot delete trading_account {trading_account_id}: it is the last trading_account in the system")
            return False
        
        # Check for linked trades
        trades = db.query(Trade).filter(Trade.trading_account_id == trading_account_id).all()
        if trades:
            logger.warning(f"Cannot delete trading_account {trading_account_id}: has {len(trades)} linked trades")
            return False
        
        # Check for linked executions (through trades)
        executions = db.query(Execution).join(Trade).filter(Trade.trading_account_id == trading_account_id).all()
        if executions:
            logger.warning(f"Cannot delete trading_account {trading_account_id}: has {len(executions)} linked executions")
            return False
        
        # Safe to delete
        db.delete(trading_account)
        db.commit()
        logger.info(f"Deleted trading_account: {trading_account.name}")
        return True
    
    @staticmethod
    def get_stats(db: Session, trading_account_id: int) -> Dict[str, Any]:
        """Get trading_account statistics"""
        from models.trade import Trade
        from models.cash_flow import CashFlow
        
        trading_account = db.query(TradingAccount).filter(TradingAccount.id == trading_account_id).first()
        if not trading_account:
            return {}
        
        # Trade statistics
        trades = db.query(Trade).filter(Trade.trading_account_id == trading_account_id).all()
        open_trades = [t for t in trades if t.status == 'open']
        closed_trades = [t for t in trades if t.status == 'closed']
        
        # Cash flow statistics
        cash_flows = db.query(CashFlow).filter(CashFlow.trading_account_id == trading_account_id).all()
        
        total_pl = sum(trade.total_pl for trade in trades)
        realized_pl = sum(trade.total_pl for trade in closed_trades)
        unrealized_pl = sum(trade.total_pl for trade in open_trades)
        
        return {
            'trading_account_id': trading_account_id,
            'total_trades': len(trades),
            'open_trades': len(open_trades),
            'closed_trades': len(closed_trades),
            'total_pl': total_pl,
            'realized_pl': realized_pl,
            'unrealized_pl': unrealized_pl,
            'cash_flows_count': len(cash_flows),
            'total_cash_flow': sum(cf.amount for cf in cash_flows)
        }
    
    @staticmethod
    def update_trading_account_values(db: Session, trading_account_id: int) -> bool:
        """Update trading_account values"""
        from models.trade import Trade
        
        trading_account = db.query(TradingAccount).filter(TradingAccount.id == trading_account_id).first()
        if not trading_account:
            return False
        
        # Recalculate values
        trades = db.query(Trade).filter(Trade.trading_account_id == trading_account_id).all()
        total_pl = sum(trade.total_pl for trade in trades)
        
        # Update trading_account
        trading_account.total_pl = total_pl
        db.commit()
        logger.info(f"Updated trading_account values for: {trading_account.name}")
        return True
    
    
    @staticmethod
    def get_open_trades(db: Session, trading_account_id: int) -> List[Dict[str, Any]]:
        """Get open trades for trading_account"""
        from models.trade import Trade
        from models.ticker import Ticker
        
        # Get open trades with ticker details
        trades = db.query(Trade, Ticker).join(
            Ticker, Trade.ticker_id == Ticker.id
        ).filter(
            Trade.trading_account_id == trading_account_id,
            Trade.status == 'open'
        ).all()
        
        # Convert to dictionary
        open_trades = []
        for trade, ticker in trades:
            open_trades.append({
                'id': trade.id,
                'ticker_id': trade.ticker_id,
                'ticker_symbol': ticker.symbol,
                'investment_type': trade.investment_type,
                'status': trade.status,
                'created_at': trade.created_at.isoformat() if trade.created_at else None,
                'total_pl': trade.total_pl,
                'notes': trade.notes
            })
        
        logger.info(f"Found {len(open_trades)} open trades for trading_account {trading_account_id}")
        return open_trades
