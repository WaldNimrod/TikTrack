# Cube Scaffolding - תבנית ליצירת קוביות חדשות

**project_domain:** TIKTRACK

**Team 60 (DevOps & Platform)**  
**תאריך:** 2026-02-02  
**מטרה:** תבנית סטנדרטית ליצירת קוביות חדשות במערכת

---

## 📋 מבנה קוביה סטנדרטי

כל קוביה חדשה חייבת לעמוד במבנה הבא:

```
cubes/
└── [cube-name]/
    ├── components/
    │   └── [feature]/
    │       └── ComponentName.jsx
    ├── hooks/
    │   └── useFeatureHook.js
    ├── services/
    │   └── serviceName.js
    └── README.md (optional)
```

---

## 🚨 חוקי ברזל

### **1. בידוד מוחלט בין קוביות**

- ✅ כל קוביה היא אי עצמאי
- ❌ **אין imports בין קוביות** (חוץ מ-`cubes/shared`)
- ✅ כל קוביה מתקשר רק דרך `cubes/shared`

### **2. שימוש ב-Shared בלבד**

- ✅ שימוש ב-`cubes/shared/utils/transformers.js` להמרת נתונים
- ✅ שימוש ב-`cubes/shared/components/` לרכיבים משותפים
- ✅ שימוש ב-`cubes/shared/hooks/` ל-hooks משותפים

### **3. מבנה סטנדרטי**

- ✅ `components/` - רכיבי React
- ✅ `services/` - שירותי API ותקשורת עם Backend
- ✅ `hooks/` - Custom React hooks

---

## 📝 תבנית Service

```javascript
/**
 * [Service Name] - [Description]
 * -----------------------------------------------
 * שירות ל-[תיאור]
 *
 * @description [תיאור מפורט]
 * @legacyReference [אם רלוונטי]
 */

import axios from 'axios';
import { apiToReact, reactToApi } from '../../shared/utils/transformers.js';
import { audit } from '../../../utils/audit.js';
import { debugLog, debugError } from '../../../utils/debug.js';

// API Base URL
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082/api/v1';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor - Add access token
apiClient.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle 401 - Unauthorized
    if (error.response?.status === 401) {
      // Token refresh logic if needed
    }
    return Promise.reject(error);
  },
);

// Service functions
const serviceName = {
  // Add service methods here
};

export default serviceName;
```

---

## 📝 תבנית Component

```javascript
/**
 * ComponentName - [Description]
 * --------------------------------------------
 * [תיאור הרכיב]
 *
 * @description [תיאור מפורט]
 * @legacyReference [אם רלוונטי]
 */

import React, { useState, useEffect } from 'react';
import serviceName from '../../services/serviceName.js';
import { audit } from '../../../utils/audit.js';
import { debugLog } from '../../../utils/debug.js';

/**
 * ComponentName Component
 *
 * @description [תיאור הרכיב]
 */
const ComponentName = () => {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Component logic
  }, []);

  return <div className="component-name">{/* Component JSX */}</div>;
};

export default ComponentName;
```

---

## 📝 תבנית Hook

```javascript
/**
 * useFeatureHook - [Description]
 * --------------------------------------------
 * Custom hook for [feature]
 *
 * @description [תיאור ה-hook]
 */

import { useState, useEffect } from 'react';
import serviceName from '../services/serviceName.js';
import { audit } from '../../../utils/audit.js';

/**
 * useFeatureHook Hook
 *
 * @description [תיאור ה-hook]
 * @returns {Object} Hook state and methods
 */
const useFeatureHook = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Hook logic
  }, []);

  return {
    data,
    loading,
    error,
    // Add methods here
  };
};

export default useFeatureHook;
```

---

## 🛠️ שימוש ב-Scaffolding

### **יצירת קוביה חדשה:**

1. **צור תיקיית קוביה:**

   ```bash
   mkdir -p ui/src/cubes/[cube-name]/{components,services,hooks}
   ```

2. **העתק תבניות:**
   - העתק תבנית Service ל-`services/[service-name].js`
   - העתק תבנית Component ל-`components/[component-name].jsx`
   - העתק תבנית Hook ל-`hooks/[hook-name].js`

3. **עדכן imports:**
   - ודא ש-imports מ-`cubes/shared` נכונים
   - ודא שאין imports מקוביות אחרות

4. **בדוק בידוד:**
   - ודא שאין imports בין קוביות
   - ודא שכל התקשורת דרך `cubes/shared`

---

## ✅ Checklist ליצירת קוביה חדשה

- [ ] תיקיית קוביה נוצרה
- [ ] מבנה סטנדרטי (`components/`, `services/`, `hooks/`)
- [ ] אין imports בין קוביות
- [ ] שימוש ב-`cubes/shared` בלבד
- [ ] Service מוגדר עם axios interceptor
- [ ] Components משתמשים ב-audit ו-debug
- [ ] Hooks מוגדרים נכון

---

## 🔗 קבצים רלוונטיים

- `ui/src/cubes/identity/` - דוגמה למבנה קוביה קיים
- `ui/src/cubes/shared/` - לוגיקה משותפת
- `ui/vite.config.js` - קונפיגורציית Vite

---

**Team 60 (DevOps & Platform)**  
**Status:** ✅ **SCAFFOLDING TEMPLATE READY**
