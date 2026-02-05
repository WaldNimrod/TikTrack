# 📋 תיעוד: Static HTML Routing Configuration

**מאת:** Team 10 (The Gateway)  
**תאריך:** 2026-02-03  
**מקור:** Team 30 (Frontend Execution)  
**סטטוס:** ✅ **IMPLEMENTED - DOCUMENTED**

---

## 📢 Executive Summary

**תיקון Routing:** פתרון לבעיית routing של עמודי HTML סטטיים במערכת.

**בעיה:** עמודי HTML סטטיים (למשל `/trading_accounts`) היו מנותבים לדף הבית במקום להגיש את קובץ ה-HTML ישירות.

**פתרון:** מימוש Vite middleware שממפה clean routes לקבצי HTML ומגיש אותם לפני ש-React Router ייתפוס אותם.

---

## 🔍 הבעיה שזוהתה

1. **דרישת Clean Routes:** המשתמש ביקש שמות routes נקיים וגנריים (למשל `/trading_accounts` במקום `/views/financial/D16_ACCTS_VIEW.html`)
2. **בעיית Redirect:** עמודי HTML סטטיים היו מנותבים לדף הבית כי React Router's catch-all route (`path="*"`) תפס את כל ה-routes הלא ידועים
3. **תצורת Vite:** Vite dev server הגיש את כל הבקשות דרך React Router, מה שמנע גישה ישירה לקבצי HTML סטטיים

---

## ✅ הפתרון שיושם

### **1. Vite Middleware Configuration (`ui/vite.config.js`)**

**הוספת `configureServer` middleware שמבצע:**
- **מיפוי clean routes לקבצי HTML:**
  - `/trading_accounts` → `/views/financial/D16_ACCTS_VIEW.html`
  - `/brokers_fees` → `/views/financial/D18_BRKRS_VIEW.html`
  - `/cash_flows` → `/views/financial/D21_CASH_VIEW.html`
  - `/user_profile` → `/views/financial/user_profile.html`
- **הגשת קבצי HTML ישירות** לפני ש-React Router ייתפוס אותם
- **רישום כל הבקשות** לצורך debugging

### **2. עדכון Header Links (`ui/src/components/core/unified-header.html`)**

**שינויים:**
- הסרת `data-html-page` attributes (לא נדרש עוד)
- עדכון קישורים לשימוש ב-clean routes:
  - `/trading_accounts` (היה: `/trading_accounts` עם `data-html-page="/views/financial/D16_ACCTS_VIEW.html"`)
  - `/user_profile` (היה: `/user_profile` עם `data-html-page="/views/financial/user_profile.html"`)

### **3. עדכון Navigation Handler (`ui/src/views/financial/navigation-handler.js`)**

**שינויים:**
- הוספת רשימת clean HTML page routes
- עדכון לוגיקת זיהוי לזיהוי clean routes כעמודי HTML
- שמירה על תאימות לאחור עם `data-html-page` attribute (תמיכה legacy)

---

## 📁 קבצים שעודכנו

1. ✅ `ui/vite.config.js` - הוספת middleware ל-static HTML routing
2. ✅ `ui/src/components/core/unified-header.html` - עדכון קישורים ל-clean routes
3. ✅ `ui/src/views/financial/navigation-handler.js` - עדכון זיהוי routes

---

## 📝 Route Mapping Reference

| Clean Route | HTML File |
|------------|-----------|
| `/trading_accounts` | `/views/financial/D16_ACCTS_VIEW.html` |
| `/brokers_fees` | `/views/financial/D18_BRKRS_VIEW.html` |
| `/cash_flows` | `/views/financial/D21_CASH_VIEW.html` |
| `/user_profile` | `/views/financial/user_profile.html` |

---

## 🧪 בדיקות נדרשות

### **1. הפעלה מחדש של Vite dev server** (נדרש לשינויים ב-middleware):
```bash
cd ui
npm run dev
```

### **2. בדיקת clean routes:**
- ניווט ל-`http://localhost:8080/trading_accounts`
- צריך להגיש `D16_ACCTS_VIEW.html` ישירות
- בדיקת Vite server console ל-middleware logs

### **3. בדיקת גישה ישירה ל-HTML:**
- ניווט ל-`http://localhost:8080/views/financial/D16_ACCTS_VIEW.html`
- צריך גם לעבוד (תאימות לאחור)

### **4. בדיקת ניווט מ-Header:**
- לחיצה על "חשבונות מסחר" בתפריט הראשי
- צריך לנווט ל-`/trading_accounts` ולהגיש קובץ HTML

---

## ⚠️ הערות חשובות

1. **הפעלה מחדש של Server נדרשת:** שינויים ב-Vite middleware דורשים הפעלה מחדש של ה-server
2. **Route Mapping:** עמודי HTML חדשים חייבים להוסף ל-`routeToHtmlMap` ב-`vite.config.js`
3. **Clean Routes בלבד:** להשתמש בשמות routes נקיים וגנריים (למשל `/trading_accounts`) במקום נתיבי קבצים
4. **סדר Middleware:** Middleware רץ לפני React Router, מה שמבטיח שקבצי HTML יוגשו קודם

---

## 🔄 צעדים הבאים

1. ✅ **מימוש:** ✅ **COMPLETE** - Team 30 סיימה את המימוש
2. ⏳ **QA Testing:** בדיקות QA על ידי Team 50
3. ⏳ **Team 60 Coordination:** אם פריסת production דורשת תצורה שונה, לתאם עם Team 60 (DevOps)
4. ⏳ **תיעוד:** עדכון תיעוד routing עם clean route mappings

---

## 🔗 קישורים רלוונטיים

**דוח מקורי:**
- `TEAM_30_TO_TEAM_10_STATIC_HTML_ROUTING_FIX.md`

**קבצים שעודכנו:**
- `ui/vite.config.js`
- `ui/src/components/core/unified-header.html`
- `ui/src/views/financial/navigation-handler.js`

**עמודים רלוונטיים:**
- `ui/src/views/financial/D16_ACCTS_VIEW.html`
- `ui/src/views/financial/D18_BRKRS_VIEW.html`
- `ui/src/views/financial/D21_CASH_VIEW.html`

---

**Team 10 (The Gateway)**  
**תאריך:** 2026-02-03  
**סטטוס:** ✅ **IMPLEMENTED - DOCUMENTED**

**log_entry | [Team 10] | STATIC_HTML_ROUTING | DOCUMENTED | READY | 2026-02-03**
