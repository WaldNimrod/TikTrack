# מערכת תחזוקה אוטומטית - TikTrack

## סקירה כללית

מערכת התחזוקה האוטומטית של TikTrack מספקת תחזוקה שוטפת של המערכת עם Background Tasks, Cache Management ו-Database Optimization.

## רכיבי המערכת

### 1. Background Tasks

#### תכונות:
- **Task Scheduling**: תזמון משימות אוטומטי
- **Task Monitoring**: ניטור ביצועי משימות
- **Error Handling**: טיפול בשגיאות משימות
- **History Tracking**: מעקב אחר היסטוריית משימות

#### משימות מוגדרות:
- **cleanup_expired_data** (יומי) - ניקוי נתונים ישנים
- **cleanup_cache** (שעתי) - ניקוי cache
- **rotate_logs** (שבועי) - סיבוב קבצי לוג
- **collect_metrics** (כל 30 דקות) - איסוף מדדי ביצועים
- **database_maintenance** (שבועי) - תחזוקת בסיס נתונים
- **indexeddb_cleanup** (כל 6 שעות) - ניקוי IndexedDB
- **system_health_check** (שעתי) - בדיקת בריאות מערכת

#### קובץ: `Backend/services/background_tasks.py`
```python
class BackgroundTaskManager:
    def __init__(self):
        self.tasks = {}
        self.task_history = []
        self.running = False
    
    def register_task(self, name: str, func: Callable, schedule_interval: str):
        # רישום משימה חדשה
        pass
    
    def start_scheduler(self):
        # הפעלת מנהל המשימות
        pass
    
    def run_task(self, task_name: str) -> Dict[str, Any]:
        # הפעלת משימה ספציפית
        pass
```

### 2. Cache Management

#### תכונות:
- **TTL (Time To Live)**: פקיעת תוקף אוטומטית
- **Memory Management**: ניהול זיכרון יעיל
- **Statistics**: סטטיסטיקות מפורטות
- **Cleanup**: ניקוי אוטומטי

#### קובץ: `Backend/services/cache_service.py`
```python
class CacheService:
    def __init__(self):
        self._cache = {}
        self._ttl = {}
    
    def get(self, key: str, default=None):
        # קבלת ערך מ-cache
        pass
    
    def set(self, key: str, value: Any, ttl: int = 3600):
        # הגדרת ערך ב-cache
        pass
    
    def cleanup_expired(self) -> int:
        # ניקוי ערכים פגי תוקף
        pass
    
    def get_stats(self) -> Dict[str, Any]:
        # קבלת סטטיסטיקות
        pass
```

### 3. Database Optimization

#### תכונות:
- **Schema Analysis**: ניתוח מבנה בסיס נתונים
- **Index Optimization**: אופטימיזציה של אינדקסים
- **Constraint Validation**: בדיקת תקינות constraints
- **Performance Recommendations**: המלצות לשיפור ביצועים

#### קובץ: `Backend/services/database_optimizer.py`
```python
class DatabaseOptimizer:
    def analyze_schema(self) -> Dict[str, Any]:
        # ניתוח מבנה בסיס נתונים
        pass
    
    def optimize_indexes(self) -> Dict[str, Any]:
        # אופטימיזציה של אינדקסים
        pass
    
    def validate_constraints(self) -> Dict[str, Any]:
        # בדיקת תקינות constraints
        pass
    
    def generate_optimization_report(self) -> Dict[str, Any]:
        # יצירת דוח אופטימיזציה
        pass
```

## API Endpoints

### Background Tasks Management:
- `GET /api/tasks/status` - סטטוס משימות רקע
- `POST /api/tasks/run/<task_name>` - הפעלת משימה ספציפית
- `POST /api/tasks/start` - הפעלת מנהל משימות
- `POST /api/tasks/stop` - עצירת מנהל משימות

### Cache Management:
- `GET /api/cache/stats` - סטטיסטיקות cache
- `POST /api/cache/clear` - ניקוי cache

### Database Optimization:
- `GET /api/database/analyze` - ניתוח מבנה בסיס נתונים
- `POST /api/database/optimize` - דוח אופטימיזציה

### IndexedDB Management:
- `GET /api/indexeddb/stats` - סטטיסטיקות IndexedDB
- `POST /api/indexeddb/cleanup` - ניקוי אוטומטי של IndexedDB
- `POST /api/indexeddb/cleanup/<max_size>` - ניקוי עם גודל מקסימאלי מותאם
- `GET /api/indexeddb/backup` - יצירת גיבוי של IndexedDB
- `POST /api/indexeddb/restore` - שחזור מ-gיבוי

## דוגמאות שימוש

### ניהול Background Tasks:
```bash
# בדיקת סטטוס משימות
curl http://localhost:8080/api/tasks/status

# הפעלת משימה ספציפית
curl -X POST http://localhost:8080/api/tasks/run/cleanup_cache

# הפעלת מנהל משימות
curl -X POST http://localhost:8080/api/tasks/start

# עצירת מנהל משימות
curl -X POST http://localhost:8080/api/tasks/stop
```

### ניהול Cache:
```bash
# בדיקת סטטיסטיקות
curl http://localhost:8080/api/cache/stats

# ניקוי cache
curl -X POST http://localhost:8080/api/cache/clear
```

### Database Optimization:
```bash
# ניתוח מבנה בסיס נתונים
curl http://localhost:8080/api/database/analyze

# דוח אופטימיזציה
curl -X POST http://localhost:8080/api/database/optimize
```

### ניהול IndexedDB:
```bash
# בדיקת סטטיסטיקות IndexedDB
curl http://localhost:8080/api/indexeddb/stats

# ניקוי אוטומטי עם גודל ברירת מחדל (100MB)
curl -X POST http://localhost:8080/api/indexeddb/cleanup

# ניקוי עם גודל מקסימאלי מותאם (50MB)
curl -X POST http://localhost:8080/api/indexeddb/cleanup/50

# יצירת גיבוי לפני ניקוי
curl http://localhost:8080/api/indexeddb/backup

# שחזור מגיבוי
curl -X POST http://localhost:8080/api/indexeddb/restore \
  -H "Content-Type: application/json" \
  -d '{"backup_file": "indexeddb_backup_20250118.json"}'
```

## משימות רקע מפורטות

### 1. Data Cleanup
```python
def cleanup_expired_data() -> Dict[str, Any]:
    # ניקוי alerts ישנים (30+ ימים)
    # ניקוי notes ישנים (90+ ימים)
    # ניקוי executions ישנים (1+ שנה)
    pass
```

### 2. Cache Cleanup
```python
def cleanup_cache() -> Dict[str, Any]:
    # ניקוי ערכים פגי תוקף
    # עדכון סטטיסטיקות
    # ניהול זיכרון
    pass
```

### 3. Log Rotation
```python
def rotate_logs() -> Dict[str, Any]:
    # סיבוב קבצי לוג גדולים מ-10MB
    # יצירת גיבויים
    # ניקוי קבצים ישנים
    pass
```

### 4. Database Maintenance
```python
def database_maintenance() -> Dict[str, Any]:
    # VACUUM database
    # ANALYZE tables
    # OPTIMIZE statistics
    pass
```

### 5. IndexedDB Cleanup
```python
def indexeddb_cleanup() -> Dict[str, Any]:
    # ניקוי אוטומטי של IndexedDB
    # שמירת נתונים רק בגודל מוגדר (ברירת מחדל: 100MB)
    # מחיקת רשומות ישנות מעבר לגודל המקסימאלי
    # שמירת גיבוי לפני ניקוי
    # ניתוח ודוח על הנתונים שנמחקו
    pass
```

### 6. System Health Check
```python
def system_health_check() -> Dict[str, Any]:
    # בדיקת CPU, זיכרון, דיסק
    # בדיקת בריאות מערכת
    # התראות על בעיות
    pass
```

## ניטור תחזוקה

### Task Status:
```json
{
  "scheduler_running": true,
  "tasks": {
    "cleanup_expired_data": {
      "enabled": true,
      "schedule_interval": "1d",
      "last_run": "2025-09-01T02:00:00",
      "run_count": 5,
      "success_count": 5,
      "error_count": 0,
      "success_rate": 100.0
    }
  }
}
```

### Cache Statistics:
```json
{
  "active_entries": 15,
  "expired_entries": 3,
  "memory_usage": 2048,
  "total_entries": 18,
  "hit_rate_percent": 85.2
}
```

### Database Optimization:
```json
{
  "overall_health": "healthy",
  "total_tables": 24,
  "total_indexes": 24,
  "total_recommendations": 2,
  "total_violations": 0
}
```

### IndexedDB Statistics:
```json
{
  "total_size_mb": 85.6,
  "max_size_mb": 100,
  "usage_percentage": 85.6,
  "total_entries": 1250,
  "oldest_entry_days": 7,
  "newest_entry_hours": 2,
  "databases": {
    "chart_history": {
      "size_mb": 45.2,
      "entries": 680,
      "last_cleanup": "2025-01-18T10:30:00Z"
    },
    "user_preferences": {
      "size_mb": 32.1,
      "entries": 420,
      "last_cleanup": "2025-01-18T08:15:00Z"
    },
    "system_cache": {
      "size_mb": 8.3,
      "entries": 150,
      "last_cleanup": "2025-01-18T12:45:00Z"
    }
  },
  "cleanup_recommendations": [
    "chart_history: 12 entries older than 30 days",
    "user_preferences: 5 entries older than 90 days"
  ],
  "last_backup": "2025-01-18T06:00:00Z"
}
```

## הגדרת משימות חדשות

### רישום משימה חדשה:
```python
from services.background_tasks import background_task_manager

def my_custom_task() -> Dict[str, Any]:
    # קוד המשימה
    return {"status": "success", "processed": 100}

# רישום המשימה
background_task_manager.register_task(
    name="my_custom_task",
    func=my_custom_task,
    schedule_interval="1h",
    description="My custom maintenance task"
)

### הגדרת משימת IndexedDB Cleanup:
```python
from services.indexeddb_service import IndexedDBService

def indexeddb_cleanup_task(max_size_mb: int = 100) -> Dict[str, Any]:
    """
    משימת ניקוי אוטומטי של IndexedDB

    Args:
        max_size_mb: גודל מקסימאלי ב-MB (ברירת מחדל: 100)

    Returns:
        Dict עם תוצאות הניקוי
    """
    indexeddb = IndexedDBService()

    # יצירת גיבוי לפני ניקוי
    backup_result = indexeddb.create_backup()
    if not backup_result['success']:
        return {
            'success': False,
            'error': f'Backup failed: {backup_result["error"]}'
        }

    # ביצוע ניקוי
    cleanup_result = indexeddb.cleanup_old_entries(max_size_mb)

    return {
        'success': True,
        'backup_created': backup_result['filename'],
        'entries_removed': cleanup_result['removed_count'],
        'space_freed_mb': cleanup_result['space_freed_mb'],
        'current_size_mb': cleanup_result['current_size_mb'],
        'max_size_mb': max_size_mb
    }

# רישום המשימה עם פרמטרים
background_task_manager.register_task(
    name="indexeddb_cleanup",
    func=lambda: indexeddb_cleanup_task(100),  # 100MB גודל מקסימאלי
    schedule_interval="6h",  # כל 6 שעות
    description="ניקוי אוטומטי של IndexedDB כדי למנוע הצטברות מידע רב"
)
```

### הגדרת תזמון:
```python
# תזמון כל 30 דקות
schedule_interval="30m"

# תזמון יומי בשעה 02:00
schedule_interval="1d"

# תזמון שבועי ביום ראשון בשעה 03:00
schedule_interval="1w"
```

## פתרון בעיות

### בעיות נפוצות:
1. **משימות לא רצות**: בדוק scheduler status
2. **Cache מלא**: בדוק memory usage ו-cleanup
3. **בסיס נתונים איטי**: הפעל database maintenance
4. **לוגים גדולים**: הפעל log rotation

### לוגים לבדיקה:
```bash
# בדיקת לוגי משימות
grep "background_task" logs/app.log

# בדיקת לוגי cache
grep "cache" logs/app.log

# בדיקת לוגי database
tail -f logs/database.log
```

## תחזוקה ידנית

### הפעלת ניקוי ידני:
```bash
# ניקוי נתונים ישנים
curl -X POST http://localhost:8080/api/tasks/run/cleanup_expired_data

# ניקוי cache
curl -X POST http://localhost:8080/api/tasks/run/cleanup_cache

# תחזוקת בסיס נתונים
curl -X POST http://localhost:8080/api/tasks/run/database_maintenance
```

### בדיקת בריאות מערכת:
```bash
# בדיקה ידנית
curl -X POST http://localhost:8080/api/tasks/run/system_health_check
```

## התראות תחזוקה

### סטטוסי תחזוקה:
- **Optimal**: כל המשימות רצות בהצלחה
- **Warning**: חלק מהמשימות נכשלו
- **Critical**: רוב המשימות נכשלו

### מדדי תחזוקה:
- **Task Success Rate**: אחוז הצלחת משימות
- **Cache Efficiency**: יעילות cache
- **Database Health**: בריאות בסיס נתונים

---

**גרסה**: 2.0.3
**תאריך**: ינואר 2025
**סטטוס**: פעיל ויציב
**עדכון אחרון**: נוסף ניהול IndexedDB אוטומטי
