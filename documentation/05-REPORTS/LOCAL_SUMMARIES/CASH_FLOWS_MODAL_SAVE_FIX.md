# תיקון כפתור שמירה - Cash Flows Modal

## הבעיה
כפתור שמירה לא עובד - לחיצה על "שמור" לא עושה כלום

## סיבות

### 1. שגיאת defaultValue
המוגדר כ-function במקום string:
```javascript
defaultValue: function() {
    // Generate current date...
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}
```

הבעיה: ModalManagerV2 מנסה להגדיר זה ישירות לזה ה-input, והוא לא יכול להחזיר פונקציה.

### 2. הפורמט הנכון
כשמשתמשים ב-dateTime: true, צריך להשתמש ב-defaultTime במקום defaultValue.

## תיקון
```javascript
{
    type: 'date',
    id: 'cashFlowDate',
    label: 'תאריך תזרים',
    required: true,
    dateTime: true,
    defaultTime: 'now'  // ✅ במקום defaultValue function
},
```

## איך עובד כעת

1. ✅ ModalManagerV2 מזהה את `defaultTime: 'now'`
2. ✅ יוצר את התאריך הנוכחי במהלך יצירת המודל
3. ✅ מגדיר את הערך לשדה
4. ✅ הכפתור עובד!

## בדיקה
נטר מחדש את העמוד ובדוק:
1. פתיחת מודל "הוסף תזרים מזומנים"
2. שדה התאריך מוגדר אוטומטית לתאריך הנוכחי
3. לחיצה על "שמור" ללא נתונים
4. הודעות שגיאה מופיעות

## סיכום
- ✅ תוקן defaultValue → defaultTime
- ✅ הכפתור צריך לעבוד עכשיו
- ✅ ולידציה תתבצע דרך saveCashFlow
