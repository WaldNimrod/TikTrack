# תיקון שגיאת 400 - Cash Flow

## הבעיה הנוכחית
```
POST http://localhost:8080/api/cash_flows/ 400 (BAD REQUEST)
```

## מה זה אומר
השרת דוחה את הנתונים כי:
- חסר שדה חובה
- נתונים לא תקפים
- פורמט שגוי

## מה עשינו עד כה
- ✅ תיקנו את כפתור השמירה (`data-onclick="saveCashFlow()"`)
- ✅ הוספנו לוגים
- ✅ הפונקציה נקראת
- ✅ הולידציה עובדת
- ✅ המודל לא נסגר (צריך לתקן)

## מה צריך לעשות עכשיו

### 1. בדוק את הלוג המפורט
תראה בקונסול:
```
🔥 saveCashFlow - Sending to API: { url, method, data: cashFlowData }
```

**שלח לי את `cashFlowData`** — מה נשלח לשרת?

### 2. בדוק את התגובה מהשרת
בדוק בקונסול אם יש:
```
🔥 saveCashFlow - API ERROR: {...}
```

**מה השרת מחזיר** שגורם ל-400?

### 3. בדוק Backend
עבור ל-`Backend/routes/api/cash_flows.py` ובדוק:
- מה שדות חובה
- מה הסכמה המזהה

## נסה שוב עכשיו

1. טען מחדש את העמוד (Ctrl+Shift+R)
2. פתח מודל "הוסף תזרים מזומנים"
3. מלא את כל השדות (כולל חובה)
4. לחץ שמור
5. שלח לי את הלוגים מהקונסול

## אם עדיין יש 400

בדוק ב-Backend מה השרת מצפה:
```python
# Backend/routes/api/cash_flows.py
# תראה מה הסכמה המזהה (schema) מצפה
```

ייתכן שיש שדה שהשרת מצפה אליו אבל לא נשלח, או להיפך.

## בעיות נוספות

### המודל לא נסגר
אם השמירה עובדת אבל המודל לא נסגר, צריך לבדוק:
```javascript
// ב-CRUDResponseHandler.handleSaveResponse
if (options.modalId) {
    const modal = bootstrap.Modal.getInstance(document.getElementById(options.modalId));
    if (modal) {
        modal.hide();
    }
}
```

אולי צריך להשתמש ב:
```javascript
const modalElement = document.getElementById(options.modalId);
const modal = new bootstrap.Modal(modalElement);
modal.hide();
```
