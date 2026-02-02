# Blueprint Comparison Tools 🛠️

כלים לזיהוי ותיקון הבדלים בין בלופרינטים למימוש React.

**⚠️ חשוב:** הכלים מזהה הבדלים במבנה HTML/JSX ובמחלקות CSS. לאחר זיהוי ההבדלים, יש לתקן ידנית לפי הדוח.

## כלים זמינים

### 1. `blueprint-diff.js` - זיהוי הבדלים

**שימוש:**
```bash
node ui/scripts/blueprint-diff.js <blueprint.html> <react-component.jsx>
```

**דוגמה:**
```bash
node ui/scripts/blueprint-diff.js _COMMUNICATION/team_01/team_01_staging/D15_LOGIN.html ui/src/cubes/identity/components/auth/LoginForm.jsx
```

**פלט:**
- דוח מפורט של כל ההבדלים במבנה HTML/JSX
- רשימת מחלקות CSS חסרות/מיותרות
- קובץ JSON מפורט: `blueprint-diff-report.json`

### 2. `fix-blueprint-diff.js` - הצעות תיקון

**שימוש:**
```bash
node ui/scripts/fix-blueprint-diff.js <diff-report.json>
```

**דוגמה:**
```bash
node ui/scripts/fix-blueprint-diff.js ui/src/cubes/identity/components/auth/blueprint-diff-report.json
```

**פלט:**
- רשימת הצעות תיקון מפורטת
- קובץ JSON עם כל ההצעות: `*-fix-suggestions.json`

## מה הכלים בודקים

1. **מבנה HTML/JSX:**
   - התאמת תגיות (tags)
   - סדר אלמנטים
   - אלמנטים חסרים/מיותרים

2. **מחלקות CSS:**
   - מחלקות חסרות במימוש React
   - מחלקות מיותרות במימוש React
   - מחלקות משותפות

3. **מאפיינים:**
   - IDs
   - Data attributes

## דוגמת שימוש מלא

```bash
# 1. זיהוי הבדלים
node ui/scripts/blueprint-diff.js \
  _COMMUNICATION/team_01/team_01_staging/D15_LOGIN.html \
  ui/src/cubes/identity/components/auth/LoginForm.jsx

# 2. קבלת הצעות תיקון
node ui/scripts/fix-blueprint-diff.js \
  ui/src/cubes/identity/components/auth/blueprint-diff-report.json

# 3. תיקון ידני לפי ההצעות
# ... עריכת הקובץ React ...
```

## קבצי דוח

לאחר הרצת הכלים, נוצרים הקבצים הבאים:

- `blueprint-diff-report.json` - דוח מפורט של כל ההבדלים
- `*-fix-suggestions.json` - הצעות תיקון מפורטות

## הערות

- הכלים מזהים הבדלים במבנה ובמחלקות CSS
- לא בודקים computed styles (דורש browser)
- לא בודקים positioning ו-spacing (צריך בדיקה ויזואלית)
