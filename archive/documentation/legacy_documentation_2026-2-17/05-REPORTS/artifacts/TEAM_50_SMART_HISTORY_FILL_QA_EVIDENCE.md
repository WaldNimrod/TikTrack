# Team 50 — Smart History Fill QA — Evidence

**id:** TEAM_50_SMART_HISTORY_FILL_QA_EVIDENCE  
**date:** 2026-01-31  
**מקור:** TEAM_10_TO_TEAM_50_SMART_HISTORY_FILL_QA_REQUEST

---

## ריצת בדיקות

### E2E (Selenium)

```
cd tests && node smart-history-fill-qa.e2e.test.js
```

**תוצאה (2026-01-31 — רה־ריצה לאחר תיקונים):**
- Item 1 (Backfill button): ✅ PASS
- Item 2 (Force Reload block): SKIP — טיקרים 242 שורות (Yahoo 429)
- Item 3 (force_reload Admin): SKIP
- Item 4 (force_reload 403): ✅ PASS (Router guard)
- Item 5 (404): ✅ PASS

### API — 404

```bash
curl -s -X POST "http://127.0.0.1:8082/api/v1/tickers/01HXXXXXXXXXXXXXXXFAKEULID/history-backfill" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{}'
```

**תשובה:** `{"detail":"Ticker not found","error_code":"USER_NOT_FOUND"}` — 404

### API — gap_fill (Admin)

```bash
curl -s -X POST "http://127.0.0.1:8082/api/v1/tickers/683FBMN1N68ERVQ0MEC646NTK4/history-backfill" \
  -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" -d '{}'
```

**תשובה:** 200 — `{"status":"completed",...}` או `{"status":"no_op",...}`

---

### API — 403 (force_reload + USER)

```bash
# Register USER, call force_reload
curl -s -w "%{http_code}" -X POST ".../tickers/{id}/history-backfill?mode=force_reload" -H "Authorization: Bearer $USER_TOKEN" -d '{}'
```

**תשובה:** 403 — `{"detail":"force_reload requires Admin...","error_code":"SERVER_ERROR"}`

---

**log_entry | TEAM_50 | SMART_HISTORY_FILL_QA_EVIDENCE | 2026-01-31**  
**log_entry | TEAM_50 | RERUN_EVIDENCE | 2026-01-31**
