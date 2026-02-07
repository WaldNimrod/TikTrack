# 🔴 תיקון קריטי: Namespace UAI - עקביות מלאה

**מאת:** Team 10 (The Gateway)  
**אל:** Team 30 (Frontend Execution)  
**תאריך:** 2026-02-07  
**סטטוס:** 🔴 **CRITICAL - BLOCKING**  
**עדיפות:** 🔴 **P0 - CRITICAL**

---

## 🎯 Executive Summary

**משימה קריטית: לוודא `window.UAI.config` עקבי בכל המסמכים והדוגמאות**

**דרישה:** אם נשאר fallback ל-`window.UAIConfig`, להגדיר כ-legacy בלבד במפורש

---

## 📋 דרישות

### **1. עדכון כל המסמכים**

**מסמכים לעדכון:**
- [ ] `_COMMUNICATION/team_30/TEAM_30_UAI_CONFIG_CONTRACT.md`
  - [ ] שורה 22: `window.UAI.config` (לא `window.UAIConfig`)
  - [ ] שורות 199, 266: דוגמאות
  - [ ] שורות 386, 389: validation
- [ ] כל המסמכים עם דוגמאות UAI

**דרישה:** כל דוגמה חייבת להשתמש ב-`window.UAI.config`

---

### **2. עדכון כל הדוגמאות בקוד**

**קבצים לעדכון:**
- [ ] `ui/src/components/core/stages/DOMStage.js` (שורה 27)
- [ ] `ui/src/components/core/UnifiedAppInit.js` (אם נדרש)
- [ ] כל קבצי Config (`pageConfig.js`)

**דרישה:** כל קוד חייב להשתמש ב-`window.UAI.config`

---

### **3. הגדרת legacy fallback**

**דרישה:** אם נשאר fallback ל-`window.UAIConfig`, להגדיר כ-legacy בלבד במפורש

**קוד נדרש:**
```javascript
// ✅ נדרש - עם legacy fallback מפורש
this.config = window.UAI?.config || (() => {
  // Legacy fallback - deprecated, will be removed in future version
  console.warn('[UAI] Using deprecated window.UAIConfig. Please migrate to window.UAI.config');
  return window.UAIConfig;
})();
```

---

## ✅ Checklist מימוש

### **שלב 1: עדכון מסמכים (2 שעות):**
- [ ] עדכון `TEAM_30_UAI_CONFIG_CONTRACT.md`
- [ ] עדכון כל המסמכים עם דוגמאות
- [ ] בדיקת עקביות

### **שלב 2: עדכון קוד (1 שעה):**
- [ ] עדכון `DOMStage.js`
- [ ] עדכון `UnifiedAppInit.js` (אם נדרש)
- [ ] בדיקת תקינות

### **שלב 3: הגדרת legacy fallback (1 שעה):**
- [ ] הוספת legacy fallback מפורש
- [ ] הוספת warning message
- [ ] בדיקת תקינות

---

## 🎯 Timeline

**סה"כ:** 4 שעות

- **שלב 1:** 2 שעות (מסמכים)
- **שלב 2:** 1 שעה (קוד)
- **שלב 3:** 1 שעה (legacy)

---

## ⚠️ אזהרות קריטיות

1. **עקביות מלאה חובה** - `window.UAI.config` בכל המסמכים והדוגמאות
2. **Legacy fallback מפורש** - אם נשאר fallback, חייב להיות מפורש כ-legacy
3. **Warning message חובה** - אם משתמשים ב-legacy, חייב להיות warning

---

## 📞 תמיכה מ-Team 10

**Team 10 זמין לתמיכה:**
- אישור שינויים
- בדיקת תאימות
- פתרון בעיות

---

**Team 10 (The Gateway)**  
**תאריך:** 2026-02-07  
**סטטוס:** 🔴 **CRITICAL - BLOCKING**

**log_entry | [Team 10] | CRITICAL_FIXES | NAMESPACE_UAI | RED | 2026-02-07**
