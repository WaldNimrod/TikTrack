# Team 30 → Team 10: Vite Plugin Fix - Critical

**Date:** 2026-02-03  
**Team:** Team 30 (Frontend Execution)  
**Status:** 🔧 Fix Applied  
**Priority:** 🔴 CRITICAL

## 🚨 Problem

**Issue:** Vite `configureServer` middleware not running - React Router intercepts all requests.

**Evidence:**
- No Auth Guard logs when accessing `/trading_accounts`
- Only React Router logs appear
- HTML file never served
- Middleware logs not appearing in server console

**Root Cause:**
- `configureServer` middleware may not run early enough
- Vite's historyApiFallback runs before custom middleware
- React Router intercepts requests before HTML files can be served

## ✅ Solution Applied

**Changed approach:** Using Vite Plugin instead of `configureServer`

**Key Changes:**
1. Created custom Vite plugin `htmlPagesPlugin()`
2. Plugin registered BEFORE react plugin (ensures early execution)
3. Plugin uses `configureServer` hook (runs in correct order)
4. Added comprehensive logging for every request

**Why Plugin Approach:**
- Plugins execute in registration order
- Plugin `configureServer` runs before Vite's default handlers
- More reliable than direct `configureServer` in config

## 📁 Files Modified

- `ui/vite.config.js` - Refactored to use plugin approach

## 🧪 Testing Required

**CRITICAL:** Server MUST be restarted!

1. **Stop Vite server** (Ctrl+C)
2. **Start server:**
   ```bash
   cd ui
   npm run dev
   ```
3. **Check server console** - Should see plugin registration
4. **Navigate to** `http://localhost:8080/trading_accounts?debug=true`
5. **Check server console** - Should see:
   ```
   [HTML Plugin] ============================================
   [HTML Plugin] Request: GET /trading_accounts
   [HTML Plugin] ✅ Mapped route: /trading_accounts -> /views/financial/trading_accounts.html
   [HTML Plugin] ✅✅✅ SERVED: /trading_accounts
   ```
6. **Check browser console** - Should see Auth Guard logs

## ⚠️ Important Notes

1. **Server restart REQUIRED** - Plugin changes only apply after restart
2. **Check server console** - All requests should show `[HTML Plugin]` logs
3. **If still no logs** - May need Team 60 (DevOps) assistance

## 🔄 Alternative Approaches

If plugin approach doesn't work:
1. **Add routes to React Router** as fallback
2. **Use different server** (e.g., Express) instead of Vite dev server
3. **Coordinate with Team 60** for production server configuration

---

**Team 30 - Frontend Execution**  
**Plugin Fix Applied - Awaiting Verification**
