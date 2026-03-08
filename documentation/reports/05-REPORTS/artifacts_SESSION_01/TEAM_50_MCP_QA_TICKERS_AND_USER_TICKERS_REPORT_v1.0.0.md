# Team 50 | בדיקות MCP — טיקרים והטיקרים שלי — דוח כפול (v1.0.0)

**project_domain:** TIKTRACK  
**id:** TEAM_50_MCP_QA_TICKERS_AND_USER_TICKERS_REPORT_v1.0.0  
**from:** Team 50 (QA)  
**date:** 2026-03-07  
**status:** COMPLETE  

---

## מטרה כפולה

1. **עבודה מול MCP** — ביצוע הבדיקות בדפדפן באמצעות MCP (cursor-ide-browser), תיעוד כלים, flows ותוצאות.
2. **מצב הקוד** — סיכום ישויות טיקרים והטיקרים שלי: משמעויות, פיצ'רים, ולידציות בקוד.

---

# חלק א — עבודה מול MCP

## 1. כלים שבשימוש

| כלי MCP | שימוש |
|---------|--------|
| **browser_tabs** (action: list) | בדיקת טאבים פתוחים; קבלת viewId (acd47c). |
| **browser_snapshot** | צילום עץ נגישות (accessibility) — תפקידים, refs, ערכים. שימוש ב־compact: true. |
| **browser_lock** / **browser_unlock** | נעילה למניעת התערבות משתמש במהלך הבדיקה. |
| **browser_navigate** | ניווט ל־URL (login, tickers.html, user_tickers.html). |
| **browser_type** | הזנת טקסט בשדות (שם משתמש, סיסמה). |
| **browser_click** | לחיצה על כפתורים (התחבר, הוספת טיקר, שמירה, ביטול). |

**שרת:** cursor-ide-browser. **סביבה:** דפדפן מקומי (localhost:8080) — טאב קיים עם האפליקציה.

## 2. Flows שבוצעו

| שלב | פעולה | תוצאה |
|-----|--------|--------|
| 1 | browser_tabs list | טאב אחד: http://localhost:8080/login (viewId: acd47c). |
| 2 | browser_lock | נעילה הצליחה. |
| 3 | browser_type (e0, TikTrackAdmin) + (e1, 4181) | שדות מולאו. |
| 4 | browser_click (e4 — התחבר) | כפתור "מתחבר..."; טעינה. |
| 5 | browser_navigate → tickers.html | ניווט ל־ניהול טיקרים; כותרת "ניהול טיקרים \| TikTrack Phoenix". |
| 6 | browser_snapshot (tickers) | זיהוי: פילטרים (סוג טיקר, הצג הכל/פעילים/לא פעילים), כפתור "הוספת טיקר", טבלה עם "פעולות שורה", עימוד. |
| 7 | browser_click (e26 — הוספת טיקר) | מודל "הוספת טיקר" נפתח. |
| 8 | browser_snapshot (modal) | שדות: סמל *, שם חברה, סוג *, סטטוס; כפתורי ביטול, שמירה, סגור. |
| 9 | browser_click (e84 — שמירה) בלי מילוי סמל | מודל נשאר פתוח; שדה סמל מקבל פוקוס (ולידציה client-side). |
| 10 | browser_click (e83 — ביטול) | מודל נסגר. |
| 11 | browser_navigate → user_tickers.html | ניווט ל־"הטיקרים שלי". |
| 12 | browser_snapshot (הטיקרים שלי) | כותרת "הטיקרים שלי", "רשימת הטיקרים שלי", כפתור "הוספת טיקר לרשימה שלי", עמודות פעולות, עימוד. |
| 13 | browser_unlock | נעילה שוחררה. |

## 3. תובנות MCP

- **Snapshot:** נותן refs יציבים (e0, e1, …) לאלמנטים אינטראקטיביים — נדרש ל־click ו־type. ללא ref לא ניתן להפעיל את הכלי.
- **Lock/unlock:** מונע לחיצות משתמש במהלך רצף בדיקות; חשוב להסיר בסיום.
- **ניווט:** navigate מעדכן את הדף; אחרי login אין redirect גלוי ב־snapshot הראשון — ניווט ידני ל־tickers.html/user_tickers.html עבד.
- **מגבלה:** הודעות ולידציה (למשל #tickerFormValidationSummary) לא תמיד מופיעות כ־role/name ב־accessibility snapshot; אימות מלא של טקסט שגיאה עשוי לדרוש כלי נוסף (למשל get_attribute או בדיקת DOM).

---

# חלק ב — מצב הקוד: טיקרים והטיקרים שלי

## 1. ישות טיקרים (ניהול טיקרים — D22)

**נתיבים עיקריים:**  
`ui/src/views/management/tickers/tickers.html`, `tickers.content.html`, `tickersTableInit.js`, `tickersForm.js`, `tickersPageConfig.js`.

**משמעויות:**
- **טיקר מערכת** — רשומה ב־GET/POST/PUT/DELETE `/tickers`; סמל ייחודי, סוג (STOCK, ETF, OPTION, FUTURE, FOREX, CRYPTO, INDEX), סטטוס (pending, active, inactive, cancelled).
- **ניהול** — תחת תפריט "ניהול" (admin); דף tickers.html — טבלה, פילטרים, הוספה/עריכה/מחיקה.

**פיצ'רים (קוד):**
- **טבלה:** `tickersTableInit.js` — `loadTickersData(filters)`, פרמטרים `ticker_type`, `is_active`, `search`; מיון; עימוד (currentPage, currentPageSize); רענון אחרי CRUD.
- **פילטרים:** סינון לפי סוג טיקר (combobox); כפתורי סטטוס (הצג הכל, פעילים בלבד, לא פעילים בלבד) — `data-is-active` ו־filterState.
- **מודל הוספה/עריכה:** `tickersForm.js` — `showTickerFormModal(data, onSave)`; טופס עם סמל (חובה), שם חברה, סוג (חובה), סטטוס. בעריכה — סמל readonly.

**ולידציות (קוד):**
- **Client:** `tickersForm.js` — `form.checkValidity()`; סמל ריק → הודעת "חובה להזין סמל" ב־#tickerFormValidationSummary ו־#tickerSymbolError; בתגובת API (catch) — הצגת שגיאה באותם אלמנטים (data-testid: ticker-form-validation-summary, ticker-symbol-error).
- **Backend:** אימות סמל (למשל provider / VALIDATE_SYMBOL_ALWAYS); כפילות סמל (unique); מניעת מחיקה אם יש user_tickers — לפי דוחות Team 20.

**בקרת תקינות נתונים:** `tickersDataIntegrityInit.js` — GET `/tickers/{id}/data-integrity`; בחירת טיקר לבדיקה מהדף.

## 2. ישות הטיקרים שלי (User Tickers — /me/tickers)

**נתיבים עיקריים:**  
`ui/src/views/management/userTicker/user_tickers.html`, `user_tickers.content.html`, `userTickerTableInit.js`, `userTickerAddForm.js`, `userTickerEditForm.js`.

**משמעויות:**
- **קישור משתמש–טיקר** — רשומה ב־GET `/me/tickers`, POST `/me/tickers` (טיקר קיים או סמל חדש), DELETE `/me/tickers/{ticker_id}`; סטטוס משתמש (פעיל/לא פעיל וכו').
- **תצוגה** — תחת "נתונים" → "הטיקרים שלי"; דף user_tickers.html — טבלת הטיקרים שלי, הוספת טיקר קיים או טיקר חדש.

**פיצ'רים (קוד):**
- **טבלה:** `userTickerTableInit.js` — `loadUserTickersData()` → GET `/me/tickers`; עמודות: סמל, מחיר, שינוי%, חברה, סוג, סטטוס, פעולות; מיון, עימוד; `price_source` / `price_as_of_utc` לתצוגת provenance (INTRADAY_FALLBACK).
- **פעולות שורה:** צפה בפרטי טיקר (js-action-view), **הוסף הערה לטיקר** (js-action-note), שנה שם תצוגה (js-action-edit), הסר מרשימה (js-action-delete) — עם aria-label ו־title.
- **הוספה:** `showUserTickerAddModal()` — בחירת טיקר קיים מרשימה (GET `/tickers`) או הזנת סמל חדש; POST `/me/tickers` עם ticker_id או symbol.

**ולידציות (קוד):**
- **Client:** בחירת טיקר או הזנת סמל; שמירה רק עם אחד מהם. עריכה — עדכון display_name/סטטוס.
- **Backend:** לפי דוחות — קישור ל־טיקר קנוני; סמל לא תקין → 422 וכו'.

## 3. השוואה קצרה

| היבט | ניהול טיקרים (D22) | הטיקרים שלי (/me/tickers) |
|------|---------------------|----------------------------|
| **API** | /tickers, /tickers/summary | /me/tickers |
| **תפקיד** | ניהול טיקרי מערכת (admin) | רשימת טיקרים של המשתמש |
| **הוספה** | מודל טופס (סמל, חברה, סוג, סטטוס) | מודל: טיקר קיים או סמל חדש |
| **פעולות שורה** | עריכה, מחיקה, תצוגה | צפייה, הערה, עריכת שם/סטטוס, הסרה |
| **ולידציה** | סמל חובה; שגיאת API ל־#tickerFormValidationSummary | תלויה ב־API (טיקר קיים/חדש) |

---

# סיכום כפול

## 1. סיכום העבודה מול MCP

- **בוצע:** התחברות (type + click), ניווט ל־tickers ו־user_tickers, פתיחת מודל הוספת טיקר, ניסיון שמירה בלי סמל (ולידציה client-side), ביטול, מעבר להטיקרים שלי, unlock.
- **כלים:** browser_tabs, browser_snapshot, browser_lock/unlock, browser_navigate, browser_type, browser_click — כולם פעלו מול localhost:8080.
- **תועלת:** MCP מתאים ל־flow-based QA עם snapshot ו־refs; מתאים parity עם Selenium כשהסביבה זמינה.

## 2. סיכום מצב הקוד — ישויות טיקרים

- **טיקרים (D22):** טבלה מלאה, פילטרים (סוג + סטטוס), CRUD במודל, ולידציה בצד לקוח ובתגובת API (#tickerFormValidationSummary, #tickerSymbolError), בקרת תקינות נתונים.
- **הטיקרים שלי:** טבלה מ־GET /me/tickers, הוספת טיקר קיים/חדש, פעולות שורה (צפייה, הערה, עריכה, הסרה), תצוגת מחיר ו־provenance (price_source).

**ארטיפקט:**  
`documentation/reports/05-REPORTS/artifacts_SESSION_01/TEAM_50_MCP_QA_TICKERS_AND_USER_TICKERS_REPORT_v1.0.0.md`

---

**log_entry | TEAM_50 | MCP_QA_TICKERS_USER_TICKERS | DUAL_SUMMARY | 2026-03-07**
