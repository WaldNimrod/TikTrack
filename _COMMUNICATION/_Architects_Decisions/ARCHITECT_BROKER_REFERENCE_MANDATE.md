---
id: ADR-015 | owner: Architect | status: LOCKED
---
# 🏰 פסיקה אדריכל: רשימת ברוקרים וניהול עמלות ברירת מחדל

## 📊 1. מקור הנתונים
- Endpoint: GET /api/v1/reference/brokers
- כולל: display_name, is_supported, default_fees.

## 🛠️ 2. לוגיקת "אחר..."
- פריט 'other' מאפשר שם ידני וחוסם ייבוא/API.
- חובת הודעה: "צור קשר להוספת ברוקר".