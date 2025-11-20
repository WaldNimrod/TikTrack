# Preferences Logging Optimization

**תאריך:** 2025-11-20  
**מטרה:** הפחתת רעש בלוגים במערכת העדפות

## שינויים שבוצעו

### 1. המרת הודעות DEBUG לרמת debug
כל הודעות ה-DEBUG שהיו ברמת `info` הומרו לרמת `debug` כדי להפחית את הרעש בלוגים:

#### קבצים שעודכנו:
- `trading-ui/scripts/services/preferences-v4.js`
  - הודעות DEBUG על `getGroup` הומרו ל-`debug`
  - הוסרו פרטים מיותרים מהודעות

- `trading-ui/scripts/preferences-lazy-loader.js`
  - הודעות "LAZY LOADER DEBUG" הומרו ל-`debug`
  - הוסרו פרטים מיותרים מהודעות

- `trading-ui/scripts/preferences-core-new.js`
  - הודעות DEBUG על `getAllPreferences` הומרו ל-`debug`
  - הוסרו פרטים מיותרים מהודעות

- `trading-ui/scripts/preferences-ui.js`
  - הודעות "CACHE DEBUG" ו-"UI DEBUG" הומרו ל-`debug`
  - הוסרו פרטים מיותרים מהודעות

- `trading-ui/scripts/services/preferences-data.js`
  - הודעות DEBUG על `normalizePreferenceEntries` הומרו ל-`debug`
  - הודעות DEBUG על API responses הומרו ל-`debug`

### 2. שיפור טיפול בצבעים עם alpha channel
תוקנה בעיית הצבעים עם alpha channel (כמו `#00000020`) שגרמה לשגיאות:

- `trading-ui/scripts/preferences-ui-v4.js`
  - שיפור הטיפול בצבעים עם alpha channel ב-`_populateAllFormFields()`
  - הוספת בדיקת regex מדויקת יותר
  - שימוש בערך ברירת מחדל (#000000) במקרה של שגיאה

## תוצאות

### לפני:
- מאות הודעות INFO מיותרות בכל טעינת עמוד העדפות
- הודעות DEBUG מוצגות ברמת INFO
- שגיאות על צבעים עם alpha channel

### אחרי:
- הודעות DEBUG מוצגות רק ברמת debug (לא מוצגות בברירת מחדל)
- הודעות INFO רק עבור אירועים חשובים
- טיפול נכון בצבעים עם alpha channel

## השפעה על ביצועים

- **פחות רעש בלוגים:** הודעות DEBUG לא מוצגות בברירת מחדל
- **ביצועים טובים יותר:** פחות פעולות console.log
- **קל יותר לזהות בעיות:** רק הודעות חשובות מוצגות

## הערות

- הודעות DEBUG עדיין זמינות כאשר רמת הלוג היא DEBUG
- הודעות INFO נשמרות רק עבור אירועים חשובים (כמו אתחול מוצלח, טעינת העדפות)
- הודעות WARN ו-ERROR נשארות ללא שינוי

