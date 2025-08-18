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
        logger.info(f"Updated account values for: {account.name}")
        return True
    
    @staticmethod
    def get_open_trades(db: Session, account_id: int) -> List[Dict[str, Any]]:
        """קבלת טריידים פתוחים של חשבון"""
        from models.trade import Trade
        from models.ticker import Ticker
        
        # בדיקה שהחשבון קיים
        account = db.query(Account).filter(Account.id == account_id).first()
        if not account:
            return []
        
        # קבלת טריידים פתוחים עם פרטי טיקר
        open_trades = db.query(Trade).filter(
            Trade.account_id == account_id,
            Trade.status == 'open'
        ).all()
        
        # המרה לרשימת מילונים עם פרטי טיקר
        trades_data = []
        for trade in open_trades:
            ticker = db.query(Ticker).filter(Ticker.id == trade.ticker_id).first()
            trade_dict = {
                'id': trade.id,
                'ticker_id': trade.ticker_id,
                'ticker_symbol': ticker.symbol if ticker else None,
                'type': trade.type,
                'status': trade.status,
                'total_pl': trade.total_pl,
                'notes': trade.notes,
                'created_at': trade.created_at.isoformat() if trade.created_at else None,
                'opened_at': trade.created_at.isoformat() if trade.created_at else None
            }
            trades_data.append(trade_dict)
        
        return trades_data
        
        # עדכון החשבון
        account.total_pl = total_pl
        db.commit()
        
        logger.info(f"Updated account values for account {account_id}")
        return True
    
    @staticmethod
    def get_open_trades(db: Session, account_id: int) -> List[Dict[str, Any]]:
        """קבלת טריידים פתוחים של חשבון"""
        from models.trade import Trade
        from models.ticker import Ticker
        
        # קבלת טריידים פתוחים עם פרטי הטיקר
        trades = db.query(Trade, Ticker).join(
            Ticker, Trade.ticker_id == Ticker.id
        ).filter(
            Trade.account_id == account_id,
            Trade.status == 'open'
        ).all()
        
        # המרה למילון
        open_trades = []
        for trade, ticker in trades:
            open_trades.append({
                'id': trade.id,
                'ticker_id': trade.ticker_id,
                'ticker_symbol': ticker.symbol,
                'type': trade.type,
                'created_at': trade.created_at,
                'total_pl': trade.total_pl,
                'notes': trade.notes
            })
        
        logger.info(f"Found {len(open_trades)} open trades for account {account_id}")
        return open_trades
