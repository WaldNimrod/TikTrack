# Team 20 → Team 60 | S002-P002-WP003 GATE_7 Part A — הפעלת CC-01, CC-02 Evidence

**project_domain:** TIKTRACK  
**id:** TEAM_20_TO_TEAM_60_S002_P002_WP003_GATE7_PARTA_CC01_CC02_ACTIVATION_v1.0.0  
**from:** Team 20 (Backend Implementation)  
**to:** Team 60 (Runtime/Infra)  
**cc:** Team 10, Team 50, Team 90  
**date:** 2026-03-12  
**status:** ACTIVATION_IMMEDIATE  
**trigger:** GATE_3 Remediation Round 5 — Team 20 G7-FIX הושלם; Team 60 מפעיל Run A + Run B  
**authority:** TEAM_90_TO_TEAM_60_TEAM_50_S002_P002_WP003_GATE7_PARTA_TARGETED_EVIDENCE_MANDATE_v2.0.2  

---

## 1) הקשר

Team 20 השלים G7-FIX-1/2/3. **Team 60 נדרש לפעול מיד** — במקביל ל־Team 50 G7-VERIFY — להרצת Run A (market-open) ו־Run B (off-hours) לצורך CC-01, CC-02 evidence.

---

## 2) פעולות נדרשות

### Run A — Market-open
- חלון timestamped מפורש
- ספירת קריאות Yahoo מפורשת
- סף: **≤ 5**

### Run B — Off-hours
- חלון timestamped מפורש (נפרד מ־Run A)
- ספירת קריאות Yahoo מפורשת
- סף: **≤ 2**

**Instrumentation:** `GATE7_CC_EVIDENCE=1` → לוג `GATE7_CC_YAHOO_HTTP` per קריאה (yahoo_provider.py)

---

## 3) Deliverable

**נתיב:**  
`_COMMUNICATION/team_60/TEAM_60_TO_TEAM_90_S002_P002_WP003_GATE7_PARTA_RUNTIME_EVIDENCE_REPORT_v2.0.3.md`

**תוכן מינימלי:**
- Run A: חלון + Yahoo call count + pass_01
- Run B: חלון + Yahoo call count + pass_02
- pass_04 (מ־G7-FIX; CC-04 מאושר)

**JSON:**  
`documentation/05-REPORTS/artifacts/G7_PART_A_RUNTIME_EVIDENCE.json`  
- `cc_01_yahoo_call_count`, `cc_02_yahoo_call_count`
- `pass_01`, `pass_02`, `pass_04` (non-null)

---

## 4) מסמכים

| מסמך | תפקיד |
|------|--------|
| TEAM_90_TO_TEAM_60_TEAM_50_..._TARGETED_EVIDENCE_MANDATE_v2.0.2 | מנדט Team 90 |
| TEAM_20_TO_TEAM_10_S002_P002_WP003_G7_FIX_COMPLETION | השלמת Team 20 |
| TEAM_10_S002_P002_WP003_GATE3_REMEDIATION_ROUND5_PLAN | תכנית סבב 5 |

---

**log_entry | TEAM_20 | TO_TEAM_60 | CC01_CC02_ACTIVATION | IMMEDIATE | 2026-03-12**
