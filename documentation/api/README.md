# TikTrack API Documentation

## Overview

> 📋 **For full project details:** See [PROJECT_STATUS_SUMMARY.md](../../PROJECT_STATUS_SUMMARY.md)

## 🆕 **Latest Updates (August 24, 2025)**
- ✅ **ValidationService Integration** - All endpoints now use dynamic validation
- ✅ **Constraint Management API** - Complete CRUD operations for constraints
- ✅ **Real-time Validation** - Data validated against dynamic constraints
- ✅ **Enhanced Error Handling** - Detailed error messages for validation failures
The TikTrack API provides a comprehensive RESTful interface for managing trading operations, accounts, alerts, and system configuration. All endpoints return JSON responses and follow standard HTTP status codes.

## Base URL

**Important:** The frontend uses relative URLs (`/api/...`) that automatically work with any port.

- **Development:** `http://localhost:8080/api` (or relative `/api/...`)
- **Production:** `http://localhost:5001/api` (or relative `/api/...`)

**Frontend Configuration:**
- All frontend code uses relative URLs (`/api/...`) 
- Configuration is centralized in `trading-ui/scripts/api-config.js`
- The `window.API_BASE_URL` variable is available but defaults to empty string (relative URLs)
- No hardcoded URLs are used - all URLs are relative and work with both environments

## Authentication
Currently, the API uses session-based authentication. All requests should include session cookies.

## Response Format
All API responses follow this standard format:
```json
{
    "status": "success|error",
    "message": "Human readable message",
    "data": {...}
}
```

## Core Endpoints

### Trading Management

#### Get All Trades
```http
GET /trades
```
**Response:**
```json
{
    "status": "success",
    "data": [
        {
            "id": 1,
            "account_id": 1,
            "ticker": "AAPL",
            "investment_type": "swing",
            "status": "open",
            "entry_price": 150.00,
            "current_price": 155.00,
            "quantity": 100,
            "entry_date": "2025-08-23T10:00:00Z"
        }
    ]
}
```

#### Create Trade
```http
POST /trades
```
**Request Body:**
```json
{
    "account_id": 1,
    "ticker": "AAPL",
    "investment_type": "swing",
    "entry_price": 150.00,
    "quantity": 100,
    "entry_date": "2025-08-23T10:00:00Z"
}
```

### Account Management

#### Get All Accounts
```http
GET /accounts
```
**Response:**
```json
{
    "status": "success",
    "data": [
        {
            "id": 1,
            "name": "Main Account",
            "currency": "USD",
            "balance": 10000.00,
            "status": "active"
        }
    ]
}
```

### Alert System

#### Get All Alerts
```http
GET /alerts
```
**Response:**
```json
{
    "status": "success",
    "data": [
        {
            "id": 1,
            "ticker": "AAPL",
            "price": 160.00,
            "condition": "above",
            "status": "active",
            "created_at": "2025-08-23T10:00:00Z"
        }
    ]
}
```

## Dynamic Constraint Management System

### Constraint Management

#### Get All Constraints
```http
GET /constraints
```
**Response:**
```json
{
    "status": "success",
    "data": [
        {
            "id": 1,
            "table_name": "trades",
            "column_name": "investment_type",
            "constraint_type": "ENUM",
            "constraint_name": "valid_investment_type",
            "is_active": true,
            "enum_values": [
                {"value": "swing", "display_name": "Swing", "sort_order": 1},
{"value": "investment", "display_name": "Investment", "sort_order": 2},
{"value": "passive", "display_name": "Passive", "sort_order": 3}
            ]
        }
    ]
}
```

#### Create Constraint
```http
POST /constraints
```
**Request Body:**
```json
{
    "table_name": "trades",
    "column_name": "investment_type",
    "constraint_type": "ENUM",
    "constraint_name": "valid_investment_type",
    "enum_values": [
        {"value": "swing", "display_name": "Swing", "sort_order": 1},
{"value": "investment", "display_name": "Investment", "sort_order": 2}
    ]
}
```

#### Update Constraint
```http
PUT /constraints/{id}
```
**Request Body:**
```json
{
    "constraint_name": "updated_constraint_name",
    "is_active": false
}
```

#### Delete Constraint
```http
DELETE /constraints/{id}
```

### System Information

#### Get System Health
```http
GET /constraints/health
```
**Response:**
```json
{
    "status": "success",
    "data": {
        "total_constraints": 15,
        "tables_with_constraints": 8,
        "active_constraints": 12,
        "validation_status": "healthy"
    }
}
```

#### Get Available Tables
```http
GET /constraints/tables
```
**Response:**
```json
{
    "status": "success",
    "data": [
        "trades",
        "accounts",
        "alerts",
        "trade_plans",
        "notes"
    ]
}
```

#### Validate All Constraints
```http
GET /constraints/validate
```
**Response:**
```json
{
    "status": "success",
    "data": {
        "total_validations": 15,
        "passed": 14,
        "failed": 1,
        "details": [
            {
                "constraint_id": 1,
                "table_name": "trades",
                "column_name": "investment_type",
                "status": "passed",
                "invalid_records": 0
            }
        ]
    }
}
```

## File Management

### Upload File
```http
POST /uploads
Content-Type: multipart/form-data
```
**Form Data:**
- `file`: File to upload
- `entity_type`: Type of entity (trade, account, etc.)
- `entity_id`: ID of the entity

**Response:**
```json
{
    "status": "success",
    "data": {
        "file_id": "abc123",
        "filename": "document.pdf",
        "file_size": 1024,
        "upload_date": "2025-08-23T10:00:00Z"
    }
}
```

### Get File
```http
GET /uploads/{file_id}
```

## Error Handling

### Standard Error Response
```json
{
    "status": "error",
    "message": "Detailed error message",
    "error_code": "VALIDATION_ERROR"
}
```

### Common Error Codes
- `VALIDATION_ERROR`: Input validation failed
- `NOT_FOUND`: Resource not found
- `CONSTRAINT_VIOLATION`: Database constraint violation
- `PERMISSION_DENIED`: Access denied
- `INTERNAL_ERROR`: Server internal error

## Rate Limiting
- **Standard Endpoints**: 1000 requests per hour
- **File Upload**: 100 requests per hour
- **Constraint Validation**: 100 requests per hour

## Versioning
API versioning is handled through the URL path:
- Current version: `/api/`
- Future versions: `/api/v2/`, `/api/v3/`, etc.

## Testing
Use the provided test endpoints for development:
- `/test_crud` - CRUD operations testing
- `/test_api` - API functionality testing
- `/test_security` - Security testing

## SDK and Libraries
- **Python**: `requests` library
- **JavaScript**: `fetch` API or `axios`
- **cURL**: Command line testing

## Examples

### Python Example
```python
import requests

# Get all trades
response = requests.get('http://localhost:8080/api/trades')
trades = response.json()['data']

# Create new trade
new_trade = {
    "account_id": 1,
    "ticker": "AAPL",
    "investment_type": "swing",
    "entry_price": 150.00,
    "quantity": 100
}
response = requests.post('http://localhost:8080/api/trades', json=new_trade)
```

### JavaScript Example
```javascript
// Get all constraints
fetch('/api/constraints')
    .then(response => response.json())
    .then(data => {
        console.log('Constraints:', data.data);
    });

// Create new constraint
const newConstraint = {
    table_name: 'trades',
    column_name: 'status',
    constraint_type: 'ENUM',
    constraint_name: 'trade_status_enum',
    enum_values: [
        {value: 'open', display_name: 'Open', sort_order: 1},
{value: 'closed', display_name: 'Closed', sort_order: 2}
    ]
};

fetch('/api/constraints', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(newConstraint)
})
.then(response => response.json())
.then(data => console.log('Created:', data));
```

---

**Last Updated**: August 23, 2025  
**API Version**: 1.0.0  
**Author**: TikTrack Development Team
