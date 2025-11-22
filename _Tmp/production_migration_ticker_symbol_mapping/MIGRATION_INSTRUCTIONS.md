# Ticker Provider Symbol Mapping - Production Migration Instructions

## Overview

This migration adds support for provider-specific symbol mappings, allowing different external data providers to use different symbol formats for the same internal ticker.

**Date**: January 27, 2025  
**Version**: 1.0  
**Database Changes**: New table `ticker_provider_symbols`

## Pre-Migration Checklist

- [ ] Backup production database
- [ ] Verify PostgreSQL is running
- [ ] Check database connection settings
- [ ] Review migration script
- [ ] Test migration on development environment first

## Migration Steps

### Step 1: Backup Database

```bash
# Backup PostgreSQL database
pg_dump -h localhost -U TikTrakDBAdmin -d TikTrack-db-production > backup_before_ticker_symbol_mapping_$(date +%Y%m%d_%H%M%S).sql
```

### Step 2: Run Migration Script

```bash
# Navigate to Backend directory
cd Backend

# Run migration (uses DATABASE_URL from environment)
python3 migrations/create_ticker_provider_symbols_table.py
```

**Expected Output**:
```
======================================================================
Create Ticker Provider Symbols Table Migration
======================================================================
Database: postgresql://...
Type: PostgreSQL
Time: 2025-01-27 10:00:00

[1/4] Checking if table already exists...
✓ Table does not exist - will create new

[2/4] Verifying required tables exist...
✓ Required tables verified

[3/4] Creating ticker_provider_symbols table...
✓ Table created

[4/4] Verifying table structure...
Table structure:
  - id (INTEGER) NOT NULL
  - ticker_id (INTEGER) NOT NULL
  - provider_id (INTEGER) NOT NULL
  - provider_symbol (VARCHAR(50)) NOT NULL
  - is_primary (BOOLEAN) NOT NULL DEFAULT FALSE
  - created_at (TIMESTAMP WITH TIME ZONE) DEFAULT CURRENT_TIMESTAMP
  - updated_at (TIMESTAMP WITH TIME ZONE) NULL
✓ Table structure verified

✅ Migration completed successfully!
```

### Step 3: Verify Migration

Run the verification script:

```bash
python3 _Tmp/production_migration_ticker_symbol_mapping/verification_script.py
```

**Expected Output**:
```
✅ Table 'ticker_provider_symbols' exists
✅ All required columns exist
✅ All indexes created
✅ Foreign key constraints verified
✅ Migration verification passed!
```

### Step 4: Update Application Code

The following files need to be synced to production:

**Backend Files**:
- `Backend/models/ticker.py` (updated - added TickerProviderSymbol model)
- `Backend/services/ticker_symbol_mapping_service.py` (new)
- `Backend/services/external_data/yahoo_finance_adapter.py` (updated)
- `Backend/services/user_data_import/import_orchestrator.py` (updated)
- `Backend/routes/api/tickers.py` (updated)

**Frontend Files**:
- `trading-ui/scripts/modal-configs/tickers-config.js` (updated)
- `trading-ui/scripts/tickers.js` (updated)

**Migration Script**:
- `Backend/migrations/create_ticker_provider_symbols_table.py` (updated)

### Step 5: Restart Server

After syncing code:

```bash
# Stop server
./stop_production.sh

# Start server
./start_production.sh
```

## Rollback Instructions

If migration needs to be rolled back:

```bash
# Connect to database
psql -h localhost -U TikTrakDBAdmin -d TikTrack-db-production

# Drop table (CASCADE will also drop indexes and constraints)
DROP TABLE IF EXISTS ticker_provider_symbols CASCADE;

# Exit psql
\q
```

**Note**: Rolling back will delete all provider symbol mappings. Make sure to backup data if needed.

## Post-Migration Verification

1. **Check Table Exists**:
```sql
SELECT COUNT(*) FROM ticker_provider_symbols;
-- Should return 0 (no mappings yet)
```

2. **Test API Endpoint**:
```bash
# Get provider symbols for a ticker (should return empty array)
curl http://localhost:5001/api/tickers/1/provider-symbols
```

3. **Test Ticker Creation with Mapping**:
```bash
curl -X POST http://localhost:5001/api/tickers \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "TEST",
    "name": "Test Ticker",
    "type": "stock",
    "currency_id": 1,
    "status": "open",
    "provider_symbols": {
      "yahoo_finance": "TEST.MI"
    }
  }'
```

4. **Verify Mapping Created**:
```sql
SELECT * FROM ticker_provider_symbols WHERE ticker_id = (SELECT id FROM tickers WHERE symbol = 'TEST');
```

## Troubleshooting

### Error: Table already exists

If the table already exists, the migration script will ask for confirmation before dropping and recreating it.

**Solution**: Review existing data before proceeding.

### Error: Required tables do not exist

The migration requires `tickers` and `external_data_providers` tables to exist.

**Solution**: Ensure all previous migrations have been run.

### Error: Foreign key constraint violation

This can occur if trying to create a mapping for a non-existent ticker or provider.

**Solution**: Verify ticker and provider IDs exist before creating mappings.

## Support

For issues or questions, contact the development team.

