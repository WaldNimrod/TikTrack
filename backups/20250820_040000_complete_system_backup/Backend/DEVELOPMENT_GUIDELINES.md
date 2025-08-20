# TikTrack Development Guidelines

## 🎯 Type Annotations Guidelines

### 📋 **חובה לכל פונקציה חדשה**

כל פונקציה חדשה חייבת לכלול אנוטציות טיפוסים מלאות:

```python
def function_name(param1: str, param2: Optional[int] = None) -> Dict[str, Any]:
    """תיאור הפונקציה"""
    result: Dict[str, Any] = {}
    return result
```

### 🔧 **סוגי אנוטציות נפוצים**

#### **Models**
```python
def to_dict(self) -> Dict[str, Any]:
    """המרה למילון"""
    pass

def __repr__(self) -> str:
    """ייצוג מחרוזת"""
    pass
```

#### **Services**
```python
@staticmethod
def get_all(db: Session) -> List[Model]:
    """קבלת כל הרשומות"""
    pass

@staticmethod
def get_by_id(db: Session, item_id: int) -> Optional[Model]:
    """קבלת רשומה לפי מזהה"""
    pass

@staticmethod
def create(db: Session, data: Dict[str, Any]) -> Model:
    """יצירת רשומה חדשה"""
    pass

@staticmethod
def update(db: Session, item_id: int, data: Dict[str, Any]) -> Optional[Model]:
    """עדכון רשומה"""
    pass

@staticmethod
def delete(db: Session, item_id: int) -> bool:
    """מחיקת רשומה"""
    pass
```

#### **API Routes**
```python
def get_items() -> Any:
    """API endpoint לקבלת רשומות"""
    pass

def get_item(item_id: int) -> Any:
    """API endpoint לקבלת רשומה בודדת"""
    pass

def create_item() -> Any:
    """API endpoint ליצירת רשומה"""
    pass

def update_item(item_id: int) -> Any:
    """API endpoint לעדכון רשומה"""
    pass

def delete_item(item_id: int) -> Any:
    """API endpoint למחיקת רשומה"""
    pass
```

#### **Validation Functions**
```python
def validate_data(data: Dict[str, Any]) -> Tuple[bool, str]:
    """בדיקת תקינות נתונים"""
    pass
```

### 📝 **כללי כתיבה**

1. **תמיד השתמש באנוטציות** - גם לפונקציות פשוטות
2. **השתמש ב-Optional** - כאשר פרמטר יכול להיות None
3. **השתמש ב-Any** - רק כאשר אין טיפוס ספציפי ידוע
4. **הוסף docstring** - לכל פונקציה עם תיאור בעברית
5. **השתמש בתבניות** - מתוך `templates/function_templates.py`

### 🔍 **בדיקות אוטומטיות**

#### **Pre-commit Hooks**
```bash
# התקנה
pre-commit install

# הרצה ידנית
pre-commit run --all-files
```

#### **Type Checking**
```bash
# בדיקת טיפוסים
mypy Backend/

# בדיקת טיפוסים עם דוחות מפורטים
mypy Backend/ --html-report reports/mypy
```

#### **Code Formatting**
```bash
# עיצוב קוד
black Backend/

# סידור imports
isort Backend/

# בדיקת סגנון
flake8 Backend/
```

### 🛠️ **IDE Configuration**

#### **VS Code Extensions**
- Python
- Pylance
- Black Formatter
- isort
- Flake8

#### **Settings**
```json
{
    "python.linting.mypyEnabled": true,
    "python.linting.flake8Enabled": true,
    "python.formatting.provider": "black",
    "editor.formatOnSave": true,
    "python.analysis.typeCheckingMode": "strict"
}
```

### 📋 **Checklist לפונקציה חדשה**

- [ ] הוספת אנוטציות טיפוסים לכל הפרמטרים
- [ ] הוספת אנוטציית החזרה (return type)
- [ ] הוספת docstring בעברית
- [ ] שימוש בתבנית מתאימה מ-templates
- [ ] בדיקת טיפוסים עם mypy
- [ ] עיצוב קוד עם black
- [ ] סידור imports עם isort

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

#### **שגיאה: Incompatible types**
```python
# ❌ שגוי
def add_numbers(a: str, b: int) -> int:
    return a + b  # שגיאה: לא ניתן לחבר str עם int

# ✅ נכון
def add_numbers(a: int, b: int) -> int:
    return a + b
```

### 📚 **משאבים נוספים**

- [Python Type Hints Documentation](https://docs.python.org/3/library/typing.html)
- [Mypy Documentation](https://mypy.readthedocs.io/)
- [Black Documentation](https://black.readthedocs.io/)
- [Templates Directory](./templates/function_templates.py)

### 🔄 **תחזוקה שוטפת**

1. **בדיקה יומית** - הרץ `mypy Backend/` לפני commit
2. **עדכון תבניות** - הוסף תבניות חדשות לפי הצורך
3. **בדיקת pre-commit** - וודא שה-hooks עובדים
4. **עדכון dependencies** - שמור על גרסאות עדכניות

### 📞 **תמיכה**

אם יש שאלות או בעיות:
1. בדוק את התבניות ב-`templates/function_templates.py`
2. הרץ `mypy Backend/` לזיהוי שגיאות
3. פנה לצוות הפיתוח
