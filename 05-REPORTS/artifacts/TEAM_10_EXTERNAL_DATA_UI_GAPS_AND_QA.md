# External Data — פערי ממשק ובדיקות (QA)

**תאריך:** 2026-02-13  
**מקור:** דיווח משתמש — "לא בדקנו אז לא סיימנו"; ניווט לדשבורד נתונים לא עובד; אין נתוני מחיר בעמוד טיקרים.

**סטטוס נוכחי (עדכון):** **עדיין לא רואים נתונים שמתקבלים** — דיווח משתמש. פער פתוח עד לאימות (QA) ו/או הרצת sync + וידוא תצוגה.

---

## 1. עקרון: לא בדקנו אז לא סיימנו

השלמת מימוש (צוותים 20, 30, 60) **אינה** השלמת התהליך.  
עד שלא מבוצעות **בדיקות (QA)** ובעיות הממשק מטופלות — **לא סיימנו.**

---

## 2. בעיה א — לא מצליחים לגלוש לעמוד דשבורד נתונים

**תיאור:** לחיצה על "נתונים" → "דשבורד נתונים" לא מגיעה לעמוד (או 404).

**סיבות אפשריות:**
- **מצב Dev (Vite):** ה-middleware ב-vite.config.js ממפה `/data_dashboard.html` ל־`src/views/data/dataDashboard/data_dashboard.html`. לוודא שהשרת רץ מתוך תיקיית `ui` ו־`__dirname` מצביע נכון; לוודא שהקובץ קיים.
- **מצב Build (dist):** ב־`vite build` נבנה רק **index.html** (SPA). קבצי HTML סטטיים (כולל data_dashboard.html) **לא** מועתקים ל־dist. לכן בשרת שמריץ מ־dist, `/data_dashboard.html` מחזיר 404.

**פעולות מומלצות:**
1. **Team 30 / תשתית:** לוודא שב-**dev** הקישור `/data_dashboard.html` מחזיר את העמוד (בדיקה בדפדפן).
2. **Build/Production:** להכניס את דשבורד הנתונים (ועמודים סטטיים נוספים) ל-build — למשל העתקת הקבצים המוכנים ל־dist אחרי build, או שימוש ב־Vite multi-page build כך ש־data_dashboard.html ייבנה ויופיע ב־dist.
3. **שרת (nginx / etc.):** אם הקבצים מועתקים ל־dist — לוודא שהשרת מגיש אותם (למשל `location / { try_files $uri $uri/ /index.html; }` כך ש־/data_dashboard.html יוגש כקובץ אם קיים).

---

## 3. בעיה ב — לא רואים נתוני מחיר בעמוד טיקרים

**תיאור:** בעמוד ניהול טיקרים (D22) לא מוצגים נתוני מחיר.

**רקע:**
- ה-API `GET /tickers` מחזיר `current_price` (ו־daily_change_pct) רק כשיש רשומות ב־`market_data.ticker_prices` עבור הטיקר (tickers_service.py — שאילתה ל־TickerPrice).
- אם **לא הורצה** סנכרון מחירים (sync_ticker_prices_eod או make sync-ticker-prices), או שאין טיקרים עם נתונים — ה-backend מחזיר `current_price: null`.
- בממשק (tickersTableInit.js) יש `formatCurrency(priceVal)` שמחזיר "—" כש־priceVal null — כלומר העמודה אמורה להראות "—" ולא ריקה.

**פעולות מומלצות:**
1. **בדיקה:** לוודא ש־GET /api/v1/tickers מחזיר שדה `current_price` (או null). אם יש טיקרים ב-DB אבל אין רשומות ב־ticker_prices — להריץ סנכרון מחירים (Team 20: sync_ticker_prices_eod).
2. **ממשק:** אם עדיין לא מוצג כלום — לוודא שהתא של המחיר מקבל את הערך (כולל null) ומציג "—" או "אין נתון" במפורש.

---

## 4. בדיקות נדרשות (QA)

| בדיקה | תיאור |
|--------|--------|
| ניווט דשבורד נתונים | מתפריט "נתונים" → "דשבורד נתונים" — העמוד נטען (טבלה 1 שערים, טבלה 2, סיכום). |
| דשבורד — נתונים | טבלה 1 מציגה שערים מ־GET /reference/exchange-rates (או "—" אם אין נתונים). |
| עמוד טיקרים — מחיר | עמוד ניהול טיקרים מציג עמודת "מחיר אחרון" — ערך או "—" כשאין נתון. |
| E2E | לאחר הרצת sync מחירים — מופיעים ערכים בעמוד טיקרים (לפחות לטיקר אחד עם נתונים). |

---

**מסמך זה מפנה מתוכנית העבודה (מנדט External Data) §9.**

---

## 5. פעולות קונקרטיות — "עדיין לא רואים נתונים"

| סדר | פעולה | בעלים | תוצר |
|-----|--------|--------|------|
| 1 | **אימות עובדות** — GET /api/v1/tickers: האם מחזיר `current_price` (או null)? SELECT COUNT מ־market_data.ticker_prices ו־market_data.tickers. | Team 50 (או 20/60 עם גישה ל-DB) | TEAM_50_TO_TEAM_10_EXTERNAL_DATA_UI_VERIFICATION_REPORT (לפי הנחיית מנהלת העבודה) |
| 2 | **אם 0 שורות ב־ticker_prices** — להריץ `make sync-ticker-prices` (או sync_ticker_prices_eod.py) כדי למלא מחירים; לוודא שיש טיקרים ב־tickers. | Team 20 | לוג הרצה + SELECT אחרי sync |
| 3 | **אחרי שיש נתונים ב-DB** — לפתוח עמוד ניהול טיקרים; לוודא שהעמודה "מחיר אחרון" מוצגת וערך או "—" מופיע. | Team 50 / משתמש | דוח PASS או תיאור כשל |

**הנחיה מלאה:** _COMMUNICATION/team_10/TEAM_10_WORK_MANAGER_DIRECTIVE_EXTERNAL_DATA_UI_CLOSURE.md — שלב 1 (אימות) → שלב 2 (תיקונים לפי תוצאות) → שלב 3 (אימות חוזר).

---

## 6. גישה ל-DB + הוכחת טעינה משני ספקים

**גישה לבסיס הנתונים:** קיימת (לצוותים ולביצוע בדיקות).  
**פקודת בדיקת ספירות:** `make check-market-data-counts` או `python3 scripts/check_market_data_counts.py` — מציגה COUNT ל־tickers, ticker_prices, exchange_rates.

**דרישת מנהל:** חובה **הוכחה לטעינה משני הספקים** (Yahoo + Alpha) של **כל היקף הנתונים** — מחיר (EOD + intraday), FX, היסטוריה (250d) — לפי המפרט המלא.  
**מנדט:** _COMMUNICATION/team_10/TEAM_10_TO_TEAM_20_DUAL_PROVIDER_AND_FULL_SCOPE_EVIDENCE_MANDATE.md  
**תוצר Team 20:** _COMMUNICATION/team_20/TEAM_20_DUAL_PROVIDER_FULL_SCOPE_EVIDENCE.md

**סטטוס לאחר בדיקה:** tickers=5, ticker_prices=0, exchange_rates=5. הרצת sync-ticker-prices — Yahoo החזיר "No data found for this date range"; Alpha ללא API key. יש להגדיר API key (Alpha) ו/או לתקן טווח תאריכים ל-Yahoo ולהריץ עד לקבלת שורות ב־ticker_prices.
