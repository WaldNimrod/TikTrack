# S001-P001-WP002 — פרומטים וסדר פעולות (Agents_OS Phase 1 — Runtime & Validator Foundation)

**project_domain:** AGENTS_OS

**id:** TEAM_10_S001_P001_WP002_PROMPTS_AND_ORDER_OF_OPERATIONS  
**from:** Team 10 (The Gateway)  
**re:** חבילת עבודה S001-P001-WP002  
**date:** 2026-02-22  
**מקור:** TEAM_10_S001_P001_WP002_WORK_PACKAGE_DEFINITION; TEAM_190_TO_TEAM_10_AGENTS_OS_PHASE_1_SPEC_PASS_DEVELOPMENT_ACTIVATION_v1.0.0; 04_GATE_MODEL_PROTOCOL_v2.3.0  

---

## 1) סדר פעולות (Order of Operations)

השרשרת מחייבת. אין דילוג; אין GATE_3 לפני Pre-GATE_3 PASS; אין GATE_5 לפני GATE_4 PASS.

| # | שלב | צוות אחראי | טריגר | תוצר / תנאי יציאה |
|---|-----|-------------|--------|---------------------|
| 0b | **Pre-GATE_3** (ולידציית חבילה) | Team 90 | Team 10 מגיש WORK_PACKAGE_VALIDATION_REQUEST (PRE_GATE_3) | VALIDATION_RESPONSE PASS → מותר לפתוח GATE_3 |
| 1 | **GATE_3 — Implementation** | **Team 10** | Pre-GATE_3 PASS | אורקסטרציה + מימוש מבנה תחת agents_os/; GATE_3 exit package מלא (§2.1 הגדרת חבילה) |
| 2 | GATE_4 — QA | Team 50 | Team 10 מגיש חבילת QA (רק אחרי GATE_3 exit) | דוח QA; 0 SEVERE; readiness ל-GATE_5 |
| 3 | GATE_5 — Dev Validation (10↔90) | Team 90 | Team 10 מפרסם WORK_PACKAGE_VALIDATION_REQUEST (GATE_5) | VALIDATION_RESPONSE (PASS) או BLOCKING_REPORT; לולאה עד PASS או ESCALATE/STUCK |
| 4 | GATE_6 — EXECUTION | Team 190 | GATE_5 PASS | EXECUTION approval; יישור ארטיפקטים |
| 5 | GATE_7 — Human UX Approval | Nimrod | GATE_6 PASS | חתימת UX/vision |
| 6 | GATE_8 — Documentation Closure | Team 70 (מבצע), Team 190 (בעלים) | GATE_7 PASS | AS_MADE_REPORT; עקביות קנונית. Lifecycle לא complete בלי GATE_8 PASS. |

---

## 2) חלוקת משימות לצוותים (Team allocation plan)

| צוות | תפקיד ב־WP002 | תוצר נדרש / הערות |
|------|----------------|---------------------|
| **Team 10** | phase_owner; אורקסטרציה; מימוש מבנה תיקיות תחת `agents_os/`, validator stub, ואימות בידוד דומיין | WORK_PACKAGE_DEFINITION; PROMPTS_AND_ORDER; הגשת Pre-GATE_3 ל-90; ביצוע GATE_3 (מבנה + stub); internal verification; חבילת GATE_3 exit; הגשת ל-50 (GATE_4) ול-90 (GATE_5) |
| **Team 90** | סמכות ערוץ 10↔90; Pre-GATE_3 (ולידציית תוכנית); GATE_5 (Dev Validation) | VALIDATION_RESPONSE / BLOCKING_REPORT לפי CHANNEL_10_90 |
| **Team 50** | QA (GATE_4) | דוח QA לאחר הגשת Team 10; 0 SEVERE ל-readiness ל-GATE_5 |
| **Team 190** | GATE_6 EXECUTION | אישור יישור ארטיפקטים לחוקה |
| **Team 70** | GATE_8 executor | רק לאחר GATE_7 PASS |

**הערה:** סקופ WP002 — תחת `agents_os/` בלבד; אין הפעלת צוותים 20/30/40/60 לחבילה זו אלא אם יוגדר בהמשך תת־משימה שדורשת זאת (למשל סקריפט אימות אוטומטי). כרגע מימוש המבנה וה־stub באחריות Team 10.

---

## 3) פרומט — צוות 10 (GATE_3 Implementation) — לשימוש לאחר Pre-GATE_3 PASS

```
אתה פועל כצוות 10 (The Gateway), phase_owner של חבילת העבודה S001-P001-WP002 (Agents_OS Phase 1 — Runtime Structure & Validator Foundation).

**הקשר:** Pre-GATE_3 אושר (Team 90 PASS). אתה בבעלות על שלב הפיתוח (GATE_3).

**משימתך — GATE_3 Implementation:**
1. ליישם תחת `agents_os/` את המבנה הקנוני לפי LLD400 §2.4: runtime/, validators/, tests/ (ו־documentation/docs-governance כנדרש).
2. ליישם validator stub/interface מינימלי אחד (נקודת כניסה או מודול שמייצג את ה־hook ללולאת 10↔90).
3. לעדכן או ליצור README תחת agents_os/ שמתאר את מבנה הריצה והחיבור ל־10↔90.
4. לבצע אימות בידוד דומיין (אין קוד Agents_OS מחוץ ל־agents_os/; אין תלות TikTrack).
5. להכין חבילת GATE_3 exit: internal verification, acceptance criteria, sign-off, evidence path עם Identity Header (work_package_id S001-P001-WP002, gate_id GATE_3).

**מקורות:** TEAM_10_S001_P001_WP002_WORK_PACKAGE_DEFINITION.md; agents_os/docs-governance/AGENTS_OS_PHASE_1_CONCEPT_PACKAGE_v1.0.0/DOMAIN_ISOLATION_MODEL.md; AGENTS_OS_PHASE_1_LLD400_v1.0.0.
**תוצר סיום:** GATE_3 exit package מלא; רק אז מותר להגיש ל-Team 50 (GATE_4).
```

---

## 4) פרומט — Team 90 (Pre-GATE_3) — הגשת הבקשה

בקשת Pre-GATE_3 מוגשת במסמך נפרד: `TEAM_10_TO_TEAM_90_S001_P001_WP002_VALIDATION_REQUEST.md` (ראה §5).

---

## 5) פרומט — Team 50 (GATE_4) — לאחר GATE_3 exit

לאחר השלמת GATE_3 exit package, Team 10 מגיש חבילת QA ל-Team 50 עם קונטקסט מלא (מה בוצע, מה לבדוק, קישורים); דוח QA עם 0 SEVERE נדרש ל-readiness ל-GATE_5. פורמט לפי TEAM_50_QA_REPORT_TEMPLATE ו־TT2_QUALITY_ASSURANCE_GATE_PROTOCOL.

---

## 6) פרומט — Team 90 (GATE_5) — לאחר GATE_4 PASS

Team 10 יגיש WORK_PACKAGE_VALIDATION_REQUEST עם gate_id GATE_5; Team 90 יחזיר VALIDATION_RESPONSE או BLOCKING_REPORT לפי CHANNEL_10_90_CANONICAL_CONFIRMATION_v1.0.0.

---

**log_entry | TEAM_10 | S001_P001_WP002 | PROMPTS_AND_ORDER_OF_OPERATIONS | 2026-02-22**
