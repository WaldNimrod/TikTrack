# אלמנט ראש הדף - מפרט טכני מפורט

**מיקום:** `documentation/04-DESIGN_UX_UI/`  
**אחריות:** Team 40 (UI Assets & Design)  
**תוקף:** מחייב לכל המערכת  
**תאריך עדכון:** 2026-02-01  
**גרסה:** v1.0

---

## 🎯 מטרה

מסמך זה מגדיר במדויק את אלמנט ראש הדף (Unified Header) במערכת Phoenix V2. זהו המפרט הטכני המלא והמחייב לכל פיתוח או שינוי של ה-Header.

---

## 📐 מבנה כללי

### **גובה קבוע - LOD 400**
- **גובה כולל:** `120px` (לא ניתן לשנות)
- **שורה עליונה (header-top):** `60px`
- **שורה תחתונה (header-filters):** `60px`
- **Z-Index:** `950` (מעל כל התוכן)

### **מבנה HTML:**
```html
<header id="unified-header">
  <div class="header-content">
    <!-- Row 1: Logo, Navigation, User Zone -->
    <div class="header-top">
      <div class="header-container">
        <div class="header-nav">...</div>
        <div class="logo-section">...</div>
        <div class="user-zone">...</div>
      </div>
    </div>
    <!-- Row 2: Filters -->
    <div class="header-filters">...</div>
  </div>
</header>
```

---

## 🎨 חלק 1: שורה עליונה (header-top)

### **מפרט טכני:**
- **גובה:** `60px` (קבוע, לא ניתן לשנות)
- **רקע:** לבן (`--apple-bg-elevated, #ffffff`)
- **גבול תחתון:** `1px solid var(--apple-border-light, #e5e5e5)`
- **כיוון:** RTL
- **מבנה:** 3 חלקים (Navigation | Logo | User Zone)

### **1.1 Navigation (header-nav)**
- **מיקום:** תחילת השורה (order: 1)
- **כיוון:** RTL
- **תוכן:** רשימת קישורי ניווט (`tiktrack-nav-list`)
- **גובה:** `60px` (מתאים לשורה)

**מחלקות CSS:**
- `.header-nav` - קונטיינר ניווט
- `.main-nav` - ניווט ראשי
- `.tiktrack-nav-list` - רשימת קישורים
- `.tiktrack-nav-item` - פריט ניווט
- `.tiktrack-nav-link` - קישור ניווט

**סגנונות מפתח:**
```css
.header-nav {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex: 1;
  direction: rtl;
  order: 1;
}

.tiktrack-nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem;
  color: #26baac;
  text-decoration: none;
  font-size: 0.92rem; /* Inherited from base */
  font-weight: 300;
}
```

### **1.2 Logo Section (logo-section)**
- **מיקום:** מרכז השורה (order: 3)
- **כיוון:** LTR (לוגו באנגלית)
- **תוכן:** לוגו + סלוגן

**מחלקות CSS:**
- `.logo-section` - קונטיינר לוגו
- `.logo` - קישור לוגו
- `.logo-image` - תמונת לוגו
- `.logo-text` - טקסט סלוגן

**מפרט לוגו:**
- **תמונה:** `125px × 37.5px` (קבוע, לא ניתן לשנות)
- **סגנון:** `object-fit: contain`
- **מיקום:** `flex-shrink: 0`

**מפרט סלוגן:**
- **גודל פונט:** `1rem` (16px) - קבוע
- **משקל פונט:** `300` (Light) - קבוע
- **צבע:** `#26baac` - קבוע
- **כיוון:** LTR
- **יישור:** `text-align: left`
- **מיקום אנכי:** `align-self: flex-end` + `margin-bottom: -5px`

**סגנונות מפתח:**
```css
.logo-image {
  width: 125px !important;
  height: 37.5px !important;
  object-fit: contain !important;
  display: block !important;
  flex-shrink: 0 !important;
}

.logo-text {
  font-size: 1rem !important;
  font-weight: 300 !important;
  color: #26baac !important;
  direction: ltr !important;
  text-align: left !important;
  align-self: flex-end !important;
  margin-bottom: -5px !important;
  line-height: 1.4 !important;
  white-space: nowrap !important;
}
```

### **1.3 User Zone (user-zone)**
- **מיקום:** סוף השורה
- **תוכן:** מידע משתמש + avatar

**מחלקות CSS:**
- `.user-zone` - קונטיינר משתמש
- `.user-info` - מידע משתמש
- `.u-name` - שם משתמש
- `.u-role` - תפקיד משתמש
- `.u-avatar` - תמונת משתמש

**מפרט Avatar:**
- **גודל:** `36px × 36px`
- **צורה:** עגול (`border-radius: 50%`)
- **גבול:** `1px solid var(--color-border)`

---

## 🎨 חלק 2: שורה תחתונה (header-filters)

### **מפרט טכני:**
- **גובה:** `60px` (קבוע, לא ניתן לשנות)
- **רקע:** לבן (`--apple-bg-elevated, #ffffff`)
- **תוכן:** פילטרים וכלי בקרה
- **כיוון:** RTL

**מחלקות CSS:**
- `.header-filters` - קונטיינר פילטרים
- `.filters-container` - קונטיינר פילטרים פנימי
- `.filter-group` - קבוצת פילטרים
- `.filter-toggle-section` - אזור כפתור הצגה/הסתרה

---

## 🔧 הגדרות CSS קריטיות

### **Base Header Styles:**
```css
#unified-header {
  background: var(--apple-bg-elevated, #ffffff);
  border-bottom: 1px solid var(--apple-border-light, #e5e5e5);
  box-shadow: var(--apple-shadow-light, 0 2px 8px rgba(0, 0, 0, 0.05));
  position: sticky;
  top: 0;
  z-index: var(--z-index-header, 950);
  width: 100%;
  display: flex;
  flex-direction: column;
  height: 120px !important; /* CRITICAL: Fixed height */
  min-height: 120px;
  max-height: 120px;
  box-sizing: border-box;
  overflow: visible;
  padding: 0 !important;
  margin-top: 0 !important;
  margin-bottom: 0 !important;
}
```

### **Header Container:**
```css
.header-container {
  margin: 0 auto;
  padding: 0 10px; /* 10px padding from sides only */
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: var(--container-xl, 1400px);
  direction: rtl;
  overflow: visible;
  box-sizing: border-box;
  height: 100%;
}
```

---

## ⚠️ כללים קריטיים - אסור לשנות

### **1. גובה Header**
- **אסור** לשנות את הגובה מ-`120px`
- **אסור** לשנות את גובה השורות (`60px` כל אחת)
- כל שינוי יגרום לשבירת LOD 400

### **2. לוגו וסלוגן**
- **אסור** לשנות את גודל הלוגו (`125px × 37.5px`)
- **אסור** לשנות את גודל הפונט של הסלוגן (`1rem`)
- **אסור** לשנות את משקל הפונט (`300`)
- **אסור** לשנות את הצבע (`#26baac`)
- כל שינוי יגרום לשבירת Visual Fidelity

### **3. Z-Index**
- **אסור** לשנות את ה-Z-Index מ-`950`
- Header חייב להיות מעל כל התוכן

### **4. Position**
- **אסור** לשנות מ-`position: sticky`
- Header חייב להישאר בחלק העליון

### **5. Padding/Margin**
- **אסור** להוסיף padding/margin על `#unified-header`
- Header חייב להיות צמוד לקצה העליון

---

## 📋 Checklist ליישום

לפני סיום כל עבודה על Header, ודא:

- [ ] גובה כולל `120px` (60px + 60px)
- [ ] לוגו `125px × 37.5px`
- [ ] סלוגן `1rem`, `300`, `#26baac`
- [ ] Z-Index `950`
- [ ] Position `sticky`
- [ ] אין padding/margin על header
- [ ] כל האלמנטים מיושרים לאמצע (`align-items: center`)
- [ ] Navigation ב-RTL, Logo ב-LTR
- [ ] Header container ממורכז, max-width `1400px`

---

## 🔗 קישורים רלוונטיים

- `_COMMUNICATION/team_31/team_31_staging/phoenix-header.css` - יישום בפועל
- `documentation/09-GOVERNANCE/standards/PHOENIX_MASTER_BIBLE.md` - ספר החוקים המאסטר
- `documentation/04-DESIGN_UX_UI/CONTAINER_HEADER_STRUCTURE_GUIDELINES.md` - הנחיות כותרות קונטיינרים

---

**Team 40 (UI Assets & Design)**  
**Date:** 2026-02-01  
**Status:** ✅ **MANDATORY SPECIFICATION - ALL TEAMS MUST FOLLOW**
