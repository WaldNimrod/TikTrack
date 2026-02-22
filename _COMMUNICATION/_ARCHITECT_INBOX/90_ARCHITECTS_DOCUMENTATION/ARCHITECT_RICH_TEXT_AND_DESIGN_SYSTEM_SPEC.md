# 🖋️ מפרט אדריכלי: Rich-Text & Design System (SOP-012)
**project_domain:** TIKTRACK
---
**Tooling:** TipTap (Starter Kit + Link + TextStyle + Attributes).

### 1. כפתור "סגנון" (Styles)
הזרקת מחלקות CSS המוגדרות ב-DNA:
- `.phx-rt--success`: טקסט הצלחה (ירוק).
- `.phx-rt--warning`: טקסט אזהרה (כתום).
- `.phx-rt--danger`: טקסט סכנה (אדום).
- `.phx-rt--highlight`: הדגשה צבעונית.

### 🛡️ 2. מדיניות סניטיזציה (Sanitization)
- **FE:** שימוש ב-DOMPurify עם Allowlist קשיח.
- **BE:** שימוש בסניטייזר ב-Python לפני שמירה ל-DB.
- **חוק:** רק קלאסים המתחילים ב-`phx-rt--` מאושרים.

### 🎨 3. Design System Page
- מימוש ב-React Component (Type D).
- הצגת מילון הסגנונות של ה-Rich Text כחלק מהטבלה.