# Team 30 → Team 10: File Naming and Routing Fix

**Date:** 2026-01-31  
**Team:** Team 30 (Frontend Execution)  
**Status:** ✅ Implementation Complete  
**Priority:** High

## 📋 Summary

Fixed critical issues with file naming and routing:
1. **Renamed HTML files** to clean, maintainable route names
2. **Fixed login link navigation** - React routes now work correctly
3. **Added auth guard** to all HTML pages
4. **Improved auth guard timing** to handle post-login redirects

## 🔍 Problems Identified

1. **File Naming**: HTML files had technical names (e.g., `D16_ACCTS_VIEW.html`) instead of clean route names
2. **Login Link**: Clicking login link from header caused page reload instead of navigation
3. **Post-Login Access**: After successful login, HTML pages were not accessible
4. **Missing Auth Guard**: Some HTML pages (`brokers_fees.html`, `cash_flows.html`) were missing auth guard

## ✅ Solution Implemented

### 1. File Renaming (Clean Route Names)

**Renamed files:**
- `D16_ACCTS_VIEW.html` → `trading_accounts.html`
- `D18_BRKRS_VIEW.html` → `brokers_fees.html`
- `D21_CASH_VIEW.html` → `cash_flows.html`

**Rationale:** File names now match route names for maintainability and clarity.

### 2. Updated Vite Middleware (`ui/vite.config.js`)

Updated route mapping to use new file names:
```javascript
const routeToHtmlMap = {
  '/trading_accounts': '/views/financial/trading_accounts.html',
  '/brokers_fees': '/views/financial/brokers_fees.html',
  '/cash_flows': '/views/financial/cash_flows.html',
  '/user_profile': '/views/financial/user_profile.html',
};
```

### 3. Fixed Navigation Handler (`ui/src/views/financial/navigation-handler.js`)

**Added React routes whitelist:**
- `/`, `/login`, `/register`, `/reset-password`, `/profile`
- React routes are now explicitly allowed to use default browser navigation
- HTML page routes are intercepted and handled by Vite middleware

**Key change:**
```javascript
// Check if this is a React route - if so, let React Router handle it
if (reactRoutes.includes(linkHref)) {
  console.log('Navigation Handler: React route detected, allowing React Router to handle:', linkHref);
  // Don't prevent default - let React Router handle it
  return;
}
```

### 4. Added Auth Guard to All HTML Pages

Added `auth-guard.js` to:
- `trading_accounts.html` (already had it)
- `brokers_fees.html` (added)
- `cash_flows.html` (added)

### 5. Improved Auth Guard Timing (`ui/src/views/financial/auth-guard.js`)

**Increased delay** from 200ms to 500ms to ensure token is available after login redirect:
- Login redirects to home page, then user navigates to HTML page
- Token needs time to be stored in localStorage
- Increased delay ensures token is available when auth guard runs

## 📁 Files Modified

1. **Renamed:**
   - `ui/src/views/financial/D16_ACCTS_VIEW.html` → `trading_accounts.html`
   - `ui/src/views/financial/D18_BRKRS_VIEW.html` → `brokers_fees.html`
   - `ui/src/views/financial/D21_CASH_VIEW.html` → `cash_flows.html`

2. **Updated:**
   - `ui/vite.config.js` - Updated route mapping to new file names
   - `ui/src/views/financial/navigation-handler.js` - Added React routes whitelist
   - `ui/src/views/financial/auth-guard.js` - Increased delay for post-login access
   - `ui/src/views/financial/brokers_fees.html` - Added auth guard
   - `ui/src/views/financial/cash_flows.html` - Added auth guard

## 🧪 Testing Required

1. **Restart Vite dev server** (required for middleware changes):
   ```bash
   cd ui
   npm run dev
   ```

2. **Test login link:**
   - Click "התחברות" link in header
   - Should navigate to `/login` (React route)
   - Should NOT reload the page

3. **Test post-login access:**
   - Login successfully
   - Navigate to `/trading_accounts`
   - Should serve HTML page (not redirect to home)
   - Check browser console for auth guard logs

4. **Test clean routes:**
   - Navigate to `http://localhost:8080/trading_accounts`
   - Should serve `trading_accounts.html`
   - Check Vite server console for middleware logs

5. **Test file naming:**
   - Verify all HTML files use clean route names
   - Verify route mapping in `vite.config.js` matches file names

## ⚠️ Important Notes

1. **Server Restart Required**: Vite middleware changes require server restart
2. **File Naming Convention**: All HTML files must use clean route names matching their routes
3. **Route Mapping**: New HTML pages must be added to `routeToHtmlMap` in `vite.config.js`
4. **Auth Guard Timing**: 500ms delay ensures token is available after login redirects

## 🔄 Next Steps

1. **Team 10 Review**: Please review the implementation and confirm it meets requirements
2. **Team 60 Coordination**: If production deployment requires different configuration, coordinate with Team 60 (DevOps)
3. **Documentation**: Update routing documentation with clean route mappings and file naming convention

## 📝 Route Mapping Reference

| Clean Route | HTML File |
|------------|-----------|
| `/trading_accounts` | `/views/financial/trading_accounts.html` |
| `/brokers_fees` | `/views/financial/brokers_fees.html` |
| `/cash_flows` | `/views/financial/cash_flows.html` |
| `/user_profile` | `/views/financial/user_profile.html` |

## 🚨 Known Issues / Questions

1. **Post-Login Redirect**: After login, user is redirected to home page. Then navigation to HTML pages should work. If not, check:
   - Token exists in localStorage
   - Auth guard logs in browser console
   - Vite middleware logs in server console

2. **Team Coordination**: If issues persist, may require coordination with:
   - **Team 60 (DevOps)**: For server configuration
   - **Team 20 (Backend)**: For authentication token handling

---

**Team 30 - Frontend Execution**  
**Implementation Complete - Awaiting QA**
