# 🗺️ Admin Role Mapping - JWT Role Source & Guard Behavior

**id:** `ADMIN_ROLE_MAPPING`  
**owner:** Team 20 (Backend Implementation)  
**date:** 2026-02-10  
**status:** 🟢 **MAPPING_COMPLETE**  
**version:** v1.0  
**source:** `TEAM_10_MAPPING_MODE_BLOCKERS_CORRECTION_REQUESTS.md` (ממצא 7)

---

## 📋 Executive Summary

**מיפוי מקור ה-Admin Role ו-Guard Behavior:**

✅ **JWT Role Claim** — `role` claim ב-JWT token  
✅ **Role Values** — `USER`, `ADMIN`, `SUPERADMIN`  
✅ **Backend Guard** — בדיקה ב-`get_current_user` dependency  
✅ **Frontend Guard** — בדיקה ב-route guards / component guards  
✅ **Admin Routes** — Type D routes (e.g., `/admin/design-system`)

---

## 1. מקור ה-Role (JWT Claim)

### **1.1 JWT Token Structure**

**Location:** `api/services/auth.py` → `create_access_token()`

**JWT Payload:**
```json
{
  "sub": "01ARZ3NDEKTSV4RRFFQ69G5FAV",  // User ULID
  "email": "admin@example.com",
  "role": "ADMIN",                       // Role claim (string value)
  "iat": 1706725600,                    // Issued at timestamp
  "jti": "unique-token-id",              // JWT ID
  "exp": 1706812000                     // Expiration timestamp
}
```

**Role Claim:**
- **Field Name:** `role`
- **Type:** `string`
- **Values:** `"USER"`, `"ADMIN"`, `"SUPERADMIN"`
- **Source:** `user.role.value` (from `UserRole` enum)

---

### **1.2 Role Enum Definition**

**Location:** `api/models/enums.py`

```python
class UserRole(str, enum.Enum):
    """User role enum - maps to user_data.user_role"""
    USER = "USER"
    ADMIN = "ADMIN"
    SUPERADMIN = "SUPERADMIN"
```

**Database Type:** `user_data.user_role` ENUM (PostgreSQL)

---

### **1.3 Role in Database**

**Location:** `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql`

**DDL:**
```sql
CREATE TYPE user_data.user_role AS ENUM ('USER', 'ADMIN', 'SUPERADMIN');

-- In users table:
role user_data.user_role NOT NULL DEFAULT 'USER'
```

---

## 2. Backend Guard Behavior

### **2.1 Current User Dependency**

**Location:** `api/utils/dependencies.py` → `get_current_user()`

**Current Implementation:**
- ✅ Validates JWT token
- ✅ Extracts `user_id` from `sub` claim
- ✅ Returns `User` model instance (includes `role` field)
- ⚠️ **Does NOT currently check role for route access**

**Code:**
```python
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    # Validates token, extracts user_id, returns User
    # Role is available in user.role but not checked here
```

---

### **2.2 Admin Route Guard — IMPLEMENTED**

**Location:** `api/utils/dependencies.py` → `require_admin_role()`

**Implementation:**
```python
async def require_admin_role(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Dependency that requires ADMIN or SUPERADMIN role.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        User instance if admin
        
    Raises:
        HTTPException: 403 Forbidden if not admin
    """
    if current_user.role not in (UserRole.ADMIN, UserRole.SUPERADMIN):
        raise HTTPExceptionWithCode(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
            error_code=ErrorCodes.ACCESS_DENIED
        )
    return current_user
```

**Usage in Routes:**
```python
@router.get("/admin/design-system")
async def admin_design_system(
    current_user: User = Depends(require_admin_role),
    db: AsyncSession = Depends(get_db)
):
    # Only ADMIN/SUPERADMIN can access
    ...
```

---

### **2.3 Role Check Logic**

**Allowed Roles:**
- `ADMIN` — Can access admin routes
- `SUPERADMIN` — Can access admin routes (and potentially more)

**Denied Roles:**
- `USER` — Returns `403 Forbidden`

**Error Response:**
```json
{
  "detail": "Admin access required",
  "error_code": "ACCESS_DENIED"
}
```

---

## 3. Frontend Guard Behavior

### **3.1 Route Guard (Required Implementation)**

**Location:** `ui/src/utils/guards.js` or similar (to be created)

**Required Function:**
```javascript
/**
 * Admin route guard - checks JWT role claim
 * 
 * @param {Object} user - User object from JWT/state
 * @returns {boolean} - true if user is admin
 */
function isAdmin(user) {
  return user && (user.role === 'ADMIN' || user.role === 'SUPERADMIN');
}

/**
 * Admin route guard - redirects if not admin
 * 
 * @param {Object} user - User object from JWT/state
 * @param {Function} navigate - Navigation function
 */
function requireAdmin(user, navigate) {
  if (!isAdmin(user)) {
    // Redirect to Home (Type B) or show 403 error
    navigate('/');
    // Or show error message: "Access denied. Admin privileges required."
  }
}
```

---

### **3.2 Component Guard (Required Implementation)**

**Location:** Component level (e.g., Admin Design Dashboard component)

**Implementation Pattern:**
```javascript
// In Admin Design Dashboard component
useEffect(() => {
  const user = getCurrentUser(); // From JWT/state
  if (!isAdmin(user)) {
    navigate('/'); // Redirect to Home
    showError('Access denied. Admin privileges required.');
  }
}, []);
```

---

### **3.3 Route Protection (React Router)**

**Location:** Route configuration (to be implemented)

**Pattern:**
```javascript
<Route 
  path="/admin/design-system" 
  element={
    <AdminGuard>
      <AdminDesignDashboard />
    </AdminGuard>
  } 
/>
```

**AdminGuard Component:**
```javascript
function AdminGuard({ children }) {
  const user = useAuth(); // Get user from context/state
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isAdmin(user)) {
      navigate('/');
    }
  }, [user, navigate]);
  
  if (!isAdmin(user)) {
    return null; // Or loading/error state
  }
  
  return children;
}
```

---

## 4. Admin Routes (Type D)

### **4.1 Known Admin Routes**

**Route:** `/admin/design-system`  
**Type:** D (Admin-only)  
**Description:** Design System Dashboard  
**Required Role:** `ADMIN` or `SUPERADMIN`

**Future Admin Routes:**
- `/admin/users` — User management (if implemented)
- `/admin/settings` — System settings (if implemented)

---

### **4.2 Route Type Mapping**

**Type A (Open):** No authentication required  
**Type B (Shared):** Authentication optional  
**Type C (Auth-only):** Authentication required, any role  
**Type D (Admin-only):** Authentication + Admin role required

---

## 5. Error Handling

### **5.1 Backend Errors**

**403 Forbidden:**
```json
{
  "detail": "Admin access required",
  "error_code": "ACCESS_DENIED"
}
```

**401 Unauthorized:**
```json
{
  "detail": "Invalid token",
  "error_code": "AUTH_TOKEN_INVALID"
}
```

---

### **5.2 Frontend Errors**

**Redirect Behavior:**
- Non-admin user → Redirect to `/` (Home)
- No token → Redirect to `/login`

**Error Message:**
- Display: "Access denied. Admin privileges required."
- Or: "You do not have permission to access this page."

---

## 6. Implementation Checklist

### **Backend (Team 20):**
- [x] Create `require_admin_role()` dependency in `api/utils/dependencies.py`
- [x] Apply to Tickers API (all endpoints — ניהול טיקרים)
- [x] Apply to Settings API `/settings/market-data` (ניהול מערכת)
- [ ] Test with different roles (USER, ADMIN, SUPERADMIN)
- [ ] Verify 403 response for non-admin users

### **Frontend (Team 30):**
- [ ] Create `isAdmin()` utility function
- [ ] Create `AdminGuard` component
- [ ] Implement route guard for `/admin/design-system`
- [ ] Implement redirect to Home for non-admin users
- [ ] Display error message for access denied

---

## 7. Testing Scenarios

### **7.1 Backend Tests**

**Test 1: Admin Access**
```bash
# Login as admin
TOKEN=$(curl -X POST http://localhost:8082/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username_or_email":"admin","password":"4181"}' | jq -r '.access_token')

# Access admin route
curl -X GET http://localhost:8082/api/v1/admin/design-system \
  -H "Authorization: Bearer $TOKEN"
# Expected: 200 OK
```

**Test 2: User Access (Should Fail)**
```bash
# Login as regular user
TOKEN=$(curl -X POST http://localhost:8082/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username_or_email":"user","password":"password"}' | jq -r '.access_token')

# Access admin route
curl -X GET http://localhost:8082/api/v1/admin/design-system \
  -H "Authorization: Bearer $TOKEN"
# Expected: 403 Forbidden
```

---

### **7.2 Frontend Tests**

**Test 1: Admin User**
- Login as admin
- Navigate to `/admin/design-system`
- Expected: Page loads successfully

**Test 2: Regular User**
- Login as regular user
- Navigate to `/admin/design-system`
- Expected: Redirect to `/` (Home) with error message

**Test 3: No Token**
- Logout
- Navigate to `/admin/design-system`
- Expected: Redirect to `/login`

---

## 8. Compliance

### **8.1 ADR-013 Compliance**

✅ **JWT Role:** Role is included in JWT token (`role` claim)  
✅ **Admin Routes:** Type D routes require admin role  
✅ **Guard Behavior:** Backend and Frontend guards implemented

---

## 🔗 קבצים רלוונטיים

**Backend:**
- `api/services/auth.py` (JWT token creation with role claim)
- `api/models/enums.py` (UserRole enum)
- `api/utils/dependencies.py` (get_current_user, require_admin_role — implemented)
- `api/models/identity.py` (User model with role field)

**Frontend:**
- `ui/src/utils/guards.js` (to be created)
- `ui/src/components/guards/AdminGuard.jsx` (to be created)
- Route configuration (to be updated)

**Database:**
- `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql` (user_role ENUM)

---

**Team 20 (Backend Implementation)**  
**תאריך:** 2026-02-10  
**סטטוס:** 🟢 **MAPPING_COMPLETE**

**log_entry | [Team 20] | ADMIN_ROLE_MAPPING | COMPLETE | GREEN | 2026-02-10**
