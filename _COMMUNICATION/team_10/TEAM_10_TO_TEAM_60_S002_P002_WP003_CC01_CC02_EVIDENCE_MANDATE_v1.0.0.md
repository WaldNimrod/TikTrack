

# Team 10 → Team 60 | S002-P002-WP003 CC-01, CC-02 — מנדט איסוף עדות (סבב תיקון 5)

**project_domain:** TIKTRACK  
**id:** TEAM_10_TO_TEAM_60_S002_P002_WP003_CC01_CC02_EVIDENCE_MANDATE_v1.0.0  
**from:** Team 10 (Execution Orchestrator)  
**to:** Team 60 (Runtime/Infra)  
**cc:** Team 50, Team 90  
**date:** 2026-03-12  
**historical_record:** true
**status:** MANDATE_ACTIVE  
**trigger:** WP003 GATE_3 Remediation Round 5 — CC-WP003-01, CC-WP003-02 NOT_EVIDENCED  
**authority:** TEAM_90_TO_TEAM_60_TEAM_50_S002_P002_WP003_GATE7_PARTA_TARGETED_EVIDENCE_MANDATE_v2.0.2  

---

## Mandatory Identity Header

| Field | Value |
|-------|-------|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P002 |
| work_package_id | S002-P002-WP003 |
| gate_id | GATE_7 Part A |
| phase_owner | Team 90 |

---

## 1) מטרה

לייצר **עדות runtime תקפה** ל־CC-WP003-01 ו־CC-WP003-02 — חלונות market-open ו־off-hours נפרדים עם ספירת Yahoo מפורשת.

**מנדט Team 90:**  
`_COMMUNICATION/team_90/TEAM_90_TO_TEAM_60_TEAM_50_S002_P002_WP003_GATE7_PARTA_TARGETED_EVIDENCE_MANDATE_v2.0.2.md`

---

## 2) הרצות נדרשות

### Run A — חלון market-open
- **תנאי:** שעות שוק פעיל (מוגדר לפי אזור Exchange)
- **דרישה:** חלון timestamped מפורש
- **ספירה:** מספר קריאות Yahoo במחזור — **explicit call count**
- **סף PASS:** `cc_01_yahoo_call_count ≤ 5` → `pass_01 = true`

### Run B — חלון off-hours
- **תנאי:** שעות מחוץ לשוק
- **דרישה:** חלון timestamped מפורש (נפרד מ־Run A)
- **ספירה:** מספר קריאות Yahoo במחזור — **explicit call count**
- **סף PASS:** `cc_02_yahoo_call_count ≤ 2` → `pass_02 = true`

---

## 3) דליברבל

**נתיב:**  
`_COMMUNICATION/team_60/TEAM_60_TO_TEAM_90_S002_P002_WP003_GATE7_PARTA_RUNTIME_EVIDENCE_REPORT_v2.0.3.md`

**תוכן חובה:**
- Run A: timestamp, חלון capture, `cc_01_yahoo_call_count`, `pass_01`
- Run B: timestamp, חלון capture, `cc_02_yahoo_call_count`, `pass_02`
- CC-04: `pass_04` (כבר מאושר — לכלול ל־consistency)

**JSON ארטיפקט:**  
`documentation/05-REPORTS/artifacts/G7_PART_A_RUNTIME_EVIDENCE.json`

**שדות חובה:**
- `log_path` — לא ריק
- `cc_01_yahoo_call_count`, `cc_02_yahoo_call_count` — מפורשים
- `pass_01`, `pass_02`, `pass_04` — non-null

---

## 4) תיאום עם Team 50

Team 50 יציג **corroboration v2.0.3** שתואם בדיוק ל־verdicts שלכם. אין סתירה בין Team 60 ל־Team 50.

---

## 5) חיבור לסבב

- **GATE_3 Remediation Round 5:**  
  `_COMMUNICATION/team_10/TEAM_10_S002_P002_WP003_GATE3_REMEDIATION_ROUND5_PLAN_v1.0.0.md`
- **מקביל:** ניתן להריץ במקביל ל־Team 20 G7-FIX (אין תלות קוד).

---

**log_entry | TEAM_10 | CC01_CC02_EVIDENCE_MANDATE | TO_TEAM_60 | MANDATE_ACTIVE | 2026-03-12**
