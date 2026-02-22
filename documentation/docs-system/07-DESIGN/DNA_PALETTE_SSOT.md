# 🎨 DNA Color Palette - SSOT (Single Source of Truth)
**project_domain:** TIKTRACK

**id:** `DNA_PALETTE_SSOT`  
**owner:** Team 40 (UI Assets & Design) - DNA Guardians  
**status:** 🔒 **SSOT - SINGLE SOURCE OF TRUTH**  
**version:** 1.0  
**last_updated:** 2026-02-10  
**supersedes:** None (Master SSOT)

**מקור:** `ui/src/styles/phoenix-base.css` (שורות 132-280)

---

## 📋 Executive Summary

**מטרה:** מסמך SSOT רשמי המגדיר את פלטת הצבעים המורחבת של המערכת (63 משתנים).

**SSOT Location:** `ui/src/styles/phoenix-base.css` (שורות 132-280)

**גרסה:** 1.0 (לאחר הרחבה ויישור ויזואלי עם Visionary - 2026-02-10)

---

## 🎯 SSOT Definition

### **מיקום SSOT:**
- **קובץ:** `ui/src/styles/phoenix-base.css`
- **שורות:** 132-280
- **סעיף:** `/* ============================================ DNA COLOR SYSTEM - 63 Variables (SSOT) ============================================ */`

### **גרסה ותאריך עדכון:**
- **גרסה:** 1.0
- **תאריך עדכון אחרון:** 2026-02-10
- **יישור ויזואלי:** 2026-01-31 (עם Visionary)

---

## 📊 פלטת הצבעים - 63 משתנים

### **סיכום לפי קטגוריה:**

| קטגוריה | כמות | שורות בקובץ |
|----------|------|--------------|
| **Brand Colors** | 6 | 137-146 |
| **Entity Colors** | 27 | 148-192 |
| **Message & Status Colors** | 12 | 194-213 |
| **Investment Type Colors** | 3 | 215-218 |
| **Numeric Value Colors** | 9 | 220-234 |
| **Base Colors** | 4 | 236-240 |
| **Border Colors** | 2 | 242-244 |
| **סה"כ** | **63** | |

---

## 🔄 לוג שינויים

### **גרסה 1.0 (2026-02-10) - לאחר הרחבה ויישור ויזואלי:**

#### **שינויים מהותיים:**
1. ✅ **הרחבת הפלטה:** הוגדרו 63 משתני צבע (לעומת 59 קודם)
2. ✅ **הוספת Base Colors:** `--color-background-secondary`, `--color-text-secondary` (4 משתנים)
3. ✅ **הוספת Border Colors:** `--color-border`, `--color-border-light` (2 משתנים)
4. ✅ **עדכון Investment Type Colors:** שינוי לסולם צבעים (טורקיז: כהה → בינוני → בהיר)
5. ✅ **עדכון text-secondary:** שינוי מ-`#3C3C43` ל-`#86868b` (צבע שונה מובהק)

#### **מיפוי Apple Colors:**
- ✅ `--apple-blue` → `var(--message-info)`
- ✅ `--apple-red` → `var(--message-error)`
- ✅ `--apple-green` → `var(--message-success)`
- ✅ `--apple-orange` → `var(--message-warning)`
- ✅ `--apple-text-secondary` → `var(--color-primary-dark)` (לצבע שונה מובהק)

#### **משתנים שהוסרו/שונו:**
- ❌ אין משתנים שהוסרו (רק הוספות)

---

## 📐 מבנה מפורט

### **1. Brand Colors (6 משתנים) - שורות 137-146**

```css
/* Primary Brand - Turquoise */
--color-primary: #26baac;
--color-primary-light: #4dd4c4;
--color-primary-dark: #1e968a;

/* Secondary Brand - Orange */
--color-secondary: #fc5a06;
--color-secondary-light: #ff7a33;
--color-secondary-dark: #c84805;
```

### **2. Entity Colors (27 משתנים) - שורות 148-192**

9 ישויות × 3 וריאנטים כל אחת:
- `trade`, `trade_plan`, `execution`, `trading_account`, `cash_flow`, `ticker`, `alert`, `note`, `research`

כל ישות כוללת: `-light`, `base`, `-dark`

### **3. Message & Status Colors (12 משתנים) - שורות 194-213**

4 סוגים × 3 וריאנטים כל אחד:
- `info`, `warning`, `error`, `success`

כל סוג כולל: `-light`, `base`, `-dark`

### **4. Investment Type Colors (3 משתנים) - שורות 215-218**

סולם צבעים (טורקיז):
- `--investment-trade-color: #0d9488` (כהה)
- `--investment-investment-color: #14b8a6` (בינוני)
- `--investment-passive-color: #5eead4` (בהיר)

### **5. Numeric Value Colors (9 משתנים) - שורות 220-234**

3 סוגים × 3 וריאנטים כל אחד:
- `positive`, `negative`, `zero`

כל סוג כולל: `-light` (rgba), `base`, `-dark`

### **6. Base Colors (4 משתנים) - שורות 236-240**

```css
--color-background: #ffffff;
--color-background-secondary: #F2F2F7;
--color-text: #1c1e21;
--color-text-secondary: #86868b; /* Distinct gray - clearly different from primary text */
```

### **7. Border Colors (2 משתנים) - שורות 242-244**

```css
--color-border: #C6C6C8;
--color-border-light: #E5E5EA;
```

---

## 🔗 מיפוי Apple Colors (שורות 261-279)

**עקרון:** Apple colors מוגדרים כ-aliases לצבעי DNA Palette - הפלטה היא הקובעת.

```css
/* Apple Colors → Message Colors */
--apple-blue: var(--message-info);
--apple-red: var(--message-error);
--apple-green: var(--message-success);
--apple-orange: var(--message-warning);

/* Apple Background/Text/Border → Base Colors */
--apple-bg-primary: var(--color-background);
--apple-bg-secondary: var(--color-background-secondary);
--apple-text-primary: var(--color-text);
--apple-text-secondary: var(--color-primary-dark, #1e968a); /* Distinct secondary text */
--apple-border: var(--color-border);
--apple-border-light: var(--color-border-light);
```

---

## ✅ כללים מחייבים

1. **כל הצבעים במערכת חייבים להיות מבוססים על הפלטה**
2. **אין שימוש בצבעים ad-hoc או בערכי hex/שם צבע מחוץ למשתני הפלטה**
3. **הפלטה היא המקור היחיד לאמת (SSOT)**
4. **שינויים בפלטה מתעדכנים אוטומטית בכל המערכת**

---

## 📚 רפרנסים

- **תיעוד מלא:** `documentation/01-ARCHITECTURE/DNA_COLOR_PALETTE_DOCUMENTATION.md`
- **מערכת כפתורים:** `documentation/04-DESIGN_UX_UI/DNA_BUTTON_SYSTEM.md`
- **קובץ SSOT:** `ui/src/styles/phoenix-base.css` (שורות 132-280)

---

**Team 40 (UI Assets & Design) - DNA Guardians**  
**Date:** 2026-02-10  
**Status:** 🔒 **SSOT - SINGLE SOURCE OF TRUTH**

**log_entry | [Team 40] | SSOT | DNA_PALETTE_SSOT | CREATED | 2026-02-10**
