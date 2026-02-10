# 📜 דרישות מסירת בלופרינט

**id:** `TT2_BLUEPRINT_HANDOFF_REQUIREMENTS`  
**owner:** Team 10 (The Gateway)  
**status:** 🔒 **SSOT - MANDATORY**  
**last_updated:** 2026-02-09  
**version:** v1.0  
**context:** מיסוד תהליך מסירה מצוות 31 לצוותי הפיתוח (מנדט TEAM_91 Process Formalization).

---

## 1. מטרה

הגדרת דרישות מחייבות עבור כל בלופרינט (קובץ HTML סטטי) שנוצר על ידי צוות 31, במטרה להבטיח תהליך מסירה חלק, מדויק ויעיל לצוותי הפיתוח (30, 40).

---

## 2. Checklist דרישות חובה

כל בלופרינט המועבר לפיתוח חייב לעמוד **בכל** הדרישות הבאות.

### 2.1 מבנה וסטנדרטים

- [ ] **תבנית V3:** שימוש במבנה העמוד העדכני (`page-wrapper` > `page-container` > `main`).
- [ ] **רכיבי LEGO:** שימוש ברכיבי `tt-container`, `tt-section`, `tt-section-row` בלבד.
- **שימוש חוזר ב-CSS:** שימוש במחלקות CSS קיימות מ-`phoenix-components.css` ו-`phoenix-base.css` במידת האפשר. אין להמציא מחלקות חדשות ללא צורך מוכח.

### 2.2 סדר טעינת CSS

- [ ] **סדר קריטי:** סדר טעינת קבצי ה-CSS ב-`<head>` חייב להיות תואם במדויק ל-[CSS_LOADING_ORDER.md](../04-DESIGN_UX_UI/CSS_LOADING_ORDER.md). סטייה מנוהל זה תגרום לכשל ב-CSS Load Verification.

### 2.3 דיוק ויזואלי (Fidelity)

- [ ] **Pixel Perfect:** הבלופרינט חייב להיות Pixel Perfect מול העיצוב שאושר.
- [ ] **תוכן דמה מלא:** הבלופרינט חייב להכיל תוכן דמה מלא ומציאותי (טקסטים, מספרים, תאריכים) כדי לאפשר בדיקה ויזואלית מלאה.
- [ ] **כל המצבים (States):** יש להציג דוגמאות לכל המצבים הנדרשים (למשל, כפתור במצב `disabled`, שדה עם שגיאת ולידציה).

### 2.4 "חוק הברזל": הפרדת מבנה ועיצוב

- [ ] **איסור Inline Styles:** חל איסור מוחלט על שימוש ב-`style` attribute בתוך ה-HTML.
- [ ] **איסור Inline Scripts:** חל איסור מוחלט על שימוש בתגיות `<script>` בתוך ה-HTML.

---

## 3. תהליך מסירה

1. צוות 31 מסיים בלופרינט ועובר על ה-Checklist לעיל.
2. הבלופרינט מועבר ל-Visionary (Chief Reviewer) ל"דיוק ויזואלי" ואישור.
3. רק לאחר אישור Visionary, הבלופרינט מועבר לצוות 40 ו-30 למימוש.

---

## 4. הפניות

- ארכיטקטורת LEGO: [TT2_SECTION_ARCHITECTURE_SPEC.md](../01-ARCHITECTURE/TT2_SECTION_ARCHITECTURE_SPEC.md)
- סדר טעינת CSS: [CSS_LOADING_ORDER.md](../04-DESIGN_UX_UI/CSS_LOADING_ORDER.md)
- אמנת 30↔40: [TT2_SLA_TEAMS_30_40.md](./TT2_SLA_TEAMS_30_40.md)
- מנדט: id `TEAM_91_TO_TEAM_10_PROCESS_FORMALIZATION_MANDATE`
