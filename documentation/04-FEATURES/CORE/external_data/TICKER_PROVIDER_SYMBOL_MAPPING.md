# Ticker Provider Symbol Mapping System

## Overview

The Ticker Provider Symbol Mapping system allows different external data providers to use different symbol formats for the same internal ticker. This solves the problem where providers require different or more detailed symbols than the internal ticker symbol.

### Problem Statement

Different external data providers may require different symbol formats for the same ticker:
- **Internal Symbol**: `500X`
- **Yahoo Finance**: `500X.MI` (requires exchange suffix)
- **Google Finance**: `500X:MI` (different format)

The system previously relied on a single uniform symbol string, causing issues especially for tickers traded on multiple global markets or identified differently by providers.

### Solution

A separate mapping table (`ticker_provider_symbols`) stores provider-specific symbols for each ticker. The system:
- Maintains internal ticker symbols unchanged
- Maps to provider-specific symbols when needed
- Falls back to internal symbol if no mapping exists
- Handles all mapping logic server-side (frontend is transparent)

## Architecture

### Database Schema

```sql
CREATE TABLE ticker_provider_symbols (
    id SERIAL PRIMARY KEY,
    ticker_id INTEGER NOT NULL REFERENCES tickers(id) ON DELETE CASCADE,
    provider_id INTEGER NOT NULL REFERENCES external_data_providers(id),
    provider_symbol VARCHAR(50) NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_ticker_provider_symbols_ticker_provider 
        UNIQUE (ticker_id, provider_id)
);

CREATE INDEX idx_ticker_provider_symbols_ticker_id ON ticker_provider_symbols(ticker_id);
CREATE INDEX idx_ticker_provider_symbols_provider_id ON ticker_provider_symbols(provider_id);
CREATE INDEX idx_ticker_provider_symbols_provider_symbol ON ticker_provider_symbols(provider_symbol);
```

### Model Definition

**Location**: `Backend/models/ticker.py`

```python
class TickerProviderSymbol(BaseModel):
    """
    Maps internal ticker symbols to provider-specific symbols.
    
    Attributes:
        ticker_id: Reference to the ticker
        provider_id: Reference to the external data provider
        provider_symbol: The symbol format required by this provider
        is_primary: Whether this is the primary mapping for this provider
    """
    __tablename__ = "ticker_provider_symbols"
    
    ticker_id = Column(Integer, ForeignKey('tickers.id', ondelete='CASCADE'), nullable=False)
    provider_id = Column(Integer, ForeignKey('external_data_providers.id'), nullable=False)
    provider_symbol = Column(String(50), nullable=False)
    is_primary = Column(Boolean, default=False, nullable=False)
    updated_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    ticker = relationship("Ticker", back_populates="provider_symbols")
    provider = relationship("ExternalDataProvider")
```

### Service Layer

**Location**: `Backend/services/ticker_symbol_mapping_service.py`

The `TickerSymbolMappingService` provides:
- `get_provider_symbol()` - Get provider-specific symbol (returns None if not found)
- `get_provider_symbol_with_fallback()` - Get provider symbol with fallback to internal symbol
- `set_provider_symbol()` - Create or update mapping
- `delete_mapping()` - Delete a mapping
- `get_all_mappings()` - Get all mappings for a ticker
- `get_provider_id_by_name()` - Helper to get provider ID by name

All operations are cached for performance (5-minute TTL).

## Data Flow

### 1. Ticker Creation/Update

```
User creates ticker "500X"
    ↓
Frontend sends: { symbol: "500X", provider_symbols: { yahoo_finance: "500X.MI" } }
    ↓
Backend API (POST /api/tickers)
    ↓
TickerService.create() - Creates ticker
    ↓
TickerSymbolMappingService.set_provider_symbol() - Creates mapping
    ↓
Ticker created with mapping stored
```

### 2. External Data Fetch

```
YahooFinanceAdapter.get_quote(ticker=ticker_object)
    ↓
TickerSymbolMappingService.get_provider_symbol_with_fallback()
    ↓
Returns "500X.MI" (or "500X" if no mapping)
    ↓
Yahoo Finance API called with "500X.MI"
    ↓
Data returned and cached with internal symbol "500X"
```

### 3. Import Process

```
Import file contains "500X" (shortened symbol)
    ↓
ImportOrchestrator processes records
    ↓
SymbolMetadataService builds metadata
    ↓
display_symbol = "500X.MI" (from metadata)
    ↓
ImportOrchestrator._create_provider_symbol_mapping_if_needed()
    ↓
Mapping created automatically
```

## Design Principles

### 1. Server-Side Processing
- All join and data splitting happens on the server
- Frontend receives unified ticker object with all information
- Frontend doesn't need to know about mapping logic

### 2. Backward Compatibility
- All existing APIs continue to work
- Mapping is optional - if no mapping exists, uses internal symbol
- No breaking changes to existing code

### 3. Fallback Logic
- Always falls back to internal ticker symbol if no mapping exists
- Works for majority of tickers that don't need mapping
- Graceful degradation

### 4. Optional Usage
- Mapping is entirely optional for each ticker
- Most tickers work without mapping
- Only needed for special cases (multiple markets, provider-specific formats)

### 5. Caching
- All mapping operations are cached (5-minute TTL)
- Cache invalidation on create/update/delete
- Performance optimized for high-frequency lookups

## Integration Points

### YahooFinanceAdapter

**Location**: `Backend/services/external_data/yahoo_finance_adapter.py`

**Changes**:
- `_get_provider_symbol()` - Gets Yahoo-specific symbol with fallback
- `get_quote()` - Accepts optional `ticker` parameter
- `get_quotes_batch()` - Accepts list of `Ticker` objects
- Uses provider symbol for API calls, stores with internal symbol

### ImportOrchestrator

**Location**: `Backend/services/user_data_import/import_orchestrator.py`

**Changes**:
- `_create_provider_symbol_mapping_if_needed()` - Creates mapping if `display_symbol` differs from internal symbol
- Called during `_update_ticker_metadata()` after import

### API Routes

**Location**: `Backend/routes/api/tickers.py`

**Changes**:
- `POST /api/tickers` - Accepts optional `provider_symbols` field
- `PUT /api/tickers/{id}` - Accepts optional `provider_symbols` field
- Creates/updates mappings after ticker creation/update

## Examples

### Example 1: 500X → 500X.MI

```python
# Create ticker
ticker = TickerService.create(db, {
    'symbol': '500X',
    'name': 'iShares Core S&P 500 UCITS ETF',
    'type': 'etf'
})

# Create mapping
TickerSymbolMappingService.set_provider_symbol(
    db, 
    ticker.id, 
    yahoo_provider_id, 
    '500X.MI',
    is_primary=True
)

# Fetch quote (uses mapping automatically)
quote = yahoo_adapter.get_quote(ticker=ticker)
# Yahoo Finance API called with "500X.MI"
# Quote stored with symbol "500X"
```

### Example 2: ANAU → ANAU.DE

```python
# Create ticker
ticker = TickerService.create(db, {
    'symbol': 'ANAU',
    'name': 'Annaly Capital Management',
    'type': 'stock'
})

# Create mapping
TickerSymbolMappingService.set_provider_symbol(
    db,
    ticker.id,
    yahoo_provider_id,
    'ANAU.DE',
    is_primary=True
)
```

### Example 3: Import with Auto-Mapping

```python
# Import file contains "500X" (shortened)
# Metadata contains display_symbol = "500X.MI"

# During import:
ImportOrchestrator._update_ticker_metadata(enriched_records, symbol_metadata)
    ↓
For each ticker:
    if display_symbol != internal_symbol:
        _create_provider_symbol_mapping_if_needed()
            ↓
        Mapping created automatically
```

## Migration

See migration script: `Backend/migrations/create_ticker_provider_symbols_table.py`

**To run migration**:
```bash
python3 Backend/migrations/create_ticker_provider_symbols_table.py
```

**To rollback**:
```bash
python3 Backend/migrations/create_ticker_provider_symbols_table.py down
```

## Testing

### Unit Tests
- `tests/unit/test_ticker_symbol_mapping_service.py`

### Integration Tests
- `tests/integration/test_ticker_provider_symbol_integration.py`

### E2E Tests
- `tests/e2e/test_ticker_symbol_mapping_e2e.py`
  - Test 500X → 500X.MI
  - Test ANAU → ANAU.DE
  - Test import auto-mapping

## Related Documentation

- [External Data System](EXTERNAL_DATA_SYSTEM.md) - Main external data documentation
- [Developer Guide](../03-DEVELOPMENT/GUIDES/TICKER_PROVIDER_SYMBOL_MAPPING_DEVELOPER_GUIDE.md) - Developer guide
- [API Documentation](../../api/TICKERS_API.md) - API reference

## Version History

- **v1.0** (January 2025): Initial implementation
  - Separate mapping table
  - TickerSymbolMappingService
  - YahooFinanceAdapter integration
  - Import auto-mapping
  - API support for provider_symbols

