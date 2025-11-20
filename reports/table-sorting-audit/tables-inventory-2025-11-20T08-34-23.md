# Table Sorting System Inventory Report

**Scan Date:** 20.11.2025, 10:34:23

## Summary

- **Total HTML Files Scanned:** 54
- **Total JavaScript Files Scanned:** 263
- **Total HTML Tables Found:** 66
- **Total JavaScript Registrations Found:** 12
- **Matched Tables:** 10
- **Unmatched HTML Tables:** 56
- **Unmatched JS Registrations:** 2
- **Tables With Default Sort:** 0
- **Tables Without Default Sort:** 10

## Matched Tables (10)

| Page | Table Type | Table ID | Has Default Sort | Sortable | In Modal |
|------|------------|----------|------------------|----------|----------|
| alerts | alerts | alertsTable | ❌ | ✅ | ❌ |
| cash_flows | cash_flows | cashFlowsTable | ❌ | ✅ | ❌ |
| executions | executions | executionsTable | ❌ | ✅ | ❌ |
| notes | notes | notesTable | ❌ | ✅ | ❌ |
| tickers | tickers | tickersTable | ❌ | ✅ | ❌ |
| trade_plans | trade_plans | trade_plansTable | ❌ | ✅ | ❌ |
| trades | trades | tradesTable | ❌ | ✅ | ❌ |
| trading_accounts | trading_accounts | accountsTable | ❌ | ✅ | ❌ |
| trading_accounts | account_activity | accountActivityTable | ❌ | ✅ | ❌ |
| trading_accounts | positions | positionsTable | ❌ | ✅ | ❌ |

## Unmatched HTML Tables (56)

| Page | Table ID | Table Type | Column Count |
|------|----------|------------|--------------|
| alerts-smart | alertsTable | alerts | 8 |
| background-tasks | tasks-table | N/A | 7 |
| button-color-mapping-simple | table-0 | N/A | 8 |
| button-color-mapping | table-0 | N/A | 5 |
| cache-management | table-0 | N/A | 6 |
| cash_flows | forexUnifiedTable | cash_flows_unified_forex | 7 |
| code-quality-dashboard | table-0 | N/A | 6 |
| code-quality-dashboard | table-1 | code-quality-dashboard | 5 |
| code-quality-dashboard | lint-issues-table | lint_monitor_issues | 6 |
| constraints | constraints-table | constraints | 7 |
| crud-testing-dashboard | testResultsTable | N/A | 5 |
| css-management | cssFilesTable | N/A | 6 |
| data_import | importHistoryTable | import_history | 11 |
| data_import | missingTickersTable | import_missing_tickers | 5 |
| data_import | cashflowMissingAccountsTable | import_cashflow_missing_accounts | 4 |
| data_import | cashflowCurrencyIssuesTable | import_cashflow_currency_issues | 4 |
| data_import | accountMissingAccountsTable | import_account_missing_accounts | 3 |
| data_import | accountCurrencyMismatchesTable | import_account_currency_mismatches | 3 |
| data_import | accountEntitlementWarningsTable | import_account_entitlement_warnings | 3 |
| data_import | accountMissingDocumentsTable | import_account_missing_documents | 2 |
| data_import | existingRecordsTable | import_existing_records | 7 |
| data_import | withinFileDuplicatesTable | import_within_file_duplicates | 7 |
| data_import | importTable | N/A | 8 |
| data_import | skipTable | N/A | 9 |
| db_display | accountsTable | N/A | 1 |
| db_display | tradesTable | N/A | 1 |
| db_display | tickersTable | N/A | 1 |
| db_display | tradePlansTable | N/A | 1 |
| db_display | executionsTable | N/A | 1 |
| db_display | alertsTable | N/A | 1 |
| db_display | notesTable | N/A | 1 |
| db_display | cashFlowsTable | N/A | 1 |
| db_extradata | constraintsTable | N/A | 1 |
| db_extradata | currenciesTable | N/A | 1 |
| db_extradata | preferenceGroupsTable | N/A | 1 |
| db_extradata | systemSettingGroupsTable | N/A | 1 |
| db_extradata | externalDataProvidersTable | N/A | 1 |
| db_extradata | quotesLastTable | N/A | 1 |
| db_extradata | planConditionsTable | N/A | 1 |
| db_extradata | userPreferencesTable | N/A | 1 |
| designs | buttonSystemTable | N/A | 8 |
| designs | colorTokensTable | N/A | 6 |
| designs | table-2 | N/A | 5 |
| executions | importTable | N/A | 8 |
| executions | skipTable | N/A | 9 |
| index | portfolioTable | portfolio | 10 |
| init-system-management | table-0 | N/A | 7 |
| preferences-groups-management | preferencesTable | N/A | 7 |
| preferences | table-0 | N/A | 6 |
| tag-management | tagUsageLeaderboardTable | tag_usage_leaderboard | 4 |
| tag-management | tagCategoriesTable | tag_categories | 5 |
| tag-management | tagsTable | tags | 6 |
| test-header-only | trade_plansTable | trade_plans | 12 |
| test-header-only | executionsTable | executions | 11 |
| trades-smart | tradesTable | trades | 13 |
| trades_formatted | tradesTable | trades | 13 |

## Unmatched JavaScript Registrations (2)

| Page | Table Type | Function Name | Has Default Sort |
|------|------------|---------------|------------------|
| executions | trade_suggestions | direct registration | ❌ |
| trading_accounts | portfolio | direct registration | ❌ |

## Tables Without Default Sort

| Page | Table Type | Table ID | Expected Default Sort | Has Date Column |
|------|------------|----------|---------------------|-----------------|
| alerts | alerts | alertsTable | created_at (desc) | ✅ |
| cash_flows | cash_flows | cashFlowsTable | date (desc) | ✅ |
| executions | executions | executionsTable | date (desc) | ✅ |
| notes | notes | notesTable | created_at (desc) | ✅ |
| tickers | tickers | tickersTable | updated_at (desc) | ✅ |
| trade_plans | trade_plans | trade_plansTable | created_at (desc) | ✅ |
| trades | trades | tradesTable | created_at (desc) | ✅ |
| trading_accounts | trading_accounts | accountsTable | updated_at (desc) | ✅ |
| trading_accounts | account_activity | accountActivityTable | date (desc) | ✅ |
| trading_accounts | positions | positionsTable | ticker_symbol (asc) | ❌ |

## Detailed Analysis

### Tables with Date Columns (should have date desc default sort)

| Page | Table Type | Date Column | Date Index | Has Default Sort |
|------|------------|-------------|------------|------------------|
| alerts | alerts | created_at | 6 | ❌ |
| cash_flows | cash_flows | date | 4 | ❌ |
| executions | executions | date | 8 | ❌ |
| notes | notes | created_at | 2 | ❌ |
| tickers | tickers | updated_at | 8 | ❌ |
| trade_plans | trade_plans | created_at | 1 | ❌ |
| trades | trades | created_at | 10 | ❌ |
| trading_accounts | trading_accounts | updated_at | 6 | ❌ |
| trading_accounts | account_activity | date | 0 | ❌ |
