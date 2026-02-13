# 📡 הודעה: צוות 10 → Team 40 (Batch 1 Closure - UI/Design Mandate)

**From:** Team 10 (The Gateway)  
**To:** Team 40 (UI Assets & Design)  
**Date:** 2026-02-02  
**Session:** SESSION_01 - Phase 1.6  
**Subject:** BATCH_1_CLOSURE_UI_DESIGN_MANDATE | Status: 🛡️ **MANDATORY**  
**Priority:** 🔴 **CRITICAL**

---

## 📢 פסיקת האדריכל: צוות 40 - "שומרי ה-DNA"

חבילה 1 (Identity & Auth) מאושרת רשמית כבלופרינט המחייב של המערכת.

להלן ההנחיות הספציפיות לצוות 40:

---

## 🎯 תפקיד: "שומרי ה-DNA"

**האדריכלית הגדירה את צוות 40 כ"שומרי ה-DNA"** - ניהול בלעדי של ה-CSS Variables ושמירה על ה-DNA העיצובי של המערכת.

---

## 🚨 חוקי ברזל

### **1. ניהול בלעדי של CSS Variables**

**חוק ברזל:**
- 🚨 **כל העיצוב חייב להיות דרך CSS Variables ב-`phoenix-base.css`**
- 🚨 **אין להכניס עיצוב מקומי בתוך רכיבים**

**דוגמאות:**
```css
/* ✅ נכון - שימוש ב-CSS Variables */
.component {
  color: var(--apple-text-primary, #1d1d1f);
  background: var(--apple-bg-elevated, #ffffff);
  padding: var(--spacing-lg, 24px);
}

/* ❌ שגוי - עיצוב מקומי */
.component {
  color: #1d1d1f; /* אסור! */
  background: #ffffff; /* אסור! */
  padding: 24px; /* אסור! */
}
```

**פעולות נדרשות:**
- ✅ כל העיצוב דרך CSS Variables ב-`phoenix-base.css`
- ✅ אי-הכנסת עיצוב מקומי בתוך רכיבים
- ✅ שמירה על ה-DNA העיצובי

---

### **2. אין עיצוב מקומי בתוך רכיבים**

**חוק ברזל:**
- 🚨 **אין להכניס עיצוב מקומי בתוך רכיבים**
- 🚨 **כל העיצוב חייב להיות דרך CSS Variables**

**דוגמאות:**
```jsx
// ✅ נכון - שימוש ב-CSS Classes
<div className="phoenix-button phoenix-button--primary">
  Click me
</div>

// ❌ שגוי - עיצוב מקומי
<div style={{ color: '#1d1d1f', background: '#ffffff' }}>
  Click me
</div>
```

**פעולות נדרשות:**
- ✅ שימוש ב-CSS Classes בלבד
- ✅ אי-שימוש ב-inline styles
- ✅ כל העיצוב דרך CSS Variables

---

### **3. שמירה על ה-DNA העיצובי**

**חוק ברזל:**
- 🚨 **שמירה על ה-DNA העיצובי של המערכת**
- 🚨 **אין סטיות מה-DNA**

**DNA העיצובי:**
- ✅ CSS Variables ב-`phoenix-base.css`
- ✅ BEM Naming Convention
- ✅ ITCSS Hierarchy
- ✅ Fluid Design עם `clamp()`
- ✅ Logical Properties (RTL)

**פעולות נדרשות:**
- ✅ שמירה על ה-DNA העיצובי
- ✅ אי-סטיות מה-DNA
- ✅ כל שינוי דרך CSS Variables

---

## 📋 פעולות נדרשות מיידיות

### **1. בדיקת CSS Variables**
- [ ] כל העיצוב דרך CSS Variables ב-`phoenix-base.css`
- [ ] אי-הכנסת עיצוב מקומי בתוך רכיבים
- [ ] שמירה על ה-DNA העיצובי

### **2. בדיקת עיצוב מקומי**
- [ ] שימוש ב-CSS Classes בלבד
- [ ] אי-שימוש ב-inline styles
- [ ] כל העיצוב דרך CSS Variables

### **3. בדיקת DNA**
- [ ] שמירה על ה-DNA העיצובי
- [ ] אי-סטיות מה-DNA
- [ ] כל שינוי דרך CSS Variables

---

## 🔗 קבצים רלוונטיים

- `_COMMUNICATION/90_Architects_comunication/ARCHITECT_BATCH_1_FINAL_SUMMARY.md` - הודעה מלאה מהאדריכלית
- `documentation/09-GOVERNANCE/standards/PHOENIX_MASTER_BIBLE.md` - ספר החוקים המאסטר (עודכן)
- `ui/src/styles/phoenix-base.css` - מקור האמת ל-CSS Variables (SSOT)

---

**Team 10 (The Gateway)**  
**Date:** 2026-02-02  
**Status:** 🛡️ **MANDATORY - FOUNDATION SEAL**

**log_entry | [Team 10] | BATCH_1_CLOSURE | TO_TEAM_40 | GREEN | 2026-02-02**
