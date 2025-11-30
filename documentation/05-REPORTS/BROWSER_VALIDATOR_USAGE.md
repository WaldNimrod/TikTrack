
# הוראות שימוש - Browser Page Validator

## שימוש בדפדפן

1. פתח את העמוד שברצונך לבדוק
2. פתח את הקונסולה (F12)
3. העתק והדבק את הקוד מ: `trading-ui/scripts/audit/browser-page-validator-browser.js`
4. או השתמש ב:
   ```javascript
   await window.browserPageValidator.validateCurrentPage()
   ```

## תוצאות

התוצאות יוצגו בקונסולה ויכללו:
- שגיאות בקונסולה
- אזהרות קריטיות
- תוצאות ניטור
- בדיקת בריאות עמוד

## ייצוא תוצאות

```javascript
window.browserPageValidator.exportResults()
```

זה יוריד קובץ JSON עם כל התוצאות.
