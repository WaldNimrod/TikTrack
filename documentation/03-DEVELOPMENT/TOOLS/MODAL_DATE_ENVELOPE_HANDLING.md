# Modal DateEnvelope Handling - טיפול בתאריכים במודולי עריכה

**תאריך עדכון:** 21 בנובמבר 2025  
**גרסה:** 1.0.0  
**סטטוס:** ✅ מושלם - כל המודולים תומכים ב-DateEnvelope

---

## 🎯 מטרה

מסמך זה מתאר את הטיפול בתאריכים במודולי העריכה של TikTrack. השרת מחזיר תאריכים בפורמט `DateEnvelope` (אובייקט עם `utc`, `epochMs`, `local`, `timezone`, `display`), והקוד ב-`ModalManagerV2` מטפל בהם נכון.

---

## 📋 רשימת מודולים עם שדות תאריך

### 1. **Executions** (`executions-config.js`)

- **שדה:** `executionDate` (type: `datetime-local`)
- **מיפוי שדות:** `date` -> `executionDate`
- **שדה DateEnvelope:** `date_envelope`
- **סטטוס:** ✅ תוקן ופועל

### 2. **Trades** (`trades-config.js`)

- **שדה:** `tradeEntryDate` (type: `datetime-local`)
- **מיפוי שדות:** `created_at`/`opened_at` -> `tradeEntryDate`
- **שדה DateEnvelope:** `created_at_envelope` / `opened_at_envelope`
- **סטטוס:** ✅ תוקן ופועל

### 3. **Trade Plans** (`trade-plans-config.js`)

- **שדה:** `tradePlanEntryDate` (type: `datetime-local`)
- **מיפוי שדות:** `created_at`/`entry_date` -> `tradePlanEntryDate`
- **שדה DateEnvelope:** `created_at_envelope` / `entry_date_envelope`
- **סטטוס:** ✅ תוקן ופועל

### 4. **Alerts** (`alerts-config.js`)

- **שדה:** `alertExpiryDate` (type: `date`)
- **מיפוי שדות:** `expiry_date` -> `alertExpiryDate`
- **שדה DateEnvelope:** `expiry_date_envelope`
- **סטטוס:** ✅ תוקן ופועל

### 5. **Cash Flows** (`cash-flows-config.js`)

- **שדה:** `cashFlowDate` (type: `date`)
- **מיפוי שדות:** `date` -> `cashFlowDate`
- **שדה DateEnvelope:** `date_envelope`
- **סטטוס:** ✅ תוקן ופועל

---

## 🔧 איך זה עובד

### 1. זיהוי DateEnvelope

הקוד ב-`ModalManagerV2.populateForm` בודק אם יש שדה `{key}_envelope` (למשל `date_envelope`, `created_at_envelope`) ומשתמש בו במקום השדה הרגיל:

```javascript
// CRITICAL: For date fields, prefer DateEnvelope over display string
let actualValue = value;
if ((key === 'date' || key.endsWith('_date') || key.includes('Date')) && data[`${key}_envelope`]) {
    actualValue = data[`${key}_envelope`];
    console.log(`🔍 [populateForm] Using ${key}_envelope instead of ${key} (DateEnvelope detected)`);
}
```

### 2. המרה ל-Date Object

הקוד ממיר את ה-DateEnvelope ל-Date object באמצעות `dateUtils.toDateObject`:

```javascript
// Priority 1: Check if it's a DateEnvelope object
if (actualValue && typeof actualValue === 'object' && ('epochMs' in actualValue || 'utc' in actualValue || 'local' in actualValue)) {
    if (window.dateUtils && typeof window.dateUtils.toDateObject === 'function') {
        dateObj = window.dateUtils.toDateObject(actualValue);
    } else {
        // Fallback: parse from DateEnvelope fields
        if (actualValue.epochMs && typeof actualValue.epochMs === 'number') {
            dateObj = new Date(actualValue.epochMs);
        } else if (actualValue.utc && typeof actualValue.utc === 'string') {
            dateObj = new Date(actualValue.utc);
        } else if (actualValue.local && typeof actualValue.local === 'string') {
            dateObj = new Date(actualValue.local);
        }
    }
}
```

### 3. פורמט לפלט

לאחר המרה ל-Date object, הקוד ממיר לפורמט המתאים:

- **`date` type:** `YYYY-MM-DD`
- **`datetime-local` type:** `YYYY-MM-DDTHH:MM`

```javascript
if (dateObj && !isNaN(dateObj.getTime())) {
    if (field.type === 'date') {
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        field.value = `${year}-${month}-${day}`;
    } else if (field.type === 'datetime-local') {
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        const hours = String(dateObj.getHours()).padStart(2, '0');
        const minutes = String(dateObj.getMinutes()).padStart(2, '0');
        field.value = `${year}-${month}-${day}T${hours}:${minutes}`;
    }
}
```

---

## 📝 מיפוי שדות תאריך

מיפוי השדות מוגדר ב-`ModalManagerV2.getFieldMapping()`:

```javascript
'trade': {
    'created_at': 'tradeEntryDate',
    'opened_at': 'tradeEntryDate',
    // ...
},
'trade_plan': {
    'created_at': 'tradePlanEntryDate',
    'entry_date': 'tradePlanEntryDate',
    // ...
},
'execution': {
    'date': 'executionDate',
    // ...
},
'alert': {
    'expiry_date': 'alertExpiryDate',
    // ...
},
'cash_flow': {
    'date': 'cashFlowDate',
    // ...
}
```

---

## ✅ בדיקות

### בדיקה ידנית

1. פתח כל אחד מהמודולים לעריכה
2. בדוק שהתאריך מופיע נכון בשדה
3. בדוק את הקונסול - אמור להיות לוג: `🔍 [populateForm] Using {key}_envelope instead of {key} (DateEnvelope detected)`

### בדיקה אוטומטית

הרץ בקונסול:

```javascript
// בדיקה עבור execution
await debugPopulateFormDates(executionId);
```

---

## 🔗 קישורים רלוונטיים

- [DateEnvelope Blueprint](plans/DATE_ENVELOPE_BLUEPRINT.md)
- [Date Utilities System](frontend/DATE_UTILITIES_SYSTEM.md)
- [ModalManagerV2 Specification](03-DEVELOPMENT/TOOLS/MODAL_MANAGER_V2_SPECIFICATION.md)

---

## 📊 סיכום

| מודול | שדה תאריך | סוג | סטטוס |
|-------|-----------|-----|-------|
| Executions | `executionDate` | `datetime-local` | ✅ |
| Trades | `tradeEntryDate` | `datetime-local` | ✅ |
| Trade Plans | `tradePlanEntryDate` | `datetime-local` | ✅ |
| Alerts | `alertExpiryDate` | `date` | ✅ |
| Cash Flows | `cashFlowDate` | `date` | ✅ |

**סה"כ:** 5 מודולים, כולם תומכים ב-DateEnvelope ✅

---

**תאריך עדכון אחרון:** 21 בנובמבר 2025  
**גרסה:** 1.0.0  
**סטטוס:** ✅ מושלם

