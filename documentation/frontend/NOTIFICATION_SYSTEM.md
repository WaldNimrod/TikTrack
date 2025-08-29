# מערכת ההתראות - TikTrack

## סקירה כללית

מערכת ההתראות של TikTrack מספקת פתרון מרכזי להצגת הודעות למשתמשים בממשק המשתמש. המערכת מחליפה את השימוש ב-`alert()` ו-`confirm()` הרגילים ומספקת חוויית משתמש עקבית ומקצועית.

## קבצים עיקריים

- **קובץ מערכת**: `trading-ui/scripts/notification-system.js`
- **תלויות**: `linked-items.js`, Bootstrap 5.3.0
- **גרסה**: 3.0
- **עדכון אחרון**: 29 באוגוסט 2025

## פונקציות עיקריות

### 1. הודעות הצלחה
```javascript
window.showSuccessNotification('כותרת', 'הודעה', משך_במילישניות);
```

**דוגמאות שימוש:**
```javascript
window.showSuccessNotification('הצלחה', 'עסקה נשמרה בהצלחה', 5000);
window.showSuccessNotification('שמירה הושלמה', 'הנתונים נשמרו במערכת');
```

### 2. הודעות שגיאה
```javascript
window.showErrorNotification('כותרת', 'הודעה', משך_במילישניות);
```

**דוגמאות שימוש:**
```javascript
window.showErrorNotification('שגיאה', 'שגיאה בשמירת הנתונים', 3000);
window.showErrorNotification('שגיאה', 'יש לתקן את השגיאות בטופס');
```

### 3. הודעות אזהרה
```javascript
window.showWarningNotification('כותרת', 'הודעה', משך_במילישניות);
```

**דוגמאות שימוש:**
```javascript
window.showWarningNotification('אזהרה', 'יש לבדוק את הנתונים');
window.showWarningNotification('אזהרה', 'הפעולה אינה ניתנת לביטול');
```

### 4. הודעות מידע
```javascript
window.showInfoNotification('כותרת', 'הודעה', משך_במילישניות);
```

**דוגמאות שימוש:**
```javascript
window.showInfoNotification('מידע', 'המערכת מתעדכנת', 2000);
window.showInfoNotification('מידע', 'הנתונים נטענים...');
```

### 5. הודעות ולידציה
```javascript
window.showValidationWarning('מזהה_שדה', 'הודעת שגיאה');
```

**דוגמאות שימוש:**
```javascript
window.showValidationWarning('addExecutionQuantity', 'כמות חייבת להיות חיובית');
window.showValidationWarning('addExecutionPrice', 'מחיר חייב להיות גדול מ-0');
```

### 6. דיאלוגי אישור
```javascript
window.showConfirmationDialog('כותרת', 'הודעה', פונקציית_אישור, פונקציית_ביטול);
```

**דוגמאות שימוש:**
```javascript
window.showConfirmationDialog(
    'אישור פעולה',
    'האם אתה בטוח שברצונך לבצע פעולה זו?',
    () => { console.log('אושר'); },
    () => { console.log('בוטל'); }
);
```

### 7. אזהרות מחיקה
```javascript
window.showDeleteWarning('סוג_פריט', 'מזהה_פריט', 'שם_תצוגה', פונקציית_אישור, פונקציית_ביטול);
```

**דוגמאות שימוש:**
```javascript
window.showDeleteWarning('executions', 8, 'עסקה', 
    async () => { await confirmDeleteExecution(8); },
    () => { console.log('מחיקה בוטלה'); }
);
```

### 8. אזהרות פריטים מקושרים
```javascript
window.showLinkedItemsWarning('סוג_פריט', מספר_פריטים_מקושרים, פונקציית_אישור, פונקציית_ביטול);
```

**דוגמאות שימוש:**
```javascript
window.showLinkedItemsWarning('חשבון', 5, 
    () => { console.log('מחיקה אושרה'); },
    () => { console.log('מחיקה בוטלה'); }
);
```

## כללי שימוש חשובים

### 1. לעולם אל תשתמש ב-`alert()` או `confirm()`
```javascript
// ❌ שגוי
alert('הודעת שגיאה');
confirm('האם אתה בטוח?');

// ✅ נכון
window.showErrorNotification('שגיאה', 'הודעת שגיאה');
window.showDeleteWarning('פריט', 'מזהה', 'שם', onConfirm, onCancel);
```

### 2. תמיד השתמש בפונקציות הגלובליות מ-`window`
```javascript
// ✅ נכון
window.showSuccessNotification('הצלחה', 'הפעולה הושלמה');
window.showErrorNotification('שגיאה', 'שגיאה בפעולה');
```

### 3. הוסף fallback ל-`console.error` אם הפונקציה לא זמינה
```javascript
if (typeof window.showErrorNotification === 'function') {
    window.showErrorNotification('שגיאה', 'הודעת שגיאה');
} else {
    console.error('הודעת שגיאה');
}
```

### 4. השתמש בסדר הפרמטרים הנכון לכל פונקציה
```javascript
// ✅ נכון - סדר פרמטרים נכון
window.showSuccessNotification('כותרת', 'הודעה', 5000);
window.showValidationWarning('fieldId', 'הודעת שגיאה');
```

### 5. למודלים של מחיקה - השתמש ברקע אדום לכותרת
המערכת אוטומטית מציגה רקע אדום לכותרת במודלי מחיקה עם כפתור סגירה לבן.

### 6. לוולידציה - השתמש בסימון שדה ספציפי
```javascript
// ✅ נכון - סימון שדה ספציפי
window.showValidationWarning('addExecutionQuantity', 'כמות חייבת להיות חיובית');
```

## עיצוב ויזואלי

### צבעי התראות
- **הצלחה**: ירוק (#28a745)
- **שגיאה**: אדום (#dc3545)
- **אזהרה**: צהוב (#ffc107)
- **מידע**: כחול (#17a2b8)

### אנימציות
- **כניסה**: slide-in מימין
- **יציאה**: fade-out
- **משך ברירת מחדל**: 4000ms

### מיקום
- **מיקום**: פינה ימנית עליונה
- **שכבה**: z-index גבוה
- **רקע**: 80% שקיפות

## פתרון בעיות נפוצות

### בעיה: הודעות לא מוצגות
**פתרון**: בדוק שהקובץ `notification-system.js` נטען לפני השימוש

### בעיה: צבעים שגויים
**פתרון**: בדוק סדר הפרמטרים - `(title, message, duration)`

### בעיה: קריאה רקורסיבית
**פתרון**: אל תגדיר פונקציות מקומיות עם אותו שם כמו הפונקציות הגלובליות

### בעיה: מודלים לא נסגרים
**פתרון**: השתמש ב-`data-bs-dismiss="modal"` לכפתורי סגירה

## דוגמאות שימוש מלאות

### עמוד עסקעות
```javascript
// הוספת עסקה
window.showSuccessNotification('הצלחה', 'עסקה חדשה נוספה בהצלחה למערכת');

// מחיקת עסקה
window.showDeleteWarning('executions', id, 'עסקה', 
    async () => { await confirmDeleteExecution(id); }
);

// ולידציה
window.showValidationWarning('addExecutionQuantity', 'כמות חייבת להיות חיובית');
```

### עמוד חשבונות
```javascript
// שמירת חשבון
window.showSuccessNotification('הצלחה', 'חשבון נשמר בהצלחה');

// מחיקת חשבון עם פריטים מקושרים
window.showLinkedItemsWarning('חשבון', linkedCount, 
    () => { deleteAccount(accountId); }
);
```

## עדכונים אחרונים

### גרסה 3.0 (29 באוגוסט 2025)
- הוספת מודלי אישור דינמיים במקום `confirm()`
- שיפור עיצוב עם רקע אדום למודלי מחיקה
- הוספת fallback ל-`console.error`
- שיפור ביצועים וניקוי קוד

### גרסה 2.0 (26 באוגוסט 2025)
- הוספת מערכת ולידציה
- שיפור אנימציות
- הוספת תמיכה בפריטים מקושרים

### גרסה 1.0 (24 באוגוסט 2025)
- יצירת מערכת התראות בסיסית
- החלפת `alert()` ו-`confirm()`
- הוספת עיצוב אחיד
