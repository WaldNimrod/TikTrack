# 🔒 מנדט: PDSC Boundary Contract - Team 20

**id:** `TEAM_10_TO_TEAM_20_PDSC_BOUNDARY_CONTRACT_MANDATE`  
**מאת:** Team 10 (The Gateway)  
**אל:** Team 20 (Backend Implementation)  
**תאריך:** 2026-02-06  
**Session:** PDSC (Phoenix Data Service Core) - Boundary Contract  
**Subject:** PDSC_BOUNDARY_CONTRACT | Status: 🔴 **MANDATORY**  
**Priority:** 🔴 **P0 - CRITICAL**

---

## ✅ Executive Summary

**PDSC הוא היברידי — השרת מקור החוק, הלקוח מקור המימוש**

Team 20 אחראי להגדרת **JSON Error Schema** ו-**Response Contract** (Success + Error formats) שישמשו את ה-Frontend.

**חובה:** תיאום עם Team 30 לפני סיום.

---

## 🎯 מטרת המנדט

### **PDSC Architecture - היברידי:**

```
┌─────────────────────────────────────────┐
│         Backend (Team 20)               │
│  ✅ מקור החוק (Source of Truth)        │
│  - JSON Error Schema (מפורט)            │
│  - Response Contract (Success + Error) │
│  - Error Codes Enum                     │
└──────────────┬──────────────────────────┘
               │
               │ HTTP API (JSON)
               │
               ▼
┌─────────────────────────────────────────┐
│         Frontend (Team 30)              │
│  ✅ מקור המימוש (Implementation)        │
│  - Fetching (API Calls)                │
│  - Transformers (camelCase ↔ snake_case)│
│  - Error Handling (לפי Schema)         │
└─────────────────────────────────────────┘
```

### **חלוקת אחריות:**

| רכיב | צוות | אחריות |
|:---|:---|:---|
| **JSON Error Schema** | Team 20 | ✅ הגדרת Schema מפורט |
| **Response Contract** | Team 20 | ✅ Success + Error formats |
| **Error Codes Enum** | Team 20 | ✅ רשימת כל ה-Error Codes |
| **Fetching** | Team 30 | ✅ מימוש API calls |
| **Transformers** | Team 30 | ✅ המרת נתונים |
| **Error Handling** | Team 30 | ✅ טיפול לפי Schema |

---

## 📋 משימות נדרשות

### **1. JSON Error Schema (מפורט)** 🔴

**דרישה:** Schema מפורט שהשרת מחזיר לכל שגיאה.

**תוכן נדרש:**

#### **1.1. Error Response Schema:**

```json
{
  "success": false,
  "error": {
    "code": "FINANCIAL_TRADING_ACCOUNT_NOT_FOUND",
    "message": "Trading account not found",
    "message_i18n": {
      "he": "חשבון מסחר לא נמצא",
      "en": "Trading account not found"
    },
    "status_code": 404,
    "details": {
      "field": "trading_account_id",
      "value": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
      "suggestions": [
        "Check if the trading account ID is correct",
        "Verify the account belongs to the current user"
      ]
    },
    "timestamp": "2026-02-06T10:30:00Z",
    "request_id": "req_01ARZ3NDEKTSV4RRFFQ69G5FAV"
  }
}
```

#### **1.2. JSON Schema Definition:**

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "PDSC Error Response",
  "type": "object",
  "required": ["success", "error"],
  "properties": {
    "success": {
      "type": "boolean",
      "const": false
    },
    "error": {
      "type": "object",
      "required": ["code", "message", "status_code", "timestamp"],
      "properties": {
        "code": {
          "type": "string",
          "pattern": "^[A-Z_]+$",
          "description": "Error code (e.g., FINANCIAL_TRADING_ACCOUNT_NOT_FOUND)"
        },
        "message": {
          "type": "string",
          "description": "Human-readable error message (English)"
        },
        "message_i18n": {
          "type": "object",
          "additionalProperties": {
            "type": "string"
          },
          "description": "Internationalized error messages"
        },
        "status_code": {
          "type": "integer",
          "minimum": 400,
          "maximum": 599,
          "description": "HTTP status code"
        },
        "details": {
          "type": "object",
          "properties": {
            "field": {
              "type": "string",
              "description": "Field name that caused the error"
            },
            "value": {
              "type": "string",
              "description": "Value that caused the error"
            },
            "suggestions": {
              "type": "array",
              "items": {
                "type": "string"
              },
              "description": "Suggestions for fixing the error"
            }
          }
        },
        "timestamp": {
          "type": "string",
          "format": "date-time",
          "description": "ISO 8601 timestamp"
        },
        "request_id": {
          "type": "string",
          "description": "Unique request ID for tracing"
        }
      }
    }
  }
}
```

---

### **2. Response Contract (Success + Error)** 🔴

**דרישה:** חוזה אחיד לכל ה-responses (Success ו-Error).

#### **2.1. Success Response Schema:**

```json
{
  "success": true,
  "data": {
    // Response data (varies by endpoint)
  },
  "meta": {
    "timestamp": "2026-02-06T10:30:00Z",
    "request_id": "req_01ARZ3NDEKTSV4RRFFQ69G5FAV"
  }
}
```

#### **2.2. JSON Schema Definition:**

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "PDSC Success Response",
  "type": "object",
  "required": ["success"],
  "properties": {
    "success": {
      "type": "boolean",
      "const": true
    },
    "data": {
      "type": "object",
      "description": "Response data (structure varies by endpoint)"
    },
    "meta": {
      "type": "object",
      "properties": {
        "timestamp": {
          "type": "string",
          "format": "date-time"
        },
        "request_id": {
          "type": "string"
        }
      }
    }
  }
}
```

#### **2.3. Unified Response Schema:**

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "PDSC Unified Response",
  "oneOf": [
    {
      "$ref": "#/definitions/SuccessResponse"
    },
    {
      "$ref": "#/definitions/ErrorResponse"
    }
  ],
  "definitions": {
    "SuccessResponse": {
      "type": "object",
      "required": ["success"],
      "properties": {
        "success": {
          "type": "boolean",
          "const": true
        },
        "data": {
          "type": "object"
        },
        "meta": {
          "type": "object"
        }
      }
    },
    "ErrorResponse": {
      "type": "object",
      "required": ["success", "error"],
      "properties": {
        "success": {
          "type": "boolean",
          "const": false
        },
        "error": {
          "type": "object",
          "required": ["code", "message", "status_code", "timestamp"]
        }
      }
    }
  }
}
```

---

### **3. Error Codes Enum (מפורט)** 🔴

**דרישה:** רשימה מפורטת של כל ה-Error Codes.

#### **3.1. Error Codes Structure:**

```python
# api/utils/error_codes.py

class ErrorCodes:
    """Standard error codes for the API."""
    
    # Authentication Errors
    AUTH_INVALID_CREDENTIALS = "AUTH_INVALID_CREDENTIALS"
    AUTH_TOKEN_EXPIRED = "AUTH_TOKEN_EXPIRED"
    AUTH_UNAUTHORIZED = "AUTH_UNAUTHORIZED"
    # ... (כל ה-Error Codes הקיימים)
    
    # Financial Cube Errors
    FINANCIAL_TRADING_ACCOUNT_NOT_FOUND = "FINANCIAL_TRADING_ACCOUNT_NOT_FOUND"
    FINANCIAL_TRADING_ACCOUNT_ALREADY_EXISTS = "FINANCIAL_TRADING_ACCOUNT_ALREADY_EXISTS"
    FINANCIAL_CASH_FLOW_NOT_FOUND = "FINANCIAL_CASH_FLOW_NOT_FOUND"
    FINANCIAL_BROKER_FEE_NOT_FOUND = "FINANCIAL_BROKER_FEE_NOT_FOUND"
    # ... (כל ה-Error Codes הפיננסיים)
```

#### **3.2. Error Codes Documentation:**

```markdown
# Error Codes Reference

## Authentication Errors (AUTH_*)
- `AUTH_INVALID_CREDENTIALS` - Invalid username/password
- `AUTH_TOKEN_EXPIRED` - JWT token expired
- ...

## Financial Cube Errors (FINANCIAL_*)
- `FINANCIAL_TRADING_ACCOUNT_NOT_FOUND` - Trading account not found
- `FINANCIAL_CASH_FLOW_INVALID_AMOUNT` - Invalid cash flow amount
- ...
```

---

## 🔗 תיאום עם Team 30 - חובה

### **חובה לפני סיום:**

1. **שיתוף JSON Schema** עם Team 30
2. **אימות Response Contract** עם Team 30
3. **בדיקת Error Codes** - האם כל ה-Codes מובנים ל-Frontend?
4. **דוגמאות קוד** - Team 30 צריך דוגמאות של Error Handling

### **סשן חירום:**

אם יש חילוקי דעות או שאלות, יש לקיים **סשן חירום** עם Team 30 (ראה `TEAM_10_EMERGENCY_SESSION_20_30_PDSC_BOUNDARY.md`).

---

## 📋 Checklist להשלמה

### **שלב 1: JSON Error Schema** (עד 8 שעות)
- [ ] הגדרת Error Response Schema (JSON)
- [ ] יצירת JSON Schema Definition
- [ ] דוגמאות לכל סוגי שגיאות
- [ ] תיעוד מפורט

### **שלב 2: Response Contract** (עד 16 שעות)
- [ ] הגדרת Success Response Schema
- [ ] הגדרת Unified Response Schema (oneOf)
- [ ] יצירת JSON Schema Definitions
- [ ] דוגמאות לכל סוגי responses
- [ ] תיעוד מפורט

### **שלב 3: Error Codes Enum** (עד 16 שעות)
- [ ] רשימה מפורטת של כל ה-Error Codes
- [ ] תיעוד כל Error Code (מתי, למה, איך לטפל)
- [ ] קיבוץ לפי קטגוריות
- [ ] דוגמאות שימוש

### **שלב 4: תיאום עם Team 30** (עד 20 שעות)
- [ ] שיתוף JSON Schema עם Team 30
- [ ] אימות Response Contract עם Team 30
- [ ] בדיקת Error Codes עם Team 30
- [ ] דוגמאות קוד ל-Team 30
- [ ] תיעוד משותף

### **שלב 5: סיכום והגשה** (עד 24 שעות)
- [ ] מסמך סיכום
- [ ] כל ה-JSON Schemas
- [ ] כל ה-Error Codes
- [ ] דוגמאות קוד
- [ ] תיעוד משותף עם Team 30

---

## ⏰ Timeline

| שלב | משימה | דדליין | סטטוס |
|:---|:---|:---|:---|
| **1** | JSON Error Schema | **8 שעות** | 🟡 |
| **2** | Response Contract | **16 שעות** | 🟡 |
| **3** | Error Codes Enum | **16 שעות** | 🟡 |
| **4** | תיאום עם Team 30 | **20 שעות** | 🟡 |
| **5** | סיכום והגשה | **24 שעות** | 🟡 |

**דדליין סופי:** 2026-02-07 (24 שעות מתחילת המנדט)

---

## 📄 קבצים נדרשים

### **קבצים ליצירה:**

1. **`api/schemas/pdsc_error_schema.json`**
   - JSON Schema Definition ל-Error Response

2. **`api/schemas/pdsc_response_schema.json`**
   - JSON Schema Definition ל-Unified Response (Success + Error)

3. **`api/utils/error_codes.py`** (עדכון)
   - Error Codes Enum מפורט

4. **`api/utils/error_codes_documentation.md`**
   - תיעוד מפורט של כל ה-Error Codes

5. **`_COMMUNICATION/team_20/TEAM_20_PDSC_BOUNDARY_CONTRACT.md`**
   - מסמך סיכום של ה-Boundary Contract

---

## ✅ דוגמאות קוד נדרשות

### **1. Error Response Example:**

```python
# api/routers/trading_accounts.py

from ..utils.exceptions import HTTPExceptionWithCode, ErrorCodes

@router.get("/trading_accounts/{account_id}")
async def get_trading_account(
    account_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        account = await service.get_trading_account_by_id(
            account_id=account_id,
            user_id=current_user.id,
            db=db
        )
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
                "timestamp": datetime.utcnow().isoformat(),
                "request_id": request.state.request_id
            }
        }
    except HTTPExceptionWithCode:
        raise
    except Exception as e:
        raise HTTPExceptionWithCode(
            status_code=500,
            detail=str(e),
            error_code=ErrorCodes.SERVER_ERROR
        )
```

### **2. Success Response Example:**

```python
# Example: Success response

{
  "success": true,
  "data": {
    "id": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
    "account_name": "IBKR Main",
    "balance": "10000.50",
    "is_active": true
  },
  "meta": {
    "timestamp": "2026-02-06T10:30:00Z",
    "request_id": "req_01ARZ3NDEKTSV4RRFFQ69G5FAV"
  }
}
```

### **3. Error Response Example:**

```python
# Example: Error response

{
  "success": false,
  "error": {
    "code": "FINANCIAL_TRADING_ACCOUNT_NOT_FOUND",
    "message": "Trading account not found",
    "message_i18n": {
      "he": "חשבון מסחר לא נמצא",
      "en": "Trading account not found"
    },
    "status_code": 404,
    "details": {
      "field": "trading_account_id",
      "value": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
      "suggestions": [
        "Check if the trading account ID is correct",
        "Verify the account belongs to the current user"
      ]
    },
    "timestamp": "2026-02-06T10:30:00Z",
    "request_id": "req_01ARZ3NDEKTSV4RRFFQ69G5FAV"
  }
}
```

---

## ⚠️ אזהרות קריטיות

### **1. השרת הוא מקור החוק:**
- ✅ כל Error Schema חייב להיות מוגדר מהשרת
- ✅ כל Response Contract חייב להיות מוגדר מהשרת
- ✅ Frontend לא יכול לשנות את ה-Schema

### **2. חובה תיאום עם Team 30:**
- ✅ אין PDSC Contract ללא הסכמה משותפת
- ✅ Team 30 חייב לאשר את ה-Schema לפני סיום
- ✅ אם יש חילוקי דעות, יש לקיים סשן חירום

### **3. JSON Schema הוא חובה:**
- ✅ כל Schema חייב להיות JSON Schema Definition
- ✅ כל Schema חייב להיות validated
- ✅ כל Schema חייב להיות מתועד

---

## 🔗 קישורים רלוונטיים

### **מקור המנדט:**
- `_COMMUNICATION/90_Architects_comunication/ARCHITECT_BASE_SYSTEMS_DESIGN_MANDATE.md`

### **Spec קיים:**
- `_COMMUNICATION/team_20/TEAM_20_PDSC_ERROR_CONTRACT_SPECIFICATION.md` (v1.1)

### **סשן חירום:**
- `_COMMUNICATION/team_10/TEAM_10_EMERGENCY_SESSION_20_30_PDSC_BOUNDARY.md`

---

**Team 10 (The Gateway)**  
**תאריך:** 2026-02-06  
**סטטוס:** 🔴 **MANDATORY - 24 HOUR DEADLINE**

**log_entry | [Team 10] | TEAM_20 | PDSC_BOUNDARY_CONTRACT_MANDATE | RED | 2026-02-06**
