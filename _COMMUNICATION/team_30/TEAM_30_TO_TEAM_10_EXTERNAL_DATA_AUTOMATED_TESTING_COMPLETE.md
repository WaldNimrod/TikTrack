# Team 30 → Team 10: External Data — Automated Testing (Suite E) — הושלם

**from:** Team 30 (UI)  
**to:** Team 10 (The Gateway)  
**date:** 2026-02-13  
**מקור:** TEAM_10_TO_TEAM_30_EXTERNAL_DATA_AUTOMATED_TESTING_MANDATE  
**סטטוס:** ✅ **הושלם**

---

## 1. היקף יישום

| פריט | תוכן |
|------|------|
| **סוויטה E — UI (Clock + Tooltip)** | אוטומציית E2E (Selenium) — וידוא התנהגות שעון סטגנציה ו-tooltip לפי ערך staleness |

---

## 2. דרישות שמומשו

- `staleness=ok` → שעון ניטרלי (neutral clock) — class `staleness-clock--ok`, tooltip "נתונים מעודכנים"
- `staleness=warning` → צבע אזהרה + tooltip — class `staleness-clock--warning`, tooltip "נתונים בני יותר מ־15 דקות..."
- `staleness=na` → צבע alert + tooltip — class `staleness-clock--na`, tooltip "נתוני EOD..."
- **No banner** — וידוא שאין באנר (eod-warning-banner לא קיים או מוסתר)

---

## 3. תוצרים

| תוצר | נתיב |
|------|------|
| **קובץ בדיקות E2E** | `tests/external-data-suite-e-staleness-clock.test.js` |
| **סקריפט הרצה** | `npm run test:external-data-suite-e` (מתוך `tests/`) |

---

## 4. אופן הרצה

```bash
# מתוך תיקיית הפרויקט
cd tests
npm run test:external-data-suite-e
```

**תנאי מקדימים:**
- Frontend רץ על `http://127.0.0.1:8080` (או עדכון `TEST_CONFIG.frontendUrl` ב-`selenium-config.js`)
- Backend רץ על `http://127.0.0.1:8082` (אימות + API exchange-rates)
- משתמש QA: TikTrackAdmin / 4181 (או `PHASE2_TEST_USERNAME`, `PHASE2_TEST_PASSWORD`)
- Chrome + chromedriver מותקנים

---

## 5. אינטגרציה ב-CI

- סוויטה E מיועדת ל-**Nightly** (per Team 90 Directive)
- Team 10/50: הרצה ב-Nightly, רישום Evidence
- סקריפט מוכן להרצה אוטומטית (`HEADLESS=true` לתצורת CI)

---

## 6. Evidence

- בדיקות מופעלות באמצעות `executeScript` — הזרקת `updateStalenessClock('ok'|'warning'|'na')` ווידוא class + title
- עמוד נבדק: `trading_accounts.html` (מכיל stalenessClock + eodStalenessCheck)
- **ריצת אימות:** 2026-01-31 — 5/5 PASS (HEADLESS=true)

---

## 7. אינטגרציה

- **run-external-data-nightly.js:** Suite E מריץ `external-data-suite-e-staleness-clock.test.js`
- **Makefile:** `make test-suite-e` — הרצת סוויטה E

---

**log_entry | TEAM_30 | EXTERNAL_DATA_AUTOMATED_TESTING | SUITE_E_COMPLETE | 2026-02-13**
**log_entry | TEAM_30 | EXTERNAL_DATA_AUTOMATED_TESTING | SUITE_E_VERIFIED | 2026-01-31**
