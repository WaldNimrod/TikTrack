# Migration: Remove cash_balance Column

**תאריך:** 1 בנובמבר 2025  
**גרסה:** 1.0.0  
**מטרה:** הסרת השדה `cash_balance` מהטבלה `trading_accounts` ומעבר לחישוב בזמן אמת

---

## סיבות לשינוי

1. **עקרונות ארכיטקטוניים** - עקבי עם העיקרון "לא לשמור תוצאות חישוב"
2. **יציבות** - תמיד מחושב מהמקור, אין סיכון לאי-סינכרון
3. **פשטות תחזוקה** - קוד אחד במקום 6 נקודות עדכון
4. **שימוש בקוד קיים** - משתמש ב-`AccountActivityService` הקיים

---

## תהליך Migration

### לפני Migration:
- גיבוי בסיס נתונים: `Backend/db/backups/simpleTrade_new_before_remove_cash_balance_YYYYMMDD_HHMMSS.db`
- גיבוי Git: Branch `feature/remove-cash-balance-real-time-calculation`

### שלבי Migration:

1. **בדיקת קיום השדה** - בדיקה שהשדה קיים לפני המחיקה
2. **יצירת גיבוי** - גיבוי אוטומטי של בסיס הנתונים
3. **יצירת טבלה חדשה** - `trading_accounts_new` ללא השדה `cash_balance`
4. **העתקת נתונים** - העתקת כל הנתונים מהטבלה הישנה (ללא `cash_balance`)
5. **בדיקת שלמות** - בדיקת מספר הרשומות
6. **החלפת טבלה** - DROP של הטבלה הישנה ו-RENAME של החדשה

### אחרי Migration:
- גיבוי בסיס נתונים: `Backend/db/backups/simpleTrade_new_after_remove_cash_balance_YYYYMMDD_HHMMSS.db`
- בדיקה שהשדה הוסר: `PRAGMA table_info(trading_accounts)`

---

## שינויים בקוד

### Backend:
1. `Backend/models/trading_account.py` - הסרת `cash_balance` מהמודל
2. `Backend/models/swagger_models.py` - הסרת `cash_balance` מ-Swagger models
3. `Backend/services/trading_account_service.py` - הסרת `recalculate_cash_balance()`
4. `Backend/routes/api/account_activity.py` - הוספת endpoint `/balances`
5. `Backend/routes/api/cash_flows.py` - עדכון cache invalidation
6. `Backend/routes/api/executions.py` - עדכון cache invalidation
7. `Backend/migrations/remove_cash_balance_column.py` - Migration script

### Frontend:
1. `trading-ui/scripts/trading_accounts.js` - עדכון לטעינת יתרות מ-API
2. `trading-ui/trading_accounts.html` - הוספת עמודה "רווח/הפסד" ("בפיתוח")
3. `trading-ui/scripts/modules/data-basic.js` - הסרת `cash_balance`
4. `trading-ui/scripts/table-mappings.js` - הסרת `cash_balance`

---

## Endpoint חדש

### `GET /api/account-activity/<account_id>/balances`

**תגובה:**
```json
{
  "status": "success",
  "data": {
    "account_id": 1,
    "account_name": "Interactive Brokers",
    "base_currency_total": 12350.75,
    "base_currency": "USD",
    "base_currency_id": 1,
    "balances_by_currency": [
      {
        "currency_id": 1,
        "currency_symbol": "USD",
        "currency_name": "US Dollar",
        "balance": 10500.50
      },
      {
        "currency_id": 3,
        "currency_symbol": "ILS",
        "currency_name": "Israeli Shekel",
        "balance": 1850.25
      }
    ],
    "exchange_rates_used": {
      "ILS": 3.65
    }
  }
}
```

---

## Cache Strategy

- **TTL:** 60 שניות
- **Dependencies:** `cash_flows`, `executions`
- **Invalidation:** אוטומטי בכל CRUD של cash_flow או execution

---

## הערות חשובות

1. **total_pl:** נשאר בטבלה אבל לא מתעדכן - מוצג "בפיתוח" ב-UI
2. **Backward Compatibility:** אין - זה breaking change, אבל נדרש
3. **Migration:** ניתן להריץ שוב - בודק אם השדה קיים לפני

---

## Rollback

אם צריך לחזור אחורה:
1. שחזור מבסיס נתונים מגיבוי
2. Revert של שינויי הקוד מ-Git
3. החזרת השדה למודל

---

## בדיקות

לאחר Migration:
- [x] השדה הוסר מהטבלה
- [x] כל הרשומות נשמרו (13 רשומות)
- [x] Endpoint `/balances` עובד
- [x] Frontend טוען יתרות מ-API
- [x] Cache invalidation עובד

