# TikTrack Database Architecture

**Date:** January 1, 2026
**Version:** 2.0
**Database:** PostgreSQL
**ORM:** SQLAlchemy

---

## 📋 Overview

TikTrack uses PostgreSQL as the primary database with SQLAlchemy ORM. The database schema supports multi-user trading operations with comprehensive audit trails and business rule enforcement.

## 🏗️ Schema Design

### Core Entities

#### Users

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Trading Accounts

```sql
CREATE TABLE trading_accounts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    currency_id INTEGER REFERENCES currencies(id),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'closed', 'cancelled')),
    cash_balance DECIMAL(15,2) DEFAULT 0,
    opening_balance DECIMAL(15,2) DEFAULT 0.00,
    total_pl DECIMAL(15,2) DEFAULT 0,
    notes TEXT,
    external_account_number VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Tickers

```sql
CREATE TABLE tickers (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100),
    type VARCHAR(20) CHECK (type IN ('stock', 'crypto', 'forex', 'commodity')),
    exchange VARCHAR(50),
    currency VARCHAR(3) DEFAULT 'USD',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Trades

```sql
CREATE TABLE trades (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    ticker_id INTEGER REFERENCES tickers(id) ON DELETE CASCADE,
    trading_account_id INTEGER REFERENCES trading_accounts(id) ON DELETE CASCADE,
    side VARCHAR(4) CHECK (side IN ('long', 'short')),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    entry_price DECIMAL(10,2) NOT NULL CHECK (entry_price > 0),
    stop_loss DECIMAL(10,2),
    take_profit DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'closed', 'cancelled')),
    exit_price DECIMAL(10,2),
    exit_date TIMESTAMP,
    realized_pl DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Executions

```sql
CREATE TABLE executions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    ticker_id INTEGER REFERENCES tickers(id) ON DELETE CASCADE,
    trading_account_id INTEGER REFERENCES trading_accounts(id),
    trade_id INTEGER REFERENCES trades(id),
    action VARCHAR(20) NOT NULL CHECK (action IN ('buy', 'sell', 'short', 'cover')),
    date TIMESTAMP NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price DECIMAL(10,2) NOT NULL CHECK (price > 0),
    fee DECIMAL(8,2) DEFAULT 0 CHECK (fee >= 0),
    source VARCHAR(50) DEFAULT 'manual',
    external_id VARCHAR(100),
    notes TEXT,
    realized_pl DECIMAL(10,2),
    mtm_pl DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔗 Entity Relationships

### ER Diagram Overview

```
Users (1) ──── (N) Trading Accounts
    │
    ├── (N) Tickers (via user_tickers junction)
    ├── (N) Trades
    │       ├── (1) Trading Account
    │       └── (1) Ticker
    │       └── (N) Executions
    ├── (N) Executions
    ├── (N) Notes (with note_relation_types)
    ├── (N) Alerts
    └── (N) Watch Lists
        └── (N) Watch List Items
```

### Foreign Key Constraints

- **User Isolation:** All entities reference `users.id`
- **Data Integrity:** Cascading deletes for user-owned data
- **Optional References:** `executions.trading_account_id` allows unassigned executions
- **Polymorphic Relations:** `notes` uses `related_type` + `related_id` for flexible associations

## 🔒 Constraints & Validation

### Database-Level Constraints

#### Check Constraints

```sql
-- Positive values
CHECK (quantity > 0)
CHECK (price > 0)
CHECK (fee >= 0)

-- Enumerated values
CHECK (action IN ('buy', 'sell', 'short', 'cover'))
CHECK (side IN ('long', 'short'))
CHECK (status IN ('open', 'closed', 'cancelled'))
CHECK (type IN ('stock', 'crypto', 'forex', 'commodity'))
```

#### Unique Constraints

```sql
-- Prevent duplicate external references
UNIQUE (external_account_number) ON trading_accounts
UNIQUE (external_id) ON executions
UNIQUE (symbol) ON tickers
```

#### Foreign Key Constraints

```sql
-- Enforce referential integrity
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
FOREIGN KEY (ticker_id) REFERENCES tickers(id) ON DELETE CASCADE
FOREIGN KEY (trading_account_id) REFERENCES trading_accounts(id)
FOREIGN KEY (trade_id) REFERENCES trades(id)
```

### Business Rule Constraints

#### Trade-Execution Consistency

- Execution date must be >= trade open date
- Execution quantity cannot exceed trade quantity
- Buy/sell actions must match trade side

#### Account Balance Validation

- Cash balance cannot go negative (application-level)
- Opening balance must be >= 0

#### Ticker Validation

- Symbol format validation (application-level)
- Exchange-specific rules

## 📊 Indexing Strategy

### Primary Indexes

```sql
-- Automatic on PRIMARY KEY columns
CREATE UNIQUE INDEX idx_users_id ON users(id);
CREATE UNIQUE INDEX idx_trades_id ON trades(id);
-- ... etc for all tables
```

### Performance Indexes

```sql
-- User-scoped queries
CREATE INDEX idx_trades_user_date ON trades(user_id, created_at DESC);
CREATE INDEX idx_executions_user_date ON executions(user_id, date DESC);
CREATE INDEX idx_trading_accounts_user ON trading_accounts(user_id);

-- Foreign key lookups
CREATE INDEX idx_executions_trade_id ON executions(trade_id);
CREATE INDEX idx_executions_ticker_id ON executions(ticker_id);
CREATE INDEX idx_trades_ticker_id ON trades(ticker_id);

-- Status-based queries
CREATE INDEX idx_trades_status ON trades(status);
CREATE INDEX idx_executions_action ON executions(action);
```

### Composite Indexes

```sql
-- Complex filtering queries
CREATE INDEX idx_portfolio_user_account_ticker
ON executions(user_id, trading_account_id, ticker_id, date DESC);
```

## 🔄 Migration Strategy

### Schema Evolution

- **Version Control:** All schema changes tracked in migration files
- **Backward Compatibility:** Graceful handling of old data formats
- **Rollback Support:** Ability to revert schema changes

### Migration Examples

```python
# Add new column with default
def upgrade():
    op.add_column('trades', sa.Column('risk_percentage', sa.Float(), default=0.0))

# Data migration for existing records
def upgrade():
    op.execute("""
        UPDATE trades
        SET risk_percentage = 2.0
        WHERE risk_percentage IS NULL
    """)
```

## 📈 Performance Optimization

### Query Optimization

- **Eager Loading:** Use `joinedload` for related entities
- **Selective Fields:** Only fetch required columns
- **Pagination:** Limit result sets with offset/limit

### Connection Pooling

- **Pool Size:** 10 connections (configurable)
- **Timeout:** 30 seconds
- **Retry Logic:** Automatic reconnection on failure

### Caching Layers

- **Application Cache:** Frequently accessed data
- **Query Result Cache:** Expensive query results
- **Session Cache:** User-specific data

## 🧪 Testing & Validation

### Schema Validation

```bash
# Validate schema integrity
python -c "
from Backend.models import *
from Backend.config.database import engine
from sqlalchemy import inspect

inspector = inspect(engine)
for table_name in inspector.get_table_names():
    print(f'{table_name}: {len(inspector.get_columns(table_name))} columns')
"
```

### Constraint Testing

```sql
-- Test foreign key constraints
INSERT INTO executions (user_id, ticker_id, action, date, quantity, price)
VALUES (999, 1, 'buy', NOW(), 100, 150.50);
-- Should fail: foreign key violation

-- Test check constraints
INSERT INTO executions (user_id, ticker_id, action, date, quantity, price)
VALUES (1, 1, 'invalid_action', NOW(), 100, 150.50);
-- Should fail: check constraint violation
```

## 📚 Related Documentation

- **[Database Models](../DATABASE_MODELS.md)** - SQLAlchemy model definitions
- **[DB Constraints Implementation](../DB_CONSTRAINTS_IMPLEMENTATION.md)** - Detailed constraint documentation
- **[API Architecture](../API_ARCHITECTURE.md)** - How the API interacts with the database
- **[Migration Guide](../../03-DEVELOPMENT/DB_MIGRATIONS/ALERTS_MIGRATION.md)** - Schema migration examples

---

**Last Updated:** January 1, 2026
**Tables:** 25+ core entities
**Constraints:** 50+ validation rules
**Indexes:** 30+ performance optimizations
