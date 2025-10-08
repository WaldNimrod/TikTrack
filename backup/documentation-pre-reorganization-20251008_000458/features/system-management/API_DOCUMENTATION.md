# TikTrack System Management API Documentation

## סקירה כללית

מערכת מנהל המערכת של TikTrack מספקת API endpoints מקיפים לניהול, ניטור ותחזוקת המערכת. כל ה-endpoints מחזירים נתונים אמיתיים ומעודכנים בזמן אמת.

## Base URL
```
http://localhost:8080/api/system
```

## Authentication
כל ה-endpoints דורשים authentication (כרגע לא מוגדר, אבל מוכן להגדרה).

## System Overview Endpoints

### GET /overview
מחזיר סקירה כללית של המערכת.

**Response:**
```json
{
  "status": "success",
  "data": {
    "overall_status": "healthy",
    "overall_performance": "excellent",
    "system_score": 95,
    "response_time_ms": 150,
    "health": {
      "components": {
        "server": {"status": "healthy", "uptime": "2d 14h 32m"},
        "database": {"status": "healthy", "connections": 12},
        "cache": {"status": "healthy", "hit_rate": 94.5}
      }
    },
    "database": {
      "size_mb": 156.7,
      "tables": 23,
      "records": 15420
    },
    "system_info": {
      "server": {"version": "2.0.0", "environment": "development"},
      "os": {"system": "Darwin", "release": "24.5.0"}
    }
  }
}
```

### GET /health
מחזיר מידע בריאות מערכת מפורט.

**Response:**
```json
{
  "status": "success",
  "data": {
    "overall_status": "healthy",
    "components": {
      "database": {
        "status": "healthy",
        "response_time_ms": 45,
        "connections": 12,
        "last_check": "2025-09-20T10:30:00Z"
      },
      "cache": {
        "status": "healthy",
        "hit_rate": 94.5,
        "memory_usage_mb": 2.3,
        "last_check": "2025-09-20T10:30:00Z"
      },
      "system": {
        "status": "healthy",
        "cpu_percent": 23.5,
        "memory_percent": 67.8,
        "disk_percent": 45.2,
        "last_check": "2025-09-20T10:30:00Z"
      }
    }
  }
}
```

### GET /metrics
מחזיר מדדי ביצועים נוכחיים.

**Response:**
```json
{
  "status": "success",
  "data": {
    "performance": {
      "system": {
        "cpu_percent": 23.5,
        "memory_percent": 67.8,
        "disk_percent": 45.2,
        "memory_available_gb": 8.5,
        "disk_free_gb": 25.3
      }
    },
    "database": {
      "query_count": 1245,
      "avg_query_time_ms": 12.3,
      "slow_queries": 2,
      "connections_active": 12
    },
    "cache": {
      "hit_rate_percent": 94.5,
      "memory_usage_mb": 2.3,
      "entries_count": 45
    }
  }
}
```

### GET /info
מחזיר מידע מערכת בסיסי.

**Response:**
```json
{
  "status": "success",
  "data": {
    "server": {
      "version": "2.0.0",
      "environment": "development",
      "port": 8080
    },
    "os": {
      "system": "Darwin",
      "release": "24.5.0",
      "architecture": "arm64"
    },
    "python": {
      "version": "3.9.0",
      "platform": "darwin"
    }
  }
}
```

### GET /database
מחזיר מידע בסיס נתונים.

**Response:**
```json
{
  "status": "success",
  "data": {
    "status": "connected",
    "size_mb": 156.7,
    "table_count": 23,
    "index_count": 45,
    "record_counts": {
      "tickers": 150,
      "trades": 1200,
      "accounts": 5,
      "alerts": 25
    }
  }
}
```

### GET /cache
מחזיר מידע מטמון.

**Response:**
```json
{
  "status": "success",
  "data": {
    "status": "active",
    "total_entries": 45,
    "active_entries": 42,
    "memory_usage_mb": 2.3,
    "hit_rate_percent": 94.5,
    "ttl_seconds": 3600
  }
}
```

### GET /logs
מחזיר לוגי מערכת אחרונים.

**Response:**
```json
{
  "status": "success",
  "data": {
    "logs": [
      {
        "timestamp": "2025-09-20T10:30:00Z",
        "level": "INFO",
        "message": "System check completed successfully",
        "source": "system"
      },
      {
        "timestamp": "2025-09-20T10:29:30Z",
        "level": "WARNING",
        "message": "High memory usage detected",
        "source": "monitor"
      }
    ],
    "total_count": 1250,
    "filtered_count": 2
  }
}
```

### GET /performance
מחזיר ביצועי מערכת ומגמות.

**Response:**
```json
{
  "status": "success",
  "data": {
    "current": {
      "response_time_ms": 150,
      "requests_per_minute": 45,
      "error_rate_percent": 0.1
    },
    "trends": {
      "response_time": "stable",
      "memory_usage": "stable",
      "cpu_usage": "stable"
    },
    "recommendations": [
      "System performance is excellent",
      "No optimization needed at this time"
    ]
  }
}
```

### GET /external-data
מחזיר סטטוס נתונים חיצוניים.

**Response:**
```json
{
  "status": "success",
  "data": {
    "status": "active",
    "providers": ["yahoo_finance"],
    "accuracy": {
      "yahoo_finance": {
        "status": "active",
        "last_update": "2025-09-20T10:30:00Z",
        "accuracy_percent": 98.5,
        "data_freshness_minutes": 5,
        "success_rate_percent": 99.2
      }
    },
    "last_update": "2025-09-20T10:30:00Z",
    "data_freshness_minutes": 5,
    "overall_accuracy_percent": 98.5
  }
}
```

### GET /alerts
מחזיר התראות מערכת.

**Response:**
```json
{
  "status": "success",
  "data": {
    "summary": {
      "error": 1,
      "warning": 2,
      "info": 0
    },
    "alerts": [
      {
        "timestamp": "2025-09-20T10:30:00Z",
        "level": "ERROR",
        "message": "Database connection timeout - retrying...",
        "source": "database"
      },
      {
        "timestamp": "2025-09-20T10:29:30Z",
        "level": "WARNING",
        "message": "High memory usage detected (85%)",
        "source": "system"
      }
    ]
  }
}
```

### GET /detailed-log
מחזיר לוג מפורט של המערכת.

**Response:**
```json
{
  "status": "success",
  "data": {
    "log": "=== TikTrack System Detailed Log ===\nGenerated: 2025-09-20T10:30:00Z\n\nSystem Status: Healthy\nPerformance: Excellent\nUptime: 2 days, 14 hours, 32 minutes\n\nDatabase: Connected (156.7 MB, 23 tables)\nCache: Active (94.5% hit rate, 2.3 MB)\nExternal Data: Active (Yahoo Finance, 98.5% accuracy)\n\nActive Alerts: 3 (1 error, 2 warnings)\nLast Backup: 2025-09-19T02:00:00Z\nNext Backup: 2025-09-20T02:00:00Z\n\n=== End of Log ==="
  }
}
```

## Backup Management Endpoints

### POST /backup/create
יוצר גיבוי מערכת חדש.

**Response:**
```json
{
  "status": "success",
  "message": "System backup created successfully",
  "data": {
    "backup_path": "backups/tiktrack_backup_20250920_103000.tar.gz",
    "backup_filename": "tiktrack_backup_20250920_103000.tar.gz",
    "backup_size_mb": 156.7,
    "timestamp": "2025-09-20T10:30:00Z",
    "components": {
      "database": {"status": "success", "size_mb": 150.2},
      "configuration": {"status": "success", "size_mb": 2.1},
      "logs": {"status": "success", "size_mb": 4.4}
    }
  }
}
```

### POST /backup/restore
משחזר מערכת מגיבוי.

**Request Body:**
```json
{
  "backup_path": "backups/tiktrack_backup_20250920_103000.tar.gz"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "System restored successfully",
  "data": {
    "backup_file": "backups/tiktrack_backup_20250920_103000.tar.gz",
    "restore_timestamp": "2025-09-20T10:30:00Z",
    "components": {
      "database": {"status": "success", "restored_to": "Backend/db/simpleTrade_new.db"},
      "configuration": {"status": "success", "restored_files": ["Backend/config/database.py"]}
    }
  }
}
```

### GET /backup/list
מחזיר רשימת גיבויים זמינים.

**Response:**
```json
{
  "status": "success",
  "data": {
    "backups": [
      {
        "filename": "tiktrack_backup_20250920_103000.tar.gz",
        "path": "backups/tiktrack_backup_20250920_103000.tar.gz",
        "size_mb": 156.7,
        "created_at": "2025-09-20T10:30:00Z",
        "modified_at": "2025-09-20T10:30:00Z"
      }
    ],
    "count": 1
  }
}
```

### DELETE /backup/delete
מוחק גיבוי.

**Request Body:**
```json
{
  "backup_path": "backups/tiktrack_backup_20250920_103000.tar.gz"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Backup deleted successfully",
  "data": {
    "message": "Backup deleted: tiktrack_backup_20250920_103000.tar.gz",
    "timestamp": "2025-09-20T10:30:00Z"
  }
}
```

## Error Responses

כל ה-endpoints מחזירים שגיאות בפורמט אחיד:

```json
{
  "status": "error",
  "message": "Error description",
  "error": "Detailed error message",
  "timestamp": "2025-09-20T10:30:00Z"
}
```

## Status Codes

- **200 OK**: בקשה הושלמה בהצלחה
- **400 Bad Request**: בקשה לא תקינה
- **401 Unauthorized**: לא מורשה (כשיהיה authentication)
- **404 Not Found**: משאב לא נמצא
- **500 Internal Server Error**: שגיאת שרת

## Rate Limiting

כל ה-endpoints מוגבלים ל-100 בקשות לדקה לכל IP.

## Examples

### JavaScript Example
```javascript
// Get system overview
const response = await fetch('/api/system/overview');
const data = await response.json();
console.log('System Status:', data.data.overall_status);

// Create backup
const backupResponse = await fetch('/api/system/backup/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
});
const backupData = await backupResponse.json();
console.log('Backup created:', backupData.data.backup_filename);
```

### Python Example
```python
import requests

# Get system health
response = requests.get('http://localhost:8080/api/system/health')
data = response.json()
print(f"System Status: {data['data']['overall_status']}")

# Create backup
backup_response = requests.post('http://localhost:8080/api/system/backup/create')
backup_data = backup_response.json()
print(f"Backup created: {backup_data['data']['backup_filename']}")
```

---

**Last Updated**: 2025-09-20  
**Maintainer**: TikTrack Development Team  
**Status**: ✅ מוכן לשימוש עם נתונים אמיתיים
