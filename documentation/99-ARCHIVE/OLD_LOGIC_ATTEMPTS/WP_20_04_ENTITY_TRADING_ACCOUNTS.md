# 📑 אפיון LOD 400: חשבונות מסחר (Trading Accounts) - REDESIGN

**סשן:** S20.06 | **סטטוס:** תכנון מחדש פיננסי - אכיפת לשון רבים וטרמינולוגיה

## 1. הגדרות DB ומבנה נתונים (Greenfield G-03)
- **Table:** `trading_accounts` (Plural)
- **Identity:** `id` (ULID).
- **Field: `opening_balances` (Multi-currency):** JSONB. מיפוי מטבע לסכום.
- **Precision:** NUMERIC(20, 8).

## 2. חוזי JSON ו-API
- **Request:** `POST /api/v1/trading-accounts`