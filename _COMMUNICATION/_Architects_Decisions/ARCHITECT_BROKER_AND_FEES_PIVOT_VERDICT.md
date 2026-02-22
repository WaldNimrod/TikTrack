---
id: ADR-018
owner: Architect
status: LOCKED - G-LEAD APPROVED
---
**project_domain:** TIKTRACK

# 🏰 פסיקה אדריכל: מהפך עמלות וניהול ברוקרים

## 📊 1. מודל הנתונים: Option B (Account-based Fees)
- **החלטה:** עמלות צמודות לחשבון המסחר (FK trading_account_id) ולא לברוקר.
- **פעולה:** ביטול טבלת `brokers_fees` ומעבר ל-`trading_account_fees`.

## 🛠️ 2. לוגיקת ברוקר "אחר" (The Other Rule)
- בחירת ברוקר שאינו ברשימה ("אחר") תפתח שדה טקסט חופשי.
- **חסימה:** חשבון זה יסומן כ-`is_supported = false`.
- **משילות:** מניעת הגדרת API או ייבוא קבצים לחשבון שאינו Supported.
- **UI:** הצגת הודעה "צור קשר להוספת במידה ונדרשת תמיכה אוטומטית".

**log_entry | [Architect] | DATA_MODEL_PIVOT_LOCKED | GREEN**