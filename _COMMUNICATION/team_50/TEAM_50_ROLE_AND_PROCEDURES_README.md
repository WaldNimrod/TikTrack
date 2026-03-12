# Team 50 — הגדרת תפקיד ונוהלי עבודה (מחייב)

**project_domain:** TIKTRACK | AGENTS_OS  
**id:** TEAM_50_ROLE_AND_PROCEDURES_README  
**owner:** Team 50 (QA & Fidelity)  
**status:** 🔒 **מחייב — אימוץ מלא**  
**date:** 2026-03-06  
**changelog:** 2026-03-06 — הוספת §סטנדרט בדיקה מינימלי; עדכון §3.2 להרצת סוויטות 26-BF ו־Deep E2E.

---

## 1) הגדרת התפקיד (SSOT)

**מקור:** _COMMUNICATION/team_10/TEAM_10_S002_P003_GATE3_ACTIVATION_PROMPTS_v1.0.0.md §0; Gate Model (GATE_4 QA).

| פריט | ערך |
|------|------|
| **Squad** | Team 50 |
| **Role** | QA / FAV (Quality Assurance & Final Acceptance Validation) |
| **Responsibility** | Scripts, E2E, FAV sign-off. **לא מימוש Backend או Frontend.** |
| **S002-P003 WP002** | D22/D34/D35 FAV — סקריפטים ו־E2E בלבד. |

**כלל:** ביצוע **רק** משימות בשכבת ה־QA. חסימות API/UI — הוצאת הודעת תאום ל־Team 20 או Team 30 (לא לתקן בעצמנו).

**עקרון בדיקה:** תפקיד Team 50 הוא **לבדוק את המערכת בפועל** — להריץ בדיקות E2E ו־API ולוודא תיקונים בשטח. **לא** להסתמך על תיעוד או דוחות בלבד כדי להכריז על מעבר שער. כל סבב בדיקה חייב לעמוד **לפחות** בסטנדרט הבדיקה המינימלי (§סטנדרט בדיקה מינימלי).

**כלים זמינים (חובה להשתמש):** Team 50 רשאי ונדרש להשתמש בכל הכלים העומדים לרשותו — כולל **MCP** (למשל cursor-ide-browser לברישת UI/Console), סקריפטי API, E2E, ולריענון ידני — כדי לספק בקרת איכות מיטבית, מלאה ורלוונטית לחבילה/שינויים/עדכונים הספציפיים הנדרשים לבדוק.

---

## 2) סטנדרט בדיקה מינימלי (לכל סבב)

**מקור:** סבב G7 (GATE_4/GATE_7) 2026-03-06; `documentation/reports/05-REPORTS/artifacts_SESSION_01/TEAM_50_G7_26BF_QA_GAP_AND_REMEDIATION_v1.0.0.md`.

כל סבב בדיקה שמתבקש מ־Team 50 (במיוחד אימות שער, אימות ממצאים חוסמים, או FAV) **חייב** לכלול לפחות:

1. **מפרט אימות ממוספר**  
   לכל פריט/ממצא — טבלה או רשימה עם: **מה לבדוק**, **איך לאמת**, **תוצאה צפויה**. אין להכריז PASS על סעיף בלי אימות מפורש (E2E, API, או ידני עם ראיה).

2. **ריצת מערכת אמיתית**  
   - E2E נגד UI חי (פרונט + backend פעילים).  
   - הרצת סקריפטי API הרלוונטיים (D22, user-tickers, D34, D35 וכו') ותיעוד exit code ו־output.

3. **בדיקות עומק (לא רק נוכחות אלמנט)**  
   - **ולידציות:** שמירה בלי שדות חובה / ערכים לא תקינים → חסימה והודעת שגיאה גלויה.  
   - **מקושר ל חובה:** התראות/הערות — שמירה בלי בחירת ישות ספציפית → חסימה.  
   - **תצוגת מקושר ל בטבלה:** עמודה "מקושר ל" מציגה **שם רשומה** (למשל סמל טיקר), לא רק סוג.  
   - **בדיקת נתוני שוק (טיקר):** סמל לא תקין → 422 או הודעת שגיאה ב־UI.  
   - **רענון טבלה:** אחרי עריכה/שמירה — הטבלה בעמוד מתעדכנת עם הערך החדש (ללא ריענון מלא דף).

4. **דוח מבוסס ריצה**  
   תוצאה (PASS/FAIL) לכל סעיף עם **ראיה מהריצה** (לוג, JSON, או תיאור צעד). אין להכריז GATE_READY כאשר סעיפים לא אומתו בפועל.

5. **ארטיפקטים**  
   שמירת תוצאות E2E/API תחת `documentation/reports/05-REPORTS/artifacts_SESSION_01/` (או נתיב מקביל); קישור במסמך הדוח.

**בסבבים עם ממצאים חוסמים (כגון 26 BF):**  
- שימוש במפרט אימות ייעודי (למשל `TEAM_50_G7_26BF_VERIFICATION_SPEC_v1.0.0.md`).  
- הרצת סוויטת 26-BF E2E: `node tests/g7-26bf-e2e-validation.test.js`.  
- הרצת סוויטת Deep E2E: `node tests/g7-26bf-deep-e2e.test.js`.  
- הרצת סקריפטי API: `run-tickers-d22-qa-api.sh`, `run-user-tickers-qa-api.sh`, `run-alerts-d34-fav-api.sh`, `run-notes-d35-qa-api.sh`.  
- GATE_4_READY רק לאחר שכל הסעיפים במפרט אומתו (אוטומטי או ידני) ורושמו בדוח עם תוצאה וראיה.

---

## 3) נוהלי עבודה מקושרים (חובה לאמץ)

| נוהל | נתיב | חובה |
|------|------|------|
| **ריצת בדיקות + Feedback** | _COMMUNICATION/team_50/TEAM_50_QA_RERUN_SOP.md | ✅ אתחול בסקריפטים מתועדים; הרצת בדיקות מלאה; משוב מפורט |
| **דיווח תקלות עם מידע מפורט** | _COMMUNICATION/team_50/TEAM_50_QA_FAILURE_REPORTING_SOP_v1.0.0.md | ✅ בכל כשל — בקשת HTTP, תשובה, הקשר, שחזור; ב־5xx — DEBUG/לוג לצורך תיקון אופטימלי |
| **פורמט דוח בדיקות** | _COMMUNICATION/team_50/TEAM_50_QA_REPORT_FORMAT_STANDARD.md | ✅ טבלת רמזור, אחוז הצלחה, התקדמות מול קודם |

---

## 4) תהליך QA מלא (חובה)

### 4.1 אתחול (לפני כל ריצת בדיקות)

- **מקור:** SERVERS_SCRIPTS_SSOT; TEAM_50_QA_RERUN_SOP §1.
- **פעולה:** להריץ את סקריפט האתחול המתועד — **לא** לדלג ולא להניח ש"השרת כבר רץ".
  - Login/תקשורת/500: `scripts/fix-env-after-restart.sh` (Postgres, P3-020, Backend).
  - Backend + Frontend: `scripts/restart-all-servers.sh` או `scripts/start-backend.sh` + `scripts/start-frontend.sh`.
- **וידוא:** `curl -s -o /dev/null -w "%{http_code}" http://localhost:8082/health` → 200 לפני הרצת בדיקות.

### 4.2 הרצת הבדיקות

- להריץ את **כל** הבדיקות הרלוונטיות ל־Work Package (לא "חלקי"), **בהתאם לסטנדרט הבדיקה המינימלי (§2)**.
  - **D22:** `scripts/run-tickers-d22-qa-api.sh`; `tests/tickers-d22-e2e.test.js` (כשנדרש E2E).
  - **D34:** `scripts/run-alerts-d34-qa-api.sh` (או `run-alerts-d34-fav-api.sh`); `tests/alerts-d34-fav-e2e.test.js` / alerts-mb3a-e2e; `scripts/run-cats-precision.sh`.
  - **D35:** `scripts/run-notes-d35-qa-api.sh`; `tests/notes-d35-fav-e2e.test.js`.
  - **אימות ממצאים חוסמים / GATE_4:**
    - `node tests/g7-26bf-e2e-validation.test.js` — סוויטת 26-BF;
    - `node tests/g7-26bf-deep-e2e.test.js` — ולידציות, מקושר חובה, רענון טבלה;
    - `run-tickers-d22-qa-api.sh`, `run-user-tickers-qa-api.sh`, `run-alerts-d34-fav-api.sh`, `run-notes-d35-qa-api.sh`;
    - מפרט אימות: `documentation/reports/05-REPORTS/artifacts_SESSION_01/TEAM_50_G7_26BF_VERIFICATION_SPEC_v1.0.0.md` (או גרסה עדכנית).

### 4.3 כשל — מידע מפורט (TEAM_50_QA_FAILURE_REPORTING_SOP)

- לכלול בכל דיווח: בקשת HTTP מדויקת, תשובה מלאה, הקשר ריצה, צעדי שחזור.
- **בשגיאות 5xx:** להשיג את השגיאה המדויקת (למשל הרצה עם `DEBUG=true` ב־api/.env, או לוג Backend) ולהוסיף ל־דוח/תגובה לצוות — כדי לאפשר תיקון אופטימלי.

### 4.4 דוחות ופורמט

- **כל דוח:** לפי TEAM_50_QA_REPORT_FORMAT_STANDARD — טבלת רמזור (🟢/🟡/🔴), אחוז הצלחה X/Y (Z%), התקדמות מול בדיקה קודמת.
- **תגובות תאום (Contract Request / Revalidation):** לפי TEAM_50_QA_FAILURE_REPORTING_SOP — סעיף "מידע מפורט לתיקון".

---

## 5) מסמכי הקשר (לפני ביצוע)

| מסמך | שימוש |
|------|--------|
| 00_MASTER_INDEX.md (root) §Active agent context | קנון איגנטים — רשימת מסמכים פעילים; נוהל עבודה: AGENTS_OS_V2_OPERATING_PROCEDURES |
| TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.0.md | תפקידי צוותים; scope-by-domain |
| TEAM_10_S002_P003_WP002_WORK_PACKAGE_DEFINITION.md | scope WP002, D22/D34/D35, exit criteria |
| TEAM_10_S002_P003_GATE3_ACTIVATION_PROMPTS | פרומט Team 50 §4.2; סדר ביצוע; הודעות תאום §3.1 |
| TIKTRACK_ALIGNMENT_S002_P003_LLD400 | §2.5 ארטיפקטים, §2.6 exit criteria |

---

## 6) התחייבות

**Team 50 מאמץ במלואו את הגדרת התפקיד ואת נוהלי העבודה המקושרים, ומבצע את הבדיקות ותהליכי ה־QA באופן מלא — זה תחום האחריות של הצוות.**

---

**log_entry | TEAM_50 | ROLE_AND_PROCEDURES_README | ADOPTED | 2026-02-27**  
**log_entry | TEAM_50 | ROLE_AND_PROCEDURES_README | MINIMUM_QA_STANDARD_ADDED | 2026-03-06**
