# מדריך מערכת צבעים דינמית - TikTrack

## 📋 תוכן עניינים

- [מבוא](#מבוא)
- [ארכיטקטורת המערכת](#ארכיטקטורת-המערכת)
- [מבנה הצבעים](#מבנה-הצבעים)
- [API של הצבעים](#api-של-הצבעים)
- [טעינה דינמית](#טעינה-דינמית)
- [עדכון בזמן אמת](#עדכון-בזמן-אמת)
- [ערכות נושא](#ערכות-נושא)
- [צבעי ישויות](#צבעי-ישויות)
- [צבעי סטטוס](#צבעי-סטטוס)
- [בדיקות ואימות](#בדיקות-ואימות)
- [דוגמאות קוד](#דוגמאות-קוד)

---

## מבוא

מערכת הצבעים הדינמית של TikTrack מאפשרת התאמה אישית של צבעים לכל משתמש, עם שמירה ב-API ועדכון בזמן אמת. המערכת מבוססת על CSS Custom Propertiesממשקת עם מערכת ההעדפות.

### למה מערכת צבעים דינמית?

1. **התאמה אישית** - כל משתמש יכול להתאים את הצבעים לטעמו
2. **עקביות** - צבעים אחידים בכל האתר
3. **גמישות** - קל להוסיף צבעים חדשים או לשנות קיימים
4. **ביצועים** - עדכון מהיר ללא טעינה מחדש של הדף
5. **נגישות** - תמיכה בערכות נושא לנגישות

### עקרונות המערכת

- **CSS Custom Properties** - כל הצבעים מוגדרים כמשתנים
- **API Integration** - שמירה וטעינה מ-API
- **Fallback Values** - ערכי ברירת מחדל לכל צבע
- **Real-time Updates** - עדכון מיידי של הצבעים
- **Theme Support** - תמיכה בערכות נושא שונות

---

## ארכיטקטורת המערכת

### מבנה כללי

```
Frontend (CSS Variables) ←→ API (Preferences) ←→ Database (User Settings)
```

### רכיבי המערכת

1. **CSS Variables** - הגדרת הצבעים ב-CSS
2. **JavaScript API** - טעינה ושמירה של צבעים
3. **Backend API** - ניהול העדפות משתמש
4. **Database** - אחסון העדפות משתמש
5. **UI Controls** - ממשק לעדכון צבעים

### זרימת הנתונים

```
1. טעינת דף → טעינת צבעים מ-API
2. עדכון צבע → עדכון CSS Variable + שמירה ב-API
3. שינוי משתמש → טעינת צבעים חדשים
4. שינוי ערכת נושא → עדכון כל הצבעים
```

---

## מבנה הצבעים

### 1. צבעים בסיסיים

```css
/* 01-settings/_colors-dynamic.css */
:root {
  /* צבעים דינמיים - נטענים מ-API */
  --color-primary: var(--user-primary-color, #29a6a8);
  --color-secondary: var(--user-secondary-color, #ff9c05);
  --color-success: var(--user-success-color, #28a745);
  --color-danger: var(--user-danger-color, #dc3545);
  --color-warning: var(--user-warning-color, #ffc107);
  --color-info: var(--user-info-color, #007bff);
  
  /* צבעי רקע דינמיים */
  --color-bg-primary: var(--user-bg-primary-color, #ffffff);
  --color-bg-secondary: var(--user-bg-secondary-color, #f8f9fa);
  --color-bg-tertiary: var(--user-bg-tertiary-color, #e9ecef);
  
  /* צבעי טקסט דינמיים */
  --color-text-primary: var(--user-text-primary-color, #212529);
  --color-text-secondary: var(--user-text-secondary-color, #6c757d);
  --color-text-muted: var(--user-text-muted-color, #adb5bd);
}
```

### 2. צבעי ישויות

```css
/* צבעי ישויות דינמיים */
:root {
  --entity-trade-color: var(--user-entity-trade-color, #007bff);
  --entity-account-color: var(--user-entity-account-color, #28a745);
  --entity-ticker-color: var(--user-entity-ticker-color, #dc3545);
  --entity-alert-color: var(--user-entity-alert-color, #ff9c05);
  --entity-cash-flow-color: var(--user-entity-cash-flow-color, #20c997);
  --entity-note-color: var(--user-entity-note-color, #6f42c1);
  --entity-trade-plan-color: var(--user-entity-trade-plan-color, #17a2b8);
  --entity-execution-color: var(--user-entity-execution-color, #fd7e14);
}
```

### 3. צבעי סטטוס

```css
/* צבעי סטטוס דינמיים */
:root {
  --status-open-color: var(--user-status-open-color, #28a745);
  --status-closed-color: var(--user-status-closed-color, #6c757d);
  --status-cancelled-color: var(--user-status-cancelled-color, #dc3545);
  --status-pending-color: var(--user-status-pending-color, #ffc107);
  --status-active-color: var(--user-status-active-color, #007bff);
  --status-inactive-color: var(--user-status-inactive-color, #6c757d);
}
```

### 4. צבעי סוגי השקעה

```css
/* צבעי סוגי השקעה דינמיים */
:root {
  --type-swing-color: var(--user-type-swing-color, #007bff);
  --type-investment-color: var(--user-type-investment-color, #28a745);
  --type-passive-color: var(--user-type-passive-color, #6f42c1);
  --type-day-trading-color: var(--user-type-day-trading-color, #fd7e14);
  --type-scalping-color: var(--user-type-scalping-color, #dc3545);
}
```

### 5. צבעי Apple System

```css
/* צבעי Apple System דינמיים */
:root {
  --apple-blue: var(--user-apple-blue, #007AFF);
  --apple-blue-dark: var(--user-apple-blue-dark, #0056CC);
  --apple-green: var(--user-apple-green, #34C759);
  --apple-green-dark: var(--user-apple-green-dark, #248A3D);
  --apple-orange: var(--user-apple-orange, #FF9500);
  --apple-orange-dark: var(--user-apple-orange-dark, #CC7700);
  --apple-red: var(--user-apple-red, #FF3B30);
  --apple-red-dark: var(--user-apple-red-dark, #CC2E26);
  --apple-purple: var(--user-apple-purple, #AF52DE);
  --apple-purple-dark: var(--user-apple-purple-dark, #8B42B2);
  --apple-pink: var(--user-apple-pink, #FF2D92);
  --apple-pink-dark: var(--user-apple-pink-dark, #CC2475);
  --apple-teal: var(--user-apple-teal, #5AC8FA);
  --apple-teal-dark: var(--user-apple-teal-dark, #48A0C8);
  --apple-indigo: var(--user-apple-indigo, #5856D6);
  --apple-indigo-dark: var(--user-apple-indigo-dark, #4645AB);
  --apple-gray: var(--user-apple-gray, #8E8E93);
  --apple-gray-dark: var(--user-apple-gray-dark, #6D6D70);
  --apple-gray2: var(--user-apple-gray2, #AEAEB2);
  --apple-gray2-dark: var(--user-apple-gray2-dark, #8A8A8E);
  --apple-gray3: var(--user-apple-gray3, #C7C7CC);
  --apple-gray3-dark: var(--user-apple-gray3-dark, #A3A3A6);
  --apple-gray4: var(--user-apple-gray4, #D1D1D6);
  --apple-gray4-dark: var(--user-apple-gray4-dark, #ADADB2);
  --apple-gray5: var(--user-apple-gray5, #E5E5EA);
  --apple-gray5-dark: var(--user-apple-gray5-dark, #C1C1C6);
  --apple-gray6: var(--user-apple-gray6, #F2F2F7);
  --apple-gray6-dark: var(--user-apple-gray6-dark, #CECED2);
  --apple-separator: var(--user-apple-separator, #C6C6C8);
  --apple-separator-dark: var(--user-apple-separator-dark, #A2A2A6);
  --apple-opaque-separator: var(--user-apple-opaque-separator, #C6C6C8);
  --apple-opaque-separator-dark: var(--user-apple-opaque-separator-dark, #A2A2A6);
  --apple-system-fill: var(--user-apple-system-fill, #787880);
  --apple-system-fill-dark: var(--user-apple-system-fill-dark, #636366);
  --apple-secondary-system-fill: var(--user-apple-secondary-system-fill, #787880);
  --apple-secondary-system-fill-dark: var(--user-apple-secondary-system-fill-dark, #636366);
  --apple-tertiary-system-fill: var(--user-apple-tertiary-system-fill, #787880);
  --apple-tertiary-system-fill-dark: var(--user-apple-tertiary-system-fill-dark, #636366);
  --apple-quaternary-system-fill: var(--user-apple-quaternary-system-fill, #787880);
  --apple-quaternary-system-fill-dark: var(--user-apple-quaternary-system-fill-dark, #636366);
  --apple-label: var(--user-apple-label, #000000);
  --apple-label-dark: var(--user-apple-label-dark, #FFFFFF);
  --apple-secondary-label: var(--user-apple-secondary-label, #3C3C43);
  --apple-secondary-label-dark: var(--user-apple-secondary-label-dark, #EBEBF5);
  --apple-tertiary-label: var(--user-apple-tertiary-label, #3C3C43);
  --apple-tertiary-label-dark: var(--user-apple-tertiary-label-dark, #EBEBF5);
  --apple-quaternary-label: var(--user-apple-quaternary-label, #2C2C2E);
  --apple-quaternary-label-dark: var(--user-apple-quaternary-label-dark, #EBEBF5);
  --apple-link: var(--user-apple-link, #007AFF);
  --apple-link-dark: var(--user-apple-link-dark, #0A84FF);
  --apple-placeholder-text: var(--user-apple-placeholder-text, #3C3C43);
  --apple-placeholder-text-dark: var(--user-apple-placeholder-text-dark, #EBEBF5);
  --apple-system-background: var(--user-apple-system-background, #FFFFFF);
  --apple-system-background-dark: var(--user-apple-system-background-dark, #000000);
  --apple-secondary-system-background: var(--user-apple-secondary-system-background, #F2F2F7);
  --apple-secondary-system-background-dark: var(--user-apple-secondary-system-background-dark, #1C1C1E);
  --apple-tertiary-system-background: var(--user-apple-tertiary-system-background, #FFFFFF);
  --apple-tertiary-system-background-dark: var(--user-apple-tertiary-system-background-dark, #2C2C2E);
  --apple-grouped-background: var(--user-apple-grouped-background, #F2F2F7);
  --apple-grouped-background-dark: var(--user-apple-grouped-background-dark, #000000);
  --apple-secondary-grouped-background: var(--user-apple-secondary-grouped-background, #FFFFFF);
  --apple-secondary-grouped-background-dark: var(--user-apple-secondary-grouped-background-dark, #1C1C1E);
  --apple-tertiary-grouped-background: var(--user-apple-tertiary-grouped-background, #F2F2F7);
  --apple-tertiary-grouped-background-dark: var(--user-apple-tertiary-grouped-background-dark, #2C2C2E);
  --apple-system-grouped-background: var(--user-apple-system-grouped-background, #F2F2F7);
  --apple-system-grouped-background-dark: var(--user-apple-system-grouped-background-dark, #000000);
  --apple-secondary-system-grouped-background: var(--user-apple-secondary-system-grouped-background, #FFFFFF);
  --apple-secondary-system-grouped-background-dark: var(--user-apple-secondary-system-grouped-background-dark, #1C1C1E);
  --apple-tertiary-system-grouped-background: var(--user-apple-tertiary-system-grouped-background, #F2F2F7);
  --apple-tertiary-system-grouped-background-dark: var(--user-apple-tertiary-system-grouped-background-dark, #2C2C2E);
}
```

---

## API של הצבעים

### 1. טעינת צבעים

```javascript
// טעינת צבעים מ-API
async function loadDynamicColors() {
  try {
    const response = await fetch('/api/preferences/colors');
    const colors = await response.json();
    
    // עדכון CSS Variables
    Object.entries(colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--user-${key}`, value);
    });
    
    console.log('Dynamic colors loaded successfully');
  } catch (error) {
    console.error('Failed to load dynamic colors:', error);
  }
}

// טעינה בעת טעינת הדף
document.addEventListener('DOMContentLoaded', loadDynamicColors);
```

### 2. שמירת צבעים

```javascript
// שמירת צבע ב-API
async function saveColorPreference(colorKey, colorValue) {
  try {
    const response = await fetch('/api/preferences/colors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        [colorKey]: colorValue
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to save color preference');
    }
    
    console.log(`Color ${colorKey} saved successfully`);
  } catch (error) {
    console.error('Failed to save color preference:', error);
  }
}
```

### 3. עדכון צבעים

```javascript
// עדכון צבע בזמן אמת
function updateColor(colorKey, colorValue) {
  // עדכון CSS Variable
  document.documentElement.style.setProperty(`--user-${colorKey}`, colorValue);
  
  // שמירה ב-API
  saveColorPreference(colorKey, colorValue);
}

// עדכון מספר צבעים בבת אחת
async function updateMultipleColors(colors) {
  try {
    // עדכון CSS Variables
    Object.entries(colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--user-${key}`, value);
    });
    
    // שמירה ב-API
    const response = await fetch('/api/preferences/colors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(colors)
    });
    
    if (!response.ok) {
      throw new Error('Failed to save color preferences');
    }
    
    console.log('Multiple colors updated successfully');
  } catch (error) {
    console.error('Failed to update multiple colors:', error);
  }
}
```

### 4. איפוס צבעים

```javascript
// איפוס צבע לערך ברירת מחדל
function resetColor(colorKey) {
  // הסרת CSS Variable (יחזור לערך ברירת מחדל)
  document.documentElement.style.removeProperty(`--user-${colorKey}`);
  
  // שמירה ב-API
  saveColorPreference(colorKey, null);
}

// איפוס כל הצבעים
async function resetAllColors() {
  try {
    // הסרת כל CSS Variables
    const colorKeys = [
      'primary-color', 'secondary-color', 'success-color', 'danger-color',
      'warning-color', 'info-color', 'entity-trade-color', 'entity-account-color',
      'entity-ticker-color', 'entity-alert-color', 'entity-cash-flow-color',
      'entity-note-color', 'entity-trade-plan-color', 'entity-execution-color',
      'status-open-color', 'status-closed-color', 'status-cancelled-color',
      'status-pending-color', 'status-active-color', 'status-inactive-color',
      'type-swing-color', 'type-investment-color', 'type-passive-color',
      'type-day-trading-color', 'type-scalping-color'
    ];
    
    colorKeys.forEach(key => {
      document.documentElement.style.removeProperty(`--user-${key}`);
    });
    
    // שמירה ב-API
    const response = await fetch('/api/preferences/colors/reset', {
      method: 'POST'
    });
    
    if (!response.ok) {
      throw new Error('Failed to reset colors');
    }
    
    console.log('All colors reset successfully');
  } catch (error) {
    console.error('Failed to reset colors:', error);
  }
}
```

---

## טעינה דינמית

### 1. טעינה בעת טעינת הדף

```javascript
// טעינת צבעים בעת טעינת הדף
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await loadDynamicColors();
    console.log('Dynamic colors loaded on page load');
  } catch (error) {
    console.error('Failed to load dynamic colors on page load:', error);
  }
});
```

### 2. טעינה בעת שינוי משתמש

```javascript
// טעינת צבעים בעת שינוי משתמש
function onUserChange(userId) {
  loadDynamicColors().then(() => {
    console.log(`Dynamic colors loaded for user ${userId}`);
  }).catch(error => {
    console.error(`Failed to load dynamic colors for user ${userId}:`, error);
  });
}
```

### 3. טעינה בעת שינוי ערכת נושא

```javascript
// טעינת צבעים בעת שינוי ערכת נושא
function onThemeChange(themeName) {
  loadThemeColors(themeName).then(() => {
    console.log(`Theme colors loaded for ${themeName}`);
  }).catch(error => {
    console.error(`Failed to load theme colors for ${themeName}:`, error);
  });
}

// טעינת צבעי ערכת נושא
async function loadThemeColors(themeName) {
  try {
    const response = await fetch(`/api/preferences/themes/${themeName}/colors`);
    const colors = await response.json();
    
    // עדכון CSS Variables
    Object.entries(colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--user-${key}`, value);
    });
    
    console.log(`Theme colors loaded for ${themeName}`);
  } catch (error) {
    console.error(`Failed to load theme colors for ${themeName}:`, error);
  }
}
```

---

## עדכון בזמן אמת

### 1. עדכון צבע בודד

```javascript
// עדכון צבע בודד
function updateSingleColor(colorKey, colorValue) {
  // עדכון CSS Variable
  document.documentElement.style.setProperty(`--user-${colorKey}`, colorValue);
  
  // שמירה ב-API
  saveColorPreference(colorKey, colorValue);
  
  // עדכון UI
  updateColorPicker(colorKey, colorValue);
}

// עדכון color picker
function updateColorPicker(colorKey, colorValue) {
  const picker = document.querySelector(`[data-color-key="${colorKey}"]`);
  if (picker) {
    picker.value = colorValue;
  }
}
```

### 2. עדכון מספר צבעים

```javascript
// עדכון מספר צבעים
function updateMultipleColors(colors) {
  // עדכון CSS Variables
  Object.entries(colors).forEach(([key, value]) => {
    document.documentElement.style.setProperty(`--user-${key}`, value);
  });
  
  // שמירה ב-API
  saveMultipleColors(colors);
  
  // עדכון UI
  updateColorPickers(colors);
}

// עדכון color pickers
function updateColorPickers(colors) {
  Object.entries(colors).forEach(([key, value]) => {
    updateColorPicker(key, value);
  });
}
```

### 3. עדכון עם אנימציה

```javascript
// עדכון צבע עם אנימציה
function updateColorWithAnimation(colorKey, colorValue, duration = 300) {
  const element = document.documentElement;
  const currentValue = getComputedStyle(element).getPropertyValue(`--user-${colorKey}`);
  
  // אנימציה
  element.style.transition = `--user-${colorKey} ${duration}ms ease`;
  element.style.setProperty(`--user-${colorKey}`, colorValue);
  
  // הסרת transition לאחר האנימציה
  setTimeout(() => {
    element.style.transition = '';
  }, duration);
  
  // שמירה ב-API
  saveColorPreference(colorKey, colorValue);
}
```

---

## ערכות נושא

### 1. ערכת נושא בהירה

```css
/* 08-themes/_light.css */
:root[data-theme="light"] {
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f8f9fa;
  --color-bg-tertiary: #e9ecef;
  --color-text-primary: #212529;
  --color-text-secondary: #6c757d;
  --color-text-muted: #adb5bd;
  --color-border: #dee2e6;
  --color-shadow: rgba(0, 0, 0, 0.1);
}
```

### 2. ערכת נושא כהה

```css
/* 08-themes/_dark.css */
:root[data-theme="dark"] {
  --color-bg-primary: #1a1a1a;
  --color-bg-secondary: #2d2d2d;
  --color-bg-tertiary: #404040;
  --color-text-primary: #ffffff;
  --color-text-secondary: #b3b3b3;
  --color-text-muted: #808080;
  --color-border: #404040;
  --color-shadow: rgba(0, 0, 0, 0.3);
}
```

### 3. ערכת נושא ניגודיות גבוהה

```css
/* 08-themes/_high-contrast.css */
:root[data-theme="high-contrast"] {
  --color-bg-primary: #000000;
  --color-bg-secondary: #000000;
  --color-bg-tertiary: #000000;
  --color-text-primary: #ffffff;
  --color-text-secondary: #ffffff;
  --color-text-muted: #ffffff;
  --color-border: #ffffff;
  --color-shadow: rgba(255, 255, 255, 0.5);
}
```

### 4. החלפת ערכת נושא

```javascript
// החלפת ערכת נושא
function switchTheme(themeName) {
  // עדכון data-theme
  document.documentElement.setAttribute('data-theme', themeName);
  
  // טעינת צבעי ערכת נושא
  loadThemeColors(themeName);
  
  // שמירת העדפה
  saveThemePreference(themeName);
}

// שמירת העדפת ערכת נושא
async function saveThemePreference(themeName) {
  try {
    const response = await fetch('/api/preferences/theme', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ theme: themeName })
    });
    
    if (!response.ok) {
      throw new Error('Failed to save theme preference');
    }
    
    console.log(`Theme ${themeName} saved successfully`);
  } catch (error) {
    console.error('Failed to save theme preference:', error);
  }
}
```

---

## צבעי ישויות

### 1. הגדרת צבעי ישויות

```css
/* צבעי ישויות דינמיים */
:root {
  --entity-trade-color: var(--user-entity-trade-color, #007bff);
  --entity-account-color: var(--user-entity-account-color, #28a745);
  --entity-ticker-color: var(--user-entity-ticker-color, #dc3545);
  --entity-alert-color: var(--user-entity-alert-color, #ff9c05);
  --entity-cash-flow-color: var(--user-entity-cash-flow-color, #20c997);
  --entity-note-color: var(--user-entity-note-color, #6f42c1);
  --entity-trade-plan-color: var(--user-entity-trade-plan-color, #17a2b8);
  --entity-execution-color: var(--user-entity-execution-color, #fd7e14);
}
```

### 2. שימוש בצבעי ישויות

```css
/* שימוש בצבעי ישויות */
.entity-trade {
  color: var(--entity-trade-color);
  background-color: color-mix(in srgb, var(--entity-trade-color) 10%, transparent);
}

.entity-account {
  color: var(--entity-account-color);
  background-color: color-mix(in srgb, var(--entity-account-color) 10%, transparent);
}

.entity-ticker {
  color: var(--entity-ticker-color);
  background-color: color-mix(in srgb, var(--entity-ticker-color) 10%, transparent);
}

.entity-alert {
  color: var(--entity-alert-color);
  background-color: color-mix(in srgb, var(--entity-alert-color) 10%, transparent);
}

.entity-cash-flow {
  color: var(--entity-cash-flow-color);
  background-color: color-mix(in srgb, var(--entity-cash-flow-color) 10%, transparent);
}

.entity-note {
  color: var(--entity-note-color);
  background-color: color-mix(in srgb, var(--entity-note-color) 10%, transparent);
}

.entity-trade-plan {
  color: var(--entity-trade-plan-color);
  background-color: color-mix(in srgb, var(--entity-trade-plan-color) 10%, transparent);
}

.entity-execution {
  color: var(--entity-execution-color);
  background-color: color-mix(in srgb, var(--entity-execution-color) 10%, transparent);
}
```

### 3. עדכון צבעי ישויות

```javascript
// עדכון צבע ישות
function updateEntityColor(entityType, colorValue) {
  const colorKey = `entity-${entityType}-color`;
  updateColor(colorKey, colorValue);
  
  // עדכון UI
  updateEntityColorDisplay(entityType, colorValue);
}

// עדכון תצוגת צבע ישות
function updateEntityColorDisplay(entityType, colorValue) {
  const elements = document.querySelectorAll(`.entity-${entityType}`);
  elements.forEach(element => {
    element.style.setProperty('--entity-color', colorValue);
  });
}
```

---

## צבעי סטטוס

### 1. הגדרת צבעי סטטוס

```css
/* צבעי סטטוס דינמיים */
:root {
  --status-open-color: var(--user-status-open-color, #28a745);
  --status-closed-color: var(--user-status-closed-color, #6c757d);
  --status-cancelled-color: var(--user-status-cancelled-color, #dc3545);
  --status-pending-color: var(--user-status-pending-color, #ffc107);
  --status-active-color: var(--user-status-active-color, #007bff);
  --status-inactive-color: var(--user-status-inactive-color, #6c757d);
}
```

### 2. שימוש בצבעי סטטוס

```css
/* שימוש בצבעי סטטוס */
.status-open {
  color: var(--status-open-color);
  background-color: color-mix(in srgb, var(--status-open-color) 10%, transparent);
}

.status-closed {
  color: var(--status-closed-color);
  background-color: color-mix(in srgb, var(--status-closed-color) 10%, transparent);
}

.status-cancelled {
  color: var(--status-cancelled-color);
  background-color: color-mix(in srgb, var(--status-cancelled-color) 10%, transparent);
}

.status-pending {
  color: var(--status-pending-color);
  background-color: color-mix(in srgb, var(--status-pending-color) 10%, transparent);
}

.status-active {
  color: var(--status-active-color);
  background-color: color-mix(in srgb, var(--status-active-color) 10%, transparent);
}

.status-inactive {
  color: var(--status-inactive-color);
  background-color: color-mix(in srgb, var(--status-inactive-color) 10%, transparent);
}
```

### 3. עדכון צבעי סטטוס

```javascript
// עדכון צבע סטטוס
function updateStatusColor(statusType, colorValue) {
  const colorKey = `status-${statusType}-color`;
  updateColor(colorKey, colorValue);
  
  // עדכון UI
  updateStatusColorDisplay(statusType, colorValue);
}

// עדכון תצוגת צבע סטטוס
function updateStatusColorDisplay(statusType, colorValue) {
  const elements = document.querySelectorAll(`.status-${statusType}`);
  elements.forEach(element => {
    element.style.setProperty('--status-color', colorValue);
  });
}
```

---

## בדיקות ואימות

### 1. בדיקת טעינת צבעים

```javascript
// בדיקת טעינת צבעים דינמיים
async function testDynamicColors() {
  try {
    const response = await fetch('/api/preferences/colors');
    const colors = await response.json();
    
    // בדיקת עדכון CSS Variables
    Object.entries(colors).forEach(([key, value]) => {
      const cssVar = `--user-${key}`;
      const computedValue = getComputedStyle(document.documentElement)
        .getPropertyValue(cssVar);
      
      if (!computedValue) {
        console.error(`CSS Variable ${cssVar} not set`);
      }
    });
    
    console.log('Dynamic colors test passed');
  } catch (error) {
    console.error('Dynamic colors test failed:', error);
  }
}
```

### 2. בדיקת עדכון צבעים

```javascript
// בדיקת עדכון צבעים
function testColorUpdate() {
  const testColor = '#ff0000';
  const testKey = 'primary-color';
  
  // עדכון צבע
  updateColor(testKey, testColor);
  
  // בדיקת עדכון
  const computedValue = getComputedStyle(document.documentElement)
    .getPropertyValue(`--user-${testKey}`);
  
  if (computedValue === testColor) {
    console.log('Color update test passed');
  } else {
    console.error('Color update test failed');
  }
}
```

### 3. בדיקת ערכות נושא

```javascript
// בדיקת ערכות נושא
function testThemes() {
  const themes = ['light', 'dark', 'high-contrast'];
  
  themes.forEach(theme => {
    // החלפת ערכת נושא
    switchTheme(theme);
    
    // בדיקת עדכון
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === theme) {
      console.log(`Theme ${theme} test passed`);
    } else {
      console.error(`Theme ${theme} test failed`);
    }
  });
}
```

### 4. בדיקת ביצועים

```javascript
// בדיקת ביצועים
function testPerformance() {
  const startTime = performance.now();
  
  // עדכון מספר צבעים
  const colors = {
    'primary-color': '#007bff',
    'secondary-color': '#6c757d',
    'success-color': '#28a745',
    'danger-color': '#dc3545'
  };
  
  updateMultipleColors(colors);
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  if (duration < 100) {
    console.log(`Performance test passed: ${duration}ms`);
  } else {
    console.warn(`Performance test slow: ${duration}ms`);
  }
}
```

---

## דוגמאות קוד

### דוגמה 1: Color Picker

```html
<!-- HTML -->
<div class="color-picker">
  <label for="primary-color">צבע ראשי:</label>
  <input type="color" id="primary-color" data-color-key="primary-color" value="#29a6a8">
</div>
```

```javascript
// JavaScript
document.addEventListener('DOMContentLoaded', () => {
  const colorPickers = document.querySelectorAll('input[type="color"]');
  
  colorPickers.forEach(picker => {
    picker.addEventListener('change', (e) => {
      const colorKey = e.target.dataset.colorKey;
      const colorValue = e.target.value;
      
      updateColor(colorKey, colorValue);
    });
  });
});
```

### דוגמה 2: Theme Switcher

```html
<!-- HTML -->
<div class="theme-switcher">
  <label for="theme-select">ערכת נושא:</label>
  <select id="theme-select">
    <option value="light">בהירה</option>
    <option value="dark">כהה</option>
    <option value="high-contrast">ניגודיות גבוהה</option>
  </select>
</div>
```

```javascript
// JavaScript
document.addEventListener('DOMContentLoaded', () => {
  const themeSelect = document.getElementById('theme-select');
  
  themeSelect.addEventListener('change', (e) => {
    const themeName = e.target.value;
    switchTheme(themeName);
  });
});
```

### דוגמה 3: Entity Color Manager

```html
<!-- HTML -->
<div class="entity-color-manager">
  <h3>צבעי ישויות</h3>
  <div class="color-grid">
    <div class="color-item">
      <label for="trade-color">טריידים:</label>
      <input type="color" id="trade-color" data-color-key="entity-trade-color" value="#007bff">
    </div>
    <div class="color-item">
      <label for="account-color">חשבונות:</label>
      <input type="color" id="account-color" data-color-key="entity-account-color" value="#28a745">
    </div>
    <div class="color-item">
      <label for="ticker-color">טיקרים:</label>
      <input type="color" id="ticker-color" data-color-key="entity-ticker-color" value="#dc3545">
    </div>
  </div>
</div>
```

```javascript
// JavaScript
document.addEventListener('DOMContentLoaded', () => {
  const entityColorPickers = document.querySelectorAll('.entity-color-manager input[type="color"]');
  
  entityColorPickers.forEach(picker => {
    picker.addEventListener('change', (e) => {
      const colorKey = e.target.dataset.colorKey;
      const colorValue = e.target.value;
      
      updateEntityColor(colorKey.replace('entity-', '').replace('-color', ''), colorValue);
    });
  });
});
```

### דוגמה 4: Color Reset

```html
<!-- HTML -->
<div class="color-reset">
  <button id="reset-colors" class="btn btn--secondary">איפוס צבעים</button>
  <button id="reset-entity-colors" class="btn btn--secondary">איפוס צבעי ישויות</button>
</div>
```

```javascript
// JavaScript
document.addEventListener('DOMContentLoaded', () => {
  const resetColorsBtn = document.getElementById('reset-colors');
  const resetEntityColorsBtn = document.getElementById('reset-entity-colors');
  
  resetColorsBtn.addEventListener('click', () => {
    resetAllColors();
  });
  
  resetEntityColorsBtn.addEventListener('click', () => {
    const entityColors = [
      'entity-trade-color', 'entity-account-color', 'entity-ticker-color',
      'entity-alert-color', 'entity-cash-flow-color', 'entity-note-color',
      'entity-trade-plan-color', 'entity-execution-color'
    ];
    
    entityColors.forEach(colorKey => {
      resetColor(colorKey);
    });
  });
});
```

---

## סיכום

מערכת הצבעים הדינמית של TikTrack מספקת:

1. **התאמה אישית** - כל משתמש יכול להתאים את הצבעים לטעמו
2. **עקביות** - צבעים אחידים בכל האתר
3. **גמישות** - קל להוסיף צבעים חדשים או לשנות קיימים
4. **ביצועים** - עדכון מהיר ללא טעינה מחדש של הדף
5. **נגישות** - תמיכה בערכות נושא לנגישות

### עקרונות חשובים

- **CSS Custom Properties** - כל הצבעים מוגדרים כמשתנים
- **API Integration** - שמירה וטעינה מ-API
- **Fallback Values** - ערכי ברירת מחדל לכל צבע
- **Real-time Updates** - עדכון מיידי של הצבעים
- **Theme Support** - תמיכה בערכות נושא שונות

### המשך הפיתוח

- **הוספת צבעים חדשים** - קל להוסיף צבעים חדשים למערכת
- **שיפור ביצועים** - אופטימיזציה של עדכון הצבעים
- **תמיכה בערכות נושא** - הוספת ערכות נושא חדשות
- **בדיקות מקיפות** - בדיקת איכות וביצועים

---

*מדריך זה מתעדכן באופן שוטף. אם יש לך הצעות לשיפור או תוספות, אנא עדכן אותו.*

**קישורים נוספים:**
- [מדריך ארכיטקטורת CSS](CSS_ARCHITECTURE_GUIDE.md)
- [מדריך RTL](RTL_DEVELOPMENT_GUIDE.md)
- [מדריך רכיבים](COMPONENT_LIBRARY.md)
