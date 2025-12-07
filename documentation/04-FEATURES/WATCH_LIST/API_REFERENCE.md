# תיעוד API: מערכת Watch List
## API Reference: Watch List System

**תאריך:** 28 בינואר 2025  
**גרסה:** 1.0.0  
**Base URL:** `/api/watch-lists`

---

## סקירה כללית

כל ה-endpoints דורשים authentication (user_id ב-context או ב-request).  
כל ה-responses עוברים דרך DateNormalizationService לנרמול תאריכים.

---

## Watch Lists Endpoints

### GET /api/watch-lists

**מטרה:** קבלת כל רשימות הצפייה של המשתמש

**Parameters:**
- `user_id` (query, optional): מזהה משתמש (אם לא ב-context)

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "name": "Tech Stocks",
      "icon": "chart-line",
      "color_hex": "#26baac",
      "display_order": 0,
      "view_mode": "table",
      "default_sort_column": "symbol",
      "default_sort_direction": "asc",
      "item_count": 15,
      "created_at": "2025-01-28T10:00:00Z",
      "updated_at": "2025-01-28T12:30:00Z"
    }
  ],
  "timestamp": "2025-01-28T12:30:00Z"
}
```

**Error Responses:**
- `401`: Authentication required
- `500`: Server error

---

### POST /api/watch-lists

**מטרה:** יצירת רשימה חדשה

**Request Body:**
```json
{
  "name": "Energy Sector",
  "icon": "flame",
  "color_hex": "#fc5a06",
  "view_mode": "table"
}
```

**Required Fields:**
- `name`: שם הרשימה (max 100 chars)

**Optional Fields:**
- `icon`: שם איקון מ-IconSystem
- `color_hex`: צבע רשימה (#RRGGBB)
- `view_mode`: 'table', 'cards', 'compact' (default: 'table')

**Validation:**
- Max 20 lists per user (checked in Business Logic Service)
- Unique name per user

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": 2,
    "user_id": 1,
    "name": "Energy Sector",
    "icon": "flame",
    "color_hex": "#fc5a06",
    "display_order": 1,
    "view_mode": "table",
    "created_at": "2025-01-28T13:00:00Z",
    "updated_at": "2025-01-28T13:00:00Z"
  },
  "timestamp": "2025-01-28T13:00:00Z"
}
```

**Error Responses:**
- `400`: Validation error (missing name, duplicate name, max lists exceeded)
- `401`: Authentication required
- `500`: Server error

---

### GET /api/watch-lists/:id

**מטרה:** קבלת פרטי רשימה ספציפית

**Parameters:**
- `id` (path): מזהה הרשימה

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "user_id": 1,
    "name": "Tech Stocks",
    "icon": "chart-line",
    "color_hex": "#26baac",
    "display_order": 0,
    "view_mode": "table",
    "default_sort_column": "symbol",
    "default_sort_direction": "asc",
    "item_count": 15,
    "created_at": "2025-01-28T10:00:00Z",
    "updated_at": "2025-01-28T12:30:00Z"
  },
  "timestamp": "2025-01-28T12:30:00Z"
}
```

**Error Responses:**
- `404`: List not found
- `403`: Permission denied (list belongs to another user)
- `401`: Authentication required

---

### PUT /api/watch-lists/:id

**מטרה:** עדכון רשימה

**Request Body:**
```json
{
  "name": "Technology Stocks",
  "icon": "device-desktop",
  "color_hex": "#26baac",
  "view_mode": "cards",
  "default_sort_column": "price",
  "default_sort_direction": "desc"
}
```

**All Fields Optional:** רק השדות שנשלחים מתעדכנים

**Response:** כמו GET /api/watch-lists/:id

**Error Responses:**
- `400`: Validation error
- `404`: List not found
- `403`: Permission denied
- `401`: Authentication required

---

### DELETE /api/watch-lists/:id

**מטרה:** מחיקת רשימה

**Cascade:** כל הפריטים נמחקים אוטומטית

**Response:**
```json
{
  "status": "success",
  "message": "Watch list deleted successfully",
  "timestamp": "2025-01-28T14:00:00Z"
}
```

**Error Responses:**
- `404`: List not found
- `403`: Permission denied
- `401`: Authentication required

---

### POST /api/watch-lists/reorder

**מטרה:** סידור מחדש של רשימות

**Request Body:**
```json
{
  "order": [
    {"id": 2, "display_order": 0},
    {"id": 1, "display_order": 1},
    {"id": 3, "display_order": 2}
  ]
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Watch lists reordered successfully",
  "timestamp": "2025-01-28T14:30:00Z"
}
```

---

## Watch List Items Endpoints

### GET /api/watch-lists/:id/items

**מטרה:** קבלת כל הטיקרים ברשימה

**Parameters:**
- `id` (path): מזהה הרשימה
- `include_external_data` (query, optional): האם לכלול נתוני מחיר חיצוניים (default: false)

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "watch_list_id": 1,
      "ticker_id": 5,
      "ticker": {
        "id": 5,
        "symbol": "AAPL",
        "name": "Apple Inc.",
        "type": "stock"
      },
      "external_symbol": null,
      "external_name": null,
      "flag_color": "#26baac",
      "display_order": 0,
      "notes": "Watch for earnings",
      "external_data": {
        "price": 150.25,
        "change_percent": 1.42,
        "change_amount": 2.10,
        "volume": 50000000
      },
      "created_at": "2025-01-28T10:00:00Z",
      "updated_at": "2025-01-28T12:00:00Z"
    },
    {
      "id": 2,
      "watch_list_id": 1,
      "ticker_id": null,
      "ticker": null,
      "external_symbol": "TSLA",
      "external_name": "Tesla Inc.",
      "flag_color": "#fc5a06",
      "display_order": 1,
      "notes": null,
      "external_data": {
        "price": 245.80,
        "change_percent": -0.85,
        "change_amount": -2.10,
        "volume": 30000000
      },
      "created_at": "2025-01-28T10:30:00Z",
      "updated_at": "2025-01-28T10:30:00Z"
    }
  ],
  "timestamp": "2025-01-28T14:30:00Z"
}
```

**Note:** `external_data` מופיע רק אם `include_external_data=true` ונתונים זמינים

---

### POST /api/watch-lists/:id/items

**מטרה:** הוספת טיקר לרשימה

**Request Body - Ticker במערכת:**
```json
{
  "ticker_id": 5
}
```

**Request Body - Ticker חיצוני:**
```json
{
  "external_symbol": "TSLA",
  "external_name": "Tesla Inc."
}
```

**Required:** אחד מתוך `ticker_id` או `external_symbol`

**Optional Fields:**
- `flag_color`: צבע דגל (#RRGGBB)
- `notes`: הערות
- `display_order`: מיקום בסדר (default: end)

**Validation:**
- Max 50 items per list (checked in Business Logic Service)
- Ticker לא יכול להיות כפול ברשימה

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": 3,
    "watch_list_id": 1,
    "ticker_id": 5,
    "flag_color": null,
    "display_order": 2,
    "notes": null,
    "created_at": "2025-01-28T15:00:00Z",
    "updated_at": "2025-01-28T15:00:00Z"
  },
  "timestamp": "2025-01-28T15:00:00Z"
}
```

**Error Responses:**
- `400`: Validation error (missing ticker, duplicate, max items exceeded)
- `404`: Watch list not found
- `403`: Permission denied
- `401`: Authentication required

---

### PUT /api/watch-lists/:id/items/:item_id

**מטרה:** עדכון פריט (דגל, הערות, מיקום)

**Request Body:**
```json
{
  "flag_color": "#fc5a06",
  "notes": "Updated notes",
  "display_order": 0
}
```

**All Fields Optional**

**Response:** כמו GET item

**Error Responses:**
- `400`: Validation error
- `404`: Item not found
- `403`: Permission denied

---

### DELETE /api/watch-lists/:id/items/:item_id

**מטרה:** הסרת טיקר מרשימה

**Response:**
```json
{
  "status": "success",
  "message": "Item removed from watch list",
  "timestamp": "2025-01-28T15:30:00Z"
}
```

---

### POST /api/watch-lists/:id/items/reorder

**מטרה:** סידור מחדש של פריטים ברשימה

**Request Body:**
```json
{
  "order": [
    {"id": 3, "display_order": 0},
    {"id": 1, "display_order": 1},
    {"id": 2, "display_order": 2}
  ]
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Items reordered successfully",
  "timestamp": "2025-01-28T15:45:00Z"
}
```

---

### POST /api/watch-lists/:id/items/copy

**מטרה:** העתקת פריט לרשימה אחרת

**Request Body:**
```json
{
  "item_id": 1,
  "target_list_id": 2
}
```

**Required Fields:**
- `item_id`: מזהה הפריט להעתקה
- `target_list_id`: מזהה רשימה יעד

**Validation:**
- Target list must belong to same user
- Item must not already exist in target list

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": 4,
    "watch_list_id": 2,
    "ticker_id": 5,
    "flag_color": "#26baac",
    "display_order": 0,
    "notes": "Watch for earnings",
    "created_at": "2025-01-28T16:00:00Z",
    "updated_at": "2025-01-28T16:00:00Z"
  },
  "timestamp": "2025-01-28T16:00:00Z"
}
```

---

## Flag-based Endpoints

### GET /api/watch-lists/flags/:color

**מטרה:** קבלת כל הטיקרים עם דגל בצבע ספציפי

**Parameters:**
- `color` (path): צבע דגל (#RRGGBB)
- `user_id` (query, optional): מזהה משתמש

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "watch_list_id": 1,
      "watch_list_name": "Tech Stocks",
      "ticker_id": 5,
      "ticker": {
        "id": 5,
        "symbol": "AAPL",
        "name": "Apple Inc."
      },
      "external_symbol": null,
      "flag_color": "#26baac",
      "notes": "Watch for earnings"
    }
  ],
  "timestamp": "2025-01-28T16:30:00Z"
}
```

**Note:** מחזיר טיקרים מכל הרשימות של המשתמש עם הדגל הספציפי

---

### GET /api/watch-lists/external-tickers

**מטרה:** קבלת כל הטיקרים החיצוניים של המשתמש

**Parameters:**
- `user_id` (query, optional): מזהה משתמש

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 2,
      "watch_list_id": 1,
      "watch_list_name": "Tech Stocks",
      "external_symbol": "TSLA",
      "external_name": "Tesla Inc.",
      "flag_color": "#fc5a06",
      "notes": null
    }
  ],
  "timestamp": "2025-01-28T16:45:00Z"
}
```

---

## External Data Integration

### רקע
טיקרים חיצוניים זקוקים לנתוני מחיר מ-external data providers.

**אסטרטגיה:**
- משיכה מרוכזת פעם אחת לכל טיקר
- Caching משותף לכל המשתמשים
- תדירות נמוכה (לפי הגדרות מערכת הנתונים החיצוניים)

### Endpoint: GET /api/watch-lists/:id/items (with external_data)

כשמשלחים `include_external_data=true`, השרת:
1. מזהה טיקרים חיצוניים ברשימה
2. שולף נתוני מחיר מ-cache/API
3. מחזיר אותם ב-`external_data` field

**External Data Structure:**
```json
{
  "external_data": {
    "price": 245.80,
    "change_percent": -0.85,
    "change_amount": -2.10,
    "volume": 30000000,
    "currency": "USD",
    "asof_utc": "2025-01-28T16:00:00Z",
    "source": "yahoo_finance"
  }
}
```

---

## Error Handling

### Standard Error Response
```json
{
  "status": "error",
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  },
  "timestamp": "2025-01-28T17:00:00Z"
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `AUTH_REQUIRED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Permission denied |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Validation failed |
| `MAX_LISTS_EXCEEDED` | 400 | Maximum watch lists exceeded (20) |
| `MAX_ITEMS_EXCEEDED` | 400 | Maximum items per list exceeded (50) |
| `DUPLICATE_ITEM` | 400 | Item already exists in list |
| `SERVER_ERROR` | 500 | Internal server error |

---

## Business Logic Service

### WatchListService

**מיקום:** `Backend/services/watch_list_service.py`

**Methods:**
- `create_watch_list(db, user_id, data)` - יצירת רשימה
- `update_watch_list(db, list_id, user_id, data)` - עדכון רשימה
- `delete_watch_list(db, list_id, user_id)` - מחיקת רשימה
- `get_user_watch_lists(db, user_id)` - קבלת כל הרשימות
- `add_item(db, list_id, user_id, data)` - הוספת פריט
- `update_item(db, item_id, user_id, data)` - עדכון פריט
- `remove_item(db, item_id, user_id)` - הסרת פריט
- `reorder_lists(db, user_id, order)` - סידור רשימות
- `reorder_items(db, list_id, user_id, order)` - סידור פריטים
- `get_items_by_flag(db, user_id, color)` - טיקרים לפי דגל
- `convert_external_to_system(db, item_id, user_id)` - המרת טיקר חיצוני למערכת

**Validation Constants:**
```python
MAX_WATCH_LISTS_PER_USER = 20  # TODO: Move to admin settings
MAX_TICKERS_PER_LIST = 50      # TODO: Move to admin settings
```

---

## Cache Strategy

### Invalidation
- `watch_lists` - invalidate על create/update/delete של רשימה
- `watch_list_items` - invalidate על create/update/delete של פריט
- `external_data` - נשלט על ידי External Data Service

### Cache Keys
- `watch_lists:user:{user_id}`
- `watch_list:{list_id}`
- `watch_list_items:list:{list_id}`
- `flagged_tickers:user:{user_id}:color:{color}`

---

**סיכום:** API תומך בכל הפעולות הנדרשות עם validation מלא, error handling, ותמיכה מלאה בטיקרים חיצוניים עם אינטגרציה למערכת הנתונים החיצוניים.


















