# מיפוי כתובות לעמודים - TikTrack

**תאריך יצירה:** 28 בינואר 2025  
**גרסה:** 1.0.0

---

## 📋 סקירה כללית

מסמך זה מסביר איך המערכת ממפה כתובות (URLs) לעמודים, בלי שימוש ב-`.html` ובלי `/trading-ui/` בכתובת.

---

## 🌐 מבנה הכתובות

### פורמט נכון

✅ **נכון (as-made):**

```
http://localhost:8080/ai_analysis
http://localhost:8080/trades
http://localhost:8080/preferences
```

❌ **לא נכון (legacy/לא מומלץ):**

```
http://localhost:8080/trading-ui/ai_analysis.html
http://localhost:8080/ai_analysis
http://localhost:8080/trading-ui/trades.html
```

---

## 🔧 איך זה עובד

### 1. Routes ספציפיים

**קובץ:** `Backend/routes/pages.py`

כל עמוד יכול להיות רשום עם route ספציפי:

```python
@pages_bp.route('/ai_analysis')
def ai_analysis() -> Any:
    """AI Analysis page"""
    return send_from_directory(UI_DIR, "ai_analysis.html")
```

**יתרונות:**

- שליטה מלאה על הכתובת
- אפשרות להוסיף לוגיקה נוספת
- תיעוד ברור

### 2. Catch-all Route

אם אין route ספציפי, ה-catch-all route מטפל בזה:

```python
@pages_bp.route('/<path:filename>')
def static_files(filename: str) -> Any:
    """Static files"""
    # If file doesn't contain extension, try adding .html
    if '.' not in filename:
        html_file = f"{filename}.html"
        html_path = UI_DIR / html_file
        if html_path.exists():
            return send_from_directory(UI_DIR, html_file)
    # ...
```

**איך זה עובד:**

1. המשתמש נכנס ל-`/trade_plans`
2. המערכת בודקת אם יש route ספציפי
3. אם לא, ה-catch-all route מוסיף `.html` אוטומטית
4. המערכת מחפשת `trade_plans.html` ב-`trading-ui/`
5. אם הקובץ קיים, הוא נשלח

---

## 📝 הוספת עמוד חדש

### שלב 1: צור את קובץ ה-HTML

צור את הקובץ ב-`trading-ui/`:

```bash
trading-ui/trade_plans.html
```

### שלב 2: הוסף Route (מומלץ)

**קובץ:** `Backend/routes/pages.py`

הוסף לפני ה-catch-all route:

```python
@pages_bp.route('/trade_plans')
def my_new_page() -> Any:
    """My new page description"""
    return send_from_directory(UI_DIR, "trade_plans.html")
```

**מיקום:** הוסף אחרי ה-routes הקיימים, לפני ה-catch-all route (שורה 196).

### שלב 3: בדוק

העמוד יהיה נגיש ב:

```
http://localhost:8080/trade_plans
```

---

## 📋 רשימת Routes קיימים

### עמודים מרכזיים (as-made)

- `/` → `index.html` (דשבורד)
- `/trades` → `trades.html`
- `/trade_plans` → `trade_plans.html`
- `/accounts` → `trading_accounts.html`
- `/alerts` → `alerts.html`
- `/notes` → `notes.html`
- `/tickers` → `tickers.html`
- `/executions` → `executions.html`
- `/preferences` → `preferences.html`
- `/ai_analysis` → `ai_analysis.html`
- `/watch_lists` → `watch_lists.html`
- `/user_profile` → `user_profile.html`
- `/ticker_dashboard` → `ticker_dashboard.html`
- `/trading_journal` → `trading_journal.html`
- `/trade_history` → `trade_history.html`
- `/portfolio_state` → `portfolio_state.html`
- `/data_import` → `data_import.html`
- `/tag_management` → `tag_management.html`

### עמודים טכניים (נפוצים)

- `/db_display` → `db_display.html`
- `/db_extradata` → `db_extradata.html`
- `/designs` → `designs.html`
- `/constraints` → `constraints.html`
- `/external_data_dashboard` → `external_data_dashboard.html`
- `/chart_management` → `chart_management.html`

### עמודים נוספים

- `/strategy-analysis` → `strategy_analysis.html`
- `/trade_plans` → `trade_plans.html`

---

## 🔍 איך למצוא Route של עמוד

### דרך 1: חיפוש בקוד

```bash
rg -n "trade_plans.html" Backend/routes/pages.py
```

### דרך 2: בדיקת Catch-all

אם אין route ספציפי, העמוד נגיש דרך catch-all:

```
http://localhost:8080/trade_plans
```

המערכת תחפש אוטומטית `trade_plans.html` ב-`trading-ui/`.

---

## ⚠️ כללים חשובים

### 1. סדר Routes

**חשוב:** ה-catch-all route (`@pages_bp.route('/<path:filename>')`) חייב להיות **אחרון**!

אם תשים אותו לפני routes ספציפיים, הוא ייתפוס את כל הבקשות.

### 2. שמות קבצים

- השתמש ב-`snake_case` לשמות קבצים וכתובות דפדפן: `ai_analysis.html`, `user_profile.html`
- הימנע מ-`camelCase`: `aiAnalysis.html` (לא מומלץ)
- קיימים קבצי legacy ב-`kebab-case` (למשל `trade_history.html`) ויש להמירם במסגרת מיגרציית שמות ייעודית

### 3. Routes חסומים

יש routes חסומים ב-catch-all:

```python
# Block access to deprecated routes
if filename in ['linter-dashboard-demo', 'create_linter_dashboard']:
    abort(404)
```

---

## ⚠️ כללים חד-משמעיים (CRITICAL)

### ✅ חובה: Snake Case בלבד

כל URLs במערכת חייבים להיות ב-**snake_case** (קו תחתון), לא kebab-case:

```bash
✅ נכון: http://localhost:8080/trade_plans
✅ נכון: http://localhost:8080/ai_analysis
✅ נכון: http://localhost:8080/user_management

❌ אסור: http://localhost:8080/trade-plans
❌ אסור: http://localhost:8080/ai-analysis
❌ אסור: http://localhost:8080/user-management
```

### ❌ אסור: .html בקישורי מערכת

**.html אסור לחלוטין** בקישורי מערכת ובדיקות:

```bash
✅ נכון: http://localhost:8080/trades
✅ נכון: http://localhost:8080/preferences

❌ אסור: http://localhost:8080/trades.html
❌ אסור: http://localhost:8080/preferences.html
❌ אסור: http://localhost:8080/trading-ui/trades.html
```

### 📋 רשימות חריגים

**חריגים מותרים רק אם רשומים ברשימות הרשמיות:**

- **חריגים זמניים:** `documentation/02-ARCHITECTURE/FRONTEND/KEBAB_CASE_EXCEPTIONS.md`
- **חריגים קבועים:** `documentation/02-ARCHITECTURE/FRONTEND/PERMANENT_EXCEPTIONS.md`
- **רשימת עמודים:** `documentation/PAGES_LIST.md`

**כל חריג חדש דורש אישור Team 0 + תיעוד ברשימה הרלוונטית.**

---

## 🔗 קישורים רלוונטיים

- [Backend/routes/pages.py](../../Backend/routes/pages.py) - קובץ ה-routes
- [Quick Start Guide](./QUICK_START.md) - מדריך התחלה מהירה

---

## 📝 דוגמאות

### דוגמה 1: עמוד עם Route ספציפי

```python
# Backend/routes/pages.py
@pages_bp.route('/ai_analysis')
def ai_analysis() -> Any:
    """AI Analysis page"""
    return send_from_directory(UI_DIR, "ai_analysis.html")
```

**גישה:** `http://localhost:8080/ai_analysis`

### דוגמה 2: עמוד דרך Catch-all

אם יש קובץ `trading-ui/trade_plans.html` אבל אין route ספציפי:

**גישה:** `http://localhost:8080/trade_plans`

המערכת תמצא את הקובץ אוטומטית.

---

## 🔧 מקור אמת יחיד ל-Payloads (CRITICAL)

### מדוע מקור אמת יחיד

**בעיה קודמת:** פיצול payloads בין קבצים שונים גרם לחוסר עקביות ולבאגים:

- `generateTestData()` בדשבורד
- `payloads` בקבצי Python
- `test data` ב-scripts שונים
- כל אחד עם לוגיקה שונה

**פתרון:** מקור אמת יחיד = `crud_testing_dashboard.js` (כולל Field Maps)

### מה זה כולל

#### 1. **Field Mappings (חובה)**

```javascript
// crud_testing_dashboard.js - מקור אמת יחיד
const FIELD_MAPPINGS = {
  trade_plan: {
    required: ['trading_account_id', 'ticker_id', 'side', 'investment_type'],
    optional: ['notes', 'quantity', 'entry_price'],
    dates: ['created_at', 'updated_at'], // חובה למלא
    relations: ['trading_account_id', 'ticker_id'] // IDs דינמיים בלבד
  }
};
```

#### 2. **Test Data Generation (חובה)**

```javascript
// crud_testing_dashboard.js - מקור אמת יחיד
async function generateTestData(entityName) {
  const userAccounts = await fetch('/api/trading_accounts').then(r => r.json());
  const userTickers = await fetch('/api/tickers').then(r => r.json());

  return {
    trading_account_id: userAccounts[0].id, // דינמי
    ticker_id: userTickers[0].id, // דינמי
    side: 'Long',
    investment_type: 'stocks',
    created_at: new Date().toISOString(), // חובה
    updated_at: new Date().toISOString()  // חובה
  };
}
```

#### 3. **Validation Rules (חובה)**

```javascript
// crud_testing_dashboard.js - מקור אמת יחיד
const VALIDATION_RULES = {
  trade_plan: {
    trading_account_id: { required: true, type: 'number', dynamic: true },
    ticker_id: { required: true, type: 'number', dynamic: true },
    side: { required: true, enum: ['Long', 'Short'] },
    investment_type: { required: true, enum: ['stocks', 'options'] }
  }
};
```

### כללים חד-משמעיים

#### ✅ חובה: טיקרים חוקיים בלבד

```javascript
const VALID_TICKERS = ['PLTR', 'AAPL', 'TSLA', 'MSFT', 'QQQ'];
```

#### ✅ חובה: מילוי כל שדות התאריך

```javascript
// לא להסתמך על default - למלא במפורש
const payload = {
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  date: new Date().toISOString().split('T')[0] // YYYY-MM-DD
};
```

#### ✅ חובה: IDs דינמיים בלבד

```javascript
// ❌ אסור: hardcoded IDs
trading_account_id: 1

// ✅ נכון: dynamic lookup
const accounts = await fetchUserAccounts();
trading_account_id: accounts[0].id
```

### תהליך עדכון

#### 1. **עדכון Field Maps**

הוסף/שנה רק ב-`crud_testing_dashboard.js`

#### 2. **עדכון Test Data**

שנה רק את `generateTestData()` function

#### 3. **עדכון Validation**

שנה רק את `VALIDATION_RULES` object

#### 4. **איחוד עם קבצים אחרים**

כל קבצי Python/JavaScript אחרים חייבים להשתמש בנתונים מהדשבורד

### QA Procedures - עדכון

#### 🔄 QA רץ רק אחרי איחוד payloads + אימות constraints

```bash
# תהליך QA חדש:
1. איחוד payloads ב-crud_testing_dashboard.js
2. אימות constraints (required fields, valid enums)
3. הרצת QA עם Logger בלבד
```

#### 📊 ריצות מתועדות בלוגר בלבד (לא console)

```javascript
// ✅ נכון: Logger evidence
window.Logger.info("CRUD Test Started", {
  entity: entityName,
  payload: testPayload,
  timestamp: new Date().toISOString()
});

// ❌ אסור: console logging
console.log("Test started", payload);
```

### למה זה חשוב

1. **עקביות:** פחות באגים מ-duplication
2. **תחזוקה:** שינוי במקום אחד בלבד
3. **דיוק:** נתוני בדיקה מייצגים מציאות
4. **אמינות:** QA מבוסס על נתונים תקינים

---

**עודכן:** 30 בדצמבר 2025
