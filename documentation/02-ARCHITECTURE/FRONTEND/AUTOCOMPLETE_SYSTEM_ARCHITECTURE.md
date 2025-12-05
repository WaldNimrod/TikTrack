# ארכיטקטורת מערכת Autocomplete

**תאריך יצירה:** 30 ינואר 2025  
**תאריך עדכון אחרון:** 30 ינואר 2025  
**גרסה:** 1.0.0  
**מטרה:** מסמך ארכיטקטורה מקיף למערכת Autocomplete Service במערכת TikTrack

---

## 📋 תוכן עניינים

1. [סקירה כללית](#סקירה-כללית)
2. [ארכיטקטורה](#ארכיטקטורה)
3. [Positioning System](#positioning-system)
4. [Event Flow](#event-flow)
5. [Integration עם מערכות אחרות](#integration-עם-מערכות-אחרות)
6. [z-index Hierarchy](#z-index-hierarchy)
7. [RTL Support](#rtl-support)
8. [Accessibility](#accessibility)

---

## 🎯 סקירה כללית

מערכת Autocomplete Service היא מערכת כללית לשימוש חוזר המאפשרת הוספת autocomplete לכל input field במערכת. המערכת מספקת:

- **Overlay System**: positioning דינמי עם `position: fixed`
- **State Management**: ניהול instances נפרד לכל input
- **Event Handling**: טיפול מלא במקלדת, עכבר, ומסך מגע
- **Debouncing**: הפחתת קריאות API
- **Custom Rendering**: תמיכה ב-item renderer מותאם

---

## 🏗️ ארכיטקטורה

### Module Pattern (IIFE)

המערכת משתמשת ב-Module Pattern (IIFE) כמו מערכות אחרות במערכת:

```javascript
;(function autocompleteServiceFactory() {
  'use strict';
  
  // Private state
  const instances = new Map();
  
  // Public API
  const AutocompleteService = {
    init: init,
    destroy: destroy,
    show: show,
    hide: hide,
    version: '1.0.0'
  };
  
  window.AutocompleteService = AutocompleteService;
})();
```

### State Management

המערכת משתמשת ב-`Map` לאחסון instances נפרד לכל input element:

```javascript
const instances = new Map(); // Map<inputElement, instance>

// Each instance contains:
{
  config: { /* merged config */ },
  debouncedFetch: Function,
  currentSuggestions: Array,
  selectedIndex: number,
  loading: boolean,
  blurTimeout: number,
  handlers: {
    input: Function,
    focus: Function,
    blur: Function,
    keydown: Function,
    clickOutside: Function
  }
}
```

### Instance Lifecycle

1. **Init**: יצירת instance, הוספת event listeners, אתחול debounced fetch
2. **Active**: טיפול באירועים, fetch suggestions, הצגת overlay
3. **Destroy**: הסרת event listeners, ניקוי timeouts, הסרת overlay

---

## 📍 Positioning System

### Position Calculation

המערכת משתמשת ב-`position: fixed` עם חישוב מיקום יחסי ל-input:

```javascript
function calculatePosition(input, overlay) {
  const inputRect = input.getBoundingClientRect();
  const isRTL = document.documentElement.dir === 'rtl';
  
  // Position below input
  let top = inputRect.bottom + 2;
  let left = inputRect.left;
  
  // Check viewport boundaries
  if (top + overlayHeight > window.innerHeight) {
    // Position above instead
    top = inputRect.top - overlayHeight - 2;
  }
  
  overlay.style.width = `${inputRect.width}px`;
  overlay.style.left = `${left}px`;
  overlay.style.top = `${top}px`;
}
```

### RTL Support

המיקום מתחשב ב-RTL:

- **LTR**: Overlay מיושר לשמאל של ה-input
- **RTL**: Overlay מיושר לימין של ה-input (direction: rtl)

### Viewport Boundaries

המערכת בודקת גבולות viewport:

- אם overlay חורג מלמטה → מעבר מעל ה-input
- אם overlay חורג מלמעלה → מיקום בחלק העליון של ה-viewport
- רוחב Overlay = רוחב Input

---

## 🔄 Event Flow

### Input Event Flow

```
User types → input event
  ↓
debouncedFetch (300ms delay)
  ↓
fetchFunction(query)
  ↓
API call / Data fetch
  ↓
showOverlay(suggestions)
  ↓
renderSuggestions()
  ↓
calculatePosition()
  ↓
Display overlay
```

### Selection Flow

```
User clicks item OR presses Enter
  ↓
onSelect callback
  ↓
Hide overlay
  ↓
Update input value (if needed)
  ↓
Perform action (search, etc.)
```

### Keyboard Navigation Flow

```
User presses ArrowDown/ArrowUp
  ↓
Update selectedIndex
  ↓
Re-render with selected state
  ↓
User presses Enter
  ↓
onSelect callback
```

---

## 🔗 Integration עם מערכות אחרות

### TagService

המערכת משתמשת ב-`TagService.getSuggestions()` ל-fetch של tag suggestions:

```javascript
fetchFunction: async (query) => {
  const result = await window.TagService.getSuggestions({ 
    entityType: 'trade',
    limit: 10 
  });
  return result?.data || [];
}
```

### NotificationSystem

שגיאות מוצגות דרך `NotificationSystem`:

```javascript
if (window.NotificationSystem) {
  window.NotificationSystem.showError('שגיאה בטעינת הצעות');
}
```

### LoggerService

לוגים נשלחים דרך `LoggerService`:

```javascript
window.Logger?.info?.('AutocompleteService: Initialized', { 
  inputId: inputElement.id 
});
```

---

## 📊 z-index Hierarchy

המערכת משתלבת בהיררכיית z-index הקיימת:

- **Modals**: ~1000000000
- **Autocomplete Overlay**: 10000 (default, ניתן להתאמה)
- **Actions Menu**: 9999
- **Tag Widget Hover**: 1050

**החלטה:** 10000 גבוה מספיק מעל actions-menu (9999), ונמוך מספיק מתחת ל-modals כדי לא להסתיר אותם.

---

## 🌐 RTL Support

### Direction Detection

המערכת בודקת את כיוון המסמך:

```javascript
const isRTL = document.documentElement.dir === 'rtl' || 
              getComputedStyle(document.body).direction === 'rtl';
```

### Positioning

- **LTR**: Overlay מיושר לשמאל
- **RTL**: Overlay מיושר לימין, `direction: rtl`, `text-align: right`

### CSS Support

```css
[dir="rtl"] .autocomplete-overlay {
  direction: rtl;
  text-align: right;
}
```

---

## ♿ Accessibility

### ARIA Attributes

המערכת משתמשת ב-ARIA attributes:

- `role="listbox"` על ה-overlay
- `role="option"` על כל item
- `aria-selected` על ה-selected item
- `aria-expanded` על ה-overlay

### Keyboard Navigation

- **ArrowDown**: בחירת suggestion הבא
- **ArrowUp**: בחירת suggestion הקודם
- **Enter**: בחירת ה-selected suggestion
- **Escape**: סגירת ה-overlay
- **Tab**: נווט החוצה מה-overlay

### Screen Reader Support

- ה-overlay מוכרז כ-listbox
- כל item מוכרז כ-option
- ה-selected item מוכרז עם aria-selected

---

## 🎨 Styling Architecture

### CSS Classes

- `.autocomplete-overlay`: Container principal
- `.autocomplete-item`: כל suggestion
- `.autocomplete-item-selected`: ה-selected suggestion
- `.autocomplete-empty`: הודעת "אין הצעות"
- `.autocomplete-loading`: מצב טעינה
- `.autocomplete-error`: מצב שגיאה

### Styling Principles

- **Consistency**: משתמש ב-styling דומה ל-actions-menu
- **RTL**: תמיכה מלאה ב-RTL
- **Responsive**: מותאם לרוחב ה-input
- **Accessibility**: contrast וצבעים נגישים

---

## 🔧 Extension Points

### Custom Item Renderer

ניתן להגדיר `itemRenderer` מותאם:

```javascript
itemRenderer: (item, index) => {
  return `<strong>${item.name}</strong> - ${item.description}`;
}
```

### Custom Filter Function

ניתן להגדיר `filterFunction` מותאם:

```javascript
filterFunction: (suggestions, query) => {
  // Custom filtering logic
  return suggestions.filter(item => 
    customFilterLogic(item, query)
  );
}
```

### Custom Fetch Function

ניתן להגדיר `fetchFunction` מותאם:

```javascript
fetchFunction: async (query) => {
  // Custom fetch logic
  const result = await customAPI.fetch(query);
  return result.items;
}
```

---

## 🔗 קישורים רלוונטיים

- [מדריך מפתח](../03-DEVELOPMENT/GUIDES/AUTOCOMPLETE_SERVICE_GUIDE.md)
- [רשימת מערכות כלליות](../../frontend/GENERAL_SYSTEMS_LIST.md)
- [Tag Widget Developer Guide](../03-DEVELOPMENT/GUIDES/TAG_WIDGET_DEVELOPER_GUIDE.md)







