from sqlalchemy.orm import Session, joinedload
from models.trade import Trade
from typing import List, Optional, Dict, Any
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class TradeService:
    @staticmethod
    def get_all(db: Session) -> List[Trade]:
        """קבלת כל הטריידים"""
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
        """קבלת טרייד לפי מזהה"""
        return db.query(Trade).options(
            joinedload(Trade.account),
            joinedload(Trade.ticker)
        ).filter(Trade.id == trade_id).first()
    
    @staticmethod
    def get_by_account(db: Session, account_id: int) -> List[Trade]:
        """קבלת טריידים לפי חשבון"""
        return db.query(Trade).filter(Trade.account_id == account_id).all()
    
    @staticmethod
    def get_by_ticker(db: Session, ticker_id: int) -> List[Trade]:
        """קבלת טריידים לפי טיקר"""
        return db.query(Trade).filter(Trade.ticker_id == ticker_id).all()
    
    @staticmethod
    def get_open_trades(db: Session) -> List[Trade]:
        """קבלת טריידים פתוחים"""
        return db.query(Trade).filter(Trade.status == 'open').all()
    
    @staticmethod
    def get_by_status(db: Session, status: str) -> List[Trade]:
        """קבלת טריידים לפי סטטוס"""
        return db.query(Trade).filter(Trade.status == status).all()
    
    @staticmethod
    def get_by_account_and_status(db: Session, account_id: int, status: str) -> List[Trade]:
        """קבלת טריידים לפי חשבון וסטטוס"""
        import logging
        logger = logging.getLogger(__name__)
        
        logger.info(f"Getting trades for account_id={account_id} and status={status}")
        
        # בדיקה שכל הטריידים במערכת
        all_trades = db.query(Trade).all()
        logger.info(f"Total trades in system: {len(all_trades)}")
        
        # בדיקה של הטריידים לפי חשבון
        account_trades = db.query(Trade).filter(Trade.account_id == account_id).all()
        logger.info(f"Trades for account {account_id}: {len(account_trades)}")
        
        # בדיקה של הטריידים לפי סטטוס
        status_trades = db.query(Trade).filter(Trade.status == status).all()
        logger.info(f"Trades with status {status}: {len(status_trades)}")
        
        # הסינון המשולב
        filtered_trades = db.query(Trade).filter(
            Trade.account_id == account_id,
            Trade.status == status
        ).all()
        
        logger.info(f"Filtered trades for account {account_id} with status {status}: {len(filtered_trades)}")
        
        return filtered_trades
    
    @staticmethod
    def create(db: Session, data: Dict[str, Any]) -> Trade:
        """יצירת טרייד חדש"""
        
        # אם יש trade_plan_id, נקצה את הסוג מהתוכנית כברירת מחדל
        if 'trade_plan_id' in data and data['trade_plan_id']:
            from models.trade_plan import TradePlan
            trade_plan = db.query(TradePlan).filter(TradePlan.id == data['trade_plan_id']).first()
            if trade_plan:
                # הקצאת סוג מהתוכנית אם לא הוגדר
                if 'type' not in data or not data['type']:
                    data['type'] = trade_plan.investment_type
                    logger.info(f"Assigned type '{trade_plan.investment_type}' from trade plan {trade_plan.id}")
                
                # הקצאת צד מהתוכנית אם לא הוגדר
                if 'side' not in data or not data['side']:
                    data['side'] = trade_plan.side
                    logger.info(f"Assigned side '{trade_plan.side}' from trade plan {trade_plan.id}")
        
        trade = Trade(**data)
        
        # בדיקת תקינות לפני שמירה
        validation_errors = trade.validate_before_save(db)
        if validation_errors:
            error_message = "; ".join(validation_errors)
            logger.error(f"Validation errors for trade: {error_message}")
            raise ValueError(f"שגיאות תקינות בטרייד: {error_message}")
        
        db.add(trade)
        db.commit()
        db.refresh(trade)
        logger.info(f"Created trade: {trade.id} for ticker {trade.ticker_id}")
        return trade
    
    @staticmethod
    def update(db: Session, trade_id: int, data: Dict[str, Any]) -> Optional[Trade]:
        """עדכון טרייד"""
        trade = db.query(Trade).filter(Trade.id == trade_id).first()
        if trade:
            for key, value in data.items():
                if hasattr(trade, key):
                    setattr(trade, key, value)
            
            # בדיקת תקינות לפני שמירה
            validation_errors = trade.validate_before_save(db)
            if validation_errors:
                error_message = "; ".join(validation_errors)
                logger.error(f"Validation errors for trade {trade_id}: {error_message}")
                raise ValueError(f"שגיאות תקינות בטרייד: {error_message}")
            
            db.commit()
            db.refresh(trade)
            logger.info(f"Updated trade: {trade.id}")
            return trade
        return None
    
    @staticmethod
    def delete(db: Session, trade_id: int) -> bool:
        """מחיקת טרייד"""
        trade = db.query(Trade).filter(Trade.id == trade_id).first()
        if trade:
            db.delete(trade)
            db.commit()
            logger.info(f"Deleted trade: {trade_id}")
            return True
        return False
    
    @staticmethod
    def close_trade(db: Session, trade_id: int, close_data: Dict[str, Any]) -> Optional[Trade]:
        """סגירת טרייד"""
        trade = db.query(Trade).filter(Trade.id == trade_id).first()
        if trade and trade.status == 'open':
            trade.status = 'closed'
            trade.closed_at = datetime.utcnow()
            trade.total_pl = close_data.get('total_pl', trade.total_pl)
            db.commit()
            db.refresh(trade)
            logger.info(f"Closed trade: {trade_id}")
            return trade
        return None
    
    @staticmethod
    def cancel_trade(db: Session, trade_id: int, cancel_reason: str) -> Optional[Trade]:
        """ביטול טרייד"""
        trade = db.query(Trade).filter(Trade.id == trade_id).first()
        if trade and trade.status == 'open':
            trade.status = 'cancelled'
            trade.cancelled_at = datetime.utcnow()
            trade.cancel_reason = cancel_reason
            db.commit()
            db.refresh(trade)
            logger.info(f"Cancelled trade: {trade_id}")
            return trade
        return None
    
    @staticmethod
    def calculate_trade_pl(db: Session, trade_id: int) -> float:
        """חישוב רווח/הפסד של טרייד"""
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
        """עדכון רווח/הפסד של טרייד"""
        trade = db.query(Trade).filter(Trade.id == trade_id).first()
        if trade:
            trade.total_pl = TradeService.calculate_trade_pl(db, trade_id)
            db.commit()
            logger.info(f"Updated PL for trade: {trade_id}")
            return True
        return False
    
    @staticmethod
    def get_trade_summary(db: Session, account_id: Optional[int] = None) -> Dict[str, Any]:
        """קבלת סיכום טריידים"""
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
