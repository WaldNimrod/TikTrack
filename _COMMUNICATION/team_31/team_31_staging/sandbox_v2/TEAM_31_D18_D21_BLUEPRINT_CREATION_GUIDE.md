# 📋 מדריך יצירת בלופרינטים D18_BRKRS_VIEW ו-D21_CASH_VIEW

**מאת:** Team 31 (Blueprint)  
**תאריך:** 2026-02-02  
**גרסה:** v1.0.0  
**סטטוס:** 📝 **GUIDE - READY FOR IMPLEMENTATION**

---

## 🎯 מטרת המסמך

מסמך זה מפרט את התהליך המדויק ליצירת בלופרינטים עבור:
- **D18_BRKRS_VIEW** (ברוקרים ועמלות)
- **D21_CASH_VIEW** (תזרימי מזומנים)

---

## 📊 תהליך עבודה מדויק

### **שלב 1: סקירה מקיפה** ✅ **COMPLETE**

**בוצע:**
- ✅ סקירת קבצי Legacy (`team_01_staging`)
- ✅ בדיקת DB Schema (brokers, cash_flows)
- ✅ בדיקת OpenAPI Spec
- ✅ ניתוח מבנה טבלאות קיים
- ✅ יצירת סקריפט ניתוח (`analyze_d18_d21_specs.py`)

**תוצאות:**
- דוח ניתוח: `d18_d21_analysis_report.md`
- תוצאות JSON: `d18_d21_analysis_results.json`

---

### **שלב 2: יצירת בלופרינטים**

#### **2.1 D18_BRKRS_VIEW - מבנה טבלה**

**עמודות טבלה:**
1. **ברוקר** (`col-broker`) - שם הברוקר (string, sortable)
2. **סוג עמלה** (`col-commission-type`) - Tiered/Flat (string, sortable, badge)
3. **ערך עמלה** (`col-commission-value`) - ערך העמלה (string, sortable, center)
4. **מינימום לפעולה** (`col-minimum`) - מינימום כספי (numeric, sortable, center, currency)
5. **פעולות** (`col-actions`) - תפריט פעולות (dropdown menu)

**דוגמת שורות:**
- Interactive Brokers | Tiered | 0.0035 $ / Share | $0.35
- Exante | Flat | 0.02 % / Volume | $10.00

**מבנה HTML:**
```html
<table id="brokersTable" class="phoenix-table js-table" data-table-type="brokers">
  <thead>
    <tr>
      <th class="phoenix-table__header col-broker js-table-sort-trigger" data-sortable="true" data-sort-key="broker" data-sort-type="string">
        <span class="phoenix-table__header-text">ברוקר</span>
        <span class="phoenix-table__sort-indicator js-sort-indicator">...</span>
      </th>
      <!-- ... more headers ... -->
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="phoenix-table__cell col-broker">Interactive Brokers</td>
      <td class="phoenix-table__cell col-commission-type">
        <span class="phoenix-table__status-badge">Tiered</span>
      </td>
      <td class="phoenix-table__cell col-commission-value phoenix-table__cell--numeric">0.0035 $ / Share</td>
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

#### **2.2 D21_CASH_VIEW - מבנה טבלה**

**עמודות טבלה:**
1. **תאריך פעולה** (`col-transaction-date`) - תאריך התנועה (date, sortable, center)
2. **סוג תנועה** (`col-flow-type`) - הפקדה/משיכה/דיבידנד/ריבית/עמלה/אחר (string, sortable, badge with color)
3. **חשבון יעד/מקור** (`col-account`) - שם חשבון המסחר (string, sortable)
4. **סכום** (`col-amount`) - סכום התנועה (numeric, sortable, center, currency, positive/negative color)
5. **מטבע** (`col-currency`) - מטבע התנועה (string, sortable, center)
6. **סטטוס** (`col-status`) - מאושר/ממתין/בוטל (string, sortable, badge)

**דוגמת שורות:**
- 20/01/2026 | הפקדה | IBKR - Main | +$5,000.00 | USD | מאושר
- 15/01/2026 | משיכה | IBKR - Main | -$1,200.00 | USD | מאושר

**מבנה HTML:**
```html
<table id="cashFlowsTable" class="phoenix-table js-table" data-table-type="cash_flows">
  <thead>
    <tr>
      <th class="phoenix-table__header col-transaction-date js-table-sort-trigger" data-sortable="true" data-sort-key="transaction_date" data-sort-type="date">
        <span class="phoenix-table__header-text">תאריך פעולה</span>
        <span class="phoenix-table__sort-indicator js-sort-indicator">...</span>
      </th>
      <!-- ... more headers ... -->
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="phoenix-table__cell col-transaction-date phoenix-table__cell--date">20/01/2026</td>
      <td class="phoenix-table__cell col-flow-type" data-type-positive="true">
        <span class="operation-type-badge" data-operation-type="deposit">הפקדה</span>
      </td>
      <td class="phoenix-table__cell col-account">IBKR - Main</td>
      <td class="phoenix-table__cell col-amount phoenix-table__cell--numeric phoenix-table__cell--currency" data-type-positive="true">
        <span class="numeric-value-positive" dir="ltr">+$5,000.00</span>
      </td>
      <td class="phoenix-table__cell col-currency">USD</td>
      <td class="phoenix-table__cell col-status phoenix-table__cell--status">
        <span class="phoenix-table__status-badge phoenix-table__status-badge--active">מאושר</span>
      </td>
    </tr>
  </tbody>
</table>
```

---

### **שלב 3: תהליך יצירה**

#### **3.1 בסיס תבנית**

**מקור:** `D16_ACCTS_VIEW.html` (v1.0.13)

**שינויים נדרשים:**

1. **כותרת עמוד:**
   - D18: `ברוקרים | TikTrack Phoenix - Blueprint [v1.0.0]`
   - D21: `תזרימי מזומנים | TikTrack Phoenix - Blueprint [v1.0.0]`

2. **מחלקת body:**
   - D18: `class="brokers-page context-trading"`
   - D21: `class="cash-flows-page context-accounting"`

3. **Container 0 (סיכום מידע):**
   - D18: הסר או שנה לסיכום ברוקרים
   - D21: שנה לסיכום תזרימי מזומנים

4. **Container 1 (טבלה ראשית):**
   - D18: החלף בטבלת ברוקרים (5 עמודות)
   - D21: החלף בטבלת תזרימי מזומנים (6 עמודות)

5. **Containers 2-4:**
   - D18: הסר (לא נדרש)
   - D21: הסר (לא נדרש)

6. **JavaScript:**
   - שמור את סקריפטי הטבלאות (`table-sort.js`)
   - הסר סקריפטים ספציפיים ל-D16 (portfolio summary)

---

### **שלב 4: כללים מחייבים**

#### **4.1 מבנה LEGO System**

**חובה:** כל העמוד חייב להיות מוקף במבנה LEGO הבסיסי:

```html
<tt-container>
  <tt-section data-section="section-name">
    <div class="index-section__header">
      <!-- Header content -->
    </div>
    <div class="index-section__body">
      <tt-section-row>
        <!-- Content -->
      </tt-section-row>
    </div>
  </tt-section>
</tt-container>
```

#### **4.2 סדר טעינת CSS**

**קדוש - אין לחרוג:**

```html
<!-- 1. Pico CSS FIRST -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@1/css/pico.min.css">

<!-- 2. Phoenix Base Styles -->
<link rel="stylesheet" href="../../../../ui/src/styles/phoenix-base.css">

<!-- 3. LEGO Components -->
<link rel="stylesheet" href="../../../../ui/src/styles/phoenix-components.css">

<!-- 4. Header Component -->
<link rel="stylesheet" href="../../../../ui/src/styles/phoenix-header.css">

<!-- 5. Page-Specific Styles -->
<link rel="stylesheet" href="../../../../ui/src/styles/D15_DASHBOARD_STYLES.css">
```

#### **4.3 מערכת טבלאות Phoenix**

**חובה:** כל טבלה חייבת להיות מוקפת במבנה:

```html
<div class="phoenix-table-wrapper">
  <table id="tableId" class="phoenix-table js-table" data-table-type="type" role="table">
    <thead class="phoenix-table__head">
      <!-- Headers with sort functionality -->
    </thead>
    <tbody class="phoenix-table__body">
      <!-- Rows with action menus -->
    </tbody>
  </table>
  <!-- Pagination -->
  <div class="phoenix-table-pagination">...</div>
</div>
```

#### **4.4 תפריט פעולות**

**חובה:** כל שורה חייבת לכלול תפריט פעולות עם 4 כפתורים:

```html
<div class="table-actions-tooltip">
  <button class="table-actions-trigger" aria-label="פעולות">...</button>
  <div class="table-actions-menu">
    <button class="table-action-btn js-action-view" aria-label="צפה">...</button>
    <button class="table-action-btn js-action-edit" aria-label="ערוך">...</button>
    <button class="table-action-btn js-action-cancel" aria-label="ביטול">...</button>
    <button class="table-action-btn js-action-delete" aria-label="מחק">...</button>
  </div>
</div>
```

---

## 📝 רשימת בדיקה (Checklist)

### **D18_BRKRS_VIEW**

- [ ] העתקת D16_ACCTS_VIEW.html כבסיס
- [ ] שינוי כותרת עמוד ל-"ברוקרים"
- [ ] שינוי מחלקת body ל-"brokers-page"
- [ ] החלפת Container 0 (אם נדרש)
- [ ] החלפת Container 1 בטבלת ברוקרים (5 עמודות)
- [ ] הסרת Containers 2-4
- [ ] הוספת שורות דוגמה (2-3 שורות)
- [ ] הוספת תפריט פעולות בכל שורה
- [ ] הוספת pagination
- [ ] בדיקת RTL
- [ ] בדיקת JavaScript (table sort)
- [ ] בדיקת CSS (inline styles)

### **D21_CASH_VIEW**

- [ ] העתקת D16_ACCTS_VIEW.html כבסיס
- [ ] שינוי כותרת עמוד ל-"תזרימי מזומנים"
- [ ] שינוי מחלקת body ל-"cash-flows-page"
- [ ] החלפת Container 0 לסיכום תזרימי מזומנים
- [ ] החלפת Container 1 בטבלת תזרימי מזומנים (6 עמודות)
- [ ] הסרת Containers 2-4
- [ ] הוספת פילטרים פנימיים (טווח תאריכים, חשבון)
- [ ] הוספת שורות דוגמה (2-3 שורות)
- [ ] הוספת באגטים לסוג תנועה (צבע לפי חיובי/שלילי)
- [ ] הוספת תפריט פעולות בכל שורה
- [ ] הוספת pagination
- [ ] בדיקת RTL
- [ ] בדיקת JavaScript (table sort, filters)
- [ ] בדיקת CSS (inline styles)

---

## 🔗 קישורים רלוונטיים

### **קבצי תבנית:**
- `D16_ACCTS_VIEW.html` - תבנית בסיס
- `D15_PAGE_TEMPLATE_V3.html` - תבנית עמוד מלאה

### **מסמכי תיעוד:**
- `PHOENIX_TABLES_SPECIFICATION.md` - מפרט טבלאות
- `TEAM_31_TO_TEAM_10_30_D16_ACCTS_VIEW_IMPLEMENTATION_REQUEST.md` - הוראות מימוש

### **קבצי ניתוח:**
- `analyze_d18_d21_specs.py` - סקריפט ניתוח
- `d18_d21_analysis_report.md` - דוח ניתוח
- `d18_d21_analysis_results.json` - תוצאות JSON

---

## ✅ סיכום

**תהליך יצירת בלופרינטים:**

1. ✅ **סקירה מקיפה** - COMPLETE
2. ⏳ **יצירת בלופרינטים** - IN PROGRESS
3. ⏳ **ולידציה** - PENDING
4. ⏳ **הגשה למימוש** - PENDING

**הערה:** הבלופרינטים ייווצרו בהתאם לתבנית D16_ACCTS_VIEW עם שינויים מינימליים בחלקים הרלוונטיים.

---

**Team 31 (Blueprint)**  
**תאריך:** 2026-02-02  
**סטטוס:** 📝 **GUIDE COMPLETE - READY FOR BLUEPRINT CREATION**
