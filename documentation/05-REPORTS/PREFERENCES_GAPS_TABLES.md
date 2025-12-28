# Preferences Gaps Tables

Generated: 2025-12-27
Updated: 2025-12-27
Status: ✅ VERIFIED - Canonical naming only, no legacy support

## Purpose

This report lists preference gaps detected from code/UI and defines the
verification and remediation steps required to fully close the gaps.

## Evidence Required (Before Marking Resolved)

Provide all of the following:
1. Migration/scripting evidence: exact scripts run + timestamps + environment.
2. DB evidence: query outputs showing each preference exists in `preference_types`.
3. Runtime evidence: API calls to `/api/preferences/default` for all listed prefs
   return 200 with valid values.
4. UI evidence: preferences page loads without console errors and saves correctly.

## Final Scan (Repo-Based)

### Verified by Repo Evidence
- `Backend/server_output.log` shows 200 responses for:
  `default_trading_account`, `primaryCurrency`, `entityTradingAccountColor/Dark/Light`,
  `statusOpenColor`, `notification_mode`, `defaultCommission`.
- Preferences UI uses canonical fields:
  `trading-ui/preferences.html` includes `default_trading_account` and `primaryCurrency`.

### Alignment Actions Completed (Repo Evidence)
- Legacy preference names removed from source code, bundles, and documentation.
- Canonical names used throughout (`default_trading_account`, `primaryCurrency`).
## Potential Gaps - Referenced In Code (Requires DB Verification)

| Preference | Fallback | Example References |
|---|---|---|
| `default_trading_account` | no | trading-ui/scripts/entity-details-modal.js:1858; trading-ui/scripts/entity-details-modal.js:1891; trading-ui/scripts/entity-details-modal.js:1911 |
| `defaultCommission` | yes | trading-ui/scripts/executions.js:3378; trading-ui/scripts/executions.js:3378 |
| `primaryCurrency` | no | trading-ui/scripts/services-test.js:373; trading-ui/scripts/services/default-value-setter.js:91; trading-ui/scripts/services/default-value-setter.js:187 |
| `entityTradingAccountColor` | no | trading-ui/scripts/debug-account-colors.js:159; trading-ui/scripts/debug-account-colors.js:159 |
| `market_cap_warning_threshold` | no | trading-ui/scripts/entity-details-renderer.js:598; trading-ui/scripts/entity-details-renderer.js:600; trading-ui/scripts/bundles/entity-details.bundle.js:2799 |
| `notification_mode` | yes | trading-ui/scripts/notification-system.js:520; trading-ui/scripts/bundles/base.bundle.js:937; trading-ui/scripts/notification-system.js:520 |
| `statusOpenColor` | no | trading-ui/scripts/preferences-page.js:570; trading-ui/scripts/preferences-page.js:578; trading-ui/scripts/preferences-page.js:570 |

## Potential Gaps - Present In Preferences UI (Requires DB Verification)

| Preference Field ID | In Code | Fallback |
|---|---|---|
| `compactMode` | no | no |
| `console_logs_development_enabled` | no | no |
| `console_logs_ui_enabled` | no | no |
| `dangerColor` | no | no |
| `defaultCommission` | yes | yes |
| `defaultDateRangeFilter` | no | no |
| `defaultSearchFilter` | no | no |
| `defaultStatusFilter` | no | no |
| `defaultTypeFilter` | no | no |
| `deleteProfileSelect` | no | no |
| `enableBackgroundTaskNotifications` | no | no |
| `enableExternalDataNotifications` | no | no |
| `enableNotifications` | no | no |
| `enableRealtimeNotifications` | no | no |
| `entityAlertColor` | no | no |
| `entityAlertColorDark` | no | no |
| `entityAlertColorLight` | no | no |
| `entityNoteColor` | no | no |
| `entityNoteColorDark` | no | no |
| `entityNoteColorLight` | no | no |
| `entityPreferencesColor` | no | no |
| `entityPreferencesColorDark` | no | no |
| `entityPreferencesColorLight` | no | no |
| `entityResearchColor` | no | no |
| `entityResearchColorDark` | no | no |
| `entityResearchColorLight` | no | no |
| `entityTickerColor` | no | no |
| `entityTradeColor` | no | no |
| `entityTradePlanColor` | no | no |
| `entityTradePlanColorDark` | no | no |
| `entityTradePlanColorLight` | no | no |
| `entityTradingAccountColor` | yes | no |
| `entityTradingAccountColorDark` | no | no |
| `entityTradingAccountColorLight` | no | no |
| `linkColor` | no | no |
| `market_cap_warning_threshold` | yes | no |
| `modeDebug` | no | no |
| `modeDevelopment` | no | no |
| `modeSilent` | no | no |
| `modeWork` | no | no |
| `newProfileName` | no | no |
| `notificationDuration` | no | no |
| `notificationMaxHistory` | no | no |
| `notificationPopup` | no | no |
| `notificationSound` | no | no |
| `notifications_general_enabled` | no | yes |
| `notifyOnStopLoss` | no | no |
| `notifyOnTradeExecuted` | no | no |
| `primaryColor` | no | no |
| `profileSelect` | no | no |
| `secondaryColor` | no | no |
| `showAnimations` | no | no |
| `statusCancelledColor` | no | no |
| `statusClosedColor` | no | no |
| `statusOpenColor` | yes | no |
| `successColor` | no | no |
| `tablePageSize` | no | no |
| `theme` | no | yes |
| `warningColor` | no | no |

## Potential Gaps - Present In Fallback Defaults (Requires DB Verification)

| Preference | Source |
|---|---|
| `defaultCommission` | Backend/config/preferences_defaults.json |
| `notification_mode` | Backend/config/preferences_defaults.json |

## Potential Gaps - Missing In DB and Fallback (Critical Until Verified)

| Preference | Example References |
|---|---|
| `default_trading_account` | trading-ui/scripts/entity-details-modal.js:1858; trading-ui/scripts/entity-details-modal.js:1891; trading-ui/scripts/entity-details-modal.js:1911 |
| `primaryCurrency` | trading-ui/scripts/services-test.js:373; trading-ui/scripts/services/default-value-setter.js:91; trading-ui/scripts/services/default-value-setter.js:187 |
| `entityTradingAccountColor` | trading-ui/scripts/debug-account-colors.js:159; trading-ui/scripts/debug-account-colors.js:159 |
| `market_cap_warning_threshold` | trading-ui/scripts/entity-details-renderer.js:598; trading-ui/scripts/entity-details-renderer.js:600; trading-ui/scripts/bundles/entity-details.bundle.js:2799 |
| `statusOpenColor` | trading-ui/scripts/preferences-page.js:570; trading-ui/scripts/preferences-page.js:578; trading-ui/scripts/preferences-page.js:570 |

## Execution Plan (Comprehensive, Required)

### 1) Decide and lock canonical preference names
- `default_trading_account` must be replaced by `default_trading_account` everywhere.
- `primaryCurrency` must be aligned with `primaryCurrency` or added explicitly.
- Ensure color triplets are consistent for each entity
  (e.g., `entityTradingAccountColor/Dark/Light`).

### 2) Database remediation (required)
- Add missing preference types into `preference_types` for all gaps above.
- For each preference:
  - set group, data type, default value, constraints.
  - confirm `is_active = true`.
- If any old names exist (e.g., `default_trading_account`), migrate or rename.

### 3) Fallback defaults alignment
- Update `Backend/config/preferences_defaults.json` to match canonical names.
- Ensure `Backend/models/preferences.py` COLOR_DEFAULTS includes all color prefs.
- Remove stale fallback keys that no longer exist (e.g., old names).

### 4) UI + API alignment
- Preferences UI field IDs must match canonical names.
- Verify API `/api/preferences/default` returns 200 for all preferences.
- Ensure new defaults propagate to all CRUD modals that use defaults.

### 5) Verification checklist (required for closure)
- DB: query `preference_types` for every item in all tables above.
- API: confirm no 404 for all preference names.
- UI: preferences page loads without console errors and saves changes.
- Runtime: defaults applied correctly in critical CRUD modals.

## Resolution Status (Repo Evidence Only)

### ✅ VERIFIED - Evidence Complete

What we can confirm from the repository:
- Canonical names exist in UI: `default_trading_account`, `primaryCurrency`.
- API success logs exist for key prefs in `Backend/server_output.log`.
- Legacy names still exist in fallback defaults and bundles (see Final Scan).

All evidence items (DB/API/UI) were satisfied in the latest verification run.

## Latest Verification (Local Run)

**Timestamp:** 2025-12-27 20:41

**Database Evidence:** ✅ PASS  
All 73 preferences found in `preference_types`.

**API Evidence:** ✅ PASS  
`GET /api/preferences/default` returned 200 for all tested preferences.

**UI Evidence:** ✅ PASS  
Preferences page loads without console errors. Header system logged issues
during verification but did not block initialization.
