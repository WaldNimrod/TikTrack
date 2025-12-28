# Security Guidelines - TikTrack Development

# ===========================================

# הנחיות אבטחה למפתחים

**תאריך:** 01.12.2025  
**גרסה:** 1.0.0  
**מטרה:** הנחיות למפתחים להוספת user_id filtering והגנת עמודים

---

## תוכן עניינים

1. [בידוד נתוני משתמשים (Backend)](#בידוד-נתוני-משתמשים-backend)
2. [הגנת עמודים (Frontend)](#הגנת-עמודים-frontend)
3. [בדיקות נדרשות](#בדיקות-נדרשות)
4. [דוגמאות קוד](#דוגמאות-קוד)

---

## בידוד נתוני משתמשים (Backend)

### כלל בסיסי

**כל API endpoint שמחזיר נתונים של משתמשים חייב לסנן לפי `user_id`**

### איך זה עובד

1. **Auth Middleware** מגדיר `g.user_id` אוטומטית אחרי התחברות
2. **Endpoints** מקבלים `user_id` מ-`g.user_id`
3. **Services** מסננים נתונים לפי `user_id`

### דוגמאות

#### ✅ נכון - Endpoint עם סינון user_id

```python
@my_bp.route('/', methods=['GET'])
@handle_database_session()
def get_my_entities():
    db: Session = g.db
    # ✅ מקבל user_id מ-Flask context
    user_id = getattr(g, 'user_id', None)
    
    query = db.query(MyEntity).order_by(MyEntity.created_at.desc())
    # ✅ מסנן לפי user_id אם קיים
    if user_id is not None:
        query = query.filter(MyEntity.user_id == user_id)
    
    entities = query.all()
    # ... rest of code
```

#### ❌ שגוי - Endpoint ללא סינון user_id

```python
@my_bp.route('/', methods=['GET'])
def get_my_entities():
    db = next(get_db())
    # ❌ לא מסנן לפי user_id - מחזיר נתונים של כל המשתמשים!
    entities = db.query(MyEntity).all()
    # ... rest of code
```

### Services עם user_id

#### ✅ נכון - Service תומך ב-user_id

```python
class MyService:
    @staticmethod
    def get_all(db: Session, user_id: Optional[int] = None) -> List[MyEntity]:
        query = db.query(MyEntity)
        if user_id is not None:
            query = query.filter(MyEntity.user_id == user_id)
        return query.all()
```

#### ❌ שגוי - Service לא תומך ב-user_id

```python
class MyService:
    @staticmethod
    def get_all(db: Session) -> List[MyEntity]:
        # ❌ לא מקבל user_id - מחזיר נתונים של כל המשתמשים!
        return db.query(MyEntity).all()
```

### Base Entity API

**BaseEntityAPI תומך אוטומטית ב-user_id filtering**

אם ה-service תומך ב-`user_id` parameter, BaseEntityAPI יעביר אותו אוטומטית:

```python
# ✅ נכון - Service תומך ב-user_id
class MyService:
    @staticmethod
    def get_all(db: Session, user_id: Optional[int] = None) -> List[MyEntity]:
        query = db.query(MyEntity)
        if user_id is not None:
            query = query.filter(MyEntity.user_id == user_id)
        return query.all()

# BaseEntityAPI יעביר user_id אוטומטית
base_api = BaseEntityAPI('my_entity', MyService, 'my_entities')
```

### Endpoints מותאמים אישית

אם יש לך endpoint מותאם אישית (לא משתמש ב-BaseEntityAPI), **חייב** להוסיף סינון user_id:

```python
@my_bp.route('/custom', methods=['GET'])
@handle_database_session()
def get_custom_data():
    db: Session = g.db
    # ✅ חייב להוסיף
    user_id = getattr(g, 'user_id', None)
    
    # ✅ חייב לסנן לפי user_id
    query = db.query(MyEntity).filter(MyEntity.some_field == value)
    if user_id is not None:
        query = query.filter(MyEntity.user_id == user_id)
    
    entities = query.all()
    # ... rest of code
```

---

## הגנת עמודים (Frontend)

### כלל בסיסי

**כל עמוד פרטי חייב להיות מוגן על ידי auth-guard**

### איך זה עובד

1. **BASE package** טוען `auth.js` ו-`auth-guard.js` אוטומטית
2. **auth-guard.js** בודק אימות לפני טעינת תוכן
3. **אם לא מחובר** - מפנה לדף הכניסה
4. **אם מחובר** - מאפשר גישה לעמוד

### עמודים ציבוריים

עמודים שלא צריכים אימות (login, register, reset-password, forgot-password):

```javascript
// ב-auth-guard.js
const PUBLIC_PAGES = [
  'login.html',
  'register.html',
  'reset_password.html',
  'forgot_password.html'
];
```

**איך זה עובד:**

1. `auth-guard.js` בודק אם העמוד הנוכחי הוא public page לפני בדיקת authentication
2. אם העמוד הוא public page, `initAuthGuard()` מחזיר מיד ללא בדיקת authentication
3. זה מונע redirect loop כשמנסים לגשת לעמודים ציבוריים

**אין צורך לעשות כלום** - auth-guard מזהה עמודים ציבוריים אוטומטית.

**הוספת עמוד ציבורי חדש:**
אם יוצרים עמוד ציבורי חדש, יש להוסיף אותו ל-`PUBLIC_PAGES` ב-`auth-guard.js`.

### עמודים פרטיים

**אין צורך לעשות כלום** - auth-guard נטען אוטומטית דרך BASE package ומגן על כל העמודים.

### מניעת לופ הפניה (Redirect Loop Prevention)

**בעיה נפוצה:** אחרי login מוצלח, המשתמש מועבר חזרה לעמוד המקורי, אבל `auth-guard.js` בודק authentication לפני שה-session cookie נשמר במלואו, מה שגורם ל-redirect loop.

**פתרון:**

1. **בדיקת עמוד ציבורי ראשונה:**
   - `initAuthGuard()` בודק אם העמוד הוא public page לפני כל בדיקה אחרת
   - אם כן, מחזיר מיד ללא בדיקת authentication

2. **מנגנון timestamp:**
   - אחרי login מוצלח, `auth.js` שומר timestamp ב-`sessionStorage`: `sessionStorage.setItem('recent_login_timestamp', Date.now().toString())`
   - `auth-guard.js` בודק את ה-timestamp לפני בדיקת authentication
   - אם login היה לפני פחות מ-5 שניות, ממתין 2 שניות נוספות לפני בדיקה
   - אחרי המתנה, מנקה את ה-timestamp

3. **הארכת זמן המתנה:**
   - זמן המתנה הוגדל מ-500ms ל-1000ms כדי לתת ל-session cookie יותר זמן להישמר

4. **בדיקת login page:**
   - אם המשתמש כבר ב-`/login.html`, לא מבצע redirect

**דוגמת קוד:**

```javascript
// ב-auth-guard.js - initAuthGuard()
async function initAuthGuard() {
  // בדיקה ראשונה - האם זה עמוד ציבורי?
  if (isPublicPage()) {
    return; // אין צורך לבדוק authentication
  }
  
  // בדיקת מניעת לופ
  const recentLogin = sessionStorage.getItem('recent_login_timestamp');
  if (recentLogin) {
    const timeSinceLogin = Date.now() - parseInt(recentLogin);
    if (timeSinceLogin < 5000) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      sessionStorage.removeItem('recent_login_timestamp');
    }
  }
  
  // הארכת זמן המתנה
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // ... rest of authentication check
}

// ב-auth.js - אחרי login מוצלח
if (data.data?.user) {
  await saveAuthToCache(currentUser, authToken);
  
  // Save timestamp to prevent redirect loop
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem('recent_login_timestamp', Date.now().toString());
  }
}
```

### יצירת עמוד חדש

#### ✅ נכון - עמוד פרטי

```html
<!DOCTYPE html>
<html>
<head>
    <title>My New Page</title>
</head>
<body>
    <!-- BASE package נטען אוטומטית -->
    <!-- auth-guard מגן על העמוד אוטומטית -->
    <h1>My Protected Page</h1>
</body>
</html>
```

**אין צורך להוסיף כלום** - auth-guard נטען אוטומטית.

#### ✅ נכון - עמוד ציבורי

אם יוצרים עמוד ציבורי חדש, צריך להוסיף ל-`PUBLIC_PAGES`:

```javascript
// ב-auth-guard.js
const PUBLIC_PAGES = [
  'login.html',
  'register.html',
  'reset_password.html',
  'forgot_password.html',
  'my-new-public-page.html'  // ✅ הוסף כאן
];
```

---

## בדיקות נדרשות

### Backend

לכל endpoint חדש, בדוק:

1. ✅ **מקבל user_id** - `user_id = getattr(g, 'user_id', None)`
2. ✅ **מסנן לפי user_id** - `query.filter(Entity.user_id == user_id)`
3. ✅ **Service תומך ב-user_id** - `def get_all(db, user_id=None)`

### Frontend

לכל עמוד חדש, בדוק:

1. ✅ **auth-guard נטען** - `typeof window.AuthGuard !== 'undefined'`
2. ✅ **עמוד ציבורי?** - אם כן, הוסף ל-`PUBLIC_PAGES`
3. ✅ **עמוד פרטי?** - אין צורך לעשות כלום (auth-guard מגן אוטומטית)

### בדיקות E2E

לכל endpoint/עמוד חדש, בדוק:

1. ✅ **משתמש A לא רואה נתונים של משתמש B**
2. ✅ **משתמש לא מחובר לא יכול לגשת לעמודים פרטיים**
3. ✅ **משתמש מחובר יכול לגשת לעמודים פרטיים**

---

## דוגמאות קוד

### Backend - Endpoint חדש

```python
from flask import Blueprint, jsonify, request, g
from sqlalchemy.orm import Session
from .base_entity_decorators import handle_database_session
from models.my_entity import MyEntity

my_bp = Blueprint('my_entity', __name__, url_prefix='/api/my-entities')

@my_bp.route('/', methods=['GET'])
@handle_database_session()  # ✅ חשוב!
def get_my_entities():
    """Get all my entities (filtered by user_id)"""
    db: Session = g.db
    # ✅ מקבל user_id מ-Flask context
    user_id = getattr(g, 'user_id', None)
    
    query = db.query(MyEntity).order_by(MyEntity.created_at.desc())
    # ✅ מסנן לפי user_id אם קיים
    if user_id is not None:
        query = query.filter(MyEntity.user_id == user_id)
    
    entities = query.all()
    data = [entity.to_dict() for entity in entities]
    
    return jsonify({
        "status": "success",
        "data": data,
        "version": "1.0"
    }), 200
```

### Backend - Service חדש

```python
from sqlalchemy.orm import Session
from typing import List, Optional
from models.my_entity import MyEntity

class MyService:
    @staticmethod
    def get_all(db: Session, user_id: Optional[int] = None) -> List[MyEntity]:
        """Get all entities (filtered by user_id if provided)"""
        query = db.query(MyEntity)
        # ✅ מסנן לפי user_id אם קיים
        if user_id is not None:
            query = query.filter(MyEntity.user_id == user_id)
        return query.all()
    
    @staticmethod
    def get_by_id(db: Session, entity_id: int, user_id: Optional[int] = None) -> Optional[MyEntity]:
        """Get entity by ID (with user_id check)"""
        query = db.query(MyEntity).filter(MyEntity.id == entity_id)
        # ✅ מסנן לפי user_id אם קיים
        if user_id is not None:
            query = query.filter(MyEntity.user_id == user_id)
        return query.first()
```

### Frontend - עמוד חדש

```html
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>My New Page</title>
</head>
<body>
    <!-- BASE package נטען אוטומטית -->
    <!-- auth-guard מגן על העמוד אוטומטית -->
    
    <div id="unified-header"></div>
    
    <main>
        <h1>My Protected Page</h1>
        <!-- תוכן העמוד -->
    </main>
    
    <!-- אין צורך להוסיף auth-guard - נטען אוטומטית -->
</body>
</html>
```

---

## כללי זהב

1. ✅ **תמיד סנן לפי user_id** - גם אם נראה שהמערכת חד-משתמשית
2. ✅ **תמיד השתמש ב-`@handle_database_session()`** - זה מגדיר `g.db` ו-`g.user_id`
3. ✅ **תמיד בדוק Service תומך ב-user_id** - לפני שימוש ב-BaseEntityAPI
4. ✅ **אל תניח שעמוד מוגן** - auth-guard נטען אוטומטית, אבל תמיד בדוק
5. ✅ **תמיד בדוק ב-Production** - סביבת פיתוח יכולה להיות שונה

---

## משאבים

- **דוח בידוד נתונים:** `documentation/production/SECURITY_AUDIT_USER_DATA_ISOLATION.md`
- **דוח הגנת עמודים:** `documentation/production/SECURITY_AUDIT_PAGE_PROTECTION.md`
- **סקריפט בדיקה Backend:** `scripts/security/user_data_isolation_test.py`
- **סקריפט בדיקה Frontend:** `scripts/security/frontend_auth_guard_test.js`

---

## שאלות נפוצות

### Q: מה אם Service לא תומך ב-user_id

**A:** צריך להוסיף תמיכה ב-user_id ל-Service:

```python
@staticmethod
def get_all(db: Session, user_id: Optional[int] = None) -> List[MyEntity]:
    query = db.query(MyEntity)
    if user_id is not None:
        query = query.filter(MyEntity.user_id == user_id)
    return query.all()
```

### Q: מה אם יש עמוד שלא צריך הגנה

**A:** הוסף ל-`PUBLIC_PAGES` ב-`auth-guard.js`:

```javascript
const PUBLIC_PAGES = [
  'login.html',
  'register.html',
  'my-public-page.html'  // ✅ הוסף כאן
];
```

### Q: מה אם g.user_id הוא None

**A:** זה תקין - יכול להיות None אם המשתמש לא מחובר. בדוק:

```python
user_id = getattr(g, 'user_id', None)
if user_id is not None:
    query = query.filter(Entity.user_id == user_id)
```

---

**עודכן:** 01.12.2025  
**גרסה:** 1.0.0

