# 📡 שאילתה אדריכלית: Team 00 / Gemini Bridge | Session 01

**From:** Team 10 (The Gateway)  
**To:** Team 00 (Lead Architect) / Gemini Bridge (Control Bridge)  
**Date:** 2026-01-31  
**Subject:** ARCHITECTURAL DECISION REQUEST | JWT Structure - Complete Details  
**Priority:** 🔴 **HIGH** - Blocking Task 20.1.5 (AuthService)

---

## 📋 הקשר

צוות 20 (Backend) מבקש הבהרות מפורטות על מבנה JWT. יש תשובה חלקית ב-GIN_2026_008, אך חסרות החלטות על מספר נושאים קריטיים.

**מסמך רלוונטי:** `documentation/06-GOVERNANCE_&_COMPLIANCE/gins/GIN_2026_008_TECHNICAL_CLARIFICATIONS.md`  
**מסמך שאלות מפורט:** `documentation/05-REPORTS/artifacts_SESSION_01/TEAM_20_QUESTION_2_REMAINING_CLARIFICATIONS.md`

---

## ✅ מה כבר מוגדר

מתוך `GIN_2026_008`:
```
## 2. אבטחה
* **JWT:** sub (ULID), email, role, exp (24h).
```

**מה יש לנו:**
- ✅ JWT Claims: `sub` (ULID), `email`, `role`, `exp` (24h)
- ✅ Access Token Expiration: 24 שעות
- ✅ Token Response Format: מוגדר ב-Evidence של Team 20 (`access_token`, `token_type: "bearer"`, `expires_at`)
- ✅ Authorization Header: `Authorization: Bearer {token}`

---

## ❓ מה חסר - נדרשת החלטה אדריכלית

### 1. Refresh Token Mechanism 🔴 **קריטי**

**השאלות הספציפיות:**
1. **האם יש refresh token mechanism?**
   - האם יש refresh token בכלל?
   - או ש-access token (24h) מספיק?

2. **אם יש refresh token:**
   - **Storage:** איפה מאוחסן? (DB table? Redis? Cookie? HTTP-only cookie?)
   - **Expiration:** מה ה-expiration של refresh token? (7 ימים? 30 ימים? ללא expiration?)
   - **Rotation:** האם יש token rotation? (refresh token חדש בכל refresh?)
   - **Revocation:** איך מבטלים refresh token? (blacklist? DB flag?)

3. **Security:**
   - האם refresh token מאוחסן ב-HTTP-only cookie?
   - האם יש CSRF protection?
   - האם refresh token מוצפן?

**השפעה:**
- משפיע על Task 20.1.5 (AuthService) - האם ליצור refresh token logic
- משפיע על Task 20.1.8 (Routes) - האם ליצור `/auth/refresh` endpoint
- משפיע על Frontend (Team 30) - האם לטפל ב-refresh token

---

### 2. JWT Algorithm & Secret 🔴 **קריטי**

**השאלות הספציפיות:**
1. **Algorithm:**
   - HS256? (symmetric, simple)
   - RS256? (asymmetric, more secure)
   - ES256? (elliptic curve, modern)

2. **Secret Storage:**
   - Environment variable? (`JWT_SECRET_KEY`?)
   - Secrets manager? (AWS Secrets Manager? HashiCorp Vault?)
   - אורך מינימלי של secret? (256 bits? 512 bits?)

**השפעה:**
- משפיע על Task 20.1.5 (AuthService) - איך ליצור ולאמת tokens
- משפיע על Security - איזה level של אבטחה

**המלצה זמנית (עד לקבלת החלטה):**
- Algorithm: `HS256`
- Secret: `JWT_SECRET_KEY` environment variable
- Secret Length: מינימום 256 bits (32 bytes), מומלץ 512 bits (64 bytes)

---

### 3. Token Blacklist / Revocation 🟡 **בינוני**

**השאלות הספציפיות:**
1. **האם צריך mechanism לחסימת tokens?**
   - **אפשרות א:** אין blacklist - tokens תקפים עד expiration
   - **אפשרות ב:** יש blacklist - איך לטפל?
     - DB table? (`revoked_tokens`?)
     - Redis? (TTL matching token expiration)
     - איך לטפל ב-logout? (להכניס ל-blacklist?)

2. **Security:**
   - האם צריך יכולת לבטל tokens שנחשפו?
   - מה ה-performance impact של blacklist check?

**השפעה:**
- משפיע על Task 20.1.5 (AuthService) - logout logic
- משפיע על Task 20.1.8 (Routes) - `/auth/logout` endpoint
- משפיע על Security - ability to revoke compromised tokens

**הערה:** ב-`password_reset_requests` יש status `REVOKED`, אבל זה לא רלוונטי ל-JWT tokens.

**המלצה זמנית (עד לקבלת החלטה):**
- אין blacklist mechanism (לעת עתה)
- Logout רק להסיר token מ-client-side

---

### 4. Additional Claims 🟢 **נמוך**

**השאלות הספציפיות:**
1. **Claims נוספים:**
   - `iat` (issued at) - האם לכלול? (מומלץ - helps with debugging, auditing)
   - `jti` (JWT ID) - האם לכלול? (useful for blacklist)
   - `nbf` (not before) - האם צריך?

**השפעה:**
- משפיע על Task 20.1.5 (AuthService) - איך לבנות payload
- משפיע על Token size
- משפיע על Functionality

**המלצה זמנית (עד לקבלת החלטה):**
- כלול `iat` (issued at) - מומלץ
- `jti` רק אם יוחלט על blacklist
- `nbf` לא נדרש

---

### 5. Token Storage (Client-Side) 🟢 **נמוך (יותר Frontend)**

**השאלה:**
איפה Frontend צריך לאחסן tokens?
- localStorage? (simple, but XSS risk)
- sessionStorage? (cleared on tab close)
- httpOnly cookie? (most secure, but needs CSRF protection)
- In-memory only? (most secure, but lost on refresh)

**השפעה:**
- יותר רלוונטי ל-Frontend (Team 30)
- אבל צריך לדעת עבור documentation ו-security considerations

**הערה:** זה יטופל עם Team 30, אבל עדיף החלטה מראש.

---

## 🎯 השפעה על פיתוח

**משימה חסומה:** Task 20.1.5 (Authentication Service)

**מה יכול להתקדם עכשיו (עם הנחות זמניות):**
- ✅ יצירת access token עם claims: `sub` (ULID), `email`, `role`, `exp` (24h), `iat`
- ✅ JWT encoding/decoding עם HS256
- ✅ JWT validation middleware
- ✅ Token response format (כבר מוגדר)

**מה ממתין להחלטה:**
- ⚠️ Refresh token endpoint (`POST /auth/refresh`)
- ⚠️ Refresh token storage strategy
- ⚠️ Token blacklist mechanism
- ⚠️ Final JWT algorithm & secret storage strategy

---

## 📡 תגובה נדרשת

**פורמט מועדף:**
- עדכון ל-`GIN_2026_008_TECHNICAL_CLARIFICATIONS.md` או יצירת GIN חדש
- או תשובה ישירה שתעודכן ב-GIN

**דחיפות:** גבוהה - צוות 20 ממתין להחלטה כדי להמשיך עם AuthService.

**הערה:** צוות 20 יכול להמשיך עם הנחות זמניות (HS256, no refresh token, no blacklist), אבל עדיף החלטה סופית לפני production.

---

**Prepared by:** Team 10 (The Gateway)  
**Status:** ⏳ **AWAITING ARCHITECTURAL DECISION**  
**Next:** Will update Team 20 upon receipt of decision
