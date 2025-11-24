# מדריך סגנונות מאוחד - עמודי מוקאפ
## Mockups Unified Styles Guide

**תאריך יצירה:** 27 בינואר 2025  
**סטטוס:** מדריך מקיף לכל עמודי המוקאפ  
**מיקום:** `trading-ui/mockups/daily-snapshots/`

---

## ⚠️ חוקי ITCSS - חובה לפעול לפיהם

### כללי יסוד:
1. **כל הסגנונות חייבים לעבור דרך ITCSS בלבד**
2. **ללא inline styles** - אסור להשתמש ב-`style=""` attributes
3. **ללא סגנונות בתוך HTML** - אסור להשתמש ב-`<style>` tags
4. **ללא !important** - אסור להשתמש ב-`!important`

### מיקום הסגנונות:
- **קובץ ראשי:** `trading-ui/styles-new/06-components/_chart-management.css`
- **קובץ נוסף (אם נדרש):** `trading-ui/styles-new/06-components/_mockups-common.css`
- **טעינה:** הקבצים נטענים דרך `master.css`
- **אין צורך להוסיף import** - הקבצים כבר חלק מהמערכת

### שימוש ב-CSS Variables (חובה!):
- **צבעים:** `--apple-blue`, `--apple-gray-*`, `--color-text-*`, `--apple-green`, `--apple-red`
- **מרווחים:** `--spacing-xs`, `--spacing-sm`, `--spacing-md`, `--spacing-lg`, `--spacing-xl`
- **רדיוסים:** `--apple-radius-small`, `--apple-radius-medium`, `--apple-radius-large`
- **צללים:** `--apple-shadow-light`, `--apple-shadow-medium`, `--apple-shadow-heavy`
- **רקעים:** `--apple-bg-primary`, `--apple-bg-secondary`
- **מיקום המשתנים:** `trading-ui/styles-new/01-settings/_variables.css`

### RTL Support (חובה!):
- שימוש ב-Logical Properties: `margin-inline-start` במקום `margin-left`
- תמיכה ב-`[dir="rtl"]` selectors
- שימוש ב-`inset-inline-start` במקום `left`

---

## 📊 סטטיסטיקות

### עמודי מוקאפ:
1. `trade-history-page.html` - 50 inline styles
2. `portfolio-state-page.html` - 55 inline styles
3. `price-history-page.html` - 165 inline styles
4. `comparative-analysis-page.html` - 82 inline styles
5. `trading-journal-page.html` - 30 inline styles
6. `strategy-analysis-page.html` - 15 inline styles
7. `economic-calendar-page.html` - 14 inline styles
8. `history-widget.html` - 16 inline styles
9. `emotional-tracking-widget.html` - 15 inline styles
10. `date-comparison-modal.html` - 22 inline styles
11. `journal-entry-modal.html` - 17 inline styles
12. `tradingview-test-page.html` - 6 inline styles

**סה"כ: 493 מופעים של inline styles!**

---

## 🎨 רכיבים משותפים - Classes אחידות

### 1. Navigation Bar (Mockups Navigation)
**מופיע ב:** כל עמודי המוקאפ

**HTML נוכחי:**
```html
<div class="mockups-navigation" style="background: #f8f9fa; border-bottom: 2px solid #dee2e6; padding: 15px 0; margin-bottom: 20px;">
    <div class="container-fluid">
        <div class="row align-items-center">
            <div class="col-md-12">
                <div style="display: flex; align-items: center; gap: 15px; flex-wrap: wrap;">
                    <span style="font-weight: bold; color: #495057; font-size: 0.9rem;">ניווט מוקאפים:</span>
                    <a href="..." style="text-decoration: none; padding: 6px 12px; ...">...</a>
                </div>
            </div>
        </div>
    </div>
</div>
```

**CSS Classes (להוספה ל-`_chart-management.css`):**
```css
/* ===== Mockups Navigation Bar ===== */
.mockups-navigation {
    background: var(--apple-bg-secondary);
    border-bottom: 2px solid var(--apple-border-light);
    padding: 15px 0;
    margin-bottom: var(--spacing-lg);
}

.mockups-navigation-content {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    flex-wrap: wrap;
}

.mockups-navigation-label {
    font-weight: bold;
    color: var(--color-text-primary-dark);
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
}

.mockups-navigation-link {
    text-decoration: none;
    padding: 6px 12px;
    display: inline-block;
    background-color: var(--apple-gray-6);
    color: white;
    border-radius: 4px;
    font-size: 0.9rem;
    font-weight: 500;
    transition: all 0.2s;
}

.mockups-navigation-link:hover {
    background-color: var(--apple-gray-7);
    color: white;
}

.mockups-navigation-link.active {
    background-color: var(--apple-blue);
}

/* RTL Support */
[dir="rtl"] .mockups-navigation-content {
    direction: rtl;
}
```

**HTML מעודכן:**
```html
<div class="mockups-navigation">
    <div class="container-fluid">
        <div class="row align-items-center">
            <div class="col-md-12">
                <div class="mockups-navigation-content">
                    <span class="mockups-navigation-label">
                        <img src="../../images/icons/tabler/link.svg" width="16" height="16" alt="link" class="icon"> 
                        ניווט מוקאפים:
                    </span>
                    <a href="trade-history-page.html" class="mockups-navigation-link">היסטוריית טרייד</a>
                    <a href="price-history-page.html" class="mockups-navigation-link active">היסטוריית מחירים</a>
                    <!-- ... -->
                </div>
            </div>
        </div>
    </div>
</div>
```

---

### 2. Section Headers & Bodies
**מופיע ב:** כל עמודי המוקאפ

**HTML נוכחי:**
```html
<div class="content-section" id="section-id">
    <div class="section-header">
        <h2>כותרת</h2>
        <div class="header-actions">
            <button class="filter-toggle-btn" onclick="toggleSection('section-id')">▼</button>
        </div>
    </div>
    <div class="section-body">
        <!-- תוכן -->
    </div>
</div>
```

**CSS Classes (להוספה ל-`_chart-management.css`):**
```css
/* ===== Section Headers & Bodies ===== */
.content-section {
    margin-bottom: var(--spacing-lg);
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md);
    background: var(--apple-bg-primary);
    border: 1px solid var(--apple-border-light);
    border-radius: var(--apple-radius-small) var(--apple-radius-small) 0 0;
}

.section-header h2 {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--color-text-primary);
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
}

.section-header .header-actions {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
}

.section-body {
    padding: var(--spacing-md);
    background: var(--apple-bg-primary);
    border: 1px solid var(--apple-border-light);
    border-top: none;
    border-radius: 0 0 var(--apple-radius-small) var(--apple-radius-small);
}

.section-body.hidden {
    display: none;
}

.filter-toggle-btn {
    background: none;
    border: 1px solid var(--apple-border);
    border-radius: 4px;
    padding: var(--spacing-xs) var(--spacing-sm);
    cursor: pointer;
    transition: all 0.2s;
    color: var(--color-text-secondary);
}

.filter-toggle-btn:hover {
    background: var(--apple-bg-secondary);
    border-color: var(--apple-blue);
    color: var(--apple-blue);
}

.section-toggle-icon {
    display: inline-block;
    transition: transform 0.2s;
}

.section-body.hidden ~ .section-header .section-toggle-icon {
    transform: rotate(-90deg);
}
```

---

### 3. Compact Statistics Cards
**מופיע ב:** `price-history-page.html`, `portfolio-state-page.html`, `comparative-analysis-page.html`

**HTML נוכחי:**
```html
<div class="col-md-3">
    <div class="compact-stat-card">
        <div class="compact-stat-label">שינוי יומי</div>
        <div class="compact-stat-number" id="stat-daily-change">-</div>
        <div class="compact-stat-absolute" id="stat-daily-change-abs">-</div>
    </div>
</div>
```

**CSS Classes (להוספה ל-`_chart-management.css`):**
```css
/* ===== Compact Statistics Cards ===== */
.compact-stat-card {
    background: var(--apple-bg-primary);
    border: 1px solid var(--apple-border-light);
    border-radius: var(--apple-radius-small);
    padding: var(--spacing-md);
    text-align: center;
    transition: all 0.2s;
}

.compact-stat-card:hover {
    box-shadow: var(--apple-shadow-light);
    transform: translateY(-2px);
}

.compact-stat-label {
    font-size: 0.85rem;
    color: var(--color-text-secondary);
    margin-bottom: var(--spacing-xs);
}

.compact-stat-number {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: var(--spacing-xs);
    color: var(--color-text-primary);
}

.compact-stat-number.positive {
    color: var(--apple-green);
}

.compact-stat-number.negative {
    color: var(--apple-red);
}

.compact-stat-absolute {
    font-size: 0.8rem;
    color: var(--color-text-secondary);
}
```

---

### 4. Chart Control Groups
**מופיע ב:** `price-history-page.html`, `tradingview-test-page.html`

**CSS Classes (כבר מוגדר במסמך הקודם):**
- `.chart-control-group`
- `.chart-control-label`
- `.chart-control-buttons`
- `.chart-control-btn`
- `.chart-unit-size-btn`
- `.chart-time-range-btn`
- `.chart-type-btn`
- וכו'

---

### 5. Filter Menus
**מופיע ב:** `portfolio-state-page.html`, `trade-history-page.html`, `comparative-analysis-page.html`

**HTML נוכחי:**
```html
<div class="filter-group">
    <button class="filter-toggle">פילטר</button>
    <div class="filter-menu">
        <div class="account-filter-item">פריט</div>
    </div>
</div>
```

**CSS Classes (להוספה ל-`_chart-management.css`):**
```css
/* ===== Filter Menus ===== */
.filter-group {
    position: relative;
    display: inline-block;
}

.filter-toggle {
    padding: var(--spacing-xs) var(--spacing-md);
    border: 1px solid var(--apple-border);
    background: var(--apple-bg-primary);
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    color: var(--color-text-primary);
    text-align: right;
    direction: rtl;
    transition: all 0.2s;
}

.filter-toggle:hover {
    border-color: var(--logo-orange);
    color: var(--logo-orange);
    background: var(--apple-bg-primary);
}

.filter-menu {
    position: absolute;
    top: 100%;
    inset-inline-end: 0;
    background: var(--apple-bg-primary);
    border: 1px solid var(--apple-border);
    border-radius: 4px;
    box-shadow: var(--apple-shadow-medium);
    min-width: 200px;
    max-height: 300px;
    overflow-y: auto;
    z-index: 1000;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-10px);
    transition: all 0.2s;
    display: none;
    direction: rtl;
}

.filter-group:hover .filter-menu,
.filter-menu.show {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
    display: block;
}

.filter-item {
    padding: 6px 15px;
    cursor: pointer;
    transition: all 0.3s;
    border-bottom: 1px solid var(--apple-border-light);
}

.filter-item:hover {
    background: var(--apple-bg-secondary);
    color: var(--apple-blue);
}

.filter-item:last-child {
    border-bottom: none;
}

.filter-item.selected {
    background-color: var(--apple-bg-secondary);
    color: var(--apple-green);
    font-weight: 500;
}

.filter-item.selected::before {
    content: "✓";
    margin-inline-end: var(--spacing-sm);
    color: var(--apple-green);
    font-weight: bold;
}

/* Variants */
.account-filter-item {
    /* משתמש ב-.filter-item */
}

.date-range-filter-item {
    /* משתמש ב-.filter-item */
}
```

---

### 6. Timeline Components
**מופיע ב:** `trade-history-page.html`

**CSS Classes (להוספה ל-`_chart-management.css`):**
```css
/* ===== Timeline Components ===== */
.timeline-container {
    position: relative;
    padding: var(--spacing-lg) 0;
}

.timeline-view-toggle {
    display: flex;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-lg);
}

.timeline-view-toggle button {
    padding: var(--spacing-sm) var(--spacing-md);
    border: 1px solid var(--apple-border-light);
    background: var(--apple-bg-primary);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s;
    color: var(--color-text-primary);
}

.timeline-view-toggle button:hover {
    background: var(--apple-bg-secondary);
}

.timeline-view-toggle button.active {
    background: var(--apple-green);
    color: white;
    border-color: var(--apple-green);
}

.timeline-absolute-wrapper {
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    padding: var(--spacing-sm) 0;
    width: 100%;
    max-width: 100%;
}

.timeline-absolute-wrapper::-webkit-scrollbar {
    height: 8px;
}

.timeline-absolute-wrapper::-webkit-scrollbar-track {
    background: var(--apple-bg-secondary);
    border-radius: 4px;
}

.timeline-absolute-wrapper::-webkit-scrollbar-thumb {
    background: var(--apple-green);
    border-radius: 4px;
}

.timeline-absolute-wrapper::-webkit-scrollbar-thumb:hover {
    background: var(--apple-green-dark);
}

.timeline-absolute {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-xl);
    padding: var(--spacing-lg) var(--spacing-xl);
    position: relative;
    min-width: max-content;
    width: 100%;
}

.timeline-absolute::before {
    content: '';
    position: absolute;
    top: 30px;
    inset-inline-start: 0;
    inset-inline-end: 0;
    height: 2px;
    background: var(--apple-border-light);
    z-index: 0;
}

.timeline-step-absolute {
    flex: 0 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    z-index: 1;
    min-width: 200px;
    max-width: 250px;
}
```

---

### 7. Modal Styles
**מופיע ב:** `date-comparison-modal.html`, `journal-entry-modal.html`

**CSS Classes (להוספה ל-`_chart-management.css`):**
```css
/* ===== Modal Styles ===== */
.modal-overlay {
    position: fixed;
    top: 0;
    inset-inline-start: 0;
    inset-inline-end: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1050;
}

.modal-container {
    background: var(--apple-bg-primary);
    border-radius: var(--apple-radius-medium);
    max-width: 800px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: var(--apple-shadow-heavy);
}

.modal-header {
    padding: var(--spacing-md);
    border-bottom: 1px solid var(--apple-border-light);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0;
    color: var(--color-text-primary);
}

.modal-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--color-text-secondary);
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s;
}

.modal-close:hover {
    background: var(--apple-bg-secondary);
    color: var(--color-text-primary);
}

.modal-body {
    padding: var(--spacing-md);
}

.modal-footer {
    padding: var(--spacing-md);
    border-top: 1px solid var(--apple-border-light);
    display: flex;
    justify-content: flex-end;
    gap: var(--spacing-md);
}
```

---

### 8. Widget Styles
**מופיע ב:** `history-widget.html`, `emotional-tracking-widget.html`

**CSS Classes (להוספה ל-`_chart-management.css`):**
```css
/* ===== Widget Styles ===== */
.widget-container {
    background: var(--apple-bg-primary);
    border: 1px solid var(--apple-border-light);
    border-radius: var(--apple-radius-small);
    padding: var(--spacing-md);
    margin-bottom: var(--spacing-md);
}

.widget-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-md);
    padding-bottom: var(--spacing-sm);
    border-bottom: 1px solid var(--apple-border-light);
}

.widget-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0;
}

.widget-content {
    /* תוכן הווידג'ט */
}

.widget-actions {
    display: flex;
    gap: var(--spacing-sm);
}
```

---

## 📋 רשימת תיקונים לפי עמוד

### 1. trade-history-page.html
**Inline styles:** 50 מופעים

**רכיבים שצריך לתקן:**
- ✅ Navigation bar
- ✅ Section headers/bodies
- ✅ Timeline components
- ✅ Filter menus
- ✅ Statistics cards

### 2. portfolio-state-page.html
**Inline styles:** 55 מופעים

**רכיבים שצריך לתקן:**
- ✅ Navigation bar
- ✅ Section headers/bodies
- ✅ Filter menus
- ✅ Statistics cards
- ✅ Account filters
- ✅ Date range filters

### 3. price-history-page.html
**Inline styles:** 165 מופעים

**רכיבים שצריך לתקן:**
- ✅ Navigation bar
- ✅ Section headers/bodies
- ✅ Chart control groups (כל הסוגים)
- ✅ Statistics cards
- ✅ Toolbars (indicators, drawing tools)
- ✅ Volume charts

### 4. comparative-analysis-page.html
**Inline styles:** 82 מופעים

**רכיבים שצריך לתקן:**
- ✅ Navigation bar
- ✅ Section headers/bodies
- ✅ Statistics cards
- ✅ Comparison charts
- ✅ Filter menus

### 5. trading-journal-page.html
**Inline styles:** 30 מופעים

**רכיבים שצריך לתקן:**
- ✅ Navigation bar
- ✅ Section headers/bodies
- ✅ Journal entries
- ✅ Entry forms

### 6. strategy-analysis-page.html
**Inline styles:** 15 מופעים

**רכיבים שצריך לתקן:**
- ✅ Navigation bar
- ✅ Section headers/bodies
- ✅ Strategy cards

### 7. economic-calendar-page.html
**Inline styles:** 14 מופעים

**רכיבים שצריך לתקן:**
- ✅ Navigation bar
- ✅ Section headers/bodies
- ✅ Calendar grid

### 8. history-widget.html
**Inline styles:** 16 מופעים

**רכיבים שצריך לתקן:**
- ✅ Widget container
- ✅ Widget header
- ✅ Widget content

### 9. emotional-tracking-widget.html
**Inline styles:** 15 מופעים

**רכיבים שצריך לתקן:**
- ✅ Widget container
- ✅ Widget header
- ✅ Emotional tracking form

### 10. date-comparison-modal.html
**Inline styles:** 22 מופעים

**רכיבים שצריך לתקן:**
- ✅ Modal overlay
- ✅ Modal container
- ✅ Modal header/body/footer
- ✅ Date pickers

### 11. journal-entry-modal.html
**Inline styles:** 17 מופעים

**רכיבים שצריך לתקן:**
- ✅ Modal overlay
- ✅ Modal container
- ✅ Modal header/body/footer
- ✅ Rich text editor

### 12. tradingview-test-page.html
**Inline styles:** 6 מופעים

**רכיבים שצריך לתקן:**
- ✅ Navigation bar
- ✅ Chart container

---

## 📝 תוכנית ביצוע כללית

### שלב 1: יצירת CSS Classes אחידות
1. **הוספה לקובץ:** `trading-ui/styles-new/06-components/_chart-management.css`
   - או יצירת קובץ חדש: `_mockups-common.css` (אם נדרש)
2. **שימוש ב-CSS Variables:** כל הצבעים, מרווחים, רדיוסים - דרך variables
3. **ללא !important:** כל הסגנונות ללא !important
4. **RTL Support:** שימוש ב-logical properties

### שלב 2: עדכון כל עמודי המוקאפ
1. **הסרת כל ה-inline styles:** מחיקת כל ה-`style=""` attributes
2. **הסרת כל ה-`<style>` tags:** העברת כל הסגנונות ל-ITCSS
3. **הוספת classes:** החלפה ב-classes מ-ITCSS
4. **וידוא טעינה:** וידוא ש-`master.css` נטען

### שלב 3: בדיקות
1. בדיקת RTL בכל העמודים
2. בדיקת נגישות
3. בדיקת responsive
4. בדיקת עקביות עם שאר המערכת

---

## 🔧 דוגמאות קוד - לפני ואחרי

### דוגמה 1: Navigation Bar

**לפני:**
```html
<div class="mockups-navigation" style="background: #f8f9fa; border-bottom: 2px solid #dee2e6; padding: 15px 0; margin-bottom: 20px;">
    <div style="display: flex; align-items: center; gap: 15px; flex-wrap: wrap;">
        <span style="font-weight: bold; color: #495057; font-size: 0.9rem;">ניווט מוקאפים:</span>
        <a href="..." style="text-decoration: none; padding: 6px 12px; display: inline-block; background-color: #6c757d; color: white; border-radius: 4px; font-size: 0.9rem; font-weight: 500;">קישור</a>
    </div>
</div>
```

**אחרי:**
```html
<div class="mockups-navigation">
    <div class="container-fluid">
        <div class="row align-items-center">
            <div class="col-md-12">
                <div class="mockups-navigation-content">
                    <span class="mockups-navigation-label">
                        <img src="../../images/icons/tabler/link.svg" width="16" height="16" alt="link" class="icon"> 
                        ניווט מוקאפים:
                    </span>
                    <a href="..." class="mockups-navigation-link">קישור</a>
                </div>
            </div>
        </div>
    </div>
</div>
```

### דוגמה 2: Section Header

**לפני:**
```html
<div class="section-header">
    <h2 style="margin: 0; font-size: 1.2rem;">כותרת</h2>
    <div class="header-actions" style="display: flex; gap: 8px;">
        <button class="filter-toggle-btn" style="padding: 4px 8px; border: 1px solid #ddd; ...">▼</button>
    </div>
</div>
```

**אחרי:**
```html
<div class="section-header">
    <h2>כותרת</h2>
    <div class="header-actions">
        <button class="filter-toggle-btn" onclick="toggleSection('section-id')">
            <span class="section-toggle-icon">▼</span>
        </button>
    </div>
</div>
```

---

## ✅ סיכום

### בעיות שזוהו:
- ✅ **493 מופעים** של inline styles ב-12 עמודי מוקאפ
- ✅ כפילויות רבות של סגנונות
- ✅ אין classes משותפים
- ✅ קשה לתחזק
- ✅ מפר את חוקי ITCSS

### פתרונות מוצעים:
- ✅ יצירת CSS classes אחידות במערכת ITCSS
- ✅ שימוש ב-CSS variables בלבד
- ✅ תמיכה ב-RTL
- ✅ classes משותפים לכל העמודים
- ✅ תחזוקה קלה ועקביות

### Classes אחידות שנוצרו:
1. `.mockups-navigation` - Navigation bar
2. `.section-header`, `.section-body` - Sections
3. `.compact-stat-card` - Statistics cards
4. `.chart-control-*` - Chart controls
5. `.filter-menu`, `.filter-item` - Filter menus
6. `.timeline-*` - Timeline components
7. `.modal-*` - Modal styles
8. `.widget-*` - Widget styles

---

**עדכון אחרון:** 27 בינואר 2025  
**מחבר:** TikTrack Development Team

