# TikTrack Development Guide

## 🚀 Quick Start

### Quick Installation
```bash
# Install development environment
make setup

# Or manually
chmod +x setup_development.sh
./setup_development.sh
```

### Useful Commands
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

# Clean cache files
make clean
```

## 🎯 Type Annotations - Required for Every Function

### 📋 **Basic Rules**

1. **Every function must have type annotations**
2. **Use templates from `Backend/templates/function_templates.py`**
3. **Check with `mypy` before commit**

### 🔧 **Correct Examples**

#### **Models**
```python
def to_dict(self) -> Dict[str, Any]:
    """Convert to dictionary"""
    result: Dict[str, Any] = {}
    return result

def __repr__(self) -> str:
    """String representation"""
    return f"<{self.__class__.__name__}(id={self.id})>"
```

#### **Services**
```python
@staticmethod
def get_all(db: Session) -> List[Model]:
    """Get all records"""
    return db.query(Model).all()

@staticmethod
def get_by_id(db: Session, item_id: int) -> Optional[Model]:
    """Get record by ID"""
    return db.query(Model).filter(Model.id == item_id).first()

@staticmethod
def create(db: Session, data: Dict[str, Any]) -> Model:
    """Create new record"""
    item = Model(**data)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item
```

#### **API Routes**
```python
def get_items() -> Any:
    """API endpoint for getting records"""
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

### 🚨 **Common Errors**

#### **Error: Missing return type annotation**
```python
# ❌ Wrong
def get_user(user_id):
    return user

# ✅ Correct
def get_user(user_id: int) -> Optional[User]:
    return user
```

#### **Error: Missing type annotation for variable**
```python
# ❌ Wrong
def process_data(data):
    result = {}
    return result

# ✅ Correct
def process_data(data: Dict[str, Any]) -> Dict[str, Any]:
    result: Dict[str, Any] = {}
    return result
```

## 🛠️ Development Tools

### **Pre-commit Hooks**
```bash
# Installation
pre-commit install

# Manual run
pre-commit run --all-files
```

### **Type Checking**
```bash
# Basic check
mypy Backend/

# Detailed check
mypy Backend/ --html-report reports/mypy
```

### **Code Formatting**
```bash
# Format with black
black Backend/

# Sort imports
isort Backend/

# Style check
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
- **Type Checking**: `mypy` - Type checking
- **Code Formatting**: `black` - Code formatting
- **Import Sorting**: `isort` - Import sorting
- **Linting**: `flake8` - Style checking
- **Pre-commit**: Automatic checks before commit

### **Manual Checks**
```bash
# Before every commit
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

### **Developing a New Function**

1. **Choose appropriate template** from `templates/function_templates.py`
2. **Add type annotations** for every parameter and function
3. **Add docstring** in Hebrew
4. **Check with mypy**: `make type-check`
5. **Format with black**: `make format`
6. **Check style**: `make lint`
7. **Run tests**: `make test`
8. **Commit with pre-commit hooks**

### **Commit Process**
```bash
# 1. Automatic checks
git add .
pre-commit run --all-files

# 2. Manual checks
make check-all
make test

# 3. Commit
git commit -m "feat: add new function with type annotations"
```

## 🔧 Troubleshooting

### **Common Issues**

#### **Mypy Errors**
```bash
# Check type errors
mypy Backend/ --show-error-codes

# Ignore missing imports (temporary)
mypy Backend/ --ignore-missing-imports
```

#### **Black Formatting Issues**
```bash
# Check what will change
black Backend/ --check --diff

# Automatic formatting
black Backend/
```

#### **Import Issues**
```bash
# Sort imports
isort Backend/ --check-only --diff

# Automatic sorting
isort Backend/
```

## 📞 Support

### **Getting Help**
1. Check [Development Guidelines](./Backend/DEVELOPMENT_GUIDELINES.md)
2. Use templates from `templates/function_templates.py`
3. Run `make check-all` to identify issues
4. Contact the development team

### **Reporting Issues**
- Detailed description of the problem
- Code that causes the problem
- Complete error messages
- Development environment (OS, Python version, etc.)
