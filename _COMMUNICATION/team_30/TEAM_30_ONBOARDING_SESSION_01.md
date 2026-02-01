# 🚀 חבילת אונבורדינג: צוות 30 (Frontend) | Session 01

**From:** Team 10 (The Gateway)  
**To:** Team 30 (Frontend)  
**Date:** 2026-01-31  
**Session:** SESSION_01 - Authentication & Identity  
**Status:** 🟡 **ONBOARDED - AWAITING BACKEND**

---

## 🎯 הגדרת תפקיד

**צוות 30 (Frontend):** מימוש Pixel Perfect מול Design Tokens בלבד.

**אחריות:**
- מימוש כל רכיבי ה-UI בהתאמה מלאה ל-Design Tokens
- אינטגרציה עם Backend API
- יצירת Auth Service (Frontend)
- מימוש Protected Routes
- Pixel Perfect compliance עם Blueprints

---

## 📚 מסמכי חובה (Mandatory Reading)

**עליכם לקרוא ולשלוט במלואם לפני תחילת עבודה:**

1. **📖 PHOENIX_MASTER_BIBLE.md**
   - מיקום: `documentation/06-GOVERNANCE_&_COMPLIANCE/standards/PHOENIX_MASTER_BIBLE.md`
   - חוקי הברזל, פרוטוקול כניסה, היררכיית סמכויות

2. **⚔️ CURSOR_INTERNAL_PLAYBOOK.md**
   - מיקום: `documentation/06-GOVERNANCE_&_COMPLIANCE/standards/CURSOR_INTERNAL_PLAYBOOK.md`
   - נהלי עבודה, פורמט דיווח, ארגון קבצים

3. **🗂️ D15_SYSTEM_INDEX.md**
   - מיקום: `documentation/D15_SYSTEM_INDEX.md`
   - אינדקס כל התיעוד, מבנה התיקיות

4. **📋 PHASE_1_TASK_BREAKDOWN.md**
   - מיקום: `documentation/05-REPORTS/artifacts_SESSION_01/PHASE_1_TASK_BREAKDOWN.md`
   - תוכנית עבודה מפורטת עם כל המשימות שלכם

5. **🎨 GIN_004_UI_ALIGNMENT_SPEC.md**
   - מיקום: `documentation/03-DESIGN_UX_UI/GIN_004_UI_ALIGNMENT_SPEC.md`
   - דרישות UI ל-D24, D25, D15

---

## 🛡️ חוקי ברזל לביצוע (Immutable Laws)

1. **Zero Invention:** אין להמציא שדות או לוגיקה. חסר מידע? פנה לצוות 10 לבקשת GIN.
2. **Plural Standard:** שמות רבים בלבד בכל ה-API calls (users, api_keys).
3. **Identity Policy:** שימוש ב-ULID בלבד למזהים חיצוניים.
4. **Pixel Perfect:** כל רכיב חייב להתאים בדיוק ל-Design Tokens.
5. **Design Tokens Only:** אין יצירת styles עצמאיים - רק Design Tokens.
6. **Contract Compliance:** כל ה-API calls חייבים להתאים ל-OpenAPI Spec.

---

## ⏸️ סטטוס נוכחי: ממתין ל-Backend

**צוות 30 לא יכול להתחיל עבודה כרגע** מכיוון שהוא תלוי ב:

1. **OpenAPI Spec מפורט** (משימה 20.1.9 של צוות 20)
2. **AuthService פעיל** (משימה 20.1.5 של צוות 20)

---

## 📋 משימות עתידיות (Phase 1)

**לאחר השלמת Backend, תקבלו הוראה להתחיל עם:**

### משימות ראשיות (7 משימות):

1. **משימה 30.1.1:** יצירת Auth Service (Frontend) - 3 שעות
2. **משימה 30.1.2:** יצירת Login Component (D15) - 4 שעות
3. **משימה 30.1.3:** יצירת Register Component (D15) - 4 שעות
4. **משימה 30.1.4:** יצירת Password Reset Flow (D15) - 5 שעות
5. **משימה 30.1.5:** יצירת API Keys Management (D24) - 6 שעות
6. **משימה 30.1.6:** יצירת Security Settings View (D25) - 4 שעות
7. **משימה 30.1.7:** יצירת Protected Routes - 2 שעות

**סה"כ זמן משוער:** 28 שעות (3-4 ימי עבודה)

---

## 🔍 Deep Scan נדרש (לעשות עכשיו)

**לפני קבלת הוראה להתחלה, עליכם לבצע:**

1. **סריקת UI Blueprints:**
   - `documentation/03-DESIGN_UX_UI/GIN_004_UI_ALIGNMENT_SPEC.md`
   - התמקדות ב-D15 (Login/Register), D24 (API Keys), D25 (Security)

2. **סריקת Design Tokens:**
   - `documentation/01-ARCHITECTURE/TT2_MASTER_PALETTE_SPEC.md` (אם קיים)
   - הבנת מערכת ה-Design Tokens

3. **סריקת OpenAPI Spec (נוכחי):**
   - `documentation/05-DEVELOPMENT_&_CONTRACTS/OPENAPI_SPEC_V2_FINAL.yaml`
   - הבנת המבנה הבסיסי (לפני העדכון המפורט)

---

## 📡 תקשורת ודיווח

### דיווח EOD (End of Day):
כל יום בסיום העבודה, שלחו לצוות 10 סיכום:
- מה הושלם היום (אם יש)
- מה מתוכנן למחר
- חסמים או שאלות

### שאלות:
- כל שאלה מבנית → דרך צוות 10 בלבד
- שאלות UI/UX → נמרוד ולד (דרך צוות 10)
- שאלות לוגיקה → Gemini Bridge (דרך צוות 10)

---

## ✅ פרוטוקול "אני מוכן"

**לאחר השלמת הלימוד והסריקה, שלחו הודעה בפורמט הבא:**

```text
From: Team 30
To: Team 10 (The Gateway)
Subject: READINESS_DECLARATION | Status: GREEN
Done: Study of Bible & Index. Deep scan of Frontend context and UI Blueprints.
Context Check: GIN_004_UI_ALIGNMENT_SPEC.md, OPENAPI_SPEC_V2_FINAL.yaml
Next: Awaiting Backend completion (OpenAPI Spec + AuthService) before starting tasks.
log_entry | [Team 30] | READY | 001 | GREEN | AWAITING_BACKEND
```

---

## 🎯 צעדים הבאים

1. **עכשיו:** 
   - קראו את כל המסמכים החובה
   - בצעו Deep Scan של UI Blueprints
   - שלחו READINESS_DECLARATION

2. **המתנה:**
   - המתינו להודעה מצוות 10 על השלמת Backend
   - המתינו ל-OpenAPI Spec מפורט
   - המתינו ל-AuthService פעיל

3. **לאחר קבלת הוראה:**
   - התחילו עם משימה 30.1.1 (Auth Service)
   - המשיכו עם כל שאר המשימות לפי הסדר

---

**Prepared by:** Team 10 (The Gateway)  
**Status:** 🟡 ONBOARDED - AWAITING BACKEND  
**Next:** Awaiting READINESS_DECLARATION + Backend completion notification
