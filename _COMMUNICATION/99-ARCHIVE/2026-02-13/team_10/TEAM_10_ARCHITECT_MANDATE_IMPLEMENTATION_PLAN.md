# 🎯 תוכנית עבודה: יישום פקודת האדריכל - נעילת Batch 1

**מאת:** Team 10 (The Gateway)  
**תאריך:** 2026-02-04  
**סטטוס:** 📋 **IMPLEMENTATION PLAN**  
**מקור:** פקודת האדריכל + דוח ביקורת חיצונית

---

## 📢 Executive Summary

תוכנית עבודה מקיפה ליישום פקודת האדריכל המאוחדת (Port Lock + Policy Updates) בהתבסס על דוח הביקורת החיצונית.

**עדיפויות:**
- 🔴 **P0 - חוסם אינטגרציה:** נעילת פורטים, עדכון מדיניות סקריפטים
- 🟡 **P1 - יציבות ארכיטקטונית:** routes.json, מינוח נתונים, אבטחה
- 🟢 **P2 - ניקוי וניטור:** הסרת Zustand, ניקוי D16, תיעוד

---

## 🔴 P0: נעילת פורטים (Port Unification)

### **מצב נוכחי:**
- ✅ `vite.config.js` - Frontend 8080, Proxy ל-8082 ✅ נכון
- ⚠️ `auth.js` - משתמש ב-`http://localhost:8082/api/v1` (ישיר) ⚠️ צריך לעבור דרך proxy
- ⚠️ `apiKeys.js` - משתמש ב-`http://localhost:8082/api/v1` (ישיר) ⚠️ צריך לעבור דרך proxy
- ⚠️ `TT2_MASTER_BLUEPRINT.md` - מציין 8080/8082 ✅ נכון
- ⚠️ `OPENAPI_SPEC_V2.yaml` - מציין `http://localhost:8080/api/v1` ⚠️ צריך לבדוק
- ⚠️ `ui/infrastructure/README.md` - מציין 3000/8080 ⚠️ לא מעודכן

### **משימות:**

#### **Team 60 (DevOps):**
1. ✅ **וידוא Vite על פורט 8080** - כבר נכון
2. ✅ **וידוא Proxy ל-8082** - כבר נכון
3. ⚠️ **עדכון CORS ב-FastAPI** - לאפשר רק 8080
4. ⚠️ **עדכון `ui/infrastructure/README.md`** - לעדכן ל-8080/8082

#### **Team 20 (Backend):**
1. ⚠️ **עדכון CORS** - לאפשר רק `http://localhost:8080`
2. ⚠️ **וידוא FastAPI על פורט 8082** - לבדוק

#### **Team 30 (Frontend):**
1. ⚠️ **עדכון `auth.js`** - להשתמש ב-`/api/v1` דרך proxy במקום `http://localhost:8082/api/v1`
2. ⚠️ **עדכון `apiKeys.js`** - להשתמש ב-`/api/v1` דרך proxy במקום `http://localhost:8082/api/v1`

**זמן משוער:** 2-3 שעות

---

## 🔴 P0: עדכון מדיניות סקריפטים (The Hybrid Rule)

### **מצב נוכחי:**
- ⚠️ `PHOENIX_MASTER_BIBLE.md` - אוסר כל `<script>` ב-HTML
- ✅ בפועל - יש שימוש ב-`<script src>` ב-HTML (נכון לארכיטקטורה היברידית)

### **משימות:**

#### **Team 10 (Gateway):**
1. ⚠️ **עדכון `PHOENIX_MASTER_BIBLE.md`** - לאסור רק inline scripts, לאפשר `<script src>`
2. ⚠️ **יצירת `ARCHITECT_POLICY_HYBRID_SCRIPTS.md`** - מדיניות מפורטת

**זמן משוער:** 1 שעה

---

## 🟡 P1: ניהול נתיבים (Routes SSOT)

### **מצב נוכחי:**
- ✅ `routes.json` קיים ב-`_COMMUNICATION/team_10/`
- ⚠️ `auth-guard.js` לא משתמש ב-`routes.json` - צריך לטעון דרך Fetch
- ⚠️ `vite.config.js` מכיל `routeToHtmlMap` - לא נגיש ב-runtime

### **משימות:**

#### **Team 30 (Frontend):**
1. ⚠️ **העברת `routes.json` ל-`ui/public/routes.json`** - נגיש ב-runtime
2. ⚠️ **עדכון `auth-guard.js`** - טעינת routes מ-`/routes.json` דרך Fetch
3. ⚠️ **עדכון `vite.config.js`** - שימוש ב-`routes.json` במקום hardcoded map

**זמן משוער:** 3-4 שעות

---

## 🟡 P1: מינוח נתונים (Singular Naming)

### **מצב נוכחי:**
- ⚠️ צריך לבדוק את שדות ה-API - האם הם ביחיד או ברבים
- ⚠️ `.cursorrules` מציין "Plural names only" - סותר את פקודת האדריכל

### **משימות:**

#### **Team 20 (Backend):**
1. ⚠️ **ביקורת שדות API** - לבדוק שכל השדות ביחיד (`user_id`, `trading_account_id`)
2. ⚠️ **Refactor שדות** - לשנות שדות ברבים ליחיד (אם יש)
3. ⚠️ **עדכון OpenAPI Spec** - לעדכן שדות ליחיד

#### **Team 10 (Gateway):**
1. ⚠️ **עדכון `.cursorrules`** - לעדכן את הכלל למינוח יחיד
2. ⚠️ **יצירת `ARCHITECT_MANDATE_SINGULAR_NAMING.md`** - מדיניות מפורטת

**זמן משוער:** 4-6 שעות

---

## 🟡 P1: אבטחה וניטור (Masked Log)

### **מצב נוכחי:**
- ⚠️ `auth-guard.js` - יש `console.log` לא מאובטח (יכול לדלוף טוקנים)
- ⚠️ `navigationHandler.js` - יש `console.log` לא מאובטח

### **משימות:**

#### **Team 30 (Frontend):**
1. ⚠️ **עדכון `auth-guard.js`** - שימוש ב-`maskedLog` לטוקנים
2. ⚠️ **עדכון `navigationHandler.js`** - הסרת/הגבלת `console.log`
3. ⚠️ **יצירת `maskedLog` utility** - אם לא קיים

**זמן משוער:** 2-3 שעות

---

## 🟡 P1: מקור אמת למצב (State SSOT)

### **מצב נוכחי:**
- ✅ `PhoenixFilterContext.jsx` קיים - React Context
- ⚠️ צריך לבדוק אם יש שימוש ב-Zustand

### **משימות:**

#### **Team 30 (Frontend):**
1. ⚠️ **חיפוש שימוש ב-Zustand** - לבדוק אם יש
2. ⚠️ **הסרת Zustand** - אם נמצא, להסיר ולהשתמש רק ב-React Context
3. ⚠️ **וידוא Bridge Integration** - Context מחובר ל-Hybrid Bridge

**זמן משוער:** 2-4 שעות

---

## 🟢 P2: החלפת קבצים בגרסאות FIX

### **קבצים שצריך להחליף:**

#### **1. `PhoenixFilterContext.jsx`**
- **מיקום נוכחי:** `ui/src/cubes/shared/contexts/PhoenixFilterContext.jsx`
- **קובץ FIX:** צריך לחפש בתיקיית האדריכל
- **שינויים:** הוספת Listener לאירועי Bridge

#### **2. `transformers.js`**
- **מיקום נוכחי:** `ui/src/cubes/shared/utils/transformers.js`
- **קובץ FIX:** צריך לחפש בתיקיית האדריכל
- **שינויים:** המרת מספרים כפויה לשדות כספיים, ערכי ברירת מחדל

#### **3. `auth-guard.js`**
- **מיקום נוכחי:** `ui/src/components/core/authGuard.js`
- **קובץ FIX:** `_COMMUNICATION/team_10/auth-guard.js`
- **שינויים:** Masking לטוקנים, טעינת routes מ-`routes.json`

### **משימות:**

#### **Team 30 (Frontend):**
1. ⚠️ **איתור קבצי FIX** - לחפש בתיקיית האדריכל
2. ⚠️ **החלפת קבצים** - להחליף בגרסאות FIX
3. ⚠️ **בדיקות** - לוודא שהכל עובד

**זמן משוער:** 3-4 שעות

---

## 🟢 P2: ניקוי D16 בקוד

### **מצב נוכחי:**
- ⚠️ יש הערות/לוגים עם "D16" בקבצים החדשים

### **משימות:**

#### **Team 30 (Frontend):**
1. ⚠️ **עדכון הערות** - להחליף "D16" ב-"Trading Accounts"
2. ⚠️ **עדכון console.log** - להחליף "D16 Data Loader" ב-"Trading Accounts Data Loader"
3. ⚠️ **עדכון debug logs** - להחליף `d16-*.js` ב-`tradingAccounts-*.js`
4. ⚠️ **עדכון שם פונקציה** - `initD16Tables()` → `initTradingAccountsTables()`

**זמן משוער:** 1-2 שעות (כבר זוהה בדוח קודם)

---

## 🟢 P2: עדכון תיעוד

### **משימות:**

#### **Team 10 (Gateway):**
1. ⚠️ **עדכון `D15_SYSTEM_INDEX.md`** - להסיר קישורים למסמכים חסרים
2. ⚠️ **עדכון `ui/infrastructure/README.md`** - להסיר design-tokens
3. ⚠️ **עדכון מסמכי ארכיטקטורה** - ליישר שמות קבצים (hyphen vs camelCase)

**זמן משוער:** 2-3 שעות

---

## 📋 Checklist כללי

### **P0 - חוסם אינטגרציה:**
- [ ] עדכון CORS ב-FastAPI (Team 60)
- [ ] עדכון `auth.js` להשתמש ב-proxy (Team 30)
- [ ] עדכון `apiKeys.js` להשתמש ב-proxy (Team 30)
- [ ] עדכון `ui/infrastructure/README.md` (Team 60)
- [ ] עדכון `PHOENIX_MASTER_BIBLE.md` - מדיניות סקריפטים (Team 10)

### **P1 - יציבות ארכיטקטונית:**
- [ ] העברת `routes.json` ל-`ui/public/` (Team 30)
- [ ] עדכון `auth-guard.js` לטעון routes (Team 30)
- [ ] עדכון `vite.config.js` להשתמש ב-routes.json (Team 30)
- [ ] ביקורת שדות API - מינוח יחיד (Team 20)
- [ ] עדכון `.cursorrules` - מינוח יחיד (Team 10)
- [ ] עדכון `auth-guard.js` - maskedLog (Team 30)
- [ ] הסרת Zustand (אם יש) (Team 30)

### **P2 - ניקוי וניטור:**
- [ ] החלפת קבצים בגרסאות FIX (Team 30)
- [ ] ניקוי D16 בקוד (Team 30)
- [ ] עדכון תיעוד (Team 10)

---

## 📚 מסמכים קשורים

### **פקודת האדריכל:**
- `ARCHITECT_PORT_LOCK.md` - פקודת נעילת פורטים
- `TEAM_10_EXTERNAL_AUDIT_FINAL_REPORT.md` - דוח ביקורת חיצונית

### **תיעוד:**
- `documentation/01-ARCHITECTURE/TT2_MASTER_BLUEPRINT.md` - Master Blueprint
- `documentation/09-GOVERNANCE/standards/PHOENIX_MASTER_BIBLE.md` - Master Bible

---

## ⏱️ זמן כולל משוער

- **P0:** 3-4 שעות
- **P1:** 11-17 שעות
- **P2:** 6-9 שעות
- **סה"כ:** 20-30 שעות

---

**Team 10 (The Gateway)**  
**תאריך:** 2026-02-04  
**סטטוס:** 📋 **IMPLEMENTATION PLAN**

**log_entry | [Team 10] | ARCHITECT_MANDATE | IMPLEMENTATION_PLAN | GREEN | 2026-02-04**
