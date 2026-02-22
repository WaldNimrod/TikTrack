# 📑 אפיון LOD 400: חשבון מסחר (Trading Account)
**project_domain:** TIKTRACK

**משימה:** WP-20.3 | **צוות:** 20

## 1. הגדרות DB (PostgreSQL)
- **Table:** `trading_accounts`
- **PK:** `id` (VARCHAR(26) - ULID)
- **FK:** `user_id` (VARCHAR(26))
- **Name:** VARCHAR(100) - וולידציה: חובה להכיל "חשבון מסחר".
- **Settings:** JSONB - גמישות ברוקרים.

## 2. חוזי API
- **POST /api/v1/trading-accounts**
- **PATCH /api/v1/trading-accounts/{id}**

## 3. חוקים עסקיים
- אכיפת טרמינולוגיית "המבצר".
- מחיקה לוגית בלבד (is_active=False).