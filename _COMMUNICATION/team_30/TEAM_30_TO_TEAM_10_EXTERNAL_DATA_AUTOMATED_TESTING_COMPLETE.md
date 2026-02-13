# Team 30 → Team 10: External Data — Automated Testing (Suite E) — הושלם

**from:** Team 30 (UI)  
**to:** Team 10 (The Gateway)  
**date:** 2026-02-13  
**מקור:** TEAM_10_TO_TEAM_30_EXTERNAL_DATA_AUTOMATED_TESTING_MANDATE  
**סטטוס:** ✅ **הושלם — מנדט מומש במלואו**

---

## 1. סיכום המימוש — סוויטה E (Clock + Tooltip)

| בדיקה | דרישה | סטטוס |
|-------|--------|--------|
| E1 | staleness=ok → שעון ניטרלי + tooltip | PASS |
| E2 | staleness=warning → צבע אזהרה + tooltip | PASS |
| E3 | staleness=na → צבע alert + tooltip | PASS |
| E4 | No banner — אין באנר | PASS |

**הרצה:** `cd tests && npm run test:external-data-suite-e` — **5/5 PASS** (כולל Login).  
**קובץ:** `tests/external-data-suite-e-staleness-clock.e2e.test.js`  
**package.json:** `test:external-data-suite-e` מצביע ל־`external-data-suite-e-staleness-clock.e2e.test.js`  
**Nightly:** `scripts/run-nightly-external-data.sh` מריץ Suite E (יחד עם A–D). **Smoke:** לא כוללת Suite E (לפי ההנחיה).

---

## 2. היקף יישום

| פריט | תוכן |
|------|------|
| **סוויטה E — UI (Clock + Tooltip)** | אוטומציית E2E (Selenium) — וידוא התנהגות שעון סטגנציה ו-tooltip לפי ערך staleness |

---

## 3. דרישות שמומשו

- `staleness=ok` → שעון ניטרלי (neutral clock) — class `staleness-clock--ok`, tooltip "נתונים מעודכנים"
- `staleness=warning` → צבע אזהרה + tooltip — class `staleness-clock--warning`, tooltip "נתונים בני יותר מ־15 דקות..."
- `staleness=na` → צבע alert + tooltip — class `staleness-clock--na`, tooltip "נתוני EOD..."
- **No banner** — וידוא שאין באנר (eod-warning-banner לא קיים או מוסתר)

---

## 4. תוצרים

| תוצר | נתיב |
|------|------|
| **קובץ בדיקות E2E** | `tests/external-data-suite-e-staleness-clock.e2e.test.js` |
| **סקריפט הרצה** | `npm run test:external-data-suite-e` (מתוך `tests/`) |

---

## 5. אופן הרצה

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

## 6. אינטגרציה ב-CI

- סוויטה E מיועדת ל-**Nightly** (per Team 90 Directive)
- Team 10/50: הרצה ב-Nightly, רישום Evidence
- סקריפט מוכן להרצה אוטומטית (`HEADLESS=true` לתצורת CI)

---

## 7. Evidence

- בדיקות מופעלות באמצעות `executeScript` — הזרקת `updateStalenessClock('ok'|'warning'|'na')` ווידוא class + title
- עמוד נבדק: `trading_accounts.html` (מכיל stalenessClock + eodStalenessCheck)
- **ריצת אימות:** 2026-01-31 — 5/5 PASS (HEADLESS=true)
- **ריצת אימות חוזרת:** 2026-02-13 — E1–E4 PASS (5/5 כולל Login)

---

## 8. אינטגרציה

- **scripts/run-nightly-external-data.sh:** Suite E מריץ `npm run test:external-data-suite-e` (מתוך `tests/`)
- **tests/package.json:** `test:external-data-suite-e` → `node external-data-suite-e-staleness-clock.e2e.test.js`

---

**log_entry | TEAM_30 | EXTERNAL_DATA_AUTOMATED_TESTING | SUITE_E_COMPLETE | 2026-02-13**
**log_entry | TEAM_30 | EXTERNAL_DATA_AUTOMATED_TESTING | SUITE_E_VERIFIED | 2026-01-31**
