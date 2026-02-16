# 🛡️ מדריך אדריכלי: אינטגרציה אוטנטיקציה בין HTML ל-React

**id:** `PHOENIX_AUTH_INTEGRATION`  
**owner:** Team 10 (The Gateway)  
**status:** 🔒 **SSOT - ACTIVE**  
**supersedes:** None (Master document)  
**last_updated:** 2026-02-05  
**version:** v1.0

**מאת:** Chief Architect (Gemini)  
**תאריך:** 2026-02-04  
**סטטוס:** 🔒 **MANDATORY - LOCKED**  
**קהל יעד:** כל המפתחים במערכת

---

## 📢 Executive Summary

**אסטרטגיה:** Auth Guard ל-HTML Pages, React Auth ל-React Components, אינטגרציה דרך Bridge.

**מטרה:** מניעת כפילויות וסנכרון בין HTML Auth Guard ל-React Auth.

---

## 🗺️ מפת תפקידים

| תפקיד | טכנולוגיה | מיקום | אחראי |
|:------|:----------|:------|:-------|
| **HTML Pages Auth** | Vanilla JS | `auth-guard.js` | Team 30 |
| **React Pages Auth** | React Components | `ProtectedRoute.jsx` | Team 30 |
| **Token Storage** | localStorage/sessionStorage | Bridge | Team 30 |
| **Token Validation** | Backend API | `token-validator.js` | Team 20 & 30 |

---

## ✅ דוגמאות נכונות

### **Auth Guard ל-HTML Pages - נכון**

```javascript
// auth-guard.js - נכון!
function isAuthenticated() {
  let token = localStorage.getItem('access_token');
  if (!token) {
    token = sessionStorage.getItem('access_token');
  }
  return !!token && token.trim() !== '';
}

function checkAuthAndRedirect() {
  if (!isAuthenticated()) {
    window.location.href = '/login';
  }
}
```

**למה זה נכון:**
- ✅ Vanilla JS - לא React
- ✅ עובד גם אם React נכשל בטעינה
- ✅ בודק token ב-localStorage/sessionStorage

---

### **Protected Route ל-React Pages - נכון**

```jsx
// ProtectedRoute.jsx - נכון!
import { useAuth } from '../cubes/identity/services/auth.js';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }
  
  return children;
};
```

**למה זה נכון:**
- ✅ React Component בתוך Cube
- ✅ משתמש ב-React Auth Service
- ✅ לא מנסה לשלוט ב-Shell

---

### **אינטגרציה דרך Bridge - נכון**

```javascript
// phoenix-filter-bridge.js - נכון!
window.PhoenixBridge = {
  // Bridge יכול לחשוף auth state
  getAuthState() {
    return {
      authenticated: !!localStorage.getItem('access_token'),
      token: localStorage.getItem('access_token')
    };
  }
};
```

**למה זה נכון:**
- ✅ Bridge חושף auth state ל-HTML ול-React
- ✅ אין כפילויות - מקור אמת יחיד

---

## ❌ דוגמאות לא נכונות

### **Auth Guard ב-React - לא נכון**

```jsx
// לא נכון! ❌
const AuthGuard = () => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }
  return null;
};
```

**למה זה לא נכון:**
- ❌ React Component - לא עובד ב-HTML Pages
- ❌ יוצר כפילות עם `auth-guard.js`

**הפתרון הנכון:**
- ✅ HTML Pages: `auth-guard.js` (Vanilla JS)
- ✅ React Pages: `ProtectedRoute.jsx` (React Component)

---

### **חוסר אינטגרציה - לא נכון**

```javascript
// לא נכון! ❌
// Auth Guard לא מכיר ב-clean routes
const publicPages = ['/login', '/register'];
// לא מכיר ב-/trading_accounts, /brokers_fees, וכו'
```

**למה זה לא נכון:**
- ❌ לא מכיר ב-clean routes החדשים
- ❌ יכול לנתב משתמשים מאומתים בטעות

**הפתרון הנכון:**
```javascript
// נכון! ✅
const cleanRoutes = {
  '/trading_accounts': '/views/financial/D16_ACCTS_VIEW.html',
  '/brokers_fees': '/views/financial/D18_BRKRS_VIEW.html',
  '/cash_flows': '/views/financial/D21_CASH_VIEW.html',
  '/user_profile': '/views/financial/user_profile.html'
};

function isHtmlPageRoute(path) {
  return cleanRoutes.hasOwnProperty(path) || path.includes('/views/');
}
```

---

## 📋 Checklist למפתחים

### **לפני יצירת Auth Guard:**

- [ ] האם זה ל-HTML Pages? → `auth-guard.js` (Vanilla JS)
- [ ] האם זה ל-React Pages? → `ProtectedRoute.jsx` (React Component)
- [ ] האם יש אינטגרציה דרך Bridge? → כן ✅

### **לפני עדכון Auth:**

- [ ] האם אני לא יוצר כפילות? → לא ✅
- [ ] האם אני מכיר ב-clean routes? → כן ✅
- [ ] האם יש אינטגרציה עם React Auth? → כן ✅

---

## ❓ FAQ למפתחים

### **Q: איפה אני צריך לשים Auth Guard?**
**A:** 
- HTML Pages: `auth-guard.js` (Vanilla JS)
- React Pages: `ProtectedRoute.jsx` (React Component)

### **Q: איך Auth Guard מכיר ב-clean routes?**
**A:** קריאה ל-`routeToHtmlMap` מ-`vite.config.js`:
```javascript
const cleanRoutes = {
  '/trading_accounts': '/views/financial/D16_ACCTS_VIEW.html',
  // ...
};
```

### **Q: איך אני מסנכרן בין HTML Auth ל-React Auth?**
**A:** דרך Bridge:
```javascript
window.PhoenixBridge.getAuthState(); // חושף auth state
```

---

## 🔗 קישורים רלוונטיים

**הנחיות אדריכליות:**
- 🛡️ Boundary Mandate: React Is Internal, HTML Is External

**קבצים נכונים:**
- `ui/src/views/financial/auth-guard.js` - HTML Pages Auth ✅
- `ui/src/cubes/identity/components/auth/ProtectedRoute.jsx` - React Pages Auth ✅
- `ui/src/components/core/phoenix-filter-bridge.js` - Bridge ✅

---

**Chief Architect (Gemini)**  
**תאריך:** 2026-02-04  
**סטטוס:** 🔒 **MANDATORY - LOCKED**

**log_entry | [Architect] | AUTH_INTEGRATION | DOCUMENTED | LOCKED | 2026-02-04**
