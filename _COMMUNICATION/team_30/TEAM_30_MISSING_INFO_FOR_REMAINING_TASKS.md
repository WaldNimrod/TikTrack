# Team 30 → Team 10: מידע חסר למימוש משימות 3 (TipTap) ו־7 (Design System)

**מאת:** Team 30 (Frontend Integration)  
**אל:** Team 10 (The Gateway) — להחלטה/תיאום עם Team 20, Team 40  
**תאריך:** 2026-01-31  
**הקשר:** `TEAM_30_TO_TEAM_10_PHASE_AFTER_GATE_A_STATUS_REPORT.md`  
**סטטוס:** 📋 **מעודכן** — החלטות התקבלו; ראה `TEAM_30_SPEC_DECISIONS_REMAINING_TASKS.md`

---

## עדכון 2026-01-31

החלטות התקבלו מהנדס/מנהל. מסמכים חדשים:
- **`TEAM_30_SPEC_DECISIONS_REMAINING_TASKS.md`** — החלטות מאושרות (משימות 3 + 7)
- **`TEAM_30_TO_TEAM_20_RICH_TEXT_DESCRIPTION_VERIFICATION.md`** — בקשה לאימות Team 20
- **`TEAM_30_TO_ARCHITECT_RICH_TEXT_QUESTIONS.md`** — שאלות לאדריכלית (תגים, סניטיזציה, חבילות)

המסמך להלן נשמר לצורכי היסטוריה; למידע עדכני ראה המסמכים לעיל.

---

## 1. משימה 3 — Rich Text (TipTap)

### 1.1 החלטות נדרשות

| # | נושא | מה חסר | החלטה נדרשת |
|---|------|---------|-------------|
| 1 | **פורמט אחסון (Backend)** | שדה `description` ב־API הוא `Optional[str]`. האם Backend מאפשר/תומך ב־HTML? DB: `Text`. | Team 20: אישור שהפלט מ־TipTap (HTML) יתקבל ונשמר כפי שהוא; או שיש להגביל ל־plain text / Markdown. |
| 2 | **מדיניות סניטיזציה** | אילו תגי HTML מותרים? (bold, italic, lists, links?) — משפיע על XSS ועל חווית עריכה. | החלטת אדריכל / Team 10: רשימת תגים מותרים + DOMPurify או דומה. |
| 3 | **מיקום משולב** | הטפסים (cashFlowsForm וכו') הם vanilla JS + `createModal` עם HTML string. TipTap דורש mount על DOM node. | איך לשלב: (א) React wrapper בתוך modal, או (ב) TipTap headless/vanilla (בלי React)? ADR‑013: "TipTap Headless UI". |
| 4 | **טפסים נוספים** | כרגע רק `cashFlowsForm` יש שדה description. האם יש שדות notes/description נוספים? | רשימה מלאה: D16, D18, D21, טפסים אחרים? |

### 1.2 מידע טכני חסר

| פריט | פירוט |
|------|--------|
| **Packages** | אילו חבילות TipTap? `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/pm`? גרסאות מומלצות. |
| **RTL** | תמיכה בעברית/RTL — מובנה או נדרש extension? |
| **גודל bundle** | TipTap גדול — האם יש מגבלת גודל או עדיפות ל־lite/minimal? |

---

## 2. משימה 7 — דף טבלת צבעים דינמית

### 2.1 מקור קיים

- **מיקום:** `_COMMUNICATION/team_40/demos/button-system-demo.html`
- **תוכן:** פלטת 63 משתנים סטטית (Brand, Entity, Message, Investment, Numeric, Base, Border) + דוגמאות כפתורים
- **מבנה:** קטגוריות + `color-row` + swatch + שם משתנה

### 2.2 החלטות נדרשות

| # | נושא | מה חסר | החלטה נדרשת |
|---|------|---------|-------------|
| 1 | **"דינמית"** | האם הטבלה צריכה לקרוא משתנים בזמן ריצה (computed styles / parse CSS) או מספיק העתקת המבנה הסטטי ל־React? | הגדרה ברורה: dynamic = parse at runtime vs. static manifest. |
| 2 | **Scope צבעים** | האם להציג את כל 63 המשתנים כמו בדמו, או תת־קבוצה? | רשימת קטגוריות/משתנים רשמית. |
| 3 | **קטע כפתורים** | האם לכלול גם את דוגמאות הכפתורים (DNA_BUTTON_SYSTEM) בדף, או רק טבלת צבעים? | כן/לא + היקף. |
| 4 | **נתיב CSS** | `phoenix-base.css` — האם path קבוע, או להגדיר config? | SSOT למיקום הקובץ. |

### 2.3 מידע שמספיק למימוש

- מבנה `button-system-demo.html` ברור
- `DesignSystemDashboard.jsx` קיים כ־placeholder
- Route `/admin/design-system` קיים (Type D)
- מבנה `tt-container` / `tt-section` מתועד ב־`TEAM_30_TASK_7_DESIGN_SYSTEM_SCOPE.md`

**חסר עיקרי:** החלטה על דינמיות (parse vs. static) והיקף (צבעים בלבד או גם כפתורים).

---

## 3. סיכום — פעולות נדרשות מצוותים

| צוות | פעולה |
|------|--------|
| **Team 10** | החלטות על: סניטיזציה, היקף דינמיות, scope Design System |
| **Team 20** | אישור תמיכה ב־HTML ב־`description` (או מגבלות) |
| **Team 40** | המלצה על חבילות TipTap + RTL; אימות היקף Design System (צבעים + כפתורים) |

---

**Team 30 (Frontend)**  
**log_entry | MISSING_INFO | REMAINING_TASKS | 2026-01-31**
