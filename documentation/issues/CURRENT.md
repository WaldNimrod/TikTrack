# Current Issues in TikTrack System

## Date: 14/08/2025

### Issues in Database Page (database.html)

1. **CORS Errors** - Page tries to access port 5000 instead of 8080
   - Fixed: Changed URLs from `http://127.0.0.1:5000` to `http://127.0.0.1:8080`
   - Location: `trading-ui/database.html` lines 734, 1321

2. **Empty Tables** - All tables show "No data"
   - Cause: CORS errors prevent loading data from server
   - Existing data in database: 7 accounts, 14 tickers, 3 trades, 3 plans

3. **Authentication Issues** - Login button not responding in index.html
   - Fixed: Added `setupLoginForm` function and message display functions
   - Location: `trading-ui/index.html`

### Server Issues

1. **New Server Instability** - `app_new.py` crashes constantly
   - Cause: Issues with SQLite database locking
   - Temporary solution: Using old server `app.py` with waitress

2. **Database Issues** - database locked errors
   - Temporary files: `.db-journal`, `.db-shm`, `.db-wal`
   - Solution: Delete temporary files and restart server

3. **User Authentication Issues** - login failed
   - Existing users: admin, test, trader, viewer
   - Passwords unknown (encrypted with bcrypt)

### Modified Files

1. `trading-ui/database.html` - Fixed URLs to port 8080
2. `trading-ui/index.html` - Added login functions
3. `trading-ui/scripts/auth.js` - Fixed login URL
4. `trading-ui/scripts/app-header.js` - Fixed account loading

### Current Status

- ✅ Database page loads without JavaScript errors
- ✅ Login button works in index.html
- ❌ Empty tables due to CORS/server issues
- ❌ Server unstable

### Solution Recommendations

1. Return to previous stable version
2. Create new branch for testing other approaches
3. Use old server with waitress
4. Check CORS settings on server
