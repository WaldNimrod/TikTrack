# תמונת מצב — משימות פתוחות, שלבים לא סגורים, תוכניות עבודה

**מאת:** Team 10 (The Gateway)  
**תאריך:** 2026-02-11  
**מטרה:** תמונה אחת על כל המשימות הפתוחות, השלבים שלא נסגרו, ותוכניות העבודה שעדיין לא בוצעו במלואן — לפני המשך התהליך הוויזואלי.

---

## 1. משימות פתוחות (מטריצת יישום ADR-013/SOP-012)

**מקור:** `TEAM_10_ARCHITECT_IMPLEMENTATION_TASK_MATRIX.md`

| צוות | מזהה | משימה | הערה |
|------|------|------|------|
| **Team 10** | T10.1 | לנסח ולתעד **MAPPING_REQUIRED**: מתי חל, איפה מתועד (ORDER / Work Plan). | לא בוצע |
| **Team 10** | T10.2 | **לא לאשר** קוד ללא אישור מיפויים per ADR-011. לתעד בתהליך/צ'קליסט. | לא בוצע |
| **Team 10** | T10.4 | להפיץ מטריצה ומסמכי מנדט; לעדכן Evidence Log. | חלקי (הפצה בוצעה; עדכון Evidence מתמשך) |
| **Team 30** | T30.1 | **Broker Select** — שימוש ב־GET /api/v1/reference/brokers בטפסים **D16, D18, D21** (dynamic select). | D16/D18 כיסוי ב־Gate B; **D21** — per scope לא נכלל; יש לאשר אם נדרש גם ב־D21 |
| **Team 30** | T30.6 | מודל **A/B/C/D** — Redirect C→Home, Type B שני containers, User Icon success/warning. | חלקית מאומת ב־Gate A/B; כל סטייה שתצא בבדיקה ויזואלית — פתוחה |
| **Team 90** | T90.1 | **סריקה:** אין Inline Style בתוך Rich-Text Editor. | מנדט סריקה — לא דווח כסגור |
| **Team 90** | T90.2 | **סריקה:** סניטיזציה בשרת (Python) מיושמת לפני שמירה. | מנדט סריקה — לא דווח כסגור |
| **Team 20** | T20.4 | (עתידי) user_tier / required_tier ב־JWT. | מוכנות לעתיד בלבד |

---

## 2. שלבים שלא נסגרו (מתוך תוכנית העבודה המאוחדת)

**מקור:** `TEAM_10_VISUAL_GAPS_WORK_PLAN.md`

### 2.1 Code Evidence (§4.5) — "לטפל"

| פריט | קובץ / נושא | דרישה | סטטוס |
|------|-------------|--------|--------|
| 1 | `AppRouter.jsx` | Home **לא** ב־ProtectedRoute (או redirect ל־**Home** לא ל־/login). | לבדוק — עלול עדיין להיות redirect שגוי |
| 2 | `ProtectedRoute.jsx` | אורח ב־auth-only → מפנה ל־**Home** (לא ל־/login). | לבדוק |
| 3 | `HomePage.jsx` | **שני containers** — Guest (אורח) + Logged-in (מחובר); אין עמודים נפרדים. | לבדוק — חסר logged-out container? |
| 4 | `unified-header.html` / `phoenix-header.css` | אייקון ברירת מחדל **לא** שחור (הסרת black). | תלוי בתיקוני Header — ראה בקשות Team 30→40 |

### 2.2 בדיקות מקדימות (§4.7) — לא מסומנות כהושלמו

- [ ] וידוא רשימת עמודים **מלאה** (כל ה־routes + דאשבורד/פרופיל).
- [ ] החלטת אדריכל: מיפוי סופי A/B/C/D **לכל** עמוד; התנהגות redirect ל־D (Home vs 403).
- [ ] מיפוי ותיעוד: מטריצה route → טיפוס; עדכון routes.json/SSOT.

### 2.3 החלטה פתוחה

- **/profile** — טיפוס **C) Auth-only** או **D)** — "להחלטה" (לא ננעל בתוכנית).

### 2.4 שלב 0 (Bridge) — וידוא מפורש

בתוכנית מסומן "חובה"; לא כל תת־פריט מסומן כוולידט במסמך:

- 0.4 Header Path — נעילה על **unified-header.html** בלבד (Team 30/40).
- 0.5 React Tables — **רק** דרך TablesReactStage ב־UAI (אין mount per page).
- 0.6 איסור Header **בתוך** Containers (מניעת SSR כפול).

### 2.5 משימה 7 — Header תמיד אחרי Login → Home

- **Acceptance:** Header תמיד קיים בכל עמוד שאינו Open.
- כל סטייה שמופיעה **בבדיקה ויזואלית** (Header נעלם, לא עקבי) — נחשבת פתוחה עד תיקון.

---

## 3. תוכניות עבודה — מה בוצע ומה לא

### 3.1 סדר עבודה עד שער א' (`TEAM_10_ORDER_OF_WORK_UNTIL_GATE_A.md`)

| סטטוס | תיאור |
|--------|--------|
| ✅ **בוצע במלואו** | שלב -1 (MAPPING_MODE), שלבים 0–2, חוב Auth (Option B), G.1/G.2, **שער א'** — Passed 11, 0 SEVERE. |
| ✅ **אחרי שער א'** | התנעת משימות 3–7 והכנה לשער ב' — הופעל. |
| — | המסמך מכסה "עד שער א'"; המשך בתוכנית המאוחדת. |

### 3.2 תוכנית עבודה מאוחדת — חוסרים ויזואליים (`TEAM_10_VISUAL_GAPS_WORK_PLAN.md`)

| סטטוס | תיאור |
|--------|--------|
| ✅ **נסגר** | שלב -1 (Pre-coding Mapping), שער א', משימות 3–7 (Broker API, TipTap, כפתורים, צבע Entity, DNA_BUTTON, Design System), **שער ב'**. |
| ⚠️ **חלקי** | **§4.5 Code Evidence** — ✅ נסגר. **§4.7** — ✅ כל הפריטים [x] (כולל החלטת אדריכל: redirect ל־D = ל־Home כמו C). **/profile** — ✅ נסגר (טיפוס C). **משימה 7** — Acceptance תלוי בוולידציה ויזואלית (שער ג'). |
| 🔄 **מתמשך** | Design Fidelity / שער ג' (אישור ויזואלי) — בתהליך; תיקונים ויזואליים מהשטח (למשל Header) ממשיכים לחשוף פערים. |

### 3.3 מטריצת משימות יישום אדריכלית

| סטטוס | תיאור |
|--------|--------|
| ✅ **רוב המשימות** | 20, 40, 50 — כל המשימות הרלוונטיות הושלמו (מלבד T20.4 עתידי). 30 — T30.2–T30.5 הושלמו. |
| ⏳ **פתוח** | T10.1, T10.2, T10.4; T30.1 (Broker ב־D21?), T30.6 (אימות A/B/C/D); T90.1, T90.2. |

### 3.4 משימות עצמיות Team 10 (`TEAM_10_OWN_TASKS_MASTER_CHECKLIST.md`)

| סטטוס | תיאור |
|--------|--------|
| ✅ | MAPPING_MODE, G.1, G.2, מנדטים, עדכון תוכנית לפי ADR-013. |
| 🔄 **מתמשך** | T1 (עדכון תוכנית ומעקב), T3 (ריכוז שאלות לאדריכל), T4 (עדכון Page Tracker/SSOT); T2 — קונטקסט ל־50 לפני כל סבב QA. |
| ⏳ | M5 — דוח עדכון ל־Team 90 **לפני פנייה לאדריכלית** (רק בעת פנייה). |

---

## 4. תיקונים מהתהליך הוויזואלי (פערים שנחשפים)

**מקור ידוע:** `TEAM_30_TO_TEAM_40_HEADER_DESIGN_FIXES_REQUEST.md`

- **Batch 1 Header:** ✅ **נסגר** — מאושר ובבעלות Team 40. תשובה: `TEAM_40_TO_TEAM_10_HEADER_ICON_AND_BATCH1_RESPONSE.md`.
- **כלל — רשימת פערים ויזואליים (S8):** נוצרה רשימה מרכזית — `TEAM_10_VISUAL_GAPS_FINDINGS_LOG.md`. ממצאים שיתגלו מהבדיקה הוויזואלית יירשמו שם עם שיוך ל־30/40.

---

## 5. סיכום — מה נשאר לפני "הכל סגור"

**עדכון אחרון (2026-01-30):** ביצוע משימות Team 10 — רשימה מאוחדת: `TEAM_10_OPEN_TASKS_CONSOLIDATED_LIST.md`; Evidence Log + Work Plan §4.7 + STATE סונכרנו. **תשובות סגירה ויישור קו:** Team 30, 40, 50 אישרו (`TEAM_30_TO_TEAM_10_CLOSE_AND_ALIGN_ACK.md`, `TEAM_40_TO_TEAM_10_CLOSE_AND_ALIGN_RESPONSE.md`, `TEAM_50_TO_TEAM_10_CLOSE_AND_ALIGN_ACKNOWLEDGMENT.md`) — מוכנים לבדיקה ויזואלית בשער ג'.

| קטגוריה | פריטים |
|---------|--------|
| **משימות פתוחות (מטריצה)** | T10.4 (מתמשך); T30.1 (Broker D21 — בוטל כרגע); T30.6 מאומת; T90.1/T90.2 נסגרו (Team 50). T10.1/T10.2 מתועדים. |
| **שלבים / פריטים לא סגורים (תוכנית)** | משימה 7 — וולידציה ויזואלית (שער ג'). §4.7 נסגר (החלטה: redirect ל־D = Home). |
| **תוכניות — חוסרים** | שאלה פתוחה אחת לאדריכל (S9); סטיות ויזואליות שיתגלו — לרישום ב־`TEAM_10_VISUAL_GAPS_FINDINGS_LOG.md`. |
| **תהליך ויזואלי** | Header Batch 1 נסגר; פערים נוספים — רשימה ב־TEAM_10_VISUAL_GAPS_FINDINGS_LOG. |

---

## 6. סבב זנבות vs משימות משמעותיות

- **סבב מהיר (זנבות ופינות קטנות):** `TEAM_10_QUICK_ROUND_TAILS.md` — ✅ **נסגר במלואו** (כל 13 הפריטים Q1–Q13 בוצעו/אושרו; תשובת Team 50: Q12, Q13).
- **משימות משמעותיות (לצד):** `TEAM_10_SIGNIFICANT_TASKS_BACKLOG.md` — Code Evidence (§4.5), Broker D21, A/B/C/D, Header Batch 1, פערים ויזואליים, החלטות אדריכל — לתכנון נפרד.

---

## 7. הפניות

- **מטריצה:** `TEAM_10_ARCHITECT_IMPLEMENTATION_TASK_MATRIX.md`
- **תוכנית מאוחדת:** `TEAM_10_VISUAL_GAPS_WORK_PLAN.md`
- **סדר עבודה:** `TEAM_10_ORDER_OF_WORK_UNTIL_GATE_A.md`
- **משימות Team 10:** `TEAM_10_OWN_TASKS_MASTER_CHECKLIST.md`
- **בקשות Header:** `_COMMUNICATION/team_30/TEAM_30_TO_TEAM_40_HEADER_DESIGN_FIXES_REQUEST.md`
- **תרחישים ויזואליים:** `TEAM_10_VISUAL_TEST_SCENARIOS_GATE_C.md`
- **סבב זנבות:** `TEAM_10_QUICK_ROUND_TAILS.md`
- **Backlog משימות משמעותיות:** `TEAM_10_SIGNIFICANT_TASKS_BACKLOG.md`

---

**Team 10 (The Gateway)**  
**log_entry | STATE_OPEN_TASKS_AND_WORK_PLANS | 2026-02-11**
