# 📋 מפרט מלא - עמוד הערות (notes)

**תאריך:** 2026-01-31  
**עמוד:** `notes`  
**קובץ Blueprint:** `notes_BLUEPRINT.html`  
**סטטוס:** ✅ **SPEC COMPLETE - READY FOR IMPLEMENTATION**  
**Legacy File:** `/Users/nimrod/Documents/TikTrack/TikTrackApp/trading-ui/notes.html`  
**Legacy Directory:** `/Users/nimrod/Documents/TikTrack/TikTrackApp/trading-ui/` (כל קבצי ה-Legacy כולל HTML, CSS, JS)

**⚠️ כלל קריטי:** Blueprint = תבנית עיצובית בלבד עם מידע דמה. לא מתעסקים עם לוגיקה, API, או חישובים.

---

## 🎯 סקירה כללית

עמוד ניהול הערות - ניהול הערות על טיקרים, טריידים, תוכניות השקעה, חשבונות, או הערות כלליות.

**⚠️ כלל קריטי - Blueprint = תבנית עיצובית בלבד:**
- **מטרה:** יצירת ממשק מדויק ויזואלית ומבחינת CSS
- **מידע:** שימוש במידע דמה (mock data) בלבד
- **לא מתעסקים עם:**
  - מהיכן מגיע המידע (API, DB, JOINs)
  - איך המידע מחושב (חישובים, לוגיקה)
  - איך המידע נשמר (POST, PUT, DELETE)
- **רק עיצוב:** תבנית עיצובית מדויקת ונקייה בלבד

---

## 📊 DB Schema - טבלת notes

**מיקום:** `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql` (שורות 1087-1127)

### **טבלה:** `user_data.notes`

```sql
CREATE TABLE user_data.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_data.users(id) ON DELETE CASCADE,
    
    -- Polymorphic Parent
    parent_type VARCHAR(50) NOT NULL CHECK (parent_type IN ('trade', 'trade_plan', 'ticker', 'account', 'general')),
    parent_id UUID,
    
    -- Content
    title VARCHAR(200),
    content TEXT NOT NULL,
    category user_data.note_category NOT NULL DEFAULT 'GENERAL',
    
    -- Status
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Audit
    created_by UUID NOT NULL REFERENCES user_data.users(id),
    updated_by UUID NOT NULL REFERENCES user_data.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::JSONB,
    tags VARCHAR(255)[]
);
```

### **ENUM:**

```sql
CREATE TYPE user_data.note_category AS ENUM ('TRADE', 'PSYCHOLOGY', 'ANALYSIS', 'GENERAL');
```

---

## 📋 שדות לטבלה

### **שדות עיקריים:**

| שם שדה (DB) | שם שדה (API) | טיפוס | תיאור | הצגה בטבלה |
|-------------|--------------|-------|-------|------------|
| `id` | `id` | UUID | מזהה פנימי | ❌ לא מוצג |
| `parent_type` | `parent_type` | VARCHAR(50) | סוג אובייקט מקושר | ✅ Badge/Icon |
| `parent_id` | `parent_id` | UUID | מזהה אובייקט מקושר | ✅ קישור/שם |
| `title` | `title` | VARCHAR(200) | כותרת הערה | ✅ טקסט |
| `content` | `content` | TEXT | תוכן הערה | ✅ טקסט (truncated) |
| `category` | `category` | ENUM | קטגוריה | ✅ Badge |
| `is_pinned` | `is_pinned` | BOOLEAN | מוצמד/לא מוצמד | ✅ Icon/Badge |
| `tags` | `tags` | VARCHAR(255)[] | תגיות | ✅ Badges |
| `created_at` | `created_at` | TIMESTAMPTZ | תאריך יצירה | ✅ תאריך |
| `updated_at` | `updated_at` | TIMESTAMPTZ | תאריך עדכון | ✅ תאריך |

---

## 🎨 מבנה טבלה (עמודות) - לפי Legacy

**מקור:** `/Users/nimrod/Documents/TikTrack/TikTrackApp/trading-ui/notes.html`

### **סדר עמודות לפי Legacy:**

1. **אובייקט מקושר** (`col-linked-object`) - `parent_type` + `parent_id` - Badge/Icon + שם אובייקט
2. **תוכן** (`col-content`) - `title` + `content` (truncated) - טקסט
3. **קובץ מצורף** (`col-attachment`) - `metadata` (אם יש קבצים) - Icon/Link
4. **נוצר ב:** (`col-created`) - `created_at` - תאריך, RTL
5. **עודכן** (`col-updated`) - `updated_at` - תאריך, RTL
6. **פעולות** (`col-actions`) - Actions Menu (1 פעולה: ערוך/מחק)

### **⚠️ הערות חשובות:**

- **Polymorphic Parent:** הערות יכולות להיות קשורות ל-trade, trade_plan, ticker, account, או general
- **Category System:** יש קטגוריות (note_category ENUM: TRADE, PSYCHOLOGY, ANALYSIS, GENERAL)
- **Tags:** יש מערכת תגיות (tags array)
- **סדר העמודות** - לפי Legacy בדיוק

---

## 🔍 פילטרים

### **פילטרים לפי Legacy:**

1. **פילטר לפי סוג אובייקט מקושר** (`parent_type`)
   - כפתורי פילטר עם אייקונים:
     - כל הסוגים (⚙️)
     - חשבונות (🏦)
     - טריידים (💼)
     - תוכניות השקעה (📝)
     - טיקרים (📈)

2. **פילטר חיפוש** (`search`)
   - שדה טקסט
   - חיפוש ב: `title`, `content`, `tags`

3. **פילטר קטגוריה** (`category`)
   - Dropdown
   - אפשרויות: כל הקטגוריות, TRADE, PSYCHOLOGY, ANALYSIS, GENERAL

4. **פילטר מוצמד** (`is_pinned`)
   - Checkbox/Toggle
   - אפשרויות: כל ההערות, מוצמדות בלבד

5. **פילטר תאריך** (`date_range`)
   - Date Range Picker
   - תאריך יצירה/עדכון

---

## ⚙️ פעולות (Actions) - לפי Legacy

### **פעולות Header (לפי Legacy):**

1. **הוסף הערה** (`ADD`) - `data-button-type="ADD"` - הוספת הערה חדשה
2. **הצג/הסתר** (`TOGGLE`) - `data-button-type="TOGGLE"` - הצגה/הסתרה של הסקשן

### **פעולות שורה (Row Actions):**

**לפי Legacy:** `actions-1-item` - 1 פעולה:
1. **ערוך/מחק** (`edit/delete`) - עריכת או מחיקת הערה (soft delete)

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
          
          <!-- Main Section: Notes Table -->
          <tt-section>
            <phoenix-table id="notes-table">
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
- `badge--info` - Badge כחול (קטגוריה)
- `badge--success` - Badge ירוק (תגיות)

### **Actions:**

- `table-actions-tooltip` - Actions Menu Container
- `table-actions-trigger` - Actions Button
- `table-action-btn` - Action Button
- `js-action-edit` - Edit Action
- `js-action-delete` - Delete Action

---

## 📊 Summary Stats (לפי Legacy)

**מיקום:** `top-section` - לפני הטבלה

### **סטטיסטיקות:**

1. **סה"כ הערות** - `totalNotes` - מספר כולל של הערות
2. **הערות פעילות** - `activeNotes` - מספר הערות פעילות (לא נמחקו)
3. **הערות חדשות** - `recentNotes` - הערות שנוצרו לאחרונה
4. **סה"כ קישורים** - `totalLinks` - מספר קישורים/קבצים מצורפים

---

## 📝 הערות חשובות

### **1. Polymorphic Parent:**
- הערות יכולות להיות קשורות ל-trade, trade_plan, ticker, account, או general
- צריך להציג את סוג האובייקט המקושר עם אייקון/בדג' מתאים

### **2. Category System:**
- יש קטגוריות (note_category ENUM: TRADE, PSYCHOLOGY, ANALYSIS, GENERAL)
- צריך להציג עם בדג' בצבעים שונים לפי קטגוריה

### **3. Tags System:**
- יש מערכת תגיות (tags array)
- צריך להציג תגיות כבדג'ים קטנים

### **4. Content Display:**
- תוכן הערה (`content`) צריך להיות truncated בטבלה (למשל: 100 תווים)
- כותרת (`title`) - אם קיימת, להציג; אחרת, להציג חלק מתוכן

### **5. Naming Conventions:**
- שמות שדות: plural names only (e.g., `notes`, לא `note`)
- External IDs: ULID strings only
- שמות קבצים: `notes_BLUEPRINT.html` (לא `D05_NOTES.html`)

### **6. RTL Alignment:**
- כל הטקסטים מיושרים ל-RTL
- תאריכים: RTL

### **7. פילטרים:**
- פילטרים סטנדרטיים כמו ב-D16, D18, D21
- מיקום: Header Filters Row (unified-header)
- פילטר מיוחד: לפי סוג אובייקט מקושר (כפתורי אייקונים)

### **8. תבנית בסיסית:**
- להשתמש ב-`tickers_BLUEPRINT.html` או `D16_ACCTS_VIEW.html` כתבנית
- לשמור על מבנה HTML זהה
- לשמור על מחלקות CSS זהה

### **9. מבנה Legacy:**
- **Top Section:** Summary Stats + Active Alerts Component
- **Main Section:** טבלת הערות + פעולות
- **Header Actions:** הוסף הערה, הצג/הסתר

---

## ✅ Checklist לפני התחלה

- [x] בדיקת DB Schema - טבלת notes ושדות
- [x] בדיקת קובץ Legacy (`notes.html`)
- [x] השוואת DB Schema vs Legacy
- [x] תכנון סדר עמודות
- [x] תכנון פילטרים
- [x] תכנון פעולות
- [ ] אישור מהמשתמש

---

**Team 31 (Blueprint)**  
**Date:** 2026-01-31  
**Status:** 📋 **SPEC READY - ממתין לאישור**
