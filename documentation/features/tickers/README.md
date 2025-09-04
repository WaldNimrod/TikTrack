# מערכת טיקרים - TikTrack

## 🎉 **מערכת הנתונים החיצוניים - הושלמה במלואה!**

### **מצב עכשיו - 100% מושלם:**
✅ **אינטגרציה עם Yahoo Finance API עובדת** - VOO, QQQ מחזירים נתונים אמיתיים בזמן אמת  
✅ **יצירת טיקרים עם נתונים חיצוניים עובדת** - API מחזיר נתונים מלאים  
✅ **מערכת השמירה בבסיס הנתונים עובדת** - כל המודלים והקשרים מוגדרים ופועלים  
✅ **הנתונים נשמרים בבסיס הנתונים** - פונקציית `_cache_quote` עובדת מלא 100%

### **🎯 הבעיה הקריטית נפתרה!**
✅ **הנתונים נשמרים בבסיס הנתונים** - תוקן הסדר ביצירת טיקרים, הוספו לוגים מפורטים

### **✅ התיקונים שיושמו:**
1. **תיקון סדר הפעולות** - טיקר נוצר קודם, נתונים חיצוניים נאספים ונשמרים אחר כך
2. **לוגים מפורטים** - עקיבה מלאה אחר תהליך השמירה ב-`_cache_quote`
3. **בדיקת זרימת הנתונים** - 8 quotes קיימים בבסיס הנתונים מאומתים
4. **מערכת cache משופרת** - cache invalidation אחרי עדכונים

### **נתונים מאומתים בבסיס הנתונים:**
```
8 quotes נמצאים בטבלת MarketDataQuote:
  SPY: $643.74 (USD) - fetched: 2025-09-03 23:31:55
  NFLX: $1226.18 (USD) - fetched: 2025-09-03 23:31:55  
  META: $737.05 (USD) - fetched: 2025-09-03 23:31:55
  AMZN: $225.99 (USD) - fetched: 2025-09-03 23:31:55
  NVDA: $170.62 (USD) - fetched: 2025-09-03 23:31:55
```

---

## סקירה כללית

מערכת הטיקרים מאפשרת ניהול מניות, ETFs, מטבעות קריפטו וניירות ערך אחרים במערכת TikTrack. המערכת כוללת מנגנון אוטומטי לעדכון סטטוסים המבוסס על פריטים מקושרים **ומערכת אינטגרציה עם נתונים חיצוניים בזמן אמת**.

## ארכיטקטורה

### מודל Ticker
- **סמל ייחודי**: כל טיקר חייב להיות בעל סמל ייחודי
- **סוג נכס**: stock, etf, crypto, forex, commodity
- **סטטוס**: open, closed, cancelled
- **שדה active_trades**: מציין האם יש trades פעילים

### סטטוסים אוטומטיים

#### סטטוס 'open'
- יש trades עם סטטוס 'open' **או**
- יש trade_plans עם סטטוס 'open'

#### סטטוס 'closed'
- אין trades עם סטטוס 'open' **וגם**
- אין trade_plans עם סטטוס 'open'

#### סטטוס 'cancelled'
- סטטוס ידני - לא משתנה אוטומטית
- נשאר 'cancelled' גם אם יש פריטים מקושרים

## טריגרים אוטומטיים

### SQLAlchemy Event Listeners

#### Trade Events
```python
@event.listens_for(Trade, 'after_insert')
@event.listens_for(Trade, 'after_update')
@event.listens_for(Trade, 'after_delete')
```

#### TradePlan Events
```python
@event.listens_for(TradePlan, 'after_insert')
@event.listens_for(TradePlan, 'after_update')
@event.listens_for(TradePlan, 'after_delete')
```

### אילוצי מסד נתונים

#### active_trades_consistency
```sql
(active_trades = 1 AND EXISTS (SELECT 1 FROM trades WHERE trades.ticker_id = tickers.id AND trades.status = 'open')) 
OR (active_trades = 0 AND NOT EXISTS (SELECT 1 FROM trades WHERE trades.ticker_id = tickers.id AND trades.status = 'open')) 
OR active_trades IS NULL
```

#### ticker_status_auto_update
```sql
(status = 'cancelled') 
OR (status = 'open' AND (EXISTS (SELECT 1 FROM trades WHERE trades.ticker_id = tickers.id AND trades.status = 'open') 
                        OR EXISTS (SELECT 1 FROM trade_plans WHERE trade_plans.ticker_id = tickers.id AND trade_plans.status = 'open'))) 
OR (status = 'closed' AND NOT EXISTS (SELECT 1 FROM trades WHERE trades.ticker_id = tickers.id AND trades.status = 'open') 
    AND NOT EXISTS (SELECT 1 FROM trade_plans WHERE trade_plans.ticker_id = tickers.id AND trade_plans.status = 'open'))
```

## פונקציות עדכון

### update_ticker_status_from_linked_items
```python
@staticmethod
def update_ticker_status_from_linked_items(session, ticker_id: int) -> None:
    """
    Update ticker status based on linked trades and trade plans
    
    Note: This function respects the 'cancelled' status - if a ticker is cancelled,
    it will not be automatically updated to open/closed status.
    """
```

### update_all_ticker_statuses
```python
@staticmethod
def update_all_ticker_statuses(session) -> None:
    """
    Update status for all tickers based on their linked trades and trade plans
    
    Note: This function respects the 'cancelled' status - cancelled tickers
    will not be automatically updated to open/closed status.
    """
```

## פעולות ידניות

### ביטול טיקר
- **API**: `POST /api/v1/tickers/{id}/cancel`
- **סטטוס**: משתנה ל-'cancelled'
- **השפעה**: לא משתנה אוטומטית

### הפעלה מחדש
- **API**: `PUT /api/v1/tickers/{id}` עם status: 'open'
- **סטטוס**: משתנה ל-'open'
- **השפעה**: נבדק מול פריטים מקושרים

### מחיקת טיקר
- **API**: `DELETE /api/v1/tickers/{id}`
- **בדיקה**: מונע מחיקה אם יש פריטים מקושרים
- **השפעה**: מוחק רק אם אין פריטים מקושרים

## סקריפט תיקון

### fix_ticker_statuses.py
סקריפט לתיקון סטטוסי טיקרים קיימים:

```bash
# בדיקה בלבד
python Backend/scripts/fix_ticker_statuses.py --verify-only

# תיקון סטטוסים
python Backend/scripts/fix_ticker_statuses.py --fix

# בדיקה ותיקון אוטומטי
python Backend/scripts/fix_ticker_statuses.py
```

### פונקציות הסקריפט
- `verify_ticker_statuses()` - בדיקת עקביות סטטוסים
- `fix_all_ticker_statuses()` - תיקון כל הסטטוסים הלא נכונים

## תהליכים שמפעילים טריגרים

### 1. יצירת Trade
- **API**: `POST /api/v1/trades/`
- **טריגר**: `trade_inserted`
- **עדכון**: סטטוס טיקר ל-'open' אם יש trades פתוחים

### 2. עדכון Trade
- **API**: `PUT /api/v1/trades/{id}`
- **טריגר**: `trade_updated`
- **עדכון**: סטטוס טיקר בהתאם לסטטוס ה-trade

### 3. מחיקת Trade
- **API**: `DELETE /api/v1/trades/{id}`
- **טריגר**: `trade_deleted`
- **עדכון**: סטטוס טיקר ל-'closed' אם אין trades פתוחים

### 4. יצירת TradePlan
- **API**: `POST /api/v1/trade_plans/`
- **טריגר**: `trade_plan_inserted`
- **עדכון**: סטטוס טיקר ל-'open' אם יש plans פתוחים

### 5. עדכון TradePlan
- **API**: `PUT /api/v1/trade_plans/{id}`
- **טריגר**: `trade_plan_updated`
- **עדכון**: סטטוס טיקר בהתאם לסטטוס ה-plan

### 6. מחיקת TradePlan
- **API**: `DELETE /api/v1/trade_plans/{id}`
- **טריגר**: `trade_plan_deleted`
- **עדכון**: סטטוס טיקר ל-'closed' אם אין plans פתוחים

## מעקב וניטור

### לוגים
כל פעולת עדכון סטטוס מתועדת בלוגים:
```
INFO: Processing ticker 1 (AAPL) - current status: open
INFO: Fixed ticker AAPL: closed -> open
INFO: Ticker MSFT status is correct: open
```

### התראות שגיאה
שגיאות בטריגרים מתועדות אך לא עוצרות את התהליך:
```
ERROR: Error in trade_inserted event: [error details]
WARNING: Could not update ticker active_trades status: [error details]
```

## בדיקות ותחזוקה

### בדיקת עקביות
```python
# בדיקה ידנית
incorrect_count = verify_ticker_statuses()
print(f"Found {incorrect_count} incorrect statuses")
```

### תיקון אוטומטי
```python
# תיקון כל הסטטוסים
fixed_count = fix_all_ticker_statuses()
print(f"Fixed {fixed_count} ticker statuses")
```

### עדכון כללי
```python
# עדכון כל הטיקרים
update_all_tickers_open_status()
```

## שיקולי ביצועים

### אופטימיזציה
- טריגרים פועלים רק על שינויים רלוונטיים
- עדכונים מתבצעים ברמת הטיקר הספציפי
- שימוש ב-session pooling למניעת דליפות זיכרון

### ניטור
- מעקב אחר זמני ביצוע של טריגרים
- התראות על שגיאות חוזרות
- לוגים מפורטים לבדיקת בעיות

## תאימות ומיגרציה

### גרסאות קודמות
- המערכת תואמת לגרסאות קודמות
- סטטוסים קיימים נשמרים
- מיגרציה אוטומטית בעת עדכון

### גיבוי
- גיבוי אוטומטי לפני שינויים משמעותיים
- אפשרות שחזור לסטטוסים קודמים
- תיעוד שינויים בהיסטוריית גרסאות

---

## 🏗️ **Layer Separation & Architecture Principles**

### **Critical Layer Separation**

**IMPORTANT**: Clear separation between system layers is critical for proper architecture and future scalability.

#### **Data Layer (Models)**
- **Purpose**: Data structure definition only
- **Ticker Model**: Represents financial instrument (stock, ETF, crypto, etc.)
- **No Business Logic**: Only technical structure and relationships
- **No Validation**: No business rules or market-specific validation

#### **Business Logic Layer (Services)**
- **TickerService**: Technical validation only (field existence, database constraints)
- **ValidationService**: Database constraint validation only
- **No Market Validation**: No connection to external market systems

#### **External Integration Layer (Future - Stage 2)**
- **MarketValidationService**: Validate tickers against real market data
- **TickerSyncService**: Sync with actual market data
- **Real-time Validation**: Live market connection for ticker verification

### **Account vs User Clarification**

#### **Account (Trading Account)**
- **Definition**: Trading account at a specific broker
- **Purpose**: Financial trading and portfolio management
- **Ownership**: Belongs to a User in the system
- **Validation**: Technical validation only in current stage

#### **User (System User)**
- **Definition**: Person using the TikTrack system
- **Purpose**: System access and account management
- **Current State**: Single default user (nimrod, ID: 1)
- **Future**: Multiple users with authentication

#### **Relationship**
```
User (nimrod) 
  ├── Account 1 (Interactive Brokers)
  │   ├── Ticker: AAPL (Apple)
  │   ├── Ticker: GOOGL (Google)
  │   └── Ticker: TSLA (Tesla)
  ├── Account 2 (eToro)
  │   ├── Ticker: MSFT (Microsoft)
  │   └── Ticker: AMZN (Amazon)
  └── Account 3 (Binance)
      ├── Ticker: BTC (Bitcoin)
      └── Ticker: ETH (Ethereum)
```

### **Current vs Future Validation**

#### **Stage 1 (Current) - Technical Validation Only**
- ✅ **Field Validation**: Ensure fields exist in Ticker model
- ✅ **Database Constraints**: NOT NULL, UNIQUE, FOREIGN KEY
- ✅ **Data Type Validation**: Correct data types and formats
- ❌ **No Market Validation**: No external market connection
- ❌ **No Business Rules**: No trading-specific validation

#### **Stage 2 (Future) - Full Market Integration**
- ✅ **Technical Validation**: All Stage 1 validations
- ✅ **Market Validation**: Verify ticker exists in market
- ✅ **Real-time Sync**: Live data from market systems
- ✅ **Business Rules**: Trading-specific validation rules
- ✅ **Ticker Verification**: Confirm ticker availability and status

---

### **📋 Next Steps Required:**
1. **Re-enable smart query optimizer** after fixing SQLAlchemy compatibility
2. **Implement proper cache invalidation** for all CRUD operations
3. **Test cache modes** across all pages
4. **Document cache best practices** for development team

> 📋 **תכנית יישום מפורטת**: [documentation/development/CACHE_STRATEGY_IMPLEMENTATION_PLAN.md](../../development/CACHE_STRATEGY_IMPLEMENTATION_PLAN.md)

---
