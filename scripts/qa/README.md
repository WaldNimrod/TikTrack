# TikTrack QA Testing System

מערכת בדיקות QA מקיפה ואוטומטית לכל שכבות המערכת.

## מבנה התיקייה

- `comprehensive_qa_test_runner.py` - סקריפט ראשי להרצת כל הבדיקות
- `test_general_systems.py` - בדיקות מערכות כלליות (101 מערכות)
- `test_pages_comprehensive.py` - בדיקות עמודים (לפי סדר חשיבות)
- `test_crud_comprehensive.py` - בדיקות CRUD מלאות (12 ישויות)
- `test_e2e_workflows.py` - בדיקות E2E (זרימות עסקיות)
- `test_performance_comprehensive.py` - בדיקות ביצועים
- `generate_results_matrix.py` - יצירת מטריצת תוצאות
- `generate_final_report.py` - יצירת דוח סופי

## שימוש

### הרצת כל הבדיקות

```bash
python3 scripts/qa/comprehensive_qa_test_runner.py
```

### הרצת שלב ספציפי

```bash
# בדיקות מערכות בלבד
python3 scripts/qa/comprehensive_qa_test_runner.py --stage systems

# בדיקות עמודים בלבד
python3 scripts/qa/comprehensive_qa_test_runner.py --stage pages

# בדיקות CRUD בלבד
python3 scripts/qa/comprehensive_qa_test_runner.py --stage crud

# בדיקות E2E בלבד
python3 scripts/qa/comprehensive_qa_test_runner.py --stage e2e

# בדיקות ביצועים בלבד
python3 scripts/qa/comprehensive_qa_test_runner.py --stage performance
```

### דילוג על שלבים

```bash
# דילוג על בדיקות ביצועים
python3 scripts/qa/comprehensive_qa_test_runner.py --skip performance
```

### הרצת סקריפטים בודדים

```bash
# בדיקות מערכות
python3 scripts/qa/test_general_systems.py

# בדיקות עמודים
python3 scripts/qa/test_pages_comprehensive.py

# בדיקות CRUD
python3 scripts/qa/test_crud_comprehensive.py

# בדיקות E2E
python3 scripts/qa/test_e2e_workflows.py

# בדיקות ביצועים
python3 scripts/qa/test_performance_comprehensive.py

# יצירת מטריצת תוצאות
python3 scripts/qa/generate_results_matrix.py

# יצירת דוח סופי
python3 scripts/qa/generate_final_report.py
```

## דרישות

### Python Packages

```bash
pip install selenium webdriver-manager requests
```

### שרת

השרת חייב לרוץ על `http://localhost:8080`

```bash
./start_server.sh
```

### Credentials

כל הבדיקות משתמשות ב:

- **Username:** `admin`
- **Password:** `admin123`

## קבצי תוצאות

כל הבדיקות שומרות תוצאות ב-`reports/qa/`:

- `test_results.json` - תוצאות כל הבדיקות
- `systems_test_results.json` - תוצאות בדיקות מערכות
- `pages_test_results.json` - תוצאות בדיקות עמודים
- `crud_test_results.json` - תוצאות בדיקות CRUD
- `e2e_test_results.json` - תוצאות בדיקות E2E
- `performance_test_results.json` - תוצאות בדיקות ביצועים
- `results_matrix.json` - מטריצת תוצאות (JSON)
- `results_matrix.csv` - מטריצת תוצאות (CSV)
- `final_report.md` - דוח סופי (Markdown)
- `final_report.html` - דוח סופי (HTML)

## סדר הבדיקות

הבדיקות רצות בסדר הבא (לפי התוכנית):

1. **מערכות כלליות** (עדיפות ראשונה)
   - חבילת בסיס (11 מערכות)
   - מערכות CRUD ונתונים (15 מערכות)
   - מערכות תצוגה ו-UI (10 מערכות)
   - מערכות נוספות

2. **עמודים** (לפי סדר חשיבות)
   - עמודים מרכזיים (High Priority - 15 עמודים)
   - עמודים משניים (Medium Priority - 10 עמודים)
   - עמודים טכניים (Low Priority - 12 עמודים)

3. **CRUD** (12 ישויות)
   - Create, Read, Update, Delete
   - Validation, Error handling
   - Integration

4. **E2E** (זרימות עסקיות)
   - Trade creation workflow
   - Trade plan workflow
   - Alert workflow
   - User login workflow

5. **ביצועים**
   - API response times
   - Page load times
   - Cache hit rates
   - Error rates

## מטריצת תוצאות

המטריצה מציגה את הסטטוס של כל עמוד ומערכת:

- ✅ **passed** - כל הבדיקות עברו
- ❌ **failed** - יש שגיאות
- ⚠️  **warning** - יש אזהרות
- ⏳ **pending** - לא נבדק

## דוח סופי

הדוח הסופי כולל:

1. **סיכום ביצוע** - סטטיסטיקות כלליות
2. **שגיאות קריטיות** - רשימת שגיאות לפי עדיפות
3. **אזהרות** - בעיות לא קריטיות
4. **ביצועים** - ניתוח ביצועים והמלצות
5. **מטריצת תוצאות** - טבלה מפורטת

## הערות

- כל הבדיקות מתחשבות ב-rate limiting של השרת
- בדיקות Selenium דורשות Chrome browser
- בדיקות CRUD דורשות authentication
- בדיקות E2E יכולות לרוץ גם ב-API mode (ללא Selenium)

## פתרון בעיות

### שגיאה: "selenium not installed"

```bash
pip install selenium webdriver-manager
```

### שגיאה: "Connection refused"

ודא שהשרת רץ:

```bash
./start_server.sh
```

### שגיאה: "Authentication failed"

ודא שהמשתמש admin קיים במערכת עם הסיסמה admin123

### בדיקות Selenium לא עובדות

ודא ש-Chrome מותקן במחשב. ChromeDriver מותקן אוטומטית על ידי webdriver-manager.

