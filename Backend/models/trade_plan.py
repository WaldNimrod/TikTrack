from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .base import BaseModel

class TradePlan(BaseModel):
    __tablename__ = "trade_plans"
    
    account_id = Column(Integer, ForeignKey('accounts.id'), nullable=False)
    ticker_id = Column(Integer, ForeignKey('tickers.id'), nullable=False)
    investment_type = Column(String(20), default='swing', nullable=True)
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
    
    def __repr__(self):
        return f"<TradePlan(id={self.id}, type='{self.investment_type}')>"
