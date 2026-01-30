# 📑 אפיון LOD 400: מטבעות ושערי חליפין (Money & FX)

**משימה:** WP-20.3 | **צוות:** 20

## 1. הגדרות DB (PostgreSQL)
- **Table:** `exchange_rates`
- **Precision:** NUMERIC(20, 10) - מניעת שגיאות עיגול.
- **ISO Code:** VARCHAR(3) (ISO 4217).

## 2. לוגיקת המרה
- פונקציה `convert_currency` בשכבת ה-Service.
- בדיקת Stale Data (מעל 24 שעות).

## 3. Endpoints
- **GET /api/v1/finance/rates**
- **POST /api/v1/finance/convert**