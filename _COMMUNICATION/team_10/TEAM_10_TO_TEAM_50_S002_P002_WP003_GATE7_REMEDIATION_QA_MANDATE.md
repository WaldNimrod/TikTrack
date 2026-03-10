# Team 10 → Team 50 | S002-P002-WP003 GATE_7 Remediation — QA Mandate

**project_domain:** TIKTRACK  
**id:** TEAM_10_TO_TEAM_50_S002_P002_WP003_GATE7_REMEDIATION_QA_MANDATE  
**from:** Team 10 (Gateway Orchestration)  
**to:** Team 50 (QA & Fidelity)  
**date:** 2026-03-10  
**status:** MANDATE_ACTIVE — activation after Teams 20/30 complete remediation  
**gate_id:** GATE_7  
**work_package_id:** S002-P002-WP003  
**authority:** Nimrod directive (GATE_7 re-run); TEAM_90_TO_TEAM_10_S002_P002_WP003_GATE7_BLOCKING_REPORT_v1.0.0  

---

## Mandatory Identity Header

| Field | Value |
|-------|-------|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P002 |
| work_package_id | S002-P002-WP003 |
| gate_id | GATE_7 |
| phase_owner | Team 10 |

---

## 1) Context

החבילה נפלה ב-GATE_7 בבדיקה אנושית של Nimrod. הממצאים לא התגלו בסבב QA הקודם.  

**דרישה מבנית:**  
- בדיקות Team 50 חייבות לכלול **אימות ישיר מול Nimrod** כחלק מתהליך ה-QA.  
- בדיקת Nimrod לא מחליפה — היא **נוספת** לאחר בדיקות Team 50.  
- Team 50 נדרש לממש **את כל הכלים** לרשותו, כולל **מערכת MCP החדשה**, לביצוע בדיקות איכותיות ומלאות.

---

## 2) Scope — QA on BF-001..004

**SSOT answers:** `_COMMUNICATION/team_00/TEAM_00_TO_TEAM_10_WP003_GATE7_REMEDIATION_ANSWERS_v1.0.0.md`

| BF ID | Scenario | Pass criterion |
|-------|----------|----------------|
| **BF-001** | Ticker transparency | ≥3 symbols: distinct current_price vs last_close_price; price_source non-empty; price_as_of_utc visible in column |
| **BF-002** | Currency | TEVA.TA, BTC-USD, ANAU.MI show correct currency (ILS, USD, EUR) in table and details |
| **BF-003** | Details + status | Details action opens full ticker modal; table has traffic-light status column per row |
| **BF-004** | Off-hours/staleness | Last-update coherent; off-hours state understandable from UI |

---

## 3) Mandatory Tools & Process

### 3.1 MCP (Browser)

- השתמש במערכת MCP (cursor-ide-browser / cursor-browser-extension) לביצוע בדיקות UI:
  - ניווט לדף Tickers
  - צילום snapshot
  - אימות ערכים per row (current_price, last_close, source, as-of, currency)
  - פתיחת details modal ואימות שדות
- Evidence: log/snapshot paths, screenshots.

### 3.2 Nimrod Direct Verification

- **לפני הגשה חוזרת ל-GATE_7:** Team 50 יבצע **session אימות משותף** עם Nimrod על התיקונים.
- Nimrod יאשר ידנית שהתרחישים BF-001..004 עוברים לפני ש�Team 10 תעביר ל-Team 90.
- תזמון: לאחר completion של Teams 20/30; לפני re-submission.

### 3.3 All Available Tools

- Unit tests, E2E (run-tickers-d22-qa-api.sh, tickers-d22-e2e).
- API-level checks (curl/Postman) for payload validation.
- MCP browser automation for UI validation.
- No assumptions — full coverage of BF scenarios.

---

## 4) Deliverable

**נתיב:** `_COMMUNICATION/team_50/TEAM_50_TO_TEAM_10_S002_P002_WP003_GATE7_REMEDIATION_QA_REPORT.md`

- status: PASS | BLOCK
- Per-BF results with evidence paths
- MCP run summary
- **Nimrod verification:** COMPLETED | PENDING (with date/session ref)
- Blockers if any

---

## 5) Re-Submission Path

1. Teams 20/30 complete remediation.
2. Team 50 runs full QA (including MCP).
3. Team 50 + Nimrod direct verification session.
4. On PASS: Team 50 report → Team 10 → Team 90 scenario package update → GATE_7 re-run.

---

**log_entry | TEAM_10 | WP003_G7_REMEDIATION_QA_MANDATE | TO_TEAM_50 | 2026-03-11**
