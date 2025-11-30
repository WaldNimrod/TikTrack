# מדריך מערכת טאבים - Bootstrap Tabs

**תאריך יצירה:** 21 ינואר 2025  
**גרסה:** 1.0.0  
**מטרה:** מדריך מקיף לשימוש ב-Bootstrap Tabs במערכת TikTrack

---

## 📋 תוכן עניינים

1. [סקירה כללית](#סקירה-כללית)
2. [HTML Structure](#html-structure)
3. [JavaScript Events](#javascript-events)
4. [דוגמאות מהמערכת](#דוגמאות-מהמערכת)
5. [Best Practices](#best-practices)
6. [Customization](#customization)

---

## 🎯 סקירה כללית

Bootstrap 5 Tabs הוא הפתרון הסטנדרטי לטאבים במערכת TikTrack. הוא משמש בווידג'טים, מודלים, ועמודים שונים.

**יתרונות:**
- ✅ כבר קיים במערכת (Bootstrap 5)
- ✅ נגישות מובנית
- ✅ תמיכה RTL
- ✅ קל לשימוש
- ✅ תמיכה ב-keyboard navigation

---

## 📝 HTML Structure

### מבנה בסיסי

```html
<!-- Tab Navigation -->
<ul class="nav nav-tabs" id="myTabs" role="tablist">
  <li class="nav-item" role="presentation">
    <button class="nav-link active" 
            id="tab1-tab" 
            data-bs-toggle="tab" 
            data-bs-target="#tab1" 
            type="button" 
            role="tab" 
            aria-controls="tab1" 
            aria-selected="true">
      Tab 1
    </button>
  </li>
  <li class="nav-item" role="presentation">
    <button class="nav-link" 
            id="tab2-tab" 
            data-bs-toggle="tab" 
            data-bs-target="#tab2" 
            type="button" 
            role="tab" 
            aria-controls="tab2" 
            aria-selected="false">
      Tab 2
    </button>
  </li>
</ul>

<!-- Tab Content -->
<div class="tab-content" id="myTabContent">
  <div class="tab-pane fade show active" 
       id="tab1" 
       role="tabpanel" 
       aria-labelledby="tab1-tab">
    <!-- Tab 1 content -->
  </div>
  <div class="tab-pane fade" 
       id="tab2" 
       role="tabpanel" 
       aria-labelledby="tab2-tab">
    <!-- Tab 2 content -->
  </div>
</div>
```

### Classes חשובים

- `nav nav-tabs` - Navigation container
- `nav-item` - כל Tab item
- `nav-link` - כפתור הטאב
- `active` - טאב פעיל
- `tab-content` - Container לתוכן הטאבים
- `tab-pane` - כל פאנל טאב
- `fade` - אנימציית fade
- `show active` - טאב גלוי ופעיל

---

## 🔧 JavaScript Events

### Event Listeners

```javascript
// Listen for tab shown event
const tabElement = document.querySelector('#tab1-tab');
tabElement.addEventListener('shown.bs.tab', (event) => {
  // Tab was shown
  const targetTab = event.target; // The tab button
  const relatedTarget = event.relatedTarget; // Previous tab button
  const targetPane = event.target.getAttribute('data-bs-target'); // #tab1
});

// Listen for tab hidden event
tabElement.addEventListener('hidden.bs.tab', (event) => {
  // Tab was hidden
});
```

### Programmatic Tab Switching

```javascript
// Using Bootstrap Tab API
const tabElement = document.querySelector('#tab2-tab');
const tab = new bootstrap.Tab(tabElement);
tab.show(); // Switch to tab 2
```

---

## 📚 דוגמאות מהמערכת

### 1. Tag Widget

**קובץ:** `trading-ui/scripts/widgets/tag-widget.js`  
**HTML:** `trading-ui/index.html`

**מאפיינים:**
- 2 טאבים: ענן תגיות + חיפוש מהיר
- Event listeners לטאב switching
- State management (`activeTab`)

```javascript
// Tab switching
if (elements.cloudTab) {
  elements.cloudTab.addEventListener('shown.bs.tab', () => {
    state.activeTab = 'cloud';
  });
}
```

### 2. ModalManagerV2 - generateTabsHTML

**קובץ:** `trading-ui/scripts/modal-manager-v2.js`

**מאפיינים:**
- Function ליצירת HTML של טאבים
- תמיכה ב-tabs configuration

```javascript
generateTabsHTML(tabs, modalId) {
  // Creates Bootstrap tabs HTML from config
}
```

### 3. History Widget

**קובץ:** `trading-ui/scripts/history-widget.js`

**מאפיינים:**
- טאבים פנימיים בווידג'ט
- Custom tab switching logic
- טעינת נתונים לפי טאב פעיל

---

## ✅ Best Practices

### 1. תמיד השתמש ב-Bootstrap Tabs

**✅ טוב:**
```html
<ul class="nav nav-tabs">
  <!-- Bootstrap tabs -->
</ul>
```

**❌ רע:**
```html
<!-- אל תצור tabs מותאמים אישית -->
<div class="custom-tabs">
  <!-- Custom implementation -->
</div>
```

### 2. שימוש נכון ב-Attributes

**חובה לכל טאב:**
- `data-bs-toggle="tab"` - מפעיל Bootstrap tabs
- `data-bs-target="#paneId"` - מציין את ה-pane target
- `role="tab"` / `role="tabpanel"` - נגישות
- `aria-controls` - קשר בין tab ל-pane
- `aria-selected` - מצב פעיל

### 3. State Management

**✅ טוב:**
```javascript
const state = {
  activeTab: 'cloud'
};

// Update state on tab change
tab.addEventListener('shown.bs.tab', () => {
  state.activeTab = 'search';
});
```

### 4. Lazy Loading

אם תוכן הטאב כבד, טען אותו רק כשהטאב נפתח:

```javascript
tab.addEventListener('shown.bs.tab', async () => {
  if (!state.tabLoaded) {
    await loadTabData();
    state.tabLoaded = true;
  }
});
```

---

## 🎨 Customization

### CSS Customization

```css
/* Custom tab styles */
.nav-tabs .nav-link {
  color: var(--text-muted, #6c757d);
  border-bottom: 2px solid transparent;
}

.nav-tabs .nav-link:hover {
  color: var(--brand-primary-color, #26baac);
  border-bottom-color: var(--brand-primary-light, #6ed8ca);
}

.nav-tabs .nav-link.active {
  color: var(--brand-primary-color, #26baac);
  border-bottom-color: var(--brand-primary-color, #26baac);
}
```

---

## 📖 תיעוד נוסף

- **רשימת ווידג'טים:** [WIDGETS_LIST.md](../../frontend/WIDGETS_LIST.md)
- **מדריך יצירת ווידג'טים:** [WIDGET_DEVELOPER_GUIDE.md](../../03-DEVELOPMENT/GUIDES/WIDGET_DEVELOPER_GUIDE.md)
- **Tag Widget:** [TAG_WIDGET_DEVELOPER_GUIDE.md](../../03-DEVELOPMENT/GUIDES/TAG_WIDGET_DEVELOPER_GUIDE.md)

---

**מקור:** `documentation/02-ARCHITECTURE/FRONTEND/TAB_SYSTEM_GUIDE.md`  
**עודכן:** 21 ינואר 2025

