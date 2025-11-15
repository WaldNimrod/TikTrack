# Lint Monitor Architecture

עודכן: 13 בנובמבר 2025  
מחבר: צוות הפיתוח של TikTrack

---

> **עדכון 14 בנובמבר 2025:** סקשן ניטור הלינטר הוטמע בתוך `code-quality-dashboard.html`. כל ההוראות בעמוד זה חלות על הרכיב המוטמע (כפתורי רענון, העתקת לוג, ריצת דוח מלא) והסקריפט `linter-realtime-monitor.js`.

## 1. מטרות
- לספק דשבורד אמין למצב איכות הקוד ללא תלות ב-WebSocket או סריקות דינמיות בדפדפן.
- לרכז תוצאות מכל כלי האיכות (ESLint, Stylelint, HTMLHint, Prettier) בפורמט אחיד ומאוחסן.
- לאפשר למפתחים הרצה ידנית שקופה (`npm run lint:collect`) ותיעוד מינימלי של בדיקות ידניות.

## 2. תרשים זרימה כללי
```
CLI (npm run lint:collect)
     │
     ├─▶ scripts/lint/collect-lint-results.js
     │       ├─ מריץ את הכלים בסדרה (JSON/stdout)
     │       ├─ מנרמל לסכימה אחידה
     │       └─ כותב: reports/linter/latest.json + history.json
     │
     ├─▶ Backend/routes/api/quality_lint.py
     │       ├─ GET /api/quality/lint
     │       └─ GET /api/quality/lint/history
     │
     └─▶ Frontend
             ├─ services/lint-status-service.js
             └─ scripts/linter-realtime-monitor.js
```

## 3. רכיבים מרכזיים

### 3.1 איסוף נתונים (CLI)
- `scripts/lint/collect-lint-results.js`
  - מריץ `eslint`, `stylelint`, `htmlhint`, `prettier --check`
  - מאפשר פלט JSON אמיתי ואלגלט שגיאות
  - מסכם נתונים (issues, errors, warnings, משך ריצה)
  - שומר קובץ `latest.json` + מעדכן רשומת היסטוריה (עד 20 ריצות אחרונות)
  - סטטוס החזרה: `0` = הצלחה מלאה, `1` = נמצאו שגיאות (לכישלון CI)

### 3.2 API Backend
- `Backend/routes/api/quality_lint.py`
  - `GET /api/quality/lint` – מחזיר את `latest.json`. אם אין קובץ: `status: empty`
  - `GET /api/quality/lint/history` – מחזיר רשימת ריצות (חיתוך לזמן אמת)
  - `POST /api/quality/lint/run` – מריץ `npm run lint:collect` בצד השרת, מחזיר `stdout/stderr`, קוד יציאה, ושומר את התוצאה בקבצים
  - טיפול בשגיאות JSON / חוסר קבצים / כישלון בהרצה (הודעת שגיאה אחידה)

### 3.3 שירות פרונטנד
- `trading-ui/scripts/services/lint-status-service.js`
  - פונקציות אסינכרוניות לטעינת דוח אחרון והיסטוריה
  - `runCollection(note?)` – מפעילה את ה-API החדש להרצת `lint:collect`, מחזירה את הסטטוס המעודכן
  - פונקציות עזר: `buildSummaryTiles`, `buildTaskSummaries`, `extractIssues`
  - אחראי לנרמל ולתת מבני נתונים נוחים לתצוגה
  - משתמש ב-`handleApiError` בעת כשלי fetch

### 3.4 בקר הדשבורד
- `trading-ui/scripts/linter-realtime-monitor.js`
  - מחלקת `LintMonitorController`
  - אתחול: קאש אלמנטים, רישום טבלה ב-`UnifiedTableSystem`, צפייה באירועי רענון והרצת הסריקה
  - בטעינה: הצגת כרטיסי סיכום, סטטוס כלי, טבלת סוגיות, היסטוריה, פעולות ידניות
  - כפתורים חדשים: “הרץ דוח מלא” (קריאה ל-API), “הורד דוח JSON” (מוריד את `latest.json`), “העתק לוג מפורט” (clipboard)
  - טבלת הסוגיות נשענת על `UnifiedTableSystem` + מיפוי חדש `lint_monitor_issues`
  - ברירת מחדל למיון: חומרה → שורה (descending via default chain)

### 3.5 סגנונות
- `styles-new/06-components/_linter-realtime-monitor.css`
  - שכבת עיצוב ממוקדת (Grid cards, badges, history list)
  - נשענת על צבעי הלוגו (turquoise/orange) וכללי ITCSS קיימים

## 4. מיפויי טבלה
- `table-mappings.js`
  - הוספת מיפוי `lint_monitor_issues`
  - עדכון `DEFAULT_STATUS_KEYS` לכלול `severity`
  - רישום `line` כעמודה מספרית למיון

## 5. רענון ידני ובדיקות

### 5.1 פקודות CLI חובה
```
npm run lint:collect   # יצירת דוח חדש
npm run check:all      # אימות פורמט ו-styling לאחר תיקונים
```

### 5.2 רשימת בדיקות ידניות מינימלית
1. הרץ `npm run lint:collect` או את כפתור “הרץ דוח מלא” מתוך העמוד (אמור לעדכן את הדוח ולהציג סטטוס ריצה)
2. פתח את `/code-quality-dashboard` וודא שסקשן "ניטור איכות קוד" מציג:
   - כרטיסי הסיכום מציגים ערכים (תאריך, שגיאות, אזהרות)
   - טבלת "סטטוס כלי" מציגה סטטוסים לכל כלי
   - טבלת "סוגיות פעילות" ניתנת למיון ובעלת חומרה וציון מיקום
   - היסטוריית הריצות מציגה לפחות את הריצה העדכנית
   - קישור "רענן נתונים" מבצע טעינה מחדש ללא שגיאות קונסול
   - כפתור “הורד דוח JSON” מוריד קובץ עם שם `lint-report-<timestamp>.json`
   - כפתור “העתק לוג מפורט” משכפל את הלוג ויוצר Toast הצלחה
3. אם אין דוח – מוצג מסך הנחיות להרצת `npm run lint:collect`

### 5.3 תסריטי כשל צפויים
- הרצה ללא `latest.json` → API מחזיר `status: empty` (UI מציג מדריך)
- JSON פגום → API מחזיר `status: error` (UI מציג התראה באדיבות NotificationSystem)
- Stylelint/HTMLHint שגויים → הדוח מסווג אותם כ-`failed` עם פירוט מכלי המקור

## 6. שינויים שבוצעו (נובמבר 2025)
- הסרת קבצי הדמיה ישנים (`linter-file-analysis.js`, `linter-export-system.js`, `linter-testing-system.js`, `charts/adapters/linter-adapter.js`)
- ביטול תלות ב-WebSocket ב-`notifications-center.js` (סטטוס מוגדר `disabled`)
- יצירת שירות חדש (`LintStatusService`) וקונטרולר חדש
- עיצוב מחדש של סקשן הלינטר בתוך `code-quality-dashboard.html` (שימוש ב-CSS הייעודי הקיים)
- עדכון המניפסט וטעינת החבילות כך שיטענו את השירות החדש
- הוספת API Backend חדש + אינטגרציה ל-Flask

## 7. מצבי עתיד
- שילוב פלטי lint מה-Backend (במידה ויופעל CI אוטומטי)
- יצירת חיווי דלתא מול ריצה קודמת (diff של סוגיות)
- יצירת קישורים ישירות לקבצים בקונסול (IDE integration)

---

### תחזוקה
- אחריות הדף: צוות פרונטנד.
- אחריות הסקריפט CLI: צוות Build/CI.
- יש לעדכן את המדריך בעת שינוי לוגיקה ב-API או בהרחבת הכלים.

