# Advanced Duplicate Code Detection Report

**Generated**: 10/26/2025, 7:05:29 PM

---

## 📊 Summary

- **Total Functions Analyzed**: 579
- **Total Duplicates Found**: 5160
- **Exact Duplicates**: 52 🔴
- **Near Duplicates**: 156 🟡
- **Similar Patterns**: 1603 🟠
- **Potential Duplicates**: 3349 🔵

## 🔴 Critical Issues - Exact Duplicates

**Action Required**: Immediate refactoring needed

### updateRadioButtons vs updateRadioButtons

- **Similarity**: 100.0%
- **Confidence**: 100.0%
- **Files**: alerts.js (line 1015) ↔ notes.js (line 970)
- **Category**: UI_MANAGEMENT

**Recommendations**:
- **HIGH**: Functions are nearly identical - merge into shared utility
  - Steps: Create shared utility function, Update both files to use shared function, Remove duplicate implementations

### updatePageSummaryStats vs updatePageSummaryStats

- **Similarity**: 98.6%
- **Confidence**: 90.0%
- **Files**: alerts.js (line 767) ↔ cash_flows.js (line 819)
- **Category**: UI_MANAGEMENT

**Recommendations**:
- **HIGH**: Functions are nearly identical - merge into shared utility
  - Steps: Create shared utility function, Update both files to use shared function, Remove duplicate implementations

### generateDetailedLogForTrades vs generateDetailedLogForTradePlans

- **Similarity**: 96.3%
- **Confidence**: 90.0%
- **Files**: trades.js (line 3475) ↔ trade_plans.js (line 4199)
- **Category**: LOGGING

**Recommendations**:
- **HIGH**: Functions are nearly identical - merge into shared utility
  - Steps: Create shared utility function, Update both files to use shared function, Remove duplicate implementations

### generateDetailedLogForTrades vs generateDetailedLogForTickers

- **Similarity**: 95.9%
- **Confidence**: 90.0%
- **Files**: trades.js (line 3475) ↔ tickers.js (line 2282)
- **Category**: LOGGING

**Recommendations**:
- **HIGH**: Functions are nearly identical - merge into shared utility
  - Steps: Create shared utility function, Update both files to use shared function, Remove duplicate implementations

### generateDetailedLogForTrades vs generateDetailedLogForNotes

- **Similarity**: 95.7%
- **Confidence**: 90.0%
- **Files**: trades.js (line 3475) ↔ notes.js (line 2590)
- **Category**: LOGGING

**Recommendations**:
- **HIGH**: Functions are nearly identical - merge into shared utility
  - Steps: Create shared utility function, Update both files to use shared function, Remove duplicate implementations

### updatePageSummaryStats vs updatePageSummaryStats

- **Similarity**: 95.7%
- **Confidence**: 90.0%
- **Files**: trade_plans.js (line 2004) ↔ cash_flows.js (line 819)
- **Category**: UI_MANAGEMENT

**Recommendations**:
- **HIGH**: Functions are nearly identical - merge into shared utility
  - Steps: Create shared utility function, Update both files to use shared function, Remove duplicate implementations

### updatePageSummaryStats vs updatePageSummaryStats

- **Similarity**: 95.2%
- **Confidence**: 90.0%
- **Files**: alerts.js (line 767) ↔ trade_plans.js (line 2004)
- **Category**: UI_MANAGEMENT

**Recommendations**:
- **HIGH**: Functions are nearly identical - merge into shared utility
  - Steps: Create shared utility function, Update both files to use shared function, Remove duplicate implementations

### generateDetailedLog vs generateDetailedLog

- **Similarity**: 98.7%
- **Confidence**: 80.0%
- **Files**: alerts.js (line 2842) ↔ notes.js (line 2476)
- **Category**: LOGGING

**Recommendations**:
- **HIGH**: Functions are nearly identical - merge into shared utility
  - Steps: Create shared utility function, Update both files to use shared function, Remove duplicate implementations

### generateDetailedLog vs generateDetailedLog

- **Similarity**: 96.5%
- **Confidence**: 80.0%
- **Files**: notes.js (line 2476) ↔ tickers.js (line 2164)
- **Category**: LOGGING

**Recommendations**:
- **HIGH**: Functions are nearly identical - merge into shared utility
  - Steps: Create shared utility function, Update both files to use shared function, Remove duplicate implementations

### generateDetailedLog vs generateDetailedLog

- **Similarity**: 96.3%
- **Confidence**: 80.0%
- **Files**: alerts.js (line 2842) ↔ tickers.js (line 2164)
- **Category**: LOGGING

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

- **Similarity**: 90.2%
- **Confidence**: 100.0%
- **Files**: trades.js ↔ trading_accounts.js
- **Category**: UI_MANAGEMENT

### generateDetailedLogForAlerts vs generateDetailedLogForTickers

- **Similarity**: 94.8%
- **Confidence**: 90.0%
- **Files**: alerts.js ↔ tickers.js
- **Category**: LOGGING

### generateDetailedLogForNotes vs generateDetailedLogForTickers

- **Similarity**: 94.8%
- **Confidence**: 90.0%
- **Files**: notes.js ↔ tickers.js
- **Category**: LOGGING

### generateDetailedLogForTrades vs generateDetailedLogForAlerts

- **Similarity**: 94.6%
- **Confidence**: 90.0%
- **Files**: trades.js ↔ alerts.js
- **Category**: LOGGING

### generateDetailedLogForAlerts vs generateDetailedLogForNotes

- **Similarity**: 94.6%
- **Confidence**: 90.0%
- **Files**: alerts.js ↔ notes.js
- **Category**: LOGGING

### generateDetailedLogForAlerts vs generateDetailedLogForResearch

- **Similarity**: 94.0%
- **Confidence**: 90.0%
- **Files**: alerts.js ↔ research.js
- **Category**: LOGGING

### generateDetailedLogForAlerts vs generateDetailedLogForTradePlans

- **Similarity**: 93.4%
- **Confidence**: 90.0%
- **Files**: alerts.js ↔ trade_plans.js
- **Category**: LOGGING

### generateDetailedLogForTradePlans vs generateDetailedLogForTickers

- **Similarity**: 93.4%
- **Confidence**: 90.0%
- **Files**: trade_plans.js ↔ tickers.js
- **Category**: LOGGING

### generateDetailedLogForTrades vs generateDetailedLogForResearch

- **Similarity**: 93.0%
- **Confidence**: 90.0%
- **Files**: trades.js ↔ research.js
- **Category**: LOGGING

### generateDetailedLogForResearch vs generateDetailedLogForNotes

- **Similarity**: 93.0%
- **Confidence**: 90.0%
- **Files**: research.js ↔ notes.js
- **Category**: LOGGING

### generateDetailedLogForResearch vs generateDetailedLogForTickers

- **Similarity**: 93.0%
- **Confidence**: 90.0%
- **Files**: research.js ↔ tickers.js
- **Category**: LOGGING

### reactivateTrade vs reactivateTradePlan

- **Similarity**: 88.0%
- **Confidence**: 95.0%
- **Files**: trades.js ↔ trade_plans.js
- **Category**: UNCATEGORIZED

### generateDetailedLog vs generateDetailedLog

- **Similarity**: 87.8%
- **Confidence**: 95.0%
- **Files**: index.js ↔ trades.js
- **Category**: LOGGING

### generateDetailedLogForTradePlans vs generateDetailedLogForResearch

- **Similarity**: 92.5%
- **Confidence**: 90.0%
- **Files**: trade_plans.js ↔ research.js
- **Category**: LOGGING

## 📋 Category Analysis

### UNCATEGORIZED (994 duplicates)

- Exact: 38, Near: 44, Similar: 113

**Critical**: 38 exact duplicates in UNCATEGORIZED category
**Action**: Create shared uncategorized utility

### DATA_LOADING (1733 duplicates)

- Exact: 0, Near: 16, Similar: 808

### FORMATTING (54 duplicates)

- Exact: 0, Near: 7, Similar: 5

### UI_MANAGEMENT (1863 duplicates)

- Exact: 5, Near: 25, Similar: 554

**Critical**: 5 exact duplicates in UI_MANAGEMENT category
**Action**: Create shared ui_management utility

### LOGGING (170 duplicates)

- Exact: 9, Near: 49, Similar: 35

**Critical**: 9 exact duplicates in LOGGING category
**Action**: Create shared logging utility

### VALIDATION (252 duplicates)

- Exact: 0, Near: 9, Similar: 68

### API (21 duplicates)

- Exact: 0, Near: 0, Similar: 3

### CACHE (72 duplicates)

- Exact: 0, Near: 6, Similar: 17

### UTILITY (1 duplicates)

- Exact: 0, Near: 0, Similar: 0

## 🎯 Overall Recommendations

### Exact Duplicates Found

**Priority**: CRITICAL

**Description**: 52 exact duplicate functions detected

**Action**: Immediate refactoring required

**Impact**: High - reduces maintainability and increases bug risk

### Multiple UNCATEGORIZED Duplicates

**Priority**: HIGH

**Description**: 994 functions in UNCATEGORIZED category show duplication

**Action**: Consider creating shared uncategorized utility

**Impact**: Medium - affects code consistency

### Multiple DATA_LOADING Duplicates

**Priority**: HIGH

**Description**: 1733 functions in DATA_LOADING category show duplication

**Action**: Consider creating shared data_loading utility

**Impact**: Medium - affects code consistency

### Multiple FORMATTING Duplicates

**Priority**: HIGH

**Description**: 54 functions in FORMATTING category show duplication

**Action**: Consider creating shared formatting utility

**Impact**: Medium - affects code consistency

### Multiple UI_MANAGEMENT Duplicates

**Priority**: HIGH

**Description**: 1863 functions in UI_MANAGEMENT category show duplication

**Action**: Consider creating shared ui_management utility

**Impact**: Medium - affects code consistency

### Multiple LOGGING Duplicates

**Priority**: HIGH

**Description**: 170 functions in LOGGING category show duplication

**Action**: Consider creating shared logging utility

**Impact**: Medium - affects code consistency

### Multiple VALIDATION Duplicates

**Priority**: HIGH

**Description**: 252 functions in VALIDATION category show duplication

**Action**: Consider creating shared validation utility

**Impact**: Medium - affects code consistency

### Multiple API Duplicates

**Priority**: HIGH

**Description**: 21 functions in API category show duplication

**Action**: Consider creating shared api utility

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

