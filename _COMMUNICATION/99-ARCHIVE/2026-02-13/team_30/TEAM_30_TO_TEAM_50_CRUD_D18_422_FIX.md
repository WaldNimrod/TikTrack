# דוח Team 30 → Team 50: תיקון שגיאת 422 בטופס D18

**אל:** Team 50 (QA & Fidelity)  
**מאת:** Team 30 (Frontend Execution)  
**תאריך:** 2026-01-31  
**מקור:** `TEAM_50_TO_TEAM_30_CRUD_FORMS_QA_REPORT.md`  
**סטטוס:** ✅ **תיקון הושלם — מוכן לבדיקה חוזרת**

---

## 1. Executive Summary

תוקנה בעיית 422 בשמירת טופס D18 (Brokers Fees). הבעיה נגרמה מהמרה שגויה של `commissionValue` (שדה טקסט `VARCHAR(255)`) למספר ב-`transformers.js`.

**תיקונים שבוצעו:**
- ✅ הוספת רשימת שדות שצריכים להישאר כמחרוזות (`STRING_ONLY_FIELDS`) ב-`transformers.js`
- ✅ שיפור ה-error handling להצגת פרטי ולידציה מה-API ב-`brokersFeesTableInit.js` ו-`cashFlowsTableInit.js`

---

## 2. פירוט הבעיה

### 2.1. Root Cause

**הבעיה:** `commissionValue` הוא שדה מסוג `VARCHAR(255)` ב-DB (לא מספר), אבל `transformers.js` זיהה אותו כשדה פיננסי (כי הוא מכיל את המילה `value`) והמיר אותו למספר.

**תרחיש הכשל:**
1. המשתמש מזין בטופס: `commissionValue: "0.0035 $ / Share"` (מחרוזת)
2. `transformers.reactToApi()` מזהה את `commissionValue` כשדה פיננסי
3. `Number("0.0035 $ / Share")` = `NaN`
4. `isNaN(NaN)` = `true` → מחזיר `0`
5. ה-API מקבל `commission_value: 0` במקום `"0.0035 $ / Share"`
6. ה-API מחזיר 422 (Validation Error)

### 2.2. Evidence

**מקור הבעיה:**
- `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql` (שורה 1035):
  ```sql
  commission_value VARCHAR(255) NOT NULL,
  ```

**קוד בעייתי:**
- `ui/src/cubes/shared/utils/transformers.js` (שורה 15):
  ```javascript
  const FINANCIAL_FIELDS = ['balance', 'price', 'amount', 'total', 'value', ...];
  ```
  - הלוגיקה בודקת אם השדה מכיל את המילה `value` → מזהה `commissionValue` כשדה פיננסי

---

## 3. התיקון

### 3.1. שינוי ב-`transformers.js`

**קובץ:** `ui/src/cubes/shared/utils/transformers.js`

**שינוי:**
- הוספת רשימת `STRING_ONLY_FIELDS` לשדות שצריכים להישאר כמחרוזות
- עדכון `convertFinancialField()` לבדוק תחילה אם השדה ברשימת ה-exclusions

**קוד לפני:**
```javascript
const FINANCIAL_FIELDS = ['balance', 'price', 'amount', 'total', 'value', ...];

function convertFinancialField(value, key) {
  const isFinancialField = FINANCIAL_FIELDS.some(field => 
    key.toLowerCase().includes(field.toLowerCase())
  );
  // ...
}
```

**קוד אחרי:**
```javascript
const FINANCIAL_FIELDS = ['balance', 'price', 'amount', 'total', 'value', ...];
const STRING_ONLY_FIELDS = ['commissionValue', 'commission_value', 'description', 'notes', ...];

function convertFinancialField(value, key) {
  // Check exclusions first
  const isStringOnlyField = STRING_ONLY_FIELDS.some(field => 
    key.toLowerCase() === field.toLowerCase()
  );
  if (isStringOnlyField) {
    return value; // Keep as-is (string)
  }
  // ... rest of logic
}
```

### 3.2. שיפור Error Handling

**קבצים:**
- `ui/src/views/financial/brokersFees/brokersFeesTableInit.js`
- `ui/src/views/financial/cashFlows/cashFlowsTableInit.js`

**שינוי:**
- הוספת הצגת פרטי ולידציה מה-API (`error.details.field`) בהודעות שגיאה
- תרגום שמות שדות לעברית בהודעות שגיאה

**קוד לפני:**
```javascript
if (error.code === 'VALIDATION_FIELD_REQUIRED' || error.status === 422) {
  errorMessage = 'אנא מלא את כל השדות הנדרשים';
}
```

**קוד אחרי:**
```javascript
if (error.code === 'VALIDATION_FIELD_REQUIRED' || error.status === 422) {
  if (error.details && error.details.field) {
    const fieldName = error.details.field === 'commission_value' ? 'ערך עמלה' : ...;
    errorMessage = `שגיאה בשדה ${fieldName}: ${error.message || 'אנא מלא את השדה הנדרש'}`;
  } else {
    errorMessage = error.message || 'אנא מלא את כל השדות הנדרשים';
  }
}
```

---

## 4. בדיקות שבוצעו

### 4.1. Unit Test (Manual)

**תרחיש:**
```javascript
const testData = { broker: 'Test', commissionType: 'TIERED', commissionValue: '0.0035 $ / Share', minimum: 1 };
const result = reactToApi(testData);
console.log(result);
```

**תוצאה לפני התיקון:**
```json
{
  "broker": "Test",
  "commission_type": 0,  // ❌ שגוי (צריך להיות "TIERED")
  "commission_value": 0,  // ❌ שגוי (צריך להיות "0.0035 $ / Share")
  "minimum": 1
}
```

**תוצאה אחרי התיקון:**
```json
{
  "broker": "Test",
  "commission_type": "TIERED",  // ✅ תקין
  "commission_value": "0.0035 $ / Share",  // ✅ תקין
  "minimum": 1
}
```

### 4.2. Linter Check

✅ **No linter errors found** — כל הקבצים עוברים בדיקת linter

---

## 5. המלצות לבדיקה חוזרת

### 5.1. בדיקות ספציפיות

1. **CRUD_D18_FormSave — שמירת טופס D18:**
   - מילוי כל השדות בטופס (שם ברוקר, סוג עמלה, ערך עמלה עם תווים מיוחדים כמו `"0.0035 $ / Share"`, מינימום)
   - לחיצה על "שמור"
   - **צפוי:** שמירה מוצלחת ללא שגיאת 422

2. **CRUD_D21_FormSave — שמירת טופס D21:**
   - בדיקה שהתיקון לא שבר שמירת Cash Flows
   - **צפוי:** שמירה מוצלחת

3. **Error Messages — הודעות שגיאה:**
   - אם ה-API מחזיר 422 עם פרטי ולידציה (`error.details.field`), הודעת השגיאה צריכה להציג את שם השדה בעברית
   - **צפוי:** הודעת שגיאה מפורטת (למשל: "שגיאה בשדה ערך עמלה: ...")

### 5.2. סבב בדיקות מלא (Phase 2)

לאחר אישור הבדיקות הספציפיות לעיל, להריץ סבב בדיקות מלא ידני לפי הרשימה ב-`TEAM_30_TO_TEAM_50_CRUD_FORMS_QA_REQUEST.md`:
- עריכה (Edit)
- מחיקה (Delete)
- צפייה (View)
- ולידציה (Validation)
- מודל (X/ביטול/ESC)

---

## 6. קבצים ששונו

| קובץ | שינוי | סטטוס |
|------|-------|--------|
| `ui/src/cubes/shared/utils/transformers.js` | הוספת `STRING_ONLY_FIELDS` + עדכון `convertFinancialField()` | ✅ |
| `ui/src/views/financial/brokersFees/brokersFeesTableInit.js` | שיפור error handling להצגת פרטי ולידציה | ✅ |
| `ui/src/views/financial/cashFlows/cashFlowsTableInit.js` | שיפור error handling להצגת פרטי ולידציה | ✅ |

---

## 7. סיכום

✅ **תיקון הושלם** — `commissionValue` נשאר כמחרוזת ולא מומר למספר  
✅ **Error Handling משופר** — הודעות שגיאה מפורטות עם פרטי ולידציה  
✅ **מוכן לבדיקה חוזרת** — Team 50 מוזמנים להריץ את הבדיקות הספציפיות ולאחר מכן סבב מלא

---

**Team 30 (Frontend Execution)**  
**log_entry | TO_TEAM_50 | CRUD_D18_422_FIX | SENT | 2026-01-31**
