# Open Plans Field for Tickers

## 📋 Overview

This feature adds an `open_plans` field to the tickers table that automatically tracks whether a ticker has any open trade plans. This provides fast access to planning status without needing to query the trade_plans table directly.

## 🎯 Purpose

- **Performance**: Fast filtering of tickers with open plans
- **Data Integrity**: Automatic updates ensure consistency
- **User Experience**: Real-time status updates for planning operations
- **Foundation**: Enables advanced planning features

## 🏗️ Architecture

### Database Schema Changes

```sql
-- Add open_plans field to tickers table
ALTER TABLE tickers ADD COLUMN open_plans BOOLEAN DEFAULT FALSE;

-- Create triggers for automatic updates
CREATE TRIGGER trigger_trade_plan_insert_open_plans
AFTER INSERT ON trade_plans
FOR EACH ROW
BEGIN
    UPDATE tickers 
    SET open_plans = (
        SELECT COUNT(*) > 0 
        FROM trade_plans 
        WHERE trade_plans.ticker_id = NEW.ticker_id 
        AND trade_plans.status = 'open'
    ),
    updated_at = datetime('now')
    WHERE tickers.id = NEW.ticker_id;
END;

CREATE TRIGGER trigger_trade_plan_update_open_plans
AFTER UPDATE ON trade_plans
FOR EACH ROW
BEGIN
    UPDATE tickers 
    SET open_plans = (
        SELECT COUNT(*) > 0 
        FROM trade_plans 
        WHERE trade_plans.ticker_id = NEW.ticker_id 
        AND trade_plans.status = 'open'
    ),
    updated_at = datetime('now')
    WHERE tickers.id = NEW.ticker_id;
END;

CREATE TRIGGER trigger_trade_plan_delete_open_plans
AFTER DELETE ON trade_plans
FOR EACH ROW
BEGIN
    UPDATE tickers 
    SET open_plans = (
        SELECT COUNT(*) > 0 
        FROM trade_plans 
        WHERE trade_plans.ticker_id = OLD.ticker_id 
        AND trade_plans.status = 'open'
    ),
    updated_at = datetime('now')
    WHERE tickers.id = OLD.ticker_id;
END;
```

### Model Changes

```python
# In ticker.py model
class Ticker(BaseModel):
    # ... existing fields ...
    open_plans = Column(Boolean, default=False, nullable=True, 
                       comment="Whether there are open trade plans")
```

### SQLAlchemy Event Listeners

```python
# In trade_plan.py model
@event.listens_for(TradePlan, 'after_insert')
def trade_plan_inserted(mapper, connection, target):
    """Update open_plans field when trade plan is inserted"""
    if target.status == 'open':
        update_ticker_open_plans(connection.session, target.ticker_id)

@event.listens_for(TradePlan, 'after_update')
def trade_plan_updated(mapper, connection, target):
    """Update open_plans field when trade plan is updated"""
    update_ticker_open_plans(connection.session, target.ticker_id)

@event.listens_for(TradePlan, 'after_delete')
def trade_plan_deleted(mapper, connection, target):
    """Update open_plans field when trade plan is deleted"""
    update_ticker_open_plans(connection.session, target.ticker_id)
```

## 🔧 Implementation Steps

### 1. Database Migration
- [ ] Create migration script for schema changes
- [ ] Add open_plans field to tickers table
- [ ] Create database triggers
- [ ] Update existing data

### 2. Model Updates
- [ ] Update Ticker model with open_plans field
- [ ] Add SQLAlchemy event listeners to TradePlan model
- [ ] Create helper functions for field updates

### 3. API Updates
- [ ] Include open_plans in ticker API responses
- [ ] Add filtering by open_plans status
- [ ] Update ticker creation/update endpoints

### 4. UI Updates
- [ ] Display open_plans status in ticker lists
- [ ] Add filtering options for open plans
- [ ] Update ticker detail views

### 5. Testing
- [ ] Unit tests for triggers and event listeners
- [ ] Integration tests for API endpoints
- [ ] UI tests for display and filtering

## 📊 Data Flow

```
Trade Plan Operation → Database Trigger → Update Ticker.open_plans → API Response → UI Update
```

1. **User creates/updates/deletes trade plan**
2. **Database trigger fires automatically**
3. **Ticker.open_plans field updated**
4. **API returns updated ticker data**
5. **UI reflects changes immediately**

## 🎨 UI Integration

### Ticker List Display
```html
<div class="ticker-item">
    <span class="ticker-symbol">{{ ticker.symbol }}</span>
    <span class="ticker-name">{{ ticker.name }}</span>
    <div class="ticker-status">
        <span class="badge badge-success" v-if="ticker.active_trades">Active Trades</span>
        <span class="badge badge-info" v-if="ticker.open_plans">Open Plans</span>
    </div>
</div>
```

### Filtering Options
```javascript
// Filter tickers with open plans
const tickersWithOpenPlans = tickers.filter(ticker => ticker.open_plans);

// Filter tickers with both active trades and open plans
const activeTickers = tickers.filter(ticker => 
    ticker.active_trades || ticker.open_plans
);
```

## 🔍 Performance Benefits

### Before Implementation
```sql
-- Slow query requiring JOIN
SELECT t.* FROM tickers t
JOIN trade_plans tp ON t.id = tp.ticker_id
WHERE tp.status = 'open'
GROUP BY t.id;
```

### After Implementation
```sql
-- Fast query using indexed field
SELECT * FROM tickers 
WHERE open_plans = TRUE;
```

## 🧪 Testing Strategy

### Unit Tests
```python
def test_trade_plan_insert_updates_open_plans():
    """Test that inserting open trade plan updates ticker.open_plans"""
    # Test implementation

def test_trade_plan_status_change_updates_open_plans():
    """Test that changing trade plan status updates ticker.open_plans"""
    # Test implementation

def test_trade_plan_delete_updates_open_plans():
    """Test that deleting trade plan updates ticker.open_plans"""
    # Test implementation
```

### Integration Tests
```python
def test_api_returns_open_plans_field():
    """Test that ticker API includes open_plans field"""
    # Test implementation

def test_filtering_by_open_plans():
    """Test filtering tickers by open_plans status"""
    # Test implementation
```

## 📈 Monitoring

### Key Metrics
- Trigger execution time
- Field update frequency
- API response times
- Data consistency checks

### Logging
```python
logger.info(f"Updated ticker {ticker.symbol} open_plans to: {ticker.open_plans}")
logger.warning(f"Trigger execution time: {execution_time}ms")
logger.error(f"Failed to update open_plans for ticker {ticker_id}")
```

## 🔄 Migration Strategy

### Phase 1: Schema Update
1. Add open_plans field with default value
2. Create database triggers
3. Update existing data

### Phase 2: Application Updates
1. Update models and event listeners
2. Update API endpoints
3. Update UI components

### Phase 3: Validation
1. Run consistency checks
2. Monitor performance
3. Validate data integrity

## 🚀 Future Enhancements

### Advanced Features
- [ ] Open plans count field (not just boolean)
- [ ] Last plan update timestamp
- [ ] Plan priority indicators
- [ ] Plan expiration tracking

### Performance Optimizations
- [ ] Batch updates for multiple changes
- [ ] Caching strategies
- [ ] Index optimization
- [ ] Query optimization

---

**Author:** TikTrack Development Team  
**Version:** 1.0  
**Date:** 2025-08-25  
**Status:** 🟡 Planned
