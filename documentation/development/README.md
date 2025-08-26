# TikTrack Development Documentation

## Overview
This document provides comprehensive guidance for developers working on the TikTrack system, including setup, development workflow, and best practices.

> 📋 **לפרטים מלאים על הפרויקט:** ראה [PROJECT_STATUS_SUMMARY.md](../../PROJECT_STATUS_SUMMARY.md)

## 🆕 **Latest Updates (January 26, 2025)**
- ✅ **Unified Filter System** - Complete centralized filtering solution
- ✅ **Enhanced Header System** - Comprehensive filter integration
- ✅ **Preference-Based Filtering** - Server-based default filter preferences
- ✅ **Hebrew Translation System** - Automatic conversion of English preferences
- ✅ **Performance Optimizations** - Debounced search, efficient DOM queries
- ✅ **Error Handling** - Graceful fallback and comprehensive error recovery
- ✅ **Documentation Updates** - Complete filter system documentation

## Development Environment Setup

### Prerequisites
- **Python**: 3.8 or higher
- **Node.js**: 14 or higher (for frontend tools)
- **Git**: Latest version
- **SQLite**: 3.30 or higher

### Installation
```bash
# Clone the repository
git clone https://github.com/WaldNimrod/TikTrack.git
cd TikTrack

# Install Python dependencies
pip install -r requirements.txt

# Start the development server
./start_dev.sh
```

## Project Structure

### Backend Structure
```
Backend/
├── app.py                 # Main Flask application
├── models/               # SQLAlchemy models
│   ├── __init__.py
│   ├── trade.py
│   ├── account.py
│   ├── alert.py
│   └── constraint.py
├── routes/               # API routes
│   ├── api/             # REST API endpoints
│   │   ├── trades.py
│   │   ├── accounts.py
│   │   ├── alerts.py
│   │   └── constraints.py
│   └── pages.py         # HTML page routes
├── services/            # Business logic
│   ├── trade_service.py
│   ├── account_service.py
│   ├── alert_service.py
│   └── constraint_service.py
├── migrations/          # Database migrations
│   ├── create_constraints_tables.py
│   ├── insert_basic_constraints.py
│   └── remove_old_constraints.py
├── config/             # Configuration files
└── db/                 # Database files
```

### Frontend Structure
```
trading-ui/
├── *.html              # Main application pages
├── scripts/            # JavaScript files with comprehensive validation
│   ├── header-system.js    # Header component and navigation
│   ├── simple-filter.js    # Unified filter system (NEW)
│   ├── table-mappings.js   # Centralized table column mappings
│   ├── main.js            # Global utility functions and sorting
│   ├── translation-utils.js # Translation functions
│   ├── warning-system.js   # Centralized warning modal system
│   ├── ui-utils.js        # Shared UI utility functions
│   ├── data-utils.js      # Shared data utilities (API calls, validation)
│   ├── alerts.js          # Alert management with advanced validation
│   ├── active-alerts-component.js # Alert component
│   ├── trade_plans.js     # Trade plans with full CRUD and validation
│   ├── trades.js          # Trades page logic
│   ├── accounts.js        # Account management with enhanced validation
│   ├── notes.js           # Notes with content and attachment validation
│   ├── tickers.js         # Ticker management with symbol validation
│   ├── executions.js      # Execution validation and management
│   ├── cash_flows.js      # Cash flow validation and financial data
│   └── *.js              # Other page-specific scripts
├── styles/            # CSS files
│   ├── apple-theme.css
│   ├── header-system.css
│   ├── table.css
│   └── *.css
└── images/            # Static assets
```

## Development Workflow

### 1. Feature Development
1. **Create Feature Branch**
   ```bash
   git checkout -b feature/constraint-system
   ```

2. **Implement Changes**
   - Backend: Add models, services, and API endpoints
   - Frontend: Create UI components and JavaScript logic
   - Database: Create migration scripts if needed

3. **Test Changes**
   ```bash
   # Run backend tests
   python3 -m pytest Backend/tests/
   
   # Test API endpoints
   curl http://localhost:8080/api/v1/constraints
   ```

4. **Update Documentation**
   - Update relevant documentation files
   - Add code comments
   - Update API documentation

5. **Commit and Push**
   ```bash
   git add .
   git commit -m "Add constraint management system"
   git push origin feature/constraint-system
   ```

### 2. Database Changes
1. **Create Migration Script**
   ```python
   # Backend/migrations/new_migration.py
   import sqlite3
   import os
   
   def run_migration():
       db_path = 'Backend/db/simpleTrade_new.db'
       conn = sqlite3.connect(db_path)
       cursor = conn.cursor()
       
       # Add your SQL changes here
       cursor.execute("""
           ALTER TABLE trades ADD COLUMN new_column TEXT;
       """)
       
       conn.commit()
       conn.close()
   
   if __name__ == "__main__":
       run_migration()
   ```

2. **Run Migration**
   ```bash
   python3 Backend/migrations/new_migration.py
   ```

3. **Update Models**
   - Update SQLAlchemy models to reflect changes
   - Add validation rules if needed

### 3. API Development
1. **Create Service Layer**
   ```python
   # Backend/services/new_service.py
   from Backend.models import db
   from Backend.models.new_model import NewModel
   
   class NewService:
       @staticmethod
       def get_all():
           return NewModel.query.all()
       
       @staticmethod
       def create(data):
           new_item = NewModel(**data)
           db.session.add(new_item)
           db.session.commit()
           return new_item
   ```

2. **Create API Routes**
   ```python
   # Backend/routes/api/new_routes.py
   from flask import Blueprint, request, jsonify
   from Backend.services.new_service import NewService
   
   new_bp = Blueprint('new', __name__)
   
   @new_bp.route('/new', methods=['GET'])
   def get_all():
       items = NewService.get_all()
       return jsonify({
           'status': 'success',
           'data': [item.to_dict() for item in items]
       })
   ```

3. **Register Routes**
   ```python
   # Backend/app.py
   from Backend.routes.api.new_routes import new_bp
   app.register_blueprint(new_bp, url_prefix='/api/v1')
   ```

## Frontend Architecture

### Comprehensive Validation System

The TikTrack frontend includes a comprehensive validation system across all pages:

#### Validation Features
- **Real-time Validation**: Immediate feedback on form inputs
- **Range Validation**: Min/max values for numbers, dates, and text lengths
- **Format Validation**: Email, phone, symbols, currency formats
- **Business Logic Validation**: Status combinations, dependencies, constraints
- **Security Validation**: Input sanitization, XSS prevention
- **User Experience**: Clear error messages, auto-focus on error fields

#### Page-Specific Validation

**Trade Plans (`trade_plans.js`)**
- Complete CRUD operations with modal management
- Plan validation: dates, amounts, investment types
- Status combination validation
- Integration with ValidationService backend

**Alerts (`alerts.js`)**
- Advanced alert condition validation
- Support for price alerts and stop-loss alerts
- Variable, operator, and value validation
- Status/trigger state combination validation

**Cash Flows (`cash_flows.js`)**
- Financial data validation (amounts, currencies, dates)
- Account and transaction type validation
- Range validation for amounts and dates
- Source and external ID validation

**Notes (`notes.js`)**
- Content validation (1-10,000 characters)
- File attachment validation (size, type restrictions)
- Related object validation and linking
- Support for multiple attachment types

**Executions (`executions.js`)**
- Trade execution validation (ID, quantity, price)
- Date range and business day validation
- Commission and fee validation
- Integration with trade management

**Accounts (`accounts.js`)**
- Account name validation (length, special characters)
- Currency and status validation
- Balance and value range validation
- Enhanced security checks

**Tickers (`tickers.js`)**
- Symbol uniqueness and format validation
- Company name and type validation
- Currency integration validation
- Market data validation

#### Validation Architecture
```javascript
// Unified validation pattern across all pages
function validateCompleteForm(mode) {
    const prefix = mode === 'add' ? 'add' : 'edit';
    let isValid = true;
    
    // Field-specific validations
    if (!validateRequiredFields(prefix)) isValid = false;
    if (!validateDataTypes(prefix)) isValid = false;
    if (!validateRanges(prefix)) isValid = false;
    if (!validateBusinessRules(prefix)) isValid = false;
    
    return isValid;
}

// Error handling and user feedback
function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorDiv = document.getElementById(fieldId + 'Error');
    
    field.classList.add('is-invalid');
    field.focus();
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}
```

### Table Mapping System
The application uses a centralized table mapping system located in `trading-ui/scripts/table-mappings.js`. This system provides:

- **Centralized Column Mappings**: All table column definitions are stored in one place
- **Consistent Sorting**: All tables use the same sorting mechanism
- **Easy Maintenance**: Adding new tables or modifying existing ones requires changes in only one file
- **Type Safety**: Proper handling of complex fields (nested objects, dates, etc.)

#### Usage
```javascript
// Get column value for sorting
const value = window.getColumnValue(item, columnIndex, tableType);

// Check if table is supported
const isSupported = window.isTableSupported(tableType);

// Get table mapping
const mapping = window.getTableMapping(tableType);
```

#### Adding New Tables
1. Add table mapping to `TABLE_COLUMN_MAPPINGS` in `table-mappings.js`
2. Add special field handling if needed
3. Include `table-mappings.js` in the HTML page
4. Add `data-table-type` attribute to the table element

### Script Loading Order
The correct order for loading scripts in HTML pages:
```html
<script src="scripts/header-system.js"></script>
<script src="scripts/console-cleanup.js"></script>
<script src="scripts/translation-utils.js"></script>
<script src="scripts/table-mappings.js"></script>  <!-- Must be loaded before main.js -->
<script src="scripts/main.js"></script>
<script src="scripts/filter-system.js"></script>
<script src="scripts/alerts.js"></script>
<script src="scripts/active-alerts-component.js"></script>
<script src="scripts/[page-specific].js"></script>
```

## Dynamic Constraint Management System

### Overview
The constraint management system allows dynamic definition and enforcement of database constraints through a web interface.

### Key Components

#### 1. Database Tables
- **constraints**: Main constraint definitions
- **enum_values**: Enum constraint values
- **constraint_validations**: Validation results

#### 2. Backend Services
```python
# Backend/services/constraint_service.py
class ConstraintService:
    @staticmethod
    def get_all_constraints():
        return Constraint.query.filter_by(is_active=True).all()
    
    @staticmethod
    def create_constraint(data):
        constraint = Constraint(**data)
        db.session.add(constraint)
        db.session.commit()
        return constraint
    
    @staticmethod
    def validate_constraints():
        # Implementation for constraint validation
        pass
```

#### 3. API Endpoints
- `GET /api/v1/constraints` - List all constraints
- `POST /api/v1/constraints` - Create new constraint
- `PUT /api/v1/constraints/{id}` - Update constraint
- `DELETE /api/v1/constraints/{id}` - Delete constraint
- `GET /api/v1/constraints/health` - System health

#### 4. Frontend Components
```javascript
// trading-ui/scripts/constraint-manager.js
class ConstraintManager {
    constructor() {
        this.apiBase = 'http://localhost:8080/api/v1/constraints';
        this.init();
    }
    
    async init() {
        await this.loadStats();
        await this.loadConstraints();
        this.setupEventListeners();
    }
    
    async loadConstraints() {
        const response = await fetch(this.apiBase);
        const data = await response.json();
        this.renderConstraintsList(data.data);
    }
}
```

### Constraint Types
1. **CHECK**: Custom validation rules
2. **NOT NULL**: Required field validation
3. **UNIQUE**: Unique value enforcement
4. **FOREIGN KEY**: Referential integrity
5. **ENUM**: Predefined value lists

### Usage Examples

#### Adding a CHECK Constraint
```json
{
    "table_name": "trades",
    "column_name": "investment_type",
    "constraint_type": "CHECK",
    "constraint_name": "valid_investment_type",
    "constraint_definition": "investment_type IN ('swing', 'investment', 'passive')"
}
```

#### Adding an ENUM Constraint
```json
{
    "table_name": "accounts",
    "column_name": "status",
    "constraint_type": "ENUM",
    "constraint_name": "account_status_enum",
    "enum_values": [
        {"value": "active", "display_name": "פעיל", "sort_order": 1},
        {"value": "inactive", "display_name": "לא פעיל", "sort_order": 2}
    ]
}
```

## Testing

### Unit Testing
```python
# Backend/tests/test_constraints.py
import pytest
from Backend.services.constraint_service import ConstraintService

def test_create_constraint():
    data = {
        "table_name": "trades",
        "column_name": "status",
        "constraint_type": "ENUM",
        "constraint_name": "test_constraint"
    }
    
    constraint = ConstraintService.create_constraint(data)
    assert constraint.table_name == "trades"
    assert constraint.constraint_type == "ENUM"
```

### Integration Testing
```python
# Backend/tests/integration/test_constraint_api.py
def test_constraint_api_endpoints(client):
    # Test GET /api/v1/constraints
    response = client.get('/api/v1/constraints')
    assert response.status_code == 200
    
    # Test POST /api/v1/constraints
    data = {
        "table_name": "trades",
        "column_name": "status",
        "constraint_type": "ENUM",
        "constraint_name": "test_constraint"
    }
    response = client.post('/api/v1/constraints', json=data)
    assert response.status_code == 201
```

### Frontend Testing
```javascript
// trading-ui/tests/constraint-manager.test.js
describe('ConstraintManager', () => {
    test('should load constraints', async () => {
        const manager = new ConstraintManager();
        await manager.loadConstraints();
        expect(manager.constraints.length).toBeGreaterThan(0);
    });
});
```

## Code Standards

### Python Standards
- **PEP 8**: Follow Python style guide
- **Type Hints**: Use type annotations
- **Docstrings**: Document all functions and classes
- **Error Handling**: Use proper exception handling

### JavaScript Standards
- **ES6+**: Use modern JavaScript features
- **Async/Await**: Use for asynchronous operations
- **Error Handling**: Use try-catch blocks
- **Comments**: Document complex logic

### Database Standards
- **Naming**: Use snake_case for table and column names
- **Indexes**: Add indexes for frequently queried columns
- **Constraints**: Use appropriate constraints
- **Migrations**: Always use migration scripts

## Deployment

### Development Deployment
```bash
# Start development server
./start_dev.sh

# Access application
http://localhost:8080
```

### Production Deployment
```bash
# Start production server
./start_server.sh

# Monitor logs
tail -f logs/app.log
```

## Troubleshooting

### Common Issues
1. **Database Connection**: Check database file permissions
2. **Migration Errors**: Verify migration scripts
3. **API Errors**: Check endpoint URLs and parameters
4. **Frontend Issues**: Check browser console for errors

### Debug Tools
- **Backend**: Use Python debugger (pdb)
- **Frontend**: Use browser developer tools
- **Database**: Use SQLite command line tool
- **API**: Use curl or Postman for testing

## Resources

### Documentation
- [API Documentation](../api/README.md)
- [Database Documentation](../database/README.md)
- [Frontend Documentation](../frontend/README.md)

### Tools
- **API Testing**: Postman, curl
- **Database**: SQLite Browser, DBeaver
- **Code Editor**: VS Code, PyCharm
- **Version Control**: Git, GitHub

---

**Last Updated**: August 23, 2025  
**Version**: 2.0.0  
**Author**: TikTrack Development Team
