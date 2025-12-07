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

**Request Body (Legacy v1.0):**
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

**Request Body (v2.0 - Recommended):**
```json
{
  "template_id": 3,
  "variables": {
    "version": "2.0",
    "prompt_variables": {
      "ticker_symbol": "TSLA",
      "date_range": "2024-01-01 - 2024-12-31",
      "analysis_focus": "Performance Review",
      "response_language": "hebrew"
    },
    "filters": {
      "trading_account_id": 1
    },
    "trade_selection": {
      "type": "all",
      "trade_id": null
    }
  },
  "provider": "gemini"
}
```

**הערות:**
- גרסה 2.0 מפרידה בין `prompt_variables` (נשלחים ל-LLM) ו-`filters` (לשימוש פנימי בלבד)
- `trading_account_id` נשמר ב-`filters` ולא נשלח למנוע AI
- `trade_selection` מגדיר אילו טריידים לנתח

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
            "label": "טיקר",
            "type": "select",
            "required": false,
            "placeholder": "בחר טיקר...",
            "integration": "tickers"
          },
          {
            "key": "investment_thesis",
            "label": "סיבת השקעה",
            "type": "select",
            "required": false,
            "placeholder": "בחר סיבה...",
            "integration": "reasons"
          },
          {
            "key": "goal",
            "label": "מטרה",
            "type": "select",
            "required": false,
            "options": [
              {"value": "long_term_investment", "label": "השקעה ארוכת טווח - בניית פורטפוליו יציב"},
              {"value": "short_term_trading", "label": "מסחר קצר טווח - רווחים מהירים"}
            ]
          },
          {
            "key": "response_language",
            "label": "שפת המשוב",
            "type": "select",
            "required": false,
            "options": [
              {"value": "hebrew", "label": "עברית"},
              {"value": "english", "label": "אנגלית"}
            ],
            "default_value": "hebrew"
          }
        ]
      },
      "is_active": true,
      "sort_order": 1
    }
  ]
}
```

**הערות:**
- כל התבניות תורגמו לעברית
- שדות עם `integration` נטענים אוטומטית מהמערכת (tickers, reasons, trading_accounts, trading_methods)
- שדות `date_range` משתמשים ב-`type: "date-range"` עם DateRangePickerService

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

### Variables JSON Format (v1.0 - Legacy)

```json
{
  "variables": [
    {
      "key": "stock_ticker",
      "label": "טיקר",
      "type": "select",
      "required": false,
      "placeholder": "בחר טיקר...",
      "integration": "tickers"
    }
  ]
}
```

### Variables JSON Format (v2.0 - Current)

בגרסה 2.0, ה-`variables` שנשלח ל-API כולל מבנה משופר:

```json
{
  "version": "2.0",
  "prompt_variables": {
    "ticker_symbol": "TSLA",
    "date_range": "2024-01-01 - 2024-12-31",
    "analysis_focus": "Performance Review",
    "response_language": "hebrew"
  },
  "filters": {
    "trading_account_id": 1
  },
  "trade_selection": {
    "type": "all",
    "trade_id": null,
    "criteria": {}
  },
  "metadata": {
    "analysis_scope": "portfolio_performance"
  }
}
```

**הסבר:**
- **`prompt_variables`** - משתנים שנשלחים למנוע AI (משמשים להחלפה ב-prompt)
- **`filters`** - פילטרים לשימוש פנימי בלבד (לא נשלחים ל-LLM, למשל `trading_account_id`)
- **`trade_selection`** - הגדרת בחירת טריידים לניתוח (`all`, `single`, `multiple`, `filtered`)
- **`metadata`** - מטא-נתונים נוספים לניתוח עתידי

### Variable Types

- `text` - שדה טקסט רגיל
- `textarea` - שדה טקסט רב-שורות
- `select` - רשימה נפתחת (עם `options` או `integration`)
- `date` - תאריך (HTML5 date picker)
- `datetime-local` - תאריך ושעה
- `number` - מספר
- `date-range` - **טווח תאריכים** (משתמש ב-DateRangePickerService עם preset options ו-custom dates)

### Integration Types

שדות עם `integration` נטענים אוטומטית:
- `"tickers"` - רשימת טיקרים מהמערכת
- `"reasons"` - רשימת סיבות השקעה
- `"trading_accounts"` - רשימת חשבונות מסחר
- `"trading_methods"` - רשימת שיטות מסחר

### Conditional Display

שדות יכולים להופיע בהתאם לערך של שדה אחר:

```json
{
  "key": "single_trade_id",
  "label": "מזהה טרייד (לטרייד בודד)",
  "type": "number",
  "conditional_display": {
    "depends_on": "trade_selection_type",
    "show_when": "single"
  }
}
```

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

---

## 🔄 מבנה Variables v2.0 - פירוט

### מטרת המבנה החדש

גרסה 2.0 מאפשרת:
1. **הפרדה ברורה** בין מה שנשלח ל-LLM ומה שמיועד לשימוש פנימי
2. **גמישות** בבחירת טריידים לניתוח
3. **שמירת פרמטרים מדויקים** למעקב וניתוח עתידי
4. **תמיכה בנתוני טריידים** - אינטגרציה עם TradeAggregationService

### דוגמה מלאה - Portfolio Performance

```json
{
  "template_id": 3,
  "variables": {
    "version": "2.0",
    "prompt_variables": {
      "ticker_symbol": "TSLA",
      "date_range": "השנה",
      "analysis_focus": "Performance Review",
      "analysis_topics": "performance,risk",
      "investment_type_filter": "",
      "response_language": "hebrew"
    },
    "filters": {
      "trading_account_id": 1
    },
    "trade_selection": {
      "type": "filtered",
      "trade_id": null,
      "criteria": {
        "ticker_symbol": "TSLA",
        "date_range_start": "2024-01-01",
        "date_range_end": "2024-12-31"
      }
    },
    "metadata": {
      "analysis_scope": "portfolio_performance",
      "filters_applied": ["trading_account", "date_range"]
    }
  },
  "provider": "gemini"
}
```

### דוגמה - Risk & Conditions

```json
{
  "template_id": 4,
  "variables": {
    "version": "2.0",
    "prompt_variables": {
      "ticker_symbol": "",
      "trade_plan_id": null,
      "trade_id": null,
      "condition_focus": "3",
      "investment_type": "swing",
      "response_language": "hebrew"
    },
    "filters": {
      "trading_account_id": null
    },
    "trade_selection": {
      "type": "all"
    }
  },
  "provider": "gemini"
}
```

**הערות חשובות:**
- `condition_focus` הוא `type: "select"` עם `integration: "trading_methods"` (ID של שיטת מסחר)
- `date_range` משתמש ב-`type: "date-range"` (DateRangePickerService)
- כל השדות מתורגמים לעברית בממשק המשתמש

---

## 🔗 אינטגרציה עם TradeAggregationService

לתבניות Portfolio Performance, Technical Analysis, ו-Risk & Conditions, המערכת משתמשת ב-`TradeAggregationService` להבאת נתוני טריידים:

```python
from services.trade_aggregation_service import TradeAggregationService

# Aggregate trades based on filters
result = TradeAggregationService.aggregate_trades(
    db=db,
    user_id=user_id,
    ticker_symbol=prompt_variables.get('ticker_symbol'),
    trading_account_id=filters.get('trading_account_id'),
    date_range_start=...,
    date_range_end=...,
    include_closed=True
)

# Format for AI
formatted_data = TradeAggregationService.format_trades_for_ai(result)
```

הנתונים מעובדים ומשולבים ב-prompt תחת `{trade_data_structured}`.

**קישור לתיעוד:** [TRADE_AGGREGATION_SYSTEM.md](../backend/TRADE_AGGREGATION_SYSTEM.md)

---

## 📅 DateRangePickerService

שדות `date_range` עם `type: "date-range"` משתמשים ב-`DateRangePickerService` - מערכת כללית לבחירת טווחי תאריכים.

**תכונות:**
- Preset options (היום, השבוע, החודש, השנה, כל זמן)
- Custom date selection עם HTML5 date picker
- אוטומטית מתרגם preset strings לתאריכים בפועל

**קישור לתיעוד:** [GENERAL_SYSTEMS_LIST.md](../frontend/GENERAL_SYSTEMS_LIST.md)

---

**תאריך עדכון אחרון:** 06 בדצמבר 2025  
**גרסה:** 2.0.0





