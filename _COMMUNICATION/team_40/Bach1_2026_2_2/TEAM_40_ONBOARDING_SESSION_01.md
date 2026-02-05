# 🚀 חבילת אונבורדינג: צוות 40 (UI Assets) | Session 01

**From:** Team 10 (The Gateway)  
**To:** Team 40 (UI Assets)  
**Date:** 2026-01-31  
**Session:** SESSION_01 - Authentication & Identity  
**Status:** 🟢 **ACTIVE - READY TO START**

---

## 🎯 הגדרת תפקיד

**צוות 40 (UI Assets):** יצירת Design Tokens ו-Styles.

**אחריות:**
- יצירת Design Tokens בהתאם ל-Palette Spec
- יצירת Styles לרכיבי Auth
- תמיכה ב-Responsive Design
- תמיכה ב-Dark Mode (אם נדרש)

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

4. **🎨 GIN_004_UI_ALIGNMENT_SPEC.md**
   - מיקום: `documentation/03-DESIGN_UX_UI/GIN_004_UI_ALIGNMENT_SPEC.md`
   - דרישות Design Tokens (ui_display_config)

5. **📋 PHASE_1_TASK_BREAKDOWN.md**
   - מיקום: `documentation/05-REPORTS/artifacts_SESSION_01/PHASE_1_TASK_BREAKDOWN.md`
   - תוכנית עבודה מפורטת

---

## 🛡️ חוקי ברזל לביצוע (Immutable Laws)

1. **Zero Invention:** אין להמציא צבעים או styles. השתמשו ב-Palette Spec בלבד.
2. **Design Tokens Only:** כל ה-styles חייבים להיות מבוססי Design Tokens.
3. **Consistency:** כל ה-Tokens חייבים להיות עקביים ברחבי המערכת.
4. **Documentation:** כל Token חייב להיות מתועד עם הסבר שימוש.

---

## 📋 משימות לשלב הראשון (Phase 1)

### ✅ יכול להתחיל עכשיו:

#### משימה 40.1.1: יצירת Design Tokens
**עדיפות:** P1  
**זמן משוער:** 2 שעות

**תת-משימות:**
- [ ] יצירת `design-tokens/auth.json`
  - colors (primary, error, success)
  - typography
  - spacing
  - shadows
- [ ] יצירת `design-tokens/forms.json`
  - input styles
  - button styles
  - validation states

**תוצר:** `design-tokens/auth.json`, `design-tokens/forms.json`  
**Evidence:** שמור ב-`documentation/05-REPORTS/artifacts_SESSION_01/`

---

#### משימה 40.1.2: יצירת Auth Components Styles
**עדיפות:** P1  
**זמן משוער:** 3 שעות

**תת-משימות:**
- [ ] styling ל-LoginForm
- [ ] styling ל-RegisterForm
- [ ] styling ל-PasswordReset forms
- [ ] responsive design
- [ ] dark mode support (אם נדרש)

**תוצר:** `styles/auth.css` או styled-components  
**Evidence:** שמור ב-`documentation/05-REPORTS/artifacts_SESSION_01/`

---

## 🔍 Deep Scan נדרש

**לפני תחילת עבודה, עליכם לבצע:**

1. **סריקת UI Blueprints:**
   - `documentation/03-DESIGN_UX_UI/GIN_004_UI_ALIGNMENT_SPEC.md`
   - התמקדות ב-`ui_display_config` structure

2. **סריקת Palette Spec:**
   - `documentation/01-ARCHITECTURE/TT2_MASTER_PALETTE_SPEC.md` (אם קיים)
   - הבנת מערכת הצבעים והטיפוגרפיה

---

## 📡 תקשורת ודיווח

### דיווח EOD (End of Day):
כל יום בסיום העבודה, שלחו לצוות 10 סיכום:
- מה הושלם היום
- מה מתוכנן למחר
- חסמים או שאלות

### שאלות:
- שאלות UI/UX → נמרוד ולד (דרך צוות 10)
- שאלות מבניות → דרך צוות 10 בלבד

---

## ✅ פרוטוקול "אני מוכן"

**לאחר השלמת הלימוד והסריקה, שלחו הודעה בפורמט הבא:**

```text
From: Team 40
To: Team 10 (The Gateway)
Subject: READINESS_DECLARATION | Status: GREEN
Done: Study of Bible & Index. Deep scan of UI Assets context and Design Tokens.
Context Check: GIN_004_UI_ALIGNMENT_SPEC.md, TT2_MASTER_PALETTE_SPEC.md
Next: Ready to start Phase 1 tasks (40.1.1, 40.1.2).
log_entry | [Team 40] | READY | 001 | GREEN
```

---

## 🎯 צעדים הבאים

1. **עכשיו:** התחילו עם משימות 40.1.1 ו-40.1.2
2. **עבודה במקביל:** תוכלו לעבוד במקביל לצוותים אחרים
3. **תיאום:** וודאו שהצוותים האחרים משתמשים ב-Design Tokens שיצרתם

---

**Prepared by:** Team 10 (The Gateway)  
**Status:** 🟢 READY FOR ACTIVATION  
**Next:** Awaiting READINESS_DECLARATION from Team 40
