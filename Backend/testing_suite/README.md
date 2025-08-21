# TikTrack Testing Suite - TikTrack Testing System

## ⚠️ **Important: This is a testing system file only!**

**No connection to server configurations or development environment!**

- **Testing System**: This directory contains all TikTrack tests
- **Server Configurations**: Located in `Backend/SERVER_CONFIGURATIONS.md`
- **Development Environment**: Defined in `Backend/` with `run_*.py` files

## 🎯 **Testing System Purpose:**
- Testing code integrity and functionality
- Bug detection before release
- Ensuring system stability
- Security and performance testing

## 🚫 **What's Not Here:**
- ❌ Server configurations
- ❌ Development environment settings
- ❌ Server startup scripts
- ❌ Production settings

## 📁 **Directory Structure**

```
testing_suite/
├── unit_tests/           # Unit tests for models and services
├── integration_tests/    # Integration tests for API
├── e2e_tests/           # End-to-end tests
├── performance_tests/   # Performance tests
├── load_tests/          # Load tests
├── security_tests/      # Security tests
├── documentation/       # Test documentation
├── logs/               # Test logs
├── reports/            # Coverage and results reports
├── configs/            # Test configuration files
├── conftest.py         # Pytest configuration
└── README.md           # This file
```

## Test Types

### Unit Tests
- **Purpose**: Testing functionality of individual components
- **Location**: `unit_tests/`
- **Examples**: Model tests, service tests, utilities

### Integration Tests
- **Purpose**: Testing interaction between components
- **Location**: `integration_tests/`
- **Examples**: API endpoint tests, database connection tests

### End-to-End Tests (E2E)
- **Purpose**: Testing complete workflows
- **Location**: `e2e_tests/`
- **Examples**: UI tests, user workflows

### Performance Tests
- **Purpose**: Testing response times and efficiency
- **Location**: `performance_tests/`
- **Examples**: Response time tests, resource utilization

### Load Tests
- **Purpose**: Testing behavior under load
- **Location**: `load_tests/`
- **Examples**: Multi-user tests, data load tests

### Security Tests
- **Purpose**: Testing security and vulnerabilities
- **Location**: `security_tests/`
- **Examples**: SQL injection tests, XSS tests, authentication tests

## Running Tests

### Run All Tests
```bash
cd testing_suite
python3 -m pytest -v
```

### Run Specific Test Type
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
