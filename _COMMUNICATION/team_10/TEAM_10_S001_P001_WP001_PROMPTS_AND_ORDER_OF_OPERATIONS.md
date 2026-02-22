# S001-P001-WP001 — פרומטים לצוותי הפיתוח וסדר פעולות
**project_domain:** TIKTRACK

**id:** TEAM_10_S001_P001_WP001_PROMPTS_AND_ORDER_OF_OPERATIONS  
**from:** Team 10 (The Gateway)  
**re:** חבילת עבודה S001-P001-WP001 (10↔90 Validator Agent)  
**date:** 2026-02-21  
**מקור:** TEAM_10_S001_P001_WP001_WORK_PACKAGE_DEFINITION; TEAM_10_GATE3_DEVELOPMENT_PHASE_OWNER_LOCK_v1.0.0  

---

## 1) סדר פעולות (Order of Operations)

השרשרת להלן מחייבת. אין לדלג על שלב; אין GATE_4 לפני השלמת GATE_3 exit package; אין GATE_5 לפני GATE_4 PASS.

| # | שלב | צוות אחראי | טריגר | תוצר / תנאי יציאה |
|---|-----|-------------|--------|---------------------|
| 0b | Pre-GATE_3 (ולידציית חבילה) | Team 90 | Team 10 הגיש WORK_PACKAGE_VALIDATION_REQUEST | **הושלם — PASS.** Evidence: TEAM_90_TO_TEAM_10_S001_P001_WP001_VALIDATION_RESPONSE.md |
| 1 | **GATE_3 — Implementation** | **Team 10** | Pre-GATE_3 PASS; GO_FOR_GATE_3 | אורקסטרציה מיושמת; GATE_3 exit package מלא (§2.1); רק אז הגשה ל-GATE_4 |
| 2 | **GATE_4 — QA** | Team 50 | Team 10 מגיש חבילת QA (רק אחרי GATE_3 exit) | **הושלם — GATE_A_PASSED.** Evidence: [_COMMUNICATION/team_50/TEAM_50_TO_TEAM_10_S001_P001_WP001_QA_REPORT.md](../team_50/TEAM_50_TO_TEAM_10_S001_P001_WP001_QA_REPORT.md). 0 SEVERE, 0 BLOCKER. **Readiness ל-GATE_5.** |
| 3 | **GATE_5 — Dev Validation (10↔90)** | Team 90 | Team 10 מפרסם WORK_PACKAGE_VALIDATION_REQUEST (GATE_5) | **הושלם — PASS.** Evidence: [_COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_S001_P001_WP001_GATE5_VALIDATION_RESPONSE.md](../team_90/TEAM_90_TO_TEAM_10_S001_P001_WP001_GATE5_VALIDATION_RESPONSE.md). **סגירת המעגל — סיום תפקיד צוות 10 בחבילה.** |
| 4 | GATE_6 — Architectural Validation (EXECUTION) | Team 190 | GATE_5 PASS | EXECUTION approval; יישור ארטיפקטים לחוקה |
| 5 | GATE_7 — Human UX Approval | Nimrod | GATE_6 PASS | חתימת UX/vision סופית |
| 6 | GATE_8 — Documentation Closure | Team 70 (מבצע), Team 190 (בעלים) | GATE_7 PASS | AS_MADE_REPORT; עדכון Developer Guides; ניקוי/ארכוב; עקביות קנונית. **Lifecycle לא complete בלי GATE_8 PASS.** |

**הערה:** הוצאו הפעלות לצוותים 20, 30, 40, 60 — ראה [TEAM_10_S001_P001_WP001_GATE3_ACTIVATIONS_INDEX.md](TEAM_10_S001_P001_WP001_GATE3_ACTIVATIONS_INDEX.md). בחבילה זו סקופ אורקסטרציה (תשתית 10↔90); משימות הצוותים: אי-חסימה, אימות תאימות/תשתית, דיווח השלמה. ללא Widget POC וללא בניית UI.

---

## 2) פרומט — צוות 10 (GATE_3 Implementation) — **פעיל כעת**

**מתי להשתמש:** כעת. צוות 10 מבצע את שלב ה-Implementation.

---

**פרומט:**

```
אתה פועל כצוות 10 (The Gateway), phase_owner של חבילת העבודה S001-P001-WP001 (10↔90 Validator Agent).

**הקשר:** Pre-GATE_3 אושר (Team 90 PASS); GO_FOR_GATE_3 אושר (Team 190). אתה בבעלות על שלב הפיתוח (GATE_3) מול כל צוותי העבודה.

**משימתך — GATE_3 Implementation:**
1. לבנות את תזרימי האורקסטרציה (תשתית לולאת 10↔90 בלבד): תאימות לנתיבים הקנוניים WORK_PACKAGE_VALIDATION_REQUEST (team_10), VALIDATION_RESPONSE (team_90), BLOCKING_REPORT (team_90). לוגיקת זרימה: Team 10 מפרסם בקשת ולידציה → Team 90 מחזיר תשובה/דוח חוסם; לולאה עד PASS או ESCALATE/STUCK.
2. לבצע אימות פנימי (internal verification) על האורקסטרציה — לפחות ארטיפקט אימות אחד (דוח השלמה, runbook check, או self-check חתום) שמכסה את סקופ האורקסטרציה של ה-WP.
3. להכין את חבילת ה-GATE_3 exit:
   - Internal verification artifact עם Identity Header מלא (work_package_id: S001-P001-WP001, gate_id: GATE_3, phase_owner: Team 10, required_ssm_version: 1.0.0, required_active_stage: GAP_CLOSURE_BEFORE_AGENT_POC).
   - אישור עמידה ב-acceptance criteria (אורקסטרציה לפי WORK_PACKAGE_DEFINITION; אין SEVERE/BLOCKER פתוחים).
   - Sign-off של phase owner (Team 10) על readiness להגשת QA.
   - Evidence path: ארטיפקטים תחת _COMMUNICATION/team_10/ או נתיבים ב-WORK_PACKAGE_DEFINITION.

**סקופ:** אורקסטרציה בלבד. **לא** Widget POC; **לא** בניית UI. **לא** להפעיל צוותים 20/30/40/60 בחבילה זו.

**מקורות חובה:** _COMMUNICATION/team_10/TEAM_10_S001_P001_WP001_WORK_PACKAGE_DEFINITION.md (§2, §2.1); _COMMUNICATION/team_190/CHANNEL_10_90_CANONICAL_CONFIRMATION_v1.0.0.md; 04_GATE_MODEL_PROTOCOL_v2.2.0.

**תוצר סיום:** GATE_3 exit package מלא; רק אז מותר להגיש ל-Team 50 (GATE_4).
```

---

## 3) פרומט — Team 50 (GATE_4 — QA)

**מתי להשתמש:** לאחר שצוות 10 השלים את GATE_3 exit package ומגיש ל-QA.

**מסמך הגשה ופרומט מלא (נהלים, דרישות QA, רשימת מסמכים):** [TEAM_10_TO_TEAM_50_S001_P001_WP001_QA_SUBMISSION_AND_PROMPT.md](TEAM_10_TO_TEAM_50_S001_P001_WP001_QA_SUBMISSION_AND_PROMPT.md).

---

**פרומט (תמצית; לפרומט מלא ראה המסמך לעיל):**

```
אתה פועל כצוות 50 (QA & Fidelity). Team 10 מגיש לך חבילת QA עבור Work Package S001-P001-WP001 (10↔90 Validator Agent) לאחר השלמת GATE_3 (Implementation).

**הקשר:** 
- work_package_id: S001-P001-WP001.
- סקופ החבילה: תשתית אורקסטרציה ללולאת 10↔90 (WORK_PACKAGE_VALIDATION_REQUEST / VALIDATION_RESPONSE / BLOCKING_REPORT path compliance). אין Widget POC; אין UI build.
- Team 10 צירף GATE_3 exit package: internal verification, acceptance criteria, phase-owner sign-off, evidence עם identity header.

**משימתך — GATE_4 QA:**
1. לבצע QA על הארטיפקטים והתזרימים שהוגשו (אורקסטרציה, נתיבים, evidence).
2. להפיק דוח QA (0 SEVERE נדרש ל-readiness ל-GATE_5).
3. להחזיר את הדוח ל-Team 10 בנתיב קנוני (_COMMUNICATION/team_50/). לכל ארטיפקט: Identity Header מלא (work_package_id S001-P001-WP001, gate_id GATE_4, phase_owner Team 10).

**תנאי יציאה:** דוח QA עם 0 SEVERE; Team 10 יוכל אז לפרסם WORK_PACKAGE_VALIDATION_REQUEST ל-Team 90 (GATE_5).

**מקורות:** TEAM_10_S001_P001_WP001_WORK_PACKAGE_DEFINITION §2, §2.1; 04_GATE_MODEL_PROTOCOL_v2.2.0 (GATE_4 = QA, Team 50).
```

---

## 4) פרומט — Team 90 (GATE_5 — Dev Validation, 10↔90)

**מתי להשתמש:** לאחר GATE_4 (QA) PASS. Team 10 מפרסם WORK_PACKAGE_VALIDATION_REQUEST עם gate_id GATE_5.

**בקשת GATE_5 מלאה (קונטקסט, נהלים, תאימות לכל המעגל, קישורים לכל המסמכים):** [TEAM_10_TO_TEAM_90_S001_P001_WP001_GATE5_VALIDATION_REQUEST.md](TEAM_10_TO_TEAM_90_S001_P001_WP001_GATE5_VALIDATION_REQUEST.md).

---

**פרומט (תמצית; לפרומט מלא + רשימת Evidence ראה המסמך לעיל):**

```
אתה פועל כצוות 90 (Spy / Dev Validation), channel_owner של CHANNEL_10_90_DEV_VALIDATION. Team 10 מגיש לך WORK_PACKAGE_VALIDATION_REQUEST עבור S001-P001-WP001 ב-**GATE_5** (פגישה שנייה בערוץ 10↔90 — לאחר ביצוע ו-QA).

**הקשר:**
- work_package_id: S001-P001-WP001.
- זה **Phase 2** בערוץ: Dev Validation לאחר GATE_3 PASS ו-GATE_4 (QA) PASS.
- בקשת Team 10 תכלול Identity Header מלא ו־gate_id GATE_5 (לא PRE_GATE_3).

**משימתך — GATE_5 Dev Validation:**
1. לאמת את תוצרי הביצוע (אורקסטרציה, evidence, תאימות לקנון) מול המפרט וארטיפקטי הבקשה.
2. להחזיר אחד מהבאים:
   - **VALIDATION_RESPONSE** (overall_status PASS) — בנתיב _COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_S001_P001_WP001_VALIDATION_RESPONSE.md (או עדכון איטרציה אם resubmission).
   - **BLOCKING_REPORT** אם FAIL — בנתיב _COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_S001_P001_WP001_BLOCKING_REPORT.md.
3. לולאה: עד max_resubmissions (ברירת מחדל 5) או עד PASS; ESCALATE/STUCK לפי CHANNEL_10_90_CANONICAL_CONFIRMATION_v1.0.0.

**תנאי יציאה:** VALIDATION_RESPONSE עם PASS; אז Team 10 יעביר ל-Team 190 (GATE_6).

**מקורות:** _COMMUNICATION/team_190/CHANNEL_10_90_CANONICAL_CONFIRMATION_v1.0.0.md; _COMMUNICATION/team_170/MB3A_POC_AGENT_OS_SPEC_PACKAGE_v1.4.0.md §4; 04_GATE_MODEL_PROTOCOL_v2.2.0 §6.1.
```

---

## 5) פרומט — Team 190 (GATE_6 — Architectural Validation EXECUTION)

**מתי להשתמש:** לאחר GATE_5 PASS. Team 10 מעביר חבילה ל-Team 190 לאימות EXECUTION.

---

**פרומט:**

```
אתה פועל כצוות 190 (Constitutional Architectural Validator). Team 10 מעביר לך חבילה לאימות **GATE_6 — ARCHITECTURAL_VALIDATION (EXECUTION)** עבור S001-P001-WP001.

**הקשר:** GATE_5 (Dev Validation) PASS הושג. נדרש אימות EXECUTION — יישור הארטיפקטים לחוקה (SSM, ADR, מפרטים מאושרים).

**משימתך — GATE_6:**
1. לאמת את חבילת הביצוע (אורקסטרציה, evidence, תיעוד) מול החוקה והמפרטים המאושרים.
2. להחזיר החלטה: EXECUTION approval או RETURN עם BLOCKING_REPORT/הנחיות.
3. ארטיפקטים עם Identity Header מלא (work_package_id S001-P001-WP001, gate_id GATE_6).

**תנאי יציאה:** EXECUTION approval; אז ממשיכים ל-GATE_7 (Nimrod — Human UX Approval).

**מקורות:** 04_GATE_MODEL_PROTOCOL_v2.2.0; TEAM_10_S001_P001_WP001_WORK_PACKAGE_DEFINITION; _COMMUNICATION/team_190/ARCHITECTURAL_APPROVAL_PACKAGE_TEMPLATE_v1.0.0 (אם רלוונטי).
```

---

## 6) פרומט — Team 70 (GATE_8 — Documentation Closure, מבצע)

**מתי להשתמש:** לאחר GATE_7 PASS. Team 190/תהליך מפעיל את Team 70 כ-executor של GATE_8.

---

**פרומט:**

```
אתה פועל כצוות 70 (Librarian), **מבצע** GATE_8 — DOCUMENTATION_CLOSURE (AS_MADE_LOCK) עבור Work Package S001-P001-WP001. בעלות GATE_8: Team 190.

**הקשר:** GATE_7 (Human UX Approval) PASS. נדרש סגירת תיעוד: AS_MADE_REPORT, עדכון Developer Guides, ניקוי תיקיות תקשורת, ארכוב ארטיפקטים זמניים, אימות עקביות קנונית.

**משימתך — GATE_8 (executor):**
1. להפיק AS_MADE_REPORT בהתאם לתבנית הקנונית ולזהות החבילה (S001-P001-WP001, gate_id GATE_8).
2. לעדכן Developer Guides לפי הצורך.
3. לנקות/לארכב ארטיפקטים לפי נוהל (TT2_KNOWLEDGE_PROMOTION_PROTOCOL / ארכוב תקשורת).
4. לאמת עקביות קנונית (אינדקס, נתיבים).
5. להעביר ל-Team 190 (owner) לאימות GATE_8. Lifecycle של ה-WP לא complete בלי GATE_8 PASS.

**מקורות:** 04_GATE_MODEL_PROTOCOL_v2.2.0 §5 (GATE_8); TT2_KNOWLEDGE_PROMOTION_PROTOCOL; TEAM_10_S001_P001_WP001_WORK_PACKAGE_DEFINITION §2.
```

---

## 7) סיכום — מתי לאיזה צוות

| שלב נוכחי | פרומט לשימוש |
|------------|----------------|
| GATE_3 | §2 — פרומט צוות 10 (הושלם) |
| GATE_4 | §3 — פרומט Team 50 (הושלם — GATE_A_PASSED) |
| GATE_5 | §4 — פרומט Team 90 (הושלם — PASS; סגירת מעגל, סיום תפקיד צוות 10) |
| **GATE_6 (הבא)** | §5 — פרומט Team 190 (GATE_6 EXECUTION) |
| אחרי GATE_7 PASS | §6 — פרומט Team 70 (GATE_8 executor) |

---

**log_entry | TEAM_10 | S001_P001_WP001 | PROMPTS_AND_ORDER_OF_OPERATIONS | 2026-02-21**
