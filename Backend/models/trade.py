from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.exc import IntegrityError
from .base import BaseModel

class Trade(BaseModel):
    __tablename__ = "trades"
    
    account_id = Column(Integer, ForeignKey('accounts.id'), nullable=False)
    ticker_id = Column(Integer, ForeignKey('tickers.id'), nullable=False)
    trade_plan_id = Column(Integer, ForeignKey('trade_plans.id'), nullable=True)
    status = Column(String(20), default='open', nullable=True)
    type = Column(String(20), default='swing', nullable=True)
    side = Column(String(10), default='Long', nullable=True)  # Long, Short
    # opened_at field removed - using created_at from BaseModel instead
    closed_at = Column(DateTime, nullable=True)
    cancelled_at = Column(DateTime, nullable=True)
    cancel_reason = Column(String(500), nullable=True)
    total_pl = Column(Float, default=0, nullable=True)
    notes = Column(String(500), nullable=True)
    
    # יחסים
    account = relationship("Account", back_populates="trades")
    ticker = relationship("Ticker")
    trade_plan = relationship("TradePlan", back_populates="trades")
    executions = relationship("Execution", back_populates="trade")
    # Notes relationship removed - notes now use related_type and related_id
    
    def to_dict(self):
        """המרה למילון עם יחסים"""
        import logging
        logger = logging.getLogger(__name__)
        
        result = {}
        for c in self.__table__.columns:
            value = getattr(self, c.name)
            if hasattr(value, 'strftime'):
                result[c.name] = value.strftime('%Y-%m-%d %H:%M:%S') if value else None
            else:
                result[c.name] = value
        
        # הוספת יחסים
        try:
            if hasattr(self, 'account') and self.account:
                result['account_name'] = self.account.name
                logger.info(f"Added account_name: {self.account.name}")
            else:
                result['account_name'] = f'Account_{self.account_id}'
                logger.info(f"No account relationship, using fallback: Account_{self.account_id}")
        except Exception as e:
            result['account_name'] = f'Account_{self.account_id}'
            logger.error(f"Error getting account name: {e}")
        
        try:
            if hasattr(self, 'ticker') and self.ticker:
                result['ticker_symbol'] = self.ticker.symbol
                logger.info(f"Added ticker_symbol: {self.ticker.symbol}")
            else:
                result['ticker_symbol'] = f'Ticker_{self.ticker_id}'
                logger.info(f"No ticker relationship, using fallback: Ticker_{self.ticker_id}")
        except Exception as e:
            result['ticker_symbol'] = f'Ticker_{self.ticker_id}'
            logger.error(f"Error getting ticker symbol: {e}")
        
        return result
    
    def __repr__(self):
        return f"<Trade(id={self.id}, status='{self.status}', type='{self.type}')>"
    
    def validate_trade_plan_link(self, trade_plan):
        """
        בדיקת תקינות הקישור לתוכנית
        
        כללים:
        1. טרייד פתוח חייב להיות מקושר לתוכנית במצב פתוח או סגור
        2. טרייד סגור או מבוטל יכול להיות משוייך לתוכנית בכל סטטוס
        3. תאריך יצירת הטרייד לא יכול להיות מוקדם לתאריך יצירת התוכנית
        4. צד הטרייד חייב להיות זהה לצד התוכנית
        5. סוג הטרייד יכול להיות שונה מסוג התוכנית
        """
        if not trade_plan:
            return False, "טרייד חייב להיות מקושר לתוכנית"
        
        # בדיקת תאריך יצירה
        if self.created_at and trade_plan.created_at:
            if self.created_at < trade_plan.created_at:
                return False, f"תאריך יצירת הטרייד ({self.created_at}) לא יכול להיות מוקדם לתאריך יצירת התוכנית ({trade_plan.created_at})"
        
        # בדיקת סטטוס
        if self.status == 'open':
            if trade_plan.status not in ['open', 'closed']:
                return False, f"טרייד פתוח חייב להיות מקושר לתוכנית במצב פתוח או סגור, לא {trade_plan.status}"
        
        # בדיקת צד - חייב להיות זהה
        if self.side != trade_plan.side:
            return False, f"צד הטרייד ({self.side}) חייב להיות זהה לצד התוכנית ({trade_plan.side})"
        
        return True, "תקין"
    
    def validate_before_save(self, db_session):
        """
        בדיקת תקינות לפני שמירה
        """
        errors = []
        
        # בדיקת קישור לתוכנית
        if self.trade_plan_id:
            trade_plan = db_session.query(TradePlan).filter(TradePlan.id == self.trade_plan_id).first()
            if trade_plan:
                is_valid, message = self.validate_trade_plan_link(trade_plan)
                if not is_valid:
                    errors.append(message)
            else:
                errors.append(f"תוכנית {self.trade_plan_id} לא נמצאה")
        else:
            errors.append("טרייד חייב להיות מקושר לתוכנית")
        
        return errors
