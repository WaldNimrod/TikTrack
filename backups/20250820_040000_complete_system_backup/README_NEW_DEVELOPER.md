# 🎉 ברוכים הבאים לצוות TikTrack!

## 🚀 התחלה מהירה (5 דקות)

### 1. **התקנה אוטומטית**
```bash
# הרץ את הסקריפט האוטומטי
make onboarding

# או ידנית
chmod +x onboarding.sh
./onboarding.sh
```

### 2. **הדרכה אינטראקטיבית**
```bash
# למידה על אנוטציות טיפוסים
make tutorial
```

### 3. **בדיקת המערכת**
```bash
# בדיקה שכל הכלים עובדים
make check-all
```

## 📚 **מה חשוב לדעת**

### 🎯 **חוק מספר 1: אנוטציות טיפוסים**
כל פונקציה חדשה חייבת לכלול אנוטציות טיפוסים:

```python
# ❌ שגוי - לא יעבור
def get_user(user_id):
    return user

# ✅ נכון - יעבור
def get_user(user_id: int) -> Optional[User]:
    return user
```

### 🛠️ **כלים אוטומטיים**
- **Pre-commit hooks** - מונעים commit ללא אנוטציות
- **Mypy** - בודק טיפוסים אוטומטית
- **VS Code** - מראה שגיאות בזמן כתיבה

### 📝 **תבניות מוכנות**
השתמש בתבניות מ-`Backend/templates/function_templates.py`:

```python
# תבנית לפונקציית service
@staticmethod
def get_by_id(db: Session, item_id: int) -> Optional[Model]:
    """קבלת רשומה לפי מזהה"""
    return db.query(Model).filter(Model.id == item_id).first()
```

## 🔧 **פקודות שימושיות**

### **פיתוח יומיומי**
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
```

### **למידה ועזרה**
```bash
# הדרכה אינטראקטיבית
make tutorial

# דוח מפורט על בעיות טיפוסים
make type-check-report

# עזרה מהירה
make help-new-developer
```

## 📋 **Checklist לפונקציה חדשה**

- [ ] הוספת אנוטציות טיפוסים לכל הפרמטרים
- [ ] הוספת אנוטציית החזרה (return type)
- [ ] הוספת docstring בעברית
- [ ] שימוש בתבנית מתאימה מ-templates
- [ ] בדיקת טיפוסים עם `make type-check`
- [ ] עיצוב קוד עם `make format`
- [ ] סידור imports עם `make lint`

## 🚨 **שגיאות נפוצות ופתרונות**

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
