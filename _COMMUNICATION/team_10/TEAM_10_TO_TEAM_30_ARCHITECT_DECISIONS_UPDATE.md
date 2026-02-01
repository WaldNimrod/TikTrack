# 📡 הודעה: Team 10 → Team 30 | עדכון: החלטות אדריכליות

**From:** Team 10 (The Gateway)  
**To:** Team 30 (Frontend Execution)  
**Date:** 2026-02-01  
**Session:** SESSION_01 - Phase 1.6  
**Subject:** ARCHITECT_DECISIONS_UPDATE | Status: 🛡️ **MANDATORY**  
**Priority:** 🔴 **CRITICAL - ARCHITECT LOCKED**

---

## 📋 Executive Summary

האדריכלית הראשית נתנה החלטות סופיות על ארכיטקטורת LEGO Cubes. כל ההחלטות הן **מחייבות** ויש לעדכן את העבודה בהתאם.

**מקור:** `_COMMUNICATION/90_Architects_comunication/ARCHITECT_DECISION_LEGO_CUBES.md`

---

## 🛡️ החלטות אדריכליות - סיכום

### **1. מבנה התיקיות (The Cube Map)** 🔴 **MANDATORY**

**החלטה:**
- **מודל היברידי:**
  - `src/components/core` - גנרי בלבד
  - `src/cubes/shared` - לוגיקה משותפת (כמו PhoenixTable)
  - `src/cubes/{name}` - ספציפי לקוביה

**מבנה סופי:**
```
ui/src/
├── components/
│   └── core/              # גנרי בלבד (Components בסיסיים שלא קשורים לקוביות)
├── cubes/
│   ├── shared/            # לוגיקה משותפת לכל הקוביות 🛡️
│   │   ├── components/    # Shared Components (כמו PhoenixTable)
│   │   ├── contexts/      # Shared Contexts (כמו PhoenixFilterContext)
│   │   ├── hooks/         # Shared Hooks (כמו usePhoenixTableSort)
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
```

**העברות נדרשות (באחריות Team 30):**
- [ ] `PhoenixTable` → `cubes/shared/components/tables/` 🛡️
- [ ] `PhoenixFilterContext` → `cubes/shared/contexts/` 🛡️
- [ ] `usePhoenixTableSort`, `usePhoenixTableFilter`, `usePhoenixTableData` → `cubes/shared/hooks/` 🛡️
- [ ] `transformers.js` → `cubes/shared/utils/` 🛡️
- [ ] `auth.js` → `cubes/identity/services/` 🛡️
- [ ] Components מ-`components/auth/` → `cubes/identity/components/` 🛡️
- [ ] Components מ-`components/profile/` → `cubes/identity/components/` 🛡️

**חשוב:** יש לעדכן את כל ה-imports לאחר ההעברות!

---

### **2. משמעת סקריפטים (No-Inline Rule)** 🔴 **MANDATORY**

**החלטה:**
- **איסור מוחלט** על `<script>` בתוך HTML/JSX
- **חובה** להעביר את כל הלוגיקה של עמודי Auth הקיימים לקבצים חיצוניים

**פעולות נדרשות:**
- [ ] בדיקה של כל קבצי HTML/JSX הקיימים
- [ ] העברת כל הלוגיקה לקבצים חיצוניים ב-`cubes/{cube-name}/scripts/`
- [ ] פונקציות משותפות ב-`cubes/shared/scripts/`
- [ ] עדכון כל ה-imports ו-references

**קבצים לבדיקה:**
- `ui/src/views/financial/*.html`
- כל קבצי JSX של Auth (LoginForm, RegisterForm, וכו')

---

## 📋 משימות מיידיות

### **שלב 1: יצירת מבנה תיקיות** 🛡️ **MANDATORY**

**לפני כל עבודה אחרת:**
- [ ] יצירת `ui/src/components/core/`
- [ ] יצירת `ui/src/cubes/shared/` עם כל התיקיות המשנה
- [ ] יצירת `ui/src/cubes/identity/` עם כל התיקיות המשנה
- [ ] יצירת `ui/src/cubes/financial/` עם כל התיקיות המשנה

---

### **שלב 2: העברת Components קיימים** 🛡️ **MANDATORY**

**סדר העברה מומלץ:**
1. **Shared Components:**
   - [ ] `PhoenixTable` → `cubes/shared/components/tables/`
   - [ ] `PhoenixFilterContext` → `cubes/shared/contexts/`
   - [ ] Hooks → `cubes/shared/hooks/`
   - [ ] `transformers.js` → `cubes/shared/utils/`

2. **Identity Cube:**
   - [ ] `auth.js` → `cubes/identity/services/`
   - [ ] Components מ-`components/auth/` → `cubes/identity/components/`
   - [ ] Components מ-`components/profile/` → `cubes/identity/components/`

3. **עדכון Imports:**
   - [ ] עדכון כל ה-imports בכל הקבצים
   - [ ] בדיקה שהכל עובד אחרי ההעברות

---

### **שלב 3: ניקוי סקריפטים** 🛡️ **MANDATORY**

- [ ] בדיקת קבצי HTML/JSX
- [ ] העברת סקריפטים לקבצים חיצוניים
- [ ] עדכון references

---

## ⚠️ הערות חשובות

1. **כל ההחלטות מחייבות** - אין סטיות מהמבנה שנקבע
2. **עדכון imports** - חובה לעדכן את כל ה-imports לאחר ההעברות
3. **בדיקות** - יש לבדוק שהכל עובד אחרי כל העברה
4. **תיעוד** - יש לתעד את כל ההעברות במסמך נפרד

---

## 🔗 קישורים רלוונטיים

### **החלטות אדריכליות:**
- `_COMMUNICATION/90_Architects_comunication/ARCHITECT_DECISION_LEGO_CUBES.md` - החלטות סופיות

### **תוכנית:**
- `_COMMUNICATION/team_10/TEAM_10_CSS_BLUEPRINT_REFACTOR_PLAN_V2.md` - תוכנית מעודכנת

### **יישום:**
- `_COMMUNICATION/team_10/TEAM_10_ARCHITECT_DECISIONS_IMPLEMENTATION.md` - מסמך יישום

---

**Team 10 (The Gateway)**  
**Date:** 2026-02-01  
**Status:** 🛡️ **MANDATORY - ARCHITECT LOCKED**

**log_entry | Team 10 | ARCHITECT_DECISIONS_UPDATE | TO_TEAM_30 | 2026-02-01**
