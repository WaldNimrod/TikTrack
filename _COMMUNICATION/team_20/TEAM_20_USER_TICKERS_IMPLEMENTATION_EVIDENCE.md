# Evidence: User Tickers ("הטיקרים שלי") — מימוש Backend

**From:** Team 20 (Backend)  
**To:** Team 10 (The Gateway)  
**Date:** 2026-02-14  
**מקור:** TEAM_90_TO_TEAM_10_USER_TICKERS_IMPLEMENTATION_BRIEF, TEAM_10_USER_TICKERS_WORK_PLAN

---

## 1. סטטוס משימות

| מזהה | משימה | תוצר | סטטוס |
|------|--------|------|--------|
| 20.UT.1 | DDL + Migration | `scripts/migrations/p3_020_user_tickers_and_ticker_status.sql` | ✅ |
| 20.UT.2 | GET /me/tickers | `api/routers/me_tickers.py`, `api/services/user_tickers_service.py` | ✅ |
| 20.UT.3 | POST /me/tickers + live data check | idem + `_live_data_check(symbol)` Yahoo→Alpha | ✅ |
| 20.UT.4 | DELETE /me/tickers/{ticker_id} | idem — soft delete | ✅ |
| 20.UT.5 | בדיקת נתונים לפני יצירה | `_live_data_check` → 422 אם אין נתונים | ✅ |

---

## 2. קבצים

| קובץ | תפקיד |
|------|--------|
| `scripts/migrations/p3_020_user_tickers_and_ticker_status.sql` | DDL: user_data.user_tickers; status ב-tickers |
| `api/models/user_tickers.py` | UserTicker ORM |
| `api/services/user_tickers_service.py` | get_my_tickers, add_ticker, remove_ticker; _live_data_check |
| `api/routers/me_tickers.py` | GET/POST/DELETE /api/v1/me/tickers |

---

## 3. DDL — user_data.user_tickers

- **עמודות:** id, user_id, ticker_id, created_at, deleted_at
- **FK:** user_id → user_data.users, ticker_id → market_data.tickers
- **UNIQUE:** (user_id, ticker_id) WHERE deleted_at IS NULL
- **אינדקסים:** idx_user_tickers_user_ticker_active, idx_user_tickers_user_id, idx_user_tickers_ticker_id

---

## 4. Endpoints

| Method | Path | תיאור |
|--------|------|--------|
| GET | /api/v1/me/tickers | רשימת טיקרים של המשתמש המחובר |
| POST | /api/v1/me/tickers | הוספת קיים (ticker_id) או יצירת חדש (symbol) + live check |
| DELETE | /api/v1/me/tickers/{ticker_id} | הסרה מהרשימה (soft delete) |

---

## 5. Live Data Check

- **מיקום:** `user_tickers_service._live_data_check(symbol)`
- **זרימה:** Yahoo → Alpha; fetch EOD/last price
- **הצלחה:** price > 0 → True
- **כישלון:** → 422, טיקר לא נוצר

---

## 6. סטטוס טיקר חדש

**נעול:** status = `pending` (TT2_TICKER_STATUS_MARKET_DATA_LOADING_SSOT)

---

## 7. מסירת Migration ל-Team 60

**קובץ:** `scripts/migrations/p3_020_user_tickers_and_ticker_status.sql`  
**הודעה:** `_COMMUNICATION/team_20/TEAM_20_TO_TEAM_60_USER_TICKERS_MIGRATION_HANDOFF.md`

---

**log_entry | [Team 20] | USER_TICKERS | IMPLEMENTATION_COMPLETE | 2026-02-14**
