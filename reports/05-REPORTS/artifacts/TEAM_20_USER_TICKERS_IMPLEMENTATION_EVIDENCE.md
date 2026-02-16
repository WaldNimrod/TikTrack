# Evidence: User Tickers ("הטיקרים שלי") — Backend Implementation

**From:** Team 20 (Backend)  
**To:** Team 10 (The Gateway), Team 60 (DevOps)  
**Date:** 2026-02-14  
**Source:** TEAM_90_TO_TEAM_10_USER_TICKERS_IMPLEMENTATION_BRIEF, TEAM_10_USER_TICKERS_WORK_PLAN §2.1

---

## 1. משימות שבוצעו

| מזהה | משימה | תוצר | מיקום |
|------|--------|------|--------|
| 20.UT.1 | DDL + Migration | `p3_020_user_tickers_and_ticker_status.sql` | `scripts/migrations/` |
| 20.UT.2 | GET /me/tickers | Endpoint | `api/routers/me_tickers.py` |
| 20.UT.3 | POST /me/tickers | Endpoint + live data check | `api/services/user_tickers_service.py` |
| 20.UT.4 | DELETE /me/tickers/{ticker_id} | Endpoint | `api/routers/me_tickers.py` |
| 20.UT.5 | בדיקת נתונים לפני יצירה | _live_data_check() | `api/services/user_tickers_service.py` |

---

## 2. DDL — user_data.user_tickers

```sql
CREATE TABLE user_data.user_tickers (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES user_data.users(id) ON DELETE CASCADE,
    ticker_id UUID NOT NULL REFERENCES market_data.tickers(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
-- UNIQUE (user_id, ticker_id) WHERE deleted_at IS NULL — via partial index
```

**status** נוסף ל־`market_data.tickers` (אם חסר): `pending|active|inactive|cancelled` per TT2_TICKER_STATUS_MARKET_DATA_LOADING_SSOT.

---

## 3. Endpoints

| Method | Path | תיאור |
|--------|------|--------|
| GET | `/api/v1/me/tickers` | רשימת טיקרים של המשתמש המחובר |
| POST | `/api/v1/me/tickers` | הוספת טיקר קיים (ticker_id) או יצירת חדש (symbol) + live data check |
| DELETE | `/api/v1/me/tickers/{ticker_id}` | הסרה מהרשימה (soft delete) |

---

## 4. Live Data Check

לפני יצירת טיקר חדש: קריאה ל־Yahoo → Alpha ל־get_ticker_price(symbol).  
אם שני הספקים מחזירים ריק/כשל → 422, טיקר לא נוצר.  
אם לפחות אחד מחזיר נתונים תקפים → יוצרים טיקר עם status=pending ומקשרים ב־user_tickers.

---

## 5. העברה ל־Team 60

**מיקום Migration:** `scripts/migrations/p3_020_user_tickers_and_ticker_status.sql`  
**פעולה נדרשת:** הרצת ה-migration בסביבות הרלוונטיות לפני שימוש ב-endpoints.

---

## 6. קבצים שנוצרו/עודכנו

| קובץ | שינוי |
|------|--------|
| `scripts/migrations/p3_020_user_tickers_and_ticker_status.sql` | חדש |
| `api/models/user_tickers.py` | חדש |
| `api/models/tickers.py` | תוספת status |
| `api/models/identity.py` | תוספת user_tickers relationship |
| `api/services/user_tickers_service.py` | חדש |
| `api/routers/me_tickers.py` | חדש |
| `api/main.py` | רישום me_tickers router |
| `api/models/__init__.py` | ייצוא UserTicker |

---

**log_entry | [Team 20] | USER_TICKERS | IMPLEMENTATION_COMPLETE | 2026-02-14**
