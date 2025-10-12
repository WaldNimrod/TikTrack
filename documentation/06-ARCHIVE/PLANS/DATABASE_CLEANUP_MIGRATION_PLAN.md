# תוכנית מיגרציה מקיפה - ניקוי מסד הנתונים
## Comprehensive Database Cleanup Migration Plan

**תאריך:** 8 באוקטובר 2025, 18:30  
**גרסה:** 2.0.6  
**מטרה:** הסרת שדות מיותרים ושרידים של מערכות ישנות  
**סטטוס:** 📋 מוכן לביצוע

---

## 🔍 תוצאות סריקה

### **סריקת 9 טבלאות מרכזיות:**

| טבלה | שדות מיותרים | סטטוס |
|------|--------------|-------|
| alerts | `ticker_id`, `trading_account_id` | ❌ דורש תיקון |
| notes | - | ✅ נקי |
| cash_flows | - | ✅ נקי |
| executions | - | ✅ נקי |
| trades | - | ✅ נקי |
| trade_plans | - | ✅ נקי |
| trading_accounts | - | ✅ נקי |
| tickers | - | ✅ נקי |
| currencies | - | ✅ נקי |

**מסקנה:** רק טבלת **alerts** דורשת מיגרציה! 🎯

---

## 📊 ניתוח טבלת alerts

### **מבנה נוכחי:**

| עמודה | שדה | סוג | נדרש | ברירת מחדל | הערה |
|-------|-----|-----|------|-------------|------|
| 0 | `id` | INTEGER | PK | AUTO | ✅ נשאר |
| 1 | `trading_account_id` | INTEGER | לא | NULL | ❌ **למחוק** |
| 2 | `ticker_id` | INTEGER | לא | NULL | ❌ **למחוק** |
| 3 | `message` | TEXT | לא | NULL | ✅ נשאר |
| 4 | `triggered_at` | NUM | לא | NULL | ✅ נשאר |
| 5 | `created_at` | NUM | לא | CURRENT_TIMESTAMP | ✅ נשאר |
| 6 | `status` | TEXT | לא | NULL | ✅ נשאר |
| 7 | `is_triggered` | TEXT | לא | NULL | ✅ נשאר |
| 8 | `related_type_id` | INTEGER | לא | NULL | ✅ נשאר |
| 9 | `related_id` | INTEGER | לא | NULL | ✅ נשאר |
| 10 | `condition_attribute` | TEXT | לא | NULL | ✅ נשאר |
| 11 | `condition_operator` | TEXT | לא | NULL | ✅ נשאר |
| 12 | `condition_number` | NUM | לא | NULL | ✅ נשאר |

---

## 📈 ניתוח נתונים קיימים

### **סטטיסטיקה:**
```sql
SELECT 
  COUNT(*) as total_alerts,
  COUNT(ticker_id) as alerts_with_old_ticker_id,
  COUNT(trading_account_id) as alerts_with_old_account_id,
  COUNT(related_type_id) as alerts_with_new_system
FROM alerts;
```

**תוצאות:**
- סה"כ התראות: **28**
- עם `ticker_id`: **9**
- עם `trading_account_id`: **1**
- עם `related_type_id`: **28** (כולן!)

**מסקנה:**  
- ✅ כל ה-28 התראות משתמשות במערכת החדשה
- ⚠️ 10 התראות יש להן **גם** שדות ישנים (כפילות!)

### **התראה 17 - דוגמה לכפילות:**
```
id: 17
ticker_id: 1          ❌ ישן
trading_account_id: 1 ❌ ישן
related_type_id: 4    ✅ חדש (trade_plan)
related_id: 1         ✅ חדש
```

**הבעיה:** השדות הישנים מצביעים לטיקר וחשבון, אבל המערכת החדשה אומרת trade_plan! 😱

---

## 🔧 תוכנית המיגרציה

### **שלב 0: גיבוי (חובה!)** 💾

```bash
# גיבוי מסד נתונים מלא
cd Backend/db
cp simpleTrade_new.db simpleTrade_new_backup_before_alerts_migration_$(date +%Y%m%d_%H%M%S).db

# גיבוי טבלת alerts בלבד
sqlite3 simpleTrade_new.db "CREATE TABLE alerts_backup_20251008 AS SELECT * FROM alerts;"
```

---

### **שלב 1: בדיקת התאמה (אופציונלי)** 🔍

בדוק אם יש אי-התאמות בין השדות הישנים לחדשים:

```sql
-- התראות עם ticker_id שלא תואם ל-related
SELECT id, ticker_id, trading_account_id, related_type_id, related_id
FROM alerts 
WHERE ticker_id IS NOT NULL 
  AND NOT (related_type_id = 1 AND related_id = ticker_id);
```

**אם יש תוצאות:** יש אי-התאמה! צריך להחליט מה נכון.

---

### **שלב 2: עדכון קוד Backend** 🔧

#### **A. `Backend/services/entity_details_service.py`** (שורות 514-530)

**לפני:**
```python
def get_linked_items_for_alert(db: Session, alert_id: int):
    linked_items = []
    
    # Get the ticker this alert is for
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if alert and alert.ticker_id:  # ❌ שדה ישן!
        ticker = db.query(Ticker).filter(Ticker.id == alert.ticker_id).first()
        if ticker:
            linked_items.append({
                'type': 'ticker',
                'id': ticker.id,
                'name': ticker.symbol,
                'status': ticker.status
            })
            
        # Get related trades for this ticker
        trades = db.query(Trade).filter(Trade.ticker_id == alert.ticker_id).all()
        for trade in trades:
            linked_items.append({...})
```

**אחרי:**
```python
def get_linked_items_for_alert(db: Session, alert_id: int):
    linked_items = []
    
    # Get the alert
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        return []
    
    # Get the related object based on new system
    if alert.related_type_id == 1:  # Ticker
        ticker = db.query(Ticker).filter(Ticker.id == alert.related_id).first()
        if ticker:
            linked_items.append({
                'type': 'ticker',
                'id': ticker.id,
                'name': ticker.symbol,
                'status': ticker.status
            })
            
            # Get related trades for this ticker
            trades = db.query(Trade).filter(Trade.ticker_id == alert.related_id).all()
            for trade in trades:
                linked_items.append({...})
                
    elif alert.related_type_id == 2:  # Trade
        trade = db.query(Trade).filter(Trade.id == alert.related_id).first()
        if trade:
            linked_items.append({
                'type': 'trade',
                'id': trade.id,
                'name': f'Trade #{trade.id}',
                'status': trade.status
            })
            
    elif alert.related_type_id == 3:  # Trading Account
        account = db.query(TradingAccount).filter(TradingAccount.id == alert.related_id).first()
        if account:
            linked_items.append({
                'type': 'trading_account',
                'id': account.id,
                'name': account.name,
                'status': account.status
            })
            
    elif alert.related_type_id == 4:  # Trade Plan
        plan = db.query(TradePlan).filter(TradePlan.id == alert.related_id).first()
        if plan:
            linked_items.append({
                'type': 'trade_plan',
                'id': plan.id,
                'name': f'Plan #{plan.id}',
                'status': plan.status
            })
    
    return linked_items
```

#### **B. `Backend/models/alert.py`** (שורות 11-12)

**לפני:**
```python
class Alert(BaseModel):
    __tablename__ = "alerts"
    
    # Fields that exist in the database
    trading_account_id = Column(Integer, nullable=True)  # ❌ למחוק
    ticker_id = Column(Integer, ForeignKey('tickers.id'), nullable=True)  # ❌ למחוק
    message = Column(String(500), nullable=True)
    triggered_at = Column(DateTime, nullable=True)
    status = Column(String(20), default='open', nullable=True)
    is_triggered = Column(String(20), default='false', nullable=True)
    related_type_id = Column(Integer, ForeignKey('note_relation_types.id'), nullable=False, default=4)
    related_id = Column(Integer, nullable=False)
    condition_attribute = Column(String(50), nullable=False, default='price')
    condition_operator = Column(String(50), nullable=False, default='more_than')
    condition_number = Column(String(20), nullable=False, default='0')
```

**אחרי:**
```python
class Alert(BaseModel):
    __tablename__ = "alerts"
    
    # Core fields
    message = Column(String(500), nullable=True)
    triggered_at = Column(DateTime, nullable=True)
    status = Column(String(20), default='open', nullable=True)
    is_triggered = Column(String(20), default='false', nullable=True)
    
    # Generic relationship system
    related_type_id = Column(Integer, ForeignKey('note_relation_types.id'), nullable=False, default=4)
    related_id = Column(Integer, nullable=False)
    
    # Alert condition
    condition_attribute = Column(String(50), nullable=False, default='price')
    condition_operator = Column(String(50), nullable=False, default='more_than')
    condition_number = Column(String(20), nullable=False, default='0')
```

---

### **שלב 3: עדכון קוד Frontend** 🎨

#### **A. `trading-ui/scripts/alerts.js`**

**שורות 140-170 - Mock Data:**

**למחוק:**
```javascript
{
  id: 1,
  ticker_id: 1,  // ❌ למחוק
  related_type_id: 1,  // ✅ נשאר
  related_id: 1,  // ✅ נשאר
  ...
}
```

**שורות 559-560 - Logic:**

**זה בסדר!** הקוד מדבר על `trade.ticker_id` לא `alert.ticker_id`:
```javascript
if (trade && trade.ticker_id) {  // ✅ זה trade.ticker_id - נכון!
  const ticker = tickers.find(tick => tick.id === trade.ticker_id);
}
```

---

### **שלב 4: מחיקת שדות מהטבלה** 🗑️

**⚠️ אזהרה: SQLite לא תומך ב-ALTER TABLE DROP COLUMN ישירות!**

צריך ליצור טבלה חדשה ולהעתיק נתונים:

```sql
-- 1. יצירת טבלה חדשה ללא השדות הישנים
CREATE TABLE alerts_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message TEXT,
    triggered_at NUM,
    created_at NUM DEFAULT CURRENT_TIMESTAMP,
    status TEXT,
    is_triggered TEXT,
    related_type_id INTEGER NOT NULL,
    related_id INTEGER NOT NULL,
    condition_attribute TEXT NOT NULL,
    condition_operator TEXT NOT NULL,
    condition_number NUM NOT NULL,
    FOREIGN KEY (related_type_id) REFERENCES note_relation_types(id)
);

-- 2. העתקת נתונים (ללא השדות הישנים)
INSERT INTO alerts_new (
    id, message, triggered_at, created_at, status, is_triggered,
    related_type_id, related_id,
    condition_attribute, condition_operator, condition_number
)
SELECT 
    id, message, triggered_at, created_at, status, is_triggered,
    related_type_id, related_id,
    condition_attribute, condition_operator, condition_number
FROM alerts;

-- 3. בדיקת תקינות
SELECT COUNT(*) FROM alerts;      -- אמור להיות 28
SELECT COUNT(*) FROM alerts_new;  -- אמור להיות 28

-- 4. החלפת טבלאות
DROP TABLE alerts;
ALTER TABLE alerts_new RENAME TO alerts;

-- 5. שחזור indexes (אם היו)
CREATE INDEX IF NOT EXISTS idx_alerts_related ON alerts(related_type_id, related_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_triggered ON alerts(is_triggered);
```

---

## 📋 סדר ביצוע מומלץ

### **שלב א': הכנות** ✅ (5 דקות)
- [x] סריקת כל הטבלאות - **בוצע**
- [x] זיהוי שדות מיותרים - **בוצע**
- [x] בדיקת תלויות בקוד - **בוצע**
- [ ] גיבוי מסד נתונים
- [ ] יצירת טבלת גיבוי `alerts_backup_20251008`

### **שלב ב': עדכון קוד** ⏳ (20 דקות)
- [ ] תיקון `Backend/services/entity_details_service.py`
- [ ] עדכון `Backend/models/alert.py`
- [ ] הסרת Mock Data מ-`trading-ui/scripts/alerts.js`
- [ ] בדיקת lint errors

### **שלב ג': מיגרציית טבלה** ⏳ (10 דקות)
- [ ] יצירת `alerts_new` ללא שדות ישנים
- [ ] העתקת נתונים
- [ ] בדיקת תקינות (COUNT)
- [ ] החלפת טבלאות
- [ ] שחזור indexes

### **שלב ד': בדיקות** ⏳ (15 דקות)
- [ ] בדיקת Backend API - `GET /api/alerts/`
- [ ] בדיקת הוספת התראה חדשה
- [ ] בדיקת עריכת התראה קיימת
- [ ] בדיקת מחיקת התראה
- [ ] בדיקת פרטי ישות (linked items)
- [ ] בדיקת Frontend - טעינה ותצוגה

### **שלב ה': ניקיון** ⏳ (5 דקות)
- [ ] מחיקת טבלת גיבוי זמנית (אם הכל תקין)
- [ ] עדכון דוקומנטציה
- [ ] commit לגיט

---

## 🔍 בדיקות תקינות

### **1. בדיקת נתונים לפני מיגרציה:**

```sql
-- כמה התראות יש?
SELECT COUNT(*) FROM alerts;  -- אמור: 28

-- כמה עם שדות ישנים?
SELECT COUNT(*) FROM alerts WHERE ticker_id IS NOT NULL;  -- תוצאה: 9
SELECT COUNT(*) FROM alerts WHERE trading_account_id IS NOT NULL;  -- תוצאה: 1

-- האם כולן עם מערכת חדשה?
SELECT COUNT(*) FROM alerts WHERE related_type_id IS NOT NULL;  -- אמור: 28
```

### **2. בדיקת נתונים אחרי מיגרציה:**

```sql
-- כמה התראות יש?
SELECT COUNT(*) FROM alerts;  -- אמור: 28 (זהה!)

-- האם השדות הישנים נמחקו?
PRAGMA table_info(alerts);  -- אמור: 11 עמודות (לא 13)

-- האם כל הנתונים תקינים?
SELECT * FROM alerts WHERE related_type_id IS NULL;  -- אמור: 0 תוצאות
SELECT * FROM alerts WHERE related_id IS NULL;  -- אמור: 0 תוצאות
```

---

## 📝 סקריפט מיגרציה מלא

```sql
-- ===== ALERTS TABLE MIGRATION - REMOVE OLD FIELDS =====
-- תאריך: 2025-10-08
-- מטרה: הסרת ticker_id ו-trading_account_id מיותרים

BEGIN TRANSACTION;

-- 1. גיבוי
CREATE TABLE alerts_backup_20251008 AS SELECT * FROM alerts;

-- 2. יצירת טבלה חדשה
CREATE TABLE alerts_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message TEXT,
    triggered_at NUM,
    created_at NUM DEFAULT CURRENT_TIMESTAMP,
    status TEXT,
    is_triggered TEXT,
    related_type_id INTEGER NOT NULL,
    related_id INTEGER NOT NULL,
    condition_attribute TEXT NOT NULL,
    condition_operator TEXT NOT NULL,
    condition_number NUM NOT NULL,
    FOREIGN KEY (related_type_id) REFERENCES note_relation_types(id)
);

-- 3. העתקת נתונים
INSERT INTO alerts_new (
    id, message, triggered_at, created_at, status, is_triggered,
    related_type_id, related_id,
    condition_attribute, condition_operator, condition_number
)
SELECT 
    id, message, triggered_at, created_at, status, is_triggered,
    related_type_id, related_id,
    condition_attribute, condition_operator, condition_number
FROM alerts;

-- 4. בדיקת תקינות
SELECT 
    'Original' as table_name, COUNT(*) as row_count FROM alerts
UNION ALL
SELECT 
    'New' as table_name, COUNT(*) as row_count FROM alerts_new;

-- אם התוצאות זהות - המשך
-- אם לא - ROLLBACK;

-- 5. החלפת טבלאות
DROP TABLE alerts;
ALTER TABLE alerts_new RENAME TO alerts;

-- 6. שחזור indexes
CREATE INDEX IF NOT EXISTS idx_alerts_related ON alerts(related_type_id, related_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_triggered ON alerts(is_triggered);

COMMIT;

-- 7. וידוא סופי
SELECT COUNT(*) FROM alerts;
PRAGMA table_info(alerts);
```

---

## 🎯 תוצאה צפויה

### **לפני המיגרציה:**
```
alerts: 13 columns
  - ticker_id ❌
  - trading_account_id ❌
  - related_type_id ✅
  - related_id ✅
```

### **אחרי המיגרציה:**
```
alerts: 11 columns
  - related_type_id ✅
  - related_id ✅
  - (ticker_id removed)
  - (trading_account_id removed)
```

---

## ⚠️ תכנית Rollback

אם משהו השתבש:

```sql
BEGIN TRANSACTION;

-- 1. מחיקת טבלה נוכחית (אם קיימת)
DROP TABLE IF EXISTS alerts;

-- 2. שחזור מגיבוי
CREATE TABLE alerts AS SELECT * FROM alerts_backup_20251008;

-- 3. וידוא
SELECT COUNT(*) FROM alerts;  -- אמור: 28

COMMIT;
```

---

## ✅ סיכום

**טבלאות שנבדקו:** 9  
**טבלאות עם בעיות:** 1 (alerts)  
**שדות למחיקה:** 2 (`ticker_id`, `trading_account_id`)  
**נתונים מושפעים:** 10/28 התראות (36%)  
**קבצי קוד לתיקון:** 2 (Backend: 2, Frontend: 1)  
**זמן משוער:** 50 דקות  
**סיכון:** 🟡 בינוני

**מוכן לביצוע:** ✅ כן (עם גיבוי!)

---

**האם לבצע את המיגרציה כעת?** 🚀

