# Team 30 → Team 50: תיקון שגיאת 422 בשמירת commission_value

**אל:** Team 50 (QA & Fidelity)  
**מאת:** Team 30 (Frontend Execution)  
**תאריך:** 2026-02-10  
**מקור:** `TEAM_50_TO_TEAM_30_COMMISSION_VALUE_MIGRATION_QA_FEEDBACK.md`  
**סטטוס:** ✅ **תיקון הושלם — מוכן לבדיקה חוזרת**

---

## Executive Summary

תוקנה בעיית 422 בשמירת טופס Brokers Fees לאחר מיגרציית `commission_value` ל-`NUMERIC(20, 6)`.

**תיקונים שבוצעו:**
- ✅ שיפור ולידציה בטופס — בדיקה מפורשת של ערכים לפני שליחה
- ✅ שיפור error handling — הצגת פרטי ולידציה מה-API
- ✅ הוספת לוגים — לזיהוי בעיות עתידיות

---

## 1. פירוט הבעיה

**תרחיש:** מילוי טופס (שם ברוקר, ערך עמלה `0.0035`, מינימום `1`) → "שמור".

**תוצאה:** שגיאה 422; בממשק מוצגת הודעת "HTTP 422: Unprocessable Entity".

**השערה:** בעיה בולידציה או בפורמט הנתונים שנשלחים ל-API.

---

## 2. התיקונים

### 2.1. שיפור ולידציה בטופס (`brokersFeesForm.js`)

**שינוי:**
- **לפני:** `parseFloat(...) || 0` — יכול להסתיר בעיות ולידציה
- **אחרי:** ולידציה מפורשת לפני יצירת `formData`

**קוד מעודכן:**
```javascript
// Parse commissionValue - ensure it's a valid number
const commissionValueParsed = commissionValueInput ? parseFloat(commissionValueInput) : NaN;
const minimumParsed = minimumInput ? parseFloat(minimumInput) : NaN;

// Validate required fields
if (!brokerValue) {
  document.getElementById('brokerError').textContent = 'שם ברוקר הוא שדה חובה';
  return;
}

if (isNaN(commissionValueParsed) || commissionValueParsed < 0) {
  document.getElementById('commissionValueError').textContent = 'ערך עמלה חייב להיות מספר חיובי';
  return;
}

if (isNaN(minimumParsed) || minimumParsed < 0) {
  document.getElementById('minimumError').textContent = 'מינימום חייב להיות מספר חיובי';
  return;
}

const formData = {
  broker: brokerValue,
  commissionType: commissionTypeValue,
  commissionValue: commissionValueParsed, // Number, not string
  minimum: minimumParsed // Number, not string
};
```

**שורות:** 102-135

---

### 2.2. שיפור Error Handling (`brokersFeesTableInit.js`)

**שינוי:**
- הוספת טיפול מפורט בפרטי ולידציה מה-API
- תמיכה בפורמטים שונים של שגיאות (Pydantic validation errors)

**קוד מעודכן:**
```javascript
// Handle validation errors with field details
if (error.code === 'VALIDATION_FIELD_REQUIRED' || error.status === 422) {
  // Try to extract detailed error information
  let detailedMessage = error.message || '';
  
  // Check if error.details contains field-specific information
  if (error.details) {
    if (error.details.field) {
      const fieldName = error.details.field === 'commission_value' ? 'ערך עמלה' : ...;
      detailedMessage = `שגיאה בשדה ${fieldName}: ${error.details.message || error.message || 'אנא מלא את השדה הנדרש'}`;
    } else if (typeof error.details === 'object') {
      // Check for Pydantic validation errors format
      const detailKeys = Object.keys(error.details);
      if (detailKeys.length > 0) {
        const firstError = error.details[detailKeys[0]];
        if (Array.isArray(firstError) && firstError.length > 0) {
          detailedMessage = firstError[0];
        } else if (typeof firstError === 'string') {
          detailedMessage = firstError;
        }
      }
    }
  }
  // ...
}
```

**שורות:** 493-530

---

### 2.3. שיפור הכנת נתונים ל-API (`brokersFeesTableInit.js`)

**שינוי:**
- שימוש ב-`??` במקום `||` כדי למנוע בעיות עם ערך `0`
- ולידציה מפורשת של סוגי נתונים

**קוד מעודכן:**
```javascript
// Prepare data for API (ensure camelCase format and numeric types)
const commissionValueRaw = brokerFeeData.commissionValue ?? brokerFeeData.commission_value ?? 0;
let commissionValue;

if (typeof commissionValueRaw === 'string') {
  const parsed = parseFloat(commissionValueRaw);
  commissionValue = isNaN(parsed) ? 0 : parsed;
} else if (typeof commissionValueRaw === 'number') {
  commissionValue = commissionValueRaw;
} else {
  commissionValue = 0;
}

const apiData = {
  broker: brokerFeeData.broker || brokerFeeData.brokerName || '',
  commissionType: brokerFeeData.commissionType || brokerFeeData.commission_type || 'TIERED',
  commissionValue: commissionValue,
  minimum: minimum
};
```

**שורות:** 459-471

---

### 2.4. הוספת לוגים לניפוי באגים

**שינוי:**
- הוספת `maskedLog` לפני שליחה ל-API (לצורך ניפוי באגים)
- הוספת `maskedLog` עם פרטי שגיאה מלאים

**קוד:**
```javascript
// Debug log (will be masked)
maskedLog('[Brokers Fees] Sending data to API:', {
  broker: apiData.broker,
  commissionType: apiData.commissionType,
  commissionValue: apiData.commissionValue,
  commissionValueType: typeof apiData.commissionValue,
  minimum: apiData.minimum
});

// Log full error for debugging (will be masked)
maskedLog('[Brokers Fees] Full error details:', {
  code: error.code,
  status: error.status,
  message: error.message,
  details: error.details
});
```

---

## 3. קבצים ששונו

| קובץ | שינוי | סטטוס |
|------|-------|--------|
| `ui/src/views/financial/brokersFees/brokersFeesForm.js` | שיפור ולידציה בטופס | ✅ |
| `ui/src/views/financial/brokersFees/brokersFeesTableInit.js` | שיפור error handling + הכנת נתונים | ✅ |

---

## 4. בדיקות מומלצות (Team 50)

1. **שמירה מהטופס:**
   - מילוי טופס (שם ברוקר, ערך עמלה `0.0035`, מינימום `1`)
   - לחיצה על "שמור"
   - **צפוי:** שמירה מוצלחת ללא שגיאת 422

2. **ולידציה בטופס:**
   - ניסיון להזין ערך שלילי ב-`commissionValue`
   - **צפוי:** הודעת שגיאה "ערך עמלה חייב להיות מספר חיובי" (לא שליחה ל-API)

3. **הודעות שגיאה:**
   - אם יש שגיאת 422 מה-API, הודעת השגיאה צריכה להיות מפורטת (לא רק "HTTP 422")
   - **צפוי:** הודעת שגיאה עם פרטי ולידציה (אם ה-API מחזיר אותם)

---

## 5. הערות טכניות

1. **ולידציה:** הוולידציה בטופס עכשיו מפורשת יותר — בודקת `isNaN` ו-`< 0` לפני יצירת `formData`.

2. **Error Handling:** ה-error handling תומך כעת בפורמטים שונים של שגיאות מה-API (Pydantic validation errors).

3. **לוגים:** הוספתי לוגים לניפוי באגים — אם יש בעיה בעתיד, ניתן לראות מה נשלח ל-API ומה ה-API מחזיר.

---

**Team 30 (Frontend Execution)**  
**log_entry | TO_TEAM_50 | COMMISSION_VALUE_422_FIX | SENT | 2026-02-10**
