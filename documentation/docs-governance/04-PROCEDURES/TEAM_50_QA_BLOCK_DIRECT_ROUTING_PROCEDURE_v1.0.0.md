# TEAM_50_QA_BLOCK_DIRECT_ROUTING_PROCEDURE v1.0.0

**project_domain:** TIKTRACK  
**id:** TEAM_50_QA_BLOCK_DIRECT_ROUTING_PROCEDURE_v1.0.0  
**owner:** Team 50 (QA & Fidelity)  
**date:** 2026-03-08  
**status:** LOCKED  
**canonical:** GOVERNANCE_PROCEDURES_INDEX §04-PROCEDURES  
**changelog:** 2025-01-31 — §2.1 Content requirement (דרישת תיקון מפורטת), §2.2 Applicability (Team 60 + כל צוות מאמת).  

---

## 1) Purpose

כאשר QA מחזיר BLOCK וברור מי הצוות האחראי — **לשלוח הודעה ישירה** לצוות האחראי, עם cc לצוות 10. אין לעבור דרך Team 10 כ"טלפון שבור".

---

## 2) Rule (חובה)

| Condition | Action |
|-----------|--------|
| QA status = BLOCK | |
| Owner of blockers is **clear** (e.g. Team 20, Team 30, Team 60) | **Direct:** Verifying team → Owner team (fix request / block notification) |
| | **cc:** Team 10 (for orchestration visibility) |
| Owner unclear or multi-team | Verifying team → Team 10 (for routing decision) |

### 2.1 Content requirement (חובה — מניעת רעש)

**דרישת תיקון מפורטת ומדויקת:** ההודעה לצוות האחראי חייבת לכלול **את כל המידע הקיים** כדי לאפשר תיקון אופטימלי: כלל המעבר (PASS rule), מה בוצע באימות, לוג/Evidence, סיבת הכשל (שורש), מיקום רלוונטי בקוד, דרישת תיקון ברורה (כולל אפשרויות אם רלוונטי), ואימות אחרי תיקון. **בלי זה נוצר רעש מיותר ולא יעיל.**

### 2.2 Applicability

**חל על:** Team 50 (QA) ו-**Team 60** (אימות runtime/אינפרה) וכל צוות שמבצע אימות ומחזיר BLOCK — שולח דרישת תיקון מפורטת ישירות לצוות האחראי עם **cc: Team 10**.

---

## 3) Message Format

**Direct fix request (to Owner):**
- **Path:** `_COMMUNICATION/team_[VERIFIER_ID]/TEAM_[VERIFIER_ID]_TO_TEAM_[OWNER_ID]_[CONTEXT]_[BLOCK_FIX_REQUEST|REMEDIATION_REQUEST].md`
- **to:** Team [20|30|60|…] (הצוות האחראי)
- **cc:** Team 10
- **Content:** דרישת תיקון מפורטת — Blockers, כלל PASS, Evidence, לוגים, סיבת כשל, מיקום בקוד, דרישת תיקון מדויקת, אימות אחרי תיקון (§2.1)

**QA Report (informational, for traceability):**
- **Path:** `_COMMUNICATION/team_50/TEAM_50_TO_TEAM_10_[CONTEXT]_QA_REPORT.md`
- **Content:** Summary, status BLOCK, reference to direct fix request sent to Owner

---

## 4) Benefits

1. **No broken telephone** — הצוות האחראי מקבל את הדרישה ישירות, עם כל הפרטים.
2. **Team 10 visibility** — cc מאפשר ל־Gateway לעקוב ולעדכן WSM/orchestration.
3. **Faster remediation** — פחות שלבי תקשורת, פחות איבוד מידע.

---

## 5) PASS — הודעה קנונית (חובה תמיד)

**כאשר Re-QA או QA מסתיים ב־PASS — חובה תמיד** לשלוח הודעה קנונית ל־Team 10.

**Format:**
- **Path:** `_COMMUNICATION/team_50/TEAM_50_TO_TEAM_10_[CONTEXT]_RE_QA_PASS_v1.0.0.md` (או `_QA_PASS_v1.0.0.md` בבדיקה ראשונה)
- **to:** Team 10
- **Content:** status PASS; תנאי הרצה; מטריצת תוצאות; Evidence; Next step ל־Team 10

**דוגמה:** `TEAM_50_TO_TEAM_10_PRICE_RELIABILITY_PHASE1_RE_QA_PASS_v1.0.0.md`

---

## 6) Example (BLOCK)

**Scenario:** Price Reliability PHASE_1 QA → BLOCK, blockers owned by Team 20.

- **Direct:** `TEAM_50_TO_TEAM_20_PRICE_RELIABILITY_PHASE1_BLOCK_FIX_REQUEST.md` (to: Team 20, cc: Team 10)
- **Report:** `TEAM_50_TO_TEAM_10_PRICE_RELIABILITY_PHASE1_QA_REPORT.md` (סיכום; מציין שדרישת תיקון נשלחה ישירות ל־Team 20)

---

**log_entry | TEAM_50 | QA_BLOCK_DIRECT_ROUTING_PROCEDURE | PASS_RULE_ADDED | 2026-03-08**
