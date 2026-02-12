# 🎨 DNA Button System - SSOT for Button Classes

**From:** Team 40 (UI Assets & Design)  
**To:** Team 10 (The Gateway) + All Teams  
**Date:** 2026-02-10  
**Session:** ADR-013 (24-hour deadline)  
**Subject:** DNA_BUTTON_SYSTEM | Status: ✅ **COMPLETE**  
**Priority:** 🔴 **P0 - CRITICAL (24h deadline)**

**מקור:** `TEAM_10_TO_TEAM_40_MAPPING_MODE_MANDATE.md` (ADR-013)

---

## 📋 Executive Summary

**מטרה:** מסמך SSOT למחלקות כפתור במערכת - שמות מחלקות, מתי להשתמש בכל אחת, וצבעים.

**סטטוס:** ✅ **הושלם תוך 24 שעות** (דרישת ADR-013)

**בעלות:** Team 40 (UI Assets & Design) - בעלות בלעדית על CSS ומראה ויזואלי

---

## 🎯 עקרונות מערכת הכפתורים

### **1. Base Button Class**
כל הכפתורים במערכת משתמשים במחלקה הבסיסית:
- **`.btn`** - מחלקה בסיסית לכל הכפתורים
- **`button`** - תג HTML (מקבל את אותם סגנונות)

### **2. CSS Variables (SSOT יחיד)**
**SSOT רשמי:** `ui/src/styles/phoenix-base.css` (שורות 132-280) - **זהו המקור היחיד לאמת (SSOT)**

כל הצבעים במערכת **חייבים** לבוא מ-`phoenix-base.css` בלבד. אין שימוש בצבעים מחוץ לפלטה.

**משתני צבע עיקריים:**
- `--color-primary` - צבע ראשי (#26baac)
- `--color-secondary` - צבע משני (#fc5a06)
- `--message-success` - הצלחה (#10b981) דרך `--apple-green`
- `--message-error` - שגיאה (#ef4444) דרך `--color-error-red`
- `--message-warning` - אזהרה (#f59e0b) דרך `--apple-orange`

**⚠️ חשוב:** כל הצבעים מוגדרים ב-`phoenix-base.css` בלבד. קבצי CSS אחרים (`D15_DASHBOARD_STYLES.css`, `D15_IDENTITY_STYLES.css`) משתמשים במשתנים מהפלטה אך **לא מגדירים** צבעים חדשים.

### **3. Fluid Design**
כל הכפתורים משתמשים ב-Fluid Design:
- `padding: clamp()` - padding רספונסיבי
- `font-size: clamp()` - גודל טקסט רספונסיבי
- אין media queries - רק Fluid Design

---

## 📊 מחלקות כפתור לפי קטגוריה

### **🔵 Primary Actions (פעולות ראשיות)**

| מחלקה | שימוש | צבע | מיקום CSS |
|-------|------|-----|-----------|
| **`.btn-primary`** | פעולה ראשית (שמור, אישור, שלח) | `--context-primary` (#475569) | `D15_DASHBOARD_STYLES.css` |
| **`.btn-auth-primary`** | כפתור ראשי בעמודי Auth (התחבר, הרשם) | `#26baac` (Primary brand) | `D15_IDENTITY_STYLES.css` |

**מתי להשתמש:**
- `.btn-primary`: פעולות ראשיות בדשבורד, מודלים, טפסים
- `.btn-auth-primary`: כפתור ראשי בעמודי Auth בלבד (login/register/reset)

---

### **🟢 Success Actions (פעולות הצלחה)**

| מחלקה | שימוש | צבע | מיקום CSS |
|-------|------|-----|-----------|
| **`.btn-success`** | פעולות הצלחה (אישור, שמירה מוצלחת) | `--apple-green` (#34C759) | `D15_DASHBOARD_STYLES.css` |

**מתי להשתמש:**
- אישור פעולות מוצלחות
- שמירה מוצלחת
- פעולות חיוביות (הוסף, צור)

---

### **🟡 Warning Actions (פעולות אזהרה)**

| מחלקה | שימוש | צבע | מיקום CSS |
|-------|------|-----|-----------|
| **`.btn-warning`** | פעולות אזהרה (מחיקה, ביטול פעולה) | `--apple-orange` (#FF9500) | `D15_DASHBOARD_STYLES.css` |

**מתי להשתמש:**
- פעולות מחיקה
- ביטול פעולות
- פעולות שדורשות אישור

---

### **⚪ Secondary Actions (פעולות משניות)**

| מחלקה | שימוש | צבע | מיקום CSS |
|-------|------|-----|-----------|
| **`.btn-secondary`** | פעולות משניות (ביטול, חזרה) | `--color-secondary` (#fc5a06) | `D15_DASHBOARD_STYLES.css` |
| **`.btn-outline-secondary`** | כפתור ברירת מחדל (הפוך) | `--color-primary` (#26baac) | `D15_DASHBOARD_STYLES.css` |

**מתי להשתמש:**
- `.btn-secondary`: ביטול פעולות, חזרה, פעולות משניות במודלים/טפסים
- `.btn-outline-secondary`: כפתור ברירת מחדל (מלא עם רקע ראשי וטקסט לבן, הופך ב-hover)

**התנהגות:**
- `.btn-secondary`: Default - רקע לבן, טקסט secondary | Hover - רקע secondary, טקסט לבן | Focus - גבול ראשי + אפקט משני
- `.btn-outline-secondary`: Default - רקע ראשי, טקסט לבן | Hover - רקע לבן, טקסט ראשי | Focus - גבול ראשי + אפקט משני

---

### **🔴 Destructive Actions (פעולות הרסניות)**

| מחלקה | שימוש | צבע | מיקום CSS |
|-------|------|-----|-----------|
| **`.btn-logout`** | התנתקות | `--color-error-red` (#FF3B30) | `D15_DASHBOARD_STYLES.css` |

**מתי להשתמש:**
- התנתקות
- מחיקה סופית (אם נדרש)

---

### **📋 Table Actions (פעולות טבלה)**

| מחלקה | שימוש | צבע | מיקום CSS |
|-------|------|-----|-----------|
| **`.table-action-btn`** | כפתור פעולה בטבלה (צפה, ערוך, מחק) | משתנה לפי פעולה | `phoenix-components.css` |
| **`.table-actions-trigger`** | כפתור פתיחת תפריט פעולות | `--apple-text-secondary` | `phoenix-components.css` |
| **`.phoenix-table-pagination__button`** | כפתור pagination (רק איקונים) | `--color-text` | `phoenix-components.css` |

**מתי להשתמש:**
- `.table-action-btn`: כפתורי פעולה בטבלאות (צפה, ערוך, מחק)
- `.table-actions-trigger`: כפתור פתיחת תפריט פעולות (3 נקודות)
- `.phoenix-table-pagination__button`: כפתורי pagination (רק איקונים, ללא טקסט)

**התנהגות:**
- `.phoenix-table-pagination__button`: טקסט מוסתר (`font-size: 0`), רק איקונים מוצגים | Focus - גבול ראשי + אפקט משני

**צבעים לפי פעולה:**
- צפה: `--color-brand` (#26baac)
- ערוך: `--message-warning` (#f59e0b) - **אזהרה**
- מחק: `--message-error` (#dc3545) דרך `--apple-red`

---

### **🔔 Alert Actions (פעולות התראות)**

| מחלקה | שימוש | צבע | מיקום CSS |
|-------|------|-----|-----------|
| **`.btn-view-alert`** | צפייה בהתראות (עם ריווח מהצדדים) | `--color-text-secondary` דרך `--apple-text-secondary` | `D15_DASHBOARD_STYLES.css`, `phoenix-components.css` |

**מתי להשתמש:**
- כפתור צפייה בהתראות
- כפתור פעמון התראות

**התנהגות:**
- ריווח אופקי: `padding: 0 var(--spacing-xs, 8px)` | Focus - גבול ראשי + אפקט משני

---

### **📏 Size Variants (גדלים)**

| מחלקה | שימוש | גודל | מיקום CSS |
|-------|------|------|-----------|
| **`.btn-sm`** | כפתור קטן | `padding: var(--spacing-xs)` | `D15_DASHBOARD_STYLES.css` |

**מתי להשתמש:**
- כפתורים קטנים במיקומים צפופים
- כפתורים בתוך טבלאות
- כפתורים במודלים קטנים

---

## 🎨 Base Button Styles (phoenix-base.css)

**מחלקה בסיסית:** `.btn` / `button`

**סגנונות בסיסיים:**
```css
button,
.btn {
  background-color: #ffffff;
  color: unset;
  border-color: unset;
  border-radius: 4px;
  padding: 0.125rem 0.6rem; /* Reduced vertical padding */
  font-weight: 300;
  line-height: 1.2;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
}
```

**States:**
- `:hover` - הופך צבעים בין טקסט לרקע (background ↔ text) + `box-shadow`
- `:focus` - גבול ראשי (`--color-primary`) + אפקט משני (`rgba(252, 90, 6, 0.25)`) - `outline: none`, `border-color: var(--color-primary)`, `box-shadow: 0 0 0 3px rgba(252, 90, 6, 0.25)`
- `:active` - `transform: translateY(0)` + `box-shadow`
- `:disabled` - `opacity: 0.65` + `cursor: not-allowed`

---

## 📋 טבלת החלטות - מתי להשתמש בכל מחלקה

| סיטואציה | מחלקה מומלצת | הערות |
|----------|---------------|-------|
| **פעולה ראשית במודל/טופס** | `.btn-primary` | שמור, אישור, שלח |
| **כפתור ראשי בעמודי Auth** | `.btn-auth-primary` | התחבר, הרשם, איפוס סיסמה |
| **ביטול פעולה** | `.btn-secondary` או `.btn-outline-secondary` | ביטול, חזרה |
| **פעולת הצלחה** | `.btn-success` | אישור מוצלח, הוסף, צור |
| **פעולת אזהרה/מחיקה** | `.btn-warning` | מחיקה, ביטול פעולה |
| **התנתקות** | `.btn-logout` | התנתקות מהמערכת |
| **פעולות בטבלה** | `.table-action-btn` | צפה, ערוך, מחק |
| **פתיחת תפריט פעולות** | `.table-actions-trigger` | כפתור 3 נקודות |
| **Pagination** | `.phoenix-table-pagination__button` | קודם, הבא |
| **צפייה בהתראות** | `.btn-view-alert` | כפתור פעמון |

---

## 🎯 כללי שימוש

### **1. RTL Support**
כל הכפתורים תומכים ב-RTL:
- `margin-inline-end` במקום `margin-right`
- `inset-inline-start/end` במקום `left/right`

### **2. Accessibility**
כל הכפתורים כוללים:
- `cursor: pointer`
- `user-select: none`
- Focus states עם `box-shadow`
- Disabled states עם `opacity` ו-`cursor: not-allowed`

### **3. Fluid Design**
כל הכפתורים משתמשים ב-Fluid Design:
- אין media queries
- `clamp()` ל-padding ו-font-size
- Responsive אוטומטי

### **4. CSS Variables (SSOT יחיד)**
**SSOT רשמי:** `ui/src/styles/phoenix-base.css` (שורות 132-280) - **מקור אמת יחיד**

כל הצבעים במערכת **חייבים** לבוא מ-`phoenix-base.css` בלבד:
- אין hardcoded colors
- כל הצבעים דרך CSS Variables מהפלטה
- SSOT יחיד: `phoenix-base.css` (שורות 132-280)
- ראה: `DNA_PALETTE_SSOT.md` למסמך SSOT רשמי

---

## 📋 דוגמאות שימוש

### **דוגמה 1: כפתור ראשי במודל**
```html
<button class="btn btn-primary">שמור</button>
```

### **דוגמה 2: כפתור ביטול**
```html
<button class="btn btn-secondary">ביטול</button>
```

### **דוגמה 3: כפתור Auth**
```html
<button class="btn-auth-primary">התחבר</button>
```

### **דוגמה 4: פעולת טבלה**
```html
<button class="table-action-btn js-action-view" aria-label="צפה">
  <svg>...</svg>
</button>
```

### **דוגמה 5: Pagination**
```html
<button class="phoenix-table-pagination__button" disabled>
  <svg>...</svg>
</button>
```

---

## 🔗 רפרנסים

- **SSOT CSS Variables:** `ui/src/styles/phoenix-base.css`
- **Base Button Styles:** `ui/src/styles/phoenix-base.css` (שורות 605-660)
- **Dashboard Buttons:** `ui/src/styles/D15_DASHBOARD_STYLES.css` (שורות 164-240)
- **Auth Buttons:** `ui/src/styles/D15_IDENTITY_STYLES.css` (שורות 242-258)
- **Table Actions:** `ui/src/styles/phoenix-components.css` (שורות 794-853)
- **SLA 30/40:** `documentation/05-PROCEDURES/TT2_SLA_TEAMS_30_40.md`
- **ADR-013:** `_COMMUNICATION/90_Architects_comunication/ARCHITECT_PHASE_2_FINAL_GAPS_VERDICT.md`

---

## ✅ אישור

**Team 40 מאשר:**
- ✅ מסמך זה הוא SSOT למחלקות כפתור במערכת
- ✅ כל הצוותים חייבים להשתמש במחלקות אלה בלבד
- ✅ אין ליצור מחלקות כפתור חדשות ללא אישור Team 40
- ✅ כל הצבעים חייבים לבוא מ-CSS Variables (SSOT יחיד: `phoenix-base.css` שורות 132-280)
- ✅ ראה `DNA_PALETTE_SSOT.md` למסמך SSOT רשמי לפלטת הצבעים

**הבא:** יישום מחלקות כפתור בכל המודולים והטפסים

---

**Team 40 (UI Assets & Design)**  
**Date:** 2026-02-10  
**Status:** ✅ **DNA_BUTTON_SYSTEM_COMPLETE**

**log_entry | [Team 40] | ADR_013 | DNA_BUTTON_SYSTEM | COMPLETE | 2026-02-10**
