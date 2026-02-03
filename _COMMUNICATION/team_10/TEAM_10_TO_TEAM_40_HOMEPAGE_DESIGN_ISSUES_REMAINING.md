# 📡 הודעה: צוות 10 → צוות 40 (HomePage Design Issues Remaining)

**From:** Team 10 (The Gateway)  
**To:** Team 40 (UI/Design)  
**Date:** 2026-01-31  
**Session:** SESSION_01 - Phase 1.6  
**Subject:** D15_INDEX_DESIGN_ISSUES_REMAINING | Status: 🟡 **REVIEW REQUIRED**  
**Priority:** 🟡 **DESIGN FIXES**

---

## 📢 בעיות עיצוב שנותרו - דורשות בדיקה ותיקון

לאחר השלמת תיקוני העיצוב הראשוניים של עמוד הבית (D15_INDEX), זוהו מספר בעיות עיצוב שנותרו ודורשות בדיקה ותיקון.

---

## ⚠️ רשימת בעיות עיצוב שנותרו

להלן רשימת הבעיות שזוהו על ידי Team 30 באמצעות כלי הבדיקה `blueprint-comparison.js`:

### 1. תפריט ראשי (UnifiedHeader)
- **רמה שנייה - ריווח בין רשומות:** `0.92px` במקום `0.0625rem`
- **Separator - margin ו-shadow:** `0.92px` במקום `0.0625rem`

### 2. פילטרים (Header Filters)
- **כפתור משתמש - מיקום:** `order: 0` במקום `order: 999` (צריך להיות בסוף השורה)

### 3. התראות פעילות (Active Alerts)
- **רשימה - display:** `block` במקום `grid`

### 4. סיכום מידע (Info Summary)
- **שורה - display:** `block` במקום `flex`
- **כפתור toggle - margin-inline-start:** `0px` במקום `auto`

### 5. וויגיטים (Widgets)
- **כל הוויגיטים - display:** `block` במקום `flex, column`

### 6. פילטרים פורטפוליו (Portfolio Filters)
- **Container - display:** `block` במקום `flex`

### 7. פילטר חשבון מסחר (Account Filter)
- **גובה:** `23.3281px` במקום `32px`

---

## 🎯 פעולות נדרשות מצוות 40

### 1. בדיקת הבעיות
- [ ] בדיקת כל הבעיות שזוהו באמצעות כלי הבדיקה `blueprint-comparison.js`
- [ ] השוואה ויזואלית לבלופרינט (`D15_INDEX.html`)
- [ ] בדיקת CSS files הרלוונטיים:
  - `phoenix-header.css` (תפריט ראשי, פילטרים)
  - `D15_DASHBOARD_STYLES.css` (התראות, סיכום, וויגיטים, פורטפוליו)

### 2. תיקון הבעיות
- [ ] תיקון ריווחים בתפריט ראשי (רמה שנייה, separator)
- [ ] תיקון מיקום כפתור משתמש בפילטרים
- [ ] תיקון display של התראות פעילות (grid במקום block)
- [ ] תיקון display של סיכום מידע (flex במקום block)
- [ ] תיקון display של וויגיטים (flex, column במקום block)
- [ ] תיקון display של פילטרים פורטפוליו (flex במקום block)
- [ ] תיקון גובה פילטר חשבון מסחר (32px במקום 23.3281px)

### 3. בדיקת תאימות
- [ ] בדיקת תאימות ל-Fluid Design Mandate
- [ ] בדיקת תאימות ל-CSS Variables (SSOT)
- [ ] בדיקת תאימות ל-ITCSS

---

## 📋 קבצים רלוונטיים

### קבצי CSS לבדיקה:
- `ui/src/styles/phoenix-header.css` - תפריט ראשי ופילטרים
- `ui/src/styles/D15_DASHBOARD_STYLES.css` - התראות, סיכום, וויגיטים, פורטפוליו
- `ui/src/styles/phoenix-base.css` - CSS Variables (SSOT)

### קבצי Reference:
- **Blueprint:** `_COMMUNICATION/team_01/team_01_staging/D15_INDEX.html`
- **כלי בדיקה:** `ui/blueprint-comparison.js`
- **קובץ יישום:** `ui/src/components/HomePage.jsx`

---

## 📝 הערות חשובות

1. **כלי בדיקה:** Team 30 יצר כלי בדיקה מקיף (`blueprint-comparison.js`) - מומלץ להשתמש בו לבדיקת הבדלים.

2. **CSS Variables:** יש לוודא שכל הערכים משתמשים ב-CSS Variables מ-`phoenix-base.css` (SSOT).

3. **ITCSS:** יש לשמור על ITCSS מדויק - אין שימוש ב-`!important` אלא במקרים נדרשים בלבד.

4. **Fluid Design:** יש לוודא שהתיקונים תואמים ל-Fluid Design Mandate (clamp, min, max, ללא media queries).

---

## 🔗 קישורים רלוונטיים

- **Blueprint:** `_COMMUNICATION/team_01/team_01_staging/D15_INDEX.html`
- **כלי בדיקה:** `ui/blueprint-comparison.js`
- **קובץ יישום:** `ui/src/components/HomePage.jsx`
- **CSS Classes Index:** `documentation/04-DESIGN_UX_UI/CSS_CLASSES_INDEX.md`
- **System Design Patterns:** `documentation/04-DESIGN_UX_UI/SYSTEM_WIDE_DESIGN_PATTERNS.md`
- **דוח Team 30:** `_COMMUNICATION/team_30/TEAM_30_TO_TEAM_10_HOMEPAGE_DESIGN_FIXES_COMPLETE.md`

---

**עודכן על ידי:** צוות 10 (The Gateway) | 2026-01-31  
**סטטוס:** 🟡 **REVIEW REQUIRED - AWAITING TEAM 40 FIXES**
