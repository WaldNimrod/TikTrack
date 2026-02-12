# 📡 Team 60 → Team 20: בקשה לסקריפט מיגרציה ADR-015

**id:** `TEAM_60_TO_TEAM_20_ADR_015_MIGRATION_SCRIPT_REQUEST`  
**from:** Team 60 (DevOps & Platform)  
**to:** Team 20 (Backend Implementation)  
**date:** 2026-02-12  
**status:** 📋 **REQUEST — ממתין לסקריפט**  
**version:** v1.0  
**source:** `TEAM_10_ADR_015_BROKER_REFERENCE_WORK_PLAN.md` (§0, §3 שלב 2א, §6א)

---

## 📋 Executive Summary

**Team 60 מבקש מ-Team 20 את סקריפט המיגרציה להמרת `brokers_fees` (Account↔Fees) לצורך הרצה בסביבה.**

**תפקידים (לפי §0):**
- **Team 20:** כתיבת סקריפט המיגרציה (בעלות על סכמה לוגית)
- **Team 60:** הרצת מיגרציה בסביבה (לפי הנחיית Team 20)

---

## ✅ הבנת המיגרציה

### **מטרת המיגרציה:**

**שינוי מבנה טבלת `brokers_fees`:**
- ✅ **להוסיף:** `trading_account_id UUID NOT NULL` (FK ל-`trading_accounts`)
- ✅ **להסיר:** `broker VARCHAR(100)` (broker הוא מטא-דאטה של חשבון בלבד)
- ✅ **לשמור:** `commission_value NUMERIC(20,6)` (כבר הומר)

### **לוגיקת מיגרציה (לפי §6א):**

| שלב | פעולה |
|-----|--------|
| **1. מיפוי** | לכל רשומת עמלה קיימת (user_id, broker): חפש חשבון מסחר עם אותו user_id ואותו broker |
| **2. התאמה יחידה** | אם נמצא חשבון אחד תואם — עדכן `trading_account_id` |
| **3. כמה התאמות** | אם נמצאו כמה חשבונות תואמים — שייך לראשון לפי created_at |
| **4. אין התאמה** | אם אין חשבון תואם — לרשום ב-migration log (Team 20 יממש מדיניות) |
| **5. commission_value** | כבר NUMERIC(20,6) — אין צורך בהמרה |
| **6. סיום** | הוספת trading_account_id, מילוי לפי 1–4, הסרת broker, הוספת constraint NOT NULL |

---

## 📋 בקשה לסקריפט

### **מה Team 60 צריך:**

1. ✅ **סקריפט SQL מוכן להרצה** — `scripts/migrations/migrate_brokers_fees_account_reference.sql` (או שם אחר)
2. ✅ **תיעוד** — הוראות הרצה, תלויות, אימות
3. ✅ **נוהל הרצה** — האם להריץ דרך `make db-*` או ישירות

### **פורמט מצופה:**

- ✅ **קובץ SQL** — ניתן להרצה דרך `psql` או `docker exec`
- ✅ **Idempotent** — ניתן להריץ מספר פעמים ללא בעיות
- ✅ **Transaction-safe** — BEGIN/COMMIT/ROLLBACK
- ✅ **אימות מובנה** — בדיקות לאחר מיגרציה

---

## 🔄 תהליך הרצה (Team 60)

**לאחר קבלת הסקריפט:**

1. ✅ **גיבוי DB** — `python3 scripts/create_full_backup.py`
2. ✅ **אימות גיבוי** — קוד יציאה 0 + "Backup verified"
3. ✅ **הרצת מיגרציה** — לפי הנחיית Team 20
4. ✅ **אימות מיגרציה** — בדיקת מבנה טבלה, constraints, indexes
5. ✅ **דיווח** — ל-Team 10 ול-Team 20

---

## 📊 מצב נוכחי של הטבלה

**בדיקה שבוצעה:**

| עמודה | טיפוס נוכחי | סטטוס |
|--------|-------------|--------|
| `id` | UUID | ✅ תקין |
| `user_id` | UUID | ✅ תקין |
| `broker` | VARCHAR(100) | ❌ **להסיר** |
| `commission_type` | ENUM | ✅ תקין |
| `commission_value` | NUMERIC(20,6) | ✅ תקין (הומר) |
| `minimum` | NUMERIC(20,6) | ✅ תקין |
| `trading_account_id` | — | ❌ **להוסיף** |

**מספר שורות קיימות:** 8 (נתוני בדיקה)

---

## ✅ התחייבות Team 60

### **לאחר קבלת הסקריפט:**

1. ✅ **גיבוי** — Team 60 יבצע גיבוי מלא לפני המיגרציה
2. ✅ **הרצה** — Team 60 יריץ את המיגרציה לפי הנחיית Team 20
3. ✅ **אימות** — Team 60 יאמת את תוצאות המיגרציה
4. ✅ **דיווח** — Team 60 ידווח על השלמה ל-Team 10 ול-Team 20

---

## 📁 מסמכי מקור

### **תוכנית עבודה:**
- `_COMMUNICATION/team_10/TEAM_10_ADR_015_BROKER_REFERENCE_WORK_PLAN.md` — §0, §3 שלב 2א, §6א

### **SSOT:**
- `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql` — מבנה טבלה רצוי (שורות 1026-1075)

---

## ✅ סיכום

### **מה Team 60 מבקש:**

1. ✅ **סקריפט מיגרציה מוכן** — מ-Team 20
2. ✅ **תיעוד** — הוראות הרצה ואימות
3. ✅ **נוהל הרצה** — האם דרך `make db-*` או ישירות

### **מה Team 60 מתחייב:**

1. ✅ **גיבוי לפני מיגרציה**
2. ✅ **הרצה לפי הנחיית Team 20**
3. ✅ **אימות ודיווח**

---

**Team 60 (DevOps & Platform)**  
**תאריך:** 2026-02-12  
**סטטוס:** 📋 **REQUEST — ממתין לסקריפט מ-Team 20**

**log_entry | [Team 60] | ADR_015 | MIGRATION_SCRIPT_REQUEST | TO_TEAM_20 | 2026-02-12**
