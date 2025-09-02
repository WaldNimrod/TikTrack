# מדריך RTL לעברית - TikTrack

## תוכן עניינים

- [מבוא](#מבוא)
- [עקרונות בסיסיים](#עקרונות-בסיסיים)
- [הגדרות HTML](#הגדרות-html)
- [CSS Logical Properties](#css-logical-properties)
- [יישור אלמנטים](#יישור-אלמנטים)
- [טפסים וקלט](#טפסים-וקלט)
- [טבלאות](#טבלאות)
- [מודלים ודיאלוגים](#מודלים-ודיאלוגים)
- [ניווט ותפריטים](#ניווט-ותפריטים)
- [איקונים וסמלים](#איקונים-וסמלים)
- [בעיות נפוצות ופתרונות](#בעיות-נפוצות-ופתרונות)
- [בדיקות ואיכות](#בדיקות-ואיכות)
- [מקורות נוספים](#מקורות-נוספים)

---

## מבוא

מדריך זה נועד לעזור למפתחים לעבוד נכון עם RTL (Right-to-Left) בעברית בפרויקט TikTrack. העבודה עם RTL דורשת תשומת לב מיוחדת לפרטים רבים ושימוש בטכניקות מתקדמות.

### למה RTL חשוב?

- **חוויית משתמש**: משתמשים עבריים מצפים לממשק שמתאים לכיוון הקריאה שלהם
- **נגישות**: תמיכה נכונה ב-RTL משפרת את הנגישות למשתמשים עם מוגבלויות
- **סטנדרטים**: עמידה בסטנדרטים בינלאומיים לעבודה עם שפות RTL

---

## עקרונות בסיסיים

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
/* במקום margin-left/right */
margin-inline-start: 1rem;  /* ימין ב-RTL, שמאל ב-LTR */
margin-inline-end: 1rem;    /* שמאל ב-RTL, ימין ב-LTR */

/* במקום padding-left/right */
padding-inline-start: 1rem;
padding-inline-end: 1rem;

/* במקום border-left/right */
border-inline-start: 1px solid;
border-inline-end: 1px solid;
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

## הגדרות HTML

### 1. תג HTML ראשי
```html
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>כותרת האתר</title>
</head>
```

### 2. תגי meta חשובים
```html
<!-- הגדרת שפה וכיוון -->
<html lang="he" dir="rtl">

<!-- תמיכה ב-UTF-8 -->
<meta charset="UTF-8">

<!-- הגדרת viewport -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

### 3. תגי body
```html
<body dir="rtl" lang="he">
  <!-- תוכן האתר -->
</body>
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

---

## יישור אלמנטים

### 1. יישור טקסט
```css
/* יישור טקסט עברי */
.hebrew-text {
  text-align: right;
  direction: rtl;
}

/* יישור טקסט אנגלי */
.english-text {
  text-align: left;
  direction: ltr;
}
```

### 2. יישור אלמנטים
```css
/* יישור לימין (שמאל ב-RTL) */
.align-start {
  text-align: start;  /* ימין ב-RTL */
}

/* יישור לשמאל (ימין ב-RTL) */
.align-end {
  text-align: end;    /* שמאל ב-RTL */
}
```

### 3. Float
```css
/* Float לוגי */
.float-start {
  float: inline-start;  /* ימין ב-RTL */
}

.float-end {
  float: inline-end;    /* שמאל ב-RTL */
}
```

---

## טפסים וקלט

### 1. שדות קלט
```css
/* שדות טקסט */
input[type="text"],
input[type="email"],
input[type="password"],
textarea {
  direction: rtl;
  text-align: right;
}

/* מספרים - יישור לשמאל */
input[type="number"] {
  direction: ltr;
  text-align: left;
}
```

### 2. צ'קבוקסים ורדיו

**⚠️ חשוב: הגדרות אלה מוגדרות גלובלית ב-`styles.css` עם Override מוחלט של Bootstrap**

```css
/* צ'קבוקסים - הצ'קבוקס מימין לליבל */
/* הגדרות גלובליות עם Override מוחלט של Bootstrap */
.form-check,
div.form-check,
.modal .form-check,
body .form-check,
html .form-check,
#addTradeModal .form-check,
.table .form-check,
.filter-section .form-check,
.form-check.form-check-inline {
  display: flex !important;
  flex-direction: row-reverse !important;
  align-items: center !important;
  justify-content: flex-end !important;
  gap: 0.5rem !important;
  min-height: auto !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
  margin-bottom: 0 !important;
  text-align: right !important;
}

.form-check-input,
input.form-check-input,
.modal .form-check-input,
body .form-check-input,
html .form-check-input,
#addTradeModal .form-check-input,
.table .form-check-input,
.filter-section .form-check-input,
.form-check-input[type="checkbox"] {
  order: 2 !important;
  margin: 0 !important;
  float: none !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
}

.form-check-label,
label.form-check-label,
.modal .form-check-label,
body .form-check-label,
html .form-check-label,
#addTradeModal .form-check-label,
.table .form-check-label,
.filter-section .form-check-label {
  order: 1 !important;
  margin: 0 !important;
  float: none !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
}
```

**הערות חשובות:**
1. **סדר טעינת CSS**: `styles.css` חייב להיטען אחרון כדי לדרוס את Bootstrap
2. **Override מוחלט**: כל ההגדרות כוללות `!important` כדי לדרוס את Bootstrap
3. **Flexbox**: שימוש ב-`flex-direction: row-reverse` במקום `order`
4. **ביטול Bootstrap**: מבטל את `min-height`, `padding-left`, `margin-bottom` של Bootstrap

### 3. Select Dropdowns
```css
/* רשימות נפתחות */
select {
  direction: rtl;
  text-align: right;
}

/* אופציות ברשימה */
select option {
  direction: rtl;
  text-align: right;
}
```

---

## טבלאות

### 1. מבנה טבלה
```html
<table dir="rtl">
  <thead>
    <tr>
      <th>עמודה 1</th>
      <th>עמודה 2</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>תא 1</td>
      <td>תא 2</td>
    </tr>
  </tbody>
</table>
```

### 2. עיצוב טבלה
```css
/* טבלה עם RTL */
table {
  direction: rtl;
  text-align: right;
}

/* תאים */
td, th {
  text-align: right;
  padding-inline-start: 1rem;
  padding-inline-end: 1rem;
}

/* מספרים בטבלה - יישור לשמאל */
.number-cell {
  text-align: left;
  direction: ltr;
}
```

---

## מודלים ודיאלוגים

### 1. מודלים
```css
/* מודל עם RTL */
.modal {
  direction: rtl;
}

/* כותרת מודל */
.modal-header {
  text-align: right;
}

/* תוכן מודל */
.modal-body {
  text-align: right;
}

/* כפתורי מודל */
.modal-footer {
  justify-content: flex-start; /* ימין ב-RTL */
}
```

### 2. כפתורי סגירה
```css
/* כפתור סגירה - פינה שמאלית עליונה */
.modal .btn-close {
  position: absolute;
  top: 1rem;
  inset-inline-start: 1rem; /* ימין ב-RTL */
}
```

---

## ניווט ותפריטים

### 1. תפריט ראשי
```css
/* תפריט ניווט */
.navbar {
  direction: rtl;
}

.navbar-nav {
  flex-direction: row-reverse;
}

/* פריטי תפריט */
.nav-item {
  margin-inline-end: 1rem;
  margin-inline-start: 0;
}
```

### 2. Dropdown Menus
```css
/* תפריטים נפתחים */
.dropdown-menu {
  direction: rtl;
  text-align: right;
}

.dropdown-item {
  text-align: right;
  padding-inline-start: 1rem;
  padding-inline-end: 1rem;
}
```

### 3. Breadcrumbs
```css
/* פירורי לחם */
.breadcrumb {
  direction: rtl;
}

.breadcrumb-item {
  margin-inline-end: 0.5rem;
  margin-inline-start: 0;
}

/* מפרידים */
.breadcrumb-item + .breadcrumb-item::before {
  content: "›"; /* או ">" */
  margin-inline-end: 0.5rem;
  margin-inline-start: 0;
}
```

---

## איקונים וסמלים

### 1. איקונים עם טקסט
```css
/* איקון עם טקסט */
.icon-with-text {
  display: flex;
  align-items: center;
  direction: rtl;
}

.icon {
  margin-inline-start: 0.5rem;
  margin-inline-end: 0;
}
```

### 2. כפתורים עם איקונים
```css
/* כפתור עם איקון */
.btn-with-icon {
  display: flex;
  align-items: center;
  direction: rtl;
}

.btn-icon {
  margin-inline-start: 0.5rem;
  margin-inline-end: 0;
}
```

### 3. איקונים מתהפכים
```css
/* איקונים שצריכים להתהפך ב-RTL */
.flip-rtl {
  transform: scaleX(-1);
}
```

---

## בעיות נפוצות ופתרונות

### 1. מספרים מעורבים
```css
/* מספרים עם טקסט עברי */
.mixed-content {
  direction: rtl;
}

.mixed-content .number {
  direction: ltr;
  text-align: left;
  unicode-bidi: embed;
}
```

### 2. תאריכים
```css
/* תאריכים - יישור לשמאל */
.date {
  direction: ltr;
  text-align: left;
  unicode-bidi: embed;
}
```

### 3. כתובות URL
```css
/* כתובות URL - יישור לשמאל */
.url {
  direction: ltr;
  text-align: left;
  unicode-bidi: embed;
}
```

### 4. קוד מחשב
```css
/* קוד מחשב - יישור לשמאל */
.code {
  direction: ltr;
  text-align: left;
  unicode-bidi: embed;
  font-family: monospace;
}
```

---

## בדיקות ואיכות

### 1. בדיקות ידניות
> 📋 **כל הבדיקות הועברו ל**: [../CENTRAL_TASKS_TODO.md](../CENTRAL_TASKS_TODO.md)

### 2. בדיקות אוטומטיות
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
```

### 3. כלי בדיקה
- **Browser DevTools**: בדיקת computed styles
- **RTL Tester**: כלי לבדיקת RTL
- **Screen Reader**: בדיקת נגישות

---

## מקורות נוספים

### 1. מסמכים רשמיים
- [MDN - CSS Logical Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties_and_Values)
- [W3C - RTL Guidelines](https://www.w3.org/International/questions/qa-html-dir)
- [Bootstrap RTL Documentation](https://getbootstrap.com/docs/5.3/getting-started/rtl/)

### 2. כלים שימושיים
- [RTLCSS](https://rtlcss.com/) - כלי להמרת CSS ל-RTL
- [RTL Styling](https://rtlstyling.com/) - מדריך RTL מקיף
- [CSS-Tricks RTL](https://css-tricks.com/almanac/properties/d/direction/) - מדריך CSS-Tricks

### 3. דוגמאות קוד
- [GitHub - RTL Examples](https://github.com/topics/rtl)
- [CodePen - RTL Collections](https://codepen.io/tag/rtl)

---

## סיכום

עבודה נכונה עם RTL דורשת:
1. **הבנה מעמיקה** של עקרונות RTL
2. **שימוש ב-CSS Logical Properties** במקום properties פיזיים
3. **תשומת לב לפרטים** כמו מספרים, תאריכים וקוד
4. **בדיקות מקיפות** בכל שלב של הפיתוח
5. **תמיכה בדפדפנים ישנים** עם fallbacks מתאימים

זכור: RTL הוא לא רק "להפוך את הכיוון" - זה דורש חשיבה מחדש על הממשק והתאמה מלאה לחוויית המשתמש העברית.

---

*מסמך זה מתעדכן באופן שוטף. אם יש לך הצעות לשיפור או תוספות, אנא עדכן אותו.*
