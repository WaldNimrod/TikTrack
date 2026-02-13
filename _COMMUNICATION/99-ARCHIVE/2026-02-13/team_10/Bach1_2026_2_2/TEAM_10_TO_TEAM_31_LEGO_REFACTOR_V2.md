# 📡 הודעה: Team 10 → Team 31 (Blueprint) | תוכנית LEGO Refactor V2 - תפקיד מעודכן

**From:** Team 10 (The Gateway)  
**To:** Team 31 (Blueprint)  
**Date:** 2026-02-01  
**Session:** SESSION_01 - Phase 1.6  
**Subject:** LEGO_REFACTOR_PLAN_V2 | Status: 🟢 **ACTIVE**  
**Priority:** 🟢 **INFORMATIONAL**

---

## 📋 Executive Summary

התוכנית לבנייה מחדש עודכנה בהתאם לארכיטקטורת LEGO מודולרית. **תפקידכם עודכן** - אתם **לא מעורבים בתהליך הבנייה מחדש**, אלא רק **ספקי Blueprints** לעמודים הבאים.

---

## ⚠️ שינוי חשוב בתפקיד

### **תפקיד קודם:**
- מעורבים בתהליך הבנייה מחדש
- עבודה עם Team 30 על עדכון `global_page_template.jsx`
- עבודה עם Team 40 על הידוק היררכיית CSS

### **תפקיד חדש:** ✅ **מעודכן**
- **ייצור בלופרינטים נוספים לעמודים הבאים**
- **לא מעורבים בתהליך הבנייה מחדש** - רק ספקי Blueprints
- **מטרה:** לייצר בלופרינטים בצורה שתהיה אופטימלית לשילוב במבנה החדש שיצרו Team 30 + Team 40

---

## 🎯 תפקידכם החדש

### **אחריות מרכזית:**
1. **ייצור בלופרינטים לעמודים הבאים** לפי המטריצה
2. **התאמת הבלופרינטים למבנה הקוביות המודולריות**
3. **שמירה על עקביות** עם הבלופרינטים הקיימים

### **⚠️ חשוב:**
- **לא מעורבים בבנייה מחדש** של עמודים קיימים
- **לא מעורבים בעדכון** `global_page_template.jsx` או תיקון CSS
- **רק ספקי Blueprints** - הבלופרינטים עוברים ל-Team 30 + Team 40 למימוש

---

## 📊 מה Team 30 + Team 40 יוצרים

### **מבנה קוביות מודולריות:**
```
ui/src/
├── cubes/
│   ├── identity/              # Identity & Authentication Cube
│   │   ├── components/       # Components משותפים
│   │   ├── contexts/         # State Management משותף
│   │   ├── hooks/            # Hooks משותפים
│   │   ├── services/         # API Services
│   │   └── pages/            # עמודים של הקוביה
│   └── financial/            # Financial Cube
│       └── ...
```

### **עקרונות חשובים:**
- **LEGO System:** `tt-container` > `tt-section` > `tt-section-row`
- **CSS Classes מותאמים אישית** (לא Tailwind)
- **Components משותפים** ברמת קוביה
- **State Management משותף** ברמת קוביה

---

## 📋 עבודה עתידית

### **בלופרינטים נדרשים לפי המטריצה:**

**API Management Cube (D24):**
- D24_API_VIEW

**Security Settings Cube (D25):**
- D25_SEC_VIEW

**Financial Cube (D18, D21):**
- D18_BRKRS_VIEW
- D21_CASH_VIEW

**עמודים נוספים לפי המטריצה:**
- עמודים נוספים לפי `TT2_OFFICIAL_PAGE_TRACKER.md`

---

## 🎨 הנחיות ליצירת בלופרינטים חדשים

### **⚠️ מתי להתחיל:**
- **לאחר השלמת שלב 2.5** (Cube Components Library)
- **קבלת דוגמאות/תבניות** מ-Team 30 + Team 40
- **תיאום עם Team 10** לפני יצירת כל בלופרינט חדש

### **1. התאמה למבנה הקוביות המודולריות:**
- הבלופרינט צריך להיות מוכן לשילוב במבנה `ui/src/cubes/{cube_name}/pages/`
- שימוש ב-Shared Components שזוהו בשלב 2.5
- מבנה HTML/JSX שמאפשר שימוש ב-Components משותפים

### **2. שמירה על LEGO System:**
- שימוש ב-`tt-container` > `tt-section` > `tt-section-row`
- אין CSS מותאם אישית - רק Logical Properties
- שימוש ב-CSS Classes מותאמים אישית (לא Tailwind)

### **3. ⚠️ כלל ברזל - אין JavaScript בתוך הבלופרינט:**
- **אין `<script>` tags** בתוך HTML/JSX
- **אין inline event handlers** (`onclick`, `onchange`, וכו')
- **כל הסקריפטים בקבצים חיצוניים** (באחריות Team 30)
- **הערות על פונקציונליות נדרשת** (למשל: `<!-- TODO: Add form validation -->`)

### **4. מה צריך להיות בבלופרינט:**
✅ **חובה:**
- HTML/JSX נקי עם מבנה LEGO System
- CSS Classes מ-BEM (לא inline styles)
- JS Selectors עם `js-` prefix (למשל: `js-login-trigger`)
- הערות על פונקציונליות נדרשת

❌ **אסור:**
- אין JavaScript בתוך הבלופרינט
- אין inline event handlers
- אין State Management hints (באחריות Team 30)
- אין CSS מותאם אישית

### **5. שמירה על CSS Architecture:**
- סדר טעינת CSS נכון
- שימוש ב-CSS Variables מ-`phoenix-base.css`
- עמידה ב-ITCSS hierarchy

### **6. תיעוד:**
- תיעוד Components משותפים פוטנציאליים
- הערות על פונקציונליות נדרשת
- ציון שכל הסקריפטים יהיו בקבצים חיצוניים

---

## ✅ Checklist לבלופרינטים חדשים

**לפני יצירת בלופרינט חדש:**
- [ ] תיאום עם Team 10 (לאחר השלמת שלב 2.5)
- [ ] קבלת דוגמאות/תבניות מ-Team 30 + Team 40
- [ ] קבלת המסמך `CUBE_COMPONENTS_REFERENCE.md`

**בזמן יצירת הבלופרינט:**
- [ ] זיהוי הקוביה המודולרית (Identity, Financial, API Management, Security)
- [ ] שימוש ב-Shared Components שזוהו בשלב 2.5
- [ ] שמירה על מבנה LEGO System (`tt-container` > `tt-section` > `tt-section-row`)
- [ ] שמירה על CSS Architecture
- [ ] **⚠️ כלל ברזל:** אין JavaScript בתוך הבלופרינט
- [ ] שימוש ב-JS Selectors עם `js-` prefix
- [ ] הערות על פונקציונליות נדרשת
- [ ] תיעוד Components משותפים פוטנציאליים

---

## 🔗 קישורים רלוונטיים

### **תוכנית מלאה:**
- `_COMMUNICATION/team_10/TEAM_10_CSS_BLUEPRINT_REFACTOR_PLAN_V2.md` - תוכנית מעודכנת מלאה

### **מטריצה:**
- `documentation/01-ARCHITECTURE/TT2_OFFICIAL_PAGE_TRACKER.md` - מטריצת עמודים (קוביות מוגדרות)

### **תיעוד:**
- `documentation/01-ARCHITECTURE/TT2_SECTION_ARCHITECTURE_SPEC.md` - LEGO System Spec
- `documentation/04-DESIGN_UX_UI/SYSTEM_WIDE_DESIGN_PATTERNS.md` - Design Patterns
- `_COMMUNICATION/team_31/team_31_staging/CSS_ARCHITECTURE_HIERARCHY.md` - CSS Architecture

### **בלופרינטים קיימים (להתייחסות):**
- `_COMMUNICATION/team_31/team_31_staging/` - כל הבלופרינטים הקיימים

---

## 🎯 הצעדים הבאים

1. **⏸️ להמתין:** להשלמת שלב 2.5 (Cube Components Library)
2. **לקבל:** דוגמאות/תבניות מ-Team 30 + Team 40
3. **לתאם:** עם Team 10 לפני יצירת כל בלופרינט חדש
4. **ליצור:** בלופרינטים על בסיס מה שיצרו Team 30 + Team 40
5. **להתאים:** הבלופרינטים למבנה הקוביות המודולריות
6. **לעמוד:** בכלל הברזל - אין JavaScript בתוך הבלופרינט

---

## 📝 הערות חשובות

- **אתם לא מעורבים בתהליך הבנייה מחדש** של העמודים הקיימים
- **תפקידכם:** לייצר בלופרינטים חדשים בצורה אופטימלית לשילוב במבנה החדש
- **מתי להתחיל:** לאחר השלמת שלב 2.5 (לפני שלב 3)
- **תיאום:** חובה לפני יצירת כל בלופרינט חדש
- **בלופרינטים קיימים:** לא באחריותכם - עברו ל-Team 30 + Team 40

## 📋 תשובות מפורטות לשאלותיכם

**קישור למסמך תשובות מפורט:** `TEAM_10_TO_TEAM_31_ANSWERS_AND_CLARIFICATIONS.md`

המסמך כולל תשובות לכל השאלות:
- מה המבנה המדויק של הקוביות המודולריות?
- איך להתאים בלופרינטים למבנה הקוביות?
- מה צריך להיות בבלופרינט?
- מתי צריך תיאום עם צוותים אחרים?
- איך מתחברים LEGO System ו-Modular Cubes?
- מתי להתחיל לעבוד על בלופרינטים חדשים?
- מה התהליך של העברת בלופרינט לצוותי הפיתוח?
- איך לקבל דוגמאות/תבניות מהצוותים?

---

**Team 10 (The Gateway)**  
**Date:** 2026-02-01  
**Status:** 🟢 **ACTIVE - ROLE UPDATED**

**log_entry | Team 10 | LEGO_REFACTOR_V2 | TO_TEAM_31 | ROLE_UPDATED | 2026-02-01**
