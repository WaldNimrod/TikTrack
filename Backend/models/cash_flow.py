from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from .base import BaseModel
from typing import Dict, Any, Optional

class CashFlow(BaseModel):
    __tablename__ = "cash_flows"
    
    account_id = Column(Integer, ForeignKey('accounts.id'), nullable=False)
    type = Column(String(50), nullable=False)  # deposit, withdrawal, dividend, etc.
    amount = Column(Float, nullable=False)
    date = Column(Date, nullable=True)
    description = Column(String(500), nullable=True)
    currency_id = Column(Integer, ForeignKey('currencies.id'), nullable=True)
    usd_rate = Column(Numeric(10, 6), nullable=True, default=1.000000)
    source = Column(String(20), nullable=True, default='manual')  # manual, file_import, direct_import
    external_id = Column(String(100), nullable=True, default='0')
    
    # יחסים
    account = relationship("Account", back_populates="cash_flows")
    currency = relationship("Currency", back_populates="cash_flows")
    
    def __repr__(self) -> str:
        return f"<CashFlow(id={self.id}, type='{self.type}', amount={self.amount})>"
    
    def to_dict(self) -> Dict[str, Any]:
        """המרה למילון"""
        result: Dict[str, Any] = {}
        for c in self.__table__.columns:
            value = getattr(self, c.name)
            if hasattr(value, 'strftime'):  # אם זה תאריך
                result[c.name] = value.strftime('%Y-%m-%d') if value else None
            else:
                result[c.name] = value
        return result

