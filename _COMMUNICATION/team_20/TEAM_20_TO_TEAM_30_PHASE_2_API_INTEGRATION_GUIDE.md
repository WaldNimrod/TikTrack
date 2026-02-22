# 📘 Phase 2 API Integration Guide - Team 30
**project_domain:** TIKTRACK

**id:** `TEAM_20_TO_TEAM_30_PHASE_2_API_INTEGRATION_GUIDE`  
**מאת:** Team 20 (Backend Implementation)  
**אל:** Team 30 (Frontend Execution)  
**תאריך:** 2026-02-07  
**עדכון אחרון:** 2026-02-07 (Docs Re-Aligned - Endpoints Added)  
**Session:** Phase 2 - Financial Core Active Development  
**Subject:** PHASE_2_API_INTEGRATION_GUIDE | Status: ✅ **READY FOR INTEGRATION**  
**Priority:** 🔴 **P0 - CRITICAL**

---

## 🎯 Executive Summary

**Phase 2 Backend API הושלם במלואו. מדריך זה מספק את כל המידע הנדרש לאינטגרציה מדויקת.**

**מודולים שהושלמו:**
- ✅ **D16 - Trading Accounts API** - מלא ופועל (כולל summary endpoint)
- ✅ **D18 - Brokers Fees API** - מלא ופועל
- ✅ **D21 - Cash Flows API** - מלא ופועל

**תואם ל-SSOT:**
- ✅ PDSC Boundary Contract (`documentation/01-ARCHITECTURE/TT2_PDSC_BOUNDARY_CONTRACT.md`)
- ✅ Routes SSOT (`routes.json` v1.1.2)
- ✅ Transformers Hardened (`transformers.js` v1.2)

**⚠️ חשוב - Response Schemas:**
- ✅ **Response is curated** - רק השדות הרלוונטיים ל-Frontend מופיעים
- ✅ שדות DB פנימיים (user_id, deleted_at, created_by, updated_by) **לא מופיעים ב-response**
- ✅ זה נכון ומתוכנן - Frontend לא צריך לדעת על שדות פנימיים

---

## 📋 תוכן עניינים

1. [API Base Configuration](#1-api-base-configuration)
2. [D16 - Trading Accounts API](#2-d16---trading-accounts-api)
3. [D18 - Brokers Fees API](#3-d18---brokers-fees-api)
4. [D21 - Cash Flows API](#4-d21---cash-flows-api)
5. [Error Handling](#5-error-handling)
6. [Data Transformation](#6-data-transformation)
7. [Authentication](#7-authentication)
8. [דוגמאות שימוש](#8-דוגמאות-שימוש)

---

## 1. API Base Configuration

### **Base URL:**
```
Backend: http://localhost:8082
API Prefix: /api/v1
```

### **Routes SSOT:**
**קובץ:** `ui/public/routes.json` (v1.1.2)

**חובה:** שימוש ב-`routes.json` בלבד לבניית URLs. אין routes hardcoded!

### **Headers נדרשים:**
```javascript
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <JWT_TOKEN>"
}
```

---

## 2. D16 - Trading Accounts API

### **2.1. Endpoints Overview**

| Method | Endpoint | Description | Status Code |
|:---|:---|:---|:---|
| `GET` | `/api/v1/trading_accounts` | List trading accounts (with filters) | 200 |
| `GET` | `/api/v1/trading_accounts/summary` | Get summary only | 200 |

**⚠️ עדכון (2026-02-07):** `GET /api/v1/trading_accounts/summary` נוסף לפי Architect Verdict (Gate B) - 🟢 **SSOT REQUIRED**

### **2.2. GET /api/v1/trading_accounts**

**Query Parameters:**
- `status` (boolean, optional) - Filter by is_active status (true/false)
- `search` (string, optional) - Search by account_name (partial match)

**Response Schema:**
```typescript
{
  data: Array<{
    external_ulid: string;        // ULID
    display_name: string;          // Account display name
    broker: string | null;         // Broker name
    currency: string;              // Account currency (ISO 3-letter)
    balance: string;               // Current cash balance (Decimal as string)
    positions_count: number;       // Number of open positions
    total_pl: string;              // Total unrealized P/L (Decimal as string)
    account_value: string;         // Total account value (cash + holdings) (Decimal as string)
    holdings_value: string;        // Total holdings value (Decimal as string)
    is_active: boolean;            // Account active status
    updated_at: string;            // ISO 8601 datetime
  }>;
  total: number;
}
```

**Example Request:**
```javascript
// Using Shared_Services.js (PDSC Client)
const response = await sharedServices.get('/trading_accounts', {
  status: true,
  search: 'IBKR'
});
```

**Example Response:**
```json
{
  "data": [
    {
      "external_ulid": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
      "display_name": "חשבון מסחר מרכזי (IBKR)",
      "broker": "Interactive Brokers",
      "currency": "USD",
      "balance": "142500.42",
      "positions_count": 5,
      "total_pl": "1250.50",
      "account_value": "143750.92",
      "holdings_value": "1250.50",
      "is_active": true,
      "updated_at": "2026-02-02T10:30:00Z"
    }
  ],
  "total": 1
}
```

### **2.3. GET /api/v1/trading_accounts/summary**

**Query Parameters:**
- `status` (boolean, optional) - Filter by is_active status (true/false)

**Response Schema:**
```typescript
{
  total_accounts: number;          // Total number of trading accounts
  active_accounts: number;          // Number of active trading accounts
  total_account_value: string;      // Total account value across all accounts (Decimal as string)
  total_cash_balance: string;       // Total cash balance across all accounts (Decimal as string)
  total_holdings_value: string;     // Total holdings value across all accounts (Decimal as string)
  total_unrealized_pl: string;      // Total unrealized P/L across all accounts (Decimal as string)
  total_positions: number;           // Total number of open positions across all accounts
}
```

**Example Request:**
```javascript
// Using Shared_Services.js (PDSC Client)
const summary = await sharedServices.get('/trading_accounts/summary', {
  status: true
});
```

**Example Response:**
```json
{
  "total_accounts": 5,
  "active_accounts": 3,
  "total_account_value": "500000.00",
  "total_cash_balance": "450000.00",
  "total_holdings_value": "50000.00",
  "total_unrealized_pl": "2500.50",
  "total_positions": 15
}
```

**⚠️ חשוב:**
- **Response is curated** - רק השדות הרלוונטיים ל-Frontend מופיעים
- שדות DB פנימיים (`user_id`, `deleted_at`, `created_by`, `updated_by`) **לא מופיעים ב-response**
- `Decimal` fields מוחזרים כ-`string` (JSON serialization)

---

## 3. D18 - Brokers Fees API

### **2.1. Endpoints Overview**

| Method | Endpoint | Description | Status Code |
|:---|:---|:---|:---|
| `GET` | `/api/v1/brokers_fees` | List broker fees (with filters) | 200 |
| `GET` | `/api/v1/brokers_fees/{id}` | Get single broker fee | 200 |
| `GET` | `/api/v1/brokers_fees/summary` | Get summary only | 200 |
| `POST` | `/api/v1/brokers_fees` | Create new broker fee | 201 |
| `PUT` | `/api/v1/brokers_fees/{id}` | Update broker fee | 200 |
| `DELETE` | `/api/v1/brokers_fees/{id}` | Delete broker fee (soft) | 204 |

**⚠️ עדכון (2026-02-07):** `GET /api/v1/brokers_fees/summary` נוסף לפי Architect Verdict - 🟢 **ACTIVE_DEV**

### **2.2. GET /api/v1/brokers_fees**

**Query Parameters:**
- `broker` (string, optional) - Filter by broker name (partial match)
- `commission_type` (string, optional) - Filter by commission type: `TIERED` or `FLAT`
- `search` (string, optional) - Search in broker name and commission value

**Response Schema:**
```typescript
{
  data: Array<{
    id: string;                    // ULID
    broker: string;                // Broker name
    commission_type: string;       // "TIERED" | "FLAT"
    commission_value: number;      // Decimal (NUMERIC(20,6)), >= 0
    minimum: string;               // Decimal as string (NUMERIC(20,6))
    created_at: string;           // ISO 8601 datetime
    updated_at: string;           // ISO 8601 datetime
  }>;
  total: number;
}
```

**Example Request:**
```javascript
GET /api/v1/brokers_fees?broker=Interactive&commission_type=TIERED&search=0.0035
```

**Example Response:**
```json
{
  "data": [
    {
      "id": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
      "broker": "Interactive Brokers",
      "commission_type": "TIERED",
      "commission_value": 0.0035,
      "minimum": "0.35",
      "created_at": "2026-01-31T10:00:00Z",
      "updated_at": "2026-01-31T10:00:00Z"
    }
  ],
  "total": 1
}
```

### **2.3. GET /api/v1/brokers_fees/{id}**

**Path Parameters:**
- `id` (string, required) - Broker fee ULID

**Response Schema:**
```typescript
{
  id: string;
  broker: string;
  commission_type: string;      // "TIERED" | "FLAT"
  commission_value: number;    // Decimal (NUMERIC(20,6)), >= 0
  minimum: string;            // Decimal as string
  created_at: string;
  updated_at: string;
}
```

### **2.4. POST /api/v1/brokers_fees**

**Request Schema:**
```typescript
{
  broker: string;              // Required, max 100 chars
  commission_type: string;     // Required, "TIERED" | "FLAT"
  commission_value: number;    // Required, Decimal (NUMERIC(20,6)), >= 0
  minimum: number;            // Required, >= 0
}
```

**Example Request:**
```json
{
  "broker": "Interactive Brokers",
  "commission_type": "TIERED",
  "commission_value": 0.0035,
  "minimum": 0.35
}
```

**Response:** Same as GET /{id} (201 Created)

### **2.5. PUT /api/v1/brokers_fees/{id}**

**Path Parameters:**
- `id` (string, required) - Broker fee ULID

**Request Schema:**
```typescript
{
  broker?: string;
  commission_type?: string;    // "TIERED" | "FLAT"
  commission_value?: number;   // Decimal (NUMERIC(20,6)), >= 0
  minimum?: number;            // >= 0
}
```

**Example Request:**
```json
{
  "commission_type": "FLAT",
  "commission_value": 0.00,
  "minimum": 0.00
}
```

**Response:** Same as GET /{id} (200 OK)

### **2.6. DELETE /api/v1/brokers_fees/{id}**

**Path Parameters:**
- `id` (string, required) - Broker fee ULID

**Response:** 204 No Content (empty body)

### **2.7. GET /api/v1/brokers_fees/summary**

**⚠️ עדכון (2026-02-07):** Endpoint זה נוסף לפי Architect Verdict - 🟢 **ACTIVE_DEV**

**Query Parameters:**
- `broker` (string, optional) - Filter by broker name (partial match)
- `commission_type` (string, optional) - Filter by commission type: `TIERED` or `FLAT`
- `page` (int, optional) - Ignored (pagination not applicable to summary) - **⚠️ Fixed (2026-02-07):** Added to prevent 400 errors
- `page_size` (int, optional) - Ignored (pagination not applicable to summary) - **⚠️ Fixed (2026-02-07):** Added to prevent 400 errors

**Response Schema:**
```typescript
{
  summary: {
    total_brokers: number;
    active_brokers: number;
    avg_commission_per_trade: string;      // Decimal as string
    monthly_fixed_commissions: string;     // Decimal as string
    yearly_fixed_commissions: string;      // Decimal as string
  };
}
```

**Example Request:**
```javascript
GET /api/v1/brokers_fees/summary?broker=Interactive&commission_type=TIERED
// Note: page and page_size parameters are accepted but ignored (to prevent 400 errors)
```

**Example Response:**
```json
{
  "summary": {
    "total_brokers": 5,
    "active_brokers": 4,
    "avg_commission_per_trade": "0.35",
    "monthly_fixed_commissions": "0.00",
    "yearly_fixed_commissions": "0.00"
  }
}
```

**Note:** Endpoint זה מחזיר summary בלבד, ללא רשימת broker fees. עבור רשימה מלאה, השתמש ב-`GET /api/v1/brokers_fees`.

---

## 4. D21 - Cash Flows API

### **3.1. Endpoints Overview**

| Method | Endpoint | Description | Status Code |
|:---|:---|:---|:---|
| Method | Endpoint | Description | Status Code |
|:---|:---|:---|:---|
| `GET` | `/api/v1/cash_flows` | List cash flows (with filters + summary) | 200 |
| `GET` | `/api/v1/cash_flows/{id}` | Get single cash flow | 200 |
| `GET` | `/api/v1/cash_flows/summary` | Get summary only | 200 |
| `GET` | `/api/v1/cash_flows/currency_conversions` | Get currency conversions | 200 |
| `POST` | `/api/v1/cash_flows` | Create new cash flow | 201 |
| `PUT` | `/api/v1/cash_flows/{id}` | Update cash flow | 200 |
| `DELETE` | `/api/v1/cash_flows/{id}` | Delete cash flow (soft) | 204 |

**⚠️ עדכון (2026-02-07):** `GET /api/v1/cash_flows/currency_conversions` נוסף לפי Architect Verdict - 🟢 **ACTIVE_DEV**

### **3.2. GET /api/v1/cash_flows**

**Query Parameters:**
- `trading_account_id` (string, optional) - Filter by trading account ULID
- `date_from` (date, optional) - Filter by transaction_date >= date_from (YYYY-MM-DD)
- `date_to` (date, optional) - Filter by transaction_date <= date_to (YYYY-MM-DD)
- `flow_type` (string, optional) - Filter by flow_type: `DEPOSIT`, `WITHDRAWAL`, `DIVIDEND`, `INTEREST`, `FEE`, `OTHER`
- `search` (string, optional) - Search in description and external_reference

**Response Schema:**
```typescript
{
  data: Array<{
    external_ulid: string;          // ULID
    transaction_date: string;       // YYYY-MM-DD
    flow_type: string;              // "DEPOSIT" | "WITHDRAWAL" | "DIVIDEND" | "INTEREST" | "FEE" | "OTHER"
    subtype?: string;               // From metadata.subtype
    trading_account_id: string;     // ULID
    account_name: string;           // Trading account name
    amount: string;                 // Decimal as string (NUMERIC(20,6))
    currency: string;               // ISO 3-letter (e.g., "USD")
    status?: string;                // From metadata.status
    description?: string;
  }>;
  total: number;
  summary: {
    total_deposits: string;         // Decimal as string
    total_withdrawals: string;      // Decimal as string
    net_flow: string;               // Decimal as string
  };
}
```

**Example Request:**
```javascript
GET /api/v1/cash_flows?trading_account_id=01ARZ3NDEKTSV4RRFFQ69G5FAV&date_from=2026-01-01&flow_type=DEPOSIT
```

**Example Response:**
```json
{
  "data": [
    {
      "external_ulid": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
      "transaction_date": "2026-01-20",
      "flow_type": "DEPOSIT",
      "subtype": "BANK_TRANSFER",
      "trading_account_id": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
      "account_name": "חשבון מסחר מרכזי (IBKR)",
      "amount": "5000.00",
      "currency": "USD",
      "status": "VERIFIED",
      "description": "הפקדה מהבנק"
    }
  ],
  "total": 1,
  "summary": {
    "total_deposits": "5000.00",
    "total_withdrawals": "1200.00",
    "net_flow": "3800.00"
  }
}
```

### **3.3. GET /api/v1/cash_flows/{id}**

**Path Parameters:**
- `id` (string, required) - Cash flow ULID

**Response Schema:** Same as single item in GET /api/v1/cash_flows data array

### **3.4. GET /api/v1/cash_flows/summary**

**Query Parameters:** Same as GET /api/v1/cash_flows (except `flow_type` and `search`)

**Response Schema:**
```typescript
{
  data: [];                        // Empty array
  total: 0;
  summary: {
    total_deposits: string;
    total_withdrawals: string;
    net_flow: string;
  };
}
```

### **3.5. POST /api/v1/cash_flows**

**Request Schema:**
```typescript
{
  trading_account_id: string;      // Required, ULID
  flow_type: string;               // Required, "DEPOSIT" | "WITHDRAWAL" | "DIVIDEND" | "INTEREST" | "FEE" | "OTHER"
  amount: number;                   // Required
  currency?: string;                // Optional, default "USD", ISO 3-letter
  transaction_date: string;         // Required, YYYY-MM-DD
  description?: string;             // Optional
  external_reference?: string;       // Optional, max 100 chars
  metadata?: {                      // Optional
    subtype?: string;
    status?: string;
    [key: string]: any;
  };
}
```

**Example Request:**
```json
{
  "trading_account_id": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
  "flow_type": "DEPOSIT",
  "amount": 5000.00,
  "currency": "USD",
  "transaction_date": "2026-01-20",
  "description": "הפקדה מהבנק",
  "external_reference": "BANK_TXN_12345",
  "metadata": {
    "subtype": "BANK_TRANSFER",
    "status": "VERIFIED"
  }
}
```

**Response:** Same as GET /{id} (201 Created)

### **3.7. PUT /api/v1/cash_flows/{id}**

**Path Parameters:**
- `id` (string, required) - Cash flow ULID

**Request Schema:** All fields optional (same as POST, but all optional)

**Example Request:**
```json
{
  "amount": 5500.00,
  "description": "הפקדה מעודכנת מהבנק",
  "metadata": {
    "status": "VERIFIED"
  }
}
```

**Response:** Same as GET /{id} (200 OK)

### **3.8. DELETE /api/v1/cash_flows/{id}**

**Path Parameters:**
- `id` (string, required) - Cash flow ULID

**Response:** 204 No Content (empty body)

---

## 5. Error Handling

### **4.1. PDSC Error Response Format**

**מקור SSOT:** `documentation/01-ARCHITECTURE/TT2_PDSC_BOUNDARY_CONTRACT.md`

**Error Response Schema:**
```typescript
{
  success: false;
  error: {
    code: string;                  // Error code (e.g., "VALIDATION_INVALID_FORMAT")
    message: string;                // Human-readable message
    status_code: number;            // HTTP status code
    timestamp: string;              // ISO 8601 datetime
    request_id: string;             // Request ID for tracking
    details?: {                     // Optional
      field?: string;               // Field name (for validation errors)
      suggestions?: string[];       // Optional suggestions
    };
  };
}
```

### **4.2. Common Error Codes**

| Error Code | HTTP Status | Description |
|:---|:---|:---|
| `VALIDATION_INVALID_FORMAT` | 400 | Invalid request format/validation error |
| `USER_NOT_FOUND` | 404 | Resource not found |
| `SERVER_ERROR` | 500 | Internal server error |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Access denied |

### **4.3. Example Error Response**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_INVALID_FORMAT",
    "message": "Invalid commission_type. Must be 'TIERED' or 'FLAT'",
    "status_code": 400,
    "timestamp": "2026-02-07T10:00:00Z",
    "request_id": "req_abc123def456",
    "details": {
      "field": "commission_type",
      "suggestions": ["TIERED", "FLAT"]
    }
  }
}
```

### **4.4. Error Handling Best Practices**

**חובה:** שימוש ב-PDSC Client (`Shared_Services.js`) לטיפול בשגיאות.

**דוגמה:**
```javascript
try {
  const response = await Shared_Services.fetchData('brokers_fees', {
    broker: 'Interactive',
    commission_type: 'TIERED'
  });
  // Handle success
} catch (error) {
  // PDSC Client handles error transformation
  // error.error_code, error.message available
  if (error.error_code === 'VALIDATION_INVALID_FORMAT') {
    // Handle validation error
  }
}
```

---

## 6. Data Transformation

### **5.1. Transformers Hardened v1.2**

**מקור SSOT:** `ui/src/cubes/shared/utils/transformers.js` (v1.2)

**חובה:** שימוש ב-`transformers.js` בלבד. אין transformers מקומיים!

### **5.2. Field Name Transformation**

**Backend → Frontend (API Response):**
- Backend: `snake_case` (e.g., `commission_type`, `trading_account_id`)
- Frontend: `camelCase` (e.g., `commissionType`, `tradingAccountId`)

**Frontend → Backend (API Request):**
- Frontend: `camelCase`
- Backend: `snake_case`

**דוגמה:**
```javascript
// API Response (snake_case)
{
  "commission_type": "TIERED",
  "trading_account_id": "01ARZ3NDEKTSV4RRFFQ69G5FAV"
}

// After transformers.apiToReact() (camelCase)
{
  "commissionType": "TIERED",
  "tradingAccountId": "01ARZ3NDEKTSV4RRFFQ69G5FAV"
}
```

### **5.3. Decimal Fields**

**חשוב:** Backend מחזיר `Decimal` כ-string (JSON serialization).

**Fields:**
- D18: `minimum` (NUMERIC(20,8)) → string
- D21: `amount` (NUMERIC(20,6)) → string
- D21: `total_deposits`, `total_withdrawals`, `net_flow` → string

**חובה:** המרה ל-number ב-Frontend:
```javascript
const amount = parseFloat(response.amount);  // "5000.00" → 5000.00
```

**Transformers v1.2:** מבצע המרה אוטומטית לשדות financial.

---

## 7. Authentication

### **6.1. JWT Token**

**חובה:** כל ה-requests דורשים JWT token ב-`Authorization` header.

**Format:**
```
Authorization: Bearer <JWT_TOKEN>
```

### **6.2. Token Management**

**חובה:** שימוש ב-PDSC Client (`Shared_Services.js`) שמנהל tokens אוטומטית.

**דוגמה:**
```javascript
// PDSC Client handles token automatically
const response = await Shared_Services.fetchData('brokers_fees');
```

---

## 8. דוגמאות שימוש

### **7.1. D18 - Brokers Fees - Full CRUD Example**

```javascript
import Shared_Services from '@/components/core/Shared_Services.js';
import { apiToReact, reactToApi } from '@/cubes/shared/utils/transformers.js';

// 1. List broker fees with filters
async function getBrokersFees(filters = {}) {
  try {
    const response = await Shared_Services.fetchData('brokers_fees', filters);
    // Transform snake_case → camelCase
    const transformed = response.data.map(item => apiToReact(item));
    return transformed;
  } catch (error) {
    console.error('Error fetching broker fees:', error);
    throw error;
  }
}

// 2. Get single broker fee
async function getBrokerFee(id) {
  try {
    const response = await Shared_Services.fetchData(`brokers_fees/${id}`);
    return apiToReact(response);
  } catch (error) {
    console.error('Error fetching broker fee:', error);
    throw error;
  }
}

// 3. Create broker fee
async function createBrokerFee(data) {
  try {
    // Transform camelCase → snake_case
    const requestData = reactToApi({
      broker: data.broker,
      commissionType: data.commissionType,
      commissionValue: data.commissionValue,
      minimum: data.minimum
    });
    
    const response = await Shared_Services.postData('brokers_fees', requestData);
    return apiToReact(response);
  } catch (error) {
    console.error('Error creating broker fee:', error);
    throw error;
  }
}

// 4. Update broker fee
async function updateBrokerFee(id, data) {
  try {
    const requestData = reactToApi(data);
    const response = await Shared_Services.putData(`brokers_fees/${id}`, requestData);
    return apiToReact(response);
  } catch (error) {
    console.error('Error updating broker fee:', error);
    throw error;
  }
}

// 5. Delete broker fee
async function deleteBrokerFee(id) {
  try {
    await Shared_Services.deleteData(`brokers_fees/${id}`);
    return true;
  } catch (error) {
    console.error('Error deleting broker fee:', error);
    throw error;
  }
}
```

### **7.2. D21 - Cash Flows - Full CRUD Example**

```javascript
import Shared_Services from '@/components/core/Shared_Services.js';
import { apiToReact, reactToApi } from '@/cubes/shared/utils/transformers.js';

// 1. List cash flows with filters and summary
async function getCashFlows(filters = {}) {
  try {
    const response = await Shared_Services.fetchData('cash_flows', filters);
    
    // Transform data
    const transformed = {
      data: response.data.map(item => apiToReact(item)),
      total: response.total,
      summary: {
        totalDeposits: parseFloat(response.summary.total_deposits),
        totalWithdrawals: parseFloat(response.summary.total_withdrawals),
        netFlow: parseFloat(response.summary.net_flow)
      }
    };
    
    return transformed;
  } catch (error) {
    console.error('Error fetching cash flows:', error);
    throw error;
  }
}

// 2. Get cash flow summary only
async function getCashFlowsSummary(filters = {}) {
  try {
    const response = await Shared_Services.fetchData('cash_flows/summary', filters);
    return {
      totalDeposits: parseFloat(response.summary.total_deposits),
      totalWithdrawals: parseFloat(response.summary.total_withdrawals),
      netFlow: parseFloat(response.summary.net_flow)
    };
  } catch (error) {
    console.error('Error fetching cash flows summary:', error);
    throw error;
  }
}

// 3. Create cash flow
async function createCashFlow(data) {
  try {
    const requestData = reactToApi({
      tradingAccountId: data.tradingAccountId,
      flowType: data.flowType,
      amount: data.amount,
      currency: data.currency || 'USD',
      transactionDate: data.transactionDate,  // YYYY-MM-DD
      description: data.description,
      externalReference: data.externalReference,
      metadata: data.metadata || {}
    });
    
    const response = await Shared_Services.postData('cash_flows', requestData);
    return apiToReact(response);
  } catch (error) {
    console.error('Error creating cash flow:', error);
    throw error;
  }
}

// 4. Update cash flow
async function updateCashFlow(id, data) {
  try {
    const requestData = reactToApi(data);
    const response = await Shared_Services.putData(`cash_flows/${id}`, requestData);
    return apiToReact(response);
  } catch (error) {
    console.error('Error updating cash flow:', error);
    throw error;
  }
}

// 5. Delete cash flow
async function deleteCashFlow(id) {
  try {
    await Shared_Services.deleteData(`cash_flows/${id}`);
    return true;
  } catch (error) {
    console.error('Error deleting cash flow:', error);
    throw error;
  }
}
```

### **7.3. Routes SSOT Integration**

**חובה:** שימוש ב-`routes.json` לבניית URLs.

```javascript
import routes from '@/public/routes.json';

// Get API base URL
const apiBaseUrl = `${routes.backend}${routes.api.base_url}`;

// Build endpoint URL
const endpoint = `${apiBaseUrl}/brokers_fees`;
```

**או שימוש ב-PDSC Client:**
```javascript
// PDSC Client uses routes.json automatically
const response = await Shared_Services.fetchData('brokers_fees');
```

---

## 8. Validation Rules

### **8.1. D18 - Brokers Fees**

| Field | Type | Required | Validation |
|:---|:---|:---|:---|
| `broker` | string | ✅ | Max 100 chars, not empty |
| `commission_type` | string | ✅ | "TIERED" or "FLAT" |
| `commission_value` | string | ✅ | Max 255 chars |
| `minimum` | number | ✅ | >= 0 |

### **8.2. D21 - Cash Flows**

| Field | Type | Required | Validation |
|:---|:---|:---|:---|
| `trading_account_id` | string (ULID) | ✅ | Valid ULID format |
| `flow_type` | string | ✅ | "DEPOSIT", "WITHDRAWAL", "DIVIDEND", "INTEREST", "FEE", "OTHER" |
| `amount` | number | ✅ | Any number (precision: NUMERIC(20,6)) |
| `currency` | string | ❌ | ISO 3-letter, default "USD" |
| `transaction_date` | string (date) | ✅ | YYYY-MM-DD format |
| `description` | string | ❌ | Text |
| `external_reference` | string | ❌ | Max 100 chars |
| `metadata` | object | ❌ | JSON object |

---

## 9. Important Notes

### **9.1. Decimal Precision**

- **D18 `minimum`:** NUMERIC(20,8) - 8 decimal places
- **D21 `amount`:** NUMERIC(20,6) - 6 decimal places
- **Backend returns as string** - Frontend must parse to number

### **9.2. Date Format**

- **Backend expects:** `YYYY-MM-DD` (e.g., "2026-01-20")
- **Backend returns:** `YYYY-MM-DD` (date fields)

### **9.3. ULID Format**

- **All IDs:** ULID format (26 characters, base32)
- **Example:** `01ARZ3NDEKTSV4RRFFQ69G5FAV`

### **9.4. Soft Delete**

- **DELETE operations:** Soft delete (sets `deleted_at` timestamp)
- **GET operations:** Only returns non-deleted records (`deleted_at IS NULL`)

### **9.5. Metadata (D21)**

- **Optional JSONB field** for additional data
- **Common fields:**
  - `subtype`: Flow subtype (e.g., "BANK_TRANSFER")
  - `status`: Status (e.g., "VERIFIED", "PENDING")
- **Can contain any additional fields**

---

## 10. Testing Checklist

### **D18 - Brokers Fees:**
- [ ] GET /brokers_fees - List all
- [ ] GET /brokers_fees?broker=Interactive - Filter by broker
- [ ] GET /brokers_fees?commission_type=TIERED - Filter by type
- [ ] GET /brokers_fees?search=0.0035 - Search
- [ ] GET /brokers_fees/{id} - Get single
- [ ] POST /brokers_fees - Create
- [ ] PUT /brokers_fees/{id} - Update
- [ ] DELETE /brokers_fees/{id} - Delete
- [ ] Error handling (400, 404, 500)
- [ ] Transformers (snake_case ↔ camelCase)
- [ ] Decimal conversion (minimum)

### **D21 - Cash Flows:**
- [ ] GET /cash_flows - List with summary
- [ ] GET /cash_flows?trading_account_id=... - Filter by account
- [ ] GET /cash_flows?date_from=2026-01-01 - Date filter
- [ ] GET /cash_flows?flow_type=DEPOSIT - Filter by type
- [ ] GET /cash_flows?search=bank - Search
- [ ] GET /cash_flows/{id} - Get single
- [ ] GET /cash_flows/summary - Summary only
- [ ] POST /cash_flows - Create
- [ ] PUT /cash_flows/{id} - Update
- [ ] DELETE /cash_flows/{id} - Delete
- [ ] Error handling (400, 404, 500)
- [ ] Transformers (snake_case ↔ camelCase)
- [ ] Decimal conversion (amount, summary fields)
- [ ] Metadata handling (subtype, status)

---

## 11. Resources

### **SSOT Documents:**
- **PDSC Boundary Contract:** `documentation/01-ARCHITECTURE/TT2_PDSC_BOUNDARY_CONTRACT.md`
- **Routes SSOT:** `ui/public/routes.json` (v1.1.2)
- **Transformers:** `ui/src/cubes/shared/utils/transformers.js` (v1.2)

### **Backend Code:**
- **D16 Router:** `api/routers/trading_accounts.py`
- **D16 Service:** `api/services/trading_accounts.py`
- **D16 Schema:** `api/schemas/trading_accounts.py`
- **D18 Router:** `api/routers/brokers_fees.py`
- **D18 Service:** `api/services/brokers_fees_service.py`
- **D18 Schema:** `api/schemas/brokers_fees.py`
- **D21 Router:** `api/routers/cash_flows.py`
- **D21 Service:** `api/services/cash_flows.py`
- **D21 Schema:** `api/schemas/cash_flows.py`

### **Frontend Integration:**
- **PDSC Client:** `ui/src/components/core/Shared_Services.js`
- **Transformers:** `ui/src/cubes/shared/utils/transformers.js`

---

## 12. Support

**לשאלות או בעיות:**
- **Team 20:** Backend Implementation
- **PDSC Contract:** `documentation/01-ARCHITECTURE/TT2_PDSC_BOUNDARY_CONTRACT.md`

---

**Prepared by:** Team 20 (Backend Implementation)  
**Date:** 2026-02-07  
**Session:** Phase 2 - Financial Core Active Development  
**Status:** ✅ **READY FOR INTEGRATION**

**log_entry | [Team 20] | PHASE_2 | API_INTEGRATION_GUIDE | COMPLETE | GREEN | 2026-02-07**
