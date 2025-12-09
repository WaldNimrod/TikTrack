# כללי ניטור - TikTrack

## Monitoring Standards

### תאריך יצירה

ינואר 2025

## כללים עיקריים

### 1. Error Monitoring

**חוק:** חובה לכל שגיאה קריטית.

**יישום:**

- השתמש ב-Sentry (אם מותקן) לשגיאות production
- השתמש ב-`window.Logger.error()` לשגיאות development
- תעד כל שגיאה עם context מלא

**דוגמה:**

```javascript
try {
    // code
} catch (error) {
    // Development
    window.Logger.error('Operation failed', {
        error: error.message,
        stack: error.stack,
        context: { userId, action }
    });
    
    // Production (אם Sentry מותקן)
    if (window.Sentry) {
        window.Sentry.captureException(error, {
            tags: { component: 'trades' },
            extra: { userId, action }
        });
    }
}
```

### 2. Performance Monitoring

**חוק:** Performance monitoring חובה לפני release.

**יישום:**

- השתמש ב-Chrome Performance Profiler
- השתמש ב-Firefox Performance Profiler
- השתמש ב-Lighthouse לבדיקות אוטומטיות
- תעד את התוצאות

**בדיקות:**

```bash
# Lighthouse
npm run performance:check

# Manual profiling
# פתח DevTools → Performance → Record
```

### 3. Log Aggregation

**חוק:** Log aggregation חובה לכל לוגים.

**יישום:**

- השתמש ב-`window.Logger.*` לכל הלוגים
- שמור לוגים ב-localStorage (development)
- שלח לוגים לשרת (production)
- השתמש ב-Sentry לניטור (אם מותקן)

**דוגמה:**

```javascript
// Development
window.Logger.debug('User action', { action: 'click', element: 'button' });

// Production
window.Logger.info('User action', { action: 'click', element: 'button' });
```

### 4. Alert System

**חוק:** Alert system חובה לשגיאות קריטיות.

**יישום:**

- השתמש ב-Sentry alerts (אם מותקן)
- השתמש ב-`window.Logger.critical()` לשגיאות קריטיות
- שלח התראות מיידיות לשגיאות קריטיות

**דוגמה:**

```javascript
try {
    // critical operation
} catch (error) {
    window.Logger.critical('Critical operation failed', {
        error: error.message,
        stack: error.stack,
        context: { /* critical context */ }
    });
    
    // Send alert
    if (window.Sentry) {
        window.Sentry.captureException(error, {
            level: 'fatal',
            tags: { critical: true }
        });
    }
}
```

## כללי Error Tracking

### 1. Error Context

**חוק:** תמיד לכלול context מלא בשגיאות.

**יישום:**

```javascript
window.Logger.error('Failed to save trade', {
    error: error.message,
    stack: error.stack,
    context: {
        tradeId: trade.id,
        userId: user.id,
        action: 'save',
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href
    }
});
```

### 2. Error Grouping

**חוק:** שגיאות דומות צריכות להיות מקובצות.

**יישום:**

- השתמש ב-Sentry error grouping (אם מותקן)
- השתמש ב-error fingerprints
- תעד שגיאות דומות יחד

### 3. Error Severity

**חוק:** תמיד להגדיר severity לשגיאות.

**רמות:**

- **Critical:** שגיאות שמונעות מהמערכת לעבוד
- **Error:** שגיאות שמונעות מפיצ'ר לעבוד
- **Warning:** אזהרות שלא מונעות עבודה
- **Info:** מידע כללי

**יישום:**

```javascript
// Critical
window.Logger.critical('Database connection failed');

// Error
window.Logger.error('Failed to load data');

// Warning
window.Logger.warn('Cache miss');

// Info
window.Logger.info('User logged in');
```

## כללי Performance Monitoring

### 1. Performance Metrics

**חוק:** תמיד למדוד performance metrics לפני release.

**Metrics:**

- Page load time
- API response time
- Database query time
- Cache hit rate
- Memory usage

**יישום:**

```javascript
// Measure API call
const startTime = performance.now();
await fetch('/api/trades');
const endTime = performance.now();
window.Logger.debug('API call duration', {
    endpoint: '/api/trades',
    duration: endTime - startTime
});
```

### 2. Performance Budgets

**חוק:** הגדר performance budgets ושמור עליהם.

**Budgets:**

- Page load: < 2 seconds
- API response: < 500ms
- Database query: < 100ms
- Cache hit rate: > 80%

**בדיקה:**

```bash
# Lighthouse
npm run performance:check

# Manual
# פתח DevTools → Performance → Record
```

### 3. Performance Alerts

**חוק:** הגדר alerts כאשר performance יורד.

**יישום:**

- השתמש ב-Sentry performance monitoring (אם מותקן)
- השתמש ב-Lighthouse CI
- תעד performance degradation

## כללי Log Management

### 1. Log Levels

**חוק:** השתמש ב-log levels נכון.

**Levels:**

- **Debug:** מידע מפורט לפיתוח
- **Info:** מידע כללי
- **Warn:** אזהרות
- **Error:** שגיאות
- **Critical:** שגיאות קריטיות

**יישום:**

```javascript
// Development
window.Logger.debug('Detailed information', { data });

// Production
window.Logger.info('General information', { data });
window.Logger.warn('Warning', { issue });
window.Logger.error('Error', { error });
window.Logger.critical('Critical error', { error });
```

### 2. Log Retention

**חוק:** הגדר log retention policy.

**Policy:**

- Development: שמור 7 ימים
- Production: שמור 30 ימים
- Critical errors: שמור 90 ימים

**יישום:**

- השתמש ב-rotating logs
- נקה לוגים ישנים
- שמור לוגים קריטיים

### 3. Log Privacy

**חוק:** אל תחשוף מידע רגיש בלוגים.

**יישום:**

- אל תחשוף passwords
- אל תחשוף tokens
- אל תחשוף מידע אישי רגיש
- השתמש ב-masking למידע רגיש

**דוגמה:**

```javascript
// ❌ לא נכון
window.Logger.debug('User data', { password: user.password });

// ✅ נכון
window.Logger.debug('User data', { 
    userId: user.id,
    password: '***'
});
```

## כללי Health Monitoring

### 1. Health Checks

**חוק:** תמיד לבדוק health לפני release.

**בדיקות:**

```bash
# Health check
curl http://localhost:8080/api/health

# Detailed health
curl http://localhost:8080/api/health/detailed
```

### 2. Health Metrics

**חוק:** תמיד למדוד health metrics.

**Metrics:**

- Database health
- Cache health
- System health
- API health

**יישום:**

```javascript
// Check health
const health = await fetch('/api/health').then(r => r.json());
if (!health.status === 'healthy') {
    window.Logger.warn('System health check failed', { health });
}
```

## כללי עבודה יומיומיים

### 1. לפני התחלת עבודה

```bash
# בדוק health
curl http://localhost:8080/api/health

# בדוק logs
tail -f logs/app.log
```

### 2. במהלך עבודה

- בדוק logs באופן קבוע
- בדוק performance metrics
- בדוק error rates
- תעד בעיות

### 3. בסיום עבודה

- בדוק שלא נשארו שגיאות קריטיות
- בדוק performance metrics
- תעד את הממצאים

## Troubleshooting

### בעיה: שגיאות לא נשלחות ל-Sentry

**פתרון:**

1. בדוק ש-Sentry מותקן ומוגדר
2. בדוק ש-DSN נכון
3. בדוק ש-source maps מוגדרים
4. בדוק את ה-console לשגיאות

### בעיה: Performance metrics לא מדויקים

**פתרון:**

1. בדוק ש-performance API זמין
2. בדוק ש-timestamps נכונים
3. בדוק ש-measurements לא מושפעים מ-debugging

## קישורים רלוונטיים

- [Debugging Standards](DEBUGGING_STANDARDS.md)
- [Browser Debugging Standards](BROWSER_DEBUGGING_STANDARDS.md)
- [QA and Debugging Guide](../TOOLS/QA_AND_DEBUGGING_GUIDE.md)

---

**תאריך עדכון:** ינואר 2025

