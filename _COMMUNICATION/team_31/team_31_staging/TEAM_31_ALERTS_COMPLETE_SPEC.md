# 📋 מפרט מלא - עמוד התראות (alerts)

**תאריך:** 2026-01-31  
**עמוד:** `alerts`  
**קובץ Blueprint:** `alerts_BLUEPRINT.html`  
**סטטוס:** ✅ **SPEC COMPLETE - READY FOR IMPLEMENTATION**  
**Legacy File:** `/Users/nimrod/Documents/TikTrack/TikTrackApp/trading-ui/alerts.html`  
**Legacy Directory:** `/Users/nimrod/Documents/TikTrack/TikTrackApp/trading-ui/` (כל קבצי ה-Legacy כולל HTML, CSS, JS)

**⚠️ כלל קריטי:** Blueprint = תבנית עיצובית בלבד עם מידע דמה. לא מתעסקים עם לוגיקה, API, או חישובים.

---

## 🎯 סקירה כללית

עמוד ניהול התראות - ניהול התראות על טיקרים, טריידים, תוכניות השקעה, חשבונות, או התראות כלליות.

**⚠️ כלל קריטי - Blueprint = תבנית עיצובית בלבד:**
- **מטרה:** יצירת ממשק מדויק ויזואלית ומבחינת CSS
- **מידע:** שימוש במידע דמה (mock data) בלבד
- **לא מתעסקים עם:**
  - מהיכן מגיע המידע (API, DB, JOINs)
  - איך המידע מחושב (חישובים, לוגיקה)
  - איך המידע נשמר (POST, PUT, DELETE)
- **רק עיצוב:** תבנית עיצובית מדויקת ונקייה בלבד

---

## 📊 DB Schema - טבלת alerts

**מיקום:** `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql` (שורות 1023-1083)

### **טבלה:** `user_data.alerts`

```sql
CREATE TABLE user_data.alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_data.users(id) ON DELETE CASCADE,
    
    -- Polymorphic Target
    target_type VARCHAR(50) NOT NULL CHECK (target_type IN ('ticker', 'trade', 'trade_plan', 'account', 'general')),
    target_id UUID,
    
    -- Ticker (if target_type = 'ticker')
    ticker_id UUID REFERENCES market_data.tickers(id) ON DELETE CASCADE,
    
    -- Alert Details
    alert_type user_data.alert_type NOT NULL,
    priority user_data.alert_priority NOT NULL DEFAULT 'MEDIUM',
    
    -- Condition
    condition_field VARCHAR(50),
    condition_operator VARCHAR(10),
    condition_value NUMERIC(20, 8),
    
    -- Message
    title VARCHAR(200) NOT NULL,
    message TEXT,
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_triggered BOOLEAN NOT NULL DEFAULT FALSE,
    triggered_at TIMESTAMPTZ,
    
    -- Expiry
    expires_at TIMESTAMPTZ,
    
    -- Audit
    created_by UUID NOT NULL REFERENCES user_data.users(id),
    updated_by UUID NOT NULL REFERENCES user_data.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::JSONB
);
```

### **ENUMs:**

```sql
CREATE TYPE user_data.alert_type AS ENUM ('PRICE', 'VOLUME', 'TECHNICAL', 'NEWS', 'CUSTOM');
CREATE TYPE user_data.alert_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
```

---

## 📋 שדות לטבלה

### **שדות עיקריים:**

| שם שדה (DB) | שם שדה (API) | טיפוס | תיאור | הצגה בטבלה |
|-------------|--------------|-------|-------|------------|
| `id` | `id` | UUID | מזהה פנימי | ❌ לא מוצג |
| `target_type` | `target_type` | VARCHAR(50) | סוג אובייקט מקושר | ✅ Badge/Icon |
| `target_id` | `target_id` | UUID | מזהה אובייקט מקושר | ✅ קישור/שם |
| `ticker_id` | `ticker` | UUID FK | טיקר (אם target_type='ticker') | ✅ שם טיקר |
| `alert_type` | `alert_type` | ENUM | סוג התראה | ✅ Badge |
| `priority` | `priority` | ENUM | עדיפות | ✅ Badge |
| `condition_field` | `condition_field` | VARCHAR(50) | שדה תנאי | ✅ טקסט |
| `condition_operator` | `condition_operator` | VARCHAR(10) | אופרטור תנאי | ✅ טקסט |
| `condition_value` | `condition_value` | NUMERIC(20,8) | ערך תנאי | ✅ מספר |
| `title` | `title` | VARCHAR(200) | כותרת התראה | ✅ טקסט |
| `message` | `message` | TEXT | הודעת התראה | ⚠️ אופציונלי |
| `is_active` | `is_active` | BOOLEAN | פעיל/לא פעיל | ✅ Badge |
| `is_triggered` | `is_triggered` | BOOLEAN | הופעל/לא הופעל | ✅ Badge |
| `triggered_at` | `triggered_at` | TIMESTAMPTZ | תאריך הפעלה | ✅ תאריך |
| `expires_at` | `expires_at` | TIMESTAMPTZ | תאריך תפוגה | ✅ תאריך |
| `created_at` | `created_at` | TIMESTAMPTZ | תאריך יצירה | ✅ תאריך |
| `updated_at` | `updated_at` | TIMESTAMPTZ | תאריך עדכון | ✅ תאריך |

---

## 🎨 מבנה טבלה (עמודות) - לפי Legacy

**מקור:** `/Users/nimrod/Documents/TikTrack/TikTrackApp/trading-ui/alerts.html`

### **סדר עמודות לפי Legacy:**

1. **קשור ל:** (`col-linked-object`) - `target_type` + `target_id` - Badge/Icon + שם אובייקט
2. **טיקר** (`col-ticker`) - `ticker_id` - שם טיקר (אם קיים)
3. **תנאי** (`col-condition`) - `condition_field` + `condition_operator` + `condition_value` - טקסט מותאם
4. **סטטוס** (`col-status`) - `is_active` - Badge (פעיל/לא פעיל)
5. **הופעל** (`col-triggered`) - `is_triggered` - Badge (כן/לא)
6. **תנאי** (`col-condition-source`) - `alert_type` - Badge (PRICE, VOLUME, etc.)
7. **נוצר ב:** (`col-created`) - `created_at` - תאריך, RTL
8. **הופעל ב:** (`col-triggered-at`) - `triggered_at` - תאריך, RTL (אם הופעל)
9. **תאריך תפוגה** (`col-expiry`) - `expires_at` - תאריך, RTL
10. **עודכן** (`col-updated`) - `updated_at` - תאריך, RTL
11. **פעולות** (`col-actions`) - Actions Menu (3 פעולות: צפה, ערוך, מחק)

### **⚠️ הערות חשובות:**

- **Polymorphic Target:** התראות יכולות להיות קשורות ל-ticker, trade, trade_plan, account, או general
- **Condition System:** יש מערכת תנאים מורכבת (condition_field, condition_operator, condition_value)
- **Priority System:** יש מערכת עדיפויות (alert_priority ENUM)
- **סדר העמודות** - לפי Legacy בדיוק

---

## 🔍 פילטרים

### **פילטרים לפי Legacy:**

1. **פילטר לפי סוג אובייקט מקושר** (`target_type`)
   - כפתורי פילטר עם אייקונים:
     - כל הסוגים (⚙️)
     - חשבונות (🏦)
     - טריידים (💼)
     - תוכניות השקעה (📝)
     - טיקרים (📈)

2. **פילטר חיפוש** (`search`)
   - שדה טקסט
   - חיפוש ב: `title`, `message`

3. **פילטר סוג התראה** (`alert_type`)
   - Dropdown
   - אפשרויות: כל הסוגים, PRICE, VOLUME, TECHNICAL, NEWS, CUSTOM

4. **פילטר עדיפות** (`priority`)
   - Dropdown
   - אפשרויות: כל העדיפויות, LOW, MEDIUM, HIGH, CRITICAL

5. **פילטר סטטוס** (`is_active`)
   - Dropdown
   - אפשרויות: כל הסטטוסים, פעיל, לא פעיל

6. **פילטר הופעל** (`is_triggered`)
   - Dropdown
   - אפשרויות: כל ההתראות, הופעל, לא הופעל

7. **פילטר תאריך** (`date_range`)
   - Date Range Picker
   - תאריך יצירה/הפעלה/תפוגה

---

## ⚙️ פעולות (Actions) - לפי Legacy

### **פעולות Header (לפי Legacy):**

1. **הערך כל התנאים** (`EVALUATE`) - `data-button-type="EVALUATE"` - הערכת כל התנאים הפעילים
2. **רענן הערכות** (`REFRESH`) - `data-button-type="REFRESH"` - רענון תוצאות הערכת תנאים
3. **הוסף התראה** (`ADD`) - `data-button-type="ADD"` - הוספת התראה חדשה
4. **הצג/הסתר** (`TOGGLE`) - `data-button-type="TOGGLE"` - הצגה/הסתרה של הסקשן

### **פעולות שורה (Row Actions):**

**לפי Legacy:** `actions-3-items` - 3 פעולות:
1. **צפה** (`view`) - צפייה בפרטי התראה
2. **ערוך** (`edit`) - עריכת התראה
3. **מחק** (`delete`) - מחיקת התראה (soft delete)

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
          
          <!-- Main Section: Alerts Table -->
          <tt-section>
            <phoenix-table id="alerts-table">
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
- `badge--success` - Badge ירוק (פעיל, הופעל)
- `badge--danger` - Badge אדום (לא פעיל, לא הופעל)
- `badge--info` - Badge כחול (סוג התראה)
- `badge--warning` - Badge צהוב (עדיפות גבוהה)

### **Actions:**

- `table-actions-tooltip` - Actions Menu Container
- `table-actions-trigger` - Actions Button
- `table-action-btn` - Action Button
- `js-action-view` - View Action
- `js-action-edit` - Edit Action
- `js-action-delete` - Delete Action

---

## 📊 Summary Stats (לפי Legacy)

**מיקום:** `top-section` - לפני הטבלה

### **סטטיסטיקות:**

1. **סה"כ התראות** - `totalAlerts` - מספר כולל של התראות
2. **התראות פעילות** - `activeAlerts` - מספר התראות פעילות (`is_active = TRUE`)
3. **התראות חדשות** - `newAlerts` - התראות שנוצרו לאחרונה
4. **התראות היום** - `todayAlerts` - התראות שנוצרו היום
5. **התראות השבוע** - `weekAlerts` - התראות שנוצרו השבוע

---

## 📝 הערות חשובות

### **1. Polymorphic Target:**
- התראות יכולות להיות קשורות ל-ticker, trade, trade_plan, account, או general
- צריך להציג את סוג האובייקט המקושר עם אייקון/בדג' מתאים

### **2. Condition System:**
- יש מערכת תנאים מורכבת (condition_field, condition_operator, condition_value)
- צריך להציג את התנאי בצורה קריאה (למשל: "מחיר > 150")

### **3. Priority System:**
- יש מערכת עדיפויות (alert_priority ENUM: LOW, MEDIUM, HIGH, CRITICAL)
- צריך להציג עם בדג' בצבעים שונים לפי עדיפות

### **4. Naming Conventions:**
- שמות שדות: plural names only (e.g., `alerts`, לא `alert`)
- External IDs: ULID strings only
- שמות קבצים: `alerts_BLUEPRINT.html` (לא `D05_ALERTS.html`)

### **5. RTL Alignment:**
- כל הטקסטים מיושרים ל-RTL
- מספרים ומחירים: LTR
- תאריכים: RTL

### **6. פילטרים:**
- פילטרים סטנדרטיים כמו ב-D16, D18, D21
- מיקום: Header Filters Row (unified-header)
- פילטר מיוחד: לפי סוג אובייקט מקושר (כפתורי אייקונים)

### **7. תבנית בסיסית:**
- להשתמש ב-`tickers_BLUEPRINT.html` או `D16_ACCTS_VIEW.html` כתבנית
- לשמור על מבנה HTML זהה
- לשמור על מחלקות CSS זהה

### **8. מבנה Legacy:**
- **Top Section:** Summary Stats + Active Alerts Component
- **Main Section:** טבלת התראות + פעולות
- **Header Actions:** הערך כל התנאים, רענן הערכות, הוסף התראה, הצג/הסתר

---

## ✅ Checklist לפני התחלה

- [x] בדיקת DB Schema - טבלת alerts ושדות
- [x] בדיקת קובץ Legacy (`alerts.html`)
- [x] השוואת DB Schema vs Legacy
- [x] תכנון סדר עמודות
- [x] תכנון פילטרים
- [x] תכנון פעולות
- [ ] אישור מהמשתמש

---

**Team 31 (Blueprint)**  
**Date:** 2026-01-31  
**Status:** 📋 **SPEC READY - ממתין לאישור**
