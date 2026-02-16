# 🎯 פרוטוקול סטנדרטים ובקרת איכות JavaScript (v1.4)

**id:** `TT2_JS_STANDARDS_PROTOCOL`  
**owner:** Team 10 (The Gateway)  
**status:** 🔒 **SSOT - ACTIVE**  
**supersedes:** None (Master document)  
**last_updated:** 2026-02-05  
**version:** v1.4

**פרויקט:** פיניקס (TikTrack V2)  
**תפקיד:** אבטחת איכות אדריכלית (LOD 400)  
**תאריך:** 2026-01-31  
**צוות:** Chief Architect → Team 10 (The Gateway)  
**סטטוס:** ✅ נוהל מחייב

---

## 📋 תקציר מנהלים

פרוטוקול זה מגדיר את הסטנדרטים המחייבים לפיתוח JavaScript וצד-לקוח בפרויקט פיניקס V2. המטרה היא להבטיח Digital Twin מושלם, תוך אימוץ קונבנציות React מודרניות בצורה מבוקרת.

**הדיוק הוא לא יעד, הוא דרך חיים.**

---

## 1. חובת התאמה למורשת וניהול שמות (Validated Naming)

### א. Transformation Layer - הפרדה בין Backend ל-Frontend

אנו מאמצים את מודל ה-Transformation Layer כדי לפתור את הסתירה בין ה-Backend ל-Frontend:

#### **API Layer (Data):**
- **שימוש ב-`snake_case` בלבד**
- **חובה להיצמד לשמות השדות ב-OpenAPI Spec**
- **דוגמאות:** `external_ulids`, `phone_numbers`, `user_tier_levels`, `is_email_verified`, `access_token`, `refresh_token`

```javascript
// ✅ נכון - API Payload (snake_case)
const apiPayload = {
  username_or_email: "user@example.com",
  password: "secure_password_123",
  remember_me: true
};

// ❌ לא נכון - API Payload (camelCase)
const apiPayload = {
  usernameOrEmail: "user@example.com",  // שגיאה!
  password: "secure_password_123",
  rememberMe: true  // שגיאה!
};
```

#### **React Layer (UI/State):**
- **שימוש ב-`camelCase`**
- **תואם לקונבנציות React**
- **דוגמאות:** `externalUlids`, `phoneNumbers`, `userTierLevels`, `isEmailVerified`, `accessToken`, `refreshToken`

```javascript
// ✅ נכון - React State (camelCase)
const [user, setUser] = useState({
  externalUlids: "",
  phoneNumbers: "",
  isEmailVerified: false
});

// ❌ לא נכון - React State (snake_case)
const [user, setUser] = useState({
  external_ulids: "",  // שגיאה!
  phone_numbers: "",    // שגיאה!
  is_email_verified: false  // שגיאה!
});
```

#### **Transformation Requirement:**
**כל תקשורת API חייבת לעבור דרך פונקציות `apiToReact` ו-`reactToApi` כדי לשמור על ניקיון ה-State.**

```javascript
// utils/transformers.js
/**
 * Transforms API response (snake_case) to React state (camelCase)
 * @param {Object} apiData - API response with snake_case keys
 * @returns {Object} - React state object with camelCase keys
 */
export const apiToReact = (apiData) => {
  const transform = (obj) => {
    if (Array.isArray(obj)) {
      return obj.map(transform);
    }
    if (obj !== null && typeof obj === 'object') {
      return Object.keys(obj).reduce((acc, key) => {
        const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        acc[camelKey] = transform(obj[key]);
        return acc;
      }, {});
    }
    return obj;
  };
  return transform(apiData);
};

/**
 * Transforms React state (camelCase) to API request (snake_case)
 * @param {Object} reactData - React state with camelCase keys
 * @returns {Object} - API request object with snake_case keys
 */
export const reactToApi = (reactData) => {
  const transform = (obj) => {
    if (Array.isArray(obj)) {
      return obj.map(transform);
    }
    if (obj !== null && typeof obj === 'object') {
      return Object.keys(obj).reduce((acc, key) => {
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        acc[snakeKey] = transform(obj[key]);
        return acc;
      }, {});
    }
    return obj;
  };
  return transform(reactData);
};
```

---

### ב. DOM Selectors - הפרדה מוחלטת בין עיצוב ללוגיקה

#### **חוקי ברזל:**

✅ **שימוש בתחילית `js-` לסלקטורים:**
```html
<button class="auth-form__button auth-form__button--primary js-login-trigger">
  התחבר
</button>
```

```javascript
// ✅ נכון - JS Selector עם js- prefix
const loginButton = document.querySelector('.js-login-trigger');
const form = document.querySelector('.js-login-form');
const errorFeedback = document.querySelector('.js-error-feedback');
```

❌ **אין להשתמש ב-Classes של BEM המיועדים לעיצוב לצורך בחירת אלמנטים ב-JS:**

```javascript
// ❌ לא נכון - שימוש ב-BEM class כ-JS selector
const button = document.querySelector('.auth-form__button--primary');  // שגיאה!

// ❌ לא נכון - שימוש ב-LEGO component כ-JS selector
const container = document.querySelector('tt-container');  // שגיאה!
```

**חוק:** כל JS selector חייב להיות עם `js-` prefix, ללא קשר ל-CSS classes.

---

### ג. Naming Conventions Summary

| Context | Convention | Example | Status |
|---------|-----------|---------|--------|
| **API Layer (OpenAPI)** | `snake_case` | `external_ulids`, `phone_numbers` | ✅ חובה |
| **React Components** | `PascalCase.jsx` | `HomePage.jsx`, `LoginForm.jsx` | ✅ חובה |
| **JavaScript Files** | `camelCase.js` | `headerLoader.js`, `authGuard.js` | ✅ חובה |
| **HTML Files** | `snake_case.html` | `trading_accounts.html`, `user_profile.html` | ✅ חובה |
| **CSS Files** | `kebab-case.css` | `phoenix-base.css`, `phoenix-components.css` | ✅ חובה |
| **CSS Classes (BEM)** | `kebab-case` | `auth-form__button--primary` | ✅ חובה |
| **JS Selectors** | `kebab-case` + `js-` prefix | `js-login-trigger` | ✅ חובה |
| **Manager Classes** | `PascalCase` | `AuthManager`, `ApiKeyManager` | ✅ חובה |
| **Functions/Variables (Data)** | `snake_case` (API) / `camelCase` (React) | `user_account_id` (API) / `userAccountId` (React) | ✅ חובה |
| **Functions/Variables (Logic)** | `camelCase` | `handleSubmit`, `validateForm` | ✅ חובה |

#### 📋 כללי שמות קבצים מפורטים:

**React Components:**
- ✅ `PascalCase.jsx` - כל רכיב React חייב להיות ב-PascalCase
- ✅ דוגמאות: `HomePage.jsx`, `LoginForm.jsx`, `ProfileView.jsx`, `PasswordResetFlow.jsx`
- ❌ לא נכון: `homePage.jsx`, `login-form.jsx`, `profile_view.jsx`

**JavaScript Files:**
- ✅ `camelCase.js` - כל קובץ JavaScript חייב להיות ב-camelCase
- ✅ דוגמאות: `headerLoader.js`, `authGuard.js`, `navigationHandler.js`, `tradingAccountsDataLoader.js`
- ❌ לא נכון: `header-loader.js`, `auth-guard.js`, `d16DataLoader.js` (תחילית לא ברורה)

**HTML Files:**
- ✅ `snake_case.html` - כל קובץ HTML חייב להיות ב-snake_case
- ✅ דוגמאות: `trading_accounts.html`, `brokers_fees.html`, `cash_flows.html`
- ❌ לא נכון: `tradingAccounts.html`, `brokers-fees.html`, `cashFlows.html`

**CSS Files:**
- ✅ `kebab-case.css` - כל קובץ CSS חייב להיות ב-kebab-case
- ✅ דוגמאות: `phoenix-base.css`, `phoenix-components.css`, `phoenix-header.css`
- ❌ לא נכון: `phoenixBase.css`, `phoenix_components.css`

#### 🚫 איסורים חשובים:

1. **אין קיצורים לא ברורים:**
   - ❌ `d16DataLoader.js` → ✅ `tradingAccountsDataLoader.js`
   - ❌ `d16FiltersIntegration.js` → ✅ `tradingAccountsFiltersIntegration.js`
   - ❌ `d16TableInit.js` → ✅ `tradingAccountsTableInit.js`

2. **אין תחיליות מיותרות:**
   - ❌ `d16HeaderHandlers.js` → ✅ `tradingAccountsHeaderHandlers.js` (אם ספציפי) או `headerFilterHandlers.js` (אם גנרי)

3. **שמות חייבים להיות אינטואיטיביים:**
   - ✅ `portfolioSummaryToggle.js` (ברור שזה toggle)
   - ✅ `sectionToggleHandler.js` (ברור שזה handler)
   - ❌ `portfolioSummary.js` (לא ברור שזה toggle)
   - ❌ `sectionToggle.js` (לא ברור שזה handler)

---

## 2. סטנדרטים הנדסיים (Engineering Standards)

### א. תשתית דיבאג וניטור (Observability)

#### **1. Debug Flag**

**תמיכה בפרמטר `?debug` ב-URL להפעלת לוגים מפורטים ב-Console.**

```javascript
// utils/debug.js
export const DEBUG_MODE = new URLSearchParams(window.location.search).has('debug');

export const debugLog = (category, message, data = {}) => {
  if (DEBUG_MODE) {
    console.info(`[${category}] ${message}`, data);
  }
};

// Usage
debugLog('Auth', 'Login attempt started', { userId: user.external_ulids });
```

**דוגמה לשימוש:**
- `http://localhost:8080/login?debug` - מפעיל debug mode
- Console output: `[Auth] Login attempt started { userId: "01ARZ3NDEKTSV4RRFFQ69G5FAV" }`

---

#### **2. Audit Trail System**

**כל מודול (Auth, Data, Trading) חייב לממש רישום פעולות דרך מחלקת ה-AuditTrail.**

```javascript
// utils/audit.js
class PhoenixAudit {
  constructor() {
    // זיהוי Debug Flag מה-URL
    this.isDebug = new URLSearchParams(window.location.search).has('debug');
    this.logs = [];
    this.maxLogs = 1000;
  }

  /**
   * @description רישום פעולה לוגית
   * @param {string} module - שם המודול (למשל: 'Auth')
   * @param {string} action - הפעולה המבוצעת
   * @param {object} data - נתונים בפורמט נקי
   */
  log(module, action, data = null) {
    const entry = {
      timestamp: new Date().toISOString(),
      module,
      action,
      data,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    this.logs.push(entry);
    
    // Keep only last 1000 logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console output (only in debug mode)
    if (this.isDebug) {
      console.info(`🛡️ [Phoenix Audit][${module}] ${action}`, data || '');
    }
  }

  /**
   * @description רישום שגיאה
   * @param {string} module - שם המודול
   * @param {string} message - הודעת השגיאה
   * @param {Error} error - אובייקט השגיאה
   */
  error(module, message, error = null) {
    const entry = {
      timestamp: new Date().toISOString(),
      module,
      action: 'ERROR',
      message,
      error: error ? {
        message: error.message,
        stack: error.stack
      } : null,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    this.logs.push(entry);
    console.error(`❌ [Phoenix Audit][${module}] ERROR: ${message}`, error);
  }

  /**
   * @description ייצוא הלוגים (לצורכי QA)
   * @returns {string} - JSON string of audit trail
   */
  export() {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * @description ניקוי הלוגים (לצורכי בדיקה)
   */
  clear() {
    this.logs = [];
  }
}

export const audit = new PhoenixAudit();
```

**שימוש:**
```javascript
import { audit } from './utils/audit.js';

// Log action
audit.log('Auth', 'Login attempt started', { 
  username_or_email: 'user@example.com' 
});

// Log error
audit.error('Auth', 'Login failure', error);

// Export for QA
const logs = audit.export();
```

---

#### **3. Error Boundaries**

**הטמעת רכיב Error Boundary גלובלי המדווח ל-Audit Trail במקרה של קריסה.**

```javascript
// components/ErrorBoundary.jsx
import React from 'react';
import { audit } from '../utils/audit.js';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    audit.error('React', 'Error Boundary caught error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>שגיאה בלתי צפויה</h2>
          <p>אנא רענן את הדף או פנה לתמיכה.</p>
          {DEBUG_MODE && (
            <pre>{this.state.error.toString()}</pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

---

### ב. תיעוד אקטיבי (JSDoc)

**חובה להשתמש בתבנית ה-JSDoc המאושרת הכוללת רפרנס ל-Legacy:**

```javascript
/**
 * [Component/Function Name]
 * 
 * @description [תיאור הפונקציה]
 * @legacyReference Legacy.[module].[function] - [קישור ל-Legacy Key הרלוונטי]
 * 
 * @param {string} paramName - תיאור הפרמטר (Legacy Key: legacy_key_name)
 * @param {number} [optionalParam] - פרמטר אופציונלי
 * @returns {Object} - תיאור הערך המוחזר
 * 
 * @example
 * const result = functionName('value1', 123);
 * // Returns: { success: true }
 * 
 * @throws {Error} - תיאור שגיאה אפשרית
 */
```

**דוגמה מלאה:**
```javascript
/**
 * AuthManager - ניהול אימות משתמשים
 * 
 * @description מנהל את כל תהליכי האימות (login, register, logout, refresh token)
 * @legacyReference Legacy.auth.login(), Legacy.auth.register()
 * 
 * @class
 */
class AuthManager {
  /**
   * Login - התחברות משתמש
   * 
   * @description מבצע התחברות משתמש עם username/email ו-password
   * @legacyReference Legacy.auth.login(username, password)
   * 
   * @param {string} username_or_email - שם משתמש או אימייל (Legacy Key: user_email)
   * @param {string} password - סיסמה (Legacy Key: user_password)
   * @returns {Promise<Object>} - LoginResponse עם access_token ו-user data
   * 
   * @example
   * const response = await authManager.login('user@example.com', 'password123');
   * // Returns: { access_token: "...", user: {...} }
   * 
   * @throws {Error} - אם האימות נכשל (401)
   */
  async login(username_or_email, password) {
    // Implementation
  }
}
```

---

### ג. מודולריות ומבנה תיקיות

**המבנה המוצע מאושר כסטנדרט המחייב לכל חבילות העבודה הבאות:**

```
ui/src/
├── components/        # React components גנריים (PascalCase.jsx)
│   ├── core/         # רכיבי ליבה משותפים (JavaScript handlers)
│   │   ├── PageFooter.jsx
│   │   ├── headerLoader.js      # JavaScript loader (camelCase.js)
│   │   └── phoenixFilterBridge.js
├── views/            # עמודים סטטיים (HTML)
│   ├── shared/       # HTML Templates שטוענים ל-views (גנריים)
│   │   ├── unified-header.html  # HTML template (snake_case.html)
│   │   ├── footer.html          # HTML template (snake_case.html)
│   │   └── footerLoader.js      # JavaScript loader
│   └── HomePage.jsx
├── cubes/            # מודולים עסקיים (Cubes Architecture)
│   ├── identity/     # מודול זהות
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.jsx
│   │   │   │   └── RegisterForm.jsx
│   │   │   └── profile/
│   │   │       └── ProfileView.jsx
│   │   ├── hooks/
│   │   │   └── useAuthValidation.js
│   │   └── services/
│   │       ├── auth.js
│   │       └── apiKeys.js
│   └── shared/       # מודול משותף
│       ├── components/
│       │   └── tables/
│       │       └── PhoenixTable.jsx
│       ├── contexts/
│       │   └── PhoenixFilterContext.jsx
│       ├── hooks/
│       │   ├── usePhoenixTableData.js
│       │   ├── usePhoenixTableFilter.js
│       │   └── usePhoenixTableSort.js
│       ├── PhoenixTableFilterManager.js
│       ├── PhoenixTableSortManager.js
│       ├── tableFormatters.js
│       └── utils/
│           └── transformers.js
├── views/            # עמודים סטטיים (HTML)
│   ├── shared/       # HTML Templates שטוענים ל-views (גנריים)
│   │   ├── unified-header.html  # HTML template
│   │   ├── footer.html          # HTML template
│   │   └── footerLoader.js      # JavaScript loader
│   └── financial/    # עמודים פיננסיים
│       ├── tradingAccounts/  # מודול trading accounts
│       │   ├── trading_accounts.html
│       │   ├── tradingAccountsDataLoader.js
│       │   ├── tradingAccountsFiltersIntegration.js
│       │   ├── tradingAccountsHeaderHandlers.js
│       │   └── tradingAccountsTableInit.js
│       ├── brokersFees/     # מודול brokers fees
│       │   └── brokers_fees.html
│       └── cashFlows/       # מודול cash flows
│           └── cash_flows.html
├── logic/            # לוגיקה עסקית
│   ├── errorCodes.js
│   └── schemas/
│       ├── authSchema.js
│       └── userSchema.js
├── utils/            # Utility functions (camelCase)
│   ├── transformers.js  # apiToReact, reactToApi
│   ├── errorHandler.js
│   ├── debug.js       # DEBUG_MODE, debugLog
│   └── audit.js       # PhoenixAudit class
├── router/           # React Router
│   └── AppRouter.jsx
└── main.jsx          # Entry point
```

#### 📋 כללי ארגון תיקיות:

1. **הפרדה בין קבצים גנריים לספציפיים:**
   - קבצים גנריים → `shared/` או `core/`
   - קבצים ספציפיים → תיקיית מודול (למשל `tradingAccounts/`)

2. **ארגון לפי מודולים:**
   - כל מודול עסקי בתיקייה נפרדת
   - קבצים ספציפיים למודול בתוך התיקייה שלו

3. **אין קבצים מיותרים:**
   - כל קובץ חייב להיות בשימוש
   - קבצים לא בשימוש → `99-ARCHIVE/ui/`

4. **אין כפילויות:**
   - כל פונקציונליות → קובץ אחד בלבד
   - אין שני קבצים עם אותה מטרה

---

### ד. איקונים אחידים (Icon Standards) 🚨 חובה

**חוק ברזל: כל האיקונים במערכת חייבים להיות אחידים ופשוטים.**

#### **1. סטנדרט איקונים**

**✅ מותר:**
- **SVG Inline פשוט** - שימוש ב-SVG פשוטים עם `viewBox` ו-`stroke`
- **אין תלויות חיצוניות** - אין שימוש בספריות איקונים חיצוניות (כמו lucide-react, react-icons, וכו')
- **צבע אחיד** - שימוש ב-`currentColor` כדי שיורש מה-parent
- **גודל אחיד** - גודל סטנדרטי של 18px או 24px לפי הקונטקסט

**❌ אסור:**
- ❌ **אין שימוש בספריות איקונים חיצוניות** (lucide-react, react-icons, font-awesome, וכו')
- ❌ **אין שימוש ב-React Components לאיקונים** (כמו `<Eye />` מ-lucide-react)
- ❌ **אין שימוש ב-font icons** (icon fonts)
- ❌ **אין המצאת איקונים חדשים** - רק איקונים פשוטים וסטנדרטיים

#### **2. פורמט SVG סטנדרטי**

**כל איקון חייב להיות בפורמט הבא:**

```jsx
// ✅ נכון - SVG פשוט עם viewBox
<svg 
  width="18" 
  height="18" 
  viewBox="0 0 24 24" 
  fill="none" 
  stroke="currentColor" 
  strokeWidth="2" 
  strokeLinecap="round" 
  strokeLinejoin="round"
>
  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
  <circle cx="12" cy="12" r="3"></circle>
</svg>

// ❌ לא נכון - React Component מ-lucide-react
import { Eye } from 'lucide-react';
<Eye size={18} />
```

#### **3. דוגמאות איקונים נפוצים**

**Eye Icon (הצג סיסמה):**
```jsx
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
  <circle cx="12" cy="12" r="3"></circle>
</svg>
```

**EyeOff Icon (הסתר סיסמה):**
```jsx
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
  <line x1="1" y1="1" x2="23" y2="23"></line>
</svg>
```

#### **4. כללי שימוש**

**מיקום איקונים:**
- ✅ איקונים בתוך buttons: מיקום absolute בתוך wrapper
- ✅ איקונים בתוך labels: מיקום inline עם text
- ✅ איקונים standalone: מיקום flex עם gap

**סגנון איקונים:**
- ✅ `stroke="currentColor"` - יורש צבע מה-parent
- ✅ `fill="none"` - אין fill (רק stroke)
- ✅ `strokeWidth="2"` - עובי stroke אחיד
- ✅ `strokeLinecap="round"` - קצוות מעוגלים
- ✅ `strokeLinejoin="round"` - חיבורים מעוגלים

**גודל איקונים:**
- ✅ **18px** - איקונים קטנים (בתוך inputs, buttons קטנים)
- ✅ **24px** - איקונים בינוניים (בתוך navigation, headers)
- ✅ **גודל אחיד** - כל האיקונים באותו קונטקסט באותו גודל

#### **5. בדיקות לפני הגשה**

**חובה לבדוק:**
- [ ] כל האיקונים הם SVG inline פשוטים
- [ ] אין שימוש בספריות איקונים חיצוניות
- [ ] כל האיקונים משתמשים ב-`currentColor`
- [ ] כל האיקונים באותו גודל בקונטקסט דומה
- [ ] אין React Components לאיקונים

**דוגמה לבדיקה:**
```bash
# חיפוש שימוש בספריות איקונים חיצוניות
grep -r "lucide-react\|react-icons\|@heroicons" ui/src/
# אמור להחזיר: אין תוצאות
```

---

## 3. פרוטוקול בדיקה (QA Protocol) - צוות 50

צוות ה-QA יבדוק את תקינות הלוגיקה בשלושה צירים:

### א. Network Integrity

**וידוא שה-Payloads הנשלחים ל-API הם ב-`snake_case` תקין.**

**בדיקה:**
1. פתיחת DevTools → Network tab
2. ביצוע פעולה (למשל: Login)
3. בדיקת Request Payload:
   - ✅ `username_or_email` (snake_case)
   - ✅ `phone_numbers` (snake_case)
   - ❌ `usernameOrEmail` (camelCase) - שגיאה!
   - ❌ `phoneNumbers` (camelCase) - שגיאה!

**דוגמה:**
```json
// ✅ נכון - API Payload
{
  "username_or_email": "user@example.com",
  "password": "secure_password_123",
  "remember_me": true
}

// ❌ לא נכון - API Payload
{
  "usernameOrEmail": "user@example.com",  // שגיאה!
  "password": "secure_password_123",
  "rememberMe": true  // שגיאה!
}
```

---

### ב. Console Audit

**בדיקה שבמצב רגיל ה-Console נקי, ובמצב `?debug` מופיע Audit Trail מלא.**

**בדיקה:**
1. **מצב רגיל** (`http://localhost:8080/login`):
   - ✅ Console נקי (אין לוגים)
   - ✅ רק שגיאות קריטיות מוצגות

2. **מצב Debug** (`http://localhost:8080/login?debug`):
   - ✅ Audit Trail מלא מוצג
   - ✅ כל פעולה מתועדת: `[Auth] Login attempt started`
   - ✅ Payloads מוצגים: `Payload prepared for API`

**דוגמה:**
```
// מצב Debug - Console Output
🛡️ [Phoenix Audit][Auth] Login attempt started { username_or_email: "user@example.com" }
🛡️ [Phoenix Audit][Auth] Payload prepared for API { username_or_email: "...", password: "..." }
🛡️ [Phoenix Audit][Auth] Login successful { userId: "...", accessToken: "..." }
```

---

### ג. Fidelity Resilience

**וידוא שהצגת שגיאות (Error States) משתמשת ברכיבי ה-LEGO המאושרים.**

**בדיקה:**
1. יצירת שגיאה מכוונת (למשל: credentials שגויים)
2. בדיקה שהשגיאה מוצגת באמצעות:
   - ✅ רכיבי LEGO (`tt-container`, `tt-section`)
   - ✅ CSS classes מ-BEM (`auth-form__error`)
   - ✅ JS selectors עם `js-` prefix (`js-error-feedback`)

**דוגמה:**
```html
<!-- ✅ נכון - Error Display -->
<tt-container>
  <tt-section>
    <div class="auth-form__error js-error-feedback" hidden>
      שגיאה בהתחברות. אנא בדוק את פרטיך.
    </div>
  </tt-section>
</tt-container>
```

---

## 4. דוגמה מעשית מלאה

```javascript
/**
 * PHOENIX JS CORE IMPLEMENTATION (v1.1 - Final Execution Standard)
 * ------------------------------------------------------------
 * קובץ זה מהווה דוגמה מחייבת למימוש לוגיקה צד-לקוח.
 * דגשים: Transformation Layer, js- selectors, ו-Audit Trail.
 */

import { audit } from './utils/audit.js';
import { apiToReact, reactToApi } from './utils/transformers.js';

/**
 * AuthManager - ניהול אימות משתמשים
 * 
 * @description מנהל את כל תהליכי האימות (login, register, logout, refresh token)
 * @legacyReference Legacy.auth.login(), Legacy.auth.register()
 * 
 * @class
 */
class AuthManager {
  constructor() {
    this.initEventListeners();
  }

  initEventListeners() {
    // שימוש ב-js- prefix להפרדה מוחלטת מה-CSS
    const form = document.querySelector('.js-login-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleLogin(form);
    });
  }

  /**
   * Handle Login - טיפול בהתחברות
   * 
   * @description מבצע התחברות משתמש עם username/email ו-password
   * @legacyReference Legacy.auth.login(username, password)
   * 
   * @param {HTMLFormElement} formElement - אלמנט הטופס
   * @returns {Promise<void>}
   * 
   * @throws {Error} - אם האימות נכשל
   */
  async handleLogin(formElement) {
    const formData = new FormData(formElement);
    const credentials = Object.fromEntries(formData.entries());

    audit.log('Auth', 'Login attempt started', { email: credentials.email });

    try {
      // שלב 1: טרנספורמציה ל-API (snake_case)
      const payload = reactToApi(credentials);
      audit.log('Auth', 'Payload prepared for API', payload);

      // שלב 2: קריאת API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiData = await response.json();

      // שלב 3: טרנספורמציה חזרה ל-React State (camelCase)
      const userData = apiToReact(apiData);
      audit.log('Auth', 'Login successful', userData);

      // הפנייה לדאשבורד
      window.location.href = './D15_INDEX.html';

    } catch (error) {
      audit.error('Auth', 'Login failure', error);
      this.showErrorUI("שגיאה בהתחברות. אנא בדוק את פרטיך.");
    }
  }

  /**
   * Show Error UI - הצגת שגיאה למשתמש
   * 
   * @description מציג הודעת שגיאה באמצעות רכיבי LEGO
   * @param {string} message - הודעת השגיאה
   */
  showErrorUI(message) {
    // שימוש ברכיבי LEGO להצגת שגיאה
    const errorSection = document.querySelector('.js-error-feedback');
    if (errorSection) {
      errorSection.textContent = message;
      errorSection.hidden = false;
    }
  }
}

// אתחול המנהל לאחר טעינת ה-DOM
document.addEventListener('DOMContentLoaded', () => {
  new AuthManager();
});
```

---

## 5. רשימת בדיקות לפני הגשה

### ✅ בדיקות אוטומטיות

- [ ] כל API calls עוברים דרך `reactToApi` (snake_case)
- [ ] כל API responses עוברים דרך `apiToReact` (camelCase)
- [ ] כל JS selectors משתמשים ב-`js-` prefix
- [ ] אין שימוש ב-BEM classes כ-JS selectors
- [ ] כל פונקציות מתועדות ב-JSDoc עם `@legacyReference`
- [ ] Audit Trail מיושם בכל המודולים
- [ ] כל האיקונים הם SVG inline פשוטים (אין ספריות חיצוניות)

### ✅ בדיקות ידניות

- [ ] Network Integrity: Payloads ב-snake_case תקין
- [ ] Console Audit: Console נקי במצב רגיל, מלא במצב `?debug`
- [ ] Fidelity Resilience: שגיאות מוצגות ברכיבי LEGO
- [ ] Error Boundaries: מיושמים בכל הרכיבים הקריטיים
- [ ] Transformation Layer: כל תקשורת API עוברת דרך transformers

---

## 6. משאבים נוספים

- `_COMMUNICATION/nimrod/js_standards_example.js` - דוגמה מלאה מהאדריכלית
- `documentation/05-REPORTS/artifacts_SESSION_01/TEAM_10_JS_STANDARDS_REVIEW_REPORT.md` - דוח הבדיקה המקורי
- `documentation/05-DEVELOPMENT_&_CONTRACTS/OPENAPI_SPEC_V2.5.2.yaml` - OpenAPI Spec (שמות שדות)

---

## 7. עדכונים עתידיים

פרוטוקול זה יתעדכן בהתאם ל:
- שיפורים במתודולוגיה
- משוב מצוותים אחרים
- שינויים בדרישות האדריכליות

---

**Last Updated:** 2026-02-04  
**Version:** v1.6 (Added File Naming & Folder Structure Standards)  
**Maintained By:** Team 10 (The Gateway)  
**Approved By:** Chief Architect - Phoenix v252

---

## 8. היסטוריית עדכונים

### v1.6 (2026-02-04)
- ✅ **הוסף:** כללי שמות קבצים מפורטים (React Components, JavaScript, HTML, CSS)
- ✅ **הוסף:** איסורים על קיצורים לא ברורים ותחיליות מיותרות
- ✅ **הוסף:** מבנה תיקיות מפורט עם הפרדה בין גנרי לספציפי
- ✅ **הוסף:** כללי ארגון תיקיות (הפרדה לפי מודולים, אין כפילויות, אין קבצים מיותרים)
- ✅ **עודכן:** Naming Conventions Summary עם דוגמאות לכל סוג קובץ

### v1.5 (2026-01-31)
- ✅ **הוסף:** סעיף ד' - איקונים אחידים (Icon Standards)
- ✅ **הוסף:** חוק ברזל - כל האיקונים חייבים להיות SVG inline פשוטים
- ✅ **הוסף:** איסור על שימוש בספריות איקונים חיצוניות
- ✅ **הוסף:** דוגמאות לאיקונים נפוצים (Eye, EyeOff)
- ✅ **הוסף:** כללי שימוש ובדיקות לפני הגשה

### v1.4 (2026-01-31)
- ✅ **הוסף:** Transformation Layer standards
- ✅ **הוסף:** DOM Selectors standards
- ✅ **הוסף:** Audit Trail System
- ✅ **הוסף:** JSDoc requirements
