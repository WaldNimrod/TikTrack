# Linked Items System - Developer Guide

## Overview

Complete guide for developers working with the Linked Items system in TikTrack.

**Version**: 2.1.0  
**Date**: 2025-01-12  
**Architecture**: Configuration-Based Schema

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Quick Start](#quick-start)
3. [Schema Configuration](#schema-configuration)
4. [Backend Usage](#backend-usage)
5. [Frontend Usage](#frontend-usage)
6. [Adding New Relationships](#adding-new-relationships)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## System Architecture

### Components

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend Layer                       │
│  entity-details-api.js → entity-details-modal.js      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                    API Layer                            │
│  /api/linked-items/{type}/{id}                        │
│  /api/entity-details/{type}/{id}/linked-items         │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  Service Layer                          │
│  EntityDetailsService.get_linked_items()                │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  Resolver Layer                          │
│  EntityRelationshipResolver                             │
│  - Interprets schema                                    │
│  - Builds queries                                       │
│  - Formats results                                      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  Schema Layer                           │
│  entity_relationship_schema.py                          │
│  - Defines all relationships                            │
│  - Field definitions                                    │
│  - Formatting rules                                     │
└─────────────────────────────────────────────────────────┘
```

---

## Quick Start

### Backend: Get Linked Items

```python
from services.entity_details_service import EntityDetailsService
from sqlalchemy.orm import Session

db: Session = get_db()
linked_items = EntityDetailsService.get_linked_items(db, 'trade', 1)

# linked_items is a list of dictionaries conforming to canonical schema
for item in linked_items:
    print(f"{item['type']} #{item['id']}: {item['name']}")
```

### Frontend: Get Linked Items

```javascript
// Using EntityDetailsAPI
const linkedItems = await window.entityDetailsAPI.getLinkedItems('trade', 1);

// linkedItems is an array of linked item objects
linkedItems.forEach(item => {
    console.log(`${item.type} #${item.id}: ${item.name}`);
});
```

### API: Direct Call

```bash
curl http://localhost:8080/api/linked-items/trade/1

# Response:
{
    "child_entities": [...],
    "parent_entities": [...],
    "total_child_count": 5,
    "total_parent_count": 3
}
```

---

## Schema Configuration

### Understanding the Schema

The schema is defined in `Backend/services/entity_relationship_schema.py`:

```python
ENTITY_RELATIONSHIPS = {
    'trade': {
        'parents': {
            'trading_account': {...},
            'ticker': {...},
            'trade_plan': {...}
        },
        'children': {
            'execution': {...},
            'cash_flow': {...},
            'note': {...},
            'alert': {...}
        }
    }
}
```

### Relationship Types

1. **Direct**: `trade.trading_account_id → trading_account.id`
2. **Through**: `alert → PlanCondition → trade_plan`
3. **Conditional**: `alert → TradeCondition → trade`
4. **Legacy**: `note.related_type_id + note.related_id → entity`

See `ENTITY_RELATIONSHIP_SCHEMA.md` for detailed documentation.

---

## Backend Usage

### Basic Usage

```python
from services.entity_details_service import EntityDetailsService

# Get all linked items (parents + children)
linked_items = EntityDetailsService.get_linked_items(db, 'trade', 1)

# Filter by type
trades = [item for item in linked_items if item['type'] == 'trade']
executions = [item for item in linked_items if item['type'] == 'execution']
```

### With Entity Details

```python
# Get entity with linked items
entity_details = EntityDetailsService.get_entity_details(db, 'trade', 1)
linked_items = entity_details.get('linked_items', [])

# Or get separately
entity_details = EntityDetailsService.get_entity_details(db, 'trade', 1)
linked_items = EntityDetailsService.get_linked_items(db, 'trade', 1)
```

### Caching

Linked items are automatically cached for 3 minutes:

```python
# First call - fetches from database
linked_items1 = EntityDetailsService.get_linked_items(db, 'trade', 1)

# Second call within 3 minutes - returns cached data
linked_items2 = EntityDetailsService.get_linked_items(db, 'trade', 1)
```

---

## Frontend Usage

### EntityDetailsAPI

```javascript
// Get linked items
const linkedItems = await window.entityDetailsAPI.getLinkedItems('trade', 1);

// With options
const linkedItems = await window.entityDetailsAPI.getLinkedItems('trade', 1, {
    forceRefresh: true,  // Bypass cache
    expectedCount: 5     // For cache validation
});
```

### Entity Details Modal

```javascript
// Show entity details with linked items
window.showEntityDetails('trade', 1, {
    mode: 'view',
    includeLinkedItems: true
});
```

### Direct API Call

```javascript
// Direct fetch
const response = await fetch('/api/linked-items/trade/1');
const data = await response.json();

const allItems = [
    ...data.child_entities,
    ...data.parent_entities
];
```

---

## Adding New Relationships

### Example: Add Note → Trade Relationship

#### Step 1: Update Schema

```python
# In entity_relationship_schema.py
'trade': {
    'children': {
        # ... existing children
        'note': {
            'type': RELATIONSHIP_LEGACY,
            'field': 'related_type_id',
            'value': NOTE_RELATION_TYPE_TRADE,  # 2
            'required': False
        }
    }
}
```

#### Step 2: Test

```python
# Test the new relationship
linked_items = EntityDetailsService.get_linked_items(db, 'trade', 1)
notes = [item for item in linked_items if item['type'] == 'note']
assert len(notes) > 0
```

---

## Testing

### Unit Tests

```python
def test_trade_linked_items(db_session):
    """Test trade linked items"""
    linked_items = EntityDetailsService.get_linked_items(db_session, 'trade', 1)
    
    # Check structure
    assert isinstance(linked_items, list)
    for item in linked_items:
        assert 'id' in item
        assert 'type' in item
        assert 'name' in item
        assert 'title' in item
        assert 'status' in item
        assert 'created_at' in item
    
    # Check specific relationships
    trading_accounts = [item for item in linked_items if item['type'] == 'trading_account']
    assert len(trading_accounts) == 1
    
    executions = [item for item in linked_items if item['type'] == 'execution']
    assert len(executions) >= 0
```

### Integration Tests

```python
def test_linked_items_api(client):
    """Test linked items API endpoint"""
    response = client.get('/api/linked-items/trade/1')
    assert response.status_code == 200
    
    data = response.get_json()
    assert 'child_entities' in data
    assert 'parent_entities' in data
    assert isinstance(data['child_entities'], list)
    assert isinstance(data['parent_entities'], list)
```

### Frontend Tests

```javascript
// Test EntityDetailsAPI
describe('EntityDetailsAPI', () => {
    it('should fetch linked items', async () => {
        const items = await window.entityDetailsAPI.getLinkedItems('trade', 1);
        expect(Array.isArray(items)).toBe(true);
        expect(items.length).toBeGreaterThan(0);
    });
});
```

---

## Troubleshooting

### Common Issues

#### 1. No Linked Items Returned

**Symptoms**: Empty array returned

**Solutions**:
- Check schema definition
- Verify database relationships exist
- Check resolver logs
- Verify entity exists

#### 2. Missing Fields

**Symptoms**: Linked items missing required fields

**Solutions**:
- Check `LINKED_ITEM_FIELDS` definition
- Verify `_format_entity` method
- Review canonical schema

#### 3. Duplicate Items

**Symptoms**: Same item appears multiple times

**Solutions**:
- Check `prevent_duplicates` flag
- Review cascade logic
- Check `seen_ids` tracking

#### 4. Performance Issues

**Symptoms**: Slow response times

**Solutions**:
- Check cache hit rate
- Review query logs
- Consider adding indexes
- Review cascade complexity

### Debugging

#### Enable Debug Logging

```python
import logging
logging.getLogger('services.entity_relationship_resolver').setLevel(logging.DEBUG)
```

#### Check Schema

```python
from services.entity_relationship_schema import ENTITY_RELATIONSHIPS

# Check if entity type exists
if 'trade' in ENTITY_RELATIONSHIPS:
    schema = ENTITY_RELATIONSHIPS['trade']
    print(f"Parents: {list(schema.get('parents', {}).keys())}")
    print(f"Children: {list(schema.get('children', {}).keys())}")
```

#### Verify Relationships

```python
# Check database directly
from models.trade import Trade

trade = db.query(Trade).filter(Trade.id == 1).first()
print(f"Trading Account ID: {trade.trading_account_id}")
print(f"Ticker ID: {trade.ticker_id}")
print(f"Trade Plan ID: {trade.trade_plan_id}")
```

---

## Best Practices

### 1. Always Use Service Layer

✅ **Good**:
```python
linked_items = EntityDetailsService.get_linked_items(db, 'trade', 1)
```

❌ **Bad**:
```python
# Don't call resolver directly
from services.entity_relationship_resolver import EntityRelationshipResolver
resolver = EntityRelationshipResolver(ENTITY_RELATIONSHIPS)
linked_items = resolver.get_linked_items(db, 'trade', 1)
```

### 2. Handle Errors Gracefully

```python
try:
    linked_items = EntityDetailsService.get_linked_items(db, 'trade', 1)
except Exception as e:
    logger.error(f"Error getting linked items: {e}")
    linked_items = []
```

### 3. Cache When Possible

```python
# Cache is automatic, but you can force refresh if needed
linked_items = EntityDetailsService.get_linked_items(db, 'trade', 1)
# ... later, if data might have changed
linked_items = EntityDetailsService.get_linked_items(db, 'trade', 1, force_refresh=True)
```

### 4. Validate Results

```python
linked_items = EntityDetailsService.get_linked_items(db, 'trade', 1)

# Validate structure
for item in linked_items:
    assert 'id' in item
    assert 'type' in item
    assert 'name' in item
```

---

## Recent Changes (v2.1.0 - 2025-01-12)

### Bug Fixes

1. **Fixed AttributeError for Empty Lists**
   - **Issue**: `AttributeError: 'list' object has no attribute 'keys'` when `parents` or `children` were empty lists `[]`
   - **Fix**: Resolver now checks if `parents`/`children` are dictionaries or lists before calling `.keys()`
   - **Affected**: All entities with no parents/children (e.g., `trading_account`, `ticker`)

2. **Legacy Support for Parents**
   - **Issue**: Legacy support was only available for children, not parents
   - **Fix**: Added support for `legacy_support` in parent relationships
   - **Example**: `alert → trade` via `related_type_id=2` and `related_id` now works as a parent relationship

3. **Field Standardization**
   - **Issue**: Frontend expected all required fields to exist, even if `None`
   - **Fix**: `_format_entity` now ensures all required and optional fields exist in the item dictionary, even if their value is `None`
   - **Affected**: All linked items now have consistent structure

### Schema Updates

1. **Alert → Trade Legacy Support**
   - Added `legacy_support` to `alert` → `trade` parent relationship
   - Supports both conditional (via `TradeCondition`) and legacy (via `related_type_id`) relationships

2. **Execution → Ticker Required**
   - Updated `execution` → `ticker` parent relationship to `required: True`
   - Ensures all executions have a ticker parent

### Validation Improvements

1. **Enhanced Validation Logging**
   - Added detailed logging to `validate_linked_item` function
   - Logs warnings for missing required fields or invalid values
   - Helps debug validation failures

2. **Robust DateTime Formatting**
   - Improved `_format_datetime` to handle `None` values and various exceptions
   - Returns `None` gracefully instead of raising exceptions

---

## Related Documentation

- `ENTITY_RELATIONSHIP_SCHEMA.md` - Schema reference
- `documentation/systems/LINKED_ITEMS_SYSTEM.md` - System overview
- `documentation/frontend/LINKED_ITEMS_SYSTEM.md` - Frontend guide
- `documentation/05-REPORTS/LINKED_ITEMS_ADJUSTMENTS_NEEDED.md` - Migration guide

---

## Support

For questions or issues:
1. Check this guide
2. Review schema definitions
3. Check resolver logs
4. Contact development team

