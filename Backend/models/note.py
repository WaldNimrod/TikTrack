from sqlalchemy import Column, Integer, String, ForeignKey
from .base import BaseModel

class Note(BaseModel):
    __tablename__ = "notes"
    
    account_id = Column(Integer, ForeignKey('accounts.id'), nullable=True)
    trade_id = Column(Integer, ForeignKey('trades.id'), nullable=True)
    trade_plan_id = Column(Integer, ForeignKey('trade_plans.id'), nullable=True)
    content = Column(String(1000), nullable=False)
    attachment = Column(String(500), nullable=True)  # path to file
    
    def __repr__(self):
        related_type = 'account' if self.account_id else 'trade' if self.trade_id else 'trade_plan' if self.trade_plan_id else 'none'
        related_id = self.account_id or self.trade_id or self.trade_plan_id
        return f"<Note(id={self.id}, related_type='{related_type}', related_id={related_id}, content='{self.content[:50]}...')>"
    
    def to_dict(self):
        """המרה למילון עם תאימות לאחור"""
        result = super().to_dict()
        
        # קביעת related_type ו-related_id לפי השדות הקיימים
        if self.account_id:
            result['related_type'] = 'account'
            result['related_id'] = self.account_id
        elif self.trade_id:
            result['related_type'] = 'trade'
            result['related_id'] = self.trade_id
        elif self.trade_plan_id:
            result['related_type'] = 'trade_plan'
            result['related_id'] = self.trade_plan_id
        else:
            result['related_type'] = None
            result['related_id'] = None
        
        return result
