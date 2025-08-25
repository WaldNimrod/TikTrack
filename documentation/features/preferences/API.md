# Preferences API Documentation

## Overview

This document describes the REST API endpoints for managing user preferences in the TikTrack application. The preferences system allows users to customize their trading interface, default values, and system settings.

## Base Information

- **Base URL**: `http://localhost:8080/api/v1`
- **Content-Type**: `application/json`
- **Authentication**: Not required (session-based)
- **Rate Limiting**: Not implemented

## Recent Updates (Version 2.4.0)

### API Endpoint Changes
- **Updated base URL**: Changed from `/api/preferences` to `/api/v1/preferences`
- **Enhanced preferences structure**: Added `defaultCommission` and `consoleCleanupInterval` fields
- **Improved error handling**: Better handling of missing preference fields

### New Preference Fields
```json
{
  "defaults": {
    "defaultCommission": 0.0,
    "consoleCleanupInterval": 300
  },
  "user": {
    "defaultCommission": 0.0,
    "consoleCleanupInterval": 300
  }
}
```

## API Endpoints

### 1. Get All Preferences

Retrieves all user preferences including defaults and user-specific settings.

**Endpoint**: `GET /api/preferences`

**Request**:
```http
GET /api/preferences HTTP/1.1
Host: localhost:8080
Accept: application/json
```

**Response**:
```json
{
  "defaults": {
    "primaryCurrency": "USD",
    "timezone": "Asia/Jerusalem",
    "defaultStopLoss": 5,
    "defaultTargetPrice": 10,
    "defaultStatusFilter": "all",
    "defaultTypeFilter": "all",
    "defaultAccountFilter": "all",
    "defaultDateRangeFilter": "all",
    "defaultSearchFilter": ""
  },
  "user": {
    "primaryCurrency": "USD",
    "timezone": "Asia/Jerusalem",
    "defaultStopLoss": 7,
    "defaultTargetPrice": 12,
    "defaultStatusFilter": "active",
    "defaultTypeFilter": "all",
    "defaultAccountFilter": "all",
    "defaultDateRangeFilter": "last30days",
    "defaultSearchFilter": ""
  }
}
```

**Status Codes**:
- `200 OK`: Preferences retrieved successfully
- `500 Internal Server Error`: Server error occurred

### 2. Save All Preferences

Saves all user preferences to the server. This endpoint updates the entire user preferences object.

**Endpoint**: `POST /api/preferences`

**Request**:
```http
POST /api/preferences HTTP/1.1
Host: localhost:8080
Content-Type: application/json

{
  "defaults": {
    "primaryCurrency": "USD",
    "timezone": "Asia/Jerusalem",
    "defaultStopLoss": 5,
    "defaultTargetPrice": 10,
    "defaultStatusFilter": "all",
    "defaultTypeFilter": "all",
    "defaultAccountFilter": "all",
    "defaultDateRangeFilter": "all",
    "defaultSearchFilter": ""
  },
  "user": {
    "primaryCurrency": "USD",
    "timezone": "Asia/Jerusalem",
    "defaultStopLoss": 7,
    "defaultTargetPrice": 12,
    "defaultStatusFilter": "active",
    "defaultTypeFilter": "all",
    "defaultAccountFilter": "all",
    "defaultDateRangeFilter": "last30days",
    "defaultSearchFilter": ""
  }
}
```

**Response**:
```json
{
  "message": "Preferences saved successfully",
  "status": "success"
}
```

**Status Codes**:
- `200 OK`: Preferences saved successfully
- `400 Bad Request`: Invalid request data
- `500 Internal Server Error`: Server error occurred

### 3. Update Individual Preference

Updates a specific preference key with a new value.

**Endpoint**: `PUT /api/preferences/{key}`

**Parameters**:
- `key` (path parameter): The preference key to update

**Request**:
```http
PUT /api/preferences/defaultStopLoss HTTP/1.1
Host: localhost:8080
Content-Type: application/json

{
  "value": 8
}
```

**Response**:
```json
{
  "message": "Preference updated successfully",
  "status": "success",
  "key": "defaultStopLoss",
  "value": 8
}
```

**Status Codes**:
- `200 OK`: Preference updated successfully
- `400 Bad Request`: Invalid request data or key
- `404 Not Found`: Preference key not found
- `500 Internal Server Error`: Server error occurred

## Data Models

### Preferences Object

The main preferences object contains two sub-objects:

```typescript
interface PreferencesResponse {
  defaults: PreferenceSettings;
  user: PreferenceSettings;
}

interface PreferenceSettings {
  // System Settings
  primaryCurrency: string;        // "USD" only (restricted)
  timezone: string;               // e.g., "Asia/Jerusalem"
  
  // Personal Settings  
  defaultStopLoss: number;        // Percentage (0-100)
  defaultTargetPrice: number;     // Percentage (0-1000)
  
  // Display Settings - Filter Defaults
  defaultStatusFilter: string;    // "all" | "active" | "closed" | "cancelled"
  defaultTypeFilter: string;      // "all" | "buy" | "sell"
  defaultAccountFilter: string;   // "all" | specific account ID
  defaultDateRangeFilter: string; // "all" | "today" | "last7days" | "last30days" | "custom"
  defaultSearchFilter: string;    // Free text search default
}
```

### Individual Update Request

```typescript
interface UpdatePreferenceRequest {
  value: string | number | boolean;
}
```

### API Response Format

```typescript
interface ApiResponse {
  message: string;
  status: "success" | "error";
  key?: string;        // For individual updates
  value?: any;         // For individual updates
  error?: string;      // For error responses
}
```

## Preference Keys Reference

### System Settings
| Key | Type | Description | Restrictions |
|-----|------|-------------|--------------|
| `primaryCurrency` | string | Primary trading currency | Must be "USD" |
| `timezone` | string | System timezone | Valid timezone string |

### Personal Settings
| Key | Type | Description | Validation |
|-----|------|-------------|------------|
| `defaultStopLoss` | number | Default stop loss percentage | 0-100 |
| `defaultTargetPrice` | number | Default target price percentage | 0-1000 |

### Display Settings
| Key | Type | Description | Valid Values |
|-----|------|-------------|--------------|
| `defaultStatusFilter` | string | Default status filter | "all", "active", "closed", "cancelled" |
| `defaultTypeFilter` | string | Default type filter | "all", "buy", "sell" |
| `defaultAccountFilter` | string | Default account filter | "all" or account ID |
| `defaultDateRangeFilter` | string | Default date range | "all", "today", "last7days", "last30days", "custom" |
| `defaultSearchFilter` | string | Default search text | Any string |

## Business Rules

### Currency Restrictions
- Primary currency is locked to "USD" only
- Any attempt to change to other currencies will be rejected
- Frontend prevents selection of non-USD currencies
- Backend validates and rejects non-USD values

### Validation Rules
- `defaultStopLoss`: Must be numeric, between 0-100
- `defaultTargetPrice`: Must be numeric, between 0-1000
- `timezone`: Must be a valid timezone identifier
- Filter values: Must match predefined valid values

### Default Values
When no user preferences exist, the system uses these defaults:

```json
{
  "primaryCurrency": "USD",
  "timezone": "Asia/Jerusalem",
  "defaultStopLoss": 5,
  "defaultTargetPrice": 10,
  "defaultStatusFilter": "all",
  "defaultTypeFilter": "all",
  "defaultAccountFilter": "all",
  "defaultDateRangeFilter": "all",
  "defaultSearchFilter": ""
}
```

## Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "message": "Invalid request data",
  "status": "error",
  "error": "Missing required field: value"
}
```

#### 404 Not Found
```json
{
  "message": "Preference key not found",
  "status": "error",
  "error": "Key 'invalidKey' does not exist"
}
```

#### 500 Internal Server Error
```json
{
  "message": "Internal server error",
  "status": "error",
  "error": "Database connection failed"
}
```

### Validation Errors

#### Currency Restriction
```json
{
  "message": "Invalid currency selection",
  "status": "error",
  "error": "Primary currency must be USD"
}
```

#### Numeric Range Validation
```json
{
  "message": "Invalid value range",
  "status": "error",
  "error": "defaultStopLoss must be between 0 and 100"
}
```

## Usage Examples

### JavaScript Client Examples

#### Load All Preferences
```javascript
async function loadPreferences() {
  try {
    const response = await fetch('/api/preferences');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const preferences = await response.json();
    console.log('Preferences loaded:', preferences);
    return preferences;
  } catch (error) {
    console.error('Error loading preferences:', error);
    throw error;
  }
}
```

#### Save All Preferences
```javascript
async function savePreferences(preferencesData) {
  try {
    const response = await fetch('/api/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(preferencesData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Preferences saved:', result);
    return result;
  } catch (error) {
    console.error('Error saving preferences:', error);
    throw error;
  }
}
```

#### Update Individual Preference
```javascript
async function updatePreference(key, value) {
  try {
    const response = await fetch(`/api/preferences/${key}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ value: value })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log(`Preference ${key} updated:`, result);
    return result;
  } catch (error) {
    console.error(`Error updating preference ${key}:`, error);
    throw error;
  }
}
```

### cURL Examples

#### Get All Preferences
```bash
curl -X GET "http://localhost:8080/api/preferences" \
     -H "Accept: application/json"
```

#### Save All Preferences
```bash
curl -X POST "http://localhost:8080/api/preferences" \
     -H "Content-Type: application/json" \
     -d '{
       "defaults": {
         "primaryCurrency": "USD",
         "timezone": "Asia/Jerusalem",
         "defaultStopLoss": 5,
         "defaultTargetPrice": 10
       },
       "user": {
         "primaryCurrency": "USD",
         "timezone": "Asia/Jerusalem",
         "defaultStopLoss": 7,
         "defaultTargetPrice": 12
       }
     }'
```

#### Update Individual Preference
```bash
curl -X PUT "http://localhost:8080/api/preferences/defaultStopLoss" \
     -H "Content-Type: application/json" \
     -d '{"value": 8}'
```

## Storage Implementation

### File-Based Storage
- Preferences stored in JSON file: `trading-ui/config/preferences.json`
- Automatic backup creation before modifications
- Atomic write operations to prevent corruption

### Data Persistence
- Changes are immediately written to disk
- No caching layer (direct file I/O)
- File permissions ensure data security

### Backup Strategy
- Automatic backup before each update
- Backup files include timestamp
- Recovery process available if needed

## Security Considerations

### Input Validation
- All inputs validated server-side
- Type checking enforced
- Range validation for numeric values
- String sanitization for text inputs

### Access Control
- Session-based access (no authentication required)
- Rate limiting can be implemented if needed
- Input size limits to prevent DoS attacks

### Data Protection
- No sensitive data stored in preferences
- File permissions restrict access
- Audit trail for preference changes

## Performance Considerations

### Optimization Strategies
- Minimal data transfer (only changed values)
- Client-side caching of preferences
- Debounced updates to prevent excessive API calls
- Efficient JSON parsing and serialization

### Scalability
- File-based storage suitable for single-user application
- Can be migrated to database if needed
- API design supports future enhancements

## Testing

### API Testing Examples

#### Unit Tests
```javascript
describe('Preferences API', () => {
  test('GET /api/preferences returns valid structure', async () => {
    const response = await request(app).get('/api/preferences');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('defaults');
    expect(response.body).toHaveProperty('user');
  });

  test('PUT /api/preferences/primaryCurrency rejects non-USD', async () => {
    const response = await request(app)
      .put('/api/preferences/primaryCurrency')
      .send({ value: 'EUR' });
    expect(response.status).toBe(400);
    expect(response.body.status).toBe('error');
  });
});
```

#### Integration Tests
```bash
# Test complete workflow
curl -X GET "http://localhost:8080/api/preferences"
curl -X PUT "http://localhost:8080/api/preferences/defaultStopLoss" -d '{"value": 8}'
curl -X GET "http://localhost:8080/api/preferences"  # Verify change
```

## Changelog

### Version 1.0 (August 2025)
- Initial API implementation
- Full CRUD operations
- Validation and error handling
- File-based storage
- Currency restriction enforcement

---

**Document Version**: 1.0  
**Last Updated**: August 2025  
**Author**: TikTrack Development Team
