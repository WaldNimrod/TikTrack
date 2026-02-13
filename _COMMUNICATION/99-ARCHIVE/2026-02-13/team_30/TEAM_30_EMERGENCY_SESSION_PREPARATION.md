# 🚨 Team 30 - הכנה לסשן חירום: PDSC Shared Boundary Contract

**Team:** 30 (Frontend Execution)  
**Date:** 2026-02-07  
**Status:** 🚨 **EMERGENCY SESSION PREPARATION**  
**Priority:** 🔴 **P0 - CRITICAL**

---

## 📢 Executive Summary

**מסמך הכנה לסשן החירום עם Team 20 להשלמת PDSC Shared Boundary Contract.**

**מטרה:** להכין את Team 30 לסשן החירום עם תשובות, דוגמאות קוד, ונקודות לדיון.

**דדליין:** 8 שעות מתחילת הסשן

---

## ✅ מצב נוכחי

### **מה מוכן:**
- ✅ `TEAM_30_EFR_HARDENED_TRANSFORMERS_LOCK.md` - מוכן
- ✅ `transformers.js` v1.2 - מוכן (SSOT)
- ✅ דוגמאות קוד - מוכנות
- ✅ API calls patterns - מוכנים

### **מה צריך להסכים:**
- ⚠️ Error Schema - אישור/שינויים
- ⚠️ Response Contract - אישור/שינויים
- ⚠️ Transformers Integration - הגדרת אחריות
- ⚠️ Fetching Integration - הגדרת אחריות
- ⚠️ Routes SSOT Integration - הגדרת אחריות

---

## 📋 תשובות לשאלות צפויות

### **1. Error Schema - תשובות Team 30** 🔴

#### **1.1. Error Response Structure:**

**תשובה:**

✅ **ה-Structure הנוכחי מתאים ל-Frontend**, עם הערות:

**מה מתאים:**
- ✅ `success: false` - ברור ופשוט לבדיקה
- ✅ `error.code` - שימושי לזיהוי סוג שגיאה
- ✅ `error.message` - נדרש להצגה למשתמש
- ✅ `error.status_code` - שימושי לטיפול בשגיאות HTTP
- ✅ `error.timestamp` - שימושי ללוגים
- ✅ `error.request_id` - שימושי לדיבוג

**הערות:**
- ⚠️ `message_i18n` - **לא נדרש כרגע**, אך שימושי לעתיד
  - **החלטה:** לא נדרש כרגע, אך נשמח לתמיכה בעתיד
- ⚠️ `details.suggestions` - **שימושי**, אך לא חובה בכל שגיאה
  - **החלטה:** נדרש רק בשגיאות validation/input (לא בשגיאות server)

**דוגמת קוד (Frontend):**

```javascript
// Error handling pattern (from cashFlowsDataLoader.js)
if (!response.ok) {
  let errorDetails = '';
  try {
    const errorData = await response.json();
    
    // Check if error follows PDSC Error Schema
    if (errorData.success === false && errorData.error) {
      const error = errorData.error;
      
      // Use error code for specific handling
      if (error.code === 'FINANCIAL_TRADING_ACCOUNT_NOT_FOUND') {
        // Handle specific error
        console.error('[API] Trading account not found:', error.message);
      }
      
      // Use message for user display
      const userMessage = error.message_i18n?.he || error.message;
      
      // Use suggestions if available
      if (error.details?.suggestions) {
        console.warn('[API] Suggestions:', error.details.suggestions);
      }
      
      errorDetails = JSON.stringify(errorData);
    } else {
      // Fallback for non-PDSC errors
      errorDetails = JSON.stringify(errorData);
    }
  } catch (e) {
    errorDetails = await response.text();
  }
  
  throw new Error(`API Error: ${errorDetails}`);
}
```

---

#### **1.2. Error Codes:**

**תשובה:**

✅ **כל ה-Error Codes מובנים ל-Frontend**, עם הערות:

**Error Codes קיימים (מתאימים):**
- ✅ `AUTH_*` - Authentication errors (401)
- ✅ `VALIDATION_*` - Validation errors (400)
- ✅ `USER_*` - User-related errors (400/404)
- ✅ `FINANCIAL_*` - Financial errors (400/404)
- ✅ `SERVER_ERROR` - Server errors (500)

**הערות:**
- ⚠️ **אין Error Codes חסרים** - הרשימה הנוכחית מכסה את כל המקרים
- ⚠️ **אין Error Codes מיותרים** - כל ה-Codes שימושיים

**דוגמת קוד (Frontend):**

```javascript
// Error code handling pattern
function handleApiError(errorData) {
  const errorCode = errorData.error?.code;
  
  switch (errorCode) {
    case 'AUTH_TOKEN_EXPIRED':
      // Handle token expiration (refresh or redirect to login)
      handleTokenExpired();
      break;
      
    case 'VALIDATION_FIELD_REQUIRED':
      // Handle validation error
      showValidationError(errorData.error.details?.field);
      break;
      
    case 'FINANCIAL_TRADING_ACCOUNT_NOT_FOUND':
      // Handle not found error
      showNotFoundError(errorData.error.message);
      break;
      
    default:
      // Handle generic error
      showGenericError(errorData.error.message);
  }
}
```

---

#### **1.3. Error Handling:**

**תשובה:**

**Pattern הנוכחי:**

1. **Error Handling ב-Frontend:**
   - ✅ כל שגיאה עוברת דרך `try-catch`
   - ✅ בדיקת `response.ok` לפני parsing
   - ✅ Parsing של Error Response לפי PDSC Schema
   - ✅ הצגת שגיאה למשתמש לפי `error.message`

2. **Error Recovery:**
   - ⚠️ **לא נדרש כרגע** - Frontend מציג שגיאה למשתמש
   - ⚠️ **עתיד:** ניתן להוסיף Retry Logic אם נדרש

3. **Retry Logic:**
   - ⚠️ **לא נדרש כרגע** - Frontend לא מבצע retry אוטומטי
   - ⚠️ **עתיד:** ניתן להוסיף Retry Logic אם נדרש (למשל, עבור network errors)

**דוגמת קוד (Frontend):**

```javascript
// Error handling pattern (from cashFlowsDataLoader.js)
async function fetchCashFlows(filters = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      }
    });
    
    if (!response.ok) {
      // Parse error response
      const errorData = await response.json();
      
      // Handle error according to PDSC Error Schema
      if (errorData.success === false && errorData.error) {
        handleApiError(errorData);
      }
      
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    // Parse success response
    const data = await response.json();
    return apiToReact(data.data); // Transform using transformers.js
  } catch (error) {
    console.error('[API] Fetch error:', error);
    throw error;
  }
}
```

---

### **2. Response Contract - תשובות Team 30** 🔴

#### **2.1. Success Response:**

**תשובה:**

✅ **ה-Structure הנוכחי מתאים**, עם הערות:

**מה מתאים:**
- ✅ `success: true` - ברור ופשוט לבדיקה
- ✅ `data` - גמיש (structure varies by endpoint)
- ✅ `meta.timestamp` - שימושי ללוגים
- ✅ `meta.request_id` - שימושי לדיבוג

**הערות:**
- ⚠️ **`meta` נדרש:** `timestamp` + `request_id` (מינימום)
- ⚠️ **Pagination metadata:** **לא נדרש כרגע**, אך שימושי לעתיד
  - **החלטה:** לא נדרש כרגע, אך נשמח לתמיכה בעתיד (למשל, `meta.pagination`)

**דוגמת קוד (Frontend):**

```javascript
// Success response handling pattern
async function fetchCashFlows(filters = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    }
  });
  
  if (!response.ok) {
    // Handle error...
  }
  
  const responseData = await response.json();
  
  // Check success flag
  if (responseData.success === true) {
    // Extract data
    const data = responseData.data;
    
    // Use meta for logging/debugging
    if (responseData.meta) {
      console.log('[API] Request ID:', responseData.meta.request_id);
      console.log('[API] Timestamp:', responseData.meta.timestamp);
    }
    
    // Transform using transformers.js
    return apiToReact(data);
  } else {
    // Handle error...
  }
}
```

---

#### **2.2. Unified Response:**

**תשובה:**

✅ **`oneOf` (Success/Error) מתאים**, עם הערות:

**למה `oneOf` מתאים:**
- ✅ Frontend יכול לבדוק `success: true/false`
- ✅ TypeScript/JavaScript יכול לבדוק את ה-type
- ✅ ברור ופשוט

**הערות:**
- ⚠️ **`discriminator`:** **לא נדרש כרגע** - `success` field מספיק
- ⚠️ **Success/Error Detection:** Frontend בודק `success` field

**דוגמת קוד (Frontend):**

```javascript
// Unified response handling pattern
async function handleApiResponse(response) {
  const responseData = await response.json();
  
  // Check success flag (discriminator)
  if (responseData.success === true) {
    // Success response
    return {
      success: true,
      data: apiToReact(responseData.data),
      meta: responseData.meta
    };
  } else if (responseData.success === false) {
    // Error response
    throw {
      success: false,
      error: responseData.error
    };
  } else {
    // Invalid response (should not happen)
    throw new Error('Invalid response format');
  }
}
```

---

### **3. Transformers Integration - תשובות Team 30** 🔴

#### **3.1. Data Transformation:**

**תשובה:**

✅ **המרה מתבצעת ב-Frontend** (transformers.js v1.2):

**לפי ה-Specs הקיימים:**

1. **Backend מחזיר:**
   - ✅ `snake_case` (למשל, `user_id`, `created_at`, `brokers_fees`)

2. **Frontend ממיר:**
   - ✅ `camelCase` (למשל, `userId`, `createdAt`, `brokersFees`)
   - ✅ באמצעות `transformers.js` v1.2
   - ✅ `apiToReact()` - API → Frontend
   - ✅ `reactToApi()` - Frontend → API

**מסמכים:**
- `_COMMUNICATION/team_30/TEAM_30_EFR_HARDENED_TRANSFORMERS_LOCK.md`
- `ui/src/cubes/shared/utils/transformers.js`

**דוגמת קוד (Frontend):**

```javascript
// Import centralized transformers (transformers.js v1.2)
import { apiToReact, reactToApi } from '../../../cubes/shared/utils/transformers.js';

// API → Frontend (snake_case → camelCase)
async function fetchCashFlows(filters = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    }
  });
  
  const responseData = await response.json();
  
  if (responseData.success === true) {
    // Transform API response (snake_case) to Frontend (camelCase)
    const transformedData = apiToReact(responseData.data);
    return transformedData;
  }
}

// Frontend → API (camelCase → snake_case)
async function createCashFlow(cashFlowData) {
  // Transform Frontend data (camelCase) to API request (snake_case)
  const apiPayload = reactToApi(cashFlowData);
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify(apiPayload)
  });
  
  return response;
}
```

---

#### **3.2. Financial Fields:**

**תשובה (עודכן לפי ממצאי Team 20):**

✅ **Backend מחזיר strings** - זה תקין ואין צורך בשינוי:

**לפי ממצאי Team 20:**
- ✅ **Backend משתמש ב-`Decimal` (Pydantic)**
- ✅ **Pydantic ממיר `Decimal` ל-string ב-JSON** (לפי תקן JSON)
- ✅ **כלומר, Backend מחזיר strings עבור financial fields** (למשל, `"142500.42"`)

**לפי ה-Specs של Frontend:**
- ✅ **Frontend ממיר למספרים** (forced number conversion)
- ✅ **המרה מתבצעת ב-`transformers.js` v1.2**

**החלטה מוצעת:**
- ✅ **המצב הנוכחי תקין** - אין צורך בשינוי ב-Backend
- ✅ **Backend מחזיר strings** (תקן JSON)
- ✅ **Frontend ממיר למספרים** (forced number conversion)

**דוגמת קוד (Frontend):**

```javascript
// transformers.js v1.2 - Financial fields conversion
const FINANCIAL_FIELDS = ['balance', 'price', 'amount', 'total', 'value', 'quantity', 'cost', 'fee', 'commission', 'profit', 'loss', 'equity', 'margin'];

function convertFinancialField(value, key) {
  const isFinancialField = FINANCIAL_FIELDS.some(field => 
    key.toLowerCase().includes(field.toLowerCase())
  );
  
  if (!isFinancialField) {
    return value;
  }
  
  // For financial fields: forced number conversion with default value
  if (value === null || value === undefined) {
    return 0; // Default value for null/undefined financial fields
  }
  
  // Convert to number (Backend returns string, e.g., "142500.42")
  const numValue = Number(value);
  
  // Return 0 if conversion failed (NaN)
  return isNaN(numValue) ? 0 : numValue;
}

// Example: Backend returns "142500.42" (string) → Frontend converts to 142500.42 (number)
const apiData = { balance: "142500.42", price: null };
const reactData = apiToReact(apiData);
// Returns: { balance: 142500.42, price: 0 }
```

**תשובה לסשן:**
- ✅ **Backend מחזיר strings** (תקן JSON - Pydantic Decimal → string)
- ✅ **Frontend ממיר למספרים** (forced number conversion)
- ✅ **אין צורך בשינוי ב-Backend** - המצב הנוכחי תקין

---

### **4. Fetching Integration - תשובות Team 30** 🔴

#### **4.1. API Calls:**

**תשובה:**

**Pattern הנוכחי:**

1. **API Calls:**
   - ✅ Frontend משתמש ב-`fetch()` (native API)
   - ✅ שימוש ב-`routes.json` (SSOT) לבניית URLs
   - ✅ שימוש ב-`transformers.js` v1.2 להמרת נתונים

2. **Request Interceptor:**
   - ⚠️ **לא נדרש כרגע** - Frontend מוסיף headers ישירות
   - ⚠️ **עתיד:** ניתן להוסיף Request Interceptor אם נדרש (למשל, עבור logging)

3. **Response Interceptor:**
   - ⚠️ **לא נדרש כרגע** - Frontend מטפל ב-responses ישירות
   - ⚠️ **עתיד:** ניתן להוסיף Response Interceptor אם נדרש (למשל, עבור error handling)

**דוגמת קוד (Frontend):**

```javascript
// API calls pattern (from cashFlowsDataLoader.js)
async function getApiBaseUrl() {
  // Load routes.json (SSOT)
  const response = await fetch('/routes.json');
  const routes = await response.json();
  
  // Construct API base URL from routes.json SSOT
  if (routes.api && routes.api.base_url) {
    return routes.api.base_url; // e.g., "/api/v1"
  }
  
  // Fallback
  return '/api/v1';
}

async function fetchCashFlows(filters = {}) {
  // Get API base URL from routes.json (SSOT)
  const API_BASE_URL = await getApiBaseUrl();
  
  // Build URL
  const params = new URLSearchParams();
  if (filters.tradingAccount) params.append('trading_account', filters.tradingAccount);
  const url = `${API_BASE_URL}/cash_flows${params.toString() ? '?' + params.toString() : ''}`;
  
  // Make API call
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    }
  });
  
  // Handle response
  const responseData = await response.json();
  if (responseData.success === true) {
    return apiToReact(responseData.data);
  }
}
```

**הערה:** יש גם שימוש ב-`axios` ב-`auth.js` (למשל, עבור token refresh), אך ה-pattern העיקרי הוא `fetch()`.

---

#### **4.2. Authorization:**

**תשובה:**

**Pattern הנוכחי:**

1. **Authorization Headers:**
   - ✅ `Authorization: Bearer <token>`
   - ✅ `Content-Type: application/json`
   - ✅ `Accept: application/json`

2. **Token Management:**
   - ✅ Frontend שולח token ב-Headers (מ-`localStorage`)
   - ⚠️ **Token Refresh:** **קיים** ב-`auth.js` (axios interceptor)
   - ⚠️ **Token Expired:** **מטופל** ב-`auth.js` (redirect to login)

**דוגמת קוד (Frontend):**

```javascript
// Authorization pattern (from cashFlowsDataLoader.js)
function getAuthHeader() {
  const token = localStorage.getItem('access_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// Usage
const response = await fetch(url, {
  headers: {
    'Content-Type': 'application/json',
    ...getAuthHeader()
  }
});
```

**דוגמת קוד (Token Refresh - from auth.js):**

```javascript
// Token refresh pattern (from auth.js)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 and not already retrying, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        
        const { access_token } = apiToReact(refreshResponse.data);
        localStorage.setItem('access_token', access_token);
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout user
        localStorage.removeItem('access_token');
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
```

---

### **5. Routes SSOT Integration - תשובות Team 30** 🔴

#### **5.1. URL Building:**

**תשובה:**

✅ **Frontend משתמש ב-`routes.json` (SSOT):**

**לפי ה-Specs הקיימים:**

1. **URL Building:**
   - ✅ Frontend טוען `routes.json` (SSOT)
   - ✅ בונה URLs לפי `routes.json`
   - ✅ שימוש ב-`getApiBaseUrl()` (loader function)

2. **Version Handling:**
   - ✅ Frontend בודק version של `routes.json`
   - ✅ זורק warning אם version לא תואם (לא error)

**דוגמת קוד (Frontend):**

```javascript
// URL building pattern (from cashFlowsDataLoader.js)
async function getApiBaseUrl() {
  try {
    const response = await fetch('/routes.json');
    if (!response.ok) {
      throw new Error('Failed to load routes.json');
    }
    const routes = await response.json();
    
    // Verify routes.json version (should be v1.1.2)
    if (routes.version !== '1.1.2') {
      console.warn('[Data Loader] routes.json version mismatch. Expected v1.1.2, got:', routes.version);
    }
    
    // Construct API base URL from routes.json SSOT
    if (routes.api && routes.api.base_url) {
      return routes.api.base_url; // e.g., "/api/v1"
    }
    
    // Fallback
    return '/api/v1';
  } catch (error) {
    console.error('[Data Loader] Error loading routes.json (SSOT), using fallback:', error);
    return '/api/v1'; // Fallback
  }
}
```

---

#### **5.2. Version Mismatch:**

**תשובה:**

⚠️ **צריך להחליט בסשן** - זה נושא לדיון:

**המצב הנוכחי:**
- ✅ Frontend מציג **warning** (לא error) אם version לא תואם
- ✅ Frontend ממשיך לפעול גם עם version mismatch

**החלטה נדרשת:**
- ⚠️ **Version Mismatch:** error או warning?
- ⚠️ **מה ההשפעה של warning vs error?**

**המלצה של Team 30:**
- ⚠️ **Warning** - מאפשר המשך פעולה (גמיש יותר)
- ⚠️ **Error** - מאלץ תיקון מיידי (יותר בטוח)

**תשובה לסשן:**
- [ ] להחליט: Version Mismatch = error או warning?
- [ ] להבין את ההשפעה של כל אפשרות

---

#### **5.3. Fallback Mechanisms:**

**תשובה:**

✅ **Fallback Mechanisms קיימים** - מספיקים:

**Fallback Mechanisms:**
- ✅ אם `routes.json` לא נטען → Fallback ל-`/api/v1`
- ✅ אם `routes.api.base_url` לא קיים → Fallback ל-`/api/v1`
- ✅ Frontend ממשיך לפעול גם אם `routes.json` לא זמין

**החלטה:**
- ✅ **Fallback Mechanisms מספיקים** - אין צורך בשינויים

---

## 📋 נקודות לדיון

### **1. Error Schema:**
- [ ] `message_i18n` - נדרש כרגע או בעתיד? (תשובה מוכנה: לא נדרש כרגע, אך שימושי לעתיד)
- [ ] `details.suggestions` - נדרש בכל שגיאה או רק בחלקן? (תשובה מוכנה: רק validation/input)

### **2. Response Contract:**
- [ ] `meta.pagination` - נדרש כרגע או בעתיד? (תשובה מוכנה: לא נדרש כרגע, אך שימושי לעתיד)
- [x] `discriminator` - נדרש או `success` מספיק? (תשובה: `success` מספיק)

### **3. Transformers Integration:**
- [x] ✅ Backend מחזיר strings (תקן JSON - Pydantic Decimal → string) - **ממצאי Team 20**
- [x] ✅ אין צורך בשינוי ב-Backend - המצב הנוכחי תקין - **ממצאי Team 20**

### **4. Fetching Integration:**
- [x] Request Interceptor - נדרש כרגע או בעתיד? (תשובה: לא נדרש כרגע)
- [x] Response Interceptor - נדרש כרגע או בעתיד? (תשובה: לא נדרש כרגע)

### **5. Routes SSOT Integration:**
- [ ] **Version Mismatch** - error או warning? 🚨 **CRITICAL - צריך החלטה בסשן**
- [x] ✅ Fallback Mechanisms מספיקים - אין צורך בשינויים

---

## ✅ Checklist הכנה

### **לפני הסשן:**

- [x] קריאת `TEAM_20_PDSC_ERROR_SCHEMA.md` (בדיקה)
- [x] קריאת `TEAM_20_PDSC_RESPONSE_CONTRACT.md` (בדיקה)
- [x] קריאת `TEAM_30_EFR_HARDENED_TRANSFORMERS_LOCK.md` (להבין אחריות)
- [x] הכנת תשובות לשאלות על Error Schema
- [x] הכנת תשובות לשאלות על Response Contract
- [x] הכנת תשובות לשאלות על Transformers Integration
- [x] הכנת תשובות לשאלות על Fetching Integration
- [x] הכנת דוגמאות קוד (Frontend)

---

## 🔗 קבצים רלוונטיים

### **Specs:**
- `_COMMUNICATION/team_20/TEAM_20_PDSC_ERROR_SCHEMA.md` ✅
- `_COMMUNICATION/team_20/TEAM_20_PDSC_RESPONSE_CONTRACT.md` ✅
- `_COMMUNICATION/team_20/TEAM_20_30_PDSC_SHARED_BOUNDARY_CONTRACT.md` ⚠️ (טיוטה)

### **Frontend Specs:**
- `_COMMUNICATION/team_30/TEAM_30_EFR_HARDENED_TRANSFORMERS_LOCK.md`
- `ui/src/cubes/shared/utils/transformers.js`

### **דוגמאות קוד:**
- `ui/src/views/financial/cashFlows/cashFlowsDataLoader.js`
- `ui/src/views/financial/brokersFees/brokersFeesDataLoader.js`
- `ui/src/cubes/identity/services/auth.js`

### **מנדטים:**
- `_COMMUNICATION/team_10/TEAM_10_EMERGENCY_SESSION_20_30_PDSC_BOUNDARY.md`
- `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_20_30_EMERGENCY_SESSION_COORDINATION.md`
- `_COMMUNICATION/team_10/TEAM_10_EMERGENCY_SESSION_GUIDE.md`
- `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_20_PDSC_QUESTIONS_ANSWERS.md`

---

## ⚠️ אזהרות קריטיות

1. **חובה תיאום בין Team 20 ל-Team 30:**
   - ✅ אין PDSC Contract ללא הסכמה משותפת
   - ✅ כל החלטה חייבת להיות מוסכמת

2. **השרת הוא מקור החוק:**
   - ✅ כל Error Schema חייב להיות מוגדר מהשרת
   - ✅ Frontend לא יכול לשנות את ה-Schema

3. **הלקוח הוא מקור המימוש:**
   - ✅ הלקוח מממש Fetching + Transformers
   - ✅ Backend רק מגדיר את ה-Schema

---

## 🎯 הצעדים הבאים

1. **מיידי:** קריאת מסמך זה והכנה לסשן
2. **8 שעות:** ביצוע סשן חירום עם Team 20
3. **16 שעות:** השלמת Shared Boundary Contract
4. **לאחר השלמה:** הגשה ל-Team 10 לבדיקה

---

**Team 30 (Frontend Execution)**  
**תאריך:** 2026-02-07  
**סטטוס:** 🚨 **EMERGENCY SESSION PREPARATION**

**log_entry | [Team 30] | EMERGENCY_SESSION | PREPARATION | RED | 2026-02-07**
