from sqlalchemy import Column, String, Float
from sqlalchemy.orm import relationship
from .base import BaseModel

class Account(BaseModel):
    __tablename__ = "accounts"
    
    name = Column(String(100), nullable=False)
    currency = Column(String(3), default='USD', nullable=True)
    status = Column(String(20), default='active', nullable=True)
    cash_balance = Column(Float, default=0, nullable=True)
    total_value = Column(Float, default=0, nullable=True)
    total_pl = Column(Float, default=0, nullable=True)
    notes = Column(String(500), nullable=True)
    
    # יחסים
    trades = relationship("Trade", back_populates="account")
    trade_plans = relationship("TradePlan", back_populates="account")
    alerts = relationship("Alert", back_populates="account")
    cash_flows = relationship("CashFlow", back_populates="account")
    notes_rel = relationship("Note", back_populates="account")
    
    def __repr__(self):
        return f"<Account(name='{self.name}', currency='{self.currency}')>"
