# 🛑 מנדט אדום: תיקון כשל חשבונות מסחר (Trading Accounts Critical Fix)

**מאת:** Team 10 (The Gateway)  
**אל:** Team 30 (Frontend Execution)  
**תאריך:** 2026-02-05  
**סטטוס:** 🛑 **CRITICAL - BLOCKING PHASE 2**  
**מקור:** `ARCHITECT_TRADING_ACCOUNTS_RED_FIX_MANDATE.md`

---

## 📢 Executive Summary

כשל משילות במודול Trading Accounts - Phase 2 Kickoff מבוטל זמנית. נדרש תיקון כירורגי מיידי.

---

## 🚩 האבחנה (Spy Report 90.04)

נמצא כי מודול חשבונות המסחר (Trading Accounts) עושה שימוש ב-Transformer מקומי ועוקף את ה-`FIX_transformers.js`. בנוסף, קיימת דליפת טוקנים ללוג.

---

## 🛠️ הפקודה (Action Items)

### **1. Surgical Refactor - מחיקת Transformer מקומי** 🛑 **CRITICAL**

**קובץ:** `ui/src/views/financial/tradingAccounts/tradingAccountsDataLoader.js`

#### **1.1 מחיקת פונקציה `apiToReact` מקומית** ✅
- ❌ **למחוק:** פונקציה `apiToReact` מקומית (שורות 30-42)
- ✅ **להוסיף:** Import של `apiToReact` מ-`ui/src/cubes/shared/utils/transformers.js`

#### **1.2 עדכון כל השימושים** ✅
- ✅ להחליף את כל הקריאות ל-`apiToReact` המקומית ב-`apiToReact` המיובאת
- ✅ לוודא שכל שדות ה-Balance וה-PL מומרים ל-Number בשכבת הנתונים (ולא רק ברינדור)

**קבצים לעדכון:**
- `ui/src/views/financial/tradingAccounts/tradingAccountsDataLoader.js`

---

### **2. Security Purge - הסרת דליפת טוקנים** 🛑 **CRITICAL**

**קובץ:** `ui/src/views/financial/tradingAccounts/tradingAccountsDataLoader.js`

#### **2.1 הסרת `tokenPreview`** ✅
- ❌ **למחוק:** שורה 60 - `tokenPreview: authHeader.Authorization ? authHeader.Authorization.substring(0, 20) + '...' : 'none'`
- ✅ **להחליף:** להשתמש ב-`maskedLog` מ-`ui/src/utils/maskedLog.js` (אם נדרש לוג)

#### **2.2 הסרת כל הדפסת טוקן גולמית** ✅
- ❌ **למחוק:** כל `console.log` שמדליף טוקן גולמי
- ✅ **להחליף:** להשתמש ב-`maskedLog` או להסיר לחלוטין

**קבצים לעדכון:**
- `ui/src/views/financial/tradingAccounts/tradingAccountsDataLoader.js`

---

## 📋 הוראות מפורטות

### **שלב 1: עדכון Import**

**להחליף:**
```javascript
// לפני
function apiToReact(data) {
  // ... קוד מקומי
}
```

**ב:**
```javascript
// אחרי
import { apiToReact } from '../../../cubes/shared/utils/transformers.js';
```

### **שלב 2: הסרת tokenPreview**

**להחליף:**
```javascript
// לפני
console.log('[Trading Accounts Data Loader] Fetching trading accounts:', {
  url,
  hasToken: !!authHeader.Authorization,
  tokenPreview: authHeader.Authorization ? authHeader.Authorization.substring(0, 20) + '...' : 'none'
});
```

**ב:**
```javascript
// אחרי
// Debug logging removed - security compliance
// Use maskedLog if debug logging is required
```

או עם `maskedLog`:
```javascript
import { maskedLogWithTimestamp } from '../../../utils/maskedLog.js';

maskedLogWithTimestamp('[Trading Accounts Data Loader] Fetching trading accounts', {
  url,
  hasToken: !!authHeader.Authorization
});
```

### **שלב 3: אימות המרת מספרים**

**לוודא:**
- ✅ כל שדות ה-Balance (`balance`, `availableAmounts`, `lockedAmounts`) מומרים ל-Number
- ✅ כל שדות ה-PL (`totalPl`, `unrealizedPl`) מומרים ל-Number
- ✅ ההמרה מתבצעת בשכבת הנתונים (ב-`apiToReact` מ-transformers.js), לא רק ברינדור

---

## ✅ קריטריוני השלמה

1. ✅ אין פונקציה `apiToReact` מקומית ב-`tradingAccountsDataLoader.js`
2. ✅ כל השימושים ב-`apiToReact` משתמשים בפונקציה מ-`transformers.js`
3. ✅ אין `tokenPreview` או דליפת טוקנים ללוג
4. ✅ כל שדות ה-Balance וה-PL מומרים ל-Number בשכבת הנתונים
5. ✅ אין `console.log` שמדליף טוקן גולמי

---

## 📁 קבצים לעדכון

- ✅ `ui/src/views/financial/tradingAccounts/tradingAccountsDataLoader.js`
  - מחיקת פונקציה `apiToReact` מקומית (שורות 30-42)
  - הוספת Import מ-`transformers.js`
  - הסרת `tokenPreview` (שורה 60)
  - החלפת כל השימושים ב-`apiToReact`

---

## ⚠️ הערות חשובות

1. **המרת מספרים:** ה-`apiToReact` מ-`transformers.js` כולל המרה כפויה למספרים לשדות כספיים (v1.2 Hardened). אין צורך בהמרה נוספת.

2. **Security:** כל לוגים עם נתונים רגישים חייבים להשתמש ב-`maskedLog` או להסיר לחלוטין.

3. **Phase 2 Blocked:** Phase 2 Kickoff מבוטל זמנית עד לתיקון זה.

---

## 📊 סטטוס Page Tracker

**עודכן:** `TT2_OFFICIAL_PAGE_TRACKER.md`
- סטטוס D16 שונה ל-🛑 **CRITICAL_FIX**
- Batch 2 שונה ל-🛑 **CRITICAL_FIX - BLOCKED**

---

**Team 10 (The Gateway)**  
**תאריך:** 2026-02-05  
**סטטוס:** 🛑 **CRITICAL - BLOCKING PHASE 2**

**log_entry | [Team 10] | TRADING_ACCOUNTS_RED_FIX | MANDATE_TO_TEAM_30 | RED | 2026-02-05**
