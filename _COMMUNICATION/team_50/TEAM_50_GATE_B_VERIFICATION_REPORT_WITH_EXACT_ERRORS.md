# Team 50 → צוותים: דוח אימות Gate B — כולל שגיאות ואזהרות מדויקות

**id:** `TEAM_50_GATE_B_VERIFICATION_REPORT_WITH_EXACT_ERRORS`  
**date:** 2026-02-08  
**context:** אימות לאחר אתחול שרת (per Server Start Policy). כל שגיאה ואזהרה — טקסט מלא.

---

## 1. אתחול שרת

- **Backend:** הופעל מחדש (`./scripts/start-backend.sh`)
- **Frontend:** פעיל (8080)

---

## 2. תוצאות Runtime

| מדד | ערך |
|-----|-----|
| Passed | 12 |
| Failed | 0 |
| Warnings | 1 |

### אזהרה מלאה (טקסט מדויק)

```
D18 Summary API: /api/v1/brokers_fees/summary - Status 400 | response: {"detail":"Invalid broker_fee_id format","error_code":"VALIDATION_INVALID_FORMAT"}
```

### ניתוח

- **Endpoint:** `GET /api/v1/brokers_fees/summary`
- **סטטוס:** 400 Bad Request
- **Response body:** `{"detail":"Invalid broker_fee_id format","error_code":"VALIDATION_INVALID_FORMAT"}`
- **משמעות:** הבקשה ל־`/brokers_fees/summary` מנותבת ל־`/brokers_fees/{id}` כאשר `id="summary"` — "summary" לא ULID תקין → Validation error.

### מקור הבעיה (לפי Route order)

ב־`api/routers/brokers_fees.py`:
- `GET /{id}` (שורה ~79) מוגדר **לפני** `GET /summary` (שורה ~224)
- FastAPI מתאים קודם ל־`/{id}` → "summary" נתפס כ־id → Validation נכשל

**תיקון נדרש (Team 20):** להעביר את `GET /summary` **לפני** `GET /{id}` — routes ספציפיים לפני parameterized.

---

## 3. תוצאות E2E (rerun-failed)

| בדיקה | סטטוס |
|-------|--------|
| D16 Trading Accounts | ✅ PASS |
| D18 Brokers Fees | ❌ FAIL |
| D21 Cash Flows | ❌ FAIL |
| Security_TokenLeakage | ✅ PASS |

### הודעות SEVERE מלאות (E2E — D18)

```
1. http://localhost:8080/api/v1/brokers_fees/summary - Failed to load resource: the server responded with a status of 400 (Bad Request)
2. http://localhost:8080/api/v1/brokers_fees/summary?search= - Failed to load resource: the server responded with a status of 400 (Bad Request)
```

### הודעות SEVERE מלאות (E2E — D21)

```
1. http://localhost:8080/api/v1/cash_flows/currency_conversions?page=1&page_size=25 - Failed to load resource: the server responded with a status of 400 (Bad Request)
2. http://localhost:8080/api/v1/cash_flows/currency_conversions?search= - Failed to load resource: the server responded with a status of 400 (Bad Request)
```

*(currency_conversions — יש לבדוק אם אותה בעיית route order: `/{id}` לפני `/currency_conversions`)*

---

## 4. ארטיפקטים

- **Runtime:** `documentation/05-REPORTS/artifacts_SESSION_01/phase2-runtime-results.json`
- **E2E:** `documentation/05-REPORTS/artifacts_SESSION_01/phase2-e2e-artifacts/console_logs.json`

---

## 5. סיכום תיקונים — Team 20

| בעיה | תיקון |
|------|--------|
| brokers_fees/summary → 400 "Invalid broker_fee_id format" | להעביר `GET /summary` לפני `GET /{id}` ב־brokers_fees router |
| currency_conversions → 400 | לבדוק route order ב־cash_flows router |

---

**Team 50 (QA & Fidelity)**  
**log_entry | GATE_B | VERIFICATION_REPORT_EXACT_ERRORS | 2026-02-08**
