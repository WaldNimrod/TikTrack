

# Team 10 → Team 90 | S002-P002-WP003 GATE_7 Part A — פרומפט קנוני לוולידציה v2.0.7

**project_domain:** TIKTRACK  
**id:** TEAM_10_TO_TEAM_90_S002_P002_WP003_GATE7_PARTA_CANONICAL_VALIDATION_PROMPT  
**from:** Team 10 (Execution Orchestrator)  
**to:** Team 90 (GATE_7 owner — Validation Authority)  
**date:** 2026-03-12  
**historical_record:** true
**status:** ACTIVATION  
**handoff_ref:** TEAM_10_TO_TEAM_90_S002_P002_WP003_GATE7_PARTA_HANDOFF_v2.0.7  

---

## 1) משימתכם

ביצוע ולידציה חוזרת לחבילת GATE_7 Part A v2.0.7 והנפקת פסיקה קנונית — **PASS_PART_A** או **BLOCK_PART_A**.

---

## 2) חבילת הגשה

| מסמך | נתיב |
|------|------|
| **Handoff** | `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_90_S002_P002_WP003_GATE7_PARTA_HANDOFF_v2.0.7.md` |
| Evidence 60 | `_COMMUNICATION/team_60/TEAM_60_TO_TEAM_90_S002_P002_WP003_GATE7_PARTA_RUNTIME_EVIDENCE_REPORT_v2.0.7.md` |
| Corroboration 50 | `_COMMUNICATION/team_50/TEAM_50_TO_TEAM_90_S002_P002_WP003_GATE7_PARTA_QA_CORROBORATION_v2.0.7.md` |
| JSON | `documentation/reports/05-REPORTS/artifacts/G7_PART_A_RUNTIME_EVIDENCE.json` |
| **לוג משותף** | `documentation/reports/05-REPORTS/artifacts/G7_PART_A_V2_0_7.log` |

---

## 3) רשימת בדיקת קבילות CC-01 (חובה)

**CC-WP003-01 קביל** רק אם **כל** התנאים מתקיימים:

| # | תנאי | אופן אימות |
|---|------|-------------|
| 1 | הריצה בוצעה **בחלון 09:30–16:00 ET** (Mon–Fri) | timestamp בארטיפקטים 60 ו־50; המרה ל־ET |
| 2 | **הלוג המשותף** מכיל שורה `PHASE_3 price sync cadence: mode=market_open` | `grep "mode=market_open" G7_PART_A_V2_0_7.log` — יש התאמה |
| 3 | הלוג **לא ריק** וכולל runtime traces | פתיחת הקובץ; גודל > 0 |
| 4 | `cc_01_yahoo_call_count ≤ 5` | JSON או דוחות 60/50 |
| 5 | Team 50 verdict ל־CC-01 **זהה** ל־Team 60 | השוואה בין שני הדוחות |

**אם כל 5 מתקיימים → CC-01 = PASS.**  
**אם אחד חסר → CC-01 = NOT_EVIDENCED → BLOCK_PART_A.**

---

## 4) תנאים שאושרו (ללא שינוי)

| Condition | Verdict | בסיס |
|-----------|---------|------|
| CC-WP003-02 | PASS | off-hours evidence — cc_02=0 (מקובל) |
| CC-WP003-04 | PASS | cooldown evidence — cc_04=0 (מקובל) |
| CC-WP003-03 | CARRY_FORWARD_PASS | GATE_6 v2.0.0; לא נפתח |

---

## 5) דליברבל נדרש

**נתיב:**  
`_COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_S002_P002_WP003_GATE7_PARTA_REVALIDATION_RESPONSE_v2.0.7.md`

**תוכן חובה:**
- `overall_status`: `PASS_PART_A` | `BLOCK_PART_A`
- `verdicts`: טבלה לכל condition (CC-01, CC-02, CC-03, CC-04) עם Basis
- `routing`: המשך תהליך
- `Mandatory Identity Header` מלא

---

## 6) קריטריון PASS

**PASS_PART_A** — כאשר:
- CC-01 = **PASS** (כל 5 תנאי הקבילות מתקיימים)
- CC-02, CC-03, CC-04 — PASS / CARRY_FORWARD_PASS

---

## 7) קריטריון BLOCK

**BLOCK_PART_A** — כאשר:
- CC-01 = **NOT_EVIDENCED** (אחד מתנאי הקבילות לא מתקיים; ציין ממצא חוסם)
- או: סתירה בין Team 60 ל־Team 50

---

**log_entry | TEAM_10 | TO_TEAM_90 | GATE7_PARTA_CANONICAL_VALIDATION_PROMPT_v2_0_7 | ACTIVATION | 2026-03-12**
