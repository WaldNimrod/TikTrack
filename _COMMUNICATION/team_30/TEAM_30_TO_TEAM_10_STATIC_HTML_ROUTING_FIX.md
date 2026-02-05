# Team 30 → Team 10: Static HTML Routing Fix

**Date:** 2026-01-31  
**Team:** Team 30 (Frontend Execution)  
**Status:** ✅ Implementation Complete  
**Priority:** High

## 📋 Summary

Fixed routing issue where static HTML pages (e.g., `/trading_accounts`) were redirecting to home page instead of serving the HTML file directly. Implemented Vite middleware to serve static HTML files before React Router intercepts them.

## 🔍 Problem Identified

1. **Clean Routes Requirement**: User requested clean, generic route names (e.g., `/trading_accounts` instead of `/views/financial/D16_ACCTS_VIEW.html`)
2. **Redirect Issue**: Static HTML pages were redirecting to home page because React Router's catch-all route (`path="*"`) was intercepting all unknown routes
3. **Vite Configuration**: Vite dev server was serving all requests through React Router, preventing direct access to static HTML files

## ✅ Solution Implemented

### 1. Vite Middleware Configuration (`ui/vite.config.js`)

Added `configureServer` middleware that:
- **Maps clean routes to HTML files**:
  - `/trading_accounts` → `/views/financial/D16_ACCTS_VIEW.html`
  - `/brokers_fees` → `/views/financial/D18_BRKRS_VIEW.html`
  - `/cash_flows` → `/views/financial/D21_CASH_VIEW.html`
  - `/user_profile` → `/views/financial/user_profile.html`
- **Serves HTML files directly** before React Router intercepts them
- **Logs all requests** for debugging

### 2. Updated Header Links (`ui/src/components/core/unified-header.html`)

- Removed `data-html-page` attributes (no longer needed)
- Updated links to use clean routes:
  - `/trading_accounts` (was: `/trading_accounts` with `data-html-page="/views/financial/D16_ACCTS_VIEW.html"`)
  - `/user_profile` (was: `/user_profile` with `data-html-page="/views/financial/user_profile.html"`)

### 3. Updated Navigation Handler (`ui/src/views/financial/navigation-handler.js`)

- Added list of clean HTML page routes
- Updated detection logic to recognize clean routes as HTML pages
- Maintains backward compatibility with `data-html-page` attribute (legacy support)

## 📁 Files Modified

1. `ui/vite.config.js` - Added middleware for static HTML routing
2. `ui/src/components/core/unified-header.html` - Updated links to clean routes
3. `ui/src/views/financial/navigation-handler.js` - Updated route detection

## 🧪 Testing Required

1. **Restart Vite dev server** (required for middleware changes):
   ```bash
   cd ui
   npm run dev
   ```

2. **Test clean routes**:
   - Navigate to `http://localhost:8080/trading_accounts`
   - Should serve `D16_ACCTS_VIEW.html` directly
   - Check Vite server console for middleware logs

3. **Test direct HTML access**:
   - Navigate to `http://localhost:8080/views/financial/D16_ACCTS_VIEW.html`
   - Should also work (backward compatibility)

4. **Test navigation from header**:
   - Click "חשבונות מסחר" in main menu
   - Should navigate to `/trading_accounts` and serve HTML file

## ⚠️ Important Notes

1. **Server Restart Required**: Vite middleware changes require server restart
2. **Route Mapping**: New HTML pages must be added to `routeToHtmlMap` in `vite.config.js`
3. **Clean Routes Only**: Use clean, generic route names (e.g., `/trading_accounts`) instead of file paths
4. **Middleware Order**: Middleware runs BEFORE React Router, ensuring HTML files are served first

## 🔄 Next Steps

1. **Team 10 Review**: Please review the implementation and confirm it meets requirements
2. **Team 60 Coordination**: If production deployment requires different configuration, coordinate with Team 60 (DevOps)
3. **Documentation**: Update routing documentation with clean route mappings

## 📝 Route Mapping Reference

| Clean Route | HTML File |
|------------|-----------|
| `/trading_accounts` | `/views/financial/D16_ACCTS_VIEW.html` |
| `/brokers_fees` | `/views/financial/D18_BRKRS_VIEW.html` |
| `/cash_flows` | `/views/financial/D21_CASH_VIEW.html` |
| `/user_profile` | `/views/financial/user_profile.html` |

---

**Team 30 - Frontend Execution**  
**Implementation Complete - Awaiting QA**
