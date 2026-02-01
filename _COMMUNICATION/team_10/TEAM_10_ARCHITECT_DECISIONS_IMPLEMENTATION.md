# 📡 יישום החלטות אדריכליות: LEGO Cubes Architecture Lock

**From:** Team 10 (The Gateway)  
**Date:** 2026-02-01  
**Session:** SESSION_01 - Phase 1.6  
**Subject:** ARCHITECT_DECISIONS_IMPLEMENTATION | Status: 🟢 **IMPLEMENTING**  
**Priority:** 🔴 **CRITICAL - MANDATORY**

---

## 📋 Executive Summary

להלן יישום החלטות האדריכלית הראשית בנושא ארכיטקטורת LEGO Cubes. כל ההחלטות הן **מחייבות** ויש לעדכן את התוכנית וההודעות בהתאם.

**מקור:** `_COMMUNICATION/90_Architects_comunication/ARCHITECT_DECISION_LEGO_CUBES.md`

---

## 🛡️ החלטות אדריכליות - סיכום

### **1. מבנה התיקיות (The Cube Map)** 🔴 **MANDATORY**

**החלטה:**
- **מודל היברידי:**
  - `src/components/core` - גנרי בלבד
  - `src/cubes/shared` - לוגיקה משותפת (כמו PhoenixTable)
  - `src/cubes/{name}` - ספציפי לקוביה

**פעולה:**
- העברת Components הקיימים לתיקיות Shared בתוך Cubes

**מבנה סופי:**
```
ui/src/
├── components/
│   └── core/              # גנרי בלבד (Components בסיסיים שלא קשורים לקוביות)
├── cubes/
│   ├── shared/            # לוגיקה משותפת לכל הקוביות
│   │   ├── components/    # Shared Components (כמו PhoenixTable)
│   │   ├── contexts/      # Shared Contexts
│   │   ├── hooks/          # Shared Hooks
│   │   ├── services/       # Shared Services
│   │   ├── scripts/        # Shared Scripts
│   │   └── utils/          # Shared Utils (כמו transformers)
│   ├── identity/          # Identity & Authentication Cube
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── scripts/
│   │   └── pages/
│   └── financial/         # Financial Cube
│       └── ...
├── contexts/              # Global Contexts (לפני Refactor - יועברו ל-cubes/shared/contexts/)
├── hooks/                 # Global Hooks (לפני Refactor - יועברו ל-cubes/shared/hooks/)
├── services/              # Global Services (לפני Refactor - יועברו ל-cubes/)
├── utils/                 # Global Utils (לפני Refactor - יועברו ל-cubes/shared/utils/)
└── styles/                # CSS files
```

**העברות נדרשות:**
- `PhoenixTable` → `cubes/shared/components/tables/`
- `PhoenixFilterContext` → `cubes/shared/contexts/`
- `usePhoenixTableSort`, `usePhoenixTableFilter`, `usePhoenixTableData` → `cubes/shared/hooks/`
- `transformers.js` → `cubes/shared/utils/`
- `auth.js` → `cubes/identity/services/`
- Components מ-`components/auth/` → `cubes/identity/components/`
- Components מ-`components/profile/` → `cubes/identity/components/`

---

### **2. משילות CSS ו-Tokens** 🔴 **MANDATORY**

**החלטה:**
- **SSOT:** `phoenix-base.css` הוא מקור האמת היחיד לצבעים וריווחים
- **JSON:** קבצי ה-JSON מבוטלים ברמת הקוד
- **Cleanup:** אישור מחיקת `auth.css` ו-`design-tokens.css`

**פעולות:**
- ✅ איחוד כל CSS Variables ל-`phoenix-base.css`
- ✅ הסרת `ui/styles/design-tokens.css`
- ✅ הסרת `ui/styles/auth.css`
- ✅ הסרת `ui/design-tokens/*.json` (קבצי JSON)
- ✅ הסרת inline CSS מ-`global_page_template.jsx`

**קבצים להסרה:**
- `ui/styles/design-tokens.css`
- `ui/styles/auth.css`
- `ui/design-tokens/auth.json`
- `ui/design-tokens/forms.json`

---

### **3. משמעת סקריפטים (No-Inline Rule)** 🔴 **MANDATORY**

**החלטה:**
- **איסור מוחלט** על `<script>` בתוך HTML/JSX
- **חובה** להעביר את כל הלוגיקה של עמודי Auth הקיימים לקבצים חיצוניים

**פעולות:**
- בדיקה של כל קבצי HTML/JSX הקיימים
- העברת כל הלוגיקה לקבצים חיצוניים ב-`cubes/{cube-name}/scripts/`
- פונקציות משותפות ב-`cubes/shared/scripts/`

**קבצים לבדיקה:**
- `ui/src/views/financial/*.html`
- כל קבצי JSX של Auth (LoginForm, RegisterForm, וכו')

---

## 📋 עדכונים נדרשים

### **1. עדכון התוכנית הראשית**

**קובץ:** `TEAM_10_CSS_BLUEPRINT_REFACTOR_PLAN_V2.md`

**עדכונים:**
- עדכון מבנה התיקיות לפי החלטות האדריכלית
- עדכון שלב 2.5 (Cube Components Library) עם המבנה החדש
- עדכון שלב 3 (בנייה מחדש) עם המבנה החדש
- הוספת משימות העברה של Components קיימים

---

### **2. עדכון הודעות לצוותים**

**Team 30:**
- עדכון מבנה התיקיות
- משימות העברה של Components קיימים
- תהליך יצירת Cube Components Library

**Team 40:**
- אישור סופי על תיקוני CSS
- אישור מחיקת קבצי JSON
- אישור מחיקת קבצי CSS כפולים

**Team 50:**
- עדכון קריטריוני ולידציה לפי המבנה החדש

---

### **3. יצירת מסמך מיפוי העברות**

**קובץ:** `TEAM_10_COMPONENTS_MIGRATION_MAP.md`

**תוכן:**
- רשימת כל הקבצים להעברה
- מיקום מקור → מיקום יעד
- תלויות וסדר העברה

---

## ✅ Checklist יישום

### **שלב 1: עדכון תיעוד**
- [x] יצירת מסמך יישום החלטות ✅
- [ ] עדכון התוכנית הראשית
- [ ] עדכון הודעות לצוותים
- [ ] יצירת מסמך מיפוי העברות

### **שלב 2: יישום מבנה תיקיות**
- [ ] יצירת `ui/src/components/core/`
- [ ] יצירת `ui/src/cubes/shared/` עם תיקיות משנה
- [ ] יצירת `ui/src/cubes/identity/` עם תיקיות משנה
- [ ] יצירת `ui/src/cubes/financial/` עם תיקיות משנה

### **שלב 3: העברת Components**
- [ ] העברת `PhoenixTable` → `cubes/shared/components/tables/`
- [ ] העברת `PhoenixFilterContext` → `cubes/shared/contexts/`
- [ ] העברת Hooks → `cubes/shared/hooks/`
- [ ] העברת `transformers.js` → `cubes/shared/utils/`
- [ ] העברת Auth Components → `cubes/identity/components/`
- [ ] העברת Profile Components → `cubes/identity/components/`
- [ ] העברת `auth.js` → `cubes/identity/services/`

### **שלב 4: ניקוי CSS ו-Tokens**
- [ ] איחוד CSS Variables ל-`phoenix-base.css`
- [ ] הסרת `design-tokens.css`
- [ ] הסרת `auth.css`
- [ ] הסרת קבצי JSON
- [ ] הסרת inline CSS מ-`global_page_template.jsx`

### **שלב 5: ניקוי סקריפטים**
- [ ] בדיקת קבצי HTML/JSX
- [ ] העברת סקריפטים לקבצים חיצוניים
- [ ] עדכון imports ו-references

---

## 🔗 קישורים רלוונטיים

### **החלטות אדריכליות:**
- `_COMMUNICATION/90_Architects_comunication/ARCHITECT_DECISION_LEGO_CUBES.md` - החלטות סופיות

### **תוכנית:**
- `_COMMUNICATION/team_10/TEAM_10_CSS_BLUEPRINT_REFACTOR_PLAN_V2.md` - תוכנית ראשית (לעדכן)

### **הודעות לצוותים:**
- `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_30_LEGO_REFACTOR_V2.md` - Team 30 (לעדכן)
- `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_40_LEGO_REFACTOR_V2.md` - Team 40 (לעדכן)

---

**Team 10 (The Gateway)**  
**Date:** 2026-02-01  
**Status:** 🟢 **IMPLEMENTING ARCHITECTURAL DECISIONS**

**log_entry | Team 10 | ARCHITECT_DECISIONS_IMPLEMENTATION | STARTED | 2026-02-01**
