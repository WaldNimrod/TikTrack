from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from .base import BaseModel
from typing import Dict, Any, Optional

class CashFlow(BaseModel):
    __tablename__ = "cash_flows"
    
    trading_account_id = Column(Integer, ForeignKey('trading_accounts.id'), nullable=False)
    type = Column(String(50), nullable=False, default='deposit')  # ENUM: deposit, withdrawal, transfer, fee, dividend, interest
    amount = Column(Float, nullable=False)  # RANGE: amount != 0
    fee_amount = Column(Float, nullable=False, default=0)  # Fee in trading account base currency
    date = Column(Date, nullable=True)
    description = Column(String(5000), nullable=True)
    currency_id = Column(Integer, ForeignKey('currencies.id'), nullable=True, default=1)  # Default to USD
    usd_rate = Column(Numeric(10, 6), nullable=False, default=1.000000)  # RANGE: usd_rate > 0
    source = Column(String(20), nullable=True, default='manual')  # ENUM: manual, file_import, direct_import, api
    external_id = Column(String(100), nullable=True, default='0')
    trade_id = Column(Integer, ForeignKey('trades.id'), nullable=True)  # Optional link to trade
    
    # Relationships
    account = relationship("TradingAccount", back_populates="cash_flows")
    currency = relationship("Currency", back_populates="cash_flows")
    trade = relationship("Trade", foreign_keys=[trade_id])
    
    def __repr__(self) -> str:
        return f"<CashFlow(id={self.id}, type='{self.type}', amount={self.amount}, fee={self.fee_amount})>"
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        result: Dict[str, Any] = {}
        for c in self.__table__.columns:
            value = getattr(self, c.name)
            if hasattr(value, 'strftime'):  # If it's a date
                result[c.name] = value.strftime('%Y-%m-%d') if value else None
            else:
                result[c.name] = value
        
        # Use loaded relationships if available
        if hasattr(self, 'account') and self.account:
            result["account_name"] = self.account.name
        else:
            result["account_name"] = f'TradingAccount_{self.trading_account_id}' if self.trading_account_id else 'Unknown TradingAccount'
        
        if hasattr(self, 'currency') and self.currency:
            result["currency_symbol"] = self.currency.symbol
            result["currency_name"] = self.currency.name
        else:
            result["currency_symbol"] = 'USD'
            result["currency_name"] = 'US Dollar'
        
        # Include trade information if linked
        if hasattr(self, 'trade') and self.trade:
            result["trade_id"] = self.trade.id
            result["trade_ticker_id"] = self.trade.ticker_id
            if hasattr(self.trade, 'ticker') and self.trade.ticker:
                result["trade_ticker_symbol"] = self.trade.ticker.symbol
            result["trade_status"] = self.trade.status
            result["trade_side"] = self.trade.side
        elif self.trade_id:
            # Trade ID exists but relationship not loaded
            result["trade_id"] = self.trade_id
            
        return result

