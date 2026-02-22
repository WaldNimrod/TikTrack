# 🌱 נתוני בדיקה (Test Data Seed) — נוהל הרצה
**project_domain:** TIKTRACK

**Team 60 (DevOps & Platform)**  
**מטרה:** הרצת נתוני דוגמה (trading_accounts, brokers_fees, cash_flows) עם `is_test_data = true`.  
**חובה:** גיבוי בסיס נתונים לפני הרצה, וידוא שהגיבוי תקין, ורק אז דחיפת הנתונים.

---

## 📋 נוהל חובה (לפני כל הרצת seed)

### 1. גיבוי לבסיס הנתונים

```bash
python3 scripts/create_full_backup.py
```

- **פלט מצופה:** `Backup created successfully`, `Backup verified`, נתיב הקובץ וגודל.
- **מיקום גיבויים:** `scripts/backups/TikTrack-phoenix-db_backup_YYYYMMDD_HHMMSS.sql`
- **אימות:** הסקריפט בודק אוטומטית: קובץ קיים, גודל > 0, תוכן תקין (CREATE או COPY). אם האימות נכשל — הסקריפט יוצא עם קוד 1 ולא ממשיך.

### 2. וידוא שהגיבוי תקין

- אם `create_full_backup.py` הסתיים בקוד 0 והדפיס `Backup verified` — הגיבוי תקין.
- אופציונלי: לבדוק ידנית שקובץ הגיבוי קיים ב-`scripts/backups/` וגודלו סביר (לא 0 bytes).

### 3. דחיפת הנתונים (הרצת seed)

**רק לאחר 1 ו-2:**

```bash
# משתמש QA (חובה אם ה-DB ריק או אחרי איפוס)
python3 scripts/seed_qa_test_user.py

# נתוני בדיקה לטבלאות D16, D18, D21
python3 scripts/seed_test_data.py
```

או דרך Makefile:

```bash
make db-test-fill
```

(הערה: `make db-test-fill` מריץ רק `seed_test_data.py`. משתמש QA — להריץ `seed_qa_test_user.py` לפני כן אם נדרש.)

**כמויות מוגדרות:** 3 חשבונות מסחר, 6 עמלות ברוקרים, 10 תזרימי מזומנים (ראה `TEAM_10_PHASE_1_COMPLETIONS_SPEC.md`).

---

## 🔄 רצף מלא (גיבוי → אימות → seed) — Makefile

```bash
make db-backup-then-fill
```

מבצע לפי הסדר:  
1. `make db-backup` — גיבוי + אימות.  
2. אם הגיבוי הצליח — `make db-test-fill` — דחיפת נתוני הבדיקה.

אם הגיבוי נכשל (או אימות נכשל) — ה-seed לא יורץ.

---

## 📂 שחזור מגיבוי

אם צריך להחזיר את בסיס הנתונים למצב שלפני ה-seed:

```bash
psql -U <user> -d TikTrack-phoenix-db -f scripts/backups/TikTrack-phoenix-db_backup_<TIMESTAMP>.sql
```

(החלף `<user>` ו-`<TIMESTAMP>` בערכים המתאימים. **אזהרה:** שחזור מחליף את כל הנתונים הנוכחיים.)

---

## 🔗 רפרנסים

- סקריפט גיבוי: `scripts/create_full_backup.py`
- סקריפט seed: `scripts/seed_test_data.py`
- משתמש QA: `scripts/README_SEED_QA_USER.md`
- מפרט כמויות והשלמות: `_COMMUNICATION/team_10/TEAM_10_PHASE_1_COMPLETIONS_SPEC.md`
- SOP-011: `documentation/05-PROCEDURES/ARCHITECT_DATA_MANAGEMENT_SOP_011.md`
