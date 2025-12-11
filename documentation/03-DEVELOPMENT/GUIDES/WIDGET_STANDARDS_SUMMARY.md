# סיכום דרישות סטנדרט לווידג'טים - TikTrack

**תאריך יצירה:** 29 ינואר 2025  
**גרסה:** 1.0.0  
**מטרה:** מסמך סיכום מקיף של כל דרישות הסטנדרט ליצירת ופיתוח ווידג'טים במערכת TikTrack

---

## 📋 תוכן עניינים

1. [דרישות ארכיטקטורה](#דרישות-ארכיטקטורה)
2. [דרישות מבנה קוד](#דרישות-מבנה-קוד)
3. [דרישות API ו-Interface](#דרישות-api-ו-interface)
4. [דרישות שילוב במערכת](#דרישות-שילוב-במערכת)
5. [דרישות עיצוב ו-CSS](#דרישות-עיצוב-ו-css)
6. [דרישות שימוש במערכות כלליות](#דרישות-שימוש-במערכות-כלליות)
7. [דרישות תיעוד](#דרישות-תיעוד)
8. [דוגמאות מהמערכת](#דוגמאות-מהמערכת)

---

## 🏗️ דרישות ארכיטקטורה

### 1. Module Pattern (IIFE) - **חובה**

**כל ווידג'ט חייב להשתמש ב-Module Pattern (IIFE):**

```javascript
;(function () {
  'use strict';
  
  // ===== Constants =====
  const CONTAINER_ID = 'myWidgetContainer';
  
  // ===== State =====
  const state = {
    initialized: false,
    data: null
  };
  
  // ===== DOM Elements Cache =====
  const elements = {
    container: null
  };
  
  // ===== Private Functions =====
  // ...
  
  // ===== Public API =====
  const MyWidget = {
    init() { /* ... */ },
    render(data) { /* ... */ },
    version: '1.0.0'
  };
  
  window.MyWidget = MyWidget;
})();
```

**יתרונות:**

- ✅ פשוט וישיר
- ✅ תואם לווידג'טים הקיימים
- ✅ קל לתחזוקה
- ✅ ללא overhead של Class

**אין להשתמש ב:**

- ❌ Classes
- ❌ Global variables
- ❌ Inline scripts

### 2. Bootstrap Tabs - **לטאבים**

**אם הווידג'ט צריך טאבים, יש להשתמש ב-Bootstrap Tabs (Bootstrap 5):**

```html
<ul class="nav nav-tabs" id="myWidgetTabs" role="tablist">
  <li class="nav-item" role="presentation">
    <button class="nav-link active" 
            id="myWidgetTab1" 
            data-bs-toggle="tab" 
            data-bs-target="#myWidgetPane1" 
            type="button" 
            role="tab">
      Tab 1
    </button>
  </li>
</ul>

<div class="tab-content" id="myWidgetTabContent">
  <div class="tab-pane fade show active" 
       id="myWidgetPane1" 
       role="tabpanel">
    <!-- Content -->
  </div>
</div>
```

**תיעוד:** ראה [TAB_SYSTEM_GUIDE.md](../../02-ARCHITECTURE/FRONTEND/TAB_SYSTEM_GUIDE.md)

---

## 📝 דרישות מבנה קוד

### 1. מבנה קובץ סטנדרטי

**כל קובץ ווידג'ט חייב לכלול:**

```javascript
/**
 * Widget Name - Description
 * =========================
 * 
 * Detailed description of what this widget does.
 * 
 * This widget relies on general systems:
 * - SystemName for purpose
 * - AnotherSystem for purpose
 * 
 * Documentation: See documentation/path/to/guide.md
 */

;(function () {
  'use strict';

  // ===== Constants =====
  const CONTAINER_ID = 'myWidgetContainer';
  
  // ===== State =====
  const state = {
    initialized: false,
    // ... other state
  };
  
  // ===== DOM Elements Cache =====
  const elements = {
    container: null,
    // ... other elements
  };
  
  // ===== Private Functions =====
  // ...
  
  // ===== Public API =====
  const MyWidget = {
    init() { /* ... */ },
    render(data) { /* ... */ },
    version: '1.0.0'
  };
  
  window.MyWidget = MyWidget;
})();
```

### 2. ניהול State

**חובה:**

- ✅ שימוש ב-local state object
- ✅ שמירת מצב initialization
- ✅ Cache למטאדטה (אם רלוונטי)

**אסור:**

- ❌ Global state
- ❌ משתנים גלובליים
- ❌ DOM elements כחלק מה-state

```javascript
const state = {
  initialized: false,
  activeTab: 'cloud',
  data: null,
  metadataCache: new Map() // אם רלוונטי
};
```

### 3. Cache DOM Elements

**חובה ל-cache את כל ה-DOM elements:**

```javascript
const elements = {
  container: null,
  button: null,
  // ...
};

function cacheElements() {
  elements.container = document.getElementById(CONTAINER_ID);
  if (!elements.container) {
    return false;
  }
  // Cache other elements...
  return true;
}
```

**אסור:**

- ❌ חיפוש DOM בכל render
- ❌ querySelector בכל פעם

### 4. Error Handling

**חובה לכלול טיפול בשגיאות:**

```javascript
try {
  const data = await fetchData();
  render(data);
} catch (error) {
  window.Logger?.error?.('Widget error', { error });
  window.NotificationSystem?.showError?.('Failed to load data');
}
```

---

## 🔌 דרישות API ו-Interface

### 1. פונקציית `init()` - **חובה**

**כל ווידג'ט חייב לכלול פונקציית `init()`:**

```javascript
/**
 * Initialize widget
 * @param {string} containerId - Container ID (optional, has default)
 * @param {object} config - Configuration object (optional)
 */
init(containerId = CONTAINER_ID, config = {}) {
  if (state.initialized) {
    return;
  }
  
  // Merge configuration
  state.config = {
    ...DEFAULT_CONFIG,
    ...config
  };
  
  // Cache elements
  if (!cacheElements()) {
    return;
  }
  
  // Apply configuration
  applyConfiguration();
  
  // Bind events
  bindEvents();
  
  // Initialize content
  // ...
  
  state.initialized = true;
}
```

**דרישות:**

- ✅ תמיכה ב-container ID מותאם
- ✅ תמיכה ב-config object
- ✅ בדיקת initialization כפולה
- ✅ בדיקת קיום container

### 2. פונקציית `render()` - **מומלץ**

```javascript
/**
 * Render/update widget
 * @param {object} data - Data to render
 */
render(data = {}) {
  if (!state.initialized) {
    return;
  }
  // Render logic...
}
```

### 3. פונקציית `destroy()` - **מומלץ**

```javascript
/**
 * Destroy widget and cleanup
 */
destroy() {
  state.initialized = false;
  // Cleanup...
}
```

### 4. תמיכה ב-Multiple Instances

**ווידג'טים צריכים לתמוך ב-multiple instances:**

```javascript
// Instance 1
window.MyWidget.init('container1', { maxItems: 10 });

// Instance 2
window.MyWidget.init('container2', { maxItems: 20 });
```

**דרישות:**

- ✅ תמיכה ב-container ID מותאם
- ✅ קונפיגורציה נפרדת לכל instance

### 5. קונפיגורציה - גובה דינמי

**אם הווידג'ט מציג תוכן עם מספר שורות:**

```javascript
const DEFAULT_CONFIG = {
  minRows: 1,
  maxRows: 3,
  rowHeight: 20
};

// Apply via CSS variables
function applyHeightConfiguration() {
  const { minRows, maxRows, rowHeight } = state.config;
  elements.container.style.setProperty('--widget-min-height', `${minRows * rowHeight}px`);
  elements.container.style.setProperty('--widget-max-height', `${maxRows * rowHeight}px`);
}
```

---

## 🔗 דרישות שילוב במערכת

### 1. Package Manifest

**הוספה ל-Package Manifest:**

```javascript
// trading-ui/scripts/init-system/package-manifest.js
'my-package': {
  scripts: [
    {
      file: 'widgets/my-widget.js',
      globalCheck: 'window.MyWidget',
      description: 'Widget description',
      required: true,
      loadOrder: 1
    }
  ]
}
```

**דרישות:**

- ✅ globalCheck - בדיקת זמינות global
- ✅ description - תיאור קצר
- ✅ required - סטטוס חובה
- ✅ loadOrder - סדר טעינה

### 2. Page Initialization Configs

**הוספה ל-Page Config:**

```javascript
// trading-ui/scripts/page-initialization-configs.js
'my-page': {
  packages: ['base', 'my-package'],
  requiredGlobals: ['window.MyWidget'],
  customInitializers: [
    async () => {
      if (window.MyWidget) {
        window.MyWidget.init();
      }
    }
  ]
}
```

**דרישות:**

- ✅ packages - רשימת packages
- ✅ requiredGlobals - בדיקת globals נדרשים
- ✅ customInitializers - אתחול מותאם

### 3. HTML Structure

**מבנה HTML סטנדרטי:**

```html
<div class="card h-100" id="myWidgetContainer">
  <div class="card-header">
    <h5>Widget Title</h5>
  </div>
  <div class="card-body">
    <!-- Widget content -->
  </div>
</div>
```

**אם יש טאבים:**

```html
<div class="card h-100" id="myWidgetContainer">
  <div class="card-header">
    <!-- Bootstrap Tabs here -->
    <ul class="nav nav-tabs" id="myWidgetTabs" role="tablist">
      <!-- Tabs -->
    </ul>
  </div>
  <div class="card-body">
    <!-- Tab Content -->
    <div class="tab-content" id="myWidgetTabContent">
      <!-- Tab panes -->
    </div>
  </div>
</div>
```

---

## 🎨 דרישות עיצוב ו-CSS

### 1. קובץ CSS נפרד

**כל ווידג'ט חייב לכלול קובץ CSS נפרד:**

```css
/**
 * Widget Name Styles
 * =================
 * 
 * Styles for widget description
 * 
 * Documentation: See documentation/path/to/guide.md
 */

/* ===== Widget Container ===== */
#myWidgetContainer {
  /* Styles */
}
```

**מיקום:** `trading-ui/styles-new/06-components/_widget-name.css`

### 2. שימוש ב-CSS Variables

**לצרכים דינמיים (כמו גובה):**

```css
.widget-content {
  min-height: var(--widget-min-height, 20px);
  max-height: var(--widget-max-height, 60px);
}
```

### 3. שימוש בצבעי המערכת

**חובה להשתמש בצבעי המערכת:**

```css
color: var(--brand-primary-color, #26baac);
border-color: var(--brand-primary-dark, #1a8f83);
```

### 4. Responsive Design

**חובה לכלול תמיכה ב-responsive:**

```css
@media (max-width: 768px) {
  /* Mobile styles */
}
```

---

## 🔧 דרישות שימוש במערכות כלליות

### 1. FieldRendererService - **לעיצוב שדות**

**חובה להשתמש ב-FieldRendererService לעיצוב:**

```javascript
// ✅ טוב
const formattedAmount = window.FieldRendererService?.renderAmount(value, currency);
const formattedDate = window.FieldRendererService?.renderDate(dateValue);
const tagBadges = window.FieldRendererService?.renderTagBadges(tags);
```

**אסור:**

```javascript
// ❌ רע - אל תכתוב פונקציות עיצוב מקומיות
function formatAmount(value) {
  return `$${value.toFixed(2)}`;
}
```

### 2. ButtonSystem - **לכפתורים**

**חובה להשתמש ב-ButtonSystem:**

```javascript
if (window.ButtonSystem?.processButtons) {
  window.ButtonSystem.processButtons(container);
}
```

**דרישות:**

- ✅ שימוש ב-data attributes
- ✅ עיבוד דרך ButtonSystem
- ✅ ללא inline event handlers

### 3. NotificationSystem - **להודעות**

**חובה להשתמש ב-NotificationSystem:**

```javascript
window.NotificationSystem?.showError?.('Error message');
window.NotificationSystem?.showSuccess?.('Success message');
```

**אסור:**

- ❌ alert()
- ❌ console.error() למשתמש
- ❌ HTML popups מקומיים

### 4. ModalManagerV2 - **למודלים**

```javascript
await window.ModalManagerV2?.showModal('modalId', 'view');
```

### 5. Logger - **ללוגים**

```javascript
window.Logger?.info?.('Message', { context });
window.Logger?.error?.('Error', { error });
window.Logger?.warn?.('Warning', { context });
```

### 6. שירותי נתונים

**השתמש בשירותי נתונים קיימים:**

```javascript
// TagService
const tags = await window.TagService?.getTagCloudData();

// DashboardData
const data = await window.DashboardData?.load();

// Entity Services
const details = await window.entityDetailsAPI?.getEntityDetails(type, id);
```

---

## 📖 דרישות תיעוד

### 1. תיעוד בקובץ הקוד

**כל קובץ ווידג'ט חייב לכלול:**

```javascript
/**
 * Widget Name - Description
 * =========================
 * 
 * Detailed description of what this widget does.
 * 
 * This widget relies on general systems:
 * - SystemName for purpose
 * - AnotherSystem for purpose
 * 
 * Documentation: See documentation/path/to/guide.md
 */
```

### 2. מדריך מפתח ספציפי

**לכל ווידג'ט מורכב - יצירת מדריך נפרד:**

**מיקום:** `documentation/03-DEVELOPMENT/GUIDES/WIDGET_NAME_DEVELOPER_GUIDE.md`

**תוכן:**

- סקירה כללית
- ארכיטקטורה
- API
- דוגמאות קוד
- Customization

**דוגמה:** [TAG_WIDGET_DEVELOPER_GUIDE.md](TAG_WIDGET_DEVELOPER_GUIDE.md)

### 3. עדכון WIDGETS_LIST.md

**חובה לעדכן את רשימת הווידג'טים:**

```markdown
| **Widget Name** | `trading-ui/scripts/widgets/widget-name.js` | [GUIDE.md](GUIDE.md) | ✅ פעיל | Description |
```

**מיקום:** `documentation/frontend/WIDGETS_LIST.md`

---

## ✅ Checklist ליצירת ווידג'ט חדש

### תכנון

- [ ] בדוק אם יש ווידג'ט דומה קיים
- [ ] תכנן את ה-API
- [ ] תכנן את ה-HTML structure

### קוד

- [ ] יצרת קובץ JS ב-`trading-ui/scripts/widgets/`
- [ ] השתמשת ב-Module Pattern (IIFE)
- [ ] הוספת פונקציית `init()` עם תמיכה ב-config
- [ ] הוספת פונקציית `render()` (אם רלוונטי)
- [ ] Cache DOM elements
- [ ] State management מקומי
- [ ] Error handling מלא

### עיצוב

- [ ] יצרת קובץ CSS ב-`trading-ui/styles-new/06-components/`
- [ ] שימוש בצבעי המערכת
- [ ] Responsive design

### מערכות כלליות

- [ ] שימוש ב-FieldRendererService
- [ ] שימוש ב-ButtonSystem
- [ ] שימוש ב-NotificationSystem
- [ ] שימוש ב-Logger

### שילוב

- [ ] עדכנת Package Manifest
- [ ] עדכנת Page Config
- [ ] בדקת טעינה תקינה

### תיעוד

- [ ] הוספת תיעוד לקובץ הקוד
- [ ] יצרת מדריך מפתח (אם נדרש)
- [ ] עדכנת WIDGETS_LIST.md

---

## 📚 דוגמאות מהמערכת

### Tag Widget - דוגמה מושלמת

**קובץ:** `trading-ui/scripts/widgets/tag-widget.js`

**מאפיינים:**

- ✅ Module Pattern (IIFE)
- ✅ Bootstrap Tabs (2 טאבים)
- ✅ API מלא (`init`, `render`, `destroy`, `refreshTagCloud`)
- ✅ תמיכה ב-multiple instances
- ✅ קונפיגורציה (גובה דינמי)
- ✅ State management מלא
- ✅ Cache DOM elements
- ✅ שימוש במערכות כלליות

**תיעוד:** [TAG_WIDGET_DEVELOPER_GUIDE.md](TAG_WIDGET_DEVELOPER_GUIDE.md)

### Recent Trades Widget - דוגמה פשוטה

**קובץ:** `trading-ui/scripts/widgets/recent-trades-widget.js`

**מאפיינים:**

- ✅ Module Pattern (IIFE)
- ✅ פשוט וישיר
- ✅ שימוש ב-FieldRendererService

---

## 🔄 Workflow ליצירת ווידג'ט חדש

### 1. תכנון

- בדוק אם יש ווידג'ט דומה קיים
- תכנן את ה-API
- תכנן את ה-HTML structure

### 2. יצירת קובץ

- צור קובץ ב-`trading-ui/scripts/widgets/`
- השתמש בתבנית הבסיסית
- כתוב documentation header

### 3. יצירת HTML

- הוסף HTML structure לעמוד
- אם צריך טאבים - השתמש ב-Bootstrap Tabs
- צור קובץ CSS

### 4. אינטגרציה

- עדכן Package Manifest
- עדכן Page Config
- הוסף ל-requiredGlobals

### 5. תיעוד

- עדכן WIDGETS_LIST.md
- יצירת מדריך ספציפי אם נדרש

---

## 📖 תיעוד נוסף

### מדריכים מרכזיים

- **מדריך יצירת ווידג'טים:** [WIDGET_DEVELOPER_GUIDE.md](WIDGET_DEVELOPER_GUIDE.md)
- **ארכיטקטורת ווידג'טים:** [WIDGET_SYSTEM_ARCHITECTURE.md](../../02-ARCHITECTURE/FRONTEND/WIDGET_SYSTEM_ARCHITECTURE.md)
- **מדריך טאבים:** [TAB_SYSTEM_GUIDE.md](../../02-ARCHITECTURE/FRONTEND/TAB_SYSTEM_GUIDE.md)
- **רשימת ווידג'טים:** [WIDGETS_LIST.md](../../frontend/WIDGETS_LIST.md)

### מדריכים ספציפיים

- **Tag Widget:** [TAG_WIDGET_DEVELOPER_GUIDE.md](TAG_WIDGET_DEVELOPER_GUIDE.md)
- **Pending Trade Plan Widget:** [PENDING_TRADE_PLAN_WIDGET_DEVELOPER_GUIDE.md](PENDING_TRADE_PLAN_WIDGET_DEVELOPER_GUIDE.md)

---

## 🎯 סיכום - עקרונות יסוד

### חובה ✅

1. **Module Pattern (IIFE)** - כל ווידג'ט חייב להשתמש בזה
2. **פונקציית `init()`** - עם תמיכה ב-config
3. **Cache DOM Elements** - לא לחפש בכל פעם
4. **State Management מקומי** - לא global variables
5. **שימוש במערכות כלליות** - FieldRendererService, ButtonSystem, NotificationSystem
6. **Error Handling** - טיפול בשגיאות מלא
7. **תיעוד** - header בקובץ + עדכון WIDGETS_LIST.md

### מומלץ מאוד ⭐

1. **Bootstrap Tabs** - לטאבים
2. **תמיכה ב-Multiple Instances** - container ID מותאם
3. **קונפיגורציה דינמית** - גובה, מספר פריטים וכו'
4. **מדריך מפתח נפרד** - לווידג'טים מורכבים

### אסור ❌

1. **Global variables** - לא ליצור משתנים גלובליים
2. **Inline scripts** - לא לכתוב inline scripts
3. **פונקציות עיצוב מקומיות** - להשתמש ב-FieldRendererService
4. **alert() או console.error() למשתמש** - להשתמש ב-NotificationSystem
5. **חיפוש DOM בכל פעם** - cache elements

---

**מקור:** `documentation/03-DEVELOPMENT/GUIDES/WIDGET_STANDARDS_SUMMARY.md`  
**עודכן:** 29 ינואר 2025






















