# 📡 הודעה: בקשה להוספת CSS Variables

**From:** Team 30 (Frontend Execution) - "בוני הלגו"  
**To:** Team 40 (UI Assets & Design) - "מעצבי המערכת"  
**Date:** 2026-02-02  
**Session:** SESSION_01 - Phase 1.6  
**Subject:** CSS_VARIABLES_REQUEST | Status: 🔴 **CRITICAL**  
**Priority:** 🔴 **P0 - BEFORE STAGE 2 COMPLETION**

---

## 📋 Executive Summary

**מטרה:** הוספת CSS Variables ל-`phoenix-base.css` (SSOT) עבור ערכי צבע שנמצאו hardcoded בקוד.

**רקע:** Team 50 זיהה בעיות QA הקשורות לערכי צבע hardcoded. Team 30 תיקן את כל ה-inline styles והחליף אותם ב-CSS Classes, אך נדרשים CSS Variables נוספים ב-`phoenix-base.css`.

**סטטוס:** 🔴 **CRITICAL** - חוסם השלמת Stage 2

---

## 🔴 בקשות להוספת CSS Variables

### **1. CSS Variable: `--color-success-bg`** 🔴 **CRITICAL**

**מיקום נדרש:** `ui/src/styles/phoenix-base.css` (ב-`:root`)

**ערך נדרש:**
```css
--color-success-bg: #e6f7f5;
```

**שימוש נוכחי:**
- `ui/src/styles/D15_IDENTITY_STYLES.css` - `.auth-form__success` (כרגע עם fallback: `var(--color-success-bg, #e6f7f5)`)
- `ui/src/cubes/identity/components/profile/PasswordChangeForm.jsx` - הוסר inline style, משתמש ב-CSS Variable

**הסבר:**
צבע רקע ירוק בהיר להצגת הודעות הצלחה בטופסי Auth. כרגע מוגדר ב-`D15_IDENTITY_STYLES.css` עם fallback, אך צריך להיות ב-`phoenix-base.css` כחלק מ-SSOT.

---

### **2. CSS Variable: `--color-error-red`** 🔴 **CRITICAL**

**מיקום נדרש:** `ui/src/styles/phoenix-base.css` (ב-`:root`)

**ערך נדרש:**
```css
--color-error-red: var(--apple-red, #FF3B30);
--color-error-red-dark: var(--apple-red-dark, #D70015);
```

**שימוש נוכחי:**
- `ui/src/styles/D15_DASHBOARD_STYLES.css` - `.btn-logout` (כרגע עם fallback: `var(--color-error-red, var(--apple-red, #FF3B30))`)
- `ui/src/cubes/identity/components/profile/ProfileView.jsx` - כפתור התנתקות (הוסר inline style, משתמש ב-CSS Variable)

**הסבר:**
צבע אדום לשגיאות וכפתורי פעולות הרסניות. כרגע משתמש ב-`--apple-red` עם fallback, אך צריך להיות מוגדר במפורש ב-`phoenix-base.css` כחלק מ-SSOT.

**הערה:** `--apple-red` כבר מוגדר ב-`phoenix-base.css`, אך `--color-error-red` צריך להיות alias מפורש.

---

## 📋 רשימת פעולות נדרשות

### **קובץ: `ui/src/styles/phoenix-base.css`**

1. 🔴 הוספת CSS Variable: `--color-success-bg: #e6f7f5;`
2. 🔴 הוספת CSS Variable: `--color-error-red: var(--apple-red, #FF3B30);`
3. 🔴 הוספת CSS Variable: `--color-error-red-dark: var(--apple-red-dark, #D70015);`

**מיקום מומלץ:** בתוך `:root` ב-`phoenix-base.css`, בסעיף "Backgrounds" או "Colors" (לפי המבנה הקיים).

---

## ✅ קריטריונים לאישור

לאחר הוספת CSS Variables, נדרש:

1. ✅ כל CSS Variables מוגדרים ב-`phoenix-base.css` (SSOT)
2. ✅ אין ערכי צבע hardcoded בקוד (כל הצבעים דרך CSS Variables)
3. ✅ Fallback values תקינים (אם נדרש)
4. ✅ בדיקת Team 50 עוברת (ירוק)

---

## 🔗 קישורים רלוונטיים

### **קבצים מעודכנים:**
- **CSS:** `ui/src/styles/D15_IDENTITY_STYLES.css` (משתמש ב-`--color-success-bg` עם fallback)
- **CSS:** `ui/src/styles/D15_DASHBOARD_STYLES.css` (משתמש ב-`--color-error-red` עם fallback)
- **Components:** `ui/src/cubes/identity/components/profile/PasswordChangeForm.jsx` (הוסר inline style)
- **Components:** `ui/src/cubes/identity/components/profile/ProfileView.jsx` (הוסר inline style)

### **מסמכים:**
- **דוח QA:** `_COMMUNICATION/team_50/TEAM_50_TO_TEAM_30_ALL_PAGES_QA_ISSUES.md`
- **CSS Standards:** `documentation/10-POLICIES/TT2_CSS_STANDARDS_PROTOCOL.md`

---

## 📋 צעדים הבאים

1. **Team 40:** הוספת CSS Variables ל-`phoenix-base.css`
2. **Team 40:** עדכון `D15_IDENTITY_STYLES.css` ו-`D15_DASHBOARD_STYLES.css` להסרת fallback values (אופציונלי)
3. **Team 30:** בדיקה שהכל עובד תקין
4. **Team 50:** בדיקה סופית לפני אישור

---

## ⚠️ הערות חשובות

1. **SSOT:** כל CSS Variables חייבים להיות ב-`phoenix-base.css` בלבד
2. **Fallback Values:** כרגע יש fallback values ב-CSS Classes, אך לאחר הוספת Variables ל-`phoenix-base.css`, ניתן להסיר אותם
3. **תאימות:** וידוא שהערכים תואמים לעיצוב הקיים (Apple Design System)

---

```
log_entry | [Team 30] | CSS_VARIABLES_REQUEST | SENT_TO_TEAM_40 | 2026-02-02
log_entry | [Team 30] | BLOCKING_STAGE_2 | CSS_VARIABLES | 2026-02-02
```

---

**Team 30 (Frontend Execution) - "בוני הלגו"**  
**Date:** 2026-02-02  
**Status:** 🔴 **AWAITING TEAM_40_COMPLETION - BLOCKING STAGE 2**
