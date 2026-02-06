# 📋 מפרט מלא - עמוד ניהול טיקרים (tickers)

**תאריך:** 2026-01-31  
**עמוד:** `tickers`  
**קובץ Blueprint:** `tickers_BLUEPRINT.html`  
**סטטוס:** ✅ **SPEC COMPLETE - READY FOR IMPLEMENTATION**  
**Legacy File:** `/Users/nimrod/Documents/TikTrack/TikTrackApp/trading-ui/tickers.html`  
**Legacy Directory:** `/Users/nimrod/Documents/TikTrack/TikTrackApp/trading-ui/` (כל קבצי ה-Legacy כולל HTML, CSS, JS)

**⚠️ כלל קריטי:** Blueprint = תבנית עיצובית בלבד עם מידע דמה. לא מתעסקים עם לוגיקה, API, או חישובים.

---

## 🎯 סקירה כללית

עמוד ניהול טיקרים - ניהול טיקרים במערכת.

**⚠️ כלל קריטי - Blueprint = תבנית עיצובית בלבד:**
- **מטרה:** יצירת ממשק מדויק ויזואלית ומבחינת CSS
- **מידע:** שימוש במידע דמה (mock data) בלבד
- **לא מתעסקים עם:**
  - מהיכן מגיע המידע (API, DB, JOINs)
  - איך המידע מחושב (חישובים, לוגיקה)
  - איך המידע נשמר (POST, PUT, DELETE)
- **רק עיצוב:** תבנית עיצובית מדויקת ונקייה בלבד

---

## 📊 DB Schema - טבלת tickers

**מיקום:** `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql`

### **טבלה:** `market_data.tickers`

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

### **ENUM:** `market_data.ticker_type`

```sql
CREATE TYPE market_data.ticker_type AS ENUM (
    'STOCK', 
    'ETF', 
    'OPTION', 
    'FUTURE', 
    'FOREX', 
    'CRYPTO', 
    'INDEX'
);
```

---

## 📋 שדות לטבלה

### **שדות עיקריים:**

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
| `cusip` | `cusip` | VARCHAR(9) | CUSIP | ⚠️ אופציונלי |
| `isin` | `isin` | VARCHAR(12) | ISIN | ⚠️ אופציונלי |
| `figi` | `figi` | VARCHAR(12) | FIGI | ⚠️ אופציונלי |
| `created_at` | `created_at` | TIMESTAMPTZ | תאריך יצירה | ✅ תאריך |
| `updated_at` | `updated_at` | TIMESTAMPTZ | תאריך עדכון | ✅ תאריך |

### **שדות מ-Field Map (WP_20_09):**

| שם שדה | טיפוס פנימי | טיפוס חיצוני | הגדרות לוגיות |
| :--- | :--- | :--- | :--- |
| `internal_ids` | `BIGINT (PK)` | `N/A` | PK פנימי |
| `external_ulids` | `VARCHAR(26)` | `ULID` | מזהה API חיצוני |
| `ticker_symbols` | `VARCHAR(20)` | `String` | למשל: AAPL, BTC |
| `provider_mapping_data` | `JSONB` | `Object` | מיפוי לספקים (Yahoo, IBKR) |
| `asset_type_enums` | `VARCHAR(50)` | `Enum` | STOCK, CRYPTO, ETF |
| `is_active_flags` | `BOOLEAN` | `Boolean` | זמינות למסחר |

---

## 🎨 מבנה טבלה (עמודות) - לפי Legacy

**מקור:** `/Users/nimrod/Documents/TikTrack/TikTrackApp/trading-ui/tickers.html`

### **סדר עמודות לפי Legacy:**

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

- **מחיר נוכחי, שינוי יומי, נפח** - שדות דינמיים מ-`market_data.ticker_prices` (לא מטבלת tickers!)
- **מטבע** - לא קיים ישירות בטבלת tickers, צריך לבדוק אם זה מ-exchange או metadata
- **סדר העמודות** - לפי Legacy בדיוק

### **עמודות אופציונליות (להצגה מותנית):**

- `cusip` - CUSIP
- `isin` - ISIN
- `figi` - FIGI
- `created_at` - תאריך יצירה

---

## 🔍 פילטרים

### **פילטרים לפי Legacy:**

**⚠️ הערה:** ב-Legacy לא רואים פילטרים ספציפיים בעמוד, אבל יש Header System שיכול להכיל פילטרים גלובליים.

### **פילטרים סטנדרטיים (כמו D16, D18, D21):**

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

## ⚙️ פעולות (Actions) - לפי Legacy

### **פעולות Header (לפי Legacy):**

1. **הוסף טיקר** (`ADD`) - `data-button-type="ADD"` - הוספת טיקר חדש
2. **רענון נתונים** (`REFRESH`) - `data-button-type="REFRESH"` - רענון נתונים חיצוניים עבור כל הטיקרים
3. **הצג/הסתר** (`TOGGLE`) - `data-button-type="TOGGLE"` - הצגה/הסתרה של הסקשן

### **פעולות שורה (Row Actions):**

**לפי Legacy:** `actions-3-items` - 3 פעולות:
1. **צפה** (`view`) - צפייה בפרטי טיקר
2. **ערוך** (`edit`) - עריכת טיקר
3. **מחק** (`delete`) - מחיקת טיקר (soft delete)

### **פעולות Bulk (אם נדרש):**

- הפעל/השבת טיקרים מרובים
- מחיקה מרובה

---

## 📐 מבנה HTML

### **בסיס:** `D16_ACCTS_VIEW.html` (trading_accounts)

### **מבנה:**

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
          <!-- Table Section -->
          <tt-section>
            <phoenix-table id="tickers-table">
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

### **טבלה:**

- `phoenix-table` - טבלה ראשית
- `phoenix-table__header` - כותרת טבלה
- `phoenix-table__cell` - תא טבלה
- `phoenix-table__cell--numeric` - תא מספרי
- `phoenix-table-pagination` - חלוקה לעמודים

### **Badges:**

- `badge` - Badge בסיסי
- `badge--success` - Badge ירוק (פעיל)
- `badge--danger` - Badge אדום (לא פעיל)
- `badge--info` - Badge כחול (סוג טיקר)

### **Actions:**

- `table-actions-tooltip` - Actions Menu Container
- `table-actions-trigger` - Actions Button
- `table-action-btn` - Action Button
- `js-action-view` - View Action
- `js-action-edit` - Edit Action
- `js-action-delete` - Delete Action

---

## 📡 API Endpoints (לבדיקה - למטרות תיעוד בלבד)

### **Endpoints נדרשים (למטרות תיעוד בלבד):**

- `GET /api/tickers` - רשימת טיקרים
- `GET /api/tickers/{id}` - פרטי טיקר
- `POST /api/tickers` - יצירת טיקר חדש
- `PUT /api/tickers/{id}` - עדכון טיקר
- `DELETE /api/tickers/{id}` - מחיקת טיקר

**⚠️ הערה חשובה:** אנחנו לא מתעסקים עם API endpoints בפועל - רק מציגים מידע דמה בבלופרינט. ה-endpoints כאן למטרות תיעוד בלבד.

---

## 📊 Summary Stats (לפי Legacy)

**מיקום:** `top-section` - לפני הטבלה

### **סטטיסטיקות:**

1. **סה"כ טיקרים** - `totalTickers` - מספר כולל של טיקרים
2. **טיקרים פעילים** - `activeTickers` - מספר טיקרים פעילים (`is_active = TRUE`)
3. **מחיר ממוצע** - `averagePrice` - מחיר ממוצע של כל הטיקרים (מטבלת ticker_prices)
4. **שינוי יומי** - `dailyChange` - שינוי יומי ממוצע (מחושב)

---

## 📝 הערות חשובות

### **1. Static Metadata + Dynamic Data:**
- הטבלה מכילה מטא-דאטה סטטית מ-`market_data.tickers`
- **אבל:** מחירים, שינוי יומי, נפח - שדות דינמיים מ-`market_data.ticker_prices`
- **⚠️ חשוב - Blueprint בלבד:** אנחנו לא מתעסקים עם JOINs או חישובים - רק מציגים מידע דמה בטבלה

### **2. Naming Conventions:**
- שמות שדות: plural names only (e.g., `tickers`, לא `ticker`)
- External IDs: ULID strings only
- שמות קבצים: `tickers_BLUEPRINT.html` (לא `D05_TICKERS.html`)

### **3. RTL Alignment:**
- כל הטקסטים מיושרים ל-RTL
- מספרים ומחירים: LTR
- תאריכים: RTL

### **4. פילטרים:**
- פילטרים סטנדרטיים כמו ב-D16, D18, D21
- מיקום: Header Filters Row (unified-header)

### **5. תבנית בסיסית:**
- להשתמש ב-`D16_ACCTS_VIEW.html` כתבנית
- לשמור על מבנה HTML זהה
- לשמור על מחלקות CSS זהה

### **6. מבנה Legacy:**
- **Top Section:** Summary Stats + Active Alerts
- **Main Section:** טבלת טיקרים + פעולות
- **Header Actions:** הוסף טיקר, רענון נתונים, הצג/הסתר

### **7. שדות דינמיים:**
- `current_price` - מ-`market_data.ticker_prices` או `latest_ticker_prices`
- `daily_change` - מחושב מ-`ticker_prices` (שינוי יומי)
- `volume` - מ-`market_data.ticker_prices`
- `currency` - צריך לבדוק אם זה מ-exchange או metadata

---

## ✅ Checklist לפני התחלה

- [ ] בדיקת OpenAPI Spec - endpoints ושדות מדויקים
- [ ] בדיקת קובץ Legacy (אם קיים)
- [ ] השוואת DB Schema vs Field Map
- [ ] תכנון סדר עמודות
- [ ] תכנון פילטרים
- [ ] תכנון פעולות
- [ ] אישור מהמשתמש

---

**Team 31 (Blueprint)**  
**Date:** 2026-01-31  
**Status:** 📋 **SPEC READY - ממתין לאישור**
