# S001-P001-WP002 — מסמך ביצוע מרכזי ופרומטים לצוותים

**project_domain:** AGENTS_OS

**id:** TEAM_10_S001_P001_WP002_EXECUTION_AND_TEAM_PROMPTS  
**from:** Team 10 (The Gateway)  
**re:** תוכנית ביצוע, סדר ותלויות, משימות ספציפיות ופרומטים לכל צוות  
**date:** 2026-02-22  
**status:** ACTIVE  

---

## 1) קישור לתוכנית המלאה (קונטקסט)

| מסמך | נתיב |
|------|------|
| **הגדרת חבילת עבודה** | _COMMUNICATION/team_10/TEAM_10_S001_P001_WP002_WORK_PACKAGE_DEFINITION.md |
| **פרומטים וסדר פעולות** | _COMMUNICATION/team_10/TEAM_10_S001_P001_WP002_PROMPTS_AND_ORDER_OF_OPERATIONS.md |
| **מסמך ביצוע (זה)** | _COMMUNICATION/team_10/TEAM_10_S001_P001_WP002_EXECUTION_AND_TEAM_PROMPTS.md |

סקופ: Agents_OS Phase 1 — מבנה תיקיות תחת `agents_os/` (runtime/, validators/, tests/) + validator stub; בידוד דומיין; ללא שינוי TikTrack.

---

## 2) סדר ביצוע, תלויות ותאומים

| # | שלב | צוות | תלות | תאום נדרש | תוצר |
|---|-----|------|------|------------|------|
| 1 | GATE_3 — Implementation | **Team 10** | Pre-GATE_3 PASS (הושג) | — | מבנה agents_os/, validator stub, GATE_3 exit package |
| 2 | GATE_4 — QA | **Team 50** | GATE_3 exit package מוכן; Team 10 מגיש חבילת QA | Team 10 → 50: הגשת קונטקסט + מה לבדוק + קישורים | דוח QA; 0 SEVERE |
| 3 | GATE_5 — Dev Validation | **Team 90** | GATE_4 PASS | Team 10 → 90: WORK_PACKAGE_VALIDATION_REQUEST (gate_id GATE_5) | VALIDATION_RESPONSE (PASS) או BLOCKING_REPORT |
| 4 | GATE_6 — EXECUTION | **Team 190** | GATE_5 PASS | Team 10 מעביר חבילה ל-190 | EXECUTION approval |
| 5 | GATE_7 | **Nimrod** | GATE_6 PASS | — | חתימת UX/vision |
| 6 | GATE_8 | **Team 70 / 190** | GATE_7 PASS | — | AS_MADE_REPORT; סגירה |

**תלות מרכזית:** אין GATE_4 לפני GATE_3 exit; אין GATE_5 לפני GATE_4 PASS; אין דילוג על שלב.

---

## 3) פרומטים לכל צוות (לפי סדר הביצוע)

### 3.1 Team 10 — GATE_3 Implementation (שלב 1 — כעת)

```markdown
**id:** TEAM_10_S001_P001_WP002_GATE3_IMPLEMENTATION_PROMPT
**from:** Team 10 (The Gateway)
**to:** Team 10 (executor)
**work_package_id:** S001-P001-WP002
**gate_id:** GATE_3
**phase_owner:** Team 10
**project_domain:** AGENTS_OS
**date:** 2026-02-22

---

אתה פועל כצוות 10 (The Gateway), phase_owner של חבילת העבודה S001-P001-WP002 (Agents_OS Phase 1 — Runtime Structure & Validator Foundation). Pre-GATE_3 אושר (Team 90 PASS). אתה בבעלות על שלב הפיתוח (GATE_3).

**קונטקסט מלא:** _COMMUNICATION/team_10/TEAM_10_S001_P001_WP002_WORK_PACKAGE_DEFINITION.md; _COMMUNICATION/team_10/TEAM_10_S001_P001_WP002_PROMPTS_AND_ORDER_OF_OPERATIONS.md.

**משימות ספציפיות — GATE_3 Implementation:**
1. ליישם תחת `agents_os/` את המבנה הקנוני לפי LLD400 §2.4: runtime/, validators/, tests/ (ו־docs-governance כנדרש).
2. ליישם validator stub/interface מינימלי אחד (נקודת כניסה או מודול ל-hook של לולאת 10↔90).
3. לעדכן או ליצור README תחת agents_os/ שמתאר מבנה ריצה וחיבור ל-10↔90.
4. לאמת בידוד דומיין: אין קוד Agents_OS מחוץ ל-agents_os/; אין תלות TikTrack.
5. להכין חבילת GATE_3 exit: internal verification, acceptance criteria, sign-off, evidence path; כל ארטיפקט עם Identity Header (work_package_id S001-P001-WP002, gate_id GATE_3).

**תוצר סיום:** GATE_3 exit package מלא; רק אז להגיש ל-Team 50 (GATE_4). מקור: WORK_PACKAGE_DEFINITION §2.1.
```

---

### 3.2 Team 50 — GATE_4 QA (שלב 2 — לאחר GATE_3 exit)

```markdown
**id:** TEAM_10_TO_TEAM_50_S001_P001_WP002_QA_PROMPT
**from:** Team 10 (The Gateway)
**to:** Team 50 (QA & Fidelity)
**work_package_id:** S001-P001-WP002
**gate_id:** GATE_4
**phase_owner:** Team 10
**project_domain:** AGENTS_OS
**date:** 2026-02-22

---

אתה פועל כצוות 50 (QA & Fidelity). Team 10 מגיש לך חבילת QA עבור **GATE_4** — Work Package S001-P001-WP002 (Agents_OS Phase 1 — Runtime & Validator Foundation).

**קונטקסט:** תוכנית מלאה — _COMMUNICATION/team_10/TEAM_10_S001_P001_WP002_WORK_PACKAGE_DEFINITION.md; _COMMUNICATION/team_10/TEAM_10_S001_P001_WP002_EXECUTION_AND_TEAM_PROMPTS.md. GATE_3 הושלם; חבילת GATE_3 exit צורפה.

**סדר ביצוע:** שלב 2 בתוכנית; תלות — GATE_3 exit אושר על ידי Team 10.

**משימות ספציפיות — GATE_4 QA:**
1. לאמת ארטיפקטים תחת agents_os/ (מבנה תיקיות, validator stub, README); אימות בידוד דומיין (אין זליגה ל-TikTrack).
2. לאמת Identity Headers בארטיפקטי שער (work_package_id S001-P001-WP002, gate_id GATE_3/GATE_4).
3. להפיק דוח QA לפי TEAM_50_QA_REPORT_TEMPLATE; נהלים: TT2_QUALITY_ASSURANCE_GATE_PROTOCOL, TEAM_50_QA_WORKFLOW_PROTOCOL.
4. דרישה: 0 SEVERE ל-readiness ל-GATE_5. מיקום דוח: _COMMUNICATION/team_50/TEAM_50_TO_TEAM_10_S001_P001_WP002_QA_REPORT.md.
```

---

### 3.3 Team 90 — GATE_5 Dev Validation (שלב 3 — לאחר GATE_4 PASS)

```markdown
**id:** TEAM_10_TO_TEAM_90_S001_P001_WP002_GATE5_PROMPT
**from:** Team 10 (The Gateway)
**to:** Team 90 (Channel 10↔90 Validation Authority)
**work_package_id:** S001-P001-WP002
**gate_id:** GATE_5
**phase_owner:** Team 10
**project_domain:** AGENTS_OS
**date:** 2026-02-22

---

אתה פועל כצוות 90 (Channel 10↔90 Validation Authority), channel_owner של CHANNEL_10_90_DEV_VALIDATION. Team 10 מגיש לך **WORK_PACKAGE_VALIDATION_REQUEST** עבור S001-P001-WP002 ב-**GATE_5** (Phase 2 בערוץ 10↔90 — Dev Validation לאחר ביצוע ו-QA).

**קונטקסט:** תוכנית מלאה — _COMMUNICATION/team_10/TEAM_10_S001_P001_WP002_WORK_PACKAGE_DEFINITION.md; _COMMUNICATION/team_10/TEAM_10_S001_P001_WP002_EXECUTION_AND_TEAM_PROMPTS.md. GATE_4 (QA) PASS הושג; דוח QA עם 0 SEVERE.

**סדר ביצוע:** שלב 3 בתוכנית; תלות — GATE_4 PASS.

**משימות ספציפיות — GATE_5 Dev Validation:**
1. לאמת תוצרי ביצוע (מבנה agents_os/, validator stub, evidence, תאימות לקנון) מול המפרט ובקשת Team 10.
2. לאמת תאימות מלאה למעגל: Pre-GATE_3 → GATE_3 → GATE_4 → GATE_5; נתיבים קנוניים; Identity Headers.
3. להחזיר VALIDATION_RESPONSE (overall_status PASS) ב-_COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_S001_P001_WP002_GATE5_VALIDATION_RESPONSE.md או BLOCKING_REPORT בנתיב הקנוני; לולאה עד max_resubmissions (5) או PASS. נהלים: CHANNEL_10_90_CANONICAL_CONFIRMATION_v1.0.0; 04_GATE_MODEL_PROTOCOL_v2.3.0 §6.1.
```

---

### 3.4 Team 190 — GATE_6 EXECUTION (שלב 4 — לאחר GATE_5 PASS)

```markdown
**id:** TEAM_10_TO_TEAM_190_S001_P001_WP002_GATE6_PROMPT
**from:** Team 10 (The Gateway)
**to:** Team 190 (Constitutional Architectural Validator)
**work_package_id:** S001-P001-WP002
**gate_id:** GATE_6
**phase_owner:** Team 10
**project_domain:** AGENTS_OS
**date:** 2026-02-22

---

אתה פועל כצוות 190 (Constitutional Architectural Validator). Team 10 מעביר לך חבילה לאימות **GATE_6 — ARCHITECTURAL_VALIDATION (EXECUTION)** עבור S001-P001-WP002. GATE_5 (Dev Validation) PASS הושג.

**קונטקסט:** _COMMUNICATION/team_10/TEAM_10_S001_P001_WP002_WORK_PACKAGE_DEFINITION.md; _COMMUNICATION/team_10/TEAM_10_S001_P001_WP002_EXECUTION_AND_TEAM_PROMPTS.md.

**משימות ספציפיות:** לאמת יישור ארטיפקטים לחוקה (SSM, WSM, מפרטים מאושרים); להחזיר EXECUTION approval או ממצאים לתיקון. 04_GATE_MODEL_PROTOCOL_v2.3.0 — GATE_6 authority: Team 190.
```

---

### 3.5 Nimrod — GATE_7 (שלב 5 — לאחר GATE_6 PASS)

```markdown
**id:** TEAM_10_GATE7_S001_P001_WP002_PROMPT
**from:** Team 10 (The Gateway)
**to:** Nimrod (Human UX Approval)
**work_package_id:** S001-P001-WP002
**gate_id:** GATE_7
**phase_owner:** Team 10
**project_domain:** AGENTS_OS
**date:** 2026-02-22

---

GATE_6 PASS הושג עבור S001-P001-WP002. נדרשת חתימת GATE_7 (Human UX Approval) — אישור UX/vision סופי לפני GATE_8 (Documentation Closure). תוכנית: _COMMUNICATION/team_10/TEAM_10_S001_P001_WP002_WORK_PACKAGE_DEFINITION.md.
```

---

### 3.6 Team 70 — GATE_8 Documentation Closure (שלב 6 — לאחר GATE_7 PASS)

```markdown
**id:** TEAM_10_TO_TEAM_70_S001_P001_WP002_GATE8_PROMPT
**from:** Team 10 (The Gateway)
**to:** Team 70 (Executor), Team 190 (Owner)
**work_package_id:** S001-P001-WP002
**gate_id:** GATE_8
**phase_owner:** Team 10
**project_domain:** AGENTS_OS
**date:** 2026-02-22

---

GATE_7 PASS הושג. נדרש **GATE_8 — DOCUMENTATION_CLOSURE**: AS_MADE_REPORT, עדכון Developer Guides, ניקוי/ארכוב, עקביות קנונית. Team 70 = executor; Team 190 = owner. Lifecycle לא complete בלי GATE_8 PASS. תוכנית: _COMMUNICATION/team_10/TEAM_10_S001_P001_WP002_WORK_PACKAGE_DEFINITION.md; 04_GATE_MODEL_PROTOCOL_v2.3.0.
```

---

**log_entry | TEAM_10 | S001_P001_WP002 | EXECUTION_AND_TEAM_PROMPTS | 2026-02-22**
