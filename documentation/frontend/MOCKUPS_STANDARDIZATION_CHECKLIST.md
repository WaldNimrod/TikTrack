# רשימת בדיקה לסטנדרטיזציה - עמודי מוקאפ
# Mockups Standardization Checklist

**תאריך יצירה:** 25 בנובמבר 2025  
**גרסה:** 1.0.0  
**מטרה:** רשימת בדיקה מפורטת לכל מערכת כללית שעמודי מוקאפ חייבים לממש

---

## מערכות תצוגה ו-UI (7 מערכות)

### 1. Icon System
**קבצים:**
- `trading-ui/scripts/icon-system.js`
- `trading-ui/scripts/icon-mappings.js`

**קריטריוני בדיקה:**
- [ ] אין שימוש ישיר ב-`<img src="../../images/icons/tabler/...">`
- [ ] כל האיקונים עוברים דרך `IconSystem.renderIcon()` או `data-icon-type`/`data-icon-name`
- [ ] איקוני ישויות משתמשים ב-`IconSystem.getEntityIcon()`
- [ ] איקוני כפתורים משתמשים ב-`IconSystem.getButtonIcon()`
- [ ] כל האיקונים מופיעים ב-`icon-mappings.js`

**דוגמאות שימוש:**
```javascript
// נכון:
const icon = await window.IconSystem.renderIcon('button', 'pencil', { size: '16' });
// או:
<span data-icon-type="button" data-icon-name="pencil"></span>

// שגוי:
<img src="../../images/icons/tabler/pencil.svg" width="16" height="16">
```

---

### 2. Header & Filters System
**קבצים:**
- `trading-ui/scripts/header-system.js`

**קריטריוני בדיקה:**
- [ ] קיום `<div id="unified-header"></div>` ב-HTML (או יצירה דינמית)
- [ ] טעינת `header-system.js` דרך package manifest
- [ ] ראש הדף מוצג נכון (תפריט + פילטרים)
- [ ] נתיבי איקונים נכונים (`../../` למוקאפים)
- [ ] כפתור ניטור (🔍) עובד
- [ ] תפריט ניווט עובד
- [ ] פילטרים עובדים (אם רלוונטי)

**דוגמאות שימוש:**
```html
<!-- נכון: -->
<div id="unified-header"></div>
<!-- HeaderSystem יוצר את התוכן דינמית -->
```

---

### 3. Color Scheme System
**קבצים:**
- `trading-ui/scripts/color-scheme-system.js`

**קריטריוני בדיקה:**
- [ ] אין צבעים hardcoded ב-HTML (`style="color: #ff0000"`)
- [ ] אין צבעים hardcoded ב-CSS (רק CSS variables)
- [ ] שימוש ב-CSS variables: `--entity-{type}-color`, `--entity-{type}-bg`
- [ ] צבעי המותג: `--logo-turquoise: #26baac`, `--logo-orange: #fc5a06`

**דוגמאות שימוש:**
```css
/* נכון: */
.badge {
    background: var(--entity-trade-bg);
    color: var(--entity-trade-color);
}

/* שגוי: */
.badge {
    background: #ff0000;
    color: #ffffff;
}
```

---

### 4. Button System
**קבצים:**
- `trading-ui/scripts/button-system-init.js`
- `trading-ui/scripts/button-icons.js`

**קריטריוני בדיקה:**
- [ ] כל הכפתורים עם `data-button-type` (ADD, EDIT, DELETE, EXPORT, וכו')
- [ ] כל הכפתורים עם `data-variant` (small, medium, full)
- [ ] שימוש ב-`data-onclick` (לא `onclick`)
- [ ] כפתורי toggle עם `filter-toggle-btn` class
- [ ] אין manipulation ישיר של `style` ב-JavaScript

**דוגמאות שימוש:**
```html
<!-- נכון: -->
<button data-button-type="ADD" data-variant="full" data-onclick="handleAdd()">הוסף</button>

<!-- שגוי: -->
<button onclick="handleAdd()">הוסף</button>
```

---

### 5. Actions Menu Toolkit
**קבצים:**
- `trading-ui/scripts/modules/actions-menu-system.js`

**קריטריוני בדיקה:**
- [ ] תפריטי פעולה לשורות טבלה משתמשים ב-ActionsMenuSystem
- [ ] תמיכה ב-RTL נכונה
- [ ] positioning נכון (hover)

**דוגמאות שימוש:**
```javascript
// נכון:
window.ActionsMenuSystem?.showMenu(event, rowElement, actions);

// שגוי:
// יצירת תפריט ידני
```

---

### 6. Info Summary System
**קבצים:**
- `trading-ui/scripts/info-summary-system.js`
- `trading-ui/scripts/services/statistics-calculator.js`

**קריטריוני בדיקה:**
- [ ] חישובי KPI עוברים דרך InfoSummarySystem
- [ ] תמיכה בסינונים
- [ ] רינדור RTL נכון

**דוגמאות שימוש:**
```javascript
// נכון:
window.InfoSummarySystem?.renderSummary(data, container);

// שגוי:
// חישוב ידני של סטטיסטיקות
```

---

### 7. Pagination System
**קבצים:**
- `trading-ui/scripts/pagination-system.js`

**קריטריוני בדיקה:**
- [ ] פאג'ינציה עוברת דרך PaginationSystem
- [ ] תמיכה במצבי חיפוש

**דוגמאות שימוש:**
```javascript
// נכון:
window.PaginationSystem?.init(tableId, options);

// שגוי:
// פאג'ינציה ידנית
```

---

## מערכות בסיס (7 מערכות)

### 8. Unified Initialization System
**קבצים:**
- `trading-ui/scripts/unified-app-initializer.js`
- `trading-ui/scripts/page-initialization-configs.js`
- `trading-ui/scripts/init-system/package-manifest.js`

**קריטריוני בדיקה:**
- [ ] הגדרה ב-`page-initialization-configs.js` עם שם עמוד נכון
- [ ] חבילות נכונות ב-`package-manifest.js`
- [ ] אין טעינה כפולה של סקריפטים
- [ ] סדר טעינה נכון (base → services → ui-advanced → crud → preferences → entity-services → init-system)
- [ ] אין סקריפטים ב-HTML (רק דרך package manifest)

**דוגמאות שימוש:**
```javascript
// ב-page-initialization-configs.js:
'trading-journal-page': {
    type: 'mockup',
    packages: ['base', 'services', 'ui-advanced', 'preferences', 'init-system'],
    // ...
}
```

---

### 9. Notification System
**קבצים:**
- `trading-ui/scripts/notification-system.js`

**קריטריוני בדיקה:**
- [ ] קיום `<div id="notification-container"></div>`
- [ ] קיום `<div id="toast-container"></div>`
- [ ] שימוש ב-`showNotification()` לכל הודעות (לא `alert()`, `confirm()`)
- [ ] אין הודעות HTML ידניות

**דוגמאות שימוש:**
```javascript
// נכון:
showNotification('הודעה', 'success');
showNotification('שגיאה', 'error');

// שגוי:
alert('הודעה');
// או יצירת div ידני
```

---

### 10. Modal Manager V2
**קבצים:**
- `trading-ui/scripts/modal-manager-v2.js`

**קריטריוני בדיקה:**
- [ ] פתיחת מודלים דרך `ModalManagerV2.open()`
- [ ] סגירת מודלים דרך `ModalManagerV2.close()`
- [ ] אין יצירת מודלים ידנית

**דוגמאות שימוש:**
```javascript
// נכון:
window.ModalManagerV2?.open('modal-id', options);

// שגוי:
// יצירת modal ידני
```

---

### 11. UI Utilities & Section Toggle
**קבצים:**
- `trading-ui/scripts/ui-utils.js`

**קריטריוני בדיקה:**
- [ ] סקשנים עם `data-section` attribute
- [ ] כפתורי toggle משתמשים ב-`toggleSection()` מ-`ui-utils.js`
- [ ] אין manipulation ישיר של `style.display`
- [ ] אין פונקציות toggle מקומיות

**דוגמאות שימוש:**
```html
<!-- נכון: -->
<div class="top-section" data-section="top">
    <button class="filter-toggle-btn" data-onclick="toggleSection('top')">
        <span class="section-toggle-icon">▼</span>
    </button>
</div>

<!-- שגוי: -->
<div class="top-section" id="top-section">
    <button onclick="document.getElementById('top-section').style.display='none'">
        סגור
    </button>
</div>
```

---

### 12. Page State Management
**קבצים:**
- `trading-ui/scripts/page-utils.js`

**קריטריוני בדיקה:**
- [ ] שמירת מצב עמוד (אם רלוונטי)
- [ ] שחזור פילטרים וסקשנים

**דוגמאות שימוש:**
```javascript
// נכון:
window.PageStateManager?.saveState();
window.PageStateManager?.restoreState();

// שגוי:
// שמירה ידנית ב-localStorage
```

---

### 13. Translation Utilities
**קבצים:**
- `trading-ui/scripts/translation-utils.js`

**קריטריוני בדיקה:**
- [ ] טיפול במחרוזות דרך TranslationUtils
- [ ] תמיכה ב-RTL

**דוגמאות שימוש:**
```javascript
// נכון:
window.TranslationUtils?.translate(key);

// שגוי:
// מחרוזות hardcoded
```

---

### 14. Event Handler Manager
**קבצים:**
- `trading-ui/scripts/event-handler-manager.js`

**קריטריוני בדיקה:**
- [ ] שימוש ב-Event Handler Manager (אם רלוונטי)
- [ ] מניעת כפילויות

**דוגמאות שימוש:**
```javascript
// נכון:
window.EventHandlerManager?.addHandler(element, 'click', handler);

// שגוי:
// addEventListener ישיר ללא בדיקת כפילויות
```

---

## מערכות CRUD (3 מערכות)

### 15. Field Renderer Service
**קבצים:**
- `trading-ui/scripts/services/field-renderer-service.js`

**קריטריוני בדיקה:**
- [ ] רינדור Status/Amount/Date/Badges דרך FieldRendererService
- [ ] אין רינדור ידני

**דוגמאות שימוש:**
```javascript
// נכון:
window.FieldRendererService?.renderStatus(status, entityType);
window.FieldRendererService?.renderAmount(amount, currency);

// שגוי:
// רינדור ידני של status/amount
```

---

### 16. Table Sort Value Adapter
**קבצים:**
- `trading-ui/scripts/services/table-sort-value-adapter.js`

**קריטריוני בדיקה:**
- [ ] המרת ערכים למיון דרך TableSortValueAdapter

**דוגמאות שימוש:**
```javascript
// נכון:
window.TableSortValueAdapter?.adaptValue(value, type);

// שגוי:
// מיון ישיר ללא המרה
```

---

### 17. Linked Items Service
**קבצים:**
- `trading-ui/scripts/services/linked-items-service.js`

**קריטריוני בדיקה:**
- [ ] רשימות פריטים מקושרים דרך LinkedItemsService

**דוגמאות שימוש:**
```javascript
// נכון:
window.LinkedItemsService?.getLinkedItems(entityType, entityId);

// שגוי:
// טעינה ידנית של פריטים מקושרים
```

---

## מבנה HTML בסיסי

### 18. מבנה עמוד
**קריטריוני בדיקה:**
- [ ] מבנה: `background-wrapper` → `page-body` → `main-content`
- [ ] קיום `<div id="unified-header"></div>` (או יצירה דינמית)
- [ ] סקשנים עם `data-section` attributes
- [ ] אין inline styles (רק CSS classes)

**דוגמאות שימוש:**
```html
<!-- נכון: -->
<body>
    <div class="background-wrapper">
        <div id="unified-header"></div>
        <div class="page-body">
            <div class="main-content">
                <div class="top-section" data-section="top">
                    <!-- תוכן -->
                </div>
            </div>
        </div>
    </div>
</body>

<!-- שגוי: -->
<body>
    <div style="background: white;">
        <!-- תוכן ללא מבנה -->
    </div>
</body>
```

---

## מערכת ניטור טעינה

### 19. ניטור טעינה
**קבצים:**
- `trading-ui/scripts/init-system-check.js`
- `trading-ui/scripts/monitoring-functions.js`

**קריטריוני בדיקה:**
- [ ] הרצת ניטור דרך כפתור 🔍 בתפריט הראשי
- [ ] 0 שגיאות בניטור
- [ ] 0 כפילויות סקריפטים
- [ ] כל הסקריפטים נטענים בהצלחה
- [ ] התאמה למניפסט 100%

**תהליך בדיקה:**
1. טעינת העמוד בדפדפן
2. לחיצה על כפתור 🔍 בתפריט הראשי
3. בדיקת הדוח:
   - כפילויות: 0
   - שגיאות קריטיות: 0
   - חסרים ב-DOM: 0
   - התאמה למניפסט: 100%

---

## סיכום קריטריונים

### קריטריוני הצלחה (חובה):
1. ✅ **100% מהעמודים** משתמשים במערכת ראש הדף
2. ✅ **0 שגיאות** בניטור טעינה
3. ✅ **0 כפילויות** סקריפטים
4. ✅ **100% מהאיקונים** עוברים דרך IconSystem
5. ✅ **100% מהכפתורים** משתמשים ב-Button System
6. ✅ **100% מהסקשנים** משתמשים ב-Section Toggle System
7. ✅ **0 צבעים hardcoded** - רק CSS variables

### סדר עדיפויות תיקון:
1. **קריטי:** Header System, Initialization System, Notification System
2. **גבוה:** Icon System, Button System, Section Toggle System
3. **בינוני:** Color Scheme System, Field Renderer Service
4. **נמוך:** Info Summary System, Pagination System, Page State Management

---

**עדכון אחרון:** 25 בנובמבר 2025  
**מחבר:** TikTrack Development Team


