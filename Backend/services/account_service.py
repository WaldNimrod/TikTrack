from sqlalchemy.orm import Session
from models.account import Account
from typing import List, Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)

class AccountService:
    @staticmethod
    def get_all(db: Session) -> List[Account]:
        """Get all accounts"""
        return db.query(Account).all()
    
    @staticmethod
    def get_by_id(db: Session, account_id: int) -> Optional[Account]:
        """Get account by ID"""
        return db.query(Account).filter(Account.id == account_id).first()
    
    @staticmethod
    def create(db: Session, data: Dict[str, Any]) -> Account:
        """Create new account"""
        account = Account(**data)
        db.add(account)
        db.commit()
        db.refresh(account)
        logger.info(f"Created account: {account.name}")
        return account
    
    @staticmethod
    def update(db: Session, account_id: int, data: Dict[str, Any]) -> Optional[Account]:
        """Update account"""
        account = db.query(Account).filter(Account.id == account_id).first()
        if account:
            for key, value in data.items():
                if hasattr(account, key):
                    setattr(account, key, value)
            db.commit()
            db.refresh(account)
            logger.info(f"Updated account: {account.name}")
            return account
        return None
    
    @staticmethod
    def delete(db: Session, account_id: int) -> bool:
        """Delete account"""
        from models.trade import Trade
        from models.execution import Execution
        
        account = db.query(Account).filter(Account.id == account_id).first()
        if not account:
            return False
        
        # Check for linked trades
        trades = db.query(Trade).filter(Trade.account_id == account_id).all()
        if trades:
            logger.warning(f"Cannot delete account {account_id}: has {len(trades)} linked trades")
            return False
        
        # Check for linked executions (through trades)
        executions = db.query(Execution).join(Trade).filter(Trade.account_id == account_id).all()
        if executions:
            logger.warning(f"Cannot delete account {account_id}: has {len(executions)} linked executions")
            return False
        
        # Safe to delete
        db.delete(account)
        db.commit()
        logger.info(f"Deleted account: {account.name}")
        return True
    
    @staticmethod
    def get_stats(db: Session, account_id: int) -> Dict[str, Any]:
        """Get account statistics"""
        from models.trade import Trade
        from models.cash_flow import CashFlow
        
        account = db.query(Account).filter(Account.id == account_id).first()
        if not account:
            return {}
        
        # Trade statistics
        trades = db.query(Trade).filter(Trade.account_id == account_id).all()
        open_trades = [t for t in trades if t.status == 'open']
        closed_trades = [t for t in trades if t.status == 'closed']
        
        # Cash flow statistics
        cash_flows = db.query(CashFlow).filter(CashFlow.account_id == account_id).all()
        
        total_pl = sum(trade.total_pl for trade in trades)
        realized_pl = sum(trade.total_pl for trade in closed_trades)
        unrealized_pl = sum(trade.total_pl for trade in open_trades)
        
        return {
            'account_id': account_id,
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
    def update_account_values(db: Session, account_id: int) -> bool:
        """Update account values"""
        from models.trade import Trade
        
        account = db.query(Account).filter(Account.id == account_id).first()
        if not account:
            return False
        
        # Recalculate values
        trades = db.query(Trade).filter(Trade.account_id == account_id).all()
        total_pl = sum(trade.total_pl for trade in trades)
        
        # Update account
        account.total_pl = total_pl
        db.commit()
        logger.info(f"Updated account values for: {account.name}")
        return True
    

    
    @staticmethod
    def get_open_trades(db: Session, account_id: int) -> List[Dict[str, Any]]:
        """Get open trades for account"""
        from models.trade import Trade
        from models.ticker import Ticker
        
        # Get open trades with ticker details
        trades = db.query(Trade, Ticker).join(
            Ticker, Trade.ticker_id == Ticker.id
        ).filter(
            Trade.account_id == account_id,
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
        
        logger.info(f"Found {len(open_trades)} open trades for account {account_id}")
        return open_trades
