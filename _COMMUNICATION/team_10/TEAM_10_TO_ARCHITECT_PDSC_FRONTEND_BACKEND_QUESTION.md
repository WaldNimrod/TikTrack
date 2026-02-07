# ⚠️ שאלה קריטית: PDSC - Frontend vs Backend

**מאת:** Team 10 (The Gateway)  
**אל:** אדריכלית גשר (Gemini)  
**תאריך:** 2026-02-06  
**סטטוס:** ⚠️ **CRITICAL QUESTION - ARCHITECT CLARIFICATION REQUIRED**  
**עדיפות:** 🔴 **P0 - BLOCKING**

---

## 🎯 Executive Summary

**שאלה קריטית שדורשת הבהרה לפני המשך Design Sprint.**

לאחר בדיקת כל ה-Specs שהוגשו, זוהה פער בין מנדט האדריכלית לבין ה-Spec שהוגש:

- **מנדט האדריכלית:** `Shared_Services.js` (PDSC + EFR) - **Frontend**
- **Spec שהוגש:** Python (Backend) - **Backend**

**נדרשת הבהרה:** האם PDSC הוא Frontend Service (JavaScript) או Backend Service (Python)?

---

## 📋 הרקע

### **מנדט האדריכלית:**

**היררכיית טעינה:**
```html
1. DNA_Variables.css
2. Phoenix_Platform_Core.js (UAI + GED)
3. Shared_Services.js (PDSC + EFR)  ← Frontend
4. Page_Specific_Config.js
```

**רשימת מערכות הליבה:**
> "Phoenix Data Service Core (PDSC): ניהול Fetching, Error Codes, ו-Hardened Transformers"

---

### **Spec שהוגש על ידי Team 20:**

**קובץ:** `_COMMUNICATION/team_20/TEAM_20_PDSC_ERROR_CONTRACT_SPECIFICATION.md`

**תוכן:**
- Python implementation
- Backend Service
- מתקשר ל-Database
- Pydantic schemas
- FastAPI integration

---

### **קוד קיים במערכת:**

**DataLoaders (Frontend):**
- `ui/src/views/financial/brokersFees/brokersFeesDataLoader.js` - JavaScript
- `ui/src/views/financial/cashFlows/cashFlowsDataLoader.js` - JavaScript
- `ui/src/views/financial/tradingAccounts/tradingAccountsDataLoader.js` - JavaScript

**Transformers (Frontend):**
- `ui/src/cubes/shared/utils/transformers.js` - JavaScript

**Routes SSOT (Frontend):**
- `routes.json` - נטען ב-Frontend

---

## ⚠️ הפער שזוהה

### **ניתוח:**

1. **מנדט האדריכלית מציין:**
   - `Shared_Services.js` (PDSC + EFR) - **Frontend (JavaScript)**
   - היררכיית טעינה: JavaScript files

2. **Spec של Team 20:**
   - Python implementation - **Backend**
   - מתקשר ל-Database
   - Backend Service

3. **קוד קיים:**
   - DataLoaders הם JavaScript (Frontend)
   - Transformers הם JavaScript (Frontend)
   - Routes SSOT נטען ב-Frontend

**מסקנה:** יש פער בין המנדט (Frontend) לבין ה-Spec (Backend).

---

## ❓ השאלה

**האם PDSC הוא:**

### **אופציה A: Frontend Service (JavaScript)**

**תיאור:**
- PDSC הוא JavaScript Service ב-Frontend
- מתקשר ישירות ל-Backend API
- משתמש ב-`transformers.js` (JavaScript)
- משתמש ב-`routes.json` (נטען ב-Frontend)
- חלק מ-`Shared_Services.js` (Frontend)

**יתרונות:**
- תואם למנדט האדריכלית
- תואם לקוד הקיים (DataLoaders הם JavaScript)
- תואם להיררכיית הטעינה (`Shared_Services.js`)

**חסרונות:**
- Team 20 (Backend) יצר Spec ב-Python
- צריך Spec חדש מ-Team 30 (Frontend)

---

### **אופציה B: Backend Service (Python)**

**תיאור:**
- PDSC הוא Python Service ב-Backend
- מתקשר ל-Database
- מספק API endpoints ל-Frontend
- חלק מ-Backend Services

**יתרונות:**
- תואם ל-Spec של Team 20
- Team 20 יכול לממש אותו

**חסרונות:**
- לא תואם למנדט האדריכלית (`Shared_Services.js`)
- לא תואם להיררכיית הטעינה
- לא תואם לקוד הקיים (DataLoaders הם JavaScript)

---

### **אופציה C: Hybrid (Frontend + Backend)**

**תיאור:**
- PDSC Frontend (JavaScript) - מתקשר ל-Backend API
- PDSC Backend (Python) - מתקשר ל-Database
- שני חלקים נפרדים

**יתרונות:**
- תואם למנדט (Frontend) וגם ל-Spec (Backend)
- חלוקת אחריות ברורה

**חסרונות:**
- מורכב יותר
- צריך שני Specs נפרדים

---

## 📋 המלצה

**לפי המנדט והקוד הקיים, נראה ש-PDSC צריך להיות Frontend (JavaScript).**

**אבל:** יש צורך בהבהרה מהאדריכלית כדי לוודא.

---

## 🔗 קישורים רלוונטיים

### **מקור המנדט:**
- `_COMMUNICATION/90_Architects_comunication/ARCHITECT_BASE_SYSTEMS_DESIGN_MANDATE.md`

### **Spec שהוגש:**
- `_COMMUNICATION/team_20/TEAM_20_PDSC_ERROR_CONTRACT_SPECIFICATION.md` (v1.1)

### **קוד קיים:**
- `ui/src/views/financial/brokersFees/brokersFeesDataLoader.js`
- `ui/src/cubes/shared/utils/transformers.js`
- `routes.json`

---

## ✅ צעדים הבאים

### **לאחר הבהרת האדריכלית:**

#### **אם PDSC הוא Frontend (JavaScript):**
- [ ] Team 30 צריך ליצור Spec חדש ל-PDSC (JavaScript)
- [ ] Team 20 יכול לשמור את ה-Spec הקיים כחלק מ-Backend Services (אם רלוונטי)

#### **אם PDSC הוא Backend (Python):**
- [ ] עדכון מנדט האדריכלית
- [ ] עדכון היררכיית הטעינה
- [ ] תיאום עם Frontend

#### **אם PDSC הוא Hybrid:**
- [ ] יצירת שני Specs נפרדים
- [ ] תיאום בין Frontend ו-Backend

---

**Team 10 (The Gateway)**  
**תאריך:** 2026-02-06  
**סטטוס:** ⚠️ **CRITICAL QUESTION - ARCHITECT CLARIFICATION REQUIRED**

**log_entry | [Team 10] | ARCHITECT | PDSC_FRONTEND_BACKEND_QUESTION | RED | 2026-02-06**
