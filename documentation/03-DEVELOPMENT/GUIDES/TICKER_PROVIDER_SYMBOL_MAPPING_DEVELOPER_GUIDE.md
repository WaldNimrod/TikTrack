# Ticker Provider Symbol Mapping - Developer Guide

## Overview

This guide explains how to use and extend the Ticker Provider Symbol Mapping system in TikTrack.

## Quick Start

### Basic Usage

```python
from services.ticker_symbol_mapping_service import TickerSymbolMappingService
from models.external_data import ExternalDataProvider

# Get provider ID
provider_id = TickerSymbolMappingService.get_provider_id_by_name(db, 'yahoo_finance')

# Get provider symbol with fallback (recommended)
symbol = TickerSymbolMappingService.get_provider_symbol_with_fallback(
    db, 
    ticker_id=1, 
    provider_id=provider_id
)
# Returns "500X.MI" if mapping exists, or "500X" (internal symbol) as fallback

# Create/update mapping
mapping = TickerSymbolMappingService.set_provider_symbol(
    db,
    ticker_id=1,
    provider_id=provider_id,
    provider_symbol="500X.MI",
    is_primary=True
)

# Get all mappings for a ticker
all_mappings = TickerSymbolMappingService.get_all_mappings(db, ticker_id=1)
```

## Service API Reference

### TickerSymbolMappingService

**Location**: `Backend/services/ticker_symbol_mapping_service.py`

#### `get_provider_symbol(db, ticker_id, provider_id) -> Optional[str]`

Get provider-specific symbol. Returns `None` if no mapping exists.

```python
symbol = TickerSymbolMappingService.get_provider_symbol(db, 1, 1)
if symbol:
    print(f"Provider symbol: {symbol}")
else:
    print("No mapping found")
```

#### `get_provider_symbol_with_fallback(db, ticker_id, provider_id) -> str`

**Recommended method**. Gets provider symbol with automatic fallback to internal symbol.

```python
# Always returns a symbol (never None)
symbol = TickerSymbolMappingService.get_provider_symbol_with_fallback(db, 1, 1)
# Returns "500X.MI" if mapping exists, or "500X" (internal) as fallback
```

#### `set_provider_symbol(db, ticker_id, provider_id, provider_symbol, is_primary=False) -> Optional[TickerProviderSymbol]`

Create or update a mapping.

```python
mapping = TickerSymbolMappingService.set_provider_symbol(
    db,
    ticker_id=1,
    provider_id=1,
    provider_symbol="500X.MI",
    is_primary=True
)
```

#### `delete_mapping(db, ticker_id, provider_id) -> bool`

Delete a mapping.

```python
success = TickerSymbolMappingService.delete_mapping(db, 1, 1)
```

#### `get_all_mappings(db, ticker_id) -> List[Dict[str, Any]]`

Get all mappings for a ticker with provider information.

```python
mappings = TickerSymbolMappingService.get_all_mappings(db, ticker_id=1)
# Returns: [
#     {
#         'id': 1,
#         'ticker_id': 1,
#         'provider_id': 1,
#         'provider_name': 'yahoo_finance',
#         'provider_display_name': 'Yahoo Finance',
#         'provider_symbol': '500X.MI',
#         'is_primary': True,
#         'created_at': '2025-01-27T10:00:00Z',
#         'updated_at': '2025-01-27T10:00:00Z'
#     }
# ]
```

#### `get_provider_id_by_name(db, provider_name) -> Optional[int]`

Helper to get provider ID by name.

```python
provider_id = TickerSymbolMappingService.get_provider_id_by_name(db, 'yahoo_finance')
```

## Adding a New Provider

### Step 1: Ensure Provider Exists in Database

```python
from models.external_data import ExternalDataProvider

provider = db.query(ExternalDataProvider).filter(
    ExternalDataProvider.name == 'new_provider'
).first()

if not provider:
    provider = ExternalDataProvider(
        name='new_provider',
        display_name='New Provider',
        is_active=True,
        provider_type='finance',
        base_url='https://api.newprovider.com',
        rate_limit_per_hour=1000,
        timeout_seconds=30
    )
    db.add(provider)
    db.commit()
```

### Step 2: Update Adapter to Use Mapping

```python
class NewProviderAdapter:
    def __init__(self, db_session: Session, provider_id: int):
        self.db_session = db_session
        self.provider_id = provider_id
    
    def _get_provider_symbol(self, ticker: Ticker) -> str:
        """Get provider-specific symbol with fallback"""
        return TickerSymbolMappingService.get_provider_symbol_with_fallback(
            self.db_session,
            ticker.id,
            self.provider_id
        )
    
    def get_quote(self, symbol: Optional[str] = None, ticker: Optional[Ticker] = None):
        """Get quote - accepts ticker object for mapping"""
        if ticker:
            provider_symbol = self._get_provider_symbol(ticker)
            # Use provider_symbol for API call
            # Store result with ticker.symbol (internal symbol)
        elif symbol:
            # Fallback to direct symbol usage
            pass
```

### Step 3: Update Import Process (Optional)

If the import process should auto-create mappings:

```python
def _create_provider_symbol_mapping_if_needed(
    self,
    ticker: Ticker,
    metadata: Dict[str, Any]
) -> None:
    """Create mapping if display_symbol differs from internal symbol"""
    display_symbol = metadata.get('display_symbol', '').strip()
    internal_symbol = (ticker.symbol or '').strip()
    
    if display_symbol and display_symbol.upper() != internal_symbol.upper():
        provider_id = TickerSymbolMappingService.get_provider_id_by_name(
            self.db_session, 
            'new_provider'
        )
        if provider_id:
            TickerSymbolMappingService.set_provider_symbol(
                self.db_session,
                ticker.id,
                provider_id,
                display_symbol,
                is_primary=True
            )
```

## Integration with YahooFinanceAdapter

### Using Ticker Objects

```python
# Recommended: Pass ticker object
ticker = db.query(Ticker).filter_by(symbol='500X').first()
quote = yahoo_adapter.get_quote(ticker=ticker)
# Automatically uses "500X.MI" if mapping exists

# Batch operations
tickers = db.query(Ticker).filter(Ticker.symbol.in_(['500X', 'ANAU'])).all()
quotes = yahoo_adapter.get_quotes_batch(tickers=tickers)
# Each ticker uses its provider symbol automatically
```

### Fallback Behavior

```python
# If no mapping exists, uses internal symbol
ticker = db.query(Ticker).filter_by(symbol='AAPL').first()
quote = yahoo_adapter.get_quote(ticker=ticker)
# Uses "AAPL" (no mapping needed for most tickers)
```

## API Integration

### Creating Ticker with Mapping

```python
# POST /api/tickers
{
    "symbol": "500X",
    "name": "iShares Core S&P 500 UCITS ETF",
    "type": "etf",
    "provider_symbols": {
        "yahoo_finance": "500X.MI"
    }
}
```

### Updating Ticker with Mapping

```python
# PUT /api/tickers/{id}
{
    "symbol": "500X",
    "name": "Updated Name",
    "provider_symbols": {
        "yahoo_finance": "500X.MI"
    }
}
```

### Getting Mappings

```python
# GET /api/tickers/{id}/provider-symbols
# Returns all mappings for the ticker
```

## Caching

All mapping operations are cached with 5-minute TTL:

```python
# Cache is automatically invalidated on:
# - set_provider_symbol() - creates/updates mapping
# - delete_mapping() - deletes mapping

# Manual cache invalidation (if needed)
TickerSymbolMappingService.invalidate_cache_for_ticker(ticker_id)
```

## Best Practices

### 1. Always Use Fallback Method

```python
# ✅ Good
symbol = TickerSymbolMappingService.get_provider_symbol_with_fallback(
    db, ticker_id, provider_id
)

# ❌ Avoid (requires None check)
symbol = TickerSymbolMappingService.get_provider_symbol(db, ticker_id, provider_id)
if not symbol:
    ticker = db.query(Ticker).filter_by(id=ticker_id).first()
    symbol = ticker.symbol
```

### 2. Pass Ticker Objects to Adapters

```python
# ✅ Good
quote = adapter.get_quote(ticker=ticker)

# ⚠️ Acceptable (but no mapping support)
quote = adapter.get_quote(symbol='500X')
```

### 3. Handle Errors Gracefully

```python
try:
    symbol = TickerSymbolMappingService.get_provider_symbol_with_fallback(
        db, ticker_id, provider_id
    )
except Exception as e:
    logger.error(f"Error getting provider symbol: {e}")
    # Fallback to internal symbol
    ticker = db.query(Ticker).filter_by(id=ticker_id).first()
    symbol = ticker.symbol if ticker else ""
```

### 4. Cache Considerations

- Cache TTL is 5 minutes
- Cache is automatically invalidated on updates
- For high-frequency lookups, cache significantly improves performance
- Don't manually manage cache unless necessary

## Troubleshooting

### Mapping Not Working

1. **Check if mapping exists**:
```python
mappings = TickerSymbolMappingService.get_all_mappings(db, ticker_id)
print(mappings)
```

2. **Check provider ID**:
```python
provider_id = TickerSymbolMappingService.get_provider_id_by_name(db, 'yahoo_finance')
print(f"Provider ID: {provider_id}")
```

3. **Check cache**:
```python
# Clear cache and retry
TickerSymbolMappingService.invalidate_cache_for_ticker(ticker_id)
```

### Import Not Creating Mappings

1. **Check metadata structure**:
```python
# Ensure display_symbol is in metadata
metadata = {
    'display_symbol': '500X.MI',  # Must differ from internal symbol
    'symbol': '500X'
}
```

2. **Check import orchestrator**:
```python
# Verify _create_provider_symbol_mapping_if_needed is called
# Check logs for mapping creation messages
```

### Performance Issues

1. **Check cache hit rate**:
```python
# Cache should handle most lookups
# If performance is slow, check database indexes
```

2. **Batch operations**:
```python
# Use batch methods when possible
quotes = adapter.get_quotes_batch(tickers=tickers)
# More efficient than individual calls
```

## Testing

### Unit Tests

```python
def test_get_provider_symbol_with_fallback():
    # Test with mapping
    mapping = TickerSymbolMappingService.set_provider_symbol(
        db, ticker_id, provider_id, "500X.MI"
    )
    symbol = TickerSymbolMappingService.get_provider_symbol_with_fallback(
        db, ticker_id, provider_id
    )
    assert symbol == "500X.MI"
    
    # Test without mapping (fallback)
    TickerSymbolMappingService.delete_mapping(db, ticker_id, provider_id)
    symbol = TickerSymbolMappingService.get_provider_symbol_with_fallback(
        db, ticker_id, provider_id
    )
    assert symbol == "500X"  # Internal symbol
```

### Integration Tests

```python
def test_yahoo_adapter_with_mapping():
    ticker = create_ticker("500X")
    create_mapping(ticker.id, "500X.MI")
    
    quote = yahoo_adapter.get_quote(ticker=ticker)
    assert quote is not None
    assert quote.symbol == "500X"  # Internal symbol
    # Yahoo API was called with "500X.MI"
```

## Related Documentation

- [Architecture Documentation](../04-FEATURES/CORE/external_data/TICKER_PROVIDER_SYMBOL_MAPPING.md)
- [External Data System](../04-FEATURES/CORE/external_data/EXTERNAL_DATA_SYSTEM.md)
- [API Documentation](../../api/TICKERS_API.md)

