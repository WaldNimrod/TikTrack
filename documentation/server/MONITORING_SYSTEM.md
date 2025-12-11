# מערכת ניטור מתקדמת - TikTrack

## סקירה כללית

מערכת הניטור המתקדמת של TikTrack מספקת ניטור מקיף של כל רכיבי המערכת עם דוחות אוטומטיים וניתוח מגמות.

## רכיבי המערכת

### 1. Metrics Collection

#### סוגי מדדי ביצועים

- **Performance Metrics**: CPU, זיכרון, דיסק, רשת
- **Database Metrics**: גודל, מספר רשומות, אינדקסים
- **Business Metrics**: סטטיסטיקות עסקיות
- **Cache Metrics**: hit rate, memory usage

#### קובץ: `Backend/services/metrics_collector.py`

```python
class MetricsCollector:
    def collect_performance_metrics(self) -> Dict[str, Any]:
        # איסוף מדדי ביצועי מערכת
        pass
    
    def collect_business_metrics(self) -> Dict[str, Any]:
        # איסוף מדדי עסקיים
        pass
    
    def collect_all_metrics(self) -> Dict[str, Any]:
        # איסוף כל המדדי ביצועים
        pass
```

### 2. Health Checks

#### בדיקות בריאות

- **Database Health**: חיבור, ביצועים, גודל
- **Cache Health**: זמינות, ביצועים, memory usage
- **System Health**: CPU, זיכרון, דיסק
- **API Health**: זמינות endpoints, זמני תגובה

#### קובץ: `Backend/services/health_service.py`

```python
class HealthService:
    def comprehensive_health_check(self) -> Dict[str, Any]:
        # בדיקה מקיפה של כל הרכיבים
        pass
    
    def check_database_health(self) -> Dict[str, Any]:
        # בדיקת בריאות בסיס נתונים
        pass
```

### 3. Advanced Logging

#### תכונות

- **Correlation ID**: מעקב אחר בקשות
- **Rotating Logs**: סיבוב אוטומטי של קבצי לוג
- **Performance Logs**: לוגי ביצועים נפרדים
- **Error Logs**: לוגי שגיאות מפורטים

#### קובץ: `Backend/config/logging.py`

```python
# הגדרת לוגים עם Correlation ID
formatter = logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(correlation_id)s - %(message)s'
)

# Rotating File Handler
handler = RotatingFileHandler(
    'logs/performance.log',
    maxBytes=10*1024*1024,  # 10MB
    backupCount=5
)
```

## API Endpoints

### Health Checks

- `GET /api/health` - בדיקת בריאות בסיסית
- `GET /api/health/detailed` - בדיקה מפורטת עם מגמות

### Metrics Collection

- `POST /api/metrics/collect` - איסוף כל המדדי ביצועים
- `GET /api/metrics/report` - דוח מדדי ביצועים

### Cache Monitoring

- `GET /api/cache/stats` - סטטיסטיקות cache
- `POST /api/cache/clear` - ניקוי cache

## דוגמאות שימוש

### בדיקת בריאות מערכת

```bash
# בדיקה בסיסית
curl http://localhost:8080/api/health

# בדיקה מפורטת
curl http://localhost:8080/api/health/detailed
```

### איסוף מדדי ביצועים

```bash
# איסוף כל המדדי ביצועים
curl -X POST http://localhost:8080/api/metrics/collect

# דוח עם פרמטרים
curl "http://localhost:8080/api/metrics/report?hours=24"
```

### ניטור cache

```bash
# סטטיסטיקות cache
curl http://localhost:8080/api/cache/stats

# ניקוי cache
curl -X POST http://localhost:8080/api/cache/clear
```

## דוחות אוטומטיים

### דוח בריאות מערכת

```json
{
  "status": "healthy",
  "components": {
    "database": {"status": "healthy", "performance": "excellent"},
    "cache": {"status": "healthy", "performance": "excellent"},
    "system": {"status": "healthy", "performance": "excellent"},
    "api": {"status": "healthy", "performance": "good"}
  },
  "summary": {
    "overall_score": 3.8,
    "api_status": "healthy",
    "database_status": "healthy",
    "cache_status": "healthy",
    "system_status": "healthy"
  }
}
```

### דוח מדדי ביצועים

```json
{
  "performance": {
    "system": {
      "cpu_percent": 16.3,
      "memory_percent": 71.1,
      "disk_percent": 14.2
    }
  },
  "business": {
    "accounts": {"total": 13, "active": 12},
    "tickers": {"total": 15, "active": 5},
    "trades": {"total": 7, "open": 3},
    "alerts": {"total": 14, "active": 0}
  }
}
```

## ניטור מתקדם

### Performance Monitoring

```python
from utils.performance_monitor import monitor_performance

@monitor_performance("database_operation")
def database_operation():
    # פעולת בסיס נתונים
    pass
```

### System Metrics

```python
from services.metrics_collector import metrics_collector

# איסוף מדדי מערכת
metrics = metrics_collector.collect_performance_metrics()
print(f"CPU: {metrics['system']['cpu_percent']}%")
print(f"Memory: {metrics['system']['memory_percent']}%")
```

## קבצי לוג

### סוגי לוגים

- `logs/app.log` - לוגי אפליקציה כללים
- `logs/performance.log` - לוגי ביצועים
- `logs/database.log` - לוגי בסיס נתונים
- `logs/errors.log` - לוגי שגיאות

### ניהול לוגים

```python
# הגדרת correlation ID
import logging
logger = logging.getLogger(__name__)
logger.info("Operation completed", extra={"correlation_id": "req-123"})
```

## התראות וניטור

### סטטוסי בריאות

- **Healthy**: הכל תקין
- **Warning**: בעיה קלה שדורשת תשומת לב
- **Critical**: בעיה חמורה שדורשת פעולה מיידית

### מדדי ביצועים

- **Excellent**: ביצועים מעולים
- **Good**: ביצועים טובים
- **Fair**: ביצועים סבירים
- **Poor**: ביצועים גרועים

## פתרון בעיות

### בעיות נפוצות

1. **זיכרון גבוה**: בדוק memory_percent ב-metrics
2. **CPU גבוה**: בדוק cpu_percent ו-processes
3. **דיסק מלא**: בדוק disk_percent
4. **בסיס נתונים איטי**: בדוק database metrics

### לוגים לבדיקה

```bash
# בדיקת לוגי ביצועים
tail -f logs/performance.log

# בדיקת לוגי שגיאות
tail -f logs/errors.log

# בדיקת לוגי בסיס נתונים
tail -f logs/database.log
```

---

**גרסה**: 2.0.2  
**תאריך**: ספטמבר 2025  
**סטטוס**: פעיל ויציב
