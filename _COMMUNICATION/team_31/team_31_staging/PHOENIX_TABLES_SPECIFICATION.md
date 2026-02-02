# 📋 אפיון מערכת טבלאות Phoenix V2 - מפרט טכני מפורט

**מיקום:** `_COMMUNICATION/team_31/team_31_staging/`  
**אחריות:** Team 31 (Blueprint) → Team 10 (Gateway) → Architect Review  
**תוקף:** מחייב לכל המערכת  
**תאריך יצירה:** 2026-02-01  
**גרסה:** v1.0.0 (Draft for Architect Review)  
**סטטוס:** ⏳ **PENDING ARCHITECT APPROVAL**

---

## 🎯 מטרה

מסמך זה מגדיר את מערכת הטבלאות המאוחדת (Unified Tables System) של Phoenix V2. זהו אבן יסוד קריטית שתשמש כבסיס לכל הטבלאות במערכת, ותבטיח עקביות עיצובית, פונקציונליות אחידה, ואינטגרציה מלאה עם מערכת הפילטרים הגלובלית.

**חשיבות:** הטבלאות הן האובייקט החשוב ביותר, המורכב ביותר והנפוץ ביותר במערכת. יש להתייחס אליהן ככאלה ולתכנן אותן כראוי.

---

## 📐 1. הקשר עסקי - עמוד חשבונות מסחר (D16_ACCTS_VIEW)

### 1.1 מבנה העמוד
עמוד חשבונות מסחר מכיל **5 קונטיינרים** (Containers):

| קונטיינר | כותרת | תוכן | פילטרים נוספים |
|:---|:---|:---|:---|
| **0** | סיכום מידע והתראות פעילות | טבלה + וויגיטים | אין |
| **1** | ניהול חשבונות מסחר | טבלה | אין |
| **2** | סיכום תנועות לחשבון | טבלה | כן (טווח תאריכים) |
| **3** | דף חשבון לתאריכים | טבלה | כן (תאריכים + חשבון) |
| **4** | פוזיציות לפי חשבון | טבלה | כן (חשבון) |

### 1.2 דרישות עיצוביות
- **סטנדרט עיצובי אחיד ומוקפד** לכל הטבלאות
- **רוחב מלא** - כל הטבלאות תופסות את כל רוחב הקונטיינר
- **עיצוב עקבי** - כל הטבלאות נראות זהות מבחינה ויזואלית

---

## 🏗️ 2. ארכיטקטורה טכנית

### 2.1 מבנה HTML - LEGO System

כל טבלה חייבת להיות מוקפת במבנה LEGO הבסיסי:

```html
<tt-section data-section="section-name">
  <!-- Section Header -->
  <div class="index-section__header">
    <!-- Header content -->
  </div>
  
  <!-- Section Body -->
  <div class="index-section__body">
    <tt-section-row>
      <!-- Optional: Table-specific filters -->
      <div class="phoenix-table-filters">
        <!-- Additional filters if needed -->
      </div>
      
      <!-- Table Container -->
      <div class="phoenix-table-wrapper">
        <table class="phoenix-table">
          <thead class="phoenix-table__head">
            <tr class="phoenix-table__row">
              <th class="phoenix-table__header" data-sortable="true" data-sort-key="field_name">
                <span class="phoenix-table__header-text">כותרת עמודה</span>
                <span class="phoenix-table__sort-indicator">
                  <svg class="phoenix-table__sort-icon" width="12" height="12">...</svg>
                </span>
              </th>
              <!-- More headers -->
            </tr>
          </thead>
          <tbody class="phoenix-table__body">
            <tr class="phoenix-table__row">
              <td class="phoenix-table__cell" data-field="field_name">
                <!-- Cell content -->
              </td>
              <!-- More cells -->
            </tr>
          </tbody>
        </table>
      </div>
    </tt-section-row>
  </div>
</tt-section>
```

### 2.2 מבנה CSS - Naming Convention

**תחילית מחלקה:** `phoenix-table-*`

**מבנה המחלקות:**
- `.phoenix-table-wrapper` - Wrapper חיצוני לטבלה (מטפל ב-overflow ו-scroll)
- `.phoenix-table` - הטבלה עצמה
- `.phoenix-table__head` - אזור ה-head
- `.phoenix-table__body` - אזור ה-body
- `.phoenix-table__row` - שורה בטבלה
- `.phoenix-table__header` - תא כותרת
- `.phoenix-table__header-text` - טקסט כותרת
- `.phoenix-table__sort-indicator` - אינדיקטור סידור
- `.phoenix-table__sort-icon` - אייקון סידור
- `.phoenix-table__cell` - תא רגיל
- `.phoenix-table__cell--numeric` - תא מספרי
- `.phoenix-table__cell--currency` - תא מטבע
- `.phoenix-table__cell--date` - תא תאריך
- `.phoenix-table__cell--status` - תא סטטוס
- `.phoenix-table__cell--actions` - תא פעולות
- `.phoenix-table-filters` - אזור פילטרים פנימיים

**מיקום קבצי CSS:**
- **קובץ מרכזי:** `phoenix-tables.css` (קובץ חדש, נפרד)
- **או:** סקשן בתוך `phoenix-components.css` תחת סקשן `/* TABLES SYSTEM */`

---

## 🎨 3. מפרט עיצובי (Visual Design Specification)

### 3.1 צבעים - CSS Variables בלבד

```css
/* Table Colors - Using CSS Variables */
.phoenix-table {
  background: var(--apple-bg-primary, #FFFFFF);
  border: 1px solid var(--apple-border-light, #E5E5EA);
  border-radius: var(--apple-radius-medium, 10px);
  box-shadow: var(--apple-shadow-light, 0 1px 3px rgba(0, 0, 0, 0.1));
}

.phoenix-table__header {
  background: var(--apple-bg-secondary, #F2F2F7);
  color: var(--apple-text-primary, #000000);
  border-bottom: 2px solid var(--apple-border-light, #E5E5EA);
}

.phoenix-table__row {
  border-bottom: 1px solid var(--apple-border-light, #E5E5EA);
}

.phoenix-table__row:hover {
  background: var(--apple-bg-secondary, #F2F2F7);
}
```

### 3.2 טיפוגרפיה

```css
.phoenix-table__header {
  font-size: var(--font-size-sm, 14px);
  font-weight: var(--font-weight-semibold, 600);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.phoenix-table__cell {
  font-size: var(--font-size-base, 16px);
  font-weight: var(--font-weight-normal, 400);
  line-height: var(--line-height-normal, 1.4);
}

.phoenix-table__cell--numeric {
  font-family: var(--font-family-mono, 'SFMono-Regular', Consolas, monospace);
  text-align: left; /* RTL: numbers align left */
  letter-spacing: 0.5px;
}
```

### 3.3 ריווח (Spacing)

```css
.phoenix-table__header,
.phoenix-table__cell {
  padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
}

.phoenix-table__row:last-child {
  border-bottom: none;
}
```

### 3.4 גבהים קבועים

```css
.phoenix-table__header {
  height: 48px !important; /* Fixed header height */
  min-height: 48px;
  max-height: 48px;
}

.phoenix-table__row {
  min-height: 48px; /* Minimum row height */
}
```

---

## 🔄 4. פונקציונליות סידור (Sorting)

### 4.1 דרישות סידור

**כל טבלה חייבת לממש:**

1. **סידור לפי עמודה** - לחיצה על כותרת עמודה מסדרת את הטבלה לפי אותה עמודה
2. **כיוון הפוך** - לחיצה שניה על אותה עמודה הופכת את כיוון הסידור (עולה → יורד → ללא סידור)
3. **רמת סידור שניה** - לחיצה עם `Shift` מוסיפה רמת סידור שניה (Multi-sort)

### 4.2 מצבי סידור

| מצב | אייקון | תיאור |
|:---|:---|:---|
| **ללא סידור** | ↕️ (שני חצים) | מצב התחלתי - אין סידור |
| **עולה (ASC)** | ↑ (חץ למעלה) | סידור מהקטן לגדול |
| **יורד (DESC)** | ↓ (חץ למטה) | סידור מהגדול לקטן |

### 4.3 מנגנון סידור

**מחזור סידור:**
1. לחיצה ראשונה: `ASC` (עולה)
2. לחיצה שניה: `DESC` (יורד)
3. לחיצה שלישית: `NONE` (ללא סידור) - חזרה למצב התחלתי

**Multi-sort (רמת סידור שניה):**
- לחיצה עם `Shift` מוסיפה רמת סידור שניה
- רמת סידור ראשונה נשארת פעילה
- ניתן להוסיף עד 2 רמות סידור (Primary + Secondary)

### 4.4 יישום טכני

**HTML Attributes:**
```html
<th class="phoenix-table__header" 
    data-sortable="true" 
    data-sort-key="display_names"
    data-sort-type="string">
  <span class="phoenix-table__header-text">שם חשבון</span>
  <span class="phoenix-table__sort-indicator">
    <svg class="phoenix-table__sort-icon" data-sort-state="none">...</svg>
  </span>
</th>
```

**JavaScript API:**
```javascript
// Table sorting manager
class PhoenixTableSortManager {
  constructor(tableElement) {
    this.table = tableElement;
    this.sortState = {
      primary: { key: null, direction: null },
      secondary: { key: null, direction: null }
    };
    this.init();
  }
  
  init() {
    // Attach click handlers to sortable headers
    const headers = this.table.querySelectorAll('[data-sortable="true"]');
    headers.forEach(header => {
      header.addEventListener('click', (e) => {
        const isShiftPressed = e.shiftKey;
        this.handleSort(header, isShiftPressed);
      });
    });
  }
  
  handleSort(header, isSecondary = false) {
    const sortKey = header.dataset.sortKey;
    const currentState = isSecondary ? this.sortState.secondary : this.sortState.primary;
    
    // Cycle through: ASC -> DESC -> NONE
    if (currentState.key === sortKey) {
      if (currentState.direction === 'ASC') {
        currentState.direction = 'DESC';
      } else if (currentState.direction === 'DESC') {
        currentState.direction = 'NONE';
        currentState.key = null;
      }
    } else {
      currentState.key = sortKey;
      currentState.direction = 'ASC';
    }
    
    this.applySort();
    this.updateUI();
  }
  
  applySort() {
    // Sort table rows based on sortState
    // Implementation details...
  }
  
  updateUI() {
    // Update sort indicators in headers
    // Implementation details...
  }
}
```

---

## 🔍 5. אינטגרציה עם מערכת הפילטרים

### 5.1 פילטר ראשי (Global Filter System)

**כל טבלה חייבת לעבוד מול הפילטר הראשי של המערכת** כפי שמופיע ב-`header-filters`:

| פילטר | תיאור | רלוונטי לטבלאות |
|:---|:---|:---|
| **סטטוס** | פילטר לפי סטטוס (פתוח/סגור/מבוטל) | כן - רלוונטי לטבלאות עם שדה סטטוס |
| **סוג השקעה** | פילטר לפי סוג השקעה | כן - רלוונטי לטבלאות עם שדה סוג |
| **חשבון מסחר** | פילטר לפי חשבון מסחר | כן - רלוונטי לכל טבלאות חשבונות |
| **טווח תאריכים** | פילטר לפי תאריכים | כן - רלוונטי לטבלאות עם שדה תאריך |
| **חיפוש** | חיפוש טקסט חופשי | כן - רלוונטי לכל הטבלאות |

### 5.2 פילטרים נוספים פנימיים

**חלק מהטבלאות דורשות פילטרים נוספים פנימיים:**

| טבלה | פילטרים נוספים |
|:---|:---|
| **סיכום תנועות לחשבון** | טווח תאריכים (תאריך התחלה + תאריך סיום) |
| **דף חשבון לתאריכים** | תאריכים + בחירת חשבון |
| **פוזיציות לפי חשבון** | בחירת חשבון |

**מבנה HTML לפילטרים פנימיים:**
```html
<div class="phoenix-table-filters">
  <div class="phoenix-table-filter-group">
    <label class="phoenix-table-filter-label">טווח תאריכים:</label>
    <input type="date" class="phoenix-table-filter-input" data-filter-key="date_from">
    <span>עד</span>
    <input type="date" class="phoenix-table-filter-input" data-filter-key="date_to">
  </div>
</div>
```

### 5.3 מנגנון סינון משולב

**כל טבלה חייבת לממש:**

1. **שילוב פילטרים** - שילוב של פילטר ראשי + פילטרים פנימיים
2. **עדכון בזמן אמת** - שינוי בפילטר מעדכן את הטבלה מיד
3. **שמירת מצב** - שמירת מצב הפילטרים ב-URL או ב-LocalStorage

**JavaScript API:**
```javascript
class PhoenixTableFilterManager {
  constructor(tableElement) {
    this.table = tableElement;
    this.filters = {
      global: {}, // From header-filters
      local: {}   // From phoenix-table-filters
    };
    this.init();
  }
  
  init() {
    // Listen to global filter changes
    window.addEventListener('phoenix-global-filter-change', (e) => {
      this.filters.global = e.detail;
      this.applyFilters();
    });
    
    // Listen to local filter changes
    const localFilters = this.table.querySelectorAll('.phoenix-table-filter-input');
    localFilters.forEach(filter => {
      filter.addEventListener('change', () => {
        this.updateLocalFilter(filter);
        this.applyFilters();
      });
    });
  }
  
  applyFilters() {
    // Combine global + local filters
    const combinedFilters = { ...this.filters.global, ...this.filters.local };
    
    // Filter table rows
    // Implementation details...
  }
}
```

---

## 📊 6. מפרט שדות - טבלה ראשונה (ניהול חשבונות מסחר)

### 6.1 שדות הטבלה

**טבלה:** ניהול חשבונות מסחר (Container 1)

| עמודה | שם שדה (Backend) | טיפוס | פורמט תצוגה | סידור | פילטר |
|:---|:---|:---|:---|:---|:---|
| **שם חשבון** | `display_names` | `String` | טקסט רגיל | כן (string) | כן (חיפוש) |
| **ברוקר** | `broker_names` | `String` | טקסט רגיל | כן (string) | כן (dropdown) |
| **יתרה** | `available_amounts` (מ-Balances) | `NUMERIC(20,8)` | מטבע + סכום | כן (numeric) | לא |
| **מטבע** | `currency_codes` (מ-Balances) | `VARCHAR(3)` | קוד מטבע (USD, EUR, ILS) | כן (string) | כן (dropdown) |
| **סטטוס** | `is_active_statuses` | `Boolean` | תגית צבעונית | כן (boolean) | כן (dropdown) |
| **תאריך יצירה** | `created_at_times` | `TIMESTAMP` | DD/MM/YYYY | כן (date) | לא |
| **פעולות** | - | - | כפתורים (ערוך/מחק) | לא | לא |

### 6.2 פורמט תצוגה מפורט

#### **יתרה (available_amounts)**
- **פורמט:** `$1,234.56` או `€1,234.56` או `₪1,234.56`
- **יישור:** ימין (RTL: שמאל)
- **פונט:** Monospace
- **צבע:** 
  - חיובי: `var(--apple-text-primary, #000000)`
  - שלילי: `var(--apple-red, #FF3B30)`
  - אפס: `var(--apple-text-secondary, #3C3C43)`

#### **מטבע (currency_codes)**
- **פורמט:** קוד מטבע (USD, EUR, ILS)
- **יישור:** מרכז
- **פונט:** Regular

#### **סטטוס (is_active_statuses)**
- **פורמט:** תגית צבעונית
- **ערכים:**
  - `true` → "פעיל" (ירוק) - `var(--apple-green, #34C759)`
  - `false` → "לא פעיל" (אפור) - `var(--apple-gray-6, #8E8E93)`

#### **תאריך יצירה (created_at_times)**
- **פורמט:** `DD/MM/YYYY` (למשל: `20/01/2026`)
- **יישור:** מרכז
- **פונט:** Regular

#### **פעולות**
- **כפתורים:** "ערוך" | "מחק"
- **סגנון:** כפתורים קטנים (`btn-sm`)
- **יישור:** מרכז

### 6.3 דוגמת HTML מלאה

```html
<table class="phoenix-table">
  <thead class="phoenix-table__head">
    <tr class="phoenix-table__row">
      <th class="phoenix-table__header" data-sortable="true" data-sort-key="display_names" data-sort-type="string">
        <span class="phoenix-table__header-text">שם חשבון</span>
        <span class="phoenix-table__sort-indicator">
          <svg class="phoenix-table__sort-icon" data-sort-state="none" width="12" height="12">...</svg>
        </span>
      </th>
      <th class="phoenix-table__header" data-sortable="true" data-sort-key="broker_names" data-sort-type="string">
        <span class="phoenix-table__header-text">ברוקר</span>
        <span class="phoenix-table__sort-indicator">
          <svg class="phoenix-table__sort-icon" data-sort-state="none" width="12" height="12">...</svg>
        </span>
      </th>
      <th class="phoenix-table__header" data-sortable="true" data-sort-key="available_amounts" data-sort-type="numeric">
        <span class="phoenix-table__header-text">יתרה</span>
        <span class="phoenix-table__sort-indicator">
          <svg class="phoenix-table__sort-icon" data-sort-state="none" width="12" height="12">...</svg>
        </span>
      </th>
      <th class="phoenix-table__header" data-sortable="true" data-sort-key="currency_codes" data-sort-type="string">
        <span class="phoenix-table__header-text">מטבע</span>
        <span class="phoenix-table__sort-indicator">
          <svg class="phoenix-table__sort-icon" data-sort-state="none" width="12" height="12">...</svg>
        </span>
      </th>
      <th class="phoenix-table__header" data-sortable="true" data-sort-key="is_active_statuses" data-sort-type="boolean">
        <span class="phoenix-table__header-text">סטטוס</span>
        <span class="phoenix-table__sort-indicator">
          <svg class="phoenix-table__sort-icon" data-sort-state="none" width="12" height="12">...</svg>
        </span>
      </th>
      <th class="phoenix-table__header" data-sortable="true" data-sort-key="created_at_times" data-sort-type="date">
        <span class="phoenix-table__header-text">תאריך יצירה</span>
        <span class="phoenix-table__sort-indicator">
          <svg class="phoenix-table__sort-icon" data-sort-state="none" width="12" height="12">...</svg>
        </span>
      </th>
      <th class="phoenix-table__header" data-sortable="false">
        <span class="phoenix-table__header-text">פעולות</span>
      </th>
    </tr>
  </thead>
  <tbody class="phoenix-table__body">
    <tr class="phoenix-table__row">
      <td class="phoenix-table__cell" data-field="display_names">חשבון מסחר מרכזי (IBKR)</td>
      <td class="phoenix-table__cell" data-field="broker_names">Interactive Brokers</td>
      <td class="phoenix-table__cell phoenix-table__cell--numeric phoenix-table__cell--currency" data-field="available_amounts" data-currency="USD">$142,500.42</td>
      <td class="phoenix-table__cell" data-field="currency_codes">USD</td>
      <td class="phoenix-table__cell phoenix-table__cell--status" data-field="is_active_statuses">
        <span class="phoenix-table__status-badge phoenix-table__status-badge--active">פעיל</span>
      </td>
      <td class="phoenix-table__cell phoenix-table__cell--date" data-field="created_at_times">20/01/2026</td>
      <td class="phoenix-table__cell phoenix-table__cell--actions" data-field="actions">
        <button class="btn-sm btn-primary">ערוך</button>
        <button class="btn-sm btn-danger">מחק</button>
      </td>
    </tr>
  </tbody>
</table>
```

---

## 🎯 7. תוכנית מימוש מפורטת

### 7.1 שלב 1: יצירת מערכת הטבלאות הבסיסית

**משימות:**
- [ ] יצירת קובץ CSS `phoenix-tables.css` עם כל הסגנונות הבסיסיים
- [ ] הגדרת כל המחלקות עם תחילית `phoenix-table-*`
- [ ] יישום עיצוב בסיסי (צבעים, טיפוגרפיה, ריווח)
- [ ] וולידציית G-Bridge

**תוצר:** קובץ CSS מאושר עם סגנונות בסיסיים

### 7.2 שלב 2: יישום פונקציונליות סידור

**משימות:**
- [ ] יצירת `PhoenixTableSortManager` class
- [ ] יישום מחזור סידור (ASC → DESC → NONE)
- [ ] יישום Multi-sort (רמת סידור שניה עם Shift)
- [ ] עדכון UI (אייקונים, מצבים)
- [ ] בדיקות פונקציונליות

**תוצר:** מערכת סידור פונקציונלית

### 7.3 שלב 3: אינטגרציה עם מערכת הפילטרים

**משימות:**
- [ ] יצירת `PhoenixTableFilterManager` class
- [ ] אינטגרציה עם `header-filters` (פילטר ראשי)
- [ ] תמיכה בפילטרים פנימיים (`phoenix-table-filters`)
- [ ] שילוב פילטרים (גלובלי + מקומי)
- [ ] עדכון בזמן אמת
- [ ] שמירת מצב (URL/LocalStorage)

**תוצר:** מערכת פילטרים משולבת

### 7.4 שלב 4: יישום טבלה ראשונה (ניהול חשבונות מסחר)

**משימות:**
- [ ] יצירת HTML מלא לטבלה עם כל השדות
- [ ] יישום פורמט תצוגה לכל שדה
- [ ] אינטגרציה עם Backend API
- [ ] בדיקות פונקציונליות מלאות
- [ ] ולידציית G-Bridge
- [ ] בדיקת Visual Fidelity (LOD 400)

**תוצר:** טבלה ראשונה מאושרת ופונקציונלית

### 7.5 שלב 5: מיפוי ויישום שאר הטבלאות

**משימות:**
- [ ] מיפוי שדות לכל טבלה (Containers 2, 3, 4)
- [ ] יישום כל טבלה לפי המפרט
- [ ] בדיקות פונקציונליות לכל טבלה
- [ ] ולידציית G-Bridge לכל טבלה

**תוצר:** כל הטבלאות בעמוד מאושרות ופונקציונליות

---

## 📝 8. המלצות ותוספות

### 8.1 ביצועים (Performance)

**המלצה:** יישום Virtual Scrolling לטבלאות גדולות (>100 שורות)

**נימוק:** טבלאות גדולות עלולות לגרום לבעיות ביצועים. Virtual Scrolling יאפשר טעינה חלקה גם עם אלפי שורות.

**יישום:**
- שימוש ב-library כמו `react-window` או `vue-virtual-scroller` (אם רלוונטי)
- או יישום מותאם אישית ב-Vanilla JS

### 8.2 נגישות (Accessibility)

**המלצה:** הוספת תמיכה מלאה ב-ARIA attributes

**יישום:**
```html
<table class="phoenix-table" role="table" aria-label="ניהול חשבונות מסחר">
  <thead role="rowgroup">
    <tr role="row">
      <th role="columnheader" aria-sort="none" tabindex="0">
        <!-- Header content -->
      </th>
    </tr>
  </thead>
  <tbody role="rowgroup">
    <tr role="row">
      <td role="gridcell">...</td>
    </tr>
  </tbody>
</table>
```

### 8.3 Responsive Design

**המלצה:** תמיכה במצב מובייל עם horizontal scroll

**יישום:**
```css
@media (max-width: 768px) {
  .phoenix-table-wrapper {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  .phoenix-table {
    min-width: 800px; /* Minimum table width */
  }
}
```

### 8.4 Export Data

**המלצה:** הוספת אפשרות ייצוא נתונים (CSV/Excel)

**יישום:**
- כפתור "ייצא" בכותרת הטבלה
- ייצוא לפי הפילטרים הפעילים
- פורמט CSV או Excel

---

## ✅ 9. Checklist לאישור

לפני אישור המסמך, ודא:

- [ ] כל הדרישות מתועדות בבירור
- [ ] כל המחלקות CSS מוגדרות עם תחילית ברורה
- [ ] מפרט טכני מפורט לכל רכיב
- [ ] דוגמאות קוד מלאות
- [ ] תוכנית מימוש מפורטת
- [ ] המלצות ותוספות מתועדות

---

## 🔗 10. קישורים רלוונטיים

- `documentation/04-DESIGN_UX_UI/SYSTEM_WIDE_DESIGN_PATTERNS.md` - תבניות עיצוב כלליות
- `documentation/04-DESIGN_UX_UI/CONTAINER_HEADER_STRUCTURE_GUIDELINES.md` - הנחיות כותרות
- `documentation/01-ARCHITECTURE/LOGIC/WP_20_08_C_FIELD_MAP_TRADING_ACCOUNTS.md` - מפרט שדות חשבונות מסחר
- `documentation/01-ARCHITECTURE/LOGIC/WP_20_08_FIELD_MAP_CASH_FLOWS.md` - מפרט שדות תנועות מזומן
- `_COMMUNICATION/team_31/team_31_staging/phoenix-components.css` - קובץ CSS מרכיבים

---

**Team 31 (Blueprint)**  
**Date:** 2026-02-01  
**Status:** ⏳ **PENDING ARCHITECT APPROVAL**  
**Next Step:** העברה לצוות 10 ולאדריכל לאישור
