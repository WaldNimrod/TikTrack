# Team 20 → Team 10: אפיון מוצע — השלמת מטא־דאטה לטיקרים (Ticker Metadata Enrichment)

**From:** Team 20 (Backend)  
**To:** Team 10 (The Gateway)  
**Date:** 2026-02-14  
**נושא:** השלמת שדות חסרים (company_name וכו') מספקי נתונים חיצוניים  
**סטטוס:** אפיון לאישור

---

## 1. רקע

### 1.1 המצב הנוכחי
- יצירת טיקר דרך "הטיקרים שלי" — המשתמש יכול להזין **סימבול** בלבד (company_name אופציונלי).
- בעת יצירה — בדיקת נתונים חיים (live data check) מ־Yahoo→Alpha ל־**מחיר** בלבד.
- טיקרים נוצרים עם `company_name = NULL` אם המשתמש לא הזין — הצגה לא מיטבית.

### 1.2 דרישה
- המערכת **תשלים** שדות נוספים (למשל `company_name`) מספקי נתונים חיצוניים.
- **כלל מנצח:** אם המשתמש הזין ערך — **הנתון של המשתמש מנצח**; אין דריסה.
- **לא קריטי מיידי** — ניתן לממש כחלק מתהליך תחזוקת נתונים.

---

## 2. מקורות נתונים (ספקים)

### 2.1 Yahoo Finance — v7/finance/quote
מחזיר בין היתר:
- `shortName` — שם מקוצר (למשל "Apple Inc.")
- `longName` — שם מלא (למשל "Apple Inc.")
- `quoteType` — STOCK | ETF | et al.

**מיקום:** `_fetch_price_via_quote_api` כבר קורא ל־v7/quote — ניתן להרחיב/לשלוף גם metadata.

### 2.2 Alpha Vantage
- `GLOBAL_QUOTE` — מחיר בלבד.
- `OVERVIEW` — מחזיר Name, Sector, Industry (דורש קריאה נפרדת).

---

## 3. שדות להשלמה (מוצע)

| שדה | מקור Yahoo | מקור Alpha | העדיפות |
|-----|------------|------------|---------|
| `company_name` | shortName / longName | Name (OVERVIEW) | P1 |
| `ticker_type` | quoteType → STOCK/ETF | — | P2 (אם יש מיפוי) |

**שלב ראשון:** `company_name` בלבד. הרחבה עתידית — sector, industry (דורש מיפוי ל־sector_id, industry_id).

---

## 4. אופציות יישום

### אופציה A — השלמה בעת יצירה (Inline)
**מתי:** בשלב יצירת הטיקר ב־POST /me/tickers (אחרי live data check מוצלח).  
**איך:** הרחבת הקריאה ל־provider — במקום/בנוסף ל־`get_ticker_price` — קריאה אחת ל־Yahoo v7/quote שמחזירה גם shortName/longName.  
**יתרון:** הטיקר מגיע מלא מיד.  
**חיסרון:** קריאה נוספת/מורחבת בסבב יצירה; תלות בזמינות הספק.

### אופציה B — Job תחזוקה (Batch)
**מתי:** Job ייעודי או שלב בתוך job קיים (למשל History Backfill או EOD).  
**איך:**  
1. שליפה: `SELECT id, symbol FROM market_data.tickers WHERE company_name IS NULL AND deleted_at IS NULL`  
2. לכל טיקר — fetch מ־Yahoo v7/quote, שליפה של shortName/longName  
3. עדכון: `UPDATE ... SET company_name = ? WHERE id = ?` (רק ל־NULL)  
**יתרון:** לא מעמיס על יצירה; ניתן לשלוט בתדירות ו־rate limit.  
**חיסרון:** השלמה לא מיידית.

### אופציה C — היברידי (מומלץ)
- **בעת יצירה:** אם `get_ticker_price` משתמש ב־v7/quote — לחלץ גם shortName/longName ולהוסיף ל־Ticker אם company_name חסר והמשתמש לא הזין.  
- **תחזוקה:** Job (אופציונלי) שמשלים טיקרים ישנים עם company_name NULL.

---

## 5. כלל "המשתמש מנצח"

| מצב | פעולה |
|-----|--------|
| המשתמש הזין company_name | **לא** לעדכן מ־provider |
| company_name חסר (NULL) | להשלים מ־provider |
| אחרי השלמה — המשתמש ערך ידנית | בעתיד: שמירת "user_override" אופציונלי (לא בשלב זה) |

**יישום:** `UPDATE` רק כאשר `company_name IS NULL` (או שדה אחר חסר).

---

## 6. תלויות בתהליכים קיימים

| תהליך | תיאור |
|-------|--------|
| **Live data check** | קריאה ל־Yahoo/Alpha — כבר קיימת. ניתן להרחיב את התשובה או להוסיף קריאה מקבילה ל־metadata. |
| **History Backfill** | `sync_ticker_prices_history_backfill.py` — עובר על טיקרים עם <250 שורות. **אופציה:** שלב "enrich metadata" לפני/אחרי — טיקרים עם company_name NULL. |
| **EOD Sync** | `sync_ticker_prices_eod.py` — לא מתאים ישירות (מחירים). |
| **Job ייעודי** | `sync_ticker_metadata_enrichment.py` — חדש; Cron נפרד או חלק מ־History Backfill. |

---

## 7. המלצה

**אופציה C (היברידי):**

1. **שלב א' — Inline בעת יצירה**
   - הרחבת `_live_data_check` או זרימה מקבילה: בעת fetch מ־Yahoo v7/quote — לחלץ shortName/longName.
   - אם המשתמש לא הזין company_name — להשתמש בערך מהספק בעת יצירת הטיקר.
   - מאמץ: נמוך (שינוי ב־user_tickers_service + פונקציית fetch).

2. **שלב ב' — Job תחזוקה**
   - סקריפט `sync_ticker_metadata_enrichment.py` — טיקרים עם company_name IS NULL.
   - Cron: אחרי History Backfill (למשל 21:15 UTC) או יום נפרד.
   - Rate limit: תואם ל־Yahoo (5/min ממילא) — batch קטן.

---

## 8. שאלות לאישור

1. **אישור גישה:** האם לאשר אופציה C (היברידי)?  
2. **שדות:** האם בשלב ראשון רק company_name, או גם ticker_type?  
3. **תזמון Job:** האם כחלק מ־History Backfill או כ־Job נפרד?  
4. **User override:** האם בשלב זה רק "משתמש לא הזין → משלימים", או לתכנן מנגנון "user_override" לעתיד?

---

## 9. מקורות

| מסמך | נתיב |
|------|------|
| USER_TICKERS Brief | _COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_USER_TICKERS_IMPLEMENTATION_BRIEF.md |
| user_tickers_service | api/services/user_tickers_service.py |
| Yahoo provider | api/integrations/market_data/providers/yahoo_provider.py |
| Cron Schedule | documentation/05-REPORTS/artifacts/TEAM_60_CRON_SCHEDULE.md |

---

**log_entry | [Team 20] | TICKER_METADATA_ENRICHMENT | SPEC_PROPOSAL | 2026-02-14**
