# 🚀 חבילת אונבורדינג: צוות 50 (QA) | Session 01

**From:** Team 10 (The Gateway)  
**To:** Team 50 (QA)  
**Date:** 2026-01-31  
**Session:** SESSION_01 - Authentication & Identity  
**Status:** 🟢 **ACTIVE - READY TO START**

---

## 🎯 הגדרת תפקיד

**צוות 50 (QA):** ולידציה של Evidence בתיקייה 05-REPORTS/artifacts.

**אחריות:**
- יצירת Test Scenarios מפורטים
- יצירת Sanity Checklists
- ולידציה של Evidence
- בדיקת compliance עם המפרט
- דיווח על בעיות ותקלות

---

## 📚 מסמכי חובה (Mandatory Reading)

**עליכם לקרוא ולשלוט במלואם לפני תחילת עבודה:**

1. **📖 PHOENIX_MASTER_BIBLE.md**
   - מיקום: `documentation/06-GOVERNANCE_&_COMPLIANCE/standards/PHOENIX_MASTER_BIBLE.md`
   - חוקי הברזל, פרוטוקול כניסה

2. **⚔️ CURSOR_INTERNAL_PLAYBOOK.md**
   - מיקום: `documentation/06-GOVERNANCE_&_COMPLIANCE/standards/CURSOR_INTERNAL_PLAYBOOK.md`
   - נהלי עבודה, פורמט דיווח, ארגון קבצים

3. **🗂️ D15_SYSTEM_INDEX.md**
   - מיקום: `documentation/D15_SYSTEM_INDEX.md`
   - אינדקס כל התיעוד

4. **📋 PHASE_1_TASK_BREAKDOWN.md**
   - מיקום: `documentation/05-REPORTS/artifacts_SESSION_01/PHASE_1_TASK_BREAKDOWN.md`
   - תוכנית עבודה מפורטת - הבנת כל הדרישות

5. **📋 PHASE_1_READINESS_ASSESSMENT.md**
   - מיקום: `documentation/05-REPORTS/artifacts_SESSION_01/PHASE_1_READINESS_ASSESSMENT.md`
   - קריטריוני הצלחה וחסמים

---

## 🛡️ חוקי ברזל לביצוע (Immutable Laws)

1. **Zero Invention:** אין להמציא קריטריוני בדיקה. השתמשו במפרט בלבד.
2. **Evidence Based:** כל בדיקה חייבת להיות מתועדת עם Evidence.
3. **Compliance First:** כל בדיקה חייבת לוודא compliance עם המפרט.
4. **Documentation:** כל Test Scenario חייב להיות מתועד ומפורט.

---

## 📋 משימות לשלב הראשון (Phase 1)

### ✅ יכול להתחיל עכשיו:

#### משימה 50.1.1: יצירת Test Scenarios
**עדיפות:** P0  
**זמן משוער:** 3 שעות

**תת-משימות:**
- [ ] Login flow tests
  - Valid credentials
  - Invalid credentials
  - Locked account
  - Expired token
- [ ] Register flow tests
  - Valid registration
  - Duplicate email/username
  - Weak password
  - Invalid phone format
- [ ] Password reset flow tests (EMAIL)
  - Request reset
  - Valid token
  - Expired token
  - Invalid token
- [ ] Password reset flow tests (SMS)
  - Request reset
  - Valid code
  - Invalid code
  - Too many attempts
- [ ] API Keys CRUD tests
  - Create key
  - List keys
  - Update key
  - Delete key
  - Verify key
- [ ] Phone verification tests
- [ ] Error scenarios (invalid credentials, expired tokens)

**תוצר:** `tests/scenarios/auth_scenarios.md`  
**Evidence:** שמור ב-`documentation/05-REPORTS/artifacts_SESSION_01/`

---

#### משימה 50.1.2: יצירת Sanity Checklist
**עדיפות:** P0  
**זמן משוער:** 2 שעות

**תת-משימות:**
- [ ] checklist ל-DB schema
  - כל הטבלאות קיימות
  - כל ה-indexes קיימים
  - כל ה-constraints מוגדרים
- [ ] checklist ל-API endpoints
  - כל ה-endpoints עובדים
  - כל ה-responses תקינים
  - כל ה-error handling תקין
- [ ] checklist ל-UI components
  - כל ה-components עובדים
  - כל ה-forms תקינים
  - כל ה-validation עובד
- [ ] checklist ל-security
  - Encryption עובד
  - Masking עובד
  - Password hashing תקין
  - JWT tokens מאובטחים
- [ ] checklist ל-error handling

**תוצר:** `tests/sanity/phase1_sanity_checklist.md`  
**Evidence:** שמור ב-`documentation/05-REPORTS/artifacts_SESSION_01/`

---

## 🔍 Deep Scan נדרש

**לפני תחילת עבודה, עליכם לבצע:**

1. **סריקת SQL Schema:**
   - `documentation/04-ENGINEERING_&_ARCHITECTURE/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql`
   - הבנת כל הטבלאות והקשרים

2. **סריקת OpenAPI Spec:**
   - `documentation/05-DEVELOPMENT_&_CONTRACTS/OPENAPI_SPEC_V2_FINAL.yaml`
   - הבנת כל ה-endpoints והתגובות

3. **סריקת Task Breakdown:**
   - `documentation/05-REPORTS/artifacts_SESSION_01/PHASE_1_TASK_BREAKDOWN.md`
   - הבנת כל הדרישות והקריטריונים

---

## 📡 תקשורת ודיווח

### דיווח EOD (End of Day):
כל יום בסיום העבודה, שלחו לצוות 10 סיכום:
- מה הושלם היום
- מה מתוכנן למחר
- בעיות או תקלות שזוהו
- המלצות לשיפור

### שאלות:
- שאלות על המפרט → דרך צוות 10 בלבד
- שאלות על קריטריונים → דרך צוות 10

---

## ✅ פרוטוקול "אני מוכן"

**לאחר השלמת הלימוד והסריקה, שלחו הודעה בפורמט הבא:**

```text
From: Team 50
To: Team 10 (The Gateway)
Subject: READINESS_DECLARATION | Status: GREEN
Done: Study of Bible & Index. Deep scan of QA context and all specifications.
Context Check: PHX_DB_SCHEMA_V2.5_FULL_DDL.sql, OPENAPI_SPEC_V2_FINAL.yaml, PHASE_1_TASK_BREAKDOWN.md
Next: Ready to start Phase 1 tasks (50.1.1, 50.1.2).
log_entry | [Team 50] | READY | 001 | GREEN
```

---

## 🎯 צעדים הבאים

1. **עכשיו:** התחילו עם משימות 50.1.1 ו-50.1.2
2. **עבודה במקביל:** תוכלו לעבוד במקביל לצוותים אחרים
3. **ולידציה:** כשהצוותים מסיימים משימות, בדקו את ה-Evidence שלהם

---

**Prepared by:** Team 10 (The Gateway)  
**Status:** 🟢 READY FOR ACTIVATION  
**Next:** Awaiting READINESS_DECLARATION from Team 50
