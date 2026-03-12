

# Team 10 | S002-P002-WP003 GATE_3 Round 5 — Activation Prompts (פרומפטי הפעלה)

**project_domain:** TIKTRACK  
**id:** TEAM_10_S002_P002_WP003_GATE3_ROUND5_ACTIVATION_PROMPTS_v1.0.0  
**from:** Team 10 (Execution Orchestrator)  
**date:** 2026-03-12  
**historical_record:** true
**status:** ACTIVE  
**context:** WP003 חוזרת ל־GATE_3 — סבב תיקון 5; Part A BLOCK (CC-01, CC-02 NOT_EVIDENCED) + G7-FIX אדריכלי  

---

## 1) סיכום

| צוות | מנדט | תלות | Deliverable |
|------|------|------|-------------|
| **Team 20** | G7-FIX-1/2A/2B/3 | — | `TEAM_20_TO_TEAM_10_S002_P002_WP003_G7_FIX_COMPLETION.md` |
| **Team 60** | CC-01, CC-02 evidence | — (מקביל) | `TEAM_60_TO_TEAM_90_..._RUNTIME_EVIDENCE_REPORT_v2.0.3.md` |
| **Team 50** | G7-VERIFY + Corroboration | T20, T60 | `TEAM_50_TO_TEAM_90_..._QA_CORROBORATION_v2.0.3.md` |

---

## 2) פרומפטי הפעלה

### Team 20 — G7-FIX (מיידי)

**מנדט:**  
`_COMMUNICATION/team_10/TEAM_10_TO_TEAM_20_S002_P002_WP003_G7_FIX_ACTIVATION_v1.0.0.md`

**פרומפט:**
> צוות 20: מנדט G7-FIX אדריכלי הופעל. קראו את `_COMMUNICATION/team_00/TEAM_00_TO_TEAM_20_S002_P002_WP003_G7_FIX_MANDATE_v1.0.0.md` ובצעו את G7-FIX-1, G7-FIX-2A, G7-FIX-2B, G7-FIX-3 לפי המפרט המדויק. אחרי השלמה — העבירו חבילה ל־Team 50 ל־G7-VERIFY. דוח השלמה: `_COMMUNICATION/team_20/TEAM_20_TO_TEAM_10_S002_P002_WP003_G7_FIX_COMPLETION.md`.

---

### Team 60 — CC-01, CC-02 Evidence (מקביל)

**מנדט:**  
`_COMMUNICATION/team_10/TEAM_10_TO_TEAM_60_S002_P002_WP003_CC01_CC02_EVIDENCE_MANDATE_v1.0.0.md`

**פרומפט:**
> צוות 60: מנדט איסוף עדות CC-01, CC-02 הופעל. בצעו Run A (market-open — explicit Yahoo call count ≤5) ו־Run B (off-hours — explicit Yahoo call count ≤2). הגישו `TEAM_60_TO_TEAM_90_S002_P002_WP003_GATE7_PARTA_RUNTIME_EVIDENCE_REPORT_v2.0.3.md` ו־עדכנו `documentation/05-REPORTS/artifacts/G7_PART_A_RUNTIME_EVIDENCE.json` עם `cc_01_yahoo_call_count`, `cc_02_yahoo_call_count`, `pass_01`, `pass_02`, `pass_04`.

---

### Team 50 — G7-VERIFY + Corroboration (אחרי T20 + T60)

**מנדט:**  
`_COMMUNICATION/team_10/TEAM_10_TO_TEAM_50_S002_P002_WP003_G7_VERIFY_AND_CORROBORATION_MANDATE_v1.0.0.md`

**פרומפט:**
> צוות 50: מנדט G7-VERIFY + Corroboration הופעל. (1) אחרי Team 20 השלמה — הריצו `python scripts/run_g7_part_a_evidence.py`, וודאו pass_04=True, הוסיפו T-MKTDATA-01..05 ל־QA suite. (2) אחרי Team 60 evidence v2.0.3 — כתבו corroboration v2.0.3 `TEAM_50_TO_TEAM_90_S002_P002_WP003_GATE7_PARTA_QA_CORROBORATION_v2.0.3.md` שתואם בדיוק ל־verdicts של Team 60.

---

## 3) סדר ביצוע גרפי

```
T0:  [Team 20] G7-FIX ← הפעלה מיידית
     [Team 60] Run A + Run B ← הפעלה מקבילית

T1:  [Team 20] DONE → Team 50 G7-VERIFY
     [Team 60] DONE → Team 50 Corroboration

T2:  [Team 50] G7-VERIFY + T-MKTDATA + Corroboration v2.0.3 → Team 90
```

---

## 4) תנאי יציאה — Part A PASS

- CC-WP003-01: EVIDENCED
- CC-WP003-02: EVIDENCED
- CC-WP003-04: PASS
- Team 50 corroboration v2.0.3 תואם Team 60

---

**log_entry | TEAM_10 | GATE3_ROUND5_ACTIVATION_PROMPTS | CREATED | 2026-03-12**
