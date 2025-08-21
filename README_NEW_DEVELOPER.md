# 🎉 Welcome to the TikTrack Team!

## 🚀 Quick Start (5 minutes)

### 1. **Automatic Installation**
```bash
# Run the automatic script
make onboarding

# Or manually
chmod +x onboarding.sh
./onboarding.sh
```

### 2. **Interactive Tutorial**
```bash
# Learn about type annotations
make tutorial
```

### 3. **System Check**
```bash
# Check that all tools work
make check-all
```

## 📚 **What's Important to Know**

### 🎯 **Rule #1: Type Annotations**
Every new function must include type annotations:

```python
# ❌ Wrong - won't pass
def get_user(user_id):
    return user

# ✅ Correct - will pass
def get_user(user_id: int) -> Optional[User]:
    return user
```

### 🛠️ **Automatic Tools**
- **Pre-commit hooks** - Prevent commits without annotations
- **Mypy** - Automatically checks types
- **VS Code** - Shows errors while writing

### 📝 **Ready Templates**
Use templates from `Backend/templates/function_templates.py`:

```python
# Template for service function
@staticmethod
def get_by_id(db: Session, item_id: int) -> Optional[Model]:
    """Get record by ID"""
    return db.query(Model).filter(Model.id == item_id).first()
```

## 🔧 **Useful Commands**

### **Daily Development**
```bash
# Type checking
make type-check

# Code formatting
make format

# Style checking
make lint

# All checks
make check-all

# Run tests
make test
```

### **Learning and Help**
```bash
# Interactive tutorial
make tutorial

# Detailed report on type issues
make type-check-report

# Quick help
make help-new-developer
```

## 📋 **Checklist for New Function**

- [ ] Add type annotations for all parameters
- [ ] Add return type annotation
- [ ] Add docstring in English
- [ ] Use appropriate template from templates
- [ ] Check types with `make type-check`
- [ ] Format code with `make format`
- [ ] Organize imports with `make lint`

## 🚨 **Common Errors and Solutions**

### **שגיאה: Missing return type annotation**
```bash
# פתרון: הוסף אנוטציית החזרה
def function_name() -> Dict[str, Any]:
    return result
```

### **שגיאה: Missing type annotation for variable**
```bash
# פתרון: הוסף אנוטציה למשתנה
result: Dict[str, Any] = {}
```

### **שגיאה: Pre-commit failed**
```bash
# פתרון: הרץ את הבדיקות
make check-all
# תיקן את השגיאות
# נסה שוב
git add .
git commit -m "your message"
```

## 📚 **משאבים נוספים**

### **מדריכים מפורטים**
- [Development Guidelines](./Backend/DEVELOPMENT_GUIDELINES.md)
- [Function Templates](./Backend/templates/function_templates.py)
- [Type Annotations Tutorial](./Backend/tutorials/type_annotations_tutorial.py)

### **כלים**
- [Type Checker Utility](./Backend/utils/type_checker.py)
- [Pre-commit Configuration](./.pre-commit-config.yaml)
- [Mypy Configuration](./mypy.ini)

## 🎯 **דוגמאות מעשיות**

### **Model Function**
```python
def to_dict(self) -> Dict[str, Any]:
    """המרה למילון"""
    result: Dict[str, Any] = {}
    for c in self.__table__.columns:
        value = getattr(self, c.name)
        if hasattr(value, 'strftime'):
            result[c.name] = value.strftime('%Y-%m-%d %H:%M:%S') if value else None
        else:
            result[c.name] = value
    return result
```

### **Service Function**
```python
@staticmethod
def create(db: Session, data: Dict[str, Any]) -> Model:
    """יצירת רשומה חדשה"""
    item = Model(**data)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item
```

### **API Route**
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

## 🔄 **Workflow יומי**

### **לפני כל commit**
```bash
# 1. בדיקות אוטומטיות
make check-all

# 2. הרצת בדיקות
make test

# 3. Commit
git add .
git commit -m "feat: add new function with type annotations"
```

### **כשאתה נתקע**
```bash
# 1. בדוק את התבניות
cat Backend/templates/function_templates.py

# 2. הרץ את הדוח המפורט
make type-check-report

# 3. לקח את ההדרכה
make tutorial

# 4. פנה לעזרה
# - בדוק את המדריכים
# - פנה לצוות
```

## 🎉 **מזל טוב!**

עכשיו אתה מוכן לפתח ב-TikTrack עם אנוטציות טיפוסים!

### **זכור:**
- ✅ תמיד הוסף אנוטציות טיפוסים
- ✅ השתמש בתבניות
- ✅ הרץ בדיקות לפני commit
- ✅ שאל אם אתה לא בטוח

### **צוות התמיכה:**
- 📧 פנה לצוות הפיתוח
- 📚 בדוק את המדריכים
- 🛠️ השתמש בכלים האוטומטיים

**בהצלחה! 🚀**
