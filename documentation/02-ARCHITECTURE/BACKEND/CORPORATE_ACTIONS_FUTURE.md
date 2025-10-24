# Corporate Actions Future - TikTrack
# מערכת פעולות תאגידיות עתידית

**תאריך:** 24 אוקטובר 2025  
**גרסה:** 1.0.0  
**סטטוס:** 🔮 תכנון עתידי  
**מטרה:** תכנון מערכת לטיפול בפעולות תאגידיות (Corporate Actions)  

---

## 📋 סקירה כללית

מערכת Corporate Actions Future מספקת תכנון מקיף לטיפול בפעולות תאגידיות שונות המשפיעות על פוזיציות טריידים. המערכת מיועדת ליישום עתידי לפי יוזמת המשתמש.

### פעולות תאגידיות נתמכות:
- **Stock Splits** - פיצול מניות
- **Stock Dividends** - דיבידנדים במניות
- **Cash Dividends** - דיבידנדים במזומן (כבר קיים ב-cash_flows)
- **Mergers & Acquisitions** - מיזוגים ורכישות
- **Spin-offs** - פיצול חברות
- **Reverse Splits** - איחוד מניות

---

## 🏗️ ארכיטקטורה עתידית

### Backend Service
```
Backend/services/corporate_actions_service.py
├── CorporateActionsService
│   ├── process_stock_split()
│   ├── process_dividend()
│   ├── process_merger()
│   └── adjust_position_for_corporate_action()
```

### Database Schema
```sql
-- טבלת פעולות תאגידיות
CREATE TABLE corporate_actions (
    id INTEGER PRIMARY KEY,
    ticker_id INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL,           -- 'split', 'dividend', 'merger'
    ratio DECIMAL(10,6),                  -- Split ratio (2:1 = 2.0)
    amount DECIMAL(10,2),                 -- Dividend amount
    date DATE NOT NULL,
    description VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(ticker_id) REFERENCES tickers(id)
);

-- קישור לטריידים
CREATE TABLE trade_corporate_actions (
    trade_id INTEGER NOT NULL,
    corporate_action_id INTEGER NOT NULL,
    adjustment_applied BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(trade_id, corporate_action_id),
    FOREIGN KEY(trade_id) REFERENCES trades(id),
    FOREIGN KEY(corporate_action_id) REFERENCES corporate_actions(id)
);
```

### Integration Points
```
PositionCalculatorService
├── adjust_for_corporate_actions()
├── get_corporate_actions_for_trade()
└── apply_corporate_action_adjustments()

Trades API
├── include_corporate_actions_in_response()
└── get_corporate_actions_history()

Frontend
├── display_corporate_actions_history()
├── show_corporate_action_impact()
└── corporate_actions_timeline()
```

---

## 🔧 API עתידי

### Core Methods

#### `process_stock_split(ticker_id, ratio, date)`
```python
def process_stock_split(self, ticker_id: int, ratio: float, date: str) -> bool:
    """
    עיבוד פיצול מניות
    
    Args:
        ticker_id: מזהה הטיקר
        ratio: יחס הפיצול (2:1 = 2.0)
        date: תאריך הפיצול
        
    Returns:
        bool: הצלחת העיבוד
    """
```

#### `process_dividend(ticker_id, amount, date)`
```python
def process_dividend(self, ticker_id: int, amount: float, date: str) -> bool:
    """
    עיבוד דיבידנד במזומן
    
    Args:
        ticker_id: מזהה הטיקר
        amount: סכום הדיבידנד למניה
        date: תאריך הדיבידנד
        
    Returns:
        bool: הצלחת העיבוד
    """
```

#### `adjust_position_for_corporate_action(position_data, corporate_action)`
```python
def adjust_position_for_corporate_action(self, position_data: dict, corporate_action: dict) -> dict:
    """
    התאמת פוזיציה לפעולה תאגידית
    
    Args:
        position_data: נתוני הפוזיציה הנוכחית
        corporate_action: פרטי הפעולה התאגידית
        
    Returns:
        dict: נתוני הפוזיציה המעודכנים
    """
```

---

## 📊 לוגיקת חישוב

### Stock Split (פיצול מניות)
```
New Quantity = Old Quantity × Split Ratio
New Average Price = Old Average Price ÷ Split Ratio
```

**דוגמה:**
- פוזיציה: 100 מניות @ $200
- פיצול 2:1 (ratio = 2.0)
- תוצאה: 200 מניות @ $100

### Cash Dividend (דיבידנד במזומן)
```
Position unchanged
Cash flow added to cash_flows table
```

**דוגמה:**
- פוזיציה: 100 מניות @ $200
- דיבידנד: $2 למניה
- תוצאה: 100 מניות @ $200 + $200 במזומן

### Stock Dividend (דיבידנד במניות)
```
New Quantity = Old Quantity × (1 + Dividend Ratio)
New Average Price = Old Average Price ÷ (1 + Dividend Ratio)
```

**דוגמה:**
- פוזיציה: 100 מניות @ $200
- דיבידנד: 5% במניות (ratio = 0.05)
- תוצאה: 105 מניות @ $190.48

---

## 🗄️ אינטגרציה עם מערכות קיימות

### Cash Flows Integration
```sql
-- דיבידנדים במזומן כבר קיימים
INSERT INTO cash_flows (account_id, type, amount, date, description)
VALUES (account_id, 'dividend', dividend_amount * quantity, dividend_date, 'Stock dividend');
```

### Position Calculator Integration
```python
# התאמת חישובי פוזיציה
def calculate_position_with_corporate_actions(self, db: Session, trade_id: int):
    position = self.calculate_position(db, trade_id)
    
    # קבלת פעולות תאגידיות
    corporate_actions = self.get_corporate_actions_for_trade(db, trade_id)
    
    # התאמת הפוזיציה
    for action in corporate_actions:
        position = self.adjust_position_for_corporate_action(position, action)
    
    return position
```

### Trades API Integration
```python
# הוספת נתוני פעולות תאגידיות ל-API
def get_trades_with_corporate_actions():
    trades = get_trades()
    
    for trade in trades:
        trade['corporate_actions'] = get_corporate_actions_for_trade(trade['id'])
        trade['position'] = calculate_position_with_corporate_actions(trade['id'])
    
    return trades
```

---

## 🎯 UI עתידי

### Corporate Actions Timeline
```html
<div class="corporate-actions-timeline">
    <h3>פעולות תאגידיות</h3>
    <div class="timeline-item">
        <span class="date">2025-10-15</span>
        <span class="action">Stock Split 2:1</span>
        <span class="impact">100 → 200 מניות</span>
    </div>
    <div class="timeline-item">
        <span class="date">2025-09-01</span>
        <span class="action">Cash Dividend $2.50</span>
        <span class="impact">+$250 במזומן</span>
    </div>
</div>
```

### Position Impact Display
```html
<div class="position-impact">
    <h4>השפעת פעולות תאגידיות</h4>
    <div class="impact-summary">
        <span>כמות מקורית: 100 מניות</span>
        <span>כמות נוכחית: 200 מניות</span>
        <span>התאמות: +100 מניות (פיצול 2:1)</span>
    </div>
</div>
```

---

## 🚀 יישום עתידי

### Phase 1: Database Schema
1. יצירת טבלת `corporate_actions`
2. יצירת טבלת `trade_corporate_actions`
3. Migration script לנתונים קיימים

### Phase 2: Backend Service
1. יצירת `CorporateActionsService`
2. אינטגרציה עם `PositionCalculatorService`
3. API endpoints לפעולות תאגידיות

### Phase 3: Frontend Integration
1. UI להצגת פעולות תאגידיות
2. Timeline של פעולות
3. חישוב השפעה על פוזיציות

### Phase 4: Advanced Features
1. אוטומציה של עדכונים
2. התראות על פעולות תאגידיות
3. ניתוח השפעה על תיק

---

## 🔮 תכונות עתידיות מתקדמות

### Machine Learning Integration
- **חיזוי פעולות תאגידיות** - ניתוח היסטורי לחיזוי
- **המלצות אוטומטיות** - הצעות להתמודדות עם פעולות
- **ניתוח השפעה** - חישוב השפעה על תיק כולל

### Real-time Updates
- **WebSocket Integration** - עדכונים בזמן אמת
- **Push Notifications** - התראות על פעולות חדשות
- **Auto-adjustment** - התאמה אוטומטית של פוזיציות

### Advanced Analytics
- **Performance Impact** - ניתוח השפעה על ביצועים
- **Tax Implications** - השלכות מס
- **Portfolio Rebalancing** - איזון מחדש של תיק

---

## 📚 קישורים רלוונטיים

- **Position Calculator:** `documentation/02-ARCHITECTURE/BACKEND/POSITION_CALCULATOR_SERVICE.md`
- **Cash Flows System:** `documentation/02-ARCHITECTURE/BACKEND/CASH_FLOWS_SYSTEM.md`
- **Trades API:** `Backend/routes/api/trades.py`
- **Database Schema:** `Backend/scripts/create_clean_database.py`

---

## 🔒 Iron Rules Compliance

- ✅ **אין mock data** - רק נתונים אמיתיים מפעולות תאגידיות
- ✅ **User-initiated** - יישום רק לפי יוזמת המשתמש
- ✅ **Integration** - אינטגרציה מלאה עם מערכות קיימות
- ✅ **Documentation** - תיעוד מקיף לכל התכונות
- ✅ **Future-proof** - תכנון גמיש לעתיד
