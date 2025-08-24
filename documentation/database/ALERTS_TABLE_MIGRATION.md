# Alerts Table Migration - August 2025

## Overview
This document describes the migration of the alerts table from the old structure with a single `condition` field to a new structure with three separate condition fields for better flexibility and validation.

## Changes Made

### 1. Removed Fields
- **`condition`** (VARCHAR(500)) - Old single condition field with CHECK constraint

### 2. Added Fields
- **`condition_attribute`** (VARCHAR(50)) - The attribute to monitor (price, change, ma, volume)
- **`condition_operator`** (VARCHAR(50)) - The comparison operator (more_than, less_than, cross, etc.)
- **`condition_number`** (DECIMAL(10,2)) - The numeric value for comparison

### 3. Database Schema Changes

#### Old Schema
```sql
CREATE TABLE alerts (
    account_id INTEGER,
    ticker_id INTEGER,
    type VARCHAR(50) NOT NULL,
    condition VARCHAR(500) NOT NULL CHECK (
        condition IN (
            'above', 'below', 'equals',
            'price_target', 'stop_loss', 'profit_target',
            'balance_low', 'profit_milestone',
            'breakout', 'breakdown',
            'daily_change_positive', 'daily_change_negative',
            'volume_high', 'volume_low',
            'entry_condition', 'exit_condition',
            'moving_average_cross', 'rsi_overbought', 'rsi_oversold',
            'macd_signal', 'bollinger_upper', 'bollinger_lower'
        )
    ),
    message VARCHAR(500),
    is_active BOOLEAN,
    triggered_at DATETIME,
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'open',
    is_triggered VARCHAR(20) DEFAULT 'false',
    related_type_id INTEGER,
    related_id INTEGER,
    type_default VARCHAR(50) DEFAULT 'price',
    related_type_id_default INTEGER DEFAULT 4
);
```

#### New Schema
```sql
CREATE TABLE alerts (
    account_id INTEGER,
    ticker_id INTEGER,
    type VARCHAR(50) NOT NULL,
    message VARCHAR(500),
    is_active BOOLEAN,
    triggered_at DATETIME,
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'open',
    is_triggered VARCHAR(20) DEFAULT 'false',
    related_type_id INTEGER,
    related_id INTEGER,
    type_default VARCHAR(50) DEFAULT 'price',
    related_type_id_default INTEGER DEFAULT 4,
    condition_attribute VARCHAR(50),
    condition_operator VARCHAR(50),
    condition_number DECIMAL(10,2)
);
```

## Validation Rules

### condition_attribute
Valid values:
- `price` - Price monitoring
- `change` - Change percentage monitoring
- `ma` - Moving average monitoring
- `volume` - Volume monitoring

### condition_operator
Valid values:
- `more_than` - Greater than comparison
- `less_than` - Less than comparison
- `equals` - Equal comparison
- `cross` - Crossing comparison
- `cross_up` - Crossing upward
- `cross_down` - Crossing downward
- `change` - Change comparison
- `change_up` - Positive change
- `change_down` - Negative change

### condition_number
- Must be a valid decimal number
- Must be greater than or equal to 0

## Backward Compatibility

The system maintains backward compatibility by:
1. Creating a legacy `condition` field in the API response using the format: `"{condition_attribute} | {condition_operator} | {condition_number}"`
2. Supporting both old and new field formats in the frontend
3. Automatically converting old condition strings to new field format

## Migration Scripts

### 1. Database Migration
```bash
# Remove old condition field and add new fields
sqlite3 Backend/db/simpleTrade_new.db "
CREATE TABLE alerts_new AS SELECT 
    account_id, ticker_id, type, message, is_active, triggered_at, 
    id, created_at, status, is_triggered, related_type_id, related_id, 
    type_default, related_type_id_default, condition_attribute, 
    condition_operator, condition_number 
FROM alerts; 
DROP TABLE alerts; 
ALTER TABLE alerts_new RENAME TO alerts;
"
```

### 2. Create Sample Data
```bash
cd Backend
python3 create_simple_alerts.py
```

## API Changes

### Response Format
The API now returns both old and new formats:

```json
{
  "id": 1,
  "type": "price_alert",
  "condition": "price | more_than | 180.50",  // Legacy format
  "condition_attribute": "price",              // New format
  "condition_operator": "more_than",           // New format
  "condition_number": "180.50",                // New format
  "condition_display_text": "מחיר יותר מ 180.50", // Hebrew display
  "message": "AAPL הגיע ליעד מחיר של 180.50",
  "status": "open",
  "is_triggered": "false",
  "related_type_id": 4,
  "related_id": 1
}
```

## Frontend Changes

### 1. Translation Functions
Updated `condition-translator.js` to handle new field format:
- `translateConditionFields(attribute, operator, number)` - Translate new fields
- `translateLegacyCondition(conditionString)` - Translate legacy format

### 2. Display Format
Updated alert display to show:
- **Trades**: `טרייד | [צד] | [סוג השקעה] | [תאריך]`
- **Trade Plans**: `תוכנית | [צד] | [סוג השקעה] | [תאריך]`
- **Tickers**: `[סימבול]`
- **Accounts**: `[שם חשבון] ([מטבע])`

## Testing

### 1. Database Validation
```bash
cd Backend
python3 validate_alerts_compatibility.py
```

### 2. Frontend Testing
- Verify all 10 alerts display correctly
- Test filtering by status, type, and search
- Test sorting by all columns
- Verify condition translation works
- Test CRUD operations

## Benefits

1. **Better Validation**: Separate fields allow for more precise validation
2. **Flexibility**: Easy to add new condition types and operators
3. **Internationalization**: Better support for Hebrew translation
4. **Performance**: More efficient queries and indexing
5. **Maintainability**: Cleaner code structure

## Rollback Plan

If issues arise, the system can be rolled back by:
1. Restoring the old table structure
2. Converting new fields back to legacy format
3. Updating API responses
4. Reverting frontend changes

## Files Modified

### Backend
- `Backend/models/alert.py` - Updated model definition
- `Backend/services/alert_service.py` - Updated service logic
- `Backend/create_simple_alerts.py` - Updated sample data creation

### Frontend
- `trading-ui/scripts/alerts.js` - Updated display logic
- `trading-ui/scripts/condition-translator.js` - Updated translation functions

### Documentation
- `documentation/database/ALERTS_TABLE_MIGRATION.md` - This file


