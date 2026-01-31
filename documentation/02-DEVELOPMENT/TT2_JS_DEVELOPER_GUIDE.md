# 📘 מדריך מפתח: JavaScript וצד-לקוח - פרויקט פיניקס

**פרויקט:** פיניקס (TikTrack V2)  
**קהל יעד:** מפתחי Frontend (Team 30)  
**תאריך:** 2026-01-31  
**גרסה:** 1.4

---

## 📋 מבוא

מדריך זה מספק הנחיות מעשיות לכתיבת JavaScript וצד-לקוח בפרויקט פיניקס. המדריך מבוסס על הנוהל המחייב `TT2_JS_STANDARDS_PROTOCOL.md` ומספק דוגמאות קוד מעשיות.

---

## 1. התחלה מהירה (Quick Start)

### שלב 1: יצירת מבנה תיקיות

```
ui/src/
├── services/          # API services
│   └── auth.js
├── managers/          # Business logic managers
│   └── AuthManager.js
├── utils/             # Utility functions
│   ├── transformers.js
│   ├── audit.js
│   └── debug.js
└── components/        # React components
    └── auth/
        └── LoginForm.jsx
```

### שלב 2: יצירת קובץ Transformer

```javascript
// utils/transformers.js
/**
 * Transformation Layer - המרה בין API ל-React
 */

/**
 * Transforms API response (snake_case) to React state (camelCase)
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

### שלב 3: יצירת קובץ Audit

```javascript
// utils/audit.js
class PhoenixAudit {
  constructor() {
    this.isDebug = new URLSearchParams(window.location.search).has('debug');
    this.logs = [];
    this.maxLogs = 1000;
  }

  log(module, action, data = null) {
    const entry = {
      timestamp: new Date().toISOString(),
      module,
      action,
      data,
      url: window.location.href
    };

    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    if (this.isDebug) {
      console.info(`🛡️ [Phoenix Audit][${module}] ${action}`, data || '');
    }
  }

  error(module, message, error = null) {
    console.error(`❌ [Phoenix Audit][${module}] ERROR: ${message}`, error);
    this.log(module, `ERROR: ${message}`, { error: error?.message, stack: error?.stack });
  }

  export() {
    return JSON.stringify(this.logs, null, 2);
  }
}

export const audit = new PhoenixAudit();
```

---

## 2. דוגמאות מעשיות

### דוגמה 1: יצירת Auth Service

```javascript
// services/auth.js
import { reactToApi, apiToReact } from '../utils/transformers.js';
import { audit } from '../utils/audit.js';

const API_BASE_URL = '/api/v1';

/**
 * Auth Service - שירותי אימות
 * 
 * @description מספק פונקציות לתקשורת עם API האימות
 * @legacyReference Legacy.auth
 */
export const authService = {
  /**
   * Login - התחברות משתמש
   * 
   * @param {Object} credentials - פרטי התחברות (camelCase)
   * @param {string} credentials.email - אימייל או שם משתמש
   * @param {string} credentials.password - סיסמה
   * @param {boolean} credentials.rememberMe - זכור אותי
   * @returns {Promise<Object>} - נתוני משתמש (camelCase)
   */
  async login(credentials) {
    audit.log('Auth', 'Login attempt started', { email: credentials.email });

    try {
      // המרה ל-API format (snake_case)
      const payload = reactToApi(credentials);
      audit.log('Auth', 'Payload prepared for API', payload);

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const apiData = await response.json();
      
      // המרה חזרה ל-React format (camelCase)
      const userData = apiToReact(apiData);
      audit.log('Auth', 'Login successful', { userId: userData.externalUlids });

      return userData;
    } catch (error) {
      audit.error('Auth', 'Login failure', error);
      throw error;
    }
  },

  /**
   * Register - הרשמת משתמש חדש
   * 
   * @param {Object} userData - נתוני משתמש (camelCase)
   * @returns {Promise<Object>} - נתוני משתמש (camelCase)
   */
  async register(userData) {
    audit.log('Auth', 'Register attempt started', { email: userData.email });

    try {
      const payload = reactToApi(userData);
      audit.log('Auth', 'Register payload prepared', payload);

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }

      const apiData = await response.json();
      const newUserData = apiToReact(apiData);
      audit.log('Auth', 'Register successful', { userId: newUserData.externalUlids });

      return newUserData;
    } catch (error) {
      audit.error('Auth', 'Register failure', error);
      throw error;
    }
  }
};
```

---

### דוגמה 2: יצירת Auth Manager

```javascript
// managers/AuthManager.js
import { authService } from '../services/auth.js';
import { audit } from '../utils/audit.js';

/**
 * AuthManager - מנהל אימות משתמשים
 * 
 * @description מנהל את כל תהליכי האימות והמצב הגלובלי
 * @legacyReference Legacy.auth
 * 
 * @class
 */
class AuthManager {
  constructor() {
    this.currentUser = null;
    this.initEventListeners();
  }

  /**
   * Initialize Event Listeners - אתחול מאזינים לאירועים
   */
  initEventListeners() {
    // Login form
    const loginForm = document.querySelector('.js-login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLogin(loginForm);
      });
    }

    // Register form
    const registerForm = document.querySelector('.js-register-form');
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleRegister(registerForm);
      });
    }

    // Logout button
    const logoutButton = document.querySelector('.js-logout-trigger');
    if (logoutButton) {
      logoutButton.addEventListener('click', () => {
        this.handleLogout();
      });
    }
  }

  /**
   * Handle Login - טיפול בהתחברות
   * 
   * @param {HTMLFormElement} formElement - אלמנט הטופס
   */
  async handleLogin(formElement) {
    const formData = new FormData(formElement);
    const credentials = {
      email: formData.get('email'),
      password: formData.get('password'),
      rememberMe: formData.get('remember_me') === 'on'
    };

    try {
      const userData = await authService.login(credentials);
      this.currentUser = userData;
      
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      this.showError('שגיאה בהתחברות. אנא בדוק את פרטיך.');
    }
  }

  /**
   * Handle Register - טיפול בהרשמה
   * 
   * @param {HTMLFormElement} formElement - אלמנט הטופס
   */
  async handleRegister(formElement) {
    const formData = new FormData(formElement);
    const userData = {
      username: formData.get('username'),
      email: formData.get('email'),
      password: formData.get('password'),
      phoneNumber: formData.get('phone_number')
    };

    try {
      const newUser = await authService.register(userData);
      this.currentUser = newUser;
      
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      this.showError('שגיאה בהרשמה. אנא נסה שוב.');
    }
  }

  /**
   * Handle Logout - טיפול ביציאה
   */
  async handleLogout() {
    audit.log('Auth', 'Logout initiated');
    
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' });
      this.currentUser = null;
      window.location.href = '/login';
    } catch (error) {
      audit.error('Auth', 'Logout failure', error);
      // Force logout even if API call fails
      this.currentUser = null;
      window.location.href = '/login';
    }
  }

  /**
   * Show Error - הצגת שגיאה למשתמש
   * 
   * @param {string} message - הודעת השגיאה
   */
  showError(message) {
    const errorElement = document.querySelector('.js-error-feedback');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.hidden = false;
      errorElement.classList.add('auth-form__error--visible');
    }
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.authManager = new AuthManager();
});
```

---

### דוגמה 3: שימוש ב-React Hook

```javascript
// hooks/useAuth.js
import { useState, useEffect } from 'react';
import { authService } from '../services/auth.js';
import { audit } from '../utils/audit.js';

/**
 * useAuth - Hook לניהול אימות
 * 
 * @description מספק state ו-functions לניהול אימות ב-React
 * @returns {Object} - { user, login, logout, isLoading, error }
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Login - התחברות
   * 
   * @param {Object} credentials - פרטי התחברות (camelCase)
   */
  const login = async (credentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const userData = await authService.login(credentials);
      setUser(userData);
      audit.log('Auth', 'Login successful via React hook', { userId: userData.externalUlids });
    } catch (err) {
      setError(err.message);
      audit.error('Auth', 'Login failure via React hook', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout - יציאה
   */
  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      audit.log('Auth', 'Logout successful via React hook');
    } catch (err) {
      audit.error('Auth', 'Logout failure via React hook', err);
    }
  };

  return {
    user,
    login,
    logout,
    isLoading,
    error
  };
};
```

---

### דוגמה 4: שימוש ב-React Component

```javascript
// components/auth/LoginForm.jsx
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth.js';

/**
 * LoginForm - טופס התחברות
 * 
 * @description טופס התחברות עם validation ו-error handling
 * @legacyReference D15_LOGIN.html
 */
const LoginForm = () => {
  const { login, isLoading, error } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(formData);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <form className="auth-form js-login-form" onSubmit={handleSubmit}>
      {error && (
        <div className="auth-form__error js-error-feedback">
          {error}
        </div>
      )}

      <div className="form-group">
        <label className="auth-form__label">אימייל / שם משתמש</label>
        <input
          type="text"
          name="email"
          className="auth-form__input js-email-input"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label className="auth-form__label">סיסמה</label>
        <input
          type="password"
          name="password"
          className="auth-form__input js-password-input"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label className="auth-form__label">
          <input
            type="checkbox"
            name="rememberMe"
            className="auth-form__checkbox js-remember-me"
            checked={formData.rememberMe}
            onChange={handleChange}
          />
          זכור אותי
        </label>
      </div>

      <button
        type="submit"
        className="auth-form__button auth-form__button--primary js-submit-action"
        disabled={isLoading}
      >
        {isLoading ? 'מתחבר...' : 'התחבר'}
      </button>
    </form>
  );
};

export default LoginForm;
```

---

## 3. כללי ברזל - סיכום

### ✅ חובה לעשות:

1. **Transformation Layer:**
   - כל API call חייב לעבור דרך `reactToApi` (snake_case)
   - כל API response חייב לעבור דרך `apiToReact` (camelCase)

2. **JS Selectors:**
   - כל JS selector חייב להיות עם `js-` prefix
   - דוגמה: `.js-login-form`, `.js-submit-action`

3. **Audit Trail:**
   - כל פעולה חשובה חייבת להיות מתועדת ב-Audit Trail
   - דוגמה: `audit.log('Auth', 'Login attempt started', data)`

4. **JSDoc:**
   - כל פונקציה חייבת להיות מתועדת עם `@legacyReference`

5. **Error Handling:**
   - כל פעולת API חייבת להיות עטופה ב-try-catch
   - שגיאות חייבות להיות מתועדות ב-Audit Trail

---

### ❌ אסור לעשות:

1. **אין להשתמש ב-BEM classes כ-JS selectors:**
   ```javascript
   // ❌ שגיאה!
   document.querySelector('.auth-form__button--primary');
   
   // ✅ נכון!
   document.querySelector('.js-submit-action');
   ```

2. **אין לשלוח API payloads ב-camelCase:**
   ```javascript
   // ❌ שגיאה!
   fetch('/api/login', {
     body: JSON.stringify({ usernameOrEmail: '...' })
   });
   
   // ✅ נכון!
   const payload = reactToApi({ usernameOrEmail: '...' });
   fetch('/api/login', {
     body: JSON.stringify(payload)  // { username_or_email: '...' }
   });
   ```

3. **אין להשתמש ב-React state ב-snake_case:**
   ```javascript
   // ❌ שגיאה!
   const [user, setUser] = useState({ external_ulids: '' });
   
   // ✅ נכון!
   const [user, setUser] = useState({ externalUlids: '' });
   ```

---

## 4. בדיקות לפני הגשה

### ✅ Checklist:

- [ ] כל API calls עוברים דרך `reactToApi`
- [ ] כל API responses עוברים דרך `apiToReact`
- [ ] כל JS selectors משתמשים ב-`js-` prefix
- [ ] אין שימוש ב-BEM classes כ-JS selectors
- [ ] כל פונקציות מתועדות ב-JSDoc עם `@legacyReference`
- [ ] Audit Trail מיושם בכל המודולים
- [ ] Error handling מיושם בכל הפעולות
- [ ] Console נקי במצב רגיל (ללא `?debug`)

---

## 5. משאבים נוספים

- **נוהל מחייב:** `documentation/07-POLICIES/TT2_JS_STANDARDS_PROTOCOL.md`
- **דוגמה מהאדריכלית:** `_COMMUNICATION/nimrod/js_standards_example.js`
- **OpenAPI Spec:** `documentation/05-DEVELOPMENT_&_CONTRACTS/OPENAPI_SPEC_V2.5.2.yaml`

---

**Last Updated:** 2026-01-31  
**Maintained By:** Team 10 (The Gateway)  
**For:** Team 30 (Frontend)
