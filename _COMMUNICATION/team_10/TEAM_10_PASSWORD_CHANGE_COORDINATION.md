# 🔄 הודעה: צוות 10 → צוותים 20, 30 (Password Change - Coordination)

**From:** Team 10 (The Gateway)  
**To:** Team 20 (Backend), Team 30 (Frontend)  
**Date:** 2026-01-31  
**Session:** SESSION_01 - Phase 1.3  
**Subject:** PASSWORD_CHANGE_COORDINATION | Status: ⏸️ **ACTION REQUIRED**  
**Priority:** 🔴 **P0 - CRITICAL**

---

## 📋 Executive Summary

**Task:** Password Change Flow Implementation  
**Priority:** 🔴 **P0 - CRITICAL**  
**Status:** ⏸️ **READY FOR IMPLEMENTATION**

**Teams Involved:**
- 🔵 **Team 20 (Backend)** - Endpoint implementation
- 🔵 **Team 30 (Frontend)** - Form component implementation
- ✅ **Team 50 (QA)** - Protocol ready (awaiting implementation)
- ✅ **Team 60 (DevOps)** - No changes needed (proxy already configured)

**Architectural Decision:** ✅ **APPROVED**  
**Date Approved:** 2026-01-31

---

## 🎯 Context & Background

### **Current Status:**
- ✅ Phase 1.5 Authentication System: **COMPLETE** (100% pass rate)
- ✅ Login Endpoint: **100% pass rate** (4/4 tests)
- ✅ Users/Me Endpoint: **100% pass rate** (3/3 tests) - FIXED
- ✅ Token Validation: **VERIFIED**
- 🟢 Phase 1.3 Frontend Integration: **IN PROGRESS**
  - ✅ D15_LOGIN - COMPLETE
  - ✅ D15_REGISTER - COMPLETE
  - ✅ D15_RESET_PWD - COMPLETE
  - 🟢 D15_PROF_VIEW - IN PROGRESS (Password Change pending)

### **Password Change Flow:**
- **Architectural Decision:** ✅ **APPROVED** (2026-01-31)
- **Endpoint:** `PUT /users/me/password`
- **Component:** Security Section in D15_PROF_VIEW.html
- **Status:** ⏸️ **READY FOR IMPLEMENTATION**

---

## 🔗 Cross-Team Coordination

### **Dependencies:**

**Team 20 → Team 30:**
- Team 30 **cannot start** until Team 20 completes endpoint
- Team 30 needs endpoint URL and payload structure
- Team 30 needs error response format

**Team 30 → Team 50:**
- Team 50 **cannot test** until Team 30 completes form
- Team 50 needs working form component
- Team 50 needs access to Security section in Profile View

### **Coordination Points:**

1. **After Team 20 Completion:**
   - Team 20 reports completion to Team 10
   - Team 10 notifies Team 30: "Endpoint ready, you can start"
   - Team 30 begins Frontend implementation

2. **After Team 30 Completion:**
   - Team 30 reports completion to Team 10
   - Team 10 notifies Team 50: "Ready for QA testing"
   - Team 50 begins QA testing

3. **If Issues Found:**
   - Team 50 reports issues to Team 10
   - Team 10 routes to appropriate team (20 or 30)
   - Fix → Re-test cycle

---

## 🔵 Team 20 (Backend) - Tasks

### **Priority:** 🔴 **P0 - CRITICAL**

### **Task 20.1: Implement Password Change Endpoint**

#### **20.1.1: Endpoint Implementation** ⏸️ **P0**

**Endpoint:** `PUT /api/v1/users/me/password`

**Location:** `api/routers/users.py` (or `api/routers/auth.py`)

**Method:** `PUT`

**Path:** `/users/me/password`

**Authentication:** Required (JWT access token)

**Request Payload (snake_case):**
```json
{
  "old_password": "string",
  "new_password": "string"
}
```

**Response (Success - 200 OK):**
```json
{
  "message": "Password changed successfully"
}
```

**Response (Error - 401 Unauthorized):**
```json
{
  "detail": "Invalid credentials"
}
```

**Response (Error - 429 Too Many Requests):**
```json
{
  "detail": "Too many requests. Please try again later."
}
```

#### **20.1.2: Security Requirements** ⏸️ **P0**

**Old Password Verification:**
- [ ] Verify `old_password` matches current user's password
- [ ] Use bcrypt password verification (direct bcrypt, not passlib)
- [ ] Return generic 401 error if verification fails

**Rate Limiting:**
- [ ] Implement rate limiting: **5 attempts per 15 minutes**
- [ ] Per-user rate limiting (based on user_id from JWT)
- [ ] Return 429 error if rate limit exceeded

**Error Handling:**
- [ ] Generic error message: "Invalid credentials" (no user details)
- [ ] No information leakage in error messages
- [ ] Proper logging for debugging (`?debug` mode)

#### **20.1.3: Password Hashing** ⏸️ **P0**

**Requirements:**
- [ ] Hash new password using bcrypt (direct bcrypt, not passlib)
- [ ] Use bcrypt.gensalt() for salt generation
- [ ] Store hashed password in database

**Code Reference:**
```python
import bcrypt

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(
            plain_password.encode('utf-8'),
            hashed_password.encode('utf-8')
        )
    except Exception:
        return False
```

#### **20.1.4: OpenAPI Spec Update** ⏸️ **P0**

**Requirements:**
- [ ] Add endpoint to OpenAPI Spec
- [ ] Document request/response schemas
- [ ] Document error responses (401, 429)
- [ ] Document authentication requirement

**File:** `05-DEVELOPMENT_&_CONTRACTS/OPENAPI_SPEC_V2_FINAL.yaml` (or current spec file)

#### **20.1.5: Testing** ⏸️ **P0**

**Manual Testing:**
- [ ] Test with valid old_password → Should succeed (200 OK)
- [ ] Test with invalid old_password → Should fail (401 Unauthorized)
- [ ] Test rate limiting → Should fail after 5 attempts (429)
- [ ] Test without authentication → Should fail (401)

**Test Users:**
- Primary Admin: `nimrod` / `4181`
- Secondary Admin: `nimrod_wald` / `4181`

---

### **Success Criteria - Team 20:**

**Implementation is COMPLETE when:**

1. ✅ **Endpoint Implemented:**
   - [ ] Endpoint `PUT /users/me/password` exists
   - [ ] Request payload validated (snake_case)
   - [ ] Old password verification works
   - [ ] New password hashed correctly

2. ✅ **Security Requirements:**
   - [ ] Old password verification implemented
   - [ ] Rate limiting implemented (5/15min)
   - [ ] Generic error messages (no information leakage)

3. ✅ **OpenAPI Spec:**
   - [ ] Endpoint documented in OpenAPI Spec
   - [ ] Schemas documented
   - [ ] Error responses documented

4. ✅ **Testing:**
   - [ ] Manual testing completed
   - [ ] All test cases pass

5. ✅ **Reporting:**
   - [ ] Report completion to Team 10
   - [ ] Provide endpoint URL and payload structure to Team 30

---

## 🔵 Team 30 (Frontend) - Tasks

### **Priority:** 🔴 **P0 - CRITICAL**

### **Task 30.1: Implement Password Change Form Component**

#### **30.1.1: Component Location** ⏸️ **P0**

**File:** `ui/src/components/profile/PasswordChangeForm.jsx`

**Blueprint Source:** `_COMMUNICATION/team_31/team_31_staging/D15_PROF_VIEW.html`

**Integration Point:** Security Section in Profile View

#### **30.1.2: UI Structure** ⏸️ **P0**

**LEGO Component:**
```html
<tt-section data-title="אבטחת חשבון">
  <!-- Password Change Form -->
</tt-section>
```

**Form Fields:**
- [ ] Old Password (currentPassword) - with Eye icon
- [ ] New Password (newPassword) - with Eye icon
- [ ] Confirm New Password (confirmPassword) - with Eye icon

**Eye Icon:**
- [ ] Show/hide password toggle
- [ ] Fidelity match with Legacy system
- [ ] Use LEGO icon component

#### **30.1.3: React State Management** ⏸️ **P0**

**State Variables (camelCase):**
```javascript
const [currentPassword, setCurrentPassword] = useState('');
const [newPassword, setNewPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');
const [showCurrentPassword, setShowCurrentPassword] = useState(false);
const [showNewPassword, setShowNewPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState(null);
const [success, setSuccess] = useState(false);
```

**Naming Convention:**
- ✅ React State: `camelCase` (currentPassword, newPassword)
- ✅ API Payload: `snake_case` (old_password, new_password)
- ✅ Transformation: Use `reactToApiPasswordChange` transformer

#### **30.1.4: Transformation Layer** ⏸️ **P0**

**Transformer Function:**
- [ ] Create/update `reactToApiPasswordChange` in `ui/src/utils/transformers.js`
- [ ] Map `currentPassword` → `old_password`
- [ ] Map `newPassword` → `new_password`
- [ ] Document with JSDoc

**Code Reference:**
```javascript
/**
 * Transform React state to API payload for password change
 * @param {Object} reactState - React state object
 * @param {string} reactState.currentPassword - Current password (camelCase)
 * @param {string} reactState.newPassword - New password (camelCase)
 * @returns {Object} API payload (snake_case)
 * @legacyReference D15_PROF_VIEW.html
 */
export function reactToApiPasswordChange(reactState) {
  return {
    old_password: reactState.currentPassword,
    new_password: reactState.newPassword
  };
}
```

#### **30.1.5: API Integration** ⏸️ **P0**

**Endpoint:** `PUT /api/v1/users/me/password`

**API Call:**
- [ ] Use `AuthTransformer.reactToApiPasswordChange()` for payload transformation
- [ ] Handle 200 OK response (success message)
- [ ] Handle 401 Unauthorized (invalid old password)
- [ ] Handle 429 Too Many Requests (rate limit exceeded)
- [ ] Handle network errors

**Error Handling:**
- [ ] Display error messages using LEGO components
- [ ] Generic error display (no technical details to user)
- [ ] Clear error state on form reset

#### **30.1.6: Client-Side Validation** ⏸️ **P0**

**Validation Rules:**
- [ ] Old password required
- [ ] New password required
- [ ] Confirm password matches new password
- [ ] Password strength requirements (if defined)
- [ ] Display validation errors using LEGO components

#### **30.1.7: Form Submission** ⏸️ **P0**

**Submission Flow:**
1. [ ] Validate form (client-side)
2. [ ] Show loading state
3. [ ] Transform state to API payload
4. [ ] Call API endpoint
5. [ ] Handle success (show success message, reset form)
6. [ ] Handle errors (show error message)

**Success Behavior:**
- [ ] Show success message
- [ ] Reset form fields
- [ ] Clear all state

#### **30.1.8: Audit Trail** ⏸️ **P0**

**Debug Mode Logging:**
- [ ] Log password change attempt: `[Auth] Password change attempt started`
- [ ] Log success: `[Auth] Password change successful`
- [ ] Log errors: `[Auth] Password change failed: [reason]`
- [ ] Only log in `?debug` mode (check URL parameter)

**Code Reference:**
```javascript
const isDebugMode = new URLSearchParams(window.location.search).has('debug');

if (isDebugMode) {
  console.info('[Auth] Password change attempt started');
}
```

---

### **Success Criteria - Team 30:**

**Implementation is COMPLETE when:**

1. ✅ **Component Created:**
   - [ ] PasswordChangeForm.jsx component exists
   - [ ] Integrated into Profile View (Security section)
   - [ ] Uses LEGO components

2. ✅ **Form Structure:**
   - [ ] All form fields present (old, new, confirm)
   - [ ] Eye icons for show/hide password
   - [ ] Fidelity match with Blueprint

3. ✅ **State Management:**
   - [ ] React state uses camelCase
   - [ ] Transformation layer implemented
   - [ ] API payload uses snake_case

4. ✅ **API Integration:**
   - [ ] Endpoint called correctly
   - [ ] Error handling implemented
   - [ ] Success handling implemented

5. ✅ **Validation:**
   - [ ] Client-side validation works
   - [ ] Error messages displayed correctly

6. ✅ **Audit Trail:**
   - [ ] Debug mode logging implemented
   - [ ] Logs follow format: `[Auth] Password change ...`

7. ✅ **Reporting:**
   - [ ] Report completion to Team 10
   - [ ] Ready for QA testing

---

## 📋 Coordination Timeline

### **Phase 1: Team 20 Implementation**
- **Duration:** 1-2 days
- **Deliverable:** Endpoint `PUT /users/me/password` operational
- **Gate:** Team 20 reports completion → Team 30 can start

### **Phase 2: Team 30 Implementation**
- **Duration:** 1-2 days (after Team 20 completion)
- **Deliverable:** PasswordChangeForm component integrated
- **Gate:** Team 30 reports completion → Team 50 can test

### **Phase 3: QA Testing**
- **Duration:** 1 day (after Team 30 completion)
- **Deliverable:** QA report with test results
- **Gate:** Team 50 reports results → Phase complete or fixes needed

---

## 🔗 Related Documents

1. **Architectural Decision:** `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_20_PASSWORD_CHANGE_APPROVED.md`
2. **Frontend Instructions:** `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_30_PASSWORD_CHANGE_APPROVED.md`
3. **QA Protocol:** `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_50_PASSWORD_CHANGE_QA_PROTOCOL.md`
4. **Blueprint:** `_COMMUNICATION/team_31/team_31_staging/D15_PROF_VIEW.html`
5. **CSS Standards:** `documentation/07-POLICIES/TT2_CSS_STANDARDS_PROTOCOL.md`
6. **JS Standards:** `documentation/07-POLICIES/TT2_JS_STANDARDS_PROTOCOL.md`
7. **Official Page Tracker:** `documentation/01-ARCHITECTURE/TT2_OFFICIAL_PAGE_TRACKER.md`

---

## 📋 Reporting Requirements

### **Team 20 Reporting:**

**Upon Completion:**
- [ ] Create completion report: `TEAM_20_TO_TEAM_10_PASSWORD_CHANGE_COMPLETE.md`
- [ ] Include endpoint URL and payload structure
- [ ] Include test results
- [ ] Notify Team 10: "Endpoint ready, Team 30 can start"

**If Issues:**
- [ ] Report blocking issues immediately to Team 10
- [ ] Provide detailed error messages and logs

### **Team 30 Reporting:**

**Upon Completion:**
- [ ] Create completion report: `TEAM_30_TO_TEAM_10_PASSWORD_CHANGE_COMPLETE.md`
- [ ] Include component location and integration details
- [ ] Include test results (manual testing)
- [ ] Notify Team 10: "Component ready, Team 50 can test"

**If Issues:**
- [ ] Report blocking issues immediately to Team 10
- [ ] Provide detailed error messages and screenshots

---

## ✅ Sign-off Criteria

**Phase Complete when:**

1. ✅ **Team 20:**
   - [ ] Endpoint implemented and tested
   - [ ] OpenAPI Spec updated
   - [ ] Completion report submitted

2. ✅ **Team 30:**
   - [ ] Component implemented and integrated
   - [ ] Transformation layer implemented
   - [ ] Completion report submitted

3. ✅ **Team 50:**
   - [ ] QA testing completed
   - [ ] All test cases pass
   - [ ] QA report submitted

---

## 🎯 Next Steps After Completion

1. **Team 10:**
   - Update Official Page Tracker (D15_PROF_VIEW Password Change → COMPLETE)
   - Update Progress Log
   - Notify all teams of completion

2. **Continue Phase 1.3:**
   - D24_API_VIEW integration
   - D25_SEC_VIEW integration

3. **Phase 1.6:**
   - Visual Fidelity & Design Fixes

---

**Team 10 (The Gateway)**  
**Date:** 2026-01-31  
**log_entry | Team 10 | PASSWORD_CHANGE_COORDINATION | TEAM_20_TEAM_30 | P0 | ACTION_REQUIRED | 2026-01-31**

---

**Status:** ⏸️ **ACTION REQUIRED - P0 CRITICAL**  
**Next Step:** Team 20 to start implementation, then Team 30
