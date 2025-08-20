# TikTrack Development Guide

## 🚀 Quick Start

### התקנה מהירה
```bash
# התקנת סביבת פיתוח
make setup

# או ידנית
chmod +x setup_development.sh
./setup_development.sh
```

### פקודות שימושיות
```bash
# בדיקת טיפוסים
make type-check

# עיצוב קוד
make format

# בדיקת סגנון
make lint

# כל הבדיקות
make check-all

# הרצת בדיקות
make test

# ניקוי קבצי cache
make clean
```

## 🎯 Type Annotations - חובה לכל פונקציה

### 📋 **כללים בסיסיים**

1. **כל פונקציה חייבת אנוטציות טיפוסים**
2. **השתמש בתבניות מ-`Backend/templates/function_templates.py`**
3. **בדוק עם `mypy` לפני commit**

### 🔧 **דוגמאות נכונות**

#### **Models**
```python
def to_dict(self) -> Dict[str, Any]:
    """המרה למילון"""
    result: Dict[str, Any] = {}
    return result

def __repr__(self) -> str:
    """ייצוג מחרוזת"""
    return f"<{self.__class__.__name__}(id={self.id})>"
```

#### **Services**
```python
@staticmethod
def get_all(db: Session) -> List[Model]:
    """קבלת כל הרשומות"""
    return db.query(Model).all()

@staticmethod
def get_by_id(db: Session, item_id: int) -> Optional[Model]:
    """קבלת רשומה לפי מזהה"""
    return db.query(Model).filter(Model.id == item_id).first()

@staticmethod
def create(db: Session, data: Dict[str, Any]) -> Model:
    """יצירת רשומה חדשה"""
    item = Model(**data)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item
```

#### **API Routes**
```python
def get_items() -> Any:
    """API endpoint לקבלת רשומות"""
    try:
        db: Session = next(get_db())
        items = Service.get_all(db)
        return jsonify({
            "status": "success",
            "data": [item.to_dict() for item in items],
            "message": "Items retrieved successfully",
            "version": "v1"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()
```

### 🚨 **שגיאות נפוצות**

#### **שגיאה: Missing return type annotation**
```python
# ❌ שגוי
def get_user(user_id):
    return user

# ✅ נכון
def get_user(user_id: int) -> Optional[User]:
    return user
```

#### **שגיאה: Missing type annotation for variable**
```python
# ❌ שגוי
def process_data(data):
    result = {}
    return result

# ✅ נכון
def process_data(data: Dict[str, Any]) -> Dict[str, Any]:
    result: Dict[str, Any] = {}
    return result
```

## 🛠️ Development Tools

### **Pre-commit Hooks**
```bash
# התקנה
pre-commit install

# הרצה ידנית
pre-commit run --all-files
```

### **Type Checking**
```bash
# בדיקה בסיסית
mypy Backend/

# בדיקה מפורטת
mypy Backend/ --html-report reports/mypy
```

### **Code Formatting**
```bash
# עיצוב עם black
black Backend/

# סידור imports
isort Backend/

# בדיקת סגנון
flake8 Backend/
```

## 📁 Project Structure

```
TikTrackApp/
├── Backend/
│   ├── models/           # SQLAlchemy models
│   ├── services/         # Business logic
│   ├── routes/           # API endpoints
│   ├── config/           # Configuration
│   ├── templates/        # Function templates
│   └── testing_suite/    # Tests
├── .pre-commit-config.yaml
├── mypy.ini
├── Makefile
└── setup_development.sh
```

## 🔍 Quality Assurance

### **Automated Checks**
- **Type Checking**: `mypy` - בדיקת טיפוסים
- **Code Formatting**: `black` - עיצוב קוד
- **Import Sorting**: `isort` - סידור imports
- **Linting**: `flake8` - בדיקת סגנון
- **Pre-commit**: בדיקות אוטומטיות לפני commit

### **Manual Checks**
```bash
# לפני כל commit
make check-all
make test
```

## 📚 Resources

### **Documentation**
- [Development Guidelines](./Backend/DEVELOPMENT_GUIDELINES.md)
- [Function Templates](./Backend/templates/function_templates.py)
- [API Documentation](./Backend/docs/)

### **External Resources**
- [Python Type Hints](https://docs.python.org/3/library/typing.html)
- [Mypy Documentation](https://mypy.readthedocs.io/)
- [Black Documentation](https://black.readthedocs.io/)

## 🚀 Workflow

### **פיתוח פונקציה חדשה**

1. **בחר תבנית מתאימה** מ-`templates/function_templates.py`
2. **הוסף אנוטציות טיפוסים** לכל פרמטר ופונקציה
3. **הוסף docstring** בעברית
4. **בדוק עם mypy**: `make type-check`
5. **עצב עם black**: `make format`
6. **בדוק סגנון**: `make lint`
7. **הרץ בדיקות**: `make test`
8. **Commit עם pre-commit hooks**

### **Commit Process**
```bash
# 1. בדיקות אוטומטיות
git add .
pre-commit run --all-files

# 2. בדיקות ידניות
make check-all
make test

# 3. Commit
git commit -m "feat: add new function with type annotations"
```

## 🔧 Troubleshooting

### **Common Issues**

#### **Mypy Errors**
```bash
# בדוק שגיאות טיפוסים
mypy Backend/ --show-error-codes

# התעלם מ-imports חסרים (זמני)
mypy Backend/ --ignore-missing-imports
```

#### **Black Formatting Issues**
```bash
# בדוק מה ישתנה
black Backend/ --check --diff

# עיצוב אוטומטי
black Backend/
```

#### **Import Issues**
```bash
# סידור imports
isort Backend/ --check-only --diff

# סידור אוטומטי
isort Backend/
```

## 📞 Support

### **Getting Help**
1. בדוק את [Development Guidelines](./Backend/DEVELOPMENT_GUIDELINES.md)
2. השתמש בתבניות מ-`templates/function_templates.py`
3. הרץ `make check-all` לזיהוי בעיות
4. פנה לצוות הפיתוח

### **Reporting Issues**
- תיאור מפורט של הבעיה
- קוד שגורם לבעיה
- הודעות שגיאה מלאות
- סביבת הפיתוח (OS, Python version, etc.)
