# Dynamic Constraint Management System Documentation

## Overview
The Dynamic Constraint Management System provides a comprehensive solution for managing database constraints dynamically through a web interface. This system allows administrators to define, modify, and validate constraints without requiring database schema changes.

> 📋 **For full project details:** See [PROJECT_STATUS_SUMMARY.md](../../../PROJECT_STATUS_SUMMARY.md)

## 🆕 **Latest Updates (August 24, 2025)**
- ✅ **ValidationService Integration** - Real-time validation in all services
- ✅ **Server Restart System** - Smart restart with multiple modes
- ✅ **Frontend-Backend Alignment** - Complete integration
- ✅ **74 Constraints Defined** - All tables covered
- ✅ **Dynamic Frontend Display** - Constraints load dynamically from API
- ✅ **Active Trades Computed Constraint** - New COMPUTED constraint type
- ✅ **Comprehensive Documentation** - Updated guides and examples

## System Architecture

### Core Components
1. **Constraint Tables**: Store constraint definitions and metadata
2. **API Layer**: RESTful endpoints for constraint management
3. **Frontend Interface**: Web-based UI for constraint administration
4. **Validation Engine**: Real-time constraint validation

### Database Schema

#### Constraints Table
```sql
CREATE TABLE constraints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name VARCHAR(50) NOT NULL,
    column_name VARCHAR(50) NOT NULL,
    constraint_type VARCHAR(20) NOT NULL,
    constraint_name VARCHAR(100) NOT NULL UNIQUE,
    constraint_definition TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Enum Values Table
```sql
CREATE TABLE enum_values (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    constraint_name VARCHAR(100) NOT NULL,
    value VARCHAR(50) NOT NULL,
    display_name VARCHAR(100),
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (constraint_name) REFERENCES constraints(constraint_name)
);
```

#### Constraint Validations Table
```sql
CREATE TABLE constraint_validations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    constraint_id INTEGER NOT NULL,
    validation_type VARCHAR(20) NOT NULL,
    validation_rule TEXT NOT NULL,
    error_message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (constraint_id) REFERENCES constraints(id)
);
```

## Complete Constraints Summary

### Total Statistics
- **Total Constraints**: 71
- **Tables Covered**: 10
- **Constraint Types**: NOT_NULL, CHECK, UNIQUE, ENUM, RANGE, FOREIGN_KEY

### Constraints by Table

#### Accounts Table (7 constraints)
- **NOT_NULL**: id, name, currency, created_at
- **CHECK**: name (minimum 3 characters)
- **UNIQUE**: name
- **ENUM**: status (open, closed, cancelled)

#### Alerts Table (8 constraints)
- **NOT_NULL**: id, type, condition, related_type_id, related_id
- **ENUM**: type (price, volume, stop, ma, custom), status (open, closed, cancelled), is_triggered (new, true, false)

#### Cash Flows Table (10 constraints)
- **NOT_NULL**: id, account_id, type, amount, date, currency, currency_id, created_at
- **CHECK**: external_id (required for non-manual sources)
- **ENUM**: type (deposit, withdrawal, dividend, tax, other), source (manual, IBKR-tradelog-csv, IBKR-api)

#### Currencies Table (6 constraints)
- **CHECK**: symbol (3 uppercase letters), name (max 25 characters), usd_rate (positive), created_at (not future)
- **UNIQUE**: symbol, name

#### Executions Table (7 constraints)
- **NOT_NULL**: id, trade_id, action, date, quantity, price, created_at
- **CHECK**: trade_id (non-negative), quantity (positive), price (positive)
- **ENUM**: action (buy, sale)

#### Note Relation Types Table (4 constraints)
- **CHECK**: note_relation_type (max 20 characters), created_at (not future)
- **UNIQUE**: note_relation_type
- **ENUM**: note_relation_type (account, trade, trade_plan, ticker)

#### Notes Table (5 constraints)
- **NOT_NULL**: id, content, related_type_id, related_id
- **CHECK**: content (minimum 1 character), related_id (positive), created_at (not future)
- **FOREIGN_KEY**: related_type_id (references note_relation_types)

#### Tickers Table (7 constraints)
- **NOT_NULL**: id, symbol, currency, created_at
- **CHECK**: name (max 12 characters), active_trades (boolean), updated_at (not future)

#### Trade Plans Table (9 constraints)
- **NOT_NULL**: ticker_id, created_at
- **CHECK**: cancelled_at (after created_at)
- **RANGE**: planned_amount (> 0), stop_price (> 0), target_price (> 0)
- **ENUM**: investment_type (swing, investment, passive), side (Long, Short), status (open, closed, cancelled)

#### Trades Table (8 constraints)
- **NOT_NULL**: trade_plan_id, account_id, ticker_id
- **CHECK**: opened_at (required for open status), closed_at (after opened_at)
- **ENUM**: investment_type (swing, investment, passive), side (Long, Short), status (open, closed, cancelled)

## API Endpoints

### Constraint Management
- `GET /api/constraints/` - Get all constraints
- `POST /api/constraints/` - Add new constraint
- `PUT /api/constraints/<id>` - Update constraint
- `DELETE /api/constraints/<id>` - Delete constraint

### Validation
- `POST /api/constraints/validate` - Validate specific field
- `GET /api/constraints/health` - System health check

### Enum Values
- `GET /api/constraints/enum-values/<constraint_name>` - Get enum values
- `POST /api/constraints/enum-values/` - Add enum value
- `DELETE /api/constraints/enum-values/<id>` - Delete enum value

## Usage Examples

### Adding a NOT_NULL Constraint
```json
{
    "table_name": "accounts",
    "column_name": "name",
    "constraint_type": "NOT_NULL",
    "constraint_name": "account_name_required",
    "constraint_definition": "name IS NOT NULL"
}
```

### Adding an ENUM Constraint
```json
{
    "table_name": "accounts",
    "column_name": "status",
    "constraint_type": "ENUM",
    "constraint_name": "valid_account_status",
    "constraint_definition": "status IN (open, closed, cancelled)",
    "enum_values": [
        {"value": "open", "display_name": "Open", "sort_order": 1},
        {"value": "closed", "display_name": "Closed", "sort_order": 2},
        {"value": "cancelled", "display_name": "Cancelled", "sort_order": 3}
    ]
}
```

## Frontend Interface

### Features
- **Constraint List**: View all constraints with filtering and search
- **Add Constraint**: Modal form for adding new constraints
- **Edit Constraint**: Inline editing of constraint properties
- **Delete Constraint**: Remove constraints with confirmation
- **Validation**: Real-time validation of constraint definitions

### UI Components
- **Constraint Manager**: Main component for constraint management
- **Add Constraint Modal**: Bootstrap modal for adding constraints
- **Constraint Editor**: Inline editor for constraint properties
- **Validation Display**: Shows validation results and errors

## Data Integrity Features

### Automatic Validation
- **Real-time**: Constraints are validated as they are defined
- **Comprehensive**: All constraint types are supported
- **User-friendly**: Clear error messages and suggestions

### Data Compliance
- **Existing Data**: All existing data complies with defined constraints
- **New Data**: All new data is validated against constraints
- **Updates**: Data updates are validated before saving

## Default Values

### System Defaults
- **currencies.usd_rate**: Default value 1
- **notes.created_at**: Default CURRENT_TIMESTAMP
- **note_relation_types.created_at**: Default CURRENT_TIMESTAMP

### Constraint Defaults
- **NOT_NULL**: Ensures required fields are populated
- **CHECK**: Validates logical conditions
- **UNIQUE**: Prevents duplicate values
- **ENUM**: Restricts values to predefined list
- **RANGE**: Ensures values within specified range
- **FOREIGN_KEY**: Maintains referential integrity

## Best Practices

### Constraint Naming
- Use descriptive names: `table_column_constraint_type`
- Include table and column names for clarity
- Use consistent naming conventions

### Constraint Definitions
- Write clear, readable SQL conditions
- Include comments for complex logic
- Test constraints with sample data

### Performance Considerations
- Index columns with UNIQUE constraints
- Use appropriate data types
- Consider impact on INSERT/UPDATE operations

## Maintenance

### Regular Tasks
- **Validation**: Run periodic constraint validation
- **Cleanup**: Remove unused constraints
- **Optimization**: Review constraint performance
- **Documentation**: Update constraint documentation

### Monitoring
- **Health Checks**: Monitor constraint system health
- **Performance**: Track constraint validation performance
- **Errors**: Monitor constraint violation errors
- **Usage**: Track constraint usage patterns

## Troubleshooting

### Common Issues
1. **Constraint Violations**: Data that doesn't comply with constraints
2. **Performance Issues**: Slow constraint validation
3. **Circular Dependencies**: Constraints that reference each other
4. **Data Type Mismatches**: Constraints with wrong data types

### Solutions
1. **Data Cleanup**: Fix data that violates constraints
2. **Index Optimization**: Add indexes for better performance
3. **Constraint Review**: Review and fix circular dependencies
4. **Type Correction**: Update constraints with correct data types

## Future Enhancements

### Planned Features
- **Constraint Templates**: Predefined constraint patterns
- **Bulk Operations**: Add/update multiple constraints
- **Constraint History**: Track constraint changes over time
- **Advanced Validation**: Complex validation rules
- **Performance Monitoring**: Detailed performance metrics

### Integration
- **CI/CD**: Automated constraint validation in deployment
- **Testing**: Automated constraint testing
- **Monitoring**: Integration with monitoring systems
- **Reporting**: Constraint compliance reports

## 🎨 **Frontend Integration**

### **Dynamic Constraints Display**
The database page (`/db_display`) now displays constraints dynamically from the API:

#### **Features**
- **Real-time Loading**: Constraints are loaded from `/api/constraints/` endpoint
- **Automatic Updates**: Constraints list updates automatically when page loads
- **Visual Indicators**: Different constraint types have distinct colors and icons
- **Unique Section IDs**: Each table section has unique ID for targeting

#### **Visual Design**
- `NOT_NULL` - Red with ⚠ icon
- `UNIQUE` - Green with ✓ icon  
- `FOREIGN_KEY` - Blue with 🔗 icon
- `CHECK` - Orange with ✔ icon
- `ENUM` - Turquoise with 📋 icon
- `RANGE` - Purple with 📏 icon
- `COMPUTED` - Orange (logo color) with 🔄 icon

#### **Technical Implementation**
- **JavaScript Functions**: `loadConstraints()`, `updateConstraintsDisplay()`, `updateTableConstraints()`
- **CSS Classes**: Added styles for new constraint types in `table.css`
- **HTML Structure**: Each table section has unique ID for targeting
- **API Integration**: Seamless integration with existing constraint management system

### **User Experience**
- **Immediate Feedback**: New constraints appear instantly in the UI
- **Consistent Styling**: All constraints follow the same visual pattern
- **Easy Identification**: Special constraints like `active_trades_computed` are clearly marked

## Conclusion

The Dynamic Constraint Management System provides a robust, flexible solution for managing database constraints. With 74 constraints across 10 tables, the system ensures data integrity while providing an intuitive interface for constraint management.

The system supports all major constraint types (including the new COMPUTED type) and provides comprehensive validation, making it suitable for production environments where data integrity is critical.

**Latest Enhancement**: The frontend now displays constraints dynamically, providing real-time visibility into the constraint system with beautiful visual indicators and seamless API integration.
