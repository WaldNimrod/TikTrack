# מדריך פיתוח - TikTrack

## 📅 תאריך עדכון
31 באוגוסט 2025

## 🎯 מטרת הדוקומנטציה
מדריך מקיף לפיתוח במערכת TikTrack, כולל הנחיות קוד, מבנה פרויקט ותהליכי פיתוח.

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

## 🔧 מערכת התראות והודעות

### **טעינת מערכת התראות**
**חובה** לכלול `notification-system.js` לפני קובץ העמוד:
```html
<script src="scripts/notification-system.js"></script>
<script src="scripts/[PAGE].js"></script>
```

### **פונקציות זמינות:**
- `window.showSuccessNotification(title, message, duration)`
- `window.showErrorNotification(title, message, duration)`
- `window.showWarningNotification(title, message, duration)`
- `window.showInfoNotification(title, message, duration)`
- `window.showConfirmationDialog(title, message, onConfirm, onCancel)`
- `window.showDeleteWarning(itemType, itemId, displayName, onConfirm, onCancel)`

### **בדיקת זמינות פונקציות:**
```javascript
// תמיד לבדוק זמינות לפני שימוש
if (typeof window.showSuccessNotification === 'function') {
  window.showSuccessNotification('הצלחה', 'פעולה הושלמה בהצלחה');
} else {
  console.error('showSuccessNotification לא זמינה');
}
```

## 🔄 שינויים אחרונים (31 באוגוסט 2025)

### **החלפת הודעות alert/confirm:**
- ✅ `alerts.js` - הוחלפו כל הודעות `alert()` ו-`confirm()`
- ✅ `trades.js` - הוחלפו כל הודעות `confirm()`
- ✅ `preferences-v2.js` - הוחלפו כל הודעות `confirm()`
- ✅ `notes.js` - הוחלפו כל הודעות `confirm()`
- ✅ `trade_plans.js` - הוחלפו כל הודעות `confirm()`
- ✅ `cash_flows.js` - הוחלפו כל הודעות `confirm()`
- ✅ `constraint-manager.js` - הוחלפו כל הודעות `confirm()`
- ✅ `notification-system.js` - הוחלפו כל הודעות `confirm()`
- ✅ `header-system.js` - הוחלפו כל הודעות `alert()`
- ✅ `ui-utils.js` - הוחלפו כל הודעות `confirm()`

### **הוספת Fallback:**
- כל הפונקציות כוללות fallback למקרה שמערכת התראות לא זמינה
- Fallback משתמש ב-`console.error` או `confirm()` רגיל
- הודעות ברורות על כך שזה fallback

### **תיקון ניקוי קונסול:**
- הוספת `stopAutoClearConsole()` בטעינת הדף למניעת ניקוי אוטומטי
- וידוא שניקוי קונסול מתרחש רק אם המשתמש מפעיל במפורש

## 📋 הנחיות קוד

### **1. מבנה קבצים:**
- כל דף HTML צריך קובץ JS נפרד
- פונקציות ספציפיות לטבלאות בקבצים נפרדים

### **2. מערכת התראות:**
- תמיד לבדוק זמינות פונקציות לפני שימוש
- לספק fallback למקרה שמערכת התראות לא זמינה
- להשתמש בפונקציות המתאימות לכל סוג הודעה

### **3. ניהול קונסול:**
- לא לנקות קונסול אוטומטי בטעינת הדף
- להשתמש במערכת ההעדפות לניהול קונסול
- לספק שליטה מלאה למשתמש

## 📚 קישורים לדוקומנטציה
- [מערכת התראות](../frontend/NOTIFICATION_SYSTEM.md)
- [מדריך RTL](../RTL_HEBREW_GUIDE.md)
- [מדריך בדיקות](../testing/README.md)
