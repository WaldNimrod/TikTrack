# Active Trades Dynamic Constraint Documentation

## Overview

The Active Trades Dynamic Constraint is a sophisticated constraint system that automatically maintains the `active_trades` field in the `tickers` table. This field indicates whether a ticker currently has any open trades or trade plans.

## 🎯 **Purpose**

The `active_trades` field provides a quick way to identify which tickers are currently being traded or planned for trading, without needing to query multiple tables.

## 🏗️ **Architecture**

### **Constraint Logic**
```sql
active_trades = (
    EXISTS (SELECT 1 FROM trades WHERE ticker_id = tickers.id AND status = 'open')
    OR 
    EXISTS (SELECT 1 FROM trade_plans WHERE ticker_id = tickers.id AND status = 'open')
)
```

### **Components**

1. **Dynamic Constraint Definition** - Stored in `constraints` table
2. **Database Triggers** - Automatic updates on data changes
3. **Service Layer Integration** - Manual updates for consistency
4. **Validation System** - Periodic checks and fixes
5. **API Endpoints** - Management and monitoring

## 🔧 **Implementation**

### **1. Dynamic Constraint**

The constraint is defined in the `constraints` table:

```sql
INSERT INTO constraints (
    table_name, column_name, constraint_type, constraint_name, constraint_definition
) VALUES (
    'tickers', 'active_trades', 'COMPUTED', 'active_trades_computed',
    'active_trades = (SELECT COUNT(*) > 0 FROM trades WHERE ticker_id = tickers.id AND status = ''open'') OR (SELECT COUNT(*) > 0 FROM trade_plans WHERE ticker_id = tickers.id AND status = ''open'')'
);
```

### **2. Database Triggers**

Six triggers automatically update `active_trades` when data changes:

#### **Trade Triggers**
- `update_ticker_active_trades_on_trade_change` - When trade status changes
- `update_ticker_active_trades_on_trade_insert` - When new trade is created
- `update_ticker_active_trades_on_trade_delete` - When trade is deleted

#### **Trade Plan Triggers**
- `update_ticker_active_trades_on_plan_change` - When plan status changes
- `update_ticker_active_trades_on_plan_insert` - When new plan is created
- `update_ticker_active_trades_on_plan_delete` - When plan is deleted

### **3. Service Layer Integration**

The trade and trade plan services include manual updates for immediate consistency:

```python
# In TradeService.close_trade()
try:
    from app import update_ticker_open_status
    update_ticker_open_status(trade.ticker_id)
    logger.info(f"Updated ticker {trade.ticker_id} active_trades status after closing trade")
except Exception as e:
    logger.warning(f"Could not update ticker active_trades status: {e}")
```

## 📊 **Usage Examples**

### **Checking Active Tickers**
```sql
-- Get all tickers with active trades
SELECT symbol, name FROM tickers WHERE active_trades = 1;

-- Count active tickers
SELECT COUNT(*) FROM tickers WHERE active_trades = 1;
```

### **API Usage**
```bash
# Validate constraint
curl -X GET "http://localhost:8080/api/v1/constraints/active-trades/validate"

# Fix constraint issues
curl -X POST "http://localhost:8080/api/v1/constraints/active-trades/fix"
```

## 🔍 **Validation and Monitoring**

### **Constraint Validation**
The system includes comprehensive validation:

```python
def validate_active_trades_constraint(self) -> Tuple[bool, List[str]]:
    """Validate that all tickers active_trades field matches actual open trades/plans"""
    # Implementation checks each ticker against actual data
```

### **Automatic Fixes**
```python
def fix_active_trades_constraint(self) -> Tuple[bool, int]:
    """Fix all tickers active_trades field to match actual open trades/plans"""
    # Implementation updates all tickers
```

## 🚀 **Migration Process**

### **Running the Migration**
```bash
cd Backend
python3 migrations/add_active_trades_constraint.py
```

### **Migration Steps**
1. **Add Dynamic Constraint** - Define the constraint in the system
2. **Create Triggers** - Set up automatic update triggers
3. **Update Existing Data** - Fix all current tickers
4. **Verify Implementation** - Test triggers and logic

## 🧪 **Testing**

### **Test Script**
```bash
cd Backend
python3 scripts/test_active_trades_constraint.py
```

### **Test Coverage**
- **Logic Validation** - Check all tickers against actual data
- **Trigger Testing** - Verify triggers work correctly
- **API Testing** - Test validation and fix endpoints

## 📈 **Performance Considerations**

### **Optimization Features**
- **Indexes** on `ticker_id` and `status` columns
- **Efficient Triggers** using EXISTS instead of COUNT
- **Batch Updates** for fixing multiple tickers
- **Caching** of constraint definitions

### **Monitoring**
- **Performance Metrics** - Track trigger execution time
- **Error Logging** - Monitor constraint violations
- **Health Checks** - Regular validation runs

## 🔧 **Maintenance**

### **Regular Tasks**
1. **Validation Runs** - Weekly constraint validation
2. **Performance Monitoring** - Track trigger performance
3. **Error Resolution** - Fix any constraint violations
4. **Data Consistency** - Ensure all tickers are correct

### **Troubleshooting**
```bash
# Check constraint status
curl -X GET "http://localhost:8080/api/v1/constraints/active-trades/validate"

# Fix any issues
curl -X POST "http://localhost:8080/api/v1/constraints/active-trades/fix"

# Manual update of specific ticker
python3 -c "
from app import update_ticker_open_status
update_ticker_open_status(ticker_id)
"
```

## 🎯 **Benefits**

### **For Users**
- **Quick Filtering** - Easy to find active tickers
- **Real-time Updates** - Always current information
- **Consistent Data** - No manual maintenance required

### **For System**
- **Data Integrity** - Automatic consistency maintenance
- **Performance** - Fast queries without joins
- **Scalability** - Efficient for large datasets

## 🎨 **Frontend Integration**

### **Dynamic Constraints Display**
The database page now displays constraints dynamically from the API:

- **Real-time Loading**: Constraints are loaded from `/api/v1/constraints/` endpoint
- **Automatic Updates**: Constraints list updates automatically when page loads
- **Visual Indicators**: Different constraint types have distinct colors and icons:
  - `NOT_NULL` - Red with ⚠ icon
  - `UNIQUE` - Green with ✓ icon  
  - `FOREIGN_KEY` - Blue with 🔗 icon
  - `CHECK` - Orange with ✔ icon
  - `ENUM` - Turquoise with 📋 icon
  - `RANGE` - Purple with 📏 icon
  - `COMPUTED` - Orange (logo color) with 🔄 icon

### **Implementation Details**
- **JavaScript Functions**: `loadConstraints()`, `updateConstraintsDisplay()`, `updateTableConstraints()`
- **CSS Classes**: Added styles for new constraint types in `table.css`
- **HTML Structure**: Each table section has unique ID for targeting
- **API Integration**: Seamless integration with existing constraint management system

### **User Experience**
- **Immediate Feedback**: New constraints appear instantly in the UI
- **Consistent Styling**: All constraints follow the same visual pattern
- **Easy Identification**: The `active_trades_computed` constraint is clearly marked with 🔄 icon

## 📋 **API Reference**

### **Validation Endpoint**
```
GET /api/v1/constraints/active-trades/validate
```

**Response:**
```json
{
    "status": "success",
    "data": {
        "is_valid": true,
        "error_count": 0,
        "errors": []
    },
    "message": "Active trades constraint validation completed. Found 0 errors."
}
```

### **Fix Endpoint**
```
POST /api/v1/constraints/active-trades/fix
```

**Response:**
```json
{
    "status": "success",
    "data": {
        "fixed_count": 5
    },
    "message": "Fixed active_trades for 5 tickers"
}
```

## 🔗 **Related Components**

- **Dynamic Constraint System** - Base constraint management
- **Trade Service** - Trade status management
- **Trade Plan Service** - Plan status management
- **Validation Service** - Data validation framework
- **Trigger System** - Database trigger management

---

**Last Updated**: August 24, 2025  
**Version**: 1.0  
**Author**: TikTrack Development Team
