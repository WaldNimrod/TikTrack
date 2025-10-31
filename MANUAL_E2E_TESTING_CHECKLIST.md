# Manual E2E Testing Checklist

## Purpose
Comprehensive manual testing checklist for all 8 user pages + preferences page to verify CRUD operations work correctly after standardization.

**Date**: January 30, 2025  
**Tester**: ________________  
**Environment**: Development (localhost:8080)

---

## Pre-Testing Setup

### Environment Preparation
- [ ] Server is running (`./start_server.sh`)
- [ ] Database is accessible
- [ ] All 9 pages load without errors
- [ ] Browser console shows no critical errors
- [ ] Cache is cleared (DevTools → Application → Clear Storage)

### Test Accounts Setup
- [ ] At least 1 trading account exists
- [ ] At least 1 ticker exists
- [ ] Clean test environment (optional: delete all test data)

---

## Page 1: Cash Flows (תזרימי מזומנים)

### 1.1 Initial Load
- [ ] Page loads successfully
- [ ] Table displays existing cash flows
- [ ] Summary statistics are visible
- [ ] Add button is visible and clickable

### 1.2 CREATE Operation
- [ ] Click "Add Cash Flow" button
- [ ] Modal opens with form
- [ ] Fill form:
  - [ ] Amount: 1000
  - [ ] Account: Select first account
  - [ ] Type: Deposit
  - [ ] Date: Today's date
- [ ] Click Save
- [ ] Success notification appears
- [ ] Modal closes automatically
- [ ] NEW record appears in table immediately
- [ ] Summary statistics updated
- [ ] No page refresh occurred

### 1.3 READ Operation
- [ ] Click "View" on first record
- [ ] Details modal opens
- [ ] All data displayed correctly
- [ ] Close modal works

### 1.4 UPDATE Operation
- [ ] Click "Edit" on first record
- [ ] Modal opens with data pre-filled
- [ ] Change amount to 2000
- [ ] Click Save
- [ ] Success notification appears
- [ ] Modal closes automatically
- [ ] Table updates immediately with new amount
- [ ] No page refresh occurred

### 1.5 DELETE Operation
- [ ] Note initial row count
- [ ] Click "Delete" on last record
- [ ] Confirmation dialog appears
- [ ] Click Confirm
- [ ] Success notification appears
- [ ] Record disappears from table immediately
- [ ] Row count decreased by 1
- [ ] No page refresh occurred

### 1.6 Cache Test
- [ ] Perform one more CREATE operation
- [ ] Verify table updates immediately
- [ ] Open DevTools → Network
- [ ] Check that API call uses `?_t=` parameter
- [ ] Check that `Cache-Control: no-cache` header sent

---

## Page 2: Trades (עסקאות)

### 2.1 Initial Load
- [ ] Page loads successfully
- [ ] Table displays existing trades
- [ ] Summary statistics visible

### 2.2 CREATE Operation
- [ ] Click Add
- [ ] Fill form with valid data
- [ ] Save
- [ ] Verify immediate table update
- [ ] Verify no page refresh

### 2.3 UPDATE Operation
- [ ] Edit existing trade
- [ ] Save
- [ ] Verify immediate update
- [ ] Verify no page refresh

### 2.4 DELETE Operation
- [ ] Delete trade
- [ ] Confirm
- [ ] Verify immediate removal
- [ ] Verify no page refresh

---

## Page 3: Trade Plans (תכניות מסחר)

### 3.1 CREATE Operation
- [ ] Add new trade plan
- [ ] Verify immediate table update
- [ ] Verify no page refresh

### 3.2 READ Operation
- [ ] View details
- [ ] Verify all data displayed

### 3.3 UPDATE Operation
- [ ] Edit trade plan
- [ ] Verify immediate update

### 3.4 DELETE Operation
- [ ] Delete trade plan
- [ ] Verify immediate removal

---

## Page 4: Trading Accounts (חשבונות מסחר)

### 4.1 CREATE Operation
- [ ] Add new account
- [ ] Verify immediate update

### 4.2 UPDATE Operation
- [ ] Edit account
- [ ] Verify immediate update

### 4.3 DELETE Operation
- [ ] Delete account
- [ ] Verify immediate removal

### 4.4 Linked Items Check
- [ ] Try to delete account with linked trades
- [ ] Verify warning message appears
- [ ] Verify deletion prevented

---

## Page 5: Alerts (התראות)

### 5.1 CREATE Operation
- [ ] Add new alert
- [ ] Verify immediate update

### 5.2 READ Operation
- [ ] View alert details
- [ ] Verify data displayed

### 5.3 UPDATE Operation
- [ ] Edit alert
- [ ] Verify immediate update

### 5.4 DELETE Operation
- [ ] Delete alert
- [ ] Verify immediate removal

---

## Page 6: Executions (ביצועים)

### 6.1 CREATE Operation
- [ ] Add new execution
- [ ] Verify immediate update

### 6.2 UPDATE Operation
- [ ] Edit execution
- [ ] Verify immediate update

### 6.3 DELETE Operation
- [ ] Delete execution
- [ ] Verify immediate removal

---

## Page 7: Tickers (ניירות ערך)

### 7.1 CREATE Operation
- [ ] Add new ticker
- [ ] Verify immediate update

### 7.2 UPDATE Operation
- [ ] Edit ticker
- [ ] Verify immediate update

### 7.3 Linked Items Check
- [ ] Try to delete ticker with linked trades
- [ ] Verify warning appears
- [ ] Verify deletion prevented

### 7.4 Market Data Integration
- [ ] Verify market data loads
- [ ] Verify external data integration works

---

## Page 8: Notes (הערות)

### 8.1 CREATE Operation
- [ ] Add new note
- [ ] Verify immediate update

### 8.2 File Upload (if applicable)
- [ ] Add note with attachment
- [ ] Verify file upload works
- [ ] Verify attachment displays

### 8.3 UPDATE Operation
- [ ] Edit note
- [ ] Verify immediate update

### 8.4 DELETE Operation
- [ ] Delete note
- [ ] Verify immediate removal

---

## Page 9: Preferences (העדפות)

### 9.1 Load Preferences
- [ ] Page loads successfully
- [ ] All preference categories visible
- [ ] Current profile displayed

### 9.2 Profile Switch
- [ ] Note current active profile
- [ ] Select different profile from dropdown
- [ ] Click "Switch Profile"
- [ ] Success notification appears
- [ ] Preferences reload immediately
- [ ] Active profile indicator updates
- [ ] No page refresh occurred

### 9.3 Create Profile
- [ ] Enter new profile name
- [ ] Click "Create Profile"
- [ ] Success notification appears
- [ ] New profile appears in dropdown
- [ ] Profile counts updated

### 9.4 Update Preferences
- [ ] Change any setting (e.g., color, display option)
- [ ] Click Save
- [ ] Success notification appears
- [ ] Setting persists after page reload

### 9.5 Cache Verification
- [ ] Switch profiles multiple times
- [ ] Verify preferences load correctly each time
- [ ] Check DevTools → Network for cache behavior
- [ ] Verify no stale data

---

## Cross-Page Consistency Tests

### Consistency Check 1: Table Refresh Pattern
- [ ] All 8 pages: table updates immediately after CREATE
- [ ] All 8 pages: table updates immediately after UPDATE
- [ ] All 8 pages: table updates immediately after DELETE
- [ ] All 8 pages: no page refresh occurs

### Consistency Check 2: Modal Behavior
- [ ] All 8 pages: modals open correctly
- [ ] All 8 pages: save button closes modal after success
- [ ] All 8 pages: cancel button closes modal without saving
- [ ] All 8 pages: validation works correctly

### Consistency Check 3: Notifications
- [ ] Success notifications appear after all CREATE operations
- [ ] Success notifications appear after all UPDATE operations
- [ ] Success notifications appear after all DELETE operations
- [ ] Error notifications appear for invalid data
- [ ] Error notifications appear for network failures

### Consistency Check 4: Button System
- [ ] All action buttons use `data-onclick` attributes
- [ ] All buttons styled consistently
- [ ] Hover states work correctly
- [ ] Disabled states work correctly

---

## Error Handling Tests

### Invalid Data Tests
- [ ] Cash Flows: Try to save with negative amount → error message
- [ ] Cash Flows: Try to save without required fields → error message
- [ ] Trades: Try to save with invalid price → error message
- [ ] All pages: Verify field-level validation works

### Network Error Tests
- [ ] Disconnect network
- [ ] Try to perform CRUD operation
- [ ] Verify error notification appears
- [ ] Verify user-friendly error message
- [ ] Reconnect network
- [ ] Try again → should work

### Constraint Violation Tests
- [ ] Try to delete ticker with active trades → warning shown
- [ ] Try to delete account with linked items → warning shown
- [ ] Verify deletion prevented when appropriate

---

## Performance Tests

### Load Time Tests
- [ ] Cash Flows page loads in < 2 seconds
- [ ] Trades page loads in < 2 seconds
- [ ] Trade Plans page loads in < 2 seconds
- [ ] Trading Accounts page loads in < 2 seconds
- [ ] Alerts page loads in < 2 seconds
- [ ] Executions page loads in < 2 seconds
- [ ] Tickers page loads in < 2 seconds
- [ ] Notes page loads in < 2 seconds
- [ ] Preferences page loads in < 2 seconds

### Responsiveness Tests
- [ ] CREATE operations complete in < 1 second
- [ ] UPDATE operations complete in < 1 second
- [ ] DELETE operations complete in < 1 second
- [ ] Table refresh is instant (< 100ms after API response)

### Memory Leak Tests
- [ ] Perform 20+ CRUD operations on any page
- [ ] Check browser memory usage
- [ ] Verify no memory leak
- [ ] Verify performance doesn't degrade

---

## Browser Console Checks

### All Pages Check
- [ ] No JavaScript errors in console
- [ ] No deprecation warnings
- [ ] No memory warnings
- [ ] All API calls return 200/201 status
- [ ] No CORS errors
- [ ] No network timeouts

### Cache Management Logs
- [ ] Verify cache invalidation logs appear on mutations
- [ ] Verify cache bypass logs appear on reads
- [ ] Verify no redundant cache operations

---

## Final Verification

### Complete CRUD Cycle Test
For each of the 8 pages:
1. [ ] Clean state: Delete all test records
2. [ ] Create 3 new records
3. [ ] Verify all 3 appear immediately
4. [ ] Edit each record
5. [ ] Verify changes appear immediately
6. [ ] Delete all 3 records
7. [ ] Verify all removed immediately
8. [ ] Refresh page
9. [ ] Verify clean state maintained

### Production Readiness
- [ ] All tests pass
- [ ] No console errors
- [ ] No memory leaks
- [ ] Performance acceptable
- [ ] User experience smooth
- [ ] Data integrity maintained

---

## Test Results Summary

### Overall Status
- [ ] ✅ All tests passed
- [ ] ⚠️ Some issues found (document below)
- [ ] ❌ Critical issues found (document below)

### Issues Found
_List any issues discovered during testing:_

1. **Issue**: ________________
   - **Page**: ________________
   - **Severity**: Critical / Warning / Minor
   - **Steps to reproduce**: ________________
   - **Expected**: ________________
   - **Actual**: ________________

2. **Issue**: ________________
   - **Page**: ________________
   - **Severity**: Critical / Warning / Minor
   - **Steps to reproduce**: ________________
   - **Expected**: ________________
   - **Actual**: ________________

### Recommendations
_Any suggestions for improvement:_

---

## Sign-Off

**Tester Name**: ________________  
**Date**: ________________  
**Status**: ✅ Passed / ⚠️ Conditional Pass / ❌ Failed  
**Comments**: ________________

---

## Next Steps

After completing manual testing:
1. Document any issues found
2. Create bug reports for critical issues
3. Proceed to automated E2E tests if manual tests pass
4. Update documentation with test results
5. Create final production readiness report




