# Team 50 → צוותים: משוב Gate B — מה לתקן ואיך
**project_domain:** TIKTRACK

**id:** `TEAM_50_GATE_B_DETAILED_ERROR_REPORT_AND_VERIFICATION_GUIDE`  
**date:** 2026-01-31  
**context:** משוב בדיקות Gate B — ממצאים מלאים והנחיה לתיקון.

---

## עקרון ההעברה

- **Team 50** מבצעת את הבדיקות ומספקת משוב מלא.
- **צוותים 20, 30** מקבלים: מה נכשל, איפה, למה, ואיך לתקן.
- **לא נדרש** מהצוותים להריץ בדיקות — רק לתקן על סמך המשוב. **Team 50 תריץ E2E מחדש** לאחר התיקונים ותעדכן בתוצאות.

---

## 1. סיכום — מי מתקן מה

| בדיקה | צוות | תיאור קצר |
|-------|------|-----------|
| D16 Trading Accounts | Team 30 | 3 SEVERE — נתיבי אייקונים שגויים |
| D18 Brokers Fees | **Team 20** | 4 SEVERE — `brokers_fees/summary` מחזיר 400 |
| D21 Cash Flows | Team 20 / 30 | 4 SEVERE — אייקונים או API |
| Security_TokenLeakage | Team 50 | נכשל בגלל SEVERE — לא דליפת token; נתקן אחרי 20/30 |

---

## 2. משוב מפורט לכל צוות

### 2.1 Team 30 — D16, D21 (נתיבי אייקונים)

#### הקשר הבדיקה

- **בדיקה:** D16 (Trading Accounts), D21 (Cash Flows).
- **מה בודקים:** טעינת הדף ללא שגיאות SEVERE ב־Console (למעט favicon).
- **תוצאה:** 3 SEVERE ב־D16, 4 SEVERE ב־D21 → הבדיקה נכשלת.

#### ממצאים מהארטיפקטים

מדוח הביקורת: בדפי HTML יש שימוש בנתיבים כמו `../../../public/images/icons/...` — נתיב לא תקין ב־Vite.

- **ב־Vite:** קבצים מ־`ui/public/` מוגשים מהשורש.
- **נתיב תקין:** `/images/icons/entities/...` (נגיש כ־`/images/...`).
- **נתיב לא תקין:** `../../../public/images/icons/...` → הדפדפן מבקש משאב לא קיים → 404 → SEVERE ב־Console.

#### מה לתקן

1. **קבצים רלוונטיים:**
   - `ui/src/views/financial/tradingAccounts/trading_accounts.html`
   - `ui/src/views/financial/cashFlows/cash_flows.html`
   - `ui/src/views/financial/brokersFees/brokers_fees.html`
   - כל קובץ HTML שמכיל `../../../public/images` או דומה.

2. **החלפה:**
   - **מ:** `../../../public/images/icons/...` או `../../../../ui/public/images/icons/...`
   - **אל:** `/images/icons/...`

3. **דוגמה:**
   ```html
   <!-- שגוי -->
   <img src="../../../public/images/icons/entities/home.svg" ...>

   <!-- תקין -->
   <img src="/images/icons/entities/home.svg" ...>
   ```

---

### 2.2 Team 20 — D18 (brokers_fees/summary)

#### הקשר הבדיקה

- **בדיקה:** D18 — Brokers Fees.
- **מה בודקים:** טעינת הדף ללא שגיאות SEVERE. הדף קורא ל־`/api/v1/brokers_fees/summary`.
- **תוצאה:** 4 SEVERE → הבדיקה נכשלת.

#### הודעת השגיאה המלאה (מהארטיפקט)

```
http://localhost:8080/api/v1/brokers_fees/summary - Failed to load resource: the server responded with a status of 400 (Bad Request)
```

(הקריאה עוברת דרך ה־proxy: 8080 → 8082)

#### ממצאים

- **Endpoint:** `GET /api/v1/brokers_fees/summary`
- **סטטוס:** 400 Bad Request
- **התנהגות נדרשת:** ה־endpoint צריך לקבל פרמטרים אופציונליים בלבד ולחזור 200 כשמקבל פרמטרים ריקים/חסרים.

#### מאיפה מגיעה הקריאה

- **קובץ:** `ui/src/views/financial/brokersFees/brokersFeesDataLoader.js` (בערך שורה 100)
- **קוד:** `sharedServices.get('/brokers_fees/summary', summaryFilters)`
- **סוג:** GET עם query params (למשל `broker_id`, `date_from`, `date_to` — אופציונליים).

#### מה לתקן

1. **קבצים רלוונטיים:** Router/Service של `brokers_fees` ב־Backend (למשל `api/routers/brokers_fees.py` או מקום דומה).

2. **בעיה אפשרית:**
   - Validation שמחזיר 400 כשפרמטרים חסרים או ריקים.
   - דרישה לפרמטרים חובה שלא נשלחים מהקליינט.

3. **תיקון:** לוודא שה־summary:
   - מקבל פרמטרים אופציונליים בלבד;
   - מחזיר 200 גם כשאין פרמטרים או שהם ריקים.

---

### 2.3 Security_TokenLeakage — Team 50

- הבדיקה נכשלת כשיש SEVERE בדפים — זו תוצאה משנית, לא דליפת token אמיתית.
- **אחרי** ש־D16, D18, D21 עוברים — אם עדיין יש FAIL, Team 50 תעדכן את לוגיקת הזיהוי (Regex ל־JWT אמיתי בלבד).

---

## 3. איפה למצוא את המשוב המלא

- **ארטיפקטים:** `documentation/05-REPORTS/artifacts_SESSION_01/phase2-e2e-artifacts/`
- **קובץ:** `console_logs.json`
- **שדות:** `severeMessages` — כל הודעות SEVERE; `errorsExcludingFaviconMessages` — השגיאות שמביאות לכישלון.

---

## 4. סדר פעולה

1. **Team 30** — תיקון נתיבי אייקונים.
2. **Team 20** — תיקון 400 ב־`brokers_fees/summary`.
3. **Team 50** — ריצת E2E מחדש לאחר התיקונים והעברת משוב מעודכן אם נדרש.

---

## 5. תהליך ריצה (Team 50)

- **שלב 1:** הרצת **רק** מה שנכשל:
  ```
  npm run test:phase2-e2e-rerun-failed
  ```
  (מריץ D16, D18, D21, Security_TokenLeakage בלבד)

- **שלב 2:** אם הכל עובר — הרצת סבב מלא לאימות:
  ```
  npm run test:phase2-e2e
  ```

- אין צורך להריץ מחדש מה שכבר עבר (Login, CRUD, Routes SSOT).

---

**Team 50 (QA & Fidelity)**  
**log_entry | GATE_B | FEEDBACK_FOR_FIX | 2026-01-31**
