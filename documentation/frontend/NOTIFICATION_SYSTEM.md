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

## 💬 מערכת הודעות (Notification System)

### הגדרה
מערכת הודעות מערכת להעברת מידע למשתמש על פעולות שבוצעו או שגיאות.

### מינוחים בעברית
- **הודעה** (Notification) - הודעת מערכת למשתמש
- **הודעת הצלחה** (Success Notification) - הודעה על פעולה שהצליחה
- **הודעת שגיאה** (Error Notification) - הודעה על שגיאה
- **הודעת אזהרה** (Warning Notification) - הודעה על בעיה אפשרית
- **הודעת מידע** (Info Notification) - הודעת מידע כללית
- **הודעת מחיקה** (Delete Notification) - הודעה על מחיקה מוצלחת
- **הודעת שמירה** (Save Notification) - הודעה על שמירה מוצלחת

### סוגי הודעות
```javascript
// הודעת הצלחה (ירוק)
window.showSuccessNotification('כותרת', 'הודעה')

// הודעת שגיאה (אדום)
window.showErrorNotification('כותרת', 'הודעה')

// הודעת אזהרה (כתום)
window.showWarningNotification('כותרת', 'הודעה')

// הודעת מידע (כחול)
window.showInfoNotification('כותרת', 'הודעה')
```

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
window.showLinkedItemsWarning('ticker', 5, onConfirm, onCancel)

// אזהרת אימות
window.showValidationWarning('מחיר', 'ערך חייב להיות מספר חיובי')
```

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

---

## 🚫 מה לא לעשות

### ❌ שגוי
```javascript
// אל תשתמש ב-alert() רגיל
alert('התראה נשמרה');

// אל תשתמש ב-confirm() רגיל
confirm('האם למחוק?');
```

### ✅ נכון
```javascript
// השתמש במערכת ההודעות
window.showSuccessNotification('התראה נשמרה', 'התראה נשמרה בהצלחה!');

// השתמש במערכת האזהרות
window.showDeleteWarning('alert', 'התראה על AAPL', onConfirm);
```

---

## 📚 קישורים נוספים

- [JavaScript Architecture](./JAVASCRIPT_ARCHITECTURE.md)
- [Function Naming](./FUNCTION_NAMING.md)
- [UI Utils Documentation](./ui-utils.md)
- [Task List Basic Pages Check 2](../todo/TASK_LIST_BASIC_PAGES_CHECK_2.md)
