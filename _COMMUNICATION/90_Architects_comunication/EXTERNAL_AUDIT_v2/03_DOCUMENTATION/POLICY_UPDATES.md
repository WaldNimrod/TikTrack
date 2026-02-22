# 🛡️ עדכוני מדיניות - P0/P1/P2
**project_domain:** TIKTRACK

**תאריך:** 2026-02-04  
**סטטוס:** ✅ **COMPLETE**

---

## 📢 Executive Summary

סיכום כל עדכוני המדיניות שבוצעו בשלבים P0/P1/P2.

---

## ✅ Scripts Policy Update

### **מדיניות קודמת:**
- איסור מוחלט על `<script>` בתוך HTML/JSX

### **מדיניות חדשה (היברידית):**
- **מותר:** `<script src="...">` לטעינת תשתיות (Bridge, Loaders, Auth Guard)
- **אסור:** Inline JavaScript בתוך HTML/JSX

### **מסמכים:**
- `PHOENIX_MASTER_BIBLE.md` - סעיף 6.4 עודכן
- `ARCHITECT_POLICY_HYBRID_SCRIPTS.md` - נוצר חדש

---

## ✅ Port Unification Policy

### **מדיניות:**
- **Frontend (Vite):** Port 8080 (Single Source of Truth)
- **Backend (FastAPI):** Port 8082 (Single Source of Truth)
- **CORS:** רק `http://localhost:8080` מותר

### **מסמכים:**
- `TT2_MASTER_BLUEPRINT.md` - עודכן
- `ui/infrastructure/README.md` - עודכן
- `ARCHITECT_PORT_LOCK_FINAL.md` - קיים

---

## ✅ Routes SSOT Policy

### **מדיניות:**
- `routes.json` הוא מקור אמת יחיד לנתיבי המערכת
- נגיש ב-Runtime (דרך `/routes.json`)
- נגיש ב-Build Time (דרך `vite.config.js`)

### **מסמכים:**
- `TT2_UI_INTEGRATION_PATTERN.md` - עודכן
- `TT2_OFFICIAL_PAGE_TRACKER.md` - עודכן

---

## ✅ Security Policy

### **מדיניות:**
- חובת שימוש ב-`maskedLog` ב-Auth Guard
- מניעת דליפת טוקנים ל-Console
- כל logs עם נתונים רגישים חייבים להשתמש ב-maskedLog

### **מסמכים:**
- `auth-guard.js` - עודכן
- `maskedLog.js` - נוצר

---

## ✅ Data Transformation Policy

### **מדיניות:**
- המרת מספרים כפויה לשדות כספיים
- ערכי ברירת מחדל: `null`/`undefined` → `0`
- המרה בטוחה: NaN → 0

### **מסמכים:**
- `transformers.js` - Hardened v1.2
- `TT2_UI_INTEGRATION_PATTERN.md` - עודכן

---

## ✅ Naming Convention Policy

### **מדיניות:**
- **שדות ב-API ובישויות:** רבים תמיד (`user_ids`, `trading_account_ids`)
- **שמות קבצים:** camelCase (`phoenixFilterBridge.js`, `authGuard.js`)

### **מסמכים:**
- `ARCHITECT_MANDATE_SINGULAR_NAMING.md` - דורש עדכון (לרבים)
- `TEAM_10_TO_ARCHITECT_NAMING_CLARIFICATION.md` - הודעה לאדריכל

---

## 📊 סיכום

### **מדיניות שעודכנו:**
- ✅ Scripts Policy (היברידית)
- ✅ Port Unification Policy
- ✅ Routes SSOT Policy
- ✅ Security Policy
- ✅ Data Transformation Policy
- ✅ Naming Convention Policy (הבהרה)

---

**Team 10 (The Gateway)**  
**תאריך:** 2026-02-04  
**סטטוס:** ✅ **COMPLETE**
