# 📜 אמנת רספונסיביות דינמית - Phoenix v2.0
**project_domain:** TIKTRACK

כדי להבטיח שהמערכת תעבוד בכל מכשיר ללא כפל קוד, יש לאכוף את הסטנדרטים הבאים:

## 1. טיפוגרפיה וריווחים נזילים (Fluidity)
* **פונטים:** שימוש ב-`clamp(min, preferred, max)`.
* **ריווחים:** שימוש ב-`clamp` ל-Margins ו-Paddings.

## 2. גריד גמיש (The No-Media-Query Goal)
* העדפת `grid-template-columns: repeat(auto-fit, minmax(300px, 1fr))`.
* ה-Container תמיד ברוחב מקסימלי של 1400px.

## 3. טבלאות ונתונים (Mobile Tables)
* טבלאות לא "נשברות" למובייל - עטופות ב-`overflow-x: auto`.
* שימוש ב-Sticky Columns לשמירה על קונטקסט.

---
**נערך על ידי האדריכלית הראשית - פרויקט פיניקס**
**log_entry | [Architect] | RESPONSIVE_CHARTER | TO_TEAM_10 | BLUE | 2026-02-02**