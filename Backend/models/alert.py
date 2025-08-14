from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .base import BaseModel

class Alert(BaseModel):
    __tablename__ = "alerts"
    
    account_id = Column(Integer, ForeignKey('accounts.id'), nullable=True)
    ticker_id = Column(Integer, ForeignKey('tickers.id'), nullable=True)
    type = Column(String(50), nullable=False)
    condition = Column(String(500), nullable=False)
    message = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True, nullable=True)
    triggered_at = Column(DateTime, nullable=True)
    
    # יחסים
    account = relationship("Account", back_populates="alerts")
    ticker = relationship("Ticker")
    
    def __repr__(self):
        return f"<Alert(id={self.id}, type='{self.type}', active={self.is_active})>"
