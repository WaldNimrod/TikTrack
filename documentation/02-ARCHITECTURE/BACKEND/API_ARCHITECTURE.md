# TikTrack API Architecture

**Date:** January 1, 2026
**Version:** 2.0
**Location:** `Backend/routes/api/`

---

## 📋 Overview

TikTrack's backend API provides a comprehensive RESTful interface for trading management operations. The API follows Flask-RESTful patterns with SQLAlchemy ORM integration, implementing full CRUD operations across all business entities.

## 🏗️ Architecture Principles

### RESTful Design

- **Resource-based URLs:** `/api/{resource}/`
- **HTTP Methods:** GET, POST, PUT, DELETE
- **Status Codes:** 200 (success), 201 (created), 400 (client error), 401 (unauthorized), 404 (not found), 500 (server error)

### Authentication & Authorization

- **Bearer Token Authentication:** `Authorization: Bearer {token}`
- **User Context:** All operations scoped to authenticated user
- **Session Management:** Automatic token refresh and validation

### Data Validation

- **Schema Validation:** Request/response validation using custom validators
- **Business Rules:** Server-side business logic enforcement
- **Error Handling:** Structured error responses with detailed messages

## 🔧 Core Components

### Flask Application Structure

```
Backend/
├── app.py                 # Main Flask application
├── routes/api/           # API route definitions
│   ├── base_entity.py    # Base CRUD operations
│   ├── executions.py     # Execution-specific endpoints
│   └── ...
├── models/               # SQLAlchemy models
├── services/             # Business logic services
└── utils/                # Utility functions
```

### Request Flow

1. **Authentication:** Token validation via middleware
2. **Route Matching:** Flask routing to appropriate handler
3. **Validation:** Request data validation
4. **Business Logic:** Service layer processing
5. **Database:** SQLAlchemy ORM operations
6. **Response:** JSON response formatting

## 📊 API Endpoints Overview

### Core Entities

| Entity | Endpoints | Operations |
|--------|-----------|------------|
| Executions | `/api/executions/` | CRUD + trade matching |
| Trades | `/api/trades/` | CRUD + position management |
| Trading Accounts | `/api/trading-accounts/` | CRUD + balance tracking |
| Tickers | `/api/tickers/` | CRUD + external data |
| Notes | `/api/notes/` | CRUD + entity relationships |
| Alerts | `/api/alerts/` | CRUD + condition evaluation |

### System Endpoints

| Category | Base Path | Purpose |
|----------|-----------|---------|
| Business Logic | `/api/business/` | Calculations & validations |
| Constraints | `/api/constraints/` | Dynamic constraint checking |
| Cache | `/api/cache/` | Cache management |
| External Data | `/api/external-data/` | Market data integration |

## 🔒 Security & Authentication

### Token-Based Authentication

```javascript
// Request header format
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...

// Token payload
{
  "user_id": 1,
  "username": "admin",
  "exp": 1640995200,
  "iat": 1640908800
}
```

### Authorization Scopes

- **User Isolation:** All data operations scoped to authenticated user
- **Entity Ownership:** Users can only access their own data
- **Admin Privileges:** Special endpoints for system administration

## 📝 Request/Response Format

### Standard Request Structure

```json
{
  "data": {
    "field1": "value1",
    "field2": "value2"
  },
  "metadata": {
    "version": "1.0",
    "timestamp": "2026-01-01T12:00:00Z"
  }
}
```

### Standard Response Structure

```json
{
  "status": "success",
  "data": {
    // Response data
  },
  "metadata": {
    "version": "1.0",
    "timestamp": "2026-01-01T12:00:00Z",
    "request_id": "abc-123"
  }
}
```

### Error Response Structure

```json
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Field validation failed",
    "details": {
      "field": "price",
      "constraint": "positive_number"
    }
  },
  "metadata": {
    "version": "1.0",
    "timestamp": "2026-01-01T12:00:00Z"
  }
}
```

## 🔄 Rate Limiting & Performance

### Rate Limits

- **Authenticated Requests:** 1000/hour per user
- **Anonymous Requests:** 100/hour per IP
- **Business Logic:** 500/hour per user (expensive operations)

### Caching Strategy

- **Memory Cache:** Short-term data (5 minutes)
- **LocalStorage:** User preferences (session)
- **IndexedDB:** Historical data (persistent)
- **Server Cache:** Shared data (Redis/in-memory)

## 🧪 Testing & Validation

### API Testing Framework

- **Curl Examples:** All endpoints include curl test commands
- **Postman Collection:** Complete API collection available
- **Integration Tests:** Automated test suite for all endpoints

### Validation Rules

- **Input Validation:** All requests validated before processing
- **Business Rules:** Server-side business logic enforcement
- **Data Integrity:** Foreign key and constraint validation

## 📚 Related Documentation

- **[API Reference](../API_REFERENCE.md)** - Complete endpoint documentation
- **[Authentication Guide](../AUTHENTICATION_API.md)** - Authentication implementation
- **[Database Architecture](../DATABASE_ARCHITECTURE.md)** - Database schema and models
- **[Business Logic Layer](../BUSINESS_LOGIC_LAYER.md)** - Business rules implementation

---

**Last Updated:** January 1, 2026
**Maintainer:** Team C (Backend/API)
