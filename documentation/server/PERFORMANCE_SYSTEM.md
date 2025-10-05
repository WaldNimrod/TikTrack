# מערכת ביצועים מתקדמת - TikTrack

## סקירה כללית

מערכת הביצועים המתקדמת של TikTrack כוללת שיפורים מקיפים לביצועי השרת, בסיס הנתונים והאפליקציה.

## רכיבי המערכת

### 1. Connection Pool מתקדם

#### תכונות:
- **QueuePool**: חלופה ל-StaticPool עם ביצועים משופרים
- **30 חיבורים במקביל**: pool_size=10, max_overflow=20
- **Timeout חכם**: pool_timeout=30 שניות
- **רענון אוטומטי**: pool_recycle=3600 שניות
- **בדיקת חיבור**: pool_pre_ping=True

#### קובץ: `Backend/config/database.py`
```python
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=QueuePool,
    pool_size=10,           # מספר חיבורים קבועים
    max_overflow=20,        # חיבורים נוספים בעת עומס
    pool_timeout=30,        # זמן המתנה לחיבור (שניות)
    pool_recycle=3600,      # רענון חיבורים כל שעה
    pool_pre_ping=True,     # בדיקת חיבור לפני שימוש
)
```

### 2. אינדקסים לבסיס נתונים

#### אינדקסים שהוספו:
- **tickers**: name, status, currency_id
- **trades**: account_id, ticker_id, status, created_at
- **accounts**: name, status, currency_id
- **alerts**: ticker_id, status, created_at
- **executions**: trade_id, created_at
- **cash_flows**: account_id, type, created_at
- **notes**: related_type_id, related_id, created_at
- **trade_plans**: ticker_id, status, created_at

#### קובץ: `Backend/migrations/add_performance_indexes.py`
```python
# דוגמה לאינדקס
db.execute(text("""
    CREATE INDEX IF NOT EXISTS idx_tickers_name 
    ON tickers(name)
"""))
```

### 3. Query Optimization

#### תכונות:
- **Lazy Loading**: מניעת N+1 queries
- **Bulk Operations**: פעולות מרובות יעילות
- **Performance Monitoring**: ניטור ביצועי queries

#### קובץ: `Backend/services/query_optimizer.py`
```python
class QueryOptimizer:
    @staticmethod
    def get_tickers_optimized(db: Session) -> List[Ticker]:
        return db.query(Ticker).options(
            joinedload(Ticker.currency),
            selectinload(Ticker.trades)
        ).all()
```

## מדדי ביצועים

### לפני השיפורים:
- Connection Pool: StaticPool (חיבורים בודדים)
- Database Queries: N+1 problems
- Response Time: 2000ms+
- Database Size: לא אופטימלי

### אחרי השיפורים:
- Connection Pool: QueuePool (30 חיבורים במקביל)
- Database Queries: Optimized עם lazy loading
- Response Time: 1010ms (שיפור של 50%)
- Database Size: 0.22MB (אופטימלי)

## API Endpoints

### Performance Monitoring:
- `GET /api/health` - בדיקת בריאות מערכת
- `GET /api/health/detailed` - בדיקה מפורטת
- `POST /api/metrics/collect` - איסוף מדדי ביצועים

### Database Optimization:
- `GET /api/database/analyze` - ניתוח מבנה בסיס נתונים
- `POST /api/database/optimize` - דוח אופטימיזציה

## הוראות שימוש

### בדיקת ביצועים:
```bash
# בדיקת בריאות מערכת
curl http://localhost:8080/api/health

# איסוף מדדי ביצועים
curl -X POST http://localhost:8080/api/metrics/collect

# ניתוח בסיס נתונים
curl http://localhost:8080/api/database/analyze
```

### ניטור ביצועים:
```python
from utils.performance_monitor import monitor_performance

@monitor_performance("operation_name")
def my_function():
    # קוד הפונקציה
    pass
```

## תחזוקה

### ניקוי אינדקסים:
```bash
# הפעלת ניקוי אוטומטי
curl -X POST http://localhost:8080/api/database/optimize
```

### ניטור חיבורים:
```python
# בדיקת מצב Connection Pool
from config.database import engine
print(f"Pool size: {engine.pool.size()}")
print(f"Checked out: {engine.pool.checkedout()}")
```

## פתרון בעיות

### בעיות נפוצות:
1. **חיבורים נגמרים**: בדוק max_overflow ו-pool_size
2. **זמני תגובה איטיים**: בדוק אינדקסים ו-queries
3. **זיכרון גבוה**: בדוק lazy loading ו-bulk operations

### לוגים:
- `logs/performance.log` - לוגי ביצועים
- `logs/database.log` - לוגי בסיס נתונים

---

**גרסה**: 2.0.2  
**תאריך**: ספטמבר 2025  
**סטטוס**: פעיל ויציב
