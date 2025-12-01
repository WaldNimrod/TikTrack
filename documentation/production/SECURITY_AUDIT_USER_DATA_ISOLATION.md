# סקר אבטחה - בידוד נתוני משתמשים

**תאריך:** 01.12.2025  
**סביבה:** Production  
**מטרה:** זיהוי כל המקומות במערכת שבהם מוצגים נתונים של כל המשתמשים במקום רק של המשתמש הפעיל

---

## סיכום ביצועים

### בעיות קריטיות שזוהו

1. **Trading Accounts API** - מחזיר את כל החשבונות של כל המשתמשים
2. **Notes API** - מחזיר את כל ההערות של כל המשתמשים
3. **Portfolio API** - מחזיר נתוני פורטפוליו של כל המשתמשים
4. **Trade Plan Matching** - מציג הצעות המבוססות על כל המשתמשים

---

## ממצאים מפורטים

### 1. Trading Accounts API

**קובץ:** `Backend/routes/api/trading_accounts.py`

#### בעיה:
- **Endpoint:** `GET /api/trading-accounts/open`
- **בעיה:** לא מעביר `user_id` ל-service
- **תיקון שבוצע:** ✅ תוקן - הוספת `user_id = getattr(g, 'user_id', None)` והעברה ל-service

#### קוד בעייתי (לפני תיקון):
```python
@trading_accounts_bp.route('/open', methods=['GET'])
@api_endpoint(cache_ttl=60, rate_limit=60)
@handle_database_session()
def get_open_trading_accounts():
    db: Session = g.db
    trading_accounts = TradingAccountService.get_open_trading_accounts(db)  # ❌ לא מעביר user_id
```

#### קוד מתוקן:
```python
@trading_accounts_bp.route('/open', methods=['GET'])
@api_endpoint(cache_ttl=60, rate_limit=60)
@handle_database_session()
def get_open_trading_accounts():
    db: Session = g.db
    user_id = getattr(g, 'user_id', None)  # ✅ מקבל user_id
    trading_accounts = TradingAccountService.get_open_trading_accounts(db, user_id=user_id)  # ✅ מעביר user_id
```

#### סטטוס:
- ✅ **תוקן** ב-`Backend/routes/api/trading_accounts.py`
- ✅ **תוקן** ב-`production/Backend/routes/api/trading_accounts.py`
- ⚠️ **נדרש בדיקה:** האם `g.user_id` מוגדר נכון ב-auth middleware

---

### 2. Notes API

**קובץ:** `Backend/routes/api/notes.py`

#### בעיה:
- **Endpoint:** `GET /api/notes/`
- **בעיה:** מחזיר את כל ההערות של כל המשתמשים ללא סינון לפי `user_id`
- **קוד בעייתי:**
```python
@notes_bp.route('/', methods=['GET'])
def get_notes():
    db = next(get_db())
    notes = db.query(Note).order_by(Note.created_at.desc()).all()  # ❌ לא מסנן לפי user_id
```

#### תיקון נדרש:
```python
@notes_bp.route('/', methods=['GET'])
@handle_database_session()
def get_notes():
    db: Session = g.db
    user_id = getattr(g, 'user_id', None)
    query = db.query(Note).order_by(Note.created_at.desc())
    if user_id is not None:
        query = query.filter(Note.user_id == user_id)  # ✅ סינון לפי user_id
    notes = query.all()
```

#### סטטוס:
- ❌ **לא תוקן** - נדרש תיקון

---

### 3. Portfolio API

**קובץ:** `Backend/routes/api/positions.py`

#### בעיה:
- **Endpoint:** `GET /api/positions/portfolio`
- **בעיה:** `PositionPortfolioService.calculate_portfolio_summary` לא מקבל `user_id` ולא מסנן לפי משתמש
- **קוד בעייתי:**
```python
@positions_bp.route('/portfolio', methods=['GET'])
def get_portfolio():
    db: Session = g.db
    portfolio_data = PositionPortfolioService.calculate_portfolio_summary(
        db=db,
        account_id_filter=account_id_filter,  # ❌ לא מסנן לפי user_id
        # ...
    )
```

#### תיקון נדרש:
1. להוסיף `user_id` ל-`calculate_portfolio_summary`
2. לסנן חשבונות לפי `user_id` לפני חישוב הפורטפוליו
3. לסנן עסקאות וביצועים לפי `user_id`

#### סטטוס:
- ❌ **לא תוקן** - נדרש תיקון

---

### 4. Trade Plan Matching Service

**קובץ:** `Backend/services/trade_plan_matching_service.py`

#### בעיה:
- **Endpoints:**
  - `GET /api/trades/pending-plan/assignments`
  - `GET /api/trades/pending-plan/creations`
- **בעיה:** `TradePlanMatchingService.get_assignment_suggestions` ו-`get_creation_suggestions` לא מסננים לפי `user_id`
- **קוד בעייתי:**
```python
@trades_bp.route('/pending-plan/assignments', methods=['GET'])
def get_trades_pending_plan_assignments():
    suggestions = TradePlanMatchingService.get_assignment_suggestions(
        db,
        max_items=limit,
        # ❌ לא מעביר user_id
    )
```

#### תיקון נדרש:
1. להוסיף `user_id` ל-`get_assignment_suggestions` ו-`get_creation_suggestions`
2. לסנן עסקאות ותכניות מסחר לפי `user_id`

#### סטטוס:
- ❌ **לא תוקן** - נדרש תיקון

---

### 5. Base Entity API

**קובץ:** `Backend/routes/api/base_entity.py`

#### בעיה פוטנציאלית:
- **שורה 87:** מעביר `user_id` כפרמטר keyword, אבל לא כל ה-services תומכים בזה
- **קוד:**
```python
if 'user_id' in params:
    records = self.service_class.get_all(db, user_id=user_id)  # ⚠️ keyword argument
```

#### בעיה:
- אם ה-service מצפה לפרמטר positional, זה לא יעבוד
- צריך לבדוק את כל ה-services

#### סטטוס:
- ⚠️ **נדרש בדיקה** - לבדוק את כל ה-services שמשתמשים ב-`BaseEntityAPI`

---

## רשימת Services לבדיקה

### Services שתומכים ב-user_id (✅):
1. ✅ `TradingAccountService.get_all(db, user_id=...)`
2. ✅ `TradingAccountService.get_open_trading_accounts(db, user_id=...)`
3. ✅ `ExecutionService.get_all(db, user_id=...)`
4. ✅ `CashFlowService.get_all(db, user_id=...)`
5. ✅ `TradeService.get_all(db, user_id=...)` - **נבדק - תומך**
6. ✅ `TradePlanService.get_all(db, user_id=...)` - **נבדק - תומך**
7. ✅ `AlertService.get_all(db, user_id=...)` - **נבדק - תומך**

### Services שצריך לבדוק/לתקן (⚠️):
1. ❌ `NoteService` - לא קיים כשירות נפרד, Notes API לא מסנן לפי user_id
2. ❌ `PositionPortfolioService.calculate_portfolio_summary()` - לא מקבל user_id
3. ❌ `TradePlanMatchingService.get_assignment_suggestions()` - לא מקבל user_id
4. ❌ `TradePlanMatchingService.get_creation_suggestions()` - לא מקבל user_id

### Services שלא צריכים user_id (מידע כללי):
1. ✅ `TickerService` - טיקרים משותפים לכל המשתמשים
2. ✅ `CurrencyService` - מטבעות משותפים לכל המשתמשים
3. ✅ `TagService` - צריך לבדוק - אולי צריך user_id?

---

## תוכנית תיקון

### עדיפות גבוהה (קריטי):
1. ✅ **Trading Accounts** - תוקן
2. ❌ **Notes API** - צריך תיקון מיידי
3. ❌ **Portfolio API** - צריך תיקון מיידי

### עדיפות בינונית:
4. ❌ **Trade Plan Matching** - צריך תיקון
5. ⚠️ **Base Entity API** - צריך בדיקה מקיפה

### עדיפות נמוכה (בדיקה):
6. ⚠️ **כל ה-services שמשתמשים ב-BaseEntityAPI** - לבדוק אחד אחד

---

## בדיקות נדרשות

### 1. בדיקת Auth Middleware
- [ ] לבדוק ש-`g.user_id` מוגדר נכון אחרי התחברות
- [ ] לבדוק ש-`g.user_id` הוא `None` כשלא מחוברים
- [ ] לבדוק שהמידלוור רץ לפני כל ה-API endpoints

### 2. בדיקת Base Entity API
- [ ] לבדוק את כל ה-services שמשתמשים ב-`BaseEntityAPI`
- [ ] לוודא שכל ה-services תומכים ב-`user_id` parameter
- [ ] לבדוק את הסיגנטורות של כל ה-services

### 3. בדיקת Endpoints מותאמים אישית
- [ ] `GET /api/notes/` - לא משתמש ב-BaseEntityAPI
- [ ] `GET /api/positions/portfolio` - לא משתמש ב-BaseEntityAPI
- [ ] `GET /api/trades/pending-plan/*` - לא משתמש ב-BaseEntityAPI

---

## המלצות

1. **תיקון מיידי:** Notes API ו-Portfolio API
2. **בדיקה מקיפה:** כל ה-services שמשתמשים ב-BaseEntityAPI
3. **תיעוד:** ליצור רשימה של כל ה-endpoints שצריכים user_id filtering
4. **בדיקות אוטומטיות:** ליצור בדיקות E2E שבודקות בידוד נתונים

---

## הערות

- הסקר בוצע ב-01.12.2025
- נמצאו לפחות 4 בעיות קריטיות
- 1 בעיה תוקנה (Trading Accounts)
- 3 בעיות נדרשות לתיקון מיידי

---

## ממצאים נוספים

### 6. Trade Service

**קובץ:** `Backend/services/trade_service.py`

#### בדיקה:
- ✅ `TradeService.get_all()` - צריך לבדוק אם תומך ב-user_id
- ⚠️ `TradeService.get_trades_without_plan()` - לא מקבל user_id

#### סטטוס:
- ⚠️ **נדרש בדיקה** - לבדוק את כל המתודות ב-TradeService

---

### 7. Trade Plan Service

**קובץ:** `Backend/services/trade_plan_service.py`

#### בדיקה:
- ⚠️ `TradePlanService.get_all()` - צריך לבדוק אם תומך ב-user_id
- ⚠️ `TradePlanService.get_by_account()` - לא מקבל user_id

#### סטטוס:
- ⚠️ **נדרש בדיקה** - לבדוק את כל המתודות ב-TradePlanService

---

### 8. Alert Service

**קובץ:** `Backend/services/alert_service.py`

#### בדיקה:
- ⚠️ `AlertService.get_all()` - צריך לבדוק אם תומך ב-user_id

#### סטטוס:
- ⚠️ **נדרש בדיקה** - לבדוק את כל המתודות ב-AlertService

---

### 9. Position Portfolio Service

**קובץ:** `Backend/services/position_portfolio_service.py`

#### בעיה:
- **מתודה:** `calculate_portfolio_summary()`
- **בעיה:** לא מקבל `user_id` ולא מסנן לפי משתמש
- **השפעה:** מחזיר פורטפוליו של כל המשתמשים

#### תיקון נדרש:
1. להוסיף `user_id` parameter ל-`calculate_portfolio_summary()`
2. לסנן חשבונות לפי `user_id` לפני חישוב
3. לסנן עסקאות וביצועים לפי `user_id`

#### סטטוס:
- ❌ **לא תוקן** - נדרש תיקון

---

## רשימת בדיקות מפורטת

### Endpoints שצריכים user_id filtering:

1. ✅ `GET /api/trading-accounts/` - משתמש ב-BaseEntityAPI (צריך לבדוק)
2. ✅ `GET /api/trading-accounts/open` - תוקן
3. ❌ `GET /api/notes/` - לא משתמש ב-BaseEntityAPI, צריך תיקון ידני
4. ⚠️ `GET /api/trades/` - משתמש ב-BaseEntityAPI (צריך לבדוק)
5. ⚠️ `GET /api/trade-plans/` - משתמש ב-BaseEntityAPI (צריך לבדוק)
6. ⚠️ `GET /api/executions/` - משתמש ב-BaseEntityAPI (צריך לבדוק)
7. ⚠️ `GET /api/alerts/` - משתמש ב-BaseEntityAPI (צריך לבדוק)
8. ⚠️ `GET /api/cash-flows/` - משתמש ב-BaseEntityAPI (צריך לבדוק)
9. ❌ `GET /api/positions/portfolio` - לא משתמש ב-BaseEntityAPI, צריך תיקון
10. ❌ `GET /api/trades/pending-plan/assignments` - לא משתמש ב-BaseEntityAPI, צריך תיקון
11. ❌ `GET /api/trades/pending-plan/creations` - לא משתמש ב-BaseEntityAPI, צריך תיקון

---

## עדכונים

### 01.12.2025 - 13:00
- ✅ תוקן Trading Accounts API
- ❌ זוהו 3 בעיות נוספות שצריכות תיקון
- ⚠️ זוהו 8 endpoints נוספים שצריכים בדיקה

### 01.12.2025 - 13:30
- 📄 נוצר דוח נוסף: `SECURITY_AUDIT_PAGE_PROTECTION.md` - בדיקת הגנת עמודים

