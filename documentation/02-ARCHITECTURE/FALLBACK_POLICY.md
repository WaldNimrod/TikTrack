# Fallback Policy - TikTrack

## סקירה כללית

**Fallback Policy** מגדיר את האסטרטגיה המקיפה לטיפול בכשלים במערכת TikTrack. המדיניות מספקת fallback mechanisms לכל רכיב במערכת עם הגדרת קטגוריות, עדיפויות ותרחישי שחזור.

## קטגוריות Fallback

### 1. UI Fallbacks

**מטרה:** שמירה על חוויית משתמש גם כשרכיבי UI נכשלים

| רכיב | Fallback | עדיפות |
|-------|----------|--------|
| Modal System | Alert dialogs | High |
| Tables | Simple HTML tables | High |
| Charts | Text summaries | Medium |
| Navigation | Breadcrumb trail | High |

### 2. Data Fallbacks

**מטרה:** הבטחת זמינות נתונים גם בכשלי API

| רכיב | Fallback | עדיפות |
|-------|----------|--------|
| API Calls | Cached data | High |
| Real-time Data | Last known values | Medium |
| User Data | Local storage | High |
| Configuration | Default values | High |

### 3. Network Fallbacks

**מטרה:** טיפול בכשלי רשת וחיבוריות

| תרחיש | Fallback | Timeout |
|--------|----------|---------|
| API Timeout | Retry with backoff | 30s |
| Connection Lost | Offline mode | Immediate |
| CDN Failure | Local assets | 5s |
| WebSocket | Polling fallback | 10s |

### 4. Feature Fallbacks

**מטרה:** graceful degradation של תכונות מתקדמות

| תכונה | Fallback | Impact |
|--------|----------|--------|
| Real-time Updates | Manual refresh | Low |
| Advanced Charts | Simple charts | Medium |
| AI Features | Static analysis | High |
| Export Functions | Basic download | Low |

## ארכיטקטורת Fallback

### Fallback Manager

```javascript
// Global fallback manager
window.FallbackManager = {
  register(category, component, fallbackFn) {
    // Register fallback for component
  },

  activate(category, component, reason) {
    // Activate fallback with logging
  },

  restore(category, component) {
    // Restore original functionality
  }
};
```

### Fallback Detection

```javascript
// Automatic fallback detection
function detectAndActivateFallback(component, error) {
  if (error.name === 'NetworkError') {
    FallbackManager.activate('network', component, error);
  } else if (error.name === 'TimeoutError') {
    FallbackManager.activate('performance', component, error);
  }
  // ... more detection logic
}
```

## מדיניות הפעלה

### Automatic Fallbacks

- **UI Components:** מופעלים אוטומטית עם logging
- **Data Operations:** עם user notification
- **Network Issues:** עם progress indicators

### Manual Fallbacks

- **Advanced Features:** עם user consent
- **Critical Operations:** עם confirmation dialogs
- **Data Loss Scenarios:** עם warning messages

### Recovery Strategy

1. **Detect Failure:** Monitor component health
2. **Activate Fallback:** Switch to alternative implementation
3. **Log Incident:** Record for analysis
4. **Attempt Recovery:** Try to restore original functionality
5. **User Notification:** Inform about status changes

## דוגמאות יישום

### Modal System Fallback

```javascript
// Original implementation
function openModal(content) {
  return ModalManager.open(content);
}

// Fallback implementation
function openModalFallback(content) {
  // Use browser alert as fallback
  alert(content.text || 'Modal content');
  // Log the fallback usage
  Logger.warn('Modal system failed, using alert fallback');
}
```

### API Call Fallback

```javascript
async function fetchData(endpoint) {
  try {
    return await apiCall(endpoint);
  } catch (error) {
    // Check cache first
    const cached = CacheManager.get(endpoint);
    if (cached) {
      Logger.info('Using cached data due to API failure');
      return cached;
    }

    // Use default values
    Logger.warn('Using default values due to API failure');
    return getDefaultValues(endpoint);
  }
}
```

## ניטור ומדידה

### Fallback Metrics

- **Activation Rate:** % of sessions using fallbacks
- **Recovery Rate:** % of successful recoveries
- **User Impact:** Average degradation in functionality
- **Error Correlation:** Which errors trigger which fallbacks

### Logging Structure

```javascript
{
  timestamp: '2026-01-01T12:00:00Z',
  component: 'ModalSystem',
  fallback: 'AlertDialog',
  reason: 'ModalManager not available',
  userImpact: 'medium',
  recoveryPossible: true
}
```

## תחזוקה

### עדכון מדיניות

1. **Monitor Usage:** Track fallback activation rates
2. **User Feedback:** Collect feedback on fallback experience
3. **Performance Impact:** Measure impact on system performance
4. **Update Rules:** Modify rules based on data

### הוספת Fallback חדש

1. **Identify Component:** Determine which component needs fallback
2. **Design Fallback:** Create alternative implementation
3. **Test Integration:** Verify fallback works correctly
4. **Update Documentation:** Add to fallback policy
5. **Monitor Usage:** Track adoption and effectiveness

---

**גרסה:** 1.0.0
**תאריך:** 1 בינואר 2026
**סטטוס:** ✅ פעיל ומתועד
