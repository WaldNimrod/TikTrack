# Trading Journal Page - Monitoring Issues Fix Plan

## Issues Identified

1. **Duplicate Script Loading**: `chart.umd.min.js` is loaded twice
   - Once directly in HTML (line 311)
   - Once via `chart-loader.js` (which can auto-load it)

2. **Undocumented Scripts**: 3 scripts loaded but not documented in package manifest
   - `calendar-date-utils.js`
   - `calendar-data-loader.js`
   - `calendar-renderer.js`
   - `trading-journal-page.js`

3. **Loading Order Issue**: Charts Package (loadOrder: 8) loaded after Entity Services Package (loadOrder: 10)
   - This is actually correct based on loadOrder numbers
   - But the monitoring system may be checking execution order, not loadOrder

## Fixes Required

### 1. Remove Duplicate Chart.js Loading

**Action**: Remove direct Chart.js CDN script from HTML, let chart-loader.js handle it.

**File**: `trading-ui/trading-journal.html`
- Remove line 311: `<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js" async></script>`
- Chart-loader.js will handle loading Chart.js when needed

### 2. Document Calendar Scripts

**Action**: Add calendar scripts to package manifest as a new package or part of existing package.

**Option A**: Create new "calendar" package
**Option B**: Add to existing package (e.g., entity-services or as page-specific scripts)

**Recommendation**: Add as page-specific scripts section in package manifest, or create a "trading-journal" package that includes:
- calendar-date-utils.js
- calendar-data-loader.js  
- calendar-renderer.js
- trading-journal-page.js

### 3. Fix Loading Order

**Action**: Verify Charts Package loadOrder vs Entity Services loadOrder.

Current:
- Charts Package: loadOrder 8
- Entity Services: loadOrder 10

If Charts needs to load before Entity Services, we should change Charts loadOrder to < 10, or change Entity Services loadOrder to > 8.

However, since they're in different packages with async loading, execution order may differ. Need to verify dependencies.

## Implementation Notes

- Chart.js should only be loaded via chart-loader.js to avoid conflicts
- Calendar scripts are page-specific and should be documented
- Loading order needs verification based on actual dependencies

