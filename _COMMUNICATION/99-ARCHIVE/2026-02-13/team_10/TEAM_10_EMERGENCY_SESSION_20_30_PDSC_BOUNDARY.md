# 🚨 סשן חירום: PDSC Boundary Contract - Team 20 + Team 30

**id:** `TEAM_10_EMERGENCY_SESSION_20_30_PDSC_BOUNDARY`  
**מאת:** Team 10 (The Gateway)  
**אל:** Team 20 (Backend) + Team 30 (Frontend)  
**תאריך:** 2026-02-06  
**Session:** PDSC (Phoenix Data Service Core) - Boundary Contract  
**Subject:** EMERGENCY_SESSION_PDSC_BOUNDARY | Status: 🚨 **EMERGENCY**  
**Priority:** 🔴 **P0 - CRITICAL**

---

## ✅ Executive Summary

**סשן חירום לתיאום PDSC Boundary Contract בין Team 20 ל-Team 30.**

**מטרה:** יצירת **Shared Boundary Contract** תוך 8 שעות.

**תוצאה נדרשת:** מסמך משותף המגדיר את ה-Boundary בין Backend ל-Frontend.

---

## 🎯 מטרת הסשן

### **PDSC Architecture - היברידי:**

```
┌─────────────────────────────────────────┐
│         Backend (Team 20)               │
│  ✅ מקור החוק (Source of Truth)        │
│  - JSON Error Schema                    │
│  - Response Contract                   │
└──────────────┬──────────────────────────┘
               │
               │ HTTP API (JSON)
               │
               ▼
┌─────────────────────────────────────────┐
│         Frontend (Team 30)              │
│  ✅ מקור המימוש (Implementation)       │
│  - Fetching                            │
│  - Transformers                        │
│  - Error Handling                      │
└─────────────────────────────────────────┘
```

### **הבעיה:**

- Team 20 הגדיר Error Schema ו-Response Contract
- Team 30 צריך לאשר את ה-Schema לפני מימוש
- יש צורך בתיאום משותף

---

## 📋 נושאים לדיון

### **1. JSON Error Schema** 🔴

**שאלות לדיון:**

1. **Error Response Structure:**
   - האם ה-Structure הנוכחי מתאים ל-Frontend?
   - האם `message_i18n` נדרש כבר עכשיו?
   - האם `details.suggestions` נדרש?

2. **Error Codes:**
   - האם כל ה-Error Codes מובנים ל-Frontend?
   - האם יש Error Codes חסרים?
   - האם יש Error Codes מיותרים?

3. **Error Handling:**
   - איך Frontend מטפל בשגיאות?
   - האם יש צורך ב-Error Recovery?
   - האם יש צורך ב-Retry Logic?

---

### **2. Response Contract** 🔴

**שאלות לדיון:**

1. **Success Response:**
   - האם ה-Structure הנוכחי מתאים?
   - מה נדרש ב-`meta`?
   - האם יש צורך ב-Pagination metadata?

2. **Unified Response:**
   - האם `oneOf` (Success/Error) מתאים?
   - האם יש צורך ב-`discriminator`?
   - איך Frontend מבדיל בין Success ל-Error?

---

### **3. Transformers Integration** 🔴

**שאלות לדיון:**

1. **Data Transformation:**
   - האם Backend מחזיר snake_case?
   - האם Frontend צריך להמיר ל-camelCase?
   - איפה מתבצעת ההמרה?

2. **Financial Fields:**
   - האם Backend מחזיר מספרים כ-strings?
   - האם Frontend צריך להמיר למספרים?
   - איפה מתבצעת ההמרה?

---

### **4. Fetching Integration** 🔴

**שאלות לדיון:**

1. **API Calls:**
   - איך Frontend מבצע API calls?
   - האם יש צורך ב-Request Interceptor?
   - האם יש צורך ב-Response Interceptor?

2. **Authorization:**
   - איך Frontend שולח JWT token?
   - האם יש צורך ב-Token Refresh?
   - איך מטפלים ב-Token Expired?

---

### **5. Routes SSOT Integration** 🔴

**שאלות לדיון:**

1. **URL Building:**
   - איך Frontend בונה URLs?
   - האם יש צורך ב-`routes.json` loader?
   - איך מטפלים ב-Version Mismatch?

---

## ⏰ Timeline

| זמן | פעילות | אחראי |
|:---|:---|:---|
| **0-1 שעות** | הכנה - קריאת Specs | Team 20 + Team 30 |
| **1-3 שעות** | דיון על Error Schema | Team 20 + Team 30 |
| **3-5 שעות** | דיון על Response Contract | Team 20 + Team 30 |
| **5-7 שעות** | דיון על Transformers + Fetching | Team 20 + Team 30 |
| **7-8 שעות** | כתיבת Shared Boundary Contract | Team 20 + Team 30 |

**דדליין:** 8 שעות מתחילת הסשן

---

## 📄 תוצאה נדרשת

### **Shared Boundary Contract Document:**

**קובץ:** `_COMMUNICATION/team_20_30/TEAM_20_30_PDSC_BOUNDARY_CONTRACT.md`

**תוכן נדרש:**

1. **JSON Error Schema** (מוסכם)
   - Error Response Structure
   - Error Codes List
   - Error Handling Guidelines

2. **Response Contract** (מוסכם)
   - Success Response Structure
   - Unified Response Structure
   - Response Handling Guidelines

3. **Transformers Integration** (מוסכם)
   - Data Transformation Rules
   - Financial Fields Conversion
   - Implementation Guidelines

4. **Fetching Integration** (מוסכם)
   - API Calls Pattern
   - Authorization Handling
   - Error Recovery

5. **Routes SSOT Integration** (מוסכם)
   - URL Building Rules
   - Version Handling
   - Fallback Mechanisms

6. **דוגמאות קוד** (מוסכם)
   - Backend Examples
   - Frontend Examples
   - Integration Examples

---

## ✅ Checklist לסשן

### **לפני הסשן:**
- [ ] Team 20: קריאת PDSC Spec (v1.1)
- [ ] Team 20: הכנת JSON Error Schema
- [ ] Team 20: הכנת Response Contract
- [ ] Team 30: קריאת PDSC Spec (v1.1)
- [ ] Team 30: הכנת שאלות על Schema
- [ ] Team 30: הכנת שאלות על Response Contract

### **במהלך הסשן:**
- [ ] דיון על Error Schema
- [ ] דיון על Response Contract
- [ ] דיון על Transformers Integration
- [ ] דיון על Fetching Integration
- [ ] דיון על Routes SSOT Integration
- [ ] החלטות משותפות

### **אחרי הסשן:**
- [ ] כתיבת Shared Boundary Contract
- [ ] דוגמאות קוד משותפות
- [ ] תיעוד משותף
- [ ] הגשה ל-Team 10

---

## 🔗 קבצים רלוונטיים

### **Specs קיימים:**
- `_COMMUNICATION/team_20/TEAM_20_PDSC_ERROR_CONTRACT_SPECIFICATION.md` (v1.1)
- `_COMMUNICATION/team_30/UAI_Architectural_Design.md` (v1.0.0)

### **מנדטים:**
- `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_20_PDSC_BOUNDARY_CONTRACT_MANDATE.md`
- `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_30_EFR_GED_SPECS_MISSING.md`

---

## ⚠️ אזהרות קריטיות

### **1. אין אישור התקדמות ללא Interface Contracts:**
- ✅ כל התקדמות תלויה ב-Boundary Contract
- ✅ אין מימוש ללא הסכמה משותפת

### **2. חובה תיאום בין Team 20 ל-Team 30:**
- ✅ אין PDSC Contract ללא הסכמה משותפת
- ✅ כל החלטה חייבת להיות מוסכמת

### **3. השרת הוא מקור החוק:**
- ✅ כל Error Schema חייב להיות מוגדר מהשרת
- ✅ Frontend לא יכול לשנות את ה-Schema

### **4. הלקוח הוא מקור המימוש:**
- ✅ הלקוח מממש Fetching + Transformers
- ✅ Backend רק מגדיר את ה-Schema

---

## 📞 קישורים רלוונטיים

### **מקור המנדט:**
- `_COMMUNICATION/90_Architects_comunication/ARCHITECT_BASE_SYSTEMS_DESIGN_MANDATE.md`

### **Specs:**
- `_COMMUNICATION/team_20/TEAM_20_PDSC_ERROR_CONTRACT_SPECIFICATION.md` (v1.1)
- `_COMMUNICATION/team_30/UAI_Architectural_Design.md` (v1.0.0)

---

**Team 10 (The Gateway)**  
**תאריך:** 2026-02-06  
**סטטוס:** 🚨 **EMERGENCY SESSION - 8 HOUR DEADLINE**

**log_entry | [Team 10] | TEAM_20_30 | EMERGENCY_SESSION_PDSC_BOUNDARY | RED | 2026-02-06**
