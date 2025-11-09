# Entity Relationship Schema - Developer Guide

## Overview

The Entity Relationship Schema is a centralized, configuration-based system for managing relationships between entities in the TikTrack system. It replaces the previous Strategy Pattern approach with a unified, maintainable architecture.

**Version**: 1.1.0  
**Date**: 2025-01-12  
**Status**: Production Ready

---

## Architecture

### Components

1. **`entity_relationship_schema.py`** - Central schema definition
2. **`entity_relationship_resolver.py`** - Generic resolver that interprets the schema
3. **`EntityDetailsService.get_linked_items()`** - Public API that uses the resolver

### Flow

```
Frontend Request
    ↓
/api/linked-items/{type}/{id}
    ↓
EntityDetailsService.get_linked_items()
    ↓
EntityRelationshipResolver.get_linked_items()
    ↓
Schema Interpretation → Query Building → Result Formatting
    ↓
Canonical Linked Items Array
```

---

## Schema Structure

### Entity Definition

Each entity in the schema has:
- **`parents`**: Dictionary of parent relationships (or empty list `[]` if no parents)
- **`children`**: Dictionary of child relationships (or empty list `[]` if no children)

**Note**: The resolver handles both dictionary and list formats. Empty lists `[]` are used to explicitly indicate no relationships, while dictionaries contain the actual relationship definitions.

### Relationship Types

#### 1. Direct Relationship (`RELATIONSHIP_DIRECT`)
Direct foreign key relationship.

**Example**: `trade.trading_account_id → trading_account.id`

```python
'trading_account': {
    'type': RELATIONSHIP_DIRECT,
    'field': 'trading_account_id',
    'query': 'Trade.trading_account_id == {entity_id}',
    'required': True
}
```

#### 2. Through Relationship (`RELATIONSHIP_THROUGH`)
Relationship via intermediate entity.

**Example**: `trade_plan → PlanCondition → alert`

```python
'alert': {
    'type': RELATIONSHIP_CONDITIONAL,  # Uses through logic
    'field': 'plan_condition_id',
    'through': 'PlanCondition',
    'query': 'PlanCondition.trade_plan_id == {entity_id}',
    'target_query': 'Alert.plan_condition_id == PlanCondition.id',
    'required': False
}
```

#### 3. Conditional Relationship (`RELATIONSHIP_CONDITIONAL`)
Similar to through, but uses condition tables (TradeCondition, PlanCondition).

**Example**: `alert → TradeCondition → trade`

#### 4. Legacy Relationship (`RELATIONSHIP_LEGACY`)
Uses `related_type_id` and `related_id` fields.

**Example**: `note.related_type_id == 2 AND note.related_id == trade.id`

```python
'note': {
    'type': RELATIONSHIP_LEGACY,
    'field': 'related_type_id',
    'value': NOTE_RELATION_TYPE_TRADE,  # 2
    'query': 'Note.related_type_id == {relation_type_id} AND Note.related_id == {entity_id}',
    'required': False
}
```

### Relationship Options

- **`required`**: Whether the relationship is mandatory
- **`prevent_duplicates`**: Prevent duplicate entries (e.g., ticker added both directly and through trade)
- **`cascade_ticker`**: If parent exists, also add its ticker
- **`cascade_account`**: If parent exists, also add its trading_account
- **`cascade_plan`**: If trade exists, also add its trade_plan
- **`legacy_support`**: Additional legacy relationship for backward compatibility

---

## Canonical Linked Item Schema

All linked items conform to this structure:

```python
{
    'id': int,                    # Required
    'type': str,                  # Required: 'trade' | 'trade_plan' | 'execution' | etc.
    'name': str,                  # Required: Display name
    'title': str,                 # Required: Display title
    'description': Optional[str], # Optional: Detailed description
    'status': str,                # Required: 'open' | 'closed' | 'cancelled' | 'active'
    'side': Optional[str],        # Optional: 'Long' | 'Short' | 'buy' | 'sell'
    'investment_type': Optional[str], # Optional: 'swing' | 'passive' | 'day'
    'created_at': str,           # Required: ISO format datetime
    'updated_at': Optional[str],  # Optional: ISO format datetime
    
    # Entity-specific fields (optional):
    'amount': Optional[float],           # For cash_flow
    'currency_symbol': Optional[str],     # For cash_flow
    'is_triggered': Optional[str],        # For alert: 'false' | 'new' | 'true'
    'content': Optional[str],             # For note
    'action': Optional[str],              # For execution: 'buy' | 'sell'
    'date': Optional[str],                # For execution/cash_flow: ISO format date
    'ticker_symbol': Optional[str],       # For trade/trade_plan/execution
}
```

---

## Usage Examples

### Backend: Getting Linked Items

```python
from services.entity_details_service import EntityDetailsService
from sqlalchemy.orm import Session

# Get linked items for a trade
db: Session = get_db()
linked_items = EntityDetailsService.get_linked_items(db, 'trade', 1)

# Result: List of dictionaries conforming to canonical schema
for item in linked_items:
    print(f"{item['type']} #{item['id']}: {item['name']}")
```

### Frontend: Using Linked Items API

```javascript
// Get linked items
const linkedItems = await window.entityDetailsAPI.getLinkedItems('trade', 1);

// Result: Array of linked items
linkedItems.forEach(item => {
    console.log(`${item.type} #${item.id}: ${item.name}`);
});
```

### API Endpoint

```bash
# Get linked items
GET /api/linked-items/trade/1

# Response:
{
    "child_entities": [...],  # Children (executions, notes, alerts)
    "parent_entities": [...],  # Parents (trading_account, ticker, trade_plan)
    "total_child_count": 5,
    "total_parent_count": 3
}
```

---

## Adding New Relationships

### Step 1: Update Schema

Add relationship to `ENTITY_RELATIONSHIPS` in `entity_relationship_schema.py`:

```python
'new_entity': {
    'parents': {
        'parent_type': {
            'type': RELATIONSHIP_DIRECT,
            'field': 'parent_id',
            'required': True
        }
    },
    'children': {
        'child_type': {
            'type': RELATIONSHIP_DIRECT,
            'field': 'new_entity_id',
            'required': False
        }
    }
}
```

### Step 2: Add Field Definitions

Add field definitions to `LINKED_ITEM_FIELDS`:

```python
'new_entity': {
    'required': ['id', 'type', 'name', 'title', 'status', 'created_at'],
    'optional': ['description', 'updated_at'],
    'never': ['side', 'investment_type']
}
```

### Step 3: Add Formatting Rules

Add formatting rules to `FIELD_FORMATTERS` if needed:

```python
'name': {
    'new_entity': lambda item: item.get('custom_field') or f"New Entity #{item['id']}",
    # ...
}
```

### Step 4: Add Model Mapping

Add model to `MODEL_MAP` in `entity_relationship_resolver.py`:

```python
MODEL_MAP = {
    # ...
    'new_entity': NewEntity
}
```

### Step 5: Test

Test the new relationship:

```python
linked_items = EntityDetailsService.get_linked_items(db, 'new_entity', 1)
assert len(linked_items) > 0
```

---

## Special Cases

### Alert → Trade via Ticker

Alerts link to trades through `ticker_id` (both have `ticker_id`, find trades with same ticker):

```python
'trade': {
    'type': RELATIONSHIP_DIRECT,
    'field': 'ticker_id',  # Special handling: uses alert's ticker_id
    'prevent_duplicates': True
}
```

### Execution → Trade → Ticker Cascade

When execution has a trade, also add the trade's ticker:

```python
'trade': {
    'type': RELATIONSHIP_DIRECT,
    'field': 'trade_id',
    'cascade_ticker': True  # Adds ticker from trade
}
```

### Legacy Support

Some relationships support both new and legacy linking. Legacy support can be used for both **parents** and **children**:

**For Children** (e.g., alert → note):
```python
'note': {
    'type': RELATIONSHIP_CONDITIONAL,
    # ... new relationship
    'legacy_support': {
        'type': RELATIONSHIP_LEGACY,
        'field': 'related_type_id',
        'value': NOTE_RELATION_TYPE_ALERT,
        # ... legacy relationship
    }
}
```

**For Parents** (e.g., alert → trade):
```python
'trade': {
    'type': RELATIONSHIP_CONDITIONAL,
    'field': 'trade_condition_id',
    # ... new relationship via TradeCondition
    'legacy_support': {
        'type': RELATIONSHIP_LEGACY,
        'field': 'related_type_id',
        'value': NOTE_RELATION_TYPE_TRADE,  # 2
        'query': 'Alert.related_type_id == {relation_type_id} AND Alert.related_id == {entity_id}',
        'required': False
    }
}
```

**How Legacy Support Works**:
1. The resolver first attempts the primary relationship (e.g., conditional via `trade_condition_id`)
2. If the primary relationship returns no results (e.g., `trade_condition_id` is NULL), it falls back to legacy support
3. Legacy support uses `related_type_id` and `related_id` fields to find relationships
4. Both results are combined, with duplicates prevented by `prevent_duplicates` flag

---

## Performance Considerations

### Caching

- Linked items are cached for 3 minutes (180 seconds)
- Cache key: `linked-items-{entity_type}-{entity_id}`
- Cache invalidation: Automatic after TTL

### Query Optimization

- Uses SQLAlchemy `joinedload` for eager loading
- Prevents N+1 queries
- Batch fetches related entities

### Duplicate Prevention

- Uses `seen_ids` set to track `(type, id)` pairs
- Prevents duplicate entries in cascade scenarios

---

## Troubleshooting

### No Linked Items Returned

1. Check schema definition for entity type
2. Verify relationship configuration
3. Check database for actual relationships
4. Review resolver logs for errors
5. **Check if `parents` or `children` are empty lists** - The resolver handles both dictionaries and empty lists `[]`

### Duplicate Items

1. Check `prevent_duplicates` flag in schema
2. Verify cascade logic
3. Review `seen_ids` tracking

### Missing Fields

1. Check `LINKED_ITEM_FIELDS` definition
2. Verify `_format_entity` method ensures all required fields exist (even if `None`)
3. Review canonical schema requirements - all required fields must exist in the item dictionary

### Performance Issues

1. Check cache hit rate
2. Review query logs
3. Consider adding indexes
4. Review cascade logic complexity

### AttributeError: 'list' object has no attribute 'keys'

**Fixed in v1.1.0**: The resolver now checks if `parents` or `children` are dictionaries or lists before calling `.keys()`. Empty lists `[]` are handled gracefully.

**If you see this error**:
1. Check the schema definition - ensure `parents` and `children` are either dictionaries or empty lists
2. Verify the resolver code is up to date (v1.1.0+)
3. Check server logs for the exact entity type causing the issue

---

## Migration Notes

### From Old System

The old system used separate `_get_X_linked_items` functions. These have been replaced by the schema-based resolver.

**Old Code**:
```python
linked_items = EntityDetailsService._get_trade_linked_items(db, trade_id)
```

**New Code**:
```python
linked_items = EntityDetailsService.get_linked_items(db, 'trade', trade_id)
```

### Backward Compatibility

- Old endpoint `/api/linked-items/{type}/{id}` still works
- Returns `child_entities` and `parent_entities` separated
- Frontend code doesn't need changes

---

## Related Documentation

- `documentation/systems/LINKED_ITEMS_SYSTEM.md` - System overview
- `documentation/frontend/LINKED_ITEMS_SYSTEM.md` - Frontend usage
- `documentation/05-REPORTS/LINKED_ITEMS_ADJUSTMENTS_NEEDED.md` - Migration guide

---

## Support

For questions or issues:
1. Check this documentation
2. Review schema definitions
3. Check resolver logs
4. Contact development team

