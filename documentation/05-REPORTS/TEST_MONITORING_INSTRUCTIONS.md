# הוראות בדיקה סופית - מערכת הניטור

**תאריך:** ${new Date().toLocaleDateString('he-IL')}

## ✅ מה כבר בוצע

1. ✅ נוצר עמוד בדיקה: `test-monitoring.html`
2. ✅ נוצר קובץ JavaScript: `scripts/test-monitoring.js`
3. ✅ נוספה קונפיגורציה ב-`PAGE_CONFIGS` לעמוד `test-monitoring`

---

## 🔧 שלבים לביצוע הבדיקה

### שלב 1: יצירת קוד טעינה עם PageTemplateGenerator

1. פתח את הדפדפן והגש ל-`/test-monitoring.html` (או עמוד כלשהו עם הכלי)
2. פתח את הקונסולה (F12)
3. הרץ את הפקודה הבאה:

```javascript
// בדיקה שהכלי זמין
if (typeof window.PageTemplateGenerator !== 'undefined') {
    // יצירת קוד טעינה לעמוד test-monitoring
    const scriptTags = window.PageTemplateGenerator.generateScriptTagsForPage('test-monitoring');
    console.log(scriptTags);
    
    // העתקה ללוח (אפשרי)
    navigator.clipboard.writeText(scriptTags).then(() => {
        console.log('✅ הקוד הועתק ללוח!');
    });
} else {
    console.error('❌ PageTemplateGenerator לא זמין');
}
```

### שלב 2: החלפת ה-PLACEHOLDER בעמוד

1. פתח את `trading-ui/test-monitoring.html`
2. מצא את השורה:
   ```html
   <!-- ⚠️ PLACEHOLDER - Scripts will be generated here by PageTemplateGenerator -->
   ```
3. החלף את כל ה-PLACEHOLDER (מההערה "START SCRIPT LOADING ORDER" עד "END SCRIPT LOADING ORDER") בקוד שנוצר בשלב 1

### שלב 3: הרצת בדיקת Init System Check

1. פתח את `test-monitoring.html` בדפדפן
2. לחץ על הכפתור 🔍 בתפריט הראשי (Init System Check)
3. חכה לתוצאות הבדיקה

### שלב 4: בדיקת התוצאות

המערכת אמורה לזהות:
- ✅ סקריפטים שנטענו נכון
- ✅ סדר טעינה נכון
- ✅ הערות מספריות תקינות
- ⚠️ סקריפטים חסרים (אם יש)
- ⚠️ סקריפטים נוספים (אם יש)
- ⚠️ בעיות בהערות (אם יש)

---

## 📊 מה לצפות בתוצאות

### תוצאות תקינות:
- ✅ כל הסקריפטים מוגדרים נכון
- ✅ סדר טעינה נכון
- ✅ הערות מספריות תואמות
- ✅ אין כפילויות
- ✅ אין סקריפטים חסרים

### תוצאות בעייתיות (אם יש):
- ⚠️ סקריפטים נוספים - סקריפטים שנטענו אבל לא מוגדרים ב-PAGE_CONFIGS
- ⚠️ סקריפטים חדשים - סקריפטים שלא קיימים באף חבילה
- ⚠️ הערות לא מדויקות - ההערות הממוספרות לא תואמות לסדר הטעינה
- ⚠️ בעיות סדר טעינה - סקריפטים שנטענו בסדר שגוי

---

## 🔍 בדיקות נוספות

### בדיקת פונקציות:
לחץ על הכפתורים בעמוד:
- "בדיקת התראות" - בודק NotificationSystem
- "בדיקת איסוף נתונים" - בודק DataCollectionService
- "בדיקת מטמון" - בודק UnifiedCacheManager
- "בדיקת לוגים" - בודק Logger

---

## 📝 הערות

1. **עדכון הערות מספריות:**
   - אם הכלי יוצר הערות `<!-- [N] -->` אבל הן לא מדויקות
   - המערכת תזהה ותציג זאת במשוב

2. **עדכון קוד טעינה:**
   - אם צריך לעדכן את הקוד, הרץ שוב את `generateScriptTagsForPage()`
   - החלף את הקוד בעמוד

3. **קונסולה:**
   - פתח את הקונסולה כדי לראות לוגים מפורטים
   - בדוק שגיאות JavaScript אם יש

---

**נוצר:** ${new Date().toISOString()}


