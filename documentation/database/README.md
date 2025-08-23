# TikTrack Database Documentation

## Overview
The TikTrack database is built on SQLite with SQLAlchemy ORM, providing a robust foundation for trading management operations. The database includes dynamic constraint management capabilities and comprehensive data integrity features.

## Database File
- **Location**: `Backend/db/simpleTrade_new.db`
- **Type**: SQLite 3
- **Size**: ~151KB (as of August 2025)
- **WAL Mode**: Enabled for better concurrency

## Core Tables

### 1. Trades Table
```sql
CREATE TABLE trades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER NOT NULL,
    ticker TEXT NOT NULL,
    investment_type TEXT DEFAULT 'swing',
    status TEXT DEFAULT 'open',
    entry_price DECIMAL(10,2),
    current_price DECIMAL(10,2),
    exit_price DECIMAL(10,2),
    quantity INTEGER,
    entry_date TIMESTAMP,
    exit_date TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(id)
);
```

### 2. Accounts Table
```sql
CREATE TABLE accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    currency TEXT DEFAULT 'USD',
    balance DECIMAL(15,2) DEFAULT 0.00,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Alerts Table
```sql
CREATE TABLE alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticker TEXT NOT NULL,
    price DECIMAL(10,2),
    condition TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    related_type_id TEXT,
    related_id INTEGER,
    is_triggered BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Trade Plans Table
```sql
CREATE TABLE trade_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER NOT NULL,
    ticker TEXT NOT NULL,
    investment_type TEXT DEFAULT 'swing',
    entry_price DECIMAL(10,2),
    target_price DECIMAL(10,2),
    stop_loss DECIMAL(10,2),
    quantity INTEGER,
    status TEXT DEFAULT 'open',
    entry_conditions TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(id)
);
```

### 5. Notes Table
```sql
CREATE TABLE notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_type TEXT NOT NULL,
    entity_id INTEGER NOT NULL,
    title TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Dynamic Constraint Management System

### 6. Constraints Table
```sql
CREATE TABLE constraints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name TEXT NOT NULL,
    column_name TEXT NOT NULL,
    constraint_type TEXT NOT NULL CHECK (constraint_type IN ('CHECK', 'NOT NULL', 'UNIQUE', 'FOREIGN KEY', 'ENUM')),
    constraint_name TEXT NOT NULL,
    constraint_definition TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 7. Enum Values Table
```sql
CREATE TABLE enum_values (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    constraint_id INTEGER NOT NULL,
    value TEXT NOT NULL,
    display_name TEXT NOT NULL,
    sort_order INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT 1,
    FOREIGN KEY (constraint_id) REFERENCES constraints(id) ON DELETE CASCADE
);
```

### 8. Constraint Validations Table
```sql
CREATE TABLE constraint_validations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    constraint_id INTEGER NOT NULL,
    table_name TEXT NOT NULL,
    column_name TEXT NOT NULL,
    validation_result TEXT NOT NULL,
    invalid_records_count INTEGER DEFAULT 0,
    validation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (constraint_id) REFERENCES constraints(id) ON DELETE CASCADE
);
```

## Indexes

### Performance Indexes
```sql
-- Trades table indexes
CREATE INDEX idx_trades_account_id ON trades(account_id);
CREATE INDEX idx_trades_status ON trades(status);
CREATE INDEX idx_trades_investment_type ON trades(investment_type);
CREATE INDEX idx_trades_entry_date ON trades(entry_date);

-- Alerts table indexes
CREATE INDEX idx_alerts_ticker ON alerts(ticker);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alerts_related ON alerts(related_type_id, related_id);

-- Constraints table indexes
CREATE INDEX idx_constraints_table_column ON constraints(table_name, column_name);
CREATE INDEX idx_constraints_type ON constraints(constraint_type);
CREATE INDEX idx_constraints_active ON constraints(is_active);

-- Enum values table indexes
CREATE INDEX idx_enum_values_constraint ON enum_values(constraint_id);
CREATE INDEX idx_enum_values_active ON enum_values(is_active);
```

## Relationships

### Foreign Key Relationships
1. **trades.account_id** → **accounts.id**
2. **trade_plans.account_id** → **accounts.id**
3. **enum_values.constraint_id** → **constraints.id**
4. **constraint_validations.constraint_id** → **constraints.id**

### Entity Relationships
- **Alerts** can be linked to any entity via `related_type_id` and `related_id`
- **Notes** can be linked to any entity via `entity_type` and `entity_id`
- **Constraints** define validation rules for table columns

## Data Types and Constraints

### Standard Data Types
- **INTEGER**: IDs, quantities, counts
- **TEXT**: Names, descriptions, status values
- **DECIMAL(10,2)**: Prices, balances, amounts
- **TIMESTAMP**: Dates and times
- **BOOLEAN**: True/false flags

### Constraint Types
1. **CHECK**: Custom validation rules
2. **NOT NULL**: Required field validation
3. **UNIQUE**: Unique value enforcement
4. **FOREIGN KEY**: Referential integrity
5. **ENUM**: Predefined value lists

## Migration System

### Migration Files
- `create_constraints_tables.py` - Creates constraint management tables
- `insert_basic_constraints.py` - Inserts initial constraints
- `remove_old_constraints.py` - Removes hardcoded constraints
- `update_trades_investment_type.py` - Renames type column

### Running Migrations
```bash
cd Backend
python3 migrations/migration_name.py
```

## Backup Strategy

### Manual Backups
```bash
cp Backend/db/simpleTrade_new.db Backend/db/simpleTrade_new_backup_$(date +%Y%m%d_%H%M%S).db
```

### Backup Files
- Backup files are stored in `Backend/db/`
- Naming convention: `simpleTrade_new_backup_YYYYMMDD_HHMMSS.db`
- Backups are excluded from git via .gitignore

### Restore Process
1. Stop the application server
2. Copy backup file to `simpleTrade_new.db`
3. Restart the application server

## Performance Optimization

### Query Optimization
- Use appropriate indexes for frequently queried columns
- Implement pagination for large result sets
- Use LIMIT clauses to restrict result sizes
- Optimize JOIN operations

### Database Maintenance
- Regular VACUUM operations
- Analyze table statistics
- Monitor query performance
- Clean up old validation records

## Security Considerations

### Data Protection
- Input validation at application level
- Parameterized queries to prevent SQL injection
- Access control through application logic
- Regular security audits

### Backup Security
- Encrypt sensitive backup files
- Store backups in secure locations
- Implement backup rotation policies
- Test restore procedures regularly

## Monitoring and Maintenance

### Health Checks
- Database connectivity
- Constraint validation status
- Performance metrics
- Error rate monitoring

### Maintenance Tasks
- Regular constraint validation
- Cleanup of old validation records
- Performance optimization
- Security updates

## Development Guidelines

### Adding New Tables
1. Create migration script
2. Define table schema
3. Add appropriate indexes
4. Update documentation
5. Test thoroughly

### Modifying Existing Tables
1. Create migration script
2. Backup existing data
3. Apply changes
4. Validate data integrity
5. Update documentation

### Constraint Management
1. Use dynamic constraint system
2. Define constraints through UI
3. Validate constraints regularly
4. Monitor constraint violations

---

**Last Updated**: August 23, 2025  
**Database Version**: 2.0.0  
**Author**: TikTrack Development Team
