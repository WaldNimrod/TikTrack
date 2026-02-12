# Team 10: צד השאת (Team 20 + 60) — פערים, השלמות והחלטות

**מאת:** Team 10 (The Gateway)  
**תאריך:** 2026-02-12  
**מטרה:** תמונה עדכנית של מה נדרש להשלמת כל הפערים והחוסרים בצד השאת; האם נדרשות החלטות או שאלות.

**עדכון (תגובת Team 90):** 1.2.2 נסגר רשמית; OPEN_TASKS עודכן. ראה TEAM_10_BACKEND_GAPS_20_60_TEAM_90_RESPONSE_ACK.md.

---

## 1. תמונת מצב — מה הושלם (20 + 60)

| צוות | משימה | סטטוס |
|------|--------|--------|
| **Team 60** | 1.2.2 — נעילת פורטים 8080/8082, CORS, Precision 20,6 | ✅ VERIFIED |
| **Team 60** | 1.2.3 — Seeders, `make db-test-clean`, Makefile targets | ✅ COMPLETE |
| **Team 20** | 1.2.3 — Python Seeders (seed_test_data.py, db_test_clean.py, seed_base_test_user.py, reduce_admin_base_to_minimal.py, db_remove_superfluous_users.py) | ✅ הושלם |
| **Team 20** | /cash_flows/currency_conversions | ✅ פעיל (QA מאומת) |

---

## 2. פערים וחוסרים — מה נדרש להשלמה

### 2.1 משימה 1.2.1 — Endpoints Summary + Conversions (Option A)

**סטטוס נוכחי:** 🟡 **חלקי**

**מה קיים בקוד (אימות):**
- `GET /api/v1/cash_flows/currency_conversions` — פעיל ואומת ב-QA.
- `GET /api/v1/trading_accounts/summary` — קיים ב-router ו-service.
- `GET /api/v1/brokers_fees/summary` — קיים ב-router ו-service.
- `GET /api/v1/cash_flows` מחזיר גם summary; קיים גם endpoint נפרד ל-summary ב-cash_flows.

**מה נדרש להשלמת הפער:**
1. **אימות ריצה** — וידוא שכל ה-Summary endpoints מגיבים תחת `/api/v1/...` (trading_accounts/summary, brokers_fees/summary, cash_flows/summary אם קיים כנתיב נפרד).
2. **תיעוד SSOT** — עדכון OpenAPI / מסמך חוזים כך שכל ה-Endpoints (Summary + Conversions) מתועדים ומסומנים כ-Option A.

**החלטה נדרשת?** **לא.** מדובר באימות ותיעוד — Team 20 (או Team 50 בבדיקות) יכולים להריץ ולוודא; Team 10 יכול להפנות לתיעוד SSOT.

---

### 2.2 משימה 1.2.2 — נעילת פורטים + Precision

**סטטוס במסמך Team 20:** ממתין.

**מצב בפועל:** Team 60 כבר אימת — פורטים 8080/8082, CORS, Precision 20,6 (דוח TEAM_60_TO_TEAM_10_OPEN_TASKS_STATUS_REPORT.md).

**מה נדרש להשלמת הפער:**
- **יישור תיעוד** — לסמן ב-OPEN_TASKS ש־1.2.2 הושלם.

**החלטה נדרשת?** **לא.**  
**סטטוס:** ✅ **סגור רשמית** — תגובת Team 90; OPEN_TASKS עודכן ל־✅ הושלם (TEAM_10_BACKEND_GAPS_20_60_TEAM_90_RESPONSE_ACK.md).

---

### 2.3 PDSC Boundary Contract

**סטטוס:** ✅ **החלטה התקבלה** — הודעת Team 90 אושרה על ידי האדריכלית.

**Scope מאושר:** **שלושת הרכיבים המלאים** — JSON Error Schema, Response Contract, Error Codes Enum. תיאום עם Team 30 לפני סיום (מנדט קיים).

**מה נדרש:** Team 20 — ביצוע לפי TEAM_10_TO_TEAM_20_PDSC_BOUNDARY_CONTRACT_MANDATE; אפשרות לקבל שלד מסמך PDSC מ-Team 90 (TEAM_10_TO_TEAM_90_PDSC_SKELETON_REQUEST.md).

---

### 2.4 חוזה Auth + SSOT/OpenAPI

**סטטוס:** ממתין.

**מה נדרש:**
- חוזה Response אחיד בכל auth endpoints: `access_token`, `token_type`, `expires_at`, `user`.
- Endpoints: `/auth/login`, `/auth/register`, `/auth/refresh`, `/users/me`, `/users/profile`.
- עדכון SSOT / OpenAPI כך שישקף את המבנה האחיד.

**החלטה נדרשת?** **לא.** המנדט ברור (TEAM_10_TO_TEAM_20_AUTH_CONTRACT_AND_SSOT_MANDATE.md).  
**שאלה אפשרית:** אם יש היום סטיות בקוד — האם מתקנים אותן כחלק מהמנדט או מתעדים חריגה מאושרת.

---

## 3. סיכום — מה נדרש להשלמת כל הפערים

| # | פער | פעולה נדרשת | החלטה/שאלה? |
|---|-----|-------------|--------------|
| 1 | 1.2.1 Summary endpoints | אימות ריצה של כל ה-Summary endpoints; עדכון תיעוד SSOT/OpenAPI | לא |
| 2 | 1.2.2 פורטים + Precision | יישור סטטוס במסמך — "הושלם (אימות Team 60)" | לא (או החלטה: לאמץ אימות 60 כסגירה) |
| 3 | PDSC Boundary Contract | Team 20: 3 רכיבים (JSON Error Schema + Response Contract + Error Codes); תיאום עם 30 | ✅ **החלטה התקבלה** — אדריכלית אישרה; scope: 3 רכיבים מלאים |
| 4 | Auth Contract + SSOT | Team 20: חוזה אחיד + עדכון OpenAPI/SSOT | לא (מנדט ברור) |

---

## 4. עדכון — החלטת אדריכלית (הודעת Team 90 אושרה)

1. **PDSC:** ✅ **החלטה התקבלה** — האדריכלית אישרה את הודעת Team 90. PDSC חוסם; scope: **שלושת הרכיבים המלאים**. Team 20 — ביצוע לפי מנדט; Team 90 — בקשת שלד מסמך PDSC להטמעה.

2. **1.2.2:** ✅ אומת Team 60; OPEN_TASKS עודכן ל־הושלם.

3. **1.2.1:** הוצאו הודעות ביצוע ל-Team 20 ו-Team 50 (אימות + עדכון SSOT).

---

**log_entry | TEAM_10 | BACKEND_SIDE_20_60_GAPS_AND_DECISIONS | 2026-02-12**
