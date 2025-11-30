# System Management API Endpoints

## מטרת המסמך
מסמך זה מכיל רשימה מפורטת של כל ה-API endpoints המשמשים את עמוד מנהל מערכת.

## Base URLs
- **Development:** `http://127.0.0.1:8080`
- **Production:** `http://127.0.0.1:5001`

## System Overview APIs

### GET /api/system/overview
**תיאור:** מחזיר סקירה מקיפה של המערכת

**Response Structure:**
```json
{
  "status": "success",
  "data": {
    "timestamp": "2025-01-27T10:00:00Z",
    "response_time_ms": 245.5,
    "overall_status": "healthy",
    "overall_performance": "excellent",
    "system_score": 85,
    "health": {
      "server": "healthy",
      "database": "healthy",
      "cache": "healthy",
      "external_data": "healthy"
    },
    "metrics": {
      "performance": {
        "system": {
          "memory_percent": 67.8,
          "cpu_percent": 15.5,
          "disk_percent": 6.3
        }
      }
    },
    "summary": {
      "uptime": "2 days, 5 hours",
      "active_connections": 11,
      "memory_usage_percent": 67.8,
      "cpu_usage_percent": 15.5,
      "disk_usage_percent": 6.3
    }
  }
}
```

**Error Codes:**
- `500` - Internal server error
- `503` - Service unavailable

---

### GET /api/system/health
**תיאור:** מחזיר סטטוס בריאות המערכת

**Response Structure:**
```json
{
  "status": "success",
  "data": {
    "overall": "healthy",
    "components": {
      "server": "healthy",
      "database": "healthy",
      "cache": "healthy"
    }
  }
}
```

---

### GET /api/system/metrics
**תיאור:** מחזיר מדדי מערכת

**Response Structure:**
```json
{
  "status": "success",
  "data": {
    "performance": {
      "system": {
        "memory_percent": 67.8,
        "cpu_percent": 15.5,
        "disk_percent": 6.3
      }
    }
  }
}
```

---

### GET /api/system/info
**תיאור:** מחזיר מידע על המערכת

**Response Structure:**
```json
{
  "status": "success",
  "data": {
    "server": {
      "version": "2.0.0",
      "environment": "development"
    },
    "python": {
      "version": "3.11.0"
    }
  }
}
```

---

### GET /api/system/database
**תיאור:** מחזיר מידע על בסיס הנתונים

**Response Structure:**
```json
{
  "status": "success",
  "data": {
    "status": "connected",
    "size": 52428800,
    "tables": ["users", "trades", "trade_plans"]
  }
}
```

---

### GET /api/system/cache
**תיאור:** מחזיר מידע על המטמון

**Response Structure:**
```json
{
  "status": "success",
  "data": {
    "status": "active",
    "stats": {
      "hit_rate": 85.5,
      "miss_rate": 14.5,
      "total_requests": 1250
    }
  }
}
```

---

### GET /api/system/performance
**תיאור:** מחזיר נתוני ביצועים

**Response Structure:**
```json
{
  "status": "success",
  "data": {
    "memory": 67.8,
    "cpu": 15.5,
    "disk": 6.3,
    "network": {
      "active_connections": 11
    }
  }
}
```

---

### GET /api/system/environment
**תיאור:** מחזיר מידע על הסביבה

**Response Structure:**
```json
{
  "status": "success",
  "data": {
    "environment": "development",
    "port": 8080,
    "database": {
      "name": "TikTrack-db-development",
      "host": "localhost",
      "port": 5432,
      "type": "PostgreSQL"
    },
    "timestamp": "2025-01-27T10:00:00Z"
  }
}
```

---

## Server Management APIs

### GET /api/server/status
**תיאור:** מחזיר סטטוס שרת

**Response Structure:**
```json
{
  "status": "success",
  "data": {
    "server_mode": {
      "current": "development",
      "cache_stats": {},
      "cache_health": {}
    },
    "overall_health": {},
    "timestamp": "2025-01-27T10:00:00Z"
  }
}
```

---

### GET /api/server/system/info
**תיאור:** מחזיר מידע מפורט על השרת

**Response Structure:**
```json
{
  "status": "success",
  "data": {
    "server": {
      "version": "2.0.0",
      "environment": "development",
      "port": 8080
    },
    "python": {
      "version": "3.11.0",
      "flask": "2.3.3"
    },
    "os": {
      "system": "Darwin",
      "architecture": "x86_64"
    }
  }
}
```

---

## Cache Management APIs

### GET /api/cache/stats
**תיאור:** מחזיר סטטיסטיקות מטמון

**Response Structure:**
```json
{
  "status": "success",
  "data": {
    "hit_rate": 85.5,
    "miss_rate": 14.5,
    "total_requests": 1250,
    "average_response_time": 2.5
  }
}
```

---

### GET /api/cache/health
**תיאור:** מחזיר בריאות מטמון

**Response Structure:**
```json
{
  "status": "success",
  "data": {
    "status": "healthy",
    "layers": {
      "memory": "active",
      "localStorage": "active",
      "indexedDB": "active",
      "backend": "active"
    }
  }
}
```

---

## System Settings APIs

### GET /api/system-settings/smtp
**תיאור:** מחזיר הגדרות SMTP

**Response Structure:**
```json
{
  "success": true,
  "data": {
    "smtp_host": "smtp.gmail.com",
    "smtp_port": 587,
    "smtp_user": "admin@mezoo.co",
    "smtp_from_email": "admin@mezoo.co",
    "smtp_from_name": "TikTrack",
    "smtp_use_tls": true,
    "smtp_enabled": true,
    "smtp_test_email": ""
  }
}
```

---

### POST /api/system-settings/smtp
**תיאור:** מעדכן הגדרות SMTP

**Request Body:**
```json
{
  "smtp_host": "smtp.gmail.com",
  "smtp_port": 587,
  "smtp_user": "admin@mezoo.co",
  "smtp_password": "password",
  "smtp_from_email": "admin@mezoo.co",
  "smtp_from_name": "TikTrack",
  "smtp_use_tls": true,
  "smtp_enabled": true,
  "smtp_test_email": "test@example.com"
}
```

**Response Structure:**
```json
{
  "success": true,
  "message": "SMTP settings updated successfully"
}
```

---

### POST /api/system-settings/smtp/test
**תיאור:** בודק חיבור SMTP

**Response Structure:**
```json
{
  "success": true,
  "message": "SMTP connection successful"
}
```

---

### POST /api/system-settings/smtp/test-email
**תיאור:** שולח מייל בדיקה

**Request Body:**
```json
{
  "email": "test@example.com"
}
```

**Response Structure:**
```json
{
  "success": true,
  "message": "Test email sent successfully"
}
```

---

### GET /api/system-settings/external-data
**תיאור:** מחזיר הגדרות נתונים חיצוניים

**Response Structure:**
```json
{
  "success": true,
  "data": {
    "ttlActiveSeconds": 300,
    "ttlOpenSeconds": 900,
    "ttlClosedSeconds": 3600,
    "ttlCancelledSeconds": 7200,
    "externalDataSchedulerEnabled": true,
    "externalDataMaxBatchSize": 100
  }
}
```

---

### POST /api/system-settings/external-data
**תיאור:** מעדכן הגדרות נתונים חיצוניים

**Request Body:**
```json
{
  "ttlActiveSeconds": 300,
  "ttlOpenSeconds": 900,
  "ttlClosedSeconds": 3600,
  "ttlCancelledSeconds": 7200,
  "externalDataSchedulerEnabled": true,
  "externalDataMaxBatchSize": 100
}
```

**Response Structure:**
```json
{
  "success": true,
  "message": "External data settings updated successfully"
}
```

---

## Error Codes

### HTTP Status Codes
- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error
- `503` - Service Unavailable

### Error Response Structure
```json
{
  "status": "error",
  "error": {
    "message": "Error message here",
    "code": "ERROR_CODE"
  },
  "version": "1.0"
}
```

---

## Rate Limiting
- **Default:** 60 requests per minute
- **Cache TTL:** 30-300 seconds (תלוי ב-endpoint)

---

## Authentication
- כל ה-endpoints דורשים authentication
- משתמשים ב-session cookies
- אין צורך ב-API key

---

## הערות
- תאריך עדכון: ___________
- גרסה: ___________


