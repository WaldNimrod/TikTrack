# דוח כפילויות CSS
==================================================

## #unified-header .dropdown-submenu .submenu
מופיע ב-4 קבצים:
- header-menu-clean.css
- unified-menus-pushed.css
- _header-system.css
- _header-system-clean.css

## #unified-header .tiktrack-submenu
מופיע ב-9 קבצים:
- header-menu-clean.css
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-yesterday.css
- unified-yesterday.css
- _header-system-yesterday.css
- _header-system-yesterday.css

## from
מופיע ב-8 קבצים:
- header-menu-clean.css
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-yesterday.css
- _header-system-yesterday.css
- _header-system-clean.css

## to
מופיע ב-8 קבצים:
- header-menu-clean.css
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-yesterday.css
- _header-system-yesterday.css
- _bootstrap-overrides.css
- _header-system-clean.css

## /**
 * TikTrack Unified CSS File
 * קובץ CSS מאוחד למערכת TikTrack
 * 
 * נבנה אוטומטית מקבצי ITCSS נפרדים
 * ללא @import - כל הסגנונות בקובץ אחד
 * 
 * @version 1.0.0
 * @lastUpdated September 6, 2025
 * @author TikTrack Development Team
 */


/* ===== 01-settings/_variables.css ===== */
/**
 * CSS Variables - משתנים גלובליים
 * 
 * קובץ זה מכיל את כל המשתנים הגלובליים של המערכת
 * מבוסס על Apple Design System עם התאמה לעברית ו-RTL
 * 
 * @version 1.0.0
 * @lastUpdated January 5, 2025
 */

:root
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* ===== 01-settings/_colors-dynamic.css ===== */
/**
 * צבעי ישויות דינמיים - Dynamic Entity Colors
 * 
 * קובץ זה מכיל את צבעי הישויות השונות במערכת
 * הצבעים נטענים דינמית מה-API ומעודכנים בזמן אמת
 * 
 * @version 1.0.0
 * @lastUpdated January 5, 2025
 */

:root
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* ===== 01-settings/_colors-semantic.css ===== */
/**
 * צבעים סמנטיים - Semantic Colors
 * 
 * קובץ זה מכיל צבעים לפי משמעות סמנטית
 * הצלחה, שגיאה, אזהרה, מידע וכו'
 * 
 * @version 1.0.0
 * @lastUpdated January 5, 2025
 */

:root
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* ===== 01-settings/_spacing.css ===== */
/**
 * מרווחים - Spacing System
 * 
 * קובץ זה מכיל את מערכת המרווחים הגלובלית
 * מבוסס על Apple Design System עם scale עקבי
 * 
 * @version 1.0.0
 * @lastUpdated January 5, 2025
 */

:root
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* ===== 01-settings/_typography.css ===== */
/**
 * טיפוגרפיה - Typography System
 * 
 * קובץ זה מכיל את מערכת הטיפוגרפיה הגלובלית
 * עם תמיכה מלאה בעברית ו-RTL
 * 
 * @version 1.0.0
 * @lastUpdated January 5, 2025
 */

:root
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* ===== 01-settings/_rtl-logical.css ===== */
/**
 * RTL & CSS Logical Properties
 * 
 * קובץ זה מכיל הגדרות RTL ו-Logical Properties
 * מבטיח עבודה נכונה עם עברית ו-RTL
 * 
 * @version 1.0.0
 * @lastUpdated January 5, 2025
 */

:root
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* ===== 03-generic/_reset.css ===== */
/**
 * CSS Reset - איפוס סגנונות ברירת מחדל
 * 
 * קובץ זה מאפס את סגנונות ברירת המחדל של הדפדפן
 * ומוודא התנהגות עקבית בכל הדפדפנים
 * 
 * @version 1.0.0
 * @lastUpdated January 5, 2025
 */

/* Box-sizing reset */
*,
*::before,
*::after
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* Remove default margin and padding */
*
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _reset.css

## /* Remove list styles on ul, ol elements with a list role */
ul[role='list'],
ol[role='list']
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _reset.css

## /* Set core root defaults */
html:focus-within
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _reset.css

## /* Set core body defaults */
body
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _reset.css

## /* ===== 03-generic/_base.css ===== */
/**
 * Base Styles - סגנונות בסיס
 * 
 * קובץ זה מכיל את הסגנונות הבסיסיים ביותר עבור HTML ו-body
 * מבוסס על הסגנונות הקיימים ב-apple-theme.css
 * 
 * @version 1.0.0
 * @lastUpdated January 5, 2025
 */

/* HTML root settings */
html
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* Body base styles - מבוסס על apple-theme.css */
body
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _base.css

## /* ===== 04-elements/_headings.css ===== */
/**
 * כותרות - Headings
 * 
 * קובץ זה מכיל את הסגנונות של כל הכותרות במערכת
 * מבוסס על הסגנונות הקיימים
 * 
 * @version 1.0.0
 * @lastUpdated January 5, 2025
 */

/* כל הכותרות */
h1, h2, h3, h4, h5, h6
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* גדלי כותרות */
h1
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _headings.css

## h2
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _headings.css

## h3
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _headings.css

## h4
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _headings.css

## h5
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _headings.css

## h6
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _headings.css

## /* ===== 04-elements/_links.css ===== */
/**
 * קישורים - Links
 * 
 * קובץ זה מכיל את הסגנונות של כל הקישורים במערכת
 * מבוסס על הסגנונות הקיימים ב-styles.css
 * 
 * @version 1.0.0
 * @lastUpdated January 5, 2025
 */

/* כל הקישורים - מבוסס על הסגנונות הקיימים */
a,
.clickable-link,
strong[onclick]
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* Hover state */
a:hover,
.clickable-link:hover,
strong[onclick]:hover
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _links.css

## /* Focus state */
a:focus,
.clickable-link:focus
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _links.css

## /* Visited state */
a:visited
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _links.css

## /* Active state */
a:active,
.clickable-link:active
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _links.css

## /* ===== 04-elements/_forms-base.css ===== */
/**
 * טפסים בסיסיים - Base Forms
 * 
 * קובץ זה מכיל את הסגנונות הבסיסיים של כל שדות הטפסים
 * מבוסס על הסגנונות הקיימים ב-apple-theme.css
 * 
 * @version 1.0.0
 * @lastUpdated January 5, 2025
 */

/* Form groups - מבוסס על apple-theme.css */
.form-group
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .form-group label
מופיע ב-5 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _forms-base.css
- _bootstrap-overrides.css

## /* Input fields */
.form-group input,
.form-group select,
.form-group textarea,
input[type="text"],
input[type="email"],
input[type="password"],
input[type="number"],
input[type="date"],
select,
textarea
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _forms-base.css

## /* Focus state */
.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus,
input[type="text"]:focus,
input[type="email"]:focus,
input[type="password"]:focus,
input[type="number"]:focus,
input[type="date"]:focus,
select:focus,
textarea:focus
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _forms-base.css

## /* מספרים - יישור לשמאל */
input[type="number"]
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _forms-base.css

## /* תאריכים - יישור לשמאל */
input[type="date"]
מופיע ב-8 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified.css
- unified.css
- unified-yesterday.css
- unified-yesterday.css
- _forms-base.css
- _forms-advanced.css

## /* ===== 04-elements/_buttons-base.css ===== */
/**
 * כפתורים בסיסיים - Base Buttons
 * 
 * קובץ זה מכיל את הסגנונות הבסיסיים של כל הכפתורים במערכת
 * מבוסס על הסגנונות הקיימים ב-styles.css
 * 
 * @version 1.0.0
 * @lastUpdated January 5, 2025
 */

/* ברירת מחדל לכל הכפתורים - מבוסס על הסגנונות הקיימים */
button,
.btn
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* Hover state לכל הכפתורים */
button:hover,
.btn:hover
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _buttons-base.css

## /* Focus state */
button:focus,
.btn:focus
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _buttons-base.css

## /* Active state */
button:active,
.btn:active
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _buttons-base.css

## /* Disabled state */
button:disabled,
.btn:disabled
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _buttons-base.css

## /* Small buttons */
.btn-sm
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _buttons-base.css

## /* Large buttons */
.btn-lg
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _buttons-base.css

## /* ===== 05-objects/_layout.css ===== */
/**
 * Layout Objects - אובייקטי פריסה
 * 
 * קובץ זה מכיל את מערכת הפריסה הבסיסית
 * containers, wrappers וmain layout objects
 * 
 * @version 1.0.0
 * @lastUpdated January 5, 2025
 */

/* Main page layout */
.page-body
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* Content wrapper */
.content-wrapper
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _layout.css

## /* Dashboard container - מבוסס על index.css */
.dashboard-container
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _layout.css

## /* Background wrapper */
.background-wrapper
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _layout.css

## /* Container with border */
.container-with-border
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _layout.css

## /* ===== 05-objects/_grid.css ===== */
/**
 * Grid System - מערכת גריד
 * 
 * קובץ זה מכיל את מערכת הגריד והפריסה בעמודות
 * מבוסס על הפריסות הקיימות במערכת
 * 
 * @version 1.0.0
 * @lastUpdated January 5, 2025
 */

/* Two-column layout - מבוסס על preferences */
.preference-items-grid,
.two-column-grid
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* Auto-fit grid */
.overview-grid
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _grid.css

## /* Stats grid - מבוסס על index.css */
.stats-grid
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _grid.css

## .compact-stats-grid
מופיע ב-8 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified.css
- unified.css
- unified-yesterday.css
- unified-yesterday.css
- _grid.css
- _grid.css

## /* Hero stats grid */
.hero-stats
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _grid.css

## /* Charts grid */
.charts-grid
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _grid.css

## /* Quick content grid */
.quick-content
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _grid.css

## /* Content grid */
.compact-content-grid
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _grid.css

## /* Comprehensive content */
.comprehensive-content
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _grid.css

## .preference-items-grid,
  .two-column-grid
מופיע ב-3 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css
- _grid.css

## .compact-content-grid,
  .charts-content,
  .comprehensive-content
מופיע ב-3 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css
- _grid.css

## .quick-content
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _grid.css

## .hero-stats
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _grid.css

## .overview-grid
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _grid.css

## .charts-grid
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _grid.css

## .stats-grid
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _grid.css

## /* ===== 06-components/_buttons-advanced.css ===== */
/**
 * כפתורים מתקדמים - Advanced Buttons
 * 
 * קובץ זה מכיל את הסגנונות המתקדמים של כפתורים ספציפיים
 * מבוסס על הסגנונות הקיימים ב-styles.css
 * 
 * @version 1.0.0
 * @lastUpdated January 5, 2025
 */

/* כפתור מודגש בצבע כתום - לשימוש בכל המערכת */
.btn-emphasized,
.btn-primary-emphasized,
button.btn-emphasized,
button.btn-primary-emphasized
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .btn-emphasized:hover,
.btn-primary-emphasized:hover
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _buttons-advanced.css

## /* כפתורי שמירה עם צבע הלוגו */
.btn-success[onclick*="save"],
.btn-success[onclick*="Save"],
button[onclick*="saveTradeRecord"],
button[onclick*="saveNewTradeRecord"],
.btn-success
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _buttons-advanced.css

## .btn-success:hover
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _buttons-advanced.css

## /* כפתורי מחיקה */
.btn-danger
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _buttons-advanced.css

## .btn-danger:hover
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _buttons-advanced.css

## /* כפתורי outline */
.btn-outline-success
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _buttons-advanced.css

## .btn-outline-success:hover
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _buttons-advanced.css

## .btn-outline-primary
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _buttons-advanced.css

## .btn-outline-primary:hover
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _buttons-advanced.css

## .btn-outline-danger
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _buttons-advanced.css

## .btn-outline-danger:hover
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _buttons-advanced.css

## /* כפתור ביטול לא פעיל */
.btn-cancel-disabled
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _buttons-advanced.css

## .btn-cancel-disabled:hover
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _buttons-advanced.css

## /* כפתור סגירה עם X */
.btn .cancel-icon
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _buttons-advanced.css

## /* ===== 06-components/_tables.css ===== */
/**
 * טבלאות - Tables
 * 
 * קובץ זה מכיל את הסגנונות הבסיסיים של כל הטבלאות במערכת
 * מבוסס על הסגנונות הקיימים ב-table.css
 * 
 * @version 1.0.0
 * @lastUpdated January 5, 2025
 */

/* הגדרות כלליות לכל הטבלאות */
table,
.table,
.data-table
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* כותרות טבלה */
table th,
.table th,
.data-table th
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _tables.css

## /* תאי טבלה */
table td,
.table td,
.data-table td
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _tables.css

## /* Hover effect לשורות */
.data-table tbody tr
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _tables.css

## .data-table tbody tr:hover
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _tables.css

## .data-table tbody tr:last-child td
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _tables.css

## /* עמודת פעולות */
.actions-cell
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _tables.css

## .actions-cell .btn
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _tables.css

## /* Table container */
.table-container
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _tables.css

## /* Table responsive */
.table-responsive
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _tables.css

## /* Data table עם עיצוב מתקדם */
.data-table
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _tables.css

## /* כפתורי מיון */
.sortable-header,
.sortable-header-btn
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _tables.css

## .sortable-header:hover,
.sortable-header-btn:hover
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _tables.css

## /* איקוני מיון */
.sortable-header .sort-icon,
.sortable-header-btn .sort-icon
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _tables.css

## .sortable-header:hover .sort-icon,
.sortable-header-btn:hover .sort-icon
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _tables.css

## .sortable-header.active-sort .sort-icon
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _tables.css

## /* כותרת טבלה */
.table-title
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _tables.css

## .top-section .table-title
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _tables.css

## /* מונה טבלה */
.table-count
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _tables.css

## /* פעולות טבלה */
.table-actions
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _tables.css

## /* כותרת עמודת פעולות */
table th.actions-cell
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _tables.css

## /* Header לטבלה */
.table-header
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _tables.css

## /* ===== 06-components/_cards.css ===== */
/**
 * כרטיסים - Cards
 * 
 * קובץ זה מכיל את הסגנונות של כל הכרטיסים במערכת
 * מבוסס על הסגנונות הקיימים ב-apple-theme.css
 * 
 * @version 1.0.0
 * @lastUpdated January 5, 2025
 */

/* כרטיסים בסיסיים - מבוסס על apple-theme.css */
.card:not(.design-card)
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* כרטיסי התראות - מבוסס על index.css */
.alert-card
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _cards.css

## .alert-card:hover
מופיע ב-6 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- unified-yesterday.css
- _cards.css

## .alert-ticker
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _cards.css

## .alert-description
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _cards.css

## .alert-status
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _cards.css

## .alert-status.active
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _cards.css

## .alert-status.pending
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _cards.css

## /* כרטיסי סטטוס - מבוסס על cache-test */
.status-card
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _cards.css

## .status-card:hover
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _cards.css

## /* כרטיסי overview - מבוסס על index.css */
.overview-card
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _cards.css

## .overview-card:hover
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _cards.css

## .overview-card.primary
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _cards.css

## .overview-card.success
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _cards.css

## .overview-card.info
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _cards.css

## .overview-card.warning
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _cards.css

## .overview-card-icon
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _cards.css

## .overview-card-content
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _cards.css

## .overview-card-number
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _cards.css

## .overview-card-label
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _cards.css

## .overview-card-change
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _cards.css

## .overview-card-change.positive
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _cards.css

## .overview-card-change.negative
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _cards.css

## /* כרטיסי סטטיסטיקות */
.compact-stat-card
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _cards.css

## .compact-stat-number
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _cards.css

## .compact-stat-number.positive
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _cards.css

## .compact-stat-number.negative
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _cards.css

## .compact-stat-label
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _cards.css

## /* כרטיסי גרף */
.chart-card
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _cards.css

## .chart-title
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _cards.css

## .chart-container
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _cards.css

## /* כרטיסי סטטוס נוספים */
.stat-card
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _cards.css

## .stat-header
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _cards.css

## .stat-title
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _cards.css

## .stat-content
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _cards.css

## .stat-row
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _cards.css

## .stat-row:last-child
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _cards.css

## /* ===== 06-components/_modals.css ===== */
/**
 * מודלים - Modals
 * 
 * קובץ זה מכיל את הסגנונות של כל המודלים במערכת
 * מבוסס על הסגנונות הקיימים ב-apple-theme.css
 * 
 * @version 1.0.0
 * @lastUpdated January 5, 2025
 */

/* מודל בסיסי - מבוסס על apple-theme.css */
.modal
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* הגדרות z-index גבוהות לכל המודלים באתר */
.modal-dialog
מופיע ב-5 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _modals.css
- _bootstrap-overrides.css

## /* הגדרות מיוחדות למודלים גדולים */
.modal-dialog.modal-lg
מופיע ב-5 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _modals.css
- _bootstrap-overrides.css

## .modal-content
מופיע ב-5 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _modals.css
- _bootstrap-overrides.css

## .modal-backdrop
מופיע ב-5 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _modals.css
- _bootstrap-overrides.css

## /* הודעות - וידוא שהן מופיעות מעל הכל */
.toast
מופיע ב-5 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _modals.css
- _bootstrap-overrides.css

## .toast-container
מופיע ב-5 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _modals.css
- _bootstrap-overrides.css

## /* וידוא שכל המודלים מופיעים מעל הכל */
.modal.show
מופיע ב-5 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _modals.css
- _bootstrap-overrides.css

## .modal.show .modal-dialog
מופיע ב-5 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _modals.css
- _bootstrap-overrides.css

## .modal.show .modal-content
מופיע ב-9 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified.css
- unified.css
- unified-yesterday.css
- unified-yesterday.css
- _modals.css
- _modals.css
- _bootstrap-overrides.css

## /* וידוא שהרקע לא חוסם את המודלים */
.modal-backdrop.show
מופיע ב-5 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _modals.css
- _bootstrap-overrides.css

## /* מודלים ספציפיים עם z-index גבוה יותר */
#addAlertModal,
#editAlertModal,
#addExecutionModal,
#editExecutionModal,
#deleteExecutionModal,
#linkedItemsModal,
#warningModal
מופיע ב-5 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _modals.css
- _bootstrap-overrides.css

## #addAlertModal .modal-dialog,
#editAlertModal .modal-dialog,
#addExecutionModal .modal-dialog,
#editExecutionModal .modal-dialog,
#deleteExecutionModal .modal-dialog,
#linkedItemsModal .modal-dialog,
#warningModal .modal-dialog
מופיע ב-5 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _modals.css
- _bootstrap-overrides.css

## #addAlertModal .modal-content,
#editAlertModal .modal-content,
#addExecutionModal .modal-content,
#editExecutionModal .modal-content,
#deleteExecutionModal .modal-content,
#linkedItemsModal .modal-content,
#warningModal .modal-content
מופיע ב-5 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _modals.css
- _bootstrap-overrides.css

## /* מניעת סגירת מודלים בלחיצה על הרקע */
.modal[data-bs-backdrop="static"]
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _modals.css

## .modal[data-bs-backdrop="static"] .modal-backdrop
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _modals.css

## .modal[data-bs-backdrop="static"] .modal-content
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _modals.css

## .modal[data-bs-backdrop="static"] .modal-dialog
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _modals.css

## .modal[data-bs-backdrop="static"] .modal-header,
.modal[data-bs-backdrop="static"] .modal-body,
.modal[data-bs-backdrop="static"] .modal-footer
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _modals.css

## /* מניעת סגירת מודלים בלחיצה על הרקע - Bootstrap override */
.modal[data-bs-backdrop="static"] .modal-backdrop.show
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _modals.css

## .modal[data-bs-backdrop="static"].show .modal-backdrop
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _modals.css

## /* הגדרה גלובלית לכל המודלים - מניעת סגירה בלחיצה על הרקע */
.modal .modal-backdrop
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _modals.css

## .modal .modal-content
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _modals.css

## .modal .modal-dialog
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _modals.css

## .modal .modal-header,
.modal .modal-body,
.modal .modal-footer
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _modals.css

## /* מניעת סגירת מודלים בלחיצה על הרקע - הגדרה כללית */
.modal.show .modal-backdrop
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _modals.css

## /* מניעת אנימציה בלחיצה על הרקע */
.modal[data-bs-backdrop="static"] .modal-backdrop
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _modals.css

## .modal[data-bs-backdrop="static"] .modal-backdrop.show
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _modals.css

## .modal[data-bs-backdrop="static"] .modal-backdrop.fade
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _modals.css

## .modal[data-bs-backdrop="static"] .modal-backdrop.fade.show
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _modals.css

## /* כותרת מודל */
.modal-header
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _modals.css

## /* תוכן מודל */
.modal-body
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _modals.css

## /* כפתורי מודל */
.modal-footer
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _modals.css

## /* כפתור סגירה - פינה שמאלית עליונה */
.modal .btn-close
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _modals.css

## /* כפתורי סגירה במודולים */
.modal-header .btn-close
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _modals.css

## /* כפתור סגירה בכותרת רגילה - צבע ירוק */
.modal-header:not(.modal-header-colored):not(.modal-header-danger) .btn-close
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _modals.css

## /* וידוא שהודעות שגיאה מופיעות מעל המודול */
.modal .invalid-feedback
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _modals.css

## /* הודעות שגיאה בתוך המודול */
.modal-body .invalid-feedback
מופיע ב-5 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _modals.css
- _bootstrap-overrides.css

## /* שדות עם שגיאה */
.modal-body .form-control.is-invalid,
.modal-body .form-select.is-invalid
מופיע ב-5 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _modals.css
- _bootstrap-overrides.css

## /* כפתורי מחיקה בתוך modals */
.modal .btn-danger
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _modals.css

## .modal .btn-danger:hover
מופיע ב-5 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _modals.css
- _bootstrap-overrides.css

## /* מודל זהיר */
#warningModal .table
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _modals.css

## #warningModal .table th
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _modals.css

## #warningModal .table td
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _modals.css

## /* ===== 06-components/_notifications.css ===== */
/**
 * מערכת התראות - Notifications
 * 
 * קובץ זה מכיל את הסגנונות של מערכת ההתראות
 * מבוסס על הסגנונות הקיימים ב-notification-system.css
 * 
 * @version 1.0.0
 * @lastUpdated January 5, 2025
 */

/* קונטיינר התראות */
.notification-container
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* התראה בודדת - עיצוב בסיסי */
.notification
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _notifications.css

## .notification.show
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _notifications.css

## .notification.hide
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _notifications.css

## .notification-icon
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _notifications.css

## .notification-content
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _notifications.css

## .notification-title
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _notifications.css

## .notification-message
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _notifications.css

## .notification-close
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _notifications.css

## .notification-close:hover
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _notifications.css

## /* סוגי התראות */
.notification.success
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _notifications.css

## .notification.success .notification-icon
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _notifications.css

## .notification.error
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _notifications.css

## .notification.error .notification-icon
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _notifications.css

## .notification.warning
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _notifications.css

## .notification.warning .notification-icon
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _notifications.css

## .notification.info
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _notifications.css

## .notification.info .notification-icon
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _notifications.css

## /* התראות פעילות - לא אייקונים */
.active-alerts
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _notifications.css

## .active-alerts-header
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _notifications.css

## .active-alerts-title
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _notifications.css

## .active-alerts-count
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _notifications.css

## .active-alert-item
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _notifications.css

## .active-alert-item:hover
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _notifications.css

## .active-alert-item:last-child
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _notifications.css

## /* צבעי התראות פעילות לפי סוג */
.active-alert-item.type-account
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _notifications.css

## .active-alert-item.type-trade
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _notifications.css

## .active-alert-item.type-trade-plan
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _notifications.css

## .active-alert-item.type-ticker
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _notifications.css

## .active-alert-content
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _notifications.css

## .active-alert-ticker
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _notifications.css

## .active-alert-condition
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _notifications.css

## .active-alert-time
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _notifications.css

## /* ===== 06-components/_navigation.css ===== */
/**
 * ניווט - Navigation
 * 
 * קובץ זה מכיל את הסגנונות הבסיסיים של מערכת הניווט
 * כללי ולא ספציפי ל-unified-header
 * 
 * @version 1.0.0
 * @lastUpdated January 5, 2025
 */

/* סגנונות ניווט כלליים */
.navbar
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .navbar-nav
מופיע ב-7 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- unified-yesterday.css
- _navigation.css
- _navigation.css

## /* פריטי תפריט */
.nav-item
מופיע ב-3 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css
- _navigation.css

## .nav-link
מופיע ב-8 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified.css
- unified.css
- unified-yesterday.css
- unified-yesterday.css
- _navigation.css
- _navigation.css

## .nav-link:hover
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _navigation.css

## .nav-link.active
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _navigation.css

## /* תפריטים נפתחים */
.dropdown-menu
מופיע ב-3 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css
- _navigation.css

## .dropdown-item
מופיע ב-3 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css
- _navigation.css

## .dropdown-item:hover
מופיע ב-3 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css
- _navigation.css

## /* פירורי לחם */
.breadcrumb
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _navigation.css

## .breadcrumb-item
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _navigation.css

## .breadcrumb-item + .breadcrumb-item::before
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _navigation.css

## .breadcrumb-item.active
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _navigation.css

## .breadcrumb-item a
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _navigation.css

## .breadcrumb-item a:hover
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _navigation.css

## /* לוגו */
.logo-section
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _navigation.css

## .logo-icon
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _navigation.css

## .logo-text
מופיע ב-6 קבצים:
- unified-menus-pushed.css
- unified.css
- header-styles.css
- unified-yesterday.css
- _navigation.css
- _final-menu-structure.css

## /* תפריט המבורגר למובייל */
.navbar-toggle
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _navigation.css

## .navbar-nav.show
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _navigation.css

## .navbar-toggle
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _navigation.css

## .dropdown-menu
מופיע ב-3 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css
- _navigation.css

## /* ===== 06-components/_forms-advanced.css ===== */
/**
 * טפסים מתקדמים - Advanced Forms
 * 
 * קובץ זה מכיל את הסגנונות המתקדמים של טפסים
 * כולל צ'קבוקסים, רדיו באטונים וטפסים מיוחדים
 * מבוסס על הסגנונות הקיימים ב-styles.css ו-RTL guide
 * 
 * @version 1.0.0
 * @lastUpdated January 5, 2025
 */

/* ===== צ'קבוקסים עם RTL ===== */
/* הגדרות גלובליות עם Override מוחלט של Bootstrap */
.form-check,
div.form-check,
.modal .form-check,
body .form-check,
html .form-check,
#addTradeModal .form-check,
.table .form-check,
.filter-section .form-check,
.form-check.form-check-inline
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .form-check-input,
input.form-check-input,
.modal .form-check-input,
body .form-check-input,
html .form-check-input,
#addTradeModal .form-check-input,
.table .form-check-input,
.filter-section .form-check-input,
.form-check-input[type="checkbox"]
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _forms-advanced.css

## .form-check-label,
label.form-check-label,
.modal .form-check-label,
body .form-check-label,
html .form-check-label,
#addTradeModal .form-check-label,
.table .form-check-label,
.filter-section .form-check-label
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _forms-advanced.css

## /* ===== רדיו באטונים ===== */
.radio-group-item
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _forms-advanced.css

## .radio-group-item input[type="radio"]
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _forms-advanced.css

## .radio-group-item label
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _forms-advanced.css

## /* ===== שדות קלט מיוחדים ===== */
/* מספרים - יישור לשמאל */
input[type="number"]
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _forms-advanced.css

## /* כתובות URL - יישור לשמאל */
input[type="url"],
input[type="email"]
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _forms-advanced.css

## /* רשימות נפתחות */
select
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _forms-advanced.css

## select option
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _forms-advanced.css

## /* ===== קבוצות טפסים ===== */
.form-group label
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _forms-advanced.css

## /* ===== הגדרות מיוחדות ===== */
.setting-label input[type="checkbox"]
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _forms-advanced.css

## /* ===== קבוצות צ'קבוקסים ===== */
.checkbox-group
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _forms-advanced.css

## .checkbox-group label
מופיע ב-5 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _bootstrap-overrides.css
- _forms-advanced.css

## .checkbox-group input[type="checkbox"]
מופיע ב-5 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _bootstrap-overrides.css
- _forms-advanced.css

## /* ===== ולידציה ===== */
.form-control.is-invalid,
.form-select.is-invalid
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _forms-advanced.css

## .invalid-feedback
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _forms-advanced.css

## /* ===== טפסים במודלים ===== */
.modal .form-group
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _forms-advanced.css

## .modal .form-group label
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _forms-advanced.css

## .modal .form-group input,
.modal .form-group select,
.modal .form-group textarea
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _forms-advanced.css

## .modal .form-group input:focus,
.modal .form-group select:focus,
.modal .form-group textarea:focus
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _forms-advanced.css

## /* ===== טפסי חיפוש ===== */
.search-form
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _forms-advanced.css

## .search-input
מופיע ב-8 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified.css
- unified.css
- unified-yesterday.css
- unified-yesterday.css
- _forms-advanced.css
- _forms-advanced.css

## .search-btn
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _forms-advanced.css

## .search-btn:hover
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _forms-advanced.css

## .checkbox-group
מופיע ב-5 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _bootstrap-overrides.css
- _forms-advanced.css

## .search-form
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _forms-advanced.css

## /* ===== 06-components/_badges-status.css ===== */
/**
 * תגיות סטטוס - Status Badges
 * 
 * קובץ זה מכיל את הסגנונות של כל התגיות והבאדג'ים במערכת
 * מבוסס על הסגנונות הקיימים ב-table.css ו-numeric-value-colors.css
 * 
 * @version 1.0.0
 * @lastUpdated January 5, 2025
 */

/* ===== תגיות סטטוס בסיסיות ===== */
.status-badge
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .status-badge::before
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _badges-status.css

## .status-badge:hover::before
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _badges-status.css

## /* סטטוסים בסיסיים - מוגדרים ב-unified.css */

/* ===== תגיות חשיבות ===== */
.priority-badge
מופיע ב-3 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css
- _badges-status.css

## .priority-badge::before
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _badges-status.css

## .priority-badge:hover::before
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _badges-status.css

## .priority-badge.priority-high
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _badges-status.css

## .priority-badge.priority-medium
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _badges-status.css

## .priority-badge.priority-low
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _badges-status.css

## /* ===== ערכים מספריים ===== */
.numeric-text-positive
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _badges-status.css

## .numeric-text-negative
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _badges-status.css

## .numeric-text-zero
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _badges-status.css

## .profit-positive
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _badges-status.css

## .profit-negative
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _badges-status.css

## /* ===== שדות צד (Long/Short) ===== */
.side-long
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _badges-status.css

## .side-long:hover
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _badges-status.css

## .side-short
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _badges-status.css

## .side-short:hover
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _badges-status.css

## /* ===== שדות סוג (Type) ===== */
.type-swing
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _badges-status.css

## .type-investment
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _badges-status.css

## .type-stock
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _badges-status.css

## .type-etf
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _badges-status.css

## .type-crypto
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _badges-status.css

## /* ===== תגיות התראות ===== */
.triggered-badge
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _badges-status.css

## .triggered-badge.triggered-yes
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _badges-status.css

## .triggered-badge.triggered-no
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _badges-status.css

## .triggered-badge.triggered-new
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _badges-status.css

## .triggered-badge.triggered-unknown
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _badges-status.css

## /* ===== אייקון טריידים פעילים ===== */
.active-trades-icon
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _badges-status.css

## /* ===== אובייקטים מקושרים ===== */
.related-object-cell
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _badges-status.css

## .related-account
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _badges-status.css

## .related-trade
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _badges-status.css

## .related-plan
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _badges-status.css

## .related-ticker
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _badges-status.css

## .related-other
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _badges-status.css

## /* Hover effects */
.related-account:hover
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _badges-status.css

## .related-trade:hover
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _badges-status.css

## .related-plan:hover
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _badges-status.css

## .related-ticker:hover
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _badges-status.css

## .related-other:hover
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _badges-status.css

## /* ===== סטטוס דוט ===== */
.status-dot
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _badges-status.css

## .status-dot.online
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _badges-status.css

## .status-dot.offline
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _badges-status.css

## .status-dot.pending
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _badges-status.css

## /* ===== 06-components/_header-system.css ===== */
/**
 * Header System - מערכת ראש הדף
 * 
 * קובץ זה מכיל את כל הסגנונות למערכת התפריט הראשי
 * מבוסס על header-system.css הישן עם התאמה למערכת החדשה
 * 
 * @version 1.0.0
 * @lastUpdated January 5, 2025
 */

/* ===== סגנונות אלמנט ראש הדף החדש ===== */
/* סגנונות אלה מיועדים רק לאלמנט unified-header */

#unified-header
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## #unified-header .header-container
מופיע ב-13 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-menus-pushed.css
- header-styles.css
- header-styles.css
- unified-yesterday.css
- unified-yesterday.css
- _header-system-yesterday.css
- _header-system-yesterday.css
- _header-system.css
- _header-system.css
- _header-system-clean.css
- _header-system-clean.css

## #unified-header .header-wrapper
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-yesterday.css
- _header-system-yesterday.css

## #unified-header .header-top
מופיע ב-10 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-menus-pushed.css
- header-styles.css
- unified-yesterday.css
- unified-yesterday.css
- _header-system-yesterday.css
- _header-system-yesterday.css
- _header-system.css
- _header-system-clean.css

## #unified-header .header-top .logo-section
מופיע ב-10 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-menus-pushed.css
- header-styles.css
- unified-yesterday.css
- unified-yesterday.css
- _header-system-yesterday.css
- _header-system-yesterday.css
- _header-system.css
- _header-system-clean.css

## #unified-header .header-top .header-nav
מופיע ב-10 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-menus-pushed.css
- header-styles.css
- unified-yesterday.css
- unified-yesterday.css
- _header-system-yesterday.css
- _header-system-yesterday.css
- _header-system.css
- _header-system-clean.css

## #unified-header .header-top .filter-toggle-section
מופיע ב-7 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-yesterday.css
- unified-yesterday.css
- _header-system-yesterday.css
- _header-system-yesterday.css

## #unified-header .page-title
מופיע ב-7 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-yesterday.css
- unified-yesterday.css
- _header-system-yesterday.css
- _header-system-yesterday.css

## #unified-header .page-title h1
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-yesterday.css
- _header-system-yesterday.css

## /* סגנונות לוגו */
#unified-header .logo-section
מופיע ב-3 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css
- _header-system-yesterday.css

## #unified-header .logo-text
מופיע ב-17 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-menus-pushed.css
- header-styles.css
- header-styles.css
- unified-yesterday.css
- unified-yesterday.css
- _header-system-yesterday.css
- _header-system-yesterday.css
- _header-system.css
- _header-system.css
- _header-system-clean.css
- _header-system-clean.css

## #unified-header .logo-icon
מופיע ב-5 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-yesterday.css
- _header-system-yesterday.css

## #unified-header .home-icon
מופיע ב-5 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-yesterday.css
- _header-system-yesterday.css

## #unified-header .logo
מופיע ב-8 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-menus-pushed.css
- header-styles.css
- unified-yesterday.css
- _header-system-yesterday.css
- _header-system.css
- _header-system-clean.css

## #unified-header .logo:hover
מופיע ב-7 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- header-styles.css
- unified-yesterday.css
- _header-system-yesterday.css
- _header-system.css
- _header-system-clean.css

## #unified-header .logo-image
מופיע ב-8 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-menus-pushed.css
- header-styles.css
- unified-yesterday.css
- _header-system-yesterday.css
- _header-system.css
- _header-system-clean.css

## /* סגנונות ניווט */
#unified-header .header-nav
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-yesterday.css
- _header-system-yesterday.css

## /* סגנונות אנימציה לפריטי ניווט */
#unified-header .nav-item
מופיע ב-3 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css
- _header-system-yesterday.css

## #unified-header .nav-item::before
מופיע ב-5 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-yesterday.css
- _header-system-yesterday.css

## #unified-header .nav-item:hover::before
מופיע ב-5 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-yesterday.css
- _header-system-yesterday.css

## #unified-header .nav-item.active::before
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-yesterday.css
- _header-system-yesterday.css

## #unified-header .main-nav
מופיע ב-7 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- header-styles.css
- unified-yesterday.css
- _header-system-yesterday.css
- _header-system.css
- _header-system-clean.css

## #unified-header .tiktrack-nav-list
מופיע ב-12 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-yesterday.css
- unified-yesterday.css
- unified-yesterday.css
- _header-system-yesterday.css
- _header-system-yesterday.css
- _header-system-yesterday.css
- _header-system.css
- _header-system-clean.css

## #unified-header .tiktrack-nav-item
מופיע ב-6 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-yesterday.css
- _header-system-yesterday.css
- _header-system.css
- _header-system-clean.css

## #unified-header .tiktrack-nav-link
מופיע ב-9 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-yesterday.css
- unified-yesterday.css
- _header-system-yesterday.css
- _header-system-yesterday.css
- _header-system.css
- _header-system-clean.css

## #unified-header .tiktrack-nav-link:hover
מופיע ב-6 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-yesterday.css
- _header-system-yesterday.css
- _header-system.css
- _header-system-clean.css

## #unified-header .tiktrack-nav-item.active .tiktrack-nav-link:hover
מופיע ב-6 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-yesterday.css
- _header-system-yesterday.css
- _header-system.css
- _header-system-clean.css

## #unified-header .tiktrack-nav-item.active .tiktrack-nav-link[href="/"]:hover
מופיע ב-3 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css
- _header-system-yesterday.css

## #unified-header .tiktrack-nav-item.active .tiktrack-nav-link[href="/index.html"]:hover
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-yesterday.css
- _header-system-yesterday.css

## #unified-header .tiktrack-nav-item.active .tiktrack-nav-link
מופיע ב-6 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-yesterday.css
- _header-system-yesterday.css
- _header-system.css
- _header-system-clean.css

## #unified-header .tiktrack-nav-item.active .tiktrack-nav-link[href="/"]
מופיע ב-3 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css
- _header-system-yesterday.css

## #unified-header .tiktrack-nav-item.active .tiktrack-nav-link[href="/index.html"]
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-yesterday.css
- _header-system-yesterday.css

## #unified-header .nav-icon
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-yesterday.css
- _header-system-yesterday.css

## #unified-header .nav-text
מופיע ב-6 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-yesterday.css
- _header-system-yesterday.css
- _header-system.css
- _header-system-clean.css

## #unified-header .tiktrack-nav-item.active .tiktrack-nav-link .nav-text
מופיע ב-6 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-yesterday.css
- _header-system-yesterday.css
- _header-system.css
- _header-system-clean.css

## #unified-header .tiktrack-nav-item.active .tiktrack-nav-link[href="/"] .nav-text
מופיע ב-3 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css
- _header-system-yesterday.css

## #unified-header .tiktrack-nav-item.active .tiktrack-nav-link[href="/index.html"] .nav-text
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-yesterday.css
- _header-system-yesterday.css

## #unified-header .tiktrack-nav-link:focus
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-yesterday.css
- _header-system-yesterday.css

## #unified-header .tiktrack-nav-link:active
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-yesterday.css
- _header-system-yesterday.css

## #unified-header .tiktrack-dropdown-arrow
מופיע ב-6 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-yesterday.css
- _header-system-yesterday.css
- _header-system.css
- _header-system-clean.css

## #unified-header .tiktrack-nav-item.active .tiktrack-nav-link .tiktrack-dropdown-arrow
מופיע ב-6 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-yesterday.css
- _header-system-yesterday.css
- _header-system.css
- _header-system-clean.css

## /* תפריט נפתח */
#unified-header .dropdown-menu
מופיע ב-3 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css
- _header-system-yesterday.css

## #unified-header .dropdown-menu.show
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-yesterday.css
- _header-system-yesterday.css

## #unified-header .dropdown-menu:not(.show)
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-yesterday.css
- _header-system-yesterday.css

## #unified-header .dropdown-item
מופיע ב-3 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css
- _header-system-yesterday.css

## #unified-header .dropdown-item:hover
מופיע ב-3 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css
- _header-system-yesterday.css

## #unified-header .dropdown-item:first-child
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-yesterday.css
- _header-system-yesterday.css

## #unified-header .dropdown-item:last-child
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-yesterday.css
- _header-system-yesterday.css

## #unified-header .dropdown-arrow
מופיע ב-5 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-yesterday.css
- _header-system-yesterday.css

## #unified-header .dropdown-toggle
מופיע ב-3 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css
- _header-system-yesterday.css

## #unified-header .dropdown-toggle:hover
מופיע ב-3 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css
- _header-system-yesterday.css

## #unified-header .dropdown-toggle[aria-expanded="true"] .dropdown-arrow
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-yesterday.css
- _header-system-yesterday.css

## /* תת-תפריטים */
#unified-header .dropdown-submenu
מופיע ב-3 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css
- _header-system-yesterday.css

## #unified-header .dropdown-submenu .tiktrack-submenu-toggle
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-yesterday.css
- _header-system-yesterday.css

## #unified-header .submenu-arrow
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-yesterday.css
- _header-system-yesterday.css

## #unified-header .dropdown-submenu:hover .submenu-arrow
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-yesterday.css
- _header-system-yesterday.css

## #unified-header .dropdown-submenu:hover .tiktrack-submenu,
#unified-header .tiktrack-submenu.show
מופיע ב-3 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css
- _header-system-yesterday.css

## #unified-header .tiktrack-submenu .tiktrack-dropdown-item
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-yesterday.css
- _header-system-yesterday.css

## #unified-header .tiktrack-submenu .tiktrack-dropdown-item:hover
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-yesterday.css
- _header-system-yesterday.css

## #unified-header .dropdown-submenu:hover .tiktrack-submenu
מופיע ב-5 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-yesterday.css
- _header-system-yesterday.css

## #unified-header .dropdown-submenu:hover .submenu
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- _header-system.css
- _header-system-clean.css

## #unified-header .submenu
מופיע ב-3 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- _header-system.css

## #unified-header .submenu .tiktrack-dropdown-item
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- _header-system.css
- _header-system-clean.css

## #unified-header .submenu .tiktrack-dropdown-item:last-child
מופיע ב-3 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- _header-system.css

## #unified-header .submenu .tiktrack-dropdown-item:hover
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- _header-system.css
- _header-system-clean.css

## /* סגנונות פילטרים */
#unified-header .filter-toggle-section
מופיע ב-3 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css
- _header-system-yesterday.css

## #unified-header .filter-toggle-btn
מופיע ב-3 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css
- _header-system-yesterday.css

## #unified-header .filter-toggle-btn:hover
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-yesterday.css
- _header-system-yesterday.css

## #unified-header .filter-toggle-btn.active
מופיע ב-3 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css
- _header-system-yesterday.css

## /* סגנונות התראות */
#unified-header .notification-icon
מופיע ב-3 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css
- _header-system-yesterday.css

## #unified-header .notification-icon:hover
מופיע ב-3 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css
- _header-system-yesterday.css

## #unified-header .notification-badge
מופיע ב-3 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css
- _header-system-yesterday.css

## /* אזור פילטרים */
#unified-header .header-filters
מופיע ב-3 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css
- _header-system-yesterday.css

## #unified-header .filters-container
מופיע ב-5 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-yesterday.css
- _header-system-yesterday.css

## #unified-header .filter-group
מופיע ב-5 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-yesterday.css
- _header-system-yesterday.css

## #unified-header .filter-dropdown
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-yesterday.css
- _header-system-yesterday.css

## #unified-header .filter-toggle
מופיע ב-5 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-yesterday.css
- _header-system-yesterday.css

## #unified-header .filter-toggle:hover
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-yesterday.css
- _header-system-yesterday.css

## #unified-header .filter-toggle.active
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-yesterday.css
- _header-system-yesterday.css

## #unified-header .filter-label
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-yesterday.css
- _header-system-yesterday.css

## #unified-header .selected-value
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-yesterday.css
- _header-system-yesterday.css

## /* סגנונות בסיס לפילטרים */
#unified-header .filter-menu
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-yesterday.css
- _header-system-yesterday.css

## /* סגנונות לפילטרים פתוחים */
#unified-header .filter-menu.show
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-yesterday.css
- _header-system-yesterday.css

## #unified-header .filter-menu:not(.show)
מופיע ב-3 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css
- _header-system-yesterday.css

## /* ===== 06-components/_entity-colors.css ===== */
/**
 * Entity Colors - צבעי ישויות
 * 
 * קובץ זה מכיל סגנונות לשימוש בצבעי ישויות דינמיים
 * מבוסס על מערכת הצבעים הדינמית
 * 
 * @version 1.0.0
 * @lastUpdated January 5, 2025
 */

/* ===== סגנונות ישויות ===== */

/* טרייד - Trade */
.entity-trade
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .entity-trade-bg
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _entity-colors.css

## .entity-trade-text
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _entity-colors.css

## .entity-trade-border
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _entity-colors.css

## /* תוכנית מסחר - Trade Plan */
.entity-trade-plan
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _entity-colors.css

## .entity-trade-plan-bg
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _entity-colors.css

## .entity-trade-plan-text
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _entity-colors.css

## .entity-trade-plan-border
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _entity-colors.css

## /* ביצוע - Execution */
.entity-execution
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _entity-colors.css

## .entity-execution-bg
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _entity-colors.css

## .entity-execution-text
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _entity-colors.css

## .entity-execution-border
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _entity-colors.css

## /* חשבון - Account */
.entity-account
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _entity-colors.css

## .entity-account-bg
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _entity-colors.css

## .entity-account-text
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _entity-colors.css

## .entity-account-border
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _entity-colors.css

## /* תזרים מזומנים - Cash Flow */
.entity-cash-flow
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _entity-colors.css

## .entity-cash-flow-bg
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _entity-colors.css

## .entity-cash-flow-text
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _entity-colors.css

## .entity-cash-flow-border
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _entity-colors.css

## /* טיקר - Ticker */
.entity-ticker
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _entity-colors.css

## .entity-ticker-bg
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _entity-colors.css

## .entity-ticker-text
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _entity-colors.css

## .entity-ticker-border
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _entity-colors.css

## /* התראה - Alert */
.entity-alert
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _entity-colors.css

## .entity-alert-bg
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _entity-colors.css

## .entity-alert-text
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _entity-colors.css

## .entity-alert-border
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _entity-colors.css

## /* הערה - Note */
.entity-note
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _entity-colors.css

## .entity-note-bg
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _entity-colors.css

## .entity-note-text
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _entity-colors.css

## .entity-note-border
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _entity-colors.css

## /* ===== סגנונות סטטוס ===== */

/* סטטוס פתוח - Open */
.status-open
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _entity-colors.css

## .status-open-bg
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _entity-colors.css

## .status-open-text
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _entity-colors.css

## /* סטטוס סגור - Closed */
.status-closed
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _entity-colors.css

## .status-closed-bg
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _entity-colors.css

## .status-closed-text
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _entity-colors.css

## /* סטטוס מבוטל - Cancelled */
.status-cancelled
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _entity-colors.css

## .status-cancelled-bg
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _entity-colors.css

## .status-cancelled-text
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _entity-colors.css

## /* סטטוס ממתין - Pending */
.status-pending
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _entity-colors.css

## .status-pending-bg
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _entity-colors.css

## .status-pending-text
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _entity-colors.css

## /* סטטוס פעיל - Active */
.status-active
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _entity-colors.css

## .status-active-bg
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _entity-colors.css

## .status-active-text
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _entity-colors.css

## /* סטטוס לא פעיל - Inactive */
.status-inactive
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _entity-colors.css

## .status-inactive-bg
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _entity-colors.css

## .status-inactive-text
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _entity-colors.css

## /* ===== סגנונות סוגי השקעה ===== */

/* סווינג - Swing */
.type-swing
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _entity-colors.css

## .type-swing-bg
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _entity-colors.css

## .type-swing-text
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _entity-colors.css

## /* השקעה - Investment */
.type-investment
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _entity-colors.css

## .type-investment-bg
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _entity-colors.css

## .type-investment-text
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _entity-colors.css

## /* פסיבי - Passive */
.type-passive
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _entity-colors.css

## .type-passive-bg
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _entity-colors.css

## .type-passive-text
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _entity-colors.css

## /* מסחר יומי - Day Trading */
.type-day-trading
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _entity-colors.css

## .type-day-trading-bg
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _entity-colors.css

## .type-day-trading-text
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _entity-colors.css

## /* סקלפינג - Scalping */
.type-scalping
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _entity-colors.css

## .type-scalping-bg
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _entity-colors.css

## .type-scalping-text
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _entity-colors.css

## /* ===== 06-components/_missing-styles.css ===== */
/**
 * Missing Styles - סגנונות חסרים מהמערכת הישנה
 * 
 * קובץ זה מכיל את כל הסגנונות שהיו במערכת הישנה
 * אבל לא הועברו במיגרציה הראשונית
 * 
 * @version 1.0.0  
 * @lastUpdated January 8, 2025
 */

/* ===== קישורי ישויות ===== */
.entity-link
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .entity-link:hover
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .entity-link .link-icon
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .entity-link:hover .link-icon
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .link-icon
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .link-icon:hover
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* ===== סגנונות Cache Test ===== */
.cache-test .page-header
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .cache-test .page-header h1
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .cache-test .page-header .subtitle
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .cache-test .header-badges
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .cache-test .badge
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .cache-dashboard
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .cache-test .dashboard-grid
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .cache-test .status-card
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .cache-test .status-card:hover
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* ===== כרטיסי התראות ===== */
.alert-card
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .alert-card-header
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .alert-card-title
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .alert-card-time
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .alert-card-content
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .alert-card-message
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .alert-card-details
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .alert-card-footer
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* ===== כפתורים חסרים ===== */
.btn-edit
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .btn-edit:hover
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .btn-delete
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .btn-delete:hover
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .btn-add
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .btn-add:hover
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* ===== פריטים מקושרים ===== */
.linked-items-container
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .linked-items-header
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .linked-items-list
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .linked-item-card
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .linked-item-card:hover
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .linked-item-header
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .linked-item-title
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .linked-item-type
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* ===== דפים ספציפיים ===== */
.accounts-page,
.alerts-page,
.trades-page,
.executions-page,
.notes-page,
.research-page
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* ===== אלמנטים כלליים ===== */
.page-header
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .empty-state
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .empty-state .no-data-icon
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .stats-container
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .stats-card
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .stats-card:hover
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .stat-value
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .stat-label
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* ===== סגנונות טבלה נוספים ===== */
.table-icon
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .action-icon
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .action-icon:hover
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .text-success
מופיע ב-3 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css

## .text-danger
מופיע ב-3 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css

## .text-warning
מופיע ב-3 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css

## /* ===== הודעות ומצבים ===== */
.positive-change
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .negative-change
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .status-item
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .status-item:last-child
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* ===== סגנונות קריטיים נוספים מהמערכת הישנה ===== */

/* עמוד חשבונות */
.accounts-page .section-header,
.accounts-page .top-section .section-header
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* כפתורים משניים */
.btn-secondary
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .btn-secondary:hover
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _buttons-advanced.css

## /* כרטיסיות התראות */
.alerts-cards-container
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .alerts-cards
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-yesterday.css
- unified-yesterday.css

## /* Account Link Styles */
.account-link
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .account-link:hover
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* Bootstrap modals */
.bootstrap-modal
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .bootstrap-modal .modal-dialog
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .bootstrap-modal .modal-content
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* כפתורים במודלים */
.modal-footer .btn-secondary,
.modal-footer .btn-success
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .modal-footer .btn-secondary
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .modal-footer .btn-secondary:hover
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _buttons-advanced.css

## /* כפתורי פעולות בטבלאות */
.actions-cell .btn-sm.btn-secondary
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _buttons-advanced.css

## .actions-cell .btn-sm.btn-secondary:hover
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _buttons-advanced.css

## /* ===== 06-components/_complete-missing-styles.css ===== */
/**
 * Complete Missing Styles - כל הסגנונות החסרים
 * 
 * קובץ זה מכיל את כל הסגנונות שנמצאו במערכת הישנה
 * אבל חסרים במערכת החדשה
 * 
 * @version 1.0.0  
 * @lastUpdated January 8, 2025
 * @extractedFrom styles.css (old system)
 */

/* === #accountsTable === */
#accountsTable
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## #accountsTable th:nth-child(1), /* שם */
#accountsTable td:nth-child(1)
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## #accountsTable th:nth-child(2), /* מטבע */
#accountsTable td:nth-child(2)
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## #accountsTable th:nth-child(3), /* סטטוס */
#accountsTable td:nth-child(3)
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## #accountsTable th:nth-child(4), /* יתרה במזומן */
#accountsTable td:nth-child(4)
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## #accountsTable th:nth-child(5), /* ערך כולל */
#accountsTable td:nth-child(5)
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## #accountsTable th:nth-child(6), /* רווח/הפסד */
#accountsTable td:nth-child(6)
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## #accountsTable th:nth-child(7), /* הערות */
#accountsTable td:nth-child(7)
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## #accountsTable th:nth-child(8), /* פעולות */
#accountsTable td:nth-child(8)
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## #accountsTable .actions-cell
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## #accountsTable .actions-cell .btn
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## #accountsTable td
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## #accountsTable td:nth-child(7)
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## #accountsTable td:nth-child(1)
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .action-separator === */
.action-separator
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === #addAccountModal === */
#addAccountModal,
#editAccountModal,
#addExecutionModal,
#editExecutionModal,
#deleteExecutionModal,
#linkedItemsModal,
#warningModal
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## #addAccountModal .modal-dialog,
#editAccountModal .modal-dialog,
#addExecutionModal .modal-dialog,
#editExecutionModal .modal-dialog,
#deleteExecutionModal .modal-dialog,
#linkedItemsModal .modal-dialog,
#warningModal .modal-dialog
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## #addAccountModal .modal-content,
#editAccountModal .modal-content,
#addExecutionModal .modal-content,
#editExecutionModal .modal-content,
#deleteExecutionModal .modal-content,
#linkedItemsModal .modal-content,
#warningModal .modal-content
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === #addNoteModal === */
#addNoteModal,
#editNoteModal,
#addTickerModal,
#editTickerModal,
#addAccountModal,
#editAccountModal,
#addExecutionModal,
#editExecutionModal,
#deleteExecutionModal,
#linkedItemsModal,
#warningModal
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## #addNoteModal .modal-dialog,
#editNoteModal .modal-dialog,
#addTickerModal .modal-dialog,
#editTickerModal .modal-dialog,
#addAccountModal .modal-dialog,
#editAccountModal .modal-dialog,
#addExecutionModal .modal-dialog,
#editExecutionModal .modal-dialog,
#deleteExecutionModal .modal-dialog,
#linkedItemsModal .modal-dialog,
#warningModal .modal-dialog
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## #addNoteModal .modal-content,
#editNoteModal .modal-content,
#addTickerModal .modal-content,
#editTickerModal .modal-content,
#addAccountModal .modal-content,
#editAccountModal .modal-content,
#addExecutionModal .modal-content,
#editExecutionModal .modal-content,
#deleteExecutionModal .modal-content,
#linkedItemsModal .modal-content,
#warningModal .modal-content
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === #addTickerModal === */
#addTickerModal,
#editTickerModal,
#addAccountModal,
#editAccountModal,
#addExecutionModal,
#editExecutionModal,
#deleteExecutionModal,
#linkedItemsModal,
#warningModal
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## #addTickerModal .modal-dialog,
#editTickerModal .modal-dialog,
#addAccountModal .modal-dialog,
#editAccountModal .modal-dialog,
#addExecutionModal .modal-dialog,
#editExecutionModal .modal-dialog,
#deleteExecutionModal .modal-dialog,
#linkedItemsModal .modal-dialog,
#warningModal .modal-dialog
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## #addTickerModal .modal-content,
#editTickerModal .modal-content,
#addAccountModal .modal-content,
#editAccountModal .modal-content,
#addExecutionModal .modal-content,
#editExecutionModal .modal-content,
#deleteExecutionModal .modal-content,
#linkedItemsModal .modal-content,
#warningModal .modal-content
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === #addTradePlanModal === */
#addTradePlanModal,
#editTradePlanModal,
#addAlertModal,
#editAlertModal,
#addNoteModal,
#editNoteModal,
#addTickerModal,
#editTickerModal,
#addAccountModal,
#editAccountModal,
#addExecutionModal,
#editExecutionModal,
#deleteExecutionModal,
#linkedItemsModal,
#warningModal
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## #addTradePlanModal .modal-dialog,
#editTradePlanModal .modal-dialog,
#addAlertModal .modal-dialog,
#editAlertModal .modal-dialog,
#addNoteModal .modal-dialog,
#editNoteModal .modal-dialog,
#addTickerModal .modal-dialog,
#editTickerModal .modal-dialog,
#addAccountModal .modal-dialog,
#editAccountModal .modal-dialog,
#addExecutionModal .modal-dialog,
#editExecutionModal .modal-dialog,
#deleteExecutionModal .modal-dialog,
#linkedItemsModal .modal-dialog,
#warningModal .modal-dialog
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## #addTradePlanModal .modal-content,
#editTradePlanModal .modal-content,
#addAlertModal .modal-content,
#editAlertModal .modal-content,
#addNoteModal .modal-content,
#editNoteModal .modal-content,
#addTickerModal .modal-content,
#editTickerModal .modal-content,
#addAccountModal .modal-content,
#editAccountModal .modal-content,
#addExecutionModal .modal-content,
#editExecutionModal .modal-content,
#deleteExecutionModal .modal-content,
#linkedItemsModal .modal-content,
#warningModal .modal-content
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .alert-bell-icon === */
.alert-bell-icon
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .alert-bell-icon:hover
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-yesterday.css
- unified-yesterday.css

## .alert-bell-icon
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .alert-card-related-object === */
.alert-card-related-object
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .alert-card-time-center === */
.alert-card-time-center
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .alert-count-badge === */
.alert-count-badge
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .alert-count-badge
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .alert-detail-item === */
.alert-detail-item
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .alert-detail-item.positive
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .alert-detail-item.negative
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .alert-detail-item.message-icon
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .alert-detail-item.message-icon:hover
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .alert-detail-item.message-icon::after
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .alert-detail-item.message-icon::before
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .alert-detail-item.message-icon:hover::after,
.alert-detail-item.message-icon:hover::before
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .alerts-color-legend === */
.alerts-color-legend
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .alerts-color-legend-below
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .alerts-color-legend-below === */
.alerts-color-legend-below
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === #alertsContainer === */
#alertsContainer
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .alerts-header === */
.alerts-header h3
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .alerts-header h3 .section-alert-icon
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-yesterday.css
- unified-yesterday.css

## .alerts-header h3
מופיע ב-6 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-yesterday.css
- unified-yesterday.css
- unified-yesterday.css

## .alerts-header
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .alerts-header-actions
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .alerts-header-actions === */
.alerts-header-actions
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === #alertsTitle === */
#alertsTitle
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .alert-ticker-info === */
.alert-ticker-info
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .bell-emoji === */
.bell-emoji
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .bell-emoji
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .bottom-spacing === */
.bottom-spacing
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .btn-danger-outline === */
.btn-danger-outline
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .btn-icon === */
.btn-icon
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .btn-info === */
.btn-info, .btn-success, .btn-warning, .btn-danger, .btn-primary, .btn-secondary
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .btn-mark-read === */
.btn-mark-read-icon
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .btn-mark-read-icon:hover
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-yesterday.css
- unified-yesterday.css

## .btn-mark-read-icon:disabled
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-yesterday.css
- unified-yesterday.css

## .btn-mark-read
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .btn-mark-read:hover
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .btn-mark-read:disabled
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .btn-mark-read-icon === */
.btn-mark-read-icon
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .btn-success-outline === */
.btn-success-outline
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .cache-operations === */
.cache-operations
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .cache-operations h2
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .cache-testing === */
.cache-testing
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .cache-testing h2
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .card-actions === */
.card-actions
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .card-body === */
.card-body
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .card-header === */
.card-header
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .card-header h3
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .card-header h3 i
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .cash-flows-page === */
.cash-flows-page .section-header,
.cash-flows-page .top-section .section-header
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .condition-item === */
.condition-item
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .constraints-page === */
.constraints-page .section-header,
.constraints-page .top-section .section-header
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .content-section === */
.content-section
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .db-display-page === */
.db-display-page .section-header,
.db-display-page .top-section .section-header
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .dependencies-monitoring === */
.dependencies-monitoring
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .dependencies-monitoring h2
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .designs-page === */
.designs-page .section-header,
.designs-page .top-section .section-header
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .detail-item === */
.detail-item
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .detail-label === */
.detail-label
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .detail-value === */
.detail-value
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .detail-value.positive
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .detail-value.negative
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .detail-value.status-open
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .detail-value.status-closed
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .detail-value.status-cancelled
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .detail-value.status-completed
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .detail-value.status-active
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .detail-value.status-unknown
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .development-header === */
.development-header h6
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .development-header p
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .development-notice === */
.development-notice
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .disabled-field === */
.disabled-field
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .disabled-field:focus
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === #editAccountModal === */
#editAccountModal,
#addExecutionModal,
#editExecutionModal,
#deleteExecutionModal,
#linkedItemsModal,
#warningModal
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## #editAccountModal .modal-dialog,
#addExecutionModal .modal-dialog,
#editExecutionModal .modal-dialog,
#deleteExecutionModal .modal-dialog,
#linkedItemsModal .modal-dialog,
#warningModal .modal-dialog
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## #editAccountModal .modal-content,
#addExecutionModal .modal-content,
#editExecutionModal .modal-content,
#deleteExecutionModal .modal-content,
#linkedItemsModal .modal-content,
#warningModal .modal-content
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === #editNoteModal === */
#editNoteModal,
#addTickerModal,
#editTickerModal,
#addAccountModal,
#editAccountModal,
#addExecutionModal,
#editExecutionModal,
#deleteExecutionModal,
#linkedItemsModal,
#warningModal
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## #editNoteModal .modal-dialog,
#addTickerModal .modal-dialog,
#editTickerModal .modal-dialog,
#addAccountModal .modal-dialog,
#editAccountModal .modal-dialog,
#addExecutionModal .modal-dialog,
#editExecutionModal .modal-dialog,
#deleteExecutionModal .modal-dialog,
#linkedItemsModal .modal-dialog,
#warningModal .modal-dialog
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## #editNoteModal .modal-content,
#addTickerModal .modal-content,
#editTickerModal .modal-content,
#addAccountModal .modal-content,
#editAccountModal .modal-content,
#addExecutionModal .modal-content,
#editExecutionModal .modal-content,
#deleteExecutionModal .modal-content,
#linkedItemsModal .modal-content,
#warningModal .modal-content
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .editor-content === */
.editor-content
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .editor-content:empty:before
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .editor-content:focus
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .editor-content h1
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .editor-content h2
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .editor-content h3
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .editor-content ul,
.editor-content ol
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .editor-content li
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .editor-content a
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .editor-content a:hover
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .editor-toolbar === */
.editor-toolbar
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .editor-toolbar .btn
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .editor-toolbar .btn:hover
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .editor-toolbar .btn:active
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === #editTickerModal === */
#editTickerModal,
#addAccountModal,
#editAccountModal,
#addExecutionModal,
#editExecutionModal,
#deleteExecutionModal,
#linkedItemsModal,
#warningModal
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## #editTickerModal .modal-dialog,
#addAccountModal .modal-dialog,
#editAccountModal .modal-dialog,
#addExecutionModal .modal-dialog,
#editExecutionModal .modal-dialog,
#deleteExecutionModal .modal-dialog,
#linkedItemsModal .modal-dialog,
#warningModal .modal-dialog
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## #editTickerModal .modal-content,
#addAccountModal .modal-content,
#editAccountModal .modal-content,
#addExecutionModal .modal-content,
#editExecutionModal .modal-content,
#deleteExecutionModal .modal-content,
#linkedItemsModal .modal-content,
#warningModal .modal-content
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === #editTradeModal === */
#editTradeModal,
#addTradePlanModal,
#editTradePlanModal,
#addAlertModal,
#editAlertModal,
#addNoteModal,
#editNoteModal,
#addTickerModal,
#editTickerModal,
#addAccountModal,
#editAccountModal,
#addExecutionModal,
#editExecutionModal,
#deleteExecutionModal,
#linkedItemsModal,
#warningModal
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## #editTradeModal .modal-dialog,
#addTradePlanModal .modal-dialog,
#editTradePlanModal .modal-dialog,
#addAlertModal .modal-dialog,
#editAlertModal .modal-dialog,
#addNoteModal .modal-dialog,
#editNoteModal .modal-dialog,
#addTickerModal .modal-dialog,
#editTickerModal .modal-dialog,
#addAccountModal .modal-dialog,
#editAccountModal .modal-dialog,
#addExecutionModal .modal-dialog,
#editExecutionModal .modal-dialog,
#deleteExecutionModal .modal-dialog,
#linkedItemsModal .modal-dialog,
#warningModal .modal-dialog
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## #editTradeModal .modal-content,
#addTradePlanModal .modal-content,
#editTradePlanModal .modal-content,
#addAlertModal .modal-content,
#editAlertModal .modal-content,
#addNoteModal .modal-content,
#editNoteModal .modal-content,
#addTickerModal .modal-content,
#editTickerModal .modal-content,
#addAccountModal .modal-content,
#editAccountModal .modal-content,
#addExecutionModal .modal-content,
#editExecutionModal .modal-content,
#deleteExecutionModal .modal-content,
#linkedItemsModal .modal-content,
#warningModal .modal-content
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === #editTradePlanModal === */
#editTradePlanModal,
#addAlertModal,
#editAlertModal,
#addNoteModal,
#editNoteModal,
#addTickerModal,
#editTickerModal,
#addAccountModal,
#editAccountModal,
#addExecutionModal,
#editExecutionModal,
#deleteExecutionModal,
#linkedItemsModal,
#warningModal
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## #editTradePlanModal .modal-dialog,
#addAlertModal .modal-dialog,
#editAlertModal .modal-dialog,
#addNoteModal .modal-dialog,
#editNoteModal .modal-dialog,
#addTickerModal .modal-dialog,
#editTickerModal .modal-dialog,
#addAccountModal .modal-dialog,
#editAccountModal .modal-dialog,
#addExecutionModal .modal-dialog,
#editExecutionModal .modal-dialog,
#deleteExecutionModal .modal-dialog,
#linkedItemsModal .modal-dialog,
#warningModal .modal-dialog
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## #editTradePlanModal .modal-content,
#addAlertModal .modal-content,
#editAlertModal .modal-content,
#addNoteModal .modal-content,
#editNoteModal .modal-content,
#addTickerModal .modal-content,
#editTickerModal .modal-content,
#addAccountModal .modal-content,
#editAccountModal .modal-content,
#addExecutionModal .modal-content,
#editExecutionModal .modal-content,
#deleteExecutionModal .modal-content,
#linkedItemsModal .modal-content,
#warningModal .modal-content
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .extra-data-page === */
.extra-data-page .section-header,
.extra-data-page .top-section .section-header
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .filter-toggle-btn === */
.filter-toggle-btn
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .filter-toggle-btn:hover
מופיע ב-5 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _final-menu-structure.css
- _layout.css

## .filter-toggle-btn .filter-icon
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .filter-toggle-btn.active .filter-icon
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .form-actions === */
.form-actions .btn
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .form-control-disabled === */
.form-control-disabled
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .form-control-disabled:focus
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .form-control-disabled::placeholder
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .form-text === */
.form-text.text-muted
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .history-card === */
.history-card,
.stats-card
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .history-card:hover,
.stats-card:hover
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .history-container === */
.history-container
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .item-description === */
.item-description
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .item-details-grid === */
.item-details-grid
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .legend-color === */
.legend-color
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .legend-item === */
.legend-items
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .legend-item
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .legend-items === */
.legend-items
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .legend-title === */
.legend-title
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .linked-item-action === */
.linked-item-actions
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .linked-item-actions .btn
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-yesterday.css
- unified-yesterday.css

## .linked-item-actions .btn-outline-primary
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-yesterday.css
- unified-yesterday.css

## .linked-item-actions .btn-outline-primary:hover
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-yesterday.css
- unified-yesterday.css

## .linked-item-actions .btn-outline-secondary
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-yesterday.css
- unified-yesterday.css

## .linked-item-actions .btn-outline-secondary:hover
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-yesterday.css
- unified-yesterday.css

## .linked-item-actions .btn-outline-danger
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-yesterday.css
- unified-yesterday.css

## .linked-item-actions .btn-outline-danger:hover
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-yesterday.css
- unified-yesterday.css

## .linked-item-action
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .linked-item-action .btn
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .linked-item-actions === */
.linked-item-actions
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .linked-item-basic-details === */
.linked-item-basic-details
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .linked-item-col === */
.linked-item-col
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .linked-item-content === */
.linked-item-content
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .linked-item-details === */
.linked-item-details
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .linked-item-icon === */
.linked-item-icon
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .linked-item-id === */
.linked-item-id
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .linked-item-id
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .linked-item-row === */
.linked-item-row
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .linked-item-row:hover
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .linked-items-modal === */
.linked-items-modal
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .linked-items-section === */
.linked-items-section
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .linked-items-section h6
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .linked-object-clickable === */
.linked-object-clickable
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .linked-object-clickable:hover
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .linked-object-clickable:active
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .linked-object-details === */
.linked-object-details
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .linked-object-icon === */
.linked-object-icon
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .linked-object-id === */
.linked-object-id
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .linked-object-text === */
.linked-object-text
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .linked-object-type === */
.linked-object-type
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .logs-debugging === */
.logs-debugging
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .logs-debugging h2
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .no-data-icon === */
.no-data-icon
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .no-linked-items === */
.no-linked-items
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .no-linked-items
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .no-linked-object === */
.no-linked-object
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .notification-item === */
.notification-item
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .notification-item:hover
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .notification-item.success
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .notification-item.error
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .notification-item.warning
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .notification-item.info
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .notification-item.success .notification-icon
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .notification-item.error .notification-icon
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .notification-item.warning .notification-icon
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .notification-item.info .notification-icon
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .notification-popup === */
.notification-popup
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .notification-popup.success
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .notification-popup.error
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .notification-popup.warning
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .notification-popup.info
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .notifications-card === */
.notifications-card,
.history-card,
.stats-card
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .notifications-card:hover,
.history-card:hover,
.stats-card:hover
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .notifications-container === */
.notifications-container,
.history-container
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .notification-time === */
.notification-time
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .page-size-selector === */
.page-size-selector select
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .performance-monitoring === */
.performance-monitoring
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .performance-monitoring h2
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .planning-page === */
.planning-page .section-header,
.planning-page .top-section .section-header
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .popup-close === */
.popup-close
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .popup-close:hover
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .popup-header === */
.popup-header
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .popup-message === */
.popup-message
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .popup-title === */
.popup-title
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .reactivate-icon === */
.reactivate-icon
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .refresh-btn === */
.refresh-btn
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .refresh-btn::before
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .refresh-btn:hover::before
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .refresh-btn:hover
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _layout.css

## .refresh-btn .action-icon
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .refresh-btn[onclick*="showAdd"],
.refresh-btn[onclick*="openNoteDetails"],
.refresh-btn[onclick*="openDesignDetails"],
.refresh-btn[onclick*="showAddTradePlanModal"],
.refresh-btn[onclick*="showAddTradeModal"],
.refresh-btn[onclick*="showAddAccountModal"],
.refresh-btn[onclick*="showAddTickerModal"],
.refresh-btn[onclick*="showAddExecutionModal"],
.refresh-btn[onclick*="showAddCashFlowModal"],
.refresh-btn[onclick*="showAddAlertModal"],
.refresh-btn[onclick*="showAddNoteModal"],
.refresh-btn[onclick*="showAddUserRoleModal"],
.refresh-btn[onclick*="showAddUserModal"],
button[onclick*="showAdd"],
button[onclick*="openNoteDetails"],
button[onclick*="openDesignDetails"]
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .refresh-btn[onclick*="showAdd"]:hover,
.refresh-btn[onclick*="openNoteDetails"]:hover,
.refresh-btn[onclick*="openDesignDetails"]:hover,
.refresh-btn[onclick*="showAddTradePlanModal"]:hover,
.refresh-btn[onclick*="showAddTradeModal"]:hover,
.refresh-btn[onclick*="showAddAccountModal"]:hover,
.refresh-btn[onclick*="showAddTickerModal"]:hover,
.refresh-btn[onclick*="showAddExecutionModal"]:hover,
.refresh-btn[onclick*="showAddCashFlowModal"]:hover,
.refresh-btn[onclick*="showAddAlertModal"]:hover,
.refresh-btn[onclick*="showAddNoteModal"]:hover,
.refresh-btn[onclick*="showAddUserRoleModal"]:hover,
.refresh-btn[onclick*="showAddUserModal"]:hover,
button[onclick*="showAdd"]:hover,
button[onclick*="openNoteDetails"]:hover,
button[onclick*="openDesignDetails"]:hover
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .refresh-btn[onclick*="refresh"],
.refresh-btn[onclick*="resetAllFiltersAndReloadData"],
.refresh-btn[onclick*="loadTrades"],
.refresh-btn[onclick*="loadAccounts"],
.refresh-btn[onclick*="resetTestPreferences"]
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .refresh-btn[onclick*="refresh"]:hover,
.refresh-btn[onclick*="resetAllFiltersAndReloadData"]:hover,
.refresh-btn[onclick*="loadTrades"]:hover,
.refresh-btn[onclick*="loadAccounts"]:hover,
.refresh-btn[onclick*="resetTestPreferences"]:hover
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .related-object-info === */
.related-object-info
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .restore-button === */
.restore-button,
button[onclick*="restore"],
button[onclick*="reactivate"],
button[title*="החזר"],
button[title*="הפעל מחדש"]
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .restore-button,
button[onclick*="restore"]:not(.btn-sm),
button[onclick*="reactivate"]:not(.btn-sm),
button[title*="החזר"]:not(.btn-sm),
button[title*="הפעל מחדש"]:not(.btn-sm)
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .restore-button:hover,
button[onclick*="restore"]:hover,
button[onclick*="reactivate"]:hover,
button[title*="החזר"]:hover,
button[title*="הפעל מחדש"]:hover
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _buttons-advanced.css

## .restore-button:focus,
button[onclick*="restore"]:focus,
button[onclick*="reactivate"]:focus,
button[title*="החזר"]:focus,
button[title*="הפעל מחדש"]:focus
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .restore-button:active,
button[onclick*="restore"]:active,
button[onclick*="reactivate"]:active,
button[title*="החזר"]:active,
button[title*="הפעל מחדש"]:active
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .restore-button .reactivate-icon,
button[onclick*="restore"] .reactivate-icon,
button[onclick*="reactivate"] .reactivate-icon,
button[title*="החזר"] .reactivate-icon,
button[title*="הפעל מחדש"] .reactivate-icon
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .restore-button:hover .reactivate-icon,
button[onclick*="restore"]:hover .reactivate-icon,
button[onclick*="reactivate"]:hover .reactivate-icon,
button[title*="החזר"]:hover .reactivate-icon,
button[title*="הפעל מחדש"]:hover .reactivate-icon
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .rich-text-editor === */
.rich-text-editor
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .section-alert-icon === */
.section-alert-icon
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .section-alert-icon
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .section-alert-icon.has-alerts
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .section-body === */
.section-body
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .section-body .table
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified.css
- unified-yesterday.css
- _layout.css

## /* === .section-container === */
.section-container
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .section-count === */
.section-count
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .section-header === */
.section-header
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .section-header:not([class*="entity-"])
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .section-header .table-title,
.section-header .section-title,
.alerts-header h3
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-yesterday.css
- unified-yesterday.css

## .section-header .table-title .section-alert-icon,
.section-header .section-title .section-alert-icon,
.alerts-header h3 .section-alert-icon
מופיע ב-4 קבצים:
- unified-menus-pushed.css
- unified-menus-pushed.css
- unified-yesterday.css
- unified-yesterday.css

## /* === .section-title === */
.section-title
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .setting-item === */
.setting-item
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .setting-item:hover
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .settings-actions === */
.settings-actions
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .settings-card === */
.settings-card,
.notifications-card,
.history-card,
.stats-card
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .settings-card:hover,
.notifications-card:hover,
.history-card:hover,
.stats-card:hover
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .settings-grid === */
.settings-grid
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .side-badge === */
.side-badge
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .sidebar === */
.sidebar .btn
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .stat-icon === */
.stat-icon
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .stat-item === */
.stat-item
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .stat-item:hover
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .stat-item.success
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .stat-item.error
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .stat-item.warning
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .stat-item.info
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .stat-item.success .stat-icon
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .stat-item.error .stat-icon
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .stat-item.warning .stat-icon
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .stat-item.info .stat-icon
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .stats-item === */
.stats-item
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .status-grid === */
.status-grid
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .symbol-link === */
.symbol-link
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .symbol-link:hover
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .symbol-link:focus
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .ticker-cell === */
.ticker-cell
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .ticker-cell .symbol-text
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .title-bell-icon === */
.title-bell-icon
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .title-bell-icon .bell-emoji
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .title-count-badge === */
.title-count-badge
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .toolbar === */
.toolbar-separator
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .toolbar .btn
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## .toolbar .restore-button,
.toolbar button[onclick*="restore"],
.toolbar button[onclick*="reactivate"],
.toolbar button[title*="החזר"],
.toolbar button[title*="הפעל מחדש"]
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .toolbar-separator === */
.toolbar-separator
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === #topSection === */
#topSection
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## #topSection .page-header
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## #topSection .top-toggle-btn
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## #topSection .top-toggle-btn:hover
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## /* === .tracking-page === */
.tracking-page .section-header,
.tracking-page .top-section .section-header
מופיע ב-2 קבצים:
- unified-menus-pushed.css
- unified-yesterday.css

## #unified-header .tiktrack-dropdown-menu.show
מופיע ב-3 קבצים:
- unified-menus-pushed.css
- _header-system.css
- _header-system-clean.css

## #unified-header .tiktrack-dropdown-item
מופיע ב-3 קבצים:
- unified-menus-pushed.css
- _header-system.css
- _header-system-clean.css

## #unified-header .tiktrack-dropdown-item:hover
מופיע ב-3 קבצים:
- unified-menus-pushed.css
- _header-system.css
- _header-system-clean.css

## #unified-header .tiktrack-dropdown-item.active
מופיע ב-3 קבצים:
- unified-menus-pushed.css
- _header-system.css
- _header-system-clean.css

## #unified-header .tiktrack-dropdown-item.active:hover
מופיע ב-3 קבצים:
- unified-menus-pushed.css
- _header-system.css
- _header-system-clean.css

## #unified-header .dropdown-divider
מופיע ב-3 קבצים:
- unified-menus-pushed.css
- _header-system.css
- _header-system-clean.css

## /* ===== סגנונות כותרות ספציפיים מהמערכת הישנה ===== */

/* כותרת סקשן */
.section-title
מופיע ב-2 קבצים:
- unified.css
- _headings.css

## /* כותרת עם איקון */
.section-title img,
.table-title img
מופיע ב-2 קבצים:
- unified.css
- _headings.css

## /* כותרת עם ספירה */
.section-count
מופיע ב-2 קבצים:
- unified.css
- _headings.css

## /* ===== סגנונות קונטיינרים מהמערכת הישנה ===== */

/* כותרת סקשן */
.section-header
מופיע ב-2 קבצים:
- unified.css
- _layout.css

## /* רקע ברירת מחדל לכותרות ללא מחלקות דינמיות */
.section-header:not([class*="entity-"])
מופיע ב-2 קבצים:
- unified.css
- _layout.css

## /* כותרות עם שקיפות מוגברת */
.section-header.transparent
מופיע ב-2 קבצים:
- unified.css
- _layout.css

## /* כותרות עם רקע צבעוני */
.section-header.colored
מופיע ב-2 קבצים:
- unified.css
- _layout.css

## /* גוף סקשן */
.section-body
מופיע ב-2 קבצים:
- unified.css
- _layout.css

## /* אזור עליון */
.top-section
מופיע ב-2 קבצים:
- unified.css
- _layout.css

## .top-section .section-header
מופיע ב-2 קבצים:
- unified.css
- _layout.css

## .top-section .content-section
מופיע ב-2 קבצים:
- unified.css
- _layout.css

## /* אזור תוכן */
.content-section
מופיע ב-2 קבצים:
- unified.css
- _layout.css

## /* מיכל סקשן */
.section-container
מופיע ב-2 קבצים:
- unified.css
- _layout.css

## /* מצב סגור */
.content-section.collapsed
מופיע ב-2 קבצים:
- unified.css
- _layout.css

## .section-body.collapsed
מופיע ב-2 קבצים:
- unified.css
- _layout.css

## /* אזור פעולות הכותרת */
.table-actions
מופיע ב-2 קבצים:
- unified.css
- _layout.css

## /* כפתור רענון */
.refresh-btn
מופיע ב-2 קבצים:
- unified.css
- _layout.css

## /* כפתור פילטר */
.filter-toggle-btn
מופיע ב-2 קבצים:
- unified.css
- _layout.css

## /* איקון פעולה */
.action-icon
מופיע ב-2 קבצים:
- unified.css
- _layout.css

## /* איקון פילטר */
.filter-icon
מופיע ב-2 קבצים:
- unified.css
- _layout.css

## .filter-toggle-btn:hover .filter-icon
מופיע ב-2 קבצים:
- unified.css
- _layout.css

## /* כפתורים בסיסיים Bootstrap */
.btn-primary
מופיע ב-2 קבצים:
- unified.css
- _buttons-advanced.css

## .btn-primary:hover
מופיע ב-2 קבצים:
- unified.css
- _buttons-advanced.css

## .btn-warning
מופיע ב-2 קבצים:
- unified.css
- _buttons-advanced.css

## .btn-warning:hover
מופיע ב-2 קבצים:
- unified.css
- _buttons-advanced.css

## .btn-info
מופיע ב-2 קבצים:
- unified.css
- _buttons-advanced.css

## .btn-info:hover
מופיע ב-2 קבצים:
- unified.css
- _buttons-advanced.css

## /* כפתורי secondary */
.btn-secondary
מופיע ב-2 קבצים:
- unified.css
- _buttons-advanced.css

## /* כפתורים קטנים */
.btn-sm.btn-primary
מופיע ב-2 קבצים:
- unified.css
- _buttons-advanced.css

## .btn-sm.btn-primary:hover
מופיע ב-2 קבצים:
- unified.css
- _buttons-advanced.css

## .btn-sm.btn-warning
מופיע ב-2 קבצים:
- unified.css
- _buttons-advanced.css

## .btn-sm.btn-warning:hover
מופיע ב-2 קבצים:
- unified.css
- _buttons-advanced.css

## .btn-sm.btn-danger
מופיע ב-2 קבצים:
- unified.css
- _buttons-advanced.css

## .btn-sm.btn-danger:hover
מופיע ב-2 קבצים:
- unified.css
- _buttons-advanced.css

## .btn-sm.btn-secondary
מופיע ב-2 קבצים:
- unified.css
- _buttons-advanced.css

## .btn-sm.btn-secondary:hover
מופיע ב-2 קבצים:
- unified.css
- _buttons-advanced.css

## /* כפתורי הוספה מיוחדים */
.add-btn
מופיע ב-2 קבצים:
- unified.css
- _buttons-advanced.css

## .add-btn:hover
מופיע ב-2 קבצים:
- unified.css
- _buttons-advanced.css

## /* כפתורי restore/reactivate */
.restore-button,
button[onclick*="restore"],
button[onclick*="reactivate"],
button[title*="החזר"],
button[title*="הפעל מחדש"]
מופיע ב-2 קבצים:
- unified.css
- _buttons-advanced.css

## /* כפתורי outline נוספים */
.btn-success-outline
מופיע ב-2 קבצים:
- unified.css
- _buttons-advanced.css

## .btn-success-outline:hover
מופיע ב-2 קבצים:
- unified.css
- _buttons-advanced.css

## .btn-danger-outline
מופיע ב-2 קבצים:
- unified.css
- _buttons-advanced.css

## .btn-danger-outline:hover
מופיע ב-2 קבצים:
- unified.css
- _buttons-advanced.css

## /* כפתורי secondary במודלים */
.modal-footer .btn-secondary
מופיע ב-2 קבצים:
- unified.css
- _buttons-advanced.css

## .modal .btn-secondary,
.modal .btn-warning
מופיע ב-2 קבצים:
- unified.css
- _buttons-advanced.css

## .modal .btn-secondary:hover,
.modal .btn-warning:hover
מופיע ב-2 קבצים:
- unified.css
- _buttons-advanced.css

## /* כפתורי secondary מותאמים אישית */
.btn-secondary-custom,
button.btn-secondary-custom
מופיע ב-2 קבצים:
- unified.css
- _buttons-advanced.css

## .btn-secondary-custom:hover,
button.btn-secondary-custom:hover
מופיע ב-2 קבצים:
- unified.css
- _buttons-advanced.css

## /* כפתורים עם רוחב מינימלי */
.btn-info, .btn-success, .btn-warning, .btn-danger, .btn-primary, .btn-secondary
מופיע ב-2 קבצים:
- unified.css
- _buttons-advanced.css

## /* ===== סגנונות לוגו ===== */
#unified-header .logo-section
מופיע ב-3 קבצים:
- header-styles.css
- _header-system.css
- _header-system-clean.css

## /* ===== סגנונות ניווט ===== */
#unified-header .header-nav
מופיע ב-3 קבצים:
- header-styles.css
- _header-system.css
- _header-system-clean.css

## /* Header Top */
.header-top
מופיע ב-2 קבצים:
- header-styles.css
- _final-menu-structure.css

## .header-container
מופיע ב-2 קבצים:
- header-styles.css
- _final-menu-structure.css

## /* Navigation */
.header-nav
מופיע ב-2 קבצים:
- header-styles.css
- _final-menu-structure.css

## .tiktrack-nav-list
מופיע ב-2 קבצים:
- header-styles.css
- _final-menu-structure.css

## .tiktrack-nav-item
מופיע ב-2 קבצים:
- header-styles.css
- _final-menu-structure.css

## .tiktrack-nav-link
מופיע ב-2 קבצים:
- header-styles.css
- _final-menu-structure.css

## .tiktrack-nav-link:hover
מופיע ב-2 קבצים:
- header-styles.css
- _final-menu-structure.css

## /* Logo Section */
.logo-section
מופיע ב-2 קבצים:
- header-styles.css
- _final-menu-structure.css

## .logo
מופיע ב-2 קבצים:
- header-styles.css
- _final-menu-structure.css

## .logo-image
מופיע ב-2 קבצים:
- header-styles.css
- _final-menu-structure.css

## .tiktrack-nav-item:hover .tiktrack-dropdown-arrow
מופיע ב-2 קבצים:
- header-styles.css
- _final-menu-structure.css

## .tiktrack-nav-item:hover .tiktrack-dropdown-menu
מופיע ב-3 קבצים:
- header-styles.css
- header-styles.css
- _final-menu-structure.css

## .tiktrack-dropdown-item
מופיע ב-2 קבצים:
- header-styles.css
- _final-menu-structure.css

## .tiktrack-dropdown-item:hover
מופיע ב-2 קבצים:
- header-styles.css
- _final-menu-structure.css

## .cache-clear-btn:hover
מופיע ב-2 קבצים:
- header-styles.css
- _final-menu-structure.css

## /* Filters Section */
.header-filters
מופיע ב-2 קבצים:
- header-styles.css
- _final-menu-structure.css

## .header-filters.show
מופיע ב-2 קבצים:
- header-styles.css
- _final-menu-structure.css

## .filters-container
מופיע ב-2 קבצים:
- header-styles.css
- _final-menu-structure.css

## .filter-group
מופיע ב-2 קבצים:
- header-styles.css
- _final-menu-structure.css

## .filter-toggle
מופיע ב-2 קבצים:
- header-styles.css
- _final-menu-structure.css

## .filter-toggle:hover
מופיע ב-2 קבצים:
- header-styles.css
- _final-menu-structure.css

## .filter-menu
מופיע ב-2 קבצים:
- header-styles.css
- _final-menu-structure.css

## .search-input-wrapper
מופיע ב-2 קבצים:
- header-styles.css
- _final-menu-structure.css

## .search-filter-input
מופיע ב-2 קבצים:
- header-styles.css
- _final-menu-structure.css

## .search-filter-input:focus
מופיע ב-2 קבצים:
- header-styles.css
- _final-menu-structure.css

## .search-clear-btn
מופיע ב-2 קבצים:
- header-styles.css
- _final-menu-structure.css

## .search-clear-btn:hover
מופיע ב-2 קבצים:
- header-styles.css
- _final-menu-structure.css

## .reset-btn:hover, .clear-btn:hover
מופיע ב-2 קבצים:
- header-styles.css
- _final-menu-structure.css

## /* ===== סגנונות תפריט נפתח ===== */
#unified-header .tiktrack-dropdown-menu
מופיע ב-2 קבצים:
- _header-system.css
- _header-system-clean.css

## /* ===== סגנונות תת-תפריט ===== */
#unified-header .dropdown-submenu
מופיע ב-2 קבצים:
- _header-system.css
- _header-system-clean.css

## סיכום
סה"כ סלקטורים: 1182
סלקטורים כפולים: 898
אחוז כפילויות: 76.0%