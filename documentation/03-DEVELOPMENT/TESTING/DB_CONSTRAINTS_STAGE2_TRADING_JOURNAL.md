# DB Constraints - Stage 2 Batch 5: Trading Journal

**Entity:** trading_journal
**Type:** Read-Only Aggregation Service
**Status:** Active
**Source Tables:** trades, executions, notes

## Overview

Trading Journal is NOT a physical database table. It is a read-only aggregation service that pulls historical data from existing entities (trades, executions, notes) and presents it in a unified journal format.

## API-Level Validation Constraints

### Required Parameters (All Endpoints)

- `user_id` - INTEGER, NOT NULL, FK → users.id
  - Validated via authentication middleware
  - Required for all requests

### Endpoint-Specific Validation

#### GET /entries

- `start_date` - DATE, NOT NULL
  - Required parameter
  - Must be valid ISO date format
- `end_date` - DATE, NOT NULL
  - Required parameter
  - Must be valid ISO date format
  - Must be >= start_date
- `entity_type` - VARCHAR(50), NULL
  - Optional: 'trade', 'execution', 'note', 'all'
  - Default: 'all'
- `entity_id` - INTEGER, NULL
  - Optional: specific entity ID to filter by
- `ticker_symbol` - VARCHAR(10), NULL
  - Optional: filter by ticker symbol

#### GET /statistics

- `start_date` - DATE, NOT NULL
  - Required parameter
- `end_date` - DATE, NOT NULL
  - Required parameter
- `entity_type` - VARCHAR(50), NULL
  - Optional filter

#### GET /calendar

- `month` - INTEGER, NOT NULL
  - Required: 1-12
- `year` - INTEGER, NOT NULL
  - Required: valid year
- `entity_type` - VARCHAR(50), NULL
  - Optional filter

#### GET /by-entity

- `entity_type` - VARCHAR(50), NOT NULL
  - Required: 'trade', 'execution', 'note'
- `entity_id` - INTEGER, NOT NULL
  - Required: valid entity ID
- `start_date` - DATE, NULL
  - Optional: defaults to last year
- `end_date` - DATE, NULL
  - Optional: defaults to now

#### GET /activity-stats

- `start_date` - DATE, NOT NULL
  - Required parameter
- `end_date` - DATE, NOT NULL
  - Required parameter
- `view_mode` - VARCHAR(10), NULL
  - Optional: 'daily' or 'weekly', default 'daily'
- `entity_type` - VARCHAR(50), NULL
  - Optional filter
- `ticker_symbol` - VARCHAR(10), NULL
  - Optional filter

## Business Logic Constraints

### Data Aggregation Rules

- All data filtered by authenticated user ownership
- Source data comes from:
  - `trades` table (user_id ownership)
  - `executions` table (user_id ownership)
  - `notes` table (user_id ownership)
- No direct database constraints (service-level only)

### Date Range Validation

- start_date <= end_date
- Date range cannot exceed reasonable limits (service-level check)

### Entity Relationship Validation

- entity_id must exist in corresponding table
- entity_type must match valid entity types
- Cross-table consistency maintained

## API Response Constraints

### Success Responses (200)

- All GET endpoints return JSON with status: "success"
- Data structure validated per endpoint specification
- Pagination and filtering applied consistently

### Error Responses (400)

- Missing required parameters
- Invalid parameter values (dates, enums, ranges)
- Authentication failures (401)
- Server errors (500)

### Create Operations (POST)

- **NOT SUPPORTED** - Returns 400 with clear error message
- "Trading journal entries cannot be created directly. They are generated automatically from trades, executions, and notes."

## Route Naming Convention

✅ **Confirmed Canonical**: Uses underscore naming consistently

- `/api/trading_journal/` (correct)
- Not `/api/trading-journals/` (incorrect)

## CRUD Operations Support

| Operation | Status | HTTP Method | Endpoint | Notes |
|-----------|--------|-------------|----------|--------|
| CREATE    | ❌ Not Supported | POST | / | Returns 400 |
| READ      | ✅ Supported | GET | /entries | Date range |
| READ      | ✅ Supported | GET | /statistics | Aggregated stats |
| READ      | ✅ Supported | GET | /calendar | Monthly view |
| READ      | ✅ Supported | GET | /by-entity | Entity-specific |
| READ      | ✅ Supported | GET | /activity-stats | Activity metrics |
| UPDATE    | ❌ Not Supported | - | - | Read-only |
| DELETE    | ❌ Not Supported | - | - | Read-only |

## Testing Evidence

### Valid Requests (200)

```bash
# List endpoints
GET /api/trading_journal/
→ HTTP 200, status: "success", 5 endpoints listed

# Get entries
GET /api/trading_journal/entries?start_date=2025-01-01&end_date=2025-01-31
→ HTTP 200, status: "success", count: 39

# Get statistics
GET /api/trading_journal/statistics?start_date=2025-01-01&end_date=2025-01-31
→ HTTP 200, status: "success"

# Get calendar
GET /api/trading_journal/calendar?month=1&year=2025
→ HTTP 200, status: "success", total_entries: 13
```

### Invalid Requests (400)

```bash
# Missing required params
GET /api/trading_journal/entries
→ HTTP 400, "start_date and end_date are required"

# Invalid month
GET /api/trading_journal/calendar?month=13&year=2025
→ HTTP 400, "month must be between 1 and 12"

# Create attempt
POST /api/trading_journal/
→ HTTP 400, "Trading journal entries cannot be created directly..."
```

## Conclusion

Trading Journal is a read-only aggregation service with comprehensive API-level validation. No physical database table exists - all constraints are implemented at the service layer to ensure data integrity and proper user ownership filtering.
