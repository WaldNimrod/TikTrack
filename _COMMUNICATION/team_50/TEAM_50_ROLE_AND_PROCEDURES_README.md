# Team 50 — הגדרת תפקיד ונוהלי עבודה (מחייב)

**project_domain:** TIKTRACK | AGENTS_OS  
**id:** TEAM_50_ROLE_AND_PROCEDURES_README  
**owner:** Team 50 (QA & Fidelity)  
**status:** 🔒 **מחייב — אימוץ מלא**  
**date:** 2026-02-27  

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

---

## 2) נוהלי עבודה מקושרים (חובה לאמץ)

| נוהל | נתיב | חובה |
|------|------|------|
| **ריצת בדיקות + Feedback** | _COMMUNICATION/team_50/TEAM_50_QA_RERUN_SOP.md | ✅ אתחול בסקריפטים מתועדים; הרצת בדיקות מלאה; משוב מפורט |
| **דיווח תקלות עם מידע מפורט** | _COMMUNICATION/team_50/TEAM_50_QA_FAILURE_REPORTING_SOP_v1.0.0.md | ✅ בכל כשל — בקשת HTTP, תשובה, הקשר, שחזור; ב־5xx — DEBUG/לוג לצורך תיקון אופטימלי |
| **פורמט דוח בדיקות** | _COMMUNICATION/team_50/TEAM_50_QA_REPORT_FORMAT_STANDARD.md | ✅ טבלת רמזור, אחוז הצלחה, התקדמות מול קודם |

---

## 3) תהליך QA מלא (חובה)

### 3.1 אתחול (לפני כל ריצת בדיקות)

- **מקור:** SERVERS_SCRIPTS_SSOT; TEAM_50_QA_RERUN_SOP §1.
- **פעולה:** להריץ את סקריפט האתחול המתועד — **לא** לדלג ולא להניח ש"השרת כבר רץ".
  - Login/תקשורת/500: `scripts/fix-env-after-restart.sh` (Postgres, P3-020, Backend).
  - Backend + Frontend: `scripts/restart-all-servers.sh` או `scripts/start-backend.sh` + `scripts/start-frontend.sh`.
- **וידוא:** `curl -s -o /dev/null -w "%{http_code}" http://localhost:8082/health` → 200 לפני הרצת בדיקות.

### 3.2 הרצת הבדיקות

- להריץ את **כל** הבדיקות הרלוונטיות ל־Work Package (לא "חלקי").
  - **D22:** `scripts/run-tickers-d22-qa-api.sh`; `tests/tickers-d22-e2e.test.js` (כשנדרש E2E).
  - **D34:** `scripts/run-alerts-d34-qa-api.sh`; `tests/alerts-mb3a-e2e.test.js` (או alerts-d34-fav-e2e); `scripts/run-cats-precision.sh`.
  - **D35:** `tests/notes-d35-fav-e2e.test.js`.

### 3.3 כשל — מידע מפורט (TEAM_50_QA_FAILURE_REPORTING_SOP)

- לכלול בכל דיווח: בקשת HTTP מדויקת, תשובה מלאה, הקשר ריצה, צעדי שחזור.
- **בשגיאות 5xx:** להשיג את השגיאה המדויקת (למשל הרצה עם `DEBUG=true` ב־api/.env, או לוג Backend) ולהוסיף ל־דוח/תגובה לצוות — כדי לאפשר תיקון אופטימלי.

### 3.4 דוחות ופורמט

- **כל דוח:** לפי TEAM_50_QA_REPORT_FORMAT_STANDARD — טבלת רמזור (🟢/🟡/🔴), אחוז הצלחה X/Y (Z%), התקדמות מול בדיקה קודמת.
- **תגובות תאום (Contract Request / Revalidation):** לפי TEAM_50_QA_FAILURE_REPORTING_SOP — סעיף "מידע מפורט לתיקון".

---

## 4) מסמכי הקשר (לפני ביצוע)

| מסמך | שימוש |
|------|--------|
| TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.0.md | תפקידי צוותים; scope-by-domain |
| TEAM_10_S002_P003_WP002_WORK_PACKAGE_DEFINITION.md | scope WP002, D22/D34/D35, exit criteria |
| TEAM_10_S002_P003_GATE3_ACTIVATION_PROMPTS | פרומט Team 50 §4.2; סדר ביצוע; הודעות תאום §3.1 |
| TIKTRACK_ALIGNMENT_S002_P003_LLD400 | §2.5 ארטיפקטים, §2.6 exit criteria |

---

## 5) התחייבות

**Team 50 מאמץ במלואו את הגדרת התפקיד ואת נוהלי העבודה המקושרים, ומבצע את הבדיקות ותהליכי ה־QA באופן מלא — זה תחום האחריות של הצוות.**

---

**log_entry | TEAM_50 | ROLE_AND_PROCEDURES_README | ADOPTED | 2026-02-27**
