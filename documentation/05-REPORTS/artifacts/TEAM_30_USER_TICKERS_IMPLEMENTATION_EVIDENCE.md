# Evidence: User Tickers ("הטיקרים שלי") — Frontend Implementation

**From:** Team 30 (Frontend)  
**To:** Team 10 (The Gateway), Team 40 (UI/UX)  
**Date:** 2026-01-31  
**Source:** TEAM_90_TO_TEAM_10_USER_TICKERS_IMPLEMENTATION_BRIEF, TEAM_10_USER_TICKERS_WORK_PLAN §2.2

---

## 1. משימות שבוצעו

| מזהה | משימה | תוצר | מיקום |
|------|--------|------|--------|
| 30.UT.1 | Template Factory / Page Manifest | `page-manifest.json`, `routes.json`, `vite.config.js` | `ui/scripts/`, `ui/public/` |
| 30.UT.2 | `user_ticker.html` | עמוד "הטיקרים שלי" | `ui/src/views/management/userTicker/user_ticker.html` |
| 30.UT.3 | PageConfig + TableInit | מקור `GET /me/tickers` | `userTickerPageConfig.js`, `userTickerTableInit.js` |
| 30.UT.4 | מודול הוספה | הוספת קיים + "טיקר חדש" inline | `userTickerAddForm.js` |
| 30.UT.5 | טיפול בשגיאות | הודעת provider failure ברורה | `userTickerAddForm.js` |
| 30.UT.6 | הסרה מהרשימה | `DELETE /me/tickers/{ticker_id}` + רענון | `userTickerTableInit.js` |

---

## 2. Template Factory & Page Manifest

- **page-manifest.json:** רישום `user_ticker` עם content + scripts (PhoenixTableSortManager, userTickerTableInit).
- **routes.json:** נתיב `/user_ticker.html`.
- **vite.config.js:** מיפוי route.
- **user_ticker.content.html:** תבנית עמוד עם summary + טבלה.

---

## 3. קבצי Frontend

| קובץ | תפקיד |
|------|--------|
| `user_ticker.content.html` | תוכן עמוד, טבלה, summary |
| `user_ticker.html` | עמוד מופק (build:pages) |
| `userTickerPageConfig.js` | הגדרת עמוד, עמודות, מקור נתונים |
| `userTickerTableInit.js` | טעינת `GET /me/tickers`, כפתור הוספה, מחיקה `DELETE`, View/Delete |
| `userTickerAddForm.js` | מודל: בחירת טיקר קיים + שדה "טיקר חדש" (symbol), `POST /me/tickers` |

---

## 4. מודול הוספה (30.UT.4 + 30.UT.5)

- **הוספת טיקר קיים:** רשימה נפתחת של טיקרים זמינים (לא ברשימה שלי).
- **טיקר חדש inline:** שדה symbol → `POST /me/tickers` עם `{ symbol: "..." }`.
- **Payloads:** snake_case ברשת (reactToApi).
- **שגיאת provider:** אם API מחזיר 4xx + מילות מפתח (provider/ספק/data/אין נתונים/no data/failed) — הצגת "אין נתונים זמינים מהספק עבור טיקר זה. לא ניתן ליצור טיקר." — **לא** יוצרים טיקר בממשק.

---

## 5. פעולות שורה

| פעולה | תיאור |
|--------|--------|
| View | ניווט לצפייה בטיקר |
| Delete | קריאה ל־`DELETE /me/tickers/{ticker_id}` + רענון הטבלה |

אין עריכה — המשתמש לא עורך מטא־דאטה מערכתית.

---

## 6. תלויות

- **Team 20:** `GET /api/v1/me/tickers`, `POST /api/v1/me/tickers`, `DELETE /api/v1/me/tickers/{ticker_id}`
- **Team 40:** מראה / CSS לפי SLA 30/40

---

## 7. בדיקה מקומית

1. `npm run build:pages` — ייצור `user_ticker.html`
2. `npm run dev` — טעינת `/user_ticker.html`
3. לאחר שה־API זמין: הוספת קיים, הוספת חדש, שגיאת provider, הסרה

---

**log_entry | [Team 30] | USER_TICKERS | FRONTEND_IMPLEMENTATION_COMPLETE | 2026-01-31**
