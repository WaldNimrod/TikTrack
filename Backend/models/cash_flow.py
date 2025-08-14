from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.orm import relationship
from .base import BaseModel

class CashFlow(BaseModel):
    __tablename__ = "cash_flows"
    
    account_id = Column(Integer, ForeignKey('accounts.id'), nullable=False)
    type = Column(String(50), nullable=False)  # deposit, withdrawal, dividend, etc.
    amount = Column(Float, nullable=False)
    date = Column(Date, nullable=True)
    description = Column(String(500), nullable=True)
    
    # יחסים
    account = relationship("Account", back_populates="cash_flows")
    
    def __repr__(self):
        return f"<CashFlow(id={self.id}, type='{self.type}', amount={self.amount})>"

