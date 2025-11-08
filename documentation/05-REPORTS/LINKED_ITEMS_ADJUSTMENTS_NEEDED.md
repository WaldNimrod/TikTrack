# Linked Items System - Per-Entity Adjustments Needed

## Overview
This document lists all backend and frontend adjustments needed for each entity type to align with the new Configuration-Based Schema Architecture.

**Date**: 2025-11-08  
**Status**: Planning Phase  
**Related**: `entity_relationship_schema.py`, `entity_relationship_resolver.py` (to be created)

---

## Backend Adjustments

### 1. EntityDetailsService (`Backend/services/entity_details_service.py`)

#### Current State
- Uses Strategy Pattern with separate `_get_X_linked_items` functions for each entity type
- Each function has custom logic, formatting, and field selection
- Inconsistent handling of relationships (direct FK, through relationships, legacy relationships)
- Code duplication across functions
- Hard to maintain and extend

#### Required Changes

##### 1.1 Remove All `_get_X_linked_items` Functions
**Files to modify**: `Backend/services/entity_details_service.py`

**Functions to remove**:
- `_get_ticker_linked_items` (lines ~1071-1199)
- `_get_trade_linked_items` (lines ~1202-1264)
- `_get_trade_plan_linked_items` (lines ~1267-1374)
- `_get_account_linked_items` (lines ~1377-1520)
- `_get_alert_linked_items` (lines ~1523-1671)
- `_get_execution_linked_items` (lines ~1674-1782)
- `_get_cash_flow_linked_items` (lines ~1785-1870)
- `_get_note_linked_items` (lines ~1046-1068)

**Replacement**: Use `EntityRelationshipResolver.get_linked_items()` instead

##### 1.2 Update `get_linked_items` Method
**Current implementation** (lines 643-696):
```python
@staticmethod
@cache_for(ttl=180)
def get_linked_items(db: Session, entity_type: str, entity_id: int) -> List[Dict[str, Any]]:
    # Strategy pattern with if/elif chain
    if entity_type == 'ticker':
        linked_items.extend(EntityDetailsService._get_ticker_linked_items(db, entity_id))
    # ... etc
```

**New implementation**:
```python
@staticmethod
@cache_for(ttl=180)
def get_linked_items(db: Session, entity_type: str, entity_id: int) -> List[Dict[str, Any]]:
    from services.entity_relationship_resolver import EntityRelationshipResolver
    from services.entity_relationship_schema import ENTITY_RELATIONSHIPS
    
    resolver = EntityRelationshipResolver(ENTITY_RELATIONSHIPS)
    return resolver.get_linked_items(db, entity_type, entity_id)
```

##### 1.3 Fix Note Relationship Field References
**Issue**: Some functions still reference `Note.linked_object_type` and `Note.linked_object_id` instead of `Note.related_type_id` and `Note.related_id`

**Affected functions**:
- `_get_trade_linked_items` (line 1248-1251) - Uses `Note.linked_object_type == 'trade'`
- `_get_trade_plan_linked_items` (line 1315-1318) - Uses `Note.linked_object_type == 'trade_plan'`
- `_get_alert_linked_items` (line 1653-1656) - Uses `Note.linked_object_type == 'alert'`

**Fix**: Schema already uses correct `related_type_id` and `related_id` fields

---

## Frontend Adjustments

### 2. EntityDetailsAPI (`trading-ui/scripts/entity-details-api.js`)

#### Current State
- Uses `enrichLinkedItems` function to map backend data to frontend fields
- Caches linked items with `linkedItemsCacheMeta` for consistency checking
- Merges `child_entities` and `parent_entities` from `/api/linked-items/{type}/{id}` endpoint
- Uses `UnifiedCacheManager` with 5-minute TTL

#### Required Changes

##### 2.1 Update `enrichLinkedItems` Function
**Current**: Maps various backend field names to frontend fields  
**New**: Should work with standardized schema output (already mostly compatible)

**Fields to ensure**:
- `id`, `type`, `name`, `title`, `description`, `status` - Required
- `side`, `investment_type`, `created_at`, `updated_at` - Optional
- Entity-specific fields (`amount`, `currency_symbol`, `is_triggered`, `content`, `action`, `date`, `ticker_symbol`) - Optional

**Action**: Verify `enrichLinkedItems` handles all canonical schema fields correctly

##### 2.2 Verify Cache Consistency
**Current**: Checks `expectedCount` against `cachedData.length`  
**New**: Should work with new resolver output (same structure)

**Action**: Test cache invalidation logic with new backend output

##### 2.3 Update API Endpoint Usage
**Current**: Uses `/api/linked-items/{type}/{id}` which merges `child_entities` and `parent_entities`  
**New**: Backend will return unified `linked_items` array (same structure)

**Action**: Verify frontend handles unified array correctly (should already work)

---

### 3. EntityDetailsRenderer (`trading-ui/scripts/entity-details-renderer.js`)

#### Current State
- Processes linked items array from `EntityDetailsAPI`
- Enriches items, sorts them, and renders into table
- Uses `_enrichLinkedItem`, `_resolveLinkedItemSource`, `formatLinkedItemName`, etc.

#### Required Changes

##### 3.1 Verify Field Mapping
**Current**: Expects fields like `name`, `title`, `description`, `status`, `side`, `investment_type`  
**New**: Schema ensures these fields are always present

**Action**: Test rendering with new schema output

##### 3.2 Verify Entity-Specific Rendering
**Current**: Handles entity-specific fields (`amount`, `currency_symbol`, `is_triggered`, `content`, `action`, `date`)  
**New**: Schema includes these fields when applicable

**Action**: Test rendering for each entity type

---

### 4. EntityDetailsModal (`trading-ui/scripts/entity-details-modal.js`)

#### Current State
- Calls `window.entityDetailsAPI.getLinkedItems` with `options.expectedCount`
- Displays linked items in modal

#### Required Changes

##### 4.1 Verify Modal Display
**Current**: Displays linked items from `EntityDetailsAPI`  
**New**: Should work with new schema output (same structure)

**Action**: Test modal display for all entity types

---

## Per-Entity Specific Adjustments

### Ticker (`ticker`)

#### Backend
- **Current**: `_get_ticker_linked_items` fetches trades, trade_plans, alerts, executions (direct and through trades), notes
- **Schema**: Defines same relationships
- **Action**: Verify resolver handles all relationships correctly

#### Frontend
- **Current**: Renders ticker linked items correctly
- **Action**: Test with new schema output

---

### Trade (`trade`)

#### Backend
- **Current**: `_get_trade_linked_items` fetches:
  - Parents: `trading_account`, `ticker` (via direct FK)
  - Children: `execution`, `note` (via `Note.linked_object_type` - **WRONG FIELD**)
- **Schema**: Defines:
  - Parents: `trading_account`, `ticker`, `trade_plan` (via direct FK)
  - Children: `execution`, `cash_flow`, `note` (via `related_type_id`), `alert` (via `TradeCondition`)
- **Action**: 
  - Fix note relationship to use `related_type_id` instead of `linked_object_type`
  - Add `trade_plan` as parent
  - Add `cash_flow` as child
  - Add `alert` as child (via `TradeCondition`)

#### Frontend
- **Current**: Renders trade linked items
- **Action**: Test with new relationships (trade_plan parent, cash_flow child, alert child)

---

### Trade Plan (`trade_plan`)

#### Backend
- **Current**: `_get_trade_plan_linked_items` fetches:
  - Parents: `trading_account`, `ticker` (via direct FK)
  - Children: `trade` (same ticker), `note` (via `Note.linked_object_type` - **WRONG FIELD**), `alert` (via `PlanCondition` and legacy)
- **Schema**: Defines:
  - Parents: `trading_account`, `ticker` (via direct FK)
  - Children: `trade`, `note` (via `related_type_id`), `alert` (via `PlanCondition` and legacy)
- **Action**:
  - Fix note relationship to use `related_type_id` instead of `linked_object_type`
  - Verify alert relationships (both `PlanCondition` and legacy)

#### Frontend
- **Current**: Renders trade plan linked items
- **Action**: Test with corrected note relationship

---

### Trading Account (`trading_account`)

#### Backend
- **Current**: `_get_account_linked_items` fetches:
  - Children: `trade`, `trade_plan`, `execution`, `cash_flow`, `alert` (via `related_type_id`), `note` (via `related_type_id`)
- **Schema**: Defines same relationships
- **Action**: Verify resolver handles all relationships correctly

#### Frontend
- **Current**: Renders account linked items correctly
- **Action**: Test with new schema output

---

### Execution (`execution`)

#### Backend
- **Current**: `_get_execution_linked_items` fetches:
  - Parents: `trading_account`, `trade` (via direct FK), `ticker` (via direct FK or through trade, with duplicate prevention)
- **Schema**: Defines:
  - Parents: `trading_account`, `ticker` (with `prevent_duplicates`), `trade` (with `cascade_ticker`)
- **Action**: 
  - Verify resolver handles `prevent_duplicates` and `cascade_ticker` correctly
  - Ensure ticker is always added if `ticker_id` exists, even if also linked through trade

#### Frontend
- **Current**: Renders execution linked items correctly
- **Action**: Test with new schema output

---

### Cash Flow (`cash_flow`)

#### Backend
- **Current**: `_get_cash_flow_linked_items` fetches:
  - Parents: `trading_account`, `trade` (via direct FK), `ticker` (through trade, with duplicate prevention)
- **Schema**: Defines:
  - Parents: `trading_account`, `trade` (with `cascade_ticker`)
- **Action**: 
  - Verify resolver handles `cascade_ticker` correctly
  - Ensure ticker is added when trade exists

#### Frontend
- **Current**: Renders cash flow linked items correctly
- **Action**: Test with new schema output

---

### Alert (`alert`)

#### Backend
- **Current**: `_get_alert_linked_items` fetches:
  - Parents: `ticker` (via direct FK), `trading_account` (via `plan_condition` -> `trade_plan` or `trade_condition` -> `trade`), `trade_plan` (via `plan_condition` or `trade`), `trade` (via `trade_condition`)
  - Children: `trade` (same ticker), `note` (via `Note.linked_object_type` - **WRONG FIELD**)
- **Schema**: Defines:
  - Parents: `ticker`, `trade_plan` (via `PlanCondition` with `cascade_account`), `trade` (via `TradeCondition` with `cascade_account` and `cascade_plan`), `trading_account` (legacy with `prevent_duplicates`)
  - Children: `trade` (same ticker with `prevent_duplicates`), `note` (via `related_type_id`)
- **Action**:
  - Fix note relationship to use `related_type_id` instead of `linked_object_type`
  - Verify resolver handles `cascade_account`, `cascade_plan`, and `prevent_duplicates` correctly

#### Frontend
- **Current**: Renders alert linked items
- **Action**: Test with corrected note relationship and new cascade logic

---

### Note (`note`)

#### Backend
- **Current**: `_get_note_linked_items` fetches:
  - Parent: Dynamic based on `related_type_id` and `related_id`
- **Schema**: Defines:
  - Parent: Dynamic based on `related_type_id` and `related_id`
- **Action**: Verify resolver handles dynamic parent resolution correctly

#### Frontend
- **Current**: Renders note linked items correctly
- **Action**: Test with new schema output

---

## Summary of Critical Issues

### 1. Note Relationship Field Mismatch
**Severity**: HIGH  
**Affected Entities**: `trade`, `trade_plan`, `alert`  
**Issue**: Code uses `Note.linked_object_type` and `Note.linked_object_id` but model uses `Note.related_type_id` and `Note.related_id`  
**Fix**: Schema uses correct fields, resolver will fix this

### 2. Missing Relationships
**Severity**: MEDIUM  
**Affected Entities**: `trade`  
**Issue**: Missing `trade_plan` as parent, `cash_flow` and `alert` as children  
**Fix**: Schema includes these relationships

### 3. Cascade Logic
**Severity**: MEDIUM  
**Affected Entities**: `execution`, `cash_flow`, `alert`  
**Issue**: Complex cascade logic (e.g., execution -> trade -> ticker, alert -> trade_plan -> trading_account)  
**Fix**: Schema defines cascade rules, resolver must implement them

### 4. Duplicate Prevention
**Severity**: MEDIUM  
**Affected Entities**: `execution`, `alert`  
**Issue**: Need to prevent duplicate entries (e.g., ticker added both directly and through trade)  
**Fix**: Schema defines `prevent_duplicates` flag, resolver must implement it

---

## Testing Requirements

### Backend Tests
1. Test resolver for each entity type
2. Verify all relationships are fetched correctly
3. Test cascade logic (e.g., execution -> trade -> ticker)
4. Test duplicate prevention
5. Test legacy relationship support (e.g., alert -> trade_plan via `related_type_id`)
6. Test dynamic note parent resolution

### Frontend Tests
1. Test linked items display for each entity type on all 8 pages:
   - `trading_accounts.html`
   - `trades.html`
   - `trade-plans.html`
   - `executions.html`
   - `cash-flows.html`
   - `alerts.html`
   - `tickers.html`
   - `notes.html` (if exists)
2. Test cache consistency
3. Test modal display
4. Test entity-specific field rendering

---

## Implementation Order

1. **Create `EntityRelationshipResolver`** (`Backend/services/entity_relationship_resolver.py`)
2. **Update `EntityDetailsService.get_linked_items`** to use resolver
3. **Test backend** with resolver
4. **Verify frontend** compatibility (should work with same output structure)
5. **Remove old `_get_X_linked_items` functions**
6. **Comprehensive testing** on all 8 pages
7. **Update documentation**

---

## Notes

- Frontend should mostly work without changes (same output structure)
- Main backend work is creating resolver and removing old functions
- Critical fix: Note relationship field references
- Schema already defines all relationships correctly

