from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from .base import BaseModel

class Note(BaseModel):
    __tablename__ = "notes"
    
    account_id = Column(Integer, ForeignKey('accounts.id'), nullable=True)
    trade_id = Column(Integer, ForeignKey('trades.id'), nullable=True)
    trade_plan_id = Column(Integer, ForeignKey('trade_plans.id'), nullable=True)
    content = Column(String(1000), nullable=False)
    attachment = Column(String(500), nullable=True)  # path to file
    
    # יחסים
    account = relationship("Account", back_populates="notes_rel")
    trade = relationship("Trade", back_populates="notes_rel")
    trade_plan = relationship("TradePlan", back_populates="notes")
    
    def __repr__(self):
        return f"<Note(id={self.id}, content='{self.content[:50]}...')>"
