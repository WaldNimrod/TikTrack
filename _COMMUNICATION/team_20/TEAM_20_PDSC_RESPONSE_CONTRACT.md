# 📋 PDSC Response Contract - Success + Error Formats
**project_domain:** TIKTRACK

**id:** `TEAM_20_PDSC_RESPONSE_CONTRACT`  
**owner:** Team 20 (Backend Implementation)  
**status:** ✅ **COMPLETE**  
**last_updated:** 2026-02-07  
**version:** v1.0

---

**מקור:** `TEAM_10_TO_TEAM_20_PDSC_BOUNDARY_CONTRACT_CRITICAL.md`  
**תאריך:** 2026-02-07  
**סטטוס:** ✅ **RESPONSE CONTRACT COMPLETE**

---

## 🎯 Executive Summary

**Response Contract אחיד לכל ה-responses ב-PDSC (Success + Error).**

מסמך זה מגדיר את ה-Response Contract המלא שהשרת מחזיר, כולל:
- Success Response Format
- Error Response Format
- Unified Response Schema
- Integration Guidelines
- דוגמאות לכל סוג response

---

## 📐 Response Contract Schema

### **Unified Response Schema:**

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "PDSC Unified Response",
  "description": "Unified response schema for PDSC (Success or Error)",
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
          "const": true,
          "description": "Always true for success responses"
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
              "format": "date-time",
              "description": "ISO 8601 timestamp"
            },
            "request_id": {
              "type": "string",
              "pattern": "^req_[a-zA-Z0-9]{26}$",
              "description": "Unique request ID for tracing"
            }
          }
        }
      }
    },
    "ErrorResponse": {
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
              "pattern": "^[A-Z_]+$"
            },
            "message": {
              "type": "string"
            },
            "status_code": {
              "type": "integer",
              "minimum": 400,
              "maximum": 599
            },
            "timestamp": {
              "type": "string",
              "format": "date-time"
            }
          }
        }
      }
    }
  }
}
```

---

## ✅ Success Response Format

### **Success Response Schema:**

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "PDSC Success Response",
  "type": "object",
  "required": ["success"],
  "properties": {
    "success": {
      "type": "boolean",
      "const": true,
      "description": "Always true for success responses"
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
          "format": "date-time",
          "description": "ISO 8601 timestamp when the response was generated"
        },
        "request_id": {
          "type": "string",
          "pattern": "^req_[a-zA-Z0-9]{26}$",
          "description": "Unique request ID for tracing"
        }
      }
    }
  }
}
```

---

### **דוגמאות Success Responses:**

#### **דוגמה 1: GET Single Resource**

```json
{
  "success": true,
  "data": {
    "id": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
    "account_name": "IBKR Main",
    "broker": "Interactive Brokers",
    "balance": "10000.50",
    "is_active": true,
    "created_at": "2026-01-01T10:00:00Z",
    "updated_at": "2026-02-07T10:30:00Z"
  },
  "meta": {
    "timestamp": "2026-02-07T10:30:00Z",
    "request_id": "req_01ARZ3NDEKTSV4RRFFQ69G5FAV"
  }
}
```

---

#### **דוגמה 2: GET List of Resources**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
        "account_name": "IBKR Main",
        "balance": "10000.50"
      },
      {
        "id": "01BRZ3NDEKTSV4RRFFQ69G5FAV",
        "account_name": "TD Ameritrade",
        "balance": "5000.00"
      }
    ],
    "total": 2,
    "page": 1,
    "page_size": 10
  },
  "meta": {
    "timestamp": "2026-02-07T10:30:00Z",
    "request_id": "req_01ARZ3NDEKTSV4RRFFQ69G5FAV"
  }
}
```

---

#### **דוגמה 3: POST Create Resource**

```json
{
  "success": true,
  "data": {
    "id": "01CRZ3NDEKTSV4RRFFQ69G5FAV",
    "broker": "Interactive Brokers",
    "commission_type": "TIERED",
    "commission_value": "0.0035 $ / Share",
    "minimum": "0.35",
    "created_at": "2026-02-07T10:30:00Z"
  },
  "meta": {
    "timestamp": "2026-02-07T10:30:00Z",
    "request_id": "req_01ARZ3NDEKTSV4RRFFQ69G5FAV"
  }
}
```

---

#### **דוגמה 4: PUT Update Resource**

```json
{
  "success": true,
  "data": {
    "id": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
    "account_name": "IBKR Main Updated",
    "balance": "15000.50",
    "updated_at": "2026-02-07T10:30:00Z"
  },
  "meta": {
    "timestamp": "2026-02-07T10:30:00Z",
    "request_id": "req_01ARZ3NDEKTSV4RRFFQ69G5FAV"
  }
}
```

---

#### **דוגמה 5: DELETE Resource**

```json
{
  "success": true,
  "data": {
    "id": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
    "deleted_at": "2026-02-07T10:30:00Z"
  },
  "meta": {
    "timestamp": "2026-02-07T10:30:00Z",
    "request_id": "req_01ARZ3NDEKTSV4RRFFQ69G5FAV"
  }
}
```

---

## ❌ Error Response Format

### **Error Response Schema:**

ראה `TEAM_20_PDSC_ERROR_SCHEMA.md` לפרטים מלאים.

**דוגמה:**

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

## 🔧 Integration Guidelines

### **Frontend Integration:**

#### **1. Response Type Detection:**

```javascript
// Frontend code example

function handleResponse(response) {
  if (response.success === true) {
    // Success response
    return {
      type: 'success',
      data: response.data,
      meta: response.meta
    };
  } else if (response.success === false) {
    // Error response
    return {
      type: 'error',
      error: response.error
    };
  } else {
    // Invalid response format
    throw new Error('Invalid response format');
  }
}
```

---

#### **2. Error Handling:**

```javascript
// Frontend error handling

async function fetchTradingAccounts() {
  try {
    const response = await fetch('/api/v1/trading_accounts', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (data.success === false) {
      // Handle error
      const error = data.error;
      
      // Log error
      console.error('API Error:', error.code, error.message);
      
      // Show user-friendly message
      if (error.message_i18n && error.message_i18n.he) {
        showError(error.message_i18n.he);
      } else {
        showError(error.message);
      }
      
      // Handle specific error codes
      if (error.code === 'AUTH_TOKEN_EXPIRED') {
        // Refresh token
        await refreshToken();
        // Retry request
        return fetchTradingAccounts();
      }
      
      return { type: 'error', error };
    }
    
    // Handle success
    return { type: 'success', data: data.data };
    
  } catch (error) {
    // Network error or other exception
    console.error('Network Error:', error);
    return {
      type: 'error',
      error: {
        code: 'NETWORK_ERROR',
        message: 'Network error occurred',
        status_code: 500
      }
    };
  }
}
```

---

### **Backend Implementation:**

#### **1. Success Response Helper:**

```python
# api/utils/response_helpers.py

from typing import Dict, Any, Optional
from datetime import datetime
import uuid

def create_success_response(
    data: Dict[str, Any],
    request_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Create standardized success response.
    
    Args:
        data: Response data
        request_id: Optional request ID (if not provided, will be generated)
        
    Returns:
        Success response dict
    """
    return {
        "success": True,
        "data": data,
        "meta": {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "request_id": request_id or f"req_{uuid.uuid4().hex[:26]}"
        }
    }
```

---

#### **2. Error Response Helper:**

```python
# api/utils/response_helpers.py

from typing import Dict, Any, Optional, List
from ..utils.exceptions import HTTPExceptionWithCode

def create_error_response(
    error_code: str,
    message: str,
    status_code: int,
    field: Optional[str] = None,
    value: Optional[str] = None,
    suggestions: Optional[List[str]] = None,
    message_i18n: Optional[Dict[str, str]] = None,
    request_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Create standardized error response.
    
    Args:
        error_code: Error code identifier
        message: Error message
        status_code: HTTP status code
        field: Optional field name
        value: Optional field value
        suggestions: Optional suggestions
        message_i18n: Optional i18n messages
        request_id: Optional request ID
        
    Returns:
        Error response dict
    """
    error_dict = {
        "code": error_code,
        "message": message,
        "status_code": status_code,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "request_id": request_id or f"req_{uuid.uuid4().hex[:26]}"
    }
    
    if message_i18n:
        error_dict["message_i18n"] = message_i18n
    
    if field or value or suggestions:
        error_dict["details"] = {
            "field": field,
            "value": str(value) if value is not None else None,
            "suggestions": suggestions or []
        }
    
    return {
        "success": False,
        "error": error_dict
    }
```

---

#### **3. Router Usage:**

```python
# api/routers/trading_accounts.py

from ..utils.response_helpers import create_success_response, create_error_response
from ..utils.exceptions import HTTPExceptionWithCode, ErrorCodes

@router.get("/trading_accounts/{account_id}")
async def get_trading_account(
    account_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    request: Request = None
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
                value=account_id
            )
        
        return create_success_response(
            data=account,
            request_id=getattr(request.state, 'request_id', None)
        )
        
    except HTTPExceptionWithCode as e:
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

### **Response Validation:**

```python
# api/utils/response_validator.py

import jsonschema
from typing import Dict, Any

def validate_response(response: Dict[str, Any]) -> bool:
    """
    Validate response against Unified Response Schema.
    
    Args:
        response: Response dict
        
    Returns:
        True if valid, raises ValidationError if invalid
    """
    schema = {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "oneOf": [
            {
                "type": "object",
                "required": ["success"],
                "properties": {
                    "success": {"type": "boolean", "const": True},
                    "data": {"type": "object"},
                    "meta": {"type": "object"}
                }
            },
            {
                "type": "object",
                "required": ["success", "error"],
                "properties": {
                    "success": {"type": "boolean", "const": False},
                    "error": {"type": "object"}
                }
            }
        ]
    }
    
    jsonschema.validate(instance=response, schema=schema)
    return True
```

---

## 🔗 קישורים רלוונטיים

### **מקור המנדט:**
- `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_20_PDSC_BOUNDARY_CONTRACT_CRITICAL.md`

### **מסמכים קשורים:**
- `_COMMUNICATION/team_20/TEAM_20_PDSC_ERROR_SCHEMA.md` - Error Schema מפורט
- `_COMMUNICATION/team_20/TEAM_20_PDSC_ERROR_CONTRACT_SPECIFICATION.md` (v1.1)

### **קבצים:**
- `api/utils/response_helpers.py` - Response Helpers (ליצירה)
- `api/utils/response_validator.py` - Response Validator (ליצירה)

---

**Team 20 (Backend Implementation)**  
**תאריך:** 2026-02-07  
**סטטוס:** ✅ **RESPONSE CONTRACT COMPLETE**

**log_entry | [Team 20] | PDSC | RESPONSE_CONTRACT | GREEN | 2026-02-07**
