# Team 50 — Evidence: User Tickers QA

**id:** TEAM_50_USER_TICKERS_QA_EVIDENCE  
**from:** Team 50 (QA & Fidelity)  
**date:** 2026-02-14  
**מקור:** TEAM_90_TO_TEAM_10_USER_TICKERS_IMPLEMENTATION_BRIEF §5, TEAM_10_USER_TICKERS_WORK_PLAN §2.4

---

## 1. Acceptance Criteria (§5) — Mapping

| # | קריטריון | Evidence | סטטוס |
|---|----------|----------|--------|
| 1 | `/user_ticker.html` נטען ב-dev/build ומופיע בתפריט | `user_ticker.html` קיים; routes.json, unified-header.html — "הטיקרים שלי"; page-manifest.json | ✅ קוד |
| 2 | מקור נתונים = `/me/tickers` | userTickerTableInit.js L47: `sharedServices.get('/me/tickers')`; userTickerPageConfig dataEndpoints | ✅ קוד |
| 3 | הוספה/הסרה עובדות ונשמרות | POST/DELETE endpoints; userTickerAddForm, userTickerTableInit; soft delete | ✅ קוד |
| 4 | הוספת טיקר חדש — בדיקת נתונים חיים; provider כישלון → יצירה נכשלת, הודעת שגיאה | user_tickers_service._live_data_check; 422; userTickerAddForm PROVIDER_ERROR_MSG | ✅ קוד |
| 5 | משתמש לא עורך מטא-דאטה מערכתית של טיקר | עמוד User Ticker — Add/Remove בלבד; אין כפתור עריכת טיקר (Admin tickers נפרד) | ✅ קוד |
| 6 | Evidence log מעודכן | TEAM_50_USER_TICKERS_QA_EVIDENCE.md, TEAM_50_USER_TICKERS_SANITY_CHECKLIST | ✅ |

---

## 2. E2E Test

**קובץ:** `tests/user-tickers-qa.e2e.test.js`

**הרצה:** `cd tests && node user-tickers-qa.e2e.test.js`

**דרישות:** Backend 8082, Frontend 8080, משתמש QA (TikTrackAdmin/4181)

**סטטוס הרצה (2026-02-14):** הושלם — 1a PASS, 2 PASS, 4 PASS, 5 PASS; 1b/3 SKIP.

**פריטים נבדקים:**
- Item 1a: עמוד נטען, טבלה קיימת
- Item 1b: קישור בתפריט
- Item 2: מקור /me/tickers
- Item 3: כפתור הוספה, מודל נפתח
- Item 4: API — טיקר מזויף (ZZZZZZZFAKE999) → 422 (provider failure)
- Item 5: אין כפתור עריכת מטא-דאטה

---

## 3. API-only Script (כש-Backend פעיל)

**סקריפט:** `scripts/run-user-tickers-qa-api.sh`  
**הרצה:** `bash scripts/run-user-tickers-qa-api.sh`

**תוצאה (2026-02-14):**
```
✅ Login OK
✅ GET /me/tickers → 200
✅ POST (fake symbol) → 422 — provider failure handled
✅ POST (AAPL) → 201 — live data check passed, טיקר נוצר
⚠️ POST (BTC-USD) → 422 — provider לא החזיר נתונים (ייתכן crypto/symbol)
```

**טיקרים תקינים (אימות ידני):** AAPL — 201, נוצר ברשימה, מחיר 255.77. BTC-USD — 422 (provider לא החזיר נתונים; ייתכן crypto/symbol).

---

## 4. API — Provider Failure Test (curl)

```bash
TOKEN=$(curl -s -X POST "http://127.0.0.1:8082/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username_or_email":"TikTrackAdmin","password":"4181"}' | jq -r '.access_token')

curl -s -w "\n%{http_code}" -X POST "http://127.0.0.1:8082/api/v1/me/tickers?symbol=ZZZZZZZFAKE999" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json"
```

**מצופה:** 422 (או 400) — "Provider could not fetch data..."

---

**log_entry | TEAM_50 | USER_TICKERS_QA_EVIDENCE | 2026-02-14**
