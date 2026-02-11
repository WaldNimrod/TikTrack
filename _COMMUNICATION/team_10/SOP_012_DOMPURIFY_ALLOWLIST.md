# נספח SOP-012: Allowlist מפורש ל-DOMPurify (FE)

**מקור:** SOP-012 — "Allowlist קשיח" בסניטיזציה בצד לקוח.  
**מאת:** Team 10 (The Gateway)  
**תאריך:** 2026-02-10  
**סטטוס:** 📋 **רשימה מחייבת** — יישום DOMPurify לפי רשימה זו בלבד.

---

## 1. תגיות מותרות (Allowed Tags)

| תגית | שימוש |
|------|--------|
| `p` | פסקאות |
| `br` | שבירת שורה |
| `strong` | הדגשה חזקה |
| `em` | הדגשה (נטוי) |
| `u` | קו תחתון |
| `a` | קישור (רק עם attribute `href` מאושר) |
| `ul`, `ol`, `li` | רשימות |
| `span` | עטיפה לסגנונות — **רק** עם `class` מתוך Allowlist (להלן) |

**לא מאושר:** `script`, `iframe`, `object`, `form`, `input`, `style`, `svg`, וכל תגית שלא ברשימה.

---

## 2. Attributes מותרים (לפי תגית)

| תגית | Attributes מותרים |
|------|-------------------|
| `a` | `href` (רק סכמות: `http`, `https`, `mailto`), `target`, `rel` |
| `span` | **רק** `class` — וערך ה־class **חייב** להתחיל ב־`phx-rt--` (למשל `phx-rt--success`, `phx-rt--warning`, `phx-rt--danger`, `phx-rt--highlight`) |
| כל השאר | **אין** attributes מותרים מלבד `class` ב־`span` above |

**לא מאושר:** `style`, `on*` (event handlers), `data-*` אלא אם יאושר במפורש בעדכון מפרט.

---

## 3. יישור (Align)

- **יישור טקסט:** רק באמצעות **מחלקת CSS** (class), לא באמצעות attribute `style`.
- מותר שימוש ב־`class` שמכיל שם מחלקה מ־DNA (למשל אם יוגדרו בעתיד מחלקות יישור ב־DNA).
- **אסור:** `style="text-align: ..."` או כל `style` inline.

---

## 4. סיכום חוק

- **תגיות:** רק הרשימה בסעיף 1.  
- **Attributes:** רק כבטבלה בסעיף 2; ב־`span` רק `class` עם ערך `phx-rt--*`.  
- **אין** `style` בשום תגית.  
- **אין** event handlers (`onclick` וכו').

---

**הפניה:** `ARCHITECT_RICH_TEXT_AND_DESIGN_SYSTEM_SPEC.md` (SOP-012) §2.  
**Team 10 (The Gateway)**
