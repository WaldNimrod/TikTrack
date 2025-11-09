# Linked Items System Documentation

**Version**: 2.1.0  
**Architecture**: Configuration-Based Schema  
**Last Updated**: 2025-01-12

## System Overview

The Linked Items System is a core component of TikTrack that manages relationships between different entities (trades, accounts, tickers, alerts, etc.). It provides a unified interface for checking dependencies before performing critical operations like cancellation or deletion.

### Architecture

The system uses a **Configuration-Based Schema Architecture** that replaces the previous Strategy Pattern approach:

- **Central Schema** (`entity_relationship_schema.py`) - Single source of truth for all relationships
- **Generic Resolver** (`entity_relationship_resolver.py`) - Interprets schema and builds queries dynamically
- **Service Layer** (`EntityDetailsService.get_linked_items()`) - Public API for accessing linked items

See `documentation/developers/ENTITY_RELATIONSHIP_SCHEMA.md` for detailed schema documentation.

### Purpose and Role

- **Data Integrity**: Prevents orphaned records and maintains referential integrity
- **User Safety**: Warns users about dependencies before destructive operations
- **Relationship Management**: Provides a centralized way to view and manage entity relationships
- **Business Rules Enforcement**: Implements complex business logic for when operations are allowed

### Relationship Diagram

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Account   │◄───┤    Trade    │◄───┤   Ticker    │
│             │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
       ▲                   ▲                   ▲
       │                   │                   │
       │                   │                   │
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Execution   │    │ Trade Plan  │    │   Alert     │
│             │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
       ▲                   ▲                   ▲
       │                   │                   │
       │                   │                   │
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Note      │    │ Cash Flow   │    │   Other     │
│             │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
```

### API Endpoint Structure

**Backend API**: `/api/linked-items/{entity_type}/{entity_id}`

**Response Format**:
```json
{
  "child_entities": [
    {
      "id": 123,
      "type": "trade",
      "title": "Trade AAPL",
      "description": "Active trade",
      "status": "open",
      "created_at": "2025-01-12T10:00:00Z"
    }
  ],
  "parent_entities": [
    {
      "id": 456,
      "type": "account",
      "title": "Main Account",
      "description": "Primary trading account",
      "status": "active",
      "created_at": "2025-01-01T00:00:00Z"
    }
  ],
  "entity_details": {
    "id": 789,
    "name": "AAPL",
    "symbol": "AAPL"
  }
}
```

## Technical Documentation

### Frontend Functions

#### Core Functions

**`checkLinkedItemsBeforeAction(itemType, itemId, action)`**
- **Purpose**: Check if an entity has linked items before performing an action
- **Parameters**:
  - `itemType`: Entity type (trade, ticker, trade_plan, account, etc.)
  - `itemId`: Entity ID
  - `action`: Action type ('cancel' or 'delete')
- **Returns**: `Promise<boolean>` - true if has linked items (blocks action), false if safe to proceed
- **Usage**: Used before performing cancel/delete operations

**`checkLinkedItemsAndPerformAction(itemType, itemId, action, actionFunction)`**
- **Purpose**: Check linked items and perform action if safe
- **Parameters**:
  - `itemType`: Entity type
  - `itemId`: Entity ID
  - `action`: Action type ('cancel' or 'delete')
  - `actionFunction`: Function to execute if no linked items exist
- **Returns**: `Promise<void>`
- **Usage**: One-step function that handles checking and execution

#### Modal Functions

**`showLinkedItemsModal(data, itemType, itemId, mode)`**
- **Purpose**: Display linked items modal
- **Parameters**:
  - `data`: Linked items data from API
  - `itemType`: Type of the item
  - `itemId`: ID of the item
  - `mode`: 'view' or 'warningBlock'
- **Usage**: Shows modal with linked items information

### Modal Modes

#### View Mode (`mode: 'view'`)
- **Purpose**: Display linked items for information
- **Behavior**: Shows both parent and child entities separately
- **Actions**: Provides action buttons (view, edit, delete) for each item
- **Use Case**: General information display, relationship exploration

#### Warning Block Mode (`mode: 'warningBlock'`)
- **Purpose**: Block destructive operations
- **Behavior**: Shows only child entities that prevent the operation
- **Actions**: No action buttons, focuses on warning message
- **Use Case**: Cancel/delete operations that are blocked by dependencies

### Entity Type Mappings

| Entity Type | API Endpoint | Description |
|-------------|--------------|-------------|
| `trade` | `/api/linked-items/trade/{id}` | Trading positions |
| `ticker` | `/api/linked-items/ticker/{id}` | Stock symbols |
| `trade_plan` | `/api/linked-items/trade_plan/{id}` | Investment plans |
| `account` | `/api/linked-items/account/{id}` | Trading accounts |
| `alert` | `/api/linked-items/alert/{id}` | Price alerts |
| `execution` | `/api/linked-items/execution/{id}` | Trade executions (always linked to trading_account and ticker, optionally to trade) |
| `note` | `/api/linked-items/note/{id}` | Notes and comments |
| `cash_flow` | `/api/linked-items/cash_flow/{id}` | Cash flow records (always linked to trading_account, optionally to trade and ticker via trade) |

## Integration Guide for Developers

### Adding Linked Items Checking to New Pages

1. **Import the functions**:
```javascript
// Functions are automatically available via window object
// No import needed - they're loaded with linked-items.js
```

2. **Basic usage for cancel operations**:
```javascript
async function cancelEntity(entityId) {
  const hasLinkedItems = await window.checkLinkedItemsBeforeAction('entity_type', entityId, 'cancel');
  if (!hasLinkedItems) {
    // Safe to proceed with cancellation
    await performCancellation(entityId);
  }
  // If hasLinkedItems is true, modal is already shown
}
```

3. **One-step approach**:
```javascript
async function cancelEntity(entityId) {
  await window.checkLinkedItemsAndPerformAction('entity_type', entityId, 'cancel', performCancellation);
}
```

4. **Basic usage for delete operations**:
```javascript
async function deleteEntity(entityId) {
  const hasLinkedItems = await window.checkLinkedItemsBeforeAction('entity_type', entityId, 'delete');
  if (!hasLinkedItems) {
    // Safe to proceed with deletion
    await performDeletion(entityId);
  }
  // If hasLinkedItems is true, modal is already shown
}
```

### Code Examples

#### Example 1: Trade Cancellation
```javascript
async function cancelTrade(tradeId) {
  await window.checkLinkedItemsAndPerformAction('trade', tradeId, 'cancel', async (id) => {
    const response = await fetch(`/api/trades/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelled' })
    });
    
    if (response.ok) {
      window.showSuccessNotification('Trade cancelled successfully');
      await loadTradesData();
    }
  });
}
```

#### Example 2: Ticker Deletion
```javascript
async function deleteTicker(tickerId) {
  const hasLinkedItems = await window.checkLinkedItemsBeforeAction('ticker', tickerId, 'delete');
  if (!hasLinkedItems) {
    const response = await fetch(`/api/tickers/${tickerId}`, { method: 'DELETE' });
    if (response.ok) {
      window.showSuccessNotification('Ticker deleted successfully');
      await loadTickersData();
    }
  }
}
```

### Error Handling Patterns

```javascript
async function safeEntityOperation(entityId) {
  try {
    const hasLinkedItems = await window.checkLinkedItemsBeforeAction('entity_type', entityId, 'action');
    if (!hasLinkedItems) {
      await performOperation(entityId);
    }
  } catch (error) {
    window.Logger.error('Error in entity operation:', error);
    window.showErrorNotification('Operation failed', error.message);
  }
}
```

### Testing Checklist

- [ ] Test cancel operation with no linked items
- [ ] Test cancel operation with linked items (should show modal)
- [ ] Test delete operation with no linked items
- [ ] Test delete operation with linked items (should show modal)
- [ ] Test error handling when API is unavailable
- [ ] Test modal display in both view and warningBlock modes
- [ ] Test action buttons in view mode
- [ ] Test rules explanation in warningBlock mode

## Business Rules

### Cancel Rules per Entity Type

#### Trade Plans
- **Can cancel if**: No active trades, no linked notes/alerts/executions
- **Cannot cancel if**: Has active trades (status: 'open')
- **Special case**: Can cancel if only has closed trades

#### Trades
- **Can cancel if**: No linked executions, notes, or alerts
- **Cannot cancel if**: Has any linked executions, notes, or alerts

#### Tickers
- **Can cancel if**: No active trades or trade plans
- **Cannot cancel if**: Has active trades or trade plans
- **Special case**: Can cancel if only has closed trades/plans

#### Accounts
- **Can cancel if**: No active trades, executions, notes, or alerts
- **Cannot cancel if**: Has any active trades or linked items

### Delete Rules per Entity Type

#### Trade Plans
- **Can delete if**: No linked items at all
- **Cannot delete if**: Has any linked trades, notes, alerts, or executions

#### Trades
- **Can delete if**: No linked executions, notes, or alerts
- **Cannot delete if**: Has any linked items

#### Tickers
- **Can delete if**: No linked trades, trade plans, notes, or alerts
- **Cannot delete if**: Has any linked items

#### Accounts
- **Can delete if**: No linked trades, executions, notes, or alerts
- **Cannot delete if**: Has any linked items

### When to Show warningBlock vs view Mode

- **warningBlock**: Used when checking before cancel/delete operations
- **view**: Used for general information display, relationship exploration

### Special Cases

#### Closed Trades
- Closed trades can be deleted even if they have linked items
- Closed trades don't prevent cancellation of parent entities

#### Archived Items
- Archived items are treated as inactive and don't block operations
- Archived items are shown in view mode but don't prevent actions

## Implementation Notes

### Performance Considerations

- API calls are cached for 60 seconds (TTL)
- Rate limiting: 60 requests per minute per endpoint
- Child entities are checked first (most common blocking condition)

### Security Considerations

- All API endpoints require authentication
- Entity access is validated on the backend
- User can only access entities they own

### Future Enhancements

- Bulk operations support
- Advanced filtering in linked items modal
- Export functionality for linked items data
- Real-time updates when linked items change

## Troubleshooting

### Common Issues

1. **Modal not showing**: Check if `showLinkedItemsModal` function is available
2. **API errors**: Check network connectivity and authentication
3. **Wrong entity type**: Ensure correct entity type mapping
4. **Missing action function**: Provide valid function for `checkLinkedItemsAndPerformAction`

### Debug Mode

Enable debug logging by setting:
```javascript
window.Logger.setLevel('debug');
```

This will provide detailed logs for linked items operations.
