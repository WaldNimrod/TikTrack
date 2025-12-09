# Checklist - דיבוגינג וניטור

## Debugging Checklist

### תאריך יצירה

ינואר 2025

## Checklist לפני דיבוגינג

### הכנות

- [ ] בדקתי את התיעוד הרלוונטי
- [ ] בדקתי את `GENERAL_SYSTEMS_LIST.md` לפני כתיבת קוד חדש
- [ ] הפעלתי שרת: `./start_server.sh`
- [ ] בדקתי סטטוס דיבוגינג: `./scripts/debug/check-debug-status.sh`
- [ ] הפעלתי Firefox עם remote debugging: `./scripts/debug/launch-firefox.sh`

### הגדרות

- [ ] בדקתי ש-launch.json מוגדר נכון
- [ ] בדקתי ש-source maps מופעלים
- [ ] בדקתי ש-path mappings נכונים
- [ ] בדקתי ש-breakpoints מוגדרים נכון

---

## Checklist במהלך דיבוגינג

### דיבוגינג

- [ ] השתמשתי ב-breakpoints ב-IDE (לא ב-DevTools)
- [ ] השתמשתי ב-step through (F10/F11)
- [ ] השתמשתי ב-Watch expressions
- [ ] השתמשתי ב-Call stack
- [ ] השתמשתי ב-Debug console

### תיעוד

- [ ] תיעדתי את הממצאים
- [ ] תיעדתי את הבעיות
- [ ] תיעדתי את הפתרונות
- [ ] תיעדתי את השינויים

---

## Checklist אחרי דיבוגינג

### ניקוי

- [ ] הסרתי breakpoints זמניים
- [ ] הסרתי console logs זמניים
- [ ] הסרתי Logpoints זמניים
- [ ] סגרתי Firefox אם לא צריך

### תיעוד

- [ ] תיעדתי את הפתרון
- [ ] עדכנתי את התיעוד אם צריך
- [ ] עדכנתי את ה-issues אם יש

---

## Checklist לפני Commit

### בדיקות

- [ ] הרצתי `npm run check:duplicates`
- [ ] בדקתי שימוש במערכות כלליות
- [ ] בדקתי תהליכים מקבילים
- [ ] בדקתי שגיאות

### ניקוי

- [ ] הסרתי console logs זמניים
- [ ] הסרתי breakpoints זמניים
- [ ] הסרתי קוד זמני
- [ ] בדקתי שלא נשארו debug statements

---

## Checklist לפני Release

### בדיקות

- [ ] הרצתי בדיקות מלאות
- [ ] בדקתי performance
- [ ] בדקתי שגיאות
- [ ] בדקתי תאימות דפדפנים

### ניטור

- [ ] בדקתי health: `curl http://localhost:8080/api/health`
- [ ] בדקתי metrics: `curl -X POST http://localhost:8080/api/metrics/collect`
- [ ] בדקתי logs
- [ ] בדקתי alerts

---

## Checklist יומי

### בוקר

- [ ] בדקתי health: `curl http://localhost:8080/api/health`
- [ ] בדקתי שגיאות
- [ ] בדקתי performance
- [ ] בדקתי logs

### ערב

- [ ] בדקתי שלא נשארו שגיאות קריטיות
- [ ] בדקתי performance metrics
- [ ] תעדתי את הממצאים
- [ ] סגרתי Firefox אם לא צריך

---

## Checklist שבועי

### בדיקות

- [ ] הרצתי `npm run check:duplicates`
- [ ] בדקתי שימוש במערכות כלליות
- [ ] בדקתי תהליכים מקבילים
- [ ] בדקתי performance

### תיעוד

- [ ] עדכנתי את התיעוד
- [ ] עדכנתי את ה-issues
- [ ] עדכנתי את ה-metrics

---

## קישורים רלוונטיים

- [QA and Debugging Guide](../TOOLS/QA_AND_DEBUGGING_GUIDE.md)
- [Debugging Quick Reference](../TOOLS/DEBUGGING_QUICK_REFERENCE.md)
- [Onboarding Debugging Guide](ONBOARDING_DEBUGGING_GUIDE.md)

---

**תאריך עדכון:** ינואר 2025

