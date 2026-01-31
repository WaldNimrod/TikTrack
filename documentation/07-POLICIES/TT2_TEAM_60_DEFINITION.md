# 🏗️ הגדרת צוות 60 (DevOps & Platform) - פרויקט פיניקס v2.4

**Date:** 2026-01-31  
**Session:** SESSION_01  
**Source:** החלטה אדריכלית רשמית - Chief Architect

---

## 📋 הגדרת תפקיד

**צוות 60 (DevOps & Platform)** הוא ה"אינסטלטור האדריכלי" של פרויקט פיניקס.

**ייעוד:** תשתיות ייצור (Build), סביבות פיתוח ו-Deployment.

---

## 🎯 אחריות מפורטת

### **1. Build System**
- הגדרה ותחזוקה של `package.json`
- הגדרה ותחזוקה של `vite.config.js`
- הגדרה ותחזוקה של `tsconfig.json` (אם נדרש)
- הגדרת Build Scripts ו-Optimization

### **2. Environment Management**
- ניהול משתני סביבה (`.env.development`, `.env.production`)
- סנכרון בין Staging ל-Production
- הגדרת `VITE_` prefix variables (לפי Vite standards)

### **3. Routing Core**
- הקמת תשתית ה-Router (למשל React Router setup)
- יצירת שלד Router שעליו צוות 30 יוצק את התוכן
- הגדרת Protected Routes infrastructure

### **4. Dependency Management**
- אישור ועדכון ספריות חיצוניות (Lucide, Pico, וכו')
- מניעת גרסאות סותרות
- ניהול `package-lock.json` / `yarn.lock`

### **5. CI/CD**
- ניהול תהליך הדחיפה לדרייב/שרת
- הפעלת סקריפטים אוטומטיים
- הגדרת Deployment pipelines

### **6. Infrastructure Documentation**
- תיעוד ה-Stack הטכני בתיקיית `infrastructure/`
- תיעוד Environment Variables
- תיעוד Build Process

---

## 🔗 אינטגרציה עם צוותים אחרים

### **עם צוות 01/02 (אדריכלות):**
- קבלת דרישות טכניות ל-Build System
- קבלת דרישות ל-Environment Variables
- קבלת דרישות ל-Deployment

### **עם צוות 20 (Backend):**
- תיאום על API Base URLs
- תיאום על Ports (8080 Backend, 3000 Frontend)
- תיאום על CORS configuration

### **עם צוות 30 (Frontend):**
- מתן שירותי סביבה (Build System, Router)
- תמיכה טכנית ב-Build errors
- תמיכה ב-Missing packages

---

## 📡 תהליך עבודה

### **קבלת בקשות:**
1. **דרך Team 10 (The Gateway):** כל בקשה לתשתית עוברת דרך Team 10
2. **דיווח:** Team 60 מדווח ל-Team 10 על השלמת משימות
3. **תיעוד:** כל שינוי בתשתית מתועד ב-`infrastructure/`

### **דיווח EOD:**
כל יום בסיום העבודה, Team 60 שולח ל-Team 10:
- מה הושלם היום
- מה מתוכנן למחר
- חסמים או שאלות

---

## 🚫 מה Team 60 לא עושה

**Team 60 לא אחראי על:**
- ❌ כתיבת קוד Backend (זה Team 20)
- ❌ כתיבת קוד Frontend (זה Team 30)
- ❌ יצירת Design Tokens (זה Team 40)
- ❌ בדיקות QA (זה Team 50)
- ❌ ניהול תהליכים (זה Team 10)

---

## 📋 הנחיות לצוות 10 (The Gateway)

### **מטריצת קשרים:**
- **בקשות לתשתית:** כל בקשה הנוגעת לקונפיגורציה של הפרויקט (Build errors, Missing packages, Port conflicts) תופנה ל-Team 60
- **תיעוד:** ודאו ש-Team 60 מתעד את ה-Stack הטכני בתיקיית `infrastructure/`
- **אינטגרציה:** Team 60 חייב לעבוד בסנכרון מלא עם צוות 01/02 (לקבלת דרישות) ועם צוות 30/20 (למתן שירותי סביבה)

---

## 🎯 Priority Levels

- **P0 (Blocking):** Build System, Environment Variables, Router Core
- **P1 (High):** Dependency Management, CI/CD Setup
- **P2 (Medium):** Infrastructure Documentation, Optimization

---

## 📝 דוגמאות למשימות

### **Phase 1.3 - Frontend Infrastructure:**
1. ✅ יצירת `package.json` עם dependencies נדרשים
2. ✅ יצירת `vite.config.js` עם React plugin
3. ✅ יצירת `index.html` entry point
4. ✅ הגדרת React Router Core (`AppRouter.jsx`)
5. ✅ יצירת `.env.development` ו-`.env.production`
6. ✅ הגדרת `src/main.jsx` עם CSS loading order

---

**Prepared by:** Chief Architect - פרויקט פיניקס v252  
**Status:** ✅ **TEAM_60_DEFINITION_APPROVED**  
**Next:** Team 60 Onboarding & Activation

---

**log_entry | Chief Architect | TEAM_60_DEFINITION | SESSION_01 | GREEN | 2026-01-31**
