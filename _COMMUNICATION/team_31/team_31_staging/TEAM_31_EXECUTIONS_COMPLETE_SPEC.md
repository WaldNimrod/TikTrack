# 📋 מפרט מלא - עמוד ביצועים (executions)

**תאריך:** 2026-01-31  
**עמוד:** `executions`  
**קובץ Blueprint:** `executions_BLUEPRINT.html`  
**סטטוס:** ✅ **SPEC COMPLETE - READY FOR IMPLEMENTATION**  
**Legacy File:** `/Users/nimrod/Documents/TikTrack/TikTrackApp/trading-ui/executions.html`  
**Legacy Directory:** `/Users/nimrod/Documents/TikTrack/TikTrackApp/trading-ui/` (כל קבצי ה-Legacy כולל HTML, CSS, JS)

**⚠️ כלל קריטי:** Blueprint = תבנית עיצובית בלבד עם מידע דמה. לא מתעסקים עם לוגיקה, API, או חישובים.

---

## 🎯 סקירה כללית

עמוד ניהול ביצועים - ניהול ביצועי מסחר (executions) הקשורים לטריידים.

**⚠️ כלל קריטי - Blueprint = תבנית עיצובית בלבד:**
- **מטרה:** יצירת ממשק מדויק ויזואלית ומבחינת CSS
- **מידע:** שימוש במידע דמה (mock data) בלבד
- **לא מתעסקים עם:**
  - מהיכן מגיע המידע (API, DB, JOINs)
  - איך המידע מחושב (חישובים, לוגיקה)
  - איך המידע נשמר (POST, PUT, DELETE)
- **רק עיצוב:** תבנית עיצובית מדויקת ונקייה בלבד

---

## 📊 DB Schema - טבלת executions

**מיקום:** `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql` (שורות 906-955)

### **טבלה:** `user_data.executions`

```sql
CREATE TABLE user_data.executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_data.users(id) ON DELETE CASCADE,
    trade_id UUID NOT NULL REFERENCES user_data.trades(id) ON DELETE CASCADE,
    ticker_id UUID NOT NULL REFERENCES market_data.tickers(id) ON DELETE RESTRICT,
    trading_account_id UUID NOT NULL REFERENCES user_data.trading_accounts(id) ON DELETE RESTRICT,
    
    -- Execution Details
    side user_data.execution_side NOT NULL,
    quantity NUMERIC(20, 8) NOT NULL,
    price NUMERIC(20, 8) NOT NULL,
    
    -- Order
    order_type user_data.order_type,
    
    -- Broker Integration
    broker_execution_id VARCHAR(100) UNIQUE,
    external_order_id VARCHAR(100),
    
    -- Fees
    commission NUMERIC(20, 6) DEFAULT 0,
    fees NUMERIC(20, 6) DEFAULT 0,
    
    -- Currency (NEW in V2.4 - GIN-003)
    original_currency VARCHAR(3),
    original_currency_rate NUMERIC(20, 10),
    base_currency VARCHAR(3),
    
    -- Manual Override (NEW in V2.4 - GIN-003)
    manual_override_flag BOOLEAN DEFAULT FALSE,
    manual_override_reason TEXT,
    manual_override_by UUID REFERENCES user_data.users(id),
    manual_override_at TIMESTAMPTZ,
    
    -- Timezone (NEW in V2.4 - GIN-003)
    execution_time TIMESTAMPTZ NOT NULL,
    execution_time_utc TIMESTAMPTZ,
    execution_time_local TIME,
    exchange_timezone VARCHAR(50),
    timezone_offset_minutes INTEGER,
    
    -- Audit
    created_by UUID NOT NULL REFERENCES user_data.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::JSONB,
    
    CONSTRAINT executions_positive_quantity CHECK (quantity > 0),
    CONSTRAINT executions_positive_price CHECK (price > 0)
);
```

### **ENUMs:**

```sql
CREATE TYPE user_data.execution_side AS ENUM ('BUY', 'SELL');
CREATE TYPE user_data.order_type AS ENUM ('MARKET', 'LIMIT', 'STOP', 'STOP_LIMIT', 'TRAILING_STOP');
```

---

## 📋 שדות לטבלה

### **שדות עיקריים:**

| שם שדה (DB) | שם שדה (API) | טיפוס | תיאור | הצגה בטבלה |
|-------------|--------------|-------|-------|------------|
| `id` | `id` | UUID | מזהה פנימי | ❌ לא מוצג |
| `trade_id` | `trade` | UUID FK | טרייד מקושר | ✅ קישור/מספר טרייד |
| `ticker_id` | `ticker` | UUID FK | טיקר | ✅ שם טיקר |
| `trading_account_id` | `trading_account` | UUID FK | חשבון מסחר | ✅ שם חשבון |
| `side` | `side` | ENUM | צד (BUY/SELL) | ✅ Badge (קניה/מכירה) |
| `quantity` | `quantity` | NUMERIC(20,8) | כמות | ✅ מספר, LTR |
| `price` | `price` | NUMERIC(20,8) | מחיר | ✅ מספר, LTR |
| `order_type` | `order_type` | ENUM | סוג הזמנה | ✅ Badge |
| `broker_execution_id` | `broker_execution_id` | VARCHAR(100) | מזהה ביצוע ברוקר | ⚠️ אופציונלי |
| `external_order_id` | `external_order_id` | VARCHAR(100) | מזהה הזמנה חיצוני | ⚠️ אופציונלי |
| `commission` | `commission` | NUMERIC(20,6) | עמלה | ✅ מספר, LTR |
| `fees` | `fees` | NUMERIC(20,6) | עמלות | ✅ מספר, LTR |
| `original_currency` | `original_currency` | VARCHAR(3) | מטבע מקורי | ✅ טקסט |
| `base_currency` | `base_currency` | VARCHAR(3) | מטבע בסיס | ✅ טקסט |
| `manual_override_flag` | `manual_override` | BOOLEAN | עדכון ידני | ✅ Badge |
| `execution_time` | `execution_time` | TIMESTAMPTZ | זמן ביצוע | ✅ תאריך+שעה, RTL |
| `created_at` | `created_at` | TIMESTAMPTZ | תאריך יצירה | ✅ תאריך, RTL |

---

## 🎨 מבנה טבלה (עמודות) - לפי Legacy

**מקור:** `/Users/nimrod/Documents/TikTrack/TikTrackApp/trading-ui/executions.html`

### **סדר עמודות לפי Legacy:**

1. **טרייד** (`col-trade`) - `trade_id` - קישור/מספר טרייד
2. **טיקר** (`col-ticker`) - `ticker_id` - שם טיקר
3. **פעולה** (`col-action`) - `side` - Badge (קניה/מכירה)
4. **חשבון מסחר** (`col-account`) - `trading_account_id` - שם חשבון
5. **כמות** (`col-quantity`) - `quantity` - מספר, LTR
6. **מחיר** (`col-price`) - `price` - מספר, LTR
7. **Realized P/L** (`col-realized-pl`) - מחושב - מספר, LTR
8. **MTM P/L** (`col-mtm-pl`) - מחושב - מספר, LTR
9. **תאריך** (`col-execution-date`) - `execution_time` - תאריך+שעה, RTL
10. **מקור** (`col-source`) - `broker_execution_id` / `manual_override_flag` - Badge/Text
11. **עודכן** (`col-updated`) - `created_at` - תאריך, RTL
12. **פעולות** (`col-actions`) - Actions Menu (3 פעולות: צפה, ערוך, מחק)

### **⚠️ הערות חשובות:**

- **קשור ל-trades:** כל ביצוע קשור ל-trade
- **Broker Integration:** יש שדות לאינטגרציה עם ברוקרים
- **Manual Override:** יש אפשרות לעדכון ידני
- **Timezone Support:** יש תמיכה מלאה ב-timezone
- **Realized P/L ו-MTM P/L:** שדות מחושבים (לא ב-DB)
- **סדר העמודות** - לפי Legacy בדיוק

---

## 🔍 פילטרים

### **פילטרים לפי Legacy:**

1. **פילטר חיפוש** (`search`)
   - שדה טקסט
   - חיפוש ב: `ticker_id` (שם טיקר), `trade_id` (מספר טרייד)

2. **פילטר טרייד** (`trade_id`)
   - Dropdown
   - רשימת טריידים

3. **פילטר טיקר** (`ticker_id`)
   - Dropdown
   - רשימת טיקרים

4. **פילטר חשבון מסחר** (`trading_account_id`)
   - Dropdown
   - רשימת חשבונות מסחר

5. **פילטר פעולה** (`side`)
   - Dropdown
   - אפשרויות: כל הפעולות, קניה (BUY), מכירה (SELL)

6. **פילטר סוג הזמנה** (`order_type`)
   - Dropdown
   - אפשרויות: כל הסוגים, MARKET, LIMIT, STOP, STOP_LIMIT, TRAILING_STOP

7. **פילטר מקור** (`source`)
   - Dropdown
   - אפשרויות: כל המקורות, ברוקר, ידני

8. **פילטר תאריך** (`date_range`)
   - Date Range Picker
   - תאריך ביצוע

---

## ⚙️ פעולות (Actions) - לפי Legacy

### **פעולות Header (לפי Legacy):**

1. **הוסף ביצוע** (`ADD`) - `data-button-type="ADD"` - הוספת ביצוע חדש
2. **ייבוא נתוני משתמש** (`IMPORT`) - `data-button-type="IMPORT"` - ייבוא ביצועים מקובץ CSV
3. **הצג/הסתר** (`TOGGLE`) - `data-button-type="TOGGLE"` - הצגה/הסתרה של הסקשן

### **פעולות שורה (Row Actions):**

**לפי Legacy:** `actions-3-items` - 3 פעולות:
1. **צפה** (`view`) - צפייה בפרטי ביצוע
2. **ערוך** (`edit`) - עריכת ביצוע
3. **מחק** (`delete`) - מחיקת ביצוע (soft delete)

---

## 📐 מבנה HTML

### **בסיס:** `tickers_BLUEPRINT.html` או `D16_ACCTS_VIEW.html`

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
          <!-- Top Section: Summary Stats -->
          <tt-section class="top-section">
            <info-summary>
              <!-- Summary Stats -->
            </info-summary>
          </tt-section>
          
          <!-- Main Section: Executions Table -->
          <tt-section>
            <phoenix-table id="executions-table">
              <!-- Table Header -->
              <!-- Table Body -->
              <!-- Table Pagination -->
            </phoenix-table>
          </tt-section>
          
          <!-- Trade Creation Clusters Section (אם נדרש) -->
          <tt-section class="content-section" id="tradeCreationClustersSection">
            <!-- Section for creating trades from execution clusters -->
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
- `badge--success` - Badge ירוק (קניה/BUY)
- `badge--danger` - Badge אדום (מכירה/SELL)
- `badge--info` - Badge כחול (סוג הזמנה)
- `badge--warning` - Badge צהוב (עדכון ידני)

### **Actions:**

- `table-actions-tooltip` - Actions Menu Container
- `table-actions-trigger` - Actions Button
- `table-action-btn` - Action Button
- `js-action-view` - View Action
- `js-action-edit` - Edit Action
- `js-action-delete` - Delete Action

### **Colors:**

- `buy-color` - צבע קניה (ירוק)
- `sell-color` - צבע מכירה (אדום)

---

## 📊 Summary Stats (לפי Legacy)

**מיקום:** `top-section` - לפני הטבלה

### **סטטיסטיקות:**

1. **סה"כ ביצועים** - `totalExecutions` - מספר כולל של ביצועים
   - פירוט: `totalBuyExecutions` (קניה) / `totalSellExecutions` (מכירה)
2. **סה"כ קניה** - `totalBuyAmount` - סכום כולל של קניות
3. **סה"כ מכירות** - `totalSellAmount` - סכום כולל של מכירות
4. **מאזן** - `balanceAmount` - מאזן (קניות - מכירות)

---

## 📝 הערות חשובות

### **1. קשור ל-trades:**
- כל ביצוע קשור ל-trade
- צריך להציג קישור/מספר טרייד בעמודת טרייד

### **2. Broker Integration:**
- יש שדות לאינטגרציה עם ברוקרים (`broker_execution_id`, `external_order_id`)
- צריך להציג את המקור (ברוקר/ידני) בעמודת מקור

### **3. Manual Override:**
- יש אפשרות לעדכון ידני (`manual_override_flag`)
- צריך להציג בדג' אם זה עדכון ידני

### **4. Timezone Support:**
- יש תמיכה מלאה ב-timezone (`execution_time`, `execution_time_utc`, `execution_time_local`, `exchange_timezone`)
- צריך להציג תאריך+שעה לפי timezone

### **5. Realized P/L ו-MTM P/L:**
- שדות מחושבים (לא ב-DB)
- צריך להציג מידע דמה בלבד (לא לחשב בפועל)

### **6. Naming Conventions:**
- שמות שדות: plural names only (e.g., `executions`, לא `execution`)
- External IDs: ULID strings only
- שמות קבצים: `executions_BLUEPRINT.html` (לא `D05_EXECUTIONS.html`)

### **7. RTL Alignment:**
- כל הטקסטים מיושרים ל-RTL
- מספרים ומחירים: LTR
- תאריכים: RTL

### **8. פילטרים:**
- פילטרים סטנדרטיים כמו ב-D16, D18, D21
- מיקום: Header Filters Row (unified-header)

### **9. תבנית בסיסית:**
- להשתמש ב-`tickers_BLUEPRINT.html` או `D16_ACCTS_VIEW.html` כתבנית
- לשמור על מבנה HTML זהה
- לשמור על מחלקות CSS זהה

### **10. מבנה Legacy:**
- **Top Section:** Summary Stats + Active Alerts Component
- **Main Section:** טבלת ביצועים + פעולות
- **Trade Creation Clusters Section:** (אם נדרש) אשכולות ביצועים ליצירת טריידים
- **Header Actions:** הוסף ביצוע, ייבוא נתוני משתמש, הצג/הסתר

---

## ✅ Checklist לפני התחלה

- [x] בדיקת DB Schema - טבלת executions ושדות
- [x] בדיקת קובץ Legacy (`executions.html`)
- [x] השוואת DB Schema vs Legacy
- [x] תכנון סדר עמודות
- [x] תכנון פילטרים
- [x] תכנון פעולות
- [ ] אישור מהמשתמש

---

**Team 31 (Blueprint)**  
**Date:** 2026-01-31  
**Status:** 📋 **SPEC READY - ממתין לאישור**
