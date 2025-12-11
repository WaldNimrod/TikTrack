# Bootstrap 5 Menu Classes Reference

## רשימת מחלקות וסגנונות לפי הדוקומנטציה הרשמית

### 1. Navbar Classes

- `.navbar` - קונטיינר ראשי של סרגל הניווט
- `.navbar-brand` - לוגו או שם האתר
- `.navbar-nav` - רשימת פריטי הניווט
- `.navbar-toggler` - כפתור פתיחת תפריט במסכים קטנים
- `.navbar-collapse` - אזור התפריט הנפתח

### 2. Navigation Classes

- `.nav` - קונטיינר כללי לניווט
- `.nav-item` - פריט ניווט בודד
- `.nav-link` - קישור ניווט
- `.nav-tabs` - ניווט בטאבים
- `.nav-pills` - ניווט בכדורים

### 3. Dropdown Classes

- `.dropdown` - קונטיינר לתפריט נפתח
- `.dropdown-toggle` - כפתור פתיחת התפריט
- `.dropdown-menu` - התפריט הנפתח עצמו
- `.dropdown-item` - פריט בתפריט הנפתח
- `.dropdown-divider` - מפריד בין פריטים
- `.dropdown-header` - כותרת בקבוצת פריטים

### 4. Dropdown States

- `.show` - מצב פתוח של התפריט
- `.active` - פריט פעיל
- `.disabled` - פריט מושבת

### 5. Dropdown Positioning

- `.dropup` - תפריט נפתח כלפי מעלה
- `.dropend` - תפריט נפתח כלפי ימין
- `.dropstart` - תפריט נפתח כלפי שמאל

### 6. Responsive Classes

- `.navbar-expand-*` - התאמה לגודל מסך
- `.d-*` - מחלקות תצוגה
- `.flex-*` - מחלקות Flexbox

### 7. Custom Classes (TikTrack Specific)

- `.tiktrack-nav-item` - פריט ניווט מותאם אישית
- `.tiktrack-nav-link` - קישור ניווט מותאם אישית
- `.tiktrack-dropdown-menu` - תפריט נפתח מותאם אישית
- `.tiktrack-dropdown-item` - פריט תפריט מותאם אישית
- `.tiktrack-dropdown-arrow` - חץ תפריט מותאם אישית
- `.dropdown-submenu` - תפריט משנה
- `.submenu` - תפריט משנה רמה 2
- `.tiktrack-submenu` - תפריט משנה רמה 3
- `.submenu-arrow` - חץ תפריט משנה
- `.tiktrack-submenu-toggle` - כפתור פתיחת תפריט משנה

### 8. Pseudo-elements

- `::before` - אלמנט לפני התוכן
- `::after` - אלמנט אחרי התוכן

### 9. Media Queries

- `@media (max-width: 768px)` - מסכים קטנים
- `@media (min-width: 769px)` - מסכים גדולים

### 10. Keyframes

- `@keyframes` - אנימציות מותאמות אישית

### 11. CSS Variables

- `--bs-*` - משתני CSS של Bootstrap
- `--tiktrack-*` - משתני CSS מותאמים אישית

### 12. Important Selectors

- `#unified-header` - ID ראשי של התפריט
- `.header-container` - קונטיינר ראש הדף
- `.header-wrapper` - עטיפה פנימית
- `.header-top` - אזור עליון
- `.header-nav` - אזור ניווט
- `.main-nav` - ניווט ראשי
- `.tiktrack-nav-list` - רשימת ניווט מותאמת אישית

### 13. Hover States

- `:hover` - מצב ריחוף
- `:focus` - מצב מיקוד
- `:active` - מצב פעיל
- `:visited` - מצב ביקור

### 14. Attribute Selectors

- `[aria-expanded="true"]` - תפריט פתוח
- `[data-bs-toggle="dropdown"]` - כפתור פתיחת תפריט
- `[href="/"]` - קישור לעמוד הבית
- `[href="/index.html"]` - קישור לעמוד הבית (אלטרנטיבי)

### 15. Child Selectors

- `> .dropdown-menu` - תפריט נפתח ישיר
- `> .nav-link` - קישור ניווט ישיר
- `> .dropdown-item` - פריט תפריט ישיר

### 16. Sibling Selectors

- `+ .dropdown-menu` - תפריט נפתח שכן
- `~ .dropdown-menu` - תפריט נפתח שכן כללי

### 17. Last/First Child

- `:last-child` - פריט אחרון
- `:first-child` - פריט ראשון
- `:nth-child(n)` - פריט מספר n

### 18. Empty States

- `:empty` - אלמנט ריק
- `:not(:empty)` - אלמנט לא ריק

### 19. Form Integration

- `.form-control` - שדה טופס
- `.btn` - כפתור
- `.input-group` - קבוצת קלט

### 20. Accessibility

- `[role="menuitem"]` - תפקיד פריט תפריט
- `[aria-haspopup="true"]` - יש תפריט נפתח
- `[aria-labelledby]` - מתויג על ידי
- `[tabindex]` - סדר טאב
