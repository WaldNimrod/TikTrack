# CSS Hierarchy Audit Report
**Date:** 2026-01-31  
**Team:** Team 30 (Frontend)

## קבצי CSS במערכת

### 1. `phoenix-base.css` - שכבה בסיסית
**תפקיד:** הגדרות בסיס למערכת כולה
**תוכן:**
- CSS Variables (:root)
- Base styles (html, body)
- Typography (h1-h6, p, a)
- Form Elements Base (input, textarea, select, label, .form-group, .form-control, .form-select)
- Buttons Base (button, .btn)

### 2. `phoenix-components.css` - רכיבי LEGO
**תפקיד:** רכיבי LEGO System בלבד
**תוכן:**
- tt-container
- tt-section
- tt-section-row

### 3. `phoenix-header.css` - הדר
**תפקיד:** סגנונות הדר בלבד
**תוכן:**
- #unified-header וכל תתי-אלמנטים
- כל הסגנונות מתחילים ב-`#unified-header`

### 4. `D15_IDENTITY_STYLES.css` - עמודי אוטנטיקציה
**תפקיד:** סגנונות ספציפיים לעמודי אוטנטיקציה בלבד
**תוכן:**
- body.auth-layout-root
- .auth-header, .auth-logo, .auth-title, .auth-subtitle
- body.auth-layout-root form .form-control (override)
- .btn-auth-primary (כפתור ספציפי לאוטנטיקציה)
- .form-options, .remember-me, .lod-checkbox
- .auth-footer-zone, .auth-link, .auth-link-bold

## בדיקת כפילויות

### ✅ אין כפילויות בין הקבצים:
- `phoenix-base.css` - בסיס בלבד
- `phoenix-components.css` - LEGO בלבד
- `phoenix-header.css` - הדר בלבד (#unified-header prefix)
- `D15_IDENTITY_STYLES.css` - אוטנטיקציה בלבד (body.auth-layout-root prefix)

### ✅ כל מחלקה בקובץ הנכון:
- Form elements → `phoenix-base.css` ✅
- Buttons base → `phoenix-base.css` ✅
- LEGO components → `phoenix-components.css` ✅
- Header → `phoenix-header.css` ✅
- Auth-specific → `D15_IDENTITY_STYLES.css` ✅

## השוואה לסטנדרט הלגסי

### Variables - תואם ✅
- כל המשתנים מהלגסי קיימים
- הוספתי `--apple-spacing-xs/sm/md/lg/xl`
- הוספתי `--apple-radius-small/medium/large`

### Form Elements - תואם ✅
- `input/textarea/select` - תואם ללגסי (0.35rem 0.9rem, 0.9rem)
- `.form-group label` - תואם ללגסי (15px, 500, margin-bottom: var(--apple-spacing-xs))
- `.form-select` - נוסף בהתאם ללגסי

### Buttons - תואם ✅
- `button/.btn` - תואם ללגסי (0.375rem 0.75rem, 0.875rem, margin-inline-end)
- כל ה-states (hover, focus, active, disabled) תואמים

## בעיות שזוהו ותוקנו

1. ✅ הוספתי `--apple-spacing-xs/sm/md/lg/xl` ל-variables
2. ✅ הוספתי `--apple-radius-small/medium/large` ל-variables
3. ✅ תיקנתי `.form-group label` להיות כמו בלגסי (`.form-group label` במקום רק `label`)
4. ✅ תיקנתי `button/.btn` להיות כמו בלגסי (margin-inline-end במקום margin-right)
5. ✅ הוספתי `.form-select` בהתאם ללגסי
6. ✅ הסרתי כל ה-`!important` מהקוד

## היררכיית טעינה נכונה

```html
1. Pico CSS (CDN)
2. phoenix-base.css
3. phoenix-components.css
4. phoenix-header.css (אם יש הדר)
5. D15_IDENTITY_STYLES.css (אם עמוד אוטנטיקציה)
```

## סטטוס: ✅ מוכן לבדיקה
