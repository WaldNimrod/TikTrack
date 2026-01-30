# 📑 אפיון LOD 400: זמן וסטטוס שוק (Time & Market Status)

**משימה:** WP-20.3 | **צוות:** 20

## 1. ניהול זמן (Temporal)
- **Storage:** UTC (ISO 8601).
- **Market Zone:** America/New_York (EST/EDT).

## 2. לוגיקת סטטוס שוק
- פתיחה/סגירה: 09:30-16:00 (שעון ניו יורק).
- סנכרון יומן חגים שנתי.

## 3. Endpoints
- **GET /api/v1/system/market-status**
- **GET /api/v1/system/market-calendar**