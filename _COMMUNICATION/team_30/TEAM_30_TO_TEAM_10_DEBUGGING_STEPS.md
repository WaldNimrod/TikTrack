# Team 30 → Team 10: Debugging Steps for Routing Issues

**Date:** 2026-01-31  
**Team:** Team 30 (Frontend Execution)  
**Status:** 🔍 Debugging Required  
**Priority:** Critical

## 🔍 Current Issues

1. **Login link not working** - Page reloads instead of navigating
2. **Post-login page access** - Pages redirect to home after login

## ✅ Fixes Applied

1. ✅ Added `user-profile-link` to navigation handler selector
2. ✅ Improved auth guard logging
3. ✅ File names changed to clean routes

## 🧪 Debugging Steps Required

### Step 1: Check Vite Server Console

When accessing `http://localhost:8080/trading_accounts`, check the **Vite server console** (terminal where `npm run dev` is running) for:

```
[Vite Middleware] Request: GET /trading_accounts
[Vite Middleware] Mapped route detected: /trading_accounts -> /views/financial/trading_accounts.html
[Vite Middleware] Checking file: /path/to/ui/src/views/financial/trading_accounts.html
[Vite Middleware] ✅ Serving mapped route: /trading_accounts -> /views/financial/trading_accounts.html
```

**If you see:**
- `❌ Mapped HTML file not found` → File path issue
- No middleware logs at all → Middleware not running (server not restarted?)

### Step 2: Check Browser Console

When accessing `http://localhost:8080/trading_accounts`, check the **browser console** (F12) for:

```
Auth Guard: Initializing...
Auth Guard: Current URL: http://localhost:8080/trading_accounts
Auth Guard: Checking page access - current path: /trading_accounts
Auth Guard: localStorage keys: [...]
Auth Guard: Checking authentication - token exists: true/false
Auth Guard: ✅ User authenticated, allowing access to: /trading_accounts
```

**If you see:**
- `User not authenticated, redirecting to login` → Token not found in localStorage
- No auth guard logs → Script not loading

### Step 3: Check Navigation Handler

When clicking login link, check browser console for:

```
Navigation Handler: Click detected on link to /login
Navigation Handler: React route detected, allowing React Router to handle: /login
```

**If you see:**
- No logs → Handler not attached to link
- `Navigating to HTML page` → Wrong handler (should be React route)

### Step 4: Verify File Exists

Run in terminal:
```bash
cd ui
ls -la src/views/financial/trading_accounts.html
```

Should show file exists.

### Step 5: Test Direct Access

Try accessing directly:
```
http://localhost:8080/views/financial/trading_accounts.html
```

**If this works** → Vite middleware issue  
**If this doesn't work** → File path or server configuration issue

## 🔧 Quick Fixes to Try

### Fix 1: Restart Vite Server

```bash
# Stop server (Ctrl+C)
cd ui
npm run dev
```

### Fix 2: Clear Browser Cache

- Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
- Or clear cache in browser settings

### Fix 3: Check Token in localStorage

Open browser console and run:
```javascript
localStorage.getItem('access_token')
```

Should return a JWT token string if logged in.

### Fix 4: Manual Test

1. Open browser console
2. Navigate to `http://localhost:8080/trading_accounts`
3. Check all console logs
4. Share logs with Team 30

## 📋 Information Needed from User

Please provide:

1. **Vite server console logs** when accessing `/trading_accounts`
2. **Browser console logs** when accessing `/trading_accounts`
3. **Browser console logs** when clicking login link
4. **Result of** `localStorage.getItem('access_token')` in browser console
5. **Did you restart the Vite server** after the changes?

## 🚨 If Issues Persist

May require coordination with:
- **Team 60 (DevOps)**: Server configuration
- **Team 20 (Backend)**: Authentication token handling

---

**Team 30 - Frontend Execution**  
**Awaiting Debugging Information**
