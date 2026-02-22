# 📋 PDSC Error Schema - JSON Schema Definition
**project_domain:** TIKTRACK

**id:** `TEAM_20_PDSC_ERROR_SCHEMA`  
**owner:** Team 20 (Backend Implementation)  
**status:** ✅ **COMPLETE**  
**last_updated:** 2026-02-07  
**version:** v1.0

---

**מקור:** `TEAM_10_TO_TEAM_20_PDSC_BOUNDARY_CONTRACT_CRITICAL.md`  
**תאריך:** 2026-02-07  
**סטטוס:** ✅ **JSON SCHEMA DEFINITION COMPLETE**

---

## 🎯 Executive Summary

**JSON Schema Definition מפורט לכל ה-Error Responses ב-PDSC.**

מסמך זה מגדיר את ה-Error Schema המלא שהשרת מחזיר, כולל:
- JSON Schema Definition (JSON Schema Draft 07)
- כל ה-Error Codes מפורטים
- Error Response Structure מלא
- דוגמאות לכל סוג שגיאה

---

## 📐 JSON Schema Definition

### **Error Response Schema:**

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "PDSC Error Response",
  "description": "Unified error response schema for PDSC (Phoenix Data Service Core)",
  "type": "object",
  "required": ["success", "error"],
  "properties": {
    "success": {
      "type": "boolean",
      "const": false,
      "description": "Always false for error responses"
    },
    "error": {
      "type": "object",
      "required": ["code", "message", "status_code", "timestamp"],
      "properties": {
        "code": {
          "type": "string",
          "pattern": "^[A-Z_]+$",
          "description": "Error code identifier (e.g., FINANCIAL_TRADING_ACCOUNT_NOT_FOUND)",
          "examples": [
            "FINANCIAL_TRADING_ACCOUNT_NOT_FOUND",
            "AUTH_INVALID_CREDENTIALS",
            "VALIDATION_FIELD_REQUIRED"
          ]
        },
        "message": {
          "type": "string",
          "description": "Human-readable error message in English",
          "minLength": 1
        },
        "message_i18n": {
          "type": "object",
          "description": "Internationalized error messages",
          "additionalProperties": {
            "type": "string"
          },
          "examples": [
            {
              "he": "חשבון מסחר לא נמצא",
              "en": "Trading account not found"
            }
          ]
        },
        "status_code": {
          "type": "integer",
          "minimum": 400,
          "maximum": 599,
          "description": "HTTP status code",
          "examples": [400, 401, 404, 500]
        },
        "details": {
          "type": "object",
          "description": "Additional error details",
          "properties": {
            "field": {
              "type": "string",
              "description": "Field name that caused the error",
              "examples": ["trading_account_id", "email", "password"]
            },
            "value": {
              "type": "string",
              "description": "Value that caused the error",
              "examples": ["01ARZ3NDEKTSV4RRFFQ69G5FAV", "invalid@email"]
            },
            "suggestions": {
              "type": "array",
              "items": {
                "type": "string"
              },
              "description": "Suggestions for fixing the error",
              "examples": [
                [
                  "Check if the trading account ID is correct",
                  "Verify the account belongs to the current user"
                ]
              ]
            }
          }
        },
        "timestamp": {
          "type": "string",
          "format": "date-time",
          "description": "ISO 8601 timestamp when the error occurred",
          "examples": ["2026-02-07T10:30:00Z"]
        },
        "request_id": {
          "type": "string",
          "description": "Unique request ID for tracing",
          "pattern": "^req_[a-zA-Z0-9]{26}$",
          "examples": ["req_01ARZ3NDEKTSV4RRFFQ69G5FAV"]
        }
      }
    }
  }
}
```

---

## 📋 Error Codes - רשימה מפורטת

### **Authentication Errors (AUTH_*):**

| Error Code | HTTP Status | Description | When to Use |
|:---|:---|:---|:---|
| `AUTH_INVALID_CREDENTIALS` | 401 | Invalid username/password | Login failed |
| `AUTH_TOKEN_EXPIRED` | 401 | JWT token expired | Token validation failed |
| `AUTH_UNAUTHORIZED` | 401 | User not authorized | Missing/invalid token |
| `AUTH_RATE_LIMIT_EXCEEDED` | 429 | Too many requests | Rate limit exceeded |
| `AUTH_TOKEN_INVALID` | 401 | Invalid JWT token format | Token parsing failed |
| `AUTH_TOKEN_MISSING` | 401 | JWT token missing | No Authorization header |
| `AUTH_REFRESH_TOKEN_INVALID` | 401 | Invalid refresh token | Refresh token validation failed |
| `AUTH_REFRESH_TOKEN_MISSING` | 401 | Refresh token missing | No refresh token provided |

---

### **Validation Errors (VALIDATION_*):**

| Error Code | HTTP Status | Description | When to Use |
|:---|:---|:---|:---|
| `VALIDATION_FIELD_REQUIRED` | 400 | Required field missing | Field validation failed |
| `VALIDATION_INVALID_EMAIL` | 400 | Invalid email format | Email validation failed |
| `VALIDATION_INVALID_PHONE` | 400 | Invalid phone format | Phone validation failed |
| `VALIDATION_INVALID_FORMAT` | 400 | Invalid data format | Format validation failed |
| `VALIDATION_INVALID_PASSWORD` | 400 | Invalid password format | Password validation failed |

---

### **User Errors (USER_*):**

| Error Code | HTTP Status | Description | When to Use |
|:---|:---|:---|:---|
| `USER_NOT_FOUND` | 404 | User not found | User lookup failed |
| `USER_ALREADY_EXISTS` | 409 | User already exists | Registration failed |
| `USER_UPDATE_FAILED` | 500 | User update failed | Update operation failed |
| `USER_INACTIVE` | 403 | User account inactive | Account status check |
| `USER_LOCKED` | 403 | User account locked | Account status check |
| `USER_EMAIL_NOT_VERIFIED` | 403 | Email not verified | Email verification check |
| `USER_PHONE_NOT_VERIFIED` | 403 | Phone not verified | Phone verification check |

---

### **Password Reset Errors (PASSWORD_RESET_*):**

| Error Code | HTTP Status | Description | When to Use |
|:---|:---|:---|:---|
| `PASSWORD_RESET_INVALID_TOKEN` | 400 | Invalid reset token | Token validation failed |
| `PASSWORD_RESET_TOKEN_EXPIRED` | 400 | Reset token expired | Token expiration check |
| `PASSWORD_RESET_INVALID_CODE` | 400 | Invalid verification code | Code validation failed |
| `PASSWORD_RESET_CODE_EXPIRED` | 400 | Verification code expired | Code expiration check |
| `PASSWORD_RESET_MAX_ATTEMPTS` | 429 | Max attempts exceeded | Rate limiting |
| `PASSWORD_RESET_NO_PHONE` | 400 | No phone number associated | Phone check failed |

---

### **API Key Errors (API_KEY_*):**

| Error Code | HTTP Status | Description | When to Use |
|:---|:---|:---|:---|
| `API_KEY_NOT_FOUND` | 404 | API key not found | Key lookup failed |
| `API_KEY_CREATE_FAILED` | 500 | API key creation failed | Creation operation failed |
| `API_KEY_UPDATE_FAILED` | 500 | API key update failed | Update operation failed |
| `API_KEY_DELETE_FAILED` | 500 | API key deletion failed | Deletion operation failed |
| `API_KEY_VERIFY_FAILED` | 401 | API key verification failed | Key validation failed |

---

### **Financial Cube Errors (FINANCIAL_*):**

| Error Code | HTTP Status | Description | When to Use |
|:---|:---|:---|:---|
| `FINANCIAL_TRADING_ACCOUNT_NOT_FOUND` | 404 | Trading account not found | Account lookup failed |
| `FINANCIAL_TRADING_ACCOUNT_ALREADY_EXISTS` | 409 | Trading account already exists | Account creation failed |
| `FINANCIAL_TRADING_ACCOUNT_INVALID_DATA` | 400 | Invalid trading account data | Data validation failed |
| `FINANCIAL_TRADING_ACCOUNT_UPDATE_FAILED` | 500 | Trading account update failed | Update operation failed |
| `FINANCIAL_TRADING_ACCOUNT_DELETE_FAILED` | 500 | Trading account deletion failed | Deletion operation failed |
| `FINANCIAL_CASH_FLOW_NOT_FOUND` | 404 | Cash flow not found | Cash flow lookup failed |
| `FINANCIAL_CASH_FLOW_INVALID_AMOUNT` | 400 | Invalid cash flow amount | Amount validation failed |
| `FINANCIAL_CASH_FLOW_INVALID_DATE` | 400 | Invalid cash flow date | Date validation failed |
| `FINANCIAL_CASH_FLOW_CREATE_FAILED` | 500 | Cash flow creation failed | Creation operation failed |
| `FINANCIAL_BROKER_FEE_NOT_FOUND` | 404 | Broker fee not found | Broker fee lookup failed |
| `FINANCIAL_BROKER_FEE_INVALID_COMMISSION_TYPE` | 400 | Invalid commission type | Commission type validation failed |
| `FINANCIAL_BROKER_FEE_INVALID_MINIMUM` | 400 | Invalid minimum commission | Minimum validation failed |
| `FINANCIAL_BROKER_FEE_CREATE_FAILED` | 500 | Broker fee creation failed | Creation operation failed |
| `FINANCIAL_POSITION_NOT_FOUND` | 404 | Position not found | Position lookup failed |
| `FINANCIAL_POSITION_INVALID_DATA` | 400 | Invalid position data | Data validation failed |
| `FINANCIAL_POSITION_CALCULATION_FAILED` | 500 | Position calculation failed | Calculation operation failed |
| `FINANCIAL_DATA_NOT_FOUND` | 404 | Financial data not found | Generic lookup failed |
| `FINANCIAL_DATA_INVALID` | 400 | Invalid financial data | Generic validation failed |
| `FINANCIAL_CALCULATION_ERROR` | 500 | Financial calculation error | Calculation operation failed |
| `FINANCIAL_PERMISSION_DENIED` | 403 | Permission denied for financial operation | Authorization check failed |

---

### **Generic Errors:**

| Error Code | HTTP Status | Description | When to Use |
|:---|:---|:---|:---|
| `SERVER_ERROR` | 500 | Internal server error | Unexpected server error |
| `NETWORK_ERROR` | 500 | Network error | Network operation failed |
| `UNKNOWN_ERROR` | 500 | Unknown error | Unhandled exception |
| `DATABASE_ERROR` | 500 | Database error | Database operation failed |
| `SERVICE_UNAVAILABLE` | 503 | Service unavailable | Service down or overloaded |

---

## 📝 דוגמאות Error Responses

### **דוגמה 1: Trading Account Not Found**

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
    "timestamp": "2026-02-07T10:30:00Z",
    "request_id": "req_01ARZ3NDEKTSV4RRFFQ69G5FAV"
  }
}
```

---

### **דוגמה 2: Validation Error**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FIELD_REQUIRED",
    "message": "Required field missing: broker",
    "message_i18n": {
      "he": "שדה חובה חסר: broker",
      "en": "Required field missing: broker"
    },
    "status_code": 400,
    "details": {
      "field": "broker",
      "value": null,
      "suggestions": [
        "Provide a value for the broker field",
        "Check the API documentation for required fields"
      ]
    },
    "timestamp": "2026-02-07T10:30:00Z",
    "request_id": "req_01ARZ3NDEKTSV4RRFFQ69G5FAV"
  }
}
```

---

### **דוגמה 3: Authentication Error**

```json
{
  "success": false,
  "error": {
    "code": "AUTH_TOKEN_EXPIRED",
    "message": "JWT token expired",
    "message_i18n": {
      "he": "טוקן JWT פג תוקף",
      "en": "JWT token expired"
    },
    "status_code": 401,
    "details": {
      "field": "authorization",
      "value": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "suggestions": [
        "Refresh your authentication token",
        "Log in again to get a new token"
      ]
    },
    "timestamp": "2026-02-07T10:30:00Z",
    "request_id": "req_01ARZ3NDEKTSV4RRFFQ69G5FAV"
  }
}
```

---

### **דוגמה 4: Server Error**

```json
{
  "success": false,
  "error": {
    "code": "SERVER_ERROR",
    "message": "Internal server error",
    "message_i18n": {
      "he": "שגיאת שרת פנימית",
      "en": "Internal server error"
    },
    "status_code": 500,
    "details": {
      "field": null,
      "value": null,
      "suggestions": [
        "Please try again later",
        "Contact support if the problem persists"
      ]
    },
    "timestamp": "2026-02-07T10:30:00Z",
    "request_id": "req_01ARZ3NDEKTSV4RRFFQ69G5FAV"
  }
}
```

---

## 🔧 Implementation Guidelines

### **Backend Implementation:**

```python
# api/utils/exceptions.py

from fastapi import HTTPException
from typing import Optional, Dict, List
from datetime import datetime
import uuid

class HTTPExceptionWithCode(HTTPException):
    """HTTPException with mandatory error_code support."""
    
    def __init__(
        self,
        status_code: int,
        detail: str,
        error_code: str,
        field: Optional[str] = None,
        value: Optional[str] = None,
        suggestions: Optional[List[str]] = None,
        message_i18n: Optional[Dict[str, str]] = None,
        request_id: Optional[str] = None,
        headers: Optional[dict] = None
    ):
        super().__init__(status_code=status_code, detail=detail, headers=headers)
        self.error_code = error_code
        self.field = field
        self.value = value
        self.suggestions = suggestions
        self.message_i18n = message_i18n
        self.request_id = request_id or f"req_{uuid.uuid4().hex[:26]}"
    
    def to_dict(self) -> dict:
        """Convert exception to error response dict."""
        error_dict = {
            "code": self.error_code,
            "message": self.detail,
            "status_code": self.status_code,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "request_id": self.request_id
        }
        
        if self.message_i18n:
            error_dict["message_i18n"] = self.message_i18n
        
        if self.field or self.value or self.suggestions:
            error_dict["details"] = {
                "field": self.field,
                "value": str(self.value) if self.value is not None else None,
                "suggestions": self.suggestions or []
            }
        
        return {
            "success": False,
            "error": error_dict
        }
```

---

### **Usage Example:**

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
                error_code=ErrorCodes.FINANCIAL_TRADING_ACCOUNT_NOT_FOUND,
                field="trading_account_id",
                value=account_id,
                suggestions=[
                    "Check if the trading account ID is correct",
                    "Verify the account belongs to the current user"
                ],
                message_i18n={
                    "he": "חשבון מסחר לא נמצא",
                    "en": "Trading account not found"
                }
            )
        
        return {
            "success": True,
            "data": account,
            "meta": {
                "timestamp": datetime.utcnow().isoformat() + "Z",
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

---

## ✅ Validation

### **JSON Schema Validation:**

```python
# api/utils/error_schema_validator.py

import jsonschema
from typing import Dict, Any

def validate_error_response(response: Dict[str, Any]) -> bool:
    """
    Validate error response against JSON Schema.
    
    Args:
        response: Error response dict
        
    Returns:
        True if valid, raises ValidationError if invalid
    """
    schema = {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "type": "object",
        "required": ["success", "error"],
        "properties": {
            "success": {"type": "boolean", "const": False},
            "error": {
                "type": "object",
                "required": ["code", "message", "status_code", "timestamp"],
                "properties": {
                    "code": {"type": "string", "pattern": "^[A-Z_]+$"},
                    "message": {"type": "string", "minLength": 1},
                    "status_code": {"type": "integer", "minimum": 400, "maximum": 599},
                    "timestamp": {"type": "string", "format": "date-time"}
                }
            }
        }
    }
    
    jsonschema.validate(instance=response, schema=schema)
    return True
```

---

## 🔗 קישורים רלוונטיים

### **מקור המנדט:**
- `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_20_PDSC_BOUNDARY_CONTRACT_CRITICAL.md`

### **Specs קשורים:**
- `_COMMUNICATION/team_20/TEAM_20_PDSC_ERROR_CONTRACT_SPECIFICATION.md` (v1.1)

### **קבצים:**
- `api/utils/exceptions.py` - Error Codes Enum
- `api/utils/error_schema_validator.py` - Schema Validator (ליצירה)

---

**Team 20 (Backend Implementation)**  
**תאריך:** 2026-02-07  
**סטטוס:** ✅ **JSON ERROR SCHEMA COMPLETE**

**log_entry | [Team 20] | PDSC | ERROR_SCHEMA | GREEN | 2026-02-07**
