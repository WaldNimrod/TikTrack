# TikTrack Database Models

**Date:** January 1, 2026
**Version:** 2.0
**ORM:** SQLAlchemy 2.0
**Location:** `Backend/models/`

---

## 📋 Overview

TikTrack uses SQLAlchemy ORM to define database models with comprehensive relationships, constraints, and business logic integration.

## 🏗️ Base Model Architecture

### BaseModel Class

```python
# Backend/models/base_model.py
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, DateTime, func

Base = declarative_base()

class BaseModel(Base):
    __abstract__ = True

    id = Column(Integer, primary_key=True, autoincrement=True)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    def to_dict(self):
        """Convert model instance to dictionary"""
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

    @classmethod
    def from_dict(cls, data):
        """Create model instance from dictionary"""
        return cls(**data)
```

## 👤 User Model

```python
# Backend/models/user.py
from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from .base_model import BaseModel

class User(BaseModel):
    __tablename__ = 'users'

    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    last_login = Column(DateTime)

    # Relationships
    trades = relationship("Trade", back_populates="user", cascade="all, delete-orphan")
    executions = relationship("Execution", back_populates="user", cascade="all, delete-orphan")
    trading_accounts = relationship("TradingAccount", back_populates="user", cascade="all, delete-orphan")
    notes = relationship("Note", back_populates="user", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}')>"
```

## 💼 Trading Account Model

```python
# Backend/models/trading_account.py
from sqlalchemy import Column, String, Integer, Float, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from .base_model import BaseModel

class TradingAccount(BaseModel):
    __tablename__ = 'trading_accounts'

    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    name = Column(String(100), nullable=False)
    currency_id = Column(Integer, ForeignKey('currencies.id'), nullable=False)
    status = Column(String(20), default='open', nullable=False)
    cash_balance = Column(Float, default=0.0)
    opening_balance = Column(Float, default=0.0, nullable=False)
    total_pl = Column(Float, default=0.0)
    notes = Column(String(5000))
    external_account_number = Column(String(100), unique=True)

    # Constraints
    __table_args__ = (
        CheckConstraint("status IN ('open', 'closed', 'cancelled')", name='check_status'),
        CheckConstraint('opening_balance >= 0', name='check_opening_balance'),
    )

    # Relationships
    user = relationship("User", back_populates="trading_accounts")
    currency = relationship("Currency", back_populates="trading_accounts")
    trades = relationship("Trade", back_populates="trading_account")
    executions = relationship("Execution", back_populates="trading_account")

    def __repr__(self):
        return f"<TradingAccount(id={self.id}, name='{self.name}', status='{self.status}')>"
```

## 📈 Trade Model

```python
# Backend/models/trade.py
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from .base_model import BaseModel

class Trade(BaseModel):
    __tablename__ = 'trades'

    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    ticker_id = Column(Integer, ForeignKey('tickers.id'), nullable=False)
    trading_account_id = Column(Integer, ForeignKey('trading_accounts.id'), nullable=False)
    side = Column(String(4), nullable=False)
    quantity = Column(Integer, nullable=False)
    entry_price = Column(Float, nullable=False)
    stop_loss = Column(Float)
    take_profit = Column(Float)
    status = Column(String(20), default='open', nullable=False)
    exit_price = Column(Float)
    exit_date = Column(DateTime)
    realized_pl = Column(Float)
    notes = Column(String(5000))

    # Constraints
    __table_args__ = (
        CheckConstraint("side IN ('long', 'short')", name='check_side'),
        CheckConstraint("status IN ('open', 'closed', 'cancelled')", name='check_trade_status'),
        CheckConstraint('quantity > 0', name='check_quantity_positive'),
        CheckConstraint('entry_price > 0', name='check_entry_price_positive'),
    )

    # Relationships
    user = relationship("User", back_populates="trades")
    ticker = relationship("Ticker", back_populates="trades")
    trading_account = relationship("TradingAccount", back_populates="trades")
    executions = relationship("Execution", back_populates="trade")

    def __repr__(self):
        return f"<Trade(id={self.id}, ticker='{self.ticker.symbol}', side='{self.side}', status='{self.status}')>"
```

## ⚡ Execution Model

```python
# Backend/models/execution.py
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from .base_model import BaseModel

class Execution(BaseModel):
    __tablename__ = 'executions'

    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    ticker_id = Column(Integer, ForeignKey('tickers.id'), nullable=False)
    trading_account_id = Column(Integer, ForeignKey('trading_accounts.id'))  # Optional
    trade_id = Column(Integer, ForeignKey('trades.id'))  # Optional
    action = Column(String(20), nullable=False)
    date = Column(DateTime, nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)
    fee = Column(Float, default=0.0)
    source = Column(String(50), default='manual')
    external_id = Column(String(100))
    notes = Column(String(5000))
    realized_pl = Column(Float)
    mtm_pl = Column(Float)

    # Constraints
    __table_args__ = (
        CheckConstraint("action IN ('buy', 'sell', 'short', 'cover')", name='check_action'),
        CheckConstraint('quantity > 0', name='check_execution_quantity_positive'),
        CheckConstraint('price > 0', name='check_execution_price_positive'),
        CheckConstraint('fee >= 0', name='check_fee_non_negative'),
    )

    # Relationships
    user = relationship("User", back_populates="executions")
    ticker = relationship("Ticker", back_populates="executions")
    trading_account = relationship("TradingAccount", back_populates="executions")
    trade = relationship("Trade", back_populates="executions")

    def __repr__(self):
        return f"<Execution(id={self.id}, action='{self.action}', quantity={self.quantity}, price={self.price})>"
```

## 🏷️ Ticker Model

```python
# Backend/models/ticker.py
from sqlalchemy import Column, String, Boolean
from sqlalchemy.orm import relationship
from .base_model import BaseModel

class Ticker(BaseModel):
    __tablename__ = 'tickers'

    symbol = Column(String(20), unique=True, nullable=False)
    name = Column(String(100))
    type = Column(String(20), default='stock')
    exchange = Column(String(50))
    currency = Column(String(3), default='USD')
    is_active = Column(Boolean, default=True)

    # Constraints
    __table_args__ = (
        CheckConstraint("type IN ('stock', 'crypto', 'forex', 'commodity')", name='check_ticker_type'),
    )

    # Relationships
    trades = relationship("Trade", back_populates="ticker")
    executions = relationship("Execution", back_populates="ticker")
    user_tickers = relationship("UserTicker", back_populates="ticker")

    def __repr__(self):
        return f"<Ticker(id={self.id}, symbol='{self.symbol}', type='{self.type}')>"
```

## 📝 Note Model

```python
# Backend/models/note.py
from sqlalchemy import Column, String, Integer, Text
from sqlalchemy.orm import relationship
from .base_model import BaseModel

class Note(BaseModel):
    __tablename__ = 'notes'

    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    title = Column(String(200), nullable=False)
    content = Column(Text)
    related_id = Column(Integer)  # Polymorphic reference
    related_type = Column(String(50))  # 'trade', 'execution', 'ticker', etc.

    # Relationships
    user = relationship("User", back_populates="notes")

    def __repr__(self):
        return f"<Note(id={self.id}, title='{self.title}', related_type='{self.related_type}')>"
```

## 🚨 Alert Model

```python
# Backend/models/alert.py
from sqlalchemy import Column, String, Integer, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from .base_model import BaseModel

class Alert(BaseModel):
    __tablename__ = 'alerts'

    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    name = Column(String(100), nullable=False)
    condition_type = Column(String(50), nullable=False)
    condition_value = Column(Float)
    ticker_id = Column(Integer, ForeignKey('tickers.id'))
    is_active = Column(Boolean, default=True)
    last_triggered = Column(DateTime)
    message = Column(String(500))

    # Relationships
    user = relationship("User", back_populates="alerts")
    ticker = relationship("Ticker", back_populates="alerts")

    def __repr__(self):
        return f"<Alert(id={self.id}, name='{self.name}', condition_type='{self.condition_type}')>"
```

## 🔗 Model Relationships

### One-to-Many Relationships

- **User → Trading Accounts:** One user can have multiple accounts
- **User → Trades:** One user can have multiple trades
- **User → Executions:** One user can have multiple executions
- **Trading Account → Trades:** One account can have multiple trades
- **Trading Account → Executions:** One account can have multiple executions
- **Trade → Executions:** One trade can have multiple executions

### Many-to-One Relationships

- **Trade → User:** Each trade belongs to one user
- **Trade → Ticker:** Each trade is for one ticker
- **Trade → Trading Account:** Each trade belongs to one account
- **Execution → Trade:** Each execution can belong to one trade (optional)

### Polymorphic Relationships

- **Notes:** Can reference any entity type via `related_type` + `related_id`
- **Alerts:** Can reference tickers or be global

## 🔧 Model Methods

### Common Patterns

```python
# All models inherit from BaseModel
class ExampleModel(BaseModel):
    # Auto-generated: id, created_at, updated_at

    def to_dict(self):
        """Convert to dictionary for API responses"""
        return super().to_dict()

    @classmethod
    def create_from_dict(cls, data, db_session):
        """Create instance from dictionary"""
        instance = cls.from_dict(data)
        db_session.add(instance)
        db_session.commit()
        return instance

    def update_from_dict(self, data, db_session):
        """Update instance from dictionary"""
        for key, value in data.items():
            if hasattr(self, key):
                setattr(self, key, value)
        self.updated_at = datetime.utcnow()
        db_session.commit()
```

### Business Logic Integration

```python
class Trade(BaseModel):
    # ... columns ...

    def calculate_realized_pl(self):
        """Calculate P&L from executions"""
        # Business logic for P&L calculation
        pass

    def validate_exit_conditions(self):
        """Validate stop loss and take profit"""
        # Business rule validation
        pass
```

## 🧪 Model Testing

### Unit Tests

```python
def test_trade_model_constraints():
    # Test quantity must be positive
    with pytest.raises(IntegrityError):
        Trade(quantity=-1, entry_price=100.0)

    # Test valid trade creation
    trade = Trade(
        user_id=1,
        ticker_id=1,
        trading_account_id=1,
        side='long',
        quantity=100,
        entry_price=150.50
    )
    assert trade.quantity > 0
    assert trade.entry_price > 0
```

### Integration Tests

```python
def test_relationships(db_session):
    # Create user with account and trade
    user = User(username='test', email='test@example.com')
    account = TradingAccount(name='Test Account', user=user)
    trade = Trade(ticker_id=1, side='long', quantity=100, user=user, trading_account=account)

    db_session.add_all([user, account, trade])
    db_session.commit()

    # Verify relationships
    assert len(user.trading_accounts) == 1
    assert len(user.trades) == 1
    assert trade.trading_account == account
```

## 📚 Related Documentation

- **[Database Architecture](../DATABASE_ARCHITECTURE.md)** - Schema overview and relationships
- **[DB Constraints Implementation](../DB_CONSTRAINTS_IMPLEMENTATION.md)** - Detailed validation rules
- **[API Architecture](../API_ARCHITECTURE.md)** - How models are used in API
- **[Business Logic Layer](../BUSINESS_LOGIC_LAYER.md)** - Model business logic integration

---

**Last Updated:** January 1, 2026
**Models:** 15+ core entities
**Relationships:** 25+ foreign key associations
**Constraints:** 40+ validation rules
