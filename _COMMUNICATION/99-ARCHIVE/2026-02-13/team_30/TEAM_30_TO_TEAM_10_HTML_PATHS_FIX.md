# Team 30 → Team 10: HTML Static Assets Path Fix

**Date:** 2026-02-03  
**From:** Team 30 (Frontend Implementation)  
**To:** Team 10 (The Gateway)  
**Priority:** High  
**Status:** ✅ Fixed

---

## 🎯 Issue Summary

Static HTML pages (e.g., `/trading_accounts`) were failing to load JavaScript and CSS files because they used **relative paths** that broke when the HTML was served from clean routes (e.g., `/trading_accounts` instead of `/views/financial/trading_accounts.html`).

### Error Example:
```
GET http://localhost:8080/auth-guard.js net::ERR_ABORTED 404 (Not Found)
GET http://localhost:8080/components/core/phoenix-filter-bridge.js net::ERR_ABORTED 404 (Not Found)
GET http://localhost:8080/header-loader.js net::ERR_ABORTED 404 (Not Found)
```

---

## 🔍 Root Cause

When an HTML file is served from `/trading_accounts` (via Vite middleware), relative paths like `auth-guard.js` resolve to `/auth-guard.js` instead of `/src/views/financial/auth-guard.js`.

**Example:**
- HTML file location: `ui/src/views/financial/trading_accounts.html`
- Served from: `/trading_accounts`
- Relative path `auth-guard.js` → resolves to `/auth-guard.js` ❌
- Should resolve to: `/src/views/financial/auth-guard.js` ✅

---

## ✅ Solution Implemented

**Changed all relative paths to absolute paths** using `/src/...` prefix, which Vite serves automatically.

### Files Updated:

1. **`ui/src/views/financial/trading_accounts.html`**
   - ✅ All `<script src="...">` paths updated to `/src/...`
   - ✅ All `<link rel="stylesheet" href="...">` paths updated to `/src/...`

2. **`ui/src/views/financial/brokers_fees.html`**
   - ✅ Script and CSS paths updated

3. **`ui/src/views/financial/cash_flows.html`**
   - ✅ Script and CSS paths updated

### Path Changes:

| Old (Relative) | New (Absolute) |
|----------------|-----------------|
| `auth-guard.js` | `/src/views/financial/auth-guard.js` |
| `../../components/core/phoenix-filter-bridge.js` | `/src/components/core/phoenix-filter-bridge.js` |
| `../../styles/phoenix-base.css` | `/src/styles/phoenix-base.css` |
| `footer-loader.js` | `/src/views/financial/footer-loader.js` |
| `navigation-handler.js` | `/src/views/financial/navigation-handler.js` |
| `../../cubes/shared/PhoenixTableSortManager.js` | `/src/cubes/shared/PhoenixTableSortManager.js` |

---

## ✅ Additional Fixes (Update 2)

### Issue 2: Header and Footer Not Loading
**Problem:** `header-loader.js` and `footer-loader.js` used relative paths that broke when HTML was served from clean routes.

**Solution:** Updated both loaders to use absolute paths:
- `header-loader.js`: Changed to `/src/components/core/unified-header.html`
- `footer-loader.js`: Changed to `/src/views/financial/footer.html`
- Also fixed script paths in `header-loader.js` (header-dropdown.js, header-filters.js, etc.)

### Issue 3: Syntax Error in d16-data-loader.js
**Problem:** Line 406 had template literal inside single quotes: `'${flow.status || ''}'`

**Solution:** Changed to proper template literal: `` `${flow.status || ''}` ``

### Issue 4: CORS Errors - API Calls Not Using Vite Proxy
**Problem:** `d16-data-loader.js` was making direct API calls to `http://localhost:8082/api/v1` instead of using Vite's proxy (`/api/v1`), causing CORS errors.

**Solution:** Changed `API_BASE_URL` from:
```javascript
const API_BASE_URL = window.location.origin.includes('localhost') 
  ? 'http://localhost:8082/api/v1' 
  : `${window.location.origin}/api/v1`;
```
To:
```javascript
const API_BASE_URL = '/api/v1';  // Uses Vite proxy configured in vite.config.js
```

**Note:** Vite proxy is configured in `vite.config.js`:
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:8082',
    changeOrigin: true,
    secure: false,
  },
}
```

---

## 🧪 Testing Required

**Please verify:**
1. Navigate to `/trading_accounts?debug=true`
2. Check browser console - all scripts should load without 404 errors
3. **Verify header and footer are visible** ✅
4. Verify page functionality (header, footer, table, filters)
5. Test `/brokers_fees` and `/cash_flows` pages

---

## 📋 Next Steps

- ✅ **Completed:** Fixed all static asset paths in HTML files
- ✅ **Completed:** Fixed header-loader.js and footer-loader.js paths
- ✅ **Completed:** Fixed syntax error in d16-data-loader.js
- ⏳ **Pending:** User verification of fix
- ⏳ **Pending:** Update other HTML pages if they exist (e.g., `user_profile.html`)

---

## 🔗 Related Files

- `ui/src/views/financial/trading_accounts.html`
- `ui/src/views/financial/brokers_fees.html`
- `ui/src/views/financial/cash_flows.html`
- `ui/vite.config.js` (middleware already handles `/src/` paths correctly)

---

**Team 30 Status:** ✅ Ready for QA testing
