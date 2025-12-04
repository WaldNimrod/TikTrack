# מדריך מפתח - Autocomplete Service

**תאריך יצירה:** 30 ינואר 2025  
**תאריך עדכון אחרון:** 30 ינואר 2025  
**גרסה:** 1.0.0  
**מטרה:** מדריך מקיף לשימוש במערכת Autocomplete Service במערכת TikTrack

> **⚠️ חשוב:** זהו מערכת כללית לשימוש חוזר במערכת TikTrack. כל autocomplete חדש **חייב** להשתמש במערכת זו.

---

## 🚀 Quick Start - למפתחים חדשים

### שלבים ראשונים

1. **קרא את המדריך** - הכר את ה-API והאפשרויות
2. **השתמש בדוגמה** - העתק את הדוגמה הבסיסית מהמדריך
3. **התאם אישית** - התאם את ה-config לצרכים שלך
4. **בדוק** - בדוק שהכל עובד עם keyboard navigation

### נקודות מפתח

- **ארכיטקטורה:** Module Pattern (IIFE) - מערכת כללית
- **Display:** Overlay עם position: fixed
- **z-index:** 10000 (גבוה מ-actions-menu, נמוך מ-modals)
- **Event Handling:** click outside, ESC key, keyboard navigation

### קבצים חשובים

- **המדריך:** `documentation/03-DEVELOPMENT/GUIDES/AUTOCOMPLETE_SERVICE_GUIDE.md`
- **ארכיטקטורה:** `documentation/02-ARCHITECTURE/FRONTEND/AUTOCOMPLETE_SYSTEM_ARCHITECTURE.md`
- **קובץ Service:** `trading-ui/scripts/services/autocomplete-service.js`
- **סגנונות:** `trading-ui/styles-new/06-components/_autocomplete.css`
- **דוגמה:** `trading-ui/scripts/widgets/tag-widget.js` - `initAutocomplete()`

---

## 📋 תוכן עניינים

1. [סקירה כללית](#סקירה-כללית)
2. [API Reference](#api-reference)
3. [Config Options](#config-options)
4. [Event Handling](#event-handling)
5. [Custom Rendering](#custom-rendering)
6. [דוגמאות שימוש](#דוגמאות-שימוש)
7. [Best Practices](#best-practices)

---

## 🎯 סקירה כללית

Autocomplete Service הוא מערכת כללית לשימוש חוזר המאפשרת הוספת autocomplete לכל input field במערכת. המערכת תומכת ב:

- **Suggestions Overlay**: overlay מעל התוכן עם positioning דינמי
- **Debouncing**: הפחתת קריאות API (default: 300ms)
- **Keyboard Navigation**: Arrow keys, Enter, ESC
- **Custom Rendering**: תמיכה ב-item renderer מותאם
- **RTL Support**: תמיכה מלאה ב-RTL
- **Accessibility**: תמיכה במקלדת וקוראי מסך

---

## 📚 API Reference

### `AutocompleteService.init(inputElement, config)`

אתחול autocomplete על input element.

**Parameters:**
- `inputElement` (HTMLElement): Input element לאתחול autocomplete
- `config` (Object): אובייקט קונפיגורציה (ראה [Config Options](#config-options))

**Example:**
```javascript
const input = document.getElementById('myInput');
window.AutocompleteService.init(input, {
  fetchFunction: async (query) => {
    // Fetch suggestions
    const result = await fetch('/api/suggestions?q=' + query);
    return result.json();
  },
  minChars: 2,
  maxSuggestions: 10,
  onSelect: (item) => {
    console.log('Selected:', item);
  }
});
```

### `AutocompleteService.destroy(inputElement)`

הרס autocomplete instance והסרת event listeners.

**Parameters:**
- `inputElement` (HTMLElement): Input element להרס autocomplete

**Example:**
```javascript
const input = document.getElementById('myInput');
window.AutocompleteService.destroy(input);
```

### `AutocompleteService.show(inputElement, suggestions)`

הצגת suggestions ידנית.

**Parameters:**
- `inputElement` (HTMLElement): Input element
- `suggestions` (Array): מערך של suggestions להצגה

**Example:**
```javascript
const input = document.getElementById('myInput');
window.AutocompleteService.show(input, [
  { name: 'Option 1', id: 1 },
  { name: 'Option 2', id: 2 }
]);
```

### `AutocompleteService.hide(inputElement)`

הסתרת autocomplete overlay.

**Parameters:**
- `inputElement` (HTMLElement): Input element

**Example:**
```javascript
const input = document.getElementById('myInput');
window.AutocompleteService.hide(input);
```

---

## ⚙️ Config Options

### `fetchFunction` (required)

פונקציה שמחזירה Promise עם suggestions.

**Type:** `Function(query: string) => Promise<Array>`

**Parameters:**
- `query` (string): הערך הנוכחי של ה-input

**Returns:** Promise שמחזיר מערך של suggestions

**Example:**
```javascript
fetchFunction: async (query) => {
  const result = await window.TagService.getSuggestions({ 
    entityType: 'trade',
    limit: 10 
  });
  return result?.data || [];
}
```

### `minChars` (optional)

מינימום תווים להצגת suggestions.

**Type:** `number`  
**Default:** `0`

**Example:**
```javascript
minChars: 2 // Show suggestions only after 2 characters
```

### `maxSuggestions` (optional)

מקסימום suggestions להצגה.

**Type:** `number`  
**Default:** `10`

**Example:**
```javascript
maxSuggestions: 20 // Show up to 20 suggestions
```

### `itemRenderer` (optional)

פונקציה לרינדור מותאם של כל item. אם לא מסופק, משתמש בערך ברירת מחדל (item.name או item.label).

**Type:** `Function(item: Object, index: number) => string`

**Parameters:**
- `item` (Object): ה-item לרינדור
- `index` (number): האינדקס של ה-item

**Returns:** HTML string (חייב להיות HTML בטוח - המערכת לא עושה escape)

**Example:**
```javascript
itemRenderer: (tag, index) => {
  const usageText = tag.usage_count ? `${tag.usage_count} שיוכים` : '';
  const categoryText = tag.category_name ? ` • ${tag.category_name}` : '';
  return `${tag.name}${usageText ? ` • ${usageText}` : ''}${categoryText}`;
}
```

### `onSelect` (optional)

Callback שנקרא כאשר נבחר item.

**Type:** `Function(item: Object, index: number) => void`

**Parameters:**
- `item` (Object): ה-item שנבחר
- `index` (number): האינדקס של ה-item

**Example:**
```javascript
onSelect: (tag) => {
  inputElement.value = tag.name;
  performSearch(tag.name);
}
```

### `filterFunction` (optional)

פונקציה לסינון suggestions לפי query. אם לא מסופק, לא מתבצע סינון.

**Type:** `Function(suggestions: Array, query: string) => Array`

**Parameters:**
- `suggestions` (Array): מערך ה-suggestions המקורי
- `query` (string): הערך הנוכחי של ה-input

**Returns:** מערך מסונן של suggestions

**Example:**
```javascript
filterFunction: (suggestions, query) => {
  if (!query || !query.trim()) {
    return suggestions;
  }
  const queryLower = query.trim().toLowerCase();
  return suggestions.filter(tag => 
    tag.name && tag.name.toLowerCase().includes(queryLower)
  );
}
```

### `debounceDelay` (optional)

עיכוב debounce במילישניות.

**Type:** `number`  
**Default:** `300`

**Example:**
```javascript
debounceDelay: 500 // Wait 500ms before fetching
```

### `zIndex` (optional)

z-index של ה-overlay.

**Type:** `number`  
**Default:** `10000`

**Example:**
```javascript
zIndex: 10500 // Higher z-index if needed
```

---

## 🎹 Event Handling

המערכת מטפלת באירועים הבאים אוטומטית:

### Input Event
- **Trigger:** כאשר המשתמש מקליד ב-input
- **Action:** Debounced fetch של suggestions (אם יש מספיק תווים)

### Focus Event
- **Trigger:** כאשר ה-input מקבל focus
- **Action:** הצגת suggestions אם יש query (או אם minChars = 0)

### Blur Event
- **Trigger:** כאשר ה-input מאבד focus
- **Action:** הסתרת overlay (עם delay של 200ms כדי לאפשר click על suggestions)

### Keydown Event
- **ArrowDown**: בחירת suggestion הבא
- **ArrowUp**: בחירת suggestion הקודם
- **Enter**: בחירת ה-selected suggestion
- **Escape**: סגירת ה-overlay

### Click Outside
- **Trigger:** לחיצה מחוץ ל-input וה-overlay
- **Action:** סגירת ה-overlay

---

## 🎨 Custom Rendering

### Item Renderer

ה-`itemRenderer` מאפשר לך ליצור רינדור מותאם לכל suggestion. הפונקציה מקבלת את ה-item ואת האינדקס, ומחזירה HTML string.

**⚠️ חשוב:** ה-HTML שחוזר מה-`itemRenderer` לא עובר escape אוטומטי. עליך לוודא שהתוכן בטוח (או להשתמש ב-escapeHtml).

**Example:**
```javascript
itemRenderer: (tag) => {
  // Escape HTML to prevent XSS
  const escapeHtml = (text) => {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };
  
  const name = escapeHtml(tag.name || '');
  const usageText = tag.usage_count ? ` • ${escapeHtml(String(tag.usage_count))} שיוכים` : '';
  const categoryText = tag.category_name ? ` • ${escapeHtml(tag.category_name)}` : '';
  return `${name}${usageText}${categoryText}`;
}
```

---

## 📖 דוגמאות שימוש

### דוגמה 1: Tag Suggestions (Tag Widget)

```javascript
window.AutocompleteService.init(inputElement, {
  fetchFunction: async (query) => {
    const entityType = filterElement?.value || null;
    const result = await window.TagService.getSuggestions({ 
      entityType, 
      limit: 10,
      force: false 
    });
    return result?.data || [];
  },
  minChars: 0,
  maxSuggestions: 10,
  itemRenderer: (tag) => {
    const escapeHtml = (text) => {
      if (!text) return '';
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    };
    const name = escapeHtml(tag.name || '');
    const usageText = tag.usage_count ? ` • ${escapeHtml(String(tag.usage_count))} שיוכים` : '';
    const categoryText = tag.category_name ? ` • ${escapeHtml(tag.category_name)}` : '';
    return `${name}${usageText}${categoryText}`;
  },
  onSelect: (tag) => {
    inputElement.value = tag.name || '';
    performSearch(tag.name);
  },
  filterFunction: (suggestions, query) => {
    if (!query || !query.trim()) {
      return suggestions;
    }
    const queryLower = query.trim().toLowerCase();
    return suggestions.filter(tag => 
      tag.name && tag.name.toLowerCase().includes(queryLower)
    );
  }
});
```

### דוגמה 2: Ticker Suggestions (עתידית)

```javascript
window.AutocompleteService.init(tickerInput, {
  fetchFunction: async (query) => {
    const result = await window.TickerService.searchTickers(query);
    return result || [];
  },
  minChars: 1,
  maxSuggestions: 15,
  itemRenderer: (ticker) => {
    return `${ticker.symbol} - ${ticker.name}`;
  },
  onSelect: (ticker) => {
    tickerInput.value = ticker.symbol;
    selectTicker(ticker);
  }
});
```

---

## ✅ Best Practices

### Debouncing
- השתמש ב-debouncing כדי להפחית קריאות API
- Default: 300ms - מתאים לרוב המקרים
- הגדל ל-500ms אם ה-API איטי

### Error Handling
- המערכת מטפלת בשגיאות אוטומטית
- הצג הודעת שגיאה למשתמש דרך `NotificationSystem`
- חזור מערך ריק במקרה של שגיאה

### Performance
- הגבל את מספר ה-suggestions (default: 10)
- השתמש ב-caching דרך Service layers
- אל תבצע fetch אם אין מספיק תווים

### Accessibility
- המערכת תומכת במקלדת אוטומטית
- ה-overlay כולל `role="listbox"` ו-`aria-selected`
- וודא שה-`itemRenderer` מחזיר תוכן נגיש

### Security
- אם אתה משתמש ב-`itemRenderer`, וודא HTML escaping
- אל תכניס user input ישירות ל-HTML ללא escaping
- השתמש ב-`escapeHtml` helper אם צריך

### RTL Support
- המערכת תומכת ב-RTL אוטומטית
- המיקום מתואם ל-RTL
- הטקסט מיושר נכון אוטומטית

---

## 🔗 קישורים רלוונטיים

- [ארכיטקטורה](AUTOCOMPLETE_SYSTEM_ARCHITECTURE.md)
- [רשימת מערכות כלליות](../../frontend/GENERAL_SYSTEMS_LIST.md)
- [Tag Widget Developer Guide](TAG_WIDGET_DEVELOPER_GUIDE.md)





