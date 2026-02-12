# 📋 נוהל רענון וניקוי נתוני בדיקה

**id:** TT2_TEST_DATA_REFRESH  
**owner:** Team 20 (Backend) / Team 60 (DevOps)  
**מבוסס על:** SOP-011, `scripts/README_SEED_TEST_DATA.md`

---

## 1. הבחנות

| סוג | תיאור | פעולה |
|-----|-------|-------|
| **נתוני בסיס** | `is_test_data = false` או `NULL` | ❌ לא נוגעים |
| **נתוני בדיקה** | `is_test_data = true` | ✅ ניתן למחוק / לרענן |
| **משתמשי בסיס** | TikTrackAdmin, nimrod_wald, test_user | ❌ לא למחוק; חייבים להישאר |

---

## 2. דוח מצב נוכחי

לפני רענון — הרצה:

```bash
make db-test-report
# או: python3 scripts/db_test_data_report.py
```

מציג טבלה: משתמשים + מספר רשומות לכל טבלה (פורמט `test|base`).

---

## 3. ניקוי נתוני בדיקה

מוחק **רק** שורות עם `is_test_data = true`:

```bash
make db-backup          # חובה לפני ניקוי
make db-test-clean
```

**טבלאות שנמחקות:** executions, trades, cash_flows, trading_accounts, brokers_fees, strategies, trade_plans, ticker_prices, tickers.

---

## 4. הזרקת נתוני בדיקה חדשים

אחרי ניקוי (או בבסיס ריק):

```bash
python3 scripts/seed_qa_test_user.py   # משתמש QA
make db-test-fill                      # או: make db-backup-then-fill
```

## 5. זריעת סט בסיס למשתמש test_user

סט מינימלי מייצג (`is_test_data = false`) — לא נמחק ב-clean:

```bash
make db-base-seed
# או: python3 scripts/seed_base_test_user.py
```

**מפרט:** `documentation/05-REPORTS/artifacts/SPEC_BASE_TEST_USER_DATASET.md`

## 6. צמצום נתוני בסיס של מנהל ראשי (TikTrackAdmin)

להפחתת נתוני הבסיס של TikTrackAdmin למינימום:

```bash
make db-admin-minimal
# או: python3 scripts/reduce_admin_base_to_minimal.py
```

**תוצאה:** 2 חשבונות, 2 עמלות, 5 תזרימים (סה״כ 9 רשומות בסיס).

---

## 7. רפרנסים

- `scripts/db_test_clean.py` — ניקוי
- `scripts/seed_test_data.py` — זריעה
- `scripts/db_test_data_report.py` — דוח
- `documentation/01-ARCHITECTURE/TT2_DATABASE_CREDENTIALS.md` — משתמשי בסיס
