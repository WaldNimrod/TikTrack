from sqlalchemy.orm import Session
from models.ticker import Ticker
from typing import List, Optional

class TickerService:
    @staticmethod
    def get_all(db: Session) -> List[Ticker]:
        """קבלת כל הטיקרים"""
        return db.query(Ticker).all()
    
    @staticmethod
    def get_by_id(db: Session, ticker_id: int) -> Optional[Ticker]:
        """קבלת טיקר לפי מזהה"""
        return db.query(Ticker).filter(Ticker.id == ticker_id).first()
    
    @staticmethod
    def get_by_symbol(db: Session, symbol: str) -> Optional[Ticker]:
        """קבלת טיקר לפי סימבול"""
        return db.query(Ticker).filter(Ticker.symbol == symbol).first()
    
    @staticmethod
    def create(db: Session, ticker_data: dict) -> Ticker:
        """יצירת טיקר חדש"""
        ticker = Ticker(**ticker_data)
        db.add(ticker)
        db.commit()
        db.refresh(ticker)
        return ticker
    
    @staticmethod
    def update(db: Session, ticker_id: int, ticker_data: dict) -> Optional[Ticker]:
        """עדכון טיקר"""
        ticker = db.query(Ticker).filter(Ticker.id == ticker_id).first()
        if ticker:
            for key, value in ticker_data.items():
                setattr(ticker, key, value)
            db.commit()
            db.refresh(ticker)
        return ticker
    
    @staticmethod
    def delete(db: Session, ticker_id: int) -> bool:
        """מחיקת טיקר"""
        ticker = db.query(Ticker).filter(Ticker.id == ticker_id).first()
        if ticker:
            db.delete(ticker)
            db.commit()
            return True
        return False
    
    @staticmethod
    def update_active_status(db: Session, ticker_id: int) -> bool:
        """עדכון סטטוס פעילות של טיקר"""
        from models.trade import Trade
        from models.trade_plan import TradePlan
        
        # בדיקה אם יש תכנונים פעילים
        active_plans = db.query(TradePlan).filter(
            TradePlan.ticker_id == ticker_id,
            TradePlan.canceled_at.is_(None)
        ).count()
        
        # בדיקה אם יש טריידים פעילים
        active_trades = db.query(Trade).filter(
            Trade.ticker_id == ticker_id,
            Trade.status.in_(['open', 'pending'])
        ).count()
        
        # עדכון סטטוס
        ticker = db.query(Ticker).filter(Ticker.id == ticker_id).first()
        if ticker:
            ticker.active_trades = (active_plans > 0 or active_trades > 0)
            db.commit()
            return True
        return False
