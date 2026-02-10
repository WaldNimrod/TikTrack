# Team 50 → Team 30: בדיקה חוזרת — תיקון 422 (commission_value)

**אל:** Team 30 (Frontend Execution)  
**מאת:** Team 50 (QA & Fidelity)  
**תאריך:** 2026-02-10  
**מקור:** `TEAM_30_TO_TEAM_50_COMMISSION_VALUE_422_FIX.md`  
**סטטוס:** ⚠️ **בדיקה חוזרת הושלמה — שמירה מהטופס ב-E2E עדיין 422**

---

## 1. מה בוצע

- איתחול שרתים (`scripts/init-servers-for-qa.sh`)
- הרצת E2E (Phase 2) כולל **CRUD_D18_FormSave** — מילוי טופס (שם ברוקר, ערך עמלה `0.0035`, מינימום `1`) + לחיצה על "שמור"
- **בדיקת API ישירה:** POST ל-`/api/v1/brokers_fees` עם גוף זהה למה שהממשק אמור לשלוח:
  `{ broker, commission_type: "TIERED", commission_value: 0.0035, minimum: 1 }`

---

## 2. תוצאות

| בדיקה | תוצאה |
|--------|--------|
| **POST ישיר ל-API** (גוף כמו ממשק) | ✅ **201 Created** — ה-API מקבל את הגוף ומחזיר הצלחה |
| **E2E שמירה מהטופס** | ❌ **נכשל** — מופיע alert: `"HTTP 422: Unprocessable Entity"` |

**מסקנה:** הבעיה אינה ב-API עם הגוף הנכון. כשהבקשה נשלחת מהדפדפן (מהטופס), ה-API מחזיר 422 — כלומר גוף הבקשה או ההקשר מהממשק שונים.

---

## 3. המלצות

1. **לכידת גוף הבקשה מהממשק:**  
   ב-Network tab (F12) — לסנן לפי `brokers_fees`, ללחוץ "שמור" בטופס, ולבדוק את **Request Payload** של ה-POST. להשוות ל:  
   `{ "broker": "...", "commission_type": "TIERED", "commission_value": 0.0035, "minimum": 1 }`  
   (כולל שמות שדות ב-snake_case ו-`commission_value` כמספר.)

2. **לוג לפני שליחה:**  
   הקוד כבר כולל `maskedLog('[Brokers Fees] Sending data to API:', { ... })` — לוודא בלוגים מה נשלח בפועל (לאחר `reactToApi`), ולוודא שאין שדה חסר או ערך לא תקין.

3. **מבנה תגובת 422:**  
   FastAPI מחזיר 422 עם `detail` (מערך) ולא בהכרח `error.details`. אם רוצים להציג הודעת שגיאה מפורטת, לבדוק ב-Shared_Services גם `errorBody.detail` (מערך השגיאות של Pydantic).

---

## 4. ראיות ריצה

- **API ישיר (Node):**  
  `Status: 201`, `Body: {"id":"...","commission_value":"0.003500",...}`
- **ארטיפקטים E2E:**  
  `documentation/05-REPORTS/artifacts_SESSION_01/phase2-e2e-artifacts/console_logs.json` — `saveAlert`: `"HTTP 422: Unprocessable Entity"`

---

**Team 50 (QA & Fidelity)**  
**log_entry | TO_TEAM_30 | COMMISSION_VALUE_422_REVERIFICATION | SENT | 2026-02-10**
