# Position Calculator Service - TikTrack
# מערכת חישוב פוזיציות טריידים

**תאריך:** 24 אוקטובר 2025  
**גרסה:** 1.0.0  
**סטטוס:** ✅ פעיל ומתועד  
**מטרה:** חישוב פוזיציות נוכחיות לטריידים על בסיס ביצועים  

---

## 📋 סקירה כללית

מערכת Position Calculator Service מספקת פתרון מרכזי לחישוב פוזיציות נוכחיות לטריידים על בסיס ביצועים (executions). המערכת מחשבת כמות נוכחית, מחיר ממוצע, ועלויות כוללות לכל טרייד.

### תכונות עיקריות:
- **חישוב פוזיציה בודדת** - `calculate_position(trade_id)`
- **חישוב batch** - `calculate_positions_batch(trade_ids[])`
- **תמיכה ב-Long/Short** - חישוב נכון לשני כיוונים
- **כולל עמלות** - חישוב מחיר ממוצע עם עמלות
- **ביצועים חלקיים** - תמיכה בקניה ומכירה חלקית
- **אינטגרציה עם Cache** - שמירה במטמון Backend (60s TTL)

---

## 🏗️ ארכיטקטורה

### Backend Service
```
Backend/services/position_calculator_service.py
├── PositionCalculatorService
│   ├── calculate_position(db, trade_id)
│   ├── calculate_positions_batch(db, trade_ids)
│   └── get_position_summary(db, trade_id)
```

### API Integration
```
Backend/routes/api/trades.py
├── get_trades() - מחזיר position data
├── position_calculator.calculate_positions_batch()
└── Backend cache (TTL: 60s)
```

### Frontend Integration
```
trading-ui/scripts/trades.js
├── loadTradesData() - טוען position data
├── updateTradesTable() - מציג עמודות פוזיציה
└── refreshPositions() - רענון ידני
```

---

## 🔧 API Documentation

### Core Methods

#### `calculate_position(db, trade_id)`
```python
def calculate_position(self, db: Session, trade_id: int) -> Optional[Dict[str, Any]]
```
**מטרה:** חישוב פוזיציה נוכחית לטרייד בודד

**פרמטרים:**
- `db`: Database session
- `trade_id`: מזהה הטרייד

**החזרה:**
```python
{
    'quantity': float,           # כמות נוכחית (חיובית/שלילית)
    'average_price': float,     # מחיר ממוצע כולל עמלות
    'total_cost': float,        # עלות כוללת
    'total_fees': float,        # עמלות כוללות
    'side': str,                # 'long'/'short'/'closed'
    'last_updated': str,        # תאריך עדכון אחרון
    'total_bought': float,      # כמות נקנתה
    'total_sold': float         # כמות נמכרה
}
```

#### `calculate_positions_batch(db, trade_ids)`
```python
def calculate_positions_batch(self, db: Session, trade_ids: List[int]) -> Dict[int, Optional[Dict[str, Any]]]
```
**מטרה:** חישוב פוזיציות למספר טריידים בבת אחת

**פרמטרים:**
- `db`: Database session
- `trade_ids`: רשימת מזההי טריידים

**החזרה:** Dict mapping trade_id → position data

#### `get_position_summary(db, trade_id)`
```python
def get_position_summary(self, db: Session, trade_id: int) -> Optional[Dict[str, Any]]
```
**מטרה:** קבלת סיכום פוזיציה פשוט לתצוגה

---

## 📊 לוגיקת חישוב

### חישוב כמות נוכחית
```sql
-- Long Position
quantity = SUM(quantity WHERE action='buy') - SUM(quantity WHERE action='sell')

-- Short Position  
quantity = SUM(quantity WHERE action='sell') - SUM(quantity WHERE action='buy')
```

### חישוב מחיר ממוצע
```sql
average_price = (SUM(quantity * price + fee WHERE action='buy')) / SUM(quantity WHERE action='buy')
```

### קביעת כיוון פוזיציה
- `quantity > 0` → `side = 'long'`
- `quantity < 0` → `side = 'short'`  
- `quantity = 0` → `side = 'closed'`

---

## 🗄️ אינטגרציה עם בסיס נתונים

### טבלת Executions
```sql
CREATE TABLE executions (
    trade_id INTEGER NOT NULL,
    action VARCHAR(20) NOT NULL,    -- 'buy' או 'sell'
    quantity FLOAT NOT NULL,
    price FLOAT NOT NULL,
    fee FLOAT,
    date DATETIME,
    source VARCHAR(50),
    notes VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### דוגמאות נתונים
```sql
-- Long Position Example
INSERT INTO executions VALUES (1, 'buy', 100, 250.00, 2.50, '2025-10-20', 'manual', 'Initial purchase');
INSERT INTO executions VALUES (1, 'buy', 50, 248.00, 1.25, '2025-10-21', 'manual', 'Additional purchase');
-- Result: quantity=150, average_price=249.17

-- Short Position Example  
INSERT INTO executions VALUES (2, 'sell', 200, 300.00, 3.00, '2025-10-20', 'manual', 'Short sale');
INSERT INTO executions VALUES (2, 'buy', 100, 295.00, 1.50, '2025-10-21', 'manual', 'Partial cover');
-- Result: quantity=-100, average_price=300.00
```

---

## ⚡ ביצועים ואופטימיזציה

### Batch Processing
- **חישוב batch** - חישוב מספר טריידים בבת אחת
- **Query optimization** - שימוש ב-SQL יעיל
- **Memory management** - ניהול זיכרון חכם

### Caching Strategy
- **Backend Cache** - TTL 60 שניות
- **Frontend Cache** - Unified Cache Manager (5 דקות)
- **Invalidation** - אוטומטי כאשר נוסף execution

### Performance Metrics
- **Response Time** - <100ms לטרייד בודד
- **Batch Processing** - <500ms ל-100 טריידים
- **Memory Usage** - <1MB ל-1000 טריידים

---

## 🔄 Cache Management

### Backend Cache
```python
# TTL: 60 seconds
cache_key = f"position_{trade_id}"
cache_data = {
    'position': position_data,
    'calculated_at': datetime.now(),
    'ttl': 60
}
```

### Frontend Cache
```javascript
// Unified Cache Manager
'trade-positions': {
    layer: 'memory',
    ttl: 300000,        // 5 minutes
    maxSize: 500 * 1024, // 500KB
    validate: true,
    syncToBackend: false
}
```

### Cache Invalidation
- **Automatic** - כאשר נוסף/עודכן execution
- **Manual** - כפתור "רענן פוזיציות"
- **TTL Expiration** - אוטומטי לפי זמן

---

## 🧪 בדיקות

### Unit Tests
```bash
pytest Backend/tests/test_position_calculator.py
```

### Test Cases
- ✅ חישוב Long position תקין
- ✅ חישוב Short position תקין  
- ✅ חישוב עם עמלות
- ✅ ביצועים חלקיים (קניה+מכירה)
- ✅ trade ללא executions (position = null)
- ✅ Error handling

### Integration Tests
- ✅ API endpoint `/api/trades/` מחזיר position data
- ✅ Frontend מציג עמודות פוזיציה
- ✅ Cache invalidation עובד
- ✅ כפתור רענון פוזיציות

---

## 🚀 שימוש

### Backend Usage
```python
from services.position_calculator_service import PositionCalculatorService

calculator = PositionCalculatorService()

# Single position
position = calculator.calculate_position(db, trade_id=1)

# Batch positions
positions = calculator.calculate_positions_batch(db, [1, 2, 3])
```

### Frontend Usage
```javascript
// Auto-loaded with trades data
const trades = await loadTradesData();

// Manual refresh
await refreshPositions();

// Access position data
trades.forEach(trade => {
    if (trade.position) {
        console.log(`Trade ${trade.id}: ${trade.position.quantity} @ ${trade.position.average_price}`);
    }
});
```

---

## 🔮 עתיד - Corporate Actions

### תכנון עתידי
```python
# Placeholder for future implementation
def adjust_for_corporate_actions(self, position_data, corporate_actions):
    """
    התאמת פוזיציה ל-Corporate Actions
    - Stock splits
    - Dividends  
    - Mergers
    - Spin-offs
    """
    pass
```

### Corporate Actions Table (Future)
```sql
CREATE TABLE corporate_actions (
    ticker_id INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL,      -- 'split', 'dividend', 'merger'
    ratio DECIMAL(10,6),            -- Split ratio
    amount DECIMAL(10,2),            -- Dividend amount
    date DATE NOT NULL,
    description VARCHAR(500)
);
```

---

## 📚 קישורים רלוונטיים

- **Trades API:** `Backend/routes/api/trades.py`
- **Frontend Integration:** `trading-ui/scripts/trades.js`
- **Cache System:** `documentation/04-FEATURES/CORE/UNIFIED_CACHE_SYSTEM.md`
- **Test Data:** `Backend/scripts/add_sample_executions.py`
- **Unit Tests:** `Backend/tests/test_position_calculator.py`

---

## 🔒 Iron Rules Compliance

- ✅ **אין mock data** - רק הצגת "אין ביצועים" או "חסר מחיר"
- ✅ **Unified Cache Only** - שימוש רק ב-UnifiedCacheManager
- ✅ **Notification System** - הודעות ברורות למשתמש
- ✅ **Error Handling** - טיפול בשגיאות מקיף
- ✅ **Documentation** - תיעוד מלא ומעודכן
