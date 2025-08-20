# TikTrack Testing Suite - מערכת הבדיקות של TikTrack

## ⚠️ **חשוב: זהו קובץ מערכת הבדיקות בלבד!**

**אין קשר לקונפיגורציות השרת או סביבת הפיתוח!**

- **מערכת הבדיקות**: תיקייה זו מכילה את כל הבדיקות של TikTrack
- **קונפיגורציות השרת**: נמצאות ב-`Backend/SERVER_CONFIGURATIONS.md`
- **סביבת הפיתוח**: מוגדרת ב-`Backend/` עם קבצי `run_*.py`

## 🎯 **מטרת מערכת הבדיקות:**
- בדיקת תקינות הקוד והפונקציונליות
- איתור באגים לפני שחרור
- וידוא יציבות המערכת
- בדיקת אבטחה וביצועים

## 🚫 **מה לא נמצא כאן:**
- ❌ קונפיגורציות שרת
- ❌ הגדרות סביבת פיתוח
- ❌ סקריפטי הפעלת שרת
- ❌ הגדרות פרודקשן

## 📁 **מבנה התיקיות**

```
testing_suite/
├── unit_tests/           # בדיקות יחידה למודלים ושירותים
├── integration_tests/    # בדיקות אינטגרציה ל-API
├── e2e_tests/           # בדיקות end-to-end
├── performance_tests/   # בדיקות ביצועים
├── load_tests/          # בדיקות עומס
├── security_tests/      # בדיקות אבטחה
├── documentation/       # תיעוד הבדיקות
├── logs/               # לוגים של הבדיקות
├── reports/            # דוחות כיסוי ותוצאות
├── configs/            # קבצי הגדרות לבדיקות
├── conftest.py         # הגדרות pytest
└── README.md           # קובץ זה
```

## סוגי הבדיקות

### Unit Tests (בדיקות יחידה)
- **מטרה**: בדיקת פונקציונליות של רכיבים בודדים
- **מיקום**: `unit_tests/`
- **דוגמאות**: בדיקות מודלים, שירותים, utilities

### Integration Tests (בדיקות אינטגרציה)
- **מטרה**: בדיקת אינטראקציה בין רכיבים
- **מיקום**: `integration_tests/`
- **דוגמאות**: בדיקות API endpoints, חיבור לבסיס נתונים

### End-to-End Tests (בדיקות E2E)
- **מטרה**: בדיקת זרימות עבודה מלאות
- **מיקום**: `e2e_tests/`
- **דוגמאות**: בדיקות UI, workflows של משתמשים

### Performance Tests (בדיקות ביצועים)
- **מטרה**: בדיקת זמני תגובה ויעילות
- **מיקום**: `performance_tests/`
- **דוגמאות**: בדיקות זמני תגובה, ניצול משאבים

### Load Tests (בדיקות עומס)
- **מטרה**: בדיקת התנהגות תחת עומס
- **מיקום**: `load_tests/`
- **דוגמאות**: בדיקות עם משתמשים מרובים, עומס נתונים

### Security Tests (בדיקות אבטחה)
- **מטרה**: בדיקת אבטחה ופגיעויות
- **מיקום**: `security_tests/`
- **דוגמאות**: בדיקות SQL injection, XSS, authentication

## הרצת הבדיקות

### הרצת כל הבדיקות
```bash
cd testing_suite
python3 -m pytest -v
```

### הרצת סוג בדיקה ספציפי
```bash
# Unit tests
python3 -m pytest unit_tests/ -v

# Integration tests
python3 -m pytest integration_tests/ -v

# E2E tests
python3 -m pytest e2e_tests/ -v

# Performance tests
python3 -m pytest performance_tests/ -v

# Load tests
python3 -m pytest load_tests/ -v

# Security tests
python3 -m pytest security_tests/ -v
```

### הרצה עם דוח כיסוי
```bash
python3 -m pytest -v --cov=.. --cov-report=html --cov-report=term-missing
```

### הרצה עם markers
```bash
# בדיקות מהירות
python3 -m pytest -m "not slow" -v

# בדיקות איטיות בלבד
python3 -m pytest -m "slow" -v

# בדיקות קריטיות
python3 -m pytest -m "critical" -v
```

## הגדרות

### pytest.ini
קובץ ההגדרות הראשי של pytest נמצא ב-`configs/pytest.ini`

### conftest.py
הגדרות fixtures משותפות לכל הבדיקות

## דוחות ולוגים

### דוחות כיסוי
- **מיקום**: `reports/htmlcov/`
- **פורמט**: HTML אינטראקטיבי
- **תוכן**: כיסוי קוד מפורט לפי קבצים

### לוגים
- **מיקום**: `logs/`
- **תוכן**: לוגים של הבדיקות, שגיאות, ביצועים

### תיעוד
- **מיקום**: `documentation/`
- **תוכן**: סיכומי בדיקות, מדריכים, תיעוד API

## הוספת בדיקות חדשות

### 1. יצירת בדיקת Unit
```python
# unit_tests/test_new_feature.py
import pytest
from models.new_feature import NewFeature

def test_new_feature_creation():
    feature = NewFeature(name="test")
    assert feature.name == "test"
```

### 2. יצירת בדיקת Integration
```python
# integration_tests/test_new_api.py
import pytest

def test_new_api_endpoint(client):
    response = client.get('/api/new-endpoint')
    assert response.status_code == 200
```

### 3. יצירת בדיקת E2E
```python
# e2e_tests/test_new_workflow.py
import pytest

def test_new_user_workflow(client):
    # Test complete user workflow
    pass
```

## Best Practices

### 1. שמות קבצים
- השתמש ב-`test_` בתחילת שם הקובץ
- השתמש בשמות ברורים ומתארים

### 2. שמות פונקציות
- השתמש ב-`test_` בתחילת שם הפונקציה
- תאר מה הבדיקה בודקת

### 3. Assertions
- השתמש ב-assertions ברורים
- הוסף הודעות שגיאה מתארות

### 4. Fixtures
- השתמש ב-fixtures לשיתוף נתונים
- הגדר fixtures ב-conftest.py

### 5. Markers
- השתמש ב-markers לסיווג בדיקות
- הוסף markers מתאימים (slow, critical, etc.)

## Continuous Integration

### GitHub Actions
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run tests
        run: |
          cd testing_suite
          python3 -m pytest -v
```

### Pre-commit Hooks
```yaml
repos:
  - repo: local
    hooks:
      - id: pytest
        name: pytest
        entry: pytest
        language: system
        pass_filenames: false
        always_run: true
```

## Troubleshooting

### בעיות נפוצות

1. **Import errors**
   - וודא שה-PYTHONPATH מוגדר נכון
   - בדוק שהקבצים נמצאים במיקום הנכון

2. **Database connection errors**
   - וודא שהשרת רץ
   - בדוק הגדרות בסיס הנתונים

3. **Test failures**
   - בדוק את הלוגים ב-`logs/`
   - וודא שהנתונים נכונים

### קבלת עזרה
- בדוק את התיעוד ב-`documentation/`
- ראה דוגמאות בקבצי הבדיקות הקיימים
- בדוק את הלוגים לפרטים נוספים

## 🔗 **קישורים חשובים:**

### 📋 **קונפיגורציות השרת:**
- **קובץ**: `Backend/SERVER_CONFIGURATIONS.md`
- **תוכן**: הגדרות שרת, סקריפטי הפעלה, סביבות פיתוח
- **מתי להשתמש**: כשצריך להפעיל את השרת או לשנות הגדרות

### 🚀 **הפעלת השרת:**
```bash
# שימוש יומיומי (מומלץ)
cd Backend && python3 run_stable.py

# פיתוח עם auto-reload
cd Backend && python3 dev_server.py

# פרודקשן
cd Backend && python3 run_waitress_fixed.py
```

### 🔧 **סביבת הפיתוח:**
- **תיקייה**: `Backend/`
- **קבצים**: `run_*.py`, `app.py`, `requirements.txt`
- **מתי להשתמש**: לפיתוח, הפעלת שרת, ניהול dependencies

## ⚠️ **הבדלים חשובים:**

| מערכת הבדיקות | קונפיגורציות השרת |
|----------------|-------------------|
| `testing_suite/` | `Backend/` |
| בדיקות קוד | הפעלת שרת |
| pytest, test files | Flask, Waitress |
| `conftest.py` | `app.py` |
| `Makefile` | `run_*.py` |

## 🎯 **סיכום:**

**מערכת הבדיקות** (תיקייה זו):
- ✅ בדיקות אוטומטיות
- ✅ איתור באגים
- ✅ וידוא איכות
- ✅ דוחות כיסוי

**קונפיגורציות השרת** (`Backend/SERVER_CONFIGURATIONS.md`):
- ✅ הפעלת שרת
- ✅ הגדרות סביבה
- ✅ סקריפטי הפעלה
- ✅ ניהול תהליכים

**אין בלבול בין השניים!** 🎯
