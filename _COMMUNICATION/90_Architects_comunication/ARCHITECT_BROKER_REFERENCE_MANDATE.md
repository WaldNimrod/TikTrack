---
id: ADR-015 | owner: Architect | status: LOCKED
---
# 🏰 פסיקה אדריכל: רשימת ברוקרים וניהול עמלות ברירת מחדל

## 📊 1. מקור הנתונים
- Endpoint: GET /api/v1/reference/brokers
- התוכן: רשימה סטטית הכוללת display_name, is_supported ו-default_fees.

## 🛠️ 2. לוגיקת "אחר..."
- פריט 'other' יאפשר הכנסת שם ידני.
- חשבון "אחר" יחסום ייבוא ו-API.
- חובת הצגת הודעת "צור קשר להוספת ברוקר" בממשק.

## 💾 3. הזרקת עמלות
- בחירת ברוקר בטופס D16 תאכלס אוטומטית את שדות העמלות לערכי ה-Default.

**log_entry | [Architect] | BROKER_REF_LOCKED | 12.2.2026, 2:01:53**