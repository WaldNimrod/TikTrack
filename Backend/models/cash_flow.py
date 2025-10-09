from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from .base import BaseModel
from typing import Dict, Any, Optional

class CashFlow(BaseModel):
    __tablename__ = "cash_flows"
    
    trading_account_id = Column(Integer, ForeignKey('trading_accounts.id'), nullable=False)
    type = Column(String(50), nullable=False, default='deposit')  # ENUM: deposit, withdrawal, transfer, fee, dividend, interest
    amount = Column(Float, nullable=False)  # RANGE: amount != 0
    date = Column(Date, nullable=True)
    description = Column(String(500), nullable=True)
    currency_id = Column(Integer, ForeignKey('currencies.id'), nullable=True, default=1)  # Default to USD
    usd_rate = Column(Numeric(10, 6), nullable=False, default=1.000000)  # RANGE: usd_rate > 0
    source = Column(String(20), nullable=True, default='manual')  # ENUM: manual, file_import, direct_import, api
    external_id = Column(String(100), nullable=True, default='0')
    
    # Relationships
    account = relationship("TradingAccount", back_populates="cash_flows")
    currency = relationship("Currency", back_populates="cash_flows")
    
    def __repr__(self) -> str:
        return f"<CashFlow(id={self.id}, type='{self.type}', amount={self.amount})>"
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        result: Dict[str, Any] = {}
        for c in self.__table__.columns:
            value = getattr(self, c.name)
            if hasattr(value, 'strftime'):  # If it's a date
                result[c.name] = value.strftime('%Y-%m-%d') if value else None
            else:
                result[c.name] = value
        
        # Add related account information
        if hasattr(self, 'account') and self.account:
            result['account'] = {
                'id': self.account.id,
                'name': self.account.name,
                'type': self.account.type if hasattr(self.account, 'type') else None,
                'status': self.account.status if hasattr(self.account, 'status') else None,
                'balance': float(self.account.balance) if hasattr(self.account, 'balance') and self.account.balance is not None else None
            }
            result['account_name'] = self.account.name
        
        # Add currency information
        if hasattr(self, 'currency') and self.currency:
            result['currency_symbol'] = self.currency.symbol
            result['currency_name'] = self.currency.name
        
        return result

