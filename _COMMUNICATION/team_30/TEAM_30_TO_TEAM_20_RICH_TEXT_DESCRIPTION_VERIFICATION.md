# Team 30 → Team 20: בקשה לאימות — שדה Description ותמיכה ב־HTML (Rich Text)

**מאת:** Team 30 (Frontend Integration)  
**אל:** Team 20 (Backend)  
**תאריך:** 2026-01-31  
**הקשר:** משימה 3 — TipTap Rich Text; `TEAM_30_SPEC_DECISIONS_REMAINING_TASKS.md`  
**מטרה:** וידוא לפני מימוש — האם API תומך ב־HTML בשדות description/notes?

---

## 1. רקע

Team 30 מתעתד לממש **Rich Text Editor (TipTap)** בשדות `description` (D21 - Cash Flows) ובשדות דומים. הפלט יהיה HTML (תגים בסיסיים: bold, italic, lists, links, colors, alignment).

---

## 2. שאלות לאימות

| # | שאלה | הערה |
|---|------|------|
| 1 | האם שדה `description` ב־`cash_flows` (POST/PUT) **מקבל ונשמר** מחרוזת HTML כפי שהיא? | Schema: `Optional[str]`; DB: `TEXT`. צריך וידוא שאין escape/sanitize שמנקה HTML. |
| 2 | האם יש **הגבלות** על תוכן (אורך, תגים מסוימים)? | אם יש — רשימה ברורה. |
| 3 | האם יש **שדות נוספים** (notes, description) ב־endpoints אחרים שיקבלו Rich Text? | trading_accounts, brokers_fees, trades, trade_plans וכו' — מיפוי מלא. |

---

## 3. תרחיש צפוי

- **קלט:** `description: "<p dir=\"rtl\">טקסט <strong>מודגש</strong> עם <a href=\"...\">קישור</a></p>"`
- **אחסון:** שמירה כפי שנשלח (או לפי מדיניות Backend)
- **תצוגה:** ה־API מחזיר את ה־HTML — Frontend מציג עם Sanitize (DOMPurify) לפי allowed list

---

## 4. במידה ולא תומך

אם כרגע יש הגבלה או sanitize שמסיר HTML:
- **אופציה א:** עדכון Backend לאפשר HTML (בכפוף למדיניות אבטחה)
- **אופציה ב:** הגבלת Frontend ל־plain text (פגיעה ב־UX)
- **אופציה ג:** תאום על פורמט חלופי (Markdown?) — דורש החלטה

---

## 5. צעדים הבאים

- **Team 20:** מענה על השאלות לעיל
- **Team 30:** המתנה לאישור לפני מימוש TipTap; או התאמה לפי תשובה

---

**Team 30 (Frontend)**  
**log_entry | RICH_TEXT_VERIFICATION | TO_TEAM_20 | 2026-01-31**
