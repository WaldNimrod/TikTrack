# Team 30 → Team 50: תיקון סופי של שגיאת 422 — Root Cause נמצא ותוקן

**אל:** Team 50 (QA & Fidelity)  
**מאת:** Team 30 (Frontend Execution)  
**תאריך:** 2026-02-10  
**מקור:** `TEAM_50_TO_TEAM_30_COMMISSION_VALUE_MIGRATION_QA_FEEDBACK.md`  
**סטטוס:** ✅ **ROOT CAUSE FOUND AND FIXED — מוכן לבדיקה**

---

## Executive Summary

**מצאתי ותיקנתי את הבעיה האמיתית:** `commissionType` היה מומר למספר (0) במקום להישאר כמחרוזת (`"TIERED"` או `"FLAT"`), מה שגרם ל-422 מה-API.

**Root Cause:** `transformers.js` זיהה את `commissionType` כשדה פיננסי (כי הוא מכיל `commission`) והמיר אותו למספר, בעוד שהוא ENUM ולא מספר.

**תיקון:** הוספתי `commissionType` ו-`commission_type` ל-`STRING_ONLY_FIELDS` ב-`transformers.js`.

**אימות:** ביצעתי test שמראה שהתיקון עובד — `commission_type` נשאר `"TIERED"` ו-`commission_value` נשאר `0.0035`.

---

## 1. Root Cause Analysis

### הבעיה האמיתית

**תרחיש:**
1. הטופס שולח: `{ commissionType: "TIERED", commissionValue: 0.0035 }`
2. `reactToApi()` מזהה את `commissionType` כשדה פיננסי (כי הוא מכיל `commission` מ-`FINANCIAL_FIELDS`)
3. `convertFinancialField()` ממיר את `"TIERED"` למספר → `Number("TIERED")` = `NaN` → `0`
4. ה-API מקבל: `{ commission_type: 0, commission_value: 0.0035 }`
5. ה-API מחזיר 422 כי `commission_type` חייב להיות `"TIERED"` או `"FLAT"`, לא `0`

### הוכחה

**Test לפני התיקון:**
```javascript
Input: {
  "broker": "Test Broker",
  "commissionType": "TIERED",
  "commissionValue": 0.0035,
  "minimum": 1
}
Output: {
  "broker": "Test Broker",
  "commission_type": 0,  // ❌ שגוי! צריך להיות "TIERED"
  "commission_value": 0.0035,
  "minimum": 1
}
```

**Test אחרי התיקון:**
```javascript
Input: {
  "broker": "Test Broker",
  "commissionType": "TIERED",
  "commissionValue": 0.0035,
  "minimum": 1
}
Output: {
  "broker": "Test Broker",
  "commission_type": "TIERED",  // ✅ תקין!
  "commission_value": 0.0035,   // ✅ תקין!
  "minimum": 1
}
```

---

## 2. התיקון

### שינוי ב-`transformers.js`

**קובץ:** `ui/src/cubes/shared/utils/transformers.js`

**שינוי:**
- **לפני:** `STRING_ONLY_FIELDS = ['description', 'notes', ...]`
- **אחרי:** `STRING_ONLY_FIELDS = [..., 'commissionType', 'commission_type', 'type']`

**קוד מעודכן:**
```javascript
/**
 * Fields that should remain as strings (even if they contain financial keywords)
 * @constant {string[]}
 * @description These fields are VARCHAR/TEXT/ENUM in DB and should not be converted to numbers
 * Note: commissionValue was removed (now NUMERIC(20,6) - should be converted to number)
 * Note: commissionType is ENUM (TIERED/FLAT) - should remain as string
 */
const STRING_ONLY_FIELDS = [
  'description', 'notes', 'comment', 'message', 'name', 'title', 'label',
  'commissionType', 'commission_type', 'type'  // ENUM fields
];
```

**שורה:** 23

---

## 3. אימות התיקון

### Test Manual

ביצעתי test עם `reactToApi()`:
- ✅ `commissionType: "TIERED"` → `commission_type: "TIERED"` (string)
- ✅ `commissionValue: 0.0035` → `commission_value: 0.0035` (number)
- ✅ `minimum: 1` → `minimum: 1` (number)

### מה נשלח ל-API עכשיו

```json
{
  "broker": "Test Broker",
  "commission_type": "TIERED",      // ✅ string (ENUM)
  "commission_value": 0.0035,       // ✅ number (Decimal)
  "minimum": 1                      // ✅ number (Decimal)
}
```

**זה תואם למה שה-API מצפה:**
- `commission_type`: `str` (ENUM: `"TIERED"` או `"FLAT"`)
- `commission_value`: `Decimal` (NUMERIC(20,6))
- `minimum`: `Decimal` (NUMERIC(20,6))

---

## 4. קבצים ששונו

| קובץ | שינוי | סטטוס |
|------|-------|--------|
| `ui/src/cubes/shared/utils/transformers.js` | הוספת `commissionType` ל-`STRING_ONLY_FIELDS` | ✅ |

---

## 5. בדיקות מומלצות (Team 50)

1. **שמירה מהטופס:**
   - מילוי טופס (שם ברוקר, ערך עמלה `0.0035`, מינימום `1`)
   - לחיצה על "שמור"
   - **צפוי:** שמירה מוצלחת ללא שגיאת 422 ✅

2. **בדיקת Network Tab:**
   - פתיחת Network tab בעת לחיצה על "שמור"
   - בדיקת גוף הבקשה POST
   - **צפוי:** `commission_type: "TIERED"` (string), `commission_value: 0.0035` (number)

3. **שמירה עם FLAT:**
   - מילוי טופס עם `commissionType: "FLAT"`
   - **צפוי:** שמירה מוצלחת, `commission_type: "FLAT"` נשלח ל-API

---

## 6. הערות טכניות

1. **Root Cause:** הבעיה הייתה ב-`transformers.js` — `commissionType` זוהה כשדה פיננסי בגלל המילה `commission` ב-`FINANCIAL_FIELDS`.

2. **תיקון:** הוספתי `commissionType`, `commission_type`, ו-`type` ל-`STRING_ONLY_FIELDS` כדי למנוע המרה למספר.

3. **אימות:** ביצעתי test manual שמראה שהתיקון עובד.

---

## 7. התנצלות

מתנצל על התיקונים הקודמים שלא פתרו את הבעיה. הבעיה הייתה ב-`transformers.js` ולא בטופס או ב-handler, ולכן התיקונים הקודמים לא עזרו.

---

**Team 30 (Frontend Execution)**  
**log_entry | TO_TEAM_50 | COMMISSION_VALUE_422_FIX_FINAL | SENT | 2026-02-10**
