# Team 10 → Team 50 | S002-P002-WP003 G7-VERIFY + Corroboration v2.0.3 (סבב תיקון 5)

**project_domain:** TIKTRACK  
**id:** TEAM_10_TO_TEAM_50_S002_P002_WP003_G7_VERIFY_AND_CORROBORATION_MANDATE_v1.0.0  
**from:** Team 10 (Execution Orchestrator)  
**to:** Team 50 (QA & Fidelity)  
**cc:** Team 20, Team 60, Team 90  
**date:** 2026-03-12  
**status:** MANDATE_ACTIVE  
**trigger:** WP003 GATE_3 Remediation Round 5 — G7-VERIFY (אחרי Team 20) + Corroboration (אחרי Team 60)  
**authority:** TEAM_00_TO_TEAM_20_S002_P002_WP003_G7_FIX_MANDATE_v1.0.0, TEAM_90_TO_TEAM_60_TEAM_50_..._TARGETED_EVIDENCE_MANDATE_v2.0.2  

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

שני דליברבלים:
1. **G7-VERIFY** — אימות CC-04 אחרי G7-FIX (Team 20)
2. **Corroboration v2.0.3** — התאמה ל־Team 60 evidence (CC-01, CC-02)

---

## 2) G7-VERIFY (תלות: Team 20 G7-FIX הושלם)

**prerequisite:**  
`_COMMUNICATION/team_20/TEAM_20_TO_TEAM_10_S002_P002_WP003_G7_FIX_COMPLETION.md` — status DONE

**פעולות:**
1. להריץ: `python scripts/run_g7_part_a_evidence.py`
2. לוודא: `pass_04=True` בפלט
3. לוודא: אין "Yahoo 429 — cooldown" בלוג (אין global cooldown activations)
4. לוודא: לפחות סימבול אחד (לא ANAU.MI) קיבל מחיר עדכני
5. להגיש לוג כ־CC-04 runtime evidence ל־Team 90

---

## 3) T-MKTDATA-01..05 — הוספה ל־QA Suite

**מנדט Team 00:**  
`_COMMUNICATION/team_00/TEAM_00_TO_TEAM_20_S002_P002_WP003_G7_FIX_MANDATE_v1.0.0.md` — סעיף "Team 50 — Additional Requirements"

| Test ID | Description | Pass condition |
|---------|-------------|----------------|
| T-MKTDATA-01 | Batch 401 does not set Yahoo cooldown | Mock v7/quote → 401; assert `is_in_cooldown("YAHOO_FINANCE") == False` |
| T-MKTDATA-02 | Single-symbol 429 exhaustion does not set Yahoo cooldown | Mock v8/chart → 429×3 for ONE symbol; assert cooldown False |
| T-MKTDATA-03 | Three-symbol 429 exhaustion sets Yahoo cooldown | Mock v8/chart → 429×3 for THREE symbols; assert cooldown True |
| T-MKTDATA-04 | CC-04 evidence counting | Inject "Yahoo 429 — cooldown"×1; assert `count_cooldown == 1` |
| T-MKTDATA-05 | Iron Rule #8 | 401 anywhere → `is_in_cooldown("YAHOO_FINANCE") == False` |

**חובה:** להוסיף את חמשת הבדיקות ל־QA suite ולשמור אותן לכל gate עתידי (WP003 ומעבר).

---

## 4) Corroboration v2.0.3 (תלות: Team 60 evidence v2.0.3)

**prerequisite:**  
`_COMMUNICATION/team_60/TEAM_60_TO_TEAM_90_S002_P002_WP003_GATE7_PARTA_RUNTIME_EVIDENCE_REPORT_v2.0.3.md` — קיים

**פעולות:**
1. להתאים ל־verdicts של Team 60 בדיוק (CC-01, CC-02, CC-04)
2. **אין סתירה** — אם Team 60 דיווח pass_01=true, Team 50 corroboration חייב לתמוך בכך

---

## 5) דליברבל

**נתיב:**  
`_COMMUNICATION/team_50/TEAM_50_TO_TEAM_90_S002_P002_WP003_GATE7_PARTA_QA_CORROBORATION_v2.0.3.md`

**תוכן:**
- טבלת corroboration: CC-WP003-01, CC-WP003-02, CC-WP003-04 — התאמה ל־Team 60
- אימות G7-VERIFY: pass_04, no cooldown activations
- ציון: T-MKTDATA-01..05 נוספו ל־QA suite

---

## 6) סדר ביצוע

```
1. ממתינים ל־Team 20 G7-FIX completion
2. מריצים G7-VERIFY; אם pass_04=True — ממשיכים
3. מוסיפים T-MKTDATA-01..05 ל־QA suite
4. ממתינים ל־Team 60 evidence v2.0.3
5. כותבים corroboration v2.0.3 — תואם ל־60
6. מגישים ל־Team 90
```

---

**log_entry | TEAM_10 | G7_VERIFY_AND_CORROBORATION_MANDATE | TO_TEAM_50 | MANDATE_ACTIVE | 2026-03-12**
