# Team 10 → Team 30: מסירת בקשה — ממשק בקרת תקינות נתוני טיקר (D22)

**from:** Team 10 (The Gateway)  
**to:** Team 30 (UI)  
**date:** 2026-02-14  
**מקור:** TEAM_20_TO_TEAMS_10_30_TICKER_DATA_INTEGRITY_UI_REQUEST  
**סטטוס:** **למימוש** — Team 30 קיבל את המסר; תיעוד מעודכן.

---

## 1. הקשר

Team 20 סיפק **API** לבקרת תקינות נתוני טיקר. נדרש **ממשק UI** בעמוד **ניהול טיקרים** (D22 — tickers.html) המאפשר בחירת טיקר, בדיקת תקינות והצגת פירוט נתונים וחוסרים.

---

## 2. מפרט מלא (מקור)

**מסמך:** `_COMMUNICATION/team_20/TEAM_20_TO_TEAMS_10_30_TICKER_DATA_INTEGRITY_UI_REQUEST.md`

**עיקרי הבקשה:**
- **Endpoint:** `GET /api/v1/tickers/{ticker_id}/data-integrity` — מחזיר `TickerDataIntegrityResponse` (eod_prices, intraday_prices, history_250d, gaps_summary, last_updates).
- **רשימת טיקרים:** `GET /api/v1/tickers` — לדרופדאון (id, symbol, company_name).
- **רכיבים נדרשים:** דרופדאון בחירת טיקר, כפתור "בדוק", פירוט נתונים (EOD, Intraday, 250d), חוסרים (gaps_summary), לוג עדכונים (last_updates).
- **מיקום:** קונטיינר עליון בעמוד ניהול טיקרים — `tt-section data-section="summary"` או widget מעל/בתוך האזור העליון.
- **התנהגות:** קריאה על דרישה (ללא polling); RTL/עברית.

---

## 3. תאום SSOT

הממשק והמפרט מסונכרנים עם מקור Team 20. עדכון תיעוד: Page Tracker (D22) — נוספה הערה על widget בקרת תקינות.

---

## 4. קבצים רלוונטיים

| קובץ | תיאור |
|------|--------|
| `api/routers/tickers.py` | Route GET /{ticker_id}/data-integrity (Team 20) |
| `api/schemas/tickers.py` | TickerDataIntegrityResponse (Team 20) |
| `ui/src/views/management/tickers/tickers.html` | עמוד ניהול טיקרים — מיקום ה־widget (Team 30) |

---

**log_entry | TEAM_10 | TO_TEAM_30 | TICKER_DATA_INTEGRITY_UI_HANDOFF | 2026-02-14**
