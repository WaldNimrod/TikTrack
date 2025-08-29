from sqlalchemy import Column, Integer, String, Numeric
from sqlalchemy.orm import relationship
from .base import BaseModel
from typing import Dict, Any, Optional

class Currency(BaseModel):
    __tablename__ = "currencies"
    
    symbol = Column(String(10), nullable=False, unique=True)
    name = Column(String(100), nullable=False)
    usd_rate = Column(Numeric(10, 6), nullable=False, default=1.000000)
    
    # Relationships
    cash_flows = relationship("CashFlow", back_populates="currency")
    tickers = relationship("Ticker", back_populates="currency")
    # Removed accounts relationship - Account model uses currency as string field
    
    def __repr__(self) -> str:
        return f"<Currency(symbol='{self.symbol}', name='{self.name}', usd_rate={self.usd_rate})>"
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        result: Dict[str, Any] = {}
        for c in self.__table__.columns:
            value = getattr(self, c.name)
            if hasattr(value, 'strftime'):  # If it's a date
                result[c.name] = value.strftime('%Y-%m-%d %H:%M:%S') if value else None
            else:
                result[c.name] = value
        return result
    
    def is_base_record(self) -> bool:
        """Check if this is the base currency record (ID=1)"""
        return self.id == 1
    
    def can_be_modified(self) -> bool:
        """Check if this record can be modified (not base record)"""
        return not self.is_base_record()
    
    def can_be_deleted(self) -> bool:
        """Check if this record can be deleted (not base record)"""
        return not self.is_base_record()
