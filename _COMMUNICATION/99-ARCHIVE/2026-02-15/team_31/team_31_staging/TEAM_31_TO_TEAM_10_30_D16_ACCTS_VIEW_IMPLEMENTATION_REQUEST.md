# 📋 הודעה למימוש עמוד חשבונות מסחר (D16_ACCTS_VIEW)

**מאת:** Team 31 (Blueprint)  
**אל:** Team 10 (Gateway) + Team 30 (Frontend Implementation)  
**תאריך:** 2026-02-02  
**גרסת בלופרינט:** v1.0.13  
**סטטוס:** ✅ **READY FOR IMPLEMENTATION**

---

## 🎯 מטרת המסמך

מסמך זה מהווה הודעה רשמית למימוש עמוד **חשבונות מסחר (D16_ACCTS_VIEW)** - התבנית המאושרת והסופית שלנו לנושא **טבלאות במערכת**.

**חשיבות קריטית:** עמוד זה משמש כבסיס וכתבנית לכל הטבלאות במערכת. כל הטבלאות במערכת חייבות להיות מיושמות בהתאם לסטנדרטים והכללים המוגדרים כאן.

---

## 📥 הורדת חתימה (Signature Download)

### **שלב 1: גישה לקובץ הבלופרינט**

**מיקום הקובץ:**
```
_COMMUNICATION/team_31/team_31_staging/sandbox_v2/D16_ACCTS_VIEW.html
```

**קישור ישיר (אם זמין):**
```
file:///Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix/_COMMUNICATION/team_31/team_31_staging/sandbox_v2/D16_ACCTS_VIEW.html
```

### **שלב 2: פתיחת הקובץ בדפדפן**

1. פתח את הקובץ `D16_ACCTS_VIEW.html` בדפדפן (Chrome/Firefox/Safari)
2. ודא שהקובץ נטען ללא שגיאות בקונסולה
3. ודא שכל הקבצים החיצוניים נטענים (CSS, JS, תמונות)

### **שלב 3: בדיקת חתימה ויזואלית**

**אימותים נדרשים:**
- ✅ כל הטבלאות מוצגות בצורה נכונה
- ✅ כל הפילטרים עובדים
- ✅ כל הכפתורים והתפריטים פונקציונליים
- ✅ עיצוב אחיד ועקבי בכל העמוד
- ✅ אין שגיאות בקונסולה

### **שלב 4: השוואה למקור**

**קובץ מקור להשוואה:**
```
_COMMUNICATION/team_01/team_01_staging/D16_ACCTS_VIEW.html
```

**השוואה נדרשת:**
- השווה את המבנה ה-HTML
- השווה את המחלקות CSS
- השווה את הפונקציונליות
- ודא שכל האלמנטים קיימים

---

## 🔗 קישורים לכל הקבצים

### **קבצי בלופרינט (Blueprint Files)**

| קובץ | מיקום | תיאור |
|:---|:---|:---|
| **D16_ACCTS_VIEW.html** | `_COMMUNICATION/team_31/team_31_staging/sandbox_v2/D16_ACCTS_VIEW.html` | בלופרינט ראשי - עמוד חשבונות מסחר |
| **D15_PAGE_TEMPLATE_V3.html** | `_COMMUNICATION/team_31/team_31_staging/sandbox_v2/D15_PAGE_TEMPLATE_V3.html` | תבנית בסיסית V3 (להתייחסות) |

### **קבצי JavaScript חיצוניים**

| קובץ | מיקום | תיאור |
|:---|:---|:---|
| **header-dropdown.js** | `_COMMUNICATION/team_31/team_31_staging/sandbox_v2/header-dropdown.js` | פונקציונליות תפריטי דרופדאון |
| **header-filters.js** | `_COMMUNICATION/team_31/team_31_staging/sandbox_v2/header-filters.js` | פונקציונליות פילטרים גלובליים |
| **section-toggle.js** | `_COMMUNICATION/team_31/team_31_staging/sandbox_v2/section-toggle.js` | פונקציונליות הצגה/הסתרה של סקשנים |
| **portfolio-summary.js** | `_COMMUNICATION/team_31/team_31_staging/sandbox_v2/portfolio-summary.js` | פונקציונליות סיכום פורטפוליו |
| **footer-loader.js** | `_COMMUNICATION/team_31/team_31_staging/sandbox_v2/footer-loader.js` | טעינה דינמית של פוטר |
| **blueprint-validation.js** | `_COMMUNICATION/team_31/team_31_staging/sandbox_v2/blueprint-validation.js` | ולידציה של מבנה DOM |

### **קבצי CSS חיים במערכת (LIVE System Files)**

| קובץ | מיקום במערכת | תיאור |
|:---|:---|:---|
| **phoenix-base.css** | `ui/src/styles/phoenix-base.css` | סגנונות בסיסיים + CSS Variables |
| **phoenix-components.css** | `ui/src/styles/phoenix-components.css` | רכיבי LEGO System |
| **phoenix-header.css** | `ui/src/styles/phoenix-header.css` | סגנונות Unified Header |
| **D15_DASHBOARD_STYLES.css** | `ui/src/styles/D15_DASHBOARD_STYLES.css` | סגנונות ספציפיים לדשבורד |

### **קבצי תמונות ואייקונים חיים במערכת**

| תיקייה | מיקום במערכת | תיאור |
|:---|:---|:---|
| **אייקונים ישויות** | `ui/public/images/icons/entities/` | כל האייקונים של ישויות (trading_accounts.svg, cash_flows.svg, וכו') |
| **לוגו** | `ui/public/images/logo.svg` | לוגו TikTrack |

### **מסמכי תיעוד**

| מסמך | מיקום | תיאור |
|:---|:---|:---|
| **PHOENIX_TABLES_SPECIFICATION.md** | `_COMMUNICATION/team_31/team_31_staging/PHOENIX_TABLES_SPECIFICATION.md` | מפרט טכני מלא למערכת טבלאות |
| **D16_ACCTS_VIEW_TABLES_MAPPING.md** | `_COMMUNICATION/team_31/team_31_staging/D16_ACCTS_VIEW_TABLES_MAPPING.md` | מיפוי טבלאות בעמוד |
| **TEAM_31_WORKFLOW_V2_SETUP.md** | `_COMMUNICATION/team_31/team_31_staging/sandbox_v2/TEAM_31_WORKFLOW_V2_SETUP.md` | הנחיות עבודה V2 |

---

## 🎨 דיוקים ומידע חשוב

### **1. מבנה HTML - LEGO System**

**חובה:** כל העמוד חייב להיות מוקף במבנה LEGO הבסיסי:

```html
<tt-container>
  <tt-section data-section="section-name">
    <!-- CRITICAL: tt-section is transparent. Background is on header and body separately -->
    
    <!-- Section Header - White card with background -->
    <div class="index-section__header">
      <!-- Header content -->
    </div>
    
    <!-- Section Body - White card with background -->
    <div class="index-section__body">
      <tt-section-row>
        <!-- Content -->
      </tt-section-row>
    </div>
  </tt-section>
</tt-container>
```

**⚠️ קריטי:** `tt-section` הוא **שקוף** - הרקע נמצא על `.index-section__header` ו-`.index-section__body` בנפרד!

### **2. סדר טעינת CSS (CRITICAL - DO NOT CHANGE)**

**הסדר הוא קדוש - אין לחרוג ממנו:**

```html
<!-- 1. Pico CSS FIRST (Framework) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@1/css/pico.min.css">

<!-- 2. Phoenix Base Styles (Global defaults & DNA variables) -->
<link rel="stylesheet" href="../../../../ui/src/styles/phoenix-base.css">

<!-- 3. LEGO Components (Reusable components) -->
<link rel="stylesheet" href="../../../../ui/src/styles/phoenix-components.css">

<!-- 4. Header Component (Unified Header Styles) -->
<link rel="stylesheet" href="../../../../ui/src/styles/phoenix-header.css">

<!-- 5. Page-Specific Styles (Dashboard-specific styles) -->
<link rel="stylesheet" href="../../../../ui/src/styles/D15_DASHBOARD_STYLES.css">
```

### **3. מבנה טבלאות - Phoenix Tables System**

**כל טבלה חייבת להיות מוקפת במבנה הבא:**

```html
<div class="phoenix-table-wrapper">
  <table id="tableId" class="phoenix-table js-table" role="table" aria-label="תיאור הטבלה">
    <thead class="phoenix-table__head" role="rowgroup">
      <tr class="phoenix-table__row" role="row">
        <th class="phoenix-table__header col-column-name js-table-sort-trigger" 
            data-sortable="true" 
            data-sort-key="field_name" 
            data-sort-type="string|numeric|date" 
            role="columnheader" 
            aria-sort="none" 
            tabindex="0">
          <span class="phoenix-table__header-text">כותרת עמודה</span>
          <span class="phoenix-table__sort-indicator js-sort-indicator">
            <svg class="phoenix-table__sort-icon js-sort-icon" width="12" height="12">...</svg>
          </span>
        </th>
      </tr>
    </thead>
    <tbody class="phoenix-table__body" role="rowgroup">
      <tr class="phoenix-table__row" role="row">
        <td class="phoenix-table__cell col-column-name" data-field="field_name">
          <!-- Cell content -->
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

### **4. פילטרים פנימיים (Internal Filters)**

**מבנה HTML לפילטרים פנימיים:**

```html
<div class="phoenix-table-filters">
  <div class="phoenix-table-filter-group">
    <label class="phoenix-table-filter-label">תווית:</label>
    <select class="phoenix-table-filter-select js-table-filter" 
            data-filter-key="filter_key" 
            id="filterId">
      <option value="">כל הערכים</option>
      <option value="value1">ערך 1</option>
    </select>
  </div>
</div>
```

**⚠️ חשוב:** הפילטרים הפנימיים **לא** צריכים להיות עם `width: 100%` - יש להשתמש ב-`width: auto` עם `min-width` מתאים.

---

## ⚙️ ברירות מחדל והגדרות קריטיות

### **1. ריווח (Spacing) - כלל מערכתי יסודי**

**ברירת מחדל מערכתית:**
```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
```

**כל האלמנטים** במערכת מקבלים `margin: 0` ו-`padding: 0` כברירת מחדל. ריווח חייב להיות מוחל במפורש באמצעות מחלקות ריווח סטנדרטיות.

**מחלקות ריווח סטנדרטיות:**
- `.spacing-xs` / `.padding-xs`: `2px`
- `.spacing-sm` / `.padding-sm`: `4px`
- `.spacing-md` / `.padding-md`: `8px`
- `.spacing-lg` / `.padding-lg`: `10px`
- `.spacing-xl` / `.padding-xl`: `12px`
- `.margin-xs`: `2px`
- `.margin-sm`: `4px`
- `.margin-md`: `8px`
- `.margin-lg`: `10px`
- `.margin-xl`: `12px`

### **2. יישור עמודות מספריות**

**ברירת מחדל:** כל העמודות המספריות מיושרות **למרכז** (`text-align: center`).

**עמודות מספריות כוללות:**
- `col-balance` (יתרה)
- `col-amount` (סכום)
- `col-total-pl` (רווח/הפסד)
- `col-current_price` (מחיר נוכחי)
- `col-avg-price` (מחיר ממוצע)
- `col-market-value` (שווי שוק)
- `col-unrealized-pl` (P/L לא ממומש)
- `col-percent-account` (אחוז מהחשבון)
- `col-quantity` (כמות)
- `col-positions` (פוזיציות)

**יישום:**
```css
.phoenix-table__cell--numeric,
.phoenix-table__cell--currency,
.phoenix-table__cell.col-balance,
.phoenix-table__cell.col-amount,
/* ... כל העמודות המספריות ... */
{
  text-align: center !important;
}
```

### **3. יישור כותרות עמודות**

**ברירת מחדל:** כל כותרות העמודות מיושרות **למרכז** (`text-align: center`).

**יישום:**
```css
.phoenix-table__header {
  text-align: center;
}
```

### **4. מצבי מעבר עכבר (Hover States)**

**ברירת מחדל:** מעבר עכבר על אלמנטים (כמו כפתורי סידור) משנה את צבע הטקסט לצבע משני (`--apple-text-secondary`), **ללא** מסגרת וללא צבע ירוק.

**יישום:**
```css
.phoenix-table__header:hover {
  color: var(--apple-text-secondary, #3C3C43);
  /* NO border */
  /* NO green color/outline */
}
```

### **5. באגטים (Badges)**

**עיצוב סטנדרטי:**
- רקע: `rgba(color, 0.3)` (0.3 alpha)
- מסגרת: `1px solid` עם אותו צבע
- צבע טקסט: צבע מלא בהתאם לסוג

**דוגמה:**
```css
.phoenix-table__status-badge {
  background: rgba(52, 199, 89, 0.3); /* Green with 0.3 alpha */
  border: 1px solid var(--apple-green, #34C759);
  color: var(--apple-green, #34C759);
  padding: 2px 8px;
  border-radius: 4px;
  display: inline-block;
}
```

### **6. תפריט פעולות (Action Menu)**

**מאפיינים קריטיים:**
- נפתח במעבר עכבר (hover) - **לא** מוצג קבוע
- דיליי לסגירה: `0.5s` (לא `0.3s`)
- פדינג לקונטיינר: `4px`
- מיקום: `inset-inline-end: calc(100% + 1px)` (צמוד מאוד לכפתור)
- כפתורים: `margin: 0`, `padding: 0` - רק פדינג לקונטיינר

**יישום:**
```css
.table-actions-menu {
  padding: 4px; /* Only padding for container */
  inset-inline-end: calc(100% + 1px); /* Very close to trigger button */
  transition-delay: 0.5s; /* Delay for closing */
}

.table-action-btn {
  margin: 0;
  padding: 0; /* No padding for buttons themselves */
}
```

### **7. עמודת נוכחי (Current Price Column)**

**פורמט תצוגה:** תמיד מציג מחיר + שינוי יומי בפורמט: `$155.34(+3.22%)`

**מבנה HTML:**
```html
<td class="phoenix-table__cell col-current_price phoenix-table__cell--numeric phoenix-table__cell--currency">
  <div class="current-price-display">
    <span class="numeric-value-positive" dir="ltr">$155.34</span>
    <span class="numeric-value-positive" dir="ltr" style="font-size: 0.85em;">(+3.22%)</span>
  </div>
</td>
```

**יישור:** למרכז (כמו כל עמודה מספרית)

### **8. עמודת P/L (Unrealized P/L Column)**

**פורמט תצוגה:** תמיד מציג ערך מספרי + אחוז, סיפרה אחת אחרי הנקודה: `+$550.0(+3.5%)`

**מבנה HTML:**
```html
<td class="phoenix-table__cell col-unrealized-pl phoenix-table__cell--numeric phoenix-table__cell--currency">
  <div class="pl-display">
    <span class="pl-value numeric-value-positive" dir="ltr">+$550.0</span>
    <span class="pl-percentage numeric-value-positive" dir="ltr">(+3.5%)</span>
  </div>
</td>
```

### **9. עמודות בטבלת חשבונות מסחר**

**עמודות חובה:**
1. שם החשבון מסחר (`col-name`)
2. מטבע (`col-currency`)
3. יתרה (`col-balance`)
4. פוזיציות (`col-positions`)
5. רווח/הפסד (`col-total-pl`)
6. **שווי חשבון (`col-account-value`)** ⚠️ **חדש - חובה**
7. **שווי אחזקות (`col-holdings-value`)** ⚠️ **חדש - חובה**
8. סטטוס (`col-status`)
9. עודכן (`col-updated`)
10. פעולות (`col-actions`)

### **10. באגטים בדף חשבון לתאריך**

**סוג פעולה (`col-type`):**
- חיובי (`data-type-positive="true"`): צבע ירוק
- שלילי (`data-type-positive="false"`): צבע אדום

**תת-סוג פעולה (`col-subtype`):**
- באגט עם מניפת צבעים לפי חיובי/שלילי
- רקע: `rgba(color, 0.1)`
- מסגרת: `1px solid` עם אותו צבע
- טקסט: צבע מלא

### **11. אלמנט חלוקה לעמודים (Pagination)**

**מאפיינים:**
- כפתורים ומספר עמוד: `margin: 0`, `padding: 0`
- אין `margin-bottom: 14.7px` - יש לבטל ל-`0`

**יישום:**
```css
.phoenix-table-pagination__button,
.phoenix-table-pagination__page-number {
  padding: 0;
  margin: 0;
}
```

### **12. סיכום תנועות לחשבון - כרטיסים**

**מבנה:**
- Grid layout: `display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));`
- Gap: `var(--spacing-md, 16px)`
- כל כרטיס: רקע לבן, מסגרת, border-radius

### **13. יישור אנכי של כפתורים**

**`btn-view-alert`:**
- `align-self: flex-start !important` (יישור כלפי מעלה)
- `display: flex`
- `align-items: center`
- `justify-content: center`

**`.active-alerts__details`:**
- `align-items: flex-start !important` (יישור כלפי מעלה)

### **14. סיכום מידע - שורה שנייה**

**פונקציונליות:**
- לחיצה על כפתור העין (`portfolioSummaryToggleSize`) מציגה/מסתירה את השורה השנייה (`portfolioSummaryContent`)
- JavaScript רץ אחרי שה-DOM מוכן
- מצב התחלתי: שורה שנייה מוסתרת (`display: none`)

---

## 📊 מבנה העמוד - 5 קונטיינרים

### **Container 0: סיכום מידע והתראות פעילות**
- **תוכן:** התראות פעילות + סיכום מידע (info-summary)
- **פילטרים:** אין
- **טבלאות:** אין

### **Container 1: ניהול חשבונות מסחר**
- **תוכן:** טבלת חשבונות מסחר (`accountsTable`)
- **פילטרים:** אין (משתמש בפילטרים גלובליים בלבד)
- **עמודות:** 10 עמודות (כולל שווי חשבון ושווי אחזקות)

### **Container 2: סיכום תנועות לחשבון**
- **תוכן:** כרטיסי סיכום (לא טבלה)
- **פילטרים:** כן (טווח תאריכים)
- **טבלאות:** אין

### **Container 3: דף חשבון לתאריכים**
- **תוכן:** טבלת תנועות (`accountActivityTable`)
- **פילטרים:** כן (תאריכים + חשבון)
- **עמודות:** 8 עמודות (כולל באגטים לפי חיובי/שלילי)

### **Container 4: פוזיציות לפי חשבון**
- **תוכן:** טבלת פוזיציות (`positionsTable`)
- **פילטרים:** כן (חשבון)
- **עמודות:** 9 עמודות (כולל עמודת נוכחי עם מחיר+שינוי יומי, עמודת P/L עם ערך+אחוז)

---

## 🔄 עדכון מסמך התיעוד על טבלאות

### **מסמך לעדכון:**
`_COMMUNICATION/team_31/team_31_staging/PHOENIX_TABLES_SPECIFICATION.md`

### **עדכונים נדרשים:**

1. **הוספת סעיף על ברירות מחדל מערכתיות:**
   - ריווח: `margin: 0`, `padding: 0` לכל האלמנטים
   - יישור עמודות מספריות: למרכז
   - יישור כותרות: למרכז

2. **הוספת סעיף על פורמטי תצוגה:**
   - עמודת נוכחי: `$155.34(+3.22%)`
   - עמודת P/L: `+$550.0(+3.5%)`

3. **הוספת סעיף על באגטים:**
   - עיצוב סטנדרטי: רקע 0.3 alpha, מסגרת, צבע טקסט
   - באגטים לפי חיובי/שלילי

4. **הוספת סעיף על תפריט פעולות:**
   - נפתח במעבר עכבר
   - דיליי לסגירה: 0.5s
   - פדינג לקונטיינר: 4px

5. **הוספת סעיף על עמודות בטבלת חשבונות מסחר:**
   - שווי חשבון (`col-account-value`)
   - שווי אחזקות (`col-holdings-value`)

6. **עדכון סעיף על פילטרים פנימיים:**
   - אין `width: 100%` - יש להשתמש ב-`width: auto` עם `min-width`

7. **הוספת סעיף על אלמנט חלוקה לעמודים:**
   - `margin: 0`, `padding: 0` לכפתורים ומספר עמוד

---

## ✅ Checklist למימוש

### **מבנה HTML**
- [ ] כל הסקשנים מוקפים ב-`tt-section` (שקוף)
- [ ] כל הסקשנים מכילים `.index-section__header` ו-`.index-section__body` (עם רקע נפרד)
- [ ] כל הטבלאות מוקפות ב-`.phoenix-table-wrapper`
- [ ] כל הטבלאות משתמשות במחלקות `phoenix-table-*`
- [ ] כל העמודות המספריות עם `text-align: center`
- [ ] כל כותרות העמודות עם `text-align: center`

### **CSS**
- [ ] סדר טעינת CSS נכון (Pico → Base → Components → Header → Dashboard)
- [ ] כל הערכים משתמשים ב-CSS Variables
- [ ] אין ערכי צבע hardcoded
- [ ] ריווח: `margin: 0`, `padding: 0` לכל האלמנטים (ברירת מחדל)
- [ ] ריווח מוחל במפורש באמצעות מחלקות סטנדרטיות

### **טבלאות**
- [ ] כל הטבלאות עם מבנה נכון (`phoenix-table`, `phoenix-table__head`, `phoenix-table__body`)
- [ ] כל העמודות המספריות מיושרות למרכז
- [ ] כל כותרות העמודות מיושרות למרכז
- [ ] תפריט פעולות נפתח במעבר עכבר (לא מוצג קבוע)
- [ ] דיליי לסגירה: 0.5s
- [ ] פדינג לקונטיינר תפריט פעולות: 4px
- [ ] באגטים עם עיצוב נכון (0.3 alpha, מסגרת, צבע טקסט)

### **פילטרים**
- [ ] פילטרים פנימיים עם `width: auto` (לא `width: 100%`)
- [ ] פילטרים פנימיים עם `min-width` מתאים

### **פונקציונליות**
- [ ] סידור טבלאות עובד (לחיצה על כותרות)
- [ ] פילטרים עובדים (גלובליים + פנימיים)
- [ ] תפריט פעולות נפתח ונסגר נכון
- [ ] סיכום מידע - שורה שנייה עובדת (לחיצה על כפתור עין)
- [ ] אלמנט חלוקה לעמודים עובד

### **תוכן**
- [ ] כל הטקסטים בעברית (RTL)
- [ ] כל האייקונים מקושרים נכון
- [ ] כל התמונות מקושרות נכון
- [ ] אין שגיאות בקונסולה

---

## 📝 הערות נוספות

### **1. Clean Slate Rule**
- כל ה-JavaScript חייב להיות בקובצי JS חיצוניים
- אין תגי `<script>` inline (חוץ מ-scripts ספציפיים שצוינו בבלופרינט)
- שימוש ב-`js-` prefixed classes (לא BEM classes)

### **2. RTL Support**
- כל העמוד ב-RTL (`dir="rtl"`)
- יישור מספרים: למרכז (לא ימין/שמאל)
- יישור טקסט: שמאל (RTL)

### **3. Accessibility**
- כל הטבלאות עם `role="table"` ו-`aria-label`
- כל הכותרות עם `role="columnheader"` ו-`aria-sort`
- כל השורות עם `role="row"`
- כל התאים עם `role="gridcell"` או `role="columnheader"`

### **4. Performance**
- אין inline styles מיותרים
- כל הסגנונות בקובצי CSS חיצוניים
- שימוש ב-CSS Variables ליעילות

---

## 🎯 סיכום

עמוד **D16_ACCTS_VIEW** הוא התבנית המאושרת והסופית שלנו לנושא **טבלאות במערכת**. כל הטבלאות במערכת חייבות להיות מיושמות בהתאם לסטנדרטים והכללים המוגדרים כאן.

**חשיבות קריטית:**
- זהו העמוד הראשון עם טבלאות מלאות במערכת
- זהו הבסיס לכל הטבלאות העתידיות
- כל סטייה מהסטנדרטים תדרוש אישור מפורש מצוות 10

---

**Team 31 (Blueprint)**  
**תאריך:** 2026-02-02  
**גרסה:** v1.0.13  
**סטטוס:** ✅ **READY FOR IMPLEMENTATION**

---

## 📞 שאלות ותמיכה

לכל שאלה או הבהרה, אנא פנו ל-**Team 10 (Gateway)** או ל-**Team 31 (Blueprint)**.

**קישורים נוספים:**
- מסמך מפרט טבלאות: `_COMMUNICATION/team_31/team_31_staging/PHOENIX_TABLES_SPECIFICATION.md`
- מיפוי טבלאות: `_COMMUNICATION/team_31/team_31_staging/D16_ACCTS_VIEW_TABLES_MAPPING.md`
- הנחיות עבודה V2: `_COMMUNICATION/team_31/team_31_staging/sandbox_v2/TEAM_31_WORKFLOW_V2_SETUP.md`
