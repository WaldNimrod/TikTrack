# TikTrack Project Phoenix - Enhanced API Documentation
**project_domain:** TIKTRACK

**תאריך יצירה:** 2026-02-03  
**גרסה:** 2.5.2  
**מטרה:** תיעוד API מפורט לחבילת הערכה חיצונית  
**צוות:** Team 20 (Backend Implementation)  
**סטטוס:** 📝 **DRAFT - Pending QA**

---

## 📋 תוכן עניינים

1. [דוגמאות Request/Response מלאות](#דוגמאות-requestresponse-מלאות)
2. [Error Codes מפורטים](#error-codes-מפורטים)
3. [Authentication Flow תיעוד](#authentication-flow-תיעוד)
4. [Rate Limiting תיעוד](#rate-limiting-תיעוד)
5. [Security Headers תיעוד](#security-headers-תיעוד)

---

## דוגמאות Request/Response מלאות

### 1. Login Request/Response Example

#### **Request:**
```http
POST /api/v1/auth/login HTTP/1.1
Host: localhost:8080
Content-Type: application/json

{
  "username_or_email": "user@example.com",
  "password": "secure_password_123"
}
```

#### **Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMWFSWjNORERLVFNWNFJSRkZRNjlHNUZBViIsImV4cCI6MTcwNjgxMjAwMH0.example_signature",
  "token_type": "bearer",
  "expires_at": "2026-02-01T12:00:00Z",
  "user": {
    "external_ulids": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
    "email": "user@example.com",
    "phone_numbers": "+12025551234",
    "user_tier_levels": "Bronze",
    "username": "johndoe",
    "display_name": "John Doe",
    "first_name": "John",
    "last_name": "Doe",
    "timezone": "Asia/Jerusalem",
    "language": "he",
    "role": "USER",
    "is_email_verified": true,
    "phone_verified": false,
    "created_at": "2026-01-31T12:00:00Z"
  }
}
```

**Headers:**
```
Set-Cookie: refresh_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth/refresh; Expires=Wed, 08 Feb 2026 12:00:00 GMT
```

#### **Response (401 Unauthorized):**
```json
{
  "detail": "Invalid credentials",
  "error_code": "AUTH_INVALID_CREDENTIALS"
}
```

#### **Response (422 Unprocessable Entity - Validation Error):**
```json
{
  "detail": [
    {
      "loc": ["body", "username_or_email"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ],
  "error_code": "VALIDATION_INVALID_FORMAT"
}
```

---

### 2. Register Request/Response Example

#### **Request:**
```http
POST /api/v1/auth/register HTTP/1.1
Host: localhost:8080
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "secure_password_123",
  "phone_number": "+12025551234"
}
```

#### **Response (201 Created):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMWFSWjNORERLVFNWNFJSRkZRNjlHNUZBViIsImV4cCI6MTcwNjgxMjAwMH0.example_signature",
  "token_type": "bearer",
  "expires_at": "2026-02-01T12:00:00Z",
  "user": {
    "external_ulids": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
    "email": "john@example.com",
    "phone_numbers": "+12025551234",
    "user_tier_levels": "Bronze",
    "username": "johndoe",
    "display_name": null,
    "first_name": null,
    "last_name": null,
    "timezone": null,
    "language": null,
    "role": "USER",
    "is_email_verified": false,
    "phone_verified": false,
    "created_at": "2026-02-03T10:00:00Z"
  }
}
```

**Headers:**
```
Set-Cookie: refresh_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth/refresh; Expires=Wed, 10 Feb 2026 10:00:00 GMT
```

#### **Response (409 Conflict - User Already Exists):**
```json
{
  "detail": "Email address is already in use by another user",
  "error_code": "USER_ALREADY_EXISTS"
}
```

#### **Response (422 Unprocessable Entity - Validation Error):**
```json
{
  "detail": [
    {
      "loc": ["body", "password"],
      "msg": "ensure this value has at least 8 characters",
      "type": "value_error.any_str.min_length",
      "ctx": {"limit_value": 8}
    },
    {
      "loc": ["body", "phone_number"],
      "msg": "Phone number must be in E.164 format",
      "type": "value_error"
    }
  ],
  "error_code": "VALIDATION_INVALID_FORMAT"
}
```

---

### 3. Get User Request/Response Example

#### **Request:**
```http
GET /api/v1/users/me HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### **Response (200 OK):**
```json
{
  "external_ulids": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
  "email": "user@example.com",
  "phone_numbers": "+12025551234",
  "user_tier_levels": "Bronze",
  "username": "johndoe",
  "display_name": "John Doe",
  "first_name": "John",
  "last_name": "Doe",
  "timezone": "Asia/Jerusalem",
  "language": "he",
  "role": "USER",
  "is_email_verified": true,
  "phone_verified": false,
  "created_at": "2026-01-31T12:00:00Z"
}
```

#### **Response (401 Unauthorized):**
```json
{
  "detail": "Invalid or expired token",
  "error_code": "AUTH_TOKEN_INVALID"
}
```

---

### 4. Update User Request/Response Example

#### **Request:**
```http
PUT /api/v1/users/me HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "display_name": "Johnny",
  "phone_number": "+12025551234",
  "timezone": "America/New_York",
  "language": "en"
}
```

#### **Response (200 OK):**
```json
{
  "external_ulids": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
  "email": "user@example.com",
  "phone_numbers": "+12025551234",
  "user_tier_levels": "Bronze",
  "username": "johndoe",
  "display_name": "Johnny",
  "first_name": "John",
  "last_name": "Doe",
  "timezone": "America/New_York",
  "language": "en",
  "role": "USER",
  "is_email_verified": true,
  "phone_verified": false,
  "created_at": "2026-01-31T12:00:00Z"
}
```

#### **Response (409 Conflict - Duplicate Phone):**
```json
{
  "detail": "Phone number is already in use by another user",
  "error_code": "USER_ALREADY_EXISTS"
}
```

#### **Response (422 Unprocessable Entity - Validation Error):**
```json
{
  "detail": [
    {
      "loc": ["body", "phone_number"],
      "msg": "Phone number must be in E.164 format (e.g., +1234567890)",
      "type": "value_error"
    }
  ],
  "error_code": "VALIDATION_INVALID_FORMAT"
}
```

---

## Error Codes מפורטים

### Error Response Format

כל שגיאה מחזירה את הפורמט הבא:

```json
{
  "detail": "Human-readable error message",
  "error_code": "MACHINE_READABLE_ERROR_CODE"
}
```

**חובה:** כל שגיאה **חייבת** לכלול את השדה `error_code` (לא אופציונלי).

---

### Authentication Errors

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| `AUTH_INVALID_CREDENTIALS` | 401 | Invalid username/email or password |
| `AUTH_TOKEN_EXPIRED` | 401 | Access token has expired |
| `AUTH_UNAUTHORIZED` | 401 | User is not authorized |
| `AUTH_RATE_LIMIT_EXCEEDED` | 429 | Too many authentication attempts |
| `AUTH_TOKEN_INVALID` | 401 | Invalid or malformed token |
| `AUTH_TOKEN_MISSING` | 401 | Authorization header missing |
| `AUTH_REFRESH_TOKEN_INVALID` | 401 | Invalid refresh token |
| `AUTH_REFRESH_TOKEN_MISSING` | 401 | Refresh token cookie missing |

**דוגמאות:**

```json
{
  "detail": "Invalid credentials",
  "error_code": "AUTH_INVALID_CREDENTIALS"
}
```

```json
{
  "detail": "Invalid or expired token",
  "error_code": "AUTH_TOKEN_INVALID"
}
```

---

### Validation Errors

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| `VALIDATION_FIELD_REQUIRED` | 400 | Required field is missing |
| `VALIDATION_INVALID_EMAIL` | 422 | Invalid email format |
| `VALIDATION_INVALID_PHONE` | 422 | Invalid phone number format |
| `VALIDATION_INVALID_FORMAT` | 422 | Invalid request format (Pydantic validation) |
| `VALIDATION_INVALID_PASSWORD` | 422 | Password does not meet requirements |

**דוגמאות:**

```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ],
  "error_code": "VALIDATION_INVALID_FORMAT"
}
```

```json
{
  "detail": "Username, email, and password are required",
  "error_code": "VALIDATION_FIELD_REQUIRED"
}
```

---

### User Errors

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| `USER_NOT_FOUND` | 404 | User does not exist |
| `USER_ALREADY_EXISTS` | 409 | User with this email/phone already exists |
| `USER_UPDATE_FAILED` | 400 | User profile update failed |
| `USER_INACTIVE` | 403 | User account is inactive |
| `USER_LOCKED` | 403 | User account is locked |
| `USER_EMAIL_NOT_VERIFIED` | 403 | Email address not verified |
| `USER_PHONE_NOT_VERIFIED` | 403 | Phone number not verified |

**דוגמאות:**

```json
{
  "detail": "Email address is already in use by another user",
  "error_code": "USER_ALREADY_EXISTS"
}
```

```json
{
  "detail": "User account is inactive",
  "error_code": "USER_INACTIVE"
}
```

---

### Password Reset Errors

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| `PASSWORD_RESET_INVALID_TOKEN` | 400 | Invalid reset token |
| `PASSWORD_RESET_TOKEN_EXPIRED` | 400 | Reset token has expired |
| `PASSWORD_RESET_INVALID_CODE` | 400 | Invalid verification code |
| `PASSWORD_RESET_CODE_EXPIRED` | 400 | Verification code has expired |
| `PASSWORD_RESET_MAX_ATTEMPTS` | 429 | Maximum reset attempts exceeded |
| `PASSWORD_RESET_NO_PHONE` | 400 | No phone number associated with account |

**דוגמאות:**

```json
{
  "detail": "Invalid reset token",
  "error_code": "PASSWORD_RESET_INVALID_TOKEN"
}
```

```json
{
  "detail": "Verification code has expired",
  "error_code": "PASSWORD_RESET_CODE_EXPIRED"
}
```

---

### API Key Errors

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| `API_KEY_NOT_FOUND` | 404 | API key does not exist |
| `API_KEY_CREATE_FAILED` | 400 | Failed to create API key |
| `API_KEY_UPDATE_FAILED` | 400 | Failed to update API key |
| `API_KEY_DELETE_FAILED` | 400 | Failed to delete API key |
| `API_KEY_VERIFY_FAILED` | 400 | API key verification failed |

**דוגמאות:**

```json
{
  "detail": "API key not found",
  "error_code": "API_KEY_NOT_FOUND"
}
```

---

### Generic Errors

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| `SERVER_ERROR` | 500 | Internal server error |
| `NETWORK_ERROR` | 503 | Network connectivity issue |
| `UNKNOWN_ERROR` | 500 | Unexpected error occurred |
| `DATABASE_ERROR` | 500 | Database operation failed |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

**דוגמאות:**

```json
{
  "detail": "Internal server error",
  "error_code": "SERVER_ERROR"
}
```

```json
{
  "detail": "Database connection failed",
  "error_code": "DATABASE_ERROR"
}
```

---

## Error Handling Guidelines

### 1. **כל שגיאה חייבת לכלול `error_code`**
- אין שגיאות ללא `error_code`
- `error_code` הוא חובה, לא אופציונלי

### 2. **שימוש ב-`error_code` בצד הלקוח**
- Frontend יכול להשתמש ב-`error_code` לטיפול ספציפי בשגיאות
- `error_code` הוא machine-readable ויציב (לא משתנה)

### 3. **`detail` הוא human-readable**
- `detail` מכיל הודעה ברורה למשתמש
- יכול להיות string או array (עבור validation errors)

### 4. **HTTP Status Codes**
- `error_code` משלים את ה-HTTP status code
- HTTP status code מציין את סוג השגיאה הכללי
- `error_code` מציין את השגיאה הספציפית

---

## Authentication Flow תיעוד

### JWT Token Flow

#### 1. **Login Flow**

```
┌─────────┐                    ┌─────────┐                    ┌─────────┐
│ Client  │                    │ Backend │                    │Database │
└────┬────┘                    └────┬────┘                    └────┬────┘
     │                               │                               │
     │ POST /auth/login              │                               │
     │ {username, password}          │                               │
     ├───────────────────────────────>│                               │
     │                               │                               │
     │                               │ Verify credentials            │
     │                               ├───────────────────────────────>│
     │                               │<───────────────────────────────┤
     │                               │                               │
     │                               │ Generate JWT tokens           │
     │                               │ - Access token (24h)          │
     │                               │ - Refresh token (7d)          │
     │                               │                               │
     │ 200 OK                        │                               │
     │ {access_token, user}          │                               │
     │ Set-Cookie: refresh_token     │                               │
     │<───────────────────────────────┤                               │
     │                               │                               │
```

**תיאור:**
1. הלקוח שולח `username_or_email` ו-`password` ל-`POST /api/v1/auth/login`
2. השרת מאמת את הפרטים מול מסד הנתונים
3. השרת יוצר שני tokens:
   - **Access Token:** JWT עם תוקף של 24 שעות, נשלח ב-response body
   - **Refresh Token:** JWT עם תוקף של 7 ימים, נשלח ב-httpOnly cookie
4. הלקוח שומר את ה-Access Token ומשתמש בו לכל בקשות API

---

#### 2. **Refresh Token Flow**

```
┌─────────┐                    ┌─────────┐                    ┌─────────┐
│ Client  │                    │ Backend │                    │Database │
└────┬────┘                    └────┬────┘                    └────┬────┘
     │                               │                               │
     │ POST /auth/refresh            │                               │
     │ Cookie: refresh_token         │                               │
     ├───────────────────────────────>│                               │
     │                               │                               │
     │                               │ Verify refresh token          │
     │                               ├───────────────────────────────>│
     │                               │<───────────────────────────────┤
     │                               │                               │
     │                               │ Rotate refresh token          │
     │                               │ - Revoke old token             │
     │                               │ - Generate new tokens          │
     │                               │                               │
     │ 200 OK                        │                               │
     │ {access_token}                │                               │
     │ Set-Cookie: refresh_token    │                               │
     │<───────────────────────────────┤                               │
     │                               │                               │
```

**תיאור:**
1. הלקוח שולח `POST /api/v1/auth/refresh` עם `refresh_token` ב-cookie
2. השרת מאמת את ה-refresh token מול מסד הנתונים
3. השרת מבצע **Refresh Token Rotation:**
   - מבטל את ה-refresh token הישן
   - יוצר access token חדש (24 שעות)
   - יוצר refresh token חדש (7 ימים)
4. הלקוח מקבל access token חדש ב-response body ו-refresh token חדש ב-cookie

---

#### 3. **Token Expiration Handling**

**Access Token Expired:**
- HTTP Status: `401 Unauthorized`
- Error Code: `AUTH_TOKEN_EXPIRED`
- **טיפול:** הלקוח צריך לשלוח `POST /api/v1/auth/refresh` עם refresh token

**Refresh Token Expired:**
- HTTP Status: `401 Unauthorized`
- Error Code: `AUTH_REFRESH_TOKEN_INVALID`
- **טיפול:** הלקוח צריך לבצע login מחדש

**דוגמה לטיפול בצד הלקוח:**

```javascript
// Pseudo-code
try {
  const response = await api.get('/users/me');
  return response.data;
} catch (error) {
  if (error.response?.data?.error_code === 'AUTH_TOKEN_EXPIRED') {
    // Try to refresh token
    try {
      await api.post('/auth/refresh');
      // Retry original request
      return await api.get('/users/me');
    } catch (refreshError) {
      // Refresh failed - redirect to login
      redirectToLogin();
    }
  }
}
```

---

### Token Structure

#### **Access Token Payload:**
```json
{
  "sub": "01ARZ3NDEKTSV4RRFFQ69G5FAV",  // User ULID
  "exp": 1706812000,                    // Expiration timestamp
  "iat": 1706725600,                    // Issued at timestamp
  "type": "access"                      // Token type
}
```

#### **Refresh Token Payload:**
```json
{
  "sub": "01ARZ3NDEKTSV4RRFFQ69G5FAV",  // User ULID
  "exp": 1707325600,                    // Expiration timestamp (7 days)
  "iat": 1706725600,                    // Issued at timestamp
  "type": "refresh",                    // Token type
  "jti": "uuid-of-refresh-token"        // JWT ID (for revocation)
}
```

---

## Rate Limiting תיעוד

### Rate Limit Configuration

**Rate Limiter:** `slowapi` (FastAPI rate limiting middleware)

**Configuration:**
- **Key Function:** `get_remote_address` (IP-based rate limiting)
- **Storage:** In-memory (default)

---

### Rate Limits per Endpoint

| Endpoint | Rate Limit | Description |
|----------|------------|-------------|
| `PUT /api/v1/users/me` | 5 requests / 15 minutes | User profile updates |
| `POST /api/v1/auth/login` | 10 requests / 15 minutes | Login attempts |
| `POST /api/v1/auth/register` | 5 requests / 15 minutes | Registration attempts |
| `POST /api/v1/auth/reset-password` | 3 requests / 15 minutes | Password reset requests |
| All other endpoints | No rate limit (default) | General API endpoints |

---

### Rate Limit Headers

**Response Headers (כאשר Rate Limit מופעל):**

```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 2
X-RateLimit-Reset: 1706812000
Retry-After: 900
```

**תיאור:**
- `X-RateLimit-Limit`: מספר הבקשות המותרות במסגרת הזמן
- `X-RateLimit-Remaining`: מספר הבקשות הנותרות
- `X-RateLimit-Reset`: timestamp של איפוס ה-rate limit
- `Retry-After`: מספר השניות להמתין לפני ניסיון נוסף

---

### Rate Limit Error Responses

**HTTP Status:** `429 Too Many Requests`

**Response Body:**
```json
{
  "detail": "Rate limit exceeded: 5 requests per 15 minutes",
  "error_code": "AUTH_RATE_LIMIT_EXCEEDED"
}
```

**דוגמה:**

```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1706812000
Retry-After: 900

{
  "detail": "Rate limit exceeded: 5 requests per 15 minutes",
  "error_code": "AUTH_RATE_LIMIT_EXCEEDED"
}
```

---

### Rate Limit Handling Guidelines

1. **טיפול בצד הלקוח:**
   - בדוק את ה-`Retry-After` header
   - המתן לפני ניסיון נוסף
   - הצג הודעה למשתמש

2. **טיפול בצד השרת:**
   - Rate limiting מופעל אוטומטית על ידי `slowapi`
   - כל endpoint יכול להגדיר rate limit משלו
   - Rate limits מבוססים על IP address

---

## Security Headers תיעוד

### Required Headers

#### **Authorization Header (לבקשות מאומתות):**

```http
Authorization: Bearer <access_token>
```

**תיאור:**
- נדרש לכל endpoint שמצריך authentication
- Format: `Bearer <token>`
- Token הוא JWT access token

**דוגמה:**

```http
GET /api/v1/users/me HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

#### **Content-Type Header:**

```http
Content-Type: application/json
```

**תיאור:**
- נדרש לכל POST/PUT requests עם body
- Format: `application/json`

---

### Security Headers Usage

#### **CORS Configuration:**

**Development:**
```python
allowed_origins = [
    "http://localhost:8080",  # Frontend
    "http://localhost:8082",   # Backend docs
    "http://127.0.0.1:8080",
    "http://127.0.0.1:8082",
]
```

**Production:**
- מוגדר דרך environment variable `ALLOWED_ORIGINS`
- Format: comma-separated list of origins

**CORS Headers (Response):**
```
Access-Control-Allow-Origin: http://localhost:8080
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
Access-Control-Allow-Headers: *
Access-Control-Expose-Headers: *
```

---

#### **Cookie Security:**

**Refresh Token Cookie:**
```
Set-Cookie: refresh_token=<token>; HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth/refresh; Expires=<timestamp>
```

**תיאור:**
- `HttpOnly`: Cookie לא נגיש ל-JavaScript (מניעת XSS)
- `Secure`: Cookie נשלח רק דרך HTTPS
- `SameSite=Strict`: Cookie נשלח רק מאותו site (מניעת CSRF)
- `Path=/api/v1/auth/refresh`: Cookie זמין רק ב-refresh endpoint

---

### Security Best Practices

1. **Token Storage:**
   - Access Token: נשמר ב-memory או secure storage (לא localStorage)
   - Refresh Token: נשלח ב-httpOnly cookie (לא נגיש ל-JavaScript)

2. **Token Transmission:**
   - Access Token: נשלח ב-`Authorization` header
   - Refresh Token: נשלח אוטומטית ב-cookie (לא צריך לשלוח ידנית)

3. **HTTPS Only:**
   - כל התקשורת חייבת להיות דרך HTTPS ב-production
   - `Secure` flag על cookies מונע שליחה דרך HTTP

4. **Token Rotation:**
   - Refresh Token Rotation מופעל אוטומטית
   - כל refresh מחזיר refresh token חדש ומבטל את הישן

---

## סיכום

### נקודות מפתח:

1. **כל שגיאה חייבת לכלול `error_code`** - לא אופציונלי
2. **Authentication Flow:** JWT tokens עם refresh token rotation
3. **Rate Limiting:** IP-based, configurable per endpoint
4. **Security Headers:** CORS, HttpOnly cookies, Secure flags
5. **API Contract:** כל ה-Payloads ב-`snake_case`

---

**Team 20 (Backend Implementation)**  
**Date:** 2026-02-03  
**Status:** 📝 **DRAFT - Pending QA Review**

**Next Steps:**
1. ✅ Review by Team 50 (QA)
2. ✅ Integration with `identity_api_schema.yaml`
3. ✅ Final approval from Team 10
