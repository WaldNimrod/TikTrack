# 🔍 ניתוח מקיף: Container 2 - סיכום תנועות בחשבון

**תאריך:** 2026-02-01  
**סטטוס:** ⚠️ דורש שיחזור - לא עובד בלגסי  
**מטרה:** לחלץ את כל המידע הזמין מהלגסי כדי לבנות מחדש

---

## 📊 סיכום מהידוע

### מהסריקה הישירה:
- **Container:** "סיכום תנועות בחשבון"
- **טבלאות:** 0 טבלאות נמצאו (תוכן נוצר דינמית או לא עובד)
- **מיקום:** בין Container 1 (ניהול חשבונות) ל-Container 3 (דף חשבון לתאריכים)

### מהקוד הלגסי:

#### 1. Container ID
- **ID:** `accountActivityContainer` (לפי `header-system.js`)

#### 2. קובץ JavaScript
- **קובץ:** `scripts/account-activity.js`
- **פונקציה גלובלית:** `window.initAccountActivity`
- **מיקום:** מוזכר ב-`package-manifest.js` אבל לא נמצא בקבצים הזמינים

#### 3. Cache & Data Dependencies
**Cache Key:** `account_activity-data`

**תלויות:**
- `accounts-data` - נתוני חשבונות מסחר
- `cash_flows-data` - נתוני תזרימי מזומנים
- `executions-data` - נתוני ביצועי טריידים

**Cache Sync Events:**
- `execution-created` → משפיע על `account_activity-data`
- `execution-updated` → משפיע על `account_activity-data`
- `execution-deleted` → משפיע על `account_activity-data`
- `cash-flow-created` → משפיע על `account_activity-data`
- `cash-flow-updated` → משפיע על `account_activity-data`
- `cash-flow-deleted` → משפיע על `account_activity-data`

#### 4. AccountActivityService
**מוזכר ב-`data-basic.js`:**
```javascript
// 'cash_balance' removed - calculated in real-time via AccountActivityService
```

**השערה:** יש שירות שמחשב יתרה שוטפת בזמן אמת על בסיס תזרימי מזומנים וביצועים.

---

## 📋 מבנה הנתונים

### 1. Cash Flows (תזרימי מזומנים)

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

**מהתיעוד (WP_20_08_FIELD_MAP_CASH_FLOWS.md):**
- `internal_ids` - PK פנימי
- `external_ulids` - ULID חיצוני
- `trading_account_ids` - מזהה חשבון מסחר
- `transaction_amounts` - סכום התנועה (NUMERIC(20, 8))

**סוגי תנועות אפשריים:**
- הפקדה (Deposit)
- משיכה (Withdrawal)
- העברה (Transfer)
- דיבידנד (Dividend)
- ריבית (Interest)
- עמלות (Fees)

### 2. Executions (ביצועים)

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
  'external_id',           // 9 - External ID
  'notes',                 // 10 - Notes
]
```

**סוגי פעולות:**
- קנייה (Buy) - יוצר תנועה שלילית (משיכת כסף)
- מכירה (Sell) - יוצר תנועה חיובית (הפקדת כסף)
- דיבידנד (Dividend) - יוצר תנועה חיובית
- ריבית (Interest) - יוצר תנועה חיובית

---

## 🎯 השערות על המבנה

### השערה 1: טבלה משולבת אחת
**מבנה:** טבלה אחת שמציגה את כל התנועות (cash flows + executions) יחד, ממוינות לפי תאריך.

**שדות משותפים:**
- תאריך
- סוג תנועה (type/action)
- תת-סוג (subtype - אם רלוונטי)
- טיקר (אם רלוונטי - רק ב-executions)
- סכום
- מטבע
- יתרה שוטפת (running balance)
- קישור לפריט המקור

**דוגמה:**
| תאריך | סוג | תת-סוג | טיקר | סכום | מטבע | יתרה שוטפת | פעולות |
|-------|-----|--------|------|------|------|-------------|--------|
| 01/02/2026 | הפקדה | העברה בנקאית | - | +$5,000.00 | USD | $142,500.42 | צפה |
| 31/01/2026 | ביצוע | מכירה | AAPL | +$15,575.00 | USD | $137,500.42 | צפה |
| 31/01/2026 | ביצוע | קנייה | TSLA | -$10,000.00 | USD | $121,925.42 | צפה |

### השערה 2: שתי טבלאות נפרדות
**מבנה:** שתי טבלאות - אחת ל-cash flows ואחת ל-executions.

**טבלה 1: תזרימי מזומנים**
- תאריך
- סוג תנועה
- סכום
- מטבע
- יתרה שוטפת
- פעולות

**טבלה 2: ביצועי טריידים**
- תאריך
- פעולה (קנייה/מכירה)
- טיקר
- כמות
- מחיר
- סכום כולל
- עמלה
- יתרה שוטפת
- פעולות

### השערה 3: מבנה Timeline/Cards
**מבנה:** לא טבלה אלא מבנה ויזואלי אחר (timeline, cards, וכו').

---

## 🔧 מה צריך לבדוק

### 1. בדיקת HTML
- פתח את `http://127.0.0.1:8090/trading_accounts`
- בדוק את ה-HTML של `accountActivityContainer`
- בדוק אם יש טבלה, cards, או מבנה אחר
- בדוק אם יש פילטרים פנימיים

### 2. בדיקת JavaScript
- חפש את `account-activity.js` בשרת הלגסי
- בדוק את `window.initAccountActivity`
- בדוק איך משלבים cash flows + executions
- בדוק איך מחשבים יתרה שוטפת

### 3. בדיקת API
- בדוק את `/api/cash_flows/` endpoint
- בדוק את `/api/executions/` endpoint
- בדוק אם יש `/api/account_activity/` endpoint משולב

### 4. בדיקת Data Structure
- בדוק את המבנה של cash flows data
- בדוק את המבנה של executions data
- בדוק איך הם מתחברים

---

## 📝 המלצות לביצוע

### שלב 1: איסוף מידע
1. ✅ בדוק את ה-HTML בפועל בלגסי
2. ✅ בדוק את ה-JavaScript בפועל בלגסי
3. ✅ בדוק את ה-API endpoints
4. ✅ בדוק את מבנה הנתונים

### שלב 2: ניתוח
1. ✅ זהה את המבנה בפועל
2. ✅ זהה את השדות הנדרשים
3. ✅ זהה את הלוגיקה של חישוב יתרה
4. ✅ זהה את הפילטרים הנדרשים

### שלב 3: תכנון
1. ✅ תכנן את המבנה החדש
2. ✅ תכנן את הלוגיקה של שילוב נתונים
3. ✅ תכנן את הלוגיקה של חישוב יתרה
4. ✅ תכנן את הפילטרים

### שלב 4: יישום
1. ✅ בנה את המבנה החדש
2. ✅ בנה את הלוגיקה של שילוב נתונים
3. ✅ בנה את הלוגיקה של חישוב יתרה
4. ✅ בנה את הפילטרים

---

## 🎨 עיצוב מוצע

### אופציה 1: טבלה משולבת (מומלץ)
- טבלה אחת עם כל התנועות
- מיון לפי תאריך (הכי חדש ראשון)
- פילטרים: חשבון, טווח תאריכים, סוג תנועה
- סיכום: סה"כ הפקדות, סה"כ משיכות, יתרה נוכחית

### אופציה 2: שתי טבלאות
- טבלה 1: תזרימי מזומנים
- טבלה 2: ביצועי טריידים
- כל טבלה עם פילטרים נפרדים
- סיכום משותף

### אופציה 3: Timeline View
- מבנה ויזואלי של timeline
- כל תנועה כפריט ב-timeline
- פילטרים וסיכום

---

## ✅ Checklist

- [ ] בדיקת HTML בפועל בלגסי
- [ ] בדיקת JavaScript בפועל בלגסי
- [ ] בדיקת API endpoints
- [ ] בדיקת מבנה הנתונים
- [ ] זיהוי המבנה בפועל
- [ ] זיהוי השדות הנדרשים
- [ ] זיהוי הלוגיקה של חישוב יתרה
- [ ] זיהוי הפילטרים הנדרשים
- [ ] תכנון המבנה החדש
- [ ] תכנון הלוגיקה
- [ ] יישום המבנה החדש

---

**סטטוס:** 🔍 **NEEDS USER INPUT - AWAITING INSPECTION RESULTS**
