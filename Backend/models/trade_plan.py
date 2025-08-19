from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .base import BaseModel

class TradePlan(BaseModel):
    __tablename__ = "trade_plans"
    
    account_id = Column(Integer, ForeignKey('accounts.id'), nullable=False)
    ticker_id = Column(Integer, ForeignKey('tickers.id'), nullable=False)
    investment_type = Column(String(20), default='swing', nullable=True)
    side = Column(String(10), default='Long', nullable=True)  # Long, Short
    status = Column(String(20), default='open', nullable=True)
    planned_amount = Column(Float, default=0, nullable=True)
    entry_conditions = Column(String(500), nullable=True)
    stop_price = Column(Float, nullable=True)
    target_price = Column(Float, nullable=True)
    reasons = Column(String(500), nullable=True)
    canceled_at = Column(DateTime, nullable=True)
    cancel_reason = Column(String(500), nullable=True)
    
    # יחסים
    account = relationship("Account", back_populates="trade_plans")
    ticker = relationship("Ticker")
    trades = relationship("Trade", back_populates="trade_plan")
    # Notes relationship removed - notes now use related_type and related_id
    
    def to_dict(self):
        """המרה למילון עם יחסים"""
        result = {}
        for c in self.__table__.columns:
            value = getattr(self, c.name)
            if hasattr(value, 'strftime'):  # אם זה תאריך
                result[c.name] = value.strftime('%Y-%m-%d %H:%M:%S') if value else None
            else:
                result[c.name] = value
        
        # וידוא שהשדה side מופיע
        if 'side' not in result:
            result['side'] = getattr(self, 'side', 'Long')
        
        # הוספת יחסים
        try:
            if hasattr(self, 'ticker') and self.ticker:
                result['ticker'] = {
                    'id': self.ticker.id,
                    'symbol': self.ticker.symbol,
                    'name': self.ticker.name
                }
        except Exception as e:
            # אם יש בעיה עם היחס ticker, נשתמש ב-ticker_id
            result['ticker'] = {'id': self.ticker_id, 'symbol': f'Ticker_{self.ticker_id}', 'name': f'Ticker {self.ticker_id}'}
        
        try:
            if hasattr(self, 'account') and self.account:
                result['account'] = {
                    'id': self.account.id,
                    'name': self.account.name
                }
        except Exception as e:
            # אם יש בעיה עם היחס account, נשתמש ב-account_id
            result['account'] = {'id': self.account_id, 'name': f'Account_{self.account_id}'}
        
        return result
    
    def __repr__(self):
        return f"<TradePlan(id={self.id}, type='{self.investment_type}')>"
