# Ticker Provider Symbol Mapping - Test Scenarios

## Overview

This document provides recommended test scenarios for the Ticker Provider Symbol Mapping system. These scenarios should be tested both automatically (via unit/integration tests) and manually (via UI testing).

## Test Categories

1. **Basic Functionality** - Core mapping operations
2. **UI Testing** - Frontend integration
3. **API Testing** - REST API endpoints
4. **Integration Testing** - System integration
5. **Edge Cases** - Boundary conditions
6. **Performance Testing** - Real-world performance
7. **Production Scenarios** - Real-world use cases

---

## 1. Basic Functionality Tests

### Scenario 1.1: Create Ticker with Provider Symbol Mapping
**Priority**: High  
**Type**: Manual + Automated

**Steps**:
1. Open tickers page
2. Click "Add Ticker"
3. Fill in basic ticker info:
   - Symbol: `500X`
   - Name: `iShares Core S&P 500 UCITS ETF`
   - Type: `ETF`
   - Currency: `USD`
   - Status: `Open`
4. Expand "מיפויי ספקי נתונים" section
5. Enter provider symbol:
   - Yahoo Finance: `500X.MI`
6. Save ticker

**Expected Results**:
- ✅ Ticker created successfully
- ✅ Provider symbol mapping saved
- ✅ Notification shows success
- ✅ Ticker appears in table with correct symbol `500X`

**Verification**:
```sql
SELECT * FROM ticker_provider_symbols WHERE ticker_id = (SELECT id FROM tickers WHERE symbol = '500X');
-- Should show: provider_symbol = '500X.MI', provider_id = 1 (Yahoo Finance)
```

**API Verification**:
```bash
curl http://localhost:8080/api/tickers/1/provider-symbols
# Should return mapping for Yahoo Finance
```

---

### Scenario 1.2: Edit Ticker and Update Provider Symbol
**Priority**: High  
**Type**: Manual + Automated

**Steps**:
1. Open tickers page
2. Find ticker `500X` and click "Edit"
3. Verify provider symbol field shows `500X.MI`
4. Change provider symbol to `500X.IT`
5. Save changes

**Expected Results**:
- ✅ Ticker updated successfully
- ✅ Provider symbol mapping updated to `500X.IT`
- ✅ Old mapping replaced (not duplicated)

**Verification**:
```sql
SELECT * FROM ticker_provider_symbols WHERE ticker_id = (SELECT id FROM tickers WHERE symbol = '500X');
-- Should show: provider_symbol = '500X.IT' (updated)
```

---

### Scenario 1.3: Remove Provider Symbol Mapping
**Priority**: Medium  
**Type**: Manual

**Steps**:
1. Open tickers page
2. Edit ticker with provider symbol mapping
3. Clear provider symbol field (leave empty)
4. Save changes

**Expected Results**:
- ✅ Ticker updated successfully
- ✅ Provider symbol mapping removed
- ✅ System falls back to internal symbol

**Verification**:
```sql
SELECT * FROM ticker_provider_symbols WHERE ticker_id = (SELECT id FROM tickers WHERE symbol = '500X');
-- Should return no rows
```

---

### Scenario 1.4: Create Ticker Without Provider Symbol Mapping
**Priority**: High  
**Type**: Manual

**Steps**:
1. Open tickers page
2. Click "Add Ticker"
3. Fill in basic ticker info:
   - Symbol: `AAPL`
   - Name: `Apple Inc.`
   - Type: `Stock`
   - Currency: `USD`
   - Status: `Open`
4. **Do NOT** fill provider symbol fields
5. Save ticker

**Expected Results**:
- ✅ Ticker created successfully
- ✅ No provider symbol mapping created
- ✅ System uses internal symbol `AAPL` for external data

**Verification**:
- Ticker should work normally with Yahoo Finance using `AAPL`
- No mapping should exist in database

---

## 2. UI Testing

### Scenario 2.1: Provider Symbol Fields Load Correctly
**Priority**: High  
**Type**: Manual

**Steps**:
1. Open tickers page
2. Click "Add Ticker"
3. Verify "מיפויי ספקי נתונים" section exists
4. Click to expand section
5. Verify provider fields load dynamically

**Expected Results**:
- ✅ Section is collapsible
- ✅ Provider fields appear for active providers
- ✅ Fields have correct labels (e.g., "Yahoo Finance")
- ✅ Placeholder text is helpful
- ✅ No JavaScript errors in console

---

### Scenario 2.2: Edit Ticker - Load Existing Mappings
**Priority**: High  
**Type**: Manual

**Steps**:
1. Create ticker `500X` with mapping `500X.MI` (via API or UI)
2. Open tickers page
3. Click "Edit" on ticker `500X`
4. Expand "מיפויי ספקי נתונים" section

**Expected Results**:
- ✅ Provider symbol field for Yahoo Finance shows `500X.MI`
- ✅ Field is pre-filled correctly
- ✅ Can edit and save changes

---

### Scenario 2.3: Multiple Providers Support
**Priority**: Medium  
**Type**: Manual

**Steps**:
1. Ensure multiple external data providers exist in database
2. Open tickers page
3. Click "Add Ticker"
4. Expand "מיפויי ספקי נתונים" section

**Expected Results**:
- ✅ Fields appear for all active providers
- ✅ Each provider has its own input field
- ✅ Can enter different symbols for different providers

**Example**:
- Yahoo Finance: `500X.MI`
- Google Finance: `500X:MI` (if provider exists)

---

## 3. API Testing

### Scenario 3.1: Create Ticker via API with Provider Symbols
**Priority**: High  
**Type**: Manual + Automated

**Request**:
```bash
curl -X POST http://localhost:8080/api/tickers \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "500X",
    "name": "iShares Core S&P 500 UCITS ETF",
    "type": "etf",
    "currency_id": 1,
    "status": "open",
    "provider_symbols": {
      "yahoo_finance": "500X.MI"
    }
  }'
```

**Expected Response**:
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "symbol": "500X",
    "name": "iShares Core S&P 500 UCITS ETF",
    ...
  },
  "message": "Ticker created successfully"
}
```

**Verification**:
```bash
curl http://localhost:8080/api/tickers/1/provider-symbols
# Should return mapping
```

---

### Scenario 3.2: Update Ticker via API with Provider Symbols
**Priority**: High  
**Type**: Manual + Automated

**Request**:
```bash
curl -X PUT http://localhost:8080/api/tickers/1 \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "500X",
    "name": "Updated Name",
    "provider_symbols": {
      "yahoo_finance": "500X.IT"
    }
  }'
```

**Expected Results**:
- ✅ Ticker updated
- ✅ Provider symbol mapping updated
- ✅ Old mapping replaced

---

### Scenario 3.3: Get Provider Symbols via API
**Priority**: Medium  
**Type**: Manual + Automated

**Request**:
```bash
curl http://localhost:8080/api/tickers/1/provider-symbols
```

**Expected Response**:
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

---

### Scenario 3.4: Remove Provider Symbols via API
**Priority**: Medium  
**Type**: Manual + Automated

**Request**:
```bash
curl -X PUT http://localhost:8080/api/tickers/1 \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "500X",
    "provider_symbols": {}
  }'
```

**Expected Results**:
- ✅ All provider symbol mappings removed
- ✅ System falls back to internal symbol

---

## 4. Integration Testing

### Scenario 4.1: Yahoo Finance Uses Provider Symbol
**Priority**: Critical  
**Type**: Manual + Automated

**Steps**:
1. Create ticker `500X` with mapping `500X.MI`
2. Trigger external data fetch for ticker `500X`
3. Check server logs

**Expected Results**:
- ✅ Yahoo Finance API called with `500X.MI`
- ✅ Quote data returned and cached
- ✅ Quote stored with internal symbol `500X`
- ✅ No errors in logs

**Verification**:
```bash
# Check logs for API call
grep "500X.MI" Backend/logs/external_data.log
# Should show API call with provider symbol
```

---

### Scenario 4.2: Yahoo Finance Falls Back to Internal Symbol
**Priority**: Critical  
**Type**: Manual + Automated

**Steps**:
1. Create ticker `AAPL` **without** provider symbol mapping
2. Trigger external data fetch for ticker `AAPL`
3. Check server logs

**Expected Results**:
- ✅ Yahoo Finance API called with `AAPL` (internal symbol)
- ✅ Quote data returned and cached
- ✅ No errors in logs

---

### Scenario 4.3: Import Creates Mapping Automatically
**Priority**: High  
**Type**: Manual

**Steps**:
1. Prepare import file with ticker `500X` (shortened symbol)
2. Ensure metadata contains `display_symbol = "500X.MI"`
3. Run import process
4. Verify ticker created

**Expected Results**:
- ✅ Ticker `500X` created
- ✅ Provider symbol mapping `500X.MI` created automatically
- ✅ Mapping visible in database

**Verification**:
```sql
SELECT t.symbol, tps.provider_symbol 
FROM tickers t
JOIN ticker_provider_symbols tps ON t.id = tps.ticker_id
WHERE t.symbol = '500X';
-- Should show: 500X -> 500X.MI
```

---

### Scenario 4.4: Batch Quote Fetch with Mappings
**Priority**: Medium  
**Type**: Manual + Automated

**Steps**:
1. Create multiple tickers with mappings:
   - `500X` → `500X.MI`
   - `ANAU` → `ANAU.DE`
   - `AAPL` → (no mapping)
2. Trigger batch quote fetch for all tickers

**Expected Results**:
- ✅ Yahoo Finance API called with correct symbols:
  - `500X.MI` for ticker `500X`
  - `ANAU.DE` for ticker `ANAU`
  - `AAPL` for ticker `AAPL` (fallback)
- ✅ All quotes returned and cached
- ✅ Quotes stored with internal symbols

---

## 5. Edge Cases

### Scenario 5.1: Invalid Provider Name
**Priority**: Medium  
**Type**: Manual

**Steps**:
1. Create ticker via API with invalid provider name:
```json
{
  "symbol": "TEST",
  "provider_symbols": {
    "invalid_provider": "TEST.MI"
  }
}
```

**Expected Results**:
- ✅ Ticker created successfully
- ✅ Invalid provider mapping ignored (warning logged)
- ✅ Valid provider mappings created

---

### Scenario 5.2: Empty Provider Symbol
**Priority**: Low  
**Type**: Manual

**Steps**:
1. Create ticker with empty provider symbol:
```json
{
  "symbol": "TEST",
  "provider_symbols": {
    "yahoo_finance": ""
  }
}
```

**Expected Results**:
- ✅ Ticker created successfully
- ✅ Empty provider symbol ignored
- ✅ No mapping created

---

### Scenario 5.3: Very Long Provider Symbol
**Priority**: Low  
**Type**: Manual

**Steps**:
1. Try to create ticker with very long provider symbol (>50 chars)

**Expected Results**:
- ✅ Validation error or truncation
- ✅ Error message displayed to user

---

### Scenario 5.4: Special Characters in Provider Symbol
**Priority**: Medium  
**Type**: Manual

**Steps**:
1. Create ticker with provider symbol containing special characters:
   - `500X.MI`
   - `ANAU.DE`
   - `TEST:MI`

**Expected Results**:
- ✅ Provider symbols with valid characters accepted
- ✅ Invalid characters rejected with error

---

### Scenario 5.5: Delete Ticker with Provider Symbol Mapping
**Priority**: Medium  
**Type**: Manual

**Steps**:
1. Create ticker with provider symbol mapping
2. Delete ticker

**Expected Results**:
- ✅ Ticker deleted
- ✅ Provider symbol mapping deleted (CASCADE)
- ✅ No orphaned records

**Verification**:
```sql
SELECT * FROM ticker_provider_symbols WHERE ticker_id = <deleted_id>;
-- Should return no rows
```

---

## 6. Performance Testing

### Scenario 6.1: Cache Performance
**Priority**: Medium  
**Type**: Automated + Manual

**Steps**:
1. Create ticker with provider symbol mapping
2. Fetch provider symbol multiple times
3. Measure response time

**Expected Results**:
- ✅ First call: Database query (slower)
- ✅ Subsequent calls: Cache hit (faster)
- ✅ Cache improves performance by at least 2x

---

### Scenario 6.2: Batch Operations Performance
**Priority**: Medium  
**Type**: Automated

**Steps**:
1. Create 100 tickers with provider symbol mappings
2. Fetch all mappings in batch
3. Measure response time

**Expected Results**:
- ✅ Batch operation completes in < 1 second
- ✅ No performance degradation

---

### Scenario 6.3: Yahoo Finance Adapter Performance
**Priority**: Medium  
**Type**: Automated

**Steps**:
1. Create 50 tickers with provider symbol mappings
2. Fetch quotes for all tickers in batch
3. Measure response time

**Expected Results**:
- ✅ Batch quote fetch completes in < 5 seconds
- ✅ Provider symbol lookup doesn't significantly impact performance

---

## 7. Production Scenarios

### Scenario 7.1: Real-World Example - 500X
**Priority**: Critical  
**Type**: Manual

**Steps**:
1. Create ticker `500X` with mapping `500X.MI`
2. Wait for external data refresh
3. Verify quote data appears correctly
4. Check that Yahoo Finance API was called with `500X.MI`

**Expected Results**:
- ✅ Quote data appears in UI
- ✅ Price, change, volume displayed correctly
- ✅ Data fetched using provider symbol `500X.MI`
- ✅ Data stored with internal symbol `500X`

---

### Scenario 7.2: Real-World Example - ANAU
**Priority**: Critical  
**Type**: Manual

**Steps**:
1. Create ticker `ANAU` with mapping `ANAU.DE`
2. Wait for external data refresh
3. Verify quote data appears correctly
4. Check that Yahoo Finance API was called with `ANAU.DE`

**Expected Results**:
- ✅ Quote data appears in UI
- ✅ Data fetched using provider symbol `ANAU.DE`
- ✅ Data stored with internal symbol `ANAU`

---

### Scenario 7.3: Import Real Data File
**Priority**: High  
**Type**: Manual

**Steps**:
1. Prepare real import file with tickers that need mappings
2. Run import process
3. Verify mappings created automatically

**Expected Results**:
- ✅ Tickers imported successfully
- ✅ Mappings created automatically where `display_symbol` differs
- ✅ All tickers work correctly with external data

---

### Scenario 7.4: Migration to Production
**Priority**: Critical  
**Type**: Manual

**Steps**:
1. Run migration script on production database
2. Verify table created correctly
3. Verify indexes created
4. Test creating ticker with mapping
5. Verify external data works correctly

**Expected Results**:
- ✅ Migration completes successfully
- ✅ Table structure correct
- ✅ All constraints and indexes in place
- ✅ System works correctly after migration

---

## 8. Error Handling Tests

### Scenario 8.1: Database Connection Failure
**Priority**: Low  
**Type**: Manual

**Steps**:
1. Simulate database connection failure
2. Try to create ticker with provider symbol mapping

**Expected Results**:
- ✅ Error handled gracefully
- ✅ User-friendly error message displayed
- ✅ No data corruption

---

### Scenario 8.2: Provider Not Found
**Priority**: Medium  
**Type**: Manual

**Steps**:
1. Try to create mapping for non-existent provider

**Expected Results**:
- ✅ Warning logged
- ✅ Mapping skipped (not created)
- ✅ Ticker creation continues successfully

---

### Scenario 8.3: Duplicate Mapping
**Priority**: Medium  
**Type**: Manual

**Steps**:
1. Create ticker with provider symbol mapping
2. Try to create same mapping again

**Expected Results**:
- ✅ Mapping updated (not duplicated)
- ✅ No unique constraint violation
- ✅ Latest value saved

---

## 9. UI/UX Tests

### Scenario 9.1: Responsive Design
**Priority**: Medium  
**Type**: Manual

**Steps**:
1. Open tickers page on mobile device
2. Add/edit ticker with provider symbols
3. Verify UI is usable

**Expected Results**:
- ✅ Provider symbol section is accessible
- ✅ Fields are readable and usable
- ✅ No layout issues

---

### Scenario 9.2: RTL Support
**Priority**: Medium  
**Type**: Manual

**Steps**:
1. Open tickers page (RTL mode)
2. Add/edit ticker with provider symbols
3. Verify RTL layout correct

**Expected Results**:
- ✅ All text displays correctly in RTL
- ✅ Fields align correctly
- ✅ No layout issues

---

### Scenario 9.3: Accessibility
**Priority**: Low  
**Type**: Manual

**Steps**:
1. Use screen reader
2. Navigate to provider symbol fields
3. Verify labels are announced correctly

**Expected Results**:
- ✅ Screen reader announces field labels
- ✅ Form is navigable via keyboard
- ✅ All interactive elements accessible

---

## 10. Regression Tests

### Scenario 10.1: Existing Tickers Still Work
**Priority**: Critical  
**Type**: Manual

**Steps**:
1. Verify existing tickers (without mappings) still work
2. Check external data fetch
3. Verify no breaking changes

**Expected Results**:
- ✅ All existing tickers work normally
- ✅ External data fetch works as before
- ✅ No performance degradation

---

### Scenario 10.2: API Backward Compatibility
**Priority**: Critical  
**Type**: Manual

**Steps**:
1. Create ticker via API without `provider_symbols` field
2. Verify ticker created successfully

**Expected Results**:
- ✅ Ticker created successfully
- ✅ No errors
- ✅ System works as before

---

## Test Execution Checklist

### Pre-Testing Setup
- [ ] Database migration run successfully
- [ ] Server running and accessible
- [ ] External data providers configured
- [ ] Test data prepared

### Core Functionality
- [ ] Scenario 1.1: Create with mapping ✅
- [ ] Scenario 1.2: Edit and update mapping ✅
- [ ] Scenario 1.3: Remove mapping ✅
- [ ] Scenario 1.4: Create without mapping ✅

### UI Testing
- [ ] Scenario 2.1: Fields load correctly ✅
- [ ] Scenario 2.2: Load existing mappings ✅
- [ ] Scenario 2.3: Multiple providers ✅

### API Testing
- [ ] Scenario 3.1: Create via API ✅
- [ ] Scenario 3.2: Update via API ✅
- [ ] Scenario 3.3: Get mappings via API ✅
- [ ] Scenario 3.4: Remove via API ✅

### Integration Testing
- [ ] Scenario 4.1: Yahoo Finance uses mapping ✅
- [ ] Scenario 4.2: Yahoo Finance fallback ✅
- [ ] Scenario 4.3: Import auto-mapping ✅
- [ ] Scenario 4.4: Batch fetch ✅

### Production Scenarios
- [ ] Scenario 7.1: Real-world 500X ✅
- [ ] Scenario 7.2: Real-world ANAU ✅
- [ ] Scenario 7.3: Import real data ✅
- [ ] Scenario 7.4: Production migration ✅

---

## Test Data

### Test Tickers

| Symbol | Name | Type | Provider Symbol (Yahoo) | Notes |
|--------|------|------|-------------------------|-------|
| 500X | iShares Core S&P 500 UCITS ETF | ETF | 500X.MI | Italian market |
| ANAU | Annaly Capital Management | Stock | ANAU.DE | German market |
| AAPL | Apple Inc. | Stock | (none) | No mapping needed |
| TEST | Test Ticker | Stock | TEST.MI | For testing |

---

## Notes

- **Automated Tests**: Scenarios marked with "Automated" are covered by unit/integration tests
- **Manual Tests**: Scenarios marked with "Manual" should be tested manually in UI
- **Priority**: Critical = Must test before production, High = Important, Medium = Recommended, Low = Optional

---

## Related Documentation

- [Architecture Documentation](TICKER_PROVIDER_SYMBOL_MAPPING.md)
- [Developer Guide](../03-DEVELOPMENT/GUIDES/TICKER_PROVIDER_SYMBOL_MAPPING_DEVELOPER_GUIDE.md)
- [API Documentation](../../api/TICKERS_API.md)

