# Team 20 → Team 60: בקשת מיגרציה D16 — UNIQUE account_number

**מאת:** Team 20 (Backend)  
**אל:** Team 60 (DevOps & Platform)  
**תאריך:** 2026-02-12  
**הקשר:** TEAM_30_TO_TEAM_20_VALIDATION_COORDINATION_REQUEST.md, D16 וולידציות  
**סטטוס:** 📋 **REQUEST — ממתין לביצוע**

---

## 1. סיכום בקשה

Team 20 מבקש מ-Team 60 לבצע:

1. **גיבוי DB** מלא לפני מיגרציה  
2. **הרצת מיגרציה** — UNIQUE (user_id, account_number) על trading_accounts  
3. **בדיקות מלאות** — אימות מבנה, constraints, בדיקות API  
4. **גיבוי אחרי מיגרציה** — בסיס נתונים מעודכן  
5. **עדכון תיעוד** במידת הצורך

---

## 2. מיקום הסקריפט

| פריט | נתיב |
|------|------|
| **סקריפט SQL** | `scripts/migrations/adr_trading_accounts_account_number_unique.sql` |
| **תיעוד הרצה** | `scripts/migrations/README_D16_ACCOUNT_NUMBER_UNIQUE.md` |
| **תיאור** | הוספת UNIQUE index על (user_id, account_number) — D16 וולידציה |

---

## 3. תוכן המיגרציה

| שלב | פעולה |
|-----|--------|
| **Pre-check** | אם קיימות רשומות עם account_number כפול לאותו user — הסקריפט יכשל עם `ADR_TRADING_ACCOUNTS_DUPLICATE_ACCOUNT_NUMBERS` |
| **Index** | יצירת `idx_trading_accounts_user_account_number_unique` — partial (רק account_number לא ריק) |
| **Idempotent** | `CREATE UNIQUE INDEX IF NOT EXISTS` — ניתן להריץ שוב בבטחה |

---

## 4. נוהל ביצוע

### שלב 1: גיבוי לפני מיגרציה

```bash
python3 scripts/create_full_backup.py
```

**אימות:** קוד יציאה 0 + פלט "Backup verified"  
**נתיב גיבוי:** `scripts/backups/TikTrack-phoenix-db_backup_<TIMESTAMP>.sql`

---

### שלב 2: בדיקת כפילויות (אופציונלי — למניעת כישלון)

לפני הרצה אפשר לבדוק אם יש כפילויות:

```sql
SELECT user_id, TRIM(account_number) AS acc_num, COUNT(*) AS cnt
FROM user_data.trading_accounts
WHERE deleted_at IS NULL
  AND account_number IS NOT NULL
  AND TRIM(account_number) != ''
GROUP BY user_id, TRIM(account_number)
HAVING COUNT(*) > 1;
```

**אם יש תוצאות** — יש כפילויות. יש לתאם עם Team 20/Team 10 לפני הרצה.

---

### שלב 3: הרצת מיגרציה

```bash
docker exec -i tiktrack-postgres-dev psql -U tiktrack -d TikTrack-phoenix-db < scripts/migrations/adr_trading_accounts_account_number_unique.sql
```

או:

```bash
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f scripts/migrations/adr_trading_accounts_account_number_unique.sql
```

---

### שלב 4: אימות מבנה

```sql
\d user_data.trading_accounts
```

**בדיקה:** קיים index `idx_trading_accounts_user_account_number_unique`

או:

```sql
SELECT indexname FROM pg_indexes 
WHERE tablename = 'trading_accounts' 
  AND indexname = 'idx_trading_accounts_user_account_number_unique';
```

---

### שלב 5: בדיקות מלאות

| # | בדיקה | אופן |
|---|--------|------|
| 1 | **API Create** | POST /api/v1/trading_accounts — יצירת חשבון עם broker + account_number |
| 2 | **ייחודיות שם** | ניסיון ליצור חשבון עם שם קיים — צפוי 400 + `ACCOUNT_NAME_DUPLICATE` |
| 3 | **ייחודיות מספר** | ניסיון ליצור חשבון עם מספר חשבון קיים — צפוי 400 + `ACCOUNT_NUMBER_DUPLICATE` |
| 4 | **דרישות שדות** | POST בלי broker או account_number — צפוי 422 Validation Error |

---

### שלב 6: גיבוי אחרי מיגרציה

```bash
python3 scripts/create_full_backup.py
```

**מטרה:** לשמור עותק מעודכן של בסיס הנתונים לאחר המיגרציה המוצלחת.

---

### שלב 7: עדכון תיעוד

- **מטריצת מיגרציות** — אם קיימת רשימת מיגרציות — להוסיף פריט
- **TT2_VERSION_MATRIX** — אין שינוי גרסת סכמה
- **DDL** — `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql` — לעדכן בסעיף trading_accounts (הוספת הערה על ה-index החדש) — **אופציונלי**, לפי שיקול Team 60

---

## 5. דיווח

לאחר השלמה:

1. דיווח ל-**Team 20** — תוצאות הרצה, אימות, בדיקות
2. דיווח ל-**Team 10** — לפי נוהל (אם נדרש)

**פורמט מצופה:** בדומה ל-`TEAM_60_TO_TEAM_20_ADR_015_MIGRATION_COMPLETE.md`

---

## 6. צעדים במקרה כישלון

| מצב | פעולה |
|-----|--------|
| **כפילויות account_number** | הסקריפט יכשל. דיווח ל-Team 20 — נדרש תיאום לפתרון (תיקון ידני / סקריפט דדופליקציה) |
| **שגיאת הרצה אחרת** | דיווח מלא ל-Team 20 — גיבוי מלפני המיגרציה זמין לשחזור |

---

## 7. רפרנסים

- **בקשת וולידציה:** `_COMMUNICATION/team_30/TEAM_30_TO_TEAM_20_VALIDATION_COORDINATION_REQUEST.md`
- **תשובת תיאום:** `_COMMUNICATION/team_20/TEAM_20_TO_TEAM_30_VALIDATION_COORDINATION_RESPONSE.md`
- **סקריפט:** `scripts/migrations/adr_trading_accounts_account_number_unique.sql`

---

**Team 20 (Backend)**  
**log_entry | D16_VALIDATION | MIGRATION_REQUEST | TO_TEAM_60 | 2026-02-12**
