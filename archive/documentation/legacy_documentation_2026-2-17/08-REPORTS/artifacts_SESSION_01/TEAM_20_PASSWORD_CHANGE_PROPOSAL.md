# Team 20 Password Change Flow Proposal

**From:** Team 20 (Backend)  
**To:** Team 10 (The Gateway), Team 30 (Frontend), Team 50 (QA)  
**Subject:** PASSWORD_CHANGE_PROPOSAL | Endpoint Design Proposal  
**Date:** 2026-01-31  
**Session:** SESSION_01 - Phase 1.5 Clarification

---

## ✅ Executive Summary

**Status:** ✅ **PROPOSAL READY**

Team 20 proposes a dedicated password change endpoint following security best practices. This addresses the clarification request from Team 50 regarding Password Change Flow implementation.

---

## 📋 Current Status

### What Exists:
- ✅ Password Reset Flow: `/auth/reset-password` + `/auth/verify-reset` (for forgotten passwords)
- ✅ Profile Update: `PUT /users/me` (for profile fields, excludes password)
- ❌ Password Change: Not implemented (for authenticated users changing password)

### Why Separate Endpoint?
- **Security:** Password change requires old password verification
- **Separation of Concerns:** Profile update ≠ Password change
- **Best Practice:** Dedicated endpoint for sensitive operations

---

## 🎯 Proposed Solution

### Endpoint Design

**Endpoint:** `PUT /users/me/password`  
**Method:** PUT  
**Authentication:** Required (Bearer Token)  
**Purpose:** Change password for authenticated user

### Request Schema

```python
class PasswordChangeRequest(BaseModel):
    """Password change request schema."""
    old_password: str = Field(..., min_length=8, description="Current password")
    new_password: str = Field(..., min_length=8, description="New password (min 8 characters)")
    
    @validator("new_password")
    def validate_new_password(cls, v, values):
        """Ensure new password is different from old password."""
        if "old_password" in values and v == values["old_password"]:
            raise ValueError("New password must be different from old password")
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "old_password": "current_password_123",
                "new_password": "new_secure_password_456"
            }
        }
```

### Response Schema

```python
class PasswordChangeResponse(BaseModel):
    """Password change response schema."""
    message: str = Field(..., description="Success message")
    user_id: str = Field(..., pattern=ULID_PATTERN, description="User ULID")
    
    class Config:
        json_schema_extra = {
            "example": {
                "message": "Password changed successfully",
                "user_id": "01ARZ3NDEKTSV4RRFFQ69G5FAV"
            }
        }
```

---

## 🔒 Security Features

### 1. Old Password Verification
- ✅ **Required:** User must provide current password
- ✅ **Validation:** Verify old password matches current password hash
- ✅ **Error:** Generic error message if old password incorrect

### 2. Password Strength
- ✅ **Minimum Length:** 8 characters (enforced by schema)
- ✅ **Future Enhancement:** Can add complexity requirements (uppercase, lowercase, numbers, special chars)

### 3. Security Best Practices
- ✅ **Generic Errors:** "Invalid current password" (prevents user enumeration)
- ✅ **Rate Limiting:** Can be added in Phase 2
- ✅ **Audit Logging:** Log password change events

---

## 📝 Implementation Plan

### Backend (Team 20)

#### 1. Add Schema
**File:** `api/schemas/identity.py`

```python
class PasswordChangeRequest(BaseModel):
    old_password: str = Field(..., min_length=8)
    new_password: str = Field(..., min_length=8)
    
    @validator("new_password")
    def validate_new_password(cls, v, values):
        if "old_password" in values and v == values["old_password"]:
            raise ValueError("New password must be different from old password")
        return v

class PasswordChangeResponse(BaseModel):
    message: str
    user_id: str = Field(..., pattern=ULID_PATTERN)
```

#### 2. Add Route
**File:** `api/routers/users.py`

```python
@router.put("/me/password", response_model=PasswordChangeResponse)
async def change_password(
    data: PasswordChangeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Change user password (D25).
    
    Requires old password verification for security.
    """
    try:
        auth_service = get_auth_service()
        
        # Verify old password
        if not auth_service.verify_password(data.old_password, current_user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid current password"
            )
        
        # Update password
        new_password_hash = auth_service.hash_password(data.new_password)
        current_user.password_hash = new_password_hash
        current_user.updated_at = datetime.utcnow()
        
        await db.commit()
        await db.refresh(current_user)
        
        return PasswordChangeResponse(
            message="Password changed successfully",
            user_id=uuid_to_ulid(current_user.id)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Password change error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password change failed"
        )
```

#### 3. Update OpenAPI Spec
**File:** `documentation/05-DEVELOPMENT_&_CONTRACTS/OPENAPI_SPEC_V2.5.2.yaml`

Add endpoint documentation for `PUT /users/me/password`.

---

## 🔄 Alternative Approaches Considered

### Option 1: Include in Profile Update ❌
**Why Not:**
- Mixes concerns (profile data ≠ password)
- Less secure (password change should be explicit)
- Harder to audit separately

### Option 2: POST /users/me/password ✅
**Why Not:**
- PUT is more RESTful for updates
- PUT indicates idempotent operation

### Option 3: PUT /users/me/password ✅ (Selected)
**Why:**
- RESTful (PUT for updates)
- Clear separation of concerns
- Easy to audit
- Standard practice

---

## ✅ Benefits

### Security:
- ✅ Old password verification required
- ✅ Separate endpoint for sensitive operation
- ✅ Generic error messages
- ✅ Audit trail ready

### User Experience:
- ✅ Clear API contract
- ✅ Easy to implement in Frontend
- ✅ Standard REST pattern

### Maintainability:
- ✅ Separation of concerns
- ✅ Easy to add rate limiting later
- ✅ Easy to add password history later

---

## 📊 Implementation Effort

### Backend (Team 20):
- **Time:** ~30 minutes
- **Files:** 3 files (schemas, routes, OpenAPI)
- **Complexity:** Low (reuses existing AuthService methods)

### Frontend (Team 30):
- **Time:** ~1 hour
- **Files:** Service method + Component
- **Complexity:** Low (standard API call)

---

## 🚀 Recommendation

**Recommendation:** ✅ **IMPLEMENT DEDICATED ENDPOINT**

**Rationale:**
- Follows security best practices
- Clear separation of concerns
- Standard REST pattern
- Easy to implement
- Low effort, high value

---

## ✅ Next Steps

### For Team 10 (The Gateway):
- ⏸️ **Review proposal** and approve or suggest changes
- ⏸️ **Coordinate** with Team 30 for Frontend implementation

### For Team 20 (Backend):
- ⏸️ **Awaiting approval** from Team 10
- ⏸️ **Ready to implement** once approved

### For Team 30 (Frontend):
- ⏸️ **Awaiting Backend implementation**
- ⏸️ **Ready to implement** Frontend component once Backend ready

### For Team 50 (QA):
- ⏸️ **Awaiting implementation**
- ⏸️ **Ready to test** once implemented

---

## ✅ Sign-off

**Proposal Status:** ✅ **READY FOR REVIEW**  
**Security:** ✅ **BEST PRACTICES**  
**Implementation:** ✅ **LOW EFFORT**  
**Value:** ✅ **HIGH**

---

**Prepared by:** Team 20 (Backend)  
**Date:** 2026-01-31  
**log_entry | [Team 20] | PASSWORD_CHANGE_PROPOSAL | ENDPOINT_DESIGN | PROPOSED**

---

## 📎 Related Documents

1. `TEAM_50_TASK_50.2.2_USER_MANAGEMENT_FLOW_INTEGRATION.md` - Original clarification request
2. `TEAM_50_TO_TEAMS_PHASE_1.5_SELENIUM_READY.md` - Selenium testing notification

---

**Proposal:** ✅ **READY FOR TEAM 10 REVIEW**
