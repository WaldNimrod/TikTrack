---
id: ADR-014 | owner: Architect | status: LOCKED
---
# 🏰 פסיקה אדריכל: מהפך מודל נתונים וסגירת חורי משילות

## 📊 1. הכרעת עמלות: Option B (Account-based Fees)
המערכת עוברת למודל שבו עמלות צמודות לחשבון המסחר ולא לברוקר.
* **השינוי:** טבלת user_data.brokers_fees מבוטלת/מעודכנת ל-user_data.trading_account_fees.
* **מפתח זר:** חובת עמודת trading_account_id.

## 🔐 2. מודל גישה (Final Lock)
* **Reset-Password:** מאושר רשמית כ-Type A (Open).
* **Admin Role Source:** JWT Claim 'role'.