# מערכת אבטחה מתקדמת - TikTrack

**תאריך עדכון אחרון:** 01.12.2025  
**גרסה:** 2.0.0

## סקירה כללית

מערכת האבטחה המתקדמת של TikTrack מספקת הגנה מקיפה מפני איומים שונים עם Rate Limiting, Response Headers, Error Handling מתקדם, בידוד נתוני משתמשים והגנת עמודים.

## תיעוד נוסף

- 🔐 **בידוד נתוני משתמשים**: [SECURITY_AUDIT_USER_DATA_ISOLATION.md](../production/SECURITY_AUDIT_USER_DATA_ISOLATION.md) - דוח אבטחה ותיקון בידוד נתוני משתמשים
- 🛡️ **הגנת עמודים**: [SECURITY_AUDIT_PAGE_PROTECTION.md](../production/SECURITY_AUDIT_PAGE_PROTECTION.md) - דוח אבטחה ותיקון הגנת עמודים
- 📖 **מדריך למפתחים**: [SECURITY_GUIDELINES.md](../03-DEVELOPMENT/GUIDES/SECURITY_GUIDELINES.md) - הנחיות למפתחים להוספת user_id filtering והגנת עמודים

## רכיבי המערכת

### 1. Rate Limiting

#### תכונות

- **IP-based Limiting**: הגבלה לפי כתובת IP
- **Endpoint-specific Limits**: מגבלות שונות לכל endpoint
- **Configurable Windows**: חלונות זמן מותאמים
- **Automatic Cleanup**: ניקוי אוטומטי של נתונים ישנים

#### רמות Rate Limiting

- **Admin**: 200 requests/minute
- **API**: 30 requests/minute
- **Auth**: 10 requests/minute
- **Upload**: 20 requests/minute
- **Default**: 60 requests/minute

#### קובץ: `Backend/utils/rate_limiter.py`

```python
class RateLimiter:
    def __init__(self):
        self.rate_limits = {}
        self.cleanup_interval = 300  # 5 minutes
    
    def check_rate_limit(self, ip: str, endpoint: str) -> bool:
        # בדיקת rate limit
        pass
    
    def cleanup_expired_entries(self):
        # ניקוי נתונים ישנים
        pass
```

### 2. Response Headers Optimization

#### Security Headers

- **X-Content-Type-Options**: nosniff
- **X-Frame-Options**: DENY
- **X-XSS-Protection**: 1; mode=block
- **Strict-Transport-Security**: max-age=31536000
- **Referrer-Policy**: strict-origin-when-cross-origin
- **Permissions-Policy**: geolocation=(), microphone=(), camera=()

#### Performance Headers

- **Cache-Control**: no-cache, no-store, must-revalidate
- **Pragma**: no-cache
- **Expires**: 0
- **X-Response-Time**: זמן תגובה בפועל
- **Server-Timing**: זמני ביצוע מפורטים

#### CORS Headers

- **Access-Control-Allow-Origin**: *
- **Access-Control-Allow-Methods**: GET, POST, PUT, DELETE, OPTIONS
- **Access-Control-Allow-Headers**: Content-Type, Authorization, X-Requested-With
- **Access-Control-Allow-Credentials**: true

#### קובץ: `Backend/utils/response_optimizer.py`

```python
class ResponseOptimizer:
    def add_security_headers(self, response):
        # הוספת security headers
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        return response
    
    def add_performance_headers(self, response, start_time):
        # הוספת performance headers
        response_time = (time.time() - start_time) * 1000
        response.headers['X-Response-Time'] = f'{response_time:.2f}ms'
        return response
```

### 3. Advanced Error Handling

#### תכונות

- **Custom Error Classes**: מחלקות שגיאה מותאמות
- **Centralized Error Handling**: טיפול מרכזי בשגיאות
- **Detailed Error Logging**: לוגי שגיאות מפורטים
- **User-friendly Messages**: הודעות שגיאה ידידותיות למשתמש

#### קובץ: `Backend/utils/error_handlers.py`

```python
class ErrorHandler:
    @staticmethod
    def register_error_handlers(app):
        @app.errorhandler(404)
        def not_found(error):
            return jsonify({
                'status': 'error',
                'error_code': 'HTTP_404',
                'message': 'The requested URL was not found on the server.',
                'timestamp': datetime.now().isoformat()
            }), 404
        
        @app.errorhandler(500)
        def internal_error(error):
            return jsonify({
                'status': 'error',
                'error_code': 'HTTP_500',
                'message': 'Internal server error occurred.',
                'timestamp': datetime.now().isoformat()
            }), 500
```

## API Endpoints

### Rate Limiting Management

- `GET /api/rate-limits/stats` - סטטיסטיקות rate limiting
- `POST /api/rate-limits/reset` - איפוס rate limits

### Error Handling

- כל ה-endpoints מוגנים עם error handling מתקדם
- הודעות שגיאה מפורטות וידידותיות

## דוגמאות שימוש

### בדיקת Rate Limiting

```bash
# בדיקת סטטיסטיקות
curl http://localhost:8080/api/rate-limits/stats

# איפוס rate limits
curl -X POST http://localhost:8080/api/rate-limits/reset
```

### בדיקת Response Headers

```bash
# בדיקת headers
curl -I http://localhost:8080/api/health

# פלט לדוגמה:
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# X-XSS-Protection: 1; mode=block
# Strict-Transport-Security: max-age=31536000; includeSubDomains
# Cache-Control: no-cache, no-store, must-revalidate
# X-Response-Time: 1010.62ms
```

### בדיקת Error Handling

```bash
# בדיקת 404 error
curl http://localhost:8080/api/nonexistent-endpoint

# פלט לדוגמה:
# {
#   "error_code": "HTTP_404",
#   "message": "The requested URL was not found on the server.",
#   "status": "error",
#   "timestamp": "2025-09-01T08:19:21.068772"
# }
```

## הגדרת Rate Limiting

### הגדרת מגבלות

```python
# הגדרת מגבלות לכל endpoint
RATE_LIMITS = {
    'admin': {'requests': 200, 'window': 60},
    'api': {'requests': 30, 'window': 60},
    'auth': {'requests': 10, 'window': 60},
    'upload': {'requests': 20, 'window': 60},
    'default': {'requests': 60, 'window': 60}
}
```

### שימוש ב-Decorator

```python
from utils.rate_limiter import rate_limit_api

@app.route("/api/sensitive-endpoint")
@rate_limit_api(requests_per_minute=10)
def sensitive_endpoint():
    # קוד הפונקציה
    pass
```

## ניטור אבטחה

### Rate Limiting Stats

```json
{
  "data": {
    "total_clients": 1,
    "limited_clients": 0,
    "total_requests": 15,
    "endpoint_limits": {
      "admin": {"requests": 200, "window": 60},
      "api": {"requests": 30, "window": 60}
    },
    "last_cleanup": 1756701632.752023
  }
}
```

### Error Statistics

```json
{
  "error_stats": {
    "total_errors": 5,
    "error_types": {
      "HTTP_404": 3,
      "HTTP_500": 1,
      "ValidationError": 1
    },
    "last_error": "2025-09-01T08:19:21.068772"
  }
}
```

## פתרון בעיות

### בעיות נפוצות

1. **Rate Limit Exceeded**: בדוק מגבלות ו-windows
2. **CORS Errors**: בדוק CORS headers
3. **Security Headers Missing**: בדוק response optimizer
4. **Error Messages Unclear**: בדוק error handlers

### לוגים לבדיקה

```bash
# בדיקת לוגי שגיאות
tail -f logs/errors.log

# בדיקת לוגי אבטחה
grep "security" logs/app.log
```

## תחזוקה

### ניקוי Rate Limits

```bash
# איפוס ידני
curl -X POST http://localhost:8080/api/rate-limits/reset
```

### עדכון מגבלות

```python
# עדכון מגבלות בזמן ריצה
rate_limiter.update_limits('api', {'requests': 50, 'window': 60})
```

## התראות אבטחה

### סטטוסי אבטחה

- **Secure**: כל אמצעי האבטחה פעילים
- **Warning**: בעיה קלה באבטחה
- **Critical**: בעיה חמורה באבטחה

### מדדי אבטחה

- **Rate Limiting**: פעיל ומוגן
- **Headers**: מוגדרים כראוי
- **Error Handling**: מתקדם וידידותי

---

**גרסה**: 2.0.2  
**תאריך**: ספטמבר 2025  
**סטטוס**: פעיל ויציב
