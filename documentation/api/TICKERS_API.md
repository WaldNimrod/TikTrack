# Tickers API Documentation

## Overview

The Tickers API provides endpoints for managing tickers (stocks, ETFs, etc.) in the TikTrack system. This includes creating, reading, updating, and deleting tickers, as well as managing provider-specific symbol mappings.

## Base URL

```
/api/tickers
```

## Endpoints

### POST /api/tickers

Create a new ticker.

**Request Body**:
```json
{
  "symbol": "500X",
  "name": "iShares Core S&P 500 UCITS ETF",
  "type": "etf",
  "currency_id": 1,
  "status": "open",
  "remarks": "Optional remarks",
  "provider_symbols": {
    "yahoo_finance": "500X.MI"
  }
}
```

**Fields**:
- `symbol` (required): Internal ticker symbol (e.g., "500X")
- `name` (required): Company/ETF name
- `type` (required): Ticker type: "stock", "etf", "bond", "crypto", "forex", "commodity"
- `currency_id` (required): Currency ID
- `status` (required): Status: "open", "closed", "cancelled"
- `remarks` (optional): Additional remarks (rich text supported)
- `provider_symbols` (optional): Dictionary of provider-specific symbols
  - Key: Provider name (e.g., "yahoo_finance")
  - Value: Provider-specific symbol (e.g., "500X.MI")

**Response** (201 Created):
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "symbol": "500X",
    "name": "iShares Core S&P 500 UCITS ETF",
    "type": "etf",
    "currency_id": 1,
    "status": "open",
    "remarks": "Optional remarks",
    "created_at": "2025-01-27T10:00:00Z",
    "updated_at": "2025-01-27T10:00:00Z"
  },
  "message": "Ticker created successfully",
  "external_data": {
    "available": true,
    "error": null,
    "quote": {
      "price": 150.25,
      "currency": "EUR",
      "volume": 1000000
    }
  },
  "version": "1.0"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid JSON or missing required fields
- `400 Bad Request`: Ticker with symbol already exists
- `500 Internal Server Error`: Server error

### PUT /api/tickers/{id}

Update an existing ticker.

**Request Body**:
```json
{
  "symbol": "500X",
  "name": "Updated Name",
  "type": "etf",
  "currency_id": 1,
  "status": "open",
  "remarks": "Updated remarks",
  "provider_symbols": {
    "yahoo_finance": "500X.MI"
  }
}
```

**Fields**: Same as POST, all optional except those being updated.

**Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "symbol": "500X",
    "name": "Updated Name",
    ...
  },
  "message": "Ticker updated successfully",
  "version": "1.0"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid JSON
- `400 Bad Request`: Cannot cancel ticker with active trades
- `404 Not Found`: Ticker not found
- `500 Internal Server Error`: Server error

### GET /api/tickers/{id}/provider-symbols

Get all provider symbol mappings for a ticker.

**Response** (200 OK):
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "ticker_id": 1,
      "provider_id": 1,
      "provider_name": "yahoo_finance",
      "provider_display_name": "Yahoo Finance",
      "provider_symbol": "500X.MI",
      "is_primary": true,
      "created_at": "2025-01-27T10:00:00Z",
      "updated_at": "2025-01-27T10:00:00Z"
    }
  ],
  "version": "1.0"
}
```

**Error Responses**:
- `404 Not Found`: Ticker not found
- `500 Internal Server Error`: Server error

### GET /api/tickers

Get all tickers (with optional filters).

**Query Parameters**:
- `status`: Filter by status (e.g., "open", "closed")
- `type`: Filter by type (e.g., "stock", "etf")
- `search`: Search in symbol or name

**Response** (200 OK):
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "symbol": "500X",
      "name": "iShares Core S&P 500 UCITS ETF",
      ...
    }
  ],
  "version": "1.0"
}
```

### DELETE /api/tickers/{id}

Delete a ticker.

**Response** (200 OK):
```json
{
  "status": "success",
  "message": "Ticker deleted successfully",
  "version": "1.0"
}
```

**Error Responses**:
- `400 Bad Request`: Cannot delete ticker with active trades
- `404 Not Found`: Ticker not found
- `500 Internal Server Error`: Server error

## Provider Symbol Mappings

### Overview

Provider symbol mappings allow different external data providers to use different symbol formats for the same internal ticker. This is useful when:
- A ticker is traded on multiple global markets
- A provider requires a different symbol format (e.g., exchange suffix)
- The internal symbol is "shortened" but providers need the full symbol

### Examples

**Example 1: 500X → 500X.MI**
```json
{
  "symbol": "500X",
  "provider_symbols": {
    "yahoo_finance": "500X.MI"
  }
}
```

**Example 2: ANAU → ANAU.DE**
```json
{
  "symbol": "ANAU",
  "provider_symbols": {
    "yahoo_finance": "ANAU.DE"
  }
}
```

### How It Works

1. **Internal Symbol**: The ticker is stored with its internal symbol (e.g., "500X")
2. **Provider Mapping**: When fetching data from a provider, the system checks for a mapping
3. **Fallback**: If no mapping exists, the internal symbol is used
4. **Transparent**: The frontend receives a unified ticker object - mapping is server-side only

### Auto-Mapping During Import

When importing tickers, if the `display_symbol` from metadata differs from the internal symbol, a mapping is automatically created:

```python
# Import file contains "500X" (shortened)
# Metadata contains display_symbol = "500X.MI"
# Mapping is created automatically during import
```

## Error Handling

All endpoints return errors in a consistent format:

```json
{
  "status": "error",
  "error": {
    "message": "Error description"
  },
  "version": "1.0"
}
```

## Related Documentation

- [Ticker Provider Symbol Mapping](../04-FEATURES/CORE/external_data/TICKER_PROVIDER_SYMBOL_MAPPING.md) - Architecture documentation
- [Developer Guide](../03-DEVELOPMENT/GUIDES/TICKER_PROVIDER_SYMBOL_MAPPING_DEVELOPER_GUIDE.md) - Developer guide

