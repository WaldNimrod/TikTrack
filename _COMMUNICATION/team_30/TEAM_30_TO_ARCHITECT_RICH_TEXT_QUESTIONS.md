# Team 30 → אדריכלית: שאלות פתוחות — TipTap Rich Text

**מאת:** Team 30 (Frontend Integration)  
**אל:** אדריכלית (דרך Team 10)  
**תאריך:** 2026-01-31  
**הקשר:** משימה 3 — TipTap; `TEAM_30_SPEC_DECISIONS_REMAINING_TASKS.md`  
**מטרה:** החלטות טכניות למימוש מלא

---

## 1. החלטות שכבר התקבלו

- סט בסיסי של תגיות: סגנונות טקסט, קישורים, צבעים, הדגשות
- תקן מחמיר לתקינות HTML בעברית
- תמיכה בעברית + RTL/LTR + יישור (start, center, end)
- שימוש במחלקות סגנון קיימות או תגיות בסיסיות

---

## 2. שאלות להחלטת אדריכלית

### 2.1 רשימת תגי HTML מותרים

**בקשה:** רשימה מפורשת של תגי HTML שהעורך מורשה לייצר.

**הצעה לדיון:**
- טקסט: `<p>`, `<br>`, `<span>`, `<strong>`, `<em>`, `<u>`, `<s>`
- רשימות: `<ul>`, `<ol>`, `<li>`
- קישורים: `<a href="">` (אימות scheme: http/https)
- כיווניות: `dir="rtl"`, `dir="ltr"`
- יישור: `text-align` או מחלקות (לפי SSOT)
- צבע/רקע: `style="color:...; background:..."` או classes בלבד?

**נדרש:** אישור סופי + כל תג/attribute מותר.

---

### 2.2 כלי סניטיזציה

**בקשה:** המלצה רשמית לכלי Sanitization (למשל DOMPurify).

**שאלות:**
- איזה ספרייה (DOMPurify / sanitize-html / אחר)?
- גרסה מומלצת
- האם סניטיזציה ב־Frontend בלבד, או גם ב־Backend?

---

### 2.3 חבילות TipTap

**בקשה:** רשימת חבילות וגרסאות מומלצות.

**הצעה לדיון:**
- `@tiptap/react` או TipTap vanilla (headless) — הטפסים כרגע vanilla JS
- `@tiptap/starter-kit` vs. extensions מותאמים
- תמיכת RTL — מובנית או extension נדרש?

---

## 3. עדכון מסמך

לאחר קבלת תשובות — ייעדכן `TEAM_30_SPEC_DECISIONS_REMAINING_TASKS.md` ויושלם מימוש.

---

**Team 30 (Frontend)**  
**log_entry | RICH_TEXT_QUESTIONS | TO_ARCHITECT | 2026-01-31**
