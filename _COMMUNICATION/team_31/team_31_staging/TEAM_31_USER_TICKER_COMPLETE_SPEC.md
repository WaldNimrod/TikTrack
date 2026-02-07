# 📋 מפרט מלא - עמוד הטיקרים שלי (user_ticker)

**תאריך:** 2026-01-31  
**עמוד:** `user_ticker`  
**קובץ Blueprint:** `user_ticker_BLUEPRINT.html`  
**סטטוס:** ✅ **SPEC COMPLETE - READY FOR IMPLEMENTATION**  
**תבנית בסיס:** `tickers_BLUEPRINT.html` (שיצרנו בשלב 1)  
**Legacy File:** ❌ **לא קיים בלגסי** - צריך לשכפל ולהתאים מ-`tickers_BLUEPRINT.html`

**⚠️ כלל קריטי:** Blueprint = תבנית עיצובית בלבד עם מידע דמה. לא מתעסקים עם לוגיקה, API, או חישובים.

---

## 🎯 סקירה כללית

עמוד ניהול הטיקרים שלי - ניהול טיקרים הקשורים למשתמש הנוכחי בלבד.

**⚠️ כלל קריטי - Blueprint = תבנית עיצובית בלבד:**
- **מטרה:** יצירת ממשק מדויק ויזואלית ומבחינת CSS
- **מידע:** שימוש במידע דמה (mock data) בלבד
- **לא מתעסקים עם:**
  - מהיכן מגיע המידע (API, DB, JOINs)
  - איך המידע מחושב (חישובים, לוגיקה)
  - איך המידע נשמר (POST, PUT, DELETE)
- **רק עיצוב:** תבנית עיצובית מדויקת ונקייה בלבד

**⚠️ הערה חשובה:** עמוד זה **לא קיים בלגסי**. צריך לשכפל ולהתאים מ-`tickers_BLUEPRINT.html` שיצרנו בשלב 1.

---

## 📊 DB Schema - טבלת tickers

**מיקום:** `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql`

### **טבלה:** `market_data.tickers` (אותה טבלה כמו tickers)

```sql
CREATE TABLE market_data.tickers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol VARCHAR(20) NOT NULL,
    exchange_id UUID REFERENCES market_data.exchanges(id) ON DELETE SET NULL,
    company_name VARCHAR(255),
    ticker_type market_data.ticker_type NOT NULL DEFAULT 'STOCK',
    
    -- Static Metadata (NOT dynamic market data!)
    sector_id UUID REFERENCES market_data.sectors(id) ON DELETE SET NULL,
    industry_id UUID REFERENCES market_data.industries(id) ON DELETE SET NULL,
    market_cap_group_id UUID REFERENCES market_data.market_cap_groups(id) ON DELETE SET NULL,
    
    -- Identifiers
    cusip VARCHAR(9),
    isin VARCHAR(12),
    figi VARCHAR(12),
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    delisted_date DATE,
    
    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::JSONB,
    
    -- Constraints
    CONSTRAINT tickers_symbol_exchange_unique UNIQUE (symbol, exchange_id) WHERE deleted_at IS NULL
);
```

### **הבדל מ-tickers:**

- **אותה טבלה** - `market_data.tickers`
- **Filter לפי user_id** - רק טיקרים הקשורים למשתמש דרך:
  - `user_data.trades` (טיקרים שיש עליהם טריידים)
  - `user_data.watch_lists` (טיקרים ברשימת צפייה)
  - `user_data.alerts` (טיקרים שיש עליהם התראות)
  - `user_data.positions` (אם קיים)

---

## 📋 שדות לטבלה

### **שדות עיקריים:** (אותם שדות כמו tickers)

| שם שדה (DB) | שם שדה (API) | טיפוס | תיאור | הצגה בטבלה |
|-------------|--------------|-------|-------|------------|
| `id` | `id` | UUID | מזהה פנימי | ❌ לא מוצג |
| `symbol` | `symbol` | VARCHAR(20) | סמל הטיקר (AAPL, BTC) | ✅ עמודה ראשונה |
| `company_name` | `company_name` | VARCHAR(255) | שם החברה | ✅ עמודה שנייה |
| `ticker_type` | `ticker_type` | ENUM | סוג הטיקר (STOCK, CRYPTO, ETF) | ✅ Badge |
| `exchange_id` | `exchange` | UUID FK | בורסה | ✅ שם בורסה |
| `sector_id` | `sector` | UUID FK | סקטור | ✅ שם סקטור |
| `industry_id` | `industry` | UUID FK | תעשייה | ✅ שם תעשייה |
| `is_active` | `is_active` | BOOLEAN | פעיל/לא פעיל | ✅ Badge |
| `delisted_date` | `delisted_date` | DATE | תאריך הסרה | ✅ תאריך |
| `created_at` | `created_at` | TIMESTAMPTZ | תאריך יצירה | ✅ תאריך |
| `updated_at` | `updated_at` | TIMESTAMPTZ | תאריך עדכון | ✅ תאריך |

---

## 🎨 מבנה טבלה (עמודות) - מבוסס על tickers

**מקור:** `tickers_BLUEPRINT.html` (שיצרנו בשלב 1)

### **סדר עמודות:** (אותו סדר כמו tickers)

1. **שם הטיקר** (`col-name`) - `symbol` - Text, RTL
2. **מחיר נוכחי** (`col-price`) - `current_price` - Numeric, LTR (מטבלת ticker_prices)
3. **שינוי יומי** (`col-change`) - `daily_change` - Percentage, LTR (מחושב)
4. **נפח** (`col-volume`) - `volume` - Numeric, LTR (מטבלת ticker_prices)
5. **סטטוס** (`col-status`) - `is_active` - Badge (פעיל/לא פעיל)
6. **סוג** (`col-type`) - `ticker_type` - Badge (STOCK, CRYPTO, ETF, etc.)
7. **שם החברה** (`col-company`) - `company_name` - Text, RTL
8. **מטבע** (`col-currency`) - `currency` - Text (מטבלת exchanges או metadata)
9. **עודכן ב** (`col-updated`) - `updated_at` - Date, RTL
10. **פעולות** (`col-actions`) - Actions Menu (3 פעולות: צפה, ערוך, מחק)

### **⚠️ הערות חשובות:**

- **אותו מבנה כמו tickers** - צריך לשכפל מ-`tickers_BLUEPRINT.html`
- **הבדל עיקרי:** רק טיקרים הקשורים למשתמש הנוכחי
- **סדר העמודות** - אותו סדר כמו tickers

---

## 🔍 פילטרים

### **פילטרים:** (אותם פילטרים כמו tickers)

1. **פילטר חיפוש** (`search`)
   - שדה טקסט
   - חיפוש ב: `symbol`, `company_name`

2. **פילטר סוג טיקר** (`ticker_type`)
   - Dropdown
   - אפשרויות: כל הסוגים, STOCK, CRYPTO, ETF, OPTION, FUTURE, FOREX, INDEX

3. **פילטר בורסה** (`exchange`)
   - Dropdown
   - רשימת בורסות

4. **פילטר סקטור** (`sector`)
   - Dropdown
   - רשימת סקטורים

5. **פילטר תעשייה** (`industry`)
   - Dropdown
   - רשימת תעשיות

6. **פילטר סטטוס** (`is_active`)
   - Dropdown
   - אפשרויות: כל הסטטוסים, פעיל, לא פעיל

7. **פילטר תאריך** (`date_range`)
   - Date Range Picker
   - תאריך יצירה/עדכון

---

## ⚙️ פעולות (Actions) - מבוסס על tickers

### **פעולות Header:** (אותן פעולות כמו tickers)

1. **הוסף טיקר** (`ADD`) - `data-button-type="ADD"` - הוספת טיקר חדש לרשימה שלי
2. **רענון נתונים** (`REFRESH`) - `data-button-type="REFRESH"` - רענון נתונים חיצוניים עבור הטיקרים שלי
3. **הצג/הסתר** (`TOGGLE`) - `data-button-type="TOGGLE"` - הצגה/הסתרה של הסקשן

### **פעולות שורה (Row Actions):**

**לפי tickers:** `actions-3-items` - 3 פעולות:
1. **צפה** (`view`) - צפייה בפרטי טיקר
2. **ערוך** (`edit`) - עריכת טיקר
3. **מחק** (`delete`) - הסרת טיקר מהרשימה שלי (soft delete)

---

## 📐 מבנה HTML

### **בסיס:** `tickers_BLUEPRINT.html` (שיצרנו בשלב 1)

### **מבנה:** (אותו מבנה כמו tickers)

```html
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <!-- CSS Loading Order (CRITICAL) -->
  <!-- 1. Pico CSS -->
  <!-- 2. Phoenix Base Styles -->
  <!-- 3. LEGO Components -->
  <!-- 4. Header Component -->
  <!-- 5. Dashboard Styles -->
</head>
<body>
  <!-- Unified Header -->
  <header id="unified-header">
    <!-- Header Navigation -->
    <!-- Header Filters Row -->
  </header>
  
  <!-- Page Wrapper -->
  <div class="page-wrapper">
    <div class="page-container">
      <main>
        <tt-container>
          <!-- Top Section: Summary Stats -->
          <tt-section class="top-section">
            <info-summary>
              <!-- Summary Stats -->
            </info-summary>
          </tt-section>
          
          <!-- Main Section: User Tickers Table -->
          <tt-section>
            <phoenix-table id="user-tickers-table">
              <!-- Table Header -->
              <!-- Table Body -->
              <!-- Table Pagination -->
            </phoenix-table>
          </tt-section>
        </tt-container>
      </main>
    </div>
  </div>
</body>
</html>
```

---

## 🎨 CSS Classes

### **טבלה:** (אותן מחלקות כמו tickers)

- `phoenix-table` - טבלה ראשית
- `phoenix-table__header` - כותרת טבלה
- `phoenix-table__cell` - תא טבלה
- `phoenix-table__cell--numeric` - תא מספרי
- `phoenix-table-pagination` - חלוקה לעמודים

### **Badges:** (אותם בדג'ים כמו tickers)

- `badge` - Badge בסיסי
- `badge--success` - Badge ירוק (פעיל)
- `badge--danger` - Badge אדום (לא פעיל)
- `badge--info` - Badge כחול (סוג טיקר)

### **Actions:** (אותן פעולות כמו tickers)

- `table-actions-tooltip` - Actions Menu Container
- `table-actions-trigger` - Actions Button
- `table-action-btn` - Action Button
- `js-action-view` - View Action
- `js-action-edit` - Edit Action
- `js-action-delete` - Delete Action

---

## 📊 Summary Stats (מבוסס על tickers)

**מיקום:** `top-section` - לפני הטבלה

### **סטטיסטיקות:**

1. **סה"כ טיקרים שלי** - `totalTickers` - מספר כולל של טיקרים של המשתמש
2. **טיקרים פעילים** - `activeTickers` - מספר טיקרים פעילים (`is_active = TRUE`)
3. **מחיר ממוצע** - `averagePrice` - מחיר ממוצע של כל הטיקרים שלי (מטבלת ticker_prices)
4. **שינוי יומי** - `dailyChange` - שינוי יומי ממוצע (מחושב)

---

## 📝 הערות חשובות

### **1. שכפול מ-tickers:**
- **תבנית בסיס:** `tickers_BLUEPRINT.html` (שיצרנו בשלב 1)
- **הבדל עיקרי:** רק טיקרים הקשורים למשתמש הנוכחי
- **כותרות:** "הטיקרים שלי" במקום "טיקרים"

### **2. Filter לפי user_id:**
- רק טיקרים הקשורים למשתמש דרך:
  - `user_data.trades` (טיקרים שיש עליהם טריידים)
  - `user_data.watch_lists` (טיקרים ברשימת צפייה)
  - `user_data.alerts` (טיקרים שיש עליהם התראות)
  - `user_data.positions` (אם קיים)

### **3. Naming Conventions:**
- שמות שדות: plural names only (e.g., `tickers`, לא `ticker`)
- External IDs: ULID strings only
- שמות קבצים: `user_ticker_BLUEPRINT.html` (לא `D05_USER_TICKER.html`)

### **4. RTL Alignment:**
- כל הטקסטים מיושרים ל-RTL
- מספרים ומחירים: LTR
- תאריכים: RTL

### **5. פילטרים:**
- פילטרים סטנדרטיים כמו ב-tickers
- מיקום: Header Filters Row (unified-header)

### **6. תבנית בסיסית:**
- להשתמש ב-`tickers_BLUEPRINT.html` כתבנית
- לשמור על מבנה HTML זהה
- לשמור על מחלקות CSS זהה
- לשנות רק כותרות וטקסטים ("הטיקרים שלי" במקום "טיקרים")

### **7. מבנה:**
- **Top Section:** Summary Stats + Active Alerts Component
- **Main Section:** טבלת טיקרים שלי + פעולות
- **Header Actions:** הוסף טיקר, רענון נתונים, הצג/הסתר

---

## ✅ Checklist לפני התחלה

- [x] בדיקת DB Schema - טבלת tickers ושדות
- [x] בדיקת תבנית בסיס (`tickers_BLUEPRINT.html`)
- [x] תכנון שכפול והתאמה
- [x] תכנון סדר עמודות (אותו סדר כמו tickers)
- [x] תכנון פילטרים (אותם פילטרים כמו tickers)
- [x] תכנון פעולות (אותן פעולות כמו tickers)
- [ ] אישור מהמשתמש

---

**Team 31 (Blueprint)**  
**Date:** 2026-01-31  
**Status:** 📋 **SPEC READY - ממתין לאישור**
