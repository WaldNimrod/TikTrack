# Advanced Duplicate Code Detection Report

**Generated**: 11/7/2025, 8:00:45 PM

---

## 📊 Summary

- **Total Functions Analyzed**: 481
- **Total Duplicates Found**: 3722
- **Exact Duplicates**: 19 🔴
- **Near Duplicates**: 82 🟡
- **Similar Patterns**: 1350 🟠
- **Potential Duplicates**: 2271 🔵

## 🔴 Critical Issues - Exact Duplicates

**Action Required**: Immediate refactoring needed

### updateRadioButtons vs updateRadioButtons

- **Similarity**: 99.6%
- **Confidence**: 100.0%
- **Files**: alerts.js (line 774) ↔ notes.js (line 839)
- **Category**: UI_MANAGEMENT

**Recommendations**:
- **HIGH**: Functions are nearly identical - merge into shared utility
  - Steps: Create shared utility function, Update both files to use shared function, Remove duplicate implementations

### updateRadioButtons vs updateRadioButtons

- **Similarity**: 99.5%
- **Confidence**: 100.0%
- **Files**: trades.js (line 1398) ↔ alerts.js (line 774)
- **Category**: UI_MANAGEMENT

**Recommendations**:
- **HIGH**: Functions are nearly identical - merge into shared utility
  - Steps: Create shared utility function, Update both files to use shared function, Remove duplicate implementations

### updateRadioButtons vs updateRadioButtons

- **Similarity**: 99.1%
- **Confidence**: 100.0%
- **Files**: trades.js (line 1398) ↔ notes.js (line 839)
- **Category**: UI_MANAGEMENT

**Recommendations**:
- **HIGH**: Functions are nearly identical - merge into shared utility
  - Steps: Create shared utility function, Update both files to use shared function, Remove duplicate implementations

### initializeTradeConditionsSystem vs initializeTradePlanConditionsSystem

- **Similarity**: 95.8%
- **Confidence**: 90.0%
- **Files**: trades.js (line 2159) ↔ trade_plans.js (line 2664)
- **Category**: UNCATEGORIZED

**Recommendations**:
- **HIGH**: Functions are nearly identical - merge into shared utility
  - Steps: Create shared utility function, Update both files to use shared function, Remove duplicate implementations

### onRelationTypeChange vs onRelationTypeChange

- **Similarity**: 95.8%
- **Confidence**: 85.0%
- **Files**: trades.js (line 1527) ↔ alerts.js (line 925)
- **Category**: API

**Recommendations**:
- **HIGH**: Functions are nearly identical - merge into shared utility
  - Steps: Create shared utility function, Update both files to use shared function, Remove duplicate implementations

### viewTickerDetails vs viewTickerDetails

- **Similarity**: 96.3%
- **Confidence**: 70.0%
- **Files**: trades.js (line 809) ↔ tickers.js (line 115)
- **Category**: UNCATEGORIZED

**Recommendations**:
- **HIGH**: Functions are nearly identical - merge into shared utility
  - Steps: Create shared utility function, Update both files to use shared function, Remove duplicate implementations

### displayTradeTickerInfo vs displayTradePlanTickerInfo

- **Similarity**: 95.4%
- **Confidence**: 60.0%
- **Files**: trades.js (line 447) ↔ trade_plans.js (line 549)
- **Category**: LOGGING

**Recommendations**:
- **HIGH**: Functions are nearly identical - merge into shared utility
  - Steps: Create shared utility function, Update both files to use shared function, Remove duplicate implementations

### function vs function

- **Similarity**: 100.0%
- **Confidence**: 50.0%
- **Files**: trades.js (line 3244) ↔ trade_plans.js (line 2763)
- **Category**: UI_MANAGEMENT

**Recommendations**:
- **HIGH**: Functions are nearly identical - merge into shared utility
  - Steps: Create shared utility function, Update both files to use shared function, Remove duplicate implementations

### function vs function

- **Similarity**: 100.0%
- **Confidence**: 50.0%
- **Files**: trades.js (line 3244) ↔ notes.js (line 2273)
- **Category**: UI_MANAGEMENT

**Recommendations**:
- **HIGH**: Functions are nearly identical - merge into shared utility
  - Steps: Create shared utility function, Update both files to use shared function, Remove duplicate implementations

### function vs function

- **Similarity**: 100.0%
- **Confidence**: 50.0%
- **Files**: trade_plans.js (line 2763) ↔ notes.js (line 2273)
- **Category**: UI_MANAGEMENT

**Recommendations**:
- **HIGH**: Functions are nearly identical - merge into shared utility
  - Steps: Create shared utility function, Update both files to use shared function, Remove duplicate implementations

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

### populateRelatedObjects vs populateRelatedObjects

- **Similarity**: 93.0%
- **Confidence**: 90.0%
- **Files**: trades.js ↔ alerts.js
- **Category**: UNCATEGORIZED

### generateDetailedLog vs generateDetailedLog

- **Similarity**: 87.8%
- **Confidence**: 95.0%
- **Files**: index.js ↔ trades.js
- **Category**: LOGGING

### populateSelect vs populateSelect

- **Similarity**: 87.6%
- **Confidence**: 95.0%
- **Files**: trades.js ↔ notes.js
- **Category**: UNCATEGORIZED

### reactivateTrade vs reactivateTradePlan

- **Similarity**: 87.4%
- **Confidence**: 95.0%
- **Files**: trades.js ↔ trade_plans.js
- **Category**: UNCATEGORIZED

### getAlertState vs getEditorContent

- **Similarity**: 86.0%
- **Confidence**: 95.0%
- **Files**: alerts.js ↔ notes.js
- **Category**: DATA_LOADING

### populateSelect vs populateSelect

- **Similarity**: 85.1%
- **Confidence**: 95.0%
- **Files**: trades.js ↔ alerts.js
- **Category**: UNCATEGORIZED

### updateTickerInfo vs updateTableDisplay

- **Similarity**: 86.6%
- **Confidence**: 90.0%
- **Files**: trade_plans.js ↔ database.js
- **Category**: UI_MANAGEMENT

### updateEditSharesFromAmount vs updateTableDisplay

- **Similarity**: 86.6%
- **Confidence**: 90.0%
- **Files**: trade_plans.js ↔ database.js
- **Category**: UI_MANAGEMENT

### updateEditAmountFromShares vs updateTableDisplay

- **Similarity**: 86.5%
- **Confidence**: 90.0%
- **Files**: trade_plans.js ↔ database.js
- **Category**: UI_MANAGEMENT

### generateDetailedLog vs generateDetailedLog

- **Similarity**: 90.3%
- **Confidence**: 85.0%
- **Files**: index.js ↔ research.js
- **Category**: LOGGING

### generateDetailedLog vs generateDetailedLog

- **Similarity**: 85.3%
- **Confidence**: 90.0%
- **Files**: trades.js ↔ research.js
- **Category**: LOGGING

### getAccountNameById vs getEditorContent

- **Similarity**: 85.2%
- **Confidence**: 90.0%
- **Files**: cash_flows.js ↔ notes.js
- **Category**: DATA_LOADING

### updateTickerInfo vs updateNotesSummary

- **Similarity**: 85.2%
- **Confidence**: 90.0%
- **Files**: trade_plans.js ↔ notes.js
- **Category**: UI_MANAGEMENT

## 📋 Category Analysis

### UNCATEGORIZED (800 duplicates)

- Exact: 6, Near: 25, Similar: 83

**Critical**: 6 exact duplicates in UNCATEGORIZED category
**Action**: Create shared uncategorized utility

### DATA_LOADING (1184 duplicates)

- Exact: 0, Near: 13, Similar: 605

### UI_MANAGEMENT (1369 duplicates)

- Exact: 7, Near: 9, Similar: 569

**Critical**: 7 exact duplicates in UI_MANAGEMENT category
**Action**: Create shared ui_management utility

### LOGGING (44 duplicates)

- Exact: 2, Near: 10, Similar: 7

**Critical**: 2 exact duplicates in LOGGING category
**Action**: Create shared logging utility

### FORMATTING (51 duplicates)

- Exact: 0, Near: 7, Similar: 14

### VALIDATION (158 duplicates)

- Exact: 3, Near: 13, Similar: 31

**Critical**: 3 exact duplicates in VALIDATION category
**Action**: Create shared validation utility

### API (19 duplicates)

- Exact: 1, Near: 0, Similar: 5

**Critical**: 1 exact duplicates in API category
**Action**: Create shared api utility

### EVENT_HANDLING (19 duplicates)

- Exact: 0, Near: 2, Similar: 5

### UTILITY (6 duplicates)

- Exact: 0, Near: 0, Similar: 3

### CACHE (72 duplicates)

- Exact: 0, Near: 3, Similar: 28

## 🎯 Overall Recommendations

### Exact Duplicates Found

**Priority**: CRITICAL

**Description**: 19 exact duplicate functions detected

**Action**: Immediate refactoring required

**Impact**: High - reduces maintainability and increases bug risk

### Multiple UNCATEGORIZED Duplicates

**Priority**: HIGH

**Description**: 800 functions in UNCATEGORIZED category show duplication

**Action**: Consider creating shared uncategorized utility

**Impact**: Medium - affects code consistency

### Multiple DATA_LOADING Duplicates

**Priority**: HIGH

**Description**: 1184 functions in DATA_LOADING category show duplication

**Action**: Consider creating shared data_loading utility

**Impact**: Medium - affects code consistency

### Multiple UI_MANAGEMENT Duplicates

**Priority**: HIGH

**Description**: 1369 functions in UI_MANAGEMENT category show duplication

**Action**: Consider creating shared ui_management utility

**Impact**: Medium - affects code consistency

### Multiple LOGGING Duplicates

**Priority**: HIGH

**Description**: 44 functions in LOGGING category show duplication

**Action**: Consider creating shared logging utility

**Impact**: Medium - affects code consistency

### Multiple FORMATTING Duplicates

**Priority**: HIGH

**Description**: 51 functions in FORMATTING category show duplication

**Action**: Consider creating shared formatting utility

**Impact**: Medium - affects code consistency

### Multiple VALIDATION Duplicates

**Priority**: HIGH

**Description**: 158 functions in VALIDATION category show duplication

**Action**: Consider creating shared validation utility

**Impact**: Medium - affects code consistency

### Multiple API Duplicates

**Priority**: HIGH

**Description**: 19 functions in API category show duplication

**Action**: Consider creating shared api utility

**Impact**: Medium - affects code consistency

### Multiple EVENT_HANDLING Duplicates

**Priority**: HIGH

**Description**: 19 functions in EVENT_HANDLING category show duplication

**Action**: Consider creating shared event_handling utility

**Impact**: Medium - affects code consistency

### Multiple UTILITY Duplicates

**Priority**: HIGH

**Description**: 6 functions in UTILITY category show duplication

**Action**: Consider creating shared utility utility

**Impact**: Medium - affects code consistency

### Multiple CACHE Duplicates

**Priority**: HIGH

**Description**: 72 functions in CACHE category show duplication

**Action**: Consider creating shared cache utility

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

