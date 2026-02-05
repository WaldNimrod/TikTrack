# 📋 הודעה: צעדים הבאים - Frontend HTML (D16_ACCTS_VIEW)

**מאת:** Team 10 (The Gateway)  
**אל:** Team 30 (Frontend Implementation)  
**תאריך:** 2026-02-03  
**סטטוס:** 🟢 **READY TO START HTML IMPLEMENTATION**  
**עדיפות:** 🔴 **CRITICAL**

---

## ✅ מה הושלם

**מצוין!** התשתית מוכנה:
- ✅ **JavaScript:** כל ה-Classes והפונקציות מוכנים
- ✅ **CSS:** כל הסגנונות מוכנים לשימוש
- ✅ **Backend API:** 80% מוכן (Phases 1-4 Complete)

**קבצים מוכנים:**
- ✅ `ui/src/cubes/shared/PhoenixTableSortManager.js`
- ✅ `ui/src/cubes/shared/PhoenixTableFilterManager.js`
- ✅ `ui/src/cubes/shared/tableFormatters.js`
- ✅ `ui/src/styles/phoenix-components.css` (סקשן TABLES SYSTEM)

**דוח:** `TEAM_30_TO_TEAM_10_D16_ACCTS_VIEW_JS_COMPLETE.md`

---

## ⏳ מה הבא - בניית HTML

### **שלב 3: בניית HTML - קונטיינר 0** 🟢 **READY TO START**

**תאריך יעד:** 2026-02-05  
**סטטוס:** ⏳ **READY TO START**  
**תלות:** אין (יכול להתחיל מיד)

#### **משימות:**
- [ ] **3.1** מבנה LEGO בסיסי
  - `tt-container` > `tt-section` > `index-section__header` + `index-section__body`
  - ⚠️ **קריטי:** `tt-section` חייב להיות שקוף (רקע על header/body נפרד)

- [ ] **3.2** התראות פעילות
  - וויגיט התראות עם באגט ספירה
  - כפתור "הצג הכל"
  - פונקציונליות הצגה/הסתרה

- [ ] **3.3** סיכום מידע (Portfolio Summary)
  - שורה ראשונה: סיכום בסיסי
  - שורה שנייה: סיכום מורחב (מוסתר בהתחלה)
  - כפתור עין להצגה/הסתרה
  - פונקציונליות `portfolio-summary.js`

**קישור לבלופרינט:** `_COMMUNICATION/team_31/team_31_staging/sandbox_v2/D16_ACCTS_VIEW.html` (Container 0)

---

### **שלב 4: בניית HTML - קונטיינר 1** 🔴 **CRITICAL - READY**

**תאריך יעד:** 2026-02-06  
**סטטוס:** ⏳ **READY TO START**  
**תלות:** Backend API `/api/v1/trading_accounts` - ✅ **READY**

#### **משימות:**
- [ ] **4.1** מבנה HTML בסיסי
  - מבנה LEGO: `tt-section` > `index-section__header` + `index-section__body`
  - `phoenix-table-wrapper` > `phoenix-table`

- [ ] **4.2** עמודות הטבלה (10 עמודות)
  1. שם החשבון (`col-name`)
  2. מטבע (`col-currency`)
  3. יתרה (`col-balance`) - **מרכז, monospace**
  4. פוזיציות (`col-positions`) - **מרכז**
  5. רווח/הפסד (`col-total-pl`) - **מרכז**
  6. שווי חשבון (`col-account-value`) - **מרכז**
  7. שווי אחזקות (`col-holdings-value`) - **מרכז**
  8. סטטוס (`col-status`) - באגט צבעוני
  9. עודכן (`col-updated`) - `DD/MM/YYYY` - **מרכז**
  10. פעולות (`col-actions`) - תפריט hover

- [ ] **4.3** אינטגרציה עם JavaScript
  - אתחול `PhoenixTableSortManager`
  - אתחול `PhoenixTableFilterManager`
  - שימוש ב-`tableFormatters` לפורמט תצוגה

- [ ] **4.4** אינטגרציה עם Backend API
  - קריאה ל-`GET /api/v1/trading_accounts`
  - שימוש ב-`transformers.js` (snake_case ↔ camelCase)
  - טיפול בשגיאות

**קישור לבלופרינט:** `_COMMUNICATION/team_31/team_31_staging/sandbox_v2/D16_ACCTS_VIEW.html` (Container 1)

---

### **שלב 5: בניית HTML - קונטיינר 2** 🟢 **READY TO START**

**תאריך יעד:** 2026-02-06  
**סטטוס:** ⏳ **READY TO START**  
**תלות:** Backend API `/api/v1/cash_flows` - ✅ **READY**

#### **משימות:**
- [ ] **5.1** מבנה HTML בסיסי
  - מבנה LEGO: `tt-section` > `index-section__header` + `index-section__body`
  - כרטיסי סיכום (Grid layout)

- [ ] **5.2** פילטרים פנימיים
  - טווח תאריכים: תאריך התחלה + תאריך סיום
  - ⚠️ **קריטי:** `phoenix-table-filters` עם `width: auto` (לא `100%`)

- [ ] **5.3** כרטיסי סיכום
  - Grid: `repeat(auto-fit, minmax(200px, 1fr))`
  - כל כרטיס: רקע לבן, מסגרת, border-radius
  - אינטגרציה עם Backend API `/api/v1/cash_flows/summary`

**קישור לבלופרינט:** `_COMMUNICATION/team_31/team_31_staging/sandbox_v2/D16_ACCTS_VIEW.html` (Container 2)

---

### **שלב 6: בניית HTML - קונטיינר 3** 🟢 **READY TO START**

**תאריך יעד:** 2026-02-07  
**סטטוס:** ⏳ **READY TO START**  
**תלות:** Backend API `/api/v1/cash_flows` - ✅ **READY**

#### **משימות:**
- [ ] **6.1** מבנה HTML בסיסי
  - מבנה LEGO: `tt-section` > `index-section__header` + `index-section__body`
  - `phoenix-table-wrapper` > `phoenix-table`

- [ ] **6.2** עמודות הטבלה (8 עמודות)
  1. תאריך פעולה (`col-date`)
  2. סוג פעולה (`col-type`) - באגט לפי חיובי/שלילי
  3. תת-סוג פעולה (`col-subtype`) - באגט עם מניפת צבעים
  4. חשבון (`col-account`)
  5. סכום (`col-amount`) - **מרכז**
  6. מטבע (`col-currency`) - **מרכז**
  7. סטטוס (`col-status`)
  8. פעולות (`col-actions`)

- [ ] **6.3** פילטרים פנימיים
  - תאריכים: תאריך התחלה + תאריך סיום
  - חשבון: dropdown בחירת חשבון

- [ ] **6.4** אינטגרציה עם Backend API
  - קריאה ל-`GET /api/v1/cash_flows`
  - שימוש ב-`transformers.js`
  - טיפול בשגיאות

**קישור לבלופרינט:** `_COMMUNICATION/team_31/team_31_staging/sandbox_v2/D16_ACCTS_VIEW.html` (Container 3)

---

### **שלב 7: בניית HTML - קונטיינר 4** ⚠️ **PARTIAL - AWAITING BACKEND FIX**

**תאריך יעד:** 2026-02-07  
**סטטוס:** ⚠️ **AWAITING BACKEND FIX**  
**תלות:** Backend API `/api/v1/positions` - ⚠️ **PARTIAL** (Missing market data)

#### **משימות:**
- [ ] **7.1** מבנה HTML בסיסי
  - מבנה LEGO: `tt-section` > `index-section__header` + `index-section__body`
  - `phoenix-table-wrapper` > `phoenix-table`

- [ ] **7.2** עמודות הטבלה (9 עמודות)
  1. סמל (`col-symbol`)
  2. כמות (`col-quantity`) - **מרכז**
  3. מחיר ממוצע (`col-avg-price`) - **מרכז**
  4. **נוכחי (`col-current_price`)** - `$155.34(+3.22%)` ⚠️ **פורמט מיוחד** - **מרכז**
  5. שווי שוק (`col-market-value`) - **מרכז**
  6. **P/L לא ממומש (`col-unrealized-pl`)** - `+$550.0(+3.5%)` ⚠️ **פורמט מיוחד** - **מרכז**
  7. אחוז מהחשבון (`col-percent-account`) - **מרכז**
  8. סטטוס (`col-status`)
  9. פעולות (`col-actions`)

- [ ] **7.3** פילטרים פנימיים
  - חשבון: dropdown בחירת חשבון

- [ ] **7.4** פורמטי תצוגה מיוחדים
  - עמודת נוכחי: מחיר + שינוי יומי (שימוש ב-`tableFormatters.formatCurrentPrice`)
  - עמודת P/L: ערך + אחוז (שימוש ב-`tableFormatters.formatPL`)

- [ ] **7.5** אינטגרציה עם Backend API
  - קריאה ל-`GET /api/v1/positions`
  - ⚠️ **הערה:** Backend יחזיר נתונים חלקיים עד לתיקון Market Data Integration

**קישור לבלופרינט:** `_COMMUNICATION/team_31/team_31_staging/sandbox_v2/D16_ACCTS_VIEW.html` (Container 4)

---

## 📋 סדר עבודה מומלץ

### **יום 1 (2026-02-05):**
1. ✅ **קונטיינר 0** - אין תלות, יכול להתחיל מיד
2. ✅ **קונטיינר 1** - Backend ready, יכול להתחיל

### **יום 2 (2026-02-06):**
3. ✅ **קונטיינר 2** - Backend ready
4. ✅ **קונטיינר 3** - Backend ready

### **יום 3 (2026-02-07):**
5. ⚠️ **קונטיינר 4** - Backend partial (עובד אבל חסר market data)

---

## ⚠️ כללים קריטיים

### **1. מבנה HTML - LEGO System**
- כל הסקשנים מוקפים ב-`tt-section` (שקוף)
- כל הסקשנים מכילים `.index-section__header` ו-`.index-section__body` (עם רקע נפרד)
- כל הטבלאות מוקפות ב-`.phoenix-table-wrapper`

### **2. סדר טעינת CSS (CRITICAL - DO NOT CHANGE)**
```html
<!-- 1. Pico CSS FIRST (Framework) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@1/css/pico.min.css">

<!-- 2. Phoenix Base Styles -->
<link rel="stylesheet" href="../../../../ui/src/styles/phoenix-base.css">

<!-- 3. LEGO Components -->
<link rel="stylesheet" href="../../../../ui/src/styles/phoenix-components.css">

<!-- 4. Header Component -->
<link rel="stylesheet" href="../../../../ui/src/styles/phoenix-header.css">

<!-- 5. Page-Specific Styles -->
<link rel="stylesheet" href="../../../../ui/src/styles/D15_DASHBOARD_STYLES.css">
```

### **3. טעינת JavaScript**
```html
<!-- טעינת Classes -->
<script src="../../../../ui/src/cubes/shared/PhoenixTableSortManager.js"></script>
<script src="../../../../ui/src/cubes/shared/PhoenixTableFilterManager.js"></script>
<script src="../../../../ui/src/cubes/shared/tableFormatters.js"></script>

<!-- אתחול -->
<script>
  // אתחול Sort Manager
  const accountsTable = document.querySelector('#accountsTable');
  if (accountsTable) {
    const sortManager = new PhoenixTableSortManager(accountsTable);
    const filterManager = new PhoenixTableFilterManager(accountsTable);
  }
</script>
```

### **4. אינטגרציה עם Backend API**
```javascript
// דוגמה: קריאה ל-API
async function loadTradingAccounts() {
  try {
    const response = await fetch('/api/v1/trading_accounts', {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    const data = await response.json();
    
    // שימוש ב-transformers.js להמרה
    const transformedData = data.data.map(account => ({
      displayName: account.display_name,
      currency: account.currency,
      balance: account.balance,
      // ... וכו'
    }));
    
    // עדכון הטבלה
    updateTable(transformedData);
  } catch (error) {
    console.error('Error loading trading accounts:', error);
  }
}
```

---

## 📞 קישורים רלוונטיים

### **בלופרינט ומפרטים:**
- **בלופרינט מאושר:** `_COMMUNICATION/team_31/team_31_staging/sandbox_v2/D16_ACCTS_VIEW.html`
- **מפרט טבלאות:** `_COMMUNICATION/team_31/team_31_staging/PHOENIX_TABLES_SPECIFICATION.md`
- **הוראות מימוש:** `_COMMUNICATION/team_31/team_31_staging/sandbox_v2/TEAM_31_TO_TEAM_10_30_D16_ACCTS_VIEW_IMPLEMENTATION_REQUEST.md`

### **תיעוד:**
- **תוכנית עבודה:** `_COMMUNICATION/team_10/TEAM_10_D16_ACCTS_VIEW_IMPLEMENTATION_PLAN.md`
- **מעקב התקדמות:** `_COMMUNICATION/team_10/TEAM_10_D16_ACCTS_VIEW_STATUS_TRACKER.md`
- **עדכון התקדמות:** `_COMMUNICATION/team_10/TEAM_10_D16_ACCTS_VIEW_PROGRESS_UPDATE.md`

---

**Team 10 (The Gateway)**  
**תאריך:** 2026-02-03  
**סטטוס:** 🟢 **READY TO START HTML IMPLEMENTATION**
