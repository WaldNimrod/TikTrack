# 📋 אפיון: חוזה שגיאות אחיד (Contract-First Error Handling) - PDSC
**project_domain:** TIKTRACK

**id:** `TEAM_20_PDSC_ERROR_CONTRACT_SPECIFICATION`  
**owner:** Team 20 (Backend Implementation)  
**status:** 🟡 **SPECIFICATION - IN PROGRESS**  
**last_updated:** 2026-02-06  
**version:** v1.1 (Gaps Completed)

---

**מקור:** הודעת אדריכלית - PDSC (Data Service Core)  
**תאריך:** 2026-02-06  
**סטטוס:** 🟡 **SPECIFICATION PHASE**

---

## 🎯 Executive Summary

**מטרה:** הגדרת חוזה שגיאות אחיד (Contract-First Error Handling) שישמש את כל הקוביות הפיננסיות, כך שה-Frontend לא צריך לדעת מאיזה Endpoint הגיע המידע - הכל עובר דרך Service מאוחד.

**הקשר:** זהו חלק מ-PDSC (Data Service Core) - שיכבת בסיס לקוד משותף לכל העמודים.

---

## 📊 ניתוח המצב הנוכחי

### **1. Error Handling קיים:**

#### **מבנה נוכחי:**
- ✅ `HTTPExceptionWithCode` - Exception class עם `error_code`
- ✅ `ErrorCodes` - Enum של error codes
- ✅ Global exception handlers ב-`main.py`
- ✅ כל ה-endpoints משתמשים ב-`HTTPExceptionWithCode`

#### **בעיות זוהו:**

1. **אי-אחידות בין קוביות:**
   - כל Router מטפל בשגיאות באופן עצמאי
   - אין Service מאוחד שמרכז את הטיפול בשגיאות
   - Frontend צריך לדעת מאיזה endpoint הגיעה השגיאה

2. **Error Codes לא מפורטים מספיק:**
   - חסרים error codes ספציפיים לקוביות פיננסיות
   - אין הבחנה בין סוגי שגיאות פיננסיות

3. **אין Response Schema אחיד:**
   - כל endpoint מחזיר שגיאות בפורמט שונה
   - אין חוזה אחיד ל-error responses

---

## 🎯 מטרות החוזה החדש

### **1. Contract-First Error Handling:**
- ✅ חוזה אחיד לכל ה-error responses
- ✅ Frontend לא צריך לדעת מאיזה endpoint הגיעה השגיאה
- ✅ כל השגיאות עוברות דרך Service מאוחד

### **2. Error Codes מפורטים:**
- ✅ Error codes ספציפיים לכל קוביה פיננסית
- ✅ קוד שגיאה מגדיר את הטיפול ב-Frontend
- ✅ Error codes מובנים וניתנים לחיפוש

### **3. Response Schema אחיד:**
- ✅ כל error response באותו פורמט
- ✅ Metadata נוסף לשגיאות (field, value, suggestions)
- ✅ תמיכה ב-i18n (אם נדרש בעתיד)

---

## 📐 חוזה Error Response אחיד

### **Error Response Schema:**

```json
{
  "success": false,
  "error": {
    "code": "FINANCIAL_TRADING_ACCOUNT_NOT_FOUND",
    "message": "Trading account not found",
    "message_i18n": {
      "he": "חשבון מסחר לא נמצא",
      "en": "Trading account not found"
    },
    "status_code": 404,
    "details": {
      "field": "trading_account_id",
      "value": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
      "suggestions": [
        "Check if the trading account ID is correct",
        "Verify the account belongs to the current user"
      ]
    },
    "timestamp": "2026-02-06T10:30:00Z",
    "request_id": "req_01ARZ3NDEKTSV4RRFFQ69G5FAV"
  }
}
```

### **Success Response Schema:**

```json
{
  "success": true,
  "data": {
    // Response data (varies by endpoint)
  },
  "meta": {
    "timestamp": "2026-02-06T10:30:00Z",
    "request_id": "req_01ARZ3NDEKTSV4RRFFQ69G5FAV"
  }
}
```

---

## 🌐 Fetching (API Calls) - PDSC Core Functionality

### **1. Routes SSOT Integration**

**מקור:** `routes.json` v1.1.2 (SSOT)

#### **טעינת routes.json:**

```python
# api/services/pdsc/routes_loader.py

import json
import os
from pathlib import Path
from typing import Dict, Optional

class RoutesSSOTLoader:
    """Load and manage routes.json (SSOT)."""
    
    def __init__(self):
        self.routes_config: Optional[Dict] = None
        self.routes_file_path = Path("ui/public/routes.json")
    
    def load_routes(self) -> Dict:
        """Load routes.json and verify version."""
        if self.routes_config is None:
            if not self.routes_file_path.exists():
                raise FileNotFoundError(f"routes.json not found at {self.routes_file_path}")
            
            with open(self.routes_file_path, 'r') as f:
                self.routes_config = json.load(f)
            
            # Verify version
            expected_version = "1.1.2"
            if self.routes_config.get("version") != expected_version:
                raise ValueError(
                    f"routes.json version mismatch. Expected {expected_version}, "
                    f"got {self.routes_config.get('version')}"
                )
        
        return self.routes_config
    
    def get_api_base_url(self) -> str:
        """Get API base URL from routes.json."""
        config = self.load_routes()
        api_config = config.get("api", {})
        return api_config.get("base_url", "/api/v1")
    
    def get_backend_port(self) -> int:
        """Get backend port from routes.json."""
        config = self.load_routes()
        return config.get("backend", 8082)
    
    def build_api_url(self, resource_path: str) -> str:
        """
        Build full API URL from resource path.
        
        Args:
            resource_path: Resource path (e.g., "trading_accounts", "cash_flows")
            
        Returns:
            Full API URL (e.g., "http://localhost:8082/api/v1/trading_accounts")
        """
        base_url = self.get_api_base_url()
        backend_port = self.get_backend_port()
        
        # Determine environment (development/production)
        backend_host = os.getenv("BACKEND_HOST", "localhost")
        
        return f"http://{backend_host}:{backend_port}{base_url}/{resource_path}"
```

#### **בניית URLs מ-routes.json:**

```python
# Example usage in PDSC Service

routes_loader = RoutesSSOTLoader()

# Build URL for trading_accounts
trading_accounts_url = routes_loader.build_api_url("trading_accounts")
# Returns: "http://localhost:8082/api/v1/trading_accounts"

# Build URL with ID
trading_account_url = f"{routes_loader.build_api_url('trading_accounts')}/{account_id}"
```

---

### **2. Authorization Headers Management**

```python
# api/services/pdsc/auth_manager.py

from typing import Optional, Dict
import os

class PDSCAuthManager:
    """Manage authorization headers for PDSC API calls."""
    
    def __init__(self):
        self.token: Optional[str] = None
    
    def set_token(self, token: str):
        """Set JWT token for API calls."""
        self.token = token
    
    def get_auth_headers(self) -> Dict[str, str]:
        """
        Get authorization headers for API calls.
        
        Returns:
            Dict with Authorization header
        """
        if not self.token:
            raise ValueError("JWT token not set. Call set_token() first.")
        
        return {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
    
    def clear_token(self):
        """Clear stored token."""
        self.token = None
```

---

### **3. Request/Response Handling**

```python
# api/services/pdsc/fetch_client.py

import httpx
from typing import Optional, Dict, Any, List
from ..services.pdsc.routes_loader import RoutesSSOTLoader
from ..services.pdsc.auth_manager import PDSCAuthManager
from ..schemas.errors import UnifiedResponse

class PDSCFetchClient:
    """HTTP client for PDSC API calls."""
    
    def __init__(self):
        self.routes_loader = RoutesSSOTLoader()
        self.auth_manager = PDSCAuthManager()
        self.client = httpx.AsyncClient(timeout=30.0)
    
    async def fetch(
        self,
        method: str,
        resource_path: str,
        resource_id: Optional[str] = None,
        query_params: Optional[Dict[str, Any]] = None,
        request_body: Optional[Dict[str, Any]] = None,
        token: Optional[str] = None
    ) -> UnifiedResponse:
        """
        Unified fetch method for all API calls.
        
        Args:
            method: HTTP method (GET, POST, PUT, DELETE)
            resource_path: Resource path (e.g., "trading_accounts")
            resource_id: Resource ID (optional, for GET/PUT/DELETE by ID)
            query_params: Query parameters (optional)
            request_body: Request body (optional, for POST/PUT)
            token: JWT token (optional, if not set via auth_manager)
            
        Returns:
            UnifiedResponse (success or error)
        """
        # Set token if provided
        if token:
            self.auth_manager.set_token(token)
        
        # Build URL
        base_url = self.routes_loader.build_api_url(resource_path)
        if resource_id:
            url = f"{base_url}/{resource_id}"
        else:
            url = base_url
        
        # Build query string
        if query_params:
            # Filter out None values
            filtered_params = {k: v for k, v in query_params.items() if v is not None}
            if filtered_params:
                query_string = "&".join([f"{k}={v}" for k, v in filtered_params.items()])
                url = f"{url}?{query_string}"
        
        try:
            # Make request
            response = await self.client.request(
                method=method,
                url=url,
                headers=self.auth_manager.get_auth_headers(),
                json=request_body if request_body else None
            )
            
            # Parse response
            response_data = response.json()
            
            # Check for errors
            if response.status_code >= 400:
                return self._create_error_response(
                    error_code=response_data.get("error_code", "UNKNOWN_ERROR"),
                    message=response_data.get("detail", "An error occurred"),
                    status_code=response.status_code
                )
            
            # Success response
            return UnifiedResponse(
                success=True,
                data=response_data,
                meta={
                    "status_code": response.status_code,
                    "headers": dict(response.headers)
                }
            )
            
        except httpx.HTTPError as e:
            return self._create_error_response(
                error_code="NETWORK_ERROR",
                message=f"Network error: {str(e)}",
                status_code=500
            )
        except Exception as e:
            return self._create_error_response(
                error_code="SERVER_ERROR",
                message=f"Unexpected error: {str(e)}",
                status_code=500
            )
    
    async def get(
        self,
        resource_path: str,
        resource_id: Optional[str] = None,
        query_params: Optional[Dict[str, Any]] = None,
        token: Optional[str] = None
    ) -> UnifiedResponse:
        """GET request."""
        return await self.fetch(
            method="GET",
            resource_path=resource_path,
            resource_id=resource_id,
            query_params=query_params,
            token=token
        )
    
    async def post(
        self,
        resource_path: str,
        request_body: Dict[str, Any],
        token: Optional[str] = None
    ) -> UnifiedResponse:
        """POST request."""
        return await self.fetch(
            method="POST",
            resource_path=resource_path,
            request_body=request_body,
            token=token
        )
    
    async def put(
        self,
        resource_path: str,
        resource_id: str,
        request_body: Dict[str, Any],
        token: Optional[str] = None
    ) -> UnifiedResponse:
        """PUT request."""
        return await self.fetch(
            method="PUT",
            resource_path=resource_path,
            resource_id=resource_id,
            request_body=request_body,
            token=token
        )
    
    async def delete(
        self,
        resource_path: str,
        resource_id: str,
        token: Optional[str] = None
    ) -> UnifiedResponse:
        """DELETE request."""
        return await self.fetch(
            method="DELETE",
            resource_path=resource_path,
            resource_id=resource_id,
            token=token
        )
```

---

### **4. Query Parameters Construction**

```python
# Example: Building query parameters

query_params = {
    "broker": "Interactive Brokers",
    "commission_type": "TIERED",
    "search": "IBKR"
}

# PDSC automatically filters None values and builds query string
# Result: "?broker=Interactive%20Brokers&commission_type=TIERED&search=IBKR"
```

---

### **5. Request Body Serialization**

```python
# Request body is automatically serialized to JSON
# Content-Type: application/json header is set automatically

request_body = {
    "broker": "Interactive Brokers",
    "commission_type": "TIERED",
    "commission_value": "0.0035 $ / Share",
    "minimum": 0.35
}

# Automatically serialized to JSON string
```

---

## 🔄 Hardened Transformers Integration

### **1. שימוש ב-transformers.js v1.2**

**מקור:** `ui/src/cubes/shared/utils/transformers.js` v1.2

#### **תכונות Transformers:**
- ✅ `apiToReact()` - המרת snake_case → camelCase
- ✅ `reactToApi()` - המרת camelCase → snake_case
- ✅ המרת מספרים כפויה לשדות פיננסיים
- ✅ טיפול ב-null/undefined (default value: 0)

#### **שדות פיננסיים (forced number conversion):**
```javascript
const FINANCIAL_FIELDS = [
  'balance', 'price', 'amount', 'total', 'value', 
  'quantity', 'cost', 'fee', 'commission', 
  'profit', 'loss', 'equity', 'margin'
];
```

---

### **2. המרת Request (camelCase → snake_case)**

```python
# api/services/pdsc/transformers.py

# Note: This is a Python implementation of transformers.js logic
# For actual frontend usage, use transformers.js directly

def react_to_api(react_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Convert React state (camelCase) to API request (snake_case).
    
    Equivalent to transformers.js reactToApi()
    
    Args:
        react_data: React state with camelCase keys
        
    Returns:
        API request object with snake_case keys
    """
    def transform(obj, parent_key=''):
        if isinstance(obj, list):
            return [transform(item, parent_key) for item in obj]
        if isinstance(obj, dict):
            result = {}
            for key, value in obj.items():
                # Convert camelCase to snake_case
                snake_key = ''.join(['_' + c.lower() if c.isupper() else c 
                                    for c in key]).lstrip('_')
                # Recursively transform value
                result[snake_key] = transform(value, key)
            return result
        # Convert financial fields to numbers
        return convert_financial_field(obj, parent_key)
    
    return transform(react_data)

def convert_financial_field(value: Any, key: str) -> Any:
    """
    Convert value to number for financial fields.
    
    Equivalent to transformers.js convertFinancialField()
    """
    financial_fields = [
        'balance', 'price', 'amount', 'total', 'value',
        'quantity', 'cost', 'fee', 'commission',
        'profit', 'loss', 'equity', 'margin'
    ]
    
    is_financial = any(field in key.lower() for field in financial_fields)
    
    if not is_financial:
        return value
    
    if value is None:
        return 0
    
    try:
        num_value = float(value)
        return num_value if not (num_value != num_value) else 0  # Check for NaN
    except (ValueError, TypeError):
        return 0
```

---

### **3. המרת Response (snake_case → camelCase)**

```python
def api_to_react(api_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Convert API response (snake_case) to React state (camelCase).
    
    Equivalent to transformers.js apiToReact()
    
    Args:
        api_data: API response with snake_case keys
        
    Returns:
        React state object with camelCase keys
    """
    def transform(obj, parent_key=''):
        if isinstance(obj, list):
            return [transform(item, parent_key) for item in obj]
        if isinstance(obj, dict):
            result = {}
            for key, value in obj.items():
                # Convert snake_case to camelCase
                camel_key = ''.join(word.capitalize() if i > 0 else word 
                                   for i, word in enumerate(key.split('_')))
                camel_key = camel_key[0].lower() + camel_key[1:] if camel_key else camel_key
                # Recursively transform value
                result[camel_key] = transform(value, camel_key)
            return result
        # Convert financial fields to numbers
        return convert_financial_field(obj, parent_key)
    
    return transform(api_data)
```

---

### **4. אינטגרציה ב-PDSC Service**

```python
# api/services/pdsc/financial.py (updated)

from ..services.pdsc.transformers import react_to_api, api_to_react

class PDSCFinancialService(PDSCBaseService):
    """PDSC Service for Financial Cube operations."""
    
    def __init__(self):
        super().__init__()
        self.fetch_client = PDSCFetchClient()
    
    async def get_financial_data(
        self,
        resource_type: str,
        query_params: Optional[Dict[str, Any]] = None,  # camelCase from frontend
        token: str
    ) -> UnifiedResponse:
        """
        Unified method to get financial data.
        
        Args:
            resource_type: "trading_accounts", "cash_flows", "brokers_fees", "positions"
            query_params: Query parameters in camelCase (from frontend)
            token: JWT token
            
        Returns:
            UnifiedResponse with data in camelCase (for frontend)
        """
        # Convert camelCase query params to snake_case for API
        api_query_params = react_to_api(query_params) if query_params else None
        
        # Make API call
        response = await self.fetch_client.get(
            resource_path=resource_type,
            query_params=api_query_params,
            token=token
        )
        
        # If error, return as-is
        if not response.success:
            return response
        
        # Convert response data from snake_case to camelCase
        if response.data:
            response.data = api_to_react(response.data)
        
        return response
    
    async def create_financial_data(
        self,
        resource_type: str,
        request_data: Dict[str, Any],  # camelCase from frontend
        token: str
    ) -> UnifiedResponse:
        """
        Unified method to create financial data.
        
        Args:
            resource_type: "trading_accounts", "cash_flows", "brokers_fees", "positions"
            request_data: Request data in camelCase (from frontend)
            token: JWT token
            
        Returns:
            UnifiedResponse with data in camelCase (for frontend)
        """
        # Convert camelCase request data to snake_case for API
        api_request_body = react_to_api(request_data)
        
        # Make API call
        response = await self.fetch_client.post(
            resource_path=resource_type,
            request_body=api_request_body,
            token=token
        )
        
        # If error, return as-is
        if not response.success:
            return response
        
        # Convert response data from snake_case to camelCase
        if response.data:
            response.data = api_to_react(response.data)
        
        return response
```

---

### **5. טיפול בשגיאות המרה**

```python
# api/services/pdsc/transformers.py (error handling)

class TransformationError(Exception):
    """Error during data transformation."""
    pass

def react_to_api_safe(react_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Safe version of react_to_api with error handling.
    
    Raises:
        TransformationError: If transformation fails
    """
    try:
        return react_to_api(react_data)
    except Exception as e:
        raise TransformationError(f"Failed to transform React data to API format: {str(e)}")

def api_to_react_safe(api_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Safe version of api_to_react with error handling.
    
    Raises:
        TransformationError: If transformation fails
    """
    try:
        return api_to_react(api_data)
    except Exception as e:
        raise TransformationError(f"Failed to transform API data to React format: {str(e)}")
```

---

### **6. דוגמאות שימוש**

#### **דוגמה 1: GET Request עם Query Parameters**

```python
# Frontend calls PDSC Service
response = await pdsc_service.get_financial_data(
    resource_type="trading_accounts",
    query_params={
        "status": True,  # camelCase
        "search": "IBKR"  # camelCase
    },
    token="jwt_token_here"
)

# PDSC Service:
# 1. Converts query_params to snake_case: {"status": True, "search": "IBKR"}
# 2. Builds URL from routes.json: "http://localhost:8082/api/v1/trading_accounts?status=true&search=IBKR"
# 3. Makes API call with Authorization header
# 4. Converts response from snake_case to camelCase
# 5. Returns UnifiedResponse
```

#### **דוגמה 2: POST Request עם Request Body**

```python
# Frontend calls PDSC Service
response = await pdsc_service.create_financial_data(
    resource_type="brokers_fees",
    request_data={
        "broker": "Interactive Brokers",  # camelCase
        "commissionType": "TIERED",  # camelCase
        "commissionValue": "0.0035 $ / Share",  # camelCase
        "minimum": 0.35  # camelCase
    },
    token="jwt_token_here"
)

# PDSC Service:
# 1. Converts request_data to snake_case: {"broker": "...", "commission_type": "...", ...}
# 2. Converts financial fields to numbers: {"minimum": 0.35}
# 3. Builds URL from routes.json: "http://localhost:8082/api/v1/brokers_fees"
# 4. Makes POST request with JSON body
# 5. Converts response from snake_case to camelCase
# 6. Returns UnifiedResponse
```

---

### **1. Routes SSOT Integration**

**מקור:** `routes.json` v1.1.2 (SSOT)

#### **טעינת routes.json:**

```python
# api/services/pdsc/routes_loader.py

import json
import os
from pathlib import Path
from typing import Dict, Optional
import logging

logger = logging.getLogger(__name__)

class RoutesSSOTLoader:
    """Load and manage routes.json (SSOT)."""
    
    def __init__(self):
        self.routes_config: Optional[Dict] = None
        self.routes_file_path = Path("ui/public/routes.json")
        self._cache_ttl = 300  # Cache TTL in seconds
        self._last_load_time: Optional[float] = None
    
    def load_routes(self, force_reload: bool = False) -> Dict:
        """
        Load routes.json and verify version.
        
        Args:
            force_reload: Force reload even if cached
            
        Returns:
            Routes configuration dict
            
        Raises:
            FileNotFoundError: If routes.json not found
            ValueError: If version mismatch
        """
        import time
        
        # Check cache
        if not force_reload and self.routes_config:
            if self._last_load_time:
                elapsed = time.time() - self._last_load_time
                if elapsed < self._cache_ttl:
                    return self.routes_config
        
        # Load from file
        if not self.routes_file_path.exists():
            raise FileNotFoundError(f"routes.json not found at {self.routes_file_path}")
        
        with open(self.routes_file_path, 'r') as f:
            self.routes_config = json.load(f)
        
        # Verify version
        expected_version = "1.1.2"
        actual_version = self.routes_config.get("version")
        if actual_version != expected_version:
            raise ValueError(
                f"routes.json version mismatch. Expected {expected_version}, "
                f"got {actual_version}. Please update routes.json to version {expected_version}."
            )
        
        self._last_load_time = time.time()
        logger.info(f"routes.json v{actual_version} loaded successfully")
        return self.routes_config
    
    def get_api_base_url(self) -> str:
        """Get API base URL from routes.json."""
        config = self.load_routes()
        api_config = config.get("api", {})
        return api_config.get("base_url", "/api/v1")
    
    def get_backend_port(self) -> int:
        """Get backend port from routes.json."""
        config = self.load_routes()
        return config.get("backend", 8082)
    
    def build_api_url(
        self,
        resource_path: str,
        resource_id: Optional[str] = None
    ) -> str:
        """
        Build full API URL from resource path.
        
        Args:
            resource_path: Resource path (e.g., "trading_accounts", "cash_flows")
            resource_id: Resource ID (optional, for GET/PUT/DELETE by ID)
            
        Returns:
            Full API URL (e.g., "http://localhost:8082/api/v1/trading_accounts")
        """
        base_url = self.get_api_base_url()
        backend_port = self.get_backend_port()
        backend_host = os.getenv("BACKEND_HOST", "localhost")
        
        url = f"http://{backend_host}:{backend_port}{base_url}/{resource_path}"
        
        if resource_id:
            url = f"{url}/{resource_id}"
        
        return url
    
    def get_resource_path(self, cube: str, resource: str) -> Optional[str]:
        """
        Get resource path from routes.json.
        
        Args:
            cube: Cube name (e.g., "financial", "planning")
            resource: Resource name (e.g., "trading_accounts", "cash_flows")
            
        Returns:
            Resource path or None if not found
        """
        config = self.load_routes()
        routes = config.get("routes", {})
        cube_routes = routes.get(cube, {})
        return cube_routes.get(resource)
```

---

### **2. Authorization Headers Management**

```python
# api/services/pdsc/auth_manager.py

from typing import Optional, Dict
import logging

logger = logging.getLogger(__name__)

class PDSCAuthManager:
    """Manage authorization headers for PDSC API calls."""
    
    def __init__(self):
        self.token: Optional[str] = None
    
    def set_token(self, token: str):
        """Set JWT token for API calls."""
        if not token:
            raise ValueError("Token cannot be empty")
        self.token = token
        logger.debug("JWT token set for PDSC API calls")
    
    def get_auth_headers(self) -> Dict[str, str]:
        """
        Get authorization headers for API calls.
        
        Returns:
            Dict with Authorization and Content-Type headers
            
        Raises:
            ValueError: If token not set
        """
        if not self.token:
            raise ValueError("JWT token not set. Call set_token() first.")
        
        return {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    
    def clear_token(self):
        """Clear stored token."""
        self.token = None
        logger.debug("JWT token cleared")
```

---

### **3. Request/Response Handling**

```python
# api/services/pdsc/fetch_client.py

import httpx
from typing import Optional, Dict, Any
from ..services.pdsc.routes_loader import RoutesSSOTLoader
from ..services.pdsc.auth_manager import PDSCAuthManager
from ..schemas.errors import UnifiedResponse
import logging

logger = logging.getLogger(__name__)

class PDSCFetchClient:
    """HTTP client for PDSC API calls."""
    
    def __init__(self):
        self.routes_loader = RoutesSSOTLoader()
        self.auth_manager = PDSCAuthManager()
        self.client = httpx.AsyncClient(timeout=30.0)
    
    async def fetch(
        self,
        method: str,
        resource_path: str,
        resource_id: Optional[str] = None,
        query_params: Optional[Dict[str, Any]] = None,
        request_body: Optional[Dict[str, Any]] = None,
        token: Optional[str] = None
    ) -> UnifiedResponse:
        """
        Unified fetch method for all API calls.
        
        Args:
            method: HTTP method (GET, POST, PUT, DELETE)
            resource_path: Resource path (e.g., "trading_accounts")
            resource_id: Resource ID (optional, for GET/PUT/DELETE by ID)
            query_params: Query parameters (optional, in snake_case)
            request_body: Request body (optional, in snake_case, for POST/PUT)
            token: JWT token (optional, if not set via auth_manager)
            
        Returns:
            UnifiedResponse (success or error)
        """
        # Set token if provided
        if token:
            self.auth_manager.set_token(token)
        
        # Build URL
        url = self.routes_loader.build_api_url(resource_path, resource_id)
        
        # Build query string
        if query_params:
            # Filter out None values
            filtered_params = {k: v for k, v in query_params.items() if v is not None}
            if filtered_params:
                # URL encode query parameters
                from urllib.parse import urlencode
                query_string = urlencode(filtered_params)
                url = f"{url}?{query_string}"
        
        logger.debug(f"PDSC Fetch: {method} {url}")
        
        try:
            # Make request
            response = await self.client.request(
                method=method,
                url=url,
                headers=self.auth_manager.get_auth_headers(),
                json=request_body if request_body else None
            )
            
            # Parse response
            response_data = response.json()
            
            # Check for errors
            if response.status_code >= 400:
                error_code = response_data.get("error_code", "UNKNOWN_ERROR")
                error_detail = response_data.get("detail", "An error occurred")
                
                logger.warning(f"PDSC Fetch Error: {error_code} - {error_detail}")
                
                return UnifiedResponse(
                    success=False,
                    error={
                        "code": error_code,
                        "message": error_detail,
                        "status_code": response.status_code,
                        "timestamp": datetime.utcnow(),
                        "request_id": response.headers.get("X-Request-ID")
                    }
                )
            
            # Success response
            logger.debug(f"PDSC Fetch Success: {method} {url} - {response.status_code}")
            
            return UnifiedResponse(
                success=True,
                data=response_data,
                meta={
                    "status_code": response.status_code,
                    "headers": dict(response.headers)
                }
            )
            
        except httpx.HTTPError as e:
            logger.error(f"PDSC Fetch HTTP Error: {str(e)}")
            return UnifiedResponse(
                success=False,
                error={
                    "code": "NETWORK_ERROR",
                    "message": f"Network error: {str(e)}",
                    "status_code": 500,
                    "timestamp": datetime.utcnow()
                }
            )
        except Exception as e:
            logger.error(f"PDSC Fetch Unexpected Error: {str(e)}", exc_info=True)
            return UnifiedResponse(
                success=False,
                error={
                    "code": "SERVER_ERROR",
                    "message": f"Unexpected error: {str(e)}",
                    "status_code": 500,
                    "timestamp": datetime.utcnow()
                }
            )
    
    async def get(
        self,
        resource_path: str,
        resource_id: Optional[str] = None,
        query_params: Optional[Dict[str, Any]] = None,
        token: Optional[str] = None
    ) -> UnifiedResponse:
        """GET request."""
        return await self.fetch(
            method="GET",
            resource_path=resource_path,
            resource_id=resource_id,
            query_params=query_params,
            token=token
        )
    
    async def post(
        self,
        resource_path: str,
        request_body: Dict[str, Any],
        token: Optional[str] = None
    ) -> UnifiedResponse:
        """POST request."""
        return await self.fetch(
            method="POST",
            resource_path=resource_path,
            request_body=request_body,
            token=token
        )
    
    async def put(
        self,
        resource_path: str,
        resource_id: str,
        request_body: Dict[str, Any],
        token: Optional[str] = None
    ) -> UnifiedResponse:
        """PUT request."""
        return await self.fetch(
            method="PUT",
            resource_path=resource_path,
            resource_id=resource_id,
            request_body=request_body,
            token=token
        )
    
    async def delete(
        self,
        resource_path: str,
        resource_id: str,
        token: Optional[str] = None
    ) -> UnifiedResponse:
        """DELETE request."""
        return await self.fetch(
            method="DELETE",
            resource_path=resource_path,
            resource_id=resource_id,
            token=token
        )
```

---

### **4. Query Parameters Construction**

```python
# Example: Building query parameters

# Input from frontend (camelCase):
query_params_frontend = {
    "broker": "Interactive Brokers",
    "commissionType": "TIERED",  # camelCase
    "search": "IBKR"
}

# After react_to_api transformation (snake_case):
query_params_api = {
    "broker": "Interactive Brokers",
    "commission_type": "TIERED",  # snake_case
    "search": "IBKR"
}

# PDSC automatically:
# 1. Filters None values
# 2. URL encodes values
# 3. Builds query string: "?broker=Interactive%20Brokers&commission_type=TIERED&search=IBKR"
```

---

### **5. Request Body Serialization**

```python
# Request body is automatically serialized to JSON
# Content-Type: application/json header is set automatically

# Input from frontend (camelCase):
request_body_frontend = {
    "broker": "Interactive Brokers",
    "commissionType": "TIERED",  # camelCase
    "commissionValue": "0.0035 $ / Share",  # camelCase
    "minimum": 0.35
}

# After react_to_api transformation (snake_case):
request_body_api = {
    "broker": "Interactive Brokers",
    "commission_type": "TIERED",  # snake_case
    "commission_value": "0.0035 $ / Share",  # snake_case
    "minimum": 0.35  # Converted to number if needed
}

# Automatically serialized to JSON string by httpx
```

---

## 🔄 Hardened Transformers Integration

### **1. שימוש ב-transformers.js v1.2**

**מקור:** `ui/src/cubes/shared/utils/transformers.js` v1.2

#### **תכונות Transformers:**
- ✅ `apiToReact()` - המרת snake_case → camelCase
- ✅ `reactToApi()` - המרת camelCase → snake_case
- ✅ המרת מספרים כפויה לשדות פיננסיים
- ✅ טיפול ב-null/undefined (default value: 0)

#### **שדות פיננסיים (forced number conversion):**
```javascript
const FINANCIAL_FIELDS = [
  'balance', 'price', 'amount', 'total', 'value', 
  'quantity', 'cost', 'fee', 'commission', 
  'profit', 'loss', 'equity', 'margin'
];
```

---

### **2. Python Implementation של Transformers**

```python
# api/services/pdsc/transformers.py

from typing import Any, Dict, List, Union
import logging

logger = logging.getLogger(__name__)

# Financial fields that require forced number conversion
FINANCIAL_FIELDS = [
    'balance', 'price', 'amount', 'total', 'value',
    'quantity', 'cost', 'fee', 'commission',
    'profit', 'loss', 'equity', 'margin'
]

def convert_financial_field(value: Any, key: str) -> Any:
    """
    Convert value to number for financial fields.
    
    Equivalent to transformers.js convertFinancialField()
    
    Args:
        value: Value to convert
        key: Field key name
        
    Returns:
        Converted number or original value
    """
    # Check if this is a financial field (case-insensitive)
    is_financial = any(field in key.lower() for field in FINANCIAL_FIELDS)
    
    if not is_financial:
        return value
    
    # For financial fields: forced number conversion with default value
    if value is None:
        return 0
    
    try:
        num_value = float(value)
        # Return 0 if conversion failed (NaN)
        return num_value if num_value == num_value else 0
    except (ValueError, TypeError):
        return 0

def react_to_api(react_data: Union[Dict, List]) -> Union[Dict, List]:
    """
    Convert React state (camelCase) to API request (snake_case).
    
    Equivalent to transformers.js reactToApi()
    
    Args:
        react_data: React state with camelCase keys
        
    Returns:
        API request object with snake_case keys
    """
    def transform(obj: Any, parent_key: str = '') -> Any:
        if isinstance(obj, list):
            return [transform(item, parent_key) for item in obj]
        if isinstance(obj, dict):
            result = {}
            for key, value in obj.items():
                # Convert camelCase to snake_case
                snake_key = ''.join(['_' + c.lower() if c.isupper() else c 
                                    for c in key]).lstrip('_')
                # Recursively transform value
                transformed_value = transform(value, key)
                # Apply forced number conversion for financial fields
                result[snake_key] = convert_financial_field(transformed_value, key)
            return result
        # For primitive values, check if parent key indicates financial field
        return convert_financial_field(obj, parent_key)
    
    return transform(react_data)

def api_to_react(api_data: Union[Dict, List]) -> Union[Dict, List]:
    """
    Convert API response (snake_case) to React state (camelCase).
    
    Equivalent to transformers.js apiToReact()
    
    Args:
        api_data: API response with snake_case keys
        
    Returns:
        React state object with camelCase keys
    """
    def transform(obj: Any, parent_key: str = '') -> Any:
        if isinstance(obj, list):
            return [transform(item, parent_key) for item in obj]
        if isinstance(obj, dict):
            result = {}
            for key, value in obj.items():
                # Convert snake_case to camelCase
                parts = key.split('_')
                camel_key = parts[0] + ''.join(word.capitalize() for word in parts[1:])
                # Recursively transform value
                transformed_value = transform(value, camel_key)
                # Apply forced number conversion for financial fields
                result[camel_key] = convert_financial_field(transformed_value, camel_key)
            return result
        # For primitive values, check if parent key indicates financial field
        return convert_financial_field(obj, parent_key)
    
    return transform(api_data)

class TransformationError(Exception):
    """Error during data transformation."""
    pass

def react_to_api_safe(react_data: Union[Dict, List]) -> Union[Dict, List]:
    """
    Safe version of react_to_api with error handling.
    
    Raises:
        TransformationError: If transformation fails
    """
    try:
        return react_to_api(react_data)
    except Exception as e:
        logger.error(f"Failed to transform React data to API format: {str(e)}", exc_info=True)
        raise TransformationError(f"Failed to transform React data to API format: {str(e)}")

def api_to_react_safe(api_data: Union[Dict, List]) -> Union[Dict, List]:
    """
    Safe version of api_to_react with error handling.
    
    Raises:
        TransformationError: If transformation fails
    """
    try:
        return api_to_react(api_data)
    except Exception as e:
        logger.error(f"Failed to transform API data to React format: {str(e)}", exc_info=True)
        raise TransformationError(f"Failed to transform API data to React format: {str(e)}")
```

---

### **3. אינטגרציה ב-PDSC Service**

```python
# api/services/pdsc/financial.py (updated with Transformers)

from typing import Optional, Dict, Any
from ..services.pdsc.base import PDSCBaseService
from ..services.pdsc.fetch_client import PDSCFetchClient
from ..services.pdsc.transformers import react_to_api_safe, api_to_react_safe
from ..schemas.errors import UnifiedResponse
import logging

logger = logging.getLogger(__name__)

class PDSCFinancialService(PDSCBaseService):
    """PDSC Service for Financial Cube operations."""
    
    def __init__(self):
        super().__init__()
        self.fetch_client = PDSCFetchClient()
    
    async def get_financial_data(
        self,
        resource_type: str,
        query_params: Optional[Dict[str, Any]] = None,  # camelCase from frontend
        token: str
    ) -> UnifiedResponse:
        """
        Unified method to get financial data.
        
        Args:
            resource_type: "trading_accounts", "cash_flows", "brokers_fees", "positions"
            query_params: Query parameters in camelCase (from frontend)
            token: JWT token
            
        Returns:
            UnifiedResponse with data in camelCase (for frontend)
        """
        try:
            # Convert camelCase query params to snake_case for API
            api_query_params = None
            if query_params:
                api_query_params = react_to_api_safe(query_params)
            
            # Make API call
            response = await self.fetch_client.get(
                resource_path=resource_type,
                query_params=api_query_params,
                token=token
            )
            
            # If error, return as-is
            if not response.success:
                return response
            
            # Convert response data from snake_case to camelCase
            if response.data:
                try:
                    response.data = api_to_react_safe(response.data)
                except TransformationError as e:
                    logger.error(f"Failed to transform response data: {str(e)}")
                    return self._create_error_response(
                        error_code="TRANSFORMATION_ERROR",
                        message=f"Failed to transform response data: {str(e)}",
                        status_code=500
                    )
            
            return response
            
        except Exception as e:
            logger.error(f"Error in get_financial_data: {str(e)}", exc_info=True)
            return self._handle_exception(e, "Failed to fetch financial data")
    
    async def create_financial_data(
        self,
        resource_type: str,
        request_data: Dict[str, Any],  # camelCase from frontend
        token: str
    ) -> UnifiedResponse:
        """
        Unified method to create financial data.
        
        Args:
            resource_type: "trading_accounts", "cash_flows", "brokers_fees", "positions"
            request_data: Request data in camelCase (from frontend)
            token: JWT token
            
        Returns:
            UnifiedResponse with data in camelCase (for frontend)
        """
        try:
            # Convert camelCase request data to snake_case for API
            api_request_body = react_to_api_safe(request_data)
            
            # Make API call
            response = await self.fetch_client.post(
                resource_path=resource_type,
                request_body=api_request_body,
                token=token
            )
            
            # If error, return as-is
            if not response.success:
                return response
            
            # Convert response data from snake_case to camelCase
            if response.data:
                try:
                    response.data = api_to_react_safe(response.data)
                except TransformationError as e:
                    logger.error(f"Failed to transform response data: {str(e)}")
                    return self._create_error_response(
                        error_code="TRANSFORMATION_ERROR",
                        message=f"Failed to transform response data: {str(e)}",
                        status_code=500
                    )
            
            return response
            
        except TransformationError as e:
            logger.error(f"Transformation error in create_financial_data: {str(e)}")
            return self._create_error_response(
                error_code="TRANSFORMATION_ERROR",
                message=f"Failed to transform request data: {str(e)}",
                status_code=400
            )
        except Exception as e:
            logger.error(f"Error in create_financial_data: {str(e)}", exc_info=True)
            return self._handle_exception(e, "Failed to create financial data")
    
    async def update_financial_data(
        self,
        resource_type: str,
        resource_id: str,
        request_data: Dict[str, Any],  # camelCase from frontend
        token: str
    ) -> UnifiedResponse:
        """Unified method to update financial data."""
        try:
            api_request_body = react_to_api_safe(request_data)
            response = await self.fetch_client.put(
                resource_path=resource_type,
                resource_id=resource_id,
                request_body=api_request_body,
                token=token
            )
            if response.success and response.data:
                response.data = api_to_react_safe(response.data)
            return response
        except Exception as e:
            return self._handle_exception(e, "Failed to update financial data")
    
    async def delete_financial_data(
        self,
        resource_type: str,
        resource_id: str,
        token: str
    ) -> UnifiedResponse:
        """Unified method to delete financial data."""
        try:
            return await self.fetch_client.delete(
                resource_path=resource_type,
                resource_id=resource_id,
                token=token
            )
        except Exception as e:
            return self._handle_exception(e, "Failed to delete financial data")
```

---

### **4. דוגמאות שימוש מלאות**

#### **דוגמה 1: GET Request עם Query Parameters**

```python
# Frontend calls PDSC Service (camelCase)
response = await pdsc_service.get_financial_data(
    resource_type="trading_accounts",
    query_params={
        "status": True,  # camelCase
        "search": "IBKR"  # camelCase
    },
    token="jwt_token_here"
)

# PDSC Service Flow:
# 1. Converts query_params to snake_case: {"status": True, "search": "IBKR"}
# 2. Loads routes.json v1.1.2
# 3. Builds URL: "http://localhost:8082/api/v1/trading_accounts?status=true&search=IBKR"
# 4. Sets Authorization header: "Bearer jwt_token_here"
# 5. Makes GET request
# 6. Converts response from snake_case to camelCase
# 7. Converts financial fields to numbers
# 8. Returns UnifiedResponse

# Frontend receives (camelCase):
# {
#   "success": true,
#   "data": {
#     "items": [
#       {
#         "id": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
#         "accountName": "IBKR Main",  # camelCase
#         "balance": 10000.50,  # number (converted)
#         "isActive": true  # camelCase
#       }
#     ],
#     "total": 1
#   }
# }
```

#### **דוגמה 2: POST Request עם Request Body**

```python
# Frontend calls PDSC Service (camelCase)
response = await pdsc_service.create_financial_data(
    resource_type="brokers_fees",
    request_data={
        "broker": "Interactive Brokers",  # camelCase
        "commissionType": "TIERED",  # camelCase
        "commissionValue": "0.0035 $ / Share",  # camelCase
        "minimum": "0.35"  # string (will be converted to number)
    },
    token="jwt_token_here"
)

# PDSC Service Flow:
# 1. Converts request_data to snake_case: {"broker": "...", "commission_type": "...", ...}
# 2. Converts financial fields to numbers: {"minimum": 0.35}
# 3. Loads routes.json v1.1.2
# 4. Builds URL: "http://localhost:8082/api/v1/brokers_fees"
# 5. Sets Authorization header: "Bearer jwt_token_here"
# 6. Makes POST request with JSON body
# 7. Converts response from snake_case to camelCase
# 8. Returns UnifiedResponse
```

---

## 🏗️ ארכיטקטורה מוצעת (עודכן)

```
┌─────────────────────────────────────────┐
│         Frontend (Team 30)              │
│  (לא צריך לדעת מאיזה endpoint)        │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│    PDSC Service (Unified Interface)     │
│  - getFinancialData()                   │
│  - createFinancialData()                │
│  - updateFinancialData()                │
│  - deleteFinancialData()                │
│  - Error Handling אחיד                 │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│    Financial Cube Services              │
│  - TradingAccountsService                │
│  - CashFlowsService                     │
│  - BrokersFeesService                   │
│  - PositionsService                     │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         Database Layer                  │
└─────────────────────────────────────────┘
```

### **2. Error Handling Flow:**

```
1. Request → PDSC Service
2. PDSC Service → Financial Cube Service
3. Financial Cube Service → Database
4. Error occurs → Financial Cube Service
5. Financial Cube Service → PDSC Service (with error context)
6. PDSC Service → Error Contract Transformation
7. PDSC Service → Frontend (unified error format)
```

---

## 📋 Error Codes - קוביות פיננסיות

### **Financial Cube Error Codes:**

```python
class FinancialErrorCodes:
    """Error codes for Financial Cube operations."""
    
    # Trading Accounts
    TRADING_ACCOUNT_NOT_FOUND = "FINANCIAL_TRADING_ACCOUNT_NOT_FOUND"
    TRADING_ACCOUNT_ALREADY_EXISTS = "FINANCIAL_TRADING_ACCOUNT_ALREADY_EXISTS"
    TRADING_ACCOUNT_INVALID_DATA = "FINANCIAL_TRADING_ACCOUNT_INVALID_DATA"
    TRADING_ACCOUNT_UPDATE_FAILED = "FINANCIAL_TRADING_ACCOUNT_UPDATE_FAILED"
    TRADING_ACCOUNT_DELETE_FAILED = "FINANCIAL_TRADING_ACCOUNT_DELETE_FAILED"
    
    # Cash Flows
    CASH_FLOW_NOT_FOUND = "FINANCIAL_CASH_FLOW_NOT_FOUND"
    CASH_FLOW_INVALID_AMOUNT = "FINANCIAL_CASH_FLOW_INVALID_AMOUNT"
    CASH_FLOW_INVALID_DATE = "FINANCIAL_CASH_FLOW_INVALID_DATE"
    CASH_FLOW_CREATE_FAILED = "FINANCIAL_CASH_FLOW_CREATE_FAILED"
    
    # Brokers Fees
    BROKER_FEE_NOT_FOUND = "FINANCIAL_BROKER_FEE_NOT_FOUND"
    BROKER_FEE_INVALID_COMMISSION_TYPE = "FINANCIAL_BROKER_FEE_INVALID_COMMISSION_TYPE"
    BROKER_FEE_INVALID_MINIMUM = "FINANCIAL_BROKER_FEE_INVALID_MINIMUM"
    BROKER_FEE_CREATE_FAILED = "FINANCIAL_BROKER_FEE_CREATE_FAILED"
    
    # Positions
    POSITION_NOT_FOUND = "FINANCIAL_POSITION_NOT_FOUND"
    POSITION_INVALID_DATA = "FINANCIAL_POSITION_INVALID_DATA"
    POSITION_CALCULATION_FAILED = "FINANCIAL_POSITION_CALCULATION_FAILED"
    
    # Generic Financial Errors
    FINANCIAL_DATA_NOT_FOUND = "FINANCIAL_DATA_NOT_FOUND"
    FINANCIAL_DATA_INVALID = "FINANCIAL_DATA_INVALID"
    FINANCIAL_CALCULATION_ERROR = "FINANCIAL_CALCULATION_ERROR"
    FINANCIAL_PERMISSION_DENIED = "FINANCIAL_PERMISSION_DENIED"
```

---

## 🔧 מימוש מוצע

### **1. Error Response Schema (Pydantic):**

```python
# api/schemas/errors.py

from pydantic import BaseModel
from typing import Optional, Dict, List
from datetime import datetime

class ErrorDetails(BaseModel):
    """Error details with field and value information."""
    field: Optional[str] = None
    value: Optional[str] = None
    suggestions: Optional[List[str]] = None

class ErrorResponse(BaseModel):
    """Unified error response schema."""
    code: str
    message: str
    message_i18n: Optional[Dict[str, str]] = None
    status_code: int
    details: Optional[ErrorDetails] = None
    timestamp: datetime
    request_id: Optional[str] = None

class UnifiedResponse(BaseModel):
    """Unified response schema (success or error)."""
    success: bool
    data: Optional[Dict] = None
    error: Optional[ErrorResponse] = None
    meta: Optional[Dict] = None
```

### **2. PDSC Service Base Class:**

```python
# api/services/pdsc/base.py

from typing import Optional, Dict, Any
from datetime import datetime
import uuid
from ..schemas.errors import UnifiedResponse, ErrorResponse, ErrorDetails
from ..utils.exceptions import HTTPExceptionWithCode, ErrorCodes

class PDSCBaseService:
    """Base service for PDSC (Data Service Core)."""
    
    def __init__(self):
        self.request_id: Optional[str] = None
    
    def _generate_request_id(self) -> str:
        """Generate unique request ID."""
        return f"req_{uuid.uuid4().hex[:26]}"
    
    def _create_error_response(
        self,
        error_code: str,
        message: str,
        status_code: int,
        field: Optional[str] = None,
        value: Optional[str] = None,
        suggestions: Optional[list] = None
    ) -> UnifiedResponse:
        """Create unified error response."""
        self.request_id = self.request_id or self._generate_request_id()
        
        error = ErrorResponse(
            code=error_code,
            message=message,
            status_code=status_code,
            details=ErrorDetails(
                field=field,
                value=value,
                suggestions=suggestions
            ) if field or value or suggestions else None,
            timestamp=datetime.utcnow(),
            request_id=self.request_id
        )
        
        return UnifiedResponse(
            success=False,
            error=error,
            meta={
                "timestamp": datetime.utcnow(),
                "request_id": self.request_id
            }
        )
    
    def _create_success_response(
        self,
        data: Dict[str, Any],
        meta: Optional[Dict[str, Any]] = None
    ) -> UnifiedResponse:
        """Create unified success response."""
        self.request_id = self.request_id or self._generate_request_id()
        
        return UnifiedResponse(
            success=True,
            data=data,
            meta={
                "timestamp": datetime.utcnow(),
                "request_id": self.request_id,
                **(meta or {})
            }
        )
    
    def _handle_exception(
        self,
        exc: Exception,
        default_message: str = "An error occurred"
    ) -> UnifiedResponse:
        """Handle exception and convert to unified error response."""
        if isinstance(exc, HTTPExceptionWithCode):
            return self._create_error_response(
                error_code=exc.error_code,
                message=exc.detail,
                status_code=exc.status_code
            )
        else:
            return self._create_error_response(
                error_code=ErrorCodes.SERVER_ERROR,
                message=default_message,
                status_code=500
            )
```

### **3. PDSC Financial Service:**

```python
# api/services/pdsc/financial.py

from typing import Optional, Dict, Any
from ..services.pdsc.base import PDSCBaseService
from ..services.trading_accounts import get_trading_account_service
from ..services.cash_flows import get_cash_flow_service
from ..services.brokers_fees import get_brokers_fees_service
from ..services.positions import get_position_service
from ..schemas.errors import UnifiedResponse

class PDSCFinancialService(PDSCBaseService):
    """PDSC Service for Financial Cube operations."""
    
    async def get_financial_data(
        self,
        resource_type: str,  # "trading_accounts", "cash_flows", "brokers_fees", "positions"
        user_id: uuid.UUID,
        db: AsyncSession,
        **filters
    ) -> UnifiedResponse:
        """
        Unified method to get financial data.
        
        Frontend doesn't need to know which endpoint to call.
        """
        try:
            if resource_type == "trading_accounts":
                service = get_trading_account_service()
                data = await service.get_trading_accounts(
                    user_id=user_id,
                    db=db,
                    **filters
                )
            elif resource_type == "cash_flows":
                service = get_cash_flow_service()
                data = await service.get_cash_flows(
                    user_id=user_id,
                    db=db,
                    **filters
                )
            elif resource_type == "brokers_fees":
                service = get_brokers_fees_service()
                data = await service.get_brokers_fees(
                    user_id=user_id,
                    db=db,
                    **filters
                )
            elif resource_type == "positions":
                service = get_position_service()
                data = await service.get_positions(
                    user_id=user_id,
                    db=db,
                    **filters
                )
            else:
                return self._create_error_response(
                    error_code="FINANCIAL_INVALID_RESOURCE_TYPE",
                    message=f"Invalid resource type: {resource_type}",
                    status_code=400
                )
            
            return self._create_success_response(
                data={"items": data, "total": len(data)},
                meta={"resource_type": resource_type}
            )
            
        except Exception as e:
            return self._handle_exception(e, "Failed to fetch financial data")
```

---

## 📋 תהליך מעבר (Migration Plan)

### **שלב 1: הגדרת Infrastructure** 🟡
- [ ] יצירת `api/schemas/errors.py` - Error schemas
- [ ] יצירת `api/services/pdsc/base.py` - Base service
- [ ] יצירת `api/services/pdsc/routes_loader.py` - Routes SSOT loader
- [ ] יצירת `api/services/pdsc/auth_manager.py` - Auth headers manager
- [ ] יצירת `api/services/pdsc/fetch_client.py` - HTTP fetch client
- [ ] יצירת `api/services/pdsc/transformers.py` - Transformers (Python)
- [ ] יצירת `api/services/pdsc/financial.py` - Financial service
- [ ] הרחבת `ErrorCodes` עם Financial error codes

### **שלב 2: מימוש PDSC Service** 🟡
- [ ] מימוש `RoutesSSOTLoader` עם caching ו-version verification
- [ ] מימוש `PDSCAuthManager` לניהול tokens
- [ ] מימוש `PDSCFetchClient` עם error handling
- [ ] מימוש Transformers (Python) - `react_to_api`, `api_to_react`
- [ ] מימוש `PDSCFinancialService` עם Transformers integration
- [ ] אינטגרציה עם Services קיימים
- [ ] בדיקות יחידה (Unit Tests)

### **שלב 3: עדכון Routers** 🟡
- [ ] עדכון Routers לשימוש ב-PDSC Service
- [ ] שמירה על backward compatibility
- [ ] בדיקות אינטגרציה

### **שלב 4: עדכון Frontend** 🟡
- [ ] עדכון Frontend לשימוש ב-PDSC Service
- [ ] הסרת תלות ב-endpoints ספציפיים
- [ ] שימוש ב-transformers.js v1.2 (אם נדרש)
- [ ] בדיקות E2E

---

## ✅ יתרונות החוזה החדש

### **1. Frontend לא צריך לדעת מאיזה endpoint:**
- ✅ קריאה אחת ל-PDSC Service
- ✅ טיפול אחיד בשגיאות
- ✅ פחות קוד ב-Frontend

### **2. Error Handling אחיד:**
- ✅ כל השגיאות באותו פורמט
- ✅ קל לטפל בשגיאות ב-Frontend
- ✅ Error codes מפורטים ומבוססי קונטקסט

### **3. קל לתחזוקה:**
- ✅ שינוי ב-Service אחד משפיע על כל הקוביות
- ✅ קל להוסיף קוביות חדשות
- ✅ קל לבדוק ולנפות באגים

---

## 📋 Checklist להשלמה

### **פערים שהושלמו:**
- [x] הוספת סעיף "Fetching (API Calls)"
- [x] הוספת סעיף "Hardened Transformers Integration"
- [x] הרחבת סעיף "Routes SSOT Integration"
- [x] עדכון "API / Interface" עם Fetching methods
- [x] עדכון "Examples" עם דוגמאות Fetching
- [x] עדכון גרסה ל-v1.1

### **תוכן שהוסף:**
- [x] Routes SSOT Loader - טעינה, caching, version verification
- [x] Authorization Headers Manager - ניהול JWT tokens
- [x] Fetch Client - HTTP client עם error handling
- [x] Transformers (Python) - המרת camelCase ↔ snake_case
- [x] Financial Service - אינטגרציה מלאה עם Transformers
- [x] דוגמאות שימוש מפורטות

---

## 📞 שאלות פתוחות

1. **i18n:** האם נדרש תמיכה ב-i18n כבר עכשיו או בעתיד?
2. **Backward Compatibility:** האם לשמור על endpoints הקיימים?
3. **Request ID:** האם להשתמש ב-request ID מ-middleware או ליצור חדש?
4. **Metadata:** מה metadata נוסף נדרש ב-responses?
5. **Frontend Integration:** האם PDSC Service יהיה ב-Frontend (JavaScript) או ב-Backend (Python)?
   - **הערה:** לפי המנדט, נראה ש-PDSC הוא Frontend Service, אבל האפיון הנוכחי הוא Backend
   - **נדרש:** הבהרה מהאדריכלית

---

## 🔗 קישורים רלוונטיים

### **מקור המנדט:**
- `_COMMUNICATION/90_Architects_comunication/ARCHITECT_BASE_SYSTEMS_DESIGN_MANDATE.md`

### **קבצים קשורים:**
- `ui/src/cubes/shared/utils/transformers.js` (Transformers v1.2)
- `ui/public/routes.json` (Routes SSOT v1.1.2)

### **מסמכי Team 10:**
- `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_20_PDSC_SPEC_GAPS.md` - פערים שזוהו

---

**Team 20 (Backend Implementation)**  
**תאריך:** 2026-02-06  
**סטטוס:** 🟡 **SPECIFICATION v1.1 - GAPS COMPLETED - AWAITING ARCHITECT APPROVAL**

**log_entry | [Team 20] | PDSC | ERROR_CONTRACT_SPEC_V1.1 | YELLOW | 2026-02-06**
