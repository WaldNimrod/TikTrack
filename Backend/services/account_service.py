from sqlalchemy.orm import Session
from models.account import Account
from typing import List, Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)

class AccountService:
    @staticmethod
    def get_all(db: Session) -> List[Account]:
        """קבלת כל החשבונות"""
        return db.query(Account).all()
    
    @staticmethod
    def get_by_id(db: Session, account_id: int) -> Optional[Account]:
        """קבלת חשבון לפי מזהה"""
        return db.query(Account).filter(Account.id == account_id).first()
    
    @staticmethod
    def create(db: Session, data: Dict[str, Any]) -> Account:
        """יצירת חשבון חדש"""
        account = Account(**data)
        db.add(account)
        db.commit()
        db.refresh(account)
        logger.info(f"Created account: {account.name}")
        return account
    
    @staticmethod
    def update(db: Session, account_id: int, data: Dict[str, Any]) -> Optional[Account]:
        """עדכון חשבון"""
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
        """מחיקת חשבון"""
        account = db.query(Account).filter(Account.id == account_id).first()
        if account:
            db.delete(account)
            db.commit()
            logger.info(f"Deleted account: {account.name}")
            return True
        return False
    
    @staticmethod
    def get_stats(db: Session, account_id: int) -> Dict[str, Any]:
        """קבלת סטטיסטיקות חשבון"""
        from models.trade import Trade
        from models.cash_flow import CashFlow
        
        account = db.query(Account).filter(Account.id == account_id).first()
        if not account:
            return {}
        
        # סטטיסטיקות טריידים
        trades = db.query(Trade).filter(Trade.account_id == account_id).all()
        open_trades = [t for t in trades if t.status == 'open']
        closed_trades = [t for t in trades if t.status == 'closed']
        
        # סטטיסטיקות cash flow
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
        """עדכון ערכי החשבון"""
        from models.trade import Trade
        
        account = db.query(Account).filter(Account.id == account_id).first()
        if not account:
            return False
        
        # חישוב ערכים מחדש
        trades = db.query(Trade).filter(Trade.account_id == account_id).all()
        total_pl = sum(trade.total_pl for trade in trades)
        
        # עדכון החשבון
        account.total_pl = total_pl
        db.commit()
        
        logger.info(f"Updated account values for account {account_id}")
        return True
