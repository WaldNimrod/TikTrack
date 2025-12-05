# AI Analysis API Documentation

**תאריך יצירה:** 28 בינואר 2025  
**גרסה:** 1.0.0  
**Base URL:** `/api/ai-analysis`

---

## 📋 תוכן עניינים

1. [Authentication](#authentication)
2. [Endpoints](#endpoints)
3. [Request/Response Formats](#requestresponse-formats)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)

---

## 🔐 Authentication

כל ה-endpoints דורשים authentication. המשתמש מזוהה דרך session או token.

**Headers:**
```
Authorization: Bearer <token>
```

או דרך session cookie.

---

## 📡 Endpoints

### POST /api/ai-analysis/generate

יצירת ניתוח חדש באמצעות LLM.

**Request Body:**
```json
{
  "template_id": 1,
  "variables": {
    "stock_ticker": "AAPL",
    "investment_thesis": "Strong fundamentals",
    "goal": "Long-term investment"
  },
  "provider": "gemini"
}
```

**Response (Success):**
```json
{
  "status": "success",
  "data": {
    "request_id": 123,
    "status": "completed",
    "response_text": "## Analysis\n\n...",
    "response_json": null,
    "created_at": "2025-01-28T10:00:00Z"
  }
}
```

**הערות חשובות:**
- `response_text` ו-`response_json` **נשמרים במסד הנתונים** (לא רק במטמון של הפרונטאנד)
- התוצאות זמינות גם ב-API response הראשוני וגם במסד הנתונים
- ניתוחים חוזרים יכולים לגשת לתוצאות מהמסד הנתונים

**Response (Error):**
```json
{
  "status": "error",
  "message": "API key validation failed",
  "error_code": "INVALID_API_KEY"
}
```

**Status Codes:**
- `200` - Success
- `400` - Bad Request (validation error)
- `401` - Unauthorized
- `500` - Server Error

---

### GET /api/ai-analysis/templates

קבלת רשימת כל התבניות הפעילות.

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "Equity Research Analysis",
      "name_he": "ניתוח מחקר הון",
      "description": "Comprehensive equity analysis",
      "variables_json": {
        "variables": [
          {
            "key": "stock_ticker",
            "label": "Stock Ticker / Company Name",
            "type": "text",
            "required": false,
            "placeholder": "Add name if you want specific analysis"
          }
        ]
      },
      "is_active": true,
      "sort_order": 1
    }
  ]
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `500` - Server Error

---

### GET /api/ai-analysis/history

קבלת היסטוריית ניתוחים של המשתמש.

**Query Parameters:**
- `user_id` (required) - User ID
- `limit` (optional, default: 50) - מספר תוצאות
- `offset` (optional, default: 0) - offset לפאג'ינציה
- `template_id` (optional) - סינון לפי תבנית
- `provider` (optional) - סינון לפי מנוע ('gemini' | 'perplexity')
- `status` (optional) - סינון לפי סטטוס ('pending' | 'completed' | 'failed')

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 123,
      "template_id": 1,
      "template_name": "Equity Research Analysis",
      "provider": "gemini",
      "created_at": "2025-01-28T10:00:00Z",
      "status": "completed",
      "response_text": "..."
    }
  ],
  "extra": {
    "count": 10,
    "total": 25
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized
- `500` - Server Error

---

### GET /api/ai-analysis/history/{request_id}

קבלת פרטי ניתוח ספציפי.

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": 123,
    "user_id": 1,
    "template_id": 1,
    "provider": "gemini",
    "variables_json": {
      "stock_ticker": "AAPL",
      "investment_thesis": "Strong fundamentals"
    },
    "prompt_text": "Act as an elite equity research analyst...",
    "response_text": "## Analysis\n\n...",
    "response_json": null,
    "status": "completed",
    "error_message": null,
    "created_at": "2025-01-28T10:00:00Z"
  }
}
```

**Status Codes:**
- `200` - Success
- `404` - Not Found
- `401` - Unauthorized
- `403` - Forbidden (not user's analysis)
- `500` - Server Error

---

### DELETE /api/ai-analysis/history/{request_id}

מחיקת ניתוח ספציפי לפי ID.

**Response (Success):**
```json
{
  "status": "success",
  "message": "Analysis deleted successfully",
  "data": {
    "deleted_id": 123
  }
}
```

**Response (Error):**
```json
{
  "status": "error",
  "message": "Analysis not found or not authorized"
}
```

**Status Codes:**
- `200` - Success
- `404` - Not Found or Not Authorized
- `401` - Unauthorized
- `500` - Server Error

**הערות:**
- רק המשתמש שיצר את הניתוח יכול למחוק אותו
- המחיקה היא סופית ולא ניתנת לביטול
- המטמון של הניתוח ינוקה אוטומטית

---

### POST /api/ai-analysis/llm-provider

עדכון הגדרות LLM Provider (API keys).

**Request Body:**
```json
{
  "provider": "gemini",
  "api_key": "your-api-key-here"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "success": true,
    "validated": true,
    "message": "API key validated and saved successfully"
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - Bad Request (invalid API key)
- `401` - Unauthorized
- `500` - Server Error

---

### GET /api/ai-analysis/llm-provider

קבלת הגדרות LLM Provider נוכחיות.

**Response:**
```json
{
  "status": "success",
  "data": {
    "default_provider": "gemini",
    "providers_configured": ["gemini", "perplexity"],
    "gemini_configured": true,
    "perplexity_configured": true
  }
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `500` - Server Error

---

## 📝 Request/Response Formats

### Variables JSON Format

```json
{
  "variables": [
    {
      "key": "stock_ticker",
      "label": "Stock Ticker / Company Name",
      "type": "text",
      "required": false,
      "placeholder": "Add name if you want specific analysis",
      "default_value": null,
      "validation": {
        "min_length": 0,
        "max_length": 100
      }
    },
    {
      "key": "investment_thesis",
      "label": "Investment Thesis",
      "type": "textarea",
      "required": false,
      "placeholder": "Add input here",
      "default_value": null
    }
  ]
}
```

### Variable Types

- `text` - שדה טקסט רגיל
- `textarea` - שדה טקסט רב-שורות
- `select` - רשימה נפתחת
- `date` - תאריך
- `number` - מספר

---

## ⚠️ Error Handling

### Error Response Format

```json
{
  "status": "error",
  "message": "Error description",
  "error_code": "ERROR_CODE",
  "details": {
    "field": "additional info"
  }
}
```

### Error Codes

- `INVALID_TEMPLATE_ID` - תבנית לא קיימת
- `INVALID_VARIABLES` - משתנים לא תקינים
- `INVALID_PROVIDER` - מנוע LLM לא נתמך
- `INVALID_API_KEY` - API key לא תקין
- `API_KEY_REQUIRED` - API key חסר
- `RATE_LIMIT_EXCEEDED` - חריגה ממגבלת בקשות
- `LLM_ERROR` - שגיאה מהמנוע LLM
- `ENCRYPTION_ERROR` - שגיאה בהצפנה
- `UNAUTHORIZED` - לא מורשה
- `NOT_FOUND` - לא נמצא

---

## 🚦 Rate Limiting

- **Per User:** 10 בקשות לדקה
- **Per IP:** 50 בקשות לדקה
- **Global:** 1000 בקשות לשעה

**Headers:**
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 5
X-RateLimit-Reset: 1640995200
```

---

**תאריך עדכון אחרון:** 28 בינואר 2025  
**גרסה:** 1.0.0





