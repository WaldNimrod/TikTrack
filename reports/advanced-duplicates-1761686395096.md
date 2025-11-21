# Advanced Duplicate Code Detection Report

**Generated**: 10/28/2025, 11:19:55 PM

---

## 📊 Summary

- **Total Functions Analyzed**: 488
- **Total Duplicates Found**: 3626
- **Exact Duplicates**: 35 🔴
- **Near Duplicates**: 194 🟡
- **Similar Patterns**: 1167 🟠
- **Potential Duplicates**: 2230 🔵

## 🔴 Critical Issues - Exact Duplicates

**Action Required**: Immediate refactoring needed

### updatePageSummaryStats vs updatePageSummaryStats

- **Similarity**: 98.6%
- **Confidence**: 90.0%
- **Files**: alerts.js (line 846) ↔ cash_flows.js (line 870)
- **Category**: UI_MANAGEMENT

**Recommendations**:
- **HIGH**: Functions are nearly identical - merge into shared utility
  - Steps: Create shared utility function, Update both files to use shared function, Remove duplicate implementations

### updatePageSummaryStats vs updatePageSummaryStats

- **Similarity**: 95.7%
- **Confidence**: 90.0%
- **Files**: trade_plans.js (line 1736) ↔ cash_flows.js (line 870)
- **Category**: UI_MANAGEMENT

**Recommendations**:
- **HIGH**: Functions are nearly identical - merge into shared utility
  - Steps: Create shared utility function, Update both files to use shared function, Remove duplicate implementations

### updatePageSummaryStats vs updatePageSummaryStats

- **Similarity**: 95.2%
- **Confidence**: 90.0%
- **Files**: alerts.js (line 846) ↔ trade_plans.js (line 1736)
- **Category**: UI_MANAGEMENT

**Recommendations**:
- **HIGH**: Functions are nearly identical - merge into shared utility
  - Steps: Create shared utility function, Update both files to use shared function, Remove duplicate implementations

### generateDetailedLog vs generateDetailedLog

- **Similarity**: 95.5%
- **Confidence**: 85.0%
- **Files**: alerts.js (line 2704) ↔ trading_accounts.js (line 2239)
- **Category**: LOGGING

**Recommendations**:
- **HIGH**: Functions are nearly identical - merge into shared utility
  - Steps: Create shared utility function, Update both files to use shared function, Remove duplicate implementations

### catch vs catch

- **Similarity**: 99.7%
- **Confidence**: 50.0%
- **Files**: alerts.js (line 3594) ↔ notes.js (line 2394)
- **Category**: VALIDATION

**Recommendations**:
- **HIGH**: Functions are nearly identical - merge into shared utility
  - Steps: Create shared utility function, Update both files to use shared function, Remove duplicate implementations
- **HIGH**: Consider using global validation system
  - Steps: Check if global validator exists, Implement shared validation rules, Use consistent validation approach

### catch vs catch

- **Similarity**: 99.5%
- **Confidence**: 50.0%
- **Files**: trades.js (line 2141) ↔ tickers.js (line 2241)
- **Category**: VALIDATION

**Recommendations**:
- **HIGH**: Functions are nearly identical - merge into shared utility
  - Steps: Create shared utility function, Update both files to use shared function, Remove duplicate implementations
- **HIGH**: Consider using global validation system
  - Steps: Check if global validator exists, Implement shared validation rules, Use consistent validation approach

### catch vs catch

- **Similarity**: 99.4%
- **Confidence**: 50.0%
- **Files**: executions.js (line 3935) ↔ tickers.js (line 2241)
- **Category**: VALIDATION

**Recommendations**:
- **HIGH**: Functions are nearly identical - merge into shared utility
  - Steps: Create shared utility function, Update both files to use shared function, Remove duplicate implementations
- **HIGH**: Consider using global validation system
  - Steps: Check if global validator exists, Implement shared validation rules, Use consistent validation approach

### catch vs catch

- **Similarity**: 99.4%
- **Confidence**: 50.0%
- **Files**: notes.js (line 2394) ↔ tickers.js (line 2241)
- **Category**: VALIDATION

**Recommendations**:
- **HIGH**: Functions are nearly identical - merge into shared utility
  - Steps: Create shared utility function, Update both files to use shared function, Remove duplicate implementations
- **HIGH**: Consider using global validation system
  - Steps: Check if global validator exists, Implement shared validation rules, Use consistent validation approach

### catch vs catch

- **Similarity**: 99.2%
- **Confidence**: 50.0%
- **Files**: trades.js (line 2141) ↔ executions.js (line 3935)
- **Category**: VALIDATION

**Recommendations**:
- **HIGH**: Functions are nearly identical - merge into shared utility
  - Steps: Create shared utility function, Update both files to use shared function, Remove duplicate implementations
- **HIGH**: Consider using global validation system
  - Steps: Check if global validator exists, Implement shared validation rules, Use consistent validation approach

### catch vs catch

- **Similarity**: 99.2%
- **Confidence**: 50.0%
- **Files**: trades.js (line 2141) ↔ alerts.js (line 3594)
- **Category**: VALIDATION

**Recommendations**:
- **HIGH**: Functions are nearly identical - merge into shared utility
  - Steps: Create shared utility function, Update both files to use shared function, Remove duplicate implementations
- **HIGH**: Consider using global validation system
  - Steps: Check if global validator exists, Implement shared validation rules, Use consistent validation approach

## 🟡 High Priority - Near Duplicates

### populateSelect vs populateSelect

- **Similarity**: 93.8%
- **Confidence**: 100.0%
- **Files**: alerts.js ↔ notes.js
- **Category**: UNCATEGORIZED

### updateTrade vs updateTradingAccount

- **Similarity**: 89.2%
- **Confidence**: 100.0%
- **Files**: trades.js ↔ trading_accounts.js
- **Category**: UI_MANAGEMENT

### saveTrade vs saveTradePlan

- **Similarity**: 87.0%
- **Confidence**: 100.0%
- **Files**: trades.js ↔ trade_plans.js
- **Category**: EVENT_HANDLING

### reactivateTrade vs reactivateTradePlan

- **Similarity**: 86.8%
- **Confidence**: 100.0%
- **Files**: trades.js ↔ trade_plans.js
- **Category**: UNCATEGORIZED

### generateDetailedLogForTrades vs generateDetailedLogForAlerts

- **Similarity**: 94.6%
- **Confidence**: 90.0%
- **Files**: trades.js ↔ alerts.js
- **Category**: LOGGING

### generateDetailedLog vs generateDetailedLog

- **Similarity**: 87.8%
- **Confidence**: 95.0%
- **Files**: index.js ↔ trades.js
- **Category**: LOGGING

### generateDetailedLog vs generateDetailedLog

- **Similarity**: 92.1%
- **Confidence**: 90.0%
- **Files**: index.js ↔ trading_accounts.js
- **Category**: LOGGING

### generateDetailedLog vs generateDetailedLog

- **Similarity**: 87.0%
- **Confidence**: 95.0%
- **Files**: trades.js ↔ trading_accounts.js
- **Category**: LOGGING

### deleteTrade vs deleteTradePlan

- **Similarity**: 90.5%
- **Confidence**: 90.0%
- **Files**: trades.js ↔ trade_plans.js
- **Category**: VALIDATION

### getAlertState vs getEditorContent

- **Similarity**: 85.6%
- **Confidence**: 95.0%
- **Files**: alerts.js ↔ notes.js
- **Category**: DATA_LOADING

### deleteTrade vs deleteTicker

- **Similarity**: 89.7%
- **Confidence**: 90.0%
- **Files**: trades.js ↔ tickers.js
- **Category**: VALIDATION

### updatePageSummaryStats vs updateNotesSummary

- **Similarity**: 89.2%
- **Confidence**: 90.0%
- **Files**: cash_flows.js ↔ notes.js
- **Category**: UI_MANAGEMENT

### updatePageSummaryStats vs updateNotesSummary

- **Similarity**: 89.2%
- **Confidence**: 90.0%
- **Files**: trade_plans.js ↔ notes.js
- **Category**: UI_MANAGEMENT

### generateDetailedLog vs generateDetailedLog

- **Similarity**: 88.6%
- **Confidence**: 90.0%
- **Files**: trades.js ↔ alerts.js
- **Category**: LOGGING

### deleteTrade vs deleteNote

- **Similarity**: 88.5%
- **Confidence**: 90.0%
- **Files**: trades.js ↔ notes.js
- **Category**: VALIDATION

## 📋 Category Analysis

### UNCATEGORIZED (636 duplicates)

- Exact: 5, Near: 25, Similar: 64

**Critical**: 5 exact duplicates in UNCATEGORIZED category
**Action**: Create shared uncategorized utility

### DATA_LOADING (1242 duplicates)

- Exact: 0, Near: 13, Similar: 594

### UI_MANAGEMENT (1247 duplicates)

- Exact: 5, Near: 104, Similar: 384

**Critical**: 5 exact duplicates in UI_MANAGEMENT category
**Action**: Create shared ui_management utility

### LOGGING (71 duplicates)

- Exact: 4, Near: 14, Similar: 19

**Critical**: 4 exact duplicates in LOGGING category
**Action**: Create shared logging utility

### FORMATTING (53 duplicates)

- Exact: 0, Near: 7, Similar: 14

### VALIDATION (291 duplicates)

- Exact: 21, Near: 26, Similar: 53

**Critical**: 21 exact duplicates in VALIDATION category
**Action**: Create shared validation utility

### API (8 duplicates)

- Exact: 0, Near: 0, Similar: 4

### CACHE (55 duplicates)

- Exact: 0, Near: 4, Similar: 15

### EVENT_HANDLING (23 duplicates)

- Exact: 0, Near: 1, Similar: 20

## 🎯 Overall Recommendations

### Exact Duplicates Found

**Priority**: CRITICAL

**Description**: 35 exact duplicate functions detected

**Action**: Immediate refactoring required

**Impact**: High - reduces maintainability and increases bug risk

### Multiple UNCATEGORIZED Duplicates

**Priority**: HIGH

**Description**: 636 functions in UNCATEGORIZED category show duplication

**Action**: Consider creating shared uncategorized utility

**Impact**: Medium - affects code consistency

### Multiple DATA_LOADING Duplicates

**Priority**: HIGH

**Description**: 1242 functions in DATA_LOADING category show duplication

**Action**: Consider creating shared data_loading utility

**Impact**: Medium - affects code consistency

### Multiple UI_MANAGEMENT Duplicates

**Priority**: HIGH

**Description**: 1247 functions in UI_MANAGEMENT category show duplication

**Action**: Consider creating shared ui_management utility

**Impact**: Medium - affects code consistency

### Multiple LOGGING Duplicates

**Priority**: HIGH

**Description**: 71 functions in LOGGING category show duplication

**Action**: Consider creating shared logging utility

**Impact**: Medium - affects code consistency

### Multiple FORMATTING Duplicates

**Priority**: HIGH

**Description**: 53 functions in FORMATTING category show duplication

**Action**: Consider creating shared formatting utility

**Impact**: Medium - affects code consistency

### Multiple VALIDATION Duplicates

**Priority**: HIGH

**Description**: 291 functions in VALIDATION category show duplication

**Action**: Consider creating shared validation utility

**Impact**: Medium - affects code consistency

### Multiple API Duplicates

**Priority**: HIGH

**Description**: 8 functions in API category show duplication

**Action**: Consider creating shared api utility

**Impact**: Medium - affects code consistency

### Multiple CACHE Duplicates

**Priority**: HIGH

**Description**: 55 functions in CACHE category show duplication

**Action**: Consider creating shared cache utility

**Impact**: Medium - affects code consistency

### Multiple EVENT_HANDLING Duplicates

**Priority**: HIGH

**Description**: 23 functions in EVENT_HANDLING category show duplication

**Action**: Consider creating shared event_handling utility

**Impact**: Medium - affects code consistency

## ✅ Manual Review Checklist

### High Priority Review
- [ ] Review all EXACT duplicates for immediate refactoring
- [ ] Check if global systems can replace custom implementations
- [ ] Verify notification system usage consistency
- [ ] Ensure validation logic is centralized

### Medium Priority Review
- [ ] Review NEAR duplicates for refactoring opportunities
- [ ] Check for similar patterns that can be generalized
- [ ] Verify error handling consistency
- [ ] Ensure logging patterns are consistent

### Low Priority Review
- [ ] Review SIMILAR patterns for optimization
- [ ] Check for naming convention consistency
- [ ] Verify JSDoc documentation completeness
- [ ] Ensure function categorization is accurate

