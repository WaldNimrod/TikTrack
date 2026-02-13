---
id: ADR-022 | owner: Architect | status: LOCKED - G-LEAD APPROVED
---
# 🏰 פסיקה אדריכל: נעילת ספקי נתונים וצינורות המידע

1. **Providers:** Yahoo Finance + Alpha Vantage בלבד. Frankfurter מוסר.
2. **Mandatory Caching:** חובה להקים שכבת Caching ב-Backend. אין פנייה ל-API חיצוני ללא בדיקת local cache.
3. **Agnostic Interface:** מימוש Interface ב-Python המאפשר החלפת ספק ללא שינוי קוד מנוע.
4. **Visual Warning:** חובת התרעה למשתמש אם מוצג מחיר EOD (סוף יום).