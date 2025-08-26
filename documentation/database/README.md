# TikTrack Database Documentation

## Overview
The TikTrack system uses SQLite as its primary database with SQLAlchemy ORM for data management. The database includes dynamic constraint management, foreign key relationships, and comprehensive data validation.

## Database Architecture

### Core Tables

#### 1. Accounts
- **Purpose**: Trading account management
- **Key Fields**: id, name, status, currency_id, balance
- **Relationships**: Linked to cash_flows, trades, alerts
- **Constraints**: NOT NULL, FOREIGN KEY (currencies)

#### 2. Cash Flows ✅ **RECENTLY ENHANCED**
- **Purpose**: Cash flow tracking and management
- **Key Fields**: id, account_id, type, amount, date, description, source, currency_id
- **Relationships**: Linked to accounts, currencies
- **Constraints**: 
  - NOT NULL constraints on required fields
  - FOREIGN KEY (accounts, currencies)
  - ENUM constraint on type (income, expense, fee, tax, interest)
  - ENUM constraint on source (manual, automatic)
  - currency_id nullable with default value (1)
- **Recent Improvements**:
  - Fixed currency_id nullable constraint with default value
  - Added missing ENUM values (fee, interest) to type constraints
  - Implemented proper date handling for SQLite compatibility
  - Enhanced validation and error handling

#### 3. Alerts
- **Purpose**: Alert system management
- **Key Fields**: id, account_id, ticker_id, condition, status
- **Relationships**: Linked to accounts, tickers
- **Constraints**: NOT NULL, FOREIGN KEY, ENUM constraints

#### 4. Currencies
- **Purpose**: Currency management system
- **Key Fields**: id, symbol, name, usd_rate
- **Constraints**: UNIQUE (symbol), NOT NULL
- **Integration**: Used across all modules for currency display

#### 5. Notes
- **Purpose**: Note creation and relationship management
- **Key Fields**: id, content, created_at
- **Relationships**: Linked to note_relation_types
- **Constraints**: NOT NULL, FOREIGN KEY

#### 6. Note Relation Types
- **Purpose**: Relationship type management for notes
- **Key Fields**: id, note_relation_type, created_at
- **Constraints**: NOT NULL, UNIQUE

## Dynamic Constraint Management

### Constraint Types
1. **NOT NULL**: Ensures required fields have values
2. **FOREIGN KEY**: Maintains referential integrity
3. **UNIQUE**: Prevents duplicate values
4. **ENUM**: Restricts values to predefined options
5. **DEFAULT**: Provides default values for fields

### Constraint Tables
- **constraints**: Stores constraint definitions
- **enum_values**: Stores allowed values for ENUM constraints
- **foreign_keys**: Stores foreign key relationships

### Recent Enhancements
- **ENUM Value Management**: Dynamic addition of new enum values
- **Constraint Validation**: Real-time constraint checking
- **Error Handling**: Comprehensive error messages for constraint violations

## Database Operations

### Backup System
- **Automated Backups**: Regular database snapshots
- **Git Integration**: Version-controlled backups
- **Recovery Procedures**: Documented recovery processes

### Migration System
- **Schema Updates**: Dynamic schema modification
- **Data Migration**: Safe data transformation
- **Version Control**: Migration version tracking

### Validation System
- **Client-Side**: Real-time form validation
- **Server-Side**: Comprehensive data validation
- **Database-Level**: Constraint enforcement

## API Integration

### RESTful Endpoints
- **CRUD Operations**: Complete create, read, update, delete functionality
- **Validation**: Multi-layer validation system
- **Error Handling**: Comprehensive error responses
- **Logging**: Detailed request/response logging

### Data Formats
- **JSON**: Primary data exchange format

## Frontend Table Integration

### Table Identification System
The database integrates with a sophisticated frontend table identification system that supports both dedicated pages and unified database views.

#### **Table Types and Structures**
Each database table has a corresponding frontend representation with specific identification methods:

**1. Dedicated Pages (Specific Tables)**
- **Accounts Page**: `content-section accounts-page` → `accountsTable`
- **Trades Page**: `content-section tracking-page` → `tradesTable`
- **Tickers Page**: `content-section tickers-page` → `tickersTable`
- **Alerts Page**: `content-section alerts-page` → `alertsTable`
- **Notes Page**: `content-section notes-page` → `notesTable`
- **Executions Page**: `content-section executions-page` → `executionsTable`
- **Cash Flows Page**: `content-section cash-flows-page` → `cashFlowsTable`

**2. Database Display Page (Unified View)**
- **Trade Plans**: `data-table-type="trade_plans"` → `tradePlansTable`
- **Trades**: `data-table-type="trades"` → `tradesTable`
- **Accounts**: `data-table-type="accounts"` → `accountsTable`
- **Tickers**: `data-table-type="tickers"` → `tickersTable`
- **Executions**: `data-table-type="executions"` → `executionsTable`
- **Cash Flows**: `data-table-type="cash_flows"` → `cashFlowsTable`
- **Alerts**: `data-table-type="alerts"` → `alertsTable`
- **Notes**: `data-table-type="notes"` → `notesTable`

#### **Column Mapping System**
The system uses centralized column mappings in `table-mappings.js` to ensure consistency:

```javascript
const TABLE_COLUMN_MAPPINGS = {
    'accounts': [
        'id',              // 0 - מזהה
        'name',            // 1 - שם
        'status',          // 2 - סטטוס
        'currency',        // 3 - מטבע
        'cash_balance',    // 4 - יתרה במזומן
        'created_at'       // 5 - נוצר ב
    ],
    'trades': [
        'ticker_symbol',   // 0 - טיקר
        'status',          // 1 - סטטוס
        'investment_type', // 2 - סוג
        'side',            // 3 - צד
        'total_pl',        // 4 - רווח/הפסד
        'created_at',      // 5 - נוצר ב
        'closed_at',       // 6 - נסגר ב
        'account_name',    // 7 - חשבון
        'notes',           // 8 - הערות
        'actions'          // 9 - פעולות
    ]
    // ... other tables
};
```

#### **Data Flow Integration**
```
Database Table ←→ API Endpoint ←→ Frontend Table ←→ User Interface
     ↓              ↓                ↓                ↓
  SQLAlchemy    RESTful API    JavaScript Table    HTML/CSS
   Model         Response       Identification      Display
```

#### **Sorting and Filtering**
- **Universal Sorting**: Global `sortTableData()` function works across all table types
- **Dynamic Filtering**: Filter system adapts to table structure automatically
- **State Management**: Sort and filter states persist across page navigation
- **Performance**: Optimized for large datasets with efficient algorithms

#### **Constraint Display**
Database constraints are dynamically displayed under each table:
- **NOT NULL**: Required field indicators
- **FOREIGN KEY**: Relationship information
- **UNIQUE**: Uniqueness constraints
- **ENUM**: Allowed value lists
- **DEFAULT**: Default value information

## Security and Validation

## Recent Improvements

### Cash Flows Module
1. **Currency Integration**: Proper currency_id handling with defaults
2. **Date Compatibility**: SQLite-compatible date handling
3. **Type Validation**: Enhanced type constraint management
4. **Source Tracking**: Manual/automatic source differentiation
5. **Form Validation**: Comprehensive client and server validation

### System Enhancements
1. **Warning System**: Centralized modal system for confirmations
2. **Translation System**: Global translation utilities
3. **Page Styling**: Consistent gradient backgrounds
4. **Error Handling**: Improved error messages and logging

## Performance Considerations

### Optimization Strategies
- **Indexing**: Strategic index placement for query performance
- **Query Optimization**: Efficient SQL query design
- **Caching**: Consider implementing caching layer
- **Connection Pooling**: Database connection management

### Monitoring
- **Query Performance**: Monitor slow queries
- **Constraint Validation**: Track constraint violation rates
- **Error Rates**: Monitor API error frequencies
- **Database Size**: Track database growth

## Development Guidelines

### Database Changes
1. **Migration Scripts**: Always create migration scripts for schema changes
2. **Constraint Management**: Use dynamic constraint system for flexibility
3. **Data Validation**: Implement comprehensive validation at all layers
4. **Backup Strategy**: Maintain regular backups before major changes

### Code Standards
1. **Model Definitions**: Clear and documented model structures
2. **Relationship Management**: Proper foreign key relationships
3. **Validation Logic**: Consistent validation across all modules
4. **Error Handling**: Comprehensive error handling and logging

## Troubleshooting

### Common Issues
1. **Constraint Violations**: Check enum_values table for missing values
2. **Foreign Key Errors**: Verify referenced records exist
3. **Date Format Issues**: Ensure proper date string formatting
4. **Currency Issues**: Verify currency_id references valid currencies

### Debugging Tools
- **SQLite CLI**: Direct database access for debugging
- **Log Files**: Comprehensive logging for error tracking
- **API Testing**: Use curl or Postman for API testing
- **Constraint Inspection**: Check constraints and enum_values tables

## Future Enhancements

### Planned Improvements
1. **Advanced Filtering**: Implement complex filtering capabilities
2. **Sorting System**: Add column sorting functionality
3. **Performance Optimization**: Implement caching and query optimization
4. **Migration System**: Enhanced migration management
5. **Testing Suite**: Comprehensive database testing

### Technical Debt
1. **Testing Coverage**: Need comprehensive testing suite
2. **Performance Monitoring**: Implement performance monitoring tools
3. **Documentation**: Enhance technical documentation
4. **Code Quality**: Implement code quality tools

---

**Last Updated**: 2025-01-26  
**Maintainer**: TikTrack Development Team
