# 📘 מדריך יישום מפורט: D18_BRKRS_VIEW ו-D21_CASH_VIEW

**⚠️ הערה חשובה:** מסמך זה נוצר לפני תהליך התיקונים העמוק. יש לוודא עמידה בנהלים החדשים (transformers.js, קישורי SSOT).

**מאת:** Team 31 (Blueprint)  
**תאריך:** 2026-01-31  
**גרסה:** v1.0.1 (Updated - Compliance Note Added)  
**סטטוס:** ✅ **READY FOR IMPLEMENTATION**

---

## 📋 תוכן עניינים

1. [סקירה כללית](#סקירה-כללית)
2. [מבנה הקבצים](#מבנה-הקבצים)
3. [מבנה HTML מפורט](#מבנה-html-מפורט)
4. [CSS Architecture](#css-architecture)
5. [JavaScript Requirements](#javascript-requirements)
6. [טבלאות - מבנה מפורט](#טבלאות---מבנה-מפורט)
7. [פילטרים וסינון](#פילטרים-וסינון)
8. [פאגינציה](#פאגינציה)
9. [פעולות (Actions)](#פעולות-actions)
10. [Edge Cases והערות חשובות](#edge-cases-והערות-חשובות)
11. [בדיקות ואימות](#בדיקות-ואימות)

---

## 🎯 סקירה כללית

### עמודים שנוצרו

1. **D18_BRKRS_VIEW.html** - עמוד ברוקרים ועמלות
2. **D21_CASH_VIEW.html** - עמוד תזרימי מזומנים

### עקרונות יסוד

- ✅ **מבוסס על D16_ACCTS_VIEW.html** - מבנה זהה ותבנית אחידה
- ✅ **Final Governance Lock Compliant** - עומד בכל הקללים החדשים
- ✅ **RTL Support** - תמיכה מלאה בעברית מימין לשמאל
- ✅ **Fluid Design** - רספונסיביות אוטומטית ללא Media Queries
- ✅ **Design Tokens SSOT** - שימוש ב-`phoenix-base.css` בלבד
- ✅ **Clean Slate Rule** - JavaScript חיצוני בלבד
- ✅ **LEGO System** - מבנה מודולרי (`tt-container > tt-section`)

---

## 📁 מבנה הקבצים

### קבצי Blueprint

```
_COMMUNICATION/team_31/team_31_staging/sandbox_v2/
├── D18_BRKRS_VIEW.html          # Blueprint - עמוד ברוקרים
├── D21_CASH_VIEW.html           # Blueprint - עמוד תזרימי מזומנים
└── index.html                   # אינדקס הסנדבוקס (מעודכן)
```

### קבצי CSS (LIVE - מהמערכת)

הבלופרינטים משתמשים בקבצי CSS חיים מהמערכת:

```
ui/src/styles/
├── phoenix-base.css             # Design Tokens & Global Styles (SSOT)
├── phoenix-components.css       # LEGO Components (Tables, Badges, Pagination)
├── phoenix-header.css           # Unified Header Styles
└── D15_DASHBOARD_STYLES.css     # Dashboard-specific styles
```

### קבצי JavaScript (חיצוניים)

```
_COMMUNICATION/team_31/team_31_staging/sandbox_v2/
├── header-filters.js            # פונקציונליות פילטרים
├── header-dropdown.js           # תפריטי נפתחים
├── footer-loader.js             # טעינת Footer דינמית
└── section-toggle.js            # הצגה/הסתרה של סקשנים
```

---

## 🏗️ מבנה HTML מפורט

### מבנה עמוד בסיסי

```html
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <!-- CSS Loading Order (CRITICAL - DO NOT CHANGE) -->
  <!-- 1. Pico CSS FIRST -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@1/css/pico.min.css">
  
  <!-- 2. Phoenix Base Styles (Global defaults & DNA variables) - LIVE FILE -->
  <link rel="stylesheet" href="../../../../ui/src/styles/phoenix-base.css">
  
  <!-- 3. LEGO Components (Reusable components) - LIVE FILE -->
  <link rel="stylesheet" href="../../../../ui/src/styles/phoenix-components.css">
  
  <!-- 4. Header Component (Unified Header Styles) - LIVE FILE -->
  <link rel="stylesheet" href="../../../../ui/src/styles/phoenix-header.css">
  
  <!-- 5. Page-Specific Styles (Dashboard-specific styles) - LIVE FILE -->
  <link rel="stylesheet" href="../../../../ui/src/styles/D15_DASHBOARD_STYLES.css">
  
  <!-- Lucide Icons -->
  <script src="https://unpkg.com/lucide@latest"></script>
  
  <!-- Page-Specific Styles (MINIMAL - only fixes) -->
  <style>
    /* PAGE-SPECIFIC FIXES ONLY */
    /* All standard styles are in phoenix-components.css */
  </style>
</head>
<body>
  <!-- Unified Header -->
  <header id="unified-header" class="unified-header">
    <!-- Header structure -->
  </header>
  
  <!-- Page Content -->
  <div class="page-wrapper">
    <div class="page-container">
      <main>
        <tt-container>
          <tt-section>
            <!-- Section Header -->
            <div class="index-section__header">
              <!-- Title, filters, etc. -->
            </div>
            
            <!-- Section Body -->
            <div class="index-section__body">
              <!-- Tables, content, etc. -->
            </div>
          </tt-section>
        </tt-container>
      </main>
    </div>
  </div>
  
  <!-- Footer (loaded dynamically) -->
  <footer id="phoenix-footer"></footer>
  
  <!-- JavaScript (External only) -->
  <script src="./footer-loader.js"></script>
  <script src="./header-filters.js"></script>
  <script src="./header-dropdown.js"></script>
</body>
</html>
```

---

## 🎨 CSS Architecture

### היררכיית קבצי CSS

| סגנון | מיקום | תיאור |
|------|-------|------|
| **Design Tokens** | `phoenix-base.css` | CSS Variables, Global defaults, Typography |
| **Components** | `phoenix-components.css` | Tables, Badges, Pagination, Cards |
| **Header** | `phoenix-header.css` | Unified Header, Filters, Dropdowns |
| **Dashboard** | `D15_DASHBOARD_STYLES.css` | Dashboard-specific styles |
| **Page Fixes** | Inline `<style>` | רק תיקונים ספציפיים לעמוד |

### עקרונות CSS

1. **אין `!important`** - רק במקרים קריטיים (כמו override של Pico CSS)
2. **שימוש במחלקות קבועות** - `padding-xs`, `margin-xs`, וכו'
3. **RTL Support** - שימוש ב-logical properties (`margin-inline-start`, `padding-inline-end`)
4. **Fluid Design** - `clamp()`, `min()`, `max()`, Grid `auto-fit/auto-fill`

---

## 📊 טבלאות - מבנה מפורט

### D18_BRKRS_VIEW - טבלת ברוקרים

#### עמודות הטבלה

| עמודה | Class | סוג | מיון | יישור | הערות |
|------|-------|-----|------|-------|------|
| ברוקר | `col-broker` | string | ✅ | right | שם הברוקר |
| סוג עמלה | `col-commission-type` | string | ✅ | center | Badge צבעוני (Tiered/Flat) |
| ערך עמלה | `col-commission-value` | string | ✅ | center | ערך העמלה |
| מינימום לפעולה | `col-minimum` | numeric | ✅ | center | מטבע (USD) |
| פעולות | `col-actions` | actions | ❌ | center | תפריט פעולות |

#### מבנה HTML

```html
<table id="brokersTable" class="phoenix-table js-table" data-table-type="brokers">
  <thead>
    <tr>
      <th class="phoenix-table__header col-broker js-table-sort-trigger" 
          data-sortable="true" data-sort-key="broker" data-sort-type="string">
        <span class="phoenix-table__header-text">ברוקר</span>
        <span class="phoenix-table__sort-indicator js-sort-indicator"></span>
      </th>
      <!-- ... more headers ... -->
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="phoenix-table__cell col-broker">Interactive Brokers</td>
      <td class="phoenix-table__cell col-commission-type">
        <span class="phoenix-table__status-badge badge-tiered">Tiered</span>
      </td>
      <td class="phoenix-table__cell col-commission-value phoenix-table__cell--numeric">
        0.0035 $ / Share
      </td>
      <td class="phoenix-table__cell col-minimum phoenix-table__cell--numeric phoenix-table__cell--currency">
        <span class="numeric-value-positive" dir="ltr">$0.35</span>
      </td>
      <td class="phoenix-table__cell col-actions phoenix-table__cell--actions">
        <!-- Action menu dropdown -->
      </td>
    </tr>
  </tbody>
</table>
```

#### Badge צבעוני לסוג עמלה

```html
<!-- Tiered -->
<span class="phoenix-table__status-badge badge-tiered">Tiered</span>

<!-- Flat -->
<span class="phoenix-table__status-badge badge-flat">Flat</span>
```

**CSS Classes:**
- `badge-tiered` - צבע כחול/טורקיז
- `badge-flat` - צבע כתום/אדום

---

### D21_CASH_VIEW - טבלת תזרימי מזומנים

#### טבלה 1: תזרימי מזומנים

| עמודה | Class | סוג | מיון | יישור | הערות |
|------|-------|-----|------|-------|------|
| טרייד | `col-trade` | string | ✅ | center | מספר טרייד |
| חשבון מסחר | `col-account` | string | ✅ | right | שם החשבון |
| סוג | `col-type` | string | ✅ | center | Badge צבעוני |
| סכום | `col-amount` | numeric | ✅ | center | מטבע, צבע +/- |
| תאריך | `col-date` | date | ✅ | center | תאריך פעולה |
| תיאור | `col-description` | string | ✅ | right | תיאור התנועה |
| מקור | `col-source` | string | ✅ | right | מקור התנועה |
| עודכן | `col-updated` | date | ✅ | center | תאריך עדכון |
| פעולות | `col-actions` | actions | ❌ | center | תפריט פעולות |

#### טבלה 2: המרות מטבע

| עמודה | Class | סוג | מיון | יישור | הערות |
|------|-------|-----|------|-------|------|
| תאריך | `col-date` | date | ✅ | center | תאריך המרה |
| חשבון מסחר | `col-account` | string | ✅ | right | שם החשבון |
| מה־ | `col-from` | string | ✅ | center | מטבע מקור |
| ל־ | `col-to` | string | ✅ | center | מטבע יעד |
| שער משוער | `col-rate` | numeric | ✅ | center | שער המרה |
| זיהוי | `col-id` | string | ✅ | center | מזהה ייחודי |
| פעולות | `col-actions` | actions | ❌ | center | תפריט פעולות |

#### מבנה HTML - טבלה 1

```html
<table id="cashFlowsTable" class="phoenix-table js-table" data-table-type="cash_flows">
  <thead>
    <tr>
      <th class="phoenix-table__header col-trade js-table-sort-trigger" 
          data-sortable="true" data-sort-key="trade" data-sort-type="string">
        <span class="phoenix-table__header-text">טרייד</span>
        <span class="phoenix-table__sort-indicator js-sort-indicator"></span>
      </th>
      <!-- ... more headers ... -->
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="phoenix-table__cell col-trade">12345</td>
      <td class="phoenix-table__cell col-account">IBKR - Main</td>
      <td class="phoenix-table__cell col-type">
        <span class="phoenix-table__status-badge badge-deposit">הפקדה</span>
      </td>
      <td class="phoenix-table__cell col-amount phoenix-table__cell--numeric phoenix-table__cell--currency">
        <span class="numeric-value-positive" dir="ltr">+$5,000.00</span>
      </td>
      <!-- ... more cells ... -->
    </tr>
  </tbody>
</table>
```

#### Badge צבעוני לסוג תנועה

```html
<!-- הפקדה -->
<span class="phoenix-table__status-badge badge-deposit">הפקדה</span>

<!-- משיכה -->
<span class="phoenix-table__status-badge badge-withdrawal">משיכה</span>

<!-- דיבידנד -->
<span class="phoenix-table__status-badge badge-dividend">דיבידנד</span>

<!-- ריבית -->
<span class="phoenix-table__status-badge badge-interest">ריבית</span>

<!-- עמלה -->
<span class="phoenix-table__status-badge badge-fee">עמלה</span>

<!-- אחר -->
<span class="phoenix-table__status-badge badge-other">אחר</span>
```

**CSS Classes:**
- `badge-deposit` - צבע ירוק (הפקדה)
- `badge-withdrawal` - צבע אדום (משיכה)
- `badge-dividend` - צבע כחול (דיבידנד)
- `badge-interest` - צבע סגול (ריבית)
- `badge-fee` - צבע כתום (עמלה)
- `badge-other` - צבע אפור (אחר)

---

## 🔍 פילטרים וסינון

### מבנה פילטרים

```html
<div class="filters-container">
  <!-- Filter Groups -->
  <div class="filter-group">
    <div class="filter-dropdown">
      <button class="filter-toggle js-filter-toggle" data-filter-type="broker">
        <span class="selected-value">כל הברוקרים</span>
        <span class="dropdown-arrow">▼</span>
      </button>
      <!-- Dropdown menu -->
    </div>
  </div>
  
  <!-- Search Filter -->
  <div class="filter-group">
    <div class="search-filter">
      <div class="search-input-wrapper">
        <input type="text" 
               class="search-filter-input" 
               placeholder="חיפוש..." 
               data-search-target="brokersTable">
      </div>
    </div>
  </div>
  
  <!-- Filter Actions -->
  <div class="filter-actions">
    <button class="reset-btn js-filter-reset" onclick="resetAllFilters()" title="איפוס פילטרים">
      <span class="btn-text">↻</span>
    </button>
    <button class="clear-btn js-filter-clear" onclick="clearAllFilters()" title="נקה כל הפילטרים">
      <span class="btn-text">×</span>
    </button>
  </div>
  
  <!-- User Profile Link -->
  <div class="filter-user-section">
    <a href="/user_profile" class="user-profile-link" id="filterUserProfileLink" title="פרופיל משתמש">
      <svg class="user-icon" width="19.2" height="19.2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    </a>
  </div>
</div>
```

### פילטרים ספציפיים

#### D18_BRKRS_VIEW
- **ברוקר** - Dropdown עם רשימת ברוקרים
- **סוג עמלה** - Dropdown (Tiered/Flat/הכל)
- **חיפוש** - שדה טקסט לחיפוש חופשי

#### D21_CASH_VIEW
- **חשבון מסחר** - Dropdown עם רשימת חשבונות
- **סוג תנועה** - Dropdown (הפקדה/משיכה/דיבידנד/ריבית/עמלה/אחר/הכל)
- **טווח תאריכים** - Date range picker
- **חיפוש** - שדה טקסט לחיפוש חופשי

---

## 📄 פאגינציה

### מבנה פאגינציה

```html
<div class="pagination-info">
  <span class="pagination-text">
    מציג <span class="pagination-current">1</span> - 
    <span class="pagination-total">10</span> מתוך 
    <span class="pagination-count">25</span> רשומות
  </span>
</div>

<div class="pagination-controls">
  <button class="pagination-btn pagination-btn--prev" disabled>
    <span>← הקודם</span>
  </button>
  <div class="pagination-numbers">
    <button class="pagination-number pagination-number--active">1</button>
    <button class="pagination-number">2</button>
    <button class="pagination-number">3</button>
  </div>
  <button class="pagination-btn pagination-btn--next">
    <span>הבא →</span>
  </button>
</div>
```

### מיקום פאגינציה

**חשוב:** פאגינציה תמיד בתחתית הטבלה (לפני סגירת `</div class="index-section__body">`).

---

## ⚙️ פעולות (Actions)

### מבנה תפריט פעולות

```html
<td class="phoenix-table__cell col-actions phoenix-table__cell--actions">
  <div class="actions-menu">
    <button class="actions-menu-toggle" aria-label="תפריט פעולות">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="1"></circle>
        <circle cx="12" cy="5" r="1"></circle>
        <circle cx="12" cy="19" r="1"></circle>
      </svg>
    </button>
    <ul class="actions-menu-dropdown">
      <li>
        <a href="#" class="actions-menu-item" data-action="edit">
          <svg><!-- Edit icon --></svg>
          <span>עריכה</span>
        </a>
      </li>
      <li>
        <a href="#" class="actions-menu-item" data-action="delete">
          <svg><!-- Delete icon --></svg>
          <span>מחיקה</span>
        </a>
      </li>
    </ul>
  </div>
</td>
```

### פעולות זמינות

#### D18_BRKRS_VIEW
- **עריכה** - עריכת פרטי ברוקר
- **מחיקה** - מחיקת ברוקר
- **הצגה** - הצגת פרטים מלאים

**הערה:** אין כפתור "ביטול" בתפריט הפעולות.

#### D21_CASH_VIEW
- **עריכה** - עריכת תזרים מזומנים
- **מחיקה** - מחיקת תזרים
- **הצגה** - הצגת פרטים מלאים

---

## ⚠️ Edge Cases והערות חשובות

### 1. RTL Alignment

**חשוב:** כל היישורים במערכת הם RTL (מימין לשמאל).

- **תחילת שורה** = שמאל (RTL)
- **סוף שורה** = ימין (RTL)
- שימוש ב-logical properties: `margin-inline-start`, `padding-inline-end`

### 2. Header Alignment

- **`user-profile-link`** - מיושר לסוף השורה (ימין ב-RTL) ולאמצע בגובה
- **`reset-btn` ו-`clear-btn`** - מיושרים לתחילת השורה (שמאל ב-RTL)

### 3. Filter Dropdown Alignment

- כל הדרופ-דאונים ושדות הטקסט מיושרים לאמצע בגובה (`align-items: center`)
- `margin-bottom: 0` לכל כפתורי הפילטר

### 4. Logo Section

- שימוש במחלקה קבועה: `class="logo-section padding-xs"`
- **אין `!important`** - רק מחלקות קבועות

### 5. CSS Duplication

- **אין כפילויות** - כל הסגנונות הסטנדרטיים ב-`phoenix-components.css`
- רק תיקונים ספציפיים לעמוד ב-inline `<style>`

### 6. תפריטי משנה (Level 2)

- **פדינג רגיל:** `padding: 0.5rem 1rem`
- **מרגינג מלמעלה ולמטה:** `margin-top: 0.5rem`, `margin-bottom: 0.5rem`
- **אין margin שלילי** - רק לתפריט ראשי (Level 1)

---

## ✅ בדיקות ואימות

### רשימת בדיקות

#### מבנה HTML
- [ ] מבנה עמוד תקין (`page-wrapper > page-container > main > tt-container > tt-section`)
- [ ] Header מלא עם כל הפילטרים
- [ ] Footer נטען דינמית
- [ ] אין JavaScript inline

#### CSS
- [ ] כל קבצי CSS נטענים בסדר הנכון
- [ ] אין כפילויות CSS
- [ ] RTL alignment תקין
- [ ] Header alignment תקין (user icon, reset/clear buttons)
- [ ] Filter alignment תקין (vertical center)

#### טבלאות
- [ ] כל העמודות מוצגות נכון
- [ ] Badges צבעוניים מוצגים נכון
- [ ] מיון עובד (אם מיושם)
- [ ] פאגינציה בתחתית הטבלה

#### פילטרים
- [ ] כל הפילטרים מוצגים נכון
- [ ] Dropdowns עובדים
- [ ] חיפוש עובד (אם מיושם)
- [ ] כפתורי Reset/Clear עובדים

#### פעולות
- [ ] תפריט פעולות עובד
- [ ] כל הפעולות זמינות
- [ ] אין כפתור "ביטול" (D18, D21)

#### Responsive
- [ ] עמוד רספונסיבי (Fluid Design)
- [ ] טבלאות מתאימות למסכים קטנים
- [ ] פילטרים מתאימים למסכים קטנים

---

## 📝 הערות יישום

### שלבי יישום מומלצים

1. **העתקת קבצי Blueprint** - העתק את הקבצים למיקום הייצור
2. **התאמת נתיבי CSS** - עדכן נתיבים למיקום הייצור
3. **התאמת נתיבי JavaScript** - עדכן נתיבים למיקום הייצור
4. **חיבור Backend** - חיבור ל-API endpoints
5. **יישום פונקציונליות** - מיון, סינון, פאגינציה
6. **בדיקות** - בדיקות מלאות לפי הרשימה לעיל

### קבצים נדרשים ליישום

#### CSS (LIVE - מהמערכת)
- `ui/src/styles/phoenix-base.css`
- `ui/src/styles/phoenix-components.css`
- `ui/src/styles/phoenix-header.css`
- `ui/src/styles/D15_DASHBOARD_STYLES.css`

#### JavaScript (חיצוני)
- `footer-loader.js`
- `header-filters.js`
- `header-dropdown.js`
- `section-toggle.js` (אם נדרש)

---

## 🔗 קישורים רלוונטיים

- **Blueprint Files:** `_COMMUNICATION/team_31/team_31_staging/sandbox_v2/`
- **D16 Reference:** `D16_ACCTS_VIEW.html` - תבנית בסיסית
- **CSS Files:** `ui/src/styles/`
- **Index:** `index.html` - אינדקס הסנדבוקס

---

**חתימה:**  
Team 31 (Blueprint)  
**Date:** 2026-01-31  
**Status:** ✅ **READY FOR IMPLEMENTATION**
