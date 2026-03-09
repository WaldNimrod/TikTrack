# תבנית כותרת קונטיינר - הנחיות מחייבות
**project_domain:** TIKTRACK

**id:** `CONTAINER_HEADER_STRUCTURE_GUIDELINES`  
**owner:** Team 40 (UI Assets & Design)  
**status:** 🔒 **SSOT - MANDATORY**  
**supersedes:** None (Master document)  
**last_updated:** 2026-02-01  
**version:** v1.0

---

**מיקום:** `documentation/04-DESIGN_UX_UI/`  
**תוקף:** מחייב לכל המערכת

---

## 🎯 מטרה

מסמך זה מגדיר את התבנית הבסיסית והמחייבת לכל כותרת קונטיינר במערכת Phoenix V2. תבנית זו חייבת להיות זהה בכל עמוד במערכת.

---

## 📐 מבנה כותרת קונטיינר - 3 חלקים

כל כותרת קונטיינר מורכבת מ-**3 חלקים** בסדר הבא:

### **חלק 1: כותרת (Title)**
- **מיקום:** תחילת השורה (start)
- **תוכן:** **איקון אחד** + טקסט כותרת (אין שני איקונים — חוזה תבנית)
- **רוחב:** מינימום לפי התוכן (`flex-shrink: 0`)
- **יישור:** מיושר לתחילת השורה

### **חלק 2: כותרת משנה (Subtitle)**
- **מיקום:** מרכז השורה
- **תוכן:** מידע נוסף (למשל: "3 פוזיציות פעילות")
- **רוחב:** מקסימלי שנותר (`flex: 1`)
- **יישור:** תוכן מיושר למרכז (`justify-content: center`)

### **חלק 3: אזור כפתורים (Actions)**
- **מיקום:** סוף השורה (end)
- **תוכן:** כפתור סגירת סקשן + כפתורים נוספים (אם יש)
- **רוחב:** בהתאם לתוכן (`flex-shrink: 0`)
- **יישור:** מיושר לסוף השורה (`justify-content: flex-end`)

---

## ✅ כללים מחייבים

### **1. יישור אנכי (Vertical Alignment)**
- **כל האלמנטים** חייבים להיות מיושרים לאמצע מבחינת גובה
- שימוש ב-`align-items: center` על הקונטיינר הראשי
- **אסור** padding או margin אנכיים מיותרים

### **2. גובה קבוע (Fixed Height)**
- **קונטיינר ראשי:** `height: 60px !important` (לא יכול להישבר או להימתח)
- **וויגיטים:** `height: 40px !important` (קטן יותר מקונטיינר ראשי)
- שימוש ב-`min-height` ו-`max-height` זהים לגובה הקבוע

### **3. שורה אחת (Single Row)**
- **כל האלמנטים תמיד בשורה אחת**
- שימוש ב-`flex-wrap: nowrap !important`
- **אסור** שבירת שורה או גדילה בגובה

### **4. ריווח נקי (Clean Spacing)**
- **אין padding אנכי** על הקונטיינר הראשי (רק אופקי)
- **אין margin** על אלמנטים פנימיים (parent handles spacing)
- שימוש ב-`gap` בלבד לריווח בין אלמנטים

### **5. Overflow Prevention**
- שימוש ב-`overflow: hidden` על הקונטיינר הראשי
- מניעת תוכן שיוצא מגבולות

---

## 💻 יישום טכני

### **CSS Structure:**

```css
/* Container Header - 3-part structure */
.container-header {
  display: flex;
  align-items: center; /* CRITICAL: All aligned to middle */
  justify-content: space-between; /* CRITICAL: 3-part layout */
  padding: 0 var(--spacing-lg, 24px); /* No vertical padding */
  height: 60px !important; /* CRITICAL: Fixed height */
  min-height: 60px !important;
  max-height: 60px !important;
  flex-wrap: nowrap !important; /* CRITICAL: Single row */
  overflow: hidden;
  box-sizing: border-box;
}

/* Part 1: Title (start, min-width by content) */
.container-header__title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm, 8px);
  flex-shrink: 0; /* Don't shrink */
  margin: 0;
  padding: 0;
}

/* Part 2: Subtitle (center, takes remaining width) */
.container-header__meta {
  flex: 1; /* CRITICAL: Takes remaining width */
  display: flex;
  align-items: center;
  justify-content: center; /* CRITICAL: Content centered */
  margin: 0;
  padding: 0 var(--spacing-md, 16px);
  min-width: 0;
}

.container-header__count {
  text-align: center;
  white-space: nowrap;
  margin: 0;
  padding: 0;
}

/* Part 3: Actions (end, width by content) */
.container-header__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end; /* CRITICAL: Aligned to end */
  gap: var(--spacing-sm, 8px);
  flex-shrink: 0; /* Don't shrink */
  margin: 0;
  padding: 0;
}
```

### **HTML Structure:**

```html
<div class="container-header">
  <!-- Part 1: Title -->
  <div class="container-header__title">
    <img src="..." alt="..." class="container-header__icon">
    <h2 class="container-header__text">כותרת</h2>
  </div>
  
  <!-- Part 2: Subtitle -->
  <div class="container-header__meta">
    <span class="container-header__count">3 פוזיציות פעילות</span>
  </div>
  
  <!-- Part 3: Actions -->
  <div class="container-header__actions">
    <button class="container-header__toggle-btn">...</button>
    <!-- Additional buttons if needed -->
  </div>
</div>
```

---

## 🎨 דוגמאות

### **דוגמה 1: קונטיינר ראשי (60px)**
```html
<div class="index-section__header">
  <div class="index-section__header-title">
    <img src="..." alt="פורטפוליו" class="index-section__header-icon">
    <h2 class="index-section__header-text">פורטפוליו</h2>
  </div>
  <div class="index-section__header-meta">
    <span class="index-section__header-count">3 פוזיציות פעילות</span>
  </div>
  <div class="index-section__header-actions">
    <button class="index-section__header-toggle-btn">...</button>
  </div>
</div>
```

### **דוגמה 2: וויגיט (40px)**
```html
<div class="widget-placeholder__header-title-row">
  <h3 class="widget-placeholder__title">
    <img src="..." alt="גרף טיקר" class="widget-placeholder__title-icon">
    גרף טיקר
  </h3>
  <button class="widget-placeholder__refresh-btn">...</button>
</div>
```

---

## ⚠️ שגיאות נפוצות - להימנע מהן

### **❌ שגיאה 1: Padding אנכי מיותר**
```css
/* WRONG */
.container-header {
  padding: var(--spacing-md, 16px) var(--spacing-lg, 24px); /* Vertical padding */
}

/* CORRECT */
.container-header {
  padding: 0 var(--spacing-lg, 24px); /* Only horizontal */
}
```

### **❌ שגיאה 2: שני איקונים בכותרת**
```html
<!-- WRONG -->
<div class="index-section__header-title">
  <img src="home.svg" class="index-section__header-icon">
  <img src="notes.svg" class="index-section__header-icon">
  <h1 class="index-section__header-text">הערות</h1>
</div>

<!-- CORRECT -->
<div class="index-section__header-title">
  <img src="notes.svg" alt="הערות" class="index-section__header-icon">
  <h1 class="index-section__header-text">הערות</h1>
</div>
```

### **❌ שגיאה 3: גובה לא קבוע**
```css
/* WRONG */
.container-header {
  min-height: 60px; /* Can grow */
}

/* CORRECT */
.container-header {
  height: 60px !important;
  min-height: 60px !important;
  max-height: 60px !important;
}
```

### **❌ שגיאה 4: שבירת שורה**
```css
/* WRONG */
.container-header {
  flex-wrap: wrap; /* Can wrap */
}

/* CORRECT */
.container-header {
  flex-wrap: nowrap !important; /* Never wrap */
}
```

### **❌ שגיאה 5: יישור לא נכון**
```css
/* WRONG */
.container-header__meta {
  margin-inline-start: auto; /* Pushes to end */
}

/* CORRECT */
.container-header__meta {
  flex: 1; /* Takes remaining width */
  justify-content: center; /* Content centered */
}
```

---

## 📋 Checklist ליישום

לפני סיום כל כותרת קונטיינר, ודא:

- [ ] 3 חלקים בסדר הנכון (Title | Subtitle | Actions)
- [ ] איקון אחד בלבד בכותרת (אין שני איקונים)
- [ ] כל האלמנטים מיושרים לאמצע (`align-items: center`)
- [ ] גובה קבוע ולא יכול להישבר (`height: 60px !important` לקונטיינר ראשי, `40px` לוויגיטים)
- [ ] הכל בשורה אחת (`flex-wrap: nowrap !important`)
- [ ] אין padding אנכי מיותר
- [ ] אין margin מיותר על אלמנטים פנימיים
- [ ] כותרת משנה במרכז (`flex: 1` + `justify-content: center`)
- [ ] כפתורים בסוף (`justify-content: flex-end`)

---

## 🔗 קישורים רלוונטיים

- `00_MASTER_INDEX.md` (שורש) + `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md` — מקורות קנוניים למצב ולמבנה
- `documentation/docs-governance/04-PROCEDURES/AGENTS_OS_V2_OPERATING_PROCEDURES_v1.0.0.md` — נוהל פעיל לתזרימת V2
- `_COMMUNICATION/team_31/team_31_staging/D15_DASHBOARD_STYLES.css` - יישום בפועל

---

**Team 40 (UI Assets & Design)**  
**Date:** 2026-02-01  
**Status:** ✅ **MANDATORY GUIDELINES - ALL TEAMS MUST FOLLOW**
