# מערכת התראות והודעות - TikTrack

## 📋 סקירה כללית

במערכת TikTrack קיימות שתי מערכות נפרדות להעברת מידע למשתמש:

1. **מערכת התראות (Alerts System)** - התראות עסקיות על תנאי שוק
2. **מערכת הודעות (Notification System)** - הודעות מערכת למשתמש

---

## 🚨 מערכת התראות (Alerts System)

### הגדרה
מערכת התראות עסקיות המתריעה על תנאי שוק ספציפיים (מחיר, שינוי, נפח וכו').

### מינוחים בעברית
- **התראה** (Alert) - התראה עסקית על תנאי שוק
- **תנאי התראה** (Alert Condition) - התנאי שמופעל ההתראה
- **אופרטור התראה** (Alert Operator) - סימן חשבונאי (>, <, =, וכו')
- **תכונת התראה** (Alert Attribute) - המאפיין הנבדק (מחיר, שינוי, נפח)
- **ערך התראה** (Alert Value) - הערך הסף להפעלת ההתראה
- **התראה מופעלת** (Triggered Alert) - התראה שתנאיה התקיימו
- **התראה פתוחה** (Open Alert) - התראה פעילה שעדיין לא הופעלה
- **התראה סגורה** (Closed Alert) - התראה שבוטלה או הושלמה

### פונקציות מערכת התראות
```javascript
// יצירת התראה חדשה
createAlert(alertData)

// מחיקת התראה
deleteAlert(alertId)

// עדכון התראה
updateAlert(alertId, alertData)

// סימון התראה כמופעלת
markAlertAsTriggered(alertId)

// סימון התראה כנקראה
markAlertAsRead(alertId)
```

### דוגמאות התראות
- "מחיר AAPL > 150.00"
- "שינוי QQQ > 5.00%"
- "נפח MSFT > 1,000,000"

---

## 💬 מערכת הודעות (Notification System) - **VERSION 2.0 GLOBAL SYSTEM**

### הגדרה
מערכת הודעות מערכת גלובלית להעברת מידע למשתמש על פעולות שבוצעו או שגיאות. **כל העמודים משתמשים במערכת הגלובלית.**

### מינוחים בעברית
- **הודעה** (Notification) - הודעת מערכת למשתמש
- **הודעת הצלחה** (Success Notification) - הודעה על פעולה שהצליחה
- **הודעת שגיאה** (Error Notification) - הודעה על שגיאה
- **הודעת אזהרה** (Warning Notification) - הודעה על בעיה אפשרית
- **הודעת מידע** (Info Notification) - הודעת מידע כללית
- **הודעת מחיקה** (Delete Notification) - הודעה על מחיקה מוצלחת
- **הודעת שמירה** (Save Notification) - הודעה על שמירה מוצלחת

### סוגי הודעות - **מערכת גלובלית**
```javascript
// הודעת הצלחה (ירוק)
window.showSuccessNotification('כותרת', 'הודעה')

// הודעת שגיאה (אדום)
window.showErrorNotification('כותרת', 'הודעה')

// הודעת אזהרה (כתום)
window.showWarningNotification('כותרת', 'הודעה')

// הודעת מידע (כחול)
window.showInfoNotification('כותרת', 'הודעה')

// הודעת מחיקה (אדום עם אישור)
window.showDeleteWarning('כותרת', 'הודעה', callback)

// הודעת אישור (כחול עם אישור)
window.showConfirmationDialog('כותרת', 'הודעה', callback)
```

### **מערכת גלובלית - כל העמודים:**
- ✅ **accounts.js** - מערכת התראות גלובלית
- ✅ **trades.js** - מערכת התראות גלובלית
- ✅ **trade_plans.js** - מערכת התראות גלובלית
- ✅ **executions.js** - מערכת התראות גלובלית
- ✅ **cash_flows.js** - מערכת התראות גלובלית
- ✅ **alerts.js** - מערכת התראות גלובלית
- ✅ **tickers.js** - מערכת התראות גלובלית
- ✅ **db-extradata.js** - מערכת התראות גלובלית

### דוגמאות הודעות
- **הצלחה**: "התראה נשמרה", "חשבון עודכן בהצלחה"
- **שגיאה**: "שגיאה בטעינת נתונים", "לא ניתן למחוק פריט"
- **אזהרה**: "פריט מקושר לא ניתן למחיקה"
- **מידע**: "המערכת מתעדכנת", "נדרשת אישור נוסף"

---

## ⚠️ מערכת אזהרות (Warning System)

### הגדרה
מערכת אזהרות לאישור פעולות מסוכנות או חשובות.

### מינוחים בעברית
- **אזהרה** (Warning) - אזהרה לאישור פעולה
- **אזהרת מחיקה** (Delete Warning) - אישור מחיקת פריט
- **אזהרת פריטים מקושרים** (Linked Items Warning) - אזהרה על פריטים מקושרים
- **אזהרת אימות** (Validation Warning) - אזהרה על שגיאת אימות

### פונקציות אזהרות
```javascript
// אזהרת מחיקה
window.showDeleteWarning('alert', 'התראה על AAPL', onConfirm, onCancel)

// אזהרת פריטים מקושרים
window.showLinkedItemsWarning('account', 5, onConfirm, onCancel)

// אזהרת אימות
window.showValidationWarning('מחיר', 'ערך חייב להיות מספר חיובי')
```

---

## 🔗 מערכת פריטים מקושרים (Linked Items System)

### הגדרה
מערכת לבדיקה והצגת אזהרות על פריטים מקושרים לפני מחיקה או ביטול.

### פונקציות מערכת מקושרים
```javascript
// בדיקת פריטים מקושרים לחשבון
getLinkedItemsForAccount(accountId)

// הצגת אזהרת פריטים מקושרים
window.showLinkedItemsWarning('account', linkedCount, onConfirm, onCancel)

// יצירת modal אזהרת פריטים מקושרים
createLinkedItemsWarningModal(itemTypeDisplay, linkedCount, onConfirm, onCancel)
```

### סוגי פריטים מקושרים
- **טריידים** (Trades) - טריידים מקושרים לחשבון
- **תזרימי מזומנים** (Cash Flows) - תזרימי מזומנים מקושרים לחשבון
- **התראות** (Alerts) - התראות מקושרות לטיקר
- **הערות** (Notes) - הערות מקושרות לפריט

### מבנה נתוני פריטים מקושרים
```javascript
const linkedItems = [
  {
    type: 'trade',
    id: 1,
    name: 'AAPL Long',
    description: 'טרייד AAPL'
  },
  {
    type: 'cash_flow',
    id: 5,
    name: 'deposit 750.0',
    description: 'תזרים מזומנים deposit'
  }
];
```

### זרימת עבודה עם פריטים מקושרים
1. **בדיקה**: `getLinkedItemsForAccount(accountId)` - בודקת פריטים מקושרים
2. **הצגת אזהרה**: `showLinkedItemsWarning()` - מציגה modal אזהרה
3. **אישור**: המשתמש לוחץ "המשך למחיקה"
4. **המשך**: המערכת ממשיכה לפעולה המקורית (מחיקה/ביטול)

---

## 🎨 עיצוב המערכות

### מערכת הודעות
- **מיקום**: פינה ימנית עליונה
- **שקיפות**: 50% שקוף (`rgba(255, 255, 255, 0.5)`)
- **אנימציה**: כניסה מהימן, יציאה איטית
- **זמן הצגה**: 4-6 שניות (תלוי בסוג)

### מערכת אזהרות
- **מיקום**: מרכז המסך (Modal)
- **עיצוב**: Bootstrap Modal עם כותרת צבעונית
- **כפתורים**: "ביטול" ו"אישור"/"מחק"
- **רקע**: כהה עם blur

### אזהרת פריטים מקושרים
- **כותרת**: "אזהרת פריטים מקושרים" (צהוב)
- **תוכן**: "חשבון זה מקושר ל-5 פריטים במערכת"
- **כפתורים**: "ביטול" (אפור) ו"המשך למחיקה" (צהוב)
- **איקון**: אזהרה (exclamation-triangle)

---

## 🔧 שימוש נכון במערכות

### מתי להשתמש במערכת התראות
- התראות על תנאי שוק
- התראות על שינויים במחירים
- התראות על נפח מסחר
- התראות על שינויים בחשבונות

### מתי להשתמש במערכת הודעות
- אישור פעולות (שמירה, עדכון, מחיקה)
- שגיאות מערכת
- מידע על תהליכים
- עדכונים על מצב המערכת

### מתי להשתמש במערכת אזהרות
- אישור מחיקת פריטים
- אזהרות על פריטים מקושרים
- שגיאות אימות קריטיות
- פעולות בלתי הפיכות

### מתי להשתמש במערכת פריטים מקושרים
- לפני מחיקת חשבון עם טריידים
- לפני ביטול חשבון עם תזרימי מזומנים
- לפני מחיקת טיקר עם התראות
- כל פעולה שעלולה להשפיע על פריטים מקושרים

---

## 📝 דוגמאות קוד

### יצירת התראה חדשה
```javascript
// יצירת התראה עסקית
const alertData = {
    related_type_id: 1, // ticker
    related_id: 5, // AAPL
    condition_attribute: 'price',
    condition_operator: 'more_than',
    condition_number: 150.00
};

createAlert(alertData);
// התוצאה: התראה על מחיר AAPL > 150.00
```

### הצגת הודעת הצלחה
```javascript
// הודעת הצלחה על שמירת התראה
window.showSuccessNotification('התראה נשמרה', 'התראה נשמרה בהצלחה!');
```

### הצגת אזהרת מחיקה
```javascript
// אזהרת מחיקת התראה
window.showDeleteWarning('alert', 'התראה על AAPL', () => {
    deleteAlert(alertId);
    window.showSuccessNotification('התראה נמחקה', 'התראה נמחקה בהצלחה!');
});
```

### בדיקת פריטים מקושרים
```javascript
// בדיקת פריטים מקושרים לחשבון
async function checkLinkedItemsBeforeDelete(accountId) {
  const linkedItems = await getLinkedItemsForAccount(accountId);
  
  if (linkedItems && linkedItems.length > 0) {
    // יש פריטים מקושרים - הצגת אזהרה
    window.showLinkedItemsWarning('account', linkedItems.length,
      () => {
        // המשתמש אישר - המשך למחיקה
        performAccountDeletion(accountId);
      },
      () => {
        // המשתמש ביטל
        console.log('User cancelled deletion');
      }
    );
  } else {
    // אין פריטים מקושרים - מחיקה ישירה
    performAccountDeletion(accountId);
  }
}
```

### מחיקת חשבון עם מקושרים
```javascript
// זרימה מלאה של מחיקת חשבון
function deleteAccount(accountId) {
  const account = window.accountsData?.find(acc => acc.id === accountId);
  if (account) {
    checkLinkedItemsBeforeDeleteModal(account);
  }
}

async function checkLinkedItemsBeforeDeleteModal(account) {
  const linkedItems = await getLinkedItemsForAccount(account.id);
  
  if (linkedItems && linkedItems.length > 0) {
    // יש מקושרים - הצגת אזהרה
    window.showLinkedItemsWarning('account', linkedItems.length,
      () => {
        // המשתמש אישר - הצגת modal מחיקה
        createCustomDeleteModal(account);
      },
      () => {
        // המשתמש ביטל
        console.log('User cancelled linked items warning');
      }
    );
  } else {
    // אין מקושרים - הצגת modal מחיקה ישירות
    createCustomDeleteModal(account);
  }
}
```

---

## 🚫 מה לא לעשות

### ❌ שגוי
```javascript
// אל תשתמש ב-alert() רגיל
alert('התראה נשמרה');

// אל תשתמש ב-confirm() רגיל
confirm('האם למחוק?');

// אל תציג הודעת מקושרים כהתראה רגילה
window.showWarningNotification('פריטים מקושרים', 'יש 5 פריטים מקושרים');
```

### ✅ נכון
```javascript
// השתמש במערכת ההודעות
window.showSuccessNotification('התראה נשמרה', 'התראה נשמרה בהצלחה!');

// השתמש במערכת האזהרות
window.showDeleteWarning('alert', 'התראה על AAPL', onConfirm);

// השתמש במערכת פריטים מקושרים
window.showLinkedItemsWarning('account', 5, onConfirm, onCancel);
```

---

## 🔍 פתרון בעיות

### בעיות נפוצות במערכת פריטים מקושרים

#### 1. אזהרת מקושרים לא מוצגת
**סיבה**: הפונקציה `getLinkedItemsForAccount` לא מחזירה נתונים נכונים
**פתרון**: 
```javascript
// הוספת לוגים לבדיקה
console.log('🚀 Trades data:', tradesData);
console.log('🚀 Cash flows data:', cashFlowsData);
console.log('🚀 Linked items:', linkedItems);
```

#### 2. Modal לא נפתח
**סיבה**: Bootstrap לא זמין או שגיאה ב-HTML
**פתרון**:
```javascript
// בדיקת זמינות Bootstrap
console.log('🔧 Bootstrap available:', typeof bootstrap !== 'undefined');
console.log('🔧 Modal element:', modal);
```

#### 3. פונקציה לא זמינה
**סיבה**: הקובץ `ui-utils.js` לא נטען
**פתרון**: וודא שהקובץ נטען לפני `accounts.js`
```html
<script src="scripts/ui-utils.js"></script>
<script src="scripts/accounts.js"></script>
```

### בדיקת זמינות פונקציות
```javascript
// בדיקת זמינות פונקציות
console.log('showLinkedItemsWarning:', typeof window.showLinkedItemsWarning);
console.log('createLinkedItemsWarningModal:', typeof createLinkedItemsWarningModal);
console.log('getLinkedItemsForAccount:', typeof getLinkedItemsForAccount);
```

---

## 📚 קישורים נוספים

- [JavaScript Architecture](./JAVASCRIPT_ARCHITECTURE.md)
- [Function Naming](./FUNCTION_NAMING.md)
- [UI Utils Documentation](./ui-utils.md)
- [Task List Basic Pages Check 2](../todo/TASK_LIST_BASIC_PAGES_CHECK_2.md)
- [Linked Items System](./LINKED_ITEMS_SYSTEM.md)

---

## 🔄 עדכונים אחרונים

### עדכון 2025-08-26
- הוספת מערכת פריטים מקושרים מלאה
- תיקון זרימת מחיקת חשבונות עם מקושרים
- הוספת לוגים מפורטים לדיבוג
- תיקון עיצוב כפתור ביטול (X אדום)
- הוספת fallback למקרה של שגיאות Bootstrap

### שינויים בפונקציות
- `deleteAccount()` - עכשיו קוראת ל-`checkLinkedItemsBeforeDeleteModal()`
- `checkLinkedItemsBeforeDeleteModal()` - פונקציה חדשה לבדיקת מקושרים
- `getLinkedItemsForAccount()` - תוקנה לטפל במבנה נתונים נכון
- `showLinkedItemsWarning()` - תוקנה להציג modal נכון
