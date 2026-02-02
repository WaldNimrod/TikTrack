# 📘 מדריך מפורט: עמוד חשבונות מסחר (D16_ACCTS_VIEW) - מערכת טבלאות

**תאריך:** 2026-01-31  
**צוות:** Team 01  
**סטטוס:** ✅ מוכן לפיתוח  
**גרסה:** v1.0.0

---

## 🎯 מטרת המסמך

מדריך זה מתמקד במערכת הטבלאות בעמוד חשבונות מסחר (D16_ACCTS_VIEW). זהו המדריך המרכזי לפיתוח הטבלאות בעמוד זה.

---

## 📐 מבנה העמוד - 5 קונטיינרים

### Container 0: סיכום מידע והתראות פעילות
**כותרת:** "חשבונות מסחר"  
**תוכן:** LEGO System - `active-alerts` + `info-summary`  
**מבנה:** `tt-section` עם `index-section__header` ו-`index-section__body`  
**טבלאות:** אין טבלה - רק וויגיטים

### Container 1: ניהול חשבונות מסחר
**כותרת:** "ניהול חשבונות מסחר"  
**תוכן:** טבלה ראשית לניהול חשבונות  
**טבלה ID:** `accountsTable`  
**Data Table Type:** `trading_accounts`

#### עמודות הטבלה (8 עמודות):

| Index | שם עמודה | CSS Class | Sortable | Data Field | Render Type |
|-------|-----------|-----------|----------|------------|-------------|
| 0 | שם חשבון | `col-name` | ✅ | `display_names` | טקסט רגיל |
| 1 | ברוקר | `col-broker` | ✅ | `broker_names` | טקסט רגיל |
| 2 | יתרה | `col-balance` | ✅ | `available_amounts` | מספר + מטבע |
| 3 | מטבע | `col-currency` | ✅ | `currency_codes` | טקסט קצר |
| 4 | סטטוס | `col-status` | ✅ | `is_active_statuses` | Badge (פעיל/לא פעיל) |
| 5 | תאריך יצירה | `col-created` | ✅ | `created_at_times` | תאריך |
| 6 | פעולות | `col-actions` | ❌ | - | Actions Menu |

#### דוגמאות נתונים:
- **שם חשבון:** "חשבון מסחר מרכזי (IBKR)"
- **ברוקר:** "Interactive Brokers"
- **יתרה:** "$142,500.42" (USD)
- **מטבע:** "USD"
- **סטטוס:** Badge "פעיל" (ירוק) / "לא פעיל" (אפור)
- **תאריך יצירה:** "20/01/2026"

---

### Container 2: סיכום תנועות בחשבון
**כותרת:** "סיכום תנועות בחשבון"  
**תוכן:** כרטיסי סיכום (לא טבלה)  
**מבנה:** Grid של כרטיסים עם `.phoenix-card--summary`  
**פילטרים:** טווח תאריכים (`#movementsDateRange`)

#### כרטיסי סיכום:
- **כרטיס 1:** סה"כ הפקדות
- **כרטיס 2:** סה"כ משיכות
- **כרטיס 3:** יתרה נוכחית
- **כרטיס 4:** מספר תנועות

**סגנונות:** משתמש ב-`.phoenix-card--summary` מ-`phoenix-cards.css`

---

### Container 3: דף חשבון לתאריכים
**כותרת:** "דף חשבון לתאריכים"  
**תוכן:** טבלת תנועות חשבון  
**טבלה ID:** `accountActivityTable`  
**פילטרים:** טווח תאריכים (`#accountByDatesDateRange`)

#### עמודות הטבלה (8 עמודות):

| Index | שם עמודה | CSS Class | Sortable | Data Field | Render Type |
|-------|-----------|-----------|----------|------------|-------------|
| 0 | תאריך פעולה | `col-date` | ✅ | `transaction_date` | תאריך |
| 1 | סוג | `col-type` | ✅ | `transaction_type` | טקסט + צבע (חיובי/שלילי) |
| 2 | תת-סוג | `col-subtype` | ✅ | `transaction_subtype` | טקסט + צבע (חיובי/שלילי) |
| 3 | טיקר | `col-ticker` | ✅ | `ticker_symbol` | לינק לטיקר |
| 4 | סכום | `col-amount` | ✅ | `amount` | מספר + מטבע |
| 5 | מטבע | `col-currency` | ✅ | `currency_code` | טקסט קצר |
| 6 | יתרה שוטפת | `col-balance` | ✅ | `running_balance` | מספר + מטבע |
| 7 | פעולות | `col-actions` | ❌ | - | Actions Menu |

#### צביעת סוג ותת-סוג:
- **חיובי** (כסף נכנס): `data-type-positive="true"` → צבע ירוק
- **שלילי** (כסף יוצא): `data-type-positive="false"` → צבע אדום

---

### Container 4: פוזיציות לפי חשבון
**כותרת:** "פוזיציות לפי חשבון"  
**תוכן:** טבלת פוזיציות  
**טבלה ID:** `positionsTable`  
**פילטרים:** חשבון (`#positionsAccountFilter`)

#### עמודות הטבלה (9 עמודות):

| Index | שם עמודה | CSS Class | Sortable | Data Field | Render Type |
|-------|-----------|-----------|----------|------------|-------------|
| 0 | סימבול | `col-symbol` | ✅ | `symbol` | לינק לטיקר |
| 1 | כמות | `col-quantity` | ✅ | `quantity` | מספר עם `#` prefix |
| 2 | צד | `col-side` | ✅ | `side` | Badge (Long/Short) |
| 3 | מחיר ממוצע | `col-avg-price` | ✅ | `avg_price` | מספר + מטבע |
| 4 | שווי שוק | `col-market-value` | ✅ | `market_value` | מספר + מטבע |
| 5 | P/L לא ממומש | `col-unrealized-pl` | ✅ | `unrealized_pl` | מספר + מטבע + צבע |
| 6 | אחוז מהחשבון | `col-percent-account` | ✅ | `percent_of_account` | אחוז |
| 7 | פעולות | `col-actions` | ❌ | - | Actions Menu |

#### הערות חשובות:
- **סדר עמודות:** צד לפני כמות (בהתאם לדרישה)
- **כמות:** מקבל prefix `#` (למשל: `#100`)
- **צד:** Badge עם רקע 0.1 alpha, border וטקסט בצבע מלא
- **סימבול:** תמיד לינק לטיקר

---

## 🎨 סטנדרטים עיצוביים

### מבנה HTML - LEGO System
```html
<tt-section data-section="trading-accounts">
  <div class="index-section__header">
    <h2>כותרת הקונטיינר</h2>
  </div>
  <div class="index-section__body">
    <tt-section-row>
      <!-- Optional: Table Filters -->
      <div class="phoenix-table-filters">
        <!-- Filters here -->
      </div>
      
      <!-- Table Wrapper -->
      <div class="phoenix-table-wrapper">
        <table class="phoenix-table js-table" id="tableId">
          <thead class="phoenix-table__head">
            <tr class="phoenix-table__row">
              <th class="phoenix-table__header col-field-name js-table-sort-trigger" 
                  data-sortable="true" 
                  data-sort-key="field_name" 
                  data-sort-type="string"
                  role="columnheader" 
                  aria-sort="none" 
                  tabindex="0">
                <span class="phoenix-table__header-text">כותרת עמודה</span>
                <span class="phoenix-table__sort-indicator js-sort-indicator">
                  <svg class="phoenix-table__sort-icon js-sort-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M8 9l4 -4l4 4"></path>
                    <path d="M8 15l4 4l4 -4"></path>
                  </svg>
                </span>
              </th>
            </tr>
          </thead>
          <tbody class="phoenix-table__body" role="rowgroup">
            <tr class="phoenix-table__row" role="row">
              <td class="phoenix-table__cell col-field-name" data-field="field_name">
                <!-- Cell content -->
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Table Pagination -->
      <div class="phoenix-table-pagination">
        <!-- Pagination controls -->
      </div>
    </tt-section-row>
  </div>
</tt-section>
```

### CSS Classes - BEM Naming
- **Prefix:** `phoenix-table-*`
- **Block:** `.phoenix-table`
- **Elements:** `.phoenix-table__head`, `.phoenix-table__body`, `.phoenix-table__row`, `.phoenix-table__header`, `.phoenix-table__cell`
- **Modifiers:** `.phoenix-table__cell--numeric`, `.phoenix-table__cell--currency`, `.phoenix-table__cell--status`

### JavaScript Classes
- **Sort Trigger:** `.js-table-sort-trigger`
- **Sort Icon:** `.js-sort-icon`
- **Sort Indicator:** `.js-sort-indicator`
- **Table:** `.js-table`
- **Page Size:** `.js-table-page-size`

---

## 🔧 פונקציונליות

### מיון (Sorting)
- **מחזור מיון:** none → ascending → descending → none
- **Multi-sort:** Shift + click לרמת מיון שנייה
- **סימון פעיל:** איקון בצבע משני (כחול), opacity 1.0
- **סימון לא פעיל:** איקון opacity 0.5

### פעולות (Actions)
- **תפריט פעולות:** איקון שלוש נקודות אנכיות
- **מיקום:** עמודה אחרונה
- **פתיחה:** לצד הכפתור (לכיוון מרכז הטבלה)
- **כפתורים:** View, Edit, Cancel, Delete
- **צבעים:** כל כפתור בצבע אחר (ראשי, משני, אזהרה, שגיאה)
- **גודל:** 28x28px, איקון 14px

### ערכים מספריים
- **יישור:** מרכז (ברירת מחדל)
- **צבעים:** 
  - חיובי: `numeric-value-positive` (ירוק)
  - שלילי: `numeric-value-negative` (אדום)
  - אפס: `numeric-value-zero` (אפור)
- **מטבע:** סימן מטבע לפני/אחרי הערך

### Badges (באגטים)
- **סגנון אחיד:** רקע 0.1 alpha, border וטקסט בצבע מלא
- **רוחב:** 45px (ל-Long/Short)
- **גופן:** קטן, רק אות ראשונה גדולה
- **לא לשבור שורה:** `white-space: nowrap`

### Pagination
- **Padding:** 5px למעלה/למטה
- **רקע:** 0.3 alpha
- **גובה כפתורים:** 25px
- **חצים:** מוחלפים ל-RTL (קודם = ימינה, הבא = שמאלה)

---

## 📚 קבצים רלוונטיים

### HTML Blueprint
- **מיקום:** `_COMMUNICATION/team_01/team_01_staging/D16_ACCTS_VIEW.html`
- **סטטוס:** ✅ מוכן לפיתוח
- **Preview:** `sandbox/_PREVIEW_D16_ACCTS_VIEW.html`

### CSS Files
1. **phoenix-tables.css** - סגנונות טבלאות (869 שורות)
2. **phoenix-cards.css** - סגנונות כרטיסים (144 שורות)
3. **account-movements-summary-cards.css** - כרטיסי סיכום (110 שורות)
4. **D16_ACCTS_VIEW_STYLES.css** - סגנונות ספציפיים לדף (133 שורות)
5. **D15_DASHBOARD_STYLES.css** - סגנונות דשבורד משותפים (1,457 שורות)

### JavaScript
- **מיון:** Event delegation ב-`D16_ACCTS_VIEW.html` (שורות 876-1085)
- **פונקציה:** `handleTableSort(header, event)`

### תעוד
- **PHOENIX_TABLES_SPECIFICATION.md** - מפרט טכני מפורט (652 שורות)
- **D16_ACCTS_VIEW_TABLES_MAPPING.md** - מיפוי טבלאות מהלגסי
- **D16_ACCTS_VIEW_LEGACY_ANALYSIS.md** - ניתוח לגסי

---

## ✅ Checklist לפיתוח

### Container 1 (ניהול חשבונות מסחר)
- [ ] טבלה עם 8 עמודות
- [ ] מיון פעיל על כל העמודות (חוץ מ-פעולות)
- [ ] Badges לסטטוס (פעיל/לא פעיל)
- [ ] ערכים מספריים עם מטבע
- [ ] תפריט פעולות עם 4 כפתורים
- [ ] Pagination

### Container 2 (סיכום תנועות)
- [ ] Grid של 4 כרטיסי סיכום
- [ ] פילטר טווח תאריכים
- [ ] כרטיסים עם `.phoenix-card--summary`

### Container 3 (דף חשבון לתאריכים)
- [ ] טבלה עם 8 עמודות
- [ ] צביעת סוג ותת-סוג (חיובי/שלילי)
- [ ] לינק טיקר
- [ ] פילטר טווח תאריכים
- [ ] Pagination

### Container 4 (פוזיציות לפי חשבון)
- [ ] טבלה עם 9 עמודות
- [ ] סדר עמודות: צד לפני כמות
- [ ] כמות עם prefix `#`
- [ ] Badges ל-Long/Short
- [ ] לינק סימבול
- [ ] פילטר חשבון
- [ ] Pagination

---

## 🔗 קישורים מהירים

- **HTML Blueprint:** `_COMMUNICATION/team_01/team_01_staging/D16_ACCTS_VIEW.html`
- **Preview:** `sandbox/_PREVIEW_D16_ACCTS_VIEW.html`
- **CSS Tables:** `phoenix-tables.css`
- **CSS Cards:** `phoenix-cards.css`
- **מפרט טבלאות:** `PHOENIX_TABLES_SPECIFICATION.md`
- **מיפוי טבלאות:** `D16_ACCTS_VIEW_TABLES_MAPPING.md`

---

**הערה:** מדריך זה מתעדכן בהתאם להתפתחויות. יש לבדוק את הגרסה העדכנית ביותר.
