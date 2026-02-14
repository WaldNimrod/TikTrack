# Team 50 — Sanity Checklist: User Tickers

**id:** TEAM_50_USER_TICKERS_SANITY_CHECKLIST  
**from:** Team 50 (QA & Fidelity)  
**date:** 2026-02-14  
**מקור:** TEAM_10_USER_TICKERS_WORK_PLAN §2.4 (50.UT.2)

---

## 1. DB Schema

| פריט | תוצאה | Evidence |
|------|--------|----------|
| טבלה `user_data.user_tickers` קיימת | ✅ | p3_020 migration; TEAM_60_USER_TICKERS_MIGRATION_EVIDENCE |
| עמודות: user_id, ticker_id, created_at, deleted_at | ✅ | migration DDL |
| UNIQUE (user_id, ticker_id) WHERE deleted_at IS NULL | ✅ | idx_user_tickers_user_ticker_active |
| FK ל-users ו-tickers | ✅ | migration |
| אינדקסים | ✅ | idx_user_tickers_user_id, idx_user_tickers_ticker_id |

---

## 2. API Endpoints

| Method | Path | Auth | תוצאה |
|--------|------|------|--------|
| GET | /api/v1/me/tickers | get_current_user | ✅ |
| POST | /api/v1/me/tickers | get_current_user | ✅ |
| DELETE | /api/v1/me/tickers/{ticker_id} | get_current_user | ✅ |

**טיפול בשגיאות:**
- 401 — לא מאומת
- 404 — Ticker not found
- 409 — Ticker already in list
- 422 — Provider could not fetch data (live check failed)

---

## 3. UI

| פריט | תוצאה |
|------|--------|
| עמוד user_ticker.html | ✅ |
| תפריט — "הטיקרים שלי" | ✅ unified-header.html |
| טבלה — userTickersTable | ✅ |
| כפתור הוספה (.js-add-ticker) | ✅ |
| מודל הוספה — טיקר קיים + טיקר חדש | ✅ userTickerAddForm |
| פעולת הסרה (Delete) | ✅ userTickerTableInit |
| הודעת שגיאה provider | ✅ PROVIDER_ERROR_MSG |

---

## 4. שגיאות

| תרחיש | API | UI |
|-------|-----|-----|
| Provider כישלון (טיקר מזויף) | 422 | "אין נתונים זמינים מהספק..." |
| טיקר כבר ברשימה | 409 | הודעה מתאימה |
| 401 | 401 | redirect/login |
| 404 | 404 | "טיקר לא נמצא" |

---

## 5. אבטחה / Tenant

| פריט | Evidence |
|------|----------|
| Auth חובה | get_current_user ב-all endpoints |
| Tenant filtering | get_my_tickers — user_id מהמשתמש המחובר |
| אין גישה לטיקרים של משתמש אחר | Query מחזיר רק user_tickers של current_user |

---

## 6. שער א' — 0 SEVERE

- אין לוגים ברמת SEVERE (לפי Gate A)
- טיפול בשגיאות — ללא קריסה

---

**log_entry | TEAM_50 | USER_TICKERS_SANITY_CHECKLIST | 2026-02-14**
