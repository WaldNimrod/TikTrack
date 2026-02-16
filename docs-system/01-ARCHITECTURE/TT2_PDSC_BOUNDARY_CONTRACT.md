# 🤝 PDSC Shared Boundary Contract - Team 20 + Team 30

**id:** `TT2_PDSC_BOUNDARY_CONTRACT`  
**owner:** Team 10 (The Gateway) - SSOT  
**status:** 🔒 **SSOT - ACTIVE**  
**supersedes:** `TEAM_20_30_PDSC_SHARED_BOUNDARY_CONTRACT.md` (promoted from Communication)  
**last_updated:** 2026-02-12  
**version:** v1.1 (Team 90 Binding Skeleton)

---

**מקור:** `TEAM_10_TO_TEAM_20_PDSC_BOUNDARY_CONTRACT_CRITICAL.md` + סשן חירום Team 20 + Team 30 + Team 90  
**תאריך:** 2026-02-12  
**מקור סטטוס:** ✅ **COMPLETE - FINAL** (Emergency Session) + **Team 90 Binding Skeleton**

---

## 🔒 Team 90 שלד מחייב (MANDATORY) — 2026-02-12

**מקור:** Team 90 — PDSC Boundary + Auth Contract שלד מדויק  
**סטטוס:** חובה לתיעוד ולביצוע

### A. Error Schema (JSON Error) — חובה

```json
{
  "error_code": "VALIDATION_INVALID_FORMAT",
  "detail": "human-readable error",
  "field_errors": [
    {"field": "commission_value", "message": "must be numeric"}
  ],
  "trace_id": "optional"
}
```

**שדות:**
| שדה | סוג | חובה | תיאור |
|-----|-----|------|-------|
| `error_code` | string | ✅ | קוד שגיאה (ראה Error Codes Enum) |
| `detail` | string | ✅ | הודעת שגיאה קריאה |
| `field_errors` | array | ❌ | רשימת שגיאות שדה (validation) |
| `trace_id` | string | ❌ | מזהה לעקיבה (אופציונלי) |

---

### B. Response Contract (Success) — חובה

```json
{
  "status": "ok",
  "data": {...},
  "meta": {
    "page": 1,
    "page_size": 25,
    "total": 120
  }
}
```

**שדות:**
| שדה | סוג | חובה | תיאור |
|-----|-----|------|-------|
| `status` | string | ✅ | תמיד `"ok"` בהצלחה |
| `data` | object | ✅ | נתוני התגובה |
| `meta` | object | ❌ | page, page_size, total (pagination) |

---

### C. Error Codes Enum (SSOT) — חובה

| Code | תיאור |
|------|-------|
| `VALIDATION_INVALID_FORMAT` | שגיאת validation בפורמט |
| `AUTH_INVALID_TOKEN` | טוקן לא תקין |
| `AUTH_EXPIRED_TOKEN` | טוקן שפג תוקפו |
| `RESOURCE_NOT_FOUND` | משאב לא נמצא |
| `PERMISSION_DENIED` | אין הרשאה |
| `SERVER_ERROR` | שגיאת שרת |

**מיפוי ל-ErrorCodes הקיים:** `api/utils/exceptions.py`  
- AUTH_INVALID_TOKEN ≈ AUTH_TOKEN_INVALID  
- AUTH_EXPIRED_TOKEN ≈ AUTH_TOKEN_EXPIRED  
- RESOURCE_NOT_FOUND ≈ USER_NOT_FOUND / FINANCIAL_*_NOT_FOUND  
- PERMISSION_DENIED ≈ AUTH_UNAUTHORIZED (403)

---

### D. Auth Contract — חובה

**Auth Response (SSOT):**

```json
{
  "access_token": "jwt",
  "token_type": "bearer",
  "expires_at": "2026-02-12T12:34:56Z",
  "user": {
    "id": "uuid",
    "email": "user@...",
    "role": "ADMIN|USER",
    "user_tier": "FREE|PRO|Bronze|Silver|Gold|Platinum"
  }
}
```

**Endpoints לתיעוד:** `POST /auth/login`, `POST /auth/register`, `POST /auth/refresh`, `GET /users/me`, `GET /users/profile`  
**מסמך מלא:** `documentation/07-CONTRACTS/SSOT_AUTH_CONTRACT.md`

---

### Acceptance Criteria (חובה)

- Error Schema אחיד בכל endpoint
- Success Contract אחיד בכל endpoint
- Auth responses זהים בכל זרימה
- OpenAPI/SSOT מעודכן לפי השלד
- אם נדרש — Team 90 יספק בדיקה מהירה מול הקוד

---

## 📌 שלד מחייב (Team 90 — גרסה קומפקטית) 🔒

**מקור:** הודעה מצוות 90 אושרה על ידי האדריכלית. נדרש מימוש ותיעוד OpenAPI לפי שלד זה.

### A. Error Schema (JSON Error) — מחייב

```json
{
  "error_code": "VALIDATION_INVALID_FORMAT",
  "detail": "human-readable error",
  "field_errors": [
    {"field": "commission_value", "message": "must be numeric"}
  ],
  "trace_id": "optional"
}
```

### B. Response Contract (Success) — מחייב

```json
{
  "status": "ok",
  "data": {},
  "meta": {
    "page": 1,
    "page_size": 25,
    "total": 120
  }
}
```

### C. Error Codes Enum (SSOT) — מחייב

- `VALIDATION_INVALID_FORMAT`
- `AUTH_INVALID_TOKEN`
- `AUTH_EXPIRED_TOKEN`
- `RESOURCE_NOT_FOUND`
- `PERMISSION_DENIED`
- `SERVER_ERROR`

### D. Auth Contract — שלד מחייב (SSOT)

**Auth Response:**

```json
{
  "access_token": "jwt",
  "token_type": "bearer",
  "expires_at": "2026-02-12T12:34:56Z",
  "user": {
    "id": "uuid",
    "email": "user@...",
    "role": "ADMIN|USER",
    "user_tier": "FREE|PRO|..."
  }
}
```

**Endpoints לתיעוד:**

- `POST /auth/login`
- `POST /auth/register`
- `POST /auth/refresh`
- `GET /users/me`
- `GET /users/profile`

### Acceptance Criteria (חובה)

- Error Schema אחיד בכל endpoint.
- Success Contract אחיד בכל endpoint.
- Auth responses זהים בכל זרימה.
- OpenAPI/SSOT מעודכן לפי השלד.
- אם נדרש — Team 90 יספק בדיקה מהירה מול הקוד.

---

## ✅ סשן חירום הושלם

**סשן חירום בין Team 20 ל-Team 30 הושלם בהצלחה.**

**תאריך:** 2026-02-07  
**משתתפים:** Team 20 (Backend) + Team 30 (Frontend)  
**תוצאה:** כל ההחלטות הוסכמו והמסמך עודכן בהתאם.

---

## 🎯 Executive Summary

**Shared Boundary Contract בין Backend (Team 20) ל-Frontend (Team 30) עבור PDSC.**

מסמך זה מגדיר את ה-Boundary בין השרת ללקוח:
- **Server (Team 20) = Source of Truth** - מגדיר Error Schema ו-Response Contract
- **Client (Team 30) = Implementation** - מממש Fetching, Transformers, Error Handling

---

## 🏗️ PDSC Architecture - היברידי

```
┌─────────────────────────────────────────┐
│         Backend (Team 20)               │
│  ✅ מקור החוק (Source of Truth)        │
│  - JSON Error Schema                    │
│  - Response Contract                    │
│  - Error Codes Enum                     │
└──────────────┬──────────────────────────┘
               │
               │ HTTP API (JSON)
               │
               ▼
┌─────────────────────────────────────────┐
│         Frontend (Team 30)              │
│  ✅ מקור המימוש (Implementation)       │
│  - Fetching (API Calls)                │
│  - Transformers (camelCase ↔ snake_case)│
│  - Error Handling (לפי Schema)         │
└─────────────────────────────────────────┘
```

---

## 📋 Boundary Definition

### **1. Server Responsibilities (Team 20)** ✅

#### **1.1. JSON Error Schema:**
- ✅ הגדרת Error Response Schema (JSON Schema Definition)
- ✅ כל ה-Error Codes מפורטים
- ✅ Error Response Structure מלא
- ✅ דוגמאות לכל סוג שגיאה

**מסמך:** `TEAM_20_PDSC_ERROR_SCHEMA.md`

---

#### **1.2. Response Contract:**
- ✅ הגדרת Success Response Format
- ✅ הגדרת Error Response Format
- ✅ Unified Response Schema (oneOf)
- ✅ דוגמאות לכל סוג response

**מסמך:** `TEAM_20_PDSC_RESPONSE_CONTRACT.md`

---

#### **1.3. Error Codes Enum:**
- ✅ רשימה מפורטת של כל ה-Error Codes
- ✅ תיעוד כל Error Code (מתי, למה, איך לטפל)
- ✅ קיבוץ לפי קטגוריות

**קובץ:** `api/utils/exceptions.py` - `ErrorCodes` class

---

### **2. Client Responsibilities (Team 30)** ✅

#### **2.1. Fetching (API Calls):**
- ✅ מימוש API calls (GET, POST, PUT, DELETE)
- ✅ שימוש ב-`routes.json` (SSOT) לבניית URLs
- ✅ Authorization headers management (JWT tokens)
- ✅ Query parameters construction
- ✅ Request body serialization

**דרישות:**
- שימוש ב-`routes.json` v1.1.2 לבניית URLs
- Authorization header: `Bearer {token}`
- Content-Type: `application/json`
- Error handling לפי Error Schema

---

#### **2.2. Transformers:**
- ✅ המרת Request (camelCase → snake_case)
- ✅ המרת Response (snake_case → camelCase)
- ✅ המרת מספרים כפויה לשדות פיננסיים
- ✅ טיפול ב-null/undefined (default value: 0)

**קובץ:** `ui/src/cubes/shared/utils/transformers.js` v1.2

**דרישות:**
- שימוש ב-`reactToApi()` להמרת Request
- שימוש ב-`apiToReact()` להמרת Response
- המרת מספרים כפויה לשדות פיננסיים

---

#### **2.3. Error Handling:**
- ✅ טיפול בשגיאות לפי Error Schema
- ✅ הצגת שגיאה אחידה ל-UI
- ✅ Error Recovery רק ל-network instability (לא לכל error)
- ✅ Retry Logic רק ל-network instability (לא לכל error)

**דרישות:**
- בדיקת `response.success` להבחנה בין Success ל-Error
- שימוש ב-`error.code` לזיהוי סוג שגיאה
- שימוש ב-`error.message` להצגת הודעות (עד `message_i18n` יהיה זמין)
- טיפול ב-`AUTH_TOKEN_EXPIRED` (Token Refresh - קיים ב-`auth.js`)
- שגיאה אחידה ל-UI - כל שגיאה מוצגת למשתמש בצורה אחידה

---

## 🔄 Integration Points

### **1. Request Flow:**

```
Frontend (Team 30)
  ↓
1. Transform Request (camelCase → snake_case)
  ↓
2. Build URL (from routes.json)
  ↓
3. Add Authorization Header (JWT token)
  ↓
4. Make API Call (HTTP)
  ↓
Backend (Team 20)
  ↓
5. Validate Request
  ↓
6. Process Request
  ↓
7. Return Response (Success or Error)
  ↓
Frontend (Team 30)
  ↓
8. Check Response Type (success field)
  ↓
9. Transform Response (snake_case → camelCase)
  ↓
10. Handle Error (if error)
  ↓
11. Update UI
```

---

### **2. Error Flow:**

```
Backend (Team 20)
  ↓
1. Error Occurs
  ↓
2. Create Error Response (according to Error Schema)
  ↓
3. Return Error Response (JSON)
  ↓
Frontend (Team 30)
  ↓
4. Detect Error (success === false)
  ↓
5. Parse Error (error.code, error.message)
  ↓
6. Handle Error (based on error.code)
  ↓
7. Show User-Friendly Message (error.message_i18n)
  ↓
8. Error Recovery (if applicable)
```

---

## 📝 דוגמאות Integration

### **דוגמה 1: GET Request**

```javascript
// Frontend (Team 30)

import { reactToApi, apiToReact } from '@/cubes/shared/utils/transformers';
import routesConfig from '@/public/routes.json';

async function getTradingAccounts(filters) {
  // 1. Transform Request (camelCase → snake_case)
  const apiFilters = reactToApi(filters);
  
  // 2. Build URL (from routes.json)
  const baseUrl = routesConfig.api.base_url;
  const backendPort = routesConfig.backend;
  const url = `http://localhost:${backendPort}${baseUrl}/trading_accounts`;
  
  // 3. Add Query Parameters
  const queryString = new URLSearchParams(apiFilters).toString();
  const fullUrl = `${url}?${queryString}`;
  
  // 4. Make API Call
  const response = await fetch(fullUrl, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  
  // 5. Check Response Type
  if (data.success === false) {
    // Handle Error
    const error = data.error;
    console.error('API Error:', error.code, error.message);
    
    // Show user-friendly message
    if (error.message_i18n && error.message_i18n.he) {
      showError(error.message_i18n.he);
    } else {
      showError(error.message);
    }
    
    return { type: 'error', error };
  }
  
  // 6. Transform Response (snake_case → camelCase)
  const reactData = apiToReact(data.data);
  
  return { type: 'success', data: reactData };
}
```

---

### **דוגמה 2: POST Request**

```javascript
// Frontend (Team 30)

async function createBrokerFee(brokerFeeData) {
  // 1. Transform Request (camelCase → snake_case)
  const apiData = reactToApi(brokerFeeData);
  
  // 2. Build URL
  const baseUrl = routesConfig.api.base_url;
  const backendPort = routesConfig.backend;
  const url = `http://localhost:${backendPort}${baseUrl}/brokers_fees`;
  
  // 3. Make API Call
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(apiData)
  });
  
  const data = await response.json();
  
  // 4. Check Response Type
  if (data.success === false) {
    // Handle Error
    const error = data.error;
    
    // Handle specific error codes
    if (error.code === 'VALIDATION_FIELD_REQUIRED') {
      showFieldError(error.details.field, error.message);
    } else {
      showError(error.message_i18n?.he || error.message);
    }
    
    return { type: 'error', error };
  }
  
  // 5. Transform Response
  const reactData = apiToReact(data.data);
  
  return { type: 'success', data: reactData };
}
```

---

### **דוגמה 3: Error Handling**

```javascript
// Frontend (Team 30)

function handleApiError(error) {
  switch (error.code) {
    case 'AUTH_TOKEN_EXPIRED':
      // Refresh token and retry
      return refreshTokenAndRetry();
      
    case 'AUTH_UNAUTHORIZED':
      // Redirect to login
      return redirectToLogin();
      
    case 'VALIDATION_FIELD_REQUIRED':
      // Show field-specific error
      return showFieldError(error.details.field, error.message);
      
    case 'FINANCIAL_TRADING_ACCOUNT_NOT_FOUND':
      // Show user-friendly message
      return showError(error.message_i18n?.he || error.message);
      
    default:
      // Show generic error
      return showError(error.message_i18n?.he || error.message);
  }
}
```

---

### **דוגמה 4: Backend Error Response (Python/Pydantic)**

```python
# Backend (Team 20)

from fastapi import HTTPException
from api.utils.exceptions import HTTPExceptionWithCode, ErrorCodes
from datetime import datetime
import uuid

def create_error_response(
    error_code: str,
    message: str,
    status_code: int,
    details: dict = None,
    suggestions: list = None
):
    """
    Create standardized error response according to PDSC Error Schema.
    """
    error_response = {
        "success": False,
        "error": {
            "code": error_code,
            "message": message,
            "status_code": status_code,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "request_id": f"req_{uuid.uuid4().hex[:26]}"
        }
    }
    
    # Add details if provided (only for validation errors)
    if details:
        error_response["error"]["details"] = details
        if suggestions:
            error_response["error"]["details"]["suggestions"] = suggestions
    
    return error_response

# Example usage in router
@router.get("/trading_accounts/{account_id}")
async def get_trading_account(account_id: str):
    account = await get_account_by_id(account_id)
    
    if not account:
        raise HTTPExceptionWithCode(
            status_code=404,
            detail="Trading account not found",
            error_code=ErrorCodes.FINANCIAL_TRADING_ACCOUNT_NOT_FOUND
        )
    
    return {
        "success": True,
        "data": account,
        "meta": {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "request_id": f"req_{uuid.uuid4().hex[:26]}"
        }
    }
```

---

### **דוגמה 5: Backend Success Response (Python/Pydantic)**

```python
# Backend (Team 20)

from fastapi import status
from datetime import datetime
import uuid

def create_success_response(data: dict, status_code: int = status.HTTP_200_OK):
    """
    Create standardized success response according to PDSC Response Contract.
    """
    return {
        "success": True,
        "data": data,
        "meta": {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "request_id": f"req_{uuid.uuid4().hex[:26]}"
        }
    }

# Example usage in router
@router.get("/trading_accounts")
async def list_trading_accounts():
    accounts = await get_all_accounts()
    
    return create_success_response({
        "trading_accounts": accounts,
        "count": len(accounts)
    })
```

---

### **דוגמה 6: Integration Example (End-to-End)**

```python
# Backend (Team 20) - POST /brokers_fees

@router.post("/brokers_fees")
async def create_broker_fee(broker_fee: BrokerFeeCreate):
    try:
        # Validate and create
        new_fee = await create_broker_fee_record(broker_fee)
        
        # Return success response
        return create_success_response({
            "broker_fee": new_fee
        }, status_code=status.HTTP_201_CREATED)
        
    except ValidationError as e:
        # Return validation error
        raise HTTPExceptionWithCode(
            status_code=400,
            detail=f"Validation error: {str(e)}",
            error_code=ErrorCodes.VALIDATION_FIELD_REQUIRED,
            details={
                "field": e.field,
                "value": e.value,
                "suggestions": [
                    "Check the field format",
                    "Verify the value is correct"
                ]
            }
        )
```

```javascript
// Frontend (Team 30) - Matching call

async function createBrokerFee(brokerFeeData) {
  // 1. Transform Request (camelCase → snake_case)
  const apiData = reactToApi(brokerFeeData);
  
  // 2. Build URL from routes.json
  const API_BASE_URL = await getApiBaseUrl();
  const url = `${API_BASE_URL}/brokers_fees`;
  
  // 3. Make API Call
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(apiData)
  });
  
  const data = await response.json();
  
  // 4. Check Response Type
  if (data.success === false) {
    // Handle Error according to Error Schema
    const error = data.error;
    
    if (error.code === 'VALIDATION_FIELD_REQUIRED') {
      // Show field-specific error with suggestions
      showFieldError(
        error.details.field,
        error.message,
        error.details.suggestions
      );
    } else {
      showError(error.message);
    }
    
    return { type: 'error', error };
  }
  
  // 5. Transform Response (snake_case → camelCase)
  const reactData = apiToReact(data.data);
  
  return { type: 'success', data: reactData };
}
```

---

## 🔒 החלטות משותפות מהסשן (FINAL / LOCKED)

### **1. Error Schema** ✅ **FINAL / LOCKED**

#### **1.1. Error Response Structure:**
- ✅ Error Response Structure מתאים ל-Frontend - **מוסכם**
- ✅ `message_i18n` עתידי בלבד (לא נדרש כרגע) - **מוסכם**
- ✅ `details.suggestions` רק ל-validation (לא לכל שגיאה) - **מוסכם**

#### **1.2. Error Codes:**
- ✅ כל ה-Error Codes מובנים ל-Frontend - **מוסכם**
- ✅ אין Error Codes חסרים - **מוסכם**
- ✅ אין Error Codes מיותרים - **מוסכם**

#### **1.3. Error Handling:**
- ✅ Frontend מציג שגיאה אחידה ל-UI - **מוסכם**
- ✅ Error Recovery רק ל-network instability - **מוסכם**
- ✅ Retry Logic רק ל-network instability - **מוסכם**

---

### **2. Response Contract** ✅ **FINAL / LOCKED**

#### **2.1. Success Response:**
- ✅ Success Response Structure מתאים - **מוסכם**
- ✅ `meta` נדרש: `timestamp` + `request_id` (מינימום) - **מוסכם**
- ✅ Pagination metadata לא נדרש כרגע (שימושי לעתיד) - **מוסכם**

#### **2.2. Unified Response:**
- ✅ `oneOf` (Success/Error) מתאים - **מוסכם**
- ✅ `discriminator` לא נדרש (`success` field מספיק) - **מוסכם**
- ✅ Frontend בודק `success` field להבחנה - **מוסכם**

---

### **3. Transformers Integration** ✅ **FINAL / LOCKED**

#### **3.1. Data Transformation:**
- ✅ Backend מחזיר `snake_case` - **מוסכם**
- ✅ Frontend ממיר ל-`camelCase` דרך `transformers.js` v1.2 - **מוסכם**
- ✅ המרה מתבצעת ב-Frontend בלבד - **מוסכם**

#### **3.2. Financial Fields:**
- ✅ Backend מחזיר **string** (Decimal→JSON) - **מוסכם**
- ✅ Frontend ממיר **Number** רק דרך `transformers.js` v1.2 - **מוסכם**
- ✅ אין שינוי Backend - **מוסכם**

---

### **4. Fetching Integration** ✅ **FINAL / LOCKED**

#### **4.1. API Calls:**
- ✅ Frontend משתמש ב-`fetch()` (native API) - **מוסכם**
- ✅ `fetch()` + wrapper אחיד (פחות interceptors) - **מוסכם**
- ✅ Request Interceptor לא נדרש כרגע - **מוסכם**
- ✅ Response Interceptor לא נדרש כרגע - **מוסכם**

#### **4.2. Authorization:**
- ✅ Authorization Headers: `Authorization: Bearer <token>` - **מוסכם**
- ✅ Token Refresh קיים ב-`auth.js` (axios interceptor) - **מוסכם**
- ✅ Token Expired מטופל ב-`auth.js` (redirect to login) - **מוסכם**

---

### **5. Routes SSOT Integration** ✅ **FINAL / LOCKED**

#### **5.1. URL Building:**
- ✅ Frontend משתמש ב-`routes.json` (SSOT) - **מוסכם**
- ✅ `getApiBaseUrl()` function טוען `routes.json` - **מוסכם**

#### **5.2. Version Mismatch:**
- ✅ Production = **ERROR** (block) - **מוסכם**
- ✅ Development = **WARNING** (non-block) - **מוסכם**

#### **5.3. Fallback Mechanisms:**
- ✅ Fallback ל-`/api/v1` אם `routes.json` לא זמין - **מוסכם**

---

## ✅ Validation Rules

### **Server Validation (Team 20):**

1. ✅ כל Error Response חייב להתאים ל-Error Schema
2. ✅ כל Success Response חייב להתאים ל-Success Schema
3. ✅ כל Error Code חייב להיות ב-ErrorCodes Enum
4. ✅ כל Response חייב לכלול `success` field

---

### **Client Validation (Team 30):**

1. ✅ כל Request חייב להיות מומר ל-snake_case
2. ✅ כל Response חייב להיות מומר ל-camelCase
3. ✅ כל Error חייב להיות מטופל לפי Error Schema
4. ✅ כל URL חייב להיבנות מ-`routes.json`

---

## 🔗 קישורים רלוונטיים

### **מקור המנדט:**
- `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_20_PDSC_BOUNDARY_CONTRACT_CRITICAL.md`
- `_COMMUNICATION/team_10/TEAM_10_EMERGENCY_SESSION_20_30_PDSC_BOUNDARY.md`

### **מסמכי Server (Team 20):**
- `_COMMUNICATION/team_20/TEAM_20_PDSC_ERROR_SCHEMA.md`
- `_COMMUNICATION/team_20/TEAM_20_PDSC_RESPONSE_CONTRACT.md`
- `_COMMUNICATION/team_20/TEAM_20_PDSC_ERROR_CONTRACT_SPECIFICATION.md` (v1.1)

### **קבצים:**
- `api/utils/exceptions.py` - Error Codes
- `ui/src/cubes/shared/utils/transformers.js` - Transformers
- `ui/public/routes.json` - Routes SSOT

---

## ⚠️ אזהרות קריטיות

### **1. השרת הוא מקור החוק:**
- ✅ כל Error Schema חייב להיות מוגדר מהשרת
- ✅ Frontend לא יכול לשנות את ה-Schema
- ✅ כל שינוי ב-Schema דורש עדכון ב-Server

---

### **2. הלקוח הוא מקור המימוש:**
- ✅ הלקוח מממש Fetching + Transformers
- ✅ Backend רק מגדיר את ה-Schema
- ✅ כל שינוי ב-Implementation דורש עדכון ב-Client

---

### **3. חובה תיאום:**
- ✅ אין שינוי ב-Schema ללא תיאום
- ✅ אין שינוי ב-Implementation ללא תיאום
- ✅ כל שינוי דורש עדכון במסמך זה

---

## 📋 Checklist להשלמה

### **✅ סשן חירום הושלם:**

**תאריך:** 2026-02-07  
**משתתפים:** Team 20 (Backend) + Team 30 (Frontend)

**החלטות שהוסכמו:**
- [x] ✅ Error Schema - מוסכם (FINAL / LOCKED)
- [x] ✅ Response Contract - מוסכם (FINAL / LOCKED)
- [x] ✅ Transformers Integration - מוסכם (FINAL / LOCKED)
- [x] ✅ Fetching Integration - מוסכם (FINAL / LOCKED)
- [x] ✅ Routes SSOT Integration - מוסכם (FINAL / LOCKED)
- [x] ✅ Error Handling - מוסכם (FINAL / LOCKED)

**תוצאות:**
- [x] ✅ עדכון מסמך זה עם החלטות משותפות
- [x] ✅ דוגמאות קוד משותפות (מתועדות במסמך)
- [x] ✅ תיעוד משותף (מתועד במסמך)
- [x] ✅ מוכן להגשה ל-Team 10

---

**Team 20 (Backend) + Team 30 (Frontend)**  
**תאריך:** 2026-02-07  
**סטטוס:** ✅ **COMPLETE - FINAL**

**log_entry | [Team 20_30] | PDSC | SHARED_BOUNDARY_CONTRACT | GREEN | 2026-02-07 | v1.0**
