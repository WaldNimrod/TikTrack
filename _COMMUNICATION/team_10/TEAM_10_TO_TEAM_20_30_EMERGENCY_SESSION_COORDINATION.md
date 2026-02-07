# 📅 תיאום סשן חירום: PDSC Boundary Contract - Team 20 + Team 30

**id:** `TEAM_10_TO_TEAM_20_30_EMERGENCY_SESSION_COORDINATION`  
**מאת:** Team 10 (The Gateway)  
**אל:** Team 20 (Backend) + Team 30 (Frontend)  
**תאריך:** 2026-02-07  
**Session:** PDSC (Phoenix Data Service Core) - Boundary Contract  
**Subject:** EMERGENCY_SESSION_COORDINATION | Status: 🚨 **COORDINATION REQUIRED**  
**Priority:** 🔴 **P0 - CRITICAL**

---

## ✅ Executive Summary

**תיאום סשן חירום בין Team 20 ל-Team 30 להגדרת PDSC Boundary Contract.**

**מטרה:** יצירת **Shared Boundary Contract** מוסכם תוך 8 שעות.

**דרישה:** תיאום תאריך, זמן, משתתפים, ונושאים לדיון.

---

## 📅 פרטי הסשן

### **תאריך ושעה:**

**תאריך מוצע:** 2026-02-07  
**שעה מוצעת:** 10:00 - 18:00 (8 שעות)  
**אזור זמן:** UTC+2 (ישראל)

**אישור נדרש מ:**
- [ ] Team 20 Lead
- [ ] Team 30 Lead
- [ ] Team 10 Coordinator

---

### **פורמט:**

**אופציה 1:** פגישה פיזית (מומלץ)  
**אופציה 2:** פגישה וירטואלית (Zoom/Teams)  
**אופציה 3:** היברידי (חלק פיזי, חלק וירטואלי)

**החלטה:** [ ] פיזי [ ] וירטואלי [ ] היברידי

---

### **מיקום:**

**אם פיזי:**
- [ ] משרד Team 20
- [ ] משרד Team 30
- [ ] חדר ישיבות משותף
- [ ] אחר: _______________

**אם וירטואלי:**
- [ ] Zoom Link: _______________
- [ ] Teams Link: _______________
- [ ] אחר: _______________

---

## 👥 משתתפים

### **Team 20 (Backend):**

**חובה:**
- [ ] Team 20 Lead
- [ ] Backend Developer (PDSC Expert)
- [ ] API Architect (אם רלוונטי)

**מומלץ:**
- [ ] Backend Developer נוסף

---

### **Team 30 (Frontend):**

**חובה:**
- [ ] Team 30 Lead
- [ ] Frontend Developer (PDSC Expert)
- [ ] Frontend Architect (אם רלוונטי)

**מומלץ:**
- [ ] Frontend Developer נוסף

---

### **Team 10 (Gateway):**

**חובה:**
- [ ] Team 10 Coordinator (Facilitator)
- [ ] Technical Reviewer (אם נדרש)

---

## 📋 נושאים לדיון

### **1. JSON Error Schema** 🔴 (שעות 1-3)

**מטרה:** אימות Error Schema עם Frontend.

**נושאים:**
- [ ] Error Response Structure - האם מתאים ל-Frontend?
- [ ] `message_i18n` - האם נדרש כבר עכשיו?
- [ ] `details.suggestions` - האם נדרש?
- [ ] Error Codes - האם כל ה-Codes מובנים?
- [ ] Error Codes חסרים - האם יש Codes נוספים נדרשים?
- [ ] Error Codes מיותרים - האם יש Codes שלא נדרשים?

**מסמכים לבדיקה:**
- `_COMMUNICATION/team_20/TEAM_20_PDSC_ERROR_SCHEMA.md`
- `api/utils/exceptions.py` - ErrorCodes class

---

### **2. Response Contract** 🔴 (שעות 3-5)

**מטרה:** אימות Response Contract עם Frontend.

**נושאים:**
- [ ] Success Response Structure - האם מתאים?
- [ ] `meta` field - מה נדרש?
- [ ] Pagination metadata - האם נדרש?
- [ ] Unified Response (`oneOf`) - האם מתאים?
- [ ] `discriminator` - האם נדרש?
- [ ] Response Type Detection - איך Frontend מבדיל בין Success ל-Error?

**מסמכים לבדיקה:**
- `_COMMUNICATION/team_20/TEAM_20_PDSC_RESPONSE_CONTRACT.md`

---

### **3. Transformers Integration** 🔴 (שעות 5-6)

**מטרה:** תיאום על Transformers Integration.

**נושאים:**
- [ ] Data Transformation - האם Backend מחזיר snake_case?
- [ ] Request Transformation - האם Frontend צריך להמיר ל-snake_case?
- [ ] Response Transformation - האם Frontend צריך להמיר ל-camelCase?
- [ ] Financial Fields - האם Backend מחזיר מספרים כ-strings?
- [ ] Number Conversion - איפה מתבצעת ההמרה למספרים?
- [ ] `transformers.js` v1.2 - האם מתאים?

**מסמכים לבדיקה:**
- `ui/src/cubes/shared/utils/transformers.js` v1.2
- `_COMMUNICATION/team_20/TEAM_20_PDSC_ERROR_CONTRACT_SPECIFICATION.md` (Transformers section)

---

### **4. Fetching Integration** 🔴 (שעות 6-7)

**מטרה:** תיאום על Fetching Integration.

**נושאים:**
- [ ] API Calls Pattern - איך Frontend מבצע API calls?
- [ ] Request Interceptor - האם נדרש?
- [ ] Response Interceptor - האם נדרש?
- [ ] Authorization - איך Frontend שולח JWT token?
- [ ] Token Refresh - האם נדרש?
- [ ] Token Expired - איך מטפלים?

**מסמכים לבדיקה:**
- `ui/public/routes.json` v1.1.2
- `_COMMUNICATION/team_20/TEAM_20_PDSC_ERROR_CONTRACT_SPECIFICATION.md` (Fetching section)

---

### **5. Routes SSOT Integration** 🔴 (שעות 7-8)

**מטרה:** תיאום על Routes SSOT Integration.

**נושאים:**
- [ ] URL Building - איך Frontend בונה URLs?
- [ ] `routes.json` Loader - האם נדרש?
- [ ] Version Mismatch - איך מטפלים?
- [ ] Fallback Mechanisms - האם נדרש?

**מסמכים לבדיקה:**
- `ui/public/routes.json` v1.1.2

---

## ⏰ Timeline מפורט

| זמן | פעילות | משתתפים | תוצאה |
|:---|:---|:---|:---|
| **10:00-10:30** | פתיחה + סקירה | כולם | הבנת המצב הנוכחי |
| **10:30-12:30** | דיון על Error Schema | Team 20 + Team 30 | החלטות על Error Schema |
| **12:30-13:00** | הפסקה | - | - |
| **13:00-15:00** | דיון על Response Contract | Team 20 + Team 30 | החלטות על Response Contract |
| **15:00-16:00** | דיון על Transformers | Team 20 + Team 30 | החלטות על Transformers |
| **16:00-17:00** | דיון על Fetching | Team 20 + Team 30 | החלטות על Fetching |
| **17:00-17:30** | דיון על Routes SSOT | Team 20 + Team 30 | החלטות על Routes SSOT |
| **17:30-18:00** | סיכום + החלטות | כולם | רשימת החלטות |

---

## 📝 הכנה נדרשת

### **Team 20 (לפני הסשן):**

- [ ] קריאת `TEAM_20_PDSC_ERROR_SCHEMA.md`
- [ ] קריאת `TEAM_20_PDSC_RESPONSE_CONTRACT.md`
- [ ] הכנת דוגמאות Error Responses
- [ ] הכנת דוגמאות Success Responses
- [ ] הכנת רשימת שאלות ל-Team 30

---

### **Team 30 (לפני הסשן):**

- [ ] קריאת `TEAM_20_PDSC_ERROR_SCHEMA.md`
- [ ] קריאת `TEAM_20_PDSC_RESPONSE_CONTRACT.md`
- [ ] קריאת `TEAM_20_PDSC_ERROR_CONTRACT_SPECIFICATION.md` (v1.1)
- [ ] בדיקת `transformers.js` v1.2
- [ ] בדיקת `routes.json` v1.1.2
- [ ] הכנת רשימת שאלות ל-Team 20

---

## ✅ Checklist תיאום

### **לפני הסשן:**
- [ ] אישור תאריך ושעה מ-Team 20
- [ ] אישור תאריך ושעה מ-Team 30
- [ ] אישור מיקום/פורמט
- [ ] אישור משתתפים
- [ ] שליחת מסמכי הכנה
- [ ] הכנת חדר ישיבות/קישור

### **במהלך הסשן:**
- [ ] פתיחה + סקירה
- [ ] דיון על כל נושא
- [ ] תיעוד החלטות
- [ ] סיכום

### **אחרי הסשן:**
- [ ] כתיבת Shared Boundary Contract
- [ ] דוגמאות קוד משותפות
- [ ] תיעוד משותף
- [ ] הגשה ל-Team 10

---

## 🔗 קישורים רלוונטיים

### **מקור המנדט:**
- `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_20_PDSC_BOUNDARY_CONTRACT_CRITICAL.md`
- `_COMMUNICATION/team_10/TEAM_10_EMERGENCY_SESSION_20_30_PDSC_BOUNDARY.md`

### **מסמכי הכנה:**
- `_COMMUNICATION/team_20/TEAM_20_PDSC_ERROR_SCHEMA.md`
- `_COMMUNICATION/team_20/TEAM_20_PDSC_RESPONSE_CONTRACT.md`
- `_COMMUNICATION/team_20/TEAM_20_PDSC_ERROR_CONTRACT_SPECIFICATION.md` (v1.1)
- `_COMMUNICATION/team_20/TEAM_20_30_PDSC_SHARED_BOUNDARY_CONTRACT.md` (Draft)

### **קבצים:**
- `api/utils/exceptions.py` - ErrorCodes
- `ui/src/cubes/shared/utils/transformers.js` - Transformers
- `ui/public/routes.json` - Routes SSOT

---

## ⚠️ אזהרות קריטיות

### **1. חובה תיאום:**
- ✅ אין סשן ללא תיאום מראש
- ✅ כל המשתתפים חייבים להיות נוכחים
- ✅ כל המסמכים חייבים להיקרא לפני הסשן

### **2. תוצאה נדרשת:**
- ✅ Shared Boundary Contract מוסכם
- ✅ כל החלטות מתועדות
- ✅ דוגמאות קוד משותפות

---

**Team 10 (The Gateway)**  
**תאריך:** 2026-02-07  
**סטטוס:** 🚨 **COORDINATION REQUIRED**

**log_entry | [Team 10] | TEAM_20_30 | EMERGENCY_SESSION_COORDINATION | RED | 2026-02-07**
