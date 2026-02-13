# 📋 הודעה: Phase 2 Execution - Frontend Implementation (D18/D21)

**מאת:** Team 10 (The Gateway)  
**אל:** Team 30 (Frontend Implementation)  
**תאריך:** 2026-02-06  
**סטטוס:** 🟢 **PHASE 2 EXECUTION MANDATE - ACTIVE DEVELOPMENT**  
**עדיפות:** 🔴 **CRITICAL**

---

## 🎯 Executive Summary

**אתם מורשים להתחיל בבניית רכיבי הטבלה הפיננסיים!**

בעקבות אישור האדריכל (Architect Execution Mandate), אתם מורשים להתחיל בפיתוח Frontend עבור:
- **D18 - Brokers Fees (עמלות ברוקרים)**
- **D21 - Cash Flows (תזרים מזומנים)**

**מקור המנדט:** `_COMMUNICATION/90_Architects_comunication/ARCHITECT_PHASE_2_EXECUTION_MANDATE.md`

---

## ⚠️ חובת משילות - קריאה חובה לפני התחלה

**🚨 חובה על כל צוות לעצור ולבצע רענון למידה לנהלים הבאים:**

### **1. "התנ"ך שלנו" - חובת קריאה חוזרת**
- 📖 **קובץ:** `documentation/09-GOVERNANCE/standards/PHOENIX_MASTER_BIBLE.md`
- 📖 **קובץ:** `documentation/00-MANAGEMENT/00_MASTER_INDEX.md`
- 📖 **קובץ:** `documentation/00-MANAGEMENT/PHOENIX_ORGANIZATIONAL_STRUCTURE.md` (SSOT)

**חובה:** חתימה על READINESS_DECLARATION לאחר קריאה חוזרת של התנ"ך והגדרות התפקיד.

### **2. נהלי עבודה - לימוד חוזר**
- 📖 **קובץ:** `documentation/01-ARCHITECTURE/TT2_PHASE_2_IMPLEMENTATION_PLAN.md` (תוכנית מימוש מלא)
- 📖 **קובץ:** `documentation/01-ARCHITECTURE/TT2_UI_INTEGRATION_PATTERN.md` (Hybrid Bridge)
- 📖 **קובץ:** `documentation/10-POLICIES/TT2_JS_STANDARDS_PROTOCOL.md` (איסור Inline Scripts)

---

## 🛡️ חובת משילות קריטית

### **1. Transformers - הגרסה המוקשחת בלבד**

**⚠️ קריטי:** שימוש אך ורק ב-`transformers.js` (הגרסה המוקשחת).

**קובץ:** `ui/src/cubes/shared/utils/transformers.js` v1.2

**דרישות:**
- ✅ **חובה:** שימוש ב-`transformers.js` בלבד
- ❌ **אסור:** יצירת Transformers מקומיים (`apiToReact` מקומי)
- ❌ **אסור:** שימוש ב-`FIX_transformers.js` (דפרקטי)

**תכונות:**
- המרת מספרים כפויה
- המרת snake_case ↔ camelCase
- אכיפה: אין שימוש ב-Transformers מקומיים

### **2. Hybrid Bridge - המאומת בלבד**

**⚠️ קריטי:** כל הזרקת נתונים חייבת לעבור דרך ה-Hybrid Bridge המאומת.

**דרישות:**
- ✅ **חובה:** שימוש ב-HTML ↔ React Bridge
- ✅ **חובה:** כל רכיבי Frontend חייבים לעבור דרך ה-Bridge
- ❌ **אסור:** הזרקת נתונים ישירה ללא Bridge

### **3. Hybrid Scripts Policy**

**⚠️ קריטי:** אין inline JavaScript!

**דרישות:**
- ❌ **אסור:** Inline JavaScript (`<script>` ללא `src`, `onclick` attributes)
- ✅ **חובה:** כל ה-JS בקובץ חיצוני
- ✅ **חובה:** Event listeners פרוגרמטיים

---

## 📋 משימות Phase 2.1: Brokers Fees (D18)

### **1. יצירת `brokers_fees.html`**

**מיקום:** `ui/src/views/financial/brokers_fees.html`

**דרישות:**
- [ ] מבנה LEGO בסיסי (`tt-container > tt-section`)
- [ ] Unified Header מלא (120px, LOD 400)
- [ ] טבלת ברוקרים עם כל העמודות
- [ ] פילטרים: ברוקר, סוג עמלה, חיפוש
- [ ] פאגינציה בתחתית הטבלה
- [ ] תפריט פעולות (עריכה, מחיקה, הצגה) - **ללא כפתור "ביטול"**

**קישור לבלופרינט:** `_COMMUNICATION/team_31/team_31_staging/sandbox_v2/D18_BRKRS_VIEW.html`

### **2. מבנה טבלה - עמודות**

| עמודה | Class | סוג | מיון | יישור | הערות |
|:---|:---|:---|:---|:---|:---|
| ברוקר | `col-broker` | string | ✅ | right | שם הברוקר |
| סוג עמלה | `col-commission-type` | string | ✅ | center | Badge צבעוני (Tiered/Flat) |
| ערך עמלה | `col-commission-value` | string | ✅ | center | ערך העמלה |
| מינימום לפעולה | `col-minimum` | numeric | ✅ | center | מטבע (USD) |
| פעולות | `col-actions` | actions | ❌ | center | תפריט פעולות |

**Badge צבעוני:**
- `badge-tiered` - צבע כחול/טורקיז
- `badge-flat` - צבע כתום/אדום

### **3. אינטגרציה עם Backend API**

**דרישות:**
- [ ] קריאה ל-`GET /api/v1/brokers_fees`
- [ ] שימוש ב-`transformers.js` להמרת נתונים (snake_case ↔ camelCase)
- [ ] שימוש ב-`routes.json` v1.1.2 בלבד (אין routes hardcoded)
- [ ] טיפול בשגיאות

**דוגמה:**
```javascript
// שימוש ב-transformers.js
import { apiToReact } from '../../cubes/shared/utils/transformers.js';

async function loadBrokersFees() {
  try {
    const response = await fetch('/api/v1/brokers_fees', {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    const data = await response.json();
    
    // שימוש ב-transformers.js להמרה
    const transformedData = data.data.map(item => apiToReact(item));
    
    // עדכון הטבלה
    updateTable(transformedData);
  } catch (error) {
    console.error('Error loading brokers fees:', error);
  }
}
```

### **4. JavaScript חיצוני בלבד**

**דרישות:**
- [ ] כל ה-JavaScript בקובץ חיצוני
- [ ] אין inline JavaScript (`<script>` ללא `src`)
- [ ] אין `onclick` attributes
- [ ] Event listeners פרוגרמטיים

**קבצים נדרשים:**
- `ui/src/cubes/shared/PhoenixTableSortManager.js`
- `ui/src/cubes/shared/PhoenixTableFilterManager.js`
- `ui/src/cubes/shared/tableFormatters.js`
- `ui/src/cubes/shared/utils/transformers.js`

---

## 📋 משימות Phase 2.2: Cash Flows (D21)

### **1. יצירת `cash_flows.html`**

**מיקום:** `ui/src/views/financial/cash_flows.html`

**דרישות:**
- [ ] מבנה LEGO בסיסי (`tt-container > tt-section`)
- [ ] Unified Header מלא (120px, LOD 400)
- [ ] **טבלה 1:** תזרימי מזומנים עם כל העמודות
- [ ] **טבלה 2:** המרות מטבע עם כל העמודות
- [ ] פילטרים: חשבון מסחר, סוג תנועה, טווח תאריכים, חיפוש
- [ ] פאגינציה בתחתית כל טבלה
- [ ] תפריט פעולות (עריכה, מחיקה, הצגה) - **ללא כפתור "ביטול"**

**קישור לבלופרינט:** `_COMMUNICATION/team_31/team_31_staging/sandbox_v2/D21_CASH_VIEW.html`

### **2. מבנה טבלה 1 - תזרימי מזומנים**

| עמודה | Class | סוג | מיון | יישור | הערות |
|:---|:---|:---|:---|:---|:---|
| טרייד | `col-trade` | string | ✅ | center | מספר טרייד |
| חשבון מסחר | `col-account` | string | ✅ | right | שם החשבון |
| סוג | `col-type` | string | ✅ | center | Badge צבעוני |
| סכום | `col-amount` | numeric | ✅ | center | מטבע, צבע +/- |
| תאריך | `col-date` | date | ✅ | center | תאריך פעולה |
| תיאור | `col-description` | string | ✅ | right | תיאור התנועה |
| מקור | `col-source` | string | ✅ | right | מקור התנועה |
| עודכן | `col-updated` | date | ✅ | center | תאריך עדכון |
| פעולות | `col-actions` | actions | ❌ | center | תפריט פעולות |

**Badge צבעוני לסוג תנועה:**
- `badge-deposit` - צבע ירוק (הפקדה)
- `badge-withdrawal` - צבע אדום (משיכה)
- `badge-dividend` - צבע כחול (דיבידנד)
- `badge-interest` - צבע סגול (ריבית)
- `badge-fee` - צבע כתום (עמלה)
- `badge-other` - צבע אפור (אחר)

### **3. מבנה טבלה 2 - המרות מטבע**

| עמודה | Class | סוג | מיון | יישור | הערות |
|:---|:---|:---|:---|:---|:---|
| תאריך | `col-date` | date | ✅ | center | תאריך המרה |
| חשבון מסחר | `col-account` | string | ✅ | right | שם החשבון |
| מה־ | `col-from` | string | ✅ | center | מטבע מקור |
| ל־ | `col-to` | string | ✅ | center | מטבע יעד |
| שער משוער | `col-rate` | numeric | ✅ | center | שער המרה |
| זיהוי | `col-id` | string | ✅ | center | מזהה ייחודי |
| פעולות | `col-actions` | actions | ❌ | center | תפריט פעולות |

### **4. אינטגרציה עם Backend API**

**דרישות:**
- [ ] קריאה ל-`GET /api/v1/cash_flows`
- [ ] שימוש ב-`transformers.js` להמרת נתונים (snake_case ↔ camelCase)
- [ ] שימוש ב-`routes.json` v1.1.2 בלבד (אין routes hardcoded)
- [ ] טיפול בשגיאות

**דוגמה:**
```javascript
// שימוש ב-transformers.js
import { apiToReact } from '../../cubes/shared/utils/transformers.js';

async function loadCashFlows() {
  try {
    const response = await fetch('/api/v1/cash_flows', {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    const data = await response.json();
    
    // שימוש ב-transformers.js להמרה
    const transformedData = data.data.map(item => apiToReact(item));
    
    // עדכון הטבלה
    updateTable(transformedData);
  } catch (error) {
    console.error('Error loading cash flows:', error);
  }
}
```

### **5. JavaScript חיצוני בלבד**

**דרישות:**
- [ ] כל ה-JavaScript בקובץ חיצוני
- [ ] אין inline JavaScript (`<script>` ללא `src`)
- [ ] אין `onclick` attributes
- [ ] Event listeners פרוגרמטיים

---

## ⚠️ כללי אכיפה קריטיים

### **1. Transformers**
- ❌ **אסור:** יצירת Transformers מקומיים (`apiToReact` מקומי)
- ❌ **אסור:** שימוש ב-`FIX_transformers.js` (דפרקטי)
- ✅ **חובה:** שימוש ב-`transformers.js` בלבד (נתיב: `ui/src/cubes/shared/utils/transformers.js`)

### **2. Routes**
- ❌ **אסור:** יצירת routes מקומיים או hardcoded
- ✅ **חובה:** שימוש ב-`routes.json` v1.1.2 בלבד

### **3. Hybrid Scripts Policy**
- ❌ **אסור:** Inline JavaScript (`<script>` ללא `src`, `onclick` attributes)
- ✅ **חובה:** כל ה-JS בקובץ חיצוני, Event listeners פרוגרמטיים

### **4. Security**
- ❌ **אסור:** `console.log` עם טוקנים או מידע רגיש
- ✅ **חובה:** שימוש ב-Masked Log בלבד

### **5. Ports**
- ❌ **אסור:** שימוש בפורטים אחרים מלבד 8080 (Frontend)
- ✅ **חובה:** Port Unification

---

## 📊 לוח זמנים

| משימה | תאריך יעד | עדיפות |
|:---|:---|:---|
| חתימה על READINESS_DECLARATION | 2026-02-07 | 🔴 CRITICAL |
| D18: יצירת HTML | 2026-02-10 | 🔴 CRITICAL |
| D18: אינטגרציה עם Backend | 2026-02-12 | 🔴 CRITICAL |
| D18: ולידציה (Team 40/50) | 2026-02-14 | 🔴 CRITICAL |
| D21: יצירת HTML | 2026-02-15 | 🔴 CRITICAL |
| D21: אינטגרציה עם Backend | 2026-02-17 | 🔴 CRITICAL |
| D21: ולידציה (Team 40/50) | 2026-02-19 | 🔴 CRITICAL |

---

## 📞 קישורים רלוונטיים

### **מנדטים ותוכניות:**
- **מקור המנדט:** `_COMMUNICATION/90_Architects_comunication/ARCHITECT_PHASE_2_EXECUTION_MANDATE.md`
- **תוכנית מימוש:** `documentation/01-ARCHITECTURE/TT2_PHASE_2_IMPLEMENTATION_PLAN.md`
- **מנדט כללי:** `documentation/01-ARCHITECTURE/TT2_PHASE_2_ALL_TEAMS_MANDATE.md`

### **בלופרינטים:**
- **D18 Blueprint:** `_COMMUNICATION/team_31/team_31_staging/sandbox_v2/D18_BRKRS_VIEW.html`
- **D21 Blueprint:** `_COMMUNICATION/team_31/team_31_staging/sandbox_v2/D21_CASH_VIEW.html`
- **מדריך יישום:** `_COMMUNICATION/team_31/team_31_staging/sandbox_v2/TEAM_31_D18_D21_IMPLEMENTATION_GUIDE.md`
- **מסירת בלופרינטים:** `_COMMUNICATION/team_31/team_31_staging/sandbox_v2/TEAM_31_TO_TEAM_10_D18_D21_DELIVERY.md`

### **תיעוד:**
- **Transformers:** `ui/src/cubes/shared/utils/transformers.js` v1.2
- **Routes SSOT:** `routes.json` v1.1.2
- **Hybrid Bridge:** `documentation/01-ARCHITECTURE/TT2_UI_INTEGRATION_PATTERN.md`
- **JS Standards:** `documentation/10-POLICIES/TT2_JS_STANDARDS_PROTOCOL.md`

---

## ✅ Checklist סופי

### **Phase 2.1: Brokers Fees (D18)**
- [ ] חתימה על READINESS_DECLARATION
- [ ] יצירת `brokers_fees.html`
- [ ] מבנה LEGO בסיסי
- [ ] Unified Header מלא
- [ ] טבלת ברוקרים עם כל העמודות
- [ ] פילטרים: ברוקר, סוג עמלה, חיפוש
- [ ] פאגינציה בתחתית הטבלה
- [ ] תפריט פעולות (ללא כפתור "ביטול")
- [ ] אינטגרציה עם Backend API
- [ ] שימוש ב-`transformers.js` בלבד
- [ ] שימוש ב-`routes.json` בלבד
- [ ] JavaScript חיצוני בלבד (אין inline JS)
- [ ] ולידציה של אבטחה (Masked Log)

### **Phase 2.2: Cash Flows (D21)**
- [ ] יצירת `cash_flows.html`
- [ ] מבנה LEGO בסיסי
- [ ] Unified Header מלא
- [ ] טבלה 1: תזרימי מזומנים עם כל העמודות
- [ ] טבלה 2: המרות מטבע עם כל העמודות
- [ ] פילטרים: חשבון מסחר, סוג תנועה, טווח תאריכים, חיפוש
- [ ] פאגינציה בתחתית כל טבלה
- [ ] תפריט פעולות (ללא כפתור "ביטול")
- [ ] אינטגרציה עם Backend API
- [ ] שימוש ב-`transformers.js` בלבד
- [ ] שימוש ב-`routes.json` בלבד
- [ ] JavaScript חיצוני בלבד (אין inline JS)
- [ ] ולידציה של אבטחה (Masked Log)

---

**Team 10 (The Gateway)**  
**תאריך:** 2026-02-06  
**סטטוס:** 🟢 **PHASE 2 EXECUTION MANDATE - ACTIVE DEVELOPMENT**

**log_entry | [Team 10] | TEAM_30 | PHASE_2_EXECUTION_D18_D21 | GREEN | 2026-02-06**
