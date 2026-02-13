# המלצות לביקורת וארגון קבצים - Backend (Team 20)

**לצוות:** Team 20 (Backend Implementation)  
**מאת:** Team 10 (The Gateway)  
**תאריך:** 2026-02-04 20:22:32  
**מטרה:** יישום תהליך ביקורת וארגון קבצים דומה לצד השרת

---

## 📋 Executive Summary

בוצעה ביקורת מקיפה של קבצי ה-UI, תיקון בעיות, ועדכון תיעוד. מומלץ ל-Team 20 לבצע תהליך דומה בצד השרת.

**תוצאות Frontend:**
- ✅ אין כפילויות - כל קובץ ייחודי
- ✅ תוקנו קישורים שגויים ב-HTML
- ✅ עודכן התיעוד עם כללי שמות קבצים וסידור תיקיות
- ✅ סה"כ קבצים פעילים: **50** (JS, JSX, HTML)

---

## 1. תהליך מומלץ ל-Backend

### שלב 1: בדיקת כפילויות

**מטרה:** לוודא שאין קבצים עם אותה פונקציונליות או אותו שם.

**פעולות:**
1. ספירת כל הקבצים ב-`api/` (Python, SQL, וכו')
2. חיפוש קבצים עם שמות דומים
3. בדיקת פונקציונליות כפולה

**כלים:**
```bash
# ספירת קבצים
find api/ -type f \( -name "*.py" -o -name "*.sql" \) | wc -l

# חיפוש קבצים עם שמות דומים
find api/ -type f -name "*.py" -exec basename {} \; | sort | uniq -d

# רשימת כל הקבצים
find api/ -type f \( -name "*.py" -o -name "*.sql" \) | sort
```

---

### שלב 2: בדיקת קבצים מיותרים

**מטרה:** לוודא שכל הקבצים בשימוש.

**פעולות:**
1. חיפוש קבצים שלא מיובאים בשום מקום
2. חיפוש קבצים שלא נקראים
3. העברת קבצים לא בשימוש לארכיון

**כלים:**
```bash
# חיפוש קבצים שלא מיובאים
grep -r "import.*filename" api/ | grep -v "filename.py"

# חיפוש קבצים שלא נקראים
grep -r "from.*filename" api/ | grep -v "filename.py"
```

---

### שלב 3: בדיקת שמות קבצים

**מטרה:** לוודא שכל הקבצים עומדים בתקנים.

**סטנדרטים מומלצים:**
- Python Files: `snake_case.py` (למשל `auth_service.py`, `user_repository.py`)
- SQL Files: `snake_case.sql` (למשל `create_users_table.sql`)
- Config Files: `kebab-case.yaml` או `snake_case.ini`

**איסורים:**
- ❌ אין קיצורים לא ברורים (למשל `d16_data_loader.py` → `trading_accounts_data_loader.py`)
- ❌ אין תחיליות מיותרות
- ❌ שמות חייבים להיות אינטואיטיביים

---

### שלב 4: ארגון תיקיות

**מטרה:** לוודא שהחלוקה למודולים נכונה.

**מבנה מוצע לפי Backend LEGO Architecture:**
```
api/
├── core/                    # Atoms (Core)
│   ├── database/
│   ├── models/
│   └── utils/
├── repositories/            # Molecules (Repositories)
│   ├── users/
│   ├── trading_accounts/
│   └── ...
├── services/                # Organisms (Services)
│   ├── auth/
│   ├── trading/
│   └── ...
└── cubes/                   # Modular Cubes
    ├── identity/
    ├── financial/
    └── ...
```

**עקרונות:**
- הפרדה בין קבצים גנריים (`core/`) לקבצים ספציפיים (מודולים)
- ארגון לפי מודולים עסקיים
- אין כפילויות, אין קבצים מיותרים

---

## 2. תיעוד רלוונטי

### תיעוד Backend Architecture:

- **[TT2_BACKEND_LEGO_SPEC.md](../../documentation/01-ARCHITECTURE/TT2_BACKEND_LEGO_SPEC.md)** - Backend LEGO Architecture (Atoms → Molecules → Organisms/Modular Cubes)
- **[TT2_BACKEND_CUBE_INVENTORY.md](../../documentation/01-ARCHITECTURE/TT2_BACKEND_CUBE_INVENTORY.md)** - אינוונטר קוביות Backend (17 קוביות)

### תיעוד סטנדרטים:

- **[TT2_JS_STANDARDS_PROTOCOL.md](../../documentation/10-POLICIES/TT2_JS_STANDARDS_PROTOCOL.md)** - פרוטוקול סטנדרטים (חלק מהכללים רלוונטיים גם ל-Backend)
- **[PHOENIX_MASTER_BIBLE.md](../../documentation/09-GOVERNANCE/standards/PHOENIX_MASTER_BIBLE.md)** - ספר החוקים המאסטר

### דוחות Frontend (להתייחסות):

- **[UI_CLEANUP_FINAL_REPORT.md](../team_10/UI_CLEANUP_FINAL_REPORT.md)** - דוח מסכם ביקורת Frontend
- **[UI_FILENAME_QUALITY_AUDIT_REPORT.md](../team_10/UI_FILENAME_QUALITY_AUDIT_REPORT.md)** - דוח ביקורת איכות שמות קבצים
- **[UI_DUPLICATES_AND_UNUSED_FILES_AUDIT.md](../team_10/UI_DUPLICATES_AND_UNUSED_FILES_AUDIT.md)** - דוח ביקורת כפילויות וקבצים מיותרים

---

## 3. Checklist ליישום

### בדיקות נדרשות:

- [ ] ספירת כל הקבצים ב-`api/`
- [ ] בדיקת כפילויות (שמות זהים)
- [ ] בדיקת כפילויות (פונקציונליות כפולה)
- [ ] בדיקת קבצים מיותרים (לא בשימוש)
- [ ] בדיקת שמות קבצים (עמידה בתקנים)
- [ ] בדיקת ארגון תיקיות (הפרדה נכונה למודולים)
- [ ] עדכון תיעוד (אם נדרש)

### תיקונים נדרשים:

- [ ] שינוי שמות קבצים לא ברורים
- [ ] העברת קבצים מיותרים לארכיון
- [ ] ארגון מחדש למודולים (אם נדרש)
- [ ] עדכון imports/references לאחר שינויים

---

## 4. דוח מומלץ

**לאחר ביצוע התהליך, מומלץ ליצור דוח דומה:**

1. **Executive Summary** - סיכום תוצאות
2. **ספירת קבצים** - סה"כ קבצים והתפלגות
3. **בדיקת כפילויות** - תוצאות בדיקה
4. **בדיקת קבצים מיותרים** - תוצאות בדיקה
5. **בדיקת שמות קבצים** - בעיות שזוהו ותיקונים
6. **ארגון תיקיות** - מבנה נוכחי ומבנה מוצע
7. **המלצות** - המלצות ליישום עתידי

---

## 5. שאלות להבהרה

אם יש שאלות או צורך בהבהרות, ניתן לפנות ל-Team 10 (The Gateway).

---

**תאריך:** 2026-02-04 20:22:32  
**מאת:** Team 10 (The Gateway)  
**סטטוס:** 📋 **RECOMMENDATION**
