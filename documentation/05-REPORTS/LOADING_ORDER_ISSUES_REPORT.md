# Loading Order Issues Report

**Generated:** 2025-12-05T18:11:50.843Z
**Total Pages Checked:** 40
**Pages with Issues:** 25
**Healthy Pages:** 3

## Pages with Issues


### index

- **modal-configs/conditions-config.js**: modal-configs/conditions-config.js loads AFTER modal-manager-v2.js (should be before)
- **modal-configs/tag-search-config.js**: modal-configs/tag-search-config.js loads AFTER modal-manager-v2.js (should be before)


### preferences

- **modal-configs/conditions-config.js**: modal-configs/conditions-config.js loads AFTER modal-manager-v2.js (should be before)
- **modal-configs/tag-search-config.js**: modal-configs/tag-search-config.js loads AFTER modal-manager-v2.js (should be before)


### user-profile

- **modal-configs/conditions-config.js**: modal-configs/conditions-config.js loads AFTER modal-manager-v2.js (should be before)
- **modal-configs/tag-search-config.js**: modal-configs/tag-search-config.js loads AFTER modal-manager-v2.js (should be before)


### trades

- **modal-configs/conditions-config.js**: modal-configs/conditions-config.js loads AFTER modal-manager-v2.js (should be before)


### executions

- **modal-configs/conditions-config.js**: modal-configs/conditions-config.js loads AFTER modal-manager-v2.js (should be before)


### data_import

- **modal-configs/conditions-config.js**: modal-configs/conditions-config.js loads AFTER modal-manager-v2.js (should be before)


### trade_plans

- **modal-configs/conditions-config.js**: modal-configs/conditions-config.js loads AFTER modal-manager-v2.js (should be before)
- **modal-configs/notes-config.js**: modal-configs/notes-config.js is required but not found in HTML


### alerts

- **modal-configs/conditions-config.js**: modal-configs/conditions-config.js loads AFTER modal-manager-v2.js (should be before)


### trading_accounts

- **modal-configs/conditions-config.js**: modal-configs/conditions-config.js loads AFTER modal-manager-v2.js (should be before)


### cash_flows

- **modal-configs/conditions-config.js**: modal-configs/conditions-config.js loads AFTER modal-manager-v2.js (should be before)


### tickers

- **modal-configs/conditions-config.js**: modal-configs/conditions-config.js loads AFTER modal-manager-v2.js (should be before)


### notes

- **modal-configs/notes-config.js**: modal-configs/notes-config.js is required but not found in HTML


### system-management

- **modal-configs/conditions-config.js**: modal-configs/conditions-config.js loads AFTER modal-manager-v2.js (should be before)
- **modal-configs/tag-search-config.js**: modal-configs/tag-search-config.js loads AFTER modal-manager-v2.js (should be before)


### server-monitor

- **modal-configs/conditions-config.js**: modal-configs/conditions-config.js loads AFTER modal-manager-v2.js (should be before)
- **modal-configs/tag-search-config.js**: modal-configs/tag-search-config.js loads AFTER modal-manager-v2.js (should be before)


### external-data-dashboard

- **modal-configs/conditions-config.js**: modal-configs/conditions-config.js loads AFTER modal-manager-v2.js (should be before)
- **modal-configs/tag-search-config.js**: modal-configs/tag-search-config.js loads AFTER modal-manager-v2.js (should be before)


### notifications-center

- **modal-configs/conditions-config.js**: modal-configs/conditions-config.js loads AFTER modal-manager-v2.js (should be before)
- **modal-configs/tag-search-config.js**: modal-configs/tag-search-config.js loads AFTER modal-manager-v2.js (should be before)


### background-tasks

- **modal-configs/conditions-config.js**: modal-configs/conditions-config.js loads AFTER modal-manager-v2.js (should be before)
- **modal-configs/tag-search-config.js**: modal-configs/tag-search-config.js loads AFTER modal-manager-v2.js (should be before)


### constraints

- **modal-configs/conditions-config.js**: modal-configs/conditions-config.js loads AFTER modal-manager-v2.js (should be before)
- **modal-configs/tag-search-config.js**: modal-configs/tag-search-config.js loads AFTER modal-manager-v2.js (should be before)


### css-management

- **modal-configs/conditions-config.js**: modal-configs/conditions-config.js loads AFTER modal-manager-v2.js (should be before)
- **modal-configs/tag-search-config.js**: modal-configs/tag-search-config.js loads AFTER modal-manager-v2.js (should be before)


### dynamic-colors-display

- **modal-configs/conditions-config.js**: modal-configs/conditions-config.js loads AFTER modal-manager-v2.js (should be before)
- **modal-configs/tag-search-config.js**: modal-configs/tag-search-config.js loads AFTER modal-manager-v2.js (should be before)


### designs

- **modal-configs/conditions-config.js**: modal-configs/conditions-config.js loads AFTER modal-manager-v2.js (should be before)
- **modal-configs/tag-search-config.js**: modal-configs/tag-search-config.js loads AFTER modal-manager-v2.js (should be before)


### chart-management

- **modal-configs/conditions-config.js**: modal-configs/conditions-config.js loads AFTER modal-manager-v2.js (should be before)
- **modal-configs/tag-search-config.js**: modal-configs/tag-search-config.js loads AFTER modal-manager-v2.js (should be before)


### login

- **modal-configs/conditions-config.js**: modal-configs/conditions-config.js loads AFTER modal-manager-v2.js (should be before)


### register

- **modal-configs/conditions-config.js**: modal-configs/conditions-config.js loads AFTER modal-manager-v2.js (should be before)


### ai-analysis

- **modal-configs/notes-config.js**: modal-configs/notes-config.js loads AFTER modal-manager-v2.js (should be before)
- **modal-configs/notes-config.js**: modal-configs/notes-config.js loads AFTER modal-manager-v2.js (should be before)


## Healthy Pages

- tag-management
- ticker-dashboard
- trades_formatted

## Recommendations

1. Run `update-all-pages-script-loading.js --force` to regenerate all pages
2. Verify that modal configs load before modal-manager-v2.js in all pages
3. Check package-manifest.js to ensure correct loadOrder values
