# 🔴 CLARIFICATION REQUEST | Team 20 - Blocked Tasks

**From:** Team 20 (Backend)  
**To:** Team 10 (The Gateway)  
**Subject:** CLARIFICATION REQUEST | Questions 1 & 2 - Blocking Tasks 20.1.2, 20.1.3, 20.1.5  
**Date:** 2026-01-31  
**Session:** SESSION_01 - Phase 1.1  
**Status:** ⚠️ **BLOCKED - AWAITING CLARIFICATION**

---

## 📋 סיכום מצב

**משימות שהושלמו:**
- ✅ Task 20.1.1: DB Infrastructure Setup (COMPLETED)
- ✅ Task 20.1.4: Encryption Service Implementation (COMPLETED)

**משימות חסומות:**
- 🔴 Task 20.1.2: SQLAlchemy Models (BLOCKED - Question 1)
- 🔴 Task 20.1.3: Pydantic Schemas (BLOCKED - Question 1)
- 🔴 Task 20.1.5: Authentication Service (BLOCKED - Question 2)

---

## ❓ שאלה 1: אסטרטגיית מזהים (UUID vs ULID)

### השאלה
האם UUID ב-DB צריך להיות מומר ל-ULID ב-API, או שיש שדה נפרד `external_ulid`?

### הקשר והשפעה
- **מקור הסתירה:** 
  - SQL Schema (`PHX_DB_SCHEMA_V2.5_FULL_DDL.sql`) משתמש ב-UUID כ-Primary Key
  - OpenAPI Spec (`OPENAPI_SPEC_V2_FINAL.yaml`) מציין `external_ulids` עם pattern ULID
  - Field Maps מציינים "Internal IDs: BIGINT | External ULIDs: VARCHAR(26)"

- **השפעה על המשימות:**
  - **Task 20.1.2:** SQLAlchemy Models - צריך להבין איך להגדיר את ה-ID fields
  - **Task 20.1.3:** Pydantic Schemas - צריך להבין איך להחזיר ULID ב-responses

- **השפעה על הקוד:**
  - כל ה-models יצטרכו להכיל שדה ULID או conversion logic
  - כל ה-API responses יצטרכו להחזיר ULID במקום UUID
  - כל ה-API requests יצטרכו לקבל ULID במקום UUID

### קבצים רלוונטיים
1. **SQL Schema (מקור האמת):**
   - `documentation/04-ENGINEERING_&_ARCHITECTURE/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql`
   - שורות רלוונטיות: 453-512 (users table), 517-565 (password_reset_requests), 1114-1176 (user_api_keys)

2. **OpenAPI Spec:**
   - `documentation/05-DEVELOPMENT_&_CONTRACTS/OPENAPI_SPEC_V2_FINAL.yaml`
   - שורות רלוונטיות: 56 (UserResponse.external_ulids pattern)

3. **Field Maps (דוגמאות):**
   - `documentation/01-ARCHITECTURE/LOGIC/WP_20_10_FIELD_MAP_SYSTEM_SETTINGS.md` - מציין BIGINT internal + ULID external
   - `documentation/01-ARCHITECTURE/LOGIC/WP_20_09_C_FIELD_MAP_PLAYBOOKS.md` - מציין BIGINT internal + ULID external

4. **Task Breakdown:**
   - `documentation/05-REPORTS/artifacts_SESSION_01/PHASE_1_TASK_BREAKDOWN.md`
   - שורות רלוונטיות: 126-130 (סתירה 1: אסטרטגיית מזהים), 562-565 (שאלה 1)

### אפשרויות
**אפשרות א:** UUID ב-DB מומר ל-ULID ב-API (conversion layer)
- Pros: שדה אחד ב-DB, ULID ב-API
- Cons: צריך conversion logic בכל query/response

**אפשרות ב:** שדה נפרד `external_ulid` ב-DB
- Pros: ברור ופשוט, אין conversion בזמן ריצה
- Cons: שני שדות ב-DB, צריך לוודא סינכרון

**אפשרות ג:** BIGINT internal + ULID external (כמו ב-Field Maps)
- Pros: עקבי עם Field Maps אחרים
- Cons: צריך לשנות את ה-SQL Schema מ-UUID ל-BIGINT

### נדרש מ
Team 00 / Gemini Bridge (Control Bridge) - החלטה אדריכלית

---

## ❓ שאלה 2: מבנה JWT Payload

### השאלה
מה המבנה המדויק של ה-JWT payload? (claims, expiration, refresh token mechanism?)

### הקשר והשפעה
- **מקור הפער:**
  - OpenAPI Spec לא מגדיר מבנה JWT
  - אין תיעוד על refresh token mechanism
  - אין הגדרה של claims (sub, exp, iat, etc.)

- **השפעה על המשימות:**
  - **Task 20.1.5:** Authentication Service - צריך להבין איך לבנות JWT tokens
  - Frontend integration - צריך להבין איך לטפל ב-tokens

- **השפעה על הקוד:**
  - AuthService יצטרך ליצור tokens עם structure מסוים
  - Middleware יצטרך לוודא tokens עם claims מסוימים
  - Refresh token flow (אם קיים) צריך להיות מוגדר

### קבצים רלוונטיים
1. **OpenAPI Spec:**
   - `documentation/05-DEVELOPMENT_&_CONTRACTS/OPENAPI_SPEC_V2_FINAL.yaml`
   - שורות רלוונטיות: 15-19 (`/auth/login` endpoint - לא מפורט)

2. **Task Breakdown:**
   - `documentation/05-REPORTS/artifacts_SESSION_01/PHASE_1_TASK_BREAKDOWN.md`
   - שורות רלוונטיות: 142-145 (פער 2: JWT Structure לא מוגדר), 567-570 (שאלה 2)

3. **UI Blueprints:**
   - `documentation/03-DESIGN_UX_UI/GIN_004_UI_ALIGNMENT_SPEC.md`
   - שורות רלוונטיות: 119-123 (D15 Login/Register flow)

### מה צריך להגדיר
1. **JWT Claims Structure:**
   - `sub` (subject) - מה המזהה? UUID? ULID? username?
   - `exp` (expiration) - כמה זמן? (default: 15 minutes? 1 hour?)
   - `iat` (issued at) - timestamp
   - `role` - user role (USER, ADMIN, SUPERADMIN)?
   - `email` - user email?
   - claims נוספים?

2. **Refresh Token:**
   - האם יש refresh token mechanism?
   - איך refresh token מאוחסן? (DB? Redis? Cookie?)
   - מה ה-expiration של refresh token?
   - איך refresh flow עובד?

3. **Token Storage:**
   - איפה tokens מאוחסנים? (localStorage? sessionStorage? httpOnly cookie?)
   - האם יש token blacklist mechanism?

### נדרש מ
Team 00 / Gemini Bridge (Control Bridge) - החלטה אדריכלית

---

## 📝 פורמט להעתקה (Copy-Paste Format)

```text
From: Team 20 (Backend)
To: Team 10 (The Gateway)
Subject: CLARIFICATION REQUEST | Questions 1 & 2 - Blocking Tasks 20.1.2, 20.1.3, 20.1.5
Date: 2026-01-31
Status: ⚠️ BLOCKED - AWAITING CLARIFICATION

---

❓ QUESTION 1: Identity Strategy (UUID vs ULID)
Context: SQL Schema uses UUID as PK, but OpenAPI shows external_ulids pattern.
Impact: Blocks Tasks 20.1.2 (Models) and 20.1.3 (Schemas).
Files:
- documentation/04-ENGINEERING_&_ARCHITECTURE/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql (lines 453-512, 517-565, 1114-1176)
- documentation/05-DEVELOPMENT_&_CONTRACTS/OPENAPI_SPEC_V2_FINAL.yaml (line 56)
- documentation/05-REPORTS/artifacts_SESSION_01/PHASE_1_TASK_BREAKDOWN.md (lines 126-130, 562-565)
Required from: Team 00 / Gemini Bridge

❓ QUESTION 2: JWT Structure
Context: JWT payload structure not defined (claims, expiration, refresh token).
Impact: Blocks Task 20.1.5 (Authentication Service).
Files:
- documentation/05-DEVELOPMENT_&_CONTRACTS/OPENAPI_SPEC_V2_FINAL.yaml (lines 15-19)
- documentation/05-REPORTS/artifacts_SESSION_01/PHASE_1_TASK_BREAKDOWN.md (lines 142-145, 567-570)
Required from: Team 00 / Gemini Bridge

log_entry | [Team 20] | CLARIFICATION_REQUEST | Q1_Q2 | BLOCKED
```

---

## ✅ פעולות שבוצעו

1. ✅ הושלמו משימות 20.1.1 ו-20.1.4
2. ✅ זוהו השאלות החסומות
3. ✅ נאספו כל הקבצים הרלוונטיים
4. ✅ נכתב פירוט מלא של כל שאלה והשפעתה

---

## 🎯 צעדים הבאים

1. **ממתין לתשובות:** על שאלות 1 ו-2 מ-Team 00 / Gemini Bridge (דרך Team 10)
2. **לאחר קבלת תשובות:** אמשיך עם Tasks 20.1.2, 20.1.3, 20.1.5
3. **בינתיים:** יכול להמשיך עם משימות לא חסומות (אם יש)

---

**log_entry | [Team 20] | CLARIFICATION_REQUEST | Q1_Q2 | BLOCKED**

**Prepared by:** Team 20 (Backend)  
**Status:** ⚠️ **AWAITING CLARIFICATION**  
**Next:** Proceed with blocked tasks after receiving answers
