# Team 50 → צוותים: משוב Gate B — עדכון (ריצה 2026-01-31)

**id:** `TEAM_50_GATE_B_UPDATED_FEEDBACK_TO_TEAMS`  
**date:** 2026-01-31  
**context:** משוב מעודכן לאחר ריצת `test:phase2-e2e-rerun-failed`. הממצאים שונו מהמשוב הקודם — יש עדכון לגבי מקור הכשל האמיתי.

---

## עקרון ההעברה

- **Team 50** מבצעת את הבדיקות ומספקת משוב מלא.
- צוותים 20, 30 מקבלים: מה נכשל, איפה, למה, ואיך לתקן.
- **לא נדרש** מהצוותים להריץ בדיקות — Team 50 תריץ E2E מחדש לאחר התיקונים.

---

## 1. סיכום — מי מתקן מה (מעודכן)

| בדיקה | צוות | מקור הכשל |
|-------|------|-----------|
| D16 Trading Accounts | **Team 30** | Data loader — SyntaxError: import outside module |
| D18 Brokers Fees | **Team 20** + **Team 30** | Backend 400 + Data loader |
| D21 Cash Flows | **Team 20** + **Team 30** | Backend 400 + Data loader |
| Security_TokenLeakage | Team 50 | נכשל בגלל SEVERE — נתקן אחרי 20/30 |

---

## 2. משוב מעודכן — Team 30 (Data Loaders)

### הקשר הבדיקה

- **בדיקות:** D16, D18, D21.
- **מה בודקים:** טעינת הדף ללא שגיאות SEVERE.
- **תוצאה:** כישלון — 3–4 SEVERE בכל דף.

### הודעות השגיאה המלאות (מהארטיפקט)

**D16:**
```
1. tradingAccountsDataLoader.js 20:0 Uncaught SyntaxError: Cannot use import statement outside a module
2. [UAI] Initialization failed
3. Failed to fetch data: Data loader function not found for page type: tradingAccounts
```

**D18:**
```
1. brokers_fees/summary - 400 Bad Request
2. brokersFeesDataLoader.js 16:0 Uncaught SyntaxError: Cannot use import statement outside a module
3. [UAI] Initialization failed
4. Failed to fetch data: Data loader function not found for page type: brokersFees
```

**D21:**
```
1. cash_flows/currency_conversions?page=1&page_size=25 - 400 Bad Request
2. cashFlowsDataLoader.js 17:0 Uncaught SyntaxError: Cannot use import statement outside a module
3. [UAI] Initialization failed
4. Failed to fetch data: Data loader function not found for page type: cashFlows
```

### ניתוח

- **קבצי Data Loader** משתמשים ב־`import` (ES modules) אך נטענים כ־`<script>` רגיל בלי `type="module"`.
- התוצאה: `Cannot use import statement outside a module` → ה־Data loader לא רץ → "Data loader function not found".

### מה לתקן

1. **קבצים רלוונטיים:**
   - `ui/src/views/financial/tradingAccounts/tradingAccountsDataLoader.js`
   - `ui/src/views/financial/brokersFees/brokersFeesDataLoader.js`
   - `ui/src/views/financial/cashFlows/cashFlowsDataLoader.js`

2. **אופן טעינה:** וודא שכל ה־`<script>` שטוענים את ה־Data loaders האלו כוללים `type="module"`.

   **דוגמה (שגוי):**
   ```html
   <script src="/src/views/financial/tradingAccounts/tradingAccountsDataLoader.js"></script>
   ```

   **דוגמה (תקין):**
   ```html
   <script type="module" src="/src/views/financial/tradingAccounts/tradingAccountsDataLoader.js"></script>
   ```

3. **מיקום:** בדפי HTML או במנגנון הטעינה (למשל RenderStage / DataStage / UAI) שמכניס את ה־scripts.

---

## 3. משוב מעודכן — Team 20 (Backend APIs)

### הקשר הבדיקה

- **בדיקות:** D18, D21.
- **מה בודקים:** טעינת הדף ללא שגיאות SEVERE. הדפים קוראים ל־APIs.
- **תוצאה:** כישלון — endpoints מחזירים 400.

### הודעות השגיאה המלאות (מהארטיפקט)

**D18:**
```
GET http://localhost:8080/api/v1/brokers_fees/summary - Failed to load resource: the server responded with a status of 400 (Bad Request)
```

**D21:**
```
GET http://localhost:8080/api/v1/cash_flows/currency_conversions?page=1&page_size=25 - Failed to load resource: the server responded with a status of 400 (Bad Request)
```

### מה לתקן

#### 3.1 brokers_fees/summary

- **Endpoint:** `GET /api/v1/brokers_fees/summary`
- **סטטוס:** 400 Bad Request
- **קריאה:** `brokersFeesDataLoader.js` — `sharedServices.get('/brokers_fees/summary', summaryFilters)`
- **תיקון:** לוודא שה־endpoint מקבל פרמטרים אופציונליים ומחזיר 200 גם כשאין פרמטרים או שהם ריקים.

#### 3.2 cash_flows/currency_conversions

- **Endpoint:** `GET /api/v1/cash_flows/currency_conversions?page=1&page_size=25`
- **סטטוס:** 400 Bad Request
- **תיקון:** לוודא שה־endpoint מקבל `page` ו־`page_size` (או `page_size` לפי ה־schema) ומחזיר 200.

### קבצים רלוונטיים

- Router/Service של `brokers_fees` ב־Backend
- Router/Service של `cash_flows` / `currency_conversions` ב־Backend

---

## 4. הערה — שינוי ממשוב קודם

במשוב הקודם צוינו **נתיבי אייקונים** כסיבה ל־D16/D21. הריצה המעודכנת מראה שהמקור העיקרי הוא:

- **Team 30:** Data loaders (import outside module) — לא נתיבי אייקונים
- **Team 20:** brokers_fees/summary 400 + **חדש:** cash_flows/currency_conversions 400

---

## 5. סדר פעולה

1. **Team 30** — תיקון טעינת Data loaders (`type="module"`).
2. **Team 20** — תיקון 400 ב־brokers_fees/summary וב־cash_flows/currency_conversions.
3. **Team 50** — ריצת `test:phase2-e2e-rerun-failed` מחדש לאחר התיקונים.

---

## 6. ארטיפקטים

- `documentation/05-REPORTS/artifacts_SESSION_01/phase2-e2e-artifacts/console_logs.json`
- שדות: `severeMessages`, `errorsExcludingFaviconMessages` — כל הודעות השגיאה המלאות.

---

**Team 50 (QA & Fidelity)**  
**log_entry | GATE_B | UPDATED_FEEDBACK | 2026-01-31**
