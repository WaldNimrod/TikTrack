# פתרונות לבעיית כפילות נתונים: מחיר מול אחוזים
## Price vs Percentage Redundancy Solutions

---

## 🎯 הבעיה הנוכחית

בטבלת `trade_plans` קיימת כפילות נתונים:
- `stop_price` + `stop_percentage` (שניהם מייצגים את אותו הדבר)
- `target_price` + `target_percentage` (שניהם מייצגים את אותו הדבר)

**סיכונים:**
- אי-עקביות בנתונים (מחיר לא תואם לאחוז)
- קושי בתחזוקה
- בזבוז שטח אחסון
- בלבול לגבי מהו "מקור האמת"

---

## 📋 הפתרונות האפשריים

### פתרון 1: שמירת ערך יחיד + חישוב בזמן אמת ⭐ **מומלץ**

**עיקרון:** שומרים רק ערך אחד (מחיר או אחוז) ומחשבים את השני בצד הלקוח/שרת.

#### אופציה 1א: שמירת מחיר בלבד
```sql
-- מבנה טבלה
CREATE TABLE trade_plans (
    id INTEGER PRIMARY KEY,
    entry_price FLOAT,           -- מחיר כניסה (בסיס לחישובים)
    stop_price FLOAT,            -- רק מחיר
    target_price FLOAT,          -- רק מחיר
    -- stop_percentage - מחושב: ((entry_price - stop_price) / entry_price) * 100
    -- target_percentage - מחושב: ((target_price - entry_price) / entry_price) * 100
);
```

**יתרונות:**
- ✅ אין כפילות - מקור אמת יחיד
- ✅ תמיד עקבי
- ✅ פשוט להבנה
- ✅ מחירים הם ערכים אבסולוטיים (עדיפים לתכנון)

**חסרונות:**
- ❌ צריך `entry_price` לחישוב האחוזים
- ❌ אם `entry_price` משתנה, האחוזים משתנים גם כן
- ❌ חישוב נוסף בכל קריאה

#### אופציה 1ב: שמירת אחוז בלבד
```sql
-- מבנה טבלה
CREATE TABLE trade_plans (
    id INTEGER PRIMARY KEY,
    entry_price FLOAT,           -- מחיר כניסה (בסיס לחישובים)
    stop_percentage FLOAT,       -- רק אחוז
    target_percentage FLOAT,     -- רק אחוז
    -- stop_price - מחושב: entry_price * (1 - stop_percentage/100)
    -- target_price - מחושב: entry_price * (1 + target_percentage/100)
);
```

**יתרונות:**
- ✅ אין כפילות - מקור אמת יחיד
- ✅ תמיד עקבי
- ✅ אחוזים נשארים קבועים גם אם מחיר הכניסה משתנה
- ✅ טבעי לתכנון אסטרטגיות (R:R = 1:2 וכו')

**חסרונות:**
- ❌ צריך `entry_price` לחישוב המחירים
- ❌ חישוב נוסף בכל קריאה
- ❌ קשה יותר לעבוד עם מחירים מעוגלים

---

### פתרון 2: שדה יחיד עם מטא-דטה (Type Indicator)

**עיקרון:** שומרים רק ערך אחד + אינדיקטור לסוג (מחיר/אחוז).

```sql
CREATE TABLE trade_plans (
    id INTEGER PRIMARY KEY,
    entry_price FLOAT,
    
    -- Stop
    stop_value FLOAT,                    -- הערך (מחיר או אחוז)
    stop_type VARCHAR(10),               -- 'price' או 'percentage'
    
    -- Target
    target_value FLOAT,                  -- הערך (מחיר או אחוז)
    target_type VARCHAR(10),             -- 'price' או 'percentage'
);

-- דוגמאות
INSERT INTO trade_plans VALUES (
    1, 100.0,
    95.0, 'price',      -- stop ב-95 דולר
    110.0, 'price'      -- target ב-110 דולר
);

INSERT INTO trade_plans VALUES (
    2, 100.0,
    5.0, 'percentage',  -- stop ב-5%
    10.0, 'percentage'  -- target ב-10%
);
```

**יתרונות:**
- ✅ אין כפילות - מקור אמת יחיד ברור
- ✅ שומר את ההעדפה המקורית של המשתמש
- ✅ גמיש - תומך בשני הסוגים
- ✅ מונע אי-עקביות

**חסרונות:**
- ❌ צריך לבדוק את `stop_type` בכל פעם
- ❌ מורכב יותר לשאילתות SQL
- ❌ צריך validation שה-type תקין

---

### פתרון 3: JSON Field (גמיש מאוד)

**עיקרון:** שומרים את כל המידע בשדה JSON יחיד.

```sql
CREATE TABLE trade_plans (
    id INTEGER PRIMARY KEY,
    entry_price FLOAT,
    stop_config TEXT,        -- JSON: {"value": 95, "type": "price", "original": "price"}
    target_config TEXT,      -- JSON: {"value": 10, "type": "percentage", "original": "percentage"}
);

-- דוגמה
INSERT INTO trade_plans VALUES (
    1, 100.0,
    '{"value": 95, "type": "price", "calculated_percentage": 5}',
    '{"value": 110, "type": "price", "calculated_percentage": 10}'
);
```

**יתרונות:**
- ✅ גמיש מאוד - אפשר להוסיף שדות נוספים
- ✅ שומר את ההקשר המלא
- ✅ קל להרחיב בעתיד
- ✅ אפשר לשמור גם מידע היסטורי

**חסרונות:**
- ❌ קשה לשאילתות SQL (צריך JSON functions)
- ❌ אין type safety
- ❌ דורש parsing בכל גישה
- ❌ מורכב יותר לתחזוקה

---

### פתרון 4: SQLite Generated Columns (עמודות מחושבות)

**עיקרון:** שומרים ערך אחד ואת השני כ-generated column.

```sql
CREATE TABLE trade_plans (
    id INTEGER PRIMARY KEY,
    entry_price FLOAT NOT NULL,
    
    -- שומרים מחירים (מקור האמת)
    stop_price FLOAT,
    target_price FLOAT,
    
    -- מחשבים אחוזים אוטומטית
    stop_percentage FLOAT GENERATED ALWAYS AS (
        CASE 
            WHEN entry_price > 0 AND stop_price IS NOT NULL 
            THEN ((entry_price - stop_price) / entry_price) * 100
            ELSE NULL
        END
    ) VIRTUAL,
    
    target_percentage FLOAT GENERATED ALWAYS AS (
        CASE 
            WHEN entry_price > 0 AND target_price IS NOT NULL 
            THEN ((target_price - entry_price) / entry_price) * 100
            ELSE NULL
        END
    ) VIRTUAL
);

-- שימוש
INSERT INTO trade_plans (id, entry_price, stop_price, target_price) 
VALUES (1, 100.0, 95.0, 110.0);

-- האחוזים מחושבים אוטומטית!
SELECT * FROM trade_plans WHERE id = 1;
-- תוצאה: stop_percentage = 5.0, target_percentage = 10.0
```

**יתרונות:**
- ✅ אין כפילות - השדות המחושבים לא תופסים מקום
- ✅ תמיד עקביים - מחושבים אוטומטית
- ✅ שקוף למשתמש - נראה כמו עמודות רגילות
- ✅ אפס תחזוקה - אוטומטי לחלוטין
- ✅ תומך ב-indexing (STORED) או חישוב בזמן אמת (VIRTUAL)

**חסרונות:**
- ❌ לא אפשר לעדכן את העמודות המחושבות ישירות
- ❌ צריך תמיד `entry_price` תקני
- ❌ אי אפשר לשמור אחוז ולחשב מחיר (רק כיוון אחד)

---

### פתרון 5: View Layer Pattern

**עיקרון:** בסיס הנתונים שומר רק מחירים, ה-API מחזיר גם אחוזים.

```sql
-- טבלה בסיסית
CREATE TABLE trade_plans (
    id INTEGER PRIMARY KEY,
    entry_price FLOAT,
    stop_price FLOAT,
    target_price FLOAT
);

-- View מורחב
CREATE VIEW trade_plans_extended AS
SELECT 
    *,
    -- חישוב אחוזים
    CASE 
        WHEN entry_price > 0 AND stop_price IS NOT NULL 
        THEN ((entry_price - stop_price) / entry_price) * 100
        ELSE NULL
    END as stop_percentage,
    CASE 
        WHEN entry_price > 0 AND target_price IS NOT NULL 
        THEN ((target_price - entry_price) / entry_price) * 100
        ELSE NULL
    END as target_percentage
FROM trade_plans;
```

**קוד Python/API:**
```python
def get_trade_plan(trade_plan_id):
    # קריאה מה-view
    plan = db.execute("SELECT * FROM trade_plans_extended WHERE id = ?", [trade_plan_id])
    
    # או חישוב ב-Python
    plan = TradeService.get_by_id(db, trade_plan_id)
    plan_dict = plan.to_dict()
    
    # חישוב אחוזים
    if plan.entry_price and plan.stop_price:
        plan_dict['stop_percentage'] = ((plan.entry_price - plan.stop_price) / plan.entry_price) * 100
    if plan.entry_price and plan.target_price:
        plan_dict['target_percentage'] = ((plan.target_price - plan.entry_price) / plan.entry_price) * 100
    
    return plan_dict
```

**יתרונות:**
- ✅ הפרדת דאגות - DB שומר מקור אמת, API מספק נוחות
- ✅ גמיש - אפשר לשנות לוגיקת חישוב בקלות
- ✅ תואם ל-REST best practices
- ✅ אפשר להוסיף שדות מחושבים נוספים

**חסרונות:**
- ❌ חישוב בכל בקשה (אם לא משתמשים ב-view)
- ❌ עומס על השרת
- ❌ אי אפשר לעשות filter/sort על השדות המחושבים (ללא view)

---

## 🎯 המומלץ לפרויקט שלך

### המלצה: **פתרון 4 (Generated Columns)** + **פתרון 5 (View Layer)**

**ארכיטקטורה מומלצת:**

```sql
-- 1. טבלה בסיסית עם generated columns
CREATE TABLE trade_plans_new (
    id INTEGER PRIMARY KEY,
    trading_account_id INTEGER NOT NULL,
    ticker_id INTEGER NOT NULL,
    
    -- מחיר כניסה (בסיס לכל החישובים)
    entry_price FLOAT,
    
    -- מקור האמת: מחירים בלבד
    stop_price FLOAT,
    target_price FLOAT,
    
    -- מחושבים אוטומטית
    stop_percentage FLOAT GENERATED ALWAYS AS (
        CASE 
            WHEN entry_price > 0 AND stop_price IS NOT NULL 
            THEN ROUND(((entry_price - stop_price) / entry_price) * 100, 2)
            ELSE NULL
        END
    ) VIRTUAL,
    
    target_percentage FLOAT GENERATED ALWAYS AS (
        CASE 
            WHEN entry_price > 0 AND target_price IS NOT NULL 
            THEN ROUND(((target_price - entry_price) / entry_price) * 100, 2)
            ELSE NULL
        END
    ) VIRTUAL,
    
    -- שאר השדות
    investment_type VARCHAR(20) DEFAULT 'swing',
    planned_amount FLOAT,
    entry_conditions VARCHAR(500),
    reasons VARCHAR(500),
    side VARCHAR(10) DEFAULT 'Long',
    status VARCHAR(20) DEFAULT 'open',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    cancelled_at DATETIME,
    cancel_reason VARCHAR(500)
);
```

**ב-API/Frontend:**
```python
# כאשר המשתמש מזין אחוז - ממירים למחיר לפני שמירה
def create_trade_plan(data):
    # אם המשתמש הזין stop_percentage
    if 'stop_percentage' in data and 'entry_price' in data:
        data['stop_price'] = data['entry_price'] * (1 - data['stop_percentage'] / 100)
    
    # אם המשתמש הזין target_percentage
    if 'target_percentage' in data and 'entry_price' in data:
        data['target_price'] = data['entry_price'] * (1 + data['target_percentage'] / 100)
    
    # שומרים רק מחירים - האחוזים יחושבו אוטומטית
    plan = TradePlan(
        entry_price=data['entry_price'],
        stop_price=data['stop_price'],
        target_price=data['target_price']
    )
    
    db.add(plan)
    db.commit()
    
    return plan  # כולל stop_percentage ו-target_percentage מחושבים!
```

---

## 📊 השוואת פתרונות

| קריטריון | פתרון 1 (מחיר) | פתרון 2 (Type) | פתרון 3 (JSON) | פתרון 4 (Generated) ⭐ | פתרון 5 (View) |
|----------|----------------|----------------|----------------|----------------------|----------------|
| אין כפילות | ✅ | ✅ | ✅ | ✅ | ✅ |
| עקביות | ✅ | ✅ | ✅ | ✅✅ | ✅ |
| קלות שימוש | ⭐⭐⭐ | ⭐⭐ | ⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| ביצועים | ✅ | ✅ | ⚠️ | ✅✅ | ⚠️ |
| SQL queries | ✅ | ⚠️ | ❌ | ✅ | ✅ |
| גמישות | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| תחזוקה | ⭐⭐⭐ | ⭐⭐ | ⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |

---

## 🔧 תכנית מיגרציה

אם תבחר ב**פתרון 4** (מומלץ):

1. יצירת טבלה חדשה עם generated columns
2. העברת נתונים (רק המחירים)
3. עדכון המודלים
4. עדכון ה-API לתמוך בהזנת אחוזים (המרה למחיר)
5. מחיקת הטבלה הישנה

---

## 📝 סיכום

**המלצה סופית:** **פתרון 4 - Generated Columns**

**סיבות:**
1. ✅ אפס תחזוקה - אוטומטי לחלוטין
2. ✅ תמיד עקבי - לא יתכן מצב של אי-התאמה
3. ✅ שקוף - נראה כמו עמודות רגילות
4. ✅ ביצועים מעולים (VIRTUAL)
5. ✅ תואם SQL standard
6. ✅ קל ל-testing ו-debugging

**הערות:**
- במקום `current_price` - כדאי להשתמש ב-`entry_price` (יותר ברור)
- כל עדכון ל-`entry_price` יעדכן אוטומטית את האחוזים
- ה-frontend ממיר אחוז למחיר לפני שמירה
- ה-backend מחזיר את שני הערכים (מחיר + אחוז מחושב)

