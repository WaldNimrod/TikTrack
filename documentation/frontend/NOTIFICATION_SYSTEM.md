# מערכת התראות והודעות - TikTrack

## 📅 תאריך עדכון
31 באוגוסט 2025

## 🎯 מטרת הדוקומנטציה
תיעוד מדויק של מערכת ההתראות וההודעות, כולל פונקציות זמינות, סדר פרמטרים, ודרך הקריאה הנכונה לכל פונקציה.

## 📁 קבצים מרכזיים
- `trading-ui/scripts/notification-system.js` - מערכת ההתראות הראשית
- `trading-ui/scripts/ui-utils.js` - פונקציות עזר למערכת ההתראות
- `trading-ui/styles/styles.css` - עיצוב ההתראות

## 🔧 פונקציות זמינות

### **1. פונקציות התראות בסיסיות**

#### **`window.showNotification(message, type, title, duration)`**
**תיאור**: פונקציה בסיסית להצגת התראה
**פרמטרים**:
- `message` (string) - תוכן ההודעה
- `type` (string) - סוג ההתראה: 'success', 'error', 'warning', 'info'
- `title` (string) - כותרת ההתראה (ברירת מחדל: 'התראה')
- `duration` (number) - משך הצגה במילישניות (ברירת מחדל: 4000)

**דוגמה**:
```javascript
window.showNotification('הנתונים נשמרו בהצלחה', 'success', 'הצלחה', 5000);
```

#### **`window.showSuccessNotification(title, message, duration)`**
**תיאור**: התראה ירוקה להצלחה
**פרמטרים**:
- `title` (string) - כותרת ההתראה
- `message` (string) - תוכן ההודעה
- `duration` (number) - משך הצגה (ברירת מחדל: 4000)

**דוגמה**:
```javascript
window.showSuccessNotification('הצלחה', 'מטבע נוסף בהצלחה למערכת');
```

#### **`window.showErrorNotification(title, message, duration)`**
**תיאור**: התראה אדומה לשגיאה
**פרמטרים**:
- `title` (string) - כותרת ההתראה
- `message` (string) - תוכן ההודעה
- `duration` (number) - משך הצגה (ברירת מחדל: 6000)

**דוגמה**:
```javascript
window.showErrorNotification('שגיאה', 'שגיאה בשמירת המטבע');
```

#### **`window.showWarningNotification(title, message, duration)`**
**תיאור**: התראה כתומה לאזהרה
**פרמטרים**:
- `title` (string) - כותרת ההתראה
- `message` (string) - תוכן ההודעה
- `duration` (number) - משך הצגה (ברירת מחדל: 5000)

**דוגמה**:
```javascript
window.showWarningNotification('אזהרה', 'המטבע כבר קיים במערכת');
```

#### **`window.showInfoNotification(title, message, duration)`**
**תיאור**: התראה כחולה למידע
**פרמטרים**:
- `title` (string) - כותרת ההתראה
- `message` (string) - תוכן ההודעה
- `duration` (number) - משך הצגה (ברירת מחדל: 4000)

**דוגמה**:
```javascript
window.showInfoNotification('מידע', 'המערכת מתעדכנת...');
```

### **2. פונקציות וולידציה**

#### **`window.showValidationWarning(fieldId, message, duration)`**
**תיאור**: התראה אדומה עם סימון שדה ספציפי
**פרמטרים**:
- `fieldId` (string) - מזהה השדה הבעייתי
- `message` (string) - הודעת השגיאה
- `duration` (number) - משך הצגה (ברירת מחדל: 6000)

**תכונות**:
- מציג התראה אדומה
- מסמן את השדה הבעייתי באדום
- מגליל לשדה הבעייתי
- מסיר את הסימון אחרי 3 שניות

**דוגמה**:
```javascript
window.showValidationWarning('currencyName', 'שם המטבע הוא שדה חובה');
```

### **3. פונקציות אישור ומחיקה**

#### **`window.showDeleteWarning(itemType, itemId, displayName, onConfirm, onCancel)`**
**תיאור**: חלון אישור אדום למחיקה
**פרמטרים**:
- `itemType` (string) - סוג הפריט (למשל: 'currency', 'account')
- `itemId` (string/number) - מזהה הפריט
- `displayName` (string) - שם הפריט להצגה
- `onConfirm` (function) - פונקציה לביצוע המחיקה
- `onCancel` (function) - פונקציה לביטול (אופציונלי)

**תכונות**:
- חלון מודל אדום עם `data-bs-backdrop="static"`
- כותרת: "מחיקת [סוג פריט]"
- תוכן: "האם אתה בטוח שברצונך למחוק את [שם פריט]?"
- כפתורים: "מחק" (אדום) ו"ביטול"

**דוגמה**:
```javascript
window.showDeleteWarning('currency', 'USD', 'דולר אמריקאי', 
    () => deleteCurrency('USD'),
    () => console.log('מחיקה בוטלה')
);
```

#### **`window.showConfirmationDialog(title, message, onConfirm, onCancel)`**
**תיאור**: חלון אישור כללי
**פרמטרים**:
- `title` (string) - כותרת החלון
- `message` (string) - תוכן ההודעה
- `onConfirm` (function) - פונקציה לאישור
- `onCancel` (function) - פונקציה לביטול (אופציונלי)

**דוגמה**:
```javascript
window.showConfirmationDialog('אישור פעולה', 'האם אתה בטוח?', 
    () => performAction(),
    () => console.log('פעולה בוטלה')
);
```

## 🚫 הודעות שלא להשתמש בהן

### **אל תשתמש ב:**
- `alert()` - השתמש ב-`window.showErrorNotification` או `window.showInfoNotification`
- `confirm()` - השתמש ב-`window.showConfirmationDialog` או `window.showDeleteWarning`

### **דוגמאות להחלפה:**

#### **לפני (לא נכון):**
```javascript
// ❌ לא להשתמש
alert('שגיאה: מערכת התראות לא זמינה');
const confirmed = confirm('האם אתה בטוח שברצונך למחוק?');
```

#### **אחרי (נכון):**
```javascript
// ✅ השתמש בזה
if (typeof window.showErrorNotification === 'function') {
  window.showErrorNotification('שגיאה', 'מערכת התראות לא זמינה');
} else {
  console.error('מערכת התראות לא זמינה');
}

// ✅ השתמש בזה
if (typeof window.showConfirmationDialog === 'function') {
  window.showConfirmationDialog(
    'אישור מחיקה',
    'האם אתה בטוח שברצונך למחוק?',
    () => deleteItem(),
    () => console.log('מחיקה בוטלה')
  );
} else {
  // Fallback למקרה שמערכת התראות לא זמינה
  const confirmed = confirm('האם אתה בטוח שברצונך למחוק?');
  if (confirmed) {
    deleteItem();
  }
}
```

## 🎨 עיצוב התראות

### **סגנונות CSS**
```css
/* רקע 80% שקיפות אחיד לכל סוגי ההתראות */
.notification {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
}

/* צבעי גבול שמאלי נכונים לכל סוג התראה */
.notification.success {
    border-left: 4px solid #28a745;
}

.notification.error {
    border-left: 4px solid #dc3545;
}

.notification.warning {
    border-left: 4px solid #ffc107;
}

.notification.info {
    border-left: 4px solid #17a2b8;
}
```

## 🔧 שימוש נכון במערכת

### **1. טעינת מערכת התראות**
**חובה** לכלול `notification-system.js` לפני קובץ העמוד:
```html
<script src="scripts/notification-system.js"></script>
<script src="scripts/[PAGE].js"></script>
```

### **2. בדיקת זמינות פונקציות**
```javascript
// תמיד לבדוק זמינות לפני שימוש
if (typeof window.showSuccessNotification === 'function') {
  window.showSuccessNotification('הצלחה', 'פעולה הושלמה בהצלחה');
} else {
  console.error('showSuccessNotification לא זמינה');
}
```

### **3. טיפול בשגיאות מהשרת**
```javascript
const result = await response.json();

if (response.ok && result.status === 'success') {
  window.showSuccessNotification('הצלחה', 'הפריט נשמר בהצלחה!');
} else {
  if (result.error && result.error.message) {
    window.showErrorNotification('שגיאה', result.error.message);
  } else {
    window.showErrorNotification('שגיאה', 'שגיאה לא ידועה');
  }
}
```

### **4. Fallback למקרה שמערכת התראות לא זמינה**
```javascript
// תמיד לספק fallback
if (typeof window.showConfirmationDialog === 'function') {
  window.showConfirmationDialog(
    'אישור פעולה',
    'האם אתה בטוח?',
    () => performAction(),
    () => console.log('פעולה בוטלה')
  );
} else {
  // Fallback למקרה שמערכת התראות לא זמינה
  const confirmed = confirm('האם אתה בטוח?');
  if (confirmed) {
    performAction();
  }
}
```

## 🚨 בעיות נפוצות ופתרונות

### **1. מערכת התראות לא זמינה**
**בעיה**: `window.showSuccessNotification is not a function`
**פתרון**: וידוא ש-`notification-system.js` נטען לפני קבצי העמוד

### **2. פרמטרים שגויים**
**בעיה**: הודעות מופיעות בצבע שגוי
**פתרון**: שימוש בסדר פרמטרים נכון: `(title, message, duration)`

### **3. התראות לא מופיעות**
**בעיה**: התראות לא מוצגות
**פתרון**: בדיקת זמינות פונקציות וטעינת קבצים

### **4. הודעות alert/confirm עדיין מופיעות**
**בעיה**: עדיין יש הודעות `alert()` או `confirm()` בקוד
**פתרון**: החלפת כל ההודעות במערכת ההתראות החדשה

## 📋 קריטריונים לבדיקה

> 📋 **כל הבדיקות הועברו ל**: [../../CENTRAL_TASKS_TODO.md](../../CENTRAL_TASKS_TODO.md)

## 🔄 שינויים אחרונים (31 באוגוסט 2025)

### **החלפת הודעות alert/confirm:**
- ✅ `alerts.js` - הוחלפו כל הודעות `alert()` ו-`confirm()`
- ✅ `trades.js` - הוחלפו כל הודעות `confirm()`
- ✅ `preferences.js` - הוחלפו כל הודעות `confirm()`
- ✅ `notes.js` - הוחלפו כל הודעות `confirm()`
- ✅ `trade_plans.js` - הוחלפו כל הודעות `confirm()`
- ✅ `cash_flows.js` - הוחלפו כל הודעות `confirm()`
- ✅ `constraint-manager.js` - הוחלפו כל הודעות `confirm()`
- ✅ `notification-system.js` - הוחלפו כל הודעות `confirm()`

### **הוספת Fallback:**
- כל הפונקציות כוללות fallback למקרה שמערכת התראות לא זמינה
- Fallback משתמש ב-`console.error` או `confirm()` רגיל
- הודעות ברורות על כך שזה fallback

### **עדכון דוקומנטציה:**
- הוספת סקשן "הודעות שלא להשתמש בהן"
- דוגמאות להחלפה נכונה
- הנחיות ל-Fallback
- עדכון תאריך עדכון
