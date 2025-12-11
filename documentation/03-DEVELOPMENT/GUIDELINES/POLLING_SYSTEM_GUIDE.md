# Polling System Guide - TikTrack

## מדריך מערכת Polling לעדכוני Cache אוטומטיים

**תאריך:** 13 ינואר 2025  
**גרסה:** 1.0  
**סטטוס:** ✅ פעיל במערכת

---

## 📋 תקציר

### מה זה Polling System

מערכת שבודקת כל 10 שניות האם היו שינויים ב-cache במערכת.  
**פתרון פשוט ויציב** למקרים של:

- 2 tabs פתוחים
- Background tasks שמעדכנים נתונים
- 2 users במערכת

**חלופה ל-WebSocket** - ללא Socket.IO, פשוט ויציב!

---

## 🏗️ ארכיטקטורה

### רכיבים

```
Frontend (polling-manager.js)
    ↓ כל 10 שניות
    GET /api/cache/changes?since=timestamp
    ↓
Backend (cache_changes.py)
    ↓
cache_change_log table (SQLite)
    ↓
    Returns: {changes: [...], count: 5}
    ↓
Frontend: invalidate cache + refresh data
```

---

## 🔧 Backend Components

### 1. Model: `cache_change_log`

**טבלה:** `Backend/models/cache_change_log.py`

```python
class CacheChangeLog:
    id: int
    keys_json: str  # JSON של keys: '["trades", "tickers"]'
    reason: str     # "API call: create_trade"
    timestamp: datetime
    created_by: str # "backend_api"
```

**שימוש:**

```python
log = CacheChangeLog(
    keys=['trades', 'dashboard'],
    reason='Trade created',
    created_by='backend_api'
)
db.add(log)
db.commit()
```

---

### 2. Service: `CacheChangesTracker`

**קובץ:** `Backend/services/cache_changes_tracker.py`

**מתודות:**

```python
# Log change
cache_changes_tracker.log_change(
    keys=['trades'],
    reason='API call',
    created_by='backend'
)

# Get changes since timestamp
changes = cache_changes_tracker.get_changes_since(
    since_timestamp=datetime.utcnow() - timedelta(seconds=60)
)

# Cleanup old logs (>7 days)
deleted = cache_changes_tracker.cleanup_old_logs(days_to_keep=7)
```

---

### 3. API Endpoint

**Route:** `GET /api/cache/changes`

**Parameters:**

```
?since=2025-01-13T02:30:00.000Z  (optional, default: last 60s)
?limit=100                        (optional, default: 100)
```

**Response:**

```json
{
    "changes": [
        {
            "keys": ["trades", "tickers"],
            "reason": "API call: create_trade",
            "timestamp": "2025-01-13T02:30:15.123456",
            "created_by": "backend_api"
        }
    ],
    "count": 1,
    "server_time": "2025-01-13T02:30:45.000000",
    "since": "2025-01-13T02:30:00.000000"
}
```

---

### 4. Decorator Integration

**אוטומטי!** כל `@invalidate_cache` כותב ל-log:

```python
@invalidate_cache(['trades', 'tickers'])
def create_trade():
    # ... קוד ...
    return trade

# אוטומטית נרשם:
# CacheChangeLog(keys=['trades', 'tickers'], reason='API call: create_trade')
```

---

## 🔄 Frontend Components

### 1. PollingManager

**קובץ:** `trading-ui/scripts/modules/polling-manager.js`

**מתודות:**

```javascript
// Start polling (every 10 seconds)
window.PollingManager.start();

// Stop polling
window.PollingManager.stop();

// Force check now
await window.PollingManager.checkNow();

// Get stats
const stats = window.PollingManager.getStats();
// {isPolling: true, frequency: 10000, changeCount: 5}
```

**Flow:**

```javascript
1. Polling starts (every 10s)
2. Fetch /api/cache/changes?since=lastCheck
3. If changes:
   - Remove keys from cache
   - Refresh page data
   - Show notification
4. Update lastCheck = server_time
5. Wait 10s → repeat
```

---

### 2. LocalStorageSync

**קובץ:** `trading-ui/scripts/modules/localstorage-sync.js`

**למה זה נחוץ:**  
Polling עובד רק כל 10 שניות.  
LocalStorage Events עובדים **מיידית** בין tabs!

**איך זה עובד:**

```javascript
// Tab 1: משתמש מנקה cache
window.LocalStorageSync.broadcast(['trades', 'tickers']);

// Tab 2: מקבל event מיידית!
// storage event → invalidate cache → refresh data

// תוצאה: Tab 2 מתעדכן תוך <100ms במקום 10 שניות!
```

---

## 🎯 תרחישי שימוש

### תרחיש 1: Single User, Single Tab

**מה קורה:**

```
1. User creates trade
2. CRUD invalidation: cache cleared immediately ✅
3. Table refreshed immediately ✅
4. Polling: no effect (already updated)
```

**Delay:** 0 שניות (מיידי)

---

### תרחיש 2: Single User, 2 Tabs

**מה קורה:**

```
Tab 1: User creates trade
    ↓
Tab 1: Refreshed immediately (CRUD invalidation)
    ↓
Tab 1: clearAllCache() → LocalStorage.broadcast()
    ↓
Tab 2: Storage event → cache cleared → refresh
```

**Delay:** <100ms (כמעט מיידי!)

**Alternative flow (without manual clear):**

```
Tab 1: User creates trade
    ↓
Backend: Logs to cache_change_log
    ↓
Tab 2: Polling (every 10s) → detects change → refresh
```

**Delay:** עד 10 שניות

---

### תרחיש 3: Background Task

**מה קורה:**

```
Backend Task: Updates prices automatically
    ↓
@invalidate_cache(['tickers']) → logs to cache_change_log
    ↓
All Frontend tabs: Polling detects change → refresh
```

**Delay:** עד 10 שניות

---

### תרחיש 4: 2 Users

**מה קורה:**

```
User A: Creates trade
    ↓
Backend: Logs to cache_change_log
    ↓
User B: Polling detects change → refresh
```

**Delay:** עד 10 שניות

---

## ⚙️ Configuration

### Polling Frequency

**Default:** 10 seconds (10000ms)

**לשנות:**

```javascript
// התחל עם תדירות אחרת (5 seconds):
window.PollingManager.start(5000);
```

**המלצות:**

- **5s** - אם צריך real-time יותר (יותר עומס על שרת)
- **10s** - ברירת מחדל (מאוזן)
- **30s** - אם עומס על שרת (עדיין OK)

---

### Cleanup Schedule

**Default:** שמירה של 7 ימים

**לשנות ב-Backend:**

```python
# Cleanup old logs (keep only 3 days)
cache_changes_tracker.cleanup_old_logs(days_to_keep=3)
```

**אוטומטי:**  
הוסף background task שרץ פעם ביום:

```python
@background_task(schedule='daily')
def cleanup_cache_logs():
    cache_changes_tracker.cleanup_old_logs(days_to_keep=7)
```

---

## 🧪 Testing

### Test 1: Polling Works

```javascript
// Console:
window.PollingManager.getStats()
// {isPolling: true, changeCount: 0, lastCheck: "2025-01-13T..."}

// Wait 10 seconds...
// Should see in console:
// "🔄 Polling: checking for changes..."

// Create a trade → wait 10s → should see:
// "📡 Polling: Received 1 cache changes"
```

---

### Test 2: Multi-Tab Works

```javascript
// Tab 1: Open trades page
// Tab 2: Open trades page

// Tab 1: Create trade
// Tab 1: Console → "✅ Trade created"

// Tab 2: Should see within <1 second:
// "📡 LocalStorage: Received cache invalidation from another tab"
// "✅ Page data refreshed"
```

---

### Test 3: Backend Logging

```bash
# Create a trade via API
curl -X POST http://localhost:8080/api/trades ...

# Check logs:
curl http://localhost:8080/api/cache/changes?since=...

# Should see:
# {
#   "changes": [{
#     "keys": ["trades", "tickers", "dashboard"],
#     "reason": "API call: create_trade"
#   }]
# }
```

---

## 🐛 Troubleshooting

### בעיה: "Polling not starting"

```javascript
// Check if PollingManager loaded:
console.log(window.PollingManager);  // should be defined

// Check if started:
window.PollingManager.getStats();
// {isPolling: false} → not started!

// Manual start:
window.PollingManager.start();
```

---

### בעיה: "Getting 404 on /api/cache/changes"

```bash
# Check if blueprint registered:
curl http://localhost:8080/api/cache/changes

# If 404 → check Backend/app.py:
# Should have: app.register_blueprint(cache_changes_bp, url_prefix='/api/cache')
```

---

### בעיה: "Table doesn't exist"

```bash
# Check if migration ran:
sqlite3 Backend/db/simpleTrade_new.db "SELECT * FROM cache_change_log LIMIT 1;"

# If error → run migration:
sqlite3 Backend/db/simpleTrade_new.db < Backend/migrations/add_cache_change_log_table.sql
```

---

## 📊 Monitoring

### Check Polling Status

```javascript
// In browser console:
const stats = window.PollingManager.getStats();
console.table(stats);

// {
//   isPolling: true,
//   frequency: 10000,
//   lastCheck: "2025-01-13T02:45:30.000Z",
//   changeCount: 12,
//   errorCount: 0
// }
```

### Check Change Logs

```bash
# Via API:
curl "http://localhost:8080/api/cache/changes/stats" | python3 -m json.tool

# {
#   "total_logs": 150,
#   "logs_last_hour": 25,
#   "logs_today": 78,
#   "oldest_log": "2025-01-06T10:00:00"
# }
```

---

## 💡 Best Practices

### 1. בדוק שהPolling רץ

```javascript
// בDOMContentLoaded או init:
if (window.PollingManager) {
    window.PollingManager.start();
}
```

### 2. Cleanup logs באופן קבוע

```python
# Background task - daily:
cache_changes_tracker.cleanup_old_logs(days_to_keep=7)
```

### 3. LocalStorage לMulti-Tab

```javascript
// ב-clearAllCache() או CRUD operations:
window.LocalStorageSync.broadcast(['trades', 'dashboard']);
```

### 4. תדירות מותאמת

```javascript
// לשרת עמוס → הפחת תדירות:
window.PollingManager.start(30000);  // 30 seconds
```

---

## 🔚 סיכום

**Polling System:**

- ✅ פשוט - אין WebSocket/Socket.IO
- ✅ יציב - לא תלוי בconnection
- ✅ Multi-tab - עם LocalStorage sync
- ⚠️ Delay - עד 10s (נדיר)

**מתאים עבור:**

- ✅ מערכות single/few users
- ✅ שינויים לא תכופים
- ✅ כשיציבות חשובה יותר מreal-time

**לא מתאים עבור:**

- ❌ מערכות real-time קריטיות
- ❌ הרבה users (עומס על שרת)
- ❌ שינויים כל שנייה

**במקרה של TikTrack: מושלם!** ✅

---

**מחבר:** TikTrack Development Team  
**תאריך:** 13 ינואר 2025  
**גרסה:** 1.0  
**סטטוס:** ✅ פעיל ומתועד

