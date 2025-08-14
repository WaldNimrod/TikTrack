from sqlalchemy import Column, String, Boolean
from .base import BaseModel

class Ticker(BaseModel):
    __tablename__ = "tickers"
    
    symbol = Column(String(10), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=True)
    type = Column(String(20), nullable=True)
    remarks = Column(String(500), nullable=True)
    currency = Column(String(3), default='USD', nullable=True)
    active_trades = Column(Boolean, default=False, nullable=True)
    
    def __repr__(self):
        return f"<Ticker(symbol='{self.symbol}', name='{self.name}')>"
