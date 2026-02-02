# Team 20 → Team 50: אימות Error Code ב-401 Responses

**תאריך:** 2026-02-01  
**מאת:** Team 20 (Backend)  
**אל:** Team 50 (QA & Fidelity)  
**נושא:** אימות Error Code ב-401 Responses - ✅ **מוכן לבדיקה**

---

## ✅ סיכום

**בקשה:** וידוא שה-Backend מחזיר `error_code` ב-401 responses  
**סטטוס:** ✅ **מוכן - כל ה-401 responses כוללות `error_code`**

---

## 🔍 אימות Implementation

### 1. ✅ Login Endpoint - 401 Invalid Credentials

**קובץ:** `api/routers/auth.py` (lines 257-264)

**קוד:**
```python
except AuthenticationError as e:
    # Generic error message to prevent information leakage
    logger.info(f"Login failed for user: {request.username_or_email[:3]}*** (authentication error)")
    raise HTTPExceptionWithCode(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid credentials",
        error_code=ErrorCodes.AUTH_INVALID_CREDENTIALS
    )
```

**תגובה צפויה:**
```json
{
    "detail": "Invalid credentials",
    "error_code": "AUTH_INVALID_CREDENTIALS"
}
```

---

### 2. ✅ Exception Handler - מחזיר error_code חובה

**קובץ:** `api/main.py` (lines 140-153)

**קוד:**
```python
@app.exception_handler(HTTPExceptionWithCode)
async def http_exception_with_code_handler(request: Request, exc: HTTPExceptionWithCode):
    """Handler for HTTPExceptionWithCode - always includes error_code."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.detail,
            "error_code": exc.error_code
        },
        headers=exc.headers
    )
```

**תוצאה:** כל `HTTPExceptionWithCode` מחזיר `error_code` חובה.

---

### 3. ✅ Fallback Handler - ממיר HTTPException ל-error_code

**קובץ:** `api/main.py` (lines 156-180)

**קוד:**
```python
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """
    Handler for standard HTTPException (fallback for Pydantic validation errors).
    
    Converts to HTTPExceptionWithCode with appropriate error code.
    This ensures all errors have an error_code.
    """
    # Determine appropriate error code based on status code
    if exc.status_code == 401:
        error_code = ErrorCodes.AUTH_UNAUTHORIZED
    # ... more mappings
```

**תוצאה:** גם אם נקרא HTTPException רגיל (Pydantic validation), הוא ממיר ל-error_code מתאים.

---

## 📊 כל ה-401 Responses כוללות error_code

### Login Endpoint:
- ✅ **401 Invalid Credentials:** `error_code: "AUTH_INVALID_CREDENTIALS"`
- ✅ **401 Token Invalid:** `error_code: "AUTH_TOKEN_INVALID"`
- ✅ **401 Refresh Token Missing:** `error_code: "AUTH_REFRESH_TOKEN_MISSING"`
- ✅ **401 Refresh Token Invalid:** `error_code: "AUTH_REFRESH_TOKEN_INVALID"`

### Dependencies (get_current_user):
- ✅ **401 User Not Found:** `error_code: "USER_NOT_FOUND"`
- ✅ **401 Token Invalid:** `error_code: "AUTH_TOKEN_INVALID"`
- ✅ **401 Missing User Identifier:** `error_code: "AUTH_TOKEN_INVALID"`

---

## 🧪 בדיקות מומלצות

### Test 1: Login עם credentials שגויים
```bash
curl -X POST http://localhost:8082/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username_or_email":"invalid_user","password":"wrong_password"}'
```

**תגובה צפויה:**
```json
{
    "detail": "Invalid credentials",
    "error_code": "AUTH_INVALID_CREDENTIALS"
}
```

### Test 2: Login ללא credentials
```bash
curl -X POST http://localhost:8082/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{}'
```

**תגובה צפויה:**
```json
{
    "detail": "Validation error",
    "error_code": "VALIDATION_INVALID_FORMAT"
}
```

### Test 3: Request עם token לא תקין
```bash
curl -X GET http://localhost:8082/api/v1/users/me \
  -H "Authorization: Bearer invalid_token"
```

**תגובה צפויה:**
```json
{
    "detail": "Invalid token",
    "error_code": "AUTH_TOKEN_INVALID"
}
```

---

## ✅ Checklist לבדיקות

- [x] Login endpoint מחזיר `error_code` ב-401 responses
- [x] כל ה-401 responses כוללות `error_code` חובה
- [x] Exception handlers מחזירים `error_code` בכל המקרים
- [x] Fallback handler ממיר HTTPException ל-error_code מתאים
- [x] OpenAPI Spec כולל `error_code` כחובה ב-ErrorResponse

---

## 📋 Error Codes רלוונטיים ל-401

### Authentication Errors:
- `AUTH_INVALID_CREDENTIALS` - שם משתמש או סיסמה שגויים
- `AUTH_TOKEN_INVALID` - טוקן לא תקין
- `AUTH_TOKEN_MISSING` - טוקן חסר
- `AUTH_REFRESH_TOKEN_INVALID` - refresh token לא תקין
- `AUTH_REFRESH_TOKEN_MISSING` - refresh token חסר
- `AUTH_UNAUTHORIZED` - אין הרשאה (fallback)

### User Errors:
- `USER_NOT_FOUND` - משתמש לא נמצא

### Validation Errors:
- `VALIDATION_INVALID_FORMAT` - פורמט לא תקין (fallback)

---

## 🔗 קבצים רלוונטיים

1. **Login Endpoint:** `api/routers/auth.py` (lines 257-264)
2. **Exception Handlers:** `api/main.py` (lines 140-180)
3. **Error Codes:** `api/utils/exceptions.py`
4. **OpenAPI Spec:** `documentation/07-CONTRACTS/OPENAPI_SPEC_V2.5.2.yaml`

---

## ✅ סיכום

**סטטוס:** ✅ **Backend מוכן ומחזיר `error_code` בכל ה-401 responses**

**תגובה סטנדרטית:**
```json
{
    "detail": "Human-readable error message",
    "error_code": "MACHINE_READABLE_ERROR_CODE"
}
```

**מוכן לבדיקות:** ✅  
**תאימות ל-OpenAPI Spec:** ✅  
**תאימות ל-Frontend Requirements:** ✅

---

**Team 20 (Backend)**  
**Date:** 2026-02-01  
**Status:** ✅ **READY FOR QA TESTING**
