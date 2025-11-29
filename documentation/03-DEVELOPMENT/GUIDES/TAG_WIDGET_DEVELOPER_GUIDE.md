# Tag Widget Developer Guide - ווידג'ט תגיות מאוחד

**תאריך יצירה:** 21 ינואר 2025  
**גרסה:** 1.0.0  
**מטרה:** מדריך מפתח מקיף לווידג'ט תגיות מאוחד (ענן תגיות + חיפוש מהיר)

---

## 📋 תוכן עניינים

1. [סקירה כללית](#סקירה-כללית)
2. [ארכיטקטורה](#ארכיטקטורה)
3. [API](#api)
4. [שילוב בעמודים נוספים](#שילוב-בעמודים-נוספים)
5. [Customization](#customization)
6. [דוגמאות קוד](#דוגמאות-קוד)

---

## 🎯 סקירה כללית

**Tag Widget** הוא ווידג'ט מאוחד המשלב שתי פונקציונליות:
- **ענן תגיות** - הצגת תגיות לפי עוצמת שימוש עם סולם צבעים
- **חיפוש מהיר** - חיפוש תגיות לפי שם וישות

**מאפיינים:**
- ✅ Bootstrap Tabs (2 טאבים)
- ✅ Module Pattern (IIFE)
- ✅ אינטגרציה עם TagService
- ✅ שימוש ב-ModalManagerV2 לתוצאות חיפוש
- ✅ סולם צבעים לפי usage_count
- ✅ גובה 3 שורות במצב סגור עם הרחבה על hover

**קבצים:**
- **JavaScript:** `trading-ui/scripts/widgets/tag-widget.js`
- **CSS:** `trading-ui/styles-new/06-components/_tag-widget.css`

---

## 🏗️ ארכיטקטורה

### Module Pattern (IIFE)

הווידג'ט משתמש ב-Module Pattern (IIFE) תואם לווידג'טים הקיימים:

```javascript
;(function () {
  'use strict';
  
  // Constants, State, Elements...
  
  const TagWidget = {
    init() { /* ... */ },
    render(data) { /* ... */ },
    version: '1.0.0'
  };
  
  window.TagWidget = TagWidget;
})();
```

### Bootstrap Tabs

הווידג'ט משתמש ב-Bootstrap 5 Tabs לניווט בין 2 טאבים:
- **ענן תגיות** (Cloud Tab)
- **חיפוש מהיר** (Search Tab)

**תיעוד טאבים:** ראה [TAB_SYSTEM_GUIDE.md](../../02-ARCHITECTURE/FRONTEND/TAB_SYSTEM_GUIDE.md)

---

## 🔌 API

### `TagWidget.init(containerId, config)`

מאתחל את הווידג'ט.

**Parameters:**
- `containerId` (string, optional) - מזהה קונטיינר (ברירת מחדל: `'tagWidgetContainer'`)
- `config` (object, optional) - תצורת אתחול
  - `config.defaultTab` (string) - טאב פעיל ברירת מחדל (`'cloud'` או `'search'`)

**Example:**
```javascript
// אתחול ברירת מחדל
window.TagWidget.init();

// אתחול עם טאב חיפוש פעיל
window.TagWidget.init('tagWidgetContainer', {
  defaultTab: 'search'
});
```

### `TagWidget.render(data)`

מעדכן את הווידג'ט עם נתונים חדשים.

**Parameters:**
- `data` (object, optional) - נתונים לעדכון
  - `data.tags` (array) - רשימת תגיות לעדכון ענן

**Example:**
```javascript
window.TagWidget.render({
  tags: [
    { tag_id: 1, name: 'אסטרטגיה', usage_count: 10 },
    { tag_id: 2, name: 'מניית צמיחה', usage_count: 5 }
  ]
});
```

### `TagWidget.refreshTagCloud(options)`

מרענן את ענן התגיות.

**Parameters:**
- `options` (object, optional) - אופציות רענון
  - `options.force` (boolean) - כפיית טעינה מחדש (ברירת מחדל: `false`)

**Example:**
```javascript
// רענון רגיל
await window.TagWidget.refreshTagCloud();

// כפיית טעינה מחדש
await window.TagWidget.refreshTagCloud({ force: true });
```

### `TagWidget.destroy()`

מנקה את הווידג'ט.

**Example:**
```javascript
window.TagWidget.destroy();
```

---

## 🔗 שילוב בעמודים נוספים

### 1. HTML Structure

הוסף את מבנה ה-HTML לעמוד:

```html
<div class="card h-100" id="tagWidgetContainer">
  <div class="card-header">
    <h5>תגיות</h5>
  </div>
  <div class="card-body">
    <!-- Bootstrap Tabs -->
    <ul class="nav nav-tabs" id="tagWidgetTabs" role="tablist">
      <li class="nav-item" role="presentation">
        <button class="nav-link active" 
                id="tagWidgetCloudTab" 
                data-bs-toggle="tab" 
                data-bs-target="#tagWidgetCloudPane" 
                type="button" 
                role="tab">
          ענן תגיות
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button class="nav-link" 
                id="tagWidgetSearchTab" 
                data-bs-toggle="tab" 
                data-bs-target="#tagWidgetSearchPane" 
                type="button" 
                role="tab">
          חיפוש מהיר
        </button>
      </li>
    </ul>

    <!-- Tab Content -->
    <div class="tab-content" id="tagWidgetTabContent">
      <!-- Cloud Tab -->
      <div class="tab-pane fade show active" id="tagWidgetCloudPane" role="tabpanel">
        <!-- Cloud content -->
      </div>
      
      <!-- Search Tab -->
      <div class="tab-pane fade" id="tagWidgetSearchPane" role="tabpanel">
        <!-- Search content -->
      </div>
    </div>
  </div>
</div>
```

**ראה את המבנה המלא ב-** `trading-ui/index.html`

### 2. CSS

וודא שה-CSS נטען:

```html
<!-- ה-CSS נטען אוטומטית דרך master.css -->
```

או הוסף ישירות:

```html
<link rel="stylesheet" href="styles-new/06-components/_tag-widget.css?v=1.0.0">
```

### 3. JavaScript

**Option A: דרך Package Manifest (מומלץ)**

הוסף ל-`package-manifest.js`:

```javascript
'my-package': {
  scripts: [
    {
      file: 'widgets/tag-widget.js',
      globalCheck: 'window.TagWidget',
      required: true
    }
  ]
}
```

**Option B: טעינה ישירה**

```html
<script src="scripts/widgets/tag-widget.js?v=1.0.0"></script>
```

### 4. אתחול

```javascript
// בעמוד
document.addEventListener('DOMContentLoaded', () => {
  if (window.TagWidget) {
    window.TagWidget.init('tagWidgetContainer', {
      defaultTab: 'cloud'
    });
  }
});
```

---

## 🎨 Customization

### סולם צבעים

סולם הצבעים מוגדר ב-`_badges-status.css`:

```css
/* Tier 1: שימוש גבוה מאוד (75%+) */
button[data-tier="1"] {
  border-color: var(--brand-primary-dark, #1a8f83);
}

/* Tier 2: שימוש גבוה (50-75%) */
button[data-tier="2"] {
  border-color: var(--brand-primary-color, #26baac);
}

/* Tier 3: שימוש בינוני (30-50%) */
button[data-tier="3"] {
  border-color: var(--brand-primary-light, #6ed8ca);
}

/* Tier 4: שימוש נמוך (<30%) */
button[data-tier="4"] {
  border-color: var(--text-muted, #6c757d);
}
```

### גובה ענן תגיות

```css
#tagWidgetCloudContainer {
  max-height: 60px; /* 3 שורות במצב סגור */
}

#tagWidgetCloudContainer:hover {
  max-height: 1000px; /* הרחבה על hover */
}
```

---

## 💻 דוגמאות קוד

### דוגמה 1: אתחול בסיסי

```javascript
// בעמוד הבית - אוטומטי דרך page-initialization-configs.js
window.TagWidget.init();
```

### דוגמה 2: אתחול עם תצורה

```javascript
window.TagWidget.init('customContainer', {
  defaultTab: 'search'
});
```

### דוגמה 3: עדכון תגיות

```javascript
// לאחר טעינת תגיות
const tags = await window.TagService.getTagCloudData();
window.TagWidget.render({ tags });
```

### דוגמה 4: רענון כפוי

```javascript
// לאחר פעולה שמשנה תגיות
await window.TagWidget.refreshTagCloud({ force: true });
```

---

## 🔧 תלויות

### מערכות כלליות

- **TagService** (`window.TagService`) - שירות תגיות
  - `getTagCloudData()` - טעינת ענן תגיות
  - `searchTags()` - חיפוש תגיות

- **ModalManagerV2** (`window.ModalManagerV2`) - הצגת תוצאות חיפוש
  - `showModal('tagSearchDrawer', 'view')` - פתיחת drawer

- **ButtonSystem** (`window.ButtonSystem`) - עיבוד כפתורי תגיות
  - `processButtons()` - עיבוד כפתורים

- **FieldRendererService** (`window.FieldRendererService`) - עיצוב תגיות
  - `renderTagBadges()` - רינדור תגיות

### Packages

הווידג'ט נטען דרך החבילה `dashboard-widgets`:
- `base`
- `services`
- `entity-services`

---

## 📖 תיעוד נוסף

- **רשימת ווידג'טים:** [WIDGETS_LIST.md](../../frontend/WIDGETS_LIST.md)
- **מדריך יצירת ווידג'טים:** [WIDGET_DEVELOPER_GUIDE.md](WIDGET_DEVELOPER_GUIDE.md)
- **מדריך טאבים:** [TAB_SYSTEM_GUIDE.md](../../02-ARCHITECTURE/FRONTEND/TAB_SYSTEM_GUIDE.md)
- **ארכיטקטורת ווידג'טים:** [WIDGET_SYSTEM_ARCHITECTURE.md](../../02-ARCHITECTURE/FRONTEND/WIDGET_SYSTEM_ARCHITECTURE.md)

---

**מקור:** `documentation/03-DEVELOPMENT/GUIDES/TAG_WIDGET_DEVELOPER_GUIDE.md`  
**עודכן:** 21 ינואר 2025

