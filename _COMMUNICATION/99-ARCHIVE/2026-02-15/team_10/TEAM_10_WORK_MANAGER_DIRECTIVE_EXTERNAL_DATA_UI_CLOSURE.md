# Team 10 — הנחיית מנהלת העבודה: סגירת פערי ממשק External Data (ללא ניחושים)

**id:** `TEAM_10_WORK_MANAGER_DIRECTIVE_EXTERNAL_DATA_UI_CLOSURE`  
**from:** Team 10 (The Gateway — מנהלת העבודה / מפקד בשטח)  
**to:** Team 20 (Backend), Team 30 (UI), Team 50 (QA), Team 60 (Infrastructure)  
**date:** 2026-02-13  
**עקרון:** טיפול יסודי, מסודר ומדויק — **בלי ניחושים.** כל שלב מבוסס על עובדות (קוד, מסמכים, תוצאות בדיקה).

---

## 1. עובדות (מבוסס קוד ומסמכים)

### 1.1 בעיה א — ניווט לדשבורד נתונים לא עובד

| עובדה | מקור |
|--------|------|
| קישור בתפריט | `unified-header.html`: href="/data_dashboard.html", data-page="data_dashboard". |
| מיפוי ב-Dev | `vite.config.js` (שורות 120–125): routeToFileMap maps `/data_dashboard.html` → `src/views/data/dataDashboard/data_dashboard.html`; הקבצים קיימים ב־`ui/src/views/data/dataDashboard/`. |
| מיפוי רץ רק ב-Dev | ה-plugin הוא `configureServer` — פעיל רק ב־`vite` dev. |
| Build | `vite build` (ברירת מחדל) — מוציא רק `index.html` + assets ל־`dist/`. קבצי HTML סטטיים (tickers, data_dashboard, וכו') **לא** נכללים ב־dist. |
| מסקנה | ב-**dev**: אם השרת רץ מתוך `ui/` והבקשה מגיעה ל־middleware — העמוד אמור להיגש. ב-**production** (הרצה מ־dist): `/data_dashboard.html` לא קיים ב־dist → 404. |

### 1.2 בעיה ב — לא רואים נתוני מחיר בעמוד טיקרים

| עובדה | מקור |
|--------|------|
| API | `GET /api/v1/tickers` — מוגדר ב־`api/routers/tickers.py`; מחזיר `TickerListResponse` עם רשימת `TickerResponse`. |
| סכמה | `api/schemas/tickers.py`: `TickerResponse` כולל `current_price: Optional[Decimal]`. |
| לוגיקה | `api/services/tickers_service.py`: `get_tickers` שולף מחיר אחרון מ־`market_data.ticker_prices` (שאילתה עם latest_subq) וממלא `price_map`; כל טיקר מקבל `_ticker_to_response(r, price_map.get(r.id))`. אם אין רשומה ב־ticker_prices — `current_price` יהיה `null`. |
| נתונים | `current_price` מוחזר רק כשיש שורות ב־`market_data.ticker_prices` עבור ה־ticker_id. סנכרון: `scripts/sync_ticker_prices_eod.py` (Team 20); cron: תיעוד Team 60. |
| ממשק | `ui/src/views/management/tickers/tickersTableInit.js`: שורה 119 — `priceVal = t.current_price ?? t.currentPrice ?? null`; שורה 122 — `formatCurrency(priceVal)`. ב־formatCurrency (שורה 11): `if (amount == null \|\| isNaN(amount)) return '—'`. |
| מסקנה | אם ה-API מחזיר `current_price: null` — הממשק אמור להציג "—". אם לא מוצג כלום — יש באג ברינדור או שהעמודה לא נבנית. אם אין נתונים ב-DB — יש להריץ sync (ולאמת שיש טיקרים ב־tickers). |

---

## 2. סדר ביצוע — ארבעה שלבים (ללא ניחושים)

### שלב 1: אימות עובדות (Team 50 — QA)

**מטרה:** לקבוע **בדיוק** איפה הכשל — לא לנחש.

| # | משימה | איך לבצע | תוצר חובה |
|---|--------|----------|------------|
| 1.1 | **ניווט דשבורד — Dev** | להריץ `npm run dev` מתוך `ui/`; לפתוח את האתר (למשל http://localhost:8080/); להתחבר; ללחוץ "נתונים" → "דשבורד נתונים". | דוח: **העמוד נטען** (PASS) או **לא נטען / 404 / לבן** (FAIL). אם FAIL — לציין את ה-URL המלא ואת קוד התגובה (למשל 404). |
| 1.2 | **ניווט דשבורד — Build** | להריץ `npm run build` מתוך `ui/`; לבדוק אם קיים קובץ `dist/data_dashboard.html` (או `dist/**/data_dashboard.html`). | דוח: **הקובץ קיים ב-dist** (כן/לא). אם לא — זה מסביר 404 בפרודקשן. |
| 1.3 | **API טיקרים** | קריאה ל־`GET /api/v1/tickers` (עם Auth). לבדוק ב-response body: האם לכל פריט יש שדה `current_price`? מה הערך (מספר או null)? | דוח: דוגמת response (או JSON מצומצם) — רשימת טיקרים עם `current_price` לכל אחד. |
| 1.4 | **DB — ticker_prices** | להריץ (למשל) `SELECT COUNT(*) FROM market_data.ticker_prices;` ו־`SELECT COUNT(*) FROM market_data.tickers;`. | דוח: מספר שורות ב־ticker_prices, מספר שורות ב־tickers. (אם אין גישה ל-DB — Team 20/60 יבצעו וידווחו.) |
| 1.5 | **עמוד טיקרים — ממשק** | בפתיחת עמוד ניהול טיקרים — האם מופיעה **עמודה** "מחיר אחרון"? מה מוצג בתא (מספר / "—" / ריק)? | דוח: עמודה קיימת (כן/לא); מה מוצג בתא (תיאור קצר או צילום מסך). |

**תוצר שלב 1:** מסמך **TEAM_50_TO_TEAM_10_EXTERNAL_DATA_UI_VERIFICATION_REPORT** — טבלה: משימה | תוצאה (PASS/FAIL) | Evidence (טקסט או קובץ). **ללא פרשנות — רק עובדות.**

---

### שלב 2: תיקונים — לפי תוצאות שלב 1

**כל תיקון רק אחרי ש־Team 50 דיווחו עובדות.**

#### Team 30 (UI)

| # | תנאי (לפי דוח 50) | משימה | תוצר |
|---|---------------------|--------|------|
| 2.1 | אם 1.1 FAIL (דשבורד לא נטען ב-dev) | לאתר ב־vite.config.js או בשרת למה הבקשה ל־/data_dashboard.html לא מגיעה ל־htmlMiddleware או מחזירה 404; לתקן (למשל סדר middleware, נתיב קובץ). | עדכון קוד + דוח קצר: מה היה, מה שונה. |
| 2.2 | אם 1.2 "הקובץ לא קיים ב-dist" | להכניס את העמודים הסטטיים (לפחות data_dashboard.html, ואם רלוונטי tickers.html) ל־output של ה-build. אופציות: (א) העתקת קבצי HTML מוכנים מ־src/views/... ל־dist אחרי build (סקריפט או plugin); (ב) Vite multi-page build — להגדיר ב־vite.config.js input שכולל את data_dashboard.html. **לא לנחש** — להסתמך על תיעוד Vite (multi-page) או על סקריפט העתקה מתועד. | קובץ/שינוי מוגדר (שם סקריפט או תצורת build) + וידוא ש־dist מכיל את הקובץ אחרי build. |
| 2.3 | אם 1.5 — עמודת מחיר לא מוצגת או ריקה כשצריך "—" | לבדוק ב־tickersTableInit.js ש־priceCell מקבל את הערך מ־API וש־formatCurrency מופעל; אם צריך — להציג במפורש "—" כש־current_price === null. | עדכון קוד + וידוא בעמוד שהעמודה והערך מוצגים. |

#### Team 20 (Backend)

| # | תנאי (לפי דוח 50) | משימה | תוצר |
|---|---------------------|--------|------|
| 2.4 | אם 1.4 — 0 שורות ב־ticker_prices ויש טיקרים | להריץ `sync_ticker_prices_eod` (או make sync-ticker-prices) עבור רשימת טיקרים קיימת; לוודא שאחרי הריצה יש לפחות שורה אחת ב־ticker_prices (למשל SELECT אחרי הריצה). | Evidence: לוג הריצה + תוצאת SELECT COUNT אחרי sync. |
| 2.5 | (אופציונלי) אם 1.3 מראה ש־current_price חסר לגמרי ב-response | לוודא ש־TickerResponse כולל את השדה גם כש־null (לא להסתיר שדה); לוודא ש־get_tickers מעביר את price_map נכון. | עדכון אם נדרש + וידוא response. |

#### Team 60 (Infrastructure)

| # | תנאי (לפי דוח 50) | משימה | תוצר |
|---|---------------------|--------|------|
| 2.6 | אם יש צורך ב-build/production להגשת data_dashboard.html | לתאם עם Team 30 — אחרי ש־30 מכניסים את הקובץ ל־dist, לוודא שתהליך הפריסה/השרת מגיש את הקובץ (למשל try_files או הגשת קבצי HTML סטטיים). | תיעוד קצר או עדכון config שרת. |

---

### שלב 3: אימות חוזר (Team 50)

לאחר שכל צוות ביצע את התיקונים שלו:

| # | משימה | תוצר |
|---|--------|------|
| 3.1 | לחזור על 1.1, 1.2 (אם רלוונטי), 1.3, 1.4, 1.5. | דוח **TEAM_50_TO_TEAM_10_EXTERNAL_DATA_UI_REVERIFICATION** — אותה טבלה: משימה \| תוצאה \| Evidence. |
| 3.2 | אם כל הפריטים PASS — לאשר בכתב: "סגירת פערי ממשק External Data — אושרה". אם יש עדיין FAIL — לציין במדויק מה נכשל. | החלטה: **אושר** / **לא אושר** + רשימת פריטים פתוחים. |

---

### שלב 4: סגירה (Team 10)

- אם Team 50 אישרו — לעדכן את תוכנית העבודה (מנדט §9) שפערי הממשק **נסגרו** ולהוסיף הפניה לדוח האימות.
- אם לא אושר — להשאיר §9 במצב "לא סיימנו" ולהוסיף משימות ממוקדות לפי רשימת ה-FAIL.

---

## 3. צוותים שמופעלים ובאיזה סדר

| סדר | צוות | תפקיד |
|-----|------|--------|
| 1 | **Team 50** | שלב 1 — אימות עובדות (דוח verification). **קודם** כל תיקון. |
| 2 | **Team 30** | שלב 2 — תיקוני UI/build (ניווט דשבורד, עמודת מחיר) **לפי** תוצאות דוח 50. |
| 3 | **Team 20** | שלב 2 — הרצת sync / וידוא response **לפי** תוצאות דוח 50. |
| 4 | **Team 60** | שלב 2 — רק אם נדרש שינוי בהגשת קבצים בפרודקשן. |
| 5 | **Team 50** | שלב 3 — אימות חוזר ודוח re-verification. |
| 6 | **Team 10** | שלב 4 — עדכון סטטוס סגירה במנדט. |

---

## 4. כללים

- **בלי ניחושים:** אף תיקון לא מבוסס על "אולי" — רק על תוצאת אימות (דוח 50) או על קוד/מסמך קיים.
- **עובדות בלבד בדוחות:** דוח 50 יכיל PASS/FAIL + Evidence (טקסט/מספר/קובץ) — בלי "כנראה" או "נראה ש".  
- **תנאי לתיקון:** Team 30/20/60 מבצעים את משימות שלב 2 **רק** אחרי שדוח שלב 1 התקבל; אם צריך להריץ אימות DB — Team 20 או 60 יכולים לבצע את 1.4 ולדווח ל־50.

---

**מסמכים קשורים:**  
- תוכנית העבודה: TEAM_10_TO_TEAMS_20_30_60_EXTERNAL_DATA_FULL_MODULE_REVIEW_MANDATE (§9).  
- פערים: 05-REPORTS/artifacts/TEAM_10_EXTERNAL_DATA_UI_GAPS_AND_QA.md.

---

**log_entry | TEAM_10 | WORK_MANAGER_DIRECTIVE | EXTERNAL_DATA_UI_CLOSURE | 2026-02-13**
