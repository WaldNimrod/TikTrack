# ❓ Question 2: JWT Structure - Remaining Clarifications Needed

**From:** Team 20 (Backend)  
**To:** Team 10 (The Gateway)  
**Subject:** FOLLOW-UP CLARIFICATION REQUEST | Question 2 - Additional Details Needed  
**Date:** 2026-01-31  
**Session:** SESSION_01 - Phase 1.1  
**Status:** ⚠️ **PARTIAL ANSWER - NEEDS CLARIFICATION**

---

## ✅ מה שכבר התקבל (GIN-2026-008)

**JWT Claims:**
- `sub`: ULID (user external identifier)
- `email`: User email
- `role`: User role (USER, ADMIN, SUPERADMIN)
- `exp`: 24 hours expiration

**Provider:** Mock Service (Log only) for Step 1

---

## ❓ מה עדיין לא ברור

### 1. Refresh Token Mechanism
**שאלה:** האם יש refresh token mechanism?
- **אפשרות א:** אין refresh token - רק access token עם 24h expiration
- **אפשרות ב:** יש refresh token - איך זה עובד?
  - איפה refresh token מאוחסן? (DB? Redis? Cookie?)
  - מה ה-expiration של refresh token? (7 days? 30 days?)
  - איך refresh flow עובד? (POST /auth/refresh?)

**השפעה:** משפיע על:
- Task 20.1.5: Authentication Service - האם ליצור refresh token logic
- Task 20.1.8: Routes - האם ליצור `/auth/refresh` endpoint
- Frontend - האם לטפל ב-refresh token

---

### 2. JWT Algorithm & Secret
**שאלה:** איזה אלגוריתם ואיך לאחסן את ה-secret?
- **Algorithm:** HS256? RS256? ES256?
- **Secret Storage:** 
  - Environment variable? (`JWT_SECRET_KEY`?)
  - Secrets manager? (AWS Secrets Manager? HashiCorp Vault?)
  - אורך מינימלי של secret? (256 bits? 512 bits?)

**השפעה:** משפיע על:
- Task 20.1.5: Authentication Service - איך ליצור ולאמת tokens
- Security - איזה level של אבטחה

---

### 3. Token Storage (Client-Side)
**שאלה:** איפה Frontend צריך לאחסן tokens?
- **אפשרות א:** localStorage (simple, but XSS risk)
- **אפשרות ב:** sessionStorage (cleared on tab close)
- **אפשרות ג:** httpOnly cookie (most secure, but needs CSRF protection)
- **אפשרות ד:** In-memory only (most secure, but lost on refresh)

**השפעה:** משפיע על:
- Frontend implementation (Team 30)
- Security considerations
- CSRF protection needs

**הערה:** זה יותר רלוונטי ל-Frontend, אבל צריך לדעת עבור documentation

---

### 4. Token Blacklist / Revocation
**שאלה:** האם צריך mechanism לחסימת tokens?
- **אפשרות א:** אין blacklist - tokens תקפים עד expiration
- **אפשרות ב:** יש blacklist - איך לטפל?
  - DB table? (`revoked_tokens`?)
  - Redis? (TTL matching token expiration)
  - איך לטפל ב-logout? (להכניס ל-blacklist?)

**השפעה:** משפיע על:
- Task 20.1.5: Authentication Service - logout logic
- Task 20.1.8: Routes - `/auth/logout` endpoint
- Security - ability to revoke compromised tokens

---

### 5. Additional Claims
**שאלה:** האם צריך claims נוספים?
- `iat` (issued at) - האם לכלול?
- `jti` (JWT ID) - האם לכלול? (useful for blacklist)
- `nbf` (not before) - האם צריך?
- Custom claims נוספים?

**השפעה:** משפיע על:
- Task 20.1.5: Authentication Service - איך לבנות payload
- Token size
- Functionality

---

### 6. Token Response Format
**שאלה:** איך להחזיר token ב-response?
- **Format:** 
  ```json
  {
    "access_token": "eyJ...",
    "token_type": "bearer",
    "expires_at": "2026-02-01T12:00:00Z"
  }
  ```
- **Refresh Token:** האם להחזיר גם refresh_token אם קיים?
- **User Info:** האם להחזיר user info ב-login response? (כמו ב-LoginResponse schema)

**השפעה:** משפיע על:
- Task 20.1.5: Authentication Service - response format
- Task 20.1.8: Routes - response structure
- Frontend - איך לטפל ב-response

---

## 📋 סיכום שאלות פתוחות

| # | נושא | חשיבות | השפעה |
|---|------|---------|--------|
| 1 | Refresh Token | גבוהה | משפיע על AuthService ו-Routes |
| 2 | JWT Algorithm & Secret | קריטית | משפיע על Security ו-AuthService |
| 3 | Token Storage (Client) | נמוכה | יותר רלוונטי ל-Frontend |
| 4 | Token Blacklist | בינונית | משפיע על logout ו-security |
| 5 | Additional Claims | נמוכה | Nice to have |
| 6 | Token Response Format | בינונית | משפיע על API contract |

---

## 🎯 מה צריך להמשיך עכשיו

**יכול להמשיך עם:**
- Task 20.1.5: Authentication Service - עם הנחות סבירות:
  - No refresh token (רק access token)
  - HS256 algorithm
  - JWT_SECRET_KEY environment variable
  - No blacklist (לעת עתה)
  - Include `iat` claim

**צריך להמתין ל:**
- שאלות 1, 2, 4 (אם חשוב למימוש)

---

## 📝 פורמט להעתקה (Follow-up Request)

```text
From: Team 20 (Backend)
To: Team 10 (The Gateway)
Subject: FOLLOW-UP CLARIFICATION | Question 2 - JWT Additional Details
Date: 2026-01-31
Status: ⚠️ PARTIAL ANSWER - NEEDS CLARIFICATION

---

❓ FOLLOW-UP QUESTIONS for Question 2 (JWT Structure):

1. Refresh Token: Is there a refresh token mechanism? If yes, how does it work?
2. JWT Algorithm & Secret: Which algorithm (HS256/RS256)? How to store secret?
3. Token Blacklist: Is token revocation/blacklist needed for logout?
4. Additional Claims: Should we include iat, jti, or other claims?
5. Token Response Format: Confirm response format matches LoginResponse schema?

Current Answer (GIN-2026-008): sub (ULID), email, role, exp (24h).

Can proceed with assumptions, but prefer clarification for production-ready implementation.

log_entry | [Team 20] | FOLLOW_UP_CLARIFICATION | Q2_DETAILS | PENDING
```

---

**log_entry | [Team 20] | FOLLOW_UP_CLARIFICATION | Q2_DETAILS | PENDING**

**Prepared by:** Team 20 (Backend)  
**Status:** ⚠️ **PARTIAL ANSWER - CAN PROCEED WITH ASSUMPTIONS**  
**Next:** Awaiting clarification OR proceed with reasonable assumptions
