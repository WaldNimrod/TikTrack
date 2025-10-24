# Migration Checklist - 29 עמודים

## סקירה

**מטרה:** מיגרציה מלאה של כל 29 העמודים למערכת החדשה  
**זמן:** 40-50 שעות  
**תוצאה:** כל העמודים עובדים עם Cache + Logger + Linting

---

## עמודים מרכזיים (11 עמודים)

### 1. index.html - Dashboard
**זמן משוער:** 2 שעות  
**קבצים:** index.html, scripts/dashboard.js

**משימות:**
- [ ] העתק imports (cache-manager.js, logger-service.js)
- [ ] החלף UnifiedCacheManager → CacheManager
- [ ] החלף console.log → Logger.info/error
- [ ] עדכון cache keys: dashboard-data
- [ ] עדכון dependencies: market-data, trades-data
- [ ] בדיקה: טעינה תקינה
- [ ] בדיקה: cache עובד
- [ ] בדיקה: logger שולח לשרת
- [ ] בדיקה: dashboard data נטען
- [ ] בדיקה: statistics מעודכנות

**Cache Keys:**
```javascript
// לפני
UnifiedCacheManager.get('dashboard-data')

// אחרי  
CacheManager.get('dashboard-data')
```

**Logger Calls:**
```javascript
// לפני
console.log('Dashboard loaded')

// אחרי
Logger.info('Dashboard loaded', { page: 'index' })
```

---

### 2. trades.html - Trades Management
**זמן משוער:** 3 שעות  
**קבצים:** trades.html, scripts/trades.js

**משימות:**
- [ ] העתק imports
- [ ] החלף cache calls (22 מקומות)
- [ ] החלף console calls (35 מקומות)
- [ ] עדכון cache keys: trades-data, trade-{id}
- [ ] עדכון dependencies: accounts-data
- [ ] בדיקה: CRUD עובד
- [ ] בדיקה: dependencies invalidation
- [ ] בדיקה: table actions
- [ ] בדיקה: form validation
- [ ] בדיקה: data export

**Cache Updates:**
```javascript
// לפני
UnifiedCacheManager.set('trades-data', data)

// אחרי
CacheManager.set('trades-data', data, 'short')
CacheManager.invalidateByDependency('accounts-data')
```

**Logger Updates:**
```javascript
// לפני
console.error('Failed to save trade')

// אחרי
Logger.error('Failed to save trade', error, { tradeId: id })
```

---

### 3. trade_plans.html - Trade Plans
**זמן משוער:** 2.5 שעות  
**קבצים:** trade_plans.html, scripts/trade-plans.js

**משימות:**
- [ ] העתק imports
- [ ] החלף cache calls (15 מקומות)
- [ ] החלף console calls (20 מקומות)
- [ ] עדכון cache keys: plans-data, plan-{id}
- [ ] עדכון dependencies: accounts-data
- [ ] בדיקה: plan creation
- [ ] בדיקה: plan execution
- [ ] בדיקה: plan monitoring

---

### 4. alerts.html - Alerts Management
**זמן משוער:** 2.5 שעות  
**קבצים:** alerts.html, scripts/alerts.js

**משימות:**
- [ ] העתק imports
- [ ] החלף cache calls (18 מקומות)
- [ ] החלף console calls (25 מקומות)
- [ ] עדכון cache keys: alerts-data, alert-{id}
- [ ] עדכון dependencies: accounts-data
- [ ] בדיקה: alert creation
- [ ] בדיקה: alert triggering
- [ ] בדיקה: alert management

---

### 5. tickers.html - Tickers Management
**זמן משוער:** 2.5 שעות  
**קבצים:** tickers.html, scripts/tickers.js

**משימות:**
- [ ] העתק imports
- [ ] החלף cache calls (20 מקומות)
- [ ] החלף console calls (30 מקומות)
- [ ] עדכון cache keys: tickers-data, ticker-{id}
- [ ] עדכון dependencies: accounts-data
- [ ] בדיקה: ticker CRUD
- [ ] בדיקה: market data
- [ ] בדיקה: price updates

---

### 6. trading_accounts.html - Trading Accounts
**זמן משוער:** 2 שעות  
**קבצים:** trading_accounts.html, scripts/trading-accounts.js

**משימות:**
- [ ] העתק imports
- [ ] החלף cache calls (12 מקומות)
- [ ] החלף console calls (15 מקומות)
- [ ] עדכון cache keys: accounts-data, account-{id}
- [ ] עדכון dependencies: user-preferences
- [ ] בדיקה: account CRUD
- [ ] בדיקה: account settings
- [ ] בדיקה: account status

---

### 7. executions.html - Executions
**זמן משוער:** 2.5 שעות  
**קבצים:** executions.html, scripts/executions.js

**משימות:**
- [ ] העתק imports
- [ ] החלף cache calls (16 מקומות)
- [ ] החלף console calls (22 מקומות)
- [ ] עדכון cache keys: executions-data, execution-{id}
- [ ] עדכון dependencies: accounts-data
- [ ] בדיקה: execution CRUD
- [ ] בדיקה: execution matching
- [ ] בדיקה: execution reports

---

### 8. cash_flows.html - Cash Flows
**זמן משוער:** 2 שעות  
**קבצים:** cash_flows.html, scripts/cash-flows.js

**משימות:**
- [ ] העתק imports
- [ ] החלף cache calls (10 מקומות)
- [ ] החלף console calls (12 מקומות)
- [ ] עדכון cache keys: flows-data, flow-{id}
- [ ] עדכון dependencies: accounts-data
- [ ] בדיקה: flow CRUD
- [ ] בדיקה: flow calculations
- [ ] בדיקה: flow reports

---

### 9. notes.html - Notes
**זמן משוער:** 1.5 שעות  
**קבצים:** notes.html, scripts/notes.js

**משימות:**
- [ ] העתק imports
- [ ] החלף cache calls (8 מקומות)
- [ ] החלף console calls (10 מקומות)
- [ ] עדכון cache keys: notes-data, note-{id}
- [ ] עדכון dependencies: accounts-data
- [ ] בדיקה: note CRUD
- [ ] בדיקה: note search
- [ ] בדיקה: note categories

---

### 10. research.html - Research
**זמן משוער:** 2 שעות  
**קבצים:** research.html, scripts/research.js

**משימות:**
- [ ] העתק imports
- [ ] החלף cache calls (12 מקומות)
- [ ] החלף console calls (15 מקומות)
- [ ] עדכון cache keys: research-data, research-{id}
- [ ] עדכון dependencies: accounts-data
- [ ] בדיקה: research CRUD
- [ ] בדיקה: research analysis
- [ ] בדיקה: research reports

---

### 11. preferences.html - Preferences
**זמן משוער:** 3 שעות  
**קבצים:** preferences.html, scripts/preferences.js

**משימות:**
- [ ] העתק imports
- [ ] החלף cache calls (25 מקומות)
- [ ] החלף console calls (30 מקומות)
- [ ] עדכון cache keys: preference-data, profile-data
- [ ] עדכון dependencies: user-preferences
- [ ] בדיקה: preferences CRUD
- [ ] בדיקה: color system
- [ ] בדיקה: profile management
- [ ] בדיקה: settings validation

---

## עמודים טכניים (13 עמודים)

### 12. db_display.html - Database Display
**זמן משוער:** 1.5 שעות  
**קבצים:** db_display.html, scripts/db-display.js

**משימות:**
- [ ] העתק imports
- [ ] החלף cache calls (5 מקומות)
- [ ] החלף console calls (8 מקומות)
- [ ] עדכון cache keys: db-data, table-{name}
- [ ] עדכון dependencies: -
- [ ] בדיקה: table display
- [ ] בדיקה: data export
- [ ] בדיקה: data filtering

---

### 13. db_extradata.html - External Data Display
**זמן משוער:** 2 שעות  
**קבצים:** db_extradata.html, scripts/db-extradata.js

**משימות:**
- [ ] העתק imports
- [ ] החלף cache calls (8 מקומות)
- [ ] החלף console calls (12 מקומות)
- [ ] עדכון cache keys: extradata-{type}
- [ ] עדכון dependencies: -
- [ ] בדיקה: external data display
- [ ] בדיקה: data refresh
- [ ] בדיקה: data export

---

### 14. db_logs.html - Logs Display
**זמן משוער:** 1 שעה  
**קבצים:** db_logs.html, scripts/db-logs.js

**משימות:**
- [ ] העתק imports
- [ ] החלף cache calls (3 מקומות)
- [ ] החלף console calls (5 מקומות)
- [ ] עדכון cache keys: logs-data
- [ ] עדכון dependencies: -
- [ ] בדיקה: logs display
- [ ] בדיקה: log filtering
- [ ] בדיקה: log export

---

### 15. db_performance.html - Performance Display
**זמן משוער:** 1.5 שעות  
**קבצים:** db_performance.html, scripts/db-performance.js

**משימות:**
- [ ] העתק imports
- [ ] החלף cache calls (6 מקומות)
- [ ] החלף console calls (8 מקומות)
- [ ] עדכון cache keys: performance-data
- [ ] עדכון dependencies: -
- [ ] בדיקה: performance display
- [ ] בדיקה: metrics calculation
- [ ] בדיקה: performance export

---

### 16. db_errors.html - Errors Display
**זמן משוער:** 1 שעה  
**קבצים:** db_errors.html, scripts/db-errors.js

**משימות:**
- [ ] העתק imports
- [ ] החלף cache calls (3 מקומות)
- [ ] החלף console calls (5 מקומות)
- [ ] עדכון cache keys: errors-data
- [ ] עדכון dependencies: -
- [ ] בדיקה: errors display
- [ ] בדיקה: error filtering
- [ ] בדיקה: error export

---

### 17. db_cache.html - Cache Display
**זמן משוער:** 1.5 שעות  
**קבצים:** db_cache.html, scripts/db-cache.js

**משימות:**
- [ ] העתק imports
- [ ] החלף cache calls (5 מקומות)
- [ ] החלף console calls (8 מקומות)
- [ ] עדכון cache keys: cache-stats
- [ ] עדכון dependencies: -
- [ ] בדיקה: cache display
- [ ] בדיקה: cache management
- [ ] בדיקה: cache cleanup

---

### 18. db_users.html - Users Display
**זמן משוער:** 1.5 שעות  
**קבצים:** db_users.html, scripts/db-users.js

**משימות:**
- [ ] העתק imports
- [ ] החלף cache calls (4 מקומות)
- [ ] החלף console calls (6 מקומות)
- [ ] עדכון cache keys: users-data
- [ ] עדכון dependencies: -
- [ ] בדיקה: users display
- [ ] בדיקה: user management
- [ ] בדיקה: user export

---

### 19. db_settings.html - Settings Display
**זמן משוער:** 1.5 שעות  
**קבצים:** db_settings.html, scripts/db-settings.js

**משימות:**
- [ ] העתק imports
- [ ] החלף cache calls (5 מקומות)
- [ ] החלף console calls (7 מקומות)
- [ ] עדכון cache keys: settings-data
- [ ] עדכון dependencies: -
- [ ] בדיקה: settings display
- [ ] בדיקה: settings management
- [ ] בדיקה: settings export

---

### 20. db_backup.html - Backup Display
**זמן משוער:** 1.5 שעות  
**קבצים:** db_backup.html, scripts/db-backup.js

**משימות:**
- [ ] העתק imports
- [ ] החלף cache calls (4 מקומות)
- [ ] החלף console calls (6 מקומות)
- [ ] עדכון cache keys: backup-data
- [ ] עדכון dependencies: -
- [ ] בדיקה: backup display
- [ ] בדיקה: backup management
- [ ] בדיקה: backup export

---

### 21. db_restore.html - Restore Display
**זמן משוער:** 1.5 שעות  
**קבצים:** db_restore.html, scripts/db-restore.js

**משימות:**
- [ ] העתק imports
- [ ] החלף cache calls (4 מקומות)
- [ ] החלף console calls (6 מקומות)
- [ ] עדכון cache keys: restore-data
- [ ] עדכון dependencies: -
- [ ] בדיקה: restore display
- [ ] בדיקה: restore management
- [ ] בדיקה: restore export

---

### 22. db_migrations.html - Migrations Display
**זמן משוער:** 1.5 שעות  
**קבצים:** db_migrations.html, scripts/db-migrations.js

**משימות:**
- [ ] העתק imports
- [ ] החלף cache calls (4 מקומות)
- [ ] החלף console calls (6 מקומות)
- [ ] עדכון cache keys: migrations-data
- [ ] עדכון dependencies: -
- [ ] בדיקה: migrations display
- [ ] בדיקה: migration management
- [ ] בדיקה: migration export

---

### 23. db_health.html - Health Check Display
**זמן משוער:** 1.5 שעות  
**קבצים:** db_health.html, scripts/db-health.js

**משימות:**
- [ ] העתק imports
- [ ] החלף cache calls (5 מקומות)
- [ ] החלף console calls (7 מקומות)
- [ ] עדכון cache keys: health-data
- [ ] עדכון dependencies: -
- [ ] בדיקה: health display
- [ ] בדיקה: health monitoring
- [ ] בדיקה: health export

---

### 24. db_analytics.html - Analytics Display
**זמן משוער:** 1.5 שעות  
**קבצים:** db_analytics.html, scripts/db-analytics.js

**משימות:**
- [ ] העתק imports
- [ ] החלף cache calls (6 מקומות)
- [ ] החלף console calls (8 מקומות)
- [ ] עדכון cache keys: analytics-data
- [ ] עדכון dependencies: -
- [ ] בדיקה: analytics display
- [ ] בדיקה: analytics calculation
- [ ] בדיקה: analytics export

---

## עמודים משניים (5 עמודים)

### 25. external-data-dashboard.html - External Data Dashboard
**זמן משוער:** 2 שעות  
**קבצים:** external-data-dashboard.html, scripts/external-data-dashboard.js

**משימות:**
- [ ] העתק imports
- [ ] החלף cache calls (10 מקומות)
- [ ] החלף console calls (15 מקומות)
- [ ] עדכון cache keys: extradata-dashboard
- [ ] עדכון dependencies: market-data
- [ ] בדיקה: dashboard display
- [ ] בדיקה: data refresh
- [ ] בדיקה: data export

---

### 26. designs.html - Designs Display
**זמן משוער:** 1.5 שעות  
**קבצים:** designs.html, scripts/designs.js

**משימות:**
- [ ] העתק imports
- [ ] החלף cache calls (5 מקומות)
- [ ] החלף console calls (8 מקומות)
- [ ] עדכון cache keys: designs-data
- [ ] עדכון dependencies: -
- [ ] בדיקה: designs display
- [ ] בדיקה: design management
- [ ] בדיקה: design export

---

### 27. colors.html - Colors Display
**זמן משוער:** 1.5 שעות  
**קבצים:** colors.html, scripts/colors.js

**משימות:**
- [ ] העתק imports
- [ ] החלף cache calls (6 מקומות)
- [ ] החלף console calls (10 מקומות)
- [ ] עדכון cache keys: colors-data
- [ ] עדכון dependencies: user-preferences
- [ ] בדיקה: colors display
- [ ] בדיקה: color management
- [ ] בדיקה: color export

---

### 28. fonts.html - Fonts Display
**זמן משוער:** 1.5 שעות  
**קבצים:** fonts.html, scripts/fonts.js

**משימות:**
- [ ] העתק imports
- [ ] החלף cache calls (4 מקומות)
- [ ] החלף console calls (6 מקומות)
- [ ] עדכון cache keys: fonts-data
- [ ] עדכון dependencies: user-preferences
- [ ] בדיקה: fonts display
- [ ] בדיקה: font management
- [ ] בדיקה: font export

---

### 29. icons.html - Icons Display
**זמן משוער:** 1.5 שעות  
**קבצים:** icons.html, scripts/icons.js

**משימות:**
- [ ] העתק imports
- [ ] החלף cache calls (4 מקומות)
- [ ] החלף console calls (6 מקומות)
- [ ] עדכון cache keys: icons-data
- [ ] עדכון dependencies: user-preferences
- [ ] בדיקה: icons display
- [ ] בדיקה: icon management
- [ ] בדיקה: icon export

---

## סיכום כולל

### זמן משוער למיגרציה
- **עמודים מרכזיים (11):** 26.5 שעות
- **עמודים טכניים (13):** 18 שעות
- **עמודים משניים (5):** 8 שעות

**סה"כ:** 52.5 שעות (≈ 6.5 ימי עבודה)

### חלוקה לשבועות
- **שבוע 1:** עמודים מרכזיים (26.5 שעות)
- **שבוע 2:** עמודים טכניים + משניים (26 שעות)

### סדר עדיפויות
1. **גבוה:** עמודים מרכזיים (11 עמודים)
2. **בינוני:** עמודים טכניים (13 עמודים)
3. **נמוך:** עמודים משניים (5 עמודים)

---

## תוכנית מיגרציה

### שלב 1: הכנה (יום 1)
- [ ] יצירת template למיגרציה
- [ ] הכנת checklist מפורט
- [ ] בדיקות בסיסיות

### שלב 2: עמודים מרכזיים (יום 2-4)
- [ ] 11 עמודים מרכזיים
- [ ] בדיקות אינטגרציה
- [ ] בדיקות CRUD

### שלב 3: עמודים טכניים (יום 5-6)
- [ ] 13 עמודים טכניים
- [ ] בדיקות תצוגה
- [ ] בדיקות ניהול

### שלב 4: עמודים משניים (יום 7)
- [ ] 5 עמודים משניים
- [ ] בדיקות סופיות
- [ ] בדיקות E2E

---

## מדדי הצלחה

### Cache Integration
- ✅ 95% מהעמודים משתמשים ב-Cache
- ✅ Dependencies mapping עובד
- ✅ TTL policies מוגדרות

### Logger Integration
- ✅ 100% מהעמודים משתמשים ב-Logger
- ✅ Error tracking עובד
- ✅ Performance monitoring עובד

### Linting Integration
- ✅ 100% מהקבצים עוברים ESLint
- ✅ Code style אחיד
- ✅ No unused variables

### Testing Coverage
- ✅ 80% code coverage
- ✅ כל העמודים נבדקים
- ✅ E2E tests עוברים
