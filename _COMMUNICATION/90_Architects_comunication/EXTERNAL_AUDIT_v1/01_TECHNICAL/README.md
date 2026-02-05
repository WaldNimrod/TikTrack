# 🔧 תיקייה טכנית - Identity Cube Snapshot

**תאריך יצירה:** 2026-02-03  
**גרסה:** v1.0  
**מטרה:** Snapshot של קוביית Identity, Transformers, וסכימות API לצורך הערכה חיצונית

---

## 📋 תוכן התיקייה

### **1. Identity Cube Snapshot**
- כל קבצי קוביית Identity (`ui/src/cubes/identity/`)
- Components, Hooks, Services

### **2. Transformers**
- קובץ Transformers (`ui/src/cubes/shared/utils/transformers.js`)
- Transformation Layer (snake_case ↔ camelCase)

### **3. API Schemas**
- סכימות OpenAPI של Identity
- חוזי API (API Contracts)

---

## 📁 קבצים

### **Architecture Documentation:**
- `ARCHITECTURE_OVERVIEW.md` - מסמך ארכיטקטורה מקיף (Frontend + Backend)

### **Performance & Scalability Documentation:**
- `PERFORMANCE_SCALABILITY.md` - תיעוד Performance Metrics, Scalability Considerations, Caching Strategy, Database Optimization

### **Identity Cube Files:**
- `identity_cube_structure.txt` - מבנה התיקייה
- `identity_cube_files_list.txt` - רשימת כל הקבצים

### **Transformers:**
- `transformers.js` - קובץ Transformers המלא

### **API Schemas:**
- `identity_api_schema.yaml` - סכימת API של Identity (מתוך OpenAPI)

### **Performance & Scalability:**
- `PERFORMANCE_SCALABILITY.md` - תיעוד Performance Metrics, Scalability Considerations, Caching Strategy, Database Optimization

---

## 🔗 קישורים לקבצים המקוריים

### **Identity Cube:**
- **מיקום:** `ui/src/cubes/identity/`
- **Components:** `ui/src/cubes/identity/components/`
- **Hooks:** `ui/src/cubes/identity/hooks/`
- **Services:** `ui/src/cubes/identity/services/`

### **Transformers:**
- **מיקום:** `ui/src/cubes/shared/utils/transformers.js`

### **API Schemas:**
- **מיקום:** `documentation/OPENAPI_SPEC_V2.yaml`
- **מיקום נוסף:** `documentation/07-CONTRACTS/OPENAPI_SPEC_V2_FINAL.yaml`

---

## 📋 הערות טכניות

### **Identity Cube Structure:**
```
identity/
├── components/
│   ├── auth/
│   │   ├── LoginForm.jsx
│   │   ├── RegisterForm.jsx
│   │   ├── PasswordResetFlow.jsx
│   │   └── ProtectedRoute.jsx
│   ├── profile/
│   │   ├── ProfileView.jsx
│   │   └── PasswordChangeForm.jsx
│   ├── AuthForm.jsx
│   ├── AuthErrorHandler.jsx
│   └── AuthLayout.jsx
├── hooks/
│   └── useAuthValidation.js
└── services/
    ├── auth.js
    └── apiKeys.js
```

### **Transformation Layer:**
- `apiToReact()` - המרה מ-snake_case ל-camelCase
- `reactToApi()` - המרה מ-camelCase ל-snake_case
- `reactToApiPasswordChange()` - המרה ספציפית לשינוי סיסמה

### **API Endpoints (Identity):**
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/reset-password`
- `POST /api/v1/auth/verify-reset`
- `POST /api/v1/auth/verify-phone`
- `GET /api/v1/users/me`
- `PUT /api/v1/users/me`
- `PUT /api/v1/users/me/password`

---

**נוצר על ידי:** Team 10 (The Gateway)  
**תאריך:** 2026-02-03  
**סטטוס:** ✅ **READY FOR EXTERNAL AUDIT**
