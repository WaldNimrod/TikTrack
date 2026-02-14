# הוראות ביצוע מפורטות – צוות 50 (QA) | Session 01

**From:** Team 10 (The Gateway)  
**To:** Team 50 (QA)  
**Date:** 2026-01-30  
**Session:** SESSION_01 - Authentication & Identity  
**Subject:** EXECUTION_INSTRUCTIONS | Status: MANDATORY

> **⚠️ היסטורי.** Session 01 הושלם. משימות נוכחיות: `TEAM_10_MASTER_TASK_LIST.md`

---

## 1. חובות לפני התחלה

1. **קריאת מסמכי חובה**
   - `documentation/09-GOVERNANCE/standards/PHOENIX_MASTER_BIBLE.md` (או `06-GOVERNANCE_&_COMPLIANCE/standards/`)
   - `documentation/09-GOVERNANCE/standards/CURSOR_INTERNAL_PLAYBOOK.md`
   - `documentation/08-REPORTS/artifacts_SESSION_01/PHASE_1_TASK_BREAKDOWN.md` (או `documentation/05-REPORTS/artifacts_SESSION_01/`)
   - `documentation/05-PROCEDURES/TT2_QUALITY_ASSURANCE_GATE_PROTOCOL.md` (אם קיים)
   - `documentation/09-GOVERNANCE/standards/TEAM_50_QA_WORKFLOW_PROTOCOL.md` (אם קיים)

2. **הצהרת מוכנות (READINESS_DECLARATION)**  
   שלחו בצ'אט בדיוק בפורמט הזה:

```text
From: Team 50
To: Team 10 (The Gateway)
Subject: READINESS_DECLARATION | Status: GREEN
Done: Study of Bible & Index. Deep scan of Squad context.
Context Check: [ציין מסמך – למשל PHASE_1_TASK_BREAKDOWN.md]
Next: I am ready for the first task.
log_entry | [Team 50] | READY | 001 | GREEN
```

3. **טריטוריה:** כתיבה **רק** בתוך `_COMMUNICATION/team_50/`.  
4. **Evidence:** **חובה** — כל בדיקה מתועדת עם Evidence ב-`documentation/08-REPORTS/artifacts_SESSION_01/` (או `documentation/05-REPORTS/artifacts_SESSION_01/`).

---

## 2. תפקיד ב-Session 01

- **שער א':** הרצת סוויטת בדיקות; 0 SEVERE; ולידציה בממשק.
- **Evidence:** ולידציה של Evidence שכל צוות מפקיד; שמירת דוחות QA ב-artifacts_SESSION_01.

---

## 3. משימות לביצוע (יכול להתחיל מיד)

#### משימה 50.1.1: Test Scenarios (3 שעות)
- [ ] Login flow tests
- [ ] Register flow tests
- [ ] Password reset (EMAIL)
- [ ] Password reset (SMS)
- [ ] API Keys CRUD
- [ ] Phone verification
- [ ] Error scenarios (invalid credentials, expired tokens)
- **תוצר:** `tests/scenarios/auth_scenarios.md` (או מקביל) + Evidence

#### משימה 50.1.2: Sanity Checklist (2 שעות)
- [ ] Checklist ל-DB schema
- [ ] Checklist ל-API endpoints
- [ ] Checklist ל-UI components
- [ ] Checklist ל-security (encryption, masking)
- [ ] Checklist ל-error handling
- **תוצר:** `tests/sanity/phase1_sanity_checklist.md` (או מקביל) + Evidence

---

## 4. כללים מחייבים

- **Evidence Based:** כל בדיקה חייבת להיות מתועדת עם Evidence.
- **שער א':** 0 SEVERE לפני מעבר לשלב הבא; דיווח ל-Team 10 על תוצאות.
- **ולידציה:** כשצוותים 20/30/40 משלימים משימות — בדיקת ה-Evidence שלהם ותיעוד ב-artifacts_SESSION_01.

---

## 5. סיכום

| משימה | תוצר |
|--------|------|
| 50.1.1 | auth test scenarios (מסמך + Evidence) |
| 50.1.2 | phase1 sanity checklist (מסמך + Evidence) |

**מועד התחלה:** מיד — על בסיס המפרט וה-Task Breakdown.

**Prepared by:** Team 10 (The Gateway)
