# TikTrack Database Models

## 📋 Overview

This document describes the SQLAlchemy model definitions for the TikTrack Trading Management System. The models define the database schema and relationships between different entities.

## 🏗️ Model Architecture

### **Base Model**
All models inherit from a base class that provides common functionality:
- **ID Field**: Primary key with auto-increment
- **Timestamps**: Created and updated timestamps
- **Soft Delete**: Optional soft delete functionality

## 📊 Core Models

### **1. Account Model**
```python
class Account(Base):
    __tablename__ = 'accounts'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    account_type = Column(String(50), nullable=False)
    currency_id = Column(Integer, ForeignKey('currencies.id'), nullable=False)
    balance = Column(Decimal(15, 2), default=0.00)
    status = Column(String(20), default='active')
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    currency = relationship('Currency', back_populates='accounts')
    trades = relationship('Trade', back_populates='account')
    cash_flows = relationship('CashFlow', back_populates='account')
```

### **2. Trade Model**
```python
class Trade(Base):
    __tablename__ = 'trades'
    
    id = Column(Integer, primary_key=True)
    account_id = Column(Integer, ForeignKey('accounts.id'), nullable=False)
    ticker_id = Column(Integer, ForeignKey('tickers.id'), nullable=False)
    trade_type = Column(String(10), nullable=False)  # 'buy' or 'sell'
    quantity = Column(Integer, nullable=False)
    price = Column(Decimal(10, 4), nullable=False)
    total_amount = Column(Decimal(15, 2), nullable=False)
    trade_date = Column(DateTime, nullable=False)
    status = Column(String(20), default='open')
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    account = relationship('Account', back_populates='trades')
    ticker = relationship('Ticker', back_populates='trades')
```

### **3. Ticker Model**
```python
class Ticker(Base):
    __tablename__ = 'tickers'
    
    id = Column(Integer, primary_key=True)
    symbol = Column(String(20), unique=True, nullable=False)
    name = Column(String(100), nullable=False)
    exchange = Column(String(50))
    sector = Column(String(100))
    open_plans = Column(Boolean, default=False)
    status = Column(String(20), default='active')
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    trades = relationship('Trade', back_populates='ticker')
    alerts = relationship('Alert', back_populates='ticker')
```

### **4. Alert Model**
```python
class Alert(Base):
    __tablename__ = 'alerts'
    
    id = Column(Integer, primary_key=True)
    ticker_id = Column(Integer, ForeignKey('tickers.id'), nullable=False)
    alert_type = Column(String(20), nullable=False)  # 'price', 'condition'
    condition_type = Column(String(20))  # 'above', 'below', 'equals'
    target_value = Column(Decimal(10, 4))
    status = Column(String(20), default='active')
    triggered_at = Column(DateTime)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    ticker = relationship('Ticker', back_populates='alerts')
```

### **5. CashFlow Model**
```python
class CashFlow(Base):
    __tablename__ = 'cash_flows'
    
    id = Column(Integer, primary_key=True)
    trading_account_id = Column(Integer, ForeignKey('trading_accounts.id'), nullable=False)
    type = Column(String(50), nullable=False)  # deposit, withdrawal, other_positive/negative, fee, dividend, interest
    amount = Column(Float, nullable=False)
    fee_amount = Column(Float, nullable=False, default=0)  # Stored in the trading account base currency
    date = Column(Date, nullable=True)
    description = Column(String(5000))
    currency_id = Column(Integer, ForeignKey('currencies.id'), default=1)
    usd_rate = Column(Numeric(10, 6), nullable=False, default=1.000000)
    source = Column(String(20), default='manual')
    external_id = Column(String(100), default='0')
    trade_id = Column(Integer, ForeignKey('trades.id'), nullable=True)  # Optional link to trade
    created_at = Column(DateTime, default=datetime.utcnow)
    
    account = relationship('TradingAccount', back_populates='cash_flows')
    currency = relationship('Currency', back_populates='cash_flows')
    trade = relationship('Trade', foreign_keys=[trade_id])
```

> **New (Nov 2025):** `fee_amount` ensures every cash flow stores the fee amount in the account's base currency. The column is mandatory with default `0` and validated via range constraint (`fee_amount ≥ 0`).

> **New (Feb 2025):** `trade_id` enables optional linking of cash flows to trades. When set, the trade must belong to the same `trading_account_id` as the cash flow (validated via `CASH_FLOW_TRADE_TICKER_MATCH` constraint). This allows tracking cash flows associated with specific trading positions.

### **6. Currency Model**
```python
class Currency(Base):
    __tablename__ = 'currencies'
    
    id = Column(Integer, primary_key=True)
    code = Column(String(3), unique=True, nullable=False)  # USD, EUR, etc.
    name = Column(String(50), nullable=False)
    symbol = Column(String(5))
    exchange_rate = Column(Decimal(10, 6), default=1.000000)
    is_base = Column(Boolean, default=False)
    status = Column(String(20), default='active')
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    accounts = relationship('Account', back_populates='currency')
```

## 🔗 Model Relationships

### **One-to-Many Relationships**
- **Account → Trades**: One account can have many trades
- **Account → CashFlows**: One account can have many cash flows
- **Ticker → Trades**: One ticker can have many trades
- **Ticker → Alerts**: One ticker can have many alerts
- **Currency → Accounts**: One currency can be used by many accounts

### **Foreign Key Constraints**
```python
# Example constraint definition
ForeignKey('accounts.id', ondelete='CASCADE')
ForeignKey('tickers.id', ondelete='RESTRICT')
ForeignKey('currencies.id', ondelete='RESTRICT')
```

## 📝 Model Methods

### **Common Methods**
```python
class BaseModel:
    def to_dict(self):
        """Convert model to dictionary"""
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}
    
    def update(self, **kwargs):
        """Update model attributes"""
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)
        self.updated_at = datetime.utcnow()
```

### **Custom Methods**
```python
class Trade(Base):
    # ... existing fields ...
    
    def calculate_total(self):
        """Calculate total trade amount"""
        return self.quantity * self.price
    
    def is_open(self):
        """Check if trade is open"""
        return self.status == 'open'
    
    def close_trade(self, close_price):
        """Close the trade"""
        self.status = 'closed'
        self.close_price = close_price
        self.close_date = datetime.utcnow()
```

## 🔒 Model Validation

### **Field Validation**
```python
from sqlalchemy.orm import validates

class Trade(Base):
    # ... existing fields ...
    
    @validates('quantity')
    def validate_quantity(self, key, value):
        if value <= 0:
            raise ValueError('Quantity must be positive')
        return value
    
    @validates('price')
    def validate_price(self, key, value):
        if value <= 0:
            raise ValueError('Price must be positive')
        return value
```

### **Business Logic Validation**
```python
class Alert(Base):
    # ... existing fields ...
    
    @validates('target_value')
    def validate_target_value(self, key, value):
        if self.alert_type == 'price' and value <= 0:
            raise ValueError('Target price must be positive')
        return value
```

## 📊 Database Indexes

### **Performance Indexes**
```python
class Trade(Base):
    __tablename__ = 'trades'
    
    # ... existing fields ...
    
    __table_args__ = (
        Index('idx_trades_account_date', 'account_id', 'trade_date'),
        Index('idx_trades_ticker_date', 'ticker_id', 'trade_date'),
        Index('idx_trades_status', 'status'),
    )
```

### **Unique Constraints**
```python
class Ticker(Base):
    __tablename__ = 'tickers'
    
    # ... existing fields ...
    
    __table_args__ = (
        UniqueConstraint('symbol', 'exchange', name='uq_ticker_symbol_exchange'),
    )
```

## 🔧 Model Configuration

### **Table Configuration**
```python
class BaseModel:
    __abstract__ = True
    
    id = Column(Integer, primary_key=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

### **Session Configuration**
```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

engine = create_engine('sqlite:///tiktrack.db')
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
```

## 🔗 Related Documentation

- **[Database Schema](README.md)** - Complete database structure
- **[Relationships](RELATIONSHIPS.md)** - Entity relationships and foreign keys
- **[Constraints](CONSTRAINTS.md)** - Database constraints and validation
- **[Migrations](MIGRATIONS.md)** - Database migration procedures

---

**Last Updated**: August 29, 2025  
**Version**: 2.0  
**Maintainer**: TikTrack Development Team
