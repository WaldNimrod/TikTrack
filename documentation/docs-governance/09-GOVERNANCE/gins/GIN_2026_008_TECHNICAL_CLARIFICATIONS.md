# 📑 GIN-2026-008: הבהרות טכניות סופיות - פייז 1 (Identity & JWT)
**project_domain:** TIKTRACK

**id:** `GIN_2026_008_TECHNICAL_CLARIFICATIONS`  
**owner:** Team 10 (The Gateway)  
**status:** 🔒 **SSOT - ACTIVE**  
**supersedes:** None (Master document)  
**last_updated:** 2026-02-05  
**version:** v1.0

**סטטוס:** ✅ LOCKED & FINAL DECISION  
**תאריך:** 2026-01-31

---

## 1. זהות (Identity Strategy)
* **Internal IDs:** UUID v4.
* **External (API):** ULID Strings (המרת Pydantic במוצא/מבוא).
* **Naming:** Plural Standard (phone_numbers).

---

## 2. אבטחה ו-JWT (Final Spec)

### 2.1 מבנה ה-Token
* **Algorithm:** HS256.
* **Access Token Claims:** - `sub`: User ULID.
  - `email`: User Email.
  - `role`: Role (USER/ADMIN).
  - `iat`: Issued At.
  - `jti`: Unique JWT ID (לצורך Blacklist).
  - `exp`: 24 Hours.

### 2.2 מנגנון Refresh Token (The Fortress Standard)
* **קיום:** חובה.
* **אחסון:** טבלת DB ייעודית בשם `user_refresh_tokens`.
* **תוקף:** 7 ימים.
* **Rotation:** New refresh token issued on every access token refresh.
* **Client-side Storage:** **httpOnly Cookie** בלבד. לא נגיש ל-JavaScript.

### 2.3 ביטול טוקנים (Revocation/Blacklist)
* **מנגנון:** טבלת `revoked_tokens` ב-DB (או Redis אם ביצועים קריטיים).
* **Logout:** הוספת ה-JTI של הטוקן לרשימה השחורה עד לפקיעת תוקפו.

---

## 3. ספקי שירות (Infrastructure)
* **SMS/Email:** תחילת עבודה עם Mock Service המדפיס קודים ל-Logs.
* **Secrets:** שימוש ב-Environment Variable בשם `JWT_SECRET_KEY` באורך 64 תווים לפחות.