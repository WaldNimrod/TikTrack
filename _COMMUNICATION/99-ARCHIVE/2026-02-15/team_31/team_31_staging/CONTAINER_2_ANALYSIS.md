# 🔍 ניתוח Container 2: סיכום תנועות בחשבון

**תאריך:** 2026-02-01  
**סטטוס:** ⚠️ דורש חפירה מעמיקה - לא עובד בלגסי

---

## 📊 מה ידוע

### מהסריקה:
- **Container ID:** `accountActivityContainer` (לפי header-system.js)
- **כותרת:** "סיכום תנועות בחשבון"
- **טבלאות:** 0 טבלאות נמצאו בסריקה (או שהתוכן נוצר דינמית)
- **מיקום:** Container 2 (לפני "דף חשבון לתאריכים")

### מהקוד:
- **קובץ JS:** `scripts/account-activity.js` (מוזכר ב-package-manifest.js)
- **פונקציה:** `window.initAccountActivity` (global check)
- **Cache Key:** `account_activity-data`
- **תלויות:** 
  - `accounts-data`
  - `cash_flows-data`
  - `executions-data`

### מהמבנה:
- **מקורות נתונים:**
  1. **Cash Flows** (תזרימי מזומנים) - תנועות כספיות
  2. **Executions** (ביצועים) - ביצועי טריידים
  3. **Trades** (טריידים) - ייתכן שגם כאן

---

## 🔎 מה צריך לחפש

### 1. מבנה Cash Flows (תזרימי מזומנים)

**מהקוד הלגסי (`data-basic.js`):**
```javascript
'cash_flows': [
  'trading_account_id',    // 0 - Account (חשבון)
  'type',                  // 1 - Type (סוג)
  'amount',                // 2 - Amount (סכום)
  'date',                  // 3 - Date (תאריך)
  'description',           // 4 - Description (תיאור)
  'source',                // 5 - Source (מקור)
  'currency_id',           // 6 - Currency ID
  'usd_rate',              // 7 - USD Rate
  'external_id',           // 8 - External ID
  'created_at',            // 9 - Created At
  'id',                    // 10 - ID
]
```

**סוגי תנועות אפשריים:**
- הפקדה (Deposit)
- משיכה (Withdrawal)
- העברה (Transfer)
- דיבידנד (Dividend)
- ריבית (Interest)
- עמלות (Fees)

### 2. מבנה Executions (ביצועים)

**מהקוד הלגסי (`data-basic.js`):**
```javascript
'executions': [
  'id',                    // 0 - ID
  'trade_id',              // 1 - Trade ID
  'action',                // 2 - Action
  'date',                  // 3 - Date
  'quantity',              // 4 - Quantity
  'price',                 // 5 - Price
  'fee',                   // 6 - Fee
  'source',                // 7 - Source
  'created_at',            // 8 - Created At
  'external_id',          // 9 - External ID
  'notes',                 // 10 - Notes
]
```

**סוגי פעולות:**
- קנייה (Buy)
- מכירה (Sell)
- דיבידנד (Dividend)
- ריבית (Interest)

### 3. מבנה משולב (Account Activity)

**השערה:** Container 2 אמור להציג סיכום של כל התנועות בחשבון, כולל:
- תזרימי מזומנים (Cash Flows)
- ביצועי טריידים (Executions)
- אולי גם טריידים (Trades)

**שדות משותפים:**
- תאריך
- סוג תנועה
- סכום
- מטבע
- יתרה אחרי התנועה
- קישור לפריט המקור

---

## 🎯 מה צריך לעשות

### שלב 1: חיפוש בקוד הלגסי
1. ✅ מצא את `account-activity.js` (אם קיים)
2. ✅ מצא את כל הפונקציות שמטפלות ב-`accountActivityContainer`
3. ✅ מצא את כל הפונקציות שמשלבות cash flows + executions
4. ✅ מצא את כל הפונקציות שמחשבות יתרה שוטפת

### שלב 2: ניתוח מבנה הנתונים
1. ✅ בדוק איך משלבים cash flows + executions
2. ✅ בדוק איך מחשבים יתרה שוטפת
3. ✅ בדוק איך ממיינים לפי תאריך
4. ✅ בדוק איך מסננים לפי חשבון

### שלב 3: ניתוח UI
1. ✅ בדוק אם יש טבלה או מבנה אחר
2. ✅ בדוק אם יש פילטרים פנימיים
3. ✅ בדוק אם יש סיכומים/סה"כ
4. ✅ בדוק אם יש קישורים לפריטים

---

## 📋 שאלות לבדיקה

1. **מה המבנה בפועל?**
   - טבלה אחת עם כל התנועות?
   - שתי טבלאות נפרדות (cash flows + executions)?
   - מבנה אחר (cards, timeline, וכו')?

2. **איך מחשבים יתרה שוטפת?**
   - מצטבר לפי תאריך?
   - לפי סדר יצירה?
   - לפי סוג תנועה?

3. **איך ממיינים?**
   - לפי תאריך (הכי חדש ראשון)?
   - לפי סוג תנועה?
   - לפי סכום?

4. **איך מסננים?**
   - לפי חשבון?
   - לפי טווח תאריכים?
   - לפי סוג תנועה?

5. **מה יש בסיכום?**
   - סה"כ הפקדות?
   - סה"כ משיכות?
   - סה"כ ביצועים?
   - יתרה נוכחית?

---

## 🔧 כלים לבדיקה

### 1. חיפוש בקוד הלגסי
```bash
# חיפוש account-activity
grep -r "account.*activity\|accountActivity" _COMMUNICATION/Legace_html_for_blueprint/

# חיפוש cash flows + executions
grep -r "cash.*flow.*execution\|execution.*cash" _COMMUNICATION/Legace_html_for_blueprint/

# חיפוש יתרה שוטפת
grep -r "balance.*current\|current.*balance\|יתרה.*שוטפת" _COMMUNICATION/Legace_html_for_blueprint/
```

### 2. בדיקה ב-DOM
- פתח את הדפדפן ב-`http://127.0.0.1:8090/trading_accounts`
- בדוק את ה-HTML של `accountActivityContainer`
- בדוק את ה-JavaScript שמטפל בו

### 3. בדיקה ב-API
- בדוק את ה-endpoints של cash flows
- בדוק את ה-endpoints של executions
- בדוק אם יש endpoint משולב

---

## 📝 הערות

1. **הקונטיינר לא עובד בלגסי** - ייתכן שהקוד לא שלם או שיש באג
2. **דרוש שיחזור** - צריך לבנות מחדש לפי מה שיש
3. **מקורות נתונים ברורים** - cash flows + executions
4. **דרוש עיצוב חדש** - לא בטבלה רגילה

---

**סטטוס:** 🔍 **IN PROGRESS - NEEDS DEEP INVESTIGATION**
