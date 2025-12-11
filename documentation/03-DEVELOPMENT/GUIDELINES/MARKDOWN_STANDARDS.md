# Markdown Standards Guide - TikTrack

**תאריך יצירה:** ינואר 2025  
**גרסה:** 1.0.0  
**סטטוס:** ✅ פעיל

---

## 📋 תוכן עניינים

1. [סקירה כללית](#סקירה-כללית)
2. [כללי כתיבה](#כללי-כתיבה)
3. [דוגמאות נכונות/לא נכונות](#דוגמאות-נכונותלא-נכונות)
4. [פתרון בעיות נפוצות](#פתרון-בעיות-נפוצות)
5. [Markdownlint Rules](#markdownlint-rules)

---

## 🎯 סקירה כללית

מדריך זה מגדיר את כללי הכתיבה והפורמט של קבצי Markdown בפרויקט TikTrack. כל קבצי ה-markdown חייבים לעבור בדיקת markdownlint לפני commit ו-push.

### כלים

- **markdownlint-cli**: כלי בדיקה אוטומטי
- **קובץ הגדרות**: `.markdownlint.json`
- **קובץ התעלמות**: `.markdownlintignore`

### פקודות

```bash
# בדיקה לפני commit
npm run markdownlint:check

# תיקון אוטומטי
npm run markdownlint:fix

# דוח מפורט
npm run markdownlint:report
```

---

## 📝 כללי כתיבה

### 1. אורך שורה

- **מקסימום**: 120 תווים
- **חריגים**: code blocks, tables, links ארוכים
- **תיקון**: שבירת שורות ארוכות

### 2. סגנון כותרות

- **סגנון**: ATX (`#` style)
- **לא נכון**: `===` או `---` תחת כותרות
- **רווחים**: רווח אחד אחרי `#`

**נכון:**

```markdown
# כותרת רמה 1

## כותרת רמה 2
```

**לא נכון:**

```markdown
כותרת רמה 1
============
```

### 3. הזחה

- **רווחים**: 2 רווחים (לא tabs)
- **רשימות**: הזחה של 2 רווחים לכל רמה

**נכון:**

```markdown
- פריט ראשון
  - תת-פריט
    - תת-תת-פריט
```

### 4. רווחים סביב אלמנטים

- **כותרות**: רווח אחד לפני ואחרי
- **רשימות**: רווח אחד לפני ואחרי
- **Code blocks**: רווח אחד לפני ואחרי

**נכון:**

```markdown
## סעיף

רשימה:
- פריט 1
- פריט 2

```python
code here
```

טקסט נוסף

```

### 5. Code Blocks

- **חובה**: שפת תכנות אחרי ```
- **רווחים**: רווח אחד לפני ואחרי

**נכון:**
```markdown
דוגמה לקוד:

```python
def hello():
    print("Hello")
```

```

**לא נכון:**
```markdown
דוגמה לקוד:
```

def hello():
    print("Hello")

```
```

### 6. קישורים

- **תיאור**: מומלץ לכלול תיאור
- **קישורים פנימיים**: בדיקת תקינות fragment

**נכון:**

```markdown
[מדריך מפתחים](documentation/03-DEVELOPMENT/GUIDES/README.md)
```

**לא נכון:**

```markdown
[קישור](documentation/03-DEVELOPMENT/GUIDES/README.md#סעיף-לא-קיים)
```

---

## ✅ דוגמאות נכונות/לא נכונות

### דוגמה 1: כותרות

**נכון:**

```markdown
# TikTrack - תיעוד מערכת

## סקירה כללית

TikTrack היא מערכת ניהול מסחר מתקדמת.
```

**לא נכון:**

```markdown
# TikTrack - תיעוד מערכת
## סקירה כללית
TikTrack היא מערכת ניהול מסחר מתקדמת.
```

### דוגמה 2: רשימות

**נכון:**

```markdown
תכונות מרכזיות:

- ניהול טריידים
- ניהול חשבונות
- התראות מתקדמות
```

**לא נכון:**

```markdown
תכונות מרכזיות:
- ניהול טריידים
- ניהול חשבונות
- התראות מתקדמות
```

### דוגמה 3: Code Blocks

**נכון:**

```markdown
דוגמה לקוד Python:

```python
def calculate_total(items):
    return sum(item.price for item in items)
```

```

**לא נכון:**
```markdown
דוגמה לקוד Python:
```

def calculate_total(items):
    return sum(item.price for item in items)

```
```

---

## 🔧 פתרון בעיות נפוצות

### שגיאה: MD013 - Line length

**בעיה:** שורה ארוכה מ-120 תווים

**פתרון:**

```markdown
# לפני
זהו טקסט ארוך מאוד שמכיל יותר מ-120 תווים ולכן צריך לשבור אותו לשורות קצרות יותר

# אחרי
זהו טקסט ארוך מאוד שמכיל יותר מ-120 תווים ולכן צריך
לשבור אותו לשורות קצרות יותר
```

### שגיאה: MD032 - Blanks around lists

**בעיה:** חסרים רווחים סביב רשימות

**פתרון:**

```markdown
# לפני
תכונות:
- תכונה 1
- תכונה 2
מעבר לטקסט

# אחרי
תכונות:

- תכונה 1
- תכונה 2

מעבר לטקסט
```

### שגיאה: MD031 - Blanks around fences

**בעיה:** חסרים רווחים סביב code blocks

**פתרון:**

```markdown
# לפני
דוגמה:
```python
code here
```

מעבר לטקסט

# אחרי

דוגמה:

```python
code here
```

מעבר לטקסט

```

### שגיאה: MD022 - Blanks around headings

**בעיה:** חסרים רווחים סביב כותרות

**פתרון:**
```markdown
# לפני
טקסט לפני
## כותרת
טקסט אחרי

# אחרי
טקסט לפני

## כותרת

טקסט אחרי
```

### שגיאה: MD040 - Fenced code language

**בעיה:** code block ללא שפת תכנות

**פתרון:**

```markdown
# לפני
```

code here

```

# אחרי
```python
code here
```

```

### שגיאה: MD051 - Link fragments

**בעיה:** קישור פנימי לא תקין (בעיקר עם עברית)

**פתרון:**
```markdown
# לפני
[סקירה כללית](#סקירה-כללית)

# אחרי - בדוק שהכותרת קיימת
## סקירה כללית

[סקירה כללית](#סקירה-כללית)
```

---

## 📚 Markdownlint Rules

### כללים מופעלים

- **MD001** - Heading levels should only increment by one level at a time
- **MD003** - Heading style (ATX)
- **MD007** - Unordered list indentation (2 spaces)
- **MD009** - Trailing spaces
- **MD013** - Line length (120 chars, not for code blocks)
- **MD022** - Headings should be surrounded by blank lines
- **MD024** - Multiple headings with the same content (siblings only)
- **MD026** - Trailing punctuation in headings
- **MD029** - Ordered list item prefix
- **MD030** - Spaces after list markers
- **MD031** - Fenced code blocks should be surrounded by blank lines
- **MD032** - Lists should be surrounded by blank lines
- **MD037** - Spaces inside emphasis markers
- **MD038** - Spaces inside code span elements
- **MD039** - Spaces inside link text
- **MD040** - Fenced code blocks should have a language specified
- **MD046** - Code block style (fenced)
- **MD047** - Files should end with a single newline character

### כללים מושבתים

- **MD012** - Multiple consecutive blank lines (מותר בפרויקט)
- **MD033** - HTML in markdown (מותר בפרויקט)
- **MD034** - Bare URL used (מותר בפרויקט)
- **MD036** - Emphasis used instead of a heading (מותר בפרויקט)
- **MD041** - First line should be a top level heading (לא תמיד רלוונטי)

### תיקיות מוחרגות

- `documentation/05-REPORTS/` - דוחות אוטומטיים עם פורמטים שונים
- `documentation/audits/` - קבצים אוטומטיים
- `.cursor/` - תצורת IDE
- `node_modules/`, `.git/`, `archive/`, `backup/`, `.pytest_cache/` - תיקיות מערכת

### קבצים שנבדקים

markdownlint בודק את כל קבצי ה-markdown בפרויקט:

- כל קבצי `documentation/` (חוץ מהתיקיות המוחרגות)
- README files (בשורש, tests/, Backend/, וכו')
- קבצי מדריכים (`trading-ui/*.md`, `tests/*.md`)
- קבצי דוחות (`Backend/reports/*.md`)
- כל קבצי `.md` אחרים בפרויקט

---

## 🔗 קישורים נוספים

- **כללי עבודה**: `documentation/DOCUMENTATION_WORKING_RULES.md`
- **Code Quality Guide**: `documentation/03-DEVELOPMENT/TOOLS/CODE_QUALITY_SYSTEMS_GUIDE.md`
- **Cursor Rules**: `.cursorrules`
- **Markdownlint Documentation**: https://github.com/DavidAnson/markdownlint

---

**עדכון אחרון:** ינואר 2025

