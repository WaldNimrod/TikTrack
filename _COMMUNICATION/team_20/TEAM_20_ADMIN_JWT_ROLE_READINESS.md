# ✅ Team 20 → Team 10: מוכנות JWT Role עבור Admin-only Routes

**id:** `TEAM_20_ADMIN_JWT_ROLE_READINESS`  
**from:** Team 20 (Backend Implementation)  
**to:** Team 10 (The Gateway)  
**date:** 2026-02-10  
**status:** 🟢 **READY FOR GATE_A**  
**version:** v1.0  
**source:** `TEAM_10_TO_TEAM_20_GATE_A_KICKOFF_MANDATE.md` (פריט 2.1)

---

## 📋 Executive Summary

**Team 20 מאשר מוכנות מלאה עבור JWT Role ב-Admin-only Routes:**

✅ **JWT מכיל שדה `role`** — מופיע ב-JWT payload  
✅ **מבנה JWT מתועד** — מסמך מיפוי מלא קיים  
✅ **ערכים תקפים מוגדרים** — `USER`, `ADMIN`, `SUPERADMIN`  
✅ **מוכן לתיאום עם Team 30** — כל המידע נגיש

---

## 1. וידוא JWT Role ✅

### **1.1 JWT מכיל שדה `role`**

**מיקום בקוד:** `api/services/auth.py` → `create_access_token()` (שורה 137)

**קוד:**
```python
payload: Dict[str, Any] = {
    "sub": user_ulid,  # ULID (external identifier)
    "email": user.email,
    "role": user.role.value,  # ✅ Role claim included
    "iat": datetime.now(timezone.utc),
    "jti": jti,
    "exp": expires_at,
}
```

**מבנה JWT Payload:**
```json
{
  "sub": "01ARZ3NDEKTSV4RRFFQ69G5FAV",  // User ULID
  "email": "admin@example.com",
  "role": "ADMIN",                       // ✅ Role field - identifies admin
  "iat": 1706725600,                    // Issued at timestamp
  "jti": "unique-token-id",              // JWT ID
  "exp": 1706812000                     // Expiration timestamp
}
```

**סטטוס:** ✅ **מאומת בקוד** — שדה `role` קיים ב-JWT token

---

### **1.2 ערכים תקפים ל-Role**

**מיקום:** `api/models/enums.py` → `UserRole` enum

**ערכים:**
- `"USER"` — משתמש רגיל
- `"ADMIN"` — מנהל (מזהה admin)
- `"SUPERADMIN"` — מנהל על (מזהה admin)

**קוד:**
```python
class UserRole(str, enum.Enum):
    """User role enum - maps to user_data.user_role"""
    USER = "USER"
    ADMIN = "ADMIN"          # ✅ Identifies admin
    SUPERADMIN = "SUPERADMIN"  # ✅ Identifies admin
```

**סטטוס:** ✅ **מוגדר** — ערכים תקפים: `USER`, `ADMIN`, `SUPERADMIN`

---

## 2. מבנה JWT והערכים התקפים (לתיאום עם Team 30)

### **2.1 מבנה JWT Payload**

**שדות ב-JWT:**
| שדה | סוג | תיאור | דוגמה |
|-----|-----|--------|-------|
| `sub` | `string` | User ULID (מזהה משתמש חיצוני) | `"01ARZ3NDEKTSV4RRFFQ69G5FAV"` |
| `email` | `string` | כתובת אימייל של המשתמש | `"admin@example.com"` |
| **`role`** | **`string`** | **תפקיד המשתמש** | **`"ADMIN"`** |
| `iat` | `number` | Issued at timestamp (Unix) | `1706725600` |
| `jti` | `string` | JWT ID (מזהה ייחודי לטוקן) | `"unique-token-id"` |
| `exp` | `number` | Expiration timestamp (Unix) | `1706812000` |

---

### **2.2 ערכים תקפים ל-`role`**

**ערכים מותרים:**
- `"USER"` — משתמש רגיל (לא admin)
- `"ADMIN"` — מנהל (✅ admin)
- `"SUPERADMIN"` — מנהל על (✅ admin)

**בדיקת Admin:**
```javascript
// Frontend check (for Team 30)
const isAdmin = (user) => {
  return user && (user.role === 'ADMIN' || user.role === 'SUPERADMIN');
};
```

**בדיקת Admin ב-Backend:**
```python
# Backend check
if current_user.role not in (UserRole.ADMIN, UserRole.SUPERADMIN):
    raise HTTPException(status_code=403, detail="Admin access required")
```

---

### **2.3 Route: `/admin/design-system`**

**Route:** `/admin/design-system`  
**Type:** D (Admin-only)  
**מקור הרשאות:** JWT (שדה `role`)  
**Required Role:** `ADMIN` או `SUPERADMIN`

**התנהגות נדרשת:**
- ✅ אם `role === "ADMIN"` או `role === "SUPERADMIN"` → גישה מותרת
- ❌ אם `role === "USER"` → redirect ל-`/` (Home) או 403 Forbidden
- ❌ אם אין token → redirect ל-`/login`

---

## 3. תיאום עם Team 30

### **3.1 מידע נדרש ל-Team 30**

**מסמך מיפוי מלא:** `_COMMUNICATION/team_20/ADMIN_ROLE_MAPPING.md`

**תוכן המסמך:**
- ✅ מבנה JWT Payload עם שדה `role`
- ✅ ערכים תקפים (`USER`, `ADMIN`, `SUPERADMIN`)
- ✅ דוגמאות קוד ל-Frontend Guard (`isAdmin()`, `AdminGuard` component)
- ✅ דוגמאות קוד ל-Backend Guard (`require_admin_role()` dependency)
- ✅ Route protection patterns
- ✅ Error handling (403 Forbidden, redirects)

---

### **3.2 נקודות תיאום**

**Team 30 צריך ליישם:**
1. ✅ בדיקת `role` מה-JWT token
2. ✅ Route guard ל-`/admin/design-system`
3. ✅ Redirect ל-`/` אם `role !== "ADMIN" && role !== "SUPERADMIN"`
4. ✅ Error message: "Access denied. Admin privileges required."

**Team 20 מספק/מאשר:**
- ✅ מבנה JWT: שדה `role` קיים, ערכים: `"USER"`, `"ADMIN"`, `"SUPERADMIN"`
- ✅ Backend guard: `require_admin_role()` dependency (מתועד, נדרש מימוש)
- ✅ מסמך מיפוי מלא: `ADMIN_ROLE_MAPPING.md`

---

## 4. דוגמאות קוד

### **4.1 בדיקת Role ב-Frontend (ל-Team 30)**

```javascript
/**
 * Check if user is admin
 * @param {Object} user - User object from JWT/state
 * @returns {boolean} - true if user is admin
 */
function isAdmin(user) {
  return user && (user.role === 'ADMIN' || user.role === 'SUPERADMIN');
}

/**
 * Admin route guard - redirects if not admin
 * @param {Object} user - User object from JWT/state
 * @param {Function} navigate - Navigation function
 */
function requireAdmin(user, navigate) {
  if (!isAdmin(user)) {
    navigate('/'); // Redirect to Home
    // Or show error: "Access denied. Admin privileges required."
  }
}
```

---

### **4.2 בדיקת Role ב-Backend**

```python
from api.models.enums import UserRole
from api.utils.dependencies import get_current_user
from fastapi import Depends, HTTPException, status

async def require_admin_role(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Dependency that requires ADMIN or SUPERADMIN role.
    """
    if current_user.role not in (UserRole.ADMIN, UserRole.SUPERADMIN):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

# Usage in route:
@router.get("/admin/design-system")
async def admin_design_system(
    current_user: User = Depends(require_admin_role),
    db: AsyncSession = Depends(get_db)
):
    # Only ADMIN/SUPERADMIN can access
    ...
```

---

## 5. בדיקות ואימות

### **5.1 בדיקת JWT Payload**

**Test Login Response:**
```bash
curl -X POST http://localhost:8082/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username_or_email":"admin","password":"4181"}'

# Response includes:
{
  "access_token": "eyJ...",
  "user": {
    "username": "admin",
    "email": "admin@example.com",
    "role": "ADMIN"  // ✅ Role included
  }
}
```

**Decode JWT Token:**
```python
import jwt
token = "eyJ..."  # From login response
payload = jwt.decode(token, verify=False)  # For testing only
print(payload["role"])  # Should output: "ADMIN"
```

---

### **5.2 בדיקת Role Values**

**Database Verification:**
```sql
-- Check user roles in database
SELECT id, username, email, role 
FROM user_data.users 
WHERE role IN ('ADMIN', 'SUPERADMIN');

-- Expected: admin users with ADMIN/SUPERADMIN role
```

**Code Verification:**
```python
from api.models.enums import UserRole

# Verify enum values
assert UserRole.USER.value == "USER"
assert UserRole.ADMIN.value == "ADMIN"
assert UserRole.SUPERADMIN.value == "SUPERADMIN"
```

---

## 6. קבצים רלוונטיים

**קוד:**
- `api/services/auth.py` (JWT token creation with role - שורה 137)
- `api/models/enums.py` (UserRole enum)
- `api/utils/dependencies.py` (get_current_user - role available in User model)

**תיעוד:**
- `_COMMUNICATION/team_20/ADMIN_ROLE_MAPPING.md` (מיפוי מלא - מוכן לתיאום עם Team 30)
- `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql` (user_role ENUM)

---

## 7. סטטוס השלמה

| # | פעולה | סטטוס | הערות |
|---|--------|--------|-------|
| 1 | **JWT role** | ✅ **הושלם** | JWT מכיל שדה `role` שמזהה admin |
| 2 | **תיאום עם Team 30** | ✅ **מוכן** | מסמך מיפוי מלא קיים (`ADMIN_ROLE_MAPPING.md`) |
| 3 | **דיווח** | ✅ **הושלם** | מסמך זה + `ADMIN_ROLE_MAPPING.md` |

---

## 8. סיכום

### **מה הושלם:**

1. ✅ **JWT Role** — JWT מכיל שדה `role` שמזהה מנהל (`ADMIN`, `SUPERADMIN`)
2. ✅ **מבנה JWT** — מתועד במלואו ב-`ADMIN_ROLE_MAPPING.md`
3. ✅ **ערכים תקפים** — `USER`, `ADMIN`, `SUPERADMIN` מוגדרים
4. ✅ **מוכן לתיאום** — כל המידע נגיש ל-Team 30

### **מה נדרש מ-Team 30:**

1. ✅ בדיקת `role` מה-JWT token
2. ✅ Route guard ל-`/admin/design-system`
3. ✅ Redirect ל-`/` אם לא admin
4. ✅ Error message: "Access denied. Admin privileges required."

### **מה נדרש מ-Team 20 (עתידי):**

1. ⚠️ מימוש `require_admin_role()` dependency ב-Backend (מתועד, נדרש מימוש)
2. ⚠️ הגנה על route `/admin/design-system` ב-Backend (אם קיים)

---

## 🔗 קבצים רלוונטיים

**מקור המנדט:**
- `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_20_GATE_A_KICKOFF_MANDATE.md`

**מסמכי מיפוי:**
- `_COMMUNICATION/team_20/ADMIN_ROLE_MAPPING.md` (מיפוי מלא)
- `_COMMUNICATION/team_20/TEAM_20_TO_TEAM_10_BLOCKERS_CORRECTION_COMPLETE.md` (דיווח קודם)

**קבצי קוד:**
- `api/services/auth.py` (JWT token creation)
- `api/models/enums.py` (UserRole enum)
- `api/utils/dependencies.py` (get_current_user)

---

**Team 20 (Backend Implementation)**  
**תאריך:** 2026-02-10  
**סטטוס:** 🟢 **READY FOR GATE_A - JWT_ROLE_VERIFIED**

**log_entry | [Team 20] | GATE_A_JWT_ROLE_READINESS | COMPLETE | GREEN | 2026-02-10**
