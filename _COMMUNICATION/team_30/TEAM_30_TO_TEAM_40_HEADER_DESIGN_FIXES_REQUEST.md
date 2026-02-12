# Team 30 → Team 40: בקשה — תיקונים עיצוביים ראש הדף (Batch 1)

**מאת:** Team 30 (Frontend Execution)  
**אל:** Team 40 (Presentational / CSS)  
**תאריך:** 2026-01-31  
**סטטוס:** 📋 **בקשה רשמית — בעלות וולידציה**  
**הקשר:** תיקוני עיצוב מערכתיים — אלמנט ראש הדף (Unified Header)

---

## 📋 Executive Summary

**מטרה:** העברת אחריות על תיקוני עיצוב ב־header ל־Team 40, ואימות שהמימוש תואם את הדרישות.

**סטטוס מימוש:** שלושת התיקונים יושמו זמנית ב־`phoenix-header.css` על ידי Team 30.  
**בקשה:** Team 40 יאשרו את המימוש, ישתלטו על הקבצים הרלוונטיים, ויטפלו בתיקונים עיצוביים עתידיים.

---

## 1. רקע

לפי חלוקת האחריות:
- **Team 40** — Presentational / CSS (עיצוב, מראה, מרחקים)
- **Team 30** — Frontend Execution (לוגיקה, HTML, טעינה)

התיקונים להלן הם עיצוביים בלבד (CSS) ולכן באחריות Team 40. המימוש הנוכחי נעשה כתיקון זמני; הבקשה היא שהצוות יאשר וייקח בעלות.

---

## 2. פרטי התיקונים (Batch 1 — ראש הדף)

### 2.1 תפריט רמה 2 — יישור RTL

**תיאור הבעיה:**  
התפריט הנפתח (dropdown) רמה 2 מיושר כאילו בממשק LTR — הצד השמאלי של התפריט לצד השמאלי של כפתור רמה 1.

**דרישה:**  
- הצד הימני של תפריט רמה 2 יהיה מיושר לצד הימני של כפתור רמה 1.  
- התפריט ימשך שמאלה (לפי כיוון RTL).

**מימוש נוכחי:**  
קובץ `ui/src/styles/phoenix-header.css` — סלקטור `#unified-header .tiktrack-dropdown-menu`:

```css
inset-inline-start: 0; /* RTL: right edge of menu aligns with right edge of L1 button */
inset-inline-end: auto; /* Extends leftward */
```

**לבדיקה:**  
להשוות מול `inset-inline-end: 0` (המצב הישן) — ה־dropdown צריך להיפתח עם ימין מיושר לכפתור.

---

### 2.2 כפתורי רמה 2 — גובה

**תיאור הבעיה:**  
כפתורי רמה 2 (פריטי התפריט הנפתח) נמוכים מדי; רווח אנכי קטן מדי.

**דרישה:**  
הגדלת גובה כל כפתור רמה 2 באמצעות ריווח פנימי (padding).

**מימוש נוכחי:**  
קובץ `ui/src/styles/phoenix-header.css` — סלקטור `#unified-header .tiktrack-dropdown-item`:

```css
padding: 0.5rem 1rem 0.5rem 0.5rem !important;
padding-top: 0.5rem !important;
padding-inline-end: 1rem !important;
padding-bottom: 0.5rem !important;
padding-inline-start: 0.5rem !important;
```

(לפני: `padding-top/bottom: 2px`)

**לבדיקה:**  
מראה הפריטים בתפריט הנפתח — גובה סביר ונוח ללחיצה.

---

### 2.3 header-container — פדינג אנכי

**תיאור הבעיה:**  
ל־`header-container` יש padding אנכי מיותר, שגורם לריווח לא רצוי מלמעלה ומלמטה.

**דרישה:**  
`padding: 0` למעלה ולמטה ב־`header-container`.

**מימוש נוכחי:**  
קובץ `ui/src/styles/phoenix-header.css` — סלקטור `#unified-header .header-container`:

```css
padding: 0 clamp(10px, 1.5vw, 16px); /* 0 top/bottom; fluid horizontal padding */
```

(לפני: `padding: clamp(12px, 2vw, 16px) clamp(10px, 1.5vw, 16px)`)

**לבדיקה:**  
ה־header-top נראה צמוד ומדויק מבחינת גובה.

---

## 3. קבצים מושפעים

| קובץ | סעיפים |
|------|---------|
| `ui/src/styles/phoenix-header.css` | שורות 76–90 (header-container), 299–320 (dropdown menu), 363–372 (dropdown items) |

---

## 4. Acceptance Criteria

- [ ] תפריט רמה 2 מיושר לימין (RTL) — ימין התפריט מול ימין הכפתור, התפריט נפתח שמאלה.  
- [ ] כפתורי רמה 2 עם גובה מספק (padding אנכי כ־0.5rem).  
- [ ] header-container ללא padding אנכי (padding-top ו-padding-bottom = 0).

---

## 5. בקשות לצוות 40

1. **וולידציה:** לעבור על המימוש ולאשר התאמה לדרישות.  
2. **בעלות:** לקבל בעלות על `phoenix-header.css` (וטכניקה דומה לקבצי CSS נוספים).  
3. **תיקונים עתידיים:** לטפל בתיקוני עיצוב ב־header ובאלמנטים מערכתיים דומים.

---

## 6. תיקונים עתידיים (Backlog)

להלן תיקונים נוספים שצפויים — נא לשלב בתוכנית העבודה:

- תיקונים עיצוביים נוספים באלמנט ראש הדף (לפי צורך).
- תיקונים במסכי תוכן (לא header) — יישלחו בבקשות נפרדות.

---

## 7. הפניות

- **קובץ עיצוב:** `ui/src/styles/phoenix-header.css`
- **מבנה HTML:** `ui/src/views/shared/unified-header.html`
- **RTL Charter:** לפי DNA ומסמכי הפרויקט

---

**Team 30 (Frontend Execution)**  
**log_entry | HEADER_DESIGN_FIXES_REQUEST | TO_TEAM_40 | 2026-01-31**
