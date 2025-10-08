# מדריך פיתוח RTL - TikTrack

## 📋 תוכן עניינים

- [מבוא](#מבוא)
- [עקרונות RTL](#עקרונות-rtl)
- [CSS Logical Properties](#css-logical-properties)
- [רכיבים RTL](#רכיבים-rtl)
- [טפסים RTL](#טפסים-rtl)
- [טבלאות RTL](#טבלאות-rtl)
- [מודלים RTL](#מודלים-rtl)
- [ניווט RTL](#ניווט-rtl)
- [בעיות נפוצות](#בעיות-נפוצות)
- [בדיקות RTL](#בדיקות-rtl)
- [דוגמאות קוד](#דוגמאות-קוד)

---

## מבוא

מדריך זה מפרט את העקרונות והשיטות לפיתוח RTL (Right-to-Left) נכון בפרויקט TikTrack. כל המערכת בנויה מימין לשמאל עם תמיכה מלאה בעברית.

### למה RTL חשוב?

1. **חוויית משתמש** - משתמשים עבריים מצפים לממשק שמתאים לכיוון הקריאה שלהם
2. **נגישות** - תמיכה נכונה ב-RTL משפרת את הנגישות למשתמשים עם מוגבלויות
3. **סטנדרטים** - עמידה בסטנדרטים בינלאומיים לעבודה עם שפות RTL
4. **עקביות** - ממשק אחיד בכל האתר

### עקרונות יסוד

- **CSS Logical Properties** בלבד
- **direction: rtl** בכל הרכיבים
- **text-align: start/end** במקום left/right
- **margin-inline-start/end** במקום margin-left/right
- **פשוט זה הכי טוב** - פתרונות פשוטים וברורים

---

## עקרונות RTL

### 1. כיוון טקסט

```css
/* עברית - מימין לשמאל */
direction: rtl;
text-align: right;

/* אנגלית - משמאל לימין */
direction: ltr;
text-align: left;
```

### 2. CSS Logical Properties

```css
/* ❌ שגוי - properties פיזיים */
.element {
  margin-left: 1rem;
  margin-right: 1rem;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  border-left: 1px solid #ccc;
  text-align: left;
}

/* ✅ נכון - logical properties */
.element {
  margin-inline-start: 1rem;  /* ימין ב-RTL */
  margin-inline-end: 1rem;    /* שמאל ב-RTL */
  padding-inline-start: 0.5rem;
  padding-inline-end: 0.5rem;
  border-inline-start: 1px solid var(--color-border);
  text-align: start;          /* ימין ב-RTL */
}
```

### 3. Flexbox ו-Grid

```css
/* Flexbox עם RTL */
.container {
  display: flex;
  direction: rtl;
}

/* Grid עם RTL */
.grid {
  display: grid;
  direction: rtl;
}
```

---

## CSS Logical Properties

### 1. Margin ו-Padding

```css
/* מרווחים לוגיים */
.element {
  margin-inline-start: 1rem;  /* ימין ב-RTL */
  margin-inline-end: 1rem;    /* שמאל ב-RTL */
  padding-inline-start: 0.5rem;
  padding-inline-end: 0.5rem;
}

/* Fallback לדפדפנים ישנים */
@supports not (margin-inline-start: 1rem) {
  .element {
    margin-right: 1rem;
    margin-left: 1rem;
  }
}
```

### 2. Border

```css
/* גבולות לוגיים */
.element {
  border-inline-start: 2px solid #ccc;
  border-inline-end: 1px solid #eee;
}

/* פינות לוגיות */
.element {
  border-start-start-radius: 8px;
  border-end-end-radius: 8px;
}
```

### 3. Position

```css
/* מיקום לוגי */
.element {
  inset-inline-start: 0;  /* ימין ב-RTL */
  inset-inline-end: auto; /* שמאל ב-RTL */
}
```

### 4. Text Alignment

```css
/* יישור טקסט לוגי */
.text-start {
  text-align: start;  /* ימין ב-RTL */
}

.text-end {
  text-align: end;    /* שמאל ב-RTL */
}

.text-center {
  text-align: center;
}
```

---

## רכיבים RTL

### 1. כפתורים

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid transparent;
  border-radius: var(--radius-medium);
  font-weight: var(--font-weight-medium);
  text-decoration: none;
  cursor: pointer;
  transition: all var(--transition-fast);
  
  /* RTL לוגי */
  direction: rtl;
  text-align: center;
  
  /* גובה אחיד */
  min-height: 32px;
}

/* איקונים בכפתורים */
.btn i {
  margin-inline-start: var(--spacing-xs);
  margin-inline-end: 0;
}
```

### 2. כרטיסים

```css
.card {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-large);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  
  /* RTL לוגי */
  direction: rtl;
}

.card-header {
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-secondary);
  
  /* RTL לוגי */
  direction: rtl;
  text-align: start;
}

.card-body {
  padding: var(--spacing-lg);
  
  /* RTL לוגי */
  direction: rtl;
  text-align: start;
}

.card-footer {
  padding: var(--spacing-md) var(--spacing-lg);
  border-top: 1px solid var(--color-border);
  background: var(--color-bg-secondary);
  
  /* RTL לוגי */
  direction: rtl;
}
```

### 3. התראות

```css
.alert {
  padding: var(--spacing-md);
  border: 1px solid transparent;
  border-radius: var(--radius-medium);
  margin-bottom: var(--spacing-md);
  
  /* RTL לוגי */
  direction: rtl;
  text-align: start;
}

.alert-success {
  background-color: var(--color-success-light);
  border-color: var(--color-success);
  color: var(--color-success-dark);
}

.alert-danger {
  background-color: var(--color-danger-light);
  border-color: var(--color-danger);
  color: var(--color-danger-dark);
}

.alert-warning {
  background-color: var(--color-warning-light);
  border-color: var(--color-warning);
  color: var(--color-warning-dark);
}

.alert-info {
  background-color: var(--color-info-light);
  border-color: var(--color-info);
  color: var(--color-info-dark);
}
```

---

## טפסים RTL

### 1. שדות קלט

```css
/* שדות טקסט */
input[type="text"],
input[type="email"],
input[type="password"],
textarea {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-medium);
  font-size: var(--font-size-base);
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  transition: all var(--transition-fast);
  
  /* RTL לוגי */
  direction: rtl;
  text-align: start;
}

/* מספרים - יישור לשמאל */
input[type="number"] {
  direction: ltr;
  text-align: end;
}

/* שדות עם איקונים */
.input-group {
  position: relative;
  display: flex;
  align-items: center;
  
  /* RTL לוגי */
  direction: rtl;
}

.input-group .input-icon {
  position: absolute;
  inset-inline-start: var(--spacing-sm);
  color: var(--color-text-secondary);
  pointer-events: none;
}

.input-group input {
  padding-inline-start: var(--spacing-xl);
}
```

### 2. צ'קבוקסים ורדיו

```css
/* צ'קבוקסים - הצ'קבוקס מימין לליבל */
.form-check {
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
  justify-content: flex-start;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
  
  /* RTL לוגי */
  direction: rtl;
  text-align: start;
}

.form-check-input {
  order: 2;
  margin: 0;
}

.form-check-label {
  order: 1;
  margin: 0;
  cursor: pointer;
}

/* רדיו */
.radio-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  
  /* RTL לוגי */
  direction: rtl;
}

.radio-item {
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
  gap: var(--spacing-sm);
  
  /* RTL לוגי */
  direction: rtl;
  text-align: start;
}
```

### 3. Select Dropdowns

```css
/* רשימות נפתחות */
select {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-medium);
  font-size: var(--font-size-base);
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  cursor: pointer;
  
  /* RTL לוגי */
  direction: rtl;
  text-align: start;
}

/* אופציות ברשימה */
select option {
  direction: rtl;
  text-align: start;
}
```

---

## טבלאות RTL

### 1. מבנה טבלה

```html
<!-- HTML -->
<table class="table">
  <thead>
    <tr>
      <th>עמודה 1</th>
      <th>עמודה 2</th>
      <th>עמודה 3</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>תא 1</td>
      <td class="number-cell">1,234.56</td>
      <td class="actions-cell">
        <button class="btn btn--small">ערוך</button>
        <button class="btn btn--small">מחק</button>
      </td>
    </tr>
  </tbody>
</table>
```

### 2. עיצוב טבלה

```css
/* טבלה עם RTL */
.table {
  width: 100%;
  border-collapse: collapse;
  background-color: var(--color-bg-primary);
  border-radius: var(--radius-medium);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  
  /* RTL לוגי */
  direction: rtl;
  text-align: start;
}

/* תאים */
.table th,
.table td {
  padding: var(--spacing-sm) var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
  
  /* RTL לוגי */
  text-align: start;
}

/* כותרות */
.table th {
  background-color: var(--color-bg-secondary);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

/* מספרים בטבלה - יישור לשמאל */
.number-cell {
  text-align: end;
  direction: ltr;
  font-family: var(--font-family-mono);
}

/* עמודת פעולות */
.actions-cell {
  text-align: center;
  white-space: nowrap;
}

.actions-cell .btn {
  margin-inline-start: var(--spacing-xs);
  margin-inline-end: 0;
}

/* hover effect */
.table tbody tr:hover {
  background-color: var(--color-bg-secondary);
}
```

---

## מודלים RTL

### 1. מבנה מודל

```html
<!-- HTML -->
<div class="modal">
  <div class="modal-dialog">
    <div class="modal-header">
      <h5 class="modal-title">כותרת המודל</h5>
      <div class="modal-actions">
        <button class="btn btn--small btn--primary">פעולה</button>
      </div>
      <button class="btn-close" aria-label="סגור">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div class="modal-body">
      <p>תוכן המודל</p>
    </div>
    <div class="modal-footer">
      <button class="btn btn--primary">אישור</button>
      <button class="btn btn--secondary">ביטול</button>
    </div>
  </div>
</div>
```

### 2. עיצוב מודל

```css
/* מודל עם RTL */
.modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  
  /* RTL לוגי */
  direction: rtl;
}

.modal-dialog {
  background: var(--color-bg-primary);
  border-radius: var(--radius-large);
  box-shadow: var(--shadow-xl);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow: hidden;
}

/* כותרת מודל */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
  
  /* RTL לוגי */
  direction: rtl;
}

.modal-title {
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-xl);
  margin: 0;
  
  /* RTL לוגי */
  text-align: start;
}

.modal-actions {
  display: flex;
  gap: var(--spacing-sm);
  
  /* RTL לוגי */
  direction: rtl;
}

/* תוכן מודל */
.modal-body {
  padding: var(--spacing-lg);
  
  /* RTL לוגי */
  direction: rtl;
  text-align: start;
}

/* כפתורי מודל */
.modal-footer {
  display: flex;
  justify-content: flex-start;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  border-top: 1px solid var(--color-border);
  
  /* RTL לוגי */
  direction: rtl;
}

/* כפתור סגירה */
.btn-close {
  background: none;
  border: none;
  font-size: var(--font-size-lg);
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--radius-small);
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
  
  /* RTL לוגי */
  direction: rtl;
}

.btn-close:hover {
  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);
}
```

---

## ניווט RTL

### 1. תפריט ראשי

```css
/* תפריט ניווט */
.navbar {
  background: var(--color-bg-primary);
  border-bottom: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  
  /* RTL לוגי */
  direction: rtl;
}

.navbar-nav {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  
  /* RTL לוגי */
  direction: rtl;
}

/* פריטי תפריט */
.nav-item {
  position: relative;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  color: var(--color-text-primary);
  text-decoration: none;
  border-radius: var(--radius-medium);
  transition: all var(--transition-fast);
  
  /* RTL לוגי */
  direction: rtl;
  text-align: start;
}

.nav-link:hover {
  background-color: var(--color-bg-secondary);
  color: var(--color-primary);
}

.nav-link.active {
  background-color: var(--color-primary);
  color: white;
}

/* איקונים בתפריט */
.nav-link i {
  margin-inline-start: var(--spacing-xs);
  margin-inline-end: 0;
}
```

### 2. Dropdown Menus

```css
/* תפריטים נפתחים */
.dropdown-menu {
  position: absolute;
  top: 100%;
  inset-inline-start: 0;
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-medium);
  box-shadow: var(--shadow-md);
  min-width: 200px;
  padding: var(--spacing-sm) 0;
  display: none;
  
  /* RTL לוגי */
  direction: rtl;
  text-align: start;
}

.dropdown-menu.show {
  display: block;
}

.dropdown-item {
  display: block;
  padding: var(--spacing-sm) var(--spacing-md);
  color: var(--color-text-primary);
  text-decoration: none;
  transition: all var(--transition-fast);
  
  /* RTL לוגי */
  direction: rtl;
  text-align: start;
}

.dropdown-item:hover {
  background-color: var(--color-bg-secondary);
  color: var(--color-primary);
}

.dropdown-item.active {
  background-color: var(--color-primary);
  color: white;
}
```

### 3. Breadcrumbs

```css
/* פירורי לחם */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) 0;
  
  /* RTL לוגי */
  direction: rtl;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.breadcrumb-item a {
  color: var(--color-primary);
  text-decoration: none;
  transition: all var(--transition-fast);
}

.breadcrumb-item a:hover {
  color: var(--color-primary-dark);
  text-decoration: underline;
}

.breadcrumb-item.active {
  color: var(--color-text-secondary);
}

/* מפרידים */
.breadcrumb-item + .breadcrumb-item::before {
  content: "›";
  color: var(--color-text-secondary);
  margin-inline-end: var(--spacing-sm);
  margin-inline-start: 0;
}
```

---

## בעיות נפוצות

### 1. מספרים מעורבים

```css
/* מספרים עם טקסט עברי */
.mixed-content {
  direction: rtl;
}

.mixed-content .number {
  direction: ltr;
  text-align: end;
  unicode-bidi: embed;
}
```

### 2. תאריכים

```css
/* תאריכים - יישור לשמאל */
.date {
  direction: ltr;
  text-align: end;
  unicode-bidi: embed;
}
```

### 3. כתובות URL

```css
/* כתובות URL - יישור לשמאל */
.url {
  direction: ltr;
  text-align: end;
  unicode-bidi: embed;
}
```

### 4. קוד מחשב

```css
/* קוד מחשב - יישור לשמאל */
.code {
  direction: ltr;
  text-align: start;
  unicode-bidi: embed;
  font-family: var(--font-family-mono);
}
```

### 5. איקונים מתהפכים

```css
/* איקונים שצריכים להתהפך ב-RTL */
.flip-rtl {
  transform: scaleX(-1);
}

/* איקונים שלא צריכים להתהפך */
.no-flip-rtl {
  transform: none;
}
```

---

## בדיקות RTL

### 1. בדיקות ידניות

```javascript
// בדיקת כיוון דף
function checkPageDirection() {
  const html = document.documentElement;
  const dir = html.getAttribute('dir');
  const lang = html.getAttribute('lang');
  
  if (lang === 'he' && dir !== 'rtl') {
    console.error('עמוד עברי חייב להיות RTL');
  }
}

// בדיקת יישור טקסט
function checkTextAlignment() {
  const elements = document.querySelectorAll('p, div, span');
  elements.forEach(el => {
    const style = window.getComputedStyle(el);
    if (style.direction === 'rtl' && style.textAlign === 'left') {
      console.warn('טקסט RTL מיושר לשמאל:', el);
    }
  });
}

// בדיקת logical properties
function checkLogicalProperties() {
  const elements = document.querySelectorAll('*');
  elements.forEach(el => {
    const style = window.getComputedStyle(el);
    if (style.marginLeft !== '0px' || style.marginRight !== '0px') {
      console.warn('שימוש ב-margin-left/right במקום logical properties:', el);
    }
  });
}
```

### 2. בדיקות אוטומטיות

```bash
# בדיקת RTL בכל העמודים
grep -r "dir=\"rtl\"" trading-ui/*.html

# בדיקת lang עברית
grep -r "lang=\"he\"" trading-ui/*.html

# בדיקת logical properties
grep -r "margin-inline-start\|padding-inline-start" trading-ui/styles/
```

### 3. כלי בדיקה

- **Browser DevTools**: בדיקת computed styles
- **RTL Tester**: כלי לבדיקת RTL
- **Screen Reader**: בדיקת נגישות
- **CSS Logical Properties**: בדיקת תמיכה

---

## דוגמאות קוד

### דוגמה 1: כפתור עם RTL

```html
<!-- HTML -->
<button class="btn btn--primary">
  <i class="fas fa-save"></i>
  שמור
</button>
```

```css
/* CSS */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid transparent;
  border-radius: var(--radius-medium);
  font-weight: var(--font-weight-medium);
  text-decoration: none;
  cursor: pointer;
  transition: all var(--transition-fast);
  
  /* RTL לוגי */
  direction: rtl;
  text-align: center;
  
  /* גובה אחיד */
  min-height: 32px;
}

.btn--primary {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.btn i {
  margin-inline-start: var(--spacing-xs);
  margin-inline-end: 0;
}
```

### דוגמה 2: טבלה עם RTL

```html
<!-- HTML -->
<table class="table">
  <thead>
    <tr>
      <th>שם</th>
      <th>סכום</th>
      <th>תאריך</th>
      <th>פעולות</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>פריט 1</td>
      <td class="number-cell">1,234.56</td>
      <td class="date-cell">01/01/2024</td>
      <td class="actions-cell">
        <button class="btn btn--small btn--primary">ערוך</button>
        <button class="btn btn--small btn--danger">מחק</button>
      </td>
    </tr>
  </tbody>
</table>
```

```css
/* CSS */
.table {
  width: 100%;
  border-collapse: collapse;
  background-color: var(--color-bg-primary);
  border-radius: var(--radius-medium);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  
  /* RTL לוגי */
  direction: rtl;
  text-align: start;
}

.table th,
.table td {
  padding: var(--spacing-sm) var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
  
  /* RTL לוגי */
  text-align: start;
}

.number-cell {
  text-align: end;
  direction: ltr;
  font-family: var(--font-family-mono);
}

.date-cell {
  text-align: end;
  direction: ltr;
}

.actions-cell {
  text-align: center;
  white-space: nowrap;
}

.actions-cell .btn {
  margin-inline-start: var(--spacing-xs);
  margin-inline-end: 0;
}
```

### דוגמה 3: מודל עם RTL

```html
<!-- HTML -->
<div class="modal">
  <div class="modal-dialog">
    <div class="modal-header">
      <h5 class="modal-title">כותרת המודל</h5>
      <div class="modal-actions">
        <button class="btn btn--small btn--primary">פעולה</button>
      </div>
      <button class="btn-close" aria-label="סגור">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div class="modal-body">
      <p>תוכן המודל</p>
    </div>
    <div class="modal-footer">
      <button class="btn btn--primary">אישור</button>
      <button class="btn btn--secondary">ביטול</button>
    </div>
  </div>
</div>
```

```css
/* CSS */
.modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  
  /* RTL לוגי */
  direction: rtl;
}

.modal-dialog {
  background: var(--color-bg-primary);
  border-radius: var(--radius-large);
  box-shadow: var(--shadow-xl);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
  
  /* RTL לוגי */
  direction: rtl;
}

.modal-title {
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-xl);
  margin: 0;
  
  /* RTL לוגי */
  text-align: start;
}

.modal-actions {
  display: flex;
  gap: var(--spacing-sm);
  
  /* RTL לוגי */
  direction: rtl;
}

.modal-body {
  padding: var(--spacing-lg);
  
  /* RTL לוגי */
  direction: rtl;
  text-align: start;
}

.modal-footer {
  display: flex;
  justify-content: flex-start;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  border-top: 1px solid var(--color-border);
  
  /* RTL לוגי */
  direction: rtl;
}

.btn-close {
  background: none;
  border: none;
  font-size: var(--font-size-lg);
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--radius-small);
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
  
  /* RTL לוגי */
  direction: rtl;
}
```

---

## סיכום

פיתוח RTL נכון דורש:

1. **הבנה מעמיקה** של עקרונות RTL
2. **שימוש ב-CSS Logical Properties** במקום properties פיזיים
3. **תשומת לב לפרטים** כמו מספרים, תאריכים וקוד
4. **בדיקות מקיפות** בכל שלב של הפיתוח
5. **תמיכה בדפדפנים ישנים** עם fallbacks מתאימים
6. **עקרון הפשטות** - התחל מהפתרון הפשוט ביותר

### עקרונות חשובים

- **CSS Logical Properties** בלבד
- **direction: rtl** בכל הרכיבים
- **text-align: start/end** במקום left/right
- **margin-inline-start/end** במקום margin-left/right
- **פשוט זה הכי טוב** - פתרונות פשוטים וברורים

### לקחים מהפרויקט TikTrack

- **מודלים**: מבנה HTML זהה + `justify-content: space-between` + `direction: rtl`
- **כפתורים**: גובה אחיד (32px) + איקונים סטנדרטיים + צבעים עקביים
- **צ'קבוקסים**: Override מוחלט של Bootstrap עם `flex-direction: row-reverse`
- **טבלאות**: `text-align: start` + מספרים עם `direction: ltr`

זכור: RTL הוא לא רק "להפוך את הכיוון" - זה דורש חשיבה מחדש על הממשק והתאמה מלאה לחוויית המשתמש העברית. **פשוט זה הכי טוב!**

---

*מדריך זה מתעדכן באופן שוטף. אם יש לך הצעות לשיפור או תוספות, אנא עדכן אותו.*

**קישורים נוספים:**
- [מדריך ארכיטקטורת CSS](CSS_ARCHITECTURE_GUIDE.md)
- [מדריך צבעים דינמיים](DYNAMIC_COLORS_GUIDE.md)
- [מדריך רכיבים](COMPONENT_LIBRARY.md)
