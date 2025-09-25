# TikTrack API Authentication

## 📋 Overview

This document describes the authentication and authorization mechanisms used in the TikTrack API. Proper authentication is essential for securing API endpoints and protecting user data.

## 🔐 Authentication Methods

### **Session-Based Authentication**
The TikTrack API currently uses session-based authentication:
- **Session Cookies**: Authentication tokens stored in browser cookies
- **Server-Side Sessions**: Session data stored on the server
- **Automatic Expiration**: Sessions expire after inactivity

### **Authentication Flow**
```
1. User Login → 2. Session Creation → 3. Cookie Storage → 4. API Requests
```

## 🚀 API Authentication

### **Login Endpoint**
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "user@example.com",
  "password": "secure_password"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "user@example.com",
    "name": "John Doe"
  }
}
```

### **Logout Endpoint**
```http
POST /api/auth/logout
```

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### **Session Validation**
```http
GET /api/auth/validate
```

**Response:**
```json
{
  "authenticated": true,
  "user": {
    "id": 1,
    "username": "user@example.com"
  }
}
```

## 🔒 Authorization

### **Role-Based Access Control**
The system supports different user roles:
- **Admin**: Full system access
- **User**: Standard user access
- **Read-Only**: Limited read access

### **Permission Levels**
- **Public**: No authentication required
- **Authenticated**: Valid session required
- **Authorized**: Specific permissions required

## 🛡️ Security Measures

### **Password Security**
- **Hashing**: Passwords are hashed using secure hashing algorithms
- **Salt**: Unique salt for each password
- **Strength Requirements**: Minimum password complexity

### **Session Security**
- **Secure Cookies**: HTTPS-only cookie transmission
- **HttpOnly**: JavaScript cannot access session cookies
- **SameSite**: CSRF protection
- **Expiration**: Automatic session timeout

### **Rate Limiting**
- **Request Limits**: Maximum requests per time period
- **IP-Based**: Limits applied per IP address
- **Endpoint-Specific**: Different limits for different endpoints

## 📝 API Usage Examples

### **Authenticated Request**
```javascript
// Include session cookie automatically
fetch('/api/trades', {
  method: 'GET',
  credentials: 'include' // Include cookies
})
.then(response => response.json())
.then(data => console.log(data));
```

### **Python Example**
```python
import requests

# Session maintains cookies
session = requests.Session()

# Login
login_data = {
    'username': 'user@example.com',
    'password': 'password'
}
response = session.post('/api/auth/login', json=login_data)

# Use session for authenticated requests
trades = session.get('/api/trades')
```

## 🚨 Error Handling

### **Authentication Errors**
```json
{
  "error": "authentication_required",
  "message": "Valid session required",
  "code": 401
}
```

### **Authorization Errors**
```json
{
  "error": "insufficient_permissions",
  "message": "Access denied",
  "code": 403
}
```

### **Session Expired**
```json
{
  "error": "session_expired",
  "message": "Session has expired",
  "code": 401
}
```

## 🔧 Configuration

### **Session Configuration**
```python
# Flask session configuration
app.config['SECRET_KEY'] = 'your-secret-key'
app.config['SESSION_COOKIE_SECURE'] = True
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Strict'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=24)
```

### **Rate Limiting Configuration**
```python
# Rate limiting settings
RATE_LIMITS = {
    'default': '100/hour',
    'login': '5/minute',
    'api': '1000/hour'
}
```

## 📊 Security Best Practices

### **Client-Side Security**
- **HTTPS Only**: Always use HTTPS in production
- **Secure Storage**: Don't store sensitive data in localStorage
- **Token Management**: Handle session tokens securely
- **Error Handling**: Don't expose sensitive information in errors

### **Server-Side Security**
- **Input Validation**: Validate all input data
- **SQL Injection Prevention**: Use parameterized queries
- **XSS Prevention**: Sanitize output data
- **CSRF Protection**: Implement CSRF tokens

## 🔗 Related Documentation

- **[API Overview](README.md)** - Complete API reference
- **[Error Handling](ERROR_HANDLING.md)** - API error codes and responses
- **[Rate Limiting](RATE_LIMITING.md)** - API rate limiting and quotas

---

**Last Updated**: August 29, 2025  
**Version**: 2.0  
**Maintainer**: TikTrack Development Team
