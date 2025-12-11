# מדריך מפתח - יצירת ווידג'טים

**תאריך יצירה:** 21 ינואר 2025  
**תאריך עדכון אחרון:** 29 ינואר 2025  
**גרסה:** 1.1.0  
**מטרה:** מדריך מקיף ליצירת ווידג'טים חדשים במערכת TikTrack

> **⚠️ חשוב:** זהו **הסטנדרט הרשמי** ליצירת ווידג'טים במערכת TikTrack. כל ווידג'ט חדש **חייב** לעמוד בסטנדרט זה.

---

## 🚀 Quick Start - למפתחים חדשים

### שלבים ראשונים

1. **קרא את המדריך** - הכר את הארכיטקטורה המומלצת (Module Pattern IIFE)
2. **השתמש בתבנית** - העתק את התבנית הבסיסית מהמדריך
3. **עקוב אחר ה-Workflow** - יש workflow מוגדר שלב אחר שלב
4. **עיין בדוגמאות** - ראה דוגמאות מהמערכת (Tag Widget, Recent Trades Widget)

### נקודות מפתח

- **ארכיטקטורה:** Module Pattern (IIFE) - **חובה**
- **טאבים:** Bootstrap Tabs - **מומלץ מאוד**
- **קונפיגורציה:** תמיכה ב-config object עם minRows/maxRows (אם רלוונטי)
- **תיעוד:** עדכן את [WIDGETS_LIST.md](../../frontend/WIDGETS_LIST.md) אחרי יצירת ווידג'ט

### קבצים חשובים

- **מדריך זה:** `documentation/03-DEVELOPMENT/GUIDES/WIDGET_DEVELOPER_GUIDE.md`
- **רשימת ווידג'טים:** `documentation/frontend/WIDGETS_LIST.md`
- **ארכיטקטורה:** `documentation/02-ARCHITECTURE/FRONTEND/WIDGET_SYSTEM_ARCHITECTURE.md`
- **דוגמה:** `trading-ui/scripts/widgets/tag-widget.js`

---

## 📋 תוכן עניינים

1. [סקירה כללית](#סקירה-כללית)
2. [ארכיטקטורה מומלצת](#ארכיטקטורה-מומלצת)
3. [תבנית בסיסית](#תבנית-בסיסית)
4. [קונפיגורציה - הגדרת גובה דינמי](#קונפיגורציה---הגדרת-גובה-דינמי)
5. [שילוב עם Bootstrap Tabs](#שילוב-עם-bootstrap-tabs)
6. [שילוב בעמודים נוספים](#שילוב-בעמודים-נוספים)
7. [Best Practices](#best-practices)
8. [דוגמאות מהמערכת](#דוגמאות-מהמערכת)

---

## 🎯 סקירה כללית

ווידג'טים במערכת TikTrack הם רכיבים עצמאיים שניתן לשלב בעמודים שונים. כל ווידג'ט:

- משתמש במערכות כלליות (FieldRendererService, ButtonSystem, וכו')
- נטען דרך Package Manifest
- נאתחל אוטומטית דרך Page Initialization Configs
- ניתן לשילוב חוזר בעמודים נוספים

**רשימת ווידג'טים:** ראה [WIDGETS_LIST.md](../../frontend/WIDGETS_LIST.md)

---

## 🏗️ ארכיטקטורה מומלצת

### Module Pattern (IIFE) - **מומלץ**

**יתרונות:**

- ✅ פשוט וישיר
- ✅ תואם לווידג'טים הקיימים
- ✅ קל לתחזוקה
- ✅ ללא overhead של Class

**דוגמה:**

```javascript
;(function () {
  'use strict';

  const CONTAINER_ID = 'myWidgetContainer';

  const MyWidget = {
    init() {
      // אתחול
    },
    render(data) {
      // רינדור
    },
    version: '1.0.0'
  };

  window.MyWidget = MyWidget;
})();
```

**השוואה לארכיטקטורות אחרות:** ראה [WIDGET_ARCHITECTURE_COMPARISON.md](WIDGET_ARCHITECTURE_COMPARISON.md)

---

## 📝 תבנית בסיסית

### מבנה קובץ

```javascript
/**
 * My Widget - TikTrack Dashboard
 * ==============================
 * 
 * Description of what this widget does.
 * 
 * This widget relies on general systems:
 * - FieldRendererService for formatting
 * - ButtonSystem for buttons
 * - NotificationSystem for errors
 * 
 * Documentation: See documentation/...
 */

;(function () {
  'use strict';

  // ===== Constants =====
  const CONTAINER_ID = 'myWidgetContainer';
  const MAX_ITEMS = 10;

  // ===== State =====
  const state = {
    initialized: false,
    data: null
  };

  // ===== DOM Elements Cache =====
  const elements = {
    container: null,
    // ... other elements
  };

  // ===== Private Functions =====
  
  /**
   * Cache DOM elements
   */
  function cacheElements() {
    elements.container = document.getElementById(CONTAINER_ID);
    if (!elements.container) {
      return false;
    }
    // Cache other elements...
    return true;
  }

  /**
   * Bind events
   */
  function bindEvents() {
    // Bind event listeners...
  }

  /**
   * Render widget content
   */
  function render(data) {
    if (!elements.container) {
      return;
    }
    // Render logic...
  }

  // ===== Public API =====
  
  const MyWidget = {
    /**
     * Initialize widget
     * @param {string} containerId - Optional container ID
     * @param {object} config - Optional configuration
     * @param {number} config.minRows - Minimum number of rows (if applicable)
     * @param {number} config.maxRows - Maximum number of rows (if applicable)
     * @param {number} config.rowHeight - Height per row in pixels (if applicable)
     */
    init(containerId = CONTAINER_ID, config = {}) {
      if (state.initialized) {
        return;
      }

      // Merge configuration with defaults
      state.config = {
        minRows: 1,
        maxRows: 3,
        rowHeight: 20,
        ...config
      };

      if (!cacheElements()) {
        window.Logger?.warn?.('MyWidget: Container not found', { containerId });
        return;
      }

      // Apply configuration (e.g., height settings via CSS variables)
      applyConfiguration();

      bindEvents();
      // Other initialization...
      state.initialized = true;
    },

    /**
     * Render/update widget
     * @param {object} data - Data to render
     */
    render(data = {}) {
      render(data);
    },

    /**
     * Destroy widget
     */
    destroy() {
      state.initialized = false;
      // Cleanup...
    },

    version: '1.0.0'
  };

  // Export to global scope
  window.MyWidget = MyWidget;
})();
```

---

## 🎨 שילוב עם Bootstrap Tabs

אם הווידג'ט צריך טאבים, השתמש ב-Bootstrap Tabs (Bootstrap 5).

### HTML Structure

```html
<div class="card" id="myWidgetContainer">
  <div class="card-header">
    <h5>Widget Title</h5>
  </div>
  <div class="card-body">
    <!-- Bootstrap Tabs -->
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
      <li class="nav-item" role="presentation">
        <button class="nav-link" 
                id="myWidgetTab2" 
                data-bs-toggle="tab" 
                data-bs-target="#myWidgetPane2" 
                type="button" 
                role="tab">
          Tab 2
        </button>
      </li>
    </ul>

    <!-- Tab Content -->
    <div class="tab-content" id="myWidgetTabContent">
      <div class="tab-pane fade show active" 
           id="myWidgetPane1" 
           role="tabpanel">
        <!-- Tab 1 content -->
      </div>
      <div class="tab-pane fade" 
           id="myWidgetPane2" 
           role="tabpanel">
        <!-- Tab 2 content -->
      </div>
    </div>
  </div>
</div>
```

### JavaScript - Tab Events

```javascript
function bindEvents() {
  // Tab switching (Bootstrap tabs)
  const tab1 = elements.container.querySelector('#myWidgetTab1');
  const tab2 = elements.container.querySelector('#myWidgetTab2');

  if (tab1) {
    tab1.addEventListener('shown.bs.tab', () => {
      state.activeTab = 'tab1';
      // Handle tab 1 activation...
    });
  }

  if (tab2) {
    tab2.addEventListener('shown.bs.tab', () => {
      state.activeTab = 'tab2';
      // Handle tab 2 activation...
    });
  }
}
```

**תיעוד מלא:** ראה [TAB_SYSTEM_GUIDE.md](../../02-ARCHITECTURE/FRONTEND/TAB_SYSTEM_GUIDE.md)

---

## 🔗 שילוב בעמודים נוספים

### 1. יצירת API פשוט

הוסף פונקציית `init()` שמקבלת container ID ו-config:

```javascript
const MyWidget = {
  /**
   * Initialize widget
   * @param {string} containerId - Container ID (optional, has default)
   * @param {object} config - Configuration object (optional)
   */
  init(containerId = CONTAINER_ID, config = {}) {
    // Update CONTAINER_ID if provided
    if (containerId !== CONTAINER_ID) {
      // Handle custom container...
    }
    
    // Apply config...
    if (config.defaultTab) {
      // Set active tab...
    }

    // Standard initialization...
  }
};
```

### 2. שימוש בעמוד אחר

```javascript
// בעמוד אחר
window.MyWidget.init('customContainerId', {
  defaultTab: 'tab2',
  maxItems: 20
});
```

### 3. עדכון Package Manifest

הוסף את הווידג'ט ל-Package Manifest:

```javascript
// trading-ui/scripts/init-system/package-manifest.js
'my-package': {
  scripts: [
    {
      file: 'widgets/my-widget.js',
      globalCheck: 'window.MyWidget',
      description: 'My widget description',
      required: true,
      loadOrder: 1
    }
  ]
}
```

### 4. עדכון Page Config

הוסף ל-Page Initialization Configs:

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

---

## ⚙️ קונפיגורציה - הגדרת גובה דינמי

אם הווידג'ט שלך מציג תוכן עם מספר שורות (כמו תגיות, פריטים וכו'), ניתן להגדיר גובה מינימלי ומקסימלי דרך קונפיגורציה.

### דוגמה: Tag Widget

```javascript
// הגדרת גובה מותאמת
window.TagWidget.init('tagWidgetContainer', {
  minRows: 1,      // מינימום שורה אחת
  maxRows: 3,      // מקסימום 3 שורות במצב סגור
  rowHeight: 20    // גובה כל שורה בפיקסלים
});
```

### יישום בקוד

```javascript
// 1. הגדר ברירות מחדל
const DEFAULT_CONFIG = {
  minRows: 1,
  maxRows: 3,
  rowHeight: 20
};

// 2. שמור קונפיגורציה ב-state
const state = {
  initialized: false,
  config: { ...DEFAULT_CONFIG }
};

// 3. עדכן קונפיגורציה באתחול
init(containerId = CONTAINER_ID, config = {}) {
  state.config = {
    ...DEFAULT_CONFIG,
    ...config
  };
  
  // 4. החלת הקונפיגורציה דרך CSS variables
  applyHeightConfiguration();
}

// 5. פונקציה להחלת קונפיגורציה
function applyHeightConfiguration() {
  if (!elements.container) return;
  
  const { minRows, maxRows, rowHeight } = state.config;
  const minHeight = minRows * rowHeight;
  const maxHeight = maxRows * rowHeight;
  
  elements.container.style.setProperty('--widget-min-height', `${minHeight}px`);
  elements.container.style.setProperty('--widget-max-height', `${maxHeight}px`);
}
```

### שימוש ב-CSS

```css
/* שימוש ב-CSS variables */
.widget-content {
  min-height: var(--widget-min-height, 20px);
  max-height: var(--widget-max-height, 60px);
  overflow: hidden;
}
```

**דוגמה מלאה:** ראה [Tag Widget Developer Guide](TAG_WIDGET_DEVELOPER_GUIDE.md)

---

## ✅ Best Practices

### 1. שימוש במערכות כלליות

**✅ טוב:**

```javascript
// השתמש ב-FieldRendererService
const formattedAmount = window.FieldRendererService?.renderAmount(value, currency);
const formattedDate = window.FieldRendererService?.renderDate(dateValue);

// השתמש ב-ButtonSystem
if (window.ButtonSystem?.processButtons) {
  window.ButtonSystem.processButtons(container);
}

// השתמש ב-NotificationSystem
window.NotificationSystem?.showError?.('Error message');
```

**❌ רע:**

```javascript
// אל תכתוב פונקציות עיצוב מקומיות
function formatAmount(value) {
  return `$${value.toFixed(2)}`; // Use FieldRendererService instead
}
```

### 2. ניהול State

**✅ טוב:**

```javascript
const state = {
  initialized: false,
  data: null,
  activeTab: 'cloud'
};
```

**❌ רע:**

```javascript
// אל תשתמש ב-globals
window.myWidgetData = null; // Bad
```

### 3. Cache DOM Elements

**✅ טוב:**

```javascript
const elements = {
  container: null,
  button: null
};

function cacheElements() {
  elements.container = document.getElementById(CONTAINER_ID);
  elements.button = elements.container?.querySelector('#myButton');
  return !!elements.container;
}
```

**❌ רע:**

```javascript
// אל תחפש אלמנטים בכל פעם
function render() {
  const container = document.getElementById(CONTAINER_ID); // Bad - search every time
}
```

### 4. Error Handling

**✅ טוב:**

```javascript
try {
  const data = await fetchData();
  render(data);
} catch (error) {
  window.Logger?.error?.('Widget error', { error });
  window.NotificationSystem?.showError?.('Failed to load data');
}
```

### 5. Documentation

**✅ טוב:**

```javascript
/**
 * Widget description
 * 
 * Dependencies:
 * - FieldRendererService
 * - ButtonSystem
 * 
 * Documentation: See documentation/...
 */
```

---

## 📚 דוגמאות מהמערכת

### Recent Trades Widget

**קובץ:** `trading-ui/scripts/widgets/recent-trades-widget.js`

**מאפיינים:**

- Module Pattern (IIFE)
- שימוש ב-FieldRendererService
- פשוט וישיר

### Tag Widget (מאוחד)

**קובץ:** `trading-ui/scripts/widgets/tag-widget.js`

**מאפיינים:**

- Module Pattern (IIFE)
- Bootstrap Tabs (2 טאבים)
- API לשילוב בעמודים נוספים
- State management מלא

**תיעוד:** [TAG_WIDGET_DEVELOPER_GUIDE.md](TAG_WIDGET_DEVELOPER_GUIDE.md)

### History Widget

**קובץ:** `trading-ui/scripts/history-widget.js`

**מאפיינים:**

- Bootstrap Tabs פנימיים
- גרפים (TradingView)
- State management מתקדם

**תיעוד:** [HISTORY_WIDGET_DEVELOPER_GUIDE.md](../../frontend/HISTORY_WIDGET_DEVELOPER_GUIDE.md)

---

## 🔄 Workflow ליצירת ווידג'ט חדש

### 1. תכנון

- בדוק אם יש ווידג'ט דומה קיים
- תכנן את ה-API
- תכנן את ה-HTML structure

### 2. יצירת קובץ

- צור קובץ ב-`trading-ui/scripts/widgets/`
- השתמש בתבנית הבסיסית
- כתוב documentation

### 3. יצירת HTML

- הוסף HTML structure לעמוד
- אם צריך טאבים - השתמש ב-Bootstrap Tabs
- צור קובץ CSS אם נדרש

### 4. אינטגרציה

- עדכן Package Manifest
- עדכן Page Config
- הוסף ל-requiredGlobals

### 5. תיעוד

- עדכן [WIDGETS_LIST.md](../../frontend/WIDGETS_LIST.md)
- יצירת מדריך ספציפי אם נדרש

---

## 📖 תיעוד נוסף

- **רשימת ווידג'טים:** [WIDGETS_LIST.md](../../frontend/WIDGETS_LIST.md)
- **ארכיטקטורה כללית:** [WIDGET_SYSTEM_ARCHITECTURE.md](../../02-ARCHITECTURE/FRONTEND/WIDGET_SYSTEM_ARCHITECTURE.md)
- **מדריך טאבים:** [TAB_SYSTEM_GUIDE.md](../../02-ARCHITECTURE/FRONTEND/TAB_SYSTEM_GUIDE.md)
- **השוואת ארכיטקטורות:** [WIDGET_ARCHITECTURE_COMPARISON.md](WIDGET_ARCHITECTURE_COMPARISON.md)

---

**מקור:** `documentation/03-DEVELOPMENT/GUIDES/WIDGET_DEVELOPER_GUIDE.md`  
**עודכן:** 21 ינואר 2025

