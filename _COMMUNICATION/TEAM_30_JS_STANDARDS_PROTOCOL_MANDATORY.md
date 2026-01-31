# 🚨 נוהל JavaScript מחייב - Team 30 (Frontend) | MANDATORY COMPLIANCE

**From:** Team 10 (The Gateway)  
**To:** Team 30 (Frontend)  
**Date:** 2026-01-31  
**Session:** SESSION_01 - Phase 1.3  
**Status:** 🔴 **MANDATORY - CRITICAL COMPLIANCE REQUIRED**

---

## ⚠️ הודעה חשובה

לאחר ביקורת אדריכלית ראשית, האדריכלית הגדירה **נוהל JavaScript מחייב** שכל הצוותים חייבים לעמוד בו.

**זהו נוהל מחייב - אין חריגות.**

---

## 📄 מסמך מחייב

**קובץ:** `documentation/07-POLICIES/TT2_JS_STANDARDS_PROTOCOL.md`

**חובה לקרוא את המסמך המלא לפני כל עבודה על JavaScript!**

---

## 🎯 עיקרי הנוהל (Summary)

### **1. Transformation Layer - הפרדה בין Backend ל-Frontend**

#### **API Layer (Data):**
- ✅ **שימוש ב-`snake_case` בלבד**
- ✅ **חובה להיצמד לשמות השדות ב-OpenAPI Spec**
- ✅ **דוגמאות:** `external_ulids`, `phone_numbers`, `user_tier_levels`, `is_email_verified`

```javascript
// ✅ נכון - API Payload (snake_case)
const apiPayload = {
  username_or_email: "user@example.com",
  password: "secure_password_123",
  remember_me: true
};
```

#### **React Layer (UI/State):**
- ✅ **שימוש ב-`camelCase`**
- ✅ **תואם לקונבנציות React**

```javascript
// ✅ נכון - React State (camelCase)
const [user, setUser] = useState({
  externalUlids: "",
  phoneNumbers: "",
  isEmailVerified: false
});
```

#### **Transformation Requirement:**
**כל תקשורת API חייבת לעבור דרך פונקציות `apiToReact` ו-`reactToApi`.**

```javascript
import { apiToReact, reactToApi } from './utils/transformers.js';

// API Call
const payload = reactToApi({ email: 'user@example.com', password: '123' });
// Result: { email: 'user@example.com', password: '123' } → { email: '...', password: '...' }

// API Response
const apiData = await response.json();
const userData = apiToReact(apiData);
// Result: { external_ulids: '...' } → { externalUlids: '...' }
```

---

### **2. DOM Selectors - הפרדה מוחלטת בין עיצוב ללוגיקה**

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
```

❌ **אין להשתמש ב-Classes של BEM המיועדים לעיצוב:**
```javascript
// ❌ שגיאה!
const button = document.querySelector('.auth-form__button--primary');
```

---

### **3. Audit Trail System**

**כל מודול חייב לממש רישום פעולות דרך מחלקת ה-AuditTrail.**

```javascript
import { audit } from './utils/audit.js';

// Log action
audit.log('Auth', 'Login attempt started', { email: 'user@example.com' });

// Log error
audit.error('Auth', 'Login failure', error);
```

**Debug Mode:**
- מצב רגיל: Console נקי
- מצב Debug (`?debug`): Audit Trail מלא מוצג

---

### **4. JSDoc עם Legacy Reference**

**חובה לכלול `@legacyReference` בכל פונקציה:**

```javascript
/**
 * Login - התחברות משתמש
 * 
 * @description מבצע התחברות משתמש עם username/email ו-password
 * @legacyReference Legacy.auth.login(username, password)
 * 
 * @param {string} username_or_email - שם משתמש או אימייל (Legacy Key: user_email)
 * @param {string} password - סיסמה (Legacy Key: user_password)
 * @returns {Promise<Object>} - LoginResponse עם access_token ו-user data
 */
async login(username_or_email, password) {
  // Implementation
}
```

---

### **5. מבנה תיקיות מחייב**

```
ui/src/
├── services/          # API services (snake_case for API calls)
│   ├── auth.js
│   └── apiKeys.js
├── managers/          # Business logic managers (PascalCase classes)
│   ├── AuthManager.js
│   └── ApiKeyManager.js
├── utils/             # Utility functions (camelCase)
│   ├── transformers.js  # apiToReact, reactToApi
│   ├── audit.js       # PhoenixAudit class
│   └── debug.js       # DEBUG_MODE, debugLog
└── components/        # React components (PascalCase)
    └── auth/
        └── LoginForm.jsx
```

---

## ✅ רשימת בדיקות לפני הגשה

### **בדיקות אוטומטיות:**
- [ ] כל API calls עוברים דרך `reactToApi` (snake_case)
- [ ] כל API responses עוברים דרך `apiToReact` (camelCase)
- [ ] כל JS selectors משתמשים ב-`js-` prefix
- [ ] אין שימוש ב-BEM classes כ-JS selectors
- [ ] כל פונקציות מתועדות ב-JSDoc עם `@legacyReference`
- [ ] Audit Trail מיושם בכל המודולים

### **בדיקות ידניות:**
- [ ] Network Integrity: Payloads ב-snake_case תקין (בדיקה ב-DevTools)
- [ ] Console Audit: Console נקי במצב רגיל, מלא במצב `?debug`
- [ ] Fidelity Resilience: שגיאות מוצגות ברכיבי LEGO

---

## 🚨 כללי ברזל - סיכום

1. **Transformation Layer:** חובה לכל API communication
2. **JS Selectors:** רק `js-` prefix, אין BEM classes
3. **Audit Trail:** חובה לכל פעולה חשובה
4. **JSDoc:** חובה עם `@legacyReference`
5. **Error Handling:** חובה עם Audit Trail logging

---

## 📚 משאבים

- **נוהל מחייב:** `documentation/07-POLICIES/TT2_JS_STANDARDS_PROTOCOL.md`
- **מדריך מפתח:** `documentation/02-DEVELOPMENT/TT2_JS_DEVELOPER_GUIDE.md`
- **דוגמה מהאדריכלית:** `_COMMUNICATION/nimrod/js_standards_example.js`
- **OpenAPI Spec:** `documentation/05-DEVELOPMENT_&_CONTRACTS/OPENAPI_SPEC_V2.5.2.yaml`

---

## 🔄 Next Steps

1. **🚨 CRITICAL:** קראו את `TT2_JS_STANDARDS_PROTOCOL.md` במלואו
2. **קראו את המדריך:** `TT2_JS_DEVELOPER_GUIDE.md`
3. **בדקו את הדוגמה:** `_COMMUNICATION/nimrod/js_standards_example.js`
4. **התחילו עם Transformation Layer:** יצירת `utils/transformers.js`
5. **התחילו עם Audit Trail:** יצירת `utils/audit.js`

---

## ⚠️ אזהרה אחרונה

**נוהל זה הוא מחייב. כל עבודה על JavaScript חייבת לעמוד בכל הכללים.**

**אי-עמידה בכללים תגרום לדחיית העבודה.**

---

**Prepared by:** Team 10 (The Gateway)  
**Status:** 🔴 **MANDATORY COMPLIANCE REQUIRED**  
**Effective Date:** 2026-01-31

---

**log_entry | Team 10 | JS_STANDARDS_MANDATORY | TT2_JS_STANDARDS_PROTOCOL | RED | 2026-01-31**
