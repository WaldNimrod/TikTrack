# מערכת Caching מתקדמת - TikTrack

## סקירה כללית

מערכת ה-Caching המתקדמת של TikTrack מספקת פתרון caching חכם עם ניהול dependencies, invalidation אוטומטי, ואופטימיזציה של זיכרון. המערכת מיועדת לשפר דרמטית את הביצועים ולהפחית עומס על בסיס הנתונים.

## תכונות עיקריות

### 🚀 **Caching עם TTL**

- **Time To Live**: כל רשומת cache כוללת זמן תפוגה
- **Expiration אוטומטי**: רשומות פגי תוקף נמחקות אוטומטית
- **Cleanup thread**: תהליך רקע לניקוי רשומות פגי תוקף

### 🔗 **ניהול Dependencies**

- **Dependency mapping**: מעקב אחר תלויות בין רשומות cache
- **Invalidation חכם**: ביטול cache לפי dependencies
- **Pattern invalidation**: ביטול cache לפי תבניות (wildcards)

### 💾 **אופטימיזציה של זיכרון**

- **Memory limits**: הגבלת שימוש זיכרון (ברירת מחדל: 100MB)
- **LRU optimization**: הסרת רשומות פחות נגישות
- **Memory monitoring**: מעקב אחר שימוש זיכרון בזמן אמת

### 📊 **ניטור ביצועים**

- **Hit rate tracking**: מעקב אחר אחוז פגיעות
- **Statistics**: סטטיסטיקות מפורטות על פעילות ה-cache
- **Health checks**: בדיקות בריאות אוטומטיות

### 🔒 **Thread Safety**

- **RLock**: שימוש ב-Reentrant Lock לפעולות בטוחות
- **Concurrent access**: תמיכה בגישה מקבילה
- **Atomic operations**: פעולות אטומיות על ה-cache

## שימוש בסיסי

### Decorator פשוט

```python
from services.advanced_cache_service import cache_for

@cache_for(ttl=300)  # Cache ל-5 דקות
def get_all_tickers(db):
    return db.query(Ticker).all()
```

### Decorator עם Dependencies

```python
from services.advanced_cache_service import cache_with_deps

@cache_with_deps(ttl=600, dependencies=['tickers', 'trades'])
def get_ticker_with_trades(ticker_id, db):
    return db.query(Ticker).filter(Ticker.id == ticker_id).first()
```

### Invalidation ידני

```python
from services.advanced_cache_service import invalidate_cache

# ביטול כל ה-cache שתלוי בטבלת tickers
invalidate_cache('tickers')

# ביטול כל ה-cache שתלוי בטבלת trades
invalidate_cache('trades')
```

## API Endpoints

### סטטיסטיקות Cache

```
GET /api/cache/stats
```

### בדיקת בריאות

```
GET /api/cache/health
```

### ניקוי Cache

```
POST /api/cache/clear
```

### Invalidation לפי Dependency

```
POST /api/cache/invalidate
{
    "dependency": "tickers"
}
```

### מידע על המערכת

```
GET /api/cache/info
```

## דף בדיקה

דף בדיקה מלא זמין בכתובת:

```
/cache-test
```

הדף כולל:

- הצגת סטטיסטיקות בזמן אמת
- בדיקות בריאות
- פעולות ניהול cache
- בדיקות ביצועים
- יומן פעילות מפורט

## ארכיטקטורה

### CacheEntry

```python
class CacheEntry:
    data: Any           # הנתונים המאוחסנים
    ttl: int           # זמן תפוגה בשניות
    dependencies: set  # רשימת dependencies
    created_at: float  # זמן יצירה
    access_count: int  # מספר גישות
    last_accessed: float  # זמן גישה אחרון
```

### AdvancedCacheService

```python
class AdvancedCacheService:
    cache: Dict[str, CacheEntry]      # ה-cache הראשי
    dependencies: Dict[str, set]      # מיפוי dependencies
    stats: Dict[str, int]            # סטטיסטיקות
    lock: threading.RLock            # Lock לפעולות בטוחות
```

## שיקולי ביצועים

### Memory Management

- **Default limit**: 100MB
- **Cleanup interval**: 5 דקות
- **Optimization threshold**: 80% של המקסימום

### TTL Recommendations

- **High frequency data**: 60-300 שניות
- **Medium frequency data**: 300-1800 שניות
- **Low frequency data**: 1800+ שניות

### Dependency Strategy

- **Entity-based**: `tickers`, `trades`, `accounts`
- **Table-based**: `quotes`, `alerts`, `notes`
- **Pattern-based**: `ticker_*`, `trade_*`

## דוגמאות שימוש מתקדמות

### Cache עם Multiple Dependencies

```python
@cache_with_deps(
    ttl=1200, 
    dependencies=['tickers', 'trades', 'accounts']
)
def get_portfolio_summary(user_id, db):
    # פונקציה שמחזירה סיכום תיק השקעות
    pass
```

### Invalidation לפי Pattern

```python
# ביטול כל ה-cache שמתחיל ב-ticker
advanced_cache_service.invalidate_pattern('ticker_*')

# ביטול כל ה-cache שמתחיל ב-trade
advanced_cache_service.invalidate_pattern('trade_*')
```

### Health Monitoring

```python
# בדיקת בריאות ה-cache
health = cache_health_check()

if health['status'] == 'warning':
    logger.warning("Cache memory usage high: {}%".format(
        health['stats']['memory_usage_percent']
    ))
```

## Troubleshooting

### בעיות נפוצות

#### Memory Usage גבוה

```python
# בדיקת שימוש זיכרון
stats = get_cache_stats()
print(f"Memory usage: {stats['memory_usage_percent']}%")

# ניקוי cache
clear_cache()
```

#### Hit Rate נמוך

```python
# בדיקת סטטיסטיקות
stats = get_cache_stats()
print(f"Hit rate: {stats['hit_rate_percent']}%")

# בדיקת dependencies
if stats['stats']['invalidations'] > stats['stats']['hits']:
    print("Too many invalidations - check dependency strategy")
```

#### Performance Issues

```python
# בדיקת בריאות
health = cache_health_check()
print(f"Cache status: {health['status']}")

# בדיקת רשומות פגי תוקף
stats = get_cache_stats()
print(f"Expired entries: {stats['expired_entries']}")
```

## עתיד

### תכונות מתוכננות

- **Redis integration**: תמיכה ב-Redis כחלק מה-cache
- **Distributed caching**: תמיכה ב-cache מבוזר
- **Advanced patterns**: תבניות invalidation מתקדמות
- **Metrics export**: ייצוא מדדים למערכות ניטור חיצוניות

### אופטימיזציות

- **Compression**: דחיסת נתונים ב-cache
- **Serialization**: שיפור יעילות שמירה
- **Background warming**: חימום cache מראש

## תמיכה

לשאלות ובעיות:

1. בדוק את הלוגים של השרת
2. השתמש בדף הבדיקה `/cache-test`
3. בדוק את ה-API endpoints
4. פנה לצוות הפיתוח

---

**גרסה**: 1.0  
**תאריך**: ספטמבר 2025  
**סטטוס**: פעיל ויציב
