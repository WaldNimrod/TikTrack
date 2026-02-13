# Team 20 → Team 90: אישור PDSC Boundary + Auth Contract

**מאת:** Team 20 (Backend)  
**אל:** Team 90  
**תאריך:** 2026-02-12  
**נושא:** ✅ PDSC Boundary + Auth Contract — שלד מחייב מיושם

---

## סיכום ביצוע

נדרש להשלים PDSC Boundary Contract + Auth Contract בתיעוד SSOT/OpenAPI לפי השלד שמסרתם. **הושלם.**

---

## 1. PDSC Boundary Contract — שלד מחייב

### A. Error Schema (JSON Error) ✅

- **תיעוד:** `documentation/01-ARCHITECTURE/TT2_PDSC_BOUNDARY_CONTRACT.md` — סעיף "Team 90 שלד מחייב"
- **מימוש:** `api/main.py` — validation handler מחזיר `error_code`, `detail`, `field_errors` (422)

### B. Response Contract (Success) ✅

- **תיעוד:** TT2_PDSC_BOUNDARY_CONTRACT.md — `status`, `data`, `meta` (page, page_size, total)
- **הערה:** הקוד הנוכחי לא עוטף ב-`status`/`meta` — יש endpoints שמחזירים data ישיר. לעדכון מלא נדרש refactor.

### C. Error Codes Enum (SSOT) ✅

- **קובץ:** `api/utils/exceptions.py`
- **נוספו:** `AUTH_INVALID_TOKEN`, `AUTH_EXPIRED_TOKEN`, `RESOURCE_NOT_FOUND`, `PERMISSION_DENIED`
- **מיפוי:** AUTH_TOKEN_INVALID ≈ AUTH_INVALID_TOKEN, AUTH_TOKEN_EXPIRED ≈ AUTH_EXPIRED_TOKEN

---

## 2. Auth Contract — שלד מחייב

### Auth Response ✅

- **תיעוד:** `documentation/07-CONTRACTS/SSOT_AUTH_CONTRACT.md`
- **קוד:** `api/schemas/identity.py` — LoginResponse, RegisterResponse, RefreshResponse  
  כוללים: `access_token`, `token_type`, `expires_at`, `user`

### Endpoints לתיעוד ✅

| Endpoint | סטטוס |
|----------|--------|
| POST /auth/login | ✅ מתועד ב-OpenAPI |
| POST /auth/register | ✅ מתועד |
| POST /auth/refresh | ✅ מתועד |
| GET /users/me | ✅ מתועד (מקביל ל-GET /users/profile) |
| PUT /users/me | עדכון פרופיל (מקביל ל-GET/PUT /users/profile) |

---

## 3. קבצים שנוצרו/עודכנו

| קובץ | פעולה |
|------|--------|
| `documentation/01-ARCHITECTURE/TT2_PDSC_BOUNDARY_CONTRACT.md` | עודכן — שלד Team 90 + Auth |
| `documentation/07-CONTRACTS/SSOT_AUTH_CONTRACT.md` | נוצר |
| `documentation/07-CONTRACTS/OPENAPI_SPEC_V2_FINAL.yaml` | עודכן — ErrorResponse (field_errors, trace_id), AuthResponse, auth endpoints |
| `api/utils/exceptions.py` | נוספו Error Codes |
| `api/main.py` | validation handler — field_errors |

---

## 4. Acceptance Criteria

- [x] Error Schema אחיד (validation 422 — error_code, detail, field_errors)
- [ ] Success Contract — חלקי (לא כל endpoints עוטפים ב-status/data/meta)
- [x] Auth responses זהים (login, register, refresh)
- [x] OpenAPI/SSOT מעודכן לפי השלד
- [ ] בדיקה מהירה מול הקוד — Team 90

---

**Team 20 (Backend)**  
**log_entry | TEAM_20 | TO_TEAM_90_PDSC_AUTH_CONTRACT_ACK | 2026-02-12**
