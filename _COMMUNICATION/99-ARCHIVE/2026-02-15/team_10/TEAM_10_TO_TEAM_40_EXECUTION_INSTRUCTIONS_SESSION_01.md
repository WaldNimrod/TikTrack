# הוראות ביצוע מפורטות – צוות 40 (UI Assets) | Session 01

**From:** Team 10 (The Gateway)  
**To:** Team 40 (UI Assets)  
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
   - SLA 30/40: `documentation/05-PROCEDURES/TT2_SLA_TEAMS_30_40.md` — אתם בעלים בלעדיים של CSS ומראה (Design Tokens, CSS Layers)

2. **הצהרת מוכנות (READINESS_DECLARATION)**  
   שלחו בצ'אט בדיוק בפורמט הזה:

```text
From: Team 40
To: Team 10 (The Gateway)
Subject: READINESS_DECLARATION | Status: GREEN
Done: Study of Bible & Index. Deep scan of Squad context.
Context Check: [ציין מסמך – למשל PHASE_1_TASK_BREAKDOWN.md]
Next: I am ready for the first task.
log_entry | [Team 40] | READY | 001 | GREEN
```

3. **טריטוריה:** כתיבה **רק** בתוך `_COMMUNICATION/team_40/`.  
4. **Evidence:** ב-`documentation/08-REPORTS/artifacts_SESSION_01/` (או `documentation/05-REPORTS/artifacts_SESSION_01/`).

---

## 2. מקורות טכניים

- **UI Alignment:** `03-DESIGN_UX_UI/GIN_004_UI_ALIGNMENT_SPEC.md` — D15, D24, D25.
- **מאסטר פלטה:** `documentation/01-ARCHITECTURE/TT2_MASTER_PALETTE_SPEC.md` (אם קיים) — יישור צבעים וטיפוגרפיה.

---

## 3. משימות לביצוע (יכול להתחיל מיד)

#### משימה 40.1.1: Design Tokens (2 שעות)
- [ ] `design-tokens/auth.json`: colors (primary, error, success), typography, spacing, shadows
- [ ] `design-tokens/forms.json`: input styles, button styles, validation states
- **תוצר:** `design-tokens/auth.json`, `design-tokens/forms.json` + Evidence

#### משימה 40.1.2: Auth Components Styles (3 שעות)
- [ ] Styling ל-LoginForm
- [ ] Styling ל-RegisterForm
- [ ] Styling ל-PasswordReset forms
- [ ] Responsive design
- [ ] Dark mode (אם נדרש במפרט)
- **תוצר:** `styles/auth.css` או styled-components/מערכת Design Tokens + Evidence

---

## 4. כללים מחייבים

- **תפקיד:** Blueprints → רכיבי React Presentational (Pixel Perfect); בעלים בלעדיים של CSS ומראה; Design Tokens ו-CSS Layers.
- **אין:** לוגיקת API או state management — זה צוות 30. שינוי עיצוב רק דרך צוות 40.
- **תיעוד:** Evidence לכל משימה; דיווח EOD לצוות 10.

---

## 5. סיכום

| משימה | תוצר |
|--------|------|
| 40.1.1 | design-tokens/auth.json, forms.json |
| 40.1.2 | styles/auth (Login, Register, Password Reset) |

**מועד התחלה:** מיד — אין תלות ב-Backend.

**Prepared by:** Team 10 (The Gateway)
