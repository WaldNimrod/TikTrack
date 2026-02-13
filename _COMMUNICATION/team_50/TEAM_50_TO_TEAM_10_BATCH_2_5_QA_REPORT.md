# Team 50 → Team 10: דוח QA בץ 2.5 — Redirect + User Icon (ADR-017)
**מאת:** Team 50 (QA & Fidelity)
**אל:** Team 10 (The Gateway)
**תאריך:** 2026-02-13
**מקור:** BATCH_2_5_COMPLETIONS_MANDATE.md (ADR-017 §3) — סגירת בץ 2.5 (QA)
---
## 1. Scope חובה
| # | קריטריון | סטטוס | הערה |
|---|----------|-------|------|
| - | Redirect ל-Home לכל אנונימי בעמוד שאינו Open | **PASS** | אנונימי ב-/trading_accounts הופנה ל-/ |
| - | User Icon: WARNING (מנותק) | **PASS** | .user-icon--alert / .user-profile-link--alert נוכח (מנותק) |
| - | User Icon: SUCCESS (מחובר) | **SKIP** | Login failed |
| - | 0 SEVERE בקונסול | **FAIL** | 6 SEVERE נמצאו |
---
## 2. סיכום
**2/4 PASS.** 1 קריטריון/ים נכשלו.

## 3. SEVERE שנמצאו (לטיפול)

| # | רמת לוג | הודעה |
|---|---------|-------|
| 1 | SEVERE | http://127.0.0.1:8080/src/cubes/shared/tableFormatters.js 0:0 Uncaught SyntaxError: Cannot use import statement outside  |
| 2 | SEVERE | http://127.0.0.1:8080/api/v1/auth/login - Failed to load resource: the server responded with a status of 500 (Internal S |
| 3 | SEVERE | http://127.0.0.1:8080/src/utils/audit.js 98:12 "❌ [Phoenix Audit][Auth] ERROR: Login failure" Error: HTTP 500: Internal  |
| 4 | SEVERE | http://127.0.0.1:8080/src/utils/audit.js 98:12 "❌ [Phoenix Audit][ErrorHandler] ERROR: Network/CORS error" Error: HTTP 5 |
| 5 | SEVERE | http://127.0.0.1:8080/src/utils/audit.js 98:12 "❌ [Phoenix Audit][Auth] ERROR: Login failed" Object |
| 6 | SEVERE | http://127.0.0.1:8080/src/cubes/shared/tableFormatters.js 0:0 Uncaught SyntaxError: Cannot use import statement outside  |


---
**Base URL:** http://127.0.0.1:8080
**Evidence:** documentation/05-REPORTS/artifacts_SESSION_01/batch-2-5-qa-artifacts/
**log_entry | TEAM_50 | BATCH_2_5_QA_REPORT | TO_TEAM_10 | 2026-02-13**