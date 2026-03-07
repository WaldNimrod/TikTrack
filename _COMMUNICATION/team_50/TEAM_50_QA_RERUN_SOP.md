# Team 50 — SOP: ריצת בדיקות + Feedback לצוותים
**project_domain:** TIKTRACK
**date:** 2026-03-06

**id:** `TEAM_50_QA_RERUN_SOP`  
**purpose:** תהליך אופטימלי ומהיר לבדיקה חוזרת + העברת משוב מפורט

**סטנדרט מינימלי:** כל סבב בדיקה חייב לעמוד **לפחות** ברמת הבדיקה המתועדת ב־`TEAM_50_ROLE_AND_PROCEDURES_README.md` §סטנדרט בדיקה מינימלי (מפרט אימות ממוספר, ריצת E2E+API אמיתית, בדיקות עומק — ולידציות, מקושר חובה, תצוגה בטבלה, רענון טבלה — ודוח מבוסס ריצה עם ראיה). במקרה של אימות שער/ממצאים חוסמים — להריץ גם את סוויטות 26-BF ו־Deep E2E ואת סקריפטי ה־API הרלוונטיים.

---

## 🔒 כלל קבוע (חובה)

**בעיית תקשורת לשרת / כשל אימות (Login, 500, Connection):**

1. **להשתמש בסקריפטים המתועדים בתעוד הרשמי** לצורך איתחול השרת וביצוע בדיקה חוזרת.
2. **מקור:** `documentation/01-ARCHITECTURE/SERVERS_SCRIPTS_SSOT.md` — `scripts/init-servers-for-qa.sh`, `scripts/fix-env-after-restart.sh`, `scripts/restart-all-servers.sh` וכו'.
3. **אחרי איתחול והתחברות תקינה** — אין לחזור שוב ושוב על "BLOCKED — איתחול נדרש". ביצוע איתחול ואימות כניסה/אוטנטיקציה — **מצופה שהבדיקה תרוץ ותעבור**.

**אין לסמן כישלון בדיקה כחסימת איתחול באופן חוזר לאחר שאיתחול בוצע.**

---

## תהליך (צעד־אחר־צעד)

### 1. וידוא תשתית
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:8082/health
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/
```
- אם לא 200 — להפעיל סקריפטים מתוך **SERVERS_SCRIPTS_SSOT**: `./scripts/init-servers-for-qa.sh` או `./scripts/fix-env-after-restart.sh` (אם Login מחזיר 500).
- **Policy:** אתחול שרתים הוא self‑service. אין לערב את Team 60 אלא אם יש תקלה תשתיתית אמיתית.

### 2. הרצת בדיקות
```bash
cd tests && npm run test:phase2        # Runtime
cd tests && npm run test:phase2-e2e   # E2E
```
- **בסבב אימות שער / ממצאים חוסמים (למשל GATE_4, 26 BF):** בנוסף — `node tests/g7-26bf-e2e-validation.test.js`, `node tests/g7-26bf-deep-e2e.test.js`, ו־`scripts/run-tickers-d22-qa-api.sh`, `run-user-tickers-qa-api.sh`, `run-alerts-d34-fav-api.sh`, `run-notes-d35-qa-api.sh`. מפרט: `documentation/reports/05-REPORTS/artifacts_SESSION_01/TEAM_50_G7_26BF_VERIFICATION_SPEC_v1.0.0.md`.

### 3. איסוף Evidence
- `documentation/05-REPORTS/artifacts_SESSION_01/phase2-e2e-artifacts/console_logs.json`
- `network_logs.json`
- `test_summary.json`

### 4. ניתוח כישלונות
- לחפש `SEVERE` ב־console_logs
- לזהות URL/endpoint שנכשל (400, 404, 500)
- למַפּוֹת צוות אחראי: 20=Backend, 30=Frontend, 50=לוגיקת בדיקה

### 5. יצירת Feedback
- קובץ: `TEAM_50_GATE_B_FEEDBACK_TO_TEAMS.md`
- לכל כישלון: תיאור, שגיאה מדויקת, צוות, פעולה נדרשת
- **בכשל — ובמיוחד כשל חוזר — חובה לכלול מידע מפורט לתיקון:** בקשת HTTP מדויקת (method, URL, body), תשובה מלאה (status, body), הקשר ריצה, צעדי שחזור, והנחיה להפקת שגיאה מדויקת (DEBUG=true / לוג Backend). **נוהל מחייב:** `TEAM_50_QA_FAILURE_REPORTING_SOP_v1.0.0.md`

### 6. פורמט דוח (חובה)
**בכל דוח בדיקות** לכלול:
- **טבלת סיכום עם רמזור** (🟢 PASS / 🟡 PARTIAL / 🔴 FAIL) לכל סעיף
- **אחוז הצלחה** — X/Y (Z%)
- **התקדמות מול בדיקה קודמת** — טבלה: קודם | נוכחי | שינוי

**נוהל מלא:** `TEAM_50_QA_REPORT_FORMAT_STANDARD.md`

---

## מיפוי צוותים

| סוג בעיה | צוות |
|----------|------|
| API 4xx/5xx, endpoints | Team 20 |
| Header, navigation, DOM, favicon | Team 30 |
| לוגיקת בדיקה, false positives | Team 50 |

---

## פורמט Feedback

```markdown
## כישלון X: [שם] — [צוות]
### תסמינים
### שגיאה מזוהה (מלאה)
### פעולה נדרשת
### קובץ/אזור
```

---

**log_entry | [Team 50] | SOP | QA_RERUN | 2026-02-07**
