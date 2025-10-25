# Notification System - API Reference

## Overview
מערכת התראות מרכזית לפרויקט TikTrack עם 4 מצבי עבודה ו-6 קטגוריות התראות.

## API Functions

### Core Notification Functions

#### `showNotification(message, type, category, options)`
הצגת התראה בסיסית

**Parameters:**
- `message` (string) - הודעת ההתראה
- `type` (string) - סוג ההתראה: `success`, `error`, `warning`, `info`
- `category` (string, optional) - קטגוריית ההתראה: `system`, `business`, `development`, `performance`, `ui`, `security`
- `options` (object, optional) - אפשרויות נוספות

**Returns:** `void`

**Example:**
```javascript
// Basic notification
showNotification('הנתונים נשמרו בהצלחה', 'success', 'business');

// With options
showNotification('שגיאה בטעינת נתונים', 'error', 'system', {
  duration: 5000,
  persistent: true
});
```

#### `showSuccessNotification(message, category, options)`
הצגת הודעת הצלחה

**Parameters:**
- `message` (string) - הודעת ההצלחה
- `category` (string, optional) - קטגוריית ההתראה
- `options` (object, optional) - אפשרויות נוספות

**Returns:** `void`

#### `showErrorNotification(message, category, options)`
הצגת הודעת שגיאה

**Parameters:**
- `message` (string) - הודעת השגיאה
- `category` (string, optional) - קטגוריית ההתראה
- `options` (object, optional) - אפשרויות נוספות

**Returns:** `void`

#### `showWarningNotification(message, category, options)`
הצגת הודעת אזהרה

**Parameters:**
- `message` (string) - הודעת האזהרה
- `category` (string, optional) - קטגוריית ההתראה
- `options` (object, optional) - אפשרויות נוספות

**Returns:** `void`

#### `showInfoNotification(message, category, options)`
הצגת הודעת מידע

**Parameters:**
- `message` (string) - הודעת המידע
- `category` (string, optional) - קטגוריית ההתראה
- `options` (object, optional) - אפשרויות נוספות

**Returns:** `void`

### Notification Modes

#### `setNotificationMode(mode)`
הגדרת מצב התראות

**Parameters:**
- `mode` (string) - מצב התראות: `debug`, `development`, `work`, `silent`

**Returns:** `void`

**Example:**
```javascript
// Set to work mode (only errors and user actions)
setNotificationMode('work');

// Set to debug mode (all notifications)
setNotificationMode('debug');
```

#### `getCurrentNotificationMode()`
קבלת מצב התראות נוכחי

**Returns:** `string` - מצב התראות נוכחי

### Category Management

#### `getCategorySeverity(category)`
קבלת רמות חשיבות לקטגוריה

**Parameters:**
- `category` (string) - קטגוריית ההתראה

**Returns:** `object` - אובייקט עם primary ו-secondary arrays

### Global Confirm Replacement

#### `showConfirmDialog(message, title, options)`
הצגת דיאלוג אישור מותאם אישית

**Parameters:**
- `message` (string) - הודעת האישור
- `title` (string, optional) - כותרת הדיאלוג
- `options` (object, optional) - אפשרויות נוספות

**Returns:** `Promise<boolean>` - true אם המשתמש אישר, false אחרת

**Example:**
```javascript
// Basic confirmation
const confirmed = await showConfirmDialog('האם למחוק את הפריט?');

// With title and options
const confirmed = await showConfirmDialog(
  'האם למחוק את הפריט?',
  'אישור מחיקה',
  {
    confirmText: 'מחק',
    cancelText: 'ביטול',
    type: 'warning'
  }
);
```

## Configuration

### Notification Modes
```javascript
const NOTIFICATION_MODES = {
  DEBUG: {
    name: 'debug',
    title: 'מצב דיבג',
    description: 'הצגת כל ההתראות המפורטות כולל הודעות משניות',
    icon: 'fas fa-bug',
    color: '#6c757d'
  },
  DEVELOPMENT: {
    name: 'development',
    title: 'מצב פיתוח',
    description: 'הצגת הודעות מרכזיות בלבד',
    icon: 'fas fa-code',
    color: '#6f42c1'
  },
  WORK: {
    name: 'work',
    title: 'מצב עבודה',
    description: 'הצגת הודעות שגיאה והודעות שהם תוצאה של פעולות ותהליכים שהמשתמש הריץ',
    icon: 'fas fa-briefcase',
    color: '#28a745'
  },
  SILENT: {
    name: 'silent',
    title: 'מצב מושתק',
    description: 'הצגת הודעות שגיאה בלבד',
    icon: 'fas fa-volume-mute',
    color: '#dc3545'
  }
};
```

### Category Severity
```javascript
const CATEGORY_SEVERITY = {
  system: { 
    primary: ['error'], 
    secondary: ['warning', 'info'] 
  },
  business: { 
    primary: ['success', 'error'], 
    secondary: ['info'] 
  },
  development: { 
    primary: [], 
    secondary: ['all'] 
  },
  performance: { 
    primary: ['error', 'warning'], 
    secondary: ['info'] 
  },
  ui: { 
    primary: [], 
    secondary: ['all'] 
  },
  security: {
    primary: ['error', 'warning'],
    secondary: ['info']
  }
};
```

## Usage Examples

### Basic Usage
```javascript
// Success notification
showSuccessNotification('הנתונים נשמרו בהצלחה', 'business');

// Error notification
showErrorNotification('שגיאה בטעינת נתונים', 'system');

// Warning notification
showWarningNotification('הנתונים לא עודכנו', 'business');

// Info notification
showInfoNotification('טעינת נתונים...', 'system');
```

### Advanced Usage
```javascript
// With custom options
showNotification('שגיאה חמורה', 'error', 'system', {
  duration: 0, // Persistent
  persistent: true,
  showCloseButton: true
});

// Set notification mode
setNotificationMode('work'); // Only show errors and user actions

// Custom confirm dialog
const confirmed = await showConfirmDialog(
  'האם למחוק את הפריט?',
  'אישור מחיקה',
  {
    confirmText: 'מחק',
    cancelText: 'ביטול',
    type: 'warning'
  }
);
```

### Error Handling
```javascript
try {
  const data = await fetchData();
  showSuccessNotification('נתונים נטענו בהצלחה', 'business');
} catch (error) {
  showErrorNotification('שגיאה בטעינת נתונים: ' + error.message, 'system');
}
```

## Best Practices

1. **Use appropriate categories:**
   - `system` - שגיאות מערכת
   - `business` - פעולות עסקיות
   - `development` - הודעות פיתוח
   - `performance` - בעיות ביצועים
   - `ui` - בעיות ממשק
   - `security` - בעיות אבטחה

2. **Set appropriate notification mode:**
   - `work` - למשתמשים רגילים
   - `development` - למפתחים
   - `debug` - לדיבג
   - `silent` - למצבים שקטים

3. **Handle errors gracefully:**
   ```javascript
   try {
     // Your code
   } catch (error) {
     showErrorNotification('שגיאה: ' + error.message, 'system');
   }
   ```

## Dependencies
- Bootstrap 5.3.0 (for modal functionality)
- linked-items.js (for modal display functions)

## File Location
`trading-ui/scripts/notification-system.js`

## Version
3.1 (Last updated: January 2025)
