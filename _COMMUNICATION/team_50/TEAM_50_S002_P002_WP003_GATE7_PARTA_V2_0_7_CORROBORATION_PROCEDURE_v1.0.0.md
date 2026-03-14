

# Team 50 | S002-P002-WP003 GATE_7 Part A — נוהל Corroboration v2.0.7

**project_domain:** TIKTRACK  
**id:** TEAM_50_S002_P002_WP003_GATE7_PARTA_V2_0_7_CORROBORATION_PROCEDURE_v1.0.0  
**from:** Team 50 (QA & Fidelity)  
**date:** 2026-03-12  
**historical_record:** true
**status:** CANONICAL — חובה לפני הגשת corroboration  
**purpose:** מונע BLOCK חוזר — v2.0.6 נפסל כי הלוג הכיל mode=off_hours  

---

## 1) תנאי מקדימה

**Team 60** חייב להריץ בהצלחה:

```bash
./scripts/run_g7_cc01_v207_market_open.sh
```

**רק** בתוך 09:30–16:00 ET (Mon–Fri). הסקריפט יוצר:
- `documentation/reports/05-REPORTS/artifacts/G7_PART_A_V2_0_7.log` (עם `mode=market_open`)
- עדכון `G7_PART_A_RUNTIME_EVIDENCE.json`

---

## 2) שלב 1 — Pre-Corroboration Validation (חובה)

**לפני** כתיבת corroboration, הרץ:

```bash
python3 scripts/team_50_verify_g7_v207_corroboration_prereqs.py
```

**Exit 0** — כל התנאים מתקיימים; המשך לשלב 2.  
**Exit 1** — BLOCK; אל תגיש corroboration. הודע ל־Team 10.

### תנאי האימות

| # | תנאי | כישלון |
|---|------|--------|
| 1 | לוג קיים | BLOCK: הרץ run_g7_cc01_v207_market_open.sh |
| 2 | לוג לא ריק | BLOCK |
| 3 | **mode=market_open** בלוג | BLOCK: הרץ בשעות 09:30–16:00 ET |
| 4 | cc_01_yahoo_call_count ≤ 5 | BLOCK |

---

## 3) שלב 2 — יצירת Corroboration

אם שלב 1 עבר:

```bash
python3 scripts/team_50_generate_corroboration_v207.py
```

הסקריפט יוצר אוטומטית:
`_COMMUNICATION/team_50/TEAM_50_TO_TEAM_90_S002_P002_WP003_GATE7_PARTA_QA_CORROBORATION_v2.0.7.md`

תוכן: אימות הלוג (קיים, לא ריק, mode=market_open); CC-01 verdict = PASS; אותו log_path ו־timestamp.

---

## 4) צעד הבא

Team 10 → Handoff v2.0.7 ל־Team 90.

---

**log_entry | TEAM_50 | GATE7_PARTA_V2_0_7_CORROBORATION_PROCEDURE | CANONICAL | 2026-03-12**
