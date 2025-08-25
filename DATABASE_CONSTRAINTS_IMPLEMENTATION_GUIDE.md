# 🛡️ מדריך מימוש הגנה על שדות בבסיס הנתונים - TikTrack

## 📋 מטרה מרכזית
יצירת מערכת הגנה מקיפה על שדות בבסיס הנתונים באמצעות:
1. **אילוצי בסיס נתונים** (Database Constraints)
2. **טבלת ניהול אילוצים דינמית** (Dynamic Constraints Management)
3. **ולידציה ברמת API**
4. **ולידציה ברמת Frontend**

## 🎯 הישגים שהושגו עד כה

> **📄 תיעוד מפורט**: ראה קובץ `FIELD_NAMES_UPDATE_STATUS.md` לפרטים מלאים על השלבים שהושלמו

### ✅ עדכון אילוץ שם החברה בטיקרים (חדש - 25 באוגוסט 2025)
- [x] **עדכון אילוץ מ-12 ל-25 תווים**: `LENGTH(name) <= 25`
- [x] **מיגרציה בסיס נתונים**: עדכון טבלה ל-`VARCHAR(25) NOT NULL`
- [x] **עדכון Backend**: מודל ושירות עודכנו ל-25 תווים
- [x] **עדכון Frontend**: ולידציה JavaScript עודכנה ל-25 תווים
- [x] **בדיקות**: הוספת טיקר עם 25 תווים עובדת, ולידציה של 26 תווים נכשלת

### ✅ Phase 1: הכנה ותכנון
- [x] **ניתוח המצב הקיים**: זיהוי שדות שדורשים הגנה
- [x] **תכנון ארכיטקטורה**: מערכת אילוצים דינמית
- [x] **תיעוד דרישות**: הגדרת סוגי האילוצים הנדרשים

### ✅ Phase 2: סטנדרטיזציה של שמות שדות
- [x] **שינוי `trades.type` ל-`trades.investment_type`**
- [x] **עדכון Backend**: מודלים, API, שירותים
- [x] **עדכון Frontend**: JavaScript, HTML
- [x] **תאימות לאחור**: API תומך בשני השמות

### ✅ Phase 3: ניקוי נתונים
- [x] **הסרת רשומות כפולות**: ניקוי בטבלת `trades`
- [x] **אימות ערכים**: וידוא ערכי `investment_type` תקינים
- [x] **בדיקת יושרה**: וידוא קשרי מפתחות זרים

## 🏗️ ארכיטקטורת המערכת המתוכננת

### 📊 טבלאות ניהול אילוצים

#### 1. טבלת `constraints`
```sql
CREATE TABLE constraints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name VARCHAR(50) NOT NULL,
    column_name VARCHAR(50) NOT NULL,
    constraint_type VARCHAR(20) NOT NULL, -- 'CHECK', 'NOT_NULL', 'UNIQUE', 'FOREIGN_KEY'
    constraint_name VARCHAR(100) NOT NULL,
    constraint_definition TEXT NOT NULL,
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. טבלת `enum_values`
```sql
CREATE TABLE enum_values (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    constraint_id INTEGER NOT NULL,
    value VARCHAR(50) NOT NULL,
    display_name VARCHAR(100),
    is_active BOOLEAN DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    FOREIGN KEY (constraint_id) REFERENCES constraints(id)
);
```

#### 3. טבלת `constraint_validations`
```sql
CREATE TABLE constraint_validations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    constraint_id INTEGER NOT NULL,
    validation_type VARCHAR(20) NOT NULL, -- 'REGEX', 'RANGE', 'LENGTH', 'CUSTOM'
    validation_rule TEXT NOT NULL,
    error_message TEXT,
    is_active BOOLEAN DEFAULT 1,
    FOREIGN KEY (constraint_id) REFERENCES constraints(id)
);
```

## 📝 סוגי האילוצים המתוכננים

### 🔒 אילוצי CHECK
```sql
-- דוגמה: הגבלת ערכי investment_type
INSERT INTO constraints (table_name, column_name, constraint_type, constraint_name, constraint_definition)
VALUES ('trades', 'investment_type', 'CHECK', 'valid_investment_type', 
        'investment_type IN (''swing'', ''investment'', ''passive'')');
```

### 📋 אילוצי ENUM דינמיים
```sql
-- הגדרת ערכים מותרים
INSERT INTO enum_values (constraint_id, value, display_name, sort_order) VALUES
(1, 'swing', 'סווינג', 1),
(1, 'investment', 'השקעה', 2),
(1, 'passive', 'פאסיבי', 3);
```

### 🔗 אילוצי NOT NULL
```sql
-- דוגמה: שדות חובה
INSERT INTO constraints (table_name, column_name, constraint_type, constraint_name, constraint_definition)
VALUES ('trades', 'account_id', 'NOT_NULL', 'account_required', 'account_id IS NOT NULL');
```

### 🔑 אילוצי UNIQUE
```sql
-- דוגמה: מניעת כפילויות
INSERT INTO constraints (table_name, column_name, constraint_type, constraint_name, constraint_definition)
VALUES ('tickers', 'symbol', 'UNIQUE', 'unique_ticker_symbol', 'UNIQUE(symbol)');
```

## 🚀 שלבים לביצוע בהמשך

> **⚠️ דרישות מוקדמות**: לפני התחלת Phase 4, יש לוודא שהושלמו כל הבדיקות מ-Phase 6 בקובץ `FIELD_NAMES_UPDATE_STATUS.md`

### Phase 4: יצירת טבלאות ניהול אילוצים
```bash
# 1. יצירת סקריפט מיגרציה
python3 Backend/migrations/create_constraints_tables.py

# 2. הגדרת אילוצים בסיסיים
python3 Backend/migrations/insert_basic_constraints.py

# 3. בדיקת הטבלאות
sqlite3 Backend/db/simpleTrade_new.db ".schema constraints"
```

### Phase 5: מימוש שירות ניהול אילוצים
```python
# Backend/services/constraint_service.py
class ConstraintService:
    def get_constraints_for_table(self, table_name: str) -> List[Dict]
    def validate_field_value(self, table_name: str, column_name: str, value: Any) -> bool
    def get_enum_values(self, table_name: str, column_name: str) -> List[str]
    def add_constraint(self, constraint_data: Dict) -> bool
    def update_constraint(self, constraint_id: int, constraint_data: Dict) -> bool
    def delete_constraint(self, constraint_id: int) -> bool
```

### Phase 6: עדכון API
```python
# Backend/routes/api/constraints.py
@app.route('/api/v1/constraints/', methods=['GET'])
def get_constraints():
    # החזרת כל האילוצים

@app.route('/api/v1/constraints/validate', methods=['POST'])
def validate_field():
    # ולידציה של שדה בודד

@app.route('/api/v1/constraints/enum/<table>/<column>', methods=['GET'])
def get_enum_values(table, column):
    # החזרת ערכי ENUM
```

### Phase 7: עדכון Frontend
```javascript
// trading-ui/scripts/constraint-manager.js
class ConstraintManager {
    async loadConstraints(tableName) { }
    async validateField(tableName, columnName, value) { }
    async getEnumValues(tableName, columnName) { }
    async updateConstraint(constraintId, data) { }
}
```

### Phase 8: ממשק ניהול אילוצים
```html
<!-- trading-ui/constraints.html -->
<div class="constraints-management">
    <div class="constraints-list">
        <!-- רשימת אילוצים קיימים -->
    </div>
    <div class="constraint-editor">
        <!-- עורך אילוצים -->
    </div>
</div>
```

## 🎯 רשימת שדות שדורשים הגנה

### 📊 טבלת `trades`
| שדה | סוג הגנה | ערכים מותרים/חוקים |
|------|-----------|-------------------|
| `investment_type` | ENUM | 'swing', 'investment', 'passive' |
| `status` | ENUM | 'open', 'closed', 'cancelled' |
| `side` | ENUM | 'Long', 'Short' |
| `account_id` | NOT NULL + FOREIGN KEY | חייב להיות קיים ב-`accounts` |
| `ticker_id` | NOT NULL + FOREIGN KEY | חייב להיות קיים ב-`tickers` |
| `created_at` | NOT NULL + DEFAULT | CURRENT_TIMESTAMP |

### 📊 טבלת `trade_plans`
| שדה | סוג הגנה | ערכים מותרים/חוקים |
|------|-----------|-------------------|
| `investment_type` | ENUM | 'swing', 'investment', 'passive' |
| `side` | ENUM | 'Long', 'Short' |
| `planned_amount` | RANGE | > 0 |
| `target_price` | RANGE | > 0 |
| `stop_price` | RANGE | > 0 |

### 📊 טבלת `alerts`
| שדה | סוג הגנה | ערכים מותרים/חוקים |
|------|-----------|-------------------|
| `is_triggered` | ENUM | 'new', 'true', 'false' |
| `alert_type` | ENUM | 'price', 'time', 'custom' |
| `condition_type` | ENUM | 'above', 'below', 'equals' |

### 📊 טבלת `accounts`
| שדה | סוג הגנה | ערכים מותרים/חוקים |
|------|-----------|-------------------|
| `status` | ENUM | 'active', 'inactive', 'suspended' |
| `currency_id` | FOREIGN KEY | חייב להיות קיים ב-`currencies` |

## 🛠️ כלים לבדיקה וניהול

### בדיקת אילוצים
```bash
# בדיקת אילוצים בטבלה
curl -X GET "http://localhost:8080/api/v1/constraints/table/trades"

# ולידציה של ערך
curl -X POST "http://localhost:8080/api/v1/constraints/validate" \
  -H "Content-Type: application/json" \
  -d '{"table": "trades", "column": "investment_type", "value": "swing"}'
```

### ניהול אילוצים
```bash
# הוספת אילוץ חדש
curl -X POST "http://localhost:8080/api/v1/constraints/" \
  -H "Content-Type: application/json" \
  -d '{"table_name": "trades", "column_name": "investment_type", "constraint_type": "ENUM", "values": ["swing", "investment", "passive"]}'

# עדכון אילוץ קיים
curl -X PUT "http://localhost:8080/api/v1/constraints/1" \
  -H "Content-Type: application/json" \
  -d '{"is_active": false}'
```

## 📚 דוקומנטציה נוספת

### 📁 קבצי מיגרציה נדרשים
1. `Backend/migrations/create_constraints_tables.py` - יצירת טבלאות ניהול אילוצים
2. `Backend/migrations/insert_basic_constraints.py` - הוספת אילוצים בסיסיים
3. `Backend/migrations/update_existing_data.py` - עדכון נתונים קיימים

### 🔧 קבצי שירות נדרשים
1. `Backend/services/constraint_service.py` - שירות ניהול אילוצים
2. `Backend/routes/api/constraints.py` - נתיבי API לאילוצים
3. `trading-ui/scripts/constraint-manager.js` - ניהול אילוצים בצד לקוח

### 🎨 קבצי ממשק נדרשים
1. `trading-ui/constraints.html` - דף ניהול אילוצים
2. `trading-ui/styles/constraints.css` - עיצוב לדף האילוצים

### 🔗 קישורים לקבצים קיימים
- `Backend/migrations/update_trades_type_field.py` - המיגרציה שכבר בוצעה
- `FIELD_NAMES_UPDATE_STATUS.md` - תיעוד השלבים שהושלמו

## 🎯 הצלחה מוגדרת
המערכת תחשב להצלחה כאשר:
1. ✅ כל השדות מוגנים באילוצים מתאימים
2. ✅ ניתן לנהל אילוצים דרך הממשק
3. ✅ ולידציה פועלת ברמת API ו-Frontend
4. ✅ המערכת יציבה ומוכנה לשימוש יומיומי
5. ✅ הדוקומנטציה מלאה ומעודכנת

## 📋 רשימת בדיקה לפני התחלה
- [ ] הושלמו כל הבדיקות מ-`FIELD_NAMES_UPDATE_STATUS.md`
- [ ] השרת פועל תקין עם הקוד המעודכן
- [ ] בסיס הנתונים מכיל את השדה `investment_type`
- [ ] כל דפי הממשק עובדים ללא שגיאות

---
**נוצר בתאריך**: 2025-01-27  
**עודכן בתאריך**: 2025-01-27  
**סטטוס**: Phase 3 הושלם, מוכן ל-Phase 4  
**תלות**: השלמת בדיקות מ-`FIELD_NAMES_UPDATE_STATUS.md`  
**הערה**: התהליך מתבצע בשלבים עם בדיקות בין כל שלב
