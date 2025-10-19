# מיפוי צבעי כפתורים - TikTrack

## סקירה כללית

קובץ זה מכיל את המיפוי המלא בין מחלקות Bootstrap, משתני CSS ושמות בהעדפות המשתמש.

**חשוב:** כל הכפתורים במערכת מוגדרים בסגנון outline - רקע לבן, מסגרת וטקסט בצבע.

## טבלת התאמה

| מחלקה Bootstrap | משתנה CSS | שם בהעדפות | תיאור |
|------------------|------------|-------------|--------|
| `.btn-primary` | `--primary-color` | `primaryColor` | כפתורים ראשיים |
| `.btn-success` | `--success-color` | `successColor` | כפתורי הצלחה |
| `.btn-danger` | `--danger-color` | `dangerColor` | כפתורי סכנה |
| `.btn-secondary` | `--secondary-color` | `secondaryColor` | כפתורים משניים |
| `.btn-warning` | `--warning-color` | `warningColor` | כפתורי אזהרה |
| `.btn-info` | `--info-color` | `infoColor` | כפתורי מידע |

## וריאציות Outline

| מחלקה Bootstrap | משתנה CSS | שם בהעדפות | תיאור |
|------------------|------------|-------------|--------|
| `.btn-outline-primary` | `--primary-color` | `primaryColor` | כפתורים ראשיים עם מסגרת |
| `.btn-outline-success` | `--success-color` | `successColor` | כפתורי הצלחה עם מסגרת |
| `.btn-outline-danger` | `--danger-color` | `dangerColor` | כפתורי סכנה עם מסגרת |
| `.btn-outline-secondary` | `--secondary-color` | `secondaryColor` | כפתורים משניים עם מסגרת |
| `.btn-outline-warning` | `--warning-color` | `warningColor` | כפתורי אזהרה עם מסגרת |
| `.btn-outline-info` | `--info-color` | `infoColor` | כפתורי מידע עם מסגרת |

## משתני Hover

| משתנה CSS | שם בהעדפות | תיאור |
|------------|-------------|--------|
| `--primary-hover` | `primaryHover` | צבע hover לכפתורים ראשיים |
| `--success-hover` | `successHover` | צבע hover לכפתורי הצלחה |
| `--danger-hover` | `dangerHover` | צבע hover לכפתורי סכנה |
| `--secondary-hover` | `secondaryHover` | צבע hover לכפתורים משניים |
| `--warning-hover` | `warningHover` | צבע hover לכפתורי אזהרה |
| `--info-hover` | `infoHover` | צבע hover לכפתורי מידע |

## משתני גודל

| משתנה CSS | ערך ברירת מחדל | תיאור |
|------------|-----------------|--------|
| `--button-height-small` | `28px` | גובה כפתור קטן |
| `--button-height-normal` | `32px` | גובה כפתור רגיל |
| `--button-height-large` | `36px` | גובה כפתור גדול |
| `--button-padding-small` | `4px 8px` | פדינג כפתור קטן |
| `--button-padding-normal` | `6px 12px` | פדינג כפתור רגיל |
| `--button-padding-large` | `8px 16px` | פדינג כפתור גדול |
| `--button-font-size-small` | `12px` | גודל פונט כפתור קטן |
| `--button-font-size-normal` | `14px` | גודל פונט כפתור רגיל |
| `--button-font-size-large` | `16px` | גודל פונט כפתור גדול |

## דוגמאות קוד

### שימוש במחלקות Bootstrap

```html
<!-- כפתור ראשי -->
<button class="btn btn-primary">שמור</button>

<!-- כפתור הצלחה -->
<button class="btn btn-success">הוסף</button>

<!-- כפתור סכנה -->
<button class="btn btn-danger">מחק</button>

<!-- כפתור עם מסגרת -->
<button class="btn btn-outline-primary">ביטול</button>
```

### שימוש במשתני CSS

```css
.custom-button {
    background-color: var(--primary-color);
    border-color: var(--primary-color);
    color: white;
}

.custom-button:hover {
    background-color: var(--primary-hover);
    border-color: var(--primary-hover);
}
```

### שימוש בוריאציות

```html
<!-- כפתור קטן -->
<button class="btn btn-primary" data-variant="small">ערוך</button>

<!-- כפתור רגיל -->
<button class="btn btn-primary" data-variant="normal">ערוך</button>

<!-- כפתור מלא -->
<button class="btn btn-primary" data-variant="full">ערוך</button>
```

## קבצים רלוונטיים

- `trading-ui/styles-new/01-settings/_color-variables.css` - משתני צבע וגודל
- `trading-ui/styles-new/06-components/_bootstrap-overrides.css` - דריסות Bootstrap
- `trading-ui/scripts/color-scheme-system.js` - מערכת העדפות משתמש
- `trading-ui/designs.html` - עמוד הדוגמאות

## הערות חשובות

1. **צבעים דינמיים**: כל הצבעים מחוברים למערכת העדפות המשתמש
2. **Fallback**: קיימים ערכי ברירת מחדל לכל המשתנים
3. **תאימות**: כל הקוד הקיים עובד ללא שינויים
4. **תחזוקה**: שינוי במשתנה משפיע על כל המערכת
