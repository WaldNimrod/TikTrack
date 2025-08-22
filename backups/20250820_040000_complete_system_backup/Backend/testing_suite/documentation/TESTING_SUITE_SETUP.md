# TikTrack Testing Suite - Setup Guide

## סקירה כללית

מערכת הבדיקות של TikTrack מאורגנת בתיקייה ייעודית `testing_suite/` המכילה את כל הקבצים הקשורים לבדיקות מערכת שונות.

## מבנה התיקיות

```
testing_suite/
├── unit_tests/           # בדיקות יחידה למודלים ושירותים
│   └── test_models.py
├── integration_tests/    # בדיקות אינטגרציה ל-API
│   └── test_api.py
├── e2e_tests/           # בדיקות end-to-end
│   └── test_basic_workflow.py
├── performance_tests/   # בדיקות ביצועים (ריק)
├── load_tests/          # בדיקות עומס (ריק)
├── security_tests/      # בדיקות אבטחה (ריק)
├── documentation/       # תיעוד הבדיקות
│   ├── TEST_SUMMARY.md
│   └── TESTING_SUITE_SETUP.md
├── logs/               # לוגים של הבדיקות
├── reports/            # דוחות כיסוי ותוצאות
├── configs/            # קבצי הגדרות לבדיקות
│   ├── pytest.ini
│   └── test_config.py
├── conftest.py         # הגדרות pytest
├── requirements.txt    # תלויות לבדיקות
├── Makefile           # פקודות להרצת בדיקות
├── .gitignore         # קבצים להתעלמות
└── README.md          # תיעוד ראשי
```

## התקנה והגדרה

### 1. התקנת תלויות
```bash
cd testing_suite
pip3 install -r requirements.txt
```

### 2. הגדרת סביבה
```bash
# הגדרת משתני סביבה לבדיקות
export FLASK_ENV=testing
export TESTING=true
```

### 3. יצירת תיקיות נדרשות
```bash
make install
```

## הרצת בדיקות

### פקודות בסיסיות
```bash
# הרצת כל הבדיקות
make test

# הרצת בדיקות יחידה בלבד
make test-unit

# הרצת בדיקות אינטגרציה בלבד
make test-integration

# הרצת בדיקות E2E בלבד
make test-e2e

# הרצה עם דוח כיסוי
make coverage
```

### פקודות מתקדמות
```bash
# הרצה במקביל
make test-parallel

# הרצה עם דוח HTML
make test-html

# בדיקות מהירות בלבד
make test-fast

# בדיקות איטיות בלבד
make test-slow

# ניקוי קבצי בדיקה
make clean
```

## סוגי הבדיקות

### Unit Tests (בדיקות יחידה)
- **מטרה**: בדיקת פונקציונליות של רכיבים בודדים
- **מיקום**: `unit_tests/`
- **דוגמאות**: 
  - בדיקות מודלים (Ticker, Account, Trade, Alert)
  - בדיקות שירותים
  - בדיקות utilities

### Integration Tests (בדיקות אינטגרציה)
- **מטרה**: בדיקת אינטראקציה בין רכיבים
- **מיקום**: `integration_tests/`
- **דוגמאות**:
  - בדיקות API endpoints
  - בדיקות חיבור לבסיס נתונים
  - בדיקות תגובות JSON

### End-to-End Tests (בדיקות E2E)
- **מטרה**: בדיקת זרימות עבודה מלאות
- **מיקום**: `e2e_tests/`
- **דוגמאות**:
  - בדיקות טעינת דף ראשי
  - בדיקות חיבור API
  - בדיקות ביצועים בסיסיות

### Performance Tests (בדיקות ביצועים)
- **מטרה**: בדיקת זמני תגובה ויעילות
- **מיקום**: `performance_tests/`
- **סטטוס**: מוכן להרחבה

### Load Tests (בדיקות עומס)
- **מטרה**: בדיקת התנהגות תחת עומס
- **מיקום**: `load_tests/`
- **סטטוס**: מוכן להרחבה

### Security Tests (בדיקות אבטחה)
- **מטרה**: בדיקת אבטחה ופגיעויות
- **מיקום**: `security_tests/`
- **סטטוס**: מוכן להרחבה

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

## הגדרות מתקדמות

### pytest.ini
קובץ ההגדרות הראשי של pytest עם:
- הגדרת markers
- הגדרות verbose
- הגדרות coverage
- הגדרות timeout

### test_config.py
קובץ הגדרות מתקדם עם:
- הגדרות נתיבים
- הגדרות בסיס נתונים לבדיקות
- הגדרות שרת לבדיקות
- הגדרות ביצועים

### conftest.py
הגדרות fixtures משותפות:
- client fixture
- db_session fixture
- test_db fixture
- auth_headers fixture

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
          make test
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
   ```bash
   # וודא שה-PYTHONPATH מוגדר נכון
   export PYTHONPATH="${PYTHONPATH}:$(pwd)/.."
   ```

2. **Database connection errors**
   ```bash
   # וודא שהשרת רץ
   python3 dev_server.py
   ```

3. **Test failures**
   ```bash
   # בדוק את הלוגים
   tail -f logs/test.log
   ```

### קבלת עזרה
- בדוק את התיעוד ב-`documentation/`
- ראה דוגמאות בקבצי הבדיקות הקיימים
- בדוק את הלוגים לפרטים נוספים

## סטטוס נוכחי

✅ **Unit Tests**: 5 בדיקות פעילות  
✅ **Integration Tests**: 10 בדיקות פעילות  
✅ **E2E Tests**: 9 בדיקות פעילות  
⏳ **Performance Tests**: מוכן להרחבה  
⏳ **Load Tests**: מוכן להרחבה  
⏳ **Security Tests**: מוכן להרחבה  

**סה"כ**: 23 בדיקות עוברות, 2 דילוגו
