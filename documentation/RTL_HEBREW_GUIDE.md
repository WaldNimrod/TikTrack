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

### 1. מודלים - הגדרה כללית לכל המודולים
```css
/* תבנית בסיס לכל המודולים */
.modal .modal-header {
  display: flex;
  justify-content: space-between; /* פיזור שווה בין כותרת לכפתור סגירה */
  align-items: center;
  border-radius: 6px 6px 0 0;
  border-bottom: none;
  direction: rtl; /* RTL למודולים */
  padding: 1rem 1.5rem;
  position: relative;
}

/* כותרת מודל */
.modal .modal-title {
  font-weight: 600;
  font-size: 1.25rem;
  text-align: right; /* יישור טקסט לימין ב-RTL */
  margin: 0;
  flex: 1; /* תופס את כל המקום הזמין */
}

/* תוכן מודל */
.modal-body {
  text-align: right;
  direction: rtl;
}

/* כפתורי מודל */
.modal-footer {
  justify-content: flex-start; /* ימין ב-RTL */
}
```

### 2. כפתורי פעולות במודולים
```css
/* כפתורי פעולות במודולים - גובה זהה לכפתור סגירה */
.modal .modal-header .btn-group .btn,
.modal .modal-header .btn {
  height: 32px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 6px !important;
}

/* כפתור סגירה עם עיצוב מיוחד */
.modal .btn-close {
  background-color: white !important;
  border: 1px solid #ff9c05 !important; /* מסגרת כתומה */
  color: #ff9c05 !important; /* תוכן כתום */
  border-radius: 4px;
  padding: 6px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin: 0;
}
```

### 3. מבנה HTML נכון למודלים
```html
<!-- מבנה נכון - זהה לכל המודולים -->
<div class="modal-header modal-header-colored">
    <h5 class="modal-title" id="modalLabel">כותרת המודול</h5>
    <div id="quickActionButtons" class="btn-group btn-group-sm" role="group">
        <!-- כפתורי פעולות עם איקונים -->
        <button class="btn btn-outline-light btn-sm" title="פריטים מקושרים">
            <i class="fas fa-link"></i>
        </button>
        <button class="btn btn-outline-light btn-sm" title="ערוך">
            <i class="fas fa-edit"></i>
        </button>
    </div>
    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
</div>
```

### 4. עקרונות חשובים למודלים
- **מבנה פשוט**: כותרת, כפתורי פעולות, כפתור סגירה באותו רמה
- **justify-content: space-between**: עובד נכון עם 3 אלמנטים
- **direction: rtl**: מיישר נכון - כותרת מימין, כפתורים משמאל
- **גובה אחיד**: כל הכפתורים 32px
- **איקונים**: כפתורי פעולות עם איקונים מתאימים

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

### 2. כפתורים עם איקונים - סטנדרטים
```css
/* כפתור עם איקון - גובה אחיד */
.btn-with-icon {
  height: 32px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 6px !important;
}

/* איקונים בכפתורים */
.btn-icon {
  margin-inline-start: 0.5rem;
  margin-inline-end: 0;
}
```

### 3. איקונים סטנדרטיים בפרויקט
```html
<!-- איקונים נפוצים בפרויקט -->
<i class="fas fa-link"></i>     <!-- פריטים מקושרים -->
<i class="fas fa-edit"></i>     <!-- ערוך -->
<i class="fas fa-plus"></i>     <!-- הוספה -->
<i class="fas fa-trash"></i>    <!-- מחיקה -->
<i class="fas fa-eye"></i>      <!-- צפייה -->
<i class="fas fa-save"></i>     <!-- שמירה -->
<i class="fas fa-times"></i>    <!-- ביטול/סגירה -->
```

### 4. כפתורי פעולות סטנדרטיים
```css
/* כפתור ביטול/שיחזור */
.btn-cancel {
  background-color: #dc3545 !important; /* אדום */
  border-color: #dc3545 !important;
  color: white !important;
}

/* כפתור שיחזור */
.btn-restore {
  background-color: #28a745 !important; /* ירוק */
  border-color: #28a745 !important;
  color: white !important;
}

/* כפתור סגירה */
.btn-close {
  background-color: white !important;
  border: 1px solid #ff9c05 !important; /* מסגרת כתומה */
  color: #ff9c05 !important; /* תוכן כתום */
}
```

### 5. איקונים מתהפכים
```css
/* איקונים שצריכים להתהפך ב-RTL */
.flip-rtl {
  transform: scaleX(-1);
}
```

---

## לקחים חשובים מהפרויקט

### 1. עקרון הפשטות (KISS Principle)
> **"פשוט זה הכי טוב"** - זה הכלל החשוב ביותר בתכנות ועיצוב RTL

**מה למדנו:**
- התחיל תמיד מהפתרון הפשוט ביותר
- הימנע מהגדרות מורכבות עם `order`, `!important`, ו-div-ים נוספים
- השתמש במבנה HTML זהה למודלים שעובדים
- הגדרה כללית אחת לכל המודולים עדיפה על הגדרות ספציפיות

**דוגמה:**
```css
/* ✅ נכון - פשוט ויעיל */
.modal .modal-header {
  display: flex;
  justify-content: space-between;
  direction: rtl;
}

/* ❌ שגוי - מורכב מדי */
.modal .modal-header .modal-title { order: 2; }
.modal .modal-header .d-flex { order: 1; }
```

### 2. מבנה HTML אחיד
**עקרון:** כל המודולים צריכים להיות עם מבנה HTML זהה

```html
<!-- מבנה נכון לכל המודולים -->
<div class="modal-header">
    <h5 class="modal-title">כותרת</h5>
    <div class="btn-group">כפתורי פעולות</div>
    <button class="btn-close">סגירה</button>
</div>
```

### 3. הימנעות מהגדרות דורסות
**עקרון:** הסר הגדרות ספציפיות שמדרסות את ההגדרה הכללית

```css
/* ❌ שגוי - הגדרות דורסות */
#addTickerModal .modal-header {
  display: flex;
  justify-content: space-between;
}

/* ✅ נכון - הגדרה כללית בלבד */
.modal .modal-header {
  display: flex;
  justify-content: space-between;
}
```

### 4. טיפול בשגיאות API
**עקרון:** הוסף טיפול בשגיאות נפוצות כמו 410 (GONE)

```javascript
if (response.status === 404 || response.status === 410) {
    console.debug(`No data found (status: ${response.status})`);
    return null;
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
6. **עקרון הפשטות** - התחל מהפתרון הפשוט ביותר
7. **מבנה HTML אחיד** לכל המודולים והרכיבים
8. **הימנעות מהגדרות דורסות** - הגדרה כללית עדיפה על ספציפית

### לקחים מהפרויקט TikTrack:
- **מודלים**: מבנה HTML זהה + `justify-content: space-between` + `direction: rtl`
- **כפתורים**: גובה אחיד (32px) + איקונים סטנדרטיים + צבעים עקביים
- **צ'קבוקסים**: Override מוחלט של Bootstrap עם `flex-direction: row-reverse`
- **API**: טיפול בשגיאות נפוצות (404, 410) עם fallbacks מתאימים

זכור: RTL הוא לא רק "להפוך את הכיוון" - זה דורש חשיבה מחדש על הממשק והתאמה מלאה לחוויית המשתמש העברית. **פשוט זה הכי טוב!**

---

*מסמך זה מתעדכן באופן שוטף. אם יש לך הצעות לשיפור או תוספות, אנא עדכן אותו.*
