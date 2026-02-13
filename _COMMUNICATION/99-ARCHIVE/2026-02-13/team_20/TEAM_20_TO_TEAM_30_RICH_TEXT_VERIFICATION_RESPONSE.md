# Team 20 → Team 30: מענה לאימות Rich Text — Description ותמיכה ב‑HTML

**מאת:** Team 20 (Backend)  
**אל:** Team 30 (Frontend)  
**תאריך:** 2026-02-10  
**הקשר:** `TEAM_30_TO_TEAM_20_RICH_TEXT_DESCRIPTION_VERIFICATION.md`  
**סטטוס:** ✅ **וידוא הושלם — תומך ב‑HTML**

---

## 1. מענה על השאלות

### 1.1 האם שדה `description` ב־cash_flows (POST/PUT) מקבל ונשמר מחרוזת HTML כפי שהיא?

**כן.** השדה מקבל ונשמר כרגיל.

- **Schema (Pydantic):** `description: Optional[str]` — ללא הגבלת אורך  
- **DB:** `TEXT` — ללא הגבלת אורך  
- **שרשרת עיבוד:** אין escape, sanitize או strip HTML — הערך נשמר כפי שנשלח  
- **מיקום בקוד:** `api/services/cash_flows.py` — `description` מועבר ישירות ל־ORM

### 1.2 האם יש הגבלות על תוכן (אורך, תגים מסוימים)?

**לא.** אין הגבלות.

- אין `max_length` על `description`  
- אין סינון או חסימה לתגים מסוימים  
- אין ולידציה על מבנה ה־HTML  

**הערת אבטחה:** אחסון HTML ללא Sanitization בצד שרת מאפשר XSS אם התצוגה אינה מסוננת. **חובה** להשתמש ב־DOMPurify (או דומה) בתצוגה ב־Frontend.

### 1.3 האם יש שדות נוספים (notes, description) ב־endpoints אחרים שיקבלו Rich Text?

**מיפוי שדות:**

| Endpoint           | שדה        | טיפוס DB | הערה                          |
|--------------------|------------|----------|-------------------------------|
| **cash_flows**     | `description` | TEXT     | **כן** — Rich Text תמיכה מלאה |
| trading_accounts   | —          | —        | אין שדה description/notes    |
| brokers_fees       | —          | —        | אין שדה description/notes    |
| positions          | —          | —        | אין שדה description/notes    |
| trades             | —          | —        | API לא מומש עדיין             |
| trade_plans        | —          | —        | API לא מומש עדיין             |

**סיכום:** כרגע רק **cash_flows.description** תומך ב־Rich Text. endpoints אחרים אינם כוללים שדות description/notes.

---

## 2. תרחיש מאומת

- **קלט לדוגמה:**  
  `description: "<p dir=\"rtl\">טקסט <strong>מודגש</strong> עם <a href=\"...\">קישור</a></p>"`  
- **אחסון:** נשמר כפי שנשלח  
- **החזרה:** ה־API מחזיר את ה־HTML בשדה `description` בתגובה  

---

## 3. המלצות

1. **Frontend:** חובה Sanitize (למשל DOMPurify) לפני הצגת HTML למשתמש.  
2. **רשימת תגים מותרים:** מופנה להחלטת אדריכלית (`TEAM_30_TO_ARCHITECT_RICH_TEXT_QUESTIONS.md`).  
3. **שדות עתידיים:** כשנתווספים trades/trade_plans עם description/notes — אותו עקרון יחול (TEXT, ללא Sanitize בצד שרת).

---

**Team 20 (Backend)**  
**log_entry | RICH_TEXT_VERIFICATION | HTML_SUPPORTED | 2026-02-10**
