# TikTrack API Reference

**Date:** January 1, 2026
**Version:** 2.0
**Base URL:** `http://localhost:8080/api/`

---

## 📋 Overview

Complete reference for all TikTrack API endpoints. All endpoints require Bearer token authentication and return JSON responses.

## 🔐 Authentication

All API requests must include:

```
Authorization: Bearer {your_token_here}
```

### Get Authentication Token

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

## 📊 Core Entities API

### Executions

#### GET /api/executions/

Get all executions for authenticated user.

**Response:**

```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "ticker_id": 1,
      "trading_account_id": 1,
      "action": "buy",
      "date": "2026-01-01T10:00:00Z",
      "quantity": 100,
      "price": 150.50,
      "created_at": "2026-01-01T09:00:00Z"
    }
  ]
}
```

**Curl Example:**

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8080/api/executions/
```

#### POST /api/executions/

Create new execution.

**Request:**

```json
{
  "ticker_id": 1,
  "trading_account_id": 1,
  "action": "buy",
  "date": "2026-01-01T10:00:00Z",
  "quantity": 100,
  "price": 150.50
}
```

**Curl Example:**

```bash
curl -X POST http://localhost:8080/api/executions/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ticker_id": 1, "trading_account_id": 1, "action": "buy", "date": "2026-01-01T10:00:00Z", "quantity": 100, "price": 150.50}'
```

### Trades

#### GET /api/trades/

Get all trades for authenticated user.

**Curl Example:**

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8080/api/trades/
```

#### POST /api/trades/

Create new trade.

**Request:**

```json
{
  "ticker_id": 1,
  "trading_account_id": 1,
  "side": "long",
  "quantity": 100,
  "entry_price": 150.50,
  "stop_loss": 140.00,
  "take_profit": 170.00
}
```

### Trading Accounts

#### GET /api/trading-accounts/

Get all trading accounts for authenticated user.

**Curl Example:**

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8080/api/trading-accounts/
```

#### POST /api/trading-accounts/

Create new trading account.

**Request:**

```json
{
  "name": "My Trading Account",
  "currency_id": 1,
  "opening_balance": 10000.00
}
```

### Tickers

#### GET /api/tickers/

Get all tickers available to user.

**Curl Example:**

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8080/api/tickers/
```

#### GET /api/tickers/my

Get user's personal tickers.

**Curl Example:**

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8080/api/tickers/my
```

### Notes

#### GET /api/notes/

Get all notes for authenticated user.

**Curl Example:**

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8080/api/notes/
```

#### POST /api/notes/

Create new note.

**Request:**

```json
{
  "title": "Trade Analysis",
  "content": "Analysis of recent trades...",
  "related_id": 1,
  "related_type": "trade"
}
```

### Alerts

#### GET /api/alerts/

Get all alerts for authenticated user.

**Curl Example:**

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8080/api/alerts/
```

#### POST /api/alerts/

Create new alert.

**Request:**

```json
{
  "name": "Price Alert",
  "condition_type": "price_above",
  "condition_value": 160.00,
  "ticker_id": 1,
  "is_active": true
}
```

## 🔧 System APIs

### Business Logic

#### POST /api/business/trade/calculate-pl

Calculate P&L for trade parameters.

**Request:**

```json
{
  "entry_price": 150.00,
  "exit_price": 160.00,
  "quantity": 100,
  "side": "long"
}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "gross_pl": 1000.00,
    "net_pl": 995.00,
    "fees": 5.00
  }
}
```

### Constraints

#### GET /api/constraints/

Get all database constraints.

**Curl Example:**

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8080/api/constraints/
```

#### POST /api/constraints/validate

Validate data against constraints.

**Request:**

```json
{
  "table": "executions",
  "column": "price",
  "value": 150.50
}
```

### Cache Management

#### POST /api/cache/clear

Clear application cache.

**Request:**

```json
{
  "level": "light"
}
```

**Levels:** `light`, `medium`, `full`, `nuclear`

### External Data

#### GET /api/external-data/refresh/full

Refresh all external market data.

**Curl Example:**

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8080/api/external-data/refresh/full
```

## 📋 Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Authentication required |
| 404 | Not Found | Resource not found |
| 500 | Server Error | Internal server error |

## 🧪 Testing Examples

### Complete Workflow Test

```bash
# 1. Login and get token
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}' | jq -r '.data.token')

# 2. Create trading account
curl -X POST http://localhost:8080/api/trading-accounts/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Account", "currency_id": 1, "opening_balance": 10000.00}'

# 3. Get created account ID
ACCOUNT_ID=$(curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/trading-accounts/ | jq -r '.data[0].id')

# 4. Create execution
curl -X POST http://localhost:8080/api/executions/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"ticker_id\": 1, \"trading_account_id\": $ACCOUNT_ID, \"action\": \"buy\", \"date\": \"2026-01-01T10:00:00Z\", \"quantity\": 100, \"price\": 150.50}"
```

## 📚 Related Documentation

- **[API Architecture](../API_ARCHITECTURE.md)** - Architecture overview
- **[Authentication Guide](../AUTHENTICATION_API.md)** - Authentication details
- **[Database Constraints](../DB_CONSTRAINTS_IMPLEMENTATION.md)** - Data validation rules
- **[Business Logic](../BUSINESS_LOGIC_LAYER.md)** - Business rules

---

**Last Updated:** January 1, 2026
**Total Endpoints:** 50+
**Tested:** All examples verified functional
