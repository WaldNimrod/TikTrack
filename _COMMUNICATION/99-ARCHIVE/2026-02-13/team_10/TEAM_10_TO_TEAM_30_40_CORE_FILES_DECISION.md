# 🛑 מנדט: החלטה על קבצי Core

**מאת:** Team 10 (The Gateway)  
**אל:** Team 30 (Frontend Execution) + Team 40 (UI Assets & Design)  
**תאריך:** 2026-02-07  
**סטטוס:** 🟥 **RED - BLOCKING - DECISION REQUIRED**  
**עדיפות:** 🔴 **P0 - IMMEDIATE**

---

## 🎯 Executive Summary

**דוח Team 90 זיהה חסם קריטי: חוזי UAI/CSS מצביעים על קבצי Core שלא קיימים בקוד.**

**דרישה:** החלטה מיידית:
- האם ליצור את הקבצים כעת (Design Sprint)?
- או לעדכן את החוזה כך שיתאים לקוד הקיים?

---

## 🔴 חסם קריטי: קבצי Core לא קיימים

### **הבעיה:**

החוזים מציינים קבצים שלא קיימים בקוד:
- `ui/src/components/core/UnifiedAppInit.js` - לא נמצא
- `ui/src/components/core/stages/DOMStage.js` - לא נמצא
- `ui/src/components/core/cssLoadVerifier.js` - לא נמצא

**השפעה:**
- החוזים אינם ניתנים לסריקה/אכיפה
- לא ניתן לבדוק תאימות

---

## 📋 החלטה נדרשת

### **אופציה 1: ליצור את הקבצים כעת (Design Sprint)**

**יתרונות:**
- החוזים יהיו אכיפים
- ניתן לבדוק תאימות
- עקבי עם Design Sprint

**חסרונות:**
- דורש זמן פיתוח
- יכול להיות חלק מה-Design Sprint

**דרישות:**
- [ ] Team 30: ליצור `ui/src/components/core/UnifiedAppInit.js`
- [ ] Team 30: ליצור `ui/src/components/core/stages/DOMStage.js`
- [ ] Team 40: ליצור `ui/src/components/core/cssLoadVerifier.js`

**Timeline:** 24 שעות

---

### **אופציה 2: לעדכן את החוזה כך שיתאים לקוד הקיים**

**יתרונות:**
- מהיר יותר
- לא דורש פיתוח

**חסרונות:**
- החוזה לא יהיה אכיף
- לא ניתן לבדוק תאימות

**דרישות:**
- [ ] Team 30: לעדכן את UAI Contract כך שיתאים לקוד הקיים
- [ ] Team 40: לעדכן את CSS Load Verification Contract כך שיתאים לקוד הקיים

**Timeline:** 12 שעות

---

## 🎯 המלצה

**המלצה:** **אופציה 1 - ליצור את הקבצים כעת**

**סיבות:**
1. Design Sprint נועד ליצור את קבצי ה-Core
2. החוזים צריכים להיות אכיפים
3. ניתן לבדוק תאימות רק אם הקבצים קיימים

---

## 📋 Checklist

### **אם אופציה 1 (ליצור קבצים):**

#### **Team 30:**
- [ ] ליצור `ui/src/components/core/UnifiedAppInit.js`
- [ ] ליצור `ui/src/components/core/stages/DOMStage.js`
- [ ] לוודא שהקבצים תואמים לחוזה

#### **Team 40:**
- [ ] ליצור `ui/src/components/core/cssLoadVerifier.js`
- [ ] לוודא שהקובץ תואם לחוזה

### **אם אופציה 2 (לעדכן חוזה):**

#### **Team 30:**
- [ ] לעדכן את UAI Contract כך שיתאים לקוד הקיים
- [ ] להסיר הפניות לקבצים שלא קיימים

#### **Team 40:**
- [ ] לעדכן את CSS Load Verification Contract כך שיתאים לקוד הקיים
- [ ] להסיר הפניות לקבצים שלא קיימים

---

## ⚠️ אזהרות קריטיות

1. **החלטה נדרשת מיידית** - לא ניתן להמשיך ללא החלטה
2. **אם אופציה 1** - דורש פיתוח מיידי
3. **אם אופציה 2** - החוזה לא יהיה אכיף

---

## 🎯 Timeline

**אופציה 1:** 24 שעות (יצירת קבצים)  
**אופציה 2:** 12 שעות (עדכון חוזה)

**החלטה נדרשת:** תוך 6 שעות

---

**Team 10 (The Gateway)**  
**תאריך:** 2026-02-07  
**סטטוס:** 🟥 **RED - DECISION REQUIRED**

**log_entry | [Team 10] | CORE_FILES | DECISION_REQUIRED | RED | 2026-02-07**
