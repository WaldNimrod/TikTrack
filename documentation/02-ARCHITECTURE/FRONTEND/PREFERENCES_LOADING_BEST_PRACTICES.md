# Preferences Loading Best Practices - TikTrack
## מדריך Best Practices לטעינת העדפות

**תאריך עדכון:** 2025-01-27  
**גרסה:** 1.0.0  
**סטטוס:** ✅ מעודכן

---

## 📋 Overview

מדריך זה מספק הנחיות מפורטות לשימוש נכון במערכת טעינת העדפות, כולל Event System, Flags, Timeout Fallback, ודוגמאות קוד.

---

## 🎯 Event System

### Events Available

המערכת משדרת 4 אירועים עיקריים:

1. **`preferences:critical-loaded`** - העדפות קריטיות נטענו
2. **`preferences:all-loaded`** - כל ההעדפות נטענו
3. **`preferences:cache-hit`** - העדפות נטענו מהמטמון
4. **`preferences:cache-miss`** - העדפות נטענו מהשרת

### Event Details

כל אירוע כולל `detail` object עם המידע הבא:

```javascript
{
  preferences: Object,        // כל ההעדפות
  fromCache: Boolean,         // האם נטען מהמטמון
  cacheLayer: String,         // שכבת המטמון (memory, localStorage, indexedDB, backend)
  userId: Number,             // ID המשתמש
  profileId: Number,          // ID הפרופיל
  loadTime: String,          // זמן טעינה בפורמט "123.45ms"
  environment: String,        // development או production
  criticalCount: Number,      // מספר העדפות קריטיות שנטענו
  totalCritical: Number,      // סך כל העדפות קריטיות
  timestamp: Number           // timestamp של הטעינה
}
```

---

## 🏁 Global Flags

### `window.__preferencesCriticalLoaded`

Flag בוליאני המציין אם העדפות הקריטיות כבר נטענו.

**שימוש:**
```javascript
if (window.__preferencesCriticalLoaded) {
  // העדפות כבר נטענו, אפשר להשתמש בהן מיד
  const defaultAccount = window.currentPreferences?.default_trading_account;
}
```

### `window.__preferencesCriticalLoadedDetail`

Object המכיל מידע מפורט על ההעדפות שנטענו.

**שימוש:**
```javascript
if (window.__preferencesCriticalLoadedDetail) {
  const detail = window.__preferencesCriticalLoadedDetail;
  console.log('Loaded from cache:', detail.fromCache);
  console.log('Cache layer:', detail.cacheLayer);
  console.log('Load time:', detail.loadTime);
}
```

---

## ⏱️ Timeout Fallback

### Timeout Values

- **Development:** 3 שניות
- **Production:** 5 שניות

### Pattern מומלץ

תמיד יש לבדוק את ה-flag קודם, ואז להמתין לאירוע עם timeout fallback:

```javascript
const waitForPreferences = async () => {
  const environment = window.API_ENV || 'development';
  const timeoutMs = environment === 'production' ? 5000 : 3000;
  
  return new Promise((resolve) => {
    // בדיקה 1: האם העדפות כבר נטענו?
    if (window.currentPreferences && Object.keys(window.currentPreferences).length > 0) {
      resolve();
      return;
    }
    
    // בדיקה 2: האם ה-flag מוגדר?
    if (window.__preferencesCriticalLoaded) {
      resolve();
      return;
    }
    
    // המתנה לאירוע
    const eventHandler = () => {
      resolve();
    };
    
    window.addEventListener('preferences:critical-loaded', eventHandler, { once: true });
    
    // Timeout fallback - ממשיך גם אם האירוע לא נשלח
    setTimeout(() => {
      window.removeEventListener('preferences:critical-loaded', eventHandler);
      
      // בדיקה אחרונה לפני timeout
      if (window.__preferencesCriticalLoaded) {
        console.log('✅ Preferences loaded during timeout check');
      } else {
        console.warn('⚠️ Preferences event timeout - continuing without preferences');
      }
      
      resolve();
    }, timeoutMs);
  });
};
```

---

## 📝 דוגמאות קוד

### דוגמה 1: מערכת תלויה פשוטה

```javascript
// header-system.js
async function loadAccountsForFilter() {
  // המתין להעדפות לפני טעינת חשבונות
  await waitForPreferences();
  
  // כעת אפשר להשתמש בהעדפות
  const defaultAccount = window.currentPreferences?.default_trading_account;
  
  // טעינת חשבונות עם חשבון ברירת מחדל
  await loadAccounts(defaultAccount);
}
```

### דוגמה 2: מערכת עם טבלאות

```javascript
// trading_accounts.js
async function initAccountActivity() {
  // המתין להעדפות ולנתונים נוספים
  await waitForPreferences();
  await waitForTradingAccountsData();
  await waitForDateRange();
  
  // כעת אפשר לאתחל את הטבלה
  const defaultAccount = window.currentPreferences?.default_trading_account;
  const dateRange = window.selectedDateRangeForFilter;
  
  await loadAccountActivityTable(defaultAccount, dateRange);
}
```

### דוגמה 3: מערכת צבעים

```javascript
// color-scheme-system.js
async function loadColorPreferences() {
  // המתין להעדפות
  await waitForPreferences();
  
  // כעת אפשר לטעון צבעים
  const primaryColor = window.currentPreferences?.primaryColor || '#26baac';
  const secondaryColor = window.currentPreferences?.secondaryColor || '#fc5a06';
  
  applyColorScheme(primaryColor, secondaryColor);
}
```

### דוגמה 4: מערכת עם Event Listener

```javascript
// my-system.js
function initializeMySystem() {
  // בדיקה אם העדפות כבר נטענו
  if (window.__preferencesCriticalLoaded) {
    setupMySystem();
  } else {
    // המתין לאירוע
    window.addEventListener('preferences:critical-loaded', () => {
      setupMySystem();
    }, { once: true });
    
    // Timeout fallback
    setTimeout(() => {
      if (window.__preferencesCriticalLoaded) {
        setupMySystem();
      } else {
        console.warn('⚠️ Preferences not loaded, continuing without them');
        setupMySystem(); // ממשיך גם בלי העדפות
      }
    }, 3000);
  }
}

function setupMySystem() {
  const preference = window.currentPreferences?.myPreference;
  // ... setup logic
}
```

---

## ⚠️ מה לא לעשות

### ❌ אל תעשה:

1. **אל תטען העדפות ישירות:**
   ```javascript
   // ❌ WRONG
   await loadUserPreferences({ force: true });
   ```

2. **אל תמתין ללא timeout:**
   ```javascript
   // ❌ WRONG
   window.addEventListener('preferences:critical-loaded', () => {
     // אם האירוע לא נשלח, זה יישאר תקוע לנצח
   });
   ```

3. **אל תשתמש בהעדפות לפני בדיקה:**
   ```javascript
   // ❌ WRONG
   const account = window.currentPreferences.default_trading_account;
   // אם העדפות לא נטענו, זה יגרום לשגיאה
   ```

### ✅ תעשה:

1. **השתמש ב-flag וב-event:**
   ```javascript
   // ✅ CORRECT
   if (window.__preferencesCriticalLoaded) {
     usePreferences();
   } else {
     await waitForPreferences();
     usePreferences();
   }
   ```

2. **תמיד השתמש ב-timeout fallback:**
   ```javascript
   // ✅ CORRECT
   await waitForPreferences(); // כולל timeout fallback
   ```

3. **בדוק קיום לפני שימוש:**
   ```javascript
   // ✅ CORRECT
   const account = window.currentPreferences?.default_trading_account;
   if (account) {
     useAccount(account);
   }
   ```

---

## 🔍 Debugging

### בדיקת סטטוס העדפות

```javascript
// בדיקה אם העדפות נטענו
console.log('Critical loaded:', window.__preferencesCriticalLoaded);
console.log('Current preferences:', window.currentPreferences);
console.log('Detail:', window.__preferencesCriticalLoadedDetail);
```

### ניטור אירועים

```javascript
// האזנה לכל האירועים
['preferences:critical-loaded', 'preferences:all-loaded', 
 'preferences:cache-hit', 'preferences:cache-miss'].forEach(eventName => {
  window.addEventListener(eventName, (event) => {
    console.log(`Event: ${eventName}`, event.detail);
  });
});
```

---

## 📚 קישורים רלוונטיים

- [Unified Initialization System](UNIFIED_INITIALIZATION_SYSTEM.md)
- [Preferences System](../../04-FEATURES/CORE/preferences/PREFERENCES_SYSTEM.md)
- [Unified Cache System](../../04-FEATURES/CORE/UNIFIED_CACHE_SYSTEM.md)

---

**תאריך עדכון אחרון:** 27 בינואר 2025  
**גרסה:** 1.0.0

